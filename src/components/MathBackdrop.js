import React, { useMemo } from 'react';
import { View, Animated, Easing } from 'react-native';
import Text, { AnimText } from './Txt';
import { COLOR } from '../theme';
import { useDecor as useLoop } from '../hooks/useLoop';
import { LITE } from '../perf';

// ============================================================
//  Lapisan matematika untuk latar belakang.
//  Hanya memakai View/Text/Animated (transform & opacity) agar
//  tetap ringan dan konsisten dengan keputusan desain di PROJECT_NOTES.
// ============================================================

// Angka & rumus yang "naik" seperti gelembung. Isinya sesuai materi.
const RISERS = [
  { t: 'k = y Ã· x',   x: 0.04, dur: 19000, d: 0,     size: 26 },
  { t: '%',           x: 0.30, dur: 15000, d: 2500,  size: 54 },
  { t: '120.000',     x: 0.62, dur: 21000, d: 800,   size: 24 },
  { t: 'x Â· y = k',   x: 0.78, dur: 17000, d: 5200,  size: 28 },
  { t: 'Ã·',           x: 0.18, dur: 14000, d: 7000,  size: 60 },
  { t: '3 Ã— 15',      x: 0.48, dur: 20000, d: 3800,  size: 24 },
  { t: 'a/b = c/d',   x: 0.70, dur: 23000, d: 9000,  size: 26 },
  { t: '8 â†’ 10',      x: 0.10, dur: 18000, d: 11000, size: 24 },
  { t: 'Ï€',           x: 0.88, dur: 16000, d: 6000,  size: 48 },
  { t: '45 km',       x: 0.38, dur: 22000, d: 13000, size: 22 },
  { t: 'âˆš',           x: 0.56, dur: 15500, d: 10000, size: 50 },
  { t: '24 hari',     x: 0.84, dur: 24000, d: 15000, size: 22 },
  { t: '=',           x: 0.24, dur: 17500, d: 4500,  size: 56 },
  { t: 'âˆ‘',           x: 0.66, dur: 19500, d: 12000, size: 46 },
  { t: '3 : 45',      x: 0.92, dur: 21500, d: 1800,  size: 24 },
  { t: 'Â½',           x: 0.02, dur: 16500, d: 8200,  size: 52 },
  { t: 'xâ‚ Â· yâ‚',     x: 0.44, dur: 18500, d: 14000, size: 24 },
  { t: 'Ã—',           x: 0.74, dur: 14500, d: 3000,  size: 58 },
  { t: '15 orang',    x: 0.52, dur: 23500, d: 6800,  size: 22 },
  { t: '3/4',         x: 0.34, dur: 17000, d: 10500, size: 36 },
  { t: 'Rp12.000',    x: 0.14, dur: 22500, d: 16000, size: 22 },
  { t: 'âˆž',           x: 0.60, dur: 15800, d: 12800, size: 54 },
  { t: '4 Ã— 12 = 48', x: 0.08, dur: 24000, d: 9500,  size: 22 },
  { t: '25%',         x: 0.40, dur: 16000, d: 1200,  size: 44 },
  { t: 'y = 8',       x: 0.90, dur: 20500, d: 7600,  size: 26 },
  { t: '2 : 3',       x: 0.27, dur: 19000, d: 15500, size: 30 },
  { t: 'Î”',           x: 0.70, dur: 15200, d: 4200,  size: 52 },
  { t: '1/x',         x: 0.50, dur: 17800, d: 17000, size: 34 },
  { t: 'â‰ˆ',           x: 0.12, dur: 15600, d: 13500, size: 54 },
  { t: '60 km/jam',   x: 0.58, dur: 25000, d: 2200,  size: 21 },
  { t: 'k',           x: 0.82, dur: 14800, d: 9800,  size: 58 },
  { t: 'â†‘ â†“',         x: 0.32, dur: 18200, d: 6400,  size: 40 },
  { t: 'Rp1.440.000', x: 0.64, dur: 26000, d: 11200, size: 20 },
  { t: '7 liter',     x: 0.94, dur: 21800, d: 15800, size: 22 },
  { t: 'âˆš2',          x: 0.20, dur: 16800, d: 8800,  size: 40 },
  { t: 'â‰ ',           x: 0.46, dur: 15000, d: 17800, size: 52 },
];

