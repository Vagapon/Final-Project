# 🚀 BẮT ĐẦU TỪ ĐÂY - SEPAY WEBHOOK

## ✅ ĐÃ FIX XONG! Bây giờ làm gì?

### 📌 3 BƯỚC ĐƠN GIẢN

#### BƯỚC 1: Restart Backend (BẮT BUỘC)
```bash
# Dừng server hiện tại: Ctrl+C
# Sau đó:
cd backend
npm run dev
```

**Phải thấy log:**
```
✅ Payment routes registered:
   - /api/payments/*
   - /api/payment/*
   - /payment/* (for SePay webhook)
🚀 Server is running on port 5000
```

#### BƯỚC 2: Test (QUAN TRỌNG)
```powershell
# Windows PowerShell
cd backend
.\quick-test.ps1
```

**HOẶC nếu dùng Git Bash / Linux:**
```bash
cd backend
bash quick-test.sh
```

**Phải thấy toàn bộ ✅**

#### BƯỚC 3: Test Thanh Toán Thật
1. Tạo booking mới
2. Lấy QR code (paymentId sẽ có dạng `DH952915`)
3. Thanh toán qua Momo/Banking
4. **XEM BACKEND LOGS** → Phải thấy:
   ```
   ✅ Extracted paymentId: DH952915
   ✅ Found booking: ...
   ✅ SUCCESSFULLY marked as PAID
   ```

---

## 🔧 Những Gì Đã Sửa

### Fix #1: 404 Not Found
- ✅ Thêm GET handler cho `/payment/webhook/sepay`

### Fix #2: Payment ID không match  
- ✅ SePay gửi: `"BankAPINotify...DH952915...MOMO"`
- ✅ Code extract: `DH952915`
- ✅ Tìm booking với regex case-insensitive

### Fix #3: Logging
- ✅ Thấy tất cả requests: `📥 POST /payment/webhook/sepay`

---

## 📂 Files Mới

```
backend/
├── quick-test.ps1              ← Chạy file này để test (Windows)
├── quick-test.sh               ← Chạy file này để test (Mac/Linux)
├── test-sepay-webhook.js       ← Test chi tiết
├── START_HERE.md               ← File này
├── SEPAY_WEBHOOK_FIXED.md      ← Summary ngắn
└── WEBHOOK_FIX_GUIDE.md        ← Hướng dẫn đầy đủ
```

---

## ⚡ TL;DR - SIÊU NHANH

```powershell
# 1. Restart
npm run dev

# 2. Test (terminal mới)
.\quick-test.ps1

# 3. Thanh toán thử
# → Check logs thấy "SUCCESSFULLY marked as PAID"
```

---

## 🐛 Vẫn Lỗi?

### Scenario 1: Test script báo lỗi
→ Server chưa chạy hoặc port sai
→ Check: `http://localhost:5000/payment/test`

### Scenario 2: Thanh toán nhưng vẫn unpaid
→ Check backend logs
→ Tìm dòng "📩 SePay Webhook (via /sepay) RECEIVED"
→ Gửi toàn bộ log đó cho tôi

### Scenario 3: Không thấy webhook được gọi
→ Ngrok URL đã cập nhật trong SePay chưa?
→ Ngrok có đang chạy không?

---

## 📞 Cần Hỗ Trợ?

Gửi cho tôi:
1. Backend logs (từ lúc webhook được gọi)
2. Output của `.\quick-test.ps1`
3. Screenshot SePay webhook config

---

**🎯 Mục tiêu:** Backend logs phải hiện:
```
✅ Booking XXXXXXX SUCCESSFULLY marked as PAID
```

**Nếu thấy dòng này = XONG! 🎉**

