#!/bin/bash

# Quick test script for SePay webhook
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║           🧪 SePay Webhook Quick Test 🧪                 ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:5000"

# Test 1: Server running?
echo "1️⃣  Checking if server is running..."
if curl -s -f "${BASE_URL}/payment/test" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Server is running${NC}"
else
    echo -e "${RED}❌ Server is NOT running!${NC}"
    echo -e "${YELLOW}   → Please start: npm run dev${NC}"
    exit 1
fi

echo ""

# Test 2: Payment routes registered?
echo "2️⃣  Testing payment routes..."
RESPONSE=$(curl -s "${BASE_URL}/payment/test")
if echo "$RESPONSE" | grep -q "success"; then
    echo -e "${GREEN}✅ Payment routes OK${NC}"
else
    echo -e "${RED}❌ Payment routes failed${NC}"
    exit 1
fi

echo ""

# Test 3: Webhook endpoints accessible?
echo "3️⃣  Testing webhook endpoints..."

# Test GET /payment/webhook/sepay
if curl -s -f "${BASE_URL}/payment/webhook/sepay" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ GET /payment/webhook/sepay - OK${NC}"
else
    echo -e "${RED}❌ GET /payment/webhook/sepay - FAILED${NC}"
fi

# Test GET /payment/webhook
if curl -s -f "${BASE_URL}/payment/webhook" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ GET /payment/webhook - OK${NC}"
else
    echo -e "${RED}❌ GET /payment/webhook - FAILED${NC}"
fi

echo ""

# Test 4: Run full test suite
echo "4️⃣  Running full test suite..."
echo -e "${YELLOW}   (This will test with SePay real data format)${NC}"
echo ""

node test-sepay-webhook.js

echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                    ✅ Test Complete!                      ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""
echo "📌 Next steps:"
echo "   1. Make sure ngrok is running: ngrok http 5000"
echo "   2. Update SePay webhook URL with your ngrok URL"
echo "   3. Test real payment!"
echo ""

