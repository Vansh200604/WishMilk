import { useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet marker icon
const riderIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

function MapCenter({ position }) {
  const map = useMap();

  map.setView(position);

  return null;
}

export default function RiderMap({ coordinates }) {
  const [expanded, setExpanded] = useState(false);

  if (!coordinates || coordinates.length !== 2) {
    return (
      <div className="h-32 rounded-xl bg-gray-100 flex items-center justify-center text-sm text-gray-500">
        Getting your location...
      </div>
    );
  }

  const [longitude, latitude] = coordinates;
  const position = [latitude, longitude];

  return (
    <div
      onClick={() => setExpanded((prev) => !prev)}
      className={`w-full rounded-xl overflow-hidden cursor-pointer transition-all duration-300 ${
        expanded ? "h-80" : "h-32"
      }`}
    >
      <MapContainer
        center={position}
        zoom={16}
        // scrollWheelZoom={false}
        zoomControl={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Marker position={position} icon={riderIcon}>
          <Popup>
            You are here
          </Popup>
        </Marker>

        <MapCenter position={position} />
      </MapContainer>
    </div>
  );
}

