/* =====================================================
   OMIX — studio.js
   커서 / Nav 스크롤 / 파티클 / BPM / 파형 / 패드 / 플레이어
   ===================================================== */


/* =====================================================
   [1] 커스텀 커서
   .cursor : 레드 테두리 원, 마우스를 12%씩 따라오는 관성
   .cursor-dot: 마우스 위치에 즉시 붙는 작은 점
   ===================================================== */
const cursor    = document.getElementById('cursor');
const cursorDot = document.getElementById('cursorDot');
let mx = -100, my = -100;
let cx = -100, cy = -100;

if (cursor && cursorDot) {
  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    cursorDot.style.left = mx + 'px';
    cursorDot.style.top  = my + 'px';
  });
  function animCursor() {
    cx += (mx - cx) * 0.12;
    cy += (my - cy) * 0.12;
    cursor.style.left = cx + 'px';
    cursor.style.top  = cy + 'px';
    requestAnimationFrame(animCursor);
  }
  animCursor();
}


/* =====================================================
   [2] Nav 스크롤 효과
   스크롤 40px 이상: .scrolled 클래스 추가 → blur 배경
   ===================================================== */
const nav = document.getElementById('nav');
if (nav) {
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  });
}


/* =====================================================
   [3] 파티클 캔버스
   히어로 배경에 100개 점 — 레드 + 보라 두 색상
   위로 떠오르다 수명 다하면 재생성
   ===================================================== */
