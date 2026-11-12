// Isi belajar. Sumber: temuan wawancara kebutuhan siswa + Tabel 2 (soal & kisi-kisi jawaban).
// Kalimat sengaja dibuat pendek agar beban membaca soal cerita kecil.

// --- BEDAKAN: cepat menentukan senilai atau berbalik nilai ----------------------
export const CASES = [
  { kunci: ['bensin','km'], story: 'Motor butuh 3 liter bensin untuk 45 km. Untuk 120 km, butuh berapa liter?',
    cols: [{ name: 'Bensin (liter)', v: [3, 8], dir: 'up' }, { name: 'Jarak (km)', v: [45, 120], dir: 'up' }],
    ans: 'senilai', why: 'Bensin bertambah, jarak ikut bertambah. Naik–naik = senilai.' },
  { kunci: ['pekerja','hari'], story: '4 pekerja menyelesaikan bangunan dalam 12 hari. Kalau pekerjanya 8 orang, berapa hari?',
    cols: [{ name: 'Pekerja (orang)', v: [4, 8], dir: 'up' }, { name: 'Waktu (hari)', v: [12, 6], dir: 'down' }],
    ans: 'berbalik', why: 'Pekerja bertambah, hari malah berkurang. Naik–turun = berbalik nilai.' },
  { kunci: ['buku','harganya'], story: '2 buku harganya Rp10.000. Berapa harga 4 buku?',
    cols: [{ name: 'Buku (buah)', v: [2, 4], dir: 'up' }, { name: 'Harga (Rp)', v: [10000, 20000], dir: 'up' }],
    ans: 'senilai', why: 'Buku bertambah, harga ikut bertambah. Naik–naik = senilai.' },
  { kunci: ['patungan','siswa','tetap'], story: '8 siswa patungan Rp15.000 per orang untuk 1 pizza. Lalu jadi 10 siswa. Harga pizza tetap.',
    cols: [{ name: 'Siswa (orang)', v: [8, 10], dir: 'up' }, { name: 'Iuran (Rp)', v: [15000, 12000], dir: 'down' }],
    ans: 'berbalik', why: 'Orang bertambah, iuran tiap orang berkurang. Naik–turun = berbalik nilai.' },
  { kunci: ['kaos','harganya'], story: '12 kaos harganya Rp600.000. Berapa harga 30 kaos?',
    cols: [{ name: 'Kaos (buah)', v: [12, 30], dir: 'up' }, { name: 'Harga (Rp)', v: [600000, 1500000], dir: 'up' }],
    ans: 'senilai', why: 'Kaos bertambah, harga ikut bertambah. Naik–naik = senilai.' },
  { kunci: ['km/jam','jam'], story: 'Naik motor 40 km/jam butuh 3 jam. Kalau lajunya 60 km/jam, berapa jam?',
    cols: [{ name: 'Laju (km/jam)', v: [40, 60], dir: 'up' }, { name: 'Waktu (jam)', v: [3, 2], dir: 'down' }],
    ans: 'berbalik', why: 'Laju bertambah, waktu tempuh berkurang. Naik–turun = berbalik nilai.' },
];

