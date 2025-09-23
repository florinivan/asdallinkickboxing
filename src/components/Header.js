import React from 'react';
import './Header.css';

function Header() {
  return (
    <header className="header">
      <div className="header-content">
        <div className="logo">
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
        </div>
      </div>
    </header>
  );
}

export default Header;