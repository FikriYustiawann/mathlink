import React, { useEffect, useRef, useState } from 'react';
import { View, Animated, Easing, Image, StyleSheet } from 'react-native';
import Text, { AnimText } from './Txt';
import { COLOR } from '../theme';
import { Burst } from './Fx';
import { Btn } from './Ui';
import { Card } from './PageShell';
import useLoop from '../hooks/useLoop';
import { useChar } from '../CharacterContext';
import { sfx } from '../audio';

// ============================================================
//  SISTEM BOS — dipakai Misi Relasi, Tebak Jenis, Isi Tabel, Pasangan Rasio.
//  Tiap game punya 3 bos (LV 1-3). Jawaban benar = bos terkena serangan (HP bos turun).
//  Jawaban salah = BOS MENYERANG: bos maju ke bar darah pemain, bar bergetar, berkedip merah, angka damage muncul.
//  Bos LV berikutnya terbuka setelah bos sebelumnya kalah (disimpan di progress.boss).
// ============================================================
export const STAGES = [
  { lv: 1, frac: 0.55, lives: 5 },   // frac = porsi soal yang harus benar, lives = salah yang masih boleh
  { lv: 2, frac: 0.7, lives: 4 },
  { lv: 3, frac: 0.85, lives: 3 },
];

const LOOK = {
  relasi: { color: '#00E5FF', eyes: '#FF3B5C', names: ['SI PANAH TERTUKAR', 'RATU ARAH BALIK', 'RAJA NAIK-TURUN'] },
  jenis:  { color: '#FFD400', eyes: '#8A5CFF', names: ['HANTU CERITA', 'BAYANG SOAL KATA', 'DEWA CERITA GELAP'] },
  tabel:  { color: '#FF4D8D', eyes: '#00E5FF', names: ['MONSTER KOSONG', 'PENJAGA BARIS', 'RAKSASA KOLOM'] },
  pasang: { color: '#B79CFF', eyes: '#FFD400', names: ['KARTU HANTU', 'RATU MEMORI', 'PENGUASA PASANGAN'] },
};

// total = jumlah "jawaban benar" yang tersedia di game ini (soal / baris tabel / pasangan)
export function makeBoss(key, stage, total) {
  const s = Math.max(0, Math.min(2, stage || 0));
  const L = LOOK[key], S = STAGES[s];
  const need = Math.max(1, Math.round(total * S.frac));
  return { key, stage: s, lv: s + 1, name: L.names[s], color: L.color, eyes: L.eyes, need, lives: S.lives, dmg: Math.ceil(100 / need), atk: Math.ceil(100 / S.lives) };
}
export const nextStage = (progress, key) => Math.min(2, ((progress.boss || {})[key] || {}).cleared || 0);

export function useBoss(initial) {
  const [B, setB] = useState(initial);
  const [bossHp, setBossHp] = useState(100);
  const [pHp, setPHp] = useState(100);
  const [ev, setEv] = useState({ type: null, id: 0, n: 0 });
  const idRef = useRef(0);
  const hit = (mult = 1) => {
    const n = Math.round(B.dmg * mult);
    setBossHp((h) => Math.max(0, h - n));
    setEv({ type: 'hit', id: ++idRef.current, n });
  };
  const miss = () => {
    setPHp((h) => Math.max(0, h - B.atk));
    setEv({ type: 'miss', id: ++idRef.current, n: B.atk });
  };
  const reset = (nb) => { if (nb) setB(nb); setBossHp(100); setPHp(100); setEv({ type: null, id: 0, n: 0 }); };
  return { B, bossHp, pHp, ev, hit, miss, reset, won: bossHp <= 0, dead: pHp <= 0 && bossHp > 0, over: bossHp <= 0 || pHp <= 0 };
}