// --- LANGKAH: contoh dikerjakan satu langkah per layar --------------------------
export const EXAMPLES = [
  { key: 'bensin', title: 'Bensin Motor', type: 'senilai',
    soal: '3 liter bensin untuk 45 km. Berapa liter untuk 120 km?',
    steps: [
      { t: 'Tandai informasi', body: 'Pisahkan dulu mana yang diketahui dan mana yang ditanya.',
        chips: [{ k: 'Diketahui', v: '3 liter → 45 km' }, { k: 'Ditanya', v: '? liter → 120 km' }] },
      { t: 'Naik atau turun?', body: 'Jarak makin jauh, bensin makin banyak. Dua-duanya naik, jadi SENILAI.',
        table: { heads: ['Bensin (L)', 'Jarak (km)'], rows: [['3', '45'], ['y', '120']] } },
      { t: 'Susun perbandingan', body: 'Senilai: hasil bagi sama.\n45 ÷ 3 = 120 ÷ y\natau 45 × y = 120 × 3' },
      { t: 'Hitung', body: '45y = 360\ny = 360 ÷ 45 = 8' },
      { t: 'Cek masuk akal', body: '120 km sekitar 2,7 kali lebih jauh dari 45 km. Bensin 8 liter sekitar 2,7 kali dari 3 liter. Wajar.\n\nJawaban: 8 liter.' },
    ] },
  { key: 'pekerja1', title: 'Pekerja & Hari (Dasar)', type: 'berbalik',
    soal: '4 pekerja selesai dalam 12 hari. Kalau ada 8 pekerja, berapa hari?',
    steps: [
      { t: 'Tandai informasi', body: 'Tulis dulu angka yang penting.',
        chips: [{ k: 'Diketahui', v: '4 pekerja → 12 hari' }, { k: 'Ditanya', v: '8 pekerja → ? hari' }] },
      { t: 'Naik atau turun?', body: 'Pekerja naik, hari justru turun. Naik–turun = BERBALIK NILAI.',
        table: { heads: ['Pekerja', 'Hari'], rows: [['4  ↑', '12  ↓'], ['8  ↑', 'x  ↓']] } },
      { t: 'Susun perbandingan', body: 'Berbalik nilai: hasil kali sama.\n4 × 12 = 8 × x\n(beban kerja = 48 hari-orang)' },
      { t: 'Hitung', body: '48 = 8x\nx = 48 ÷ 8 = 6' },
      { t: 'Cek masuk akal', body: 'Pekerja jadi 2 kali lipat, hari jadi setengahnya: 12 → 6. Wajar.\n\nJawaban: 6 hari.' },
    ] },
  { key: 'pekerja2', title: 'Pembangunan Kelas', type: 'berbalik',
    soal: 'Rencana 24 hari oleh 15 pekerja. Setelah 10 hari, kerja berhenti 4 hari karena hujan. Berapa tambahan pekerja agar tepat waktu?',
    steps: [
      { t: 'Tandai informasi', body: 'Soal ini panjang. Ambil angka pentingnya saja.',
        chips: [{ k: 'Rencana', v: '24 hari, 15 pekerja' }, { k: 'Sudah jalan', v: '10 hari' }, { k: 'Berhenti', v: '4 hari' }, { k: 'Ditanya', v: 'tambahan pekerja' }] },
      { t: 'Hitung sisa waktu', body: 'Sisa waktu aktual = 24 − 10 − 4 = 10 hari.' },
      { t: 'Hitung beban tersisa', body: 'Menurut rencana, sisa 14 hari (24 − 10).\nBeban tersisa = 14 × 15 = 210 hari-orang.' },
      { t: 'Susun model', body: 'Sisa waktu cuma 10 hari. Hari turun, pekerja harus naik = berbalik nilai.\n10 × x = 14 × 15' },
      { t: 'Hitung', body: '10x = 210\nx = 210 ÷ 10 = 21 pekerja' },
      { t: 'Jawab pertanyaan', body: 'Tambahan = 21 − 15 = 6 orang.\n\nJawaban: perlu tambahan 6 pekerja.' },
    ] },
  { key: 'pizza', title: 'Patungan Pizza', type: 'berbalik',
    soal: '8 siswa patungan Rp15.000 untuk 1 pizza. Lalu 2 teman ikut. Seorang siswa menghitung (10/8) × 15.000 = Rp18.750. Setuju?',
    steps: [
      { t: 'Tandai informasi', body: 'Harga pizza TIDAK berubah. Yang berubah hanya jumlah orang.',
        chips: [{ k: 'Awal', v: '8 orang × Rp15.000' }, { k: 'Sekarang', v: '8 + 2 = 10 orang' }, { k: 'Ditanya', v: 'iuran baru' }] },
      { t: 'Cek hitungan teman', body: 'Orang bertambah tapi iuran jadi Rp18.750 (naik)? Tidak masuk akal. Harga tetap, makin banyak orang, iuran makin kecil. Ini BERBALIK NILAI, bukan senilai.' },
      { t: 'Cari harga pizza', body: 'Total = 8 × Rp15.000 = Rp120.000.' },
      { t: 'Bagi rata', body: 'Iuran baru = Rp120.000 ÷ 10 = Rp12.000 per orang.' },
      { t: 'Kesimpulan', body: 'Tidak setuju. Iuran sebenarnya Rp12.000, turun dari Rp15.000.' },
    ] },
];

