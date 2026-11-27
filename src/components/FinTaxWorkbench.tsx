import { Layers, QrCode, ShieldCheck, Sliders, Terminal } from 'lucide-react';
import { forwardRef, useState } from 'react';
import { Lang, PORTAL_METRICS, SITE_COPY, assetUrl } from '../config/fintaxConfig';

interface FinTaxWorkbenchProps {
  mounted: boolean;
  lang: Lang;
  onCopyCli: () => void;
  onOpenQr: () => void;
}

interface WorkbenchMetricsItem {
  k: string;
  v: string;
  enK: string;
  enV: string;
}

interface WorkbenchScene {
  id: string;
  title: string;
  enTitle: string;
  tag: string;
  enTag?: string;
  kind: 'sandbox' | 'image';
  img?: string;
  caption?: string;
  enCaption?: string;
  group: 'sandbox' | 'plugin' | 'ima';
  metrics: WorkbenchMetricsItem[];
}

function fmtCnyEn(wan: number): string {
  if (wan >= 100) {
    const m = wan / 100;
    return `¥${Number.isInteger(m) ? m.toFixed(0) : wan % 10 === 0 ? m.toFixed(1) : m.toFixed(2)}M`;
  }
  const k = wan * 10;
  return `¥${Math.abs(k - Math.round(k)) < 0.05 ? Math.round(k) : k.toFixed(1)}k`;
}