// Rumus yang muncul-hilang di posisi tetap (seperti papan tulis)
const FORMULAS = [
  { t: '45 Ã· 3 = 120 Ã· y',   x: 0.05, y: 0.10, d: 0 },
  { t: '10 Ã— x = 14 Ã— 15',   x: 0.50, y: 0.17, d: 2600 },
  { t: 'x = 210 Ã· 10 = 21',  x: 0.08, y: 0.36, d: 5200 },
  { t: 'a/b = c/d',          x: 0.58, y: 0.42, d: 7800 },
  { t: '120.000 Ã· 10 = 12.000', x: 0.06, y: 0.60, d: 3900 },
  { t: 'xâ‚ Â· yâ‚ = xâ‚‚ Â· yâ‚‚',  x: 0.46, y: 0.66, d: 1300 },
  { t: 'y = kx',             x: 0.72, y: 0.28, d: 6500 },
  { t: '6 hari  âœ“',          x: 0.10, y: 0.82, d: 9100 },
  { t: 'Rp48.000 / kaos',    x: 0.54, y: 0.86, d: 4700 },
];

// Bangun datar yang berputar & melayang pelan
const SHAPES = [
  { k: 'square',  x: 0.08, y: 0.20, s: 44, dur: 30000, d: 0 },
  { k: 'circle',  x: 0.84, y: 0.14, s: 64, dur: 34000, d: 900 },
  { k: 'tri',     x: 0.72, y: 0.58, s: 50, dur: 28000, d: 1800 },
  { k: 'diamond', x: 0.30, y: 0.50, s: 34, dur: 26000, d: 600 },
  { k: 'circle',  x: 0.18, y: 0.72, s: 40, dur: 32000, d: 2400 },
  { k: 'square',  x: 0.88, y: 0.78, s: 52, dur: 36000, d: 1200 },
  { k: 'tri',     x: 0.42, y: 0.08, s: 36, dur: 27000, d: 3000 },
  { k: 'diamond', x: 0.62, y: 0.92, s: 40, dur: 31000, d: 2000 },
];

function Formula({ t, x, y, d, W, H }) {
  const a = useLoop(11000, { delay: d });
  const opacity = a.interpolate({ inputRange: [0, 0.14, 0.72, 1], outputRange: [0, 0.55, 0.55, 0] });
  const translateY = a.interpolate({ inputRange: [0, 1], outputRange: [10, -10] });
  return (
    <AnimText numberOfLines={1} style={{ position: 'absolute', left: x * W, top: y * H, fontSize: 17, fontWeight: '800', fontStyle: 'italic', color: COLOR.ice, opacity, transform: [{ translateY }] }}>
      {t}
    </AnimText>
  );
}

function Shape({ k, x, y, s, dur, d, W, H }) {
  const spin = useLoop(dur, { delay: d });
  const bob = useLoop(dur * 0.18, { yoyo: true, easing: Easing.inOut(Easing.sin), delay: d });
  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', k === 'circle' ? '360deg' : '-360deg'] });
  const translateY = bob.interpolate({ inputRange: [0, 1], outputRange: [-12, 12] });
  const ink = 'rgba(191,239,255,0.3)';
  let body;
  if (k === 'circle') {
    body = (
      <View style={{ width: s, height: s, borderRadius: s / 2, borderWidth: 2, borderColor: ink, alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ position: 'absolute', width: s - 4, height: 2, backgroundColor: ink }} />
        <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: ink }} />
      </View>
    );
  } else if (k === 'tri') {
    body = (
      <View>
        <View style={{ width: 0, height: 0, borderLeftWidth: s, borderBottomWidth: s, borderLeftColor: 'transparent', borderBottomColor: 'rgba(0,229,255,0.16)' }} />
        <View style={{ position: 'absolute', right: 0, bottom: 0, width: s * 0.22, height: s * 0.22, borderTopWidth: 2, borderLeftWidth: 2, borderColor: ink }} />
      </View>
    );
  } else {
    body = <View style={{ width: s, height: s, borderWidth: 2, borderColor: ink, transform: k === 'diamond' ? [{ rotate: '45deg' }] : [] }} />;
  }
  return <Animated.View style={{ position: 'absolute', left: x * W, top: y * H, transform: [{ translateY }, { rotate }] }}>{body}</Animated.View>;
}

