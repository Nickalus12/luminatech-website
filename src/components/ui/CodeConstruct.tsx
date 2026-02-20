import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import * as THREE from 'three';

/* ══════════════════════════════════════════════════════════════
   CODE EDITOR — token types + content
   ══════════════════════════════════════════════════════════════ */

interface Token {
  text: string;
  type?: 'kw' | 'str' | 'bool' | 'br' | 'fn' | 'comment';
}

interface CodeLine {
  num: number;
  indent: number;
  tokens: Token[];
}

const LINES: CodeLine[] = [
  {
    num: 1,
    indent: 0,
    tokens: [
      { text: 'import', type: 'kw' },
      { text: ' { transform } ' },
      { text: 'from', type: 'kw' },
      { text: ' ' },
      { text: '"@lumina/core"', type: 'str' },
      { text: ';' },
    ],
  },
  {
    num: 2,
    indent: 0,
    tokens: [
      { text: 'const', type: 'kw' },
      { text: ' engine = ' },
      { text: 'new', type: 'kw' },
      { text: ' ERPEngine();' },
    ],
  },
  { num: 3, indent: 0, tokens: [] },
  {
    num: 4,
    indent: 0,
    tokens: [
      { text: 'const', type: 'kw' },
      { text: ' pipeline = engine.' },
      { text: 'create', type: 'fn' },
      { text: '(', type: 'br' },
      { text: '{', type: 'br' },
    ],
  },
  {
    num: 5,
    indent: 1,
    tokens: [
      { text: 'optimize' },
      { text: ': ' },
      { text: 'true', type: 'bool' },
      { text: ',' },
    ],
  },
  {
    num: 6,
    indent: 1,
    tokens: [
      { text: 'automate' },
      { text: ': ' },
      { text: '"intelligent"', type: 'str' },
      { text: ',' },
    ],
  },
  {
    num: 7,
    indent: 0,
    tokens: [
      { text: '}', type: 'br' },
      { text: ')', type: 'br' },
      { text: ';' },
    ],
  },
  { num: 8, indent: 0, tokens: [] },
  {
    num: 9,
    indent: 0,
    tokens: [
      { text: 'await', type: 'kw' },
      { text: ' pipeline.' },
      { text: 'deploy', type: 'fn' },
      { text: '();' },
    ],
  },
  {
    num: 10,
    indent: 0,
    tokens: [
      { text: '// Building the future, line by line', type: 'comment' },
    ],
  },
];

const TOKEN_COLORS: Record<string, string> = {
  kw: 'text-[#7C8CFF]',
  str: 'text-[#7DCEA0]',
  bool: 'text-[#F0B27A]',
  br: 'text-[#D7BDE2]',
  fn: 'text-[#85C1E9]',
  comment: 'text-white/25 italic',
};

/* ══════════════════════════════════════════════════════════════
   TYPING CONFIG
   ══════════════════════════════════════════════════════════════ */

const CHAR_SPEED = 45;
const LINE_GAP = 200;

/* ══════════════════════════════════════════════════════════════
   3D SCENE — Bricks fall and BUILD "2027"
   ══════════════════════════════════════════════════════════════ */

const GRAVITY = -6.0;
const DUST_PER_LAND = 3;

/* Deterministic pseudo-random (seeded, no Math.random in render) */
function seeded(a: number, b: number): number {
  return ((Math.sin(a * 127.1 + b * 311.7) * 43758.5453) % 1 + 1) % 1;
}

/* ── Pixel font for "2027" (5×7 per digit) ────────────────── */
const DIGIT_FONT: Record<string, number[][]> = {
  '2': [
    [0,1,1,1,0],
    [1,0,0,0,1],
    [0,0,0,0,1],
    [0,0,1,1,0],
    [0,1,0,0,0],
    [1,0,0,0,0],
    [1,1,1,1,1],
  ],
  '0': [
    [0,1,1,1,0],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [0,1,1,1,0],
  ],
  '7': [
    [1,1,1,1,1],
    [0,0,0,0,1],
    [0,0,0,1,0],
    [0,0,1,0,0],
    [0,0,1,0,0],
    [0,1,0,0,0],
    [0,1,0,0,0],
  ],
};

