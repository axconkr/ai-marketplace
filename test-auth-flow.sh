#!/bin/bash

# AI Marketplace Authentication Flow Test
# Tests user registration, login, and role-based access

API_URL="http://localhost:3000/api"
SELLER_EMAIL="seller@test.com"
BUYER_EMAIL="buyer@test.com"
PASSWORD="Test1234!"

echo "🧪 AI Marketplace Authentication Flow Test"
echo "=========================================="
echo ""

# Function to make API requests
api_request() {
  local method=$1
  local endpoint=$2
  local data=$3
  local token=$4

  if [ -n "$token" ]; then
    curl -s -X "$method" "$API_URL$endpoint" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $token" \
      -d "$data"
  else
    curl -s -X "$method" "$API_URL$endpoint" \
      -H "Content-Type: application/json" \
      -d "$data"
  fi
}

# 1. Register Seller
echo "1️⃣  Registering seller account..."
SELLER_REGISTER=$(api_request POST "/auth/register" '{
  "email": "'"$SELLER_EMAIL"'",
  "password": "'"$PASSWORD"'",
  "name": "Test Seller",
  "role": "seller",
  "phone": "010-1234-5678",
  "kakao_id": "test_seller"
}')

echo "$SELLER_REGISTER" | jq '.'
echo ""

# 2. Register Buyer
echo "2️⃣  Registering buyer account..."
BUYER_REGISTER=$(api_request POST "/auth/register" '{
  "email": "'"$BUYER_EMAIL"'",
  "password": "'"$PASSWORD"'",
  "name": "Test Buyer",
  "role": "user",
  "phone": "010-9876-5432",
  "kakao_id": "test_buyer"
}')

echo "$BUYER_REGISTER" | jq '.'
echo ""

# 3. Login as Seller
echo "3️⃣  Logging in as seller..."
SELLER_LOGIN=$(api_request POST "/auth/login" '{
  "email": "'"$SELLER_EMAIL"'",
  "password": "'"$PASSWORD"'"
}')

SELLER_TOKEN=$(echo "$SELLER_LOGIN" | jq -r '.token')
echo "✓ Seller token: ${SELLER_TOKEN:0:50}..."
echo ""

# 4. Login as Buyer
echo "4️⃣  Logging in as buyer..."
BUYER_LOGIN=$(api_request POST "/auth/login" '{
  "email": "'"$BUYER_EMAIL"'",
  "password": "'"$PASSWORD"'"
}')

BUYER_TOKEN=$(echo "$BUYER_LOGIN" | jq -r '.token')
echo "✓ Buyer token: ${BUYER_TOKEN:0:50}..."
echo ""

# 5. Test Seller - Access Seller Analytics (should succeed)
echo "5️⃣  Testing seller access to seller analytics..."
SELLER_ANALYTICS=$(api_request GET "/analytics/seller/overview?period=30d" "" "$SELLER_TOKEN")
if echo "$SELLER_ANALYTICS" | jq -e '.error' > /dev/null; then
  echo "❌ FAIL: Seller cannot access seller analytics"
  echo "$SELLER_ANALYTICS" | jq '.'
else
  echo "✅ PASS: Seller can access seller analytics"
fi
echo ""

# 6. Test Buyer - Access Seller Analytics (should fail)
echo "6️⃣  Testing buyer access to seller analytics (should be blocked)..."
BUYER_SELLER_ANALYTICS=$(api_request GET "/analytics/seller/overview?period=30d" "" "$BUYER_TOKEN")
if echo "$BUYER_SELLER_ANALYTICS" | jq -e '.error' > /dev/null; then
  echo "✅ PASS: Buyer correctly blocked from seller analytics"
  echo "$BUYER_SELLER_ANALYTICS" | jq '.'
else
  echo "❌ FAIL: Buyer should not access seller analytics"
fi
echo ""

# 7. Test Buyer - Access Buyer Analytics (should succeed)
echo "7️⃣  Testing buyer access to buyer analytics..."
BUYER_ANALYTICS=$(api_request GET "/analytics/buyer/overview?period=30d" "" "$BUYER_TOKEN")
if echo "$BUYER_ANALYTICS" | jq -e '.error' > /dev/null; then
  echo "❌ FAIL: Buyer cannot access buyer analytics"
  echo "$BUYER_ANALYTICS" | jq '.'
else
  echo "✅ PASS: Buyer can access buyer analytics"
fi
echo ""

# 8. Test Seller - Access Buyer Analytics (should fail)
echo "8️⃣  Testing seller access to buyer analytics (should be blocked)..."
SELLER_BUYER_ANALYTICS=$(api_request GET "/analytics/buyer/overview?period=30d" "" "$SELLER_TOKEN")
if echo "$SELLER_BUYER_ANALYTICS" | jq -e '.error' > /dev/null; then
  echo "✅ PASS: Seller correctly blocked from buyer analytics"
  echo "$SELLER_BUYER_ANALYTICS" | jq '.'
else
  echo "❌ FAIL: Seller should not access buyer analytics"
fi
echo ""

# 9. Test Product Creation - Seller (should succeed)
echo "9️⃣  Testing seller product creation..."
PRODUCT_CREATE=$(api_request POST "/products" '{
  "name": "Test AI Agent",
  "description": "Test product for automation",
  "category": "ai_agent",
  "pricing_model": "one_time",
  "price": 50000,
  "currency": "KRW"
}' "$SELLER_TOKEN")

if echo "$PRODUCT_CREATE" | jq -e '.error' > /dev/null; then
  echo "❌ FAIL: Seller cannot create product"
  echo "$PRODUCT_CREATE" | jq '.'
else
  echo "✅ PASS: Seller can create product"
  PRODUCT_ID=$(echo "$PRODUCT_CREATE" | jq -r '.id')
  echo "Product ID: $PRODUCT_ID"
fi
echo ""

# 10. Test Product Creation - Buyer (should fail)
echo "🔟 Testing buyer product creation (should be blocked)..."
BUYER_PRODUCT=$(api_request POST "/products" '{
  "name": "Buyer Product",
  "description": "Should not be created",
  "category": "ai_agent",
  "pricing_model": "one_time",
  "price": 10000,
  "currency": "KRW"
}' "$BUYER_TOKEN")

if echo "$BUYER_PRODUCT" | jq -e '.error' > /dev/null; then
  echo "✅ PASS: Buyer correctly blocked from creating product"
  echo "$BUYER_PRODUCT" | jq '.'
else
  echo "❌ FAIL: Buyer should not be able to create product"
fi
echo ""

echo "=========================================="
echo "✅ Authentication Flow Test Complete!"
echo "=========================================="
echo ""
echo "Summary:"
echo "- Middleware: Protects routes based on roles"
echo "- API Auth: Enforces role-based access control"
echo "- Seller can: Create products, access seller analytics"
echo "- Buyer can: Access buyer analytics, browse products"
echo ""
echo "🌐 Open http://localhost:3000 to test in browser:"
echo "   - Seller: $SELLER_EMAIL / $PASSWORD"
echo "   - Buyer: $BUYER_EMAIL / $PASSWORD"
