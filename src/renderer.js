/* global YT */
const STORAGE_KEY = 'yt-deck-player-state-v12';
const LEGACY_STORAGE_KEYS = ['yt-deck-player-state-v11', 'yt-deck-player-state-v10', 'yt-deck-player-state-v9', 'yt-deck-player-state-v8', 'yt-deck-player-state-v7', 'yt-deck-player-state-v6', 'yt-deck-player-state-v5', 'yt-deck-player-state-v4', 'yt-deck-player-state-v3', 'yt-deck-player-state-v2', 'yt-deck-player-state-v1'];
const MODES = ['off', 'bag', 'chaos'];
const SPEED_MIN = 0.25;
const SPEED_MAX = 2;
const SPEED_STEP = 0.1;
const LANG_ORDER = ['ko', 'en'];
// THEME_ORDER is derived from THEMES (see "Theme system" section below); 'adaptive' is appended last.

const I18N = {
  ko: {
    emptyTitle: '유튜브 링크나 칩을 올려 음악 덱을 구성하세요',
    emptySub: '브라우저에서 영상/플레이리스트를 끌어오거나 링크 버튼으로 저장할 수 있습니다',
    addLink: '링크 추가',
    addLinkCompact: '추가',
    refreshAll: '목록 갱신',
    refreshAllCompact: '갱신',
    onBoard: '온보드',
    library: '라이브러리',
    dropToOnBoard: '지금 들을 칩을 여기로 끌어오세요',
    dropToLibrary: '저장할 유튜브 링크를 여기에 놓으세요',
    addPlaylistTitle: '링크 추가',
    nameLabel: '표시 이름',
    namePlaceholder: '예: 전투 BGM / 던전 / 빗소리',
    urlLabel: 'YouTube 플레이리스트 또는 영상 링크',
    urlPlaceholder: 'https://www.youtube.com/playlist?list=... 또는 영상 링크',
    addHelp: '링크를 저장하면 곡 목록까지 자동으로 불러옵니다. 온보드에 직접 드롭한 링크는 이번 실행에서만 유지됩니다.',
    cancel: '취소',
    submit: '저장하고 불러오기',
    invalidUrl: '유효한 YouTube 링크를 넣어주세요.',
    importAllTitle: '곡 목록 갱신',
    importAllHelp: '저장된 공개 플레이리스트의 원본 곡 목록을 다시 불러옵니다. 수동으로 추가한 영상은 유지됩니다.',
    close: '닫기',
    importAll: '전체 갱신',
    toggleOnBoard: '온보드에 올리기/내리기',
    rename: '이름 바꾸기',
    renameTitle: '칩 이름 바꾸기',
    newNameLabel: '새 이름',
    save: '저장',
    alreadyOnBoard: '이미 온보드에 올라가 있습니다.',
    removedFromOnBoard: '온보드에서 내렸습니다.',
    nothingToDrop: '처리할 수 없는 드롭입니다.',
    refresh: '곡 목록 다시 불러오기',
    delete: '라이브러리에서 삭제',
    noPlaylistDrop: '플레이리스트 칩에는 다른 플레이리스트를 넣을 수 없습니다.',
    videoAdded: '영상이 칩에 추가되었습니다.',
    groupCreated: '영상 그룹 칩을 만들었습니다.',
    tempChip: '임시 칩',
    sessionOnly: '이번 실행만 유지',
    savedChip: '저장됨',
    prev: '이전',
    play: '재생',
    pause: '일시정지',
    next: '다음',
    shuffleOff: '셔플 끔',
    shuffleBag: '셔플 백',
    shuffleChaos: '완전 무작위',
    loop: '반복',
    reserveSpace: '공간 예약',
    reserveSpaceTitle: '다른 창이 이 덱 영역을 침범하지 않게 합니다',
    controlSettings: '컨트롤 설정',
    knobTitle: '진행바 핸들',
    knobImage: '핸들 이미지',
    chooseImage: '이미지 선택',
    currentDefault: '현재: 기본 핸들',
    currentCustom: '현재: 커스텀 이미지',
    knobPreview: '크기 미리보기',
    knobSize: '핸들 크기',
    knobHelp: 'PNG/GIF/WebP/JPG를 사용할 수 있고, 크기를 조절하면 진행바와 미리보기에 바로 반영됩니다.',
    reset: '초기화',
    speedDown: '배속 낮추기',
    speedUp: '배속 높이기',
    customThemeTitle: '커스텀 테마',
    ctName: '테마 이름',
    ctBg0: '배경1',
    ctBg1: '배경2',
    ctAccent: '강조1',
    ctAccent2: '강조2',
    ctText: '글자',
    ctBgImage: '배경 이미지',
    ctNoImage: '이미지 없음',
    ctBgMode: '표시 방식',
    ctBgModeNone: '사용 안 함',
    ctBgModeCover: '이미지 채우기',
    ctBgModePattern: '패턴 반복',
    ctPatternSize: '패턴 크기',
    ctOpacity: '이미지 불투명도',
    ctSaved: '저장된 커스텀 테마',
    ctSavedHelp: '저장한 테마는 테마 버튼 순환에 포함됩니다.',
    ctApply: '적용',
    ctDelete: '삭제',
    ctSave: '테마 저장',
    ctUpdate: '현재 테마 수정',
    ctSaveAsNew: '새 테마로 저장',
    ctEmpty: '저장된 커스텀 테마가 없습니다.',
    ctRightClickHint: '우클릭: 커스텀 테마 편집',
  },
  en: {
    emptyTitle: 'Build your YouTube audio deck with links or chips',
    emptySub: 'Drag videos/playlists from YouTube, or save them with the link button',
    addLink: 'Add link',
    addLinkCompact: 'Add',
    refreshAll: 'Refresh',
    refreshAllCompact: 'Sync',
    onBoard: 'On board',
    library: 'Library',
    dropToOnBoard: 'Drop chips here to play them now',
    dropToLibrary: 'Drop YouTube links here to keep them as chips',
    addPlaylistTitle: 'Add link',
    nameLabel: 'Display name',
    namePlaceholder: 'Battle BGM / Dungeon / Rain loop',
    urlLabel: 'YouTube playlist or video link',
    urlPlaceholder: 'https://www.youtube.com/playlist?list=... or video link',
    addHelp: 'Saved links auto-load their track list. Links dropped directly onto On Board are temporary for this session.',
    cancel: 'Cancel',
    submit: 'Save and load',
    invalidUrl: 'Please enter a valid YouTube link.',
    importAllTitle: 'Refresh track lists',
    importAllHelp: 'Refreshes original YouTube playlist tracks. Videos you manually added to chips are preserved.',
    close: 'Close',
    importAll: 'Refresh all',
    toggleOnBoard: 'Toggle on board',
    rename: 'Rename',
    renameTitle: 'Rename chip',
    newNameLabel: 'New name',
    save: 'Save',
    alreadyOnBoard: 'Already on board.',
    removedFromOnBoard: 'Removed from On Board.',
    nothingToDrop: 'Nothing to drop here.',
    refresh: 'Reload tracks',
    delete: 'Remove from library',
    noPlaylistDrop: 'Playlist chips cannot be dropped onto another playlist chip.',
    videoAdded: 'Video added to chip.',
    groupCreated: 'Created a grouped video chip.',
    tempChip: 'Temporary chip',
    sessionOnly: 'Session only',
    savedChip: 'Saved',
    prev: 'Prev',
    play: 'Play',
    pause: 'Pause',
    next: 'Next',
    shuffleOff: 'Shuffle off',
    shuffleBag: 'Shuffle bag',
    shuffleChaos: 'Chaos',
    loop: 'Loop',
    reserveSpace: 'Reserve space',
    reserveSpaceTitle: 'Keep other maximized windows out of this deck area',
    controlSettings: 'Control settings',
    knobTitle: 'Progress handle',
    knobImage: 'Handle image',
    chooseImage: 'Choose image',
    currentDefault: 'Current: default handle',
    currentCustom: 'Current: custom image',
    knobPreview: 'Size preview',
    knobSize: 'Handle size',
    knobHelp: 'PNG/GIF/WebP/JPG are supported. Size changes update both the progress bar and preview immediately.',
    reset: 'Reset',
    speedDown: 'Slow down',
    speedUp: 'Speed up',
    customThemeTitle: 'Custom theme',
    ctName: 'Theme name',
    ctBg0: 'Background 1',
    ctBg1: 'Background 2',
    ctAccent: 'Accent 1',
    ctAccent2: 'Accent 2',
    ctText: 'Text',
    ctBgImage: 'Background image',
    ctNoImage: 'No image',
    ctBgMode: 'Display mode',
    ctBgModeNone: 'Off',
    ctBgModeCover: 'Fill image',
    ctBgModePattern: 'Repeat as pattern',
    ctPatternSize: 'Pattern size',
    ctOpacity: 'Image opacity',
    ctSaved: 'Saved custom themes',
    ctSavedHelp: 'Saved themes join the theme button cycle.',
    ctApply: 'Apply',
    ctDelete: 'Delete',
    ctSave: 'Save theme',
    ctUpdate: 'Update this theme',
    ctSaveAsNew: 'Save as new',
    ctEmpty: 'No saved custom themes yet.',
    ctRightClickHint: 'Right-click: edit custom theme',
  },
};

/* =========================================================================
 * Theme system
 * -------------------------------------------------------------------------
 * To add a theme:
 *   1. Add one entry to THEMES below. Required keys:
 *        name, bg0, bg1, panel, panel2, text, muted, accent, accent2
 *      Optional keys:
 *        good, light (true for bright themes -> body.light-theme fixes),
 *        line, art / artOpacity / artSize / artPosition (overlay image)
 *   2. Optionally add a `body[data-theme="<key>"]` block in styles.css
 *      (see the per-theme sections near the end of that file).
 *   3. Run `npm run check` to validate the registry.
 * THEME_ORDER (the cycle order of the theme button) is derived from the
 * insertion order of THEMES, with 'adaptive' appended automatically.
 * ========================================================================= */
const THEMES = {
  aurora: { name: 'Aurora Carbon', bg0: '#07090f', bg1: '#10141f', panel: 'rgba(19,24,37,.92)', panel2: 'rgba(12,15,25,.95)', text: '#edf3ff', muted: '#8f9bb3', accent: '#7bdcff', accent2: '#b28cff', good: '#7bffb3' },
  nord: { name: 'Nord Studio', bg0: '#1f2430', bg1: '#2e3440', panel: 'rgba(46,52,64,.94)', panel2: 'rgba(33,38,50,.96)', text: '#eceff4', muted: '#a7b1c2', accent: '#88c0d0', accent2: '#a3be8c', good: '#8fbcbb' },
  dracula: { name: 'Dracula Neon', bg0: '#15161f', bg1: '#282a36', panel: 'rgba(40,42,54,.94)', panel2: 'rgba(22,23,31,.96)', text: '#f8f8f2', muted: '#b6b6c8', accent: '#bd93f9', accent2: '#ff79c6', good: '#50fa7b' },
  solarized: { name: 'Solar Amber', bg0: '#001f27', bg1: '#002b36', panel: 'rgba(0,43,54,.94)', panel2: 'rgba(0,31,39,.96)', text: '#eee8d5', muted: '#93a1a1', accent: '#b58900', accent2: '#cb4b16', good: '#859900' },
  rosepine: { name: 'Rosé Pine', bg0: '#111019', bg1: '#191724', panel: 'rgba(31,29,46,.94)', panel2: 'rgba(25,23,36,.96)', text: '#e0def4', muted: '#908caa', accent: '#ebbcba', accent2: '#c4a7e7', good: '#9ccfd8' },
  catlatte: { name: 'Catppuccin Latte', light: true, bg0: '#eff1f5', bg1: '#e6e9ef', panel: 'rgba(220,224,232,.96)', panel2: 'rgba(239,241,245,.98)', text: '#4c4f69', muted: '#6c6f85', accent: '#1e66f5', accent2: '#8839ef', good: '#40a02b' },
  nordsnow: { name: 'Nord Snow', light: true, bg0: '#eceff4', bg1: '#e5e9f0', panel: 'rgba(216,222,233,.96)', panel2: 'rgba(236,239,244,.98)', text: '#2e3440', muted: '#5f6b7a', accent: '#5e81ac', accent2: '#88c0d0', good: '#a3be8c' },
  lemontart: { name: 'Lemon Tart', light: true, bg0: '#fff8d7', bg1: '#fff0ad', panel: 'rgba(255,250,224,.97)', panel2: 'rgba(255,246,198,.98)', text: '#342a05', muted: '#7a6928', accent: '#f2c94c', accent2: '#27ae60', good: '#219653' },
  lightleaf: { name: 'Light Leaf', light: true, bg0: '#f1f8ef', bg1: '#e0f0da', panel: 'rgba(246,251,244,.97)', panel2: 'rgba(225,239,220,.98)', text: '#19351f', muted: '#58705a', accent: '#57a773', accent2: '#8fcf9f', good: '#2f855a' },
  whitepink: { name: 'Blush Gallery', light: true, bg0: '#fff7fb', bg1: '#ffe8f1', panel: 'rgba(255,250,252,.97)', panel2: 'rgba(255,239,246,.98)', text: '#37202a', muted: '#805b68', accent: '#f3a6bf', accent2: '#c95f83', good: '#7bbf9e' },
  kucrimson: { name: 'KU Crimson White', bg0: '#fffafa', bg1: '#f6edf0', panel: 'rgba(255,255,255,.985)', panel2: 'rgba(250,244,246,.99)', text: '#2a1518', muted: '#72535a', accent: '#7a001f', accent2: '#9b263c', good: '#2f7d58', light: true },
  moonlitfamiliar: { name: 'Moonlit Familiar', bg0: '#0a1538', bg1: '#13255f', panel: 'rgba(10,18,49,.88)', panel2: 'rgba(8,14,37,.93)', text: '#fff7c9', muted: '#d7cd90', accent: '#f5e56f', accent2: '#ffb347', good: '#f7ef8b', art: 'assets/moonlit-familiar.png', artOpacity: 0.16, artSize: 'auto 82%', artPosition: 'left center', line: 'rgba(245,229,111,0.28)' },
  ribboncandy: { name: 'Ribbon Candy', light: true, bg0: '#ffeef7', bg1: '#ffdbe9', panel: 'rgba(255,249,252,.90)', panel2: 'rgba(255,242,248,.94)', text: '#7a3e72', muted: '#aa74a3', accent: '#d55ac7', accent2: '#7cc8ff', good: '#ffd36f', art: 'assets/ribbon-candy.png', artOpacity: 0.18, artSize: 'auto 86%', artPosition: 'left center', line: 'rgba(213,90,199,0.20)' },
  crayonnight: { name: 'Crayon Pastel Night', bg0: '#131c44', bg1: '#1e2c63', panel: 'rgba(23,33,76,.90)', panel2: 'rgba(15,23,58,.94)', text: '#fdf3c0', muted: '#bfb98d', accent: '#f7dc5c', accent2: '#ff9d5c', good: '#ffe98a', art: 'assets/crayon-night.svg', artOpacity: 0.34, artSize: 'auto 80%', artPosition: 'left center', line: 'rgba(247,220,92,0.30)' },
  crayonbloom: { name: 'Crayon Pastel Bloom', light: true, bg0: '#ffeef4', bg1: '#ffdfe9', panel: 'rgba(255,251,253,.92)', panel2: 'rgba(255,244,249,.95)', text: '#69375d', muted: '#9c6a8e', accent: '#f06fa8', accent2: '#7cc3ea', good: '#e8b64c', art: 'assets/crayon-bloom.svg', artOpacity: 0.30, artSize: 'auto 82%', artPosition: 'left center', line: 'rgba(240,111,168,0.24)' },
  crayoncotton: { name: 'Crayon Pastel Cotton', light: true, bg0: '#fdf7ec', bg1: '#f1ecfd', panel: 'rgba(255,253,248,.93)', panel2: 'rgba(250,245,255,.95)', text: '#41406b', muted: '#807ea3', accent: '#8a8fe0', accent2: '#f592b8', good: '#f2c94c', art: 'assets/crayon-cotton.svg', artOpacity: 0.32, artSize: 'auto 82%', artPosition: 'left center', line: 'rgba(138,143,224,0.26)' },
  cutiefur: { name: 'Cutie Fur', light: true, bg0: '#fdf3e7', bg1: '#f7e3cd', panel: 'rgba(255,251,244,.93)', panel2: 'rgba(252,243,231,.95)', text: '#5b3a26', muted: '#97714f', accent: '#d98d55', accent2: '#f0a3b0', good: '#8fbf74', line: 'rgba(217,141,85,0.26)' },
  glass: { name: 'Glass', bg0: '#0d141d', bg1: '#182534', panel: 'rgba(150,182,216,.13)', panel2: 'rgba(120,150,185,.10)', text: '#eef5fc', muted: '#9fb4c8', accent: '#9fd8ff', accent2: '#c9b7ff', good: '#9fffd8', line: 'rgba(214,235,255,0.22)' },
  robot: { name: 'Robot', bg0: '#0b0e12', bg1: '#141a21', panel: 'rgba(24,31,39,.94)', panel2: 'rgba(15,20,26,.96)', text: '#d9f3e8', muted: '#7e948d', accent: '#39e6a3', accent2: '#ff8a3d', good: '#a7f26a', line: 'rgba(57,230,163,0.24)' },
};
const THEME_ORDER = [...Object.keys(THEMES), 'adaptive'];

