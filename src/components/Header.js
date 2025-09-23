import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Header.css';

function Header() {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  // Se siamo nella homepage, non mostriamo l'header normale
  if (isHomePage) {
    return null;
  }

  return (
    <header className="header">
      <div className="header-content">
        <div className="logo">
          <Link to="/" className="logo-link">
            <img 
              src="/logo.png" 
              alt="ASD All IN Kickboxing Logo" 
              className="logo-image"
              onError={(e) => {
                // Fallback se l'immagine non si carica
                e.target.style.display = 'none';
                e.target.nextElementSibling.style.display = 'flex';
              }}
            />
            <div className="logo-fallback" style={{display: 'none'}}>
              <i className="fas fa-fist-raised"></i>
              <span>ASD All IN Kickboxing</span>
            </div>
          </Link>
        </div>
        
        <nav className="header-nav">
          <Link to="/" className="nav-link">
            <i className="fas fa-home"></i>
            <span>Home</span>
          </Link>
          <Link to="/moduli" className={`nav-link ${location.pathname === '/moduli' ? 'active' : ''}`}>
            <i className="fas fa-file-alt"></i>
            <span>Moduli</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}

export default Header;