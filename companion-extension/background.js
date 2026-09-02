/* =========================================================================
 * YT Deck Player Companion - background service worker
 * -------------------------------------------------------------------------
 * The deck runs a tiny loopback server (127.0.0.1) and, while an age-restricted
 * track is starting, asks this extension for the YouTube session cookies. This
 * worker long-polls that server; when a request arrives it reads the cookies
 * with the browser's own cookies API (which the user granted on install) and
 * posts them straight back. The deck injects them into an in-memory view for
 * that one playback and discards them - nothing is written to disk.
 *
 * The user pairs once by pasting a code the deck shows; every call carries the
 * token that pairing returns, so no unpaired local process can pull cookies.
 * ========================================================================= */
'use strict';

const STORE_KEY = 'ytdeck_pairing';
// Only these two domains are ever read, and only on the deck's request. These
// are the cookies youtube.com itself uses to authenticate playback.
const COOKIE_DOMAINS = ['youtube.com', 'google.com'];

let polling = false;

async function getPairing() {
  const s = await chrome.storage.local.get(STORE_KEY);
  return s[STORE_KEY] || null;
}

function base(port) { return `http://127.0.0.1:${port}`; }

// Pair with a running deck. `code` is the "<port>-<sixDigits>" string the deck
// shows in its account card.
async function pair(code) {
  const m = /^\s*(\d{2,5})\s*-\s*(\d{4,8})\s*$/.exec(String(code || ''));
  if (!m) throw new Error('Code looks like 47615-483920');
  const port = Number(m[1]);
  const pin = m[2];
  const res = await fetch(base(port) + '/pair', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pin }),
  });
  if (!res.ok) throw new Error('Deck refused the code (' + res.status + ')');
  const data = await res.json();
  if (!data || !data.token) throw new Error('No token returned');
  await chrome.storage.local.set({ [STORE_KEY]: { port, token: data.token, pairedAt: Date.now() } });
  startPolling();
  return { ok: true };
}

async function unpair() {
  await chrome.storage.local.remove(STORE_KEY);
}

function mapSameSite(v) {
  if (v === 'no_restriction') return 'no_restriction';
  if (v === 'lax') return 'lax';
  if (v === 'strict') return 'strict';
  return 'unspecified';
}

async function collectCookies() {
  const out = [];
  for (const domain of COOKIE_DOMAINS) {
    let list = [];
    try { list = await chrome.cookies.getAll({ domain }); } catch (e) { continue; }
    for (const c of list) {
      out.push({
        name: c.name,
        value: c.value,
        domain: c.domain,
        path: c.path || '/',
        secure: !!c.secure,
        httpOnly: !!c.httpOnly,
        sameSite: mapSameSite(c.sameSite),
        expirationDate: c.expirationDate || undefined,
        hostOnly: !!c.hostOnly,
      });
    }
  }
  return out;
}

async function serveOnce(pairing) {
  // Long-poll: the deck holds this open until it needs cookies (or ~25s pass).
  let res;
  try {
    res = await fetch(base(pairing.port) + '/wait', {
      headers: { Authorization: 'Bearer ' + pairing.token },
    });
  } catch (e) {
    // Deck not running / port closed: back off and let the caller retry.
    return { retryMs: 4000 };
  }
  if (res.status === 401) { await unpair(); return { stop: true }; }
  if (res.status === 204) return { retryMs: 0 };
  if (!res.ok) return { retryMs: 3000 };
  let job;
  try { job = await res.json(); } catch (e) { return { retryMs: 1500 }; }
  if (!job || !job.requestId) return { retryMs: 0 };
  const cookies = await collectCookies();
  try {
    await fetch(base(pairing.port) + '/cookies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + pairing.token },
      body: JSON.stringify({ requestId: job.requestId, cookies }),
    });
  } catch (e) { /* deck will time out and skip; nothing to do here */ }
  return { retryMs: 0 };
}

async function startPolling() {
  if (polling) return;
  polling = true;
  try {
    while (true) {
      const pairing = await getPairing();
      if (!pairing) break;
      const { retryMs, stop } = await serveOnce(pairing);
      if (stop) break;
      if (retryMs) await new Promise((r) => setTimeout(r, retryMs));
    }
  } finally {
    polling = false;
  }
}

// A periodic alarm revives the loop after the service worker is suspended.
chrome.alarms.create('ytdeck-poll', { periodInMinutes: 0.5 });
chrome.alarms.onAlarm.addListener((a) => { if (a.name === 'ytdeck-poll') startPolling(); });
chrome.runtime.onStartup.addListener(() => startPolling());
chrome.runtime.onInstalled.addListener(() => startPolling());

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  (async () => {
    try {
      if (msg.type === 'pair') { sendResponse(await pair(msg.code)); return; }
      if (msg.type === 'unpair') { await unpair(); sendResponse({ ok: true }); return; }
      if (msg.type === 'status') {
        const p = await getPairing();
        sendResponse({ paired: !!p, port: p ? p.port : null });
        return;
      }
    } catch (e) {
      sendResponse({ ok: false, error: e.message || String(e) });
    }
  })();
  return true;
});

startPolling();
