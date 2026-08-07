import { useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { normalizeCoord } from "@/utils/geo";

export function useGeoLocation() {
  const { user, updateMe } = useAuth();
  const requested = useRef(false);

  useEffect(() => {
    if (!user || user.latitude || user.longitude || requested.current) return;
    if (!navigator.geolocation) return;

    requested.current = true;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        updateMe({
          latitude: normalizeCoord(pos.coords.latitude),
          longitude: normalizeCoord(pos.coords.longitude),
        });
      },
      () => {},
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [user, updateMe]);
}
