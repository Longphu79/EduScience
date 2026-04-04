## ADDED Requirements

### Requirement: Lesson detail payload
System SHALL provide detailed lesson data for the learning experience.

#### Scenario: Open lesson detail
- **WHEN** an authorized learner opens a lesson
- **THEN** the lesson payload SHALL include title, description, objectives, notes, resources, duration, and curriculum context

### Requirement: Lesson resources
Lesson detail SHALL surface study resources when configured.

#### Scenario: Lesson has resources
- **WHEN** a lesson includes downloadable or linked resources
- **THEN** the system SHALL return those resources with the lesson detail payload
