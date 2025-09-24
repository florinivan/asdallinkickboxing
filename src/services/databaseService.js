// RxDB Database Service - Gestione database reattivo per documenti
import { addRxPlugin, createRxDatabase } from 'rxdb/plugins/core';
import { RxDBDevModePlugin } from 'rxdb/plugins/dev-mode';
import { RxDBQueryBuilderPlugin } from 'rxdb/plugins/query-builder';
import { getRxStorageLocalstorage } from 'rxdb/plugins/storage-localstorage';
import { wrappedValidateAjvStorage } from 'rxdb/plugins/validate-ajv';

// Add required plugins - SEMPRE, anche in produzione
addRxPlugin(RxDBQueryBuilderPlugin);

// Enable dev mode in development
if (process.env.NODE_ENV === 'development') {
  addRxPlugin(RxDBDevModePlugin);
  // Disabilita i warning per un output più pulito
  import('rxdb/plugins/dev-mode').then(devMode => {
    if (devMode.disableWarnings) {
      devMode.disableWarnings();
    }
  });
} else {
  // In produzione, aggiungiamo comunque il dev mode per debug degli errori
  addRxPlugin(RxDBDevModePlugin);
}

class DatabaseService {
  constructor() {
    this.database = null;
    this.documentsCollection = null;
    this.initialized = false;
  }

  // Schema per i documenti generati
  getDocumentSchema() {
    return {
      version: 0,
      primaryKey: 'id',
      type: 'object',
      properties: {
        id: {
          type: 'string',
          maxLength: 100
        },
        filename: {
          type: 'string',
          maxLength: 255
        },
        generatedAt: {
          type: 'string',
          format: 'date-time'
        },
        userData: {
          type: 'object',
          properties: {
            nome: { type: 'string', maxLength: 100 },
            cognome: { type: 'string', maxLength: 100 },
            email: { type: 'string', maxLength: 255 },
            telefono: { type: 'string', maxLength: 20 },
            dataNascita: { type: 'string' },
            luogoNascita: { type: 'string', maxLength: 100 },
            codiceFiscale: { type: 'string', maxLength: 16 },
            indirizzo: { type: 'string', maxLength: 255 },
            citta: { type: 'string', maxLength: 100 },
            cap: { type: 'string', maxLength: 10 },
            provincia: { type: 'string', maxLength: 2 }
          },
          required: ['nome', 'cognome', 'email', 'telefono']
        },
        size: {
          type: 'number',
          minimum: 0
        },
        type: {
          type: 'string',
          maxLength: 50
        },
        filePath: {
          type: 'string',
          maxLength: 500
        },
        tags: {
          type: 'array',
          items: {
            type: 'string',
            maxLength: 50
          }
        }
      },
      required: ['id', 'filename', 'generatedAt', 'userData', 'size', 'type']
    };
  }

