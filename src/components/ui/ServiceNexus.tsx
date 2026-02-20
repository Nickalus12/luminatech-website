import { useState, useRef, useCallback, useEffect, useMemo, memo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

/* ── Helpers ────────────────────────────────────────── */

function useIsTouchDevice() {
  const [isTouch, setIsTouch] = useState(false);
  useEffect(() => {
    setIsTouch(
      'ontouchstart' in window || navigator.maxTouchPoints > 0,
    );
  }, []);
  return isTouch;
}

/* ── Types ──────────────────────────────────────────── */

interface ServiceNode {
  id: string;
  title: string;
  shortTitle: string;
  description: string;
  icon: string;
  metric: { value: string; label: string };
  pricing: string;
  timeline: string;
  highlights: string[];
  url: string | null;
  accent: string;
}

/* ── Service Data ───────────────────────────────────── */

const SERVICES: ServiceNode[] = [
  {
    id: 'extensions',
    title: 'P21 Extensions & DynaChange',
    shortTitle: 'P21 Extensions',
    description:
      'Custom business rules that automate workflows, enforce validation, and integrate with external systems — without modifying core P21 code.',
    icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4',
    metric: { value: '365%', label: 'Year-1 ROI' },
    pricing: '$1,500 – $8,000',
    timeline: '1–4 weeks',
    highlights: [
      'C# .NET business rules (Validators, Converters, On Event)',
      'Transaction API integration for order automation',
      'Fail-safe patterns — never blocks legitimate ops',
      '30-day warranty + compiled source code',
    ],
    url: '/services/p21-extensions-dynachange',
    accent: '#10B981',
  },
  {
    id: 'integrations',
    title: 'n8n Automation & Workflow Integration',
    shortTitle: 'n8n Automation',
    description:
      'Connect your ERP to e-commerce, marketplaces, CRMs, and third-party systems with custom n8n automation workflows and proven performance patterns.',
    icon: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1',
    metric: { value: '150x', label: 'Faster Syncs' },
    pricing: '$2,000 – $15,000',
    timeline: '1–3 weeks',
    highlights: [
      'n8n workflow development with visual editor',
      'Bi-directional sync (orders, pricing, inventory)',
      'OAuth2 + retry logic + error handling built-in',
      '30-day post-deployment support included',
    ],
    url: '/services/n8n-integrations-p21',
    accent: '#3B82F6',
  },
  {
    id: 'database',
    title: 'Database Optimization & Performance',
    shortTitle: 'DB Optimization',
    description:
      'Make ERP reports load 10x faster without upgrading hardware. Expert SQL query optimization, indexing strategies, and performance tuning.',
    icon: 'M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4',
    metric: { value: '10–15x', label: 'Query Speed' },
    pricing: '$2,500 – $15,000',
    timeline: '3–5 days',
    highlights: [
      'Free 1-hour performance audit included',
      'Covering index design + keyset pagination',
      'Crystal Reports & SSRS query rewrites',
      '90-day performance warranty',
    ],
    url: '/services/erp-database-optimization-p21',
    accent: '#8B5CF6',
  },
  {
    id: 'warehouse',
    title: 'Warehouse Automation Solutions',
    shortTitle: 'Warehouse Auto',
    description:
      'Automate pick routing, bin allocation, and shipping workflows without expensive WMS platforms — built on your existing ERP.',
    icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
    metric: { value: '398%', label: 'Year-1 ROI' },
    pricing: '$2,000 – $8,000',
    timeline: '1–3 weeks',
    highlights: [
      'Quantity-based bin routing (eaches vs. pallet)',
      'Carrier auto-assignment + validation rules',
      'Config portal for warehouse managers',
      '60-day warranty on automation logic',
    ],
    url: '/services/warehouse-automation-p21',
    accent: '#F59E0B',
  },
  {
    id: 'portals',
    title: 'Custom Portal Development',
    shortTitle: 'Custom Portals',
    description:
      'Customer-facing portals with live pricing, availability, and order history from your ERP — modern web interfaces that drive sales.',
    icon: 'M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z',
    metric: { value: '8x', label: 'Faster Quotes' },
    pricing: '$5,000 – $25,000',
    timeline: '3–6 weeks',
    highlights: [
      'Customer-specific contract pricing via ERP APIs',
      'Real-time inventory availability lookups',
      'Mobile-responsive glassmorphism design',
      '60-day warranty + user training',
    ],
    url: '/services/custom-portals-p21',
    accent: '#EC4899',
  },
  {
    id: 'api',
    title: 'API Development & Integration',
    shortTitle: 'API Development',
    description:
      'Custom REST APIs that expose ERP data securely to external apps, partners, and internal tools — with documentation, auth, and monitoring.',
    icon: 'M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
    metric: { value: '$125', label: 'Per Hour' },
    pricing: '$3,000 – $20,000',
    timeline: '2–6 weeks',
    highlights: [
      'RESTful API design with OpenAPI/Swagger docs',
      'OAuth2 + API key authentication',
      'Rate limiting, caching, and monitoring',
      'Auto-generated developer documentation',
    ],
    url: '/services/api-development-integration',
    accent: '#6366F1',
  },
];

const AUTO_CYCLE_MS = 4500;

/* ── Service Tile ───────────────────────────────────── */

const ServiceTile = memo(function ServiceTile({
  service,
  isActive,
  onClick,
  index,
  noMotion,
  isTouch,
}: {
  service: ServiceNode;
  isActive: boolean;
  onClick: () => void;
  index: number;
  noMotion: boolean;
  isTouch: boolean;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [hovering, setHovering] = useState(false);

  const skipEffects = noMotion || isTouch;

  const onMove = useCallback(
    (e: React.MouseEvent) => {
      if (skipEffects || !ref.current) return;
      const r = ref.current.getBoundingClientRect();
      setMouse({ x: e.clientX - r.left, y: e.clientY - r.top });
    },
    [skipEffects],
  );

  /* 3D tilt from cursor position */
  const h = ref.current?.offsetHeight || 160;
  const w = ref.current?.offsetWidth || 200;
  const tiltX = hovering && !skipEffects ? ((mouse.y / h) - 0.5) * -6 : 0;
  const tiltY = hovering && !skipEffects ? ((mouse.x / w) - 0.5) * 6 : 0;

  const tabId = `svc-tab-${service.id}`;

  return (
    <motion.button
      ref={ref}
      id={tabId}
      role="tab"
      aria-selected={isActive}
      aria-controls={`svc-panel-${service.id}`}
      tabIndex={isActive ? 0 : -1}
      onClick={onClick}
      onMouseMove={isTouch ? undefined : onMove}
      onMouseEnter={isTouch ? undefined : () => setHovering(true)}
      onMouseLeave={isTouch ? undefined : () => {
        setHovering(false);
        setMouse({ x: 0, y: 0 });
      }}
      initial={noMotion ? undefined : { opacity: 0, y: 24, scale: 0.96 }}
      animate={noMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, delay: index * 0.07, ease: [0.22, 0.68, 0.32, 1] }}
      className="relative w-full text-left rounded-2xl overflow-hidden cursor-pointer
        focus-visible:outline-2 focus-visible:outline-offset-2"
      style={{
        background: isActive
          ? `linear-gradient(145deg, ${service.accent}10, ${service.accent}18)`
          : '#12121A',
        border: `1px solid ${isActive ? service.accent + '50' : hovering ? service.accent + '30' : '#2A2A36'}`,
        boxShadow: isActive
          ? `0 0 28px ${service.accent}18, inset 0 1px 0 ${service.accent}15`
          : hovering
            ? `0 8px 24px rgba(0,0,0,0.3)`
            : 'none',
        transform: `perspective(600px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(${isActive ? 1.02 : 1})`,
        transition: 'transform 0.2s ease-out, border-color 0.25s, box-shadow 0.3s, background 0.3s',
        willChange: hovering ? 'transform' : 'auto',
        outlineColor: service.accent,
      }}
    >
      {/* Cursor spotlight — desktop only */}
      {hovering && !skipEffects && (
        <div
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            background: `radial-gradient(220px circle at ${mouse.x}px ${mouse.y}px, ${service.accent}18, transparent 70%)`,
          }}
        />
      )}

      {/* Active breathing ring */}
      {isActive && !noMotion && (
        <motion.div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{ border: `1px solid ${service.accent}30` }}
          animate={{ opacity: [0.4, 0.15, 0.4] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      <div className="relative z-10 p-4 sm:p-5">
        <div className="flex items-start justify-between mb-3">
          <div
            className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-xl"
            style={{ background: `${service.accent}12` }}
          >
            <svg
              className="w-5 h-5 sm:w-[22px] sm:h-[22px]"
              style={{ color: service.accent }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d={service.icon} />
            </svg>
          </div>

          <span
            className="inline-flex items-center px-2 py-0.5 text-[10px] sm:text-xs font-bold rounded-full font-mono"
            style={{
              color: service.accent,
              background: `${service.accent}12`,
              border: `1px solid ${service.accent}20`,
            }}
          >
            {service.metric.value}
          </span>
        </div>

        <h3 className="text-sm sm:text-[15px] font-semibold text-[#E8E8ED] leading-tight mb-0.5">
          {service.shortTitle}
        </h3>
        <p className="text-[10px] sm:text-xs text-[#6B6B7B]">{service.metric.label}</p>
      </div>
    </motion.button>
  );
});

/* ── Preview Panel ──────────────────────────────────── */

function PreviewPanel({
  service,
  noMotion,
}: {
  service: ServiceNode;
  noMotion: boolean;
}) {
  return (
    <motion.div
      key={service.id}
      id={`svc-panel-${service.id}`}
      role="tabpanel"
      aria-labelledby={`svc-tab-${service.id}`}
      initial={noMotion ? undefined : { opacity: 0, y: 16, scale: 0.97 }}
      animate={noMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
      exit={noMotion ? undefined : { opacity: 0, y: -8, scale: 0.97 }}
      transition={{ duration: 0.32, ease: [0.22, 0.68, 0.32, 1] }}
      className="relative rounded-2xl overflow-hidden"
      style={{
        background: 'linear-gradient(145deg, #12121A 0%, #0E0E16 100%)',
        border: `1px solid ${service.accent}25`,
      }}
    >
      {/* Accent line */}
      <div
        className="h-[2px]"
        style={{
          background: `linear-gradient(90deg, transparent 5%, ${service.accent}80 50%, transparent 95%)`,
        }}
      />

      <div className="p-6 sm:p-8 lg:p-10">
        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6 mb-6">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-10 h-10 flex items-center justify-center rounded-lg shrink-0"
                style={{
                  background: `${service.accent}12`,
                  viewTransitionName: `svc-icon-${service.id}`,
                }}
              >
                <svg
                  className="w-5 h-5"
                  style={{ color: service.accent }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d={service.icon} />
                </svg>
              </div>
              <h3
                className="text-xl sm:text-2xl font-bold text-[#E8E8ED] leading-tight"
                style={{ viewTransitionName: `svc-title-${service.id}` }}
              >
                {service.title}
              </h3>
            </div>
            <p className="text-sm sm:text-base text-[#A0A0B0] leading-relaxed max-w-2xl">
              {service.description}
            </p>
          </div>

          {/* Hero metric */}
          <div
            className="shrink-0 text-center px-5 py-3 rounded-xl sm:min-w-[120px]"
            style={{
              background: `${service.accent}08`,
              border: `1px solid ${service.accent}18`,
            }}
          >
            <div
              className="text-3xl sm:text-4xl font-mono font-bold"
              style={{ color: service.accent }}
            >
              {service.metric.value}
            </div>
            <div className="text-[11px] text-[#6B6B7B] mt-0.5">{service.metric.label}</div>
          </div>
        </div>

        {/* ── Stats row ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
          <div className="bg-[#1A1A24] rounded-lg p-3 sm:p-4">
            <p className="text-[10px] sm:text-xs text-[#6B6B7B] mb-1">Investment</p>
            <p className="text-sm sm:text-base font-mono font-semibold text-[#E8E8ED]">
              {service.pricing}
            </p>
          </div>
          <div className="bg-[#1A1A24] rounded-lg p-3 sm:p-4">
            <p className="text-[10px] sm:text-xs text-[#6B6B7B] mb-1">Timeline</p>
            <p className="text-sm sm:text-base font-mono font-semibold text-[#E8E8ED]">
              {service.timeline}
            </p>
          </div>
          <div className="hidden sm:block bg-[#1A1A24] rounded-lg p-3 sm:p-4">
            <p className="text-[10px] sm:text-xs text-[#6B6B7B] mb-1">Key Metric</p>
            <p
              className="text-sm sm:text-base font-mono font-semibold"
              style={{ color: service.accent }}
            >
              {service.metric.value} {service.metric.label}
            </p>
          </div>
        </div>

        {/* ── Highlights ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5 mb-8">
          {service.highlights.map((h, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <svg
                className="w-4 h-4 shrink-0 mt-0.5"
                style={{ color: service.accent }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2}
              >
                <path d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm text-[#A0A0B0] leading-relaxed">{h}</span>
            </div>
          ))}
        </div>

        {/* ── CTAs ── */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <a
            href={service.url || '#retainer-pricing'}
            className="group/cta inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl
              text-sm font-semibold text-white transition-all duration-300 hover:gap-3.5"
            style={{
              background: `linear-gradient(135deg, ${service.accent}, ${service.accent}CC)`,
              boxShadow: `0 4px 20px ${service.accent}25`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = `0 8px 36px ${service.accent}40`;
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = `0 4px 20px ${service.accent}25`;
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {service.url ? 'Explore Full Details' : 'View Pricing Plans'}
            <svg
              className="w-4 h-4 transition-transform duration-300 group-hover/cta:translate-x-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {service.url ? (
                <>
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </>
              ) : (
                <path d="m6 9 6 6 6-6" />
              )}
            </svg>
          </a>

          <a
            href="/contact"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm
              font-medium text-[#A0A0B0] border border-[#2A2A36] hover:border-[#3B3B4B]
              hover:text-[#E8E8ED] transition-all duration-200"
          >
            Request a Quote
          </a>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Main Component ─────────────────────────────────── */

export default function ServiceNexus({ className = '' }: { className?: string }) {
  const [activeId, setActiveId] = useState(SERVICES[0].id);
  const [interacted, setInteracted] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const tablistRef = useRef<HTMLDivElement>(null);
  const noMotion = useReducedMotion() ?? false;
  const isTouch = useIsTouchDevice();

  const active = SERVICES.find((s) => s.id === activeId) || SERVICES[0];

  /* Auto-cycle when idle */
  useEffect(() => {
    if (interacted || noMotion) return;
    timerRef.current = setInterval(() => {
      setActiveId((prev) => {
        const i = SERVICES.findIndex((s) => s.id === prev);
        return SERVICES[(i + 1) % SERVICES.length].id;
      });
    }, AUTO_CYCLE_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [interacted, noMotion]);

  const select = useCallback((id: string) => {
    setActiveId(id);
    setInteracted(true);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  /* Stable per-service click handlers so ServiceTile memo works */
  const clickHandlers = useMemo(
    () => SERVICES.map((svc) => () => select(svc.id)),
    [select],
  );

  /* Keyboard nav with focus management */
  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const idx = SERVICES.findIndex((s) => s.id === activeId);
      let next = idx;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (idx + 1) % SERVICES.length;
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp')
        next = (idx - 1 + SERVICES.length) % SERVICES.length;
      else return;
      e.preventDefault();
      select(SERVICES[next].id);
      /* Move focus to the newly selected tab */
      const nextBtn = tablistRef.current?.querySelector<HTMLButtonElement>(
        `#svc-tab-${SERVICES[next].id}`,
      );
      nextBtn?.focus();
    },
    [activeId, select],
  );

  return (
    <div className={`relative ${className}`} style={{ minHeight: 480 }}>
      {/* Ambient dots */}
      {!noMotion && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
          {[
            { t: '6%', l: '12%', c: '#3B82F6', d: '4s', dl: '0s', s: 4 },
            { t: '38%', l: '88%', c: '#8B5CF6', d: '5s', dl: '1.2s', s: 5 },
            { t: '72%', l: '4%', c: '#10B981', d: '3.8s', dl: '0.6s', s: 4 },
            { t: '18%', l: '68%', c: '#F59E0B', d: '4.5s', dl: '2s', s: 3 },
            { t: '55%', l: '42%', c: '#EC4899', d: '5.2s', dl: '2.8s', s: 4 },
            { t: '85%', l: '75%', c: '#6366F1', d: '4.2s', dl: '1.8s', s: 3 },
          ].map((dot, i) => (
            <div
              key={i}
              className="absolute rounded-full animate-pulse"
              style={{
                top: dot.t,
                left: dot.l,
                width: dot.s,
                height: dot.s,
                background: dot.c,
                opacity: 0.15,
                animationDuration: dot.d,
                animationDelay: dot.dl,
              }}
            />
          ))}
        </div>
      )}

      {/* Tile grid */}
      <div
        ref={tablistRef}
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-4 sm:mb-6 relative"
        role="tablist"
        aria-label="Service categories"
        onKeyDown={onKeyDown}
      >
        {SERVICES.map((svc, i) => (
          <ServiceTile
            key={svc.id}
            service={svc}
            isActive={activeId === svc.id}
            onClick={clickHandlers[i]}
            index={i}
            noMotion={noMotion}
            isTouch={isTouch}
          />
        ))}
      </div>

      {/* Connector beam */}
      <div className="flex justify-center h-5 sm:h-7" aria-hidden="true">
        {noMotion ? (
          <div
            className="w-px h-full rounded-full"
            style={{
              background: `linear-gradient(to bottom, ${active.accent}50, ${active.accent}08)`,
            }}
          />
        ) : (
          <motion.div
            className="w-px rounded-full"
            style={{
              background: `linear-gradient(to bottom, ${active.accent}50, ${active.accent}08)`,
              boxShadow: `0 0 6px ${active.accent}20`,
            }}
            animate={{ height: '100%' }}
            transition={{ duration: 0.3 }}
          />
        )}
      </div>

      {/* Preview panel */}
      <AnimatePresence mode="wait">
        <PreviewPanel key={activeId} service={active} noMotion={noMotion} />
      </AnimatePresence>
    </div>
  );
}