interface BrickTarget {
  x: number;
  y: number;
}

/* Generate target positions — bottom-to-top build order */
function generateBrickTargets(): BrickTarget[] {
  const text = '2027';
  const targets: BrickTarget[] = [];
  const cellSize = 0.12;
  const digitW = 5;
  const gap = 2;
  const totalCols = text.length * digitW + (text.length - 1) * gap;
  const offsetX = -(totalCols * cellSize) / 2 + cellSize / 2;
  const baseY = -0.5;

  let colOffset = 0;
  for (const ch of text) {
    const grid = DIGIT_FONT[ch];
    if (!grid) { colOffset += digitW + gap; continue; }

    const rows = grid.length;
    // Bottom row first so bricks build upward
    for (let row = rows - 1; row >= 0; row--) {
      for (let col = 0; col < grid[row].length; col++) {
        if (grid[row][col]) {
          targets.push({
            x: offsetX + (colOffset + col) * cellSize,
            y: baseY + (rows - 1 - row) * cellSize,
          });
        }
      }
    }
    colOffset += digitW + gap;
  }

  return targets;
}

const BRICK_TARGETS = generateBrickTargets();
const MAX_BRICKS = BRICK_TARGETS.length;
const MAX_DUST = MAX_BRICKS * DUST_PER_LAND;

interface BrickState {
  active: boolean;
  settled: boolean;
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  rot: THREE.Euler;
  rotSpeed: THREE.Vector3;
  targetX: number;
  targetY: number;
  bounces: number;
  dustDone: boolean;
}

interface DustState {
  active: boolean;
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  opacity: number;
  scale: number;
}

/* ── Per-instance color palette ─────────────────────────────── */
const BRICK_COLORS = [
  new THREE.Color('#10B981'),
  new THREE.Color('#0D9668'),
  new THREE.Color('#14C88D'),
  new THREE.Color('#0EA5E9'),
  new THREE.Color('#34D399'),
  new THREE.Color('#059669'),
];

/* ── Spawn dust on brick landing ──────────────────────────── */
function spawnDust(pos: THREE.Vector3, pool: DustState[], seed: number) {
  let count = 0;
  for (let i = 0; i < pool.length && count < DUST_PER_LAND; i++) {
    if (pool[i].active) continue;
    const p = pool[i];
    p.active = true;
    p.pos.copy(pos);
    const angle = seeded(seed + count, 7) * Math.PI * 2;
    const speed = 0.3 + seeded(seed + count, 8) * 0.5;
    p.vel.set(
      Math.cos(angle) * speed,
      0.3 + seeded(seed + count, 2) * 0.8,
      Math.sin(angle) * speed * 0.3,
    );
    p.opacity = 0.7;
    p.scale = 0.08 + seeded(seed + count, 4) * 0.1;
    count++;
  }
}

/* ── Noise helpers for texture generation ───────────────── */
function smoothNoise(x: number, y: number): number {
  const ix = Math.floor(x), iy = Math.floor(y);
  const fx = x - ix, fy = y - iy;
  const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
  const a = seeded(ix, iy), b = seeded(ix + 1, iy);
  const c = seeded(ix, iy + 1), d = seeded(ix + 1, iy + 1);
  return a + sx * (b - a) + sy * (c - a) + sx * sy * (a - b - c + d);
}
function fbmNoise(x: number, y: number, oct: number): number {
  let v = 0, amp = 0.5, freq = 1;
  for (let i = 0; i < oct; i++) { v += amp * smoothNoise(x * freq, y * freq); amp *= 0.5; freq *= 2.1; }
  return v;
}

