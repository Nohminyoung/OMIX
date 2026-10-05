/* =====================================================
   OMIX — card-overlay.js
   QR 스캔 도착: index.html?card=<id> 로 접속하면
   메인 페이지 위에 오버레이로 내 트랙 카드를 띄운다.
   카드 디자인: 트레이딩 카드형 — 모서리를 깎은 네온 프레임 + 아트 + 하단 정보 패널
   (법명 · 곡명 · 파형 진행바 · 바코드). 화면 높이에 맞춰 카드 크기를 정해 모바일에서 잘리지 않는다.
   ===================================================== */
(function () {
  const cardId = new URLSearchParams(window.location.search).get('card');
  if (!cardId) return;

  const API_BASE = (window.OMIX_EXHIBIT_CONFIG && window.OMIX_EXHIBIT_CONFIG.API_BASE) || 'http://localhost:3000';

  /* 카드 아트 — 서버가 card.imageUrl 을 주면 그걸, 없으면 기본 아트 */
  const DEFAULT_ART = 'about-04-artist.jpg';

  /* 데모 카드 — index.html?card=demo 로 열면 서버 없이 로컬 샘플 곡으로 카드를 띄운다 (디자인 확인용) */
  const DEMO_CARD = {
    id: 'demo', cardNumber: 0, djName: 'DJ 선음', trackName: '공즉 (DEMO)',
    audioUrl: 'music/' + encodeURIComponent('공즉') + '.mp3',
    ext: 'mp3', size: 4289747, createdAt: Date.now(),
  };

  /* 받은 트랙 저장소 — my-player.html 의 'QR로 받은 트랙' 칸이 같은 키를 읽는다 */
  const LIVE_KEY = 'omix_live_tracks';
  function saveLiveTrack(card, audioSrc) {
    try {
      const list = JSON.parse(localStorage.getItem(LIVE_KEY) || '[]').filter(t => t.id !== card.id);
      list.unshift({
        id: card.id, cardNumber: card.cardNumber, djName: card.djName,
        trackName: card.trackName, audioSrc, createdAt: card.createdAt,
      });
      localStorage.setItem(LIVE_KEY, JSON.stringify(list.slice(0, 30)));
    } catch (e) {}
  }

  const WAVE_BARS = 44;

  const style = document.createElement('style');
  style.textContent = `
    #cdoOverlay {
      --cdo-red: var(--red, #F91536);
      --cdo-glow: color-mix(in srgb, var(--cdo-red) 55%, transparent);
      --cdo-dim: color-mix(in srgb, var(--cdo-red) 28%, transparent);
      /* 카드 크기: 폭은 화면 92% (최대 400px), 높이는 화면에서 위아래 여백·버튼 몫을 뺀 만큼까지 */
      --cdo-w: min(92vw, 400px);
      --cdo-h: min(calc(var(--cdo-w) * 1.38), calc(100vh - 150px));
      position: fixed; inset: 0; z-index: 9600;
      background:
        radial-gradient(120% 70% at 50% 45%, color-mix(in srgb, var(--cdo-red) 16%, transparent), transparent 70%),
        rgba(4,4,4,0.94);
      backdrop-filter: blur(10px);
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      gap: 14px;
      padding: max(52px, env(safe-area-inset-top)) 16px max(18px, env(safe-area-inset-bottom));
      overflow-y: auto; overscroll-behavior: contain;
    }
    @supports (height: 100dvh) {
      #cdoOverlay { --cdo-h: min(calc(var(--cdo-w) * 1.38), calc(100dvh - 150px)); }
    }
    #cdoOverlay .cdo-close {
      position: fixed; top: max(14px, env(safe-area-inset-top)); right: 14px; z-index: 2;
      width: 38px; height: 38px; border-radius: 50%;
      border: 1px solid rgba(255,255,255,0.18);
      background: rgba(0,0,0,0.4); color: #fff;
      font-size: 16px; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: border-color .2s, color .2s;
    }
    #cdoOverlay .cdo-close:hover { border-color: var(--cdo-red); color: var(--cdo-red); }

    .cdo-status { text-align: center; color: rgba(255,255,255,0.5); font-size: 14px; }
    .cdo-status .cdo-big { font-size: 40px; display: block; margin-bottom: 16px; opacity: .4; }

    /* ── 프레임: 바깥 글로우 → 레드 테두리(깎인 모서리) → 안쪽 카드 ── */
    .cdo-glow {
      flex-shrink: 0;
      filter: drop-shadow(0 0 14px var(--cdo-glow)) drop-shadow(0 0 2px var(--cdo-red));
      animation: cdo-in .7s cubic-bezier(.2,.8,.2,1) both;
    }
    .cdo-frame {
      --cut: 22px;
      width: var(--cdo-w); height: var(--cdo-h);
      padding: 2px;
      background: linear-gradient(160deg, var(--cdo-red), color-mix(in srgb, var(--cdo-red) 45%, #000) 45%, var(--cdo-red));
      clip-path: polygon(var(--cut) 0, calc(100% - var(--cut)) 0, 100% var(--cut), 100% calc(100% - var(--cut)),
                         calc(100% - var(--cut)) 100%, var(--cut) 100%, 0 calc(100% - var(--cut)), 0 var(--cut));
    }
    .cdo-card {
      --cut: 21px;
      position: relative; width: 100%; height: 100%;
      display: flex; flex-direction: column;
      background: #070707; color: #fff; overflow: hidden;
      clip-path: inherit;
    }
    /* 안쪽 코너 브래킷 */
    .cdo-br { position: absolute; width: 16px; height: 16px; z-index: 3; border-color: var(--cdo-red); border-style: solid; opacity: .9; pointer-events: none; }
    .cdo-br.tl { top: 10px; left: 10px; border-width: 1.5px 0 0 1.5px; }
    .cdo-br.tr { top: 10px; right: 10px; border-width: 1.5px 1.5px 0 0; }
    .cdo-br.bl { bottom: 10px; left: 10px; border-width: 0 0 1.5px 1.5px; }
    .cdo-br.br { bottom: 10px; right: 10px; border-width: 0 1.5px 1.5px 0; }

    /* ── 아트 영역 (화면이 짧으면 여기만 줄어든다) ── */
    .cdo-art { position: relative; flex: 1 1 auto; min-height: 120px; overflow: hidden; }
    .cdo-art img {
      position: absolute; inset: 0; width: 100%; height: 100%;
      object-fit: cover; object-position: 50% 58%;
      filter: saturate(1.05) contrast(1.05);
    }
    .cdo-art::before { /* 레드 틴트 + 스캔라인 */
      content: ''; position: absolute; inset: 0; z-index: 1;
      background:
        repeating-linear-gradient(0deg, transparent 0 3px, rgba(0,0,0,.18) 3px 4px),
        linear-gradient(to bottom, rgba(0,0,0,.72), transparent 34%),
        radial-gradient(90% 60% at 50% 40%, transparent 40%, rgba(0,0,0,.55) 100%);
    }
    .cdo-art::after { /* 아래 패널로 자연스럽게 이어지는 페이드 */
      content: ''; position: absolute; left: 0; right: 0; bottom: 0; height: 38%; z-index: 1;
      background: linear-gradient(to bottom, transparent, #070707);
    }
    .cdo-num {
      position: absolute; top: 20px; left: 22px; z-index: 2;
      font-size: clamp(30px, 10vw, 40px); font-weight: 900; line-height: 1; letter-spacing: .02em;
      text-shadow: 0 2px 12px rgba(0,0,0,.6);
    }
    .cdo-num-label {
      display: block; margin-top: 6px;
      font-size: 11px; font-weight: 800; letter-spacing: .2em; color: var(--cdo-red);
      text-shadow: 0 1px 6px rgba(0,0,0,.9);
    }
    .cdo-live {
      position: absolute; top: 20px; right: 22px; z-index: 2;
      width: 42px; height: 42px; border-radius: 50%;
      border: 1.5px solid rgba(255,255,255,.75);
      display: flex; align-items: center; justify-content: center; flex-direction: column; gap: 2px;
      font-size: 8px; font-weight: 800; letter-spacing: .12em;
      background: rgba(0,0,0,.35);
    }
    .cdo-live::before {
      content: ''; width: 6px; height: 6px; border-radius: 50%; background: var(--cdo-red);
      box-shadow: 0 0 8px var(--cdo-red); animation: cdo-blink 1.6s ease-in-out infinite;
    }

    /* ── 하단 정보 패널 ── */
    .cdo-panel {
      position: relative; z-index: 2; flex: 0 0 auto;
      margin: -10px 12px 12px; padding: 14px 16px 12px;
      border: 1px solid var(--cdo-dim);
      background: linear-gradient(180deg, rgba(10,10,10,.92), rgba(6,6,6,.98));
    }
    .cdo-row1 { display: flex; align-items: baseline; justify-content: space-between; gap: 10px; }
    .cdo-name { display: flex; align-items: baseline; gap: 10px; min-width: 0; }
    .cdo-name-label { font-size: 15px; font-weight: 800; color: var(--cdo-red); flex-shrink: 0; }
    .cdo-dj {
      font-size: clamp(28px, 9vw, 36px); font-weight: 900; line-height: 1.05; letter-spacing: -.01em;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin: 0;
    }
    .cdo-len { font-size: 13px; font-weight: 700; letter-spacing: .08em; color: var(--cdo-red); flex-shrink: 0; }
    .cdo-track {
      margin: 6px 0 12px; font-size: 11px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase;
      color: var(--cdo-red); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .cdo-row3 { display: flex; align-items: center; gap: 10px; }
    .cdo-pbtn {
      width: 40px; height: 40px; flex-shrink: 0; border-radius: 50%;
      border: 1.5px solid var(--cdo-red); background: transparent; color: var(--cdo-red);
      display: flex; align-items: center; justify-content: center; cursor: pointer;
      transition: background .2s, color .2s, box-shadow .2s;
    }
    .cdo-pbtn:hover, .cdo-pbtn.playing { background: var(--cdo-red); color: #fff; box-shadow: 0 0 14px var(--cdo-glow); }
    .cdo-wave-wrap { flex: 1; min-width: 0; }
    .cdo-wave {
      height: 30px; display: flex; align-items: center; gap: 2px; cursor: pointer;
    }
    .cdo-wave i {
      flex: 1; min-width: 1px; border-radius: 1px;
      background: var(--cdo-dim); transition: background .15s;
    }
    .cdo-wave i.on { background: var(--cdo-red); box-shadow: 0 0 4px var(--cdo-glow); }
    .cdo-time { display: flex; justify-content: space-between; margin-top: 4px; font-size: 10px; color: rgba(255,255,255,.4); letter-spacing: .06em; }
    .cdo-code { flex-shrink: 0; width: 76px; text-align: center; }
    .cdo-barcode {
      height: 26px; border: 1px solid var(--cdo-dim); padding: 3px;
      background: repeating-linear-gradient(90deg,
        var(--cdo-red) 0 1px, transparent 1px 3px, var(--cdo-red) 3px 5px, transparent 5px 6px,
        var(--cdo-red) 6px 7px, transparent 7px 10px) content-box;
    }
    .cdo-code-text { margin-top: 4px; font-size: 8.5px; letter-spacing: .08em; color: rgba(255,255,255,.7); white-space: nowrap; }

    /* ── 카드 밖 액션 ── */
    .cdo-actions { flex-shrink: 0; width: var(--cdo-w); display: flex; flex-direction: column; align-items: center; gap: 8px; animation: cdo-in .7s .15s cubic-bezier(.2,.8,.2,1) both; }
    .cdo-mylink {
      display: block; width: 100%; text-align: center; padding: 12px;
      border: 1px solid rgba(255,255,255,.18); border-radius: 999px;
      font-size: 12px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase;
      color: #fff; text-decoration: none; transition: border-color .2s, color .2s;
    }
    .cdo-mylink:hover { border-color: var(--cdo-red); color: var(--cdo-red); }
    .cdo-hint { font-size: 11px; color: rgba(255,255,255,.4); letter-spacing: .04em; margin: 0; }

    @keyframes cdo-in { from { opacity: 0; transform: translateY(24px) scale(.97); } to { opacity: 1; transform: none; } }
    @keyframes cdo-blink { 0%,100%{opacity:1} 50%{opacity:.25} }
    @media (prefers-reduced-motion: reduce) {
      .cdo-glow, .cdo-actions { animation: none; }
      .cdo-live::before { animation: none; }
    }
    /* 아주 짧은 화면(가로 모드 등): 힌트 문구 생략 */
    @media (max-height: 560px) { .cdo-hint { display: none; } }
  `;
  document.head.appendChild(style);

  const overlay = document.createElement('div');
  overlay.id = 'cdoOverlay';
  overlay.innerHTML = `
    <button class="cdo-close" aria-label="닫기">✕</button>
    <div class="cdo-status" id="cdoStatus">
      <span class="cdo-big">◎</span>
      <span id="cdoStatusText">카드를 불러오는 중...</span>
    </div>
    <div class="cdo-glow" id="cdoCard" style="display:none">
      <div class="cdo-frame">
        <div class="cdo-card">
          <span class="cdo-br tl"></span><span class="cdo-br tr"></span>
          <span class="cdo-br bl"></span><span class="cdo-br br"></span>

          <div class="cdo-art">
            <img id="cdoArt" alt="" />
            <div class="cdo-num"><span id="cdoNum"></span><span class="cdo-num-label" id="cdoNumLabel">LIVE MIX</span></div>
            <div class="cdo-live">LIVE</div>
          </div>

          <div class="cdo-panel">
            <div class="cdo-row1">
              <div class="cdo-name">
                <span class="cdo-name-label">법명</span>
                <h2 class="cdo-dj" id="cdoDj"></h2>
              </div>
              <span class="cdo-len" id="cdoLen">--:--</span>
            </div>
            <p class="cdo-track" id="cdoTrack"></p>
            <div class="cdo-row3">
              <button class="cdo-pbtn" id="cdoPlayBtn" aria-label="재생">
                <svg id="cdoPlayIcon" width="12" height="14" viewBox="0 0 14 16"><polygon points="0,0 14,8 0,16" fill="currentColor"/></svg>
              </button>
              <div class="cdo-wave-wrap">
                <div class="cdo-wave" id="cdoWave" role="slider" aria-label="재생 위치"></div>
                <div class="cdo-time"><span id="cdoCurTime">0:00</span><span id="cdoFmt"></span></div>
              </div>
              <div class="cdo-code">
                <div class="cdo-barcode"></div>
                <div class="cdo-code-text" id="cdoCode"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <audio id="cdoAudio" preload="metadata"></audio>
    </div>
    <div class="cdo-actions" id="cdoActions" style="display:none">
      <a class="cdo-mylink" id="cdoMyLink" href="my-player.html">My Player에서 보기 →</a>
      <p class="cdo-hint">🎧 지금 만든 나만의 라이브 트랙이에요</p>
    </div>
  `;

  function closeOverlay() {
    const audio = document.getElementById('cdoAudio');
    if (audio) audio.pause();
    overlay.remove();
    const url = new URL(window.location.href);
    url.searchParams.delete('card');
    window.history.replaceState({}, '', url.pathname + url.search + url.hash);
  }

  document.addEventListener('DOMContentLoaded', mount);
  if (document.readyState !== 'loading') mount();

  let mounted = false;
  function mount() {
    if (mounted) return;
    mounted = true;
    document.body.appendChild(overlay);
    overlay.querySelector('.cdo-close').addEventListener('click', closeOverlay);
    overlay.addEventListener('click', e => { if (e.target === overlay) closeOverlay(); });
    /* QR로 들어온 방문객에겐 색상 가이드 대신 카드를 먼저 보여준다 (main.js 의 dismiss 가 히어로 등장도 이어서 실행) */
    const guide = document.getElementById('guideOverlay');
    if (guide) setTimeout(() => guide.click(), 0);
    /* LP 로더(main.js)도 카드를 덮지 않게 바로 닫는다 */
    const loader = document.getElementById('loaderOverlay');
    if (loader) {
      loader.classList.add('fade-out');
      setTimeout(() => { loader.style.display = 'none'; }, 950);
    }
    loadCard();
  }

  function showError(msg) {
    document.getElementById('cdoStatusText').textContent = msg;
  }

  async function loadCard() {
    if (cardId === 'demo') return renderCard(DEMO_CARD);
    let card;
    try {
      const res = await fetch(`${API_BASE}/api/cards/${encodeURIComponent(cardId)}`);
      if (!res.ok) return showError('카드를 찾을 수 없습니다. QR을 다시 스캔해주세요.');
      card = await res.json();
    } catch {
      return showError('서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.');
    }
    renderCard(card);
  }

  function fmt(s) {
    if (!s || isNaN(s)) return '0:00';
    return Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0');
  }

  function renderCard(card) {
    const isDemo = card.id === 'demo';
    const num    = String(card.cardNumber || 0).padStart(2, '0');
    const year   = new Date(card.createdAt || Date.now()).getFullYear();

    document.getElementById('cdoNum').textContent      = '#' + num;
    document.getElementById('cdoNumLabel').textContent = isDemo ? 'DEMO MIX' : 'LIVE MIX';
    document.getElementById('cdoDj').textContent       = (card.djName || '').replace(/^DJ\s*/, '');
    document.getElementById('cdoTrack').textContent    = card.trackName + ' — Live Remix';
    document.getElementById('cdoFmt').textContent      = (card.ext || '').toUpperCase();
    document.getElementById('cdoCode').textContent     = `OMIX-${num}-${year}`;

    const art = document.getElementById('cdoArt');
    art.src = card.imageUrl ? (card.imageUrl.startsWith('/') ? API_BASE + card.imageUrl : card.imageUrl) : DEFAULT_ART;

    const audio = document.getElementById('cdoAudio');
    /* 데모 카드는 사이트 안의 파일, 실제 카드는 업로드 서버의 파일 */
    audio.src = isDemo ? card.audioUrl : API_BASE + card.audioUrl;
    saveLiveTrack(card, audio.src);
    document.getElementById('cdoMyLink').href = 'my-player.html?live=' + encodeURIComponent(card.id);

    document.getElementById('cdoStatus').style.display  = 'none';
    document.getElementById('cdoCard').style.display    = '';
    document.getElementById('cdoActions').style.display = '';

    const bars = buildWave(card.id);
    loadWaveShape(audio.src, bars);
    setupPlayer(audio, bars);
  }

  /* ── 파형: 우선 id 기반 임시 모양, 곡을 디코딩하면 실제 음량 모양으로 교체 ── */
  function buildWave(seedStr) {
    const wave = document.getElementById('cdoWave');
    let seed = 0;
    for (const ch of String(seedStr)) seed = (seed * 31 + ch.charCodeAt(0)) >>> 0;
    const rand = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
    const bars = [];
    for (let i = 0; i < WAVE_BARS; i++) {
      const b = document.createElement('i');
      b.style.height = Math.round(20 + rand() * 80) + '%';
      wave.appendChild(b);
      bars.push(b);
    }
    return bars;
  }

  async function loadWaveShape(src, bars) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    try {
      const buf = await (await fetch(src)).arrayBuffer();
      const ctx = new Ctx();
      const audioBuf = await ctx.decodeAudioData(buf);
      ctx.close && ctx.close();
      const data = audioBuf.getChannelData(0);
      const step = Math.floor(data.length / bars.length);
      const peaks = bars.map((_, i) => {
        let sum = 0;
        for (let j = i * step, end = j + step; j < end; j += 64) sum += Math.abs(data[j]);
        return sum / (step / 64);
      });
      const max = Math.max(...peaks) || 1;
      peaks.forEach((p, i) => { bars[i].style.height = Math.round(14 + (p / max) * 86) + '%'; });
    } catch (e) { /* 디코딩 실패 시 임시 모양 유지 */ }
  }

  function setupPlayer(audio, bars) {
    const playBtn  = document.getElementById('cdoPlayBtn');
    const playIcon = document.getElementById('cdoPlayIcon');
    const wave     = document.getElementById('cdoWave');
    const curTime  = document.getElementById('cdoCurTime');
    const lenEl    = document.getElementById('cdoLen');
    const PLAY  = '<polygon points="0,0 14,8 0,16" fill="currentColor"/>';
    const PAUSE = '<rect x="0" y="0" width="4" height="16" fill="currentColor"/><rect x="9" y="0" width="4" height="16" fill="currentColor"/>';

    function paint() {
      const pct = audio.duration ? audio.currentTime / audio.duration : 0;
      const lit = Math.round(pct * bars.length);
      bars.forEach((b, i) => b.classList.toggle('on', i < lit));
      curTime.textContent = fmt(audio.currentTime);
    }
    function setPlaying(on) {
      playIcon.innerHTML = on ? PAUSE : PLAY;
      playBtn.classList.toggle('playing', on);
      playBtn.setAttribute('aria-label', on ? '일시정지' : '재생');
    }

    audio.addEventListener('loadedmetadata', () => { lenEl.textContent = fmt(audio.duration); });
    audio.addEventListener('timeupdate', paint);
    audio.addEventListener('play',  () => setPlaying(true));
    audio.addEventListener('pause', () => setPlaying(false));
    audio.addEventListener('ended', () => { audio.currentTime = 0; paint(); });

    playBtn.addEventListener('click', () => {
      if (audio.paused) audio.play().catch(() => {});
      else audio.pause();
    });

    wave.addEventListener('click', e => {
      const r = wave.getBoundingClientRect();
      if (audio.duration) {
        audio.currentTime = ((e.clientX - r.left) / r.width) * audio.duration;
        paint();
      }
    });
  }
})();
