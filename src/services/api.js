import axios from 'axios';

// Configurazione axios
const api = axios.create({
  baseURL: process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:8000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Interceptor per gestire errori globali
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    
    if (error.response?.status === 500) {
      throw new Error('Errore del server. Riprova più tardi.');
    } else if (error.response?.status === 400) {
      throw new Error(error.response.data?.message || 'Dati non validi.');
    } else if (!error.response) {
      throw new Error('Errore di connessione. Controlla la tua connessione internet.');
    }
    
    throw error;
  }
);

// Genera documento compilato
export async function generateDocument(formData) {
  try {
    const response = await api.post('/generate_pdf.php', formData);
    
    if (response.data.success) {
      return {
        success: true,
        data: {
          fileUrl: response.data.download_url,
          filename: response.data.filename,
          message: response.data.message
        }
      };
    } else {
      throw new Error(response.data.error || 'Errore nella generazione del documento');
    }
  } catch (error) {
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    throw new Error('Errore durante la generazione del documento: ' + error.message);
  }
}

// Verifica esistenza PDF
export async function checkPDFExists() {
  try {
    const response = await api.get('/check-pdf');
    return response.data;
  } catch (error) {
    throw new Error('Errore durante la verifica del PDF: ' + error.message);
  }
}

// Health check API
export async function healthCheck() {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    throw new Error('Servizio non disponibile');
  }
}

export default api;