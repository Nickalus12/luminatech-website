import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { trackMapInteraction } from '../../lib/analytics';

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

/* ═════════════════════════════════════════════
   MAP SECTION COMPONENT
   ═════════════════════════════════════════════ */
interface MapSectionProps {
  onReset?: () => void;
}

export default function MapSection({ onReset }: MapSectionProps) {
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
             ARC TIP (LEADING EDGE) — sources + layers
             ────────────────────────────────────── */
          map.addSource('arc-tips', {
            type: 'geojson',
            data: { type: 'FeatureCollection', features: [] },
          });

          map.addLayer({
            id: 'arc-tip-glow',
            type: 'circle',
            source: 'arc-tips',
            slot: 'top',
            paint: {
              'circle-radius': isMobile ? 14 : 20,
              'circle-color': '#93C5FD',
              'circle-blur': 1,
              'circle-opacity': 0.5,
              'circle-emissive-strength': 1,
            },
          });

          map.addLayer({
            id: 'arc-tip-core',
            type: 'circle',
            source: 'arc-tips',
            slot: 'top',
            paint: {
              'circle-radius': isMobile ? 3 : 4,
              'circle-color': '#ffffff',
              'circle-blur': 0.2,
              'circle-opacity': 0.95,
              'circle-emissive-strength': 1,
            },
          });

          /* ──────────────────────────────────────
             BURST FLASH — source + layer
             ────────────────────────────────────── */
          map.addSource('burst-points', {
            type: 'geojson',
            data: { type: 'FeatureCollection', features: [] },
          });

          map.addLayer({
            id: 'burst-flash',
            type: 'circle',
            source: 'burst-points',
            slot: 'top',
            paint: {
              'circle-radius': isMobile ? 35 : 50,
              'circle-color': '#60A5FA',
              'circle-blur': 1,
              'circle-opacity': 0.6,
              'circle-emissive-strength': 1,
              'circle-opacity-transition': { duration: 500, delay: 0 },
              'circle-radius-transition': { duration: 500, delay: 0 },
            },
          });

          /* ──────────────────────────────────────
             PARTICLE DOT — canvas animated image
             ────────────────────────────────────── */
          const particleSize = 64;
          map.addImage(
            'particle-dot',
            {
              width: particleSize,
              height: particleSize,
              data: new Uint8Array(particleSize * particleSize * 4),
              context: null as CanvasRenderingContext2D | null,
              onAdd() {
                const canvas = document.createElement('canvas');
                canvas.width = particleSize;
                canvas.height = particleSize;
                this.context = canvas.getContext('2d');
              },
              render() {
                if (!this.context) return false;
                const ctx = this.context;
                const cx = particleSize / 2;
                const t = (performance.now() % 1500) / 1500;
                ctx.clearRect(0, 0, particleSize, particleSize);
                const grad = ctx.createRadialGradient(cx, cx, 0, cx, cx, cx);
                grad.addColorStop(0, `rgba(255, 255, 255, ${0.8 + 0.2 * Math.sin(t * Math.PI * 2)})`);
                grad.addColorStop(0.15, 'rgba(147, 197, 253, 0.7)');
                grad.addColorStop(0.4, 'rgba(59, 130, 246, 0.25)');
                grad.addColorStop(1, 'rgba(59, 130, 246, 0)');
                ctx.beginPath();
                ctx.arc(cx, cx, cx, 0, Math.PI * 2);
                ctx.fillStyle = grad;
                ctx.fill();
                this.data = ctx.getImageData(0, 0, particleSize, particleSize).data;
                map.triggerRepaint();
                return true;
              },
            },
            { pixelRatio: 2 },
          );

          map.addSource('particles', {
            type: 'geojson',
            data: { type: 'FeatureCollection', features: [] },
          });

          map.addLayer({
            id: 'particles-layer',
            type: 'symbol',
            source: 'particles',
            slot: 'top',
            layout: {
              'icon-image': 'particle-dot',
              'icon-size': isMobile ? 0.15 : 0.22,
              'icon-allow-overlap': true,
              'icon-ignore-placement': true,
            },
            paint: {
              'icon-opacity': 0.85,
              'icon-emissive-strength': 1,
            },
          });

          /* ──────────────────────────────────────
             PROGRESSIVE ARC REVEAL ANIMATION
             Timestamp-based RAF for smooth, predictable timing
             ────────────────────────────────────── */
          function revealArcs() {
            const staggerDelay = 120;
            const drawDuration = 900;
            const startTime = performance.now();
            const completedArcs = new Set<number>();
            let labelsShown = false;
            let glowsShown = false;

            function animateArcs() {
              const now = performance.now();
              const tipFeatures: any[] = [];

              allArcs.forEach((arc, i) => {
                const arcStart = startTime + i * staggerDelay;
                const elapsed = now - arcStart;

                if (elapsed < 0) return; // Not started yet
                if (completedArcs.has(i)) return; // Already done

                const progress = Math.min(elapsed / drawDuration, 1);
                const eased = 1 - Math.pow(1 - progress, 3); // cubic ease-out
                const coordCount = Math.max(2, Math.round(eased * arc.points.length));
                const coords = arc.points.slice(0, coordCount);

                // Update arc geometry
                const source = map.getSource(`arc-${i}`) as any;
                if (source) {
                  source.setData({
                    type: 'Feature',
                    properties: { name: arc.city.name },
                    geometry: { type: 'LineString', coordinates: coords },
                  });
                }

                // Show arc layers on first animation frame
                if (elapsed < 50) {
                  map.setPaintProperty(`arc-glow-${i}`, 'line-opacity', 0.08);
                  map.setPaintProperty(`arc-core-${i}`, 'line-opacity', 0.8);
                }

                // Leading edge tip dot
                const tipCoord = coords[coords.length - 1];
                tipFeatures.push({
                  type: 'Feature' as const,
                  properties: {},
                  geometry: { type: 'Point' as const, coordinates: tipCoord },
                });

                // Arc completed
                if (progress >= 1) {
                  completedArcs.add(i);
                  setArcsRevealed((prev) => prev + 1);

                  // Destination burst flash
                  const burstSource = map.getSource('burst-points') as any;
                  if (burstSource) {
                    burstSource.setData({
                      type: 'FeatureCollection',
                      features: [{
                        type: 'Feature',
                        properties: {},
                        geometry: { type: 'Point', coordinates: arc.city.coords },
                      }],
                    });
                    // Fade out burst after brief flash
                    const burstTimer = setTimeout(() => {
                      map.setPaintProperty('burst-flash', 'circle-opacity', 0);
                      const clearTimer = setTimeout(() => {
                        const bs = map.getSource('burst-points') as any;
                        if (bs) bs.setData({ type: 'FeatureCollection', features: [] });
                        map.setPaintProperty('burst-flash', 'circle-opacity', 0.6);
                      }, 600);
                      timeoutRefs.current.push(clearTimer);
                    }, 120);
                    timeoutRefs.current.push(burstTimer);
                  }
                }
              });

              // Update leading edge tips
              const tipsSource = map.getSource('arc-tips') as any;
              if (tipsSource) {
                tipsSource.setData({ type: 'FeatureCollection', features: tipFeatures });
              }

              // Show destination glows after 300ms
              if (!glowsShown && now - startTime > 300) {
                glowsShown = true;
                map.setPaintProperty('dest-glow-outer', 'circle-opacity', 0.08);
                map.setPaintProperty('dest-glow-mid', 'circle-opacity', 0.2);
                map.setPaintProperty('dest-glow-inner', 'circle-opacity', 0.6);
                map.setPaintProperty('dest-core', 'circle-opacity', 1);
              }

              // Show labels after 800ms
              if (!labelsShown && now - startTime > 800) {
                labelsShown = true;
                map.setPaintProperty('city-labels', 'text-opacity', 0.8);
                map.setPaintProperty('origin-label-text', 'text-opacity', 0.9);
              }

              // Continue or finish
              if (completedArcs.size < allArcs.length) {
                const raf = requestAnimationFrame(animateArcs);
                animFrameRefs.current.push(raf);
              } else {
                // All arcs done — clear tips, start particles + pulsing glow
                if (tipsSource) {
                  tipsSource.setData({ type: 'FeatureCollection', features: [] });
                }
                startParticles(allArcs);
                startPulsingGlow(allArcs.length);
              }
            }

            const raf = requestAnimationFrame(animateArcs);
            animFrameRefs.current.push(raf);
          }

          /* ──────────────────────────────────────
             TRAVELING PARTICLES — continuous flow
             ────────────────────────────────────── */
          function startParticles(arcs: typeof allArcs) {
            // 2 particles per arc, different phase offsets
            const particleConfigs = arcs.flatMap((arc, i) => [
              { arcIndex: i, points: arc.points, phase: 0 },
              { arcIndex: i, points: arc.points, phase: 0.5 },
            ]);

            function animateParticles() {
              const now = performance.now();
              const features = particleConfigs.map((cfg) => {
                const cycleDuration = 3000 + cfg.arcIndex * 200; // slight variation
                const t = ((now / cycleDuration + cfg.phase) % 1);
                const idx = Math.floor(t * (cfg.points.length - 1));
                const coord = cfg.points[Math.min(idx, cfg.points.length - 1)];
                return {
                  type: 'Feature' as const,
                  properties: {},
                  geometry: { type: 'Point' as const, coordinates: coord },
                };
              });

              const source = map.getSource('particles') as any;
              if (source) {
                source.setData({ type: 'FeatureCollection', features });
              }

              const raf = requestAnimationFrame(animateParticles);
              animFrameRefs.current.push(raf);
            }

            const raf = requestAnimationFrame(animateParticles);
            animFrameRefs.current.push(raf);
          }

          /* ──────────────────────────────────────
             PULSING GLOW — oscillate arc glow opacity
             ────────────────────────────────────── */
          function startPulsingGlow(arcCount: number) {
            function pulseGlow() {
              const t = (performance.now() % 3000) / 3000;
              const opacity = 0.04 + 0.05 * Math.sin(t * Math.PI * 2);
              for (let i = 0; i < arcCount; i++) {
                map.setPaintProperty(`arc-glow-${i}`, 'line-opacity', opacity);
              }
              const raf = requestAnimationFrame(pulseGlow);
              animFrameRefs.current.push(raf);
            }
            const raf = requestAnimationFrame(pulseGlow);
            animFrameRefs.current.push(raf);
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
                    trackMapInteraction('flythrough_started');

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
                      // Delay long enough for all arcs to draw + counter to count up
                      // Arc reveal: 120ms stagger * 9 + 900ms draw = ~2000ms, starts at 400ms
                      const landTimer = setTimeout(() => {
                        setPhase('landed');
                        trackMapInteraction('landed');
                        startOrbit();
                      }, 3200);
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
            setArcsRevealed(WAREHOUSE_CITIES.length);
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
    <div ref={containerRef} className="w-full relative overflow-hidden" id="lumina-map">
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
            HUD OVERLAY — Glass Panel
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
                {/* Corner accents */}
                <div className="hud-corner hud-corner-tl" />
                <div className="hud-corner hud-corner-tr" />
                <div className="hud-corner hud-corner-bl" />
                <div className="hud-corner hud-corner-br" />

                {/* Gradient sweep (replaces scan line) */}
                <div className="hud-sweep" />

                {/* Top accent gradient */}
                <div
                  className="absolute top-0 left-6 right-6 h-[1px]"
                  style={{
                    background:
                      'linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.6), rgba(59, 130, 246, 0.6), rgba(139, 92, 246, 0.6), transparent)',
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
                    className="text-[11px] sm:text-[10px] font-semibold tracking-[0.2em] uppercase"
                    style={{ color: '#10B981', fontFamily: 'var(--font-mono, monospace)' }}
                  >
                    Humble, TX
                  </span>
                </motion.div>

                {/* Brand */}
                <motion.h3
                  className="text-xl md:text-2xl font-bold tracking-tight text-center"
                  style={{ color: '#E8E8ED' }}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.5 }}
                >
                  LUMINA<span style={{ color: '#3B82F6' }}> ERP</span>
                </motion.h3>

                {/* Coordinates */}
                <motion.p
                  className="text-center mt-2 hidden sm:block"
                  style={{
                    color: '#6B6B7B',
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
                      'linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.4), rgba(139, 92, 246, 0.3), rgba(59, 130, 246, 0.4), transparent)',
                  }}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 1.0, duration: 0.6 }}
                />

                {/* Tagline */}
                <motion.p
                  className="text-center mt-2"
                  style={{
                    color: '#A0A0B0',
                    fontSize: '11px',
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.3, duration: 0.5 }}
                >
                  Nationwide Distribution Network
                </motion.p>

                {/* Submit Another Inquiry button */}
                {onReset && (
                  <motion.button
                    onClick={onReset}
                    className="hud-reset-btn pointer-events-auto mt-4 mx-auto flex items-center gap-2 px-4 py-2 rounded-lg text-sm cursor-pointer"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.5, duration: 0.5 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m12 19-7-7 7-7" />
                      <path d="M19 12H5" />
                    </svg>
                    Send Another Message
                  </motion.button>
                )}

                {/* Bottom accent */}
                <div
                  className="absolute bottom-0 left-6 right-6 h-[1px]"
                  style={{
                    background:
                      'linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.3), rgba(139, 92, 246, 0.2), rgba(59, 130, 246, 0.3), transparent)',
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
                    {phase === 'globe' ? 'Exploring our reach...' : 'Heading to headquarters...'}
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
                    Connecting {arcsRevealed} of {WAREHOUSE_CITIES.length} regions...
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
/* HUD Panel — Glass morphism */
.hud-panel {
  padding: 24px 32px;
  background: rgba(15, 15, 30, 0.75);
  backdrop-filter: blur(32px) saturate(1.4);
  -webkit-backdrop-filter: blur(32px) saturate(1.4);
  border: 1px solid rgba(59, 130, 246, 0.18);
  border-radius: 12px;
  box-shadow:
    0 16px 48px rgba(0, 0, 0, 0.5),
    0 0 40px rgba(59, 130, 246, 0.08),
    0 0 80px rgba(139, 92, 246, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.05),
    inset 0 -1px 0 rgba(255, 255, 255, 0.02);
  min-width: 220px;
  overflow: hidden;
}

@media (min-width: 768px) {
  .hud-panel {
    padding: 28px 40px;
    min-width: 280px;
  }
}

/* Corner accents — thin, glowing */
.hud-corner {
  position: absolute;
  width: 16px;
  height: 16px;
  pointer-events: none;
}
.hud-corner-tl {
  top: -1px; left: -1px;
  border-top: 1px solid rgba(59, 130, 246, 0.5);
  border-left: 1px solid rgba(59, 130, 246, 0.5);
  border-radius: 2px 0 0 0;
  box-shadow: -2px -2px 8px rgba(59, 130, 246, 0.15);
}
.hud-corner-tr {
  top: -1px; right: -1px;
  border-top: 1px solid rgba(59, 130, 246, 0.5);
  border-right: 1px solid rgba(59, 130, 246, 0.5);
  border-radius: 0 2px 0 0;
  box-shadow: 2px -2px 8px rgba(59, 130, 246, 0.15);
}
.hud-corner-bl {
  bottom: -1px; left: -1px;
  border-bottom: 1px solid rgba(139, 92, 246, 0.5);
  border-left: 1px solid rgba(139, 92, 246, 0.5);
  border-radius: 0 0 0 2px;
  box-shadow: -2px 2px 8px rgba(139, 92, 246, 0.15);
}
.hud-corner-br {
  bottom: -1px; right: -1px;
  border-bottom: 1px solid rgba(139, 92, 246, 0.5);
  border-right: 1px solid rgba(139, 92, 246, 0.5);
  border-radius: 0 0 2px 0;
  box-shadow: 2px 2px 8px rgba(139, 92, 246, 0.15);
}

/* Gradient sweep (soft replacement for scan line) */
.hud-sweep {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(180deg,
    rgba(59, 130, 246, 0.04) 0%,
    transparent 20%,
    transparent 80%,
    rgba(139, 92, 246, 0.03) 100%
  );
  pointer-events: none;
}

/* Reset button */
.hud-reset-btn {
  background: rgba(59, 130, 246, 0.08);
  border: 1px solid rgba(59, 130, 246, 0.25);
  color: #A0A0B0;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
.hud-reset-btn:hover {
  color: #E8E8ED;
  background: rgba(59, 130, 246, 0.15);
  border-color: rgba(59, 130, 246, 0.4);
  box-shadow: 0 0 16px rgba(59, 130, 246, 0.15);
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
  .hud-sweep {
    animation: hud-sweep-pulse 6s ease-in-out infinite;
  }

  @keyframes hud-sweep-pulse {
    0%, 100% { opacity: 0.6; }
    50% { opacity: 1; }
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
    animation: corner-glow 4s ease-in-out infinite alternate;
  }

  @keyframes corner-glow {
    0% { opacity: 0.6; }
    100% { opacity: 1; }
  }
}

@media (prefers-reduced-motion: reduce) {
  .hud-sweep { animation: none; }
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
