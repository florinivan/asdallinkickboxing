# ASD All-in Kickboxing - Sistema Gestione PDF

> 🥊 **Versione 2.0** - Single Page Application completamente lato client

Un'applicazione React moderna per la visualizzazione e compilazione di documenti PDF, completamente funzionante senza backend.

## 🚀 Caratteristiche Principali

### ✨ **Funzionalità Core**
- **📄 Visualizzazione PDF Interattiva**: Viewer con controlli zoom, navigazione pagine e responsive design
- **📝 Compilazione Moduli**: Form intelligente con validazione in tempo reale
- **⬇️ Generazione PDF Lato Client**: Creazione documenti personalizzati usando PDF-lib
- **🔄 Download Automatico**: Scaricamento immediato senza dipendenze server
- **📱 Design Responsive**: Ottimizzato per desktop, tablet e mobile
- **♿ Accessibilità Completa**: Supporto screen reader e navigazione da tastiera

### 🛠️ **Tecnologie Utilizzate**
- **React 18.2.0** - Framework frontend moderno
- **PDF-lib** - Manipolazione PDF lato client
- **React-PDF** - Visualizzazione PDF interattiva
- **CSS Grid/Flexbox** - Layout responsive moderno
- **Context API** - Gestione stato globale
- **ES2020+** - JavaScript moderno

## 📦 Installazione e Utilizzo

### Prerequisiti
- Node.js 16+ 
- npm 8+

### 🏗️ Setup Sviluppo
```bash
# Clone del repository
git clone [repository-url]
cd asdallinkickboxing

# Installazione dipendenze
npm install

# Avvio server di sviluppo
npm start
# ➜ http://localhost:3000
```

### 🚢 Build di Produzione
```bash
# Creazione build ottimizzata
npm run build

# Servire file statici localmente
npx serve -s build -l 8080
# ➜ http://localhost:8080
```

### 🌐 Deployment Statico
La cartella `build/` contiene tutti i file necessari per l'hosting statico:

```bash
build/
├── index.html                 # Pagina principale SPA
├── FKvedasipolicyprivacy...pdf # PDF template
├── static/
│   ├── css/                   # Stili ottimizzati
│   └── js/                    # JavaScript bundled
└── manifest.json              # PWA manifest
```

**Compatibile con:**
- Netlify, Vercel, GitHub Pages
- Apache, Nginx, IIS
- CDN (AWS S3 + CloudFront, etc.)
- Hosting condiviso standard

## 🎯 Funzionalità Dettagliate

### 📄 Visualizzatore PDF
- **Controlli Zoom**: Zoom in/out con incrementi del 25%
- **Navigazione**: Avanti/indietro tra pagine
- **Indicatori**: Numero pagina corrente e totale
- **Responsive**: Adattamento automatico dimensioni schermo
- **Fallback**: Link diretto per browser incompatibili

### 📝 Form di Compilazione
```javascript
// Campi supportati
{
  nome: "Nome completo",
  data_nascita: "Data nascita", 
  luogo_nascita: "Luogo nascita",
  codice_fiscale: "Codice fiscale (validato)",
  indirizzo: "Indirizzo completo",
  citta: "Città",
  cap: "Codice postale",
  telefono: "Numero telefono",
  email: "Email (validata)",
  
  // Per minorenni (auto-rilevato)
  genitore_nome: "Nome genitore/tutore",
  genitore_telefono: "Telefono genitore",
  genitore_email: "Email genitore",
  
  // Opzionali
  contatto_emergenza: "Contatto emergenza",
  telefono_emergenza: "Telefono emergenza",
  note: "Note aggiuntive"
}
```

### 🔍 Validazioni Implementate
- **Email**: Pattern RFC-compliant
- **Codice Fiscale**: Formato italiano standard
- **Età**: Auto-detection maggiorenne/minorenne
- **Campi Obbligatori**: Validazione real-time
- **Dati Genitore**: Richiesti automaticamente per minori

