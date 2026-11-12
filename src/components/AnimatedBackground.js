import React from 'react';
import { View, Animated, Easing, StyleSheet, useWindowDimensions } from 'react-native';
import { AnimText } from './Txt';
import { COLOR } from '../theme';
import { useDecor as useLoop } from '../hooks/useLoop';
import MathBackdrop from './MathBackdrop';

const SYMBOLS = [
  { s: 'Ã·',   x: 0.78, y: 0.08, size: 64, delay: 0 },
  { s: 'x : y', x: 0.06, y: 0.30, size: 40, delay: 1000 },
  { s: '%',   x: 0.72, y: 0.58, size: 84, delay: 500 },
  { s: '=',   x: 0.16, y: 0.80, size: 52, delay: 1500 },
  { s: 'a/b', x: 0.40, y: 0.14, size: 46, delay: 800 },
];

const SHARDS = [
  { x: 0.10, y: 0.12, size: 26, delay: 0,    filled: false },
  { x: 0.88, y: 0.28, size: 18, delay: 600,  filled: true },
  { x: 0.30, y: 0.46, size: 14, delay: 1200, filled: true },
  { x: 0.64, y: 0.70, size: 30, delay: 300,  filled: false },
  { x: 0.08, y: 0.66, size: 20, delay: 900,  filled: false },
  { x: 0.52, y: 0.90, size: 16, delay: 1500, filled: true },
  { x: 0.92, y: 0.84, size: 22, delay: 200,  filled: false },
];

// Garis diagonal yang terus meluncur
function Stripe({ i, count, W, H }) {
  const t = useLoop(9000 + i * 1700, { delay: i * 400 });
  const translateX = t.interpolate({ inputRange: [0, 1], outputRange: [-W * 1.3, W * 1.3] });
  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: (i / count) * H * 1.1 - H * 0.05,
        left: -W * 0.2,
        width: W * 0.9,
        height: 10 + (i % 3) * 14,
        backgroundColor: i % 2 ? COLOR.cyan : COLOR.white,
        opacity: 0.06 + (i % 3) * 0.04,
        transform: [{ rotate: '-18deg' }, { translateX }],
      }}
    />
  );
}

// Kepingan segi empat (diamond) melayang
function Shard({ x, y, size, delay, filled }) {
  const t = useLoop(5200 + delay, { yoyo: true, easing: Easing.inOut(Easing.sin), delay });
  const translateY = t.interpolate({ inputRange: [0, 1], outputRange: [0, -26] });
  const rotate = t.interpolate({ inputRange: [0, 1], outputRange: ['45deg', '135deg'] });
  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: size,
        height: size,
        borderWidth: 2,
        borderColor: COLOR.cyan,
        backgroundColor: filled ? 'rgba(0,229,255,0.25)' : 'transparent',
        opacity: filled ? 0.6 : 0.4,
        transform: [{ translateY }, { rotate }],
      }}
    />
  );
}

// Simbol matematika melayang
function MathSymbol({ s, x, y, size, delay }) {
  const t = useLoop(4000 + delay, { yoyo: true, easing: Easing.inOut(Easing.sin), delay });
  const translateY = t.interpolate({ inputRange: [0, 1], outputRange: [0, -30] });
  const rotate = t.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '25deg'] });
  return (
    <AnimText
      style={{
        position: 'absolute',
        left: x,
        top: y,
        fontSize: size,
        fontWeight: '900',
        fontStyle: 'italic',
        color: 'rgba(0, 229, 255, 0.16)',
        transform: [{ translateY }, { rotate }],
      }}
    >
      {s}
    </AnimText>
  );
}

