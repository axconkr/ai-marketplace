#!/bin/bash
# Docker Setup Validation Script
# Validates that all Docker components are properly configured

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Counters
PASSED=0
FAILED=0
WARNINGS=0

# Helper functions
print_header() {
    echo ""
    echo -e "${BLUE}════════════════════════════════════════${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}════════════════════════════════════════${NC}"
    echo ""
}

print_test() {
    echo -e "${CYAN}→ Testing: $1${NC}"
}

print_pass() {
    echo -e "  ${GREEN}✓ PASS${NC} - $1"
    ((PASSED++))
}

print_fail() {
    echo -e "  ${RED}✗ FAIL${NC} - $1"
    ((FAILED++))
}

print_warn() {
    echo -e "  ${YELLOW}⚠ WARN${NC} - $1"
    ((WARNINGS++))
}

print_info() {
    echo -e "  ${CYAN}ℹ INFO${NC} - $1"
}

# Tests
print_header "Docker Setup Validation"

# 1. Check Docker
print_test "Docker installation"
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version)
    print_pass "Docker is installed: $DOCKER_VERSION"
else
    print_fail "Docker is not installed"
fi

# 2. Check Docker Compose
print_test "Docker Compose installation"
if command -v docker-compose &> /dev/null; then
    COMPOSE_VERSION=$(docker-compose --version)
    print_pass "Docker Compose is installed: $COMPOSE_VERSION"
else
    print_fail "Docker Compose is not installed"
fi

# 3. Check Docker running
print_test "Docker daemon status"
if docker info &> /dev/null; then
    print_pass "Docker daemon is running"
else
    print_fail "Docker daemon is not running"
fi

# 4. Check required files
print_header "Required Files"

FILES=(
    "docker-compose.yml:Docker Compose configuration"
    "Makefile:Makefile for commands"
    ".dockerignore:Docker ignore file"
    ".env.example:Environment template"
    "docker/init-scripts/01-init-database.sql:Database initialization"
    "scripts/db-utils.sh:Database utilities"
)

for file_info in "${FILES[@]}"; do
    IFS=':' read -r file desc <<< "$file_info"
    print_test "$desc"
    if [ -f "$file" ]; then
        SIZE=$(du -h "$file" | cut -f1)
        print_pass "File exists: $file ($SIZE)"
    else
        print_fail "File missing: $file"
    fi
done

# 5. Check docker-compose.yml validity
print_header "Configuration Validation"

print_test "docker-compose.yml syntax"
if docker-compose config &> /dev/null; then
    print_pass "docker-compose.yml is valid"
else
    print_fail "docker-compose.yml has syntax errors"
fi

# 6. Check .env file
print_test "Environment configuration"
if [ -f ".env" ]; then
    print_pass ".env file exists"
else
    print_warn ".env file not found (run 'make init' to create)"
fi

# 7. Check Makefile
print_test "Makefile syntax"
if make -n help &> /dev/null; then
    print_pass "Makefile is valid"
else
    print_fail "Makefile has errors"
fi

# 8. Check script permissions
print_header "Script Permissions"

SCRIPTS=(
    "scripts/db-utils.sh"
    "scripts/validate-docker-setup.sh"
)

for script in "${SCRIPTS[@]}"; do
    print_test "$script executable"
    if [ -x "$script" ]; then
        print_pass "Script is executable: $script"
    else
        print_warn "Script not executable: $script (run: chmod +x $script)"
    fi
done

# 9. Check Docker volumes (if containers have been run)
print_header "Docker Resources"

print_test "Docker volumes"
VOLUMES=$(docker volume ls --format "{{.Name}}" | grep -c "ai_marketplace" || true)
if [ "$VOLUMES" -gt 0 ]; then
    print_pass "Found $VOLUMES AI Marketplace volume(s)"
else
    print_info "No volumes created yet (run 'make init' to initialize)"
fi

# 10. Check running containers
print_test "Running containers"
CONTAINERS=$(docker ps --format "{{.Names}}" | grep -c "ai_marketplace" || true)
if [ "$CONTAINERS" -gt 0 ]; then
    print_pass "Found $CONTAINERS running AI Marketplace container(s)"
else
    print_info "No containers running (run 'make up' to start)"
fi

# 11. Check network
print_test "Docker network"
NETWORK=$(docker network ls --format "{{.Name}}" | grep -c "ai_marketplace" || true)
if [ "$NETWORK" -gt 0 ]; then
    print_pass "AI Marketplace network exists"
else
    print_info "Network not created yet (will be created on 'make up')"
fi

# 12. Check documentation
print_header "Documentation"

DOCS=(
    "DOCKER_SETUP.md"
    "QUICK_START.md"
    "DOCKER_README.md"
)

for doc in "${DOCS[@]}"; do
    print_test "$doc"
    if [ -f "$doc" ]; then
        LINES=$(wc -l < "$doc")
        print_pass "Documentation exists: $doc ($LINES lines)"
    else
        print_fail "Documentation missing: $doc"
    fi
done

# 13. Check port availability (if nothing is running)
print_header "Port Availability"

check_port() {
    local port=$1
    local name=$2
    print_test "Port $port ($name)"
    if lsof -i :$port &> /dev/null; then
        PID=$(lsof -t -i :$port)
        PROCESS=$(ps -p $PID -o comm= 2>/dev/null || echo "unknown")
        print_warn "Port $port is in use by $PROCESS (PID: $PID)"
    else
        print_pass "Port $port is available"
    fi
}

check_port 5432 "PostgreSQL"
check_port 6379 "Redis"
check_port 8080 "Adminer"

# Summary
print_header "Validation Summary"

echo ""
echo -e "${GREEN}Passed:   $PASSED${NC}"
echo -e "${YELLOW}Warnings: $WARNINGS${NC}"
echo -e "${RED}Failed:   $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║  ✓ Docker setup is valid!             ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. Run 'make init' to initialize environment"
    echo "  2. Run 'make health' to check service health"
    echo "  3. Start developing!"
    echo ""
    exit 0
else
    echo -e "${RED}╔════════════════════════════════════════╗${NC}"
    echo -e "${RED}║  ✗ Validation failed!                  ║${NC}"
    echo -e "${RED}╚════════════════════════════════════════╝${NC}"
    echo ""
    echo "Please fix the errors above and try again."
    echo ""
    exit 1
fi
