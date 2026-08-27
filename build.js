#!/usr/bin/env node
// 把 200_Reference/食譜/*.md 轉成 recipe-app/recipes.json
// .md 是唯一資料來源；改食譜就改 .md，再重跑這支腳本
// 用法：node recipe-app/build.js  （零相依，node 內建即可）

const fs = require('fs');
const path = require('path');

const RECIPE_DIR = path.join(__dirname, '..', '200_Reference', '食譜');
const OUT = path.join(__dirname, 'recipes.json');

// 解析簡化版 YAML frontmatter（只處理 key: value 單行，值可含引號）
function parseFrontmatter(raw) {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) return { meta: {}, body: raw.trim() };
  const meta = {};
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^([^:]+):\s*(.*)$/);
    if (!kv) continue;
    let val = kv[2].trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    meta[kv[1].trim()] = val;
  }
  return { meta, body: m[2].trim() };
}

// 從 body 第一個 # 標題抽出菜名
function extractTitle(body) {
  const m = body.match(/^#\s+(.+)$/m);
  return m ? m[1].trim() : null;
}

function build() {
  if (!fs.existsSync(RECIPE_DIR)) {
    console.error('找不到食譜資料夾：' + RECIPE_DIR);
    process.exit(1);
  }
  const files = fs.readdirSync(RECIPE_DIR).filter(f => f.endsWith('.md'));
  const recipes = files.map(f => {
    const raw = fs.readFileSync(path.join(RECIPE_DIR, f), 'utf8');
    const { meta, body } = parseFrontmatter(raw);
    const name = extractTitle(body) || path.basename(f, '.md');
    return {
      id: path.basename(f, '.md'),
      name,
      category: meta['分類'] || '未分類',
      source: meta['來源'] || '',
      summary: meta.summary || '',
      created: meta.created || '',
      body, // 保留 markdown 原文，前端自行渲染
    };
  });

  // 依分類、再依建立日期排序，輸出穩定
  recipes.sort((a, b) =>
    a.category.localeCompare(b.category, 'zh-Hant') ||
    a.name.localeCompare(b.name, 'zh-Hant'));

  fs.writeFileSync(OUT, JSON.stringify({ updated: new Date().toISOString().slice(0, 10), recipes }, null, 2) + '\n');
  console.log(`已產生 ${OUT}（${recipes.length} 則食譜）`);
}

build();
