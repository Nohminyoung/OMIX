/* =====================================================
   OMIX — chart.js  (리뉴얼)
   [1] 커서  [2] Nav  [3] 파티클
   [4] 트랙 데이터
   [5] 스트립 빌드 (가로 스크롤 카드)
   [6] 스트립 드래그 스크롤
   [7] 차트 리스트 빌드
   [8] 필터 (장르 + 정렬)
   [9] 재생 연동
   [10] 미니 플레이어
   [11] 모바일 햄버거
   ===================================================== */


/* =====================================================
   [1] 커스텀 커서
   ===================================================== */
const cursor    = document.getElementById('cursor');
const cursorDot = document.getElementById('cursorDot');
let mx = -100, my = -100, cx = -100, cy = -100;

if (cursor && cursorDot) {
  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    cursorDot.style.left = mx + 'px';
    cursorDot.style.top  = my + 'px';
  });
  (function animCursor() {
    cx += (mx - cx) * 0.12;
    cy += (my - cy) * 0.12;
    cursor.style.left = cx + 'px';
    cursor.style.top  = cy + 'px';
    requestAnimationFrame(animCursor);
  })();
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
   [3] 파티클 캔버스 (스트립 배경에서는 없으므로 hero 없음)
   ===================================================== */


/* =====================================================
   [4] 트랙 데이터
   ===================================================== */
/* 앨범아트 그라디언트 팔레트 — 레드 / 퍼플 두 컬러만 사용 */
const GRADS = [
  ['#F91536','#7a0c1b'],   /* 딥 레드 */
  ['#A647FF','#4a1d9e'],   /* 퍼플 */
  ['#F91536','#A647FF'],   /* 레드→퍼플 */
  ['#b40f28','#0C0C0B'],   /* 다크 레드 */
  ['#7C3AED','#1e0533'],   /* 다크 퍼플 */
  ['#F91536','#5b0099'],   /* 레드→딥퍼플 */
  ['#A647FF','#F91536'],   /* 퍼플→레드 (역순) */
  ['#6d0019','#A647FF'],   /* 다크레드→퍼플 */
  ['#F91536','#7a0c1b'],   /* 딥 레드 (반복) */
  ['#A647FF','#4a1d9e'],   /* 퍼플 (반복) */
];

/* 장르 레이블 → CSS 클래스 & 표시명 */
const GENRE_LABEL = {
  club:'CLUB', mindful:'MINDFUL', dance:'DANCE', meditation:'MEDITATION',
  ambient:'AMBIENT', healing:'HEALING', electronic:'ELECTRONIC', world:'WORLD'
};

/* 순위 변동 데이터 (양수=상승, 0=유지, 음수=하락) */
const TRENDS = [3,0,-1,2,0,1,-2,0,4,-1,2,0,-3,1,0,-1,2,0,1,-2,3,0,-1];

