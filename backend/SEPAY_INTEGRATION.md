# 🔐 SePay Payment Integration Guide

## 📋 Tổng quan

Hệ thống thanh toán online sử dụng **SePay QR Code** để cho phép khách hàng thanh toán booking qua chuyển khoản ngân hàng.

---

## ⚙️ Cấu hình môi trường

Thêm các biến sau vào file `.env`:

```env
SEPAY_VA=0123456789           # Số tài khoản nhận tiền
SEPAY_BANK=MB                 # Mã ngân hàng (MB, VCB, TCB, etc.)
SEPAY_API_KEY=your-api-key    # API key từ SePay dashboard
```

### Các ngân hàng được hỗ trợ:
- **MB** - MBBank
- **VCB** - Vietcombank  
- **TCB** - Techcombank
- **ACB** - ACB
- **VPB** - VPBank
- _và nhiều ngân hàng khác_

---

## 🔄 Luồng thanh toán

### 1️⃣ Tạo QR Code
**Endpoint:** `GET /api/payments/qr/:bookingId`

```javascript
// Frontend gọi API
const response = await fetch(`/api/payments/qr/${bookingId}`);
const { qrUrl, description, total } = await response.json();

// Hiển thị QR cho user quét
<img src={qrUrl} alt="QR Payment" />
```

**Response:**
```json
{
  "success": true,
  "bookingId": "675abc123def456",
  "total": 500000,
  "description": "DH123DEF",
  "qrUrl": "https://qr.sepay.vn/img?acc=0123456789&bank=MB&amount=500000&des=DH123DEF"
}
```

---

### 2️⃣ Webhook từ SePay
**Endpoint:** `POST /api/payments/webhook`

SePay sẽ tự động gửi webhook khi phát hiện giao dịch thành công.

**Webhook payload mẫu:**
```json
{
  "des": "DH123DEF",
  "amount": 500000,
  "transactionId": "FT12345678",
  "bankCode": "MB",
  "time": "2025-10-14 10:30:00"
}
```

**Xử lý:**
- Tìm booking theo `paymentId` = `des`
- Kiểm tra số tiền khớp
- Cập nhật `paymentStatus = 'paid'`, `status = 'confirmed'`

---

### 3️⃣ Kiểm tra trạng thái thanh toán
**Endpoint:** `GET /api/payments/status/:bookingId`

```javascript
// Frontend polling để check trạng thái
const checkStatus = async () => {
  const res = await fetch(`/api/payments/status/${bookingId}`);
  const { paymentStatus } = await res.json();
  
  if (paymentStatus === 'paid') {
    // Chuyển sang màn hình thành công
  }
}
```

---

## 🗄️ Database Schema

### Booking Model
```javascript
{
  paymentMethod: 'sepay_qr',
  paymentId: 'DH123DEF',        // Mã unique để đối chiếu
  paymentStatus: 'paid',         // unpaid | paid | refunded
  status: 'confirmed',           // pending | confirmed | cancelled
  totalPrice: 500000
}
```

### Payment Model (Optional - để tracking chi tiết)
```javascript
{
  bookingId: ObjectId,
  userId: ObjectId,
  amount: 500000,
  paymentMethod: 'sepay_qr',
  paymentStatus: 'completed',
  transactionId: 'FT12345678',   // Từ webhook
  paymentId: 'DH123DEF',
  webhookData: { /* raw data */ },
  paidAt: Date
}
```

---

## 🔒 Bảo mật

### 1. Verify Webhook Signature
```javascript
const crypto = require('crypto');

function verifySignature(payload, signature, apiKey) {
  const hash = crypto
    .createHmac('sha256', apiKey)
    .update(JSON.stringify(payload))
    .digest('hex');
  
  return hash === signature;
}

// Trong webhook handler
const signature = req.headers['x-sepay-signature'];
if (!verifySignature(req.body, signature, SEPAY_API_KEY)) {
  return res.status(401).json({ error: 'Invalid signature' });
}
```

### 2. Validate Amount
```javascript
if (webhookAmount !== booking.totalPrice) {
  console.error('Amount mismatch!');
  // Gửi alert cho admin
}
```

### 3. Prevent Duplicate Processing
```javascript
if (booking.paymentStatus === 'paid') {
  return res.status(200).json({ ok: true, message: 'Already processed' });
}
```

---

## 🧪 Testing

### 1. Test QR Generation
```bash
curl http://localhost:5000/api/payments/qr/675abc123def456
```

### 2. Test Webhook (local)
```bash
curl -X POST http://localhost:5000/api/payments/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "des": "DH123DEF",
    "amount": 500000,
    "transactionId": "FT12345678"
  }'
```

### 3. Expose local webhook với ngrok
```bash
ngrok http 5000
# Lấy URL: https://abc123.ngrok.io
# Cấu hình webhook URL trong SePay dashboard:
# https://abc123.ngrok.io/api/payments/webhook
```

---

## 📱 Frontend Integration

### React Example
```jsx
import { useState, useEffect } from 'react';

function PaymentQR({ bookingId }) {
  const [qrData, setQrData] = useState(null);
  const [status, setStatus] = useState('pending');

  // 1. Load QR
  useEffect(() => {
    fetch(`/api/payments/qr/${bookingId}`)
      .then(res => res.json())
      .then(data => setQrData(data));
  }, [bookingId]);

  // 2. Poll payment status
  useEffect(() => {
    const interval = setInterval(async () => {
      const res = await fetch(`/api/payments/status/${bookingId}`);
      const { paymentStatus } = await res.json();
      
      if (paymentStatus === 'paid') {
        setStatus('paid');
        clearInterval(interval);
      }
    }, 3000); // Check mỗi 3 giây

    return () => clearInterval(interval);
  }, [bookingId]);

  if (status === 'paid') {
    return <div>✅ Thanh toán thành công!</div>;
  }

  return (
    <div>
      <h3>Quét mã QR để thanh toán</h3>
      {qrData && (
        <>
          <img src={qrData.qrUrl} alt="QR Payment" />
          <p>Số tiền: {qrData.total.toLocaleString()}đ</p>
          <p>Nội dung CK: {qrData.description}</p>
        </>
      )}
    </div>
  );
}
```

---

## ⚠️ Lưu ý quan trọng

1. **Webhook URL phải public**: SePay cần truy cập được. Dùng ngrok cho dev, domain thật cho production.

2. **Mã thanh toán phải unique**: Dùng `bookingId` hoặc timestamp để tránh trùng lặp.

3. **Timeout**: Set timeout hợp lý cho QR (VD: 15 phút). Sau đó tạo QR mới nếu cần.

4. **Error handling**: Xử lý các case:
   - Booking không tồn tại
   - Đã thanh toán rồi
   - Số tiền không khớp
   - Webhook duplicate

5. **Logging**: Log tất cả webhook để debug và audit.

---

## 📞 Support

- **SePay Docs**: https://docs.sepay.vn
- **SePay Dashboard**: https://my.sepay.vn
- **Contact**: support@sepay.vn

---

## 🎯 Checklist hoàn thành

- [x] Config ENV variables
- [x] Tạo endpoint QR generation
- [x] Implement webhook handler
- [x] Verify webhook signature
- [x] Update booking status
- [x] Frontend QR display
- [x] Frontend polling status
- [x] Testing với ngrok
- [ ] Deploy production với HTTPS
- [ ] Setup monitoring & alerts

