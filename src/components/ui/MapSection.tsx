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

        const finalZoom = isMobile ? 14.5 : 15.5;
        const skipAnimation = prefersReducedMotion;

        // Phase 1: Create map with Standard style config applied at init
        const map = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/standard',
          center: skipAnimation ? HUMBLE_TX : US_CENTER,
          zoom: skipAnimation ? finalZoom : 3.5,
          pitch: skipAnimation ? 60 : 0,
          bearing: skipAnimation ? -30 : 0,
          antialias: true,
          attributionControl: false,
          interactive: false,
          scrollZoom: false,
          config: {
            basemap: {
              theme: 'monochrome',
              lightPreset: 'night',
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

          // Background arcs (faint, always visible at wide zoom)
          // Use slot: 'top' so layers render above Standard basemap
          map.addLayer({
            id: 'arcs-bg',
            type: 'line',
            source: 'arcs',
            slot: 'top',
            layout: { 'line-cap': 'round', 'line-join': 'round' },
            paint: {
              'line-color': '#3B82F6',
              'line-width': 1.5,
              'line-opacity': skipAnimation ? 0 : 0.12,
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
                'line-width': 1.5,
                'line-opacity': 0.45,
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
              'circle-radius': 3,
              'circle-color': '#3B82F6',
              'circle-opacity': skipAnimation ? 0 : 0.6,
              'circle-stroke-width': 1,
              'circle-stroke-color': '#3B82F6',
              'circle-stroke-opacity': skipAnimation ? 0 : 0.2,
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

          // Pulsing origin beacon marker
          const markerEl = document.createElement('div');
          markerEl.className = 'lumina-beacon';
          markerEl.innerHTML = `
            <div class="beacon-ring beacon-ring-1"></div>
            <div class="beacon-ring beacon-ring-2"></div>
            <div class="beacon-ring beacon-ring-3"></div>
            <div class="beacon-glow"></div>
            <div class="beacon-core"></div>
          `;

          new mapboxgl.Marker({ element: markerEl, anchor: 'center' })
            .setLngLat(HUMBLE_TX)
            .addTo(map);

          // Fade arcs during flythrough
          map.on('zoom', () => {
            const zoom = map.getZoom();
            if (zoom > 5) {
              const fade = Math.max(0, 1 - (zoom - 5) / 5);
              if (map.getLayer('arcs-bg')) {
                map.setPaintProperty('arcs-bg', 'line-opacity', 0.12 * fade);
              }
              if (map.getLayer('arcs-animated')) {
                map.setPaintProperty(
                  'arcs-animated',
                  'line-opacity',
                  0.45 * fade
                );
              }
              if (map.getLayer('endpoint-dots')) {
                map.setPaintProperty(
                  'endpoint-dots',
                  'circle-opacity',
                  0.6 * fade
                );
                map.setPaintProperty(
                  'endpoint-dots',
                  'circle-stroke-opacity',
                  0.2 * fade
                );
              }
            }
          });

          // Phase 2: Flythrough (triggered on scroll into view)
          if (!prefersReducedMotion && containerRef.current) {
            let triggered = false;

            observerRef.current = new IntersectionObserver(
              (entries) => {
                if (entries[0].isIntersecting && !triggered) {
                  triggered = true;
                  observerRef.current?.disconnect();

                  // Brief pause so the wide-shot registers visually
                  setTimeout(() => {
                    map.flyTo({
                      center: HUMBLE_TX,
                      zoom: finalZoom,
                      pitch: 60,
                      bearing: -30,
                      duration: 4000,
                      curve: 1.5,
                      essential: true,
                    });

                    // Phase 3: Landing -> slow orbit
                    map.once('moveend', () => {
                      // Stop dash animation -- arcs are faded out
                      if (dashRef.current) {
                        cancelAnimationFrame(dashRef.current);
                        dashRef.current = null;
                      }

                      let bearing = -30;
                      function orbit() {
                        bearing += 0.015;
                        map.setBearing(bearing);
                        orbitRef.current = requestAnimationFrame(orbit);
                      }
                      orbitRef.current = requestAnimationFrame(orbit);
                    });
                  }, 1200);
                }
              },
              { threshold: 0.3 }
            );

            observerRef.current.observe(containerRef.current);
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
          border: '1px solid #2A2A36',
          background: '#0A0A0F',
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
              className="px-4 py-3 rounded-lg"
              style={{
                background: 'rgba(18, 18, 26, 0.7)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(42, 42, 54, 0.5)',
              }}
            >
              <div className="flex items-center gap-2.5">
                <span className="lumina-overlay-dot" />
                <span
                  className="text-xs md:text-sm font-medium"
                  style={{ color: '#A0A0B0' }}
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
        /* Beacon marker */
        .lumina-beacon {
          position: relative;
          width: 60px;
          height: 60px;
          cursor: default;
        }
        .beacon-core {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 14px;
          height: 14px;
          margin: -7px 0 0 -7px;
          background: #3B82F6;
          border: 2px solid #E8E8ED;
          border-radius: 50%;
          box-shadow:
            0 0 20px rgba(59,130,246,0.8),
            0 0 40px rgba(59,130,246,0.4);
          z-index: 4;
        }
        .beacon-glow {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 28px;
          height: 28px;
          margin: -14px 0 0 -14px;
          background: radial-gradient(
            circle,
            rgba(59,130,246,0.35) 0%,
            transparent 70%
          );
          border-radius: 50%;
          z-index: 3;
        }

        @media (prefers-reduced-motion: no-preference) {
          .beacon-ring {
            position: absolute;
            top: 50%;
            left: 50%;
            width: 20px;
            height: 20px;
            margin: -10px 0 0 -10px;
            border-radius: 50%;
            border: 1.5px solid rgba(59,130,246,0.5);
            z-index: 2;
          }
          .beacon-ring-1 { animation: beacon-expand 3s ease-out infinite; }
          .beacon-ring-2 { animation: beacon-expand 3s ease-out infinite 1s; }
          .beacon-ring-3 { animation: beacon-expand 3s ease-out infinite 2s; }

          @keyframes beacon-expand {
            0%   { transform: scale(0.8); opacity: 0.8; }
            100% { transform: scale(4);   opacity: 0; }
          }

          .lumina-overlay-dot {
            display: inline-block;
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #3B82F6;
            box-shadow: 0 0 8px rgba(59,130,246,0.6);
            flex-shrink: 0;
            animation: overlay-pulse 2s ease-in-out infinite;
          }

          @keyframes overlay-pulse {
            0%, 100% { opacity: 0.6; box-shadow: 0 0 6px rgba(59,130,246,0.4); }
            50%      { opacity: 1;   box-shadow: 0 0 12px rgba(59,130,246,0.8); }
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .beacon-ring { display: none; }
          .lumina-overlay-dot {
            display: inline-block;
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #3B82F6;
            box-shadow: 0 0 8px rgba(59,130,246,0.6);
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
