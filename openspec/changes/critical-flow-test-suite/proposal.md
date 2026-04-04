## Why

EduScience da co nhieu flow critical moi duoc implement (`authorization-foundation`, `student-learning-journey`, `checkout-hardening`) nhung repo van chua co backend test harness, coverage gate, hay regression suite cho business logic co rui ro cao.

Neu khong co test suite:

- payment bugs de quay lai ma khong bi phat hien
- duplicate webhook/fulfillment regressions de tai xuat hien
- progress va order serialization de bi vo khi refactor

## What Changes

- Tao test harness native cho backend bang `node:test`
- Cover critical business flows va edge cases cho checkout/webhook
- Bat coverage threshold 100% cho cac module critical duoc cover
- Fix cac bug lo ra trong qua trinh viet test

## Capabilities

### New Capabilities
- `critical-flow-tests`: regression suite cho payment/order flows

### Modified Capabilities
- `checkout`
- `sepay-webhook`

## Impact

- **Backend**: them scripts test/coverage, them unit tests va utilities
- **Engineering**: co gate de khong merge regression vao payment core