function HpBar({ frac, color, h = 12, flip }) {
  const [w, setW] = useState(0);
  const a = useRef(new Animated.Value(frac)).current;
  useEffect(() => { Animated.timing(a, { toValue: frac, duration: 450, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start(); }, [frac, a]);
  const warn = frac < 0.3 ? '#FF3B5C' : color;
  return (
    <View onLayout={(e) => setW(e.nativeEvent.layout.width)} style={[s.track, { height: h }]}>
      {w > 0 && <Animated.View style={{ width: w, height: '100%', backgroundColor: warn, transform: [{ translateX: a.interpolate({ inputRange: [0, 1], outputRange: [-w, 0] }) }] }} />}
    </View>
  );
}

function Pop({ n, color, id, big }) {
  const a = useRef(new Animated.Value(0)).current;
  useEffect(() => { if (!id) return; a.setValue(0); Animated.timing(a, { toValue: 1, duration: 900, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start(); }, [id, a]);
  if (!id) return null;
  return (
    <AnimText pointerEvents="none" style={[s.pop, big && { fontSize: 30 }, { color, opacity: a.interpolate({ inputRange: [0, 0.1, 0.75, 1], outputRange: [0, 1, 1, 0] }), transform: [{ translateY: a.interpolate({ inputRange: [0, 1], outputRange: [8, -38] }) }, { scale: a.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0.5, 1.3, 1] }) }] }]}>
      -{n}
    </AnimText>
  );
}

// Sosok bos dari View: topeng, mata menyala, tanduk (LV2+), mahkota (LV3)
function Sprite({ B }) {
  const horns = B.stage >= 1;
  return (
    <View style={s.sprite}>
      <View style={[s.aura, { backgroundColor: B.color }]} />
      {horns && <View style={[s.horn, { left: 8, borderBottomColor: B.color, transform: [{ rotate: '-18deg' }] }]} />}
      {horns && <View style={[s.horn, { right: 8, borderBottomColor: B.color, transform: [{ rotate: '18deg' }] }]} />}
      {B.stage >= 2 && <View style={[s.crown, { borderColor: '#FFD400' }]} />}
      <View style={[s.mask, { borderColor: B.color }]}>
        <View style={[s.eye, { backgroundColor: B.eyes, left: 14, transform: [{ rotate: '18deg' }] }]} />
        <View style={[s.eye, { backgroundColor: B.eyes, right: 14, transform: [{ rotate: '-18deg' }] }]} />
        <View style={[s.mouth, { backgroundColor: B.eyes }]} />
      </View>
    </View>
  );
}

export function BossArena({ bs }) {
  const ch = useChar();
  const { B, ev } = bs;
  const bob = useLoop(1500, { yoyo: true, easing: Easing.inOut(Easing.sin) });
  const lunge = useRef(new Animated.Value(0)).current;      // 0 diam -> 1 menerkam ke bar pemain
  const shake = useRef(new Animated.Value(0)).current;      // boss terkena
  const pShake = useRef(new Animated.Value(0)).current;     // bar pemain terkena
  const flash = useRef(new Animated.Value(0)).current;      // kilat merah di bar pemain
  const slash = useRef(new Animated.Value(0)).current;      // garis tebasan

  useEffect(() => {
    if (!ev.id) return;
    if (ev.type === 'hit') {
      Animated.sequence([14, -14, 10, -8, 4, 0].map((x) => Animated.timing(shake, { toValue: x, duration: 45, useNativeDriver: true }))).start();
    } else {
      sfx('swipe', 0.6);
      slash.setValue(0); flash.setValue(0);
      Animated.sequence([
        Animated.timing(lunge, { toValue: 1, duration: 200, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
        Animated.parallel([
          Animated.timing(flash, { toValue: 1, duration: 60, useNativeDriver: true }),
          Animated.timing(slash, { toValue: 1, duration: 220, useNativeDriver: true }),
          Animated.sequence([12, -12, 9, -7, 3, 0].map((x) => Animated.timing(pShake, { toValue: x, duration: 50, useNativeDriver: true }))),
        ]),
        Animated.parallel([
          Animated.timing(flash, { toValue: 0, duration: 380, useNativeDriver: true }),
          Animated.timing(lunge, { toValue: 0, duration: 380, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        ]),
      ]).start();
    }
  }, [ev.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const y = bob.interpolate({ inputRange: [0, 1], outputRange: [-5, 5] });
  const dead = bs.won;
  return (
    <View style={s.arena}>
      <View style={s.bossRow}>
        <Text style={[s.bossName, { color: B.color }]} numberOfLines={1}>{B.name}</Text>
        <View style={[s.lvTag, { backgroundColor: B.color }]}><Text style={s.lvT}>BOSS LV {B.lv}</Text></View>
      </View>
      <HpBar frac={bs.bossHp / 100} color={B.color} h={12} />
      <View style={s.stage}>
        <Animated.View style={{ opacity: dead ? 0.15 : 1, transform: [{ translateX: shake }, { translateY: y }, { translateY: lunge.interpolate({ inputRange: [0, 1], outputRange: [0, 62] }) }, { scale: lunge.interpolate({ inputRange: [0, 1], outputRange: [1, 1.45] }) }] }}>
          <Sprite B={B} />
        </Animated.View>
        <View style={s.popBoss}><Pop n={ev.type === 'hit' ? ev.n : 0} id={ev.type === 'hit' ? ev.id : 0} color="#FFD400" big /></View>
      </View>
      {/* bar darah pemain: tempat bos menyerang */}
      <Animated.View style={[s.player, { transform: [{ translateX: pShake }] }]}>
        <Animated.View pointerEvents="none" style={[s.redFlash, { opacity: flash }]} />
        <Animated.View pointerEvents="none" style={[s.slash, { opacity: slash.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0, 1, 0] }), transform: [{ translateX: slash.interpolate({ inputRange: [0, 1], outputRange: [-120, 160] }) }, { rotate: '-20deg' }] }]} />
        {ch && ch.avatar ? <Image source={ch.avatar} style={s.avatar} /> : <View style={[s.avatar, { backgroundColor: COLOR.royal }]} />}
        <View style={{ flex: 1, marginLeft: 10 }}>
          <View style={s.pRow}>
            <Text style={s.pName}>KAMU</Text>
            <Text style={[s.pHp, bs.pHp < 30 && { color: '#FF3B5C' }]}>HP {bs.pHp}/100</Text>
          </View>
          <HpBar frac={bs.pHp / 100} color="#3DFFA2" h={10} />
        </View>
        <View style={s.popPlayer}><Pop n={ev.type === 'miss' ? ev.n : 0} id={ev.type === 'miss' ? ev.id : 0} color="#FF3B5C" /></View>
      </Animated.View>
    </View>
  );
}

// Layar hasil bos (menang / kalah) + tombol lanjut ke bos berikutnya
export function BossResult({ bs, onRetry, onNext, onExit, children }) {
  const { B, won } = bs;
  const col = won ? '#FFD400' : '#FF3B5C';
  return (
    <Card title={won ? 'BOSS KALAH!' : 'KAMU KALAH'} accent={col}>
      {won && <Burst count={18} radius={110} />}
      <Text style={[s.rName, { color: B.color }]}>{B.name}</Text>
      <Text style={s.rSub}>BOSS LV {B.lv} / 3  ·  HP KAMU {bs.pHp}/100</Text>
      {children}
      <Text style={s.rBody}>
        {won ? (B.stage < 2 ? 'Bos berikutnya lebih kuat: HP-mu lebih cepat habis kalau salah. Siap?' : 'Semua bos game ini sudah kamu kalahkan. Keren!') : 'Tidak apa-apa. Baca pembahasan tiap soal, lalu coba lagi. Soal diacak jadi aman diulang.'}
      </Text>
      {won && B.stage < 2 && <Btn label={`LAWAN BOSS LV ${B.lv + 1}`} icon="right" tone="cyan" onPress={onNext} />}
      <Btn label={won ? 'ULANGI BOSS INI' : 'COBA LAGI'} onPress={onRetry} style={{ marginTop: 8 }} />
      <Btn label="KEMBALI KE PETA" onPress={onExit} style={{ marginTop: 8 }} />
    </Card>
  );
}

const s = StyleSheet.create({
  arena: { borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.2)', backgroundColor: 'rgba(3,26,74,0.82)', padding: 12, marginBottom: 14, overflow: 'hidden' },
  bossRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  bossName: { fontSize: 14, fontWeight: '900', fontStyle: 'italic', letterSpacing: 1, flex: 1 },
  lvTag: { paddingHorizontal: 8, paddingVertical: 2, marginLeft: 8, transform: [{ skewX: '-12deg' }] },
  lvT: { color: COLOR.navy, fontSize: 10, fontWeight: '900', letterSpacing: 1.5, transform: [{ skewX: '12deg' }] },
  track: { backgroundColor: 'rgba(255,255,255,0.14)', overflow: 'hidden', transform: [{ skewX: '-20deg' }] },
  stage: { height: 118, alignItems: 'center', justifyContent: 'center', marginTop: 6, marginBottom: 6 },
  popBoss: { position: 'absolute', top: 6, right: '22%' },
  popPlayer: { position: 'absolute', right: 14, top: -8 },
  sprite: { width: 84, height: 84, alignItems: 'center', justifyContent: 'center' },
  aura: { position: 'absolute', width: 84, height: 84, borderRadius: 42, opacity: 0.22 },
  mask: { width: 62, height: 66, borderWidth: 3, borderRadius: 30, backgroundColor: '#050A1F' },
  eye: { position: 'absolute', top: 24, width: 14, height: 6 },
  mouth: { position: 'absolute', bottom: 12, left: 17, width: 24, height: 4 },
  horn: { position: 'absolute', top: -4, width: 0, height: 0, borderLeftWidth: 7, borderRightWidth: 7, borderBottomWidth: 24, borderLeftColor: 'transparent', borderRightColor: 'transparent' },
  crown: { position: 'absolute', top: 0, width: 36, height: 8, borderWidth: 2, backgroundColor: 'rgba(255,212,0,0.35)' },
  player: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.25)', backgroundColor: 'rgba(2,12,27,0.75)', padding: 8, overflow: 'visible' },
  redFlash: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: 'rgba(255,59,92,0.55)' },
  slash: { position: 'absolute', top: -10, width: 8, height: 90, backgroundColor: '#fff' },
  avatar: { width: 38, height: 38, borderRadius: 19 },
  pRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  pName: { color: COLOR.ice, fontSize: 11, fontWeight: '900', letterSpacing: 2 },
  pHp: { color: '#3DFFA2', fontSize: 11, fontWeight: '900' },
  pop: { fontSize: 20, fontWeight: '900', fontStyle: 'italic' },
  rName: { fontSize: 20, fontWeight: '900', fontStyle: 'italic', marginTop: 4 },
  rSub: { color: COLOR.ice, fontSize: 11, fontWeight: '800', letterSpacing: 1.5, marginTop: 4, marginBottom: 10 },
  rBody: { color: COLOR.text, fontSize: 13, lineHeight: 20, marginVertical: 10 },
});
