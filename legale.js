"use strict";
document.getElementById("delete-local-plan").addEventListener("click", () => {
  if (!window.confirm("Vuoi cancellare il piano salvato su questo browser? I file scaricati resteranno sul dispositivo.")) return;
  const status = document.getElementById("delete-status");
  try {
    localStorage.removeItem("forgia-piano-v2");
    status.textContent = "Il salvataggio locale è stato rimosso. Se il pianificatore era aperto in un’altra scheda, chiudilo prima di proseguire.";
  } catch {
    status.textContent = "Il browser non consente l’accesso alla memoria locale. Puoi cancellare i dati del sito dalle sue impostazioni.";
  }
});
