/* =====================================================
   OMIX — Universal Page Reveal
   큰 글씨: 글자/단어별 좌→우 슬라이드
   작은 글씨: 아래→위 페이드업
   모든 페이지 공통 적용
   ===================================================== */
(function () {
  const EASE      = 'cubic-bezier(0.87, 0, 0.13, 1)';
  const CHAR_DUR  = 720;
  const CHAR_STAG = 48;
  const WORD_DUR  = 700;
  const WORD_STAG = 90;
  const UP_DUR    = 680;
  const UP_EASE   = 'cubic-bezier(0.87, 0, 0.13, 1)';

  /* ── 페이지별 타겟 설정 ──────────────────────────────
     type: 'char'  → 글자 하나하나 좌→우
           'word'  → 단어 단위 좌→우
           'up'    → 아래→위 페이드
  ─────────────────────────────────────────────────── */
  const TARGETS = [
    // chart.html
    { sel: '.ci-eyebrow',           type: 'up',   delay: 0   },
    { sel: '.ci-title-line',        type: 'char',  delay: 150 },

    // genre.html
    { sel: '.genre-heading-title',  type: 'char',  delay: 100 },

    // studio.html
    { sel: '.studio-eyebrow',       type: 'up',   delay: 0   },
    { sel: '.studio-main-title',    type: 'word',  delay: 160 },
    { sel: '.studio-hero-desc',     type: 'up',   delay: 480 },

    // store.html
    { sel: '.st-hero-title',        type: 'word',  delay: 100 },
    { sel: '.st-hero-desc',         type: 'up',   delay: 420 },

    // about.html
    { sel: '.ab-eyebrow-left',      type: 'up',   delay: 0   },
    { sel: '.ab-eyebrow-right',     type: 'up',   delay: 80  },
    { sel: '.ab-title-line',        type: 'char',  delay: 180 },
    { sel: '.ab-editorial-sub',     type: 'up',   delay: 650 },
    { sel: '.ab-editorial-body',    type: 'up',   delay: 820 },

    // my-player.html
    { sel: '.player-hero-title',    type: 'char',  delay: 100 },
    { sel: '.player-hero-sub',      type: 'up',   delay: 400 },
  ];

  /* ── 글자 분리 → 클립 래퍼 ── */
  function splitChars(el) {
    const text = el.textContent;
    el.textContent = '';
    el.style.opacity   = '1'; // 부모 컨테이너는 즉시 보이게 — 글자가 클립 처리
    el.style.display   = el.style.display || 'flex';
    el.style.flexWrap  = 'wrap';
    el.style.alignItems = 'baseline';

    return [...text].map(ch => {
      const clip = document.createElement('span');
      clip.style.cssText = 'display:inline-block;overflow:hidden;vertical-align:bottom;';
      const inner = document.createElement('span');
      inner.textContent = ch === ' ' ? ' ' : ch;
      inner.style.cssText = 'display:inline-block;transform:translateX(-110%);will-change:transform;';
      clip.appendChild(inner);
      el.appendChild(clip);
      return inner;
    });
  }

  /* ── 단어 분리 → 클립 래퍼 ── */
  function splitWords(el) {
    el.style.opacity = '1'; // 부모 즉시 표시
    const html  = el.innerHTML;
    // <br> 처리: <br>를 줄바꿈 유지하면서 단어 단위 분리
    const parts = html.split(/(<br\s*\/?>)/gi);
    el.innerHTML = '';

    const inners = [];
    parts.forEach(part => {
      if (/^<br/i.test(part)) {
        el.appendChild(document.createElement('br'));
        return;
      }
      const words = part.trim().split(/\s+/).filter(Boolean);
      words.forEach((word, wi) => {
        if (wi > 0) el.appendChild(document.createTextNode(' '));
        const clip = document.createElement('span');
        clip.style.cssText = 'display:inline-block;overflow:hidden;vertical-align:bottom;';
        const inner = document.createElement('span');
        inner.textContent = word;
        inner.style.cssText = 'display:inline-block;transform:translateX(-60px);opacity:0;will-change:transform,opacity;';
        clip.appendChild(inner);
        el.appendChild(clip);
        inners.push(inner);
      });
    });
    return inners;
  }

  /* ── 아래→위 초기 숨김 ── */
  function hideUp(el) {
    el.style.cssText += ';opacity:0;transform:translateY(26px);animation:none;transition:none;';
  }

  /* ── 아래→위 등장 ── */
  function revealUp(el, startMs) {
    hideUp(el);
    setTimeout(() => {
      el.style.transition = `opacity ${UP_DUR}ms ${UP_EASE}, transform ${UP_DUR}ms ${UP_EASE}`;
      el.style.opacity    = '1';
      el.style.transform  = 'translateY(0)';
    }, startMs);
  }

  /* ── 글자별 좌→우 ── */
  function revealChars(inners, startMs) {
    inners.forEach((inner, i) => {
      if (inner.textContent === ' ') return; // 공백 즉시 표시
      setTimeout(() => {
        inner.style.transition = `transform ${CHAR_DUR}ms ${EASE}`;
        inner.style.transform  = 'translateX(0%)';
      }, startMs + i * CHAR_STAG);
    });
    return startMs + inners.length * CHAR_STAG + CHAR_DUR;
  }

  /* ── 단어별 좌→우 ── */
  function revealWords(inners, startMs) {
    inners.forEach((inner, i) => {
      setTimeout(() => {
        inner.style.transition = `transform ${WORD_DUR}ms ${EASE}, opacity ${WORD_DUR * 0.5}ms ease`;
        inner.style.transform  = 'translateX(0px)';
        inner.style.opacity    = '1';
      }, startMs + i * WORD_STAG);
    });
    return startMs + inners.length * WORD_STAG + WORD_DUR;
  }

  /* ── 메인: 가이드 또는 전환 완료 후 실행 ── */
  function runReveal() {
    // 페이지에 존재하는 타겟만 처리
    const jobs = [];
    TARGETS.forEach(({ sel, type, delay }) => {
      document.querySelectorAll(sel).forEach((el, idx) => {
        // 여러 개일 경우 순차 딜레이
        const d = delay + idx * (type === 'up' ? 120 : 200);
        jobs.push({ el, type, delay: d });
      });
    });

    if (jobs.length === 0) return;

    // 기존 reveal-up 애니메이션 중복 방지
    jobs.forEach(({ el }) => {
      el.style.animation = 'none';
    });

    // 각 job 실행
    jobs.forEach(({ el, type, delay }) => {
      if (type === 'up') {
        revealUp(el, delay);
      } else if (type === 'char') {
        const inners = splitChars(el);
        // 초기 숨김 (이미 translateX(-110%) 상태)
        revealChars(inners, delay);
      } else if (type === 'word') {
        const inners = splitWords(el);
        revealWords(inners, delay);
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    // index.html은 hero-reveal.js가 처리 → 중복 방지
    if (document.querySelector('.hero-title')) return;

    // 페이지 전환 후 진입이면 바로, 아니면 짧게 대기
    const isNavEntry = !sessionStorage.getItem('omix-nav');
    setTimeout(runReveal, isNavEntry ? 200 : 100);
  });

})();
