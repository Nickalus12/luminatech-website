# Services Page Redesign Specification
## Interactive-First, Progressive Disclosure Architecture

**Version:** 1.0
**Date:** 2026-02-12
**Author:** UX Research Team
**Status:** Ready for Implementation

---

## Executive Summary

The current services page suffers from information overload: each of the 6 services exposes 8+ subsections (ROI, tech stack, timeline, risks, before/after, competitive advantages, examples) simultaneously, producing a scroll depth exceeding 15,000px. Users must wade through walls of content before reaching the interactive ROI calculator, which is buried near the page bottom.

This redesign restructures the page around three principles:
1. **Lead with value** -- the ROI calculator moves to hero position
2. **Progressive disclosure** -- service details hide behind expandable cards with tabbed subsections
3. **Guided discovery** -- the Service Selector quiz helps prospects self-qualify

---

## Page Architecture Overview

```
+----------------------------------------------------------+
| HERO SECTION                                              |
|   Headline + Subheadline + Trust Metrics Bar              |
|   [Interactive ROI Calculator - HERO POSITION]            |
+----------------------------------------------------------+
| SERVICE SELECTOR QUIZ (optional, collapsible)             |
|   "Not sure what you need?" -> 5-question guided flow     |
+----------------------------------------------------------+
| STICKY ANCHOR NAV                                         |
|   [Extensions] [Integrations] [Database] [Warehouse] ...  |
+----------------------------------------------------------+
| SERVICE CARDS GRID (collapsed by default)                 |
|   +-------------------+  +-------------------+            |
|   | Service Card 1    |  | Service Card 2    |            |
|   | Icon + Title      |  | Icon + Title      |            |
|   | 1-line desc       |  | 1-line desc       |            |
|   | Key metric badge  |  | Key metric badge  |            |
|   | [Learn More ->]   |  | [Learn More ->]   |            |
|   +-------------------+  +-------------------+            |
|                                                           |
| EXPANDED SERVICE DETAIL (when card clicked)               |
|   +-----------------------------------------------+      |
|   | Service Title + Description                    |      |
|   | [Overview] [ROI] [Tech] [Timeline] [Examples]  | TABS |
|   |                                                |      |
|   | Tab content renders here                       |      |
|   | (only active tab visible)                      |      |
|   |                                                |      |
|   | [Get Quote ->]  [Back to Services]             |      |
|   +-----------------------------------------------+      |
+----------------------------------------------------------+
| CLOUD MIGRATION SPOTLIGHT                                 |
+----------------------------------------------------------+
| RETAINER PRICING TIERS                                    |
+----------------------------------------------------------+
| PROCESS STEPS                                             |
+----------------------------------------------------------+
| BOTTOM CTA                                                |
+----------------------------------------------------------+
```

---

## Section 1: Hero with ROI Calculator

### Design Intent
Move the ROI calculator to the most prominent position on the page. B2B buyers want to see ROI numbers before reading service descriptions. This follows Stripe's pattern of leading with value demonstration.

### Layout

```
+----------------------------------------------------------+
|                                                           |
|  Prophet 21 Expertise That Delivers Results               |  <- H1
|  Production-tested P21 solutions backed by real code...   |  <- Subheadline
|                                                           |
|  +------+  +------+  +------+                             |
|  | 150x |  | 280K |  | 140x |   <- Animated Counters     |
|  | Perf |  | Ops  |  | APIs |      (scroll-triggered)     |
|  +------+  +------+  +------+                             |
|                                                           |
|  +--------------------------------------------------+    |
|  |  ROI CALCULATOR (full width, embedded)            |    |
|  |  [Employees] [Hours Saved] [Hourly Rate]          |    |
|  |  Annual Savings: $XXX,XXX  |  ROI: XXX%           |    |
|  |  [Get Your Custom Analysis ->]                    |    |
|  +--------------------------------------------------+    |
|                                                           |
+----------------------------------------------------------+
```

### Component: `ServicesHero.astro`

