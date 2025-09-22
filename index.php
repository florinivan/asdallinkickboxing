<?php
session_start();
require_once 'config.php';

// PDF fisso predefinito
$fixed_pdf = 'FKvedasipolicyprivacyperidettagli_compressed_organized.pdf';
$message = '';
$uploaded_pdf = $fixed_pdf; // Usa sempre il PDF fisso

// Verifica che il PDF fisso esista
if (!file_exists('uploads/' . $fixed_pdf)) {
    $message = 'Errore: il file PDF predefinito non è stato trovato.';
    $uploaded_pdf = '';
} else {
    // Imposta sempre il PDF fisso nella sessione
    $_SESSION['uploaded_pdf'] = $fixed_pdf;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['action'])) {
        switch ($_POST['action']) {
            case 'fill_pdf':
                if (isset($_SESSION['uploaded_pdf'])) {
                    // Logica per compilare il PDF
                    include 'fill_pdf_simple.php';
                }
                break;
        }
    }
}
?>
<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ASD Allin Kickboxing - Compilazione Documenti</title>
    <link rel="stylesheet" href="css/style.css">
    <link href="https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
</head>
<body>
    <div class="container">
        <!-- Header -->
        <header class="header">
            <div class="header-content">
                <div class="logo">
                    <i class="fas fa-fist-raised"></i>
                    <h1>ASD Allin Kickboxing</h1>
                </div>
                <p class="subtitle">Compilazione Documenti</p>
            </div>
        </header>

        <!-- Messaggi -->
        <?php if ($message): ?>
        <div class="message <?php echo strpos($message, 'Errore') !== false ? 'error' : 'success'; ?>">
            <i class="fas <?php echo strpos($message, 'Errore') !== false ? 'fa-exclamation-triangle' : 'fa-check-circle'; ?>"></i>
            <?php echo htmlspecialchars($message); ?>
        </div>
        <?php endif; ?>

                <!-- Documento Section -->
        <section class="document-info">
            <div class="info-card">
                <div class="document-icon">
                    <i class="fas fa-file-contract"></i>
                </div>
                <h2>Compilazione Documento</h2>
                <p>Compila il modulo con le tue informazioni per generare il documento personalizzato</p>
                <div class="document-name">
                    <i class="fas fa-file-pdf"></i>
                    <span>Documento: Privacy Policy e Dettagli</span>
                </div>
            </div>
        </section>
        
        <?php if ($uploaded_pdf): ?>
        
        <!-- PDF Management Section -->
        <section class="pdf-management">
            <div class="pdf-container">
                <!-- PDF Viewer -->
                <div class="pdf-viewer">
                    <h3><i class="fas fa-eye"></i> Anteprima PDF</h3>
                    <div class="pdf-embed">
                        <embed src="uploads/<?php echo htmlspecialchars($uploaded_pdf); ?>" 
                               type="application/pdf" 
                               width="100%" 
                               height="600px">
                        <p class="pdf-fallback">
                            Il tuo browser non supporta la visualizzazione PDF. 
                            <a href="uploads/<?php echo htmlspecialchars($uploaded_pdf); ?>" target="_blank">
                                Clicca qui per aprire il PDF
                            </a>
                        </p>
                    </div>
                </div>

                <!-- Form Section -->
                <div class="form-section">
                    <h3><i class="fas fa-edit"></i> Compila il Documento</h3>
                    <form method="POST" class="pdf-form" id="pdfForm">
                        <input type="hidden" name="action" value="fill_pdf">
                        
                        <div class="form-group">
                            <label for="nome"><i class="fas fa-user"></i> Nome completo</label>
                            <input type="text" id="nome" name="nome" required>
                        </div>

                        <div class="form-group">
                            <label for="data_nascita"><i class="fas fa-calendar"></i> Data di nascita</label>
                            <input type="date" id="data_nascita" name="data_nascita" required>
                        </div>

                        <div class="form-group">
                            <label for="luogo_nascita"><i class="fas fa-map-marker-alt"></i> Luogo di nascita</label>
                            <input type="text" id="luogo_nascita" name="luogo_nascita" required>
                        </div>

                        <div class="form-group">
                            <label for="codice_fiscale"><i class="fas fa-id-card"></i> Codice Fiscale</label>
                            <input type="text" id="codice_fiscale" name="codice_fiscale" required pattern="[A-Z]{6}[0-9]{2}[A-Z][0-9]{2}[A-Z][0-9]{3}[A-Z]">
                        </div>

                        <div class="form-group">
                            <label for="indirizzo"><i class="fas fa-home"></i> Indirizzo</label>
                            <input type="text" id="indirizzo" name="indirizzo" required>
                        </div>

                        <div class="form-group">
                            <label for="telefono"><i class="fas fa-phone"></i> Telefono</label>
                            <input type="tel" id="telefono" name="telefono" required>
                        </div>

                        <div class="form-group">
                            <label for="email"><i class="fas fa-envelope"></i> Email</label>
                            <input type="email" id="email" name="email" required>
                        </div>

                        <div class="form-group">
                            <label for="genitore"><i class="fas fa-users"></i> Nome del genitore/tutore (se minorenne)</label>
                            <input type="text" id="genitore" name="genitore">
                        </div>

                        <div class="form-group">
                            <label for="contatto_emergenza"><i class="fas fa-phone-alt"></i> Contatto di emergenza</label>
                            <input type="text" id="contatto_emergenza" name="contatto_emergenza">
                        </div>

                        <div class="form-group">
                            <label for="note"><i class="fas fa-sticky-note"></i> Note aggiuntive</label>
                            <textarea id="note" name="note" rows="3"></textarea>
                        </div>

                        <div class="form-actions">
                            <button type="submit" class="btn btn-success">
                                <i class="fas fa-file-download"></i>
                                Compila e Scarica PDF
                            </button>
                            <button type="button" class="btn btn-secondary" onclick="resetUpload()">
                                <i class="fas fa-upload"></i>
                                Carica nuovo PDF
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </section>
        <?php endif; ?>

        <!-- Footer -->
        <footer class="footer">
            <p>&copy; 2024 ASD Allin Kickboxing. Tutti i diritti riservati.</p>
        </footer>
    </div>

    <script src="js/script.js"></script>
</body>
</html>