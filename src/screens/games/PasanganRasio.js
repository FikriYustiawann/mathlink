import React, { useEffect, useRef, useState } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import Text from '../../components/Txt';
import PageShell, { Card } from '../../components/PageShell';
import { Btn } from '../../components/Ui';
import { Rise, Pop, Meter, Burst } from '../../components/Fx';
import { COLOR } from '../../theme';
import { makePairs, shuffle } from '../../gamedata';
import { sfx } from '../../audio';
import { BossArena, BossResult, makeBoss, useBoss } from '../../components/BossArena';

// ============================================================
//  PASANGAN RASIO  — permainan kartu memori.
//   Ronde 1 (senilai)   : pasangkan dua rasio yang nilainya sama, mis. 2 : 3 dan 8 : 12
//   Ronde 2 (berbalik)  : pasangkan dua perkalian yang hasilnya sama, mis. 3 × 8 dan 4 × 6
//  Setiap pasangan yang cocok langsung menampilkan ALASAN-nya, jadi bermain = belajar.
//  Skor ronde: 50 - 5 x (langkah berlebih). Tidak ada timer.
// ============================================================
const ROUNDS = [
  { kind: 'rasio', title: 'Rasio yang senilai', rule: 'Rasio senilai: kedua suku dikali (atau dibagi) bilangan yang sama.', accent: COLOR.cyan },
  { kind: 'kali', title: 'Hasil kali yang sama', rule: 'Berbalik nilai: hasil kali x × y selalu sama.', accent: '#FF4D8D' },
];
const PAIRS = 4;

const build = (kind) => {
  const pairs = makePairs(kind, PAIRS);
  const cards = [];
  pairs.forEach((p, i) => { cards.push({ pid: i, text: p.l }); cards.push({ pid: i, text: p.r }); });
  return { pairs, cards: shuffle(cards) };
};

