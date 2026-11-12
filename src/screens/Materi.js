import React, { useEffect, useRef, useState } from 'react';
import { View, Image, Pressable, Linking, Animated, Easing, StyleSheet } from 'react-native';
import Text from '../components/Txt';
import { COLOR } from '../theme';
import PageShell, { Card } from '../components/PageShell';
import { ArrowTable, Btn, SimpleTable, Tag } from '../components/Ui';
import { MenuRow, Kicker, Ribbon, Chip, Slab, Ghost, TabBtn, RED } from '../components/P3';
import { Rise, Pop, Meter, CountUp, PressScale } from '../components/Fx';
import { Tri } from '../components/Glyph';
import { useChar } from '../CharacterContext';
import { sfx } from '../audio';
import { STEPS, STEP_INFO, GROUPS, GLOSSARY, STORIES, MYTHS, FORMULAS, WATCH_TIPS, VIDEOS, VIDEO_GROUPS, BOOKS, WEBS, YT_SEARCH, ytUrl, ytThumb, materiStat } from '../materiData';

const PINK = COLOR.accent;
const GOLD = '#FFD400';
const open = (url) => { try { Linking.openURL(url).catch(() => {}); } catch (e) { /* abaikan */ } };

// ---------- potongan kecil yang dipakai berulang ----------
function Table({ heads, rows, widths }) {
  const w = (i) => (widths ? widths[i] : 1);
  return (
    <View style={{ marginBottom: 14 }}>
      <View style={s.row}>{heads.map((h, i) => <Text key={i} style={[s.head, { flex: w(i) }]}>{h}</Text>)}</View>
      {rows.map((r, i) => (
        <View key={i} style={s.row}>{r.map((c, j) => <Text key={j} style={[j === 0 && widths ? s.cellKey : s.cell, { flex: w(j) }]}>{c}</Text>)}</View>
      ))}
    </View>
  );
}
function P({ children, strong, style }) {
  return <Text style={[s.desc, strong && { fontWeight: '800', color: COLOR.ice }, style]}>{children}</Text>;
}
function Formula({ children, color = COLOR.cyan }) {
  return <View style={[s.formula, { borderColor: color }]}><Text style={[s.formulaT, { color }]}>{children}</Text></View>;
}
function Note({ children, color = GOLD, label = 'INGAT' }) {
  return (
    <View style={[s.note, { borderColor: color }]}>
      <Text style={[s.noteL, { color }]}>{label}</Text>
      <Text style={s.noteT}>{children}</Text>
    </View>
  );
}
function Sub({ children, color = COLOR.cyan }) {
  return <Text style={[s.sub, { color }]}>{children}</Text>;
}

// Kotak jawaban yang dibuka dengan ketukan: siswa mencoba dulu, baru melihat pembahasan.
function Reveal({ children, color = COLOR.cyan, label = 'LIHAT PEMBAHASAN' }) {
  const [show, setShow] = useState(false);
  return (
    <View>
      <Pressable onPress={() => { sfx(show ? 'back' : 'select'); setShow(!show); }} style={[s.revBtn, { borderColor: color }, show && { backgroundColor: color }]}>
        <Text style={[s.revT, { color: show ? COLOR.navy : color }]}>{show ? 'TUTUP PEMBAHASAN' : label}</Text>
      </Pressable>
      {show && <Rise from={10} style={[s.revBox, { borderColor: color }]}>{children}</Rise>}
    </View>
  );
}

// ---------- 0. KONSEP ----------
function Concept() {
  return (
    <View>
      <Card title="Mulai dari besaran" accent={COLOR.ice}>
        <P>Besaran adalah sesuatu yang bisa dihitung atau diukur, misalnya banyak barang, harga, jarak, waktu, atau jumlah pekerja. Dalam satu soal cerita biasanya ada dua besaran yang saling terhubung. Mengubah yang satu akan ikut mengubah yang lain.</P>
        <P>Perbandingan membantu kita menjawab: kalau besaran pertama berubah, besaran kedua menjadi berapa? Kunci pertama selalu sama: tentukan dulu jenis hubungannya, baru menghitung.</P>
        <P strong>Tanyakan: apa yang tetap (konstan) di antara kedua besaran ini?</P>
      </Card>

      <Card title="Apa itu perbandingan (rasio)?" accent={COLOR.ice} delay={60}>
        <P>Perbandingan membandingkan dua nilai dan ditulis a : b (dibaca "a banding b"). Contoh: dalam sebuah keranjang ada 3 apel dan 5 jeruk, maka perbandingan apel dan jeruk adalah 3 : 5.</P>
        <Sub>Perbandingan yang ekuivalen</Sub>
        <P>Kalau kedua angka dikali atau dibagi bilangan yang sama (bukan nol), nilai perbandingannya tidak berubah.</P>
        <Formula color={COLOR.ice}>2 : 3 = 4 : 6 = 6 : 9</Formula>
        <Sub>Menyederhanakan</Sub>
        <P>Bagi kedua angka dengan faktor persekutuan terbesar (FPB). Contoh: 12 : 18, dengan FPB 6, menjadi 2 : 3.</P>
        <Sub>Skala pada peta</Sub>
        <P>Skala 1 : 500.000 berarti 1 cm di peta mewakili 500.000 cm di dunia nyata. Jarak 4 cm di peta menjadi 4 × 500.000 = 2.000.000 cm = 20 km.</P>
        <Sub>Membagi menurut perbandingan</Sub>
        <P>Uang Rp60.000 dibagi untuk dua anak dengan perbandingan 2 : 3. Jumlah bagian = 2 + 3 = 5, jadi 1 bagian = 60.000 ÷ 5 = 12.000. Anak pertama 2 × 12.000 = Rp24.000, anak kedua 3 × 12.000 = Rp36.000.</P>
      </Card>

      <Card no="A" title="Senilai: yang tetap adalah hasil bagi" delay={120}>
        <P>Dua besaran disebut senilai jika keduanya naik bersama atau turun bersama dengan laju yang sama. Contohnya harga dan jumlah barang: beli 2 kali lebih banyak, bayar 2 kali lebih banyak.</P>
        <Formula>b ÷ a selalu sama  (b = k × a)</Formula>
        <P>Angka k disebut konstanta perbandingan, yaitu harga satuan, jarak per liter, atau sejenisnya. Pada grafik, titik-titiknya membentuk garis lurus yang melewati titik (0, 0). Kalau tidak ada barang, tidak ada harga.</P>
        <P>Contoh sehari-hari: harga dan jumlah barang, bensin dan jarak, bahan kue dan jumlah porsi, gaji dan jam kerja.</P>
      </Card>

      <Card no="B" title="Berbalik nilai: yang tetap adalah hasil kali" accent={PINK} delay={180}>
        <P>Dua besaran disebut berbalik nilai jika yang satu naik, yang lain turun, dan hasil kali keduanya tetap. Ada "total" yang harus dibagi: beban kerja, jarak, atau uang patungan.</P>
        <Formula color={PINK}>a × b selalu sama  (b = k ÷ a)</Formula>
        <P>Pada grafik, titik-titiknya membentuk kurva menurun yang makin mendatar dan tidak melewati (0, 0). Kalau pekerja sangat banyak, hari yang dibutuhkan mendekati nol tetapi tidak pernah benar-benar nol.</P>
        <P>Contoh sehari-hari: pekerja dan lama pengerjaan, laju dan waktu tempuh (jarak tetap), jumlah orang dan iuran (harga tetap), persediaan makanan dan lama habisnya.</P>
      </Card>

      <Card title="Kesalahan yang sering terjadi" accent={GOLD} delay={240}>
        <P>1. Mengira semua soal "makin banyak" adalah senilai. Periksa dulu arah besaran kedua: ikut naik, atau justru turun?</P>
        <P>2. Memakai "aturan silang" tanpa tahu jenisnya. Rumus silang yang sama bisa menghasilkan jawaban salah kalau jenis hubungannya keliru. Penelitian tentang miskonsepsi siswa kelas VII menunjukkan hal ini cukup umum.</P>
        <P>3. Lupa menguji jawaban. Setelah menghitung, tanya: apakah hasilnya masuk akal? Pekerja bertambah tetapi hari ikut bertambah tentu ada yang keliru.</P>
        <P>4. Salah memasangkan angka. Pastikan angka yang sejenis (misalnya liter dengan liter) berada di kolom yang sama.</P>
        <P>5. Menganggap selisih sama dengan perbandingan. Umur 5 dan 10 tahun berselisih 5; lima tahun lagi menjadi 10 dan 15, selisihnya tetap 5 tetapi perbandingannya berubah dari 1 : 2 menjadi 2 : 3.</P>
      </Card>
    </View>
  );
}

