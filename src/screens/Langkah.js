import React, { useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import Text from '../components/Txt';
import { COLOR } from '../theme';
import PageShell, { Card } from '../components/PageShell';
import { Btn, SimpleTable, Tag, Pic } from '../components/Ui';
import { EXAMPLES } from '../data';

export default function Langkah({ onBack }) {
  const [e, setE] = useState(0);
  const [k, setK] = useState(0);
  const [exp, setExp] = useState(false);   // penjelasan model dibuka setelah siswa mencoba menjelaskan sendiri
  const goK = (n) => { setK(n); setExp(false); };
  const ex = EXAMPLES[e];
  const st = ex.steps[k];
  const last = k === ex.steps.length - 1;
  const accent = ex.type === 'senilai' ? COLOR.cyan : '#FF4D8D';

  return (
    <PageShell title="Langkah" onBack={onBack} focusable>
      <View style={s.tabs}>
        {EXAMPLES.map((x, i) => (
          <Pressable key={x.key} onPress={() => { setE(i); goK(0); }} style={[s.tab, i === e && { backgroundColor: COLOR.white }]}>
            <Text style={[s.tabText, i === e && { color: COLOR.navy }]}>{x.title}</Text>
          </Pressable>
        ))}
      </View>

      <Card title={ex.title} accent={accent}>
        <Tag type={ex.type} />
        <Text style={s.soal}>{ex.soal}</Text>
        <Pic rows={ex.pic} />
      </Card>

      <Card no={k + 1} title={st.t} accent={accent}>
        <View style={s.dots}>
          {ex.steps.map((_, i) => (
            <View key={i} style={[s.dot, { backgroundColor: i <= k ? accent : 'rgba(255,255,255,0.2)' }]} />
          ))}
        </View>
        <Text style={s.body}>{st.body}</Text>
        {st.chips && st.chips.map((c) => (
          <View key={c.k} style={[s.chip, { borderColor: accent }]}>
            <Text style={[s.chipK, { color: accent }]}>{c.k.toUpperCase()}</Text>
            <Text style={s.chipV}>{c.v}</Text>
          </View>
        ))}
        {st.table && <SimpleTable heads={st.table.heads} rows={st.table.rows} />}

        <View style={s.nav}>
          <Btn label="SEBELUMNYA" icon="left" onPress={() => goK(k - 1)} disabled={k === 0} />
          {!last ? (
            <Btn label="LANJUT" icon="right" onPress={() => goK(k + 1)} tone="cyan" />
          ) : (
            <Btn label="ULANGI" onPress={() => goK(0)} tone="cyan" />
          )}
        </View>
        {last && (
          <View style={s.explain}>
            <Text style={s.explainT}>JELASKAN DULU</Text>
            <Text style={s.explainB}>Coba jelaskan dengan kata-katamu sendiri (lisan atau tulis di buku): mengapa jenisnya begitu, dan mengapa cara hitungnya begitu?</Text>
            {exp
              ? <Text style={s.explainM}>{ex.explain}</Text>
              : <Btn label="CEK PENJELASANMU" onPress={() => setExp(true)} tone="cyan" />}
          </View>
        )}
        {last && <Text style={s.done}>Sudah paham? Coba sendiri di menu LATIHAN.</Text>}
      </Card>
    </PageShell>
  );
}

const s = StyleSheet.create({
  tabs: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 18 },
  tab: { paddingHorizontal: 12, paddingVertical: 6, borderWidth: 2, borderColor: COLOR.cyan, marginRight: 8, marginBottom: 8, backgroundColor: COLOR.glass },
  tabText: { color: COLOR.white, fontWeight: '900', fontSize: 12, letterSpacing: 1 },
  soal: { color: COLOR.white, fontSize: 16, lineHeight: 25, fontWeight: '700' },
  dots: { flexDirection: 'row', marginBottom: 14 },
  dot: { height: 6, flex: 1, marginRight: 4 },
  body: { color: COLOR.white, fontSize: 17, lineHeight: 28, fontWeight: '600' },
  chip: { borderLeftWidth: 5, paddingLeft: 10, paddingVertical: 4, marginTop: 10, backgroundColor: 'rgba(2,12,27,0.55)' },
  chipK: { fontSize: 10, fontWeight: '900', letterSpacing: 2 },
  chipV: { color: COLOR.white, fontSize: 16, fontWeight: '800' },
  nav: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 },
  explain: { marginTop: 16, padding: 12, borderWidth: 2, borderColor: '#FFD400', backgroundColor: 'rgba(2,12,27,0.6)' },
  explainT: { color: '#FFD400', fontSize: 11, fontWeight: '900', letterSpacing: 2 },
  explainB: { color: COLOR.white, fontSize: 14, lineHeight: 22, marginTop: 6, fontWeight: '600' },
  explainM: { color: COLOR.ice, fontSize: 14, lineHeight: 22, marginTop: 10, fontWeight: '700' },
  done: { marginTop: 14, color: COLOR.ice, fontStyle: 'italic', fontWeight: '800', fontSize: 13 },
});
