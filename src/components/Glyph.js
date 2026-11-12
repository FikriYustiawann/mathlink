import React from 'react';
import { View } from 'react-native';

// Ikon sederhana dari View (bukan karakter font), supaya tampil SAMA di semua HP.
// Karakter seperti ▶ ✓ ↑ sering jatuh ke font cadangan / berubah jadi emoji di Android.

// Segitiga: dir = right | left | up | down
export function Tri({ dir = 'right', size = 10, color = '#fff', style }) {
  const h = size / 2, l = size * 0.85, t = 'transparent';
  const m = {
    right: { borderTopWidth: h, borderBottomWidth: h, borderLeftWidth: l, borderTopColor: t, borderBottomColor: t, borderLeftColor: color },
    left: { borderTopWidth: h, borderBottomWidth: h, borderRightWidth: l, borderTopColor: t, borderBottomColor: t, borderRightColor: color },
    up: { borderLeftWidth: h, borderRightWidth: h, borderBottomWidth: l, borderLeftColor: t, borderRightColor: t, borderBottomColor: color },
    down: { borderLeftWidth: h, borderRightWidth: h, borderTopWidth: l, borderLeftColor: t, borderRightColor: t, borderTopColor: color },
  };
  return <View style={[{ width: 0, height: 0, backgroundColor: 'transparent' }, m[dir], style]} />;
}

export function CheckMark({ size = 18, color = '#fff' }) {
  const w = Math.max(2, size * 0.16);
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ width: size * 0.36, height: size * 0.66, borderRightWidth: w, borderBottomWidth: w, borderColor: color, transform: [{ rotate: '45deg' }], marginTop: -size * 0.1 }} />
    </View>
  );
}

export function CrossMark({ size = 18, color = '#fff' }) {
  const w = Math.max(2, size * 0.16);
  const bar = { position: 'absolute', width: size * 0.9, height: w, backgroundColor: color };
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View style={[bar, { transform: [{ rotate: '45deg' }] }]} />
      <View style={[bar, { transform: [{ rotate: '-45deg' }] }]} />
    </View>
  );
}

// Panah vertikal (naik / turun)
export function ArrowV({ dir = 'up', size = 30, color = '#fff' }) {
  const w = Math.max(3, size * 0.12);
  const hs = size * 0.5;
  return (
    <View style={{ width: size, height: size, transform: [{ rotate: dir === 'down' ? '180deg' : '0deg' }] }}>
      <View style={{ position: 'absolute', left: (size - w) / 2, top: hs * 0.5, width: w, height: size - hs * 0.5, backgroundColor: color }} />
      <View style={{ position: 'absolute', left: (size - hs) / 2, top: hs * 0.21, width: hs, height: hs, borderLeftWidth: w, borderTopWidth: w, borderColor: color, transform: [{ rotate: '45deg' }] }} />
    </View>
  );
}

// Kotak centang (untuk sakelar) dan titik (untuk status)
export function Box({ on, size = 13, color = '#fff' }) {
  return (
    <View style={{ width: size, height: size, borderWidth: 2, borderColor: color, alignItems: 'center', justifyContent: 'center' }}>
      {on && <View style={{ width: size - 7, height: size - 7, backgroundColor: color }} />}
    </View>
  );
}
export function Dot({ on, size = 10, color = '#fff' }) {
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, borderWidth: 2, borderColor: color, backgroundColor: on ? color : 'transparent' }} />
  );
}
