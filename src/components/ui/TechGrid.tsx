import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

// ── Types ────────────────────────────────────────────────────

interface Tech {
  name: string;
  logo: string;
  color: string;
  url: string;
}

// ── Data ─────────────────────────────────────────────────────

const technologies: Tech[] = [
  { name: 'C#', logo: '/tech/csharp.svg', color: '#512BD4', url: 'https://dotnet.microsoft.com' },
  { name: 'Python', logo: '/tech/python.svg', color: '#3776AB', url: 'https://python.org' },
  { name: 'JavaScript', logo: '/tech/javascript.svg', color: '#F7DF1E', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript' },
  { name: 'TypeScript', logo: '/tech/typescript.svg', color: '#3178C6', url: 'https://typescriptlang.org' },
  { name: 'PowerShell', logo: '/tech/powershell.svg', color: '#5391FE', url: 'https://learn.microsoft.com/powershell' },
  { name: 'SQL Server', logo: '/tech/sqlserver.svg', color: '#CC2927', url: 'https://www.microsoft.com/sql-server' },
  { name: 'PostgreSQL', logo: '/tech/postgresql.svg', color: '#4169E1', url: 'https://postgresql.org' },
  { name: 'Redis', logo: '/tech/redis.svg', color: '#FF4438', url: 'https://redis.io' },
  { name: '.NET', logo: '/tech/dotnet.svg', color: '#512BD4', url: 'https://dotnet.microsoft.com' },
  { name: 'React', logo: '/tech/react.svg', color: '#61DAFB', url: 'https://react.dev' },
  { name: 'Node.js', logo: '/tech/nodejs.svg', color: '#5FA04E', url: 'https://nodejs.org' },
  { name: 'HTML5', logo: '/tech/html5.svg', color: '#E34F26', url: 'https://developer.mozilla.org/en-US/docs/Web/HTML' },
  { name: 'CSS3', logo: '/tech/css3.svg', color: '#1572B6', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS' },
  { name: 'Docker', logo: '/tech/docker.svg', color: '#2496ED', url: 'https://docker.com' },
  { name: 'Azure', logo: '/tech/azure.svg', color: '#0078D4', url: 'https://azure.microsoft.com' },
  { name: 'Cloudflare', logo: '/tech/cloudflare.svg', color: '#F38020', url: 'https://cloudflare.com' },
  { name: 'Git', logo: '/tech/git.svg', color: '#F05032', url: 'https://git-scm.com' },
  { name: 'GitHub', logo: '/tech/github.svg', color: '#181717', url: 'https://github.com' },
  { name: 'Visual Studio', logo: '/tech/visualstudio.svg', color: '#5C2D91', url: 'https://visualstudio.microsoft.com' },
  { name: 'VS Code', logo: '/tech/vscode.svg', color: '#007ACC', url: 'https://code.visualstudio.com' },
  { name: 'n8n', logo: '/partners/n8n-pink-white.svg', color: '#EA4B71', url: 'https://n8n.io' },
];

// Split into two rows for dual-track marquee
const row1 = technologies.slice(0, 11);
const row2 = technologies.slice(11);

// ── Marquee Row ──────────────────────────────────────────────

function MarqueeRow({ items, reverse = false, speed = 40 }: { items: Tech[]; reverse?: boolean; speed?: number }) {
  // Duplicate items enough times to fill the scroll seamlessly
  const doubled = [...items, ...items];
  const totalWidth = items.length * 140; // approximate px per item
  const duration = totalWidth / speed;

  return (
    <div className="relative overflow-hidden" style={{ maskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)', WebkitMaskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)' }}>
      <div
        className="flex gap-4 w-max"
        style={{
          animation: `marquee-scroll ${duration}s linear infinite${reverse ? ' reverse' : ''}`,
        }}
      >
        {doubled.map((tech, i) => (
          <a
            key={`${tech.name}-${i}`}
            href={tech.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3 shrink-0 rounded-xl px-5 py-3.5 border transition-all duration-200 hover:scale-[1.04]"
            style={{
              background: 'var(--color-bg-surface-1)',
              borderColor: 'var(--color-border)',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget.closest('[style*="animation"]') as HTMLElement | null)?.style.setProperty('animation-play-state', 'paused');
              e.currentTarget.style.boxShadow = `0 0 20px ${tech.color}25`;
              e.currentTarget.style.borderColor = `${tech.color}40`;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget.closest('[style*="animation"]') as HTMLElement | null)?.style.setProperty('animation-play-state', 'running');
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.borderColor = 'var(--color-border)';
            }}
          >
            <img
              src={tech.logo}
              alt={tech.name}
              width={28}
              height={28}
              loading="lazy"
              className="w-7 h-7 object-contain"
            />
            <span
              className="text-sm font-medium whitespace-nowrap"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              {tech.name}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}

// ── Component ────────────────────────────────────────────────

export default function TechGrid({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.6 }}
    >
      <div className="space-y-4">
        <MarqueeRow items={row1} speed={35} />
        <MarqueeRow items={row2} reverse speed={30} />
      </div>

      {/* Keyframes injected once */}
      <style>{`
        @keyframes marquee-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @media (prefers-reduced-motion: reduce) {
          [style*="marquee-scroll"] { animation: none !important; }
        }
      `}</style>
    </motion.div>
  );
}
