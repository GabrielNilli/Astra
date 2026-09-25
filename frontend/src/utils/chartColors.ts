// Rampa sequenziale (magnitudine, non identità) derivata dall'accent color
// dell'utente: una sola tinta, luminosità monotona chiaro -> scuro. Usata per
// le fette di grafici a torta/anello/polare, dove ogni "slot" è solo una data
// e non una categoria stabile da distinguere per identità.

function hexToHsl(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  if (max === min) return [0, 0, l];

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h: number;
  switch (max) {
    case r:
      h = (g - b) / d + (g < b ? 6 : 0);
      break;
    case g:
      h = (b - r) / d + 2;
      break;
    default:
      h = (r - g) / d + 4;
  }
  return [h * 60, s, l];
}

function hslToHex(h: number, s: number, l: number): string {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  const [r0, g0, b0] =
    h < 60
      ? [c, x, 0]
      : h < 120
        ? [x, c, 0]
        : h < 180
          ? [0, c, x]
          : h < 240
            ? [0, x, c]
            : h < 300
              ? [x, 0, c]
              : [c, 0, x];

  const toHex = (v: number) =>
    Math.round((v + m) * 255)
      .toString(16)
      .padStart(2, "0");

  return `#${toHex(r0)}${toHex(g0)}${toHex(b0)}`;
}

export function resolveAccentColor(): string {
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue("--color-accent")
    .trim();
  return value || "#9333ea";
}

const RAMP_MIN_LIGHTNESS = 0.32;
const RAMP_MAX_LIGHTNESS = 0.74;

export function sequentialRamp(baseColor: string, count: number): string[] {
  const [h, s] = hexToHsl(baseColor);
  if (count <= 1) return [baseColor];

  return Array.from({ length: count }, (_, index) => {
    const t = index / (count - 1);
    const lightness =
      RAMP_MAX_LIGHTNESS - t * (RAMP_MAX_LIGHTNESS - RAMP_MIN_LIGHTNESS);
    return hslToHex(h, Math.max(s, 0.35), lightness);
  });
}