// Garis bilangan 0â€“10 dengan titik yang melompat
function NumberLine({ W, H }) {
  const w = Math.min(W * 0.8, 560);
  const t = useLoop(9000, { yoyo: true, easing: Easing.inOut(Easing.quad) });
  const x = t.interpolate({ inputRange: [0, 1], outputRange: [0, w] });
  const hop = t.interpolate({ inputRange: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1], outputRange: [0, -14, 0, -14, 0, -14, 0, -14, 0, -14, 0] });
  const ink = 'rgba(191,239,255,0.4)';
  return (
    <View pointerEvents="none" style={{ position: 'absolute', left: (W - w) / 2, top: H - 46, width: w, height: 40 }}>
      <View style={{ position: 'absolute', left: 0, right: 0, top: 22, height: 2, backgroundColor: ink }} />
      {Array.from({ length: 11 }).map((_, i) => (
        <View key={i} style={{ position: 'absolute', left: (i / 10) * w - 8, top: 14, width: 16, alignItems: 'center' }}>
          <View style={{ width: 2, height: 16, backgroundColor: ink }} />
          <Text style={{ fontSize: 10, fontWeight: '900', color: ink, marginTop: 1 }}>{i}</Text>
        </View>
      ))}
      <Animated.View style={{ position: 'absolute', left: -6, top: 4, width: 12, height: 12, borderRadius: 6, backgroundColor: COLOR.cyan, borderWidth: 2, borderColor: '#fff', transform: [{ translateX: x }, { translateY: hop }] }} />
    </View>
  );
}

// Penggaris di tepi kanan yang bergeser pelan
function Ruler({ H }) {
  const t = useLoop(6000);
  const translateY = t.interpolate({ inputRange: [0, 1], outputRange: [0, -60] });
  const n = Math.ceil(H / 12) + 10;
  const ink = 'rgba(191,239,255,0.28)';
  return (
    <View pointerEvents="none" style={{ position: 'absolute', right: 0, top: 0, width: 30, height: H, overflow: 'hidden' }}>
      <Animated.View style={{ position: 'absolute', right: 0, top: 0, width: 30, height: n * 12, transform: [{ translateY }] }}>
        {Array.from({ length: n }).map((_, i) => (
          <View key={i} style={{ position: 'absolute', right: 0, top: i * 12, height: 1.5, width: i % 5 === 0 ? 24 : i % 5 === 0 ? 24 : 12, backgroundColor: ink }} />
        ))}
      </Animated.View>
    </View>
  );
}

function Riser({ t, x, dur, d, size, W, H }) {
  const rise = useLoop(dur, { delay: d });
  const sway = useLoop(dur * 0.37, { yoyo: true, easing: Easing.inOut(Easing.sin), delay: d });
  const translateY = rise.interpolate({ inputRange: [0, 1], outputRange: [H + 40, -size * 2] });
  const opacity = rise.interpolate({ inputRange: [0, 0.12, 0.8, 1], outputRange: [0, 1, 1, 0] });
  const translateX = sway.interpolate({ inputRange: [0, 1], outputRange: [-14, 14] });
  return (
    <AnimText
      numberOfLines={1}
      style={{
        position: 'absolute',
        left: x * W,
        top: 0,
        fontSize: size,
        fontWeight: '900',
        fontStyle: 'italic',
        color: 'rgba(191,239,255,0.26)',
        opacity,
        transform: [{ translateY }, { translateX }],
      }}
    >
      {t}
    </AnimText>
  );
}

