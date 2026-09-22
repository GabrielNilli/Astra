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

import Logo from "../../images/Logo.png";

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
      <header className="sticky top-0 z-40 border-b border-base-mid/25 bg-white px-4 pt-6 pb-4 dark:bg-base-dark lg:hidden">
        <div className="flex items-center gap-2">
          <img src={Logo} alt="Astra" className="h-8 w-8" />
          <h1 className="font-headline text-xl font-bold tracking-tight">
            Impostazioni
          </h1>
        </div>
      </header>
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
          <button
            type="button"
            onClick={() => void logout()}
            className="rounded-md border border-base-mid/40 px-3 py-2 text-sm font-medium text-base-mid transition hover:bg-base-mid/10 cursor-pointer"
          >
            Esci
          </button>
        </div>
      </main>
    </>
  );
}
