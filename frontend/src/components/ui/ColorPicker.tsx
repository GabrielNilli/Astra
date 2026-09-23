// =================================
//  IMPORTS
// =================================
import { useState } from "react";
import { Check } from "lucide-react";
import { HexColorPicker } from "react-colorful";
import GenericButton from "./GenericButton";

// =================================
//  COMPONENT
// =================================
export function ColorPicker({
  value,
  onChange,
  presets,
  swatchClassName = "h-6 w-6",
}: {
  value: string;
  onChange: (color: string) => void;
  presets: string[];
  swatchClassName?: string;
}) {
  // =================================
  //  CONSTS
  // =================================
  const isPreset = (color: string) =>
    presets.some((preset) => preset.toLowerCase() === color.toLowerCase());

  // Colore personalizzato confermato (sostituisce il "+"); parte dal valore
  // corrente se non è una preset, così resta visibile anche dopo un remount.
  const [customColor, setCustomColor] = useState<string | null>(
    isPreset(value) ? null : value,
  );
  const [draftColor, setDraftColor] = useState(value);
  const [showPicker, setShowPicker] = useState(false);

  const swatchColor = showPicker ? draftColor : customColor;
  const isCustomActive =
    !showPicker &&
    customColor !== null &&
    customColor.toLowerCase() === value.toLowerCase();

  // =================================
  //  FUNCTIONS
  // =================================
  function handleToggle() {
    if (showPicker) {
      setShowPicker(false);
      return;
    }
    setDraftColor(customColor ?? value);
    setShowPicker(true);
  }

  function handleConfirm() {
    setCustomColor(draftColor);
    onChange(draftColor);
    setShowPicker(false);
  }

  // =================================
  //  RENDER
  // =================================
  return (
    <div>
      <div className="flex flex-wrap items-center gap-2.5">
        {presets.map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => onChange(preset)}
            aria-label={`Usa ${preset} come colore`}
            className={`${swatchClassName} cursor-pointer rounded-full border-2 transition-transform ${
              value.toLowerCase() === preset.toLowerCase()
                ? "scale-110 border-base-dark dark:border-base-light"
                : "border-transparent hover:scale-105"
            }`}
            style={{ backgroundColor: preset }}
          />
        ))}

        <button
          type="button"
          title="Colore personalizzato"
          aria-label="Colore personalizzato"
          onClick={handleToggle}
          className={`${swatchClassName} flex cursor-pointer items-center justify-center rounded-full border-2 text-sm leading-none text-base-mid transition-transform ${
            isCustomActive
              ? "scale-110 border-base-dark dark:border-base-light"
              : swatchColor
                ? "border-transparent hover:scale-105"
                : "border-dashed border-base-mid/40"
          }`}
          style={swatchColor ? { backgroundColor: swatchColor } : undefined}
        >
          {!swatchColor && "+"}
        </button>
      </div>

      {showPicker && (
        <div className="mt-3 space-y-2">
          <HexColorPicker
            color={draftColor}
            onChange={setDraftColor}
            style={{ width: "100%" }}
          />
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-base-mid uppercase">
              {draftColor}
            </span>
            <div className="flex gap-2">
              <GenericButton
                type="button"
                variant="secondary"
                onClick={() => setShowPicker(false)}
              >
                Annulla
              </GenericButton>
              <GenericButton
                type="button"
                variant="primary"
                onClick={handleConfirm}
                aria-label="Conferma colore personalizzato"
              >
                <Check size={14} />
              </GenericButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
