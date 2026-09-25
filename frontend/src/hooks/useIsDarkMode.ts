import { useEffect, useState } from "react";

// Chart.js disegna testo/griglie su canvas, quindi non può leggere le
// varianti "dark:" di Tailwind: serve sapere a runtime se il tema attivo è
// scuro per scegliere colori leggibili, e restare sincronizzati quando
// l'utente cambia tema dalle Impostazioni.
export function useIsDarkMode(): boolean {
  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains("dark"),
  );

  useEffect(() => {
    const root = document.documentElement;
    const observer = new MutationObserver(() =>
      setIsDark(root.classList.contains("dark")),
    );
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return isDark;
}
