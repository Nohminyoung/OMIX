/* OMIX — 전역 컬러 테마 복원 (모든 페이지 공통) */
(function () {
  const saved = localStorage.getItem('omix-accent');
  if (saved) document.documentElement.style.setProperty('--red', saved);
})();

/* 현재 페이지 네비 표시 (모든 페이지 공통) — 지금 보고 있는 페이지의 메뉴에
   .active + aria-current 를 붙인다 (표시 모양은 style.css [5] .nav-link.active).
   상세·결제 페이지는 들어온 메뉴를 가리킨다: 곡 상세 → Chart, 상품 상세 → Store, 결제 → Cart */
(function () {
  const PARENT = {
    'song-detail.html':    'chart.html',
    'store-detail.html':   'store.html',
    'checkout.html':       'cart.html',
    'order-complete.html': 'cart.html'
  };

  function mark() {
    const page = location.pathname.split('/').pop() || 'index.html';
    const target = PARENT[page] || page;
    document.querySelectorAll('.nav a.nav-link').forEach(a => {
      if (a.getAttribute('href') !== target) return;
      a.classList.add('active');
      a.setAttribute('aria-current', 'page');
    });
  }

  /* theme.js 는 <head> 에서 로드되므로 nav 가 파싱된 뒤에 표시한다 */
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mark);
  else mark();
})();

/* 커서 로고 합체 (모든 페이지 공통) — 원(.cursor)이 관성으로 따라와 점(.cursor-dot)과
   겹치면 원 꼭대기에서 점까지 줄이 그어져 OMIX 로고의 'O' 모양이 된다.
   위치 이동은 각 페이지 JS(main.js · chart.js … · cursor.js)가 그대로 맡고,
   여기서는 둘의 거리만 재서 body 에 .cursor-merged 를 붙였다 뗀다 (모양은 style.css [4]). */
(function () {
  function init() {
    const ring = document.getElementById('cursor');
    const dot  = document.getElementById('cursorDot');
    if (!ring || !dot) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    const MERGE_PX = 1.5;   /* 이 거리 안이면 합쳐진 것으로 본다 */
    let merged = false;

    function tick() {
      const dx = parseFloat(ring.style.left) - parseFloat(dot.style.left);
      const dy = parseFloat(ring.style.top)  - parseFloat(dot.style.top);
      const now = Math.hypot(dx, dy) < MERGE_PX;   /* 아직 위치가 없으면 NaN → false */
      if (now !== merged) {
        merged = now;
        document.body.classList.toggle('cursor-merged', merged);
      }
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
