# Authentication System Architecture Guide

## Database Schema Summary

Your schema supports a robust auth system with:
- **person** - Core user data + security fields (login attempts, lockout, 2FA)
- **refresh_token** - JWT refresh token management with device tracking
- **email_verification_token** - Email verification flow
- **login_attempt** - Security audit trail
- **password_history** - Prevent password reuse
- **password_reset_token** - Forgot password flow
- **oauth_provider** - Social login support
- **two_fa_backup_code** - 2FA recovery

---

## Flow Charts

### 1. Sign-Up Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         SIGN-UP FLOW                            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌───────────────────┐
                    │  Receive SignUpDto │
                    │  (email, password, │
                    │   firstName, etc.) │
                    └─────────┬─────────┘
                              │
                              ▼
                    ┌───────────────────┐
                    │ Check if email    │
                    │ already exists    │
                    └─────────┬─────────┘
                              │
              ┌───────────────┴───────────────┐
              │                               │
              ▼                               ▼
       ┌─────────────┐               ┌──────────────┐
       │   EXISTS    │               │  NOT EXISTS  │
       │ Return 409  │               │  Continue    │
       └─────────────┘               └──────┬───────┘
                                            │
                                            ▼
                                   ┌──────────────────┐
                                   │ Hash password    │
                                   │ (bcrypt)         │
                                   └────────┬─────────┘
                                            │
                                            ▼
                                   ┌──────────────────┐
                                   │ INSERT into      │
                                   │ person table     │
                                   │ email_verified:  │
                                   │ false            │
                                   └────────┬─────────┘
                                            │
                                            ▼
                                   ┌──────────────────┐
                                   │ Generate email   │
                                   │ verification     │
                                   │ token (hash it)  │
                                   └────────┬─────────┘
                                            │
                                            ▼
                                   ┌──────────────────┐
                                   │ INSERT into      │
                                   │ email_verifica-  │
                                   │ tion_token       │
                                   └────────┬─────────┘
                                            │
                                            ▼
                                   ┌──────────────────┐
                                   │ Send verification│
                                   │ email (async)    │
                                   └────────┬─────────┘
                                            │
                                            ▼
                                   ┌──────────────────┐
                                   │ Return success   │
                                   │ (201 Created)    │
                                   │ NO tokens yet    │
                                   └──────────────────┘
```

**Key decisions:**
- Don't issue JWT tokens until email is verified (prevents spam accounts)
- Store password in `password_history` on creation for future reuse checks

---

### 2. Sign-In Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         SIGN-IN FLOW                            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌───────────────────┐
                    │  Receive SignInDto │
                    │  + Request metadata│
                    │  (IP, User-Agent)  │
                    └─────────┬─────────┘
                              │
                              ▼
                    ┌───────────────────┐
                    │ Find user by email│
                    └─────────┬─────────┘
                              │
              ┌───────────────┴───────────────┐
              │                               │
              ▼                               ▼
       ┌─────────────┐               ┌──────────────┐
       │  NOT FOUND  │               │    FOUND     │
       │ Log attempt │               │   Continue   │
       │ Return 401  │               └──────┬───────┘
       └─────────────┘                      │
                                            ▼
                                   ┌──────────────────┐
                                   │ Check locked_    │
                                   │ until > now?     │
                                   └────────┬─────────┘
                                            │
                          ┌─────────────────┴─────────────────┐
                          │                                   │
                          ▼                                   ▼
                   ┌─────────────┐                   ┌──────────────┐
                   │   LOCKED    │                   │  NOT LOCKED  │
                   │ Return 423  │                   │   Continue   │
                   └─────────────┘                   └──────┬───────┘
                                                            │
                                                            ▼
                                                   ┌──────────────────┐
                                                   │ Verify password  │
                                                   │ (bcrypt.compare) │
                                                   └────────┬─────────┘
                                                            │
                                  ┌─────────────────────────┴─────────────────────────┐
                                  │                                                   │
                                  ▼                                                   ▼
                           ┌─────────────┐                                   ┌──────────────┐
                           │   INVALID   │                                   │    VALID     │
                           └──────┬──────┘                                   └──────┬───────┘
                                  │                                                  │
                                  ▼                                                  ▼
                         ┌──────────────────┐                               ┌──────────────────┐
                         │ Increment failed_│                               │ Check email_     │
                         │ login_attempts   │                               │ verified = true? │
                         └────────┬─────────┘                               └────────┬─────────┘
                                  │                                                  │
                                  ▼                                   ┌──────────────┴──────────────┐
                         ┌──────────────────┐                         │                             │
                         │ attempts >= 5?   │                         ▼                             ▼
                         │ Set locked_until │                  ┌─────────────┐             ┌──────────────┐
                         │ (now + 15 min)   │                  │ NOT VERIFIED│             │   VERIFIED   │
                         └────────┬─────────┘                  │ Return 403  │             │   Continue   │
                                  │                            └─────────────┘             └──────┬───────┘
                                  ▼                                                               │
                         ┌──────────────────┐                                                     ▼
                         │ Log login_attempt│                                            ┌──────────────────┐
                         │ success: false   │                                            │ is_2fa_enabled?  │
                         │ Return 401       │                                            └────────┬─────────┘
                         └──────────────────┘                                                     │
                                                                           ┌──────────────────────┴──────────────────────┐
                                                                           │                                             │
                                                                           ▼                                             ▼
                                                                    ┌─────────────┐                             ┌──────────────┐
                                                                    │  2FA ENABLED│                             │ 2FA DISABLED │
                                                                    │ Return temp │                             │ Issue tokens │
                                                                    │ 2FA token   │                             │   directly   │
                                                                    └─────────────┘                             └──────┬───────┘
                                                                                                                       │
                                                                                                                       ▼
                                                                                                              ┌──────────────────┐
                                                                                                              │ ISSUE TOKENS     │
                                                                                                              │ (see below)      │
                                                                                                              └──────────────────┘
```

