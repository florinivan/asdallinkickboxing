import React from 'react';
import { useApp } from '../context/AppContext';
import './MessageDisplay.css';

function MessageDisplay() {
  const { state } = useApp();
  
  if (!state.message.text) return null;

  return (
    <div className={`message ${state.message.type}`}>
      <i className={`fas ${state.message.type === 'error' ? 'fa-exclamation-triangle' : 'fa-check-circle'}`}></i>
      {state.message.text}
    </div>
  );
}

export default MessageDisplay;