**Structure:**
- Background: `base` with subtle gradient overlay (from-accent-primary/5 to-accent-violet/5)
- Padding: `pt-28 md:pt-32 pb-8`
- Content: max-w-4xl centered
- Metrics bar: 3-column grid using `AnimatedCounter.tsx` (already exists)
- ROI Calculator: `InteractiveROICalculator.tsx` (already exists, use `client:visible`)
- Below the calculator: subtle text "Scroll down to explore our services or take our quick quiz"

### Accessibility
- H1 for headline
- `aria-live="polite"` on animated counters
- ROI calculator already has aria-labels on sliders
- Respect `prefers-reduced-motion` for counters

---

## Section 2: Service Selector Quiz

### Design Intent
The Service Selector (spec: `service-selector-spec.md`) guides prospects who don't know which service they need. It appears as a collapsible section between the hero and service cards, defaulting to collapsed with a prominent "Not sure where to start?" trigger.

### Layout

```
+----------------------------------------------------------+
| [?] Not sure which service you need?                      |
|     Take our 2-minute quiz -> [Start Quiz]                |
+----------------------------------------------------------+

-- When expanded: --

+----------------------------------------------------------+
| SERVICE SELECTOR                                          |
| Step 2 of 5                                               |
| [========----------] 40%                                  |
|                                                           |
| What's your company size?                                 |
|                                                           |
| +---------------------+  +---------------------+         |
| | [icon] Small        |  | [icon] Medium       |         |
| | 1-20 users          |  | 21-100 users        |         |
| +---------------------+  +---------------------+         |
| +---------------------+  +---------------------+         |
| | [icon] Large        |  | [icon] Enterprise   |         |
| | 100+ users          |  | 500+ users          |         |
| +---------------------+  +---------------------+         |
|                                                           |
| [<- Back]                              [Next ->]          |
+----------------------------------------------------------+
```

### Component: `ServiceSelectorQuiz.tsx` (React, `client:visible`)

**Props:**
```typescript
interface ServiceSelectorQuizProps {
  onComplete?: (recommendation: RecommendationResult) => void;
  className?: string;
}
```

**State:**
```typescript
interface QuizState {
  isOpen: boolean;
  currentStep: number;
  answers: Record<string, string>;
  showResults: boolean;
  recommendation: RecommendationResult | null;
}
```

**Behavior:**
- Default: collapsed, showing only the trigger banner
- Click "Start Quiz" -> expands with smooth height animation
- 5 questions, each rendered as a card with radio-button option tiles
- Progress bar with step counter
- "Back" button on steps 2-5
- After step 5: recommendation engine runs (from service-selector-spec.md scoring logic)
- Results: primary recommendation card with "View Service Details" button that scrolls to the expanded service card
- "Retake Quiz" option

**Responsive:**
- Desktop: 2-column option grid (800px max width)
- Mobile: single column stacked options

**Animation:**
- Step transitions: horizontal slide (Framer Motion `AnimatePresence`)
- Progress bar: smooth width transition
- Results reveal: fade-in with slight upward translation

### Data Source
Use the question definitions and scoring algorithm from `service-selector-spec.md` (already documented in detail). Simplify the service catalog to reference the 6 services in `copy.ts`.

---

## Section 3: Sticky Anchor Navigation

### Design Intent
Retained from current design but visually refined. Provides persistent one-click access to any service section.

### Changes from Current
- Add active indicator: pill background with `bg-accent-primary text-white` (current implementation already does this)
- Add subtle scroll shadow when stuck
- On mobile: horizontally scrollable with snap points and gradient fade indicators on edges

### Component: Keep existing inline implementation in `services.astro`

---

## Section 4: Service Cards Grid (Progressive Disclosure)

### Design Intent
This is the core UX improvement. Instead of rendering all 8+ subsections for all 6 services simultaneously, each service is displayed as a compact card. Clicking a card expands it into a detailed view with tabbed subsections.

### Collapsed State (Default)

