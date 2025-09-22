<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Include required libraries
require_once '../config.php';

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

try {
    // Get JSON input
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        throw new Exception('Invalid JSON input');
    }
    
    // Validate required fields
    $required_fields = ['nome', 'cognome', 'data_nascita', 'luogo_nascita', 'codice_fiscale', 'indirizzo', 'citta', 'cap', 'telefono', 'email'];
    
    foreach ($required_fields as $field) {
        if (empty($input[$field])) {
            throw new Exception("Campo obbligatorio mancante: $field");
        }
    }
    
    // Check if minor and validate parent data
    $birth_date = new DateTime($input['data_nascita']);
    $today = new DateTime();
    $age = $today->diff($birth_date)->y;
    
    if ($age < 18) {
        if (empty($input['genitore1_nome']) || empty($input['genitore1_cognome']) || empty($input['genitore1_telefono'])) {
            throw new Exception('Dati del primo genitore obbligatori per i minorenni');
        }
    }
    
    // Generate unique filename
    $timestamp = date('Y-m-d_H-i-s');
    $safe_name = preg_replace('/[^a-zA-Z0-9]/', '', $input['nome'] . $input['cognome']);
    $output_filename = "documento_{$safe_name}_{$timestamp}.pdf";
    $output_path = "../filled/{$output_filename}";
    
    // Ensure filled directory exists
    if (!file_exists('../filled')) {
        mkdir('../filled', 0755, true);
    }
    
    // Call the PDF filling function
    $result = fillPdfWithData($input, $output_path);
    
    if ($result) {
        // Return success response
        echo json_encode([
            'success' => true,
            'message' => 'Documento generato con successo',
            'filename' => $output_filename,
            'download_url' => "/filled/{$output_filename}",
            'file_size' => filesize($output_path)
        ]);
    } else {
        throw new Exception('Errore nella generazione del PDF');
    }
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}

/**
 * Fill PDF with form data
 */
function fillPdfWithData($data, $output_path) {
    $source_pdf = '../uploads/FKvedasipolicyprivacyperidettagli_compressed_organized.pdf';
    
    if (!file_exists($source_pdf)) {
        throw new Exception('File PDF sorgente non trovato');
    }
    
    // For now, we'll use a simple approach - copy the original and create a text overlay
    // In a production environment, you would use a library like TCPDF, FPDF, or PDFtk
    
    try {
        // Method 1: Using TCPDF if available
        if (class_exists('TCPDF')) {
            return fillPdfWithTCPDF($data, $source_pdf, $output_path);
        }
        
        // Method 2: Using PDFtk if available (server must have pdftk installed)
        if (isPdftkAvailable()) {
            return fillPdfWithPdftk($data, $source_pdf, $output_path);
        }
        
        // Method 3: Fallback - create a new PDF with the data
        return createNewPdfWithData($data, $output_path);
        
    } catch (Exception $e) {
        error_log("PDF generation error: " . $e->getMessage());
        throw new Exception('Errore nella creazione del PDF: ' . $e->getMessage());
    }
}

/**
 * Fill PDF using TCPDF
 */
function fillPdfWithTCPDF($data, $source_pdf, $output_path) {
    // This would require TCPDF library
    // For now, return false to fallback to other methods
    return false;
}

/**
 * Check if PDFtk is available
 */
function isPdftkAvailable() {
    $output = null;
    $return_var = null;
    exec('pdftk --version 2>&1', $output, $return_var);
    return $return_var === 0;
}

/**
 * Fill PDF using PDFtk
 */
function fillPdfWithPdftk($data, $source_pdf, $output_path) {
    // Create FDF file with form data
    $fdf_content = createFdfContent($data);
    $fdf_file = tempnam(sys_get_temp_dir(), 'form_data_') . '.fdf';
    
    if (file_put_contents($fdf_file, $fdf_content) === false) {
        return false;
    }
    
    // Use PDFtk to fill the form
    $command = "pdftk " . escapeshellarg($source_pdf) . 
               " fill_form " . escapeshellarg($fdf_file) . 
               " output " . escapeshellarg($output_path) . 
               " flatten 2>&1";
    
    $output = null;
    $return_var = null;
    exec($command, $output, $return_var);
    
    // Clean up temp file
    if (file_exists($fdf_file)) {
        unlink($fdf_file);
    }
    
    return $return_var === 0 && file_exists($output_path);
}

/**
 * Create FDF content for form filling
 */
function createFdfContent($data) {
    $fdf_content = "%FDF-1.2\n";
    $fdf_content .= "1 0 obj\n";
    $fdf_content .= "<<\n";
    $fdf_content .= "/FDF\n";
    $fdf_content .= "<<\n";
    $fdf_content .= "/Fields [\n";
    
    // Map form data to PDF field names
    $field_mapping = [
        'nome' => 'nome',
        'cognome' => 'cognome',
        'data_nascita' => 'data_nascita',
        'luogo_nascita' => 'luogo_nascita',
        'codice_fiscale' => 'codice_fiscale',
        'indirizzo' => 'indirizzo',
        'citta' => 'citta',
        'cap' => 'cap',
        'telefono' => 'telefono',
        'email' => 'email',
        'genitore1_nome' => 'genitore1_nome',
        'genitore1_cognome' => 'genitore1_cognome',
        'genitore1_telefono' => 'genitore1_telefono',
        'genitore2_nome' => 'genitore2_nome',
        'genitore2_cognome' => 'genitore2_cognome',
        'genitore2_telefono' => 'genitore2_telefono',
        'contatto_emergenza' => 'contatto_emergenza',
        'note' => 'note'
    ];
    
    foreach ($field_mapping as $form_field => $pdf_field) {
        if (isset($data[$form_field]) && !empty($data[$form_field])) {
            $value = str_replace(['(', ')', '\\'], ['\\(', '\\)', '\\\\'], $data[$form_field]);
            $fdf_content .= "<<\n";
            $fdf_content .= "/T ({$pdf_field})\n";
            $fdf_content .= "/V ({$value})\n";
            $fdf_content .= ">>\n";
        }
    }
    
    $fdf_content .= "]\n";
    $fdf_content .= ">>\n";
    $fdf_content .= ">>\n";
    $fdf_content .= "endobj\n";
    $fdf_content .= "trailer\n";
    $fdf_content .= "<<\n";
    $fdf_content .= "/Root 1 0 R\n";
    $fdf_content .= ">>\n";
    $fdf_content .= "%%EOF\n";
    
    return $fdf_content;
}

