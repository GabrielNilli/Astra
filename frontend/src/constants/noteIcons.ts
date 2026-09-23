import * as LucideIcons from "lucide-react";
import {
  Star,
  Heart,
  Lightbulb,
  Briefcase,
  BookOpen,
  ShoppingCart,
  Home,
  Plane,
  Music,
  Code,
  Dumbbell,
  Utensils,
  type LucideIcon,
} from "lucide-react";

// =================================
//  CONSTS
// =================================
// Icone rapide mostrate sempre nel form. Nomi in kebab-case: NoteCard li risolve
// in componenti lucide con lo stesso nome.
export const NOTE_ICONS: { name: string; Icon: LucideIcon }[] = [
  { name: "star", Icon: Star },
  { name: "heart", Icon: Heart },
  { name: "lightbulb", Icon: Lightbulb },
  { name: "briefcase", Icon: Briefcase },
  { name: "book-open", Icon: BookOpen },
  { name: "shopping-cart", Icon: ShoppingCart },
  { name: "home", Icon: Home },
  { name: "plane", Icon: Plane },
  { name: "music", Icon: Music },
  { name: "code", Icon: Code },
  { name: "dumbbell", Icon: Dumbbell },
  { name: "utensils", Icon: Utensils },
];

// Icone proposte nel pannello "+" quando non si sta cercando nulla
export const EXTRA_NOTE_ICONS = [
  "Bookmark", "Calendar", "Camera", "Car", "Check", "CircleCheck", "Clock",
  "Cloud", "Coffee", "Cookie", "CreditCard", "Crown", "Flame", "Flag",
  "Folder", "Gamepad2", "Gift", "GraduationCap", "Globe", "Key", "Laptop",
  "Leaf", "Lock", "Mail", "MapPin", "Moon", "Palette", "PawPrint", "Phone",
  "Pill", "Pizza", "Rocket", "Sun", "Target", "Trophy", "Umbrella", "Wallet",
  "Wrench", "Zap", "PiggyBank",
];

const ICON_LIBRARY = LucideIcons as unknown as Record<string, LucideIcon>;

// Tutti i componenti icona di lucide (esclusi alias "...Icon" e "Lucide...")
export const ALL_ICON_NAMES = Object.keys(ICON_LIBRARY).filter(
  (key) =>
    /^[A-Z]/.test(key) &&
    !key.endsWith("Icon") &&
    !key.startsWith("Lucide") &&
    ICON_LIBRARY[key] != null,
);

// =================================
//  FUNCTIONS
// =================================
function iconNameToComponentName(value: string): string {
  return value
    .trim()
    .replace(/[-_\s]+(.)?/g, (_, char: string | undefined) =>
      char ? char.toUpperCase() : "",
    )
    .replace(/^./, (char) => char.toUpperCase());
}

// Accetta sia kebab-case ("book-open") sia PascalCase ("BookOpen")
export function resolveNoteIcon(name: string | null): LucideIcon | null {
  if (!name) return null;
  return ICON_LIBRARY[iconNameToComponentName(name)] ?? null;
}