```
+----------------------------------------------------------+
| SERVICE CARDS                                             |
|                                                           |
| +--------------+ +--------------+ +--------------+       |
| | [dev icon]   | | [link icon]  | | [chart icon] |       |
| |              | |              | |              |       |
| | Extensions & | | API          | | Database     |       |
| | DynaChange   | | Integrations | | Optimization |       |
| |              | |              | |              |       |
| | Custom P21   | | Connect P21  | | 10x faster   |       |
| | business     | | to any API   | | reports      |       |
| | rules...     | | ...          | | ...          |       |
| |              | |              | |              |       |
| | ROI: 365%    | | ROI: 210%   | | ROI: 259%    |       |
| | 1-4 weeks    | | 1-3 weeks   | | 3-5 days     |       |
| |              | |              | |              |       |
| | [Explore ->] | | [Explore ->] | | [Explore ->] |       |
| +--------------+ +--------------+ +--------------+       |
|                                                           |
| +--------------+ +--------------+ +--------------+       |
| | Warehouse    | | Custom       | | System       |       |
| | Automation   | | Portals      | | Support      |       |
| | ...          | | ...          | | ...          |       |
| +--------------+ +--------------+ +--------------+       |
+----------------------------------------------------------+
```

### Card Content (Collapsed)
- Service icon (48x48, from existing `iconPaths`)
- Service title (H3)
- Short description (2 lines max, truncated from `service.description`)
- Key ROI badge (e.g., "Year-1 ROI: 365%")
- Timeline badge (e.g., "1-4 weeks")
- CTA button: "Explore" or "Learn More"

### Expanded State (After Click)

When a user clicks a card, it expands inline (pushes other cards down) revealing the tabbed detail view. Other cards remain visible but dimmed slightly. The expanded card gets a `scroll-into-view` animation.

```
+----------------------------------------------------------+
| P21 Extensions & DynaChange Development                   |
| Custom P21 business rules that automate workflows...      |
|                                                           |
| [Overview] [ROI & Pricing] [Tech Stack] [Timeline] [Examples]
| ~~~~~~~~                                                  |
|                                                           |
| +------------------------------------------------------+ |
| | OVERVIEW TAB                                          | |
| |                                                       | |
| | What's Included:                                      | |
| | [check] C# .NET business rules                       | |
| | [check] P21 Transaction API v2 integration            | |
| | [check] Custom database tables                        | |
| | ...                                                   | |
| |                                                       | |
| | Complexity: [====.] 4/5                               | |
| | Factors: C# development | SDK | Testing | Regression  | |
| |                                                       | |
| | Before/After Comparison:                              | |
| | +-- Before --+  +-- After ---+                       | |
| | | 200 orders |  | 100% auto  |                       | |
| | | manual/mo  |  | validated  |                       | |
| | +------------+  +------------+                       | |
| +------------------------------------------------------+ |
|                                                           |
| [Request Development Quote ->]  [Collapse]                |
+----------------------------------------------------------+
```

### Tab Definitions per Service

Each expanded service card has these tabs:

| Tab | Content | Data Source |
|-----|---------|-------------|
| **Overview** | Includes list, complexity rating, before/after comparison, competitive advantages | `service.includes`, `serviceEnhancements.complexity`, `serviceEnhancements.comparison`, `serviceEnhancements.advantages` |
| **ROI & Pricing** | ROI assumptions, calculation, breakeven, year-1 ROI, pricing tiers, competitive edge | `serviceEnhancements.roiModel`, `service.pricing`, `service.tiers` |
| **Tech Stack** | Technology list with visual tree diagram | `serviceEnhancements.techStack` |
| **Timeline** | Milestone phases with numbered steps | `serviceEnhancements.timeline` |
| **Examples** | Case study cards (challenge/solution/result) | `service.examples` |

The **Risk Assessment** currently shown for each service can be merged into the Overview tab as a collapsible "Risk & Mitigation" accordion item, since it's a secondary concern for most visitors.

### Component: `ServiceCardGrid.tsx` (React, `client:visible`)

**Props:**
```typescript
interface ServiceCardGridProps {
  services: ServiceItem[];
  enhancements: Record<string, ServiceEnhancement>;
}
```

**State:**
```typescript
interface GridState {
  expandedServiceId: string | null;
  activeTab: string; // 'overview' | 'roi' | 'tech' | 'timeline' | 'examples'
}
```

**Sub-components:**
- `ServiceCardCompact` -- the collapsed card
- `ServiceCardExpanded` -- the expanded detail view
- `ServiceDetailTabs` -- tab bar + tab content router

