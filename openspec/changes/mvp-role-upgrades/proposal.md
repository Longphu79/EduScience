## Why

`frontend-next` da co live data, auth theo role, va route tach rieng cho client, instructor, admin. Nhung trang hien tai moi dung o muc "co route va co KPI". Neu so voi cac pattern san pham dang ban duoc course tren Udemy/Coursera, app van thieu cac lop gia tri de thanh MVP:

- client thieu landing co positioning ro, catalog co search/filter/sort, course detail co social proof va ly do mua
- student thieu cac tinh nang giu chan nhu notes, review, certificate, reminder, resume momentum
- instructor thieu workspace van hanh course, payout readiness, course health, va learner engagement triage
- admin thieu moderation, payout operations, va platform health dashboards

Neu khong khoa lai scope nay bang OpenSpec, FE rewrite se tiep tuc truot ve tinh trang "UI dep nhung role workflow mong".

## What Changes

- Nang public app thanh client-first discovery surface co the thuyet phuc guest truoc khi dang nhap
- Nang catalog va public course detail theo pattern MVP tu official product pages
- Nang instructor workspace thanh operational dashboard thay vi chi la mot overview card
- Nang admin workspace thanh platform ops dashboard gom payout queue, moderation focus, va health metrics
- Ghi ro backlog MVP tiep theo cho student, instructor, admin de implementation di theo thu tu

## Capabilities

### New Capabilities
- `client-discovery-mvp`
- `instructor-workspace-mvp`
- `admin-ops-mvp`

### Modified Capabilities
- `client-live-app`
- `role-management-separation`
- `student-learning-journey`
- `instructor-payout-requests`
- `admin-payout-processing`

## Impact

- **Frontend**: doi lai landing/catalog/course detail va tang chat luong workspace role
- **Backend**: mo rong public course detail payload de public page co them curriculum metadata
- **Product**: co roadmap ro cho client, student, instructor, admin thay vi chi co mot FE shell
