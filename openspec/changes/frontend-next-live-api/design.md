## Context

App `frontend-next` hien dang:
- build duoc
- co route public, learning, instructor, admin
- van dung `lib/mock-data.js`

Backend da co public catalog/detail, learning, payout requests, va lesson comments. Tuy nhien dashboard instructor/admin chua co read model rieng.

## Goals / Non-Goals

**Goals:**
- Public pages dung API that
- Student co login va vao learning route bang token that
- Instructor va admin co login rieng va management pages rieng
- Landing page va public header chi phuc vu client-facing journey

**Non-Goals:**
- OAuth/social login
- cookie session phuc tap tu server
- SSR toan bo role-auth pages o dot dau

## Decisions

### 1. Public pages fetch server-side, role pages fetch client-side
Public pages khong can auth nen co the fetch thang tren server.
Role pages can token tu login nen se dung client auth context + browser fetch.

### 2. Tien ich auth don gian bang localStorage
Token JWT se luu client-side trong `localStorage` cho dot dau de giam chi phi tich hop.

### 3. Login flows tach theo role
- `/login` cho student/client
- `/instructor/login` cho instructor
- `/admin/login` cho admin

### 4. Instructor/admin co layouts management rieng
Khong hien link role ops trong public shell. Role shell chi ton tai ben trong route `/instructor/*` va `/admin/*`.

## Risks / Trade-offs

- localStorage token khong ly tuong bang httpOnly cookies, nhung du cho dot dau
- role pages se render sau khi client load session
- can them read models de tranh FE phai goi qua nhieu API nho le

## Rollout Notes

1. Them backend overview/list endpoints
2. Tao auth context cho `frontend-next`
3. Noi public pages vao API that
4. Noi learning/instructor/admin pages vao API that
5. Bo role links khoi public landing/header
