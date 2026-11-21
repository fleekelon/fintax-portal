import { useEffect, useState } from 'react';

interface MorphWordProps {
  words: string[];
  intervalMs?: number;
}

export function MorphWord({ words, intervalMs = 2600 }: MorphWordProps) {
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState<'in' | 'out'>('in');

  useEffect(() => {
    setIdx(0);
  }, [words]);

  useEffect(() => {
    const id = window.setInterval(() => {
      setPhase('out');
      window.setTimeout(() => {
        setIdx((prev) => (prev + 1) % words.length);
        setPhase('in');
      }, 260);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [words.length, intervalMs]);

  return (
    <span
      style={{
        display: 'inline-block',
        color: 'var(--accent)',
        transition: 'opacity 0.26s ease, filter 0.26s ease, transform 0.32s cubic-bezier(0.22, 1, 0.36, 1)',
        opacity: phase === 'in' ? 1 : 0,
        filter: phase === 'in' ? 'blur(0px)' : 'blur(6px)',
        transform: phase === 'in' ? 'translateY(0px)' : 'translateY(-4px)',
      }}
    >
      {words[idx % words.length]}
    </span>
  );
}
