## 1. OpenSpec Alignment

- [x] 1.1 Map scope nay vao cac capability hien co: course-detail, role-management-separation, qa-fixtures, learning-progress, checkout-ui
- [x] 1.2 Add/modify spec files cho desktop management shell, video-first authoring, client commerce UI, desktop learning experience

## 2. Theme, Header, Login

- [x] 2.1 Chuyen Mantine theme primaryColor ve `blue`
- [x] 2.2 Tao logo component va don gian hoa public header
- [x] 2.3 Bo copy thua nhu `Client`, `Student login` o nhung noi khong can thiet
- [x] 2.4 Them ro CTA `Dang nhap` / `Dang ky` cho guest
- [x] 2.5 Don gian hoa student/instructor/admin login pages va auth shell

## 3. Desktop Management Tables

- [x] 3.1 Refactor instructor courses thanh desktop table co status badge, actions, pagination, page size
- [x] 3.2 Refactor instructor payout history thanh table co summary + pagination
- [x] 3.3 Refactor admin payout queue thanh table co pagination, filters, inline actions
- [x] 3.4 Refactor admin/instructor authoring inventory thanh table desktop-first
- [x] 3.5 Tang page-shell width / margins cho management routes

## 4. Video-First Authoring

- [x] 4.1 Them frontend upload helper cho multipart requests toi backend proxy
- [x] 4.2 Authoring workspace upload thumbnail preview thay vi chi nhap URL
- [ ] 4.3 Lesson authoring/lesson media UI cho upload lesson video len R2
- [ ] 4.4 Hien preview player cho course preview va lesson video trong authoring
- [x] 4.5 Them Mantine calendar/date planning widget vao instructor workspace

## 5. Client Commerce Surface

- [x] 5.1 Tao wishlist page tren FE moi
- [x] 5.2 Tao cart page tren FE moi
- [x] 5.3 Tao checkout page tren FE moi, noi voi backend checkout/order APIs
- [x] 5.4 Noi CTA add-to-wishlist/add-to-cart tu detail va catalog
- [x] 5.5 Don gian hoa public header CTA de dan user vao browse/login/register hop ly

## 6. Course Detail And Learning

- [x] 6.1 Nang cap public detail page theo pattern marketplace desktop-first
- [x] 6.2 Nang cap my-learning page thanh dashboard desktop-first
- [x] 6.3 Nang cap learning player layout thanh video-first desktop experience
- [x] 6.4 Hien lesson resources, comments, notes, progress trong layout ro rang hon

## 7. QA Data And Verification

- [x] 7.1 Mo rong QA seed de moi course/instructor surface deu co video-friendly data
- [x] 7.2 Them/refresh integration va Playwright coverage cho cart/wishlist/checkout/player/management tables
- [x] 7.3 Chay full backend tests, frontend build, frontend e2e, va manual smoke theo role
