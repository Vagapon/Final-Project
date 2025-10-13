# API Layer Documentation

## Cấu trúc theo chức năng

```
api/
├── axiosClient.js    # Cấu hình axios cơ bản
├── auth/             # Authentication
│   ├── authApi.js    # API calls
│   ├── authService.js # Business logic
│   └── index.js      # Export auth
├── event/            # Events (sau này)
│   ├── eventApi.js
│   ├── eventService.js
│   └── index.js
├── user/             # Users (sau này)
│   ├── userApi.js
│   ├── userService.js
│   └── index.js
└── index.js          # Export tất cả
```

## Cách sử dụng

### Import API hoặc Service
```javascript
// Import API (chỉ gọi HTTP)
import { authApi } from '../api';

// Import Service (có business logic)
import { authService } from '../api';
```

### Ví dụ sử dụng
```javascript
// Sử dụng Service (khuyến nghị)
const { token, user } = await authService.login(email, password);
await authService.register(userData);

// Hoặc sử dụng API trực tiếp
const response = await authApi.login({ email, password });
```

## Tính năng

- ✅ Tổ chức theo chức năng
- ✅ Tách biệt API và Service
- ✅ Auto add Authorization header
- ✅ Auto redirect khi token hết hạn (401)
- ✅ Error handling tập trung
- ✅ Base URL cấu hình sẵn
- ✅ Timeout 10 giây
