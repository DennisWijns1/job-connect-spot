import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from '@/context/AuthContext';
import { OfflineBanner } from './components/OfflineBanner';
import WelcomePage from "./pages/WelcomePage";
import LoginPage from "./pages/LoginPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import HandyRegisterPage from "./pages/HandyRegisterPage";
import SwipePage from "./pages/SwipePage";
import MapPage from "./pages/MapPage";
import AIHelpPage from "./pages/AIHelpPage";
import ChatsPage from "./pages/ChatsPage";
import ChatDetailPage from "./pages/ChatDetailPage";
import ProfilePage from "./pages/ProfilePage";
import LearningPage from "./pages/LearningPage";
import QuickChatPage from "./pages/QuickChatPage";
import InstructorHomePage from "./pages/InstructorHomePage";
import InstructorRegisterPage from "./pages/InstructorRegisterPage";
import InstructorDashboardPage from "./pages/InstructorDashboardPage";
import CreateLessonPage from "./pages/CreateLessonPage";
import SettingsPage from "./pages/SettingsPage";
import HelpSupportPage from "./pages/HelpSupportPage";
import TutorialPage from "./pages/TutorialPage";
import ARTutorialPage from "./pages/ARTutorialPage";
import InteractiveTutorialPage from "./pages/InteractiveTutorialPage";
import NotFound from "./pages/NotFound";
import HandyPhotosPage from "./pages/HandyPhotosPage";
import CompletedProjectsPage from "./pages/CompletedProjectsPage";
import HandySkillsPage from "./pages/HandySkillsPage";
import WorkAreaPage from "./pages/WorkAreaPage";
import VerificationPage from "./pages/VerificationPage";
import OnboardingPage from "./pages/OnboardingPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 10,
    },
  },
});

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, isLoading } = useAuth();
  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
    </div>
  );
  if (!session) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <OfflineBanner />
          <div className="max-w-md mx-auto relative min-h-screen">
            <Routes>
              <Route path="/" element={<WelcomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/handy/register" element={<HandyRegisterPage />} />
              <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />
              <Route path="/swipe" element={<ProtectedRoute><SwipePage /></ProtectedRoute>} />
              <Route path="/map" element={<ProtectedRoute><MapPage /></ProtectedRoute>} />
              <Route path="/ai" element={<ProtectedRoute><AIHelpPage /></ProtectedRoute>} />
              <Route path="/chats" element={<ProtectedRoute><ChatsPage /></ProtectedRoute>} />
              <Route path="/chat/:id" element={<ProtectedRoute><ChatDetailPage /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
              <Route path="/profile/photos" element={<ProtectedRoute><HandyPhotosPage /></ProtectedRoute>} />
              <Route path="/profile/completed" element={<ProtectedRoute><CompletedProjectsPage /></ProtectedRoute>} />
              <Route path="/profile/skills" element={<ProtectedRoute><HandySkillsPage /></ProtectedRoute>} />
              <Route path="/profile/area" element={<ProtectedRoute><WorkAreaPage /></ProtectedRoute>} />
              <Route path="/profile/verify" element={<ProtectedRoute><VerificationPage /></ProtectedRoute>} />
              <Route path="/learning" element={<ProtectedRoute><LearningPage /></ProtectedRoute>} />
              <Route path="/quick-chat" element={<ProtectedRoute><QuickChatPage /></ProtectedRoute>} />
              <Route path="/instructor" element={<ProtectedRoute><InstructorHomePage /></ProtectedRoute>} />
              <Route path="/instructor/register" element={<InstructorRegisterPage />} />
              <Route path="/instructor/dashboard" element={<ProtectedRoute><InstructorDashboardPage /></ProtectedRoute>} />
              <Route path="/instructor/lesson/new" element={<ProtectedRoute><CreateLessonPage /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
              <Route path="/help" element={<ProtectedRoute><HelpSupportPage /></ProtectedRoute>} />
              <Route path="/tutorial" element={<TutorialPage />} />
              <Route path="/ar-tutorial" element={<ARTutorialPage />} />
              <Route path="/interactive-tutorial" element={<InteractiveTutorialPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