/* 전체 트랙 */
const ALL_TRACKS = [
  { rank:1,  title:'Han Groove Riot',   artist:'OMIX Studio',             genre:'dance',      dur:'2:57', plays:'32K',  g:0, audioSrc:'music/Han%20Groove%20Riot.mp3', detailIdx:14 },
  { rank:2,  title:'Karma Game',        artist:'OMIX Studio',             genre:'electronic', dur:'5:00', plays:'29K',  g:1, audioSrc:'music/Karma%20Game.mp3', detailIdx:15 },
  { rank:3,  title:'Mix Attack',        artist:'OMIX Studio',             genre:'club',       dur:'2:56', plays:'26K',  g:2, audioSrc:'music/Mix%20Attack.mp3', detailIdx:16 },
  { rank:4,  title:'No Score, Just Soul', artist:'OMIX Studio',           genre:'healing',    dur:'5:01', plays:'23K',  g:3, audioSrc:'music/No%20Score,%20Just%20Soul.mp3', detailIdx:17 },
  { rank:5,  title:'Temple Echo Loop',  artist:'OMIX Studio',             genre:'ambient',    dur:'4:09', plays:'20K',  g:4, audioSrc:'music/Temple%20Echo%20Loop.mp3', detailIdx:18 },
  { rank:6,  title:'공즉',              artist:'OMIX Studio',             genre:'meditation', dur:'2:53', plays:'17K',  g:5, audioSrc:'music/공즉.mp3', detailIdx:19 },
  { rank:7,  title:'무명등',            artist:'OMIX Studio',             genre:'mindful',    dur:'2:55', plays:'14K',  g:6, audioSrc:'music/무명등.mp3', detailIdx:20 },
  { rank:8,  title:'사계윤회',          artist:'OMIX Studio',             genre:'world',      dur:'2:30', plays:'11K',  g:7, audioSrc:'music/사계윤회.mp3', detailIdx:21 },
  { rank:9,  title:'업보 Bounce',       artist:'OMIX Studio',             genre:'dance',      dur:'3:14', plays:'8K',   g:8, audioSrc:'music/업보%20Bounce.mp3', detailIdx:22 },
  { rank:10, title:'파도에 맡겨',       artist:'OMIX Studio',             genre:'healing',    dur:'4:09', plays:'5K',   g:9, audioSrc:'music/파도에%20맡겨.mp3', detailIdx:23 },
  { rank:11, title:'Silent Thunder',    artist:'DJ Haein × OMIX Studio',  genre:'club',       dur:'2:46', plays:'1.8M', g:4, audioSrc:'music/Silent%20Thunder.mp3', detailIdx:12 },
  { rank:12, title:'Dharma Lights',     artist:'DJ Haein × OMIX Studio',  genre:'dance',      dur:'1:55', plays:'1.4M', g:2, audioSrc:'music/Dharma%20Lights.mp3',  detailIdx:13 },
  { rank:13, title:'Void Mandala',      artist:'DJ Haein × OMIX Studio', genre:'club',       dur:'3:48', plays:'1.2M', g:0, detailIdx:0 },
  { rank:14, title:'108 Bells',         artist:'Samsara Sound',           genre:'mindful',    dur:'4:21', plays:'987K', g:1, detailIdx:1 },
  { rank:15, title:'Lotus Drop',        artist:'OMIX Collective',         genre:'dance',      dur:'5:02', plays:'876K', g:2, detailIdx:2 },
  { rank:16, title:'Temple Bass',       artist:'DJ Haein',                genre:'club',       dur:'3:55', plays:'754K', g:3, detailIdx:3 },
  { rank:17, title:'Nirvana Beat',      artist:'Zero Point × Dharma',     genre:'meditation', dur:'6:15', plays:'612K', g:4, detailIdx:4 },
  { rank:18, title:'Dharma Flow',       artist:'Studio OMIX',             genre:'mindful',    dur:'4:44', plays:'541K', g:5, detailIdx:5 },
  { rank:19, title:'Sacred Groove',     artist:'Haein × Karma',           genre:'dance',      dur:'5:18', plays:'489K', g:6, detailIdx:6 },
  { rank:20, title:'Bodhi Bass',        artist:'DJ Sangha',               genre:'club',       dur:'3:39', plays:'423K', g:7, detailIdx:7 },
  { rank:21, title:'Breath of Sutra',   artist:'Mindwave',                genre:'meditation', dur:'7:02', plays:'387K', g:8, detailIdx:8 },
  { rank:22, title:'Crystal Stupa',     artist:'OMIX ft. Zen',            genre:'mindful',    dur:'4:55', plays:'341K', g:9, detailIdx:9 },
  { rank:23, title:'Karma Kicks',       artist:'DJ Haein',                genre:'club',       dur:'3:22', plays:'312K', g:0 },
  { rank:24, title:'Sangha Sessions',   artist:'Collective OM',           genre:'dance',      dur:'5:40', plays:'287K', g:1 },
  { rank:25, title:'Empty Sky',         artist:'Zero Point',              genre:'meditation', dur:'8:10', plays:'254K', g:2 },
  { rank:26, title:'Mandala Drops',     artist:'Studio OMIX',             genre:'mindful',    dur:'4:31', plays:'231K', g:3 },
  { rank:27, title:'Five Skandhas',     artist:'OMIX Collective',         genre:'dance',      dur:'5:55', plays:'214K', g:4 },
  { rank:28, title:'Bell Tower',        artist:'Samsara Sound',           genre:'mindful',    dur:'3:48', plays:'198K', g:5 },
  { rank:29, title:'Red Lotus',         artist:'DJ Haein × Studio',       genre:'club',       dur:'4:07', plays:'178K', g:6 },
  { rank:30, title:'Night Dharma',      artist:'Karma Wave',              genre:'meditation', dur:'6:30', plays:'162K', g:7 },
  { rank:31, title:'Seven Factors',     artist:'OMIX Studio',             genre:'dance',      dur:'5:12', plays:'148K', g:8 },
  { rank:32, title:'Return to Source',  artist:'DJ Haein',                genre:'mindful',    dur:'4:58', plays:'134K', g:9 },
  { rank:33, title:'Om Bassline',       artist:'Dharma Drop',             genre:'club',       dur:'3:31', plays:'122K', g:2 },
  { rank:34, title:'Wheel of Sound',    artist:'Zero Point',              genre:'dance',      dur:'5:03', plays:'114K', g:1 },
  { rank:35, title:'Koan Reverb',       artist:'OMIX ft. Seon',           genre:'meditation', dur:'9:00', plays:'98K',  g:0 },
  { rank:36, title:'Deep Stillness',    artist:'OMIX Ambient',            genre:'ambient',    dur:'8:22', plays:'87K',  g:1 },
  { rank:37, title:'Cloud Temple',      artist:'Sky Monk',                genre:'ambient',    dur:'9:15', plays:'79K',  g:5 },
  { rank:38, title:'Morning Chant',     artist:'Healing Waves',           genre:'healing',    dur:'5:45', plays:'72K',  g:3 },
  { rank:39, title:'Five Elements',     artist:'Sound Garden',            genre:'healing',    dur:'4:55', plays:'65K',  g:7 },
  { rank:40, title:'Binary Dharma',     artist:'DJ Circuit',              genre:'electronic', dur:'4:10', plays:'58K',  g:6 },
  { rank:41, title:'Pulse Sutra',       artist:'Electronic Dharma',       genre:'electronic', dur:'3:58', plays:'51K',  g:4 },
  { rank:42, title:'Gamelan Mandala',   artist:'OMIX × Bali Collective',  genre:'world',      dur:'7:12', plays:'44K',  g:9 },
  { rank:43, title:'Sacred Patterns',   artist:'World Collective',        genre:'world',      dur:'6:33', plays:'38K',  g:2 },
];