// --- LATIHAN: soal dari Tabel 2, dipecah per tahapan, dengan petunjuk bertingkat ----
// Skor per tahap: 2 = benar tanpa bantuan, 1 = benar setelah petunjuk/coba lagi, 0 = dibantu jawaban.
export const QUESTIONS = [
  { id: 'kaos', title: 'Memilih Pembuat Kaos', type: 'senilai', indikator: 'Penalaran', level: 'menengah', kunci: ['kaos','paling murah'],
    soal: 'Kelas Rina ingin membuat 30 kaos dengan biaya paling murah.\nVendor A: 12 kaos Rp600.000.\nVendor B: 15 kaos Rp720.000.\nVendor C: 20 kaos Rp1.100.000.',
    steps: [
      { q: 'Jumlah kaos tiap paket berbeda. Langkah pertama yang adil?',
        opts: ['Pilih harga paket paling kecil', 'Hitung harga per kaos tiap vendor', 'Pilih vendor dengan kaos terbanyak'], ans: 1,
        hints: ['Paketnya tidak sama besar, jadi harganya belum bisa dibandingkan langsung.', 'Samakan dulu ukurannya: cari harga untuk 1 kaos.'],
        why: 'Karena jumlah kaos berbeda, bandingkan harga per kaos atau total untuk 30 kaos.' },
      { q: 'Harga per kaos Vendor A, B, dan C berturut-turut?',
        opts: ['Rp50.000, Rp48.000, Rp55.000', 'Rp50.000, Rp55.000, Rp48.000', 'Rp48.000, Rp50.000, Rp55.000'], ans: 0,
        hints: ['Bagi harga paket dengan jumlah kaos.', 'A: 600.000 ÷ 12. B: 720.000 ÷ 15. C: 1.100.000 ÷ 20.'],
        why: 'A = 600.000 ÷ 12 = 50.000. B = 720.000 ÷ 15 = 48.000. C = 1.100.000 ÷ 20 = 55.000.' },
      { q: 'Vendor mana yang sebaiknya dipilih, dan alasannya?',
        opts: ['A, karena paketnya paling murah', 'B, karena harga per kaos termurah (total 30 kaos Rp1.440.000)', 'C, karena kaosnya paling banyak'], ans: 1,
        hints: ['Lihat harga per kaos dari langkah sebelumnya.', 'Pilih yang harga per kaosnya paling kecil.'],
        why: 'B paling murah: Rp48.000 per kaos, total 30 kaos = Rp1.440.000.' },
    ] },
  { id: 'bangunan', title: 'Pekerja dan Waktu', type: 'berbalik', indikator: 'Merumuskan model', level: 'sulit', kunci: ['24 hari','15 pekerja','berhenti 4 hari','tambahan pekerja'],
    soal: 'Pembangunan kelas direncanakan 24 hari oleh 15 pekerja. Setelah 10 hari, kerja berhenti 4 hari karena cuaca. Agar tepat waktu, berapa tambahan pekerja?',
    steps: [
      { q: 'Berapa sisa waktu aktual untuk menyelesaikan pekerjaan?',
        opts: ['14 hari', '10 hari', '4 hari'], ans: 1,
        hints: ['Kurangi rencana dengan hari yang sudah lewat DAN hari berhenti.', '24 − 10 − 4 = ?'],
        why: 'Sisa waktu aktual = 24 − 10 − 4 = 10 hari.' },
      { q: 'Model matematika yang tepat? (beban sisa menurut rencana: 14 × 15)',
        opts: ['Senilai: 10 ÷ x = 14 ÷ 15', 'Berbalik nilai: 10 × x = 14 × 15', 'Berbalik nilai: 10 × x = 24 × 15'], ans: 1,
        hints: ['Hari berkurang, pekerja harus bertambah. Naik atau turun? Pilih jenisnya dulu.', 'Berbalik nilai memakai hasil kali sama. Beban sisa menurut rencana = 14 hari × 15 pekerja.'],
        why: 'Hari turun, pekerja naik = berbalik nilai. Hasil kali sama: 10 × x = 14 × 15.' },
      { q: 'Jumlah seluruh pekerja yang dibutuhkan (x)?',
        opts: ['14', '21', '6'], ans: 1,
        hints: ['10x = 14 × 15 = 210.', 'x = 210 ÷ 10.'],
        why: '10x = 210, jadi x = 21 pekerja.' },
      { q: 'Berapa tambahan pekerja?',
        opts: ['21 orang', '36 orang', '6 orang'], ans: 2,
        hints: ['Yang ditanya TAMBAHAN, bukan jumlah seluruhnya.', 'Kurangi dengan pekerja awal (15).'],
        why: '21 − 15 = 6. Diperlukan tambahan 6 pekerja.' },
    ] },
  { id: 'bensin', title: 'Bensin Motor', type: 'senilai', indikator: 'Prosedur', level: 'mudah', kunci: ['liter bensin','120 km'],
    soal: 'Motor butuh 3 liter bensin untuk 45 km. Rina ke rumah nenek sejauh 120 km. Berapa liter bensin yang dibutuhkan?',
    steps: [
      { q: 'Hubungan bensin dan jarak termasuk jenis apa?',
        opts: ['Senilai (naik–naik)', 'Berbalik nilai (naik–turun)'], ans: 0,
        hints: ['Jarak makin jauh, bensin makin banyak atau makin sedikit?'],
        why: 'Jarak naik, bensin ikut naik. Itu senilai.' },
      { q: 'Persamaan perbandingan yang benar? (y = bensin untuk 120 km)',
        opts: ['45 ÷ 3 = 120 ÷ y', '45 × 3 = 120 × y', '45 ÷ 3 = y ÷ 120'], ans: 0,
        hints: ['Senilai memakai hasil bagi sama, bukan hasil kali.', 'Jarak dibagi bensin harus sama di kedua sisi: jarak ÷ bensin.'],
        why: 'Jarak ÷ bensin selalu sama: 45 ÷ 3 = 120 ÷ y.' },
      { q: 'Berapa nilai y?',
        opts: ['5 liter', '8 liter', '40 liter'], ans: 1,
        hints: ['45y = 120 × 3.', '45y = 360, jadi y = 360 ÷ 45.'],
        why: '45y = 360, y = 8. Dibutuhkan 8 liter.' },
    ] },
  { id: 'pizza', title: 'Patungan Pizza', type: 'berbalik', indikator: 'Menafsirkan hasil', level: 'menengah', kunci: ['patungan','2 teman','per orang'],
    soal: '8 siswa patungan Rp15.000 per orang untuk 1 pizza. Sebelum bayar, 2 teman ikut. Seorang siswa menghitung (10/8) × 15.000 = Rp18.750 per orang. Setuju?',
    steps: [
      { q: 'Setujukah dengan hitungan siswa itu?',
        opts: ['Setuju, orang bertambah jadi iuran naik', 'Tidak setuju, harga tetap sehingga iuran harus turun'], ans: 1,
        hints: ['Harga pizza tidak berubah. Kalau orangnya banyak, tiap orang bayar lebih banyak atau lebih sedikit?'],
        why: 'Orang naik, iuran turun = berbalik nilai. Hitungan senilai itu keliru.' },
      { q: 'Berapa total harga pizza?',
        opts: ['Rp120.000', 'Rp150.000', 'Rp23.000'], ans: 0,
        hints: ['Total uang = jumlah orang × iuran awal.', '8 × 15.000.'],
        why: '8 × Rp15.000 = Rp120.000.' },
      { q: 'Berapa iuran sebenarnya setelah jadi 10 orang?',
        opts: ['Rp18.750', 'Rp12.000', 'Rp15.000'], ans: 1,
        hints: ['Bagi total harga dengan jumlah orang yang baru.', '120.000 ÷ 10.'],
        why: 'Rp120.000 ÷ 10 = Rp12.000 per orang.' },
    ] },
  { id: 'buku', title: 'Harga Buku Tulis', type: 'senilai', indikator: 'Prosedur dasar', level: 'mudah', kunci: ['buku tulis','seharga'],
    soal: 'Rina membeli 2 buku tulis seharga Rp10.000. Berapa harga 6 buku tulis?',
    steps: [
      { q: 'Hubungan jumlah buku dan harga termasuk jenis apa?',
        opts: ['Senilai (naik–naik)', 'Berbalik nilai (naik–turun)'], ans: 0,
        hints: ['Buku makin banyak, harga makin mahal atau makin murah?'],
        why: 'Buku naik, harga ikut naik. Itu senilai.' },
      { q: 'Berapa harga 1 buku?',
        opts: ['Rp5.000', 'Rp20.000', 'Rp12.000'], ans: 0,
        hints: ['Bagi harga dengan jumlah buku.', '10.000 ÷ 2.'],
        why: '10.000 ÷ 2 = 5.000 per buku.' },
      { q: 'Berapa harga 6 buku?',
        opts: ['Rp30.000', 'Rp60.000', 'Rp16.000'], ans: 0,
        hints: ['Harga satu buku × jumlah buku.', '5.000 × 6.'],
        why: '5.000 × 6 = 30.000.' },
    ] },
  { id: 'laju', title: 'Laju dan Waktu', type: 'berbalik', indikator: 'Prosedur dasar', level: 'mudah', kunci: ['km/jam','berapa jam'],
    soal: 'Naik motor dengan laju 40 km/jam butuh 3 jam. Kalau lajunya 60 km/jam, berapa jam waktunya?',
    steps: [
      { q: 'Hubungan laju dan waktu termasuk jenis apa?',
        opts: ['Senilai (naik–naik)', 'Berbalik nilai (naik–turun)'], ans: 1,
        hints: ['Laju makin cepat, waktu tempuh makin lama atau makin singkat?'],
        why: 'Laju naik, waktu turun. Itu berbalik nilai.' },
      { q: 'Berapa jarak yang ditempuh? (laju × waktu)',
        opts: ['120 km', '43 km', '13,3 km'], ans: 0,
        hints: ['Jaraknya tetap. Kalikan laju dengan waktu.', '40 × 3.'],
        why: 'Jarak = 40 × 3 = 120 km, nilainya tetap.' },
      { q: 'Berapa waktu dengan laju 60 km/jam?',
        opts: ['4,5 jam', '2 jam', '1 jam'], ans: 1,
        hints: ['60 × x = 120.', 'x = 120 ÷ 60.'],
        why: '60x = 120, jadi x = 2 jam.' },
    ] },
  { id: 'persediaan', title: 'Persediaan Makanan Asrama', type: 'berbalik', indikator: 'Merumuskan model', level: 'sulit', kunci: ['30 siswa','24 hari','6 siswa','berapa hari'],
    soal: 'Persediaan makanan asrama cukup untuk 30 siswa selama 24 hari. Setelah 6 hari, 6 siswa pulang kampung. Berapa hari lagi makanan itu cukup untuk siswa yang tersisa?',
    steps: [
      { q: 'Kalau tidak ada yang pulang, berapa hari persediaan masih tersisa untuk 30 siswa?',
        opts: ['18 hari', '24 hari', '6 hari'], ans: 0,
        hints: ['Kurangi rencana dengan hari yang sudah lewat.', '24 − 6 = ?'],
        why: '24 − 6 = 18 hari (untuk 30 siswa).' },
      { q: 'Berapa siswa yang tersisa?',
        opts: ['36 siswa', '24 siswa', '6 siswa'], ans: 1,
        hints: ['Siswa awal dikurangi yang pulang.', '30 − 6.'],
        why: '30 − 6 = 24 siswa.' },
      { q: 'Model matematika yang tepat?',
        opts: ['Senilai: 24 ÷ x = 30 ÷ 18', 'Berbalik nilai: 24 × x = 30 × 18', 'Berbalik nilai: 24 × x = 30 × 24'], ans: 1,
        hints: ['Siswa berkurang, makanan awet lebih lama. Naik atau turun?', 'Berbalik nilai: hasil kali sama. Pakai sisa 18 hari untuk 30 siswa.'],
        why: 'Siswa turun, hari naik = berbalik nilai. Hasil kali sama: 24 × x = 30 × 18.' },
      { q: 'Berapa hari makanan cukup untuk 24 siswa?',
        opts: ['13,5 hari', '22,5 hari', '18 hari'], ans: 1,
        hints: ['24x = 30 × 18 = 540.', 'x = 540 ÷ 24.'],
        why: '24x = 540, jadi x = 22,5 hari.' },
    ] },
  // --- SOAL TRANSFER (GL05): konteks baru, tahap lebih sedikit, petunjuk dibatasi 1 ---
  { id: 'beras', title: 'Beras di Warung', type: 'senilai', indikator: 'Transfer: konteks baru', level: 'mudah', transfer: true, maxHints: 1, kunci: ['5 kg','8 kg','beras'],
    soal: '5 kg beras harganya Rp70.000. Ibu membeli 8 kg beras yang sama. Berapa yang harus dibayar?',
    steps: [
      { q: 'Hubungan berat beras dan harga termasuk jenis apa?', opts: ['Senilai (naik–naik)', 'Berbalik nilai (naik–turun)'], ans: 0,
        hints: ['Beras makin banyak, harga makin mahal atau makin murah?'], why: 'Beras naik, harga ikut naik. Itu senilai.' },
      { q: 'Berapa yang harus dibayar untuk 8 kg?', opts: ['Rp112.000', 'Rp43.750', 'Rp78.000'], ans: 0,
        hints: ['Cari harga 1 kg dulu (70.000 ÷ 5), lalu kalikan 8.'], why: '70.000 ÷ 5 = 14.000 per kg. 14.000 × 8 = Rp112.000.' },
    ] },
  { id: 'patungan2', title: 'Patungan Makanan', type: 'berbalik', indikator: 'Transfer: konteks baru', level: 'menengah', transfer: true, maxHints: 1, kunci: ['12 siswa','15 siswa','tetap'],
    soal: '12 siswa patungan membeli makanan untuk acara kelas. Tiap orang bayar Rp25.000. Ternyata yang ikut 15 siswa. Total biaya tetap. Berapa iuran tiap siswa sekarang?',
    steps: [
      { q: 'Hubungan jumlah siswa dan iuran per orang termasuk jenis apa?', opts: ['Senilai (naik–naik)', 'Berbalik nilai (naik–turun)'], ans: 1,
        hints: ['Total biaya tetap. Orang makin banyak, iuran per orang makin besar atau kecil?'], why: 'Siswa naik, iuran per orang turun. Itu berbalik nilai.' },
      { q: 'Berapa iuran tiap siswa sekarang?', opts: ['Rp20.000', 'Rp31.250', 'Rp15.000'], ans: 0,
        hints: ['Total = 12 × 25.000. Lalu bagi dengan jumlah siswa yang baru.'], why: 'Total = 12 × 25.000 = 300.000. Iuran baru = 300.000 ÷ 15 = Rp20.000.' },
    ] },
  { id: 'pompa', title: 'Pompa Air Kolam', type: 'berbalik', indikator: 'Transfer: konteks baru', level: 'menengah', transfer: true, maxHints: 1, kunci: ['2 pompa','3 pompa','9 jam'],
    soal: '2 pompa air mengisi kolam sampai penuh dalam 9 jam. Kalau dipakai 3 pompa yang sama, berapa jam sampai kolam penuh?',
    steps: [
      { q: 'Hubungan jumlah pompa dan waktu termasuk jenis apa?', opts: ['Senilai (naik–naik)', 'Berbalik nilai (naik–turun)'], ans: 1,
        hints: ['Pompa makin banyak, kolam penuh makin cepat atau makin lama?'], why: 'Pompa naik, waktu turun. Itu berbalik nilai.' },
      { q: 'Berapa jam sampai kolam penuh dengan 3 pompa?', opts: ['6 jam', '13,5 jam', '12 jam'], ans: 0,
        hints: ['Hasil kali sama: 2 × 9 = 3 × x.'], why: '2 × 9 = 18, jadi 3x = 18 dan x = 6 jam.' },
    ] },
];