### Component: `ServiceDetailTabs.tsx`

```typescript
interface ServiceDetailTabsProps {
  service: ServiceItem;
  enhancement: ServiceEnhancement;
  activeTab: string;
  onTabChange: (tab: string) => void;
}
```

**Tab Bar:**
- Horizontal scrollable on mobile
- Active tab: border-bottom with accent-primary, font-semibold
- Inactive tabs: text-text-secondary, hover:text-text-primary
- Keyboard navigable: arrow keys switch tabs, ARIA roles: `tablist`, `tab`, `tabpanel`

---

## Section 5: Cloud Migration Spotlight

### Design Intent
Retain as-is. This is a high-impact section that works well. Minor refinements:
- Add a subtle urgency animation (pulsing dot on the "Active Support Ends" timeline item)
- Ensure it contrasts with the card grid above

### Component: Keep inline in `services.astro`

---

## Section 6: Retainer Pricing Tiers

### Design Intent
Retain the 4-column pricing grid. Minor refinements:
- Add toggle for monthly/annual pricing view (annual = 10% discount)
- "Most Popular" badge on Standard tier (already exists)
- On mobile: horizontal scroll/swipe or accordion

### Component: Keep inline in `services.astro` or extract to `RetainerPricing.astro`

---

## Section 7: Process Steps

### Design Intent
Retain as-is. The 4-step process section is clean and effective.

### Component: Keep inline in `services.astro`

---

## Section 8: Bottom CTA

### Design Intent
Retain as-is. Full-width gradient background with compelling CTA.

---

## Component Hierarchy

```
services.astro
|
+-- ServicesHero (Section)
|   +-- AnimatedCounter.tsx (client:visible)  [exists]
|   +-- InteractiveROICalculator.tsx (client:visible)  [exists]
|
+-- ServiceSelectorQuiz.tsx (client:visible)  [NEW]
|   +-- QuizProgressBar
|   +-- QuestionCard
|   +-- QuizResults
|
+-- StickyAnchorNav (inline)
|
+-- ServiceCardGrid.tsx (client:visible)  [NEW]
|   +-- ServiceCardCompact  [NEW]
|   +-- ServiceCardExpanded  [NEW]
|       +-- ServiceDetailTabs  [NEW]
|           +-- OverviewTab
|           +-- ROITab
|           +-- TechStackTab
|           +-- TimelineTab
|           +-- ExamplesTab
|
+-- CloudMigrationSpotlight (inline, existing)
|
+-- RetainerPricing (inline, existing)
|
+-- ProcessSteps (inline, existing)
|
+-- BottomCTA (inline, existing)
```

### New Components Required

| Component | Type | Hydration | Est. Size |
|-----------|------|-----------|-----------|
| `ServiceSelectorQuiz.tsx` | React | `client:visible` | ~300 lines |
| `ServiceCardGrid.tsx` | React | `client:visible` | ~150 lines |
| `ServiceCardCompact.tsx` | React | (child) | ~80 lines |
| `ServiceCardExpanded.tsx` | React | (child) | ~100 lines |
| `ServiceDetailTabs.tsx` | React | (child) | ~250 lines |

### Existing Components Reused
- `InteractiveROICalculator.tsx` -- hero position
- `AnimatedCounter.tsx` -- trust metrics bar
- `BeforeAfterSlider.tsx` -- inside Overview tab
- `Section.astro`, `Container.astro`, `Card.astro`, `Button.astro`, `Badge.astro` -- layout primitives

---

## Interactive Patterns

### 1. Progressive Disclosure (Service Cards)

**Pattern:** Cards collapsed by default. Click to expand.

**Implementation:**
```tsx
// Simplified example
const [expanded, setExpanded] = useState<string | null>(null);

// Framer Motion for smooth expand/collapse
<AnimatePresence>
  {expanded === service.id && (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      <ServiceCardExpanded ... />
    </motion.div>
  )}
</AnimatePresence>
```

**Why:** Reduces initial scroll depth by ~80%. Users choose which services to explore. Information density is managed per-interaction rather than per-page-load.

