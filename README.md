# La Bottega di Griswold

<p align="center"><img src="assets/griswold-logo.png" width="180" alt="Il martello e l'incudine della Bottega di Griswold"></p>

**Ricette, affissi e piani di crafting per Diablo IV.**

Guida italiana della community e pianificatore interattivo: una bottega di Tristram per orientarsi, un grimorio per consultare le ricette. Creato da **Ashnar2602**.

[Visita la Bottega](https://ashnar2602.github.io/Griswold/) · [Contribuire](CONTRIBUTING.md) · [Licenze e attribuzioni](THIRD_PARTY_NOTICES.md)

## Cosa trovi

- Guida divisa in dieci pagine tematiche, con menu utilizzabile anche su telefono.
- Ricette, affissi, Unici, finiture, talismani, farming e checklist.
- Pianificatore con calcoli nel browser, percorsi statistici e registrazione dei progressi.
- Esportazione e importazione degli oggetti in JSON.
- Changelog, problemi conosciuti e fonti consultabili direttamente nel sito.
- Immagini e font locali: nessuna dipendenza da CDN, servizio AI o API esterna.

Il progetto è un sito statico in HTML, CSS e JavaScript, senza framework, compilazione o server applicativo. Serve un normale hosting HTTP/HTTPS.

## Avvio locale

```sh
git clone https://github.com/Ashnar2602/Griswold.git
cd Griswold
python -m http.server 8000 --bind 127.0.0.1
```

Apri [http://127.0.0.1:8000/](http://127.0.0.1:8000/). Se il tuo sistema usa il comando `python3`, sostituiscilo a `python`. Il doppio clic su un HTML non basta: catalogo JSON e moduli JavaScript richiedono HTTP.

Per controllare JSON, risorse e collegamenti locali:

```sh
python scripts/check_site.py
```

Lo stesso controllo viene eseguito da GitHub Actions sui push e sulle pull request. La verifica visiva e dei calcoli richiede anche una prova nel browser.

## GitHub Pages

GitHub Pages è configurato per pubblicare dalla radice del branch `main`, senza compilazione del progetto. Ogni push su `main` avvia la pubblicazione. Il file `.nojekyll` evita l'elaborazione Jekyll.

Il sito è disponibile su **https://ashnar2602.github.io/Griswold/**; il [pianificatore](https://ashnar2602.github.io/Griswold/simulatore/) si trova in `simulatore/`. I collegamenti relativi supportano il percorso del repository. Lo stato della pubblicazione è consultabile in **Settings → Pages** e **Actions**.

[Documentazione GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site).

## Dati, patch e probabilità

Il catalogo nasce dal datamine pubblico [DiabloTools/d4data](https://github.com/DiabloTools/d4data/tree/33e0bfbb5f717d3e560d14a7fb27d5a7f17fd2c0), build **3.2.1.73552**, commit `33e0bfbb5f717d3e560d14a7fb27d5a7f17fd2c0`. Abbiamo applicato aggiustamenti documentati rispetto alle regole della **3.2.2**, consultando note ufficiali e fonti della community. Il catalogo resta uno snapshot e non si aggiorna automaticamente.

- Recuperati 701 intervalli mancanti in 454 record e i valori statici di 331 poteri.
- Corretta la ricetta di **Henri’s Perquisition**, con l'oggetto giusto e gli ingredienti della conversione in charm. È una ricostruzione da fonti della community: manca una verifica diretta post-patch dei selettori delle due varianti storiche.
- Restano 364 intervalli irrisolti e cinque affissi candidati senza numeri completi; i dettagli sono nel registro di audit.
- Le probabilità del pianificatore sono **stime basate su ipotesi**, non pesi RNG certificati da Blizzard. Questa distinzione compare anche nell'interfaccia.

I valori base non comprendono automaticamente bonus GA, tipo di oggetto o rifinitura. Le formule non risolte e i costi sconosciuti non devono essere letti come valori pari a zero.

Consulta [changelog e problemi conosciuti](aggiornamenti.html), [fonti](fonti.html), [catalogo](simulatore/catalogo.json) e [audit delle correzioni](simulatore/data-audit.json). Ogni modifica ai dati deve preservarne la provenienza.

## Salvataggi e privacy

I calcoli avvengono sul dispositivo. Il sito non include analytics, tracker o cookie applicativi. Il pianificatore salva lo stato nel `localStorage` del browser, nella chiave `forgia-piano-v2`; i file importati non vengono caricati su un server.

I salvataggi dipendono dal browser e dall'indirizzo: prima di cambiare dispositivo o passare dalla versione locale a quella pubblica, usa **Salva oggetto** e poi **Carica oggetto** sul nuovo sito.

L'hosting GitHub Pages può trattare dati tecnici, come gli indirizzi IP, secondo la propria informativa. Le informazioni complete e il comando per cancellare il salvataggio locale sono in [Privacy, Termini e Copyright](legale.html). L'informativa non costituisce una certificazione di conformità legale.

## Struttura

| Percorso | Contenuto |
| --- | --- |
| `index.html` | Ingresso della Bottega e scelta degli argomenti |
| `fondamenti.html`, `ricette.html`, `strategie.html`, `unici.html` | Fondamenti e lavorazioni |
| `finitura.html`, `talismani.html`, `farming.html`, `checklist.html` | Approfondimenti e checklist |
| `aggiornamenti.html`, `fonti.html`, `sources.json` | Changelog, limiti e fonti |
| `simulatore/` | Pianificatore, motore di calcolo, catalogo e audit |
| `styles.css`, `bottega.css`, `script.js` | Stili condivisi e navigazione |
| `assets/` | Logo, illustrazioni, font e licenze dei font |
| `legale.html`, `legale.js` | Informazioni legali e cancellazione dei dati locali |
| `.interface-design/system.md` | Direzione visiva e convenzioni del design |

## Licenza e crediti

Il **codice originale e la documentazione tecnica del repository** sono distribuiti con [licenza MIT](LICENSE), © 2026 Ashnar2602. I testi editoriali della guida, il logo e le illustrazioni non sono inclusi in questa concessione; per altri riutilizzi contatta l'autore. I font hanno licenza SIL OFL 1.1, inclusa con ogni famiglia.

La licenza del codice non concede diritti su dati, nomi, marchi o altri materiali di Diablo. Le attribuzioni e il perimetro delle licenze sono descritti in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

Progetto indipendente della community, non affiliato, sponsorizzato o approvato da Blizzard Entertainment. Diablo IV e i relativi marchi appartengono ai rispettivi titolari.

Segnalazioni: [GitHub Issues](https://github.com/Ashnar2602/Griswold/issues). Contatto del gestore: **ashnar.2602@gmail.com**.
