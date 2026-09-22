// =================================
//  IMPORTS
// =================================
import Logo from "../images/Logo.png";

// =================================
//  COMPONENT
// =================================
export function NotesPage() {
  // =================================
  //  CONSTS
  // =================================

  // =================================
  //  RENDER
  // =================================
  return (
    <>
      <header className="sticky top-0 z-40 border-b border-base-mid/25 bg-white px-4 pt-6 pb-4 dark:bg-base-dark lg:hidden">
        <div className="flex items-center gap-2">
          <img src={Logo} alt="Astra" className="h-8 w-8" />
          <h1 className="font-headline text-xl font-bold tracking-tight">
            Note
          </h1>
        </div>
      </header>
      <main className="mx-auto max-w-lg px-4 py-4">
        <div className="min-h-full bg-base-light px-4 py-8 dark:bg-base-dark">
          <div className="mx-auto flex max-w-2xl items-center justify-between"></div>
          <div className="mx-auto mt-8 max-w-2xl rounded-xl border border-dashed border-base-mid/40 p-8 text-center text-base-mid">
            PAGINA NOTE
          </div>
        </div>
      </main>
    </>
  );
}
