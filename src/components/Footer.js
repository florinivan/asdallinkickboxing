import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Footer.css';

function Footer() {
  const navigate = useNavigate();

  const handleAdminAccess = (e) => {
    // Triple click per accedere al backoffice
    if (e.detail === 3) {
      navigate('/admin');
    }
  };

  return (
    <footer className="footer">
      <p onClick={handleAdminAccess} style={{ cursor: 'default', userSelect: 'none' }}>
        &copy; 2024 ASD Allin Kickboxing. Tutti i diritti riservati.
      </p>
    </footer>
  );
}

export default Footer;