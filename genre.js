/* =====================================================
   OMIX — genre.js
   LP 회전 장르 선택기
   드래그 / 스크롤 / 터치 → LP 회전 → 장르 선택 → snap
   ===================================================== */


/* ─────────────────────────────────────────────────────
   [1] 커스텀 커서
   ───────────────────────────────────────────────────── */
const cursor    = document.getElementById('cursor');
const cursorDot = document.getElementById('cursorDot');
let mx = -100, my = -100, cx = -100, cy = -100;
if (cursor && cursorDot) {
  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    cursorDot.style.left = mx + 'px';
    cursorDot.style.top  = my + 'px';
  });
  (function animCursor() {
    cx += (mx - cx) * 0.12; cy += (my - cy) * 0.12;
    cursor.style.left = cx + 'px'; cursor.style.top = cy + 'px';
    requestAnimationFrame(animCursor);
  })();
}

/* ─────────────────────────────────────────────────────
   [2] Nav 스크롤
   ───────────────────────────────────────────────────── */
const navEl = document.getElementById('nav');
if (navEl) window.addEventListener('scroll', () => navEl.classList.toggle('scrolled', window.scrollY > 40));

/* ─────────────────────────────────────────────────────
   [3] 미니 플레이어
   ───────────────────────────────────────────────────── */
const playPauseBtn = document.getElementById('playPauseBtn');
const playerDisc   = document.getElementById('playerDisc');
const progressFill = document.getElementById('progressFill');
const currentTimeEl = document.getElementById('currentTime');
let isPlaying = false, progress = 0, pTimer;

if (playPauseBtn) {
  playPauseBtn.addEventListener('click', () => {
    isPlaying = !isPlaying;
    playPauseBtn.textContent = isPlaying ? '⏸' : '▶';
    if (isPlaying) {
      if (playerDisc) playerDisc.classList.add('spinning');
      pTimer = setInterval(() => {
        progress = Math.min(progress + 0.05, 100);
        if (progressFill)  progressFill.style.width = progress + '%';
        if (currentTimeEl) {
          const s = Math.floor(228 * progress / 100);
          currentTimeEl.textContent = Math.floor(s/60)+':'+String(s%60).padStart(2,'0');
        }
        if (progress >= 100) { clearInterval(pTimer); isPlaying = false; playPauseBtn.textContent = '▶'; if(playerDisc) playerDisc.classList.remove('spinning'); }
      }, 100);
    } else {
      if (playerDisc) playerDisc.classList.remove('spinning');
      clearInterval(pTimer);
    }
  });
}
const globalLike = document.getElementById('globalLike');
if (globalLike) {
  globalLike.addEventListener('click', () => {
    const liked = globalLike.textContent === '♡';
    globalLike.textContent = liked ? '♥' : '♡';
    globalLike.style.color = liked ? 'var(--red)' : '';
  });
}
document.getElementById('progressBar')?.addEventListener('click', e => {
  const rect = document.getElementById('progressBar').getBoundingClientRect();
  progress = ((e.clientX - rect.left) / rect.width) * 100;
  if (progressFill)  progressFill.style.width = progress + '%';
});


/* ─────────────────────────────────────────────────────
   [4] 장르 데이터
   ───────────────────────────────────────────────────── */
const GENRES = [
  { name: 'Club Music',    slug: 'club'       },
  { name: 'Mindful Roots', slug: 'mindful'    },
  { name: 'Dance',         slug: 'dance'      },
  { name: 'Meditation',    slug: 'meditation' },
  { name: 'Ambient',       slug: 'ambient'    },
  { name: 'Healing',       slug: 'healing'    },
  { name: 'Electronic',    slug: 'electronic' },
  { name: 'World Music',   slug: 'world'      },
];
const N    = GENRES.length;
const STEP = 360 / N;   // 45°


/* ─────────────────────────────────────────────────────
   [5] 상태
   ───────────────────────────────────────────────────── */
let rotation    = 0;   // 현재 LP 회전각 (degrees, 양수=시계방향)
let activeIdx   = 0;   // 선택된 장르 인덱스
let discCenterX = 0;
let discCenterY = 0;
let discRadius  = 0;
let labelRadius = 0;

