import React, { useEffect, useRef, useState } from 'react';
import { View, Animated, Pressable, Easing } from 'react-native';
import Text from './Txt';
import { COLOR } from '../theme';
import { sfx } from '../audio';

// Semua efek di sini hanya memakai transform & opacity (useNativeDriver: true).

// Muncul dari bawah (dipakai untuk daftar bertahap)
export function Rise({ delay = 0, from = 24, axis = 'y', style, children }) {
  const a = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(a, { toValue: 1, duration: 420, delay, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, [a, delay]);
  const t = a.interpolate({ inputRange: [0, 1], outputRange: [from, 0] });
  return (
    <Animated.View style={[style, { opacity: a, transform: [axis === 'x' ? { translateX: t } : { translateY: t }] }]}>
      {children}
    </Animated.View>
  );
}

// Muncul membesar dengan pantulan (cap / stempel). big = jatuh dari ukuran besar seperti dicap.
export function Pop({ delay = 0, big = false, tilt = 0, spin = 0, style, children }) {
  const a = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.spring(a, { toValue: 1, friction: big ? 5 : 6, tension: big ? 120 : 90, useNativeDriver: true }),
    ]).start();
  }, [a, delay, big]);
  const scale = a.interpolate({ inputRange: [0, 1], outputRange: [big ? 3 : 0.2, 1] });
  const opacity = a.interpolate({ inputRange: [0, 0.25, 1], outputRange: [0, 1, 1], extrapolate: 'clamp' });
  const rotate = a.interpolate({ inputRange: [0, 1], outputRange: [`${tilt - spin}deg`, `${tilt}deg`] });
  return <Animated.View style={[style, { opacity, transform: [{ scale }, { rotate }] }]}>{children}</Animated.View>;
}

// Tombol/kartu yang mengecil saat ditekan
export function PressScale({ onPress, disabled, to = 0.96, style, children, onHoverIn, onHoverOut }) {
  const s = useRef(new Animated.Value(1)).current;
  const go = (v) => Animated.spring(s, { toValue: v, friction: 5, tension: 220, useNativeDriver: true }).start();
  return (
    <Pressable onPress={(e) => { sfx('click'); onPress && onPress(e); }} disabled={disabled} onPressIn={() => go(to)} onPressOut={() => go(1)} onHoverIn={onHoverIn} onHoverOut={onHoverOut}>
      <Animated.View style={[style, { transform: [{ scale: s }] }]}>{children}</Animated.View>
    </Pressable>
  );
}

// Serpihan berlian memancar dari tengah (perayaan). Jalan sekali saat muncul.
export function Burst({ count = 14, radius = 90, colors = [COLOR.cyan, '#FFFFFF', '#FF4D8D', COLOR.ice], delay = 0, size = 9 }) {
  const parts = useRef(
    Array.from({ length: count }, (_, i) => ({
      v: new Animated.Value(0),
      ang: (i / count) * Math.PI * 2 + (i % 2) * 0.2,
      dist: radius * (0.65 + ((i * 37) % 10) / 20),
      color: colors[i % colors.length],
      sz: size * (0.7 + ((i * 13) % 7) / 10),
    }))
  ).current;
  useEffect(() => {
    Animated.parallel(
      parts.map((p) => Animated.sequence([Animated.delay(delay), Animated.timing(p.v, { toValue: 1, duration: 850, easing: Easing.out(Easing.cubic), useNativeDriver: true })]))
    ).start();
  }, [parts, delay]);
  return (
    <View pointerEvents="none" style={{ position: 'absolute', left: '50%', top: '50%', width: 0, height: 0 }}>
      {parts.map((p, i) => (
        <Animated.View
          key={i}
          style={{
            position: 'absolute', width: p.sz, height: p.sz, marginLeft: -p.sz / 2, marginTop: -p.sz / 2, backgroundColor: p.color,
            opacity: p.v.interpolate({ inputRange: [0, 0.1, 1], outputRange: [0, 1, 0] }),
            transform: [
              { translateX: p.v.interpolate({ inputRange: [0, 1], outputRange: [0, Math.cos(p.ang) * p.dist] }) },
              { translateY: p.v.interpolate({ inputRange: [0, 1], outputRange: [0, Math.sin(p.ang) * p.dist + 18] }) },
              { rotate: p.v.interpolate({ inputRange: [0, 1], outputRange: ['45deg', `${200 + i * 30}deg`] }) },
              { scale: p.v.interpolate({ inputRange: [0, 1], outputRange: [1, 0.3] }) },
            ],
          }}
        />
      ))}
    </View>
  );
}

// Angka yang menghitung naik
export function CountUp({ to, duration = 900, delay = 0, style, suffix = '' }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let id; let t0 = null; let started = false;
    const t = setTimeout(() => {
      started = true;
      id = setInterval(() => {
        t0 = t0 || Date.now();
        const k = Math.min(1, (Date.now() - t0) / duration);
        setN(Math.round(to * (1 - Math.pow(1 - k, 3))));
        if (k >= 1) clearInterval(id);
      }, 30);
    }, delay);
    return () => { clearTimeout(t); if (started) clearInterval(id); };
  }, [to, duration, delay]);
  return <Text style={style}>{n}{suffix}</Text>;
}

// Bar yang terisi dari `from` ke `to` (0..1) dengan transform saja
export function Meter({ from = 0, to = 1, color = COLOR.cyan, height = 10, delay = 0, track = 'rgba(255,255,255,0.14)', skew = true }) {
  const [w, setW] = useState(0);
  const a = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    a.setValue(0);
    Animated.timing(a, { toValue: 1, duration: 900, delay, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, [a, from, to, delay]);
  const x = a.interpolate({ inputRange: [0, 1], outputRange: [(from - 1) * w, (to - 1) * w] });
  return (
    <View onLayout={(e) => setW(e.nativeEvent.layout.width)} style={{ height, backgroundColor: track, overflow: 'hidden', transform: skew ? [{ skewX: '-20deg' }] : [] }}>
      {w > 0 && <Animated.View style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: w, backgroundColor: color, transform: [{ translateX: x }] }} />}
    </View>
  );
}

// Getar kiri-kanan setiap `trigger` berubah
export function useShake(trigger) {
  const v = useRef(new Animated.Value(0)).current;
  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    Animated.sequence([10, -10, 8, -6, 3, 0].map((x) => Animated.timing(v, { toValue: x, duration: 55, useNativeDriver: true }))).start();
  }, [trigger, v]);
  return v;
}
