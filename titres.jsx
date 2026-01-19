import React, { useState } from 'react';

const TitresBoursiers = () => {
  const [viewMode, setViewMode] = useState('cards');

  // Données exactes du modèle de l'utilisateur
  const titresData = {
    nombre_titres: 2,
    titres: [
      {
        code_isin: "CI0000001234",
        country: "Côte d'Ivoire",
        created_at: "2025-12-24T14:00:00",
        id_souverain: 1,
        nom_souverain: "Côte d'Ivoire",
        titre_id: 101,
        updated_at: "2025-12-24T15:30:00"
      },
      {
        code_isin: "FR0000005678",
        country: "France",
        created_at: "2025-12-20T10:00:00",
        id_souverain: 2,
        nom_souverain: "République Française",
        titre_id: 102,
        updated_at: "2025-12-23T16:45:00"
      },
      {
        code_isin: "US0000009876",
        country: "États-Unis",
        created_at: "2025-12-18T08:30:00",
        id_souverain: 3,
        nom_souverain: "États-Unis d'Amérique",
        titre_id: 103,
        updated_at: "2025-12-22T14:20:00"
      }
    ]
  };

  // Formater la date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      day: '2-digit',
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Générer un gradient selon l'index
  const getGradient = (index) => {
    const gradients = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
      'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
    ];
    return gradients[index % gradients.length];
  };

  const getShadowColor = (index) => {
    const colors = [
      'rgba(102, 126, 234, 0.4)',
      'rgba(240, 147, 251, 0.4)',
      'rgba(79, 172, 254, 0.4)',
      'rgba(250, 112, 154, 0.4)',
      'rgba(48, 207, 208, 0.4)',
      'rgba(168, 237, 234, 0.4)'
    ];
    return colors[index % colors.length];
  };

  const getHoverShadow = (index) => {
    const colors = [
      'rgba(102, 126, 234, 0.6)',
      'rgba(240, 147, 251, 0.6)',
      'rgba(79, 172, 254, 0.6)',
      'rgba(250, 112, 154, 0.6)',
      'rgba(48, 207, 208, 0.6)',
      'rgba(168, 237, 234, 0.6)'
    ];
    return colors[index % colors.length];
  };

  // Obtenir le drapeau selon le pays
  const getDrapeau = (country) => {
    const drapeaux = {
      "Côte d'Ivoire": "🇨🇮",
      "France": "🇫🇷",
      "États-Unis": "🇺🇸",
      "USA": "🇺🇸",
      "United States": "🇺🇸"
    };
    return drapeaux[country] || "🏦";
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#ffffff',
      padding: '20px',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '20px',
        padding: '30px',
        marginBottom: '30px',
        boxShadow: '0 8px 32px 0 rgba(102, 126, 234, 0.37)'
      }}>
        <h1 style={{
          margin: '0 0 10px 0',
          fontSize: '32px',
          fontWeight: '700',
          color: '#fff'
        }}>
          Titres Boursiers
        </h1>
        <p style={{
          margin: 0,
          fontSize: '16px',
          color: 'rgba(255, 255, 255, 0.9)'
        }}>
          {titresData.nombre_titres} titre{titresData.nombre_titres > 1 ? 's' : ''} enregistré{titresData.nombre_titres > 1 ? 's' : ''}
        </p>
      </div>

      {/* KPIs */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        <div style={{
          background: '#fff',
          borderRadius: '16px',
          padding: '24px',
          border: '1px solid #e5e7eb',
          boxShadow: '0 4px 16px 0 rgba(0, 0, 0, 0.08)',
          transition: 'all 0.3s ease',
          cursor: 'pointer'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-5px)';
          e.currentTarget.style.boxShadow = '0 8px 24px 0 rgba(0, 0, 0, 0.12)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 16px 0 rgba(0, 0, 0, 0.08)';
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <span style={{ fontSize: '28px' }}>📊</span>
            <span style={{
              background: '#3B82F6',
              color: '#fff',
              padding: '4px 10px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: '600'
            }}>
              Total
            </span>
          </div>
          <div style={{ color: '#6b7280', fontSize: '13px', marginBottom: '8px' }}>
            Nombre de Titres
          </div>
          <div style={{ color: '#111827', fontSize: '28px', fontWeight: '700' }}>
            {titresData.nombre_titres}
          </div>
        </div>

        <div style={{
          background: '#fff',
          borderRadius: '16px',
          padding: '24px',
          border: '1px solid #e5e7eb',
          boxShadow: '0 4px 16px 0 rgba(0, 0, 0, 0.08)',
          transition: 'all 0.3s ease',
          cursor: 'pointer'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-5px)';
          e.currentTarget.style.boxShadow = '0 8px 24px 0 rgba(0, 0, 0, 0.12)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 16px 0 rgba(0, 0, 0, 0.08)';
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <span style={{ fontSize: '28px' }}>🌍</span>
            <span style={{
              background: '#10B981',
              color: '#fff',
              padding: '4px 10px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: '600'
            }}>
              Pays
            </span>
          </div>
          <div style={{ color: '#6b7280', fontSize: '13px', marginBottom: '8px' }}>
            Pays Couverts
          </div>
          <div style={{ color: '#111827', fontSize: '20px', fontWeight: '700' }}>
            {[...new Set(titresData.titres.map(t => t.country))].join(', ')}
          </div>
        </div>
      </div>

      {/* Toggle View */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        marginBottom: '30px'
      }}>
        <div style={{
          background: '#fff',
          borderRadius: '16px',
          padding: '6px',
          border: '1px solid #e5e7eb',
          boxShadow: '0 2px 8px 0 rgba(0, 0, 0, 0.08)',
          display: 'flex',
          gap: '6px'
        }}>
          <button
            onClick={() => setViewMode('table')}
            style={{
              background: viewMode === 'table' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent',
              border: 'none',
              color: viewMode === 'table' ? '#fff' : '#6b7280',
              padding: '12px 24px',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span>📊</span> Tableau
          </button>
          <button
            onClick={() => setViewMode('cards')}
            style={{
              background: viewMode === 'cards' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent',
              border: 'none',
              color: viewMode === 'cards' ? '#fff' : '#6b7280',
              padding: '12px 24px',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span>🎴</span> Cards
          </button>
        </div>
      </div>

      {/* Contenu */}
      {viewMode === 'table' ? (
        /* VUE TABLEAU */
        <div style={{
          background: '#fff',
          borderRadius: '20px',
          padding: '30px',
          border: '1px solid #e5e7eb',
          boxShadow: '0 4px 16px 0 rgba(0, 0, 0, 0.08)',
          overflowX: 'auto'
        }}>
          <h2 style={{
            margin: '0 0 25px 0',
            fontSize: '24px',
            fontWeight: '600',
            color: '#111827'
          }}>
            Liste des Titres
          </h2>

          <table style={{
            width: '100%',
            borderCollapse: 'separate',
            borderSpacing: '0',
            color: '#111827'
          }}>
            <thead>
              <tr style={{
                background: '#f9fafb',
                borderRadius: '12px'
              }}>
                <th style={{
                  padding: '16px',
                  textAlign: 'left',
                  fontSize: '14px',
                  fontWeight: '600',
                  borderBottom: '2px solid #e5e7eb',
                  color: '#374151'
                }}>Code ISIN</th>
                <th style={{
                  padding: '16px',
                  textAlign: 'left',
                  fontSize: '14px',
                  fontWeight: '600',
                  borderBottom: '2px solid #e5e7eb',
                  color: '#374151'
                }}>Pays</th>
                <th style={{
                  padding: '16px',
                  textAlign: 'left',
                  fontSize: '14px',
                  fontWeight: '600',
                  borderBottom: '2px solid #e5e7eb',
                  color: '#374151'
                }}>Nom Souverain</th>
                <th style={{
                  padding: '16px',
                  textAlign: 'center',
                  fontSize: '14px',
                  fontWeight: '600',
                  borderBottom: '2px solid #e5e7eb',
                  color: '#374151'
                }}>ID Titre</th>
                <th style={{
                  padding: '16px',
                  textAlign: 'center',
                  fontSize: '14px',
                  fontWeight: '600',
                  borderBottom: '2px solid #e5e7eb',
                  color: '#374151'
                }}>ID Souverain</th>
                <th style={{
                  padding: '16px',
                  textAlign: 'left',
                  fontSize: '14px',
                  fontWeight: '600',
                  borderBottom: '2px solid #e5e7eb',
                  color: '#374151'
                }}>Créé le</th>
                <th style={{
                  padding: '16px',
                  textAlign: 'left',
                  fontSize: '14px',
                  fontWeight: '600',
                  borderBottom: '2px solid #e5e7eb',
                  color: '#374151'
                }}>Mis à jour</th>
              </tr>
            </thead>
            <tbody>
              {titresData.titres.map((titre, index) => (
                <tr key={titre.titre_id} style={{
                  background: index % 2 === 0 ? 'rgba(99, 102, 241, 0.03)' : 'transparent',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(99, 102, 241, 0.08)';
                  e.currentTarget.style.transform = 'scale(1.01)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = index % 2 === 0 ? 'rgba(99, 102, 241, 0.03)' : 'transparent';
                  e.currentTarget.style.transform = 'scale(1)';
                }}>
                  <td style={{
                    padding: '20px 16px',
                    borderBottom: '1px solid #e5e7eb',
                    fontFamily: 'monospace',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#6366f1'
                  }}>{titre.code_isin}</td>
                  <td style={{
                    padding: '20px 16px',
                    borderBottom: '1px solid #e5e7eb',
                    fontSize: '15px',
                    color: '#374151'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '20px' }}>{getDrapeau(titre.country)}</span>
                      {titre.country}
                    </div>
                  </td>
                  <td style={{
                    padding: '20px 16px',
                    borderBottom: '1px solid #e5e7eb',
                    fontSize: '15px',
                    color: '#374151',
                    fontWeight: '500'
                  }}>{titre.nom_souverain}</td>
                  <td style={{
                    padding: '20px 16px',
                    textAlign: 'center',
                    borderBottom: '1px solid #e5e7eb'
                  }}>
                    <span style={{
                      background: '#6366f1',
                      color: '#fff',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: '600'
                    }}>
                      {titre.titre_id}
                    </span>
                  </td>
                  <td style={{
                    padding: '20px 16px',
                    textAlign: 'center',
                    borderBottom: '1px solid #e5e7eb'
                  }}>
                    <span style={{
                      background: '#10B981',
                      color: '#fff',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: '600'
                    }}>
                      {titre.id_souverain}
                    </span>
                  </td>
                  <td style={{
                    padding: '20px 16px',
                    borderBottom: '1px solid #e5e7eb',
                    fontSize: '13px',
                    color: '#6b7280'
                  }}>{formatDate(titre.created_at)}</td>
                  <td style={{
                    padding: '20px 16px',
                    borderBottom: '1px solid #e5e7eb',
                    fontSize: '13px',
                    color: '#6b7280'
                  }}>{formatDate(titre.updated_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* VUE CARDS - MODÈLE MAGNIFIQUE */
        <div>
          <h2 style={{
            margin: '0 0 30px 0',
            fontSize: '24px',
            fontWeight: '600',
            color: '#111827'
          }}>
            Liste des Titres
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
            gap: '28px'
          }}>
            {titresData.titres.map((titre, index) => (
              <div key={titre.titre_id} style={{
                background: getGradient(index),
                borderRadius: '24px',
                padding: '36px',
                boxShadow: `0 10px 40px 0 ${getShadowColor(index)}`,
                transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-12px) scale(1.03)';
                e.currentTarget.style.boxShadow = `0 25px 60px 0 ${getHoverShadow(index)}`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = `0 10px 40px 0 ${getShadowColor(index)}`;
              }}>
                {/* Cercles décoratifs */}
                <div style={{
                  position: 'absolute',
                  width: '280px',
                  height: '280px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.1)',
                  top: '-140px',
                  right: '-140px',
                  pointerEvents: 'none'
                }}></div>
                <div style={{
                  position: 'absolute',
                  width: '200px',
                  height: '200px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.05)',
                  bottom: '-100px',
                  left: '-100px',
                  pointerEvents: 'none'
                }}></div>

                {/* Header avec drapeau */}
                <div style={{ marginBottom: '28px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
                  <div style={{
                    width: '90px',
                    height: '90px',
                    background: 'rgba(255, 255, 255, 0.25)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '26px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 20px',
                    fontSize: '50px',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
                    border: '2px solid rgba(255, 255, 255, 0.3)'
                  }}>
                    {getDrapeau(titre.country)}
                  </div>
                  
                  {/* Code ISIN Badge */}
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.3)',
                    backdropFilter: 'blur(10px)',
                    color: '#fff',
                    padding: '12px 28px',
                    borderRadius: '28px',
                    fontSize: '15px',
                    fontWeight: '800',
                    display: 'inline-block',
                    marginBottom: '16px',
                    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.2)',
                    letterSpacing: '1.5px',
                    fontFamily: 'monospace',
                    border: '2px solid rgba(255, 255, 255, 0.4)'
                  }}>
                    {titre.code_isin}
                  </div>

                  {/* Nom du Souverain */}
                  <h3 style={{ 
                    margin: '0 0 8px 0', 
                    fontSize: '26px', 
                    color: '#fff', 
                    fontWeight: '800', 
                    letterSpacing: '-0.8px',
                    textShadow: '0 3px 10px rgba(0, 0, 0, 0.3)',
                    lineHeight: '1.2'
                  }}>
                    {titre.nom_souverain}
                  </h3>

                  {/* Pays */}
                  <p style={{ 
                    margin: 0, 
                    color: 'rgba(255, 255, 255, 0.95)', 
                    fontSize: '16px', 
                    fontWeight: '600',
                    letterSpacing: '0.5px',
                    textShadow: '0 2px 6px rgba(0, 0, 0, 0.2)'
                  }}>
                    {titre.country}
                  </p>
                </div>

                {/* Container des Informations */}
                <div style={{ 
                  background: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: '22px',
                  padding: '26px',
                  position: 'relative',
                  zIndex: 1,
                  border: '1px solid rgba(255, 255, 255, 0.35)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                }}>
                  {/* ID Badges en haut */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-around',
                    marginBottom: '24px',
                    paddingBottom: '20px',
                    borderBottom: '2px solid rgba(255, 255, 255, 0.3)'
                  }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ 
                        color: 'rgba(255, 255, 255, 0.9)', 
                        fontSize: '12px', 
                        fontWeight: '600',
                        marginBottom: '8px',
                        textTransform: 'uppercase',
                        letterSpacing: '1px'
                      }}>
                        🆔 ID Titre
                      </div>
                      <div style={{
                        background: 'rgba(255, 255, 255, 0.3)',
                        color: '#fff',
                        padding: '10px 20px',
                        borderRadius: '16px',
                        fontSize: '20px',
                        fontWeight: '800',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                      }}>
                        {titre.titre_id}
                      </div>
                    </div>

                    <div style={{ textAlign: 'center' }}>
                      <div style={{ 
                        color: 'rgba(255, 255, 255, 0.9)', 
                        fontSize: '12px', 
                        fontWeight: '600',
                        marginBottom: '8px',
                        textTransform: 'uppercase',
                        letterSpacing: '1px'
                      }}>
                        🏛️ ID Souverain
                      </div>
                      <div style={{
                        background: 'rgba(255, 255, 255, 0.3)',
                        color: '#fff',
                        padding: '10px 20px',
                        borderRadius: '16px',
                        fontSize: '20px',
                        fontWeight: '800',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                      }}>
                        {titre.id_souverain}
                      </div>
                    </div>
                  </div>

                  {/* Dates */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '14px',
                      background: 'rgba(255, 255, 255, 0.15)',
                      borderRadius: '14px'
                    }}>
                      <div style={{ 
                        color: '#fff', 
                        fontSize: '14px', 
                        fontWeight: '600', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '10px' 
                      }}>
                        <span style={{ fontSize: '20px' }}>📅</span>
                        <span>Créé le</span>
                      </div>
                      <div style={{ 
                        color: '#fff', 
                        fontSize: '13px', 
                        fontWeight: '700',
                        textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                        textAlign: 'right'
                      }}>
                        {formatDate(titre.created_at)}
                      </div>
                    </div>

                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '14px',
                      background: 'rgba(255, 255, 255, 0.15)',
                      borderRadius: '14px'
                    }}>
                      <div style={{ 
                        color: '#fff', 
                        fontSize: '14px', 
                        fontWeight: '600', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '10px' 
                      }}>
                        <span style={{ fontSize: '20px' }}>🔄</span>
                        <span>Mis à jour</span>
                      </div>
                      <div style={{ 
                        color: '#fff', 
                        fontSize: '13px', 
                        fontWeight: '700',
                        textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                        textAlign: 'right'
                      }}>
                        {formatDate(titre.updated_at)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{
        background: '#f9fafb',
        borderRadius: '16px',
        padding: '20px',
        marginTop: '30px',
        border: '1px solid #e5e7eb',
        textAlign: 'center',
        color: '#6b7280',
        fontSize: '14px'
      }}>
        Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { 
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}
      </div>
    </div>
  );
};

export default TitresBoursiers;
