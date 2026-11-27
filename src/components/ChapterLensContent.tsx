import { Check, Copy, ExternalLink, QrCode, Terminal } from 'lucide-react';
import { useState } from 'react';
import {
  CHANNELS_DATA,
  ENGINE_SCENARIOS,
  FormationId,
  LINKS,
  Lang,
  POLICY_MILESTONES,
  PORTAL_METRICS,
} from '../config/fintaxConfig';

interface ChapterLensContentProps {
  chapterIndex: number;
  lang: Lang;
  engineFormation: FormationId;
  onSelectFormation: (f: FormationId) => void;
  policyIdx: number;
  onSelectPolicy: (idx: number) => void;
  onCopyText: (text: string, msg: string) => void;
  onOpenQr: () => void;
}

export function ChapterLensContent({
  chapterIndex,
  lang,
  engineFormation,
  onSelectFormation,
  policyIdx,
  onSelectPolicy,
  onCopyText,
  onOpenQr,
}: ChapterLensContentProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeScenario, setActiveScenario] = useState(0);

  const doCopy = (key: string, text: string, msg: string) => {
    onCopyText(text, msg);
    setCopiedKey(key);
    window.setTimeout(() => setCopiedKey(null), 1600);
  };

  if (chapterIndex === 0) {
    const platforms = lang === 'zh' ? CHANNELS_DATA.platforms : CHANNELS_DATA.enPlatforms;
    const wallets = lang === 'zh' ? CHANNELS_DATA.wallets : CHANNELS_DATA.enWallets;
    return (
      <div className="lens-widget-card">
        <div className="chip-grid">
          {platforms.map((p) => (
            <span key={p} className="ch-chip">
              {p}
            </span>
          ))}
          {wallets.map((w) => (
            <span key={w} className="ch-chip wallet">
              {w}
            </span>
          ))}
        </div>

        <div className="stage-rail">
          <div className="stage-box">
            <strong>{lang === 'zh' ? '① 平台放款' : '① Platform Payout'}</strong>
            <small>
              {lang === 'zh'
                ? `${PORTAL_METRICS.pluginPlatforms} 大平台/收单`
                : `${PORTAL_METRICS.pluginPlatforms} Platforms / Gateways`}
            </small>
          </div>
          <div className="stage-box">
            <strong>{lang === 'zh' ? '② 结汇入账' : '② FX Settlement'}</strong>
            <small>
              {lang === 'zh'
                ? `${PORTAL_METRICS.pluginWallets} 大通道防重`
                : `${PORTAL_METRICS.pluginWallets} Wallets De-duped`}
            </small>
          </div>
          <div className="stage-box" style={{ borderColor: 'var(--accent)' }}>
            <strong>{lang === 'zh' ? '③ 银行回单核销' : '③ Stage 3 Receipt'}</strong>
            <small>{lang === 'zh' ? 'Stage 3 · 5 键核销' : '5-Key Bank Match'}</small>
          </div>
        </div>

        <div className="cli-bar">
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
            <Terminal size={13} color="var(--accent)" />
            <code style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {LINKS.cliInstall}
            </code>
          </span>
          <button
            type="button"
            className="glass-btn"
            style={{ padding: '4px 10px', fontSize: '11px', flexShrink: 0 }}
            onClick={() =>
              doCopy(
                'cli',
                LINKS.cliInstall,
                lang === 'zh' ? '已复制 DSH 插件安装命令' : 'CLI install command copied'
              )
            }
          >
            {copiedKey === 'cli' ? <Check size={12} /> : <Copy size={12} />}
            {copiedKey === 'cli' ? 'OK' : lang === 'zh' ? '复制' : 'Copy'}
          </button>
        </div>
      </div>
    );
  }

  if (chapterIndex === 1) {
    const current = ENGINE_SCENARIOS[activeScenario] ?? ENGINE_SCENARIOS[0];
    return (
      <div className="lens-widget-card">
        <div className="scenario-grid">
          {ENGINE_SCENARIOS.map((sc, idx) => (
            <button
              key={sc.id}
              type="button"
              className={`scenario-btn ${activeScenario === idx || engineFormation === sc.formation ? 'active' : ''}`}
              onClick={() => {
                setActiveScenario(idx);
                onSelectFormation(sc.formation);
              }}
            >
              <span>{lang === 'zh' ? sc.label : sc.enLabel}</span>
              <small>{lang === 'zh' ? sc.metric : sc.enMetric}</small>
            </button>
          ))}
        </div>
        <div className="scenario-detail">
          <strong style={{ color: 'var(--accent)', fontFamily: 'var(--f-mono)', marginRight: '6px' }}>
            [{current.formation.toUpperCase()}]
          </strong>
          {lang === 'zh' ? current.summary : current.enSummary}
        </div>
      </div>
    );
  }

  if (chapterIndex === 2) {
    const m = POLICY_MILESTONES[policyIdx] ?? POLICY_MILESTONES[0];
    return (
      <div className="lens-widget-card">
        <div className="policy-tabs">
          {POLICY_MILESTONES.map((item, idx) => (
            <button
              key={item.id}
              type="button"
              className={`policy-tab ${policyIdx === idx ? 'active' : ''}`}
              onClick={() => onSelectPolicy(idx)}
            >
              <strong>{item.workbook.split(' ')[0]}</strong>
              <small>{item.date}</small>
            </button>
          ))}
        </div>

        <div className="policy-box">
          <div className="policy-box-title">{lang === 'zh' ? m.title : m.enTitle}</div>
          <div className="policy-box-meta">
            {lang === 'zh' ? m.workbook : m.enWorkbook} · {lang === 'zh' ? m.impact : m.enImpact}
          </div>
          <div className="policy-box-desc">{lang === 'zh' ? m.detail : m.enDetail}</div>
        </div>

        <input
          type="range"
          min={0}
          max={3}
          step={1}
          value={policyIdx}
          onChange={(e) => onSelectPolicy(Number(e.target.value))}
          className="tl-range"
          aria-label="Policy milestone scrubber"
        />
      </div>
    );
  }

  return (
    <div className="lens-widget-card">
      <div className="tier-grid">
        <div className="tier-col">
          <strong>{lang === 'zh' ? 'dsh-fintax 开源插件' : 'dsh-fintax Open-Source Plugin'}</strong>
          <div>
            {lang === 'zh'
              ? `MIT 开源免费 · ${PORTAL_METRICS.pluginChannels} 通道与 Stage 3 银行回单核销 · ${PORTAL_METRICS.pluginEngines} 个引擎 · 零推广月结核对单`
              : `MIT free & open-source · ${PORTAL_METRICS.pluginChannels}-channel & Stage 3 bank receipt audit · ${PORTAL_METRICS.pluginEngines} deterministic engines · Ad-free export`}
          </div>
        </div>
        <div className="tier-col">
          <strong>{lang === 'zh' ? 'IMA 免费公开橱窗' : 'IMA Free Preview'}</strong>
          <div>
            {lang === 'zh'
              ? `免会员可查 ${PORTAL_METRICS.imaFreePublicGuides} 篇高频排雷问答 · 四层口径速查 · 风险应急入口`
              : `${PORTAL_METRICS.imaFreePublicGuides} free public guides (no membership needed) · 4-layer bridge quick ref · Risk response SOPs`}
          </div>
        </div>
        <div className="tier-col highlight">
          <strong>{lang === 'zh' ? 'IMA 完整版知识库' : 'IMA Full Pro KB'}</strong>
          <div>
            {lang === 'zh'
              ? `${PORTAL_METRICS.imaTotalDocs} 条内容 · ${PORTAL_METRICS.imaWorkbooks} 本零漂移联动 Excel（${PORTAL_METRICS.imaFormulas} 公式）· ${PORTAL_METRICS.imaHsCodes} 税号原件`
              : `${PORTAL_METRICS.imaTotalDocs} items · ${PORTAL_METRICS.imaWorkbooks} zero-drift linked Excel workbooks (${PORTAL_METRICS.imaFormulas} formulas) · ${PORTAL_METRICS.imaHsCodes} verified HS codes`}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px', justifyContent: 'space-between' }}>
        <a
          href={LINKS.github}
          target="_blank"
          rel="noreferrer"
          className="glass-btn"
          style={{ padding: '6px 12px', fontSize: '11.5px' }}
        >
          <ExternalLink size={12} /> GitHub / npm
        </a>
        <button
          type="button"
          className="glass-btn"
          style={{ padding: '6px 12px', fontSize: '11.5px' }}
          onClick={onOpenQr}
        >
          <QrCode size={12} /> {lang === 'zh' ? '扫码逛 IMA' : 'IMA QR'}
        </button>
        <button
          type="button"
          className="glass-btn primary"
          style={{ padding: '6px 12px', fontSize: '11.5px' }}
          onClick={() =>
            doCopy(
              'wx',
              LINKS.wechat,
              lang === 'zh'
                ? '已复制微信号 emjj6666（可备注：十月回测 / IMA对账）'
                : 'WeChat emjj6666 copied'
            )
          }
        >
          {copiedKey === 'wx' ? <Check size={12} /> : <Copy size={12} />}
          {lang === 'zh' ? `微信 ${LINKS.wechat}` : `WeChat ${LINKS.wechat}`}
        </button>
      </div>
    </div>
  );
}
