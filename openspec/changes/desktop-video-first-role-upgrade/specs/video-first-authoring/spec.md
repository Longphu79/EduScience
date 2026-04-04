## ADDED Requirements

### Requirement: Course authoring supports R2 media uploads
Instructor and admin authoring SHALL support uploading course media through the existing backend upload endpoints.

#### Scenario: Upload course preview video
- **WHEN** an instructor or admin selects a preview video file in course authoring
- **THEN** frontend SHALL upload the file to the backend upload endpoint
- **AND** SHALL persist the returned URL into the course form
- **AND** SHALL show a playable preview in the authoring UI

#### Scenario: Upload course thumbnail
- **WHEN** an instructor or admin selects a thumbnail image in course authoring
- **THEN** frontend SHALL upload the file and store the returned thumbnail URL into the course form

### Requirement: Lesson authoring is video-first
Lesson authoring SHALL prioritize lesson video and resource editing over text-only editing.

#### Scenario: Upload lesson video
- **WHEN** an instructor uploads a lesson video file
- **THEN** frontend SHALL upload it through the lesson video endpoint
- **AND** SHALL attach the returned URL to the lesson draft

### Requirement: Instructor planning calendar
Instructor workspace SHALL provide a calendar-based planning widget using Mantine date components.

#### Scenario: Open content planning
- **WHEN** an instructor opens the authoring workspace
- **THEN** the page SHALL display a calendar or date planning widget for publish or QA target dates
