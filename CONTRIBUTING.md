# Contribuire alla Bottega

Per un errore nella guida, un numero mancante o una ricetta cambiata, apri una issue indicando pagina, comportamento osservato, versione del gioco e fonte. Screenshot o registrazioni del gioco sono utili; rimuovi dati personali prima di allegarli.

Per proporre una modifica:

1. Crea un fork e un branch dedicato.
2. Avvia il sito con `python -m http.server 8000 --bind 127.0.0.1`.
3. Modifica soltanto i file necessari e aggiorna il changelog nel sito se cambia il comportamento o il catalogo.
4. Esegui `python scripts/check_site.py`; prova le pagine modificate su desktop e telefono, anche con la tastiera.
5. Apri una pull request con problema, soluzione, fonti e verifiche effettuate.

## Dati del gioco

Mantieni identificativi, versione del client e provenienza. Per le correzioni registra la fonte e aggiorna `simulatore/data-audit.json` e i problemi conosciuti. Distingui datamine, patch note ufficiali, osservazioni dirette e ricostruzioni della community. Non sostituire un valore sconosciuto con zero e non presentare stime RNG come probabilità ufficiali.

## Interfaccia

Consulta `.interface-design/system.md`. Mantieni il tema bottega/grimorio, i font locali, contrasto e leggibilità, la navigazione da tastiera e il supporto a `prefers-reduced-motion`. Non introdurre tracker o servizi esterni senza aggiornare le informazioni privacy.

## Diritti

Proponi solo codice e materiali che puoi condividere. I contributi al codice e alla documentazione tecnica vengono forniti con la licenza MIT del progetto; gli altri materiali seguono il perimetro descritto in `THIRD_PARTY_NOTICES.md`.
