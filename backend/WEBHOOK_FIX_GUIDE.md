# 🔧 Hướng dẫn Fix Webhook SePay

## ❌ Vấn đề
- Ngrok log hiển thị **404 Not Found** cho tất cả requests đến `/payment/webhook/sepay`
- Thanh toán qua SePay nhưng status vẫn là **unpaid** trong database

## ✅ Đã sửa

### 1. **Thêm GET handler cho webhook** 
SePay có thể gửi GET request để health check trước khi gửi webhook thực sự.

```javascript
// Đã thêm vào paymentRoutes.js
router.get('/webhook/sepay', (req, res) => {
  res.status(200).json({ status: 'ok' });
});
```

### 2. **Thêm logging middleware**
Để debug và xem tất cả requests đến server.

```javascript
// Đã thêm vào app.js
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.path}`);
  next();
});
```

### 3. **Thêm test endpoint**
Để verify rằng payment routes hoạt động đúng.

```javascript
router.get('/test', (req, res) => {
  res.json({ success: true, message: 'Payment routes OK' });
});
```

### 4. **🔥 FIX QUAN TRỌNG: Extract Payment ID từ description phức tạp**

**Vấn đề:** SePay gửi description dài dòng như:
```
BankAPINotify Qaetep9929  SEPAY6747 1  103968932085-DH95295F-CHUYEN TIEN-OQCH0002sFyH-MOMO103968932085MOMO
```

Nhưng `paymentId` trong DB chỉ là: `DH952915`

**Giải pháp:** Dùng regex để extract payment ID:

```javascript
// Đã thêm vào paymentRoutes.js
const rawDescription = event?.des || event?.description || event?.content;
const paymentIdMatch = rawDescription.match(/DH[A-Z0-9]{6}/i);
const paymentId = paymentIdMatch[0].toUpperCase(); // "DH952915"

