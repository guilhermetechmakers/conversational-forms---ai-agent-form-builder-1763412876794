import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '@/lib/api/auth';
import type { User, SignInInput, SignUpInput, AuthResponse } from '@/types/auth';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (data: SignInInput) => Promise<AuthResponse | { requires_2fa: true }>;
  signUp: (data: SignUpInput) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Check if user is authenticated on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const currentUser = await authApi.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      setUser(null);
      // Clear any stale tokens
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = useCallback(async (data: SignInInput): Promise<AuthResponse | { requires_2fa: true }> => {
    try {
      const response = await authApi.signIn(data);
      
      // Store tokens if provided (for non-HTTP-only cookie fallback)
      if (response.token) {
        localStorage.setItem('auth_token', response.token);
      }
      if (response.refresh_token) {
        localStorage.setItem('refresh_token', response.refresh_token);
      }

      // If 2FA is required, return early
      if (response.requires_2fa) {
        return { requires_2fa: true };
      }

      setUser(response.user);
      toast.success('Welcome back!');
      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to sign in';
      toast.error(message);
      throw error;
    }
  }, []);

  const signUp = useCallback(async (data: SignUpInput): Promise<void> => {
    try {
      await authApi.signUp(data);
      toast.success('Account created! Please check your email to verify your account.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create account';
      toast.error(message);
      throw error;
    }
  }, []);

  const signOut = useCallback(async (): Promise<void> => {
    try {
      await authApi.signOut();
    } catch (error) {
      // Continue with signout even if API call fails
      console.error('Sign out error:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      navigate('/login');
      toast.success('Signed out successfully');
    }
  }, [navigate]);

  const refreshUser = useCallback(async (): Promise<void> => {
    try {
      const currentUser = await authApi.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      setUser(null);
      throw error;
    }
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    signIn,
    signUp,
    signOut,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
