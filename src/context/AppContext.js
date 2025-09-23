import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Stato iniziale
const initialState = {
  // PDF configuration
  pdfFile: 'FKvedasipolicyprivacyperidettagli_compressed_organized.pdf',
  pdfUrl: '/FKvedasipolicyprivacyperidettagli_compressed_organized.pdf',
  currentPage: 1,
  totalPages: 0,
  scale: 1.2,
  
  // Form data - expanded for more complete form
  formData: {
    nome: '',
    cognome: '',
    data_nascita: '',
    luogo_nascita: '',
    codice_fiscale: '',
    indirizzo: '',
    citta: '',
    cap: '',
    telefono: '',
    email: '',
    genitore1_nome: '',
    genitore1_cognome: '',
    genitore1_telefono: '',
    genitore2_nome: '',
    genitore2_cognome: '',
    genitore2_telefono: '',
    contatto_emergenza: '',
    telefono_emergenza: '',
    note: '',
    
    // Consensi per le pagine 4-6
    marketing_consent: null, // true = acconsento, false = non acconsento, null = non scelto
    data_consent: null, // true = acconsento, false = non acconsento, null = non scelto
    image_consent: true, // Per pagina 4 - autorizzazione immagine (sempre true se compila il form)
    
    // Firma digitale
    signature: '' // Base64 dell'immagine della firma
  },
  
  // UI state
  message: { text: '', type: '' },
  isLoading: false,
  errors: {},
  showPdfViewer: true,
  isFormValid: false,
  
  // Download state
  isGenerating: false,
  downloadUrl: null
};

// Azioni
const actionTypes = {
  SET_FORM_DATA: 'SET_FORM_DATA',
  SET_MESSAGE: 'SET_MESSAGE',
  CLEAR_MESSAGE: 'CLEAR_MESSAGE',
  SET_LOADING: 'SET_LOADING',
  SET_ERRORS: 'SET_ERRORS',
  CLEAR_ERRORS: 'CLEAR_ERRORS',
  RESET_FORM: 'RESET_FORM',
  LOAD_SAVED_DATA: 'LOAD_SAVED_DATA',
  // New PDF viewer actions
  SET_CURRENT_PAGE: 'SET_CURRENT_PAGE',
  SET_TOTAL_PAGES: 'SET_TOTAL_PAGES',
  SET_SCALE: 'SET_SCALE',
  TOGGLE_PDF_VIEWER: 'TOGGLE_PDF_VIEWER',
  SET_FORM_VALID: 'SET_FORM_VALID',
  SET_GENERATING: 'SET_GENERATING',
  SET_DOWNLOAD_URL: 'SET_DOWNLOAD_URL'
};

// Reducer
function appReducer(state, action) {
  switch (action.type) {
    case actionTypes.SET_FORM_DATA:
      return {
        ...state,
        formData: {
          ...state.formData,
          [action.field]: action.value
        }
      };
    
    case actionTypes.SET_MESSAGE:
      return {
        ...state,
        message: { text: action.text, type: action.messageType }
      };
    
    case actionTypes.CLEAR_MESSAGE:
      return {
        ...state,
        message: { text: '', type: '' }
      };
    
    case actionTypes.SET_LOADING:
      return {
        ...state,
        isLoading: action.loading
      };
    
    case actionTypes.SET_ERRORS:
      return {
        ...state,
        errors: { ...state.errors, ...action.errors }
      };
    
    case actionTypes.CLEAR_ERRORS:
      return {
        ...state,
        errors: {}
      };
    
    case actionTypes.RESET_FORM:
      return {
        ...state,
        formData: initialState.formData,
        errors: {}
      };
    
    case actionTypes.LOAD_SAVED_DATA:
      return {
        ...state,
        formData: { ...state.formData, ...action.data }
      };
    
    // New PDF viewer cases
    case actionTypes.SET_CURRENT_PAGE:
      return {
        ...state,
        currentPage: action.page
      };
    
    case actionTypes.SET_TOTAL_PAGES:
      return {
        ...state,
        totalPages: action.total
      };
    
    case actionTypes.SET_SCALE:
      return {
        ...state,
        scale: action.scale
      };
    
    case actionTypes.TOGGLE_PDF_VIEWER:
      return {
        ...state,
        showPdfViewer: !state.showPdfViewer
      };
    
    case actionTypes.SET_FORM_VALID:
      return {
        ...state,
        isFormValid: action.valid
      };
    
    case actionTypes.SET_GENERATING:
      return {
        ...state,
        isGenerating: action.generating
      };
    
    case actionTypes.SET_DOWNLOAD_URL:
      return {
        ...state,
        downloadUrl: action.url
      };
    
    default:
      return state;
  }
}

