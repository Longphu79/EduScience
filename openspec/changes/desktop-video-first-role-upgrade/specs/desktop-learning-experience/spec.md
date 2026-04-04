## ADDED Requirements

### Requirement: My Learning is a desktop dashboard
The student learning home SHALL provide a dashboard-style desktop layout instead of a simple card list.

#### Scenario: Open My Learning on laptop
- **WHEN** an enrolled student opens My Learning on a laptop viewport
- **THEN** the page SHALL show progress summary, continue-learning focus, reminders, and richer course cards or rows optimized for wide screens

### Requirement: Learning player is video-first on desktop
The learning route SHALL prioritize the active lesson video and supporting study tools in a desktop-first layout.

#### Scenario: Open an enrolled course player
- **WHEN** a student opens a lesson player
- **THEN** the page SHALL show the video area prominently
- **AND** SHALL place syllabus, notes, resources, and comments in a layout appropriate for laptop screens

### Requirement: QA data keeps learning screens non-empty
The QA fixture dataset SHALL keep desktop learning and authoring surfaces non-empty by default.

#### Scenario: Seed local QA dataset
- **WHEN** the local QA seed is applied
- **THEN** public detail, wishlist, cart, checkout, my-learning, player, instructor media authoring, and payout screens SHALL all have meaningful data to render
