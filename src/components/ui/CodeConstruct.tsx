import { useRef } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';

/* ── Token types for syntax coloring ──────────────────────── */

interface Token {
  text: string;
  type?: 'kw' | 'str' | 'bool' | 'br' | 'fn' | 'comment';
}

interface CodeLine {
  num: number;
  indent: number;
  tokens: Token[];
}

/* ── Code lines — tells the story of "building" ───────────── */

const LINES: CodeLine[] = [
  {
    num: 1,
    indent: 0,
    tokens: [
      { text: 'import', type: 'kw' },
      { text: ' { transform } ' },
      { text: 'from', type: 'kw' },
      { text: ' ' },
      { text: '"@lumina/core"', type: 'str' },
      { text: ';' },
    ],
  },
  {
    num: 2,
    indent: 0,
    tokens: [
      { text: 'const', type: 'kw' },
      { text: ' engine = ' },
      { text: 'new', type: 'kw' },
      { text: ' ERPEngine();' },
    ],
  },
  { num: 3, indent: 0, tokens: [] },
  {
    num: 4,
    indent: 0,
    tokens: [
      { text: 'const', type: 'kw' },
      { text: ' pipeline = engine.' },
      { text: 'create', type: 'fn' },
      { text: '(', type: 'br' },
      { text: '{', type: 'br' },
    ],
  },
  {
    num: 5,
    indent: 1,
    tokens: [
      { text: 'optimize' },
      { text: ': ' },
      { text: 'true', type: 'bool' },
      { text: ',' },
    ],
  },
  {
    num: 6,
    indent: 1,
    tokens: [
      { text: 'automate' },
      { text: ': ' },
      { text: '"intelligent"', type: 'str' },
      { text: ',' },
    ],
  },
  {
    num: 7,
    indent: 0,
    tokens: [
      { text: '}', type: 'br' },
      { text: ')', type: 'br' },
      { text: ';' },
    ],
  },
  { num: 8, indent: 0, tokens: [] },
  {
    num: 9,
    indent: 0,
    tokens: [
      { text: 'await', type: 'kw' },
      { text: ' pipeline.' },
      { text: 'deploy', type: 'fn' },
      { text: '();' },
    ],
  },
  {
    num: 10,
    indent: 0,
    tokens: [
      { text: '// Building the future, line by line', type: 'comment' },
    ],
  },
];

const TOKEN_COLORS: Record<string, string> = {
  kw: 'text-[#7C8CFF]',
  str: 'text-[#7DCEA0]',
  bool: 'text-[#F0B27A]',
  br: 'text-[#D7BDE2]',
  fn: 'text-[#85C1E9]',
  comment: 'text-white/25 italic',
};

/* ── Component ────────────────────────────────────────────── */

export default function CodeConstruct() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-30px' });
  const reduced = useReducedMotion();

  return (
    <div ref={ref} className="relative w-full">
      {/* Ambient glow behind the editor */}
      <div className="absolute inset-0 -m-8 bg-gradient-to-br from-[#3B82F6]/8 via-transparent to-[#8B5CF6]/8 rounded-3xl blur-3xl pointer-events-none" />

      {/* Editor frame */}
      <div className="relative rounded-xl border border-white/[0.06] bg-[#0c0c14]/90 backdrop-blur-sm overflow-hidden shadow-2xl">
        {/* macOS-style title bar */}
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/[0.04] bg-white/[0.02]">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E]/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#28C840]/60" />
          </div>
          <span className="text-[10px] font-mono text-white/20 ml-3 tracking-wide">
            building-the-future.ts
          </span>
        </div>

        {/* Code area — lines build in brick-by-brick with spring physics */}
        <div className="p-4 font-mono text-[11px] md:text-[13px] leading-[1.85]">
          {LINES.map((line, i) => (
            <motion.div
              key={line.num}
              className="flex"
              initial={reduced ? {} : { opacity: 0, x: -28, scaleX: 0.92 }}
              animate={inView ? { opacity: 1, x: 0, scaleX: 1 } : {}}
              transition={
                reduced
                  ? {}
                  : {
                      type: 'spring',
                      stiffness: 250,
                      damping: 15,
                      delay: i * 0.1,
                    }
              }
              style={{ transformOrigin: 'left center' }}
            >
              {/* Line number */}
              <span className="w-7 text-right text-white/[0.08] select-none shrink-0 pr-3 text-[10px]">
                {line.num}
              </span>

              {/* Tokens with syntax coloring */}
              <span style={{ paddingLeft: `${line.indent * 18}px` }}>
                {line.tokens.length === 0 ? (
                  <span className="select-none">&nbsp;</span>
                ) : (
                  line.tokens.map((t, j) => (
                    <span
                      key={j}
                      className={
                        t.type ? TOKEN_COLORS[t.type] : 'text-white/45'
                      }
                    >
                      {t.text}
                    </span>
                  ))
                )}
              </span>
            </motion.div>
          ))}

          {/* Blinking cursor — appears after all lines are placed */}
          {inView && !reduced && (
            <motion.div
              className="flex items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: LINES.length * 0.1 + 0.3 }}
            >
              <span className="w-7 text-right text-white/[0.08] select-none shrink-0 pr-3 text-[10px]">
                {LINES.length + 1}
              </span>
              <motion.span
                className="inline-block w-[7px] h-[16px] bg-[#3B82F6]/70 rounded-[1px]"
                animate={{ opacity: [1, 0] }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  ease: 'steps(1)',
                }}
              />
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