/* 드래그 */
let isDragging   = false;
let dragStartX   = 0;
let dragStartRot = 0;
let lastDragX    = 0;
let dragVelocity = 0;
let snapTimer    = null;

/* 자동 회전 */
let autoRotating = true;


/* ─────────────────────────────────────────────────────
   [6] DOM 참조
   ───────────────────────────────────────────────────── */
const stageEl      = document.getElementById('lpStage');
const discEl       = document.getElementById('lpDisc');
const labelsLayerEl = document.getElementById('genreLabelsLayer');
const needleEl     = document.getElementById('lpNeedle');
const centerInfoEl = document.getElementById('lpCenterInfo');
const selNameEl    = document.getElementById('selGenreName');
const selLinkEl    = document.getElementById('selMoreLink');
const arcSvgEl     = document.getElementById('lpArcText');


/* ─────────────────────────────────────────────────────
   [7] 장르 레이블 요소 생성
   ───────────────────────────────────────────────────── */
const labelEls = GENRES.map((g, i) => {
  const el = document.createElement('div');
  el.className   = 'genre-item';
  el.dataset.idx = i;
  el.innerHTML   =
    `<span class="genre-item-text">${g.name}</span>` +
    `<div  class="genre-item-dot"></div>`;

  el.addEventListener('click', () => navigateTo(i));
  labelsLayerEl.appendChild(el);
  return el;
});

/* 드래그 힌트 */
const hintEl = document.createElement('div');
hintEl.className   = 'lp-drag-hint';
hintEl.textContent = '← Drag to Spin →';
stageEl.appendChild(hintEl);


/* ─────────────────────────────────────────────────────
   [8] LP 초기화 (사이즈 / 위치 계산)
   ───────────────────────────────────────────────────── */
function initLP() {
  const sw = stageEl.offsetWidth;
  const sh = stageEl.offsetHeight;

  /* 디스크 반지름: 스테이지 높이의 105% 와 너비 51% 중 작은 값 */
  discRadius  = Math.min(sh * 1.05, sw * 0.51, 900);
  discCenterX = sw / 2;
  /* 디스크 중심: 레이블이 보이도록 상단에서 일정 거리 확보 */
  discCenterY = discRadius + Math.max(sh * 0.08, 60);

  labelRadius = discRadius * 0.855;

  /* 디스크 위치 / 크기 */
  const d = discRadius * 2;
  discEl.style.width  = d + 'px';
  discEl.style.height = d + 'px';
  discEl.style.left   = (discCenterX - discRadius) + 'px';
  discEl.style.top    = (discCenterY - discRadius) + 'px';

  /* 중앙 레이블 글자 크기 조절 */
  const omixLabel = discEl.querySelector('.lp-label-omix');
  if (omixLabel) omixLabel.style.fontSize = Math.max(6, discRadius * 0.012) + 'px';

  /* Needle 위치 */
  if (needleEl) {
    const needleH = 36;
    needleEl.style.left   = discCenterX + 'px';
    needleEl.style.top    = (discCenterY - discRadius - needleH + 4) + 'px';
    needleEl.style.height = needleH + 'px';
  }

  /* 중앙 인포 박스: 스테이지 중간 하단 (~60%) */
  if (centerInfoEl) {
    centerInfoEl.style.left = discCenterX + 'px';
    centerInfoEl.style.top  = Math.min(sh * 0.60, discCenterY - discRadius * 0.05) + 'px';
  }

  /* Arc SVG 크기 / 위치 */
  if (arcSvgEl) {
    const svgSize = discRadius * 1.1;
    arcSvgEl.style.width  = svgSize + 'px';
    arcSvgEl.style.height = svgSize + 'px';
    arcSvgEl.style.left   = (discCenterX - svgSize / 2) + 'px';
    arcSvgEl.style.top    = (discCenterY - svgSize / 2) + 'px';
  }

  updateAll();
}


/* ─────────────────────────────────────────────────────
   [9] 레이블 위치 업데이트
   ───────────────────────────────────────────────────── */
