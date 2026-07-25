/* =====================================================
   OMIX — Page Transition (Staircase Curtain)
   - 16 horizontal panels, slide left→right
   - color synced with omix-accent (localStorage)
   - triggers on all internal nav links
   ===================================================== */
(function () {
  const N     = 16;
  const SPEED = 580;   // ms per panel sweep
  const STAGGER = SPEED * 0.018; // 거의 동시, 아주 살짝 cascade
  const EASE  = 'cubic-bezier(0.86,0,0.07,1)';

  let curtainColor = localStorage.getItem('omix-accent') || '#F91536';

  /* ── 오버레이 DOM 생성 ── */
  const overlay = document.createElement('div');
  overlay.id = 'omix-curtain';
  overlay.style.cssText = `
    position:fixed; inset:0; z-index:99999;
    pointer-events:none; overflow:hidden;
  `;
  document.documentElement.appendChild(overlay);

  function buildPanels() {
    overlay.innerHTML = '';
    const pH = 100 / N;
    for (let i = 0; i < N; i++) {
      const p = document.createElement('div');
      p.style.cssText = `
        position:absolute; left:0; width:100%;
        top:${i * pH}%; height:calc(${pH}% + 1px);
        background:${curtainColor};
        transform:translateX(-101%);
        will-change:transform;
      `;
      overlay.appendChild(p);
    }
    return Array.from(overlay.children);
  }

  function panelsIn(panels) {
    return new Promise(resolve => {
      overlay.style.pointerEvents = 'all';
      panels.forEach((p, i) => {
        p.style.transition = 'none';
        p.style.transform  = 'translateX(-101%)';
        void p.offsetWidth;
        const del = i * STAGGER;
        setTimeout(() => {
          p.style.transition = `transform ${SPEED}ms ${EASE}`;
          p.style.transform  = 'translateX(0%)';
        }, del);
      });
      setTimeout(resolve, SPEED + (N - 1) * STAGGER + 30);
    });
  }

  function panelsOut(panels) {
    return new Promise(resolve => {
      const outSpeed = SPEED * 0.82;
      panels.forEach((p, i) => {
        p.style.transition = 'none';
        p.style.transform  = 'translateX(0%)';
        void p.offsetWidth;
        // 역방향: 아래→위 순으로 빠져나감
        const del = (N - 1 - i) * STAGGER;
        setTimeout(() => {
          p.style.transition = `transform ${outSpeed}ms ${EASE}`;
          p.style.transform  = 'translateX(101%)';
        }, del);
      });
      setTimeout(() => {
        overlay.style.pointerEvents = 'none';
        resolve();
      }, outSpeed + (N - 1) * STAGGER + 50);
    });
  }

  /* ── 페이지 진입 시: pre-cover 제거 후 스테어케이스 OUT ── */
  if (sessionStorage.getItem('omix-nav') === '1') {
    sessionStorage.removeItem('omix-nav');

    // transition-head.js가 만든 단색 커버를 패널로 교체
    const preCover = document.getElementById('omix-pre-cover');

    const panels = buildPanels();
    // 패널 전체를 덮인 상태(translateX 0)로 즉시 세팅
    panels.forEach(p => {
      p.style.transition = 'none';
      p.style.transform  = 'translateX(0%)';
    });

    // 단색 커버 제거 (패널이 이미 덮고 있으므로 깜빡임 없음)
    if (preCover) preCover.remove();

    // 다음 프레임에 OUT 시작
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        panelsOut(panels);
      });
    });
  }

  /* ── 링크 클릭 가로채기 ── */
  function isInternalLink(a) {
    if (!a || a.tagName !== 'A') return false;
    const href = a.getAttribute('href');
    if (!href) return false;
    if (href.startsWith('http') || href.startsWith('//')) return false;
    if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return false;
    if (a.target === '_blank') return false;
    return true;
  }

  document.addEventListener('click', function (e) {
    const a = e.target.closest('a');
    if (!isInternalLink(a)) return;
    e.preventDefault();
    const dest = a.href;
    const panels = buildPanels();
    panelsIn(panels).then(() => {
      sessionStorage.setItem('omix-nav', '1');
      window.location.href = dest;
    });
  }, true);

  /* ── 테마 컬러 변경 감지 → 패널 색 즉시 반영 ── */
  document.addEventListener('click', function (e) {
    const sw = e.target.closest('.theme-swatch');
    if (!sw) return;
    const c = sw.dataset.color;
    if (c) {
      curtainColor = c;
      // 이미 overlay에 패널이 있으면 색 업데이트
      Array.from(overlay.children).forEach(p => p.style.background = c);
    }
  });

  /* localStorage 변경도 감지 (다른 탭) */
  window.addEventListener('storage', function (e) {
    if (e.key === 'omix-accent' && e.newValue) {
      curtainColor = e.newValue;
    }
  });

})();
