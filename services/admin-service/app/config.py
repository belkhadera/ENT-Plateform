import os
from dataclasses import dataclass
from functools import lru_cache


@dataclass(frozen=True)
class Settings:
    service_name: str = os.getenv("SERVICE_NAME", "admin-service")
    service_port: int = int(os.getenv("SERVICE_PORT", "8000"))
    keycloak_url: str = os.getenv("KEYCLOAK_URL", "http://localhost:8080")
    keycloak_realm: str = os.getenv("KEYCLOAK_REALM", "ent-est-sale")
    keycloak_admin_client_id: str = os.getenv("KEYCLOAK_ADMIN_CLIENT_ID", "admin-cli")
    keycloak_admin_client_secret: str = os.getenv("KEYCLOAK_ADMIN_CLIENT_SECRET", "")
    keycloak_admin_realm: str = os.getenv("KEYCLOAK_ADMIN_REALM", "master")
    keycloak_admin_username: str = os.getenv("KEYCLOAK_ADMIN_USERNAME", "admin")
    keycloak_admin_password: str = os.getenv("KEYCLOAK_ADMIN_PASSWORD", "admin123")
    cassandra_host: str = os.getenv("CASSANDRA_HOST", "localhost")
    cassandra_port: int = int(os.getenv("CASSANDRA_PORT", "9042"))
    cassandra_keyspace: str = os.getenv("CASSANDRA_KEYSPACE", "ent")

    @property
    def issuer(self) -> str:
        return f"{self.keycloak_url}/realms/{self.keycloak_realm}"

    @property
    def jwks_endpoint(self) -> str:
        return f"{self.issuer}/protocol/openid-connect/certs"

    @property
    def token_endpoint(self) -> str:
        return f"{self.keycloak_url}/realms/{self.keycloak_admin_realm}/protocol/openid-connect/token"

    @property
    def admin_base_url(self) -> str:
        return f"{self.keycloak_url}/admin/realms/{self.keycloak_realm}"


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()
