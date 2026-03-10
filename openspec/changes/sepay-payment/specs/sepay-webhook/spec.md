## ADDED Requirements

### Requirement: SePay webhook endpoint
Backend SHALL provide `POST /api/webhook/sepay` endpoint to receive payment notifications from SePay.

#### Scenario: Valid webhook with matching order
- **WHEN** SePay sends POST with valid API key header and content containing order code (e.g. "ED1710123456789A3")
- **THEN** system SHALL extract orderCode from content, find matching pending order, verify amount matches, mark order as "paid", store sepayTransactionId, run post-payment processing, and return { success: true }

#### Scenario: Invalid API key
- **WHEN** SePay sends POST without valid Authorization header
- **THEN** system SHALL return status 401

#### Scenario: No matching order
- **WHEN** webhook content does not match any pending order
- **THEN** system SHALL return { success: true } (acknowledge but ignore)

#### Scenario: Amount mismatch
- **WHEN** webhook transferAmount does not match order totalAmount
- **THEN** system SHALL log the mismatch and return { success: true } (acknowledge but do not mark as paid)

#### Scenario: Duplicate webhook (already paid)
- **WHEN** webhook arrives for an order already marked as "paid"
- **THEN** system SHALL return { success: true } without reprocessing

### Requirement: Webhook payload parsing
System SHALL parse SePay webhook JSON payload extracting: id, transferAmount, content (contains orderCode), transferType, referenceCode.

#### Scenario: Extract orderCode from content
- **WHEN** webhook content is "NGUYEN CANH KHANH ED1710123456789A3"
- **THEN** system SHALL extract "ED1710123456789A3" using regex pattern /ED\w+/
