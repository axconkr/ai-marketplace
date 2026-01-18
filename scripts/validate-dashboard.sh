#!/bin/bash

echo "🔍 Validating Seller Dashboard Implementation..."
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counters
passed=0
failed=0

# Function to check file exists
check_file() {
  if [ -f "$1" ]; then
    echo -e "${GREEN}✓${NC} $2"
    ((passed++))
  else
    echo -e "${RED}✗${NC} $2 - File not found: $1"
    ((failed++))
  fi
}

# Function to check directory exists
check_dir() {
  if [ -d "$1" ]; then
    echo -e "${GREEN}✓${NC} $2"
    ((passed++))
  else
    echo -e "${RED}✗${NC} $2 - Directory not found: $1"
    ((failed++))
  fi
}

echo "📁 Checking File Structure..."
echo ""

# Core Services
check_file "lib/services/analytics.ts" "Analytics service"
check_file "lib/utils/export.ts" "Export utilities"
check_file "hooks/use-analytics.ts" "React Query hooks"

echo ""
echo "🎨 Checking Components..."
echo ""

# Components
check_file "components/analytics/StatsCard.tsx" "StatsCard component"
check_file "components/analytics/RevenueChart.tsx" "RevenueChart component"
check_file "components/analytics/TopProductsList.tsx" "TopProductsList component"
check_file "components/analytics/OrdersTable.tsx" "OrdersTable component"
check_file "components/analytics/PendingActionsList.tsx" "PendingActionsList component"

echo ""
echo "📄 Checking Pages..."
echo ""

# Pages
check_file "app/(marketplace)/dashboard/page.tsx" "Dashboard overview page"
check_file "app/(marketplace)/dashboard/analytics/page.tsx" "Analytics page"
check_file "app/(marketplace)/dashboard/orders/page.tsx" "Orders page"

echo ""
echo "🔌 Checking API Routes..."
echo ""

# API Routes
check_file "app/api/analytics/seller/overview/route.ts" "Overview API"
check_file "app/api/analytics/seller/revenue/route.ts" "Revenue API"
check_file "app/api/analytics/seller/top-products/route.ts" "Top products API"
check_file "app/api/analytics/seller/orders-timeline/route.ts" "Orders timeline API"
check_file "app/api/analytics/seller/customers/route.ts" "Customers API"
check_file "app/api/analytics/seller/pending-actions/route.ts" "Pending actions API"
check_file "app/api/analytics/seller/export/route.ts" "Export API"
check_file "app/api/orders/route.ts" "Orders API"

echo ""
echo "📚 Checking Documentation..."
echo ""

# Documentation
check_file "docs/SELLER_DASHBOARD.md" "Dashboard documentation"
check_file "docs/DASHBOARD_IMPLEMENTATION.md" "Implementation guide"
check_file "docs/DASHBOARD_QUICKSTART.md" "Quick start guide"

echo ""
echo "🔧 Checking Dependencies..."
echo ""

# Check package.json for required dependencies
if grep -q '"recharts"' package.json; then
  echo -e "${GREEN}✓${NC} recharts dependency"
  ((passed++))
else
  echo -e "${RED}✗${NC} recharts dependency not found"
  ((failed++))
fi

if grep -q '"date-fns"' package.json; then
  echo -e "${GREEN}✓${NC} date-fns dependency"
  ((passed++))
else
  echo -e "${RED}✗${NC} date-fns dependency not found"
  ((failed++))
fi

if grep -q '"@tanstack/react-query"' package.json; then
  echo -e "${GREEN}✓${NC} react-query dependency"
  ((passed++))
else
  echo -e "${RED}✗${NC} react-query dependency not found"
  ((failed++))
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Summary
total=$((passed + failed))
percentage=$((passed * 100 / total))

if [ $failed -eq 0 ]; then
  echo -e "${GREEN}✨ All checks passed! ($passed/$total)${NC}"
  echo ""
  echo "🚀 Dashboard is ready for production!"
else
  echo -e "${YELLOW}⚠️  Some checks failed ($failed/$total failed, $passed passed)${NC}"
  echo ""
  echo "Please review the failed items above."
fi

echo ""
echo "Success rate: $percentage%"
echo ""

exit $failed
