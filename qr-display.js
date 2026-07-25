/* =====================================================
   OMIX — qr-display.js
   전시 부스 대형 화면: 새 카드 도착 시 QR 팝업 + 히스토리 스트립
   ===================================================== */

const WS_URL = (window.OMIX_EXHIBIT_CONFIG && window.OMIX_EXHIBIT_CONFIG.WS_URL) || 'ws://localhost:3000';
const QR_SHOW_SECONDS = 30;

let countdownTick = null;
let cards = [];

function connect() {
  const ws = new WebSocket(WS_URL);

  ws.onopen = () => {
    document.getElementById('ws-dot').classList.add('live');
    document.getElementById('ws-text').textContent = '실시간 연결됨';
  };

  ws.onmessage = e => {
    const msg = JSON.parse(e.data);
    if (msg.type === 'init') {
      cards = msg.cards || [];
      renderHistory();
    } else if (msg.type === 'new_card') {
      cards.unshift(msg.card);
      renderHistory();
      showQR(msg.card);
    }
  };

  ws.onclose = () => {
    document.getElementById('ws-dot').classList.remove('live');
    document.getElementById('ws-text').textContent = '재연결 중...';
    setTimeout(connect, 3000);
  };
  ws.onerror = () => ws.close();
}

function showQR(card) {
  clearInterval(countdownTick);

  const qrWrap = document.getElementById('qrCanvas');
  qrWrap.innerHTML = '';
  try {
    new QRCode(qrWrap, {
      text: card.cardUrl,
      width: 220, height: 220,
      colorDark: '#000000', colorLight: '#ffffff',
      correctLevel: QRCode.CorrectLevel.M,
    });
  } catch (e) {}

  document.getElementById('qDjName').innerHTML = card.djName.replace(/^DJ /, 'DJ <em>') + '</em>';
  document.getElementById('qTrack').textContent = card.trackName;

  document.getElementById('standby').style.display = 'none';
  document.getElementById('qr-pop').classList.add('show');

  let remaining = QR_SHOW_SECONDS;
  const bar   = document.getElementById('countBar');
  const label = document.getElementById('countLabel');
  label.textContent = `${remaining}초 후 대기 화면으로`;
  bar.style.transition = 'none';
  bar.style.width = '100%';

  setTimeout(() => {
    bar.style.transition = `width ${QR_SHOW_SECONDS}s linear`;
    bar.style.width = '0%';
  }, 50);

  countdownTick = setInterval(() => {
    remaining--;
    label.textContent = `${remaining}초 후 대기 화면으로`;
    if (remaining <= 0) {
      clearInterval(countdownTick);
      hideQR();
    }
  }, 1000);

  document.getElementById('qr-pop').onclick = hideQR;
}

function hideQR() {
  document.getElementById('qr-pop').classList.remove('show');
  document.getElementById('standby').style.display = 'flex';
}

function renderHistory() {
  const h = document.getElementById('history');
  h.innerHTML = cards.slice(0, 20).map(c => `
    <a class="qd-hist-item" href="${c.cardUrl}" target="_blank">
      <div class="qd-hist-num">${String(c.cardNumber).padStart(2, '0')}</div>
      <div class="qd-hist-info">
        <div class="qd-hist-dj">${c.djName}</div>
        <div class="qd-hist-track">${c.trackName.slice(0, 22)}${c.trackName.length > 22 ? '…' : ''}</div>
      </div>
    </a>
  `).join('');
}

connect();
