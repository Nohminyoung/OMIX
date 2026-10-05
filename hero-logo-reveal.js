/* ══════════════════════════════════════════════════════════════════
   히어로 OMIX 로고 — 블록 디더 리빌
   ------------------------------------------------------------------
   gleec.com 이 WebGL(MSDF 텍스트) 셰이더로 만드는 리빌 효과를
   SVG 마스크로 이식한 것. 원 셰이더의 핵심 수식:

     pattern   = rand(floor(layoutUv * patternScale))        // 블록 노이즈
     p         = smoothstep(P, P + maskWidth, st.x)          // 좌→우 스윕
     mixFactor = smoothstep(0, stepSize, -pattern + p * 2)   // ← 경계를 흩뿌림

   스윕 마스크에서 노이즈를 빼기 때문에 경계가 매끄럽게 넘어가지 않고
   블록 단위로 지글거린다. 여기에 레이어를 시차로 쌓아
   고스트 외곽선 → 빨간 외곽선 → 주황 그라디언트 → 최종 채움 순으로 채운다.

   WebGL 대신 SVG를 쓰는 이유:
     · 로고가 스크롤에 따라 네비 로고 자리까지 축소·이동한다 → 벡터로 남아야 선명
     · 스크롤 스크립트가 color-mix 로 빨강→흰색 크로스페이드한다
       → 최종 레이어가 fill="currentColor" 여야 그 로직이 그대로 동작
   ══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var svg = document.getElementById('idxHeroName');
  if (!svg) return;

  var L = {
    l3: document.getElementById('omixHeroL3'),
    l4: document.getElementById('omixHeroL4')
  };
  var IMG = {
    l3: document.getElementById('omixHeroImg3'),
    l4: document.getElementById('omixHeroImg4')
  };
  if (!L.l3 || !L.l4 || !IMG.l3 || !IMG.l4) return;

  /* 로고 비율 362.97 : 105.73 ≈ 3.43 — 가로 블록을 더 촘촘히 */
  var BX = 24, BY = 7;

  /* 블록 노이즈는 한 번만 만들어 고정 (원본도 정적 노이즈다) */
  var noise = [];
  for (var y = 0; y < BY; y++) {
    noise[y] = [];
    for (var x = 0; x < BX; x++) noise[y][x] = Math.random();
  }

  /* 실측 상수 — 마지막 채움만 step 0.2 라서 경계가 가장 날카롭다.
     delay 차이가 흰색이 머무는 시간이다. 벌릴수록 흰→액센트 전환이 뚜렷해진다. */
  var MASK_WIDTH = 1;
  var LAYERS = [
    { key: 'l3', delay: 0,    step: 1   },   /* 흰 채움 */
    { key: 'l4', delay: 0.18, step: 0.2 }    /* 액센트 채움 */
  ];
  var DUR = 1.0;

  /* 흰색이 사라지는 속도 배수. 1.0 이면 액센트가 100% 찼을 때 비로소 흰색이 0 이
     되는데, 그 직전 구간에 흰색이 2.6% 남아 글자 외곽 AA 픽셀에서 실선으로 보인다.
     1보다 크게 잡아 액센트가 다 차기 전에 흰색을 완전히 없앤다.
     반대로 너무 크면 전환 경계에서 두 색이 모두 옅어져 커버리지가 떨어진다.
     실측(실선잔량 / 경계 최소알파): 1.0 → 0.026/0.75, 1.05 → 0/0.738,
     1.2 → 0/0.70, 1.4 → 0/0.65. 실선이 사라지는 최소값인 1.05 를 쓴다. */
  var WHITE_CUT = 1.05;

  function mapRange(v, a, b, c, d) { return c + (v - a) * (d - c) / (b - a); }
  function smoothstep(e0, e1, x) {
    var t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
    return t * t * (3 - 2 * t);
  }
  function sweep(progress, st) {
    var p = mapRange(progress, 0, 1, 0 - MASK_WIDTH, 1);
    return smoothstep(p, p + MASK_WIDTH, st);
  }
  /* 가시성 = 1 - mixFactor */
  function visibility(progress, st, pattern, step) {
    return 1 - smoothstep(0, step, -pattern + sweep(progress, st) * 2);
  }

  /* 블록 해상도 그대로 그리고 image-rendering:pixelated 로 확대 → 계단이 살아난다 */
  var cvs = {};
  ['l3', 'l4'].forEach(function (k) {
    var c = document.createElement('canvas');
    c.width = BX; c.height = BY;
    cvs[k] = { cv: c, ctx: c.getContext('2d') };
  });

  /* 두 마스크를 함께 그린다.
     ── 왜 따로 그리지 않는가 ──
     흰 채움 위에 액센트 채움을 겹쳐 그리면, 글자 외곽의 안티앨리어싱 픽셀에서
     위 레이어가 아래를 완전히 덮지 못한다. 두 레이어 모두 그 픽셀에서 부분
     투명이라, 아래의 흰색이 비쳐 글자 테두리에 얇은 흰 실선이 남는다.
     그래서 액센트가 도착한 자리에서는 흰색을 빼버린다 → 두 레이어가 겹치지 않는다. */
  function paintMasks(p3, p4) {
    var img3 = cvs.l3.ctx.createImageData(BX, BY);
    var img4 = cvs.l4.ctx.createImageData(BX, BY);

    for (var y = 0; y < BY; y++) {
      for (var x = 0; x < BX; x++) {
        var st = (x + 0.5) / BX;
        var pat = noise[y][x];

        var v4 = visibility(p4, st, pat, LAYERS[1].step);   /* 액센트 */
        var v3 = visibility(p3, st, pat, LAYERS[0].step);   /* 흰색 */

        /* 액센트가 온 곳의 흰색은 제거.
           단순히 (1 - v4) 로 빼면 v4 가 0.98 일 때 흰색이 2% 남고, 그 잔량이
           글자 외곽 AA 픽셀에서 실선으로 보인다. WHITE_CUT 배수를 곱해
           액센트가 완전히 차오르기 조금 전에 흰색이 정확히 0 이 되게 한다. */
        var w  = v3 * (1 - Math.min(1, v4 * WHITE_CUT));

        var o = (y * BX + x) * 4;
        var g3 = Math.round(Math.min(1, Math.max(0, w))  * 255);
        var g4 = Math.round(Math.min(1, Math.max(0, v4)) * 255);

        img3.data[o] = img3.data[o + 1] = img3.data[o + 2] = g3;  /* 휘도 마스크 */
        img3.data[o + 3] = 255;
        img4.data[o] = img4.data[o + 1] = img4.data[o + 2] = g4;
        img4.data[o + 3] = 255;
      }
    }

    cvs.l3.ctx.putImageData(img3, 0, 0);
    cvs.l4.ctx.putImageData(img4, 0, 0);
    IMG.l3.setAttribute('href', cvs.l3.cv.toDataURL());
    IMG.l4.setAttribute('href', cvs.l4.cv.toDataURL());
  }

  function armMasks() {
    L.l3.setAttribute('mask', 'url(#omixHeroMask3)');
    L.l4.setAttribute('mask', 'url(#omixHeroMask4)');
    L.l3.setAttribute('opacity', '1');
  }

  /* 리빌 종료 — 마스크를 떼어 평상시 상태로 되돌린다.
     이후 스크롤 스크립트가 transform/color 를 마음대로 제어할 수 있다. */
  function disarmMasks() {
    L.l3.removeAttribute('mask');
    L.l4.removeAttribute('mask');
    L.l3.setAttribute('opacity', '0');
  }

  var easeSineInOut = function (t) { return -(Math.cos(Math.PI * t) - 1) / 2; };
  var raf = null, t0 = null, guard = null, hasPlayedOnce = false;

  function progressAt(t, delay) {
    var e = (t - delay) / DUR;
    return e <= 0 ? 0 : (e >= 1 ? 1 : easeSineInOut(e));
  }

  function frame(now) {
    if (t0 === null) t0 = now;
    var t = (now - t0) / 1000;

    var p3 = progressAt(t, LAYERS[0].delay);
    var p4 = progressAt(t, LAYERS[1].delay);
    var allDone = (p3 >= 1 && p4 >= 1);

    paintMasks(p3, p4);

    if (!allDone) {
      raf = requestAnimationFrame(frame);
    } else {
      raf = null;
      clearTimeout(guard);
      disarmMasks();
    }
  }

  function prefersReducedMotion() {
    return !!(window.matchMedia &&
              window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  function play() {
    /* 모션을 줄이도록 설정한 사용자에게는 리빌을 건너뛴다 —
       마스크를 아예 붙이지 않으므로 로고는 그냥 평소대로 보인다 */
    if (prefersReducedMotion()) {
      hasPlayedOnce = true;
      disarmMasks();
      return;
    }

    /* 재생 중이면 초기화하고 처음부터 — 테마를 연달아 바꿔도 안전 */
    if (raf) { cancelAnimationFrame(raf); raf = null; }
    clearTimeout(guard);

    hasPlayedOnce = true;
    paintMasks(0, 0);
    armMasks();
    t0 = null;
    raf = requestAnimationFrame(frame);

    /* rAF 가 끝내 진행되지 않는 환경(백그라운드 탭 등)에서도 로고가
       마스크에 갇히지 않도록 하는 안전장치 */
    guard = setTimeout(function () {
      if (raf) { cancelAnimationFrame(raf); raf = null; }
      disarmMasks();
    }, (DUR + 0.30) * 1000 + 1500);
  }

  /* 테마 색이 바뀔 때 다시 재생 — 새 액센트가 흰색 위로 쓸려 들어온다.
     아직 최초 리빌 전이라면(로딩/가이드 단계) 아무것도 하지 않는다. 그때
     재생해 버리면 로고가 등장하기도 전에 리빌이 소모된다. */
  function replayForThemeChange() {
    if (!hasPlayedOnce) return;
    play();
  }

  /* ── 로드 즉시 로고를 '비어 있는' 상태로 만든다 ──
     이걸 안 하면 hnLogoIn 이 원본 로고를 다 띄운 뒤에야 마스크가 붙어서
     로고가 한 번 사라졌다 다시 그려지는 것처럼 보인다.
     히어로 로고는 hn-play 전까지 CSS 로 opacity:0 이므로, 지금 가려두어도
     화면상 달라지는 것은 없다. */
  if (!prefersReducedMotion()) {
    paintMasks(0, 0);
    armMasks();
  }

  window.__omixHeroLogoReveal = play;
  window.__omixHeroLogoReplay = replayForThemeChange;
})();