/* ── Brick surface texture — circuit/energy pattern ─────── */
function createBrickTexture(): THREE.DataTexture {
  const s = 64, data = new Uint8Array(s * s * 4);
  for (let i = 0; i < s * s; i++) {
    const x = i % s, y = Math.floor(i / s);
    const u = x / s, v = y / s;

    // Edge glow — bright border ring (electrical edge)
    const edgeDist = Math.min(u, 1 - u, v, 1 - v);
    const edgeGlow = Math.max(0, 1 - edgeDist * 12);

    // Circuit grid lines
    const gridX = Math.abs((u * 4) % 1 - 0.5) < 0.06 ? 0.6 : 0;
    const gridY = Math.abs((v * 4) % 1 - 0.5) < 0.06 ? 0.6 : 0;
    const grid = Math.max(gridX, gridY);

    // Core noise for surface variation
    const noise = fbmNoise(u * 8, v * 8, 3);

    // Combine: dark center, bright edges, faint grid
    const base = 0.25 + noise * 0.15;
    const glow = base + edgeGlow * 0.7 + grid * 0.3;
    const val = Math.min(255, Math.floor(glow * 255));

    data[i * 4] = val;
    data[i * 4 + 1] = val;
    data[i * 4 + 2] = val;
    data[i * 4 + 3] = 255;
  }
  const tex = new THREE.DataTexture(data, s, s, THREE.RGBAFormat);
  tex.needsUpdate = true;
  tex.magFilter = THREE.LinearFilter;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.generateMipmaps = true;
  return tex;
}

/* ── Normal map for surface bumps ──────────────────────── */
function createBrickNormal(): THREE.DataTexture {
  const s = 64, data = new Uint8Array(s * s * 4), str = 1.5;
  for (let i = 0; i < s * s; i++) {
    const x = i % s, y = Math.floor(i / s);
    const u = x / s, v = y / s;
    const d = 1 / s;
    const hL = fbmNoise((u - d) * 10, v * 10, 3), hR = fbmNoise((u + d) * 10, v * 10, 3);
    const hD = fbmNoise(u * 10, (v - d) * 10, 3), hU = fbmNoise(u * 10, (v + d) * 10, 3);
    let nx = (hL - hR) * str, ny = (hD - hU) * str, nz = 1;
    const len = Math.sqrt(nx * nx + ny * ny + nz * nz);
    data[i * 4] = Math.floor((nx / len * 0.5 + 0.5) * 255);
    data[i * 4 + 1] = Math.floor((ny / len * 0.5 + 0.5) * 255);
    data[i * 4 + 2] = Math.floor((nz / len * 0.5 + 0.5) * 255);
    data[i * 4 + 3] = 255;
  }
  const tex = new THREE.DataTexture(data, s, s, THREE.RGBAFormat);
  tex.needsUpdate = true;
  tex.magFilter = THREE.LinearFilter;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.generateMipmaps = true;
  return tex;
}

/* ── Brick geometry — smaller box with slight bevel ─────── */
function createBrickGeometry() {
  const geo = new THREE.BoxGeometry(0.105, 0.105, 0.06, 3, 3, 3);
  const pos = geo.attributes.position;
  const radius = 0.012;
  const hx = 0.0525, hy = 0.0525, hz = 0.03;

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const ix = Math.max(-hx + radius, Math.min(hx - radius, x));
    const iy = Math.max(-hy + radius, Math.min(hy - radius, y));
    const iz = Math.max(-hz + radius, Math.min(hz - radius, z));
    const dx = x - ix, dy = y - iy, dz = z - iz;
    const len = Math.sqrt(dx * dx + dy * dy + dz * dz);
    if (len > 0.0001) {
      pos.setXYZ(i, ix + (dx / len) * radius, iy + (dy / len) * radius, iz + (dz / len) * radius);
    }
  }

  geo.computeVertexNormals();
  return geo;
}

