## Context

Codebase da co:

- Next frontend chay live
- public catalog/detail route
- instructor/admin shell co ban
- payout workspace
- learning APIs, wishlist/cart/checkout APIs, R2 upload endpoints
- QA seed dataset co video URLs va role accounts

Nhung cac workflow van bi dut doan o bề mặt UI:

- guest/student chua co commerce UI day du tren FE moi
- instructor chua co media upload / lesson video authoring dung nghia
- admin/instructor dang hien card list thay vi data table desktop-first
- login/header chua ro luong vao san pham

## Goals / Non-Goals

**Goals**

- Client app tro thanh public learning storefront desktop-first
- Instructor/admin co workspace Mantine ro rang, co table, pagination, page size, va desktop spacing
- Authoring tap trung vao video va R2 upload workflow
- Student co wishlist/cart/checkout/player/dashboard that tren FE moi
- Theme ve default blue cua Mantine va tan dung component system nhat quan

**Non-Goals**

- Copy nguyen xi Udemy/Coursera
- Xay automated payout transfer
- Timecode-level video analytics
- Mobile-first redesign o phase nay

## Decisions

### 1. Desktop-first la baseline layout

Public va management pages se toi uu cho 1280px+ truoc:

- container rong hon, margin hai ben nhieu hon
- sidebar/filter/table actions uu tien desktop
- mobile chi la responsive fallback, khong chi phoi layout chinh

### 2. Mantine-first component policy

Uu tien dung Mantine components cho:

- AppShell
- Table / DataTable pattern bang `Table`, `Pagination`, `Select`, `ScrollArea`
- Forms
- Date/Calendar bang `@mantine/dates`
- Modal, Tabs, SegmentedControl, ActionIcon, Notification

Chi dung element thuần cho noi dung media hay markup ma Mantine khong phu hop.

### 3. Video-first authoring dung R2 upload endpoints co san

Thay vi bat instructor paste URL thu cong:

- thumbnail upload -> `POST /upload/course-thumbnail`
- course preview upload -> `POST /upload/course-preview`
- lesson video upload -> `POST /upload/lesson-video`

Sau upload, frontend luu URL tra ve vao form course / lesson.

### 4. Management surfaces dung table thay vi card list

Instructor courses, instructor payout history, admin payout queue, admin course inventory se dung:

- table rows
- pagination
- items per page selector
- status badge
- action column

Card metrics van duoc giu cho KPI top-level, nhung record lists phai chuyen sang table.

### 5. Login phai ro luong vao

Public header chi giu:

- logo
- browse/catalog
- login
- register

Role-specific management links khong xuat hien lo lung tren public header. Login page phai ro:

- student login
- instructor workspace login
- admin workspace login
- CTA sang register neu role la guest/student

### 6. Detail / commerce / player phai noi lien mach

Client journey muc tieu:

`landing -> catalog -> detail -> wishlist/cart -> checkout -> my learning -> player -> completion`

Detail page se hoc pattern marketplace:

- sticky purchase rail
- preview video
- instructor trust block
- outcomes
- syllabus
- related courses
- faq / requirements / included items neu co

### 7. Instructor calendar la planning widget, khong phai LMS scheduler day du

Mantine calendar se duoc dua vao instructor workspace de:

- chon target publish date
- track content planning / QA target dates
- tao mot view desktop huu ich ngay ca khi chua co scheduling backend day du

## Risks / Trade-offs

- Scope lon, can rollout theo dot
- Mantine khong co data table opinionated built-in, nen can tu lap pattern bang Table + Pagination
- Upload video that can lam QA cham hon neu env R2 chua san sang
- Commerce UI moi can bam chat vao auth/session route de tranh regression

## Rollout Plan

### Dot 1
- theme xanh + spacing + shell/login/header cleanup
- instructor/admin tables + pagination + page size
- logo va auth entry cleanup
- video upload helpers + media fields + calendar widget

### Dot 2
- detail page nang cap
- wishlist/cart/checkout FE moi
- desktop my-learning + player refinement

### Dot 3
- QA seed video-first
- full build/test/e2e/manual checklist theo role
