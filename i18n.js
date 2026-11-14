/* =====================================================
   OMIX — i18n.js  (KR / EN 언어 전환, 모든 페이지 공통)

   동작 방식
   - 화면의 한글 문장을 i18n-en.js 의 사전(OMIX_EN)에서 찾아 영어로 바꿔 끼운다.
     HTML 을 페이지마다 고치지 않아도 되고, 한글 원문은 그대로 둔다.
   - 고른 언어는 localStorage('omix-lang')에 저장 → 다른 페이지로 가도 유지.
   - 언어 버튼은 메인 페이지 재생 버튼 옆 🌐 버튼(data-omix-lang-pill) 하나뿐이다.
     (메뉴가 없는 card.html 에만 오른쪽 위에 작은 KR/EN 을 띄운다)
   - 언어 버튼을 누르면 저장 후 새로고침한다. (글자 단위 애니메이션이
     글자를 쪼개 놓기 때문에, 그 자리에서 되돌리는 것보다 새로 그리는 게 안전하다)
   - 한국어(기본)일 때는 버튼만 달고 아무것도 바꾸지 않는다.

   번역 추가·수정: i18n-en.js 의 사전에 '한글 원문': 'English' 한 줄을 넣으면 된다.
     원문은 공백·줄바꿈을 한 칸으로 줄여서 비교한다.
     숫자·가격이 섞인 문장은 i18n-en.js 의 OMIX_EN_PATTERNS 에 정규식으로 넣는다.

   head 에서 i18n-en.js 다음에, 다른 스크립트보다 먼저 불러야 한다.
   (본문이 그려지는 동안 바로 번역해야 글자 애니메이션이 영어로 쪼갠다)
   ===================================================== */
