// =================================
//  IMPORTS
// =================================
import { useAuth } from "../context/AuthContext";

// =================================
//  COMPONENT
// =================================
export function DashboardPage() {
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
        <div>
          <h1 className="text-xl font-semibold text-slate-900">
            Ciao, {user?.name}
          </h1>
          <p className="text-sm text-slate-500">{user?.email}</p>
        </div>
        <button
          type="button"
          onClick={() => void logout()}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
        >
          Esci
        </button>
      </div>

      <div className="mx-auto mt-8 max-w-2xl rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
        Note in arrivo.
      </div>
    </div>
  );
}
