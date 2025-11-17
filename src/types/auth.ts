export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  workspace_id?: string;
  role?: 'owner' | 'admin' | 'editor' | 'viewer';
  email_verified?: boolean;
  two_factor_enabled?: boolean;
  created_at: string;
  updated_at: string;
}

export interface SignInInput {
  email: string;
  password: string;
  totp_code?: string;
}

export interface SignUpInput {
  email: string;
  password: string;
  full_name?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refresh_token?: string;
  requires_2fa?: boolean;
}

export interface PasswordResetRequestInput {
  email: string;
}

export interface PasswordResetInput {
  token: string;
  password: string;
}

export interface EmailVerificationInput {
  token: string;
}

export interface ResendVerificationInput {
  email: string;
}

export interface OAuthProvider {
  name: 'google' | 'github';
  url: string;
}

export interface TwoFactorSetup {
  secret: string;
  qr_code: string;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
}
