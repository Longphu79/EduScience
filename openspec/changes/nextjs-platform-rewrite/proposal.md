## Why

Frontend hien tai da chay duoc, nhung bi phan manh theo page components, styling khong nhat quan, route-role flow khong du ro rang, va kho mo rong thanh mot product-level learning platform theo chat luong Udemy/Coursera.

User muon:
- dung Next.js thay cho Vite React
- dung Mantine latest cho design system va dashboard shells
- tach route rieng cho public/client, instructor, admin
- co fake data day du de QA toan bo UI moi ngay ca truoc khi noi het backend that

Neu khong rewrite co chu dich, team se tiep tuc patch tren mot UI da ban va tang chi phi phat trien ve sau.

## What Changes

- Tao app moi `frontend-next` dung Next.js App Router va Mantine
- Dinh nghia layout rieng cho `public`, `student`, `instructor`, `admin`
- Xay lai cac man hinh learning/client theo huong marketplace + learning product
- Tao dashboard route rieng cho instructor va admin voi fake data day du cho QA
- Gioi han rewrite dot dau vao shell, navigation, dashboards, learning experience, va data contracts can thiet

## Capabilities

### New Capabilities
- `client-web-app`: ung dung Next.js moi cho public + student flow
- `role-dashboards`: instructor/admin route groups voi dashboard, navigation, overview cards, task lists

### Modified Capabilities
- `course-catalog`
- `course-detail`
- `learning-player`

## Impact

- **Frontend**: them workspace app moi `frontend-next`, khong pha FE cu trong dot dau
- **Backend**: can mo them cac endpoint read-model phuc vu instructor/admin dashboards ve sau
- **Product**: co mot UI foundation sach hon de mo rong payout, lesson discussion, va learning UX
