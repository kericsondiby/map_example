import React, { useState, useRef, useEffect } from 'react';

const CarouselAuto = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const trackRef = useRef(null);
  const intervalRef = useRef(null);

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

  // Gérer l'auto-play
  useEffect(() => {
    if (isAutoPlay) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex(prevIndex => {
          if (prevIndex >= maxIndex) {
            return 0;
          }
          return prevIndex + 1;
        });
      }, 2000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isAutoPlay, maxIndex]);

  const slideNext = () => {
    if (currentIndex < maxIndex) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  const slidePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else {
      setCurrentIndex(maxIndex);
    }
  };

  const toggleAutoPlay = () => {
    setIsAutoPlay(!isAutoPlay);
  };

  return (
    <div style={{
      width: '100%',
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '40px 20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{
        textAlign: 'center',
        color: '#667eea',
        marginBottom: '30px'
      }}>
        🔄 Carousel Auto
      </h1>

      {/* Contrôles */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '10px',
        marginBottom: '20px',
        flexWrap: 'wrap'
      }}>
        <button
          onClick={slidePrev}
          style={{
            background: '#667eea',
            color: 'white',
            border: 'none',
            padding: '12px 25px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold'
          }}
        >
          ◀️ Précédent
        </button>
        <button
          onClick={toggleAutoPlay}
          style={{
            background: isAutoPlay ? '#ff6b6b' : '#11998e',
            color: 'white',
            border: 'none',
            padding: '12px 35px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)'
          }}
        >
          {isAutoPlay ? '⏸️ Pause' : '▶️ Démarrer Auto'}
        </button>
        <button
          onClick={slideNext}
          style={{
            background: '#667eea',
            color: 'white',
            border: 'none',
            padding: '12px 25px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold'
          }}
        >
          Suivant ▶️
        </button>
      </div>

      {/* Indicateurs */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '8px',
        marginBottom: '20px'
      }}>
        {Array.from({ length: maxIndex + 1 }).map((_, index) => (
          <div
            key={index}
            onClick={() => setCurrentIndex(index)}
            style={{
              width: index === currentIndex ? '30px' : '10px',
              height: '10px',
              borderRadius: index === currentIndex ? '5px' : '50%',
              background: index === currentIndex ? '#667eea' : '#ddd',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          />
        ))}
      </div>

      {/* Carousel */}
      <div style={{
        overflow: 'hidden',
        background: '#f8f9fa',
        borderRadius: '12px',
        padding: '30px 20px',
        position: 'relative'
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

      {/* Info */}
      <div style={{
        textAlign: 'center',
        marginTop: '20px'
      }}>
        <div style={{
          background: isAutoPlay ? 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' : 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
          display: 'inline-block',
          padding: '15px 30px',
          borderRadius: '10px',
          color: isAutoPlay ? 'white' : '#666',
          fontWeight: 'bold',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          fontSize: '16px'
        }}>
          {isAutoPlay ? '🔄 Défilement automatique activé' : '⏸️ Mode manuel'}
        </div>
        <div style={{
          marginTop: '15px',
          color: '#666',
          fontSize: '14px'
        }}>
          Affichage : {currentIndex + 1} à {Math.min(currentIndex + ITEMS_VISIBLE, elements.length)} sur {elements.length} éléments
        </div>
      </div>
    </div>
  );
};

export default CarouselAuto;
