from typing import Any

import httpx
from fastapi import HTTPException, status

from .config import Settings

MANAGED_REALM_ROLES = {"student", "teacher", "admin"}


def _extract_error(response: httpx.Response) -> Any:
    try:
        return response.json()
    except ValueError:
        return {"error": response.text}


def get_admin_access_token(settings: Settings) -> str:
    form_data = {
        "grant_type": "password",
        "client_id": settings.keycloak_admin_client_id,
        "username": settings.keycloak_admin_username,
        "password": settings.keycloak_admin_password,
    }
    if settings.keycloak_admin_client_secret:
        form_data["client_secret"] = settings.keycloak_admin_client_secret

    try:
        response = httpx.post(settings.token_endpoint, data=form_data, timeout=10.0)
    except httpx.HTTPError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Unable to reach Keycloak admin token endpoint: {exc}",
        ) from exc

    if response.status_code >= 400:
        raise HTTPException(status_code=response.status_code, detail=_extract_error(response))

    payload = response.json()
    return payload["access_token"]


def _admin_headers(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}


def _request(
    method: str,
    url: str,
    admin_token: str,
    *,
    params: dict[str, Any] | None = None,
    json: dict[str, Any] | list[dict[str, Any]] | None = None,
) -> httpx.Response:
    try:
        response = httpx.request(
            method,
            url,
            headers=_admin_headers(admin_token),
            params=params,
            json=json,
            timeout=15.0,
        )
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc)) from exc

    if response.status_code >= 400:
        raise HTTPException(status_code=response.status_code, detail=_extract_error(response))
    return response


def find_user_id(username: str, admin_token: str, settings: Settings) -> str | None:
    url = f"{settings.admin_base_url}/users"
    response = _request("GET", url, admin_token, params={"username": username})
    users = response.json()
    for user in users:
        if user.get("username") == username:
            return user.get("id")
    return None


def _get_role_representation(role_name: str, admin_token: str, settings: Settings) -> dict[str, Any]:
    role_url = f"{settings.admin_base_url}/roles/{role_name}"
    response = _request("GET", role_url, admin_token)
    return response.json()


def get_user_realm_roles(user_id: str, admin_token: str, settings: Settings) -> list[dict[str, Any]]:
    url = f"{settings.admin_base_url}/users/{user_id}/role-mappings/realm"
    response = _request("GET", url, admin_token)
    return response.json()


def _managed_roles(roles: list[dict[str, Any]]) -> list[dict[str, Any]]:
    return [role for role in roles if role.get("name") in MANAGED_REALM_ROLES]


def _clear_realm_roles(user_id: str, roles: list[dict[str, Any]], admin_token: str, settings: Settings) -> None:
    if not roles:
        return

    url = f"{settings.admin_base_url}/users/{user_id}/role-mappings/realm"
    _request("DELETE", url, admin_token, json=roles)


def create_user(
    username: str,
    email: str,
    password: str,
    roles: list[str],
    first_name: str,
    last_name: str,
    enabled: bool,
    admin_token: str,
    settings: Settings,
) -> dict[str, Any]:
    create_url = f"{settings.admin_base_url}/users"
    user_payload = {
        "username": username,
        "email": email,
        "firstName": first_name,
        "lastName": last_name,
        "enabled": enabled,
        "emailVerified": True,
        "credentials": [{"type": "password", "value": password, "temporary": False}],
    }

    try:
        response = httpx.post(create_url, headers=_admin_headers(admin_token), json=user_payload, timeout=15.0)
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc)) from exc
    if response.status_code == 409:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="User already exists.")
    if response.status_code >= 400:
        raise HTTPException(status_code=response.status_code, detail=_extract_error(response))

    user_id = find_user_id(username, admin_token, settings)
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="User was created but could not be retrieved from Keycloak.",
        )

    if roles:
        assign_realm_roles(user_id, roles, admin_token, settings)

    return {
        "user_id": user_id,
        "username": username,
        "email": email,
        "first_name": first_name,
        "last_name": last_name,
        "enabled": enabled,
        "roles": roles,
    }


def assign_realm_roles(user_id: str, roles: list[str], admin_token: str, settings: Settings) -> None:
    role_representations = [_get_role_representation(role_name, admin_token, settings) for role_name in roles]

    map_url = f"{settings.admin_base_url}/users/{user_id}/role-mappings/realm"
    try:
        map_resp = httpx.post(map_url, headers=_admin_headers(admin_token), json=role_representations, timeout=15.0)
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc)) from exc

    if map_resp.status_code >= 400:
        raise HTTPException(status_code=map_resp.status_code, detail=_extract_error(map_resp))


def list_users(admin_token: str, settings: Settings) -> list[dict[str, Any]]:
    url = f"{settings.admin_base_url}/users"
    response = _request("GET", url, admin_token, params={"max": 200})
    users = response.json()
    result: list[dict[str, Any]] = []

    for user in users:
        roles = _managed_roles(get_user_realm_roles(user["id"], admin_token, settings))
        result.append(
            {
                "user_id": user.get("id"),
                "username": user.get("username"),
                "email": user.get("email"),
                "first_name": user.get("firstName", ""),
                "last_name": user.get("lastName", ""),
                "enabled": bool(user.get("enabled", False)),
                "email_verified": bool(user.get("emailVerified", False)),
                "created_timestamp": user.get("createdTimestamp"),
                "roles": [role.get("name") for role in roles if role.get("name")],
            }
        )

    return result


def update_user(
    user_id: str,
    username: str,
    email: str,
    first_name: str,
    last_name: str,
    enabled: bool,
    roles: list[str],
    admin_token: str,
    settings: Settings,
) -> dict[str, Any]:
    url = f"{settings.admin_base_url}/users/{user_id}"
    payload = {
        "username": username,
        "email": email,
        "firstName": first_name,
        "lastName": last_name,
        "enabled": enabled,
        "emailVerified": True,
    }
    _request("PUT", url, admin_token, json=payload)

    current_roles = _managed_roles(get_user_realm_roles(user_id, admin_token, settings))
    _clear_realm_roles(user_id, current_roles, admin_token, settings)
    if roles:
        assign_realm_roles(user_id, roles, admin_token, settings)

    return {
        "user_id": user_id,
        "username": username,
        "email": email,
        "first_name": first_name,
        "last_name": last_name,
        "enabled": enabled,
        "roles": roles,
    }


def delete_user(user_id: str, admin_token: str, settings: Settings) -> None:
    url = f"{settings.admin_base_url}/users/{user_id}"
    _request("DELETE", url, admin_token)


def reset_user_password(user_id: str, password: str, admin_token: str, settings: Settings) -> None:
    url = f"{settings.admin_base_url}/users/{user_id}/reset-password"
    payload = {"type": "password", "value": password, "temporary": False}
    _request("PUT", url, admin_token, json=payload)
