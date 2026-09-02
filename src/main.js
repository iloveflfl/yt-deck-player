const { app, BrowserWindow, WebContentsView, ipcMain, screen, globalShortcut, session, shell, Tray, Menu, nativeImage } = require('electron');
const path = require('path');
const fs = require('fs');
const http = require('http');
const { spawn, execFileSync } = require('child_process');
const crypto = require('crypto');

let mainWindow = null;
let tray = null;
let dockMode = 'bottom';
let dockTargetDisplayId = null;
let lastFreeBounds = null;
let localServer = null;
let appOrigin = '';
let applyingDockBounds = false;
let manualResizeSinceDock = false;
let reserveSpaceEnabled = true;
let appBarRegisterPending = null;
let appBarRegistered = false;
let appBarBusy = false;
let appBarProcess = null;
let appBarStopFile = '';
let appBarStatusFile = '';
let lastAppBarResult = null;
let appBarRegisterSeq = 0;
let appBarSignature = '';
let appBarLiveHwnd = '';
let ignoreDisplayMetricsUntil = 0;
let displayMetricsTimer = null;
let ytView = null;
let ytViewBounds = null;
let ytIdleTimer = null;
// YouTube reads and the in-deck view share one partition, kept separate from
// the deck's own storage. It holds only ordinary browsing state (consent,
// visitor id); the app never signs in to any account.
const YT_PARTITION = 'persist:ytdeck-view';
const CHROME_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';


function appBarLogPath() {
  try {
    const docs = app.getPath('documents');
    const dir = path.join(docs, 'YTDeckPlayer');
    fs.mkdirSync(dir, { recursive: true });
    return path.join(dir, 'appbar-debug.log');
  } catch {
    return path.join(app.getPath('temp'), 'ytdeck-appbar-debug.log');
  }
}

function appendAppBarLog(message, details = null) {
  const line = `[${new Date().toISOString()}] ${message}${details ? ` ${typeof details === 'string' ? details : JSON.stringify(details)}` : ''}\n`;
  try { fs.appendFileSync(appBarLogPath(), line, 'utf8'); } catch {}
  console.warn(line.trim());
}

function documentsStorePath() {
  const docs = app.getPath('documents');
  const dir = path.join(docs, 'YTDeckPlayer');
  return { dir, file: path.join(dir, 'library-state.json') };
}

// The renderer only reports the SPACE preference after it boots. Registering
// an AppBar before that and tearing it down a second later raced the helper:
// the teardown could land while registration was still in flight, leaving a
// reserved strip that the app no longer believed in (an untracked ghost).
// Older builds had a Google sign-in and a companion extension. Those are gone;
// remove anything they left on disk so no stale account artifact survives an
// upgrade. Best-effort and bounded to paths this app created.
function removeLegacyAccountArtifacts() {
  const targets = [
    path.join(documentsStorePath().dir, 'google-oauth.json'),
    path.join(app.getPath('userData'), 'companion.json'),
    path.join(app.getPath('userData'), 'Partitions', 'ytdeck-google'),
  ];
  for (const target of targets) {
    try {
      if (fs.existsSync(target)) fs.rmSync(target, { recursive: true, force: true });
    } catch (err) {
      appendAppBarLog('Legacy artifact cleanup skipped', { target, error: err.message || String(err) });
    }
  }
}

function readPersistedReserveSpace() {
  const { file } = documentsStorePath();
  for (const candidate of [file, `${file}.bak`]) {
    try {
      const parsed = JSON.parse(fs.readFileSync(candidate, 'utf8'));
      const value = parsed && parsed.settings && parsed.settings.reserveSpace;
      if (typeof value === 'boolean') return value;
    } catch {}
  }
  return true;
}


const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
};

// Must match the BrowserWindow minWidth/minHeight. If a dock strip is computed
// narrower than the window minimum, Win32/Electron clamp the SIZE up while
// keeping x/y — a right-docked deck then grows past the monitor's right edge
// onto the neighbouring display instead of hugging the edge.
const MIN_WINDOW_WIDTH = 360;
const MIN_WINDOW_HEIGHT = 56;

function deckBoundsForDisplay(display, mode = 'bottom', useMonitorBounds = false) {
  // Normal floating/dock placement uses workArea. AppBar registration MUST use
  // full monitor bounds, because the AppBar itself changes workArea. If we use
  // workArea while registering, Windows shrinks it, we recompute against the
  // shrunken area, and the deck appears to hop upward/sideways in a loop.
  const area = useMonitorBounds ? display.bounds : display.workArea;
  if (mode === 'right') {
    const width = Math.max(MIN_WINDOW_WIDTH, Math.round(area.width / 7));
    return { x: area.x + area.width - width, y: area.y, width, height: area.height };
  }
  if (mode === 'left') {
    const width = Math.max(MIN_WINDOW_WIDTH, Math.round(area.width / 7));
    return { x: area.x, y: area.y, width, height: area.height };
  }
  const height = Math.max(228, Math.round(area.height / 7));
  return { x: area.x, y: area.y + area.height - height, width: area.width, height };
}

// Keep a dock rect fully inside the target display without distorting it.
// Sizes are clamped to [window minimum, display size]; the position is clamped
// so the rect cannot straddle a neighbouring monitor. It deliberately does NOT
// force-snap to the display edge: the shell may have legitimately inset the
// appbar rect (e.g. a taskbar already occupies that edge), and that inset must
// be preserved.
function anchorDockRectToDisplay(rect, display) {
  const area = display.bounds;
  const width = Math.min(Math.max(Math.round(rect.width), MIN_WINDOW_WIDTH), area.width);
  const height = Math.min(Math.max(Math.round(rect.height), MIN_WINDOW_HEIGHT), area.height);
  const x = Math.min(Math.max(Math.round(rect.x), area.x), area.x + area.width - width);
  const y = Math.min(Math.max(Math.round(rect.y), area.y), area.y + area.height - height);
  return { x, y, width, height };
}

// Last remembered free-mode bounds can point at a display that was removed or
// re-arranged. Restore them only when they are still mostly visible; otherwise
// re-centre the deck on the given display so it never comes back off-screen.
function safeFreeBounds(display) {
  const rect = lastFreeBounds;
  if (!rect || !(rect.width > 0) || !(rect.height > 0)) return freeBoundsForDisplay(display);
  try {
    const match = screen.getDisplayMatching(rect);
    if (match) {
      const a = match.bounds;
      const ix = Math.max(0, Math.min(rect.x + rect.width, a.x + a.width) - Math.max(rect.x, a.x));
      const iy = Math.max(0, Math.min(rect.y + rect.height, a.y + a.height) - Math.max(rect.y, a.y));
      if (ix * iy >= rect.width * rect.height * 0.5) return rect;
    }
  } catch {}
  return freeBoundsForDisplay(display);
}

// Physical (Win32) origin of a display. Prefer Electron's nativeOrigin; the
// global point API is only safe for a display's own top-left (unambiguously
// inside that display).
function displayNativeOrigin(display) {
  const o = display?.nativeOrigin;
  if (o && Number.isFinite(o.x) && Number.isFinite(o.y)) return { x: Math.round(o.x), y: Math.round(o.y) };
  try {
    if (screen && typeof screen.dipToScreenPoint === 'function' && display?.bounds) {
      return screen.dipToScreenPoint({ x: display.bounds.x, y: display.bounds.y });
    }
  } catch {}
  const sf = display?.scaleFactor || 1;
  return { x: Math.round((display?.bounds?.x || 0) * sf), y: Math.round((display?.bounds?.y || 0) * sf) };
}

// DIP<->physical rect conversion pinned to ONE display's scale factor.
// Dock rects always belong to a single display, but their far edges lie exactly
// on the shared monitor boundary. Converting corner points with the global
// per-point API (dipToScreenPoint/screenToDipPoint) attributes boundary points
// to the NEIGHBOURING monitor; with mixed DPI that corrupts the converted
// width/height — the cause of the bottom-dock height squash and the right-dock
// spill on secondary monitors.
function rectDipToScreen(rect, display) {
  const sf = display?.scaleFactor || 1;
  const base = display?.bounds || { x: 0, y: 0 };
  const native = displayNativeOrigin(display);
  return {
    x: Math.round(native.x + (rect.x - base.x) * sf),
    y: Math.round(native.y + (rect.y - base.y) * sf),
    width: Math.max(1, Math.round(rect.width * sf)),
    height: Math.max(1, Math.round(rect.height * sf)),
  };
}

function rectScreenToDip(rect, display) {
  const sf = display?.scaleFactor || 1;
  const base = display?.bounds || { x: 0, y: 0 };
  const native = displayNativeOrigin(display);
  return {
    x: Math.round(base.x + (rect.x - native.x) / sf),
    y: Math.round(base.y + (rect.y - native.y) / sf),
    width: Math.max(1, Math.round(rect.width / sf)),
    height: Math.max(1, Math.round(rect.height / sf)),
  };
}

function freeBoundsForDisplay(display) {
  const work = display.workArea;
  const width = Math.min(1180, Math.max(720, Math.round(work.width * 0.72)));
  const height = Math.min(460, Math.max(260, Math.round(work.height * 0.38)));
  return {
    x: Math.round(work.x + (work.width - width) / 2),
    y: Math.round(work.y + (work.height - height) / 2),
    width,
    height,
  };
}

