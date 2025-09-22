<?php
// config.php - Configurazioni per il sistema PDF

// Configurazioni upload
define('MAX_FILE_SIZE', 10 * 1024 * 1024); // 10MB
define('ALLOWED_EXTENSIONS', ['pdf']);
define('UPLOAD_DIR', 'uploads/');
define('FILLED_DIR', 'filled/');

// Configurazioni sicurezza
define('SESSION_TIMEOUT', 3600); // 1 ora

// Configurazioni applicazione
define('APP_NAME', 'ASD Allin Kickboxing');
define('APP_VERSION', '1.0.0');

// Crea cartelle se non esistono
if (!is_dir(UPLOAD_DIR)) {
    mkdir(UPLOAD_DIR, 0755, true);
}

if (!is_dir(FILLED_DIR)) {
    mkdir(FILLED_DIR, 0755, true);
}

// Funzione per pulire file vecchi
function cleanOldFiles() {
    $directories = [UPLOAD_DIR, FILLED_DIR];
    
    foreach ($directories as $dir) {
        if (is_dir($dir)) {
            $files = glob($dir . '*');
            foreach ($files as $file) {
                if (is_file($file) && time() - filemtime($file) > 86400) { // 24 ore
                    unlink($file);
                }
            }
        }
    }
}

// Pulizia automatica (1% di probabilità ad ogni caricamento)
if (rand(1, 100) === 1) {
    cleanOldFiles();
}

// Funzione per validare codice fiscale
function validateCodiceFiscale($cf) {
    $cf = strtoupper(trim($cf));
    if (strlen($cf) !== 16) return false;
    
    $pattern = '/^[A-Z]{6}[0-9]{2}[A-Z][0-9]{2}[A-Z][0-9]{3}[A-Z]$/';
    return preg_match($pattern, $cf);
}

// Funzione per sanitizzare input
function sanitizeInput($input) {
    return htmlspecialchars(trim($input), ENT_QUOTES, 'UTF-8');
}
?>