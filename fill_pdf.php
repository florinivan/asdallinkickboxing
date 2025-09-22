<?php
// fill_pdf.php - Script per compilare il PDF con le informazioni del form

require_once 'includes/tcpdf/tcpdf.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'fill_pdf') {
    
    // Verifica che ci sia un PDF caricato
    if (!isset($_SESSION['uploaded_pdf']) || !file_exists('uploads/' . $_SESSION['uploaded_pdf'])) {
        $message = 'Errore: nessun PDF trovato. Ricarica il file.';
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

        // Crea un nuovo PDF con TCPDF
        $pdf = new TCPDF(PDF_PAGE_ORIENTATION, PDF_UNIT, PDF_PAGE_FORMAT, true, 'UTF-8', false);
        
        // Imposta le informazioni del documento
        $pdf->SetCreator('ASD Allin Kickboxing');
        $pdf->SetAuthor('ASD Allin Kickboxing');
        $pdf->SetTitle('Modulo Compilato - ' . $data['nome']);
        $pdf->SetSubject('Documento compilato');

        // Rimuovi header e footer
        $pdf->setPrintHeader(false);
        $pdf->setPrintFooter(false);

        // Imposta margini
        $pdf->SetMargins(20, 20, 20);
        $pdf->SetAutoPageBreak(TRUE, 20);

        // Aggiungi una pagina
        $pdf->AddPage();

        // Imposta font
        $pdf->SetFont('helvetica', '', 12);

        // Header del documento
        $pdf->SetFont('helvetica', 'B', 16);
        $pdf->Cell(0, 10, 'ASD ALLIN KICKBOXING', 0, 1, 'C');
        $pdf->Ln(5);
        
        $pdf->SetFont('helvetica', 'B', 14);
        $pdf->Cell(0, 10, 'MODULO DI ISCRIZIONE', 0, 1, 'C');
        $pdf->Ln(10);

        // Dati personali
        $pdf->SetFont('helvetica', 'B', 12);
        $pdf->Cell(0, 8, 'DATI PERSONALI', 0, 1, 'L');
        $pdf->Ln(2);
        
        $pdf->SetFont('helvetica', '', 11);
        
        // Nome
        $pdf->Cell(40, 8, 'Nome completo:', 0, 0, 'L');
        $pdf->SetFont('helvetica', 'B', 11);
        $pdf->Cell(0, 8, $data['nome'], 0, 1, 'L');
        $pdf->Ln(2);
        
        // Data di nascita
        $pdf->SetFont('helvetica', '', 11);
        $pdf->Cell(40, 8, 'Data di nascita:', 0, 0, 'L');
        $pdf->SetFont('helvetica', 'B', 11);
        $data_nascita_formatted = $data['data_nascita'] ? date('d/m/Y', strtotime($data['data_nascita'])) : '';
        $pdf->Cell(0, 8, $data_nascita_formatted, 0, 1, 'L');
        $pdf->Ln(2);
        
        // Luogo di nascita
        $pdf->SetFont('helvetica', '', 11);
        $pdf->Cell(40, 8, 'Luogo di nascita:', 0, 0, 'L');
        $pdf->SetFont('helvetica', 'B', 11);
        $pdf->Cell(0, 8, $data['luogo_nascita'], 0, 1, 'L');
        $pdf->Ln(2);
        
        // Codice fiscale
        $pdf->SetFont('helvetica', '', 11);
        $pdf->Cell(40, 8, 'Codice Fiscale:', 0, 0, 'L');
        $pdf->SetFont('helvetica', 'B', 11);
        $pdf->Cell(0, 8, $data['codice_fiscale'], 0, 1, 'L');
        $pdf->Ln(5);

        // Contatti
        $pdf->SetFont('helvetica', 'B', 12);
        $pdf->Cell(0, 8, 'CONTATTI', 0, 1, 'L');
        $pdf->Ln(2);
        
        // Indirizzo
        $pdf->SetFont('helvetica', '', 11);
        $pdf->Cell(40, 8, 'Indirizzo:', 0, 0, 'L');
        $pdf->SetFont('helvetica', 'B', 11);
        $pdf->Cell(0, 8, $data['indirizzo'], 0, 1, 'L');
        $pdf->Ln(2);
        
        // Telefono
        $pdf->SetFont('helvetica', '', 11);
        $pdf->Cell(40, 8, 'Telefono:', 0, 0, 'L');
        $pdf->SetFont('helvetica', 'B', 11);
        $pdf->Cell(0, 8, $data['telefono'], 0, 1, 'L');
        $pdf->Ln(2);
        
        // Email
        $pdf->SetFont('helvetica', '', 11);
        $pdf->Cell(40, 8, 'Email:', 0, 0, 'L');
        $pdf->SetFont('helvetica', 'B', 11);
        $pdf->Cell(0, 8, $data['email'], 0, 1, 'L');
        $pdf->Ln(5);

        // Informazioni aggiuntive (se compilate)
        if (!empty($data['genitore']) || !empty($data['contatto_emergenza']) || !empty($data['note'])) {
            $pdf->SetFont('helvetica', 'B', 12);
            $pdf->Cell(0, 8, 'INFORMAZIONI AGGIUNTIVE', 0, 1, 'L');
            $pdf->Ln(2);
            
            if (!empty($data['genitore'])) {
                $pdf->SetFont('helvetica', '', 11);
                $pdf->Cell(60, 8, 'Genitore/Tutore:', 0, 0, 'L');
                $pdf->SetFont('helvetica', 'B', 11);
                $pdf->Cell(0, 8, $data['genitore'], 0, 1, 'L');
                $pdf->Ln(2);
            }
            
            if (!empty($data['contatto_emergenza'])) {
                $pdf->SetFont('helvetica', '', 11);
                $pdf->Cell(60, 8, 'Contatto di emergenza:', 0, 0, 'L');
                $pdf->SetFont('helvetica', 'B', 11);
                $pdf->Cell(0, 8, $data['contatto_emergenza'], 0, 1, 'L');
                $pdf->Ln(2);
            }
            
            if (!empty($data['note'])) {
                $pdf->SetFont('helvetica', '', 11);
                $pdf->Cell(0, 8, 'Note:', 0, 1, 'L');
                $pdf->SetFont('helvetica', 'B', 11);
                $pdf->MultiCell(0, 8, $data['note'], 0, 'L');
                $pdf->Ln(2);
            }
        }

        // Footer con data di compilazione
        $pdf->Ln(10);
        $pdf->SetFont('helvetica', '', 10);
        $pdf->Cell(0, 8, 'Documento compilato il: ' . date('d/m/Y H:i'), 0, 1, 'R');

        // Genera il nome del file
        $filename = 'filled/modulo_' . preg_replace('/[^a-zA-Z0-9]/', '_', $data['nome']) . '_' . date('Y-m-d_H-i-s') . '.pdf';
        
        // Salva il PDF
        $pdf->Output(__DIR__ . '/' . $filename, 'F');
        
        // Invia il file per il download
        header('Content-Type: application/pdf');
        header('Content-Disposition: attachment; filename="' . basename($filename) . '"');
        header('Content-Length: ' . filesize($filename));
        readfile($filename);
        
        // Pulisci la sessione
        unset($_SESSION['uploaded_pdf']);
        
        exit;
        
    } catch (Exception $e) {
        $message = 'Errore durante la compilazione del PDF: ' . $e->getMessage();
        error_log('PDF Error: ' . $e->getMessage());
    }
}
?>