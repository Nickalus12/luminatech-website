import { motion } from 'framer-motion';

interface TextRevealProps {
  text: string;
  className?: string;
  as?: 'h1' | 'h2' | 'h3';
}

const MotionH1 = motion.h1;
const MotionH2 = motion.h2;
const MotionH3 = motion.h3;

const tagMap = {
  h1: MotionH1,
  h2: MotionH2,
  h3: MotionH3,
};

export default function TextReveal({
  text,
  className = '',
  as = 'h2',
}: TextRevealProps) {
  const Tag = tagMap[as];
  // Split on whitespace but preserve newlines as line break markers
  const segments = text.split(/(\n)/);

  let wordIndex = 0;

  return (
    <Tag
      className={className}
      aria-label={text.replace(/\n/g, ' ')}
      role="heading"
    >
      {segments.map((segment, segIdx) => {
        if (segment === '\n') {
          return <br key={`br-${segIdx}`} />;
        }

        const words = segment.split(/\s+/).filter(Boolean);
        return words.map((word) => {
          const i = wordIndex++;
          const isERP = word === 'ERP';
          return (
            <motion.span
              key={`${segIdx}-${i}`}
              className={`inline-block mr-[0.25em] last:mr-0${isERP ? ' siri-glow' : ''}`}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{
                duration: 0.5,
                delay: i * 0.08,
                ease: [0.16, 1, 0.3, 1],
              }}
              aria-hidden="true"
            >
              {word}
            </motion.span>
          );
        });
      })}
    </Tag>
  );
}
