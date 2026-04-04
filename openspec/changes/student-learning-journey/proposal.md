## Why

EduScience da co cart, checkout, order, lesson, va model `Enrollment`, nhung chua co workflow hoc tap cho student sau khi mua. Sau thanh toan thanh cong, user van chua co `my-courses`, chua co lesson player, chua co progress tracking, va chua co completion state de dat gia tri that cho nen tang.

San pham hien dang dung thanh toan de ban course, nhung chua hoan thanh nua sau cua journey la hoc va hoan thanh khoa hoc.

## What Changes

- Tạo student post-purchase workflow `checkout -> my-courses -> course player -> progress -> completed`
- Mo rong enrollment capability tu model sang API va UI that
- Xac dinh access rules cho preview lessons va enrolled lessons
- Theo doi progress theo course/lesson
- Chuan hoa redirect va CTA sau khi thanh toan thanh cong

## Capabilities

### New Capabilities
- `my-courses`: danh sach khoa hoc da dang ky cua student
- `learning-player`: player cho khoa hoc da enroll, co lesson navigation va preview handling
- `learning-progress`: luu va hien tien do hoc tap, completed state

### Modified Capabilities
- `checkout-ui`: sau thanh toan redirect ve workflow hoc tap thay vi chi quay lai catalog
- `course-detail`: can hien dang thai da enroll va CTA phu hop cho student

## Impact

- **Backend**: them enrollment query APIs, lesson access checks, progress update endpoints
- **Frontend**: them pages cho `my-courses`, player, progress UI, post-payment redirect
- **Product**: chuyen tu ecommerce MVP sang e-learning workflow dung nghia
