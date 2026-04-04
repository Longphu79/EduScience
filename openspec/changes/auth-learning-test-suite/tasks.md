## 1. Scope

- [x] 1.1 Tao spec regression cho auth-learning core
- [x] 1.2 Xac dinh module nam trong coverage gate 100%

## 2. Authorization Tests

- [x] 2.1 Cover `auth.service` register/login edge cases
- [x] 2.2 Cover `authMiddleware`, `optionalAuthMiddleware`, `requireRoles`
- [x] 2.3 Cover `access.service` role, ownership, enrollment, va order access
- [x] 2.4 Cover `user.service` profile/password/account update edge cases

## 3. Learning Tests

- [x] 3.1 Cover `getMyCourses` with empty and populated enrollments
- [x] 3.2 Cover `getLearningCourseBySlug` for missing course, missing enrollment, va completed state
- [x] 3.3 Cover `updateLessonProgress` for complete/uncomplete, missing lesson, va enrollment summary sync

## 4. Validation

- [x] 4.1 Fix bugs bi lo ra tu test
- [x] 4.2 Chay `npm test`
- [x] 4.3 Chay coverage voi threshold 100% cho scope moi
