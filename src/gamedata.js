// ============================================================
//  GENERATOR SOAL untuk mini-game (Battle Shadow, Isi Tabel, Pasangan Rasio)
//  Semua angka dibuat acak tetapi SELALU menghasilkan jawaban bilangan bulat.
//  Pengecoh (opsi salah) sengaja dibuat dari kesalahan umum siswa:
//    - memakai rumus senilai pada soal berbalik nilai (dan sebaliknya)
//    - menjumlah/mengurangi selisih alih-alih mengalikan
// ============================================================
import { fmt } from './components/Ui';

export const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
export const pick = (arr) => arr[rnd(0, arr.length - 1)];
export const shuffle = (arr) => {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = rnd(0, i); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
};
const divisors = (n) => { const d = []; for (let i = 1; i <= n; i++) if (n % i === 0) d.push(i); return d; };

// ---------- konteks cerita ----------
// f(v) memformat angka + satuan. story(...) membuat kalimat soal singkat.
const rp = (v) => 'Rp' + fmt(v);
const SENILAI = [
  { a: 'Buku (buah)', b: 'Harga (Rp)', k: [2000, 2500, 3000, 4000, 5000], fa: (v) => v + ' buku', fb: rp,
    story: (x1, y1, x2) => `${x1} buku harganya ${rp(y1)}. Berapa harga ${x2} buku?` },
  { a: 'Bensin (L)', b: 'Jarak (km)', k: [30, 35, 40, 45, 50], fa: (v) => v + ' L', fb: (v) => v + ' km',
    story: (x1, y1, x2) => `Motor memakai ${x1} liter bensin untuk ${y1} km. Berapa km untuk ${x2} liter?` },
  { a: 'Gula (kg)', b: 'Harga (Rp)', k: [12000, 14000, 15000, 16000], fa: (v) => v + ' kg', fb: rp,
    story: (x1, y1, x2) => `${x1} kg gula harganya ${rp(y1)}. Berapa harga ${x2} kg?` },
  { a: 'Kaos (buah)', b: 'Harga (Rp)', k: [40000, 45000, 50000, 55000], fa: (v) => v + ' kaos', fb: rp,
    story: (x1, y1, x2) => `${x1} kaos harganya ${rp(y1)}. Berapa harga ${x2} kaos?` },
  { a: 'Beras (kg)', b: 'Harga (Rp)', k: [11000, 12000, 13000, 15000], fa: (v) => v + ' kg', fb: rp,
    story: (x1, y1, x2) => `${x1} kg beras harganya ${rp(y1)}. Berapa harga ${x2} kg?` },
];
const BERBALIK = [
  { a: 'Pekerja (orang)', b: 'Waktu (hari)', P: [24, 36, 48, 60, 72], fa: (v) => v + ' pekerja', fb: (v) => v + ' hari',
    story: (x1, y1, x2) => `${x1} pekerja menyelesaikan bangunan dalam ${y1} hari. Berapa hari jika ${x2} pekerja?` },
  { a: 'Laju (km/jam)', b: 'Waktu (jam)', P: [120, 180, 240, 360], fa: (v) => v + ' km/jam', fb: (v) => v + ' jam',
    story: (x1, y1, x2) => `Laju ${x1} km/jam butuh ${y1} jam. Berapa jam jika lajunya ${x2} km/jam?` },
  { a: 'Siswa (orang)', b: 'Iuran (Rp)', P: [120000, 180000, 240000], fa: (v) => v + ' siswa', fb: rp,
    story: (x1, y1, x2) => `${x1} siswa patungan, tiap anak ${rp(y1)} (harga total tetap). Berapa iuran tiap anak jika ${x2} siswa?` },
  { a: 'Kran (buah)', b: 'Waktu (menit)', P: [60, 90, 120, 180], fa: (v) => v + ' kran', fb: (v) => v + ' menit',
    story: (x1, y1, x2) => `${x1} kran mengisi bak sampai penuh dalam ${y1} menit. Berapa menit jika ${x2} kran?` },
];

