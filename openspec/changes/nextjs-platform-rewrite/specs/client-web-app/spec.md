## ADDED Requirements

### Requirement: Next.js client app foundation
System SHALL provide a separate Next.js App Router frontend for public and student-facing experiences.

#### Scenario: Open the new app
- **WHEN** a user starts the new frontend workspace
- **THEN** the application SHALL boot from the Next.js app router
- **AND** SHALL render a public landing experience without relying on the legacy Vite app

### Requirement: Non-empty public and student routes
Public and student-facing routes SHALL render with meaningful fake or live data by default during the rewrite phase.

#### Scenario: Open key routes during redesign
- **WHEN** a user opens home, catalog, course detail, or learning routes in the new app
- **THEN** each route SHALL render non-empty content states suitable for product QA

### Requirement: Learning-first client experience
The new app SHALL prioritize learning workflow surfaces similar to modern course platforms.

#### Scenario: Open a lesson experience
- **WHEN** a student opens a lesson route
- **THEN** the page SHALL show lesson detail, curriculum context, progress context, and discussion entry points
