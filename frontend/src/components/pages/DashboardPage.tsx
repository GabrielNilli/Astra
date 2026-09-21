// =================================
//  IMPORTS
// =================================
import { useAuth } from "../../context/AuthContext";

// =================================
//  COMPONENT
// =================================
export function DashboardPage() {
  // =================================
  //  CONSTS
  // =================================
  const { user } = useAuth();

  // =================================
  //  RENDER
  // =================================
  return (
    <div className="min-h-full bg-base-light px-4 py-8 dark:bg-base-dark">
      <div className="mx-auto flex max-w-2xl items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-base-dark dark:text-base-light">
            Ciao, {user?.name}
          </h1>
          <p className="text-sm text-base-mid">{user?.email}</p>
        </div>
      </div>

      <div className="mx-auto mt-8 max-w-2xl rounded-xl border border-dashed border-base-mid/40 p-8 text-center text-base-mid">
        Note in arrivo.
      </div>
    </div>
  );
}
