import React from 'react';
import { AppProvider } from './context/AppContext';
import Header from './components/Header';
import PDFViewer from './components/PDFViewer';
import DocumentForm from './components/DocumentForm';
import MessageDisplay from './components/MessageDisplay';
import Footer from './components/Footer';
import './styles/App.css';

function App() {
  return (
    <AppProvider>
      <div className="App">
        <Header />
        
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

        <Footer />
      </div>
    </AppProvider>
  );
}

export default App;