const SCENES: WorkbenchScene[] = [
  {
    id: 'sandbox',
    title: '合规雷达与四层口径沙盘',
    enTitle: 'Live Radar & 4-Layer Sandbox',
    tag: 'INTERACTIVE',
    kind: 'sandbox',
    group: 'sandbox',
    metrics: [
      { k: '算账内核', v: 'BigInt 0.01 分', enK: 'Core Math', enV: 'BigInt 0.0001 CNY' },
      { k: '5万行实测', v: '0.55 秒离线', enK: '50k-Row Bench', enV: '0.55s Local Offline' },
      { k: '质量门禁', v: 'CI 全量单测 + 红队门禁', enK: 'Quality Gate', enV: 'Full CI Suite + Red-Team' },
    ],
  },
  {
    id: 'radar',
    title: `${PORTAL_METRICS.pluginChannels} 通道离线对账雷达`,
    enTitle: `${PORTAL_METRICS.pluginChannels}-Channel Offline Radar`,
    tag: 'dsh-fintax',
    kind: 'image',
    img: assetUrl('/media/showcase/statement-radar.webp'),
    caption: `界面示意图采自 v0.8.5 历史版本快照（现网插件已升级至 ${PORTAL_METRICS.pluginChannels} 大通道与 Stage 3 银行回单核销）`,
    enCaption: `UI preview captured from v0.8.5 historical snapshot (live plugin upgraded to ${PORTAL_METRICS.pluginChannels} channels & Stage 3 bank receipt matching)`,
    group: 'plugin',
    metrics: [
      {
        k: '覆盖通道',
        v: `${PORTAL_METRICS.pluginPlatforms} 平台 + ${PORTAL_METRICS.pluginWallets} 结汇`,
        enK: 'Channels',
        enV: `${PORTAL_METRICS.pluginPlatforms} Platforms + ${PORTAL_METRICS.pluginWallets} Wallets`,
      },
      {
        k: '三段核销',
        v: '放款→结汇→Stage 3 回单',
        enK: '3-Stage Audit',
        enV: 'Payout → FX → Stage 3 Receipt',
      },
      { k: '防重复机制', v: 'Shopify+PayPal/Stripe', enK: 'De-duplication', enV: 'Shopify + PayPal / Stripe' },
      { k: '主体归档', v: '多主体隔离防串账', enK: 'Entity Archive', enV: 'Multi-Entity Isolation' },
    ],
  },
  {
    id: 'engines',
    title: `${PORTAL_METRICS.pluginEngines} 大确定性算税引擎`,
    enTitle: `${PORTAL_METRICS.pluginEngines} Deterministic Tax Engines`,
    tag: 'dsh-fintax',
    kind: 'image',
    img: assetUrl('/media/showcase/calc-engines.webp'),
    caption: `界面示意图采自 v0.8.5 历史版本快照（现网插件已升级至 ${PORTAL_METRICS.pluginEngines} 大确定性算税引擎）`,
    enCaption: `UI preview captured from v0.8.5 historical snapshot (live plugin upgraded to ${PORTAL_METRICS.pluginEngines} deterministic tax engines)`,
    group: 'plugin',
    metrics: [
      {
        k: '引擎数量',
        v: `${PORTAL_METRICS.pluginEngines} 个引擎 / ${PORTAL_METRICS.pluginTools} 工具 / ${PORTAL_METRICS.pluginSkills} 技能`,
        enK: 'Engine Suite',
        enV: `${PORTAL_METRICS.pluginEngines} Engines / ${PORTAL_METRICS.pluginTools} Tools / ${PORTAL_METRICS.pluginSkills} Skills`,
      },
      { k: '运行时依赖', v: '0 第三方依赖 · 纯 ESM', enK: 'Runtime Deps', enV: 'Zero 3rd-Party · Pure ESM' },
      { k: '开源协议', v: 'MIT · 持续迭代', enK: 'License', enV: 'MIT · Actively Maintained' },
      { k: '安装渠道', v: 'GitHub / npm / DSH 市场', enK: 'Distribution', enV: 'GitHub / npm / DSH Market' },
    ],
  },
  {
    id: 'e2e',
    title: 'DSH 客户端实机算税',
    enTitle: 'DSH Desktop E2E Run',
    tag: 'dsh-fintax',
    kind: 'image',
    img: assetUrl('/media/showcase/e2e-tax.webp'),
    group: 'plugin',
    metrics: [
      { k: '运行环境', v: 'DSH Desktop 侧栏', enK: 'Environment', enV: 'DSH Desktop Sidebar' },
      { k: '无网可用', v: '免配 IMA 离线运行', enK: 'Offline Ready', enV: 'Runs Offline w/o IMA' },
      { k: '导出格式', v: 'HTML/PDF/MD/CSV', enK: 'Export Formats', enV: 'HTML / PDF / MD / CSV' },
    ],
  },
  {
    id: 'diag02a',
    title: 'IMA 四层口径全景图 02A',
    enTitle: 'IMA 4-Layer Bridge 02A',
    tag: 'IMA 知识库',
    enTag: 'IMA KB',
    kind: 'image',
    img: assetUrl('/media/showcase/diagram-02a.webp'),
    group: 'ima',
    metrics: [
      {
        k: '全库规模',
        v: `${PORTAL_METRICS.imaModules} 模块 / ${PORTAL_METRICS.imaTotalDocs} 条内容`,
        enK: 'KB Scale',
        enV: `${PORTAL_METRICS.imaModules} Modules / ${PORTAL_METRICS.imaTotalDocs} Items`,
      },
      {
        k: 'Excel 底稿',
        v: `${PORTAL_METRICS.imaWorkbooks} 本 / ${PORTAL_METRICS.imaWorksheets} 工作表`,
        enK: 'Excel Workbooks',
        enV: `${PORTAL_METRICS.imaWorkbooks} Books / ${PORTAL_METRICS.imaWorksheets} Sheets`,
      },
      {
        k: '重算验证',
        v: `${PORTAL_METRICS.imaFormulas} 公式 / 0 漂移`,
        enK: 'Formula Audit',
        enV: `${PORTAL_METRICS.imaFormulas} Formulas / 0 Drift`,
      },
      { k: '更新机制', v: '10 项政策金丝雀追踪', enK: 'Policy Watch', enV: '10 Policy Canaries' },
    ],
  },
  {
    id: 'diag25a',
    title: '出口税收待遇判断树 25A',
    enTitle: 'Export Tax Decision Tree 25A',
    tag: 'IMA 知识库',
    enTag: 'IMA KB',
    kind: 'image',
    img: assetUrl('/media/showcase/diagram-25a.webp'),
    group: 'ima',
    metrics: [
      {
        k: '官源税号',
        v: `${PORTAL_METRICS.imaHsCodes} / ${PORTAL_METRICS.imaHsCodes} 零差异`,
        enK: 'Verified HS Codes',
        enV: `${PORTAL_METRICS.imaHsCodes} / ${PORTAL_METRICS.imaHsCodes} Zero-Diff`,
      },
      { k: '原版 PDF', v: '财政部 2026#2 & #29', enK: 'Official PDFs', enV: 'MOF Notices 2026#2 & #29' },
      { k: '稽查铁案', v: '10 起官源案例矩阵', enK: 'Audit Cases', enV: '10 Official Audit Cases' },
      {
        k: '免费橱窗',
        v: `${PORTAL_METRICS.imaFreePublicGuides} 篇公开问答免会员`,
        enK: 'Free Showcase',
        enV: `${PORTAL_METRICS.imaFreePublicGuides} Free Public Guides`,
      },
    ],
  },
];

