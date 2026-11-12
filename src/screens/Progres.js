import React, { useState } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import Text from '../components/Txt';
import { COLOR } from '../theme';
import PageShell, { Card } from '../components/PageShell';
import { Gauge, HP_COLOR, SP_COLOR } from '../components/StatusCard';
import { Btn } from '../components/Ui';
import { MenuRow as P3Row, TabBtn, Slab, Ghost, Kicker } from '../components/P3';
import { Tri, CheckMark } from '../components/Glyph';
import { Rise, Meter, CountUp } from '../components/Fx';
import { sfx } from '../audio';
import { QUESTIONS } from '../data';
import { STEPS, VIDEOS, materiStat } from '../materiData';
import { xpOf, levelOf, LEVEL_STEP, trophyCount, TROPHIES, rankOf, RANK_COLOR } from '../trophies';

const PINK = '#FF4D8D';
const GOLD = '#FFD400';
const GREEN = '#3DDC84';
const pct = (f) => Math.round(Math.max(0, Math.min(1, f)) * 100);

// Tiap menu di lobi punya satu "jalur" progres. Semua angka dihitung dari objek progress yang sama.
const GAME_LIST = [
  { k: 'relasi', name: 'Misi Relasi', color: COLOR.cyan },
  { k: 'battle', name: 'Shadow Battle', color: '#FF3B5C', tip: (r) => `Lantai terbaik ${r.floors || 0}/3` },
  { k: 'jenis', name: 'Tebak Jenis', color: GOLD },
  { k: 'tabel', name: 'Isi Tabel', color: PINK },
  { k: 'pasang', name: 'Pasangan Rasio', color: '#B79CFF' },
];
const gameRec = (progress, k) => (k === 'relasi'
  ? (progress.game ? { best: progress.game.best, max: 60, plays: progress.game.plays || 1 } : null)
  : ((progress.games || {})[k] || null));

function stats(progress) {
  const ms = materiStat(progress);
  const gamesPlayed = GAME_LIST.filter((g) => gameRec(progress, g.k)).length;
  const done = QUESTIONS.filter((q) => progress[q.id]);
  const lab = progress.lab || {};
  const labDone = (lab.senilai ? 1 : 0) + (lab.berbalik ? 1 : 0);
  const hints = done.reduce((a, q) => a + (progress[q.id].hints || 0), 0);
  const menus = [
    { key: 'materi', screen: 'MATERI', name: 'BELAJAR', color: COLOR.cyan, frac: ms.frac, val: `${ms.seen}/${ms.total}`, sub: `${ms.seen} bagian dibaca  ·  ${ms.vids}/${ms.vtotal} video dibuka` },
    { key: 'game', screen: 'GAME', name: 'GAME', color: '#FF3B5C', frac: gamesPlayed / GAME_LIST.length, val: `${gamesPlayed}/${GAME_LIST.length}`, sub: `${gamesPlayed} dari ${GAME_LIST.length} mode sudah dimainkan` },
    { key: 'latihan', screen: 'LATIHAN', name: 'LATIHAN', color: GOLD, frac: QUESTIONS.length ? done.length / QUESTIONS.length : 0, val: `${done.length}/${QUESTIONS.length}`, sub: `${done.length} misi selesai  ·  petunjuk dipakai ${hints}x` },
    { key: 'lab', screen: 'LAB', name: 'LAB', color: PINK, frac: labDone / 2, val: `${labDone}/2`, sub: `Senilai ${lab.senilai ? 'benar' : 'belum'}  ·  Berbalik nilai ${lab.berbalik ? 'benar' : 'belum'}` },
  ];
  const overall = menus.reduce((a, m) => a + m.frac, 0) / menus.length;
  return { ms, done, hints, menus, overall, gamesPlayed, labDone };
}

