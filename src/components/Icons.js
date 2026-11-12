import React from 'react';
import { View } from 'react-native';
import Text from './Txt';

// Trophy icon drawn with plain Views (no icon library needed).
export function TrophyIcon({ size = 20, color = '#FFD23F', style }) {
  const u = size / 20;
  return (
    <View style={[{ width: size, height: size, alignItems: 'center' }, style]}>
      <View style={{ position: 'absolute', top: 2 * u, left: 0, width: 6 * u, height: 8 * u, borderWidth: 2 * u, borderColor: color, borderRightWidth: 0, borderRadius: 4 * u }} />
      <View style={{ position: 'absolute', top: 2 * u, right: 0, width: 6 * u, height: 8 * u, borderWidth: 2 * u, borderColor: color, borderLeftWidth: 0, borderRadius: 4 * u }} />
      <View style={{ position: 'absolute', top: 0, width: 12 * u, height: 12 * u, backgroundColor: color, borderBottomLeftRadius: 6 * u, borderBottomRightRadius: 6 * u }} />
      <View style={{ position: 'absolute', top: 12 * u, width: 3 * u, height: 4 * u, backgroundColor: color }} />
      <View style={{ position: 'absolute', top: 16 * u, width: 10 * u, height: 3 * u, backgroundColor: color }} />
    </View>
  );
}

// Gender symbol in a ring. gender: 'cowok' (male) | 'cewek' (female)
export function GenderIcon({ gender, size = 28, color = '#fff', active = true, style }) {
  const sym = gender === 'cewek' ? '\u2640' : '\u2642';
  return (
    <View style={[{ width: size, height: size, borderRadius: size / 2, borderWidth: 2, borderColor: color, opacity: active ? 1 : 0.6, alignItems: 'center', justifyContent: 'center' }, style]}>
      <Text style={{ color, fontSize: size * 0.68, fontWeight: '900', lineHeight: size * 0.82, includeFontPadding: false }}>{sym}</Text>
    </View>
  );
}
