<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Sistema di gestione documenti PDF per ASD All-in Kickboxing">
    <meta name="keywords" content="PDF, documenti, kickboxing, moduli, compilazione">
    <meta name="author" content="ASD All-in Kickboxing">
    
    <title>Sistema Gestione PDF - ASD All-in Kickboxing</title>
    
    <!-- Favicon -->
    <link rel="icon" type="image/x-icon" href="/public/favicon.ico">
    
    <!-- Preconnect for better performance -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://cdnjs.cloudflare.com">
    
    <!-- Font Awesome for icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    
    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    
    <!-- CSS Styles -->
    <style>
        /* Loading screen styles */
        .loading-screen {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            color: white;
            font-family: 'Inter', sans-serif;
        }
        
        .loading-spinner {
            width: 50px;
            height: 50px;
            border: 4px solid rgba(255, 255, 255, 0.3);
            border-top: 4px solid white;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 1rem;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        .loading-text {
            font-size: 1.2rem;
            font-weight: 500;
        }
        
        /* Fallback styles for no-JS */
        .no-js-message {
            display: none;
            text-align: center;
            padding: 2rem;
            background: #f8f9fa;
            border: 1px solid #dee2e6;
            border-radius: 8px;
            margin: 2rem auto;
            max-width: 600px;
        }
        
        .no-js .no-js-message {
            display: block;
        }
        
        .no-js .loading-screen {
            display: none;
        }
        
        /* React app container */
        #root {
            min-height: 100vh;
        }
        
        /* Hide content until React loads */
        #root:empty ~ .loading-screen {
            display: flex;
        }
    </style>
