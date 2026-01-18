#!/bin/bash

# AI Marketplace Rollback Script
# Usage: ./scripts/rollback.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${RED}========================================${NC}"
echo -e "${RED}AI Marketplace Rollback Script${NC}"
echo -e "${RED}========================================${NC}"

# Confirm rollback
echo -e "\n${YELLOW}WARNING: This will rollback to the previous deployment!${NC}"
read -p "Are you sure you want to continue? (yes/no) " -r
echo
if [[ ! $REPLY = "yes" ]]; then
  echo -e "${GREEN}Rollback cancelled.${NC}"
  exit 0
fi

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
  echo -e "${RED}Error: Vercel CLI is not installed. Install with: npm i -g vercel${NC}"
  exit 1
fi

# List recent deployments
echo -e "\n${YELLOW}Recent deployments:${NC}"
vercel ls

# Get previous deployment URL
echo -e "\n${YELLOW}Enter the deployment URL to rollback to:${NC}"
read -p "Deployment URL: " ROLLBACK_URL

if [ -z "$ROLLBACK_URL" ]; then
  echo -e "${RED}Error: No deployment URL provided${NC}"
  exit 1
fi

# Rollback
echo -e "\n${YELLOW}Rolling back to: $ROLLBACK_URL${NC}"
vercel rollback "$ROLLBACK_URL" --yes || {
  echo -e "${RED}Rollback failed!${NC}"
  exit 1
}

# Post-rollback checks
echo -e "\n${YELLOW}Running post-rollback checks...${NC}"
sleep 10

HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$ROLLBACK_URL/api/health")

if [ "$HTTP_STATUS" -eq 200 ]; then
  echo -e "${GREEN}✓ Health check passed${NC}"
else
  echo -e "${RED}✗ Health check failed (HTTP $HTTP_STATUS)${NC}"
fi

# Success message
echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}Rollback Successful!${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "URL: $ROLLBACK_URL"
echo -e "\n${YELLOW}Next steps:${NC}"
echo -e "1. Investigate root cause"
echo -e "2. Prepare hotfix"
echo -e "3. Test thoroughly"
echo -e "4. Redeploy when ready"

# Send Slack notification
if [ -n "$SLACK_WEBHOOK_URL" ]; then
  curl -X POST -H 'Content-type: application/json' \
    --data "{\"text\":\"🔄 Rollback completed. URL: $ROLLBACK_URL\"}" \
    "$SLACK_WEBHOOK_URL"
fi
