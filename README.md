# 食譜 PWA

把網路上看到的食譜整理成一個可搜尋、可加到手機桌面的食譜庫。

- **資料來源(唯一)**：`200_Reference/食譜/*.md`。每則食譜就是一個 .md,在 Obsidian 或任何編輯器改都行。
- **不需要後端**:純靜態 PWA,直接讀 `recipes.json`。
- **階段一**:瀏覽 + 搜尋(依分類、菜名、食材)。之後階段二再接 LINE 自動新增。

## 加新食譜 / 改食譜(兩步)

1. 在 `200_Reference/食譜/` 新增或修改 `.md`(照現有格式:frontmatter 的 `分類`/`來源` + `## 食材`/`## 作法`)。
2. 重跑轉檔腳本產生最新 `recipes.json`:
   ```
   node recipe-app/build.js
   ```
   看到「已產生 …（N 則食譜）」就好。commit / 推上去後 App 就更新。

## 檔案說明

| 檔案 | 作用 |
|---|---|
| `build.js` | 把 `200_Reference/食譜/*.md` → `recipes.json`(零相依,node 內建即可) |
| `recipes.json` | App 讀的資料檔,由 `build.js` 產生,不要手改 |
| `index.html` | App 本體(首頁列表 + 搜尋 + 詳情,含極簡 markdown 渲染) |
| `manifest.json` / `icon-*.png` / `apple-touch-icon.png` | PWA 安裝設定與圖示 |

## 本地預覽

```
cd recipe-app
python3 -m http.server 8899
```
瀏覽器開 http://localhost:8899/index.html

## 部署 GitHub Pages(比照 body-tracker)

1. 把 `recipe-app/` 內容推上一個 GitHub repo(例如 `recipe-app`)。
2. repo → Settings → Pages → Branch 選 `main` / 根目錄 → Save。
3. 幾分鐘後給你一個網址,手機開啟 → 分享 → 加入主畫面,即成 App。

## 加到手機桌面後

打開就是全螢幕食譜庫。搜「檸檬」「豆腐」即時篩選;點卡片看食材與作法;截圖沒拍全的食譜會標「待補」。
