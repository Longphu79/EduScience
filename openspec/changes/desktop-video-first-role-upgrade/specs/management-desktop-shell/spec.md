## ADDED Requirements

### Requirement: Instructor and admin record lists use desktop tables
Instructor and admin workspaces SHALL render record-heavy views as desktop-first tables instead of card-only lists.

#### Scenario: Open instructor course inventory
- **WHEN** an instructor opens the course management route on a laptop viewport
- **THEN** the workspace SHALL render a table with course title, status, category, pricing, updated date, and actions
- **AND** SHALL provide pagination and an items-per-page control

#### Scenario: Open admin payout queue
- **WHEN** an admin opens the payout operations route on a laptop viewport
- **THEN** the workspace SHALL render a table with payout code, instructor, amount, status, bank summary, created date, and actions
- **AND** SHALL provide pagination and an items-per-page control

### Requirement: Management shell uses Mantine AppShell with desktop spacing
Instructor and admin routes SHALL use a desktop-first Mantine management shell.

#### Scenario: Open a management route on MacBook-sized viewport
- **WHEN** a signed-in instructor or admin opens a management page
- **THEN** the page SHALL provide wider side margins, stable top navigation, and non-mobile-first content density
- **AND** SHALL use Mantine badges, buttons, tables, pagination, and navigation components consistently
