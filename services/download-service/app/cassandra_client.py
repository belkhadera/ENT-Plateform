from typing import Any
from uuid import UUID

from cassandra.cluster import Cluster, Session

from .config import Settings


_cluster: Cluster | None = None
_session: Session | None = None


def _ensure_courses_schema(session: Session) -> None:
    session.execute(
        """
        CREATE TABLE IF NOT EXISTS courses (
            course_id uuid PRIMARY KEY,
            title text,
            description text,
            level text,
            semester text,
            subject text,
            tags list<text>,
            cover_image_data_url text,
            object_key text,
            original_filename text,
            content_type text,
            file_size bigint,
            teacher_username text,
            created_at timestamp
        )
        """
    )

    for column_name, column_type in (
        ("level", "text"),
        ("semester", "text"),
        ("subject", "text"),
        ("tags", "list<text>"),
        ("cover_image_data_url", "text"),
    ):
        try:
            session.execute(f"ALTER TABLE courses ADD {column_name} {column_type}")
        except Exception:
            pass


def get_cassandra_session(settings: Settings) -> Session:
    global _cluster, _session
    if _session is not None:
        return _session

    _cluster = Cluster(contact_points=[settings.cassandra_host], port=settings.cassandra_port)
    _session = _cluster.connect()
    _session.execute(
        f"""
        CREATE KEYSPACE IF NOT EXISTS {settings.cassandra_keyspace}
        WITH replication = {{'class': 'SimpleStrategy', 'replication_factor': 1}}
        """
    )
    _session.set_keyspace(settings.cassandra_keyspace)
    _ensure_courses_schema(_session)
    return _session


def list_courses(session: Session) -> list[dict[str, Any]]:
    rows = session.execute(
        """
        SELECT
            course_id,
            title,
            description,
            level,
            semester,
            subject,
            tags,
            cover_image_data_url,
            object_key,
            original_filename,
            content_type,
            file_size,
            teacher_username,
            created_at
        FROM courses
        """
    )
    courses = []
    for row in rows:
        courses.append(
            {
                "course_id": str(row.course_id),
                "title": row.title,
                "description": row.description,
                "level": row.level,
                "semester": row.semester,
                "subject": row.subject,
                "tags": list(row.tags) if row.tags is not None else [],
                "cover_image_data_url": row.cover_image_data_url,
                "object_key": row.object_key,
                "original_filename": row.original_filename,
                "content_type": row.content_type,
                "file_size": int(row.file_size) if row.file_size is not None else 0,
                "teacher_username": row.teacher_username,
                "created_at": row.created_at.isoformat() if row.created_at else None,
            }
        )
    return courses


def get_course_by_id(session: Session, course_id: UUID) -> dict[str, Any] | None:
    row = session.execute(
        """
        SELECT
            course_id,
            title,
            description,
            level,
            semester,
            subject,
            tags,
            cover_image_data_url,
            object_key,
            original_filename,
            content_type,
            file_size,
            teacher_username,
            created_at
        FROM courses
        WHERE course_id = %s
        """,
        (course_id,),
    ).one()
    if not row:
        return None
    return {
        "course_id": str(row.course_id),
        "title": row.title,
        "description": row.description,
        "level": row.level,
        "semester": row.semester,
        "subject": row.subject,
        "tags": list(row.tags) if row.tags is not None else [],
        "cover_image_data_url": row.cover_image_data_url,
        "object_key": row.object_key,
        "original_filename": row.original_filename,
        "content_type": row.content_type,
        "file_size": int(row.file_size) if row.file_size is not None else 0,
        "teacher_username": row.teacher_username,
        "created_at": row.created_at.isoformat() if row.created_at else None,
    }
