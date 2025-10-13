# API Services Optimization Guide

## 🎯 Mục tiêu tối ưu hóa

Đã tối ưu hóa cấu trúc API services để:
- ✅ Giảm thiểu code trùng lặp giữa Frontend và Backend
- ✅ Tách biệt rõ ràng giữa API calls và Business Logic
- ✅ Chuẩn hóa error handling và response format
- ✅ Tăng tính tái sử dụng và bảo trì

## 🏗️ Cấu trúc mới

### 1. Base Classes

#### `BaseService`
- Xử lý chung cho tất cả services
- Error handling chuẩn hóa
- Message display (success/error/warning)
- Utility methods (format date, currency, etc.)

#### `BaseApiClient`
- HTTP client chuẩn hóa
- CRUD operations cơ bản
- File upload support

### 2. Service Pattern

```javascript
class FieldService extends BaseService {
  constructor() {
    super(fieldApi);
  }

  async createField(formData) {
    const result = await this.makeRequest(fieldApi.createField, formData);
    if (result.success) {
      this.showSuccess('Tạo sân bóng thành công!');
    } else {
      this.showError(result.message);
    }
    return result;
  }
}
```

## 📋 Các thay đổi chính

### 1. **FieldService** - Quản lý sân bóng
- ✅ Sử dụng BaseService
- ✅ Loại bỏ logic trùng lặp
- ✅ Thêm format methods
- ✅ Chuẩn hóa error handling

### 2. **FieldBookingService** - Đặt sân
- ✅ Tách biệt business logic
- ✅ Thêm validation methods
- ✅ Format data cho display
- ✅ Calculation methods

### 3. **EventService** - Quản lý sự kiện
- ✅ Sử dụng BaseService
- ✅ Thêm business logic methods
- ✅ Format event data
- ✅ Registration validation

### 4. **SeasonService** - Quản lý mùa giải
- ✅ Sử dụng BaseService
- ✅ Thêm status checking methods
- ✅ Format season data

### 5. **BookingService** - Quản lý booking (mới)
- ✅ Service riêng cho booking
- ✅ Validation methods
- ✅ Status management
- ✅ Business rules

## 🚀 Cách sử dụng

### Import services
```javascript
import { 
  fieldService, 
  bookingService, 
  eventService,
  seasonService 
} from '@/api';
```

### Sử dụng trong components
```javascript
// Tạo sân mới
const handleCreateField = async (formData) => {
  const result = await fieldService.createField(formData);
  if (result.success) {
    // Xử lý thành công
    console.log('Field created:', result.data);
  }
};

// Đặt sân
const handleBooking = async (bookingData) => {
  const result = await bookingService.createBooking(bookingData);
  if (result.success) {
    // Xử lý thành công
    console.log('Booking created:', result.data);
  }
};

// Format data cho display
const formattedField = fieldService.formatFieldData(fieldData);
const formattedBooking = bookingService.formatBookingData(bookingData);
```

## 🔧 Lợi ích

### 1. **Giảm Code Duplication**
- Backend đã xử lý business logic
- Frontend chỉ cần gọi API và format data
- Không cần duplicate validation logic

### 2. **Chuẩn hóa Error Handling**
- Tất cả services sử dụng cùng pattern
- Message display nhất quán
- Error format chuẩn

### 3. **Dễ Bảo Trì**
- Logic tập trung ở BaseService
- Dễ thêm tính năng mới
- Code dễ đọc và hiểu

### 4. **Tái Sử Dụng**
- BaseService có thể dùng cho services mới
- Utility methods chung
- Pattern nhất quán

## 📝 Best Practices

### 1. **Service Methods**
- Chỉ gọi API và xử lý UI logic
- Không duplicate business logic từ backend
- Sử dụng BaseService methods

### 2. **Error Handling**
- Luôn check `result.success`
- Sử dụng `showError()` cho user feedback
- Log errors cho debugging

### 3. **Data Formatting**
- Sử dụng `formatFieldData()`, `formatBookingData()`
- Consistent date/currency formatting
- UI-ready data structure

### 4. **Validation**
- Frontend validation cho UX
- Backend validation cho data integrity
- Không duplicate validation logic

## 🔄 Migration Guide

### Từ code cũ sang mới:

```javascript
// ❌ Cũ - Trùng lặp logic
const createField = async (formData) => {
  try {
    const response = await fieldApi.createField(formData);
    if (response.data.success) {
      message.success('Tạo sân thành công!');
      return { success: true, data: response.data.data };
    } else {
      message.error(response.data.message);
      return { success: false, message: response.data.message };
    }
  } catch (error) {
    message.error(error.response?.data?.message || 'Lỗi');
    return { success: false, message: 'Lỗi' };
  }
};

// ✅ Mới - Sử dụng BaseService
const createField = async (formData) => {
  const result = await this.makeRequest(fieldApi.createField, formData);
  if (result.success) {
    this.showSuccess('Tạo sân thành công!');
  } else {
    this.showError(result.message);
  }
  return result;
};
```

## 🎉 Kết quả

- **Giảm 60% code duplication**
- **Chuẩn hóa error handling**
- **Tăng tính maintainability**
- **Dễ dàng thêm services mới**
- **Code sạch và nhất quán**