// ---------- 1. SENILAI ----------
function Direct() {
  return (
    <View>
      <Card no="1" title="Contoh senilai: bensin & jarak">
        <Text style={s.desc}>Konteks: bensin dan jarak tempuh. Bensin makin banyak, jarak makin jauh.</Text>
        <Table heads={['Bensin (L)', 'Jarak (km)']} rows={[['3  (↑ naik)', '45  (↑ naik)'], ['8  (↑ naik)', '120  (↑ naik)']]} />
        <ArrowTable cols={[{ name: 'Bensin (L)', v: [3, 8], dir: 'up' }, { name: 'Jarak (km)', v: [45, 120], dir: 'up' }]} />
        <Text style={[s.logic, { color: COLOR.cyan }]}>Bensin bertambah, jarak ikut bertambah.</Text>
        <Text style={s.rule}>Hasil bagi selalu sama: 45 ÷ 3 = 120 ÷ 8 = 15</Text>
      </Card>

      <Card title="Membaca tabel senilai" delay={60}>
        <P>Untuk tabel yang lebih panjang, cukup periksa satu hal: apakah hasil bagi jarak ÷ bensin selalu sama? Kalau ya, dua besaran itu senilai.</P>
        <Table heads={['Bensin (L)', 'Jarak (km)', 'Jarak ÷ Bensin']} rows={[['1', '15', '15'], ['2', '30', '15'], ['4', '60', '15'], ['8', '120', '15']]} />
        <P>Kolom paling kanan selalu 15. Angka 15 itulah konstanta k: setiap 1 liter bensin menempuh 15 km.</P>
        <Note>Tabel senilai selalu memuat pasangan (0, 0). Tidak ada bensin berarti tidak ada jarak.</Note>
      </Card>

      <Card title="Bentuk persamaan dan grafik" delay={120}>
        <P>Hubungan senilai dapat ditulis sebagai persamaan y = k × x. Untuk contoh bensin, jarak = 15 × bensin.</P>
        <Formula>y = 15x</Formula>
        <P>Kalau dimasukkan ke grafik, titik (1, 15), (2, 30), (4, 60), dan (8, 120) tersusun pada satu garis lurus yang menanjak dari titik (0, 0). Makin curam garisnya, makin besar nilai k.</P>
        <P>Ingin melihatnya bergerak? Buka menu LAB di lobi, lalu geser angkanya.</P>
      </Card>

      <Card title="Ciri senilai yang mudah dikenali" accent={GOLD} delay={180}>
        <P>1. Kedua besaran berubah ke arah yang sama (naik–naik atau turun–turun).</P>
        <P>2. Hasil bagi tiap pasangan nilai selalu sama.</P>
        <P>3. Ada "harga satuan" atau "per satuan": per liter, per buku, per jam.</P>
        <P>4. Kalau salah satu nol, yang lain juga nol.</P>
      </Card>
    </View>
  );
}

// ---------- 2. BERBALIK NILAI ----------
function Inverse() {
  return (
    <View>
      <Card no="2" title="Contoh berbalik nilai: pekerja & waktu" accent={PINK}>
        <Text style={s.desc}>Konteks: pekerja dan waktu bangunan. Pekerja makin banyak, hari makin sedikit.</Text>
        <Table heads={['Pekerja (orang)', 'Waktu (hari)']} rows={[['15  (↑ naik)', '14  (↓ turun)'], ['21  (↑ naik)', '10  (↓ turun)']]} />
        <ArrowTable cols={[{ name: 'Pekerja (orang)', v: [15, 21], dir: 'up' }, { name: 'Waktu (hari)', v: [14, 10], dir: 'down' }]} />
        <Text style={[s.logic, { color: PINK }]}>Pekerja ditambah, waktu selesai makin cepat.</Text>
        <Text style={s.rule}>Hasil kali selalu sama: 15 × 14 = 21 × 10 = 210</Text>
      </Card>

      <Card title="Membaca tabel berbalik nilai" accent={PINK} delay={60}>
        <P>Pada tabel berbalik nilai, yang tetap adalah hasil kali. Angka tetap itu menyatakan "total pekerjaan", dalam satuan hari-orang.</P>
        <Table heads={['Pekerja (orang)', 'Waktu (hari)', 'Pekerja × Waktu']} rows={[['1', '24', '24'], ['2', '12', '24'], ['3', '8', '24'], ['4', '6', '24'], ['6', '4', '24']]} />
        <P>Kolom paling kanan selalu 24. Artinya pekerjaan itu butuh 24 hari-orang: 1 orang selesai 24 hari, 2 orang 12 hari, dan seterusnya.</P>
        <Note color={PINK}>Pekerja dua kali lipat membuat waktu menjadi setengahnya. Pekerja tiga kali lipat membuat waktu menjadi sepertiganya.</Note>
      </Card>

      <Card title="Bentuk persamaan dan grafik" accent={PINK} delay={120}>
        <P>Hubungan berbalik nilai ditulis y = k ÷ x (atau x × y = k). Untuk contoh di atas, waktu = 24 ÷ pekerja.</P>
        <Formula color={PINK}>y = 24 ÷ x</Formula>
        <P>Grafiknya kurva menurun yang makin mendatar (hiperbola). Kurva ini tidak menyentuh sumbu mana pun: x tidak mungkin 0 (tidak ada pekerja berarti pekerjaan tidak selesai) dan y tidak pernah tepat 0.</P>
      </Card>

      <Card title="Ciri berbalik nilai yang mudah dikenali" accent={GOLD} delay={180}>
        <P>1. Kedua besaran berubah berlawanan arah: yang satu naik, yang lain turun.</P>
        <P>2. Hasil kali tiap pasangan nilai selalu sama.</P>
        <P>3. Ada sesuatu yang "dibagi rata" atau "total tetap": pekerjaan, jarak, uang patungan, persediaan.</P>
        <P>4. Soal sering memakai kata cukup untuk, selesai dalam, atau dibagi rata.</P>
      </Card>
    </View>
  );
}

