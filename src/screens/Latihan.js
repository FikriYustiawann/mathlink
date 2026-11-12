import React, { useMemo, useState } from 'react';
import { View, Image, Pressable, StyleSheet } from 'react-native';
import Text from '../components/Txt';
import { COLOR } from '../theme';
import PageShell, { Card } from '../components/PageShell';
import { Btn, Tag, Highlight, Pic, SimpleTable } from '../components/Ui';
import { Tri, Box } from '../components/Glyph';
import { Slab, Ghost, Kicker, TabBtn, Chip, Ribbon } from '../components/P3';
import { useFocus } from '../focus';
import { Rise, Pop, PressScale, Burst, CountUp, Meter } from '../components/Fx';
import { StageHud, Opt, HintBubble, Stamp, PTS_COLOR } from '../components/Quiz';
import { TrophyCard } from '../components/Trophy';
import { QUESTIONS, LEVEL } from '../data';
import { useChar } from '../CharacterContext';
import Banner from '../components/Banner';
import { rankOf, RANK_COLOR, RANK_TITLE, levelOf, xpOf, trophyById, trophyCount, TROPHIES } from '../trophies';

const shuffle = (n) => {
  const a = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
};
const LETTERS = ['A', 'B', 'C', 'D'];
const accentOf = (q) => (q.type === 'senilai' ? COLOR.cyan : q.type === 'dasar' ? '#FFD400' : '#FF4D8D');

// Bantuan memudar (GL03): soal sulit hanya 1 petunjuk per tahap; soal transfer sesuai maxHints.
const maxHintsOf = (q, st) => Math.min(st.hints.length, q.maxHints != null ? q.maxHints : q.level === 'sulit' ? 1 : 99);

