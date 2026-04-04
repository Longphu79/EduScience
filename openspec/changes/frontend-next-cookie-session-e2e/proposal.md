## Why

`frontend-next` hien da dung live API, nhung auth van dua tren `localStorage` va chua co browser E2E cho role workflows. User muon day len muc chac hon:
- session dang web dung cookie thay vi token trong localStorage
- co browser E2E cho student, instructor, admin

## What Changes

- Chuyen auth cua `frontend-next` sang httpOnly cookie session thong qua Next route handlers
- Them proxy route cho protected backend APIs de client components khong can doc token
- Them Playwright tests cho cac workflow role chinh

## Capabilities

### New Capabilities
- `web-session-auth`
- `browser-role-e2e`

## Impact

- **Frontend**: auth provider, login, logout, protected fetch se doi contract noi bo
- **QA**: co browser regression checks that tren app moi
