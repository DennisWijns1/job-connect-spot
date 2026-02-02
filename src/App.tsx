import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import WelcomePage from "./pages/WelcomePage";
import LoginPage from "./pages/LoginPage";
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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<WelcomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/handy/register" element={<HandyRegisterPage />} />
          <Route path="/swipe" element={<SwipePage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/ai" element={<AIHelpPage />} />
          <Route path="/chats" element={<ChatsPage />} />
          <Route path="/chat/:id" element={<ChatDetailPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/learning" element={<LearningPage />} />
          <Route path="/quick-chat" element={<QuickChatPage />} />
          <Route path="/instructor" element={<InstructorHomePage />} />
          <Route path="/instructor/register" element={<InstructorRegisterPage />} />
          <Route path="/instructor/dashboard" element={<InstructorDashboardPage />} />
          <Route path="/instructor/lesson/new" element={<CreateLessonPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
