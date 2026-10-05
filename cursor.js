/* =====================================================
   OMIX — cursor.js
   커스텀 커서 (공용)

   style.css 는 body 에 cursor:none 을 걸어 기본 커서를 숨긴다.
   그래서 이 스크립트와 아래 두 요소가 없으면 커서가 아예 안 보인다.

     <div class="cursor" id="cursor"></div>
     <div class="cursor-dot" id="cursorDot"></div>

   index/chart/genre/store 등은 각자의 JS(main.js, store.js …)에
   같은 로직이 들어있고, 이 파일은 그런 JS 가 없는 페이지
   (cart / checkout / order-complete / admin)에서 쓴다.

   터치 기기에서는 커스텀 커서가 의미가 없으므로 기본 커서를 되돌린다.
   ===================================================== */

(function () {
  'use strict';

  const cursor    = document.getElementById('cursor');
  const cursorDot = document.getElementById('cursorDot');
  if (!cursor || !cursorDot) return;

  /* 마우스가 없는 기기: 커스텀 커서를 감추고 기본 커서를 되살린다 */
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    cursor.style.display    = 'none';
    cursorDot.style.display = 'none';
    document.documentElement.style.cursor = 'auto';
    return;
  }

  let mx = -100, my = -100;   /* 마우스 실제 위치 (목표) */
  let cx = -100, cy = -100;   /* 큰 원 현재 위치 (관성) */

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    /* 작은 점은 즉시 따라간다 */
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
})();
