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
const TRACKS = [
  { name: 'Han Groove Riot',      artist: 'OMIX Studio', time: '2:57', sec: 177, emoji: '🎵', bg: 'linear-gradient(135deg, #1a0408 0%, #300a12 50%, #0a0408 100%)', audioSrc: 'music/Han%20Groove%20Riot.mp3',      cover: 'covers/Han%20Groove%20Riot.jpg' },
  { name: 'Karma Game',           artist: 'OMIX Studio', time: '5:00', sec: 300, emoji: '🎧', bg: 'linear-gradient(135deg, #0d0a1a 0%, #1a0a2e 50%, #0d0a1a 100%)', audioSrc: 'music/Karma%20Game.mp3',           cover: 'covers/Karma%20Game.jpg' },
  { name: 'Mix Attack',           artist: 'OMIX Studio', time: '2:56', sec: 176, emoji: '💿', bg: 'linear-gradient(135deg, #0a0a1a 0%, #14082a 50%, #0a0a1a 100%)', audioSrc: 'music/Mix%20Attack.mp3',           cover: 'covers/Mix%20Attack.jpg' },
  { name: 'No Score, Just Soul',  artist: 'OMIX Studio', time: '5:01', sec: 301, emoji: '🔴', bg: 'linear-gradient(135deg, #1a0408 0%, #2a0810 50%, #1a0408 100%)', audioSrc: 'music/No%20Score,%20Just%20Soul.mp3', cover: 'covers/No%20Score,%20Just%20Soul.jpg' },
  { name: 'Temple Echo Loop',     artist: 'OMIX Studio', time: '4:09', sec: 249, emoji: '🎶', bg: 'linear-gradient(135deg, #0a140a 0%, #0a2010 50%, #0a140a 100%)', audioSrc: 'music/Temple%20Echo%20Loop.mp3',   cover: 'covers/Temple%20Echo%20Loop.jpg' },
  { name: '공즉',                 artist: 'OMIX Studio', time: '2:53', sec: 173, emoji: '🥁', bg: 'linear-gradient(135deg, #1a0808 0%, #2a0a0a 50%, #1a0808 100%)', audioSrc: 'music/공즉.mp3',                    cover: 'covers/공즉.jpg' },
  { name: '무명등',               artist: 'OMIX Studio', time: '2:55', sec: 175, emoji: '🪷', bg: 'linear-gradient(135deg, #0a0a1a 0%, #1a1028 50%, #0a0a1a 100%)', audioSrc: 'music/무명등.mp3',                  cover: 'covers/무명등.jpg' },
  { name: '사계윤회',             artist: 'OMIX Studio', time: '2:30', sec: 150, emoji: '🌀', bg: 'linear-gradient(135deg, #0a0a0a 0%, #1a1218 50%, #0a0a0a 100%)', audioSrc: 'music/사계윤회.mp3',                cover: 'covers/사계윤회.jpg' },
  { name: '업보 Bounce',          artist: 'OMIX Studio', time: '3:14', sec: 194, emoji: '✨', bg: 'linear-gradient(135deg, #0c0a1a 0%, #1a1230 50%, #0c0a1a 100%)', audioSrc: 'music/업보%20Bounce.mp3',           cover: 'covers/업보%20Bounce.jpg' },
  { name: '파도에 맡겨',          artist: 'OMIX Studio', time: '4:09', sec: 249, emoji: '🎴', bg: 'linear-gradient(135deg, #1a0808 0%, #280a0a 50%, #1a0808 100%)', audioSrc: 'music/파도에%20맡겨.mp3',           cover: 'covers/파도에%20맡겨.jpg' },
];

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
  document.querySelectorAll('.playlist-track').forEach((row, i) => {
    row.classList.toggle('current', i === idx);
    row.querySelector('.pt-num').textContent = i === idx ? '▶' : String(i + 1).padStart(2, '0');
  });

  if (autoplay) {
    audioEl.play().catch(() => {});
    setPlayingUI(true);
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
  if (nowCurrentTime)  nowCurrentTime.textContent  = formatTime(progress, audioEl.duration || TRACKS[currentIdx].sec);

  /* 미니 플레이어 */
  if (progressFill)   progressFill.style.width  = progress + '%';
  if (currentTimeEl)  currentTimeEl.textContent = formatTime(progress, audioEl.duration || TRACKS[currentIdx].sec);
}

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
   [12] 플레이리스트 트랙 클릭 → 해당 트랙 바로 재생
   ===================================================== */
document.querySelectorAll('.playlist-track').forEach((row, i) => {
  row.addEventListener('click', () => {
    loadTrack(i, true);
  });
});


/* =====================================================
   [13] 저장 트랙 클릭 → 해당 트랙 바로 재생
   ===================================================== */
document.querySelectorAll('.saved-track').forEach(el => {
  el.addEventListener('click', () => {
    const idx = parseInt(el.dataset.track, 10);
    if (isNaN(idx)) return;
    loadTrack(idx, true);
  });
});


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
loadTrack(currentIdx);


/* =====================================================
   개발자 콘솔 메시지
   ===================================================== */
console.log('%cOMIX MY PLAYER 🎧 나의 음악 다시 듣기', 'color:#F91536;font-size:16px;font-weight:700;');