export default function PasanganRasio({ onBack, onExit, onResult, onBoss, onStage, stage = 0 }) {
  const bs = useBoss(makeBoss('pasang', stage, PAIRS * ROUNDS.length));
  const finished = useRef(false);
  const [ri, setRi] = useState(0);
  const [game, setGame] = useState(() => build(ROUNDS[0].kind));
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [lock, setLock] = useState(false);
  const [msg, setMsg] = useState(null);
  const [total, setTotal] = useState(0);
  const [roundScore, setRoundScore] = useState(0);
  const [roundDone, setRoundDone] = useState(false);
  const [done, setDone] = useState(false);
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);

  const R = ROUNDS[ri];
  const { pairs, cards } = game;

  const flip = (i) => {
    if (lock || roundDone || bs.over || flipped.includes(i) || matched.includes(i)) return;
    sfx('click');
    const f = [...flipped, i];
    setFlipped(f);
    if (f.length < 2) return;
    setMoves((m) => m + 1);
    const [a, c] = f;
    if (cards[a].pid === cards[c].pid) {
      const m = [...matched, a, c];
      setMatched(m); setFlipped([]); sfx('correct'); bs.hit();
      setMsg({ ok: true, text: pairs[cards[a].pid].why });
      if (m.length === cards.length) {
        const mv = moves + 1;
        const sc = Math.max(10, 50 - 5 * Math.max(0, mv - PAIRS));
        setRoundScore(sc); setTotal((x) => x + sc); setRoundDone(true);
      }
    } else {
      setLock(true); bs.miss();
      setMsg({ ok: false, text: `${cards[a].text}  dan  ${cards[c].text}  belum sama. ${R.rule}` });
      sfx('wrong');
      timer.current = setTimeout(() => { setFlipped([]); setLock(false); }, 1000);
    }
  };

  const finish = () => {
    if (finished.current) return;
    finished.current = true;
    setDone(true);
    const sc = total + (roundDone ? 0 : Math.round((matched.length / 2) * 6));   // ronde yang belum selesai dihitung sebagian
    setTotal(sc);
    onResult && onResult('pasang', { score: sc, max: 100 });
    onBoss && onBoss('pasang', bs.B.stage, bs.won);
  };
  useEffect(() => {
    if (!bs.over) return undefined;
    const id = setTimeout(finish, 1300);
    return () => clearTimeout(id);
  }, [bs.over]); // eslint-disable-line react-hooks/exhaustive-deps

  const next = () => {
    if (ri + 1 >= ROUNDS.length) { finish(); return; }
    setRi(ri + 1); setGame(build(ROUNDS[ri + 1].kind)); setFlipped([]); setMatched([]); setMoves(0); setMsg(null); setRoundDone(false); setLock(false);
  };

  if (done) {
    return (
      <PageShell title="Pasangan Rasio" onBack={onExit || onBack} focusable>
        <BossResult bs={bs} onRetry={() => onStage && onStage(bs.B.stage)} onNext={() => onStage && onStage(bs.B.stage + 1)} onExit={onExit || onBack}>
          <Text style={p.rank}>SKOR {total} / 100</Text>
          <Text style={p.body}>Skor tinggi = sedikit langkah. Senilai = kedua suku dikali sama, berbalik nilai = hasil kali sama.</Text>
        </BossResult>
      </PageShell>
    );
  }

  return (
    <PageShell title="Pasangan Rasio" onBack={onExit || onBack} focusable>
      <BossArena bs={bs} />
      <View style={p.head}>
        <Text style={p.kicker}>RONDE {ri + 1}/{ROUNDS.length}</Text>
        <Text style={p.moves}>LANGKAH {moves}</Text>
      </View>
      <Card no={ri + 1} title={R.title} accent={R.accent}>
        <Text style={p.rule}>{R.rule}</Text>
        <View style={p.grid}>
          {cards.map((c, i) => {
            const open = flipped.includes(i) || matched.includes(i);
            const ok = matched.includes(i);
            return (
              <Pressable key={i} onPress={() => flip(i)} style={[p.card, open && p.cardOpen, ok && { borderColor: '#3DFFA2', backgroundColor: 'rgba(61,255,162,0.14)' }, !open && { borderColor: R.accent }]}>
                {open ? <Pop key={'o' + i}><Text style={[p.cardT, ok && { color: '#3DFFA2' }]}>{c.text}</Text></Pop> : <Text style={[p.cardQ, { color: R.accent }]}>?</Text>}
              </Pressable>
            );
          })}
        </View>

        {msg && (
          <Rise from={8}>
            <Text style={[p.msg, { color: msg.ok ? '#3DFFA2' : '#FFD400' }]}>{msg.ok ? 'COCOK! ' : ''}{msg.text}</Text>
          </Rise>
        )}
        {roundDone && (
          <Rise from={10}>
            <Text style={p.roundScore}>+{roundScore} POIN  ({moves} langkah)</Text>
            <Btn label={ri + 1 >= ROUNDS.length ? 'LIHAT HASIL' : 'RONDE BERIKUTNYA'} icon="right" tone="cyan" onPress={next} />
          </Rise>
        )}
      </Card>
      <Text style={p.foot}>Buka dua kartu. Kalau nilainya sama, kartu tetap terbuka dan alasannya muncul.</Text>
    </PageShell>
  );
}

const p = StyleSheet.create({
  head: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  kicker: { color: COLOR.cyan, fontSize: 11, fontWeight: '900', letterSpacing: 2.5 },
  moves: { color: '#FFD45C', fontSize: 13, fontWeight: '900', letterSpacing: 2 },
  rule: { color: COLOR.text, fontSize: 13, lineHeight: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 14, marginHorizontal: -4 },
  card: { width: '23%', margin: '1%', height: 78, alignItems: 'center', justifyContent: 'center', borderWidth: 2, backgroundColor: 'rgba(3,26,74,0.85)' },
  cardOpen: { borderColor: COLOR.white, backgroundColor: 'rgba(255,255,255,0.1)' },
  cardT: { color: COLOR.white, fontSize: 15, fontWeight: '900', fontStyle: 'italic', textAlign: 'center' },
  cardQ: { fontSize: 28, fontWeight: '900', fontStyle: 'italic', opacity: 0.8 },
  msg: { fontSize: 13, lineHeight: 20, fontWeight: '800', marginTop: 12 },
  roundScore: { color: '#FFD45C', fontSize: 15, fontWeight: '900', letterSpacing: 1, marginTop: 12 },
  foot: { color: COLOR.text, opacity: 0.55, fontSize: 11, lineHeight: 17 },
  bigScore: { color: '#FFD400', fontSize: 58, fontWeight: '900', fontStyle: 'italic' },
  bigMax: { color: COLOR.ice, fontSize: 22 },
  rank: { color: '#fff', fontSize: 15, fontWeight: '900', letterSpacing: 2, marginTop: 4 },
  body: { color: COLOR.text, fontSize: 13, lineHeight: 21, marginTop: 14 },
});