// Rumus yang ditampilkan saat ANALYZE (petunjuk memudar: tampil rumus, bukan jawaban)
const hintOf = (type, x1, y1, x2, ctx) => (type === 'senilai'
  ? `Senilai (naik–naik): ${ctx.b.split(' ')[0]} ÷ ${ctx.a.split(' ')[0]} selalu sama.\n${fmt(y1)} ÷ ${x1} = y ÷ ${x2}`
  : `Berbalik nilai (naik–turun): hasil kali selalu sama.\n${x1} × ${fmt(y1)} = ${x2} × y`);

// ---------- 1 soal untuk Battle ----------
// Mengembalikan: { type, story, heads, rows, ask, ans, opts, why, why1, analyze1, analyze2 }
export function makeBattleQuestion(type) {
  const t = type || pick(['senilai', 'berbalik']);
  let x1, y1, x2, y2, ctx, wrong = [];
  if (t === 'senilai') {
    ctx = pick(SENILAI);
    const k = pick(ctx.k);
    x1 = rnd(2, 6);
    do { x2 = rnd(2, 12); } while (x2 === x1);
    y1 = k * x1; y2 = k * x2;
    wrong = [Math.round((y1 * x1) / x2), y1 + (x2 - x1) * (k > 100 ? 1000 : 1), y2 + k];   // dibalik / selisih / meleset 1 satuan
  } else {
    ctx = pick(BERBALIK);
    const P = pick(ctx.P);
    const ds = divisors(P).filter((d) => d >= 2 && d <= 24);
    x1 = pick(ds.filter((d) => d <= 8) || ds);
    const cand = ds.filter((d) => d !== x1);
    x2 = pick(cand);
    y1 = P / x1; y2 = P / x2;
    wrong = [Math.round((y1 * x2) / x1), y1 + (x1 - x2) * (y1 >= 1000 ? 1000 : 1), Math.round(y1 * x1)];   // dikira senilai / selisih / total
  }
  const uniq = [];
  wrong.forEach((w) => { if (w > 0 && w !== y2 && !uniq.includes(w)) uniq.push(w); });
  let bump = 1;
  while (uniq.length < 3) { const w = y2 + bump * (y2 > 20 ? Math.round(y2 / 5) : 2); if (w > 0 && !uniq.includes(w) && w !== y2) uniq.push(w); bump += 1; }
  const opts = shuffle([y2, ...uniq.slice(0, 3)]).map((v) => ({ v, label: ctx.fb(v) }));
  const why1 = t === 'senilai'
    ? `${ctx.a.split(' ')[0]} naik, ${ctx.b.split(' ')[0].toLowerCase()} ikut naik. Naik–naik = SENILAI.`
    : `${ctx.a.split(' ')[0]} naik, ${ctx.b.split(' ')[0].toLowerCase()} justru turun. Naik–turun = BERBALIK NILAI.`;
  const why = t === 'senilai'
    ? `${fmt(y1)} ÷ ${x1} = y ÷ ${x2}  →  y = ${fmt(y1)} × ${x2} ÷ ${x1} = ${fmt(y2)}.`
    : `${x1} × ${fmt(y1)} = ${x2} × y  →  y = ${fmt(x1 * y1)} ÷ ${x2} = ${fmt(y2)}.`;
  return {
    type: t, story: ctx.story(x1, y1, x2), heads: [ctx.a, ctx.b],
    rows: [[String(x1), fmt(y1)], [String(x2), '?']],
    ask: ctx.b,
    ans: y2, opts, why, why1,
    analyze1: `Lihat kolom tabel: ${ctx.a} bergerak ${x2 > x1 ? 'naik' : 'turun'}. Apakah ${ctx.b} ikut atau berlawanan?`,
    analyze2: hintOf(t, x1, y1, x2, ctx),
  };
}

