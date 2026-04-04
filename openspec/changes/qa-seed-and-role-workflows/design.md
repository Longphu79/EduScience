## Context

Repo hien chi co backend unit tests va frontend build verification. Khong co browser runner san, nen giai phap kha thi nhat trong workspace hien tai la:

- dung local QA seed data cho manual FE verification
- dung HTTP-level integration/E2E tests tren Express + Mongo that cho role workflows

## Goals / Non-Goals

**Goals**

- Local app len la co du data cho guest/student/instructor/admin QA
- Automated tests cover authoring/admin assignment va role workflows tren route level
- Ban giao account/password va flow test ro rang

**Non-Goals**

- Visual regression testing
- Browser automation framework moi neu khong can thiet
- Reset toan bo DB cua nguoi dung

## Decisions

### 1. Seed chi don dep du lieu QA-prefix

Seed script chi remove/recreate cac ban ghi QA co prefix co dinh thay vi wipe toan bo DB.

### 2. E2E o muc HTTP + real Mongo

Dung Express app + fetch + Mongo test DB de cover role workflows end-to-end trong pham vi backend he thong.

**Rationale:** khong can them dependency browser runner moi ma van cover duoc auth, route guards, persistence, checkout, webhook, learning.

### 3. Tach app config khoi server startup

Refactor `app` va `server` de test co the start app tren random port ma khong auto-listen.

## Risks / Trade-offs

- E2E khong click browser UI that, nen frontend wiring van can manual QA bo sung.
- Integration/E2E tests can local Mongo, vi vay verify script can chay o moi truong co DB local.
