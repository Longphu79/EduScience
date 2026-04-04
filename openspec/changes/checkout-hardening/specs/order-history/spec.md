## ADDED Requirements

### Requirement: Order history page
Frontend SHALL provide an authenticated order history view for the current user.

#### Scenario: View past orders
- **WHEN** an authenticated user opens order history
- **THEN** system SHALL return the user's orders in reverse chronological order
- **AND** each order SHALL include items, total amount, payment status, and fulfillment status

#### Scenario: No orders yet
- **WHEN** a user has never checked out
- **THEN** frontend SHALL show an empty state with a path back to discovery or cart
