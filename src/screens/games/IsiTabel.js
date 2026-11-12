import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Pressable, Animated, StyleSheet } from 'react-native';
import Text from '../../components/Txt';
import PageShell, { Card } from '../../components/PageShell';
import { Btn, Tag, fmt } from '../../components/Ui';
import { Rise, Pop, Meter, useShake, Burst } from '../../components/Fx';
import { COLOR } from '../../theme';
import { makeTableRound } from '../../gamedata';
import { sfx } from '../../audio';
import { BossArena, BossResult, makeBoss, useBoss } from '../../components/BossArena';

// ============================================================
//  ISI TABEL  — melatih strategi "cari nilai 1 satuan dulu".
//  Siswa mengisi baris "1", lalu baris lain, memakai keypad (mengetik angka, bukan menebak pilihan).
//  Bantuan memudar: salah 1x -> tip langkah; salah 2x -> rumus; salah 3x -> jawaban ditampilkan (0 poin).
//  Skor: benar langsung 10, setelah 1 petunjuk 5, jawaban dibuka 0.  Soal selalu acak.
// ============================================================
const ORDER = ['senilai', 'berbalik', 'senilai', 'berbalik'];
const PER = 10;

export default function IsiTabel({ onBack, onExit, onResult, onBoss, onStage, stage = 0 }) {
  const rounds = useMemo(() => ORDER.map((t) => makeTableRound(t)), []);
  const bs = useBoss(makeBoss('tabel', stage, rounds.reduce((a, r) => a + r.rows.length - 1, 0)));
  const answered = useRef(0);
  const finished = useRef(false);
  const [ri, setRi] = useState(0);
  const [bi, setBi] = useState(1);              // baris yang sedang diisi (baris 0 sudah diketahui)
  const [val, setVal] = useState('');
  const [tries, setTries] = useState(0);
  const [filled, setFilled] = useState({});
  const [score, setScore] = useState(0);
  const [note, setNote] = useState(null);       // { ok, text }
  const [roundDone, setRoundDone] = useState(false);
  const [done, setDone] = useState(false);
  const [wrong, setWrong] = useState(0);
  const shake = useShake(wrong);

  const R = rounds[ri];
  const blanks = R.rows.length - 1;
  const max = rounds.reduce((a, r) => a + (r.rows.length - 1) * PER, 0);
  const accent = R.type === 'senilai' ? COLOR.cyan : '#FF4D8D';

  const advance = (pts, revealed, text) => {
    sfx(revealed ? 'select' : 'correct');
    answered.current += 1;
    if (!revealed) bs.hit(pts >= PER ? 1 : 0.5);
    setScore((s) => s + pts);
    setFilled((f) => ({ ...f, [bi]: true }));
    setVal(''); setTries(0);
    if (bi + 1 >= R.rows.length) { setRoundDone(true); setNote({ ok: true, text: R.rule }); }
    else { setBi(bi + 1); setNote(revealed ? { ok: false, text } : null); }
  };

  const check = () => {
    if (val === '' || roundDone) return;
    const row = R.rows[bi];
    if (parseInt(val, 10) === row.y) { advance(tries === 0 ? PER : tries === 1 ? PER / 2 : 0, false); return; }
    sfx('wrong'); setWrong((w) => w + 1); setVal('');
    if (tries === 0) bs.miss();   // bos menyerang sekali per baris (tidak menghukum berulang)
    const t = tries + 1;
    setTries(t);
    if (t >= 3) advance(0, true, `Jawabannya ${fmt(row.y)}. ${R.rule}`);
    else setNote({ ok: false, text: t === 1 ? R.tip : R.rule });
  };

  const press = (k) => {
    if (roundDone) return;
    sfx('click');
    if (k === 'DEL') setVal((v) => v.slice(0, -1));
    else if (k === 'OK') check();
    else setVal((v) => (v.length < 7 ? (v === '0' ? k : v + k) : v));
  };

  const finish = () => {
    if (finished.current) return;
    finished.current = true;
    setDone(true);
    onResult && onResult('tabel', { score, max: Math.max(1, answered.current * PER) });
    onBoss && onBoss('tabel', bs.B.stage, bs.won);
  };
  // bos kalah / HP pemain habis: akhiri setelah animasi sempat terlihat
  useEffect(() => {
    if (!bs.over) return undefined;
    const id = setTimeout(finish, 1200);
    return () => clearTimeout(id);
  }, [bs.over]); // eslint-disable-line react-hooks/exhaustive-deps

  const next = () => {
    if (ri + 1 >= rounds.length) { finish(); return; }
    setRi(ri + 1); setBi(1); setVal(''); setTries(0); setFilled({}); setNote(null); setRoundDone(false);
  };

  if (done) {
    return (
      <PageShell title="Isi Tabel" onBack={onExit || onBack} focusable>
        <BossResult bs={bs} onRetry={() => onStage && onStage(bs.B.stage)} onNext={() => onStage && onStage(bs.B.stage + 1)} onExit={onExit || onBack}>
          <Text style={t.rank}>SKOR {score}</Text>
          <Text style={t.body}>Senilai: nilai untuk 1 satuan (y ÷ x) selalu sama. Berbalik nilai: hasil kali (x × y) selalu sama.</Text>
        </BossResult>
      </PageShell>
    );
  }

  return (
    <PageShell title="Isi Tabel" onBack={onExit || onBack} focusable>
      <BossArena bs={bs} />
      <View style={t.head}>
        <Text style={t.kicker}>RONDE {ri + 1}/{rounds.length}</Text>
        <Text style={t.score}>SKOR {score}</Text>
      </View>
      <View style={t.dots}>
        {rounds.map((_, i) => <View key={i} style={[t.dot, i <= ri && { backgroundColor: accent }]} />)}
      </View>

      <Card no={ri + 1} title={R.type === 'senilai' ? 'Isi dari nilai 1 satuan' : 'Cari hasil kali tetap'} accent={accent}>
        <Tag type={R.type} />
        <Text style={t.story}>
          {R.type === 'senilai'
            ? 'Satu baris sudah diketahui. Cari dulu nilai untuk 1, lalu isi baris lainnya.'
            : 'Satu baris sudah diketahui. Hitung dulu total (x × y) di baris 1, lalu bagi untuk baris lainnya.'}
        </Text>

        {/* tabel */}
        <Animated.View style={[t.table, { transform: [{ translateX: shake }] }]}>
          <View style={t.tr}>{R.heads.map((h) => <Text key={h} style={[t.th, { color: accent }]}>{h}</Text>)}</View>
          {R.rows.map((row, i) => {
            const active = i === bi && !roundDone;
            const known = row.given || filled[i];
            return (
              <View key={i} style={[t.tr, active && { backgroundColor: 'rgba(255,255,255,0.08)' }]}>
                <Text style={t.tdx}>{row.x}</Text>
                <View style={t.tdyBox}>
                  {known ? <Pop key={'f' + ri + i}><Text style={[t.tdy, !row.given && { color: accent }]}>{fmt(row.y)}</Text></Pop>
                    : active ? <View style={[t.input, { borderColor: accent }]}><Text style={t.inputT}>{val === '' ? ' ' : val}</Text><Text style={[t.caret, { color: accent }]}>|</Text></View>
                      : <Text style={t.q}>?</Text>}
                </View>
              </View>
            );
          })}
        </Animated.View>

        {note && (
          <Rise from={8}>
            <Text style={[t.note, { color: note.ok ? COLOR.cyan : '#FFD400' }]}>{note.text}</Text>
          </Rise>
        )}

        {!roundDone ? (
          <View style={t.pad}>
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'DEL', '0', 'OK'].map((k) => (
              <Pressable key={k} onPress={() => press(k)} style={[t.key, k === 'OK' && { backgroundColor: accent, borderColor: accent }, k === 'DEL' && { borderColor: '#FF8AB5' }]}>
                <Text style={[t.keyT, k === 'OK' && { color: COLOR.navy }, k === 'DEL' && { fontSize: 12, letterSpacing: 1 }]}>{k === 'DEL' ? 'HAPUS' : k}</Text>
              </Pressable>
            ))}
          </View>
        ) : (
          <Btn label={ri + 1 >= rounds.length ? 'LIHAT HASIL' : 'RONDE BERIKUTNYA'} icon="right" tone="cyan" onPress={next} />
        )}
      </Card>
      <Text style={t.foot}>Baris yang tersisa: {blanks - Object.keys(filled).length}.  Bantuan: salah 1x = tip, 2x = rumus, 3x = jawaban dibuka.</Text>
    </PageShell>
  );
}

