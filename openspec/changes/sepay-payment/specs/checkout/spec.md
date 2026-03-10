## ADDED Requirements

### Requirement: Order model
System SHALL have an Order model storing: orderCode (unique), userId, items (snapshot of courseId/title/price), totalAmount, status (pending/paid/expired), paidAt, sepayTransactionId, expiredAt, createdAt.

#### Scenario: Order created from checkout
- **WHEN** student clicks checkout
- **THEN** system SHALL create Order with status "pending", expiredAt = now + 10 minutes, and orderCode format "ED{timestamp}{random}"

### Requirement: Checkout endpoint
Backend SHALL provide `POST /api/checkout` endpoint that creates an Order from the user's cart and returns order details + QR info.

#### Scenario: Checkout with items in cart
- **WHEN** authenticated student sends POST /api/checkout
- **THEN** system SHALL create Order from cart items, return orderId, orderCode, totalAmount, qrUrl, and expiredAt

#### Scenario: Checkout with empty cart
- **WHEN** authenticated student sends POST /api/checkout with empty cart
- **THEN** system SHALL return status 400 with message "Cart is empty"

#### Scenario: Checkout without auth
- **WHEN** unauthenticated request to POST /api/checkout
- **THEN** system SHALL return status 401

### Requirement: Payment status endpoint
Backend SHALL provide `GET /api/order/:orderId/status` to check order payment status.

#### Scenario: Order pending
- **WHEN** FE polls status of a pending order within expiry time
- **THEN** system SHALL return { status: "pending" }

#### Scenario: Order paid
- **WHEN** FE polls status of a paid order
- **THEN** system SHALL return { status: "paid" }

#### Scenario: Order expired
- **WHEN** FE polls status and current time > expiredAt and status is still "pending"
- **THEN** system SHALL update status to "expired" and return { status: "expired" }

### Requirement: Post-payment processing
After order is marked as "paid", system SHALL automatically process enrollment and cleanup.

#### Scenario: Successful payment processing
- **WHEN** order status changes to "paid"
- **THEN** system SHALL create Enrollment record for each course in the order, clear user's cart items, increment Course.totalEnrollments for each course, and add totalAmount to Instructor.revenue for each course's instructor
