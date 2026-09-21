// =================================
//  IMPORTS
// =================================
import { NavLink } from "react-router-dom";
import { LayoutDashboard, NotebookPen, ChartPie, Settings } from "lucide-react";

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
export default function NavigationTabs() {
  // =================================
  //  RENDER
  // =================================
  return (
    <nav className="flex shrink-0 border-t border-base-mid/25 bg-white pb-[env(safe-area-inset-bottom)] pt-2 dark:bg-base-dark lg:hidden">
      {tabs.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          end={to === "/"}
          className={({ isActive }) =>
            `flex flex-1 flex-col items-center gap-0.5 px-3 py-1 text-[11px] transition-colors ${
              isActive ? "text-accent" : "text-base-mid"
            }`
          }
        >
          {({ isActive }) => (
            <>
              <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              <span>{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
