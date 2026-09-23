// =================================
//  IMPORTS
// =================================
import { Laptop, Moon, Sun } from "lucide-react";
import type { ThemeMode } from "../../../../services/settings/settingsService";
import { COLOR_PRESETS } from "../../../../constants/colors";
import { ColorPicker } from "../../../ui/ColorPicker";

// =================================
//  CONSTS
// =================================
const THEME_OPTIONS: { value: ThemeMode; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Chiaro", icon: Sun },
  { value: "dark", label: "Scuro", icon: Moon },
  { value: "system", label: "Sistema", icon: Laptop },
];

// =================================
//  COMPONENT
// =================================
export default function ThemeSection({
  theme,
  onThemeChange,
  accentColor,
  onAccentChange,
}: {
  theme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
  accentColor: string;
  onAccentChange: (color: string) => void;
}) {
  // =================================
  //  RENDER
  // =================================
  return (
    <section className="rounded-2xl border border-base-mid/25 bg-white p-4 shadow-sm dark:bg-base-dark">
      <h2 className="mb-3 text-sm font-semibold">Tema</h2>
      <div className="grid grid-cols-3 gap-2">
        {THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            type="button"
            onClick={() => onThemeChange(value)}
            className={`flex flex-col items-center gap-1.5 rounded-xl border px-3 py-3 text-xs font-medium transition-colors cursor-pointer${
              theme === value
                ? "border-accent bg-accent/10 text-accent"
                : "border-base-mid/25 text-base-mid hover:bg-base-mid/10 cursor-pointer"
            }`}
          >
            <Icon size={18} />
            {label}
          </button>
        ))}
      </div>

      <h3 className="mt-5 mb-3 text-sm font-semibold">Colore</h3>
      <ColorPicker
        value={accentColor}
        onChange={onAccentChange}
        presets={COLOR_PRESETS}
        swatchClassName="h-8 w-8"
      />
    </section>
  );
}