  // Inizializza il database
  async initialize() {
    if (this.initialized) return this.database;

    try {
      // Prova prima a rimuovere database esistente se c'è un conflitto
      try {
        await this.destroy();
      } catch (e) {
        // Ignora errori di cleanup
      }

      // Crea il database con configurazione robusta
      this.database = await createRxDatabase({
        name: 'asd_kickboxing_db',
        storage: wrappedValidateAjvStorage({
          storage: getRxStorageLocalstorage()
        }),
        ignoreDuplicate: true,
        allowSlowCount: true, // Permette conteggi lenti per compatibilità
        multiInstance: false  // Disabilita multi-istanza per evitare conflitti
      });

      // Verifica che il database sia stato creato correttamente
      if (!this.database) {
        throw new Error('Database creation failed');
      }

      // Aggiungi la collection per i documenti con gestione errori robusta
      const collections = await this.database.addCollections({
        documents: {
          schema: this.getDocumentSchema(),
          methods: {
            // Metodi personalizzati per i documenti
            getDisplayName() {
              return `${this.userData.nome} ${this.userData.cognome}`;
            },
            getFormattedDate() {
              return new Date(this.generatedAt).toLocaleDateString('it-IT', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
              });
            },
            getFormattedSize() {
              if (this.size === 0) return '0 Bytes';
              const k = 1024;
              const sizes = ['Bytes', 'KB', 'MB', 'GB'];
              const i = Math.floor(Math.log(this.size) / Math.log(k));
              return parseFloat((this.size / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
            }
          }
        }
      });

      // Verifica che la collection sia stata creata
      if (!collections.documents) {
        throw new Error('Documents collection creation failed');
      }

      // Salva riferimento alla collection per accesso diretto
      this.documentsCollection = collections.documents;

      this.initialized = true;
      console.log('✅ Database RxDB inizializzato correttamente');
      
      // Migrazione automatica da localStorage se necessario
      await this.migrateFromLocalStorage();
      
      return this.database;
    } catch (error) {
      console.error('❌ Errore inizializzazione database:', error);
      console.error('📊 Error details:', {
        message: error.message,
        code: error.code,
        parameters: error.parameters
      });
      
      // In caso di errore critico, proviamo a fare reset completo
      try {
        console.log('🔄 Tentativo di reset database...');
        localStorage.removeItem('rxdb-asd_kickboxing_db');
        localStorage.removeItem('RxDB-asd_kickboxing_db');
      } catch (resetError) {
        console.warn('⚠️ Errore durante reset:', resetError);
      }
      
      throw error;
    }
  }

  // Ottieni la collection documenti
  async getDocumentsCollection() {
    if (!this.initialized) {
      await this.initialize();
    }
    
    if (!this.database) {
      throw new Error('Database not initialized');
    }
    
    // Prova diversi modi per accedere alla collection
    let collection = this.documentsCollection || 
                    this.database.documents || 
                    this.database.collections?.documents ||
                    this.database['documents'];
    
    if (!collection) {
      console.error('❌ Documents collection not found. Available collections:', 
        Object.keys(this.database.collections || {}));
      throw new Error('Documents collection not found in database');
    }
    
    return collection;
  }

  // Salva un nuovo documento
  async saveDocument(documentData) {
    try {
      const collection = await this.getDocumentsCollection();
      
      const document = {
        id: this.generateDocumentId(),
        filename: documentData.filename,
        generatedAt: new Date().toISOString(),
        userData: {
          nome: documentData.formData.nome,
          cognome: documentData.formData.cognome,
          email: documentData.formData.email,
          telefono: documentData.formData.telefono,
          dataNascita: documentData.formData.data_nascita || '',
          luogoNascita: documentData.formData.luogo_nascita || '',
          codiceFiscale: documentData.formData.codice_fiscale || '',
          indirizzo: documentData.formData.indirizzo || '',
          citta: documentData.formData.citta || '',
          cap: documentData.formData.cap || '',
          provincia: documentData.formData.provincia || ''
        },
        size: documentData.pdfBlob.size,
        type: 'application/pdf',
        filePath: `/documents/${documentData.filename}`,
        tags: documentData.tags || []
      };

      const savedDocument = await collection.insert(document);
      console.log('✅ Documento salvato nel database:', savedDocument.id);
      
      return savedDocument;
    } catch (error) {
      console.error('❌ Errore salvataggio documento:', error);
      throw error;
    }
  }

  // Ottieni tutti i documenti con query reattiva
  async getAllDocuments$() {
    const collection = await this.getDocumentsCollection();
    return collection
      .find()
      .sort({ generatedAt: 'desc' })
      .$;
  }

  // Ottieni tutti i documenti (non reattivo)
  async getAllDocuments() {
    const collection = await this.getDocumentsCollection();
    return await collection
      .find()
      .sort({ generatedAt: 'desc' })
      .exec();
  }

  // Cerca documenti con filtri
  async searchDocuments(filters = {}) {
    const collection = await this.getDocumentsCollection();
    let query = collection.find();

    // Applica filtri
    const selector = {};

    if (filters.nome) {
      selector['userData.nome'] = { $regex: new RegExp(filters.nome, 'i') };
    }

    if (filters.cognome) {
      selector['userData.cognome'] = { $regex: new RegExp(filters.cognome, 'i') };
    }

    if (filters.email) {
      selector['userData.email'] = { $regex: new RegExp(filters.email, 'i') };
    }

    if (filters.dateFrom || filters.dateTo) {
      selector.generatedAt = {};
      if (filters.dateFrom) {
        selector.generatedAt.$gte = new Date(filters.dateFrom).toISOString();
      }
      if (filters.dateTo) {
        const endDate = new Date(filters.dateTo);
        endDate.setHours(23, 59, 59, 999);
        selector.generatedAt.$lte = endDate.toISOString();
      }
    }

    if (Object.keys(selector).length > 0) {
      query = query.where(selector);
    }

    return await query.sort({ generatedAt: 'desc' }).exec();
  }

  // Cerca documenti con query reattiva
  async searchDocuments$(filters = {}) {
    const collection = await this.getDocumentsCollection();
    let query = collection.find();

    const selector = {};

    if (filters.nome) {
      selector['userData.nome'] = { $regex: new RegExp(filters.nome, 'i') };
    }

    if (filters.cognome) {
      selector['userData.cognome'] = { $regex: new RegExp(filters.cognome, 'i') };
    }

    if (filters.email) {
      selector['userData.email'] = { $regex: new RegExp(filters.email, 'i') };
    }

    if (filters.dateFrom || filters.dateTo) {
      selector.generatedAt = {};
      if (filters.dateFrom) {
        selector.generatedAt.$gte = new Date(filters.dateFrom).toISOString();
      }
      if (filters.dateTo) {
        const endDate = new Date(filters.dateTo);
        endDate.setHours(23, 59, 59, 999);
        selector.generatedAt.$lte = endDate.toISOString();
      }
    }

    if (Object.keys(selector).length > 0) {
      query = query.where(selector);
    }

    return query.sort({ generatedAt: 'desc' }).$;
  }

  // Elimina un documento
  async deleteDocument(documentId) {
    try {
      const collection = await this.getDocumentsCollection();
      const document = await collection.findOne(documentId).exec();
      
      if (document) {
        await document.remove();
        console.log('✅ Documento eliminato:', documentId);
        return true;
      } else {
        throw new Error('Documento non trovato');
      }
    } catch (error) {
      console.error('❌ Errore eliminazione documento:', error);
      throw error;
    }
  }

  // Ottieni un documento per ID
  async getDocumentById(documentId) {
    const collection = await this.getDocumentsCollection();
    return await collection.findOne(documentId).exec();
  }

  // Ottieni statistiche documenti
  async getDocumentStats() {
    const allDocs = await this.getAllDocuments();
    const today = new Date();
    const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    return {
      total: allDocs.length,
      today: allDocs.filter(doc => 
        new Date(doc.generatedAt).toDateString() === today.toDateString()
      ).length,
      thisWeek: allDocs.filter(doc => 
        new Date(doc.generatedAt) >= thisWeek
      ).length,
      thisMonth: allDocs.filter(doc => 
        new Date(doc.generatedAt) >= thisMonth
      ).length,
      totalSize: allDocs.reduce((sum, doc) => sum + (doc.size || 0), 0)
    };
  }

  // Genera ID univoco per il documento
  generateDocumentId() {
    return 'doc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Genera nome file basato sui dati utente
  generateFilename(formData) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    const nome = formData.nome.replace(/[^a-zA-Z0-9]/g, '');
    const cognome = formData.cognome.replace(/[^a-zA-Z0-9]/g, '');
    
    return `FederKombat_${nome}_${cognome}_${timestamp}_${Math.random().toString(36).substr(2, 6)}.pdf`;
  }

  // Migra dati da localStorage (se esistenti)
  async migrateFromLocalStorage() {
    try {
      const oldStorageKey = 'asd_generated_documents';
      const oldData = localStorage.getItem(oldStorageKey);
      
      if (oldData) {
        const documents = JSON.parse(oldData);
        const collection = await this.getDocumentsCollection();
        
        console.log(`🔄 Migrazione ${documents.length} documenti da localStorage...`);
        
        for (const doc of documents) {
          // Controlla se il documento esiste già
          const existing = await collection.findOne(doc.id).exec();
          if (!existing) {
            // Adatta la struttura al nuovo schema
            const migratedDoc = {
              ...doc,
              userData: {
                nome: doc.userData.nome || '',
                cognome: doc.userData.cognome || '',
                email: doc.userData.email || '',
                telefono: doc.userData.telefono || '',
                dataNascita: doc.userData.data_nascita || doc.userData.dataNascita || '',
                luogoNascita: doc.userData.luogo_nascita || doc.userData.luogoNascita || '',
                codiceFiscale: doc.userData.codice_fiscale || doc.userData.codiceFiscale || '',
                indirizzo: doc.userData.indirizzo || '',
                citta: doc.userData.citta || '',
                cap: doc.userData.cap || '',
                provincia: doc.userData.provincia || ''
              },
              filePath: doc.filePath || `/documents/${doc.filename}`,
              tags: doc.tags || []
            };
            
            await collection.insert(migratedDoc);
          }
        }
        
        console.log('✅ Migrazione completata, rimuovo dati localStorage');
        localStorage.removeItem(oldStorageKey);
      }
    } catch (error) {
      console.error('❌ Errore durante migrazione:', error);
    }
  }

  // Chiudi il database (cleanup)
  async destroy() {
    if (this.database) {
      await this.database.destroy();
      this.initialized = false;
    }
  }
}

// Crea istanza singleton
const databaseService = new DatabaseService();

export default databaseService;