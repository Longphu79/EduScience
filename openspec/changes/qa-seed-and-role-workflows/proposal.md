## Why

Repo hien da co unit/regression suite tot cho service core, nhung van thieu 3 thu can cho QA thuc te:

- local mock data de web khong bi trang o cac page chinh
- integration test cho course authoring va admin assignment
- end-to-end role workflows de xac nhan guest, instructor, student, admin di qua luong that tren API va database that

## What Changes

- Them QA seed data va account co dinh cho local manual testing
- Them integration tests cho course authoring/admin assignment
- Them E2E role workflow tests `guest -> instructor -> student -> admin`
- Refactor startup de app co the duoc boot trong test ma khong tu dong listen port
- Them tai lieu ban giao account va luong test uu tien theo role

## Capabilities

### New Capabilities
- `qa-seed-data`
- `role-workflow-tests`

### Modified Capabilities
- `course authoring`
- `authorization`
- `checkout`
- `learning-progress`

## Impact

- **Backend**: co seed script, integration/e2e test harness, va startup structure phu hop cho automation
- **Frontend QA**: co du data de check khong-bi-empty tren cac page chinh
- **Product QA**: co account co dinh va flow test theo role de test tay nhanh
