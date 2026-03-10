## 1. Backend Setup

- [x] 1.1 Thêm SePay env variables vào `.env` (SEPAY_MERCHANT_ID, SEPAY_SECRET_KEY, SEPAY_WEBHOOK_KEY, SEPAY_BANK_ACCOUNT, SEPAY_BANK_NAME)
- [x] 1.2 Tạo Order model (`src/models/Order.js`) — orderCode, userId, items, totalAmount, status, paidAt, sepayTransactionId, expiredAt

## 2. Checkout API

- [x] 2.1 Tạo checkout service (`src/services/checkout.service.js`) — createOrder (từ cart), getOrderById, getOrderStatus (check expiry), generateQrUrl
- [x] 2.2 Tạo checkout controller (`src/controllers/checkout.controller.js`) — checkout, getCheckoutInfo, getPaymentStatus
- [x] 2.3 Tạo checkout routes (`src/routes/checkout.route.js`) — POST /api/checkout, GET /api/checkout/:orderId, GET /api/order/:orderId/status

## 3. SePay Webhook

- [x] 3.1 Tạo webhook service (`src/services/webhook.service.js`) — parseOrderCode từ content, verifyPayment, processPayment (tạo enrollment, xóa cart, update revenue)
- [x] 3.2 Tạo webhook controller + route (`src/controllers/webhook.controller.js`, `src/routes/webhook.route.js`) — POST /api/webhook/sepay với API key verification

## 4. Register Routes

- [x] 4.1 Đăng ký checkout + webhook routes trong `app.js`

## 5. Frontend Checkout

- [x] 5.1 Tạo checkout API functions (`features/checkout/api/checkoutApi.js`) — createCheckout, getCheckoutInfo, getPaymentStatus
- [x] 5.2 Tạo CheckoutPage (`pages/checkout/CheckoutPage.jsx`) — QR code display, countdown timer, payment polling, success/expired states
- [x] 5.3 Cập nhật Cart page — kết nối nút "Proceed to Checkout" gọi API + redirect
- [x] 5.4 Thêm route `/checkout/:orderId` trong App.jsx
