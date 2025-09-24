// File Storage Service - Gestione archiviazione file per sviluppo e produzione
class FileStorageService {
  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production';
    this.documentsPath = '/documents/';
    this.baseStoragePath = this.isProduction ? './build/documents/' : './public/documents/';
  }

  // Salva un file PDF
  async saveFile(pdfBlob, filename) {
    try {
      if (this.isProduction) {
        return await this.saveFileProduction(pdfBlob, filename);
      } else {
        return await this.saveFileDevelopment(pdfBlob, filename);
      }
    } catch (error) {
      console.error('❌ Errore nel salvataggio del file:', error);
      throw error;
    }
  }

  // Salvataggio in ambiente di sviluppo (public/documents)
  async saveFileDevelopment(pdfBlob, filename) {
    try {
      console.log('📁 [DEV] Salvataggio file in sviluppo:', {
        filename,
        size: pdfBlob.size
      });

      // PROBLEMA RISOLTO: In sviluppo, salva sempre in localStorage
      // perché getFileDevelopment cerca sempre lì
      console.log('📁 [DEV] Salvataggio in localStorage per sviluppo');
      return await this.saveToLocalStorage(pdfBlob, filename);
      
    } catch (error) {
      console.error('❌ Errore salvataggio sviluppo:', error);
      throw error;
    }
  }

  // Salvataggio in ambiente di produzione
  async saveFileProduction(pdfBlob, filename) {
    try {
      // In produzione, invii il file al server
      const formData = new FormData();
      formData.append('file', pdfBlob, filename);
      formData.append('path', 'documents/');

      const response = await fetch('/api/upload-document', {
        method: 'POST',
        body: formData,
        headers: {
          'X-Requested-With': 'XMLHttpRequest'
        }
      });

      if (!response.ok) {
        throw new Error(`Errore server: ${response.status}`);
      }

      const result = await response.json();
      
      console.log('📁 [PROD] File salvato su server:', result);
      
      return {
        success: true,
        path: result.path || `/documents/${filename}`,
        url: result.url || `/documents/${filename}`,
        size: pdfBlob.size
      };
    } catch (error) {
      // Fallback per la produzione se il server non è disponibile
      console.warn('⚠️ Server non disponibile, uso storage locale');
      return await this.saveToLocalStorage(pdfBlob, filename);
    }
  }

  // Fallback: salvataggio in localStorage come ArrayBuffer
  async saveToLocalStorage(pdfBlob, filename) {
    try {
      console.log('📊 saveToLocalStorage - Blob originale:', pdfBlob.size, 'bytes');
      
      const arrayBuffer = await pdfBlob.arrayBuffer();
      console.log('📊 saveToLocalStorage - ArrayBuffer:', arrayBuffer.byteLength, 'bytes');
      
      const uint8Array = new Uint8Array(arrayBuffer);
      console.log('📊 saveToLocalStorage - Uint8Array:', uint8Array.length, 'bytes');
      
      // Converti in array normale per il salvataggio
      const dataArray = Array.from(uint8Array);
      console.log('📊 saveToLocalStorage - DataArray:', dataArray.length, 'elementi');
      const storageKey = `pdf_file_${filename}`;
      
      // Salva i metadati e i dati separatamente
      const fileData = {
        data: dataArray,
        size: pdfBlob.size,
        type: pdfBlob.type || 'application/pdf',
        timestamp: new Date().toISOString()
      };
      
      // Controlla la dimensione prima del salvataggio
      const serializedData = JSON.stringify(fileData);
      console.log('📊 saveToLocalStorage - Dati serializzati:', serializedData.length, 'caratteri');
      
      if (serializedData.length < 5 * 1024 * 1024) { // Limite 5MB
        localStorage.setItem(storageKey, serializedData);
        
        // Verifica immediatamente che il salvataggio sia avvenuto correttamente
        const verification = localStorage.getItem(storageKey);
        if (verification) {
          const verificationData = JSON.parse(verification);
          console.log('📊 saveToLocalStorage - Verifica salvataggio:', {
            originalSize: fileData.data.length,
            savedSize: verificationData.data.length,
            match: fileData.data.length === verificationData.data.length
          });
        } else {
          console.error('❌ saveToLocalStorage - Salvataggio fallito: dati non trovati dopo il save');
        }
        
        // Crea un Object URL temporaneo per il PDF
        const blob = new Blob([uint8Array], { type: 'application/pdf' });
        const objectUrl = URL.createObjectURL(blob);
        
        return {
          success: true,
          path: `/documents/${filename}`,
          url: objectUrl,
          size: pdfBlob.size,
          storage: 'localStorage',
          filename: filename
        };
      } else {
        throw new Error('File troppo grande per localStorage');
      }
    } catch (error) {
      console.error('❌ Errore salvataggio localStorage:', error);
      throw error;
    }
  }

  // Recupera un file salvato
  async getFile(filename) {
    try {
      if (this.isProduction) {
        return await this.getFileProduction(filename);
      } else {
        return await this.getFileDevelopment(filename);
      }
    } catch (error) {
      console.error('❌ Errore recupero file:', error);
      return null;
    }
  }

    // Recupero file in sviluppo
  async getFileDevelopment(filename) {
    try {
      // 1. Controlla se il file esiste nella cartella pubblica
      const publicPath = `/documents/${filename}`;
      
      try {
        const response = await fetch(publicPath, { method: 'HEAD' });
        if (response.ok) {
          // Verifica anche la dimensione del file pubblico per evitare file HTML corrotti
          const contentLength = response.headers.get('content-length');
          const contentType = response.headers.get('content-type');
          
          console.log('📁 File trovato nella cartella pubblica:', publicPath, {
            size: contentLength,
            type: contentType
          });
          
          // Se il file è troppo piccolo o è HTML, ignora e usa localStorage
          if (contentLength && parseInt(contentLength) < 10000) {
            console.log('⚠️ File pubblico troppo piccolo, probabile HTML - uso localStorage');
          } else if (contentType && (contentType.includes('text/html') || contentType.includes('text/plain'))) {
            console.log('⚠️ File pubblico è HTML/text - uso localStorage');
          } else {
            console.log('✅ File pubblico valido, utilizzo file pubblico');
            return {
              success: true,
              url: publicPath,
              storage: 'public',
              filename
            };
          }
        }
      } catch (fetchError) {
        console.log('📁 File non trovato in public, controllo localStorage...');
      }
      
      // 2. Se non esiste in public, cerca in localStorage
      const storageKey = `pdf_file_${filename}`;
      const storedData = localStorage.getItem(storageKey);
      
      if (!storedData) {
        console.error('❌ File non trovato né in public né in localStorage');
        return { success: false, error: 'File non trovato' };
      }
      
      console.log('📊 getFileDevelopment - Dati recuperati da localStorage:', storedData.length, 'caratteri');
      console.log('📊 getFileDevelopment - Primi 100 caratteri:', storedData.substring(0, 100));
      console.log('📊 getFileDevelopment - Ultimi 100 caratteri:', storedData.substring(storedData.length - 100));
      
      // 3. Ricostruisci il blob dai dati salvati
      let fileData;
      try {
        fileData = JSON.parse(storedData);
        console.log('📊 getFileDevelopment - JSON.parse riuscito');
      } catch (parseError) {
        console.error('❌ Errore JSON.parse:', parseError);
        console.log('📊 getFileDevelopment - StoredData type:', typeof storedData);
        return { success: false, error: 'Dati corrotti - errore parsing JSON' };
      }
      
      console.log('📊 getFileDevelopment - FileData parsed:', {
        hasData: !!fileData.data,
        dataLength: fileData.data ? fileData.data.length : 0,
        originalSize: fileData.originalSize,
        mimeType: fileData.mimeType,
        dataType: fileData.data ? typeof fileData.data : 'undefined',
        isArray: fileData.data ? Array.isArray(fileData.data) : false
      });
      
      if (!fileData.data || !Array.isArray(fileData.data)) {
        console.error('❌ Dati non validi - data mancante o non è array');
        return { success: false, error: 'Dati corrotti - data non valida' };
      }
      
      // Primi e ultimi 10 bytes per debugging
      const dataArray = fileData.data;
      console.log('📊 getFileDevelopment - Primi 10 bytes:', dataArray.slice(0, 10));
      console.log('📊 getFileDevelopment - Ultimi 10 bytes:', dataArray.slice(-10));
      console.log('📊 getFileDevelopment - Dimensione dataArray:', dataArray.length);
      
      const uint8Array = new Uint8Array(dataArray);
      console.log('📊 getFileDevelopment - Uint8Array ricostruito:', uint8Array.length, 'bytes');
      
      const blob = new Blob([uint8Array], { type: fileData.mimeType });
      console.log('📊 getFileDevelopment - Blob finale:', blob.size, 'bytes');
      
      // Verifica integrità confrontando dimensioni
      const expectedSize = fileData.originalSize || dataArray.length;
      if (blob.size !== expectedSize) {
        console.error('⚠️ Mismatch dimensioni!', {
          expected: expectedSize,
          actual: blob.size,
          dataArrayLength: dataArray.length,
          uint8ArrayLength: uint8Array.length
        });
      }
      
      const url = URL.createObjectURL(blob);
      
      return {
        success: true,
        url,
        storage: 'localStorage',
        filename,
        blob,
        size: blob.size
      };
      
    } catch (error) {
      console.error('❌ Errore nel recupero file development:', error);
      return { success: false, error: error.message };
    }
  }

  // Recupero file in produzione
  async getFileProduction(filename) {
    try {
      const response = await fetch(`/api/get-document/${filename}`);
      
      if (response.ok) {
        const blob = await response.blob();
        
        // Verifica se il contenuto è effettivamente un PDF o HTML/errore
        console.log('📊 [PROD] Server response:', {
          status: response.status,
          contentType: response.headers.get('content-type'),
          blobSize: blob.size,
          blobType: blob.type
        });
        
        // Se il blob è troppo piccolo o è HTML, usa fallback
        if (blob.size < 10000 || blob.type.includes('text/html') || blob.type.includes('text/plain')) {
          console.log('⚠️ [PROD] Server ha restituito contenuto non-PDF, uso fallback localStorage');
          const fallbackResult = await this.getFileDevelopment(filename);
          
          if (fallbackResult && fallbackResult.success) {
            console.log('✅ [PROD] Fallback localStorage riuscito:', fallbackResult.storage);
            return fallbackResult;
          }
          
          return { success: false, error: 'File non trovato né sul server né in localStorage' };
        }
        
        const url = URL.createObjectURL(blob);
        
        return {
          success: true,
          url: url,
          storage: 'server',
          filename: filename,
          blob: blob
        };
      } else {
        // Fallback a localStorage - mantieni il risultato originale
        console.log('📁 [PROD] Server API non disponibile, fallback a localStorage');
        const fallbackResult = await this.getFileDevelopment(filename);
        
        // Se il fallback funziona, restituisci il risultato senza modificare il storage type
        if (fallbackResult && fallbackResult.success) {
          console.log('✅ [PROD] Fallback localStorage riuscito:', fallbackResult.storage);
          return fallbackResult;
        }
        
        return { success: false, error: 'File non trovato né sul server né in localStorage' };
      }
    } catch (error) {
      console.warn('⚠️ Server non raggiungibile, uso fallback localStorage');
      const fallbackResult = await this.getFileDevelopment(filename);
      
      // Se il fallback funziona, restituisci il risultato senza modificare il storage type  
      if (fallbackResult && fallbackResult.success) {
        console.log('✅ [PROD] Fallback localStorage riuscito:', fallbackResult.storage);
        return fallbackResult;
      }
      
      return { success: false, error: 'File non trovato né sul server né in localStorage' };
    }
  }

  // Elimina un file
  async deleteFile(filename) {
    try {
      if (this.isProduction) {
        await this.deleteFileProduction(filename);
      }
      
      // Rimuovi sempre da localStorage se presente
      const storageKey = `pdf_file_${filename}`;
      localStorage.removeItem(storageKey);
      
      return true;
    } catch (error) {
      console.error('❌ Errore eliminazione file:', error);
      return false;
    }
  }

  // Eliminazione file in produzione
  async deleteFileProduction(filename) {
    try {
      const response = await fetch(`/api/delete-document/${filename}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        console.warn('⚠️ Impossibile eliminare file dal server');
      }
      
      return response.ok;
    } catch (error) {
      console.warn('⚠️ Errore eliminazione file dal server:', error);
      return false;
    }
  }

  // Ottieni informazioni sullo storage
  getStorageInfo() {
    return {
      isProduction: this.isProduction,
      documentsPath: this.documentsPath,
      baseStoragePath: this.baseStoragePath,
      localStorageUsage: this.getLocalStorageUsage()
    };
  }

    // Verifica i limiti e lo stato di localStorage
  checkLocalStorageLimits() {
    try {
      const usage = this.getLocalStorageUsage();
      
      // Stima del limite (tipicamente 5-10 MB)
      const estimatedLimit = 10 * 1024 * 1024; // 10 MB
      const percentageUsed = usage.totalSizeBytes > 0 ? (usage.totalSizeBytes / estimatedLimit) * 100 : 0;
      
      console.log('📊 localStorage Limits Check:', {
        totalFiles: usage.totalFiles,
        totalSizeBytes: usage.totalSizeBytes,
        totalSizeMB: usage.totalSizeBytes / (1024 * 1024),
        estimatedLimitMB: estimatedLimit / (1024 * 1024),
        percentageUsed: percentageUsed.toFixed(2) + '%'
      });
      
      return {
        totalFiles: usage.totalFiles,
        totalSizeBytes: usage.totalSizeBytes,
        totalSizeMB: (usage.totalSizeBytes / (1024 * 1024)).toFixed(2),
        estimatedLimitMB: (estimatedLimit / (1024 * 1024)).toFixed(2),
        percentageUsed: percentageUsed.toFixed(2),
        isNearLimit: percentageUsed > 80,
        isOverLimit: percentageUsed > 100
      };
    } catch (error) {
      console.error('❌ Errore nel controllo limiti localStorage:', error);
      return {
        error: error.message,
        totalFiles: 0,
        totalSizeBytes: 0,
        totalSizeMB: "0.00",
        estimatedLimitMB: "10.00",
        percentageUsed: "0.00"
      };
    }
  }

  // Calcola l'uso del localStorage per i PDF
  getLocalStorageUsage() {
    try {
      let totalFiles = 0;
      let totalSizeBytes = 0;
      const fileDetails = [];
      
      console.log('📊 getLocalStorageUsage - Analisi localStorage...');
      console.log('📊 localStorage.length:', localStorage.length);
      
      // Controlla sia pdf_ che pdf_file_ per compatibilità
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        console.log('📊 Key trovata:', key);
        
        if (key && (key.startsWith('pdf_') || key.startsWith('pdf_file_'))) {
          console.log('📊 Analizzando file PDF:', key);
          const value = localStorage.getItem(key);
          if (value) {
            const sizeBytes = new Blob([value]).size;
            console.log('📊 Dimensione raw:', sizeBytes, 'bytes per', key);
            
            totalFiles++;
            totalSizeBytes += sizeBytes;
            
            // Analisi del file per detecting corruzione
            try {
              const fileData = JSON.parse(value);
              const isCorrupted = !fileData.data || !Array.isArray(fileData.data) || fileData.data.length === 0;
              
              console.log('📊 Analisi file:', {
                key,
                hasData: !!fileData.data,
                isArray: Array.isArray(fileData.data),
                dataLength: fileData.data ? fileData.data.length : 0,
                originalSize: fileData.originalSize,
                isCorrupted
              });
              
              fileDetails.push({
                key,
                sizeKB: (sizeBytes / 1024).toFixed(2),
                originalSize: fileData.originalSize || 'unknown',
                isCorrupted,
                dataLength: fileData.data ? fileData.data.length : 0
              });
            } catch (parseError) {
              console.error('❌ Errore parsing file:', key, parseError);
              fileDetails.push({
                key,
                sizeKB: (sizeBytes / 1024).toFixed(2),
                originalSize: 'parse_error',
                isCorrupted: true,
                dataLength: 0,
                parseError: parseError.message
              });
            }
          } else {
            console.log('❌ Valore vuoto per key:', key);
          }
        }
      }
      
      console.log('📊 Totale analisi:', {
        totalFiles,
        totalSizeBytes,
        totalSizeKB: (totalSizeBytes / 1024).toFixed(2)
      });
      
      return {
        totalFiles,
        totalSizeBytes,
        fileDetails
      };
    } catch (error) {
      console.error('❌ Errore nel calcolo uso localStorage:', error);
      return { totalFiles: 0, totalSizeBytes: 0, fileDetails: [] };
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

  // Prepara la build per la produzione
  async prepareBuild() {
    console.log('🔄 Preparazione file per build di produzione...');
    
    const storageInfo = this.getLocalStorageUsage();
    console.log('📊 File in localStorage:', storageInfo);
    
    // In un ambiente reale, qui copieresti i file da localStorage
    // alla cartella build/documents/ prima del build
    
    return storageInfo;
  }

  // Cleanup dei file temporanei
  cleanup() {
    // Revoca tutti gli URL blob temporanei
    // In un'implementazione completa, terresti traccia degli URL creati
    console.log('🧹 Cleanup file temporanei completato');
  }
}

// Crea istanza singleton
const fileStorageService = new FileStorageService();

export default fileStorageService;