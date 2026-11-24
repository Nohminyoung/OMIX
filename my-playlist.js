/* =====================================================
   OMIX — my-playlist.js
   My Player 플레이리스트의 공용 저장소.
   localStorage('omix_my_playlist')에 곡 목록을 순서대로 저장하고,
   chart.js 가 곡을 담고 my-player.js 가 읽어서 재생·순서 변경·빼기를 한다.
   곡은 audioSrc(실제 음원 경로)로 구분한다.
   ===================================================== */
window.OmixPlaylist = (function () {
  const KEY        = 'omix_my_playlist';
  const SEEDED_KEY = 'omix_my_playlist_seeded';

  /* 첫 방문 때 들어가는 기본 곡 — My Player 와 하단 재생목록 패널이 같이 쓴다 */
  const DEFAULTS = [
    { title: 'Han Groove Riot', artist: 'OMIX Studio', dur: '2:57', emoji: '🎵', bg: 'linear-gradient(135deg, #1a0408 0%, #300a12 50%, #0a0408 100%)', audioSrc: 'music/Han%20Groove%20Riot.mp3', cover: 'covers/Han%20Groove%20Riot.jpg' },
    { title: 'Karma Game', artist: 'OMIX Studio', dur: '5:00', emoji: '🎧', bg: 'linear-gradient(135deg, #0d0a1a 0%, #1a0a2e 50%, #0d0a1a 100%)', audioSrc: 'music/Karma%20Game.mp3', cover: 'covers/Karma%20Game.jpg' },
    { title: 'Mix Attack', artist: 'OMIX Studio', dur: '2:56', emoji: '💿', bg: 'linear-gradient(135deg, #0a0a1a 0%, #14082a 50%, #0a0a1a 100%)', audioSrc: 'music/Mix%20Attack.mp3', cover: 'covers/Mix%20Attack.jpg' },
    { title: 'No Score, Just Soul', artist: 'OMIX Studio', dur: '5:01', emoji: '🔴', bg: 'linear-gradient(135deg, #1a0408 0%, #2a0810 50%, #1a0408 100%)', audioSrc: 'music/No%20Score,%20Just%20Soul.mp3', cover: 'covers/No%20Score,%20Just%20Soul.jpg' },
    { title: 'Temple Echo Loop', artist: 'OMIX Studio', dur: '4:09', emoji: '🎶', bg: 'linear-gradient(135deg, #0a140a 0%, #0a2010 50%, #0a140a 100%)', audioSrc: 'music/Temple%20Echo%20Loop.mp3', cover: 'covers/Temple%20Echo%20Loop.jpg' },
    { title: '공즉', artist: 'OMIX Studio', dur: '2:53', emoji: '🥁', bg: 'linear-gradient(135deg, #1a0808 0%, #2a0a0a 50%, #1a0808 100%)', audioSrc: 'music/공즉.mp3', cover: 'covers/공즉.jpg' },
    { title: '무명등', artist: 'OMIX Studio', dur: '3:04', emoji: '🪷', bg: 'linear-gradient(135deg, #0a0a1a 0%, #1a1028 50%, #0a0a1a 100%)', audioSrc: 'music/무명등.mp4', cover: 'covers/무명등.jpg' },
    { title: '사계윤회', artist: 'OMIX Studio', dur: '2:30', emoji: '🌀', bg: 'linear-gradient(135deg, #0a0a0a 0%, #1a1218 50%, #0a0a0a 100%)', audioSrc: 'music/사계윤회.mp3', cover: 'covers/사계윤회.jpg' },
    { title: '업보 Bounce', artist: 'OMIX Studio', dur: '3:14', emoji: '✨', bg: 'linear-gradient(135deg, #0c0a1a 0%, #1a1230 50%, #0c0a1a 100%)', audioSrc: 'music/업보%20Bounce.mp3', cover: 'covers/업보%20Bounce.jpg' },
    { title: '파도에 맡겨', artist: 'OMIX Studio', dur: '4:09', emoji: '🎴', bg: 'linear-gradient(135deg, #1a0808 0%, #280a0a 50%, #1a0808 100%)', audioSrc: 'music/파도에%20맡겨.mp3', cover: 'covers/파도에%20맡겨.jpg' },
  ];

  function get() {
    try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) { return []; }
  }
  /* 순서 변경·빼기 후 목록 전체를 그대로 저장 */
  function set(list) {
    try { localStorage.setItem(KEY, JSON.stringify(list)); } catch (e) {}
  }
  function has(audioSrc) {
    return get().some(t => t.audioSrc === audioSrc);
  }
  /* 새로 담겼으면 true, 이미 있던 곡이면 false */
  function add(track) {
    if (!track || !track.audioSrc || has(track.audioSrc)) return false;
    const list = get();
    list.push(track);
    set(list);
    return true;
  }
  function remove(audioSrc) {
    set(get().filter(t => t.audioSrc !== audioSrc));
  }
  /* My Player 첫 방문 때 한 번만 기본 곡을 목록 앞에 넣는다.
     이후엔 사용자가 뺀 기본 곡이 다시 살아나지 않도록 건너뛴다.
     현재 목록을 돌려주며, 저장소를 쓸 수 없는 환경(사생활 보호 모드 등)이면 기본 곡을 돌려준다 */
  function seed(defaults = DEFAULTS) {
    try {
      if (!localStorage.getItem(SEEDED_KEY)) {
        const added = get().filter(t => !defaults.some(d => d.audioSrc === t.audioSrc));
        set([...defaults, ...added]);
        localStorage.setItem(SEEDED_KEY, '1');
      }
      return get();
    } catch (e) {
      return defaults;
    }
  }

  return { get, set, has, add, remove, seed, DEFAULTS };
})();
