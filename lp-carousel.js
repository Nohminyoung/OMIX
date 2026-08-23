// ══ CD 케이스 캐러셀: 중앙에 오면 케이스가 옆으로 펼쳐지고, 옆은 닫힌 채 원형 아크로 배치 ══
(function () {
  const stage = document.getElementById('lpStage');
  if (!stage) return;

  const TRACKS = [
    { name: 'Han Groove Riot',     num: '01', dur: '2:57', audio: 'music/Han%20Groove%20Riot.mp3' },
    { name: 'Karma Game',          num: '02', dur: '5:00', audio: 'music/Karma%20Game.mp3' },
    { name: 'Mix Attack',          num: '03', dur: '2:56', audio: 'music/Mix%20Attack.mp3' },
    { name: 'No Score, Just Soul', num: '04', dur: '5:01', audio: 'music/No%20Score,%20Just%20Soul.mp3' },
    { name: 'Temple Echo Loop',    num: '05', dur: '4:09', audio: 'music/Temple%20Echo%20Loop.mp3' },
    { name: 'Silent Thunder',      num: '06', dur: '2:46', audio: 'music/Silent%20Thunder.mp3' },
    { name: 'Dharma Lights',       num: '07', dur: '1:55', audio: 'music/Dharma%20Lights.mp3' }
  ];

  function buildItem(t, i) {
    const item = document.createElement('div');
    item.className = 'idx-lp-item';
    item.dataset.name = t.name;
    item.dataset.num = t.num;
    item.dataset.dur = t.dur;
    item.dataset.audio = t.audio;
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
  const playBtn = document.getElementById('lpPlayBtn');

  let current = 0;
  let audioEl = null;

  function stopAudio() {
    if (audioEl) audioEl.pause();
    if (playBtn) playBtn.innerHTML = '▶&nbsp;&nbsp;Play';
  }

  function togglePlay() {
    const src = items[current].dataset.audio;
    if (!src) return;
    if (!audioEl) {
      audioEl = new Audio();
      audioEl.addEventListener('ended', () => {
        if (playBtn) playBtn.innerHTML = '▶&nbsp;&nbsp;Play';
      });
    }
    if (!audioEl.paused && audioEl.src.endsWith(src)) {
      audioEl.pause();
      if (playBtn) playBtn.innerHTML = '▶&nbsp;&nbsp;Play';
      return;
    }
    if (!audioEl.src.endsWith(src)) audioEl.src = src;
    audioEl.play();
    if (playBtn) playBtn.innerHTML = '❚❚&nbsp;&nbsp;Pause';
  }

  if (playBtn) playBtn.addEventListener('click', togglePlay);

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
    stopAudio();
    render();
  }

  arrowL.addEventListener('click', () => go(-1));
  arrowR.addEventListener('click', () => go(1));

  items.forEach((item, i) => {
    item.addEventListener('click', () => {
      if (i === current) return;
      current = i;
      stopAudio();
      render();
    });
  });

  render();
})();