/* ── Electric arc between two points (jagged lightning) ──── */
const MAX_ARCS = 6;
const ARC_SEGMENTS = 8;

interface ArcState {
  active: boolean;
  life: number;
  maxLife: number;
  points: Float32Array;
  fromX: number; fromY: number;
  toX: number; toY: number;
}

function ElectricArcs({ bricks: brickPool }: { bricks: React.MutableRefObject<BrickState[]> }) {
  const arcsRef = useRef<ArcState[]>([]);
  const linesRef = useRef<THREE.Group>(null);
  const tickRef = useRef(0);

  useEffect(() => {
    arcsRef.current = Array.from({ length: MAX_ARCS }, () => ({
      active: false,
      life: 0,
      maxLife: 0,
      points: new Float32Array((ARC_SEGMENTS + 1) * 3),
      fromX: 0, fromY: 0, toX: 0, toY: 0,
    }));
  }, []);

  useFrame((_, delta) => {
    if (!linesRef.current) return;
    const dt = Math.min(delta, 0.05);
    tickRef.current += dt;

    const settled = brickPool.current.filter((b) => b.settled);
    const falling = brickPool.current.filter((b) => b.active && !b.settled);

    // Spawn new arcs from settled bricks to nearby falling bricks
    if (settled.length > 0 && falling.length > 0 && tickRef.current > 0.08) {
      tickRef.current = 0;
      const f = falling[Math.floor(seeded(settled.length, falling.length * 100 + Date.now() % 1000) * falling.length)];
      // Find closest settled brick
      let closest = settled[0];
      let minDist = Infinity;
      for (const s of settled) {
        const dx = s.targetX - f.pos.x;
        const dy = s.targetY - f.pos.y;
        const d = dx * dx + dy * dy;
        if (d < minDist) { minDist = d; closest = s; }
      }

      if (minDist < 2.0) {
        const arc = arcsRef.current.find((a) => !a.active);
        if (arc) {
          arc.active = true;
          arc.life = 0;
          arc.maxLife = 0.12 + Math.random() * 0.1;
          arc.fromX = closest.targetX;
          arc.fromY = closest.targetY;
          arc.toX = f.pos.x;
          arc.toY = f.pos.y;
        }
      }
    }

    // Update arcs + rebuild line geometries
    const children = linesRef.current.children as THREE.Line[];
    arcsRef.current.forEach((arc, i) => {
      const line = children[i];
      if (!line) return;

      if (!arc.active) {
        line.visible = false;
        return;
      }

      arc.life += dt;
      if (arc.life >= arc.maxLife) {
        arc.active = false;
        line.visible = false;
        return;
      }

      line.visible = true;

      // Generate jagged path between from → to
      const pts = arc.points;
      for (let j = 0; j <= ARC_SEGMENTS; j++) {
        const t = j / ARC_SEGMENTS;
        const x = arc.fromX + (arc.toX - arc.fromX) * t;
        const y = arc.fromY + (arc.toY - arc.fromY) * t;
        // Jitter perpendicular to the line (re-randomize each frame for flickering)
        const jitter = (j > 0 && j < ARC_SEGMENTS) ? (Math.random() - 0.5) * 0.08 : 0;
        const jitterY = (j > 0 && j < ARC_SEGMENTS) ? (Math.random() - 0.5) * 0.08 : 0;
        pts[j * 3] = x + jitter;
        pts[j * 3 + 1] = y + jitterY;
        pts[j * 3 + 2] = 0.05;
      }

      const geo = line.geometry as THREE.BufferGeometry;
      geo.setAttribute('position', new THREE.BufferAttribute(pts, 3));
      geo.attributes.position.needsUpdate = true;

      // Fade out
      const opacity = 1 - arc.life / arc.maxLife;
      (line.material as THREE.LineBasicMaterial).opacity = opacity * 0.9;
    });
  });

  return (
    <group ref={linesRef}>
      {Array.from({ length: MAX_ARCS }, (_, i) => (
        <line key={i}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={ARC_SEGMENTS + 1}
              array={new Float32Array((ARC_SEGMENTS + 1) * 3)}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#818CF8" transparent opacity={0.8} linewidth={1} />
        </line>
      ))}
    </group>
  );
}