### 2. Tabs (Service Detail Subsections)

**Pattern:** 5 horizontal tabs inside expanded card.

**Implementation:**
```tsx
const tabs = ['overview', 'roi', 'tech', 'timeline', 'examples'];
const [activeTab, setActiveTab] = useState('overview');

<div role="tablist" aria-label="Service details">
  {tabs.map(tab => (
    <button
      key={tab}
      role="tab"
      aria-selected={activeTab === tab}
      aria-controls={`panel-${tab}`}
      onClick={() => setActiveTab(tab)}
    >
      {tab}
    </button>
  ))}
</div>

<div role="tabpanel" id={`panel-${activeTab}`}>
  {/* Render active tab content */}
</div>
```

**Why:** Tabs prevent vertical overwhelm within each service. Users navigate to the specific information they need (ROI-focused buyers go straight to the ROI tab, technical evaluators go to Tech Stack).

### 3. Collapsible Quiz (Service Selector)

**Pattern:** Banner trigger -> expands into multi-step quiz.

**Why:** Serves the "Not Sure" persona identified in the service-selector-spec. Provides guided discovery without forcing all visitors through it.

### 4. Animated Counters (Trust Metrics)

**Pattern:** Numbers animate from 0 to target value on scroll-into-view.

**Implementation:** Reuse existing `AnimatedCounter.tsx` with `whileInView` trigger.

### 5. Risk Assessment Accordion

**Pattern:** Inside the Overview tab, risk assessment is a collapsible accordion item.

```tsx
<details className="group">
  <summary className="cursor-pointer flex items-center justify-between py-3">
    <span>Risk Assessment & Mitigation</span>
    <ChevronIcon className="group-open:rotate-180 transition-transform" />
  </summary>
  <div className="pb-4">
    {/* Low / Medium / High risk cards + Mitigation */}
  </div>
</details>
```

**Why:** Risk information is important but secondary. Hiding it by default keeps the Overview tab scannable.

---

## Mobile Layout Strategy

### Breakpoints
- **Desktop:** >= 1024px -- 3-column card grid, side-by-side layouts
- **Tablet:** 768px - 1023px -- 2-column card grid, stacked expanded view
- **Mobile:** < 768px -- single-column everything

### Mobile-Specific Behaviors

| Section | Desktop | Mobile |
|---------|---------|--------|
| Hero | 3-column metrics + full calc | Stacked metrics, full-width calc |
| Service Selector Quiz | 2-column option grid | Single column options |
| Anchor Nav | All items visible | Horizontal scroll with fade edges |
| Service Cards | 3-column grid | Single column stack |
| Expanded Card Tabs | Horizontal tab bar | Horizontal scroll tabs with active indicator |
| Retainer Pricing | 4-column grid | Horizontal swipe carousel or vertical stack |
| Process Steps | 4-column grid | Vertical timeline |

### Touch Interactions
- Service cards: tap to expand (no hover state dependency)
- Tabs: swipe left/right between tabs (optional enhancement)
- ROI calculator sliders: touch-friendly (existing implementation handles this)
- Quiz options: large tap targets (min 48x48px touch areas)

### Performance on Mobile
- All React components use `client:visible` (only hydrate when scrolled into view)
- Images lazy-loaded
- No GSAP on mobile (use CSS-only animations when `prefers-reduced-motion` is not set)

---

## Accessibility Considerations

### WCAG 2.1 AA Compliance

| Pattern | Requirement | Implementation |
|---------|-------------|----------------|
| Service Cards | Keyboard expand/collapse | `Enter` or `Space` on card triggers expansion |
| Tabs | ARIA tab pattern | `role="tablist"`, `role="tab"`, `role="tabpanel"`, `aria-selected`, arrow key navigation |
| Quiz | Form accessibility | Radio group pattern with `fieldset`/`legend`, keyboard navigation |
| Counters | Screen reader | `aria-live="polite"`, `aria-label` with final value |
| Accordions | Disclosure pattern | Native `<details>/<summary>` elements (built-in a11y) |
| Anchors | Skip links | Add "Skip to services" link for keyboard users |
| Color | Contrast ratios | All text meets 4.5:1 minimum (already verified in design system) |
| Motion | Reduced motion | Wrap animations in `prefers-reduced-motion` media query |

