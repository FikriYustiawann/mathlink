import { QUESTIONS } from './data';
import { STEPS } from './materiData';

// ============================================================
//  TROPHY, XP & LEVEL  — semua dihitung dari data progress
//  progress[id]      = { score, max, hints, best, attempts, clean, improved }
//  progress.bedakan  = { right, total }
//  progress._trophies = { idTrophy: waktuDibuka(ms) }
// ============================================================

export const TIER = {
  bronze:   { label: 'BRONZE', color: '#E0954F', glow: 'rgba(224,149,79,0.45)' },
  silver:   { label: 'SILVER', color: '#D5E2F5', glow: 'rgba(213,226,245,0.45)' },
  gold:     { label: 'GOLD', color: '#FFC83D', glow: 'rgba(255,200,61,0.5)' },
  platinum: { label: 'PLATINUM', color: '#7DF9FF', glow: 'rgba(125,249,255,0.6)' },
};

const done = (p, q) => p[q.id] && (p[q.id].attempts || 1) >= 1;
const perfect = (p, q) => p[q.id] && (p[q.id].best ?? p[q.id].score) === p[q.id].max;
const ofType = (t) => QUESTIONS.filter((q) => q.type === t);
const attemptsOf = (p) => QUESTIONS.reduce((a, q) => a + (p[q.id] ? p[q.id].attempts || 1 : 0), 0);

const qPerfect = (id) => (p) => !!p[id] && (p[id].best ?? p[id].score) === p[id].max;
const gamePlayed = (p) => !!p.game && (p.game.plays || 0) >= 1;
const gameMaster = (p) => !!p.game && (p.game.best || 0) >= 50;
// mini-game baru: progress.games[kunci] = { best, max, plays, floors? }
const mg = (p, k) => (p.games && p.games[k]) || null;
const mgPct = (p, k) => (mg(p, k) ? (mg(p, k).best || 0) / (mg(p, k).max || 1) : 0);

export const TROPHIES = [
  { id: 'scholar', tier: 'bronze', glyph: '≡', name: 'Scholar of the Hour', desc: 'Baca semua bagian di menu BELAJAR.',
    test: (p) => !!p.materi && Object.keys(p.materi.seen || {}).length >= STEPS.length },
  { id: 'viewer', tier: 'bronze', glyph: '▶', name: 'Visual Learner', desc: 'Buka 3 video di menu BELAJAR.',
    test: (p) => !!p.materi && Object.keys(p.materi.videos || {}).length >= 3 },
  { id: 'first', tier: 'bronze', glyph: '▶', name: 'Dark Hour Begins', desc: 'Selesaikan satu soal di menu LATIHAN. Dark Hour dimulai.',
    test: (p) => QUESTIONS.some((q) => done(p, q)) },
  { id: 'gamefirst', tier: 'bronze', glyph: '◆', name: 'First Mission', desc: 'Selesaikan satu ronde Misi Relasi.', test: gamePlayed },
  { id: 'gamemaster', tier: 'gold', glyph: '✦', name: 'Relation Master', desc: 'Capai 50 poin di Misi Relasi.', test: gameMaster },
  { id: 'shadow1', tier: 'bronze', glyph: '◆', name: 'Shadow Hunter', desc: 'Kalahkan Shadow pertamamu di SHADOW BATTLE (menu GAME).', test: (p) => !!mg(p, 'battle') && (mg(p, 'battle').floors || 0) >= 1 },
  { id: 'tabel80', tier: 'silver', glyph: '=', name: 'Table Tactician', desc: 'Raih skor minimal 80% di ISI TABEL (menu GAME).', test: (p) => mgPct(p, 'tabel') >= 0.8 },
  { id: 'pasang80', tier: 'silver', glyph: '≈', name: 'Mind Palace', desc: 'Raih skor minimal 80% di PASANGAN RASIO (menu GAME).', test: (p) => mgPct(p, 'pasang') >= 0.8 },
  { id: 'shadowall', tier: 'gold', glyph: '✦', name: 'Tartarus Vanguard', desc: 'Tuntaskan ketiga lantai SHADOW BATTLE.', test: (p) => !!mg(p, 'battle') && (mg(p, 'battle').floors || 0) >= 3 },
  { id: 'eye', tier: 'bronze', glyph: '◉', name: 'Eye of the Arcana', desc: 'Jawab semua kasus di TEBAK JENIS (menu GAME) dengan benar.',
    test: (p) => !!p.bedakan && p.bedakan.total > 0 && p.bedakan.right === p.bedakan.total },
  { id: 'solo', tier: 'bronze', glyph: '☾', name: 'Soul Unbound', desc: 'Selesaikan satu soal tanpa petunjuk dengan skor minimal setengah.',
    test: (p) => QUESTIONS.some((q) => p[q.id] && p[q.id].clean) },
  { id: 'comeback', tier: 'silver', glyph: '↑', name: 'Rise from the Shadows', desc: 'Ulangi satu soal dan kalahkan skor sebelumnya.',
    test: (p) => QUESTIONS.some((q) => p[q.id] && p[q.id].improved) },
  { id: 'diligent', tier: 'silver', glyph: '∞', name: 'Midnight Guardian', desc: 'Selesaikan 6 soal (pengulangan ikut dihitung).',
    test: (p) => attemptsOf(p) >= 6 },
  { id: 'perfect', tier: 'silver', glyph: '★', name: 'Flawless Calculation', desc: 'Raih skor sempurna pada satu soal.',
    test: (p) => QUESTIONS.some((q) => perfect(p, q)) },
  { id: 'kaos', tier: 'silver', glyph: '%', name: 'Efficiency King', desc: 'Skor sempurna di "Memilih Pembuat Kaos".', test: qPerfect('kaos') },
  { id: 'bangunan', tier: 'silver', glyph: '▲', name: 'Architect of Time', desc: 'Skor sempurna di "Pekerja dan Waktu".', test: qPerfect('bangunan') },
  { id: 'bensin', tier: 'silver', glyph: '→', name: 'Precision Navigator', desc: 'Skor sempurna di "Bensin Motor".', test: qPerfect('bensin') },
  { id: 'pizza', tier: 'silver', glyph: '½', name: 'Fair Divider', desc: 'Skor sempurna di "Patungan Pizza".', test: qPerfect('pizza') },
  { id: 'allclear', tier: 'gold', glyph: 'Σ', name: 'Conqueror of Tartarus', desc: 'Selesaikan semua soal di menu LATIHAN minimal sekali.',
    test: (p) => QUESTIONS.every((q) => done(p, q)) },
  { id: 'senilai', tier: 'gold', glyph: '÷', name: 'Master of Ratios', desc: 'Skor sempurna di semua soal senilai.',
    test: (p) => ofType('senilai').length > 0 && ofType('senilai').every((q) => perfect(p, q)) },
  { id: 'berbalik', tier: 'gold', glyph: '×', name: 'Lord of Reciprocity', desc: 'Skor sempurna di semua soal berbalik nilai.',
    test: (p) => ofType('berbalik').length > 0 && ofType('berbalik').every((q) => perfect(p, q)) },
  { id: 'allout', tier: 'platinum', glyph: '✦', name: 'Done and Dusted', desc: 'Skor sempurna di SEMUA soal. All-Out Attack, tanpa sisa.',
    test: (p) => QUESTIONS.every((q) => perfect(p, q)) },
];

