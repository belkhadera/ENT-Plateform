from minio import Minio

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
    return _minio_client
