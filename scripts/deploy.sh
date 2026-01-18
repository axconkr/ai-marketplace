#!/bin/bash

# AI Marketplace Production Deployment Script
# Usage: ./scripts/deploy.sh [environment]
# Environments: staging, production

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Environment
ENV=${1:-staging}

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}AI Marketplace Deployment Script${NC}"
echo -e "${GREEN}Environment: ${ENV}${NC}"
echo -e "${GREEN}========================================${NC}"

# Pre-deployment checks
echo -e "\n${YELLOW}Running pre-deployment checks...${NC}"

# Check if environment is valid
if [ "$ENV" != "staging" ] && [ "$ENV" != "production" ]; then
  echo -e "${RED}Error: Invalid environment. Use 'staging' or 'production'${NC}"
  exit 1
fi

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
  echo -e "${RED}Error: Vercel CLI is not installed. Install with: npm i -g vercel${NC}"
  exit 1
fi

# Check if all tests pass
echo -e "\n${YELLOW}Running tests...${NC}"
npm run test:ci || {
  echo -e "${RED}Tests failed! Aborting deployment.${NC}"
  exit 1
}

# Check for linting errors
echo -e "\n${YELLOW}Running linter...${NC}"
npm run lint || {
  echo -e "${RED}Linting failed! Aborting deployment.${NC}"
  exit 1
}

# Check for TypeScript errors
echo -e "\n${YELLOW}Type checking...${NC}"
npm run typecheck || {
  echo -e "${RED}Type checking failed! Aborting deployment.${NC}"
  exit 1
}

# Check for security vulnerabilities
echo -e "\n${YELLOW}Running security audit...${NC}"
npm audit --audit-level=high || {
  echo -e "${YELLOW}Warning: Security vulnerabilities found. Review before deploying.${NC}"
  read -p "Continue deployment? (y/n) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
  fi
}

# Generate Prisma Client
echo -e "\n${YELLOW}Generating Prisma Client...${NC}"
npx prisma generate

# Build the application
echo -e "\n${YELLOW}Building application...${NC}"
npm run build || {
  echo -e "${RED}Build failed! Aborting deployment.${NC}"
  exit 1
}

# Confirm production deployment
if [ "$ENV" = "production" ]; then
  echo -e "\n${YELLOW}========================================${NC}"
  echo -e "${YELLOW}WARNING: Deploying to PRODUCTION!${NC}"
  echo -e "${YELLOW}========================================${NC}"
  read -p "Are you sure you want to continue? (yes/no) " -r
  echo
  if [[ ! $REPLY = "yes" ]]; then
    echo -e "${RED}Deployment cancelled.${NC}"
    exit 0
  fi
fi

# Deploy to Vercel
echo -e "\n${YELLOW}Deploying to Vercel ($ENV)...${NC}"
if [ "$ENV" = "production" ]; then
  vercel --prod || {
    echo -e "${RED}Deployment failed!${NC}"
    exit 1
  }
else
  vercel || {
    echo -e "${RED}Deployment failed!${NC}"
    exit 1
  }
fi

# Run database migrations
echo -e "\n${YELLOW}Running database migrations...${NC}"
if [ "$ENV" = "production" ]; then
  DATABASE_URL=$PRODUCTION_DATABASE_URL npx prisma migrate deploy || {
    echo -e "${RED}Migration failed! Rolling back...${NC}"
    vercel rollback
    exit 1
  }
else
  DATABASE_URL=$STAGING_DATABASE_URL npx prisma migrate deploy || {
    echo -e "${RED}Migration failed!${NC}"
    exit 1
  }
fi

# Post-deployment checks
echo -e "\n${YELLOW}Running post-deployment checks...${NC}"

# Get deployment URL
DEPLOYMENT_URL=$(vercel ls | grep -m 1 "ai-marketplace" | awk '{print $2}')

# Health check
echo -e "\n${YELLOW}Checking health endpoint...${NC}"
sleep 10  # Wait for deployment to be ready
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "https://${DEPLOYMENT_URL}/api/health")

if [ "$HTTP_STATUS" -eq 200 ]; then
  echo -e "${GREEN}✓ Health check passed${NC}"
else
  echo -e "${RED}✗ Health check failed (HTTP $HTTP_STATUS)${NC}"
  exit 1
fi

# Success message
echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}Deployment Successful!${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "Environment: ${ENV}"
echo -e "URL: https://${DEPLOYMENT_URL}"
echo -e "\n${YELLOW}Next steps:${NC}"
echo -e "1. Monitor error rates in Sentry"
echo -e "2. Check API response times"
echo -e "3. Verify payment processing"
echo -e "4. Test critical user flows"
echo -e "\n${YELLOW}Rollback command (if needed):${NC}"
echo -e "vercel rollback"

# Send Slack notification (if webhook URL is set)
if [ -n "$SLACK_WEBHOOK_URL" ]; then
  curl -X POST -H 'Content-type: application/json' \
    --data "{\"text\":\"✅ Deployment to $ENV successful! URL: https://${DEPLOYMENT_URL}\"}" \
    "$SLACK_WEBHOOK_URL"
fi
