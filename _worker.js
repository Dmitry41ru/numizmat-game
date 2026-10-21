/**
 * NUMIZMAT DEV access gate — Cloudflare Pages advanced mode.
 * Add this file ONLY to the root of the dev branch (same directory as index.html).
 * Required Cloudflare Pages Production environment bindings:
 *   BOT_TOKEN             Secret: token of the NUMIZMAT DEV bot (never commit it)
 *   SESSION_SECRET        Secret: a random 32+ byte value (never commit it)
 *   ALLOWED_TELEGRAM_IDS  Text: comma-separated Telegram IDs, e.g. 666898751
 *
 * No game code or localStorage data is changed.
 * Everything served by this Pages deployment is authenticated first,
 * including /index.html, /assets/* and arbitrary static paths.
 *
 * References:
 * https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
 * https://developers.cloudflare.com/pages/functions/advanced-mode/
 */

const COOKIE = '__Host-numizmat_dev';
const MAX_INIT_AGE_SECONDS = 3600;
const SESSION_AGE_SECONDS = 12 * 60 * 60;
const ENCODER = new TextEncoder();

function errorPage(message, code = 403) {
  const text = String(message).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  return new Response(`<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><title>NUMIZMAT DEV — доступ</title><style>:root{color-scheme:dark}body{margin:0;min-height:100vh;display:grid;place-items:center;background:#101b18;color:#eff5ef;font:15px system-ui,-apple-system,sans-serif;padding:22px;box-sizing:border-box}.card{max-width:380px;width:100%;background:#1b2924;border:1px solid #3b5148;border-radius:22px;padding:25px;box-sizing:border-box}h1{font-size:21px;margin:0 0 12px;color:#dec48b}p{line-height:1.55;margin:0;color:#d7e1d6}.sub{font-size:12px;opacity:.7;margin-top:14px}</style></head><body><main class="card"><h1>NUMIZMAT DEV</h1><p>${text}</p><p class="sub">Тестовая версия доступна только приглашённым пользователям.</p></main></body></html>`, {
    status: code,
    headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', 'x-content-type-options': 'nosniff', 'x-robots-tag': 'noindex, nofollow' }
  });
}