</head>
<body class="no-js">
    <!-- No JavaScript fallback -->
    <div class="no-js-message">
        <h2><i class="fas fa-exclamation-triangle"></i> JavaScript Richiesto</h2>
        <p>Questa applicazione richiede JavaScript per funzionare correttamente.</p>
        <p>Per favore abilita JavaScript nel tuo browser e ricarica la pagina.</p>
        <hr>
        <p><strong>Alternative:</strong></p>
        <ul style="text-align: left; display: inline-block;">
            <li><a href="/uploads/FKvedasipolicyprivacyperidettagli_compressed_organized.pdf" target="_blank">Visualizza PDF originale</a></li>
            <li>Contatta il supporto per assistenza</li>
        </ul>
    </div>
    
    <!-- React App Root -->
    <div id="root"></div>
    
    <!-- Loading Screen -->
    <div class="loading-screen" id="loading-screen">
        <div class="loading-spinner"></div>
        <div class="loading-text">Caricamento applicazione...</div>
    </div>
    
    <!-- Remove no-js class if JavaScript is enabled -->
    <script>
        document.body.classList.remove('no-js');
        
        // Hide loading screen when React app loads
        function hideLoadingScreen() {
            const loadingScreen = document.getElementById('loading-screen');
            if (loadingScreen) {
                loadingScreen.style.opacity = '0';
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                }, 300);
            }
        }
        
        // Check if React app has loaded
        function checkAppLoaded() {
            const root = document.getElementById('root');
            if (root && root.children.length > 0) {
                hideLoadingScreen();
            } else {
                setTimeout(checkAppLoaded, 100);
            }
        }
        
        // Start checking after a brief delay
        setTimeout(checkAppLoaded, 500);
        
        // Fallback: hide loading screen after 10 seconds
        setTimeout(hideLoadingScreen, 10000);
    </script>
    
    <?php
    // Determina se siamo in modalità sviluppo o produzione
    $is_development = (
        isset($_SERVER['HTTP_HOST']) && 
        (strpos($_SERVER['HTTP_HOST'], 'localhost') !== false || 
         strpos($_SERVER['HTTP_HOST'], '127.0.0.1') !== false ||
         strpos($_SERVER['HTTP_HOST'], '.local') !== false)
    );
    
    if ($is_development) {
        // Modalità sviluppo - carica da React dev server
        echo '<script>
        // Check if React dev server is running
        fetch("http://localhost:3000")
            .then(() => {
                // Dev server is running, redirect
                if (window.location.port !== "3000") {
                    window.location.href = "http://localhost:3000";
                }
            })
            .catch(() => {
                // Dev server not running, show message
                document.getElementById("loading-screen").innerHTML = `
                    <div style="text-align: center; padding: 2rem;">
                        <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                        <h2>Server di Sviluppo Non Attivo</h2>
                        <p>Per utilizzare l\'applicazione in modalità sviluppo:</p>
                        <ol style="text-align: left; display: inline-block; margin: 1rem 0;">
                            <li>Apri il terminale nella cartella del progetto</li>
                            <li>Esegui <code style="background: rgba(255,255,255,0.2); padding: 0.25rem;">npm install</code></li>
                            <li>Esegui <code style="background: rgba(255,255,255,0.2); padding: 0.25rem;">npm start</code></li>
                        </ol>
                        <p style="margin-top: 2rem;">
                            <a href="/uploads/FKvedasipolicyprivacyperidettagli_compressed_organized.pdf" 
                               target="_blank" 
                               style="color: white; text-decoration: underline;">
                                Visualizza PDF originale
                            </a>
                        </p>
                    </div>
                `;
            });
        </script>';
    } else {
        // Modalità produzione - carica build React
        if (file_exists('./build/index.html')) {
            // Carica la build di produzione
            $build_content = file_get_contents('./build/index.html');
            
            // Sostituisci i percorsi relativi con quelli assoluti se necessario
            $build_content = str_replace(
                ['href="/', 'src="/'],
                ['href="/', 'src="/'],
                $build_content
            );
            
            // Estrai solo il contenuto del body e degli script
            preg_match('/<body[^>]*>(.*?)<\/body>/s', $build_content, $body_matches);
            preg_match_all('/<script[^>]*src="([^"]*)"[^>]*><\/script>/', $build_content, $script_matches);
            preg_match_all('/<link[^>]*href="([^"]*\.css)"[^>]*>/', $build_content, $css_matches);
            
            // Includi CSS
            if (!empty($css_matches[1])) {
                foreach ($css_matches[1] as $css_file) {
                    echo '<link rel="stylesheet" href="' . htmlspecialchars($css_file) . '">' . "\n";
                }
            }
            
            // Se abbiamo il contenuto del body, inseriscilo nel root
            if (!empty($body_matches[1])) {
                echo '<script>
                document.getElementById("root").innerHTML = ' . json_encode($body_matches[1]) . ';
                hideLoadingScreen();
                </script>';
            }
            
            // Includi JavaScript
            if (!empty($script_matches[1])) {
                foreach ($script_matches[1] as $js_file) {
                    echo '<script src="' . htmlspecialchars($js_file) . '"></script>' . "\n";
                }
            }
        } else {
            // Build non trovata
            echo '<script>
            document.getElementById("loading-screen").innerHTML = `
                <div style="text-align: center; padding: 2rem;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                    <h2>Applicazione Non Compilata</h2>
                    <p>L\'applicazione React non è stata ancora compilata per la produzione.</p>
                    <p>Per compilare l\'applicazione:</p>
                    <ol style="text-align: left; display: inline-block; margin: 1rem 0;">
                        <li>Esegui <code style="background: rgba(255,255,255,0.2); padding: 0.25rem;">npm install</code></li>
                        <li>Esegui <code style="background: rgba(255,255,255,0.2); padding: 0.25rem;">npm run build</code></li>
                    </ol>
                    <p style="margin-top: 2rem;">
                        <a href="/uploads/FKvedasipolicyprivacyperidettagli_compressed_organized.pdf" 
                           target="_blank" 
                           style="color: white; text-decoration: underline;">
                            Visualizza PDF originale
                        </a>
                    </p>
                </div>
            `;
            </script>';
        }
    }
    ?>
    
    <!-- Service Worker Registration (optional, for PWA functionality) -->
    <script>
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                        console.log('SW registered: ', registration);
                    })
                    .catch(function(registrationError) {
                        console.log('SW registration failed: ', registrationError);
                    });
            });
        }
    </script>
</body>
</html>