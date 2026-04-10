import os
from dataclasses import dataclass
from functools import lru_cache


@dataclass(frozen=True)
class Settings:
    service_name: str = os.getenv("SERVICE_NAME", "chat-service")
    service_port: int = int(os.getenv("SERVICE_PORT", "8000"))
    keycloak_url: str = os.getenv("KEYCLOAK_URL", "http://localhost:8080")
    keycloak_realm: str = os.getenv("KEYCLOAK_REALM", "ent-est-sale")
    ollama_url: str = os.getenv("OLLAMA_URL", "http://localhost:11434")
    ollama_model: str = os.getenv("OLLAMA_MODEL", "llama3.2")
    ollama_temperature: float = float(os.getenv("OLLAMA_TEMPERATURE", "0.3"))
    ollama_top_p: float = float(os.getenv("OLLAMA_TOP_P", "0.85"))
    ollama_repeat_penalty: float = float(os.getenv("OLLAMA_REPEAT_PENALTY", "1.1"))
    ollama_num_ctx: int = int(os.getenv("OLLAMA_NUM_CTX", "2048"))
    ollama_max_tokens: int = int(os.getenv("OLLAMA_MAX_TOKENS", "180"))
    ollama_timeout_seconds: float = float(os.getenv("OLLAMA_TIMEOUT_SECONDS", "300"))
    ollama_keep_alive: str = os.getenv("OLLAMA_KEEP_ALIVE", "30m")
    chat_max_history_messages: int = int(os.getenv("CHAT_MAX_HISTORY_MESSAGES", "4"))
    chat_max_prompt_chars: int = int(os.getenv("CHAT_MAX_PROMPT_CHARS", "1200"))
    chat_max_reply_words: int = int(os.getenv("CHAT_MAX_REPLY_WORDS", "140"))

    @property
    def issuer(self) -> str:
        return f"{self.keycloak_url}/realms/{self.keycloak_realm}"

    @property
    def jwks_endpoint(self) -> str:
        return f"{self.issuer}/protocol/openid-connect/certs"

    @property
    def ollama_chat_endpoint(self) -> str:
        return f"{self.ollama_url}/api/chat"


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()
