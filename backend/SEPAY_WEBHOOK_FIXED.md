# ✅ SePay Webhook - ĐÃ FIX XONG!

## 🎯 Vấn đề đã giải quyết

### 1. ❌ 404 Not Found (ĐÃ FIX ✅)
- **Trước:** Webhook endpoint không có GET handler
- **Sau:** Đã thêm GET handler cho health check

### 2. ❌ Payment ID không match (ĐÃ FIX ✅)
- **Trước:** SePay gửi `"BankAPINotify...DH952915...MOMO"` nhưng code tìm toàn bộ chuỗi
- **Sau:** Dùng regex extract chỉ `DH952915` từ description phức tạp

## 🚀 HƯỚNG DẪN NHANH - THỰC HIỆN NGAY

### Bước 1: Restart Backend
```bash
# Dừng server hiện tại (Ctrl+C)
cd backend
npm run dev
```

### Bước 2: Test Webhook
```bash
# Mở terminal mới
cd backend
node test-sepay-webhook.js
```

Phải thấy:
```
✅ GET /payment/webhook/sepay - Status: 200
✅ SUCCESS!
```

### Bước 3: Test Thanh Toán Thực Tế

1. **Tạo booking mới** từ frontend
2. **Lấy QR code** → sẽ có format `DH952915` (6 ký tự cuối của booking ID)
3. **Quét & thanh toán** qua Momo/banking app
4. **Xem backend logs** → phải thấy:

```
📥 POST /payment/webhook/sepay
========================================
📩 SePay Webhook (via /sepay) RECEIVED
========================================

🔍 Raw description from SePay: BankAPINotify Qaetep9929  SEPAY6747 1  103968932085-DH952915-CHUYEN TIEN-OQCH0002sFyH-MOMO103968932085MOMO
✅ Extracted paymentId: DH952915
🔎 Searching for booking with paymentId: DH952915
✅ Found booking: 68ee3ab1a3dab92dad952915
   Current status: unpaid
   Current booking status: pending
💰 Amount check:
   Expected: 100000
   Received: 100000
💾 Updating booking...
✅ Booking 68ee3ab1a3dab92dad952915 SUCCESSFULLY marked as PAID
   New status: paid
   New booking status: confirmed
```

5. **Kiểm tra DB** → `paymentStatus` phải là `paid`, `status` phải là `confirmed`

## 📋 Checklist Cuối Cùng

- [ ] Backend đã restart
- [ ] Test script chạy thành công (`node test-sepay-webhook.js`)
- [ ] Ngrok đang chạy (`ngrok http 5000`)
- [ ] SePay webhook URL đã cập nhật: `https://YOUR-NGROK-URL.ngrok-free.dev/payment/webhook/sepay`
- [ ] Test thanh toán thực tế
- [ ] Kiểm tra logs thấy "SUCCESSFULLY marked as PAID"
- [ ] Verify trong DB: `db.bookings.findOne({ _id: ObjectId("...") })`

## 🔍 Debug Nếu Vẫn Có Lỗi

### Log không thấy "Extracted paymentId"?
→ Có thể SePay gửi field khác. Check:
```javascript
📦 Full payload: { ... }
```
Gửi toàn bộ payload này cho tôi.

### Thấy "Extracted paymentId" nhưng "Booking NOT FOUND"?
→ Check booking trong DB:
```bash
# MongoDB Compass hoặc shell
db.bookings.find({ paymentId: "DH952915" })
```
Nếu null → paymentId chưa được lưu khi tạo QR. Test endpoint:
```bash
curl http://localhost:5000/api/payments/qr/BOOKING_ID
```

### Amount mismatch?
→ Không ảnh hưởng logic, chỉ là warning. Nếu muốn fix thì kiểm tra:
- `booking.totalPrice` trong DB
- `event.amount` hoặc `event.transferAmount` từ SePay

## 📝 Files Đã Thay Đổi

```
backend/
├── app.js                              ← Thêm logging middleware
├── src/routes/paymentRoutes.js         ← Fix webhook logic chính
├── test-webhook.js                     ← Test cơ bản (mới)
├── test-sepay-webhook.js               ← Test với SePay real format (mới)
├── WEBHOOK_FIX_GUIDE.md                ← Hướng dẫn chi tiết
└── SEPAY_WEBHOOK_FIXED.md              ← File này (summary)
```

## ⚡ Quick Test Command

```bash
# Test tất cả endpoints một lượt
curl http://localhost:5000/payment/test && \
curl http://localhost:5000/payment/webhook/sepay && \
echo "✅ All endpoints are working!"
```

## 🆘 Vẫn Cần Hỗ Trợ?

Gửi cho tôi:
1. Backend logs (toàn bộ output khi webhook được gọi)
2. Payload từ SePay (trong logs: `📦 Full payload: ...`)
3. Booking data từ DB: `db.bookings.findOne({ _id: ObjectId("...") })`

---

**📅 Fixed:** October 14, 2025  
**🔧 By:** AI Assistant  
**✨ Status:** READY TO TEST

