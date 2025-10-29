# Quick test script for SePay webhook (Windows PowerShell)

Write-Host "╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║           🧪 SePay Webhook Quick Test 🧪                 ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$BASE_URL = "http://localhost:5000"

# Test 1: Server running?
Write-Host "1️⃣  Checking if server is running..." -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri "$BASE_URL/payment/test" -UseBasicParsing -ErrorAction Stop
    Write-Host "✅ Server is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Server is NOT running!" -ForegroundColor Red
    Write-Host "   → Please start: npm run dev" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Test 2: Payment routes registered?
Write-Host "2️⃣  Testing payment routes..." -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/payment/test" -Method Get
    if ($response.success) {
        Write-Host "✅ Payment routes OK" -ForegroundColor Green
        Write-Host "   Endpoints available:" -ForegroundColor Gray
        foreach ($endpoint in $response.endpoints.PSObject.Properties) {
            Write-Host "   - $($endpoint.Name): $($endpoint.Value)" -ForegroundColor Gray
        }
    }
} catch {
    Write-Host "❌ Payment routes failed" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Test 3: Webhook endpoints accessible?
Write-Host "3️⃣  Testing webhook endpoints..." -ForegroundColor Yellow

$endpoints = @(
    "/payment/webhook/sepay",
    "/payment/webhook",
    "/api/payment/webhook/sepay"
)

foreach ($endpoint in $endpoints) {
    try {
        $response = Invoke-WebRequest -Uri "$BASE_URL$endpoint" -Method Get -UseBasicParsing -ErrorAction Stop
        Write-Host "✅ GET $endpoint - Status: $($response.StatusCode)" -ForegroundColor Green
    } catch {
        Write-Host "❌ GET $endpoint - FAILED" -ForegroundColor Red
    }
}

Write-Host ""

# Test 4: Run full test suite
Write-Host "4️⃣  Running full test suite..." -ForegroundColor Yellow
Write-Host "   (This will test with SePay real data format)" -ForegroundColor Gray
Write-Host ""

node test-sepay-webhook.js

Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                    ✅ Test Complete!                      ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""
Write-Host "📌 Next steps:" -ForegroundColor Yellow
Write-Host "   1. Make sure ngrok is running: ngrok http 5000" -ForegroundColor White
Write-Host "   2. Update SePay webhook URL with your ngrok URL" -ForegroundColor White
Write-Host "   3. Test real payment!" -ForegroundColor White
Write-Host ""

