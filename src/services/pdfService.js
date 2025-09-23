import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

/**
 * Servizio per la gestione PDF lato client
 * Utilizza pdf-lib per manipolare PDF senza backend
 */
class PDFService {
  constructor() {
    this.pdfUrl = '/FKvedasipolicyprivacyperidettagli_compressed_organized.pdf';
  }

  /**
   * Carica il PDF dal percorso pubblico
   */
  async loadPDF() {
    try {
      const response = await fetch(this.pdfUrl);
      if (!response.ok) {
        throw new Error(`Errore nel caricamento del PDF: ${response.status}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      return arrayBuffer;
    } catch (error) {
      console.error('Errore nel caricamento del PDF:', error);
      throw error;
    }
  }

  /**
   * Compila il PDF con i dati del form
   */
  async fillPDF(formData) {
    try {
      // Carica il PDF originale
      const pdfArrayBuffer = await this.loadPDF();
      const pdfDoc = await PDFDocument.load(pdfArrayBuffer);
      
      // Ottieni la prima pagina
      const pages = pdfDoc.getPages();
      const firstPage = pages[0];
      
      // Carica il font
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      
      // Dimensioni della pagina
      const { width, height } = firstPage.getSize();
      
      // Colori
      const darkBlue = rgb(0.1, 0.2, 0.4);
      const black = rgb(0, 0, 0);
      
      // Aggiungi una pagina per i dati compilati
      const dataPage = pdfDoc.addPage([width, height]);
      
      // Header
      dataPage.drawText('DATI COMPILATI', {
        x: 50,
        y: height - 50,
        size: 20,
        font: boldFont,
        color: darkBlue,
      });
      
      // Linea separatrice
      dataPage.drawLine({
        start: { x: 50, y: height - 70 },
        end: { x: width - 50, y: height - 70 },
        thickness: 2,
        color: darkBlue,
      });
      
      let yPosition = height - 100;
      const lineHeight = 25;
      
      // Funzione helper per aggiungere una riga di dati
      const addDataRow = (label, value, isRequired = false) => {
        if (value && value.trim() !== '') {
          // Label
          dataPage.drawText(`${label}:`, {
            x: 50,
            y: yPosition,
            size: 12,
            font: boldFont,
            color: darkBlue,
          });
          
          // Valore
          dataPage.drawText(value, {
            x: 200,
            y: yPosition,
            size: 12,
            font: font,
            color: black,
          });
          
          yPosition -= lineHeight;
        } else if (isRequired) {
          // Mostra campo mancante per campi obbligatori
          dataPage.drawText(`${label}:`, {
            x: 50,
            y: yPosition,
            size: 12,
            font: boldFont,
            color: rgb(0.8, 0.2, 0.2),
          });
          
          dataPage.drawText('[NON SPECIFICATO]', {
            x: 200,
            y: yPosition,
            size: 12,
            font: font,
            color: rgb(0.8, 0.2, 0.2),
          });
          
          yPosition -= lineHeight;
        }
      };
      
      // Aggiungi i dati del form
      addDataRow('Nome Completo', formData.nome, true);
      addDataRow('Data di Nascita', formData.data_nascita, true);
      addDataRow('Luogo di Nascita', formData.luogo_nascita, true);
      addDataRow('Codice Fiscale', formData.codice_fiscale, true);
      addDataRow('Indirizzo', formData.indirizzo, true);
      addDataRow('Città', formData.citta);
      addDataRow('CAP', formData.cap);
      addDataRow('Telefono', formData.telefono, true);
      addDataRow('Email', formData.email, true);
      
      // Controlla se è minorenne per dati genitore
      const isMinor = this.isMinor(formData.data_nascita);
      
      if (isMinor) {
        yPosition -= 10; // Spazio extra
        dataPage.drawText('DATI GENITORE/TUTORE:', {
          x: 50,
          y: yPosition,
          size: 14,
          font: boldFont,
          color: darkBlue,
        });
        yPosition -= lineHeight;
        
        addDataRow('Nome Genitore/Tutore', formData.genitore_nome, true);
        addDataRow('Telefono Genitore', formData.genitore_telefono);
        addDataRow('Email Genitore', formData.genitore_email);
      }
      
      yPosition -= 10; // Spazio extra
      dataPage.drawText('CONTATTI DI EMERGENZA:', {
        x: 50,
        y: yPosition,
        size: 14,
        font: boldFont,
        color: darkBlue,
      });
      yPosition -= lineHeight;
      
      addDataRow('Contatto di Emergenza', formData.contatto_emergenza);
      addDataRow('Telefono Emergenza', formData.telefono_emergenza);
      
      if (formData.note && formData.note.trim() !== '') {
        yPosition -= 10; // Spazio extra
        dataPage.drawText('NOTE:', {
          x: 50,
          y: yPosition,
          size: 14,
          font: boldFont,
          color: darkBlue,
        });
        yPosition -= lineHeight;
        
        // Dividi le note in righe multiple se necessario
        const noteLines = this.wrapText(formData.note, 60);
        noteLines.forEach(line => {
          dataPage.drawText(line, {
            x: 50,
            y: yPosition,
            size: 12,
            font: font,
            color: black,
          });
          yPosition -= lineHeight;
        });
      }
      
      // Footer con timestamp
      const now = new Date();
      const timestamp = now.toLocaleString('it-IT');
      dataPage.drawText(`Documento compilato il: ${timestamp}`, {
        x: 50,
        y: 50,
        size: 10,
        font: font,
        color: rgb(0.5, 0.5, 0.5),
      });
      
      // Genera il PDF finale
      const pdfBytes = await pdfDoc.save();
      return pdfBytes;
      
    } catch (error) {
      console.error('Errore nella compilazione del PDF:', error);
      throw new Error(`Errore nella generazione del PDF: ${error.message}`);
    }
  }
  
  /**
   * Controlla se una data corrisponde a un minorenne
   */
  isMinor(birthDate) {
    if (!birthDate) return false;
    const today = new Date();
    const birth = new Date(birthDate);
    const age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      return (age - 1) < 18;
    }
    return age < 18;
  }
  
  /**
   * Wrappa il testo per adattarlo alla larghezza della pagina
   */
  wrapText(text, maxLength) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';
    
    words.forEach(word => {
      if ((currentLine + word).length <= maxLength) {
        currentLine += (currentLine ? ' ' : '') + word;
      } else {
        if (currentLine) {
          lines.push(currentLine);
        }
        currentLine = word;
      }
    });
    
    if (currentLine) {
      lines.push(currentLine);
    }
    
    return lines;
  }
  
  /**
   * Scarica il PDF compilato
   */
  downloadPDF(pdfBytes, filename = 'documento_compilato.pdf') {
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Cleanup
    URL.revokeObjectURL(url);
  }
  
  /**
   * Valida i dati del form
   */
  validateFormData(formData) {
    const errors = [];
    
    // Campi obbligatori
    const requiredFields = [
      { key: 'nome', name: 'Nome completo' },
      { key: 'data_nascita', name: 'Data di nascita' },
      { key: 'luogo_nascita', name: 'Luogo di nascita' },
      { key: 'codice_fiscale', name: 'Codice fiscale' },
      { key: 'indirizzo', name: 'Indirizzo' },
      { key: 'telefono', name: 'Telefono' },
      { key: 'email', name: 'Email' }
    ];
    
    requiredFields.forEach(field => {
      if (!formData[field.key] || formData[field.key].trim() === '') {
        errors.push(`${field.name} è obbligatorio`);
      }
    });
    
    // Validazione email
    if (formData.email && !this.isValidEmail(formData.email)) {
      errors.push('Email non valida');
    }
    
    // Validazione codice fiscale
    if (formData.codice_fiscale && !this.isValidCodiceFiscale(formData.codice_fiscale)) {
      errors.push('Codice fiscale non valido');
    }
    
    // Validazione per minorenni
    if (this.isMinor(formData.data_nascita)) {
      if (!formData.genitore_nome || formData.genitore_nome.trim() === '') {
        errors.push('Nome del genitore/tutore è obbligatorio per i minorenni');
      }
    }
    
    return errors;
  }
  
  /**
   * Valida un indirizzo email
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  /**
   * Valida un codice fiscale italiano
   */
  isValidCodiceFiscale(cf) {
    const cfRegex = /^[A-Z]{6}[0-9]{2}[A-Z][0-9]{2}[A-Z][0-9]{3}[A-Z]$/;
    return cfRegex.test(cf.toUpperCase());
  }
}

// Esporta un'istanza singleton
const pdfService = new PDFService();
export default pdfService;