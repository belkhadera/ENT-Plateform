# API Documentation - ENT EST Salé

## Base URL
\`\`\`
http://localhost:8000/api
\`\`\`

## Authentication
All protected endpoints require JWT token in Authorization header:
\`\`\`
Authorization: Bearer <token>
\`\`\`

## Endpoints

### Authentication Service (/api/auth)

#### POST /auth/register
Register a new user
\`\`\`json
Request:
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "STUDENT"
}

Response:
{
  "success": true,
  "data": {
    "user": {...},
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
\`\`\`

#### POST /auth/login
Login user
\`\`\`json
Request:
{
  "login": "john_doe",
  "password": "password123"
}

Response:
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "username": "john_doe",
      "email": "john@example.com",
      "role": "STUDENT"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
\`\`\`

#### GET /auth/me
Get current user profile (Protected)
\`\`\`json
Response:
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "username": "john_doe",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "STUDENT"
    }
  }
}
\`\`\`

### Course Service (/api/courses)

#### GET /courses
Get all courses (Protected)
\`\`\`json
Response:
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "title": "Introduction to Computer Science",
      "description": "Basic CS concepts",
      "teacherId": "...",
      "files": [],
      "students": []
    }
  ]
}
\`\`\`

#### POST /courses
Create a new course (Protected - Teacher only)
\`\`\`json
Request:
{
  "title": "Web Development",
  "description": "Learn HTML, CSS, JavaScript",
  "category": "Computer Science",
  "semester": "Fall 2024"
}

Response:
{
  "success": true,
  "data": {
    "_id": "...",
    "title": "Web Development",
    ...
  }
}
\`\`\`

#### GET /courses/:id
Get course details (Protected)

#### PUT /courses/:id
Update course (Protected - Teacher only)

#### DELETE /courses/:id
Delete course (Protected - Teacher only)

### File Service (/api/files)

#### POST /files/upload
Upload a file (Protected)
\`\`\`
Content-Type: multipart/form-data

Fields:
- file: File to upload
- courseId: Course ID (optional)

Response:
{
  "success": true,
  "data": {
    "_id": "...",
    "fileName": "uuid-document.pdf",
    "originalName": "document.pdf",
    "url": "http://minio:9000/..."
  }
}
\`\`\`

#### GET /files/:id
Download file (Protected)
\`\`\`json
Response:
{
  "success": true,
  "data": {
    "url": "http://minio:9000/...",
    "fileName": "document.pdf"
  }
}
\`\`\`

## Error Responses

All errors follow this format:
\`\`\`json
{
  "success": false,
  "message": "Error description"
}
\`\`\`

### Common HTTP Status Codes
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error