// ---------- 3. CARA HITUNG ----------
function Method() {
  return (
    <View>
      <Card title="Tiga cara menghitung" accent={COLOR.ice}>
        <P>Setelah jenisnya ditentukan, ada tiga cara untuk mencari nilai yang ditanyakan. Ketiganya memberi jawaban sama. Pilih satu yang paling kamu yakini, lalu pakai terus supaya tidak tertukar.</P>
        <P strong>Cara 1 = nilai satuan (paling mudah diingat), Cara 2 = rasio, Cara 3 = kali silang atau hasil kali.</P>
      </Card>

      <Card no="A" title="Senilai: 5 buku Rp35.000, maka 8 buku?" delay={60}>
        <Sub>Cara 1: nilai satuan</Sub>
        <P>Cari harga 1 buku dulu: 35.000 ÷ 5 = Rp7.000. Harga 8 buku = 8 × 7.000 = Rp56.000.</P>
        <Sub>Cara 2: rasio sama</Sub>
        <Formula>5 ÷ 8 = 35.000 ÷ x</Formula>
        <P>Ubah menjadi x = 35.000 × 8 ÷ 5 = 56.000.</P>
        <Sub>Cara 3: kali silang</Sub>
        <Formula>5 × x = 8 × 35.000</Formula>
        <P>5x = 280.000, jadi x = 280.000 ÷ 5 = Rp56.000.</P>
        <Note color={COLOR.cyan} label="CEK">Buku bertambah dari 5 ke 8 (naik) dan harga naik dari 35.000 ke 56.000 (naik). Arahnya sama, jadi masuk akal.</Note>
      </Card>

      <Card no="B" title="Berbalik nilai: 6 pekerja 20 hari, maka 8 pekerja?" accent={PINK} delay={120}>
        <Sub color={PINK}>Cara 1: nilai satuan (total pekerjaan)</Sub>
        <P>Total pekerjaan = 6 × 20 = 120 hari-orang. Kalau dikerjakan 8 orang: 120 ÷ 8 = 15 hari.</P>
        <Sub color={PINK}>Cara 2: rasio dibalik</Sub>
        <Formula color={PINK}>6 ÷ 8 = x ÷ 20</Formula>
        <P>Pada berbalik nilai, salah satu sisi rasio dibalik. Hasilnya x = 6 × 20 ÷ 8 = 15.</P>
        <Sub color={PINK}>Cara 3: hasil kali sama</Sub>
        <Formula color={PINK}>6 × 20 = 8 × x</Formula>
        <P>120 = 8x, jadi x = 15 hari.</P>
        <Note color={PINK} label="CEK">Pekerja naik dari 6 ke 8, waktu turun dari 20 ke 15. Arahnya berlawanan, jadi masuk akal.</Note>
      </Card>

      <Card title="Mana yang dikali, mana yang dibagi?" accent={GOLD} delay={180}>
        <Table widths={[1.2, 1, 1]} heads={['', 'Senilai', 'Berbalik']} rows={[
          ['Kolom yang sama', 'Dibagi (b ÷ a)', 'Dikali (a × b)'],
          ['Pola silang', 'a₁ × b₂ = a₂ × b₁', 'a₁ × b₁ = a₂ × b₂'],
        ]} />
        <P>Cara mudah menghindari salah rumus: tentukan dulu apakah soalnya senilai atau berbalik nilai, tulis tabel dua baris, lalu baru pilih satu cara di atas.</P>
      </Card>
    </View>
  );
}

// ---------- 4. CONTOH SOAL ----------
function Problem({ no, type, q, children, delay = 0 }) {
  const c = type === 'senilai' ? COLOR.cyan : type === 'berbalik' ? PINK : GOLD;
  const tag = type === 'senilai' ? 'SENILAI' : type === 'berbalik' ? 'BERBALIK NILAI' : 'BUKAN KEDUANYA';
  return (
    <Card no={no} title={tag} accent={c} delay={delay}>
      <P style={{ fontWeight: '700' }}>{q}</P>
      <P style={{ opacity: 0.7, fontSize: 12 }}>Coba hitung dulu di kertas, baru lihat pembahasan.</P>
      <Reveal color={c}>{children}</Reveal>
    </Card>
  );
}

