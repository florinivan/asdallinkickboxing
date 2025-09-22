// JavaScript per ASD Allin Kickboxing - Compilazione Documenti

document.addEventListener('DOMContentLoaded', function() {
    
    // Elementi del DOM
    const pdfForm = document.getElementById('pdfForm');
    const codiceFiscaleInput = document.getElementById('codice_fiscale');
    const submitBtn = document.querySelector('.btn-success');

        // Validazione Codice Fiscale
    if (codiceFiscaleInput) {

    // Validazione Codice Fiscale
    if (codiceFiscaleInput) {
        codiceFiscaleInput.addEventListener('input', function(e) {
            let value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
            e.target.value = value;
            
            // Controllo formato codice fiscale
            const cfPattern = /^[A-Z]{6}[0-9]{2}[A-Z][0-9]{2}[A-Z][0-9]{3}[A-Z]$/;
            
            if (value.length === 16) {
                if (cfPattern.test(value)) {
                    e.target.style.borderColor = '#28a745';
                    e.target.style.boxShadow = '0 0 0 3px rgba(40, 167, 69, 0.1)';
                } else {
                    e.target.style.borderColor = '#dc3545';
                    e.target.style.boxShadow = '0 0 0 3px rgba(220, 53, 69, 0.1)';
                }
            } else {
                e.target.style.borderColor = '';
                e.target.style.boxShadow = '';
            }
        });
    }

    // Gestione form PDF
    if (pdfForm) {
        pdfForm.addEventListener('submit', function(e) {
            // Validazione form
            const requiredFields = pdfForm.querySelectorAll('[required]');
            let isValid = true;

            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    field.style.borderColor = '#dc3545';
                    field.style.boxShadow = '0 0 0 3px rgba(220, 53, 69, 0.1)';
                    isValid = false;
                } else {
                    field.style.borderColor = '#28a745';
                    field.style.boxShadow = '0 0 0 3px rgba(40, 167, 69, 0.1)';
                }
            });

            if (!isValid) {
                e.preventDefault();
                showMessage('Compila tutti i campi obbligatori', 'error');
                return false;
            }

            // Mostra loading
            if (submitBtn) {
                submitBtn.classList.add('loading');
                submitBtn.disabled = true;
                submitBtn.textContent = 'Generazione in corso...';
            }
        });
    }

    // Auto-resize textarea
    const textareas = document.querySelectorAll('textarea');
    textareas.forEach(textarea => {
        textarea.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = (this.scrollHeight) + 'px';
        });
    });

    // Validazione in tempo reale
    const inputs = document.querySelectorAll('input[required], textarea[required]');
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            if (this.value.trim()) {
                this.style.borderColor = '#28a745';
                this.style.boxShadow = '0 0 0 3px rgba(40, 167, 69, 0.1)';
            } else {
                this.style.borderColor = '#dc3545';
                this.style.boxShadow = '0 0 0 3px rgba(220, 53, 69, 0.1)';
            }
        });

        input.addEventListener('focus', function() {
            this.style.borderColor = '#e35205';
            this.style.boxShadow = '0 0 0 3px rgba(227, 82, 5, 0.1)';
        });
    });

    // Formatazione telefono
    const telefonoInput = document.getElementById('telefono');
    if (telefonoInput) {
        telefonoInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 0) {
                // Formato italiano: +39 XXX XXX XXXX
                if (value.startsWith('39')) {
                    value = '+39 ' + value.slice(2);
                } else if (value.startsWith('3')) {
                    value = '+39 ' + value;
                } else {
                    value = '+39 ' + value;
                }
                
                // Aggiungi spazi per leggibilità
                value = value.replace(/(\+39\s)(\d{3})(\d{3})(\d{4})/, '$1$2 $3 $4');
            }
            e.target.value = value;
        });
    }

    // Formatazione data di nascita
    const dataInput = document.getElementById('data_nascita');
    if (dataInput) {
        dataInput.addEventListener('change', function() {
            const today = new Date();
            const birthDate = new Date(this.value);
            const age = today.getFullYear() - birthDate.getFullYear();
            
            if (age < 18) {
                const genitoreField = document.getElementById('genitore');
                if (genitoreField) {
                    genitoreField.setAttribute('required', 'required');
                    genitoreField.closest('.form-group').querySelector('label').innerHTML = 
                        '<i class="fas fa-users"></i> Nome del genitore/tutore (obbligatorio per minorenni)';
                }
            } else {
                const genitoreField = document.getElementById('genitore');
                if (genitoreField) {
                    genitoreField.removeAttribute('required');
                    genitoreField.closest('.form-group').querySelector('label').innerHTML = 
                        '<i class="fas fa-users"></i> Nome del genitore/tutore (se minorenne)';
                }
            }
        });
    }

    // Auto-save dei dati del form nel localStorage
    if (pdfForm) {
        const formInputs = pdfForm.querySelectorAll('input, textarea');
        
        // Carica dati salvati
        formInputs.forEach(input => {
            const savedValue = localStorage.getItem('pdf_form_' + input.name);
            if (savedValue && input.type !== 'file') {
                input.value = savedValue;
            }
        });

        // Salva dati quando l'utente digita
        formInputs.forEach(input => {
            input.addEventListener('input', function() {
                if (this.type !== 'file') {
                    localStorage.setItem('pdf_form_' + this.name, this.value);
                }
            });
        });

        // Pulisci localStorage quando il form viene inviato con successo
        pdfForm.addEventListener('submit', function() {
            setTimeout(() => {
                formInputs.forEach(input => {
                    localStorage.removeItem('pdf_form_' + input.name);
                });
            }, 1000);
        });
    }
});