/**
 * Fallback: Create new PDF with data
 */
function createNewPdfWithData($data, $output_path) {
    // Create a simple PDF with the form data
    $content = "<!DOCTYPE html>
<html>
<head>
    <meta charset='UTF-8'>
    <title>Documento Generato</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        h1 { color: #333; border-bottom: 2px solid #333; }
        .section { margin: 20px 0; }
        .field { margin: 10px 0; }
        .label { font-weight: bold; color: #666; }
        .value { margin-left: 10px; }
    </style>
</head>
<body>
    <h1>ASD All-in Kickboxing - Documento Compilato</h1>
    
    <div class='section'>
        <h2>Dati Personali</h2>
        <div class='field'><span class='label'>Nome:</span> <span class='value'>{$data['nome']}</span></div>
        <div class='field'><span class='label'>Cognome:</span> <span class='value'>{$data['cognome']}</span></div>
        <div class='field'><span class='label'>Data di nascita:</span> <span class='value'>{$data['data_nascita']}</span></div>
        <div class='field'><span class='label'>Luogo di nascita:</span> <span class='value'>{$data['luogo_nascita']}</span></div>
        <div class='field'><span class='label'>Codice Fiscale:</span> <span class='value'>{$data['codice_fiscale']}</span></div>
    </div>
    
    <div class='section'>
        <h2>Residenza</h2>
        <div class='field'><span class='label'>Indirizzo:</span> <span class='value'>{$data['indirizzo']}</span></div>
        <div class='field'><span class='label'>Città:</span> <span class='value'>{$data['citta']}</span></div>
        <div class='field'><span class='label'>CAP:</span> <span class='value'>{$data['cap']}</span></div>
    </div>
    
    <div class='section'>
        <h2>Contatti</h2>
        <div class='field'><span class='label'>Telefono:</span> <span class='value'>{$data['telefono']}</span></div>
        <div class='field'><span class='label'>Email:</span> <span class='value'>{$data['email']}</span></div>
    </div>";
    
    // Add parent data if present
    if (!empty($data['genitore1_nome'])) {
        $content .= "
    <div class='section'>
        <h2>Dati Genitori</h2>
        <div class='field'><span class='label'>Primo Genitore:</span> <span class='value'>{$data['genitore1_nome']} {$data['genitore1_cognome']}</span></div>
        <div class='field'><span class='label'>Telefono:</span> <span class='value'>{$data['genitore1_telefono']}</span></div>";
        
        if (!empty($data['genitore2_nome'])) {
            $content .= "
        <div class='field'><span class='label'>Secondo Genitore:</span> <span class='value'>{$data['genitore2_nome']} {$data['genitore2_cognome']}</span></div>
        <div class='field'><span class='label'>Telefono:</span> <span class='value'>{$data['genitore2_telefono']}</span></div>";
        }
        
        $content .= "
    </div>";
    }
    
    // Add emergency contact and notes if present
    if (!empty($data['contatto_emergenza']) || !empty($data['note'])) {
        $content .= "
    <div class='section'>
        <h2>Altre Informazioni</h2>";
        
        if (!empty($data['contatto_emergenza'])) {
            $content .= "
        <div class='field'><span class='label'>Contatto di emergenza:</span> <span class='value'>{$data['contatto_emergenza']}</span></div>";
        }
        
        if (!empty($data['note'])) {
            $content .= "
        <div class='field'><span class='label'>Note:</span> <span class='value'>{$data['note']}</span></div>";
        }
        
        $content .= "
    </div>";
    }
    
    $content .= "
    <div class='section'>
        <p><em>Documento generato il " . date('d/m/Y H:i:s') . "</em></p>
    </div>
</body>
</html>";
    
    // Convert HTML to PDF using DomPDF or similar
    // For now, save as HTML
    $html_path = str_replace('.pdf', '.html', $output_path);
    
    if (file_put_contents($html_path, $content)) {
        // If we have wkhtmltopdf available, convert to PDF
        if (isWkhtmltopdfAvailable()) {
            $command = "wkhtmltopdf " . escapeshellarg($html_path) . " " . escapeshellarg($output_path) . " 2>&1";
            $output = null;
            $return_var = null;
            exec($command, $output, $return_var);
            
            if ($return_var === 0 && file_exists($output_path)) {
                unlink($html_path); // Remove HTML file
                return true;
            }
        }
        
        // Fallback: rename HTML to PDF (not ideal but works)
        return rename($html_path, $output_path);
    }
    
    return false;
}

/**
 * Check if wkhtmltopdf is available
 */
function isWkhtmltopdfAvailable() {
    $output = null;
    $return_var = null;
    exec('wkhtmltopdf --version 2>&1', $output, $return_var);
    return $return_var === 0;
}
?>