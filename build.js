#!/usr/bin/env node
// 把 200_Reference 底下多個主題資料夾轉成 recipe-app/data.json
// 每個主題（collection）= 一個資料夾，一則內容 = 一個 .md（唯一資料來源）
// 加主題只要在 COLLECTIONS 加一行 + 建對應資料夾；加內容就改 .md 再重跑
// 用法：node recipe-app/build.js  （零相依）

const fs = require('fs');
const path = require('path');

const REF = path.join(__dirname, '..', '200_Reference');
const OUT = path.join(__dirname, 'data.json');

// 主題設定：id＝資料夾名；emoji＝目錄圖示；subField＝該主題的次分類欄位
const COLLECTIONS = [
  { id: '食譜', emoji: '🍳', dir: '食譜', subField: '分類' },
  { id: '精油', emoji: '🌿', dir: '精油', subField: '分類' },
  { id: '出國必買', emoji: '🛍️', dir: '出國必買', subField: '國家' },
  { id: '收藏', emoji: '📌', dir: '收藏', subField: '標籤' },
];

// 解析簡化版 YAML frontmatter（key: value 單行；值可含引號；[a, b] 當陣列）
function parseFrontmatter(raw) {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) return { meta: {}, body: raw.trim() };
  const meta = {};
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^([^:]+):\s*(.*)$/);
    if (!kv) continue;
    let val = kv[2].trim();
    if (val.startsWith('[') && val.endsWith(']')) {
      val = val.slice(1, -1).split(',').map(s => s.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
    } else if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    meta[kv[1].trim()] = val;
  }
  return { meta, body: m[2].trim() };
}

function extractTitle(body) {
  const m = body.match(/^#\s+(.+)$/m);
  return m ? m[1].trim() : null;
}

// 取次分類：陣列取第一個，沒有就「其他」
function subcat(meta, field) {
  const v = meta[field];
  if (Array.isArray(v)) return v[0] || '其他';
  return v || '其他';
}

function readCollection(c) {
  const dir = path.join(REF, c.dir);
  let items = [];
  if (fs.existsSync(dir)) {
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.md') && !f.includes('MOC'));
    items = files.map(f => {
      const raw = fs.readFileSync(path.join(dir, f), 'utf8');
      const { meta, body } = parseFrontmatter(raw);
      return {
        id: path.basename(f, '.md'),
        name: extractTitle(body) || path.basename(f, '.md'),
        sub: subcat(meta, c.subField),
        source: meta['來源'] || '',
        summary: meta.summary || '',
        body,
      };
    });
    items.sort((a, b) =>
      String(a.sub).localeCompare(String(b.sub), 'zh-Hant') ||
      a.name.localeCompare(b.name, 'zh-Hant'));
  }
  return { id: c.id, emoji: c.emoji, subLabel: c.subField, count: items.length, items };
}

function build() {
  const collections = COLLECTIONS.map(readCollection);
  fs.writeFileSync(OUT, JSON.stringify({ updated: new Date().toISOString().slice(0, 10), collections }, null, 2) + '\n');
  const total = collections.reduce((s, c) => s + c.count, 0);
  console.log(`已產生 ${OUT}（${collections.map(c => c.id + ' ' + c.count).join('、')}；共 ${total} 則）`);
}

build();
