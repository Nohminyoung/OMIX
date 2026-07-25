// ══ CD 케이스 캐러셀: 중앙에 오면 케이스가 옆으로 펼쳐지고, 옆은 닫힌 채 원형 아크로 배치 ══
(function () {
  const stage = document.getElementById('lpStage');
  if (!stage) return;

  const TRACKS = [
    { name: 'Void Mandala',   num: '01', dur: '3:48' },
    { name: 'Lotus Fire',     num: '02', dur: '5:12' },
    { name: '108 BPM',        num: '03', dur: '4:06' },
    { name: 'Dharma Drop',    num: '04', dur: '6:33' },
    { name: 'AUM Club',       num: '05', dur: '7:01' },
    { name: 'Mindful Roots',  num: '06', dur: '4:44' },
    { name: 'Monk Sequence',  num: '07', dur: '5:28' },
    { name: 'Temple Bass',    num: '08', dur: '3:55' }
  ];

  function buildItem(t, i) {
    const item = document.createElement('div');
    item.className = 'idx-lp-item';
    item.dataset.name = t.name;
    item.dataset.num = t.num;
    item.dataset.dur = t.dur;
    const img = 'index_cd' + ((i % 3) + 1) + '.jpg';
    item.innerHTML =
      '<div class="idx-case-wrap">' +
        '<img class="idx-case-photo" src="' + img + '" alt="' + t.name + '" />' +
        '<div class="idx-case-cover">' +
          '<span class="idx-case-cover-brand">OMIX</span>' +
          '<span class="idx-case-cover-num">' + t.num + ' · ' + t.name + '</span>' +
        '</div>' +
      '</div>';
    return item;
  }

  TRACKS.forEach((t, i) => stage.appendChild(buildItem(t, i)));
  const items = Array.from(stage.children);

  const arrowL = document.getElementById('lpArrowL');
  const arrowR = document.getElementById('lpArrowR');
  const eyebrowEl = document.getElementById('lpEyebrow');
  const nameEl = document.getElementById('lpName');

  let current = 0;

  function render() {
    const n = items.length;
    items.forEach((item, i) => {
      let offset = i - current;
      if (offset > n / 2) offset -= n;
      if (offset < -n / 2) offset += n;
      if (Math.abs(offset) > 2) offset = offset > 0 ? 3 : -3;
      item.dataset.offset = offset;
    });

    const track = items[current];
    const words = track.dataset.name.split(' ');
    const last = words.pop();
    eyebrowEl.textContent = 'Track ' + track.dataset.num;
    nameEl.innerHTML = (words.join(' ') ? words.join(' ') + ' ' : '') +
      '<span class="accent-pt">' + last + '</span>';
  }

  function go(delta) {
    current = (current + delta + items.length) % items.length;
    render();
  }

  arrowL.addEventListener('click', () => go(-1));
  arrowR.addEventListener('click', () => go(1));

  items.forEach((item, i) => {
    item.addEventListener('click', () => {
      if (i === current) return;
      current = i;
      render();
    });
  });

  render();
})();