// Funzione per mostrare messaggi
function showMessage(text, type = 'info') {
    // Rimuovi messaggi esistenti
    const existingMessages = document.querySelectorAll('.message');
    existingMessages.forEach(msg => msg.remove());

    // Crea nuovo messaggio
    const message = document.createElement('div');
    message.className = `message ${type}`;
    
    const icon = type === 'error' ? 'fa-exclamation-triangle' : 'fa-check-circle';
    message.innerHTML = `<i class="fas ${icon}"></i> ${text}`;

    // Inserisci dopo l'header
    const header = document.querySelector('.header');
    header.insertAdjacentElement('afterend', message);

    // Rimuovi automaticamente dopo 5 secondi
    setTimeout(() => {
        message.remove();
    }, 5000);
}

// Funzione per resettare i dati del form
function resetForm() {
    if (confirm('Sei sicuro di voler cancellare tutti i dati inseriti?')) {
        // Pulisci localStorage
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('pdf_form_')) {
                localStorage.removeItem(key);
            }
        });
        
        // Resetta il form
        const form = document.getElementById('pdfForm');
        if (form) {
            form.reset();
        }
        
        showMessage('Dati del form cancellati', 'success');
    }
}

// Gestione del reset della sessione (rimossa - non più necessaria)

// Funzioni di utilità
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validateCodiceFiscale(cf) {
    const pattern = /^[A-Z]{6}[0-9]{2}[A-Z][0-9]{2}[A-Z][0-9]{3}[A-Z]$/;
    return pattern.test(cf);
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl+S per salvare (invia form)
    if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        const form = document.getElementById('pdfForm');
        if (form) {
            form.requestSubmit();
        }
    }
    
    // Escape per resettare form
    if (e.key === 'Escape') {
        resetForm();
    }
});

// Smooth scroll per link interni
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Gestione errori globali
window.addEventListener('error', function(e) {
    console.error('Errore JavaScript:', e.error);
});

// Performance monitoring
if ('performance' in window) {
    window.addEventListener('load', function() {
        setTimeout(() => {
            const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
            console.log('Tempo di caricamento pagina:', loadTime + 'ms');
        }, 0);
    });
}