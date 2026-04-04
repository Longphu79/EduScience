## Why

Frontend Next hien da chay duoc va co role separation co ban, nhung bề mặt san pham van chua dat muc MVP that:

- Public client UI van qua demo, chua giong mot marketplace course desktop-first nhu Udemy/Coursera
- Header va login flow dang roi, copy thua, va khong lam ro dang nhap / dang ky / workspace nao danh cho role nao
- Instructor/admin pages chua dung data table desktop-first voi pagination, page size, va spacing hop ly tren MacBook
- Instructor authoring moi dung o muc URL video, chua co workflow upload video that len R2
- Student chua co cart / wishlist / checkout / learning player / my-learning desktop surface du manh
- Theme va shell chua quay ve he Mantine xanh mac dinh va chua tan dung manh component system cua Mantine

Neu khong nang cap lop UI/UX nay, web kho dat duoc muc marketplace MVP cho guest/student va cung kho QA cho instructor/admin.

## What Changes

- Chuan hoa desktop-first shell cho guest, instructor, admin bang Mantine
- Don gian hoa header, logo, va login pages; bo copy thua va lam ro dang nhap / dang ky
- Nang cap instructor/admin sang data table co pagination, page size selector, va spacing desktop
- Bo sung authoring workflow video-first cho instructor/admin voi upload thumbnail / preview / lesson video len R2
- Dua Mantine calendar vao instructor workspace cho publish/content planning
- Nang cap client-facing detail page, wishlist, cart, checkout, learning player, va my-learning theo huong desktop marketplace
- Seed du lieu QA video-first de man hinh khong empty va workflow manual QA co noi dung that

## Capabilities

### New Capabilities
- `management-desktop-shell`: app shell, tables, pagination, desktop spacing cho instructor/admin
- `video-first-authoring`: upload media len R2 va authoring quanh video thay vi text-first
- `client-commerce-ui`: wishlist, cart, checkout UI that tren FE moi
- `desktop-learning-experience`: player va dashboard hoc tap toi uu cho laptop

### Modified Capabilities
- `course-detail`: nang cap detail page theo pattern marketplace hien dai
- `role-management-separation`: login / workspace entry phai ro rang va gon
- `qa-fixtures`: seed data phai co thumbnail, preview video, lesson video, cart, wishlist, payout, va learning state

## Impact

- **Frontend**: refactor shell/header/login, them tables va commerce/player pages, noi upload flow that
- **Backend**: tai su dung upload R2 endpoints hien co, co the can mo rong lesson authoring va query surfaces
- **QA**: manual QA theo role de hon vi moi role co workspace ro rang va du lieu khong-empty
