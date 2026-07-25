/* =====================================================
   OMIX — Hero Text Reveal
   - 큰 글씨(Listen, Return): 글자별 좌→우 슬라이드
   - OMIX 배너 이미지: 전체 좌→우 슬라이드
   - 소형 텍스트(eyebrow, desc, cta): 아래→위 페이드업
   ===================================================== */
(function () {
  const EASE       = 'cubic-bezier(0.87, 0, 0.13, 1)';  // 쫀득 ease-in-out
  const CHAR_DUR   = 750;   // ms 글자 한 개 이동
  const CHAR_STAG  = 52;    // ms 글자 간 딜레이
  const LINE_GAP   = 220;   // ms 줄 간 딜레이
  const SMALL_DUR  = 700;   // ms 소형 텍스트
  const SMALL_EASE = 'cubic-bezier(0.87, 0, 0.13, 1)';

  // 페이지 transition 후 진입이면 살짝 기다렸다가 시작
  const startDelay = sessionStorage.getItem('omix-nav-done') ? 100 : 200;
  sessionStorage.removeItem('omix-nav-done');

  /* ── 글자 분해: .line 텍스트 → 각 char에 clip + inner span ── */
  function splitLine(lineEl) {
    const text = lineEl.textContent.trim();
    lineEl.textContent = '';
    lineEl.style.cssText += 'animation:none;transform:none;display:inline-flex;align-items:baseline;';

    const inners = [];
    [...text].forEach(ch => {
      const clip = document.createElement('span');
      clip.style.cssText = 'display:inline-block;overflow:hidden;vertical-align:bottom;line-height:inherit;';

      const inner = document.createElement('span');
      inner.textContent = ch === ' ' ? ' ' : ch;
      inner.style.cssText = 'display:inline-block;transform:translateX(-110%);will-change:transform;';

      clip.appendChild(inner);
      lineEl.appendChild(clip);
      inners.push(inner);
    });
    return inners;
  }

  /* ── 소형 텍스트 초기 숨김 ── */
  function hideSmall(el) {
    if (!el) return;
    el.style.cssText += 'opacity:0;transform:translateY(28px);animation:none;transition:none;';
  }

  /* ── 소형 텍스트 등장 ── */
  function revealSmall(el, delayMs) {
    if (!el) return;
    setTimeout(() => {
      el.style.transition = `opacity ${SMALL_DUR}ms ${SMALL_EASE}, transform ${SMALL_DUR}ms ${SMALL_EASE}`;
      el.style.opacity    = '1';
      el.style.transform  = 'translateY(0)';
    }, delayMs);
  }

  /* ── 글자 배열 애니메이션 (좌→우) ── */
  function animChars(inners, startMs) {
    inners.forEach((inner, i) => {
      setTimeout(() => {
        inner.style.transition = `transform ${CHAR_DUR}ms ${EASE}`;
        inner.style.transform  = 'translateX(0%)';
      }, startMs + i * CHAR_STAG);
    });
    return startMs + inners.length * CHAR_STAG + CHAR_DUR;
  }

  /* ── 배너 이미지 전체 좌→우 슬라이드 ── */
  function animBanner(el, startMs) {
    if (!el) return startMs;
    el.style.cssText += 'transform:translateX(-60px);opacity:0;animation:none;transition:none;';
    setTimeout(() => {
      el.style.transition = `transform ${CHAR_DUR * 1.1}ms ${EASE}, opacity ${CHAR_DUR * 0.6}ms ease`;
      el.style.transform  = 'translateX(0)';
      el.style.opacity    = '1';
    }, startMs);
    return startMs + CHAR_DUR * 1.1;
  }

  /* ── 점(.) 좌→우 슬라이드 ── */
  function animDot(dotEl, startMs) {
    if (!dotEl) return;
    const clip = document.createElement('span');
    clip.style.cssText = 'display:inline-block;overflow:hidden;vertical-align:bottom;line-height:inherit;';
    const inner = document.createElement('span');
    inner.textContent = '.';
    inner.style.cssText = 'display:inline-block;transform:translateX(-110%);will-change:transform;';
    dotEl.textContent = '';
    clip.appendChild(inner);
    dotEl.appendChild(clip);
    setTimeout(() => {
      inner.style.transition = `transform ${CHAR_DUR}ms ${EASE}`;
      inner.style.transform  = 'translateX(0%)';
    }, startMs);
  }

  /* ── 메인 실행 ── */
  document.addEventListener('DOMContentLoaded', function () {
    // 요소 참조
    const eyebrow  = document.querySelector('.hero-eyebrow');
    const titleRows = document.querySelectorAll('.hero-title .title-row');
    const banner   = document.querySelector('.hero-banner-img');
    const desc     = document.querySelector('.hero-desc');
    const cta      = document.querySelector('.hero-cta');

    // 소형 요소 초기 숨김 (기존 reveal-up 클래스 animation 제거)
    [eyebrow, desc, cta].forEach(hideSmall);

    // 타이틀 줄 분리: delay-t1(Listen), delay-t2(banner), delay-t3(Return)
    let listenInners = [], returnInners = [];
    let listenDot = null, returnDot = null;

    titleRows.forEach(row => {
      const lineEl  = row.querySelector('.line');
      const dotEl   = row.querySelector('.title-dot');
      const bannerEl = row.querySelector('.hero-banner-img');

      if (bannerEl) return; // OMIX 배너 — JS로 별도 처리

      if (lineEl) {
        const inners = splitLine(lineEl);
        if (row.classList.contains('delay-t1')) {
          listenInners = inners;
          listenDot    = dotEl;
        } else if (row.classList.contains('delay-t3')) {
          returnInners = inners;
          returnDot    = dotEl;
        }
        // dot도 초기 숨김
        if (dotEl) {
          dotEl.style.cssText += 'overflow:hidden;';
        }
      }
    });

    // 가이드 오버레이가 닫힌 뒤 실행
    function startReveal() {
      let t = 0;

      // 1. eyebrow (아래→위)
      revealSmall(eyebrow, t);
      t += LINE_GAP;

      // 2. Listen 글자별 좌→우
      const listenEnd = animChars(listenInners, t);
      animDot(listenDot, t + listenInners.length * CHAR_STAG - CHAR_STAG * 0.5);
      t = listenEnd * 0.45 + LINE_GAP;

      // 3. OMIX 배너 좌→우
      const bannerEnd = animBanner(banner, t);
      t = bannerEnd * 0.4 + LINE_GAP;

      // 4. Return 글자별 좌→우
      const returnEnd = animChars(returnInners, t);
      animDot(returnDot, t + returnInners.length * CHAR_STAG - CHAR_STAG * 0.5);
      t = returnEnd * 0.35 + LINE_GAP;

      // 5. desc (아래→위)
      revealSmall(desc, t);
      t += LINE_GAP * 0.8;

      // 6. CTA (아래→위)
      revealSmall(cta, t);
    }

    // 가이드 오버레이 dismiss 감지 — hide 클래스 추가 순간 + 페이드(600ms) 후 실행
    const guide = document.getElementById('guideOverlay');
    if (guide) {
      const observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (m) {
          if (m.target.classList.contains('hide')) {
            observer.disconnect();
            setTimeout(startReveal, 650); // 가이드 페이드아웃(600ms) 완료 후
          }
        });
      });
      observer.observe(guide, { attributes: true, attributeFilter: ['class'] });
    } else {
      // 가이드 없으면 바로 시작
      setTimeout(startReveal, startDelay);
    }
  });
})();
