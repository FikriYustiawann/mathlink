import React from 'react';
import { Animated, View, useWindowDimensions } from 'react-native';
import { COLOR } from '../theme';

// Tirai transisi bergaya P3R: tiga pita miring menutup layar, layar diganti SAAT tertutup,
// lalu pita menyapu keluar. Mount layar baru yang berat jadi tak terlihat (tidak ada lag/kedip).
// p: 0 = di luar kiri, 1 = menutup penuh, 2 = di luar kanan. dir: +1 maju, -1 kembali.
const BANDS = [COLOR.royal, COLOR.cyan, COLOR.navy];

export default function Curtain({ p, dir }) {
  const { width: W, height: H } = useWindowDimensions();
  const bw = (W * 1.5) / BANDS.length;
  return (
    <View pointerEvents="none" style={{ position: 'absolute', left: 0, top: 0, width: W, height: H, overflow: 'hidden', zIndex: 40 }}>
      {BANDS.map((c, i) => {
        const lag = i * 0.12;
        const x = Animated.multiply(
          p.interpolate({ inputRange: [0, lag + 0.01, 1, 1 + lag, 2], outputRange: [-W * 1.6, -W * 1.6, 0, 0, W * 1.6], extrapolate: 'clamp' }),
          dir
        );
        return (
          <Animated.View key={i} style={{ position: 'absolute', top: -20, bottom: -20, left: i * bw - W * 0.25, width: bw + 40, backgroundColor: c, transform: [{ translateX: x }, { skewX: '-14deg' }] }} />
        );
      })}
    </View>
  );
}