function signInPage() {
  const html = `<!doctype html><html lang="ru"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="color-scheme" content="dark"><title>NUMIZMAT DEV — вход</title>
<script src="https://telegram.org/js/telegram-web-app.js"></script>
<style>:root{color-scheme:dark}*{box-sizing:border-box}body{margin:0;min-height:100vh;min-height:100dvh;display:grid;place-items:center;padding:24px;padding-top:calc(24px + env(safe-area-inset-top));padding-bottom:calc(24px + env(safe-area-inset-bottom));background:#101b18;color:#e9f2e8;font-family:system-ui,-apple-system,BlinkMacSystemFont,sans-serif}.panel{width:min(100%,380px);padding:30px 24px;border:1px solid #3f584b;background:#1b2b26;border-radius:24px;box-shadow:0 12px 40px rgba(0,0,0,.16)}.eyebrow{color:#cfad6d;font-size:11px;letter-spacing:2px;font-weight:800}h1{font-size:29px;line-height:1.15;margin:10px 0}p{color:#afc2b3;font-size:14px;line-height:1.6}#status{padding:12px 0 0;color:#e1e8da;min-height:24px}button{border:0;border-radius:13px;background:#c4a66d;color:#17221a;font-size:14px;font-weight:700;min-height:46px;padding:0 18px;margin-top:12px;width:100%;cursor:pointer}button[hidden]{display:none}.muted{font-size:12px;color:#8eaa96}</style></head><body><main class="panel"><div class="eyebrow">ТЕСТОВЫЙ ДОСТУП</div><h1>NUMIZMAT DEV</h1><p>Вход только для участников закрытого тестирования.</p><div id="status" role="status" aria-live="polite">Проверяем вход через Telegram…</div><button id="retry" type="button" hidden>Повторить</button><p class="muted">Запускайте игру через тестового Telegram-бота.</p></main>
<script>
(function(){
const status=document.getElementById('status'),retry=document.getElementById('retry');
let busy=false;
async function authorize(){
 if(busy)return;busy=true;retry.hidden=true;status.textContent='Проверяем вход через Telegram…';
 try{
  const app=window.Telegram&&window.Telegram.WebApp;
  if(!app||!app.initData){status.textContent='Откройте приложение кнопкой запуска в тестовом Telegram-боте.';return;}
  app.ready();
  const response=await fetch('/_dev_auth',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({initData:app.initData}),cache:'no-store'});
  if(!response.ok){status.textContent=response.status===403?'Доступ не разрешён. Обратитесь к администратору тестирования.':'Не удалось подтвердить вход. Перезапустите Mini App в Telegram.';if(response.status!==403)retry.hidden=false;return;}
  status.textContent='Доступ подтверждён. Загружаем игру…';location.replace('/');
 }catch(e){status.textContent='Ошибка соединения. Попробуйте ещё раз.';retry.hidden=false}
 finally{busy=false}
}
retry.addEventListener('click',authorize);authorize();
})();
</script></body></html>`;
  return new Response(html, { status: 200, headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', 'x-content-type-options': 'nosniff', 'x-robots-tag': 'noindex, nofollow', 'referrer-policy': 'no-referrer', 'content-security-policy': "default-src 'none'; script-src 'unsafe-inline' https://telegram.org; style-src 'unsafe-inline'; connect-src 'self'; base-uri 'none'; form-action 'none'" } });
}

function allowIds(env) {
  return new Set(String(env.ALLOWED_TELEGRAM_IDS || '').split(/[,;\s]+/).filter((id) => /^\d+$/.test(id)));
}

async function hmac(secret, data) {
  const key = await crypto.subtle.importKey('raw', secret instanceof Uint8Array ? secret : ENCODER.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return new Uint8Array(await crypto.subtle.sign('HMAC', key, typeof data === 'string' ? ENCODER.encode(data) : data));
}
async function verifyHmac(secret, data, hexSignature) {
  if (!/^[a-f0-9]{64}$/i.test(hexSignature)) return false;
  const raw = new Uint8Array(hexSignature.match(/../g).map((pair) => Number.parseInt(pair, 16)));
  const key = await crypto.subtle.importKey('raw', secret instanceof Uint8Array ? secret : ENCODER.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']);
  return crypto.subtle.verify('HMAC', key, raw, typeof data === 'string' ? ENCODER.encode(data) : data);
}
function toHex(bytes) { return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join(''); }

async function authenticateTelegram(initData, env) {
  if (typeof initData !== 'string' || initData.length < 30 || initData.length > 8192) return null;
  const params = new URLSearchParams(initData);
  const names = [...params.keys()];
  if (names.length !== new Set(names).size) return null;
  const hash = params.get('hash') || '';
  const authText = params.get('auth_date') || '';
  if (!/^\d{9,12}$/.test(authText)) return null;
  const authDate = Number(authText);
  const now = Math.floor(Date.now() / 1000);
  if (authDate > now + 60 || authDate < now - MAX_INIT_AGE_SECONDS) return null;
  const userText = params.get('user');
  if (!userText) return null;
  const dataCheckString = [...params.entries()].filter(([k]) => k !== 'hash').sort(([a], [b]) => a.localeCompare(b, 'en')).map(([k, v]) => `${k}=${v}`).join('\n');
  const tokenSecret = await hmac(ENCODER.encode('WebAppData'), env.BOT_TOKEN);
  if (!await verifyHmac(tokenSecret, dataCheckString, hash)) return null;
  let user;
  try { user = JSON.parse(userText); } catch { return null; }
  if (!user || !Number.isSafeInteger(user.id) || user.id <= 0) return null;
  const id = String(user.id);
  return allowIds(env).has(id) ? id : null;
}

function cookies(request) {
  const raw = request.headers.get('cookie') || '';
  for (const chunk of raw.split(';')) {
    const index = chunk.indexOf('=');
    if (index < 0) continue;
    if (chunk.slice(0, index).trim() === COOKIE) return chunk.slice(index + 1).trim();
  }
  return null;
}
async function sessionCookie(id, env) {
  const issued = Math.floor(Date.now() / 1000), expires = issued + SESSION_AGE_SECONDS;
  const message = `numizmat-dev-v1\n${id}\n${issued}\n${expires}`;
  const signature = toHex(await hmac(env.SESSION_SECRET, message));
  return `${COOKIE}=v1.${id}.${issued}.${expires}.${signature}; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=${SESSION_AGE_SECONDS}`;
}
async function hasSession(request, env) {
  const token = cookies(request);
  if (!token) return false;
  const parts = /^v1\.(\d+)\.(\d+)\.(\d+)\.([a-f0-9]{64})$/i.exec(token);
  if (!parts) return false;
  const [, id, issuedText, expiresText, sig] = parts;
  if (!allowIds(env).has(id)) return false; // revocation applies immediately
  const issued = Number(issuedText), expires = Number(expiresText);
  const now = Math.floor(Date.now() / 1000);
  if (!Number.isSafeInteger(issued) || !Number.isSafeInteger(expires) || issued > now + 60 || expires <= now || expires - issued !== SESSION_AGE_SECONDS) return false;
  return verifyHmac(env.SESSION_SECRET, `numizmat-dev-v1\n${id}\n${issued}\n${expires}`, sig);
}

function sameOrigin(request) {
  const origin = request.headers.get('origin');
  return origin && origin === new URL(request.url).origin;
}

export default {
  async fetch(request, env) {
    // Never let missing configuration accidentally expose the site.
    if (!env?.BOT_TOKEN || !env?.SESSION_SECRET || String(env.SESSION_SECRET).length < 32 || allowIds(env).size === 0 || !env.ASSETS?.fetch) {
      return errorPage('Доступ временно недоступен: серверная авторизация не настроена.', 503);
    }

    const path = new URL(request.url).pathname;
    if (path === '/_dev_auth') {
      if (request.method !== 'POST') return new Response('Method Not Allowed', { status: 405, headers: { 'allow': 'POST', 'cache-control': 'no-store' } });
      if (!sameOrigin(request) || !/^application\/json(?:\s*;|$)/i.test(request.headers.get('content-type') || '')) {
        return new Response('Forbidden', { status: 403, headers: { 'cache-control': 'no-store' } });
      }
      if (Number(request.headers.get('content-length') || 0) > 8500) return new Response('Payload Too Large', { status: 413 });
      let data;
      try { const text = await request.text(); if (text.length > 8500) return new Response('Payload Too Large', { status: 413 }); data = JSON.parse(text); }
      catch { return new Response('Bad Request', { status: 400 }); }
      const id = await authenticateTelegram(data?.initData, env);
      if (!id) return new Response('Forbidden', { status: 403, headers: { 'cache-control': 'no-store' } });
      return new Response(JSON.stringify({ ok: true }), { headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', 'set-cookie': await sessionCookie(id, env), 'x-content-type-options': 'nosniff' } });
    }

    if (!await hasSession(request, env)) {
      // All assets and HTML are gated. Never call env.ASSETS for unauthenticated users.
      if (request.method === 'GET' && (path === '/' || path === '/index.html')) return signInPage();
      return errorPage('Доступ к файлам NUMIZMAT DEV закрыт.', 403);
    }

    if (request.method !== 'GET' && request.method !== 'HEAD') return new Response('Method Not Allowed', { status: 405, headers: { 'allow': 'GET, HEAD' } });
    // Keep authenticated responses out of intermediary and browser caches.
    const asset = await env.ASSETS.fetch(request);
    const headers = new Headers(asset.headers);
    headers.set('cache-control', 'private, no-store, max-age=0');
    headers.set('x-robots-tag', 'noindex, nofollow');
    headers.set('x-content-type-options', 'nosniff');
    headers.delete('etag');
    return new Response(asset.body, { status: asset.status, statusText: asset.statusText, headers });
  }
};