---

### 3. Token Issuance (shared by sign-in and refresh)

```
┌─────────────────────────────────────────────────────────────────┐
│                      TOKEN ISSUANCE                             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌───────────────────┐
                    │ Generate Access   │
                    │ Token (JWT)       │
                    │ - Short-lived     │
                    │ - 15 min typical  │
                    │ - Contains:       │
                    │   sub, email, iat │
                    └─────────┬─────────┘
                              │
                              ▼
                    ┌───────────────────┐
                    │ Generate Refresh  │
                    │ Token (opaque)    │
                    │ - crypto.random   │
                    │ - 7-30 days       │
                    └─────────┬─────────┘
                              │
                              ▼
                    ┌───────────────────┐
                    │ Hash refresh token│
                    │ (SHA-256)         │
                    └─────────┬─────────┘
                              │
                              ▼
                    ┌───────────────────┐
                    │ INSERT into       │
                    │ refresh_token     │
                    │ - token_hash      │
                    │ - person_id       │
                    │ - expires_at      │
                    │ - ip_address      │
                    │ - user_agent      │
                    │ - device_name     │
                    └─────────┬─────────┘
                              │
                              ▼
                    ┌───────────────────┐
                    │ Update person     │
                    │ - last_login_at   │
                    │ - reset failed_   │
                    │   login_attempts  │
                    └─────────┬─────────┘
                              │
                              ▼
                    ┌───────────────────┐
                    │ Log login_attempt │
                    │ success: true     │
                    └─────────┬─────────┘
                              │
                              ▼
                    ┌───────────────────┐
                    │ Return:           │
                    │ - accessToken     │
                    │ - refreshToken    │
                    │ - expiresIn       │
                    └───────────────────┘
```

---

### 4. Refresh Token Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     REFRESH TOKEN FLOW                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌───────────────────┐
                    │ Receive refresh   │
                    │ token from client │
                    └─────────┬─────────┘
                              │
                              ▼
                    ┌───────────────────┐
                    │ Hash the received │
                    │ token (SHA-256)   │
                    └─────────┬─────────┘
                              │
                              ▼
                    ┌───────────────────┐
                    │ Find in DB by     │
                    │ token_hash        │
                    └─────────┬─────────┘
                              │
              ┌───────────────┴───────────────┐
              │                               │
              ▼                               ▼
       ┌─────────────┐               ┌──────────────┐
       │  NOT FOUND  │               │    FOUND     │
       │ Return 401  │               │   Continue   │
       └─────────────┘               └──────┬───────┘
                                            │
                                            ▼
                                   ┌──────────────────┐
                                   │ Check is_revoked │
                                   │ = false AND      │
                                   │ expires_at > now │
                                   └────────┬─────────┘
                                            │
                          ┌─────────────────┴─────────────────┐
                          │                                   │
                          ▼                                   ▼
                   ┌─────────────┐                   ┌──────────────┐
                   │  INVALID    │                   │    VALID     │
                   │ Return 401  │                   │   Continue   │
                   └─────────────┘                   └──────┬───────┘
                                                            │
                                                            ▼
                                                   ┌──────────────────┐
                                                   │ ROTATION:        │
                                                   │ Revoke old token │
                                                   │ (is_revoked=true,│
                                                   │  revoked_at=now) │
                                                   └────────┬─────────┘
                                                            │
                                                            ▼
                                                   ┌──────────────────┐
                                                   │ Update last_     │
                                                   │ used_at on old   │
                                                   │ token            │
                                                   └────────┬─────────┘
                                                            │
                                                            ▼
                                                   ┌──────────────────┐
                                                   │ ISSUE NEW TOKENS │
                                                   │ (Token Issuance  │
                                                   │  flow above)     │
                                                   └──────────────────┘
