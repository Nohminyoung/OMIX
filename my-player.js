/* =====================================================
   OMIX — my-player.js
   커서 / Nav / 플레이어 컨트롤 / 트랙 전환 / 탭 / 좋아요
   좌 패널(확장 플레이어)과 하단 미니 플레이어가 동기화됨
   ===================================================== */


/* =====================================================
   [1] 커스텀 커서
   ===================================================== */
const cursor    = document.getElementById('cursor');
const cursorDot = document.getElementById('cursorDot');
let mx = -100, my = -100;
let cx = -100, cy = -100;

if (cursor && cursorDot) {
  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    cursorDot.style.left = mx + 'px';
    cursorDot.style.top  = my + 'px';
  });
  function animCursor() {
    cx += (mx - cx) * 0.12;
    cy += (my - cy) * 0.12;
    cursor.style.left = cx + 'px';
    cursor.style.top  = cy + 'px';
    requestAnimationFrame(animCursor);
  }
  animCursor();
}


/* =====================================================
   [2] Nav 스크롤 효과
   ===================================================== */
const nav = document.getElementById('nav');
if (nav) {
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  });
}


/* =====================================================
   [3] 트랙 데이터
   플레이리스트 트랙 목록 — 이름, 아티스트, 시간, 이모지, 배경색
   ===================================================== */
/* 기본 10곡은 my-playlist.js(OmixPlaylist.DEFAULTS)에 있다 — 하단 재생목록 패널도 같은 목록을 쓴다 */
const DEFAULT_TRACKS = OmixPlaylist.DEFAULTS.map(fromStored);

/* 플레이리스트 — my-playlist.js 저장소(localStorage)에 순서대로 저장된 곡 목록.
   첫 방문 때 위 기본 10곡이 들어가고, 이후 차트에서 담은 곡·순서 변경·빼기가 그대로 유지된다 */
