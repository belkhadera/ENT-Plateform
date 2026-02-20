#!/bin/bash

echo "=== ENT EST Salé - Setup Script ==="

# Install dependencies for all backend services
echo "Installing backend dependencies..."
for service in auth-service user-service course-service file-service messaging-service calendar-service exam-service chatbot-service admin-service; do
    echo "Installing $service dependencies..."
    cd backend/services/$service && npm install && cd ../../..
done

cd backend/api-gateway && npm install && cd ../..

# Install frontend dependencies
echo "Installing frontend dependencies..."
cd frontend && npm install && cd ..

# Create .env files from examples
echo "Creating .env files..."
for service in backend/services/*/; do
    if [ -f "$service/.env.example" ]; then
        cp "$service/.env.example" "$service/.env"
    fi
done

cp backend/api-gateway/.env.example backend/api-gateway/.env
cp frontend/.env.example frontend/.env

echo "Setup complete! Next steps:"
echo "1. Edit .env files with your configuration"
echo "2. Start MongoDB: docker run -d -p 27017:27017 mongo:6"
echo "3. Start MinIO: docker run -d -p 9000:9000 -p 9001:9001 minio/minio server /data --console-address ':9001'"
echo "4. Run: docker-compose up -d"
