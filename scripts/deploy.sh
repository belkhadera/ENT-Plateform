#!/bin/bash

echo "=== ENT EST Salé - Deployment Script ==="

# Build Docker images
echo "Building Docker images..."
docker-compose build

# Start services
echo "Starting services..."
docker-compose up -d

# Wait for services to be ready
echo "Waiting for services to start..."
sleep 10

# Check health
echo "Checking service health..."
curl -f http://localhost:8000/health || echo "API Gateway not ready"
curl -f http://localhost:8001/health || echo "Auth Service not ready"

echo "Deployment complete!"
echo "Access the application at: http://localhost:3000"
