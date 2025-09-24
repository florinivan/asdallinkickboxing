import React, { useState, useEffect, useCallback } from 'react';
import documentManager from '../services/documentManager';
import fileStorageService from '../services/fileStorageService';
import './BackOffice.css';

function BackOffice() {
  const [documents, setDocuments] = useState([]);
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  const [stats, setStats] = useState({});
  const [filters, setFilters] = useState({
    nome: '',
    cognome: '',
    email: '',
    dateFrom: '',
    dateTo: ''
  });
  const [sortBy, setSortBy] = useState('generatedAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [documentsSubscription, setDocumentsSubscription] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Password semplice per il backoffice (in produzione usare autenticazione vera)
  const ADMIN_PASSWORD = 'admin2024';

  // Carica statistiche (senza dipendenze problematiche)
  const loadStats = useCallback(async () => {
    try {
      const documentStats = await documentManager.getDocumentStats();
      setStats(documentStats);
    } catch (error) {
      console.error('❌ Errore caricamento statistiche:', error);
      setStats({
        total: 0,
        today: 0,
        thisWeek: 0,
        thisMonth: 0,
        totalSize: 0
      });
    }
  }, []);

  // Carica documenti tradizionale (fallback)
  const loadDocuments = useCallback(async () => {
    try {
      const allDocs = await documentManager.getAllDocuments();
      setDocuments(allDocs);
    } catch (error) {
      console.error('❌ Errore caricamento documenti:', error);
      setDocuments([]);
    }
  }, []);

  // Inizializza query reattive RxDB (chiamata una sola volta)
  const initializeReactiveQueries = useCallback(async () => {
    if (isInitialized) {
      console.log('⚠️ Inizializzazione già avvenuta, skip...');
      return;
    }
    
    try {
      console.log('🔄 Inizializzazione query reattive...');
      setIsInitialized(true);
      
      // Sottoscrivi ai cambiamenti dei documenti
      const documents$ = await documentManager.getAllDocuments$();
      if (documents$) {
        const subscription = documents$.subscribe({
          next: (docs) => {
            console.log('🔄 Documenti aggiornati:', docs.length);
            setDocuments(docs);
          },
          error: (error) => {
            console.error('❌ Errore subscription documenti:', error);
            loadDocuments();
          }
        });
        setDocumentsSubscription(subscription);
      } else {
        await loadDocuments();
      }
      
      // Carica statistiche iniziali
      await loadStats();
      
    } catch (error) {
      console.error('❌ Errore inizializzazione query reattive:', error);
      setIsInitialized(false);
      await loadDocuments();
      await loadStats();
    }
  }, [isInitialized, loadDocuments, loadStats]);



  const applyFiltersAndSort = useCallback(async () => {
    try {
      let filtered = await documentManager.searchDocuments(filters);
      
      // Applica ordinamento
      filtered.sort((a, b) => {
        let aValue, bValue;
        
        switch (sortBy) {
          case 'generatedAt':
            aValue = new Date(a.generatedAt);
            bValue = new Date(b.generatedAt);
            break;
          case 'userData.nome':
            aValue = a.userData.nome.toLowerCase();
            bValue = b.userData.nome.toLowerCase();
            break;
          case 'userData.cognome':
            aValue = a.userData.cognome.toLowerCase();
            bValue = b.userData.cognome.toLowerCase();
            break;
          case 'size':
            aValue = a.size || 0;
            bValue = b.size || 0;
            break;
          default:
            aValue = a[sortBy];
            bValue = b[sortBy];
        }
        
        if (sortOrder === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });
      
      setFilteredDocuments(filtered);
    } catch (error) {
      console.error('❌ Errore filtri e ordinamento:', error);
      setFilteredDocuments([]);
    }
  }, [filters, sortBy, sortOrder]);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const handleDeleteDocument = async (documentId) => {
    if (window.confirm('Sei sicuro di voler eliminare questo documento?')) {
      try {
        // Ottieni info del documento prima di eliminarlo
        const doc = await documentManager.getDocumentById(documentId);
        
        // Elimina dal database
        await documentManager.deleteDocument(documentId);
        
        // Elimina il file fisico
        if (doc && doc.filename) {
          await documentManager.deleteDocumentFile(doc.filename);
        }
        
        // Ricarica statistiche (i documenti si aggiorneranno automaticamente con RxDB)
        await loadStats();
        
        console.log('✅ Documento eliminato completamente');
      } catch (error) {
        console.error('❌ Errore eliminazione documento:', error);
        alert('Errore nell\'eliminazione del documento');
      }
    }
  };

  const handleDownloadDocument = async (doc) => {
    try {
      console.log('🔽 Avvio download per:', doc.filename);
      
      // Ottieni il file usando FileStorageService
      const fileResult = await documentManager.getDocumentFile(doc.filename);
      console.log('📊 File result dettagliato:', fileResult);
      
      // Log dimensione file recuperato
      if (fileResult && fileResult.blob) {
        console.log('📊 handleDownloadDocument - File recuperato:', fileResult.blob.size, 'bytes');
      }
      
      if (!fileResult || !fileResult.success) {
        throw new Error(fileResult?.error || 'File non trovato o corrotto');
      }
      
      let downloadUrl = fileResult.url;
      let shouldCleanupUrl = false;
      
      // Se abbiamo un blob, crea un nuovo Object URL per essere sicuri
      if (fileResult.blob) {
        console.log('💾 Uso blob per download sicuro');
        downloadUrl = URL.createObjectURL(fileResult.blob);
        shouldCleanupUrl = true;
      } else if (fileResult.storage === 'public') {
        // Per i file pubblici, verifichiamo prima che esistano
        console.log('📁 Verifica file pubblico:', downloadUrl);
        try {
          const testResponse = await fetch(downloadUrl, { method: 'HEAD' });
          if (!testResponse.ok) {
            throw new Error('File pubblico non accessibile');
          }
        } catch (testError) {
          throw new Error(`File non accessibile: ${testError.message}`);
        }
      }
      
      // Crea un link temporaneo per il download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = doc.filename;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Cleanup dell'URL temporaneo dopo un delay
      if (shouldCleanupUrl) {
        setTimeout(() => {
          URL.revokeObjectURL(downloadUrl);
          console.log('🧹 Cleanup URL temporaneo completato');
        }, 1000);
      }
      
      console.log('✅ Download avviato per:', doc.filename);
    } catch (error) {
      console.error('❌ Errore download documento:', error);
      alert(`Errore nel download del documento: ${error.message}\n\nIl file potrebbe essere stato eliminato o corrotto.`);
    }
  };

  const handleViewDetails = (doc) => {
    const details = `
Dettagli Documento:

Nome: ${doc.userData.nome}
Cognome: ${doc.userData.cognome}
Email: ${doc.userData.email}
Telefono: ${doc.userData.telefono}
Data di Nascita: ${doc.userData.dataNascita}
Luogo di Nascita: ${doc.userData.luogoNascita}
Codice Fiscale: ${doc.userData.codiceFiscale}
Indirizzo: ${doc.userData.indirizzo}
Città: ${doc.userData.citta}
CAP: ${doc.userData.cap}
Provincia: ${doc.userData.provincia}

File: ${doc.filename}
Dimensione: ${documentManager.formatFileSize(doc.size)}
Generato: ${documentManager.formatDate(doc.generatedAt)}
ID Documento: ${doc.id}
    `.trim();

    alert(details);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setPassword('');
    } else {
      alert('Password non corretta');
    }
  };

  const handleDebugStorage = () => {
    console.log('🔍 === INIZIO DEBUG STORAGE ===');
    
    // Ottieni informazioni dettagliate sui file salvati
    const limits = fileStorageService.checkLocalStorageLimits();
    const usage = fileStorageService.getLocalStorageUsage();
    
    console.log('🔍 Storage Limits:', limits);
    console.log('� Storage Usage:', usage);
    
    // Controlla tutte le chiavi localStorage
    console.log('🔍 Tutte le chiavi localStorage:');
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      console.log(`   ${i}: ${key}`);
      
      // Analizza specificamente i file PDF
      if (key && key.startsWith('pdf_')) {
        const data = localStorage.getItem(key);
        const filename = key.replace('pdf_', '');
        
        console.log(`📄 Analisi ${filename}:`);
        console.log(`   Raw data length: ${data ? data.length : 'null'} caratteri`);
        
        if (data) {
          try {
            const fileData = JSON.parse(data);
            console.log(`   Parsed data:`, {
              hasData: !!fileData.data,
              isArray: Array.isArray(fileData.data),
              dataLength: fileData.data?.length || 0,
              originalSize: fileData.originalSize,
              mimeType: fileData.mimeType,
              timestamp: fileData.timestamp
            });
            
            // Verifica integrità dei primi e ultimi bytes
            if (fileData.data && Array.isArray(fileData.data)) {
              console.log(`   🔍 Primi 10 bytes:`, fileData.data.slice(0, 10));
              console.log(`   🔍 Ultimi 10 bytes:`, fileData.data.slice(-10));
            }
          } catch (e) {
            console.log(`   ❌ Errore parsing JSON:`, e.message);
          }
        }
      }
    }
    
    let alertMessage = `Debug localStorage completato:\n\n`;
    alertMessage += `File PDF: ${usage.totalFiles}\n`;
    alertMessage += `Dimensione totale: ${(usage.totalSizeBytes / 1024).toFixed(2)} KB\n\n`;
    alertMessage += `Spazio utilizzato: ${limits.totalSizeMB} MB\n`;
    alertMessage += `Percentuale: ${limits.percentageUsed}%\n\n`;
    
    if (usage.fileDetails && usage.fileDetails.length > 0) {
      alertMessage += `Dettagli file:\n`;
      usage.fileDetails.forEach(file => {
        if (file.parseError) {
          alertMessage += `❌ ${file.key}: ERRORE - ${file.parseError}\n`;
        } else {
          const status = file.isCorrupted ? 'CORROTTO' : 'OK';
          alertMessage += `📄 ${file.key}: ${file.sizeKB} KB (${status})\n`;
          alertMessage += `   Data length: ${file.dataLength}, Original: ${file.originalSize}\n`;
        }
      });
    } else {
      alertMessage += `❌ Nessun file PDF trovato nel localStorage\n`;
    }
    
    if (limits.isNearLimit) {
      alertMessage += `\n⚠️ ATTENZIONE: Vicino al limite storage!`;
    }
    
    alertMessage += `\nVedi console per dettagli completi.`;
    
    console.log('� === FINE DEBUG STORAGE ===');
    alert(alertMessage);
  };

  const handleLogout = () => {
    // Cleanup subscription prima del logout
    if (documentsSubscription) {
      documentsSubscription.unsubscribe();
      setDocumentsSubscription(null);
    }
    
    setIsAuthenticated(false);
    setIsInitialized(false);
    setDocuments([]);
    setFilteredDocuments([]);
    setStats({});
  };

  const getSortIcon = (field) => {
    if (sortBy !== field) return 'fas fa-sort';
    return sortOrder === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down';
  };

  // Effect per inizializzazione quando si è autenticati
  useEffect(() => {
    if (isAuthenticated && !isInitialized) {
      initializeReactiveQueries();
    }
  }, [isAuthenticated, isInitialized, initializeReactiveQueries]);

  // Effect per applicare filtri quando i documenti cambiano
  useEffect(() => {
    if (isAuthenticated && documents.length >= 0) {
      applyFiltersAndSort();
    }
  }, [documents, isAuthenticated, applyFiltersAndSort]);

  // Cleanup al dismount del componente
  useEffect(() => {
    return () => {
      if (documentsSubscription) {
        documentsSubscription.unsubscribe();
      }
    };
  }, [documentsSubscription]);

  // Schermata di login
  if (!isAuthenticated) {
    return (
      <div className="backoffice-container">
        <div className="login-card">
          <div className="login-header">
            <h2>
              <i className="fas fa-shield-alt"></i>
              Accesso BackOffice
            </h2>
            <p>Inserisci la password per accedere al pannello di amministrazione</p>
          </div>
          
          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <label>
                <i className="fas fa-lock"></i>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Inserisci password admin"
                required
                autoFocus
              />
            </div>
            
            <button type="submit" className="btn btn-primary btn-login">
              <i className="fas fa-sign-in-alt"></i>
              Accedi
            </button>
          </form>
          
          <div className="login-info">
            <p><i className="fas fa-info-circle"></i> Area riservata agli amministratori</p>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard principale
  return (
    <div className="backoffice-container">
      {/* Header */}
      <div className="backoffice-header">
        <div className="header-content">
          <h1>
            <i className="fas fa-cogs"></i>
            BackOffice - Gestione Documenti
          </h1>
          <div className="header-actions">
            <button onClick={handleDebugStorage} className="btn btn-warning btn-sm" title="Debug localStorage">
              <i className="fas fa-bug"></i>
              Debug Storage
            </button>
            <button onClick={handleLogout} className="btn btn-secondary btn-logout">
              <i className="fas fa-sign-out-alt"></i>
              Esci
            </button>
          </div>
        </div>
      </div>

      {/* Statistiche */}
      <div className="stats-section">
        <h2>
          <i className="fas fa-chart-bar"></i>
          Statistiche Documenti
        </h2>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">
              <i className="fas fa-file-pdf"></i>
            </div>
            <div className="stat-content">
              <h3>{stats.total}</h3>
              <p>Totale Documenti</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon today">
              <i className="fas fa-calendar-day"></i>
            </div>
            <div className="stat-content">
              <h3>{stats.today}</h3>
              <p>Oggi</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon week">
              <i className="fas fa-calendar-week"></i>
            </div>
            <div className="stat-content">
              <h3>{stats.thisWeek}</h3>
              <p>Questa Settimana</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon month">
              <i className="fas fa-calendar-alt"></i>
            </div>
            <div className="stat-content">
              <h3>{stats.thisMonth}</h3>
              <p>Questo Mese</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon size">
              <i className="fas fa-hdd"></i>
            </div>
            <div className="stat-content">
              <h3>{documentManager.formatFileSize(stats.totalSize)}</h3>
              <p>Spazio Utilizzato</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtri e Ricerca */}
      <div className="filters-section">
        <h2>
          <i className="fas fa-filter"></i>
          Filtri e Ricerca
        </h2>
        
        <div className="filters-grid">
          <div className="filter-group">
            <label>Nome</label>
            <input
              type="text"
              value={filters.nome}
              onChange={(e) => handleFilterChange('nome', e.target.value)}
              placeholder="Cerca per nome"
            />
          </div>
          
          <div className="filter-group">
            <label>Cognome</label>
            <input
              type="text"
              value={filters.cognome}
              onChange={(e) => handleFilterChange('cognome', e.target.value)}
              placeholder="Cerca per cognome"
            />
          </div>
          
          <div className="filter-group">
            <label>Email</label>
            <input
              type="email"
              value={filters.email}
              onChange={(e) => handleFilterChange('email', e.target.value)}
              placeholder="Cerca per email"
            />
          </div>
          
          <div className="filter-group">
            <label>Data Da</label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
            />
          </div>
          
          <div className="filter-group">
            <label>Data A</label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
            />
          </div>
          
          <div className="filter-actions">
            <button 
              onClick={() => setFilters({ nome: '', cognome: '', email: '', dateFrom: '', dateTo: '' })}
              className="btn btn-secondary"
            >
              <i className="fas fa-eraser"></i>
              Pulisci Filtri
            </button>
          </div>
        </div>
      </div>

      {/* Tabella Documenti */}
      <div className="documents-section">
        <h2>
          <i className="fas fa-table"></i>
          Documenti Generati ({filteredDocuments.length})
        </h2>
        
        <div className="table-container">
          <table className="documents-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('generatedAt')} className="sortable">
                  <i className={getSortIcon('generatedAt')}></i>
                  Data Generazione
                </th>
                <th onClick={() => handleSort('userData.nome')} className="sortable">
                  <i className={getSortIcon('userData.nome')}></i>
                  Nome
                </th>
                <th onClick={() => handleSort('userData.cognome')} className="sortable">
                  <i className={getSortIcon('userData.cognome')}></i>
                  Cognome
                </th>
                <th>Email</th>
                <th>Telefono</th>
                <th onClick={() => handleSort('size')} className="sortable">
                  <i className={getSortIcon('size')}></i>
                  Dimensione
                </th>
                <th>Azioni</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocuments.length > 0 ? (
                filteredDocuments.map(doc => (
                  <tr key={doc.id}>
                    <td>{documentManager.formatDate(doc.generatedAt)}</td>
                    <td>{doc.userData.nome}</td>
                    <td>{doc.userData.cognome}</td>
                    <td>{doc.userData.email}</td>
                    <td>{doc.userData.telefono}</td>
                    <td>{documentManager.formatFileSize(doc.size)}</td>
                    <td>
                      <div className="actions">
                        <button 
                          className="btn btn-info btn-sm"
                          title="Visualizza dettagli"
                          onClick={() => handleViewDetails(doc)}
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                        <button 
                          className="btn btn-success btn-sm"
                          title="Scarica documento"
                          onClick={() => handleDownloadDocument(doc)}
                        >
                          <i className="fas fa-download"></i>
                        </button>
                        <button 
                          className="btn btn-danger btn-sm"
                          title="Elimina documento"
                          onClick={() => handleDeleteDocument(doc.id)}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="no-documents">
                    <i className="fas fa-inbox"></i>
                    <p>Nessun documento trovato con i filtri selezionati</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default BackOffice;