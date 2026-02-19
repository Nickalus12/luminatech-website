import { useEffect, useRef, useState } from 'react';
import {
  motion,
  useMotionValue,
  useTransform,
  animate,
  useInView,
} from 'framer-motion';

interface Project {
  metric: number;
  suffix: string;
  label: string;
  description: string;
  techs: string[];
  color: string;
}

const projects: Project[] = [
  {
    metric: 150,
    suffix: 'x',
    label: 'Faster Processing',
    description:
      'Intelligent batching with retry logic and error recovery',
    techs: ['C# .NET', 'REST API', 'DynaChange'],
    color: '#3B82F6',
  },
  {
    metric: 100,
    suffix: 'K+',
    label: 'Products Synced',
    description:
      'Automated multi-channel catalog sync at scale',
    techs: ['n8n', 'PostgreSQL', 'Rate Limiting'],
    color: '#8B5CF6',
  },
  {
    metric: 85,
    suffix: '%',
    label: 'Time Saved',
    description:
      'Workflow automation replacing manual data entry',
    techs: ['n8n', 'SQL Server', 'OAuth2'],
    color: '#10B981',
  },
];

function CountUp({ value, suffix }: { value: number; suffix: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v));

  useEffect(() => {
    if (isInView) {
      animate(count, value, { duration: 2, ease: 'easeOut' });
    }
  }, [isInView, count, value]);

  return (
    <span ref={ref} className="font-mono text-5xl md:text-6xl font-bold text-accent-primary">
      <motion.span>{rounded}</motion.span>
      {suffix}
    </span>
  );
}

function ProjectCard({
  project,
  index,
}: {
  project: Project;
  index: number;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{
        type: 'spring',
        stiffness: 100,
        damping: 18,
        delay: index * 0.15,
      }}
      whileHover={{ y: -8 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="relative overflow-hidden rounded-xl border p-8 flex flex-col items-center text-center"
      style={{
        background: 'rgba(15, 15, 20, 0.6)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderColor: isHovered
          ? `${project.color}50`
          : 'var(--border)',
        boxShadow: isHovered
          ? `0 8px 32px ${project.color}20, 0 0 60px ${project.color}10`
          : 'none',
        transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
      }}
    >
      {/* Decorative rotating ring */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: 160,
          height: 160,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -65%)',
        }}
      >
        <div
          className="w-full h-full rounded-full"
          style={{
            border: `1.5px solid ${project.color}18`,
            animation: 'projectShowcaseSpin 20s linear infinite',
          }}
        />
      </div>

      {/* Metric */}
      <div className="relative z-10 mb-3">
        <CountUp value={project.metric} suffix={project.suffix} />
      </div>

      {/* Label */}
      <p className="relative z-10 text-text-secondary text-sm font-medium mb-2">
        {project.label}
      </p>

      {/* Description - fades in on hover */}
      <motion.p
        initial={false}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.25 }}
        className="relative z-10 text-text-tertiary text-xs leading-relaxed mb-4 h-8"
      >
        {project.description}
      </motion.p>

      {/* Tech badges */}
      <div className="relative z-10 flex flex-wrap gap-2 justify-center mt-auto">
        {project.techs.map((tech) => (
          <span
            key={tech}
            className="rounded-full px-3 py-1 text-xs font-medium bg-accent-primary/10 text-accent-primary"
          >
            {tech}
          </span>
        ))}
      </div>
    </motion.div>
  );
}

export default function ProjectShowcase({
  className,
}: {
  className?: string;
}) {
  return (
    <>
      <style>{`
        @keyframes projectShowcaseSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
      <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 ${className ?? ''}`}>
        {projects.map((project, index) => (
          <ProjectCard key={project.label} project={project} index={index} />
        ))}
      </div>
    </>
  );
}
