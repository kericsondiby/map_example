import React, { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Correction icônes par défaut Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
});

// Icônes personnalisées
const onlineIcon = new L.Icon({
  iconUrl: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
  iconSize: [32, 32],
});

const offlineIcon = new L.Icon({
  iconUrl: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
  iconSize: [32, 32],
});

// Fonction pour ouvrir un popup automatiquement
function PopupTrigger({ position, message }) {
  const map = useMap();

  useEffect(() => {
    if (position) {
      const popup = L.popup()
        .setLatLng(position)
        .setContent(message)
        .openOn(map);
      return () => {
        map.closePopup(popup);
      };
    }
  }, [position, message, map]);

  return null;
}

const DabMonitoringMap = () => {
  const [dabs, setDabs] = useState([
    { id: 1, name: "DAB Plateau", position: [5.3265, -4.0127], status: "online" },
    { id: 2, name: "DAB Yopougon", position: [5.3453, -4.0824], status: "online" },
    { id: 3, name: "DAB Cocody", position: [5.3489, -3.9863], status: "online" },
    { id: 4, name: "DAB Marcory", position: [5.3048, -3.9921], status: "online" },
  ]);

  const [popupData, setPopupData] = useState(null); // DAB offline actuel

  useEffect(() => {
    const interval = setInterval(() => {
      setDabs((prev) =>
        prev.map((dab) => {
          const newStatus = Math.random() > 0.8 ? "offline" : "online"; // 20% chance offline
          if (dab.status === "online" && newStatus === "offline") {
            setPopupData({
              position: dab.position,
              message: `<b>${dab.name}</b><br/>🛑 DAB hors ligne !`,
            });
          }
          return { ...dab, status: newStatus };
        })
      );
    }, 7000); // toutes les 7 secondes

    return () => clearInterval(interval);
  }, []);

  return (
    <MapContainer center={[5.34, -4.03]} zoom={12} style={{ height: "100vh", width: "100%" }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />

      {dabs.map((dab) => (
        <Marker
          key={dab.id}
          position={dab.position}
          icon={dab.status === "online" ? onlineIcon : offlineIcon}
        >
          <Popup>
            <b>{dab.name}</b>
            <br />
            Statut :{" "}
            <span
              style={{
                color: dab.status === "online" ? "green" : "red",
                fontWeight: "bold",
              }}
            >
              {dab.status.toUpperCase()}
            </span>
          </Popup>
        </Marker>
      ))}

      {popupData && (
        <PopupTrigger
          position={popupData.position}
          message={popupData.message}
        />
      )}
    </MapContainer>
  );
};

export default DabMonitoringMap;
