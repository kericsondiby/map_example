import React, { useState } from 'react';
import ReactApexChart from 'react-apexcharts';

const TitresSocieteBourse = () => {
  const [selectedType, setSelectedType] = useState('all');

  // Données des titres
  const titres = {
    actions: {
      ordinaires: {
        total: 1500000,
        valeurNominale: 10,
        valeurMarche: 45.50,
        capitalisation: 68250000,
        dividende: 2.50,
        rendement: 5.49,
        variation: 12.5
      },
      preferentielles: {
        total: 250000,
        valeurNominale: 10,
        valeurMarche: 42.00,
        capitalisation: 10500000,
        dividende: 3.00,
        rendement: 7.14,
        variation: 8.2
      }
    },
    obligations: {
      senior: {
        total: 500,
        valeurNominale: 1000,
        valeurMarche: 1020,
        capitalisation: 510000,
        coupon: 4.5,
        maturite: '2030',
        rating: 'AA-',
        variation: 2.0
      },
      subordinees: {
        total: 200,
        valeurNominale: 1000,
        valeurMarche: 980,
        capitalisation: 196000,
        coupon: 6.0,
        maturite: '2028',
        rating: 'A+',
        variation: -2.0
      }
    }
  };

  // Données pour le graphique de répartition
  const repartitionData = {
    series: [
      titres.actions.ordinaires.capitalisation,
      titres.actions.preferentielles.capitalisation,
      titres.obligations.senior.capitalisation,
      titres.obligations.subordinees.capitalisation
    ],
    options: {
      chart: {
        type: 'donut',
        fontFamily: 'Inter, sans-serif',
        toolbar: { show: false }
      },
      labels: ['Actions Ordinaires', 'Actions Préférentielles', 'Obligations Senior', 'Obligations Subordonnées'],
      colors: ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B'],
      legend: {
        position: 'bottom',
        labels: { colors: '#fff' }
      },
      plotOptions: {
        pie: {
          donut: {
            size: '65%',
            labels: {
              show: true,
              total: {
                show: true,
                label: 'Capitalisation Totale',
                fontSize: '14px',
                color: '#fff',
                formatter: () => '79.46 M€'
              }
            }
          }
        }
      },
      dataLabels: {
        enabled: true,
        formatter: (val) => val.toFixed(1) + '%',
        style: { fontSize: '12px', colors: ['#fff'] }
      },
      tooltip: {
        theme: 'dark',
        y: {
          formatter: (val) => val.toLocaleString('fr-FR') + ' €'
        }
      }
    }
  };

  // Données pour le graphique d'évolution
  const evolutionData = {
    series: [
      {
        name: 'Actions Ordinaires',
        data: [38.5, 40.2, 42.1, 41.8, 43.5, 45.5]
      },
      {
        name: 'Actions Préférentielles',
        data: [36.0, 37.5, 38.8, 39.2, 40.5, 42.0]
      }
    ],
    options: {
      chart: {
        type: 'area',
        fontFamily: 'Inter, sans-serif',
        toolbar: { show: false },
        zoom: { enabled: false }
      },
      colors: ['#3B82F6', '#8B5CF6'],
      dataLabels: { enabled: false },
      stroke: {
        curve: 'smooth',
        width: 2
      },
      fill: {
        type: 'gradient',
        gradient: {
          opacityFrom: 0.6,
          opacityTo: 0.1,
        }
      },
      xaxis: {
        categories: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'],
        labels: { style: { colors: '#fff' } }
      },
      yaxis: {
        labels: {
          style: { colors: '#fff' },
          formatter: (val) => val.toFixed(0) + ' €'
        }
      },
      grid: {
        borderColor: 'rgba(255, 255, 255, 0.1)',
        strokeDashArray: 4
      },
      legend: {
        position: 'top',
        labels: { colors: '#fff' }
      },
      tooltip: {
        theme: 'dark',
        y: {
          formatter: (val) => val.toFixed(2) + ' €'
        }
      }
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
      padding: '20px',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        borderRadius: '20px',
        padding: '30px',
        marginBottom: '30px',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)'
      }}>
        <h1 style={{
          margin: '0 0 10px 0',
          fontSize: '32px',
          fontWeight: '700',
          color: '#fff',
          background: 'linear-gradient(to right, #fff, #f0f0f0)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Présentation des Titres
        </h1>
        <p style={{
          margin: 0,
          fontSize: '16px',
          color: 'rgba(255, 255, 255, 0.8)'
        }}>
          Vue d'ensemble de la structure du capital et des titres de créance
        </p>
      </div>

      {/* KPIs Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        {[
          { label: 'Capitalisation Totale', value: '79.46 M€', icon: '💰', color: '#3B82F6', evolution: '+10.5%' },
          { label: 'Nombre de Titres', value: '1,750,700', icon: '📊', color: '#8B5CF6', evolution: '+2.5%' },
          { label: 'Rendement Moyen', value: '5.53%', icon: '📈', color: '#10B981', evolution: '+0.8%' },
          { label: 'Valeur Moyenne', value: '45.39 €', icon: '💎', color: '#F59E0B', evolution: '+12.3%' }
        ].map((kpi, index) => (
          <div key={index} style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            padding: '24px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
            transition: 'all 0.3s ease',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px)';
            e.currentTarget.style.boxShadow = '0 12px 40px 0 rgba(31, 38, 135, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 8px 32px 0 rgba(31, 38, 135, 0.37)';
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <span style={{ fontSize: '28px' }}>{kpi.icon}</span>
              <span style={{
                background: kpi.color,
                color: '#fff',
                padding: '4px 10px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: '600'
              }}>
                {kpi.evolution}
              </span>
            </div>
            <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '13px', marginBottom: '8px' }}>
              {kpi.label}
            </div>
            <div style={{ color: '#fff', fontSize: '28px', fontWeight: '700' }}>
              {kpi.value}
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
        gap: '30px',
        marginBottom: '30px'
      }}>
        {/* Graphique de Répartition */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          borderRadius: '20px',
          padding: '30px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)'
        }}>
          <h2 style={{
            margin: '0 0 20px 0',
            fontSize: '20px',
            fontWeight: '600',
            color: '#fff'
          }}>
            Répartition de la Capitalisation
          </h2>
          <ReactApexChart
            options={repartitionData.options}
            series={repartitionData.series}
            type="donut"
            height={350}
          />
        </div>

        {/* Graphique d'Évolution */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          borderRadius: '20px',
          padding: '30px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)'
        }}>
          <h2 style={{
            margin: '0 0 20px 0',
            fontSize: '20px',
            fontWeight: '600',
            color: '#fff'
          }}>
            Évolution des Cours (6 Mois)
          </h2>
          <ReactApexChart
            options={evolutionData.options}
            series={evolutionData.series}
            type="area"
            height={350}
          />
        </div>
      </div>

      {/* Détails des Titres */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        borderRadius: '20px',
        padding: '30px',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)'
      }}>
        <h2 style={{
          margin: '0 0 25px 0',
          fontSize: '24px',
          fontWeight: '600',
          color: '#fff'
        }}>
          Détails des Titres
        </h2>

        {/* Actions Ordinaires */}
        <div style={{
          background: 'rgba(59, 130, 246, 0.1)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '20px',
          border: '1px solid rgba(59, 130, 246, 0.3)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ margin: '0 0 5px 0', fontSize: '20px', color: '#fff', fontWeight: '600' }}>
                Actions Ordinaires
              </h3>
              <p style={{ margin: 0, color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px' }}>
                Titre de propriété avec droit de vote
              </p>
            </div>
            <div style={{
              background: titres.actions.ordinaires.variation > 0 ? '#10B981' : '#EF4444',
              color: '#fff',
              padding: '8px 16px',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600'
            }}>
              {titres.actions.ordinaires.variation > 0 ? '↗' : '↘'} {titres.actions.ordinaires.variation}%
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
            {[
              { label: 'Nombre de titres', value: titres.actions.ordinaires.total.toLocaleString('fr-FR') },
              { label: 'Valeur nominale', value: titres.actions.ordinaires.valeurNominale.toFixed(2) + ' €' },
              { label: 'Cours actuel', value: titres.actions.ordinaires.valeurMarche.toFixed(2) + ' €' },
              { label: 'Capitalisation', value: (titres.actions.ordinaires.capitalisation / 1000000).toFixed(2) + ' M€' },
              { label: 'Dividende/action', value: titres.actions.ordinaires.dividende.toFixed(2) + ' €' },
              { label: 'Rendement', value: titres.actions.ordinaires.rendement.toFixed(2) + ' %' }
            ].map((item, index) => (
              <div key={index}>
                <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '12px', marginBottom: '4px' }}>
                  {item.label}
                </div>
                <div style={{ color: '#fff', fontSize: '16px', fontWeight: '600' }}>
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions Préférentielles */}
        <div style={{
          background: 'rgba(139, 92, 246, 0.1)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '20px',
          border: '1px solid rgba(139, 92, 246, 0.3)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ margin: '0 0 5px 0', fontSize: '20px', color: '#fff', fontWeight: '600' }}>
                Actions Préférentielles
              </h3>
              <p style={{ margin: 0, color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px' }}>
                Dividende prioritaire sans droit de vote
              </p>
            </div>
            <div style={{
              background: titres.actions.preferentielles.variation > 0 ? '#10B981' : '#EF4444',
              color: '#fff',
              padding: '8px 16px',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600'
            }}>
              {titres.actions.preferentielles.variation > 0 ? '↗' : '↘'} {titres.actions.preferentielles.variation}%
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
            {[
              { label: 'Nombre de titres', value: titres.actions.preferentielles.total.toLocaleString('fr-FR') },
              { label: 'Valeur nominale', value: titres.actions.preferentielles.valeurNominale.toFixed(2) + ' €' },
              { label: 'Cours actuel', value: titres.actions.preferentielles.valeurMarche.toFixed(2) + ' €' },
              { label: 'Capitalisation', value: (titres.actions.preferentielles.capitalisation / 1000000).toFixed(2) + ' M€' },
              { label: 'Dividende/action', value: titres.actions.preferentielles.dividende.toFixed(2) + ' €' },
              { label: 'Rendement', value: titres.actions.preferentielles.rendement.toFixed(2) + ' %' }
            ].map((item, index) => (
              <div key={index}>
                <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '12px', marginBottom: '4px' }}>
                  {item.label}
                </div>
                <div style={{ color: '#fff', fontSize: '16px', fontWeight: '600' }}>
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Obligations Senior */}
        <div style={{
          background: 'rgba(16, 185, 129, 0.1)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '20px',
          border: '1px solid rgba(16, 185, 129, 0.3)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ margin: '0 0 5px 0', fontSize: '20px', color: '#fff', fontWeight: '600' }}>
                Obligations Senior
              </h3>
              <p style={{ margin: 0, color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px' }}>
                Dette de premier rang - Notation {titres.obligations.senior.rating}
              </p>
            </div>
            <div style={{
              background: titres.obligations.senior.variation > 0 ? '#10B981' : '#EF4444',
              color: '#fff',
              padding: '8px 16px',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600'
            }}>
              {titres.obligations.senior.variation > 0 ? '↗' : '↘'} {titres.obligations.senior.variation}%
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
            {[
              { label: 'Nombre d\'obligations', value: titres.obligations.senior.total.toLocaleString('fr-FR') },
              { label: 'Valeur nominale', value: titres.obligations.senior.valeurNominale.toLocaleString('fr-FR') + ' €' },
              { label: 'Cours actuel', value: titres.obligations.senior.valeurMarche.toLocaleString('fr-FR') + ' €' },
              { label: 'Encours total', value: (titres.obligations.senior.capitalisation / 1000).toFixed(0) + ' K€' },
              { label: 'Taux coupon', value: titres.obligations.senior.coupon + ' %' },
              { label: 'Échéance', value: titres.obligations.senior.maturite }
            ].map((item, index) => (
              <div key={index}>
                <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '12px', marginBottom: '4px' }}>
                  {item.label}
                </div>
                <div style={{ color: '#fff', fontSize: '16px', fontWeight: '600' }}>
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Obligations Subordonnées */}
        <div style={{
          background: 'rgba(245, 158, 11, 0.1)',
          borderRadius: '16px',
          padding: '24px',
          border: '1px solid rgba(245, 158, 11, 0.3)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ margin: '0 0 5px 0', fontSize: '20px', color: '#fff', fontWeight: '600' }}>
                Obligations Subordonnées
              </h3>
              <p style={{ margin: 0, color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px' }}>
                Dette de rang inférieur - Notation {titres.obligations.subordinees.rating}
              </p>
            </div>
            <div style={{
              background: titres.obligations.subordinees.variation > 0 ? '#10B981' : '#EF4444',
              color: '#fff',
              padding: '8px 16px',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600'
            }}>
              {titres.obligations.subordinees.variation > 0 ? '↗' : '↘'} {Math.abs(titres.obligations.subordinees.variation)}%
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
            {[
              { label: 'Nombre d\'obligations', value: titres.obligations.subordinees.total.toLocaleString('fr-FR') },
              { label: 'Valeur nominale', value: titres.obligations.subordinees.valeurNominale.toLocaleString('fr-FR') + ' €' },
              { label: 'Cours actuel', value: titres.obligations.subordinees.valeurMarche.toLocaleString('fr-FR') + ' €' },
              { label: 'Encours total', value: (titres.obligations.subordinees.capitalisation / 1000).toFixed(0) + ' K€' },
              { label: 'Taux coupon', value: titres.obligations.subordinees.coupon + ' %' },
              { label: 'Échéance', value: titres.obligations.subordinees.maturite }
            ].map((item, index) => (
              <div key={index}>
                <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '12px', marginBottom: '4px' }}>
                  {item.label}
                </div>
                <div style={{ color: '#fff', fontSize: '16px', fontWeight: '600' }}>
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(10px)',
        borderRadius: '16px',
        padding: '20px',
        marginTop: '30px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        textAlign: 'center',
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: '14px'
      }}>
        Données au {new Date().toLocaleDateString('fr-FR')} • Cours de clôture • Source: Marché Boursier
      </div>
    </div>
  );
};

export default TitresSocieteBourse;
