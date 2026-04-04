## Why

Trang course catalog hien tai dang dung mock data va khong noi voi backend that. Home page co lay popular courses, nhung catalog chinh, filter/sort, CTA marketing, va wishlist deep link deu chua tao thanh workflow hoan chinh. Route course detail theo slug cung chua ton tai trong frontend du backend da co endpoint.

Neu khong co catalog va detail page dung du lieu that, guest va student khong co mot funnel xem va danh gia khoa hoc hoan chinh truoc khi mua.

## What Changes

- Thay mock catalog bang du lieu backend
- Tạo workflow `home -> catalog -> course detail -> add to wishlist/cart -> checkout`
- Thiet ke route course detail theo `slug`
- Mo rong API catalog de ho tro search/filter/sort/pagination
- Chuan hoa data contract cho course card va course detail

## Capabilities

### New Capabilities
- `course-catalog`: danh sach course that, search, filter, sort, pagination
- `course-detail`: page chi tiet course theo slug, hien syllabus, instructor, preview, CTA
- `course-discovery`: lien ket home, popular courses, wishlist, va catalog theo route hop le

### Modified Capabilities
- `checkout-ui`: redirect sau thanh toan co the dua user ve catalog hoac my-courses co nghia hon
- `wishlist`: link course SHALL tro den route chi tiet ton tai

## Impact

- **Backend**: mo rong query cho courses, tach public fields va public status
- **Frontend**: bo mock data, them route `/course/:slug`, them loading/error/empty states
- **Product**: guest va student co discovery funnel that thay vi demo data
