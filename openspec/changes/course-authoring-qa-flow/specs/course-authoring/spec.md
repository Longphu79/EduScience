## ADDED Requirements

### Requirement: Authoring QA shortcuts
Course authoring UI SHALL expose the current course visibility state and quick navigation needed for manual QA.

#### Scenario: Course just created
- **WHEN** an instructor or admin creates a course successfully
- **THEN** the edit flow SHALL show the course status
- **AND** SHALL expose quick actions for the next authoring steps

#### Scenario: Published course QA
- **WHEN** the current course status is `published`
- **THEN** the authoring flow SHALL expose a `View Public Page` action

### Requirement: Admin instructor assignment
Admin authoring flow SHALL assign each course to a valid instructor profile.

#### Scenario: Admin creates a course
- **WHEN** an admin opens the course form
- **THEN** the form SHALL require selecting an instructor owner

#### Scenario: Admin updates instructor ownership
- **WHEN** an admin edits a course and changes the instructor owner
- **THEN** the backend SHALL persist the updated `instructorId`
