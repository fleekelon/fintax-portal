import { Check, Copy, ExternalLink, QrCode, Terminal } from 'lucide-react';
import { useState } from 'react';
import {
  CHANNELS_DATA,
  ENGINE_SCENARIOS,
  FormationId,
  LINKS,
  Lang,
  POLICY_MILESTONES,
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
    return (
      <div className="lens-widget-card">
        <div className="chip-grid">
          {CHANNELS_DATA.platforms.map((p) => (
            <span key={p} className="ch-chip">
              {p}
            </span>
          ))}
          {CHANNELS_DATA.wallets.map((w) => (
            <span key={w} className="ch-chip wallet">
              {w}
            </span>
          ))}
        </div>

        <div className="stage-rail">
          <div className="stage-box">
            <strong>① 平台放款</strong>
            <small>8 大平台/收单</small>
          </div>
          <div className="stage-box">
            <strong>② 结汇入账</strong>
            <small>3 大通道防重</small>
          </div>
          <div className="stage-box" style={{ borderColor: 'var(--accent)' }}>
            <strong>③ 待核回单</strong>
            <small>pending_bank_receipt</small>
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
              <small>{sc.metric}</small>
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
            {m.workbook} · {lang === 'zh' ? m.impact : m.enImpact}
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
          <strong>dsh-fintax 开源插件</strong>
          <div>MIT 开源免费 · 11 通道离线对账 · 10 引擎 · 零推广月结核对单导出</div>
        </div>
        <div className="tier-col">
          <strong>IMA 免费公开橱窗</strong>
          <div>免会员可查 12 篇高频排雷问答 · 四层口径速查 · 风险应急入口</div>
        </div>
        <div className="tier-col highlight">
          <strong>IMA 完整版知识库</strong>
          <div>279 条内容 · 100 本零漂移联动 Excel（60,107 公式）· 362 税号原件</div>
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
          微信 {LINKS.wechat}
        </button>
      </div>
    </div>
  );
}
