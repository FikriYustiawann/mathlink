import React, { useEffect, useRef, useState } from 'react';
import { View, Image, Pressable, Animated, Easing, StyleSheet } from 'react-native';
import Text from './Txt';
import { COLOR } from '../theme';
import useLoop from '../hooks/useLoop';

// ============================================================
//  Gauge  : bar HP/SP ala Persona 3 Reload
//    - bar miring bersegmen, angka besar di kanan
//    - saat nilai TURUN, ada "jejak putih" yang menyusul pelan (efek damage)
//    - saat nilai <= 30%, bar berkedip merah
//  Hanya transform & opacity (useNativeDriver).
// ============================================================
export const HP_COLOR = '#FF3B5C';
export const SP_COLOR = '#00E5FF';

export function Gauge({ label = 'HP', value, max, color = HP_COLOR, height = 10, numSize = 14, labelSize = 12, labelW = 26, numW = 52, style }) {
  const frac = max > 0 ? Math.max(0, Math.min(1, value / max)) : 0;
  const [w, setW] = useState(0);
  const fill = useRef(new Animated.Value(0)).current;
  const ghost = useRef(new Animated.Value(0)).current;
  const prev = useRef(0);
  const pulse = useLoop(650, { yoyo: true, easing: Easing.inOut(Easing.sin) });

  useEffect(() => {
    const up = frac >= prev.current;
    prev.current = frac;
    Animated.timing(fill, { toValue: frac, duration: 450, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
    Animated.timing(ghost, { toValue: frac, duration: up ? 450 : 750, delay: up ? 0 : 420, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, [frac, fill, ghost]);

  const low = frac > 0 && frac <= 0.3 && label === 'HP';
  const tx = (a) => a.interpolate({ inputRange: [0, 1], outputRange: [-w, 0] });

  return (
    <View style={[g.row, style]}>
      <View style={[g.labelBox, { backgroundColor: color, minWidth: labelW + 4 }]}>
        <Text style={[g.label, { color: COLOR.navy, fontSize: labelSize }]}>{label}</Text>
      </View>
      <View style={g.barBox}>
        <View onLayout={(e) => setW(e.nativeEvent.layout.width)} style={[g.track, { height }]}>
          {w > 0 && (
            <>
              <Animated.View style={[g.abs, { backgroundColor: '#FFFFFF', opacity: 0.9, transform: [{ translateX: tx(ghost) }] }]} />
              <Animated.View style={[g.abs, { backgroundColor: color, transform: [{ translateX: tx(fill) }] }]}>
                {/* kilau di bagian atas bar */}
                <View style={{ position: 'absolute', left: 0, right: 0, top: 0, height: Math.max(2, height * 0.32), backgroundColor: 'rgba(255,255,255,0.35)' }} />
                {low && <Animated.View style={[g.abs, { width: '100%', backgroundColor: '#FFFFFF', opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0, 0.55] }) }]} />}
              </Animated.View>
              {/* garis segmen tiap 10% */}
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                <View key={i} style={{ position: 'absolute', top: 0, bottom: 0, left: (w * i) / 10, width: 1.5, backgroundColor: 'rgba(2,12,27,0.55)' }} />
              ))}
            </>
          )}
        </View>
      </View>
      <Text style={[g.num, { fontSize: numSize, minWidth: numW }]}>
        {Math.round(value)}<Text style={g.numMax}>/{Math.round(max)}</Text>
      </Text>
    </View>
  );
}

const g = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  labelBox: { paddingHorizontal: 3, paddingVertical: 0, alignItems: 'center', justifyContent: 'center', transform: [{ skewX: '-14deg' }] },
  label: { fontWeight: '900', fontStyle: 'italic', letterSpacing: 0.5, includeFontPadding: false, transform: [{ skewX: '14deg' }] },
  barBox: { flex: 1, marginHorizontal: 6, paddingHorizontal: 4 },
  track: { backgroundColor: 'rgba(0,0,0,0.55)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.35)', overflow: 'hidden', transform: [{ skewX: '-20deg' }] },
  abs: { position: 'absolute', left: 0, top: 0, bottom: 0, width: '100%' },
  num: { color: '#fff', fontWeight: '900', fontStyle: 'italic', minWidth: 52, textAlign: 'right', includeFontPadding: false },
  numMax: { color: COLOR.ice, fontSize: 9, fontWeight: '800', opacity: 0.8 },
});