### Focus Management
- When card expands: focus moves to the expanded card heading
- When card collapses: focus returns to the card trigger
- Tab selection: focus moves to the active tab panel
- Quiz navigation: focus moves to the next question heading

---

## Data Flow

### Where Service Data Lives

**Current:** All data is defined inline in `services.astro` (frontmatter) using objects like `roiModels`, `complexityRatings`, `techStacks`, etc., plus imports from `copy.ts` for the `services.items` array.

**Proposed:** Keep the data in the same locations but pass it as serialized props to the React components:

```astro
---
import ServiceCardGrid from '../components/ui/ServiceCardGrid';
import { services } from '../content/copy';
// ... import enhancement data (already in frontmatter)

const serializedServices = services.items.map(service => ({
  ...service,
  enhancements: serviceEnhancements[service.id],
}));
---

<ServiceCardGrid
  client:visible
  services={serializedServices}
/>
```

This avoids creating a new data layer while keeping the React components purely presentational.

---

## Scroll & Navigation Behavior

### Anchor Nav -> Service Card
When a user clicks an anchor (e.g., "#extensions"), the page scrolls to the service card **and expands it** with the Overview tab active. This is handled by:

1. URL hash detection on mount
2. Setting `expandedServiceId` to the hash value
3. Scrolling to the expanded card with `scrollIntoView({ behavior: 'smooth' })`

### Quiz Result -> Service Card
When the quiz produces a recommendation, clicking "View Service Details" in the results:
1. Closes the quiz section
2. Sets `expandedServiceId` to the recommended service
3. Scrolls to the expanded card

### Deep Linking
Support URLs like `/services#extensions` which auto-expand that service on page load.

---

## Animation Specifications

### Entry Animations (Framer Motion)

| Element | Animation | Trigger | Duration |
|---------|-----------|---------|----------|
| Trust metrics | `opacity: 0->1, y: 20->0` | `whileInView` | 0.6s, stagger 0.1s |
| ROI Calculator | `opacity: 0->1, y: 30->0` | `whileInView` | 0.8s |
| Service cards | `opacity: 0->1, scale: 0.95->1` | `whileInView` | 0.5s, stagger 0.08s |
| Card expansion | `height: 0->auto, opacity: 0->1` | Click trigger | 0.35s |
| Tab switch | Fade crossfade | Tab click | 0.2s |
| Quiz step | Horizontal slide | Step navigation | 0.3s |

### Reduced Motion
When `prefers-reduced-motion: reduce` is active:
- All animations resolve to instant transitions
- Counters display final value immediately
- Card expansion uses no height animation (just visibility toggle)

---

## Performance Budget

| Metric | Target | Strategy |
|--------|--------|----------|
| LCP | < 2.5s | Hero content is static Astro, calculator hydrates visibly |
| FID | < 100ms | `client:visible` delays hydration until needed |
| CLS | < 0.1 | Fixed card heights before expansion, reserved space for calc |
| JS Bundle (new) | < 25KB gzipped | Service card grid + tabs, tree-shake Framer Motion |
| Total JS | < 80KB gzipped | Including existing calculator + counter |

### Code Splitting Strategy
- `ServiceSelectorQuiz.tsx` -- separate chunk, loaded only when quiz is triggered
- `ServiceCardGrid.tsx` -- single chunk with all tab content (tabs are lightweight)
- `InteractiveROICalculator.tsx` -- existing chunk, unchanged

---

## Implementation Priority

### Phase 1: Core Restructure (Recommended First)
1. Restructure `services.astro` to use the new section order (Hero with calc, grid, etc.)
2. Build `ServiceCardGrid.tsx` with collapse/expand behavior
3. Build `ServiceDetailTabs.tsx` with the 5 tab panels
4. Move ROI calculator to hero position
5. Add deep-link support (hash detection)

### Phase 2: Service Selector Quiz
1. Build `ServiceSelectorQuiz.tsx` with the 5-question flow
2. Implement scoring algorithm (simplified from service-selector-spec.md)
3. Connect quiz results to card expansion

