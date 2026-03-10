## Context

EduScience là nền tảng học trực tuyến với backend Express + MongoDB và frontend React + Vite. Hiện tại các field file (avatarUrl, thumbnail, previewVideo, videoUrl) chỉ lưu string URL cứng, chưa có upload thực tế. Cần tích hợp Cloudflare R2 làm object storage cho tất cả file.

**Current state:**
- Backend: Express 5, Mongoose, JWT auth — chưa có multer hay bất kỳ file handling nào
- Frontend: fetch-based HTTP service hardcode `Content-Type: application/json` — chưa hỗ trợ FormData
- Models: Course (thumbnail, previewVideo), Lesson (videoUrl), User/Instructor (avatarUrl) — đã có field String

## Goals / Non-Goals

**Goals:**
- Upload ảnh (avatar, thumbnail) và video (preview, lesson) lên Cloudflare R2
- Trả về public URL để lưu vào MongoDB
- File validation (type, size limit)
- Frontend hỗ trợ FormData upload với progress indication

**Non-Goals:**
- Video transcoding / adaptive bitrate (dùng R2 storage thuần, không dùng Cloudflare Stream)
- CDN / caching optimization
- Bulk upload / drag-and-drop nhiều file cùng lúc
- File management dashboard (xóa, rename file trên R2)

## Decisions

### 1. Storage: Cloudflare R2 với S3-compatible API
**Rationale:** R2 không tính phí egress, dùng S3-compatible API nên dùng được `@aws-sdk/client-s3`. Nếu sau này muốn chuyển sang S3 thật chỉ cần đổi endpoint.

**Alternatives:**
- AWS S3: Tính phí egress, đắt hơn cho video
- Cloudflare Stream: Overkill cho giai đoạn này, đắt hơn

### 2. Upload strategy: Backend proxy upload
**Rationale:** File gửi từ FE → BE (multer) → R2. Đơn giản, kiểm soát auth + validation ở backend.

**Alternatives:**
- Presigned URL (FE upload trực tiếp lên R2): Performance tốt hơn cho file lớn, nhưng phức tạp hơn. Có thể chuyển sang sau nếu cần.

### 3. File organization trên R2
```
bucket/
├── avatars/
│   └── {userId}_{timestamp}.{ext}
├── courses/
│   ├── thumbnails/
│   │   └── {courseId}_{timestamp}.{ext}
│   └── previews/
│       └── {courseId}_{timestamp}.{ext}
└── lessons/
    └── {lessonId}_{timestamp}.{ext}
```
**Rationale:** Tổ chức theo loại file, dùng timestamp tránh cache cũ khi re-upload.

### 4. Upload endpoints: Tách riêng endpoint upload
```
POST /api/upload/avatar          → trả về { url }
POST /api/upload/course-thumbnail → trả về { url }
POST /api/upload/course-preview   → trả về { url }
POST /api/upload/lesson-video     → trả về { url }
```
**Rationale:** Mỗi endpoint có file validation riêng (type, size). Frontend upload file trước, nhận URL, rồi gửi URL khi save form. Tách upload khỏi CRUD logic.

### 5. File size limits
| Loại | Max size | Allowed types |
|------|----------|---------------|
| Avatar | 5 MB | image/jpeg, image/png, image/webp |
| Thumbnail | 10 MB | image/jpeg, image/png, image/webp |
| Preview video | 100 MB | video/mp4, video/webm |
| Lesson video | 500 MB | video/mp4, video/webm |

### 6. Frontend: Cập nhật HTTP service hỗ trợ FormData
**Rationale:** `services/https.js` hiện hardcode `Content-Type: application/json`. Cần detect FormData và bỏ Content-Type header (browser tự set boundary).

## Risks / Trade-offs

- **[Large video upload qua backend proxy]** → Video lớn (500MB) qua backend có thể chậm và tốn memory. Mitigation: Dùng multer disk storage thay vì memory storage. Nếu cần scale, chuyển sang presigned URL sau.
- **[Không xóa file cũ trên R2]** → File cũ tồn tại khi user re-upload avatar/thumbnail. Mitigation: Chấp nhận cho giai đoạn đầu, thêm cleanup job sau.
- **[R2 public access]** → Video bài giảng có thể bị share URL. Mitigation: Chấp nhận cho giai đoạn đầu. Nếu cần bảo vệ, dùng signed URL sau.
