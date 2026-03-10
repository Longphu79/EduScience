## ADDED Requirements

### Requirement: Cart checkout button
Cart page "Proceed to Checkout" button SHALL navigate to checkout flow.

#### Scenario: Click checkout
- **WHEN** student clicks "Proceed to Checkout" on cart page
- **THEN** system SHALL call POST /api/checkout, then redirect to /checkout/{orderId}

### Requirement: Checkout page with QR
Frontend SHALL provide a Checkout page at /checkout/:orderId displaying SePay QR code and payment info.

#### Scenario: Display QR code
- **WHEN** student lands on /checkout/:orderId
- **THEN** page SHALL display QR code image from SePay URL, total amount, bank info, order code, and countdown timer starting from remaining time

#### Scenario: Countdown timer
- **WHEN** checkout page is open
- **THEN** page SHALL show countdown timer. When timer reaches 0, display "Payment expired" message with option to retry

### Requirement: Payment status polling
Checkout page SHALL poll backend for payment status every 3 seconds.

#### Scenario: Payment confirmed
- **WHEN** poll returns status "paid"
- **THEN** page SHALL stop polling, show success message, and redirect to courses/my-courses after 3 seconds

#### Scenario: Payment expired
- **WHEN** poll returns status "expired"
- **THEN** page SHALL stop polling and show expired message with link back to cart

### Requirement: QR info endpoint
Backend SHALL provide `GET /api/checkout/:orderId` to return order details and QR URL for the checkout page.

#### Scenario: Get checkout info
- **WHEN** authenticated user requests GET /api/checkout/:orderId
- **THEN** system SHALL return orderCode, totalAmount, qrUrl, expiredAt, status, and items list
