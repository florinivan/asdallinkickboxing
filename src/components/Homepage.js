import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Homepage.css';

function Homepage() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Immagini della gallery - con placeholder SVG
  const galleryImages = [
    {
      src: '/images/gallery-1.svg',
      alt: 'Nuovo Corso All IN Kickboxing',
      caption: 'Il nostro nuovo corso di kickboxing zero contatto'
    },
    {
      src: '/images/gallery-2.svg',
      alt: 'Team All IN Kickboxing in azione',
      caption: 'Il nostro team durante gli allenamenti'
    },
    {
      src: '/images/gallery-3.svg',
      alt: 'Medaglie e successi',
      caption: 'I nostri successi nelle competizioni'
    },
    {
      src: '/images/gallery-4.jpg',
      alt: 'Atleti sul podio',
      caption: 'Atleti vincitori sul podio'
    },
    {
      src: '/images/gallery-5.jpg',
      alt: 'Competizioni e tornei',
      caption: 'Competizioni regionali'
    },
    {
      src: '/images/gallery-6.jpg',
      alt: 'Certificazioni e diplomi',
      caption: 'Certificazioni ufficiali FederKombat'
    }
  ];

  // Auto-play per la gallery
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        (prevIndex + 1) % galleryImages.length
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [galleryImages.length]);

  const handleImageClick = (index) => {
    setCurrentImageIndex(index);
  };

  return (
    <div className="homepage">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <div className="hero-logo">
            <img 
              src="/logo.png" 
              alt="ASD All IN Kickboxing Logo" 
              className="hero-logo-image"
            />
          </div>
          <h1 className="hero-title">
            <span className="hero-title-main">ASD ALL IN</span>
            <span className="hero-title-sub">KICKBOXING</span>
          </h1>
          <p className="hero-subtitle">
            Trasforma la tua passione in forza. Unisciti alla nostra famiglia di kickboxing e scopri il tuo potenziale.
          </p>
          <div className="hero-buttons">
            <Link to="/moduli" className="btn btn-primary">
              <i className="fas fa-file-alt"></i>
              Compila Moduli
            </Link>
            <a href="#about" className="btn btn-secondary">
              <i className="fas fa-info-circle"></i>
              Scopri di Più
            </a>
          </div>
        </div>
        <div className="hero-scroll-indicator">
          <i className="fas fa-chevron-down"></i>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="about-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Chi Siamo</h2>
            <div className="section-divider"></div>
          </div>
          
          <div className="about-content">
            <div className="about-text">
              <h3>Associazione Sportiva Dilettantistica All IN Kickboxing</h3>
              <p className="about-description">
                La nostra associazione rappresenta l'eccellenza nel mondo del kickboxing, 
                con atleti qualificati e istruttori certificati FederKombat. 
                Offriamo corsi per tutti i livelli, dalle basi fino alle competizioni professionali.
              </p>
              
              <div className="features-grid">
                <div className="feature-item">
                  <div className="feature-icon">
                    <i className="fas fa-medal"></i>
                  </div>
                  <h4>Atleti Vincenti</h4>
                  <p>I nostri atleti conquistano regolarmente podi nelle competizioni regionali e nazionali</p>
                </div>
                
                <div className="feature-item">
                  <div className="feature-icon">
                    <i className="fas fa-certificate"></i>
                  </div>
                  <h4>Certificati FederKombat</h4>
                  <p>Istruttori qualificati e certificazioni ufficiali per garantire la massima professionalità</p>
                </div>
                
                <div className="feature-item">
                  <div className="feature-icon">
                    <i className="fas fa-users"></i>
                  </div>
                  <h4>Team Unito</h4>
                  <p>Una famiglia di appassionati che si sostiene e cresce insieme</p>
                </div>
                
                <div className="feature-item">
                  <div className="feature-icon">
                    <i className="fas fa-dumbbell"></i>
                  </div>
                  <h4>Allenamenti Completi</h4>
                  <p>Programmi personalizzati per ogni livello e obiettivo sportivo</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="gallery-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">La Nostra Palestra in Azione</h2>
            <div className="section-divider"></div>
          </div>
          
          <div className="gallery-container">
            <div className="main-gallery">
              <div className="main-image-container">
                <img 
                  src={galleryImages[currentImageIndex].src}
                  alt={galleryImages[currentImageIndex].alt}
                  className="main-image"
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgdmlld0JveD0iMCAwIDgwMCA2MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI4MDAiIGhlaWdodD0iNjAwIiBmaWxsPSIjMkQyRDJEIi8+CjxwYXRoIGQ9Ik00MDAgMjAwQzQyNy42MTQgMjAwIDQ1MCAyMjIuMzg2IDQ1MCAyNTBTNDI3LjYxNCAzMDAgNDAwIDMwMFMzNTAgMjc3LjYxNCAzNTAgMjUwUzM3Mi4zODYgMjAwIDQwMCAyMDBaIiBmaWxsPSIjNEE0QTRBIi8+CjxwYXRoIGQ9Ik0zMjAgMzUwSDQ4MEM0ODguODM3IDM1MCA0OTYgMzU3LjE2MyA0OTYgMzY2VjQwMEg0ODBIMzIwSDMwNFYzNjZDMzA0IDM1Ny4xNjMgMzExLjE2MyAzNTAgMzIwIDM1MFoiIGZpbGw9IiM0QTRBNEEiLz4KPC9zdmc+';
                  }}
                />
                <div className="image-caption">
                  <p>{galleryImages[currentImageIndex].caption}</p>
                </div>
              </div>
              
              <div className="gallery-thumbnails">
                {galleryImages.map((image, index) => (
                  <div 
                    key={index}
                    className={`thumbnail ${index === currentImageIndex ? 'active' : ''}`}
                    onClick={() => handleImageClick(index)}
                  >
                    <img 
                      src={image.src}
                      alt={image.alt}
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjMkQyRDJEIi8+CjxjaXJjbGUgY3g9IjUwIiBjeT0iNDAiIHI9IjEwIiBmaWxsPSIjNEE0QTRBIi8+CjxyZWN0IHg9IjMwIiB5PSI2MCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjIwIiByeD0iNCIgZmlsbD0iIzRBNEE0QSIvPgo8L3N2Zz4K';
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Classes Section */}
      <section className="classes-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">I Nostri Corsi</h2>
            <div className="section-divider"></div>
          </div>
          
          <div className="classes-grid">
            <div className="class-card">
              <div className="class-icon">
                <i className="fas fa-fist-raised"></i>
              </div>
              <h3>Kickboxing Base</h3>
              <p>Perfetto per iniziare, impara le tecniche fondamentali in un ambiente sicuro e supportivo.</p>
              <div className="class-info">
                <span><i className="fas fa-clock"></i> 3 volte/settimana</span>
                <span><i className="fas fa-users"></i> Tutti i livelli</span>
              </div>
            </div>
            
            <div className="class-card">
              <div className="class-icon">
                <i className="fas fa-fire"></i>
              </div>
              <h3>Kickboxing Avanzata</h3>
              <p>Per atleti esperti che vogliono perfezionare le tecniche e prepararsi alle competizioni.</p>
              <div className="class-info">
                <span><i className="fas fa-clock"></i> 4 volte/settimana</span>
                <span><i className="fas fa-trophy"></i> Livello avanzato</span>
              </div>
            </div>
            
            <div className="class-card">
              <div className="class-icon">
                <i className="fas fa-heart"></i>
              </div>
              <h3>Zero Contatto</h3>
              <p>Corsi di kickboxing senza contatto fisico, ideali per fitness e benessere generale.</p>
              <div className="class-info">
                <span><i className="fas fa-clock"></i> Mer/Ven 21:00-22:00</span>
                <span><i className="fas fa-shield-alt"></i> Senza contatto</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="contact-section">
        <div className="container">
          <div className="contact-content">
            <div className="contact-info">
              <h2>Unisciti a Noi</h2>
              <p>Inizia il tuo percorso nel kickboxing con noi. Compila i moduli online per il tesseramento.</p>
              
              <div className="contact-details">
                <div className="contact-item">
                  <i className="fas fa-phone"></i>
                  <span>Ist. Adrian Macau: 3888988245</span>
                </div>
                <div className="contact-item">
                  <i className="fas fa-map-marker-alt"></i>
                  <span>Via Nicola Calipari 9 - Lungavilla (PV)</span>
                </div>
                <div className="contact-item">
                  <i className="fas fa-clock"></i>
                  <span>Mer/Ven: 21:00-22:00</span>
                </div>
              </div>
              
              <Link to="/moduli" className="btn btn-primary btn-large">
                <i className="fas fa-file-signature"></i>
                Compila Moduli di Tesseramento
              </Link>
            </div>
            
            <div className="contact-image">
              <div className="achievements">
                <div className="achievement-item">
                  <i className="fas fa-medal"></i>
                  <span>Atleti Certificati</span>
                </div>
                <div className="achievement-item">
                  <i className="fas fa-trophy"></i>
                  <span>Competizioni Vinte</span>
                </div>
                <div className="achievement-item">
                  <i className="fas fa-star"></i>
                  <span>Istruttori Qualificati</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Homepage;