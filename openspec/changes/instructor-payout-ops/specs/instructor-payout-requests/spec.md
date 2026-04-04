## ADDED Requirements

### Requirement: Instructor payout requests
System SHALL allow an instructor to create payout requests against available earnings.

#### Scenario: Create payout request
- **WHEN** an instructor submits a payout request amount within available balance
- **THEN** the system SHALL create a payout request in `pending` state linked to the instructor payout account

#### Scenario: Reject payout request over balance
- **WHEN** an instructor requests more than available balance
- **THEN** the system SHALL reject the request

### Requirement: Instructor payout history
The instructor payout workspace SHALL provide payout request history.

#### Scenario: Open payout history
- **WHEN** an instructor opens the payout page
- **THEN** the system SHALL list payout requests with statuses such as `pending`, `processing`, `paid`, or `rejected`
