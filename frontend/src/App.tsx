// =================================
//  IMPORTS
// =================================
import { Navigate, Route, Routes } from "react-router-dom";
import { DashboardPage } from "./components/pages/DashboardPage";
import { LoginPage } from "./components/pages/login/LoginPage";
import { RegisterPage } from "./components/pages/login/RegisterPage";
import { ProtectedRoute } from "./routes/ProtectedRoute";

import NavigationTabs from "./components/ui/NavigationTabs";
import SideNav from "./components/ui/SideNav";

import { NotesPage } from "./components/pages/NotesPage";
import { ChartsPage } from "./components/pages/ChartsPage";
import { SettingsPage } from "./components/pages/SettingsPage";

// =================================
//  COMPONENT
// =================================
function App() {
  // =================================
  //  RENDER
  // =================================
  return (
    <>
      <div className="lg:flex">
        <SideNav />
      </div>

      <div className="lg:flex-1">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<DashboardPage />} />
          </Route>
          <Route path="/notes" element={<NotesPage />} />
          <Route path="/charts" element={<ChartsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      <NavigationTabs />
    </>
  );
}

export default App;
