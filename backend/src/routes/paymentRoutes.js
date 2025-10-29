const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const { SEPAY_VA, SEPAY_BANK, SEPAY_API_KEY } = process.env;

// 🧪 Test endpoint để verify routing
router.get('/test', (req, res) => {
  console.log('✅ Payment routes are working!');
  res.json({ 
    success: true, 
    message: 'Payment routes are registered correctly',
    endpoints: {
      qr: '/qr/:bookingId',
      webhook: '/webhook (GET/POST)',
      webhookSepay: '/webhook/sepay (GET/POST)',
      status: '/status/:bookingId'
    }
  });
});

/**
 * 1️⃣ Tạo QR thanh toán cho booking
 * GET /api/payments/qr/:bookingId
 */
router.get('/qr/:bookingId', async (req, res) => {
  try {
    const { bookingId } = req.params;
    
    // Validate ObjectId format
    if (!bookingId || !bookingId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid booking ID format' 
      });
    }

    const booking = await Booking.findById(bookingId).populate('userId fieldId');

    if (!booking) {
      return res.status(404).json({ 
        success: false,
        error: 'Booking not found' 
      });
    }

    // Nếu đã thanh toán rồi thì không cần tạo QR
    if (booking.paymentStatus === 'paid') {
      return res.status(400).json({ error: 'Booking already paid' });
    }

    // Tạo mã mô tả (description) duy nhất cho booking — VD: DH<id rút gọn>
    const shortId = booking._id.toString().slice(-6).toUpperCase();
    const description = `DH${shortId}`;

    // Sinh link QR SePay
    const qrUrl = `https://qr.sepay.vn/img?acc=${SEPAY_VA}&bank=${SEPAY_BANK}&amount=${booking.totalPrice}&des=${description}`;

    // Lưu mô tả để đối chiếu khi nhận webhook
    booking.paymentMethod = 'sepay_qr';
    booking.paymentId = description;
    booking.status = 'pending';
    booking.paymentStatus = 'unpaid';
    await booking.save();

    // Trả về QR cho frontend hiển thị
    res.json({
      success: true,
      bookingId,
      total: booking.totalPrice,
      description,
      qrUrl
    });
  } catch (error) {
    console.error('Error generating QR:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * 2️⃣ Webhook từ SePay khi thanh toán xong
 * POST /api/payments/webhook
 * POST /api/payments/webhook/sepay (alias for SePay)
 */

// GET handler for health check
router.get('/webhook', (req, res) => {
  console.log('🏥 Webhook Health Check (GET)');
  res.status(200).json({ 
    status: 'ok', 
    message: 'Webhook endpoint is ready',
    timestamp: new Date().toISOString()
  });
});

router.post('/webhook', async (req, res) => {
  try {
    const event = req.body;
    console.log('📩 SePay Webhook:', event);

    // Xác thực webhook từ SePay (nếu SePay gửi kèm signature hoặc token)
    // Uncomment nếu SePay hỗ trợ verify
    // const signature = req.headers['x-sepay-signature'];
    // if (!verifySignature(event, signature, SEPAY_API_KEY)) {
    //   return res.status(401).json({ error: 'Invalid signature' });
    // }

    // Tìm description từ nhiều field khả dĩ
    const rawDescription = event?.des || 
                           event?.description || 
                           event?.content || 
                           event?.transferContent ||
                           event?.message;

    if (!rawDescription) {
      return res.status(400).json({ error: 'Missing description in webhook' });
    }

    // Extract payment ID (format: DHxxxxxx) 
    const paymentIdMatch = rawDescription.match(/DH[A-Z0-9]{6}/i);
    
    if (!paymentIdMatch) {
      console.log('❌ Could not extract payment ID from:', rawDescription);
      return res.status(400).json({ 
        error: 'Invalid payment ID format',
        rawDescription: rawDescription
      });
    }

    const paymentId = paymentIdMatch[0].toUpperCase();
    console.log('✅ Extracted paymentId:', paymentId, 'from:', rawDescription);

    // Tìm booking theo paymentId (case-insensitive)
    const booking = await Booking.findOne({ 
      paymentId: { $regex: new RegExp(`^${paymentId}$`, 'i') }
    });
    
    if (!booking) {
      console.log('❌ Booking not found for:', paymentId);
      return res.status(404).json({ 
        error: 'Booking not found for this payment',
        paymentId: paymentId
      });
    }

    // Kiểm tra số tiền có khớp không (optional nhưng nên có)
    const receivedAmount = event?.amount || event?.transferAmount;
    if (receivedAmount && receivedAmount !== booking.totalPrice) {
      console.warn(`⚠️ Amount mismatch: expected ${booking.totalPrice}, got ${receivedAmount}`);
      // Có thể return error hoặc log để kiểm tra
    }

    // Cập nhật trạng thái khi thanh toán thành công
    booking.paymentStatus = 'paid';
    booking.status = 'confirmed';
    booking.updatedAt = Date.now();
    await booking.save();

    console.log(`✅ Booking ${booking._id} marked as paid (SePay QR)`);

    res.status(200).json({ ok: true, bookingId: booking._id });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

/**
 * 3️⃣ Kiểm tra trạng thái thanh toán
 * GET /api/payments/status/:bookingId
 */
router.get('/status/:bookingId', async (req, res) => {
  try {
    const { bookingId } = req.params;
    
    // Validate ObjectId format
    if (!bookingId || !bookingId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid booking ID format' 
      });
    }

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ 
        success: false,
        error: 'Booking not found' 
      });
    }

    res.json({
      success: true,
      paymentStatus: booking.paymentStatus,
      status: booking.status,
      paymentMethod: booking.paymentMethod,
      totalPrice: booking.totalPrice
    });
  } catch (error) {
    console.error('Error checking payment status:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Health check endpoint for SePay (GET request)
router.get('/webhook/sepay', (req, res) => {
  console.log('🏥 SePay Webhook Health Check (GET)');
  res.status(200).json({ 
    status: 'ok', 
    message: 'SePay webhook endpoint is ready',
    timestamp: new Date().toISOString()
  });
});

// Alias route for SePay (nếu SePay gọi /webhook/sepay)
router.post('/webhook/sepay', async (req, res) => {
  try {
    const event = req.body;
    console.log('\n========================================');
    console.log('📩 SePay Webhook (via /sepay) RECEIVED');
    console.log('📦 Full payload:', JSON.stringify(event, null, 2));
    console.log('========================================\n');

    // Tìm description từ nhiều field khả dĩ
    const rawDescription = event?.des || 
                           event?.description || 
                           event?.content || 
                           event?.transferContent ||
                           event?.message;

    console.log('🔍 Raw description from SePay:', rawDescription);
    console.log('🔍 Checked fields: des, description, content, transferContent, message');

    if (!rawDescription) {
      console.log('❌ Missing description in webhook!');
      console.log('   Available fields:', Object.keys(event));
      return res.status(400).json({ error: 'Missing description in webhook', receivedFields: Object.keys(event) });
    }

    // 🔍 Extract payment ID từ description (format: DHxxxxxx)
    // SePay có thể gửi chuỗi dài kiểu: "BankAPINotify ... DH95295F ... MOMO"
    // Ta cần tìm pattern "DH" followed by exactly 6 ký tự (vì slice(-6))
    const paymentIdMatch = rawDescription.match(/DH[A-Z0-9]{6}/i);
    
    if (!paymentIdMatch) {
      console.log('❌ Could not extract payment ID from description!');
      console.log('   Raw description:', rawDescription);
      return res.status(400).json({ 
        error: 'Invalid payment ID format in description',
        rawDescription: rawDescription
      });
    }

    const paymentId = paymentIdMatch[0].toUpperCase();
    console.log('✅ Extracted paymentId:', paymentId);
    console.log('   From raw description:', rawDescription);

    // Tìm booking (case-insensitive search)
    console.log('🔎 Searching for booking with paymentId:', paymentId);
    const booking = await Booking.findOne({ 
      paymentId: { $regex: new RegExp(`^${paymentId}$`, 'i') }
    });
    
    if (!booking) {
      console.log('❌ Booking NOT FOUND for paymentId:', paymentId);
      
      // Debug: show all recent bookings
      const recentBookings = await Booking.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('_id paymentId paymentStatus createdAt');
      
      console.log('📋 Recent bookings in DB:');
      recentBookings.forEach(b => {
        console.log(`   - ID: ${b._id}, paymentId: ${b.paymentId || 'NOT SET'}, status: ${b.paymentStatus}`);
      });
      
      return res.status(404).json({ 
        error: 'Booking not found for this payment',
        searchedFor: paymentId,
        rawDescription: rawDescription,
        recentBookings: recentBookings.map(b => ({ id: b._id, paymentId: b.paymentId }))
      });
    }

    console.log('✅ Found booking:', booking._id);
    console.log('   Current status:', booking.paymentStatus);
    console.log('   Current booking status:', booking.status);

    const receivedAmount = event?.amount || 
                          event?.transferAmount || 
                          event?.value ||
                          event?.price;
    console.log('💰 Amount check:');
    console.log('   Expected:', booking.totalPrice);
    console.log('   Received:', receivedAmount);
    console.log('   Checked fields: amount, transferAmount, value, price');
    
    if (receivedAmount && receivedAmount !== booking.totalPrice) {
      console.warn(`⚠️ Amount mismatch: expected ${booking.totalPrice}, got ${receivedAmount}`);
    }

    // Update booking
    console.log('💾 Updating booking...');
    booking.paymentStatus = 'paid';
    booking.status = 'confirmed';
    booking.updatedAt = Date.now();
    await booking.save();

    console.log(`✅ Booking ${booking._id} SUCCESSFULLY marked as PAID`);
    console.log('   New status:', booking.paymentStatus);
    console.log('   New booking status:', booking.status);

    res.status(200).json({ 
      ok: true,
      bookingId: booking._id,
      newStatus: booking.paymentStatus
    });
  } catch (error) {
    console.error('❌ Webhook error:', error);
    console.error('   Stack:', error.stack);
    res.status(500).json({ ok: false, error: error.message });
  }
});

module.exports = router;

