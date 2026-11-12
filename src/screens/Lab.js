import React, { useMemo, useState } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import Text from '../components/Txt';
import { COLOR } from '../theme';
import PageShell, { Card } from '../components/PageShell';
import { Rise, Pop, PressScale } from '../components/Fx';
import { Tag, fmt, Btn } from '../components/Ui';
import { sfx } from '../audio';
import { TabBtn, Ghost, Chip } from '../components/P3';

// ============================================================
//  LAB — tempat siswa "bermain" dengan angka sebelum berhitung.
//  1) Geser nilai x: bar, tabel, dan GRAFIK berubah bersamaan (cari nilai yang selalu tetap).
//  2) Hitung Bertahap: satu langkah per ketukan (mengurangi beban berpikir), rumus berisi angka sungguhan.
//  3) Tebak Dulu: soal acak (x dikali 2 / 3 / dibagi 2), selalu ada alasan di akhir.
//  4) Awas Salah Kaprah: kesalahan umum siswa + cara mengeceknya.
//  Dua cerita untuk tiap jenis, agar konsep terlihat berlaku di banyak situasi.
// ============================================================
const MODES = {
  senilai: {
    color: COLOR.cyan, label: 'SENILAI', formula: 'y = k × x', const: 'y ÷ x', right: 'sama-sama naik atau sama-sama turun',
    items: [
      { id: 'bensin', title: 'Bensin Motor', xs: [1, 2, 3, 4, 5, 6, 8, 10], xl: 'Bensin (liter)', yl: 'Jarak (km)', k: 40, max: 400, story: '1 liter bensin dapat menempuh 40 km.' },
      { id: 'apel', title: 'Harga Apel', xs: [1, 2, 3, 4, 5, 6, 8, 10], xl: 'Apel (kg)', yl: 'Harga (ribu Rp)', k: 25, max: 250, story: '1 kg apel harganya Rp25.000.' },
    ],
    y: (it, x) => it.k * x,
    base: (it) => ({ x: 1, y: it.k }),
    mistakes: [
      ['“Bilangan besar pasti berbalik nilai.”', 'Bukan. Lihat ARAH: kalau x naik lalu y ikut naik, itu senilai.'],
      ['“Cukup tambah selisihnya.”', 'Senilai memakai KALI, bukan tambah. x jadi 3 kali → y jadi 3 kali.'],
    ],
  },
  berbalik: {
    color: '#FF4D8D', label: 'BERBALIK NILAI', formula: 'x × y = k', const: 'x × y', right: 'yang satu naik, yang lain turun',
    items: [
      { id: 'pekerja', title: 'Pekerja Bangunan', xs: [1, 2, 3, 4, 6, 8, 12, 24], xl: 'Pekerja (orang)', yl: 'Waktu (hari)', k: 24, max: 24, story: 'Satu proyek selesai 24 hari bila dikerjakan 1 orang.' },
      { id: 'motor', title: 'Kecepatan Motor', xs: [10, 20, 30, 40, 60, 120], xl: 'Kecepatan (km/jam)', yl: 'Waktu (jam)', k: 120, max: 12, story: 'Jarak 120 km. Pada kecepatan 10 km/jam ditempuh 12 jam.' },
    ],
    y: (it, x) => it.k / x,
    base: (it) => ({ x: it.xs[0], y: it.k / it.xs[0] }),
    mistakes: [
      ['“Kalau x naik, y juga harus naik.”', 'Tidak selalu. Pada berbalik nilai, x naik → y TURUN.'],
      ['“Kali silang langsung.”', 'Cek dulu: x × y harus tetap sama. Kalau tidak tetap, bukan berbalik nilai.'],
    ],
  },
};

function Bar({ label, value, max, color }) {
  return (
    <View style={{ marginBottom: 12 }}>
      <View style={st.barHead}><Text style={st.barL}>{label}</Text><Text style={[st.barV, { color }]}>{fmt(value)}</Text></View>
      <View style={st.track}><View style={[st.fill, { width: `${Math.max(3, Math.min(100, (value / max) * 100))}%`, backgroundColor: color }]} /></View>
    </View>
  );
}

