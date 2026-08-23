/* =====================================================
   OMIX — main.js  (index 페이지 전용)
   차트/장르/어바웃 관련 코드 제거, 필요한 것만 유지
   ===================================================== */


/* =====================================================
   [0] LP 꺼내기 로더
   vinyl pull-out 애니메이션은 CSS가 전담 (delay 0.45s, 1.35s)
   window.load + 700ms 또는 최대 4.5s 후 페이드아웃
   ===================================================== */
(function () {
  const overlay = document.getElementById('loaderOverlay');
  if (!overlay) return;

  let closed = false;

  function closeLoader() {
    if (closed) return;
    closed = true;
    overlay.classList.add('fade-out');
    setTimeout(function () { overlay.style.display = 'none'; }, 950);
  }

  window.addEventListener('load', function () { setTimeout(closeLoader, 3000); });
  setTimeout(closeLoader, 7000);
})();


/* =====================================================
   [0-B] 가이드 오버레이 — 스크롤 또는 클릭으로 닫기
   ===================================================== */
(function () {
  const guide = document.getElementById('guideOverlay');
  if (!guide) return;

  function dismiss() {
    guide.classList.add('hide');
    setTimeout(function () { guide.style.display = 'none'; }, 600);
    window.removeEventListener('scroll', dismiss);
    window.removeEventListener('wheel', dismiss);
    guide.removeEventListener('click', dismiss);
    /* 색상 커스텀 가이드가 닫히는 시점에, 히어로의 LP판·로고 등장 시퀀스를 시작시킨다 */
    window.dispatchEvent(new CustomEvent('omix:guide-dismissed'));
  }

  guide.addEventListener('click', dismiss);
  window.addEventListener('scroll', dismiss, { once: true });
  window.addEventListener('wheel', dismiss, { once: true });
})();


/* =====================================================
   [1] 커스텀 커서
   .cursor    : 레드 테두리 원, 마우스를 12%씩 따라오는 관성 효과
   .cursor-dot: 마우스 위치에 즉시 붙는 작은 점
   ===================================================== */
const cursor    = document.getElementById('cursor');
const cursorDot = document.getElementById('cursorDot');
let mx = -100, my = -100;  /* 마우스 실제 위치 (목표) */
let cx = -100, cy = -100;  /* 큰 원 현재 위치 (부드럽게 이동) */

if (cursor && cursorDot) {
  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    /* 작은 점: 마우스 위치에 즉시 이동 */
    cursorDot.style.left = mx + 'px';
    cursorDot.style.top  = my + 'px';
  });

  function animCursor() {
    /* 현재위치 → 목표위치로 12%씩 이동 → 자연스러운 관성 */
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
   스크롤 40px 이상: .scrolled 클래스 추가
   → style.css .nav.scrolled: 반투명 배경 + blur
   ===================================================== */
const nav = document.getElementById('nav');
if (nav) {
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  });
}


/* =====================================================
   [3] 파티클 캔버스
   히어로 배경에 120개 점 생성 (레드 + 보라 두 가지 색)
   위로 천천히 떠오르다 사라지는 효과
   수명(life/maxLife) 기반으로 sin 함수로 투명도 제어
   ===================================================== */
