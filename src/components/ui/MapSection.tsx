import { useEffect, useRef, useState } from 'react';

const MAPBOX_TOKEN = import.meta.env.PUBLIC_MAPBOX_TOKEN || '';
const HUMBLE_TX: [number, number] = [-95.2622, 29.9988];
const US_CENTER: [number, number] = [-96.5, 38.5];

// Houston metro area — the fly-to destination (NOT street level)
const HOUSTON_METRO: [number, number] = [-95.37, 29.76];

// 10 major US distribution hubs — destinations for animated arcs
const DESTINATION_CITIES: { coords: [number, number]; name: string }[] = [
  { coords: [-122.33, 47.61], name: 'Seattle' },
  { coords: [-122.42, 37.77], name: 'San Francisco' },
  { coords: [-118.24, 34.05], name: 'Los Angeles' },
  { coords: [-112.07, 33.45], name: 'Phoenix' },
  { coords: [-104.99, 39.74], name: 'Denver' },
  { coords: [-87.63, 41.88], name: 'Chicago' },
  { coords: [-93.27, 44.98], name: 'Minneapolis' },
  { coords: [-84.39, 33.75], name: 'Atlanta' },
  { coords: [-80.19, 25.76], name: 'Miami' },
  { coords: [-74.01, 40.71], name: 'New York' },
];

/**
 * Generate a quadratic bezier arc between two lng/lat points.
 * The arc curves northward for visual consistency.
 */
