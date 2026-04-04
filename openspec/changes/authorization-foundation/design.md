## Context

Codebase hien tai co cac actor sau:

- `guest`: chua dang nhap, co the xem home va catalog public
- `student`: hoc vien, co cart/wishlist/checkout/profile
- `instructor`: giang vien, co profile va route tao sua course/lesson
- `admin`: da co schema user/admin nhung chua co workflow UI
- `sepay-webhook`: actor ngoai he thong, khong su dung JWT user

Van de hien tai:

- Profile API nhan `:userId` tu client thay vi derive tu JWT subject
- Course va lesson authoring chua khoa theo role va ownership
- Upload endpoint moi dung `authMiddleware`, chua phan biet avatar/course/lesson upload
- Order status va checkout info chua duoc rang buoc theo owner

## Goals / Non-Goals

**Goals:**
- Moi request phai biet actor la ai va actor duoc lam gi
- Self-service flows chi thao tac duoc tren tai khoan cua actor hien tai
- Instructor chi duoc sua/xoa course va lesson cua chinh minh
- Admin co quyen override hop le cho moderation va support
- Webhook tu SePay duoc tach biet voi actor user thong thuong

**Non-Goals:**
- Multi-tenant organization permissions
- Fine-grained ACL theo tung lesson/video
- SSO / OAuth / social login
- Full audit log UI

## Decisions

### 1. JWT subject la source of truth cho user actor
Backend se lay `req.user.userId` va `req.user.role` lam identity chinh. Client khong duoc chi dinh `userId` de thao tac self-service.

### 2. Role check va ownership check la hai lop rieng
- Role guard: xac dinh actor co duoc vao workflow khong
- Ownership guard: xac dinh actor co so huu resource can ghi khong

Vi du:
- `student` khong duoc tao course du dung duoc token hop le
- `instructor` duoc sua course neu `course.instructorId.userId === req.user.userId`
- `admin` duoc override nhung van phai di qua admin-only guard

### 3. Public, authenticated, privileged duoc tach ro
- Public: home, course catalog, course detail, preview lessons
- Authenticated: cart, wishlist, checkout, my-courses, profile
- Privileged: course authoring, lesson management, admin moderation

### 4. Upload permission theo resource type
- `avatar`: moi authenticated user deu duoc
- `course-thumbnail`, `course-preview`, `lesson-video`: chi instructor/admin duoc, va phai gan voi resource actor co quyen author

### 5. Frontend khong tu suy ra identity quan he
Frontend khong gui `instructorId` hay `userId` cho workflow ownership-sensitive. Backend derive relation tu actor dang dang nhap.

## Role Matrix

| Capability | Guest | Student | Instructor | Admin | SePay |
| ---------- | ----- | ------- | ---------- | ----- | ----- |
| View catalog/detail | Yes | Yes | Yes | Yes | No |
| Manage own profile | No | Yes | Yes | Yes | No |
| Manage cart/wishlist | No | Yes | Optional | Yes | No |
| Checkout own order | No | Yes | Optional | Yes | No |
| Create/edit own course | No | No | Yes | Yes | No |
| Create/edit lesson | No | No | Yes | Yes | No |
| Moderate users/courses | No | No | No | Yes | No |
| Call payment webhook | No | No | No | No | Yes |

## Risks / Trade-offs

- Them ownership check se tang so query DB cho mutating routes
- Refactor route contracts co the lam FE hien tai can cap nhat
- Admin override can duoc gioi han ro, neu khong se tro lai thanh "super user" mo ho

## Rollout Notes

Nen implement theo thu tu:
1. middleware actor helpers
2. self-service account routes
3. course/lesson authoring guards
4. order ownership
5. upload permission tightening