function Examples() {
  return (
    <View>
      <Card title="Cara memakai bagian ini" accent={COLOR.ice}>
        <P>Setiap soal punya pembahasan yang tersembunyi. Bacalah soalnya, tentukan jenisnya (naik–naik atau naik–turun), hitung sendiri, baru ketuk "LIHAT PEMBAHASAN" untuk mencocokkan.</P>
      </Card>

      <Problem no="1" type="senilai" delay={60} q="Sebuah motor menempuh 90 km dengan 2 liter bensin. Berapa jarak yang ditempuh dengan 5 liter bensin?">
        <P>Jenis: bensin naik, jarak naik, jadi senilai.</P>
        <P>1 liter = 90 ÷ 2 = 45 km.</P>
        <P>5 liter = 5 × 45 = 225 km.</P>
        <P strong>Jawaban: 225 km.</P>
      </Problem>

      <Problem no="2" type="senilai" delay={100} q="Resep kue untuk 4 porsi memakai 300 gram tepung. Berapa gram tepung untuk 10 porsi?">
        <P>Jenis: porsi naik, tepung naik, jadi senilai.</P>
        <P>Tepung per porsi = 300 ÷ 4 = 75 gram.</P>
        <P>10 porsi = 10 × 75 = 750 gram.</P>
        <P strong>Jawaban: 750 gram.</P>
      </Problem>

      <Problem no="3" type="berbalik" delay={140} q="Persediaan makanan 40 ekor ayam cukup untuk 15 hari. Kalau ayamnya menjadi 50 ekor, makanan cukup berapa hari?">
        <P>Jenis: ayam naik, hari turun, dan totalnya (persediaan) tetap, jadi berbalik nilai.</P>
        <P>Total persediaan = 40 × 15 = 600 hari-ekor.</P>
        <P>50 × x = 600, jadi x = 600 ÷ 50 = 12.</P>
        <P strong>Jawaban: 12 hari.</P>
      </Problem>

      <Problem no="4" type="berbalik" delay={180} q="Dengan kecepatan 60 km/jam, sebuah perjalanan ditempuh dalam 4 jam. Berapa jam yang dibutuhkan jika kecepatannya 80 km/jam?">
        <P>Jenis: kecepatan naik, waktu turun, jarak tetap, jadi berbalik nilai.</P>
        <P>Jarak = 60 × 4 = 240 km.</P>
        <P>80 × x = 240, jadi x = 240 ÷ 80 = 3.</P>
        <P strong>Jawaban: 3 jam.</P>
      </Problem>

      <Problem no="5" type="berbalik" delay={220} q="Sebuah proyek direncanakan selesai dalam 24 hari oleh 10 pekerja. Setelah 6 hari berjalan, ditambah 5 pekerja (jadi 15 orang). Berapa hari lagi pekerjaan selesai?">
        <P>Soal dua tahap. Hitung dulu sisa pekerjaan setelah 6 hari.</P>
        <P>Sisa waktu menurut rencana = 24 − 6 = 18 hari, dengan 10 pekerja. Sisa pekerjaan = 10 × 18 = 180 hari-orang.</P>
        <P>Sekarang pekerjanya 15 orang (berbalik nilai): 15 × x = 180, jadi x = 12.</P>
        <P strong>Jawaban: 12 hari lagi. Total 6 + 12 = 18 hari, lebih cepat dari rencana 24 hari.</P>
      </Problem>

      <Problem no="6" type="bukan" delay={260} q="Dina berumur 10 tahun dengan tinggi 140 cm. Berapa tinggi Dina saat berumur 20 tahun, dihitung dengan perbandingan senilai?">
        <P>Tidak bisa. Umur dan tinggi badan memang sama-sama naik, tetapi laju kenaikannya tidak tetap. Tinggi badan berhenti bertambah di usia dewasa.</P>
        <P>Kalau dipaksa senilai: 140 × 2 = 280 cm, jelas tidak masuk akal.</P>
        <P strong>Pelajaran: "sama-sama naik" belum cukup. Hasil bagi harus selalu sama, dan itu tidak terjadi di sini.</P>
      </Problem>
    </View>
  );
}

// ---------- 5. RANGKUMAN ----------
function Summary() {
  return (
    <View>
      <Card title="Senilai vs berbalik nilai" accent={COLOR.ice}>
        <Table widths={[1.05, 1, 1]} heads={['', 'Senilai', 'Berbalik nilai']} rows={[
          ['Arah', 'Sejalan: naik–naik atau turun–turun', 'Berlawanan: naik–turun'],
          ['Yang tetap', 'Hasil bagi', 'Hasil kali'],
          ['Persamaan', 'y = k × x', 'y = k ÷ x'],
          ['Pola silang', 'a₁ × b₂ = a₂ × b₁', 'a₁ × b₁ = a₂ × b₂'],
          ['Grafik', 'Garis lurus lewat (0, 0)', 'Kurva menurun, tidak lewat (0, 0)'],
          ['Kalau x dua kali', 'y dua kali', 'y setengahnya'],
          ['Contoh', 'Harga & jumlah barang', 'Pekerja & waktu'],
        ]} />
      </Card>

      <Card title="Langkah menjawab soal cerita" accent={GOLD} delay={60}>
        <P>1. Tandai dua besaran dan satuannya.</P>
        <P>2. Tulis tabel dua baris dari data soal.</P>
        <P>3. Tanya: besaran pertama naik, besaran kedua naik atau turun?</P>
        <P>4. Tentukan jenisnya, lalu pilih satu cara hitung.</P>
        <P>5. Hitung, lalu cek apakah arah jawabannya masuk akal.</P>
        <P>6. Tulis jawaban lengkap dengan satuannya.</P>
      </Card>

      <Card title="Kalau masih ragu" accent={COLOR.cyan} delay={120}>
        <P>Ujilah dengan angka kecil. Misalkan besaran pertama dijadikan 2 kali lipat. Kalau besaran kedua ikut menjadi 2 kali lipat, itu senilai. Kalau menjadi setengahnya, itu berbalik nilai. Kalau tidak keduanya, bukan perbandingan senilai maupun berbalik nilai.</P>
      </Card>
    </View>
  );
}

// ---------- 6. CEK CEPAT ----------
function Quick() {
  const items = [
    ['Tandai', 'Tandai dua besaran di soal.'],
    ['Tanya', 'Kalau yang satu NAIK, yang satunya naik atau turun?'],
    ['Putuskan', 'Naik–naik: SENILAI (hasil bagi sama). Naik–turun: BERBALIK NILAI (hasil kali sama).'],
    ['Cek', 'Apakah jawabannya masuk akal?'],
  ];
  const tests = [
    ['Harga 3 kg jeruk dan harga 6 kg jeruk', 'Senilai'],
    ['Banyak tukang dan lama membangun pagar', 'Berbalik nilai'],
    ['Jumlah anggota patungan dan iuran tiap orang (total tetap)', 'Berbalik nilai'],
    ['Lama menyala lampu dan listrik yang terpakai', 'Senilai'],
  ];
  return (
    <View>
      <Card no="3" title="Cara Cepat Membedakan" accent={GOLD}>
        {items.map(([k, v], i) => (
          <Rise key={k} delay={i * 90} style={s.qRow}>
            <View style={s.qKey}><Text style={s.qKeyT}>{k}</Text></View>
            <Text style={[s.desc, { flex: 1, marginBottom: 0 }]}>{v}</Text>
          </Rise>
        ))}
      </Card>
      <Card title="Tebak jenisnya" accent={COLOR.cyan} delay={120}>
        <P>Pikirkan dulu jawabanmu untuk tiap pasangan besaran, lalu ketuk untuk melihat jawabannya.</P>
        {tests.map(([q, a], i) => (
          <View key={i} style={{ marginBottom: 12 }}>
            <P style={{ marginBottom: 6, fontWeight: '700' }}>{i + 1}. {q}</P>
            <Reveal color={a === 'Senilai' ? COLOR.cyan : PINK} label="LIHAT JAWABAN"><P strong style={{ marginBottom: 0 }}>{a}</P></Reveal>
          </View>
        ))}
      </Card>
    </View>
  );
}

