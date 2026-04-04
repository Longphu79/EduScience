## MODIFIED Requirements

### Requirement: Checkout order creation
System SHALL avoid creating duplicate active orders for the same cart snapshot.

#### Scenario: Reuse active pending order
- **WHEN** a student retries checkout with an unchanged cart
- **THEN** system SHALL return the existing unexpired pending order
- **AND** SHALL not create a duplicate order record

#### Scenario: Create new order after expiry
- **WHEN** the latest matching pending order is expired
- **THEN** system SHALL mark the old order as expired
- **AND** SHALL create a fresh order for the current cart snapshot

### Requirement: Checkout fulfillment visibility
System SHALL expose enough order state for the frontend to distinguish payment status from fulfillment status.

#### Scenario: Paid but fulfillment still processing
- **WHEN** payment is received but post-payment fulfillment is not complete
- **THEN** the order response SHALL expose fulfillment metadata
