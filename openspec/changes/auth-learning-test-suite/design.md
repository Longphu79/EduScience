## Context

Backend da co test harness native bang `node:test`, nen co the mo rong them scope auth/learning ma khong can them package. Cac module nay chu yeu la business logic + middleware, phu hop voi unit test co mock module methods.

## Goals / Non-Goals

**Goals**

- Cover cac edge case thuc te cua role guard, ownership, account self-service, va learning progress
- Fix bug runtime hoac semantics HTTP khong dung neu test lo ra
- Enforce 100% line/function/branch coverage cho cac module auth/learning duoc scope

**Non-Goals**

- E2E test voi Express + Mongo that
- Cover toan bo course/lesson service trong cung mot change
- UI testing cho route guard frontend

## Decisions

### 1. Mo rong native test harness thay vi them framework

Su dung tiep `node:test` va `mock.method` de giu test deterministic va khong keo dependency ngoai.

### 2. Gate coverage tren service/middleware auth-learning core

Coverage threshold 100% ap dung cho:

- `src/services/auth.service.js`
- `src/services/user.service.js`
- `src/services/access.service.js`
- `src/services/learning.service.js`
- `src/middleware/authMiddleware.js`

**Rationale:** day la core business logic cua authorization va learning flow, gia tri regression cao hon controller wrappers.

### 3. Test business behavior truoc, sua code theo bug that

Neu test lo ra cac van de nhu import sai case, missing `Admin` import, hay HTTP error semantics mo ho, se sua code san pham thay vi nau assertion de hop voi bug hien tai.

## Risks / Trade-offs

- Mock-based unit tests khong thay the duoc integration test voi Mongo query that.
- Coverage 100% cho scope duoc chon se lam test suite dai hon, nhung doi lai scope nay duoc khoa chat de refactor an toan.