/* 현재 필터·정렬 상태 */
let activeGenre = 'all';
let activeSort  = 'rank';
let playingIdx  = -1;   /* 현재 재생 중인 트랙 인덱스 (필터된 배열 기준) */


/* =====================================================
   [5] 필터·정렬 적용된 트랙 목록 반환
   ===================================================== */
function getFiltered() {
  let list = activeGenre === 'all'
    ? [...ALL_TRACKS]
    : ALL_TRACKS.filter(t => t.genre === activeGenre);

  if (activeSort === 'plays') {
    /* 재생수: 숫자 추출 후 내림차순 */
    list.sort((a, b) => parsePlays(b.plays) - parsePlays(a.plays));
  } else if (activeSort === 'duration') {
    /* 길이: 초 단위 변환 후 내림차순 */
    list.sort((a, b) => parseDur(b.dur) - parseDur(a.dur));
  }
  /* rank는 기본 순서 (ALL_TRACKS 이미 정렬됨) */
  return list;
}

/* "1.2M" → 1200000, "987K" → 987000 */
function parsePlays(str) {
  if (str.endsWith('M')) return parseFloat(str) * 1e6;
  if (str.endsWith('K')) return parseFloat(str) * 1e3;
  return parseFloat(str);
}
/* "3:48" → 228 */
function parseDur(str) {
  const [m, s] = str.split(':').map(Number);
  return m * 60 + s;
}


/* =====================================================
   [6] 가로 스크롤 카드 스트립 빌드
   ===================================================== */
const stripEl = document.getElementById('chartStrip');

function buildStrip() {
  if (!stripEl) return;
  const tracks = getFiltered();
  stripEl.innerHTML = '';

  tracks.forEach((t, i) => {
    const [c1, c2] = GRADS[t.g];
    const rankCls = t.rank === 1 ? 'top-1' : t.rank === 2 ? 'top-2' : t.rank === 3 ? 'top-3' : '';

    const card = document.createElement('div');
    card.className = `strip-card${i === playingIdx ? ' playing' : ''}`;
    card.dataset.idx  = i;
    card.dataset.rank = t.rank;

    card.innerHTML = `
      <div class="sc-frame-wrap">
        <div class="sc-frame"><span class="sc-frame-dot"></span></div>
        <div class="sc-disc">
          <div class="sc-art" style="background:linear-gradient(135deg,${c1} 0%,${c2} 100%)"></div>
          <div class="sc-grooves"></div>
          <div class="sc-label-ring">
            <span class="sc-rank-num ${rankCls}">${t.rank}</span>
          </div>
          <div class="sc-hole"></div>
          <div class="sc-play-overlay"><div class="sc-play-icon">▶</div></div>
        </div>
        <div class="sc-card-label">
          <span class="sc-card-week">2026 WK.20</span>
          <p class="sc-card-title">${t.title}</p>
        </div>
      </div>
      <div class="sc-info">
        <p class="sc-artist">${t.artist}</p>
        <span class="sc-genre genre-tag ${t.genre}">${GENRE_LABEL[t.genre]}</span>
      </div>`;

    card.addEventListener('click', (e) => {
      /* Ctrl/Cmd+click or middle-click → open in new tab */
      if (e.ctrlKey || e.metaKey || e.button === 1) {
        window.open(`song-detail.html?track=${t.detailIdx ?? (t.rank - 1)}`, '_blank');
      } else {
        window.location.href = `song-detail.html?track=${t.detailIdx ?? (t.rank - 1)}`;
      }
    });
    stripEl.appendChild(card);
  });
}


/* =====================================================
   [7] 표준 차트 리스트 빌드 — 장르별 섹션 구조
   ===================================================== */
const listEl    = document.getElementById('chartList');
const countEl   = document.getElementById('filterTrackCount');

/* 트랙 한 행 생성 */
function buildRow(t, i) {
  const [c1, c2] = GRADS[t.g];
  const trend     = TRENDS[t.rank - 1] ?? 0;
  const trendHtml = trend > 0
    ? `<span class="track-trend up">▲${trend}</span>`
    : trend < 0
      ? `<span class="track-trend down">▼${Math.abs(trend)}</span>`
      : `<span class="track-trend same">—</span>`;

  const rankCls = t.rank === 1 ? 'gold' : t.rank === 2 ? 'silver' : t.rank === 3 ? 'bronze' : '';
  const isPlay  = i === playingIdx;

  const row = document.createElement('div');
  row.className = `chart-track-row${isPlay ? ' playing' : ''}`;
  row.dataset.idx = i;

  row.innerHTML = `
    <div class="track-rank">
      <span class="track-rank-num ${rankCls}">${t.rank}</span>
      ${trendHtml}
    </div>
    <div class="track-art" style="background:linear-gradient(135deg,${c1} 0%,${c2} 100%)">
      <div class="track-art-playing">▶</div>
    </div>
    <div class="track-info">
      <p class="track-title">${t.title}</p>
      <p class="track-artist">${t.artist}</p>
    </div>
    <div class="track-genre-wrap">
      <span class="genre-tag ${t.genre}">${GENRE_LABEL[t.genre]}</span>
    </div>
    <span class="track-plays">${t.plays}</span>
    <span class="track-dur">${t.dur}</span>
    <button class="track-play-btn" aria-label="재생">${isPlay ? '⏸' : '▶'}</button>`;

  row.addEventListener('click', (e) => {
    /* If clicking the play button, just play — don't navigate */
    if (e.target.classList.contains('track-play-btn')) {
      playTrack(i);
      return;
    }
    if (e.ctrlKey || e.metaKey || e.button === 1) {
      window.open(`song-detail.html?track=${t.detailIdx ?? (t.rank - 1)}`, '_blank');
    } else {
      window.location.href = `song-detail.html?track=${t.detailIdx ?? (t.rank - 1)}`;
    }
  });
  return row;
}

