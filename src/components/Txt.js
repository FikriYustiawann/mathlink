import React from 'react';
import { Text as RNText, Animated, StyleSheet } from 'react-native';

// ============================================================
//  TEKS SERAGAM (font Inter ikut di dalam aplikasi)
//  Kenapa: font bawaan tiap HP berbeda (Samsung, Infinix, Xiaomi...), sehingga angka, tanda × ÷ − → dan huruf
//  miring tebal tampil acak-acakan. Di sini semua teks memakai satu font yang sama di semua perangkat.
//  - Gaya lama (fontWeight, fontStyle) tetap dipakai di seluruh layar; komponen ini yang menerjemahkannya
//    ke berkas font yang tepat (Inter-400 ... Inter-900, tambah "i" untuk miring).
//  - Teks yang terlalu kecil (< MIN_SIZE) dinaikkan agar terbaca di HP.
//  - Sebelum font selesai dimuat (atau bila gagal), teks memakai font sistem seperti biasa.
// ============================================================
export const MIN_SIZE = 11;
const WEIGHTS = [400, 500, 600, 700, 800, 900];

let fontsReady = false;
export const setFontsReady = (v) => { fontsReady = !!v; };

// berkas yang dimuat di App.js (useFonts)
export const FONT_FILES = {
  'Inter-400': require('../../assets/fonts/Inter-400.otf'),
  'Inter-400i': require('../../assets/fonts/Inter-400i.otf'),
  'Inter-500': require('../../assets/fonts/Inter-500.otf'),
  'Inter-500i': require('../../assets/fonts/Inter-500i.otf'),
  'Inter-600': require('../../assets/fonts/Inter-600.otf'),
  'Inter-600i': require('../../assets/fonts/Inter-600i.otf'),
  'Inter-700': require('../../assets/fonts/Inter-700.otf'),
  'Inter-700i': require('../../assets/fonts/Inter-700i.otf'),
  'Inter-800': require('../../assets/fonts/Inter-800.otf'),
  'Inter-800i': require('../../assets/fonts/Inter-800i.otf'),
  'Inter-900': require('../../assets/fonts/Inter-900.otf'),
  'Inter-900i': require('../../assets/fonts/Inter-900i.otf'),
};

const toNum = (w) => (w === 'bold' ? 700 : w === 'normal' || w == null ? null : parseInt(w, 10) || null);
const nearest = (n) => WEIGHTS.reduce((a, b) => (Math.abs(b - n) < Math.abs(a - n) ? b : a), 400);
export const fontFamilyOf = (weight, italic) => `Inter-${nearest(weight || 400)}${italic ? 'i' : ''}`;

// Teks di dalam teks (mis. angka tebal di dalam kalimat) mewarisi bobot/miring induknya, seperti perilaku asli RN.
const Inherit = React.createContext({ w: null, i: false });

const Txt = React.forwardRef(function Txt({ style, children, ...rest }, ref) {
  const inh = React.useContext(Inherit);
  if (!fontsReady) return <RNText ref={ref} style={style} {...rest}>{children}</RNText>;

  const f = StyleSheet.flatten(style) || {};
  const w = toNum(f.fontWeight) != null ? toNum(f.fontWeight) : (f.fontWeight === 'normal' ? 400 : inh.w);
  const italic = f.fontStyle ? f.fontStyle === 'italic' : inh.i;
  const extra = { fontFamily: fontFamilyOf(w, italic), fontWeight: 'normal', fontStyle: 'normal' };
  if (typeof f.fontSize === 'number' && f.fontSize < MIN_SIZE) {
    extra.fontSize = MIN_SIZE;
    if (typeof f.lineHeight === 'number') extra.lineHeight = Math.round((f.lineHeight * MIN_SIZE) / f.fontSize);
  }
  const nested = typeof children !== 'string' && typeof children !== 'number';
  const node = <RNText ref={ref} {...rest} style={[style, extra]}>{children}</RNText>;
  return nested ? <Inherit.Provider value={{ w, i: italic }}>{node}</Inherit.Provider> : node;
});

export default Txt;
export const AnimText = Animated.createAnimatedComponent(Txt);
