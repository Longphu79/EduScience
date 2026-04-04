## Context

Project hien dang khong co test framework khai bao trong `backend/package.json`. Tuy vay, runtime dang dung Node 25, nen co the dung `node:test` native va `--experimental-test-coverage` ma khong can keo them dependencies.

## Goals / Non-Goals

**Goals**

- Co test runner on dinh, khong phu thuoc network/install them package
- Cover edge cases thuc te cho payment logic
- Enforce 100% line/function/branch coverage cho cac module critical da chon

**Non-Goals**

- Bao phu 100% toan bo monorepo trong mot lan
- Browser/UI snapshot testing
- E2E test voi database that

## Decisions

### 1. Dung `node:test`

Su dung test runner native de giam maintenance va tranh network dependency.

### 2. Mock o muc module object

Patch methods tren mongoose models va service dependencies bang `mock.method`.

**Rationale:** nhanh, deterministic, va phu hop voi business logic tests.

### 3. Coverage gate chi ap dung cho payment core

Dat 100% threshold cho:

- `src/services/checkout.service.js`
- `src/services/webhook.service.js`

**Rationale:** day la vung rui ro cao nhat, va phu hop voi yeu cau "100% moi pass" theo cach thuc te va co gia tri.

## Risks / Trade-offs

- Unit test voi mocks khong thay the full integration test voi Mongo that.
- Mot so route/controller khong nam trong threshold 100%, nhung van duoc giu o smoke-check/import-check hien tai.
