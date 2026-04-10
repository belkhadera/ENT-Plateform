import os
import io
import base64
import re
from typing import Any
from uuid import UUID, uuid4

from fastapi import Depends, FastAPI, File, Form, HTTPException, UploadFile, status
from fastapi.middleware.cors import CORSMiddleware
from minio.error import S3Error
from pydantic import BaseModel

from .auth import require_roles
from .cassandra_client import delete_course, get_cassandra_session, get_course_by_id, insert_course
from .config import Settings, get_settings
from .minio_client import ensure_bucket, get_minio_client


app = FastAPI(
    title="ENT Upload Service",
    description="Upload and metadata registration for courses",
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


class UploadResponse(BaseModel):
    course_id: str
    title: str
    description: str
    level: str
    semester: str
    subject: str
    tags: list[str]
    object_key: str
    original_filename: str
    content_type: str
    file_size: int
    teacher_username: str
    cover_image_data_url: str | None = None


class DeleteCourseResponse(BaseModel):
    course_id: str
    message: str


ALLOWED_LEVELS = {"S1", "S2", "S3", "S4", "S5", "S6"}
SEMESTER_ALIASES = {
    "AUTOMNE": "Automne",
    "FALL": "Automne",
    "AUTUMN": "Automne",
    "PRINTEMPS": "Printemps",
    "SPRING": "Printemps",
}
ALLOWED_IMAGE_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
MAX_COURSE_FILE_SIZE = 10 * 1024 * 1024
MAX_COVER_IMAGE_SIZE = 5 * 1024 * 1024


def _sanitize_filename(name: str) -> str:
    cleaned = re.sub(r"[^a-zA-Z0-9._-]", "_", name)
    return cleaned[:120] or "file.bin"


def _normalize_level(value: str) -> str:
    normalized = value.strip().upper()
    if normalized not in ALLOWED_LEVELS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid level. Allowed values: {sorted(ALLOWED_LEVELS)}",
        )
    return normalized


def _normalize_semester(value: str) -> str:
    normalized = value.strip().upper()
    mapped = SEMESTER_ALIASES.get(normalized)
    if mapped is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid semester. Allowed values: {sorted(set(SEMESTER_ALIASES.values()))}",
        )
    return mapped


def _normalize_subject(value: str) -> str:
    normalized = re.sub(r"\s+", " ", value).strip()
    if not normalized:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Subject is required.")
    return normalized[:120]


def _parse_tags(value: str) -> list[str]:
    if not value.strip():
        return []

    parsed_tags: list[str] = []
    seen: set[str] = set()
    for item in value.split(","):
        normalized = re.sub(r"\s+", " ", item).strip()
        if not normalized:
            continue

        normalized = normalized[:40]
        tag_key = normalized.casefold()
        if tag_key in seen:
            continue

        seen.add(tag_key)
        parsed_tags.append(normalized)
        if len(parsed_tags) >= 8:
            break

    return parsed_tags


def _resolve_level_and_semester(level: str, semester: str) -> tuple[str, str]:
    raw_level = level.strip()
    raw_semester = semester.strip()

    if not raw_level and raw_semester.upper() in ALLOWED_LEVELS:
        raw_level = raw_semester
        raw_semester = "Automne"

    return _normalize_level(raw_level), _normalize_semester(raw_semester or "Automne")


def _read_cover_image_data_url(cover_image: UploadFile | None) -> str | None:
    if cover_image is None:
        return None

    payload = cover_image.file.read()
    if not payload:
        return None

    content_type = cover_image.content_type or ""
    if content_type not in ALLOWED_IMAGE_CONTENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cover image must be a JPG, PNG, GIF or WEBP file.",
        )

    if len(payload) > MAX_COVER_IMAGE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cover image must not exceed 5 MB.",
        )

    encoded = base64.b64encode(payload).decode("ascii")
    return f"data:{content_type};base64,{encoded}"


