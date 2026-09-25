import { useEffect, useState } from "react";
import { listCharts, type Chart } from "../api/charts";

// Carica la lista dei grafici dell'utente (propri + condivisi) e la tiene
// pronta per essere ricaricata dopo ogni mutazione.
export function useChartsData(token: string | null) {
  const [chartsList, setChartsList] = useState<Chart[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  function handleChartsRefresh() {
    if (!token) return;
    setIsLoading(true);
    listCharts(token)
      .then(setChartsList)
      .finally(() => setIsLoading(false));
  }

  useEffect(() => {
    handleChartsRefresh();
  }, [token]);

  return { chartsList, setChartsList, isLoading, handleChartsRefresh };
}
