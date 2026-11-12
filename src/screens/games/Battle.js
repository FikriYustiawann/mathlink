import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Pressable, Animated, Easing, StyleSheet } from 'react-native';
import Text, { AnimText } from '../../components/Txt';
import PageShell, { Card } from '../../components/PageShell';
import StatusCard, { Gauge, HP_COLOR } from '../../components/StatusCard';
import { Btn, SimpleTable } from '../../components/Ui';
import { Rise, Pop, Burst } from '../../components/Fx';
import useLoop from '../../hooks/useLoop';
import { COLOR } from '../../theme';
import { useChar } from '../../CharacterContext';
import { makeBattleQuestion } from '../../gamedata';
import { sfx } from '../../audio';

// ============================================================
//  SHADOW BATTLE  — soal dikerjakan dalam 2 tahap, seperti serangan weakness di P3R:
//   TAHAP 1  pilih jenis hubungan (senilai / berbalik nilai) = "mengenai weakness"
//   TAHAP 2  hitung jawaban (4 pilihan; pengecoh = kesalahan umum siswa)
//  ANALYZE (3 SP) memberi petunjuk bertahap: tahap 1 = arah tabel, tahap 2 = rumus berisi angka.
//  Tidak ada timer. Salah = Shadow menyerang (HP pemain turun), selalu disertai pembahasan.
// ============================================================
const FLOORS = [
  { name: 'SHADOW: SALAH TUKAR', hp: 72, color: '#8A5CFF', eyes: '#FFD400', tag: 'B1F' },
  { name: 'SHADOW: LUPA CEK', hp: 96, color: '#FF3B5C', eyes: '#00E5FF', tag: 'B2F' },
  { name: 'SHADOW: HITUNG ASAL', hp: 120, color: '#00C2FF', eyes: '#FF4D8D', tag: 'B3F' },
];
const PLAYER_HP = 100;
const HIT = 24;            // damage dasar per jawaban benar (2 tahap)
const COMBO_BONUS = 12;    // tambahan saat combo >= 2 (ALL-OUT)
const FAIL_DMG = 25;       // HP pemain berkurang saat salah
const SP_MAX = 3;

// Sosok Shadow dari View: topeng gelap, mata menyala, melayang naik-turun.
function Shadow({ color, eyes, hit, dead }) {
  const bob = useLoop(1600, { yoyo: true, easing: Easing.inOut(Easing.sin) });
  const shake = useRef(new Animated.Value(0)).current;
  const fade = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (!hit) return;
    Animated.sequence([14, -14, 10, -8, 4, 0].map((x) => Animated.timing(shake, { toValue: x, duration: 50, useNativeDriver: true }))).start();
  }, [hit, shake]);
  useEffect(() => {
    Animated.timing(fade, { toValue: dead ? 0 : 1, duration: dead ? 600 : 250, useNativeDriver: true }).start();
  }, [dead, fade]);
  const y = bob.interpolate({ inputRange: [0, 1], outputRange: [-6, 6] });
  return (
    <Animated.View style={[b.shadowWrap, { opacity: fade, transform: [{ translateX: shake }, { translateY: y }, { scale: fade.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] }) }] }]}>
      <View style={[b.aura, { backgroundColor: color }]} />
      <View style={[b.mask, { borderColor: color }]}>
        <View style={[b.eye, { backgroundColor: eyes, left: 20, transform: [{ rotate: '18deg' }] }]} />
        <View style={[b.eye, { backgroundColor: eyes, right: 20, transform: [{ rotate: '-18deg' }] }]} />
        <View style={[b.mouth, { backgroundColor: eyes }]} />
      </View>
      <View style={[b.drip, { backgroundColor: '#050A1F', left: 22 }]} />
      <View style={[b.drip, { backgroundColor: '#050A1F', left: 54, height: 22 }]} />
      <View style={[b.drip, { backgroundColor: '#050A1F', right: 22 }]} />
    </Animated.View>
  );
}