(function () {
  'use strict';

  var KEY = 'omix-lang';
  var lang = 'ko';
  try { lang = localStorage.getItem(KEY) === 'en' ? 'en' : 'ko'; } catch (e) {}

  var root = document.documentElement;
  root.setAttribute('data-lang', lang);

  window.OmixI18n = {
    lang: lang,
    set: function (next) {
      if (next !== 'en' && next !== 'ko') return;
      try { localStorage.setItem(KEY, next); } catch (e) {}
      if (next !== lang) location.reload();
    },
    t: function (s) { return s; }
  };

  /* ── KR / EN 버튼 ─────────────────────────────── */
  function makeToggle(cls) {
    var wrap = document.createElement('div');
    wrap.className = 'omix-lang ' + cls;
    wrap.setAttribute('role', 'group');
    wrap.setAttribute('aria-label', lang === 'en' ? 'Language' : '언어 선택');
    [['ko', 'KR'], ['en', 'EN']].forEach(function (pair, i) {
      if (i) {
        var sep = document.createElement('span');
        sep.className = 'omix-lang-sep';
        sep.textContent = '/';
        wrap.appendChild(sep);
      }
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'omix-lang-btn' + (pair[0] === lang ? ' is-on' : '');
      b.textContent = pair[1];
      b.setAttribute('lang', pair[0]);
      b.setAttribute('aria-pressed', pair[0] === lang ? 'true' : 'false');
      b.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        window.OmixI18n.set(pair[0]);
      });
      wrap.appendChild(b);
    });
    return wrap;
  }

  /* 메인 히어로의 🌐 알약 버튼: 지금 언어를 보여 주고, 누르면 다른 언어로 */
  function mountPill(pill) {
    var label = pill.querySelector('.hud-lang-label') || pill;
    var other = lang === 'en' ? 'ko' : 'en';
    label.textContent = lang === 'en' ? 'English' : '한국어';
    pill.setAttribute('aria-label', lang === 'en' ? 'Language: English (switch to Korean)' : '언어: 한국어 (영어로 바꾸기)');
    pill.setAttribute('lang', lang);
    pill.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      window.OmixI18n.set(other);
    });
  }

  function mountToggle() {
    var pill = document.querySelector('[data-omix-lang-pill]');
    if (pill) { mountPill(pill); return; }
    /* 언어는 메인 페이지 재생 버튼 옆 🌐 버튼에서만 바꾼다 → 메뉴(nav)에는 KR/EN 을 달지 않는다 */
    if (document.querySelector('.omix-lang') || document.querySelector('nav.nav')) return;
    if (document.body) {
      /* nav 가 없는 페이지(card.html 등): 오른쪽 위에 작게 */
      document.body.appendChild(makeToggle('omix-lang--float'));
    }
  }

  var css =
    '.omix-lang{display:inline-flex;align-items:center;gap:4px;font-family:var(--font,"Montserrat",sans-serif);' +
      'font-size:12px;font-weight:700;letter-spacing:.08em;line-height:1;white-space:nowrap}' +
    '.omix-lang-btn{background:none;border:0;padding:6px 2px;margin:0;font:inherit;letter-spacing:inherit;' +
      'color:var(--gray-2,rgba(255,255,255,.45));cursor:pointer;transition:color .2s}' +
    '.omix-lang-btn:hover{color:var(--white,#fff)}' +
    '.omix-lang-btn.is-on{color:var(--white,#fff);text-decoration:underline;text-decoration-color:var(--red,#F91536);' +
      'text-decoration-thickness:2px;text-underline-offset:5px}' +
    '.omix-lang-sep{color:var(--gray-2,rgba(255,255,255,.3));opacity:.6}' +
    '.omix-lang--float{position:fixed;top:max(12px,env(safe-area-inset-top));right:14px;z-index:9700;' +
      'padding:4px 10px;border-radius:999px;background:rgba(0,0,0,.55);border:1px solid rgba(255,255,255,.15);' +
      'backdrop-filter:blur(6px)}';

  function addStyle() {
    var st = document.createElement('style');
    st.setAttribute('data-omix-lang', '');
    st.textContent = css;
    (document.head || root).appendChild(st);
  }
  addStyle();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountToggle);
  } else {
    mountToggle();
  }

  if (lang !== 'en') return;

  /* =====================================================
     여기부터 영어 모드
     ===================================================== */
  root.setAttribute('lang', 'en');

  var DICT = window.OMIX_EN || {};
  var PATTERNS = window.OMIX_EN_PATTERNS || [];
  var HANGUL = /[가-힣]/;
  var ATTRS = ['placeholder', 'title', 'aria-label', 'alt', 'data-label'];
  var SKIP = { SCRIPT: 1, STYLE: 1, NOSCRIPT: 1, TEXTAREA: 1, CODE: 1 };

  function norm(s) { return s.replace(/\s+/g, ' ').trim(); }

  /* 문장 하나 번역. 사전에 없으면 null */
  function tr(s) {
    var key = norm(s);
    if (!key || !HANGUL.test(key)) return null;
    if (Object.prototype.hasOwnProperty.call(DICT, key)) return DICT[key];
    for (var i = 0; i < PATTERNS.length; i++) {
      var m = key.match(PATTERNS[i][0]);
      if (m) return PATTERNS[i][1].apply(null, m.concat([tx]));
    }
    return null;
  }
  /* 번역하되 없으면 원문 그대로 */
  function tx(s) { var r = tr(s); return r == null ? s : r; }
  window.OmixI18n.t = tx;

  function inSkip(node) {
    for (var el = node.parentNode; el && el.nodeType === 1; el = el.parentNode) {
      if (SKIP[el.tagName] || el.hasAttribute('data-no-i18n')) return true;
    }
    return false;
  }

  function doText(node) {
    var v = node.nodeValue;
    if (!v || !HANGUL.test(v) || inSkip(node)) return;
    var r = tr(v);
    if (r == null) return;
    /* 앞뒤 공백은 살려 둔다 (인라인 요소 사이 간격) */
    var lead = /^\s/.test(v) ? ' ' : '';
    var tail = /\s$/.test(v) ? ' ' : '';
    var out = lead + r + tail;
    if (out !== v) node.nodeValue = out;
  }

  function doAttrs(el) {
    if (SKIP[el.tagName]) return;
    for (var i = 0; i < ATTRS.length; i++) {
      var a = el.getAttribute(ATTRS[i]);
      if (a && HANGUL.test(a)) {
        var r = tr(a);
        if (r != null && r !== a) el.setAttribute(ATTRS[i], r);
      }
    }
    if (el.tagName === 'INPUT' && /^(button|submit|reset)$/i.test(el.type) && HANGUL.test(el.value)) {
      var rv = tr(el.value);
      if (rv != null) el.value = rv;
    }
  }

  function walk(rootNode) {
    if (!rootNode) return;
    if (rootNode.nodeType === 3) { doText(rootNode); return; }
    if (rootNode.nodeType !== 1 && rootNode.nodeType !== 9 && rootNode.nodeType !== 11) return;
    if (rootNode.nodeType === 1) {
      if (SKIP[rootNode.tagName]) return;
      doAttrs(rootNode);
    }
    var w = document.createTreeWalker(rootNode, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        return n.nodeType === 1 && SKIP[n.tagName] ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
      }
    });
    var n;
    while ((n = w.nextNode())) {
      if (n.nodeType === 3) doText(n); else doAttrs(n);
    }
  }

  function doTitle() {
    var t = tr(document.title);
    if (t != null && t !== document.title) document.title = t;
  }

  /* 본문이 그려지는 동안 + 이후 스크립트가 넣는 글자까지 계속 번역 */
  var mo = new MutationObserver(function (list) {
    for (var i = 0; i < list.length; i++) {
      var m = list[i];
      if (m.type === 'childList') {
        for (var j = 0; j < m.addedNodes.length; j++) walk(m.addedNodes[j]);
      } else if (m.type === 'characterData') {
        doText(m.target);
      } else if (m.type === 'attributes') {
        doAttrs(m.target);
      }
    }
    doTitle();
  });
  mo.observe(root, {
    childList: true, subtree: true, characterData: true,
    attributes: true, attributeFilter: ATTRS
  });

  function full() { walk(document.documentElement); doTitle(); }
  document.addEventListener('DOMContentLoaded', full);
  window.addEventListener('load', full);

  /* 알림창(alert / confirm / prompt) 문구도 번역 */
  ['alert', 'confirm', 'prompt'].forEach(function (fn) {
    var orig = window[fn];
    if (typeof orig !== 'function') return;
    window[fn] = function (msg) {
      var args = Array.prototype.slice.call(arguments);
      if (typeof msg === 'string') args[0] = tx(msg);
      return orig.apply(window, args);
    };
  });
})();
