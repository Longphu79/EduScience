## ADDED Requirements

### Requirement: HTTP service hỗ trợ FormData
Frontend HTTP service SHALL detect khi body là FormData và bỏ Content-Type header (để browser tự set multipart boundary).

#### Scenario: Gửi request với FormData
- **WHEN** caller truyền FormData object làm body
- **THEN** service SHALL không set Content-Type header và gửi FormData trực tiếp

#### Scenario: Gửi request với JSON (backward compatible)
- **WHEN** caller truyền plain object làm body
- **THEN** service SHALL set Content-Type: application/json và JSON.stringify body như cũ

### Requirement: Upload component cho avatar
Frontend SHALL cung cấp file input trên trang profile (ProfilePage, InstructorProfile) cho phép user chọn và upload ảnh avatar.

#### Scenario: User chọn file và upload thành công
- **WHEN** user chọn file ảnh qua file input
- **THEN** frontend SHALL gửi file lên `POST /api/upload/avatar`, nhận URL trả về, và cập nhật avatarUrl

#### Scenario: Upload đang xử lý
- **WHEN** file đang được upload
- **THEN** UI SHALL hiển thị loading state (disable button hoặc spinner)

### Requirement: Upload component cho course (thumbnail + preview)
Frontend SHALL cung cấp file input trên form tạo/sửa course cho phép instructor upload thumbnail và preview video.

#### Scenario: Instructor upload thumbnail
- **WHEN** instructor chọn file ảnh cho thumbnail
- **THEN** frontend SHALL upload lên `POST /api/upload/course-thumbnail` và hiển thị preview ảnh

#### Scenario: Instructor upload preview video
- **WHEN** instructor chọn file video cho preview
- **THEN** frontend SHALL upload lên `POST /api/upload/course-preview` và hiển thị video player preview

### Requirement: Upload component cho lesson video
Frontend SHALL cung cấp file input trên form tạo/sửa lesson cho phép instructor upload video bài giảng.

#### Scenario: Instructor upload lesson video
- **WHEN** instructor chọn file video cho lesson
- **THEN** frontend SHALL upload lên `POST /api/upload/lesson-video` và hiển thị confirmation với filename
