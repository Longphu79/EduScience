## ADDED Requirements

### Requirement: Authoring integration coverage
System SHALL maintain automated integration coverage for course authoring ownership and admin assignment behavior.

#### Scenario: Admin assigns instructor on create
- **WHEN** an admin creates a course with a selected instructor owner
- **THEN** the persisted course SHALL reference that instructor profile

#### Scenario: Admin reassigns course owner
- **WHEN** an admin updates an existing course with a different instructor owner
- **THEN** the persisted course SHALL reference the new instructor profile

### Requirement: Role workflow end-to-end coverage
System SHALL maintain automated end-to-end coverage for the primary role workflows over HTTP and a real test database.

#### Scenario: Guest workflow
- **WHEN** the guest workflow suite runs
- **THEN** it SHALL verify public discovery routes and protected route denial

#### Scenario: Instructor workflow
- **WHEN** the instructor workflow suite runs
- **THEN** it SHALL verify authenticated course authoring and lesson authoring

#### Scenario: Student workflow
- **WHEN** the student workflow suite runs
- **THEN** it SHALL verify wishlist, cart, checkout, webhook fulfillment, and learning access

#### Scenario: Admin workflow
- **WHEN** the admin workflow suite runs
- **THEN** it SHALL verify instructor option listing and admin-managed course ownership assignment