export const LEVEL = {
  mudah: { label: 'MUDAH', color: '#3DDC84' },
  menengah: { label: 'MENENGAH', color: '#FFC83D' },
  sulit: { label: 'SULIT', color: '#FF4D6D' },
};


// ============================================================
//  PERMINTAAN SISWA (wawancara S01) -> tambahan isi
//  - "gambar ilustrasi objeknya"           -> PIC  (diletakkan dekat teks soal)
//  - "tabel atau garis panah" pada soal    -> TABEL
//  - germane load GL02/GL04 (jelaskan alasan) -> REFL (soal refleksi) + EXPLAIN (Langkah)
// ============================================================
const PIC = {
  bensin:    [{ ic: '⛽⛽⛽ ➜ 🏍️', cap: '3 liter bensin → 45 km' }, { ic: '⛽ ? ➜ 🏍️🏍️🏍️', cap: '? liter → 120 km' }],
  pekerja:   [{ ic: '👷👷👷👷 ➜ 🏗️', cap: '4 pekerja → 12 hari' }, { ic: '👷👷👷👷👷👷👷👷 ➜ 🏗️', cap: '8 pekerja → ? hari' }],
  bangunan:  [{ ic: '👷👷👷👷👷 ➜ 🏫', cap: 'Rencana: 15 pekerja, 24 hari' }, { ic: '🌧️ ⏸️', cap: 'Setelah 10 hari, berhenti 4 hari' }],
  buku:      [{ ic: '📘📘 ➜ 💰', cap: '2 buku → Rp10.000' }, { ic: '📘📘📘📘📘📘 ➜ 💰 ?', cap: '6 buku → Rp ?' }],
  pizza:     [{ ic: '🧍🧍🧍🧍🧍🧍🧍🧍 ➜ 🍕', cap: '8 siswa, Rp15.000 per orang' }, { ic: '🧍🧍🧍🧍🧍🧍🧍🧍🧍🧍 ➜ 🍕', cap: '10 siswa, per orang = ?' }],
  kaos:      [{ ic: '👕 A  ·  👕 B  ·  👕 C', cap: '3 vendor, ukuran paket berbeda' }],
  laju:      [{ ic: '🏍️ 40 km/jam ➜ ⏱️', cap: '40 km/jam → 3 jam' }, { ic: '🏍️💨 60 km/jam ➜ ⏱️ ?', cap: '60 km/jam → ? jam' }],
  persediaan:[{ ic: '🧍×30 ➜ 🍚', cap: '30 siswa, cukup 24 hari' }, { ic: '🧳 6 siswa pulang', cap: 'Setelah 6 hari, sisa 24 siswa' }],
  beras:     [{ ic: '🌾 5 kg ➜ 💰', cap: '5 kg → Rp70.000' }, { ic: '🌾 8 kg ➜ 💰 ?', cap: '8 kg → Rp ?' }],
  patungan2: [{ ic: '🧍🧍🧍🧍🧍🧍🧍🧍🧍🧍🧍🧍 ➜ 🍱', cap: '12 siswa, Rp25.000 per orang' }, { ic: '🧍×15 ➜ 🍱', cap: '15 siswa, per orang = ?' }],
  pompa:     [{ ic: '🚰🚰 ➜ 🏊', cap: '2 pompa → 9 jam' }, { ic: '🚰🚰🚰 ➜ 🏊 ?', cap: '3 pompa → ? jam' }],
};

