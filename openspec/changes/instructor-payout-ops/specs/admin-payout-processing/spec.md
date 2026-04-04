## ADDED Requirements

### Requirement: Admin payout queue
System SHALL provide admins with a payout operations queue.

#### Scenario: Open payout operations
- **WHEN** an admin opens the payout management route
- **THEN** the system SHALL list payout requests with instructor identity, amount, request status, and payout account summary

### Requirement: Manual payout completion
Admin SHALL be able to mark a payout request as paid after completing an off-platform transfer.

#### Scenario: Mark request as paid
- **WHEN** an admin confirms a manual transfer to the instructor payout account
- **THEN** the system SHALL store the payout request as `paid`
- **AND** SHALL record who processed it and when
