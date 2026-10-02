# Licenze, provenienza e materiali di terzi

## Perimetro della licenza MIT

La licenza `LICENSE` si applica al codice originale HTML/CSS/JavaScript/Python, alle configurazioni e alla documentazione tecnica del repository. Non comprende i testi editoriali della guida incorporati negli HTML, le immagini in `assets/`, i font, i dati estratti dal gioco e i materiali di terzi. Le correzioni locali non trasferiscono diritti sul materiale di origine.

## Diablo IV e catalogo

Diablo, Diablo IV, Griswold, i nomi e gli elementi dell'universo di gioco e i relativi marchi appartengono a Blizzard Entertainment e ai rispettivi titolari. Il progetto non è affiliato, sponsorizzato o approvato da Blizzard.

`simulatore/catalogo.json` contiene dati normalizzati a partire dal datamine pubblico **DiabloTools/d4data**, fork di **blizzhackers/d4data**:

- Fonte: https://github.com/DiabloTools/d4data
- Snapshot: `33e0bfbb5f717d3e560d14a7fb27d5a7f17fd2c0`, client `3.2.1.73552`.
- Il codice del progetto upstream è MIT, copyright (c) 2023 blizzhackers; la relativa licenza è conservata in `licenses/d4data-MIT.txt`.
- Il [README upstream](https://github.com/DiabloTools/d4data/tree/33e0bfbb5f717d3e560d14a7fb27d5a7f17fd2c0) distingue il codice di parsing dagli asset del gioco, che restano di Blizzard. La licenza MIT upstream non viene presentata come una licenza generale sui dati e materiali del gioco.
- Aggiustamenti locali, fonti e incertezze: `meta.localCorrections`, `simulatore/data-audit.json`, `sources.json`, `fonti.html` e `aggiornamenti.html`.

## Font

Font distribuiti localmente, con **SIL Open Font License 1.1**:

| Famiglia | Attribuzione | Licenza inclusa |
| --- | --- | --- |
| Alegreya | Copyright 2011 The Alegreya Project Authors | `assets/fonts/alegreya-OFL.txt` |
| Cinzel | Copyright 2020 The Cinzel Project Authors | `assets/fonts/cinzel-OFL.txt` |
| Source Sans 3 | Copyright 2010–2020 Adobe; Reserved Font Name “Source” | `assets/fonts/sourcesans3-OFL.txt` |

Provenienza: repository ufficiale [google/fonts](https://github.com/google/fonts), cartelle `ofl/alegreya`, `ofl/cinzel` e `ofl/sourcesans3`. Conservare le licenze complete nella redistribuzione dei font.

## Logo, illustrazioni e testi della guida

- `assets/griswold-logo.png`: logo fornito dal gestore per il sito, derivato dal file `G_Hammered.png` e conservato senza modifiche.
- `assets/forge-workshop.png` e `assets/grimoire-paper-seamless.png`: illustrazioni create per il progetto con assistenza di generazione di immagini.
- Testi editoriali della guida: contenuti originali del progetto, salvo citazioni, nomi e dati attribuiti alle fonti.

Questi materiali sono esclusi dalla licenza MIT del codice. Il repository non concede una licenza aggiuntiva di riutilizzo; per autorizzazioni contattare **ashnar.2602@gmail.com**. Restano salvi gli usi consentiti dalla legge e i diritti dei rispettivi titolari.
