## ADDED Requirements

### Requirement: Browser E2E for role workflows
The new Next.js app SHALL have browser-based end-to-end tests for the main seeded role workflows.

#### Scenario: Student workflow
- **WHEN** the student signs in with the seeded QA account
- **THEN** the browser test SHALL verify learning entry and lesson detail surfaces

#### Scenario: Instructor workflow
- **WHEN** the instructor signs in with the seeded QA account
- **THEN** the browser test SHALL verify instructor overview, courses, and payout pages

#### Scenario: Admin workflow
- **WHEN** the admin signs in with the seeded QA account
- **THEN** the browser test SHALL verify admin overview and payout queue pages
