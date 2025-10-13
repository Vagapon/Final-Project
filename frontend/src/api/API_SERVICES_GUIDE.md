# API Services Guide

Hướng dẫn sử dụng các API service đã được tạo để thay thế việc gọi API trực tiếp trong components.

## Cấu trúc thư mục

```
src/api/
├── auth/                    # Authentication services
├── fieldBooking/           # Field booking services
├── fieldManagement/        # Field management services
├── userManagement/         # User management services
├── eventManagement/        # Event management services
├── teamManagement/         # Team management services
├── memberManagement/       # Member management services
├── axiosClient.js          # Axios configuration
└── index.js               # Export all services
```

## Cách sử dụng

### 1. Import service cần thiết

```javascript
import { fieldService, userService, eventService, teamService, memberService } from '../api';
```

### 2. Sử dụng service trong component

```javascript
// Thay vì gọi API trực tiếp
const response = await axios.get('http://localhost:5000/api/fields');

// Sử dụng service
const result = await fieldService.getAllFields();
if (result.success) {
  setFields(result.data);
}
```

## Các Service có sẵn

### Field Management Service

```javascript
// Lấy danh sách sân bóng
const result = await fieldService.getAllFields();

// Tạo sân bóng mới
const result = await fieldService.createField(formData);

// Cập nhật sân bóng
const result = await fieldService.updateField(id, formData);

// Xóa sân bóng
const result = await fieldService.deleteField(id);

// Lấy khung giờ của sân
const result = await fieldService.getFieldTimeSlots(fieldId);
```

### User Management Service

```javascript
// Lấy danh sách user
const result = await userService.getAllUsers();

// Tạo user mới
const result = await userService.createUser(userData);

// Cập nhật user
const result = await userService.updateUser(id, userData);

// Xóa user
const result = await userService.deleteUser(id);

// Cập nhật trạng thái user
const result = await userService.updateUserStatus(id, true);
```

### Event Management Service

```javascript
// Lấy danh sách event
const result = await eventService.getAllEvents();

// Tạo event mới
const result = await eventService.createEvent(eventData);

// Đăng ký tham gia event
const result = await eventService.registerEvent(eventId, registrationData);

// Lấy thống kê event
const result = await eventService.getEventStats(eventId);
```

### Team Management Service

```javascript
// Lấy danh sách team
const result = await teamService.getAllTeams();

// Tạo team mới
const result = await teamService.createTeam(teamData);

// Lấy thành viên của team
const result = await teamService.getTeamMembers(teamId);

// Import thành viên từ Google Sheet
const result = await teamService.importMembersFromSheet(teamId, sheetUrl);
```

### Member Management API

```javascript
// Lấy danh sách thành viên
const response = await memberApi.getAllMembers();

// Thêm thành viên vào team
const response = await memberApi.addMemberToTeam(teamId, memberData);

// Cập nhật vai trò thành viên
const response = await memberApi.updateMemberRole(memberId, 'captain');
```

## Lợi ích của việc sử dụng Service

1. **Tách biệt logic**: API calls được tách riêng khỏi component
2. **Tái sử dụng**: Có thể sử dụng lại service ở nhiều component
3. **Xử lý lỗi tập trung**: Tất cả error handling được xử lý trong service
4. **Dễ bảo trì**: Thay đổi API endpoint chỉ cần sửa ở một nơi
5. **Type safety**: Có thể dễ dàng thêm TypeScript types
6. **Testing**: Dễ dàng mock service cho unit testing

## Cấu trúc Response

Tất cả service methods đều trả về object với cấu trúc:

```javascript
{
  success: boolean,    // true nếu thành công
  data?: any,         // dữ liệu trả về (nếu có)
  message?: string,   // thông báo lỗi (nếu có)
  errors?: string[]   // danh sách lỗi validation (nếu có)
}
```

## Error Handling

Service tự động xử lý:
- Hiển thị message lỗi bằng Ant Design message
- Log lỗi ra console
- Trả về object với success: false và message lỗi

## Migration Guide

Để chuyển đổi từ axios trực tiếp sang service:

1. **Trước:**
```javascript
const response = await axios.get('http://localhost:5000/api/fields', {
  headers: { Authorization: `Bearer ${token}` }
});
if (response.data.success) {
  setFields(response.data.data);
} else {
  message.error('Lỗi khi tải danh sách sân');
}
```

2. **Sau:**
```javascript
const result = await fieldService.getAllFields();
if (result.success) {
  setFields(result.data);
}
```

## Lưu ý

- Tất cả service đều sử dụng `axiosClient` đã được cấu hình sẵn
- Token authentication được xử lý tự động trong `axiosClient`
- Error handling và message hiển thị được xử lý tự động
- Có thể tùy chỉnh error handling trong từng service nếu cần
