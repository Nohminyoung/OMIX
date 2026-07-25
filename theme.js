/* OMIX — 전역 컬러 테마 복원 (모든 페이지 공통) */
(function () {
  const saved = localStorage.getItem('omix-accent');
  if (saved) document.documentElement.style.setProperty('--red', saved);
})();
