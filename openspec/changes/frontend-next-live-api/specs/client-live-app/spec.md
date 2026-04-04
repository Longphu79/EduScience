## ADDED Requirements

### Requirement: Public pages use live backend data
The Next.js client app SHALL render public discovery pages from backend APIs instead of local mock fixtures.

#### Scenario: Open catalog
- **WHEN** a user opens the public catalog route
- **THEN** the app SHALL load courses from the backend public course API

#### Scenario: Open course detail
- **WHEN** a user opens a course detail route
- **THEN** the app SHALL load the course detail payload from the backend by slug

### Requirement: Learning route uses authenticated live data
The learning experience SHALL load course detail, progress, and discussion data from authenticated backend APIs.

#### Scenario: Student opens learning route
- **WHEN** an authenticated student opens `/learn/:slug`
- **THEN** the app SHALL load learning data from the backend
- **AND** SHALL load lesson comments for the selected lesson
