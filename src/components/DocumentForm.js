import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { validateCodiceFiscale, validateEmail, formatTelefono } from '../services/validation';
import { generateDocument, downloadDocument } from '../services/api';
import documentManager from '../services/documentManager';
import pdfService from '../services/pdfService';
import SignaturePad from './SignaturePad';
import './DocumentForm.css';

function DocumentForm() {
  const { state, actions } = useApp();

  const handleInputChange = (field, value) => {
    actions.setFormData(field, value);
    
    // Pulisci errori per questo campo
    if (state.errors[field]) {
      const newErrors = { ...state.errors };
      delete newErrors[field];
      actions.setErrors(newErrors);
    }
  };

  const handleCodiceFiscaleChange = (value) => {
    const cleaned = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    handleInputChange('codice_fiscale', cleaned);
  };

  const handleTelefonoChange = (value) => {
    const formatted = formatTelefono(value);
    handleInputChange('telefono', formatted);
  };

  const validateForm = () => {
    const errors = {};
    const { formData } = state;

    // Campi obbligatori
    if (!formData.nome.trim()) errors.nome = 'Nome obbligatorio';
    if (!formData.cognome.trim()) errors.cognome = 'Cognome obbligatorio';
    if (!formData.data_nascita) errors.data_nascita = 'Data di nascita obbligatoria';
    if (!formData.luogo_nascita.trim()) errors.luogo_nascita = 'Luogo di nascita obbligatorio';
    if (!formData.codice_fiscale.trim()) errors.codice_fiscale = 'Codice fiscale obbligatorio';
    if (!formData.indirizzo.trim()) errors.indirizzo = 'Indirizzo obbligatorio';
    if (!formData.citta.trim()) errors.citta = 'Città obbligatoria';
    if (!formData.cap.trim()) errors.cap = 'CAP obbligatorio';
    if (!formData.telefono.trim()) errors.telefono = 'Telefono obbligatorio';
    if (!formData.email.trim()) errors.email = 'Email obbligatoria';

    // Validazioni specifiche
    if (formData.codice_fiscale && !validateCodiceFiscale(formData.codice_fiscale)) {
      errors.codice_fiscale = 'Codice fiscale non valido';
    }

    if (formData.email && !validateEmail(formData.email)) {
      errors.email = 'Email non valida';
    }

    // Validazione CAP
    if (formData.cap && !/^\d{5}$/.test(formData.cap)) {
      errors.cap = 'CAP deve essere di 5 cifre';
    }

    // Controllo maggiore età per genitore
    if (formData.data_nascita) {
      const today = new Date();
      const birthDate = new Date(formData.data_nascita);
      const age = today.getFullYear() - birthDate.getFullYear();
      
      if (age < 18) {
        if (!formData.genitore1_nome.trim()) {
          errors.genitore1_nome = 'Nome del primo genitore obbligatorio per i minorenni';
        }
        if (!formData.genitore1_cognome.trim()) {
          errors.genitore1_cognome = 'Cognome del primo genitore obbligatorio per i minorenni';
        }
        if (!formData.genitore1_telefono.trim()) {
          errors.genitore1_telefono = 'Telefono del primo genitore obbligatorio per i minorenni';
        }
      }
    }

    // Validazione consensi obbligatori
    if (formData.data_consent === null) {
      errors.data_consent = 'Il consenso al trattamento dati è obbligatorio';
    }
    
    if (formData.marketing_consent === null) {
      errors.marketing_consent = 'Selezionare una scelta per il consenso marketing';
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      actions.setErrors(errors);
      actions.setMessage('Correggi gli errori nel form', 'error');
      return;
    }

    actions.setLoading(true);
    actions.clearErrors();

    try {
      // Genera il PDF lato client
      const response = await generateDocument(state.formData);
      
      if (response.success) {
        // Crea un blob dal PDF per il salvataggio
        const pdfBlob = new Blob([response.data.pdfBytes], { type: 'application/pdf' });
        
        // Log dimensione blob creato
        console.log('📊 Blob PDF creato - Dimensione:', pdfBlob.size, 'bytes');
        console.log('📊 pdfBytes originali - Dimensione:', response.data.pdfBytes.length, 'bytes');
        
        // Genera nome file personalizzato
        const filename = documentManager.generateFilename(state.formData);
        
        // Salva i metadati del documento per il backoffice
        try {
          await documentManager.saveDocumentMetadata(state.formData, filename, pdfBlob);
        } catch (saveError) {
          console.warn('Errore nel salvataggio metadati documento:', saveError);
          // Non blocciano il processo se il salvataggio fallisce
        }
        
        // Avvia automaticamente il download
        downloadDocument(response.data.pdfBytes, filename);
        
        // Pulisci il form e mostra messaggio di successo
        actions.resetForm();
        actions.setMessage(response.data.message + ' - Documento archiviato nel sistema', 'success');
      } else {
        throw new Error('Errore nella generazione del documento');
      }
      
    } catch (error) {
      console.error('Errore generazione documento:', error);
      actions.setMessage(error.message || 'Errore durante la generazione del documento', 'error');
    } finally {
      actions.setLoading(false);
    }
  };

  // Funzione di debug per analizzare la struttura del PDF
  const handleDebugPDF = async () => {
    try {
      actions.setMessage('Analizzando struttura PDF...', 'info');
      const analysis = await pdfService.analyzePDFStructure();
      console.log('Analisi PDF completata:', analysis);
      actions.setMessage('Analisi completata! Controlla la console del browser per i dettagli.', 'success');
    } catch (error) {
      console.error('Errore nell\'analisi PDF:', error);
      actions.setMessage('Errore nell\'analisi del PDF', 'error');
    }
  };

  // Controllo maggiore età per aggiornare label genitore
  useEffect(() => {
    if (state.formData.data_nascita) {
      // Questo effetto potrebbe essere usato per aggiornare lo stato se necessario
      // Attualmente non è necessario calcolare l'età qui
    }
  }, [state.formData.data_nascita]);

  const isMinor = () => {
    if (!state.formData.data_nascita) return false;
    const today = new Date();
    const birthDate = new Date(state.formData.data_nascita);
    const age = today.getFullYear() - birthDate.getFullYear();
    return age < 18;
  };

  return (
    <div className="form-section">
      <h3>
        <i className="fas fa-edit"></i> 
        Compila il Documento
      </h3>
      
      <form onSubmit={handleSubmit} className="pdf-form">
        {/* Nome e Cognome */}
        <div className="form-row">
          <div className="form-group">
            <label>
              <i className="fas fa-user"></i>
              Nome *
            </label>
            <input
              type="text"
              value={state.formData.nome}
              onChange={(e) => handleInputChange('nome', e.target.value)}
              className={state.errors.nome ? 'error' : ''}
              required
            />
            {state.errors.nome && <span className="error-text">{state.errors.nome}</span>}
          </div>

          <div className="form-group">
            <label>
              <i className="fas fa-user"></i>
              Cognome *
            </label>
            <input
              type="text"
              value={state.formData.cognome}
              onChange={(e) => handleInputChange('cognome', e.target.value)}
              className={state.errors.cognome ? 'error' : ''}
              required
            />
            {state.errors.cognome && <span className="error-text">{state.errors.cognome}</span>}
          </div>
        </div>

        {/* Data e Luogo di nascita */}
        <div className="form-row">
          <div className="form-group">
            <label>
              <i className="fas fa-calendar"></i>
              Data di nascita *
            </label>
            <input
              type="date"
              value={state.formData.data_nascita}
              onChange={(e) => handleInputChange('data_nascita', e.target.value)}
              className={state.errors.data_nascita ? 'error' : ''}
              required
            />
            {state.errors.data_nascita && <span className="error-text">{state.errors.data_nascita}</span>}
          </div>

          <div className="form-group">
            <label>
              <i className="fas fa-map-marker-alt"></i>
              Luogo di nascita *
            </label>
            <input
              type="text"
              value={state.formData.luogo_nascita}
              onChange={(e) => handleInputChange('luogo_nascita', e.target.value)}
              className={state.errors.luogo_nascita ? 'error' : ''}
              required
            />
            {state.errors.luogo_nascita && <span className="error-text">{state.errors.luogo_nascita}</span>}
          </div>
        </div>

        {/* Codice Fiscale */}
        <div className="form-group">
          <label>
            <i className="fas fa-id-card"></i>
            Codice Fiscale *
          </label>
          <input
            type="text"
            value={state.formData.codice_fiscale}
            onChange={(e) => handleCodiceFiscaleChange(e.target.value)}
            className={state.errors.codice_fiscale ? 'error' : ''}
            maxLength="16"
            placeholder="RSSMRA80A01H501U"
            required
          />
          {state.errors.codice_fiscale && <span className="error-text">{state.errors.codice_fiscale}</span>}
        </div>

        {/* Indirizzo */}
        <div className="form-group">
          <label>
            <i className="fas fa-home"></i>
            Indirizzo *
          </label>
          <input
            type="text"
            value={state.formData.indirizzo}
            onChange={(e) => handleInputChange('indirizzo', e.target.value)}
            className={state.errors.indirizzo ? 'error' : ''}
            placeholder="Via/Piazza e numero civico"
            required
          />
          {state.errors.indirizzo && <span className="error-text">{state.errors.indirizzo}</span>}
        </div>

        {/* Città e CAP */}
        <div className="form-row">
          <div className="form-group">
            <label>
              <i className="fas fa-city"></i>
              Città *
            </label>
            <input
              type="text"
              value={state.formData.citta}
              onChange={(e) => handleInputChange('citta', e.target.value)}
              className={state.errors.citta ? 'error' : ''}
              required
            />
            {state.errors.citta && <span className="error-text">{state.errors.citta}</span>}
          </div>

          <div className="form-group">
            <label>
              <i className="fas fa-mail-bulk"></i>
              CAP *
            </label>
            <input
              type="text"
              value={state.formData.cap}
              onChange={(e) => handleInputChange('cap', e.target.value)}
              className={state.errors.cap ? 'error' : ''}
              maxLength="5"
              placeholder="00100"
              required
            />
            {state.errors.cap && <span className="error-text">{state.errors.cap}</span>}
          </div>
        </div>

        {/* Telefono ed Email */}
        <div className="form-row">
          <div className="form-group">
            <label>
              <i className="fas fa-phone"></i>
              Telefono *
            </label>
            <input
              type="tel"
              value={state.formData.telefono}
              onChange={(e) => handleTelefonoChange(e.target.value)}
              className={state.errors.telefono ? 'error' : ''}
              placeholder="+39 XXX XXX XXXX"
              required
            />
            {state.errors.telefono && <span className="error-text">{state.errors.telefono}</span>}
          </div>

          <div className="form-group">
            <label>
              <i className="fas fa-envelope"></i>
              Email *
            </label>
            <input
              type="email"
              value={state.formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={state.errors.email ? 'error' : ''}
              placeholder="nome@esempio.it"
              required
            />
            {state.errors.email && <span className="error-text">{state.errors.email}</span>}
          </div>
        </div>

        {/* Sezione Genitori (solo se minorenne) */}
        {isMinor() && (
          <div className="parents-section">
            <h4><i className="fas fa-users"></i> Dati Genitori (obbligatori per minorenni)</h4>
            
            {/* Primo Genitore */}
            <div className="parent-group">
              <h5>Primo Genitore</h5>
              <div className="form-row">
                <div className="form-group">
                  <label>Nome *</label>
                  <input
                    type="text"
                    value={state.formData.genitore1_nome}
                    onChange={(e) => handleInputChange('genitore1_nome', e.target.value)}
                    className={state.errors.genitore1_nome ? 'error' : ''}
                    required={isMinor()}
                  />
                  {state.errors.genitore1_nome && <span className="error-text">{state.errors.genitore1_nome}</span>}
                </div>

                <div className="form-group">
                  <label>Cognome *</label>
                  <input
                    type="text"
                    value={state.formData.genitore1_cognome}
                    onChange={(e) => handleInputChange('genitore1_cognome', e.target.value)}
                    className={state.errors.genitore1_cognome ? 'error' : ''}
                    required={isMinor()}
                  />
                  {state.errors.genitore1_cognome && <span className="error-text">{state.errors.genitore1_cognome}</span>}
                </div>
              </div>

              <div className="form-group">
                <label>Telefono *</label>
                <input
                  type="tel"
                  value={state.formData.genitore1_telefono}
                  onChange={(e) => handleInputChange('genitore1_telefono', e.target.value)}
                  className={state.errors.genitore1_telefono ? 'error' : ''}
                  placeholder="+39 XXX XXX XXXX"
                  required={isMinor()}
                />
                {state.errors.genitore1_telefono && <span className="error-text">{state.errors.genitore1_telefono}</span>}
              </div>
            </div>

            {/* Secondo Genitore (opzionale) */}
            <div className="parent-group">
              <h5>Secondo Genitore (opzionale)</h5>
              <div className="form-row">
                <div className="form-group">
                  <label>Nome</label>
                  <input
                    type="text"
                    value={state.formData.genitore2_nome}
                    onChange={(e) => handleInputChange('genitore2_nome', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Cognome</label>
                  <input
                    type="text"
                    value={state.formData.genitore2_cognome}
                    onChange={(e) => handleInputChange('genitore2_cognome', e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Telefono</label>
                <input
                  type="tel"
                  value={state.formData.genitore2_telefono}
                  onChange={(e) => handleInputChange('genitore2_telefono', e.target.value)}
                  placeholder="+39 XXX XXX XXXX"
                />
              </div>
            </div>
          </div>
        )}

        {/* Contatto emergenza */}
        <div className="form-group">
          <label>
            <i className="fas fa-phone-alt"></i>
            Contatto di emergenza
          </label>
          <input
            type="text"
            value={state.formData.contatto_emergenza}
            onChange={(e) => handleInputChange('contatto_emergenza', e.target.value)}
            placeholder="Nome e telefono"
          />
        </div>

        {/* Note */}
        <div className="form-group">
          <label>
            <i className="fas fa-sticky-note"></i>
            Note aggiuntive
          </label>
          <textarea
            value={state.formData.note}
            onChange={(e) => handleInputChange('note', e.target.value)}
            rows="3"
            placeholder="Eventuali note o informazioni aggiuntive..."
          />
        </div>

        {/* Sezione Consensi */}
        <div className="form-section">
          <h3>
            <i className="fas fa-check-square"></i>
            Consensi e Autorizzazioni
          </h3>
          
          {/* Consenso Marketing */}
          <div className="form-group consent-group">
            <label className="consent-label">
              <i className="fas fa-envelope"></i>
              Consenso Marketing e Comunicazioni Commerciali
            </label>
            <p className="consent-description">
              Consenso per l'invio di comunicazioni commerciali, promozioni e informazioni sui servizi della Federazione.
            </p>
            <div className="radio-group">
              <label className="radio-option">
                <input
                  type="radio"
                  name="marketing_consent"
                  value="true"
                  checked={state.formData.marketing_consent === true}
                  onChange={() => handleInputChange('marketing_consent', true)}
                />
                <span className="radio-label">
                  <i className="fas fa-check"></i>
                  ACCONSENTO
                </span>
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  name="marketing_consent"
                  value="false"
                  checked={state.formData.marketing_consent === false}
                  onChange={() => handleInputChange('marketing_consent', false)}
                />
                <span className="radio-label">
                  <i className="fas fa-times"></i>
                  NON ACCONSENTO
                </span>
              </label>
            </div>
            {state.errors.marketing_consent && <span className="error-text">{state.errors.marketing_consent}</span>}
          </div>

          {/* Consenso Trattamento Dati */}
          <div className="form-group consent-group">
            <label className="consent-label">
              <i className="fas fa-shield-alt"></i>
              Consenso Trattamento Dati Personali
            </label>
            <p className="consent-description">
              Consenso per il trattamento dei dati personali per le finalità istituzionali della Federazione (obbligatorio).
            </p>
            <div className="radio-group">
              <label className="radio-option">
                <input
                  type="radio"
                  name="data_consent"
                  value="true"
                  checked={state.formData.data_consent === true}
                  onChange={() => handleInputChange('data_consent', true)}
                />
                <span className="radio-label">
                  <i className="fas fa-check"></i>
                  ACCONSENTO
                </span>
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  name="data_consent"
                  value="false"
                  checked={state.formData.data_consent === false}
                  onChange={() => handleInputChange('data_consent', false)}
                />
                <span className="radio-label">
                  <i className="fas fa-times"></i>
                  NON ACCONSENTO
                </span>
              </label>
            </div>
            {state.errors.data_consent && <span className="error-text">{state.errors.data_consent}</span>}
          </div>

          {/* Autorizzazione Immagine */}
          <div className="form-group consent-group">
            <label className="consent-label">
              <i className="fas fa-camera"></i>
              Autorizzazione Utilizzo Immagine
            </label>
            <p className="consent-description">
              Autorizzazione per l'utilizzo dell'immagine per finalità di promozione e diffusione delle attività della Federazione.
            </p>
            <label className="checkbox-option">
              <input
                type="checkbox"
                checked={Boolean(state.formData.image_consent)}
                onChange={(e) => handleInputChange('image_consent', e.target.checked)}
              />
              <span className="checkbox-label">
                <i className="fas fa-check"></i>
                Autorizzo l'utilizzo dell'immagine per le finalità descritte
              </span>
            </label>
            {state.errors.image_consent && <span className="error-text">{state.errors.image_consent}</span>}
          </div>

          {/* Firma Digitale */}
          <div className="form-group consent-group">
            <label className="consent-label">
              <i className="fas fa-signature"></i>
              Firma Digitale
            </label>
            <p className="consent-description">
              Firma digitalmente il documento. La firma verrà applicata a tutte le pagine che richiedono la firma.
            </p>
            <SignaturePad
              value={state.formData.signature}
              onSignatureChange={(signature) => handleInputChange('signature', signature)}
            />
            {state.errors.signature && <span className="error-text">{state.errors.signature}</span>}
          </div>
        </div>

        {/* Azioni */}
        <div className="form-actions">
          <button
            type="submit"
            className={`btn btn-success ${state.isLoading ? 'loading' : ''}`}
            disabled={state.isLoading}
          >
            <i className="fas fa-download"></i>
            {state.isLoading ? 'Generazione in corso...' : 'Compila e Scarica PDF'}
          </button>
          
          <button
            type="button"
            className="btn btn-secondary"
            onClick={actions.resetForm}
            disabled={state.isLoading}
          >
            <i className="fas fa-refresh"></i>
            Cancella tutto
          </button>
          
          {process.env.NODE_ENV === 'development' && (
            <button
              type="button"
              className="btn btn-info"
              onClick={handleDebugPDF}
              disabled={state.isLoading}
            >
              <i className="fas fa-search"></i>
              Debug PDF
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default DocumentForm;