// =================================
//  IMPORTS
// =================================
import type { ButtonHTMLAttributes, ReactNode } from "react";

// =================================
//  TYPE
// =================================
type GenericButtonVariant = "primary" | "secondary" | "destructive" | "transparent";

// =================================
//  INTERFACE
// =================================
interface GenericButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: GenericButtonVariant;
}

// =================================
//  VARIANTS
// =================================
const variantClasses: Record<GenericButtonVariant, string> = {
  primary: "bg-accent text-white hover:brightness-90",
  secondary: "border border-base-mid/40 text-base-mid hover:bg-base-mid/10",
  destructive: "bg-red-600 text-white hover:bg-red-700",
  transparent: "text-base-mid hover:bg-base-mid/10",
};

// =================================
//  COMPONENT
// =================================
export default function GenericButton({
  children,
  variant = "primary",
  className = "",
  type = "button",
  ...props
}: GenericButtonProps) {
  // =================================
  //  RENDER
  // =================================
  return (
    <button
      type={type}
      className={`inline-flex cursor-pointer items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition select-none disabled:cursor-not-allowed disabled:opacity-60 ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
