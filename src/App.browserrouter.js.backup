import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Header from './components/Header';
import Homepage from './components/Homepage';
import PDFViewer from './components/PDFViewer';
import DocumentForm from './components/DocumentForm';
import MessageDisplay from './components/MessageDisplay';
import Footer from './components/Footer';
import './styles/App.css';

// Componente per la pagina dei moduli
function ModuliPage() {
  return (
    <main className="main-content">
      <div className="container">
        <MessageDisplay />
        <div className="content-layout">
          <div className="pdf-section">
            <PDFViewer />
          </div>
          <div className="form-section">
            <DocumentForm />
          </div>
        </div>
      </div>
    </main>
  );
}

function App() {
  return (
    <AppProvider>
      <Router>
        <div className="App">
          <Header />
          
          <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/moduli" element={<ModuliPage />} />
          </Routes>

          <Footer />
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;