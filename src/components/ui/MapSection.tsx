import { useEffect, useRef, useState } from 'react';

const MAPBOX_TOKEN = import.meta.env.PUBLIC_MAPBOX_TOKEN || '';
const HUMBLE_TX: [number, number] = [-95.2622, 29.9988];

interface MapSectionProps {
  compact?: boolean;
}

export default function MapSection({ compact = false }: MapSectionProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const mapHeight = compact ? '200px' : '380px';
  const mapMinHeight = compact ? '160px' : '280px';
  const mapZoom = compact ? 10 : 9;

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Load Mapbox GL CSS
    if (!document.querySelector('link[href*="mapbox-gl"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://api.mapbox.com/mapbox-gl-js/v3.4.0/mapbox-gl.css';
      document.head.appendChild(link);
    }

    // Load Mapbox GL JS
    const loadMapbox = (): Promise<any> => {
      if ((window as any).mapboxgl) {
        return Promise.resolve((window as any).mapboxgl);
      }

      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://api.mapbox.com/mapbox-gl-js/v3.4.0/mapbox-gl.js';
        script.onload = () => resolve((window as any).mapboxgl);
        script.onerror = () => reject(new Error('Failed to load Mapbox GL JS'));
        document.head.appendChild(script);
      });
    };

    loadMapbox()
      .then((mapboxgl) => {
        if (!mapContainer.current || mapRef.current) return;

        mapboxgl.accessToken = MAPBOX_TOKEN;

        const map = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/dark-v11',
          center: HUMBLE_TX,
          zoom: mapZoom,
          interactive: !compact,
          attributionControl: false,
          pitchWithRotate: false,
          dragRotate: false,
          scrollZoom: false,
        });

        // In compact mode, skip controls; in full mode, add them
        if (!compact) {
          map.addControl(
            new mapboxgl.AttributionControl({ compact: true }),
            'bottom-right'
          );
          map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right');
        }

        mapRef.current = map;

        map.on('load', () => {
          setLoaded(true);

          // Create custom marker element
          const markerEl = document.createElement('div');
          markerEl.className = 'lumina-map-marker';
          markerEl.innerHTML = `
            <div class="marker-ping"></div>
            <div class="marker-dot"></div>
          `;

          const marker = new mapboxgl.Marker({ element: markerEl, anchor: 'center' })
            .setLngLat(HUMBLE_TX);

          // Only add popup in full mode — compact mode has contact info in the card
          if (!compact) {
            marker.setPopup(
              new mapboxgl.Popup({
                offset: 16,
                closeButton: false,
                className: 'lumina-popup',
                maxWidth: '220px',
              }).setHTML(`
                <div style="font-family: var(--font-sans, system-ui); padding: 4px 0;">
                  <p style="margin:0 0 2px; font-weight:600; color:#E8E8ED; font-size:14px;">Lumina Erp</p>
                  <p style="margin:0; color:#A0A0B0; font-size:12px;">Humble, TX &middot; Houston Metro</p>
                  <p style="margin:6px 0 0; color:#3B82F6; font-size:11px; font-weight:500;">Serving distributors nationwide</p>
                </div>
              `)
            );
          }

          marker.addTo(map);

          // Add the nationwide service ring (subtle)
          if (!prefersReducedMotion) {
            map.addSource('service-area', {
              type: 'geojson',
              data: {
                type: 'Feature',
                geometry: {
                  type: 'Point',
                  coordinates: HUMBLE_TX,
                },
                properties: {},
              },
            });

            map.addLayer({
              id: 'service-ring',
              type: 'circle',
              source: 'service-area',
              paint: {
                'circle-radius': compact ? 45 : 60,
                'circle-color': 'transparent',
                'circle-stroke-width': 1.5,
                'circle-stroke-color': '#3B82F6',
                'circle-stroke-opacity': 0.25,
              },
            });
          }
        });
      })
      .catch(() => {
        setError(true);
      });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return (
    <div className="w-full">
      <div
        className="relative overflow-hidden"
        style={{
          borderRadius: compact ? '8px' : '12px',
          border: compact ? 'none' : '1px solid var(--color-border)',
          background: 'var(--color-bg-surface-1)',
        }}
      >
        {/* Map container */}
        <div
          ref={mapContainer}
          className="w-full"
          style={{ height: mapHeight, minHeight: mapMinHeight }}
        />

        {/* Loading skeleton */}
        {!loaded && !error && (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ background: 'var(--color-bg-surface-1)' }}
          >
            <div className="flex flex-col items-center gap-2">
              <div
                className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin"
                style={{ borderColor: 'var(--color-accent-primary)', borderTopColor: 'transparent' }}
              />
              {!compact && (
                <span className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
                  Loading map...
                </span>
              )}
            </div>
          </div>
        )}

        {/* Error fallback */}
        {error && (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ background: 'var(--color-bg-surface-1)' }}
          >
            <div className="text-center px-6">
              <div
                className="w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center"
                style={{ background: 'rgba(59,130,246,0.1)' }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                Humble, TX
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
                Serving distributors nationwide
              </p>
            </div>
          </div>
        )}

        {/* Bottom overlay label — only in full mode */}
        {!compact && loaded && (
          <div className="absolute bottom-0 left-0 right-0 pointer-events-none"
            style={{
              background: 'linear-gradient(to top, rgba(10,10,15,0.85) 0%, transparent 100%)',
              padding: '32px 16px 12px',
            }}
          >
            <div className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full shrink-0"
                style={{
                  background: 'var(--color-accent-primary)',
                  boxShadow: '0 0 8px rgba(59,130,246,0.5)',
                }}
              />
              <span className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                Humble, TX &middot; Serving distributors nationwide
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Compact mode: manual attribution text below the map */}
      {compact && (
        <p className="text-[10px] mt-1.5 opacity-60" style={{ color: 'var(--color-text-tertiary)' }}>
          Map &copy; Mapbox &copy; OpenStreetMap
        </p>
      )}

      {/* Inline styles for the custom marker and popup */}
      <style dangerouslySetInnerHTML={{ __html: `
        .lumina-map-marker {
          position: relative;
          width: 20px;
          height: 20px;
          cursor: ${compact ? 'default' : 'pointer'};
        }
        .marker-dot {
          position: absolute;
          top: 50%;
          left: 50%;
          width: ${compact ? '10px' : '12px'};
          height: ${compact ? '10px' : '12px'};
          margin: ${compact ? '-5px 0 0 -5px' : '-6px 0 0 -6px'};
          background: #3B82F6;
          border: 2px solid #E8E8ED;
          border-radius: 50%;
          box-shadow: 0 0 12px rgba(59,130,246,0.6);
          z-index: 2;
        }
        @media (prefers-reduced-motion: no-preference) {
          .marker-ping {
            position: absolute;
            top: 50%;
            left: 50%;
            width: ${compact ? '30px' : '40px'};
            height: ${compact ? '30px' : '40px'};
            margin: ${compact ? '-15px 0 0 -15px' : '-20px 0 0 -20px'};
            background: rgba(59,130,246,0.25);
            border-radius: 50%;
            animation: marker-pulse 2.5s ease-out infinite;
            z-index: 1;
          }
          @keyframes marker-pulse {
            0% {
              transform: scale(0.5);
              opacity: 0.7;
            }
            100% {
              transform: scale(2);
              opacity: 0;
            }
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .marker-ping {
            display: none;
          }
        }
        .lumina-popup .mapboxgl-popup-content {
          background: #12121A !important;
          border: 1px solid #2A2A36 !important;
          border-radius: 10px !important;
          padding: 12px 14px !important;
          box-shadow: 0 8px 32px rgba(0,0,0,0.5) !important;
        }
        .lumina-popup .mapboxgl-popup-tip {
          border-top-color: #12121A !important;
        }
        .mapboxgl-ctrl-attrib {
          background: rgba(10,10,15,0.7) !important;
          border-radius: 4px !important;
          font-size: 10px !important;
        }
        .mapboxgl-ctrl-attrib a {
          color: #7A7A8A !important;
        }
        .mapboxgl-ctrl-group {
          background: #12121A !important;
          border: 1px solid #2A2A36 !important;
          border-radius: 8px !important;
        }
        .mapboxgl-ctrl-group button {
          border-color: #2A2A36 !important;
        }
        .mapboxgl-ctrl-group button span {
          filter: invert(1) !important;
        }
      `}} />
    </div>
  );
}
