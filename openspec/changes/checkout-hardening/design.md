## Context

EduScience da co:

- Cart, checkout QR, payment polling
- SePay webhook de mark order `paid`
- Post-payment enrollment workflow

Nhung order hien tai chi co `status` (`pending/paid/expired`) va webhook xu ly side effects ngay sau khi save `paid`. Dieu nay lam cho payment va fulfillment bi dính vao nhau, kho retry an toan.

## Goals / Non-Goals

**Goals**

- Khong double-enroll, double-increment revenue, hoac double-increment `totalEnrollments` khi webhook bi retry
- Retry payment tu expired checkout page ma khong tao order trung lap khi cart khong doi
- Tach `order paid` va `order fulfilled`
- Cho student xem lich su order

**Non-Goals**

- Refund workflow
- Admin reconciliation dashboard day du
- Multi-payment gateway

## Decisions

### 1. Order co `fulfillmentStatus`

Them `fulfillmentStatus` (`pending`, `processing`, `completed`, `failed`) vao `Order`.

`status` tiep tuc dai dien cho payment status.

**Rationale:** Mot order co the da nhan tien nhung chua xong enrollment/cart cleanup. Tách hai state nay giup webhook retry an toan va debug de hon.

### 2. Pending order reuse dua tren `itemsSignature`

Checkout se build chu ky tu danh sach cart items (`courseId:quantity`, sort on dinh). Neu da ton tai order `pending` chua expired voi cung signature, reuse order do thay vi tao moi.

**Rationale:** Retry payment khong nen tao nhieu QR/order khac nhau cho cung mot gio hang.

### 3. Webhook claim order truoc khi fulfill

Webhook se atomically claim order vao `fulfillmentStatus=processing`. Neu order da `completed`, duplicate webhook tra ve no-op. Neu order `processing` qua lau, webhook retry co the reclaim.

**Rationale:** Giam race condition va cho phep retry neu process bi fail giua chung.

### 4. Side effects chi xay ra khi enrollment duoc tao moi

Enrollment dung `updateOne(..., { upsert: true })`. Chi khi `upsertedCount > 0` moi tang `Course.totalEnrollments` va `Instructor.revenue`.

**Rationale:** Day la khoa idempotency quan trong nhat cho fulfillment.

### 5. Cart chi remove purchased items

Khong clear toan bo cart. Chi `$pull` nhung `courseId` thuoc order da thanh toan.

**Rationale:** User co the them course moi vao cart trong luc dang cho thanh toan order cu.

### 6. Webhook controller chi tra 200 cho case thanh cong/no-op

Neu process that bai ben trong, controller tra 500 de SePay co the retry.

**Rationale:** `Always success` lam mat co hoi retry tu gateway va co the de order bi treo.

## Risks / Trade-offs

- `fulfillmentStatus=processing` bi treo neu app crash. Mitigation: cho phep reclaim sau mot stale timeout.
- Reuse pending order dua tren signature cua cart snapshot, nen neu gia course doi sau khi tao order cu thi order van giu snapshot cu. Day la chu y chap nhan duoc cho flow MVP.
- Neu DB khong ho tro transaction, van uu tien idempotent updates va order claim de giam risk nhan doi side effects.
