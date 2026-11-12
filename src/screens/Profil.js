import React, { useRef, useState } from 'react';
import { View, Image, Pressable, StyleSheet, useWindowDimensions, Modal, Alert, Platform, ScrollView } from 'react-native';
import Text from '../components/Txt';
import ViewShot from 'react-native-view-shot';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import { COLOR } from '../theme';
import PageShell, { Card } from '../components/PageShell';
import { Rise, Pop, Meter, CountUp } from '../components/Fx';
import { TrophyBadge } from '../components/Trophy';
import { QUESTIONS } from '../data';
import { useChar } from '../CharacterContext';
import Banner from '../components/Banner';
import { TROPHIES, TIER, xpOf, levelOf, rankOf, RANK_COLOR, LEVEL_STEP } from '../trophies';
import { PROFILE_CHARACTERS } from '../config';
import { sfx } from '../audio';
import ShareCard, { CARD_W, CARD_H, pickShowcase } from '../components/ShareCard';
import { Ribbon, Kicker } from '../components/P3';

const fmtDate = (ts) => {
  try { return new Date(ts).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }); } catch (e) { return ''; }
};

function Stat({ label, value, sub, color = COLOR.white, delay }) {
  return (
    <Rise delay={delay} from={14} style={s.stat}>
      <Text style={s.statL}>{label}</Text>
      <Text style={[s.statV, { color }]}>{value}{sub ? <Text style={s.statS}>{sub}</Text> : null}</Text>
    </Rise>
  );
}

