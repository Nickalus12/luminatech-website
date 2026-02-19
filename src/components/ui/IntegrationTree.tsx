import { useRef } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';

interface TreeNode {
  label: string;
  icon: string;
  color: string;
  x: number;
  y: number;
}

const nodes: TreeNode[] = [
  { label: 'ERP Database', icon: 'database', color: '#3B82F6', x: 50, y: 8 },
  { label: 'eCommerce API', icon: 'api', color: '#10B981', x: 18, y: 28 },
  { label: 'Auth Service', icon: 'lock', color: '#8B5CF6', x: 82, y: 28 },
  { label: 'Marketplace', icon: 'store', color: '#F59E0B', x: 12, y: 80 },
  { label: 'Fulfillment', icon: 'truck', color: '#10B981', x: 50, y: 90 },
  { label: 'Analytics', icon: 'chart', color: '#8B5CF6', x: 88, y: 80 },
];

const connections: [number, number][] = [
  [0, 1],
  [0, 2],
];

function NodeIcon({ icon, color }: { icon: string; color: string }) {
  const props = { className: 'w-5 h-5', style: { color }, fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24', strokeWidth: 1.5 };
  switch (icon) {
    case 'database': return <svg {...props}><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" /><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" /></svg>;
    case 'api': return <svg {...props}><path d="M4 11a9 9 0 0 1 9 9" /><path d="M4 4a16 16 0 0 1 16 16" /><circle cx="5" cy="19" r="1" /></svg>;
    case 'lock': return <svg {...props}><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>;
    case 'store': return <svg {...props}><path d="M3 9l1.5-5h15L21 9" /><path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z" /><path d="M9 21V13h6v8" /></svg>;
    case 'truck': return <svg {...props}><path d="M1 3h15v13H1z" /><path d="M16 8h4l3 3v5h-7V8z" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>;
    case 'chart': return <svg {...props}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>;
    default: return null;
  }
}

export default function IntegrationTree({ className = '' }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  const prefersReduced = useReducedMotion();

  const container = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
  };

  const nodeAnim = {
    hidden: { opacity: 0, scale: 0.4 },
    visible: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 260, damping: 20 } },
  };

  const lineAnim = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: { pathLength: 1, opacity: 0.35, transition: { duration: 0.8, ease: 'easeInOut' as const } },
  };

  const staticLine = { hidden: { opacity: 0.35 }, visible: { opacity: 0.35 } };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={container}
      className={`relative rounded-xl border border-white/[0.08] overflow-hidden ${className}`}
      style={{ background: 'linear-gradient(180deg, rgba(13,13,20,0.95) 0%, rgba(10,10,15,0.98) 100%)' }}
    >
      <div className="relative w-full" style={{ paddingTop: '75%' }}>
        {/* SVG lines */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
          {/* Node-to-node connections */}
          {connections.map(([from, to], i) => (
            <motion.line
              key={`conn-${i}`}
              x1={nodes[from].x} y1={nodes[from].y}
              x2={nodes[to].x} y2={nodes[to].y}
              stroke="#3B82F6" strokeWidth="0.3" strokeDasharray="1.5 1"
              variants={prefersReduced ? staticLine : lineAnim}
            />
          ))}

          {/* Lines from all nodes to center N8N hub (50, 52) */}
          {nodes.map((node, i) => (
            <motion.line
              key={`hub-${i}`}
              x1={node.x} y1={node.y}
              x2={50} y2={52}
              stroke={node.color} strokeWidth="0.2" strokeDasharray="1 1.5"
              variants={prefersReduced ? { hidden: { opacity: 0.2 }, visible: { opacity: 0.2 } } : lineAnim}
            />
          ))}
        </svg>

        {/* N8N center hub */}
        <motion.div
          className="absolute flex flex-col items-center"
          style={{ left: '50%', top: '52%', transform: 'translate(-50%, -50%)' }}
          variants={nodeAnim}
        >
          <div
            className="w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center border"
            style={{
              background: 'linear-gradient(135deg, rgba(234,76,137,0.15), rgba(234,76,137,0.05))',
              borderColor: 'rgba(234,76,137,0.3)',
              boxShadow: '0 0 40px rgba(234,76,137,0.12)',
            }}
          >
            <span className="text-lg md:text-xl font-bold" style={{ color: '#EA4C89' }}>n8n</span>
          </div>
          <span className="text-[10px] md:text-xs font-medium text-gray-400 mt-1.5">Automation Hub</span>
        </motion.div>

        {/* Outer nodes */}
        {nodes.map((node, i) => (
          <motion.div
            key={i}
            className="absolute flex flex-col items-center"
            style={{ left: `${node.x}%`, top: `${node.y}%`, transform: 'translate(-50%, -50%)' }}
            variants={nodeAnim}
          >
            <div
              className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center border"
              style={{ background: `${node.color}10`, borderColor: `${node.color}30` }}
            >
              <NodeIcon icon={node.icon} color={node.color} />
            </div>
            <span className="text-[9px] md:text-[10px] font-medium text-gray-500 whitespace-nowrap mt-1">
              {node.label}
            </span>
          </motion.div>
        ))}

        {/* Pulse on center */}
        {!prefersReduced && isInView && (
          <div
            className="absolute rounded-full animate-ping pointer-events-none"
            style={{
              left: '50%', top: '52%',
              width: 72, height: 72,
              transform: 'translate(-50%, -50%)',
              background: 'rgba(234,76,137,0.04)',
              animationDuration: '3s',
            }}
          />
        )}
      </div>
    </motion.div>
  );
}
