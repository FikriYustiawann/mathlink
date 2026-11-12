// SFX global: panggil sfx('click') dari mana saja. Pemutar dibuat sekali, lalu dipakai ulang.
// Jika expo-audio belum terpasang, semua panggilan diam (aplikasi tetap jalan).
let create = null;
try { create = require('expo-audio').createAudioPlayer; } catch (e) { create = null; }

const FILES = {
  click: require('../assets/sfx/click.wav'),
  select: require('../assets/sfx/select.wav'),
  back: require('../assets/sfx/back.wav'),
  correct: require('../assets/sfx/correct.wav'),
  wrong: require('../assets/sfx/wrong.wav'),
  swipe: require('../assets/sfx/swipe.wav'),
};
const cache = {};
let enabled = true;
export const setSfxEnabled = (v) => { enabled = v; };

export function sfx(name, volume = 0.8) {
  if (!create || !enabled || !FILES[name]) return;
  try {
    if (!cache[name]) cache[name] = create(FILES[name]);
    const p = cache[name];
    p.volume = volume;
    p.seekTo?.(0);
    p.play();
  } catch (e) { /* SFX opsional */ }
}

// Musik per layar: SETIAP menu punya lagu sendiri. Timpa file mp3 (nama sama) dengan lagu pilihan sendiri.
//  HOME (lobby)  : bgm.mp3          (lagu pilihan pembuat, berhak cipta)
//  MATERI        : bgm_materi.mp3   santai, lo-fi (belajar)
//  LATIHAN       : bgm_latihan.mp3  fokus, tempo mantap
//  GAME          : bgm_game.mp3     semangat, bergaya chiptune
//  LAB           : bgm_lab.mp3      ceria, marimba (rasa ingin tahu)
//  PROGRES       : bgm_progres.mp3  hangat & naik (pencapaian)
//  PROFIL        : bgm_profil.mp3   tenang, kotak musik
// Lima lagu terakhir adalah komposisi orisinal hasil sintesis (bebas hak cipta). Lihat assets/music/README.md.
export const BGM = {
  HOME: require('../assets/music/bgm.mp3'),
  MATERI: require('../assets/music/bgm_materi.mp3'),
  LATIHAN: require('../assets/music/bgm_latihan.mp3'),
  GAME: require('../assets/music/bgm_game.mp3'),
  LAB: require('../assets/music/bgm_lab.mp3'),
  PROGRES: require('../assets/music/bgm_progres.mp3'),
  PROFIL: require('../assets/music/bgm_profil.mp3'),
};
export const trackFor = (screen) => (BGM[screen] ? screen : 'HOME');
