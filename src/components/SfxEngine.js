import { useEffect, useRef } from 'react';

// Efek suara pendek untuk perpindahan menu. Jika expo-audio belum terpasang,
// aplikasi tetap berjalan tanpa SFX.
let useAudioPlayer = null;
try { useAudioPlayer = require('expo-audio').useAudioPlayer; } catch (e) { useAudioPlayer = null; }

const SOURCES = {
  MATERI: require('../../assets/sfx/learn.wav'),
  GAME: require('../../assets/sfx/game.wav'),
  LATIHAN: require('../../assets/sfx/practice.wav'),
};

export default function SfxEngine({ eventKey, type }) {
  const source = SOURCES[type] || SOURCES.GAME;
  const player = useAudioPlayer ? useAudioPlayer(source) : null; // eslint-disable-line react-hooks/rules-of-hooks
  const last = useRef('');

  useEffect(() => {
    if (!player || !eventKey || eventKey === last.current) return;
    last.current = eventKey;
    try {
      player.volume = 0.7;
      player.seekTo?.(0);
      player.play();
    } catch (e) { /* SFX opsional */ }
  }, [player, eventKey]);

  return null;
}
