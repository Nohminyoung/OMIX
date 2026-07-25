/* =====================================================
   OMIX — store.js
   커서 / Nav / 파티클 / 카테고리 필터 / 카트 / 플레이어
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
   [3] 파티클 캔버스 (히어로 배경)
   레드 색상 위주 — 스토어 페이지 무드 반영
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
      this.vx      = (Math.random() - 0.5) * 0.3;
      this.vy      = (Math.random() - 0.5) * 0.3 - 0.1;
      this.r       = Math.random() * 1.5 + 0.4;
      this.alpha   = Math.random() * 0.45 + 0.1;
      this.life    = 0;
      this.maxLife = Math.random() * 300 + 200;
      /* 스토어 페이지: 레드 비율 높임 */
      this.hue = Math.random() > 0.3 ? '249,21,54' : '166,71,255';
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

  for (let i = 0; i < 80; i++) particles.push(new Particle());

  function loop() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(loop);
  }
  loop();
})();


/* =====================================================
   [4] 카테고리 필터 탭 + 검색
   data-filter 속성 & 검색어로 제품 카드 show/hide
   'all' 선택 시 전체 표시
   ===================================================== */
const filterBtns   = document.querySelectorAll('#storeFilters .filter-btn');
const productCards  = document.querySelectorAll('#storeGrid .product-card');
const storeSearchInput = document.getElementById('storeSearchInput');

let activeFilter = 'all';
let searchQuery  = '';

function applyStoreFilters() {
  productCards.forEach(card => {
    const type  = card.dataset.type;
    const title = card.querySelector('.pc-title')?.textContent.toLowerCase() || '';
    const label = card.querySelector('.pc-label')?.textContent.toLowerCase() || '';

    const matchesFilter = activeFilter === 'all' || type === activeFilter;
    const matchesSearch = !searchQuery || title.includes(searchQuery) || label.includes(searchQuery);

    card.style.display = (matchesFilter && matchesSearch) ? '' : 'none';
  });
}

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    /* 활성 탭 전환 */
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeFilter = btn.dataset.filter;
    applyStoreFilters();
  });
});

if (storeSearchInput) {
  storeSearchInput.addEventListener('input', () => {
    searchQuery = storeSearchInput.value.trim().toLowerCase();
    applyStoreFilters();
  });
}


/* =====================================================
   [5] 장바구니 — 추가 버튼 처리
   .product-add-btn, .stpc-add-btn 모두 커버
   (중복 선택 방지를 위해 Set 사용)
   ===================================================== */
const cartBadge = document.getElementById('cartBadge');
let cartCount = 0;

/* data-product 속성이 있는 모든 버튼 = 카트 버튼 */
const allCartBtns = new Set([
  ...document.querySelectorAll('.product-add-btn'),
  ...document.querySelectorAll('.stpc-add-btn')
]);

allCartBtns.forEach(btn => {
  /* 원래 텍스트 저장 (BUY →, 담기 등 버튼마다 다름) */
  const originalText = btn.textContent.trim();

  btn.addEventListener('click', () => {
    if (btn.classList.contains('added')) {
      /* 이미 추가된 경우: 취소 */
      btn.classList.remove('added');
      btn.textContent = originalText;
      cartCount = Math.max(0, cartCount - 1);
    } else {
      /* 새로 추가 */
      btn.classList.add('added');
      btn.textContent = '✓';
      cartCount++;
    }
    /* 카트 배지 업데이트 */
    if (cartBadge) cartBadge.textContent = cartCount;
  });
});


/* =====================================================
   [6] 제품 좋아요 버튼
   ♡ ↔ ♥ + .liked 클래스 토글
   ===================================================== */
document.querySelectorAll('.product-like-btn').forEach(btn => {
  btn.addEventListener('click', e => {
    /* 버블링 차단: 카드 클릭 이벤트와 분리 */
    e.stopPropagation();
    const liked = btn.textContent === '♡';
    btn.textContent = liked ? '♥' : '♡';
    btn.classList.toggle('liked', liked);
  });
});


/* =====================================================
   [7] 미니 플레이어 — 재생/정지
   ===================================================== */
const playPauseBtn  = document.getElementById('playPauseBtn');
const playerDisc    = document.getElementById('playerDisc');
const progressFill  = document.getElementById('progressFill');
const currentTimeEl = document.getElementById('currentTime');

let isPlaying = false;
let progress  = 0;
let timer;

function formatTime(pct) {
  const total = 228;   /* 3:48 = 228초 */
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
   [8] 프로그레스바 클릭 → 재생 위치 이동
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
   [9] 미니 플레이어 좋아요
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
   [10] 모바일 햄버거 메뉴
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
   개발자 콘솔 메시지
   ===================================================== */
console.log('%cOMIX STORE 🛒 Own the Sound.', 'color:#F91536;font-size:16px;font-weight:700;');
