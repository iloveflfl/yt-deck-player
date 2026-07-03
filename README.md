# YT Deck Player

<center>
  <img width="400" height="400" alt="image" src="https://github.com/user-attachments/assets/87ac1ba6-47ca-423e-8027-ef8cc557f5da" />
</center>


유튜브를 데스크톱 한 켠의 "오디오 덱"으로 쓰는 Electron 앱입니다. 화면 가장자리에 도킹되는 프레임리스 플레이어에 플레이리스트를 칩(chip)으로 올려두고, 작업하면서 BGM처럼 재생합니다.

A frameless Electron "audio deck" for YouTube. Dock it to a screen edge, drop playlists onto the board as chips, and let it run like a desk radio while you work.

---


<img width="2560" height="1440" alt="image" src="https://github.com/user-attachments/assets/ca699c80-1d41-42b7-be1d-5d466bf31429" />



## 한국어

### 주요 기능

- **덱 도킹**: 하단/좌/우 가장자리에 도킹하거나 자유 배치. Windows AppBar로 작업영역을 예약해
  다른 최대화 창이 덱을 가리지 않습니다(SPACE 버튼). 멀티모니터·혼합 DPI 환경 지원.
- **칩 보드**: 유튜브 플레이리스트/영상 링크를 라이브러리에 저장하고, 온보드로 드래그해서 재생 풀을 구성.
  브라우저에서 링크를 직접 끌어다 놓을 수도 있습니다. API 키 없이 곡 목록을 불러옵니다.
- **재생 컨트롤**: 진행바 드래그 스크럽, 셔플(순차/백/카오스), 반복, 배속, 볼륨, 창 불투명도.
- **테마 19종 + Adaptive**: Aurora Carbon부터 Crayon Pastel 3부작, Cutie Fur/Glass/Robot까지.
  Adaptive 모드는 현재 곡 썸네일 색으로 테마를 만듭니다.
- **커스텀 테마 모드**: 테마 칩을 **우클릭**하면 에디터가 열립니다. 색상 5종을 고르고
  배경 이미지를 "채우기" 또는 "패턴 반복"으로 깔 수 있으며, 저장한 테마는 누적 보관되어
  테마 순환에 포함됩니다.
- **트레이 아이콘**: 클릭으로 보이기/숨기기, 우클릭 메뉴로 재생 제어. 툴팁에 현재 곡 표시.
- **상태 보존**: 라이브러리는 `문서\YTDeckPlayer\library-state.json`에 저장되고,
  손상 시 자동 백업본으로 복구됩니다.

### 실행 / 빌드

```powershell
npm.cmd install
npm.cmd start        # 개발 실행
npm.cmd run check    # 무결성 검사 (문법 / 필수 파일 / 테마 / i18n / 버전)
npm.cmd run dist:win # 포터블 exe + NSIS 설치마법사 빌드 (dist/)
```

### 사용 팁

- 상단 `DOCK` 버튼: 하단 → 우측 → 좌측 → 자유 순으로 전환. 커서가 있는 모니터에 도킹됩니다.
- `SPACE`: 작업영역 예약(AppBar) 토글. `PIN`: 항상 위.
- 테마 칩 클릭: 테마 순환 / 우클릭: 커스텀 테마 에디터.
- 칩 우클릭: 온보드 토글·이름 변경·곡 목록 갱신·삭제.

---

## English

### Features

- **Edge docking**: Dock to the bottom/left/right edge or float freely. On Windows the deck
  registers an AppBar so maximized windows never cover it (SPACE button). Multi-monitor and
  mixed-DPI aware.
- **Chip board**: Save YouTube playlist/video links to a library, drag chips onto the board to
  build a play pool, or drop links straight from the browser. Track lists load without an API key.
- **Playback controls**: Live progress-bar scrubbing, shuffle (sequential/bag/chaos), loop,
  playback speed, volume, and window opacity.
- **19 built-in themes + Adaptive**: From Aurora Carbon to the Crayon Pastel trio, Cutie Fur,
  Glass, and Robot. Adaptive derives a palette from the current track's thumbnail.
- **Custom theme mode**: **Right-click** the theme chip to open the editor. Pick five base
  colors and optionally set a background image, either filled or repeated as a pattern.
  Saved themes accumulate and join the theme cycle.
- **Tray icon**: Click to show/hide, right-click for playback controls; the tooltip shows the
  current track.
