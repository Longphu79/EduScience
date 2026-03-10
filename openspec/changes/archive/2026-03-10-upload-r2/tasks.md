## 1. Backend Setup

- [x] 1.1 Cài đặt dependencies: `@aws-sdk/client-s3`, `multer`
- [x] 1.2 Thêm R2 environment variables vào `.env` (R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, R2_PUBLIC_URL)
- [x] 1.3 Tạo R2 storage service (`src/services/r2.service.js`) — init S3Client với R2 endpoint, hàm uploadFile(buffer, key, contentType) trả về public URL

## 2. Backend Upload Middleware & Validation

- [x] 2.1 Tạo multer config (`src/middleware/upload.js`) — disk storage, file filter theo type, size limit theo loại upload
- [x] 2.2 Tạo upload helpers riêng cho từng loại: avatarUpload (5MB, image), thumbnailUpload (10MB, image), videoUpload (500MB, video)

## 3. Backend Upload Endpoints

- [x] 3.1 Tạo upload controller (`src/controllers/upload.controller.js`) — xử lý 4 endpoints: avatar, course-thumbnail, course-preview, lesson-video
- [x] 3.2 Tạo upload routes (`src/routes/upload.js`) — POST routes với auth middleware + multer middleware
- [x] 3.3 Đăng ký upload routes trong `app.js`

## 4. Frontend HTTP Service Update

- [x] 4.1 Cập nhật `services/https.js` — detect FormData, bỏ Content-Type header khi gửi FormData

## 5. Frontend Upload API

- [x] 5.1 Tạo upload API functions (`features/upload/api/uploadApi.js`) — uploadAvatar, uploadCourseThumbnail, uploadCoursePreview, uploadLessonVideo

## 6. Frontend Upload UI

- [x] 6.1 Tạo reusable FileUpload component — file input, loading state, preview (ảnh hoặc video)
- [x] 6.2 Tích hợp avatar upload vào ProfilePage (shared cho cả student và instructor)
- [x] 6.3 Tích hợp thumbnail + preview video upload vào form tạo/sửa Course — SKIPPED: form chưa tồn tại, sẽ tích hợp khi tạo form. Components và API đã sẵn sàng (FileUpload + uploadCourseThumbnail/uploadCoursePreview)
- [x] 6.4 Tích hợp lesson video upload vào form tạo/sửa Lesson — SKIPPED: form chưa tồn tại, sẽ tích hợp khi tạo form. Components và API đã sẵn sàng (FileUpload + uploadLessonVideo)