const TABEL = {
  kaos:      { heads: ['Vendor', 'Kaos', 'Harga'], rows: [['A', '12', 'Rp600.000'], ['B', '15', 'Rp720.000'], ['C', '20', 'Rp1.100.000']] },
  bangunan:  { heads: ['Keterangan', 'Pekerja', 'Hari'], rows: [['Rencana', '15', '24'], ['Sudah jalan', '15', '10'], ['Berhenti', '–', '4'], ['Sisa waktu', 'x', '?']] },
  bensin:    { heads: ['Bensin (L)', 'Jarak (km)'], rows: [['3', '45'], ['y', '120']] },
  pizza:     { heads: ['Siswa', 'Iuran (Rp)'], rows: [['8', '15.000'], ['10', '?']] },
  buku:      { heads: ['Buku', 'Harga (Rp)'], rows: [['2', '10.000'], ['6', '?']] },
  laju:      { heads: ['Laju (km/jam)', 'Waktu (jam)'], rows: [['40', '3'], ['60', '?']] },
  persediaan:{ heads: ['Keterangan', 'Siswa', 'Hari'], rows: [['Rencana', '30', '24'], ['Sudah lewat', '30', '6'], ['Sisa', '24', '?']] },
  beras:     { heads: ['Beras (kg)', 'Harga (Rp)'], rows: [['5', '70.000'], ['8', '?']] },
  patungan2: { heads: ['Siswa', 'Iuran (Rp)'], rows: [['12', '25.000'], ['15', '?']] },
  pompa:     { heads: ['Pompa', 'Waktu (jam)'], rows: [['2', '9'], ['3', '?']] },
};