// Kertas grafik yang bergeser pelan ke atas
function Grid({ W, H, cell = 48 }) {
  const t = useLoop(7000);
  const translateY = t.interpolate({ inputRange: [0, 1], outputRange: [0, -cell] });
  const cols = Math.ceil(W / cell) + 1;
  const rows = Math.ceil(H / cell) + 2;
  const line = 'rgba(191,239,255,0.09)';
  const strong = 'rgba(0,229,255,0.16)';
  return (
    <Animated.View
      pointerEvents="none"
      style={{ position: 'absolute', top: 0, left: 0, width: W, height: rows * cell, transform: [{ translateY }] }}
    >
      {Array.from({ length: cols }).map((_, i) => (
        <View key={`v${i}`} style={{ position: 'absolute', left: i * cell, top: 0, width: 1, height: rows * cell, backgroundColor: i % 4 === 0 ? strong : line }} />
      ))}
      {Array.from({ length: rows }).map((_, j) => (
        <View key={`h${j}`} style={{ position: 'absolute', top: j * cell, left: 0, height: 1, width: W, backgroundColor: j % 4 === 0 ? strong : line }} />
      ))}
    </Animated.View>
  );
}

// Titik-titik yang membentuk kurva
function Dots({ pts, size, color, dot = 5 }) {
  return pts.map((p, i) => (
    <View
      key={i}
      style={{
        position: 'absolute',
        left: p.x * size - dot / 2,
        top: (1 - p.y) * size - dot / 2,
        width: dot,
        height: dot,
        borderRadius: dot / 2,
        backgroundColor: color,
        opacity: 0.55,
      }}
    />
  ));
}

// Titik bercahaya yang berjalan menyusuri kurva
function Traveler({ pts, size, color, dur }) {
  const t = useLoop(dur, { yoyo: true, easing: Easing.inOut(Easing.sin) });
  const input = pts.map((_, i) => i / (pts.length - 1));
  const translateX = t.interpolate({ inputRange: input, outputRange: pts.map((p) => p.x * size - 7) });
  const translateY = t.interpolate({ inputRange: input, outputRange: pts.map((p) => (1 - p.y) * size - 7) });
  return (
    <Animated.View style={{ position: 'absolute', left: 0, top: 0, width: 14, height: 14, transform: [{ translateX }, { translateY }] }}>
      <View style={{ position: 'absolute', left: -9, top: -9, width: 32, height: 32, borderRadius: 16, backgroundColor: color, opacity: 0.25 }} />
      <View style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: color, borderWidth: 2, borderColor: '#fff' }} />
    </Animated.View>
  );
}

// Grafik: garis lurus (senilai, y = kx) dan hiperbola (berbalik nilai, xÂ·y = k)
function Graph({ size, style }) {
  const N = 26;
  const K = 0.2;
  const line = useMemo(() => Array.from({ length: N + 1 }, (_, i) => ({ x: i / N, y: i / N })), []);
  const hyper = useMemo(
    () => Array.from({ length: N + 1 }, (_, i) => { const x = K + ((1 - K) * i) / N; return { x, y: K / x }; }),
    []
  );
  const lbl = { position: 'absolute', fontSize: 13, fontWeight: '900', fontStyle: 'italic' };
  return (
    <View pointerEvents="none" style={[{ width: size, height: size, opacity: 0.7 }, style]}>
      {/* sumbu */}
      <View style={{ position: 'absolute', left: 0, top: 0, width: 2, height: size, backgroundColor: COLOR.ice, opacity: 0.55 }} />
      <View style={{ position: 'absolute', left: 0, bottom: 0, width: size, height: 2, backgroundColor: COLOR.ice, opacity: 0.55 }} />
      <Text style={[lbl, { color: COLOR.ice, left: 6, top: -4, opacity: 0.7 }]}>y</Text>
      <Text style={[lbl, { color: COLOR.ice, left: size - 10, top: size - 22, opacity: 0.7 }]}>x</Text>

      <Dots pts={line} size={size} color={COLOR.cyan} />
      <Dots pts={hyper} size={size} color="#FF4D8D" />

      <Text style={[lbl, { color: COLOR.cyan, left: size * 0.7, top: size * 0.52 }]}>y = kx</Text>
      <Text style={[lbl, { color: '#FF8AB5', left: size * 0.38, top: size * 0.08 }]}>x Â· y = k</Text>

      <Traveler pts={line} size={size} color={COLOR.cyan} dur={6200} />
      <Traveler pts={hyper} size={size} color="#FF4D8D" dur={7400} />
    </View>
  );
}

