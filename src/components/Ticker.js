import React, { useEffect, useRef, useState } from 'react';
import { View, Animated, Easing } from 'react-native';
import Text from './Txt';
import { COLOR } from '../theme';

// Teks berjalan di dasar layar (gaya ticker Persona)
export default function Ticker({ text, height = 30 }) {
  const [w, setW] = useState(0);
  const x = useRef(new Animated.Value(0)).current;
  const unit = `${text}   ◆   `.repeat(4);

  useEffect(() => {
    if (!w) return undefined;
    x.setValue(0);
    const run = Animated.loop(
      Animated.timing(x, { toValue: -w, duration: w * 26, easing: Easing.linear, useNativeDriver: true })
    );
    run.start();
    return () => run.stop();
  }, [w, x]);

  const textStyle = { color: COLOR.navy, fontSize: 13, fontWeight: '900', fontStyle: 'italic', letterSpacing: 3, flexShrink: 0 };

  return (
    <View pointerEvents="none" style={{ height, overflow: 'hidden', backgroundColor: COLOR.ice, justifyContent: 'center' }}>
      <Animated.View style={{ flexDirection: 'row', width: 20000, transform: [{ translateX: x }] }}>
        <Text numberOfLines={1} onLayout={(e) => setW(e.nativeEvent.layout.width)} style={textStyle}>{unit}</Text>
        <Text numberOfLines={1} style={textStyle}>{unit}</Text>
      </Animated.View>
    </View>
  );
}
