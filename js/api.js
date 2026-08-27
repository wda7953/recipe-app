// 收藏庫後端串接(排序/分類覆蓋層)
// 部署 apps-script.gs 後,把下面兩個換成你的值即可;沒填的話 App 仍可用,排序只存這支手機。
const LIB_API_URL   = 'https://script.google.com/macros/s/AKfycbwaK1z7rPsAwQbCMZ3fVtljVMoMwvBB-8gqXoRYY-DxJBTKbdUnPJuAll50_FMzKh3f/exec';
const LIB_API_TOKEN = 'lib_822cce50a1';

const LIB_CONFIGURED = LIB_API_URL.indexOf('http') === 0 && LIB_API_TOKEN.indexOf('CHANGE_ME') !== 0;

// 讀覆蓋設定:優先後端,失敗就用本機快取
async function libLoad() {
  if (LIB_CONFIGURED) {
    try {
      const url = new URL(LIB_API_URL);
      url.searchParams.set('token', LIB_API_TOKEN);
      url.searchParams.set('t', Date.now());
      const res = await fetch(url.toString());
      const j = await res.json();
      if (j && j.ok) { try { localStorage.setItem('lib_ov', JSON.stringify(j.data || {})); } catch (e) {} return j.data || {}; }
    } catch (e) { /* 落到本機 */ }
  }
  try { return JSON.parse(localStorage.getItem('lib_ov') || '{}'); } catch (e) { return {}; }
}

// 存覆蓋設定:先寫本機(即時),再嘗試同步後端
let _libTimer = null;
function libSave(ov) {
  try { localStorage.setItem('lib_ov', JSON.stringify(ov)); } catch (e) {}
  if (!LIB_CONFIGURED) return;
  clearTimeout(_libTimer);
  _libTimer = setTimeout(() => {
    const url = new URL(LIB_API_URL);
    url.searchParams.set('token', LIB_API_TOKEN);
    fetch(url.toString(), { method: 'POST', body: JSON.stringify(ov) }).catch(() => {});
  }, 600);
}

window.LIB = { load: libLoad, save: libSave, configured: LIB_CONFIGURED };
