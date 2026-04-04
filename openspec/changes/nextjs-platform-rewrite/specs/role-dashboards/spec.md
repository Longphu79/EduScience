## ADDED Requirements

### Requirement: Dedicated instructor route space
System SHALL provide a dedicated instructor route space separate from public and student navigation.

#### Scenario: Open instructor workspace
- **WHEN** an instructor navigates to `/instructor`
- **THEN** the app SHALL render an instructor dashboard shell with seeded overview data and navigation to courses, payouts, and teaching operations

### Requirement: Dedicated admin route space
System SHALL provide a dedicated admin route space separate from public and instructor navigation.

#### Scenario: Open admin workspace
- **WHEN** an admin navigates to `/admin`
- **THEN** the app SHALL render an admin operations dashboard with seeded operational data and navigation to payouts, instructors, and platform metrics

### Requirement: Role routes use realistic seeded data
Instructor and admin dashboard routes SHALL not default to empty placeholders during the rewrite phase.

#### Scenario: QA admin and instructor flows
- **WHEN** a product reviewer opens the seeded role dashboards
- **THEN** the system SHALL display representative tables, stats, and task queues using fake data