function rectContainsPoint(rect, point) {
  return point.x >= rect.x && point.x < rect.x + rect.width && point.y >= rect.y && point.y < rect.y + rect.height;
}

function displayById(id) {
  if (id == null) return null;
  try { return screen.getAllDisplays().find((display) => display.id === id) || null; } catch { return null; }
}

function getBestDisplay(preferCursor = false) {
  const displays = screen.getAllDisplays();
  if (!displays || !displays.length) return screen.getPrimaryDisplay();

  if (preferCursor) {
    try {
      const cursor = screen.getCursorScreenPoint();
      const underCursor = displays.find((display) => rectContainsPoint(display.bounds, cursor));
      if (underCursor) return underCursor;
    } catch {}
  }

  const remembered = displayById(dockTargetDisplayId);
  if (remembered) return remembered;

  if (mainWindow && !mainWindow.isDestroyed()) {
    const bounds = mainWindow.getBounds();
    const center = {
      x: Math.round(bounds.x + bounds.width / 2),
      y: Math.round(bounds.y + bounds.height / 2),
    };
    const byCenter = screen.getDisplayNearestPoint(center);
    if (byCenter) return byCenter;
    return screen.getDisplayMatching(bounds);
  }
  return screen.getDisplayNearestPoint(screen.getCursorScreenPoint());
}

function getDeckBounds(mode = dockMode) {
  return mode === 'free' ? safeFreeBounds(getBestDisplay()) : deckBoundsForDisplay(getBestDisplay(), mode);
}

function hwndToString() {
  if (!mainWindow || mainWindow.isDestroyed()) return '';
  const handle = mainWindow.getNativeWindowHandle();
  if (!handle || !handle.length) return '';
  try {
    if (handle.length >= 8) return handle.readBigUInt64LE(0).toString();
    return BigInt(handle.readUInt32LE(0)).toString();
  } catch {
    return '';
  }
}

function appBarEdgeForMode(mode) {
  if (mode === 'right') return 'right';
  if (mode === 'left') return 'left';
  return 'bottom';
}

function appBarHelperPath() {
  const raw = path.join(__dirname, 'appbar-helper.ps1');
  // In a packaged app __dirname points inside app.asar, which powershell.exe
  // cannot read. electron-builder unpacks the helper (asarUnpack) next to the
  // archive, so hand PowerShell that real on-disk path instead.
  return raw.includes(`app.asar${path.sep}`) ? raw.replace(`app.asar${path.sep}`, `app.asar.unpacked${path.sep}`) : raw;
}

function appBarTempPaths() {
  const base = path.join(app.getPath('temp'), `ytdeck-appbar-${process.pid}-${Date.now()}`);
  return { stop: `${base}.stop`, status: `${base}.json` };
}

function safeUnlink(file) {
  try { if (file && fs.existsSync(file)) fs.unlinkSync(file); } catch {}
}

function rectSignature(rect) {
  if (!rect) return '';
  return [Math.round(rect.x), Math.round(rect.y), Math.round(rect.width), Math.round(rect.height)].join(',');
}

function makeAppBarSignature(mode, targetBounds) {
  const display = targetBounds ? screen.getDisplayMatching(targetBounds) : getBestDisplay();
  const monitorScreen = rectDipToScreen(display.bounds, display);
  const boundsScreen = rectDipToScreen(targetBounds || deckBoundsForDisplay(display, mode, true), display);
  const thickness = mode === 'left' || mode === 'right' ? boundsScreen.width : boundsScreen.height;
  return [mode, display.id, rectSignature(monitorScreen), Math.round(thickness)].join('|');
}

function waitForJsonFile(file, timeoutMs = 6500) {
  const started = Date.now();
  return new Promise((resolve) => {
    const tick = () => {
      try {
        if (fs.existsSync(file)) {
          const raw = fs.readFileSync(file, 'utf8').trim();
          if (raw) return resolve(JSON.parse(raw));
        }
      } catch (err) {
        return resolve({ ok: false, message: err.message || String(err) });
      }
      if (Date.now() - started > timeoutMs) return resolve({ ok: false, message: 'AppBar helper timed out before reporting status.' });
      setTimeout(tick, 120);
    };
    tick();
  });
}


function appBarPowerShellArgs(action, mode = dockMode, targetBounds = null, statusFile = '', stopFile = '') {
  const hwnd = hwndToString();
  const helper = appBarHelperPath();
  const args = ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', helper, '-Action', action, '-Hwnd', hwnd];
  if (statusFile) args.push('-StatusFile', statusFile);
  if (stopFile) args.push('-StopFile', stopFile, '-KeepAlive', '-ParentPid', String(process.pid));
  if (action === 'register') {
    const display = targetBounds ? screen.getDisplayMatching(targetBounds) : getBestDisplay();
    const monitorDip = display.bounds;
    const monitorScreen = rectDipToScreen(monitorDip, display);
    const boundsDip = targetBounds || deckBoundsForDisplay(display, mode, true);
    const boundsScreen = rectDipToScreen(boundsDip, display);
    const thickness = mode === 'left' || mode === 'right' ? boundsScreen.width : boundsScreen.height;
    args.push(
      '-Edge', appBarEdgeForMode(mode),
      '-MonitorLeft', String(Math.round(monitorScreen.x)),
      '-MonitorTop', String(Math.round(monitorScreen.y)),
      '-MonitorRight', String(Math.round(monitorScreen.x + monitorScreen.width)),
      '-MonitorBottom', String(Math.round(monitorScreen.y + monitorScreen.height)),
      '-Thickness', String(Math.round(thickness)),
    );
    appendAppBarLog('AppBar spawn args prepared', {
      mode,
      hwnd,
      scaleFactor: display.scaleFactor,
      monitorDip,
      boundsDip,
      monitorScreen,
      boundsScreen,
      thickness,
    });
  }
  return args;
}

// Returns a promise that resolves once the previous helper has exited.
// AppBar registrations are keyed by HWND: if the old helper processes its stop
// signal AFTER the next helper has already re-registered, its ABM_REMOVE
// silently unregisters the NEW appbar — the reserved space vanishes while the
// deck believes it is still docked. Callers that re-register must await this.
function stopResidentAppBar() {
  const proc = appBarProcess;
  const stopFile = appBarStopFile;
  if (stopFile) {
    try { fs.writeFileSync(stopFile, String(Date.now()), 'utf8'); } catch {}
  }
  appBarProcess = null;
  appBarStopFile = '';
  appBarStatusFile = '';
  appBarRegistered = false;
  appBarSignature = '';
  if (!proc || proc.killed || proc.exitCode !== null) return Promise.resolve();
  return new Promise((resolve) => {
    let done = false;
    const finish = () => { if (!done) { done = true; resolve(); } };
    proc.once('exit', finish);
    setTimeout(() => {
      try { if (!proc.killed) proc.kill(); } catch {}
      finish();
    }, 1600);
  });
}

// Fire-and-forget wrapper around the awaited teardown so every caller uses the
// same, race-free removal path.
function unregisterAppBar() {
  unregisterAppBarAndWait(2500).catch((err) => appendAppBarLog('AppBar teardown failed', err.message || String(err)));
  lastAppBarResult = { ok: true, action: 'remove', message: 'AppBar removal started.' };
  return lastAppBarResult;
}

// Wait until the reserved work area is actually released before continuing.
// Quitting (or switching SPACE off) must not depend on an orphaned helper
// noticing our death later - that is what left a ghost strip on the desktop.
async function unregisterAppBarAndWait(timeoutMs = 2500) {
  appBarRegisterSeq += 1;
  ignoreDisplayMetricsUntil = Date.now() + 1400;
  const hwnd = appBarLiveHwnd;
  appBarLiveHwnd = '';
  const hadAppBar = Boolean(hwnd) || appBarRegistered || Boolean(appBarProcess) || Boolean(appBarRegisterPending);
  // Removing a half-finished registration is what strands a strip: the shell
  // accepts it moments later and nothing is left to take it back.
  if (appBarRegisterPending) {
    await Promise.race([
      appBarRegisterPending.catch(() => {}),
      new Promise((resolve) => setTimeout(resolve, 6000)),
    ]);
  }
  const liveHwnd = hwnd || appBarLiveHwnd;
  appBarLiveHwnd = '';
  const stopped = stopResidentAppBar();
  if (!hadAppBar) {
    lastAppBarResult = { ok: true, action: 'remove', message: 'No AppBar to remove.' };
    return lastAppBarResult;
  }
  let timer = null;
  const timedOut = await Promise.race([
    stopped.then(() => false),
    new Promise((resolve) => { timer = setTimeout(() => resolve(true), timeoutMs); }),
  ]);
  if (timer) clearTimeout(timer);
  // Belt and braces: if the resident helper did not confirm in time, remove the
  // appbar with a blocking call so the desktop is restored while this process
  // is still alive.
  if (timedOut) removeAppBarSync(liveHwnd);
  else forgetAppBarHwnd(liveHwnd);
  lastAppBarResult = { ok: true, action: 'remove', message: 'AppBar removed.' };
  return lastAppBarResult;
}