// Cincin jam (motif "Dark Hour") yang berputar pelan
function ClockRing({ size, style }) {
  const spin = useLoop(90000);
  const counter = useLoop(60000);
  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const rotateBack = counter.interpolate({ inputRange: [0, 1], outputRange: ['360deg', '0deg'] });
  const inner = size * 0.7;
  return (
    <View pointerEvents="none" style={[{ position: 'absolute', width: size, height: size }, style]}>
      <Animated.View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: 2,
          borderColor: 'rgba(0,229,255,0.35)',
          transform: [{ rotate }],
        }}
      >
        {Array.from({ length: 12 }).map((_, i) => {
          const major = i % 3 === 0;
          return (
            <View
              key={i}
              style={{
                position: 'absolute',
                width: size - 4,
                height: size - 4,
                alignItems: 'center',
                transform: [{ rotate: `${i * 30}deg` }],
              }}
            >
              <View
                style={{
                  width: major ? 5 : 3,
                  height: major ? 28 : 14,
                  backgroundColor: major ? COLOR.cyan : 'rgba(0,229,255,0.5)',
                }}
              />
            </View>
          );
        })}
      </Animated.View>
      <Animated.View
        style={{
          position: 'absolute',
          top: (size - inner) / 2,
          left: (size - inner) / 2,
          width: inner,
          height: inner,
          borderRadius: inner / 2,
          borderWidth: 1.5,
          borderStyle: 'dashed',
          borderColor: 'rgba(191,239,255,0.35)',
          transform: [{ rotate: rotateBack }],
        }}
      />
    </View>
  );
}


// Berkas cahaya dari permukaan air
function Ray({ x, w, H, delay }) {
  const t = useLoop(4200 + delay, { yoyo: true, easing: Easing.inOut(Easing.sin), delay });
  const opacity = t.interpolate({ inputRange: [0, 1], outputRange: [0.04, 0.2] });
  return (
    <Animated.View
      style={{ position: 'absolute', top: 0, left: x, width: w, height: H, backgroundColor: COLOR.ice, opacity, transform: [{ skewX: '-10deg' }] }}
    />
  );
}

// Gumpalan "permukaan air" yang bergeser pelan
function Cloud({ x, y, w, h, dur, delay, W }) {
  const t = useLoop(dur, { yoyo: true, easing: Easing.inOut(Easing.sin), delay });
  const translateX = t.interpolate({ inputRange: [0, 1], outputRange: [-W * 0.06, W * 0.06] });
  return (
    <Animated.View
      style={{ position: 'absolute', left: x, top: y, width: w, height: h, borderRadius: h / 2, backgroundColor: '#3FE0FF', opacity: 0.35, transform: [{ translateX }] }}
    />
  );
}

// Latar bergaya bawah laut: biru tua, permukaan cyan di atas, berkas cahaya, serpihan melayang
function SeaBackground({ W, H }) {
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { overflow: 'hidden', backgroundColor: '#0A27B8' }]}>
      {[0, 1, 2, 3].map((i) => (
        <View key={i} style={{ position: 'absolute', top: 0, left: 0, right: 0, height: H * (0.14 + i * 0.1), backgroundColor: '#22D3FF', opacity: 0.2 }} />
      ))}
      {[0, 1, 2, 3, 4].map((i) => (
        <Cloud key={i} x={W * (0.3 + (i % 3) * 0.2)} y={H * (0.02 + (i % 2) * 0.09)} w={W * (0.22 + (i % 2) * 0.12)} h={H * 0.05} dur={7000 + i * 900} delay={i * 300} W={W} />
      ))}
      {[0.46, 0.62, 0.78].map((p, i) => (
        <Ray key={i} x={W * p} w={W * 0.05} H={H} delay={i * 700} />
      ))}
      {/* unsur matematika: kertas grafik, grafik senilai/berbalik nilai, rumus naik */}
      <MathBackdrop W={W} H={H} grid graph rich extras rising={30} />
      {SHARDS.map((p, i) => (
        <Shard key={i} x={p.x * W} y={p.y * H} size={p.size} delay={p.delay} filled={p.filled} />
      ))}
      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: H * 0.35, backgroundColor: '#031A9A', opacity: 0.5 }} />
    </View>
  );
}

