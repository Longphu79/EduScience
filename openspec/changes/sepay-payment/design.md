## Context

EduScience có Cart system hoàn chỉnh (model, service, FE provider, UI). Student thêm course vào cart, thấy tổng tiền, nhưng không thể checkout. Enrollment model tồn tại nhưng chưa có logic tạo record. SePay Payment Gateway đã được setup với MBBank QR.

**SePay config:**
- Merchant ID: SP-LIVE-NC9ABA38
- Bank: MBBank, STK: 5920188557982
- Phương thức: QR chuyển khoản ngân hàng

## Goals / Non-Goals

**Goals:**
- Student checkout từ cart → hiển thị QR → scan thanh toán → enrolled vào course
- Order tracking với expiry 10 phút
- Webhook nhận callback từ SePay, verify và xử lý thanh toán
- Tạo Enrollment records sau thanh toán thành công

**Non-Goals:**
- Refund / hoàn tiền
- Subscription / thanh toán định kỳ
- Nhiều phương thức thanh toán (chỉ QR bank transfer)
- Invoice / hóa đơn
- Student.balance (giữ nguyên, không dùng trong flow này)

## Decisions

### 1. QR Code: Dùng SePay QR URL trực tiếp
Frontend render `<img>` từ URL:
```
https://qr.sepay.vn/img?acc=5920188557982&bank=MBBank&amount={amount}&des={orderCode}
```
**Rationale:** Không cần backend generate QR. SePay cung cấp sẵn. Bank account info lấy từ backend API (không hardcode trong FE).

**Alternatives:**
- SePay Checkout API (redirect tới SePay page): Mất control UI, nhưng SePay xử lý hết
- Generate QR ở backend: Overkill, SePay đã có service

### 2. Order Code format: `ED{timestamp}{random}`
Ví dụ: `ED1710123456789A3`. Unique, dễ parse từ webhook content field.

**Rationale:** SePay webhook gửi `content` chứa nội dung chuyển khoản. Cần orderCode unique để match.

### 3. Webhook verification: API Key header
SePay gửi `Authorization: Apikey {key}`. Backend verify header match.

**Rationale:** Đơn giản, đủ an toàn. SePay hỗ trợ sẵn.

### 4. FE polling thay vì WebSocket
FE poll `GET /api/order/{orderId}/status` mỗi 3 giây.

**Rationale:** Đơn giản, không cần setup WebSocket infrastructure. Polling 3s cho 10 phút = ~200 requests max, chấp nhận được.

### 5. Post-payment flow
Khi webhook xác nhận paid:
1. Order.status → "paid"
2. Tạo Enrollment cho mỗi course trong order
3. Xóa items trong Cart
4. Cập nhật Course.totalEnrollments (+1 cho mỗi course)
5. Cập nhật Instructor.revenue (+amount cho instructor)

### 6. Order expiry: Check lúc poll
Không cần cron job. Khi FE poll status, backend check `expiredAt < now` → trả "expired".

## Risks / Trade-offs

- **[Webhook không tới (network issue)]** → FE hiện "expired" sau 10 phút. Student phải retry hoặc liên hệ support. Mitigation: SePay retry webhook theo Fibonacci (max 7 lần trong 5 giờ).
- **[Duplicate webhook]** → Dùng `sepayTransactionId` để dedup. Nếu đã xử lý thì skip.
- **[Race condition: 2 webhook cùng lúc]** → Dùng Order.status check trước khi update. Chỉ process nếu status === "pending".
- **[Bank account lộ trong QR URL]** → Chấp nhận — QR code bản chất là public. Số tài khoản không phải sensitive info.
