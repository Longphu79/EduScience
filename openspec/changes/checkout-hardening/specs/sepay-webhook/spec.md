## MODIFIED Requirements

### Requirement: Idempotent payment fulfillment
System SHALL process SePay webhook retries without duplicating enrollments or revenue side effects.

#### Scenario: Duplicate webhook for completed order
- **WHEN** SePay sends the same paid webhook again after fulfillment completed
- **THEN** system SHALL treat it as a no-op success

#### Scenario: Webhook retry after processing failure
- **WHEN** payment was recorded but fulfillment failed
- **THEN** a subsequent valid webhook SHALL be able to retry fulfillment safely

### Requirement: Retry semantics
System SHALL allow the payment gateway to retry on internal processing failures.

#### Scenario: Fulfillment error
- **WHEN** order fulfillment throws an internal error
- **THEN** webhook endpoint SHALL return a non-2xx response