let player = null;
let ready = false;
let draggingPlaylistId = null;
let draggingSource = null;
let contextPlaylistId = null;
let progressTimer = null;
let progressRaf = null;
let progressRewindRaf = null;
let isRewindingProgress = false;
let isScrubbingProgress = false;
let scrubPointerId = null;
let scrubPreview = { time: 0, duration: 0, lastSeekAt: 0 };
let suppressProgressClickUntil = 0;
let lastProgressSample = { time: 0, duration: 0, sampledAt: 0, state: -1 };
let smoothProgress = { time: 0, duration: 0, lastFrameAt: 0, playing: false, rate: 1, correction: 0, correctionUntil: 0 };
let subtitleRestoreTimer = null;
let clockTimer = null;
let queueBag = [];
let historyStack = [];
let currentItem = null;
let sequentialIndex = -1;
let pinEnabled = true;
let originForPlayer = window.location.origin;
let activeOnBoard = [];
let onboardDirty = false;
let badItemKeys = new Set();
let autoSkipCount = 0;
let lastAutoSkipAt = 0;
let persistentSaveTimer = null;
let lastAppliedAdaptiveKey = '';
let gracefulClosing = false;


const defaultState = {
  library: [],
  onBoard: [],
  playback: {
    shuffleMode: 'off',
    loop: true,
    volume: 72,
    playbackRate: 1,
    bassBoost: 0,
  },
  settings: {
    apiKey: '',
    opacity: 0.96,
    skipBadVideos: true,
    themeMode: 'aurora',
    language: 'ko',
    reserveSpace: true,
    progressKnobImage: '',
    progressKnobSize: 1,
    customThemes: [],
  },
};

let state = loadState();
activeOnBoard = [...state.onBoard];

const $ = (sel) => document.querySelector(sel);
const els = {
  app: $('#app'),
  statusText: $('#statusText'),
  deckClock: $('#deckClock'),
  previewFallback: $('#previewFallback'),
  trackTitle: $('#trackTitle'),
  trackSub: $('#trackSub'),
  currentTime: $('#currentTime'),
  durationTime: $('#durationTime'),
  progressWrap: $('#progressWrap'),
  progressFill: $('#progressFill'),
  progressKnob: $('#progressKnob'),
  prevBtn: $('#prevBtn'),
  playBtn: $('#playBtn'),
  nextBtn: $('#nextBtn'),
  shuffleBtn: $('#shuffleBtn'),
  loopBtn: $('#loopBtn'),
  speedDownBtn: $('#speedDownBtn'),
  speedUpBtn: $('#speedUpBtn'),
  speedLabel: $('#speedLabel'),
  volumeSlider: $('#volumeSlider'),
  opacitySlider: $('#opacitySlider'),
  poolCount: $('#poolCount'),
  onBoardZone: $('#onBoardZone'),
  onBoardChips: $('#onBoardChips'),
  libraryZone: $('#libraryZone'),
  libraryChips: $('#libraryChips'),
  addBtn: $('#addBtn'),
  apiBtn: $('#apiBtn'),
  contextMenu: $('#contextMenu'),
  modal: $('#modal'),
  modalTitle: $('#modalTitle'),
  modalBody: $('#modalBody'),
  modalClose: $('#modalClose'),
  dockBtn: $('#dockBtn'),
  reserveBtn: $('#reserveBtn'),
  pinBtn: $('#pinBtn'),
  minBtn: $('#minBtn'),
  closeBtn: $('#closeBtn'),
  themeBtn: $('#themeBtn'),
  controlSettingsBtn: $('#controlSettingsBtn'),
  knobBtn: $('#knobBtn'),
  bassBtn: $('#bassBtn'),
  langBtn: $('#langBtn'),
};

window.onYouTubeIframeAPIReady = async () => {
  try {
    originForPlayer = await window.deckAPI?.getOrigin?.() || window.location.origin;
  } catch {
    originForPlayer = window.location.origin;
  }
  player = new YT.Player('player', {
    height: '100%',
    width: '100%',
    host: 'https://www.youtube.com',
    playerVars: {
      autoplay: 0,
      enablejsapi: 1,
      controls: 0,
      rel: 0,
      modestbranding: 1,
      playsinline: 1,
      iv_load_policy: 3,
      disablekb: 1,
      origin: originForPlayer,
      widget_referrer: 'https://www.youtube.com/',
    },
    events: {
      onReady: onPlayerReady,
      onStateChange: onPlayerStateChange,
      onError: onPlayerError,
    },
  });
};

function onPlayerReady() {
  ready = true;
  player.setVolume(state.playback.volume);
  applyPlaybackRate();
  setStatus('READY');
  els.previewFallback.classList.add('hidden');
  startProgressTimer();
}

function onPlayerStateChange(event) {
  if (event.data === YT.PlayerState.PLAYING) {
    updatePlayButtonLabel(true);
    applyPlaybackRate();
    setStatus(onboardDirty ? 'PENDING' : 'PLAY');
  }
  if (event.data === YT.PlayerState.PAUSED) {
    updatePlayButtonLabel(false);
    setStatus(onboardDirty ? 'PENDING' : 'PAUSE');
  }
  if (event.data === YT.PlayerState.ENDED) {
    handleNaturalEnd();
  }
}

function onPlayerError(event) {
  const code = event?.data;
  setStatus(`SKIP ${code}`);
  if (currentItem) {
    badItemKeys.add(itemKey(currentItem));
    queueBag = queueBag.filter((item) => !badItemKeys.has(itemKey(item)));
    if (state.playback.shuffleMode === 'off') sequentialIndex = Math.max(-1, sequentialIndex - 1);
  }
  const msg = code === 153
    ? 'Error 153: YouTube embed 식별/출처 오류. 해당 항목은 건너뛴다.'
    : code === 101 || code === 150
      ? '임베드 재생이 막힌 영상. skip-list에 넣고 다음 곡으로 이동한다.'
      : '재생할 수 없는 영상. skip-list에 넣고 다음 곡으로 이동한다.';
  setSubtitle(msg);
  handlePlaybackErrorSkip();
}

function loadState() {
  try {
    let raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      for (const key of LEGACY_STORAGE_KEYS) {
        raw = localStorage.getItem(key);
        if (raw) break;
      }
    }
    if (!raw) return structuredClone(defaultState);
    const parsed = JSON.parse(raw);
    return mergeState(parsed);
  } catch {
    return structuredClone(defaultState);
  }
}

function stateForPersistence() {
  const persistentLibrary = state.library.filter((p) => !p.volatile);
  const persistentIds = new Set(persistentLibrary.map((p) => p.id));
  return {
    ...state,
    library: persistentLibrary,
    onBoard: state.onBoard.filter((id) => persistentIds.has(id)),
  };
}

function saveState() {
  const payload = JSON.stringify(stateForPersistence());
  // Custom theme background images (data URLs) can exceed the localStorage
  // quota; the Documents JSON file is the durable store, so a quota failure
  // here must not break the app.
  try { localStorage.setItem(STORAGE_KEY, payload); } catch (err) { console.warn('localStorage save skipped:', err.message || err); }
  schedulePersistentSave();
}

function schedulePersistentSave() {
  if (!window.deckAPI?.savePersistentState) return;
  clearTimeout(persistentSaveTimer);
  persistentSaveTimer = window.setTimeout(() => {
    window.deckAPI.savePersistentState({
      schemaVersion: 24,
      app: 'YTDeckPlayer',
      savedAt: new Date().toISOString(),
      ...stateForPersistence(),
    }).catch((err) => console.warn('Persistent save failed:', err));
  }, 250);
}

function lang() { return state.settings.language === 'en' ? 'en' : 'ko'; }
function t(key) { return I18N[lang()]?.[key] || I18N.ko[key] || key; }

function linkIconSvg() {
  return '<svg class="link-icon" viewBox="0 -960 960 960" aria-hidden="true"><path d="M440-280H280q-83 0-141.5-58.5T80-480q0-83 58.5-141.5T280-680h160v80H280q-50 0-85 35t-35 85q0 50 35 85t85 35h160v80ZM320-440v-80h320v80H320Zm200 160v-80h160q50 0 85-35t35-85q0-50-35-85t-85-35H520v-80h160q83 0 141.5 58.5T880-480q0 83-58.5 141.5T680-280H520Z"></path></svg>';
}

function refreshIconSvg() {
  return '<svg class="refresh-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M17.65 6.35A7.95 7.95 0 0 0 12 4a8 8 0 1 0 7.75 10h-2.1A6 6 0 1 1 12 6c1.66 0 3.14.69 4.22 1.78L13 11h8V3z"></path></svg>';
}

function applyLanguage() {
  document.documentElement.lang = lang() === 'en' ? 'en' : 'ko';
  document.querySelectorAll('[data-i18n]').forEach((node) => {
    if (node === els.trackTitle && currentItem) return;
    node.textContent = t(node.dataset.i18n);
  });
  if (currentItem) setTrackTitleText(composeTrackTitle(currentItem));
  if (els.addBtn) {
    els.addBtn.innerHTML = `${linkIconSvg()}<span>${t(window.innerWidth < 700 ? 'addLinkCompact' : 'addLink')}</span>`;
    els.addBtn.title = lang() === 'en' ? 'Save a YouTube link as a chip' : '유튜브 링크를 칩으로 저장';
  }
  if (els.apiBtn) {
    els.apiBtn.innerHTML = `${refreshIconSvg()}<span>${t(window.innerWidth < 700 ? 'refreshAllCompact' : 'refreshAll')}</span>`;
    els.apiBtn.title = lang() === 'en' ? 'Refresh track lists for saved playlist chips' : '저장된 플레이리스트의 곡 목록 다시 불러오기';
  }
  if (els.langBtn) {
    els.langBtn.textContent = lang() === 'ko' ? '한/EN' : 'EN/한';
    els.langBtn.classList.toggle('active', lang() === 'en');
  }
  if (els.reserveBtn) {
    els.reserveBtn.title = t('reserveSpaceTitle');
  }
  const menuMap = { toggleOnBoard: 'toggleOnBoard', rename: 'rename', refresh: 'refresh', delete: 'delete' };
  Object.entries(menuMap).forEach(([action, key]) => {
    const btn = els.contextMenu?.querySelector(`[data-menu="${action}"]`);
    if (btn) btn.textContent = t(key);
  });
}

function cycleLanguage() {
  state.settings.language = lang() === 'ko' ? 'en' : 'ko';
  applyLanguage();
  updateClock();
  render();
}

