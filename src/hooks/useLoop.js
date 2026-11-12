import { useEffect, useRef } from 'react';
import { Animated, Easing, Platform } from 'react-native';
import { WEB_BG_ANIM } from '../config';

// Nilai animasi 0â†’1 yang berulang terus (opsional bolak-balik / "yoyo").
export default function useLoop(duration, { yoyo = false, easing = Easing.linear, delay = 0 } = {}) {
  const v = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const step = (toValue) =>
      Animated.timing(v, { toValue, duration, easing, useNativeDriver: true });
    const cycle = yoyo ? Animated.sequence([step(1), step(0)]) : step(1);
    const run = Animated.sequence([Animated.delay(delay), Animated.loop(cycle)]);
    run.start();
    return () => run.stop();
  }, [v, duration, yoyo, delay]);

  return v;
}

// Animasi DEKORASI (latar, aura, cincin). Di web, bila WEB_BG_ANIM = false, nilainya diam di 0
// sehingga tidak ada pekerjaan per frame sama sekali. Di HP tetap bergerak seperti useLoop.
const useStill = () => useRef(new Animated.Value(0)).current;
export const useDecor = Platform.OS === 'web' && !WEB_BG_ANIM ? useStill : useLoop;
