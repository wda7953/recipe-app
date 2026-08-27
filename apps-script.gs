/**
 * 收藏庫 App 後端 — 存「排序/分類覆蓋層」(不動原始 .md 內容)
 * 覆蓋設定整包以 JSON 存在 Script Property `OVERRIDES`,體積很小。
 *
 * 部署:貼進新的 GAS 專案 → 把下面 API_TOKEN 改成你的密鑰 →
 *       部署為網頁應用程式(執行身分:我;誰可存取:任何人)→ 複製 /exec 網址。
 *       把網址與密鑰填進 recipe-app/js/api.js。
 */
const API_TOKEN = 'lib_822cce50a1';

function doGet(e) {
  if (!e || !e.parameter || e.parameter.token !== API_TOKEN) return jsonErr_('bad token');
  return jsonOk_(getOverrides_());
}

function doPost(e) {
  try {
    if (!e || !e.parameter || e.parameter.token !== API_TOKEN) return jsonErr_('bad token');
    var overrides = JSON.parse(e.postData.contents);
    setOverrides_(overrides);
    return jsonOk_(true);
  } catch (err) {
    return jsonErr_(String(err));
  }
}

function getOverrides_() {
  var s = PropertiesService.getScriptProperties().getProperty('OVERRIDES');
  return s ? JSON.parse(s) : {};
}
function setOverrides_(o) {
  PropertiesService.getScriptProperties().setProperty('OVERRIDES', JSON.stringify(o || {}));
}

function jsonOk_(d) { return ContentService.createTextOutput(JSON.stringify({ ok: true, data: d })).setMimeType(ContentService.MimeType.JSON); }
function jsonErr_(m) { return ContentService.createTextOutput(JSON.stringify({ ok: false, error: m })).setMimeType(ContentService.MimeType.JSON); }