/* ── 3D Scene — bricks fall and build "2027" ──────────────── */

function BrickScene({ progress }: { progress: number }) {
  const brickRef = useRef<THREE.InstancedMesh>(null);
  const dustRef = useRef<THREE.InstancedMesh>(null);

  const bricks = useRef<BrickState[]>([]);
  const dustPool = useRef<DustState[]>([]);
  const releasedRef = useRef(0);
  const progressRef = useRef(0);
  progressRef.current = progress;

  const tmpObj = useMemo(() => new THREE.Object3D(), []);
  const brickGeo = useMemo(() => createBrickGeometry(), []);
  const brickMap = useMemo(() => createBrickTexture(), []);
  const normalMap = useMemo(() => createBrickNormal(), []);

  // Initialize pools
  useEffect(() => {
    bricks.current = Array.from({ length: MAX_BRICKS }, () => ({
      active: false,
      settled: false,
      pos: new THREE.Vector3(0, -50, 0),
      vel: new THREE.Vector3(),
      rot: new THREE.Euler(),
      rotSpeed: new THREE.Vector3(),
      targetX: 0,
      targetY: 0,
      bounces: 0,
      dustDone: false,
    }));
    dustPool.current = Array.from({ length: MAX_DUST }, () => ({
      active: false,
      pos: new THREE.Vector3(0, -50, 0),
      vel: new THREE.Vector3(),
      opacity: 0,
      scale: 0,
    }));
  }, []);

  useFrame((_, delta) => {
    if (!brickRef.current || !dustRef.current) return;
    const dt = Math.min(delta, 0.05);

    // ── Release bricks based on typing progress ──────────
    const targetCount = Math.floor(progressRef.current * BRICK_TARGETS.length);
    while (releasedRef.current < targetCount && releasedRef.current < BRICK_TARGETS.length) {
      const idx = releasedRef.current;
      const target = BRICK_TARGETS[idx];
      const b = bricks.current[idx];

      const s1 = seeded(idx, 0);
      const s2 = seeded(idx, 1);

      b.active = true;
      b.settled = false;
      b.dustDone = false;
      b.bounces = 0;
      b.targetX = target.x;
      b.targetY = target.y;

      // Spawn above, roughly over target X
      b.pos.set(target.x + (s1 - 0.5) * 0.6, 3.0 + s2 * 0.5, 0);
      b.vel.set((target.x - b.pos.x) * 0.3, -0.5, 0);

      b.rot.set(s1 * 0.4, s2 * 0.4, (s1 - 0.5) * 0.6);
      b.rotSpeed.set((s1 - 0.5) * 2, (s2 - 0.5) * 1.5, (s1 - 0.5) * 2.5);

      releasedRef.current++;
    }

    // ── Update bricks ────────────────────────────────────
    bricks.current.forEach((b, i) => {
      if (!b.active) {
        tmpObj.position.set(0, -50, 0);
        tmpObj.scale.setScalar(0.001);
        tmpObj.updateMatrix();
        brickRef.current!.setMatrixAt(i, tmpObj.matrix);
        return;
      }

      if (b.settled) {
        // Settled — just render at target position
        tmpObj.position.set(b.targetX, b.targetY, 0);
        tmpObj.rotation.set(0, 0, 0);
        tmpObj.scale.setScalar(1);
        tmpObj.updateMatrix();
        brickRef.current!.setMatrixAt(i, tmpObj.matrix);
        return;
      }

      // Gravity
      b.vel.y += GRAVITY * dt;

      // Steer toward target X
      b.vel.x += (b.targetX - b.pos.x) * 3.0 * dt;
      b.vel.x *= 1 - dt * 2.0;

      // Integrate
      b.pos.x += b.vel.x * dt;
      b.pos.y += b.vel.y * dt;

      // Spin (dampen as approaching)
      b.rot.x += b.rotSpeed.x * dt;
      b.rot.y += b.rotSpeed.y * dt;
      b.rot.z += b.rotSpeed.z * dt;

      const distToTarget = b.pos.y - b.targetY;

      // Dampen rotation as brick nears target
      if (distToTarget < 0.5) {
        const damp = 1 - dt * 8;
        b.rotSpeed.x *= damp;
        b.rotSpeed.y *= damp;
        b.rotSpeed.z *= damp;
        // Lerp rotation toward 0
        b.rot.x += (0 - b.rot.x) * dt * 6;
        b.rot.y += (0 - b.rot.y) * dt * 6;
        b.rot.z += (0 - b.rot.z) * dt * 6;
      }

      // Landing
      if (b.pos.y <= b.targetY && b.vel.y < 0) {
        b.pos.y = b.targetY;
        b.bounces++;

        if (!b.dustDone) {
          b.dustDone = true;
          spawnDust(b.pos, dustPool.current, i * 5);
        }

        if (b.bounces >= 2 || Math.abs(b.vel.y) < 0.5) {
          // Settle
          b.settled = true;
          b.pos.x = b.targetX;
          b.pos.y = b.targetY;
        } else {
          // Bounce
          b.vel.y = -b.vel.y * 0.2;
        }
      }

      tmpObj.position.copy(b.pos);
      tmpObj.rotation.copy(b.rot);
      tmpObj.scale.setScalar(1);
      tmpObj.updateMatrix();
      brickRef.current!.setMatrixAt(i, tmpObj.matrix);
    });

    brickRef.current.instanceMatrix.needsUpdate = true;

    // ── Update dust ──────────────────────────────────────
    dustPool.current.forEach((p, i) => {
      if (!p.active) {
        tmpObj.position.set(0, -50, 0);
        tmpObj.scale.setScalar(0.001);
        tmpObj.updateMatrix();
        dustRef.current!.setMatrixAt(i, tmpObj.matrix);
        return;
      }

      p.vel.y += GRAVITY * 0.1 * dt;
      p.vel.x *= 1 - dt * 2.5;
      p.vel.z *= 1 - dt * 2.5;
      p.pos.x += p.vel.x * dt;
      p.pos.y += p.vel.y * dt;
      p.pos.z += p.vel.z * dt;
      p.opacity -= dt * 2.0;
      p.scale -= dt * 0.6;

      if (p.opacity <= 0 || p.scale <= 0) {
        p.active = false;
        return;
      }

      tmpObj.position.copy(p.pos);
      tmpObj.scale.setScalar(p.scale);
      tmpObj.updateMatrix();
      dustRef.current!.setMatrixAt(i, tmpObj.matrix);
    });

    dustRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[2, 3, 5]} intensity={1.5} color="#ffffff" distance={15} decay={2} />
      <pointLight position={[-2, -1, 4]} intensity={0.8} color="#6366F1" distance={10} decay={2} />
      <pointLight position={[0, 1, 3]} intensity={0.4} color="#3B82F6" distance={8} decay={2} />

      <instancedMesh ref={brickRef} args={[brickGeo, undefined, MAX_BRICKS]}>
        <meshPhysicalMaterial
          map={brickMap}
          normalMap={normalMap}
          normalScale={new THREE.Vector2(0.4, 0.4)}
          color="#6366F1"
          emissive="#3B82F6"
          emissiveIntensity={0.4}
          roughness={0.25}
          metalness={0.6}
          clearcoat={0.5}
          clearcoatRoughness={0.2}
          transparent
          opacity={0.92}
        />
      </instancedMesh>

      <instancedMesh ref={dustRef} args={[undefined, undefined, MAX_DUST]}>
        <sphereGeometry args={[0.02, 6, 6]} />
        <meshStandardMaterial
          color="#818CF8"
          emissive="#6366F1"
          emissiveIntensity={2.0}
          transparent
          opacity={0.85}
        />
      </instancedMesh>

      {/* ── Electric arcs between settled + falling bricks ── */}
      <ElectricArcs bricks={bricks} />
    </>
  );
}

