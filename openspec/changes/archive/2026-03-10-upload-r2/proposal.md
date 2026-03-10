## Why

Hệ thống EduScience hiện tại lưu URL file (avatar, thumbnail, video) dưới dạng string cứng, chưa có khả năng upload thực tế. Instructor không thể tạo khóa học với nội dung thật, user không thể đổi avatar. Cần tích hợp upload lên Cloudflare R2 để hệ thống hoạt động được với nội dung thực.

## What Changes

- Thêm upload middleware (multer) vào backend để nhận file từ frontend
- Tích hợp Cloudflare R2 (S3-compatible API) làm storage cho tất cả file (ảnh + video)
- Tạo upload API endpoints cho: avatar, course thumbnail, course preview video, lesson video
- Cập nhật frontend HTTP service hỗ trợ FormData (hiện chỉ hỗ trợ JSON)
- Thêm file input UI cho các form: edit profile, tạo/sửa course, tạo/sửa lesson

## Capabilities

### New Capabilities
- `file-upload`: Backend upload middleware, R2 storage service, upload API endpoints, file validation (type, size)
- `upload-ui`: Frontend file input components, FormData handling, upload progress indication

### Modified Capabilities
<!-- Không có spec nào hiện tại cần thay đổi requirement -->

## Impact

- **Backend**: Thêm packages (multer, @aws-sdk/client-s3), thêm routes/controllers/services mới, cập nhật .env với R2 credentials
- **Frontend**: Cập nhật HTTP service (services/https.js) hỗ trợ FormData, thêm upload components vào các form hiện có
- **Models**: Không thay đổi schema — các field avatarUrl, thumbnail, previewVideo, videoUrl đã tồn tại dưới dạng String
- **API**: Thêm endpoints mới (POST /api/upload/*), cập nhật PUT endpoints hiện có để nhận URL từ upload
