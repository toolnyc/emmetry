# Auth is delegated to Clerk; no sessions table in the schema

The admin has multiple users, infrequent logins, and a non-technical primary editor. Rolling custom session management (hashed passwords, token issuance, expiry, password reset flows) is undifferentiated work with a meaningful security surface. Clerk handles all of this, including account management UI, at no cost at this usage level. There is no `sessions` table and no auth code in the repo — this is deliberate.

## Considered Options

Auth.js (NextAuth v5) with a credentials provider was considered. Rejected because it still requires managing password reset flows and account creation manually. Clerk removes the problem entirely.
