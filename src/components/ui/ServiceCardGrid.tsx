import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ── Types ────────────────────────────────────────────────────

interface ServiceTier {
  name: string;
  hours: string;
  price: string;
}

interface ServiceExample {
  name: string;
  problem: string;
  solution: string;
  result: string;
}

interface ServiceItem {
  id: string;
  icon: string;
  title: string;
  description: string;
  includes: string[];
  timeline: string;
  pricing: string;
  cta: { label: string; href: string };
  tiers?: ServiceTier[];
  examples?: ServiceExample[];
}

interface ROIModel {
  assumptions: { label: string; value: string }[];
  calculation: string;
  breakeven: string;
  yearOneROI: string;
  competitiveEdge: string;
}

interface ComplexityRating {
  rating: number;
  factors: string[];
}

interface TimelineMilestone {
  phase: string;
  duration: string;
  deliverable: string;
}

interface RiskProfile {
  low: string[];
  medium: string[];
  high: string[];
  mitigation: string;
}

interface BeforeAfter {
  before: { metric: string; value: string; pain: string };
  after: { metric: string; value: string; gain: string };
}

interface ServiceEnhancement {
  roiModel: ROIModel;
  complexity: ComplexityRating;
  techStack: string[];
  timeline: TimelineMilestone[];
  risks: RiskProfile;
  comparison: BeforeAfter;
  advantages: string[];
}

interface EnrichedService extends ServiceItem {
  enhancements: ServiceEnhancement;
}

interface ServiceCardGridProps {
  services: EnrichedService[];
  className?: string;
}

// ── Key metric badges per service ────────────────────────────
const keyMetrics: Record<string, { text: string; color: string }> = {
  extensions: { text: 'Year-1 ROI: 365%', color: 'text-[#10B981] bg-[#10B981]/10 border-[#10B981]/20' },
  integrations: { text: '150x Faster', color: 'text-[#3B82F6] bg-[#3B82F6]/10 border-[#3B82F6]/20' },
  database: { text: '10-15x Query Speed', color: 'text-[#3B82F6] bg-[#3B82F6]/10 border-[#3B82F6]/20' },
  warehouse: { text: 'Year-1 ROI: 398%', color: 'text-[#10B981] bg-[#10B981]/10 border-[#10B981]/20' },
  portals: { text: '8x Faster Quotes', color: 'text-[#3B82F6] bg-[#3B82F6]/10 border-[#3B82F6]/20' },
  support: { text: 'From $625/mo', color: 'text-[#8B5CF6] bg-[#8B5CF6]/10 border-[#8B5CF6]/20' },
};

const iconPaths: Record<string, string> = {
  advisory: 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7',
  development: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4',
  cloud: 'M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12',
  reporting: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  integration: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1',
  managed: 'M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z',
};

const tabDefs = [
  { id: 'overview', label: 'Overview' },
  { id: 'roi', label: 'ROI & Pricing' },
  { id: 'tech', label: 'Tech Stack' },
  { id: 'timeline', label: 'Timeline' },
  { id: 'examples', label: 'Examples' },
] as const;

type TabId = (typeof tabDefs)[number]['id'];

// ── Compact card ─────────────────────────────────────────────