(function () {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles = [];

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x       = Math.random() * W;
      this.y       = Math.random() * H;
      this.vx      = (Math.random() - 0.5) * 0.3;    /* 좌우 속도 */
      this.vy      = (Math.random() - 0.5) * 0.3 - 0.1; /* 약간 위로 */
      this.r       = Math.random() * 1.5 + 0.4;       /* 반지름 0.4~1.9px */
      this.alpha   = Math.random() * 0.5 + 0.1;       /* 최대 투명도 */
      this.life    = 0;
      this.maxLife = Math.random() * 300 + 200;        /* 수명 200~500프레임 */
      /* 레드(249,21,54) 또는 보라(166,71,255) 50% 확률 */
      this.hue = Math.random() > 0.5 ? '249,21,54' : '166,71,255';
    }
    update() {
      this.x += this.vx; this.y += this.vy; this.life++;
      if (this.life > this.maxLife || this.x<0 || this.x>W || this.y<0 || this.y>H) this.reset();
    }
    draw() {
      /* sin 함수: 등장 시 서서히 나타나고, 사라질 때 서서히 소멸 */
      const a = this.alpha * Math.sin(Math.PI * this.life / this.maxLife);
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.hue},${a})`;
      ctx.fill();
    }
  }

  for (let i = 0; i < 120; i++) particles.push(new Particle());

  function loop() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(loop);
  }
  loop();
})();


/* =====================================================
   [4] 배경 음악 — 실제 <audio> 재생
   히어로의 idxHeroAudioBtn과 하단 미니 플레이어의 playPauseBtn이
   같은 오디오 하나를 같이 제어. 디스크 회전 · 프로그레스바 · 재생 시간
   전부 audio의 실제 상태(play/pause/timeupdate)를 그대로 따라감.
   페이지 진입 시 자동재생을 시도하고, 브라우저가 막으면 첫 클릭/키
   입력에서 이어서 재생.
   ===================================================== */
const bgAudio        = document.getElementById('bgAudio');
const playPauseBtn    = document.getElementById('playPauseBtn');
const playerDisc      = document.getElementById('playerDisc');
const progressFill    = document.getElementById('progressFill');
const currentTimeEl   = document.getElementById('currentTime');
const totalTimeEl     = document.getElementById('totalTime');
const heroAudioBtn    = document.getElementById('idxHeroAudioBtn');
const heroAudioIcon   = document.getElementById('idxHeroAudioIcon');

/* 초 → "분:초" 변환 */
function formatTime(sec) {
  if (!isFinite(sec) || sec < 0) sec = 0;
  sec = Math.floor(sec);
  return Math.floor(sec / 60) + ':' + String(sec % 60).padStart(2, '0');
}

function setAudioUI(playing) {
  if (playPauseBtn)  playPauseBtn.textContent  = playing ? '⏸' : '▶';
  if (heroAudioIcon) heroAudioIcon.textContent = playing ? '⏸' : '▶';
  if (heroAudioBtn)  heroAudioBtn.setAttribute('aria-pressed', String(playing));
  if (playerDisc)    playerDisc.classList.toggle('spinning', playing);
}

if (bgAudio) {
  bgAudio.addEventListener('loadedmetadata', () => {
    if (totalTimeEl) totalTimeEl.textContent = formatTime(bgAudio.duration);
  });
  bgAudio.addEventListener('timeupdate', () => {
    if (!bgAudio.duration) return;
    if (progressFill)  progressFill.style.width = (bgAudio.currentTime / bgAudio.duration * 100) + '%';
    if (currentTimeEl) currentTimeEl.textContent = formatTime(bgAudio.currentTime);
  });
  bgAudio.addEventListener('play',  () => setAudioUI(true));
  bgAudio.addEventListener('pause', () => setAudioUI(false));

  const toggleAudio = () => {
    if (bgAudio.paused) bgAudio.play().catch(() => {});
    else bgAudio.pause();
  };
  if (playPauseBtn) playPauseBtn.addEventListener('click', toggleAudio);
  if (heroAudioBtn) heroAudioBtn.addEventListener('click', toggleAudio);

  /* 자동재생 시도 — 브라우저 정책으로 막히면 첫 사용자 상호작용에서 이어서 재생 */
  bgAudio.play().catch(() => {
    const resume = () => bgAudio.play().catch(() => {});
    document.addEventListener('pointerdown', resume, { once: true });
    document.addEventListener('keydown', resume, { once: true });
  });
}


/* =====================================================
   [5] 프로그레스바 클릭 → 재생 위치 이동
   클릭 위치 / 바 전체 너비 = 오디오 재생 시점(초)
   ===================================================== */
const progressBar = document.querySelector('.progress-bar');
if (progressBar && bgAudio) {
  progressBar.addEventListener('click', e => {
    if (!bgAudio.duration) return;
    const rect = progressBar.getBoundingClientRect();
    const pct  = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
    bgAudio.currentTime = pct * bgAudio.duration;
  });
}


/* =====================================================
   [5b] 볼륨 슬라이더 → 실제 오디오 볼륨 조절
   ===================================================== */
const volSlider = document.querySelector('.vol-slider');
if (volSlider && bgAudio) {
  bgAudio.volume = volSlider.value / 100;
  volSlider.addEventListener('input', () => {
    bgAudio.volume = volSlider.value / 100;
  });
}


/* =====================================================
   [6] 미니 플레이어 좋아요
   클릭: ♡ ↔ ♥ + 레드(#F91536) 색상 토글
   ===================================================== */
const playerLike = document.querySelector('.player-like');
if (playerLike) {
  playerLike.addEventListener('click', () => {
    const isLiked = playerLike.textContent === '♡';
    playerLike.textContent = isLiked ? '♥' : '♡';
    playerLike.style.color = isLiked ? 'var(--red)' : '';
  });
}


/* =====================================================
   [7] 모바일 햄버거 메뉴
   640px 이하에서 표시, 클릭 시 nav-links 드롭다운
   ===================================================== */
const hamburger = document.getElementById('hamburger');
const navLinks  = document.querySelector('.nav-menu');

if (hamburger) {
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    if (navLinks) navLinks.classList.toggle('mobile-open');
  });
}


/* [8] 카드 3D 틸트: now-playing-panel.js가 처리 */


/* =====================================================
   개발자 콘솔 메시지
   ===================================================== */
console.log('%cOMIX 🎵 Listen. Mix. Return.', 'color:#F91536;font-size:16px;font-weight:700;');
