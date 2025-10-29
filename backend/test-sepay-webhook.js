const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

/**
 * Test webhook với data giống như SePay thực tế gửi
 * Dựa trên log: "BankAPINotify Qaetep9929 SEPAY6747 1 103968932085-DH95295F-CHUYEN TIEN..."
 */
async function testRealSepayWebhook() {
  console.log('🧪 Testing Webhook với SePay real data format...\n');

  // Danh sách paymentId từ DB (lấy từ log)
  const testBookings = [
    { id: '68ee3ab1a3dab92dad952915', paymentId: 'DH952915' },
    { id: '68ee39b4a3dab92dad9528c4', paymentId: 'DH9528C4' }
  ];

  for (const booking of testBookings) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📝 Testing với booking: ${booking.id}`);
    console.log(`   PaymentId trong DB: ${booking.paymentId}`);
    console.log(`${'='.repeat(60)}\n`);

    // Simulate SePay webhook data - format giống thực tế
    const sepayWebhookData = {
      id: 123456789,
      gateway: "MoMo",
      transactionDate: "2025-10-14 19:00:00",
      accountNumber: "103968932085",
      subAccount: null,
      transferType: "in",
      transferAmount: 100000,
      accumulated: 5000000,
      code: "MOMO103968932085MOMO",
      // Description giống format thực tế từ SePay
      content: `BankAPINotify Qaetep9929  SEPAY6747 1  103968932085-${booking.paymentId}-CHUYEN TIEN-OQCH0002sFyH-MOMO103968932085MOMO`,
      description: `BankAPINotify Qaetep9929  SEPAY6747 1  103968932085-${booking.paymentId}-CHUYEN TIEN-OQCH0002sFyH-MOMO103968932085MOMO`,
      referenceCode: "OQCH0002sFyH",
      body: null
    };

    console.log('📤 Sending webhook to /payment/webhook/sepay');
    console.log('📦 Payload description:', sepayWebhookData.description.substring(0, 80) + '...');
    console.log('🎯 Expected extracted paymentId:', booking.paymentId);
    console.log('');

    try {
      const response = await axios.post(
        `${BASE_URL}/payment/webhook/sepay`,
        sepayWebhookData
      );

      console.log('✅ SUCCESS!');
      console.log('📬 Response:', JSON.stringify(response.data, null, 2));
      console.log('');
    } catch (error) {
      if (error.response) {
        console.log('❌ FAILED!');
        console.log('   Status:', error.response.status);
        console.log('   Error:', JSON.stringify(error.response.data, null, 2));
      } else {
        console.log('❌ Network error:', error.message);
      }
      console.log('');
    }

    // Delay giữa các requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n' + '='.repeat(60));
  console.log('🏁 Test completed!');
  console.log('='.repeat(60));
}

/**
 * Test với các format description khác nhau
 */
async function testVariousFormats() {
  console.log('\n\n🔍 Testing various description formats...\n');

  const testCases = [
    {
      name: 'Simple format',
      data: { content: 'DH952915' }
    },
    {
      name: 'With prefix',
      data: { content: 'CHUYEN TIEN DH952915' }
    },
    {
      name: 'Complex format (real SePay)',
      data: { content: 'BankAPINotify-DH952915-CHUYEN TIEN-MOMO' }
    },
    {
      name: 'Lowercase',
      data: { content: 'chuyen tien dh952915 momo' }
    },
    {
      name: 'Using des field',
      data: { des: 'Transfer DH952915 payment' }
    },
    {
      name: 'Invalid - no payment ID',
      data: { content: 'Just a transfer' }
    }
  ];

  for (const testCase of testCases) {
    console.log(`\n📋 Test: ${testCase.name}`);
    console.log(`   Data: ${JSON.stringify(testCase.data)}`);
    
    try {
      const response = await axios.post(
        `${BASE_URL}/payment/webhook/sepay`,
        testCase.data
      );
      console.log(`   ✅ Result: ${response.data.ok ? 'SUCCESS' : 'FAILED'}`);
    } catch (error) {
      console.log(`   ❌ Error: ${error.response?.data?.error || error.message}`);
    }
  }
}

/**
 * Test health check endpoints
 */
async function testHealthChecks() {
  console.log('\n\n🏥 Testing health check endpoints...\n');

  const endpoints = [
    '/payment/webhook',
    '/payment/webhook/sepay',
    '/api/payment/webhook/sepay',
    '/payment/test'
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await axios.get(`${BASE_URL}${endpoint}`);
      console.log(`✅ GET ${endpoint} - Status: ${response.status}`);
    } catch (error) {
      console.log(`❌ GET ${endpoint} - Status: ${error.response?.status || 'Failed'}`);
    }
  }
}

async function runAllTests() {
  console.log('\n');
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║         🧪 SePay Webhook Integration Tests 🧪            ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');
  
  try {
    await testHealthChecks();
    await testRealSepayWebhook();
    await testVariousFormats();
    
    console.log('\n\n✅ All tests completed!\n');
  } catch (error) {
    console.error('\n\n❌ Test suite failed:', error.message);
  }
}

runAllTests();

