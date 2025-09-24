import React, { useRef, useState, useEffect } from 'react';
import './SignaturePad.css';

const SignaturePad = ({ onSignatureChange, value }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isEmpty, setIsEmpty] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set canvas size - responsive
    const container = canvas.parentElement;
    const containerWidth = container.offsetWidth;
    const isMobile = window.innerWidth <= 768;
    
    canvas.width = Math.min(400, containerWidth - 20);
    canvas.height = isMobile ? 120 : 150;
    
    // Set drawing style
    ctx.strokeStyle = '#000';
    ctx.lineWidth = isMobile ? 3 : 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // Clear canvas
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Load existing signature if provided
    if (value) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
        setIsEmpty(false);
      };
      img.src = value;
    }
    
    // Gestione ridimensionamento finestra
    const handleResize = () => {
      const newContainerWidth = container.offsetWidth;
      const newIsMobile = window.innerWidth <= 768;
      const newWidth = Math.min(400, newContainerWidth - 20);
      const newHeight = newIsMobile ? 120 : 150;
      
      if (canvas.width !== newWidth || canvas.height !== newHeight) {
        // Salva contenuto attuale se presente
        const imageData = !isEmpty ? canvas.toDataURL() : null;
        
        canvas.width = newWidth;
        canvas.height = newHeight;
        
        // Reimposta stili
        ctx.strokeStyle = '#000';
        ctx.lineWidth = newIsMobile ? 3 : 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Ricarica il contenuto se era presente
        if (imageData) {
          const img = new Image();
          img.onload = () => {
            ctx.drawImage(img, 0, 0);
          };
          img.src = imageData;
        }
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [value, isEmpty]);

  const startDrawing = (e) => {
    setIsDrawing(true);
    setIsEmpty(false);
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    
    setIsDrawing(false);
    const canvas = canvasRef.current;
    const dataURL = canvas.toDataURL('image/png');
    onSignatureChange(dataURL);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    setIsEmpty(true);
    onSignatureChange('');
  };

  // Touch events for mobile - chiamate dirette
  const handleTouchStart = (e) => {
    e.preventDefault();
    e.stopPropagation(); // Previene la propagazione dell'evento
    const touch = e.touches[0];
    
    // Simula l'evento mouse con le coordinate corrette
    const fakeEvent = {
      clientX: touch.clientX,
      clientY: touch.clientY
    };
    
    startDrawing(fakeEvent);
  };

  const handleTouchMove = (e) => {
    e.preventDefault();
    e.stopPropagation(); // Previene la propagazione dell'evento
    const touch = e.touches[0];
    
    // Simula l'evento mouse con le coordinate corrette
    const fakeEvent = {
      clientX: touch.clientX,
      clientY: touch.clientY
    };
    
    draw(fakeEvent);
  };

  const handleTouchEnd = (e) => {
    e.preventDefault();
    stopDrawing();
  };

  return (
    <div className="signature-pad">
      <div className="signature-canvas-container">
        <canvas
          ref={canvasRef}
          className="signature-canvas"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
          style={{ touchAction: 'none' }}
        />
        {isEmpty && (
          <div className="signature-placeholder">
            <i className="fas fa-signature"></i>
            <span>Firma qui sopra</span>
          </div>
        )}
      </div>
      
      <div className="signature-controls">
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={clearSignature}
          disabled={isEmpty}
        >
          <i className="fas fa-eraser"></i>
          Cancella Firma
        </button>
      </div>
    </div>
  );
};

export default SignaturePad;