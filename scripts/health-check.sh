#!/bin/bash

# AI Marketplace Health Check Script
# Usage: ./scripts/health-check.sh [url]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# URL to check
URL=${1:-https://aimarketplace.com}

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}AI Marketplace Health Check${NC}"
echo -e "${GREEN}URL: ${URL}${NC}"
echo -e "${GREEN}========================================${NC}"

# Health endpoint check
echo -e "\n${YELLOW}Checking health endpoint...${NC}"
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${URL}/api/health")
if [ "$HTTP_STATUS" -eq 200 ]; then
  echo -e "${GREEN}✓ Health endpoint: OK (${HTTP_STATUS})${NC}"
else
  echo -e "${RED}✗ Health endpoint: FAILED (${HTTP_STATUS})${NC}"
fi

# Homepage check
echo -e "\n${YELLOW}Checking homepage...${NC}"
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${URL}")
if [ "$HTTP_STATUS" -eq 200 ]; then
  echo -e "${GREEN}✓ Homepage: OK (${HTTP_STATUS})${NC}"
else
  echo -e "${RED}✗ Homepage: FAILED (${HTTP_STATUS})${NC}"
fi

# API endpoint checks
echo -e "\n${YELLOW}Checking API endpoints...${NC}"

# Prompts endpoint
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${URL}/api/prompts")
if [ "$HTTP_STATUS" -eq 200 ]; then
  echo -e "${GREEN}✓ Prompts API: OK (${HTTP_STATUS})${NC}"
else
  echo -e "${RED}✗ Prompts API: FAILED (${HTTP_STATUS})${NC}"
fi

# Categories endpoint
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${URL}/api/categories")
if [ "$HTTP_STATUS" -eq 200 ]; then
  echo -e "${GREEN}✓ Categories API: OK (${HTTP_STATUS})${NC}"
else
  echo -e "${RED}✗ Categories API: FAILED (${HTTP_STATUS})${NC}"
fi

# Response time check
echo -e "\n${YELLOW}Checking response times...${NC}"
RESPONSE_TIME=$(curl -o /dev/null -s -w '%{time_total}\n' "${URL}/api/health")
RESPONSE_TIME_MS=$(echo "$RESPONSE_TIME * 1000" | bc | cut -d. -f1)

if [ "$RESPONSE_TIME_MS" -lt 500 ]; then
  echo -e "${GREEN}✓ Response time: ${RESPONSE_TIME_MS}ms (Good)${NC}"
elif [ "$RESPONSE_TIME_MS" -lt 1000 ]; then
  echo -e "${YELLOW}⚠ Response time: ${RESPONSE_TIME_MS}ms (Acceptable)${NC}"
else
  echo -e "${RED}✗ Response time: ${RESPONSE_TIME_MS}ms (Slow)${NC}"
fi

# SSL certificate check
echo -e "\n${YELLOW}Checking SSL certificate...${NC}"
SSL_EXPIRY=$(echo | openssl s_client -servername aimarketplace.com -connect aimarketplace.com:443 2>/dev/null | openssl x509 -noout -enddate | cut -d= -f2)
echo -e "${GREEN}✓ SSL certificate expires: ${SSL_EXPIRY}${NC}"

# Summary
echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}Health Check Complete${NC}"
echo -e "${GREEN}========================================${NC}"
