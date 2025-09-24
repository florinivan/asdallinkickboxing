import pdfService from './pdfService';

/**
 * Servizio API completamente lato client
 * Non utilizza più backend PHP, tutto è gestito nel browser
 */

// Simula un delay di rete per esperienza realistica
const simulateNetworkDelay = (ms = 1000) => 
  new Promise(resolve => setTimeout(resolve, ms));

// Genera documento compilato usando pdf-lib
export async function generateDocument(formData) {
  try {
    // Simula loading per esperienza utente
    await simulateNetworkDelay(800);
    
    // Valida i dati del form
    const validationErrors = pdfService.validateFormData(formData);
    if (validationErrors.length > 0) {
      throw new Error(validationErrors.join(', '));
    }
    
    // Genera il PDF
    const pdfBytes = await pdfService.fillPDF(formData);
    
    // Log dimensione PDF generato
    console.log('📊 PDF generato - Dimensione:', pdfBytes.length, 'bytes');
    
    // Crea filename personalizzato
    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `documento_${formData.nome?.replace(/\s+/g, '_') || 'compilato'}_${timestamp}.pdf`;
    
    return {
      success: true,
      data: {
        pdfBytes,
        filename,
        message: 'Documento generato con successo!'
      }
    };
    
  } catch (error) {
    console.error('Errore nella generazione del documento:', error);
    throw new Error(error.message || 'Errore nella generazione del documento');
  }
}

// Scarica il documento generato
export async function downloadDocument(pdfBytes, filename) {
  try {
    pdfService.downloadPDF(pdfBytes, filename);
    return {
      success: true,
      message: 'Download avviato con successo!'
    };
  } catch (error) {
    console.error('Errore nel download:', error);
    throw new Error('Errore durante il download del documento');
  }
}

// Controlla se il PDF è disponibile
export async function checkPDFAvailability() {
  try {
    // Tenta di caricare il PDF per verificare che sia disponibile
    const response = await fetch('/FKvedasipolicyprivacyperidettagli_compressed_organized.pdf', {
      method: 'HEAD'
    });
    
    return {
      success: response.ok,
      data: {
        available: response.ok,
        size: response.headers.get('content-length'),
        lastModified: response.headers.get('last-modified')
      }
    };
  } catch (error) {
    console.error('Errore nel controllo PDF:', error);
    return {
      success: false,
      data: { available: false },
      error: 'PDF non disponibile'
    };
  }
}