function iconSvg(kind) {
  const paths = {
    prev: '<path d="M6 5h2.2v14H6V5Zm4.2 7L18 18.4V5.6L10.2 12Z"/>',
    next: '<path d="M15.8 5H18v14h-2.2V5ZM6 18.4l7.8-6.4L6 5.6v12.8Z"/>',
    play: '<path d="M8 5v14l11-7L8 5Z"/>',
    pause: '<path d="M7 5h4v14H7V5Zm6 0h4v14h-4V5Z"/>',
    speedDown: '<path d="M6.3 12 14 5.2v13.6L6.3 12Zm8.2 0L22 5.2v13.6L14.5 12Z"/>',
    speedUp: '<path d="M2 5.2 9.5 12 2 18.8V5.2Zm8 0 7.7 6.8-7.7 6.8V5.2Z"/>',
    shuffle: '<path d="M17.6 4.4 21 7.8l-3.4 3.4V8.9h-1.35c-1.65 0-2.58.64-3.55 2.42l-1.12 2.05C10.25 15.8 8.7 17 6.1 17H3v-2h3.1c1.65 0 2.58-.64 3.55-2.42l1.12-2.05C12.1 8.1 13.65 6.9 16.25 6.9h1.35V4.4ZM3 7h3.1c1.1 0 2.02.2 2.8.62l-1.1 1.82C7.34 9.14 6.8 9 6.1 9H3V7Zm11.92 7.55c.42.3.87.45 1.33.45h1.35v-2.3L21 16.1l-3.4 3.4V17h-1.35c-1.14 0-2.12-.28-2.98-.86l1.65-1.6Z"/>',
    loop: '<path d="M7 7h8.2l-2-2H16l3.5 3.5L16 12h-2.8l2-2H7a4 4 0 0 0 0 8h2v2H7A6 6 0 0 1 7 7Zm10 10H8.8l2 2H8l-3.5-3.5L8 12h2.8l-2 2H17a4 4 0 0 0 0-8h-2V4h2a6 6 0 0 1 0 12Z"/>',
    theme: '<path d="M12 3a9 9 0 0 0 0 18h.6c1.04 0 1.62-1.18 1-2l-.18-.24c-.48-.64-.02-1.56.78-1.56H16a5 5 0 0 0 5-5A9 9 0 0 0 12 3Zm-4.3 9.2a1.35 1.35 0 1 1 0-2.7 1.35 1.35 0 0 1 0 2.7Zm3.1-3.9a1.35 1.35 0 1 1 0-2.7 1.35 1.35 0 0 1 0 2.7Zm3.9.1a1.35 1.35 0 1 1 0-2.7 1.35 1.35 0 0 1 0 2.7Zm2.8 3.9a1.35 1.35 0 1 1 0-2.7 1.35 1.35 0 0 1 0 2.7Z"/>',
    pin: '<path d="m14.1 3 6.9 6.9-2.1 2.1-1.4-1.4-3.9 3.9.5 3.2-1.6 1.6-3.7-3.7L4.4 20 3 18.6l4.4-4.4-3.7-3.7 1.6-1.6 3.2.5 3.9-3.9L11 4.1 14.1 3Z"/>',
  };
  const cls = kind === 'shuffle' || kind === 'loop' ? 'mode-icon' : 'control-icon';
  return `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true">${paths[kind] || ''}</svg>`;
}

function updatePlayButtonLabel(forcePlaying = null) {
  const playing = forcePlaying ?? (ready && player?.getPlayerState?.() === YT.PlayerState.PLAYING);
  els.playBtn.innerHTML = iconSvg(playing ? 'pause' : 'play');
  els.playBtn.title = playing ? t('pause') : t('play');
}

async function hydratePersistentState() {
  try {
    const fileState = await window.deckAPI?.loadPersistentState?.();
    if (fileState && Array.isArray(fileState.library)) {
      state = mergeState(fileState);
      activeOnBoard = [...state.onBoard];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      return;
    }
  } catch (err) {
    console.warn('Persistent load failed:', err);
  }
  // No Documents state yet: migrate legacy localStorage into the Documents file on first save.
  state = mergeState(state);
  activeOnBoard = [...state.onBoard];
  schedulePersistentSave();
}

function mergeState(parsed) {
  return {
    ...structuredClone(defaultState),
    ...parsed,
    playback: { ...defaultState.playback, ...(parsed.playback || {}) },
    settings: { ...defaultState.settings, ...(parsed.settings || {}) },
  };
}

