## ADDED Requirements

### Requirement: Local QA fixture dataset
System SHALL provide a repeatable local QA fixture dataset so that core manual QA screens are not empty by default.

#### Scenario: Seed local QA dataset
- **WHEN** the QA seed script runs
- **THEN** the system SHALL create fixed local QA accounts for `student`, `instructor`, and `admin`
- **AND** SHALL create enough related data for catalog, wishlist, cart, orders, and learning pages to render non-empty states

### Requirement: QA handoff guide
System SHALL provide documented credentials and a prioritized role-based QA checklist.

#### Scenario: QA handoff
- **WHEN** a developer finishes seeding local QA data
- **THEN** the repository SHALL include the seeded account credentials and the suggested test order by role
