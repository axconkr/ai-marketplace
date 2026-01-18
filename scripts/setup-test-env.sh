#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Project root
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

echo -e "${BLUE}🚀 Setting up AI Marketplace test environment...${NC}"
echo ""

# Check if Docker is running
echo -e "${YELLOW}📋 Checking Docker status...${NC}"
if ! docker info > /dev/null 2>&1; then
  echo -e "${RED}❌ Docker is not running. Please start Docker first.${NC}"
  exit 1
fi
echo -e "${GREEN}✅ Docker is running${NC}"

# Check if .env.local exists, if not copy from .env.example
if [ ! -f ".env.local" ]; then
  echo -e "${YELLOW}📄 Creating .env.local from .env.example...${NC}"
  cp .env.example .env.local
  echo -e "${GREEN}✅ .env.local created${NC}"
  echo -e "${YELLOW}⚠️  Please update .env.local with your configuration${NC}"
fi

# Stop existing containers
echo ""
echo -e "${YELLOW}🛑 Stopping existing containers...${NC}"
docker-compose down

# Start Docker containers
echo ""
echo -e "${YELLOW}📦 Starting Docker containers...${NC}"
docker-compose up -d

# Wait for PostgreSQL to be ready
echo ""
echo -e "${YELLOW}⏳ Waiting for PostgreSQL (development)...${NC}"
until docker exec ai_marketplace_db pg_isready -U ai_marketplace -d ai_marketplace > /dev/null 2>&1; do
  echo -n "."
  sleep 1
done
echo -e "\n${GREEN}✅ PostgreSQL (development) is ready${NC}"

echo -e "${YELLOW}⏳ Waiting for PostgreSQL (test)...${NC}"
until docker exec ai_marketplace_db_test pg_isready -U test -d test > /dev/null 2>&1; do
  echo -n "."
  sleep 1
done
echo -e "\n${GREEN}✅ PostgreSQL (test) is ready${NC}"

# Wait for Redis
echo -e "${YELLOW}⏳ Waiting for Redis...${NC}"
until docker exec ai_marketplace_redis redis-cli ping > /dev/null 2>&1; do
  echo -n "."
  sleep 1
done
echo -e "\n${GREEN}✅ Redis is ready${NC}"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
  echo ""
  echo -e "${YELLOW}📦 Installing dependencies...${NC}"
  npm install
fi

# Run Prisma migrations
echo ""
echo -e "${YELLOW}🔄 Running Prisma migrations...${NC}"
npx prisma migrate dev --name init || {
  echo -e "${YELLOW}⚠️  Migration already exists or failed, continuing...${NC}"
}

# Generate Prisma client
echo -e "${YELLOW}⚙️  Generating Prisma client...${NC}"
npx prisma generate

# Seed test data
echo ""
echo -e "${YELLOW}🌱 Seeding test data...${NC}"
npm run db:seed || {
  echo -e "${YELLOW}⚠️  Seeding failed or already seeded, continuing...${NC}"
}

# Create uploads directory
echo ""
echo -e "${YELLOW}📁 Creating uploads directory...${NC}"
npm run files:setup

echo ""
echo -e "${GREEN}✅ Test environment setup complete!${NC}"
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📝 Available Commands:${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "  ${GREEN}npm run dev${NC}              - Start development server"
echo -e "  ${GREEN}npm test${NC}                 - Run unit tests"
echo -e "  ${GREEN}npm run test:e2e${NC}         - Run E2E tests"
echo -e "  ${GREEN}npm run test:all${NC}         - Run all tests"
echo -e "  ${GREEN}npm run db:studio${NC}        - Open Prisma Studio"
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🔗 Services:${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "  ${GREEN}App:${NC}                     http://localhost:3000"
echo -e "  ${GREEN}PostgreSQL (dev):${NC}        localhost:5432"
echo -e "  ${GREEN}PostgreSQL (test):${NC}       localhost:5433"
echo -e "  ${GREEN}Redis:${NC}                   localhost:6379"
echo -e "  ${GREEN}Adminer:${NC}                 http://localhost:8080 (run with --profile tools)"
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}👤 Test Users:${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "  ${GREEN}Admin:${NC}      admin@aimarketplace.com / admin123"
echo -e "  ${GREEN}Seller:${NC}     seller@test.com / seller123"
echo -e "  ${GREEN}Verifier:${NC}   verifier@test.com / verifier123"
echo -e "  ${GREEN}Buyer:${NC}      buyer@test.com / buyer123"
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
