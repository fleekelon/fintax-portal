import { forwardRef, useImperativeHandle, useRef } from 'react';

export interface CrosshairHandle {
  updatePointer: (x: number, y: number, hMult: number, vMult: number, visible: boolean) => void;
  setAlpha: (alpha: number) => void;
}

/**
 * Imperatively driven GPU crosshair overlay: 0 React re-renders on pointermove/scroll.
 */
export const CrosshairOverlay = forwardRef<CrosshairHandle>(function CrosshairOverlay(_, ref) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const hRef = useRef<HTMLDivElement | null>(null);
  const vRef = useRef<HTMLDivElement | null>(null);
  const dotRef = useRef<HTMLDivElement | null>(null);
  const pillRef = useRef<HTMLDivElement | null>(null);
  const hValRef = useRef<HTMLElement | null>(null);
  const vValRef = useRef<HTMLElement | null>(null);
  const visibleRef = useRef(false);
  const alphaRef = useRef(1);

  const syncOpacity = () => {
    if (!rootRef.current) return;
    const op = visibleRef.current ? alphaRef.current : 0;
    rootRef.current.style.opacity = op > 0.02 ? String(op) : '0';
  };

  useImperativeHandle(ref, () => ({
    updatePointer(x, y, hMult, vMult, visible) {
      visibleRef.current = visible;
      if (hRef.current) hRef.current.style.transform = `translate3d(0, ${y}px, 0)`;
      if (vRef.current) vRef.current.style.transform = `translate3d(${x}px, 0, 0)`;
      if (dotRef.current) dotRef.current.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
      if (pillRef.current) {
        const flipX = x > window.innerWidth - 230;
        const flipY = y > window.innerHeight - 90;
        pillRef.current.style.transform = `translate3d(${x}px, ${y}px, 0) translate(${flipX ? '-110%' : '14px'}, ${flipY ? '-135%' : '14px'})`;
      }
      if (hValRef.current) hValRef.current.textContent = hMult.toFixed(2);
      if (vValRef.current) vValRef.current.textContent = vMult.toFixed(2);
      syncOpacity();
    },
    setAlpha(alpha) {
      alphaRef.current = alpha;
      syncOpacity();
    },
  }));

  return (
    <div ref={rootRef} className="crosshair-layer" style={{ opacity: 0 }} aria-hidden="true">
      <div ref={hRef} className="xh-h" style={{ top: 0, willChange: 'transform' }} />
      <div ref={vRef} className="xh-v" style={{ left: 0, willChange: 'transform' }} />
      <div ref={dotRef} className="xh-dot" style={{ left: 0, top: 0, willChange: 'transform' }} />
      <div ref={pillRef} className="xh-pill" style={{ left: 0, top: 0, willChange: 'transform' }}>
        <span>
          H<strong ref={hValRef}>1.53</strong>
        </span>
        <span>
          V<strong ref={vValRef}>1.43</strong>
        </span>
        <span style={{ color: 'var(--lcd)' }}>11 CH · 0.55s</span>
      </div>
    </div>
  );
});
