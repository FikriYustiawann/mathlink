import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import Text from './Txt';
import { COLOR } from '../theme';
import { TrophyBadge } from './Trophy';
import { QUESTIONS } from '../data';
import { TROPHIES, TIER, RANK_COLOR, RANK_TITLE, rankOf, LEVEL_STEP } from '../trophies';

// ============================================================
//  KARTU PROFIL (SHARE) ala halaman profil Steam, bertema Persona 3 Reload
//  Ukuran tetap 360 x 680 (dipotret jadi PNG oleh ViewShot di Profil.js).
//  Isi: banner + avatar + level, XP, statistik, SHOWCASE 3 trophy pilihan,
//  koleksi seluruh trophy, sebaran rank misi.
// ============================================================
export const CARD_W = 360;
export const CARD_H = 680;
const TIER_ORDER = { platinum: 4, gold: 3, silver: 2, bronze: 1 };

// Trophy untuk showcase: pilihan pengguna (maks 3) yang masih terbuka, sisanya diisi otomatis
// dari trophy paling langka lalu yang paling baru dibuka.
export function pickShowcase(have, chosen = []) {
  const open = TROPHIES.filter((t) => have[t.id]);
  const picked = chosen.map((id) => open.find((t) => t.id === id)).filter(Boolean).slice(0, 3);
  if (picked.length >= 3) return picked;
  const rest = open
    .filter((t) => !picked.includes(t))
    .sort((a, b) => (TIER_ORDER[b.tier] - TIER_ORDER[a.tier]) || (have[b.id] - have[a.id]));
  return [...picked, ...rest].slice(0, 3);
}

function Slash({ style, color, op = 1 }) {
  return <View style={[{ position: 'absolute', backgroundColor: color, opacity: op, transform: [{ rotate: '-12deg' }] }, style]} />;
}

function Head({ children, color = '#FF1A1A' }) {
  return (
    <View style={c.head}>
      <View style={[c.headBg, { backgroundColor: color }]} />
      <Text style={c.headT}>{children}</Text>
      <View style={c.headLine} />
    </View>
  );
}