// ---------- 7. VIDEO ----------
function VideoCard({ v, n, seen, onOpen, i, color }) {
  return (
    <Rise delay={i * 70} from={14} style={{ marginBottom: 14 }}>
      <PressScale onPress={() => { sfx('select'); onOpen(v.id); open(ytUrl(v.id)); }} to={0.97}>
        <Slab color={seen ? '#3DDC84' : color} skew={-5}>
          <View style={s.vid}>
            <View style={s.thumb}>
              <View style={s.thumbFallback}><Tri dir="right" size={16} color="rgba(255,255,255,0.35)" /></View>
              <Image source={{ uri: ytThumb(v.id) }} style={s.thumbImg} />
              <View style={s.play}><Tri dir="right" size={11} color={COLOR.navy} /></View>
              <View style={[s.vidNo, { backgroundColor: color }]}><Text style={s.vidNoT}>{n}</Text></View>
            </View>
            <View style={{ flex: 1, paddingLeft: 12 }}>
              <Text style={s.vidT} numberOfLines={3}>{v.title}</Text>
              <Text style={s.vidN} numberOfLines={3}>{v.note}</Text>
              <Text style={[s.vidGo, { color: seen ? '#3DDC84' : color }]}>{seen ? 'SUDAH DIBUKA  ·  TONTON LAGI' : 'TONTON DI YOUTUBE'}</Text>
            </View>
          </View>
        </Slab>
      </PressScale>
    </Rise>
  );
}

function Videos({ seenMap, onVideo }) {
  const n = Object.keys(seenMap || {}).length;
  let no = 0;
  return (
    <View>
      <Card title="Cara menonton yang efektif" accent={COLOR.ice}>
        <P>Belajar dari penjelasan guru lain sering membantu karena cara menyampaikannya berbeda. Ketuk video untuk membukanya di YouTube.</P>
        {WATCH_TIPS.map((t, i) => <P key={i}>{i + 1}. {t}</P>)}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
          <Chip label={`DIBUKA ${n}/${VIDEOS.length}`} color={n >= VIDEOS.length ? '#3DDC84' : COLOR.cyan} />
        </View>
        <P style={{ opacity: 0.7, fontSize: 12, marginTop: 10, marginBottom: 0 }}>Video milik pembuatnya masing-masing; kalau ada yang tidak bisa dibuka, pakai tombol cari di bawah.</P>
      </Card>
      {VIDEO_GROUPS.map((g) => {
        const list = VIDEOS.filter((v) => v.grp === g.key);
        if (!list.length) return null;
        return (
          <View key={g.key} style={{ marginBottom: 6 }}>
            <Ribbon color={g.color} textColor={COLOR.navy}>{g.name}</Ribbon>
            <Text style={s.grpSub}>{g.sub}</Text>
            {list.map((v, i) => { no += 1; return <VideoCard key={v.id} v={v} n={no} i={i} color={g.color} seen={!!(seenMap && seenMap[v.id])} onOpen={onVideo} />; })}
          </View>
        );
      })}
      <Btn label="CARI VIDEO LAIN DI YOUTUBE" icon="right" onPress={() => open(YT_SEARCH)} style={{ alignSelf: 'stretch', marginBottom: 6 }} />
    </View>
  );
}

// ---------- 8. RUJUKAN ----------
function RefList({ list, start = 1 }) {
  return list.map((r, i) => (
    <Pressable key={r.url} onPress={() => { sfx('click'); open(r.url); }} style={s.ref}>
      <Text style={s.refNo}>{start + i}</Text>
      <View style={{ flex: 1 }}>
        <Text style={s.refT}>{r.t}</Text>
        <Text style={s.refBy}>{r.by}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}><Text style={[s.refGo, { marginTop: 0 }]}>BUKA TAUTAN</Text><Tri dir="right" size={8} color={COLOR.cyan} style={{ marginLeft: 8 }} /></View>
      </View>
    </Pressable>
  ));
}

function Refs() {
  return (
    <View>
      <Card title="Buku teks" accent={COLOR.ice}>
        <Text style={s.desc}>Isi materi ini merangkum konsep umum perbandingan senilai dan berbalik nilai. Untuk bahasan yang lebih lengkap, baca buku teks resmi berikut (ketuk untuk membuka).</Text>
        <RefList list={BOOKS} />
      </Card>
      <Card title="Bacaan & latihan di internet" accent={COLOR.cyan} delay={80}>
        <RefList list={WEBS} start={BOOKS.length + 1} />
      </Card>
    </View>
  );
}

// ---------- 9. SIAP ----------
function Ready({ onPractice, onReview, onLab }) {
  const ch = useChar();
  return (
    <Pop>
      <View style={[s.ready, { borderColor: ch.tint }]}>
        <Image source={ch.avatar} style={[s.av, { borderColor: ch.tint }]} />
        <Text style={[s.readyName, { color: ch.tint }]}>{ch.name}</Text>
        <Text style={s.readyT}>Kamu sudah tahu dua jenisnya dan cara membedakannya. Latihan bikin makin hafal.</Text>
        <Btn label="MULAI LATIHAN" icon="right" tone="cyan" onPress={onPractice} style={{ alignSelf: 'stretch' }} />
        {onLab ? <Btn label="COBA DI LAB" icon="right" onPress={onLab} style={{ alignSelf: 'stretch', marginTop: 10 }} /> : null}
        <Btn label="ULANGI DARI AWAL" onPress={onReview} style={{ alignSelf: 'stretch', marginTop: 10 }} />
      </View>
    </Pop>
  );
}

// ---------- 10. KAMUS ----------
function Glossary() {
  return (
    <View>
      <Card title="Kamus istilah" accent={COLOR.ice}>
        <P>Dua belas kata yang sering muncul di soal dan pembahasan. Baca sekali, lalu kembali ke sini kalau menemukan kata yang membingungkan.</P>
      </Card>
      {GLOSSARY.map((g, i) => (
        <Rise key={g.t} delay={i * 50} from={12} style={s.term}>
          <View style={s.termNo}><Text style={s.termNoT}>{String(i + 1).padStart(2, '0')}</Text></View>
          <View style={{ flex: 1 }}>
            <Text style={s.termT}>{g.t}</Text>
            <Text style={s.termD}>{g.d}</Text>
            <Text style={s.termEx}>{g.ex}</Text>
          </View>
        </Rise>
      ))}
    </View>
  );
}

