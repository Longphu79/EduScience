## ADDED Requirements

### Requirement: Course visibility control
Instructor-facing authoring UI SHALL allow a course author to control whether a course is visible in the public catalog.

#### Scenario: Create published course
- **WHEN** an instructor creates a course and keeps the default visibility
- **THEN** the course SHALL be submitted as `published`
- **AND** SHALL be eligible to appear in the public catalog

#### Scenario: Save draft course
- **WHEN** an instructor chooses `draft`
- **THEN** the course SHALL be saved as a non-public draft

#### Scenario: Edit existing course visibility
- **WHEN** an instructor opens an existing course in the form
- **THEN** the current visibility status SHALL be loaded into the form
