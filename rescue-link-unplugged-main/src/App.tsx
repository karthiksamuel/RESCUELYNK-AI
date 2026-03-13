import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet, Navigate } from "react-router-dom";
import CommandLayout from "@/layouts/CommandLayout";
import CommandCenter from "@/pages/CommandCenter";
import SOSScreen from "./pages/SOSScreen";
import Dashboard from "./pages/Dashboard";
import AIAssistant from "./pages/AIAssistant";
import KnowledgeLibrary from "./pages/KnowledgeLibrary";
import AlertsPage from "./pages/AlertsPage";
import RescueMapPage from "./pages/RescueMapPage";
import SettingsPage from "./pages/SettingsPage";
import ProfileSettings from "./pages/settings/ProfileSettings";
import NotificationSettings from "./pages/settings/NotificationSettings";
import MeshSettings from "./pages/settings/MeshSettings";
import SecuritySettings from "./pages/settings/SecuritySettings";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import OperatorLoginPage from "./pages/OperatorLoginPage";
import OperatorSignupPage from "./pages/OperatorSignupPage";
import RescuerLoginPage from "./pages/RescuerLoginPage";
import RescuerSignupPage from "./pages/RescuerSignupPage";
import NotFound from "./pages/NotFound";
import { AuthProvider, useAuth } from "@/lib/authContext";
import { AppBackground } from "@/components/system/AppBackground";

const queryClient = new QueryClient();

function AppLayout() {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/" replace />;
  return (
    <CommandLayout>
      <Outlet />
    </CommandLayout>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, demoMode } = useAuth();
  if (!isLoggedIn && demoMode) {
    return <Navigate to="/settings?restricted=true" replace />;
  }
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function CitizenRoute({ children }: { children: React.ReactNode }) {
  const { hasRole, demoMode } = useAuth();
  if (demoMode || hasRole("citizen")) return <>{children}</>;
  return <Navigate to="/login" replace />;
}

function RescuerRoute({ children }: { children: React.ReactNode }) {
  const { hasRole, demoMode } = useAuth();
  if (demoMode || hasRole("rescue_team")) return <>{children}</>;
  return <Navigate to="/rescuer-login" replace />;
}

/** Routes restricted to command_operator role */
function OperatorRoute({ children }: { children: React.ReactNode }) {
  const { hasRole, demoMode } = useAuth();
  if (demoMode || hasRole("command_operator")) return <>{children}</>;
  return <Navigate to="/operator-login" replace />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppBackground />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/operator-login" element={<OperatorLoginPage />} />
            <Route path="/operator-signup" element={<OperatorSignupPage />} />
            <Route path="/rescuer-login" element={<RescuerLoginPage />} />
            <Route path="/rescuer-signup" element={<RescuerSignupPage />} />

            <Route element={<AppLayout />}>
              <Route path="/operator-dashboard" element={<OperatorRoute><CommandCenter /></OperatorRoute>} />
              <Route path="/rescuer-dashboard" element={<RescuerRoute><RescueMapPage /></RescuerRoute>} />
              <Route path="/dashboard" element={<CitizenRoute><Dashboard /></CitizenRoute>} />

              <Route path="/sos" element={<SOSScreen />} />
              <Route path="/assistant" element={<AIAssistant />} />
              <Route path="/knowledge" element={<KnowledgeLibrary />} />
              <Route path="/alerts" element={<AlertsPage />} />
              <Route path="/map" element={<RescueMapPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/settings/profile" element={<ProfileSettings />} />
              <Route path="/settings/notifications" element={<NotificationSettings />} />
              <Route path="/settings/mesh" element={<MeshSettings />} />
              <Route path="/settings/security" element={<SecuritySettings />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
