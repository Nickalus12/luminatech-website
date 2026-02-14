import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const MAPBOX_TOKEN = import.meta.env.PUBLIC_MAPBOX_TOKEN || '';
const HUMBLE_TX: [number, number] = [-95.2622, 29.9988];

const WAREHOUSE_CITIES: { coords: [number, number]; name: string }[] = [
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

/* ─────────────────────────────────────────────
   ARC GENERATOR — quadratic bezier between points
   ───────────────────────────────────────────── */
function generateArc(
  origin: [number, number],
  dest: [number, number],
  numPoints = 80,
): [number, number][] {
  const [lng1, lat1] = origin;
  const [lng2, lat2] = dest;
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

/* ─────────────────────────────────────────────
   PULSING DOT — canvas-rendered animated image
   Used for the Humble TX origin beacon
   ───────────────────────────────────────────── */
function createPulsingDot(
  map: any,
  size: number,
  color: [number, number, number],
  phaseOffset = 0,
) {
  return {
    width: size,
    height: size,
    data: new Uint8Array(size * size * 4),
    context: null as CanvasRenderingContext2D | null,

    onAdd() {
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      this.context = canvas.getContext('2d');
    },

    render() {
      if (!this.context) return false;
      const ctx = this.context;
      const duration = 2000;
      const t = ((performance.now() + phaseOffset) % duration) / duration;
      const coreRadius = (size / 2) * 0.2;
      const pulseRadius = (size / 2) * 0.85 * t + coreRadius;
      const cx = size / 2;
      const cy = size / 2;
      const [r, g, b] = color;

      ctx.clearRect(0, 0, size, size);

      // Outermost expanding ring
      ctx.beginPath();
      ctx.arc(cx, cy, pulseRadius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${0.35 * (1 - t)})`;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Expanding fill
      ctx.beginPath();
      ctx.arc(cx, cy, pulseRadius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${0.12 * (1 - t)})`;
      ctx.fill();

      // Inner glow
      const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreRadius * 3);
      gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.6)`);
      gradient.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, 0.15)`);
      gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
      ctx.beginPath();
      ctx.arc(cx, cy, coreRadius * 3, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      // Bright core
      ctx.beginPath();
      ctx.arc(cx, cy, coreRadius, 0, Math.PI * 2);
      const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreRadius);
      coreGrad.addColorStop(0, '#ffffff');
      coreGrad.addColorStop(0.4, `rgba(${r}, ${g}, ${b}, 1)`);
      coreGrad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0.8)`);
      ctx.fillStyle = coreGrad;
      ctx.fill();

      this.data = ctx.getImageData(0, 0, size, size).data;
      map.triggerRepaint();
      return true;
    },
  };
}

/* ─────────────────────────────────────────────
   ANIMATED COUNTER HOOK
   ───────────────────────────────────────────── */
function useAnimatedCounter(target: number, duration = 1200, active = false) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!active) return;
    const start = performance.now();
    let raf: number;
    function tick(now: number) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, target, duration]);
  return value;
}

/* ═════════════════════════════════════════════
   MAP SECTION COMPONENT
   ═════════════════════════════════════════════ */
export default function MapSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const animFrameRefs = useRef<number[]>([]);
  const timeoutRefs = useRef<ReturnType<typeof setTimeout>[]>([]);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [phase, setPhase] = useState<'globe' | 'flying' | 'network' | 'landed'>('globe');
  const [arcsRevealed, setArcsRevealed] = useState(0);

  const connectionCount = useAnimatedCounter(10, 1500, phase === 'landed');

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    const isMobile = window.innerWidth < 768;

    const landing = {
      center: (isMobile ? [-96, 38] : [-95, 37]) as [number, number],
      zoom: isMobile ? 3.6 : 4.5,
      pitch: isMobile ? 40 : 50,
      bearing: -15,
    };

    // Load Mapbox CSS
    if (!document.querySelector('link[href*="mapbox-gl"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://api.mapbox.com/mapbox-gl-js/v3.4.0/mapbox-gl.css';
      document.head.appendChild(link);
    }

    // Load Mapbox JS
    const loadMapbox = (): Promise<any> => {
      if ((window as any).mapboxgl) return Promise.resolve((window as any).mapboxgl);
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
        const skipAll = prefersReducedMotion;

        const map = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/standard',
          center: skipAll ? landing.center : [-40, 20],
          zoom: skipAll ? landing.zoom : 1.2,
          pitch: skipAll ? landing.pitch : 0,
          bearing: skipAll ? landing.bearing : 30,
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

          // ── ATMOSPHERE ──
          map.setFog({
            color: '#0a0a1a',
            'high-color': '#060614',
            'horizon-blend': 0.015,
            'space-color': '#030308',
            'star-intensity': 0.85,
          });

          // ── PRE-COMPUTE ALL ARCS ──
          const allArcs = WAREHOUSE_CITIES.map((city) => ({
            city,
            points: generateArc(HUMBLE_TX, city.coords),
          }));

          // ── SOURCES ──

          // Per-arc sources (for line-gradient + progressive reveal)
          allArcs.forEach((arc, i) => {
            map.addSource(`arc-${i}`, {
              type: 'geojson',
              lineMetrics: true,
              data: {
                type: 'Feature',
                properties: { name: arc.city.name },
                geometry: {
                  type: 'LineString',
                  coordinates: skipAll ? arc.points : [arc.points[0]],
                },
              },
            });
          });

          // Origin point
          map.addSource('origin', {
            type: 'geojson',
            data: {
              type: 'FeatureCollection',
              features: [
                {
                  type: 'Feature',
                  properties: {},
                  geometry: { type: 'Point', coordinates: HUMBLE_TX },
                },
              ],
            },
          });

          // Destination points
          map.addSource('destinations', {
            type: 'geojson',
            data: {
              type: 'FeatureCollection',
              features: WAREHOUSE_CITIES.map((c) => ({
                type: 'Feature',
                properties: { name: c.name },
                geometry: { type: 'Point', coordinates: c.coords },
              })),
            },
          });

          // ── ARC LAYERS (per-arc for line-gradient) ──
          allArcs.forEach((_, i) => {
            // Soft glow under arc
            map.addLayer({
              id: `arc-glow-${i}`,
              type: 'line',
              source: `arc-${i}`,
              slot: 'top',
              layout: { 'line-cap': 'round', 'line-join': 'round' },
              paint: {
                'line-width': isMobile ? 6 : 10,
                'line-opacity': skipAll ? 0.06 : 0,
                'line-blur': isMobile ? 4 : 8,
                'line-emissive-strength': 1,
                'line-gradient': [
                  'interpolate',
                  ['linear'],
                  ['line-progress'],
                  0, 'rgba(139, 92, 246, 0)',
                  0.1, 'rgba(139, 92, 246, 0.15)',
                  0.5, 'rgba(59, 130, 246, 0.2)',
                  0.9, 'rgba(96, 165, 250, 0.15)',
                  1, 'rgba(96, 165, 250, 0)',
                ],
                'line-opacity-transition': { duration: 800, delay: 0 },
              },
            });

            // Bright core with gradient
            map.addLayer({
              id: `arc-core-${i}`,
              type: 'line',
              source: `arc-${i}`,
              slot: 'top',
              layout: { 'line-cap': 'round', 'line-join': 'round' },
              paint: {
                'line-width': isMobile ? 1.5 : 2.5,
                'line-opacity': skipAll ? 0.7 : 0,
                'line-emissive-strength': 1,
                'line-gradient': [
                  'interpolate',
                  ['linear'],
                  ['line-progress'],
                  0, 'rgba(167, 139, 250, 0.1)',
                  0.15, 'rgba(139, 92, 246, 0.8)',
                  0.4, 'rgba(96, 165, 250, 0.9)',
                  0.7, 'rgba(59, 130, 246, 1)',
                  0.9, 'rgba(147, 197, 253, 0.8)',
                  1, 'rgba(147, 197, 253, 0.3)',
                ],
                'line-opacity-transition': { duration: 600, delay: 0 },
              },
            });
          });

          // ── DESTINATION GLOW LAYERS (firefly stack) ──
          map.addLayer({
            id: 'dest-glow-outer',
            type: 'circle',
            source: 'destinations',
            slot: 'top',
            paint: {
              'circle-radius': isMobile ? 16 : 24,
              'circle-color': '#3B82F6',
              'circle-blur': 1,
              'circle-opacity': skipAll ? 0.08 : 0,
              'circle-emissive-strength': 1,
              'circle-opacity-transition': { duration: 1000, delay: 0 },
            },
          });

          map.addLayer({
            id: 'dest-glow-mid',
            type: 'circle',
            source: 'destinations',
            slot: 'top',
            paint: {
              'circle-radius': isMobile ? 8 : 12,
              'circle-color': '#60A5FA',
              'circle-blur': 0.8,
              'circle-opacity': skipAll ? 0.2 : 0,
              'circle-emissive-strength': 1,
              'circle-opacity-transition': { duration: 1000, delay: 0 },
            },
          });

          map.addLayer({
            id: 'dest-glow-inner',
            type: 'circle',
            source: 'destinations',
            slot: 'top',
            paint: {
              'circle-radius': isMobile ? 4 : 5,
              'circle-color': '#93C5FD',
              'circle-blur': 0.4,
              'circle-opacity': skipAll ? 0.6 : 0,
              'circle-emissive-strength': 1,
              'circle-opacity-transition': { duration: 1000, delay: 0 },
            },
          });

          map.addLayer({
            id: 'dest-core',
            type: 'circle',
            source: 'destinations',
            slot: 'top',
            paint: {
              'circle-radius': isMobile ? 2 : 2.5,
              'circle-color': '#ffffff',
              'circle-blur': 0,
              'circle-opacity': skipAll ? 1 : 0,
              'circle-emissive-strength': 1,
              'circle-opacity-transition': { duration: 800, delay: 0 },
            },
          });

          // ── CITY LABELS ──
          map.addLayer({
            id: 'city-labels',
            type: 'symbol',
            source: 'destinations',
            slot: 'top',
            layout: {
              'text-field': ['get', 'name'],
              'text-font': ['DIN Pro Medium', 'Arial Unicode MS Regular'],
              'text-size': isMobile ? 10 : 11,
              'text-anchor': 'left',
              'text-offset': [1.2, 0],
              'text-allow-overlap': false,
              'text-letter-spacing': 0.05,
            },
            paint: {
              'text-color': '#ffffff',
              'text-halo-color': 'rgba(0, 0, 0, 0.85)',
              'text-halo-width': 1.5,
              'text-halo-blur': 0.5,
              'text-opacity': skipAll ? 0.8 : 0,
              'text-emissive-strength': 1,
              'text-opacity-transition': { duration: 1000, delay: 0 },
            },
          });

          // ── ORIGIN PULSING BEACON ──
          const dotSize = 200;
          map.addImage(
            'origin-pulse',
            createPulsingDot(map, dotSize, [139, 92, 246], 0),
            { pixelRatio: 2 },
          );
          map.addImage(
            'origin-pulse-2',
            createPulsingDot(map, dotSize, [139, 92, 246], 700),
            { pixelRatio: 2 },
          );

          map.addLayer({
            id: 'origin-beacon',
            type: 'symbol',
            source: 'origin',
            slot: 'top',
            layout: {
              'icon-image': 'origin-pulse',
              'icon-size': isMobile ? 0.4 : 0.55,
              'icon-allow-overlap': true,
            },
            paint: {
              'icon-opacity': skipAll ? 1 : 0,
              'icon-opacity-transition': { duration: 1200, delay: 0 },
            },
          });

          // Second pulse ring (staggered phase)
          map.addLayer({
            id: 'origin-beacon-2',
            type: 'symbol',
            source: 'origin',
            slot: 'top',
            layout: {
              'icon-image': 'origin-pulse-2',
              'icon-size': isMobile ? 0.55 : 0.75,
              'icon-allow-overlap': true,
            },
            paint: {
              'icon-opacity': skipAll ? 0.5 : 0,
              'icon-opacity-transition': { duration: 1200, delay: 0 },
            },
          });

          // ── ORIGIN LABEL ──
          map.addSource('origin-label', {
            type: 'geojson',
            data: {
              type: 'FeatureCollection',
              features: [
                {
                  type: 'Feature',
                  properties: { name: 'HQ' },
                  geometry: { type: 'Point', coordinates: HUMBLE_TX },
                },
              ],
            },
          });

          map.addLayer({
            id: 'origin-label-text',
            type: 'symbol',
            source: 'origin-label',
            slot: 'top',
            layout: {
              'text-field': 'HQ',
              'text-font': ['DIN Pro Bold', 'Arial Unicode MS Bold'],
              'text-size': isMobile ? 9 : 10,
              'text-anchor': 'left',
              'text-offset': [1.8, 0],
              'text-letter-spacing': 0.15,
              'text-allow-overlap': true,
            },
            paint: {
              'text-color': '#A78BFA',
              'text-halo-color': 'rgba(0, 0, 0, 0.9)',
              'text-halo-width': 2,
              'text-opacity': skipAll ? 0.9 : 0,
              'text-emissive-strength': 1,
              'text-opacity-transition': { duration: 1000, delay: 0 },
            },
          });

          /* ──────────────────────────────────────
             PROGRESSIVE ARC REVEAL ANIMATION
             Arcs draw outward from origin, staggered
             ────────────────────────────────────── */
          function revealArcs() {
            const staggerDelay = 150;
            const drawDuration = 1200;
            const framesPerArc = 40;

            allArcs.forEach((arc, i) => {
              const timer = setTimeout(() => {
                // Show the glow + core layers
                map.setPaintProperty(`arc-glow-${i}`, 'line-opacity', 0.06);
                map.setPaintProperty(`arc-core-${i}`, 'line-opacity', 0.75);

                // Progressive coordinate reveal
                let frame = 0;
                const interval = drawDuration / framesPerArc;

                function drawFrame() {
                  frame++;
                  const progress = Math.min(frame / framesPerArc, 1);
                  const eased = 1 - Math.pow(1 - progress, 2); // ease-out
                  const coordCount = Math.max(
                    2,
                    Math.round(eased * arc.points.length),
                  );
                  const coords = arc.points.slice(0, coordCount);

                  const source = map.getSource(`arc-${i}`);
                  if (source) {
                    source.setData({
                      type: 'Feature',
                      properties: { name: arc.city.name },
                      geometry: { type: 'LineString', coordinates: coords },
                    });
                  }

                  if (frame >= framesPerArc) {
                    setArcsRevealed((prev) => prev + 1);
                  } else {
                    const raf = requestAnimationFrame(() => {
                      const t = setTimeout(drawFrame, interval);
                      timeoutRefs.current.push(t);
                    });
                    animFrameRefs.current.push(raf);
                  }
                }

                drawFrame();
              }, i * staggerDelay);
              timeoutRefs.current.push(timer);
            });

            // Fade in destination glows + labels after arcs start
            const glowTimer = setTimeout(() => {
              map.setPaintProperty('dest-glow-outer', 'circle-opacity', 0.08);
              map.setPaintProperty('dest-glow-mid', 'circle-opacity', 0.2);
              map.setPaintProperty('dest-glow-inner', 'circle-opacity', 0.6);
              map.setPaintProperty('dest-core', 'circle-opacity', 1);
            }, 400);
            timeoutRefs.current.push(glowTimer);

            const labelTimer = setTimeout(() => {
              map.setPaintProperty('city-labels', 'text-opacity', 0.8);
              map.setPaintProperty('origin-label-text', 'text-opacity', 0.9);
            }, 1000);
            timeoutRefs.current.push(labelTimer);
          }

          /* ──────────────────────────────────────
             SLOW ORBIT
             ────────────────────────────────────── */
          function startOrbit() {
            let bearing = landing.bearing;
            function orbit() {
              bearing += 0.012;
              if (mapRef.current) mapRef.current.setBearing(bearing);
              const raf = requestAnimationFrame(orbit);
              animFrameRefs.current.push(raf);
            }
            const raf = requestAnimationFrame(orbit);
            animFrameRefs.current.push(raf);
          }

          /* ──────────────────────────────────────
             ANIMATION SEQUENCE
             ────────────────────────────────────── */
          if (!prefersReducedMotion && containerRef.current) {
            let triggered = false;

            // Globe auto-spin before flythrough
            let spinBearing = 30;
            function spinGlobe() {
              if (triggered) return;
              spinBearing -= 0.08;
              if (mapRef.current) mapRef.current.setBearing(spinBearing);
              const raf = requestAnimationFrame(spinGlobe);
              animFrameRefs.current.push(raf);
            }
            const spinRaf = requestAnimationFrame(spinGlobe);
            animFrameRefs.current.push(spinRaf);

            observerRef.current = new IntersectionObserver(
              (entries) => {
                if (entries[0].isIntersecting && !triggered) {
                  triggered = true;
                  observerRef.current?.disconnect();

                  const holdTimer = setTimeout(() => {
                    setPhase('flying');

                    map.flyTo({
                      center: landing.center,
                      zoom: landing.zoom,
                      pitch: landing.pitch,
                      bearing: landing.bearing,
                      duration: 4500,
                      curve: 1.6,
                      essential: true,
                    });

                    map.once('moveend', () => {
                      setPhase('network');

                      // Show origin beacon
                      map.setPaintProperty('origin-beacon', 'icon-opacity', 1);
                      map.setPaintProperty('origin-beacon-2', 'icon-opacity', 0.5);

                      // Start arc reveal
                      const arcTimer = setTimeout(() => {
                        revealArcs();
                      }, 400);
                      timeoutRefs.current.push(arcTimer);

                      // Transition to landed (HUD appears)
                      const landTimer = setTimeout(() => {
                        setPhase('landed');
                        startOrbit();
                      }, 2200);
                      timeoutRefs.current.push(landTimer);
                    });
                  }, 800);
                  timeoutRefs.current.push(holdTimer);
                }
              },
              { threshold: 0.25 },
            );

            observerRef.current.observe(containerRef.current);
          } else {
            // Reduced motion: everything visible immediately
            map.setPaintProperty('origin-beacon', 'icon-opacity', 1);
            map.setPaintProperty('origin-beacon-2', 'icon-opacity', 0.5);
            map.setPaintProperty('dest-glow-outer', 'circle-opacity', 0.08);
            map.setPaintProperty('dest-glow-mid', 'circle-opacity', 0.2);
            map.setPaintProperty('dest-glow-inner', 'circle-opacity', 0.6);
            map.setPaintProperty('dest-core', 'circle-opacity', 1);
            map.setPaintProperty('city-labels', 'text-opacity', 0.8);
            map.setPaintProperty('origin-label-text', 'text-opacity', 0.9);
            allArcs.forEach((_, i) => {
              map.setPaintProperty(`arc-glow-${i}`, 'line-opacity', 0.06);
              map.setPaintProperty(`arc-core-${i}`, 'line-opacity', 0.75);
            });
            setPhase('landed');
          }
        });
      })
      .catch(() => setError(true));

    // ── CLEANUP ──
    return () => {
      observerRef.current?.disconnect();
      timeoutRefs.current.forEach(clearTimeout);
      animFrameRefs.current.forEach(cancelAnimationFrame);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return (
    <div ref={containerRef} className="w-full relative" id="lumina-map">
      {/* Ambient glow behind the map container */}
      <div
        className="absolute inset-0 -m-6 md:-m-12 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(139, 92, 246, 0.07) 0%, rgba(59, 130, 246, 0.04) 40%, transparent 70%)',
        }}
      />

      <div
        className="relative overflow-hidden rounded-xl md:rounded-2xl"
        style={{
          border: '1px solid rgba(59, 130, 246, 0.2)',
          background: '#030308',
          boxShadow:
            '0 0 60px rgba(59, 130, 246, 0.1), 0 0 120px rgba(139, 92, 246, 0.05), inset 0 0 60px rgba(0,0,0,0.5)',
        }}
      >
        {/* Map canvas */}
        <div ref={mapContainer} className="w-full h-[350px] md:h-[480px]" />

        {/* Loading state */}
        {!loaded && !error && (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ background: '#030308' }}
          >
            <div className="flex flex-col items-center gap-3">
              <div className="hud-spinner" />
              <span className="text-xs tracking-widest uppercase" style={{ color: '#4B5563' }}>
                Initializing
              </span>
            </div>
          </div>
        )}

        {/* Error fallback */}
        {error && (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ background: '#030308' }}
          >
            <div className="text-center px-6">
              <div
                className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center"
                style={{ background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.2)' }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#8B5CF6"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <p className="text-sm font-semibold" style={{ color: '#E8E8ED' }}>
                Humble, TX
              </p>
              <p className="text-xs mt-1" style={{ color: '#6B6B7B' }}>
                Serving distributors nationwide
              </p>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════
            HUD OVERLAY — Mission Control Panel
            ═══════════════════════════════════════ */}
        <AnimatePresence>
          {phase === 'landed' && loaded && (
            <motion.div
              key="hud-overlay"
              className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <motion.div
                className="hud-panel relative"
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* Corner brackets */}
                <div className="hud-corner hud-corner-tl" />
                <div className="hud-corner hud-corner-tr" />
                <div className="hud-corner hud-corner-bl" />
                <div className="hud-corner hud-corner-br" />

                {/* Scan line */}
                <div className="hud-scanline" />

                {/* Top accent gradient */}
                <div
                  className="absolute top-0 left-4 right-4 h-[1px]"
                  style={{
                    background:
                      'linear-gradient(90deg, transparent, #8B5CF6, #3B82F6, #8B5CF6, transparent)',
                  }}
                />

                {/* Status indicator */}
                <motion.div
                  className="flex items-center justify-center gap-2 mb-3"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                >
                  <span className="hud-status-dot" />
                  <span
                    className="text-[10px] font-semibold tracking-[0.2em] uppercase"
                    style={{ color: '#10B981', fontFamily: 'var(--font-mono, monospace)' }}
                  >
                    System Online
                  </span>
                </motion.div>

                {/* Brand */}
                <motion.h3
                  className="text-xl md:text-2xl font-bold text-white tracking-tight text-center"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.5 }}
                >
                  LUMINA<span style={{ color: '#3B82F6' }}> ERP</span>
                </motion.h3>

                {/* Coordinates */}
                <motion.p
                  className="text-center mt-2"
                  style={{
                    color: 'rgba(160, 160, 184, 0.7)',
                    fontSize: '10px',
                    fontFamily: 'var(--font-mono, monospace)',
                    letterSpacing: '0.12em',
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.9, duration: 0.5 }}
                >
                  29.9988&deg;N &nbsp; 95.2622&deg;W
                </motion.p>

                {/* Divider */}
                <motion.div
                  className="mx-auto mt-3 mb-3"
                  style={{
                    width: '80%',
                    height: '1px',
                    background:
                      'linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.4), transparent)',
                  }}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 1.0, duration: 0.6 }}
                />

                {/* Connection counter */}
                <motion.div
                  className="text-center"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.1, duration: 0.5 }}
                >
                  <span
                    className="text-xl md:text-2xl font-bold"
                    style={{
                      color: '#60A5FA',
                      fontFamily: 'var(--font-mono, monospace)',
                    }}
                  >
                    {connectionCount}
                  </span>
                  <span
                    className="text-xs ml-2 tracking-[0.15em] uppercase"
                    style={{ color: 'rgba(255, 255, 255, 0.4)' }}
                  >
                    Active Nodes
                  </span>
                </motion.div>

                {/* Tagline */}
                <motion.p
                  className="text-center mt-2"
                  style={{
                    color: 'rgba(255, 255, 255, 0.3)',
                    fontSize: '9px',
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.3, duration: 0.5 }}
                >
                  Nationwide Distribution Network
                </motion.p>

                {/* Bottom accent */}
                <div
                  className="absolute bottom-0 left-4 right-4 h-[1px]"
                  style={{
                    background:
                      'linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.3), transparent)',
                  }}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom status bar — globe/flying phases */}
        <AnimatePresence>
          {loaded && (phase === 'globe' || phase === 'flying') && (
            <motion.div
              className="absolute bottom-0 left-0 right-0 pointer-events-none p-3 md:p-4 z-10"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.5 }}
            >
              <div
                className="flex items-center justify-between px-4 py-2.5 rounded-lg"
                style={{
                  background: 'rgba(3, 3, 8, 0.7)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  border: '1px solid rgba(59, 130, 246, 0.12)',
                }}
              >
                <div className="flex items-center gap-2">
                  <span className="hud-status-dot" />
                  <span
                    className="text-xs tracking-wide"
                    style={{
                      color: '#6B7280',
                      fontFamily: 'var(--font-mono, monospace)',
                    }}
                  >
                    {phase === 'globe' ? 'Locating network...' : 'Connecting to HQ...'}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Network phase status */}
        <AnimatePresence>
          {loaded && phase === 'network' && (
            <motion.div
              className="absolute bottom-0 left-0 right-0 pointer-events-none p-3 md:p-4 z-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div
                className="flex items-center justify-between px-4 py-2.5 rounded-lg"
                style={{
                  background: 'rgba(3, 3, 8, 0.7)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  border: '1px solid rgba(59, 130, 246, 0.12)',
                }}
              >
                <div className="flex items-center gap-2">
                  <span className="hud-status-dot" />
                  <span
                    className="text-xs tracking-wide"
                    style={{
                      color: '#6B7280',
                      fontFamily: 'var(--font-mono, monospace)',
                    }}
                  >
                    Mapping {arcsRevealed}/{WAREHOUSE_CITIES.length} nodes...
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Attribution */}
      <p className="text-[10px] mt-1.5 text-right" style={{ color: '#6B6B7B', opacity: 0.4 }}>
        Map &copy; Mapbox &copy; OpenStreetMap
      </p>

      {/* ── EMBEDDED STYLES ── */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
/* HUD Panel */
.hud-panel {
  padding: 20px 28px;
  background: rgba(3, 3, 10, 0.82);
  backdrop-filter: blur(28px);
  -webkit-backdrop-filter: blur(28px);
  border: 1px solid rgba(59, 130, 246, 0.12);
  border-radius: 8px;
  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.7),
    0 0 80px rgba(59, 130, 246, 0.06),
    0 0 120px rgba(139, 92, 246, 0.04),
    inset 0 1px 0 rgba(255, 255, 255, 0.03);
  min-width: 220px;
  overflow: hidden;
}

@media (min-width: 768px) {
  .hud-panel {
    padding: 24px 36px;
    min-width: 260px;
  }
}

/* Corner brackets */
.hud-corner {
  position: absolute;
  width: 14px;
  height: 14px;
  pointer-events: none;
}
.hud-corner-tl {
  top: -1px; left: -1px;
  border-top: 2px solid rgba(59, 130, 246, 0.5);
  border-left: 2px solid rgba(59, 130, 246, 0.5);
}
.hud-corner-tr {
  top: -1px; right: -1px;
  border-top: 2px solid rgba(59, 130, 246, 0.5);
  border-right: 2px solid rgba(59, 130, 246, 0.5);
}
.hud-corner-bl {
  bottom: -1px; left: -1px;
  border-bottom: 2px solid rgba(139, 92, 246, 0.5);
  border-left: 2px solid rgba(139, 92, 246, 0.5);
}
.hud-corner-br {
  bottom: -1px; right: -1px;
  border-bottom: 2px solid rgba(139, 92, 246, 0.5);
  border-right: 2px solid rgba(139, 92, 246, 0.5);
}

/* Scan line */
.hud-scanline {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, rgba(59, 130, 246, 0.15) 20%, rgba(59, 130, 246, 0.3) 50%, rgba(59, 130, 246, 0.15) 80%, transparent 100%);
  opacity: 0;
  pointer-events: none;
}

/* Status dot — pulsing */
.hud-status-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #10B981;
  box-shadow: 0 0 6px rgba(16, 185, 129, 0.6), 0 0 12px rgba(16, 185, 129, 0.3);
  flex-shrink: 0;
}

/* Spinner */
.hud-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(59, 130, 246, 0.15);
  border-top-color: #3B82F6;
  border-radius: 50%;
}

/* Hide Mapbox attribution */
.mapboxgl-ctrl-attrib { display: none !important; }

@media (prefers-reduced-motion: no-preference) {
  .hud-scanline {
    animation: hud-scan 4s ease-in-out infinite;
  }

  @keyframes hud-scan {
    0% { top: 0; opacity: 0; }
    5% { opacity: 0.8; }
    95% { opacity: 0.8; }
    100% { top: 100%; opacity: 0; }
  }

  .hud-status-dot {
    animation: status-pulse 2s ease-in-out infinite;
  }

  @keyframes status-pulse {
    0%, 100% { opacity: 0.7; box-shadow: 0 0 4px rgba(16, 185, 129, 0.3); }
    50% { opacity: 1; box-shadow: 0 0 8px rgba(16, 185, 129, 0.7), 0 0 16px rgba(16, 185, 129, 0.3); }
  }

  .hud-spinner {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .hud-corner {
    animation: corner-glow 3s ease-in-out infinite alternate;
  }

  @keyframes corner-glow {
    0% { opacity: 0.5; }
    100% { opacity: 1; }
  }
}

@media (prefers-reduced-motion: reduce) {
  .hud-scanline { display: none; }
  .hud-status-dot { animation: none; }
  .hud-spinner { animation: none; }
  .hud-corner { animation: none; }
}
`,
        }}
      />
    </div>
  );
}
