import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Leaflet has no built-in colored markers, so emoji div-icons double as a
// simple way to tell "you", "dairy", and "customer" apart without pulling
// in extra marker image assets.
const makeEmojiIcon = (emoji) =>
  L.divIcon({
    html: `<div style="font-size:26px;line-height:1;filter:drop-shadow(0 1px 2px rgba(0,0,0,.35))">${emoji}</div>`,
    className: "",
    iconSize: [26, 26],
    iconAnchor: [13, 22],
  });

const riderIcon = makeEmojiIcon("🛵");
const dairyIcon = makeEmojiIcon("🏭");
const homeIcon = makeEmojiIcon("📍");

function FitBounds({ points }) {
  const map = useMap();
  useEffect(() => {
    if (points.length < 2) return;
    map.fitBounds(points, { padding: [40, 40] });
  }, [points, map]);
  return null;
}

// origin/destination: { lat, lng, label }. destinationType picks the
// destination's icon — "dairy" for the pickup leg, "home" for the
// delivery leg. Tries to fetch a real road route from OSRM's free public
// API; falls back to a straight dashed line if that's unavailable, since
// routing is a nice-to-have and should never block the map itself.
export default function DeliveryMap({ origin, destination, destinationType = "home", height = 280 }) {
  const [route, setRoute] = useState(null);

  useEffect(() => {
    setRoute(null);
    if (!origin || !destination) return;
    let cancelled = false;

    fetch(
      `https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson`
    )
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        const coords = data.routes?.[0]?.geometry?.coordinates;
        if (coords) setRoute(coords.map(([lng, lat]) => [lat, lng]));
      })
      .catch(() => {
        // Straight line below is the fallback — never surface this as an error.
      });

    return () => {
      cancelled = true;
    };
  }, [origin?.lat, origin?.lng, destination?.lat, destination?.lng]);

  if (!origin || !destination) {
    return (
      <div
        className="flex items-center justify-center rounded-xl bg-cream-soft text-sm text-ink-faint"
        style={{ height }}
      >
        Location not available yet
      </div>
    );
  }

  const points = [
    [origin.lat, origin.lng],
    [destination.lat, destination.lng],
  ];
  const line = route || points;

  return (
    <div className="overflow-hidden rounded-xl border border-ink/10" style={{ height }}>
      <MapContainer center={points[0]} zoom={13} scrollWheelZoom={false} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={points[0]} icon={riderIcon}>
          <Popup>{origin.label || "Rider"}</Popup>
        </Marker>
        <Marker position={points[1]} icon={destinationType === "dairy" ? dairyIcon : homeIcon}>
          <Popup>{destination.label || "Destination"}</Popup>
        </Marker>
        <Polyline
          positions={line}
          pathOptions={{ color: "#6E97B8", weight: 4, opacity: 0.8 }}
          {...(!route ? { dashArray: "6 8" } : {})}
        />
        <FitBounds points={points} />
      </MapContainer>
    </div>
  );
}