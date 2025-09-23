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
      
      // Prima prova a compilare i campi modulo esistenti
      const form = pdfDoc.getForm();
      const formFields = form.getFields();
      
      console.log('Campi modulo trovati:', formFields.map(field => ({
        name: field.getName(),
        type: field.constructor.name
      })));

      // Mappa i dati del form ai campi PDF
      this.mapFormDataToFields(form, formData);
      
      // Se non ci sono campi modulo o per aggiungere informazioni extra,
      // sovrapponiamo i dati direttamente sulle pagine esistenti
      await this.overlayDataOnPages(pdfDoc, formData);
      
      // Genera il PDF finale
      const pdfBytes = await pdfDoc.save();
      return pdfBytes;
      
    } catch (error) {
      console.error('Errore nella compilazione del PDF:', error);
      throw new Error(`Errore nella generazione del PDF: ${error.message}`);
    }
  }

  /**
   * Mappa i dati del form ai campi modulo PDF
   */
  mapFormDataToFields(form, formData) {
    try {
      // Lista dei possibili nomi di campi e le loro mappature
      const fieldMappings = {
        // Campi base
        'nome': formData.nome,
        'cognome': formData.nome,
        'name': formData.nome,
        'full_name': formData.nome,
        'nome_completo': formData.nome,
        
        'data_nascita': formData.data_nascita,
        'date_birth': formData.data_nascita,
        'birth_date': formData.data_nascita,
        'nascita': formData.data_nascita,
        
        'luogo_nascita': formData.luogo_nascita,
        'place_birth': formData.luogo_nascita,
        'birth_place': formData.luogo_nascita,
        
        'codice_fiscale': formData.codice_fiscale,
        'cf': formData.codice_fiscale,
        'tax_code': formData.codice_fiscale,
        'fiscal_code': formData.codice_fiscale,
        
        'indirizzo': formData.indirizzo,
        'address': formData.indirizzo,
        'via': formData.indirizzo,
        
        'citta': formData.citta,
        'city': formData.citta,
        'comune': formData.citta,
        
        'cap': formData.cap,
        'postal_code': formData.cap,
        'zip': formData.cap,
        
        'telefono': formData.telefono,
        'phone': formData.telefono,
        'cellulare': formData.telefono,
        'mobile': formData.telefono,
        
        'email': formData.email,
        'mail': formData.email,
        'e_mail': formData.email,
        
        // Campi genitore per minorenni
        'genitore_nome': formData.genitore_nome,
        'parent_name': formData.genitore_nome,
        'tutore': formData.genitore_nome,
        
        'genitore_telefono': formData.genitore_telefono,
        'parent_phone': formData.genitore_telefono,
        
        'genitore_email': formData.genitore_email,
        'parent_email': formData.genitore_email,
        
        // Contatti emergenza
        'contatto_emergenza': formData.contatto_emergenza,
        'emergency_contact': formData.contatto_emergenza,
        
        'telefono_emergenza': formData.telefono_emergenza,
        'emergency_phone': formData.telefono_emergenza,
        
        // Note
        'note': formData.note,
        'notes': formData.note,
        'osservazioni': formData.note
      };

      // Prova a compilare ogni campo trovato
      const fields = form.getFields();
      fields.forEach(field => {
        const fieldName = field.getName().toLowerCase();
        const value = fieldMappings[fieldName];
        
        if (value && value.trim() !== '') {
          try {
            if (field.constructor.name === 'PDFTextField') {
              field.setText(value);
              console.log(`Campo testo compilato: ${fieldName} = ${value}`);
            } else if (field.constructor.name === 'PDFCheckBox') {
              // Per checkbox, assume che un valore significa checked
              field.check();
              console.log(`Checkbox selezionata: ${fieldName}`);
            } else if (field.constructor.name === 'PDFRadioGroup') {
              // Per radio button, prova a selezionare l'opzione
              try {
                field.select(value);
                console.log(`Radio button selezionato: ${fieldName} = ${value}`);
              } catch (e) {
                console.warn(`Impossibile selezionare radio ${fieldName}: ${e.message}`);
              }
            }
          } catch (error) {
            console.warn(`Errore compilando campo ${fieldName}:`, error.message);
          }
        }
      });
      
    } catch (error) {
      console.warn('Errore nella mappatura dei campi modulo:', error);
    }
  }

  /**
   * Sovrappone i dati direttamente sulle pagine del PDF
   */
  async overlayDataOnPages(pdfDoc, formData) {
    try {
      // Carica i font
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      
      // Ottieni le pagine
      const pages = pdfDoc.getPages();
      
      // Colori
      const darkBlue = rgb(0.1, 0.2, 0.4);
      const black = rgb(0, 0, 0);
      
      // Prova prima a sovrapporre i dati sulle pagine esistenti
      // se riconosciamo la struttura del modulo
      await this.overlayDataOnExistingPages(pdfDoc, formData, font, boldFont);
      
      // Aggiungi una nuova pagina alla fine con i dati compilati per sicurezza
      const { width, height } = pages[0].getSize();
      const dataPage = pdfDoc.addPage([width, height]);
      
      // Header
      dataPage.drawText('DATI COMPILATI - RIEPILOGO', {
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
      if (!formData.genitore1_nome || formData.genitore1_nome.trim() === '') {
        errors.push('Nome del genitore/tutore è obbligatorio per i minorenni');
      }
      if (!formData.genitore1_cognome || formData.genitore1_cognome.trim() === '') {
        errors.push('Cognome del genitore/tutore è obbligatorio per i minorenni');
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

  /**
   * Sovrappone i dati sulle pagine esistenti del PDF
   */
  async overlayDataOnExistingPages(pdfDoc, formData, font, boldFont) {
    try {
      const pages = pdfDoc.getPages();
      
      if (pages.length >= 6) {
        // Compila Pagina 4 - Modulo 3/P (Autorizzazione utilizzo immagine)
        await this.fillPage4_AuthorizeImage(pdfDoc, pages[3], formData, font, boldFont);
        
        // Compila Pagina 5 - Modulo 2/P (Consenso marketing)  
        await this.fillPage5_MarketingConsent(pdfDoc, pages[4], formData, font, boldFont);
        
        // Compila Pagina 6 - Modulo 1/P (Consenso trattamento dati)
        await this.fillPage6_DataConsent(pdfDoc, pages[5], formData, font, boldFont);
      }
      
    } catch (error) {
      console.warn('Errore nella sovrapposizione dei dati:', error);
    }
  }

  /**
   * Compila Pagina 4 - Autorizzazione utilizzo immagine
   */
  async fillPage4_AuthorizeImage(pdfDoc, page, formData, font, boldFont) {
    const { height } = page.getSize();
    const black = rgb(0, 0, 0);
    
    // Coordinate CORRETTE per Pagina 4 - aggiustate per posizionamento sulle linee
    // Dimensioni reali PDF: 594.96 x 842.04 punti
    const fields = {
      // Riga 1: "Io sottoscritto (Cognome, Nome) ______________________________________________________"
      cognome_nome: { x: 250, y: height - 245 },    // Nome completo con virgola, spostato sopra la linea
      
      // Riga 2: "nato a___________________________ il__________________, residente in ___________________,"
      luogo_nascita: { x: 100, y: height - 280 },   // Spostato sopra la linea
      data_nascita: { x: 250, y: height - 280 },     // Spostato sopra la linea
      citta: { x: 420, y: height - 280 },            // Spostato sopra la linea
      
      // Riga 3: "via_______________________________________________________________________________"
      indirizzo: { x: 100, y: height - 310 },         // Indirizzo completo
      
      // Checkbox "• ACCONSENTO □ NON ACCONSENTO □"
      acconsento: { x: 180, y: height - 465 },       // Checkbox ACCONSENTO
      non_acconsento: { x: 390, y: height - 465 },   // Checkbox NON ACCONSENTO
      
      // Fondo pagina: "Luogo e data ____________"
      luogo_data: { x: 120, y: height - 535 },
      
      // Fondo pagina: "Firma___________________"
      firma: { x: 100, y: height - 555 }
    };
    
    const fontSize = 9;  // Font più piccolo per adattarsi meglio
    
    try {
      console.log('📝 Compilazione Pagina 4 - Autorizzazione Immagine');
      
      // Nome completo con virgola - PRIMA RIGA
      if (formData.cognome && formData.nome) {
        const nomeCompleto = `${formData.cognome.toUpperCase()}, ${formData.nome.toUpperCase()}`;
        page.drawText(nomeCompleto, {
          x: fields.cognome_nome.x, y: fields.cognome_nome.y, size: fontSize, font, color: black
        });
        console.log(`✓ Nome completo: '${nomeCompleto}' at (${fields.cognome_nome.x}, ${fields.cognome_nome.y})`);
      }
      
      // Luogo nascita - SECONDA RIGA
      if (formData.luogo_nascita) {
        page.drawText(formData.luogo_nascita, {
          x: fields.luogo_nascita.x, y: fields.luogo_nascita.y, size: fontSize, font, color: black
        });
        console.log(`✓ Luogo nascita: '${formData.luogo_nascita}' at (${fields.luogo_nascita.x}, ${fields.luogo_nascita.y})`);
      }
      
      // Data nascita - SECONDA RIGA
      if (formData.data_nascita) {
        page.drawText(formData.data_nascita, {
          x: fields.data_nascita.x, y: fields.data_nascita.y, size: fontSize, font, color: black
        });
        console.log(`✓ Data nascita: '${formData.data_nascita}' at (${fields.data_nascita.x}, ${fields.data_nascita.y})`);
      }
      
      // Città residenza - SECONDA RIGA
      if (formData.citta) {
        page.drawText(formData.citta, {
          x: fields.citta.x, y: fields.citta.y, size: fontSize, font, color: black
        });
        console.log(`✓ Città: '${formData.citta}' at (${fields.citta.x}, ${fields.citta.y})`);
      }
      
      // Indirizzo completo - TERZA RIGA
      if (formData.indirizzo) {
        page.drawText(formData.indirizzo, {
          x: fields.indirizzo.x, y: fields.indirizzo.y, size: fontSize, font, color: black
        });
        console.log(`✓ Indirizzo: '${formData.indirizzo}' at (${fields.indirizzo.x}, ${fields.indirizzo.y})`);
      }
      
      // ✅ GESTIONE CHECKBOX CONSENSO DATI - OBBLIGATORIO
      if (formData.data_consent === true) {
        page.drawText('X', {
          x: fields.acconsento.x, y: fields.acconsento.y, size: 10, font: boldFont, color: black
        });
        console.log(`✓ Consenso Dati: ACCONSENTO at (${fields.acconsento.x}, ${fields.acconsento.y})`);
      } else if (formData.data_consent === false) {
        page.drawText('X', {
          x: fields.non_acconsento.x, y: fields.non_acconsento.y, size: 10, font: boldFont, color: black
        });
        console.log(`✓ Consenso Dati: NON ACCONSENTO at (${fields.non_acconsento.x}, ${fields.non_acconsento.y})`);
      }
      
      // Luogo e data corrente - FONDO PAGINA
      const today = new Date();
      const luogoData = `${formData.citta || 'Roma'}, ${today.toLocaleDateString('it-IT')}`;
      page.drawText(luogoData, {
        x: fields.luogo_data.x, y: fields.luogo_data.y, size: fontSize, font, color: black
      });
      console.log(`✓ Luogo e Data: '${luogoData}' at (${fields.luogo_data.x}, ${fields.luogo_data.y})`);
      
      // Firma - FONDO PAGINA
      await this.drawSignature(pdfDoc, page, formData, fields.firma, boldFont);
      
      console.log('✅ Pagina 4 completata con successo!');
    } catch (error) {
      console.error('❌ Errore Pagina 4:', error);
    }
  }

  /**
   * Compila Pagina 5 - Consenso marketing
   */
  async fillPage5_MarketingConsent(pdfDoc, page, formData, font, boldFont) {
    const { height } = page.getSize();
    const black = rgb(0, 0, 0);
    
    // Coordinate OTTIMIZZATE per Pagina 5 - Consenso Marketing
    // Basate sui risultati dei test e dimensioni reali
    const fields = {
      // "Io sottoscritto (Cognome, Nome) ___________________________________"
      cognome_nome: { x: 250, y: height - 330 },  // Più a destra per centramento
      
      // "nato a___________________ il______________, residente in _______________,"
      luogo_nascita: { x: 100, y: height - 365 },
      data_nascita: { x: 250, y: height - 365 },   // Più a destra
      citta: { x: 420, y: height - 365 },          // Più a destra

      // "via_____________________________________________________________________"
      indirizzo: { x: 100, y: height - 400 },
      
      // Checkbox "- ACCONSENTO □ NON ACCONSENTO □"
      // Posizioni ottimizzate per centrare la X nei quadratini
      acconsento: { x: 180, y: height - 490 },      // Nel quadratino dopo "ACCONSENTO"
      non_acconsento: { x: 390, y: height - 490 },  // Nel quadratino dopo "NON ACCONSENTO"
      
      // "Luogo e data _______________"
      luogo_data: { x: 120, y: height - 535 },
      
      // "Firma___________________"
      firma: { x: 100, y: height - 555 }
    };
    
    const fontSize = 9;
    
    try {
      console.log('📝 Compilazione Pagina 5 - Consenso Marketing');
      
      // Nome completo
      if (formData.cognome && formData.nome) {
        const nomeCompleto = `${formData.cognome}, ${formData.nome}`.toUpperCase();
        page.drawText(nomeCompleto, {
          x: fields.cognome_nome.x, y: fields.cognome_nome.y, size: fontSize, font, color: black
        });
        console.log(`✓ Nome completo: '${nomeCompleto}' at (${fields.cognome_nome.x}, ${fields.cognome_nome.y})`);
      }
      
      // Luogo nascita
      if (formData.luogo_nascita) {
        page.drawText(formData.luogo_nascita, {
          x: fields.luogo_nascita.x, y: fields.luogo_nascita.y, size: fontSize, font, color: black
        });
        console.log(`✓ Luogo nascita: '${formData.luogo_nascita}' at (${fields.luogo_nascita.x}, ${fields.luogo_nascita.y})`);
      }
      
      // Data nascita
      if (formData.data_nascita) {
        page.drawText(formData.data_nascita, {
          x: fields.data_nascita.x, y: fields.data_nascita.y, size: fontSize, font, color: black
        });
        console.log(`✓ Data nascita: '${formData.data_nascita}' at (${fields.data_nascita.x}, ${fields.data_nascita.y})`);
      }
      
      // Città residenza
      if (formData.citta) {
        page.drawText(formData.citta, {
          x: fields.citta.x, y: fields.citta.y, size: fontSize, font, color: black
        });
        console.log(`✓ Città: '${formData.citta}' at (${fields.citta.x}, ${fields.citta.y})`);
      }
      
      // Indirizzo completo
      if (formData.indirizzo) {
        page.drawText(formData.indirizzo, {
          x: fields.indirizzo.x, y: fields.indirizzo.y, size: fontSize, font, color: black
        });
        console.log(`✓ Indirizzo: '${formData.indirizzo}' at (${fields.indirizzo.x}, ${fields.indirizzo.y})`);
      }
      
      // ✅ GESTIONE CONSENSO MARKETING - CHECKBOX
      if (formData.marketing_consent === true) {
        // Metti X nel quadratino ACCONSENTO
        page.drawText('X', {
          x: fields.acconsento.x, y: fields.acconsento.y, size: 11, font: boldFont, color: black
        });
        console.log(`✓ Consenso Marketing: ACCONSENTO selezionato at (${fields.acconsento.x}, ${fields.acconsento.y})`);
      } else if (formData.marketing_consent === false) {
        // Metti X nel quadratino NON ACCONSENTO  
        page.drawText('X', {
          x: fields.non_acconsento.x, y: fields.non_acconsento.y, size: 11, font: boldFont, color: black
        });
        console.log(`✓ Consenso Marketing: NON ACCONSENTO selezionato at (${fields.non_acconsento.x}, ${fields.non_acconsento.y})`);
      }
      
      // Luogo e data
      const today = new Date();
      const luogoData = `${formData.citta || 'Roma'}, ${today.toLocaleDateString('it-IT')}`;
      page.drawText(luogoData, {
        x: fields.luogo_data.x, y: fields.luogo_data.y, size: fontSize, font, color: black
      });
      console.log(`✓ Luogo e Data: '${luogoData}' at (${fields.luogo_data.x}, ${fields.luogo_data.y})`);
      
      // Firma
      await this.drawSignature(pdfDoc, page, formData, fields.firma, boldFont);
      
      console.log('✅ Pagina 5 completata con successo!');
    } catch (error) {
      console.error('❌ Errore Pagina 5:', error);
    }
  }

  /**
   * Compila Pagina 6 - Consenso trattamento dati personali
   */
  async fillPage6_DataConsent(pdfDoc, page, formData, font, boldFont) {
    const { height } = page.getSize();
    const black = rgb(0, 0, 0);
    
    // Coordinate CORRETTE per Pagina 6 - MODULO 1/P
    // Aggiustate per posizionare i testi SULLE linee invece che sotto
    const fields = {
      // "Io sottoscritto (Cognome, Nome) ______________________________________________________"
      cognome: { x: 190, y: height - 205 },   // Spostato verso l'alto
      nome: { x: 350, y: height - 205 },   // Spostato verso l'alto
      
      // "nato a___________________________ il__________________, residente in ___________________,"
      luogo_nascita: { x: 100, y: height - 230 },  // Spostato verso l'alto  
      data_nascita: { x: 160, y: height - 230 },    // Spostato verso l'alto
      citta: { x: 250, y: height - 230 },           // Spostato verso l'alto
      telefono: { x: 360, y: height - 230 },        // Spostato verso l'alto
      
      // "Luogo e data _______________"
      luogo_data: { x: 140, y: height - 420 },
      
      // "Firma___________________"
      firma: { x: 110, y: height - 440 }
    };
    
    const fontSize = 9;
    
    try {
      console.log('📝 Compilazione Pagina 6 - Consenso Dati Personali');
      
      // Nome completo
      if (formData.cognome && formData.nome) {
        page.drawText(formData.cognome, {
          x: fields.cognome.x, y: fields.cognome.y, size: fontSize, font, color: black
        });
        console.log(`✓ Nome completo: '${formData.cognome}' at (${fields.cognome.x}, ${fields.cognome.y})`);
        page.drawText(formData.nome, {
          x: fields.nome.x, y: fields.nome.y, size: fontSize, font, color: black
        });
        console.log(`✓ Nome completo: '${formData.nome}' at (${fields.nome.x}, ${fields.nome.y})`);
      }
      
      // Luogo nascita
      if (formData.luogo_nascita) {
        page.drawText(formData.luogo_nascita, {
          x: fields.luogo_nascita.x, y: fields.luogo_nascita.y, size: fontSize, font, color: black
        });
        console.log(`✓ Luogo nascita: '${formData.luogo_nascita}' at (${fields.luogo_nascita.x}, ${fields.luogo_nascita.y})`);
      }
      
      // Data nascita
      if (formData.data_nascita) {
        page.drawText(formData.data_nascita, {
          x: fields.data_nascita.x, y: fields.data_nascita.y, size: fontSize, font, color: black
        });
        console.log(`✓ Data nascita: '${formData.data_nascita}' at (${fields.data_nascita.x}, ${fields.data_nascita.y})`);
      }
      
      // Città residenza
      if (formData.citta) {
        page.drawText(formData.citta, {
          x: fields.citta.x, y: fields.citta.y, size: fontSize, font, color: black
        });
        console.log(`✓ Città: '${formData.citta}' at (${fields.citta.x}, ${fields.citta.y})`);
      }

      // Telefono
      if (formData.telefono) {
        page.drawText(formData.telefono, {
          x: fields.telefono.x, y: fields.telefono.y, size: fontSize, font, color: black
        });
        console.log(`✓ Telefono: '${formData.telefono}' at (${fields.telefono.x}, ${fields.telefono.y})`);
      }
      
      // Luogo e data
      const today = new Date();
      const luogoData = `${formData.citta || 'Roma'}, ${today.toLocaleDateString('it-IT')}`;
      page.drawText(luogoData, {
        x: fields.luogo_data.x, y: fields.luogo_data.y, size: fontSize, font, color: black
      });
      console.log(`✓ Luogo e Data: '${luogoData}' at (${fields.luogo_data.x}, ${fields.luogo_data.y})`);
      
      // Firma
      await this.drawSignature(pdfDoc, page, formData, fields.firma, boldFont);
      
      console.log('✅ Pagina 6 completata con successo!');
    } catch (error) {
      console.error('❌ Errore Pagina 6:', error);
    }
    if (formData.nome && formData.cognome) {
      page.drawText(`${formData.nome} ${formData.cognome}`, {
        x: fields.firma.x, y: fields.firma.y, size: 12, font: boldFont, color: black
      });
    }
  }

  /**
   * Analizza la struttura del PDF per debugging (modalità sviluppo)
   */
  async analyzePDFStructure() {
    try {
      console.log('🔍 ANALISI STRUTTURA PDF - INIZIO');
      
      const pdfDoc = await PDFDocument.load(await this.loadPDF());
      const pages = pdfDoc.getPages();
      
      console.log(`📄 PDF caricato con ${pages.length} pagine`);
      
      pages.forEach((page, index) => {
        const { width, height } = page.getSize();
        console.log(`\n📋 PAGINA ${index + 1}:`);
        console.log(`   📏 Dimensioni: ${width} x ${height} punti`);
        console.log(`   📐 Standard A4: ${width === 595.28 && height === 841.89 ? '✅ SÌ' : '❌ NO'}`);
        
        // Log coordinate di riferimento per debugging
        if (index === 3) { // Pagina 4 (indice 3)
          console.log(`   🎯 RIFERIMENTI PAGINA 4 (Autorizzazione Immagine):`);
          console.log(`      Top (y=height): ${height}`);
          console.log(`      25% dall'alto: y=${height - height*0.25} (height-${height*0.25})`);
          console.log(`      50% dall'alto: y=${height - height*0.50} (height-${height*0.50})`);
          console.log(`      Coordinate attuali Cognome: x=200, y=${height - 260}`);
          console.log(`      Coordinate attuali Nome: x=380, y=${height - 260}`);
        }
        
        if (index === 4) { // Pagina 5 (indice 4)
          console.log(`   🎯 RIFERIMENTI PAGINA 5 (Consenso Marketing):`);
          console.log(`      Coordinate attuali Nome: x=250, y=${height - 440}`);
          console.log(`      Checkbox ACCONSENTO: x=205, y=${height - 630}`);
          console.log(`      Checkbox NON ACCONSENTO: x=430, y=${height - 630}`);
        }
        
        if (index === 5) { // Pagina 6 (indice 5)
          console.log(`   🎯 RIFERIMENTI PAGINA 6 (Consenso Dati):`);
          console.log(`      Coordinate attuali Nome: x=250, y=${height - 345}`);
          console.log(`      Layout identico a Pagina 5`);
        }
      });
      
      // Controllo se il PDF ha campi modulo
      const form = pdfDoc.getForm();
      const fields = form.getFields();
      
      console.log(`\n📝 CAMPI MODULO TROVATI: ${fields.length}`);
      if (fields.length > 0) {
        fields.forEach((field, i) => {
          console.log(`   ${i+1}. ${field.getName()} (${field.constructor.name})`);
        });
      } else {
        console.log('   ⚠️  Nessun campo modulo - Useremo sovrapposizione coordinate');
      }
      
      console.log('\n🔍 ANALISI STRUTTURA PDF - FINE');
      console.log('💡 Apri la console per vedere tutti i dettagli!');
      
    } catch (error) {
      console.error('❌ Errore nell\'analisi PDF:', error);
    }
  }
  /**
   * Converte una stringa base64 in Uint8Array
   */
  base64ToUint8Array(base64) {
    // Rimuovi il prefisso data:image/png;base64, se presente
    const base64Data = base64.replace(/^data:image\/png;base64,/, '');
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    return bytes;
  }

  /**
   * Disegna la firma (digitale o testo) nel PDF
   */
  async drawSignature(pdfDoc, page, formData, position, boldFont) {
    const black = rgb(0, 0, 0);
    
    if (formData.signature) {
      try {
        // Converti base64 in Uint8Array per pdf-lib
        const signatureBytes = this.base64ToUint8Array(formData.signature);
        const signatureImage = await pdfDoc.embedPng(signatureBytes);
        
        page.drawImage(signatureImage, {
          x: position.x,
          y: position.y - 30, // Sposta un po' in alto per dare spazio
          width: 120,
          height: 40
        });
      } catch (error) {
        console.warn('Errore nel disegnare la firma:', error);
        // Fallback al testo
        if (formData.nome && formData.cognome) {
          page.drawText(`${formData.nome} ${formData.cognome}`, {
            x: position.x, y: position.y, size: 12, font: boldFont, color: black
          });
        }
      }
    } else if (formData.nome && formData.cognome) {
      page.drawText(`${formData.nome} ${formData.cognome}`, {
        x: position.x, y: position.y, size: 12, font: boldFont, color: black
      });
    }
  }
}

// Esporta un'istanza singleton
const pdfService = new PDFService();
export default pdfService;