(function () {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles = [];

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x       = Math.random() * W;
      this.y       = Math.random() * H;
      this.vx      = (Math.random() - 0.5) * 0.3;
      this.vy      = (Math.random() - 0.5) * 0.3 - 0.12;
      this.r       = Math.random() * 1.5 + 0.4;
      this.alpha   = Math.random() * 0.5 + 0.1;
      this.life    = 0;
      this.maxLife = Math.random() * 300 + 200;
      /* 보라(166,71,255) 비율 높여서 Studio 페이지 무드 반영 */
      this.hue = Math.random() > 0.35 ? '166,71,255' : '249,21,54';
    }
    update() {
      this.x += this.vx; this.y += this.vy; this.life++;
      if (this.life > this.maxLife || this.x < 0 || this.x > W || this.y < 0 || this.y > H) this.reset();
    }
    draw() {
      const a = this.alpha * Math.sin(Math.PI * this.life / this.maxLife);
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.hue},${a})`;
      ctx.fill();
    }
  }

  for (let i = 0; i < 100; i++) particles.push(new Particle());

  function loop() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(loop);
  }
  loop();
})();


/* =====================================================
   [4] BPM 카운터
   +/- 버튼 클릭으로 BPM 값 조정 (40~200 범위 제한)
   108: 불교에서 번뇌의 수, OMIX 기본 BPM
   ===================================================== */
const bpmValueEl = document.getElementById('bpmValue');
const bpmDown    = document.getElementById('bpmDown');
const bpmUp      = document.getElementById('bpmUp');
let currentBpm = 108;

function updateBpm(val) {
  /* 40~200 범위 내에서만 변경 */
  currentBpm = Math.min(200, Math.max(40, val));
  if (bpmValueEl) bpmValueEl.textContent = currentBpm;
}

if (bpmDown) bpmDown.addEventListener('click', () => updateBpm(currentBpm - 4));
if (bpmUp)   bpmUp.addEventListener('click',   () => updateBpm(currentBpm + 4));


/* 재생 상태 — 아래 [5] 파형 루프와 [7] 미니 플레이어가 공유한다.
   [5] 의 drawWave() 가 즉시 실행되므로 선언이 [7] 에 있으면
   TDZ(ReferenceError: Cannot access 'isPlaying' before initialization)로
   파형 애니메이션이 첫 프레임에서 죽는다. → 여기서 먼저 선언한다. */
let isPlaying = false;


/* =====================================================
   [5] 파형 시각화 캔버스
   requestAnimationFrame 루프로 실시간 파형 그리기
   sin 함수 기반으로 불규칙 파형 표현
   재생 헤드(.waveform-head)가 진행률에 맞게 이동
   ===================================================== */
(function () {
  const canvas = document.getElementById('waveformCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H;
  let phase = 0;   /* 파형 위상 오프셋 — 매 프레임 증가로 흐르는 효과 */

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = 80;
  }
  window.addEventListener('resize', resize);
  resize();

  function drawWave() {
    ctx.clearRect(0, 0, W, H);

    /* 파형 레이어 2개: 레드(얇음) + 보라(연함) */
    const layers = [
      { color: 'rgba(249,21,54,0.7)',  amp: 22, freq: 0.018, phaseOff: 0 },
      { color: 'rgba(166,71,255,0.35)', amp: 16, freq: 0.024, phaseOff: 1.5 },
    ];

    layers.forEach(layer => {
      ctx.beginPath();
      ctx.strokeStyle = layer.color;
      ctx.lineWidth = 1.5;

      for (let x = 0; x <= W; x++) {
        /* 여러 sin 합성으로 자연스러운 음파 표현 */
        const y = H / 2
          + Math.sin(x * layer.freq + phase + layer.phaseOff) * layer.amp
          + Math.sin(x * layer.freq * 1.7 + phase * 1.3) * (layer.amp * 0.4);

        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
    });

    /* 중앙 기준선 (매우 은은하게) */
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    ctx.moveTo(0, H / 2);
    ctx.lineTo(W, H / 2);
    ctx.stroke();

    /* 재생 중일 때만 위상 이동 (파형이 흐르는 효과) */
    if (isPlaying) phase += 0.04;

    requestAnimationFrame(drawWave);
  }
  drawWave();
})();


/* =====================================================
   [6] 믹스 패드 인터랙션
   클릭 시 .active 클래스 토글
   active 상태: 하단 바 루프 애니메이션 (CSS keyframe)
   ===================================================== */
document.querySelectorAll('.pad-item').forEach(pad => {
  pad.addEventListener('click', () => {
    /* 같은 패드 재클릭 → 비활성화 */
    pad.classList.toggle('active');
  });
});


/* =====================================================
   [7] 미니 플레이어 — 재생/정지
   재생 버튼 클릭: LP 디스크 회전 + 프로그레스바 진행
   파형 캔버스도 재생 상태를 참조해 애니메이션
   ===================================================== */
const playPauseBtn  = document.getElementById('playPauseBtn');
const playerDisc    = document.getElementById('playerDisc');
const progressFill  = document.getElementById('progressFill');
const currentTimeEl = document.getElementById('currentTime');

/* isPlaying 은 [5] 파형 섹션 위에서 미리 선언했다 */
let progress  = 0;
let timer;

function formatTime(pct) {
  const total = 272;   /* 4:32 = 272초 */
  const sec   = Math.floor(total * pct / 100);
  return Math.floor(sec / 60) + ':' + String(sec % 60).padStart(2, '0');
}

if (playPauseBtn && playerDisc && progressFill && currentTimeEl) {
  playPauseBtn.addEventListener('click', () => {
    isPlaying = !isPlaying;
    playPauseBtn.textContent = isPlaying ? '⏸' : '▶';

    if (isPlaying) {
      playerDisc.classList.add('spinning');
      timer = setInterval(() => {
        progress = Math.min(progress + 0.05, 100);
        progressFill.style.width       = progress + '%';
        currentTimeEl.textContent = formatTime(progress);
        if (progress >= 100) {
          clearInterval(timer);
          isPlaying = false;
          playPauseBtn.textContent = '▶';
        }
      }, 100);
    } else {
      playerDisc.classList.remove('spinning');
      clearInterval(timer);
    }
  });
}


/* =====================================================
   [8] 프로그레스바 클릭 → 재생 위치 이동
   ===================================================== */
const progressBar = document.getElementById('progressBar');
if (progressBar) {
  progressBar.addEventListener('click', e => {
    const rect = progressBar.getBoundingClientRect();
    progress = ((e.clientX - rect.left) / rect.width) * 100;
    if (progressFill)  progressFill.style.width = progress + '%';
    if (currentTimeEl) currentTimeEl.textContent = formatTime(progress);
  });
}


/* =====================================================
   [9] 좋아요 버튼 토글
   ♡ ↔ ♥ + 레드(#F91536) 색상 전환
   ===================================================== */
const playerLike = document.getElementById('globalLike');
if (playerLike) {
  playerLike.addEventListener('click', () => {
    const liked = playerLike.textContent === '♡';
    playerLike.textContent = liked ? '♥' : '♡';
    playerLike.style.color = liked ? 'var(--red)' : '';
  });
}


/* =====================================================
   [10] 모바일 햄버거 메뉴
   640px 이하에서 표시
   .mobile-open 클래스를 토글해 CSS로 드롭다운 제어
   (z-index: 600 → marquee·nav 위에 표시됨)
   ===================================================== */
const hamburger = document.getElementById('hamburger');
const navLinks  = document.querySelector('.nav-menu');

if (hamburger) {
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    if (navLinks) navLinks.classList.toggle('mobile-open');
  });
}


/* =====================================================
   개발자 콘솔 메시지
   ===================================================== */
console.log('%cOMIX STUDIO 🎛️ Produce. Mix. Release.', 'color:#A647FF;font-size:16px;font-weight:700;');
