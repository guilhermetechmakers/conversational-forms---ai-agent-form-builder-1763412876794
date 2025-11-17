import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { LandingPage } from "@/pages/LandingPage";
import { LoginPage } from "@/pages/LoginPage";
import { SignupPage } from "@/pages/SignupPage";
import { EmailVerificationPage } from "@/pages/EmailVerificationPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { AgentBuilderPage } from "@/pages/AgentBuilderPage";
import { AgentChatPage } from "@/pages/AgentChatPage";
import { SessionViewerPage } from "@/pages/SessionViewerPage";
import { AnalyticsPage } from "@/pages/AnalyticsPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { NotFoundPage } from "@/pages/NotFoundPage";

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
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/verify-email" element={<EmailVerificationPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/agents" element={<DashboardPage />} />
          <Route path="/agents/new" element={<AgentBuilderPage />} />
          <Route path="/agents/:id/edit" element={<AgentBuilderPage />} />
          <Route path="/a/:workspace/:slug" element={<AgentChatPage />} />
          <Route path="/sessions/:id" element={<SessionViewerPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </QueryClientProvider>
  );
}
