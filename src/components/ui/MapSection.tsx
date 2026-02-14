import { useEffect, useRef, useState } from 'react';

const MAPBOX_TOKEN = import.meta.env.PUBLIC_MAPBOX_TOKEN || '';
const HUMBLE_TX: [number, number] = [-95.2622, 29.9988];
const US_CENTER: [number, number] = [-96.5, 38.5];

// 10 major US distribution hubs -- destinations for animated arcs
const DESTINATION_CITIES: [number, number][] = [
  [-122.33, 47.61],  // Seattle, WA
  [-122.42, 37.77],  // San Francisco, CA
  [-118.24, 34.05],  // Los Angeles, CA
  [-112.07, 33.45],  // Phoenix, AZ
  [-104.99, 39.74],  // Denver, CO
  [-87.63, 41.88],   // Chicago, IL
  [-93.27, 44.98],   // Minneapolis, MN
  [-84.39, 33.75],   // Atlanta, GA
  [-80.19, 25.76],   // Miami, FL
  [-74.01, 40.71],   // New York, NY
];

/**
 * Generate a quadratic bezier arc between two lng/lat points.
 * The arc curves northward for visual consistency.
 */
function generateArc(
  origin: [number, number],
  destination: [number, number],
  numPoints = 50
): [number, number][] {
  const [lng1, lat1] = origin;
  const [lng2, lat2] = destination;
  const midLng = (lng1 + lng2) / 2;
  const midLat = (lat1 + lat2) / 2;
  const dx = lng2 - lng1;
  const dy = lat2 - lat1;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const perpLen = Math.sqrt(dy * dy + dx * dx);
  const perpX = -dy / perpLen;
  const perpY = dx / perpLen;
  const curvature = dist * 0.15;
  const controlLng = midLng + perpX * curvature * (perpY >= 0 ? 1 : -1);
  const controlLat = midLat + Math.abs(perpY) * curvature + curvature * 0.3;
  const points: [number, number][] = [];
  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints;
    const inv = 1 - t;
    const lng = inv * inv * lng1 + 2 * inv * t * controlLng + t * t * lng2;
    const lat = inv * inv * lat1 + 2 * inv * t * controlLat + t * t * lat2;
    points.push([lng, lat]);
  }
  return points;
}

