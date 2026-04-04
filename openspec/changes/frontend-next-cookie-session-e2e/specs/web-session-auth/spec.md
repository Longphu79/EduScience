## ADDED Requirements

### Requirement: Cookie-backed web session
The Next.js web app SHALL persist authenticated sessions in an httpOnly cookie instead of browser local storage.

#### Scenario: Login through web app
- **WHEN** a user logs in through a role-specific login route
- **THEN** the web app SHALL store the backend token in an httpOnly cookie

#### Scenario: Load current session
- **WHEN** the app refreshes with a valid session cookie
- **THEN** the app SHALL restore the current user session without reading localStorage
