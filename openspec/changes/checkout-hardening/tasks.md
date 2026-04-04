## 1. Backend Order Hardening

- [x] 1.1 Mo rong `Order` model voi `itemsSignature`, `fulfillmentStatus`, `fulfilledAt`, `lastProcessingError`
- [x] 1.2 Reuse pending order khi checkout voi cart snapshot khong doi
- [x] 1.3 Chi remove cart items da duoc thanh toan thay vi clear toan bo cart

## 2. Webhook Idempotency

- [x] 2.1 Atomically claim order truoc khi chay fulfillment
- [x] 2.2 Chi tang enrollments/revenue khi enrollment duoc tao moi
- [x] 2.3 Tra 500 cho processing error de gateway retry

## 3. Order History

- [x] 3.1 Them API lay order history cua current user
- [x] 3.2 Them frontend page hien thi order history
- [x] 3.3 Expose order state ro rang cho pending/paid/expired/fulfillment

## 4. Retry UX

- [x] 4.1 Retry payment tu checkout expired state
- [x] 4.2 Header/navigation link toi order history
- [x] 4.3 Verify lint/build va cap nhat task status