// ============================================================
//  StatusCard : kartu profil pojok kiri (lobby) dan status pemain (battle)
//    HP = XP menuju level berikutnya, SP = misi LATIHAN yang sudah selesai.
// ============================================================
export default function StatusCard({
  name, avatar, level, arcana, hp, sp, onPress, width = 300, band = '#FF1A1A', edge = '#FF8AB5',
  legend = true, enter = true, hpLabel = 'HP', spLabel = 'SP', compact = false,
}) {
  const A = compact ? 50 : 62;
  const a = useRef(new Animated.Value(enter ? 0 : 1)).current;
  useEffect(() => {
    if (enter) Animated.timing(a, { toValue: 1, duration: 520, delay: 120, easing: Easing.out(Easing.back(1.2)), useNativeDriver: true }).start();
  }, [a, enter]);

  const body = (
    <Animated.View style={{ width, opacity: a, transform: [{ translateX: a.interpolate({ inputRange: [0, 1], outputRange: [-70, 0] }) }] }}>
      {/* bayangan merah + pelat gelap miring di belakang (isi tidak ikut miring supaya teks tetap tajam) */}
      <View pointerEvents="none" style={[c.shadow, { backgroundColor: band }]} />
      <View pointerEvents="none" style={[c.plate, { borderBottomColor: COLOR.cyan }]}>
        <View style={[c.plateEdge, { backgroundColor: edge }]} />
        <View style={c.plateSheen} />
      </View>

      <View style={[c.row, compact && c.rowC]}>
        {/* potret miring dengan bayangan merah, badge LV di sudut */}
        <View style={{ width: A + 12, height: A + 8, justifyContent: 'center' }}>
          <View style={[c.avShadow, { width: A, height: A, backgroundColor: band }]} />
          <View style={[c.avFrame, { width: A, height: A }]}>
            {avatar ? (
              <Image source={avatar} style={{ width: A * 1.45, height: A * 1.45, marginLeft: -A * 0.22, marginTop: -A * 0.06, transform: [{ skewX: '14deg' }], resizeMode: 'cover' }} />
            ) : null}
          </View>
          <View style={[c.lv, { backgroundColor: band }]}>
            <Text style={c.lvT}>LV<Text style={c.lvN}> {level}</Text></Text>
          </View>
        </View>

        {/* nama + arcana + bar */}
        <View style={[c.info, compact && { marginLeft: 6 }]}>
          <Text numberOfLines={1} style={[c.name, compact && { fontSize: 16 }]}>{String(name || '').toUpperCase()}</Text>
          {arcana ? (
            <View style={c.arcRow}>
              <View style={c.arcBar} />
              <Text numberOfLines={1} style={c.arcana}>{String(arcana).toUpperCase()}</Text>
            </View>
          ) : null}
          {compact ? (
            <>
              <Gauge label={hpLabel} value={hp.v} max={hp.m} color={HP_COLOR} height={7} numSize={10} labelSize={9} labelW={16} numW={34} />
              <Gauge label={spLabel} value={sp.v} max={sp.m} color={SP_COLOR} height={6} numSize={10} labelSize={9} labelW={16} numW={34} style={{ marginTop: 2 }} />
            </>
          ) : (
            <>
              <Gauge label={hpLabel} value={hp.v} max={hp.m} color={HP_COLOR} height={10} />
              <Gauge label={spLabel} value={sp.v} max={sp.m} color={SP_COLOR} height={8} numSize={12} labelSize={11} style={{ marginTop: 4 }} />
            </>
          )}
        </View>
      </View>
      {legend && !compact ? <Text numberOfLines={1} style={c.legend}>HP = XP LEVEL   ·   SP = MISI SELESAI</Text> : null}
    </Animated.View>
  );

  if (!onPress) return body;
  return <Pressable onPress={onPress}>{body}</Pressable>;
}

const c = StyleSheet.create({
  shadow: { position: 'absolute', top: 5, bottom: -5, left: 6, right: -6, opacity: 0.95, transform: [{ skewX: '-12deg' }] },
  plate: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(2,12,27,0.93)', borderWidth: 1.5, borderColor: '#FFFFFF', borderBottomWidth: 3, transform: [{ skewX: '-12deg' }], overflow: 'hidden' },
  plateEdge: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 5 },
  plateSheen: { position: 'absolute', left: 0, right: 0, top: 0, height: '40%', backgroundColor: 'rgba(255,255,255,0.06)' },
  row: { flexDirection: 'row', alignItems: 'center', paddingLeft: 16, paddingRight: 18, paddingTop: 10, paddingBottom: 10 },
  rowC: { paddingLeft: 14, paddingRight: 16, paddingTop: 8, paddingBottom: 9 },
  avShadow: { position: 'absolute', left: 5, top: 9, transform: [{ skewX: '-12deg' }] },
  avFrame: { borderWidth: 2, borderColor: '#fff', backgroundColor: COLOR.navy, overflow: 'hidden', transform: [{ skewX: '-12deg' }] },
  lv: { position: 'absolute', left: -6, bottom: -1, paddingHorizontal: 6, paddingVertical: 0, borderWidth: 1.5, borderColor: '#fff', transform: [{ skewX: '-12deg' }] },
  lvT: { color: '#fff', fontSize: 9, fontWeight: '900', letterSpacing: 1, includeFontPadding: false },
  lvN: { fontSize: 15, fontStyle: 'italic' },
  info: { flex: 1, marginLeft: 8 },
  name: { color: '#fff', fontSize: 19, fontWeight: '900', fontStyle: 'italic', letterSpacing: 0.5, includeFontPadding: false },
  arcRow: { flexDirection: 'row', alignItems: 'center', marginTop: 1, marginBottom: 4 },
  arcBar: { width: 3, height: 9, backgroundColor: COLOR.cyan, marginRight: 6, transform: [{ skewX: '-20deg' }] },
  arcana: { color: COLOR.cyan, fontSize: 9, fontWeight: '900', letterSpacing: 2.2, flexShrink: 1, includeFontPadding: false },
  legend: { color: COLOR.ice, opacity: 0.6, fontSize: 7, fontWeight: '800', letterSpacing: 1.5, paddingLeft: 92, paddingRight: 12, paddingBottom: 4, marginTop: -3 },
});
