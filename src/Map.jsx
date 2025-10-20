import { useState, useEffect } from "react";
import { MapContainer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-boundary-canvas";
import L from "leaflet";

const position = [52.237049, 21.017532];
const mapStyle = { height: "100vh" };

export default function Map() {
  const [map, setMap] = useState(null);

  useEffect(() => {
    if (!map) return;

    const fetchGeoJSON = async () => {
      const response = await fetch(
        "https://cdn.rawgit.com/johan/world.geo.json/34c96bba/countries/POL.geo.json"
      );
      const geoJSON = await response.json();
      const osm = L.TileLayer.boundaryCanvas(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
          boundary: geoJSON,
          attribution:
            '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors, UK shape <a href="https://github.com/johan/world.geo.json">johan/word.geo.json</a>'
        }
      );
      map.addLayer(osm);
      const ukLayer = L.geoJSON(geoJSON);
      map.fitBounds(ukLayer.getBounds());
    };

    fetchGeoJSON();
  }, [map]);

  return (
    <MapContainer
      center={position}
      zoom={13}
      style={mapStyle}
      whenCreated={setMap}
    />
  );
}
