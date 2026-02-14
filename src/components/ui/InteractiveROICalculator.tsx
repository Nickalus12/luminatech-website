import { useState, useCallback, useEffect, useRef, type FormEvent } from 'react';

const CONTACT_ENDPOINT = 'https://odoo-worker.nbrewer.workers.dev/api/contact';

interface InteractiveROICalculatorProps {
  className?: string;
}

/* ─── Formatting helpers ─── */
const formatCurrency = (n: number) =>
  '$' + Math.round(n).toLocaleString('en-US');

const formatHours = (n: number) =>
  n >= 1000
    ? `${(n / 1000).toFixed(1)}K`
    : Math.round(n).toLocaleString('en-US');

/* ─── Animated number component ─── */
function AnimatedValue({
  value,
  formatter,
  className = '',
}: {
  value: number;
  formatter: (n: number) => string;
  className?: string;
}) {
  const [display, setDisplay] = useState(value);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef(value);
  const startTimeRef = useRef(0);

  useEffect(() => {
    startRef.current = display;
    startTimeRef.current = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTimeRef.current;
      const duration = 500;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(startRef.current + (value - startRef.current) * eased);
      if (progress < 1) rafRef.current = requestAnimationFrame(animate);
    };

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return <span className={className}>{formatter(display)}</span>;
}

/* ─── Progress bar ─── */
function MetricBar({
  label,
  beforeVal,
  afterVal,
  unit,
  beforeColor = '#EF4444',
  afterColor = '#10B981',
}: {
  label: string;
  beforeVal: number;
  afterVal: number;
  unit: string;
  beforeColor?: string;
  afterColor?: string;
}) {
  const max = Math.max(beforeVal, afterVal, 1);
  const beforePct = (beforeVal / max) * 100;
  const afterPct = (afterVal / max) * 100;

  return (
    <div className="space-y-1.5">
      <div className="text-xs font-medium text-[#A0A0B0]">{label}</div>
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-[#6B6B7B] w-12 shrink-0">Before</span>
          <div className="flex-1 h-3 bg-[#1A1A24] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{ width: `${beforePct}%`, backgroundColor: beforeColor }}
            />
          </div>
          <span className="text-[10px] font-mono text-[#A0A0B0] w-16 text-right shrink-0">
            {beforeVal}
            {unit}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-[#6B6B7B] w-12 shrink-0">After</span>
          <div className="flex-1 h-3 bg-[#1A1A24] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{ width: `${afterPct}%`, backgroundColor: afterColor }}
            />
          </div>
          <span className="text-[10px] font-mono text-[#10B981] w-16 text-right shrink-0">
            {afterVal}
            {unit}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ─── Pain point options ─── */
const PAIN_POINTS = [
  { id: 'manual-orders', label: 'Manual Order Entry', savingsMultiplier: 1.15 },
  { id: 'slow-reports', label: 'Slow Reporting', savingsMultiplier: 1.1 },
  { id: 'inventory-issues', label: 'Inventory Inaccuracy', savingsMultiplier: 1.2 },
  { id: 'shipping-errors', label: 'Shipping Errors', savingsMultiplier: 1.12 },
  { id: 'slow-close', label: 'Slow Month-End Close', savingsMultiplier: 1.08 },
  { id: 'manual-purchasing', label: 'Manual Purchasing', savingsMultiplier: 1.1 },
] as const;

/* ─── Slider component ─── */
function Slider({
  label,
  value,
  min,
  max,
  step,
  displayValue,
  onChange,
  ariaLabel,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  displayValue: string;
  onChange: (v: number) => void;
  ariaLabel: string;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-[#A0A0B0]">{label}</label>
        <span className="font-mono text-sm font-bold text-[#3B82F6]">{displayValue}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step || 1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 rounded-full appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, #3B82F6 ${pct}%, #2A2A36 ${pct}%)`,
        }}
        aria-label={ariaLabel}
      />
    </div>
  );
}

/* ─── Main calculator ─── */
export default function InteractiveROICalculator({
  className = '',
}: InteractiveROICalculatorProps) {
  /* Inputs */
  const [dailyOrders, setDailyOrders] = useState(50);
  const [warehouseStaff, setWarehouseStaff] = useState(8);
  const [orderTime, setOrderTime] = useState(12);
  const [monthlyRevenue, setMonthlyRevenue] = useState(500000);
  const [painPoints, setPainPoints] = useState<Set<string>>(
    new Set(['manual-orders', 'inventory-issues'])
  );

  /* Lead capture */
  const [showCapture, setShowCapture] = useState(false);
  const [captureName, setCaptureName] = useState('');
  const [captureEmail, setCaptureEmail] = useState('');
  const [captureCompany, setCaptureCompany] = useState('');
  const [captureStatus, setCaptureStatus] = useState<
    'idle' | 'submitting' | 'success' | 'error'
  >('idle');

  const togglePain = useCallback((id: string) => {
    setPainPoints((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  /* ─── Real industry calculations ─── */
  const WORKING_DAYS = 260;
  const BLENDED_HOURLY_RATE = 32; // avg warehouse/office rate
  const OPTIMIZED_ORDER_TIME = 3; // minutes after automation
  const AVG_ERROR_COST = 185; // avg cost per shipping/order error
  const CURRENT_ERROR_RATE = 0.035; // 3.5% error rate
  const OPTIMIZED_ERROR_RATE = 0.008; // 0.8% after optimization

  // Pain point multiplier
  const painMultiplier = Array.from(painPoints).reduce((acc, id) => {
    const pt = PAIN_POINTS.find((p) => p.id === id);
    return acc * (pt?.savingsMultiplier ?? 1);
  }, 1);

  // Order processing savings
  const timeSavedPerOrder = Math.max(0, orderTime - OPTIMIZED_ORDER_TIME); // min saved per order
  const annualOrderMinutesSaved = dailyOrders * timeSavedPerOrder * WORKING_DAYS;
  const annualOrderHoursSaved = annualOrderMinutesSaved / 60;
  const orderProcessingSavings = annualOrderHoursSaved * BLENDED_HOURLY_RATE;

  // Error reduction savings
  const currentAnnualErrors = dailyOrders * WORKING_DAYS * CURRENT_ERROR_RATE;
  const optimizedAnnualErrors = dailyOrders * WORKING_DAYS * OPTIMIZED_ERROR_RATE;
  const errorsSaved = currentAnnualErrors - optimizedAnnualErrors;
  const errorReductionSavings = errorsSaved * AVG_ERROR_COST;

  // Inventory carrying cost reduction (industry avg carrying cost = 25% of inventory value)
  const annualRevenue = monthlyRevenue * 12;
  const estimatedInventoryValue = monthlyRevenue * 1.5; // ~1.5 months of revenue in stock
  const carryingCostReduction = estimatedInventoryValue * 0.25 * 0.15; // 15% reduction

  // Warehouse labor efficiency (10-20% improvement in picking/packing)
  const warehouseLaborSavings =
    warehouseStaff * BLENDED_HOURLY_RATE * 2080 * 0.12; // 12% efficiency gain

  // Total savings with pain point multiplier
  const rawAnnualSavings =
    orderProcessingSavings +
    errorReductionSavings +
    carryingCostReduction +
    warehouseLaborSavings;
  const totalAnnualSavings = rawAnnualSavings * painMultiplier;

  // Total hours saved
  const warehouseHoursSaved = warehouseStaff * 2080 * 0.12;
  const totalHoursSaved =
    (annualOrderHoursSaved + warehouseHoursSaved) * painMultiplier;

  // Investment estimate based on complexity
  const complexityFactor = painPoints.size;
  const investmentEstimate =
    7500 + warehouseStaff * 500 + complexityFactor * 2000 + (dailyOrders > 100 ? 3000 : 0);

  // ROI & payback
  const netROI =
    ((totalAnnualSavings - investmentEstimate) / investmentEstimate) * 100;
  const monthlyTotalSavings = totalAnnualSavings / 12;
  const paybackMonths =
    monthlyTotalSavings > 0 ? investmentEstimate / monthlyTotalSavings : 99;

  // Before/after metrics
  const currentInventoryAccuracy = 63;
  const optimizedInventoryAccuracy = 96;
  const currentReportHours = painPoints.has('slow-reports') ? 12 : 6;
  const optimizedReportHours = Math.max(1, Math.round(currentReportHours * 0.15));
  const currentMonthEndDays = painPoints.has('slow-close') ? 10 : 7;
  const optimizedMonthEndDays = Math.max(2, Math.round(currentMonthEndDays * 0.45));

  // Revenue format for slider
  const formatRevSlider = (v: number) => {
    if (v >= 1000000) return `$${(v / 1000000).toFixed(1)}M`;
    return `$${(v / 1000).toFixed(0)}K`;
  };

  const summaryMessage = `ROI Calculator Results:
- Daily Orders: ${dailyOrders}
- Warehouse Staff: ${warehouseStaff}
- Avg Order Time: ${orderTime} min
- Monthly Revenue: ${formatRevSlider(monthlyRevenue)}
- Pain Points: ${Array.from(painPoints).join(', ')}
- Annual Savings: ${formatCurrency(totalAnnualSavings)}
- ROI: ${Math.round(netROI)}%
- Payback: ${paybackMonths.toFixed(1)} months
- Hours Saved/Year: ${Math.round(totalHoursSaved)}`;

  return (
    <div
      className={`bg-[#12121A] border border-[#2A2A36] rounded-xl overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="px-6 py-5 border-b border-[#2A2A36] bg-gradient-to-r from-[#3B82F6]/10 to-[#8B5CF6]/10">
        <h3 className="text-lg font-semibold text-[#E8E8ED]">
          P21 Optimization ROI Calculator
        </h3>
        <p className="text-sm text-[#A0A0B0] mt-1">
          See how much your distribution operation could save with Prophet 21
          optimization
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
        {/* ─── INPUTS PANEL ─── */}
        <div className="p-6 space-y-5 border-b lg:border-b-0 lg:border-r border-[#2A2A36]">
          <Slider
            label="Daily Orders Processed"
            value={dailyOrders}
            min={5}
            max={500}
            step={5}
            displayValue={`${dailyOrders}`}
            onChange={setDailyOrders}
            ariaLabel="Number of daily orders processed"
          />

          <Slider
            label="Warehouse & Office Staff"
            value={warehouseStaff}
            min={2}
            max={50}
            displayValue={`${warehouseStaff}`}
            onChange={setWarehouseStaff}
            ariaLabel="Number of warehouse and office staff"
          />

          <Slider
            label="Avg. Order Processing Time"
            value={orderTime}
            min={3}
            max={20}
            displayValue={`${orderTime} min`}
            onChange={setOrderTime}
            ariaLabel="Average order processing time in minutes"
          />

          <Slider
            label="Monthly Revenue"
            value={monthlyRevenue}
            min={50000}
            max={10000000}
            step={50000}
            displayValue={formatRevSlider(monthlyRevenue)}
            onChange={setMonthlyRevenue}
            ariaLabel="Monthly revenue"
          />

          {/* Pain points */}
          <div>
            <label className="text-sm font-medium text-[#A0A0B0] block mb-2.5">
              Current Pain Points
            </label>
            <div className="flex flex-wrap gap-2">
              {PAIN_POINTS.map((pt) => {
                const active = painPoints.has(pt.id);
                return (
                  <button
                    key={pt.id}
                    type="button"
                    onClick={() => togglePain(pt.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border cursor-pointer ${
                      active
                        ? 'bg-[#3B82F6]/20 border-[#3B82F6]/50 text-[#3B82F6]'
                        : 'bg-[#1A1A24] border-[#2A2A36] text-[#6B6B7B] hover:border-[#3B82F6]/30 hover:text-[#A0A0B0]'
                    }`}
                    aria-pressed={active}
                  >
                    {active && (
                      <svg
                        className="inline-block w-3 h-3 mr-1 -mt-0.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                    {pt.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ─── RESULTS PANEL ─── */}
        <div className="p-6 space-y-5">
          {/* Headline numbers */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#10B981]/10 border border-[#10B981]/20 rounded-lg p-4 text-center">
              <AnimatedValue
                value={totalAnnualSavings}
                formatter={formatCurrency}
                className="font-mono text-2xl font-bold text-[#10B981] block"
              />
              <div className="text-xs text-[#A0A0B0] mt-1">Annual Savings</div>
            </div>
            <div className="bg-[#3B82F6]/10 border border-[#3B82F6]/20 rounded-lg p-4 text-center">
              <AnimatedValue
                value={Math.max(0, netROI)}
                formatter={(n) => `${Math.round(n)}%`}
                className="font-mono text-2xl font-bold text-[#3B82F6] block"
              />
              <div className="text-xs text-[#A0A0B0] mt-1">First-Year ROI</div>
            </div>
          </div>

          {/* Secondary stats */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-[#1A1A24] rounded-lg p-3 text-center">
              <AnimatedValue
                value={totalHoursSaved}
                formatter={(n) => formatHours(n)}
                className="font-mono text-base font-bold text-[#E8E8ED] block"
              />
              <div className="text-[10px] text-[#6B6B7B] mt-0.5">Hours Saved/Yr</div>
            </div>
            <div className="bg-[#1A1A24] rounded-lg p-3 text-center">
              <AnimatedValue
                value={paybackMonths}
                formatter={(n) => (n < 1 ? '< 1 mo' : `${n.toFixed(1)} mo`)}
                className="font-mono text-base font-bold text-[#F59E0B] block"
              />
              <div className="text-[10px] text-[#6B6B7B] mt-0.5">Payback Period</div>
            </div>
            <div className="bg-[#1A1A24] rounded-lg p-3 text-center">
              <AnimatedValue
                value={investmentEstimate}
                formatter={formatCurrency}
                className="font-mono text-base font-bold text-[#E8E8ED] block"
              />
              <div className="text-[10px] text-[#6B6B7B] mt-0.5">Est. Investment</div>
            </div>
          </div>

          {/* Savings breakdown */}
          <div className="space-y-2">
            <div className="text-xs font-medium text-[#6B6B7B] uppercase tracking-wider">
              Savings Breakdown
            </div>
            {[
              { label: 'Order Processing', value: orderProcessingSavings * painMultiplier },
              { label: 'Error Reduction', value: errorReductionSavings * painMultiplier },
              { label: 'Inventory Costs', value: carryingCostReduction * painMultiplier },
              { label: 'Labor Efficiency', value: warehouseLaborSavings * painMultiplier },
            ].map(({ label, value }) => {
              const pct = totalAnnualSavings > 0 ? (value / totalAnnualSavings) * 100 : 0;
              return (
                <div key={label} className="flex items-center gap-3">
                  <span className="text-xs text-[#A0A0B0] w-28 shrink-0">{label}</span>
                  <div className="flex-1 h-2 bg-[#1A1A24] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#3B82F6] transition-all duration-700 ease-out"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="font-mono text-xs text-[#A0A0B0] w-16 text-right shrink-0">
                    {formatCurrency(value)}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Before vs After */}
          <div className="space-y-3 pt-1">
            <div className="text-xs font-medium text-[#6B6B7B] uppercase tracking-wider">
              Before vs After Optimization
            </div>
            <MetricBar
              label="Order Processing Time"
              beforeVal={orderTime}
              afterVal={OPTIMIZED_ORDER_TIME}
              unit=" min"
            />
            <MetricBar
              label="Inventory Accuracy"
              beforeVal={currentInventoryAccuracy}
              afterVal={optimizedInventoryAccuracy}
              unit="%"
              beforeColor="#F59E0B"
              afterColor="#10B981"
            />
            <MetricBar
              label="Report Generation"
              beforeVal={currentReportHours}
              afterVal={optimizedReportHours}
              unit=" hrs"
            />
            <MetricBar
              label="Month-End Close"
              beforeVal={currentMonthEndDays}
              afterVal={optimizedMonthEndDays}
              unit=" days"
            />
          </div>

          {/* CTA / Lead capture */}
          {!showCapture ? (
            <button
              onClick={() => setShowCapture(true)}
              className="block w-full text-center px-6 py-3 bg-[#3B82F6] text-white text-sm font-semibold rounded-lg hover:bg-[#2563EB] transition-colors duration-200 cursor-pointer"
            >
              Get Your Custom ROI Analysis
            </button>
          ) : captureStatus === 'success' ? (
            <div className="text-center py-3">
              <div className="flex items-center justify-center gap-2 text-[#10B981] text-sm font-semibold mb-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                Sent! We'll be in touch soon.
              </div>
              <p className="text-xs text-[#6B6B7B]">
                Check your inbox for your personalized ROI report.
              </p>
            </div>
          ) : (
            <form
              onSubmit={async (e: FormEvent) => {
                e.preventDefault();
                if (!captureEmail || !captureName || !captureCompany) return;
                setCaptureStatus('submitting');
                try {
                  const res = await fetch(CONTACT_ENDPOINT, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      name: captureName,
                      company: captureCompany,
                      email: captureEmail,
                      helpType: 'ROI Analysis',
                      message: summaryMessage,
                      source: 'roi-calculator',
                      sourcePage:
                        typeof window !== 'undefined'
                          ? window.location.pathname
                          : '/services',
                    }),
                  });
                  const result = await res.json();
                  setCaptureStatus(result.success ? 'success' : 'error');
                } catch {
                  setCaptureStatus('error');
                }
              }}
              className="space-y-2"
            >
              <input
                type="text"
                placeholder="Your name"
                value={captureName}
                onChange={(e) => setCaptureName(e.target.value)}
                required
                className="w-full bg-[#1A1A24] border border-[#2A2A36] rounded-lg px-3 py-2 text-sm text-[#E8E8ED] placeholder-[#6B6B7B] focus:outline-none focus:border-[#3B82F6]"
              />
              <input
                type="email"
                placeholder="you@company.com"
                value={captureEmail}
                onChange={(e) => setCaptureEmail(e.target.value)}
                required
                className="w-full bg-[#1A1A24] border border-[#2A2A36] rounded-lg px-3 py-2 text-sm text-[#E8E8ED] placeholder-[#6B6B7B] focus:outline-none focus:border-[#3B82F6]"
              />
              <input
                type="text"
                placeholder="Company name"
                value={captureCompany}
                onChange={(e) => setCaptureCompany(e.target.value)}
                required
                className="w-full bg-[#1A1A24] border border-[#2A2A36] rounded-lg px-3 py-2 text-sm text-[#E8E8ED] placeholder-[#6B6B7B] focus:outline-none focus:border-[#3B82F6]"
              />
              <button
                type="submit"
                disabled={captureStatus === 'submitting'}
                className="w-full px-6 py-2.5 bg-[#3B82F6] text-white text-sm font-semibold rounded-lg hover:bg-[#2563EB] transition-colors duration-200 disabled:opacity-50 cursor-pointer"
              >
                {captureStatus === 'submitting'
                  ? 'Sending...'
                  : 'Send My ROI Report'}
              </button>
              {captureStatus === 'error' && (
                <p className="text-xs text-red-400 text-center">
                  Something went wrong. Try again.
                </p>
              )}
              <p className="text-xs text-[#6B6B7B] text-center">
                No spam. We'll send your personalized analysis.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
