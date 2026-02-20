import { useRef, useMemo } from 'react';
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

/* ── Code that tells the story of building ────────────────── */

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

/* ── Brick grid constants ─────────────────────────────────── */

const BRICK_ROWS = 6;
const BRICK_COLS = 5;

/* ── Component ────────────────────────────────────────────── */

export default function CodeConstruct() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-30px' });
  const reduced = useReducedMotion();

  // Generate falling bricks with staggered delays + deterministic variation
  const bricks = useMemo(() => {
    const items: {
      row: number;
      col: number;
      delay: number;
      rotate: number;
      yEnd: number;
    }[] = [];
    for (let row = 0; row < BRICK_ROWS; row++) {
      for (let col = 0; col < BRICK_COLS; col++) {
        // Top rows fall first, with slight column stagger
        const delay = 0.4 + row * 0.14 + col * 0.04;
        const rotate =
          (col % 2 === 0 ? 1 : -1) * (4 + ((row * 3 + col * 7) % 8));
        const yEnd = 120 + ((row * 7 + col * 13) % 80);
        items.push({ row, col, delay, rotate, yEnd });
      }
    }
    return items;
  }, []);

  // Each code line illuminates as its covering brick row clears
  const lineRevealDelays = useMemo(() => {
    return LINES.map((_, i) => {
      const brickRow = Math.min(
        Math.floor((i / LINES.length) * BRICK_ROWS),
        BRICK_ROWS - 1,
      );
      return 0.4 + brickRow * 0.14 + 0.35;
    });
  }, []);

  return (
    <div ref={ref} className="relative w-full">
      {/* Ambient glow — green-tinted for "construction" */}
      <div className="absolute inset-0 -m-8 bg-gradient-to-br from-[#10B981]/10 via-transparent to-[#3B82F6]/6 rounded-3xl blur-3xl pointer-events-none" />

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

        {/* Code + brick overlay area */}
        <div className="relative">
          {/* Code lines — start nearly invisible, illuminate as bricks fall */}
          <div className="p-4 font-mono text-[11px] md:text-[13px] leading-[1.85]">
            {LINES.map((line, i) => (
              <motion.div
                key={line.num}
                className="flex rounded-sm -mx-1 px-1"
                initial={reduced ? {} : { opacity: 0.06 }}
                animate={
                  inView
                    ? {
                        opacity: 1,
                        background: [
                          'rgba(16,185,129,0)',
                          'rgba(16,185,129,0.1)',
                          'rgba(16,185,129,0)',
                        ],
                      }
                    : {}
                }
                transition={
                  reduced
                    ? {}
                    : {
                        opacity: {
                          duration: 0.8,
                          delay: lineRevealDelays[i],
                          ease: [0.16, 1, 0.3, 1],
                        },
                        background: {
                          duration: 1.4,
                          delay: lineRevealDelays[i],
                          ease: 'easeOut',
                        },
                      }
                }
              >
                {/* Line number */}
                <span className="w-7 text-right text-white/[0.08] select-none shrink-0 pr-3 text-[10px]">
                  {line.num}
                </span>
                {/* Syntax tokens */}
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

            {/* Blinking cursor — appears after all bricks have cleared */}
            {inView && !reduced && (
              <motion.div
                className="flex items-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.8 }}
              >
                <span className="w-7 text-right text-white/[0.08] select-none shrink-0 pr-3 text-[10px]">
                  {LINES.length + 1}
                </span>
                <motion.span
                  className="inline-block w-[7px] h-[16px] bg-[#10B981]/70 rounded-[1px]"
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

          {/* ── Brick overlay ─────────────────────────────────────
               Translucent green bricks cover the code, then fall
               away with spring physics to reveal the illuminated
               code underneath. ──────────────────────────────────── */}
          {!reduced && (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${BRICK_COLS}, 1fr)`,
                gridTemplateRows: `repeat(${BRICK_ROWS}, 1fr)`,
                gap: '2px',
                padding: '2px',
              }}
            >
              {bricks.map(({ row, col, delay, rotate, yEnd }) => (
                <motion.div
                  key={`${row}-${col}`}
                  className="rounded"
                  style={{
                    background:
                      'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(52,211,153,0.1))',
                    border: '1px solid rgba(16,185,129,0.18)',
                    boxShadow:
                      'inset 0 1px 0 rgba(255,255,255,0.05), 0 0 15px rgba(16,185,129,0.08)',
                  }}
                  initial={{ y: 0, rotate: 0, opacity: 0.8, scale: 1 }}
                  animate={
                    inView
                      ? { y: yEnd, rotate, opacity: 0, scale: 0.5 }
                      : {}
                  }
                  transition={{
                    type: 'spring',
                    stiffness: 22,
                    damping: 7,
                    mass: 2.5,
                    delay,
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
