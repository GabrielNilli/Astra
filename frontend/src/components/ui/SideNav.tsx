// =================================
//  IMPORTS
// =================================
import { NavLink } from "react-router-dom";
import { LayoutDashboard, NotebookPen, ChartPie, Settings } from "lucide-react";

import Logo from "./../images/Logo.png";

// =================================
//  CONSTS
// =================================
const tabs = [
  { to: "/", icon: LayoutDashboard, label: "Home" },
  { to: "/notes", icon: NotebookPen, label: "Note" },
  { to: "/charts", icon: ChartPie, label: "Grafici" },
  { to: "/settings", icon: Settings, label: "Impostazioni" },
];

// =================================
//  COMPONENT
// =================================
export default function SideNav() {
  // =================================
  //  RENDER
  // =================================
  return (
    <nav className="hidden w-56 shrink-0 overflow-y-auto border-r border-base-mid/25 bg-white px-3 py-6 dark:bg-base-dark lg:flex lg:flex-col">
      <div className="mb-8 flex items-center gap-2 px-2 text-base-dark dark:text-base-light">
        <img src={Logo} alt="Astra" className="w-24" />
        <span className="font-headline text-lg font-bold tracking-tight">
          Astra
        </span>
      </div>
      <div className="flex flex-col gap-1">
        {tabs.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-accent/10 text-accent"
                  : "text-base-mid hover:bg-base-mid/10"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={19} strokeWidth={isActive ? 2.5 : 2} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
