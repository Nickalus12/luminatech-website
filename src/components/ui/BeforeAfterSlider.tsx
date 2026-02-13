import { useState } from 'react';

interface BeforeAfterSliderProps {
  before: { label: string; value: string; description?: string };
  after: { label: string; value: string; description?: string };
  className?: string;
}

export default function BeforeAfterSlider({ before, after, className = '' }: BeforeAfterSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSliderPosition(Number(e.target.value));
  };

  return (
    <div className={`relative bg-bg-surface-1 rounded-xl border border-border overflow-hidden ${className}`}>
      <div className="relative h-64 md:h-80">
        {/* Before Side */}
        <div
          className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-accent-error/20 to-accent-error/5 transition-all duration-300"
          style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
        >
          <div className="text-center px-6">
            <div className="text-xs text-accent-error font-semibold uppercase tracking-wider mb-2">
              {before.label}
            </div>
            <div className="text-4xl md:text-5xl font-mono font-bold text-text-primary mb-2">
              {before.value}
            </div>
            {before.description && (
              <div className="text-sm text-text-secondary italic">
                {before.description}
              </div>
            )}
          </div>
        </div>

        {/* After Side */}
        <div
          className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-accent-success/20 to-accent-success/5 transition-all duration-300"
          style={{ clipPath: `inset(0 0 0 ${sliderPosition}%)` }}
        >
          <div className="text-center px-6">
            <div className="text-xs text-accent-success font-semibold uppercase tracking-wider mb-2">
              {after.label}
            </div>
            <div className="text-4xl md:text-5xl font-mono font-bold text-accent-success mb-2">
              {after.value}
            </div>
            {after.description && (
              <div className="text-sm text-text-secondary italic">
                {after.description}
              </div>
            )}
          </div>
        </div>

        {/* Slider Line */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-white shadow-lg z-10 transition-all duration-300"
          style={{ left: `${sliderPosition}%` }}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8L22 12L18 16" />
              <path d="M6 8L2 12L6 16" />
            </svg>
          </div>
        </div>
      </div>

      {/* Slider Input */}
      <input
        type="range"
        min="0"
        max="100"
        value={sliderPosition}
        onChange={handleSliderChange}
        className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] h-2 bg-transparent appearance-none cursor-pointer z-20"
        style={{
          background: 'transparent',
        }}
      />
    </div>
  );
}