function uid(prefix = 'pl') {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function parseYouTubeUrl(raw) {
  const urlText = (raw || '').trim();
  if (!urlText) return null;

  try {
    const url = new URL(urlText);
    const list = url.searchParams.get('list');
    const videoId = url.searchParams.get('v');

    if (list) return { type: 'playlist', playlistId: list, videoId, url: urlText };

    if (url.hostname.includes('youtu.be')) {
      const id = url.pathname.split('/').filter(Boolean)[0];
      if (id) return { type: 'video', videoId: id, url: urlText };
    }

    if (url.hostname.includes('youtube.com') && videoId) {
      return { type: 'video', videoId, url: urlText };
    }
  } catch {
    // fall through
  }

  const maybeList = urlText.match(/[?&]list=([^&]+)/)?.[1] || (urlText.startsWith('PL') ? urlText : null);
  if (maybeList) return { type: 'playlist', playlistId: maybeList, url: urlText };

  const maybeVideo = urlText.match(/^[a-zA-Z0-9_-]{11}$/)?.[0];
  if (maybeVideo) return { type: 'video', videoId: maybeVideo, url: urlText };

  return null;
}


function canonicalUrlForParsed(parsed) {
  if (!parsed) return '';
  if (parsed.type === 'playlist' && parsed.playlistId) return `https://www.youtube.com/playlist?list=${encodeURIComponent(parsed.playlistId)}`;
  if (parsed.type === 'video' && parsed.videoId) return `https://www.youtube.com/watch?v=${encodeURIComponent(parsed.videoId)}`;
  return parsed.url || '';
}

function videoTrackFromParsed(parsed, name = '') {
  if (!parsed?.videoId) return null;
  return {
    videoId: parsed.videoId,
    title: name || `YouTube video ${parsed.videoId}`,
    channel: 'YouTube',
    duration: 0,
    thumbnail: thumbnailForVideo(parsed.videoId),
    addedAt: new Date().toISOString(),
  };
}

function createPlaylistObjectFromParsed(parsed, opts = {}) {
  const isPlaylist = parsed.type === 'playlist';
  const name = opts.name || defaultNameFor(parsed);
  return {
    id: uid(opts.volatile ? 'temp' : 'chip'),
    name,
    url: canonicalUrlForParsed(parsed) || parsed.url,
    type: isPlaylist ? 'playlist' : 'video',
    playlistId: parsed.playlistId || null,
    videoId: parsed.videoId || null,
    thumb: thumbnailForVideo(parsed.videoId),
    // sourceTracks = tracks imported from the original YouTube playlist.
    // manualTracks = videos the user explicitly drops onto this chip.
    // tracks = merged playback view used by the queue/UI.
    sourceTracks: isPlaylist ? [] : [],
    manualTracks: [],
    tracks: isPlaylist ? [] : [],
    volatile: Boolean(opts.volatile),
    group: false,
    importMethod: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function extractUrlFromDataTransfer(dt) {
  if (!dt) return '';
  const uriList = dt.getData('text/uri-list') || '';
  const plain = dt.getData('text/plain') || '';
  const html = dt.getData('text/html') || '';
  const candidates = [];
  if (uriList) candidates.push(...uriList.split(/\r?\n/).filter((line) => line && !line.startsWith('#')));
  if (plain) candidates.push(plain);
  if (html) {
    const hrefs = [...html.matchAll(/href=["']([^"']+)["']/gi)].map((m) => m[1]);
    candidates.push(...hrefs);
  }
  for (const value of candidates) {
    const match = String(value).match(/https?:\/\/[^\s"'<>]+/);
    if (match && parseYouTubeUrl(match[0])) return match[0];
    if (parseYouTubeUrl(value.trim())) return value.trim();
  }
  return '';
}

function getDropPayload(e) {
  const idText = e.dataTransfer.getData('text/plain') || draggingPlaylistId || '';
  const source = e.dataTransfer.getData('application/x-yt-deck-source') || draggingSource || '';
  if (source && getPlaylist(idText)) return { kind: 'chip', id: idText, source };
  if (getPlaylist(idText)) return { kind: 'chip', id: idText, source };
  const url = extractUrlFromDataTransfer(e.dataTransfer);
  const parsed = parseYouTubeUrl(url);
  if (parsed) return { kind: 'url', url, parsed };
  return { kind: 'unknown', raw: idText };
}

function formatTime(seconds) {
  const s = Math.max(0, Math.floor(Number(seconds) || 0));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  return `${m}:${String(sec).padStart(2, '0')}`;
}

function setStatus(text) {
  els.statusText.textContent = text;
}

function currentSubtitleText() {
  return currentItem?.channel || '';
}

function restoreSubtitleToCurrent() {
  if (currentItem) els.trackSub.textContent = currentSubtitleText();
}

function setSubtitle(text, options = {}) {
  if (subtitleRestoreTimer) {
    clearTimeout(subtitleRestoreTimer);
    subtitleRestoreTimer = null;
  }
  els.trackSub.textContent = text || '';
  const isSticky = options.sticky === true;
  const shouldRestore = !isSticky && currentItem && (text || '') !== currentSubtitleText();
  if (shouldRestore) {
    subtitleRestoreTimer = window.setTimeout(() => {
      subtitleRestoreTimer = null;
      restoreSubtitleToCurrent();
      setTrackTitleText(composeTrackTitle(currentItem));
    }, options.duration || 2700);
  }
}

function getPlaylist(id) {
  return state.library.find((p) => p.id === id);
}

function thumbnailForVideo(videoId) {
  return videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : '';
}

function playlistThumb(playlist) {
  return playlist.thumb
    || playlist.thumbnail
    || playlist.tracks?.find((track) => track.thumbnail)?.thumbnail
    || thumbnailForVideo(playlist.videoId)
    || thumbnailForVideo(playlist.tracks?.find((track) => track.videoId)?.videoId)
    || '';
}

function buildPoolForIds(ids, options = {}) {
  const pool = [];
  const includeBad = Boolean(options.includeBad);
  ids.forEach((id) => {
    const playlist = getPlaylist(id);
    if (!playlist) return;

    if (Array.isArray(playlist.tracks) && playlist.tracks.length > 0) {
      playlist.tracks.forEach((track, index) => {
        const item = {
          type: 'track',
          playlistId: playlist.id,
          playlistName: playlist.name,
          videoId: track.videoId,
          title: track.title || `Track ${index + 1}`,
          channel: track.channel || playlist.name,
          duration: track.duration || 0,
          thumbnail: track.thumbnail || playlistThumb(playlist),
        };
        if (includeBad || !badItemKeys.has(itemKey(item))) pool.push(item);
      });
      return;
    }

    if (playlist.type === 'video' && playlist.videoId) {
      const item = {
        type: 'track',
        playlistId: playlist.id,
        playlistName: playlist.name,
        videoId: playlist.videoId,
        title: playlist.name,
        channel: 'Single video',
        duration: 0,
        thumbnail: playlistThumb(playlist),
      };
      if (includeBad || !badItemKeys.has(itemKey(item))) pool.push(item);
      return;
    }

    // Playlist chips must be imported into explicit track lists before they can join
    // the app-level unified queue. Raw YouTube playlist fallback caused NEXT/PREV and
    // shuffle to restart from the first item, so v0.5 keeps it out of the queue.
  });
  return pool;
}

function buildActivePool() {
  return buildPoolForIds(activeOnBoard.length ? activeOnBoard : state.onBoard);
}

function buildVisiblePool() {
  return buildPoolForIds(state.onBoard, { includeBad: true });
}

function activeTrackCount(ids = state.onBoard) {
  return buildPoolForIds(ids, { includeBad: true }).reduce((count, item) => count + (item.type === 'playlistFallback' ? 0 : 1), 0);
}

function render() {
  normalizeState();
  renderOnBoard();
  renderLibrary();
  applyLanguage();
  updateControls();
  updateLayoutClass();
  applyThemeForCurrentItem(false);
  saveState();
}

function normalizeState() {
  const validIds = new Set(state.library.map((p) => p.id));
  state.onBoard = [...new Set(state.onBoard)].filter((id) => validIds.has(id));
  activeOnBoard = [...new Set(activeOnBoard)].filter((id) => validIds.has(id));
  if (activeOnBoard.length === 0 && state.onBoard.length > 0 && !currentItem) activeOnBoard = [...state.onBoard];
  state.library.forEach(normalizePlaylistTrackBuckets);
  state.playback.playbackRate = clampSpeed(state.playback.playbackRate || 1);
  cleanupDetachedVolatileChips(false);
}

function cleanupDetachedVolatileChips(shouldRender = true) {
  const before = state.library.length;
  const onBoardSet = new Set(state.onBoard);
  state.library = state.library.filter((p) => !p.volatile || onBoardSet.has(p.id));
  if (state.library.length !== before) {
    activeOnBoard = activeOnBoard.filter((id) => getPlaylist(id));
    if (shouldRender) render();
  }
}

function isChipOnBoard(id) {
  return state.onBoard.includes(id);
}

function renderOnBoard() {
  els.onBoardChips.innerHTML = '';
  const pool = buildVisiblePool();
  const totalTracks = activeTrackCount(state.onBoard);
  const importNeededCount = state.onBoard
    .map(getPlaylist)
    .filter((p) => p && p.type === 'playlist' && (!Array.isArray(p.tracks) || p.tracks.length === 0)).length;
  const baseCountText = importNeededCount > 0
    ? `${totalTracks} tracks • ${importNeededCount} import needed`
    : `${totalTracks} tracks`;
  els.poolCount.textContent = onboardDirty ? `${baseCountText} • next` : baseCountText;

  if (state.onBoard.length === 0) {
    els.onBoardChips.appendChild(emptyNote(t('dropToOnBoard')));
    return;
  }

  state.onBoard.forEach((id) => {
    const playlist = getPlaylist(id);
    if (!playlist) return;
    els.onBoardChips.appendChild(createChip(playlist, { onboard: true }));
  });
}

function renderLibrary() {
  els.libraryChips.innerHTML = '';
  const visibleLibrary = state.library.filter((p) => !p.volatile);
  if (visibleLibrary.length === 0) {
    els.libraryChips.appendChild(emptyNote(t('dropToLibrary')));
    return;
  }
  visibleLibrary.forEach((playlist) => {
    els.libraryChips.appendChild(createChip(playlist, { onboard: state.onBoard.includes(playlist.id), library: true }));
  });
}

function emptyNote(text) {
  const div = document.createElement('div');
  div.className = 'empty-note';
  div.textContent = text;
  return div;
}

function createChip(playlist, opts = {}) {
  const chip = document.createElement('div');
  chip.className = `chip ${opts.onboard ? 'onboard' : ''}`;
  chip.draggable = true;
  chip.dataset.id = playlist.id;
  chip.dataset.source = opts.onboard ? 'onboard' : 'library';
  chip.title = playlist.url || playlist.name;

  const quality = playlist.importPartial ? 'PARTIAL' : playlist.importComplete ? 'FULL' : '';
  const trackText = playlist.tracks?.length
    ? `${playlist.tracks.length} tracks${quality ? ` • ${quality}` : ''}`
    : playlist.type === 'video'
      ? (playlist.volatile ? t('sessionOnly') : 'single video')
      : playlist.importError ? 'import failed' : 'import needed';

  const thumb = playlistThumb(playlist);
  chip.innerHTML = `
    ${thumb ? `<div class="chip-thumb" style="background-image:url('${escapeAttr(thumb)}')"></div>` : '<div class="chip-thumb"></div>'}
    <div class="chip-body">
      <div class="chip-title">${escapeHtml(playlist.name)}</div>
      <div class="chip-sub">${escapeHtml(trackText)}</div>
    </div>
  `;

  if (opts.onboard) {
    const x = document.createElement('div');
    x.className = 'chip-x';
    x.textContent = 'X';
    x.title = '온보드에서 내리기';
    x.addEventListener('click', (e) => {
      e.stopPropagation();
      removeFromOnBoard(playlist.id);
    });
    chip.appendChild(x);
  }

  chip.addEventListener('dragstart', (e) => {
    draggingPlaylistId = playlist.id;
    draggingSource = opts.onboard ? 'onboard' : 'library';
    e.dataTransfer.effectAllowed = 'copyMove';
    e.dataTransfer.setData('text/plain', playlist.id);
    e.dataTransfer.setData('application/x-yt-deck-source', draggingSource);
  });
  chip.addEventListener('dragenter', (e) => {
    e.preventDefault();
    chip.classList.add('chip-drag-over');
  });
  chip.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  });
  chip.addEventListener('dragleave', (e) => {
    if (!chip.contains(e.relatedTarget)) chip.classList.remove('chip-drag-over');
  });
  chip.addEventListener('drop', async (e) => {
    e.preventDefault();
    e.stopPropagation();
    chip.classList.remove('chip-drag-over');
    const payload = getDropPayload(e);
    await handleDropOnChip(playlist.id, payload);
  });
  chip.addEventListener('dragend', () => {
    draggingPlaylistId = null;
    draggingSource = null;
    els.onBoardZone.classList.remove('drag-over');
    els.libraryZone.classList.remove('drag-over');
  });
  chip.addEventListener('dblclick', () => toggleOnBoard(playlist.id));
  chip.addEventListener('contextmenu', (e) => openContextMenu(e, playlist.id));

  return chip;
}

function escapeHtml(str) {
  return String(str || '').replace(/[&<>'"]/g, (ch) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;'
  }[ch]));
}

function escapeAttr(str) {
  return String(str || '').replace(/[\\'"()]/g, '');
}

function playbackHasLoadedItem() {
  return Boolean(currentItem) && ready && player && typeof player.getPlayerState === 'function';
}

function commitOnBoardChanges(reason = 'commit') {
  activeOnBoard = [...state.onBoard];
  onboardDirty = false;
  queueBag = [];
  sequentialIndex = -1;
  autoSkipCount = 0;
  setStatus(reason === 'manual' ? 'SYNC' : 'READY');
}

function markOnBoardChanged() {
  if (playbackHasLoadedItem()) {
    onboardDirty = true;
    setStatus('PENDING');
    setSubtitle('ON BOARD 변경됨. 현재 곡이 끝나면 새 덱 큐를 적용한다. NEXT를 누르면 즉시 적용한다.');
  } else {
    commitOnBoardChanges('instant');
  }
  render();
}

function addToOnBoard(id) {
  if (!getPlaylist(id)) return;
  if (state.onBoard.includes(id)) {
    setSubtitle(t('alreadyOnBoard'));
    return;
  }
  state.onBoard.push(id);
  markOnBoardChanged();
}

function removeFromOnBoard(id, options = {}) {
  const wasOnBoard = state.onBoard.includes(id);
  state.onBoard = state.onBoard.filter((x) => x !== id);
  // Temporary chips dropped directly onto On Board should disappear when they are taken off the board.
  const chip = getPlaylist(id);
  if (chip?.volatile) state.library = state.library.filter((p) => p.id !== id);
  activeOnBoard = activeOnBoard.filter((x) => getPlaylist(x));
  if (wasOnBoard || chip?.volatile) {
    setSubtitle(t('removedFromOnBoard'));
    markOnBoardChanged();
  } else if (!options.silent) {
    render();
  }
}

function toggleOnBoard(id) {
  if (state.onBoard.includes(id)) removeFromOnBoard(id);
  else addToOnBoard(id);
}



function isVideoChip(playlist) {
  return Boolean(playlist) && (playlist.type === 'video' || (playlist.group && Array.isArray(playlist.tracks)));
}

function isPlaylistLikeChip(playlist) {
  return Boolean(playlist) && playlist.type === 'playlist' && !playlist.group;
}

function firstVideoTrackForChip(playlist) {
  if (!playlist) return null;
  if (playlist.type === 'video' && playlist.videoId) {
    return {
      videoId: playlist.videoId,
      title: playlist.name || playlist.videoId,
      channel: 'YouTube',
      duration: 0,
      thumbnail: playlistThumb(playlist),
    };
  }
  if (playlist.group && Array.isArray(playlist.tracks) && playlist.tracks[0]) return playlist.tracks[0];
  return null;
}

function allVideoTracksForChip(playlist) {
  if (!playlist) return [];
  if (playlist.group && Array.isArray(playlist.tracks)) return playlist.tracks;
  const one = firstVideoTrackForChip(playlist);
  return one ? [one] : [];
}

async function createChipFromUrl(url, opts = {}) {
  const parsed = parseYouTubeUrl(url);
  if (!parsed) throw new Error('invalid-url');
  const playlist = createPlaylistObjectFromParsed(parsed, opts);
  state.library.push(playlist);
  if (opts.onBoard) state.onBoard.push(playlist.id);
  render();
  if (playlist.type === 'playlist') await importPlaylistTracksNoKey(playlist.id, { silentFail: true });
  else if (opts.onBoard) markOnBoardChanged();
  else render();
  return playlist;
}


function trackKey(track) {
  return track?.videoId ? String(track.videoId) : '';
}

function dedupeTracks(tracks = []) {
  const seen = new Set();
  const result = [];
  for (const track of tracks || []) {
    const key = trackKey(track);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    result.push(track);
  }
  return result;
}

function isManualTrack(track) {
  return Boolean(track && (track.source === 'manual' || track.manual === true || track.userAdded === true || track.addedBy === 'user'));
}

function inferManualTracksFromLegacy(playlist) {
  const explicit = Array.isArray(playlist.manualTracks) ? playlist.manualTracks : [];
  if (explicit.length) return dedupeTracks(explicit.map((track) => ({ ...track, source: 'manual' })));
  // Backward compatibility: v18 and older stored dropped videos in `tracks` only.
  // Imported YouTube playlist tracks normally have no `addedAt`, while manually
  // dropped videos were created with `addedAt`. Preserve those across refreshes.
  const legacyManual = (playlist.tracks || []).filter((track) => track?.addedAt && !track.importedAt);
  return dedupeTracks(legacyManual.map((track) => ({ ...track, source: 'manual' })));
}

function mergeSourceAndManualTracks(sourceTracks = [], manualTracks = []) {
  return dedupeTracks([
    ...(sourceTracks || []).map((track) => ({ ...track, source: track.source || 'youtube' })),
    ...(manualTracks || []).map((track) => ({ ...track, source: 'manual' })),
  ]);
}

function normalizePlaylistTrackBuckets(playlist) {
  if (!playlist || playlist.type !== 'playlist') return;
  const manual = inferManualTracksFromLegacy(playlist);
  const manualIds = new Set(manual.map(trackKey));
  const source = Array.isArray(playlist.sourceTracks)
    ? playlist.sourceTracks
    : (playlist.tracks || []).filter((track) => trackKey(track) && !manualIds.has(trackKey(track)) && !isManualTrack(track));
  playlist.manualTracks = manual;
  playlist.sourceTracks = dedupeTracks(source.map((track) => ({ ...track, source: track.source || 'youtube' })));
  playlist.tracks = mergeSourceAndManualTracks(playlist.sourceTracks, playlist.manualTracks);
}

function addVideoTrackToPlaylist(target, track) {
  if (!target || !track?.videoId) return false;
  if (isPlaylistLikeChip(target) || target.group) {
    normalizePlaylistTrackBuckets(target);
    const manualTrack = {
      ...track,
      source: 'manual',
      addedAt: track.addedAt || new Date().toISOString(),
    };
    target.manualTracks = Array.isArray(target.manualTracks) ? target.manualTracks : [];
    if (target.manualTracks.some((x) => x.videoId === manualTrack.videoId)) return false;
    target.manualTracks.push(manualTrack);
    target.manualTracks = dedupeTracks(target.manualTracks);
    target.sourceTracks = Array.isArray(target.sourceTracks) ? target.sourceTracks : [];
    target.tracks = mergeSourceAndManualTracks(target.sourceTracks, target.manualTracks);
    target.group = target.group || false;
    target.updatedAt = new Date().toISOString();
    target.thumb = target.thumb || track.thumbnail || thumbnailForVideo(track.videoId);
    if (state.onBoard.includes(target.id) || activeOnBoard.includes(target.id)) markOnBoardChanged();
    else render();
    setStatus('ADDED');
    const countText = `${target.manualTracks.length} manual`;
    setSubtitle(`${t('videoAdded')} (${countText})`);
    return true;
  }
  return false;
}

function createGroupVideoChip(target, sourceTracks, opts = {}) {
  const targetTracks = allVideoTracksForChip(target);
  const tracks = [...targetTracks, ...sourceTracks].filter((x) => x?.videoId);
  const seen = new Set();
  const unique = tracks.filter((track) => {
    if (seen.has(track.videoId)) return false;
    seen.add(track.videoId);
    return true;
  });
  if (unique.length < 2) return null;
  const group = {
    id: uid(opts.volatile || target?.volatile ? 'tempgrp' : 'group'),
    name: `${target?.name || 'Video'} + ${unique[1]?.title || 'Video'}`.slice(0, 64),
    url: '',
    type: 'playlist',
    playlistId: null,
    videoId: unique[0].videoId,
    thumb: unique[0].thumbnail || thumbnailForVideo(unique[0].videoId),
    sourceTracks: unique,
    manualTracks: unique.map((track) => ({ ...track, source: 'manual' })),
    tracks: unique.map((track) => ({ ...track, source: 'manual' })),
    group: true,
    volatile: Boolean(opts.volatile || target?.volatile),
    importMethod: 'manual-group',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  state.library.push(group);
  if (opts.onBoard || state.onBoard.includes(target.id)) state.onBoard.push(group.id);
  setStatus('GROUP');
  setSubtitle(t('groupCreated'));
  markOnBoardChanged();
  return group;
}

function sourceTracksFromPayload(payload) {
  if (payload.kind === 'url') {
    if (payload.parsed.type === 'video') {
      const track = videoTrackFromParsed(payload.parsed);
      return track ? { type: 'video', tracks: [track] } : { type: 'none', tracks: [] };
    }
    return { type: 'playlist', tracks: [], playlistId: payload.parsed.playlistId };
  }
  if (payload.kind === 'chip') {
    const source = getPlaylist(payload.id);
    if (!source) return { type: 'none', tracks: [] };
    if (isPlaylistLikeChip(source)) return { type: 'playlist', tracks: [], playlistId: source.playlistId };
    return { type: 'video', tracks: allVideoTracksForChip(source) };
  }
  return { type: 'none', tracks: [] };
}

async function handleDropOnChip(targetId, payload) {
  const target = getPlaylist(targetId);
  if (!target || !payload || payload.kind === 'unknown') {
    setSubtitle(t('nothingToDrop'));
    return;
  }

  // Dragging an On Board chip onto itself, or onto its library twin, means
  // "take it off the board". This catches self-drops and accidental duplicate drops.
  if (payload.kind === 'chip' && payload.id === targetId) {
    if (payload.source === 'onboard' || isChipOnBoard(payload.id)) {
      removeFromOnBoard(payload.id);
      return;
    }
    setSubtitle(t('nothingToDrop'));
    return;
  }

  const source = sourceTracksFromPayload(payload);

  if (isPlaylistLikeChip(target)) {
    if (source.type === 'playlist') {
      setStatus('BLOCK');
      setSubtitle(t('noPlaylistDrop'));
      return;
    }
    if (source.tracks.length) {
      addVideoTrackToPlaylist(target, source.tracks[0]);
      return;
    }
    setSubtitle(t('nothingToDrop'));
    return;
  }

  if (target.type === 'video' || target.group) {
    if (source.type === 'playlist') {
      setStatus('BLOCK');
      setSubtitle(t('noPlaylistDrop'));
      return;
    }
    if (source.tracks.length) {
      createGroupVideoChip(target, source.tracks, { onBoard: state.onBoard.includes(target.id) });
      return;
    }
  }

  setSubtitle(t('nothingToDrop'));
}

async function handleLibraryDropPayload(payload) {
  if (!payload || payload.kind === 'unknown') {
    setSubtitle(t('nothingToDrop'));
    return;
  }
  if (payload.kind === 'chip') {
    // Dropping any On Board chip back toward Library means deselect it, not duplicate it.
    if (payload.source === 'onboard' || state.onBoard.includes(payload.id)) removeFromOnBoard(payload.id);
    else setSubtitle(t('nothingToDrop'));
    return;
  }
  if (payload.kind === 'url') {
    await createChipFromUrl(payload.url, { volatile: false, onBoard: false });
  }
}

async function handleOnBoardDropPayload(payload) {
  if (!payload || payload.kind === 'unknown') {
    setSubtitle(t('nothingToDrop'));
    return;
  }
  if (payload.kind === 'chip') {
    addToOnBoard(payload.id);
    return;
  }
  if (payload.kind === 'url') {
    await createChipFromUrl(payload.url, { volatile: true, onBoard: true, name: `${t('tempChip')} ${state.library.filter((p) => p.volatile).length + 1}` });
  }
}

function updateControls() {
  els.volumeSlider.value = state.playback.volume;
  els.opacitySlider.value = Math.round((state.settings.opacity || 1) * 100);
  els.speedLabel.textContent = `${formatRate(state.playback.playbackRate || 1)}x`;
  if (els.speedDownBtn) { els.speedDownBtn.innerHTML = iconSvg('speedDown'); els.speedDownBtn.title = t('speedDown'); }
  if (els.speedUpBtn) { els.speedUpBtn.innerHTML = iconSvg('speedUp'); els.speedUpBtn.title = t('speedUp'); }
  els.prevBtn.innerHTML = iconSvg('prev');
  els.nextBtn.innerHTML = iconSvg('next');
  els.prevBtn.title = t('prev');
  els.nextBtn.title = t('next');
  updatePlayButtonLabel();
  updateBassButton();
  applyProgressKnobSettings();
  els.loopBtn.innerHTML = `${iconSvg('loop')}<span>${t('loop')}</span>`;
  els.loopBtn.classList.toggle('active', state.playback.loop);
  const label = state.playback.shuffleMode === 'off' ? t('shuffleOff')
    : state.playback.shuffleMode === 'bag' ? t('shuffleBag')
      : t('shuffleChaos');
  els.shuffleBtn.innerHTML = `${iconSvg('shuffle')}<span>${label}</span>`;
  els.shuffleBtn.classList.toggle('active', state.playback.shuffleMode !== 'off');
  if (els.knobBtn) els.knobBtn.title = t('knobTitle');
  if (els.themeBtn) {
    const mode = state.settings.themeMode || 'aurora';
    const themeName = themeDisplayName(mode);
    const shortName = themeName.replace(/\s+/g, '').slice(0, 9);
    els.themeBtn.innerHTML = `${iconSvg('theme')}<span>Theme:${escapeHtml(shortName)}</span>`;
    els.themeBtn.title = `Theme: ${themeName} — ${t('ctRightClickHint')}`;
    els.themeBtn.classList.toggle('active', mode === 'adaptive');
  }
  if (els.pinBtn) {
    els.pinBtn.innerHTML = `${iconSvg('pin')}<span>PIN</span>`;
    els.pinBtn.classList.toggle('active', pinEnabled);
  }
}

function cycleTheme() {
  const order = themeCycleOrder();
  const current = order.indexOf(state.settings.themeMode || 'aurora');
  state.settings.themeMode = order[(current + 1) % order.length];
  lastAppliedAdaptiveKey = '';
  applyThemeForCurrentItem(true);
  updateControls();
  saveState();
  setStatus(state.settings.themeMode === 'adaptive' ? 'ADAPT' : 'THEME');
  setSubtitle(`Theme: ${themeDisplayName(state.settings.themeMode)}`);
}

function applyStaticTheme(theme) {
  const root = document.documentElement;
  document.body.dataset.theme = state.settings.themeMode || 'aurora';
  document.body.classList.toggle('light-theme', !!theme.light);
  root.style.setProperty('--bg0', theme.bg0);
  root.style.setProperty('--bg1', theme.bg1);
  root.style.setProperty('--panel', theme.panel);
  root.style.setProperty('--panel2', theme.panel2);
  root.style.setProperty('--text', theme.text);
  root.style.setProperty('--muted', theme.muted);
  root.style.setProperty('--accent', theme.accent);
  root.style.setProperty('--accent2', theme.accent2);
  root.style.setProperty('--good', theme.good || theme.accent);
  root.style.setProperty('--line', theme.line || 'rgba(142, 166, 214, 0.18)');
  root.style.setProperty('--theme-art', theme.art ? `url("${theme.art}")` : 'none');
  root.style.setProperty('--theme-art-opacity', String(theme.artOpacity ?? 0));
  root.style.setProperty('--theme-art-size', theme.artSize || 'auto 76%');
  root.style.setProperty('--theme-art-position', theme.artPosition || 'left center');
  document.body.classList.toggle('art-theme', !!theme.art);
  // Custom theme background image layer (full image or repeating pattern)
  const custom = theme.custom;
  const bgImage = custom?.bgImage && custom?.bgMode !== 'none' ? custom.bgImage : '';
  root.style.setProperty('--custom-bg-image', bgImage ? `url("${bgImage}")` : 'none');
  root.style.setProperty('--custom-bg-size', custom?.bgMode === 'pattern' ? `${Math.max(40, Number(custom.patternSize) || 180)}px auto` : 'cover');
  root.style.setProperty('--custom-bg-repeat', custom?.bgMode === 'pattern' ? 'repeat' : 'no-repeat');
  root.style.setProperty('--custom-bg-position', custom?.bgMode === 'pattern' ? 'top left' : 'center center');
  root.style.setProperty('--custom-bg-opacity', String(Math.min(0.9, Math.max(0.08, Number(custom?.bgOpacity) || 0.45))));
  document.body.classList.toggle('custom-bg-theme', !!bgImage);
}

function applyThemeForCurrentItem(force = false) {
  const mode = state.settings.themeMode || 'aurora';
  if (mode !== 'adaptive') {
    const custom = findCustomTheme(mode);
    applyStaticTheme(custom ? buildCustomThemeObject(custom) : (THEMES[mode] || THEMES.aurora));
    return;
  }
  const key = currentItem?.thumbnail || currentItem?.videoId || 'adaptive-empty';
  if (!force && key === lastAppliedAdaptiveKey) return;
  lastAppliedAdaptiveKey = key;
  applyAdaptiveTheme(currentItem).catch(() => applyStaticTheme(THEMES.aurora));
}

async function applyAdaptiveTheme(item) {
  if (!item?.thumbnail) { applyStaticTheme(THEMES.aurora); return; }
  const color = await sampleImageColor(item.thumbnail);
  const accent = rgbToHex(color.r, color.g, color.b);
  const accent2 = rgbToHex(Math.min(255, color.r + 48), Math.min(255, color.g + 32), Math.min(255, color.b + 64));
  const bg0 = rgbToHex(Math.max(0, Math.round(color.r * 0.08)), Math.max(0, Math.round(color.g * 0.08)), Math.max(0, Math.round(color.b * 0.08)));
  const bg1 = rgbToHex(Math.max(8, Math.round(color.r * 0.16)), Math.max(10, Math.round(color.g * 0.16)), Math.max(14, Math.round(color.b * 0.16)));
  applyStaticTheme({ bg0, bg1, panel: 'rgba(18,22,32,.93)', panel2: 'rgba(9,12,20,.96)', text: '#f5f7ff', muted: '#aeb7c8', accent, accent2, good: accent2 });
}

function sampleImageColor(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const size = 28;
        canvas.width = size; canvas.height = size;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        ctx.drawImage(img, 0, 0, size, size);
        const data = ctx.getImageData(0, 0, size, size).data;
        let r = 0, g = 0, b = 0, n = 0;
        for (let i = 0; i < data.length; i += 16) {
          const rr = data[i], gg = data[i+1], bb = data[i+2];
          const max = Math.max(rr, gg, bb), min = Math.min(rr, gg, bb);
          if (max < 32 || max - min < 8) continue;
          r += rr; g += gg; b += bb; n += 1;
        }
        if (!n) return reject(new Error('No sample'));
        resolve({ r: Math.round(r/n), g: Math.round(g/n), b: Math.round(b/n) });
      } catch (err) { reject(err); }
    };
    img.onerror = reject;
    img.src = src;
  });
}

function rgbToHex(r, g, b) {
  return `#${[r,g,b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('')}`;
}

/* =========================================================================
 * Custom theme mode
 * -------------------------------------------------------------------------
 * User-defined themes stack up in state.settings.customThemes and join the
 * theme cycle as `custom:<id>` right before 'adaptive'. Each entry stores
 * five base colors plus an optional background image (cover or repeating
 * pattern, as a data URL); the remaining palette is derived automatically.
 * The editor opens by RIGHT-CLICKING the theme chip in the top bar.
 * ========================================================================= */
function getCustomThemes() {
  if (!Array.isArray(state.settings.customThemes)) state.settings.customThemes = [];
  return state.settings.customThemes;
}

function findCustomTheme(mode) {
  if (typeof mode !== 'string' || !mode.startsWith('custom:')) return null;
  return getCustomThemes().find((def) => `custom:${def.id}` === mode) || null;
}

function themeCycleOrder() {
  return [...Object.keys(THEMES), ...getCustomThemes().map((def) => `custom:${def.id}`), 'adaptive'];
}

function themeDisplayName(mode) {
  if (mode === 'adaptive') return 'Adaptive';
  const custom = findCustomTheme(mode);
  if (custom) return custom.name || 'Custom';
  return THEMES[mode]?.name || mode;
}

function hexToRgbSafe(hex, fallback = { r: 128, g: 128, b: 128 }) {
  const m = /^#?([0-9a-f]{6})$/i.exec(String(hex || '').trim());
  if (!m) return fallback;
  const n = parseInt(m[1], 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function normalizeHex(hex, fallback) {
  const { r, g, b } = hexToRgbSafe(hex, hexToRgbSafe(fallback));
  return rgbToHex(r, g, b);
}

function mixHex(hexA, hexB, ratio) {
  const a = hexToRgbSafe(hexA);
  const b = hexToRgbSafe(hexB);
  const t = Math.min(1, Math.max(0, ratio));
  return rgbToHex(a.r + (b.r - a.r) * t, a.g + (b.g - a.g) * t, a.b + (b.b - a.b) * t);
}

function rgbaFromHex(hex, alpha) {
  const { r, g, b } = hexToRgbSafe(hex);
  return `rgba(${r},${g},${b},${alpha})`;
}

function isLightColor(hex) {
  const { r, g, b } = hexToRgbSafe(hex);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 150;
}

function buildCustomThemeObject(def) {
  const light = isLightColor(def.bg0);
  const towards = light ? '#ffffff' : '#000000';
  return {
    name: def.name || 'Custom',
    light,
    bg0: normalizeHex(def.bg0, '#10141f'),
    bg1: normalizeHex(def.bg1, '#1a2233'),
    panel: rgbaFromHex(mixHex(def.bg1, towards, 0.22), 0.92),
    panel2: rgbaFromHex(mixHex(def.bg0, towards, 0.16), 0.95),
    text: normalizeHex(def.text, light ? '#232338' : '#eef2ff'),
    muted: mixHex(def.text, def.bg1, 0.42),
    accent: normalizeHex(def.accent, '#7bdcff'),
    accent2: normalizeHex(def.accent2, '#b28cff'),
    good: normalizeHex(def.accent2, '#7bffb3'),
    line: rgbaFromHex(def.accent, 0.24),
    custom: def,
  };
}

// Downscale large picks so the persisted JSON stays reasonable.
function readImageAsThemeDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('read failed'));
    reader.onload = () => {
      const raw = String(reader.result || '');
      const img = new Image();
      img.onerror = () => resolve(raw);
      img.onload = () => {
        const maxSide = 1280;
        const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
        if (scale >= 1 && raw.length < 900_000) return resolve(raw);
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/webp', 0.88));
      };
      img.src = raw;
    };
    reader.readAsDataURL(file);
  });
}

