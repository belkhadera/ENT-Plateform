import os
from datetime import timedelta
from typing import Any
from uuid import UUID

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from minio.error import S3Error
from pydantic import BaseModel

from .auth import require_roles
from .cassandra_client import get_cassandra_session, get_course_by_id, list_courses
from .config import Settings, get_settings
from .minio_client import get_minio_client


app = FastAPI(
    title="ENT Download Service",
    description="Course listing and secure file download links",
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


class DownloadUrlResponse(BaseModel):
    course_id: str
    title: str
    original_filename: str
    download_url: str
    expires_in_seconds: int


@app.get("/health")
def health(settings: Settings = Depends(get_settings)) -> dict[str, str]:
    return {"status": "ok", "service": settings.service_name}


@app.get("/courses")
def get_courses(
    _claims: dict[str, Any] = Depends(require_roles(["student", "teacher", "admin"])),
    settings: Settings = Depends(get_settings),
) -> list[dict[str, Any]]:
    session = get_cassandra_session(settings)
    return list_courses(session)


@app.get("/courses/{course_id}/download-url", response_model=DownloadUrlResponse)
def get_download_url(
    course_id: str,
    _claims: dict[str, Any] = Depends(require_roles(["student", "teacher", "admin"])),
    settings: Settings = Depends(get_settings),
) -> DownloadUrlResponse:
    try:
        course_uuid = UUID(course_id)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid course_id format.") from exc

    session = get_cassandra_session(settings)
    course = get_course_by_id(session, course_uuid)
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found.")

    minio_client = get_minio_client(settings)
    try:
        url = minio_client.presigned_get_object(
            settings.minio_bucket,
            course["object_key"],
            expires=timedelta(seconds=settings.presigned_url_expires_seconds),
        )
    except S3Error as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Unable to generate MinIO presigned URL: {exc}",
        ) from exc

    return DownloadUrlResponse(
        course_id=course["course_id"],
        title=course["title"],
        original_filename=course["original_filename"],
        download_url=url,
        expires_in_seconds=settings.presigned_url_expires_seconds,
    )


@app.get("/courses/{course_id}/download")
def download_course(
    course_id: str,
    _claims: dict[str, Any] = Depends(require_roles(["student", "teacher", "admin"])),
    settings: Settings = Depends(get_settings),
) -> StreamingResponse:
    try:
        course_uuid = UUID(course_id)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid course_id format.") from exc

    session = get_cassandra_session(settings)
    course = get_course_by_id(session, course_uuid)
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found.")

    minio_client = get_minio_client(settings)
    try:
        obj = minio_client.get_object(settings.minio_bucket, course["object_key"])
    except S3Error as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Unable to fetch object from MinIO: {exc}",
        ) from exc

    def file_iterator():
        try:
            for chunk in obj.stream(32 * 1024):
                yield chunk
        finally:
            obj.close()
            obj.release_conn()

    headers = {
        "Content-Disposition": f'attachment; filename="{course["original_filename"]}"',
    }
    return StreamingResponse(
        file_iterator(),
        media_type=course["content_type"] or "application/octet-stream",
        headers=headers,
    )