- **Durable state**: The library persists to `Documents\YTDeckPlayer\library-state.json` with
  automatic backup/recovery on corruption.

### Run / Build

```powershell
npm.cmd install
npm.cmd start        # run in development
npm.cmd run check    # integrity checks (syntax / files / themes / i18n / version)
npm.cmd run dist:win # build portable exe + NSIS installer into dist/
```

### Tips

- `DOCK` cycles bottom → right → left → free, targeting the monitor under your cursor.
- `SPACE` toggles the reserved work area (AppBar). `PIN` toggles always-on-top.
- Click the theme chip to cycle themes; right-click it to open the custom theme editor.
- Right-click a chip for on-board toggle, rename, track refresh, and delete.

---

## License

MIT

<div data-view-component="true">      <div data-view-component="true" class="Box Box--condensed tmp-mt-3">
  
  
    <ul data-view-component="true">
        <li data-view-component="true" class="Box-row d-flex flex-column flex-md-row">      <div style="overflow: hidden;" data-view-component="true" class="d-flex flex-justify-start flex-items-center col-12 col-lg-6">
        <svg aria-hidden="true" data-component="Octicon" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true" class="octicon octicon-package color-fg-muted mr-2 tmp-mr-2">
    <path d="m8.878.392 5.25 3.045c.54.314.872.89.872 1.514v6.098a1.75 1.75 0 0 1-.872 1.514l-5.25 3.045a1.75 1.75 0 0 1-1.756 0l-5.25-3.045A1.75 1.75 0 0 1 1 11.049V4.951c0-.624.332-1.201.872-1.514L7.122.392a1.75 1.75 0 0 1 1.756 0ZM7.875 1.69l-4.63 2.685L8 7.133l4.755-2.758-4.63-2.685a.248.248 0 0 0-.25 0ZM2.5 5.677v5.372c0 .09.047.171.125.216l4.625 2.683V8.432Zm6.25 8.271 4.625-2.683a.25.25 0 0 0 .125-.216V5.677L8.75 8.432Z"></path>
</svg>
        <a href="/iloveflfl/yt-deck-player/releases/download/v2.8.0/YTDeckPlayer-2.8.0-portable.exe" rel="nofollow" data-turbo="false" data-view-component="true" class="Truncate">
    <span data-view-component="true" class="Truncate-text text-bold">YTDeckPlayer-2.8.0-portable.exe</span>
    <span data-view-component="true" class="Truncate-text"></span>
</a></div>      <div data-view-component="true" class="d-flex flex-auto flex-justify-end flex-items-center col-md-6 ml-3 tmp-ml-3 ml-md-0 tmp-ml-md-0 mt-1 tmp-mt-1 mt-md-0 tmp-mt-md-0 pl-1 tmp-pl-1 pl-md-0 tmp-pl-md-0">
          <div style="overflow: hidden;" data-view-component="true" class="d-flex flex-items-center flex-justify-end flex-1">
            <span style="min-width: 0; max-width: 250px" data-view-component="true" class="Truncate text-mono text-small color-fg-muted">
    <span data-view-component="true" class="Truncate-text">sha256:9747742cf20065089dfe9b91a60de0bda862ab8fe609a493cd4df03508d3c037</span>
</span>            <span data-view-component="true">
  <clipboard-copy id="clipboard-button-sha256:9747742cf20065089dfe9b91a60de0bda862ab8fe609a493cd4df03508d3c037" aria-label="Copy to clipboard digest for YTDeckPlayer-2.8.0-portable.exe" type="button" value="sha256:9747742cf20065089dfe9b91a60de0bda862ab8fe609a493cd4df03508d3c037" data-view-component="true" class="Button--invisible Button--small Button Button--invisible-noVisuals color-fg-muted" tabindex="0" role="button">
      <svg aria-hidden="true" data-component="Octicon" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true" class="octicon octicon-copy">
    <path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z"></path><path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z"></path>
</svg>
      <svg style="display: none;" aria-hidden="true" data-component="Octicon" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true" class="octicon octicon-check color-fg-success">
    <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z"></path>
</svg>
</clipboard-copy>  <div aria-live="polite" aria-atomic="true" class="sr-only" data-clipboard-copy-feedback=""></div>
</span>