@app.get("/health")
def health(settings: Settings = Depends(get_settings)) -> dict[str, str]:
    return {"status": "ok", "service": settings.service_name}


@app.post("/courses", response_model=UploadResponse, status_code=status.HTTP_201_CREATED)
def create_course(
    title: str = Form(..., min_length=3),
    description: str = Form(default=""),
    level: str = Form(default=""),
    semester: str = Form(default="Automne"),
    subject: str = Form(default=""),
    tags: str = Form(default=""),
    file: UploadFile = File(...),
    cover_image: UploadFile | None = File(default=None),
    claims: dict[str, Any] = Depends(require_roles(["teacher", "admin"])),
    settings: Settings = Depends(get_settings),
) -> UploadResponse:
    teacher_username = claims.get("preferred_username", "unknown")
    normalized_level, normalized_semester = _resolve_level_and_semester(level, semester)
    normalized_subject = _normalize_subject(subject)
    parsed_tags = _parse_tags(tags)

    payload = file.file.read()
    if not payload:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Uploaded file is empty.")
    if len(payload) > MAX_COURSE_FILE_SIZE:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Course file must not exceed 10 MB.")
    if (file.content_type or "").lower() not in {"application/pdf", "application/x-pdf"}:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only PDF course files are accepted.")

    cover_image_data_url = _read_cover_image_data_url(cover_image)

    course_id = uuid4()
    safe_name = _sanitize_filename(file.filename or "file.bin")
    object_key = f"{course_id}-{safe_name}"
    content_type = file.content_type or "application/octet-stream"

    minio_client = get_minio_client(settings)
    ensure_bucket(minio_client, settings.minio_bucket)

    try:
        minio_client.put_object(
            bucket_name=settings.minio_bucket,
            object_name=object_key,
            data=io.BytesIO(payload),
            length=len(payload),
            content_type=content_type,
        )
    except S3Error as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"MinIO upload failed: {exc}",
        ) from exc

    session = get_cassandra_session(settings)
    insert_course(
        session=session,
        course_id=course_id,
        title=title,
        description=description,
        level=normalized_level,
        semester=normalized_semester,
        subject=normalized_subject,
        tags=parsed_tags,
        cover_image_data_url=cover_image_data_url,
        object_key=object_key,
        original_filename=file.filename or safe_name,
        content_type=content_type,
        file_size=len(payload),
        teacher_username=teacher_username,
    )

    return UploadResponse(
        course_id=str(course_id),
        title=title,
        description=description,
        level=normalized_level,
        semester=normalized_semester,
        subject=normalized_subject,
        tags=parsed_tags,
        object_key=object_key,
        original_filename=file.filename or safe_name,
        content_type=content_type,
        file_size=len(payload),
        teacher_username=teacher_username,
        cover_image_data_url=cover_image_data_url,
    )


@app.delete("/courses/{course_id}", response_model=DeleteCourseResponse)
def remove_course(
    course_id: str,
    claims: dict[str, Any] = Depends(require_roles(["teacher", "admin"])),
    settings: Settings = Depends(get_settings),
) -> DeleteCourseResponse:
    try:
        course_uuid = UUID(course_id)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid course_id format.") from exc

    session = get_cassandra_session(settings)
    course = get_course_by_id(session, course_uuid)
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found.")

    requester_username = claims.get("preferred_username", "unknown")
    requester_roles = set(claims.get("realm_access", {}).get("roles", []))
    is_admin = "admin" in requester_roles

    if not is_admin and course.get("teacher_username") != requester_username:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete courses that you uploaded.",
        )

    minio_client = get_minio_client(settings)
    try:
        minio_client.remove_object(settings.minio_bucket, str(course["object_key"]))
    except S3Error as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Unable to delete course file from MinIO: {exc}",
        ) from exc

    delete_course(session, course_uuid)
    return DeleteCourseResponse(course_id=course_id, message="Course deleted successfully.")
