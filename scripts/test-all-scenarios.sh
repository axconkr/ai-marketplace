#!/bin/bash

# AI Marketplace - Complete Scenario Testing Script
# This script tests all MVP features end-to-end

# Do NOT exit on error - we want to collect all test results
# set -e

BASE_URL="http://localhost:3000"
API_URL="$BASE_URL/api"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="test-results-${TIMESTAMP}.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Log function
log() {
    echo -e "${BLUE}[$(date +%H:%M:%S)]${NC} $1" | tee -a "$LOG_FILE"
}

success() {
    echo -e "${GREEN}✓${NC} $1" | tee -a "$LOG_FILE"
    ((PASSED_TESTS++))
}

error() {
    echo -e "${RED}✗${NC} $1" | tee -a "$LOG_FILE"
    ((FAILED_TESTS++))
}

warning() {
    echo -e "${YELLOW}⚠${NC} $1" | tee -a "$LOG_FILE"
}

test_endpoint() {
    ((TOTAL_TESTS++))
    local method=$1
    local endpoint=$2
    local description=$3
    local expected_status=$4
    local data=$5

    log "Testing: $description"

    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" "$endpoint")
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" -H "Content-Type: application/json" -d "$data" "$endpoint")
    fi

    status_code=$(echo "$response" | tail -n 1)
    body=$(echo "$response" | sed '$d')

    if [ "$status_code" = "$expected_status" ]; then
        success "$description - Status: $status_code"
        return 0
    else
        error "$description - Expected: $expected_status, Got: $status_code"
        echo "Response: $body" >> "$LOG_FILE"
        return 1
    fi
}

test_page() {
    ((TOTAL_TESTS++))
    local url=$1
    local description=$2

    log "Testing page: $description"

    status_code=$(curl -s -o /dev/null -w "%{http_code}" "$url")

    if [ "$status_code" = "200" ] || [ "$status_code" = "307" ] || [ "$status_code" = "302" ]; then
        success "$description - Status: $status_code"
        return 0
    else
        error "$description - Status: $status_code"
        return 1
    fi
}

# =============================================================================
# START TESTING
# =============================================================================

log "========================================="
log "AI Marketplace MVP - Scenario Testing"
log "========================================="
log "Start Time: $(date)"
log ""

# =============================================================================
# PHASE 0: Server Health Check
# =============================================================================

log ""
log "========================================="
log "PHASE 0: Server Health Check"
log "========================================="

test_page "$BASE_URL" "Homepage"

# =============================================================================
# PHASE 1: Development Request System
# =============================================================================

log ""
log "========================================="
log "PHASE 1: Development Request System"
log "========================================="

# Test 1.1: Request List Page
test_page "$BASE_URL/requests" "Request List Page"

# Test 1.2: New Request Page
test_page "$BASE_URL/requests/new" "New Request Form Page"

# Test 1.3: API - List Requests
test_endpoint "GET" "$API_URL/requests" "API: List all requests" "200"

# Test 1.4: API - Get Plans (for subscription seed)
log "Checking if subscription plans exist..."
test_endpoint "GET" "$API_URL/subscriptions/plans" "API: Get subscription plans" "200"

log ""
log "Note: Full CRUD testing requires authentication and database."
log "Testing available public endpoints only."

# =============================================================================
# PHASE 2: Subscription Payment System
# =============================================================================

log ""
log "========================================="
log "PHASE 2: Subscription Payment System"
log "========================================="

# Test 2.1: Pricing Page
test_page "$BASE_URL/pricing" "Pricing Page"

# Test 2.2: API - Get Subscription Plans
test_endpoint "GET" "$API_URL/subscriptions/plans" "API: Get subscription plans" "200"

log ""
log "Note: Subscription dashboard requires authentication."
log "Testing public pricing page only."

# =============================================================================
# PHASE 3: Advanced Search & Filter
# =============================================================================

log ""
log "========================================="
log "PHASE 3: Advanced Search & Filter"
log "========================================="

# Test 3.1: Search Page
test_page "$BASE_URL/search" "Search Page"

# Test 3.2: API - Product Search (basic)
test_endpoint "GET" "$API_URL/products/search" "API: Product search (no filters)" "200"

# Test 3.3: API - Product Search with category filter
test_endpoint "GET" "$API_URL/products/search?category=ai_agent" "API: Search with category filter" "200"

# Test 3.4: API - Product Search with price range
test_endpoint "GET" "$API_URL/products/search?min_price=0&max_price=100000" "API: Search with price filter" "200"

# Test 3.5: API - Product Search with rating
test_endpoint "GET" "$API_URL/products/search?min_rating=4" "API: Search with rating filter" "200"

# Test 3.6: API - Product Search with verification level
test_endpoint "GET" "$API_URL/products/search?verification_level=2" "API: Search with verification filter" "200"

# Test 3.7: API - Product Search with sorting
test_endpoint "GET" "$API_URL/products/search?sort_by=price_asc" "API: Search with price sorting" "200"

# Test 3.8: API - Product Search with pagination
test_endpoint "GET" "$API_URL/products/search?page=1&limit=10" "API: Search with pagination" "200"

# Test 3.9: API - Product Search with combined filters
test_endpoint "GET" "$API_URL/products/search?category=ai_agent&min_price=10000&max_price=50000&min_rating=3&sort_by=rating" "API: Search with combined filters" "200"

# =============================================================================
# COMPONENT PAGES
# =============================================================================

log ""
log "========================================="
log "Additional Pages"
log "========================================="

# Test pages that might exist
test_page "$BASE_URL/products" "Products Page" || true
# Note: Products page is optional

# =============================================================================
# SUMMARY
# =============================================================================

log ""
log "========================================="
log "TEST SUMMARY"
log "========================================="
log "Total Tests: $TOTAL_TESTS"
log "Passed: ${GREEN}$PASSED_TESTS${NC}"
log "Failed: ${RED}$FAILED_TESTS${NC}"
log "Success Rate: $(( PASSED_TESTS * 100 / TOTAL_TESTS ))%"
log ""
log "End Time: $(date)"
log "Log saved to: $LOG_FILE"

if [ $FAILED_TESTS -eq 0 ]; then
    log ""
    success "ALL TESTS PASSED! 🎉"
    exit 0
else
    log ""
    error "Some tests failed. Check log for details."
    exit 1
fi
