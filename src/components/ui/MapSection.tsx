import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const MAPBOX_TOKEN = import.meta.env.PUBLIC_MAPBOX_TOKEN || '';
const HUMBLE_TX: [number, number] = [-95.2622, 29.9988];

// 10 major US distribution hubs
const WAREHOUSE_CITIES: {
  coords: [number, number];
  name: string;
}[] = [
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
  const controlLat =
    midLat + Math.abs(perpY) * curvature + curvature * 0.35;
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
  const dashRef = useRef<number | null>(null);
  const orbitRef = useRef<number | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [phase, setPhase] = useState<'globe' | 'flying' | 'landed'>('globe');

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    const isMobile = window.innerWidth < 768;

    // Landing camera — zoomed out enough to see the warehouse network
    const landing = {
      center: (isMobile ? [-96, 38] : [-95, 37]) as [number, number],
      zoom: isMobile ? 3.8 : 4.8,
      pitch: isMobile ? 45 : 50,
      bearing: -15,
    };

    // Load Mapbox GL CSS
    if (!document.querySelector('link[href*="mapbox-gl"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href =
        'https://api.mapbox.com/mapbox-gl-js/v3.4.0/mapbox-gl.css';
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

        const skipAnimation = prefersReducedMotion;

        // === MAP INIT ===
        // Globe projection at low zoom shows the earth; Mapbox transitions to mercator at ~zoom 5
        const map = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/standard',
          center: skipAnimation ? landing.center : [-100, 40],
          zoom: skipAnimation ? landing.zoom : 1.5,
          pitch: skipAnimation ? landing.pitch : 0,
          bearing: skipAnimation ? landing.bearing : 10,
          projection: 'globe',
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

          // Atmospheric fog with subtle stars for globe view
          map.setFog({
            color: 'rgba(10, 10, 15, 0.85)',
            'high-color': 'rgba(15, 15, 35, 0.6)',
            'horizon-blend': 0.04,
            'space-color': '#060610',
            'star-intensity': 0.12,
          });

          // ──────────────────────────────────
          // ARC DATA
          // ──────────────────────────────────
          const arcFeatures = WAREHOUSE_CITIES.map((dest) => ({
            type: 'Feature' as const,
            properties: { name: dest.name },
            geometry: {
              type: 'LineString' as const,
              coordinates: generateArc(HUMBLE_TX, dest.coords),
            },
          }));

          const originFeature = {
            type: 'Feature' as const,
            properties: { isOrigin: true },
            geometry: {
              type: 'Point' as const,
              coordinates: HUMBLE_TX,
            },
          };

          const warehousePointFeatures = WAREHOUSE_CITIES.map((dest) => ({
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

          map.addSource('warehouses', {
            type: 'geojson',
            data: {
              type: 'FeatureCollection',
              features: warehousePointFeatures,
            },
          });

          map.addSource('origin', {
            type: 'geojson',
            data: { type: 'FeatureCollection', features: [originFeature] },
          });

          // ──────────────────────────────────
          // ARC LAYERS (visible on globe, fade during zoom)
          // ──────────────────────────────────

          // Arc glow (wide, soft)
          map.addLayer({
            id: 'arcs-glow',
            type: 'line',
            source: 'arcs',
            slot: 'top',
            layout: { 'line-cap': 'round', 'line-join': 'round' },
            paint: {
              'line-color': '#3B82F6',
              'line-width': 10,
              'line-opacity': skipAnimation ? 0 : 0.08,
              'line-blur': 6,
              'line-opacity-transition': { duration: 1200, delay: 0 },
            },
          });

          // Arc bright core
          map.addLayer({
            id: 'arcs-bright',
            type: 'line',
            source: 'arcs',
            slot: 'top',
            layout: { 'line-cap': 'round', 'line-join': 'round' },
            paint: {
              'line-color': '#60A5FA',
              'line-width': 3,
              'line-opacity': skipAnimation ? 0 : 0.3,
              'line-opacity-transition': { duration: 1200, delay: 0 },
            },
          });

          // Arc animated dash
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
                'line-opacity-transition': { duration: 1200, delay: 0 },
              },
            });
          }

          // ──────────────────────────────────
          // WAREHOUSE POINT MARKERS (for globe/wide view)
          // ──────────────────────────────────

          map.addLayer({
            id: 'warehouse-glow-outer',
            type: 'circle',
            source: 'warehouses',
            slot: 'top',
            paint: {
              'circle-radius': 18,
              'circle-color': '#3B82F6',
              'circle-opacity': skipAnimation ? 0 : 0.06,
              'circle-blur': 1,
              'circle-opacity-transition': { duration: 1200, delay: 0 },
            },
          });

          map.addLayer({
            id: 'warehouse-dot',
            type: 'circle',
            source: 'warehouses',
            slot: 'top',
            paint: {
              'circle-radius': 4.5,
              'circle-color': '#60A5FA',
              'circle-opacity': skipAnimation ? 0 : 0.85,
              'circle-stroke-width': 1.5,
              'circle-stroke-color': '#3B82F6',
              'circle-stroke-opacity': skipAnimation ? 0 : 0.6,
              'circle-opacity-transition': { duration: 1200, delay: 0 },
              'circle-stroke-opacity-transition': {
                duration: 1200,
                delay: 0,
              },
            },
          });

          // ──────────────────────────────────
          // ORIGIN MARKER (Humble TX — HQ pulse)
          // ──────────────────────────────────

          map.addLayer({
            id: 'origin-glow-outer',
            type: 'circle',
            source: 'origin',
            slot: 'top',
            paint: {
              'circle-radius': 22,
              'circle-color': '#8B5CF6',
              'circle-opacity': 0.08,
              'circle-blur': 1,
              'circle-opacity-transition': { duration: 1200, delay: 0 },
            },
          });

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
              'circle-opacity-transition': { duration: 1200, delay: 0 },
              'circle-stroke-opacity-transition': {
                duration: 1200,
                delay: 0,
              },
            },
          });

          // ──────────────────────────────────
          // DASH ANIMATION (ant-path effect on arcs)
          // ──────────────────────────────────

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

          /**
           * Fade arcs and warehouse point markers during the flythrough.
           */
          function fadeArcsOut() {
            if (map.getLayer('arcs-glow'))
              map.setPaintProperty('arcs-glow', 'line-opacity', 0);
            if (map.getLayer('arcs-bright'))
              map.setPaintProperty('arcs-bright', 'line-opacity', 0);
            if (map.getLayer('arcs-animated'))
              map.setPaintProperty('arcs-animated', 'line-opacity', 0);
            if (map.getLayer('warehouse-glow-outer'))
              map.setPaintProperty(
                'warehouse-glow-outer',
                'circle-opacity',
                0
              );
            if (map.getLayer('warehouse-dot')) {
              map.setPaintProperty('warehouse-dot', 'circle-opacity', 0);
              map.setPaintProperty(
                'warehouse-dot',
                'circle-stroke-opacity',
                0
              );
            }
            // Also fade origin marker — buildings take over
            if (map.getLayer('origin-glow-outer'))
              map.setPaintProperty(
                'origin-glow-outer',
                'circle-opacity',
                0
              );
            if (map.getLayer('origin-dot')) {
              map.setPaintProperty('origin-dot', 'circle-opacity', 0);
              map.setPaintProperty(
                'origin-dot',
                'circle-stroke-opacity',
                0
              );
            }
            // Stop dash animation
            if (dashRef.current) {
              cancelAnimationFrame(dashRef.current);
              dashRef.current = null;
            }
          }

          /**
           * Slow orbit — continuously rotate bearing around focal point.
           */
          function startOrbit() {
            let bearing = landing.bearing;
            function orbit() {
              bearing += 0.015;
              if (mapRef.current) {
                mapRef.current.setBearing(bearing);
              }
              orbitRef.current = requestAnimationFrame(orbit);
            }
            orbitRef.current = requestAnimationFrame(orbit);
          }

          // ──────────────────────────────────
          // FLYTHROUGH TRIGGER
          // ──────────────────────────────────

          if (!prefersReducedMotion && containerRef.current) {
            let triggered = false;
            let arcsFaded = false;

            // Fade arcs when zoom passes globe → country threshold
            map.on('zoom', () => {
              if (!arcsFaded && map.getZoom() > 3) {
                arcsFaded = true;
                fadeArcsOut();
              }
            });

            observerRef.current = new IntersectionObserver(
              (entries) => {
                if (entries[0].isIntersecting && !triggered) {
                  triggered = true;
                  observerRef.current?.disconnect();

                  // Brief hold on globe view, then fly
                  timeoutRef.current = setTimeout(() => {
                    setPhase('flying');

                    map.flyTo({
                      center: landing.center,
                      zoom: landing.zoom,
                      pitch: landing.pitch,
                      bearing: landing.bearing,
                      duration: 5000,
                      curve: 1.8,
                      essential: true,
                    });

                    map.once('moveend', () => {
                      setPhase('landed');
                      startOrbit();
                    });
                  }, 600);
                }
              },
              { threshold: 0.3 }
            );

            observerRef.current.observe(containerRef.current);
          } else {
            // Reduced motion — start at final position
            setPhase('landed');
          }
        });
      })
      .catch(() => {
        setError(true);
      });

    // Cleanup
    return () => {
      observerRef.current?.disconnect();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (dashRef.current) cancelAnimationFrame(dashRef.current);
      if (orbitRef.current) cancelAnimationFrame(orbitRef.current);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return (
    <div ref={containerRef} className="w-full relative" id="lumina-map">
      {/* Background radial glow */}
      <div
        className="absolute inset-0 -m-8 md:-m-16 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(59, 130, 246, 0.06) 0%, rgba(139, 92, 246, 0.03) 40%, transparent 70%)',
        }}
      />
      <div
        className="relative overflow-hidden rounded-xl md:rounded-2xl"
        style={{
          border: '1px solid rgba(59, 130, 246, 0.15)',
          background: '#060610',
          boxShadow: '0 0 80px rgba(59, 130, 246, 0.08), 0 0 160px rgba(139, 92, 246, 0.04)',
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

        {/* ═══════════════════════════════════════
            LUMINA ERP LANDING PANEL
            Glassmorphism card — appears after flythrough
            ═══════════════════════════════════════ */}
        <AnimatePresence>
          {phase === 'landed' && loaded && (
            <motion.div
              key="landing-panel"
              className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 1,
                delay: 0.4,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <div
                className="rounded-2xl px-8 py-6 relative overflow-hidden text-center"
                style={{
                  background: 'rgba(6, 6, 14, 0.75)',
                  backdropFilter: 'blur(24px)',
                  WebkitBackdropFilter: 'blur(24px)',
                  border: '1px solid rgba(59, 130, 246, 0.15)',
                  boxShadow:
                    '0 12px 48px rgba(0, 0, 0, 0.6), 0 0 80px rgba(59, 130, 246, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
                }}
              >
                {/* Top accent line */}
                <div
                  className="absolute top-0 left-1/2 -translate-x-1/2 h-[2px] w-[60%]"
                  style={{
                    background: 'linear-gradient(90deg, transparent, #3B82F6, #8B5CF6, transparent)',
                  }}
                />

                {/* Brand */}
                <h3 className="text-2xl font-bold text-white tracking-tight">
                  LUMINA<span style={{ color: '#3B82F6' }}> ERP</span>
                </h3>

                {/* Location with live dot */}
                <div className="flex items-center justify-center gap-2 mt-2.5">
                  <span className="lumina-reveal-dot" />
                  <span
                    className="text-sm font-medium tracking-wide"
                    style={{ color: 'rgba(255, 255, 255, 0.7)' }}
                  >
                    Humble, TX
                  </span>
                </div>

                {/* Divider */}
                <div
                  className="mx-auto mt-3 mb-3 w-12 h-px"
                  style={{ background: 'rgba(59, 130, 246, 0.3)' }}
                />

                {/* Tagline */}
                <p
                  className="text-xs font-medium uppercase tracking-[0.15em]"
                  style={{ color: 'rgba(255, 255, 255, 0.4)' }}
                >
                  Serving distributors nationwide
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Frosted glass bottom bar — visible during globe/flying phases only */}
        {loaded && phase !== 'landed' && (
          <div className="absolute bottom-0 left-0 right-0 pointer-events-none p-3 md:p-4">
            <div
              className="flex items-center justify-between px-4 py-2.5 rounded-lg"
              style={{
                background: 'rgba(10, 10, 15, 0.6)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(59, 130, 246, 0.1)',
              }}
            >
              <div className="flex items-center gap-2">
                <span className="lumina-reveal-dot" />
                <span
                  className="text-xs font-medium tracking-wide"
                  style={{ color: '#A0A0B8' }}
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