</div>          <span style="white-space: nowrap; min-width: clamp(50px, 15vw, 75px);" aria-label="1 download" data-view-component="true" class="color-fg-muted d-flex flex-items-center flex-justify-end flex-shrink-0 flex-grow-0 ml-2 tmp-ml-2 ml-sm-3 tmp-ml-sm-3 ml-md-4 tmp-ml-md-4">
            1
            <svg aria-hidden="true" data-component="Octicon" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true" class="octicon octicon-download color-fg-muted ml-1 tmp-ml-1">
    <path d="M2.75 14A1.75 1.75 0 0 1 1 12.25v-2.5a.75.75 0 0 1 1.5 0v2.5c0 .138.112.25.25.25h10.5a.25.25 0 0 0 .25-.25v-2.5a.75.75 0 0 1 1.5 0v2.5A1.75 1.75 0 0 1 13.25 14Z"></path><path d="M7.25 7.689V2a.75.75 0 0 1 1.5 0v5.689l1.97-1.969a.749.749 0 1 1 1.06 1.06l-3.25 3.25a.749.749 0 0 1-1.06 0L4.22 6.78a.749.749 0 1 1 1.06-1.06l1.97 1.969Z"></path>
</svg>
</span>          <span style="white-space: nowrap; min-width: clamp(50px, 15vw, 75px);" data-view-component="true" class="color-fg-muted text-right flex-shrink-0 flex-grow-0 ml-2 tmp-ml-2 ml-sm-3 tmp-ml-sm-3 ml-md-4 tmp-ml-md-4">68.3 MB</span>
          <span style="white-space: nowrap; min-width: clamp(75px, 15vw, 100px);" data-view-component="true" class="color-fg-muted text-right flex-shrink-0 flex-grow-0 ml-2 tmp-ml-2 ml-sm-3 tmp-ml-sm-3 ml-md-4 tmp-ml-md-4"><relative-time datetime="2026-07-03T10:21:45Z" class="no-wrap" prefix="" title="Jul 3, 2026, 7:21 PM GMT+9"><template shadowrootmode="open"><span part="root">37 minutes ago</span></template>2026-07-03T10:21:45Z</relative-time></span>
</div></li>
        <li data-view-component="true" class="Box-row d-flex flex-column flex-md-row">      <div style="overflow: hidden;" data-view-component="true" class="d-flex flex-justify-start flex-items-center col-12 col-lg-6">
        <svg aria-hidden="true" data-component="Octicon" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true" class="octicon octicon-package color-fg-muted mr-2 tmp-mr-2">
    <path d="m8.878.392 5.25 3.045c.54.314.872.89.872 1.514v6.098a1.75 1.75 0 0 1-.872 1.514l-5.25 3.045a1.75 1.75 0 0 1-1.756 0l-5.25-3.045A1.75 1.75 0 0 1 1 11.049V4.951c0-.624.332-1.201.872-1.514L7.122.392a1.75 1.75 0 0 1 1.756 0ZM7.875 1.69l-4.63 2.685L8 7.133l4.755-2.758-4.63-2.685a.248.248 0 0 0-.25 0ZM2.5 5.677v5.372c0 .09.047.171.125.216l4.625 2.683V8.432Zm6.25 8.271 4.625-2.683a.25.25 0 0 0 .125-.216V5.677L8.75 8.432Z"></path>
</svg>
        <a href="/iloveflfl/yt-deck-player/releases/download/v2.8.0/YTDeckPlayer-2.8.0-setup.exe" rel="nofollow" data-turbo="false" data-view-component="true" class="Truncate">
    <span data-view-component="true" class="Truncate-text text-bold">YTDeckPlayer-2.8.0-setup.exe</span>
    <span data-view-component="true" class="Truncate-text"></span>
</a></div>      <div data-view-component="true" class="d-flex flex-auto flex-justify-end flex-items-center col-md-6 ml-3 tmp-ml-3 ml-md-0 tmp-ml-md-0 mt-1 tmp-mt-1 mt-md-0 tmp-mt-md-0 pl-1 tmp-pl-1 pl-md-0 tmp-pl-md-0">
          <div style="overflow: hidden;" data-view-component="true" class="d-flex flex-items-center flex-justify-end flex-1">
            <span style="min-width: 0; max-width: 250px" data-view-component="true" class="Truncate text-mono text-small color-fg-muted">
    <span data-view-component="true" class="Truncate-text">sha256:228e9b3c89c70497887ffcd6681d75f788190de956c370ba3364f0b8d66bd46d</span>