// Tìm booking với case-insensitive search
const booking = await Booking.findOne({ 
  paymentId: { $regex: new RegExp(`^${paymentId}$`, 'i') }
});
```

## 🚀 Các bước thực hiện

### Bước 1: Restart Backend Server

```bash
cd backend
npm run dev
```

Bạn sẽ thấy các log sau:
```
✅ MongoDB connected
✅ Payment routes registered:
   - /api/payments/*
   - /api/payment/*
   - /payment/* (for SePay webhook)
🚀 Server is running on port 5000
```

### Bước 2: Kiểm tra Ngrok

Ngrok phải đang chạy và forward đến port 5000:
```bash
ngrok http 5000
```

Lưu URL từ ngrok, ví dụ:
```
https://clarisa-isonephelic-suzan.ngrok-free.dev
```

### Bước 3: Test Webhook Endpoints (Terminal mới)

**Test cơ bản:**
```bash
cd backend
node test-webhook.js
```

**Test với SePay real data format:** (KHUYẾN KHÍCH)
```bash
cd backend
node test-sepay-webhook.js
```

Kết quả mong đợi:
```
🧪 SePay Webhook Integration Tests 🧪

🏥 Testing health check endpoints...
✅ GET /payment/webhook - Status: 200
✅ GET /payment/webhook/sepay - Status: 200
✅ GET /payment/test - Status: 200

📝 Testing với booking: 68ee3ab1a3dab92dad952915
   PaymentId trong DB: DH952915

📤 Sending webhook to /payment/webhook/sepay
📦 Payload description: BankAPINotify Qaetep9929  SEPAY6747 1  103968932085-DH952915-CHUYEN TIEN...
🎯 Expected extracted paymentId: DH952915

✅ SUCCESS!
📬 Response: { "ok": true, "bookingId": "68ee3ab1a3dab92dad952915" }

✅ All tests completed!
```

### Bước 4: Cấu hình SePay Webhook URL

Trong dashboard SePay, cập nhật webhook URL thành:
```
https://YOUR-NGROK-URL.ngrok-free.dev/payment/webhook/sepay
```

**LƯU Ý:** Thay `YOUR-NGROK-URL` bằng URL thực tế từ ngrok của bạn.

### Bước 5: Test thanh toán thực tế

1. Tạo một booking mới từ frontend
2. Lấy QR code thanh toán
3. Quét QR và thanh toán
4. Kiểm tra backend logs:

```
📥 POST /payment/webhook/sepay
========================================
📩 SePay Webhook (via /sepay) RECEIVED
📦 Full payload: { ... }
========================================
🔍 Looking for paymentId: DH123456
✅ Found booking: 507f1f77bcf86cd799439011
💾 Updating booking...
✅ Booking 507f1f77bcf86cd799439011 SUCCESSFULLY marked as PAID
```

## 🔍 Troubleshooting

### Vẫn thấy 404 sau khi restart?

**Kiểm tra 1: Routes đã đăng ký đúng chưa?**
```bash
curl http://localhost:5000/payment/test
```
Phải trả về: `{ "success": true, ... }`

**Kiểm tra 2: Ngrok forward đúng port chưa?**
```bash
curl https://YOUR-NGROK-URL.ngrok-free.dev/payment/test
```
Phải trả về tương tự như local.

**Kiểm tra 3: SePay webhook URL có đúng không?**
- Phải là: `https://YOUR-NGROK-URL.ngrok-free.dev/payment/webhook/sepay`
- KHÔNG phải: `/api/payment/webhook/sepay` (thiếu domain)
- KHÔNG phải: `http://localhost:5000/...` (SePay không thể access localhost)

### Webhook nhận được nhưng booking vẫn unpaid?

**⚠️ Vấn đề phổ biến: Description format không khớp**

SePay thường gửi description rất dài:
```
BankAPINotify Qaetep9929 SEPAY6747 1 103968932085-DH952915-CHUYEN TIEN-OQCH0002sFyH-MOMO103968932085MOMO
```

Nhưng `paymentId` trong DB của bạn chỉ là: `DH952915`

**✅ Đã fix:** Code hiện tại sẽ tự động extract `DH952915` từ chuỗi dài.

**Kiểm tra payload từ SePay:**
```javascript
// Xem trong backend logs - BÂY GIỜ sẽ thấy:
🔍 Raw description from SePay: BankAPINotify... DH952915 ...MOMO
✅ Extracted paymentId: DH952915
🔎 Searching for booking with paymentId: DH952915
✅ Found booking: 68ee3ab1a3dab92dad952915
✅ Booking 68ee3ab1a3dab92dad952915 SUCCESSFULLY marked as PAID
```

**Kiểm tra booking trong DB:**
```javascript
// MongoDB shell hoặc Compass
db.bookings.find({ paymentId: "DH952915" })
// hoặc
db.bookings.find({ paymentId: /^DH952915$/i })  // Case-insensitive
```

**Nếu vẫn không tìm thấy:**
- Kiểm tra `paymentId` có được lưu khi tạo QR không?
- Format có đúng là `DH` + 6 ký tự uppercase không?

**Kiểm tra flow tạo QR:**
```bash
# Test tạo QR
curl http://localhost:5000/api/payments/qr/BOOKING_ID
```

Response phải có:
```json
{
  "success": true,
  "description": "DH123456",  // ← Lưu lại để so sánh với webhook
  "qrUrl": "https://qr.sepay.vn/..."
}
```

## 📝 Checklist

- [ ] Backend server đã restart
- [ ] Ngrok đang chạy và forward đến port 5000
- [ ] Test endpoints thành công (`node test-webhook.js`)
- [ ] SePay webhook URL đã cập nhật đúng
- [ ] Test thanh toán thực tế
- [ ] Kiểm tra logs backend khi webhook được gọi
- [ ] Verify booking status trong DB đã chuyển thành `paid`

## 🆘 Vẫn không hoạt động?

Gửi cho tôi:
1. **Backend logs** khi webhook được gọi
2. **Ngrok logs** (HTTP requests)
3. **Payload từ SePay** (từ backend logs)
4. **Booking data** từ database (cụ thể field `paymentId`)

---

**Lưu ý quan trọng:** 
- Ngrok URL thay đổi mỗi khi restart → Phải cập nhật lại SePay webhook URL
- Nếu dùng Ngrok free plan, có thể bị limit requests
- SePay có thể gửi nhiều webhook cho cùng 1 transaction → Code đã handle (chỉ update nếu chưa paid)