export default function Latihan({ onBack, progress, onResult, user, onProfile }) {
  const ch = useChar();
  const [focus] = useFocus();
  const AVATAR_IMAGE = ch.avatar;
  const [qi, setQi] = useState(null);          // soal terpilih (null = daftar misi)
  const [si, setSi] = useState(0);             // tahap
  const [wrong, setWrong] = useState([]);      // opsi yang sudah salah
  const [hint, setHint] = useState(0);         // jumlah petunjuk dibuka
  const [solved, setSolved] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [scores, setScores] = useState([]);
  const [hintTotal, setHintTotal] = useState(0);
  const [mistakeTotal, setMistakeTotal] = useState(0);
  const [finished, setFinished] = useState(false);
  const [streak, setStreak] = useState(0);
  const [showSoal, setShowSoal] = useState(true);
  const [lvl, setLvl] = useState('semua');   // filter tingkat kesulitan
  const [hl, setHl] = useState(false);        // sorot kata kunci
  const [reward, setReward] = useState(null);  // { fresh, xpBefore, xpAfter }

  const q = qi !== null ? QUESTIONS[qi] : null;
  const st = q ? q.steps[si] : null;
  const order = useMemo(() => (st ? shuffle(st.opts.length) : []), [qi, si]);

  const start = (i) => {
    setQi(i); setSi(0); setWrong([]); setHint(0); setSolved(false); setRevealed(false);
    setScores([]); setHintTotal(0); setMistakeTotal(0); setFinished(false); setStreak(0); setShowSoal(true); setReward(null);
  };
  const openHint = () => { if (hint < maxHintsOf(q, st)) { setHint(hint + 1); setHintTotal((h) => h + 1); } };

  const pick = (idx) => {
    if (solved || revealed || wrong.includes(idx)) return;
    if (idx === st.ans) {
      setSolved(true);
      setStreak((s) => (wrong.length === 0 && hint === 0 ? s + 1 : 0));
      return;
    }
    const w = [...wrong, idx];
    setWrong(w);
    setMistakeTotal((m) => m + 1);
    if (w.length >= 2) { setRevealed(true); setStreak(0); }   // setelah 2 salah, jawaban ditunjukkan
  };

  const stagePts = solved ? (wrong.length === 0 && hint === 0 ? 2 : 1) : 0;

  const next = () => {
    const sc = [...scores, stagePts];
    setScores(sc);
    if (si + 1 >= q.steps.length) {
      const result = { score: sc.reduce((a, b) => a + b, 0), max: q.steps.length * 2, hints: hintTotal, mistakes: mistakeTotal };
      const r = onResult && onResult(q.id, result);
      setReward(r || { fresh: [], xpBefore: xpOf(progress), xpAfter: xpOf(progress) });
      setFinished(true);
      return;
    }
    setSi(si + 1); setWrong([]); setHint(0); setSolved(false); setRevealed(false);
  };

  // ============ DAFTAR MISI ============
  if (q === null) {
    const lv = levelOf(xpOf(progress));
    return (
      <PageShell title="Latihan" onBack={onBack}>
        <Rise>
          <PressScale onPress={onProfile} to={0.98} style={{ marginBottom: 22 }}>
           <Slab color={COLOR.cyan} skew={-6}>
            <View style={s.sum}>
            <Image source={AVATAR_IMAGE} style={s.sumAv} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={s.sumName} numberOfLines={1}>{user || 'PEMAIN'}</Text>
              <Text style={s.sumLv}>LV {lv.level}  ·  {lv.name} {lv.num}</Text>
              <View style={{ marginTop: 6 }}><Meter from={0} to={lv.frac} height={7} delay={200} /></View>
            </View>
            <View style={s.sumTro}>
              <Text style={s.sumTroN}>{trophyCount(progress)}<Text style={s.sumTroM}>/{TROPHIES.length}</Text></Text>
              <Text style={s.sumTroL}>TROPHY</Text>
            </View>
            </View>
           </Slab>
          </PressScale>
        </Rise>

        <Kicker color={COLOR.cyan}>JALUR BELAJAR</Kicker>
        <View style={s.mapRow}>{['MUDAH','MENENGAH','SULIT','TRANSFER'].map((m,i)=>{
          const key = m === 'TRANSFER' ? null : m.toLowerCase();
          const list = QUESTIONS.filter((z) => (key ? z.level === key && !z.transfer : z.transfer));
          const got = list.filter((z) => progress && progress[z.id]).length;
          const col = i < 2 ? COLOR.cyan : i === 2 ? '#FF4D8D' : '#FFD400';
          return (
            <View key={m} style={s.mapNode}>
              {i < 3 && <View style={s.mapLine} />}
              <View style={[s.mapDot, { backgroundColor: got === list.length && list.length ? col : COLOR.bg, borderColor: col }]}>
                <Text style={[s.mapNum, { color: got === list.length && list.length ? COLOR.navy : col }]}>{i + 1}</Text>
              </View>
              <Text style={s.mapText}>{m}</Text>
              <Text style={[s.mapCount, { color: col }]}>{got}/{list.length}</Text>
            </View>
          );
        })}</View>
        <Text style={s.intro}>Mulai dari Mudah, lalu naik ke Menengah dan Sulit. Tiap soal dipecah per tahap, dan petunjuk siap membantu.</Text>
        {QUESTIONS.some(x=>progress?.[x.id]?.mistakes) && <Card title="BELAJAR DARI KESALAHAN" accent="#FFD400"><Text style={s.errorLead}>Salah itu wajar. Ulangi misi yang paling sering kamu salahi.</Text>{QUESTIONS.filter(x=>progress?.[x.id]?.mistakes).slice(0,3).map(x=><Pressable key={'err'+x.id} onPress={()=>start(QUESTIONS.indexOf(x))} style={s.errorRow}><Text style={s.errorTitle}>{x.title}</Text><Text style={s.errorMeta}>Salah {progress[x.id].mistakes} kali  ·  {progress[x.id].hints||0} petunjuk dipakai</Text></Pressable>)}</Card>}
        <View style={s.lvRow}>
          {['semua', 'mudah', 'menengah', 'sulit'].map((k) => {
            const col = k === 'semua' ? COLOR.cyan : LEVEL[k].color;
            const n = k === 'semua' ? QUESTIONS.length : QUESTIONS.filter((z) => z.level === k).length;
            return <TabBtn key={k} label={`${k === 'semua' ? 'SEMUA' : LEVEL[k].label} ${n}`} on={lvl === k} color={col} onPress={() => setLvl(k)} />;
          })}
        </View>
        <Text style={s.lvInfo}>
          {lvl === 'mudah' ? 'Mudah: satu langkah hitung, cocok untuk memastikan konsep dasar. Soal bertanda TRANSFER memakai cerita baru dengan bantuan lebih sedikit.' : lvl === 'menengah' ? 'Menengah: perlu membandingkan atau menafsirkan hasil sebelum menghitung.' : lvl === 'sulit' ? 'Sulit: soal cerita panjang dan menyusun model sendiri. Petunjuk dibatasi 1 per tahap supaya kamu belajar mandiri.' : 'Mulai dari Mudah, lalu naik ke Menengah dan Sulit.'}
        </Text>

        {QUESTIONS.map((x, i) => ({ x, i })).filter(({ x }) => lvl === 'semua' || x.level === lvl).map(({ x, i }) => {
          const p = progress && progress[x.id];
          const best = p ? (p.best ?? p.score) : 0;
          const frac = p ? best / p.max : 0;
          const rank = p ? rankOf(frac) : '–';
          const accent = accentOf(x);
          return (
            <Rise key={x.id} delay={120 + i * 90}>
              <PressScale onPress={() => start(i)} to={0.97} style={{ marginBottom: 16 }}>
               <Slab color={accent} skew={-5}>
                <View style={s.mission}>
                <Ghost size={74} color={accent} opacity={0.12} style={{ right: 70, top: -10 }}>{String(i + 1).padStart(2, '0')}</Ghost>
                <View style={[s.rankBox, { backgroundColor: p ? RANK_COLOR[rank] : '#16224F' }]}>
                  <Text style={[s.rankT, { color: p ? COLOR.navy : '#3B4A7A' }]}>{rank}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Tag type={x.type} />
                    <View style={[s.lvBadge, { backgroundColor: LEVEL[x.level].color }]}><Text style={s.lvBadgeT}>{LEVEL[x.level].label}</Text></View>
                  </View>
                  <Text style={s.mTitle}>{x.title}</Text>
                  <Text style={s.small}>Fokus: {x.indikator}  ·  {x.steps.length} tahap{x.transfer ? '  ·  TRANSFER' : ''}</Text>
                  <View style={{ marginTop: 8 }}><Meter from={0} to={frac} color={accent} height={6} delay={300 + i * 90} /></View>
                  <Text style={s.score}>{p ? `TERBAIK ${best}/${p.max}  ·  DIMAIN ${p.attempts || 1} KALI` : 'BELUM DIMAINKAN'}</Text>
                </View>
                <View style={s.goBox}>
                  <Text style={[s.go, { color: accent }]}>{p ? 'ULANGI' : 'MULAI'}</Text>
                  <Tri dir="right" size={10} color={accent} style={{ marginTop: 6 }} />
                </View>
                </View>
               </Slab>
              </PressScale>
            </Rise>
          );
        })}
      </PageShell>
    );
  }

  // ============ HASIL ============
  if (finished) {
    const total = scores.reduce((a, b) => a + b, 0);
    const max = q.steps.length * 2;
    const frac = total / max;
    const rank = rankOf(frac);
    const rc = RANK_COLOR[rank];
    const r = reward || { fresh: [], xpBefore: 0, xpAfter: 0 };
    const a = levelOf(r.xpBefore), b = levelOf(r.xpAfter);
    const up = b.level > a.level;
    const gain = r.xpAfter - r.xpBefore;
    const newT = r.fresh.map(trophyById).filter(Boolean);
    return (
      <PageShell title="Hasil" onBack={() => setQi(null)}>
        <View style={s.heroWrap}>
          <Banner kind="result" />
          <Pop big delay={450} tilt={-6} spin={10} style={[s.rankPos, ch.result.stamp === 'right' && { left: undefined, right: 14 }]}>
            <View style={[s.rankStamp, { borderColor: rc }]}>
              <Text style={s.rankLbl}>RANK</Text>
              <Text style={[s.rankBig, { color: rc }]}>{rank}</Text>
              {frac === 1 && <Burst count={16} radius={110} delay={700} colors={[rc, '#FFFFFF', COLOR.cyan]} />}
            </View>
          </Pop>
        </View>

        <Card title={`Selesai: ${q.title}`} accent={accentOf(q)}>
          <Pop delay={700} tilt={-2} spin={6} style={{ alignSelf: 'flex-start', marginBottom: 10 }}>
            <View style={[s.gelar, { backgroundColor: rc }]}><Text style={s.gelarT}>{RANK_TITLE[rank]}</Text></View>
          </Pop>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
            <CountUp to={total} delay={300} style={s.big} />
            <Text style={s.bigMax}> / {max}</Text>
          </View>
          <View style={s.stageRow}>
            {scores.map((p, i) => (
              <Rise key={i} delay={500 + i * 120} from={10}>
                <View style={[s.chip, { backgroundColor: PTS_COLOR[p] }]}><Text style={s.chipT}>T{i + 1}  +{p}</Text></View>
              </Rise>
            ))}
          </View>
          <Text style={s.body}>Petunjuk dipakai: {hintTotal} kali</Text>
          <Text style={s.body}>
            {total === max ? 'Sempurna! Kamu mengerjakan tanpa bantuan.' : total >= max / 2 ? 'Bagus. Coba ulang tanpa petunjuk untuk skor penuh.' : 'Tidak apa-apa. Lihat contoh di menu BELAJAR, lalu coba lagi.'}
          </Text>
        </Card>

        <Card title="Pengalaman" accent={COLOR.ice}>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <Text style={s.xpLv}>LV {b.level}  ·  {b.name} {b.num}</Text>
            <Text style={s.xpGain}>+{gain} XP</Text>
          </View>
          <View style={{ marginTop: 10 }}><Meter from={up ? 0 : a.frac} to={b.frac} height={12} delay={600} /></View>
          {gain === 0 && <Text style={s.note}>Skor terbaikmu belum terlampaui, jadi XP belum bertambah.</Text>}
          {up && (
            <Pop big delay={1300} tilt={-2} spin={6} style={{ alignSelf: 'flex-start', marginTop: 14 }}>
              <View style={s.levelUp}>
                <View style={{ flexDirection: 'row', alignItems: 'center', transform: [{ skewX: '12deg' }] }}>
                  <Text style={s.levelUpT}>LEVEL UP!  {a.level}</Text>
                  <Tri dir="right" size={10} color="#fff" style={{ marginHorizontal: 10 }} />
                  <Text style={s.levelUpT}>{b.level}</Text>
                </View>
              </View>
            </Pop>
          )}
        </Card>

        {newT.length > 0 && (
          <View style={{ marginBottom: 6 }}>
            <Rise delay={900}><Text style={s.secT}>TROPHY BARU!</Text></Rise>
            {newT.map((t, i) => <TrophyCard key={t.id} t={t} delay={1100 + i * 350} />)}
          </View>
        )}

        <View style={s.row}>
          <Btn label="ULANGI" onPress={() => start(qi)} tone="cyan" />
          <Btn label="SOAL LAIN" onPress={() => setQi(null)} />
          <Btn label="PROFIL" onPress={onProfile} tone="pink" />
        </View>
      </PageShell>
    );
  }

  // ============ SATU TAHAP ============
  const accent = accentOf(q);
  const over = solved || revealed;
  return (
    <PageShell title="Latihan" onBack={() => setQi(null)} focusable>
      <StageHud si={si} total={q.steps.length} scores={scores} streak={focus ? 0 : streak} hintTotal={hintTotal} />

      <Card title={q.title} accent={accent}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <View style={[s.lvBadge, { backgroundColor: LEVEL[q.level].color, marginLeft: 0 }]}><Text style={s.lvBadgeT}>{LEVEL[q.level].label}</Text></View>
        </View>
        {showSoal && <Highlight text={q.soal} words={q.kunci} on={hl} style={s.soal} />}
        {showSoal && <Pic rows={q.pic} />}
        {showSoal && q.tabel && <SimpleTable heads={q.tabel.heads} rows={q.tabel.rows} />}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: showSoal ? 10 : 0 }}>
          <Pressable onPress={() => setShowSoal((v) => !v)} style={{ marginRight: 18 }}>
            <View style={s.togRow}>
              <Tri dir={showSoal ? 'up' : 'down'} size={9} color={COLOR.cyan} style={{ marginRight: 8 }} />
              <Text style={s.toggle}>{showSoal ? 'TUTUP SOAL' : 'LIHAT SOAL'}</Text>
            </View>
          </Pressable>
          {showSoal && (
            <Pressable onPress={() => setHl((v) => !v)}>
              <View style={s.togRow}>
                <Box on={hl} size={12} color="#FFD400" />
                <Text style={[s.toggle, { color: '#FFD400', marginLeft: 8 }]}>SOROT KATA KUNCI</Text>
              </View>
            </Pressable>
          )}
        </View>
      </Card>

      <Card no={si + 1} title={st.refl ? 'Refleksi: jelaskan alasannya' : `Tahap ${si + 1} dari ${q.steps.length}`} accent={st.refl ? '#FFD400' : accent}>
        <Text key={'q' + si} style={s.ask}>{st.q}</Text>

        {order.map((idx, k) => {
          const status = (solved || revealed) && idx === st.ans ? 'right' : wrong.includes(idx) ? 'wrong' : over ? 'dim' : 'idle';
          return <Opt key={`${qi}-${si}-${idx}`} letter={LETTERS[k]} text={st.opts[idx]} status={status} delay={k * 90} onPress={() => pick(idx)} />;
        })}

        {!over && (
          <View>
            {wrong.length > 0 && <Rise key={wrong.length} from={8}><Text style={s.wrong}>Belum tepat. Coba lagi, atau minta petunjuk.</Text></Rise>}
            {st.hints.slice(0, hint).map((h, i) => <HintBubble key={i} n={i + 1} text={h} />)}
            {hint < maxHintsOf(q, st) && <Btn label={`PETUNJUK ${hint + 1}/${maxHintsOf(q, st)}`} onPress={openHint} />}
          </View>
        )}

        {over && (
          <View style={[s.result, { borderColor: solved ? COLOR.cyan : COLOR.accent }]}>
            <View style={s.stampRow}>
              <View style={{ width: 150, height: 46, justifyContent: 'center' }}>
                <Stamp text={solved ? 'BENAR!' : 'JAWABAN'} color={solved ? COLOR.cyan : COLOR.accent} fg={solved ? COLOR.navy : '#fff'} />
                {solved && !focus && <Burst count={12} radius={70} delay={150} />}
              </View>
              <Pop delay={350} spin={0}>
                <View style={[s.pts, { backgroundColor: PTS_COLOR[stagePts] }]}><Text style={s.ptsT}>+{stagePts} POIN</Text></View>
              </Pop>
            </View>
            <Text style={s.body}>{st.why}</Text>
            {si + 1 >= q.steps.length && (
              <Text style={s.sanity}>Uji masuk akal: {q.type === 'senilai' ? 'kalau satu besaran bertambah, besaran lainnya juga harus bertambah.' : 'kalau satu besaran bertambah, besaran lainnya harus berkurang.'} Cocokkah dengan jawabanmu?</Text>
            )}
            <Btn label={si + 1 >= q.steps.length ? 'LIHAT HASIL' : 'LANJUT'} icon={si + 1 >= q.steps.length ? undefined : 'right'} onPress={next} tone="cyan" />
          </View>
        )}
      </Card>
    </PageShell>
  );
}

