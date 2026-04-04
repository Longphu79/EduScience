## Why

UI hien tai bi vo layout khi du lieu media nhu `thumbnail` hoac `instructor avatar` bi rong hoac link anh loi. Browser se render alt text ben trong the `img`, dan den card bi vo bo cuc.

## What Changes

- Them media fallback helper dung chung cho dynamic course/instructor images
- Them `SafeImage` component de fallback khi `src` rong hoac load loi
- Ap dung cho cac man discovery va learning co du lieu dong

## Capabilities

### Modified Capabilities
- `course-catalog`
- `course-detail`
- `my-courses`
- `wishlist`

## Impact

- **Frontend**: card va detail view khong vo layout neu media thieu hoac hong
- **QA**: co the test voi mock data va user-created data thieu media ma UI van on dinh
