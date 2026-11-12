import React from 'react';
import { View, StyleSheet } from 'react-native';
import Text from './Txt';
import { COLOR } from '../theme';
import { Tri } from './Glyph';
import { Meter, PressScale } from './Fx';
import { sfx } from '../audio';

// ============================================================
//  P3 KIT: potongan UI bergaya menu Persona 3 Reload
//  Ciri yang dipakai: panel miring, pita merah di belakang, garis putih tipis,
//  angka raksasa transparan sebagai hiasan, teks italic tebal huruf besar.
//  Semua hanya View + Text (tanpa library), animasi hanya transform/opacity.
// ============================================================
export const RED = '#FF1A1A';
export const PINK = '#FF8AD8';
export const GOLD = '#FFD400';

// '#RRGGBB' + 0..1 -> 'rgba(...)'
export const alpha = (hex, a) => {
  const h = String(hex).replace('#', '');
  if (h.length !== 6) return hex;
  const n = parseInt(h, 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
};

// Angka / huruf raksasa transparan di belakang konten (hiasan)
export function Ghost({ children, color = '#FFFFFF', size = 72, opacity = 0.07, style }) {
  return (
    <Text pointerEvents="none" numberOfLines={1} style={[{ position: 'absolute', color, opacity, fontSize: size, lineHeight: size * 1.05, fontWeight: '900', fontStyle: 'italic', letterSpacing: -1, includeFontPadding: false }, style]}>
      {children}
    </Text>
  );
}

// Label kecil dengan garis miring di kiri: "// TEKS"
export function Kicker({ children, color = COLOR.cyan, style }) {
  return (
    <View style={[k.kick, style]}>
      <View style={[k.kickBar, { backgroundColor: color }]} />
      <View style={[k.kickBar, { backgroundColor: color, opacity: 0.45, marginLeft: 3 }]} />
      <Text style={[k.kickT, { color }]}>{children}</Text>
    </View>
  );
}

// Pita judul bagian: teks putih di atas pita miring merah + garis
export function Ribbon({ children, color = RED, textColor = '#fff', style }) {
  return (
    <View style={[k.rib, style]}>
      <View style={[k.ribBg, { backgroundColor: color }]} />
      <Text style={[k.ribT, { color: textColor }]}>{children}</Text>
    </View>
  );
}

// Chip kecil miring
export function Chip({ label, color = COLOR.cyan, solid = true, style }) {
  return (
    <View style={[k.chip, solid ? { backgroundColor: color } : { borderWidth: 1.5, borderColor: color }, style]}>
      <Text style={[k.chipT, { color: solid ? COLOR.navy : color }]}>{label}</Text>
    </View>
  );
}

// Panel miring. Latar saja yang miring; isi tetap tegak sehingga teks tajam.
export function Slab({ color = COLOR.cyan, fill = 'rgba(3,26,74,0.9)', skew = -7, shadow = true, children, style, bar = 6 }) {
  return (
    <View style={[{ position: 'relative' }, style]}>
      {shadow && <View pointerEvents="none" style={[k.slabShadow, { backgroundColor: alpha(color, 0.35), transform: [{ skewX: `${skew}deg` }] }]} />}
      <View pointerEvents="none" style={[k.slabBg, { backgroundColor: fill, borderColor: alpha(color, 0.9), transform: [{ skewX: `${skew}deg` }] }]}>
        {bar > 0 && <View style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: bar, backgroundColor: color }} />}
      </View>
      {children}
    </View>
  );
}

