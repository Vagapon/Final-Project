# Google OAuth Setup Guide

## Cấu hình Google OAuth để fix lỗi "No pem found for envelope"

### 1. Tạo Google OAuth 2.0 Client ID

1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo project mới hoặc chọn project có sẵn
3. Enable Google+ API và Google OAuth2 API
4. Vào "Credentials" > "Create Credentials" > "OAuth 2.0 Client IDs"
5. Chọn "Web application"
6. Thêm Authorized JavaScript origins:
   - `http://localhost:3000` (cho development)
   - `https://yourdomain.com` (cho production)
7. Thêm Authorized redirect URIs:
   - `http://localhost:3000/auth/google/callback`
   - `https://yourdomain.com/auth/google/callback`

### 2. Cấu hình Environment Variables

Tạo file `.env` trong thư mục `backend/` với nội dung:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/your_database_name

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here.apps.googleusercontent.com

# Server Configuration
PORT=5000
NODE_ENV=development
```

### 3. Kiểm tra Google Client ID

Google Client ID phải có format: `numbers-letters.apps.googleusercontent.com`

Ví dụ: `852686097163-c17fo2gtr7fq6r6lu21uo02gv79dcp4o.apps.googleusercontent.com`

### 4. Các lỗi thường gặp và cách khắc phục

#### Lỗi "No pem found for envelope"
- **Nguyên nhân**: Token đã hết hạn hoặc không hợp lệ
- **Giải pháp**: 
  - Kiểm tra Google Client ID có đúng không
  - Đảm bảo domain được authorize trong Google Console
  - Thử login lại từ frontend

#### Lỗi "Invalid audience"
- **Nguyên nhân**: Google Client ID không khớp
- **Giải pháp**: Kiểm tra lại GOOGLE_CLIENT_ID trong .env

#### Lỗi "Network error"
- **Nguyên nhân**: Không thể kết nối đến Google API
- **Giải pháp**: Kiểm tra internet connection và firewall

### 5. Testing

1. Khởi động server: `npm start`
2. Test Google login từ frontend
3. Kiểm tra logs trong console để debug

### 6. Production Deployment

Khi deploy lên production:
1. Cập nhật Authorized JavaScript origins trong Google Console
2. Cập nhật Authorized redirect URIs
3. Đảm bảo HTTPS được enable
4. Kiểm tra environment variables trên server