function toStored(t) {
  return { title: t.name, artist: t.artist, dur: t.time, audioSrc: t.audioSrc, bg: t.bg, emoji: t.emoji, cover: t.cover };
}
function fromStored(t) {
  const [m, s] = (t.dur || '0:00').split(':').map(Number);
  return { name: t.title, artist: t.artist, time: t.dur || '--:--', sec: m * 60 + s || 0,
    emoji: t.emoji || '🎵', bg: t.bg || DEFAULT_TRACKS[0].bg, audioSrc: t.audioSrc,
    /* 차트에서 담은 곡은 커버 경로가 없으니 음원 이름으로 추정 (없으면 이모지로 폴백) */
    cover: t.cover || t.audioSrc.replace(/^music\//, 'covers/').replace(/\.mp3$/, '.jpg') };
}

const TRACKS = (window.OmixPlaylist
  ? OmixPlaylist.seed(DEFAULT_TRACKS.map(toStored))
  : DEFAULT_TRACKS.map(toStored)).map(fromStored);

/* 순서 변경·빼기 후 저장 (QR 트랙은 따로 관리하므로 제외) */
function savePlaylist() {
  window.OmixPlaylist?.set(TRACKS.filter(t => !t.liveId).map(toStored));
}

/* QR로 받은 트랙 — card-overlay.js 가 localStorage('omix_live_tracks')에 저장한 곡을
   TRACKS 뒤에 붙여서 같은 플레이어로 재생한다 (liveId로 식별)
   + 전시 체험 전체 목록(card-list 함수 → R2)을 받아와 합친다. 서버 목록은 전체 공개. */
let MY_LIVE = [];
try { MY_LIVE = JSON.parse(localStorage.getItem('omix_live_tracks') || '[]'); } catch (e) {}
const MY_LIVE_IDS = new Set(MY_LIVE.map(t => t.id));
let LIVE_TRACKS = MY_LIVE.slice();

function toLiveTrack(t) {
  return { name: t.trackName, artist: t.djName, time: '--:--', sec: 0, emoji: 'LIVE',
    bg: 'linear-gradient(135deg, #1a0408 0%, #300a12 50%, #0a0408 100%)', audioSrc: t.audioSrc, liveId: t.id,
    cover: t.cover || '' /* R2 카드로 받은 곡은 카드 사진을 커버로 */ };
}
LIVE_TRACKS.forEach(t => TRACKS.push(toLiveTrack(t)));

/* R2 카드 id(20261122_130020_xxxx) → 'OMIX LIVE · 11/22 13:00' */
function liveLabel(id, createdAt) {
  const m = id.match(/^\d{4}(\d{2})(\d{2})_(\d{2})(\d{2})/);
  if (m) return `OMIX LIVE · ${+m[1]}/${+m[2]} ${m[3]}:${m[4]}`;
  const d = new Date(createdAt);
  return `OMIX LIVE · ${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

/* 실제 오디오 재생 담당 */
const audioEl = new Audio();
audioEl.preload = 'auto';
audioEl.volume = 0.7;


/* =====================================================
   [4] 플레이어 상태
   현재 트랙 인덱스, 재생 여부, 진행률, 셔플/반복 플래그
   ===================================================== */
let currentIdx  = 0;    /* 현재 재생 트랙 인덱스 */
let isPlaying   = false;
let progress    = 0;
let isShuffle   = false;
let isRepeat    = false;


/* =====================================================
   [5] DOM 참조 (좌 패널 + 하단 미니 플레이어)
   ===================================================== */
/* 좌 패널 */
const nowAlbumArt    = document.getElementById('nowAlbumArt');
const nowAlbumImg    = document.getElementById('nowAlbumImg');
const nowAlbumEmoji  = document.getElementById('nowAlbumEmoji');
const nowTrackName   = document.getElementById('nowTrackName');
const nowTrackArtist = document.getElementById('nowTrackArtist');
const nowPlayBtn     = document.getElementById('nowPlayBtn');
const nowPrevBtn     = document.getElementById('nowPrevBtn');
const nowNextBtn     = document.getElementById('nowNextBtn');
const shuffleBtn     = document.getElementById('shuffleBtn');
const repeatBtn      = document.getElementById('repeatBtn');
const nowProgressBar = document.getElementById('nowProgressBar');
const nowProgressFill= document.getElementById('nowProgressFill');
const nowCurrentTime = document.getElementById('nowCurrentTime');
const nowTotalTime   = document.getElementById('nowTotalTime');
const nowLike        = document.getElementById('nowLike');

/* 하단 미니 플레이어 */
const miniPlayBtn    = document.getElementById('playPauseBtn');
const playerDisc     = document.getElementById('playerDisc');
const progressFill   = document.getElementById('progressFill');
const currentTimeEl  = document.getElementById('currentTime');
const totalTimeEl    = document.getElementById('totalTime');
const playerName     = document.getElementById('playerName');
const playerArtist   = document.getElementById('playerArtist');


/* =====================================================
   [6] 트랙 로드 — 현재 트랙 정보를 좌 패널과 미니 플레이어에 반영
   ===================================================== */
function loadTrack(idx, autoplay) {
  const t = TRACKS[idx];
  if (!t) return;
  currentIdx = idx;

  /* 좌 패널 업데이트 */
  if (nowTrackName)   nowTrackName.textContent   = t.name;
  if (nowTrackArtist) nowTrackArtist.textContent = t.artist;
  if (nowTotalTime)   nowTotalTime.textContent   = t.time;
  if (nowAlbumEmoji) {
    nowAlbumEmoji.textContent = t.emoji;
    nowAlbumEmoji.style.background = t.bg;
  }
  /* 트랙별 커버 이미지 — covers/ 폴더에 파일이 있으면 보여주고, 없으면(404) 이모지로 폴백 */
  if (nowAlbumImg) {
    if (t.cover) {
      nowAlbumImg.style.display = 'none';
      /* 체험 카드(세로 2:3)는 아래쪽 기준으로 잘라 인물·하단 정보가 보이게 */
      nowAlbumImg.style.objectPosition = t.liveId ? 'center bottom' : '';
      nowAlbumImg.onerror = () => { nowAlbumImg.style.display = 'none'; };
      nowAlbumImg.onload  = () => { nowAlbumImg.style.display = 'block'; };
      nowAlbumImg.src = t.cover;
    } else {
      nowAlbumImg.style.display = 'none';
    }
  }

  /* 하단 미니 플레이어 업데이트 */
  if (playerName)   playerName.textContent   = t.name;
  if (playerArtist) playerArtist.textContent = t.artist;
  if (totalTimeEl)  totalTimeEl.textContent  = t.time;

  /* 실제 오디오 소스 교체 */
  audioEl.src = t.audioSrc;

  /* 진행률 초기화 */
  progress = 0;
  updateProgressUI();

  /* 플레이리스트에서 현재 트랙 강조 */
  highlightCurrent();

  if (autoplay) {
    setPlayingUI(true);
    /* 다른 페이지에서 넘어온 직후엔 브라우저가 자동재생을 막을 수 있다 → 재생 버튼 상태로 되돌림 */
    audioEl.play().catch(() => setPlayingUI(false));
  } else {
    setPlayingUI(false);
  }
}


/* =====================================================
   [7] 진행률 UI 동기화
   좌 패널 프로그레스 바와 미니 플레이어 프로그레스 바를 동시에 업데이트
   ===================================================== */
function formatTime(pct, totalSec) {
  const sec = Math.floor(totalSec * pct / 100);
  return Math.floor(sec / 60) + ':' + String(sec % 60).padStart(2, '0');
}

function updateProgressUI() {
  /* 좌 패널 */
  if (nowProgressFill) nowProgressFill.style.width = progress + '%';
  const total = audioEl.duration || TRACKS[currentIdx]?.sec || 0;
  if (nowCurrentTime)  nowCurrentTime.textContent  = formatTime(progress, total);

  /* 미니 플레이어 */
  if (progressFill)   progressFill.style.width  = progress + '%';
  if (currentTimeEl)  currentTimeEl.textContent = formatTime(progress, total);
}

/* 곡 길이를 실제 파일 기준으로 표시 (QR 트랙은 길이를 미리 모르므로) */
audioEl.addEventListener('loadedmetadata', () => {
  const total = formatTime(100, audioEl.duration);
  if (nowTotalTime) nowTotalTime.textContent = total;
  if (totalTimeEl)  totalTimeEl.textContent  = total;
});

/* 실제 재생 시간에 맞춰 진행률 동기화 */
audioEl.addEventListener('timeupdate', () => {
  if (!audioEl.duration) return;
  progress = (audioEl.currentTime / audioEl.duration) * 100;
  updateProgressUI();
});

/* 트랙 종료: 반복 모드면 같은 곡 재재생, 아니면 다음 곡 */
audioEl.addEventListener('ended', () => {
  if (isRepeat) {
    audioEl.currentTime = 0;
    audioEl.play().catch(() => {});
  } else {
    nextTrack();
  }
});


/* =====================================================
   [8] 재생 / 정지 토글
   좌 패널 버튼과 미니 플레이어 버튼 모두에서 같은 상태 참조
   ===================================================== */
function setPlayingUI(playing) {
  isPlaying = playing;

  /* 버튼 텍스트 동기화 */
  if (nowPlayBtn)  nowPlayBtn.textContent  = isPlaying ? '⏸' : '▶';
  if (miniPlayBtn) miniPlayBtn.textContent = isPlaying ? '⏸' : '▶';

  /* LP 디스크 회전 */
  if (playerDisc) playerDisc.classList.toggle('spinning', isPlaying);
  /* 앨범아트 글로우 */
  if (nowAlbumArt) nowAlbumArt.classList.toggle('playing', isPlaying);
}

function togglePlay() {
  if (!TRACKS[currentIdx]) return;   /* 플레이리스트를 다 비운 상태 */
  if (!audioEl.src) loadTrack(currentIdx);
  if (audioEl.paused) {
    audioEl.play().catch(() => {});
    setPlayingUI(true);
  } else {
    audioEl.pause();
    setPlayingUI(false);
  }
}

/* 재생 버튼 (좌 패널) */
if (nowPlayBtn)  nowPlayBtn.addEventListener('click',  togglePlay);
/* 재생 버튼 (미니 플레이어) */
if (miniPlayBtn) miniPlayBtn.addEventListener('click', togglePlay);


/* =====================================================
   [9] 다음 곡 / 이전 곡
   셔플 모드면 랜덤 인덱스, 아니면 순차
   ===================================================== */
function nextTrack() {
  if (!TRACKS.length) return;
  const wasPlaying = isPlaying;
  let next;
  if (isShuffle) {
    /* 셔플: 현재 트랙 제외 랜덤 선택 */
    do { next = Math.floor(Math.random() * TRACKS.length); }
    while (next === currentIdx && TRACKS.length > 1);
  } else {
    next = (currentIdx + 1) % TRACKS.length;
  }
  loadTrack(next, wasPlaying);
}

function prevTrack() {
  if (!TRACKS.length) return;
  const wasPlaying = isPlaying;
  const prev = (currentIdx - 1 + TRACKS.length) % TRACKS.length;
  loadTrack(prev, wasPlaying);
}

if (nowPrevBtn)  nowPrevBtn.addEventListener('click', prevTrack);
if (nowNextBtn)  nowNextBtn.addEventListener('click', nextTrack);
document.getElementById('prevBtn')?.addEventListener('click', prevTrack);
document.getElementById('nextBtn')?.addEventListener('click', nextTrack);


/* =====================================================
   [10] 셔플 / 반복 토글
   활성 시 버튼 색상 변경으로 상태 시각화
   ===================================================== */
if (shuffleBtn) {
  shuffleBtn.addEventListener('click', () => {
    isShuffle = !isShuffle;
    shuffleBtn.style.color = isShuffle ? 'var(--red)' : '';
  });
}
if (repeatBtn) {
  repeatBtn.addEventListener('click', () => {
    isRepeat = !isRepeat;
    repeatBtn.style.color = isRepeat ? 'var(--red)' : '';
  });
}


/* =====================================================
   [11] 프로그레스 바 클릭 → 재생 위치 이동
   좌 패널과 미니 플레이어 각각 리스너 등록
   ===================================================== */
function seekTo(pct) {
  progress = pct;
  if (audioEl.duration) audioEl.currentTime = (pct / 100) * audioEl.duration;
  updateProgressUI();
}

if (nowProgressBar) {
  nowProgressBar.addEventListener('click', e => {
    const rect = nowProgressBar.getBoundingClientRect();
    seekTo(((e.clientX - rect.left) / rect.width) * 100);
  });
}
const miniProgressBar = document.getElementById('progressBar');
if (miniProgressBar) {
  miniProgressBar.addEventListener('click', e => {
    const rect = miniProgressBar.getBoundingClientRect();
    seekTo(((e.clientX - rect.left) / rect.width) * 100);
  });
}


/* =====================================================
   [12] 플레이리스트 렌더링 + 편집 (QR 트랙은 우측 칸에 따로)
   행 클릭 → 바로 재생
   ⠿ 손잡이 드래그(마우스·터치) 또는 ↑↓ 키 → 순서 바꾸기
   × → 플레이리스트에서 빼기
   바뀐 순서·목록은 my-playlist.js 저장소에 저장되어 다음 방문에도 유지된다
   ===================================================== */
const playlistBody  = document.getElementById('playlistBody');
const playlistCount = document.getElementById('playlistCount');

function renderPlaylist() {
  if (!playlistBody) return;
  playlistBody.innerHTML = '';
  let count = 0;
  TRACKS.forEach((t, i) => {
    if (t.liveId) return;
    count++;
    const row = document.createElement('div');
    row.className = 'playlist-track';
    row.dataset.track = i;
    row.innerHTML = `
      <button class="pt-drag" aria-label="순서 바꾸기 (끌거나 위아래 방향키)" title="끌어서 순서 바꾸기">⠿</button>
      <span class="pt-num"></span>
      <div class="pt-info">
        <p class="pt-name"></p>
        <p class="pt-artist"></p>
      </div>
      <div class="pt-end">
        <span class="pt-time">${t.time}</span>
        <button class="pt-remove" aria-label="플레이리스트에서 빼기" title="빼기">×</button>
      </div>`;
    row.querySelector('.pt-name').textContent   = t.name;
    row.querySelector('.pt-artist').textContent = t.artist;
    row.addEventListener('click', e => {
      if (e.target.closest('.pt-drag')) return;
      if (e.target.closest('.pt-remove')) removeTrack(i);
      else loadTrack(i, true);
    });
    bindDrag(row);
    playlistBody.appendChild(row);
  });

  if (!count) {
    playlistBody.innerHTML = `
      <div class="pl-empty">
        <p>플레이리스트가 비어 있어요.</p>
        <a href="chart.html">차트에서 곡 담기 →</a>
      </div>`;
  }
  if (playlistCount) playlistCount.textContent = count + ' TRACKS';
  highlightCurrent();
}

/* 새 순서(TRACKS 인덱스 배열)를 적용 — 듣던 곡은 그대로 계속 재생된다 */
function applyOrder(order) {
  const cur  = TRACKS[currentIdx];
  const live = TRACKS.filter(t => t.liveId);
  TRACKS.splice(0, TRACKS.length, ...order.map(i => TRACKS[i]), ...live);
  currentIdx = TRACKS.indexOf(cur);
  savePlaylist();
  renderPlaylist();
}

/* ⠿ 손잡이 — 포인터 드래그로 행을 옮기고, 놓으면 DOM 순서대로 저장 */
function bindDrag(row) {
  const handle = row.querySelector('.pt-drag');

  handle.addEventListener('pointerdown', e => {
    if (e.button !== 0) return;
    e.preventDefault();
    /* 행을 DOM에서 옮기면 손잡이의 포인터 캡처가 풀리므로, 이동·놓기는 document에서 받는다 */
    row.classList.add('dragging');
    let scrollTimer = null;

    const onMove = ev => {
      if (ev.pointerId !== e.pointerId) return;
      /* 포인터가 지나간 행의 중앙을 기준으로 위/아래에 끼워 넣는다 */
      const others = [...playlistBody.querySelectorAll('.playlist-track:not(.dragging)')];
      const before = others.find(r => {
        const b = r.getBoundingClientRect();
        return ev.clientY < b.top + b.height / 2;
      });
      if (before) playlistBody.insertBefore(row, before);
      else playlistBody.appendChild(row);

      /* 목록 위·아래 끝에 가까우면 자동 스크롤 */
      const box = playlistBody.getBoundingClientRect();
      const dir = ev.clientY < box.top + 40 ? -1 : ev.clientY > box.bottom - 40 ? 1 : 0;
      clearInterval(scrollTimer);
      if (dir) scrollTimer = setInterval(() => { playlistBody.scrollTop += dir * 8; }, 16);
    };
    const onUp = ev => {
      if (ev.pointerId !== e.pointerId) return;
      clearInterval(scrollTimer);
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
      document.removeEventListener('pointercancel', onUp);
      row.classList.remove('dragging');
      applyOrder([...playlistBody.querySelectorAll('.playlist-track')].map(r => Number(r.dataset.track)));
    };
    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
    document.addEventListener('pointercancel', onUp);
  });

  /* 키보드: 손잡이에 포커스 후 ↑↓ 로 한 칸씩 이동 */
  handle.addEventListener('keydown', e => {
    if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
    e.preventDefault();
    e.stopPropagation();
    const order = [...playlistBody.querySelectorAll('.playlist-track')].map(r => Number(r.dataset.track));
    const pos   = order.indexOf(Number(row.dataset.track));
    const to    = pos + (e.key === 'ArrowUp' ? -1 : 1);
    if (to < 0 || to >= order.length) return;
    [order[pos], order[to]] = [order[to], order[pos]];
    applyOrder(order);
    playlistBody.querySelectorAll('.pt-drag')[to]?.focus();
  });
}

/* 현재 곡 강조 — 플레이리스트 행과 QR 트랙 행 */
function highlightCurrent() {
  document.querySelectorAll('.playlist-track').forEach((row, n) => {
    const isCur = Number(row.dataset.track) === currentIdx;
    row.classList.toggle('current', isCur);
    row.querySelector('.pt-num').textContent = isCur ? '▶' : String(n + 1).padStart(2, '0');
  });
  const liveId = TRACKS[currentIdx]?.liveId;
  document.querySelectorAll('.live-track').forEach(row => {
    row.classList.toggle('current', !!liveId && row.dataset.liveId === liveId);
  });
}

function removeTrack(idx) {
  const t = TRACKS[idx];
  if (!t || t.liveId) return;
  const wasCurrent = idx === currentIdx;
  TRACKS.splice(idx, 1);
  savePlaylist();
  if (idx < currentIdx) currentIdx--;
  if (wasCurrent) {
    /* 듣던 곡을 뺐으면 그 자리의 다음 곡으로 넘어가고, 남은 곡이 없으면 플레이어를 비운다 */
    const left = TRACKS.filter(x => !x.liveId).length;
    if (left) loadTrack(Math.min(idx, left - 1), isPlaying);
    else clearPlayer();
  }
  renderPlaylist();
}

/* 재생할 곡이 하나도 없을 때 플레이어 표시를 비운다 */
function clearPlayer() {
  audioEl.pause();
  audioEl.removeAttribute('src');
  audioEl.load();
  currentIdx = -1;
  progress   = 0;
  setPlayingUI(false);
  updateProgressUI();
  [nowTrackName, playerName].forEach(el => { if (el) el.textContent = '—'; });
  [nowTrackArtist, playerArtist].forEach(el => { if (el) el.textContent = ''; });
  [nowTotalTime, totalTimeEl].forEach(el => { if (el) el.textContent = '0:00'; });
  if (nowAlbumImg) nowAlbumImg.style.display = 'none';
  if (nowAlbumEmoji) nowAlbumEmoji.textContent = '♪';
}

renderPlaylist();


/* =====================================================
   [13] 저장 트랙 클릭 → 해당 트랙 바로 재생
   플레이리스트 순서가 바뀔 수 있으므로 곡 이름으로 찾는다.
   플레이리스트에서 뺀 곡이면 맨 뒤에 다시 넣고 재생한다
   ===================================================== */
document.querySelectorAll('.saved-track:not(.live-track)').forEach(el => {
  el.addEventListener('click', () => {
    const name = el.querySelector('.saved-track-name')?.textContent.trim();
    let idx = TRACKS.findIndex(t => !t.liveId && t.name === name);
    if (idx < 0) {
      const def = DEFAULT_TRACKS.find(t => t.name === name);
      if (!def) return;
      idx = TRACKS.filter(t => !t.liveId).length;
      TRACKS.splice(idx, 0, { ...def });
      if (currentIdx >= idx) currentIdx++;
      savePlaylist();
      renderPlaylist();
    }
    loadTrack(idx, true);
  });
});


/* =====================================================
   [13-B] QR로 받은 트랙 칸 — 목록 렌더링 + 클릭 재생
   ===================================================== */
/* 차트처럼 순위 번호 · 커버 · 곡명/아티스트 · 날짜 · 재생 표시를 한 줄에.
   최신 체험이 01번. 내가 QR로 받은 곡에는 MY 배지 */
const liveListEl  = document.getElementById('liveTrackList');
const liveEmptyEl = document.getElementById('liveEmpty');
const liveCountEl = document.getElementById('liveCount');

function renderLiveList() {
  if (!liveListEl) return;
  liveListEl.innerHTML = '';
  if (liveEmptyEl) liveEmptyEl.style.display = LIVE_TRACKS.length ? 'none' : '';
  if (liveCountEl) liveCountEl.textContent = LIVE_TRACKS.length ? LIVE_TRACKS.length + ' TRACKS' : '';
  LIVE_TRACKS.forEach((t, i) => {
    const row = document.createElement('div');
    row.className = 'live-track live-chart-row';
    row.dataset.liveId = t.id;
    const d = new Date(t.createdAt);
    row.innerHTML = `
      <span class="live-rank${i < 3 ? ' top' : ''}">${String(i + 1).padStart(2, '0')}</span>
      <div class="live-art">LIVE</div>
      <div class="live-info">
        <p class="live-title"></p>
        <p class="live-artist"></p>
      </div>
      ${MY_LIVE_IDS.has(t.id) ? '<span class="live-badge">MY</span>' : ''}
      <span class="live-date">${isNaN(d) ? '' : `${d.getMonth() + 1}.${d.getDate()}`}</span>
      <span class="live-play" aria-hidden="true">▶</span>`;
    if (t.cover) {
      const art = row.querySelector('.live-art');
      const img = new Image();
      img.alt = '';
      img.loading = 'lazy';
      img.onload = () => { art.textContent = ''; art.appendChild(img); };
      img.src = t.cover;
    }
    row.querySelector('.live-title').textContent  = t.trackName;
    row.querySelector('.live-artist').textContent = t.djName;
    row.addEventListener('click', () => loadTrack(TRACKS.findIndex(x => x.liveId === t.id), true));
    liveListEl.appendChild(row);
  });
  if (typeof highlightCurrent === 'function') highlightCurrent();
}
renderLiveList();

/* 전시 체험 전체 목록 받아오기 — 실패하면(로컬 미리보기 등) 내 기기에 저장된 곡만 보인다 */
/* 법명은 카드 이미지 좌측 상단에 그려져 있어 데이터로는 없다 → live-names.json 에 id 별로 적어 둔다
   { "<id>": { "name": "스카니아", "no": 48, "genre": "HIP-HOP MIX" } } */
async function getJSON(url) {
  try { const r = await fetch(url, { cache: 'no-store' }); return r.ok ? await r.json() : null; }
  catch (e) { return null; }
}

async function loadPublicLive() {
  const [data, names] = await Promise.all([
    getJSON('/.netlify/functions/card-list'),
    getJSON('live-names.json'),
  ]);
  const N = names || {};
  const ok = data && data.mediaBase && Array.isArray(data.cards);
  if (!ok && !names) return;

  const fromServer = !ok ? [] : data.cards.map(c => ({
    id: c.id, trackName: liveLabel(c.id, c.createdAt), djName: 'OMIX 체험 부스',
    audioSrc: `${data.mediaBase}/cards/${c.id}/play.mp4`,
    cover: c.hasCard ? `${data.mediaBase}/cards/${c.id}/card.jpg` : '',
    createdAt: c.createdAt,
  }));
  const serverIds = new Set(fromServer.map(t => t.id));
  /* 서버 목록 + (옛 로컬 서버·데모로 받은) 내 기기에만 있는 곡, 최신순 */
  LIVE_TRACKS = fromServer.concat(MY_LIVE.filter(t => !serverIds.has(t.id)))
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
    .map(t => (N[t.id] && N[t.id].name ? { ...t, djName: N[t.id].name } : t));

  /* TRACKS 의 라이브 부분만 갈아끼우고, 듣던 곡은 그대로 유지 */
  const cur = TRACKS[currentIdx];
  const base = TRACKS.filter(t => !t.liveId);
  TRACKS.splice(0, TRACKS.length, ...base, ...LIVE_TRACKS.map(toLiveTrack));
  if (cur) {
    const i = cur.liveId ? TRACKS.findIndex(t => t.liveId === cur.liveId) : TRACKS.indexOf(cur);
    if (i >= 0) currentIdx = i;
    /* 듣던 곡이 체험 곡이면 바뀐 법명을 바로 반영 */
    const now = TRACKS[currentIdx];
    if (now && now.liveId) {
      if (nowTrackArtist) nowTrackArtist.textContent = now.artist;
      if (playerArtist)   playerArtist.textContent   = now.artist;
    }
  }
  renderLiveList();

  /* ?live=<id> 로 들어왔는데 처음엔 목록에 없던 곡이면 지금 띄운다 */
  const want = new URLSearchParams(location.search).get('live');
  if (want && !(cur && cur.liveId === want)) {
    const i = TRACKS.findIndex(t => t.liveId === want);
    if (i >= 0) loadTrack(i, false);
  }
}


/* =====================================================
   [13-C] 청취 통계 — 실제로 들은 만큼만 기록
   · 재생 1회: 한 곡을 30초 이상(30초보다 짧은 곡은 절반 이상) 들었을 때
   · 청취 시간: 실제 재생된 초만 더한다 (앞으로 건너뛴 구간은 제외)
   · 이번 주(월요일 시작) 기록 + 누적 재생 수를 localStorage에 저장
   ===================================================== */
const STATS_KEY = 'omix_listen_stats';

/* 이번 주 월요일 날짜 'YYYY-MM-DD' — 주가 바뀌면 이번 주 기록을 새로 시작 */
function weekKey() {
  const d = new Date();
  d.setDate(d.getDate() - (d.getDay() + 6) % 7);
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

function loadStats() {
  let st = {};
  try { st = JSON.parse(localStorage.getItem(STATS_KEY) || '{}'); } catch (e) {}
  st.totalPlays = st.totalPlays || 0;
  if (!st.week || st.week.key !== weekKey()) {
    st.week = { key: weekKey(), plays: 0, sec: 0, tracks: [] };
  }
  return st;
}
const stats = loadStats();

function saveStats() {
  try { localStorage.setItem(STATS_KEY, JSON.stringify(stats)); } catch (e) {}
}

/* 시·분만 표시: 3h 42m · 12m · 0m */
function formatListenTime(sec) {
  const h = Math.floor(sec / 3600), m = Math.floor(sec % 3600 / 60);
  return h ? `${h}h ${m}m` : `${m}m`;
}

const statWeekEl   = document.getElementById('statWeek');
const statPlaysEl  = document.getElementById('statPlays');
const statTimeEl   = document.getElementById('statTime');
const statTracksEl = document.getElementById('statTracks');

function renderStats() {
  if (stats.week.key !== weekKey()) {   /* 페이지를 켜둔 채 주가 바뀐 경우 */
    stats.week = { key: weekKey(), plays: 0, sec: 0, tracks: [] };
  }
  if (statWeekEl)   statWeekEl.textContent   = stats.week.plays;
  if (statPlaysEl)  statPlaysEl.textContent  = stats.totalPlays;
  if (statTimeEl)   statTimeEl.textContent   = formatListenTime(stats.week.sec);
  if (statTracksEl) statTracksEl.textContent = stats.week.tracks.length + '곡';
}

/* 현재 곡에서 들은 시간 추적 */
let listenedOnTrack = 0;     /* 이번 재생에서 실제로 들은 초 */
let countedOnTrack  = false; /* 이번 재생이 이미 1회로 집계됐는지 */
let lastPos         = 0;
let unsavedSec      = 0;
/* 듣고 있는 곡의 음원·길이 — 곡이 끝나면 다음 곡으로 먼저 넘어가므로 따로 기억해 둔다 */
let listenSrc = '';
let listenDur = 0;

function resetTrackListen() {
  listenedOnTrack = 0;
  countedOnTrack  = false;
  lastPos         = audioEl.currentTime || 0;
}

function countPlayIfDue() {
  if (countedOnTrack || !listenDur) return;
  if (listenedOnTrack < Math.min(30, listenDur / 2)) return;
  countedOnTrack = true;
  stats.totalPlays++;
  stats.week.plays++;
  if (!stats.week.tracks.includes(listenSrc)) stats.week.tracks.push(listenSrc);
  saveStats();
  renderStats();
}

audioEl.addEventListener('loadstart', resetTrackListen);   /* 다른 곡으로 바뀜 */
audioEl.addEventListener('loadedmetadata', () => {
  listenSrc = audioEl.currentSrc || audioEl.src;
  listenDur = audioEl.duration;
});
audioEl.addEventListener('seeked', () => { lastPos = audioEl.currentTime; });
audioEl.addEventListener('timeupdate', () => {
  const pos = audioEl.currentTime;
  const d = pos - lastPos;
  lastPos = pos;
  /* 정상 재생 중의 작은 진행만 인정 — 건너뛰기(큰 점프)·되감기는 제외 */
  if (audioEl.paused || d <= 0 || d > 1.5) return;
  listenedOnTrack += d;
  stats.week.sec  += d;
  unsavedSec      += d;
  if (unsavedSec >= 5) { unsavedSec = 0; saveStats(); }
  countPlayIfDue();
  renderStats();
});
/* 곡이 끝나면 정리 — 반복 재생 시 다음 회차를 새로 센다 */
audioEl.addEventListener('ended', () => {
  countPlayIfDue();
  saveStats();
  resetTrackListen();
  lastPos = 0;
});
audioEl.addEventListener('pause', saveStats);
window.addEventListener('pagehide', saveStats);

renderStats();


/* =====================================================
   [14] QUEUE / HISTORY 탭 전환
   탭 클릭 시 해당 콘텐츠 표시 (History는 현재 같은 목록 사용)
   ===================================================== */
const tabs = document.querySelectorAll('.playlist-tab');
tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    /* 현재 버전: Queue와 History 모두 같은 트랙 리스트 표시 */
  });
});


/* =====================================================
   [15] 좋아요 버튼 (좌 패널)
   ♡ ↔ ♥ 토글, .liked 클래스로 색상 전환
   ===================================================== */
if (nowLike) {
  nowLike.addEventListener('click', () => {
    const liked = nowLike.textContent === '♡';
    nowLike.textContent = liked ? '♥' : '♡';
    nowLike.classList.toggle('liked', liked);
  });
}

/* 미니 플레이어 좋아요 */
const globalLike = document.getElementById('globalLike');
if (globalLike) {
  globalLike.addEventListener('click', () => {
    const liked = globalLike.textContent === '♡';
    globalLike.textContent = liked ? '♥' : '♡';
    globalLike.style.color = liked ? 'var(--red)' : '';
  });
}

/* 볼륨 — 좌 패널 볼륨과 하단 미니 플레이어 볼륨이 같은 값으로 실제 오디오를 조절한다.
   (빨간 채움 · 스피커 아이콘 · 음소거 토글은 player-ui.js) */
const volSliders = document.querySelectorAll('.vol-slider');
volSliders.forEach(slider => {
  slider.addEventListener('input', () => {
    audioEl.volume = slider.value / 100;
    volSliders.forEach(other => { if (other !== slider) other.value = slider.value; });
  });
});


/* =====================================================
   [16] 모바일 햄버거 메뉴
   ===================================================== */
const hamburger = document.getElementById('hamburger');
const navLinks  = document.querySelector('.nav-menu');

if (hamburger) {
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    if (navLinks) navLinks.classList.toggle('mobile-open');
  });
}


/* =====================================================
   [17] 초기 로드
   페이지 진입 시 첫 번째 트랙 로드
   ===================================================== */
/* 카드의 'My Player에서 보기'(?live=<id>)로 들어오면 받은 곡을 바로 띄운다 */
/* 차트 토스트의 'My Player에서 듣기'(?play=<음원 경로>)로 들어오면 그 곡을 바로 재생한다 */
const params    = new URLSearchParams(location.search);
const liveParam = params.get('live');
const playParam = params.get('play');
const liveIdx   = TRACKS.findIndex(t => t.liveId && t.liveId === liveParam);
const playIdx   = playParam ? TRACKS.findIndex(t => t.audioSrc === playParam) : -1;
if (!TRACKS.length) clearPlayer();
else if (playIdx >= 0) loadTrack(playIdx, true);
else loadTrack(liveIdx >= 0 ? liveIdx : currentIdx);
loadPublicLive();


/* =====================================================
   [18] 하단 재생목록 패널(now-playing-panel.js) 연동
   패널의 My Playlist 탭에서 곡 재생·빼기·순서 변경을 하면 이 창구로 바로 반영된다
   ===================================================== */
window.OmixMyPlayer = {
  currentSrc: () => (TRACKS[currentIdx] && !TRACKS[currentIdx].liveId ? TRACKS[currentIdx].audioSrc : ''),
  playSrc(src) {
    const i = TRACKS.findIndex(t => !t.liveId && t.audioSrc === src);
    if (i < 0) return;
    if (i === currentIdx && isPlaying) return;
    if (i === currentIdx && audioEl.src) { audioEl.play().then(() => setPlayingUI(true)).catch(() => {}); return; }
    loadTrack(i, true);
  },
  /* 패널이 저장소를 바꾼 뒤 호출 — 듣던 곡은 그대로 이어서 재생한다 */
  reload() {
    const cur    = TRACKS[currentIdx];
    const oldIdx = currentIdx;
    const live   = TRACKS.filter(t => t.liveId);
    TRACKS.splice(0, TRACKS.length, ...OmixPlaylist.get().map(fromStored), ...live);
    let i = cur ? TRACKS.indexOf(cur) : -1;
    if (i < 0 && cur) i = TRACKS.findIndex(t => !t.liveId && t.audioSrc === cur.audioSrc);
    if (i >= 0) currentIdx = i;
    else if (cur) {
      const left = TRACKS.filter(t => !t.liveId).length;
      if (left) loadTrack(Math.min(oldIdx, left - 1), isPlaying);
      else clearPlayer();
    }
    renderPlaylist();
  }
};


/* =====================================================
   개발자 콘솔 메시지
   ===================================================== */
console.log('%cOMIX MY PLAYER 🎧 나의 음악 다시 듣기', 'color:#F91536;font-size:16px;font-weight:700;');