// Grafik titik: sumbu x = nilai x, sumbu y = nilai y. Titik terpilih membesar + garis bantu ke sumbu.
function Graph({ it, f, i, color }) {
  const H = 150, xMax = it.xs[it.xs.length - 1];
  const pt = (x) => ({ l: (x / xMax) * 100, b: (f(x) / it.max) * 100 });
  const cur = pt(it.xs[i]);
  return (
    <View>
      <View style={[st.graph, { height: H }]}>
        {[25, 50, 75].map((g) => <View key={g} style={[st.gridH, { bottom: `${g}%` }]} />)}
        {it.xs.map((x, idx) => { const p = pt(x); return <View key={x} style={[st.dot, { left: `${p.l}%`, bottom: `${Math.min(97, p.b)}%`, backgroundColor: idx === i ? '#fff' : color, opacity: idx === i ? 1 : 0.55 }]} />; })}
        <View style={[st.guideV, { left: `${cur.l}%`, borderColor: color }]} />
        <View style={[st.guideH, { bottom: `${Math.min(97, cur.b)}%`, borderColor: color }]} />
        <View style={[st.dotBig, { left: `${cur.l}%`, bottom: `${Math.min(97, cur.b)}%`, borderColor: color }]} />
      </View>
      <View style={st.axis}><Text style={st.axisT}>{it.xl} →</Text><Text style={st.axisT}>↑ {it.yl}</Text></View>
    </View>
  );
}

const makeQ = (mode) => {
  const f = [2, 3, 2, 4][Math.floor(Math.random() * 4)];
  const down = Math.random() < 0.3 && f === 2;           // sesekali "dibagi 2"
  const factor = down ? 'setengahnya (÷ 2)' : `${f} kali lipat`;
  const rightIdx = mode === 'senilai' ? (down ? 1 : 0) : (down ? 0 : 1);
  return { factor, f, down, rightIdx, opts: [down ? 'Jadi 2 kali lebih besar' : `Jadi ${f} kali lebih besar`, down ? 'Jadi setengahnya (÷ 2)' : `Jadi 1/${f} nya (÷ ${f})`, 'Tetap sama'] };
};