function customThemeFlow() {
  const activeMode = state.settings.themeMode || 'aurora';
  const editing = findCustomTheme(activeMode);
  const base = editing ? buildCustomThemeObject(editing) : (THEMES[activeMode] || THEMES.aurora);
  const draft = {
    id: editing?.id || uid('ct'),
    name: editing?.name || '',
    bg0: normalizeHex(base.bg0, '#10141f'),
    bg1: normalizeHex(base.bg1, '#1a2233'),
    accent: normalizeHex(base.accent, '#7bdcff'),
    accent2: normalizeHex(base.accent2, '#b28cff'),
    text: normalizeHex(base.text, '#eef2ff'),
    bgImage: editing?.bgImage || '',
    bgMode: editing?.bgMode || 'none',
    patternSize: Number(editing?.patternSize) || 180,
    bgOpacity: Number(editing?.bgOpacity) || 0.45,
  };

  const savedRows = () => getCustomThemes().map((def) => `
    <div class="ct-saved-row" data-ct-id="${escapeAttr(def.id)}">
      <span class="ct-swatch" style="background:linear-gradient(135deg,${escapeAttr(normalizeHex(def.bg1, '#1a2233'))},${escapeAttr(normalizeHex(def.accent, '#7bdcff'))})"></span>
      <span class="ct-saved-name">${escapeHtml(def.name || 'Custom')}</span>
      <button class="mini-action ct-apply" type="button">${t('ctApply')}</button>
      <button class="mini-action ct-delete" type="button">${t('ctDelete')}</button>
    </div>`).join('') || `<div class="ct-empty">${t('ctEmpty')}</div>`;

  const colorField = (key, label) => `
    <label class="ct-color">${label}<input type="color" data-ct-color="${key}" value="${draft[key]}" /></label>`;

  showModal(t('customThemeTitle'), `
    <div class="settings-form theme-form">
      <section class="settings-field">
        <div class="field-copy"><strong>${t('ctName')}</strong></div>
        <input id="ctName" class="text-input" maxlength="24" placeholder="My Theme" value="${escapeAttr(draft.name)}" />
        <div class="ct-color-grid">
          ${colorField('bg0', t('ctBg0'))}
          ${colorField('bg1', t('ctBg1'))}
          ${colorField('accent', t('ctAccent'))}
          ${colorField('accent2', t('ctAccent2'))}
          ${colorField('text', t('ctText'))}
        </div>
      </section>

      <section class="settings-field">
        <div class="field-copy">
          <strong>${t('ctBgImage')}</strong>
          <span id="ctImageLabel">${draft.bgImage ? t('currentCustom') : t('ctNoImage')}</span>
        </div>
        <input id="ctImageFile" class="hidden-file-input" type="file" accept="image/png,image/jpeg,image/webp,image/gif" />
        <button id="ctImagePick" class="file-pick-btn" type="button">${t('chooseImage')}</button>
        <div class="ct-bg-controls">
          <label>${t('ctBgMode')}
            <select id="ctBgMode" class="text-input ct-select">
              <option value="none"${draft.bgMode === 'none' ? ' selected' : ''}>${t('ctBgModeNone')}</option>
              <option value="cover"${draft.bgMode === 'cover' ? ' selected' : ''}>${t('ctBgModeCover')}</option>
              <option value="pattern"${draft.bgMode === 'pattern' ? ' selected' : ''}>${t('ctBgModePattern')}</option>
            </select>
          </label>
          <label>${t('ctPatternSize')} <b id="ctPatternValue">${draft.patternSize}px</b>
            <input id="ctPatternSize" type="range" min="60" max="420" step="10" value="${draft.patternSize}" />
          </label>
          <label>${t('ctOpacity')} <b id="ctOpacityValue">${Math.round(draft.bgOpacity * 100)}%</b>
            <input id="ctOpacity" type="range" min="10" max="90" step="5" value="${Math.round(draft.bgOpacity * 100)}" />
          </label>
        </div>
      </section>

      <section class="settings-field ct-saved-field">
        <div class="field-copy"><strong>${t('ctSaved')}</strong><span>${t('ctSavedHelp')}</span></div>
        <div id="ctSavedList" class="ct-saved-list">${savedRows()}</div>
      </section>

      <div class="form-actions settings-actions">
        <button id="ctSave" class="primary-action" type="button">${editing ? t('ctUpdate') : t('ctSave')}</button>
        <button id="ctSaveNew" class="ghost-action" type="button"${editing ? '' : ' style="display:none"'}>${t('ctSaveAsNew')}</button>
        <button id="ctClose" class="ghost-action" type="button">${t('close')}</button>
      </div>
    </div>
  `, { focus: '#ctName' });

  const previewDraft = () => applyStaticTheme(buildCustomThemeObject(draft));
  previewDraft();

  document.querySelectorAll('[data-ct-color]').forEach((input) => {
    input.addEventListener('input', () => {
      draft[input.dataset.ctColor] = input.value;
      previewDraft();
    });
  });
  $('#ctName')?.addEventListener('input', () => { draft.name = $('#ctName').value; });
  $('#ctImagePick')?.addEventListener('click', () => $('#ctImageFile')?.click());
  $('#ctImageFile')?.addEventListener('change', async () => {
    const file = $('#ctImageFile').files?.[0];
    if (!file) return;
    try {
      draft.bgImage = await readImageAsThemeDataUrl(file);
      if (draft.bgMode === 'none') { draft.bgMode = 'cover'; $('#ctBgMode').value = 'cover'; }
      const label = $('#ctImageLabel');
      if (label) label.textContent = t('currentCustom');
      previewDraft();
    } catch {}
  });
  $('#ctBgMode')?.addEventListener('change', () => { draft.bgMode = $('#ctBgMode').value; previewDraft(); });
  $('#ctPatternSize')?.addEventListener('input', () => {
    draft.patternSize = Number($('#ctPatternSize').value);
    const label = $('#ctPatternValue');
    if (label) label.textContent = `${draft.patternSize}px`;
    previewDraft();
  });
  $('#ctOpacity')?.addEventListener('input', () => {
    draft.bgOpacity = Number($('#ctOpacity').value) / 100;
    const label = $('#ctOpacityValue');
    if (label) label.textContent = `${Math.round(draft.bgOpacity * 100)}%`;
    previewDraft();
  });

  const commit = (asNew) => {
    const list = getCustomThemes();
    if (asNew || !editing) draft.id = uid('ct');
    draft.name = (draft.name || '').trim() || `Custom ${list.length + 1}`;
    const entry = { ...draft };
    const existingIdx = list.findIndex((d) => d.id === entry.id);
    if (existingIdx >= 0) list[existingIdx] = entry;
    else list.push(entry);
    state.settings.themeMode = `custom:${entry.id}`;
    lastAppliedAdaptiveKey = '';
    saveState();
    hideModal();
    applyThemeForCurrentItem(true);
    updateControls();
    setStatus('THEME');
    setSubtitle(`Theme: ${entry.name}`);
  };
  $('#ctSave')?.addEventListener('click', () => commit(false));
  $('#ctSaveNew')?.addEventListener('click', () => commit(true));
  $('#ctClose')?.addEventListener('click', () => {
    hideModal();
    applyThemeForCurrentItem(true);
  });

  $('#ctSavedList')?.addEventListener('click', (e) => {
    const row = e.target.closest?.('.ct-saved-row');
    if (!row) return;
    const id = row.dataset.ctId;
    if (e.target.classList.contains('ct-apply')) {
      state.settings.themeMode = `custom:${id}`;
      saveState();
      hideModal();
      applyThemeForCurrentItem(true);
      updateControls();
    } else if (e.target.classList.contains('ct-delete')) {
      state.settings.customThemes = getCustomThemes().filter((d) => d.id !== id);
      if (state.settings.themeMode === `custom:${id}`) state.settings.themeMode = 'aurora';
      saveState();
      const listEl = $('#ctSavedList');
      if (listEl) listEl.innerHTML = savedRows();
      applyThemeForCurrentItem(true);
      updateControls();
    }
  });
}