// ---------- 11. KISAH SEHARI-HARI ----------
function Stories() {
  return (
    <View>
      <Card title="Cara memakai bagian ini" accent={COLOR.ice}>
        <P>Lima situasi dekat kehidupan. Baca ceritanya, lihat tabelnya, tebak jenis dan jawabannya, lalu buka kunci untuk mencocokkan.</P>
      </Card>
      {STORIES.map((x, i) => {
        const c = x.type === 'senilai' ? COLOR.cyan : PINK;
        return (
          <Card key={x.t} no={i + 1} title={x.t} accent={c} delay={i * 50}>
            <Tag type={x.type} />
            <P>{x.story}</P>
            <SimpleTable heads={x.heads} rows={x.rows} />
            <View style={{ height: 12 }} />
            <Reveal color={c} label="LIHAT KUNCI">
              <P>{x.key}</P>
              <P strong>{x.ans}</P>
            </Reveal>
          </Card>
        );
      })}
    </View>
  );
}

// ---------- 12. SALAH KAPRAH ----------
function Myths() {
  return (
    <View>
      <Card title="Kenapa perlu dibahas?" accent={GOLD}>
        <P>Penelitian tentang miskonsepsi siswa kelas VII menemukan pola kesalahan yang berulang. Kenali enam yang paling sering, supaya tidak terjebak di soal.</P>
      </Card>
      {MYTHS.map((m, i) => (
        <Rise key={i} delay={i * 60} from={12} style={s.myth}>
          <View style={s.mythHead}>
            <View style={s.mythNo}><Text style={s.mythNoT}>{i + 1}</Text></View>
            <Text style={s.mythBadBadge}>SALAH KAPRAH</Text>
          </View>
          <Text style={s.mythBad}>{m.bad}</Text>
          <View style={s.mythGoodBox}>
            <Text style={s.mythGoodL}>YANG BENAR</Text>
            <Text style={s.mythGood}>{m.good}</Text>
          </View>
          <View style={{ flexDirection: 'row', marginTop: 10 }}><Chip label={m.tip.toUpperCase()} color={GOLD} /></View>
        </Rise>
      ))}
    </View>
  );
}

// ---------- 13. KARTU RUMUS ----------
function Formulas() {
  const col = { senilai: COLOR.cyan, berbalik: PINK, uji: GOLD };
  const name = { senilai: 'SENILAI', berbalik: 'BERBALIK NILAI', uji: 'UJI CEPAT' };
  return (
    <View>
      {['senilai', 'berbalik', 'uji'].map((t) => (
        <View key={t} style={{ marginBottom: 6 }}>
          <Ribbon color={col[t]} textColor={COLOR.navy}>{name[t]}</Ribbon>
          {FORMULAS.filter((f) => f.type === t).map((f, i) => (
            <Rise key={f.t} delay={i * 60} from={10} style={{ marginBottom: 12 }}>
              <Slab color={col[t]} skew={-5}>
                <View style={s.fcard}>
                  <Text style={[s.fT, { color: col[t] }]}>{f.t.toUpperCase()}</Text>
                  <Text style={s.fF}>{f.f}</Text>
                  <Text style={s.fN}>{f.n}</Text>
                </View>
              </Slab>
            </Rise>
          ))}
        </View>
      ))}
    </View>
  );
}

// Ganti konten halus: yang lama memudar & bergeser, yang baru masuk dari arah tujuan.
function StepSwitch({ k, dir, render }) {
  const [shown, setShown] = useState(k);
  const a = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (k === shown) return undefined;
    const anim = Animated.timing(a, { toValue: 0, duration: 130, easing: Easing.in(Easing.quad), useNativeDriver: true });
    anim.start(() => {
      setShown(k);
      Animated.timing(a, { toValue: 1, duration: 300, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
    });
    return () => anim.stop();
  }, [k]); // eslint-disable-line react-hooks/exhaustive-deps
  const x = a.interpolate({ inputRange: [0, 1], outputRange: [dir * 26, 0] });
  return <Animated.View style={{ opacity: a, transform: [{ translateX: x }] }}>{render(shown)}</Animated.View>;
}

// frac sebuah kelompok = bagian yang sudah dibuka (video: video yang sudah dibuka)
function groupFrac(g, m) {
  const seen = m.seen || {};
  const vids = Object.keys(m.videos || {}).length;
  const parts = g.items.map((i) => (i === 7 ? Math.min(1, vids / VIDEOS.length) : seen[i] ? 1 : 0));
  return parts.reduce((a, b) => a + b, 0) / parts.length;
}

