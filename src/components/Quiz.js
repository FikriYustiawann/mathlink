import React, { useEffect, useRef, useState } from 'react';
import { View, Image, Animated, Easing, StyleSheet } from 'react-native';
import Text from './Txt';
import { COLOR } from '../theme';
import useLoop from '../hooks/useLoop';
import { Rise, Pop, PressScale, useShake } from './Fx';
import { useChar } from '../CharacterContext';
import { CheckMark, CrossMark } from './Glyph';

export const PTS_COLOR = { 2: COLOR.cyan, 1: '#FFD23F', 0: '#FF4D8D' };

// Satu kotak progres tahap. Tahap aktif berkedip.
function Pip({ state, pts }) {
  const blink = useLoop(800, { yoyo: true, easing: Easing.inOut(Easing.sin) });
  const op = state === 'now' ? blink.interpolate({ inputRange: [0, 1], outputRange: [0.45, 1] }) : 1;
  const bg = state === 'done' ? PTS_COLOR[pts] : state === 'now' ? COLOR.white : 'rgba(255,255,255,0.14)';
  return <Animated.View style={[q.pip, { backgroundColor: bg, opacity: op }]} />;
}

// Bilah atas saat mengerjakan: tahap ke-n, kotak progres berwarna sesuai poin, streak & petunjuk terpakai
export function StageHud({ si, total, scores, streak, hintTotal }) {
  return (
    <View style={q.hud}>
      <View style={q.hudTag}><Text style={q.hudTagT}>TAHAP {si + 1}/{total}</Text></View>
      <View style={q.pips}>
        {Array.from({ length: total }, (_, i) => (
          <Pip key={i} state={i < scores.length ? 'done' : i === si ? 'now' : 'todo'} pts={scores[i]} />
        ))}
      </View>
      {streak >= 2 && (
        <Pop key={streak} style={q.streak}>
          <Text style={q.streakT}>COMBO ×{streak}</Text>
        </Pop>
      )}
      <View style={q.hudHint}><Text style={q.hudHintT}>PETUNJUK {hintTotal}</Text></View>
    </View>
  );
}

function Glow() {
  const p = useLoop(900, { yoyo: true, easing: Easing.inOut(Easing.sin) });
  return <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { borderWidth: 3, borderColor: COLOR.cyan, opacity: p.interpolate({ inputRange: [0, 1], outputRange: [0.2, 1] }) }]} />;
}

// Pilihan jawaban: masuk bertahap dari kanan, menyala saat disorot, bergetar saat salah
export function Opt({ letter, text, status = 'idle', onPress, delay = 0 }) {
  const [hov, setHov] = useState(false);
  const shake = useShake(status === 'wrong' ? 1 : 0);
  const right = status === 'right', wrong = status === 'wrong';
  const border = right ? COLOR.cyan : wrong ? COLOR.accent : hov && status === 'idle' ? COLOR.ice : '#3B4A7A';
  const bg = right ? 'rgba(0,229,255,0.16)' : wrong ? 'rgba(255,0,85,0.12)' : hov && status === 'idle' ? '#0A1840' : '#050A1F';
  const lbg = right ? COLOR.cyan : wrong ? COLOR.accent : hov && status === 'idle' ? COLOR.ice : '#1B2A5C';
  const lfg = right || wrong || (hov && status === 'idle') ? COLOR.navy : COLOR.ice;
  return (
    <Rise delay={delay} from={36} axis="x">
      <Animated.View style={{ opacity: status === 'dim' ? 0.4 : 1, transform: [{ translateX: shake }] }}>
        <PressScale onPress={onPress} disabled={status !== 'idle'} to={0.97} onHoverIn={() => setHov(true)} onHoverOut={() => setHov(false)} style={[q.opt, { borderColor: border, backgroundColor: bg }]}>
          <View style={[q.letter, { backgroundColor: lbg }]}>
            {right ? <CheckMark size={18} color={lfg} /> : wrong ? <CrossMark size={16} color={lfg} /> : <Text style={[q.letterT, { color: lfg }]}>{letter}</Text>}
          </View>
          <Text style={q.optT}>{text}</Text>
          {right && <Glow />}
        </PressScale>
      </Animated.View>
    </Rise>
  );
}

// Petunjuk muncul sebagai gelembung bicara dari Makoto
export function HintBubble({ n, text }) {
  const AVATAR_IMAGE = useChar().avatar;
  return (
    <Rise from={16} style={q.hintRow}>
      <Image source={AVATAR_IMAGE} style={q.hintAv} />
      <View style={q.bubble}>
        <Text style={q.bubbleLbl}>PETUNJUK {n}</Text>
        <Text style={q.bubbleT}>{text}</Text>
      </View>
    </Rise>
  );
}

// Cap besar miring ("BENAR!")
export function Stamp({ text, color = COLOR.cyan, fg = COLOR.navy, delay = 0 }) {
  return (
    <Pop big delay={delay} tilt={-4} spin={10} style={{ alignSelf: 'flex-start' }}>
      <View style={[q.stamp, { backgroundColor: color }]}><Text style={[q.stampT, { color: fg }]}>{text}</Text></View>
    </Pop>
  );
}

const q = StyleSheet.create({
  hud: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  hudTag: { backgroundColor: COLOR.white, borderLeftWidth: 6, borderLeftColor: '#FF1A1A', paddingHorizontal: 12, paddingVertical: 3, marginRight: 12, transform: [{ skewX: '-12deg' }] },
  hudTagT: { color: COLOR.navy, fontWeight: '900', fontStyle: 'italic', letterSpacing: 1, fontSize: 13, transform: [{ skewX: '12deg' }] },
  pips: { flex: 1, flexDirection: 'row' },
  pip: { flex: 1, height: 10, marginRight: 5, transform: [{ skewX: '-20deg' }] },
  streak: { backgroundColor: '#FF1A1A', paddingHorizontal: 10, paddingVertical: 2, marginLeft: 8 },
  streakT: { color: '#fff', fontWeight: '900', fontStyle: 'italic', fontSize: 12, letterSpacing: 1 },
  hudHint: { marginLeft: 10, borderWidth: 1.5, borderColor: COLOR.ice, paddingHorizontal: 8, paddingVertical: 1 },
  hudHintT: { color: COLOR.ice, fontWeight: '800', fontSize: 11, letterSpacing: 1 },
  opt: { flexDirection: 'row', alignItems: 'center', borderWidth: 2, borderLeftWidth: 7, padding: 10, marginTop: 10 },
  letter: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  letterT: { fontWeight: '900', fontStyle: 'italic', fontSize: 17, includeFontPadding: false },
  optT: { flex: 1, color: COLOR.text, fontSize: 16, fontWeight: '600', lineHeight: 23 },
  hintRow: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 12 },
  hintAv: { width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderColor: COLOR.cyan, marginRight: 10 },
  bubble: { flex: 1, borderWidth: 1.5, borderLeftWidth: 5, borderColor: 'rgba(191,239,255,0.5)', borderLeftColor: COLOR.cyan, backgroundColor: 'rgba(11,63,168,0.4)', padding: 10 },
  bubbleLbl: { color: COLOR.cyan, fontSize: 11, fontWeight: '800', letterSpacing: 1.5 },
  bubbleT: { color: COLOR.ice, fontSize: 15, lineHeight: 22, fontWeight: '500', marginTop: 3 },
  stamp: { paddingHorizontal: 18, paddingVertical: 4, transform: [{ skewX: '-12deg' }] },
  stampT: { fontSize: 24, fontWeight: '900', fontStyle: 'italic', letterSpacing: 2, transform: [{ skewX: '12deg' }] },
});
