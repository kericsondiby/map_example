import { MapContainer, TileLayer, GeoJSON, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useState } from "react";
import countryData from "./civ.json"; // ton GeoJSON Côte d'Ivoire

// 🔹 Composant pour effectuer le zoom dynamiquement
function ZoomToFeature({ bounds }) {
  const map = useMap();

  if (bounds) {
    map.fitBounds(bounds, { padding: [50, 50], animate: true });
  }

  return null;
}

export default function MapZoomOnClick() {
  const [popupInfo, setPopupInfo] = useState(null);
  const [bounds, setBounds] = useState(null);

  const onEachFeature = (feature, layer) => {
    layer.on({
      click: (e) => {
        const layerBounds = layer.getBounds(); // 🧭 Récupère les limites de la zone cliquée
        setBounds(layerBounds);

        setPopupInfo({
          position: e.latlng,
          name: feature.properties.name || "Zone inconnue",
        });
      },
    });

    // Optionnel : style de survol
    layer.on({
      mouseover: () => {
        layer.setStyle({
          fillColor: "#00bfa5",
          fillOpacity: 0.6,
          weight: 2,
          color: "#004d40",
        });
      },
      mouseout: () => {
        layer.setStyle({
          fillColor: "#009688",
          fillOpacity: 0.4,
          weight: 1,
          color: "#00695c",
        });
      },
    });
  };

  const countryStyle = {
    fillColor: "#009688",
    fillOpacity: 0.4,
    color: "#004d40",
    weight: 1.2,
  };

  return (
    <MapContainer center={[7.5, -5.5]} zoom={6} style={{ height: "500px", width: "100%" }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />

      <GeoJSON data={countryData} style={countryStyle} onEachFeature={onEachFeature} />

      {popupInfo && (
        <Popup position={popupInfo.position}>
          <strong>{popupInfo.name}</strong><br />
          📍 {popupInfo.position.lat.toFixed(3)}, {popupInfo.position.lng.toFixed(3)}
        </Popup>
      )}

      <ZoomToFeature bounds={bounds} />
    </MapContainer>
  );
}




import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

function OfflinePopup({ isOffline }) {
  const map = useMap();

  useEffect(() => {
    if (isOffline) {
      // Affiche le popup au centre de la carte
      const center = map.getCenter();
      const popup = L.popup()
        .setLatLng(center)
        .setContent(
          "<b>⚠️ Hors ligne</b><br>Vous n'êtes plus connecté à Internet.<br>Certains éléments de la carte peuvent ne pas s'afficher."
        )
        .openOn(map);

      // Ferme le popup automatiquement après 5s (optionnel)
      setTimeout(() => {
        map.closePopup(popup);
      }, 5000);
    }
  }, [isOffline, map]);

  return null;
}

export default function OfflineMapExample() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // Détecte les changements de statut réseau
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <MapContainer center={[7.5, -5.5]} zoom={6} style={{ height: "500px", width: "100%" }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />

      {/* Ce composant gère l'affichage du popup */}
      <OfflinePopup isOffline={isOffline} />
    </MapContainer>
  );
}