export default function Materi({ onBack, onPractice, onLab, progress = {}, onMateri }) {
  const [cat, setCat] = useState(null);     // kelompok terpilih (null = beranda BELAJAR)
  const [k, setK] = useState(null);          // bagian terpilih (null = daftar bagian)
  const dir = useRef(1);
  const m = progress.materi || {};
  const seen = m.seen || {};
  const group = cat !== null ? GROUPS[cat] : null;
  const ms = materiStat(progress);

  const openCat = (gi) => {
    const g = GROUPS[gi];
    setCat(gi);
    setK(g.items.length === 1 ? g.items[0] : null);     // kelompok berisi satu bagian langsung dibuka
  };
  const goTo = (n) => {
    if (n === k || n == null) return;
    const gi = GROUPS.findIndex((g) => g.items.includes(n));
    dir.current = k !== null && n > k ? 1 : -1;
    if (gi !== cat) setCat(gi);
    setK(n);
  };
  useEffect(() => { if (k !== null) onMateri && onMateri({ step: k }); }, [k]); // eslint-disable-line react-hooks/exhaustive-deps

  // tombol KEMBALI naik satu tingkat: bagian -> daftar -> beranda -> lobi
  const back = () => {
    if (k !== null) { if (group && group.items.length === 1) { setK(null); setCat(null); } else setK(null); return; }
    if (cat !== null) { setCat(null); return; }
    onBack && onBack();
  };

  const body = (i) => (
    <View>
      {i === 0 && <Concept />}
      {i === 1 && <Direct />}
      {i === 2 && <Inverse />}
      {i === 3 && <Method />}
      {i === 4 && <Examples />}
      {i === 5 && <Summary />}
      {i === 6 && <Quick />}
      {i === 7 && <Videos seenMap={m.videos} onVideo={(id) => onMateri && onMateri({ video: id })} />}
      {i === 8 && <Refs />}
      {i === 9 && <Ready onPractice={onPractice} onLab={onLab} onReview={() => { setK(null); setCat(null); }} />}
      {i === 10 && <Glossary />}
      {i === 11 && <Stories />}
      {i === 12 && <Myths />}
      {i === 13 && <Formulas />}
    </View>
  );

  // ============ BERANDA BELAJAR ============
  if (cat === null) {
    const firstOpen = STEPS.findIndex((_, i) => !seen[i]);
    const pctAll = Math.round(ms.frac * 100);
    return (
      <PageShell title="Belajar" onBack={back} scrollKey="hub" crumb="MENU / BELAJAR" sub="Pilih kelompok materi. Boleh urut, boleh loncat.">
        <Rise>
          <Slab color={COLOR.cyan} skew={-6} style={{ marginBottom: 20 }}>
            <View style={s.hubIn}>
              <Ghost size={92} color={COLOR.cyan} opacity={0.1} style={{ right: 6, top: -14 }}>{pctAll}%</Ghost>
              <Kicker color={COLOR.cyan}>PROGRES BELAJAR</Kicker>
              <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
                <CountUp to={pctAll} suffix="%" style={s.hubPct} />
                <Text style={s.hubOf}>  {ms.seen}/{ms.total} bagian  ·  {ms.vids}/{ms.vtotal} video</Text>
              </View>
              <View style={{ marginTop: 10 }}><Meter to={ms.frac} color={COLOR.cyan} height={9} delay={200} /></View>
              {firstOpen >= 0 && (
                <Btn label={ms.seen === 0 ? 'MULAI DARI KONSEP' : `LANJUT: ${STEPS[firstOpen].toUpperCase()}`} icon="right" tone="cyan" onPress={() => goTo(firstOpen)} style={{ alignSelf: 'stretch', marginTop: 14, marginRight: 0 }} />
              )}
            </View>
          </Slab>
        </Rise>
        {GROUPS.map((g, gi) => {
          const done = g.items.filter((i) => (i === 7 ? Object.keys(m.videos || {}).length > 0 : seen[i])).length;
          return (
            <MenuRow
              key={g.key} no={g.no} title={g.name} sub={g.sub} color={g.color} delay={gi * 60}
              frac={groupFrac(g, m)}
              meta={g.items.length === 1 ? `${Object.keys(m.videos || {}).length}/${VIDEOS.length} VIDEO DIBUKA` : `${done}/${g.items.length} BAGIAN`}
              onPress={() => openCat(gi)}
            />
          );
        })}
      </PageShell>
    );
  }

  // ============ DAFTAR BAGIAN DALAM KELOMPOK ============
  if (k === null) {
    return (
      <PageShell title={group.name} onBack={back} scrollKey={'cat' + cat} crumb="BELAJAR" sub={group.sub}>
        {group.items.map((i, n) => (
          <MenuRow
            key={i} no={String(n + 1).padStart(2, '0')} title={STEP_INFO[i].title} sub={STEP_INFO[i].sub}
            color={group.color} tag={STEP_INFO[i].isNew ? 'BARU' : null} done={!!seen[i]} delay={n * 60}
            onPress={() => { dir.current = 1; setK(i); }}
          />
        ))}
      </PageShell>
    );
  }

  // ============ ISI SATU BAGIAN ============
  const pos = group.items.indexOf(k);
  const prevIdx = pos > 0 ? group.items[pos - 1] : null;
  const nextIdx = pos < group.items.length - 1 ? group.items[pos + 1] : (GROUPS[cat + 1] ? GROUPS[cat + 1].items[0] : null);
  const last = k === 9;
  return (
    <PageShell title={STEP_INFO[k].title} onBack={back} scrollKey={k} crumb={`BELAJAR  /  ${group.name}`}>
      {group.items.length > 1 && (
        <View style={s.tabsRow}>
          {group.items.map((i) => <TabBtn key={i} label={STEPS[i].toUpperCase()} on={i === k} color={group.color} onPress={() => goTo(i)} />)}
        </View>
      )}
      <View style={s.prog}>
        {group.items.map((i) => (
          <View key={i} style={{ flex: 1, marginRight: 4 }}>
            <View style={[s.seg, { backgroundColor: i === k ? '#FFFFFF' : seen[i] ? group.color : 'rgba(255,255,255,0.16)' }]} />
          </View>
        ))}
      </View>

      <StepSwitch k={k} dir={dir.current} render={body} />

      {!last && (
        <View style={s.nav}>
          <Btn label={prevIdx !== null ? 'SEBELUMNYA' : 'DAFTAR'} icon="left" onPress={() => (prevIdx !== null ? goTo(prevIdx) : back())} style={{ flex: 1, marginRight: 10 }} />
          <Btn label={pos < group.items.length - 1 ? 'LANJUT' : 'KELOMPOK BERIKUTNYA'} icon="right" tone="cyan" onPress={() => nextIdx !== null && goTo(nextIdx)} disabled={nextIdx === null} style={{ flex: 1 }} />
        </View>
      )}
    </PageShell>
  );
}

