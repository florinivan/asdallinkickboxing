import React from 'react';
import './Header.css';

function Header() {
  return (
    <header className="header">
      <div className="header-content">
        <div className="logo">
          <i className="fas fa-fist-raised"></i>
          <h1>ASD Allin Kickboxing</h1>
        </div>
        <p className="subtitle">Compilazione Documenti</p>
      </div>
    </header>
  );
}

export default Header;