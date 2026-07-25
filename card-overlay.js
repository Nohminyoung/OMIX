/* =====================================================
   OMIX — card-overlay.js
   QR 스캔 도착: index.html?card=<id> 로 접속하면
   메인 페이지 위에 오버레이로 내 트랙 카드를 띄운다.
   ===================================================== */
(function () {
  const cardId = new URLSearchParams(window.location.search).get('card');
  if (!cardId) return;

  const API_BASE = (window.OMIX_EXHIBIT_CONFIG && window.OMIX_EXHIBIT_CONFIG.API_BASE) || 'http://localhost:3000';

  const style = document.createElement('style');
  style.textContent = `
    #cdoOverlay {
      position: fixed; inset: 0; z-index: 2000;
      background: rgba(5,5,5,0.88);
      backdrop-filter: blur(10px);
      display: flex; align-items: center; justify-content: center;
      padding: 24px;
    }
    #cdoOverlay .cdo-close {
      position: absolute; top: 24px; right: 28px;
      width: 40px; height: 40px; border-radius: 50%;
      border: 1px solid rgba(255,255,255,0.2);
      background: transparent; color: var(--white);
      font-size: 18px; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: all .2s;
    }
    #cdoOverlay .cdo-close:hover { border-color: var(--red); color: var(--red); }
    .cdo-card {
      position: relative;
      width: min(480px, 100%);
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 24px;
      padding: 44px 40px;
    }
    .cdo-status { text-align: center; color: rgba(255,255,255,0.5); font-size: 14px; }
    .cdo-status .cdo-big { font-size: 40px; display: block; margin-bottom: 16px; opacity: .4; }
    .cdo-eyebrow {
      font-size: 11px; font-weight: 700; letter-spacing: .3em; text-transform: uppercase;
      color: var(--red); margin-bottom: 20px; display: flex; align-items: center; gap: 8px;
    }
    .cdo-eyebrow::before {
      content: ''; width: 6px; height: 6px; border-radius: 50%; background: var(--red);
      animation: cdo-blink 2s ease-in-out infinite;
    }
    @keyframes cdo-blink { 0%,100%{opacity:1} 50%{opacity:.25} }
    .cdo-num { float: right; font-size: 12px; color: rgba(255,255,255,.35); letter-spacing: .1em; }
    .cdo-dj { font-size: clamp(34px, 7vw, 50px); font-weight: 900; line-height: .95; letter-spacing: -.02em; color: var(--white); margin-bottom: 6px; word-break: keep-all; }
    .cdo-dj em { font-style: italic; color: var(--red); }
    .cdo-track { font-size: 15px; color: rgba(255,255,255,.6); margin-bottom: 24px; word-break: break-word; }
    .cdo-meta { display: flex; flex-wrap: wrap; gap: 20px; padding-bottom: 20px; margin-bottom: 20px; border-bottom: 1px solid rgba(255,255,255,.08); }
    .cdo-meta-item { font-size: 10px; letter-spacing: .14em; text-transform: uppercase; color: rgba(255,255,255,.35); }
    .cdo-meta-item span { display: block; margin-top: 4px; font-size: 13px; color: rgba(255,255,255,.85); text-transform: none; }
    .cdo-player { display: flex; align-items: center; gap: 14px; margin-bottom: 24px; }
    .cdo-pbtn { width: 48px; height: 48px; flex-shrink: 0; border-radius: 50%; border: 2px solid var(--red); background: transparent; color: var(--red); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all .2s; }
    .cdo-pbtn:hover { background: var(--red); color: #fff; }
    .cdo-pw { flex: 1; min-width: 0; }
    .cdo-progbar { height: 5px; background: rgba(255,255,255,.1); border-radius: 3px; cursor: pointer; }
    .cdo-progfill { height: 100%; width: 0%; background: linear-gradient(90deg, var(--red), #A647FF); border-radius: 3px; transition: width .1s; pointer-events: none; }
    .cdo-ptime { display: flex; justify-content: space-between; font-size: 11px; color: rgba(255,255,255,.35); margin-top: 6px; }
    .cdo-hint { text-align: center; font-size: 12px; color: rgba(255,255,255,.4); letter-spacing: .05em; }
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
    <div class="cdo-card" id="cdoCard" style="display:none">
      <div class="cdo-num" id="cdoNum"></div>
      <p class="cdo-eyebrow">LIVE SOUND ARCHIVE</p>
      <h2 class="cdo-dj" id="cdoDj"></h2>
      <p class="cdo-track" id="cdoTrack"></p>
      <div class="cdo-meta">
        <div class="cdo-meta-item">형식<span id="cdoExt">—</span></div>
        <div class="cdo-meta-item">크기<span id="cdoSize">—</span></div>
        <div class="cdo-meta-item">녹음 일시<span id="cdoDate">—</span></div>
      </div>
      <div class="cdo-player">
        <button class="cdo-pbtn" id="cdoPlayBtn">
          <svg id="cdoPlayIcon" width="14" height="16" viewBox="0 0 14 16"><polygon points="0,0 14,8 0,16" fill="currentColor"/></svg>
        </button>
        <div class="cdo-pw">
          <div class="cdo-progbar" id="cdoProgBar"><div class="cdo-progfill" id="cdoProgFill"></div></div>
          <div class="cdo-ptime"><span id="cdoCurTime">0:00</span><span id="cdoDurTime">--:--</span></div>
        </div>
      </div>
      <audio id="cdoAudio" preload="metadata"></audio>
      <p class="cdo-hint">🎧 지금 만든 나만의 라이브 트랙이에요</p>
    </div>
  `;

  function closeOverlay() {
    overlay.remove();
    const url = new URL(window.location.href);
    url.searchParams.delete('card');
    window.history.replaceState({}, '', url.pathname + url.search + url.hash);
  }

  document.addEventListener('DOMContentLoaded', mount);
  if (document.readyState !== 'loading') mount();

  function mount() {
    document.body.appendChild(overlay);
    overlay.querySelector('.cdo-close').addEventListener('click', closeOverlay);
    overlay.addEventListener('click', e => { if (e.target === overlay) closeOverlay(); });
    loadCard();
  }

  function formatSize(bytes) {
    if (!bytes) return '—';
    return bytes > 1024 * 1024 ? (bytes / 1024 / 1024).toFixed(1) + ' MB' : (bytes / 1024).toFixed(0) + ' KB';
  }

  function showError(msg) {
    document.getElementById('cdoStatusText').textContent = msg;
  }

  async function loadCard() {
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

  function renderCard(card) {
    document.getElementById('cdoNum').textContent  = 'NO. ' + String(card.cardNumber).padStart(2, '0');
    document.getElementById('cdoDj').innerHTML      = card.djName.replace(/^DJ /, 'DJ <em>') + '</em>';
    document.getElementById('cdoTrack').textContent = card.trackName;
    document.getElementById('cdoExt').textContent   = (card.ext || '').toUpperCase();
    document.getElementById('cdoSize').textContent  = formatSize(card.size);
    document.getElementById('cdoDate').textContent  = new Date(card.createdAt).toLocaleString('ko-KR');

    const audio = document.getElementById('cdoAudio');
    audio.src = API_BASE + card.audioUrl;

    document.getElementById('cdoStatus').style.display = 'none';
    document.getElementById('cdoCard').style.display = 'block';

    setupPlayer(audio);
  }

  function setupPlayer(audio) {
    const playBtn  = document.getElementById('cdoPlayBtn');
    const playIcon = document.getElementById('cdoPlayIcon');
    const progBar  = document.getElementById('cdoProgBar');
    const progFill = document.getElementById('cdoProgFill');
    const curTime  = document.getElementById('cdoCurTime');
    const durTime  = document.getElementById('cdoDurTime');

    function fmt(s) {
      if (!s || isNaN(s)) return '0:00';
      return Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0');
    }

    audio.addEventListener('loadedmetadata', () => { durTime.textContent = fmt(audio.duration); });
    audio.addEventListener('timeupdate', () => {
      if (audio.duration) progFill.style.width = (audio.currentTime / audio.duration * 100) + '%';
      curTime.textContent = fmt(audio.currentTime);
    });
    audio.addEventListener('ended', () => {
      playIcon.innerHTML = '<polygon points="0,0 14,8 0,16" fill="currentColor"/>';
      progFill.style.width = '0%';
    });

    playBtn.addEventListener('click', () => {
      if (audio.paused) {
        audio.play().catch(() => {});
        playIcon.innerHTML = '<rect x="0" y="0" width="4" height="16" fill="currentColor"/><rect x="8" y="0" width="4" height="16" fill="currentColor"/>';
      } else {
        audio.pause();
        playIcon.innerHTML = '<polygon points="0,0 14,8 0,16" fill="currentColor"/>';
      }
    });

    progBar.addEventListener('click', e => {
      const r = progBar.getBoundingClientRect();
      if (audio.duration) audio.currentTime = ((e.clientX - r.left) / r.width) * audio.duration;
    });
  }
})();
