/* =====================================================
   OMIX — player-ui.js
   하단 미니 플레이어 아이콘 · 볼륨 표시 (플레이어가 있는 페이지 공통)

   · 재생/이전/다음/좋아요/스피커 아이콘은 style.css [11] 이 SVG 마스크로 그린다.
     각 페이지 스크립트는 예전처럼 버튼 글자(▶/⏸, ♡/♥)만 바꾸고, 이 파일이 그 글자를 보고
     상태 클래스(.is-playing / .is-liked)를 붙인다. 글자 자체는 화면에서 숨겨져 있다.
   · 볼륨 슬라이더: 현재 값만큼 왼쪽부터 빨간 선이 차고, 0이면 회색 바만 남는다(--vol).
     다른 스크립트가 value 를 코드로 바꿔도 따라가도록 value 설정을 가로챈다.
   · 스피커 버튼(.vol-btn): 누르면 음소거 ↔ 직전 볼륨 복원. 슬라이더에 input 이벤트를
     보내므로 각 페이지의 기존 볼륨 처리(main.js · chart.js · my-player.js)가 그대로 따라온다.
   ===================================================== */

(function () {
  'use strict';

  const mp = document.getElementById('miniPlayer') || document.querySelector('.mini-player');

  /* ── 버튼 글자 → 상태 클래스 ── */
  function watchText(el, onText, cls, labels) {
    if (!el) return;
    const sync = () => {
      const on = el.textContent.trim() === onText;
      el.classList.toggle(cls, on);
      if (labels) el.setAttribute('aria-label', on ? labels[1] : labels[0]);
    };
    sync();
    new MutationObserver(sync).observe(el, { childList: true, characterData: true, subtree: true });
  }

  if (mp) {
    const ctrls = mp.querySelectorAll('.player-controls .ctrl-btn');
    if (ctrls.length) {
      ctrls[0].setAttribute('aria-label', '이전 곡');
      ctrls[ctrls.length - 1].setAttribute('aria-label', '다음 곡');
    }
    watchText(mp.querySelector('.ctrl-play'), '⏸', 'is-playing', ['재생', '일시정지']);
    const like = mp.querySelector('.player-like');
    watchText(like, '♥', 'is-liked', ['좋아요', '좋아요 취소']);
  }

  /* ── 볼륨: 빨간 채움 + 스피커 아이콘 + 음소거 토글 ── */
  const valueDesc = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');

  document.querySelectorAll('.vol-slider').forEach(slider => {
    const btn = slider.parentElement.querySelector('.vol-btn');
    let lastVol = Number(slider.value) || 70;

    function update() {
      const v = Number(slider.value);
      const max = Number(slider.max) || 100;
      slider.style.setProperty('--vol', (v / max * 100) + '%');
      if (v > 0) lastVol = v;
      if (btn) {
        btn.classList.toggle('is-muted', v === 0);
        btn.classList.toggle('is-low', v > 0 && v < max / 2);
        btn.setAttribute('aria-label', v === 0 ? '음소거 해제' : '음소거');
      }
    }

    /* 다른 스크립트가 slider.value = … 로 바꿔도 채움이 따라가게 */
    Object.defineProperty(slider, 'value', {
      configurable: true,
      get() { return valueDesc.get.call(this); },
      set(v) { valueDesc.set.call(this, v); update(); }
    });

    slider.addEventListener('input', update);
    update();

    if (btn) {
      btn.addEventListener('click', () => {
        slider.value = Number(slider.value) > 0 ? 0 : lastVol;
        slider.dispatchEvent(new Event('input', { bubbles: true }));
        slider.dispatchEvent(new Event('change', { bubbles: true }));
      });
    }
  });
})();
