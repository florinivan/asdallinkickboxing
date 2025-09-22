import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/index.css';
import App from './App';

// Error boundary per gestire errori React
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // Log error per debugging
    console.error('React Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '2rem',
          textAlign: 'center',
          fontFamily: 'Inter, sans-serif',
          maxWidth: '600px',
          margin: '2rem auto',
          background: '#f8f9fa',
          border: '1px solid #dee2e6',
          borderRadius: '8px'
        }}>
          <i className="fas fa-exclamation-triangle" style={{
            fontSize: '3rem',
            color: '#dc3545',
            marginBottom: '1rem',
            display: 'block'
          }}></i>
          <h2 style={{ color: '#495057', marginBottom: '1rem' }}>
            Errore nell'Applicazione
          </h2>
          <p style={{ color: '#6c757d', marginBottom: '1rem' }}>
            Si è verificato un errore imprevisto. Prova a ricaricare la pagina.
          </p>
          <details style={{ 
            textAlign: 'left', 
            background: 'white', 
            padding: '1rem',
            border: '1px solid #dee2e6',
            borderRadius: '4px',
            marginBottom: '1rem'
          }}>
            <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
              Dettagli errore (per sviluppatori)
            </summary>
            <pre style={{ 
              fontSize: '0.8rem',
              overflow: 'auto',
              marginTop: '0.5rem',
              color: '#dc3545'
            }}>
              {this.state.error && this.state.error.toString()}
              <br />
              {this.state.errorInfo.componentStack}
            </pre>
          </details>
          <div>
            <button 
              onClick={() => window.location.reload()}
              style={{
                background: '#007bff',
                color: 'white',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '4px',
                cursor: 'pointer',
                marginRight: '0.5rem'
              }}
            >
              <i className="fas fa-redo"></i> Ricarica Pagina
            </button>
            <a 
              href="/uploads/FKvedasipolicyprivacyperidettagli_compressed_organized.pdf"
              target="_blank"
              style={{
                background: '#6c757d',
                color: 'white',
                textDecoration: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '4px',
                display: 'inline-block'
              }}
            >
              <i className="fas fa-file-pdf"></i> Visualizza PDF Originale
            </a>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Verifica che il DOM sia pronto e inizializza l'app
function initializeApp() {
  const rootElement = document.getElementById('root');
  
  if (!rootElement) {
    console.error('Root element non trovato! Assicurati che esista un elemento con id="root"');
    return;
  }

  // Crea root React 18
  const root = ReactDOM.createRoot(rootElement);
  
  // Render dell'applicazione con error boundary
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );

  // Log per debugging
  console.log('Applicazione React inizializzata con successo');
}

// Inizializza quando il DOM è pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}

// Performance monitoring opzionale
if (process.env.NODE_ENV === 'development') {
  console.log('Modalità sviluppo attiva');
}