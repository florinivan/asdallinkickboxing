import React from 'react';
import './DocumentInfo.css';

function DocumentInfo() {
  return (
    <section className="document-info">
      <div className="info-card">
        <div className="document-icon">
          <i className="fas fa-file-contract"></i>
        </div>
        <h2>Compilazione Documento</h2>
        <p>Compila il modulo con le tue informazioni</p>
        <div className="document-name">
          <i className="fas fa-file-pdf"></i>
          <span>Documento: Privacy Policy e Dettagli</span>
        </div>
      </div>
    </section>
  );
}

export default DocumentInfo;