### 📥 Generazione PDF
```javascript
// Processo di generazione
1. Validazione dati form ✓
2. Caricamento PDF template ✓
3. Creazione pagina dati personalizzata ✓
4. Embedding fonts e formattazione ✓
5. Download automatico ✓
```

## 🎨 Architettura Applicazione

### 📁 Struttura File
```
src/
├── components/          # Componenti React
│   ├── DocumentForm.js  # Form compilazione
│   ├── PDFViewer.js     # Visualizzatore PDF
│   ├── Header.js        # Header applicazione
│   ├── Footer.js        # Footer
│   └── *.css           # Stili componenti
├── context/            
│   └── AppContext.js    # Stato globale
├── services/
│   ├── api.js          # API lato client
│   ├── pdfService.js   # Servizio PDF
│   └── validation.js   # Validazioni
├── styles/
│   ├── App.css         # Stili principali
│   └── index.css       # Stili globali
└── index.js            # Entry point
```

### 🧩 Componenti Principali

#### `AppContext`
Gestione stato centralizzata con:
- Dati PDF (URL, pagine, zoom)
- Dati form e validazione
- Stato UI (loading, messaggi, errori)

#### `PDFViewer`
- Rendering PDF con react-pdf
- Controlli navigazione e zoom
- Gestione errori e fallback

#### `DocumentForm`
- Form dinamico con validazione
- Logica maggiorenne/minorenne
- Integrazione generazione PDF

#### `PDFService`
- Manipolazione PDF con PDF-lib
- Generazione pagine personalizzate
- Gestione download file

## 🔧 Configurazione

### ⚙️ Variabili Ambiente
```bash
# .env (opzionale)
REACT_APP_VERSION=2.0.0
REACT_APP_PDF_NAME=FKvedasipolicyprivacyperidettagli_compressed_organized.pdf
```

### 📱 PWA Support
Il manifest.json supporta l'installazione come app:
```json
{
  "name": "ASD Kickboxing PDF Manager",
  "short_name": "PDF Manager",
  "theme_color": "#667eea",
  "display": "standalone"
}
```

## 🐛 Troubleshooting

### ❌ Problemi Comuni
1. **PDF non si carica**: Verificare che il file sia in `public/`
2. **Font non disponibili**: PDF-lib utilizza font standard sicuri
3. **Build failed**: Controllare versioni Node.js (>=16)
4. **Zoom non funziona**: Verificare supporto browser per CSS transforms

### 🔍 Debug
```bash
# Log dettagliati
npm start
# Console browser: verificare errori React/PDF.js

# Build con debug
npm run build -- --verbose

# Test build locale
npx serve -s build -l 3000
```

## 📈 Performance

### 📊 Metriche Build
- **Bundle JS**: ~331kb (gzipped)
- **CSS**: ~4.5kb (gzipped)
- **Total Size**: <400kb
- **Load Time**: <2s (3G)

### ⚡ Ottimizzazioni
- Code splitting automatico (React.lazy)
- Tree shaking dependencies
- CSS modules ottimizzati
- PDF worker su CDN

## 🔒 Sicurezza

### 🛡️ Misure Implementate
- **XSS Protection**: Sanitizzazione input automatica
- **CSRF**: Non applicabile (no backend)
- **Content Security Policy**: Headers configurabili
- **File Upload**: Solo lettura PDF locale
- **Data Privacy**: Elaborazione locale, no server

## 🤝 Contributi

### 📝 Development Workflow
```bash
# Feature branch
git checkout -b feature/nuova-funzionalita

# Development
npm start
# ... sviluppo ...

# Testing
npm test
npm run build

# Commit & Push
git add .
git commit -m "feat: descrizione feature"
git push origin feature/nuova-funzionalita
```

## 📄 Licenza

Progetto per ASD All-in Kickboxing - Tutti i diritti riservati.

---

**🥊 ASD All-in Kickboxing**  
*Sistema Gestione PDF v2.0 - Completamente Client-Side*

Per supporto: [contatti ASD]