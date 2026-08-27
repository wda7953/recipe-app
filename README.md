# 收藏庫 PWA

把網路上看到想存的東西,整理成一個可搜尋、可加到手機桌面的收藏庫。**一個目錄首頁,索引多個主題**(🍳 食譜、🌿 精油、🛍️ 出國必買、📌 收藏),每個主題點進去都能瀏覽搜尋。

> 線上:https://wda7953.github.io/recipe-app/ (repo 名沿用 recipe-app,別改,改了 URL 會變)

- **資料來源(唯一)**:`200_Reference/<主題>/*.md`。每則就是一個 .md。
- **純靜態 PWA**,直接讀 `data.json`,不需後端。
- 收集靠 LINE:傳圖 → 記帳 bot 存進 Drive 收件匣 → `/recipe-inbox` skill 看圖分類歸進各主題。

## 加/改內容(兩步)

1. 在 `200_Reference/<主題>/` 新增或修改 `.md`(frontmatter 的次分類欄依主題:食譜/精油=`分類`、出國必買=`國家`、收藏=`標籤`)。
2. 重跑轉檔:
   ```
   node recipe-app/build.js
   ```
   commit / push 後 App 更新。

## 加一個新主題

改 `build.js` 最上面的 `COLLECTIONS` 陣列加一行(id/emoji/dir/subField),再建對應資料夾。App 首頁目錄會自動多一格。

## 檔案

| 檔案 | 作用 |
|---|---|
| `build.js` | 掃 `200_Reference/<主題>/*.md`(排除 *MOC*) → `data.json` |
| `data.json` | App 讀的資料檔,由 `build.js` 產生,勿手改 |
| `index.html` | App 本體:目錄首頁 → 主題列表(搜尋)→ 詳情(含極簡 markdown 渲染) |
| `manifest.json` / `icon-*.png` | PWA 安裝設定與圖示 |

## 本地預覽

```
cd recipe-app && python3 -m http.server 8899
```
開 http://localhost:8899/index.html

## 編輯模式(排序/分類,跨裝置同步)

進入任一主題 → 右上「編輯」→ 每張卡片有 ↑↓(調同分類內順序)與下拉(換分類/新分類);分類標題的 ↑↓ 調分類顯示順序。改動**自動儲存**。

- 不動原始 `.md`,只疊一層「排序/分類覆蓋」設定,存在 GAS 後端(跨裝置一致);後端連不上時退回本機 localStorage。
- 後端:`apps-script.gs`(已用 clasp 部署,專案在 `recipe-library-gas/`);前端設定在 `js/api.js`(已填好網址+密鑰)。後端只用 Script Property 存一包 JSON,不碰其他資料、免授權。
- 加新內容(/inbox)後,新項目會照 `.md` 的分類排在最後,不影響既有排序。

## 檔案(補充)

| 檔案 | 作用 |
|---|---|
| `js/api.js` | 後端串接設定(LIB_API_URL / LIB_API_TOKEN)+ 讀寫覆蓋層 |
| `apps-script.gs` | GAS 後端(存排序/分類覆蓋層);正本專案在 `recipe-library-gas/` |
| `photos/<主題>/<id>.jpg` | 各項目商品照(build.js 自動掛上) |

## 部署

已在 GitHub Pages(`wda7953/recipe-app`,main 根目錄)。push 即更新。
