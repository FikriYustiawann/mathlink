import React, { useEffect, useRef } from 'react';
import { View, Animated, Easing, StyleSheet } from 'react-native';
import Text from './Txt';
import { COLOR } from '../theme';

const WEEK = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

function Moon() {
  return (
    <View style={styles.moon}>
      <View style={[styles.crater, { top: 7, left: 8, width: 7, height: 7 }]} />
      <View style={[styles.crater, { top: 17, left: 18, width: 5, height: 5 }]} />
      <View style={[styles.crater, { top: 20, left: 6, width: 4, height: 4 }]} />
    </View>
  );
}

// Tanggal besar + hari + bulan, di pojok kanan atas (gaya kalender Persona)
export default function Hud() {
  const d = new Date();
  const enter = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(enter, { toValue: 1, duration: 600, delay: 200, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, [enter]);

  return (
    <Animated.View
      style={[
        styles.wrap,
        { opacity: enter, transform: [{ translateX: enter.interpolate({ inputRange: [0, 1], outputRange: [60, 0] }) }] },
      ]}
    >
      <View style={styles.dateRow}>
        <Text style={styles.num}>{d.getMonth() + 1}</Text>
        <Text style={styles.slash}>/</Text>
        <Text style={styles.num}>{d.getDate()}</Text>
        <View style={{ marginLeft: 10 }}><Moon /></View>
      </View>
      <View style={styles.tag}>
        <Text style={styles.tagText}>{WEEK[d.getDay()]}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', top: 18, right: 18, alignItems: 'flex-end', zIndex: 5 },
  dateRow: { flexDirection: 'row', alignItems: 'center' },
  num: { color: COLOR.white, fontSize: 38, fontWeight: '900', fontStyle: 'italic', letterSpacing: 1 },
  slash: { color: COLOR.cyan, fontSize: 38, fontWeight: '900', fontStyle: 'italic', marginHorizontal: 2 },
  tag: { backgroundColor: COLOR.cyan, paddingHorizontal: 12, paddingVertical: 2, marginTop: 2, transform: [{ skewX: '-12deg' }] },
  tagText: { color: COLOR.navy, fontWeight: '900', letterSpacing: 3, fontSize: 13, transform: [{ skewX: '12deg' }] },
  moon: { width: 32, height: 32, borderRadius: 16, backgroundColor: COLOR.ice, borderWidth: 2, borderColor: COLOR.cyan },
  crater: { position: 'absolute', borderRadius: 4, backgroundColor: 'rgba(21,96,232,0.35)' },
});
