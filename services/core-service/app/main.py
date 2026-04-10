import os
import time
from typing import Any

import httpx
from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from .auth import get_current_user
from .config import Settings, get_settings


app = FastAPI(
    title="ENT Core Service",
    description="Authentication gateway for ENT microservices",
    version="1.0.0",
)
cors_allow_origins = [origin.strip() for origin in os.getenv("CORS_ALLOW_ORIGINS", "*").split(",") if origin.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_allow_origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


class TokenRequest(BaseModel):
    username: str = Field(..., min_length=3)
    password: str = Field(..., min_length=3)


class RefreshTokenRequest(BaseModel):
    refresh_token: str = Field(..., min_length=10)


KEYCLOAK_RETRYABLE_STATUS_CODES = {502, 503, 504}
KEYCLOAK_MAX_ATTEMPTS = 10
KEYCLOAK_RETRY_DELAY_SECONDS = 2


def _extract_error_payload(response: httpx.Response) -> Any:
    try:
        return response.json()
    except ValueError:
        return {"error": response.text}


def _post_to_keycloak_with_retry(url: str, form_data: dict[str, Any]) -> httpx.Response:
    last_error: Exception | None = None

    for attempt in range(1, KEYCLOAK_MAX_ATTEMPTS + 1):
        try:
            response = httpx.post(url, data=form_data, timeout=10.0)
        except (httpx.ConnectError, httpx.ReadError, httpx.ReadTimeout, httpx.RemoteProtocolError) as exc:
            last_error = exc
            if attempt == KEYCLOAK_MAX_ATTEMPTS:
                break
            time.sleep(KEYCLOAK_RETRY_DELAY_SECONDS)
            continue
        except httpx.HTTPError as exc:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=f"Unable to reach Keycloak token endpoint: {exc}",
            ) from exc

        if response.status_code in KEYCLOAK_RETRYABLE_STATUS_CODES and attempt < KEYCLOAK_MAX_ATTEMPTS:
            time.sleep(KEYCLOAK_RETRY_DELAY_SECONDS)
            continue

        return response

    raise HTTPException(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        detail=(
            "Unable to reach Keycloak token endpoint after multiple attempts. "
            f"Keycloak may still be starting: {last_error}"
        ),
    )


@app.get("/health")
def health(settings: Settings = Depends(get_settings)) -> dict[str, str]:
    return {"status": "ok", "service": settings.service_name}


@app.post("/auth/token")
def login(payload: TokenRequest, settings: Settings = Depends(get_settings)) -> dict[str, Any]:
    form_data = {
        "grant_type": "password",
        "client_id": settings.keycloak_client_id,
        "client_secret": settings.keycloak_client_secret,
        "username": payload.username,
        "password": payload.password,
    }
    response = _post_to_keycloak_with_retry(settings.token_endpoint, form_data)
    if response.status_code >= 400:
        raise HTTPException(status_code=response.status_code, detail=_extract_error_payload(response))
    return response.json()


@app.post("/auth/refresh")
def refresh_token(payload: RefreshTokenRequest, settings: Settings = Depends(get_settings)) -> dict[str, Any]:
    form_data = {
        "grant_type": "refresh_token",
        "client_id": settings.keycloak_client_id,
        "client_secret": settings.keycloak_client_secret,
        "refresh_token": payload.refresh_token,
    }
    response = _post_to_keycloak_with_retry(settings.token_endpoint, form_data)
    if response.status_code >= 400:
        raise HTTPException(status_code=response.status_code, detail=_extract_error_payload(response))
    return response.json()


@app.get("/auth/me")
def me(claims: dict[str, Any] = Depends(get_current_user)) -> dict[str, Any]:
    return {
        "username": claims.get("preferred_username"),
        "email": claims.get("email"),
        "roles": claims.get("realm_access", {}).get("roles", []),
        "claims": claims,
    }
