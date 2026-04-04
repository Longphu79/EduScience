## Context

App moi dang luu JWT trong `localStorage`. Dieu nay chua ly tuong cho security va buoc client-side fetch phai giu token trong JS memory.

## Decisions

### 1. Cookie session o layer Next app
Khong sua backend auth contract lon trong dot nay. Next route handlers se:
- login vao backend
- luu token trong httpOnly cookie
- proxy protected requests bang token tu cookie

### 2. Browser E2E theo 3 role
Test browser can cover:
- student login -> my learning -> lesson page
- instructor login -> overview -> courses -> payouts
- admin login -> overview -> payout queue

## Risks / Trade-offs

- Can them proxy layer noi bo trong Next app
- E2E browser can cai them dependency va browser binaries
