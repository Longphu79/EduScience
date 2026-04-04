## ADDED Requirements

### Requirement: My Courses page
Frontend SHALL provide a page for authenticated students to view the courses they have enrolled in.

#### Scenario: View enrolled courses
- **WHEN** an authenticated student opens the My Courses page
- **THEN** system SHALL return and render the student's enrolled courses
- **AND** each item SHALL include enough progress metadata to continue learning

#### Scenario: No enrollments yet
- **WHEN** a student has no enrolled courses
- **THEN** frontend SHALL show an empty state with a path back to course discovery

### Requirement: Enrollment-backed access
System SHALL use enrollment records to determine whether a student can access full course content.

#### Scenario: Student accesses enrolled course
- **WHEN** a student opens a course they are enrolled in
- **THEN** system SHALL allow access to the full learning workflow

#### Scenario: Student accesses non-enrolled course
- **WHEN** a student opens a course they are not enrolled in
- **THEN** system SHALL restrict access to public preview content only
