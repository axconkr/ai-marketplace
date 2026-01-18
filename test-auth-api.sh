#!/bin/bash

# Authentication API Integration Test Script
# Run this with: bash test-auth-api.sh

BASE_URL="http://localhost:3000"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== AI Marketplace Auth API Test ===${NC}\n"

# Generate random email for testing
TIMESTAMP=$(date +%s)
TEST_EMAIL="test${TIMESTAMP}@example.com"
TEST_PASSWORD="password123"
TEST_NAME="Test User ${TIMESTAMP}"

echo -e "${YELLOW}Test Configuration:${NC}"
echo "Email: $TEST_EMAIL"
echo "Password: $TEST_PASSWORD"
echo "Name: $TEST_NAME"
echo ""

# Test 1: Register
echo -e "${YELLOW}Test 1: User Registration${NC}"
REGISTER_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"${TEST_EMAIL}\",
    \"password\": \"${TEST_PASSWORD}\",
    \"name\": \"${TEST_NAME}\"
  }")

echo "$REGISTER_RESPONSE" | jq '.'

if echo "$REGISTER_RESPONSE" | jq -e '.token' > /dev/null 2>&1; then
  echo -e "${GREEN}✓ Registration successful${NC}\n"
  ACCESS_TOKEN=$(echo "$REGISTER_RESPONSE" | jq -r '.token')
else
  echo -e "${RED}✗ Registration failed${NC}\n"
  exit 1
fi

# Test 2: Login
echo -e "${YELLOW}Test 2: User Login${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"${TEST_EMAIL}\",
    \"password\": \"${TEST_PASSWORD}\"
  }")

echo "$LOGIN_RESPONSE" | jq '.'

if echo "$LOGIN_RESPONSE" | jq -e '.token' > /dev/null 2>&1; then
  echo -e "${GREEN}✓ Login successful${NC}\n"
  ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.token')
  REFRESH_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.refreshToken')
else
  echo -e "${RED}✗ Login failed${NC}\n"
  exit 1
fi

# Test 3: Get Current User
echo -e "${YELLOW}Test 3: Get Current User${NC}"
ME_RESPONSE=$(curl -s -X GET "${BASE_URL}/api/auth/me" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}")

echo "$ME_RESPONSE" | jq '.'

if echo "$ME_RESPONSE" | jq -e '.user.email' > /dev/null 2>&1; then
  echo -e "${GREEN}✓ Get current user successful${NC}\n"
else
  echo -e "${RED}✗ Get current user failed${NC}\n"
  exit 1
fi

# Test 4: Refresh Token
echo -e "${YELLOW}Test 4: Refresh Access Token${NC}"
REFRESH_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/auth/refresh" \
  -H "Content-Type: application/json" \
  -d "{
    \"refreshToken\": \"${REFRESH_TOKEN}\"
  }")

echo "$REFRESH_RESPONSE" | jq '.'

if echo "$REFRESH_RESPONSE" | jq -e '.token' > /dev/null 2>&1; then
  echo -e "${GREEN}✓ Token refresh successful${NC}\n"
  NEW_ACCESS_TOKEN=$(echo "$REFRESH_RESPONSE" | jq -r '.token')
else
  echo -e "${RED}✗ Token refresh failed${NC}\n"
  exit 1
fi

# Test 5: Logout
echo -e "${YELLOW}Test 5: User Logout${NC}"
LOGOUT_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/auth/logout" \
  -H "Authorization: Bearer ${NEW_ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{
    \"refreshToken\": \"${REFRESH_TOKEN}\"
  }")

echo "$LOGOUT_RESPONSE" | jq '.'

if echo "$LOGOUT_RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
  echo -e "${GREEN}✓ Logout successful${NC}\n"
else
  echo -e "${RED}✗ Logout failed${NC}\n"
  exit 1
fi

# Test 6: Verify logout (should fail)
echo -e "${YELLOW}Test 6: Verify Token After Logout (should fail)${NC}"
VERIFY_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/auth/refresh" \
  -H "Content-Type: application/json" \
  -d "{
    \"refreshToken\": \"${REFRESH_TOKEN}\"
  }")

echo "$VERIFY_RESPONSE" | jq '.'

if echo "$VERIFY_RESPONSE" | jq -e '.error' > /dev/null 2>&1; then
  echo -e "${GREEN}✓ Token correctly invalidated after logout${NC}\n"
else
  echo -e "${RED}✗ Token should be invalid after logout${NC}\n"
fi

# Test 7: Invalid login
echo -e "${YELLOW}Test 7: Invalid Login (should fail)${NC}"
INVALID_LOGIN=$(curl -s -X POST "${BASE_URL}/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"${TEST_EMAIL}\",
    \"password\": \"wrongpassword\"
  }")

echo "$INVALID_LOGIN" | jq '.'

if echo "$INVALID_LOGIN" | jq -e '.error' > /dev/null 2>&1; then
  echo -e "${GREEN}✓ Invalid login correctly rejected${NC}\n"
else
  echo -e "${RED}✗ Invalid login should be rejected${NC}\n"
fi

echo -e "${GREEN}=== All Tests Completed ===${NC}"
