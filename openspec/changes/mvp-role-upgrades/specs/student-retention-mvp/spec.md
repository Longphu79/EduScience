## ADDED Requirements

### Requirement: Learning workspace supports student notes and bookmarks
The student learning workspace SHALL let an enrolled student keep personal notes and bookmark lessons.

#### Scenario: Save lesson note and bookmark
- **WHEN** an enrolled student updates a note or bookmark state for a published lesson
- **THEN** the backend SHALL persist that notebook state for the student and lesson
- **AND** the learning route SHALL return the saved state on subsequent loads

### Requirement: Completed students can submit course reviews
The learning experience SHALL allow a student to leave or update one review after completing a course.

#### Scenario: Submit review after completion
- **WHEN** a student completes a course and submits a rating and optional comment
- **THEN** the platform SHALL persist a single review for that student and course
- **AND** SHALL update course-level review aggregates

### Requirement: Completed students receive a certificate payload
The learning experience SHALL expose certificate-ready metadata for completed courses.

#### Scenario: Open a completed course
- **WHEN** a student opens a fully completed learning route
- **THEN** the response SHALL include certificate metadata that the UI can render in the completion area

### Requirement: My learning emphasizes resume and completion state
The student dashboard SHALL help the learner resume the next lesson or finish post-completion actions.

#### Scenario: Open my learning
- **WHEN** a student opens the my-learning route
- **THEN** each enrolled course card SHALL surface progress, next-step context, and completion/review state