function generateArc(
  origin: [number, number],
  destination: [number, number],
  numPoints = 60
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
  const curvature = dist * 0.18;
  const controlLng = midLng + perpX * curvature * (perpY >= 0 ? 1 : -1);
  const controlLat = midLat + Math.abs(perpY) * curvature + curvature * 0.35;
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

// Branded overlay stats
const BRAND_STATS = [
  { value: 'Nationwide', label: 'Service Coverage' },
  { value: '150x', label: 'Performance Gains' },
  { value: '24hr', label: 'Response Time' },
];

export default function MapSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const dashRef = useRef<number | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [revealed, setRevealed] = useState(false);

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

    // Final zoom level — metro/regional, NOT street level
    const finalZoom = isMobile ? 7.5 : 8.5;
    const finalPitch = isMobile ? 25 : 35;
    const finalBearing = -15;

    loadMapbox()
      .then((mapboxgl) => {
        if (!mapContainer.current || mapRef.current) return;
        mapboxgl.accessToken = MAPBOX_TOKEN;

        const skipAnimation = prefersReducedMotion;

        // Create map with dark Standard style
        const map = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/standard',
          center: skipAnimation ? HOUSTON_METRO : US_CENTER,
          zoom: skipAnimation ? finalZoom : 3.5,
          pitch: skipAnimation ? finalPitch : 0,
          bearing: skipAnimation ? finalBearing : 0,
          antialias: true,
          attributionControl: false,
          interactive: false,
          scrollZoom: false,
          config: {
            basemap: {
              theme: 'default',
              lightPreset: 'night',
              showPlaceLabels: false,
              showPointOfInterestLabels: false,
              showTransitLabels: false,
              showRoadLabels: false,
              show3dObjects: false,
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
              coordinates: generateArc(HUMBLE_TX, dest.coords),
            },
          }));

          // Origin point (Humble TX)
          const originFeature = {
            type: 'Feature' as const,
            properties: { isOrigin: true },
            geometry: {
              type: 'Point' as const,
              coordinates: HUMBLE_TX,
            },
          };

          const endpointFeatures = DESTINATION_CITIES.map((dest) => ({
            type: 'Feature' as const,
            properties: { name: dest.name },
            geometry: {
              type: 'Point' as const,
              coordinates: dest.coords,
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

          map.addSource('origin', {
            type: 'geojson',
            data: { type: 'FeatureCollection', features: [originFeature] },
          });

          // === ARC LAYER 1: Wide soft glow (outermost) ===
          map.addLayer({
            id: 'arcs-glow',
            type: 'line',
            source: 'arcs',
            slot: 'top',
            layout: { 'line-cap': 'round', 'line-join': 'round' },
            paint: {
              'line-color': '#3B82F6',
              'line-width': 10,
              'line-opacity': skipAnimation ? 0.08 : 0.08,
              'line-blur': 6,
            },
          });

          // === ARC LAYER 2: Medium bright core ===
          map.addLayer({
            id: 'arcs-bright',
            type: 'line',
            source: 'arcs',
            slot: 'top',
            layout: { 'line-cap': 'round', 'line-join': 'round' },
            paint: {
              'line-color': '#60A5FA',
              'line-width': 3,
              'line-opacity': skipAnimation ? 0.3 : 0.3,
            },
          });

          // === ARC LAYER 3: Animated dash (topmost) ===
          if (!prefersReducedMotion) {
            map.addLayer({
              id: 'arcs-animated',
              type: 'line',
              source: 'arcs',
              slot: 'top',
              layout: { 'line-cap': 'round', 'line-join': 'round' },
              paint: {
                'line-color': '#93C5FD',
                'line-width': 2,
                'line-opacity': 0.6,
                'line-dasharray': [0, 4, 3],
              },
            });
          }

          // === ENDPOINT GLOW (outer ring) ===
          map.addLayer({
            id: 'endpoint-glow',
            type: 'circle',
            source: 'endpoints',
            slot: 'top',
            paint: {
              'circle-radius': 8,
              'circle-color': '#3B82F6',
              'circle-opacity': 0.15,
              'circle-blur': 1,
            },
          });

          // === ENDPOINT DOTS (inner) ===
          map.addLayer({
            id: 'endpoint-dots',
            type: 'circle',
            source: 'endpoints',
            slot: 'top',
            paint: {
              'circle-radius': 4,
              'circle-color': '#60A5FA',
              'circle-opacity': 0.8,
              'circle-stroke-width': 1.5,
              'circle-stroke-color': '#3B82F6',
              'circle-stroke-opacity': 0.5,
            },
          });

          // === ORIGIN GLOW (Humble TX — larger) ===
          map.addLayer({
            id: 'origin-glow',
            type: 'circle',
            source: 'origin',
            slot: 'top',
            paint: {
              'circle-radius': 14,
              'circle-color': '#8B5CF6',
              'circle-opacity': 0.12,
              'circle-blur': 1,
            },
          });

          // === ORIGIN DOT (Humble TX) ===
          map.addLayer({
            id: 'origin-dot',
            type: 'circle',
            source: 'origin',
            slot: 'top',
            paint: {
              'circle-radius': 6,
              'circle-color': '#A78BFA',
              'circle-opacity': 0.9,
              'circle-stroke-width': 2,
              'circle-stroke-color': '#8B5CF6',
              'circle-stroke-opacity': 0.6,
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

          // Phase 2: Cinematic flythrough (triggered on scroll into view)
          if (!prefersReducedMotion && containerRef.current) {
            let triggered = false;

            observerRef.current = new IntersectionObserver(
              (entries) => {
                if (entries[0].isIntersecting && !triggered) {
                  triggered = true;
                  observerRef.current?.disconnect();

                  // Phase 1 holds for 2.5s (wide shot registers visually)
                  setTimeout(() => {
                    map.flyTo({
                      center: HOUSTON_METRO,
                      zoom: finalZoom,
                      pitch: finalPitch,
                      bearing: finalBearing,
                      duration: 7000,
                      curve: 1.3,
                      essential: true,
                      easing: (t: number) => {
                        // Smooth ease-in-out for cinematic feel
                        return t < 0.5
                          ? 4 * t * t * t
                          : 1 - Math.pow(-2 * t + 2, 3) / 2;
                      },
                    });

                    // Phase 3: The Reveal — dim map, show branded overlay
                    map.once('moveend', () => {
                      setRevealed(true);
                    });
                  }, 2500);
                }
              },
              { threshold: 0.3 }
            );

            observerRef.current.observe(containerRef.current);
          } else {
            // Reduced motion — show overlay immediately
            setRevealed(true);
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
          background: '#060610',
          boxShadow: '0 0 60px rgba(59, 130, 246, 0.06)',
        }}
      >
        {/* Map container */}
        <div
          ref={mapContainer}
          className="w-full h-[350px] md:h-[480px]"
          style={{
            transition: 'filter 1.5s ease',
            filter: revealed ? 'brightness(0.55)' : 'brightness(1)',
          }}
        />

        {/* Loading skeleton */}
        {!loaded && !error && (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ background: '#060610' }}
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
            style={{ background: '#060610' }}
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

        {/* === THE REVEAL: Branded overlay === */}
        {loaded && (
          <div
            className="absolute inset-0 flex items-center justify-center p-4 md:p-8"
            style={{
              opacity: revealed ? 1 : 0,
              transition: 'opacity 1.8s ease 0.3s',
              pointerEvents: revealed ? 'auto' : 'none',
            }}
          >
            {/* Scrim gradient for readability */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  'radial-gradient(ellipse at center, rgba(6,6,16,0.5) 0%, rgba(6,6,16,0.3) 60%, transparent 100%)',
                pointerEvents: 'none',
              }}
            />

            {/* Glassmorphism card */}
            <div
              className="relative z-10 w-full max-w-lg text-center px-6 py-8 md:px-10 md:py-10 rounded-2xl"
              style={{
                background: 'rgba(10, 10, 20, 0.6)',
                backdropFilter: 'blur(20px) saturate(1.6)',
                WebkitBackdropFilter: 'blur(20px) saturate(1.6)',
                border: '1px solid rgba(139, 92, 246, 0.15)',
                boxShadow:
                  '0 8px 40px rgba(0, 0, 0, 0.4), 0 0 80px rgba(59, 130, 246, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.04)',
              }}
            >
              {/* Location badge */}
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-5"
                style={{
                  background: 'rgba(59, 130, 246, 0.1)',
                  border: '1px solid rgba(59, 130, 246, 0.2)',
                }}
              >
                <span className="lumina-reveal-dot" />
                <span
                  className="text-xs font-medium tracking-wider uppercase"
                  style={{ color: '#93C5FD' }}
                >
                  Humble, TX
                </span>
              </div>

              {/* Company name */}
              <h3
                className="text-2xl md:text-3xl font-bold mb-2"
                style={{
                  background: 'linear-gradient(135deg, #E8E8ED 0%, #93C5FD 50%, #C4B5FD 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Lumina ERP
              </h3>

              {/* Tagline */}
              <p
                className="text-sm md:text-base mb-6 md:mb-8"
                style={{ color: '#A0A0B8' }}
              >
                Illuminate your ERP potential.
              </p>

              {/* Divider */}
              <div
                className="w-12 h-px mx-auto mb-6 md:mb-8"
                style={{
                  background:
                    'linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.5), transparent)',
                }}
              />

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-3 md:gap-6">
                {BRAND_STATS.map((stat, i) => (
                  <div key={i} className="text-center">
                    <div
                      className="text-lg md:text-xl font-bold mb-0.5"
                      style={{
                        color:
                          i === 1
                            ? '#A78BFA'
                            : '#60A5FA',
                      }}
                    >
                      {stat.value}
                    </div>
                    <div
                      className="text-[10px] md:text-xs tracking-wide uppercase"
                      style={{ color: '#6B6B7B' }}
                    >
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Bottom bar — always present when loaded */}
        {loaded && (
          <div className="absolute bottom-0 left-0 right-0 pointer-events-none p-3 md:p-4">
            <div
              className="flex items-center justify-between px-4 py-2.5 rounded-lg"
              style={{
                background: 'rgba(10, 10, 15, 0.5)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(59, 130, 246, 0.08)',
                opacity: revealed ? 0 : 1,
                transition: 'opacity 1s ease',
                pointerEvents: 'none',
              }}
            >
              <div className="flex items-center gap-2">
                <span className="lumina-reveal-dot" />
                <span
                  className="text-xs font-medium tracking-wide"
                  style={{ color: '#8B8BA0' }}
                >
                  Connecting distributors coast to coast
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

      {/* Styles */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .lumina-reveal-dot {
          display: inline-block;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #3B82F6;
          box-shadow: 0 0 8px rgba(59, 130, 246, 0.6);
          flex-shrink: 0;
        }

        @media (prefers-reduced-motion: no-preference) {
          .lumina-reveal-dot {
            animation: reveal-dot-pulse 2.5s ease-in-out infinite;
          }

          @keyframes reveal-dot-pulse {
            0%, 100% { opacity: 0.6; box-shadow: 0 0 4px rgba(59, 130, 246, 0.3); }
            50%      { opacity: 1;   box-shadow: 0 0 12px rgba(59, 130, 246, 0.7); }
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
