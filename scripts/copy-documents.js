#!/usr/bin/env node

/**
 * Script per copiare i documenti generati nella build di produzione
 * Questo script viene eseguito automaticamente dopo `npm run build`
 */

const fs = require('fs');
const path = require('path');

// Percorsi
const sourceDir = path.join(__dirname, '..', 'public', 'documents');
const buildDir = path.join(__dirname, '..', 'build');
const targetDir = path.join(buildDir, 'documents');

/**
 * Crea una directory se non esiste
 */
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`📁 Creata directory: ${dirPath}`);
  }
}

/**
 * Copia un file da source a target
 */
function copyFile(sourcePath, targetPath) {
  try {
    fs.copyFileSync(sourcePath, targetPath);
    console.log(`📋 Copiato: ${path.basename(sourcePath)}`);
  } catch (error) {
    console.error(`❌ Errore copia ${path.basename(sourcePath)}:`, error.message);
  }
}

/**
 * Copia tutti i file PDF da una directory
 */
function copyPdfFiles(sourceDir, targetDir) {
  if (!fs.existsSync(sourceDir)) {
    console.log(`⚠️  Directory sorgente non trovata: ${sourceDir}`);
    return 0;
  }

  const files = fs.readdirSync(sourceDir);
  const pdfFiles = files.filter(file => file.toLowerCase().endsWith('.pdf'));
  
  let copiedCount = 0;
  
  pdfFiles.forEach(file => {
    const sourcePath = path.join(sourceDir, file);
    const targetPath = path.join(targetDir, file);
    
    copyFile(sourcePath, targetPath);
    copiedCount++;
  });
  
  return copiedCount;
}

/**
 * Crea file di configurazione per il server
 */
function createServerConfig() {
  const htaccessContent = `# Configurazione per servire file PDF
<IfModule mod_mime.c>
    AddType application/pdf .pdf
</IfModule>

# Abilita CORS per i PDF (se necessario)
<IfModule mod_headers.c>
    <FilesMatch "\\.(pdf)$">
        Header set Access-Control-Allow-Origin "*"
        Header set Access-Control-Allow-Methods "GET, OPTIONS"
        Header set Access-Control-Allow-Headers "Content-Type"
    </FilesMatch>
</IfModule>

# Cache per i PDF (7 giorni)
<IfModule mod_expires.c>
    ExpiresActive on
    <FilesMatch "\\.(pdf)$">
        ExpiresDefault "access plus 7 days"
    </FilesMatch>
</IfModule>`;

  const htaccessPath = path.join(targetDir, '.htaccess');
  
  try {
    fs.writeFileSync(htaccessPath, htaccessContent);
    console.log('⚙️  Creato file .htaccess per configurazione server');
  } catch (error) {
    console.error('❌ Errore creazione .htaccess:', error.message);
  }
}

/**
 * Crea un file di manifest per tenere traccia dei file copiati
 */
function createManifest(copiedFiles) {
  const manifest = {
    generatedAt: new Date().toISOString(),
    totalFiles: copiedFiles,
    buildVersion: process.env.npm_package_version || '1.0.0',
    environment: 'production',
    documentsPath: '/documents/'
  };

  const manifestPath = path.join(targetDir, 'manifest.json');
  
  try {
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    console.log('📋 Creato manifest.json');
  } catch (error) {
    console.error('❌ Errore creazione manifest:', error.message);
  }
}

/**
 * Funzione principale
 */
function main() {
  console.log('🚀 Avvio copia documenti per build di produzione...\n');
  
  // Verifica che esista la directory build
  if (!fs.existsSync(buildDir)) {
    console.error('❌ Directory build non trovata. Esegui prima `npm run build-only`');
    process.exit(1);
  }
  
  // Crea directory documenti nella build
  ensureDir(targetDir);
  
  // Copia i file PDF esistenti
  const copiedCount = copyPdfFiles(sourceDir, targetDir);
  
  // Crea configurazione server
  createServerConfig();
  
  // Crea manifest
  createManifest(copiedCount);
  
  console.log(`\n✅ Processo completato!`);
  console.log(`📊 Statistiche:`);
  console.log(`   - File PDF copiati: ${copiedCount}`);
  console.log(`   - Directory target: ${targetDir}`);
  console.log(`   - Configurazione server: ✅`);
  console.log(`   - Manifest creato: ✅`);
  
  if (copiedCount === 0) {
    console.log(`\n💡 Suggerimento: I file PDF vengono generati durante l'uso dell'app.`);
    console.log(`   Al primo deploy potrebbero non esserci file da copiare.`);
  }
  
  console.log(`\n🌐 La build è pronta per il deploy in produzione!`);
}

// Esegui lo script
if (require.main === module) {
  main();
}

module.exports = {
  copyPdfFiles,
  ensureDir,
  createServerConfig,
  createManifest
};