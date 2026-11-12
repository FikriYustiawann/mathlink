import React, { useEffect, useRef } from 'react';
import { View, Animated, Pressable, Easing, StyleSheet } from 'react-native';
import Text from './Txt';
import { COLOR } from '../theme';
import { TIER } from '../trophies';
import useLoop from '../hooks/useLoop';
import { Pop, Burst } from './Fx';
import { TrophyIcon } from './Icons';

// Lencana trophy: belah ketupat berwarna sesuai tingkat. Terkunci = abu-abu + "?".
export function TrophyBadge({ t, unlocked = true, size = 64, shine = true }) {
  const tier = TIER[t.tier];
  const pulse = useLoop(1800, { yoyo: true, easing: Easing.inOut(Easing.sin) });
  const d = size * 0.72;
  const glowOp = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.15, 0.6] });
  const glowSc = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1.2] });
  const col = unlocked ? tier.color : '#3B4A7A';
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {unlocked && shine && (
        <Animated.View style={{ position: 'absolute', width: d, height: d, backgroundColor: tier.glow, opacity: glowOp, transform: [{ rotate: '45deg' }, { scale: glowSc }] }} />
      )}
      <View style={{ width: d, height: d, borderWidth: 3, borderColor: col, backgroundColor: unlocked ? '#06143A' : '#050A1F', transform: [{ rotate: '45deg' }], alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ position: 'absolute', top: 3, left: 3, right: 3, bottom: 3, borderWidth: 1, borderColor: col, opacity: 0.5 }} />
        <View style={{ transform: [{ rotate: '-45deg' }], alignItems: 'center' }}>
          <TrophyIcon size={size * 0.46} color={col} />
          {!unlocked && <Text style={{ position: 'absolute', top: size * 0.07, color: '#050A1F', fontSize: size * 0.2, fontWeight: '900' }}>?</Text>}
        </View>
      </View>
    </View>
  );
}

// Kartu trophy baru (hasil latihan & popup)
export function TrophyCard({ t, delay = 0, label = 'TROPHY BARU' }) {
  const tier = TIER[t.tier];
  return (
    <Pop delay={delay} style={{ marginBottom: 12 }}>
      <View style={[s.card, { borderColor: tier.color }]}>
        <View style={[s.bar, { backgroundColor: tier.color }]} />
        <TrophyBadge t={t} size={64} />
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={[s.lbl, { color: tier.color }]}>{label}  ·  {tier.label}</Text>
          <Text style={s.name}>{t.name}</Text>
          <Text style={s.desc}>{t.desc}</Text>
        </View>
        <Burst count={12} radius={80} delay={delay + 120} colors={[tier.color, '#FFFFFF', COLOR.cyan]} />
      </View>
    </Pop>
  );
}

// Popup di atas layar saat trophy terbuka (dipakai di App). Hilang sendiri.
export function TrophyToast({ t, onDone, onOpen }) {
  const a = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.sequence([
      Animated.spring(a, { toValue: 1, friction: 7, tension: 80, useNativeDriver: true }),
      Animated.delay(3200),
      Animated.timing(a, { toValue: 0, duration: 300, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
    ]).start(({ finished }) => finished && onDone && onDone());
  }, [a]);
  const tier = TIER[t.tier];
  return (
    <Animated.View style={[s.toastWrap, { opacity: a, transform: [{ translateY: a.interpolate({ inputRange: [0, 1], outputRange: [-110, 0] }) }] }]}>
      <Pressable onPress={onOpen}>
        <View style={[s.toast, { borderColor: tier.color }]}>
          <View style={[s.bar, { backgroundColor: tier.color }]} />
          <TrophyBadge t={t} size={54} />
          <View style={{ flex: 1, marginLeft: 8 }}>
            <Text style={[s.lbl, { color: tier.color }]}>TROPHY DIBUKA  ·  {tier.label}</Text>
            <Text style={s.name} numberOfLines={1}>{t.name}</Text>
            <Text style={s.tap}>Ketuk untuk lihat di profil</Text>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', borderWidth: 2, backgroundColor: 'rgba(2,12,27,0.92)', paddingVertical: 10, paddingRight: 14, paddingLeft: 4 },
  bar: { width: 6, alignSelf: 'stretch', marginRight: 8, marginLeft: -4 },
  lbl: { fontSize: 10, fontWeight: '900', letterSpacing: 2 },
  name: { color: COLOR.white, fontSize: 18, fontWeight: '900', fontStyle: 'italic', marginTop: 2 },
  desc: { color: COLOR.text, fontSize: 12, lineHeight: 18, marginTop: 2, opacity: 0.85 },
  tap: { color: COLOR.ice, fontSize: 11, marginTop: 2, opacity: 0.7 },
  toastWrap: { position: 'absolute', top: 12, left: 12, right: 12, alignItems: 'center', zIndex: 50, elevation: 50 },
  toast: { width: '100%', maxWidth: 460, flexDirection: 'row', alignItems: 'center', borderWidth: 2, backgroundColor: 'rgba(2,12,27,0.96)', paddingVertical: 8, paddingRight: 14, paddingLeft: 4 },
});
