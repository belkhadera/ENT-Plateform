from minio import Minio
from minio.error import S3Error

from .config import Settings


_minio_client: Minio | None = None


def get_minio_client(settings: Settings) -> Minio:
    global _minio_client
    if _minio_client is not None:
        return _minio_client

    _minio_client = Minio(
        endpoint=settings.minio_endpoint,
        access_key=settings.minio_access_key,
        secret_key=settings.minio_secret_key,
        secure=settings.minio_secure,
    )
    if not _minio_client.bucket_exists(settings.minio_bucket):
        _minio_client.make_bucket(settings.minio_bucket)
    return _minio_client


def ensure_bucket(client: Minio, bucket: str) -> None:
    try:
        if not client.bucket_exists(bucket):
            client.make_bucket(bucket)
    except S3Error as exc:
        raise RuntimeError(f"MinIO bucket initialization failed: {exc}") from exc