function removeAppBarSync(hwnd) {
  if (!hwnd || process.platform !== 'win32') return false;
  const helper = appBarHelperPath();
  if (!fs.existsSync(helper)) return false;
  try {
    execFileSync('powershell.exe', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', helper, '-Action', 'remove', '-Hwnd', String(hwnd)], {
      windowsHide: true,
      stdio: 'ignore',
      timeout: 8000,
    });
    appendAppBarLog('Synchronous AppBar removal completed', { hwnd });
    forgetAppBarHwnd(hwnd);
    return true;
  } catch (err) {
    appendAppBarLog('Synchronous AppBar removal failed', { hwnd, message: err.message || String(err) });
    return false;
  }
}

// --- stale AppBar self-healing -------------------------------------------
// If the app dies without unregistering (crash, hard kill), the shell keeps the
// old reservation keyed to the dead HWND. Every later dock then gets pushed
// inward by that ghost strip (deck creeps upward / looks squashed). We persist
// the registered HWND and remove it on the next startup.
function appBarHwndRecordPath() {
  return path.join(documentsStorePath().dir, 'appbar-last.json');
}

// The record is a LIST, not a single slot: several crashed runs can each leave
// their own reservation behind, and cleaning only the newest one strands the
// rest, so the desktop keeps a strip that nobody owns any more.
function readAppBarRecords() {
  try {
    const parsed = JSON.parse(fs.readFileSync(appBarHwndRecordPath(), 'utf8'));
    const list = Array.isArray(parsed) ? parsed : [parsed];
    return list
      .map((rec) => ({ hwnd: String((rec && rec.hwnd) || '').trim(), pid: rec && rec.pid, at: rec && rec.at }))
      .filter((rec) => /^[0-9]+$/.test(rec.hwnd));
  } catch {
    return [];
  }
}

function writeAppBarRecords(list) {
  try {
    if (!list.length) { safeUnlink(appBarHwndRecordPath()); return; }
    const { dir } = documentsStorePath();
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(appBarHwndRecordPath(), JSON.stringify(list.slice(-16)), 'utf8');
  } catch {}
}

function recordAppBarHwnd(hwnd) {
  const key = String(hwnd || '').trim();
  if (!key) return;
  const list = readAppBarRecords().filter((rec) => rec.hwnd !== key);
  list.push({ hwnd: key, pid: process.pid, at: Date.now() });
  writeAppBarRecords(list);
}

function forgetAppBarHwnd(hwnd) {
  const key = String(hwnd || '').trim();
  if (!key) return;
  writeAppBarRecords(readAppBarRecords().filter((rec) => rec.hwnd !== key));
}



function removeStaleAppBarFromPreviousRun() {
  if (process.platform !== 'win32') return;
  try {
    const records = readAppBarRecords();
    if (!records.length) return;
    const helper = appBarHelperPath();
    if (!fs.existsSync(helper)) return;
    const mine = hwndToString();
    const survivors = [];
    for (const rec of records) {
      if (rec.hwnd === mine) { survivors.push(rec); continue; }
      appendAppBarLog('Removing stale AppBar left by a previous run', rec);
      // Blocking on purpose: this runs once at startup before any dock is
      // registered, and a surviving ghost strip corrupts every later dock
      // geometry. Records are dropped only once removal actually succeeded.
      try {
        execFileSync('powershell.exe', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', helper, '-Action', 'remove', '-Hwnd', rec.hwnd], {
          windowsHide: true,
          stdio: 'ignore',
          timeout: 8000,
        });
      } catch (err) {
        appendAppBarLog('Stale AppBar removal failed; keeping record', { hwnd: rec.hwnd, message: err.message || String(err) });
        survivors.push(rec);
      }
    }
    writeAppBarRecords(survivors);
  } catch (err) {
    appendAppBarLog('Stale AppBar cleanup failed', err.message || String(err));
  }
}

async function registerAppBarOnce(mode, targetBounds) {
  let settle = null;
  appBarRegisterPending = new Promise((resolve) => { settle = resolve; });
  try {
    return await registerAppBarOnceInner(mode, targetBounds);
  } finally {
    appBarRegisterPending = null;
    settle();
  }
}