export default function Lab({ onBack, onDone }) {
  const [mode, setMode] = useState('senilai');
  const [pickIt, setPickIt] = useState({ senilai: 0, berbalik: 0 });
  const [i, setI] = useState(1);
  const [step, setStep] = useState(0);              // Hitung Bertahap: 0..3
  const [q, setQ] = useState(() => makeQ('senilai'));
  const [pick, setPick] = useState(null);
  const [streak, setStreak] = useState(0);
  const M = MODES[mode];
  const it = M.items[pickIt[mode]];
  const f = (x) => M.y(it, x);
  const x = it.xs[i], y = f(x);
  const base = M.base(it);

  const move = (d) => { const n = Math.max(0, Math.min(it.xs.length - 1, i + d)); if (n !== i) { sfx('click'); setI(n); setStep(0); } };
  const swap = (k) => { if (k === mode) return; sfx('select'); setMode(k); setI(1); setStep(0); setPick(null); setQ(makeQ(k)); };
  const swapItem = (n) => { if (n === pickIt[mode]) return; sfx('select'); setPickIt((p) => ({ ...p, [mode]: n })); setI(1); setStep(0); };
  const answer = (n) => {
    if (pick !== null) return;
    setPick(n);
    const ok = n === q.rightIdx;
    sfx(ok ? 'correct' : 'wrong');
    setStreak((s) => (ok ? s + 1 : 0));
    if (ok) onDone && onDone({ [mode]: true });
  };
  const again = () => { sfx('click'); setQ(makeQ(mode)); setPick(null); };

  // langkah hitung bertahap
  const steps = useMemo(() => {
    const k = it.k;
    if (mode === 'senilai') return [
      `Diketahui: ${fmt(base.x)} ${it.xl.split(' ')[0].toLowerCase()} → ${fmt(base.y)} ${it.yl.split(' ')[0].toLowerCase()}.`,
      `Cari nilai untuk 1 satuan: y ÷ x = ${fmt(base.y)} ÷ ${fmt(base.x)} = ${fmt(k)}.`,
      `Kalikan dengan x yang ditanya: y = ${fmt(k)} × ${fmt(x)}.`,
      `Jadi y = ${fmt(y)}.  Cek: ${fmt(y)} ÷ ${fmt(x)} = ${fmt(k)} (sama dengan nilai tetap).`,
    ];
    return [
      `Diketahui: ${fmt(base.x)} ${it.xl.split(' ')[0].toLowerCase()} → ${fmt(base.y)} ${it.yl.split(' ')[0].toLowerCase()}.`,
      `Cari hasil kali tetap: x × y = ${fmt(base.x)} × ${fmt(base.y)} = ${fmt(k)}.`,
      `Bagi dengan x yang ditanya: y = ${fmt(k)} ÷ ${fmt(x)}.`,
      `Jadi y = ${fmt(y)}.  Cek: ${fmt(x)} × ${fmt(y)} = ${fmt(k)} (sama dengan hasil kali tetap).`,
    ];
  }, [mode, it, x, y]); // eslint-disable-line react-hooks/exhaustive-deps

  const why = mode === 'senilai'
    ? `Senilai: x ${q.down ? 'turun' : 'naik'} → y ikut ${q.down ? 'turun' : 'naik'}. Perbandingan tetap, jadi y ÷ x tetap.`
    : `Berbalik nilai: x ${q.down ? 'turun' : 'naik'} → y ${q.down ? 'naik' : 'turun'}. Hasil kali x × y tetap.`;

  return (
    <PageShell title="Lab" onBack={onBack} crumb="MENU / LAB" sub="Geser angkanya, lihat grafik dan tabelnya berubah. Cari nilai yang selalu tetap.">
      <View style={st.tabs}>
        {Object.keys(MODES).map((k) => <TabBtn key={k} label={MODES[k].label} on={mode === k} color={MODES[k].color} onPress={() => swap(k)} />)}
      </View>

      {/* pilih cerita */}
      <View style={st.chips}>
        {M.items.map((c, n) => (
          <Pressable key={c.id} onPress={() => swapItem(n)} style={{ marginRight: 8, marginBottom: 8 }}>
            <Chip label={c.title.toUpperCase()} color={M.color} solid={pickIt[mode] === n} />
          </Pressable>
        ))}
      </View>

      <Card no="1" title={it.title} accent={M.color}>
        <Tag type={mode} />
        <Text style={st.story}>{it.story}</Text>
        <View style={st.stepRow}>
          <PressScale onPress={() => move(-1)} style={st.stepWrap}><View style={[st.stepBtn, { borderColor: M.color }]}><Text style={st.stepT}>−</Text></View></PressScale>
          <View style={{ alignItems: 'center', flex: 1 }}>
            <Text style={st.xl}>{it.xl.toUpperCase()}</Text>
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <Ghost size={90} color={M.color} opacity={0.14} style={{ position: 'relative' }}>{x}</Ghost>
              <Text style={[st.xv, { color: M.color, position: 'absolute' }]}>{x}</Text>
            </View>
          </View>
          <PressScale onPress={() => move(1)} style={st.stepWrap}><View style={[st.stepBtn, { backgroundColor: M.color, borderColor: M.color }]}><Text style={[st.stepT, { color: COLOR.navy }]}>+</Text></View></PressScale>
        </View>
        <Bar label={it.xl} value={x} max={it.xs[it.xs.length - 1]} color={COLOR.ice} />
        <Bar label={it.yl} value={y} max={it.max} color={M.color} />
        <Graph it={it} f={f} i={i} color={M.color} />
        <Text style={st.hint}>{mode === 'senilai' ? 'Titik-titik membentuk garis lurus yang naik.' : 'Titik-titik membentuk lengkung yang turun.'}</Text>

        <View style={st.tbl}>
          <View style={st.trow}>
            <Text style={st.th}>{it.xl.split(' ')[0].toUpperCase()}</Text>
            <Text style={st.th}>{it.yl.split(' ')[0].toUpperCase()}</Text>
            <Text style={[st.th, { color: M.color }]}>{M.const}</Text>
          </View>
          {it.xs.map((xv, idx) => {
            const yv = f(xv), on = idx === i;
            return (
              <Pressable key={xv} onPress={() => { if (idx !== i) { sfx('click'); setI(idx); setStep(0); } }} style={[st.trow, on && { backgroundColor: M.color + '33' }]}>
                <Text style={[st.td, on && { color: COLOR.white }]}>{xv}</Text>
                <Text style={[st.td, on && { color: COLOR.white }]}>{fmt(yv)}</Text>
                <Text style={[st.td, { color: M.color }]}>{fmt(mode === 'senilai' ? yv / xv : xv * yv)}</Text>
              </Pressable>
            );
          })}
        </View>
        <Pop key={mode + it.id + x} style={[st.konst, { borderColor: M.color }]}>
          <Text style={st.konstL}>NILAI TETAP</Text>
          <Text style={[st.konstV, { color: M.color }]}>{mode === 'senilai' ? `y ÷ x = ${fmt(it.k)}` : `x × y = ${fmt(it.k)}`}</Text>
        </Pop>
      </Card>

      <Card no="2" title="Hitung Bertahap" accent="#3DFFA2">
        <Text style={st.story}>Berapa {it.yl.toLowerCase()} untuk {it.xl.split(' ')[0].toLowerCase()} = {x}? Ketuk untuk membuka satu langkah.</Text>
        {steps.slice(0, step + 1).map((t, n) => (
          <Rise key={mode + it.id + x + n} from={8}>
            <View style={[st.stepLine, n === 3 && { borderLeftColor: '#3DFFA2' }]}><Text style={st.stepNo}>{n + 1}</Text><Text style={st.stepTxt}>{t}</Text></View>
          </Rise>
        ))}
        {step < 3 ? <Btn label="LANGKAH BERIKUTNYA" icon="right" tone="cyan" onPress={() => { sfx('click'); setStep(step + 1); }} /> : <Btn label="ULANGI DARI AWAL" onPress={() => setStep(0)} />}
      </Card>

      <Card no="3" title="Tebak Dulu" accent="#FFD400">
        <View style={st.streakRow}><Text style={st.streakT}>BENAR BERUNTUN: {streak}</Text></View>
        <Text style={st.story}>{it.xl.split(' ')[0]} dijadikan {q.factor}. Bagaimana {it.yl.split(' ')[0].toLowerCase()}?</Text>
        {q.opts.map((o, n) => {
          const done = pick !== null, good = n === q.rightIdx, bad = done && pick === n && !good;
          return (
            <PressScale key={o} onPress={() => answer(n)} disabled={done} to={0.97} style={[st.opt, done && good && { borderColor: '#3DFFA2', backgroundColor: 'rgba(61,255,162,0.14)' }, bad && { borderColor: '#FF4D4D', backgroundColor: 'rgba(255,77,77,0.14)' }]}>
              <Text style={st.optL}>{'ABC'[n]}</Text><Text style={st.optT}>{o}</Text>
            </PressScale>
          );
        })}
        {pick !== null && (
          <Rise from={10}>
            <Text style={[st.why, { color: pick === q.rightIdx ? '#3DFFA2' : '#FF8AB5' }]}>{pick === q.rightIdx ? 'BENAR! ' : 'BELUM TEPAT. '}{why}</Text>
            <Btn label="SOAL BARU" icon="right" tone="cyan" onPress={again} />
          </Rise>
        )}
      </Card>

      <Card no="4" title="Awas Salah Kaprah" accent="#FF8AB5">
        <Text style={st.story}>Ciri {M.label.toLowerCase()}: {M.right}. Rumus: {M.formula}.</Text>
        {M.mistakes.map(([a, b]) => (
          <View key={a} style={st.mis}><Text style={st.misA}>{a}</Text><Text style={st.misB}>{b}</Text></View>
        ))}
      </Card>
    </PageShell>
  );
}

