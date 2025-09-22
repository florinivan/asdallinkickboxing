import React from 'react';
import PDFViewer from './PDFViewer';
import DocumentForm from './DocumentForm';
import './PDFManagement.css';

function PDFManagement() {
  return (
    <section className="pdf-management">
      <div className="pdf-container">
        <PDFViewer />
        <DocumentForm />
      </div>
    </section>
  );
}

export default PDFManagement;