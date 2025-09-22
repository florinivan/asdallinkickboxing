import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { useApp } from '../context/AppContext';
import './PDFViewer.css';

// Configurazione per PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

function PDFViewer() {
  const { state, actions } = useApp();
  const [loadingPdf, setLoadingPdf] = useState(false);

  const onDocumentLoadSuccess = ({ numPages }) => {
    actions.setTotalPages(numPages);
    setLoadingPdf(false);
  };

  const onDocumentLoadError = (error) => {
    console.error('Error loading PDF:', error);
    actions.setMessage('Errore nel caricamento del PDF', 'error');
    setLoadingPdf(false);
  };

  const goToPrevPage = () => {
    if (state.currentPage > 1) {
      actions.setCurrentPage(state.currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (state.currentPage < state.totalPages) {
      actions.setCurrentPage(state.currentPage + 1);
    }
  };

  const zoomIn = () => {
    if (state.scale < 3.0) {
      actions.setScale(Math.min(state.scale + 0.2, 3.0));
    }
  };

  const zoomOut = () => {
    if (state.scale > 0.5) {
      actions.setScale(Math.max(state.scale - 0.2, 0.5));
    }
  };

  const resetZoom = () => {
    actions.setScale(1.2);
  };

  if (!state.showPdfViewer) {
    return (
      <div className="pdf-viewer-minimized">
        <button 
          className="btn-toggle-pdf"
          onClick={actions.togglePdfViewer}
          title="Mostra PDF"
        >
          <i className="fas fa-eye"></i> Mostra PDF
        </button>
      </div>
    );
  }

  return (
    <div className="pdf-viewer">
      <div className="pdf-header">
        <h3>
          <i className="fas fa-file-pdf"></i> 
          Documento PDF
        </h3>
        <div className="pdf-controls">
          <button 
            className="btn-control"
            onClick={actions.togglePdfViewer}
            title="Nascondi PDF"
          >
            <i className="fas fa-eye-slash"></i>
          </button>
          <button 
            className="btn-control"
            onClick={zoomOut}
            disabled={state.scale <= 0.5}
            title="Riduci zoom"
          >
            <i className="fas fa-search-minus"></i>
          </button>
          <span className="zoom-level">{Math.round(state.scale * 100)}%</span>
          <button 
            className="btn-control"
            onClick={zoomIn}
            disabled={state.scale >= 3.0}
            title="Aumenta zoom"
          >
            <i className="fas fa-search-plus"></i>
          </button>
          <button 
            className="btn-control"
            onClick={resetZoom}
            title="Reset zoom"
          >
            <i className="fas fa-expand-arrows-alt"></i>
          </button>
        </div>
      </div>

      <div className="pdf-content">
        {loadingPdf && (
          <div className="pdf-loading">
            <i className="fas fa-spinner fa-spin"></i>
            <p>Caricamento PDF...</p>
          </div>
        )}

        <Document
          file={state.pdfUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading={
            <div className="pdf-loading">
              <i className="fas fa-spinner fa-spin"></i>
              <p>Caricamento PDF...</p>
            </div>
          }
        >
          <Page 
            pageNumber={state.currentPage} 
            scale={state.scale}
            renderTextLayer={false}
            renderAnnotationLayer={false}
            loading={
              <div className="page-loading">
                <i className="fas fa-spinner fa-spin"></i>
              </div>
            }
          />
        </Document>

        {state.totalPages > 1 && (
          <div className="pdf-navigation">
            <button 
              className="btn-nav"
              onClick={goToPrevPage}
              disabled={state.currentPage <= 1}
            >
              <i className="fas fa-chevron-left"></i> Precedente
            </button>
            
            <span className="page-info">
              Pagina {state.currentPage} di {state.totalPages}
            </span>
            
            <button 
              className="btn-nav"
              onClick={goToNextPage}
              disabled={state.currentPage >= state.totalPages}
            >
              Successiva <i className="fas fa-chevron-right"></i>
            </button>
          </div>
        )}

        <div className="pdf-fallback">
          <p>Problemi con la visualizzazione?</p>
          <a 
            href={state.pdfUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn-external"
          >
            <i className="fas fa-external-link-alt"></i>
            Apri in una nuova finestra
          </a>
        </div>
      </div>
    </div>
  );
}

export default PDFViewer;