import React from 'react';
import { View, Image, Animated, Pressable, Easing, StyleSheet } from 'react-native';
import Text from './Txt';
import { COLOR } from '../theme';
import useLoop from '../hooks/useLoop';
import { Tri, ArrowV } from './Glyph';
import { sfx } from '../audio';

// Angka gaya Indonesia: 1.500.000
export const fmt = (n) => String(Math.round(n * 100) / 100).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');

// Tombol miring bergaya Persona
// icon: 'right' | 'left' -> segitiga di samping teks (digambar, bukan karakter font)
export function Btn({ label, onPress, disabled, tone = 'white', style, icon }) {
  const bg = tone === 'cyan' ? COLOR.cyan : tone === 'pink' ? '#FF4D8D' : COLOR.white;
  return (
    <Pressable onPress={(e) => { sfx(icon === 'left' ? 'back' : 'select'); onPress && onPress(e); }} disabled={disabled} style={[u.btn, { backgroundColor: bg, opacity: disabled ? 0.35 : 1 }, style]}>
      <View style={u.btnIn}>
        {icon === 'left' && <Tri dir="left" size={9} color={COLOR.navy} style={{ marginRight: 9 }} />}
        <Text style={u.btnText}>{label}</Text>
        {icon === 'right' && <Tri dir="right" size={9} color={COLOR.navy} style={{ marginLeft: 9 }} />}
      </View>
    </Pressable>
  );
}

// Label jenis perbandingan
export function Tag({ type }) {
  const s = type === 'senilai';
  const d = type === 'dasar';
  return (
    <View style={[u.tag, { backgroundColor: d ? '#FFD400' : s ? COLOR.cyan : '#FF4D8D' }]}>
      <Text style={u.tagText}>{d ? 'CEK AWAL' : s ? 'SENILAI' : 'BERBALIK NILAI'}</Text>
    </View>
  );
}

// Ilustrasi objek + keterangan, ditaruh DEKAT teks soal agar tidak bolak-balik mencari informasi.
// Emoji 2D digambar sendiri (assets/emoji/*.png), BUKAN emoji keyboard/font, jadi tampil sama di semua HP.
// Teks di data.js tetap memakai emoji sebagai "kode"; di sini kode itu diganti gambar. Deretan panjang diringkas "gambar x n".
const EMOJI_IMG = {
  0x26FD: require('../../assets/emoji/fuel.png'),
  0x1F3CD: require('../../assets/emoji/motor.png'),
  0x1F477: require('../../assets/emoji/worker.png'),
  0x1F3D7: require('../../assets/emoji/build.png'),
  0x1F327: require('../../assets/emoji/rain.png'),
  0x23F8: require('../../assets/emoji/pause.png'),
  0x1F4D8: require('../../assets/emoji/book.png'),
  0x1F4B0: require('../../assets/emoji/money.png'),
  0x1F9CD: require('../../assets/emoji/person.png'),
  0x1F355: require('../../assets/emoji/pizza.png'),
  0x1F455: require('../../assets/emoji/shirt.png'),
  0x23F1: require('../../assets/emoji/timer.png'),
  0x1F4A8: require('../../assets/emoji/wind.png'),
  0x1F35A: require('../../assets/emoji/rice.png'),
  0x1F9F3: require('../../assets/emoji/luggage.png'),
  0x1F33E: require('../../assets/emoji/grain.png'),
  0x1F371: require('../../assets/emoji/bento.png'),
  0x1F6B0: require('../../assets/emoji/pump.png'),
  0x1F3CA: require('../../assets/emoji/pool.png'),
  0x1F3EB: require('../../assets/emoji/school.png'),
};
function parseRun(str) {
  const cps = Array.from(str.replace(/\uFE0F/g, '').replace(/\s+/g, ''));
  const runs = [];
  cps.forEach((c) => {
    const last = runs[runs.length - 1];
    if (last && last.c === c) last.n += 1; else runs.push({ c, n: 1 });
  });
  return runs;
}
export function Emoji2D({ cp, size = 32, style }) {
  const src = EMOJI_IMG[cp];
  if (!src) return null;
  return <Image source={src} style={[{ width: size, height: size }, style]} resizeMode="contain" />;
}
function PicSide({ str }) {
  return (
    <View style={u.picSide}>
      {parseRun(str).map((r, i) => {
        const cp = r.c.codePointAt(0);
        const src = EMOJI_IMG[cp];
        if (!src) return <Text key={i} style={u.picQ}>{r.c.repeat(r.n)}</Text>;
        return r.n <= 3
          ? <View key={i} style={u.picGroup}>{Array.from({ length: r.n }, (_, k) => <Emoji2D key={k} cp={cp} size={32} style={{ marginHorizontal: 1 }} />)}</View>
          : <View key={i} style={u.picGroup}><Emoji2D cp={cp} size={32} /><Text style={u.picN}>×{r.n}</Text></View>;
      })}
    </View>
  );
}
export function Pic({ rows }) {
  if (!rows || !rows.length) return null;
  return (
    <View style={u.pic}>
      {rows.map((r, i) => {
        const parts = String(r.ic).split(/➜|→/);
        return (
          <View key={i} style={u.picRow}>
            <View style={u.picLine}>
              <PicSide str={parts[0]} />
              {parts.length > 1 && <Tri dir="right" size={9} color={COLOR.cyan} style={{ marginHorizontal: 10 }} />}
              {parts.length > 1 && <PicSide str={parts[1]} />}
            </View>
            <Text style={u.picCap}>{r.cap}</Text>
          </View>
        );
      })}
    </View>
  );
}