export default function MapSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const orbitRef = useRef<number | null>(null);
  const dashRef = useRef<number | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [landed, setLanded] = useState(false);
  const beaconRef = useRef<HTMLDivElement | null>(null);

  // Show beacon label after landing
  useEffect(() => {
    if (landed && beaconRef.current) {
      beaconRef.current.classList.add('show-label');
    }
  }, [landed]);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    const isMobile = window.innerWidth < 768;

    // Load Mapbox GL CSS
    if (!document.querySelector('link[href*="mapbox-gl"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://api.mapbox.com/mapbox-gl-js/v3.4.0/mapbox-gl.css';
      document.head.appendChild(link);
    }

    // Load Mapbox GL JS from CDN
    const loadMapbox = (): Promise<any> => {
      if ((window as any).mapboxgl)
        return Promise.resolve((window as any).mapboxgl);
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src =
          'https://api.mapbox.com/mapbox-gl-js/v3.4.0/mapbox-gl.js';
        script.onload = () => resolve((window as any).mapboxgl);
        script.onerror = () =>
          reject(new Error('Failed to load Mapbox GL JS'));
        document.head.appendChild(script);
      });
    };

    loadMapbox()
      .then((mapboxgl) => {
        if (!mapContainer.current || mapRef.current) return;
        mapboxgl.accessToken = MAPBOX_TOKEN;

        const finalZoom = isMobile ? 15 : 16;
        const finalPitch = 65;
        const skipAnimation = prefersReducedMotion;

        // Phase 1: Create map with Standard style — use 'dusk' for warm, visible 3D buildings
        const map = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/standard',
          center: skipAnimation ? HUMBLE_TX : US_CENTER,
          zoom: skipAnimation ? finalZoom : 3.5,
          pitch: skipAnimation ? finalPitch : 0,
          bearing: skipAnimation ? -30 : 0,
          antialias: true,
          attributionControl: false,
          interactive: false,
          scrollZoom: false,
          config: {
            basemap: {
              theme: 'default',
              lightPreset: 'dusk',
              showPlaceLabels: false,
              showPointOfInterestLabels: false,
              showTransitLabels: false,
              showRoadLabels: false,
              show3dObjects: true,
            },
          },
        });

        mapRef.current = map;

        map.on('load', () => {
          setLoaded(true);

          // Arc source data
          const arcFeatures = DESTINATION_CITIES.map((dest) => ({
            type: 'Feature' as const,
            properties: {},
            geometry: {
              type: 'LineString' as const,
              coordinates: generateArc(HUMBLE_TX, dest),
            },
          }));

          const endpointFeatures = DESTINATION_CITIES.map((dest) => ({
            type: 'Feature' as const,
            properties: {},
            geometry: {
              type: 'Point' as const,
              coordinates: dest,
            },
          }));

          map.addSource('arcs', {
            type: 'geojson',
            data: { type: 'FeatureCollection', features: arcFeatures },
          });

          map.addSource('endpoints', {
            type: 'geojson',
            data: { type: 'FeatureCollection', features: endpointFeatures },
          });

          // Background arcs — slightly thicker and more visible
          map.addLayer({
            id: 'arcs-bg',
            type: 'line',
            source: 'arcs',
            slot: 'top',
            layout: { 'line-cap': 'round', 'line-join': 'round' },
            paint: {
              'line-color': '#3B82F6',
              'line-width': 2,
              'line-opacity': skipAnimation ? 0 : 0.18,
            },
          });

          // Animated dash arcs
          if (!prefersReducedMotion) {
            map.addLayer({
              id: 'arcs-animated',
              type: 'line',
              source: 'arcs',
              slot: 'top',
              layout: { 'line-cap': 'round', 'line-join': 'round' },
              paint: {
                'line-color': '#3B82F6',
                'line-width': 2,
                'line-opacity': 0.5,
                'line-dasharray': [0, 4, 3],
              },
            });
          }

          // Destination endpoint dots
          map.addLayer({
            id: 'endpoint-dots',
            type: 'circle',
            source: 'endpoints',
            slot: 'top',
            paint: {
              'circle-radius': 3.5,
              'circle-color': '#3B82F6',
              'circle-opacity': skipAnimation ? 0 : 0.7,
              'circle-stroke-width': 1,
              'circle-stroke-color': '#3B82F6',
              'circle-stroke-opacity': skipAnimation ? 0 : 0.3,
            },
          });

          // Dash animation (ant-path effect)
          if (!prefersReducedMotion && !skipAnimation) {
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

            function animateDash(timestamp: number) {
              if (timestamp - lastTime >= 50) {
                lastTime = timestamp;
                if (map.getLayer('arcs-animated')) {
                  map.setPaintProperty(
                    'arcs-animated',
                    'line-dasharray',
                    dashSequence[step]
                  );
                }
                step = (step + 1) % dashSequence.length;
              }
              dashRef.current = requestAnimationFrame(animateDash);
            }

            dashRef.current = requestAnimationFrame(animateDash);
          }

          // Premium beacon marker with vertical beam
          const markerEl = document.createElement('div');
          markerEl.className = 'lumina-beacon';
          markerEl.innerHTML = `
            <div class="beacon-beam"></div>
            <div class="beacon-ring beacon-ring-1"></div>
            <div class="beacon-ring beacon-ring-2"></div>
            <div class="beacon-ring beacon-ring-3"></div>
            <div class="beacon-glow-outer"></div>
            <div class="beacon-glow"></div>
            <div class="beacon-core"></div>
            <div class="beacon-label">Humble, TX</div>
          `;
          beaconRef.current = markerEl;

          new mapboxgl.Marker({ element: markerEl, anchor: 'center' })
            .setLngLat(HUMBLE_TX)
            .addTo(map);

          // Fade arcs during flythrough
          map.on('zoom', () => {
            const zoom = map.getZoom();
            if (zoom > 5) {
              const fade = Math.max(0, 1 - (zoom - 5) / 5);
              if (map.getLayer('arcs-bg')) {
                map.setPaintProperty('arcs-bg', 'line-opacity', 0.18 * fade);
              }
              if (map.getLayer('arcs-animated')) {
                map.setPaintProperty(
                  'arcs-animated',
                  'line-opacity',
                  0.5 * fade
                );
              }
              if (map.getLayer('endpoint-dots')) {
                map.setPaintProperty(
                  'endpoint-dots',
                  'circle-opacity',
                  0.7 * fade
                );
                map.setPaintProperty(
                  'endpoint-dots',
                  'circle-stroke-opacity',
                  0.3 * fade
                );
              }
            }
          });

          // Phase 2: Cinematic flythrough (triggered on scroll into view)
          if (!prefersReducedMotion && containerRef.current) {
            let triggered = false;

            observerRef.current = new IntersectionObserver(
              (entries) => {
                if (entries[0].isIntersecting && !triggered) {
                  triggered = true;
                  observerRef.current?.disconnect();

                  // Long pause so US wide-shot registers visually
                  setTimeout(() => {
                    map.flyTo({
                      center: HUMBLE_TX,
                      zoom: finalZoom,
                      pitch: finalPitch,
                      bearing: -30,
                      duration: 8000,
                      curve: 1.2,
                      essential: true,
                      easing: (t: number) => {
                        // Smooth ease-in-out cubic for cinematic feel
                        return t < 0.5
                          ? 4 * t * t * t
                          : 1 - Math.pow(-2 * t + 2, 3) / 2;
                      },
                    });

                    // Phase 3: Landing -> slow orbit + show label
                    map.once('moveend', () => {
                      setLanded(true);

                      // Stop dash animation -- arcs are faded out
                      if (dashRef.current) {
                        cancelAnimationFrame(dashRef.current);
                        dashRef.current = null;
                      }

                      let bearing = -30;
                      function orbit() {
                        bearing += 0.006;
                        map.setBearing(bearing);
                        orbitRef.current = requestAnimationFrame(orbit);
                      }
                      orbitRef.current = requestAnimationFrame(orbit);
                    });
                  }, 2500);
                }
              },
              { threshold: 0.3 }
            );

            observerRef.current.observe(containerRef.current);
          } else {
            // Reduced motion or mobile skip — show label immediately
            setLanded(true);
          }
        });
      })
      .catch(() => {
        setError(true);
      });

    // Cleanup
    return () => {
      observerRef.current?.disconnect();
      if (dashRef.current) cancelAnimationFrame(dashRef.current);
      if (orbitRef.current) cancelAnimationFrame(orbitRef.current);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return (
    <div ref={containerRef} className="w-full">
      <div
        className="relative overflow-hidden rounded-xl md:rounded-2xl"
        style={{
          border: '1px solid rgba(59, 130, 246, 0.15)',
          background: '#0A0A0F',
          boxShadow: '0 0 40px rgba(59, 130, 246, 0.06)',
        }}
      >
        {/* Map container */}
        <div
          ref={mapContainer}
          className="w-full h-[350px] md:h-[480px]"
        />

        {/* Loading skeleton */}
        {!loaded && !error && (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ background: '#0A0A0F' }}
          >
            <div className="flex flex-col items-center gap-3">
              <div
                className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin"
                style={{
                  borderColor: '#3B82F6',
                  borderTopColor: 'transparent',
                }}
              />
              <span className="text-sm" style={{ color: '#6B6B7B' }}>
                Loading map...
              </span>
            </div>
          </div>
        )}

        {/* Error fallback */}
        {error && (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ background: '#0A0A0F' }}
          >
            <div className="text-center px-6">
              <div
                className="w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center"
                style={{ background: 'rgba(59,130,246,0.1)' }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#3B82F6"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <p
                className="text-sm font-medium"
                style={{ color: '#E8E8ED' }}
              >
                Humble, TX
              </p>
              <p className="text-xs mt-1" style={{ color: '#6B6B7B' }}>
                Serving distributors nationwide
              </p>
            </div>
          </div>
        )}

        {/* Frosted glass overlay */}
        {loaded && (
          <div className="absolute bottom-0 left-0 right-0 pointer-events-none p-4 md:p-6">
            <div
              className="px-5 py-3.5 rounded-xl"
              style={{
                background: 'rgba(10, 10, 15, 0.65)',
                backdropFilter: 'blur(16px) saturate(1.8)',
                WebkitBackdropFilter: 'blur(16px) saturate(1.8)',
                border: '1px solid rgba(59, 130, 246, 0.12)',
                boxShadow: '0 4px 24px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.04)',
              }}
            >
              <div className="flex items-center gap-3">
                <span className="lumina-overlay-dot" />
                <span
                  className="text-xs md:text-sm font-medium tracking-wide"
                  style={{ color: '#B0B0C0' }}
                >
                  Humble, TX &mdash; Serving distributors nationwide
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Manual attribution */}
      <p
        className="text-[10px] mt-1.5 text-right"
        style={{ color: '#6B6B7B', opacity: 0.5 }}
      >
        Map &copy; Mapbox &copy; OpenStreetMap
      </p>

      {/* Beacon & overlay styles */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        /* ===== Premium Beacon Marker ===== */
        .lumina-beacon {
          position: relative;
          width: 100px;
          height: 100px;
          cursor: default;
        }

        /* Vertical light beam rising from beacon */
        .beacon-beam {
          position: absolute;
          bottom: 50%;
          left: 50%;
          width: 4px;
          margin-left: -2px;
          height: 80px;
          background: linear-gradient(
            to top,
            rgba(59, 130, 246, 0.6) 0%,
            rgba(59, 130, 246, 0.2) 40%,
            rgba(59, 130, 246, 0.05) 70%,
            transparent 100%
          );
          border-radius: 2px;
          z-index: 1;
          pointer-events: none;
        }

        /* Core dot — larger and more prominent */
        .beacon-core {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 18px;
          height: 18px;
          margin: -9px 0 0 -9px;
          background: radial-gradient(circle at 35% 35%, #60A5FA, #3B82F6 60%, #2563EB);
          border: 2.5px solid rgba(255, 255, 255, 0.9);
          border-radius: 50%;
          box-shadow:
            0 0 12px rgba(59, 130, 246, 1),
            0 0 28px rgba(59, 130, 246, 0.7),
            0 0 56px rgba(59, 130, 246, 0.3);
          z-index: 5;
        }

        /* Inner glow halo */
        .beacon-glow {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 36px;
          height: 36px;
          margin: -18px 0 0 -18px;
          background: radial-gradient(
            circle,
            rgba(59, 130, 246, 0.4) 0%,
            rgba(59, 130, 246, 0.1) 50%,
            transparent 70%
          );
          border-radius: 50%;
          z-index: 4;
        }

        /* Outer glow field */
        .beacon-glow-outer {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 60px;
          height: 60px;
          margin: -30px 0 0 -30px;
          background: radial-gradient(
            circle,
            rgba(59, 130, 246, 0.15) 0%,
            rgba(59, 130, 246, 0.05) 50%,
            transparent 70%
          );
          border-radius: 50%;
          z-index: 3;
        }

        /* Label that appears after landing */
        .beacon-label {
          position: absolute;
          top: calc(50% + 22px);
          left: 50%;
          transform: translateX(-50%);
          white-space: nowrap;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.08em;
          color: rgba(255, 255, 255, 0.85);
          text-shadow: 0 1px 6px rgba(0, 0, 0, 0.8), 0 0 12px rgba(59, 130, 246, 0.4);
          opacity: 0;
          transition: opacity 1.2s ease-in 0.5s;
          z-index: 6;
          pointer-events: none;
        }

        .lumina-beacon.show-label .beacon-label {
          opacity: 1;
        }

        @media (prefers-reduced-motion: no-preference) {
          /* Pulsing expanding rings — more visible */
          .beacon-ring {
            position: absolute;
            top: 50%;
            left: 50%;
            width: 24px;
            height: 24px;
            margin: -12px 0 0 -12px;
            border-radius: 50%;
            border: 2px solid rgba(59, 130, 246, 0.6);
            z-index: 2;
          }
          .beacon-ring-1 { animation: beacon-expand 3.5s ease-out infinite; }
          .beacon-ring-2 { animation: beacon-expand 3.5s ease-out infinite 1.15s; }
          .beacon-ring-3 { animation: beacon-expand 3.5s ease-out infinite 2.3s; }

          @keyframes beacon-expand {
            0%   { transform: scale(0.8); opacity: 0.9; }
            100% { transform: scale(5);   opacity: 0; }
          }

          /* Beam subtle pulse */
          .beacon-beam {
            animation: beam-pulse 3s ease-in-out infinite;
          }
          @keyframes beam-pulse {
            0%, 100% { opacity: 0.7; }
            50%      { opacity: 1; }
          }

          /* Core subtle breathing */
          .beacon-core {
            animation: core-breathe 2.5s ease-in-out infinite;
          }
          @keyframes core-breathe {
            0%, 100% {
              box-shadow:
                0 0 12px rgba(59, 130, 246, 1),
                0 0 28px rgba(59, 130, 246, 0.7),
                0 0 56px rgba(59, 130, 246, 0.3);
            }
            50% {
              box-shadow:
                0 0 16px rgba(59, 130, 246, 1),
                0 0 36px rgba(59, 130, 246, 0.8),
                0 0 72px rgba(59, 130, 246, 0.4);
            }
          }

          .lumina-overlay-dot {
            display: inline-block;
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #3B82F6;
            box-shadow: 0 0 8px rgba(59, 130, 246, 0.6);
            flex-shrink: 0;
            animation: overlay-pulse 2s ease-in-out infinite;
          }

          @keyframes overlay-pulse {
            0%, 100% { opacity: 0.6; box-shadow: 0 0 6px rgba(59, 130, 246, 0.4); }
            50%      { opacity: 1;   box-shadow: 0 0 14px rgba(59, 130, 246, 0.8); }
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .beacon-ring { display: none; }
          .beacon-beam { animation: none; opacity: 0.7; }
          .beacon-core { animation: none; }
          .beacon-label { opacity: 1; transition: none; }
          .lumina-overlay-dot {
            display: inline-block;
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #3B82F6;
            box-shadow: 0 0 8px rgba(59, 130, 246, 0.6);
            flex-shrink: 0;
          }
        }

        /* Hide default Mapbox attribution (manual attribution below) */
        .mapboxgl-ctrl-attrib {
          display: none !important;
        }
      `,
        }}
      />
    </div>
  );
}