// Saran langkah berikutnya: menu dengan progres terendah yang belum tuntas
function nextStep(progress, st) {
  const open = st.menus.filter((m) => m.frac < 1).sort((a, b) => a.frac - b.frac)[0];
  if (!open) return { done: true, text: 'Semua menu sudah dijelajahi. Ulangi misi yang skornya belum penuh untuk naik rank.', screen: 'LATIHAN', label: 'BUKA LATIHAN' };
  if (open.key === 'materi') {
    const m = progress.materi || {};
    const idx = STEPS.findIndex((_, i) => !(m.seen || {})[i]);
    return { text: idx >= 0 ? `Lanjutkan BELAJAR: bagian "${STEPS[idx]}" belum dibaca.` : 'Buka video di BELAJAR untuk melihat penjelasan guru lain.', screen: 'MATERI', label: 'LANJUT BELAJAR' };
  }
  if (open.key === 'game') {
    const g = GAME_LIST.find((x) => !gameRec(progress, x.k));
    return { text: g ? `Coba mode GAME "${g.name}" yang belum dimainkan.` : 'Main lagi untuk menaikkan skor terbaik.', screen: 'GAME', label: 'BUKA GAME' };
  }
  if (open.key === 'latihan') {
    const q = QUESTIONS.find((x) => !progress[x.id]);
    return { text: q ? `Kerjakan misi LATIHAN "${q.title}".` : 'Ulangi misi yang skornya belum penuh.', screen: 'LATIHAN', label: 'BUKA LATIHAN' };
  }
  return { text: 'Buka LAB, geser angkanya, lalu tebak hasilnya untuk dua jenis perbandingan.', screen: 'LAB', label: 'BUKA LAB' };
}

// Baris statistik: nama, nilai, bar terisi animasi
function Row({ name, value, frac, color, delay = 0, sub, badge }) {
  return (
    <Rise delay={delay} from={10} style={{ marginBottom: 14 }}>
      <View style={s.rowHead}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, paddingRight: 8 }}>
          {badge ? <Text style={[s.badge, { color: RANK_COLOR[badge] }]}>{badge}</Text> : null}
          <Text style={s.name} numberOfLines={2}>{name}</Text>
        </View>
        <Text style={[s.val, { color }]}>{value}</Text>
      </View>
      <Meter to={Math.max(0, Math.min(1, frac))} color={color} height={7} delay={delay} />
      {sub ? <Text style={s.sub}>{sub}</Text> : null}
    </Rise>
  );
}
function Empty({ name, text }) {
  return (
    <View style={s.emptyRow}>
      <View style={s.emptyDot} />
      <View style={{ flex: 1 }}>
        <Text style={s.nameDim}>{name}</Text>
        <Text style={s.empty}>{text}</Text>
      </View>
    </View>
  );
}

// Kartu menu: ketuk untuk membuka menu yang bersangkutan
function MenuRow({ m, i, onOpen }) {
  return <P3Row no={String(i + 1).padStart(2, '0')} title={m.name} sub={m.sub} color={m.color} frac={m.frac} meta={`${pct(m.frac)}%  ·  ${m.val}`} delay={80 + i * 70} onPress={() => onOpen(m.screen)} />;
}

const TABS = ['RINGKAS', 'BELAJAR', 'GAME', 'LATIHAN', 'LAB'];

