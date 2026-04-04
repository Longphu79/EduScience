## ADDED Requirements

### Requirement: Resilient media placeholders
Frontend SHALL preserve layout integrity when dynamic course or instructor images are missing or fail to load.

#### Scenario: Missing course thumbnail
- **WHEN** a course card or course detail view renders without a valid thumbnail URL
- **THEN** the UI SHALL render a fallback image placeholder instead of broken alt text

#### Scenario: Missing instructor avatar
- **WHEN** instructor profile media is missing or invalid
- **THEN** the UI SHALL render a fallback avatar placeholder without breaking layout
