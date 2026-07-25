/* =====================================================
   OMIX — about.js
   커서 / Nav / 파티클 / 스탯 카운트업 / 스크롤 Reveal / 플레이어
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
    nav.classList.toggle('scrolled', window.scrollY > 50);
  });
}


/* =====================================================
   [3] 파티클 캔버스 (히어로 배경)
   레드 + 보라 50% 비율 — 어바웃 페이지 명상적 무드
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
      this.vx      = (Math.random() - 0.5) * 0.2;    /* 매우 느린 이동 — 명상적 */
      this.vy      = (Math.random() - 0.5) * 0.2 - 0.06;
      this.r       = Math.random() * 2 + 0.5;         /* 약간 큰 점 */
      this.alpha   = Math.random() * 0.4 + 0.05;
      this.life    = 0;
      this.maxLife = Math.random() * 500 + 300;        /* 긴 수명 */
      this.hue = Math.random() > 0.5 ? '249,21,54' : '166,71,255';
    }
    update() {
      this.x += this.vx; this.y += this.vy; this.life++;
      if (this.life > this.maxLife || this.x < 0 || this.x > W || this.y < 0 || this.y > H) this.reset();
    }
    draw() {
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
   [4] 스크롤 기반 Reveal 애니메이션
   IntersectionObserver로 뷰포트에 들어올 때
   .reveal-up 요소에 애니메이션 트리거
   ===================================================== */
const revealEls = document.querySelectorAll('.reveal-up');

const revealObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        /* 뷰포트 진입 시 즉시 애니메이션 실행 */
        entry.target.style.animationPlayState = 'running';
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }   /* 요소의 15% 이상이 보일 때 트리거 */
);

revealEls.forEach(el => {
  /* 처음엔 paused — 스크롤로 뷰포트 진입 시 running */
  el.style.animationPlayState = 'paused';
  revealObserver.observe(el);
});


/* =====================================================
   [5] 스탯 카운트업 애니메이션
   data-target 속성의 숫자까지 easeOut으로 증가
   IntersectionObserver로 스탯 섹션 진입 시 시작
   ===================================================== */
const statItems = document.querySelectorAll('.stat-item');

const statObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      const numEl = entry.target.querySelector('.stat-num');
      if (!numEl) return;

      const target  = parseInt(numEl.dataset.target, 10);
      const spanEl  = numEl.querySelector('span');   /* 숫자를 담는 span */
      if (!spanEl || isNaN(target)) return;

      const duration = 1800;   /* 카운트업 전체 시간 (ms) */
      const start    = performance.now();

      function countUp(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        /* easeOutQuart: 빠르게 시작해 부드럽게 완료 */
        const ease = 1 - Math.pow(1 - progress, 4);
        spanEl.textContent = Math.floor(ease * target);

        if (progress < 1) requestAnimationFrame(countUp);
        else spanEl.textContent = target;
      }
      requestAnimationFrame(countUp);

      statObserver.unobserve(entry.target);
    });
  },
  { threshold: 0.4 }
);

statItems.forEach(item => statObserver.observe(item));


/* =====================================================
   [6] 미니 플레이어 — 재생/정지
   ===================================================== */
const playPauseBtn  = document.getElementById('playPauseBtn');
const playerDisc    = document.getElementById('playerDisc');
const progressFill  = document.getElementById('progressFill');
const currentTimeEl = document.getElementById('currentTime');

let isPlaying = false;
let progress  = 0;
let timer;

function formatTime(pct) {
  const total = 228;
  const sec   = Math.floor(total * pct / 100);
  return Math.floor(sec / 60) + ':' + String(sec % 60).padStart(2, '0');
}

if (playPauseBtn && playerDisc && progressFill && currentTimeEl) {
  playPauseBtn.addEventListener('click', () => {
    isPlaying = !isPlaying;
    playPauseBtn.textContent = isPlaying ? '⏸' : '▶';

    if (isPlaying) {
      playerDisc.classList.add('spinning');
      timer = setInterval(() => {
        progress = Math.min(progress + 0.05, 100);
        progressFill.style.width = progress + '%';
        currentTimeEl.textContent = formatTime(progress);
        if (progress >= 100) {
          clearInterval(timer); isPlaying = false; playPauseBtn.textContent = '▶';
        }
      }, 100);
    } else {
      playerDisc.classList.remove('spinning');
      clearInterval(timer);
    }
  });
}


/* =====================================================
   [7] 프로그레스바 클릭
   ===================================================== */
const progressBar = document.getElementById('progressBar');
if (progressBar) {
  progressBar.addEventListener('click', e => {
    const rect = progressBar.getBoundingClientRect();
    progress = ((e.clientX - rect.left) / rect.width) * 100;
    if (progressFill)  progressFill.style.width = progress + '%';
    if (currentTimeEl) currentTimeEl.textContent = formatTime(progress);
  });
}


/* =====================================================
   [8] 좋아요 버튼
   ===================================================== */
const playerLike = document.getElementById('globalLike');
if (playerLike) {
  playerLike.addEventListener('click', () => {
    const liked = playerLike.textContent === '♡';
    playerLike.textContent = liked ? '♥' : '♡';
    playerLike.style.color = liked ? 'var(--red)' : '';
  });
}


/* =====================================================
   [9] 모바일 햄버거 메뉴
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
   [10] 에디토리얼 LP 디스크 컨트롤
   aboutPlay 버튼 클릭 → aboutDisc 회전 토글
   ===================================================== */
const aboutPlayBtn = document.getElementById('aboutPlay');
const aboutDisc    = document.getElementById('aboutDisc');
let aboutPlaying = false;

if (aboutPlayBtn && aboutDisc) {
  aboutPlayBtn.addEventListener('click', () => {
    aboutPlaying = !aboutPlaying;
    aboutPlayBtn.textContent = aboutPlaying ? '⏸' : '▶';
    aboutPlayBtn.classList.toggle('is-playing', aboutPlaying);
    aboutDisc.classList.toggle('spinning', aboutPlaying);
  });
}


/* =====================================================
   개발자 콘솔 메시지
   ===================================================== */
console.log('%cOMIX ✦ 한 게 없으면 한계도 없습니다', 'color:#F91536;font-size:16px;font-weight:700;');
