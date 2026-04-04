## ADDED Requirements

### Requirement: Public header is concise and commerce-oriented
The public client header SHALL keep only the actions needed for browsing and account entry.

#### Scenario: Guest opens the landing page
- **WHEN** a guest loads the public client app
- **THEN** the header SHALL show the product logo, browse/catalog navigation, login entry, and register entry
- **AND** SHALL avoid unrelated management-role copy in the main header

### Requirement: Wishlist, cart, and checkout exist in the Next frontend
The Next frontend SHALL provide real wishlist, cart, and checkout screens connected to backend APIs.

#### Scenario: Add course to wishlist
- **WHEN** a signed-in student adds a course to wishlist from catalog or detail
- **THEN** the course SHALL appear on the wishlist page in the Next frontend

#### Scenario: Start checkout from cart
- **WHEN** a signed-in student starts checkout from the cart page
- **THEN** the Next frontend SHALL create or open the checkout flow using backend checkout APIs
- **AND** SHALL show payment state and next-step CTAs

### Requirement: Course detail follows desktop marketplace patterns
Public course detail SHALL present a desktop-first comparison and purchase surface.

#### Scenario: Open course detail on desktop
- **WHEN** a guest or student opens a public course detail page on a laptop viewport
- **THEN** the page SHALL show sticky purchase rail, preview video, instructor trust, learning outcomes, syllabus, and related courses
