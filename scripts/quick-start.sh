#!/bin/bash

# Colors for output
BLUE='\033[0;34m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║       AI Marketplace - Quick Start                 ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════╝${NC}"
echo ""

# Get project root
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

# Setup test environment
"$PROJECT_ROOT/scripts/setup-test-env.sh"

# Check if setup was successful
if [ $? -ne 0 ]; then
  echo -e "${RED}❌ Setup failed. Please check the errors above.${NC}"
  exit 1
fi

# Start development server
echo ""
echo -e "${GREEN}🌐 Starting development server...${NC}"
echo ""
npm run dev
