import { MapContainer, TileLayer, GeoJSON, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useState } from 'react';
import countryData from './civ.json'; // ton GeoJSON Côte d'Ivoire

export default function MapWithGeoJsonPopup() {
  const [popupInfo, setPopupInfo] = useState(null);

  const onEachFeature = (feature, layer) => {
    layer.on({
      click: (e) => {
        setPopupInfo({
          position: e.latlng,
          name: feature.properties.name || "Zone inconnue",
        });
      },
    });
  };

  return (
    <MapContainer center={[7.5, -5.5]} zoom={6} style={{ height: "500px", width: "100%" }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />

      <GeoJSON data={countryData} onEachFeature={onEachFeature} />

      {popupInfo && (
        <Popup position={popupInfo.position}>
          <div>
            <strong>{popupInfo.name}</strong><br />
            📍 Latitude: {popupInfo.position.lat.toFixed(3)}<br />
            📍 Longitude: {popupInfo.position.lng.toFixed(3)}
          </div>
        </Popup>
      )}
    </MapContainer>
  );
}
