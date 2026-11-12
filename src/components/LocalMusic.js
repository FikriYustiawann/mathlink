import { useEffect, useRef } from 'react';

// expo-audio dimuat "opsional": aplikasi tetap jalan walau belum dipasang (musik lokal saja yang nonaktif).
// Untuk memakai musik lokal: npx expo install expo-audio
let useAudioPlayer = null;
try { useAudioPlayer = require('expo-audio').useAudioPlayer; } catch (e) { useAudioPlayer = null; }

// Musik latar dari file audio lokal (mis. assets/music/bgm_materi.mp3). Tidak butuh internet.
// Setiap kali pindah menu, lagu baru muncul pelan-pelan (fade-in ~1 detik) supaya tidak mengagetkan.
export default function LocalMusic({ source, playing, volume = 50 }) {
  // nilai useAudioPlayer tidak berubah selama aplikasi hidup, jadi urutan hook tetap konsisten
  const player = useAudioPlayer ? useAudioPlayer(source) : null; // eslint-disable-line react-hooks/rules-of-hooks
  const ramp = useRef(0);                    // 0..1, naik saat lagu baru mulai
  const vol = useRef(volume);
  vol.current = volume;

  const apply = () => {
    if (!player) return;
    try { player.volume = Math.max(0, Math.min(1, (vol.current / 100) * ramp.current)); } catch (e) { /* abaikan */ }
  };

  useEffect(() => { if (player) player.loop = true; }, [player]);
  useEffect(() => {
    if (!player) return undefined;
    ramp.current = 0; apply();
    const id = setInterval(() => {
      ramp.current = Math.min(1, ramp.current + 0.1); apply();
      if (ramp.current >= 1) clearInterval(id);
    }, 90);
    return () => clearInterval(id);
  }, [player]);                              // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { apply(); }, [player, volume]);   // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!player) return;
    try { if (playing) player.play(); else player.pause(); } catch (e) { /* abaikan */ }
  }, [player, playing]);

  return null;
}
