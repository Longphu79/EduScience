## ADDED Requirements

### Requirement: Public shell excludes role management navigation
The public client-facing shell SHALL not expose instructor or admin management navigation as primary landing page affordances.

#### Scenario: Open public landing page
- **WHEN** a visitor opens the landing page
- **THEN** the page SHALL focus on client discovery and learning CTAs
- **AND** SHALL not mix in admin or instructor management navigation

### Requirement: Instructor management routes are separate
Instructor management workflows SHALL live inside a dedicated instructor route space with role-specific authentication.

#### Scenario: Instructor login and access
- **WHEN** an instructor logs in through the instructor login route
- **THEN** the app SHALL redirect to the instructor management routes

### Requirement: Admin management routes are separate
Admin operations SHALL live inside a dedicated admin route space with role-specific authentication.

#### Scenario: Admin login and access
- **WHEN** an admin logs in through the admin login route
- **THEN** the app SHALL redirect to the admin management routes
