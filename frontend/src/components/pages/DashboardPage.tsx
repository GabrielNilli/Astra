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

  const profileInfo = (
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
        <h1 className="font-headline text-xl font-bold tracking-tight text-base-dark dark:text-base-light">
          Ciao, {user?.name}
        </h1>
        <p className="text-sm text-base-mid">{user?.email}</p>
      </div>
    </div>
  );

  // =================================
  //  RENDER
  // =================================
  return (
    <>
      <header className="sticky top-0 z-40 border-b border-base-mid/25 bg-white px-4 pt-6 pb-4 dark:bg-base-dark lg:hidden">
        {profileInfo}
      </header>
      <main className="mx-auto max-w-lg px-4 py-4 lg:max-w-2xl lg:py-8">
        <div className="hidden lg:block">{profileInfo}</div>

        <div className="mt-8 rounded-xl border border-dashed border-base-mid/40 p-8 text-center text-base-mid">
          Note in arrivo.
        </div>
      </main>
    </>
  );
}
