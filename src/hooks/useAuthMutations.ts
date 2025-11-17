import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { authApi } from "@/lib/api/auth";
import type {
  SignInInput,
  SignUpInput,
  PasswordResetRequestInput,
  PasswordResetInput,
  EmailVerificationInput,
  ResendVerificationInput,
} from "@/types/auth";
import { toast } from "sonner";

export function useSignIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SignInInput) => authApi.signIn(data),
    onSuccess: (response) => {
      if (response.token) {
        localStorage.setItem("auth_token", response.token);
      }
      if (response.refresh_token) {
        localStorage.setItem("refresh_token", response.refresh_token);
      }
      queryClient.setQueryData(["user"], response.user);
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Failed to sign in";
      toast.error(message);
    },
  });
}

export function useSignUp() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: SignUpInput) => authApi.signUp(data),
    onSuccess: () => {
      toast.success("Account created! Please check your email to verify your account.");
      navigate("/verify-email");
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Failed to create account";
      toast.error(message);
    },
  });
}

export function useSignOut() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: () => authApi.signOut(),
    onSuccess: () => {
      queryClient.clear();
      localStorage.removeItem("auth_token");
      localStorage.removeItem("refresh_token");
      navigate("/login");
      toast.success("Signed out successfully");
    },
    onError: () => {
      // Still clear local state even if API call fails
      queryClient.clear();
      localStorage.removeItem("auth_token");
      localStorage.removeItem("refresh_token");
      navigate("/login");
    },
  });
}

export function useRequestPasswordReset() {
  return useMutation({
    mutationFn: (data: PasswordResetRequestInput) => authApi.requestPasswordReset(data),
    onSuccess: () => {
      toast.success("Password reset email sent!");
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Failed to send reset email";
      toast.error(message);
    },
  });
}

export function useResetPassword() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: PasswordResetInput) => authApi.resetPassword(data),
    onSuccess: () => {
      toast.success("Password reset successfully!");
      setTimeout(() => navigate("/login"), 2000);
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Failed to reset password";
      toast.error(message);
    },
  });
}

export function useVerifyEmail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: EmailVerificationInput) => authApi.verifyEmail(data),
    onSuccess: () => {
      toast.success("Email verified successfully!");
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Failed to verify email";
      toast.error(message);
    },
  });
}

export function useResendVerification() {
  return useMutation({
    mutationFn: (data: ResendVerificationInput) => authApi.resendVerification(data),
    onSuccess: () => {
      toast.success("Verification email sent! Please check your inbox.");
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Failed to send verification email";
      toast.error(message);
    },
  });
}
