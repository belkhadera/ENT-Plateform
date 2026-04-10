import time
from typing import Any

import httpx
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt

from .config import Settings, get_settings


bearer_scheme = HTTPBearer(auto_error=True)

_JWKS_CACHE: dict[str, Any] = {}
_JWKS_CACHE_TTL_SECONDS = 300
_KEYCLOAK_MAX_ATTEMPTS = 10
_KEYCLOAK_RETRY_DELAY_SECONDS = 2
_KEYCLOAK_RETRYABLE_STATUS_CODES = {502, 503, 504}


def _get_with_retry(url: str) -> httpx.Response:
    last_error: Exception | None = None

    for attempt in range(1, _KEYCLOAK_MAX_ATTEMPTS + 1):
        try:
            response = httpx.get(url, timeout=10.0)
        except (httpx.ConnectError, httpx.ReadError, httpx.ReadTimeout, httpx.RemoteProtocolError) as exc:
            last_error = exc
            if attempt == _KEYCLOAK_MAX_ATTEMPTS:
                break
            time.sleep(_KEYCLOAK_RETRY_DELAY_SECONDS)
            continue
        except httpx.HTTPError as exc:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=f"Unable to fetch JWKS from Keycloak: {exc}",
            ) from exc

        if response.status_code in _KEYCLOAK_RETRYABLE_STATUS_CODES and attempt < _KEYCLOAK_MAX_ATTEMPTS:
            time.sleep(_KEYCLOAK_RETRY_DELAY_SECONDS)
            continue

        response.raise_for_status()
        return response

    raise HTTPException(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        detail=f"Unable to fetch JWKS from Keycloak after multiple attempts: {last_error}",
    )


def _get_jwks(settings: Settings) -> dict[str, Any]:
    now = int(time.time())
    cached = _JWKS_CACHE.get("value")
    expires_at = _JWKS_CACHE.get("expires_at", 0)
    if cached and now < expires_at:
        return cached

    response = _get_with_retry(settings.jwks_endpoint)
    jwks = response.json()
    _JWKS_CACHE["value"] = jwks
    _JWKS_CACHE["expires_at"] = now + _JWKS_CACHE_TTL_SECONDS
    return jwks


def decode_access_token(token: str, settings: Settings) -> dict[str, Any]:
    jwks = _get_jwks(settings)
    try:
        unverified_header = jwt.get_unverified_header(token)
    except JWTError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token header.") from exc

    kid = unverified_header.get("kid")
    signing_key = next((key for key in jwks.get("keys", []) if key.get("kid") == kid), None)
    if not signing_key:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Signing key not found for token.")

    try:
        return jwt.decode(
            token,
            signing_key,
            algorithms=["RS256"],
            issuer=settings.issuer,
            options={"verify_aud": False},
        )
    except JWTError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token.") from exc


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    settings: Settings = Depends(get_settings),
) -> dict[str, Any]:
    return decode_access_token(credentials.credentials, settings)


def require_roles(expected_roles: list[str]):
    expected = set(expected_roles)

    def _dependency(claims: dict[str, Any] = Depends(get_current_user)) -> dict[str, Any]:
        roles = set(claims.get("realm_access", {}).get("roles", []))
        if expected.isdisjoint(roles):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Insufficient permissions. Required any of: {sorted(expected)}",
            )
        return claims

    return _dependency
