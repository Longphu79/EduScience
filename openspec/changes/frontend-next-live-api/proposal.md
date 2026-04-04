## Why

`frontend-next` da co shell va fake data de chot huong UI. Nhung user yeu cau buoc tiep theo la:
- bo mock data
- noi du lieu that tu backend
- tach ro public/client app voi instructor/admin management
- khong de landing page dinh navigation role ops

Neu tiep tuc de fake data, app moi se lai roi vao tinh trang chi dep be ngoai ma khong co workflow that.

## What Changes

- Noi `frontend-next` vao backend APIs that
- Them auth/session layer don gian cho student, instructor, admin
- Tach public header va role management layouts
- Tao login flows rieng cho public/student, instructor, admin
- Them backend read-model endpoints phuc vu instructor/admin dashboards

## Capabilities

### New Capabilities
- `client-live-app`
- `role-management-separation`

### Modified Capabilities
- `client-web-app`
- `role-dashboards`
- `instructor-payout-requests`
- `admin-payout-processing`
- `lesson-discussions`

## Impact

- **Frontend**: bo fake data route implementations, them auth/session va live fetch
- **Backend**: them dashboard overview/list endpoints cho instructor/admin
- **QA**: co the dang nhap bang account seed va xem workflow that tren app moi
