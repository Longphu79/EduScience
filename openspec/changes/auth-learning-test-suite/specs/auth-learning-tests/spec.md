## ADDED Requirements

### Requirement: Authorization and learning regression suite
System SHALL maintain an automated regression suite for core authorization, account self-service, and learning progress logic.

#### Scenario: Authorization regression
- **WHEN** auth, role guard, ownership, or account self-service logic changes
- **THEN** automated tests SHALL validate authentication, authorization, profile access, and password/account update behavior

#### Scenario: Learning regression
- **WHEN** my-courses or lesson progress logic changes
- **THEN** automated tests SHALL validate enrollment-gated access, progress summaries, completion state, and lesson state transitions

### Requirement: Coverage gate for auth-learning core
Critical auth-learning modules SHALL meet strict automated coverage thresholds before the suite is considered passing.

#### Scenario: Coverage run
- **WHEN** the auth-learning coverage command runs
- **THEN** the configured auth-learning modules SHALL meet 100% line, branch, and function coverage