// Angka damage yang naik lalu hilang
function DamagePop({ n, color, id }) {
  const a = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    a.setValue(0);
    Animated.timing(a, { toValue: 1, duration: 900, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, [id, a]);
  if (!n) return null;
  return (
    <AnimText pointerEvents="none" style={[b.dmg, { color, opacity: a.interpolate({ inputRange: [0, 0.1, 0.8, 1], outputRange: [0, 1, 1, 0] }), transform: [{ translateY: a.interpolate({ inputRange: [0, 1], outputRange: [10, -46] }) }, { scale: a.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0.5, 1.3, 1] }) }] }]}>
      {n}
    </AnimText>
  );
}

export default function Battle({ onBack, onExit, onResult, user, level = 1, arcana = '' }) {
  const ch = useChar();
  const [floor, setFloor] = useState(0);
  const [q, setQ] = useState(() => makeBattleQuestion());
  const [phase, setPhase] = useState(1);        // 1 = jenis, 2 = hitung, 3 = pembahasan
  const [pick, setPick] = useState(null);
  const [eHp, setEHp] = useState(FLOORS[0].hp);
  const [pHp, setPHp] = useState(PLAYER_HP);
  const [sp, setSp] = useState(SP_MAX);
  const [analyze, setAnalyze] = useState(0);    // 0 belum, 1 sudah dipakai di tahap ini
  const [combo, setCombo] = useState(0);
  const [msg, setMsg] = useState(null);         // { ok, title, text }
  const [dmg, setDmg] = useState({ n: '', id: 0, color: '#fff', side: 'enemy' });
  const [hitId, setHitId] = useState(0);
  const [state, setState] = useState('fight');  // fight | cleared | dying | won | lost
  const [correct, setCorrect] = useState(0);
  const [cleared, setCleared] = useState(0);
  const sent = useRef(false);

  const F = FLOORS[floor];

  const strike = (ok, extra) => {
    if (ok) {
      const d = HIT + (combo >= 2 ? COMBO_BONUS : 0);
      const left = Math.max(0, eHp - d);
      setEHp(left);
      setHitId((v) => v + 1);
      setDmg({ n: (combo >= 2 ? 'ALL-OUT ' : '') + '-' + d, id: Date.now(), color: '#FFD400', side: 'enemy' });
      setCombo((c) => c + 1);
      setCorrect((c) => c + 1);
      sfx('correct');
      setMsg({ ok: true, title: combo >= 2 ? 'ALL-OUT ATTACK!' : 'TEPAT!', ...extra });
      setPhase(3);
      if (left <= 0) setState('cleared');
    } else {
      const left = Math.max(0, pHp - FAIL_DMG);
      setPHp(left);
      setDmg({ n: '-' + FAIL_DMG, id: Date.now(), color: HP_COLOR, side: 'player' });
      setCombo(0);
      sfx('wrong');
      setMsg({ ok: false, title: 'SHADOW MENYERANG', ...extra });
      setPhase(3);
      if (left <= 0) setState('dying');   // tampilkan pembahasan dulu, hasil menyusul
    }
  };

  const chooseType = (t) => {
    if (phase !== 1) return;
    setPick(t);
    if (t === q.type) {
      sfx('select');
      setTimeout(() => { setPhase(2); setPick(null); setAnalyze(0); }, 650);
    } else {
      strike(false, { text: 'Jenis hubungan belum tepat. ' + q.why1, detail: q.why });
    }
  };
  const chooseNum = (o) => {
    if (phase !== 2 || pick !== null) return;
    setPick(o.v);
    if (o.v === q.ans) strike(true, { text: q.why1, detail: q.why });
    else strike(false, { text: 'Hitungan belum tepat. Periksa lagi rumusnya.', detail: q.why });
  };

  const useAnalyze = () => {
    if (analyze || sp <= 0 || phase === 3) return;
    sfx('select');
    setSp((v) => v - 1);
    setAnalyze(1);
  };

  const next = () => {
    if (state === 'cleared') {
      const c = floor + 1;
      setCleared(c);
      if (c >= FLOORS.length) { setState('won'); return; }
      setFloor(c); setEHp(FLOORS[c].hp); setPHp((h) => Math.min(PLAYER_HP, h + 15)); setSp((v) => Math.min(SP_MAX, v + 1));
      setState('fight');
    }
    setQ(makeBattleQuestion()); setPhase(1); setPick(null); setAnalyze(0); setMsg(null);
  };

  const restart = () => {
    setFloor(0); setEHp(FLOORS[0].hp); setPHp(PLAYER_HP); setSp(SP_MAX); setCombo(0); setCorrect(0); setCleared(0);
    setQ(makeBattleQuestion()); setPhase(1); setPick(null); setAnalyze(0); setMsg(null); setState('fight'); sent.current = false;
  };

  // hasil: maksimal 100 = 3 lantai x 30 + sisa HP/10
  const score = useMemo(() => cleared * 30 + (state === 'won' ? Math.round(pHp / 10) : 0), [cleared, state, pHp]);
  useEffect(() => {
    if ((state === 'won' || state === 'lost') && !sent.current) {
      sent.current = true;
      onResult && onResult('battle', { score, max: 100, floors: cleared, correct });
    }
  }, [state, score, cleared, correct, onResult]);

  const tableRows = q.rows.map((r) => [r[0], phase === 3 ? (r[1] === '?' ? String(q.opts.find((o) => o.v === q.ans).label) : r[1]) : r[1]]);

  if (state === 'won' || state === 'lost') {
    const won = state === 'won';
    return (
      <PageShell title="Shadow Battle" onBack={onExit || onBack} focusable>
        <Card title={won ? 'SEMUA SHADOW KALAH' : 'KAMU TUMBANG'} accent={won ? '#FFD400' : COLOR.accent}>
          <View style={{ alignItems: 'center', paddingVertical: 8 }}>
            {won && <Burst count={18} radius={110} />}
            <Pop big><Text style={[b.bigScore, { color: won ? '#FFD400' : COLOR.accent }]}>{score}<Text style={b.bigMax}> / 100</Text></Text></Pop>
            <Text style={b.rankT}>{won ? (pHp >= 60 ? 'TARTARUS VANGUARD' : 'PEMBURU SHADOW') : 'ISTIRAHAT DULU, BELAJAR LAGI'}</Text>
          </View>
          <Rise delay={200}><Text style={b.body}>Lantai selesai: {cleared}/{FLOORS.length}   ·   Jawaban benar: {correct}</Text></Rise>
          <Rise delay={350}>
            <Text style={b.body}>
              {won ? 'Kamu bisa membedakan senilai dan berbalik nilai sebelum menghitung. Coba lagi dengan sedikit ANALYZE untuk skor lebih tinggi.'
                : 'Tips: tentukan dulu naik–naik atau naik–turun. Kalau ragu, pakai ANALYZE lalu baca pembahasannya.'}
            </Text>
          </Rise>
          <Btn label="BERTARUNG LAGI" tone="cyan" onPress={restart} />
          <Btn label="KEMBALI KE PETA" onPress={onExit || onBack} style={{ marginTop: 6 }} />
        </Card>
      </PageShell>
    );
  }

  const analyzeText = phase === 1 ? q.analyze1 : q.analyze2;

  return (
    <PageShell title="Shadow Battle" onBack={onExit || onBack} focusable>
      {/* arena */}
      <View style={[b.arena, { borderColor: F.color }]}>
        <View style={b.floorRow}>
          <View style={[b.floorTag, { backgroundColor: F.color }]}><Text style={b.floorTagT}>TARTARUS {F.tag}</Text></View>
          {combo >= 2 && <Pop key={combo}><Text style={b.combo}>COMBO ×{combo}</Text></Pop>}
        </View>
        <Text style={b.eName}>{F.name}</Text>
        <Gauge label="HP" value={eHp} max={F.hp} color={HP_COLOR} height={14} numSize={16} labelSize={13} />
        <View style={b.shadowBox}>
          <Shadow color={F.color} eyes={F.eyes} hit={hitId} dead={state === 'cleared'} />
          {dmg.side === 'enemy' && <View style={b.dmgBox}><DamagePop n={dmg.n} color={dmg.color} id={dmg.id} /></View>}
        </View>
      </View>

      {/* soal */}
      <Card no={phase === 1 ? '1' : phase === 2 ? '2' : '!'} title={phase === 1 ? 'Tahap 1: jenis hubungan' : phase === 2 ? 'Tahap 2: hitung' : 'Pembahasan'} accent={phase === 3 ? (msg && msg.ok ? COLOR.cyan : COLOR.accent) : '#FFD400'}>
        <Text style={b.story}>{q.story}</Text>
        <SimpleTable heads={q.heads} rows={tableRows} />

        {phase === 1 && (
          <>
            <Text style={b.prompt}>Serang titik lemahnya: ini hubungan apa?</Text>
            <View style={b.opts}>
              {[['senilai', 'SENILAI', 'naik–naik'], ['berbalik', 'BERBALIK NILAI', 'naik–turun']].map(([k, l, s2]) => (
                <Pressable key={k} onPress={() => chooseType(k)} style={[b.opt, pick === k && (k === q.type ? b.optOk : b.optBad)]}>
                  <Text style={b.optL}>{l}</Text><Text style={b.optS}>{s2}</Text>
                </Pressable>
              ))}
            </View>
          </>
        )}

        {phase === 2 && (
          <>
            <Text style={b.prompt}>Weakness kena! Sekarang hitung {q.ask}.</Text>
            <View style={b.opts}>
              {q.opts.map((o) => {
                const right = pick !== null && o.v === q.ans;
                const bad = pick === o.v && o.v !== q.ans;
                return (
                  <Pressable key={o.v} onPress={() => chooseNum(o)} style={[b.opt, right && b.optOk, bad && b.optBad]}>
                    <Text style={b.optL}>{o.label}</Text>
                  </Pressable>
                );
              })}
            </View>
          </>
        )}

        {phase !== 3 && (
          <View style={{ marginTop: 6 }}>
            {analyze ? (
              <View style={b.analyze}><Text style={b.analyzeH}>ANALYZE</Text><Text style={b.analyzeT}>{analyzeText}</Text></View>
            ) : (
              <Pressable onPress={useAnalyze} disabled={sp <= 0} style={[b.analyzeBtn, sp <= 0 && { opacity: 0.35 }]}>
                <Text style={b.analyzeBtnT}>ANALYZE  ·  SP {sp}/{SP_MAX}</Text>
              </Pressable>
            )}
          </View>
        )}

        {phase === 3 && msg && (
          <Rise from={12}>
            <View style={[b.fb, { borderColor: msg.ok ? COLOR.cyan : COLOR.accent }]}>
              <Text style={[b.fbT, { color: msg.ok ? COLOR.cyan : COLOR.accent }]}>{msg.title}</Text>
              <Text style={b.body}>{msg.text}</Text>
              {msg.detail ? <Text style={b.formula}>{msg.detail}</Text> : null}
              {state === 'cleared' && <Text style={b.clear}>SHADOW DIKALAHKAN!</Text>}
              {state === 'dying' ? (
                <Btn label="LIHAT HASIL" icon="right" tone="cyan" onPress={() => setState('lost')} />
              ) : (
                <Btn label={state === 'cleared' ? (floor + 1 >= FLOORS.length ? 'LIHAT HASIL' : 'LANTAI BERIKUTNYA') : 'LANJUT'} icon="right" tone="cyan" onPress={next} />
              )}
            </View>
          </Rise>
        )}
      </Card>

      {/* status pemain: HP bar + SP (ANALYZE) */}
      <View style={{ alignItems: 'flex-start' }}>
        <StatusCard
          name={user || 'PLAYER'} avatar={ch.avatar} level={level} arcana={arcana}
          hp={{ v: pHp, m: PLAYER_HP }} sp={{ v: sp, m: SP_MAX }} width={290}
          band={ch.band} edge={ch.edge} legend={false} enter={false}
        />
        {dmg.side === 'player' && <View style={b.dmgBoxP}><DamagePop n={dmg.n} color={dmg.color} id={dmg.id} /></View>}
      </View>
      <Text style={b.note}>HP habis = kalah. Benar berturut-turut memicu ALL-OUT (damage lebih besar). Menang lantai memulihkan HP dan SP.</Text>
    </PageShell>
  );
}