export default function Profil({ onBack, progress, user, profile, onProfileChange }) {
  const ch = useChar();
  const AVATAR_IMAGE = profile?.avatar || ch.avatar;
  const BANNER = profile?.banner || ch.profile;
  const shotRef = useRef(null);
  const [editOpen, setEditOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const { width: W } = useWindowDimensions();
  const [sel, setSel] = useState(null);
  const have = progress._trophies || {};
  const xp = xpOf(progress);
  const lv = levelOf(xp);
  const cols = W >= 640 ? 5 : 3;

  const played = QUESTIONS.filter((q) => progress[q.id]);
  const best = QUESTIONS.reduce((a, q) => a + (progress[q.id] ? (progress[q.id].best ?? progress[q.id].score) : 0), 0);
  const bestMax = QUESTIONS.reduce((a, q) => a + q.steps.length * 2, 0);
  const hints = played.reduce((a, q) => a + (progress[q.id].hints || 0), 0);
  const frac = bestMax ? best / bestMax : 0;
  const unlockedN = Object.keys(have).length;
  const selT = sel ? TROPHIES.find((t) => t.id === sel) : null;
  const chosen = (profile && profile.showcase) || [];
  const showcase = pickShowcase(have, chosen);
  const { height: Hs } = useWindowDimensions();
  const cardScale = Math.max(0.5, Math.min(1.1, (W - 70) / CARD_W));
  const toggleShow = (id) => {
    sfx('click');
    const cur = chosen.filter((x) => have[x]);
    const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id].slice(-3);
    onProfileChange?.({ showcase: next });
  };

  return (
    <PageShell title="Profile" onBack={onBack}>
      {/* banner + avatar */}
      <Banner kind="profile" ratio={3.4} char={{ ...ch, profile: BANNER }} />
      <View style={s.idRow}>
        <Pop delay={150}>
          <Image source={AVATAR_IMAGE} style={s.avatar} />
        </Pop>
        <Rise delay={300} axis="x" from={-20} style={s.lvWrap}>
          <View style={s.lvTag}><Text style={s.lvTagT}>LV {lv.level}</Text></View>
          <Text style={s.arcana}>{lv.name}  {lv.num}</Text>
        </Rise>
      </View>
      <Text style={s.name} numberOfLines={1}>{user || 'PLAYER'}</Text>

      <View style={s.profileActions}>
        <Pressable onPress={() => { sfx('select'); setEditOpen(true); }} style={s.actionBtn}><Text style={s.actionT}>EDIT PROFILE</Text></Pressable>
        <Pressable onPress={() => { sfx('select'); setShareOpen(true); }} style={[s.actionBtn, s.shareBtn]}><Text style={s.actionT}>SHARE PROFILE</Text></Pressable>
      </View>

      <Ribbon>SHOWCASE</Ribbon>
      <View style={s.showRow}>
        {[0, 1, 2].map((i) => {
          const t = showcase[i];
          const col = t ? TIER[t.tier].color : '#3B4A7A';
          return (
            <Pressable key={i} onPress={() => t && setSel(t.id)} style={[s.showCell, { borderColor: col }]}>
              <View style={{ height: 3, alignSelf: 'stretch', backgroundColor: col, marginBottom: 6 }} />
              <TrophyBadge t={t || TROPHIES[0]} unlocked={!!t} size={60} />
              <Text numberOfLines={2} style={[s.showName, !t && { opacity: 0.4 }]}>{t ? t.name : 'BELUM ADA'}</Text>
            </Pressable>
          );
        })}
      </View>

      <Card title="Experience" accent={COLOR.ice}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
          <Text style={s.xpT}>{xp} XP</Text>
          <Text style={s.xpN}>{lv.maxed ? 'MAX LEVEL' : `${LEVEL_STEP - Math.round(lv.frac * LEVEL_STEP)} XP to Lv ${lv.level + 1}`}</Text>
        </View>
        <Meter from={0} to={lv.frac} height={14} delay={300} />
        <Text style={s.hintT}>XP comes from your best score on each problem, correct classification rounds, and every trophy.</Text>
      </Card>

      <View style={s.statRow}>
        <Stat label="PROBLEMS PLAYED" value={played.length} sub={` / ${QUESTIONS.length}`} delay={200} color={COLOR.cyan} />
        <Stat label="BEST SCORE" value={best} sub={` / ${bestMax}`} delay={280} color="#FFC83D" />
        <Stat label="TROPHY" value={unlockedN} sub={` / ${TROPHIES.length}`} delay={360} color="#FF8AD8" />
        <Stat label="HINTS USED" value={hints + '×'} delay={440} />
      </View>

      {/* rank per soal */}
      <Card title="Mission Rank" accent={COLOR.cyan}>
        {QUESTIONS.map((q) => {
          const p = progress[q.id];
          const r = p ? rankOf((p.best ?? p.score) / p.max) : '–';
          return (
            <View key={q.id} style={s.rankRow}>
              <View style={[s.rankBox, { backgroundColor: p ? RANK_COLOR[r] : '#16224F' }]}>
                <Text style={[s.rankT, { color: p ? COLOR.navy : '#3B4A7A' }]}>{r}</Text>
              </View>
              <Text style={s.rankName} numberOfLines={1}>{q.title}</Text>
              <Text style={s.rankSc}>{p ? `${p.best ?? p.score}/${p.max}` : '—'}</Text>
            </View>
          );
        })}
      </Card>

      {/* trophy */}
      <View style={s.secBar}>
        <Text style={s.secT}>TROPHY</Text>
        <View style={s.legend}>
          {Object.keys(TIER).map((k) => {
            const all = TROPHIES.filter((t) => t.tier === k);
            const got = all.filter((t) => have[t.id]).length;
            return (
              <View key={k} style={s.legItem}>
                <View style={[s.legDot, { backgroundColor: TIER[k].color }]} />
                <Text style={s.legT}>{got}/{all.length}</Text>
              </View>
            );
          })}
        </View>
      </View>

      {selT ? (
        <Pop key={selT.id} style={{ marginBottom: 14 }}>
          <View style={[s.detail, { borderColor: have[selT.id] ? TIER[selT.tier].color : '#3B4A7A' }]}>
            <TrophyBadge t={selT} unlocked={!!have[selT.id]} size={78} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[s.dTier, { color: have[selT.id] ? TIER[selT.tier].color : COLOR.ice }]}>{TIER[selT.tier].label}</Text>
              <Text style={s.dName}>{selT.name}</Text>
              <Text style={s.dDesc}>{selT.desc}</Text>
              <Text style={[s.dState, { color: have[selT.id] ? COLOR.cyan : '#FF8AB5' }]}>
                {have[selT.id] ? `UNLOCKED  ·  ${fmtDate(have[selT.id])}` : 'LOCKED'}
              </Text>
            </View>
          </View>
        </Pop>
      ) : (
        <Text style={s.tapHint}>Tap a trophy to see its details and how to unlock it.</Text>
      )}

      <View style={s.grid}>
        {TROPHIES.map((t, i) => {
          const on = !!have[t.id];
          return (
            <Rise key={t.id} delay={120 + i * 55} from={16} style={{ width: `${100 / cols}%`, padding: 4 }}>
              <Pressable onPress={() => setSel(sel === t.id ? null : t.id)} style={[s.cell, sel === t.id && { borderColor: on ? TIER[t.tier].color : COLOR.ice, backgroundColor: 'rgba(11,63,168,0.35)' }]}>
                <TrophyBadge t={t} unlocked={on} size={66} />
                <Text style={[s.cellN, { opacity: on ? 1 : 0.5 }]} numberOfLines={2}>{t.name}</Text>
              </Pressable>
            </Rise>
          );
        })}
      </View>

      <Text style={s.credit}>Artwork {ch.name}  {ch.credit.owner}  ·  {ch.credit.game}</Text>

      <Modal visible={editOpen} transparent animationType="fade" onRequestClose={() => setEditOpen(false)}>
        <View style={s.modalBg}>
          <View style={s.modalCard}>
            <Text style={s.modalTitle}>CUSTOMIZE PROFILE</Text>
            <Text style={s.modalSub}>Pilih avatar dan banner. Nanti karakter baru bisa ditambahkan tanpa mengubah fitur ini.</Text>
            <Text style={s.pickTitle}>AVATAR</Text>
            <View style={s.pickRow}>
              {PROFILE_CHARACTERS.map((c) => (
                <Pressable key={c.key} onPress={() => onProfileChange?.({ avatar: c.avatar })} style={[s.pick, AVATAR_IMAGE === c.avatar && s.pickOn]}>
                  <Image source={c.avatar} style={s.pickAvatar} />
                  <Text style={s.pickText}>{c.name}</Text>
                </Pressable>
              ))}
            </View>
            <Text style={s.pickTitle}>BANNER</Text>
            <View style={s.pickRow}>
              {PROFILE_CHARACTERS.map((c) => (
                <Pressable key={c.key} onPress={() => onProfileChange?.({ banner: c.profile })} style={[s.bannerPick, BANNER === c.profile && s.pickOn]}>
                  <Image source={c.profile.src} style={s.bannerPickImg} />
                  <Text style={s.pickText}>{c.name}</Text>
                </Pressable>
              ))}
            </View>
            <Pressable onPress={() => setEditOpen(false)} style={s.closeBtn}><Text style={s.closeT}>DONE</Text></Pressable>
          </View>
        </View>
      </Modal>

      <Modal visible={shareOpen} transparent animationType="slide" onRequestClose={() => setShareOpen(false)}>
        <View style={s.modalBg}>
          <View style={s.shareModal}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={s.modalTitle}>SHARE PROFILE</Text>
              <Text style={s.modalSub}>Pilih sampai 3 trophy untuk dipamerkan di kartu, lalu simpan ke galeri atau bagikan.</Text>

              <Text style={s.pickTitle}>SHOWCASE ({showcase.length}/3)</Text>
              {unlockedN === 0 ? (
                <Text style={s.tapHint}>Belum ada trophy yang terbuka. Mainkan Latihan atau Game dulu.</Text>
              ) : (
                <View style={s.pickGrid}>
                  {TROPHIES.filter((t) => have[t.id]).map((t) => {
                    const on = showcase.includes(t);
                    return (
                      <Pressable key={t.id} onPress={() => toggleShow(t.id)} style={[s.pickT, on && { borderColor: TIER[t.tier].color, backgroundColor: 'rgba(255,255,255,0.08)' }]}>
                        <TrophyBadge t={t} unlocked size={44} shine={false} />
                        {on && <View style={[s.pickTick, { backgroundColor: TIER[t.tier].color }]}><Text style={s.pickTickT}>{showcase.indexOf(t) + 1}</Text></View>}
                      </Pressable>
                    );
                  })}
                </View>
              )}

              <View style={{ width: CARD_W * cardScale, height: CARD_H * cardScale, alignSelf: 'center', overflow: 'hidden', marginTop: 8 }}>
                <View style={{ position: 'absolute', left: -(CARD_W - CARD_W * cardScale) / 2, top: -(CARD_H - CARD_H * cardScale) / 2, width: CARD_W, height: CARD_H, transform: [{ scale: cardScale }] }}>
                  <ViewShot ref={shotRef} options={{ format: 'png', quality: 1, result: 'tmpfile', width: CARD_W * 3, height: CARD_H * 3 }} style={{ width: CARD_W, height: CARD_H }}>
                    <ShareCard user={user} avatar={AVATAR_IMAGE} banner={BANNER} lv={lv} xp={xp} progress={progress} showcase={chosen} extra={{ hints }} />
                  </ViewShot>
                </View>
              </View>

              <View style={s.shareBtns}>
                <Pressable disabled={saving} onPress={async () => {
                  try { setSaving(true); const perm = await MediaLibrary.requestPermissionsAsync(); if (!perm.granted) throw new Error('Izin galeri belum diberikan.'); const uri = await shotRef.current.capture(); await MediaLibrary.saveToLibraryAsync(uri); Alert.alert('Berhasil', 'Kartu profil sudah disimpan ke galeri.'); } catch (e) { Alert.alert('Gagal menyimpan', e.message || 'Coba lagi.'); } finally { setSaving(false); }
                }} style={s.actionBtn}><Text style={s.actionT}>{saving ? 'SAVING...' : 'SAVE TO GALLERY'}</Text></Pressable>
                <Pressable onPress={async () => { try { const uri = await shotRef.current.capture(); if (!(await Sharing.isAvailableAsync())) throw new Error('Fitur berbagi tidak tersedia di perangkat ini.'); await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle: 'Bagikan profil Math P3R' }); } catch (e) { Alert.alert('Gagal berbagi', e.message || 'Coba lagi.'); } }} style={[s.actionBtn, s.shareBtn]}><Text style={s.actionT}>SHARE</Text></Pressable>
              </View>
              <Pressable onPress={() => setShareOpen(false)} style={s.closeBtn}><Text style={s.closeT}>CLOSE</Text></Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </PageShell>
  );
}