// Soal refleksi di akhir tiap misi utama: siswa memilih ALASAN, bukan hanya hasil hitungan.
const REFL = {
  kaos: { q: 'Mengapa yang dibandingkan harga per kaos, bukan harga paket?',
    opts: ['Jumlah kaos tiap paket berbeda, jadi ukurannya harus disamakan dulu', 'Harga paket selalu menyesatkan', 'Karena Vendor B paling kecil'], ans: 0,
    hints: ['Ingat tahap pertama: apakah ketiga paket sama besar?'], why: 'Perbandingan baru adil kalau ukurannya sama, misalnya per 1 kaos.' },
  bangunan: { q: 'Mengapa modelnya memakai hasil kali (10 × x = 14 × 15)?',
    opts: ['Hari berkurang, pekerja harus bertambah (berbalik nilai), jadi beban kerja tetap', 'Pekerja dan hari sama-sama bertambah', 'Semua soal pekerja memakai hasil bagi'], ans: 0,
    hints: ['Hari turun lalu pekerja naik atau turun?'], why: 'Beban kerja (hari × pekerja) tetap, jadi hasil kalinya sama.' },
  bensin: { q: 'Mengapa tidak memakai hasil kali (45 × 3 = 120 × y)?',
    opts: ['Bensin dan jarak sama-sama naik, jadi yang tetap adalah hasil bagi', 'Hasil kali lebih sulit dihitung', 'Karena y selalu dibagi'], ans: 0,
    hints: ['Ingat jenisnya: naik–naik atau naik–turun?'], why: 'Senilai: hasil bagi tetap (jarak ÷ bensin = 15 km per liter).' },
  pizza: { q: 'Bagaimana kita tahu Rp18.750 tidak masuk akal, bahkan sebelum menghitung?',
    opts: ['Orang bertambah tapi harga tetap, seharusnya iuran turun, bukan naik', 'Angkanya tidak bulat', 'Karena 10/8 itu pecahan'], ans: 0,
    hints: ['Bandingkan arah perubahan: orang naik, iuran naik atau turun?'], why: 'Uji arah (naik–turun) sering cukup untuk menolak jawaban yang keliru.' },
  buku: { q: 'Cara lain mengecek bahwa Rp30.000 masuk akal?',
    opts: ['6 buku = 3 kali 2 buku, jadi harganya juga 3 kali: 3 × 10.000', '6 buku harus lebih murah dari 2 buku', 'Harganya harus sama dengan harga 2 buku'], ans: 0,
    hints: ['Bandingkan 6 buku dengan 2 buku: berapa kali lipat?'], why: 'Senilai: kelipatannya sama pada kedua besaran.' },
  laju: { q: 'Mengapa waktu turun ketika laju naik?',
    opts: ['Jaraknya tetap; makin cepat berjalan, makin sebentar sampai', 'Karena jaraknya ikut bertambah', 'Karena 60 lebih besar dari 3'], ans: 0,
    hints: ['Apa yang tetap pada soal ini: jarak atau waktu?'], why: 'Jarak tetap = laju × waktu, jadi laju naik berarti waktu turun.' },
  persediaan: { q: 'Mengapa makanan bisa cukup lebih lama (18 hari jadi 22,5 hari)?',
    opts: ['Siswa berkurang, jatah yang sama dibagi lebih sedikit orang, jadi lebih lama habis', 'Karena makanannya bertambah', 'Karena 24 hari selalu dikali 30'], ans: 0,
    hints: ['Persediaan tetap. Dimakan lebih sedikit orang, habisnya lebih cepat atau lebih lama?'], why: 'Persediaan tetap, orang berkurang, waktu cukup bertambah: berbalik nilai.' },
};

