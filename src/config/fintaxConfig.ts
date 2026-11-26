/// <reference types="vite/client" />

export type Lang = 'zh' | 'en';
export type Theme = 'light' | 'dark';
export type HeroMode = 'breathe' | 'float';
export type FormationId = 'grid' | 'ring' | 'helix' | 'sphere' | 'cylinder' | 'stack';
export type ChapterId = 'offline' | 'engines' | 'ima' | 'delivery';

export function assetUrl(path: string): string {
  if (/^(https?:|data:|blob:)/i.test(path)) return path;
  const clean = path.replace(/^\/+/, '');
  const base = import.meta.env.BASE_URL || './';
  return base.endsWith('/') ? `${base}${clean}` : `${base}/${clean}`;
}

export interface MediaItem {
  id: string;
  src: string;
  title: string;
  tag: string;
}

export const LINKS = {
  github: 'https://github.com/fleekelon/dsh-fintax',
  npm: 'https://www.npmjs.com/package/dsh-fintax',
  cliInstall: 'dsh plugin --profile desktop add dsh-fintax',
  wechat: 'emjj6666',
  email: '381101869@qq.com',
  author: 'Frank (fleekelon)',
};

export const CHANNELS_DATA = {
  platforms: [
    'Amazon',
    'TikTok Shop',
    'Temu (半/全托管)',
    'AliExpress (POP/Choice)',
    'Shopee',
    'Shopify 独立站',
    'PayPal 资金池',
    'Stripe',
  ],
  wallets: ['WorldFirst 万里汇', 'Payoneer 派安盈', 'Airwallex 空中云汇'],
};

export interface EngineScenario {
  id: string;
  formation: FormationId;
  label: string;
  enLabel: string;
  metric: string;
  summary: string;
  enSummary: string;
}

export const ENGINE_SCENARIOS: EngineScenario[] = [
  {
    id: 'vat500',
    formation: 'ring',
    label: '500万登记雷达',
    enLabel: '5M VAT Radar',
    metric: '≤12月 / 4季滚动',
    summary: '连续 12 月/4 季超过 500 万一般纳税人登记阈值动态预警，自动分离缺档月与确认零收入月。',
    enSummary: 'Rolling 12-month >5M CNY general VAT taxpayer threshold monitor.',
  },
  {
    id: 'cliff7500',
    formation: 'sphere',
    label: '7500万小微崖',
    enLabel: '75M CIT Cliff',
    metric: '15万 → 80万 (8000万)',
    summary: '4% 核定下对应 300 万所得额崖：7,500 万缴 15 万，超崖全额按 25% 计税（8,000 万时达 80 万）。',
    enSummary: 'At 4% deemed profit rate, 75M owes 150k; crossing triggers flat 25% CIT (800k at 80M).',
  },
  {
    id: 'return16',
    formation: 'helix',
    label: '2026#16 退运',
    enLabel: '2026#16 Returns',
    metric: 'cbec_return_duty_exempt',
    summary: '跨境电商出口退运商品免征进口关税、增值税及消费税精准判定。',
    enSummary: 'Deterministic duty & VAT exemption check for cross-border return goods.',
  },
  {
    id: 'rebate9810',
    formation: 'cylinder',
    label: '9810 退税校准',
    enLabel: '9810 Rebate',
    metric: '次年 4 月汇算校准',
    summary: '海外仓预退税与实际实现销售口径次年 4 月底差额校准引擎。',
    enSummary: '9810 overseas warehouse pre-rebate vs actual sales reconciliation.',
  },
  {
    id: 'fiveStep',
    formation: 'grid',
    label: '五步免抵退',
    enLabel: '5-Step Rebate',
    metric: 'BigInt 0.01 分精度',
    summary: '生产企业免抵退税五步定点数核算，0 浮点误差、0 大模型幻觉。',
    enSummary: 'Manufacturer exempt-credit-refund 5-step BigInt fixed-point engine.',
  },
  {
    id: 'fourLayer',
    formation: 'stack',
    label: '四层口径桥接',
    enLabel: '4-Layer Bridge',
    metric: '报送→到账→账务→申报',
    summary: '把平台报送、订单扣费、在途余额与银行实收分层拆平，定位每一分差额。',
    enSummary: 'Bridges platform report, deductions, in-transit balance, and bank receipts.',
  },
];