const s = StyleSheet.create({
  banner: { width: '100%', aspectRatio: 2.1, overflow: 'hidden', borderWidth: 2, borderColor: COLOR.cyan, backgroundColor: '#0AA5E8' },
  bannerImg: { position: 'absolute', top: 0, left: 0, width: '100%' },
  idRow: { flexDirection: 'row', alignItems: 'flex-end', marginTop: -44, paddingHorizontal: 14 },
  avatar: { width: 92, height: 92, borderRadius: 46, borderWidth: 4, borderColor: COLOR.white, backgroundColor: COLOR.bg },
  lvWrap: { marginLeft: 14, paddingBottom: 4 },
  lvTag: { alignSelf: 'flex-start', backgroundColor: '#FF1A1A', paddingHorizontal: 14, paddingVertical: 2, transform: [{ skewX: '-12deg' }] },
  lvTagT: { color: '#fff', fontWeight: '900', fontStyle: 'italic', fontSize: 20, letterSpacing: 2, transform: [{ skewX: '12deg' }] },
  arcana: { color: COLOR.cyan, fontWeight: '900', letterSpacing: 3, fontSize: 12, marginTop: 4 },
  name: { color: COLOR.white, fontSize: 34, fontWeight: '900', fontStyle: 'italic', marginTop: 10, marginBottom: 22, paddingHorizontal: 14 },
  xpT: { color: COLOR.white, fontWeight: '900', fontStyle: 'italic', fontSize: 22 },
  xpN: { color: COLOR.ice, fontSize: 12, fontWeight: '800', alignSelf: 'flex-end' },
  hintT: { color: COLOR.text, opacity: 0.6, fontSize: 11, lineHeight: 17, marginTop: 12 },
  statRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 14 },
  stat: { width: '48.5%', borderWidth: 1.5, borderColor: 'rgba(191,239,255,0.35)', backgroundColor: COLOR.glass, padding: 12, marginBottom: 10 },
  statL: { color: COLOR.ice, fontSize: 10, fontWeight: '900', letterSpacing: 2 },
  statV: { fontSize: 30, fontWeight: '900', fontStyle: 'italic', marginTop: 2 },
  statS: { fontSize: 14, color: COLOR.ice, fontStyle: 'normal' },
  rankRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  rankBox: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', marginRight: 14, transform: [{ skewX: '-12deg' }] },
  rankT: { fontSize: 22, fontWeight: '900', fontStyle: 'italic', transform: [{ skewX: '12deg' }] },
  rankName: { flex: 1, color: COLOR.white, fontWeight: '800', fontSize: 14 },
  rankSc: { color: COLOR.ice, fontWeight: '900', fontSize: 14 },
  secBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  secT: { color: COLOR.navy, backgroundColor: COLOR.white, fontSize: 22, fontWeight: '900', fontStyle: 'italic', letterSpacing: 3, paddingHorizontal: 14, paddingVertical: 2, transform: [{ skewX: '-12deg' }] },
  legend: { flexDirection: 'row' },
  legItem: { flexDirection: 'row', alignItems: 'center', marginLeft: 12 },
  legDot: { width: 10, height: 10, marginRight: 5, transform: [{ rotate: '45deg' }] },
  legT: { color: COLOR.ice, fontSize: 12, fontWeight: '900' },
  tapHint: { color: COLOR.text, opacity: 0.65, fontSize: 12, marginBottom: 14 },
  detail: { flexDirection: 'row', alignItems: 'center', borderWidth: 2, backgroundColor: 'rgba(2,12,27,0.92)', padding: 14 },
  dTier: { fontSize: 10, fontWeight: '900', letterSpacing: 3 },
  dName: { color: COLOR.white, fontSize: 22, fontWeight: '900', fontStyle: 'italic', marginTop: 2 },
  dDesc: { color: COLOR.text, fontSize: 13, lineHeight: 19, marginTop: 4 },
  dState: { fontSize: 11, fontWeight: '900', letterSpacing: 2, marginTop: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -4, marginBottom: 20 },
  cell: { alignItems: 'center', paddingVertical: 12, paddingHorizontal: 4, borderWidth: 1.5, borderColor: 'transparent' },
  cellN: { color: COLOR.white, fontSize: 11, fontWeight: '800', textAlign: 'center', marginTop: 6, minHeight: 28 },

  profileActions: { flexDirection: 'row', paddingHorizontal: 14, marginTop: -8, marginBottom: 18 },
  actionBtn: { flex: 1, borderWidth: 1.5, borderColor: COLOR.cyan, backgroundColor: 'rgba(0,229,255,0.12)', paddingVertical: 11, alignItems: 'center', marginRight: 8 },
  shareBtn: { borderColor: '#FF8AD8', backgroundColor: 'rgba(255,138,216,0.12)', marginRight: 0 },
  actionT: { color: COLOR.white, fontSize: 11, fontWeight: '900', letterSpacing: 1.2 },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.82)', justifyContent: 'center', padding: 16 },
  modalCard: { backgroundColor: '#07142B', borderWidth: 2, borderColor: COLOR.cyan, padding: 18, maxHeight: '88%' },
  shareModal: { backgroundColor: '#07142B', borderWidth: 2, borderColor: '#FF8AD8', padding: 14, maxHeight: '94%' },
  modalTitle: { color: COLOR.white, fontSize: 22, fontWeight: '900', fontStyle: 'italic', letterSpacing: 2 },
  modalSub: { color: COLOR.text, fontSize: 12, lineHeight: 17, marginTop: 6, marginBottom: 16 },
  pickTitle: { color: COLOR.cyan, fontSize: 11, fontWeight: '900', letterSpacing: 2, marginTop: 8, marginBottom: 8 },
  pickRow: { flexDirection: 'row', flexWrap: 'wrap' },
  pick: { width: 100, borderWidth: 1, borderColor: '#243A6A', padding: 7, marginRight: 8, marginBottom: 8, alignItems: 'center' },
  pickOn: { borderColor: COLOR.cyan, backgroundColor: 'rgba(0,229,255,0.12)' },
  pickAvatar: { width: 64, height: 64, borderRadius: 32 },
  pickText: { color: COLOR.white, fontSize: 9, fontWeight: '800', textAlign: 'center', marginTop: 5 },
  bannerPick: { width: 150, height: 70, borderWidth: 1, borderColor: '#243A6A', marginRight: 8, marginBottom: 8, overflow: 'hidden' },
  bannerPickImg: { width: '100%', height: '100%', resizeMode: 'cover' },
  closeBtn: { marginTop: 12, borderWidth: 1.5, borderColor: COLOR.white, paddingVertical: 10, alignItems: 'center' },
  closeT: { color: COLOR.white, fontWeight: '900', letterSpacing: 2 },
  shareBtns: { flexDirection: 'row', marginTop: 12 },
  credit: { color: COLOR.text, opacity: 0.45, fontSize: 10, textAlign: 'center' },
  showRow: { flexDirection: 'row', marginBottom: 18 },
  showCell: { flex: 1, marginRight: 8, alignItems: 'center', paddingBottom: 8, backgroundColor: 'rgba(3,22,62,0.92)', borderWidth: 1.5 },
  showName: { color: COLOR.white, fontSize: 11, fontWeight: '900', textAlign: 'center', marginTop: 6, minHeight: 28, paddingHorizontal: 4 },
  pickGrid: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 },
  pickT: { width: 56, height: 56, alignItems: 'center', justifyContent: 'center', marginRight: 6, marginBottom: 6, borderWidth: 1.5, borderColor: '#243A6A' },
  pickTick: { position: 'absolute', right: -3, top: -3, minWidth: 16, height: 16, alignItems: 'center', justifyContent: 'center' },
  pickTickT: { color: COLOR.navy, fontSize: 11, fontWeight: '900' },
});
