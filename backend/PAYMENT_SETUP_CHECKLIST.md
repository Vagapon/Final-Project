# ✅ Payment Integration Checklist

## 📋 Tổng quan
Tích hợp thanh toán SePay QR vào flow booking field.

---

## 🔧 Backend Setup

### 1. Environment Variables (.env)
```env
SEPAY_VA=0123456789           # Số tài khoản nhận tiền
SEPAY_BANK=MB                 # Mã ngân hàng (MB, VCB, TCB, etc.)
SEPAY_API_KEY=your-api-key    # API key từ SePay
```

### 2. Files Created/Modified
- ✅ `src/routes/paymentRoutes.js` - Payment routes
- ✅ `src/models/Payment.js` - Payment model (optional)
- ✅ `src/models/Booking.js` - Already has payment fields
- ✅ `app.js` - Registered payment routes

### 3. API Endpoints
- `GET /api/payments/qr/:bookingId` - Tạo QR code
- `POST /api/payments/webhook` - Nhận webhook từ SePay
- `GET /api/payments/status/:bookingId` - Kiểm tra trạng thái

---

## 🎨 Frontend Setup

### 1. Files Created/Modified
- ✅ `api/paymentManagement/paymentApi.js` - API client
- ✅ `api/paymentManagement/paymentService.js` - Business logic
- ✅ `api/paymentManagement/index.js` - Exports
- ✅ `api/index.js` - Added payment export
- ✅ `components/Booking/Step2Content.jsx` - QR display
- ✅ `components/Payment/PaymentQRModal.jsx` - Modal component
- ✅ `components/Payment/PaymentStatus.jsx` - Status component
- ✅ `pages/FieldBooking/BookingPage.jsx` - Integrated payment flow

### 2. Environment Variables (.env)
```env
VITE_API_URL=http://localhost:5000
```

---

## 🔄 Payment Flow

### Step 1: Chọn Time Slot
1. User chọn ngày, giờ
2. Nhập thông tin
3. Click "Tiếp tục"
   - ✅ Tạo booking (status: pending, paymentStatus: unpaid)
   - ✅ Generate QR code
   - ✅ Chuyển sang Step 2

### Step 2: Thanh Toán
1. Hiển thị QR code
2. User quét & chuyển khoản
3. Poll payment status mỗi 3 giây
4. Khi thanh toán thành công → Step 3

### Step 3: Xác Nhận
1. Hiển thị thông tin booking
2. Xác nhận thành công

---

## 🧪 Testing Checklist

### Local Development
- [ ] Backend chạy: `npm run dev` (port 5000)
- [ ] Frontend chạy: `npm run dev` (port 5173)
- [ ] Test tạo QR: `curl http://localhost:5000/api/payments/qr/[bookingId]`

### QR Code Testing
- [ ] QR code hiển thị đúng
- [ ] Số tiền hiển thị đúng
- [ ] Nội dung CK đúng format (DHxxxxxx)
- [ ] Countdown timer hoạt động

### Webhook Testing (Ngrok)
```bash
# 1. Install ngrok
# 2. Expose local server
ngrok http 5000

# 3. Copy URL (ví dụ: https://abc123.ngrok.io)
# 4. Cấu hình webhook trong SePay dashboard:
#    https://abc123.ngrok.io/api/payments/webhook

# 5. Test webhook manually
curl -X POST http://localhost:5000/api/payments/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "des": "DH123DEF",
    "amount": 500000,
    "transactionId": "FT12345678"
  }'
```

### Payment Status Polling
- [ ] Polling bắt đầu khi vào Step 2
- [ ] Polling stop khi thanh toán thành công
- [ ] Tự động chuyển sang Step 3 sau khi paid
- [ ] Cleanup interval khi unmount

---

## 🔒 Security Checklist

- [ ] Verify webhook signature (nếu SePay hỗ trợ)
- [ ] Validate payment amount matches booking
- [ ] Prevent duplicate payment processing
- [ ] Handle expired QR codes (15 phút)
- [ ] Rate limiting for webhook endpoint
- [ ] HTTPS in production

---

## 🚀 Production Deployment

### Backend
- [ ] Set proper ENV variables
- [ ] Deploy with HTTPS
- [ ] Configure SePay webhook URL: `https://yourdomain.com/api/payments/webhook`
- [ ] Setup monitoring & alerts
- [ ] Log all payment transactions

### Frontend
- [ ] Update `VITE_API_URL` to production URL
- [ ] Build: `npm run build`
- [ ] Deploy to hosting (Netlify, Vercel, etc.)

---

## 📊 Monitoring

### What to Monitor
- Payment success rate
- Webhook response time
- QR code generation failures
- Payment timeout rate
- Duplicate transactions

### Logging
```javascript
// Trong webhook handler
console.log('Payment webhook:', {
  bookingId,
  amount,
  status,
  timestamp: new Date()
});
```

---

## 🐛 Common Issues & Solutions

### Issue: QR không hiển thị
**Solution:** 
- Check SEPAY_VA, SEPAY_BANK trong .env
- Kiểm tra bookingId có tồn tại
- Check CORS settings

### Issue: Webhook không nhận được
**Solution:**
- Verify webhook URL trong SePay dashboard
- Check firewall/security groups
- Test với ngrok locally

### Issue: Payment status không update
**Solution:**
- Check webhook handler logic
- Verify paymentId format
- Check database connection

### Issue: Countdown hết thời gian
**Solution:**
- Cho phép tạo QR mới
- Update expiry logic
- Notify user

---

## 📞 Support Resources

- **SePay Docs**: https://docs.sepay.vn
- **SePay Dashboard**: https://my.sepay.vn
- **Backend Guide**: `SEPAY_INTEGRATION.md`
- **API Docs**: `backend/src/routes/paymentRoutes.js`

---

## ✨ Next Steps (Optional Enhancements)

- [ ] Add payment history page
- [ ] Email notification on payment success
- [ ] SMS notification
- [ ] Refund functionality
- [ ] Multiple payment methods (MoMo, VNPay)
- [ ] Payment analytics dashboard
- [ ] Scheduled payments for recurring bookings
- [ ] Payment receipts/invoices

---

## 📝 Notes

1. **Testing với tiền thật**: Chỉ test khi đã có môi trường sandbox từ SePay
2. **Webhook retry**: SePay có thể gửi lại webhook nếu không nhận được response 200
3. **Idempotency**: Luôn check `paymentStatus` trước khi update để tránh xử lý duplicate
4. **Timeout**: QR code expire sau 15 phút, cần implement logic tạo mới

---

Hoàn thành checklist này để đảm bảo payment integration hoạt động ổn định! 🎉

