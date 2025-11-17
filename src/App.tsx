import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { LandingPage } from "@/pages/LandingPage";
import { AuthPage } from "@/pages/AuthPage";
import { EmailVerificationPage } from "@/pages/EmailVerificationPage";
import { PasswordResetRequestPage } from "@/pages/PasswordResetRequestPage";
import { PasswordResetPage } from "@/pages/PasswordResetPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { AgentBuilderPage } from "@/pages/AgentBuilderPage";
import { AgentChatPage } from "@/pages/AgentChatPage";
import { SessionViewerPage } from "@/pages/SessionViewerPage";
import { AnalyticsPage } from "@/pages/AnalyticsPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { BillingPage } from "@/pages/BillingPage";
import { AdminDashboardPage } from "@/pages/AdminDashboardPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { ServerErrorPage } from "@/pages/ServerErrorPage";
import { OAuthCallbackPage } from "@/pages/OAuthCallbackPage";
import { PrivacyTermsPage } from "@/pages/PrivacyTermsPage";
import { HelpDocsPage } from "@/pages/HelpDocsPage";
import { KnowledgeAttachmentsPage } from "@/pages/KnowledgeAttachmentsPage";
import { WebhooksPage } from "@/pages/WebhooksPage";
import { NotificationCenterPage } from "@/pages/NotificationCenterPage";

// React Query client with optimal defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<AuthPage />} />
              <Route path="/signup" element={<AuthPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/verify-email" element={<EmailVerificationPage />} />
              <Route path="/forgot-password" element={<PasswordResetRequestPage />} />
              <Route path="/reset-password" element={<PasswordResetPage />} />
              <Route path="/oauth/callback/:provider" element={<OAuthCallbackPage />} />
              <Route path="/privacy-terms" element={<PrivacyTermsPage />} />
              <Route path="/privacy" element={<PrivacyTermsPage />} />
              <Route path="/terms" element={<PrivacyTermsPage />} />
              <Route path="/cookies" element={<PrivacyTermsPage />} />
              
              {/* Error pages */}
              <Route path="/500" element={<ServerErrorPage />} />
              <Route path="/server-error" element={<ServerErrorPage />} />
              
              {/* Protected routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute requireEmailVerification>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/agents"
                element={
                  <ProtectedRoute requireEmailVerification>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/agents/new"
                element={
                  <ProtectedRoute requireEmailVerification>
                    <AgentBuilderPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/agents/:id/edit"
                element={
                  <ProtectedRoute requireEmailVerification>
                    <AgentBuilderPage />
                  </ProtectedRoute>
                }
              />
              <Route path="/a/:workspace/:slug" element={<AgentChatPage />} />
              <Route
                path="/sessions/:id"
                element={
                  <ProtectedRoute requireEmailVerification>
                    <SessionViewerPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/analytics"
                element={
                  <ProtectedRoute requireEmailVerification>
                    <AnalyticsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute requireEmailVerification>
                    <SettingsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/billing"
                element={
                  <ProtectedRoute requireEmailVerification>
                    <BillingPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/help"
                element={
                  <ProtectedRoute requireEmailVerification>
                    <HelpDocsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/docs"
                element={
                  <ProtectedRoute requireEmailVerification>
                    <HelpDocsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/knowledge"
                element={
                  <ProtectedRoute requireEmailVerification>
                    <KnowledgeAttachmentsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/webhooks"
                element={
                  <ProtectedRoute requireEmailVerification>
                    <WebhooksPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/notifications"
                element={
                  <ProtectedRoute requireEmailVerification>
                    <NotificationCenterPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requireEmailVerification requireAdmin>
                    <AdminDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
            <Toaster />
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