export const FinTaxWorkbench = forwardRef<HTMLElement, FinTaxWorkbenchProps>(
  function FinTaxWorkbench({ mounted, lang, onCopyCli, onOpenQr }, ref) {
    const copy = SITE_COPY[lang];
    const [sceneIdx, setSceneIdx] = useState(0);

    // Interactive Sandbox State (illustrative statutory thresholds & 4-layer bridge)
    const [annualWan, setAnnualWan] = useState(460); // 100..9000 万
    const [feePct, setFeePct] = useState(32); // 10..48%
    const [transitPct, setTransitPct] = useState(9); // 0..25%

    if (!mounted) return null;

    const scene = SCENES[sceneIdx];
    const vatPct = Math.min(100, Math.round((annualWan / 500) * 100));
    const cliffPct = Math.min(100, Math.round((annualWan / 7500) * 100));
    const deemedProfit = annualWan * 0.04; // 4% 核定应纳税所得额（万元）
    const estCitWan = deemedProfit <= 300 ? deemedProfit * 0.05 : deemedProfit * 0.25;
    const overVat500 = annualWan > 500;
    const overCliff = annualWan > 7500;

    // Monthly 4-layer bridge demo (万元)
    const monthlyReport = annualWan / 12;
    const feeAmt = (monthlyReport * feePct) / 100;
    const transitAmt = (monthlyReport * transitPct) / 100;
    const bankNet = Math.max(0, monthlyReport - feeAmt - transitAmt);

    return (
      <section
        ref={ref}
        className="wb-wrap"
        style={{
          opacity: 0,
          transform: 'translate3d(0, 24px, 0) scale(0.97)',
          pointerEvents: 'none',
          willChange: 'transform, opacity',
        }}
        aria-label="FinTax Interactive Dual-Engine Workbench"
      >
      <div className="wb-badge">{copy.wbBadge}</div>

      <div className="wb-window">
        <div className="wb-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#a1a1aa' }}>
            <ShieldCheck size={14} color="#a3be72" />
            <strong style={{ color: '#fafafa' }}>FINTAX</strong>
            <span className="wb-topbar-sub" style={{ fontFamily: 'var(--f-mono)', fontSize: '10.5px' }}>
              dsh-fintax × IMA
            </span>
          </div>

          <div
            style={{
              display: 'inline-flex',
              gap: '4px',
              background: '#1c1c21',
              padding: '3px',
              borderRadius: '999px',
              fontSize: '11px',
            }}
          >
            {[
              { id: 'sandbox', label: lang === 'zh' ? '合规沙盘' : 'Sandbox', idx: 0 },
              { id: 'plugin', label: 'dsh-fintax', idx: 1 },
              { id: 'ima', label: lang === 'zh' ? 'IMA 知识库' : 'IMA KB', idx: 4 },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSceneIdx(tab.idx)}
                style={{
                  border: 0,
                  cursor: 'pointer',
                  padding: '3px 10px',
                  borderRadius: '999px',
                  background: scene.group === tab.id ? '#2e2e36' : 'transparent',
                  color: scene.group === tab.id ? '#fafafa' : '#8e8e98',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div style={{ justifySelf: 'end', display: 'inline-flex', gap: '6px' }}>
            <button
              type="button"
              onClick={onCopyCli}
              style={{
                border: '1px solid rgba(255,255,255,0.14)',
                background: '#202026',
                color: '#fafafa',
                borderRadius: '999px',
                padding: '4px 10px',
                fontSize: '11px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <Terminal size={11} /> CLI
            </button>
            <button
              type="button"
              onClick={onOpenQr}
              style={{
                border: '1px solid rgba(163,190,114,0.35)',
                background: '#1c2419',
                color: '#cbe39b',
                borderRadius: '999px',
                padding: '4px 10px',
                fontSize: '11px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <QrCode size={11} /> IMA
            </button>
          </div>
        </div>

        <div className="wb-main">
          <aside className="wb-col wb-col-left">
            <div style={{ fontSize: '10.5px', color: '#71717a', marginBottom: '8px', fontWeight: 600 }}>
              {lang === 'zh' ? 'SCENES / 实景视图' : 'SCENES / LIVE VIEWS'}
            </div>
            {SCENES.map((s, idx) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSceneIdx(idx)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  border: 0,
                  cursor: 'pointer',
                  fontSize: '11.5px',
                  padding: '7px 8px',
                  borderRadius: '8px',
                  marginBottom: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '7px',
                  background: sceneIdx === idx ? '#24242c' : 'transparent',
                  color: sceneIdx === idx ? '#fafafa' : '#9ca3af',
                }}
              >
                {s.kind === 'sandbox' ? <Sliders size={12} color="#ff5426" /> : <Layers size={12} />}
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {lang === 'zh' ? s.title : s.enTitle}
                </span>
              </button>
            ))}
          </aside>

          <div className="wb-viewport">
            {scene.kind === 'image' && scene.img ? (
              <figure className="wb-img-frame">
                <img src={scene.img} alt={lang === 'zh' ? scene.title : scene.enTitle} className="wb-img-stage" />
                {(lang === 'zh' ? scene.caption : scene.enCaption) && (
                  <figcaption className="wb-img-caption">
                    {lang === 'zh' ? scene.caption : scene.enCaption}
                  </figcaption>
                )}
              </figure>
            ) : (
              <div className="wb-sandbox">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600 }}>
                      {lang === 'zh'
                        ? '双指针合规雷达 × 四层口径月度桥接试算'
                        : 'Dual Compliance Radar × Monthly 4-Layer Bridge'}
                    </div>
                    <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>
                      {lang === 'zh'
                        ? '拖动右侧滑块，体验 500 万一般纳税人警戒与 7,500 万核定小微崖（15万→80万）'
                        : 'Drag inspector sliders to test 5M VAT threshold & 75M CIT cliff'}
                    </div>
                  </div>
                  <span
                    style={{
                      fontFamily: 'var(--f-mono)',
                      fontSize: '10.5px',
                      padding: '3px 8px',
                      borderRadius: '999px',
                      background: overCliff ? 'rgba(255,84,38,0.2)' : 'rgba(163,190,114,0.16)',
                      color: overCliff ? '#ff7a52' : '#cbe39b',
                    }}
                  >
                    {overCliff
                      ? lang === 'zh'
                        ? 'P0 · 触发 7,500 万崖'
                        : 'P0 · Over ¥75M CIT Cliff'
                      : overVat500
                        ? lang === 'zh'
                          ? 'P1 · 超过 500 万一般纳税人线'
                          : 'P1 · Over ¥5M VAT Line'
                        : lang === 'zh'
                          ? 'NORMAL · 区间内'
                          : 'NORMAL · Within Threshold'}
                  </span>
                </div>

                {/* Olive-Green Braun LCD Readouts */}
                <div className="wb-lcd-strip">
                  <div className="wb-lcd-cell">
                    <small>{lang === 'zh' ? '500万 一般纳税人参考' : '¥5M General VAT Ref'}</small>
                    <strong style={{ color: overVat500 ? '#ff8b66' : '#cbe39b' }}>
                      {vatPct}% ({lang === 'zh' ? `${annualWan}万` : fmtCnyEn(annualWan)})
                    </strong>
                  </div>
                  <div className="wb-lcd-cell">
                    <small>{lang === 'zh' ? '7,500万 4%核定小微崖' : '¥75M 4% CIT Cliff'}</small>
                    <strong style={{ color: overCliff ? '#ff8b66' : '#cbe39b' }}>
                      {cliffPct}% · {lang === 'zh' ? `税 ${estCitWan.toFixed(1)}万` : `Tax ${fmtCnyEn(estCitWan)}`}
                    </strong>
                  </div>
                  <div className="wb-lcd-cell">
                    <small>{lang === 'zh' ? '月度净回款率 / 口径桥平' : 'Net Payout / Reconciled'}</small>
                    <strong>
                      {Math.max(0, 100 - feePct - transitPct)}% · {lang === 'zh' ? '差额 ¥0.00' : 'Diff ¥0.00'}
                    </strong>
                  </div>
                </div>

                {/* Visual 4-Layer Bridge Bar */}
                <div
                  style={{
                    background: '#141418',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '10px',
                    padding: '12px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '6px',
                      justifyContent: 'space-between',
                      fontFamily: 'var(--f-mono)',
                      fontSize: '11px',
                      color: '#a1a1aa',
                      marginBottom: '8px',
                    }}
                  >
                    <span>
                      {lang === 'zh'
                        ? `月均报送 ¥${monthlyReport.toFixed(1)}万`
                        : `Monthly Report ${fmtCnyEn(monthlyReport)}`}
                    </span>
                    <span>{lang === 'zh' ? `− 扣费 ¥${feeAmt.toFixed(1)}万` : `− Fees ${fmtCnyEn(feeAmt)}`}</span>
                    <span>
                      {lang === 'zh' ? `− 在途 ¥${transitAmt.toFixed(1)}万` : `− In-Transit ${fmtCnyEn(transitAmt)}`}
                    </span>
                    <span style={{ color: '#cbe39b' }}>
                      {lang === 'zh' ? `= 实收 ¥${bankNet.toFixed(1)}万` : `= Bank Net ${fmtCnyEn(bankNet)}`}
                    </span>
                  </div>
                  <div
                    style={{
                      height: '12px',
                      borderRadius: '999px',
                      overflow: 'hidden',
                      display: 'flex',
                      background: '#222228',
                    }}
                  >
                    <div style={{ width: `${Math.max(5, 100 - feePct - transitPct)}%`, background: '#a3be72' }} />
                    <div style={{ width: `${feePct}%`, background: '#ff5426' }} />
                    <div style={{ width: `${transitPct}%`, background: '#5282ff' }} />
                  </div>
                </div>

                <div style={{ fontSize: '10.5px', color: '#71717a', fontFamily: 'var(--f-mono)' }}>
                  {lang === 'zh'
                    ? '* 演示用公开法定阈值与口径模型，不构成正式税务申报或鉴证意见；完整多主体联动底稿见 IMA 知识库。'
                    : '* Illustrative statutory thresholds & 4-layer model only; not formal tax or audit advice. Full multi-entity workbooks in IMA KB.'}
                </div>
              </div>
            )}
          </div>

          <aside className="wb-col wb-col-right">
            <div style={{ fontSize: '10.5px', color: '#71717a', marginBottom: '10px', fontWeight: 600 }}>
              {scene.kind === 'sandbox'
                ? lang === 'zh'
                  ? 'SANDBOX / 交互参数'
                  : 'SANDBOX / PARAMETERS'
                : lang === 'zh'
                  ? 'VERIFIED SPECS / 实盘指标'
                  : 'VERIFIED SPECS'}
            </div>

            {scene.kind === 'sandbox' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', color: '#a1a1aa' }}>
                    <span>{lang === 'zh' ? '年化营收规模' : 'Annual Revenue'}</span>
                    <strong style={{ fontFamily: 'var(--f-mono)', color: '#fafafa' }}>
                      {lang === 'zh' ? `${annualWan} 万` : fmtCnyEn(annualWan)}
                    </strong>
                  </span>
                  <input
                    type="range"
                    min={100}
                    max={9000}
                    step={50}
                    value={annualWan}
                    onChange={(e) => setAnnualWan(Number(e.target.value))}
                    className="insp-slider"
                  />
                </label>

                <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', color: '#a1a1aa' }}>
                    <span>{lang === 'zh' ? '平台佣金/广告扣费' : 'Platform & Ad Fees'}</span>
                    <strong style={{ fontFamily: 'var(--f-mono)', color: '#fafafa' }}>{feePct}%</strong>
                  </span>
                  <input
                    type="range"
                    min={10}
                    max={48}
                    value={feePct}
                    onChange={(e) => setFeePct(Number(e.target.value))}
                    className="insp-slider"
                  />
                </label>

                <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', color: '#a1a1aa' }}>
                    <span>{lang === 'zh' ? '跨月在途资金占比' : 'Cross-Month In-Transit'}</span>
                    <strong style={{ fontFamily: 'var(--f-mono)', color: '#fafafa' }}>{transitPct}%</strong>
                  </span>
                  <input
                    type="range"
                    min={0}
                    max={25}
                    value={transitPct}
                    onChange={(e) => setTransitPct(Number(e.target.value))}
                    className="insp-slider"
                  />
                </label>

                <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginTop: '2px' }}>
                  {[480, 7500, 8000].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setAnnualWan(preset)}
                      style={{
                        border: '1px solid rgba(255,255,255,0.14)',
                        background: annualWan === preset ? '#ff5426' : '#1e1e24',
                        color: '#fafafa',
                        borderRadius: '6px',
                        padding: '3px 7px',
                        fontFamily: 'var(--f-mono)',
                        fontSize: '10.5px',
                        cursor: 'pointer',
                      }}
                    >
                      {lang === 'zh' ? `${preset}万` : fmtCnyEn(preset)}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {scene.metrics.map((m) => (
                  <div
                    key={m.k}
                    style={{
                      padding: '8px 10px',
                      borderRadius: '8px',
                      background: '#19191e',
                      border: '1px solid rgba(255,255,255,0.07)',
                    }}
                  >
                    <div style={{ fontSize: '10.5px', color: '#8e8e98' }}>{lang === 'zh' ? m.k : m.enK}</div>
                    <div style={{ fontFamily: 'var(--f-mono)', fontSize: '12px', color: '#f4f4f5', marginTop: '2px' }}>
                      {lang === 'zh' ? m.v : m.enV}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </aside>
        </div>

        <div className="wb-storyboard">
          {SCENES.map((s, idx) => (
            <button
              key={s.id}
              type="button"
              className={`sb-card ${sceneIdx === idx ? 'active' : ''}`}
              onClick={() => setSceneIdx(idx)}
            >
              <span>{lang === 'zh' ? s.title : s.enTitle}</span>
              <small>{lang === 'zh' ? s.tag : (s.enTag ?? s.tag)}</small>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
});
