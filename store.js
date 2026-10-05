/* =====================================================
   OMIX — store.js
   상품 렌더링 / 커서 / Nav / 파티클 / 카테고리 필터 / 카트 / 플레이어
   ===================================================== */


/* =====================================================
   [0] 상품 카드 채우기 (products.js → DOM)

   HTML 에는 카드 뼈대만 두고, 이름·가격·설명·색은 전부
   products.js 의 PRODUCTS 에서 가져와 채운다.
   카드가 어떤 상품인지는 카드 안의 [data-product] 값으로 정한다.
   → 상품을 바꿀 때 이 파일이나 store.html 을 고칠 필요가 없다.

   아래 [4] 필터가 버튼 목록을 잡아가기 전에 실행되어야 하므로
   반드시 파일 맨 앞에 둔다.
   ===================================================== */
(function hydrateStore() {
  if (!window.OmixShop) return;
  const S = window.OmixShop;

  /* ── 카테고리 필터 버튼 ── */
  const filterWrap = document.getElementById('storeFilters');
  if (filterWrap) {
    filterWrap.innerHTML = S.CATEGORIES.map((c, i) =>
      '<button class="filter-btn' + (i === 0 ? ' active' : '') +
      '" data-filter="' + c.key + '">' + c.label + '</button>'
    ).join('');
  }

  /* ── 헬퍼 ── */
  const setText = (card, sel, text) => {
    const el = card.querySelector(sel);
    if (el) el.textContent = text;
  };
  const setHTML = (card, sel, html) => {
    const el = card.querySelector(sel);
    if (el) el.innerHTML = html;
  };
  const setBg = (card, sel, bg) => {
    const el = card.querySelector(sel);
    if (el) el.style.background = bg;
  };
  /* "OMIX LOGO TEE" → "OMIX LOGO<br />TEE" (마지막 단어를 다음 줄로) */
  const twoLines = name => {
    const i = name.lastIndexOf(' ');
    return i === -1 ? name : name.slice(0, i) + '<br />' + name.slice(i + 1);
  };

  /* ── 카드마다 채우기 ── */
  const CARD_SEL = '.st-hero-card, .st-product-card, .product-card';

  document.querySelectorAll('[data-product]').forEach(btn => {
    const card = btn.closest(CARD_SEL);
    const p    = S.get(btn.dataset.product);
    if (!card || !p) return;

    /* 카테고리 필터가 읽는 값 */
    card.dataset.type = p.type;

    if (card.classList.contains('st-hero-card')) {
      /* 좌측 대형 히어로 카드 */
      setHTML(card, '.st-hero-title', name0(p));
      setBg(card,  '.st-hero-art-block', p.art);
      setText(card, '.st-hero-art-label', p.name.toLowerCase());
      setText(card, '.st-hero-art-meta span', p.typeLabel + ' · 2026');
      setText(card, '.st-hero-genres', p.desc);
      setText(card, '.st-price', S.won(p.price));

    } else if (card.classList.contains('st-product-card')) {
      /* 우측 2×2 피처드 카드 */
      setText(card, '.stpc-label', p.label);
      setHTML(card, '.stpc-title', twoLines(p.name));
      setText(card, '.stpc-genres', p.desc);
      setText(card, '.stpc-price', S.won(p.price));
      setBg(card,  '.stpc-art', p.art);
      setText(card, '.stpc-art-type', p.typeLabel);

    } else {
      /* 하단 전체 상품 그리드 */
      setText(card, '.pc-label', p.label);
      setText(card, '.pc-title', p.name);
      setText(card, '.pc-genres', p.desc);
      setText(card, '.pc-price', S.won(p.price));
      setBg(card,  '.pc-art', p.art);
      setText(card, '.pc-type', p.typeLabel);
    }
  });

  /* 히어로 타이틀은 단어마다 줄바꿈 + 품번 한 줄 */
  function name0(p) {
    return p.name.split(' ').join('<br />') + '<br />' + p.code;
  }
})();


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

   실제 담기는 products.js 의 OmixShop.cart 가 처리한다.
   배지(#cartBadge) 갱신도 그쪽에서 자동으로 이뤄진다.
   ===================================================== */

/* data-product 속성이 있는 모든 버튼 = 카트 버튼 */
const allCartBtns = new Set([
  ...document.querySelectorAll('.product-add-btn'),
  ...document.querySelectorAll('.stpc-add-btn')
]);

allCartBtns.forEach(btn => {
  /* 원래 텍스트 저장 (BUY →, 담기 등 버튼마다 다름) */
  const originalText = btn.textContent.trim();

  btn.addEventListener('click', e => {
    /* 카드 전체 클릭(상세 페이지 이동)과 분리 */
    e.stopPropagation();

    const id = btn.dataset.product;
    if (!id || !window.OmixShop) return;

    /* 옵션이 있는 상품은 기본 옵션으로 담긴다 (상세에서 변경 가능) */
    window.OmixShop.cart.add(id, '', 1);

    btn.classList.add('added');
    btn.textContent = '✓ 담김';
    setTimeout(() => {
      btn.classList.remove('added');
      btn.textContent = originalText;
    }, 1400);
  });
});

/* CART 버튼 → 장바구니 페이지 */
const cartBtn = document.getElementById('cartBtn');
if (cartBtn) {
  cartBtn.addEventListener('click', () => { window.location.href = 'cart.html'; });
}


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