/* ══════════════════════════════════════════════════════════════
   MAIN COMPONENT — HTML editor + 3D Canvas
   ══════════════════════════════════════════════════════════════ */

export default function CodeConstruct() {
  const containerRef = useRef<HTMLDivElement>(null);
  const inView = useInView(containerRef, { once: true, margin: '-30px' });
  const reduced = useReducedMotion();

  /* ── Typing state — single counter drives everything ──────── */
  const [typedCount, setTypedCount] = useState(0);

  const lineLengths = useMemo(
    () => LINES.map((l) => l.tokens.reduce((s, t) => s + t.text.length, 0)),
    [],
  );

  const totalChars = useMemo(
    () => lineLengths.reduce((a, b) => a + b, 0),
    [lineLengths],
  );

  /* Derive line/char position from the single counter */
  const { currentLine, currentChar, allDone } = useMemo(() => {
    let remaining = typedCount;
    for (let li = 0; li < LINES.length; li++) {
      const len = lineLengths[li];
      if (remaining <= len) {
        return { currentLine: li, currentChar: remaining, allDone: false };
      }
      remaining -= len;
    }
    return { currentLine: LINES.length, currentChar: 0, allDone: true };
  }, [typedCount, lineLengths]);

  /* ── Typewriter tick — increments one counter per tick ────── */
  useEffect(() => {
    if (!inView || reduced) {
      if (reduced) setTypedCount(totalChars);
      return;
    }

    setTypedCount(0);

    let count = 0;
    let cancelled = false;
    let timer: number;

    /* Pre-compute a schedule: for each character index, what's the delay
       AFTER typing it before the next character? */
    const schedule: number[] = [];
    for (let li = 0; li < LINES.length; li++) {
      const len = lineLengths[li];
      if (len === 0) {
        // blank line — no chars, just a short pause is implicit
        continue;
      }
      for (let ci = 0; ci < len; ci++) {
        if (ci === len - 1) {
          // last char of line — use line gap before next line
          schedule.push(LINE_GAP);
        } else {
          schedule.push(CHAR_SPEED);
        }
      }
    }

    const tick = () => {
      if (cancelled) return;
      count++;
      setTypedCount(count);

      if (count >= totalChars) return; // done

      const delay = schedule[count - 1] ?? CHAR_SPEED;
      timer = window.setTimeout(tick, delay);
    };

    timer = window.setTimeout(tick, 500);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [inView, reduced, lineLengths, totalChars]);

  /* ── Render typed tokens for a line ────────────────────────── */
  const renderTypedLine = useCallback(
    (line: CodeLine, lineIdx: number) => {
      if (lineIdx > currentLine) return null;

      const isComplete = lineIdx < currentLine;
      const chars = isComplete ? Infinity : currentChar;
      let counted = 0;

      return (
        <>
          <span style={{ paddingLeft: `${line.indent * 18}px` }}>
            {line.tokens.map((tok, ti) => {
              if (counted >= chars) return null;
              const start = counted;
              counted += tok.text.length;
              const vis =
                chars >= counted
                  ? tok.text
                  : tok.text.slice(0, chars - start);
              return (
                <span
                  key={ti}
                  className={
                    tok.type ? TOKEN_COLORS[tok.type] : 'text-white/45'
                  }
                >
                  {vis}
                </span>
              );
            })}
          </span>

          {lineIdx === currentLine && !isComplete && (
            <motion.span
              className="inline-block w-[6px] h-[14px] bg-[#6366F1]/70 rounded-[1px] ml-px align-middle"
              animate={{ opacity: [1, 0] }}
              transition={{
                duration: 0.53,
                repeat: Infinity,
                ease: 'steps(1)',
              }}
            />
          )}
        </>
      );
    },
    [currentLine, currentChar],
  );

  const typingProgress = totalChars > 0 ? typedCount / totalChars : 0;

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Ambient glow behind terminal */}
      <div className="absolute inset-0 -m-8 bg-gradient-to-br from-[#6366F1]/8 via-transparent to-[#3B82F6]/5 rounded-3xl blur-3xl pointer-events-none" />

      {/* ── Terminal frame ─────────────────────────────────── */}
      <div className="relative rounded-2xl border border-white/[0.08] bg-[#0a0a12] shadow-[0_0_60px_-12px_rgba(99,102,241,0.15)] overflow-hidden z-10">

        {/* Title bar */}
        <div className="flex items-center justify-between px-2.5 md:px-3 py-1.5 md:py-2 border-b border-white/[0.06] bg-gradient-to-r from-white/[0.03] to-transparent">
          <div className="flex items-center gap-1.5 md:gap-2.5">
            <div className="flex gap-1">
              <div className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-[#FF5F57]/70" />
              <div className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-[#FEBC2E]/70" />
              <div className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-[#28C840]/70" />
            </div>
            <span className="text-[9px] md:text-[10px] font-mono text-white/25 tracking-wider uppercase">
              lumina-erp
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[9px] md:text-[10px] font-mono text-[#6366F1]/40 hidden sm:inline">
              building-the-future.ts
            </span>
            <span className="text-[9px] md:text-[10px] font-mono text-white/15">
              TS
            </span>
          </div>
        </div>

        {/* Code area */}
        <div className="p-2.5 md:p-3 pb-1.5 font-mono text-[9px] md:text-[11px] leading-[1.8] border-b border-white/[0.04] overflow-x-auto">
          {LINES.map((line, i) => (
            <div
              key={line.num}
              className="flex"
              style={{ minHeight: '1.85em' }}
            >
              <span className="w-5 md:w-7 text-right text-white/[0.12] select-none shrink-0 pr-1.5 md:pr-3 text-[8px] md:text-[9px] tabular-nums">
                {i <= currentLine ? line.num : ''}
              </span>
              {line.tokens.length === 0 && i <= currentLine ? (
                <span className="select-none">&nbsp;</span>
              ) : (
                renderTypedLine(line, i)
              )}
            </div>
          ))}

          {allDone && !reduced && (
            <motion.div
              className="flex items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <span className="w-5 md:w-7 text-right text-white/[0.12] select-none shrink-0 pr-1.5 md:pr-3 text-[8px] md:text-[9px] tabular-nums">
                {LINES.length + 1}
              </span>
              <motion.span
                className="inline-block w-[6px] h-[14px] bg-[#6366F1]/70 rounded-[1px]"
                animate={{ opacity: [1, 0] }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  ease: 'steps(1)',
                }}
              />
            </motion.div>
          )}
        </div>

        {/* ── Build area — 3D canvas inside the terminal ──── */}
        <div className="relative h-[100px] md:h-[140px]">
          {/* Subtle label */}
          <div className="absolute top-2 left-3 md:left-4 z-10 flex items-center gap-2">
            <span className="text-[8px] md:text-[9px] font-mono text-white/15 uppercase tracking-widest">
              output
            </span>
            <div className="h-px flex-1 bg-white/[0.04]" />
          </div>

          {!reduced && inView ? (
            <Canvas
              gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
              camera={{ position: [0, 0, 5.5], fov: 30 }}
              dpr={[1, 1.5]}
              style={{ background: 'transparent' }}
            >
              <BrickScene progress={typingProgress} />
            </Canvas>
          ) : (
            <div className="flex items-center justify-center h-full">
              <span className="text-4xl md:text-5xl font-bold text-[#6366F1]/30 font-mono tracking-widest">
                2027
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