export const trophyById = (id) => TROPHIES.find((t) => t.id === id);

// Cek trophy yang baru terpenuhi, simpan waktu dibukanya. Mengembalikan { progress, fresh: [id] }
export function awardTrophies(progress) {
  const have = progress._trophies || {};
  const fresh = TROPHIES.filter((t) => !have[t.id] && t.test(progress)).map((t) => t.id);
  if (!fresh.length) return { progress, fresh };
  const now = Date.now();
  const next = { ...have };
  fresh.forEach((id) => { next[id] = now; });
  return { progress: { ...progress, _trophies: next }, fresh };
}

// ---------- XP & level (nama level = Arcana ala Persona) ----------
export const LEVEL_STEP = 40;
export const ARCANA = [
  ['0', 'FOOL'], ['I', 'MAGICIAN'], ['II', 'PRIESTESS'], ['III', 'EMPRESS'], ['IV', 'EMPEROR'],
  ['V', 'HIEROPHANT'], ['VI', 'LOVERS'], ['VII', 'CHARIOT'], ['VIII', 'JUSTICE'], ['IX', 'HERMIT'],
];
export const MAX_LEVEL = ARCANA.length;

export const xpOf = (p) => {
  const q = QUESTIONS.reduce((a, x) => a + (p[x.id] ? (p[x.id].best ?? p[x.id].score) * 10 : 0), 0);
  const b = p.bedakan ? p.bedakan.right * 5 : 0;
  const g = p.game ? (p.game.best || 0) : 0;
  const t = Object.keys(p._trophies || {}).length * 10;
  // mini-game baru: maksimal 30 XP per game, sebanding dengan skor terbaik
  const m = Object.values(p.games || {}).reduce((a, x) => a + Math.round(30 * Math.min(1, (x.best || 0) / (x.max || 1))), 0);
  // menu BELAJAR: 2 XP per bagian dibaca, 3 XP per video dibuka
  const ml = p.materi ? Object.keys(p.materi.seen || {}).length * 2 + Object.keys(p.materi.videos || {}).length * 3 : 0;
  // bos mini-game: 8 XP per bos yang dikalahkan (maks 3 bos x 4 game)
  const bo = Object.values(p.boss || {}).reduce((a, x) => a + Math.min(3, x.cleared || 0) * 8, 0);
  return q + b + g + t + m + ml + bo;
};

export function levelOf(xp) {
  const level = Math.min(MAX_LEVEL, 1 + Math.floor(xp / LEVEL_STEP));
  const into = level >= MAX_LEVEL ? LEVEL_STEP : xp - (level - 1) * LEVEL_STEP;
  const [num, name] = ARCANA[level - 1];
  return { level, frac: Math.max(0, Math.min(1, into / LEVEL_STEP)), num, name, maxed: level >= MAX_LEVEL };
}

export const rankOf = (frac) => (frac >= 1 ? 'S' : frac >= 0.75 ? 'A' : frac >= 0.5 ? 'B' : frac > 0 ? 'C' : '–');
export const RANK_TITLE = { S: 'PENAKLUK DARK HOUR', A: 'PENJAGA HITUNGAN', B: 'PEMBURU RASIO', C: 'MURID TARTARUS', '–': '' };
export const RANK_COLOR = { S: '#FFC83D', A: '#00E5FF', B: '#BFEFFF', C: '#FF8AB5', '–': '#3B4A7A' };

export const trophyCount = (p) => Object.keys(p._trophies || {}).length;
