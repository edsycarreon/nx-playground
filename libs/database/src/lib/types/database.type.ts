import { ColumnType } from 'kysely';

// Helper type for timestamps
export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;

export type Timestamp = ColumnType<Date, Date | string, Date | string>;

// Database Tables Interface
export interface Database {
  users: UsersTable;
  refresh_tokens: RefreshTokensTable;
  password_reset_tokens: PasswordResetTokensTable;
  email_verification_tokens: EmailVerificationTokensTable;
  oauth_providers: OAuthProvidersTable;
  password_history: PasswordHistoryTable;
  two_fa_backup_codes: TwoFaBackupCodesTable;
  login_attempts: LoginAttemptsTable;
}

// Table Interfaces
export interface UsersTable {
  id: Generated<string>;
  email: string;
  password_hash: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  email_verified: Generated<boolean>;
  email_verified_at: Timestamp | null;
  is_active: Generated<boolean>;
  is_2fa_enabled: Generated<boolean>;
  two_fa_secret: string | null;
  failed_login_attempts: Generated<number>;
  locked_until: Timestamp | null;
  last_login_at: Timestamp | null;
  created_at: Generated<Timestamp>;
  updated_at: Generated<Timestamp>;
  deleted_at: Timestamp | null;
}

export interface RefreshTokensTable {
  id: Generated<string>;
  user_id: string;
  token_hash: string;
  expires_at: Timestamp;
  device_name: string | null;
  device_type: string | null;
  ip_address: string | null;
  user_agent: string | null;
  is_revoked: Generated<boolean>;
  revoked_at: Timestamp | null;
  last_used_at: Timestamp | null;
  created_at: Generated<Timestamp>;
}

export interface PasswordResetTokensTable {
  id: Generated<string>;
  user_id: string;
  token_hash: string;
  expires_at: Timestamp;
  used: Generated<boolean>;
  used_at: Timestamp | null;
  created_at: Generated<Timestamp>;
}

export interface EmailVerificationTokensTable {
  id: Generated<string>;
  user_id: string;
  token_hash: string;
  expires_at: Timestamp;
  verified: Generated<boolean>;
  verified_at: Timestamp | null;
  created_at: Generated<Timestamp>;
}

export interface OAuthProvidersTable {
  id: Generated<string>;
  user_id: string;
  provider: string;
  provider_user_id: string;
  access_token: string | null;
  refresh_token: string | null;
  token_expires_at: Timestamp | null;
  created_at: Generated<Timestamp>;
  updated_at: Generated<Timestamp>;
}

export interface PasswordHistoryTable {
  id: Generated<string>;
  user_id: string;
  password_hash: string;
  created_at: Generated<Timestamp>;
}

export interface TwoFaBackupCodesTable {
  id: Generated<string>;
  user_id: string;
  code_hash: string;
  used: Generated<boolean>;
  used_at: Timestamp | null;
  created_at: Generated<Timestamp>;
}

export interface LoginAttemptsTable {
  id: Generated<string>;
  email: string;
  ip_address: string;
  user_agent: string | null;
  success: boolean;
  failure_reason: string | null;
  attempted_at: Generated<Timestamp>;
}