```

---

### 5. Email Verification Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                   EMAIL VERIFICATION FLOW                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌───────────────────┐
                    │ User clicks link  │
                    │ /verify?token=xxx │
                    └─────────┬─────────┘
                              │
                              ▼
                    ┌───────────────────┐
                    │ Hash token,       │
                    │ find in DB        │
                    └─────────┬─────────┘
                              │
                              ▼
                    ┌───────────────────┐
                    │ Check: exists AND │
                    │ !verified AND     │
                    │ expires_at > now  │
                    └─────────┬─────────┘
                              │
              ┌───────────────┴───────────────┐
              │                               │
              ▼                               ▼
       ┌─────────────┐               ┌──────────────┐
       │   INVALID   │               │    VALID     │
       │ Return 400  │               │   Continue   │
       └─────────────┘               └──────┬───────┘
                                            │
                                            ▼
                                   ┌──────────────────┐
                                   │ UPDATE token:    │
                                   │ verified = true  │
                                   │ verified_at = now│
                                   └────────┬─────────┘
                                            │
                                            ▼
                                   ┌──────────────────┐
                                   │ UPDATE person:   │
                                   │ email_verified   │
                                   │ = true           │
                                   └────────┬─────────┘
                                            │
                                            ▼
                                   ┌──────────────────┐
                                   │ Return success   │
                                   │ (can auto-login) │
                                   └──────────────────┘
```

---

## Implementation Order

| Phase | Feature | Endpoints | Tables Used |
|-------|---------|-----------|-------------|
| 1 | **Sign-up** | `POST /auth/signup` | `person`, `password_history` |
| 2 | **Email verification** | `POST /auth/verify-email` | `email_verification_token`, `person` |
| 3 | **Sign-in** | `POST /auth/signin` | `person`, `refresh_token`, `login_attempt` |
| 4 | **Token refresh** | `POST /auth/refresh` | `refresh_token` |
| 5 | **Sign-out** | `POST /auth/signout` | `refresh_token` |
| 6 | **Password reset** | `POST /auth/forgot`, `POST /auth/reset` | `password_reset_token`, `person`, `password_history` |
| 7 | **2FA setup** | `POST /auth/2fa/setup`, `POST /auth/2fa/verify` | `person`, `two_fa_backup_code` |
| 8 | **OAuth** (optional) | `GET /auth/oauth/:provider` | `oauth_provider`, `person` |

---

## Services to Create

```
auth/
├── auth.service.ts          # Orchestrates auth flows
├── auth.controller.ts       # HTTP endpoints
├── tokens/
│   └── tokens.service.ts    # JWT + refresh token generation/validation
├── guards/
│   ├── jwt-auth.guard.ts    # Validates access tokens
│   └── refresh-auth.guard.ts
└── strategies/
    └── jwt.strategy.ts      # Passport JWT strategy

users/
├── users.service.ts         # User CRUD
└── users.controller.ts

email/
└── email.service.ts         # Send verification/reset emails

login-attempts/
└── login-attempts.service.ts # Log and query attempts
```

---

## Security Considerations

1. **Always hash tokens before storing** - refresh tokens, email tokens, reset tokens
2. **Use refresh token rotation** - revoke old token when issuing new one
3. **Rate limit auth endpoints** - prevent brute force
4. **Account lockout** - your schema has `locked_until` and `failed_login_attempts`
5. **Password history** - check against `password_history` on reset
6. **Secure cookie options** - `httpOnly`, `secure`, `sameSite` for refresh tokens
7. **Short access token TTL** - 15 minutes typical
8. **Device tracking** - your `refresh_token` table has device fields for session management
