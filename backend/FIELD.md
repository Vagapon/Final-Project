# Field Management API Documentation

## Tổng quan
API này cung cấp các chức năng CRUD đầy đủ cho việc quản lý sân bóng đá, bao gồm tạo, đọc, cập nhật và xóa sân.

## Base URL
```
/api/fields
```

## Authentication
Một số endpoints yêu cầu authentication token trong header:
```
Authorization: Bearer <your_token>
```

## Endpoints

### 1. Lấy danh sách tất cả sân
**GET** `/api/fields`

**Query Parameters:**
- `page` (optional): Số trang (default: 1)
- `limit` (optional): Số lượng mỗi trang (default: 10, max: 100)
- `purpose` (optional): Mục đích sân (`event` hoặc `rental`)
- `status` (optional): Trạng thái sân (`active`, `maintenance`, `inactive`)
- `location` (optional): Khu vực
- `search` (optional): Tìm kiếm theo tên, số sân, địa chỉ
- `sortBy` (optional): Sắp xếp theo (`name`, `fieldNumber`, `createdAt`, `updatedAt`, `pricePerHour`)
- `sortOrder` (optional): Thứ tự sắp xếp (`asc` hoặc `desc`)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "field_id",
      "name": "Sân bóng đá ABC",
      "fieldNumber": "Sân 1",
      "address": "123 Đường ABC, Quận 1",
      "location": "Quận 1",
      "purpose": "rental",
      "pricePerHour": 200000,
      "openingHours": {
        "start": "06:00",
        "end": "22:00"
      },
      "status": "active",
      "managedBy": {
        "_id": "user_id",
        "name": "Admin Name",
        "email": "admin@example.com"
      },
      "images": ["https://example.com/image1.jpg"],
      "description": "Sân bóng đá chất lượng cao",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 50,
    "itemsPerPage": 10
  }
}
```

### 2. Lấy thông tin chi tiết một sân
**GET** `/api/fields/:id`

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "field_id",
    "name": "Sân bóng đá ABC",
    "fieldNumber": "Sân 1",
    "address": "123 Đường ABC, Quận 1",
    "location": "Quận 1",
    "purpose": "rental",
    "pricePerHour": 200000,
    "openingHours": {
      "start": "06:00",
      "end": "22:00"
    },
    "status": "active",
    "managedBy": {
      "_id": "user_id",
      "name": "Admin Name",
      "email": "admin@example.com",
      "phone": "0123456789"
    },
    "images": ["https://example.com/image1.jpg"],
    "description": "Sân bóng đá chất lượng cao",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 3. Tạo sân mới
**POST** `/api/fields`
**Authentication:** Required
**Content-Type:** `multipart/form-data`

**Request Body (Form Data):**
- `name`: Tên sân (string, required)
- `fieldNumber`: Số sân (string, required)
- `address`: Địa chỉ (string, required)
- `location`: Khu vực (string, optional)
- `purpose`: Mục đích sử dụng (`event` hoặc `rental`, required)
- `pricePerHour`: Giá thuê/giờ (number, required nếu purpose = rental)
- `openingHours[start]`: Giờ mở cửa (string, required)
- `openingHours[end]`: Giờ đóng cửa (string, required)
- `status`: Trạng thái (`active`, `maintenance`, `inactive`, optional, default: active)
- `description`: Mô tả (string, optional)
- `images`: File ảnh (array of files, tối đa 5 ảnh, optional)

**Response:**
```json
{
  "success": true,
  "message": "Tạo sân thành công",
  "data": {
    "_id": "field_id",
    "name": "Sân bóng đá ABC",
    "fieldNumber": "Sân 1",
    "address": "123 Đường ABC, Quận 1",
    "location": "Quận 1",
    "purpose": "rental",
    "pricePerHour": 200000,
    "openingHours": {
      "start": "06:00",
      "end": "22:00"
    },
    "status": "active",
    "managedBy": "user_id",
    "images": ["https://example.com/image1.jpg"],
    "description": "Sân bóng đá chất lượng cao",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 4. Cập nhật thông tin sân
**PUT** `/api/fields/:id`
**Authentication:** Required
**Content-Type:** `multipart/form-data`

**Request Body (Form Data):** (Tương tự như tạo sân, có thể chỉ gửi các trường cần cập nhật)
- `images`: File ảnh mới (array of files, tối đa 5 ảnh, optional) - sẽ thay thế toàn bộ ảnh cũ

**Response:**
```json
{
  "success": true,
  "message": "Cập nhật sân thành công",
  "data": {
    // Updated field data
  }
}
```

### 5. Cập nhật trạng thái sân
**PATCH** `/api/fields/:id/status`
**Authentication:** Required

**Request Body:**
```json
{
  "status": "maintenance"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Cập nhật trạng thái sân thành công",
  "data": {
    // Updated field data
  }
}
```

### 6. Xóa sân
**DELETE** `/api/fields/:id`
**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "message": "Xóa sân thành công"
}
```

### 7. Lấy danh sách sân theo mục đích
**GET** `/api/fields/purpose/:purpose`

**Path Parameters:**
- `purpose`: `event` hoặc `rental`

**Query Parameters:**
- `status` (optional): Trạng thái sân

**Response:**
```json
{
  "success": true,
  "data": [
    // Array of fields
  ],
  "count": 10
}
```

### 8. Lấy thống kê sân
**GET** `/api/fields/stats`
**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "data": {
    "totalFields": 50,
    "activeFields": 45,
    "maintenanceFields": 3,
    "inactiveFields": 2,
    "eventFields": 20,
    "rentalFields": 30
  }
}
```

## Validation Rules

### Tạo sân mới:
- `name`: Bắt buộc, không được rỗng
- `fieldNumber`: Bắt buộc, không được rỗng
- `address`: Bắt buộc, không được rỗng
- `purpose`: Bắt buộc, phải là `event` hoặc `rental`
- `openingHours.start`: Bắt buộc, định dạng HH:MM
- `openingHours.end`: Bắt buộc, định dạng HH:MM
- `pricePerHour`: Bắt buộc nếu `purpose` là `rental`, phải > 0 và <= 10,000,000
- `images`: Array các file ảnh (tối đa 5 ảnh), định dạng jpg, jpeg, png, gif, webp

### Cập nhật sân:
- Các validation tương tự như tạo sân
- Có thể chỉ gửi các trường cần cập nhật

### Cập nhật trạng thái:
- `status`: Bắt buộc, phải là `active`, `maintenance`, hoặc `inactive`

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Dữ liệu không hợp lệ",
  "errors": [
    "Tên sân là bắt buộc",
    "Giá thuê phải lớn hơn 0"
  ]
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Token không hợp lệ hoặc đã hết hạn"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Không tìm thấy sân"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Lỗi server khi lấy danh sách sân",
  "error": "Error message"
}
```

## Notes
- Tất cả thời gian đều sử dụng định dạng ISO 8601
- Giá thuê được tính bằng VNĐ
- Hình ảnh được upload trực tiếp lên Cloudinary và lưu trong folder "field_images"
- Sân `event` không có `pricePerHour`
- Sân `rental` bắt buộc phải có `pricePerHour`
- Khi cập nhật ảnh mới, tất cả ảnh cũ sẽ bị xóa khỏi Cloudinary
- Tối đa 5 ảnh cho mỗi sân
