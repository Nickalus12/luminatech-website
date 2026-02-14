import { useEffect } from 'react';

interface SpotlightProps {
  className?: string;
  fill?: string;
}

let stylesInjected = false;

export default function Spotlight({
  className = '-top-40 left-0 md:-top-20 md:left-60',
  fill = '#3B82F6',
}: SpotlightProps) {
  useEffect(() => {
    if (stylesInjected) return;
    stylesInjected = true;
    const style = document.createElement('style');
    style.textContent = `
      @keyframes spotlight-sweep {
        0% {
          opacity: 0;
          transform: translate(-72%, -62%) scale(0.5);
        }
        100% {
          opacity: 1;
          transform: translate(-50%, -40%) scale(1);
        }
      }
    `;
    document.head.appendChild(style);
  }, []);

  return (
    <div
      className={`pointer-events-none absolute z-0 ${className}`}
      style={{
        width: '140%',
        height: '100%',
        opacity: 0,
        animation: 'spotlight-sweep 2s ease 0.75s 1 forwards',
      }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1024 1024"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
        style={{ filter: `blur(80px)` }}
      >
        <ellipse
          cx="512"
          cy="512"
          rx="512"
          ry="350"
          fill={`url(#spotlight-grad-${fill.replace('#', '')})`}
        />
        <defs>
          <radialGradient
            id={`spotlight-grad-${fill.replace('#', '')}`}
            cx="0.5"
            cy="0.5"
            r="0.5"
          >
            <stop offset="0%" stopColor={fill} stopOpacity="0.25" />
            <stop offset="60%" stopColor={fill} stopOpacity="0.08" />
            <stop offset="100%" stopColor={fill} stopOpacity="0" />
          </radialGradient>
        </defs>
      </svg>
    </div>
  );
}
