## Why

EduScience da co 3 role persisted la `student`, `instructor`, `admin`, nhung codebase hien tai chua co authorization foundation dung nghia. Nhieu route dang tin `userId` tu client, route authoring course/lesson chua khoa theo role va ownership, va upload endpoints cung chua phan biet ro actor nao duoc phep ghi vao resource nao.

Neu khong khoa nen tang truy cap truoc, moi workflow tiep theo nhu course detail, learning journey, instructor dashboard, admin console deu se phat trien tren mot lop permission khong on dinh.

## What Changes

- Xac dinh ro actor va access policy cho `guest`, `student`, `instructor`, `admin`, va external actor `sepay-webhook`
- Chuan hoa auth context: backend SHALL derive actor tu JWT thay vi tin `userId`/`role`/`instructorId` gui len tu client
- Khoa ownership cho profile, course, lesson, order, upload
- Bo sung route guard va permission matrix cho frontend va backend
- Mo ta audit points va error behaviors cho unauthorized / forbidden requests

## Capabilities

### New Capabilities
- `authorization`: role-based va ownership-based access control cho moi actor
- `account-self-service`: profile/password/deactivate flow chi duoc thao tac tren chinh tai khoan cua actor
- `content-authoring-access`: instructor/admin co quyen authoring, student/guest khong co

### Modified Capabilities
- `checkout`: order info va order status phai duoc bao ve theo owner
- `file-upload`: upload endpoint phai duoc gioi han theo role va resource type

## Impact

- **Backend**: them middleware role guard, ownership checks, actor helpers, va chuan hoa response 401/403
- **Frontend**: them route guards, hide/show action theo role, bo submit du lieu nhay cam do client tu suy doan
- **Security**: loai bo IDOR va privilege escalation trong cac flow hien tai
- **Product**: tao nen tang de mo rong instructor workflow va admin workflow an toan
