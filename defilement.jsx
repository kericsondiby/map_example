import React, { useState, useRef, useEffect } from 'react';

const CarouselAutoSansBtn = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const trackRef = useRef(null);

  // Données d'exemple
  const elements = [
    { icon: "🚀", titre: "Fusée", numero: "#001" },
    { icon: "💻", titre: "Ordinateur", numero: "#002" },
    { icon: "📱", titre: "Mobile", numero: "#003" },
    { icon: "🎨", titre: "Design", numero: "#004" },
    { icon: "🎯", titre: "Cible", numero: "#005" },
    { icon: "💡", titre: "Idée", numero: "#006" },
    { icon: "🔥", titre: "Feu", numero: "#007" },
    { icon: "⚡", titre: "Éclair", numero: "#008" },
    { icon: "🌟", titre: "Étoile", numero: "#009" },
    { icon: "🎪", titre: "Cirque", numero: "#010" },
    { icon: "🎭", titre: "Théâtre", numero: "#011" },
    { icon: "🎬", titre: "Cinéma", numero: "#012" },
    { icon: "🎮", titre: "Jeu", numero: "#013" },
    { icon: "🎲", titre: "Dés", numero: "#014" },
    { icon: "🎯", titre: "Précision", numero: "#015" },
    { icon: "🎨", titre: "Art", numero: "#016" }
  ];

  const ITEMS_VISIBLE = 8;
  const maxIndex = elements.length - ITEMS_VISIBLE;

  // Mettre à jour la position
  useEffect(() => {
    if (trackRef.current) {
      const offset = -currentIndex * 170;
      trackRef.current.style.transform = `translateX(${offset}px)`;
    }
  }, [currentIndex]);

  // Défilement automatique
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex(prevIndex => {
        if (prevIndex >= maxIndex) {
          return 0;
        }
        return prevIndex + 1;
      });
    }, 2000); // Défile toutes les 2 secondes

    return () => clearInterval(interval);
  }, [maxIndex]);

  return (
    <div style={{
      width: '100%',
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '40px 20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Carousel */}
      <div style={{
        overflow: 'hidden',
        background: '#f8f9fa',
        borderRadius: '12px',
        padding: '30px 20px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)'
      }}>
        <div
          ref={trackRef}
          style={{
            display: 'flex',
            gap: '20px',
            transition: 'transform 0.5s ease'
          }}
        >
          {elements.map((element, index) => (
            <div
              key={index}
              style={{
                minWidth: '150px',
                flexShrink: 0,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '10px',
                padding: '20px',
                color: 'white',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'transform 0.3s ease',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05) translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.25)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1) translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
              }}
            >
              <div style={{ fontSize: '40px', marginBottom: '10px' }}>
                {element.icon}
              </div>
              <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '5px' }}>
                {element.titre}
              </div>
              <div style={{ fontSize: '12px', opacity: 0.8 }}>
                {element.numero}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Info simple */}
      <div style={{
        textAlign: 'center',
        marginTop: '20px',
        color: '#666',
        fontSize: '14px'
      }}>
        🔄 Défilement automatique • Affichage : {currentIndex + 1} à {Math.min(currentIndex + ITEMS_VISIBLE, elements.length)} sur {elements.length}
      </div>
    </div>
  );
};

export default CarouselAutoSansBtn;
