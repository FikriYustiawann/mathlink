import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Pressable, Animated, Easing, StyleSheet } from 'react-native';
import Text from './Txt';
import { COLOR } from '../theme';

// Kontrol musik: volume turun / sakelar / volume naik + indikator level.
// Muncul sebentar, lalu hilang sendiri bila tidak disentuh (HIDE_AFTER_MS).
// Untuk memunculkan lagi: ketuk pojok kanan bawah layar (area kecil 44x44, tidak terlihat).
const HIDE_AFTER_MS = 3500;

export default function MusicButton({ playing, onToggle, volume = 50, onVolume }) {
  const level = Math.round(volume / 20);   // 0..5
  const a = useRef(new Animated.Value(0)).current;
  const timer = useRef(null);
  const [open, setOpen] = useState(true);   // terlihat sebentar saat aplikasi dibuka

  const hideSoon = useCallback(() => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      Animated.timing(a, { toValue: 0, duration: 260, easing: Easing.in(Easing.quad), useNativeDriver: true }).start(({ finished }) => {
        if (finished) setOpen(false);
      });
    }, HIDE_AFTER_MS);
  }, [a]);

  const show = useCallback(() => {
    setOpen(true);
    Animated.timing(a, { toValue: 1, duration: 200, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
    hideSoon();
  }, [a, hideSoon]);

  useEffect(() => { show(); return () => clearTimeout(timer.current); }, [show]);

  // setiap sentuhan tombol memperpanjang waktu tampil
  const act = (fn) => () => { fn(); show(); };

  const translateY = a.interpolate({ inputRange: [0, 1], outputRange: [14, 0] });
  const scale = a.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] });

  return (
    <>
      {/* area ketuk tak terlihat untuk memunculkan kontrol (hanya aktif saat kontrol tersembunyi) */}
      {!open && <Pressable onPress={show} style={s.hot} />}

      <Animated.View pointerEvents={open ? 'auto' : 'none'} style={[s.wrap, { opacity: a, transform: [{ translateY }, { scale }] }]}>
        <View style={s.skew}>
          <View style={s.inner}>
            <Pressable onPress={act(() => onVolume && onVolume(-10))} style={s.step} hitSlop={8}>
              <View style={s.minus}><View style={s.minusBar} /></View>
            </Pressable>

            <Pressable onPress={act(onToggle)} style={s.note} hitSlop={6}>
              <View style={s.musicGlyph}>{[0,1,2].map((i) => <View key={i} style={[s.wave, { height: 6 + i * 5, backgroundColor: playing ? COLOR.cyan : '#5A6B96' }]} />)}</View>
              {!playing && <View style={s.slash} />}
            </Pressable>

            <Pressable onPress={act(() => onVolume && onVolume(10))} style={s.step} hitSlop={8}>
              <View style={s.plus}><View style={s.plusH} /><View style={s.plusV} /></View>
            </Pressable>
          </View>
          <View style={s.levels}>
            {[1, 2, 3, 4, 5].map((i) => (
              <View key={i} style={[s.seg, { backgroundColor: playing && i <= level ? COLOR.cyan : 'rgba(255,255,255,0.2)', height: 3 + i }]} />
            ))}
          </View>
        </View>
      </Animated.View>
    </>
  );
}

const s = StyleSheet.create({
  hot: { position: 'absolute', right: 0, bottom: 0, width: 44, height: 44, zIndex: 49 },
  wrap: { position: 'absolute', right: 14, bottom: 18, zIndex: 50, backgroundColor: 'rgba(0,0,0,0.92)', borderWidth: 2, borderColor: COLOR.cyan, paddingHorizontal: 8, paddingVertical: 4, transform: [{ skewX: '-12deg' }] },
  skew: { alignItems: 'center', transform: [{ skewX: '12deg' }] },
  inner: { flexDirection: 'row', alignItems: 'center' },
  step: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center' },
  stepT: { color: '#fff', fontSize: 22, fontWeight: '900', lineHeight: 24 },
  minus: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
  minusBar: { width: 14, height: 3, backgroundColor: '#fff' },
  plus: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
  plusH: { position: 'absolute', width: 14, height: 3, backgroundColor: '#fff' },
  plusV: { position: 'absolute', width: 3, height: 14, backgroundColor: '#fff' },
  note: { width: 36, height: 30, alignItems: 'center', justifyContent: 'center' },
  musicGlyph: { height: 24, flexDirection: 'row', alignItems: 'center', gap: 3 },
  wave: { width: 3, borderRadius: 2 },
  slash: { position: 'absolute', width: 28, height: 2, backgroundColor: '#FF4D6D', transform: [{ rotate: '-45deg' }] },
  levels: { flexDirection: 'row', alignItems: 'flex-end', height: 9, marginTop: 1 },
  seg: { width: 6, marginHorizontal: 1.5 },
});