function buildList() {
  if (!listEl) return;
  const tracks = getFiltered();
  listEl.innerHTML = '';

  if (countEl) countEl.textContent = tracks.length + ' TRACKS';

  /* 장르로 섹션을 나누지 않고, 활성 정렬 기준(순위/재생수/길이) 순서 그대로 한 줄로 표시 */
  tracks.forEach((t, i) => listEl.appendChild(buildRow(t, i)));
}


/* =====================================================
   [8] 전체 화면 재렌더링
   ===================================================== */
function render() {
  buildStrip();
  buildList();
}


/* =====================================================
   [9] 장르 필터 탭
   ===================================================== */
document.getElementById('genreFilterGroup')
  ?.querySelectorAll('.filter-chip')
  .forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#genreFilterGroup .filter-chip')
        .forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeGenre = btn.dataset.genre;
      playingIdx  = -1;   /* 필터 변경 시 재생 초기화 */
      render();
    });
  });


/* =====================================================
   [10] 정렬 필터 탭
   ===================================================== */
document.getElementById('sortFilterGroup')
  ?.querySelectorAll('.filter-chip')
  .forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#sortFilterGroup .filter-chip')
        .forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeSort = btn.dataset.sort;
      playingIdx = -1;
      render();
    });
  });


/* =====================================================
   [11] 스트립 드래그 + 휠 스크롤
   드래그: 이동량 × 0.8 (과도한 가속 방지)
   마우스 휠: deltaY를 가로 스크롤로 전환, 속도 0.5배 감속
   ===================================================== */
(function () {
  const strip = document.getElementById('chartStrip');
  if (!strip) return;

  let isDown  = false;
  let startX  = 0;
  let scrollL = 0;

  /* 드래그 스크롤 */
  strip.addEventListener('mousedown', e => {
    isDown  = true;
    startX  = e.pageX - strip.offsetLeft;
    scrollL = strip.scrollLeft;
    strip.style.userSelect = 'none';
  });
  document.addEventListener('mouseup', () => {
    isDown = false;
    if (stripEl) strip.style.userSelect = '';
  });
  strip.addEventListener('mousemove', e => {
    if (!isDown) return;
    e.preventDefault();
    const x    = e.pageX - strip.offsetLeft;
    const walk = (x - startX) * 0.8;
    strip.scrollLeft = scrollL - walk;
  });

  /* 마우스 휠 → 가로 스크롤 변환 (속도 절반으로 감속) */
  strip.addEventListener('wheel', e => {
    e.preventDefault();
    strip.scrollLeft += e.deltaY * 0.5;
  }, { passive: false });
})();


/* =====================================================
   [12] 재생 트랙 처리
   playingIdx 업데이트 → 스트립+리스트 재렌더 + 미니 플레이어
   ===================================================== */
const playerNameEl   = document.getElementById('playerName');
const playerArtistEl = document.getElementById('playerArtist');
const playerDisc     = document.getElementById('playerDisc');
const playPauseBtn   = document.getElementById('playPauseBtn');
const progressFill   = document.getElementById('progressFill');
const currentTimeEl  = document.getElementById('currentTime');
const totalTimeEl    = document.getElementById('totalTime');
const progressBar    = document.getElementById('progressBar');

let isPlaying = false;
let progress  = 0;
let totalSec  = 228;
let playerTimer;
let currentAudio = null;   /* audioSrc가 있는 트랙일 때 실제 재생을 담당하는 Audio 인스턴스 */
let volumeLevel  = 0.7;    /* 볼륨 슬라이더 값(0~1) — 실제 오디오 트랙에 적용 */

/* audioSrc가 있는 트랙: 실제 파일 재생 + 진행바를 재생 시간에 동기화 */
function startRealAudio(t) {
  const audio = new Audio(t.audioSrc);
  audio.volume = volumeLevel;
  currentAudio = audio;
  audio.addEventListener('loadedmetadata', () => {
    totalSec = audio.duration;
    if (totalTimeEl) totalTimeEl.textContent = fmtTime(100, totalSec);
  });
  audio.addEventListener('timeupdate', () => {
    if (!audio.duration) return;
    progress = audio.currentTime / audio.duration * 100;
    if (progressFill)  progressFill.style.width  = progress + '%';
    if (currentTimeEl) currentTimeEl.textContent = fmtTime(progress, audio.duration);
    syncLyrics(progress);
  });
  audio.addEventListener('ended', () => {
    isPlaying = false;
    if (playPauseBtn) playPauseBtn.textContent = '▶';
    if (playerDisc)   playerDisc.classList.remove('spinning');
  });
  audio.play().catch(() => {});
}

