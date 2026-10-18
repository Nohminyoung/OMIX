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
  function seed(defaults) {
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

  return { get, set, has, add, remove, seed };
})();
