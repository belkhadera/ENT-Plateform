from typing import Any, Literal

import httpx
from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from .auth import require_roles
from .config import Settings, get_settings


class ChatMessage(BaseModel):
    role: Literal["system", "user", "assistant"]
    content: str = Field(..., min_length=1)


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1)
    history: list[ChatMessage] = Field(default_factory=list)


class ChatResponse(BaseModel):
    reply: str
    model: str
    created_at: str | None = None


app = FastAPI(
    title="ENT Chat Service",
    description="AI chat service backed by Ollama",
    version="1.0.0",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


ROLE_ADMIN = "admin"
ROLE_TEACHER = "teacher"
ROLE_STUDENT = "student"

ROLE_PRIORITY = (ROLE_ADMIN, ROLE_TEACHER, ROLE_STUDENT)
ROLE_ALIASES = {
    ROLE_ADMIN: {"admin"},
    ROLE_TEACHER: {"teacher", "enseignant"},
    ROLE_STUDENT: {"student", "etudiant"},
}

ACADEMIC_IT_KEYWORDS = {
    "algorithm",
    "algorithme",
    "programming",
    "programmation",
    "python",
    "java",
    "javascript",
    "react",
    "database",
    "base de donnees",
    "sql",
    "network",
    "reseau",
    "api",
    "docker",
    "informatique",
}

STUDENT_KEYWORDS = {
    "ent",
    "plateforme",
    "platform",
    "login",
    "connexion",
    "keycloak",
    "auth",
    "compte",
    "account",
    "mot de passe",
    "password",
    "dashboard",
    "cours",
    "course",
    "pdf",
    "telecharg",
    "download",
    "calendar",
    "calendrier",
    "emploi du temps",
} | ACADEMIC_IT_KEYWORDS

TEACHER_KEYWORDS = {
    "ent",
    "plateforme",
    "platform",
    "login",
    "connexion",
    "keycloak",
    "auth",
    "compte",
    "account",
    "mot de passe",
    "password",
    "dashboard",
    "cours",
    "course",
    "upload",
    "depot",
    "publier",
    "publish",
    "pdf",
    "gerer",
    "manage",
    "student list",
    "liste etudiants",
    "calendar",
    "calendrier",
    "emploi du temps",
} | ACADEMIC_IT_KEYWORDS

ADMIN_KEYWORDS = {
    "ent",
    "plateforme",
    "platform",
    "admin",
    "utilisateur",
    "user",
    "keycloak",
    "auth",
    "docker",
    "api",
    "service",
    "configuration",
    "system",
    "monitoring",
}

ROLE_ALLOWED_KEYWORDS = {
    ROLE_STUDENT: STUDENT_KEYWORDS,
    ROLE_TEACHER: TEACHER_KEYWORDS,
    ROLE_ADMIN: ADMIN_KEYWORDS,
}

ROLE_CAN_HELP = {
    ROLE_STUDENT: (
        "accessing courses, downloading PDFs, calendar, dashboard, own account, "
        "Keycloak login, and academic IT topics (algorithms, programming, databases, networks)."
    ),
    ROLE_TEACHER: (
        "uploading PDFs, managing own courses, student lists, calendar, dashboard, own account, "
        "Keycloak login, and academic IT topics (algorithms, programming, databases, networks)."
    ),
    ROLE_ADMIN: (
        "all platform-related topics including user management, system configuration, Keycloak, Docker, "
        "APIs, and all platform features."
    ),
}

ROLE_CANNOT_HELP = {
    ROLE_STUDENT: (
        "uploading courses, managing users, admin/system configuration, or any admin-only operation."
    ),
    ROLE_TEACHER: (
        "global user administration, platform-wide system configuration, or admin-only operations."
    ),
    ROLE_ADMIN: (
        "topics unrelated to the platform or requests that violate security/safety rules."
    ),
}

PUBLIC_LOGIN_KEYWORDS = {
    "ent",
    "plateforme",
    "platform",
    "login",
    "connexion",
    "keycloak",
    "auth",
    "compte",
    "account",
    "mot de passe",
    "password",
    "inscription",
    "register",
    "cours",
    "course",
    "pdf",
    "telecharg",
    "download",
    "calendar",
    "calendrier",
    "emploi du temps",
    "validation",
    "inactif",
    "inactive",
    "dashboard",
    "etudiant",
    "enseignant",
    "admin",
}


def _extract_user_role(claims: dict[str, Any]) -> str:
    roles = {role.lower() for role in claims.get("realm_access", {}).get("roles", [])}
    for canonical_role in ROLE_PRIORITY:
        aliases = ROLE_ALIASES.get(canonical_role, set())
        if not roles.isdisjoint(aliases):
            return canonical_role
    return ROLE_STUDENT


def _is_question_in_scope(question: str, role: str) -> bool:
    normalized = question.lower()
    if role == ROLE_ADMIN:
        return True
    allowed_keywords = ROLE_ALLOWED_KEYWORDS.get(role, STUDENT_KEYWORDS)
    return any(keyword in normalized for keyword in allowed_keywords)


def _limit_reply_words(text: str, max_words: int) -> str:
    words = text.split()
    if len(words) <= max_words:
        return text.strip()
    return " ".join(words[:max_words]).strip() + " ..."


def _out_of_scope_reply(role: str) -> str:
    if role == ROLE_STUDENT:
        return (
            "Je suis limite aux sujets etudiant ENT: cours, telechargement PDF, calendrier, compte, "
            "connexion Keycloak, et questions informatiques academiques. "
            "Je ne peux pas aider sur l'upload de cours ou la gestion des utilisateurs."
        )
    if role == ROLE_TEACHER:
        return (
            "Je suis limite aux sujets enseignant ENT: publication/gestion de cours, listes etudiants, "
            "calendrier, compte, connexion Keycloak, et questions informatiques academiques. "
            "Je ne peux pas aider sur l'administration globale des utilisateurs/systeme."
        )
    return (
        "Je peux aider sur tous les sujets lies a la plateforme ENT (admin, Keycloak, Docker, API, services). "
        "Reformulez votre question dans ce contexte."
    )


def _is_public_login_question_in_scope(question: str) -> bool:
    normalized = question.lower()
    return any(keyword in normalized for keyword in PUBLIC_LOGIN_KEYWORDS)


def _public_out_of_scope_reply() -> str:
    return (
        "Je suis limite a l'aide de connexion/inscription ENT EST Sale (login, compte, validation, "
        "acces aux cours, calendrier). Connectez-vous pour poser des questions academiques detaillees."
    )


def _build_public_login_prompt() -> str:
    return (
        "You are the public login assistant for ENT EST Sale.\n"
        "Context: unauthenticated user on login/register page.\n"
        "YOU CAN ONLY HELP WITH:\n"
        "- login, Keycloak authentication, account activation/validation,\n"
        "- registration workflow,\n"
        "- where to find courses/downloads/calendar after login.\n"
        "YOU CANNOT HELP WITH:\n"
        "- admin operations,\n"
        "- private user data,\n"
        "- unrelated topics (cooking, health, finance, etc).\n"
        "Behavior:\n"
        "- keep answers short and practical (max ~90 words),\n"
        "- if out of scope, refuse briefly and redirect to login/helpdesk."
    )


def _build_system_prompt(claims: dict[str, Any], role: str | None = None) -> str:
    username = claims.get("preferred_username", "user")
    effective_role = role or _extract_user_role(claims)
    roles = ", ".join(claims.get("realm_access", {}).get("roles", []))

    return (
        "You are the AI assistant for ENT EST Sale.\n"
        f"Current user: {username}\n"
        f"Token roles: {roles}\n"
        f"Active role (priority admin > teacher > student): {effective_role}\n\n"
        "YOU CAN ONLY HELP WITH:\n"
        f"- {ROLE_CAN_HELP[effective_role]}\n\n"
        "YOU CANNOT HELP WITH:\n"
        f"- {ROLE_CANNOT_HELP[effective_role]}\n\n"
        "Behavior rules:\n"
        "- If the question is outside the allowed scope for this role, refuse briefly and redirect.\n"
        "- If a feature does not exist, say it clearly.\n"
        "- Keep answers concise: maximum 6 bullet points or about 120 words.\n"
        "- Prefer practical platform steps over generic theory."
    )


@app.get("/health")
def health(settings: Settings = Depends(get_settings)) -> dict[str, str]:
    return {"status": "ok", "service": settings.service_name}


@app.post("/chat", response_model=ChatResponse)
def chat_with_ai(
    payload: ChatRequest,
    claims: dict[str, Any] = Depends(require_roles(["student", "teacher", "admin"])),
    settings: Settings = Depends(get_settings),
) -> ChatResponse:
    user_role = _extract_user_role(claims)
    user_message = payload.message.strip()

    if not _is_question_in_scope(user_message, user_role):
        return ChatResponse(
            reply=_out_of_scope_reply(user_role),
            model="policy-filter",
            created_at=None,
        )

    trimmed_history = payload.history[-settings.chat_max_history_messages :]
    messages = [{"role": "system", "content": _build_system_prompt(claims, user_role)}]
    messages.extend(
        [
            {
                "role": message.role,
                "content": message.content[: settings.chat_max_prompt_chars],
            }
            for message in trimmed_history
        ]
    )
    messages.append({"role": "user", "content": user_message[: settings.chat_max_prompt_chars]})

    request_payload = {
        "model": settings.ollama_model,
        "stream": False,
        "keep_alive": settings.ollama_keep_alive,
        "messages": messages,
        "options": {
            "temperature": settings.ollama_temperature,
            "top_p": settings.ollama_top_p,
            "repeat_penalty": settings.ollama_repeat_penalty,
            "num_ctx": settings.ollama_num_ctx,
            "num_predict": settings.ollama_max_tokens,
        },
    }

    try:
        response = httpx.post(settings.ollama_chat_endpoint, json=request_payload, timeout=settings.ollama_timeout_seconds)
        response.raise_for_status()
    except httpx.HTTPError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Unable to reach Ollama chat endpoint: {exc}",
        ) from exc

    data = response.json()
    assistant_message = data.get("message", {}).get("content")
    if not assistant_message:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Ollama response did not contain assistant content.",
        )

    return ChatResponse(
        reply=_limit_reply_words(assistant_message, settings.chat_max_reply_words),
        model=data.get("model", settings.ollama_model),
        created_at=data.get("created_at"),
    )


