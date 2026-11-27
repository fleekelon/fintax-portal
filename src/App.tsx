import Lenis from 'lenis';
import { X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ChapterNav } from './components/ChapterNav';
import { CircularDial, CircularDialHandle } from './components/CircularDial';
import { CrosshairHandle, CrosshairOverlay } from './components/CrosshairOverlay';
import { DotMatrixCanvas } from './components/DotMatrixCanvas';
import { FinTaxWorkbench } from './components/FinTaxWorkbench';
import { TopBar } from './components/TopBar';
import {
  FormationId,
  HeroMode,
  LINKS,
  Lang,
  MediaItem,
  PORTAL_METRICS,
  SITE_COPY,
  Theme,
  assetUrl,
} from './config/fintaxConfig';
import { LensLayout } from './webgl/formations';
import { FrameSyncPayload, SpatialStageEngine } from './webgl/SpatialStageEngine';

const CHAPTER_SCROLL_TARGETS = [0.2, 0.38, 0.56, 0.7];
const TICK_COUNT = 120;

export function App() {
  const [lang, setLang] = useState<Lang>('zh');
  const [theme, setTheme] = useState<Theme>('light');
  const [heroMode, setHeroMode] = useState<HeroMode>('breathe');
  const [stage, setStage] = useState<LensLayout['stage']>('hero');
  const [chapterIndex, setChapterIndex] = useState(0);
  const [showHeroMode, setShowHeroMode] = useState(true);
  const [wbMounted, setWbMounted] = useState(false);

  const [lensExpanded, setLensExpanded] = useState(false);
  const [engineFormation, setEngineFormation] = useState<FormationId>('ring');
  const [policyIdx, setPolicyIdx] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const [modal, setModal] = useState<'qr' | 'disclaimer' | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const dotRef = useRef<HTMLDivElement | null>(null);
  const crosshairRef = useRef<CrosshairHandle | null>(null);
  const dialRef = useRef<CircularDialHandle | null>(null);
  const wbRef = useRef<HTMLElement | null>(null);
  const footerRef = useRef<HTMLElement | null>(null);

  const engineRef = useRef<SpatialStageEngine | null>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const toastTimerRef = useRef<number | null>(null);
  const heroModeRef = useRef<HeroMode>(heroMode);
  heroModeRef.current = heroMode;

  const discreteRef = useRef({
    stage: 'hero' as LensLayout['stage'],
    chapterIndex: 0,
    showHeroMode: true,
    wbMounted: false,
  });

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToast(null), 2800);
  }, []);

  const copyText = useCallback(
    (text: string, msg: string) => {
      navigator.clipboard?.writeText(text).catch(() => {});
      showToast(msg);
    },
    [showToast]
  );

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#0b0b0c' : '#f3f2ee');
    engineRef.current?.sync({ theme });
  }, [theme]);

  useEffect(() => {
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  }, [lang]);

  useEffect(() => {
    engineRef.current?.sync({ heroMode, lensExpanded, engineFormation, policyScrub: policyIdx / 3 });
  }, [heroMode, lensExpanded, engineFormation, policyIdx]);

  // Mount WebGL2 Spatial Engine + Frame-Locked Zero-Re-Render DOM Sync
  useEffect(() => {
    if (!canvasRef.current) return;

    const handleFrame = ({
      layout,
      cyPx,
      diameterPx,
      lensOpacity,
      mouseNormX,
      mouseNormY,
    }: FrameSyncPayload) => {
      // 1. Frame-locked Circular Dial (exact pixel sync with WebGL refraction lens!)
      const litTicks =
        layout.stage === 'chapter'
          ? Math.max(4, Math.round(layout.dialProgress * TICK_COUNT))
          : layout.stage === 'cta'
            ? TICK_COUNT
            : 0;
      dialRef.current?.updateFrame(cyPx, diameterPx, lensOpacity, litTicks);

      // 2. Subtle GPU parallax on CSS dot grid (0ms CPU!)
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${(-mouseNormX * 8).toFixed(2)}px, ${(mouseNormY * 8).toFixed(2)}px, 0)`;
      }

      // 3. Crosshair alpha
      crosshairRef.current?.setAlpha(layout.heroAlpha);

      // 4. Workbench imperative opacity/transform (0 React re-renders during scroll)
      if (wbRef.current) {
        const wa = layout.workbenchAlpha;
        wbRef.current.style.opacity = String(wa);
        wbRef.current.style.transform = `translate3d(0, ${(1 - wa) * 24}px, 0) scale(${0.97 + wa * 0.03})`;
        wbRef.current.style.pointerEvents = wa > 0.35 ? 'auto' : 'none';
      }

      // 5. Footer opacity
      if (footerRef.current) {
        footerRef.current.style.opacity = String(layout.ctaAlpha);
      }

      // 6. Only trigger React state updates on discrete phase transitions!
      const d = discreteRef.current;
      if (d.stage !== layout.stage) {
        d.stage = layout.stage;
        setStage(layout.stage);
        if (layout.stage !== 'chapter') setLensExpanded(false);
      }
      if (d.chapterIndex !== layout.chapterIndex) {
        d.chapterIndex = layout.chapterIndex;
        setChapterIndex(layout.chapterIndex);
        setLensExpanded(false);
      }
      const nextShowHero = layout.heroAlpha > 0.35;
      if (d.showHeroMode !== nextShowHero) {
        d.showHeroMode = nextShowHero;
        setShowHeroMode(nextShowHero);
      }
      const nextWb = layout.workbenchAlpha > 0.015;
      if (d.wbMounted !== nextWb) {
        d.wbMounted = nextWb;
        setWbMounted(nextWb);
      }
    };

    const engine = new SpatialStageEngine(canvasRef.current, handleFrame);
    engineRef.current = engine;

    fetch(assetUrl('/media/manifest.json'))
      .then((r) => r.json())
      .then((list: MediaItem[]) => engine.loadMediaItems(list))
      .catch(() => {});

    return () => {
      engine.dispose();
      engineRef.current = null;
    };
  }, []);

  // Crisp Lenis Smooth Scroll -> directly feeds engine without React setState!
  useEffect(() => {
    const lenis = new Lenis({
      duration: 0.78,
      smoothWheel: true,
      wheelMultiplier: 1.05,
    });
    lenisRef.current = lenis;

    let raf = 0;
    const rafLoop = (time: number) => {
      lenis.raf(time);
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const p = Math.max(0, Math.min(1, window.scrollY / maxScroll));
      engineRef.current?.sync({ scrollProgress: p });
      raf = requestAnimationFrame(rafLoop);
    };
    raf = requestAnimationFrame(rafLoop);

    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // Zero-React-Render pointer tracking
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const w = window.innerWidth || 1;
      const h = window.innerHeight || 1;
      const nx = (e.clientX / w) * 2 - 1;
      const ny = 1 - (e.clientY / h) * 2;
      const hMult = 0.25 + (e.clientX / w) * 2.55;
      const vMult = 0.25 + (e.clientY / h) * 2.55;
      engineRef.current?.sync({ mouseNormX: nx, mouseNormY: ny, hMult, vMult });
      crosshairRef.current?.updatePointer(
        e.clientX,
        e.clientY,
        hMult,
        vMult,
        heroModeRef.current === 'breathe'
      );
    };
    const onLeave = () => {
      crosshairRef.current?.updatePointer(0, 0, 1.5, 1.4, false);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerleave', onLeave, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  const scrollToProgress = useCallback((targetP: number) => {
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const y = targetP * maxScroll;
    if (lenisRef.current) {
      lenisRef.current.scrollTo(y, { duration: 1.05 });
    } else {
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  }, []);

  const copy = SITE_COPY[lang];

  return (
    <div id="top">
      <DotMatrixCanvas ref={dotRef} theme={theme} />
      <canvas ref={canvasRef} className="webgl-canvas" />
      <CrosshairOverlay ref={crosshairRef} />

      <TopBar
        lang={lang}
        theme={theme}
        heroMode={heroMode}
        showHeroMode={showHeroMode}
        onHeroModeChange={setHeroMode}
        onThemeChange={setTheme}
        onLangChange={setLang}
        onLogoClick={() => scrollToProgress(0)}
      />

      <CircularDial
        ref={dialRef}
        stage={stage}
        chapterIndex={chapterIndex}
        lang={lang}
        expanded={lensExpanded}
        onToggleExpand={() => setLensExpanded((v) => !v)}
        onScrollToCta={() => scrollToProgress(0.98)}
        onScrollToFirstChapter={() => scrollToProgress(CHAPTER_SCROLL_TARGETS[0])}
        engineFormation={engineFormation}
        onSelectFormation={setEngineFormation}
        policyIdx={policyIdx}
        onSelectPolicy={setPolicyIdx}
        onCopyText={copyText}
        onOpenQr={() => setModal('qr')}
      />

      <ChapterNav
        lang={lang}
        visible={stage === 'chapter'}
        activeIndex={chapterIndex}
        onSelectChapter={(idx) => scrollToProgress(CHAPTER_SCROLL_TARGETS[idx])}
      />

      <FinTaxWorkbench
        ref={wbRef}
        mounted={wbMounted}
        lang={lang}
        onCopyCli={() =>
          copyText(
            LINKS.cliInstall,
            lang === 'zh' ? '已复制 DSH 插件安装命令' : 'Copied CLI install command'
          )
        }
        onOpenQr={() => setModal('qr')}
      />

      <footer ref={footerRef} className="corner-footer" style={{ opacity: 0 }}>
        <span>{copy.footerLeft}</span>
        <button type="button" onClick={() => setModal('disclaimer')}>
          {copy.footerRight}
        </button>
      </footer>

      {modal === 'qr' && (
        <div className="modal-backdrop" onClick={() => setModal(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong style={{ fontSize: '15px' }}>
                {lang === 'zh' ? 'IMA 跨境财税知识库' : 'IMA Cross-Border FinTax KB'}
              </strong>
              <button
                type="button"
                className="glass-btn glass-icon-btn"
                style={{ width: '30px', height: '30px' }}
                onClick={() => setModal(null)}
                aria-label="Close"
              >
                <X size={14} />
              </button>
            </div>
            <img
              src={assetUrl('/media/ima_qr.png')}
              alt={lang === 'zh' ? 'IMA 知识库官方二维码' : 'Official Tencent IMA Knowledge Base QR Code'}
              className="modal-qr"
            />
            <p style={{ fontSize: '12.5px', color: 'var(--text2)', lineHeight: 1.6 }}>
              {lang === 'zh'
                ? `微信 / 腾讯 IMA 扫码直达《跨境电商财税合规｜出口退税与平台数据报送》。免会员可先浏览 ${PORTAL_METRICS.imaFreePublicGuides} 篇免费公开问答橱窗；完整版含 ${PORTAL_METRICS.imaTotalDocs} 条内容与 ${PORTAL_METRICS.imaWorkbooks} 本零漂移联动 Excel。`
                : `Scan via WeChat or Tencent IMA to open "Cross-Border FinTax Compliance | Export Rebates & Platform Reporting". Browse ${PORTAL_METRICS.imaFreePublicGuides} free public guides with no membership required; the full edition includes ${PORTAL_METRICS.imaTotalDocs} items and ${PORTAL_METRICS.imaWorkbooks} zero-drift linked Excel workbooks.`}
            </p>
            <button
              type="button"
              className="glass-btn primary"
              onClick={() =>
                copyText(
                  LINKS.wechat,
                  lang === 'zh'
                    ? '已复制微信 emjj6666（备注：IMA对账 / IMA退税 / 十月回测）'
                    : 'Copied WeChat ID: emjj6666 (Note: IMA Audit / Rebate / Oct Backtest)'
                )
              }
            >
              {lang === 'zh' ? `复制主理人微信 ${LINKS.wechat}` : `Copy Curator WeChat ${LINKS.wechat}`}
            </button>
          </div>
        </div>
      )}

      {modal === 'disclaimer' && (
        <div className="modal-backdrop" onClick={() => setModal(null)}>
          <div className="modal-card" style={{ textAlign: 'left' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong style={{ fontSize: '15px' }}>{copy.disclaimerTitle}</strong>
              <button
                type="button"
                className="glass-btn glass-icon-btn"
                style={{ width: '30px', height: '30px' }}
                onClick={() => setModal(null)}
                aria-label="Close"
              >
                <X size={14} />
              </button>
            </div>
            <p style={{ fontSize: '12.5px', color: 'var(--text2)', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
              {copy.disclaimerBody}
            </p>
          </div>
        </div>
      )}

      {toast && <div className="toast-banner">{toast}</div>}

      <main className="scroll-track" aria-hidden="true" />
    </div>
  );
}
