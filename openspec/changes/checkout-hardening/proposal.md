## Why

Payment flow hien da chay duoc MVP, nhung van con cac diem yeu cho production:

- webhook co the mark order `paid` truoc khi fulfillment xong
- duplicate webhook co the gay double-count revenue/enrollment neu khong khoa idempotency dung cach
- checkout luon tao order moi, chua reuse pending order cho retry payment
- order expiry va retry UX chua ro rang
- student chua co order history de theo doi thanh toan

Sau khi da co `student-learning-journey`, payment flow can duoc gia co de phan checkout va hoc tap noi nhau on dinh.

## What Changes

- Them order fulfillment state de tach `payment received` va `fulfillment completed`
- Lam webhook idempotent, retry-safe, va khong xoa nham cart items khong lien quan
- Reuse pending order neu cart chua doi, va tao order moi neu order cu da expired
- Them order history API va UI cho student
- Cap nhat checkout UI de retry payment truc tiep tu expired state

## Capabilities

### New Capabilities
- `order-history`: danh sach order cua current user voi status va items

### Modified Capabilities
- `checkout`: pending order reuse, expired order retry, expose fulfillment metadata
- `sepay-webhook`: idempotent payment processing, safe retry semantics
- `checkout-ui`: retry payment va dieu huong ro rang theo order state

## Impact

- **Backend**: cap nhat `Order` model, checkout service, webhook service, order routes
- **Frontend**: them order history page, retry button trong checkout expired state, cap nhat header/navigation
- **Product**: giam risk don da thanh toan nhung chua enroll, va cho user self-serve theo doi giao dich