const t = StyleSheet.create({
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  kicker: { color: COLOR.cyan, fontSize: 11, fontWeight: '900', letterSpacing: 2.5 },
  score: { color: '#FFD45C', fontSize: 14, fontWeight: '900', letterSpacing: 2 },
  dots: { flexDirection: 'row', marginVertical: 12 },
  dot: { flex: 1, height: 6, marginRight: 5, backgroundColor: 'rgba(255,255,255,0.14)', transform: [{ skewX: '-15deg' }] },
  story: { color: COLOR.text, fontSize: 14, lineHeight: 22 },
  table: { marginTop: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', backgroundColor: 'rgba(2,12,27,0.7)' },
  tr: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)', minHeight: 46 },
  th: { flex: 1, padding: 10, fontSize: 11, fontWeight: '900', letterSpacing: 1 },
  tdx: { flex: 1, padding: 10, color: COLOR.white, fontSize: 20, fontWeight: '900', fontStyle: 'italic' },
  tdyBox: { flex: 1, padding: 6 },
  tdy: { color: COLOR.white, fontSize: 20, fontWeight: '900', fontStyle: 'italic', paddingLeft: 4 },
  q: { color: 'rgba(255,255,255,0.35)', fontSize: 20, fontWeight: '900', paddingLeft: 4 },
  input: { flexDirection: 'row', alignItems: 'center', borderWidth: 2, paddingHorizontal: 8, paddingVertical: 3, backgroundColor: 'rgba(3,26,74,0.9)' },
  inputT: { color: COLOR.white, fontSize: 20, fontWeight: '900', fontStyle: 'italic' },
  caret: { fontSize: 20, fontWeight: '300' },
  note: { fontSize: 13, lineHeight: 20, fontWeight: '800', marginTop: 12 },
  pad: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 14, marginHorizontal: -4 },
  key: { width: '30.5%', margin: '1.4%', paddingVertical: 12, alignItems: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.25)', backgroundColor: 'rgba(3,26,74,0.85)' },
  keyT: { color: COLOR.white, fontSize: 20, fontWeight: '900', includeFontPadding: false },
  foot: { color: COLOR.text, opacity: 0.55, fontSize: 11, lineHeight: 17 },
  bigScore: { color: '#FF4D8D', fontSize: 58, fontWeight: '900', fontStyle: 'italic' },
  bigMax: { color: COLOR.ice, fontSize: 22 },
  rank: { color: '#fff', fontSize: 15, fontWeight: '900', letterSpacing: 2, marginTop: 4 },
  body: { color: COLOR.text, fontSize: 13, lineHeight: 21, marginTop: 14 },
});
