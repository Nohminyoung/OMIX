/* ── 옴(Om) 공명 파장 — 마우스 트래킹 커서 이펙트 ──
   화면 전체를 덮는 고정 캔버스에 커서를 따라 옅게 일그러진(=공명처럼 울리는)
   파장을 그림. 색은 테마 스위처가 --red 변수에 저장하는 값을 매 프레임 읽어와
   테마를 바꾸면 파장 색도 즉시 같이 바뀜. pointer-events:none이라 클릭/터치를
   가로채지 않음. */
(function () {
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const canvas = document.createElement('canvas');
  canvas.id = 'omResonanceCanvas';
  canvas.style.cssText = 'position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;z-index:60;';
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  let dpr = Math.min(window.devicePixelRatio || 1, 2);
  let W = 0, H = 0;
  function resize() {
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize);

  function hexToRgb(hex) {
    const v = (hex || '').trim().replace('#', '');
    if (v.length !== 6) return { r: 249, g: 21, b: 54 };
    return {
      r: parseInt(v.substring(0, 2), 16),
      g: parseInt(v.substring(2, 4), 16),
      b: parseInt(v.substring(4, 6), 16)
    };
  }
  function currentAccentRgb() {
    const v = getComputedStyle(document.documentElement).getPropertyValue('--red');
    return hexToRgb(v);
  }

  let mouseX = null, mouseY = null, active = false, lastSpawn = 0, breatheT = 0;
  const ripples = [];
  const RIPPLE_LIFE = 1500; /* ms */
  const SPAWN_GAP = 90;     /* ms, 움직일 때 파장 생성 간격 */

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX; mouseY = e.clientY;
    active = true;
    const now = performance.now();
    if (now - lastSpawn > SPAWN_GAP) {
      ripples.push({ x: mouseX, y: mouseY, born: now, seed: Math.random() * Math.PI * 2 });
      lastSpawn = now;
    }
  }, { passive: true });

  document.addEventListener('mouseleave', () => { active = false; });
  document.addEventListener('visibilitychange', () => { if (document.hidden) active = false; });

  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

  function drawWobblyRing(x, y, radius, alpha, seed, lineWidth, rgb) {
    const segments = 72;
    ctx.beginPath();
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      const wobble = Math.sin(angle * 6 + seed) * radius * 0.035
                   + Math.sin(angle * 3 - seed * 1.7) * radius * 0.02;
      const rad = radius + wobble;
      const px = x + Math.cos(angle) * rad;
      const py = y + Math.sin(angle) * rad;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.strokeStyle = 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',' + alpha + ')';
    ctx.lineWidth = lineWidth;
    ctx.shadowColor = 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',' + (alpha * 0.9) + ')';
    ctx.shadowBlur = 14;
    ctx.stroke();
  }

  function frame(now) {
    ctx.clearRect(0, 0, W, H);
    const rgb = currentAccentRgb();

    for (let i = ripples.length - 1; i >= 0; i--) {
      const rp = ripples[i];
      const t = (now - rp.born) / RIPPLE_LIFE;
      if (t >= 1) { ripples.splice(i, 1); continue; }
      const eased = easeOutCubic(t);
      const radius = 5 + eased * Math.min(W, H) * 0.06;
      const alpha = (1 - t) * 0.55;
      drawWobblyRing(rp.x, rp.y, radius, alpha, rp.seed, 1.4, rgb);
    }

    if (active && mouseX !== null) {
      breatheT += 0.028;
      const pulse = (Math.sin(breatheT) + 1) / 2;
      const r1 = 9 + pulse * 6;
      drawWobblyRing(mouseX, mouseY, r1, 0.5 + pulse * 0.25, breatheT * 2, 1, rgb);

      /* 옴(ॐ) 표식 — 아주 은은하게 */
      ctx.save();
      ctx.globalAlpha = 0.16 + pulse * 0.12;
      ctx.fillStyle = 'rgb(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ')';
      ctx.font = (14 + pulse * 2) + 'px "Noto Sans", "Segoe UI Symbol", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',0.8)';
      ctx.shadowBlur = 16;
      ctx.fillText('ॐ', mouseX, mouseY);
      ctx.restore();
    }

    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
