<?php
// fill_pdf_simple.php - Versione semplificata per compilare PDF senza librerie esterne

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'fill_pdf') {
    
    // PDF fisso predefinito
    $fixed_pdf = 'FKvedasipolicyprivacyperidettagli_compressed_organized.pdf';
    
    // Verifica che il PDF fisso esista
    if (!file_exists('uploads/' . $fixed_pdf)) {
        $message = 'Errore: il documento predefinito non è stato trovato.';
        return;
    }

    try {
        // Raccolta dati dal form
        $data = [
            'nome' => $_POST['nome'] ?? '',
            'data_nascita' => $_POST['data_nascita'] ?? '',
            'luogo_nascita' => $_POST['luogo_nascita'] ?? '',
            'codice_fiscale' => strtoupper($_POST['codice_fiscale'] ?? ''),
            'indirizzo' => $_POST['indirizzo'] ?? '',
            'telefono' => $_POST['telefono'] ?? '',
            'email' => $_POST['email'] ?? '',
            'genitore' => $_POST['genitore'] ?? '',
            'contatto_emergenza' => $_POST['contatto_emergenza'] ?? '',
            'note' => $_POST['note'] ?? ''
        ];

        // Crea un documento HTML che verrà convertito in PDF dal browser
        $html_content = '
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Modulo Compilato - ' . htmlspecialchars($data['nome']) . '</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
                .header { text-align: center; margin-bottom: 30px; }
                .header h1 { color: #e35205; margin: 0; }
                .header h2 { color: #333; margin: 5px 0; }
                .section { margin-bottom: 20px; }
                .section h3 { background-color: #f5f5f5; padding: 10px; margin: 0 0 10px 0; border-left: 4px solid #e35205; }
                .field { margin-bottom: 8px; }
                .label { font-weight: bold; display: inline-block; width: 150px; }
                .value { color: #333; }
                .footer { margin-top: 30px; text-align: right; font-size: 12px; color: #666; }
                @media print {
                    body { margin: 0; }
                    .no-print { display: none; }
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>ASD ALLIN KICKBOXING</h1>
                <h2>PRIVACY POLICY E DETTAGLI - MODULO COMPILATO</h2>
            </div>

            <div class="section">
                <h3>DATI PERSONALI</h3>
                <div class="field">
                    <span class="label">Nome completo:</span>
                    <span class="value">' . htmlspecialchars($data['nome']) . '</span>
                </div>
                <div class="field">
                    <span class="label">Data di nascita:</span>
                    <span class="value">' . ($data['data_nascita'] ? date('d/m/Y', strtotime($data['data_nascita'])) : '') . '</span>
                </div>
                <div class="field">
                    <span class="label">Luogo di nascita:</span>
                    <span class="value">' . htmlspecialchars($data['luogo_nascita']) . '</span>
                </div>
                <div class="field">
                    <span class="label">Codice Fiscale:</span>
                    <span class="value">' . htmlspecialchars($data['codice_fiscale']) . '</span>
                </div>
            </div>

            <div class="section">
                <h3>CONTATTI</h3>
                <div class="field">
                    <span class="label">Indirizzo:</span>
                    <span class="value">' . htmlspecialchars($data['indirizzo']) . '</span>
                </div>
                <div class="field">
                    <span class="label">Telefono:</span>
                    <span class="value">' . htmlspecialchars($data['telefono']) . '</span>
                </div>
                <div class="field">
                    <span class="label">Email:</span>
                    <span class="value">' . htmlspecialchars($data['email']) . '</span>
                </div>
            </div>';

        // Aggiungi sezione informazioni aggiuntive se necessario
        if (!empty($data['genitore']) || !empty($data['contatto_emergenza']) || !empty($data['note'])) {
            $html_content .= '
            <div class="section">
                <h3>INFORMAZIONI AGGIUNTIVE</h3>';
            
            if (!empty($data['genitore'])) {
                $html_content .= '
                <div class="field">
                    <span class="label">Genitore/Tutore:</span>
                    <span class="value">' . htmlspecialchars($data['genitore']) . '</span>
                </div>';
            }
            
            if (!empty($data['contatto_emergenza'])) {
                $html_content .= '
                <div class="field">
                    <span class="label">Contatto di emergenza:</span>
                    <span class="value">' . htmlspecialchars($data['contatto_emergenza']) . '</span>
                </div>';
            }
            
            if (!empty($data['note'])) {
                $html_content .= '
                <div class="field">
                    <span class="label">Note:</span>
                    <span class="value">' . nl2br(htmlspecialchars($data['note'])) . '</span>
                </div>';
            }
            
            $html_content .= '</div>';
        }

        $html_content .= '
            <div class="footer">
                Documento compilato il: ' . date('d/m/Y H:i') . '
            </div>

            <script class="no-print">
                // Auto-print quando la pagina si carica
                window.onload = function() {
                    setTimeout(function() {
                        window.print();
                    }, 1000);
                };
            </script>
        </body>
        </html>';

        // Genera il nome del file
        $filename = 'filled/modulo_' . preg_replace('/[^a-zA-Z0-9]/', '_', $data['nome']) . '_' . date('Y-m-d_H-i-s') . '.html';
        
        // Salva il file HTML
        file_put_contents($filename, $html_content);
        
        // Reindirizza al file creato per visualizzazione/stampa
        header('Location: ' . $filename);
        
        // Pulisci la sessione
        unset($_SESSION['uploaded_pdf']);
        
        exit;
        
    } catch (Exception $e) {
        $message = 'Errore durante la compilazione del documento: ' . $e->getMessage();
        error_log('PDF Error: ' . $e->getMessage());
    }
}
?>