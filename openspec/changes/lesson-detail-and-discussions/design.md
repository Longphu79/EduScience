## Context

Lesson model hien co:
- title
- description
- videoUrl
- duration
- order
- preview/published flags

Nhung chua co:
- learning objectives
- markdown/rich notes
- downloadable resources
- comment thread theo lesson

## Goals / Non-Goals

**Goals:**
- Lesson player co day du noi dung text + resources + context
- Student da enroll co the xem va viet comment theo lesson
- Instructor/admin co the doc comment thread de moderation trong dot dau

**Non-Goals:**
- Real-time live chat
- Threading vo han cap sau
- Notification engine cho comment mentions

## Decisions

### 1. Lesson detail luu tren Lesson model
Dot dau se bo sung field detail truc tiep tren `Lesson` thay vi tach CMS model rieng.

### 2. Comment theo lesson la collection rieng
`LessonComment` giup query rieng, paginate, va mo rong moderation ve sau.

### 3. Seed discussion data
Route lesson trong app moi khong duoc trang comment rong trong QA build.

## Risks / Trade-offs

- Them field vao Lesson can migration/seed bo sung
- Comment ownership va moderation can tiep tuc siet them o dot sau

## Rollout Notes

1. Mo rong model lesson
2. Tao model/service/route comment
3. Seed du lieu discussion
4. Noi learning UI moi vao endpoints do
