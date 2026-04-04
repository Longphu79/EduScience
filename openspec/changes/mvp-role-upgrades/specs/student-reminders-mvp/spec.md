## ADDED Requirements

### Requirement: Students can set learning reminders
The platform SHALL let enrolled students set a reminder tied to a course they are progressing through.

#### Scenario: Schedule a reminder
- **WHEN** a student triggers a reminder on their learning dashboard
- **THEN** the backend SHALL persist a reminder record with the requested date/time
- **AND** the dashboard SHALL display the next reminder for that course

### Requirement: Dashboard surfaces milestone reminders
The student dashboard SHALL highlight the next outstanding reminder or milestone to keep the learner on track.

#### Scenario: Open my learning with mid-progress course
- **WHEN** a student has progress below 100% and scheduled reminders
- **THEN** the dashboard SHALL show the soonest reminder message per course