// ---------- 1 ronde Isi Tabel ----------
// Mengembalikan: { type, heads, rows:[{x, y, given}], rule, tip }
// Baris pertama diketahui; sisanya diisi siswa. Urutan isi: baris "1" dulu (nilai satuan).
export function makeTableRound(type) {
  if (type === 'senilai') {
    const ctx = pick([
      { a: 'Bensin (L)', b: 'Jarak (km)', k: [30, 40, 45, 50] },
      { a: 'Gula (kg)', b: 'Harga (Rp ribu)', k: [12, 14, 15, 16] },
      { a: 'Roti (buah)', b: 'Harga (Rp ribu)', k: [3, 4, 5, 6] },
    ]);
    const k = pick(ctx.k);
    const x1 = rnd(2, 5);
    const xs = shuffle([2, 3, 4, 5, 6, 8, 10].filter((v) => v !== x1)).slice(0, 2);
    return {
      type, heads: [ctx.a, ctx.b], k,
      rows: [{ x: x1, y: k * x1, given: true }, { x: 1, y: k }, { x: xs[0], y: k * xs[0] }, { x: xs[1], y: k * xs[1] }],
      rule: `Senilai: nilai untuk 1 satuan (y ÷ x) selalu sama = ${k}.`,
      tip: 'Mulai dari baris "1": bagi dulu nilai y dengan x.',
    };
  }
  const ctx = pick([
    { a: 'Pekerja (orang)', b: 'Waktu (hari)', P: [12, 24, 36, 48, 60] },
    { a: 'Kran (buah)', b: 'Waktu (menit)', P: [12, 24, 36, 60] },
    { a: 'Laju (km/jam)', b: 'Waktu (jam)', P: [60, 120, 180, 240] },
  ]);
  const P = pick(ctx.P);
  const ds = divisors(P).filter((d) => d >= 2 && d <= 24);
  const x1 = pick(ds.filter((d) => d <= 6));
  const others = shuffle(ds.filter((d) => d !== x1)).slice(0, 2);
  return {
    type, heads: [ctx.a, ctx.b], k: P,
    rows: [{ x: x1, y: P / x1, given: true }, { x: 1, y: P }, { x: others[0], y: P / others[0] }, { x: others[1], y: P / others[1] }],
    rule: `Berbalik nilai: hasil kali x × y selalu sama = ${P}.`,
    tip: 'Mulai dari baris "1": kalikan x dengan y untuk mendapat total pekerjaan/jarak.',
  };
}

// ---------- Pasangan Rasio ----------
const gcd = (a, b) => (b ? gcd(b, a % b) : a);
// 'rasio'  : a : b  <->  ma : mb   (senilai: kedua suku dikali bilangan yang sama)
// 'kali'   : a × b  <->  c × d    (berbalik nilai: hasil kali sama)
export function makePairs(kind, n = 4) {
  const pairs = [];
  const used = new Set();
  let guard = 0;
  while (pairs.length < n && guard++ < 200) {
    if (kind === 'rasio') {
      const a = rnd(1, 7), b = rnd(2, 9);
      if (a === b || gcd(a, b) !== 1 || used.has(a + ':' + b)) continue;
      used.add(a + ':' + b);
      const m = rnd(2, 5);
      pairs.push({ l: `${a} : ${b}`, r: `${a * m} : ${b * m}`, why: `${a} : ${b} sama dengan ${a * m} : ${b * m}, sebab kedua suku dikali ${m}.` });
    } else {
      const P = pick([12, 18, 20, 24, 30, 36]);
      if (used.has(P)) continue;
      const ds = divisors(P).filter((d) => d >= 2 && d <= P / 2);
      if (ds.length < 2) continue;
      const a = pick(ds);
      const c = pick(ds.filter((d) => d !== a && d !== P / a));
      if (!c) continue;
      used.add(P);
      pairs.push({ l: `${a} × ${P / a}`, r: `${c} × ${P / c}`, why: `${a} × ${P / a} = ${P} dan ${c} × ${P / c} = ${P}. Hasil kalinya sama.` });
    }
  }
  return pairs;
}
