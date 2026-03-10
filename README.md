# EduScience - Nền tảng học trực tuyến

Nền tảng e-learning cho phép giảng viên tạo và quản lý khóa học, học viên mua và học trực tuyến với thanh toán QR qua SePay.

## Tech Stack

| Layer          | Công nghệ                              |
| -------------- | -------------------------------------- |
| Frontend       | React 19 + Vite + Tailwind CSS v4     |
| Backend        | Express 5 + Node.js                   |
| Database       | MongoDB + Mongoose                    |
| Authentication | JWT (jsonwebtoken + bcryptjs)          |
| File Storage   | Cloudflare R2 (S3-compatible)          |
| Payment        | SePay QR Gateway                       |

## Tính năng chính

- **Xác thực:** Đăng ký, đăng nhập, phân quyền (Student / Instructor / Admin)
- **Quản lý khóa học:** CRUD khóa học, bài học với upload video
- **Upload file:** Avatar, thumbnail, video qua Cloudflare R2
- **Giỏ hàng & Wishlist:** Thêm/xóa khóa học
- **Thanh toán:** QR code chuyển khoản ngân hàng qua SePay, webhook xác nhận tự động
- **Hồ sơ người dùng:** Cập nhật thông tin, đổi mật khẩu, vô hiệu hóa tài khoản

## Yêu cầu

- **Node.js** >= 18
- **MongoDB** (local hoặc MongoDB Atlas)
- **npm** hoặc **yarn**

## Cài đặt & Chạy

### 1. Clone repo

```bash
git clone git@github.com:Longphu79/EduScience.git
cd EduScience
```

### 2. Cài đặt Backend

```bash
cd backend
npm install
```

Tạo file `backend/.env`:

```env
PORT=4000
MONGO_URI=mongodb://localhost:27017/edu_scienceDB

JWT_SECRET=your_jwt_secret

# Cloudflare R2
R2_ACCOUNT_ID=your_r2_account_id
R2_ACCESS_KEY_ID=your_r2_access_key
R2_SECRET_ACCESS_KEY=your_r2_secret_key
R2_BUCKET_NAME=your_bucket_name
R2_PUBLIC_URL=your_r2_public_url

# SePay Payment
SEPAY_MERCHANT_ID=your_merchant_id
SEPAY_SECRET_KEY=your_secret_key
SEPAY_WEBHOOK_KEY=your_webhook_key
SEPAY_BANK_ACCOUNT=your_bank_account
SEPAY_BANK_NAME=your_bank_name
```

Chạy backend:

```bash
# Development (auto-reload)
npm run dev

# Production
npm start
```

Backend chạy tại `http://localhost:4000`

### 3. Cài đặt Frontend

```bash
cd frontend
npm install
```

Tạo file `frontend/.env`:

```env
VITE_API_URL=http://localhost:4000
```

Chạy frontend:

```bash
npm run dev
```

Frontend chạy tại `http://localhost:5173`

## API Endpoints

| Method | Endpoint          | Mô tả                        |
| ------ | ----------------- | ----------------------------- |
| POST   | `/auth/register`  | Đăng ký tài khoản             |
| POST   | `/auth/login`     | Đăng nhập                     |
| GET    | `/course`         | Danh sách khóa học            |
| POST   | `/course`         | Tạo khóa học mới              |
| GET    | `/course/:slug`   | Chi tiết khóa học             |
| GET    | `/api/cart`       | Xem giỏ hàng                  |
| POST   | `/api/cart`       | Thêm vào giỏ hàng             |
| POST   | `/api/checkout`   | Tạo đơn hàng & QR thanh toán  |
| GET    | `/api/order/:id`  | Trạng thái đơn hàng           |
| POST   | `/api/upload/*`   | Upload file (avatar/video/thumbnail) |
| POST   | `/api/webhook/sepay` | Webhook xác nhận thanh toán |
| GET    | `/wishlist`       | Xem wishlist                   |

## Cấu trúc thư mục

```
EduScience/
├── backend/
│   ├── src/
│   │   ├── config/        # Database & JWT config
│   │   ├── controllers/   # Request handlers
│   │   ├── middleware/     # Auth & upload middleware
│   │   ├── models/        # Mongoose schemas
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   └── app.js         # Entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── features/      # Feature modules (auth, cart, course, ...)
│   │   ├── pages/         # Page components
│   │   ├── layouts/       # Header, Footer, MainLayout
│   │   ├── shared/        # Shared components
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
└── README.md
```

## Team

Dự án được phát triển bởi nhóm EduScience.