export interface PolicyMilestone {
  id: string;
  date: string;
  workbook: string;
  title: string;
  enTitle: string;
  impact: string;
  enImpact: string;
  detail: string;
  enDetail: string;
}

export const POLICY_MILESTONES: PolicyMilestone[] = [
  {
    id: 'm1',
    date: '2026-04-01',
    workbook: '60A · 362项零差异字典',
    title: '295 项出口退税分期取消 + 67 项新能源车降 9%',
    enTitle: '295 HS Rebates Phased Out + 67 NEV Cut to 9%',
    impact: '2026#2 & #29 财政部原件逐码核验 362/362',
    enImpact: '362/362 verified against MOF 2026#2 & #29 official PDFs',
    detail: '光伏、8543400090 电子烟已取消退税；22 项电池以报关单出口日 2026-12-31 锁 6%、2027-01-01 归零（原则适用 2026#11 视同内销征税）；竹木与 8543400010 电子烟具 2027-04-01 取消。',
    enDetail: 'Solar & 8543400090 removed; 22 battery codes lock 6% through 2026-12-31 then 0% (deemed domestic VAT under 2026#11); bamboo/wood & 8543400010 end 2027-04-01.',
  },
  {
    id: 'm2',
    date: '2026-07 / 11',
    workbook: '18A · 欧盟低值包裹测算表',
    title: '欧盟 ≤€150 低值包裹每项多掏 €3 + €2',
    enTitle: 'EU Low-Value Parcels: +€3 Duty & +€2 Handling Fee',
    impact: '7 月起 €3 临时关税 + 11 月起 €2 处理费 + PID',
    enImpact: '€3 interim duty (Jul) + €2 handling fee (Nov) + PID filing',
    detail: '按税则归类项与计费项叠加计费，直邮小包毛利直接承压，需重算直邮 vs 欧盟本地仓成本。',
    enDetail: 'Per-tariff-line charges compress direct parcel margins; compare direct mail vs EU warehouse.',
  },
  {
    id: 'm3',
    date: '2026-09-01',
    workbook: '83A · 消费税与出口退免测算',
    title: '应税电池 2%→4% 消费税与 CMA 报告门禁',
    enTitle: 'Taxable Batteries 2%→4% Excise & CMA Gate',
    impact: '2026#20 公告 · 出口消费税退免照旧 · 成品充电宝/成套储能除外',
    enImpact: 'Notice 2026#20 · Export excise refund stays · Power banks/ESS excluded',
    detail: '锂原电池、锂离子电芯/电池组等应税电池 2026-09-01 起 2%、2027-09-01 起 4%，一般光伏电池 2027-04-01 起 2%、2028-04-01 起 4%；享 2% 减征与新技术免征均须符合国标并在首次申报前备齐有效 CMA 附表覆盖报告；成品充电宝、成套储能系统不在 2026#20 征税范围。',
    enDetail: 'Taxable lithium primary/ion cells & packs: 2% from Sep 2026, 4% from Sep 2027; standard PV cells: 2% from Apr 2027, 4% from Apr 2028. Valid CMA reports covering listed test items are required before first filing for both 2% relief and exemptions; finished power banks & integrated ESS are outside scope, and export excise refunds remain eligible.',
  },
  {
    id: 'm4',
    date: '2027-01 / 07',
    workbook: '62A · 美线清关与 IEEPA 退税',
    title: '美线 FIOR+CTPAT 强监管 / T86 暂停 & IEEPA 退税',
    enTitle: 'US FIOR+CTPAT Mandate, T86 Suspension & IEEPA Refund',
    impact: '2027-01-05 FIOR 生效 · Type 11 vs 9810 DDP 重算',
    enImpact: 'FIOR+CTPAT effective 2027-01-05 · Type 11 vs 9810 DDP + ACE CAPE',
    detail: '2027-01-05 起境外进口商（FIOR）须经 CTPAT 验证资质或 CTPAT 验证报关行清关（美司空壳 LLC 失效）；T86 暂停并将法定废除，同步梳理 CBP ACE CAPE / Form 4811 历史退税路径。',
    enDetail: 'From 2027-01-05, Foreign Importers of Record (FIOR) must clear via CTPAT-validated status or CTPAT-validated brokers; model post-T86 landing costs and track IEEPA refund claims via CBP ACE CAPE / Form 4811.',
  },
];

