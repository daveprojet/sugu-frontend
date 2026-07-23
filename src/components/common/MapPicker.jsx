import { useState, useEffect, useCallback, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, Navigation, Loader2 } from "lucide-react";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const pinIcon = L.divIcon({
  className: "",
  html: `<svg width="28" height="40" viewBox="0 0 28 40" xmlns="http://www.w3.org/2000/svg">
    <path d="M14 0C6.268 0 0 6.268 0 14c0 10.5 14 26 14 26s14-15.5 14-26C28 6.268 21.732 0 14 0z"
      fill="#10b981" stroke="white" stroke-width="2"/>
    <circle cx="14" cy="13" r="5.5" fill="white"/>
  </svg>`,
  iconSize: [28, 40],
  iconAnchor: [14, 40],
  popupAnchor: [0, -36],
});

const SENEGAL_CENTER = [14.7167, -17.4677];
const DEFAULT_ZOOM = 13;

function MapClickHandler({ onPositionSelect }) {
  useMapEvents({
    click(e) {
      onPositionSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function FlyToPosition({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.flyTo([position.latitude, position.longitude], 15, { duration: 1.2 });
    }
  }, [position, map]);
  return null;
}

export default function MapPicker({ value, onChange }) {
  const [position, setPosition] = useState(
    value?.latitude && value?.longitude
      ? { latitude: value.latitude, longitude: value.longitude }
      : null
  );
  const [address, setAddress] = useState(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const abortRef = useRef(null);

  const reverseGeocode = useCallback(async (lat, lng) => {
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=fr&addressdetails=1`,
        { signal: abortRef.current.signal }
      );
      if (!res.ok) return null;
      const data = await res.json();
      const a = data.address || {};
      return {
        display: data.display_name || null,
        rue: [a.house_number, a.road].filter(Boolean).join(" ") || null,
        quartier: a.quartier || a.neighbourhood || a.suburb || null,
        commune: a.city || a.town || a.village || a.municipality || null,
        region: a.state || a.region || null,
        pays: a.country || null,
      };
    } catch {
      return null;
    }
  }, []);

  const handlePositionSelect = useCallback(async (lat, lng) => {
    const newPos = { latitude: lat, longitude: lng };
    setPosition(newPos);
    setAddress(null);
    const addr = await reverseGeocode(lat, lng);
    setAddress(addr);
    onChange({
      latitude: lat,
      longitude: lng,
      quartier: addr?.quartier || "",
      commune: addr?.commune || "",
    });
  }, [reverseGeocode, onChange]);

  const handleCurrentPosition = () => {
    if (!navigator.geolocation) return;
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        handlePositionSelect(pos.coords.latitude, pos.coords.longitude);
        setGeoLoading(false);
      },
      () => setGeoLoading(false),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  useEffect(() => {
    if (value?.latitude && value?.longitude && !position) {
      setPosition({ latitude: value.latitude, longitude: value.longitude });
    }
  }, [value]);

  return (
    <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
      <div className="bg-white px-4 py-3 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={handleCurrentPosition}
          disabled={geoLoading}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white text-sm font-medium px-4 py-2 rounded-full shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-60"
        >
          {geoLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Navigation className="w-4 h-4" />
          )}
          Ma position actuelle
        </button>
        {position && (
          <span className="text-[11px] text-gray-400 font-mono">
            {position.latitude.toFixed(7)}, {position.longitude.toFixed(7)}
          </span>
        )}
      </div>

      {address && (
        <div className="bg-emerald-50 border-t border-emerald-100 px-4 py-3">
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
            <div className="text-sm text-emerald-800">
              {address.rue && <p className="font-medium">{address.rue}</p>}
              <p>
                {[address.quartier, address.commune, address.region]
                  .filter(Boolean)
                  .join(", ")}
              </p>
              {address.pays && (
                <p className="text-emerald-600 text-xs mt-0.5">{address.pays}</p>
              )}
            </div>
          </div>
        </div>
      )}

      <MapContainer
        center={position ? [position.latitude, position.longitude] : SENEGAL_CENTER}
        zoom={position ? 15 : DEFAULT_ZOOM}
        className="h-[300px] w-full"
        scrollWheelZoom={true}
        dragging={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapClickHandler onPositionSelect={handlePositionSelect} />
        {position && (
          <>
            <FlyToPosition position={position} />
            <Marker
              position={[position.latitude, position.longitude]}
              icon={pinIcon}
            />
          </>
        )}
      </MapContainer>

      <div className="bg-gray-50 px-4 py-2 text-[11px] text-gray-400 text-center">
        Cliquez sur la carte ou utilisez "Ma position actuelle"
      </div>
    </div>
  );
}
