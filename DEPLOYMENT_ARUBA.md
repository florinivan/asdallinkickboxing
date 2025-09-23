# Guida Deployment su Aruba Hosting

## Problema risolto
L'applicazione React con React Router non funzionava correttamente su Aruba a causa del routing lato client.

## Soluzioni implementate

### 1. HashRouter (SOLUZIONE ATTIVA)
✅ **Cambiato da BrowserRouter a HashRouter**
- File: `src/App.js`
- Modifica: `import { HashRouter as Router }`
- **Vantaggi:** Funziona su qualsiasi server senza configurazione
- **URLs:** `#/` per homepage, `#/moduli` per i moduli

### 2. File .htaccess (BACKUP per BrowserRouter)
✅ **Creato file .htaccess**
- File: `public/.htaccess`
- Reindirizza tutte le richieste a `index.html`
- **Solo se il server supporta .htaccess (Apache)**

### 3. Homepage configurata
✅ **Aggiunto "homepage": "." in package.json**
- Supporta deployment in sottocartelle
- Build ottimizzato per hosting condiviso

## Come deployare su Aruba

### Passo 1: Genera il build
```bash
npm run build
```

### Passo 2: Upload su Aruba
1. Accedi al pannello di controllo Aruba
2. Vai su "Gestione File" o usa FTP
3. **Carica tutto il contenuto della cartella `build/`** nella root del dominio
4. **Non caricare la cartella build stessa, ma il suo contenuto**

### Struttura finale su Aruba:
```
public_html/
├── index.html          (dall'interno di build/)
├── manifest.json       (dall'interno di build/)
├── .htaccess          (dall'interno di build/)
├── static/            (dall'interno di build/)
├── images/            (dall'interno di build/)
├── logo.png           (dall'interno di build/)
└── favicon.ico        (dall'interno di build/)
```

### Passo 3: Test
- Homepage: `https://tuodominio.it/` ✅
- Moduli: `https://tuodominio.it/#/moduli` ✅
- Refresh: Funziona su qualsiasi pagina ✅

## URLs con HashRouter
- **Homepage:** `https://tuodominio.it/`
- **Moduli:** `https://tuodominio.it/#/moduli`
- **Collegamenti interni:** Tutti funzionano correttamente

## Backup BrowserRouter
Se in futuro vuoi usare BrowserRouter (URLs senza #):
1. Copia il contenuto da `src/App.browserrouter.js.backup`
2. Sostituisci in `src/App.js`
3. Richiede supporto server per .htaccess o configurazione Nginx

## Problemi comuni risolti
✅ **Refresh della pagina:** Funziona con HashRouter
✅ **Link diretto a /moduli:** Funziona con HashRouter
✅ **Navigazione interna:** Tutti i Link React Router funzionano
✅ **Build deployment:** Ottimizzato per hosting condiviso
✅ **Compatibilità Aruba:** Testato e funzionante

## Note tecniche
- **HashRouter** usa l'hash (#) nell'URL per gestire il routing
- Non richiede configurazione server
- Supportato da tutti i browser moderni
- SEO: leggermente meno ottimale rispetto a BrowserRouter (ma funziona)