const s = StyleSheet.create({
  lvRow: { flexDirection: 'row', marginBottom: 12, marginRight: -6 },
  lvTab: { borderWidth: 2, paddingHorizontal: 10, paddingVertical: 5, marginRight: 8, marginBottom: 8, transform: [{ skewX: '-12deg' }] },
  lvTabT: { fontSize: 11, fontWeight: '900', letterSpacing: 1.5, transform: [{ skewX: '12deg' }] },
  lvInfo: { color: COLOR.ice, fontSize: 13, lineHeight: 20, marginBottom: 16 },
  lvBadge: { paddingHorizontal: 8, paddingVertical: 2, marginLeft: 8, transform: [{ skewX: '-12deg' }] },
  lvBadgeT: { color: COLOR.navy, fontSize: 10, fontWeight: '900', letterSpacing: 1.5, transform: [{ skewX: '12deg' }] },
  sanity: { color: '#FFD400', fontSize: 14, lineHeight: 21, fontWeight: '600', marginTop: 10 },
  cekInfo: { color: '#FFD400', fontSize: 14, lineHeight: 21, fontWeight: '600', marginBottom: 16 },
  intro: { color: COLOR.text, fontSize: 15, lineHeight: 23, marginBottom: 16 },
  small: { color: COLOR.text, fontSize: 13, opacity: 0.9, marginTop: 3 },
  mapRow: { flexDirection:'row', alignItems:'flex-start', marginTop:6, marginBottom:14, paddingHorizontal:2 },
  mapNode: { flex:1, alignItems:'center', position:'relative' },
  mapDot: { width:30, height:30, alignItems:'center', justifyContent:'center', borderWidth:2.5, transform:[{ rotate:'45deg' }] },
  mapNum: { fontWeight:'900', fontSize:13, fontStyle:'italic', transform:[{ rotate:'-45deg' }] },
  mapCount: { fontSize:10, fontWeight:'900', letterSpacing:1, marginTop:2 },
  mapText: { color:COLOR.ice, fontSize:10, fontWeight:'900', marginTop:9, textAlign:'center', letterSpacing:1 },
  mapLine: { position:'absolute', top:14, left:'58%', right:'-42%', height:2, backgroundColor:'rgba(255,255,255,0.3)' },
  errorLead: { color:COLOR.text, fontSize:13, lineHeight:20, marginBottom:8 },
  errorRow: { borderWidth:1, borderColor:'rgba(255,212,0,0.4)', backgroundColor:'rgba(255,212,0,0.08)', padding:10, marginTop:7 },
  errorTitle: { color:COLOR.white, fontWeight:'800', fontSize:14 },
  errorMeta: { color:'#FFD45C', fontSize:12, fontWeight:'600', marginTop:4 },
  sum: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingLeft: 22, paddingRight: 16 },
  sumAv: { width: 54, height: 54, borderRadius: 27, borderWidth: 2, borderColor: COLOR.cyan },
  sumName: { color: COLOR.white, fontSize: 18, fontWeight: '900', fontStyle: 'italic' },
  sumLv: { color: COLOR.cyan, fontSize: 11, fontWeight: '900', letterSpacing: 1.5, marginTop: 1 },
  sumTro: { alignItems: 'center', marginLeft: 12, paddingLeft: 12, borderLeftWidth: 1, borderLeftColor: 'rgba(255,255,255,0.2)' },
  sumTroN: { color: '#FFC83D', fontSize: 26, fontWeight: '900', fontStyle: 'italic' },
  sumTroM: { color: COLOR.ice, fontSize: 14 },
  sumTroL: { color: COLOR.ice, fontSize: 9, fontWeight: '900', letterSpacing: 2 },
  mission: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingLeft: 24, paddingRight: 14, overflow: 'hidden' },
  rankBox: { width: 58, height: 58, alignItems: 'center', justifyContent: 'center', marginRight: 16, transform: [{ skewX: '-12deg' }] },
  rankT: { fontSize: 34, fontWeight: '900', fontStyle: 'italic', transform: [{ skewX: '12deg' }] },
  mTitle: { color: COLOR.white, fontSize: 16, fontWeight: '800', letterSpacing: 0.5, textTransform: 'uppercase' },
  score: { color: COLOR.ice, fontSize: 11, fontWeight: '800', letterSpacing: 0.8, marginTop: 6 },
  go: { fontSize: 11, fontWeight: '900', letterSpacing: 2, textAlign: 'center', includeFontPadding: false },
  goBox: { alignItems: 'center', marginLeft: 12, minWidth: 52 },
  togRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4 },

  soal: { color: COLOR.white, fontSize: 16, lineHeight: 26, fontWeight: '500' },
  toggle: { color: COLOR.cyan, fontSize: 11, fontWeight: '900', letterSpacing: 1.5, includeFontPadding: false },
  ask: { color: COLOR.white, fontSize: 17, lineHeight: 26, fontWeight: '700', marginBottom: 6 },
  wrong: { color: '#FF8AB5', fontWeight: '700', fontSize: 14, marginTop: 12 },
  result: { marginTop: 18, borderWidth: 2, padding: 14, backgroundColor: 'rgba(2,12,27,0.7)' },
  stampRow: { flexDirection: 'row', alignItems: 'center' },
  pts: { paddingHorizontal: 12, paddingVertical: 3, transform: [{ skewX: '-12deg' }] },
  ptsT: { color: COLOR.navy, fontWeight: '900', fontSize: 13, letterSpacing: 1, transform: [{ skewX: '12deg' }] },
  body: { color: COLOR.text, fontSize: 15, lineHeight: 23, fontWeight: '500', marginTop: 10 },

  heroWrap: { marginBottom: 56 },
  hero: { width: '100%', borderWidth: 2, borderColor: COLOR.cyan, overflow: 'hidden', backgroundColor: '#0AA5E8' },
  rankPos: { position: 'absolute', left: 14, bottom: -38 },
  rankStamp: { width: 96, height: 96, borderWidth: 4, backgroundColor: COLOR.bg, alignItems: 'center', justifyContent: 'center', transform: [{ skewX: '-8deg' }] },
  rankLbl: { color: COLOR.ice, fontSize: 10, fontWeight: '900', letterSpacing: 3, marginTop: 4 },
  rankBig: { fontSize: 58, lineHeight: 62, fontWeight: '900', fontStyle: 'italic' },
  big: { color: COLOR.cyan, fontSize: 56, lineHeight: 60, fontWeight: '900', fontStyle: 'italic' },
  bigMax: { color: COLOR.ice, fontSize: 24, fontWeight: '900', fontStyle: 'italic', marginBottom: 6 },
  stageRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 12 },
  chip: { paddingHorizontal: 10, paddingVertical: 2, marginRight: 8, marginBottom: 6, transform: [{ skewX: '-12deg' }] },
  chipT: { color: COLOR.navy, fontWeight: '900', fontSize: 12, transform: [{ skewX: '12deg' }] },
  xpLv: { color: COLOR.white, fontWeight: '900', fontStyle: 'italic', fontSize: 16 },
  xpGain: { color: '#FFC83D', fontWeight: '900', fontStyle: 'italic', fontSize: 22 },
  note: { color: COLOR.text, opacity: 0.7, fontSize: 12, marginTop: 10 },
  gelar: { paddingHorizontal: 14, paddingVertical: 3, transform: [{ skewX: '-12deg' }] },
  gelarT: { color: COLOR.navy, fontWeight: '900', fontStyle: 'italic', letterSpacing: 2, fontSize: 14, transform: [{ skewX: '12deg' }] },
  levelUp: { backgroundColor: '#FF1A1A', paddingHorizontal: 16, paddingVertical: 4, transform: [{ skewX: '-12deg' }] },
  levelUpT: { color: '#fff', fontWeight: '900', letterSpacing: 2, fontSize: 16, includeFontPadding: false },
  secT: { color: '#FFC83D', fontSize: 20, fontWeight: '900', fontStyle: 'italic', letterSpacing: 3, marginBottom: 12 },
  row: { flexDirection: 'row', flexWrap: 'wrap' },
});