const st = StyleSheet.create({
  tabs: { flexDirection: 'row', marginBottom: 12, marginRight: -6 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 6 },
  tbl: { borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)', marginVertical: 14, backgroundColor: 'rgba(2,12,27,0.55)' },
  trow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 7, paddingHorizontal: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)' },
  th: { flex: 1, color: COLOR.cyan, fontSize: 10, fontWeight: '900', letterSpacing: 2 },
  td: { flex: 1, color: COLOR.text, fontSize: 15, fontWeight: '800' },
  story: { color: COLOR.text, fontSize: 14, lineHeight: 21, marginBottom: 12 },
  hint: { color: COLOR.ice, opacity: 0.8, fontSize: 11, marginTop: 6 },
  stepRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  stepWrap: { width: 60, height: 58 },
  stepBtn: { width: 54, height: 54, borderWidth: 2.5, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(2,12,27,0.7)', transform: [{ skewX: '-12deg' }] },
  stepT: { color: COLOR.white, fontSize: 30, fontWeight: '900', includeFontPadding: false, lineHeight: 34 },
  xl: { color: COLOR.ice, fontSize: 11, fontWeight: '900', letterSpacing: 2, textAlign: 'center' },
  xv: { fontSize: 48, fontWeight: '900', fontStyle: 'italic', includeFontPadding: false, lineHeight: 56 },
  barHead: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  barL: { color: COLOR.ice, fontSize: 12, fontWeight: '800', flexShrink: 1 },
  barV: { fontSize: 16, fontWeight: '900' },
  track: { height: 14, backgroundColor: 'rgba(255,255,255,0.1)', transform: [{ skewX: '-20deg' }] },
  fill: { height: '100%' },
  graph: { borderLeftWidth: 2, borderBottomWidth: 2, borderColor: 'rgba(255,255,255,0.5)', backgroundColor: 'rgba(2,12,27,0.55)', marginTop: 4 },
  gridH: { position: 'absolute', left: 0, right: 0, borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  dot: { position: 'absolute', width: 8, height: 8, borderRadius: 4, marginLeft: -4, marginBottom: -4 },
  dotBig: { position: 'absolute', width: 18, height: 18, borderRadius: 9, borderWidth: 3, backgroundColor: '#fff', marginLeft: -9, marginBottom: -9 },
  guideV: { position: 'absolute', top: 0, bottom: 0, borderLeftWidth: 1, borderStyle: 'dashed', opacity: 0.6 },
  guideH: { position: 'absolute', left: 0, right: 0, borderTopWidth: 1, borderStyle: 'dashed', opacity: 0.6 },
  axis: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  axisT: { color: COLOR.ice, fontSize: 10, fontWeight: '800', flexShrink: 1 },
  konst: { borderWidth: 1.5, borderBottomWidth: 4, padding: 10, alignItems: 'center', backgroundColor: 'rgba(2,12,27,0.75)' },
  konstL: { color: COLOR.ice, fontSize: 10, fontWeight: '900', letterSpacing: 3 },
  konstV: { fontSize: 24, fontWeight: '900', fontStyle: 'italic' },
  stepLine: { flexDirection: 'row', borderLeftWidth: 4, borderLeftColor: COLOR.cyan, backgroundColor: 'rgba(2,12,27,0.6)', padding: 10, marginBottom: 8 },
  stepNo: { color: COLOR.navy, backgroundColor: '#fff', width: 22, height: 22, textAlign: 'center', fontWeight: '900', marginRight: 10, lineHeight: 22 },
  stepTxt: { color: COLOR.white, fontSize: 13, lineHeight: 20, fontWeight: '700', flex: 1 },
  streakRow: { alignSelf: 'flex-start', backgroundColor: '#FFD400', paddingHorizontal: 8, paddingVertical: 2, marginBottom: 10 },
  streakT: { color: COLOR.navy, fontSize: 10, fontWeight: '900', letterSpacing: 1.5 },
  opt: { flexDirection: 'row', alignItems: 'center', borderWidth: 2, borderLeftWidth: 6, borderColor: '#243A6A', borderLeftColor: COLOR.cyan, padding: 12, marginBottom: 8, backgroundColor: 'rgba(2,12,27,0.6)' },
  optL: { color: COLOR.navy, backgroundColor: COLOR.white, fontWeight: '900', fontStyle: 'italic', width: 26, textAlign: 'center', marginRight: 12, paddingVertical: 2 },
  optT: { color: COLOR.white, fontWeight: '700', fontSize: 14, flex: 1 },
  why: { fontWeight: '800', fontSize: 13, lineHeight: 20, marginTop: 6, marginBottom: 6 },
  mis: { borderLeftWidth: 4, borderLeftColor: '#FF8AB5', backgroundColor: 'rgba(2,12,27,0.6)', padding: 10, marginBottom: 8 },
  misA: { color: '#FF8AB5', fontSize: 13, fontWeight: '900' },
  misB: { color: COLOR.text, fontSize: 13, lineHeight: 20, marginTop: 3 },
});
