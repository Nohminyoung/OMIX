/* =====================================================
   OMIX — now-playing-panel.js
   글로벌 Now Playing 패널 (전 페이지 공통)
   - 미니 플레이어에 "상세보기" 버튼 자동 주입
   - 슬라이드업 패널: 좌=LP레코드 고정 / 우=탭(가사·플리·최근·좋아요·인기)
   ===================================================== */

(function () {

  /* ── 트랙 데이터 ── */
  const TRACKS = [
    { title: 'Void Mandala',     artist: 'DJ Haein × OMIX',    duration: '3:48', genre: 'AMBIENT',   label: 'OMIX.LP.01', year: '2025',
      lyrics: `공(空) 속에서 피어나는\n만다라의 울림\n텅 빈 그 중심에서\n모든 것이 시작된다\n\n비워야 채워지고\n버려야 얻어진다\n그 역설의 진리\n선율로 흐른다\n\n아무것도 없는 곳에서\n모든 것을 듣는다` },
    { title: '108 Bells',        artist: 'Zen Kollective',      duration: '4:21', genre: 'RITUAL',    label: 'OMIX.LP.01', year: '2025',
      lyrics: `백팔 번의 울림\n백팔 가지의 번뇌\n종소리 따라\n하나씩 내려놓는다\n\n새벽 예불의 정적\n공명하는 법당\n찰나의 깨달음\n종소리 속에 있다` },
    { title: 'Lotus Drop',       artist: 'Haein',               duration: '3:12', genre: 'NEO-SOUL',  label: 'OMIX.LP.01', year: '2025',
      lyrics: `진흙 속에서 피어나\n물 위에 떠오른 꽃\n더러움에 물들지 않고\n청정하게 빛난다\n\n연꽃처럼\n그렇게 살고 싶다` },
    { title: 'Temple Rave',      artist: 'OMIX Collective',     duration: '5:44', genre: 'TECHNO',    label: 'OMIX.LP.01', year: '2025',
      lyrics: `법고 소리 베이스로\n목탁이 킥이 되고\n염불이 랩이 된다\n\n천 년의 전통\n오늘 밤 클럽에서\n다시 태어난다\n\n모두가 하나 되는\n이 순간의 선정` },
    { title: 'Samsara Loop',     artist: 'DJ Haein',            duration: '6:02', genre: 'DEEP TECH', label: 'OMIX.LP.01', year: '2025',
      lyrics: `윤회의 고리 속\n반복되는 선율\n그 안에서 찾는\n해탈의 출구\n\n루프는 끝나지 않는다\n의식이 깨어날 때까지` },
    { title: 'Dharma Wave',      artist: 'Zen Kollective',      duration: '4:55', genre: 'WAVE',      label: 'OMIX.LP.01', year: '2025',
      lyrics: `법의 파도가 온다\n온몸으로 맞이하라\n휩쓸리지 말고\n파도 위에 서라\n\n세상의 이치\n음악으로 흐른다` },
    { title: 'Nirvana Bass',     artist: 'OMIX Studio',         duration: '3:33', genre: 'BASS',      label: 'OMIX.LP.01', year: '2025',
      lyrics: `열반의 고요함\n베이스 라인으로\n가슴 속 깊이\n울려 퍼진다\n\n집착을 놓아버릴 때\n진정한 자유가 온다` },
    { title: 'Koan Dub',         artist: 'Haein',               duration: '7:11', genre: 'DUB',       label: 'OMIX.LP.01', year: '2025',
      lyrics: `한 손으로 치는 소리는?\n그 물음 속에\n답이 있다\n\n더브의 공간 속\n메아리 치는 화두\n에코가 진리다` },
    { title: 'Bodhi Frequency',  artist: 'OMIX Collective',     duration: '5:18', genre: 'AMBIENT',   label: 'OMIX.LP.01', year: '2025',
      lyrics: `보리수 아래\n깨달음의 주파수\n432Hz로 맞춰진\n우주의 소리\n\n몸이 공명한다\n마음이 열린다` },
    { title: 'Mantra Machine',   artist: 'DJ Haein × Haein',   duration: '4:44', genre: 'INDUSTRIAL',label: 'OMIX.LP.01', year: '2025',
      lyrics: `옴 마니 반메 훔\n기계의 리듬으로\n반복되는 진언\n\n만트라는 기도\n기계는 수행\n그 경계가 없어질 때` },
    { title: 'Silent Thunder',   artist: 'Zen Kollective',      duration: '3:59', genre: 'AMBIENT',   label: 'OMIX.LP.01', year: '2025',
      lyrics: `천둥소리 없는\n번개의 빛\n말 없이 이해하는\n선의 언어\n\n침묵이 가장 큰 소리\n그 안에 모든 것` },
    { title: 'Return to Zero',   artist: 'OMIX Studio',         duration: '8:08', genre: 'DRONE',     label: 'OMIX.LP.01', year: '2025',
      lyrics: `제로로 돌아간다\n처음으로 돌아간다\n모든 것의 시작\n공(空)으로\n\n끝은 시작이고\n시작은 끝이다\n원으로 완성되는\nOMIX의 여정` },
  ];

  /* 현재 트랙 인덱스 (글로벌) */
  let currentTrack = 0;

  /* 최근/좋아요/인기 더미 데이터 */
  const RECENT  = [1,3,0,5,8];
  const LIKED   = [0,2,6,11];
  const POPULAR = [0,3,7,1,4,9];

  /* ── HTML 주입 ── */
  const panelHTML = `
<div id="npPanel" class="np-panel" aria-hidden="true">
  <div class="np-backdrop"></div>
  <div class="np-sheet">

    <!-- 닫기 -->
    <button class="np-close" id="npClose" aria-label="닫기">✕</button>

    <div class="np-layout">

      <!-- ══ LEFT: LP 레코드 고정 ══ -->
      <div class="np-left">
        <div class="np-vinyl-wrap">
          <div class="np-vinyl" id="npVinyl">
            <!-- 그루브 링들 (CSS만) -->
            <div class="np-label" id="npLabel">
              <div class="np-label-brand">OMIX</div>
              <div class="np-label-title" id="npLabelTitle">Void Mandala</div>
              <div class="np-label-side">SIDE A</div>
              <div class="np-label-cat" id="npLabelCat">OMIX.LP.01</div>
              <div class="np-label-tracks" id="npLabelTracks">
                BLOOD · DNA · YAH · ELEMENT
              </div>
            </div>
          </div>
        </div>
        <div class="np-meta">
          <p class="np-meta-title" id="npMetaTitle">Void Mandala</p>
          <p class="np-meta-artist" id="npMetaArtist">DJ Haein × OMIX Studio</p>
          <p class="np-meta-tag" id="npMetaTag"><span class="np-genre-tag" id="npGenreTag">AMBIENT</span><span class="np-year" id="npYear">2025</span></p>
        </div>
        <!-- 미니 컨트롤 -->
        <div class="np-controls">
          <button class="np-ctrl" id="npPrev">⏮</button>
          <button class="np-ctrl np-ctrl-play" id="npPlay">▶</button>
          <button class="np-ctrl" id="npNext">⏭</button>
        </div>
        <div class="np-prog-wrap">
          <div class="np-prog-bar"><div class="np-prog-fill" id="npProgFill" style="width:38%"></div></div>
          <div class="np-prog-times"><span id="npCurTime">1:27</span><span id="npTotalTime">3:48</span></div>
        </div>
      </div>

      <!-- ══ RIGHT: 탭 콘텐츠 ══ -->
      <div class="np-right">
        <div class="np-tabs" role="tablist">
          <button class="np-tab active" data-tab="lyrics"   role="tab">가사</button>
          <button class="np-tab"        data-tab="playlist" role="tab">플레이리스트</button>
          <button class="np-tab"        data-tab="recent"   role="tab">최근 들은 곡</button>
          <button class="np-tab"        data-tab="liked"    role="tab">좋아요</button>
          <button class="np-tab"        data-tab="popular"  role="tab">많이 들은 곡</button>
        </div>

        <div class="np-pane-wrap">
          <!-- 가사 -->
          <div class="np-pane active" id="np-lyrics" role="tabpanel">
            <div class="np-lyrics-header">
              <span class="np-lyrics-track" id="npLyricsTrack">Void Mandala</span>
              <span class="np-lyrics-artist" id="npLyricsArtist">DJ Haein × OMIX Studio</span>
            </div>
            <pre class="np-lyrics-body" id="npLyricsBody"></pre>
          </div>

          <!-- 플레이리스트 -->
          <div class="np-pane" id="np-playlist" role="tabpanel">
            <p class="np-pane-label">OMIX.LP.01 — 전체 트랙</p>
            <ul class="np-track-list" id="npPlaylistList"></ul>
          </div>

          <!-- 최근 들은 곡 -->
          <div class="np-pane" id="np-recent" role="tabpanel">
            <p class="np-pane-label">최근 들은 곡</p>
            <ul class="np-track-list" id="npRecentList"></ul>
          </div>

          <!-- 좋아요 -->
          <div class="np-pane" id="np-liked" role="tabpanel">
            <p class="np-pane-label">좋아요한 곡</p>
            <ul class="np-track-list" id="npLikedList"></ul>
          </div>

          <!-- 많이 들은 곡 -->
          <div class="np-pane" id="np-popular" role="tabpanel">
            <p class="np-pane-label">많이 들은 곡</p>
            <ul class="np-track-list" id="npPopularList"></ul>
          </div>
        </div>
      </div>

    </div>
  </div>
</div>`;

  /* ── CSS 주입 ── */
  const css = `
/* ======================================================
   NOW PLAYING PANEL
   ====================================================== */
.np-panel {
  position: fixed; inset: 0; z-index: 9500;
  pointer-events: none;
}
.np-panel.open { pointer-events: all; }

.np-backdrop {
  position: absolute; inset: 0;
  background: rgba(0,0,0,0);
  transition: background 0.45s ease;
}
.np-panel.open .np-backdrop { background: rgba(0,0,0,0.85); }

.np-sheet {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  height: calc(100dvh - var(--player-h));
  background: #0e0e0d;
  border-top: 1px solid rgba(249,21,54,0.25);
  transform: translateY(100%);
  transition: transform 0.48s cubic-bezier(0.23,1,0.32,1);
  display: flex; flex-direction: column;
  overflow: hidden;
}
.np-panel.open .np-sheet { transform: translateY(0); }

/* 닫기 버튼 */
.np-close {
  position: absolute; top: 20px; right: 24px; z-index: 10;
  width: 36px; height: 36px; border-radius: 50%;
  background: rgba(255,255,255,0.06);
  color: #fff; font-size: 14px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}
.np-close:hover { background: var(--red); }

/* ── 2단 레이아웃 ── */
.np-layout {
  display: grid;
  grid-template-columns: 400px 1fr;
  height: 100%;
  overflow: hidden;
}

/* ══ LEFT ══ */
.np-left {
  border-right: 1px solid rgba(255,255,255,0.06);
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  padding: 32px 24px 24px;
  gap: 20px;
  overflow: hidden;
  background: linear-gradient(180deg, #0e0e0d 0%, #120808 100%);
}

/* LP 바이닐 */
.np-vinyl-wrap {
  position: relative;
  width: min(260px, 60%);
  aspect-ratio: 1;
  flex-shrink: 0;
}

.np-vinyl {
  width: 100%; height: 100%;
  border-radius: 50%;
  background:
    repeating-radial-gradient(circle at 50% 50%,
      #1a1a18 0px, #1a1a18 1px,
      #232320 1px, #232320 3px,
      #1c1c1a 3px, #1c1c1a 4px),
    radial-gradient(circle at 50% 50%, #111 0%, #0a0a09 100%);
  box-shadow:
    0 0 0 2px #111,
    0 0 0 4px #2a2a28,
    0 0 0 6px #111,
    0 24px 80px rgba(0,0,0,0.9);
  position: relative;
  animation: npVinylSpin 4s linear infinite paused;
}
.np-vinyl.spinning { animation-play-state: running; }

@keyframes npVinylSpin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}

/* 중앙 라벨 */
.np-label {
  position: absolute; top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  width: 42%; aspect-ratio: 1;
  border-radius: 50%;
  background: var(--red);
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  text-align: center;
  padding: 8px;
  overflow: hidden;
  counter-reset: none;
}
.np-label-brand {
  font-family: var(--font, 'Montserrat', sans-serif);
  font-size: 8px; font-weight: 900; letter-spacing: 0.15em;
  color: rgba(0,0,0,0.5);
  text-transform: uppercase;
}
.np-label-title {
  font-family: var(--font, 'Montserrat', sans-serif);
  font-size: 10px; font-weight: 900; letter-spacing: -0.02em;
  color: #000; line-height: 1.1;
  margin: 2px 0;
  max-width: 90%;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.np-label-side {
  font-size: 7px; font-weight: 700; letter-spacing: 0.12em;
  color: rgba(0,0,0,0.6);
}
.np-label-cat {
  font-size: 6px; color: rgba(0,0,0,0.5);
  letter-spacing: 0.08em; margin-top: 1px;
}
.np-label-tracks {
  font-size: 5.5px; color: rgba(0,0,0,0.45);
  letter-spacing: 0.05em; margin-top: 2px;
  text-align: center; line-height: 1.4;
  max-width: 90%;
  overflow: hidden;
}

/* 메타 정보 */
.np-meta { text-align: center; }
.np-meta-title {
  font-family: var(--font, 'Montserrat', sans-serif);
  font-size: 18px; font-weight: 900;
  letter-spacing: -0.03em; color: #fff;
  margin-bottom: 4px;
}
.np-meta-artist {
  font-size: 12px; color: rgba(255,255,255,0.5);
  margin-bottom: 8px;
}
.np-meta-tag { display: flex; align-items: center; gap: 8px; justify-content: center; }
.np-genre-tag {
  font-size: 10px; font-weight: 700; letter-spacing: 0.1em;
  padding: 2px 8px; border-radius: 2px;
  background: var(--red); color: #fff;
}
.np-year { font-size: 10px; color: rgba(255,255,255,0.3); }

/* 컨트롤 */
.np-controls {
  display: flex; align-items: center; gap: 16px;
}
.np-ctrl {
  color: rgba(255,255,255,0.5); font-size: 16px;
  padding: 8px; border-radius: 50%;
  transition: color 0.2s, background 0.2s;
  cursor: pointer;
}
.np-ctrl:hover { color: #fff; background: rgba(255,255,255,0.07); }
.np-ctrl-play {
  width: 44px; height: 44px; font-size: 18px;
  background: var(--red); color: #fff; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
}
.np-ctrl-play:hover { background: #c50f28; color: #fff; }

/* 프로그레스 */
.np-prog-wrap { width: 100%; }
.np-prog-bar {
  height: 3px; border-radius: 2px;
  background: rgba(255,255,255,0.1);
  cursor: pointer; position: relative;
}
.np-prog-fill {
  height: 100%; border-radius: 2px;
  background: var(--red);
  pointer-events: none;
}
.np-prog-times {
  display: flex; justify-content: space-between;
  font-size: 11px; color: rgba(255,255,255,0.35);
  margin-top: 6px;
}

/* ══ RIGHT ══ */
.np-right {
  display: flex; flex-direction: column;
  overflow: hidden;
}

/* 탭 바 */
.np-tabs {
  display: flex; gap: 0;
  border-bottom: 1px solid rgba(255,255,255,0.07);
  padding: 0 28px;
  flex-shrink: 0;
}
.np-tab {
  font-family: var(--font, 'Montserrat', sans-serif);
  font-size: 12px; font-weight: 700; letter-spacing: 0.05em;
  color: rgba(255,255,255,0.35);
  padding: 20px 16px 18px;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: color 0.2s, border-color 0.2s;
  white-space: nowrap;
}
.np-tab:hover { color: rgba(255,255,255,0.7); }
.np-tab.active { color: #fff; border-bottom-color: var(--red); }

/* 패널 래퍼 */
.np-pane-wrap {
  flex: 1; overflow: hidden; position: relative;
}
.np-pane {
  display: none;
  height: 100%; overflow-y: auto;
  padding: 28px 32px 40px;
  scrollbar-width: thin;
  scrollbar-color: rgba(249,21,54,0.3) transparent;
}
.np-pane::-webkit-scrollbar { width: 4px; }
.np-pane::-webkit-scrollbar-thumb { background: rgba(249,21,54,0.3); border-radius: 2px; }
.np-pane.active { display: block; }

/* 가사 */
.np-lyrics-header {
  margin-bottom: 28px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(255,255,255,0.07);
}
.np-lyrics-track {
  display: block;
  font-family: var(--font, 'Montserrat', sans-serif);
  font-size: clamp(22px, 3vw, 36px); font-weight: 900;
  letter-spacing: -0.03em; color: #fff;
  margin-bottom: 4px;
}
.np-lyrics-artist {
  font-size: 13px; color: rgba(255,255,255,0.4);
}
.np-lyrics-body {
  font-family: var(--font, 'Montserrat', sans-serif);
  font-size: 15px; font-weight: 500;
  line-height: 2.2; color: rgba(255,255,255,0.75);
  white-space: pre-wrap;
  letter-spacing: 0.01em;
}

/* 섹션 라벨 */
.np-pane-label {
  font-size: 10px; font-weight: 700; letter-spacing: 0.12em;
  color: rgba(255,255,255,0.25); text-transform: uppercase;
  margin-bottom: 16px;
}

/* 트랙 목록 */
.np-track-list {
  display: flex; flex-direction: column; gap: 2px;
}
.np-track-item {
  display: grid;
  grid-template-columns: 28px 1fr auto;
  align-items: center; gap: 12px;
  padding: 10px 12px; border-radius: 6px;
  cursor: pointer;
  transition: background 0.15s;
}
.np-track-item:hover { background: rgba(255,255,255,0.05); }
.np-track-item.current { background: rgba(249,21,54,0.1); }
.np-track-item.current .np-ti-num { color: var(--red); }
.np-ti-num {
  font-size: 11px; font-weight: 700;
  color: rgba(255,255,255,0.25); text-align: right;
}
.np-ti-info { min-width: 0; }
.np-ti-title {
  font-size: 13px; font-weight: 600;
  color: #fff;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.np-ti-artist {
  font-size: 11px; color: rgba(255,255,255,0.35);
  margin-top: 1px;
}
.np-ti-dur {
  font-size: 11px; color: rgba(255,255,255,0.3);
  font-variant-numeric: tabular-nums;
  flex-shrink: 0;
}

/* 상세보기 버튼 (미니 플레이어 내) */
.np-detail-btn {
  width: 32px; height: 32px; border-radius: 6px;
  background: rgba(255,255,255,0.06);
  color: rgba(255,255,255,0.5); font-size: 13px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; flex-shrink: 0;
  transition: background 0.2s, color 0.2s;
}
.np-detail-btn:hover { background: rgba(249,21,54,0.2); color: var(--red); }

/* ── 반응형 ── */
@media (max-width: 860px) {
  .np-layout { grid-template-columns: 1fr; grid-template-rows: auto 1fr; }
  .np-left {
    flex-direction: row; flex-wrap: wrap;
    border-right: none; border-bottom: 1px solid rgba(255,255,255,0.06);
    padding: 16px 20px; gap: 16px;
    justify-content: flex-start;
  }
  .np-vinyl-wrap { width: 80px; }
  .np-meta { text-align: left; flex: 1; }
  .np-meta-title { font-size: 14px; }
  .np-controls { gap: 8px; }
  .np-ctrl { font-size: 13px; padding: 6px; }
  .np-ctrl-play { width: 36px; height: 36px; font-size: 14px; }
  .np-prog-wrap { flex-basis: 100%; }
  .np-tabs { padding: 0 16px; overflow-x: auto; scrollbar-width: none; }
  .np-tab { padding: 14px 12px 12px; font-size: 11px; }
  .np-pane { padding: 20px 20px 32px; }
}
`;

  /* ── CSS 삽입 ── */
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  /* ── 패널 DOM 삽입 ── */
  document.body.insertAdjacentHTML('beforeend', panelHTML);

  /* ── 미니 플레이어에 버튼 주입 ── */
  const miniPlayer = document.getElementById('miniPlayer');
  if (miniPlayer) {
    const btn = document.createElement('button');
    btn.className = 'np-detail-btn';
    btn.id = 'npDetailBtn';
    btn.setAttribute('aria-label', '곡 상세보기');
    btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="2" width="12" height="1.2" rx="0.6" fill="currentColor"/>
      <rect x="1" y="5.4" width="8" height="1.2" rx="0.6" fill="currentColor"/>
      <rect x="1" y="8.8" width="10" height="1.2" rx="0.6" fill="currentColor"/>
      <circle cx="11" cy="11" r="2" stroke="currentColor" stroke-width="1.2"/>
      <line x1="12.4" y1="12.4" x2="13.5" y2="13.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
    </svg>`;
    /* 하트 버튼 바로 뒤에 삽입 */
    const likeBtn = miniPlayer.querySelector('.player-like');
    if (likeBtn) likeBtn.insertAdjacentElement('afterend', btn);
    else miniPlayer.appendChild(btn);
    btn.addEventListener('click', openPanel);
  }

  /* ── 요소 참조 ── */
  const panel     = document.getElementById('npPanel');
  const closeBtn  = document.getElementById('npClose');
  const backdrop  = panel.querySelector('.np-backdrop');
  const npVinyl   = document.getElementById('npVinyl');
  const npPlay    = document.getElementById('npPlay');
  const npPrev    = document.getElementById('npPrev');
  const npNext    = document.getElementById('npNext');
  const npProgFill= document.getElementById('npProgFill');
  const npProgBar = panel.querySelector('.np-prog-bar');
  const npCurTime = document.getElementById('npCurTime');
  const npTotalTime = document.getElementById('npTotalTime');
  const tabs      = panel.querySelectorAll('.np-tab');
  const panes     = panel.querySelectorAll('.np-pane');

  let npPlaying = false;
  let npProgress = 38;
  let npTimer = null;

  /* ── 트랙 렌더 ── */
  function renderTrack(idx) {
    const t = TRACKS[idx];
    if (!t) return;
    currentTrack = idx;

    /* 라벨 */
    document.getElementById('npLabelTitle').textContent = t.title;
    document.getElementById('npLabelCat').textContent   = t.label;
    const allTitles = TRACKS.map(x => x.title).join(' · ');
    document.getElementById('npLabelTracks').textContent = allTitles;

    /* 메타 */
    document.getElementById('npMetaTitle').textContent  = t.title;
    document.getElementById('npMetaArtist').textContent = t.artist;
    document.getElementById('npGenreTag').textContent   = t.genre;
    document.getElementById('npYear').textContent       = t.year;

    /* 가사 */
    document.getElementById('npLyricsTrack').textContent  = t.title;
    document.getElementById('npLyricsArtist').textContent = t.artist;
    document.getElementById('npLyricsBody').textContent   = t.lyrics;

    /* 시간 */
    npTotalTime.textContent = t.duration;
    npProgress = 0;
    updateProgress(0);

    /* 플리 현재 트랙 하이라이트 */
    panel.querySelectorAll('.np-track-item').forEach(el => {
      el.classList.toggle('current', parseInt(el.dataset.idx, 10) === idx);
    });
  }

  /* ── 트랙 리스트 생성 ── */
  function buildList(containerId, indices) {
    const ul = document.getElementById(containerId);
    if (!ul) return;
    ul.innerHTML = '';
    indices.forEach((ti, rank) => {
      const t = TRACKS[ti];
      if (!t) return;
      const li = document.createElement('li');
      li.className = 'np-track-item' + (ti === currentTrack ? ' current' : '');
      li.dataset.idx = ti;
      li.innerHTML = `
        <span class="np-ti-num">${rank + 1}</span>
        <div class="np-ti-info">
          <div class="np-ti-title">${t.title}</div>
          <div class="np-ti-artist">${t.artist}</div>
        </div>
        <span class="np-ti-dur">${t.duration}</span>`;
      li.addEventListener('click', () => {
        renderTrack(ti);
        syncMainPlayer();
      });
      ul.appendChild(li);
    });
  }

  function buildAllLists() {
    buildList('npPlaylistList', TRACKS.map((_, i) => i));
    buildList('npRecentList',   RECENT);
    buildList('npLikedList',    LIKED);
    buildList('npPopularList',  POPULAR);
  }

  /* ── 메인 플레이어와 동기화 ── */
  function syncMainPlayer() {
    const pName   = document.getElementById('playerName')   || document.querySelector('.player-name');
    const pArtist = document.getElementById('playerArtist') || document.querySelector('.player-artist');
    const t = TRACKS[currentTrack];
    if (!t) return;
    if (pName)   pName.textContent   = t.title;
    if (pArtist) pArtist.textContent = t.artist;
  }

  /* ── 재생 진행 ── */
  function updateProgress(pct) {
    npProgress = pct;
    npProgFill.style.width = pct + '%';
    const total = TRACKS[currentTrack] ? parseTime(TRACKS[currentTrack].duration) : 228;
    const sec   = Math.floor(total * pct / 100);
    npCurTime.textContent = Math.floor(sec / 60) + ':' + String(sec % 60).padStart(2, '0');
  }
  function parseTime(str) {
    const parts = str.split(':');
    return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
  }

  function startPlay() {
    npPlaying = true;
    npPlay.textContent = '⏸';
    npVinyl.classList.add('spinning');
    const disc = document.getElementById('playerDisc');
    if (disc) disc.classList.add('spinning');
    clearInterval(npTimer);
    npTimer = setInterval(() => {
      npProgress = Math.min(npProgress + 0.05, 100);
      updateProgress(npProgress);
      if (npProgress >= 100) {
        clearInterval(npTimer);
        npPlaying = false;
        npPlay.textContent = '▶';
        npVinyl.classList.remove('spinning');
      }
    }, 100);
  }

  function stopPlay() {
    npPlaying = false;
    npPlay.textContent = '▶';
    npVinyl.classList.remove('spinning');
    clearInterval(npTimer);
  }

  /* ── 패널 열기/닫기 ── */
  function openPanel() {
    buildAllLists();
    renderTrack(currentTrack);
    panel.classList.add('open');
    panel.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closePanel() {
    panel.classList.remove('open');
    panel.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  /* ── 이벤트 ── */
  closeBtn.addEventListener('click', closePanel);
  backdrop.addEventListener('click', closePanel);

  /* ESC */
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && panel.classList.contains('open')) closePanel();
  });

  /* 탭 전환 */
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      panes.forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      const target = document.getElementById('np-' + tab.dataset.tab);
      if (target) target.classList.add('active');
    });
  });

  /* 재생/일시정지 */
  npPlay.addEventListener('click', () => {
    if (npPlaying) stopPlay(); else startPlay();
  });

  /* 이전/다음 */
  npPrev.addEventListener('click', () => {
    const idx = (currentTrack - 1 + TRACKS.length) % TRACKS.length;
    renderTrack(idx); syncMainPlayer();
  });
  npNext.addEventListener('click', () => {
    const idx = (currentTrack + 1) % TRACKS.length;
    renderTrack(idx); syncMainPlayer();
  });

  /* 프로그레스 바 클릭 */
  npProgBar.addEventListener('click', e => {
    const rect = npProgBar.getBoundingClientRect();
    updateProgress(((e.clientX - rect.left) / rect.width) * 100);
  });

  /* 미니 플레이어 디스크/트랙 클릭 → 패널 열기 (있는 경우) */
  const playerTrack = document.getElementById('playerTrack');
  if (playerTrack) {
    playerTrack.addEventListener('click', openPanel);
  }

  /* URL 파라미터에서 트랙 읽기 */
  const urlTrack = parseInt(new URLSearchParams(window.location.search).get('track'), 10);
  if (!isNaN(urlTrack) && urlTrack >= 0 && urlTrack < TRACKS.length) {
    currentTrack = urlTrack;
  }

  /* ── 마퀴 스틸컷 팝업 ──
     transform된 부모(.marquee-track) 안의 position:fixed는 좌표가 틀어지므로
     body에 단일 팝업 레이어를 만들고 hover 시 이미지를 교체한다 */
  const popup = document.createElement('div');
  popup.id = 'marqueePopup';
  popup.style.cssText = [
    'position:fixed', 'z-index:9100', 'pointer-events:none',
    'width:220px', 'height:220px', 'border-radius:12px', 'overflow:hidden',
    'border:1px solid rgba(255,255,255,0.1)',
    'box-shadow:0 24px 64px rgba(0,0,0,0.9),0 0 0 1px rgba(255,255,255,0.04)',
    'background:#111',
    'opacity:0',
    'transition:opacity 0.18s ease, transform 0.18s cubic-bezier(0.23,1,0.32,1)',
    'transform:scale(0.92) translateY(6px)',
    'top:0', 'left:0'
  ].join(';');

  const popupImg = document.createElement('img');
  popupImg.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;';
  popup.appendChild(popupImg);

  const popupLabel = document.createElement('div');
  popupLabel.style.cssText = [
    'position:absolute', 'bottom:0', 'left:0', 'right:0',
    'padding:28px 14px 12px',
    'background:linear-gradient(to top,rgba(0,0,0,0.85) 0%,transparent 100%)',
    'font-size:10px', 'font-weight:700', 'letter-spacing:0.18em',
    'text-transform:uppercase', 'color:rgba(255,255,255,0.8)',
    "font-family:'Montserrat',sans-serif"
  ].join(';');
  popup.appendChild(popupLabel);
  document.body.appendChild(popup);

  const GAP = 18;
  const W = 220, H = 220;

  /* 마퀴 요소(fixed, overflow:hidden) 안에서 애니메이션으로 이동하면
     mouseleave가 발화 안 되는 경우가 있어서 — 전역 mousemove로 보완 */
  const marqueeEl = document.querySelector('.site-marquee');

  function hidePopup() {
    popup.style.opacity   = '0';
    popup.style.transform = 'scale(0.92) translateY(6px)';
  }

  /* 마우스가 마퀴 영역 밖에 있으면 항상 숨김 */
  document.addEventListener('mousemove', e => {
    if (!marqueeEl) return;
    const r = marqueeEl.getBoundingClientRect();
    const inMarquee = e.clientX >= r.left && e.clientX <= r.right &&
                      e.clientY >= r.top  && e.clientY <= r.bottom;
    if (!inMarquee) hidePopup();
  }, { passive: true });

  document.querySelectorAll('.marquee-item-wrap').forEach(wrap => {
    const still = wrap.querySelector('.marquee-still');
    const src   = still ? (still.querySelector('img') || {}).src : null;
    const label = still ? (still.dataset.label || '') : '';

    /* 이미지가 없는 항목은 팝업 없음 */
    if (!src) return;

    wrap.addEventListener('mouseenter', e => {
      /* 마퀴 영역 안에 있을 때만 표시 */
      if (!marqueeEl) return;
      const r = marqueeEl.getBoundingClientRect();
      if (e.clientY < r.top || e.clientY > r.bottom) return;

      popupImg.src = src;
      popupLabel.textContent = label;
      popup.style.opacity   = '1';
      popup.style.transform = 'scale(1) translateY(0)';
    });
    wrap.addEventListener('mouseleave', hidePopup);
    wrap.addEventListener('mousemove', e => {
      /* 마퀴 영역 밖이면 즉시 숨김 */
      if (marqueeEl) {
        const r = marqueeEl.getBoundingClientRect();
        if (e.clientY < r.top || e.clientY > r.bottom) { hidePopup(); return; }
      }
      let x = e.clientX + GAP;
      let y = e.clientY - H - GAP;
      if (x + W > window.innerWidth - 8) x = e.clientX - W - GAP;
      if (y < 8) y = e.clientY + GAP;
      popup.style.left = x + 'px';
      popup.style.top  = y + 'px';
    });
  });

  /* ── 인덱스 카드 3D 마우스 틸트 (preserve-3d 적용) ── */
  document.querySelectorAll('.card-img-block').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width  - 0.5;
      const y = (e.clientY - r.top)  / r.height - 0.5;
      card.style.transition = 'box-shadow 0.5s';
      card.style.transform = `translateZ(10px) rotateX(${-y * 18}deg) rotateY(${x * 18}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transition = 'transform 0.55s cubic-bezier(0.23,1,0.32,1), box-shadow 0.5s';
      card.style.transform  = '';
    });
  });

})();