/* audioSrc가 없는 트랙: 기존 방식대로 진행바만 타이머로 흉내 */
function startFakeSim(t) {
  const [m, s] = t.dur.split(':').map(Number);
  totalSec = m * 60 + s;
  if (totalTimeEl) totalTimeEl.textContent = t.dur;
  playerTimer = setInterval(() => {
    progress = Math.min(progress + 0.05, 100);
    if (progressFill)  progressFill.style.width  = progress + '%';
    if (currentTimeEl) currentTimeEl.textContent = fmtTime(progress, totalSec);
    syncLyrics(progress);
    if (progress >= 100) {
      clearInterval(playerTimer);
      isPlaying = false;
      if (playPauseBtn) playPauseBtn.textContent = '▶';
      if (playerDisc)   playerDisc.classList.remove('spinning');
    }
  }, 100);
}

/* 트랙 전환 시 이전 재생 수단(진짜 오디오 or 가짜 타이머) 정리 */
function stopPlayback() {
  clearInterval(playerTimer);
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
}

function fmtTime(pct, sec) {
  const s = Math.floor(sec * pct / 100);
  return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
}

/* 패널 플레이리스트에서 직접 호출 — ALL_TRACKS 기준 */
function playTrackDirect(t, allIdx) {
  stopPlayback();
  playingIdx = -1;   /* 필터 기반 idx 초기화 */
  isPlaying  = true;
  progress   = 0;
  if (playerNameEl)   playerNameEl.textContent   = t.title;
  if (playerArtistEl) playerArtistEl.textContent = t.artist;
  if (playPauseBtn)  playPauseBtn.textContent  = '⏸';
  if (playerDisc)    playerDisc.classList.add('spinning');
  if (progressFill)  progressFill.style.width  = '0%';
  if (currentTimeEl) currentTimeEl.textContent = '0:00';

  if (t.audioSrc) startRealAudio(t);
  else startFakeSim(t);
}

function playTrack(idx) {
  const tracks = getFiltered();
  const t = tracks[idx];
  if (!t) return;

  /* 같은 트랙 재클릭 → 일시정지 토글 */
  if (idx === playingIdx) {
    togglePlay();
    return;
  }

  /* 새 트랙 재생 */
  stopPlayback();
  playingIdx = idx;
  isPlaying  = true;
  progress   = 0;

  /* 미니 플레이어 정보 업데이트 */
  if (playerNameEl)   playerNameEl.textContent   = t.title;
  if (playerArtistEl) playerArtistEl.textContent = t.artist;
  /* 패널 열려 있으면 플레이리스트 active 상태 + 가사 업데이트 */
  if (panelOpen) {
    refreshPanelActive(idx);
    showPanelLyrics(t);
  }
  if (playPauseBtn)  playPauseBtn.textContent  = '⏸';
  if (playerDisc)    playerDisc.classList.add('spinning');
  if (progressFill)  progressFill.style.width  = '0%';
  if (currentTimeEl) currentTimeEl.textContent = '0:00';

  if (t.audioSrc) startRealAudio(t);
  else startFakeSim(t);

  /* 스트립과 리스트 재렌더 (현재 재생 강조 반영) */
  render();
}

function togglePlay() {
  isPlaying = !isPlaying;
  if (playPauseBtn) playPauseBtn.textContent = isPlaying ? '⏸' : '▶';

  if (currentAudio) {
    /* 실제 오디오 재생 중인 트랙: 그대로 일시정지/재개 */
    if (isPlaying) {
      currentAudio.play().catch(() => {});
      if (playerDisc) playerDisc.classList.add('spinning');
    } else {
      currentAudio.pause();
      if (playerDisc) playerDisc.classList.remove('spinning');
    }
  } else if (isPlaying) {
    if (playerDisc) playerDisc.classList.add('spinning');
    playerTimer = setInterval(() => {
      progress = Math.min(progress + 0.05, 100);
      if (progressFill)  progressFill.style.width  = progress + '%';
      if (currentTimeEl) currentTimeEl.textContent = fmtTime(progress, totalSec);
      if (progress >= 100) {
        clearInterval(playerTimer); isPlaying = false;
        if (playPauseBtn) playPauseBtn.textContent = '▶';
        if (playerDisc)   playerDisc.classList.remove('spinning');
      }
    }, 100);
  } else {
    if (playerDisc) playerDisc.classList.remove('spinning');
    clearInterval(playerTimer);
  }
  /* 재생 버튼 아이콘 업데이트 */
  const btn = listEl?.querySelector(`[data-idx="${playingIdx}"] .track-play-btn`);
  if (btn) btn.textContent = isPlaying ? '⏸' : '▶';
}

/* 재생/정지 버튼 */
if (playPauseBtn) {
  playPauseBtn.addEventListener('click', togglePlay);
}

/* 이전/다음 트랙 */
document.getElementById('prevBtn')?.addEventListener('click', () => {
  if (playingIdx > 0) playTrack(playingIdx - 1);
});
document.getElementById('nextBtn')?.addEventListener('click', () => {
  const tracks = getFiltered();
  if (playingIdx < tracks.length - 1) playTrack(playingIdx + 1);
});

