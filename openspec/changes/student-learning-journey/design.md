## Context

Nhung gi da co:

- Order va checkout flow co the tao `Enrollment`
- Course va lesson models da ton tai
- Lesson co co `isPreview`
- Enrollment da co `progress` va `completed`

Nhung gi chua co:

- API lay danh sach khoa hoc da enroll cho student
- API/route xem lesson theo quyen enroll hoac preview
- UI `My Courses`
- UI hoc bai va cap nhat tien do
- Completion milestone va next-step UX

## Goals / Non-Goals

**Goals:**
- Student nhin thay khoa hoc da mua
- Student vao hoc duoc cac lesson co quyen truy cap
- He thong cap nhat tien do hoc tap ro rang
- Sau thanh toan, student duoc dua vao workflow hoc tap thay vi ket thuc o thong bao thanh cong

**Non-Goals:**
- Quiz engine
- Assignment grading
- Certificate generation
- Cohort scheduling

## Decisions

### 1. My Courses la diem vao hoc tap cua student
Sau khi mua thanh cong, student nen duoc dua toi `my-courses` hoac course player cua khoa vua mua.

### 2. Enrollment la source of truth cho learning access
Access hoc tap duoc quyet dinh boi:
- preview lesson cong khai
- hoac student da co enrollment hop le cho course

### 3. Progress cap nhat theo lesson completion
Ban dau, progress co the tinh tu so lesson da hoan thanh tren tong so lesson. Chua can tracking timecode video o phase nay.

### 4. Course player tách khỏi authoring
`LessonManager` la workflow cua instructor. Student can mot player rieng de xem syllabus, lesson state, previous/next, va progress.

### 5. Checkout success redirect ve learning workflow
Thong diep thanh toan thanh cong khong du. Product value chi xuat hien khi user vao hoc ngay duoc.

## Risks / Trade-offs

- Can them schema hoac state de luu lesson-level completion
- Neu chua co lesson progress detail, phai dinh nghia formula progress tam thoi
- Preview va enrolled access can tranh lo video private

## Rollout Notes

Nen trien khai:
1. enrollment read APIs
2. my-courses page
3. learning player va lesson access rules
4. progress persistence
5. checkout redirect refinement
