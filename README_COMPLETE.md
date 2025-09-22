# 🥊 ASD Allin Kickboxing - Sistema Gestione PDF

Sistema web completo per la gestione e compilazione di documenti PDF, sviluppato specificamente per ASD Allin Kickboxing.

## ✨ Funzionalità Principali

- **📤 Upload PDF**: Caricamento sicuro di file PDF
- **👁️ Anteprima**: Visualizzazione del PDF nel browser
- **📝 Form Interattivo**: Compilazione guidata con validazione
- **📄 Generazione Documento**: Creazione automatica di documenti compilati
- **📱 Responsive**: Interfaccia ottimizzata per tutti i dispositivi
- **🔒 Sicurezza**: Validazione input e pulizia automatica file

## 🏗️ Struttura del Progetto

```
asdallinkickboxing/
├── index.php              # Pagina principale
├── config.php            # Configurazioni sistema
├── fill_pdf_simple.php   # Generazione documenti HTML
├── fill_pdf.php          # Versione avanzata con TCPDF
├── .htaccess             # Configurazioni Apache
├── css/
│   └── style.css         # Stili dell'interfaccia
├── js/
│   └── script.js         # Logica JavaScript
├── uploads/              # File PDF caricati
├── filled/               # Documenti generati
├── GUIDA.md             # Guida utente
└── README.md            # Documentazione
```

## 🚀 Installazione

1. **Clone del repository**
   ```bash
   git clone [repository-url]
   cd asdallinkickboxing
   ```

2. **Configurazione server web**
   - Assicurarsi che PHP sia abilitato
   - Verificare che le cartelle uploads/ e filled/ siano scrivibili
   - Caricare i file sul server

3. **Accesso**
   - Aprire il browser e navigare verso il dominio
   - Il sistema è pronto all'uso

## 💡 Come Utilizzare

### 1. Caricamento PDF
- Cliccare su "Scegli file PDF"
- Selezionare un documento PDF (max 10MB)
- Cliccare "Carica PDF"

### 2. Compilazione Form
Compilare i campi richiesti:
- **Nome completo** (obbligatorio)
- **Data di nascita** (obbligatorio)
- **Luogo di nascita** (obbligatorio)
- **Codice Fiscale** (obbligatorio, formato italiano)
- **Indirizzo** (obbligatorio)
- **Telefono** (obbligatorio)
- **Email** (obbligatorio)
- **Genitore/Tutore** (obbligatorio se minorenne)
- **Contatto di emergenza** (opzionale)
- **Note** (opzionale)

### 3. Generazione Documento
- Cliccare "Compila e Scarica PDF"
- Il sistema genererà un documento HTML
- Stampare o salvare come PDF dal browser

## 🔧 Configurazioni

### File config.php
```php
define('MAX_FILE_SIZE', 10 * 1024 * 1024); // 10MB
define('UPLOAD_DIR', 'uploads/');
define('FILLED_DIR', 'filled/');
define('SESSION_TIMEOUT', 3600); // 1 ora
```

### Sicurezza
- Upload limitato a file PDF
- Validazione codice fiscale italiano
- Pulizia automatica file obsoleti
- Protezione accesso file sensibili

## 🌟 Caratteristiche Tecniche

### Frontend
- **HTML5 Semantico**: Struttura accessibile
- **CSS3 Moderno**: Animazioni e layout responsive
- **JavaScript ES6**: Validazione lato client e UX
- **Font Awesome**: Icone professionali
- **Google Fonts**: Tipografia Lato

### Backend
- **PHP 7.4+**: Elaborazione lato server
- **Gestione Sessioni**: Stato utente persistente
- **Validazione Input**: Controlli di sicurezza
- **File Management**: Gestione automatica file

### Sicurezza
- **Input Sanitization**: Prevenzione XSS
- **File Validation**: Controllo tipi file
- **Session Management**: Gestione sicura sessioni
- **Auto Cleanup**: Rimozione file automatica

## 📱 Responsive Design

Il sistema è ottimizzato per:
- **Desktop**: Layout a due colonne con anteprima PDF
- **Tablet**: Layout adattivo con elementi ridimensionati
- **Mobile**: Layout a colonna singola con navigazione touch

## 🔄 Workflow Completo

1. **Upload** → L'utente carica un PDF
2. **Preview** → Il sistema mostra l'anteprima
3. **Form** → L'utente compila i dati personali
4. **Validation** → Controllo automatico dei dati
5. **Generation** → Creazione documento compilato
6. **Download** → L'utente scarica/stampa il risultato
7. **Cleanup** → Pulizia automatica file temporanei

## 🛠️ Estensioni Future

- **Integrazione TCPDF**: Generazione PDF nativa
- **Database Storage**: Salvataggio dati utenti
- **Email Automation**: Invio automatico documenti
- **Multi-language**: Supporto più lingue
- **API REST**: Integrazione con altri sistemi

## 📞 Supporto

Per assistenza tecnica o segnalazione bug, contattare l'amministratore del sistema.

## 📄 Licenza

Sviluppato per ASD Allin Kickboxing - Tutti i diritti riservati.

---

*Sistema sviluppato con ❤️ per la gestione efficiente dei documenti dell'associazione sportiva.*