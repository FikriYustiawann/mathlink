import React, { useState } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import Text from '../components/Txt';
import { COLOR } from '../theme';
import PageShell, { Card } from '../components/PageShell';
import { Btn, ArrowTable, Tag, fmt, Highlight, Pic } from '../components/Ui';
import { CASES } from '../data';
import { Box } from '../components/Glyph';

// Bukti hasil kali / hasil bagi dihitung dari angka pada diagram
function proof(c) {
  const [a, b] = c.cols;
  const r1 = [a.v[0], b.v[0]];
  const r2 = [a.v[1], b.v[1]];
  if (c.ans === 'senilai') {
    return `${fmt(r1[1])} ÷ ${fmt(r1[0])} = ${fmt(r1[1] / r1[0])}   dan   ${fmt(r2[1])} ÷ ${fmt(r2[0])} = ${fmt(r2[1] / r2[0])}\nHasil bagi selalu sama → senilai.`;
  }
  return `${fmt(r1[0])} × ${fmt(r1[1])} = ${fmt(r1[0] * r1[1])}   dan   ${fmt(r2[0])} × ${fmt(r2[1])} = ${fmt(r2[0] * r2[1])}\nHasil kali selalu sama → berbalik nilai.`;
}

export default function Bedakan({ onBack, onResult }) {
  const [i, setI] = useState(0);
  const [pick, setPick] = useState(null);
  const [right, setRight] = useState(0);
  const [done, setDone] = useState(false);
  const [hl, setHl] = useState(false);
  const [proofOn, setProofOn] = useState(false);   // bukti hitung dibuka belakangan (tempo pelan)
  const c = CASES[i];
  const answered = pick !== null;
  const ok = answered && pick === c.ans;

  const choose = (p) => { if (!answered) { setPick(p); if (p === c.ans) setRight((r) => r + 1); } };
  const next = () => {
    if (i + 1 >= CASES.length) { setDone(true); onResult && onResult({ right, total: CASES.length }); return; }
    setI(i + 1); setPick(null); setProofOn(false);
  };
  const restart = () => { setI(0); setPick(null); setRight(0); setDone(false); setProofOn(false); };

  if (done) {
    return (
      <PageShell title="Bedakan" onBack={onBack} focusable>
        <Card title="Selesai!">
          <Text style={s.big}>{right} / {CASES.length}</Text>
          <Text style={s.body}>
            {right === CASES.length ? 'Hebat! Kamu sudah bisa membedakan senilai dan berbalik nilai.' : 'Pelajari lagi contohnya di menu BELAJAR, lalu coba ulang.'}
          </Text>
          <Btn label="ULANGI" onPress={restart} tone="cyan" />
        </Card>
      </PageShell>
    );
  }

  return (
    <PageShell title="Bedakan" onBack={onBack} focusable>
      <Card no={i + 1} title={`Kasus ${i + 1} dari ${CASES.length}`}>
        <Highlight text={c.story} words={c.kunci} on={hl} style={s.story} />
        <Pic rows={c.pic} />
        <Pressable onPress={() => setHl((v) => !v)} style={{ alignSelf: 'flex-start', marginTop: 10, flexDirection: 'row', alignItems: 'center' }}>
          <Box on={hl} size={12} color="#FFD400" />
          <Text style={[s.key, { marginLeft: 8 }]}>SOROT KATA KUNCI</Text>
        </Pressable>
        {hl && <Text style={s.keyInfo}>Dua besaran yang dibandingkan: {c.cols[0].name} dan {c.cols[1].name}.</Text>}
        <Text style={s.ask}>Tanya dirimu: kalau yang satu NAIK, yang satunya ikut naik atau turun?</Text>

        <View style={s.row}>
          <Btn label="NAIK–NAIK  (SENILAI)" onPress={() => choose('senilai')} tone="cyan" disabled={answered && pick !== 'senilai'} />
          <Btn label="NAIK–TURUN  (BERBALIK)" onPress={() => choose('berbalik')} tone="pink" disabled={answered && pick !== 'berbalik'} />
        </View>

        {answered && (
          <View style={[s.result, { borderColor: ok ? COLOR.cyan : COLOR.accent }]}>
            <Text style={[s.rTitle, { color: ok ? COLOR.cyan : COLOR.accent }]}>{ok ? 'BENAR!' : 'BELUM TEPAT'}</Text>
            <Tag type={c.ans} />
            <ArrowTable cols={c.cols} />
            <Text style={s.body}>{c.why}</Text>
            <Text style={s.sanity}>Uji masuk akal: kalau {c.cols[0].name.split(' (')[0]} naik, {c.cols[1].name.split(' (')[0]} harus {c.cols[1].dir === 'up' ? 'ikut naik' : 'turun'}. Cocok dengan tabel di atas?</Text>
            {proofOn
              ? <Text style={s.proof}>{proof(c)}</Text>
              : <Btn label="LIHAT BUKTI HITUNG" onPress={() => setProofOn(true)} tone="cyan" />}
            <Btn label={i + 1 >= CASES.length ? 'LIHAT HASIL' : 'LANJUT'} icon={i + 1 >= CASES.length ? undefined : 'right'} onPress={next} />
          </View>
        )}
      </Card>
    </PageShell>
  );
}

const s = StyleSheet.create({
  key: { color: '#FFD400', fontSize: 11, fontWeight: '900', letterSpacing: 2 },
  keyInfo: { color: COLOR.ice, fontSize: 13, marginTop: 8, fontStyle: 'italic' },
  sanity: { color: '#FFD400', fontSize: 13, lineHeight: 20, fontWeight: '700', marginTop: 10 },
  story: { color: COLOR.white, fontSize: 17, lineHeight: 26, fontWeight: '700' },
  ask: { marginTop: 14, color: COLOR.cyan, fontStyle: 'italic', fontSize: 13, fontWeight: '800' },
  row: { flexDirection: 'row', flexWrap: 'wrap' },
  result: { marginTop: 18, borderWidth: 2, padding: 14, backgroundColor: 'rgba(2,12,27,0.7)' },
  rTitle: { fontSize: 16, fontWeight: '900', fontStyle: 'italic', letterSpacing: 2, marginBottom: 8 },
  body: { color: COLOR.text, fontSize: 14, lineHeight: 22, marginTop: 12 },
  proof: { color: COLOR.ice, fontSize: 13, lineHeight: 21, marginTop: 10, fontWeight: '700' },
  big: { color: COLOR.cyan, fontSize: 44, fontWeight: '900', fontStyle: 'italic' },
});
