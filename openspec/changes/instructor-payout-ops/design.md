## Context

Instructor hien chi co `revenue` tong trong profile. He thong chua co:
- available balance
- pending payout
- payout account verified details
- admin settlement record

## Goals / Non-Goals

**Goals:**
- Instructor co the luu thong tin tai khoan ngan hang rut tien
- Instructor co the tao payout request thu cong
- Admin co the xem, process, va mark paid cho payout request
- Seed du lieu de QA dashboard va bang payout khong empty

**Non-Goals:**
- Tich hop ngan hang/API payout that
- So cai ke toan day du
- Tu dong phan bo doanh thu theo refund/tax

## Decisions

### 1. Manual payout workflow
Do chua co payment rail payout, admin se:
- xem payout request
- copy thong tin ngan hang instructor
- chuyen khoan ngoai he thong
- quay lai app va danh dau `paid`

### 2. Tach payout account va payout request
`PayoutAccount` luu noi nhan tien.
`PayoutRequest` luu yeu cau rut va trang thai xu ly.

### 3. Seed du lieu de dashboard co nghia
Can co:
- instructor da link tai khoan
- instructor co available balance
- request pending / processing / paid
- admin queue co nhieu state

## Risks / Trade-offs

- Vi la manual payout, trang thai `paid` phu thuoc thao tac admin
- Can tranh cho request vuot qua available balance
- Can luu audit trail toi thieu de truy vet

## Rollout Notes

1. Them models
2. Them services/controllers/routes
3. Mo rong QA seed
4. Noi UI instructor/admin vao endpoints moi
