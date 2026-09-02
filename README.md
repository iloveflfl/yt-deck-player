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
- **트랙 브라우저 + 검색**: 온보드 검색 버튼 또는 Ctrl+F로 열립니다. 곡·아티스트·플레이리스트를 즉시 검색하고(한글 초성 검색 지원),
  화살표로 이동해 Enter나 클릭으로 바로 재생합니다. 수천 곡도 가상 스크롤로 부드럽고, 덱 너비에 맞춰 1~4열로 흐릅니다.
- **내 재생목록 가져오기 (로그인·설정 없음)**: 상단 ☰ 버튼 → 내 채널 주소(`@내채널`)만 붙여넣으면 공개 재생목록이 전부 목록으로 뜨고, 원하는 것만 골라 한 번에 들어옵니다.
  계정 연결도, API 키도, 클라이언트 ID도 필요 없습니다. 채널 주소는 기억되어 다음부터는 버튼 한 번이면 됩니다.
  - 이미 있는 재생목록은 중복 없이 갱신되고, 이름만 같은 남의 목록은 `이름 (YouTube)`로 따로 들어옵니다. 직접 추가한 곡은 갱신해도 남습니다.
- **재생 불가 곡 처리**: 소유자가 임베드를 막은 곡은 미리보기 패널 자리에 유튜브 페이지를 띄워 그대로 재생하고, 끝나면 덱으로 자동 복귀합니다.
  연령 제한 곡은 임베드로는 재생이 불가능합니다(2020년부터 제3자 임베드 전면 차단, 유튜브 정책). 재생하려면 로그인 + 연령 인증된 세션이 필요한데,
  이 앱은 구글 로그인을 일절 하지 않습니다. 대신 처리 방식을 직접 고를 수 있습니다(☰ 카드 → 연령 제한 곡 처리):
  - **내 브라우저에서 재생** (기본) — 이미 로그인·연령 인증된 기본 브라우저로 넘깁니다. 한 번 확인된 곡은 기억해 다음부터 바로 넘어갑니다.
  - **조용히 건너뛰기** — 브라우저를 띄우지 않고 다음 곡으로 넘어갑니다. 건너뛴 곡도 기록은 남습니다.
  어느 쪽이든 곡이 조용히 사라지지 않습니다. 트랙 목록에서 `연령` 배지로 표시되고, **연령 제한만** 토글로 모아 볼 수 있습니다.
- **칩 보드**: 유튜브 플레이리스트/영상 링크를 라이브러리에 저장하고, 온보드로 드래그해서 재생 풀을 구성.
  브라우저에서 링크를 직접 끌어다 놓을 수도 있습니다. API 키 없이 곡 목록을 불러옵니다.
- **재생 컨트롤**: 진행바 드래그 스크럽, 셔플(순차/백/카오스 — 카오스는 최근 15곡 재등장 회피), 반복, 배속, 볼륨, 창 불투명도.
- **테마 19종 + Adaptive**: Aurora Carbon부터 Crayon Pastel 3부작, Cutie Fur/Glass/Robot까지.
  Adaptive 모드는 현재 곡 썸네일 색으로 테마를 만듭니다.
- **커스텀 테마 모드**: 테마 칩을 **우클릭**하면 에디터가 열립니다. 색상 5종을 고르고
  배경 이미지를 "채우기" 또는 "패턴 반복"으로 깔 수 있으며, 저장한 테마는 누적 보관되어
  테마 순환에 포함됩니다.
- **트레이 아이콘**: 클릭으로 보이기/숨기기, 우클릭 메뉴로 재생 제어. 툴팁에 현재 곡 표시.
- **Deck Island (시계·슬립 타이머·무음 알람)**: 센터 패널의 큰 시계(또는 상단 캡슐) 클릭 → 타임 카드.
  프리셋을 누르면 슬립 타이머가 즉시 시작되고, 시간이 다 되면 그 곡을 마지막으로 재생을 멈춥니다("앞으로 N분만 재생").
  알람은 소리 대신 3단계 색 안무(예고→개화→잔광)로 알리며, 모든 색은 테마 변수를 따라 19개 테마 + 커스텀 테마와 자동으로 어울립니다.
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
- `Ctrl+F`(또는 ON BOARD의 돋보기): 트랙 브라우저. 초성 검색·↑↓←→ 이동·Enter 재생·Esc 닫기.

---

## English

### Features

- **Edge docking**: Dock to the bottom/left/right edge or float freely. On Windows the deck
  registers an AppBar so maximized windows never cover it (SPACE button). Multi-monitor and
  mixed-DPI aware.
- **Track browser with search**: Open it from the on-board search button or Ctrl+F. Search titles,
  artists, and playlists instantly (including Korean initial-consonant queries), move with the arrow
  keys, and play with Enter or a click. Thousands of tracks stay smooth through virtualised rendering,
  and the list flows into 1-4 columns to fit the deck.
- **Import my playlists (no sign-in, no setup)**: the ☰ button takes a channel address (`@yourchannel`), lists every public playlist on it, and imports the ones you tick.
  No account, no API key, no client ID. The address is remembered, so later it is one click.
  - Playlists already on the board refresh in place instead of duplicating; someone else's playlist that merely shares a name comes in separately as `name (YouTube)`. Hand-added tracks survive a refresh.
- **Unplayable tracks**: videos whose owner disabled embedding play on youtube.com inside the preview panel and hand control back to the deck when they end.
  Age-restricted videos can't play through an embed (third-party embedding was blocked in 2020); playback requires a signed-in, age-verified session, and this app never signs in to Google. Choose what happens instead (☰ card → Age-restricted tracks):
  - **Play in my browser** (default) — handed to your own browser, where you are already signed in and verified. Once seen, a track goes straight there next time.
  - **Skip quietly** — moves to the next track without opening anything. Skipped tracks are still recorded.
  Either way nothing disappears silently: age-restricted tracks carry an `18+` badge in the track list, with an **Age-restricted only** toggle to collect them.
- **Chip board**: Save YouTube playlist/video links to a library, drag chips onto the board to
  build a play pool, or drop links straight from the browser. Track lists load without an API key.
- **Playback controls**: Live progress-bar scrubbing, shuffle (sequential/bag/chaos — chaos
  avoids the 15 most recently played tracks), loop, playback speed, volume, and window opacity.
- **19 built-in themes + Adaptive**: From Aurora Carbon to the Crayon Pastel trio, Cutie Fur,
  Glass, and Robot. Adaptive derives a palette from the current track's thumbnail.
- **Custom theme mode**: **Right-click** the theme chip to open the editor. Pick five base
  colors and optionally set a background image, either filled or repeated as a pattern.
  Saved themes accumulate and join the theme cycle.
- **Tray icon**: Click to show/hide, right-click for playback controls; the tooltip shows the
  current track.
- **Deck Island (clock · sleep timer · silent alarm)**: Click the big center-panel clock (or the
  top capsule) for the time card. Presets start the sleep timer instantly; when time runs out the
  song playing becomes the last one ("play for N more minutes"). The alarm notifies with a
  three-stage color choreography (preheat → bloom → afterglow) instead of sound. Everything
  follows theme variables, so all 19 themes and custom themes style it automatically.
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
- `Ctrl+F` (or the magnifier in ON BOARD) opens the track browser: search, arrow keys, Enter to play, Esc to close.

---

## License

MIT