function formatRate(rate) {
  const value = clampSpeed(rate);
  return value.toFixed(1).replace(/\.0$/, '');
}

function clampSpeed(rate) {
  const value = Number(rate);
  if (!Number.isFinite(value)) return 1;
  const stepped = Math.round(value * 10) / 10;
  return Math.min(SPEED_MAX, Math.max(SPEED_MIN, stepped));
}

function startProgressTimer() {
  if (progressTimer) clearInterval(progressTimer);
  if (progressRaf) cancelAnimationFrame(progressRaf);
  if (progressRewindRaf) cancelAnimationFrame(progressRewindRaf);
  isRewindingProgress = false;
  smoothProgress = {
    time: lastProgressSample.time || 0,
    duration: lastProgressSample.duration || currentItem?.duration || 0,
    lastFrameAt: performance.now(),
    playing: false,
    rate: clampSpeed(state.playback.playbackRate || 1),
    correction: 0,
    correctionUntil: 0,
  };
  sampleProgressNow({ snap: true });
  progressTimer = setInterval(() => sampleProgressNow(), 900);
  progressRaf = requestAnimationFrame(progressFrame);
}

function visualProgressAt(now = performance.now()) {
  if (isScrubbingProgress) return scrubPreview.time || 0;
  let cur = smoothProgress.time || 0;
  const dt = Math.max(0, (now - (smoothProgress.lastFrameAt || now)) / 1000);
  if (smoothProgress.playing) cur += dt * (smoothProgress.rate || 1);
  if (smoothProgress.correctionUntil && now < smoothProgress.correctionUntil) {
    cur += (smoothProgress.correction || 0) * dt;
  }
  const dur = smoothProgress.duration || 0;
  if (dur > 0) cur = Math.min(dur, Math.max(0, cur));
  return cur;
}

function sampleProgressNow(options = {}) {
  if (isScrubbingProgress) return;
  if (!ready || !player || typeof player.getCurrentTime !== 'function') return;
  const now = performance.now();
  try {
    const actual = player.getCurrentTime() || 0;
    const duration = player.getDuration() || currentItem?.duration || 0;
    const stateNow = player.getPlayerState?.() ?? -1;
    const rate = clampSpeed(state.playback.playbackRate || 1);
    const predicted = visualProgressAt(now);
    const diff = actual - predicted;
    const shouldSnap = options.snap || Math.abs(diff) > 2.25 || stateNow !== YT.PlayerState.PLAYING;

    lastProgressSample = { time: actual, duration, sampledAt: now, state: stateNow };
    smoothProgress.duration = duration;
    smoothProgress.playing = stateNow === YT.PlayerState.PLAYING;
    smoothProgress.rate = rate;
    smoothProgress.lastFrameAt = now;

    if (shouldSnap) {
      smoothProgress.time = actual;
      smoothProgress.correction = 0;
      smoothProgress.correctionUntil = 0;
    } else {
      smoothProgress.time = predicted;
      smoothProgress.correction = diff / 0.9;
      smoothProgress.correctionUntil = now + 900;
    }
  } catch {}
}

function paintProgress(cur, dur) {
  els.currentTime.textContent = formatTime(cur);
  els.durationTime.textContent = formatTime(dur);
  const pct = dur > 0 ? Math.min(100, Math.max(0, (cur / dur) * 100)) : 0;
  const frac = pct / 100;
  els.progressFill.style.width = '100%';
  els.progressFill.style.transform = `scaleX(${frac})`;
  const progressWidth = els.progressWrap?.clientWidth || 0;
  const knobX = Math.max(0, Math.min(progressWidth, progressWidth * frac));
  els.progressKnob.style.left = '0px';
  els.progressKnob.style.transform = `translate(${knobX}px, -50%) translateX(-50%)`;
  els.progressKnob.style.setProperty('--knob-pos', `${pct}%`);
}

function progressFrame(now) {
  if (!isRewindingProgress && ready && player && typeof player.getCurrentTime === 'function') {
    const cur = visualProgressAt(now);
    if (!isScrubbingProgress) {
      smoothProgress.time = cur;
      smoothProgress.lastFrameAt = now;
    }
    paintProgress(cur, smoothProgress.duration || lastProgressSample.duration || currentItem?.duration || scrubPreview.duration || 0);
  }
  progressRaf = requestAnimationFrame(progressFrame);
}

function updateProgress() {
  sampleProgressNow({ snap: true });
  paintProgress(smoothProgress.time, smoothProgress.duration);
}

function animateProgressRewindThen(callback) {
  if (progressRewindRaf) cancelAnimationFrame(progressRewindRaf);
  isRewindingProgress = true;
  isScrubbingProgress = false;
  const dur = smoothProgress.duration || lastProgressSample.duration || currentItem?.duration || 0;
  const startCur = dur > 0 ? Math.min(dur, Math.max(smoothProgress.time || dur, dur * 0.96)) : 1;
  const started = performance.now();
  const total = 920;
  // Slower, decelerating rewind: a mild linear/exponential blend that starts gently
  // and converges to zero velocity at the left edge instead of snapping back.
  const remaining = (x) => {
    const u = Math.min(1, Math.max(0, x));
    return Math.pow(1 - u, 2) * (1 + 1.35 * u) * Math.exp(-0.18 * u);
  };
  const step = (now) => {
    const t = Math.min(1, (now - started) / total);
    const cur = startCur * remaining(t);
    paintProgress(cur, dur || startCur);
    if (t < 1) {
      progressRewindRaf = requestAnimationFrame(step);
    } else {
      isRewindingProgress = false;
      smoothProgress.time = 0;
      smoothProgress.lastFrameAt = performance.now();
      paintProgress(0, dur || startCur);
      callback?.();
    }
  };
  progressRewindRaf = requestAnimationFrame(step);
}

function applyPlaybackRate() {
  if (!ready || !player?.setPlaybackRate) return;
  const rate = clampSpeed(state.playback.playbackRate || 1);
  try {
    player.setPlaybackRate(rate);
    // Some YouTube embeds snap unsupported rates to their nearest internal value.
    // We still expose 0.1-step controls because that is the requested UI behavior.
  } catch {
    // Some embedded videos reject speed changes. Keep UI state anyway.
  }
}

function stepSpeed(delta) {
  const current = clampSpeed(state.playback.playbackRate || 1);
  state.playback.playbackRate = clampSpeed(current + (delta * SPEED_STEP));
  updateControls();
  saveState();
  applyPlaybackRate();
}

function updateBassButton() {
  if (!els.bassBtn) return;
  const level = Number(state.playback.bassBoost || 0);
  els.bassBtn.textContent = `BASS ${level}`;
  els.bassBtn.classList.toggle('active', level > 0);
  els.bassBtn.title = level > 0
    ? `Bass Boost ${level}/5 - 현재 YouTube IFrame 엔진에서는 실제 음질 변조가 제한됩니다`
    : 'Bass Boost OFF - 클릭하면 1~5단계로 순환합니다';
}

function cycleBassBoost() {
  const next = (Number(state.playback.bassBoost || 0) + 1) % 6;
  state.playback.bassBoost = next;
  updateBassButton();
  saveState();
  setSubtitle(next
    ? `Bass Boost ${next}/5: 현재 IFrame 재생 방식에서는 실제 저음 증폭 DSP가 제한됩니다.`
    : 'Bass Boost OFF');
}

function applyProgressKnobSettings() {
  if (!els.progressKnob) return;
  const size = Math.min(6, Math.max(1, Number(state.settings.progressKnobSize || 1)));
  els.progressKnob.style.setProperty('--knob-scale', String(size));
  const image = state.settings.progressKnobImage || '';
  els.progressKnob.classList.toggle('custom-image', !!image);
  els.progressKnob.style.backgroundImage = image ? `url(${image})` : '';
}

function updateKnobPreview() {
  const preview = $('#knobPreviewKnob');
  const label = $('#knobSizeValue');
  const current = $('#knobCurrentLabel');
  if (!preview && !label && !current) return;
  const size = Math.min(6, Math.max(1, Number(state.settings.progressKnobSize || 1)));
  if (preview) {
    preview.style.setProperty('--knob-scale', String(size));
    const image = state.settings.progressKnobImage || '';
    preview.classList.toggle('custom-image', !!image);
    preview.style.backgroundImage = image ? `url(${image})` : '';
  }
  if (label) label.textContent = `${size.toFixed(1)}x`;
  if (current) current.textContent = state.settings.progressKnobImage ? t('currentCustom') : t('currentDefault');
}

function progressKnobFlow() {
  showModal(t('controlSettings') || 'Control settings', `
    <div class="settings-form knob-form">
      <section class="settings-field file-field">
        <div class="field-copy">
          <strong>${t('knobImage') || 'Handle image'}</strong>
          <span id="knobCurrentLabel" class="file-status">${state.settings.progressKnobImage ? t('currentCustom') : t('currentDefault')}</span>
        </div>
        <input id="knobFile" class="hidden-file-input" type="file" accept="image/png,image/gif,image/webp,image/jpeg" />
        <button id="knobPickBtn" class="file-pick-btn" type="button">${t('chooseImage') || 'Choose image'}</button>
      </section>

      <section class="settings-field knob-size-field">
        <div class="field-copy">
          <strong>${t('knobSize') || 'Handle size'}</strong>
          <span><b id="knobSizeValue">${(state.settings.progressKnobSize || 1).toFixed(1)}x</b></span>
        </div>
        <input id="knobSize" type="range" min="1" max="6" step="0.1" value="${state.settings.progressKnobSize || 1}" />
      </section>

      <section class="settings-field knob-preview-field">
        <div class="field-copy">
          <strong>${t('knobPreview') || 'Size preview'}</strong>
          <span>${t('knobHelp') || ''}</span>
        </div>
        <div class="knob-preview-box" aria-hidden="true">
          <div class="knob-preview-track">
            <div class="knob-preview-fill"></div>
            <div id="knobPreviewKnob" class="knob-preview-knob"></div>
          </div>
        </div>
      </section>

      <div class="form-actions settings-actions">
        <button id="resetKnob" class="ghost-action" type="button">${t('reset') || 'Reset'}</button>
        <button id="closeKnob" class="primary-action" type="button">${t('close') || 'Close'}</button>
      </div>
    </div>
  `);
  const file = $('#knobFile');
  const pick = $('#knobPickBtn');
  const size = $('#knobSize');
  pick?.addEventListener('click', () => file?.click());
  file?.addEventListener('change', () => {
    const selected = file.files?.[0];
    if (!selected) return;
    const reader = new FileReader();
    reader.onload = () => {
      state.settings.progressKnobImage = String(reader.result || '');
      applyProgressKnobSettings();
      updateKnobPreview();
      saveState();
    };
    reader.readAsDataURL(selected);
  });
  size?.addEventListener('input', () => {
    state.settings.progressKnobSize = Number(size.value);
    applyProgressKnobSettings();
    updateKnobPreview();
    saveState();
  });
  $('#resetKnob')?.addEventListener('click', () => {
    state.settings.progressKnobImage = '';
    state.settings.progressKnobSize = 1;
    if (size) size.value = '1';
    applyProgressKnobSettings();
    updateKnobPreview();
    saveState();
  });
  $('#closeKnob')?.addEventListener('click', hideModal);
  updateKnobPreview();
}

