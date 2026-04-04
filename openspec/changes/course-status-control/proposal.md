## Why

Authoring flow hien tai cho phep instructor tao course nhung khong co cach dat `status` trong UI. Backend lai mac dinh course moi la `draft`, nen course vua tao khong xuat hien trong catalog cong khai va block workflow student checkout/learning.

## What Changes

- Them course visibility control trong form tao/sua course
- Load va persist `status` khi edit course
- Dat default UI cho course moi la `published` de unblock manual QA flow

## Capabilities

### Modified Capabilities
- `course-catalog`
- `course authoring`

## Impact

- **Frontend**: instructor co the chon `draft`, `published`, hoac `archived`
- **Product workflow**: course moi co the xuat hien ngay trong catalog neu instructor giu default `published`