export const SITE_COPY = {
  zh: {
    heroModeBreathe: '呼吸矩阵',
    heroModeFloat: '悬浮景深',
    heroPrefix: '从每个维度，穿透你的',
    heroWords: ['平台账单', '四层口径', '退税风险', '月结底稿'],
    heroSuffix: '。',
    heroDesc:
      '开源离线插件 dsh-fintax × 腾讯 IMA 跨境财税知识库。原始账单 100% 留在本机，0.55 秒核完 5 万行对账，串联 100 本零误差联动 Excel 底稿。',
    heroCta: '安装插件 / 获取知识库',
    chapters: [
      {
        id: 'offline' as ChapterId,
        label: '离线初筛',
        enLabel: 'dsh-fintax Offline',
        title: '离线初筛',
        subtitle: '11 通道本机离线核对，0.55 秒跑完 50,000 行账单。',
        expandedSub: '纯 ESM 零第三方依赖，原账不出电脑；三段资金链诚实标定「待核银行回单」。',
      },
      {
        id: 'engines' as ChapterId,
        label: '算税引擎',
        enLabel: 'BigInt × 10 Engines',
        title: '算税引擎',
        subtitle: '告别大模型算账幻觉，BigInt 定点数 × 双指针合规雷达。',
        expandedSub: '点击下方 6 大高频财税场景，实时驱动背景 WebGL2 阵型变形并查看精确口径。',
      },
      {
        id: 'ima' as ChapterId,
        label: 'IMA 知识库',
        enLabel: 'IMA Knowledge Base',
        title: 'IMA 知识库',
        subtitle: '7 模块 · 279 条内容 · 100 本零漂移联动 Excel 底稿。',
        expandedSub: '拖动下方「2026–2027 影响利润的 4 笔钱」时间轴，直击对应官方税号与底稿编号。',
      },
      {
        id: 'delivery' as ChapterId,
        label: '双轨闭环',
        enLabel: 'Open-Source × Moat',
        title: '双轨闭环',
        subtitle: '开源插件做工具外壳与排雷，IMA 与私域母表构筑专业护城河。',
        expandedSub: '免费导出零推广《月结核对单》，再按需进阶 IMA 12 篇免费橱窗与完整版 100 本母表。',
      },
    ],
    wbBadge: '实时双引擎体验台 · 切换实机截图 / IMA 3200px 架构图 / 拖动沙盘滑块算税',
    ctaTitle: '原始账单留在本机。\n专业底稿与风控，交给我们。',
    ctaDesc:
      '免费直装开源插件跑通本月核对单，或扫码先逛 IMA 12 篇免费公开问答；11/20–12/10 同步招募 6 家跨境企业参与十月账单本地回测。',
    btnInstall: '复制安装命令',
    btnImaQr: '扫码看 IMA 公开橱窗',
    btnWechat: '复制微信 emjj6666',
    footerLeft: 'Frank (fleekelon) · dsh-fintax × 腾讯 IMA 跨境财税知识库',
    footerRight: '合规边界与离线隐私声明',
    disclaimerTitle: '合规边界与本机离线隐私声明',
    disclaimerBody:
      '1. 数据隐私：dsh-fintax 为纯 ESM 开源插件（零第三方运行时依赖），CSV/TSV/XLSX/ZIP 原始账单 100% 留在本机内存处理，不上传服务器。\n2. 合规边界：插件输出与页面沙盘测算仅用于原始账单本机离线初筛、差额定位与待补凭证跟进，不构成正式会计凭证、税务申报依据或鉴证意见。\n3. 双轨隔离：开源插件仅包含离线排雷与确定性算税引擎；完整政策解读、100 本联动 Excel 底稿与私域母表托管于腾讯 IMA 知识库。',
  },
  en: {
    heroModeBreathe: 'Breathe',
    heroModeFloat: 'Float',
    heroPrefix: 'Audit every angle of your ',
    heroWords: ['settlements', '4-layer bridge', 'export rebates', 'month-end ledger'],
    heroSuffix: '.',
    heroDesc:
      'Open-source offline plugin dsh-fintax × Tencent IMA FinTax KB. Raw statements stay 100% local, reconciling 50k rows in 0.55s alongside 100 verified Excel workbooks.',
    heroCta: 'Install / Explore KB',
    chapters: [
      {
        id: 'offline' as ChapterId,
        label: 'Offline Audit',
        enLabel: 'dsh-fintax Offline',
        title: 'Offline Audit',
        subtitle: '11-channel local reconciliation: 50,000 rows in ~0.55s.',
        expandedSub: 'Zero runtime dependencies. Raw statements stay local with honest 3-stage fund boundaries.',
      },
      {
        id: 'engines' as ChapterId,
        label: 'Tax Engines',
        enLabel: 'BigInt × 10 Engines',
        title: 'Tax Engines',
        subtitle: 'Zero LLM hallucination: BigInt fixed-point × dual compliance radar.',
        expandedSub: 'Pick any tax scenario below to morph the live 3D WebGL stage and inspect exact rules.',
      },
      {
        id: 'ima' as ChapterId,
        label: 'IMA KB',
        enLabel: 'IMA Knowledge Base',
        title: 'IMA Knowledge Base',
        subtitle: '7 modules · 279 docs · 100 zero-drift linked Excel workbooks.',
        expandedSub: 'Scrub the 2026–2027 4 profit-impacting policy milestones & matching workbooks.',
      },
      {
        id: 'delivery' as ChapterId,
        label: 'Dual Track',
        enLabel: 'Open-Source × Moat',
        title: 'Dual Track',
        subtitle: 'Open-source local engine + IMA professional knowledge moat.',
        expandedSub: 'Export ad-free month-end sheets locally, then unlock 12 free IMA guides or full 100 workbooks.',
      },
    ],
    wbBadge: 'Live FinTax Workbench · Inspect real UI captures, 3200px IMA diagrams & interactive tax sandbox',
    ctaTitle: 'Raw statements stay local.\nCompliance & workbooks, solved.',
    ctaDesc:
      'Install the MIT open-source plugin free, scan the IMA QR for 12 public guides, or join the Oct local backtest cohort (6 cross-border sellers).',
    btnInstall: 'Copy CLI Install',
    btnImaQr: 'IMA Public Showcase QR',
    btnWechat: 'Copy WeChat emjj6666',
    footerLeft: 'Frank (fleekelon) · dsh-fintax × Tencent IMA FinTax KB',
    footerRight: 'Compliance & Privacy Boundary',
    disclaimerTitle: 'Compliance Boundary & Local-Only Privacy Notice',
    disclaimerBody:
      '1. Local-Only Privacy: dsh-fintax is pure ESM with zero third-party runtime dependencies. All CSV/XLSX/ZIP statements are parsed strictly in local memory.\n2. Compliance Scope: Plugin outputs and interactive sandboxes are for preliminary offline screening, variance tracing, and evidence tracking only—not formal accounting vouchers or tax filings.\n3. Dual-Track Isolation: Open-source code ships deterministic engines only; full policy SOPs and 100 linked Excel workbooks live inside Tencent IMA Knowledge Base.',
  },
};
