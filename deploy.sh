#!/bin/bash

# Samsung Recipe Platform Deployment Script
echo "🍳 Starting Samsung Recipe Platform deployment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check deployment type
DEPLOYMENT_TYPE=${1:-docker}

if [ "$DEPLOYMENT_TYPE" = "docker" ]; then
    echo "📦 Building and deploying with Docker Compose..."
    
    # Build all services
    echo "Building microservices..."
    docker-compose build
    
    # Start infrastructure first
    echo "Starting database and Redis..."
    docker-compose up -d postgres redis
    
    # Wait for services to be ready
    echo "Waiting for database to be ready..."
    sleep 10
    
    # Start all services
    echo "Starting all services..."
    docker-compose up -d
    
    echo "✅ Deployment complete!"
    echo "🌐 Frontend: http://localhost:3000"
    echo "👤 User Service: http://localhost:8081"
    echo "🍽️ Recipe Service: http://localhost:8082"
    echo "🥕 Ingredient Service: http://localhost:8083"
    echo "📋 Board Service: http://localhost:8084"
    
elif [ "$DEPLOYMENT_TYPE" = "k8s" ]; then
    echo "☸️ Deploying to Kubernetes..."
    
    # Apply namespace
    kubectl apply -f k8s/namespace.yaml
    
    # Apply secrets
    kubectl apply -f k8s/secrets.yaml
    
    # Apply infrastructure
    kubectl apply -f k8s/postgres.yaml
    kubectl apply -f k8s/redis.yaml
    
    # Wait for infrastructure
    echo "Waiting for infrastructure to be ready..."
    kubectl wait --for=condition=ready pod -l app=postgres -n samsung-recipe --timeout=300s
    kubectl wait --for=condition=ready pod -l app=redis -n samsung-recipe --timeout=300s
    
    # Apply services
    kubectl apply -f k8s/user-service.yaml
    kubectl apply -f k8s/recipe-service.yaml
    
    # Wait for services
    kubectl wait --for=condition=ready pod -l app=user-service -n samsung-recipe --timeout=300s
    kubectl wait --for=condition=ready pod -l app=recipe-service -n samsung-recipe --timeout=300s
    
    echo "✅ Kubernetes deployment complete!"
    echo "📋 Check status: kubectl get pods -n samsung-recipe"
    
else
    echo "❌ Invalid deployment type. Use 'docker' or 'k8s'"
    exit 1
fi

echo "🎉 Samsung Recipe Platform is ready!"