async function registerAppBarOnceInner(mode, targetBounds) {
  const requestSeq = ++appBarRegisterSeq;
  if (process.platform !== 'win32') {
    const result = { ok: true, unsupported: true, message: 'Windows AppBar is only available on Windows.' };
    lastAppBarResult = result;
    return result;
  }
  const hwnd = hwndToString();
  if (!hwnd) {
    const result = { ok: false, message: 'Window handle is not ready.' };
    lastAppBarResult = result;
    return result;
  }
  const helper = appBarHelperPath();
  if (!fs.existsSync(helper)) {
    const result = { ok: false, message: 'AppBar helper is missing.' };
    lastAppBarResult = result;
    return result;
  }

  const signature = makeAppBarSignature(mode, targetBounds);
  if (appBarRegistered && appBarProcess && appBarSignature === signature) {
    const result = { ok: true, action: 'register', reused: true, message: 'Existing AppBar registration already matches this dock geometry.', rect: null, logFile: appBarLogPath() };
    lastAppBarResult = result;
    appendAppBarLog('Reusing existing AppBar registration', { signature });
    return result;
  }

  await stopResidentAppBar();
  appBarSignature = signature;
  const paths = appBarTempPaths();
  safeUnlink(paths.status);
  safeUnlink(paths.stop);
  appBarStopFile = paths.stop;
  appBarStatusFile = paths.status;

  const args = appBarPowerShellArgs('register', mode, targetBounds, paths.status, paths.stop);
  // Record BEFORE the shell can accept the reservation. A crash between the
  // spawn and the success callback would otherwise leave a strip that no
  // record points at, and nothing could ever clean it up.
  appBarLiveHwnd = hwnd;
  recordAppBarHwnd(hwnd);
  appendAppBarLog('Starting AppBar helper', { helper, args });
  const child = spawn('powershell.exe', args, {
    windowsHide: true,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  appBarProcess = child;
  let stdout = '';
  let stderr = '';
  child.stdout.on('data', (chunk) => {
    const text = String(chunk || '');
    stdout += text;
    appendAppBarLog('AppBar helper stdout', text.trim());
  });
  child.stderr.on('data', (chunk) => {
    const text = String(chunk || '');
    stderr += text;
    appendAppBarLog('AppBar helper stderr', text.trim());
  });
  child.on('error', (err) => {
    const msg = err.message || String(err);
    if (appBarProcess === child && requestSeq === appBarRegisterSeq) {
      lastAppBarResult = { ok: false, message: `AppBar helper spawn error: ${msg}`, stderr: stderr.trim(), stdout: stdout.trim(), logFile: appBarLogPath() };
    }
    appendAppBarLog('AppBar helper spawn error', msg);
  });
  child.on('exit', (code) => {
    if (appBarProcess === child && requestSeq === appBarRegisterSeq) {
      appBarProcess = null;
      appBarRegistered = false;
      appBarSignature = '';
      const msg = `AppBar helper exited: ${code}`;
      lastAppBarResult = { ok: false, message: msg, stderr: stderr.trim(), stdout: stdout.trim(), logFile: appBarLogPath() };
      appendAppBarLog(msg, { stderr: stderr.trim(), stdout: stdout.trim() });
      if (mainWindow && !mainWindow.isDestroyed()) sendDockMode();
    }
  });

  const result = await waitForJsonFile(paths.status, 30000);
  result.stdout = result.stdout || stdout.trim();
  result.stderr = result.stderr || stderr.trim();
  result.logFile = appBarLogPath();
  appendAppBarLog('AppBar status received', result);

  if (requestSeq !== appBarRegisterSeq) {
    const stale = { ok: false, stale: true, message: 'Stale AppBar registration result ignored.', stdout: stdout.trim(), stderr: stderr.trim(), logFile: appBarLogPath() };
    appendAppBarLog('Ignoring stale AppBar result', { requestSeq, appBarRegisterSeq, result });
    return stale;
  }

  if (result.action !== 'register') {
    const ignored = { ...result, ok: false, stale: true, message: `Ignored non-register AppBar status: ${result.action || 'unknown'}` };
    appendAppBarLog('Ignoring non-register AppBar status', ignored);
    return ignored;
  }

  if (!result.ok) {
    lastAppBarResult = result;
    stopResidentAppBar();
    removeAppBarSync(hwnd);
    appBarLiveHwnd = '';
    return result;
  }
  lastAppBarResult = result;
  appBarRegistered = true;
  appBarLiveHwnd = hwnd;
  return result;
}

function rectFromAppBarResult(result, fallback) {
  const rc = result && result.rect;
  if (!rc) return fallback;
  const sx = Number(rc.left);
  const sy = Number(rc.top);
  const sw = Number(rc.right) - Number(rc.left);
  const sh = Number(rc.bottom) - Number(rc.top);
  if (![sx, sy, sw, sh].every(Number.isFinite) || sw <= 0 || sh <= 0) return fallback;
  const dipGuess = {
    x: Math.round(sx),
    y: Math.round(sy),
    width: Math.max(1, Math.round(sw)),
    height: Math.max(1, Math.round(sh)),
  };
  const display = screen.getDisplayMatching(fallback) || getBestDisplay();
  const dipRect = rectScreenToDip({ x: sx, y: sy, width: sw, height: sh }, display);
  appendAppBarLog('Converted AppBar rect screen→DIP', { screenRect: { x: sx, y: sy, width: sw, height: sh }, dipRect, displayId: display.id, scaleFactor: display.scaleFactor, dipGuess });
  return dipRect;
}

// preferCursor must be true only for user-initiated dock actions (DOCK button,
// shortcut). Automatic re-applies (display-metrics-changed, reserve toggle,
// startup) must keep the remembered target display; otherwise a work-area event
// while the cursor happens to sit on another monitor silently re-docks the deck
// there — the "docked on the secondary monitor, jumped to unintended
// coordinates and got stuck" bug.
async function positionWindowForDock(mode, preferCursor = false) {
  if (!mainWindow || mainWindow.isDestroyed()) return mode;
  if (appBarBusy) {
    appendAppBarLog('Dock positioning skipped because AppBar operation is already busy', { mode });
    return mode;
  }
  appBarBusy = true;
  try {
    const display = getBestDisplay(preferCursor);
    if (mode !== 'free') dockTargetDisplayId = display.id;
    const target = mode === 'free'
      ? safeFreeBounds(display)
      : deckBoundsForDisplay(display, mode, reserveSpaceEnabled && process.platform === 'win32');
    if (mode === 'free' || !reserveSpaceEnabled || process.platform !== 'win32') {
      if (appBarRegistered || appBarProcess) unregisterAppBar();
      mainWindow.setBounds(target);
      appBarRegistered = false;
      return mode;
    }

    // Pre-place the deck at the final monitor edge before registering the AppBar.
    // This avoids the visible "jump to make room, then jump back" effect when
    // Windows updates the work area and existing maximized windows resize.
    applyingDockBounds = true;
    mainWindow.setBounds(target);
    ignoreDisplayMetricsUntil = Date.now() + 1800;

    const result = await registerAppBarOnce(mode, target);
    if (result && result.stale) {
      appendAppBarLog('Skipping stale AppBar result in positionWindowForDock', result);
      return mode;
    }
    if (result && result.ok && result.action === 'register') {
      const adjusted = anchorDockRectToDisplay(rectFromAppBarResult(result, target), display);
      appendAppBarLog('AppBar reserve succeeded; applying Electron DIP bounds', { target, adjusted, result });
      ignoreDisplayMetricsUntil = Date.now() + 1800;
      mainWindow.setBounds(adjusted);
      appBarRegistered = true;
    } else {
      mainWindow.setBounds(target);
      appBarRegistered = false;
      appBarSignature = '';
      if (result?.message) appendAppBarLog('AppBar reserve failed', result);
    }
    return mode;
  } finally {
    setTimeout(() => { appBarBusy = false; applyingDockBounds = false; }, 650);
  }
}

function sendDockMode() {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  mainWindow.webContents.send('deck-lock-changed', { mode: dockMode, locked: dockMode !== 'free', manualResizeSinceDock, reserveSpaceEnabled, registered: appBarRegistered, appBarRegistered, appBarStatus: lastAppBarResult });
}

async function applyDockMode(mode, preferCursor = false) {
  if (!mainWindow || mainWindow.isDestroyed()) return mode;
  if (dockMode === 'free') lastFreeBounds = mainWindow.getBounds();
  dockMode = mode;
  applyingDockBounds = true;
  manualResizeSinceDock = false;
  await positionWindowForDock(dockMode, preferCursor);
  setTimeout(() => { applyingDockBounds = false; }, 450);
  sendDockMode();
  return dockMode;
}

async function cycleDockMode() {
  if (manualResizeSinceDock) {
    return applyDockMode('bottom', true);
  }
  const order = ['bottom', 'right', 'left', 'free'];
  const idx = order.indexOf(dockMode);
  return applyDockMode(order[(idx + 1) % order.length], true);
}

async function setReserveSpaceEnabled(value) {
  reserveSpaceEnabled = Boolean(value);
  if (!reserveSpaceEnabled) {
    // Wait for the shell to hand the strip back before repositioning, so the
    // deck is not laid out against a work area that is still shrinking.
    await unregisterAppBarAndWait(2000);
    if (dockMode !== 'free' && mainWindow && !mainWindow.isDestroyed()) {
      applyingDockBounds = true;
      mainWindow.setBounds(deckBoundsForDisplay(getBestDisplay(false), dockMode));
      setTimeout(() => { applyingDockBounds = false; }, 250);
    }
  } else if (dockMode !== 'free') {
    applyingDockBounds = true;
    await positionWindowForDock(dockMode);
    setTimeout(() => { applyingDockBounds = false; }, 250);
  }
  sendDockMode();
  return { enabled: reserveSpaceEnabled, registered: appBarRegistered, mode: dockMode, appBarStatus: lastAppBarResult };
}

function startLocalServer() {
  if (localServer) return Promise.resolve(appOrigin);
  const root = __dirname;
  localServer = http.createServer((req, res) => {
    try {
      const url = new URL(req.url, 'http://127.0.0.1');
      let pathname = decodeURIComponent(url.pathname);
      if (pathname === '/') pathname = '/index.html';
      const filePath = path.normalize(path.join(root, pathname));
      if (!filePath.startsWith(root)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
      }
      fs.readFile(filePath, (err, data) => {
        if (err) {
          res.writeHead(404);
          res.end('Not Found');
          return;
        }
        const ext = path.extname(filePath).toLowerCase();
        res.writeHead(200, {
          'Content-Type': MIME[ext] || 'application/octet-stream',
          'Referrer-Policy': 'strict-origin-when-cross-origin',
          'Cache-Control': 'no-store',
        });
        res.end(data);
      });
    } catch (err) {
      res.writeHead(500);
      res.end(String(err.message || err));
    }
  });

  return new Promise((resolve, reject) => {
    localServer.once('error', reject);
    localServer.listen(0, '127.0.0.1', () => {
      const { port } = localServer.address();
      appOrigin = `http://127.0.0.1:${port}`;
      resolve(appOrigin);
    });
  });
}


function configureYouTubeSessionHeaders() {
  try {
    session.defaultSession.webRequest.onBeforeSendHeaders(
      { urls: ['*://*.youtube.com/*', '*://*.youtube-nocookie.com/*', '*://*.googlevideo.com/*', '*://*.ytimg.com/*'] },
      (details, callback) => {
        const headers = { ...details.requestHeaders };
        headers['User-Agent'] = CHROME_UA;
        if (details.url.includes('youtube.com') || details.url.includes('youtube-nocookie.com')) {
          headers['Accept-Language'] = headers['Accept-Language'] || 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7';
          // Electron/localhost/custom embedded contexts can lose or over-restrict Referer.
          // YouTube's embedded-player identification rules require a useful HTTP Referer.
          if (!headers.Referer && !headers.referer) headers.Referer = appOrigin || 'https://www.youtube.com/';
        }
        callback({ requestHeaders: headers });
      }
    );
  } catch (err) {
    console.warn('Could not configure YouTube session headers:', err.message || err);
  }
}

function readPersistentStateFile() {
  const { file } = documentsStorePath();
  const backup = `${file}.bak`;
  try {
    if (fs.existsSync(file)) return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (err) {
    // The library is user data: never lose it silently. Preserve the corrupt
    // file for inspection, then fall back to the last-known-good backup.
    console.warn('Read persistent state failed:', err.message || err);
    try { fs.copyFileSync(file, `${file}.corrupt-${Date.now()}`); } catch {}
  }
  try {
    if (fs.existsSync(backup)) return JSON.parse(fs.readFileSync(backup, 'utf8'));
  } catch (err) {
    console.warn('Backup state read failed:', err.message || err);
  }
  return null;
}

function writePersistentStateFile(data) {
  const { dir, file } = documentsStorePath();
  fs.mkdirSync(dir, { recursive: true });
  const tmp = `${file}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf8');
  try { if (fs.existsSync(file)) fs.copyFileSync(file, `${file}.bak`); } catch {}
  fs.renameSync(tmp, file);
  return file;
}

function appIconPath() {
  return path.join(__dirname, 'assets', 'app-icon.png');
}

function sendTrayCommand(command) {
  if (mainWindow && !mainWindow.isDestroyed()) mainWindow.webContents.send('deck-tray-command', command);
}

function toggleMainWindowVisible() {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  if (mainWindow.isMinimized()) { mainWindow.restore(); mainWindow.focus(); return; }
  if (mainWindow.isVisible()) mainWindow.hide();
  else { mainWindow.show(); mainWindow.focus(); }
}

function createTray() {
  try {
    const icon = nativeImage.createFromPath(appIconPath());
    if (!icon || icon.isEmpty()) return;
    tray = new Tray(icon);
    tray.setToolTip('YT Deck Player');
    tray.setContextMenu(Menu.buildFromTemplate([
      { label: '보이기/숨기기', click: toggleMainWindowVisible },
      { type: 'separator' },
      { label: '재생/일시정지', click: () => sendTrayCommand('playPause') },
      { label: '다음 곡', click: () => sendTrayCommand('next') },
      { label: '이전 곡', click: () => sendTrayCommand('prev') },
      { type: 'separator' },
      { label: '독 위치 전환', click: () => cycleDockMode() },
      { type: 'separator' },
      { label: '종료', click: () => { if (mainWindow && !mainWindow.isDestroyed()) mainWindow.close(); else app.quit(); } },
    ]));
    tray.on('click', toggleMainWindowVisible);
  } catch (err) {
    console.warn('Tray init failed:', err.message || err);
  }
}

async function createWindow() {
  const bounds = getDeckBounds();
  mainWindow = new BrowserWindow({
    ...bounds,
    icon: appIconPath(),
    frame: false,
    transparent: false,
    resizable: true,
    minWidth: 360,
    minHeight: 56,
    alwaysOnTop: true,
    skipTaskbar: false,
    title: 'YT Deck Player',
    backgroundColor: '#080a0f',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      webSecurity: true,
      autoplayPolicy: 'no-user-gesture-required',
    },
  });

  const origin = await startLocalServer();
  configureYouTubeSessionHeaders();
  mainWindow.webContents.setUserAgent(CHROME_UA);
  await mainWindow.loadURL(`${origin}/index.html`);
  mainWindow.setAlwaysOnTop(true, 'screen-saver');
  if (dockMode !== 'free' && reserveSpaceEnabled) {
    applyingDockBounds = true;
    await positionWindowForDock(dockMode);
    setTimeout(() => { applyingDockBounds = false; }, 450);
  }
  sendDockMode();

  mainWindow.on('move', () => {
    if (!mainWindow || mainWindow.isDestroyed()) return;
    if (dockMode !== 'free') return;
    const display = screen.getDisplayMatching(mainWindow.getBounds());
    mainWindow.webContents.send('deck-display-changed', {
      scaleFactor: display.scaleFactor,
      bounds: display.bounds,
      workArea: display.workArea,
    });
  });

  mainWindow.on('resize', () => {
    if (!mainWindow || mainWindow.isDestroyed()) return;
    // A resize only counts as manual when it is not ours (applyingDockBounds/
    // appBarBusy) and not inside the settle window after an AppBar/work-area
    // change — the shell nudges docked windows during those, and treating that
    // as a user resize used to unregister the AppBar and shrink the deck.
    if (!applyingDockBounds && !appBarBusy && Date.now() >= ignoreDisplayMetricsUntil && dockMode !== 'free') {
      manualResizeSinceDock = true;
      if (appBarRegistered) unregisterAppBar();
      sendDockMode();
    }
    const display = screen.getDisplayMatching(mainWindow.getBounds());
    mainWindow.webContents.send('deck-display-changed', {
      scaleFactor: display.scaleFactor,
      bounds: display.bounds,
      workArea: display.workArea,
      windowBounds: mainWindow.getBounds(),
      manualResizeSinceDock,
    });
  });

  mainWindow.on('closed', () => {
    destroyYtView();
    mainWindow = null;
  });

  if (process.argv.includes('--dev')) {
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  }
}

// A second instance would fight over the AppBar registration and the persistent
// state file. Hand focus to the running deck instead.
if (!app.requestSingleInstanceLock()) {
  app.quit();
}
app.on('second-instance', () => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.show();
    mainWindow.focus();
  }
});

app.whenReady().then(async () => {
  app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');
  removeLegacyAccountArtifacts();
  removeStaleAppBarFromPreviousRun();
  reserveSpaceEnabled = readPersistedReserveSpace();
  appendAppBarLog('Startup reserve-space preference', { reserveSpaceEnabled });
  await createWindow();
  createTray();

  globalShortcut.register('CommandOrControl+Alt+D', () => {
    if (mainWindow) mainWindow.webContents.toggleDevTools();
  });

  globalShortcut.register('CommandOrControl+Alt+L', () => {
    if (!mainWindow) return;
    applyDockMode(dockMode === 'free' ? 'bottom' : 'free', true);
  });

  function scheduleDockReapply(reason) {
    if (!mainWindow || dockMode === 'free') return;
    if (appBarBusy || Date.now() < ignoreDisplayMetricsUntil) {
      appendAppBarLog('Ignoring display metric event during AppBar settle window', { reason, appBarBusy, ignoreDisplayMetricsUntil });
      return;
    }
    clearTimeout(displayMetricsTimer);
    displayMetricsTimer = setTimeout(() => {
      if (mainWindow && dockMode !== 'free') applyDockMode(dockMode);
    }, 450);
  }
  screen.on('display-metrics-changed', () => scheduleDockReapply('display-metrics-changed'));
  screen.on('display-added', () => scheduleDockReapply('display-added'));
  screen.on('display-removed', () => scheduleDockReapply('display-removed'));
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// Releasing the reserved work area must finish while this process is still
// alive. Quitting first and trusting a detached helper to notice our death
// later left a ghost strip whenever that helper was killed along with us.
let appBarTeardownDone = false;
app.on('before-quit', (event) => {
  if (appBarTeardownDone) return;
  if (process.platform !== 'win32' || !(appBarRegistered || appBarProcess || appBarLiveHwnd)) {
    appBarTeardownDone = true;
    return;
  }
  event.preventDefault();
  unregisterAppBarAndWait(2500)
    .catch((err) => appendAppBarLog('AppBar teardown failed on quit', err.message || String(err)))
    .then(() => { appBarTeardownDone = true; app.quit(); });
});

app.on('will-quit', () => {
  try { destroyYtView(); } catch {}
  globalShortcut.unregisterAll();
  // Last resort for paths that bypass before-quit (e.g. app.exit()).
  try { if (appBarRegistered || appBarProcess || appBarLiveHwnd) removeAppBarSync(appBarLiveHwnd || hwndToString()); } catch {}
  try { unregisterAppBar(); } catch {}
  try { tray?.destroy(); } catch {}
  if (localServer) localServer.close();
});

ipcMain.handle('deck:getBounds', () => getDeckBounds());
ipcMain.handle('deck:getOrigin', () => appOrigin);
ipcMain.handle('deck:dockBottom', async () => {
  if (!mainWindow) return false;
  return cycleDockMode();
});
ipcMain.handle('deck:setReserveSpace', async (_event, value) => setReserveSpaceEnabled(value));
ipcMain.handle('deck:getReserveSpace', () => ({ enabled: reserveSpaceEnabled, registered: appBarRegistered, mode: dockMode, appBarStatus: lastAppBarResult }));
ipcMain.handle('deck:setAlwaysOnTop', (_event, value) => {
  if (!mainWindow) return false;
  mainWindow.setAlwaysOnTop(Boolean(value), 'screen-saver');
  return true;
});
ipcMain.handle('deck:setOpacity', (_event, value) => {
  if (!mainWindow) return false;
  const raw = Number(value);
  const opacity = Math.min(1, Math.max(0, Number.isFinite(raw) ? raw : 1));
  mainWindow.setOpacity(opacity);
  return opacity;
});
ipcMain.handle('deck:minimize', () => {
  if (mainWindow) mainWindow.minimize();
});
ipcMain.handle('deck:setTrayTooltip', (_event, text) => {
  try { tray?.setToolTip(String(text || '').slice(0, 120) || 'YT Deck Player'); } catch {}
});
ipcMain.handle('deck:close', () => {
  if (mainWindow) mainWindow.close();
});
/* =========================================================================
 * Google / YouTube account
 * -------------------------------------------------------------------------
 * The user signs in themselves in a real YouTube window; the app never sees
 * or handles the credentials. The resulting cookies live in a persistent
 * partition, which is what lets age-restricted tracks play on youtube.com
 * and lets the deck read the account's own playlists.
 * ========================================================================= */
/* -------------------------------------------------------------------------
 * In-deck YouTube view
 * Age-restricted tracks cannot play in a third-party iframe at all, so those
 * are played on youtube.com itself inside a view pinned over the preview
 * panel. The deck keeps ownership of the queue: this view only reports
 * progress and end-of-video back to the renderer.
 * ------------------------------------------------------------------------- */
// Presentation only: the watch page keeps everything it normally renders
// inside the player (including ads); this simply crops the surrounding site
// chrome so the deck frame shows the video instead of a miniature web page.
const YT_VIEW_CSS = `
  html, body { overflow: hidden !important; background: #000 !important; }
  #masthead-container, ytd-masthead, #guide, tp-yt-app-drawer, ytd-mini-guide-renderer,
  #secondary, #below, ytd-comments, #chat, ytd-merch-shelf-renderer, #donation-shelf {
    display: none !important;
  }
  ytd-page-manager, #page-manager { margin: 0 !important; }
  ytd-watch-flexy #columns, ytd-watch-flexy #primary, ytd-watch-flexy #primary-inner {
    margin: 0 !important; padding: 0 !important; max-width: 100vw !important; width: 100vw !important;
  }
  #player, #player-container, #player-container-outer, #player-container-inner, #movie_player, .html5-video-player {
    width: 100vw !important; height: 100vh !important; max-width: 100vw !important; max-height: 100vh !important;
    margin: 0 !important; padding: 0 !important; border-radius: 0 !important;
  }
  video.html5-main-video { width: 100vw !important; height: 100vh !important; left: 0 !important; top: 0 !important; object-fit: contain; }
`;

const YT_VIEW_BRIDGE = `(() => {
  if (window.__deckBridge) return 'already';
  window.__deckBridge = true;
  const pick = () => document.querySelector('video.html5-main-video') || document.querySelector('video');
  const adShowing = () => !!document.querySelector('.ad-showing, .ytp-ad-player-overlay');
  const gate = () => {
    const el = document.querySelector('.ytp-error, yt-playability-error-supported-renderers, #error-screen [class*=reason]');
    if (!el) return '';
    return (el.innerText || '').trim().slice(0, 140);
  };
  let lastState = '';
  const report = (type, extra) => {
    try { console.info('DECKEVT' + JSON.stringify(Object.assign({ type }, extra || {}))); } catch (e) {}
  };
  setInterval(() => {
    const blocked = gate();
    if (blocked) {
      if (lastState !== 'blocked') { lastState = 'blocked'; report('blocked', { reason: blocked }); }
      return;
    }
    const v = pick();
    if (!v) { if (lastState !== 'waiting') { lastState = 'waiting'; report('waiting'); } return; }
    const ad = adShowing();
    report('progress', { time: v.currentTime || 0, duration: v.duration || 0, paused: !!v.paused, ad: ad });
    if (!ad && v.ended) { if (lastState !== 'ended') { lastState = 'ended'; report('ended'); } }
    else if (v.ended === false) { lastState = ''; }
  }, 500);
  window.__deckCmd = (cmd, value) => {
    const v = pick();
    if (!v) return false;
    if (cmd === 'play') { v.play().catch(() => {}); return true; }
    if (cmd === 'pause') { v.pause(); return true; }
    if (cmd === 'toggle') { if (v.paused) v.play().catch(() => {}); else v.pause(); return !v.paused; }
    if (cmd === 'volume') { v.volume = Math.min(1, Math.max(0, Number(value) / 100)); v.muted = false; return true; }
    if (cmd === 'rate') { try { v.playbackRate = Number(value) || 1; } catch (e) {} return true; }
    if (cmd === 'seek') { try { v.currentTime = Number(value) || 0; } catch (e) {} return true; }
    return false;
  };
  return 'ready';
})()`;

// Parking instead of destroying keeps the renderer warm, so a run of
// age-restricted tracks switches in without paying the process start-up cost
// again. It is torn down for real once the deck stops needing it.
function parkYtView() {
  if (!ytView) return;
  try { ytView.setBounds({ x: -20000, y: -20000, width: 16, height: 16 }); } catch {}
  try { ytView.webContents.loadURL('about:blank'); } catch {}
  clearTimeout(ytIdleTimer);
  ytIdleTimer = setTimeout(() => { destroyYtView(); }, 180000);
}

function destroyYtView() {
  clearTimeout(ytIdleTimer);
  if (!ytView) return;
  try {
    if (mainWindow && !mainWindow.isDestroyed()) mainWindow.contentView.removeChildView(ytView);
  } catch {}
  try { ytView.webContents.close(); } catch {}
  ytView = null;
}

function applyYtViewBounds() {
  if (!ytView || !ytViewBounds) return;
  const r = ytViewBounds;
  try {
    ytView.setBounds({
      x: Math.max(0, Math.round(r.x)),
      y: Math.max(0, Math.round(r.y)),
      width: Math.max(1, Math.round(r.width)),
      height: Math.max(1, Math.round(r.height)),
    });
  } catch {}
}

function ensureYtView() {
  if (ytView) return ytView;
  if (!mainWindow || mainWindow.isDestroyed()) return null;
  ytView = new WebContentsView({
    webPreferences: {
      partition: YT_PARTITION,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      autoplayPolicy: 'no-user-gesture-required',
    },
  });
  ytView.webContents.setUserAgent(CHROME_UA);
  ytView.setBorderRadius?.(10);
  mainWindow.contentView.addChildView(ytView);
  applyYtViewBounds();

  // The bridge talks back over console messages: no preload script is injected
  // into youtube.com, so the page keeps its own isolated world.
  ytView.webContents.on('console-message', (event, level, message) => {
    if (typeof message !== 'string' || !message.startsWith('DECKEVT')) return;
    try {
      const payload = JSON.parse(message.slice(7));
      if (mainWindow && !mainWindow.isDestroyed()) mainWindow.webContents.send('yt-view-event', payload);
    } catch {}
  });
  ytView.webContents.on('did-finish-load', () => {
    ytView?.webContents.insertCSS(YT_VIEW_CSS).catch(() => {});
    ytView?.webContents.executeJavaScript(YT_VIEW_BRIDGE).catch(() => {});
  });
  ytView.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  return ytView;
}

ipcMain.handle('yt:setBounds', (_event, rect) => {
  ytViewBounds = rect && Number.isFinite(rect.width) ? rect : null;
  applyYtViewBounds();
  return true;
});

ipcMain.handle('yt:play', async (_event, videoId) => {
  if (!/^[A-Za-z0-9_-]{11}$/.test(String(videoId || ''))) return { ok: false, message: 'invalid video id' };
  clearTimeout(ytIdleTimer);
  const view = ensureYtView();
  if (!view) return { ok: false, message: 'view unavailable' };
  try {
    await view.webContents.loadURL(`https://www.youtube.com/watch?v=${videoId}&autoplay=1`);
  } catch (err) {
    // Skipping to another track cancels the in-flight navigation; that is an
    // ordinary outcome here, not a failure worth surfacing.
    const message = String(err && err.message);
    if (!message.includes('ERR_ABORTED')) {
      appendAppBarLog('YouTube view load failed', message);
      return { ok: false, message };
    }
  }
  return { ok: true };
});