// Busur derajat: cincin berskala 0Â°â€“350Â° yang berputar pelan + jarum jari-jari
function Dial({ size, style }) {
  const spin = useLoop(140000);
  const hand = useLoop(24000);
  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const rotateHand = hand.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const ink = 'rgba(191,239,255,0.55)';
  return (
    <View pointerEvents="none" style={[{ position: 'absolute', width: size, height: size }, style]}>
      <Animated.View
        style={{ width: size, height: size, borderRadius: size / 2, borderWidth: 2, borderColor: 'rgba(191,239,255,0.3)', transform: [{ rotate }] }}
      >
        {Array.from({ length: 36 }).map((_, i) => {
          const major = i % 3 === 0;
          return (
            <View key={i} style={{ position: 'absolute', width: size - 4, height: size - 4, alignItems: 'center', transform: [{ rotate: `${i * 10}deg` }] }}>
              <View style={{ width: major ? 3 : 1.5, height: major ? 16 : 8, backgroundColor: ink }} />
              {major && <Text style={{ marginTop: 3, fontSize: 11, fontWeight: '900', color: ink }}>{i * 10}Â°</Text>}
            </View>
          );
        })}
      </Animated.View>
      <View style={{ position: 'absolute', top: size * 0.22, left: size * 0.22, width: size * 0.56, height: size * 0.56, borderRadius: size * 0.28, borderWidth: 1.5, borderStyle: 'dashed', borderColor: 'rgba(191,239,255,0.28)' }} />
      <Animated.View style={{ position: 'absolute', width: size, height: size, transform: [{ rotate: rotateHand }] }}>
        <View style={{ position: 'absolute', left: size / 2 - 1, top: size * 0.12, width: 2, height: size * 0.38, backgroundColor: COLOR.cyan, opacity: 0.55 }} />
      </Animated.View>
      <Text style={{ position: 'absolute', top: size / 2 - 22, left: 0, right: 0, textAlign: 'center', fontSize: 40, fontWeight: '900', fontStyle: 'italic', color: 'rgba(191,239,255,0.22)' }}>Î¸</Text>
    </View>
  );
}

// Gelombang sinus dari titik-titik yang mengalir ke kiri
function Sine({ W, H }) {
  const P = 120;
  const step = 8;
  const amp = Math.min(H * 0.04, 24);
  const t = useLoop(9000);
  const translateX = t.interpolate({ inputRange: [0, 1], outputRange: [0, -P] });
  const n = Math.ceil((W + P) / step) + 1;
  return (
    <Animated.View
      pointerEvents="none"
      style={{ position: 'absolute', left: 0, top: H * 0.8, width: W + P, height: amp * 2 + 6, transform: [{ translateX }] }}
    >
      {Array.from({ length: n }).map((_, i) => {
        const x = i * step;
        const y = amp + amp * Math.sin((2 * Math.PI * x) / P);
        return <View key={i} style={{ position: 'absolute', left: x, top: y, width: 4, height: 4, borderRadius: 2, backgroundColor: COLOR.ice, opacity: 0.4 }} />;
      })}
    </Animated.View>
  );
}

