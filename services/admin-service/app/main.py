import os
import re
from typing import Any

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, field_validator

from .auth import require_roles
from .cassandra_client import get_cassandra_session, list_courses_metadata
from .config import Settings, get_settings
from .keycloak_admin import (
    assign_realm_roles,
    create_user,
    delete_user,
    find_user_id,
    get_admin_access_token,
    list_users,
    reset_user_password,
    update_user,
)


app = FastAPI(
    title="ENT Admin Service",
    description="Admin APIs for users, roles and metadata inspection",
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

EMAIL_PATTERN = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def _normalize_email(value: str) -> str:
    normalized = value.strip().lower()
    if not EMAIL_PATTERN.fullmatch(normalized):
        raise ValueError("value is not a valid email address.")
    return normalized


class CreateUserRequest(BaseModel):
    username: str = Field(..., min_length=3)
    email: str
    password: str = Field(..., min_length=6)
    first_name: str = ""
    last_name: str = ""
    roles: list[str] = Field(default_factory=list)
    enabled: bool = True

    @field_validator("email")
    @classmethod
    def validate_email(cls, value: str) -> str:
        return _normalize_email(value)


class AssignRolesRequest(BaseModel):
    roles: list[str] = Field(..., min_length=1)


class UpdateUserRequest(BaseModel):
    username: str = Field(..., min_length=3)
    email: str
    first_name: str = ""
    last_name: str = ""
    enabled: bool = True
    roles: list[str] = Field(default_factory=list)

    @field_validator("email")
    @classmethod
    def validate_email(cls, value: str) -> str:
        return _normalize_email(value)


class RegisterRequest(BaseModel):
    username: str = Field(..., min_length=3)
    email: str
    password: str = Field(..., min_length=6)
    first_name: str = Field(..., min_length=1)
    last_name: str = Field(..., min_length=1)

    @field_validator("email")
    @classmethod
    def validate_email(cls, value: str) -> str:
        return _normalize_email(value)


class ResetPasswordRequest(BaseModel):
    password: str = Field(..., min_length=6)


@app.get("/health")
def health(settings: Settings = Depends(get_settings)) -> dict[str, str]:
    return {"status": "ok", "service": settings.service_name}


@app.post("/users", status_code=status.HTTP_201_CREATED)
def create_keycloak_user(
    payload: CreateUserRequest,
    _claims: dict[str, Any] = Depends(require_roles(["admin"])),
    settings: Settings = Depends(get_settings),
) -> dict[str, Any]:
    admin_token = get_admin_access_token(settings)
    return create_user(
        username=payload.username,
        email=str(payload.email),
        password=payload.password,
        first_name=payload.first_name,
        last_name=payload.last_name,
        roles=payload.roles,
        enabled=payload.enabled,
        admin_token=admin_token,
        settings=settings,
    )


@app.get("/users")
def get_keycloak_users(
    _claims: dict[str, Any] = Depends(require_roles(["admin"])),
    settings: Settings = Depends(get_settings),
) -> list[dict[str, Any]]:
    admin_token = get_admin_access_token(settings)
    return list_users(admin_token=admin_token, settings=settings)


@app.put("/users/{user_id}")
def update_keycloak_user(
    user_id: str,
    payload: UpdateUserRequest,
    _claims: dict[str, Any] = Depends(require_roles(["admin"])),
    settings: Settings = Depends(get_settings),
) -> dict[str, Any]:
    admin_token = get_admin_access_token(settings)
    return update_user(
        user_id=user_id,
        username=payload.username,
        email=str(payload.email),
        first_name=payload.first_name,
        last_name=payload.last_name,
        enabled=payload.enabled,
        roles=payload.roles,
        admin_token=admin_token,
        settings=settings,
    )


@app.post("/register", status_code=status.HTTP_201_CREATED)
def register_pending_user(
    payload: RegisterRequest,
    settings: Settings = Depends(get_settings),
) -> dict[str, Any]:
    admin_token = get_admin_access_token(settings)
    created_user = create_user(
        username=payload.username,
        email=payload.email,
        password=payload.password,
        first_name=payload.first_name,
        last_name=payload.last_name,
        roles=["student"],
        enabled=False,
        admin_token=admin_token,
        settings=settings,
    )
    return {
        "message": "Registration submitted successfully. Your account is pending administrator approval.",
        **created_user,
    }


@app.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_keycloak_user(
    user_id: str,
    _claims: dict[str, Any] = Depends(require_roles(["admin"])),
    settings: Settings = Depends(get_settings),
) -> None:
    admin_token = get_admin_access_token(settings)
    delete_user(user_id=user_id, admin_token=admin_token, settings=settings)


@app.put("/users/{user_id}/password")
def reset_keycloak_user_password(
    user_id: str,
    payload: ResetPasswordRequest,
    _claims: dict[str, Any] = Depends(require_roles(["admin"])),
    settings: Settings = Depends(get_settings),
) -> dict[str, str]:
    admin_token = get_admin_access_token(settings)
    reset_user_password(user_id=user_id, password=payload.password, admin_token=admin_token, settings=settings)
    return {"message": "Password reset successfully."}


@app.post("/users/{username}/roles")
def assign_roles_to_user(
    username: str,
    payload: AssignRolesRequest,
    _claims: dict[str, Any] = Depends(require_roles(["admin"])),
    settings: Settings = Depends(get_settings),
) -> dict[str, Any]:
    admin_token = get_admin_access_token(settings)
    user_id = find_user_id(username, admin_token, settings)
    if not user_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    assign_realm_roles(user_id=user_id, roles=payload.roles, admin_token=admin_token, settings=settings)
    return {"message": "Roles assigned successfully.", "username": username, "roles": payload.roles}


@app.get("/courses")
def get_all_courses_metadata(
    _claims: dict[str, Any] = Depends(require_roles(["admin"])),
    settings: Settings = Depends(get_settings),
) -> list[dict[str, Any]]:
    session = get_cassandra_session(settings)
    return list_courses_metadata(session)