// Context
const AppContext = createContext();

// Provider
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Carica dati salvati dal localStorage al mount
  useEffect(() => {
    const savedData = {};
    Object.keys(initialState.formData).forEach(key => {
      const saved = localStorage.getItem(`pdf_form_${key}`);
      if (saved) {
        savedData[key] = saved;
      }
    });
    
    if (Object.keys(savedData).length > 0) {
      dispatch({ type: actionTypes.LOAD_SAVED_DATA, data: savedData });
    }
  }, []);

  // Salva automaticamente i dati nel localStorage
  useEffect(() => {
    Object.keys(state.formData).forEach(key => {
      if (state.formData[key]) {
        localStorage.setItem(`pdf_form_${key}`, state.formData[key]);
      }
    });
  }, [state.formData]);

  // Azioni
  const actions = {
    setFormData: (field, value) => {
      dispatch({ type: actionTypes.SET_FORM_DATA, field, value });
    },
    
    setMessage: (text, type = 'info') => {
      dispatch({ type: actionTypes.SET_MESSAGE, text, messageType: type });
      // Auto-clear message dopo 5 secondi
      setTimeout(() => {
        dispatch({ type: actionTypes.CLEAR_MESSAGE });
      }, 5000);
    },
    
    clearMessage: () => {
      dispatch({ type: actionTypes.CLEAR_MESSAGE });
    },
    
    setLoading: (loading) => {
      dispatch({ type: actionTypes.SET_LOADING, loading });
    },
    
    setErrors: (errors) => {
      dispatch({ type: actionTypes.SET_ERRORS, errors });
    },
    
    clearErrors: () => {
      dispatch({ type: actionTypes.CLEAR_ERRORS });
    },
    
    resetForm: () => {
      // Pulisci localStorage
      Object.keys(initialState.formData).forEach(key => {
        localStorage.removeItem(`pdf_form_${key}`);
      });
      dispatch({ type: actionTypes.RESET_FORM });
    },
    
    // New PDF viewer actions
    setCurrentPage: (page) => {
      dispatch({ type: actionTypes.SET_CURRENT_PAGE, page });
    },
    
    setTotalPages: (total) => {
      dispatch({ type: actionTypes.SET_TOTAL_PAGES, total });
    },
    
    setScale: (scale) => {
      dispatch({ type: actionTypes.SET_SCALE, scale });
    },
    
    togglePdfViewer: () => {
      dispatch({ type: actionTypes.TOGGLE_PDF_VIEWER });
    },
    
    setFormValid: (valid) => {
      dispatch({ type: actionTypes.SET_FORM_VALID, valid });
    },
    
    setGenerating: (generating) => {
      dispatch({ type: actionTypes.SET_GENERATING, generating });
    },
    
    setDownloadUrl: (url) => {
      dispatch({ type: actionTypes.SET_DOWNLOAD_URL, url });
    }
  };

  return (
    <AppContext.Provider value={{ state, actions }}>
      {children}
    </AppContext.Provider>
  );
}

// Custom hook per usare il context
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

export { actionTypes };