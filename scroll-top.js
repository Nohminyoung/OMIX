/* =====================================================
   OMIX — scroll-top.js
   맨 위로 버튼 (전 페이지 공통)

   · 화면 절반 이상 내려가면 오른쪽 아래에 나타나고, 누르면 맨 위로 부드럽게 올라간다.
   · 버튼 테두리 링이 스크롤 진행도만큼 테마 색으로 차오른다 (로딩 화면 링과 같은 언어).
   · 모양·위치는 style.css [28]. 하단 미니 플레이어가 있는 페이지는 그 위로 띄운다.
   · 페이지가 스크롤되지 않는 화면(genre 등)에서는 나타날 일이 없다.
   ===================================================== */

(function () {
  'use strict';

  const R = 22;                            /* 링 반지름 (viewBox 48 기준) */
  const CIRC = 2 * Math.PI * R;

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'to-top';
  btn.setAttribute('aria-label', '맨 위로');
  btn.innerHTML =
    '<svg class="to-top-ring" viewBox="0 0 48 48" aria-hidden="true">' +
      `<circle class="to-top-track" cx="24" cy="24" r="${R}"/>` +
      `<circle class="to-top-fill"  cx="24" cy="24" r="${R}"/>` +
    '</svg>' +
    '<svg class="to-top-arrow" viewBox="0 0 24 24" aria-hidden="true">' +
      '<path d="M12 19V5M5.5 11.5 12 5l6.5 6.5"/>' +
    '</svg>';
  document.body.appendChild(btn);

  const fill = btn.querySelector('.to-top-fill');
  fill.style.strokeDasharray = CIRC;

  let raf = null;
  function update() {
    raf = null;
    const y   = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    btn.classList.toggle('is-visible', max > 0 && y > window.innerHeight * 0.5);
    const p = max > 0 ? Math.min(y / max, 1) : 0;
    fill.style.strokeDashoffset = CIRC * (1 - p);
  }
  function schedule() { if (!raf) raf = requestAnimationFrame(update); }

  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  update();

  btn.addEventListener('click', () => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduce ? 'instant' : 'smooth' });
    btn.blur();
  });
})();
