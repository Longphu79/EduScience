## ADDED Requirements

### Requirement: Self-service profile contract
System SHALL provide self-service account endpoints that operate on the current authenticated actor without requiring a path `userId`.

#### Scenario: Get my profile
- **WHEN** an authenticated actor requests their profile
- **THEN** system SHALL return the actor's user record and role-specific profile data

#### Scenario: Update my profile
- **WHEN** an authenticated actor updates profile fields allowed for their account
- **THEN** system SHALL update only whitelisted fields for that actor

### Requirement: Password change security
System SHALL allow password changes only for the current authenticated actor and SHALL NOT log plaintext passwords.

#### Scenario: Valid password change
- **WHEN** an authenticated actor provides the correct old password and a valid new password
- **THEN** system SHALL update the stored password hash
- **AND** SHALL return success without exposing password data

#### Scenario: Wrong old password
- **WHEN** the provided old password is incorrect
- **THEN** system SHALL return status 400 with a clear validation error

### Requirement: Account deactivation
System SHALL allow authenticated actors to deactivate only their own account.

#### Scenario: Self deactivation
- **WHEN** an authenticated actor confirms account deactivation
- **THEN** system SHALL mark the actor account as inactive

#### Scenario: Cross-account deactivation attempt
- **WHEN** a non-admin actor attempts to deactivate another user's account
- **THEN** system SHALL return status 403
