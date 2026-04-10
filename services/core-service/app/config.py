import os
from dataclasses import dataclass
from functools import lru_cache


@dataclass(frozen=True)
class Settings:
    service_name: str = os.getenv("SERVICE_NAME", "core-service")
    service_port: int = int(os.getenv("SERVICE_PORT", "8000"))
    keycloak_url: str = os.getenv("KEYCLOAK_URL", "http://localhost:8080")
    keycloak_realm: str = os.getenv("KEYCLOAK_REALM", "ent-est-sale")
    keycloak_client_id: str = os.getenv("KEYCLOAK_CLIENT_ID", "ent-backend")
    keycloak_client_secret: str = os.getenv("KEYCLOAK_CLIENT_SECRET", "ent-backend-secret")

    @property
    def issuer(self) -> str:
        return f"{self.keycloak_url}/realms/{self.keycloak_realm}"

    @property
    def token_endpoint(self) -> str:
        return f"{self.issuer}/protocol/openid-connect/token"

    @property
    def jwks_endpoint(self) -> str:
        return f"{self.issuer}/protocol/openid-connect/certs"


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()
