import { useState, useCallback, type FormEvent } from 'react';

const CONTACT_ENDPOINT = 'https://odoo-worker.nbrewer.workers.dev/api/contact';

interface InteractiveROICalculatorProps {
  className?: string;
}

const formatCurrency = (n: number) =>
  '$' + Math.round(n).toLocaleString('en-US');

const formatPercent = (n: number) => Math.round(n) + '%';

export default function InteractiveROICalculator({ className = '' }: InteractiveROICalculatorProps) {
  const [employees, setEmployees] = useState(10);
  const [hoursSaved, setHoursSaved] = useState(20);
  const [hourlyRate, setHourlyRate] = useState(35);
  const [showCapture, setShowCapture] = useState(false);
  const [captureEmail, setCaptureEmail] = useState('');
  const [captureName, setCaptureName] = useState('');
  const [captureCompany, setCaptureCompany] = useState('');
  const [captureStatus, setCaptureStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const monthlyLaborSavings = employees * hoursSaved * hourlyRate;
  const annualLaborSavings = monthlyLaborSavings * 12;
  const monthlyErrorSavings = employees * 3 * 150; // est. 3 errors/mo @ $150 ea
  const annualErrorSavings = monthlyErrorSavings * 12;
  const totalAnnualSavings = annualLaborSavings + annualErrorSavings;
  const investmentEstimate = Math.max(5000, employees * 1200);
  const netROI = ((totalAnnualSavings - investmentEstimate) / investmentEstimate) * 100;
  const breakeven = investmentEstimate / (monthlyLaborSavings + monthlyErrorSavings);

  const handleSlider = useCallback(
    (setter: (v: number) => void) =>
      (e: React.ChangeEvent<HTMLInputElement>) =>
        setter(Number(e.target.value)),
    []
  );

  return (
    <div className={`bg-[#12121A] border border-[#2A2A36] rounded-xl overflow-hidden ${className}`}>
      {/* Header */}
      <div className="px-6 py-5 border-b border-[#2A2A36] bg-gradient-to-r from-[#3B82F6]/10 to-[#8B5CF6]/10">
        <h3 className="text-lg font-semibold text-[#E8E8ED]">ROI Calculator</h3>
        <p className="text-sm text-[#A0A0B0] mt-1">
          Estimate your potential savings with P21 automation
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-0">
        {/* Inputs */}
        <div className="p-6 space-y-6 border-b lg:border-b-0 lg:border-r border-[#2A2A36]">
          {/* Employees */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-[#A0A0B0]">
                Employees Affected
              </label>
              <span className="font-mono text-sm font-bold text-[#3B82F6]">
                {employees}
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="100"
              value={employees}
              onChange={handleSlider(setEmployees)}
              className="w-full h-2 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #3B82F6 ${employees}%, #2A2A36 ${employees}%)`,
              }}
              aria-label="Number of employees affected"
            />
            <div className="flex justify-between text-xs text-[#6B6B7B] mt-1">
              <span>1</span>
              <span>100</span>
            </div>
          </div>

          {/* Hours Saved */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-[#A0A0B0]">
                Hours Saved / Month (per person)
              </label>
              <span className="font-mono text-sm font-bold text-[#3B82F6]">
                {hoursSaved}h
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="80"
              value={hoursSaved}
              onChange={handleSlider(setHoursSaved)}
              className="w-full h-2 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #3B82F6 ${(hoursSaved / 80) * 100}%, #2A2A36 ${(hoursSaved / 80) * 100}%)`,
              }}
              aria-label="Hours saved per month per person"
            />
            <div className="flex justify-between text-xs text-[#6B6B7B] mt-1">
              <span>1h</span>
              <span>80h</span>
            </div>
          </div>

          {/* Hourly Rate */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-[#A0A0B0]">
                Average Hourly Rate
              </label>
              <span className="font-mono text-sm font-bold text-[#3B82F6]">
                ${hourlyRate}
              </span>
            </div>
            <input
              type="range"
              min="15"
              max="100"
              value={hourlyRate}
              onChange={handleSlider(setHourlyRate)}
              className="w-full h-2 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #3B82F6 ${((hourlyRate - 15) / 85) * 100}%, #2A2A36 ${((hourlyRate - 15) / 85) * 100}%)`,
              }}
              aria-label="Average hourly rate"
            />
            <div className="flex justify-between text-xs text-[#6B6B7B] mt-1">
              <span>$15</span>
              <span>$100</span>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="p-6 space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between py-3 border-b border-[#2A2A36]">
              <span className="text-sm text-[#A0A0B0]">Monthly Labor Savings</span>
              <span className="font-mono text-sm font-semibold text-[#E8E8ED]">
                {formatCurrency(monthlyLaborSavings)}
              </span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-[#2A2A36]">
              <span className="text-sm text-[#A0A0B0]">Error Reduction Savings</span>
              <span className="font-mono text-sm font-semibold text-[#E8E8ED]">
                {formatCurrency(annualErrorSavings)}/yr
              </span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-[#2A2A36]">
              <span className="text-sm text-[#A0A0B0]">Est. Investment</span>
              <span className="font-mono text-sm font-semibold text-[#E8E8ED]">
                {formatCurrency(investmentEstimate)}
              </span>
            </div>
          </div>

          {/* Highlight results */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="bg-[#10B981]/10 border border-[#10B981]/20 rounded-lg p-4 text-center">
              <div className="font-mono text-2xl font-bold text-[#10B981]">
                {formatCurrency(totalAnnualSavings)}
              </div>
              <div className="text-xs text-[#A0A0B0] mt-1">Annual Savings</div>
            </div>
            <div className="bg-[#3B82F6]/10 border border-[#3B82F6]/20 rounded-lg p-4 text-center">
              <div className="font-mono text-2xl font-bold text-[#3B82F6]">
                {formatPercent(netROI)}
              </div>
              <div className="text-xs text-[#A0A0B0] mt-1">Year-One ROI</div>
            </div>
          </div>

          <div className="bg-[#1A1A24] rounded-lg p-3 text-center">
            <span className="text-xs text-[#6B6B7B]">Estimated Breakeven: </span>
            <span className="font-mono text-sm font-semibold text-[#F59E0B]">
              {breakeven < 1 ? '< 1 month' : `${breakeven.toFixed(1)} months`}
            </span>
          </div>

          {!showCapture ? (
            <button
              onClick={() => setShowCapture(true)}
              className="block w-full text-center px-6 py-3 bg-[#3B82F6] text-white text-sm font-semibold rounded-lg hover:bg-[#2563EB] transition-colors duration-200 cursor-pointer"
            >
              Get Your Custom Analysis
            </button>
          ) : captureStatus === 'success' ? (
            <div className="text-center py-3">
              <div className="flex items-center justify-center gap-2 text-[#10B981] text-sm font-semibold mb-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                Sent! We'll be in touch soon.
              </div>
              <p className="text-xs text-[#6B6B7B]">Check your inbox for your personalized ROI report.</p>
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
                      message: `ROI Calculator Results:\n- Employees: ${employees}\n- Hours Saved/Mo: ${hoursSaved}h\n- Hourly Rate: $${hourlyRate}\n- Annual Savings: ${formatCurrency(totalAnnualSavings)}\n- ROI: ${formatPercent(netROI)}\n- Breakeven: ${breakeven.toFixed(1)} months`,
                      source: 'roi-calculator',
                      sourcePage: window.location.pathname,
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
                {captureStatus === 'submitting' ? 'Sending...' : 'Send My ROI Report'}
              </button>
              {captureStatus === 'error' && (
                <p className="text-xs text-red-400 text-center">Something went wrong. Try again.</p>
              )}
              <p className="text-xs text-[#6B6B7B] text-center">No spam. We'll send your personalized analysis.</p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
