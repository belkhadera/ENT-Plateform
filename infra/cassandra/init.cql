CREATE KEYSPACE IF NOT EXISTS ent
WITH replication = {'class': 'SimpleStrategy', 'replication_factor': 1};

USE ent;

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
);
