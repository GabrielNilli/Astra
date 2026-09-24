// =================================
//  IMPORTS
// =================================
import { useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { ApiError } from "../../../api/client";
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
  const { logout, user, updateAccentColor } = useAuth();
  const [theme, setTheme] = useState<ThemeMode>(getSettings().theme);
  const [accentColor, setAccentColor] = useState(
    user?.accent_color ?? getSettings().accentColor,
  );
  const [accentError, setAccentError] = useState<string | null>(null);

  const handleThemeChange = (value: ThemeMode) => {
    setTheme(value);
    updateSettings({ theme: value });
    applyTheme(value);
  };

  const handleAccentChange = async (value: string) => {
    const previousColor = accentColor;
    setAccentColor(value);
    setAccentError(null);
    applyAccentColor(value);

    try {
      // Il colore è legato al profilo: ogni utente ha il proprio, salvato lato server.
      await updateAccentColor(value);
    } catch (err) {
      setAccentColor(previousColor);
      applyAccentColor(previousColor);
      setAccentError(
        err instanceof ApiError
          ? err.message
          : "Impossibile salvare il colore.",
      );
    }
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
            onAccentChange={(value) => void handleAccentChange(value)}
          />
          {accentError && (
            <p className="text-xs text-red-600 dark:text-red-400">{accentError}</p>
          )}
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
