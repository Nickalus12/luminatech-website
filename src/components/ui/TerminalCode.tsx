import { useState, useEffect, useRef } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';

interface CodeLine {
  text: string;
  color?: 'primary' | 'violet' | 'success' | 'warning' | 'error' | 'tertiary' | 'default';
}

interface CodeSnippet {
  language: string;
  title: string;
  lines: CodeLine[];
}

const defaultSnippets: CodeSnippet[] = [
  {
    language: 'C#',
    title: 'business-rule.cs',
    lines: [
      { text: '// DynaChange Extension — Event Handler', color: 'tertiary' },
      { text: 'public class OrderValidation : BusinessRuleBase', color: 'primary' },
      { text: '{', color: 'default' },
      { text: '    protected override void Execute(RuleContext ctx)', color: 'violet' },
      { text: '    {', color: 'default' },
      { text: '        var config = LoadConfig("validation_rules");', color: 'success' },
      { text: '        if (!ctx.IsValid(config.Threshold))', color: 'default' },
      { text: '            ctx.Cancel("Validation required");', color: 'warning' },
      { text: '', color: 'default' },
      { text: '        AuditLog.Write(ctx, "rule_executed");', color: 'success' },
      { text: '    }', color: 'default' },
      { text: '}', color: 'default' },
    ],
  },
  {
    language: 'SQL',
    title: 'config-table.sql',
    lines: [
      { text: '-- Configuration-driven business logic', color: 'tertiary' },
      { text: 'SELECT config_value, active_flag', color: 'primary' },
      { text: 'FROM   rule_config WITH (NOLOCK)', color: 'primary' },
      { text: 'WHERE  config_key = @rule_name', color: 'default' },
      { text: '  AND  active_flag = \'Y\';', color: 'success' },
      { text: '', color: 'default' },
      { text: '-- Comprehensive audit trail', color: 'tertiary' },
      { text: 'INSERT INTO audit_log', color: 'primary' },
      { text: '  (action, document_id, user_id,', color: 'default' },
      { text: '   old_value, new_value, created_at)', color: 'default' },
      { text: 'VALUES', color: 'primary' },
      { text: '  (@action, @docId, @user,', color: 'default' },
      { text: '   @oldVal, @newVal, GETDATE());', color: 'success' },
    ],
  },
  {
    language: 'C#',
    title: 'api-fallback.cs',
    lines: [
      { text: '// Hybrid API + SQL approach', color: 'tertiary' },
      { text: 'try {', color: 'default' },
      { text: '    var result = await TransactionAPI', color: 'primary' },
      { text: '        .CreateDocument(payload);', color: 'primary' },
      { text: '    Logger.Info("API success", result.Id);', color: 'success' },
      { text: '} catch (ApiException ex) {', color: 'warning' },
      { text: '    Logger.Warn("API unavailable, SQL fallback");', color: 'warning' },
      { text: '    var fallback = SqlHelper', color: 'violet' },
      { text: '        .ExecuteFallback(payload);', color: 'violet' },
      { text: '    AuditLog.Write("fallback_used", ex);', color: 'success' },
      { text: '}', color: 'default' },
    ],
  },
];

interface TerminalCodeProps {
  snippets?: CodeSnippet[];
  typingSpeed?: number;
  pauseBetween?: number;
  className?: string;
}

export default function TerminalCode({
  snippets = defaultSnippets,
  typingSpeed = 28,
  pauseBetween = 3500,
  className = '',
}: TerminalCodeProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const prefersReduced = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const [displayedLines, setDisplayedLines] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);

  const currentSnippet = snippets[activeIndex];
  const totalLines = currentSnippet.lines.length;

  useEffect(() => {
    if (isInView && !isTyping) {
      setIsTyping(true);
      setDisplayedLines(0);
      setCharIndex(0);
    }
  }, [isInView]);

  useEffect(() => {
    if (!isTyping || prefersReduced) {
      if (prefersReduced && isInView) setDisplayedLines(totalLines);
      return;
    }

    if (displayedLines >= totalLines) {
      const timer = setTimeout(() => {
        const next = (activeIndex + 1) % snippets.length;
        setActiveIndex(next);
        setDisplayedLines(0);
        setCharIndex(0);
      }, pauseBetween);
      return () => clearTimeout(timer);
    }

    const line = currentSnippet.lines[displayedLines];
    if (!line || line.text.length === 0) {
      const timer = setTimeout(() => {
        setDisplayedLines((d) => d + 1);
        setCharIndex(0);
      }, 40);
      return () => clearTimeout(timer);
    }

    if (charIndex < line.text.length) {
      const timer = setTimeout(() => setCharIndex((c) => c + 1), typingSpeed);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        setDisplayedLines((d) => d + 1);
        setCharIndex(0);
      }, 60);
      return () => clearTimeout(timer);
    }
  }, [isTyping, displayedLines, charIndex, activeIndex, totalLines, typingSpeed, pauseBetween, prefersReduced, isInView, currentSnippet.lines, snippets.length]);

  const colorMap: Record<string, string> = {
    primary: 'text-blue-400',
    violet: 'text-violet-400',
    success: 'text-emerald-400',
    warning: 'text-amber-400',
    error: 'text-red-400',
    tertiary: 'text-gray-500',
    default: 'text-gray-300',
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={`rounded-xl overflow-hidden border border-white/[0.08] ${className}`}
      style={{ background: 'linear-gradient(180deg, #0d0d14 0%, #0a0a10 100%)' }}
    >
      {/* Terminal chrome */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]"
        style={{ background: 'rgba(255,255,255,0.02)' }}
      >
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-500/70" />
          <span className="w-3 h-3 rounded-full bg-amber-500/70" />
          <span className="w-3 h-3 rounded-full bg-emerald-500/70" />
        </div>
        <span className="text-xs font-mono text-gray-500">{currentSnippet.title}</span>
        <div className="flex items-center gap-1">
          {snippets.map((s, i) => (
            <button
              key={i}
              onClick={() => {
                setActiveIndex(i);
                setDisplayedLines(prefersReduced ? snippets[i].lines.length : 0);
                setCharIndex(0);
                setIsTyping(true);
              }}
              className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors cursor-pointer ${
                i === activeIndex ? 'bg-blue-500/20 text-blue-400' : 'text-gray-600 hover:text-gray-400'
              }`}
            >
              {s.language}
            </button>
          ))}
        </div>
      </div>

      {/* Code area */}
      <div className="p-5 overflow-x-auto min-h-[260px]">
        <pre className="text-sm font-mono leading-relaxed">
          {currentSnippet.lines.map((line, lineIdx) => {
            if (lineIdx > displayedLines) return null;
            const isCurrent = lineIdx === displayedLines && !prefersReduced;
            const text = isCurrent ? line.text.slice(0, charIndex) : line.text;

            return (
              <div key={`${activeIndex}-${lineIdx}`} className="flex">
                <span className="w-8 shrink-0 text-right pr-4 text-gray-600 select-none text-xs leading-relaxed">
                  {lineIdx + 1}
                </span>
                <code className={colorMap[line.color ?? 'default']}>
                  {text}
                  {isCurrent && (
                    <span className="inline-block w-[2px] h-[14px] bg-blue-400 ml-[1px] align-middle animate-pulse" />
                  )}
                </code>
              </div>
            );
          })}
        </pre>
      </div>
    </motion.div>
  );
}
