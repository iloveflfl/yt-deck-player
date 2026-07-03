# YT Deck Player

<p><img width="600" height="600" alt="image" src="https://github.com/user-attachments/assets/87ac1ba6-47ca-423e-8027-ef8cc557f5da" /></p>


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
