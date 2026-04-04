## ADDED Requirements

### Requirement: Course detail route by slug
Frontend SHALL provide a public course detail route using the course slug.

#### Scenario: Open a published course
- **WHEN** a user navigates to `/course/:slug`
- **THEN** frontend SHALL load course detail from backend using the slug
- **AND** SHALL render the course detail page

#### Scenario: Missing course slug
- **WHEN** the slug does not match any published course
- **THEN** frontend SHALL show a not-found or unavailable state

### Requirement: Course detail content
Course detail SHALL provide the information needed to evaluate and purchase or start a course.

#### Scenario: View course detail
- **WHEN** a user opens a published course detail page
- **THEN** page SHALL show title, pricing, description, instructor summary, preview media, level, language, total lessons, total enrollments, rating summary, and lesson outline

#### Scenario: Preview lesson visibility
- **WHEN** a lesson is marked as preview
- **THEN** the course detail page SHALL identify it as preview-accessible before purchase

### Requirement: Discovery links land on a valid detail route
Wishlist, popular courses, and catalog cards SHALL link to a valid public course detail route.

#### Scenario: Open course from wishlist
- **WHEN** a user clicks a course from wishlist
- **THEN** system SHALL navigate to that course's valid detail route
