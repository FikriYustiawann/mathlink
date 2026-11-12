import { sfx } from '../audio';
import React, { useEffect, useRef } from 'react';
import { View, ScrollView, Pressable, Animated, Easing, StyleSheet, useWindowDimensions } from 'react-native';
import Text from './Txt';
import { COLOR } from '../theme';
import AnimatedBackground from './AnimatedBackground';
import { useFocus } from '../focus';
import { Tri, Dot } from './Glyph';
import { Rise } from './Fx';
import { Ghost, Kicker, alpha, RED, PINK } from './P3';

// Kerangka layar isi, gaya menu Persona 3 Reload:
//  - tombol KEMBALI = pita merah miring dengan tepi cyan
//  - judul = pita putih miring di atas bayangan merah, ada tulisan raksasa transparan di belakangnya
//  - crumb (opsional) = jejak menu kecil di atas judul, sub (opsional) = keterangan di bawah judul
export default function PageShell({ title, onBack, children, focusable = false, scrollKey, crumb, sub }) {
  const [focus, setFocus] = useFocus();
  const { width: W } = useWindowDimensions();
  const pad = W < 480 ? 14 : W < 900 ? 22 : 32;     // HP: tepi lebih tipis agar isi lebih lega
  const scroller = useRef(null);
  useEffect(() => {
    if (scrollKey !== undefined && scroller.current) scroller.current.scrollTo({ y: 0, animated: true });
  }, [scrollKey]);
  const calm = focusable && focus;
  const enter = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(enter, { toValue: 1, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, [enter]);

  return (
    <View style={styles.root}>
      <AnimatedBackground variant={calm ? 'calm' : 'page'} />
      {/* pita diagonal tipis di pojok kiri atas (hiasan) */}
      <View pointerEvents="none" style={styles.cornerA} />
      <View pointerEvents="none" style={styles.cornerB} />
      <ScrollView ref={scroller} contentContainerStyle={[styles.content, { paddingHorizontal: pad }]} showsVerticalScrollIndicator={false}>
        <View style={styles.topRow}>
          <Pressable onPress={() => { sfx('back'); onBack && onBack(); }} style={styles.backWrap} hitSlop={8}>
            <View style={styles.backShadow} />
            <View style={styles.backBg} />
            <View style={styles.rowC}>
              <Tri dir="left" size={10} color={COLOR.white} style={{ marginRight: 10 }} />
              <Text style={styles.backText}>KEMBALI</Text>
            </View>
          </Pressable>
          {focusable && (
            <Pressable onPress={() => { sfx('click'); setFocus(!focus); }} style={[styles.focusBtn, focus && { backgroundColor: COLOR.cyan }]}>
              <View style={styles.rowC}><Dot on={focus} size={9} color={focus ? COLOR.navy : COLOR.cyan} /><Text style={[styles.focusT, { marginLeft: 8 }, focus && { color: COLOR.navy }]}>{focus ? 'FOKUS: AKTIF' : 'FOKUS: MATI'}</Text></View>
            </Pressable>
          )}
        </View>

        <Animated.View
          style={{ opacity: enter, transform: [{ translateX: enter.interpolate({ inputRange: [0, 1], outputRange: [-60, 0] }) }] }}
        >
          {crumb ? <Kicker color={COLOR.cyan} style={{ marginBottom: 8 }}>{crumb}</Kicker> : null}
          <View style={styles.titleWrap}>
            <Ghost size={78} opacity={0.08} style={{ right: -4, top: -18 }}>{String(title).toUpperCase()}</Ghost>
            <View style={styles.titleShadow} />
            <View style={styles.titleBar} />
            <View style={styles.titleCut} />
            <Text style={styles.titleText} numberOfLines={2}>{title}</Text>
          </View>
          {sub ? (
            <View style={styles.subRow}>
              <View style={styles.subLine} />
              <Text style={styles.subText}>{sub}</Text>
            </View>
          ) : <View style={{ height: 20 }} />}
        </Animated.View>

        {children}
      </ScrollView>
    </View>
  );
}

// Kartu bergaya Persona: bingkai tipis + strip judul miring + sudut bertakik
export function Card({ no, title, accent = COLOR.cyan, children, delay = 0, style }) {
  return (
    <Rise delay={delay} from={14} style={[styles.card, { borderColor: alpha(accent, 0.55), borderLeftColor: accent }, style]}>
      <View style={styles.cardHead}>
        {no != null && (
          <View style={[styles.no, { backgroundColor: accent }]}>
            <Text style={styles.noText}>{no}</Text>
          </View>
        )}
        <Text style={[styles.cardTitle, { color: accent }]} numberOfLines={3}>{title}</Text>
      </View>
      <View style={styles.cardRule}>
        <View style={[styles.ruleA, { backgroundColor: accent }]} />
        <View style={[styles.ruleB, { backgroundColor: alpha(accent, 0.3) }]} />
      </View>
      {children}
      <View pointerEvents="none" style={[styles.notch, { borderBottomColor: accent }]} />
    </Rise>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLOR.bg },
  content: { paddingTop: 18, paddingBottom: 72, width: '100%', maxWidth: 1000, alignSelf: 'center' },
  cornerA: { position: 'absolute', top: -30, left: -40, width: 150, height: 90, backgroundColor: alpha(RED, 0.9), transform: [{ rotate: '-24deg' }] },
  cornerB: { position: 'absolute', top: -34, left: 54, width: 90, height: 90, backgroundColor: alpha(PINK, 0.6), transform: [{ rotate: '-24deg' }] },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', marginTop: 6, marginBottom: 24 },
  focusBtn: { paddingVertical: 6, paddingHorizontal: 12, borderWidth: 2, borderColor: COLOR.cyan, transform: [{ skewX: '-12deg' }] },
  rowC: { flexDirection: 'row', alignItems: 'center' },
  focusT: { color: COLOR.cyan, fontWeight: '900', letterSpacing: 1.5, fontSize: 11, includeFontPadding: false },
  backWrap: { alignSelf: 'flex-start', paddingVertical: 8, paddingHorizontal: 18, marginLeft: 4 },
  backShadow: { position: 'absolute', left: 5, right: -5, top: 5, bottom: -5, backgroundColor: COLOR.navy, borderWidth: 1.5, borderColor: COLOR.cyan, transform: [{ skewX: '-14deg' }] },
  backBg: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: RED, borderWidth: 1.5, borderColor: '#fff', transform: [{ skewX: '-14deg' }] },
  backText: { color: COLOR.white, fontWeight: '900', fontStyle: 'italic', letterSpacing: 2.5, fontSize: 14, includeFontPadding: false },
  titleWrap: { alignSelf: 'flex-start', maxWidth: '100%', paddingHorizontal: 20, paddingVertical: 6, marginLeft: 6 },
  titleShadow: { position: 'absolute', left: -8, right: 8, top: 7, bottom: -7, backgroundColor: RED, transform: [{ skewX: '-14deg' }] },
  titleBar: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: COLOR.white, transform: [{ skewX: '-14deg' }] },
  titleCut: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 9, backgroundColor: COLOR.cyan, transform: [{ skewX: '-14deg' }] },
  titleText: { color: COLOR.navy, fontSize: 28, fontWeight: '900', fontStyle: 'italic', letterSpacing: 2, textTransform: 'uppercase', includeFontPadding: false },
  subRow: { flexDirection: 'row', alignItems: 'center', marginTop: 16, marginBottom: 20, marginLeft: 6 },
  subLine: { width: 28, height: 3, backgroundColor: COLOR.cyan, marginRight: 10, transform: [{ skewX: '-30deg' }] },
  subText: { flex: 1, color: COLOR.ice, fontSize: 12, fontWeight: '800', letterSpacing: 1.2, lineHeight: 18 },
  card: { borderWidth: 1.5, borderLeftWidth: 5, paddingHorizontal: 16, paddingTop: 14, paddingBottom: 16, marginBottom: 20, backgroundColor: 'rgba(3,22,62,0.9)' },
  cardHead: { flexDirection: 'row', alignItems: 'center' },
  no: { minWidth: 30, height: 30, paddingHorizontal: 6, alignItems: 'center', justifyContent: 'center', marginRight: 12, transform: [{ skewX: '-12deg' }] },
  noText: { color: COLOR.navy, fontWeight: '900', fontStyle: 'italic', fontSize: 16, transform: [{ skewX: '12deg' }] },
  cardTitle: { flex: 1, fontSize: 16, fontWeight: '900', fontStyle: 'italic', letterSpacing: 1, textTransform: 'uppercase' },
  cardRule: { flexDirection: 'row', alignItems: 'center', marginTop: 9, marginBottom: 12 },
  ruleA: { width: 46, height: 3, transform: [{ skewX: '-30deg' }] },
  ruleB: { flex: 1, height: 1.5, marginLeft: 4 },
  notch: { position: 'absolute', right: 0, bottom: 0, width: 0, height: 0, borderLeftWidth: 16, borderBottomWidth: 16, borderLeftColor: 'transparent' },
});