</span>            <span data-view-component="true">
  <clipboard-copy id="clipboard-button-sha256:228e9b3c89c70497887ffcd6681d75f788190de956c370ba3364f0b8d66bd46d" aria-label="Copy to clipboard digest for YTDeckPlayer-2.8.0-setup.exe" type="button" value="sha256:228e9b3c89c70497887ffcd6681d75f788190de956c370ba3364f0b8d66bd46d" data-view-component="true" class="Button--invisible Button--small Button Button--invisible-noVisuals color-fg-muted" tabindex="0" role="button">
      <svg aria-hidden="true" data-component="Octicon" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true" class="octicon octicon-copy">
    <path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z"></path><path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z"></path>
</svg>
      <svg style="display: none;" aria-hidden="true" data-component="Octicon" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true" class="octicon octicon-check color-fg-success">
    <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z"></path>
</svg>
</clipboard-copy>  <div aria-live="polite" aria-atomic="true" class="sr-only" data-clipboard-copy-feedback=""></div>
</span>

</div>          <span style="white-space: nowrap; min-width: clamp(50px, 15vw, 75px);" data-view-component="true" class="color-fg-muted text-right flex-shrink-0 flex-grow-0 ml-2 tmp-ml-2 ml-sm-3 tmp-ml-sm-3 ml-md-4 tmp-ml-md-4">68.5 MB</span>
          <span style="white-space: nowrap; min-width: clamp(75px, 15vw, 100px);" data-view-component="true" class="color-fg-muted text-right flex-shrink-0 flex-grow-0 ml-2 tmp-ml-2 ml-sm-3 tmp-ml-sm-3 ml-md-4 tmp-ml-md-4"><relative-time datetime="2026-07-03T10:21:45Z" class="no-wrap" prefix="" title="Jul 3, 2026, 7:21 PM GMT+9"><template shadowrootmode="open"><span part="root">37 minutes ago</span></template>2026-07-03T10:21:45Z</relative-time></span>
</div></li>
        <li data-view-component="true" class="Box-row d-flex flex-column flex-md-row">      <div style="overflow: hidden;" data-view-component="true" class="d-flex flex-justify-start flex-items-center col-12 col-lg-6">
        <svg aria-hidden="true" data-component="Octicon" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true" class="octicon octicon-file-zip color-fg-muted mr-2 tmp-mr-2">
    <path d="M3.5 1.75v11.5c0 .09.048.173.126.217a.75.75 0 0 1-.752 1.298A1.748 1.748 0 0 1 2 13.25V1.75C2 .784 2.784 0 3.75 0h5.586c.464 0 .909.185 1.237.513l2.914 2.914c.329.328.513.773.513 1.237v8.586A1.75 1.75 0 0 1 12.25 15h-.5a.75.75 0 0 1 0-1.5h.5a.25.25 0 0 0 .25-.25V4.664a.25.25 0 0 0-.073-.177L9.513 1.573a.25.25 0 0 0-.177-.073H7.25a.75.75 0 0 1 0 1.5h-.5a.75.75 0 0 1 0-1.5h-3a.25.25 0 0 0-.25.25Zm3.75 8.75h.5c.966 0 1.75.784 1.75 1.75v3a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1-.75-.75v-3c0-.966.784-1.75 1.75-1.75ZM6 5.25a.75.75 0 0 1 .75-.75h.5a.75.75 0 0 1 0 1.5h-.5A.75.75 0 0 1 6 5.25Zm.75 2.25h.5a.75.75 0 0 1 0 1.5h-.5a.75.75 0 0 1 0-1.5ZM8 6.75A.75.75 0 0 1 8.75 6h.5a.75.75 0 0 1 0 1.5h-.5A.75.75 0 0 1 8 6.75ZM8.75 3h.5a.75.75 0 0 1 0 1.5h-.5a.75.75 0 0 1 0-1.5ZM8 9.75A.75.75 0 0 1 8.75 9h.5a.75.75 0 0 1 0 1.5h-.5A.75.75 0 0 1 8 9.75Zm-1 2.5v2.25h1v-2.25a.25.25 0 0 0-.25-.25h-.5a.25.25 0 0 0-.25.25Z"></path>
</svg>
        <a href="/iloveflfl/yt-deck-player/archive/refs/tags/v2.8.0.zip" rel="nofollow" data-turbo="false" data-view-component="true" class="Truncate">
    <span data-view-component="true" class="Truncate-text text-bold">Source code</span>
    <span data-view-component="true" class="Truncate-text">(zip)</span>
