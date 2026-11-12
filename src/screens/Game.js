import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Pressable, StyleSheet, Animated } from 'react-native';
import Text, { AnimText } from '../components/Txt';
import PageShell, { Card } from '../components/PageShell';
import { ArrowTable, Btn, Tag } from '../components/Ui';
import { ArrowV, Tri } from '../components/Glyph';
import { COLOR } from '../theme';
import { sfx } from '../audio';
import { CASES } from '../data';
import Battle from './games/Battle';
import IsiTabel from './games/IsiTabel';
import PasanganRasio from './games/PasanganRasio';
import { makeBattleQuestion } from '../gamedata';
import { xpOf, levelOf } from '../trophies';
import { Rise } from '../components/Fx';
import { MenuRow, Kicker, Chip, Slab, Ghost } from '../components/P3';
import { SimpleTable } from '../components/Ui';
import { BossArena, BossResult, makeBoss, nextStage, useBoss } from '../components/BossArena';

// Game dirancang sebagai latihan singkat berbentuk misi: visual dulu, hitungan belakangan.
// Tidak memakai timer agar permainan tidak menambah beban yang tidak diperlukan.
const ROUNDS = [0, 1, 3, 2, 5, 4];

function Choice({ label, sub, active, correct, wrong, onPress, disabled }) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={[s.choice, active && s.choiceActive, correct && s.choiceCorrect, wrong && s.choiceWrong]}
    >
      <Text style={[s.choiceLabel, active && { color: COLOR.navy }]}>{label}</Text>
      <Text style={[s.choiceSub, active && { color: '#16325F' }]}>{sub}</Text>
    </Pressable>
  );
}

function ArrowMini({ dir, color }) {
  return (
    <View style={s.arrowWrap}>
      <ArrowV dir={dir} size={28} color={color} />
    </View>
  );
}