/* 프로그레스바 클릭 */
if (progressBar) {
  progressBar.addEventListener('click', e => {
    const rect = progressBar.getBoundingClientRect();
    progress = ((e.clientX - rect.left) / rect.width) * 100;
    if (progressFill)  progressFill.style.width  = progress + '%';
    if (currentTimeEl) currentTimeEl.textContent = fmtTime(progress, totalSec);
  });
}

/* 볼륨 슬라이더 — 실제 재생 중인 오디오 볼륨을 조절 */
const volSlider = document.querySelector('.vol-slider');
if (volSlider) {
  volSlider.value = Math.round(volumeLevel * 100);
  volSlider.addEventListener('input', () => {
    volumeLevel = volSlider.value / 100;
    if (currentAudio) currentAudio.volume = volumeLevel;
  });
}

/* 좋아요 버튼 */
document.getElementById('globalLike')?.addEventListener('click', function () {
  const liked = this.textContent === '♡';
  this.textContent = liked ? '♥' : '♡';
  this.style.color = liked ? 'var(--red)' : '';
});


/* =====================================================
   [13] 키보드 단축키
   ← → 방향키로 이전/다음 트랙
   Space: 재생/정지
   ===================================================== */
document.addEventListener('keydown', e => {
  /* 입력 필드 포커스 중에는 무시 */
  if (e.target.tagName === 'INPUT') return;
  const tracks = getFiltered();
  if (e.key === 'ArrowRight' && playingIdx < tracks.length - 1) playTrack(playingIdx + 1);
  if (e.key === 'ArrowLeft'  && playingIdx > 0)                  playTrack(playingIdx - 1);
  if (e.key === ' ')                                             { e.preventDefault(); togglePlay(); }
});


/* =====================================================
   [14] 모바일 햄버거 메뉴
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
   [15] 가사 데이터 + 전체 패널 (플레이리스트 + 가사)
   ===================================================== */
const LYRICS_DATA = {
  'Void Mandala': [
    { pct:  0, line: '— Intro —' },
    { pct:  8, line: '빈 공간 속에 울리는 목탁' },
    { pct: 16, line: 'In the void, the rhythm breathes' },
    { pct: 24, line: '번뇌는 사라지고 비트만 남아' },
    { pct: 32, line: 'Drop the illusion — feel the bass' },
    { pct: 40, line: '만다라의 선 위를 걷는다' },
    { pct: 48, line: 'Dancing on the edge of the mandala' },
    { pct: 56, line: '108번의 호흡, 108개의 음' },
    { pct: 64, line: '108 breaths · 108 sounds' },
    { pct: 72, line: '귀환, 언제나 귀환' },
    { pct: 82, line: 'Return — always return' },
    { pct: 92, line: '— Outro —' },
  ],
  '108 Bells': [
    { pct:  0, line: '— Intro —' },
    { pct: 10, line: '새벽 사원의 종소리가' },
    { pct: 20, line: '108번 울려 퍼진다' },
    { pct: 30, line: 'One bell for each affliction' },
    { pct: 40, line: 'Dissolving in the morning mist' },
    { pct: 50, line: '마음의 문이 열린다' },
    { pct: 60, line: '번뇌 하나씩 내려놓고' },
    { pct: 72, line: 'Let it ring · let it go' },
    { pct: 82, line: '108번째 종이 울릴 때' },
    { pct: 92, line: '나는 비로소 자유롭다' },
  ],
  'Lotus Drop': [
    { pct:  0, line: '— Intro —' },
    { pct: 12, line: '진흙 속에서 피어나는 연꽃' },
    { pct: 24, line: 'Rising pure from the murky deep' },
    { pct: 36, line: '클럽의 바닥에서도 피어난다' },
    { pct: 48, line: 'Even here — the lotus blooms' },
    { pct: 60, line: '춤 속에서 찾는 해탈' },
    { pct: 72, line: 'Liberation on the dance floor' },
    { pct: 84, line: '떨어지고, 다시 피어나고' },
  ],
  'Temple Bass': [
    { pct:  0, line: '— Intro —' },
    { pct: 10, line: '사원의 바닥을 울리는 베이스' },
    { pct: 22, line: 'The bass shakes the temple walls' },
    { pct: 34, line: '돌탑이 흔들리고' },
    { pct: 46, line: 'Stone and sound — one breath' },
    { pct: 58, line: '몸이 사원이 된다' },
    { pct: 70, line: 'Your body is the temple' },
    { pct: 82, line: '귀환, 언제나 귀환' },
    { pct: 93, line: '— Outro —' },
  ],
  'Nirvana Beat': [
    { pct:  0, line: '— Intro —' },
    { pct: 10, line: '해탈은 저 멀리 있지 않다' },
    { pct: 22, line: 'Nirvana is not far away' },
    { pct: 34, line: '지금 이 순간, 이 비트 안에' },
    { pct: 46, line: 'In this beat · in this moment' },
    { pct: 58, line: '생각을 내려놓고 몸을 맡겨라' },
    { pct: 70, line: 'Let go of thought · surrender' },
    { pct: 82, line: '고요함 속의 춤' },
    { pct: 93, line: 'Dancing in stillness' },
  ],
};

