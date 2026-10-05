/* =====================================================
   OMIX — products.js
   상품 데이터 단일 소스 + 장바구니/주문 저장 유틸

   상품군: 티셔츠 / 포스터 / 키링 / 키캡 / 스티커
   store.html 의 카드와 store-detail.html 의 옵션 패널은
   모두 이 파일의 PRODUCTS 를 읽어 렌더링된다.
   상품을 추가·수정·삭제할 때는 이 파일만 고치면 된다.

   ⚠ DEMO 전용
     주문은 이 브라우저의 localStorage 에만 저장된다.
     판매자에게 전송되지 않고, 다른 기기·브라우저에서는 보이지 않는다.
     실제 판매로 전환할 때는 OmixShop.saveOrder() 본문만
     서버 API 호출(fetch)로 교체하면 나머지는 그대로 동작한다.
   ===================================================== */

(function (global) {
  'use strict';

  /* =====================================================
     [1] 상품 데이터

     id        : 슬러그. store.html 의 data-product 값과 같아야 한다.
     type      : 카테고리 필터 값 (tee / poster / keyring / keycap / sticker)
     typeLabel : 카드 아트 위에 찍히는 분류 라벨
     desc      : 카드 하단 한 줄 설명
     code      : 상세 페이지 좌측 라벨에 쓰는 품번
     options   : 선택 옵션. 없으면 null
     specs     : 상세 페이지 스펙 표 (k = 항목, v = 값)
     ===================================================== */
  const PRODUCTS = [
    /* ── 티셔츠 ────────────────────────────────── */
    {
      id: 'omix-tee-logo',
      name: 'OMIX LOGO TEE',
      label: 'OMIX APPAREL',
      type: 'tee',
      typeLabel: 'T-SHIRT',
      code: 'OMIX.TS.01',
      intro: 'OMIX 로고를 가슴 중앙에 실크스크린으로 얹은 기본 티셔츠입니다. 20수 코마 싱글 원단에 오버핏으로 제작해 계절을 타지 않습니다.',
      price: 35000,
      desc: 'BLACK / S·M·L·XL',
      art: 'linear-gradient(148deg,#0c0c0b,#1a1a18,#0c0c0b)',
      options: { name: 'SIZE', values: ['S', 'M', 'L', 'XL'] },
      stock: 60,
      specs: [
        { k: 'FABRIC',   v: '20수 코마 싱글' },
        { k: 'FIT',      v: '오버핏' },
        { k: 'PRINT',    v: '실크스크린 1도' },
        { k: 'COLOR',    v: 'Black' },
        { k: 'SIZE',     v: 'S · M · L · XL' },
        { k: 'SHIPPING', v: '2–5 영업일' }
      ]
    },
    {
      id: 'omix-tee-mandala',
      name: 'MANDALA TEE',
      label: 'OMIX APPAREL',
      type: 'tee',
      typeLabel: 'T-SHIRT',
      code: 'OMIX.TS.02',
      intro: '만다라 그래픽을 3도 실크스크린으로 인쇄한 티셔츠입니다. 30수 코마 싱글 원단, 레귤러핏으로 제작했습니다.',
      price: 38000,
      desc: 'CHARCOAL / S·M·L·XL',
      art: 'linear-gradient(148deg,#0c0c0b,#25282d,#0c0c0b)',
      options: { name: 'SIZE', values: ['S', 'M', 'L', 'XL'] },
      stock: 45,
      specs: [
        { k: 'FABRIC',   v: '30수 코마 싱글' },
        { k: 'FIT',      v: '레귤러핏' },
        { k: 'PRINT',    v: '실크스크린 3도' },
        { k: 'COLOR',    v: 'Charcoal' },
        { k: 'SIZE',     v: 'S · M · L · XL' },
        { k: 'SHIPPING', v: '2–5 영업일' }
      ]
    },

    /* ── 포스터 ────────────────────────────────── */
    {
      id: 'omix-poster-mandala',
      name: 'VOID MANDALA POSTER',
      label: 'OMIX PRINT',
      type: 'poster',
      typeLabel: 'POSTER',
      code: 'OMIX.PT.01',
      intro: '공(空)의 개념을 시각화한 만다라 그래픽 포스터입니다. 무광 아트지 250g에 6도 옵셋으로 인쇄했으며 300장 한정입니다.',
      price: 18000,
      desc: 'A2 / A3 · 무광 아트지',
      art: 'linear-gradient(148deg,#1a0408,#3a0c18,#0d0306)',
      options: { name: 'SIZE', values: ['A2', 'A3'] },
      stock: 120,
      specs: [
        { k: 'SIZE',     v: 'A2 420×594 / A3 297×420' },
        { k: 'PAPER',    v: '무광 아트지 250g' },
        { k: 'PRINT',    v: '6도 옵셋' },
        { k: 'EDITION',  v: 'Limited 300' },
        { k: 'PACKING',  v: '지관통 포장' },
        { k: 'SHIPPING', v: '2–5 영업일' }
      ]
    },
    {
      id: 'omix-poster-108',
      name: '108 SOUNDS POSTER',
      label: 'OMIX PRINT',
      type: 'poster',
      typeLabel: 'POSTER',
      code: 'OMIX.PT.02',
      intro: '108 사운드 시리즈의 타이포그래피 포스터입니다. 무광 아트지 250g, 6도 옵셋 인쇄, 300장 한정으로 제작했습니다.',
      price: 18000,
      desc: 'A2 / A3 · 무광 아트지',
      art: 'linear-gradient(148deg,#0d0a1a,#2a1456,#1a0a2e)',
      options: { name: 'SIZE', values: ['A2', 'A3'] },
      stock: 120,
      specs: [
        { k: 'SIZE',     v: 'A2 420×594 / A3 297×420' },
        { k: 'PAPER',    v: '무광 아트지 250g' },
        { k: 'PRINT',    v: '6도 옵셋' },
        { k: 'EDITION',  v: 'Limited 300' },
        { k: 'PACKING',  v: '지관통 포장' },
        { k: 'SHIPPING', v: '2–5 영업일' }
      ]
    },

    /* ── 키링 ──────────────────────────────────── */
    {
      id: 'omix-keyring-symbol',
      name: 'OMIX SYMBOL KEYRING',
      label: 'OMIX GOODS',
      type: 'keyring',
      typeLabel: 'KEYRING',
      code: 'OMIX.KR.01',
      intro: 'OMIX 심볼을 아연합금으로 제작한 키링입니다. 무광 도장으로 마감했으며 블랙·실버 두 가지 색상이 있습니다.',
      price: 12000,
      desc: 'METAL / BLACK · SILVER',
      art: 'linear-gradient(148deg,#0a0418,#18083a,#0c0520)',
      options: { name: 'COLOR', values: ['BLACK', 'SILVER'] },
      stock: 200,
      specs: [
        { k: 'MATERIAL', v: '아연합금' },
        { k: 'FINISH',   v: '무광 도장' },
        { k: 'SIZE',     v: '32 × 32 mm' },
        { k: 'WEIGHT',   v: '18g' },
        { k: 'INCLUDES', v: '링 + 체인' },
        { k: 'SHIPPING', v: '2–5 영업일' }
      ]
    },

    /* ── 키캡 ──────────────────────────────────── */
    {
      id: 'omix-keycap-artisan',
      name: 'ARTISAN KEYCAP',
      label: 'OMIX GOODS',
      type: 'keycap',
      typeLabel: 'KEYCAP',
      code: 'OMIX.KC.01',
      intro: 'UV 레진을 손으로 캐스팅해 만든 아티산 키캡입니다. Cherry MX 호환 스템, SA R1 프로파일, 100개 한정 제작.',
      price: 28000,
      desc: 'RESIN / CHERRY MX',
      art: 'linear-gradient(148deg,#1a0408,#2a0810,#1a0408)',
      options: { name: 'COLOR', values: ['RED', 'BLACK'] },
      stock: 30,
      specs: [
        { k: 'MATERIAL', v: 'UV 레진 핸드캐스팅' },
        { k: 'PROFILE',  v: 'SA R1' },
        { k: 'MOUNT',    v: 'Cherry MX 호환' },
        { k: 'COLOR',    v: 'Red · Black' },
        { k: 'EDITION',  v: 'Limited 100' },
        { k: 'SHIPPING', v: '3–7 영업일' }
      ]
    },

    /* ── 스티커 ────────────────────────────────── */
    {
      id: 'omix-sticker-pack',
      name: 'OMIX STICKER PACK',
      label: 'OMIX GOODS',
      type: 'sticker',
      typeLabel: 'STICKER',
      code: 'OMIX.ST.01',
      intro: 'OMIX 그래픽 8종을 모은 방수 스티커 세트입니다. 유광 코팅 PVC 소재라 노트북·케이스에 붙여도 쉽게 상하지 않습니다.',
      price: 8000,
      desc: '8종 세트 · 방수 PVC',
      art: 'linear-gradient(148deg,#0a140a,#0a2010,#0a140a)',
      options: null,
      stock: 300,
      specs: [
        { k: 'CONTENTS', v: '8종 세트' },
        { k: 'MATERIAL', v: '방수 PVC' },
        { k: 'FINISH',   v: '유광 코팅' },
        { k: 'SIZE',     v: '40–80 mm' },
        { k: 'CUT',      v: '다이컷' },
        { k: 'SHIPPING', v: '2–5 영업일' }
      ]
    },
    {
      id: 'omix-sticker-mandala',
      name: 'MANDALA STICKER SET',
      label: 'OMIX GOODS',
      type: 'sticker',
      typeLabel: 'STICKER',
      code: 'OMIX.ST.02',
      intro: '만다라 그래픽 5종을 홀로그램 PET에 인쇄한 스티커 세트입니다. 보는 각도에 따라 색이 달라집니다.',
      price: 6000,
      desc: '5종 세트 · 홀로그램',
      art: 'linear-gradient(148deg,#0d0a1a,#1a0a2e,#0d0a1a)',
      options: null,
      stock: 300,
      specs: [
        { k: 'CONTENTS', v: '5종 세트' },
        { k: 'MATERIAL', v: '홀로그램 PET' },
        { k: 'FINISH',   v: '유광' },
        { k: 'SIZE',     v: '50–90 mm' },
        { k: 'CUT',      v: '다이컷' },
        { k: 'SHIPPING', v: '2–5 영업일' }
      ]
    }
  ];

  /* 카테고리 필터 탭 — store.html 상단 버튼이 이 목록으로 만들어진다 */
  const CATEGORIES = [
    { key: 'all',     label: 'ALL' },
    { key: 'tee',     label: 'T-SHIRT' },
    { key: 'poster',  label: 'POSTER' },
    { key: 'keyring', label: 'KEYRING' },
    { key: 'keycap',  label: 'KEYCAP' },
    { key: 'sticker', label: 'STICKER' }
  ];

  /* =====================================================
     [2] 정책값
     ===================================================== */
  const POLICY = {
    shippingFee: 3000,      /* 기본 배송비 */
    freeThreshold: 50000,   /* 이 금액 이상이면 무료배송 */
    bank: {
      name: '국민은행',
      account: '000000-00-000000',
      holder: 'OMIX STUDIO'
    }
  };

  const KEY_CART   = 'omix_cart';
  const KEY_ORDERS = 'omix_orders';

  /* =====================================================
     [3] 공용 헬퍼
     ===================================================== */
  function get(id) {
    return PRODUCTS.find(p => p.id === id) || null;
  }

  /* 45000 → "₩45,000" */
  function won(n) {
    return '₩' + Number(n || 0).toLocaleString('ko-KR');
  }

  /* localStorage 는 프라이빗 모드 등에서 예외를 던질 수 있다 */
  function read(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  }
  function write(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      return false;
    }
  }

  /* 같은 상품이라도 옵션이 다르면 다른 줄로 취급 */
  function lineKey(id, opt) {
    return id + '::' + (opt || '');
  }

  /* =====================================================
     [4] 장바구니
     저장 형태: [{ id, opt, qty }]
     ===================================================== */
  const cart = {
    get() {
      const raw = read(KEY_CART, []);
      /* 상품 목록에서 사라진 id 는 걸러낸다 (상품군 교체 후 남은 잔여 항목 대응) */
      return Array.isArray(raw) ? raw.filter(l => get(l.id)) : [];
    },

    set(lines) {
      write(KEY_CART, lines);
      badge();
      return lines;
    },

    add(id, opt, qty) {
      const p = get(id);
      if (!p) return null;
      /* 옵션 상품인데 값이 없으면 첫 옵션으로 */
      const o = p.options ? (opt || p.options.values[0]) : '';
      const n = Math.max(1, parseInt(qty, 10) || 1);
      const lines = cart.get();
      const hit = lines.find(l => lineKey(l.id, l.opt) === lineKey(id, o));
      if (hit) hit.qty = Math.min(99, hit.qty + n);
      else lines.push({ id: id, opt: o, qty: n });
      cart.set(lines);
      return lines;
    },

    setQty(id, opt, qty) {
      const n = parseInt(qty, 10) || 0;
      if (n <= 0) return cart.remove(id, opt);
      const lines = cart.get();
      const hit = lines.find(l => lineKey(l.id, l.opt) === lineKey(id, opt));
      if (hit) hit.qty = Math.min(99, n);
      return cart.set(lines);
    },

    remove(id, opt) {
      const lines = cart.get().filter(l => lineKey(l.id, l.opt) !== lineKey(id, opt));
      return cart.set(lines);
    },

    clear() {
      return cart.set([]);
    },

    /* 배지에 찍을 총 수량 */
    count() {
      return cart.get().reduce((s, l) => s + l.qty, 0);
    },

    /* 장바구니 줄 + 상품 정보를 합쳐서 반환 */
    detailed() {
      return cart.get().map(l => {
        const p = get(l.id);
        return {
          id: l.id,
          opt: l.opt,
          qty: l.qty,
          name: p.name,
          label: p.label,
          type: p.type,
          typeLabel: p.typeLabel,
          art: p.art,
          price: p.price,
          lineTotal: p.price * l.qty
        };
      });
    }
  };

  /* =====================================================
     [5] 금액 계산
     디지털(무형) 상품만 담겼으면 배송 자체가 없다.
     현재 상품군은 전부 실물이라 항상 배송이 붙는다.
     ===================================================== */
  function needsShipping(items) {
    return items.some(i => i.type !== 'digital');
  }

  function amounts(items) {
    const goods = items.reduce((s, i) => s + i.price * i.qty, 0);
    let shipping = 0;
    if (needsShipping(items) && goods > 0 && goods < POLICY.freeThreshold) {
      shipping = POLICY.shippingFee;
    }
    return { goods: goods, shipping: shipping, total: goods + shipping };
  }

  /* =====================================================
     [6] 주문
     ===================================================== */
  /* OMIX-20260906-0031 형태 */
  function genOrderNo() {
    const d = new Date();
    const ymd = d.getFullYear() +
      String(d.getMonth() + 1).padStart(2, '0') +
      String(d.getDate()).padStart(2, '0');
    const seq = String(Math.floor(Math.random() * 9000) + 1000);
    return 'OMIX-' + ymd + '-' + seq;
  }

  const STATUS = ['입금대기', '결제완료', '배송준비중', '배송중', '배송완료', '취소'];
  const COURIERS = ['CJ대한통운', '우체국택배', '한진택배', '롯데택배', '로젠택배'];

  const orders = {
    all() {
      const raw = read(KEY_ORDERS, []);
      return Array.isArray(raw) ? raw : [];
    },
    find(orderNo) {
      return orders.all().find(o => o.orderNo === orderNo) || null;
    },
    /* 부분 수정 — 관리자에서 상태·송장번호 갱신에 사용 */
    update(orderNo, patch) {
      const list = orders.all();
      const hit = list.find(o => o.orderNo === orderNo);
      if (!hit) return null;
      Object.assign(hit, patch, { updatedAt: new Date().toISOString() });
      write(KEY_ORDERS, list);
      return hit;
    },
    remove(orderNo) {
      write(KEY_ORDERS, orders.all().filter(o => o.orderNo !== orderNo));
    },
    clear() {
      write(KEY_ORDERS, []);
    }
  };

  /* -----------------------------------------------------
     saveOrder — 실제 서비스 전환 시 여기만 교체한다.

       async function saveOrder(order) {
         const res = await fetch('/api/orders', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify(order)
         });
         return (await res.json()).orderNo;
       }

     화면·폼·검증은 전부 그대로 두고 이 함수 본문만 바꾸면 된다.
     ----------------------------------------------------- */
  async function saveOrder(order) {
    const list = orders.all();
    list.unshift(order);
    write(KEY_ORDERS, list);
    return order.orderNo;
  }

  /* =====================================================
     [7] nav 카트 배지 갱신
     #cartBadge / .cart-badge 가 있는 페이지에서만 동작
     ===================================================== */
  function badge() {
    const n = cart.count();
    document.querySelectorAll('#cartBadge, .cart-badge').forEach(el => {
      el.textContent = n;
      el.classList.toggle('empty', n === 0);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', badge);
  } else {
    badge();
  }
  /* 다른 탭에서 장바구니가 바뀌어도 배지가 따라오도록 */
  window.addEventListener('storage', e => {
    if (e.key === KEY_CART) badge();
  });

  /* =====================================================
     [8] 공개 API
     ===================================================== */
  global.OmixShop = {
    PRODUCTS: PRODUCTS,
    CATEGORIES: CATEGORIES,
    POLICY: POLICY,
    STATUS: STATUS,
    COURIERS: COURIERS,
    get: get,
    won: won,
    cart: cart,
    amounts: amounts,
    needsShipping: needsShipping,
    orders: orders,
    saveOrder: saveOrder,
    genOrderNo: genOrderNo,
    updateBadge: badge
  };

})(window);
