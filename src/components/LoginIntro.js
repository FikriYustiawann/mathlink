import React, { useEffect, useRef } from 'react';
import { View, Animated, Easing, useWindowDimensions } from 'react-native';
import Text from './Txt';
import { COLOR } from '../theme';

// Persona 3 Reload style entrance: slanted slabs slam in, the name flashes with a
// Dark Hour ring, then the slabs sweep away to reveal the lobby. Transform/opacity only.
// onCovered fires when the screen is fully covered (swap the screen underneath then).
const SLABS = [COLOR.navy, COLOR.cyan, COLOR.white, COLOR.royal, COLOR.navy, COLOR.blue];

export default function LoginIntro({ name, tint = COLOR.cyan, onCovered, onDone }) {
  const { width: W, height: H } = useWindowDimensions();
  const t = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const cover = setTimeout(() => onCovered && onCovered(), 620);
    Animated.timing(t, { toValue: 1, duration: 2400, easing: Easing.linear, useNativeDriver: true }).start(() => onDone && onDone());
    return () => clearTimeout(cover);
  }, [t]);

  const n = SLABS.length;
  const slabW = (W * 1.5) / n;
  const textOp = t.interpolate({ inputRange: [0, 0.2, 0.3, 0.68, 0.78, 1], outputRange: [0, 0, 1, 1, 0, 0] });
  const textSc = t.interpolate({ inputRange: [0, 0.2, 0.32, 1], outputRange: [2.2, 2.2, 1, 1.08], extrapolate: 'clamp' });
  const ringSc = t.interpolate({ inputRange: [0, 0.26, 0.75], outputRange: [0.2, 0.2, 3.2], extrapolate: 'clamp' });
  const ringOp = t.interpolate({ inputRange: [0, 0.26, 0.34, 0.75], outputRange: [0, 0, 0.9, 0] });

  return (
    <View pointerEvents="auto" style={{ position: 'absolute', left: 0, top: 0, width: W, height: H, overflow: 'hidden', zIndex: 50 }}>
      {SLABS.map((c, i) => {
        const inStart = 0.02 + i * 0.03, inEnd = inStart + 0.2;           // slam in (staggered)
        const outStart = 0.66 + (n - 1 - i) * 0.025, outEnd = outStart + 0.18; // sweep out the other way
        const x = t.interpolate({
          inputRange: [0, inStart, inEnd, outStart, outEnd, 1],
          outputRange: [-W * 1.6, -W * 1.6, 0, 0, W * 1.6, W * 1.6],
          extrapolate: 'clamp',
        });
        return (
          <Animated.View key={i} style={{ position: 'absolute', top: -20, bottom: -20, left: i * slabW - W * 0.25, width: slabW + 40, backgroundColor: c, transform: [{ translateX: x }, { skewX: '-14deg' }] }} />
        );
      })}

      <View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }}>
        <Animated.View style={{ position: 'absolute', width: H * 0.5, height: H * 0.5, borderRadius: H * 0.25, borderWidth: 3, borderColor: tint, opacity: ringOp, transform: [{ scale: ringSc }] }} />
        <Animated.View style={{ alignItems: 'center', opacity: textOp, transform: [{ scale: textSc }, { rotate: '-6deg' }] }}>
          <View style={{ backgroundColor: '#000', paddingHorizontal: 16, paddingVertical: 2, transform: [{ skewX: '-12deg' }] }}>
            <Text style={{ color: '#fff', fontSize: 13, fontWeight: '900', letterSpacing: 5 }}>DARK HOUR</Text>
          </View>
          <Text numberOfLines={1} style={{ color: '#000', fontSize: Math.min(W * 0.13, 64), fontWeight: '900', fontStyle: 'italic', marginTop: 4, textShadowColor: '#fff', textShadowRadius: 0, textShadowOffset: { width: 3, height: 3 } }}>
            {name.toUpperCase()}
          </Text>
          <View style={{ backgroundColor: tint, paddingHorizontal: 14, paddingVertical: 2, marginTop: 2, transform: [{ skewX: '-12deg' }] }}>
            <Text style={{ color: COLOR.navy, fontSize: 14, fontWeight: '900', letterSpacing: 3 }}>LET'S BEGIN</Text>
          </View>
        </Animated.View>
      </View>
    </View>
  );
}
