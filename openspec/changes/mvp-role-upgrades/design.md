## Context

Qua doi chieu pattern tu cac nguon chinh thuc:

- Udemy course/instructor surfaces nhan manh course evaluation, reviews, instructor credibility, va payout reporting cho instructor
- Coursera course pages nhan manh outcomes, module structure, flexibility, reviews, va shareable certificate
- Coursera for Business nhan manh analytics va operating visibility cho org/admin buyers

Codebase hien tai da co:
- live public catalog/detail APIs
- learning route co progress va lesson comments
- payout request flow co instructor va admin routes
- role dashboards rieng trong `frontend-next`

Nhung chua co:
- conversion layer cho guest
- operational layer cho instructor/admin
- retention layer day du cho student

## Goals / Non-Goals

**Goals**
- Bien public app thanh mot client-facing product surface thuyet phuc hon
- Xac dinh ro MVP feature set cho `guest`, `student`, `instructor`, `admin`
- Implement ngay slice uu tien nhat cho client discovery va role workspace clarity

**Non-Goals**
- Lam het authoring suite moi trong mot dot
- Xay recommendation engine hay adaptive learning ngay lap tuc
- Xay accounting ledger day du trong dot dau

## Role Upgrade Decisions

### 1. Client / Guest uu tien conversion truoc
Slice code ngay:
- landing page client-first
- catalog co query/search/filter/sort
- public course detail co outcomes, curriculum preview, instructor trust, va related courses

Backlog MVP tiep theo:
- wishlist/save for later tot hon
- reviews va social proof that
- checkout confidence states
- notifications va resume learning entry

### 2. Student uu tien retention sau khi conversion dung
Backlog MVP:
- notes / bookmark theo lesson
- review sau khi hoan thanh
- certificate va completion milestone
- resume learning, learning streak, reminder

### 3. Instructor can workspace van hanh, khong chi payout
Slice code ngay:
- instructor overview co action center, payout readiness, publication pipeline, course health snapshot

Backlog MVP:
- next authoring workspace trong Next app
- publish checklist
- learner Q&A moderation
- coupon / promotion va performance analytics

### 4. Admin can platform ops va moderation
Slice code ngay:
- admin overview co queue visibility, moderation focus, va operational priorities

Backlog MVP:
- moderation queue cho draft/archived/risky courses
- payout ledger / audit trail
- incident reporting, support triage, growth analytics

## Sequence

1. Public conversion surfaces
2. Instructor workspace clarity
3. Admin operating visibility
4. Student retention layer
5. Authoring and moderation depth

## Risks / Trade-offs

- Public pages van chua co reviews/certificates that nen phai dung curriculum va instructor trust de bo khoang tam thoi
- Instructor/admin workspace se ro hon ngay ca khi authoring workspace moi chua port xong
- Neu khong tach thu tu uu tien, rewrite se lai bi tan man vao qua nhieu route phu