export default function Game({ onBack, onResult, onMini, onBoss, progress = {}, user }) {
  const rounds = useMemo(() => ROUNDS.map((i) => CASES[i]), []);
  const [round, setRound] = useState(0);
  const [pick, setPick] = useState(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [hint, setHint] = useState(false);
  const [done, setDone] = useState(false);
  const [mode, setMode] = useState('hub');
  const [mini, setMini] = useState({i:0, pick:null, score:0, done:false});
  const [jq, setJq] = useState([]);   // soal acak untuk TEBAK JENIS
  const bs = useBoss(makeBoss('relasi', 0, ROUNDS.length));   // bos Misi Relasi
  const bj = useBoss(makeBoss('jenis', 0, 5));                // bos Tebak Jenis
  const [gk, setGk] = useState(0);                           // key untuk memulai ulang game di layar terpisah
  const [stg, setStg] = useState(0);                          // level bos yang dipilih
  const cardIn = useRef(new Animated.Value(0)).current;
  const feedbackIn = useRef(new Animated.Value(0)).current;
  const scorePop = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    cardIn.setValue(0);
    Animated.spring(cardIn, { toValue: 1, friction: 7, tension: 85, useNativeDriver: true }).start();
  }, [round, cardIn]);

  const c = rounds[round];
  const answered = pick !== null;
  const correct = answered && pick === c.ans;

  useEffect(() => {
    if (!answered) return;
    feedbackIn.setValue(0);
    Animated.spring(feedbackIn, { toValue: 1, friction: 8, tension: 90, useNativeDriver: true }).start();
  }, [answered, feedbackIn]);

  const choose = (value) => {
    if (answered) return;
    const ok = value === c.ans;
    setPick(value);
    if (ok) {
      bs.hit(hint ? 0.5 : 1);
      setScore((v) => v + (hint ? 5 : 10));
      scorePop.setValue(1.18);
      Animated.spring(scorePop, { toValue: 1, friction: 5, tension: 160, useNativeDriver: true }).start();
      setStreak((v) => {
        const n = v + 1;
        setBestStreak((b) => Math.max(b, n));
        return n;
      });
    } else {
      bs.miss();
      setStreak(0);
    }
  };

  const next = () => {
    if (bs.over || round + 1 >= rounds.length) {
      const result = { score, max: rounds.length * 10, rounds: rounds.length, bestStreak };
      setDone(true);
      onResult && onResult(result);
      onBoss && onBoss('relasi', bs.B.stage, bs.won);
      return;
    }
    setRound((v) => v + 1);
    setPick(null);
    setHint(false);
  };

  const restart = () => {
    setRound(0); setPick(null); setScore(0); setStreak(0); setBestStreak(0); setHint(false); setDone(false);
  };


  const toHub = () => { restart(); setMode('hub'); };
  const lv = levelOf(xpOf(progress));
  const G = progress.games || {};

  // Hub: pilih cara belajar. Semua mode tanpa timer agar fokus ke penalaran; soal mini-game diacak tiap main.
  if (mode === 'hub') {
    const stat = (k) => {
      const r = k === 'relasi' ? (progress.game ? { best: progress.game.best, max: 60, plays: progress.game.plays } : null) : G[k];
      return r ? { best: r.best || 0, max: r.max || 1, plays: r.plays || 1 } : null;
    };
    const modes = [
      { k: 'battle', n: '01', title: 'SHADOW BATTLE', sub: 'Lawan Shadow: pilih jenis hubungan, lalu hitung. Ada ANALYZE untuk petunjuk.', col: '#FF3B5C', tag: 'BARU' },
      { k: 'relasi', n: '02', title: 'MISI RELASI', sub: 'Baca arah panah: senilai atau berbalik nilai?', col: COLOR.cyan },
      { k: 'jenis', n: '03', title: 'TEBAK JENIS', sub: '5 soal cerita acak. Tentukan jenis hubungan sebelum menghitung.', col: '#FFD400' },
      { k: 'tabel', n: '04', title: 'ISI TABEL', sub: 'Ketik angka yang hilang. Cari nilai 1 satuan dulu.', col: '#FF4D8D', tag: 'BARU' },
      { k: 'pasang', n: '05', title: 'PASANGAN RASIO', sub: 'Game kartu memori: cocokkan rasio senilai dan hasil kali sama.', col: '#B79CFF', tag: 'BARU' },
    ];
    const played = modes.filter((m) => stat(m.k)).length;
    return <PageShell title="Game" onBack={onBack} focusable crumb="MENU / GAME" sub="Pilih misimu. Soal diacak dan tanpa timer, jadi aman diulang.">
      <Rise>
        <Slab color="#FF3B5C" skew={-6} style={{ marginBottom: 20 }}>
          <View style={s.hubIn}>
            <Ghost size={86} color="#FF3B5C" opacity={0.12} style={{ right: 6, top: -12 }}>{played + '/' + modes.length}</Ghost>
            <Kicker color="#FF3B5C">PETA MINI-GAME</Kicker>
            <View style={s.sumRow}>
              <Text style={s.sumBig}>{played}<Text style={s.sumBigMax}> / {modes.length}</Text></Text>
              <View style={{ marginLeft: 14 }}>
                <Text style={s.sumT}>MODE SUDAH DICOBA</Text>
                <Text style={[s.sumT, { color: COLOR.cyan, marginTop: 3 }]}>LV {lv.level}  ·  {lv.name}</Text>
              </View>
            </View>
          </View>
        </Slab>
      </Rise>
      {modes.map((m, i) => {
        const st = stat(m.k);
        return <MenuRow
          key={m.k} no={m.n} title={m.title} sub={m.sub} color={m.col} tag={m.tag} delay={i * 70}
          frac={st ? Math.min(1, st.best / st.max) : 0}
          meta={(st ? `TERBAIK ${st.best}/${st.max}  ·  ${st.plays}x MAIN` : 'BELUM DIMAINKAN') + (m.k !== 'battle' ? `  ·  BOSS ${Math.min(3, ((progress.boss || {})[m.k] || {}).cleared || 0)}/3` : '')}
          onPress={() => {
            const sg = nextStage(progress, m.k);
            if (m.k === 'jenis') { setJq(Array.from({ length: 5 }, () => makeBattleQuestion())); bj.reset(makeBoss('jenis', sg, 5)); }
            if (m.k === 'relasi') { restart(); bs.reset(makeBoss('relasi', sg, ROUNDS.length)); }
            setStg(sg); setGk((g) => g + 1);
            setMode(m.k); setMini({ i: 0, pick: null, score: 0, done: false });
          }}
        />;
      })}
    </PageShell>;
  }

  if (mode === 'battle') return <Battle onBack={onBack} onExit={() => setMode('hub')} onResult={onMini} user={user} level={lv.level} arcana={lv.name} />;
  const again = (n) => { setStg(n); setGk((g) => g + 1); };
  if (mode === 'tabel') return <IsiTabel key={gk} stage={stg} onStage={again} onBoss={onBoss} onBack={onBack} onExit={() => setMode('hub')} onResult={onMini} />;
  if (mode === 'pasang') return <PasanganRasio key={gk} stage={stg} onStage={again} onBoss={onBoss} onBack={onBack} onExit={() => setMode('hub')} onResult={onMini} />;

  if (mode === 'jenis') {
    const q = jq[mini.i];
    if (!q) return null;
    const answered = mini.pick !== null, ok = mini.pick === q.type;
    const JMAX = jq.length * 10;
    const restartJ = (n) => { setJq(Array.from({ length: 5 }, () => makeBattleQuestion())); bj.reset(makeBoss('jenis', n, 5)); setMini({ i: 0, pick: null, score: 0, done: false }); };
    if (mini.done) return <PageShell title="Game" onBack={() => setMode('hub')} focusable>
      <BossResult bs={bj} onRetry={() => restartJ(bj.B.stage)} onNext={() => restartJ(bj.B.stage + 1)} onExit={() => setMode('hub')}>
        <Text style={s.finalScore}>{mini.score}<Text style={s.finalMax}> / {JMAX}</Text></Text>
        <Text style={s.body}>Kuncinya: bandingkan arah kedua besaran. Naik–naik atau turun–turun = senilai. Naik–turun = berbalik nilai.</Text>
      </BossResult>
    </PageShell>;
    const choose = (v) => {
      if (answered) return;
      sfx(v === q.type ? 'correct' : 'wrong');
      if (v === q.type) bj.hit(); else bj.miss();
      setMini((x) => ({ ...x, pick: v, score: x.score + (v === q.type ? 10 : 0) }));
    };
    const last = mini.i + 1 === jq.length || bj.over;
    const goNext = () => {
      if (last) { onMini && onMini('jenis', { score: mini.score, max: JMAX }); onBoss && onBoss('jenis', bj.B.stage, bj.won); setMini((x) => ({ ...x, done: true })); }
      else setMini((x) => ({ ...x, i: x.i + 1, pick: null }));
    };
    return <PageShell title="Game" onBack={() => setMode('hub')} focusable>
      <BossArena bs={bj} />
      <Text style={s.kicker}>TEBAK JENIS</Text><Text style={s.title}>SOAL {mini.i + 1}/{jq.length}</Text>
      <View style={s.progressRow}>{jq.map((_, i) => <View key={i} style={[s.progressDot, i <= mini.i && { backgroundColor: '#FFD400' }]} />)}</View>
      <Card title="Tentukan hubungan dulu" accent="#FFD400">
        <Text style={s.story}>{q.story}</Text>
        <SimpleTable heads={q.heads} rows={q.rows} />
        <View style={s.choices}>
          <Choice label="SENILAI" sub="naik–naik / turun–turun" active={mini.pick === 'senilai'} correct={answered && q.type === 'senilai'} wrong={answered && mini.pick === 'senilai' && q.type !== 'senilai'} onPress={() => choose('senilai')} disabled={answered} />
          <Choice label="BERBALIK NILAI" sub="naik–turun" active={mini.pick === 'berbalik'} correct={answered && q.type === 'berbalik'} wrong={answered && mini.pick === 'berbalik' && q.type !== 'berbalik'} onPress={() => choose('berbalik')} disabled={answered} />
        </View>
        {answered && <Rise from={10}><View style={[s.feedback, { borderColor: ok ? COLOR.cyan : COLOR.accent }]}>
          <Text style={[s.feedbackTitle, { color: ok ? COLOR.cyan : COLOR.accent }]}>{ok ? 'TEPAT! +10' : 'BELUM TEPAT'}</Text>
          <Text style={s.body}>{q.why1}</Text>
          <Text style={s.formula}>{q.why}</Text>
          <Btn label={last ? 'SELESAI' : 'SOAL BERIKUTNYA'} icon="right" tone="cyan" onPress={goNext} />
        </View></Rise>}
      </Card>
    </PageShell>;
  }

  if (mode === 'relasi' && !done) {
    // continue to the original Misi Relasi UI below
  }

  if (done) {
    return (
      <PageShell title="Game" onBack={toHub} focusable>
        <BossResult bs={bs} onRetry={() => { restart(); bs.reset(makeBoss('relasi', bs.B.stage, rounds.length)); }} onNext={() => { restart(); bs.reset(makeBoss('relasi', bs.B.stage + 1, rounds.length)); }} onExit={toHub}>
          <Text style={s.finalScore}>{score} <Text style={s.finalMax}>/ {rounds.length * 10}</Text></Text>
          <Text style={s.body}>Streak terbaik: {bestStreak}.</Text>
        </BossResult>
      </PageShell>
    );
  }

  return (
    <PageShell title="Game" onBack={toHub} focusable>
      <BossArena bs={bs} />
      <View style={s.header}>
        <View>
          <Text style={s.kicker}>MISI RELASI</Text>
          <Text style={s.title}>NAIK–NAIK atau NAIK–TURUN?</Text>
        </View>
        <View style={s.scoreBox}>
          <Text style={s.scoreLabel}>SKOR</Text>
          <AnimText style={[s.score, { transform: [{ scale: scorePop }] }]}>{score}</AnimText>
          {streak > 1 && <Text style={s.combo}>COMBO ×{streak}</Text>}
        </View>
      </View>

      <View style={s.progressRow}>
        {rounds.map((_, i) => <View key={i} style={[s.progressDot, i <= round && { backgroundColor: COLOR.cyan }]} />)}
      </View>

      <Animated.View style={{ opacity: cardIn, transform: [{ translateY: cardIn.interpolate({ inputRange: [0,1], outputRange: [22,0] }) }, { scale: cardIn.interpolate({ inputRange: [0,1], outputRange: [0.98,1] }) }] }}>
      <Card no={`${round + 1}/${rounds.length}`} title="Pilih hubungan kedua besaran" accent={c.ans === 'senilai' ? COLOR.cyan : COLOR.accent}>
        <Text style={s.story}>{c.story}</Text>

        <View style={s.visualCard}>
          <View style={s.col}>
            <Text style={s.colName}>{c.cols[0].name}</Text>
            <Text style={s.value}>{c.cols[0].v[0]}</Text>
            <ArrowMini dir={c.cols[0].dir} color={COLOR.cyan} />
            <Text style={s.value}>{c.cols[0].v[1]}</Text>
          </View>
          <View style={s.link}><View style={s.linkLine} /><Tri dir="right" size={7} color="rgba(255,255,255,0.5)" /></View>
          <View style={s.col}>
            <Text style={s.colName}>{c.cols[1].name}</Text>
            <Text style={s.value}>{c.cols[1].v[0]}</Text>
            <ArrowMini dir={c.cols[1].dir} color={COLOR.accent} />
            <Text style={s.value}>{c.cols[1].v[1]}</Text>
          </View>
        </View>

        {!answered && <Text style={s.prompt}>Lihat arah panahnya. Jangan hitung dulu.</Text>}

        <View style={s.choices}>
          <Choice
            label="SENILAI"
            sub="naik–naik / turun–turun"
            active={pick === 'senilai'}
            correct={answered && c.ans === 'senilai'}
            wrong={answered && pick === 'senilai' && c.ans !== 'senilai'}
            onPress={() => choose('senilai')}
            disabled={answered}
          />
          <Choice
            label="BERBALIK NILAI"
            sub="naik–turun"
            active={pick === 'berbalik'}
            correct={answered && c.ans === 'berbalik'}
            wrong={answered && pick === 'berbalik' && c.ans !== 'berbalik'}
            onPress={() => choose('berbalik')}
            disabled={answered}
          />
        </View>

        {!answered && !hint && <Btn label="BUTUH PETUNJUK?" onPress={() => setHint(true)} />}
        {hint && !answered && <Text style={s.hint}>Petunjuk: kalau satu besaran naik, perhatikan apakah yang lain ikut naik atau justru turun.</Text>}

        {answered && (
          <Animated.View style={[s.feedback, { borderColor: correct ? COLOR.cyan : COLOR.accent, opacity: feedbackIn, transform: [{ translateY: feedbackIn.interpolate({ inputRange: [0,1], outputRange: [12,0] }) }] }]}>
            <Text style={[s.feedbackTitle, { color: correct ? COLOR.cyan : COLOR.accent }]}>{correct ? 'TEPAT! +' + (hint ? 5 : 10) : 'BELUM TEPAT'}</Text>
            <Tag type={c.ans} />
            <ArrowTable cols={c.cols} />
            <Text style={s.body}>{c.why}</Text>
            {!correct && <Text style={s.body}>Tidak apa-apa. Fokus pada arah panah, lalu coba lagi di ronde berikutnya.</Text>}
            <Btn label={bs.over || round + 1 === rounds.length ? 'LIHAT HASIL' : 'RONDE BERIKUTNYA'} icon="right" onPress={next} tone="cyan" />
          </Animated.View>
        )}
      </Card>
      </Animated.View>
    </PageShell>
  );
}

