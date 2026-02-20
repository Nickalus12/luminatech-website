import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface RotatingWordsProps {
  words: string[];
  interval?: number;
  className?: string;
}

export default function RotatingWords({
  words,
  interval = 3000,
  className = '',
}: RotatingWordsProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, interval);
    return () => clearInterval(timer);
  }, [words.length, interval]);

  return (
    <span className={`inline-flex overflow-hidden align-bottom ${className}`}>
      <AnimatePresence mode="wait">
        <motion.span
          key={words[index]}
          className="inline-block bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] bg-clip-text text-transparent"
          initial={{ y: '100%', opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: '-100%', opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          {words[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