export default function ShareCard({ user, avatar, banner, lv, xp, progress, showcase = [], extra = {} }) {
  const have = progress._trophies || {};
  const unlockedN = Object.keys(have).length;
  const sc = pickShowcase(have, showcase);
  const played = QUESTIONS.filter((q) => progress[q.id]);
  const ranks = { S: 0, A: 0, B: 0, C: 0 };
  played.forEach((q) => { const p = progress[q.id]; const r = rankOf((p.best ?? p.score) / p.max); if (ranks[r] != null) ranks[r] += 1; });
  const topRank = ['S', 'A', 'B', 'C'].find((r) => ranks[r] > 0);
  const gamesPlayed = Object.keys(progress.games || {}).length + (progress.game ? 1 : 0);
  const tierCount = (k) => TROPHIES.filter((t) => t.tier === k && have[t.id]).length;
  const tierTotal = (k) => TROPHIES.filter((t) => t.tier === k).length;
  const toNext = lv.maxed ? 'MAX LEVEL' : `${LEVEL_STEP - Math.round(lv.frac * LEVEL_STEP)} XP KE LV ${lv.level + 1}`;
  const today = (() => { try { return new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }); } catch (e) { return ''; } })();

  return (
    <View style={c.card}>
      {/* ===== banner ===== */}
      <View style={c.banner}>
        <Image source={banner && banner.src ? banner.src : banner} style={c.bannerImg} />
        <View style={[c.shade, { top: 0, height: 150, backgroundColor: 'rgba(2,12,27,0.38)' }]} />
        <View style={[c.shade, { top: 80, height: 70, backgroundColor: 'rgba(2,12,27,0.4)' }]} />
        <View style={[c.shade, { top: 112, height: 38, backgroundColor: 'rgba(2,12,27,0.55)' }]} />
        <Slash color="#FF1A1A" op={0.95} style={{ left: -40, top: 116, width: 300, height: 24 }} />
        <Slash color={COLOR.cyan} style={{ left: -40, top: 138, width: 330, height: 5 }} />
        <Text style={c.ghost}>DARK HOUR</Text>
        <View style={c.tagTL}><Text style={c.tagTLT}>MATH P3R</Text></View>
        <Text style={c.tagTR}>PLAYER CARD</Text>
      </View>

      {/* ===== avatar + nama ===== */}
      <View style={c.idRow}>
        <View style={c.avBox}>
          <View style={c.avShadow} />
          <View style={c.avFrame}><Image source={avatar} style={c.avImg} /></View>
          <View style={c.lvBadge}><Text style={c.lvBadgeL}>LV</Text><Text style={c.lvBadgeN}>{lv.level}</Text></View>
        </View>
        <View style={{ flex: 1, marginLeft: 16, paddingBottom: 2 }}>
          <Text numberOfLines={1} style={c.name}>{String(user || 'PLAYER').toUpperCase()}</Text>
          <View style={c.arcRow}>
            <View style={c.arcBar} />
            <Text style={c.arcT}>{lv.name}  {lv.num}</Text>
          </View>
          {topRank ? (
            <View style={[c.titleChip, { backgroundColor: RANK_COLOR[topRank] }]}>
              <Text style={c.titleChipT}>{RANK_TITLE[topRank]}</Text>
            </View>
          ) : null}
        </View>
      </View>

      <View style={c.body}>
        {/* ===== XP ===== */}
        <View style={c.xpRow}>
          <Text style={c.xpBig}>{xp}<Text style={c.xpUnit}> XP</Text></Text>
          <Text style={c.xpNext}>{toNext}</Text>
        </View>
        <View style={c.meter}><View style={[c.meterFill, { width: `${Math.round(lv.frac * 100)}%` }]} /></View>

        {/* ===== statistik ===== */}
        <View style={c.stats}>
          {[['MISI', `${played.length}/${QUESTIONS.length}`, COLOR.cyan], ['GAME', String(gamesPlayed), '#FF8AD8'], ['TROPHY', `${unlockedN}/${TROPHIES.length}`, '#FFC83D'], ['PETUNJUK', `${extra.hints || 0}×`, '#fff']].map(([l, v, col]) => (
            <View key={l} style={c.stat}>
              <Text style={c.statL}>{l}</Text>
              <Text style={[c.statV, { color: col }]}>{v}</Text>
            </View>
          ))}
        </View>

        {/* ===== showcase ===== */}
        <Head color="#FF1A1A">SHOWCASE TROPHY</Head>
        <View style={c.showRow}>
          {[0, 1, 2].map((i) => {
            const t = sc[i];
            const col = t ? TIER[t.tier].color : '#3B4A7A';
            return (
              <View key={i} style={[c.showCell, { borderColor: col }]}>
                <View style={[c.showTop, { backgroundColor: col }]} />
                {t ? <TrophyBadge t={t} unlocked size={54} shine={false} /> : <TrophyBadge t={TROPHIES[0]} unlocked={false} size={54} shine={false} />}
                <Text numberOfLines={2} style={[c.showName, !t && { opacity: 0.4 }]}>{t ? t.name : 'BELUM ADA'}</Text>
                <Text style={[c.showTier, { color: col }]}>{t ? TIER[t.tier].label : '???'}</Text>
              </View>
            );
          })}
        </View>

        {/* ===== koleksi ===== */}
        <Head color={COLOR.blue}>KOLEKSI TROPHY</Head>
        <View style={c.grid}>
          {TROPHIES.map((t) => {
            const on = !!have[t.id];
            return (
              <View key={t.id} style={c.gridCell}>
                <TrophyBadge t={t} unlocked={on} size={28} shine={false} />
              </View>
            );
          })}
        </View>
        <View style={c.tierRow}>
          {Object.keys(TIER).map((k) => (
            <View key={k} style={c.tierItem}>
              <View style={[c.tierDot, { backgroundColor: TIER[k].color }]} />
              <Text style={c.tierT}>{tierCount(k)}/{tierTotal(k)}</Text>
            </View>
          ))}
        </View>

        {/* ===== rank misi ===== */}
        <View style={c.rankRow}>
          <Text style={c.rankLbl}>RANK MISI</Text>
          {['S', 'A', 'B', 'C'].map((r) => (
            <View key={r} style={[c.rankChip, { backgroundColor: ranks[r] ? RANK_COLOR[r] : '#16224F' }]}>
              <Text style={[c.rankChipT, { color: ranks[r] ? COLOR.navy : '#3B4A7A' }]}>{r}  ×{ranks[r]}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* ===== kaki ===== */}
      <View style={c.foot}>
        <Slash color="#FF1A1A" op={0.9} style={{ left: -30, bottom: -14, width: 440, height: 40 }} />
        <Text style={c.footT}>PERBANDINGAN SENILAI & BERBALIK NILAI</Text>
        <Text style={c.footS}>{today}   ·   ART © ATLUS / SEGA</Text>
      </View>
    </View>
  );
}

const c = StyleSheet.create({
  card: { width: CARD_W, height: CARD_H, backgroundColor: '#020C1B', overflow: 'hidden', borderWidth: 3, borderColor: COLOR.cyan },
  banner: { height: 150, overflow: 'hidden', backgroundColor: '#0AA5E8' },
  bannerImg: { position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', resizeMode: 'cover' },
  shade: { position: 'absolute', left: 0, right: 0 },
  ghost: { position: 'absolute', right: -8, top: 18, color: 'rgba(255,255,255,0.14)', fontSize: 58, fontWeight: '900', fontStyle: 'italic', letterSpacing: 1 },
  tagTL: { position: 'absolute', left: 12, top: 12, backgroundColor: '#fff', paddingHorizontal: 10, paddingVertical: 2, transform: [{ skewX: '-12deg' }] },
  tagTLT: { color: COLOR.navy, fontSize: 11, fontWeight: '900', fontStyle: 'italic', letterSpacing: 2, transform: [{ skewX: '12deg' }] },
  tagTR: { position: 'absolute', right: 12, top: 14, color: '#fff', fontSize: 9, fontWeight: '900', letterSpacing: 3, opacity: 0.85 },

  idRow: { flexDirection: 'row', alignItems: 'flex-end', marginTop: -50, paddingHorizontal: 18 },
  avBox: { width: 108, height: 108 },
  avShadow: { position: 'absolute', left: 8, top: 8, width: 100, height: 100, backgroundColor: '#FF1A1A', transform: [{ skewX: '-8deg' }] },
  avFrame: { width: 100, height: 100, borderWidth: 3, borderColor: '#fff', backgroundColor: COLOR.navy, overflow: 'hidden', transform: [{ skewX: '-8deg' }] },
  avImg: { width: 146, height: 146, marginLeft: -22, marginTop: -8, transform: [{ skewX: '8deg' }], resizeMode: 'cover' },
  lvBadge: { position: 'absolute', right: -6, bottom: -8, flexDirection: 'row', alignItems: 'baseline', backgroundColor: COLOR.cyan, borderWidth: 2.5, borderColor: '#fff', paddingHorizontal: 8, paddingVertical: 1, transform: [{ skewX: '-12deg' }] },
  lvBadgeL: { color: COLOR.navy, fontSize: 10, fontWeight: '900', letterSpacing: 1, includeFontPadding: false },
  lvBadgeN: { color: COLOR.navy, fontSize: 22, fontWeight: '900', fontStyle: 'italic', marginLeft: 3, includeFontPadding: false },
  name: { color: '#fff', fontSize: 28, fontWeight: '900', fontStyle: 'italic', letterSpacing: 0.5, textShadowColor: '#FF1A1A', textShadowOffset: { width: 2, height: 2 }, textShadowRadius: 0, includeFontPadding: false },
  arcRow: { flexDirection: 'row', alignItems: 'center', marginTop: 3 },
  arcBar: { width: 4, height: 12, backgroundColor: COLOR.cyan, marginRight: 7, transform: [{ skewX: '-20deg' }] },
  arcT: { color: COLOR.cyan, fontSize: 11, fontWeight: '900', letterSpacing: 3, includeFontPadding: false },
  titleChip: { alignSelf: 'flex-start', marginTop: 7, paddingHorizontal: 10, paddingVertical: 2, transform: [{ skewX: '-12deg' }] },
  titleChipT: { color: COLOR.navy, fontSize: 9, fontWeight: '900', letterSpacing: 1.5, transform: [{ skewX: '12deg' }] },

  body: { paddingHorizontal: 18, marginTop: 16 },
  xpRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  xpBig: { color: '#fff', fontSize: 24, fontWeight: '900', fontStyle: 'italic', includeFontPadding: false },
  xpUnit: { color: COLOR.ice, fontSize: 12 },
  xpNext: { color: COLOR.ice, fontSize: 10, fontWeight: '900', letterSpacing: 1.5 },
  meter: { height: 9, backgroundColor: 'rgba(255,255,255,0.16)', marginTop: 5, marginBottom: 12, transform: [{ skewX: '-20deg' }] },
  meterFill: { height: '100%', backgroundColor: COLOR.cyan },
  stats: { flexDirection: 'row', marginBottom: 12 },
  stat: { flex: 1, marginRight: 6, paddingVertical: 6, alignItems: 'center', backgroundColor: 'rgba(3,26,74,0.9)', borderWidth: 1, borderBottomWidth: 3, borderColor: 'rgba(0,229,255,0.5)', transform: [{ skewX: '-8deg' }] },
  statL: { color: COLOR.ice, fontSize: 8, fontWeight: '900', letterSpacing: 1.5 },
  statV: { fontSize: 16, fontWeight: '900', fontStyle: 'italic', marginTop: 1, includeFontPadding: false },

  head: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  headBg: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 150, transform: [{ skewX: '-14deg' }] },
  headT: { color: '#fff', fontSize: 11, fontWeight: '900', fontStyle: 'italic', letterSpacing: 2.5, paddingHorizontal: 10, paddingVertical: 3 },
  headLine: { flex: 1, height: 1.5, marginLeft: 80, backgroundColor: 'rgba(191,239,255,0.35)' },

  showRow: { flexDirection: 'row', marginBottom: 12 },
  showCell: { flex: 1, marginRight: 6, alignItems: 'center', paddingBottom: 7, backgroundColor: 'rgba(3,22,62,0.95)', borderWidth: 1.5 },
  showTop: { alignSelf: 'stretch', height: 3, marginBottom: 6 },
  showName: { color: '#fff', fontSize: 9, fontWeight: '900', textAlign: 'center', marginTop: 4, minHeight: 22, paddingHorizontal: 4 },
  showTier: { fontSize: 8, fontWeight: '900', letterSpacing: 2, marginTop: 2 },

  grid: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 4 },
  gridCell: { width: `${100 / 10}%`, alignItems: 'center', marginBottom: 4 },
  tierRow: { flexDirection: 'row', marginBottom: 8 },
  tierItem: { flexDirection: 'row', alignItems: 'center', marginRight: 16 },
  tierDot: { width: 9, height: 9, marginRight: 5, transform: [{ rotate: '45deg' }] },
  tierT: { color: COLOR.ice, fontSize: 11, fontWeight: '900' },
  rankRow: { flexDirection: 'row', alignItems: 'center' },
  rankLbl: { color: COLOR.cyan, fontSize: 9, fontWeight: '900', letterSpacing: 2, marginRight: 8 },
  rankChip: { paddingHorizontal: 8, paddingVertical: 2, marginRight: 5, transform: [{ skewX: '-12deg' }] },
  rankChipT: { fontSize: 10, fontWeight: '900', fontStyle: 'italic', transform: [{ skewX: '12deg' }] },

  foot: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 46, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  footT: { color: '#fff', fontSize: 9, fontWeight: '900', letterSpacing: 2.5 },
  footS: { color: 'rgba(255,255,255,0.85)', fontSize: 8, fontWeight: '800', letterSpacing: 1.5, marginTop: 2 },
});
