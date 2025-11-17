import { api } from '../api';
import type {
  SignInInput,
  SignUpInput,
  AuthResponse,
  PasswordResetRequestInput,
  PasswordResetInput,
  EmailVerificationInput,
  ResendVerificationInput,
  User,
  TwoFactorSetup,
} from '@/types/auth';

// Auth API endpoints
export const authApi = {
  /**
   * Sign up a new user
   */
  signUp: async (data: SignUpInput): Promise<AuthResponse> => {
    return api.post<AuthResponse>('/auth/signup', data);
  },

  /**
   * Sign in with email and password
   */
  signIn: async (data: SignInInput): Promise<AuthResponse> => {
    return api.post<AuthResponse>('/auth/signin', data);
  },

  /**
   * Sign out the current user
   */
  signOut: async (): Promise<void> => {
    return api.post<void>('/auth/signout', {});
  },

  /**
   * Get current authenticated user
   */
  getCurrentUser: async (): Promise<User> => {
    return api.get<User>('/auth/me');
  },

  /**
   * Refresh access token
   */
  refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
    return api.post<AuthResponse>('/auth/refresh', { refresh_token: refreshToken });
  },

  /**
   * Request password reset email
   */
  requestPasswordReset: async (data: PasswordResetRequestInput): Promise<{ message: string }> => {
    return api.post<{ message: string }>('/auth/password/reset-request', data);
  },

  /**
   * Reset password with token
   */
  resetPassword: async (data: PasswordResetInput): Promise<{ message: string }> => {
    return api.post<{ message: string }>('/auth/password/reset', data);
  },

  /**
   * Verify email with token
   */
  verifyEmail: async (data: EmailVerificationInput): Promise<{ message: string }> => {
    return api.post<{ message: string }>('/auth/verify-email', data);
  },

  /**
   * Resend verification email
   */
  resendVerification: async (data: ResendVerificationInput): Promise<{ message: string }> => {
    return api.post<{ message: string }>('/auth/resend-verification', data);
  },

  /**
   * Initiate OAuth login
   */
  initiateOAuth: async (provider: 'google' | 'github'): Promise<{ url: string }> => {
    return api.get<{ url: string }>(`/auth/oauth/${provider}/initiate`);
  },

  /**
   * Handle OAuth callback
   */
  handleOAuthCallback: async (provider: 'google' | 'github', code: string, state?: string): Promise<AuthResponse> => {
    return api.post<AuthResponse>(`/auth/oauth/${provider}/callback`, { code, state });
  },

  /**
   * Setup 2FA (generate secret and QR code)
   */
  setup2FA: async (): Promise<TwoFactorSetup> => {
    return api.post<TwoFactorSetup>('/auth/2fa/setup', {});
  },

  /**
   * Enable 2FA (verify and enable)
   */
  enable2FA: async (totpCode: string): Promise<{ message: string }> => {
    return api.post<{ message: string }>('/auth/2fa/enable', { totp_code: totpCode });
  },

  /**
   * Disable 2FA
   */
  disable2FA: async (password: string): Promise<{ message: string }> => {
    return api.post<{ message: string }>('/auth/2fa/disable', { password });
  },
};
