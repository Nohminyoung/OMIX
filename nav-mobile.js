/* =====================================================
   OMIX — nav-mobile.js
   모바일 햄버거 메뉴 토글 (공용)

   index/chart/genre/store 등은 각자의 JS(main.js, store.js …)에
   같은 토글이 들어있고, 이 파일은 그런 JS 가 없는 페이지
   (cart / checkout / order-complete / admin)에서 쓴다.

   .nav-menu 는 1024px 이하에서 숨겨져 있다가
   .mobile-open 이 붙으면 드롭다운으로 펼쳐진다 (style.css [26-1]).
   ===================================================== */

(function () {
  'use strict';

  const hamburger = document.getElementById('hamburger');
  const navMenu   = document.querySelector('.nav-menu');
  if (!hamburger || !navMenu) return;

  function close() {
    hamburger.classList.remove('open');
    navMenu.classList.remove('mobile-open');
  }

  hamburger.addEventListener('click', e => {
    e.stopPropagation();
    hamburger.classList.toggle('open');
    navMenu.classList.toggle('mobile-open');
  });

  /* 메뉴 항목을 누르면 닫는다 (같은 페이지 앵커일 때도 자연스럽게) */
  navMenu.addEventListener('click', e => {
    if (e.target.closest('a')) close();
  });

  /* 바깥 클릭 · ESC · 데스크톱 폭으로 복귀 시 닫기 */
  document.addEventListener('click', e => {
    if (!navMenu.classList.contains('mobile-open')) return;
    if (e.target.closest('.nav-menu')) return;
    close();
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') close();
  });

  window.matchMedia('(min-width: 1025px)').addEventListener('change', ev => {
    if (ev.matches) close();
  });
})();
