import React, { useState } from 'react';
import { View, TextInput, ScrollView, StyleSheet } from 'react-native';
import Text from '../components/Txt';
import { COLOR } from '../theme';
import { CHARACTERS } from '../config';
import AnimatedBackground from '../components/AnimatedBackground';
import Banner from '../components/Banner';
import { Btn } from '../components/Ui';
import { Pop } from '../components/Fx';

// Layar masuk: nama + pilih karakter. Skor disimpan per nama di perangkat ini (tanpa kata sandi).
export default function Login({ lastUser, onLogin }) {
  const [name, setName] = useState(lastUser || '');
  const clean = name.trim().replace(/\s+/g, ' ');
  const valid = clean.length >= 2 && clean.length <= 20;
  const submit = () => { if (valid) onLogin(clean); };
  const c = CHARACTERS.cowok;

  return (
    <View style={s.root}>
      <AnimatedBackground variant="sea" />
      <ScrollView contentContainerStyle={s.wrap} keyboardShouldPersistTaps="handled">
        <View style={[s.card, { borderColor: c.tint }]}>
          <View style={s.head}><Text style={s.headText}>LOG IN</Text></View>

          <Pop style={{ marginBottom: 16 }}>
            <Banner kind="profile" char={c} />
          </Pop>

          <Text style={[s.label, { color: c.tint }]}>USERNAME</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Ketik namamu"
            placeholderTextColor="#6C86B8"
            maxLength={20}
            autoCapitalize="words"
            autoCorrect={false}
            returnKeyType="go"
            onSubmitEditing={submit}
            style={[s.input, { borderColor: c.tint }]}
          />
          {name.length > 0 && !valid && <Text style={s.err}>Nama harus 2 sampai 20 karakter.</Text>}

          <Text style={s.who}>Pemandumu: {c.name}</Text>

          <Btn label="MASUK" icon="right" onPress={submit} disabled={!valid} tone="cyan" />
          <Text style={s.note}>Namamu dipakai untuk menyimpan skor di perangkat ini. Tidak perlu kata sandi.</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLOR.bg },
  wrap: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  card: { width: '100%', maxWidth: 460, padding: 22, borderWidth: 2, backgroundColor: COLOR.glass },
  head: { alignSelf: 'flex-start', backgroundColor: COLOR.white, paddingHorizontal: 16, paddingVertical: 3, marginBottom: 18, transform: [{ skewX: '-12deg' }] },
  headText: { color: COLOR.navy, fontSize: 24, fontWeight: '900', fontStyle: 'italic', letterSpacing: 3, transform: [{ skewX: '12deg' }] },
  label: { fontSize: 11, fontWeight: '900', letterSpacing: 2.5 },
  input: { marginTop: 8, borderWidth: 2, backgroundColor: '#050A1F', color: COLOR.white, fontSize: 20, fontFamily: 'Inter-700', paddingHorizontal: 14, paddingVertical: 12 },
  err: { color: '#FF8AB5', fontWeight: '800', fontSize: 12, marginTop: 8 },
  picks: { flexDirection: 'row', marginTop: 10 },
  pick: { flex: 1, alignItems: 'center', borderWidth: 2, borderColor: '#3B4A7A', backgroundColor: '#050A1F', paddingVertical: 12, marginRight: 10 },
  pickAv: { width: 64, height: 64, borderRadius: 32, borderWidth: 3 },
  pickG: { fontSize: 15, fontWeight: '900', fontStyle: 'italic', letterSpacing: 2, marginTop: 8 },
  pickN: { color: COLOR.text, fontSize: 11, fontWeight: '700', marginTop: 1 },
  check: { position: 'absolute', top: 6, right: 6, width: 20, height: 20, alignItems: 'center', justifyContent: 'center' },
  checkT: { color: COLOR.navy, fontWeight: '900', fontSize: 13 },
  who: { color: COLOR.ice, fontSize: 12, fontWeight: '700', marginTop: 10 },
  note: { color: COLOR.text, opacity: 0.65, fontSize: 12, lineHeight: 18, marginTop: 16 },
});
