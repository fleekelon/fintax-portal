import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const checkOnly = process.argv.includes('--check');

const metricsPath = path.join(rootDir, 'src', 'config', 'portalMetrics.json');
const metrics = JSON.parse(fs.readFileSync(metricsPath, 'utf8'));

let driftCount = 0;

function syncFile(relPath, transform) {
  const absPath = path.join(rootDir, relPath);
  const raw = fs.readFileSync(absPath, 'utf8');
  const eol = raw.includes('\r\n') ? '\r\n' : '\n';
  const normalized = raw.replace(/\r\n/g, '\n');
  const nextNormalized = transform(normalized);
  const next = eol === '\r\n' ? nextNormalized.replace(/\n/g, '\r\n') : nextNormalized;
  if (next !== raw) {
    driftCount++;
    if (checkOnly) {
      console.error(`[sync-portal-metrics] DRIFT in ${relPath}`);
    } else {
      fs.writeFileSync(absPath, next, 'utf8');
      console.log(`[sync-portal-metrics] Updated ${relPath}`);
    }
  }
}

// 1. Sync index.html SEO meta description from PORTAL_METRICS
const expectedDesc = `dsh-fintax 0 Token 离线跨境财税工作台 × 腾讯 IMA 跨境电商财税合规知识库（${metrics.imaTotalDocs} 条资料 / ${metrics.imaWorkbooks} 本零漂移联动 Excel / ${metrics.imaFormulas} 公式）`;
syncFile('index.html', (html) => {
  const re = /(<meta\s+name="description"\s+content=")([^"]*)("\s*\/>)/m;
  if (!re.test(html)) {
    throw new Error('Could not locate <meta name="description"> in index.html');
  }
  return html.replace(re, `$1${expectedDesc}$3`);
});

// 2. Sync public/media/manifest.json dynamic metric tile titles
syncFile('public/media/manifest.json', (jsonRaw) => {
  const list = JSON.parse(jsonRaw);
  for (const item of list) {
    if (item.id === 'ft-01') {
      item.title = `${metrics.pluginChannels} 通道离线雷达`;
    } else if (item.id === 'ft-09') {
      item.title = `${metrics.pluginEngines} 大确定性算税引擎`;
    }
  }
  return `${JSON.stringify(list, null, 2)}\n`;
});

if (checkOnly && driftCount > 0) {
  process.exit(1);
}
console.log(
  `[sync-portal-metrics] OK (${checkOnly ? 'verified' : 'synced'}): ${metrics.imaTotalDocs} docs, ${metrics.imaFreePublicGuides} free guides, ${metrics.pluginChannels} ch / ${metrics.pluginEngines} engines, ${metrics.imaFormulas} formulas.`
);
