// Document Manager Service - Gestione documenti generati con RxDB
import databaseService from './databaseService';
import fileStorageService from './fileStorageService';

class DocumentManager {
  constructor() {
    this.documentsPath = '/documents/';
    this.initialized = false;
  }

  // Inizializza il database
  async initialize() {
    if (!this.initialized) {
      await databaseService.initialize();
      // Migra i dati da localStorage se esistenti
      await databaseService.migrateFromLocalStorage();
      this.initialized = true;
    }
  }

  // Salva i metadati del documento nel database RxDB
  async saveDocumentMetadata(formData, filename, pdfBlob) {
    try {
      await this.initialize();

      const documentData = {
        formData,
        filename,
        pdfBlob
      };

      const savedDocument = await databaseService.saveDocument(documentData);
      
      // Salva il file fisico
      await this.saveDocumentToServer(savedDocument, pdfBlob);

      return savedDocument;
    } catch (error) {
      console.error('❌ Errore nel salvataggio metadati documento:', error);
      throw error;
    }
  }

  // Salva il file usando FileStorageService
  async saveDocumentToServer(document, pdfBlob) {
    try {
      const result = await fileStorageService.saveFile(pdfBlob, document.filename);
      
      if (result.success) {
        console.log('✅ File salvato con successo:', result);
        return result;
      } else {
        throw new Error('Errore nel salvataggio del file');
      }
    } catch (error) {
      console.error('❌ Errore salvataggio file:', error);
      throw error;
    }
  }

  // Recupera un file salvato
  async getDocumentFile(filename) {
    try {
      return await fileStorageService.getFile(filename);
    } catch (error) {
      console.error('❌ Errore recupero file:', error);
      return null;
    }
  }

  // Elimina un file
  async deleteDocumentFile(filename) {
    try {
      return await fileStorageService.deleteFile(filename);
    } catch (error) {
      console.error('❌ Errore eliminazione file:', error);
      return false;
    }
  }

  // Recupera tutti i documenti
  async getAllDocuments() {
    try {
      await this.initialize();
      return await databaseService.getAllDocuments();
    } catch (error) {
      console.error('❌ Errore nel recupero documenti:', error);
      return [];
    }
  }

  // Recupera tutti i documenti con query reattiva
  async getAllDocuments$() {
    try {
      await this.initialize();
      return await databaseService.getAllDocuments$();
    } catch (error) {
      console.error('❌ Errore nel recupero documenti reattivo:', error);
      return null;
    }
  }

  // Cerca documenti per filtri
  async searchDocuments(filters = {}) {
    try {
      await this.initialize();
      return await databaseService.searchDocuments(filters);
    } catch (error) {
      console.error('❌ Errore nella ricerca documenti:', error);
      return [];
    }
  }

  // Cerca documenti con query reattiva
  async searchDocuments$(filters = {}) {
    try {
      await this.initialize();
      return await databaseService.searchDocuments$(filters);
    } catch (error) {
      console.error('❌ Errore nella ricerca documenti reattiva:', error);
      return null;
    }
  }

  // Elimina un documento
  async deleteDocument(documentId) {
    try {
      await this.initialize();
      return await databaseService.deleteDocument(documentId);
    } catch (error) {
      console.error('❌ Errore eliminazione documento:', error);
      throw error;
    }
  }

  // Ottieni un documento per ID
  async getDocumentById(documentId) {
    try {
      await this.initialize();
      return await databaseService.getDocumentById(documentId);
    } catch (error) {
      console.error('❌ Errore recupero documento:', error);
      return null;
    }
  }

  // Genera ID univoco per il documento
  generateDocumentId() {
    return databaseService.generateDocumentId();
  }

  // Genera nome file basato sui dati utente
  generateFilename(formData) {
    return databaseService.generateFilename(formData);
  }

  // Ottieni statistiche documenti
  async getDocumentStats() {
    try {
      await this.initialize();
      return await databaseService.getDocumentStats();
    } catch (error) {
      console.error('❌ Errore statistiche documenti:', error);
      return {
        total: 0,
        today: 0,
        thisWeek: 0,
        thisMonth: 0,
        totalSize: 0
      };
    }
  }

  // Formatta dimensione file
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Formatta data
  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Cleanup del database
  async destroy() {
    await databaseService.destroy();
    this.initialized = false;
  }
}

// Crea istanza singleton
const documentManager = new DocumentManager();

export default documentManager;