function playOrPause() {
  if (!ready) return;
  const stateCode = player.getPlayerState?.();
  if (stateCode === YT.PlayerState.PLAYING) {
    player.pauseVideo();
  } else {
    if (!currentItem) playNext(true);
    else player.playVideo();
  }
}

function getNextItem(forceStart = false) {
  const pool = buildActivePool();
  if (pool.length === 0) return null;

  if (state.playback.shuffleMode === 'chaos') {
    if (pool.length === 1) return pool[0];
    let pick = null;
    for (let i = 0; i < 12; i += 1) {
      pick = pool[Math.floor(Math.random() * pool.length)];
      if (!currentItem || itemKey(pick) !== itemKey(currentItem)) break;
    }
    return pick;
  }

  if (state.playback.shuffleMode === 'bag') {
    if (queueBag.length === 0 || forceStart) queueBag = shuffle([...pool]);
    if (currentItem && queueBag.length > 1 && itemKey(queueBag[0]) === itemKey(currentItem)) {
      const first = queueBag.shift();
      queueBag.push(first);
    }
    return queueBag.shift();
  }

  if (forceStart || sequentialIndex < 0) {
    sequentialIndex = 0;
  } else {
    sequentialIndex += 1;
  }

  if (sequentialIndex >= pool.length) {
    if (!state.playback.loop) return null;
    sequentialIndex = 0;
  }
  return pool[sequentialIndex];
}

function itemKey(item) {
  if (!item) return '';
  return `${item.type}:${item.videoId || item.youtubePlaylistId || item.playlistId}`;
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

async function playNext(forceStart = false, opts = {}) {
  if (!ready) {
    setStatus('WAIT');
    return;
  }
  if ((opts.manual || forceStart) && onboardDirty) commitOnBoardChanges('manual');
  let next = getNextItem(forceStart || !currentItem);
  if (!next && state.onBoard.some((id) => {
    const p = getPlaylist(id);
    return p && p.type === 'playlist' && (!Array.isArray(p.tracks) || p.tracks.length === 0);
  })) {
    await autoImportOnBoardRawPlaylists();
    if (onboardDirty && !currentItem) commitOnBoardChanges('instant');
    next = getNextItem(forceStart || !currentItem);
  }
  if (!next) {
    const visibleCount = activeTrackCount(activeOnBoard);
    setStatus(visibleCount > 0 ? 'ALL BAD' : 'EMPTY');
    setTrackTitleText('온보드 재생 풀이 비어 있음');
    setSubtitle(visibleCount > 0
      ? '가져온 항목들이 전부 재생 불가로 건너뛰어졌다. NO-KEY 새로고침 또는 다른 칩을 선택해라.'
      : '칩을 ON BOARD에 올려라. 플레이리스트 칩은 IMPORT가 성공해야 통합 셔플 큐에 들어간다.');
    updatePlayButtonLabel(false);
    return;
  }

  if (currentItem && !opts.skipHistory && itemKey(currentItem) !== itemKey(next)) historyStack.push(currentItem);
  playItem(next);
}


function playPrevious() {
  if (!ready) return;
  const prev = historyStack.pop();
  if (prev) playItem(prev, { fromHistory: true });
  else if (player.seekTo) player.seekTo(0, true);
}


function composeTrackTitle(item) {
  if (!item) return '온보드에 플레이리스트 칩을 올려라';
  const chipName = item.playlistName || 'Library';
  const title = item.title || item.videoId || 'Untitled';
  return `${chipName}: ${title}`;
}

function setTrackTitleText(text) {
  const value = text || '';
  els.trackTitle.innerHTML = `<span>${escapeHtml(value)}</span>`;
  window.deckAPI?.setTrayTooltip?.(value);
  els.trackTitle.classList.remove('marquee');
  window.requestAnimationFrame(() => {
    const span = els.trackTitle.querySelector('span');
    if (!span) return;
    const overflow = span.scrollWidth > els.trackTitle.clientWidth + 8;
    els.trackTitle.classList.toggle('marquee', overflow);
    if (overflow) {
      const seconds = Math.min(42, Math.max(14, Math.round(span.scrollWidth / 42)));
      els.trackTitle.style.setProperty('--marquee-duration', `${seconds}s`);
    }
  });
}

function handleNaturalEnd() {
  if (onboardDirty) commitOnBoardChanges('ended');
  animateProgressRewindThen(() => playNext(false, { auto: true }));
}

function handlePlaybackErrorSkip() {
  if (onboardDirty) commitOnBoardChanges('error');
  const now = Date.now();
  if (now - lastAutoSkipAt > 8000) autoSkipCount = 0;
  lastAutoSkipAt = now;
  autoSkipCount += 1;
  if (autoSkipCount > 12) {
    setStatus('HALT');
    setSubtitle('연속으로 재생 불가 항목이 너무 많아 자동 넘김을 멈춤. IMPORT 새로고침 또는 다른 칩을 선택해라.');
    return;
  }
  window.setTimeout(() => playNext(false, { auto: true, skipHistory: true, errorSkip: true }), 750);
}

function playItem(item) {
  if (progressRewindRaf) cancelAnimationFrame(progressRewindRaf);
  isRewindingProgress = false;
  currentItem = item;
  els.previewFallback.classList.add('hidden');
  setTrackTitleText(composeTrackTitle(item));
  setSubtitle(`${item.channel || ''}`.replace(/^ · /, ''), { sticky: true });
  lastProgressSample = { time: 0, duration: item.duration || 0, sampledAt: performance.now(), state: YT.PlayerState.UNSTARTED };
  smoothProgress = { time: 0, duration: item.duration || 0, lastFrameAt: performance.now(), playing: false, rate: clampSpeed(state.playback.playbackRate || 1), correction: 0, correctionUntil: 0 };
  paintProgress(0, item.duration || 0);
  applyThemeForCurrentItem(true);
  setStatus('LOAD');

  if (item.type === 'track') {
    player.loadVideoById({ videoId: item.videoId, startSeconds: 0, suggestedQuality: 'small' });
    window.setTimeout(() => {
      try {
        const st = player.getPlayerState?.();
        if (st === YT.PlayerState.CUED || st === YT.PlayerState.UNSTARTED) player.playVideo?.();
      } catch {}
    }, 650);
  } else {
    setStatus('BAD ITEM');
    handlePlaybackErrorSkip();
  }
  autoSkipCount = 0;
  setTimeout(applyPlaybackRate, 700);
  setTimeout(() => refreshCurrentTitleFromPlayer(), 1200);
}

function refreshCurrentTitleFromPlayer() {
  if (!currentItem || !player?.getVideoData) return;
  try {
    const data = player.getVideoData();
    if (data?.title && (!currentItem.title || currentItem.title === currentItem.videoId || currentItem.title.startsWith('YouTube video'))) {
      currentItem.title = data.title;
      setTrackTitleText(composeTrackTitle(currentItem));
    }
    if (data?.author) {
      currentItem.channel = data.author;
      setSubtitle(data.author, { sticky: true });
    }
  } catch {}
}

function addPlaylistFlow() {
  showModal(t('addPlaylistTitle'), `
    <div class="form-grid add-link-grid add-link-form">
      <label>${t('nameLabel')}
        <input id="addName" class="text-input" placeholder="${escapeAttr(t('namePlaceholder'))}" />
      </label>
      <label class="url-field">${t('urlLabel')}
        <textarea id="addUrl" placeholder="${escapeAttr(t('urlPlaceholder'))}"></textarea>
      </label>
      <p class="help-text">${t('addHelp')}</p>
      <div class="form-actions">
        <button id="cancelAdd" class="ghost-action">${t('cancel')}</button>
        <button id="submitAdd" class="primary-action">${t('submit')}</button>
      </div>
    </div>
  `, { focus: '#addUrl' });
  $('#cancelAdd').addEventListener('click', hideModal);
  $('#submitAdd').addEventListener('click', async () => {
    const name = $('#addName').value.trim();
    const url = $('#addUrl').value.trim();
    const parsed = parseYouTubeUrl(url);
    if (!parsed) {
      alert(t('invalidUrl'));
      return;
    }
    hideModal();
    await createChipFromUrl(url, { name: name || defaultNameFor(parsed), volatile: false, onBoard: false });
  });
}

function defaultNameFor(parsed) {
  if (parsed.type === 'playlist') return lang() === 'en' ? `Playlist ${state.library.length + 1}` : `플레이리스트 ${state.library.length + 1}`;
  return lang() === 'en' ? `Video ${state.library.length + 1}` : `영상 ${state.library.length + 1}`;
}

function apiKeyFlow() {
  const playlistCount = state.library.filter((p) => p.type === 'playlist' && !p.volatile).length;
  if (!playlistCount) {
    setStatus('EMPTY');
    setSubtitle(lang() === 'en' ? 'No saved playlist chips to refresh yet.' : '아직 갱신할 저장 플레이리스트 칩이 없습니다.');
    return;
  }
  refreshAllPlaylists();
}

async function refreshAllPlaylists() {
  setStatus('SYNC');
  setSubtitle(lang() === 'en' ? 'Refreshing saved playlist chips...' : '저장된 플레이리스트 칩의 곡 목록을 갱신하는 중...');
  for (const playlist of state.library) {
    if (playlist.type === 'playlist') {
      await importPlaylistTracksNoKey(playlist.id, { silentFail: false });
    }
  }
}

async function importPlaylistTracksNoKey(id, opts = {}) {
  const playlist = getPlaylist(id);
  if (!playlist || playlist.type !== 'playlist' || playlist.group || !playlist.playlistId) return;
  try {
    normalizePlaylistTrackBuckets(playlist);
    const preservedManualTracks = inferManualTracksFromLegacy(playlist);
    setStatus('IMPORT');
    setSubtitle(`${playlist.name} 트랙 목록 가져오는 중...`);
    const result = await window.deckAPI?.importPlaylistNoKey?.(playlist.playlistId);
    const importedTracks = result?.tracks || [];
    if (!importedTracks.length) throw new Error('0 tracks imported');
    const sourceTracks = dedupeTracks(importedTracks.map((track) => ({ ...track, source: 'youtube' })));
    playlist.sourceTracks = sourceTracks;
    playlist.manualTracks = dedupeTracks(preservedManualTracks.map((track) => ({ ...track, source: 'manual' })));
    playlist.tracks = mergeSourceAndManualTracks(playlist.sourceTracks, playlist.manualTracks);
    playlist.thumb = playlist.thumb || playlist.tracks.find((track) => track.thumbnail)?.thumbnail || '';
    playlist.importMethod = result.method || 'no-key';
    playlist.importPartial = Boolean(result.partial);
    playlist.importComplete = !result.partial;
    playlist.importError = '';
    playlist.updatedAt = new Date().toISOString();
    badItemKeys.clear();
    if (state.onBoard.includes(playlist.id) || activeOnBoard.includes(playlist.id)) markOnBoardChanged();
    else render();
    setStatus(onboardDirty ? 'PENDING' : 'READY');
    const quality = result.partial ? 'PARTIAL' : 'FULL';
    const manualNote = playlist.manualTracks.length ? ` + ${playlist.manualTracks.length} manual` : '';
    setSubtitle(`${playlist.name}: ${sourceTracks.length} tracks imported${manualNote} (${quality}, no user API key)`);
  } catch (err) {
    console.error(err);
    // Do not destroy manually added tracks when online refresh fails.
    normalizePlaylistTrackBuckets(playlist);
    playlist.importError = err.message || String(err);
    playlist.updatedAt = new Date().toISOString();
    render();
    setStatus('RAW');
    const manualNote = playlist.manualTracks?.length ? ` 수동 추가 ${playlist.manualTracks.length}곡은 유지됨.` : '';
    setSubtitle(`${playlist.name}: IMPORT 실패. 기존 곡 목록은 보존됨.${manualNote}`);
    if (!opts.silentFail) setSubtitle(`${playlist.name}: ${lang() === 'en' ? 'track refresh failed; existing/manual tracks preserved' : '곡 목록 갱신 실패, 기존/수동 추가 곡은 유지됨'} (${err.message})`);
  }
}

function showModal(title, bodyHtml, options = {}) {
  els.modalTitle.textContent = title;
  els.modalBody.innerHTML = bodyHtml;
  els.modal.classList.remove('hidden');
  document.body.classList.add('modal-open');
  window.setTimeout(() => {
    const target = options.focus ? document.querySelector(options.focus) : els.modal.querySelector('input, textarea, button');
    target?.focus?.({ preventScroll: true });
  }, 30);
}

function hideModal() {
  els.modal.classList.add('hidden');
  els.modalBody.innerHTML = '';
  document.body.classList.remove('modal-open');
  // Revert any live custom-theme preview back to the persisted theme.
  applyThemeForCurrentItem();
}

function openContextMenu(e, playlistId) {
  e.preventDefault();
  contextPlaylistId = playlistId;
  els.contextMenu.style.left = `${Math.min(e.clientX, window.innerWidth - 170)}px`;
  els.contextMenu.style.top = `${Math.min(e.clientY, window.innerHeight - 130)}px`;
  els.contextMenu.classList.remove('hidden');
}

function hideContextMenu() {
  els.contextMenu.classList.add('hidden');
}

function renamePlaylist(id) {
  const playlist = getPlaylist(id);
  if (!playlist) return;
  showModal(t('renameTitle'), `
    <div class="form-grid rename-grid">
      <label>${t('newNameLabel')}
        <input id="renameInput" class="text-input" value="${escapeAttr(playlist.name)}" />
      </label>
      <div class="form-actions">
        <button id="cancelRename" class="ghost-action">${t('cancel')}</button>
        <button id="submitRename" class="primary-action">${t('save')}</button>
      </div>
    </div>
  `, { focus: '#renameInput' });
  const input = $('#renameInput');
  input?.select?.();
  $('#cancelRename').addEventListener('click', hideModal);
  $('#submitRename').addEventListener('click', () => {
    const name = input.value.trim();
    if (!name) return;
    playlist.name = name;
    playlist.updatedAt = new Date().toISOString();
    hideModal();
    render();
  });
  input?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') $('#submitRename')?.click();
    if (e.key === 'Escape') hideModal();
  });
}

function deletePlaylist(id) {
  const playlist = getPlaylist(id);
  if (!playlist) return;
  if (!confirm(`'${playlist.name}' 칩을 영구 삭제할까?`)) return;
  state.library = state.library.filter((p) => p.id !== id);
  state.onBoard = state.onBoard.filter((x) => x !== id);
  markOnBoardChanged();
}

