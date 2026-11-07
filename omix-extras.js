/* =====================================================
   OMIX — omix-extras.js
   모든 페이지에서 공통으로 쓰는 부가 기능 (스크립트 한 줄로 붙인다)

   [1] 로그인 (데모)  — 내비에 LOGIN 버튼 + 로그인/회원가입 모달
                        화면만 있고 실제 로그인은 되지 않는다 (서버 없음)
   [2] 공유           — window.OmixShare.open(data, anchor)
                        미니 플레이어에 공유 아이콘을 자동으로 붙인다
   [3] 잠금화면·이어폰 조작 — Media Session API
                        페이지 안 어떤 <audio>/new Audio() 가 재생돼도
                        곡 정보·재생/일시정지/이전/다음/탐색을 OS 미디어 컨트롤에 연결
   ===================================================== */
(function () {
  'use strict';

  /* 스타일 자동 로드 (style.css 보다 뒤에 붙어서 덮어쓸 수 있게) */
  if (!document.querySelector('link[data-ox-extras]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'omix-extras.css';
    link.dataset.oxExtras = '';
    document.head.appendChild(link);
  }

  const ICON = {
    user:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/></svg>',
    share: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/></svg>',
    link:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/></svg>',
    mail:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>',
    more:  '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>',
    x:     '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.8 3h3.1l-6.8 7.8L22 21h-6.2l-4.9-6.4L5.3 21H2.2l7.3-8.3L2 3h6.4l4.4 5.8L17.8 3zm-1.1 16.2h1.7L7.4 4.7H5.6l11.1 14.5z"/></svg>',
    fb:    '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 8.5V6.8c0-.8.5-1 .9-1H17V2.1L14 2c-3.3 0-4 2.4-4 4v2.5H8V12h2v10h4V12h2.7l.4-3.5H14z"/></svg>',
    headphones: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1v-6h3zM3 19a2 2 0 0 0 2 2h1v-6H3z"/></svg>',
  };

  /* ── 공용 토스트 ── */
  let toastEl, toastTimer;
  function toast(msg, icon) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'ox-toast';
      toastEl.setAttribute('role', 'status');
      document.body.appendChild(toastEl);
    }
    toastEl.innerHTML = (icon ? ICON[icon] : '') + '<span></span>';
    toastEl.querySelector('span').textContent = msg;
    toastEl.classList.add('is-show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('is-show'), 3200);
  }

  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));


  /* =====================================================
     [1] 로그인 (데모)
     ===================================================== */
  function initLogin() {
    const sns = document.querySelector('.nav-sns');
    const menu = document.querySelector('.nav-menu');
    if (!sns && !menu) return;

    const makeBtn = () => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'ox-login-btn';
      b.innerHTML = ICON.user + '<span>LOGIN</span>';
      b.addEventListener('click', e => { e.preventDefault(); openModal('login'); });
      return b;
    };
    /* 데스크톱: 우측 맨 끝(SNS 아이콘 → CART → LOGIN 순서, CSS order) / 모바일: 햄버거 메뉴 맨 끝 */
    if (sns) sns.appendChild(makeBtn());
    if (menu) {
      const li = document.createElement('li');
      li.className = 'ox-login-item';
      li.appendChild(makeBtn());
      menu.appendChild(li);
    }

    const modal = document.createElement('div');
    modal.className = 'ox-modal';
    modal.dataset.mode = 'login';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'oxModalTitle');
    modal.innerHTML = `
      <div class="ox-modal-card">
        <button class="ox-modal-close" type="button" aria-label="닫기">✕</button>
        <img class="ox-modal-logo" src="logo.png" alt="OMIX" />
        <h2 class="ox-modal-title" id="oxModalTitle">
          <span class="ox-login-only">다시 만나서 반가워요</span>
          <span class="ox-signup-only">OMIX 회원가입</span>
          <span class="ox-demo-badge">DEMO</span>
        </h2>
        <p class="ox-modal-sub">
          <span class="ox-login-only">로그인하면 플레이리스트와 좋아요가 모든 기기에서 이어져요.</span>
          <span class="ox-signup-only">가입하고 내 믹스, 주문 내역을 한곳에서 관리하세요.</span>
        </p>

        <div class="ox-tabs" role="tablist">
          <button type="button" class="ox-tab is-active" data-mode="login" role="tab">로그인</button>
          <button type="button" class="ox-tab" data-mode="signup" role="tab">회원가입</button>
        </div>

        <form class="ox-form" novalidate autocomplete="off">
          <label class="ox-field ox-signup-only"><span>닉네임</span><input type="text" placeholder="OMIX에서 쓸 이름" /></label>
          <label class="ox-field"><span>이메일</span><input type="email" placeholder="you@example.com" /></label>
          <label class="ox-field"><span>비밀번호</span><input type="password" placeholder="••••••••" autocomplete="new-password" /></label>
          <div class="ox-row ox-login-only">
            <label><input type="checkbox" /> 로그인 상태 유지</label>
            <a href="#" data-ox-demo>비밀번호 찾기</a>
          </div>
          <div class="ox-row ox-signup-only">
            <label><input type="checkbox" /> 이용약관 및 개인정보 처리방침 동의</label>
          </div>
          <button type="submit" class="ox-submit">
            <span class="ox-login-only">LOGIN</span><span class="ox-signup-only">SIGN UP</span>
          </button>
        </form>

        <div class="ox-divider">또는</div>
        <div class="ox-social">
          <button type="button" class="ox-kakao"  data-ox-demo><span class="ox-mark">K</span>카카오로 계속하기</button>
          <button type="button" class="ox-naver"  data-ox-demo><span class="ox-mark">N</span>네이버로 계속하기</button>
          <button type="button" class="ox-google" data-ox-demo><span class="ox-mark">G</span>Google로 계속하기</button>
          <button type="button" class="ox-apple"  data-ox-demo><span class="ox-mark"></span>Apple로 계속하기</button>
        </div>

        <p class="ox-notice" role="alert">
          지금은 화면 구성 시연용(DEMO)이라 실제 로그인·회원가입은 되지 않아요.
          입력한 내용은 어디에도 저장되거나 전송되지 않습니다.
        </p>
      </div>`;
    document.body.appendChild(modal);

    const notice = modal.querySelector('.ox-notice');
    const form = modal.querySelector('.ox-form');
    let lastFocus = null;

    function setMode(mode) {
      modal.dataset.mode = mode;
      modal.querySelectorAll('.ox-tab').forEach(t => t.classList.toggle('is-active', t.dataset.mode === mode));
      notice.classList.remove('is-show');
    }
    function openModal(mode) {
      lastFocus = document.activeElement;
      setMode(mode || 'login');
      modal.classList.add('is-open');
      document.querySelector('.nav-menu.mobile-open') && document.getElementById('hamburger')?.click();
      setTimeout(() => modal.querySelector('.ox-field:not(.ox-signup-only) input')?.focus(), 60);
    }
    function closeModal() {
      modal.classList.remove('is-open');
      form.reset();
      notice.classList.remove('is-show');
      lastFocus?.focus?.();
    }
    function showDemoNotice() {
      notice.classList.remove('is-show');
      void notice.offsetWidth;          /* 애니메이션 다시 시작 */
      notice.classList.add('is-show');
    }

    modal.querySelectorAll('.ox-tab').forEach(t => t.addEventListener('click', () => setMode(t.dataset.mode)));
    modal.querySelector('.ox-modal-close').addEventListener('click', closeModal);
    modal.addEventListener('click', e => {
      if (e.target === modal) closeModal();
      if (e.target.closest('[data-ox-demo]')) { e.preventDefault(); showDemoNotice(); }
    });
    form.addEventListener('submit', e => {
      e.preventDefault();
      /* 실제 로그인 X — 비밀번호 등 입력값을 바로 지우고 안내만 띄운다 */
      form.querySelectorAll('input[type="password"]').forEach(i => { i.value = ''; });
      showDemoNotice();
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
    });

    window.OmixAuth = { open: openModal, close: closeModal, isLoggedIn: () => false };
  }


  /* =====================================================
     [2] 공유
     data = { title, text, url, image }
     ===================================================== */
  let popEl = null;

  function absUrl(u) {
    try { return new URL(u || location.href, location.href).href; } catch (_) { return location.href; }
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (_) {
      const ta = document.createElement('textarea');
      ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      let ok = false;
      try { ok = document.execCommand('copy'); } catch (_) {}
      ta.remove();
      return ok;
    }
  }

  function closeShare() {
    popEl?.classList.remove('is-open');
  }

  function openShare(data, anchor) {
    data = data || {};
    const url   = absUrl(data.url);
    const title = data.title || document.title;
    const text  = data.text || (title + ' — OMIX에서 들어보세요');
    const canNative = typeof navigator.share === 'function';

    if (!popEl) {
      popEl = document.createElement('div');
      popEl.className = 'ox-share-pop';
      popEl.setAttribute('role', 'dialog');
      popEl.setAttribute('aria-label', '공유하기');
      document.body.appendChild(popEl);
      document.addEventListener('click', e => {
        if (popEl.classList.contains('is-open') && !popEl.contains(e.target) && !e.target.closest('[data-ox-share-trigger]')) closeShare();
      });
      document.addEventListener('keydown', e => { if (e.key === 'Escape') closeShare(); });
      /* 휴대폰 주소창이 접히는 정도의 작은 스크롤에는 닫히지 않게 — 60px 이상 움직였을 때만 */
      window.addEventListener('scroll', () => {
        if (popEl.classList.contains('is-open') && Math.abs(window.scrollY - popEl._openY) > 60) closeShare();
      }, { passive: true });
      window.addEventListener('resize', closeShare);
    }

    const enc = encodeURIComponent;
    popEl.innerHTML = `
      <div class="ox-share-head">
        <div class="ox-share-art" style="${data.image ? `background-image:url('${esc(data.image)}')` : (data.bg ? `background:${esc(data.bg)}` : '')}"></div>
        <div class="ox-share-meta">
          <p class="ox-share-title">${esc(title)}</p>
          <p class="ox-share-sub">${esc(data.artist || 'OMIX')}</p>
        </div>
      </div>
      <div class="ox-share-grid">
        <button type="button" class="ox-share-opt" data-act="copy"><span class="ox-share-ico is-link">${ICON.link}</span>링크 복사</button>
        <button type="button" class="ox-share-opt" data-act="kakao"><span class="ox-share-ico is-kakao">K</span>카카오톡</button>
        <a class="ox-share-opt" target="_blank" rel="noopener" href="https://twitter.com/intent/tweet?text=${enc(text)}&url=${enc(url)}"><span class="ox-share-ico is-x">${ICON.x}</span>X</a>
        <a class="ox-share-opt" target="_blank" rel="noopener" href="https://www.facebook.com/sharer/sharer.php?u=${enc(url)}"><span class="ox-share-ico is-fb">${ICON.fb}</span>Facebook</a>
        <a class="ox-share-opt" href="mailto:?subject=${enc(title + ' — OMIX')}&body=${enc(text + '\n' + url)}"><span class="ox-share-ico is-mail">${ICON.mail}</span>이메일</a>
        ${canNative ? `<button type="button" class="ox-share-opt" data-act="native"><span class="ox-share-ico is-more">${ICON.more}</span>더보기</button>` : ''}
      </div>
      <div class="ox-share-url">
        <input type="text" readonly value="${esc(url)}" aria-label="공유 링크" />
        <button type="button" data-act="copy">복사</button>
      </div>`;

    popEl.querySelectorAll('[data-act]').forEach(btn => btn.addEventListener('click', async () => {
      const act = btn.dataset.act;
      if (act === 'copy') {
        const ok = await copyText(url);
        toast(ok ? '링크를 복사했어요' : '복사하지 못했어요. 링크를 직접 선택해 주세요', 'link');
        if (ok) closeShare();
      } else if (act === 'kakao') {
        /* 카카오 공유 SDK 는 앱 키가 필요 — 지금은 휴대폰 공유창(카카오톡 포함) 또는 링크 복사로 대신한다 */
        if (canNative) {
          try { await navigator.share({ title, text, url }); closeShare(); } catch (_) {}
        } else {
          const ok = await copyText(url);
          toast(ok ? '링크를 복사했어요 — 카카오톡 대화창에 붙여넣으세요' : '복사하지 못했어요', 'link');
          closeShare();
        }
      } else if (act === 'native') {
        try { await navigator.share({ title, text, url }); closeShare(); } catch (_) {}
      }
    }));
    popEl.querySelectorAll('a.ox-share-opt').forEach(a => a.addEventListener('click', () => setTimeout(closeShare, 50)));

    /* 위치: 버튼 근처, 화면 밖으로 안 나가게 */
    popEl.classList.add('is-open');
    popEl._openY = window.scrollY;
    const pw = popEl.offsetWidth, ph = popEl.offsetHeight;
    const vw = window.innerWidth, vh = window.innerHeight;
    let left = (vw - pw) / 2, top = (vh - ph) / 2;
    if (anchor && vw > 520) {
      const r = anchor.getBoundingClientRect();
      left = Math.min(Math.max(12, r.right - pw), vw - pw - 12);
      top = r.top - ph - 10;
      if (top < 12) top = Math.min(r.bottom + 10, vh - ph - 12);
    } else {
      top = vh - ph - 90;             /* 휴대폰: 하단 시트처럼 */
    }
    popEl.style.left = left + 'px';
    popEl.style.top = Math.max(12, top) + 'px';
  }

  /* 버튼 하나 만들어 주는 도우미 — 페이지에서 OmixShare.button(...) 으로도 쓸 수 있다 */
  function shareButton(getData, opts) {
    opts = opts || {};
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'ox-share-btn' + (opts.pill ? ' ox-share-pill' : '') + (opts.className ? ' ' + opts.className : '');
    b.setAttribute('aria-label', '공유하기');
    b.title = '공유하기';
    b.dataset.oxShareTrigger = '';
    b.innerHTML = ICON.share + (opts.pill ? '<span>SHARE</span>' : '');
    b.addEventListener('click', e => {
      e.preventDefault(); e.stopPropagation();
      if (popEl?.classList.contains('is-open')) { closeShare(); return; }
      openShare(typeof getData === 'function' ? getData() : getData, b);
    });
    return b;
  }

  /* 미니 플레이어에 공유 아이콘 자동 추가 — 페이지가 OmixShare.current 를 지정하면 그걸 쓴다 */
  function initMiniPlayerShare() {
    const mp = document.getElementById('miniPlayer');
    if (!mp || mp.querySelector('.ox-share-btn')) return;
    const btn = shareButton(() => {
      if (typeof window.OmixShare.current === 'function') {
        const d = window.OmixShare.current();
        if (d) return d;
      }
      return {
        title: document.getElementById('playerName')?.textContent.trim() || document.title,
        artist: document.getElementById('playerArtist')?.textContent.trim(),
        url: location.href,
      };
    });
    const like = mp.querySelector('.player-like');
    if (like) like.insertAdjacentElement('beforebegin', btn);
    else mp.appendChild(btn);
    mp.classList.add('ox-has-share');
  }

  window.OmixShare = window.OmixShare || {};
  Object.assign(window.OmixShare, { open: openShare, close: closeShare, button: shareButton, toast });


  /* =====================================================
     [3] 잠금화면 · 이어폰 버튼 조작 (Media Session API)
     ===================================================== */
  function initMediaSession() {
    if (!('mediaSession' in navigator)) return;
    const ms = navigator.mediaSession;
    let current = null;          /* 지금 재생 중인 오디오 요소 */
    const wired = new WeakSet();
    let lastPosAt = 0;

    const $ = id => document.getElementById(id);
    const textOf = id => ($(id)?.textContent || '').trim();

    /* 곡 정보: 미니 플레이어(#playerName/#playerArtist) → 곡 상세 → 페이지 제목 순으로 찾는다 */
    function trackInfo() {
      let title = textOf('playerName') || textOf('sdPlayerTitle');
      let artist = textOf('playerArtist') || textOf('sdPlayerArtist');
      if (!title || title === '—') {
        const src = decodeURIComponent((current?.currentSrc || current?.src || '').split('/').pop() || '');
        title = src.replace(/\.[a-z0-9]+$/i, '') || 'OMIX';
      }
      if (!artist || artist === '—') artist = 'OMIX';
      return { title, artist };
    }

    /* 앨범 아트: covers/곡명.jpg 가 있으면 그걸, 없으면 OMIX 심볼 */
    const coverCache = {};
    function setMetadata() {
      const { title, artist } = trackInfo();
      const fallback = [
        { src: absUrl('symbol.png'), sizes: '512x512', type: 'image/png' },
      ];
      const apply = art => {
        try { ms.metadata = new MediaMetadata({ title, artist, album: 'OMIX', artwork: art }); } catch (_) {}
      };
      apply(coverCache[title] || fallback);
      if (coverCache[title] === undefined) {
        const url = absUrl('covers/' + encodeURIComponent(title) + '.jpg');
        const img = new Image();
        img.onload = () => {
          coverCache[title] = [{ src: url, sizes: img.naturalWidth + 'x' + img.naturalHeight, type: 'image/jpeg' }];
          if (trackInfo().title === title) apply(coverCache[title]);
        };
        img.onerror = () => { coverCache[title] = fallback; };
        img.src = url;
      }
    }

    function updatePosition(force) {
      if (!current || !ms.setPositionState) return;
      const now = Date.now();
      if (!force && now - lastPosAt < 1000) return;
      lastPosAt = now;
      const d = current.duration;
      if (!isFinite(d) || d <= 0) return;
      try {
        ms.setPositionState({ duration: d, playbackRate: current.playbackRate || 1, position: Math.min(current.currentTime, d) });
      } catch (_) {}
    }

    /* 페이지의 재생 버튼을 눌러서 UI(아이콘·LP 회전)까지 같이 바뀌게 한다.
       버튼이 이 오디오를 제어하지 않는 경우(예: 카드 오버레이)엔 직접 재생/정지로 대신. */
    function pressPlayPause(wantPlay) {
      const a = current;
      if (!a) return;
      const btn = $('playPauseBtn') || $('sdPlayBtn');
      const before = a.paused;
      if (btn) btn.click();
      setTimeout(() => {
        if (a.paused === before) { wantPlay ? a.play().catch(() => {}) : a.pause(); }
      }, 250);
    }

    function wire(audio) {
      if (wired.has(audio)) return;
      wired.add(audio);
      audio.addEventListener('playing', () => {
        current = audio;
        ms.playbackState = 'playing';
        setMetadata();
        updatePosition(true);
        hintOnce();
      });
      audio.addEventListener('pause', () => { if (audio === current) ms.playbackState = 'paused'; });
      audio.addEventListener('ended', () => { if (audio === current) ms.playbackState = 'paused'; });
      audio.addEventListener('timeupdate', () => { if (audio === current) updatePosition(false); });
      audio.addEventListener('loadedmetadata', () => { if (audio === current) updatePosition(true); });
    }

    /* 모든 오디오의 play() 를 가로채서 연결 — 페이지별 코드는 손대지 않아도 된다 */
    const origPlay = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function () {
      if (this instanceof HTMLAudioElement) { wire(this); current = this; }
      return origPlay.apply(this, arguments);
    };
    document.querySelectorAll('audio').forEach(wire);

    /* 곡이 바뀌면(미니 플레이어 곡명 변경) 메타데이터 갱신 */
    ['playerName', 'sdPlayerTitle'].forEach(id => {
      const el = $(id);
      if (el) new MutationObserver(() => { if (current && !current.paused) setMetadata(); })
        .observe(el, { childList: true, characterData: true, subtree: true });
    });

    const set = (action, fn) => { try { ms.setActionHandler(action, fn); } catch (_) {} };
    set('play',  () => pressPlayPause(true));
    set('pause', () => pressPlayPause(false));
    set('stop',  () => current && current.pause());
    if ($('prevBtn')) set('previoustrack', () => $('prevBtn').click());
    if ($('nextBtn')) set('nexttrack',     () => $('nextBtn').click());
    set('seekbackward', d => { if (current) { current.currentTime = Math.max(0, current.currentTime - (d.seekOffset || 10)); updatePosition(true); } });
    set('seekforward',  d => { if (current) { current.currentTime = Math.min(current.duration || 0, current.currentTime + (d.seekOffset || 10)); updatePosition(true); } });
    set('seekto', d => {
      if (!current) return;
      if (d.fastSeek && 'fastSeek' in current) current.fastSeek(d.seekTime);
      else current.currentTime = d.seekTime;
      updatePosition(true);
    });

    /* 처음 한 번만: 이 기능이 생겼다는 걸 알려주는 안내 */
    let hinted = false;
    function hintOnce() {
      if (hinted) return;
      hinted = true;
      let seen = false;
      try { seen = localStorage.getItem('omix-ms-hint') === '1'; } catch (_) {}
      if (seen) return;
      try { localStorage.setItem('omix-ms-hint', '1'); } catch (_) {}
      setTimeout(() => toast('이제 잠금화면·이어폰 버튼으로도 재생을 조작할 수 있어요', 'headphones'), 800);
    }
  }


  /* ── 시작 ── */
  function init() {
    initLogin();
    initMiniPlayerShare();
  }
  initMediaSession();               /* play() 가로채기는 최대한 빨리 */
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
