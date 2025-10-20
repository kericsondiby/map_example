import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import L from "leaflet";
import { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";

export default function CountryMap() {
  const [countryData, setCountryData] = useState({"type":"FeatureCollection","features":[
{"type":"Feature","id":"CIV","properties":{"name":"Ivory Coast"},"geometry":{"type":"Polygon","coordinates":[[[-2.856125,4.994476],[-3.311084,4.984296],[-4.00882,5.179813],[-4.649917,5.168264],[-5.834496,4.993701],[-6.528769,4.705088],[-7.518941,4.338288],[-7.712159,4.364566],[-7.635368,5.188159],[-7.539715,5.313345],[-7.570153,5.707352],[-7.993693,6.12619],[-8.311348,6.193033],[-8.60288,6.467564],[-8.385452,6.911801],[-8.485446,7.395208],[-8.439298,7.686043],[-8.280703,7.68718],[-8.221792,8.123329],[-8.299049,8.316444],[-8.203499,8.455453],[-7.8321,8.575704],[-8.079114,9.376224],[-8.309616,9.789532],[-8.229337,10.12902],[-8.029944,10.206535],[-7.89959,10.297382],[-7.622759,10.147236],[-6.850507,10.138994],[-6.666461,10.430811],[-6.493965,10.411303],[-6.205223,10.524061],[-6.050452,10.096361],[-5.816926,10.222555],[-5.404342,10.370737],[-4.954653,10.152714],[-4.779884,9.821985],[-4.330247,9.610835],[-3.980449,9.862344],[-3.511899,9.900326],[-2.827496,9.642461],[-2.56219,8.219628],[-2.983585,7.379705],[-3.24437,6.250472],[-2.810701,5.389051],[-2.856125,4.994476]]]}}
]});

//   useEffect(() => {
//     // Charger la Côte d’Ivoire (CIV)
//     fetch("https://raw.githubusercontent.com/johan/world.geo.json/master/countries/CIV.geo.json")
//       .then((res) => res.json())
//       .then((data) => setCountryData(data));
//   }, []);

  // Style pour le pays
  const countryStyle = {
    // color: "#bec7c2ff", // vert
    weight: 2,
    // fillColor: "#051f05ff", // vert clair
    fillOpacity: 0,
  };

  // Style pour le masque gris
  const maskStyle = {
    color: "#000000",
    weight: 0,
    fillColor: "rgba(243, 237, 237, 1)", // gris semi-transparent
    fillOpacity: 1,
  };

  const createMask = (geojson) => {
    // Création d’un grand polygone couvrant toute la Terre
    const worldCoords = [
      [
        [-180, -90],
        [-180, 90],
        [180, 90],
        [180, -90],
        [-180, -90],
      ],
    ];

    // On récupère les coordonnées du pays
    const countryCoords = geojson.features[0].geometry.coordinates;

    // On inverse le sens pour "faire un trou"
    const mask = {
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [...worldCoords, ...countryCoords],
      },
    };

    return mask;
  };

  return (
    <MapContainer
      center={[7.54, -5.55]} // Côte d’Ivoire
      zoom={6}
      style={{ height: "100vh", width: "100%" }}
      zoomControl={false}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap contributors'
      />

      {countryData && (
        <>
          {/* Masque gris autour du pays */}
          <GeoJSON data={createMask(countryData)} style={maskStyle} />

          {/* Pays bien visible par-dessus */}
          <GeoJSON data={countryData} style={countryStyle} />
        </>
      )}
    </MapContainer>
  );
}