@app.post("/chat/public", response_model=ChatResponse)
def chat_public_login(
    payload: ChatRequest,
    settings: Settings = Depends(get_settings),
) -> ChatResponse:
    user_message = payload.message.strip()

    if not _is_public_login_question_in_scope(user_message):
        return ChatResponse(
            reply=_public_out_of_scope_reply(),
            model="policy-filter-public",
            created_at=None,
        )

    trimmed_history = payload.history[-settings.chat_max_history_messages :]
    messages = [{"role": "system", "content": _build_public_login_prompt()}]
    messages.extend(
        [
            {
                "role": message.role,
                "content": message.content[: settings.chat_max_prompt_chars],
            }
            for message in trimmed_history
            if message.role in {"user", "assistant"}
        ]
    )
    messages.append({"role": "user", "content": user_message[: settings.chat_max_prompt_chars]})

    request_payload = {
        "model": settings.ollama_model,
        "stream": False,
        "keep_alive": settings.ollama_keep_alive,
        "messages": messages,
        "options": {
            "temperature": min(settings.ollama_temperature, 0.2),
            "top_p": settings.ollama_top_p,
            "repeat_penalty": settings.ollama_repeat_penalty,
            "num_ctx": settings.ollama_num_ctx,
            "num_predict": min(settings.ollama_max_tokens, 140),
        },
    }

    try:
        response = httpx.post(settings.ollama_chat_endpoint, json=request_payload, timeout=settings.ollama_timeout_seconds)
        response.raise_for_status()
    except httpx.HTTPError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Unable to reach Ollama chat endpoint: {exc}",
        ) from exc

    data = response.json()
    assistant_message = data.get("message", {}).get("content")
    if not assistant_message:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Ollama response did not contain assistant content.",
        )

    return ChatResponse(
        reply=_limit_reply_words(assistant_message, min(settings.chat_max_reply_words, 90)),
        model=data.get("model", settings.ollama_model),
        created_at=data.get("created_at"),
    )
