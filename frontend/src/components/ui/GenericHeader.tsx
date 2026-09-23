// =================================
//  IMPORTS
// =================================
import type { ReactNode } from "react";
import Logo from "../images/Logo.png";

// =================================
//  COMPONENT
// =================================
export function GenericHeader({
  headerTitle,
  actions,
}: {
  headerTitle: string;
  actions?: ReactNode;
}) {
  // =================================
  //  RENDER
  // =================================
  return (
    <>
      <header className="sticky top-0 z-40 border-b border-base-mid/25 bg-white px-4 pt-6 pb-4 dark:bg-base-dark lg:hidden">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <img src={Logo} alt="Astra" className="h-8 w-8" />
            <h1 className="font-headline text-xl font-bold tracking-tight">
              {headerTitle}
            </h1>
          </div>
          {actions && <div className="flex items-center gap-1.5">{actions}</div>}
        </div>
      </header>
    </>
  );
}
