import { ArrowDown, Copy, Plus, QrCode, Terminal, X } from 'lucide-react';
import { forwardRef, useImperativeHandle, useMemo, useRef } from 'react';
import { FormationId, LINKS, Lang, SITE_COPY } from '../config/fintaxConfig';
import { LensLayout } from '../webgl/formations';
import { ChapterLensContent } from './ChapterLensContent';
import { MorphWord } from './MorphWord';

export interface CircularDialHandle {
  updateFrame: (cyPx: number, diameterPx: number, opacity: number, litTicks: number) => void;
}

interface CircularDialProps {
  stage: LensLayout['stage'];
  chapterIndex: number;
  lang: Lang;
  expanded: boolean;
  onToggleExpand: () => void;
  onScrollToCta: () => void;
  onScrollToFirstChapter: () => void;
  engineFormation: FormationId;
  onSelectFormation: (f: FormationId) => void;
  policyIdx: number;
  onSelectPolicy: (idx: number) => void;
  onCopyText: (text: string, msg: string) => void;
  onOpenQr: () => void;
}

const TICK_COUNT = 120;

export const CircularDial = forwardRef<CircularDialHandle, CircularDialProps>(function CircularDial(
  {
    stage,
    chapterIndex,
    lang,
    expanded,
    onToggleExpand,
    onScrollToCta,
    onScrollToFirstChapter,
    engineFormation,
    onSelectFormation,
    policyIdx,
    onSelectPolicy,
    onCopyText,
    onOpenQr,
  },
  ref
) {
  const shellRef = useRef<HTMLDivElement | null>(null);
  const ticksRef = useRef<(SVGLineElement | null)[]>([]);
  const lastLitRef = useRef(-1);
  const lastDiamRef = useRef(-1);

  const tickGeom = useMemo(() => {
    return Array.from({ length: TICK_COUNT }, (_, k) => {
      const angleDeg = (k / TICK_COUNT) * 360 - 90;
      const rad = (angleDeg * Math.PI) / 180;
      const isMajor = k % 30 === 0;
      const isMid = k % 15 === 0 && !isMajor;
      const r0 = 104.5;
      const r1 = isMajor ? 115 : isMid ? 112 : 109.5;
      return {
        x1: Math.cos(rad) * r0,
        y1: Math.sin(rad) * r0,
        x2: Math.cos(rad) * r1,
        y2: Math.sin(rad) * r1,
        sw: isMajor ? 1.2 : 0.75,
      };
    });
  }, []);

  useImperativeHandle(ref, () => ({
    updateFrame(cyPx, diameterPx, opacity, litTicks) {
      const el = shellRef.current;
      if (el) {
        const y = cyPx - diameterPx * 0.5;
        if (Math.abs(diameterPx - lastDiamRef.current) > 0.25) {
          el.style.width = `${diameterPx.toFixed(1)}px`;
          el.style.height = `${diameterPx.toFixed(1)}px`;
          lastDiamRef.current = diameterPx;
        }
        el.style.transform = `translate3d(-50%, ${y.toFixed(2)}px, 0)`;
        el.style.opacity = opacity.toFixed(3);
        el.style.pointerEvents = opacity > 0.2 ? 'auto' : 'none';
      }
      if (litTicks !== lastLitRef.current) {
        const prev = lastLitRef.current;
        const lo = prev < 0 ? 0 : Math.min(prev, litTicks);
        const hi = prev < 0 ? TICK_COUNT : Math.max(prev, litTicks);
        for (let k = lo; k < hi; k++) {
          const line = ticksRef.current[k];
          if (line) {
            line.setAttribute('stroke', k < litTicks ? 'var(--tick-lit)' : 'var(--tick-dim)');
          }
        }
        lastLitRef.current = litTicks;
      }
    },
  }));

  const copy = SITE_COPY[lang];
  const chapter = copy.chapters[chapterIndex];

  return (
    <div
      ref={shellRef}
      className="lens-shell"
      style={{
        width: '448px',
        height: '448px',
        transform: 'translate3d(-50%, 50vh, 0)',
      }}
    >
      <div className="lens-disc">
        <svg className="lens-ticks" viewBox="-120 -120 240 240" aria-hidden="true">
          {tickGeom.map((t, k) => (
            <line
              key={k}
              ref={(node) => {
                ticksRef.current[k] = node;
              }}
              x1={t.x1}
              y1={t.y1}
              x2={t.x2}
              y2={t.y2}
              stroke="var(--tick-dim)"
              strokeWidth={t.sw}
              strokeLinecap="round"
            />
          ))}
        </svg>

        <div
          className="lens-inner"
          style={{
            paddingBottom: stage === 'hero' || stage === 'cta' ? '34px' : '0px',
          }}
        >
          {stage === 'hero' && (
            <>
              <div className="hero-badge-row">
                <span>dsh-fintax</span>
                <span>×</span>
                <span>IMA 知识库</span>
              </div>
              <h1 className="hero-title">
                {copy.heroPrefix}
                <MorphWord words={copy.heroWords} />
                {copy.heroSuffix}
              </h1>
              <p className="hero-sub">{copy.heroDesc}</p>
              <div className="hero-actions">
                <button type="button" className="glass-btn primary" onClick={onScrollToCta}>
                  {copy.heroCta}
                </button>
                <button
                  type="button"
                  className="glass-btn glass-icon-btn"
                  onClick={onScrollToFirstChapter}
                  aria-label="Scroll to chapters"
                >
                  <ArrowDown size={15} strokeWidth={1.9} />
                </button>
              </div>
            </>
          )}

          {stage === 'chapter' && (
            <>
              <div
                style={{
                  fontFamily: 'var(--f-mono)',
                  fontSize: '11px',
                  color: 'var(--text3)',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                }}
              >
                0{chapterIndex + 1} / 04 · {chapter.enLabel}
              </div>
              <h2 className="chapter-title">{chapter.title}</h2>
              <p className="chapter-sub">{expanded ? chapter.expandedSub : chapter.subtitle}</p>

              {expanded && (
                <ChapterLensContent
                  chapterIndex={chapterIndex}
                  lang={lang}
                  engineFormation={engineFormation}
                  onSelectFormation={onSelectFormation}
                  policyIdx={policyIdx}
                  onSelectPolicy={onSelectPolicy}
                  onCopyText={onCopyText}
                  onOpenQr={onOpenQr}
                />
              )}

              <button
                type="button"
                className="glass-btn glass-icon-btn"
                onClick={onToggleExpand}
                aria-label={expanded ? 'Collapse preview' : 'Expand interactive preview'}
                style={{ marginTop: expanded ? '2px' : '6px' }}
              >
                {expanded ? <X size={16} strokeWidth={1.9} /> : <Plus size={16} strokeWidth={1.9} />}
              </button>
            </>
          )}

          {stage === 'cta' && (
            <>
              <h2 className="hero-title" style={{ whiteSpace: 'pre-line' }}>
                {copy.ctaTitle}
              </h2>
              <p className="hero-sub">{copy.ctaDesc}</p>

              <div className="cta-tri-grid">
                <button
                  type="button"
                  className="glass-btn primary"
                  style={{ padding: '8px 13px', fontSize: '12px' }}
                  onClick={() =>
                    onCopyText(
                      LINKS.cliInstall,
                      lang === 'zh'
                        ? '已复制安装命令：dsh plugin --profile default add dsh-fintax'
                        : 'Copied CLI install command'
                    )
                  }
                >
                  <Terminal size={13} /> {copy.btnInstall}
                </button>

                <button
                  type="button"
                  className="glass-btn"
                  style={{ padding: '8px 13px', fontSize: '12px' }}
                  onClick={onOpenQr}
                >
                  <QrCode size={13} /> {copy.btnImaQr}
                </button>

                <button
                  type="button"
                  className="glass-btn"
                  style={{ padding: '8px 13px', fontSize: '12px' }}
                  onClick={() =>
                    onCopyText(
                      LINKS.wechat,
                      lang === 'zh'
                        ? '已复制微信 emjj6666（备注：十月回测 / IMA对账 / IMA退税）'
                        : 'Copied WeChat ID: emjj6666'
                    )
                  }
                >
                  <Copy size={13} /> {copy.btnWechat}
                </button>
              </div>

              <div className="cta-links-sub">
                <a href={LINKS.github} target="_blank" rel="noreferrer">
                  GitHub
                </a>
                <a href={LINKS.npm} target="_blank" rel="noreferrer">
                  npm package
                </a>
                <span>{LINKS.email}</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
});
