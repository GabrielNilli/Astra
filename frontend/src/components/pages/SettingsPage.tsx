// =================================
//  IMPORTS
// =================================
import { useAuth } from "../../context/AuthContext";

// =================================
//  COMPONENT
// =================================
export function SettingsPage() {
  // =================================
  //  CONSTS
  // =================================
  const { user, logout } = useAuth();

  // =================================
  //  RENDER
  // =================================
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto flex max-w-2xl items-center justify-between">
        <button
          type="button"
          onClick={() => void logout()}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
        >
          Esci
        </button>
      </div>
    </div>
  );
}