export default function Progres({ onBack, progress, user, onOpen }) {
  const [tab, setTab] = useState(0);
  const go = (n) => onOpen && onOpen(n);
  const st = stats(progress);
  const lv = levelOf(xpOf(progress));
  const nx = nextStep(progress, st);
  const m = progress.materi || {};
  const weakest = st.done.length
    ? st.done.map((q) => ({ q, f: (progress[q.id].best ?? progress[q.id].score) / progress[q.id].max })).sort((x, y) => x.f - y.f)[0]
    : null;
  const lab = progress.lab || {};

  return (
    <PageShell title="Progres" onBack={onBack} scrollKey={tab} crumb="MENU / PROGRES" sub="Skor, level, dan pencapaianmu di satu tempat.">
      <View style={s.tabs}>
        {TABS.map((t, i) => <TabBtn key={t} small label={t} on={i === tab} color={COLOR.cyan} onPress={() => { if (i !== tab) setTab(i); }} />)}
      </View>

      <View key={tab}>
        {tab === 0 && (
          <>
            <Card title={`${user || 'Pemain'}  ·  LV ${lv.level} ${lv.name}`} accent={COLOR.cyan}>
              <View style={s.overall}>
                <Ghost size={84} color={COLOR.cyan} opacity={0.1} style={{ right: 0, top: -22 }}>{pct(st.overall) + '%'}</Ghost>
                <CountUp to={pct(st.overall)} suffix="%" style={s.overallN} />
                <View style={{ flex: 1, marginLeft: 14 }}>
                  <Text style={s.overallL}>PROGRES KESELURUHAN</Text>
                  <Meter to={st.overall} color={COLOR.cyan} height={9} />
                </View>
              </View>
              <Gauge label="HP" value={lv.maxed ? LEVEL_STEP : Math.round(lv.frac * LEVEL_STEP)} max={LEVEL_STEP} color={HP_COLOR} height={10} numSize={14} />
              <Gauge label="SP" value={st.done.length} max={QUESTIONS.length} color={SP_COLOR} height={8} numSize={13} style={{ marginTop: 6 }} />
              <Text style={s.legend}>HP = XP menuju level berikutnya  ·  SP = misi LATIHAN selesai</Text>
              <View style={s.chips}>
                <View style={s.chip}><Text style={s.chipN}>{trophyCount(progress)}/{TROPHIES.length}</Text><Text style={s.chipL}>TROPHY</Text></View>
                <View style={s.chip}><Text style={s.chipN}>{xpOf(progress)}</Text><Text style={s.chipL}>TOTAL XP</Text></View>
                <View style={[s.chip, { marginRight: 0 }]}><Text style={s.chipN}>{st.hints}</Text><Text style={s.chipL}>PETUNJUK</Text></View>
              </View>
            </Card>

            <Card title="Progres tiap menu" accent={GOLD} delay={80}>
              <Text style={s.hint}>Ketuk sebuah menu untuk langsung membukanya.</Text>
              {st.menus.map((mm, i) => <MenuRow key={mm.key} m={mm} i={i} onOpen={go} />)}
            </Card>

            <Card title="Langkah berikutnya" accent={nx.done ? GREEN : PINK} delay={160}>
              <Text style={s.next}>{nx.text}</Text>
              <Btn label={nx.label} icon="right" tone="cyan" onPress={() => go(nx.screen)} style={{ alignSelf: 'stretch' }} />
            </Card>
          </>
        )}

        {tab === 1 && (
          <>
            <Card title="Bagian yang sudah dibaca" accent={COLOR.cyan}>
              <Text style={s.hint}>{st.ms.seen} dari {st.ms.total} bagian. Ketuk bagian mana pun untuk membuka BELAJAR.</Text>
              <View style={s.chipsWrap}>
                {STEPS.map((n, i) => {
                  const d = !!(m.seen || {})[i];
                  return (
                    <Pressable key={n} onPress={() => { sfx('click'); go('MATERI'); }} style={[s.stepChip, d && { backgroundColor: COLOR.cyan, borderColor: COLOR.cyan }]}>
                      <Text style={[s.stepNo, d && { color: COLOR.navy }]}>{i + 1}</Text>
                      <Text style={[s.stepName, d && { color: COLOR.navy }]} numberOfLines={1}>{n}</Text>
                    </Pressable>
                  );
                })}
              </View>
              <Meter to={st.ms.seen / st.ms.total} color={COLOR.cyan} height={7} />
            </Card>
            <Card title="Video yang sudah dibuka" accent={PINK} delay={80}>
              <Text style={s.hint}>{st.ms.vids} dari {st.ms.vtotal} video.</Text>
              {VIDEOS.map((v, i) => {
                const d = !!(m.videos || {})[v.id];
                return (
                  <Rise key={v.id} delay={i * 40} from={8} style={s.vidRow}>
                    <View style={[s.check, d && { backgroundColor: GREEN, borderColor: GREEN }]}>{d ? <CheckMark size={14} color={COLOR.navy} /> : null}</View>
                    <Text style={[s.vidT, !d && { opacity: 0.55 }]} numberOfLines={2}>{v.title}</Text>
                  </Rise>
                );
              })}
              <Btn label="BUKA BELAJAR" icon="right" tone="cyan" onPress={() => go('MATERI')} style={{ alignSelf: 'stretch', marginTop: 8 }} />
            </Card>
          </>
        )}

        {tab === 2 && (
          <Card title="Skor terbaik tiap mode" accent={GOLD}>
            {GAME_LIST.map((g, i) => {
              const r = gameRec(progress, g.k);
              return r
                ? <Row key={g.k} name={g.name} value={`${r.best}/${r.max}`} frac={r.best / r.max} color={g.color} delay={i * 70} sub={`Dimainkan ${r.plays || 1}x${g.tip ? '  ·  ' + g.tip(r) : ''}`} />
                : <Empty key={g.k} name={g.name} text="Belum dimainkan" />;
            })}
            {progress.bedakan ? <Row name="Naik–naik atau naik–turun?" value={`${progress.bedakan.right}/${progress.bedakan.total}`} frac={progress.bedakan.right / progress.bedakan.total} color={COLOR.cyan} delay={350} /> : null}
            <Btn label="BUKA GAME" icon="right" tone="cyan" onPress={() => go('GAME')} style={{ alignSelf: 'stretch', marginTop: 6 }} />
          </Card>
        )}

        {tab === 3 && (
          <Card title="Misi latihan" accent={COLOR.cyan}>
            {QUESTIONS.map((q, i) => {
              const p = progress[q.id];
              const color = q.type === 'berbalik' ? PINK : q.type === 'dasar' ? GOLD : COLOR.cyan;
              if (!p) return <Empty key={q.id} name={q.title} text="Belum dikerjakan" />;
              const best = p.best ?? p.score;
              return <Row key={q.id} name={q.title} value={`${best}/${p.max}`} frac={best / p.max} color={color} badge={rankOf(best / p.max)} delay={Math.min(i, 8) * 40} sub={`Dicoba ${p.attempts || 1}x  ·  Petunjuk ${p.hints || 0}x`} />;
            })}
            {weakest && weakest.f < 1 ? (
              <View style={s.tipBox}>
                <Text style={s.tip}>Perlu diulang: {weakest.q.title}. Buka BELAJAR untuk melihat tabel, diagram panah, dan contoh bertahap.</Text>
                <View style={{ flexDirection: 'row', marginTop: 10 }}>
                  <Btn label="BELAJAR" onPress={() => go('MATERI')} style={{ flex: 1, marginRight: 8 }} />
                  <Btn label="ULANGI MISI" icon="right" tone="cyan" onPress={() => go('LATIHAN')} style={{ flex: 1 }} />
                </View>
              </View>
            ) : (
              <Btn label="BUKA LATIHAN" icon="right" tone="cyan" onPress={() => go('LATIHAN')} style={{ alignSelf: 'stretch', marginTop: 6 }} />
            )}
          </Card>
        )}

        {tab === 4 && (
          <Card title="Lab: tebak dulu" accent={PINK}>
            <Row name="Senilai" value={lab.senilai ? '1/1' : '0/1'} frac={lab.senilai ? 1 : 0} color={COLOR.cyan} sub={lab.senilai ? 'Tebakan benar' : 'Belum menebak dengan benar'} />
            <Row name="Berbalik nilai" value={lab.berbalik ? '1/1' : '0/1'} frac={lab.berbalik ? 1 : 0} color={PINK} delay={80} sub={lab.berbalik ? 'Tebakan benar' : 'Belum menebak dengan benar'} />
            <Btn label="BUKA LAB" icon="right" tone="cyan" onPress={() => go('LAB')} style={{ alignSelf: 'stretch', marginTop: 6 }} />
          </Card>
        )}
      </View>

      <Text style={s.note}>Skor tersimpan per nama di perangkat ini (browser atau HP).</Text>
    </PageShell>
  );
}

