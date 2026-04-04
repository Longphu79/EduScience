## ADDED Requirements

### Requirement: Lesson discussion thread
System SHALL provide a comment thread for each lesson.

#### Scenario: View lesson comments
- **WHEN** an authorized viewer opens a lesson discussion area
- **THEN** the system SHALL list comments for that lesson in reverse chronological order

#### Scenario: Post lesson comment
- **WHEN** an enrolled student or course manager submits a comment on a lesson
- **THEN** the system SHALL persist the comment and return it in the lesson discussion thread
