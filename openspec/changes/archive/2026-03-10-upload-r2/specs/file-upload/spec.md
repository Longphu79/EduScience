## ADDED Requirements

### Requirement: R2 storage service
Backend SHALL provide a storage service that uploads files to Cloudflare R2 using S3-compatible API and returns the public URL of the uploaded file.

#### Scenario: Upload file thành công
- **WHEN** storage service nhận một file buffer, key path, và content type
- **THEN** file SHALL được upload lên R2 bucket và trả về public URL

#### Scenario: R2 connection thất bại
- **WHEN** R2 không khả dụng hoặc credentials sai
- **THEN** service SHALL throw error với message rõ ràng

### Requirement: Upload avatar endpoint
Backend SHALL provide `POST /api/upload/avatar` endpoint cho authenticated users để upload ảnh đại diện.

#### Scenario: Upload avatar thành công
- **WHEN** authenticated user gửi POST với file ảnh (jpeg/png/webp, <= 5MB)
- **THEN** server SHALL upload file lên R2 tại `avatars/{userId}_{timestamp}.{ext}` và trả về `{ url: "..." }` với status 200

#### Scenario: File vượt quá size limit
- **WHEN** user upload file ảnh lớn hơn 5MB
- **THEN** server SHALL trả về status 400 với error message

#### Scenario: File type không hợp lệ
- **WHEN** user upload file không phải image (jpeg/png/webp)
- **THEN** server SHALL trả về status 400 với error message

#### Scenario: User chưa authenticated
- **WHEN** request không có valid JWT token
- **THEN** server SHALL trả về status 401

### Requirement: Upload course thumbnail endpoint
Backend SHALL provide `POST /api/upload/course-thumbnail` endpoint cho instructor để upload ảnh thumbnail khóa học.

#### Scenario: Upload thumbnail thành công
- **WHEN** authenticated instructor gửi POST với file ảnh (jpeg/png/webp, <= 10MB)
- **THEN** server SHALL upload file lên R2 tại `courses/thumbnails/{courseId}_{timestamp}.{ext}` và trả về `{ url: "..." }` với status 200

#### Scenario: File type hoặc size không hợp lệ
- **WHEN** instructor upload file không đúng type hoặc lớn hơn 10MB
- **THEN** server SHALL trả về status 400 với error message

### Requirement: Upload course preview video endpoint
Backend SHALL provide `POST /api/upload/course-preview` endpoint cho instructor để upload video preview khóa học.

#### Scenario: Upload preview thành công
- **WHEN** authenticated instructor gửi POST với file video (mp4/webm, <= 100MB)
- **THEN** server SHALL upload file lên R2 tại `courses/previews/{courseId}_{timestamp}.{ext}` và trả về `{ url: "..." }` với status 200

#### Scenario: File type hoặc size không hợp lệ
- **WHEN** instructor upload file không đúng type hoặc lớn hơn 100MB
- **THEN** server SHALL trả về status 400 với error message

### Requirement: Upload lesson video endpoint
Backend SHALL provide `POST /api/upload/lesson-video` endpoint cho instructor để upload video bài giảng.

#### Scenario: Upload lesson video thành công
- **WHEN** authenticated instructor gửi POST với file video (mp4/webm, <= 500MB)
- **THEN** server SHALL upload file lên R2 tại `lessons/{lessonId}_{timestamp}.{ext}` và trả về `{ url: "..." }` với status 200

#### Scenario: File type hoặc size không hợp lệ
- **WHEN** instructor upload file không đúng type hoặc lớn hơn 500MB
- **THEN** server SHALL trả về status 400 với error message

### Requirement: Multer middleware configuration
Backend SHALL use multer middleware để parse multipart/form-data requests với disk storage.

#### Scenario: Multer parse file thành công
- **WHEN** request có multipart/form-data với field name "file"
- **THEN** multer SHALL parse file và attach vào `req.file`

#### Scenario: Không có file trong request
- **WHEN** request không chứa file
- **THEN** server SHALL trả về status 400 với error "No file uploaded"
