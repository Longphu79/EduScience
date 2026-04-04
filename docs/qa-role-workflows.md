# QA Accounts

All seeded QA accounts use the same password:

- Password: `QaDemo123!`

Seeded usernames:

- Student: `qa.student`
- Instructor: `qa.instructor`
- Admin: `qa.admin`
- Alternate instructor: `qa.instructor.alt`

# Public QA Routes

Use these after running `cd backend && npm run seed:qa`:

- Catalog: `/courses`
- In-progress course detail: `/course/qa-physics-foundations`
- Completed course detail: `/course/qa-data-visualization`
- Checkout candidate course detail: `/course/qa-chemistry-lab-toolkit`

# Priority QA Order

## 1. Guest

- Open `/`
- Open `/courses`
- Open `/course/qa-physics-foundations`
- Confirm protected routes `/wishlist`, `/cart`, `/profile` redirect to login

## 2. Student

- Log in with `qa.student`
- Verify `/wishlist` is non-empty
- Verify `/cart` is non-empty
- Trigger checkout from cart
- Complete payment by sending the webhook or using the generated QR flow
- Verify `/orders` shows completed and expired history
- Verify `/my-courses` is non-empty
- Open `/learn/qa-physics-foundations`

## 3. Instructor

- Log in with `qa.instructor`
- Click `Create Course`
- Create a published course
- Use `Manage Lessons`
- Use `View Public Page`
- Open draft fixture by id if needed from DB or create a new draft for status QA

## 4. Admin

- Log in with `qa.admin`
- Click `Create Course`
- Select an `Instructor Owner`
- Create a published course
- Reassign the course to `qa.instructor.alt`
- Use `View Public Page` for public QA
