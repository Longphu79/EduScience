## ADDED Requirements

### Requirement: Actor identity from JWT
Backend SHALL derive authenticated actor identity from JWT claims and SHALL NOT trust client-submitted identity fields for self-service or authoring workflows.

#### Scenario: Authenticated self-service request
- **WHEN** an authenticated user calls a self-service endpoint
- **THEN** system SHALL use the JWT subject as the effective actor identity
- **AND** SHALL ignore any conflicting `userId` submitted by the client

#### Scenario: Missing or invalid JWT
- **WHEN** a protected endpoint receives no valid bearer token
- **THEN** system SHALL return status 401

### Requirement: Role-based access control
System SHALL enforce role-based access for privileged workflows.

#### Scenario: Student attempts content authoring
- **WHEN** a `student` calls a create, update, or delete course or lesson endpoint
- **THEN** system SHALL return status 403

#### Scenario: Instructor accesses authoring workflow
- **WHEN** an `instructor` calls an allowed authoring endpoint
- **THEN** system SHALL continue to ownership validation

#### Scenario: Admin override
- **WHEN** an `admin` calls an admin-approved moderation or support endpoint
- **THEN** system SHALL allow the action without instructor ownership requirements

### Requirement: Ownership-based access control
System SHALL enforce ownership checks for mutating resource operations.

#### Scenario: Instructor updates own course
- **WHEN** an instructor updates a course they own
- **THEN** system SHALL allow the update

#### Scenario: Instructor updates another instructor's course
- **WHEN** an instructor updates a course owned by a different instructor
- **THEN** system SHALL return status 403

#### Scenario: User reads another user's self-service profile
- **WHEN** an authenticated user attempts to read or mutate another user's private self-service resource
- **THEN** system SHALL return status 403

### Requirement: Order privacy
System SHALL protect checkout info and order status by owner or admin access.

#### Scenario: Owner requests order status
- **WHEN** the order owner requests order status or checkout info
- **THEN** system SHALL return the order information

#### Scenario: Non-owner requests order status
- **WHEN** a different authenticated user requests order status or checkout info
- **THEN** system SHALL return status 403