// Satu batang yang tingginya naik-turun, tetap menempel di dasar
function GrowBar({ w, h, lo, hi, color, dur, delay }) {
  const t = useLoop(dur, { yoyo: true, easing: Easing.inOut(Easing.sin), delay });
  const scaleY = t.interpolate({ inputRange: [0, 1], outputRange: [lo, hi] });
  const translateY = t.interpolate({ inputRange: [0, 1], outputRange: [(h / 2) * (1 - lo), (h / 2) * (1 - hi)] });
  return <Animated.View style={{ width: w, height: h, marginHorizontal: w * 0.18, backgroundColor: color, opacity: 0.6, transform: [{ translateY }, { scaleY }] }} />;
}

// Diagram batang mini: kiri membesar (senilai), kanan mengecil (berbalik nilai)
function MiniBars({ size, style }) {
  const n = 5;
  const bw = size * 0.2;
  const h = size;
  const lbl = { fontSize: 11, fontWeight: '900', fontStyle: 'italic', marginTop: 4 };
  return (
    <View pointerEvents="none" style={[{ position: 'absolute' }, style]}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: h, borderBottomWidth: 2, borderBottomColor: 'rgba(191,239,255,0.5)' }}>
        {Array.from({ length: n }).map((_, i) => (
          <GrowBar key={`a${i}`} w={bw} h={h} lo={0.12 + 0.1 * i} hi={0.35 + 0.15 * i} color={COLOR.cyan} dur={2800 + i * 140} delay={i * 120} />
        ))}
        <View style={{ width: bw * 0.8 }} />
        {Array.from({ length: n }).map((_, i) => (
          <GrowBar key={`b${i}`} w={bw} h={h} lo={0.12 + 0.1 * (n - 1 - i)} hi={0.35 + 0.15 * (n - 1 - i)} color="#FF4D8D" dur={2800 + i * 140} delay={i * 120} />
        ))}
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={[lbl, { color: COLOR.cyan }]}>naik â†‘ naik</Text>
        <Text style={[lbl, { color: '#FF8AB5' }]}>naik â†‘ turun</Text>
      </View>
    </View>
  );
}

export default function MathBackdrop({ W, H, grid = true, graph = false, rising: risingProp = 8, rich: richProp = false, extras = false }) {
  // Mode ringan (Android): elemen latar dikurangi supaya tetap lancar
  const rising = LITE ? Math.min(risingProp, 8) : risingProp;
  const rich = LITE ? false : richProp;
  const shapes = LITE ? SHAPES.slice(0, 4) : SHAPES;
  const formulas = LITE ? FORMULAS.slice(0, 4) : FORMULAS;
  const G = Math.max(120, Math.min(W * 0.46, H * 0.32, 300));
  const land = W > H;
  const Gp = land ? G : Math.min(G, W * 0.34);        // HP: grafik dikecilkan & dipindah ke bawah, jauh dari menu
  const graphTop = land ? H * 0.34 : H * 0.7;
  const dialSize = Math.min(W * 0.62, H * 0.75, 420);
  const barSize = land ? Math.min(W * 0.12, 120) : Math.min(W * 0.18, 70);
  return (
    <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden' }}>
      {grid && <Grid W={W} H={H} cell={LITE ? 72 : 48} />}
      {extras && shapes.map((sh, i) => <Shape key={`s${i}`} {...sh} W={W} H={H} />)}
      {extras && formulas.map((f, i) => <Formula key={`f${i}`} {...f} W={W} H={H} />)}
      {extras && <NumberLine W={W} H={H} />}
      {extras && !LITE && <Ruler H={H} />}
      {rich && <Dial size={dialSize} style={{ left: W * 0.38, top: -dialSize * 0.45 }} />}
      {rich && <Sine W={W} H={H} />}
      {graph && <Graph size={Gp} style={{ position: 'absolute', left: W - Gp - W * 0.05, top: graphTop, opacity: land ? 0.7 : 0.45 }} />}
      {rich && (
        <MiniBars
          size={barSize}
          style={land ? { left: W * 0.43, top: H * 0.74 - barSize * 0.2 } : { left: W * 0.4, top: H * 0.13 }}
        />
      )}
      {RISERS.slice(0, rising).map((r, i) => (
        <Riser key={i} {...r} W={W} H={H} />
      ))}
    </View>
  );
}