// Tabel sederhana
export function SimpleTable({ heads, rows }) {
  return (
    <View style={{ marginTop: 10 }}>
      <View style={u.trow}>{heads.map((h) => <Text key={h} style={u.thead}>{h}</Text>)}</View>
      {rows.map((r, i) => (
        <View key={i} style={u.trow}>{r.map((c, j) => <Text key={j} style={u.tcell}>{c}</Text>)}</View>
      ))}
    </View>
  );
}

function Arrow({ dir }) {
  const t = useLoop(1000, { yoyo: true, easing: Easing.inOut(Easing.sin) });
  const up = dir === 'up';
  const y = t.interpolate({ inputRange: [0, 1], outputRange: up ? [5, -5] : [-5, 5] });
  return (
    <Animated.View style={{ transform: [{ translateY: y }] }}>
      <ArrowV dir={dir} size={30} color={up ? COLOR.cyan : '#FF4D8D'} />
    </Animated.View>
  );
}

// Diagram panah: tiap besaran punya nilai awal, panah naik/turun, nilai akhir
export function ArrowTable({ cols }) {
  return (
    <View style={u.arrows}>
      {cols.map((c) => (
        <View key={c.name} style={u.acol}>
          <Text style={u.aname}>{c.name}</Text>
          <Text style={u.aval}>{fmt(c.v[0])}</Text>
          <Arrow dir={c.dir} />
          <Text style={u.aval}>{fmt(c.v[1])}</Text>
          <Text style={[u.adir, { color: c.dir === 'up' ? COLOR.cyan : '#FF8AB5' }]}>{c.dir === 'up' ? 'NAIK' : 'TURUN'}</Text>
        </View>
      ))}
    </View>
  );
}

const u = StyleSheet.create({
  pic: { marginTop: 12, paddingVertical: 8, paddingHorizontal: 12, backgroundColor: 'rgba(2,12,27,0.55)', borderLeftWidth: 4, borderLeftColor: COLOR.cyan },
  picRow: { paddingVertical: 6 },
  picLine: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
  picSide: { flexDirection: 'row', alignItems: 'center' },
  picGroup: { flexDirection: 'row', alignItems: 'center', marginRight: 2 },
  picN: { color: COLOR.white, fontSize: 15, fontWeight: '800', marginLeft: 4, includeFontPadding: false },
  picQ: { color: COLOR.cyan, fontSize: 20, fontWeight: '900', marginHorizontal: 3, includeFontPadding: false },
  picCap: { color: COLOR.ice, fontSize: 13, fontWeight: '600', marginTop: 3 },
  btn: { alignSelf: 'flex-start', paddingHorizontal: 18, paddingVertical: 8, marginTop: 14, marginRight: 10, transform: [{ skewX: '-12deg' }] },
  btnIn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', transform: [{ skewX: '12deg' }] },
  btnText: { color: COLOR.navy, fontWeight: '900', letterSpacing: 2, fontSize: 13, includeFontPadding: false },
  tag: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 2, marginBottom: 10, transform: [{ skewX: '-12deg' }] },
  tagText: { color: COLOR.navy, fontWeight: '900', fontSize: 11, letterSpacing: 1.5, transform: [{ skewX: '12deg' }] },
  trow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.12)', paddingVertical: 8 },
  thead: { flex: 1, color: COLOR.white, fontWeight: '900', fontSize: 14 },
  tcell: { flex: 1, color: COLOR.text, fontSize: 15 },
  arrows: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 12, paddingVertical: 10, backgroundColor: 'rgba(2,12,27,0.55)', borderWidth: 1, borderColor: 'rgba(0,229,255,0.35)' },
  acol: { alignItems: 'center', flex: 1 },
  aname: { color: COLOR.ice, fontWeight: '900', fontSize: 12, letterSpacing: 1, marginBottom: 6, textAlign: 'center' },
  aval: { color: COLOR.white, fontWeight: '900', fontSize: 20, fontStyle: 'italic' },
  adir: { fontWeight: '900', fontSize: 11, letterSpacing: 2, marginTop: 4 },
});

// Teks soal dengan kata kunci disorot (on = true)
export function Highlight({ text, words = [], on = false, style }) {
  if (!on || !words.length) return <Text style={style}>{text}</Text>;
  const esc = words.map((w) => w.replace(/[.*+?^${}()|[\]\\\/]/g, '\\$&')).sort((a, b) => b.length - a.length);
  const parts = text.split(new RegExp('(' + esc.join('|') + ')', 'gi'));
  return (
    <Text style={style}>
      {parts.map((t, i) => (i % 2 === 1 ? <Text key={i} style={{ backgroundColor: '#FFD400', color: COLOR.navy, fontWeight: '900' }}>{t}</Text> : t))}
    </Text>
  );
}