function updateAll() {
  /* 디스크 회전 */
  discEl.style.transform = `rotate(${rotation}deg)`;

  GENRES.forEach((g, i) => {
    /* 이 장르가 현재 각도에서 몇 도에 있는지 */
    /* 12시(=top)를 0°, 시계방향 양수 */
    const rawDeg  = (i * STEP + rotation) % 360;
    const angleDeg = ((rawDeg % 360) + 360) % 360;   // 0~360

    /* 12시 기준 거리 (0~180) */
    const distFromTop = angleDeg > 180 ? 360 - angleDeg : angleDeg;

    /* 보이는 범위: ±85° */
    const visible = distFromTop < 88;
    const el      = labelEls[i];

    if (!visible) {
      el.style.opacity       = '0';
      el.style.pointerEvents = 'none';
      return;
    }

    /* 스크린 좌표 계산 */
    /* CSS 각도: 0°=오른쪽이므로 -90° 오프셋으로 12시를 시작으로 */
    const rad = (angleDeg - 90) * (Math.PI / 180);
    const x   = discCenterX + labelRadius * Math.cos(rad);
    const y   = discCenterY + labelRadius * Math.sin(rad);

    el.style.left = x + 'px';
    el.style.top  = y + 'px';

    /* 투명도: 중앙일수록 선명 */
    const alpha = Math.max(0.12, 1 - distFromTop / 88);
    el.style.opacity = alpha;
    el.style.pointerEvents = 'auto';

    /* 크기: 중앙일수록 크게 */
    const scale = 0.82 + 0.22 * (1 - distFromTop / 88);
    /* transform: 아이템 중심을 arc 점에 맞추되 텍스트는 위로 */
    el.style.transform = `translate(-50%, -100%) scale(${scale})`;

    el.classList.toggle('active', i === activeIdx);
  });

  /* 선택 장르 이름 업데이트 */
  const g = GENRES[activeIdx];
  if (selNameEl) {
    selNameEl.textContent = g.name.toUpperCase();
    selNameEl.dataset.slug = g.slug;
  }
  if (selLinkEl) selLinkEl.href = `chart.html?genre=${g.slug}`;
}


/* ─────────────────────────────────────────────────────
   [10] 활성 장르 계산
   ───────────────────────────────────────────────────── */
function computeActive() {
  let best = 0, bestDist = Infinity;
  for (let i = 0; i < N; i++) {
    const raw  = ((i * STEP + rotation) % 360 + 360) % 360;
    const dist = raw > 180 ? 360 - raw : raw;
    if (dist < bestDist) { bestDist = dist; best = i; }
  }
  return best;
}


/* ─────────────────────────────────────────────────────
   [11] 가장 가까운 장르로 snap
   ───────────────────────────────────────────────────── */
function snapToNearest() {
  autoRotating = false;
  activeIdx = computeActive();

  const target = -(activeIdx * STEP);
  const k      = Math.round((rotation - target) / 360);
  const snapped = target + k * 360;

  discEl.style.transition = 'transform 0.55s cubic-bezier(0.23,1,0.32,1)';
  rotation = snapped;
  discEl.style.transform  = `rotate(${snapped}deg)`;

  setTimeout(() => {
    discEl.style.transition = '';
    updateAll();
    setTimeout(() => { autoRotating = true; }, 800);
  }, 580);

  updateAll();
}


/* ─────────────────────────────────────────────────────
   [12] 특정 장르로 이동
   ───────────────────────────────────────────────────── */
function navigateTo(idx) {
  autoRotating = false;
  activeIdx = idx;
  const target  = -(idx * STEP);
  const k       = Math.round((rotation - target) / 360);
  rotation = target + k * 360;

  discEl.style.transition = 'transform 0.55s cubic-bezier(0.23,1,0.32,1)';
  discEl.style.transform  = `rotate(${rotation}deg)`;

  setTimeout(() => {
    discEl.style.transition = '';
    updateAll();
    setTimeout(() => { autoRotating = true; }, 800);
  }, 580);

  updateAll();
}


/* ─────────────────────────────────────────────────────
   [13] 마우스 드래그 인터랙션
   ───────────────────────────────────────────────────── */
stageEl.addEventListener('mousedown', e => {
  if (e.target.closest('.lp-center-info')) return;
  autoRotating = false;
  isDragging   = true;
  dragStartX   = e.clientX;
  dragStartRot = rotation;
  lastDragX    = e.clientX;
  dragVelocity = 0;
  discEl.style.transition = 'none';
  e.preventDefault();
});

