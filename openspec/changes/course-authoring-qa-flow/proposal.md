## Why

Sau khi them `status` vao course form, authoring flow van thieu hai phan quan trong:

- Sau khi tao course, author khong co feedback ro rang ve trang thai hien tai va khong co CTA nhanh de QA public page
- Admin duoc phep vao authoring route nhung chua co cach chon `Instructor` owner hop le cho course

## What Changes

- Them post-create/edit status summary trong course authoring form
- Them CTA `View Public Page` de QA nhanh khi course dang `published`
- Them admin-only instructor selector cho create/edit flow
- Cho phep admin cap nhat `instructorId` khi chinh sua course

## Capabilities

### Modified Capabilities
- `course authoring`
- `course-catalog`
- `authorization`

## Impact

- **Frontend**: instructor/admin co authoring flow ro rang hon va QA nhanh hon
- **Backend**: admin co the resolve va cap nhat instructor owner mot cach hop le