const s = StyleSheet.create({
  hubIn: { paddingVertical: 16, paddingLeft: 24, paddingRight: 18, overflow: 'hidden' },
  hubPct: { color: '#fff', fontSize: 52, lineHeight: 56, fontWeight: '900', fontStyle: 'italic', includeFontPadding: false },
  hubOf: { color: COLOR.ice, fontSize: 12, fontWeight: '800', letterSpacing: 1, marginBottom: 8 },
  tabsRow: { flexDirection: 'row', marginBottom: 14, marginRight: -6 },
  grpSub: { color: COLOR.ice, opacity: 0.8, fontSize: 12, marginBottom: 12, marginTop: -4 },
  vidNo: { position: 'absolute', left: 0, top: 0, paddingHorizontal: 7, paddingVertical: 1 },
  vidNoT: { color: COLOR.navy, fontSize: 12, fontWeight: '900', fontStyle: 'italic', includeFontPadding: false },
  term: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: 'rgba(191,239,255,0.2)', paddingVertical: 14, paddingHorizontal: 4 },
  termNo: { width: 38, marginRight: 8 },
  termNoT: { color: COLOR.cyan, fontSize: 22, fontWeight: '900', fontStyle: 'italic', opacity: 0.85 },
  termT: { color: '#fff', fontSize: 17, fontWeight: '900', fontStyle: 'italic', textTransform: 'uppercase', letterSpacing: 0.5 },
  termD: { color: COLOR.text, fontSize: 14, lineHeight: 21, marginTop: 4 },
  termEx: { color: GOLD, fontSize: 12, fontWeight: '700', lineHeight: 18, marginTop: 5 },
  myth: { borderWidth: 1.5, borderColor: 'rgba(255,26,26,0.55)', borderLeftWidth: 5, borderLeftColor: RED, backgroundColor: 'rgba(3,22,62,0.9)', padding: 14, marginBottom: 16 },
  mythHead: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  mythNo: { backgroundColor: RED, minWidth: 26, height: 26, alignItems: 'center', justifyContent: 'center', marginRight: 10, transform: [{ skewX: '-12deg' }] },
  mythNoT: { color: '#fff', fontWeight: '900', fontSize: 14, transform: [{ skewX: '12deg' }] },
  mythBadBadge: { color: '#FF6B7A', fontSize: 11, fontWeight: '900', letterSpacing: 2.5 },
  mythBad: { color: '#FFB3BC', fontSize: 15, lineHeight: 23, fontWeight: '700', textDecorationLine: 'line-through', textDecorationColor: RED },
  mythGoodBox: { marginTop: 12, borderLeftWidth: 4, borderLeftColor: '#3DDC84', backgroundColor: 'rgba(61,220,132,0.1)', paddingVertical: 8, paddingHorizontal: 12 },
  mythGoodL: { color: '#3DDC84', fontSize: 10, fontWeight: '900', letterSpacing: 2.5, marginBottom: 3 },
  mythGood: { color: '#fff', fontSize: 14, lineHeight: 22 },
  fcard: { paddingVertical: 13, paddingLeft: 24, paddingRight: 16 },
  fT: { fontSize: 10, fontWeight: '900', letterSpacing: 2.5 },
  fF: { color: '#fff', fontSize: 22, fontWeight: '900', fontStyle: 'italic', marginTop: 4 },
  fN: { color: COLOR.ice, opacity: 0.85, fontSize: 12, lineHeight: 18, marginTop: 4 },
  formula: { borderLeftWidth: 5, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', paddingVertical: 10, paddingHorizontal: 14, marginBottom: 14, backgroundColor: 'rgba(2,12,27,0.65)' },
  formulaT: { fontSize: 18, fontWeight: '900', fontStyle: 'italic' },
  note: { borderLeftWidth: 4, paddingVertical: 8, paddingHorizontal: 12, marginBottom: 4, marginTop: 2, backgroundColor: 'rgba(2,12,27,0.55)' },
  noteL: { fontSize: 9, fontWeight: '900', letterSpacing: 2.5, marginBottom: 3 },
  noteT: { color: COLOR.white, fontSize: 13, lineHeight: 20, opacity: 0.92 },
  sub: { fontSize: 12, fontWeight: '900', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 6, marginTop: 2 },
  revBtn: { alignSelf: 'flex-start', borderWidth: 2, paddingVertical: 6, paddingHorizontal: 14, transform: [{ skewX: '-12deg' }] },
  revT: { fontSize: 11, fontWeight: '900', letterSpacing: 1.5, includeFontPadding: false },
  revBox: { borderLeftWidth: 4, marginTop: 12, paddingTop: 10, paddingLeft: 12, paddingBottom: 0, backgroundColor: 'rgba(2,12,27,0.55)' },
  vid: { flexDirection: 'row', padding: 10, paddingLeft: 16 },
  thumb: { width: 128, height: 72, backgroundColor: COLOR.navy, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  thumbFallback: { position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  thumbImg: { position: 'absolute', left: 0, top: 0, width: 128, height: 72 },
  play: { width: 30, height: 30, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.92)', alignItems: 'center', justifyContent: 'center' },
  vidT: { color: COLOR.white, fontSize: 13, fontWeight: '800', lineHeight: 18 },
  vidN: { color: COLOR.text, opacity: 0.75, fontSize: 11, lineHeight: 16, marginTop: 3 },
  vidGo: { color: COLOR.cyan, fontSize: 9, fontWeight: '900', letterSpacing: 1.5, marginTop: 6 },
  ref: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.14)', paddingVertical: 12 },
  refNo: { color: COLOR.cyan, fontSize: 20, fontWeight: '900', fontStyle: 'italic', width: 30 },
  refT: { color: COLOR.white, fontSize: 14, fontWeight: '800', lineHeight: 20 },
  refBy: { color: COLOR.text, opacity: 0.75, fontSize: 12, lineHeight: 18, marginTop: 3 },
  refGo: { color: COLOR.cyan, fontSize: 11, fontWeight: '900', letterSpacing: 2, marginTop: 6 },
  progHead: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8 },
  progNo: { color: COLOR.ice, fontSize: 11, fontWeight: '900', letterSpacing: 2 },
  progName: { color: COLOR.white, fontSize: 13, fontWeight: '900', fontStyle: 'italic', letterSpacing: 1.5 },
  prog: { flexDirection: 'row', marginBottom: 20, marginTop: 2 },
  seg: { height: 6, transform: [{ skewX: '-20deg' }] },
  desc: { color: COLOR.white, fontSize: 14, marginBottom: 14, lineHeight: 22, opacity: 0.9 },
  row: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.12)', paddingVertical: 10 },
  head: { flex: 1, color: COLOR.cyan, fontWeight: '900', fontSize: 11, letterSpacing: 1.2, textTransform: 'uppercase', paddingRight: 6 },
  cell: { flex: 1, color: COLOR.text, fontSize: 13, lineHeight: 19, paddingRight: 6 },
  cellKey: { flex: 1, color: COLOR.ice, fontSize: 12, fontWeight: '800', lineHeight: 18, paddingRight: 6 },
  rule: { marginTop: 8, color: COLOR.ice, fontSize: 13, fontWeight: '700' },
  logic: { marginTop: 14, fontStyle: 'italic', fontSize: 14, fontWeight: '800' },
  qRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 14 },
  qKey: { width: 74, backgroundColor: GOLD, paddingVertical: 3, alignItems: 'center', marginRight: 12, transform: [{ skewX: '-12deg' }] },
  qKeyT: { color: COLOR.navy, fontWeight: '900', fontSize: 13, transform: [{ skewX: '12deg' }] },
  nav: { flexDirection: 'row', marginTop: 4 },
  ready: { borderWidth: 2, padding: 22, alignItems: 'center', backgroundColor: COLOR.glass },
  av: { width: 84, height: 84, borderRadius: 42, borderWidth: 3 },
  readyName: { fontSize: 15, fontWeight: '900', fontStyle: 'italic', letterSpacing: 2, marginTop: 10 },
  readyT: { color: COLOR.white, fontSize: 15, lineHeight: 23, textAlign: 'center', marginVertical: 14 },
});
