## Why

Sau khi khoa `authorization-foundation` va `student-learning-journey`, repo van chua co regression suite cho cac flow auth/account/learning. Day la nhom logic de vo khi refactor vi no phu thuoc role, ownership, enrollment, va trang thai lesson.

Neu khong cover:

- guard role co the bi noi long ma khong bi phat hien
- middleware token handling co the sai status hoac bo qua invalid token
- learning progress co the cap nhat sai course completion
- auth/account service van de lai bug runtime tren role admin hoac path import

## What Changes

- Tao regression suite cho `auth.service`, `user.service`, `access.service`, `authMiddleware`, va `learning.service`
- Bat coverage gate 100% cho nhom module auth/learning duoc chon
- Fix cac bug lo ra trong qua trinh viet test

## Capabilities

### New Capabilities
- `auth-learning-tests`: regression suite cho authorization, account self-service, va learning progress

### Modified Capabilities
- `authorization`
- `account-self-service`
- `my-courses`
- `learning-progress`

## Impact

- **Backend**: them test files, cap nhat coverage command, va harden service/middleware behavior
- **Engineering**: co gate regression cho role-based access va learning state transitions