</a></div>      <div data-view-component="true" class="d-flex flex-auto flex-justify-end flex-items-center col-md-6 ml-3 tmp-ml-3 ml-md-0 tmp-ml-md-0 mt-1 tmp-mt-1 mt-md-0 tmp-mt-md-0 pl-1 tmp-pl-1 pl-md-0 tmp-pl-md-0">
          <span style="white-space: nowrap; min-width: clamp(75px, 15vw, 100px);" data-view-component="true" class="color-fg-muted text-right flex-shrink-0 flex-grow-0 ml-2 tmp-ml-2 ml-sm-3 tmp-ml-sm-3 ml-md-4 tmp-ml-md-4"><relative-time datetime="2026-07-03T09:57:08Z" class="no-wrap" prefix="" title="Jul 3, 2026, 6:57 PM GMT+9"><template shadowrootmode="open"><span part="root">1 hour ago</span></template>2026-07-03T09:57:08Z</relative-time></span>
</div></li>
        <li data-view-component="true" class="Box-row d-flex flex-column flex-md-row">      <div style="overflow: hidden;" data-view-component="true" class="d-flex flex-justify-start flex-items-center col-12 col-lg-6">
        <svg aria-hidden="true" data-component="Octicon" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true" class="octicon octicon-file-zip color-fg-muted mr-2 tmp-mr-2">
    <path d="M3.5 1.75v11.5c0 .09.048.173.126.217a.75.75 0 0 1-.752 1.298A1.748 1.748 0 0 1 2 13.25V1.75C2 .784 2.784 0 3.75 0h5.586c.464 0 .909.185 1.237.513l2.914 2.914c.329.328.513.773.513 1.237v8.586A1.75 1.75 0 0 1 12.25 15h-.5a.75.75 0 0 1 0-1.5h.5a.25.25 0 0 0 .25-.25V4.664a.25.25 0 0 0-.073-.177L9.513 1.573a.25.25 0 0 0-.177-.073H7.25a.75.75 0 0 1 0 1.5h-.5a.75.75 0 0 1 0-1.5h-3a.25.25 0 0 0-.25.25Zm3.75 8.75h.5c.966 0 1.75.784 1.75 1.75v3a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1-.75-.75v-3c0-.966.784-1.75 1.75-1.75ZM6 5.25a.75.75 0 0 1 .75-.75h.5a.75.75 0 0 1 0 1.5h-.5A.75.75 0 0 1 6 5.25Zm.75 2.25h.5a.75.75 0 0 1 0 1.5h-.5a.75.75 0 0 1 0-1.5ZM8 6.75A.75.75 0 0 1 8.75 6h.5a.75.75 0 0 1 0 1.5h-.5A.75.75 0 0 1 8 6.75ZM8.75 3h.5a.75.75 0 0 1 0 1.5h-.5a.75.75 0 0 1 0-1.5ZM8 9.75A.75.75 0 0 1 8.75 9h.5a.75.75 0 0 1 0 1.5h-.5A.75.75 0 0 1 8 9.75Zm-1 2.5v2.25h1v-2.25a.25.25 0 0 0-.25-.25h-.5a.25.25 0 0 0-.25.25Z"></path>
</svg>
        <a href="/iloveflfl/yt-deck-player/archive/refs/tags/v2.8.0.tar.gz" rel="nofollow" data-turbo="false" data-view-component="true" class="Truncate">
    <span data-view-component="true" class="Truncate-text text-bold">Source code</span>
    <span data-view-component="true" class="Truncate-text">(tar.gz)</span>
</a></div>      <div data-view-component="true" class="d-flex flex-auto flex-justify-end flex-items-center col-md-6 ml-3 tmp-ml-3 ml-md-0 tmp-ml-md-0 mt-1 tmp-mt-1 mt-md-0 tmp-mt-md-0 pl-1 tmp-pl-1 pl-md-0 tmp-pl-md-0">
          <span style="white-space: nowrap; min-width: clamp(75px, 15vw, 100px);" data-view-component="true" class="color-fg-muted text-right flex-shrink-0 flex-grow-0 ml-2 tmp-ml-2 ml-sm-3 tmp-ml-sm-3 ml-md-4 tmp-ml-md-4"><relative-time datetime="2026-07-03T09:57:08Z" class="no-wrap" prefix="" title="Jul 3, 2026, 6:57 PM GMT+9"><template shadowrootmode="open"><span part="root">1 hour ago</span></template>2026-07-03T09:57:08Z</relative-time></span>
</div></li>
</ul>  
</div></div>
