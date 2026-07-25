/* 페이지 콘텐츠 렌더 전에 즉시 실행 — 깜빡임 방지 */
(function () {
  if (sessionStorage.getItem('omix-nav') !== '1') return;
  var c = localStorage.getItem('omix-accent') || '#F91536';
  var el = document.createElement('div');
  el.id = 'omix-pre-cover';
  el.style.cssText = 'position:fixed;inset:0;z-index:99999;background:' + c + ';pointer-events:all;';
  document.documentElement.appendChild(el);
})();
