// =================================
//  IMPORTS
// =================================
import { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { DashboardPage } from "./components/pages/DashboardPage";
import { LoginPage } from "./components/pages/login/LoginPage";
import { RegisterPage } from "./components/pages/login/RegisterPage";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { useAuth } from "./context/AuthContext";
import { applySettings, getSettings } from "./services/settings/settingsService";

import NavigationTabs from "./components/ui/NavigationTabs";
import SideNav from "./components/ui/SideNav";

import { NotesPage } from "./components/pages/NotesPage";
import { ChartsPage } from "./components/pages/ChartsPage";
import { SettingsPage } from "./components/pages/settings/SettingsPage";

// =================================
//  COMPONENT
// =================================
function App() {
  // =================================
  //  CONSTS
  // =================================
  const { token } = useAuth();

  useEffect(() => {
    applySettings(getSettings());
  }, []);

  // =================================
  //  RENDER
  // =================================
  return (
    <div className="flex h-dvh flex-col overflow-hidden lg:flex-row">
      {token && <SideNav />}

      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/notes" element={<NotesPage />} />
            <Route path="/charts" element={<ChartsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      {token && <NavigationTabs />}
    </div>
  );
}

export default App;
