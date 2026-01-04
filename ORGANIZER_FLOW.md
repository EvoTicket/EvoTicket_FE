# Organizer Registration Flow

## Tổng quan
Hệ thống cho phép người dùng đăng ký trở thành organizer để tạo sự kiện.

## Flow hoạt động

### 1. Khi bấm nút "Tạo sự kiện"
- Hệ thống kiểm tra token JWT
- Decode JWT để lấy thông tin `isOrganization`

### 2. Nếu `isOrganization: true`
- ✅ Người dùng đã là organizer
- → Chuyển đến **Organizer Center** (`/organizer/center`)
- Hiển thị dashboard quản lý sự kiện

### 3. Nếu `isOrganization: false`
- ❌ Người dùng chưa là organizer
- → Chuyển đến **Trang đăng ký Organizer** (`/organizer/register`)
- Yêu cầu điền form đăng ký

## Form đăng ký Organizer

### Thông tin cần thiết:
```typescript
{
  organizationName: string;      // Tên tổ chức
  legalName: string;             // Tên pháp lý
  taxCode: string;               // Mã số thuế (10 số)
  description: string;           // Mô tả
  businessAddress: string;       // Địa chỉ kinh doanh
  wardCode: number;              // Mã phường/xã
  provinceCode: number;          // Mã tỉnh/thành phố
  businessPhone: string;         // Số điện thoại (10 số)
  businessEmail: string;         // Email doanh nghiệp
  website: string;               // Website (optional)
  businessLicenseUrl: string;    // URL giấy phép kinh doanh (optional)
}
```

### API Endpoint:
```
POST /iam-service/api/organizations
Headers:
  - Authorization: Bearer {token}
  - Content-Type: application/json
```

### Response thành công (201):
```json
{
  "status": 201,
  "message": "tạo org profile thành công",
  "data": {
    "Response": {
      "id": 2,
      "userId": 13,
      "organizationName": "...",
      "status": "PENDING",
      ...
    },
    "New token": "eyJhbGciOiJIUzI1NiJ9..."
  }
}
```

## Sau khi đăng ký thành công

1. **Cập nhật token mới**
   - Lấy `New token` từ response
   - Thay thế token cũ: `Cookies.set("token", newToken)`
   - Token mới có `isOrganization: true`

2. **Chuyển hướng**
   - Tự động chuyển đến **Organizer Center**
   - Hiển thị thông báo thành công

## JWT Payload Structure

### Token ban đầu (User thường):
```json
{
  "organizationId": -1,
  "roles": ["ROLE_USER"],
  "userId": 13,
  "isOrganization": false,
  "sub": "user@gmail.com",
  "iat": 1767522502,
  "exp": 1767608902
}
```

### Token sau khi đăng ký (Organizer):
```json
{
  "organizationId": 2,
  "roles": ["ROLE_USER"],
  "userId": 13,
  "isOrganization": true,
  "sub": "user@gmail.com",
  "iat": 1767522593,
  "exp": 1767608993
}
```

## Files liên quan

### 1. JWT Utility
- **File**: `src/lib/jwt.ts`
- **Chức năng**: Decode JWT token, kiểm tra expiration

### 2. Header Component
- **File**: `src/components/header.tsx`
- **Chức năng**: Xử lý nút "Tạo sự kiện", kiểm tra JWT

### 3. Register Organizer Page
- **File**: `src/app/[locale]/organizer/register/page.tsx`
- **Chức năng**: Form đăng ký organizer

### 4. Organizer Center Page
- **File**: `src/app/[locale]/organizer/center/page.tsx`
- **Chức năng**: Dashboard quản lý sự kiện

## Security Notes

⚠️ **Quan trọng**:
- Token mới phải được cập nhật ngay sau khi đăng ký thành công
- Kiểm tra token expiration trước khi decode
- Validate tất cả input từ form
- Xử lý lỗi khi API call fails

## Testing

### Test Case 1: User chưa là organizer
1. Login với account thường
2. Click "Tạo sự kiện"
3. ✅ Expect: Chuyển đến `/organizer/register`

### Test Case 2: User đã là organizer
1. Login với account organizer
2. Click "Tạo sự kiện"
3. ✅ Expect: Chuyển đến `/organizer/center`

### Test Case 3: Đăng ký thành công
1. Điền form đầy đủ thông tin
2. Submit form
3. ✅ Expect: 
   - Token được cập nhật
   - Chuyển đến `/organizer/center`
   - Hiển thị toast success
