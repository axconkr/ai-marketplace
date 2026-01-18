#!/bin/bash

# AI Marketplace - Database Startup Script
# This script ensures the database is running before starting the application

set -e

echo "🚀 Starting AI Marketplace Database..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running!${NC}"
    echo -e "${YELLOW}Please start Docker Desktop and try again.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Docker is running${NC}"

# Check if containers exist
if [ "$(docker ps -aq -f name=ai_marketplace_db)" ]; then
    # Container exists, check if it's running
    if [ "$(docker ps -q -f name=ai_marketplace_db)" ]; then
        echo -e "${GREEN}✓ Database container is already running${NC}"
    else
        # Container exists but not running, start it
        echo -e "${YELLOW}⟳ Starting existing database container...${NC}"
        docker start ai_marketplace_db

        # Wait for database to be ready
        echo "⏳ Waiting for database to be ready..."
        sleep 5

        # Check health
        until docker exec ai_marketplace_db pg_isready -U ai_marketplace -d ai_marketplace > /dev/null 2>&1; do
            echo "⏳ Waiting for database..."
            sleep 2
        done

        echo -e "${GREEN}✓ Database is ready!${NC}"
    fi
else
    # No container exists, create and start with docker-compose
    echo -e "${YELLOW}⟳ Creating and starting database containers...${NC}"
    docker-compose up -d postgres redis

    # Wait for database to be ready
    echo "⏳ Waiting for database to initialize..."
    sleep 10

    # Check health
    until docker exec ai_marketplace_db pg_isready -U ai_marketplace -d ai_marketplace > /dev/null 2>&1; do
        echo "⏳ Waiting for database..."
        sleep 2
    done

    echo -e "${GREEN}✓ Database created and ready!${NC}"
fi

# Show database status
echo ""
echo "📊 Database Status:"
docker ps --filter name=ai_marketplace_db --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo -e "${GREEN}✅ Database is running on localhost:5434${NC}"
echo ""
echo "💡 Useful commands:"
echo "   Stop database:    docker stop ai_marketplace_db"
echo "   Restart database: docker restart ai_marketplace_db"
echo "   View logs:        docker logs ai_marketplace_db -f"
echo "   Database UI:      docker-compose --profile tools up -d adminer"
echo "                     Then visit http://localhost:8080"
echo ""
