import React, { useEffect, useRef, useState } from 'react';
import { View, Pressable, Animated, Easing, StyleSheet, useWindowDimensions } from 'react-native';
import Text from '../components/Txt';
import { COLOR } from '../theme';
import { MENU } from '../config';
import { useChar } from '../CharacterContext';
import AnimatedBackground from '../components/AnimatedBackground';
import Character from '../components/Character';
import LobbyMenu from '../components/LobbyMenu';
import StatusCard from '../components/StatusCard';
import { QUESTIONS } from '../data';
import { xpOf, levelOf, LEVEL_STEP } from '../trophies';

// Petunjuk menu: teks rapi bergaris bawah (seperti menu P3R) di atas pita gelap miring.
// Latar miring digambar terpisah, jadi teks sendiri tidak ikut miring/blur. Isi bergeser halus saat ganti menu.
function HintChip({ text, band, big, style }) {
  const a = useRef(new Animated.Value(1)).current;
  const [shown, setShown] = useState(text);
  useEffect(() => {
    if (text === shown) return undefined;
    Animated.timing(a, { toValue: 0, duration: 90, easing: Easing.in(Easing.quad), useNativeDriver: true }).start(() => {
      setShown(text);
      Animated.timing(a, { toValue: 1, duration: 220, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
    });
    return undefined;
  }, [text]); // eslint-disable-line react-hooks/exhaustive-deps
  const tx = a.interpolate({ inputRange: [0, 1], outputRange: [-10, 0] });
  return (
    <View pointerEvents="none" style={[s.chip, style]}>
      <View style={[s.chipBg, { borderLeftColor: band }]} />
      <Animated.View style={{ opacity: a, transform: [{ translateX: tx }] }}>
        <Text numberOfLines={1} style={[s.chipMain, big && { fontSize: 24 }]}>{shown}</Text>
        <View style={s.chipLine} />
        <Text style={s.chipCmd}>COMMAND</Text>
      </Animated.View>
    </View>
  );
}

export default function Lobby({ onNavigate, onMenuOpen, user, onLogout, progress = {}, profile = {} }) {
  const ch = useChar();
  const CHARACTER_CREDIT = ch.credit;
  const { width: W, height: H } = useWindowDimensions();
  const land = W > H;
  const [sel, setSel] = useState(0);
  const lv = levelOf(xpOf(progress));
  const hpV = lv.maxed ? LEVEL_STEP : Math.round(lv.frac * LEVEL_STEP);          // HP = XP di level ini
  const spV = QUESTIONS.filter((q) => progress[q.id]).length;                      // SP = misi latihan selesai

  // Lanskap (laptop/tablet) dan potret (HP) punya ukuran sendiri.
  const panelW = land ? W * 0.36 : W * 0.30;
  const n = MENU.length;
  const menuTop = land ? Math.max(H * 0.22, 130) : Math.max(H * 0.17, 132);   // di bawah kartu status, dengan jarak napas
  // ukuran font menyesuaikan tinggi layar yang tersisa: 6 menu tetap muat dan tidak berdesakan
  const availH = H - menuTop - (land ? 90 : 190);          // sisakan ruang untuk chip petunjuk + kredit di bawah
  const fsMax = land ? Math.min(W * 0.06, 50) : Math.min(W * 0.08, 40);
  const fs = Math.max(22, Math.min(fsMax, availH / (n * (land ? 1.3 : 1.55))));
  const gap = land ? fs * 0.12 : fs * 0.34;                  // jarak antar menu lebih lega (area sentuh lebih besar di HP)
  const pitch = fs * 1.11 + gap;
  const menuLeft = land ? W * 0.42 : W * 0.375;

  // Potret: karakter besar berdiri di depan panel putih, wajahnya sekitar 36% lebar layar.
  const face = 0.83;                                         // posisi wajah di gambar (pecahan lebar)
  const cH = land ? H * 0.88 : H * 0.9;
  const cW = land ? panelW * 1.2 : W * 1.2;
  const cLeft = land ? -panelW * 0.04 : W * 0.36 - face * cW;

  return (
    <View style={s.root}>
      <AnimatedBackground variant="sea" />

      {/* panel putih miring */}
      <View style={{ position: 'absolute', top: -20, bottom: -20, left: -panelW * 0.15, width: panelW * 1.15, backgroundColor: '#fff', transform: [{ skewX: '-6deg' }] }} />

      <Character
        width={cW} height={cH} aura fromLeft auraFace
        style={{ position: 'absolute', left: cLeft, bottom: 0 }}
      />

      {/* kartu status pemain (HP = XP level, SP = misi selesai), gaya HUD Persona 3 Reload */}
      {user ? (
        <View style={s.user}>
          <StatusCard
            name={user} avatar={profile.avatar || ch.avatar} level={lv.level} arcana={lv.name}
            hp={{ v: hpV, m: LEVEL_STEP }} sp={{ v: spV, m: QUESTIONS.length }}
            band={ch.band} edge={ch.edge} compact width={land ? 270 : Math.min(W * 0.68, 250)}
            onPress={() => onNavigate('PROFIL')}
          />
        </View>
      ) : null}

      {/* kredit karakter (hak cipta milik ATLUS / SEGA) */}
      <View pointerEvents="none" style={s.credit}>
        <View style={[s.creditBar, { backgroundColor: ch.band, borderRightColor: ch.edge }]} />
        <View style={s.creditBody}>
          <Text style={s.creditLabel}>{CHARACTER_CREDIT.label}</Text>
          <Text style={s.creditName}>{CHARACTER_CREDIT.name}</Text>
          <Text style={s.creditOwner}>{CHARACTER_CREDIT.owner}  {'\u25C6'}  {CHARACTER_CREDIT.game}</Text>
        </View>
      </View>

      {/* menu */}
      <View style={{ position: 'absolute', left: menuLeft, top: menuTop }}>
        <LobbyMenu band={ch.band} edge={ch.edge} items={MENU} selected={sel} onSelect={setSel} fontSize={fs} gap={gap} onOpen={(it) => { if (!it.screen) return; onMenuOpen && onMenuOpen(it); onNavigate(it.screen); }} />
      </View>

      {/* petunjuk perintah: chip kecil tepat di bawah menu (HP) / kanan bawah (lanskap) */}
      <HintChip
        text={MENU[sel].sub}
        band={ch.band}
        big={land}
        style={land ? s.hint : { position: 'absolute', left: menuLeft + fs * 0.35, top: Math.min(menuTop + pitch * n + fs * 0.35, H - 150), maxWidth: W * 0.58 }}
      />
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLOR.bg, overflow: 'hidden' },
  user: { position: 'absolute', top: 12, left: 14, zIndex: 6 },
  credit: { position: 'absolute', left: 14, bottom: 12, opacity: 0.92, flexDirection: 'row', alignItems: 'stretch', backgroundColor: 'rgba(3,26,74,0.88)', borderWidth: 1.5, borderColor: COLOR.cyan, transform: [{ skewX: '-12deg' }] },
  creditBar: { width: 7, backgroundColor: '#FF1A1A', borderRightWidth: 3, borderRightColor: '#FF8AD8' },
  creditBody: { paddingHorizontal: 10, paddingVertical: 5 },
  creditLabel: { color: COLOR.cyan, fontSize: 8, fontWeight: '900', letterSpacing: 2.5 },
  creditName: { color: '#fff', fontSize: 15, fontWeight: '900', fontStyle: 'italic', letterSpacing: 0.5, marginTop: 1 },
  creditOwner: { color: COLOR.ice, fontSize: 10, fontWeight: '700', marginTop: 1 },
  hint: { position: 'absolute', right: 22, bottom: 22 },
  chip: { paddingLeft: 20, paddingRight: 22, paddingTop: 6, paddingBottom: 6 },
  chipBg: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(3,26,74,0.72)', borderLeftWidth: 4, transform: [{ skewX: '-12deg' }] },
  chipMain: { color: '#fff', fontSize: 15, fontWeight: '800', letterSpacing: 0.3, includeFontPadding: false },
  chipLine: { height: 1, backgroundColor: 'rgba(255,255,255,0.8)', marginTop: 5 },
  chipCmd: { color: COLOR.cyan, fontSize: 9, fontWeight: '800', letterSpacing: 2.5, marginTop: 3, includeFontPadding: false },
});