const b = StyleSheet.create({
  arena: { borderWidth: 2, padding: 14, marginBottom: 20, backgroundColor: 'rgba(2,12,27,0.7)' },
  floorRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  floorTag: { paddingHorizontal: 10, paddingVertical: 2, transform: [{ skewX: '-12deg' }] },
  floorTagT: { color: '#fff', fontWeight: '900', letterSpacing: 2, fontSize: 11, transform: [{ skewX: '12deg' }] },
  combo: { color: '#FFD45C', fontWeight: '900', fontStyle: 'italic', letterSpacing: 2, fontSize: 13 },
  eName: { color: '#fff', fontSize: 16, fontWeight: '900', fontStyle: 'italic', letterSpacing: 1, marginBottom: 6 },
  shadowBox: { height: 170, alignItems: 'center', justifyContent: 'center' },
  shadowWrap: { width: 130, height: 150, alignItems: 'center', justifyContent: 'center' },
  aura: { position: 'absolute', width: 150, height: 150, borderRadius: 75, opacity: 0.18 },
  mask: { width: 104, height: 118, borderRadius: 52, borderWidth: 3, backgroundColor: '#050A1F', overflow: 'hidden' },
  eye: { position: 'absolute', top: 40, width: 24, height: 9, borderRadius: 2 },
  mouth: { position: 'absolute', bottom: 22, left: 30, width: 44, height: 5, opacity: 0.85 },
  drip: { position: 'absolute', bottom: 2, width: 14, height: 30, borderBottomLeftRadius: 7, borderBottomRightRadius: 7 },
  dmgBox: { position: 'absolute', top: 40, alignSelf: 'center' },
  dmgBoxP: { position: 'absolute', top: -6, right: 20 },
  dmg: { fontSize: 30, fontWeight: '900', fontStyle: 'italic', textShadowColor: '#000', textShadowOffset: { width: 2, height: 2 }, textShadowRadius: 3 },
  story: { color: COLOR.white, fontSize: 16, lineHeight: 24, fontWeight: '700' },
  prompt: { color: COLOR.cyan, fontSize: 12, fontWeight: '800', fontStyle: 'italic', marginTop: 14 },
  opts: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 10 },
  opt: { flexGrow: 1, flexBasis: 140, borderWidth: 2, borderColor: 'rgba(255,255,255,0.22)', backgroundColor: 'rgba(3,26,74,0.8)', padding: 13, marginRight: 8, marginBottom: 8 },
  optOk: { borderColor: '#3DFFA2', backgroundColor: 'rgba(61,255,162,0.14)' },
  optBad: { borderColor: '#FF4D4D', backgroundColor: 'rgba(255,77,77,0.14)' },
  optL: { color: COLOR.white, fontSize: 15, fontWeight: '900', fontStyle: 'italic' },
  optS: { color: COLOR.ice, fontSize: 11, marginTop: 3, fontWeight: '700' },
  analyzeBtn: { alignSelf: 'flex-start', borderWidth: 2, borderColor: COLOR.cyan, paddingHorizontal: 14, paddingVertical: 6, marginTop: 4, transform: [{ skewX: '-12deg' }] },
  analyzeBtnT: { color: COLOR.cyan, fontWeight: '900', letterSpacing: 1.5, fontSize: 12, transform: [{ skewX: '12deg' }] },
  analyze: { borderLeftWidth: 4, borderLeftColor: COLOR.cyan, backgroundColor: 'rgba(0,229,255,0.1)', padding: 10, marginTop: 4 },
  analyzeH: { color: COLOR.cyan, fontWeight: '900', letterSpacing: 3, fontSize: 10 },
  analyzeT: { color: COLOR.white, fontSize: 13, lineHeight: 20, fontWeight: '700', marginTop: 3 },
  fb: { borderWidth: 2, padding: 14, marginTop: 14, backgroundColor: 'rgba(2,12,27,0.65)' },
  fbT: { fontSize: 17, fontWeight: '900', fontStyle: 'italic', letterSpacing: 1.5, marginBottom: 4 },
  body: { color: COLOR.text, fontSize: 13, lineHeight: 21, marginTop: 6 },
  formula: { color: '#FFD400', fontSize: 14, fontWeight: '800', lineHeight: 22, marginTop: 8 },
  clear: { color: '#FFD45C', fontSize: 14, fontWeight: '900', letterSpacing: 2, marginTop: 8 },
  note: { color: COLOR.text, opacity: 0.55, fontSize: 11, lineHeight: 17, marginTop: 14 },
  bigScore: { fontSize: 58, fontWeight: '900', fontStyle: 'italic' },
  bigMax: { color: COLOR.ice, fontSize: 22 },
  rankT: { color: '#fff', fontSize: 15, fontWeight: '900', letterSpacing: 2, marginTop: 4, textAlign: 'center' },
});
