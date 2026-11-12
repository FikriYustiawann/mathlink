import React, { useState } from 'react';
import { View, Image } from 'react-native';
import { COLOR } from '../theme';
import { useChar } from '../CharacterContext';

// Banner artwork karakter aktif dengan ukuran piksel eksplisit.
// kind: 'result' (layar hasil latihan) | 'profile' (kepala close-up di Profil). char = paksa karakter tertentu (mis. pratinjau di Login).
export default function Banner({ kind = 'result', char, style, children, ratio }) {
  const ctx = useChar();
  const c = char || ctx;
  const art = c[kind];
  const [w, setW] = useState(0);
  const h = w ? Math.round(w / (ratio || art.aspect)) : 0;
  const ih = w ? Math.round(w / art.aspect) : 0;
  return (
    <View
      onLayout={(e) => setW(Math.round(e.nativeEvent.layout.width))}
      style={[{ width: '100%', height: h, overflow: 'hidden', borderWidth: 2, borderColor: c.tint || COLOR.cyan, backgroundColor: '#0AA5E8' }, style]}
    >
      {w > 0 && <Image source={art.src} style={{ position: 'absolute', top: Math.round((h - ih) * 0.35), left: 0, width: w, height: ih, resizeMode: 'cover' }} />}
      {children}
    </View>
  );
}
