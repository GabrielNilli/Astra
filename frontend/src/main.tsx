// =================================
//  IMPORTS
// =================================
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.tsx";
import { AuthProvider } from "./context/AuthContext";
import "./index.css";

// =================================
//  COMPONENT
// =================================
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);

// Registrato sempre, non solo quando si apre Impostazioni: un service worker
// attivo è tra i requisiti che Chrome/Android controllano per considerare il
// sito installabile come PWA, indipendentemente dalle notifiche push.
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/service-worker.js").catch(() => {
    // L'installabilità PWA è un bonus, non un requisito: se fallisce non blocchiamo l'app.
  });
}
