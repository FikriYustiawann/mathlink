import React, { useEffect, useRef, useState } from 'react';

// Pemutar YouTube (web): iframe embed resmi. Dipasang saat pertama kali ditekan
// (browser mewajibkan gestur pengguna), lalu play/pause lewat postMessage.
export default function MusicEngine({ videoId, playing, volume = 50 }) {
  const ref = useRef(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!playing && !started) return;
    if (playing && !started) { setStarted(true); return; } // iframe autoplay saat dipasang
    const w = ref.current && ref.current.contentWindow;
    if (!w) return;
    w.postMessage(JSON.stringify({ event: 'command', func: playing ? 'playVideo' : 'pauseVideo', args: [] }), '*');
  }, [playing]); // eslint-disable-line react-hooks/exhaustive-deps

  const send = (func, args = []) => {
    const w = ref.current && ref.current.contentWindow;
    if (w) w.postMessage(JSON.stringify({ event: 'command', func, args }), '*');
  };
  useEffect(() => { send('setVolume', [volume]); }, [volume]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!started) return null;
  return React.createElement('iframe', {
    ref,
    onLoad: () => { send('setVolume', [volume]); setTimeout(() => send('setVolume', [volume]), 1200); },
    title: 'bgm',
    src: `https://www.youtube.com/embed/${videoId}?autoplay=1&loop=1&playlist=${videoId}&controls=0&enablejsapi=1&playsinline=1`,
    allow: 'autoplay; encrypted-media',
    style: { position: 'fixed', right: 0, bottom: 0, width: 200, height: 200, opacity: 0.01, border: 0, pointerEvents: 'none' },
  });
}
