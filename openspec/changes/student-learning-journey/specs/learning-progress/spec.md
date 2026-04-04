## ADDED Requirements

### Requirement: Student learning player
Frontend SHALL provide a dedicated learning player experience for enrolled students.

#### Scenario: Open course player
- **WHEN** an enrolled student opens the learning player for a course
- **THEN** system SHALL render the lesson list, current lesson content, and progress summary

#### Scenario: Preview lesson access
- **WHEN** a lesson is marked as preview and the viewer is not enrolled
- **THEN** system SHALL allow access only to that preview lesson

### Requirement: Progress tracking
System SHALL track and expose student progress for each enrolled course.

#### Scenario: Mark lesson completed
- **WHEN** a student completes or marks a lesson as completed
- **THEN** system SHALL persist updated learning progress for that student and course

#### Scenario: Show aggregate progress
- **WHEN** a student views My Courses or the learning player
- **THEN** system SHALL show course progress as a percentage derived from lesson completion data

### Requirement: Course completion state
System SHALL identify when a student has completed a course.

#### Scenario: All required lessons completed
- **WHEN** a student completes all required lessons for a course
- **THEN** system SHALL mark the enrollment as completed
- **AND** SHALL show a completed state in the learning workflow
