## ADDED Requirements

### Requirement: Landing page focuses on learner conversion
The client landing page SHALL communicate value for guests and students without mixing in instructor or admin operations.

#### Scenario: Guest opens landing page
- **WHEN** a guest opens the root route
- **THEN** the page SHALL present a learner-focused hero, trust signals, discovery sections, and clear catalog CTAs

### Requirement: Public catalog supports guided discovery
The client catalog SHALL support search, category filter, level filter, sort order, and a recovery path when a query returns no results.

#### Scenario: Filter published courses
- **WHEN** a guest or student changes catalog search or filters
- **THEN** the page SHALL request published courses from the live backend with those constraints
- **AND** SHALL show the active result context to the user

### Requirement: Public course detail supports evaluation before login
The public course detail page SHALL help guests decide whether a course is worth enrolling in.

#### Scenario: Evaluate a published course
- **WHEN** a guest opens a public course detail page
- **THEN** the page SHALL show outcomes, curriculum preview, instructor credibility, price context, and related courses
