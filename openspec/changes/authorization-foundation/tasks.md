## 1. Actor Model

- [ ] 1.1 Tao helper/middleware xac dinh actor tu JWT va expose `req.actor`
- [ ] 1.2 Dinh nghia role guard dung chung cho `student`, `instructor`, `admin`
- [ ] 1.3 Dinh nghia ownership helper cho user profile, course, lesson, order

## 2. Account Self-Service

- [ ] 2.1 Refactor profile routes de bo `:userId` cho self-service endpoints
- [ ] 2.2 Chi cho phep actor update/change-password/deactivate chinh tai khoan cua minh
- [ ] 2.3 Chuan hoa response 401/403 cho account APIs

## 3. Content Authoring Access

- [ ] 3.1 Khoa `POST/PUT/DELETE /course` cho instructor/admin
- [ ] 3.2 Derive `instructorId` o backend tu actor instructor thay vi tin client payload
- [ ] 3.3 Khoa create/update/delete lesson theo course ownership

## 4. Checkout And Upload Hardening

- [ ] 4.1 Khoa checkout info va order status theo owner/admin
- [ ] 4.2 Tach permission cho avatar upload va course/lesson upload
- [ ] 4.3 Dam bao webhook route khong di qua user actor guard

## 5. Frontend Guard

- [ ] 5.1 Hide authoring actions neu actor khong phai instructor/admin
- [ ] 5.2 Them protected route cho profile/cart/wishlist/checkout
- [ ] 5.3 Bo gui `userId`/`instructorId` tu FE o cac self-service va authoring flow
