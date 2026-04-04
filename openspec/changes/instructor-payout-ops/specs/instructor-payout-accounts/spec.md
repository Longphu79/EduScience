## ADDED Requirements

### Requirement: Instructor payout account management
System SHALL allow an instructor to store and update the bank account used for payouts.

#### Scenario: Save payout account
- **WHEN** an instructor submits payout account information
- **THEN** the system SHALL persist bank name, account number, account holder name, branch, and optional transfer note

#### Scenario: Read payout account
- **WHEN** an instructor opens payout settings
- **THEN** the system SHALL return the currently linked payout account if one exists
