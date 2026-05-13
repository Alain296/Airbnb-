import { useEffect, useMemo, useRef, useState } from 'react';
import type { Listing } from '../types';

type Props = {
  listings: Listing[];
  activeId?: string | null;
  onMarkerClick?: (id: string) => void;
  height?: number;
};

declare global {
  interface Window {
    google?: any;
  }
}

function loadGoogleMaps(apiKey: string) {
  if (typeof document === 'undefined') return Promise.reject(new Error('no-document'));
  const existing = document.querySelector<HTMLScriptElement>('script[data-google-maps="true"]');
  if (existing) return Promise.resolve();

  const src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&v=weekly`;
  return new Promise<void>((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src;
    s.async = true;
    s.defer = true;
    s.dataset.googleMaps = 'true';
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('failed-to-load-google-maps'));
    document.head.appendChild(s);
  });
}

export function GoogleMapPanel({ listings, activeId, onMarkerClick, height = 780 }: Props) {
  const apiKey = (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY as string | undefined;
  const mapRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  const coords = useMemo(() => {
    const pts = listings
      .map(l => ({ id: l.id, lat: l.lat, lng: l.lng, title: l.title }))
      .filter(p => typeof p.lat === 'number' && typeof p.lng === 'number');
    return pts;
  }, [listings]);

  useEffect(() => {
    if (!apiKey) return;
    setFailed(false);
    loadGoogleMaps(apiKey)
      .then(() => setReady(true))
      .catch(() => setFailed(true));
  }, [apiKey]);

  useEffect(() => {
    if (!ready) return;
    if (!mapRef.current) return;
    if (!window.google?.maps) return;
    if (coords.length === 0) return;

    const center = coords[0];
    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat: center.lat, lng: center.lng },
      zoom: 11,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    });

    const bounds = new window.google.maps.LatLngBounds();
    coords.forEach(p => bounds.extend({ lat: p.lat, lng: p.lng }));
    map.fitBounds(bounds);

    const markers = new Map<string, any>();
    coords.forEach(p => {
      const marker = new window.google.maps.Marker({
        position: { lat: p.lat, lng: p.lng },
        map,
        title: p.title,
      });
      marker.addListener('click', () => onMarkerClick?.(p.id));
      markers.set(p.id, marker);
    });

    // highlight active marker by bouncing briefly
    if (typeof activeId === 'string') {
      const m = markers.get(activeId);
      if (m) {
        m.setAnimation(window.google.maps.Animation.BOUNCE);
        window.setTimeout(() => m.setAnimation(null), 900);
      }
    }

    return () => {
      markers.forEach(m => m.setMap(null));
    };
  }, [ready, coords, activeId, onMarkerClick]);

  // Fallback: embed map (no API key needed). Still interactive, but no custom markers.
  const fallbackSrc =
    coords.length > 0
      ? `https://www.google.com/maps?q=${coords[0].lat},${coords[0].lng}&z=11&output=embed`
      : 'https://www.google.com/maps?q=New%20York&z=11&output=embed';

  return (
    <div style={{
      borderRadius: 14,
      overflow: 'hidden',
      border: '1px solid #e8e8e8',
      boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
      background: 'white',
      height,
    }}>
      {apiKey && !failed ? (
        <div ref={mapRef} style={{ height: '100%', width: '100%' }} />
      ) : (
        <iframe
          title="Explore map"
          src={fallbackSrc}
          style={{ border: 0, height: '100%', width: '100%' }}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      )}
    </div>
  );
}

