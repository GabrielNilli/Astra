// =================================
//  IMPORTS
// =================================
import { useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import {
  applyAccentColor,
  applyTheme,
  getSettings,
  updateSettings,
  type ThemeMode,
} from "../../../services/settings/settingsService";

import ProfileSection from "./sections/ProfileSection";
import ThemeSection from "./sections/ThemeSection";

import GenericButton from "../../ui/GenericButton";
import { GenericHeader } from "../../ui/GenericHeader";

// =================================
//  COMPONENT
// =================================
export function SettingsPage() {
  // =================================
  //  CONSTS
  // =================================
  const { logout } = useAuth();
  const [theme, setTheme] = useState<ThemeMode>(getSettings().theme);
  const [accentColor, setAccentColor] = useState(getSettings().accentColor);

  const handleThemeChange = (value: ThemeMode) => {
    setTheme(value);
    updateSettings({ theme: value });
    applyTheme(value);
  };

  const handleAccentChange = (value: string) => {
    setAccentColor(value);
    updateSettings({ accentColor: value });
    applyAccentColor(value);
  };

  // =================================
  //  RENDER
  // =================================
  return (
    <>
      <GenericHeader headerTitle="Impostazioni" />
      <main className="mx-auto max-w-lg px-4 py-4">
        <div className="space-y-4">
          <ProfileSection />
          <ThemeSection
            theme={theme}
            onThemeChange={handleThemeChange}
            accentColor={accentColor}
            onAccentChange={handleAccentChange}
          />
        </div>

        <div className="mt-6">
          <GenericButton variant="destructive" onClick={() => void logout()}>
            Log Out
          </GenericButton>
        </div>
      </main>
    </>
  );
}