document.addEventListener('mousemove', e => {
  if (!isDragging) return;
  const dx = e.clientX - lastDragX;
  dragVelocity = dx;
  rotation     = dragStartRot + (e.clientX - dragStartX) * 0.28;
  lastDragX    = e.clientX;
  activeIdx    = computeActive();
  updateAll();
});

document.addEventListener('mouseup', () => {
  if (!isDragging) return;
  isDragging = false;

  /* 관성: 빠르게 놓으면 조금 더 회전 후 snap */
  if (Math.abs(dragVelocity) > 6) {
    rotation += dragVelocity * 0.6;
    discEl.style.transition = 'transform 0.25s ease-out';
    discEl.style.transform  = `rotate(${rotation}deg)`;
    setTimeout(snapToNearest, 280);
  } else {
    snapToNearest();
  }
});


/* ─────────────────────────────────────────────────────
   [14] 마우스 휠 스크롤
   ───────────────────────────────────────────────────── */
stageEl.addEventListener('wheel', e => {
  e.preventDefault();
  autoRotating = false;
  discEl.style.transition = 'none';
  rotation += e.deltaY * 0.18;
  activeIdx = computeActive();
  updateAll();

  clearTimeout(snapTimer);
  snapTimer = setTimeout(snapToNearest, 380);
}, { passive: false });


/* ─────────────────────────────────────────────────────
   [15] 터치 스와이프
   ───────────────────────────────────────────────────── */
let touchSX = 0, touchSRot = 0;
stageEl.addEventListener('touchstart', e => {
  autoRotating = false;
  touchSX   = e.touches[0].clientX;
  touchSRot = rotation;
  discEl.style.transition = 'none';
}, { passive: true });

stageEl.addEventListener('touchmove', e => {
  const dx = e.touches[0].clientX - touchSX;
  rotation  = touchSRot + dx * 0.3;
  activeIdx = computeActive();
  updateAll();
}, { passive: true });

stageEl.addEventListener('touchend', () => {
  snapToNearest();
}, { passive: true });

stageEl.addEventListener('mouseenter', () => { if (!isDragging) autoRotating = false; });
stageEl.addEventListener('mouseleave', () => { if (!isDragging) autoRotating = true; });


/* ─────────────────────────────────────────────────────
   [16] 키보드 방향키
   ───────────────────────────────────────────────────── */
document.addEventListener('keydown', e => {
  if (e.key === 'ArrowLeft')  navigateTo((activeIdx - 1 + N) % N);
  if (e.key === 'ArrowRight') navigateTo((activeIdx + 1) % N);
  if (e.key === 'Enter' && selLinkEl) window.location.href = selLinkEl.href;
});


/* ─────────────────────────────────────────────────────
   [17] 중앙 장르명 클릭 → 차트 해당 섹션으로 이동
   ───────────────────────────────────────────────────── */
if (selNameEl) {
  selNameEl.addEventListener('click', () => {
    const slug = selNameEl.dataset.slug;
    if (slug) window.location.href = `chart.html?genre=${slug}`;
  });
}

/* ─────────────────────────────────────────────────────
   [18] 모바일 햄버거
   ───────────────────────────────────────────────────── */
const hamburger = document.getElementById('hamburger');
const navLinks  = document.querySelector('.nav-menu');
if (hamburger) {
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    if (navLinks) navLinks.classList.toggle('mobile-open');
  });
}


/* ─────────────────────────────────────────────────────
   [18] 반응형 리사이즈
   ───────────────────────────────────────────────────── */
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(initLP, 150);
});


/* ─────────────────────────────────────────────────────
   Init
   ───────────────────────────────────────────────────── */
initLP();

/* 자동 천천히 회전 (드래그/클릭 시 일시정지, snap 후 재개) */
(function autoRotateLoop() {
  if (autoRotating) {
    rotation += 0.07;
    activeIdx = computeActive();
    updateAll();
  }
  requestAnimationFrame(autoRotateLoop);
})();
console.log('%cOMIX 🎵 Choose a Genre', 'color:#F91536;font-size:16px;font-weight:700;');
