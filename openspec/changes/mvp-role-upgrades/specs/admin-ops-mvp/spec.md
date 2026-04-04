## ADDED Requirements

### Requirement: Admin overview surfaces platform operating pressure
The admin workspace SHALL summarize platform health, payout queue pressure, and course moderation focus.

#### Scenario: Admin opens overview
- **WHEN** an authenticated admin opens the admin overview route
- **THEN** the page SHALL show live platform metrics and the current operational backlog

### Requirement: Admin overview directs action into payout processing
The admin workspace SHALL provide an obvious path from overview to payout handling.

#### Scenario: Admin sees payout backlog
- **WHEN** the overview detects pending or processing payout requests
- **THEN** the page SHALL direct the admin into the payout management route