function progressTimeFromClientX(clientX) {
  const dur = player?.getDuration?.() || smoothProgress.duration || lastProgressSample.duration || currentItem?.duration || 0;
  if (!dur || !els.progressWrap) return null;
  const rect = els.progressWrap.getBoundingClientRect();
  const width = Math.max(1, rect.width);
  const pct = Math.min(1, Math.max(0, (clientX - rect.left) / width));
  return { time: dur * pct, duration: dur, pct };
}

function seekFromProgress(event) {
  if (performance.now() < suppressProgressClickUntil) return;
  if (!ready || !player) return;
  const info = progressTimeFromClientX(event.clientX);
  if (!info) return;
  player.seekTo(info.time, true);
  smoothProgress.time = info.time;
  smoothProgress.duration = info.duration;
  smoothProgress.lastFrameAt = performance.now();
  paintProgress(info.time, info.duration);
}

function updateScrubPreview(event, options = {}) {
  if (!ready || !player) return;
  const info = progressTimeFromClientX(event.clientX);
  if (!info) return;
  scrubPreview = { time: info.time, duration: info.duration, lastSeekAt: scrubPreview.lastSeekAt || 0 };
  smoothProgress.time = info.time;
  smoothProgress.duration = info.duration;
  smoothProgress.lastFrameAt = performance.now();
  paintProgress(info.time, info.duration);

  const now = performance.now();
  if (options.force || now - (scrubPreview.lastSeekAt || 0) > 115) {
    try { player.seekTo(info.time, true); } catch {}
    scrubPreview.lastSeekAt = now;
  }
}

function beginProgressScrub(event) {
  if (!ready || !player || event.button !== 0) return;
  const info = progressTimeFromClientX(event.clientX);
  if (!info) return;
  event.preventDefault();
  isScrubbingProgress = true;
  isRewindingProgress = false;
  if (progressRewindRaf) cancelAnimationFrame(progressRewindRaf);
  scrubPointerId = event.pointerId;
  els.progressWrap.classList.add('scrubbing');
  els.progressWrap.setPointerCapture?.(event.pointerId);
  scrubPreview = { time: info.time, duration: info.duration, lastSeekAt: 0 };
  updateScrubPreview(event, { force: true });
}

function moveProgressScrub(event) {
  if (!isScrubbingProgress || event.pointerId !== scrubPointerId) return;
  event.preventDefault();
  updateScrubPreview(event);
}

function endProgressScrub(event) {
  if (!isScrubbingProgress || event.pointerId !== scrubPointerId) return;
  event.preventDefault();
  updateScrubPreview(event, { force: true });
  try { els.progressWrap.releasePointerCapture?.(event.pointerId); } catch {}
  els.progressWrap.classList.remove('scrubbing');
  isScrubbingProgress = false;
  scrubPointerId = null;
  suppressProgressClickUntil = performance.now() + 220;
  smoothProgress.time = scrubPreview.time || smoothProgress.time || 0;
  smoothProgress.duration = scrubPreview.duration || smoothProgress.duration || 0;
  smoothProgress.lastFrameAt = performance.now();
  sampleProgressNow({ snap: true });
}

function cancelProgressScrub(event) {
  if (!isScrubbingProgress) return;
  try { els.progressWrap.releasePointerCapture?.(event.pointerId); } catch {}
  els.progressWrap.classList.remove('scrubbing');
  isScrubbingProgress = false;
  scrubPointerId = null;
  suppressProgressClickUntil = performance.now() + 220;
}

function wireDropZone(zone, onDrop, effect = 'copy') {
  zone.addEventListener('dragenter', (e) => {
    e.preventDefault();
    zone.classList.add('drag-over');
  });
  zone.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = effect;
  });
  zone.addEventListener('dragleave', (e) => {
    if (!zone.contains(e.relatedTarget)) zone.classList.remove('drag-over');
  });
  zone.addEventListener('drop', async (e) => {
    e.preventDefault();
    const payload = getDropPayload(e);
    await onDrop(payload);
    zone.classList.remove('drag-over');
  });
}

function updateClock() {
  if (!els.deckClock) return;
  const now = new Date();
  els.deckClock.textContent = now.toLocaleTimeString(lang() === 'en' ? 'en-US' : 'ko-KR', { hour: '2-digit', minute: '2-digit' });
}

function startClock() {
  updateClock();
  if (clockTimer) clearInterval(clockTimer);
  clockTimer = setInterval(updateClock, 1000);
}

function wireEvents() {
  els.addBtn.addEventListener('click', addPlaylistFlow);
  els.apiBtn.addEventListener('click', apiKeyFlow);
  els.themeBtn?.addEventListener('click', cycleTheme);
  els.themeBtn?.addEventListener('contextmenu', (e) => { e.preventDefault(); customThemeFlow(); });
  els.knobBtn?.addEventListener('click', progressKnobFlow);
  els.controlSettingsBtn?.addEventListener('click', progressKnobFlow);
  els.bassBtn?.addEventListener('click', cycleBassBoost);
  els.langBtn?.addEventListener('click', cycleLanguage);
  els.playBtn.addEventListener('click', playOrPause);
  els.nextBtn.addEventListener('click', () => playNext(false, { manual: true }));
  els.prevBtn.addEventListener('click', playPrevious);
  els.progressWrap.addEventListener('pointerdown', beginProgressScrub);
  els.progressWrap.addEventListener('pointermove', moveProgressScrub);
  els.progressWrap.addEventListener('pointerup', endProgressScrub);
  els.progressWrap.addEventListener('pointercancel', cancelProgressScrub);
  els.progressWrap.addEventListener('click', seekFromProgress);
  els.speedDownBtn.addEventListener('click', () => stepSpeed(-1));
  els.speedUpBtn.addEventListener('click', () => stepSpeed(1));

  els.shuffleBtn.addEventListener('click', async () => {
    const current = MODES.indexOf(state.playback.shuffleMode);
    state.playback.shuffleMode = MODES[(current + 1) % MODES.length];
    queueBag = [];
    sequentialIndex = -1;
    render();
    if (state.playback.shuffleMode !== 'off') await autoImportOnBoardRawPlaylists();
  });

  els.loopBtn.addEventListener('click', () => {
    state.playback.loop = !state.playback.loop;
    render();
  });

  els.volumeSlider.addEventListener('input', () => {
    state.playback.volume = Number(els.volumeSlider.value);
    if (ready) player.setVolume(state.playback.volume);
    saveState();
  });

  els.opacitySlider.addEventListener('input', async () => {
    state.settings.opacity = Number(els.opacitySlider.value) / 100;
    saveState();
    await window.deckAPI?.setOpacity(state.settings.opacity);
  });

  wireDropZone(els.onBoardZone, handleOnBoardDropPayload, 'copy');
  wireDropZone(els.libraryZone, handleLibraryDropPayload, 'move');

  els.contextMenu.addEventListener('click', async (e) => {
    const action = e.target?.dataset?.menu;
    if (!action || !contextPlaylistId) return;
    hideContextMenu();
    if (action === 'toggleOnBoard') toggleOnBoard(contextPlaylistId);
    if (action === 'rename') renamePlaylist(contextPlaylistId);
    if (action === 'refresh') await importPlaylistTracksNoKey(contextPlaylistId, { silentFail: false });
    if (action === 'delete') deletePlaylist(contextPlaylistId);
  });

  document.addEventListener('click', (e) => {
    if (!els.contextMenu.contains(e.target)) hideContextMenu();
  });

  els.modalClose.addEventListener('click', hideModal);
  els.modal.addEventListener('click', (e) => {
    if (e.target === els.modal) hideModal();
  });

  els.dockBtn.addEventListener('click', () => window.deckAPI?.dockBottom());
  els.reserveBtn?.addEventListener('click', async () => {
    state.settings.reserveSpace = !state.settings.reserveSpace;
    saveState();
    const result = await window.deckAPI?.setReserveSpace?.(state.settings.reserveSpace);
    updateReserveButton(result || { enabled: state.settings.reserveSpace });
  });
  els.pinBtn.addEventListener('click', async () => {
    pinEnabled = !pinEnabled;
    els.pinBtn.classList.toggle('active', pinEnabled);
    updateControls();
    await window.deckAPI?.setAlwaysOnTop(pinEnabled);
  });
  els.minBtn.addEventListener('click', () => window.deckAPI?.minimize());
  els.closeBtn.addEventListener('click', gracefulClose);

  window.deckAPI?.onLockChanged?.((payload) => {
    const mode = typeof payload === 'string' ? payload : (payload?.mode || (payload ? 'bottom' : 'free'));
    document.body.dataset.dock = mode;
    if (typeof payload?.reserveSpaceEnabled === 'boolean') state.settings.reserveSpace = payload.reserveSpaceEnabled;
    els.dockBtn.classList.toggle('active', mode !== 'free');
    els.dockBtn.textContent = mode === 'bottom' ? 'DOCK B' : mode === 'right' ? 'DOCK R' : mode === 'left' ? 'DOCK L' : 'DOCK';
    updateReserveButton(payload);
    updateLayoutClass();
  });
  window.deckAPI?.onDisplayChanged?.(() => updateLayoutClass());
  window.deckAPI?.onTrayCommand?.((command) => {
    if (command === 'playPause') playOrPause();
    else if (command === 'next') playNext(false, { manual: true });
    else if (command === 'prev') playPrevious();
  });

  window.addEventListener('resize', updateLayoutClass);
  new ResizeObserver(updateLayoutClass).observe(document.body);

  window.addEventListener('beforeunload', () => {
    try { window.deckAPI?.savePersistentState?.({ schemaVersion: 24, app: 'YTDeckPlayer', savedAt: new Date().toISOString(), ...stateForPersistence() }); } catch {}
  });

  document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) {
      e.preventDefault();
      playOrPause();
    }
    if (e.code === 'ArrowRight' && e.ctrlKey) playNext(false, { manual: true });
    if (e.code === 'ArrowLeft' && e.ctrlKey) playPrevious();
    if (e.code === 'ArrowUp' && e.ctrlKey) stepSpeed(1);
    if (e.code === 'ArrowDown' && e.ctrlKey) stepSpeed(-1);
  });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function gracefulClose() {
  if (gracefulClosing) return;
  gracefulClosing = true;
  try {
    els.closeBtn.disabled = true;
    els.closeBtn.textContent = '...';
    hideModal();
    hideContextMenu();
    const originalOpacity = Number(state.settings.opacity || 0.96);
    const originalVolume = Number(state.playback.volume || 72);
    try { await window.deckAPI?.setReserveSpace?.(false); } catch {}
    try { player?.setVolume?.(originalVolume); } catch {}
    const durationMs = 2800;
    const started = performance.now();
    while (true) {
      const p = Math.min(1, (performance.now() - started) / durationMs);
      const volume = Math.max(0, Math.round(originalVolume * (1 - p)));
      const opacity = Math.max(0, originalOpacity * (1 - p));
      try { player?.setVolume?.(volume); } catch {}
      try { await window.deckAPI?.setOpacity?.(opacity); } catch {}
      if (p >= 1) break;
      await sleep(33);
    }
    try { player?.pauseVideo?.(); } catch {}
    try { await window.deckAPI?.setAlwaysOnTop?.(false); } catch {}
    await window.deckAPI?.close?.();
  } catch {
    await window.deckAPI?.close?.();
  }
}

async function autoImportOnBoardRawPlaylists() {
  const raw = state.onBoard
    .map(getPlaylist)
    .filter((p) => p && p.type === 'playlist' && (!Array.isArray(p.tracks) || p.tracks.length === 0));
  for (const playlist of raw) {
    await importPlaylistTracksNoKey(playlist.id, { silentFail: true });
  }
}

function updateReserveButton(payload = {}) {
  if (!els.reserveBtn) return;
  const enabled = Boolean(payload.enabled ?? state.settings.reserveSpace);
  const registered = Boolean(payload.registered ?? payload.appBarRegistered);
  const failed = enabled && !registered && (document.body.dataset.dock || 'bottom') !== 'free';
  const message = payload.appBarStatus?.message || '';
  els.reserveBtn.classList.toggle('active', enabled && registered);
  els.reserveBtn.classList.toggle('warn', failed);
  els.reserveBtn.textContent = !enabled ? 'SPACE OFF' : registered ? 'SPACE ON' : 'SPACE FAIL';
  els.reserveBtn.title = !enabled
    ? (lang() === 'en' ? 'Reserve space is off. The deck will float above other windows.' : '공간 예약이 꺼져 있어 덱이 다른 창 위에 떠 있습니다.')
    : registered
      ? (lang() === 'en' ? 'Reserve space is active. Maximize a window again to make it stop before the deck.' : '공간 예약이 켜졌습니다. 기존 최대화 창은 복원 후 다시 최대화해 보세요.')
      : (lang() === 'en' ? `Reserve space failed. ${message}${payload.appBarStatus?.logFile ? ` Log: ${payload.appBarStatus.logFile}` : ''}` : `공간 예약 등록에 실패했습니다. ${message}${payload.appBarStatus?.logFile ? ` 로그: ${payload.appBarStatus.logFile}` : ''}`);
}

function updateLayoutClass() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const dock = document.body.dataset.dock || 'bottom';
  document.body.classList.toggle('is-mini', h < 104);
  document.body.classList.toggle('is-slim', h >= 104 && h < 164);
  document.body.classList.toggle('is-low', h < 200);
  document.body.classList.toggle('is-narrow', w < 760);
  document.body.classList.toggle('is-dock-side', dock === 'right' || dock === 'left');
  document.body.classList.toggle('is-portraitish', dock === 'right' || dock === 'left' || h > w * 0.82);
}

function seedDemoIfEmpty() {
  if (state.library.length > 0) return;
  state.library.push({
    id: uid('chip'),
    name: '예시: 영상 1개',
    url: 'https://www.youtube.com/watch?v=M7lc1UVf-VE',
    type: 'video',
    playlistId: null,
    videoId: 'M7lc1UVf-VE',
    thumb: thumbnailForVideo('M7lc1UVf-VE'),
    tracks: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
}

async function boot() {
  await hydratePersistentState();
  wireEvents();
  startClock();
  seedDemoIfEmpty();
  setTrackTitleText(els.trackTitle.textContent);
  commitOnBoardChanges('boot');
  render();
  applyThemeForCurrentItem(true);
  await window.deckAPI?.setOpacity(state.settings.opacity || 0.96);
  const reserve = await window.deckAPI?.setReserveSpace?.(state.settings.reserveSpace !== false);
  updateReserveButton(reserve || { enabled: state.settings.reserveSpace !== false });
}


boot();
