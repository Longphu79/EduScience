# EduScience

Nền tảng e-learning với public catalog cho learner, learning workspace cho student, management workspace riêng cho instructor/admin, checkout qua SePay, và backend Express + MongoDB.

## Tech Stack

| Layer | Công nghệ |
| --- | --- |
| Frontend chính | Next.js 16 + React 19 + Mantine 9 |
| Backend | Express 5 + Node.js |
| Database | MongoDB + Mongoose |
| Authentication | JWT + Next session proxy |
| Payment | SePay webhook flow |
| Storage | Cloudflare R2 |

## App Surface

- Public client app: landing page, catalog, course detail
- Student app: `my-learning`, lesson detail, comments, notes, bookmarks, reviews, reminders, certificate
- Instructor app: overview, course management, authoring workspace, payout workspace
- Admin app: overview, moderation queue, payout queue, payout ledger

## Cài đặt

### 1. Backend

```bash
cd backend
npm install
```

Tạo `backend/.env`:

```env
PORT=4000
MONGO_URI=mongodb://localhost:27017/edu_scienceDB
JWT_SECRET=your_jwt_secret

R2_ACCOUNT_ID=your_r2_account_id
R2_ACCESS_KEY_ID=your_r2_access_key
R2_SECRET_ACCESS_KEY=your_r2_secret_key
R2_BUCKET_NAME=your_bucket_name
R2_PUBLIC_URL=your_r2_public_url

SEPAY_MERCHANT_ID=your_merchant_id
SEPAY_SECRET_KEY=your_secret_key
SEPAY_WEBHOOK_KEY=your_webhook_key
SEPAY_BANK_ACCOUNT=your_bank_account
SEPAY_BANK_NAME=your_bank_name
```

Chạy backend:

```bash
npm run dev
```

Backend mặc định ở `http://localhost:4000`.

### 2. Frontend chính

```bash
cd frontend
npm install
```

Chạy frontend:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000 npm run dev
```

Frontend mặc định ở `http://localhost:3000`.

## QA Accounts

Sau khi seed QA data:

```bash
cd backend
npm run seed:qa
```

Password chung:

```text
QaDemo123!
```

Accounts:

- Student: `qa.student`
- Instructor: `qa.instructor`
- Admin: `qa.admin`
- Alternate instructor: `qa.instructor.alt`

Chi tiết manual workflow xem tại [docs/qa-role-workflows.md](/Users/duongthanhphu/EduScience/docs/qa-role-workflows.md).

## Test Commands

Backend:

```bash
cd backend
npm test
npm run test:integration
npm run test:e2e
```

Frontend:

```bash
cd frontend
npm run build
npm run test:e2e
```

## Cấu trúc thư mục

```text
EduScience/
├── backend/
├── frontend/         # Next.js app chính
├── docs/
└── openspec/
```
