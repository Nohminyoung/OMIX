/* ── 전광판(도트매트릭스) 티커 — idx-vid-marquee ──
   실제 LED 사인처럼: 화면에 보이는 소켓 그리드(캔버스)는 위치가 완전히 고정.
   캔버스 자체가 좌우로 움직이는 게 아니라, 매 스텝마다 같은 자리에서
   각 소켓의 on/off만 다시 그려서 문구가 흐르는 것처럼 보이게 함(실제 전광판의
   시프트 레지스터 스크롤 방식). 표준 5x7 LED 폰트(Adafruit GFX classic font)로
   글자를 그림. */
(function () {
  const TRACK = document.getElementById('idxVidMqTrack');
  if (!TRACK) return;

  const SEGMENTS = [
    { text: 'LATEST MIX / ', color: 'main' },
    { text: 'VOID MANDALA', color: 'accent' },
    { text: ' / WATCH NOW /   ', color: 'main' }
  ];
  const COLS = 5, ROWS = 7, GAP = 1;
  const STEP_MS = 140; /* 한 칸(column) 이동하는 데 걸리는 시간 — 실제 전광판처럼 한 칸씩 시프트 */

  /* 표준 5x7 LED 폰트 — 문자당 5바이트(열), 각 바이트의 bit0(위)~bit6(아래) */
  const FONT5X7 = {
    ' ': [0x00, 0x00, 0x00, 0x00, 0x00],
    '/': [0x20, 0x10, 0x08, 0x04, 0x02],
    '0': [0x3E, 0x51, 0x49, 0x45, 0x3E],
    '1': [0x00, 0x42, 0x7F, 0x40, 0x00],
    '2': [0x72, 0x49, 0x49, 0x49, 0x46],
    '3': [0x21, 0x41, 0x49, 0x4D, 0x33],
    '4': [0x18, 0x14, 0x12, 0x7F, 0x10],
    '5': [0x27, 0x45, 0x45, 0x45, 0x39],
    '6': [0x3C, 0x4A, 0x49, 0x49, 0x31],
    '7': [0x41, 0x21, 0x11, 0x09, 0x07],
    '8': [0x36, 0x49, 0x49, 0x49, 0x36],
    '9': [0x46, 0x49, 0x49, 0x29, 0x1E],
    ':': [0x00, 0x00, 0x14, 0x00, 0x00],
    'A': [0x7C, 0x12, 0x11, 0x12, 0x7C],
    'B': [0x7F, 0x49, 0x49, 0x49, 0x36],
    'C': [0x3E, 0x41, 0x41, 0x41, 0x22],
    'D': [0x7F, 0x41, 0x41, 0x41, 0x3E],
    'E': [0x7F, 0x49, 0x49, 0x49, 0x41],
    'F': [0x7F, 0x09, 0x09, 0x09, 0x01],
    'G': [0x3E, 0x41, 0x41, 0x51, 0x73],
    'H': [0x7F, 0x08, 0x08, 0x08, 0x7F],
    'I': [0x00, 0x41, 0x7F, 0x41, 0x00],
    'J': [0x20, 0x40, 0x41, 0x3F, 0x01],
    'K': [0x7F, 0x08, 0x14, 0x22, 0x41],
    'L': [0x7F, 0x40, 0x40, 0x40, 0x40],
    'M': [0x7F, 0x02, 0x1C, 0x02, 0x7F],
    'N': [0x7F, 0x04, 0x08, 0x10, 0x7F],
    'O': [0x3E, 0x41, 0x41, 0x41, 0x3E],
    'P': [0x7F, 0x09, 0x09, 0x09, 0x06],
    'Q': [0x3E, 0x41, 0x51, 0x21, 0x5E],
    'R': [0x7F, 0x09, 0x19, 0x29, 0x46],
    'S': [0x26, 0x49, 0x49, 0x49, 0x32],
    'T': [0x03, 0x01, 0x7F, 0x01, 0x03],
    'U': [0x3F, 0x40, 0x40, 0x40, 0x3F],
    'V': [0x1F, 0x20, 0x40, 0x20, 0x1F],
    'W': [0x3F, 0x40, 0x38, 0x40, 0x3F],
    'X': [0x63, 0x14, 0x08, 0x14, 0x63],
    'Y': [0x03, 0x04, 0x78, 0x04, 0x03],
    'Z': [0x61, 0x59, 0x49, 0x4D, 0x43]
  };

  function glyphMatrix(ch) {
    const bytes = FONT5X7[ch] || FONT5X7[' '];
    const matrix = [];
    for (let r = 0; r < ROWS; r++) {
      const row = [];
      for (let c = 0; c < COLS; c++) row.push(((bytes[c] >> r) & 1) === 1);
      matrix.push(row);
    }
    return matrix;
  }

  function buildPhrase() {
    const chars = [];
    SEGMENTS.forEach(seg => {
      seg.text.toUpperCase().split('').forEach(ch => chars.push({ ch, color: seg.color }));
    });
    const totalCols = chars.length * (COLS + GAP) - GAP;
    const matrix = [];
    const colorMap = new Array(totalCols).fill('main');
    for (let r = 0; r < ROWS; r++) matrix.push(new Array(totalCols).fill(false));
    chars.forEach((item, i) => {
      const gm = glyphMatrix(item.ch);
      const off = i * (COLS + GAP);
      for (let c = 0; c < COLS; c++) colorMap[off + c] = item.color;
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) matrix[r][off + c] = gm[r][c];
      }
    });
    return { matrix, cols: totalCols, colorMap };
  }

  const board = buildPhrase();

  /* 캔버스는 한 번 자리 잡으면 다시 움직이지 않음 — 매 스텝마다 같은 좌표에
     다시 그려서 소켓이 켜졌다 꺼지는 것처럼만 보이게 함 */
  TRACK.innerHTML = '';
  const canvas = document.createElement('canvas');
  canvas.className = 'mq-canvas';
  TRACK.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  let cellSize = 7;
  let viewportCols = 0;
  let offset = 0;

  function cellSizeForWidth() {
    const w = window.innerWidth;
    return w < 480 ? 5 : w < 720 ? 6 : 7;
  }

  function measure() {
    cellSize = cellSizeForWidth();
    const containerWidth = TRACK.clientWidth || window.innerWidth;
    viewportCols = Math.min(board.cols, Math.ceil(containerWidth / cellSize) + 1);
    const dpr = window.devicePixelRatio || 1;
    const w = viewportCols * cellSize, h = ROWS * cellSize;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function drawFrame() {
    const w = viewportCols * cellSize, h = ROWS * cellSize;
    ctx.clearRect(0, 0, w, h);
    const r = cellSize * 0.36;
    const baseCol = Math.floor(offset);

    for (let row = 0; row < ROWS; row++) {
      for (let i = 0; i < viewportCols; i++) {
        const srcCol = (baseCol + i) % board.cols;
        const lit = board.matrix[row][srcCol];
        const cx = i * cellSize + cellSize / 2;
        const cy = row * cellSize + cellSize / 2;
        ctx.beginPath();
        if (!lit) {
          const g = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.4, 0.4, cx, cy, r);
          g.addColorStop(0, '#3a1712');
          g.addColorStop(1, '#1c0e0c');
          ctx.fillStyle = g;
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.fill();
          continue;
        }
        const accent = board.colorMap[srcCol] === 'accent';
        ctx.save();
        ctx.shadowColor = accent ? 'rgba(255,194,51,0.6)' : 'rgba(255,68,51,0.6)';
        ctx.shadowBlur = cellSize * 0.9;
        const g = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.4, 0.4, cx, cy, r);
        if (accent) {
          g.addColorStop(0, '#fffbe0'); g.addColorStop(0.55, '#ffc233'); g.addColorStop(1, '#b8790a');
        } else {
          g.addColorStop(0, '#fff2c2'); g.addColorStop(0.55, '#ff4433'); g.addColorStop(1, '#b8230f');
        }
        ctx.fillStyle = g;
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }
  }

  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let lastStep = 0;
  function tick(ts) {
    if (!lastStep) lastStep = ts;
    if (ts - lastStep >= STEP_MS) {
      offset = (offset + 1) % board.cols;
      lastStep = ts;
      drawFrame();
    }
    requestAnimationFrame(tick);
  }

  measure();
  drawFrame();
  if (!reduceMotion) requestAnimationFrame(tick);

  let resizeTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { measure(); drawFrame(); }, 200);
  });
})();
