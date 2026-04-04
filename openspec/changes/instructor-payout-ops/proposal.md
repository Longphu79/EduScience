## Why

Checkout hien tai ghi nhan tien vao luong admin/platform, nhung chua co workflow thanh toan nguoc cho instructor. Day la lo hong nghiep vu lon:
- instructor khong co noi khai bao tai khoan rut tien
- instructor khong gui request rut tien duoc
- admin khong co queue xu ly payout
- doanh thu chi nam o dashboard chung ma khong co settlement logic

## What Changes

- Them model tai khoan nhan tien cho instructor
- Them payout request workflow cho instructor
- Them admin payout processing workflow voi thao tac danh dau da chuyen khoan thu cong
- Them fake data seed cho payout accounts va requests

## Capabilities

### New Capabilities
- `instructor-payout-accounts`
- `instructor-payout-requests`
- `admin-payout-processing`

## Impact

- **Backend**: them models, services, controllers, routes, seed fixtures
- **Frontend**: instructor va admin dashboards co payout widgets va tables
- **Business**: settlement workflow ro rang hon cho instructor earnings
