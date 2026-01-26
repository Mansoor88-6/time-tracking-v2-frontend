## Auth flow sanity checks

- **Tenant onboarding**
  - Call `/auth/register-tenant` from the UI and verify a success message is shown.
  - As super-admin, approve the tenant in `/superadmin`.
  - Use `/auth/check-status` to confirm status and ability to set password.
  - Complete `/auth/setup-password` and confirm redirect + login into `/dashboard`.

- **User login + sessions**
  - Log in as an org user via `/auth/login` and confirm you reach `/dashboard`.
  - Visit `/sessions` to see your active session.
  - Visit `/devices` and confirm your browser/agent device shows up (once backend wiring is complete).

- **Super-admin**
  - Log in via `/superadmin/login` with the seeded credentials.
  - Verify tenants list loads and approve/suspend/activate actions complete without errors.

- **Invitations**
  - As ORG_ADMIN, send an invite from `/invitations`.
  - Visit `/invitations/[token]` (using the link from backend/email) and accept the invite.
  - Confirm the new user can log in via `/auth/login`.