### Phase 3: Polish & Animation
1. Add Framer Motion animations to card transitions
2. Implement animated counters in hero
3. Add reduced-motion support
4. Mobile touch gesture support for tabs

---

## Visual Design Notes

### Color Palette (from existing design system)
- **Primary accent:** `--color-accent-primary` (blue)
- **Success:** `--color-accent-success` (green) -- for ROI/savings metrics
- **Warning:** `--color-accent-warning` (amber) -- for timeline urgency
- **Error:** `--color-accent-error` (red) -- for "Before" states
- **Violet:** `--color-accent-violet` -- for tech stack sections

### Card Design
- Background: `bg-bg-surface-1`
- Border: `border-border`, `hover:border-accent-primary/50`
- Expanded: `border-accent-primary shadow-glow` (similar to "Most Popular" pricing tier)
- Border radius: `rounded-xl` (consistent with existing cards)

### Tab Bar Design
- Container: `border-b border-border`
- Active tab: `text-accent-primary border-b-2 border-accent-primary font-semibold`
- Inactive tab: `text-text-secondary hover:text-text-primary`
- Tab padding: `px-4 py-3`

### Service Card Badges (New)
Each collapsed card shows a "key metric" badge to differentiate services at a glance:

| Service | Badge Text | Badge Color |
|---------|-----------|-------------|
| Extensions | "Year-1 ROI: 365%" | accent-success |
| Integrations | "150x Faster" | accent-primary |
| Database | "10-15x Query Speed" | accent-primary |
| Warehouse | "Year-1 ROI: 398%" | accent-success |
| Portals | "8x Faster Quotes" | accent-primary |
| Support | "From $625/mo" | accent-violet |

---

## Measurement & Success Criteria

### KPIs to Track
1. **Scroll depth improvement:** Target 40%+ of visitors reaching the bottom (vs. current estimated 15-20%)
2. **Service card expansion rate:** Target 60%+ of visitors expanding at least one card
3. **Tab engagement:** Track which tabs are most viewed per service (informs content prioritization)
4. **Quiz completion rate:** Target 50%+ of quiz starters completing all 5 questions
5. **CTA click rate:** Target 8%+ on "Get Quote" / "Schedule Consultation" buttons
6. **Time on page:** Target 2-4 minutes (currently likely 30-60 seconds due to bounce from overload)

### Analytics Events
- `service_card_expanded` (service_id)
- `service_tab_viewed` (service_id, tab_name)
- `quiz_started`
- `quiz_step_completed` (step_number, answer)
- `quiz_completed` (recommended_service)
- `roi_calculator_interacted`
- `cta_clicked` (service_id, cta_type)

---

## Comparison: Current vs. Redesigned

| Aspect | Current | Redesigned |
|--------|---------|------------|
| Initial scroll depth | ~15,000px | ~3,000px |
| Information visible on load | Everything for all 6 services | Card summaries only |
| ROI calculator position | Bottom of page | Hero section |
| Service discovery | Scroll-and-scan | Quiz + cards + anchor nav |
| Tab-based content | None | 5 tabs per service |
| Mobile experience | Endless scroll | Compact cards, expandable |
| Time to first meaningful interaction | ~30 seconds of scrolling | Immediate (ROI calc in hero) |
| Keyboard navigation | Limited | Full ARIA tab/card patterns |

---

## References

- **Service Selector Spec:** `docs/service-selector-spec.md`
- **Data Visualization Patterns:** `docs/data-viz-patterns.md`
- **ROI Models:** `docs/roi-models.md`
- **Service Pages Plan:** `docs/service-pages-plan.md`
- **Market Analysis:** `docs/market-analysis.md`
- **Current Services Page:** `src/pages/services.astro`
- **Copy Data:** `src/content/copy.ts`

### External Inspiration
- Linear: Lean visuals, keyboard-first interactions, progressive disclosure
- Stripe: Clean accordion UI, generous spacing, animated metrics
- Vercel: Speed-focused design, edge-aware patterns
- B2B SaaS best practices: Committee-aware content (ROI for finance, tech specs for evaluators)

---

*End of Specification*
