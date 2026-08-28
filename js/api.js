// 收藏庫後端串接(排序/分類/跨主題覆蓋層 + 照片)
// 部署 Code.gs 後,把下面兩個換成你的值;沒填的話 App 仍可用,只存這支手機。
const LIB_API_URL   = 'https://script.google.com/macros/s/AKfycbwaK1z7rPsAwQbCMZ3fVtljVMoMwvBB-8gqXoRYY-DxJBTKbdUnPJuAll50_FMzKh3f/exec';
const LIB_API_TOKEN = 'lib_822cce50a1';

const LIB_CONFIGURED = LIB_API_URL.indexOf('http') === 0 && LIB_API_TOKEN.indexOf('CHANGE_ME') !== 0;

// ===== 讀取:走 JSONP(<script> 載入)繞過 GAS 的 CORS 限制 =====
function libJsonp(extra) {
  return new Promise((resolve, reject) => {
    const cb = 'lib_cb_' + Math.random().toString(36).slice(2);
    const url = new URL(LIB_API_URL);
    url.searchParams.set('token', LIB_API_TOKEN);
    url.searchParams.set('callback', cb);
    url.searchParams.set('t', Date.now());
    if (extra) Object.keys(extra).forEach(k => url.searchParams.set(k, extra[k]));
    const s = document.createElement('script');
    const done = (fn, arg) => { clearTimeout(timer); try { delete window[cb]; } catch (e) { window[cb] = undefined; } s.remove(); fn(arg); };
    const timer = setTimeout(() => done(reject, new Error('timeout')), 10000);
    window[cb] = data => done(resolve, data);
    s.onerror = () => done(reject, new Error('script error'));
    s.src = url.toString();
    document.head.appendChild(s);
  });
}

// 讀覆蓋設定:優先後端(JSONP),失敗就用本機快取
async function libLoad() {
  if (LIB_CONFIGURED) {
    try {
      const j = await libJsonp();
      if (j && j.ok) { try { localStorage.setItem('lib_ov', JSON.stringify(j.data || {})); } catch (e) {} return j.data || {}; }
    } catch (e) { /* 落到本機 */ }
  }
  try { return JSON.parse(localStorage.getItem('lib_ov') || '{}'); } catch (e) { return {}; }
}

// ===== 寫入:fire-and-forget(GAS 讀不回應,不讀)=====
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

// 上傳照片:POST base64(fire-and-forget);後端存 Drive 並記 PHOTOS[key],前端之後輪詢 libLoad 取 fileId
function libUpload(dataB64, key, name, mime) {
  if (!LIB_CONFIGURED) return Promise.reject(new Error('後端未設定,無法上傳照片'));
  const url = new URL(LIB_API_URL);
  url.searchParams.set('token', LIB_API_TOKEN);
  url.searchParams.set('action', 'upload');
  return fetch(url.toString(), { method: 'POST', body: JSON.stringify({ data: dataB64, key: key, name: name, mime: mime }) }).catch(() => {});
}

// 刪除某則的上傳照片(fire-and-forget)
function libDelPhoto(key) {
  if (!LIB_CONFIGURED) return Promise.resolve();
  const url = new URL(LIB_API_URL);
  url.searchParams.set('token', LIB_API_TOKEN);
  url.searchParams.set('action', 'delphoto');
  return fetch(url.toString(), { method: 'POST', body: JSON.stringify({ key: key }) }).catch(() => {});
}

window.LIB = { load: libLoad, save: libSave, upload: libUpload, delPhoto: libDelPhoto, configured: LIB_CONFIGURED };