const s = StyleSheet.create({
  hubIn: { paddingVertical: 16, paddingLeft: 24, paddingRight: 18, overflow: 'hidden' },
  sumRow: { flexDirection: 'row', alignItems: 'center' },
  sumBig: { color: '#fff', fontSize: 46, lineHeight: 50, fontWeight: '900', fontStyle: 'italic', includeFontPadding: false },
  sumBigMax: { color: COLOR.ice, fontSize: 20 },
  sumT: { color: COLOR.ice, fontSize: 11, fontWeight: '900', letterSpacing: 2 },
  modeCard: { borderWidth: 2, backgroundColor: 'rgba(3,26,74,0.82)', padding: 16, marginTop: 12 },
  modeTop: { flexDirection: 'row', alignItems: 'center' },
  modeNo: { paddingHorizontal: 8, paddingVertical: 1, marginRight: 10, transform: [{ skewX: '-12deg' }] },
  modeNoT: { color: COLOR.navy, fontWeight: '900', fontSize: 13, transform: [{ skewX: '12deg' }] },
  newTag: { marginLeft: 10, backgroundColor: '#FFD400', paddingHorizontal: 7, paddingVertical: 1, transform: [{ skewX: '-12deg' }] },
  newTagT: { color: COLOR.navy, fontWeight: '900', fontSize: 9, letterSpacing: 1.5, transform: [{ skewX: '12deg' }] },
  modeBest: { marginTop: 10 },
  bestTrack: { height: 5, backgroundColor: 'rgba(255,255,255,0.14)', marginBottom: 4 },
  bestT: { color: COLOR.ice, fontSize: 10, fontWeight: '800', letterSpacing: 1.5, opacity: 0.85 },
  formula: { color: '#FFD400', fontSize: 14, fontWeight: '800', lineHeight: 22, marginTop: 8 },
  modeTitle: { fontSize: 18, fontWeight: '900', fontStyle: 'italic' },
  modeSub: { color: COLOR.text, fontSize: 12, lineHeight: 18, marginTop: 5 },
  tableMini: { flexDirection:'row', flexWrap:'wrap', borderWidth:1, borderColor:'rgba(255,255,255,0.2)', marginTop:14 },
  tableHead: { width:'50%', padding:8, color:COLOR.cyan, fontSize:10, fontWeight:'900', borderBottomWidth:1, borderColor:'rgba(255,255,255,0.15)' },
  tableCell: { width:'50%', padding:10, color:COLOR.white, fontSize:14, fontWeight:'800', borderBottomWidth:1, borderColor:'rgba(255,255,255,0.1)' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  kicker: { color: COLOR.cyan, fontSize: 10, fontWeight: '900', letterSpacing: 2.5 },
  title: { color: COLOR.white, fontSize: 19, fontWeight: '900', fontStyle: 'italic', marginTop: 2 },
  scoreBox: { borderWidth: 2, borderColor: COLOR.cyan, paddingHorizontal: 12, paddingVertical: 5, alignItems: 'center', minWidth: 70 },
  scoreLabel: { color: COLOR.ice, fontSize: 8, fontWeight: '900', letterSpacing: 2 },
  score: { color: COLOR.cyan, fontSize: 22, fontWeight: '900' },
  combo: { color: '#FFD45C', fontSize: 9, fontWeight: '900', letterSpacing: 1.5, marginTop: 2 },
  progressRow: { flexDirection: 'row', marginBottom: 16 },
  progressDot: { flex: 1, height: 6, marginRight: 5, backgroundColor: 'rgba(255,255,255,0.14)', transform: [{ skewX: '-15deg' }] },
  story: { color: COLOR.white, fontSize: 16, lineHeight: 24, fontWeight: '700' },
  visualCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', marginTop: 16, padding: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.16)', backgroundColor: 'rgba(2,12,27,0.7)' },
  col: { alignItems: 'center', flex: 1 },
  colName: { color: COLOR.ice, fontSize: 11, fontWeight: '900', textAlign: 'center', marginBottom: 7 },
  value: { color: COLOR.white, fontSize: 18, fontWeight: '900' },
  arrowWrap: { height: 26, justifyContent: 'center' },
  link: { width: 42, height: 20, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', opacity: 0.8 },
  linkLine: { width: 26, height: 2, backgroundColor: 'rgba(255,255,255,0.5)' },
  prompt: { color: COLOR.cyan, fontSize: 12, fontWeight: '800', fontStyle: 'italic', marginTop: 12 },
  choices: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 12 },
  choice: { flexGrow: 1, flexBasis: 150, borderWidth: 2, borderLeftWidth: 6, borderColor: 'rgba(255,255,255,0.25)', borderLeftColor: COLOR.cyan, backgroundColor: 'rgba(3,26,74,0.85)', padding: 13, marginRight: 8, marginBottom: 8 },
  choiceActive: { backgroundColor: COLOR.white, borderColor: COLOR.white },
  choiceCorrect: { borderColor: COLOR.cyan },
  choiceWrong: { borderColor: COLOR.accent },
  choiceLabel: { color: COLOR.white, fontSize: 15, fontWeight: '900', fontStyle: 'italic' },
  choiceSub: { color: COLOR.ice, fontSize: 11, marginTop: 4, fontWeight: '700' },
  hint: { color: '#FFD400', fontSize: 13, lineHeight: 20, fontWeight: '700', marginVertical: 8 },
  feedback: { borderWidth: 2, padding: 14, marginTop: 10, backgroundColor: 'rgba(2,12,27,0.65)' },
  feedbackTitle: { fontSize: 17, fontWeight: '900', fontStyle: 'italic', letterSpacing: 1.5, marginBottom: 8 },
  body: { color: COLOR.text, fontSize: 13, lineHeight: 21, marginTop: 10 },
  finalScore: { color: COLOR.cyan, fontSize: 58, fontWeight: '900', fontStyle: 'italic' },
  finalMax: { color: COLOR.ice, fontSize: 24 },
  finalTitle: { color: COLOR.white, fontSize: 18, fontWeight: '900', letterSpacing: 2, marginTop: 2 },
});
