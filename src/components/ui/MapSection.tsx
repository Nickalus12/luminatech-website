import { useEffect, useRef, useState } from 'react';

const MAPBOX_TOKEN = import.meta.env.PUBLIC_MAPBOX_TOKEN || '';
const HUMBLE_TX: [number, number] = [-95.2622, 29.9988];

// Major US distribution hubs — destinations for animated arcs
const DESTINATION_CITIES: [number, number][] = [
  [-122.33, 47.61],  // Seattle, WA
  [-87.63, 41.88],   // Chicago, IL
  [-74.01, 40.71],   // New York, NY
  [-80.19, 25.76],   // Miami, FL
  [-104.99, 39.74],  // Denver, CO
  [-112.07, 33.45],  // Phoenix, AZ
  [-84.39, 33.75],   // Atlanta, GA
];

// Center of the continental US (slightly south to keep Humble TX visible)
const US_CENTER: [number, number] = [-96.5, 38.5];

/**
 * Generate a quadratic bezier arc between two lng/lat points.
 * The arc curves northward (upward on the map) for visual consistency.
 */
function generateArc(
  origin: [number, number],
  destination: [number, number],
  numPoints = 50
): [number, number][] {
  const [lng1, lat1] = origin;
  const [lng2, lat2] = destination;

  // Midpoint
  const midLng = (lng1 + lng2) / 2;
  const midLat = (lat1 + lat2) / 2;

  // Distance between points (approximate, for scaling the curve height)
  const dx = lng2 - lng1;
  const dy = lat2 - lat1;
  const dist = Math.sqrt(dx * dx + dy * dy);

  // Perpendicular offset (always curve northward/upward)
  // Perpendicular to the line: (-dy, dx) normalized
  const perpLen = Math.sqrt(dy * dy + dx * dx);
  const perpX = -dy / perpLen;
  const perpY = dx / perpLen;

  // Scale: 15% of distance, always push upward (positive lat direction)
  const curvature = dist * 0.15;
  // Choose direction that pushes the control point northward
  const controlLng = midLng + perpX * curvature * (perpY >= 0 ? 1 : -1);
  const controlLat = midLat + Math.abs(perpY) * curvature + curvature * 0.3;

  const points: [number, number][] = [];
  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints;
    const inv = 1 - t;
    // Quadratic bezier: B(t) = (1-t)^2 * P0 + 2*(1-t)*t * Pc + t^2 * P1
    const lng = inv * inv * lng1 + 2 * inv * t * controlLng + t * t * lng2;
    const lat = inv * inv * lat1 + 2 * inv * t * controlLat + t * t * lat2;
    points.push([lng, lat]);
  }
  return points;
}

interface MapSectionProps {
  compact?: boolean;
}

export default function MapSection({ compact = false }: MapSectionProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const animationRef = useRef<number | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const mapHeight = compact ? '220px' : '380px';
  const mapMinHeight = compact ? '180px' : '280px';

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
          center: compact ? US_CENTER : HUMBLE_TX,
          zoom: compact ? 3.2 : 9,
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

          // Create custom marker element for Humble TX
          const markerEl = document.createElement('div');
          markerEl.className = 'lumina-map-marker';
          markerEl.innerHTML = `
            <div class="marker-ping"></div>
            <div class="marker-dot"></div>
          `;

          const marker = new mapboxgl.Marker({ element: markerEl, anchor: 'center' })
            .setLngLat(HUMBLE_TX);

          // Only add popup in full mode
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

          // --- Animated arcs (compact mode) ---
          if (compact) {
            // Generate arc GeoJSON features
            const arcFeatures = DESTINATION_CITIES.map((dest) => ({
              type: 'Feature' as const,
              properties: {},
              geometry: {
                type: 'LineString' as const,
                coordinates: generateArc(HUMBLE_TX, dest),
              },
            }));

            // Destination endpoint dots
            const endpointFeatures = DESTINATION_CITIES.map((dest) => ({
              type: 'Feature' as const,
              properties: {},
              geometry: {
                type: 'Point' as const,
                coordinates: dest,
              },
            }));

            // Add arc lines source
            map.addSource('arcs', {
              type: 'geojson',
              data: { type: 'FeatureCollection', features: arcFeatures },
            });

            // Add endpoint dots source
            map.addSource('endpoints', {
              type: 'geojson',
              data: { type: 'FeatureCollection', features: endpointFeatures },
            });

            // Background arc lines (faint, always visible)
            map.addLayer({
              id: 'arcs-bg',
              type: 'line',
              source: 'arcs',
              layout: {
                'line-cap': 'round',
                'line-join': 'round',
              },
              paint: {
                'line-color': '#3B82F6',
                'line-width': 1.5,
                'line-opacity': 0.12,
              },
            });

            // Animated arc lines (dashed, ant-path effect)
            map.addLayer({
              id: 'arcs-animated',
              type: 'line',
              source: 'arcs',
              layout: {
                'line-cap': 'round',
                'line-join': 'round',
              },
              paint: {
                'line-color': '#3B82F6',
                'line-width': 1.5,
                'line-opacity': 0.45,
                'line-dasharray': [0, 4, 3],
              },
            });

            // Destination endpoint dots
            map.addLayer({
              id: 'endpoint-dots',
              type: 'circle',
              source: 'endpoints',
              paint: {
                'circle-radius': 3,
                'circle-color': '#3B82F6',
                'circle-opacity': 0.6,
                'circle-stroke-width': 1,
                'circle-stroke-color': '#3B82F6',
                'circle-stroke-opacity': 0.2,
              },
            });

            // Animate the dash array (ant-path effect)
            if (!prefersReducedMotion) {
              const dashSequence = [
                [0, 4, 3],
                [0.5, 4, 2.5],
                [1, 4, 2],
                [1.5, 4, 1.5],
                [2, 4, 1],
                [2.5, 4, 0.5],
                [3, 4, 0],
                [0, 0.5, 3, 3.5],
                [0, 1, 3, 3],
                [0, 1.5, 3, 2.5],
                [0, 2, 3, 2],
                [0, 2.5, 3, 1.5],
                [0, 3, 3, 1],
                [0, 3.5, 3, 0.5],
              ];
              let step = 0;
              let lastTime = 0;
              const interval = 50; // ms between frames

              function animateDash(timestamp: number) {
                if (timestamp - lastTime >= interval) {
                  lastTime = timestamp;
                  if (map.getLayer('arcs-animated')) {
                    map.setPaintProperty(
                      'arcs-animated',
                      'line-dasharray',
                      dashSequence[step],
                      { duration: 0 }
                    );
                  }
                  step = (step + 1) % dashSequence.length;
                }
                animationRef.current = requestAnimationFrame(animateDash);
              }

              animationRef.current = requestAnimationFrame(animateDash);
            }
          } else {
            // Full mode: service ring (original behavior)
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
                  'circle-radius': 60,
                  'circle-color': 'transparent',
                  'circle-stroke-width': 1.5,
                  'circle-stroke-color': '#3B82F6',
                  'circle-stroke-opacity': 0.25,
                },
              });
            }
          }
        });
      })
      .catch(() => {
        setError(true);
      });

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
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
