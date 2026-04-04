## Context

Hien trang home goi `/course/popular`, nhung:

- `AllCoursesPage` van dung mock data lon thay vi API that
- Chua co route frontend cho `course detail`
- Wishlist dang link toi `/course/:id`, trong khi app chua co route nay
- Backend da co `GET /course`, `GET /course/popular`, `GET /course/slug/:slug`, nhung contract public chua du cho catalog/detail page

## Goals / Non-Goals

**Goals:**
- Guest va student co the browse catalog that bang du lieu tu backend
- User co the mo course detail theo slug
- Course detail hien thong tin can thiet de quyet dinh mua hoc
- Catalog ho tro search/filter/sort/pagination co nghia

**Non-Goals:**
- Full-text search engine ngoai
- Recommendation engine
- Personalized ranking
- SSR/SEO optimization sau cung

## Decisions

### 1. Slug la route public chinh cho course detail
Frontend route public se dung `/course/:slug`. ID van duoc phep ton tai noi bo cho authoring va mutations.

### 2. Catalog query server-side
Search, category, level, sort, page, limit nen di qua query params de tranh FE load tat ca roi moi loc.

### 3. Public course chi hien `published`
Guest/student catalog va detail chi nhin thay course `published`. Draft/archived la workflow authoring rieng.

### 4. Course detail la diem hop nhat cac CTA
Tai day user duoc:
- xem thong tin khoa hoc
- xem preview video va preview lessons
- them wishlist
- them cart
- di den checkout sau nay

### 5. Data contract phai nhat quan giua home, catalog, detail
Course card can nhung field:
- title, slug, shortDescription, thumbnail
- price/salePrice/isFree
- rating, totalReviews, totalEnrollments, totalLessons, duration
- instructor summary

Detail page can them:
- description
- lesson list va preview flags
- category, level, language
- previewVideo

## Risks / Trade-offs

- Pagination va server-side filters se doi API contract hien co
- Route doi tu `id` sang `slug` can cap nhat cac link hien tai
- Neu instructor relation chua chuan hoa, catalog/detail co the bi thieu thong tin instructor

## Rollout Notes

Nen trien khai:
1. chuan hoa public course serializer
2. mo rong `GET /course` query params
3. noi `AllCoursesPage` vao API
4. them `CourseDetailPage`
5. cap nhat links tu home, wishlist, cards
