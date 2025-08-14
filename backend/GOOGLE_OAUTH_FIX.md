# 🔧 Fix Lỗi Google OAuth "No pem found for envelope"

## 🚨 Lỗi Hiện Tại
```
Google login error: Error: No pem found for envelope: {"alg":"RS256","kid":"2b7bafb2f10cae2b1f07f3816c5422becca5c223","typ":"JWT"}
```

## ✅ Các Cải Tiến Đã Thực Hiện

### 1. **Cải thiện Error Handling**
- Thêm try-catch riêng cho việc verify token
- Phân loại các loại lỗi khác nhau
- Trả về thông báo lỗi rõ ràng hơn

### 2. **Validation Google Client ID**
- Kiểm tra format của Google Client ID
- Validate trước khi tạo OAuth2Client
- Thông báo lỗi cụ thể nếu format không đúng

### 3. **Retry Mechanism**
- Tự động retry khi gặp lỗi network
- Exponential backoff để tránh spam
- Chỉ retry với các lỗi network, không retry lỗi token

### 4. **Debug Tools**
- Thêm endpoint `/api/auth/google-status` để kiểm tra cấu hình
- Script test `npm run test:google` để validate setup
- Logs chi tiết để debug

## 🛠️ Cách Sử Dụng

### 1. **Kiểm tra cấu hình hiện tại**
```bash
cd backend
npm run test:google
```

### 2. **Kiểm tra qua API**
```bash
curl http://localhost:5000/api/auth/google-status
```

### 3. **Test Google Login**
- Khởi động server: `npm run dev`
- Thử login từ frontend
- Kiểm tra logs trong console

## 🔍 Các Nguyên Nhân Có Thể

### 1. **Token đã hết hạn**
- **Triệu chứng**: Lỗi "No pem found for envelope"
- **Giải pháp**: Thử login lại từ frontend

### 2. **Google Client ID không đúng**
- **Triệu chứng**: Lỗi "Invalid audience"
- **Giải pháp**: Kiểm tra GOOGLE_CLIENT_ID trong .env

### 3. **Domain chưa được authorize**
- **Triệu chứng**: Lỗi "Invalid token"
- **Giải pháp**: Thêm domain vào Google Console

### 4. **Network issues**
- **Triệu chứng**: Lỗi "fetch" hoặc "network"
- **Giải pháp**: Kiểm tra internet và firewall

## 📋 Checklist Fix Lỗi

- [ ] Kiểm tra GOOGLE_CLIENT_ID trong .env
- [ ] Chạy `npm run test:google` để validate
- [ ] Kiểm tra domain trong Google Console
- [ ] Thử login lại từ frontend
- [ ] Kiểm tra logs trong console
- [ ] Test endpoint `/api/auth/google-status`

## 🎯 Kết Quả Mong Đợi

Sau khi fix, bạn sẽ thấy:
- ✅ Google login hoạt động bình thường
- ✅ Không còn lỗi "No pem found for envelope"
- ✅ Error messages rõ ràng và hữu ích
- ✅ Retry mechanism xử lý lỗi network

## 📞 Hỗ Trợ

Nếu vẫn gặp lỗi:
1. Chạy `npm run test:google` và chia sẻ kết quả
2. Kiểm tra logs trong console
3. Chia sẻ response từ `/api/auth/google-status`