/* 가사 데이터가 없는 트랙의 기본 가사 */
const DEFAULT_LYRICS = [
  { pct:  0, line: '— Intro —' },
  { pct: 15, line: '소리가 흐른다' },
  { pct: 28, line: 'The sound flows through' },
  { pct: 42, line: '마음이 열린다' },
  { pct: 56, line: 'Open · breathe · return' },
  { pct: 70, line: '귀환, 언제나 귀환' },
  { pct: 84, line: 'Listen · Mix · Return' },
  { pct: 94, line: '— Outro —' },
];


/* =====================================================
   [16] 전체 패널 — DOM 참조
   ===================================================== */
const fullPanel        = document.getElementById('fullPanel');
const fullPanelBody    = document.getElementById('fullPanelBody');
const fullPanelClose   = document.getElementById('fullPanelClose');
const panelMobileTabs  = document.getElementById('panelMobileTabs');
const panelTrackList   = document.getElementById('panelTrackList');
const panelLyricsTitle  = document.getElementById('panelLyricsTitle');
const panelLyricsArtist = document.getElementById('panelLyricsArtist');
const panelLyricsScroll = document.getElementById('panelLyricsScroll');
const playerTrackEl    = document.getElementById('playerTrack');

let panelOpen    = false;
let panelTrackIdx = -1;   /* 패널에서 현재 선택된 트랙 인덱스 */

/* ── 모바일 탭 전환 (플레이리스트 / 가사 중 하나씩 표시) ── */
function setPanelMobileView(view) {
  if (!fullPanelBody) return;
  fullPanelBody.dataset.mobileView = view;
  if (panelMobileTabs) {
    panelMobileTabs.querySelectorAll('.panel-mobile-tab').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.view === view);
    });
  }
}
if (panelMobileTabs) {
  panelMobileTabs.querySelectorAll('.panel-mobile-tab').forEach(btn => {
    btn.addEventListener('click', () => setPanelMobileView(btn.dataset.view));
  });
}


/* ── 플레이리스트 빌드 ──
   ALL_TRACKS 전체를 왼쪽 패널에 나열
   현재 재생 중 / 패널 선택 트랙 강조 */
function buildPanelPlaylist() {
  if (!panelTrackList) return;
  panelTrackList.innerHTML = '';

  ALL_TRACKS.forEach((t, i) => {
    const [c1, c2] = GRADS[t.g];
    const isActive = i === panelTrackIdx;

    const item = document.createElement('div');
    item.className = `panel-track-item${isActive ? ' active' : ''}`;
    item.dataset.idx = i;
    item.innerHTML = `
      <span class="pti-rank">${t.rank}</span>
      <div class="pti-art" style="background:linear-gradient(135deg,${c1},${c2})"></div>
      <div class="pti-info">
        <p class="pti-title">${t.title}</p>
        <p class="pti-artist">${t.artist}</p>
      </div>
      <span class="pti-dur">${t.dur}</span>`;

    /* 클릭: ALL_TRACKS 기준으로 바로 재생 + 가사 표시 */
    item.addEventListener('click', () => {
      panelTrackIdx = i;
      playTrackDirect(t, i);
      refreshPanelActive(i);
      showPanelLyrics(t);
      setPanelMobileView('lyrics'); /* 모바일: 트랙 선택 시 가사 탭으로 자동 전환 */
    });

    panelTrackList.appendChild(item);
  });
}

/* 플레이리스트 active 클래스만 업데이트 (재렌더 없이) */
function refreshPanelActive(idx) {
  if (!panelTrackList) return;
  panelTrackList.querySelectorAll('.panel-track-item').forEach((el, i) => {
    el.classList.toggle('active', i === idx);
  });
  panelTrackIdx = idx;
}

/* ── 가사 표시 (우측 패널) ──
   우선순위: LYRICS_DATA(직접 pct를 지정한 곡) → now-playing-panel.js의
   TRACKS.lyrics(가사 상세 패널에 이미 입력해둔 텍스트, 줄 수 기준으로
   자동으로 pct를 균등 배분) → DEFAULT_LYRICS(둘 다 없을 때) */
function lyricsFromNowPlayingPanel(title) {
  const npTrack = (window.NP_TRACKS || []).find(t => t.title === title);
  if (!npTrack || !npTrack.lyrics) return null;
  if (npTrack.lyrics.indexOf('가사를 여기에 입력하세요') >= 0) return null; /* 아직 미입력 */

  const rawLines = npTrack.lyrics.split('\n');
  const n = rawLines.length;
  return rawLines.map((line, i) => ({ pct: Math.round(i / n * 96), line }));
}

function showPanelLyrics(track) {
  if (!panelLyricsScroll) return;
  if (panelLyricsTitle)  panelLyricsTitle.textContent  = track.title;
  if (panelLyricsArtist) panelLyricsArtist.textContent = track.artist;

  const lines = LYRICS_DATA[track.title] || lyricsFromNowPlayingPanel(track.title) || DEFAULT_LYRICS;
  panelLyricsScroll.innerHTML = lines
    .map(l => `<p class="lyrics-line" data-pct="${l.pct}">${l.line}</p>`)
    .join('');

  setTimeout(() => syncLyrics(progress), 50);
}

