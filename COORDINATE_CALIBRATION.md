# 🎯 Calibrazione Coordinate PDF

## 📏 Sistema di Coordinate PDF

Le pagine PDF usano un sistema di coordinate dove:
- **Origine (0,0)**: Angolo in basso a sinistra
- **Asse X**: Da sinistra a destra (larghezza)
- **Asse Y**: Dal basso verso l'alto (altezza)
- **Pagina A4**: 595.28 x 841.89 punti

## 🔧 Coordinate Ottimizzate (Post-Test)

### **Dimensioni PDF Reali**
- **Trovate**: 594.96 x 842.04 punti
- **Quasi Standard A4**: 595.28 x 841.89 punti
- **Differenza**: Minima (~0.32 x 0.15 punti)

### **Pagina 4 - Autorizzazione Immagine** ✅ OTTIMIZZATA
```javascript
// Riga 1: "Io sottoscritto (Cognome)_______(Nome)_______"
cognome: { x: 220, y: height - 260 }    // Dopo "(Cognome)" - aggiustato
nome: { x: 400, y: height - 260 }       // Dopo "(Nome)" - più a destra

// Riga 2: "nato a _______ il_______, residente in _______, telefono_______"
luogo_nascita: { x: 120, y: height - 295 }  // Dopo "nato a "
data_nascita: { x: 210, y: height - 295 }   // Dopo "il" - più a destra
citta: { x: 340, y: height - 295 }          // Dopo "residente in " - aggiustato
telefono: { x: 480, y: height - 295 }       // Dopo "telefono" - più a destra
```

### **Pagina 5 - Consenso Marketing** ✅ OTTIMIZZATA
```javascript
// Nome completo
cognome_nome: { x: 280, y: height - 440 }  // Più centrato

// Dati nascita e residenza
luogo_nascita: { x: 100, y: height - 475 }
data_nascita: { x: 240, y: height - 475 }   // Più a destra
citta: { x: 380, y: height - 475 }          // Più a destra

// Checkbox consenso - AGGIUSTATI per centrare la X
acconsento: { x: 210, y: height - 630 }     // Quadratino "ACCONSENTO"
non_acconsento: { x: 435, y: height - 630 } // Quadratino "NON ACCONSENTO"
```

### **Pagina 6 - Consenso Dati** ✅ OTTIMIZZATA
```javascript
// Layout ottimizzato identico alla Pagina 5
cognome_nome: { x: 280, y: height - 345 }   // Più centrato
// ... coordinate simili a Pagina 5 ma per posizione Y diversa
```

## 🎨 Metodo di Calibrazione

Se le coordinate non sono precise:

### **1. Debug Mode**
Usa il pulsante "Debug PDF" nell'app per:
- Analizzare la struttura del PDF
- Vedere le dimensioni reali della pagina
- Loggare tutti i valori nella console

### **2. Test Coordinate**
Per testare una nuova posizione:
```javascript
// Test coordinate X=100, Y=300 (da basso)
page.drawText('TEST', {
  x: 100, 
  y: height - 300,  // height-300 = 541.89 da origine
  size: 12, 
  font: boldFont, 
  color: rgb(1, 0, 0)  // Rosso per visibilità
});
```

### **3. Calcolo Coordinate**
- **Da immagine**: Misura pixel dall'alto e converti
- **Conversione**: `y_pdf = height - pixel_dall_alto`
- **Esempio**: Se campo è a 260px dall'alto → `y: height - 260`

## 🔍 Debug Console

L'app ora logga ogni inserimento:
```
✓ Cognome: 'ROSSI' at (200, 581.89)
✓ Nome: 'MARIO' at (380, 581.89)
✓ Luogo nascita: 'ROMA' at (110, 546.89)
```

## ⚡ Fix Rapido

Se i testi non appaiono nelle posizioni giuste:

1. **Apri console browser** (F12)
2. **Compila e scarica PDF**
3. **Controlla i log** delle coordinate
4. **Modifica valori** in `pdfService.js`
5. **Testa di nuovo**

## 🎯 Coordinate Target

Basandoci sulle immagini allegate, i campi dovrebbero apparire:
- **Pagina 4**: Nelle linee tratteggiate dopo il testo
- **Pagina 5**: Negli spazi vuoti dopo i due punti
- **Pagina 6**: Stesso layout della Pagina 5

Le coordinate attuali sono una **prima approssimazione** basata sull'analisi visiva delle immagini. Potrebbero richiedere fine-tuning di ±20-50 punti.