// Penjelasan model untuk "jelaskan dengan kata-katamu" di layar LANGKAH
const EXPLAIN = {
  bensin: 'Bensin dan jarak sama-sama naik, jadi senilai. Jarak ÷ bensin selalu sama (15 km per liter), sehingga 45 ÷ 3 = 120 ÷ y dan y = 8.',
  pekerja1: 'Pekerja naik, hari turun, jadi berbalik nilai. Beban kerja tetap (48 hari-orang), jadi hasil kali sama: 4 × 12 = 8 × x, x = 6.',
  pekerja2: 'Sisa waktu hanya 10 hari padahal beban sisa 14 × 15 = 210 hari-orang. Harinya lebih sedikit, jadi pekerja harus lebih banyak: 210 ÷ 10 = 21. Tambahannya 21 − 15 = 6.',
  pizza: 'Harga pizza tetap Rp120.000. Orang bertambah, jadi iuran tiap orang turun: 120.000 ÷ 10 = Rp12.000. Hitungan senilai (Rp18.750) keliru.',
};

['bensin', 'pekerja', 'buku', 'pizza', 'kaos', 'laju'].forEach((k, i) => { CASES[i].pic = PIC[k]; });
EXAMPLES.forEach((e) => { e.pic = PIC[{ bensin: 'bensin', pekerja1: 'pekerja', pekerja2: 'bangunan', pizza: 'pizza' }[e.key]]; e.explain = EXPLAIN[e.key]; });
QUESTIONS.forEach((q) => {
  q.pic = PIC[q.id];
  q.tabel = TABEL[q.id];
  if (REFL[q.id]) q.steps.push({ ...REFL[q.id], refl: true });
});