/* ── 가사 싱크 (재생 진행률 → 활성 라인) ── */
function syncLyrics(pct) {
  if (!panelLyricsScroll || !panelOpen) return;
  const lines = panelLyricsScroll.querySelectorAll('.lyrics-line');
  if (!lines.length) return;
  let activeIdx = 0;
  lines.forEach((el, i) => {
    if (parseFloat(el.dataset.pct) <= pct) activeIdx = i;
  });
  lines.forEach((el, i) => {
    el.classList.toggle('active', i === activeIdx);
    el.classList.toggle('past',   i < activeIdx);
  });
  lines[activeIdx]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

/* ── 패널 열기 / 닫기 ── */
function openPanel() {
  if (!fullPanel) return;
  /* 현재 재생 중인 트랙 인덱스로 패널 초기화 */
  panelTrackIdx = playingIdx >= 0 ? playingIdx : 0;
  buildPanelPlaylist();
  /* 재생 중이면 가사도 바로 표시 */
  if (playingIdx >= 0) {
    const t = ALL_TRACKS[playingIdx] || ALL_TRACKS[0];
    showPanelLyrics(t);
  }
  setPanelMobileView('playlist'); /* 모바일: 패널을 열 때는 항상 플레이리스트 탭부터 */
  fullPanel.classList.add('open');
  panelOpen = true;
}

function closePanel() {
  if (!fullPanel) return;
  fullPanel.classList.remove('open');
  panelOpen = false;
}

/* 미니 플레이어 좌측(트랙 정보) 클릭 → 패널 열기 */
if (playerTrackEl) {
  playerTrackEl.addEventListener('click', () => {
    panelOpen ? closePanel() : openPanel();
  });
}

/* 닫기 버튼 */
if (fullPanelClose) {
  fullPanelClose.addEventListener('click', closePanel);
}

/* ESC 키 */
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape' && panelOpen) closePanel();
});


/* =====================================================
   Init — 최초 렌더링 + 장르 페이지에서 넘어온 경우 처리
   ===================================================== */
render();

/* genre.html에서 ?genre=club 형식으로 넘어왔을 때
   해당 필터 칩 활성화 → 섹션으로 스크롤 */
(function handleGenreParam() {
  const urlGenre = new URLSearchParams(location.search).get('genre');
  if (!urlGenre) return;

  /* ALL 상태 유지 — 섹션 앵커로 스크롤 (전체 흐름 보여주기) */
  setTimeout(() => {
    const sec = document.getElementById(`genre-section-${urlGenre}`);
    if (!sec) return;
    const style = getComputedStyle(document.documentElement);
    const offset =
      (parseFloat(style.getPropertyValue('--nav-h'))    || 60) +
      (parseFloat(style.getPropertyValue('--marquee-h')) || 32) + 16;
    window.scrollTo({ top: sec.offsetTop - offset, behavior: 'smooth' });

    /* 해당 섹션 헤더 잠깐 강조 */
    sec.classList.add('highlight');
    setTimeout(() => sec.classList.remove('highlight'), 1800);
  }, 350);
})();

/* =====================================================
   차트 인트로 — 카세트 스크롤 애니메이션
   스크롤 내릴수록 카세트가 아래서 위로 올라옴
   ===================================================== */
(function () {
  const intro    = document.getElementById('chartIntro');
  const cassette = document.getElementById('ciCassette');
  if (!intro || !cassette) return;

  function updateCassette() {
    const rect      = intro.getBoundingClientRect();
    const navOffset = 72 + 36;  /* --nav-h + --marquee-h */
    /* sticky 패널이 고정된 후 vh의 55%만큼 스크롤하면 카세트 완전 등장 */
    const progress  = Math.max(0, Math.min(1,
      (navOffset - rect.top) / (window.innerHeight * 0.55)
    ));
    cassette.style.transform = `translateY(${200 * (1 - progress)}px)`;
    cassette.style.opacity   = `${progress}`;
  }

  window.addEventListener('scroll', updateCassette, { passive: true });
  updateCassette();
})();

console.log('%cOMIX CHART 🎵 Top 50', 'color:#F91536;font-size:16px;font-weight:700;');

/* =====================================================
   [SCROLL ZOOM] 차트 스트립 스크롤 연동 확대
   ===================================================== */
(function() {
  const stripSection = document.getElementById('chartStripSection');
  if (!stripSection) return;

  function onScrollZoom() {
    const rect = stripSection.getBoundingClientRect();
    const vh = window.innerHeight;
    // progress: 0 when section enters viewport bottom, 1 when top of section at top of viewport
    const progress = Math.max(0, Math.min(1, (vh - rect.top) / (vh + rect.height * 0.5)));
    // scale 0.88 → 1.0
    const scale = 0.88 + progress * 0.12;
    // opacity 0.5 → 1
    const opacity = 0.5 + progress * 0.5;
    stripSection.style.transform = `scale(${scale})`;
    stripSection.style.opacity = opacity;
    stripSection.style.transformOrigin = 'center top';
  }

  window.addEventListener('scroll', onScrollZoom, { passive: true });
  onScrollZoom();
})();
