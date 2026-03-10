## Why

Hệ thống EduScience có giỏ hàng (Cart) nhưng chưa có thanh toán. Nút "Proceed to Checkout" chưa có onClick handler. Student không thể mua course. Cần tích hợp SePay (QR chuyển khoản ngân hàng) để hoàn chỉnh luồng mua khóa học.

## What Changes

- Tạo Order model lưu đơn hàng với trạng thái thanh toán (pending/paid/expired)
- Tạo checkout endpoint: tạo order từ cart, trả về thông tin QR
- Tạo SePay webhook endpoint: nhận callback khi thanh toán thành công
- Tạo payment status polling endpoint: FE kiểm tra trạng thái order
- Post-payment logic: tạo Enrollment, xóa cart items, cập nhật Instructor.revenue
- Tạo Checkout page (FE): hiển thị QR code SePay, countdown 10 phút, auto-redirect khi paid
- Kết nối nút "Proceed to Checkout" trong Cart page

## Capabilities

### New Capabilities
- `checkout`: Order model, checkout endpoint, payment status polling, post-payment enrollment
- `sepay-webhook`: SePay webhook receiver, payment verification, order matching
- `checkout-ui`: Checkout page với QR code, countdown timer, payment status polling

### Modified Capabilities

## Impact

- **Backend**: Thêm Order model, thêm routes (checkout, webhook, payment status), thêm .env với SePay credentials + bank info
- **Frontend**: Thêm Checkout page, cập nhật Cart page (kết nối nút Checkout), thêm route /checkout/:orderId
- **Models**: Thêm Order model mới. Enrollment model đã tồn tại — sẽ tạo records sau thanh toán
- **External**: SePay webhook URL cần được config trong SePay dashboard