const s = StyleSheet.create({
  tabs: { flexDirection: 'row', marginBottom: 18, marginRight: -6 },
  tab: { flex: 1, borderWidth: 2, borderColor: 'rgba(0,229,255,0.45)', paddingVertical: 7, marginRight: 5, alignItems: 'center', backgroundColor: 'rgba(2,12,27,0.6)', transform: [{ skewX: '-12deg' }] },
  tabOn: { backgroundColor: COLOR.cyan, borderColor: COLOR.cyan },
  tabT: { color: COLOR.cyan, fontSize: 9.5, fontWeight: '900', letterSpacing: 0.6, includeFontPadding: false },
  overall: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  overallN: { color: COLOR.white, fontSize: 40, fontWeight: '900', fontStyle: 'italic', minWidth: 84, includeFontPadding: false },
  overallL: { color: COLOR.cyan, fontSize: 9, fontWeight: '900', letterSpacing: 2, marginBottom: 6 },
  rowHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 5 },
  name: { color: COLOR.white, fontWeight: '900', fontSize: 14, flexShrink: 1 },
  nameDim: { color: COLOR.white, opacity: 0.8, fontWeight: '800', fontSize: 14 },
  badge: { fontSize: 15, fontWeight: '900', fontStyle: 'italic', width: 20, includeFontPadding: false },
  val: { fontWeight: '900', fontSize: 15, fontStyle: 'italic' },
  sub: { color: COLOR.ice, opacity: 0.65, fontSize: 11, marginTop: 5, lineHeight: 16 },
  empty: { color: COLOR.text, opacity: 0.55, fontSize: 12, marginTop: 2 },
  emptyRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14, paddingVertical: 2 },
  emptyDot: { width: 8, height: 8, borderWidth: 1.5, borderColor: 'rgba(191,239,255,0.45)', marginRight: 12, transform: [{ rotate: '45deg' }] },
  legend: { color: COLOR.ice, opacity: 0.6, fontSize: 9.5, fontWeight: '700', letterSpacing: 0.6, marginTop: 8 },
  hint: { color: COLOR.text, opacity: 0.65, fontSize: 12, lineHeight: 18, marginBottom: 12 },
  chips: { flexDirection: 'row', marginTop: 14 },
  chip: { flex: 1, borderWidth: 1.5, borderBottomWidth: 3, borderColor: 'rgba(0,229,255,0.5)', paddingVertical: 8, alignItems: 'center', marginRight: 8, backgroundColor: 'rgba(2,12,27,0.7)', transform: [{ skewX: '-8deg' }] },
  chipN: { color: COLOR.white, fontSize: 17, fontWeight: '900', fontStyle: 'italic' },
  chipL: { color: COLOR.cyan, fontSize: 8, fontWeight: '900', letterSpacing: 2, marginTop: 2 },
  menu: { flexDirection: 'row', alignItems: 'stretch', borderWidth: 1.5, backgroundColor: 'rgba(2,12,27,0.6)' },
  menuBar: { width: 6 },
  menuName: { fontSize: 15, fontWeight: '900', fontStyle: 'italic', letterSpacing: 1.5 },
  menuPct: { color: COLOR.white, fontSize: 15, fontWeight: '900', fontStyle: 'italic' },
  menuGo: { width: 30, alignItems: 'center', justifyContent: 'center' },
  next: { color: COLOR.white, fontSize: 14, lineHeight: 22, marginBottom: 14, opacity: 0.92 },
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 },
  stepChip: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: 'rgba(191,239,255,0.4)', paddingVertical: 5, paddingHorizontal: 9, marginRight: 6, marginBottom: 6, backgroundColor: 'rgba(2,12,27,0.5)', transform: [{ skewX: '-10deg' }] },
  stepNo: { color: COLOR.cyan, fontSize: 12, fontWeight: '900', fontStyle: 'italic', marginRight: 6 },
  stepName: { color: COLOR.ice, fontSize: 11, fontWeight: '800' },
  vidRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  check: { width: 20, height: 20, borderWidth: 1.5, borderColor: 'rgba(191,239,255,0.5)', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  vidT: { flex: 1, color: COLOR.white, fontSize: 13, fontWeight: '700', lineHeight: 18 },
  tipBox: { borderLeftWidth: 4, borderLeftColor: '#FF8AB5', backgroundColor: 'rgba(2,12,27,0.55)', padding: 12, marginTop: 4 },
  tip: { color: '#FF8AB5', fontWeight: '800', fontSize: 13, lineHeight: 19 },
  note: { color: COLOR.text, opacity: 0.5, fontSize: 11, marginTop: 4 },
});
