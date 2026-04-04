## ADDED Requirements

### Requirement: Public course catalog
System SHALL provide a public course catalog backed by persisted course data instead of frontend mock data.

#### Scenario: Browse published courses
- **WHEN** a guest or authenticated user opens the catalog page
- **THEN** system SHALL fetch course data from backend
- **AND** SHALL display only published courses

#### Scenario: No matching courses
- **WHEN** the active filters return no published courses
- **THEN** frontend SHALL show an empty state with guidance to change filters

### Requirement: Catalog query filters
Backend SHALL support catalog query filters for search and discovery.

#### Scenario: Filter by category and level
- **WHEN** a user requests `GET /course` with `category` and `level` query params
- **THEN** system SHALL return only courses matching those filters

#### Scenario: Search by keyword
- **WHEN** a user requests `GET /course` with a keyword query
- **THEN** system SHALL match against public discovery fields such as title, short description, category, and instructor summary

#### Scenario: Sort catalog
- **WHEN** a user requests the catalog with a supported sort option
- **THEN** system SHALL return results in the requested order

### Requirement: Catalog pagination
System SHALL paginate catalog results to keep discovery performant as course volume grows.

#### Scenario: Request second page
- **WHEN** a user requests page 2 with a limit
- **THEN** system SHALL return only the slice of results for that page
- **AND** SHALL include pagination metadata needed by the frontend