ipcMain.handle('yt:command', async (_event, command, value) => {
  if (!ytView) return false;
  try {
    return await ytView.webContents.executeJavaScript(`window.__deckCmd && window.__deckCmd(${JSON.stringify(command)}, ${JSON.stringify(value ?? null)})`);
  } catch {
    return false;
  }
});

ipcMain.handle('yt:stop', () => {
  parkYtView();
  ytViewBounds = null;
  return true;
});

// Age-restricted tracks can only play in a real browser session, so hand them
// to the user's own browser where they are already signed in and verified.
ipcMain.handle('yt:openExternal', async (_event, videoId) => {
  if (!/^[A-Za-z0-9_-]{11}$/.test(String(videoId || ''))) return { ok: false };
  await shell.openExternal(`https://www.youtube.com/watch?v=${videoId}`);
  return { ok: true };
});

/* =========================================================================
 * Channel playlists (no account required)
 * -------------------------------------------------------------------------
 * The zero-setup way to pull in "my playlists": a channel's public playlists
 * are readable without signing in at all, so a distributed build needs no
 * account, no consent screen and no per-user setup. Playlists the owner has
 * marked private are not visible this way, by design.
 * ========================================================================= */
function channelPlaylistsUrl(input) {
  const raw = String(input || '').trim();
  if (!raw) return '';
  if (/[?&]list=|\/playlist\b|[?&]v=|\/watch\b|youtu\.be\//i.test(raw)) throw new Error('not-a-channel');
  let path = '';
  const urlMatch = /^https?:\/\/(?:www\.|m\.)?youtube\.com\/(.+)$/i.exec(raw);
  if (urlMatch) {
    path = urlMatch[1].split('?')[0].replace(/\/+$/, '');
  } else if (raw.startsWith('@')) {
    path = raw.split(/[\s/?]/)[0];
  } else if (/^UC[A-Za-z0-9_-]{10,}$/.test(raw)) {
    path = `channel/${raw}`;
  } else if (/^[A-Za-z0-9._-]+$/.test(raw)) {
    path = `@${raw}`;
  } else {
    return '';
  }
  path = path.replace(/\/(playlists|videos|featured|streams|shorts|community|about)$/i, '');
  if (!/^(@[^/]+|channel\/UC[A-Za-z0-9_-]+|c\/[^/]+|user\/[^/]+)$/i.test(path)) return '';
  return `https://www.youtube.com/${path}/playlists?hl=en&gl=US`;
}

function collectChannelPlaylists(root, found) {
  walk(root, (key, value) => {
    if (!value || typeof value !== 'object') return;
    if (key === 'lockupViewModel' && value.contentId && value.contentType === 'LOCKUP_CONTENT_TYPE_PLAYLIST') {
      const id = String(value.contentId);
      if (found.has(id) || !/^[A-Za-z0-9_-]+$/.test(id)) return;
      let count = 0;
      walk(value.contentImage || {}, (k, v) => {
        if (!count && k === 'thumbnailBadgeViewModel' && typeof v?.text === 'string') {
          const m = /(\d[\d,]*)/.exec(v.text);
          if (m) count = Number(m[1].replace(/,/g, ''));
        }
      });
      const sources = value.contentImage?.collectionThumbnailViewModel?.primaryThumbnail?.thumbnailViewModel?.image?.sources
        || value.contentImage?.thumbnailViewModel?.image?.sources;
      found.set(id, {
        playlistId: id,
        title: value.metadata?.lockupMetadataViewModel?.title?.content || id,
        count,
        thumbnail: Array.isArray(sources) && sources.length
          ? [...sources].sort((a, b) => (b.width || 0) - (a.width || 0))[0].url
          : '',
      });
      return;
    }
    // Older layout, kept so the feature does not break if YouTube rolls back.
    if ((key === 'gridPlaylistRenderer' || key === 'playlistRenderer') && value.playlistId) {
      const id = String(value.playlistId);
      if (found.has(id)) return;
      found.set(id, {
        playlistId: id,
        title: textFrom(value.title) || id,
        count: Number(String(textFrom(value.videoCountShortText) || textFrom(value.videoCountText) || '0').replace(/[^\d]/g, '')) || 0,
        thumbnail: bestThumb(value.thumbnail) || '',
      });
    }
  });
}

ipcMain.handle('yt:channelPlaylists', async (_event, input) => {
  const url = channelPlaylistsUrl(input);
  if (!url) throw new Error('invalid channel address');
  const html = await fetchText(url, { Referer: 'https://www.youtube.com/' });
  const data = extractYtInitialData(html);
  if (!data) throw new Error('could not read that channel page');
  const channelName = data?.metadata?.channelMetadataRenderer?.title
    || data?.header?.pageHeaderRenderer?.pageTitle
    || '';
  const found = new Map();
  const continuations = [];
  const seenTokens = new Set();
  collectChannelPlaylists(data, found);
  walk(data, (key, value) => {
    if (key === 'continuationCommand' && value?.token && !seenTokens.has(value.token)) {
      seenTokens.add(value.token);
      continuations.push(value.token);
    }
  });

  // Channels with many playlists page their list; follow a bounded number of
  // continuations so large channels come through complete.
  const cfg = extractYtcfg(html);
  let guard = 0;
  while (cfg?.INNERTUBE_API_KEY && continuations.length && guard < 20 && found.size < 400) {
    guard += 1;
    try {
      const page = await fetchInnertubeContinuation(cfg, continuations.shift());
      const before = found.size;
      collectChannelPlaylists(page, found);
      walk(page, (key, value) => {
        if (key === 'continuationCommand' && value?.token && !seenTokens.has(value.token)) {
          seenTokens.add(value.token);
          continuations.push(value.token);
        }
      });
      if (found.size === before) break;
    } catch (err) {
      appendAppBarLog('Channel playlist continuation failed', err.message || String(err));
      break;
    }
  }

  return { channelName, playlists: [...found.values()], url };
});

ipcMain.handle('deck:loadPersistentState', () => readPersistentStateFile());
ipcMain.handle('deck:savePersistentState', (_event, data) => writePersistentStateFile(data));
ipcMain.handle('deck:getPersistentPath', () => documentsStorePath().file);

ipcMain.handle('youtube:importPlaylistNoKey', async (_event, playlistId) => {
  return importPlaylistNoKey(playlistId);
});

async function importPlaylistNoKey(playlistId) {
  if (!playlistId || !/^[a-zA-Z0-9_-]+$/.test(playlistId)) {
    throw new Error('Invalid playlist id');
  }

  const attempts = [];
  let lastError = null;

  // v0.9: Do NOT trust the RSS feed as the primary source. YouTube RSS is
  // often limited to about 15 entries, so we treat it only as a last-resort
  // partial fallback. The primary path is the playlist page payload plus
  // InnerTube continuations using YouTube's own web client key from ytcfg.
  const runners = [
    ['ytInitialData+desktop+continuation', () => importPlaylistViaInitialData(playlistId, 'desktop')],
    ['ytInitialData+mobile+continuation', () => importPlaylistViaInitialData(playlistId, 'mobile')],
    ['regex-fallback', () => importPlaylistViaRegexFallback(playlistId)],
    ['youtube-rss-partial-fallback', () => importPlaylistViaRss(playlistId)],
  ];

  for (const [method, runner] of runners) {
    try {
      const result = await runner();
      const tracks = normalizeTrackList(result?.tracks || result || []);
      if (tracks.length) {
        attempts.push({
          method,
          tracks,
          complete: Boolean(result?.complete) && !method.includes('rss') && !method.includes('regex'),
          partial: Boolean(result?.partial) || method.includes('rss') || method.includes('regex'),
          continuationPages: result?.continuationPages || 0,
          continuationExhausted: Boolean(result?.continuationExhausted),
        });
      }
    } catch (err) {
      lastError = err;
      console.warn(`Playlist import route failed (${method}):`, err.message || err);
    }
  }

  if (attempts.length === 0) {
    throw new Error(`No public videos found in playlist page${lastError ? ` (${lastError.message || lastError})` : ''}`);
  }

  // Merge the structured page routes first. RSS/regex are only used to fill in
  // holes, never to cap the import at 15 entries.
  const primaryAttempts = attempts.filter((a) => !a.method.includes('rss') && !a.method.includes('regex'));
  const fallbackAttempts = attempts.filter((a) => a.method.includes('rss') || a.method.includes('regex'));
  const merged = [];
  const seen = new Set();
  for (const attempt of [...primaryAttempts, ...fallbackAttempts]) {
    for (const track of attempt.tracks) {
      if (!track?.videoId || seen.has(track.videoId)) continue;
      seen.add(track.videoId);
      merged.push(track);
    }
  }

  const best = attempts.slice().sort((a, b) => b.tracks.length - a.tracks.length)[0];
  const structuredCount = primaryAttempts.reduce((max, a) => Math.max(max, a.tracks.length), 0);
  const rssOnly = structuredCount === 0 && best.method.includes('rss');
  const regexOnly = structuredCount === 0 && best.method.includes('regex');
  const partial = rssOnly || regexOnly || (!best.continuationExhausted && best.continuationPages >= MAX_CONTINUATION_PAGES);
  const method = attempts.map((a) => `${a.method}:${a.tracks.length}`).join(' + ');

  return {
    tracks: merged,
    method,
    count: merged.length,
    partial,
    complete: !partial,
    continuationPages: Math.max(...attempts.map((a) => a.continuationPages || 0), 0),
  };
}

const MAX_IMPORT_TRACKS = 5000;
const MAX_CONTINUATION_PAGES = 180;

function normalizeTrackList(list) {
  const out = [];
  const seen = new Set();
  for (const item of Array.isArray(list) ? list : []) {
    const videoId = item?.videoId;
    if (!videoId || seen.has(videoId)) continue;
    seen.add(videoId);
    out.push({
      videoId,
      title: item.title || videoId,
      channel: item.channel || 'YouTube',
      thumbnail: item.thumbnail || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      duration: item.duration || 0,
    });
  }
  return out;
}

async function importPlaylistViaInitialData(playlistId, variant = 'desktop') {
  const base = variant === 'mobile' ? 'https://m.youtube.com/playlist' : 'https://www.youtube.com/playlist';
  const url = `${base}?list=${encodeURIComponent(playlistId)}&hl=en&persist_hl=1&gl=US`;
  const html = await fetchText(url, variant === 'mobile' ? { 'Referer': 'https://m.youtube.com/' } : { 'Referer': 'https://www.youtube.com/' });
  const initialData = extractYtInitialData(html);
  if (!initialData) throw new Error(`Could not find ytInitialData (${variant})`);

  const cfg = extractYtcfg(html);
  const seen = new Set();
  const tracks = [];
  const continuations = [];
  const continuationSeen = new Set();
  collectPlaylistTracks(initialData, seen, tracks, continuations, continuationSeen);

  let guard = 0;
  let continuationExhausted = true;
  while (cfg?.INNERTUBE_API_KEY && continuations.length && guard < MAX_CONTINUATION_PAGES && tracks.length < MAX_IMPORT_TRACKS) {
    guard += 1;
    const token = continuations.shift();
    try {
      const data = await fetchInnertubeContinuation(cfg, token);
      collectPlaylistTracks(data, seen, tracks, continuations, continuationSeen);
    } catch (err) {
      console.warn('Continuation import failed:', err.message || err);
      continuationExhausted = false;
      break;
    }
  }
  if (continuations.length && (guard >= MAX_CONTINUATION_PAGES || tracks.length >= MAX_IMPORT_TRACKS)) continuationExhausted = false;
  return { tracks, complete: continuationExhausted, partial: !continuationExhausted, continuationPages: guard, continuationExhausted }; 
}

async function importPlaylistViaRss(playlistId) {
  const seen = new Set();
  const url = `https://www.youtube.com/feeds/videos.xml?playlist_id=${encodeURIComponent(playlistId)}`;
  const xml = await fetchText(url, {
    'Accept': 'application/xml,text/xml;q=0.9,*/*;q=0.8',
    'Referer': 'https://www.youtube.com/',
  });
  const entries = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].map((m) => m[1]);
  const tracks = [];
  for (const entry of entries) {
    const videoId = xmlText(entry, 'yt:videoId') || xmlText(entry, 'videoId');
    if (!videoId || seen.has(videoId)) continue;
    seen.add(videoId);
    const title = decodeXml(xmlText(entry, 'title') || videoId);
    const channel = decodeXml(xmlText(entry, 'name') || xmlText(entry, 'author') || 'YouTube');
    const thumbMatch = entry.match(/<media:thumbnail[^>]+url="([^"]+)"/);
    const thumbnail = decodeXml(thumbMatch?.[1] || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`);
    tracks.push({ videoId, title, channel, thumbnail, duration: 0 });
  }
  return tracks;
}

async function importPlaylistViaRegexFallback(playlistId) {
  const seen = new Set();
  const url = `https://www.youtube.com/playlist?list=${encodeURIComponent(playlistId)}&hl=en&gl=US`;
  const html = await fetchText(url, { 'Referer': 'https://www.youtube.com/' });
  const tracks = [];
  const re = /\"videoId\"\s*:\s*\"([a-zA-Z0-9_-]{11})\"/g;
  let m;
  while ((m = re.exec(html)) && tracks.length < 250) {
    const videoId = m[1];
    if (seen.has(videoId)) continue;
    seen.add(videoId);
    const near = html.slice(Math.max(0, m.index - 1200), Math.min(html.length, m.index + 1600));
    const titleMatch = near.match(/\"title\"\s*:\s*\{\s*\"runs\"\s*:\s*\[\s*\{\s*\"text\"\s*:\s*\"([^\"]+)/) || near.match(/\"title\"\s*:\s*\{\s*\"simpleText\"\s*:\s*\"([^\"]+)/);
    const title = titleMatch ? safeJsonString(titleMatch[1]) : videoId;
    tracks.push({ videoId, title, channel: 'YouTube', thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`, duration: 0 });
  }
  return tracks;
}

function xmlText(xml, tag) {
  const safe = tag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`<${safe}[^>]*>([\\s\\S]*?)<\\/${safe}>`);
  return xml.match(re)?.[1]?.trim() || '';
}

function decodeXml(text) {
  return String(text || '')
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function safeJsonString(text) {
  try { return JSON.parse(`"${text}"`); } catch { return String(text || '').replace(/\\u0026/g, '&').replace(/\\\"/g, '"'); }
}

function collectPlaylistTracks(root, seen, tracks, continuations, continuationSeen = new Set()) {
  walk(root, (key, value) => {
    const isVideoRenderer = [
      'playlistVideoRenderer',
      'playlistPanelVideoRenderer',
      'gridVideoRenderer',
      'compactVideoRenderer',
      'videoRenderer',
    ].includes(key);

    if (isVideoRenderer && value && value.videoId) {
      const videoId = value.videoId;
      if (!videoId || seen.has(videoId)) return;
      const title = textFrom(value.title) || textFrom(value.headline) || videoId;
      if (/^(Deleted video|Private video|\[Deleted video\]|\[Private video\])$/i.test(title)) return;
      seen.add(videoId);
      const channel = textFrom(value.shortBylineText) || textFrom(value.ownerText) || textFrom(value.longBylineText) || textFrom(value.bylineText) || '';
      const thumb = bestThumb(value.thumbnail) || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
      const duration = parseDuration(textFrom(value.lengthText) || textFrom(value.thumbnailOverlays));
      tracks.push({ videoId, title, channel, thumbnail: thumb, duration });
    }

    // 2026+ playlist pages replaced playlistVideoRenderer with lockupViewModel
    // (contentId instead of videoId). Without this branch the structured route
    // finds 0 tracks and imports silently degrade to the capped regex/RSS
    // fallbacks (e.g. 57 of 378 tracks).
    if (key === 'lockupViewModel' && value && value.contentId) {
      if (value.contentType && value.contentType !== 'LOCKUP_CONTENT_TYPE_VIDEO') return;
      const videoId = value.contentId;
      if (!/^[a-zA-Z0-9_-]{11}$/.test(videoId) || seen.has(videoId)) return;
      const title = value.metadata?.lockupMetadataViewModel?.title?.content || videoId;
      if (/^(Deleted video|Private video|\[Deleted video\]|\[Private video\])$/i.test(title)) return;
      seen.add(videoId);
      const sources = value.contentImage?.thumbnailViewModel?.image?.sources;
      const thumb = (Array.isArray(sources) && sources.length
        ? [...sources].sort((a, b) => (b.width || 0) - (a.width || 0))[0]?.url
        : '') || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
      let durationText = '';
      walk(value.contentImage || {}, (k, v) => {
        if (!durationText && k === 'thumbnailBadgeViewModel' && typeof v?.text === 'string' && /^\d+(?::\d+)+$/.test(v.text.trim())) {
          durationText = v.text.trim();
        }
      });
      const channel = value.metadata?.lockupMetadataViewModel?.metadata?.contentMetadataViewModel?.metadataRows?.[0]?.metadataParts?.[0]?.text?.content || '';
      tracks.push({ videoId, title, channel, thumbnail: thumb, duration: parseDuration(durationText) });
    }

    if (key === 'continuationCommand' && value?.token) {
      if (!continuationSeen.has(value.token)) {
        continuationSeen.add(value.token);
        continuations.push(value.token);
      }
    }
  });
}

function extractYtcfg(html) {
  const marker = 'ytcfg.set(';
  let searchFrom = 0;
  let merged = {};
  while (true) {
    const idx = html.indexOf(marker, searchFrom);
    if (idx < 0) break;
    const start = html.indexOf('{', idx);
    if (start < 0) break;
    const end = findJsonEnd(html, start);
    if (end <= start) break;
    try {
      const parsed = JSON.parse(html.slice(start, end + 1));
      merged = deepMerge(merged, parsed);
    } catch {}
    searchFrom = end + 1;
  }
  return merged.INNERTUBE_API_KEY ? merged : null;
}

function deepMerge(target, source) {
  const out = { ...(target || {}) };
  for (const [key, value] of Object.entries(source || {})) {
    if (value && typeof value === 'object' && !Array.isArray(value) && out[key] && typeof out[key] === 'object' && !Array.isArray(out[key])) {
      out[key] = deepMerge(out[key], value);
    } else {
      out[key] = value;
    }
  }
  return out;
}

async function fetchInnertubeContinuation(cfg, continuation) {
  const key = cfg.INNERTUBE_API_KEY;
  const context = cfg.INNERTUBE_CONTEXT || {
    client: {
      clientName: cfg.INNERTUBE_CLIENT_NAME || 'WEB',
      clientVersion: cfg.INNERTUBE_CLIENT_VERSION || '2.20240601.00.00',
      hl: 'en',
      gl: 'US',
      ...(cfg.VISITOR_DATA ? { visitorData: cfg.VISITOR_DATA } : {}),
    },
  };
  if (!context.client) context.client = {};
  context.client.hl = context.client.hl || 'en';
  context.client.gl = context.client.gl || 'US';
  if (cfg.VISITOR_DATA && !context.client.visitorData) context.client.visitorData = cfg.VISITOR_DATA;

  const body = { context, continuation };
  const clientNameHeader = String(cfg.INNERTUBE_CONTEXT_CLIENT_NAME || cfg.INNERTUBE_CLIENT_NAME || '1');
  const clientVersionHeader = String(cfg.INNERTUBE_CONTEXT_CLIENT_VERSION || cfg.INNERTUBE_CLIENT_VERSION || context.client.clientVersion || '2.20240601.00.00');
  const browseUrl = `https://www.youtube.com/youtubei/v1/browse?prettyPrint=false&key=${encodeURIComponent(key)}`;
  const res = await fetch(browseUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': '*/*',
      'Accept-Language': 'en-US,en;q=0.9,ko;q=0.8',
      'User-Agent': CHROME_UA,
      'Origin': 'https://www.youtube.com',
      'Referer': 'https://www.youtube.com/',
      'X-YouTube-Client-Name': clientNameHeader,
      'X-YouTube-Client-Version': clientVersionHeader,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Innertube HTTP ${res.status}`);
  return res.json();
}

async function fetchText(url, extraHeaders = {}) {
  // Use browser-like headers and a consent cookie so YouTube is less likely to
  // return an interstitial/empty shell instead of the playlist payload.
  const headers = {
    'User-Agent': CHROME_UA,
    'Accept-Language': 'en-US,en;q=0.9,ko;q=0.8',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
    'Cookie': 'CONSENT=YES+cb.20210328-17-p0.en+FX+667; PREF=hl=en&gl=US',
    ...extraHeaders,
  };
  const res = await fetch(url, { headers, redirect: 'follow' });
  if (!res.ok) throw new Error(`YouTube page HTTP ${res.status}`);
  return res.text();
}

function extractYtInitialData(html) {
  const markers = ['var ytInitialData = ', 'window["ytInitialData"] = ', 'ytInitialData = '];
  for (const marker of markers) {
    const idx = html.indexOf(marker);
    if (idx < 0) continue;
    const start = html.indexOf('{', idx);
    if (start < 0) continue;
    const end = findJsonEnd(html, start);
    if (end > start) {
      try { return JSON.parse(html.slice(start, end + 1)); } catch { /* try next */ }
    }
  }
  const scriptMatch = html.match(/<script[^>]*>\s*({"responseContext"[\s\S]*?)\s*<\/script>/);
  if (scriptMatch) {
    try { return JSON.parse(scriptMatch[1]); } catch { /* ignore */ }
  }
  return null;
}

function findJsonEnd(text, start) {
  let depth = 0;
  let inString = false;
  let escape = false;
  for (let i = start; i < text.length; i += 1) {
    const ch = text[i];
    if (inString) {
      if (escape) { escape = false; continue; }
      if (ch === '\\') { escape = true; continue; }
      if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') { inString = true; continue; }
    if (ch === '{') depth += 1;
    if (ch === '}') {
      depth -= 1;
      if (depth === 0) return i;
    }
  }
  return -1;
}

function walk(node, cb) {
  if (!node || typeof node !== 'object') return;
  if (Array.isArray(node)) {
    node.forEach((item) => walk(item, cb));
    return;
  }
  for (const [key, value] of Object.entries(node)) {
    cb(key, value);
    walk(value, cb);
  }
}

function textFrom(obj) {
  if (!obj) return '';
  if (typeof obj === 'string') return obj;
  if (obj.simpleText) return obj.simpleText;
  if (Array.isArray(obj.runs)) return obj.runs.map((r) => r.text || '').join('').trim();
  if (obj.accessibility?.accessibilityData?.label) return obj.accessibility.accessibilityData.label;
  return '';
}

function bestThumb(thumbnail) {
  const list = thumbnail?.thumbnails;
  if (!Array.isArray(list) || list.length === 0) return '';
  return [...list].sort((a, b) => (b.width || 0) - (a.width || 0))[0]?.url || '';
}

function parseDuration(text) {
  if (!text || !/^\d+(?::\d+)+$/.test(text.trim())) return 0;
  return text.trim().split(':').map(Number).reduce((acc, n) => acc * 60 + n, 0);
}
