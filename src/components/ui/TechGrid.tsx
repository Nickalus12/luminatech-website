import { useState, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';

// ── Types ────────────────────────────────────────────────────

type Category = 'all' | 'languages' | 'databases' | 'frameworks' | 'devops' | 'tools';

interface Tech {
  name: string;
  logo: string;
  color: string;
  url: string;
  category: Exclude<Category, 'all'>;
}

// ── Data ─────────────────────────────────────────────────────

const technologies: Tech[] = [
  // Languages
  { name: 'C#', logo: '/tech/csharp.svg', color: '#512BD4', url: 'https://dotnet.microsoft.com', category: 'languages' },
  { name: 'Python', logo: '/tech/python.svg', color: '#3776AB', url: 'https://python.org', category: 'languages' },
  { name: 'JavaScript', logo: '/tech/javascript.svg', color: '#F7DF1E', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript', category: 'languages' },
  { name: 'TypeScript', logo: '/tech/typescript.svg', color: '#3178C6', url: 'https://typescriptlang.org', category: 'languages' },
  { name: 'PowerShell', logo: '/tech/powershell.svg', color: '#5391FE', url: 'https://learn.microsoft.com/powershell', category: 'languages' },
  // Databases
  { name: 'SQL Server', logo: '/tech/sqlserver.svg', color: '#CC2927', url: 'https://www.microsoft.com/sql-server', category: 'databases' },
  { name: 'PostgreSQL', logo: '/tech/postgresql.svg', color: '#4169E1', url: 'https://postgresql.org', category: 'databases' },
  { name: 'Redis', logo: '/tech/redis.svg', color: '#FF4438', url: 'https://redis.io', category: 'databases' },
  // Frameworks
  { name: '.NET', logo: '/tech/dotnet.svg', color: '#512BD4', url: 'https://dotnet.microsoft.com', category: 'frameworks' },
  { name: 'React', logo: '/tech/react.svg', color: '#61DAFB', url: 'https://react.dev', category: 'frameworks' },
  { name: 'Node.js', logo: '/tech/nodejs.svg', color: '#5FA04E', url: 'https://nodejs.org', category: 'frameworks' },
  { name: 'HTML5', logo: '/tech/html5.svg', color: '#E34F26', url: 'https://developer.mozilla.org/en-US/docs/Web/HTML', category: 'frameworks' },
  { name: 'CSS3', logo: '/tech/css3.svg', color: '#1572B6', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS', category: 'frameworks' },
  // DevOps
  { name: 'Docker', logo: '/tech/docker.svg', color: '#2496ED', url: 'https://docker.com', category: 'devops' },
  { name: 'Azure', logo: '/tech/azure.svg', color: '#0078D4', url: 'https://azure.microsoft.com', category: 'devops' },
  { name: 'Cloudflare', logo: '/tech/cloudflare.svg', color: '#F38020', url: 'https://cloudflare.com', category: 'devops' },
  { name: 'Git', logo: '/tech/git.svg', color: '#F05032', url: 'https://git-scm.com', category: 'devops' },
  { name: 'GitHub', logo: '/tech/github.svg', color: '#181717', url: 'https://github.com', category: 'devops' },
  // Tools
  { name: 'Visual Studio', logo: '/tech/visualstudio.svg', color: '#5C2D91', url: 'https://visualstudio.microsoft.com', category: 'tools' },
  { name: 'VS Code', logo: '/tech/vscode.svg', color: '#007ACC', url: 'https://code.visualstudio.com', category: 'tools' },
  { name: 'n8n', logo: '/partners/n8n-pink-white.svg', color: '#EA4B71', url: 'https://n8n.io', category: 'tools' },
];

const filters: { id: Category; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'languages', label: 'Languages' },
  { id: 'databases', label: 'Databases' },
  { id: 'frameworks', label: 'Frameworks' },
  { id: 'devops', label: 'DevOps' },
  { id: 'tools', label: 'Tools' },
];

// ── Animation variants ───────────────────────────────────────

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.04 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

// ── Component ────────────────────────────────────────────────

export default function TechGrid({ className }: { className?: string }) {
  const [active, setActive] = useState<Category>('all');
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  const filtered = active === 'all'
    ? technologies
    : technologies.filter((t) => t.category === active);

  return (
    <div ref={ref} className={className}>
      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2 mb-8 justify-center" role="tablist" aria-label="Filter technologies">
        {filters.map((f) => (
          <button
            key={f.id}
            role="tab"
            aria-selected={active === f.id}
            onClick={() => setActive(f.id)}
            className="relative px-4 py-2 text-sm font-medium rounded-full transition-colors duration-200 cursor-pointer"
            style={{
              color: active === f.id
                ? 'var(--color-text-primary)'
                : 'var(--color-text-tertiary)',
            }}
          >
            {active === f.id && (
              <motion.div
                layoutId="tech-filter"
                className="absolute inset-0 rounded-full"
                style={{ background: 'var(--color-bg-surface-2)', border: '1px solid var(--color-border)' }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10">{f.label}</span>
          </button>
        ))}
      </div>

      {/* Grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4"
          role="tabpanel"
        >
          {filtered.map((tech) => (
            <motion.div key={tech.name} variants={itemVariants}>
              <motion.a
                href={tech.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-3 rounded-xl p-5 border transition-colors duration-200"
                style={{
                  background: 'var(--color-bg-surface-1)',
                  borderColor: 'var(--color-border)',
                }}
                whileHover={{
                  scale: 1.05,
                  boxShadow: `0 0 20px ${tech.color}30`,
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <img
                  src={tech.logo}
                  alt={tech.name}
                  width={32}
                  height={32}
                  loading="lazy"
                  className="w-8 h-8 object-contain"
                />
                <span
                  className="text-sm font-medium text-center leading-tight"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  {tech.name}
                </span>
              </motion.a>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
