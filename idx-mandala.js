// ══ 히어로 배경: 점선으로 그린 자잘한 연꽃/별/만다라가 별자리처럼 흩어진 인터랙티브 캔버스 ══
(function () {
  const canvas = document.getElementById('idxMandala');
  if (!canvas) return;
  const hero = canvas.closest('.idx-hero');
  const ctx = canvas.getContext('2d');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const GOLD = '237,225,196';
  const RED = '249,21,54';

  // ── 템플릿: ctx가 이미 인스턴스 중심으로 translate/rotate 된 상태에서, r(px)을 곱해 그린다 ──
  function drawLotus(r) {
    const outerC1 = { x: -0.19, y: -0.62 }, outerC2 = { x: -0.19, y: -1.1 }, outerTip = { x: 0, y: -1.34 };
    const outerC1b = { x: 0.19, y: -1.1 }, outerC2b = { x: 0.19, y: -0.62 };
    const innerC1 = { x: -0.13, y: -0.4 }, innerC2 = { x: -0.13, y: -0.72 }, innerTip = { x: 0, y: -0.9 };
    const innerC1b = { x: 0.13, y: -0.72 }, innerC2b = { x: 0.13, y: -0.4 };
    for (let i = 0; i < 8; i++) {
      ctx.save();
      ctx.rotate(i * Math.PI / 4);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(outerC1.x * r, outerC1.y * r, outerC2.x * r, outerC2.y * r, outerTip.x * r, outerTip.y * r);
      ctx.bezierCurveTo(outerC1b.x * r, outerC1b.y * r, outerC2b.x * r, outerC2b.y * r, 0, 0);
      ctx.stroke();
      ctx.restore();
    }
    for (let i = 0; i < 8; i++) {
      ctx.save();
      ctx.rotate(i * Math.PI / 4 + Math.PI / 8);
      ctx.globalAlpha *= 0.75;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(innerC1.x * r, innerC1.y * r, innerC2.x * r, innerC2.y * r, innerTip.x * r, innerTip.y * r);
      ctx.bezierCurveTo(innerC1b.x * r, innerC1b.y * r, innerC2b.x * r, innerC2b.y * r, 0, 0);
      ctx.stroke();
      ctx.restore();
    }
  }

  function drawStar(r, withRing) {
    const spikes = 8, outerR = 1, innerR = 0.38;
    ctx.beginPath();
    for (let i = 0; i <= spikes * 2; i++) {
      const rad = i % 2 === 0 ? outerR : innerR;
      const a = (i / (spikes * 2)) * Math.PI * 2;
      const x = Math.cos(a) * rad * r, y = Math.sin(a) * rad * r;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
    if (withRing) {
      ctx.save();
      ctx.globalAlpha *= 0.5;
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.62, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }

  function drawRing(r) {
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.save();
    ctx.globalAlpha *= 0.7;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.6, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
    ctx.save();
    ctx.globalAlpha *= 0.55;
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      const x1 = Math.cos(a) * r, y1 = Math.sin(a) * r;
      const x2 = Math.cos(a) * r * 1.12, y2 = Math.sin(a) * r * 1.12;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
    ctx.restore();
  }

  const DRAWERS = {
    lotus: (r) => drawLotus(r),
    star: (r) => drawStar(r, false),
    starRing: (r) => drawStar(r, true),
    ring: (r) => drawRing(r)
  };

  // ── 화면에 흩뿌릴 모티프 인스턴스 (위치는 히어로 비율, r은 기준 픽셀 반경) ──
  const INSTANCE_DEFS = [
    { tpl: 'star',     xr: 0.08, yr: 0.14, r: 24 },
    { tpl: 'star',     xr: 0.40, yr: 0.12, r: 18 },
    { tpl: 'lotus',    xr: 0.15, yr: 0.28, r: 56, accent: true },
    { tpl: 'lotus',    xr: 0.86, yr: 0.20, r: 70, accent: true },
    { tpl: 'starRing', xr: 0.58, yr: 0.30, r: 22 },
    { tpl: 'star',     xr: 0.96, yr: 0.36, r: 13 },
    { tpl: 'ring',     xr: 0.50, yr: 0.46, r: 34, accent: true },
    { tpl: 'ring',     xr: 0.93, yr: 0.44, r: 20 },
    { tpl: 'star',     xr: 0.77, yr: 0.54, r: 18 },
    { tpl: 'lotus',    xr: 0.17, yr: 0.68, r: 74, accent: true },
    { tpl: 'star',     xr: 0.40, yr: 0.66, r: 15 },
    { tpl: 'lotus',    xr: 0.78, yr: 0.72, r: 58 },
    { tpl: 'starRing', xr: 0.58, yr: 0.82, r: 14 },
    { tpl: 'star',     xr: 0.09, yr: 0.86, r: 16 },
    { tpl: 'star',     xr: 0.28, yr: 0.48, r: 11 }
  ];

  let w = 0, h = 0, dpr = 1;
  const mouse = { x: -9999, y: -9999 };
  let instances = [];
  let stars = [];

  function build() {
    instances = INSTANCE_DEFS.map((d) => ({
      cx: d.xr * w, cy: d.yr * h, r: d.r, tpl: d.tpl, accent: !!d.accent,
      angle: Math.random() * Math.PI * 2,
      angleSpeed: (Math.random() * 2 - 1) * (Math.PI * 2 / (150000 + Math.random() * 180000)),
      dashOffset: Math.random() * 20,
      phase: Math.random() * Math.PI * 2
    }));
    const count = Math.round((w * h) / 4200);
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      size: Math.random() * 1.1 + 0.4,
      baseAlpha: 0.15 + Math.random() * 0.35,
      phase: Math.random() * Math.PI * 2,
      twinkleSpeed: 0.3 + Math.random() * 0.7
    }));
  }

  function resize() {
    dpr = window.devicePixelRatio || 1;
    w = hero.clientWidth;
    h = hero.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    build();
  }

  const MOUSE_RADIUS = 220;

  function draw(now) {
    ctx.clearRect(0, 0, w, h);

    // 은하수 같은 잔별
    for (const p of stars) {
      const twinkle = 0.6 + 0.4 * Math.sin(now * 0.0009 * p.twinkleSpeed + p.phase);
      const dx = p.x - mouse.x, dy = p.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      let glow = 0, x = p.x, y = p.y;
      if (dist < 130) {
        glow = (130 - dist) / 130;
        const d = dist || 1;
        x += (dx / d) * glow * 8;
        y += (dy / d) * glow * 8;
      }
      const alpha = Math.min(1, p.baseAlpha * twinkle + glow * 0.5);
      ctx.beginPath();
      ctx.fillStyle = 'rgba(' + GOLD + ',' + alpha + ')';
      ctx.arc(x, y, p.size * (1 + glow * 0.6), 0, Math.PI * 2);
      ctx.fill();
    }

    // 흩어진 연꽃/별/만다라 — 점선 스트로크, 마우스 가까이 오면 밝아지고 살짝 커짐
    for (const inst of instances) {
      inst.angle += inst.angleSpeed * 16;
      inst.dashOffset += 0.01;

      const dx = inst.cx - mouse.x, dy = inst.cy - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const proximity = Math.max(0, 1 - dist / MOUSE_RADIUS);

      const twinkle = 0.82 + 0.18 * Math.sin(now * 0.0006 + inst.phase);
      const alpha = (0.4 + proximity * 0.5) * twinkle;

      ctx.save();
      ctx.translate(inst.cx, inst.cy);
      ctx.rotate(inst.angle);
      ctx.lineWidth = 1 + proximity * 0.7;
      ctx.setLineDash([1.1, 3.6]);
      ctx.lineDashOffset = inst.dashOffset;
      ctx.strokeStyle = 'rgba(' + GOLD + ',' + alpha + ')';
      if (proximity > 0.05) {
        ctx.shadowColor = 'rgba(' + GOLD + ',0.8)';
        ctx.shadowBlur = 8 * proximity;
      }
      DRAWERS[inst.tpl](inst.r);
      ctx.shadowBlur = 0;

      const dotColor = inst.accent ? RED : GOLD;
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.fillStyle = 'rgba(' + dotColor + ',' + Math.min(1, 0.75 + proximity * 0.25) + ')';
      ctx.arc(0, 0, (inst.accent ? 2 : 1.3) + proximity * 1.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    requestAnimationFrame(draw);
  }

  hero.addEventListener('mousemove', (e) => {
    const rect = hero.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });
  hero.addEventListener('mouseleave', () => {
    mouse.x = -9999;
    mouse.y = -9999;
  });
  window.addEventListener('resize', resize);

  resize();
  if (!reduceMotion) {
    requestAnimationFrame(draw);
  } else {
    draw(0);
  }
})();
