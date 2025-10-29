const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testWebhook() {
  console.log('🧪 Testing Webhook Endpoints...\n');

  try {
    // Test 1: Test endpoint
    console.log('1️⃣ Testing /payment/test');
    const test = await axios.get(`${BASE_URL}/payment/test`);
    console.log('✅ Response:', test.data);
    console.log('');

    // Test 2: GET /payment/webhook/sepay
    console.log('2️⃣ Testing GET /payment/webhook/sepay');
    const healthCheck = await axios.get(`${BASE_URL}/payment/webhook/sepay`);
    console.log('✅ Response:', healthCheck.data);
    console.log('');

    // Test 3: POST /payment/webhook/sepay with mock data
    console.log('3️⃣ Testing POST /payment/webhook/sepay with mock data');
    const webhookData = {
      id: 'test123',
      amount: 100000,
      des: 'DH123456', // Mock payment ID
      content: 'Test payment',
      transferType: 'in',
      transferAmount: 100000,
      accountNumber: '0123456789'
    };
    
    try {
      const webhook = await axios.post(`${BASE_URL}/payment/webhook/sepay`, webhookData);
      console.log('✅ Response:', webhook.data);
    } catch (error) {
      console.log('⚠️  Expected error (booking not found):', error.response?.data);
    }
    console.log('');

    console.log('🎉 All webhook endpoints are accessible!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
}

// Test alternate routes too
async function testAllRoutes() {
  const routes = [
    '/api/payments/test',
    '/api/payment/test', 
    '/payment/test',
    '/payment/webhook/sepay',
    '/api/payment/webhook/sepay',
    '/api/payments/webhook/sepay'
  ];

  console.log('\n🔍 Testing all route variations:\n');
  
  for (const route of routes) {
    try {
      const response = await axios.get(`${BASE_URL}${route}`);
      console.log(`✅ ${route} - Status: ${response.status}`);
    } catch (error) {
      console.log(`❌ ${route} - Status: ${error.response?.status || 'No response'}`);
    }
  }
}

async function runTests() {
  await testWebhook();
  await testAllRoutes();
}

runTests();

