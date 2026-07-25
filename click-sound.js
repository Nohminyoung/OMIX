/* =====================================================
   OMIX — 사이트 전체 버튼 클릭 효과음
   "우옴 (울리게)" — 오실레이터 기반, 파일 없이 즉석 생성
   낮은 두 음을 살짝 어긋나게 겹쳐 맥놀이(울림)를 만든 뒤
   짧은 리버브 테일로 자연스럽게 사라짐
   ===================================================== */
(function () {
  let audioCtx = null;
  function ctx() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    return audioCtx;
  }

  function makeReverbSend(c, dest) {
    const wet = c.createGain(); wet.gain.value = 0.5;
    const delays = [[0.031, 0.42], [0.043, 0.38], [0.057, 0.34], [0.074, 0.3]];
    delays.forEach(function (d) {
      const delay = c.createDelay(1); delay.delayTime.value = d[0];
      const feedback = c.createGain(); feedback.gain.value = d[1];
      const damp = c.createBiquadFilter(); damp.type = 'lowpass'; damp.frequency.value = 1600;
      wet.connect(delay); delay.connect(damp); damp.connect(feedback); feedback.connect(delay);
      damp.connect(dest);
    });
    return wet;
  }

  function playRingingOm(duration) {
    const c = ctx(); const t = c.currentTime;
    const attack = 0.14;

    const bodyFilter = c.createBiquadFilter();
    bodyFilter.type = 'lowpass'; bodyFilter.frequency.value = 260;
    bodyFilter.Q.value = 3.2;
    bodyFilter.connect(c.destination);

    const airFilter = c.createBiquadFilter();
    airFilter.type = 'lowpass'; airFilter.frequency.value = 700;
    airFilter.connect(c.destination);

    const reverbSend = makeReverbSend(c, c.destination);
    bodyFilter.connect(reverbSend);
    airFilter.connect(reverbSend);

    const fundamental = 65;
    const pairs = [
      [fundamental, fundamental * 1.012, 0.5],
      [fundamental * 2.01, fundamental * 2.026, 0.2]
    ];
    pairs.forEach(function (pair) {
      [pair[0], pair[1]].forEach(function (freq) {
        const osc = c.createOscillator(); const gain = c.createGain();
        osc.type = 'sine'; osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(pair[2] / 2, t + attack);
        gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
        osc.connect(gain); gain.connect(bodyFilter);
        osc.start(t); osc.stop(t + duration + 0.05);
      });
    });

    const shimmer = c.createOscillator(); const shimmerGain = c.createGain();
    shimmer.type = 'sine'; shimmer.frequency.setValueAtTime(fundamental * 4.05, t);
    shimmerGain.gain.setValueAtTime(0, t);
    shimmerGain.gain.linearRampToValueAtTime(0.05, t + attack);
    shimmerGain.gain.exponentialRampToValueAtTime(0.001, t + duration * 0.7);
    shimmer.connect(shimmerGain); shimmerGain.connect(airFilter);
    shimmer.start(t); shimmer.stop(t + duration);
  }

  /* ── 재생/정지 버튼 전용: "철컥 (묵직한 래치)" 기계식 클릭음 ── */
  function noiseBurst(c, dest, t, dur, freq, q, gainVal) {
    const bufferSize = Math.max(1, Math.floor(c.sampleRate * dur));
    const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) { data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 3); }
    const noise = c.createBufferSource(); noise.buffer = buffer;
    const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = freq; bp.Q.value = q;
    const gain = c.createGain(); gain.gain.setValueAtTime(gainVal, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
    noise.connect(bp); bp.connect(gain); gain.connect(dest);
    noise.start(t);
  }

  function thunk(c, dest, t, freq, dur, gainVal) {
    const osc = c.createOscillator(); const gain = c.createGain();
    osc.type = 'triangle'; osc.frequency.setValueAtTime(freq, t);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.6, t + dur);
    gain.gain.setValueAtTime(gainVal, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.connect(gain); gain.connect(dest);
    osc.start(t); osc.stop(t + dur + 0.02);
  }

  function playHeavyLatch() {
    const c = ctx(); const t = c.currentTime;
    noiseBurst(c, c.destination, t, 0.02, 2200, 1.0, 0.4);
    thunk(c, c.destination, t + 0.006, 140, 0.09, 0.4);
    noiseBurst(c, c.destination, t + 0.05, 0.012, 1800, 1.5, 0.12);
  }

  const PLAY_SEL = '#playPauseBtn, .ctrl-play, #npPlay, .np-ctrl-play, #nowPlayBtn, .play-main';
  const CLICK_SEL = 'button, a.nav-link, .hamburger, .theme-swatch, .theme-toggle, ' +
    '.filter-btn, .nav-sns-link, [class*="btn"]';

  document.addEventListener('click', function (e) {
    const playEl = e.target.closest(PLAY_SEL);
    if (playEl) {
      try { playHeavyLatch(); } catch (err) { /* 오디오 미지원 브라우저는 무시 */ }
      return;
    }
    const el = e.target.closest(CLICK_SEL);
    if (!el) return;
    try { playRingingOm(2.5); } catch (err) { /* 오디오 미지원 브라우저는 무시 */ }
  }, true);
})();
