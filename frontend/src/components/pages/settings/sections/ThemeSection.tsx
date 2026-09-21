// =================================
//  IMPORTS
// =================================
import { Laptop, Moon, Sun } from "lucide-react";
import type { ThemeMode } from "../../../../services/settings/settingsService";

// =================================
//  CONSTS
// =================================
const THEME_OPTIONS: { value: ThemeMode; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Chiaro", icon: Sun },
  { value: "dark", label: "Scuro", icon: Moon },
  { value: "system", label: "Sistema", icon: Laptop },
];

const ACCENT_PRESETS = [
  "#9333ea", // violetto
  "#dc5f00", // arancione
  "#2563eb", // blu
  "#16a34a", // verde
  "#e11d48", // rosso
  "#f59e0b", // ambra
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
      <div className="flex flex-wrap items-center gap-2.5">
        {ACCENT_PRESETS.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => onAccentChange(color)}
            aria-label={`Usa ${color} come colore`}
            className={`h-8 w-8 rounded-full border-2 transition-transform ${
              accentColor.toLowerCase() === color.toLowerCase()
                ? "border-base-dark scale-110 dark:border-base-light"
                : "border-transparent hover:scale-105 cursor-pointer"
            }`}
            style={{ backgroundColor: color }}
          />
        ))}

        <label
          title="Colore personalizzato"
          className="relative flex h-8 w-8 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-base-mid/40 text-sm leading-none text-base-mid"
        >
          +
          <input
            type="color"
            value={accentColor}
            onChange={(event) => onAccentChange(event.target.value)}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          />
        </label>
      </div>
    </section>
  );
}