// Latar tenang untuk mode FOKUS: panel miring khas Persona saja, tanpa rumus melayang, serpihan, atau garis meluncur
function CalmBackground({ W, H }) {
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { overflow: 'hidden', backgroundColor: COLOR.bg }]}>
      <View style={{ position: 'absolute', top: -H * 0.12, left: -W * 0.35, width: W * 1.7, height: H * 0.75, backgroundColor: COLOR.blue, opacity: 0.4, transform: [{ rotate: '-18deg' }] }} />
      <View style={{ position: 'absolute', top: H * 0.28, left: -W * 0.4, width: W * 1.8, height: H * 0.5, backgroundColor: COLOR.navy, opacity: 0.85, transform: [{ rotate: '-18deg' }] }} />
      <View style={{ position: 'absolute', top: H * 0.26, left: -W * 0.4, width: W * 1.8, height: 3, backgroundColor: COLOR.cyan, opacity: 0.5, transform: [{ rotate: '-18deg' }] }} />
    </View>
  );
}

// variant: 'sea' (lobby bawah laut) | 'lobby' | 'page'
// (komentar lama) variant: 'lobby' (lengkap + jam) | 'page' (lebih ringan untuk layar isi)
export default function AnimatedBackground({ variant = 'lobby' }) {
  const { width: W, height: H } = useWindowDimensions();
  if (variant === 'sea') return <SeaBackground W={W} H={H} />;
  if (variant === 'calm') return <CalmBackground W={W} H={H} />;
  const lobby = variant === 'lobby';
  const stripeCount = lobby ? 7 : 4;
  const clockSize = Math.min(W * 1.15, 480);

  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { overflow: 'hidden', backgroundColor: COLOR.bg }]}>
      {/* panel miring biru */}
      <View
        style={{
          position: 'absolute',
          top: -H * 0.12,
          left: -W * 0.35,
          width: W * 1.7,
          height: H * 0.75,
          backgroundColor: COLOR.blue,
          opacity: 0.55,
          transform: [{ rotate: '-18deg' }],
        }}
      />
      <View
        style={{
          position: 'absolute',
          top: H * 0.28,
          left: -W * 0.4,
          width: W * 1.8,
          height: H * 0.5,
          backgroundColor: COLOR.navy,
          opacity: 0.85,
          transform: [{ rotate: '-18deg' }],
        }}
      />
      {/* garis tepi cyan */}
      <View
        style={{
          position: 'absolute',
          top: H * 0.26,
          left: -W * 0.4,
          width: W * 1.8,
          height: 3,
          backgroundColor: COLOR.cyan,
          opacity: 0.7,
          transform: [{ rotate: '-18deg' }],
        }}
      />

      {Array.from({ length: stripeCount }).map((_, i) => (
        <Stripe key={`st${i}`} i={i} count={stripeCount} W={W} H={H} />
      ))}

      <MathBackdrop W={W} H={H} grid graph={false} extras rising={lobby ? 16 : 14} />

      {lobby && (
        <ClockRing size={clockSize} style={{ right: -clockSize * 0.38, bottom: H * 0.04 }} />
      )}

      {SHARDS.slice(0, lobby ? SHARDS.length : 4).map((p, i) => (
        <Shard key={`sh${i}`} x={p.x * W} y={p.y * H} size={p.size} delay={p.delay} filled={p.filled} />
      ))}

      {SYMBOLS.slice(0, lobby ? SYMBOLS.length : 3).map((p, i) => (
        <MathSymbol key={`ms${i}`} s={p.s} x={p.x * W} y={p.y * H} size={p.size} delay={p.delay} />
      ))}

      {/* vignette gelap atas & bawah */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: H * 0.12, backgroundColor: 'rgba(2,12,27,0.55)' }} />
      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: H * 0.2, backgroundColor: 'rgba(2,12,27,0.55)' }} />
    </View>
  );
}
