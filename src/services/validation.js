// Validazione Codice Fiscale
export function validateCodiceFiscale(cf) {
  if (!cf) return false;
  const cleanCF = cf.toUpperCase().trim();
  if (cleanCF.length !== 16) return false;
  
  const pattern = /^[A-Z]{6}[0-9]{2}[A-Z][0-9]{2}[A-Z][0-9]{3}[A-Z]$/;
  return pattern.test(cleanCF);
}

// Validazione Email
export function validateEmail(email) {
  if (!email) return false;
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern.test(email.trim());
}

// Formatazione Telefono
export function formatTelefono(value) {
  if (!value) return '';
  
  // Rimuovi tutto tranne i numeri
  let cleaned = value.replace(/\D/g, '');
  
  if (cleaned.length === 0) return '';
  
  // Gestisci il prefisso italiano
  if (cleaned.startsWith('39')) {
    cleaned = '+39 ' + cleaned.slice(2);
  } else if (cleaned.startsWith('3')) {
    cleaned = '+39 ' + cleaned;
  } else if (!cleaned.startsWith('+39')) {
    cleaned = '+39 ' + cleaned;
  }
  
  // Formatta con spazi per leggibilità
  cleaned = cleaned.replace(/(\+39\s?)(\d{3})(\d{3})(\d{4})/, '$1$2 $3 $4');
  
  return cleaned;
}

// Calcola età da data di nascita
export function calculateAge(birthDate) {
  if (!birthDate) return 0;
  
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
}

// Sanitizza input
export function sanitizeInput(input) {
  if (!input) return '';
  return input.trim().replace(/[<>]/g, '');
}