// Baris menu bergaya pause menu P3R: nomor besar transparan, judul italic, bar progres, panah.
//  - selected / done ikut mengubah tampilan; onPress memutar sfx 'select'
export function MenuRow({ no, title, sub, color = COLOR.cyan, frac, meta, tag, done, locked, onPress, delay = 0, right, style }) {
  return (
    <PressScale onPress={() => { sfx('select'); onPress && onPress(); }} to={0.97} disabled={locked} style={[{ marginBottom: 14, opacity: locked ? 0.5 : 1 }, style]}>
      <Slab color={color} skew={-6}>
        <View style={k.rowIn}>
          {no != null && <Ghost size={64} color={color} opacity={0.16} style={{ right: 44, top: -4 }}>{no}</Ghost>}
          <View style={{ flex: 1 }}>
            <View style={k.rowTop}>
              <Text style={[k.rowTitle, { color: '#fff' }]} numberOfLines={2}>{title}</Text>
              {tag ? <Chip label={tag} color={GOLD} style={{ marginLeft: 8 }} /> : null}
            </View>
            {sub ? <Text style={k.rowSub} numberOfLines={3}>{sub}</Text> : null}
            {frac != null && <View style={{ marginTop: 9 }}><Meter to={Math.max(0, Math.min(1, frac))} color={color} height={6} delay={delay + 150} /></View>}
            {meta ? <Text style={[k.rowMeta, { color }]}>{meta}</Text> : null}
          </View>
          <View style={k.rowGo}>
            {right || (done
              ? <View style={[k.doneDot, { backgroundColor: color }]}><View style={k.doneTick} /></View>
              : <Tri dir="right" size={11} color={color} />)}
          </View>
        </View>
      </Slab>
    </PressScale>
  );
}

// Tombol tab miring (horizontal), dipakai di Lab / Progres / Materi
export function TabBtn({ label, on, color = COLOR.cyan, onPress, style, flex = true, small = false }) {
  return (
    <PressScale onPress={() => { sfx('click'); onPress && onPress(); }} to={0.94} style={[flex && { flex: 1 }, { marginRight: 6 }, style]}>
      <View style={[k.tab, { borderColor: color }, on && { backgroundColor: color }]}>
        <Text numberOfLines={1} style={[k.tabT, small && { fontSize: 10, letterSpacing: 0.4 }, { color: on ? COLOR.navy : '#fff' }]}>{label}</Text>
      </View>
    </PressScale>
  );
}

const k = StyleSheet.create({
  kick: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  kickBar: { width: 4, height: 13, transform: [{ skewX: '-20deg' }] },
  kickT: { marginLeft: 8, fontSize: 11, fontWeight: '900', letterSpacing: 3, includeFontPadding: false },
  rib: { alignSelf: 'flex-start', paddingHorizontal: 16, paddingVertical: 3, marginBottom: 12 },
  ribBg: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, transform: [{ skewX: '-14deg' }] },
  ribT: { fontSize: 14, fontWeight: '900', fontStyle: 'italic', letterSpacing: 2, includeFontPadding: false },
  chip: { paddingHorizontal: 8, paddingVertical: 1, transform: [{ skewX: '-12deg' }] },
  chipT: { fontSize: 9, fontWeight: '900', letterSpacing: 1.5, includeFontPadding: false },
  slabShadow: { position: 'absolute', left: 6, right: -6, top: 6, bottom: -6 },
  slabBg: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, borderWidth: 1.5, overflow: 'hidden' },
  rowIn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 13, paddingLeft: 22, paddingRight: 16, overflow: 'hidden' },
  rowTop: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
  rowTitle: { fontSize: 17, fontWeight: '900', fontStyle: 'italic', letterSpacing: 0.5, textTransform: 'uppercase', flexShrink: 1 },
  rowSub: { color: COLOR.ice, opacity: 0.85, fontSize: 12, lineHeight: 18, marginTop: 4 },
  rowMeta: { fontSize: 10, fontWeight: '900', letterSpacing: 1.5, marginTop: 6 },
  rowGo: { marginLeft: 12, minWidth: 18, alignItems: 'center', justifyContent: 'center' },
  doneDot: { width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  doneTick: { width: 6, height: 11, borderRightWidth: 2.5, borderBottomWidth: 2.5, borderColor: COLOR.navy, transform: [{ rotate: '45deg' }], marginTop: -2 },
  tab: { borderWidth: 2, paddingVertical: 8, paddingHorizontal: 4, alignItems: 'center', backgroundColor: 'rgba(2,12,27,0.7)', transform: [{ skewX: '-12deg' }] },
  tabT: { fontSize: 11, fontWeight: '900', letterSpacing: 1.5, includeFontPadding: false, transform: [{ skewX: '12deg' }] },
});