function ServiceCardCompact({
  service,
  isExpanded,
  onToggle,
}: {
  service: EnrichedService;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const metric = keyMetrics[service.id];
  const iconPath = iconPaths[service.icon] || iconPaths.advisory;

  return (
    <button
      onClick={onToggle}
      aria-expanded={isExpanded}
      aria-controls={`service-detail-${service.id}`}
      className={`w-full text-left bg-[#12121A] border rounded-xl p-6 transition-all duration-200 focus-visible:outline-2 focus-visible:outline-[#3B82F6] focus-visible:outline-offset-2 cursor-pointer group ${
        isExpanded
          ? 'border-[#3B82F6] shadow-[0_0_20px_rgba(59,130,246,0.15)]'
          : 'border-[#2A2A36] hover:border-[#3B82F6]/50 hover:-translate-y-0.5'
      }`}
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-[#3B82F6]/10 shrink-0">
          <svg
            className="w-6 h-6 text-[#3B82F6]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d={iconPath} />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-[#E8E8ED] mb-1 leading-tight">
            {service.title}
          </h3>
          <p className="text-sm text-[#A0A0B0] leading-relaxed line-clamp-2">
            {service.description}
          </p>

          <div className="flex items-center gap-3 mt-3 flex-wrap">
            {metric && (
              <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-semibold rounded-full border ${metric.color}`}>
                {metric.text}
              </span>
            )}
            <span className="text-xs text-[#6B6B7B] font-mono">{service.timeline}</span>
            <span className="text-xs text-[#6B6B7B]">|</span>
            <span className="text-xs text-[#3B82F6] font-mono font-semibold">{service.pricing}</span>
          </div>
        </div>
        <div className="shrink-0 mt-1">
          <svg
            className={`w-5 h-5 text-[#6B6B7B] transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''} group-hover:text-[#3B82F6]`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2}
          >
            <path d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </button>
  );
}

// ── Tab panels ───────────────────────────────────────────────

function OverviewTab({ service }: { service: EnrichedService }) {
  const e = service.enhancements;
  return (
    <div className="space-y-8">
      {/* Includes */}
      <div>
        <h4 className="text-base font-semibold text-[#E8E8ED] mb-4">What's Included</h4>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {service.includes.map((item, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-[#A0A0B0]">
              <svg className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path d="M20 6 9 17l-5-5" />
              </svg>
              <span className="leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Complexity */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="text-sm font-semibold text-[#E8E8ED]">Complexity:</span>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((level) => (
              <div
                key={level}
                className={`w-7 h-1.5 rounded-full ${level <= e.complexity.rating ? 'bg-[#3B82F6]' : 'bg-[#2A2A36]'}`}
              />
            ))}
          </div>
          <span className="text-xs font-mono text-[#6B6B7B]">{e.complexity.rating}/5</span>
        </div>
        <div className="flex flex-wrap gap-1.5 mt-1.5">
          {e.complexity.factors.map((f) => (
            <span key={f} className="px-2 py-0.5 text-xs bg-[#1A1A24] text-[#A0A0B0] rounded-md">{f}</span>
          ))}
        </div>
      </div>

      {/* Before / After */}
      <div>
        <h4 className="text-base font-semibold text-[#E8E8ED] mb-4">Before / After</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#1A1A24] border border-[#EF4444]/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-4 h-4 text-[#EF4444]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span className="text-sm font-semibold text-[#EF4444]">Before</span>
            </div>
            <p className="text-xs text-[#6B6B7B] mb-1">{e.comparison.before.metric}</p>
            <p className="text-xl font-mono font-bold text-[#E8E8ED] mb-1">{e.comparison.before.value}</p>
            <p className="text-xs text-[#A0A0B0] italic">{e.comparison.before.pain}</p>
          </div>
          <div className="bg-[#1A1A24] border border-[#10B981]/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-4 h-4 text-[#10B981]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm font-semibold text-[#10B981]">After</span>
            </div>
            <p className="text-xs text-[#6B6B7B] mb-1">{e.comparison.after.metric}</p>
            <p className="text-xl font-mono font-bold text-[#10B981] mb-1">{e.comparison.after.value}</p>
            <p className="text-xs text-[#A0A0B0] italic">{e.comparison.after.gain}</p>
          </div>
        </div>
      </div>

      {/* Competitive Advantages */}
      <div>
        <h4 className="text-base font-semibold text-[#E8E8ED] mb-4">Why We Win</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {e.advantages.map((adv, i) => (
            <div key={i} className="flex items-start gap-2.5 bg-[#1A1A24] rounded-lg p-3">
              <svg className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-xs text-[#A0A0B0] leading-relaxed">{adv}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Risk Assessment (collapsible) */}
      <details className="group">
        <summary className="cursor-pointer flex items-center justify-between py-3 px-4 bg-[#1A1A24] rounded-lg text-sm font-semibold text-[#E8E8ED] hover:bg-[#22222E] transition-colors">
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4 text-[#F59E0B]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3l-6.928-12c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Risk Assessment & Mitigation
          </span>
          <svg className="w-4 h-4 text-[#6B6B7B] group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path d="M19 9l-7 7-7-7" />
          </svg>
        </summary>
        <div className="pt-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-[#1A1A24] border-l-2 border-[#10B981] rounded-lg p-3">
              <h5 className="text-xs font-semibold text-[#10B981] mb-2">Low Risk</h5>
              {e.risks.low.map((r, i) => (
                <p key={i} className="text-xs text-[#A0A0B0]">{r}</p>
              ))}
            </div>
            <div className="bg-[#1A1A24] border-l-2 border-[#F59E0B] rounded-lg p-3">
              <h5 className="text-xs font-semibold text-[#F59E0B] mb-2">Medium Risk</h5>
              {e.risks.medium.map((r, i) => (
                <p key={i} className="text-xs text-[#A0A0B0] mb-1">{r}</p>
              ))}
            </div>
            <div className="bg-[#1A1A24] border-l-2 border-[#EF4444] rounded-lg p-3">
              <h5 className="text-xs font-semibold text-[#EF4444] mb-2">High Risk</h5>
              {e.risks.high.map((r, i) => (
                <p key={i} className="text-xs text-[#A0A0B0]">{r}</p>
              ))}
            </div>
          </div>
          <div className="bg-[#3B82F6]/5 rounded-lg p-3">
            <h5 className="text-xs font-semibold text-[#E8E8ED] mb-1">Mitigation Strategy</h5>
            <p className="text-xs text-[#A0A0B0] leading-relaxed">{e.risks.mitigation}</p>
          </div>
        </div>
      </details>
    </div>
  );
}

function ROITab({ service }: { service: EnrichedService }) {
  const roi = service.enhancements.roiModel;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Assumptions */}
        <div className="bg-[#1A1A24] rounded-lg p-5">
          <h4 className="font-semibold text-[#E8E8ED] mb-4 text-sm">Assumptions</h4>
          <ul className="space-y-2.5">
            {roi.assumptions.map((a, i) => (
              <li key={i} className="flex justify-between text-sm">
                <span className="text-[#A0A0B0]">{a.label}:</span>
                <span className="font-mono text-[#E8E8ED]">{a.value}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 pt-4 border-t border-[#2A2A36]">
            <p className="text-xs text-[#6B6B7B] mb-1">Calculation</p>
            <p className="text-xs font-mono text-[#A0A0B0] leading-relaxed">{roi.calculation}</p>
          </div>
        </div>

        {/* Results */}
        <div className="bg-gradient-to-br from-[#10B981]/10 to-[#3B82F6]/10 rounded-lg p-5 border border-[#2A2A36]">
          <h4 className="font-semibold text-[#E8E8ED] mb-4 text-sm">Expected Returns</h4>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-[#6B6B7B] mb-1">Breakeven Period</p>
              <p className="text-2xl font-mono font-bold text-[#10B981]">{roi.breakeven}</p>
            </div>
            <div>
              <p className="text-xs text-[#6B6B7B] mb-1">Year One ROI</p>
              <p className="text-3xl font-mono font-bold text-[#3B82F6]">{roi.yearOneROI}</p>
            </div>
            <div className="pt-3 border-t border-[#2A2A36]">
              <p className="text-xs text-[#A0A0B0] leading-relaxed">{roi.competitiveEdge}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing & Tiers */}
      <div className="bg-[#1A1A24] rounded-lg p-5">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-semibold text-[#E8E8ED] text-sm">Investment Range</h4>
          <span className="font-mono text-sm font-semibold text-[#3B82F6]">{service.pricing}</span>
        </div>
        <p className="text-xs text-[#6B6B7B]">Timeline: {service.timeline}</p>

        {service.tiers && service.tiers.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 pt-4 border-t border-[#2A2A36]">
            {service.tiers.map((tier) => (
              <div key={tier.name} className="bg-[#12121A] rounded-lg p-3 text-center">
                <p className="text-xs text-[#6B6B7B] font-medium">{tier.name}</p>
                <p className="text-sm font-mono font-semibold text-[#3B82F6] mt-1">{tier.price}</p>
                <p className="text-xs text-[#6B6B7B] mt-0.5">{tier.hours}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TechStackTab({ service }: { service: EnrichedService }) {
  return (
    <div className="bg-[#1A1A24] rounded-lg p-5">
      <h4 className="font-semibold text-[#E8E8ED] mb-4 text-sm flex items-center gap-2">
        <svg className="w-4 h-4 text-[#8B5CF6]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
        </svg>
        Technology Stack
      </h4>
      <div className="font-mono text-sm text-[#A0A0B0] space-y-2.5">
        {service.enhancements.techStack.map((tech, idx) => (
          <div key={idx} className="flex items-center gap-3">
            <span className="text-[#3B82F6]">
              {idx < service.enhancements.techStack.length - 1 ? '\u251C\u2500\u2500' : '\u2514\u2500\u2500'}
            </span>
            <span>{tech}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TimelineTab({ service }: { service: EnrichedService }) {
  return (
    <div className="relative">
      {service.enhancements.timeline.map((milestone, idx) => (
        <div key={idx} className="flex gap-4 mb-6 last:mb-0">
          <div className="relative flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-[#3B82F6]/20 flex items-center justify-center border border-[#3B82F6]/50 z-10">
              <span className="text-xs font-mono font-bold text-[#3B82F6]">{idx + 1}</span>
            </div>
            {idx < service.enhancements.timeline.length - 1 && (
              <div className="w-px h-full bg-[#3B82F6]/20 absolute top-8" />
            )}
          </div>
          <div className="bg-[#1A1A24] rounded-lg p-4 flex-1">
            <div className="flex items-start justify-between mb-1.5">
              <h4 className="font-semibold text-[#E8E8ED] text-sm">{milestone.phase}</h4>
              <span className="px-2 py-0.5 text-xs bg-[#2A2A36] text-[#A0A0B0] rounded-md font-mono">{milestone.duration}</span>
            </div>
            <p className="text-xs text-[#A0A0B0] leading-relaxed">{milestone.deliverable}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function ExamplesTab({ service }: { service: EnrichedService }) {
  if (!service.examples || service.examples.length === 0) {
    return (
      <p className="text-sm text-[#6B6B7B] text-center py-8">
        Contact us for detailed case studies related to this service.
      </p>
    );
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {service.examples.map((example, i) => (
        <div key={i} className="bg-[#1A1A24] rounded-lg p-5">
          <h4 className="font-semibold text-[#E8E8ED] mb-3 text-sm">{example.name}</h4>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-[#6B6B7B] uppercase tracking-wider font-medium mb-1">Challenge</p>
              <p className="text-xs text-[#A0A0B0] leading-relaxed">{example.problem}</p>
            </div>
            <div>
              <p className="text-xs text-[#6B6B7B] uppercase tracking-wider font-medium mb-1">Solution</p>
              <p className="text-xs text-[#A0A0B0] leading-relaxed">{example.solution}</p>
            </div>
            <div className="pt-3 border-t border-[#2A2A36]">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-[#10B981] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-xs font-medium text-[#10B981]">{example.result}</p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Expanded card with tabs ──────────────────────────────────

function ServiceCardExpanded({ service }: { service: EnrichedService }) {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const tabListRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const currentIndex = tabDefs.findIndex((t) => t.id === activeTab);
      let nextIndex = currentIndex;
      if (e.key === 'ArrowRight') nextIndex = (currentIndex + 1) % tabDefs.length;
      else if (e.key === 'ArrowLeft') nextIndex = (currentIndex - 1 + tabDefs.length) % tabDefs.length;
      else return;
      e.preventDefault();
      setActiveTab(tabDefs[nextIndex].id);
      const nextBtn = tabListRef.current?.querySelector(`[data-tab="${tabDefs[nextIndex].id}"]`) as HTMLButtonElement | null;
      nextBtn?.focus();
    },
    [activeTab]
  );

  return (
    <div
      id={`service-detail-${service.id}`}
      className="bg-[#12121A] border border-[#3B82F6] rounded-xl overflow-hidden shadow-[0_0_20px_rgba(59,130,246,0.15)]"
    >
      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <h3 className="text-xl font-bold text-[#E8E8ED] mb-2">{service.title}</h3>
        <p className="text-sm text-[#A0A0B0] leading-relaxed">{service.description}</p>
      </div>

      {/* Tab bar */}
      <div
        ref={tabListRef}
        role="tablist"
        aria-label={`${service.title} details`}
        className="flex border-b border-[#2A2A36] overflow-x-auto scrollbar-none"
        onKeyDown={handleKeyDown}
      >
        {tabDefs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            data-tab={tab.id}
            aria-selected={activeTab === tab.id}
            aria-controls={`panel-${service.id}-${tab.id}`}
            tabIndex={activeTab === tab.id ? 0 : -1}
            onClick={() => setActiveTab(tab.id)}
            className={`shrink-0 px-5 py-3 text-sm font-medium transition-colors duration-150 border-b-2 ${
              activeTab === tab.id
                ? 'text-[#3B82F6] border-[#3B82F6]'
                : 'text-[#6B6B7B] border-transparent hover:text-[#A0A0B0] hover:border-[#2A2A36]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab panel */}
      <div
        role="tabpanel"
        id={`panel-${service.id}-${activeTab}`}
        aria-labelledby={activeTab}
        className="p-6"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
          >
            {activeTab === 'overview' && <OverviewTab service={service} />}
            {activeTab === 'roi' && <ROITab service={service} />}
            {activeTab === 'tech' && <TechStackTab service={service} />}
            {activeTab === 'timeline' && <TimelineTab service={service} />}
            {activeTab === 'examples' && <ExamplesTab service={service} />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer CTA */}
      <div className="px-6 pb-6 flex items-center gap-4">
        <a
          href={service.cta.href}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#3B82F6] text-white text-sm font-semibold rounded-md hover:bg-[#2563EB] transition-colors duration-150"
        >
          {service.cta.label}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
          </svg>
        </a>
      </div>
    </div>
  );
}

// ── Main grid ────────────────────────────────────────────────

export default function ServiceCardGrid({ services, className = '' }: ServiceCardGridProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const expandedRef = useRef<HTMLDivElement>(null);

  // Handle hash-based deep links
  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash && services.some((s) => s.id === hash)) {
      setExpandedId(hash);
    }

    const onHashChange = () => {
      const h = window.location.hash.replace('#', '');
      if (h && services.some((s) => s.id === h)) {
        setExpandedId(h);
      }
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, [services]);

  // Scroll expanded card into view
  useEffect(() => {
    if (expandedId && expandedRef.current) {
      const timer = setTimeout(() => {
        expandedRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [expandedId]);

  const handleToggle = useCallback(
    (id: string) => {
      setExpandedId((prev) => {
        const next = prev === id ? null : id;
        // Update URL hash without scroll
        if (next) {
          history.replaceState(null, '', `#${next}`);
        } else {
          history.replaceState(null, '', window.location.pathname);
        }
        return next;
      });
    },
    []
  );

  return (
    <div className={className}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((service) => {
          const isExpanded = expandedId === service.id;
          return (
            <div
              key={service.id}
              id={service.id}
              className={isExpanded ? 'col-span-1 md:col-span-2 lg:col-span-3' : ''}
              ref={isExpanded ? expandedRef : undefined}
            >
              {isExpanded ? (
                <div className="space-y-3">
                  <button
                    onClick={() => handleToggle(service.id)}
                    className="flex items-center gap-2 text-sm text-[#6B6B7B] hover:text-[#3B82F6] transition-colors cursor-pointer"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to all services
                  </button>
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <ServiceCardExpanded service={service} />
                  </motion.div>
                </div>
              ) : (
                <ServiceCardCompact
                  service={service}
                  isExpanded={false}
                  onToggle={() => handleToggle(service.id)}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
