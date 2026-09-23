// =================================
//  IMPORTS
// =================================
import { GenericHeader } from "../ui/GenericHeader";

// =================================
//  COMPONENT
// =================================
export function ChartsPage() {
  // =================================
  //  CONSTS
  // =================================

  // =================================
  //  RENDER
  // =================================
  return (
    <>
      <GenericHeader headerTitle="Grafici" />
      <main className="mx-auto max-w-lg px-4 py-4">
        <div className="min-h-full bg-base-light px-4 py-8 dark:bg-base-dark">
          <div className="mx-auto flex max-w-2xl items-center justify-between"></div>
          <div className="mx-auto mt-8 max-w-2xl rounded-xl border border-dashed border-base-mid/40 p-8 text-center text-base-mid">
            PAGINA GRAFICI
          </div>
        </div>
      </main>
    </>
  );
}
