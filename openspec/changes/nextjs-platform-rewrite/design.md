## Context

Repo hien tai co:
- `frontend/`: Vite React app dang gan nhieu page business logic va styling vao component layer
- `backend/`: Express + Mongo, da co auth, course, checkout, learning foundation

Rewrite toan bo ngay tren `frontend/` la rui ro cao vi se cat duong QA hien tai. Vi vay dot dau se tao app moi `frontend-next/` song song.

## Goals / Non-Goals

**Goals:**
- Dung Next.js App Router lam frontend foundation moi
- Dung Mantine 8.x lam UI system co the scale cho dashboard va learning surfaces
- Tach route/group ro rang cho public, student, instructor, admin
- Co fake data khong-empty cho moi route chinh de design va QA

**Non-Goals:**
- Xoa FE Vite cu ngay lap tuc
- SSR hoan hao cho moi data source o dot dau
- Refactor het backend read model trong cung mot dot

## Decisions

### 1. Scaffold app moi thay vi migrate tai cho
Tao `frontend-next/` de:
- khong lam gay UI cu dang QA
- cho phep team lam song song va doi chieu
- rollout theo route/domain sau

### 2. App Router + route groups theo role
App moi se dung cac khu vuc:
- `/` public + student-facing marketing/discovery
- `/learn/*` student learning
- `/instructor/*` instructor workspace
- `/admin/*` admin operations

### 3. Mantine cho shell, form, data table, dashboard
Mantine phu hop hon cho:
- dashboard layouts
- admin/instructor forms
- dense data views
- modal/drawer/notification system

### 4. Fake data la first-class input
Route moi phai co du lieu gia lap khong-empty cho:
- dashboard cards
- tables
- comment threads
- payout requests
- lesson resources

## Risks / Trade-offs

- Ton tai song song 2 frontend trong mot repo lam tang chi phi build tam thoi
- Mantine va Tailwind cung ton tai trong repo, can tach ro app nao dung cai nao
- Neu fake data khong khop domain model backend, frontend moi co the can refactor lai khi noi API that

## Rollout Notes

1. Tao OpenSpec cho app rewrite, payout, lesson discussions
2. Scaffold `frontend-next`
3. Tao shared fake data va route shells
4. Them instructor/admin dashboards
5. Them learning lesson detail + discussions surfaces
6. Noi dan backend endpoints that cho payout/comment workflows
