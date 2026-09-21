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
        <div className="flex items-center gap-3">
          {user?.profile_pic ? (
            <img
              src={user.profile_pic}
              alt={user.name}
              className="h-12 w-12 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-base-mid/20 text-sm font-semibold text-base-mid">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h1 className="text-xl font-semibold text-base-dark dark:text-base-light">
              Ciao, {user?.name}
            </h1>
            <p className="text-sm text-base-mid">{user?.email}</p>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-8 max-w-2xl rounded-xl border border-dashed border-base-mid/40 p-8 text-center text-base-mid">
        Note in arrivo.
      </div>
    </div>
  );
}
