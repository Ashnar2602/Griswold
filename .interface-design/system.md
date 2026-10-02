# La Bottega di Griswold — sistema visivo

Direzione approvata il 2 ottobre 2026: bottega di Tristram per la struttura, grimorio horadrico per le ricette. Riferimenti: concept home e ricette approvati nella chat. Implementazione statica in bottega.css, caricata dopo gli stili esistenti.

Palette: fuliggine #15120f, ferro #29231d, rame #a87743, osso #e9ddc4, brace #e9954c, inchiostro #302315, carta #d9c8a6. Il rame delimita e seleziona; la brace indica azioni e focus. Font locali con OFL: Cinzel per il marchio, Alegreya per titoli/guide/ricette, Source Sans 3 per controlli del pianificatore. Dimensioni e gerarchia in bottega.css; numeri dei costi tabulari.

La home ha una sola scena illustrata, logo originale sovrapposto, azioni dirette e directory aperta a due colonne. Nessuna card ripetuta per gli argomenti. Menu desktop: rail 220 px, 200 px fino a 1200; menu a scomparsa sotto 900. Mobile: logo e titolo compatti, azioni sopra illustrazione, directory a una colonna. Ricette: pagina continua di carta, colonne operazione/descrizione e ingredienti; ingredienti sotto la descrizione su mobile. Texture carta non deformata; cornice CSS separata.

Icone SVG monocromatiche, 24 px menu, 30 px directory; varianti plus/minus/reroll per le ricette. Focus visibile, link e pulsanti HTML nativi, riduzione delle animazioni tramite prefers-reduced-motion. Feedback 120 ms, menu 200 ms, nessuna animazione continua.

Conservare contenuti e fonti integrali, separazione in pagine, dati locali e limiti dichiarati. Non introdurre font remoti, analytics o terzi attraverso il design. Gli asset generati sono inclusi in assets; il logo dell’utente è conservato senza modifiche.
