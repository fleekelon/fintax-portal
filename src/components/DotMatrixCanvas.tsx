import { forwardRef } from 'react';
import { Theme } from '../config/fintaxConfig';

interface DotMatrixCanvasProps {
  theme: Theme;
}

/**
 * Pure GPU-composited dot matrix layer (0ms CPU per frame, replacing 2D Canvas fillRect loops).
 */
export const DotMatrixCanvas = forwardRef<HTMLDivElement, DotMatrixCanvasProps>(
  function DotMatrixCanvas({ theme }, ref) {
    const dotColor = theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(17,17,16,0.11)';
    return (
      <div
        ref={ref}
        className="dot-canvas"
        aria-hidden="true"
        style={{
          backgroundImage: `radial-gradient(${dotColor} 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
          inset: '-24px',
          width: 'calc(100vw + 48px)',
          height: 'calc(100vh + 48px)',
          willChange: 'transform',
        }}
      />
    );
  }
);
