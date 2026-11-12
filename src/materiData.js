// ============================================================
//  DATA MENU BELAJAR (dipakai Materi, Progres, dan trophy)
//  progress.materi = { seen: { [indexLangkah]: true }, videos: { [idVideo]: true } }
// ============================================================

// Urutan indeks JANGAN diubah (tersimpan di progress.materi.seen). Bagian baru selalu ditambah di belakang.
export const STEPS = ['Konsep', 'Senilai', 'Berbalik', 'Cara hitung', 'Contoh', 'Rangkuman', 'Cek cepat', 'Video', 'Rujukan', 'Siap', 'Kamus', 'Kisah harian', 'Salah kaprah', 'Kartu rumus'];

// Keterangan tiap bagian (indeks sama dengan STEPS) untuk daftar di menu BELAJAR
export const STEP_INFO = [
  { title: 'Besaran & rasio', sub: 'Mulai dari nol: apa itu besaran, perbandingan, dan kunci pertama menjawab soal.' },
  { title: 'Senilai', sub: 'Naik bersama, hasil bagi tetap. Tabel, rumus y = kx, dan ciri-cirinya.' },
  { title: 'Berbalik nilai', sub: 'Satu naik, satu turun, hasil kali tetap. Tabel, rumus y = k ÷ x, dan grafiknya.' },
  { title: 'Cara menghitung', sub: 'Tiga cara: nilai satuan, rasio, dan kali silang, dengan contoh senilai & berbalik.' },
  { title: 'Contoh soal', sub: 'Enam soal bertahap. Coba dulu di kertas, baru buka pembahasannya.' },
  { title: 'Rangkuman', sub: 'Tabel perbandingan lengkap dan enam langkah menjawab soal cerita.' },
  { title: 'Cek cepat', sub: 'Empat langkah membedakan jenis dalam hitungan detik, plus tebak-tebakan.' },
  { title: 'Video belajar', sub: 'Penjelasan guru lain, dikelompokkan dari dasar sampai grafik dan soal.' },
  { title: 'Buku & bacaan', sub: 'Buku teks resmi dan artikel untuk memperdalam.' },
  { title: 'Siap beraksi', sub: 'Ringkasan akhir, lalu lanjut ke Latihan atau Lab.' },
  { title: 'Kamus istilah', sub: 'Kata-kata penting: konstanta, ekuivalen, hiperbola, dan kawan-kawan.', isNew: true },
  { title: 'Kisah sehari-hari', sub: 'Lima situasi nyata: warung, motor, patungan, proyek, dan dapur.', isNew: true },
  { title: 'Salah kaprah', sub: 'Kesalahan yang paling sering terjadi, lengkap dengan cara memperbaikinya.', isNew: true },
  { title: 'Kartu rumus', sub: 'Contekan rumus yang rapi, tinggal tunjuk dan hafalkan.', isNew: true },
];

// Kelompok di menu BELAJAR (items = indeks STEPS)
export const GROUPS = [
  { key: 'konsep', no: '01', name: 'KONSEP', sub: 'Pondasi: besaran, senilai, berbalik nilai, dan istilahnya.', color: '#00E5FF', items: [0, 1, 2, 10] },
  { key: 'hitung', no: '02', name: 'CARA & CONTOH', sub: 'Cara menghitung, contoh soal, kisah nyata, dan kesalahan umum.', color: '#FF4D8D', items: [3, 4, 11, 12] },
  { key: 'ringkas', no: '03', name: 'RINGKASAN', sub: 'Rangkuman, cek cepat, dan kartu rumus untuk mengulang.', color: '#FFD400', items: [5, 6, 13] },
  { key: 'video', no: '04', name: 'VIDEO', sub: 'Tonton penjelasan guru lain, dikelompokkan per tahap.', color: '#FF3B5C', items: [7] },
  { key: 'lain', no: '05', name: 'LAINNYA', sub: 'Buku, bacaan, dan langkah berikutnya.', color: '#B79CFF', items: [8, 9] },
];

// Istilah penting (menu BELAJAR > Kamus istilah)
export const GLOSSARY = [
  { t: 'Besaran', d: 'Sesuatu yang bisa dihitung atau diukur: banyak barang, harga, jarak, waktu, jumlah pekerja.', ex: 'Contoh: 5 buku, Rp35.000, 3 jam.' },
  { t: 'Satuan', d: 'Ukuran yang menyertai angka. Angka tanpa satuan sering membuat kita salah memasangkan data.', ex: 'Contoh: liter, km, hari, orang, rupiah.' },
  { t: 'Perbandingan (rasio)', d: 'Cara membandingkan dua nilai, ditulis a : b dan dibaca "a banding b".', ex: 'Contoh: 3 apel dan 5 jeruk = 3 : 5.' },
  { t: 'Ekuivalen', d: 'Perbandingan yang nilainya sama walau angkanya berbeda, karena dikali atau dibagi bilangan yang sama.', ex: 'Contoh: 2 : 3 = 4 : 6 = 6 : 9.' },
  { t: 'Senilai', d: 'Dua besaran yang naik bersama atau turun bersama dengan laju yang sama. Hasil bagi pasangannya tetap.', ex: 'Contoh: harga dan jumlah barang.' },
  { t: 'Berbalik nilai', d: 'Dua besaran yang berlawanan arah: satu naik, satu turun. Hasil kali pasangannya tetap.', ex: 'Contoh: pekerja dan lama pengerjaan.' },
  { t: 'Konstanta (k)', d: 'Angka tetap yang mengikat dua besaran. Pada senilai k = y ÷ x, pada berbalik nilai k = x × y.', ex: 'Contoh: 15 km per liter; 24 hari-orang.' },
  { t: 'Nilai satuan', d: 'Nilai untuk 1 satuan. Mencarinya dulu membuat hitungan jadi sederhana.', ex: 'Contoh: harga 1 buku = 35.000 ÷ 5 = 7.000.' },
  { t: 'Kali silang', d: 'Cara menyamakan dua perbandingan dengan mengalikan angka secara menyilang.', ex: 'Contoh: 5 × x = 8 × 35.000.' },
  { t: 'Hari-orang', d: 'Satuan "total pekerjaan": jumlah pekerja dikali jumlah hari. Nilainya tetap pada berbalik nilai.', ex: 'Contoh: 6 orang × 20 hari = 120 hari-orang.' },
  { t: 'Hiperbola', d: 'Bentuk kurva grafik berbalik nilai: menurun dan makin mendatar, tidak menyentuh sumbu.', ex: 'Contoh: grafik y = 24 ÷ x.' },
  { t: 'Besaran konstan', d: 'Besaran yang tidak berubah di dalam soal. Menemukannya adalah kunci menentukan jenis hubungan.', ex: 'Contoh: harga satuan (senilai), total pekerjaan (berbalik).' },
];

// Lima kisah sehari-hari (menu BELAJAR > Kisah sehari-hari)
export const STORIES = [
  { t: 'Beras di warung', type: 'senilai', story: 'Ibu membeli 2 kg beras Rp28.000. Ayah menitip 5 kg dengan beras yang sama.', heads: ['Beras (kg)', 'Harga (Rp)'], rows: [['2', '28.000'], ['5', '?']], key: 'Beras naik, harga ikut naik. Harga per kg tetap: Rp14.000.', ans: '5 × 14.000 = Rp70.000.' },
  { t: 'Motor dan bensin', type: 'senilai', story: 'Motor Dani menempuh 60 km dengan 1,5 liter. Berapa liter untuk 100 km?', heads: ['Jarak (km)', 'Bensin (L)'], rows: [['60', '1,5'], ['100', '?']], key: 'Jarak naik, bensin naik. 1 liter = 40 km.', ans: '100 ÷ 40 = 2,5 liter.' },
  { t: 'Patungan makan', type: 'berbalik', story: 'Total makan Rp120.000. Kalau dibagi 4 orang, tiap orang Rp30.000. Jika ikut 6 orang?', heads: ['Orang', 'Iuran (Rp)'], rows: [['4', '30.000'], ['6', '?']], key: 'Orang naik, iuran turun. Total tetap: 4 × 30.000 = 120.000.', ans: '120.000 ÷ 6 = Rp20.000.' },
  { t: 'Proyek taman', type: 'berbalik', story: '8 petugas membersihkan taman dalam 6 hari. Kalau hanya 4 petugas?', heads: ['Petugas', 'Hari'], rows: [['8', '6'], ['4', '?']], key: 'Petugas turun, hari naik. Total tetap: 8 × 6 = 48 hari-orang.', ans: '48 ÷ 4 = 12 hari.' },
  { t: 'Resep kue', type: 'senilai', story: 'Untuk 6 porsi dibutuhkan 240 gram gula. Untuk 15 porsi?', heads: ['Porsi', 'Gula (g)'], rows: [['6', '240'], ['15', '?']], key: 'Porsi naik, gula naik. 1 porsi = 40 gram.', ans: '15 × 40 = 600 gram.' },
];

// Kesalahan yang sering terjadi (menu BELAJAR > Salah kaprah)
export const MYTHS = [
  { bad: 'Semua soal "makin banyak" pasti senilai.', good: 'Periksa arah besaran kedua. Pekerja makin banyak justru membuat hari makin sedikit: itu berbalik nilai.', tip: 'Tanya: besaran kedua ikut naik atau turun?' },
  { bad: 'Pakai kali silang saja untuk semua soal.', good: 'Kali silang yang sama menghasilkan angka berbeda tergantung jenisnya. Tentukan jenisnya dulu, baru pilih pola.', tip: 'Jenis dulu, rumus kemudian.' },
  { bad: 'Selisihnya sama berarti perbandingannya sama.', good: 'Umur 5 dan 10 selisih 5; lima tahun lagi 10 dan 15 juga selisih 5, tetapi perbandingannya berubah dari 1 : 2 menjadi 2 : 3.', tip: 'Bandingkan hasil bagi, bukan selisih.' },
  { bad: 'Jawaban sudah dapat, tidak perlu dicek.', good: 'Selalu uji masuk akal. Pekerja bertambah tetapi hari ikut bertambah berarti ada yang keliru.', tip: 'Cek arah: sesuai dengan jenisnya?' },
  { bad: 'Sama-sama naik pasti senilai.', good: 'Umur dan tinggi badan sama-sama naik, tetapi lajunya tidak tetap. Senilai butuh hasil bagi yang selalu sama.', tip: 'Naik-naik belum cukup: hasil bagi harus tetap.' },
  { bad: 'Angka dan satuan boleh dicampur.', good: 'Pasangkan satuan yang sejenis di kolom yang sama (liter dengan liter, hari dengan hari).', tip: 'Tulis tabel dua baris dulu.' },
];

// Kartu rumus (menu BELAJAR > Kartu rumus)
export const FORMULAS = [
  { t: 'Senilai: persamaan', f: 'y = k × x', n: 'k = y ÷ x, hasil bagi selalu sama.', type: 'senilai' },
  { t: 'Senilai: dua keadaan', f: 'x₁ : x₂ = y₁ : y₂', n: 'Kali silang: x₁ × y₂ = x₂ × y₁.', type: 'senilai' },
  { t: 'Senilai: nilai satuan', f: 'y₂ = (y₁ ÷ x₁) × x₂', n: 'Cari nilai untuk 1 satuan, lalu kalikan.', type: 'senilai' },
  { t: 'Berbalik: persamaan', f: 'y = k ÷ x', n: 'k = x × y, hasil kali selalu sama.', type: 'berbalik' },
  { t: 'Berbalik: dua keadaan', f: 'x₁ × y₁ = x₂ × y₂', n: 'Total tetap, lalu bagi dengan nilai baru.', type: 'berbalik' },
  { t: 'Berbalik: nilai baru', f: 'y₂ = (x₁ × y₁) ÷ x₂', n: 'Hitung totalnya dulu, lalu bagi.', type: 'berbalik' },
  { t: 'Uji 2 kali lipat', f: 'x × 2  →  y × 2 atau y ÷ 2', n: 'Ikut 2 kali: senilai. Setengah: berbalik nilai.', type: 'uji' },
  { t: 'Uji masuk akal', f: 'Arah jawaban cocok jenisnya?', n: 'Naik-naik atau turun-turun: senilai. Naik-turun: berbalik nilai.', type: 'uji' },
];

// Catatan saat menonton video (menu BELAJAR > Video)
export const WATCH_TIPS = [
  'Siapkan buku dan pensil, jeda video saat soal muncul dan hitung sendiri dulu.',
  'Catat satu hal yang paling membuatmu paham, dengan kata-katamu sendiri.',
  'Setelah menonton, buka LATIHAN dan coba satu misi Mudah tanpa petunjuk.',
];


// Video YouTube tentang perbandingan senilai & berbalik nilai (SMP).
// Tautan dibuka di aplikasi/browser YouTube (bukan diputar di dalam aplikasi), jadi tidak terkena larangan embed.
// Video milik pembuatnya masing-masing. Cek ulang tautan sebelum dipakai di kelas (video bisa dihapus pembuatnya).
export const VIDEOS = [
  { id: 'cYlnBH1IRGg', title: 'Perbandingan Senilai dan Berbalik Nilai Kelas 7 (Part 1)', note: 'Materi dasar sesuai Kurikulum Merdeka, urut dari konsep. Cocok ditonton pertama.', grp: 'DASAR' },
  { id: 'lhFk1-abivQ', title: 'Perbandingan Senilai dan Berbalik Nilai Kelas 7 (Part 2)', note: 'Lanjutan Part 1: pembahasan soal-soal secara bertahap.', grp: 'DASAR' },
  { id: 'h_MxfRyKgmM', title: 'Cara membedakan senilai dan berbalik nilai + penyelesaiannya', note: 'Fokus pada kesulitan utama: menentukan jenisnya dulu, lalu menghitung.', grp: 'MEMBEDAKAN' },
  { id: 'A0k1O6ktJaE', title: 'Grafik Perbandingan Senilai dan Berbalik Nilai', note: 'Melihat bentuk garis lurus dan kurva menurun pada grafik.', grp: 'GRAFIK' },
  { id: 'ODpOQrTvadg', title: 'Perbandingan Senilai dan Berbalik Nilai (contoh soal)', note: 'Penjelasan singkat dengan contoh soal kelas 7.', grp: 'SOAL' },
  { id: '57n7ZKWbO_4', title: 'Ulasan Materi SMP Bab 4 Perbandingan Senilai dan Berbalik Nilai', note: 'Mengulas bab di buku Matematika kelas 7 Kurikulum Merdeka.', grp: 'SOAL' },
];

export const VIDEO_GROUPS = [
  { key: 'DASAR', name: 'DASAR', sub: 'Tonton lebih dulu, berurutan.', color: '#00E5FF' },
  { key: 'MEMBEDAKAN', name: 'MEMBEDAKAN JENIS', sub: 'Kesulitan terbesar siswa.', color: '#FFD400' },
  { key: 'GRAFIK', name: 'GRAFIK', sub: 'Garis lurus dan kurva.', color: '#FF4D8D' },
  { key: 'SOAL', name: 'SOAL & ULASAN', sub: 'Menguatkan dengan contoh.', color: '#B79CFF' },
];

export const YT_SEARCH = 'https://www.youtube.com/results?search_query=perbandingan+senilai+dan+berbalik+nilai+kelas+7';
export const ytUrl = (id) => `https://www.youtube.com/watch?v=${id}`;
export const ytThumb = (id) => `https://img.youtube.com/vi/${id}/mqdefault.jpg`;

// Buku & bacaan
export const BOOKS = [
  { t: 'Matematika untuk SMP/MTs Kelas VII (Buku Siswa, Kurikulum Merdeka)', by: 'Kemendikbudristek. Buku teks resmi, memuat bab perbandingan senilai dan berbalik nilai.', url: 'https://static.buku.kemdikbud.go.id/content/pdf/bukuteks/kurikulum21/MATEMATIKA-BS-KLS%20VII.pdf' },
  { t: 'Matematika SMP/MTs Kelas VII Semester 2 (Buku Siswa, Kurikulum 2013)', by: 'Kemendikbud RI. Buku teks resmi, gratis di Buku Sekolah Elektronik.', url: 'https://static.buku.kemdikbud.go.id/content/pdf/bukuteks/k13/bukusiswa/Matematika%20Sm2%20SMP%20Kelas%207%20BS%20press.pdf' },
];

export const WEBS = [
  { t: 'Pengertian perbandingan, jenis, dan cara menghitungnya', by: 'Blog Ruangguru. Artikel kelas 7 lengkap dengan rumus dan grafik.', url: 'https://www.ruangguru.com/blog/perbandingan' },
  { t: 'Perbandingan Matematika Kelas 7', by: 'Blog Quipper. Ringkasan perbedaan senilai dan berbalik nilai.', url: 'https://www.quipper.com/id/blog/mapel/matematika/perbandingan-matematika-kelas-7/' },
  { t: '10 contoh soal perbandingan senilai dan berbalik nilai', by: 'Mamikos. Soal latihan beserta pembahasannya.', url: 'https://mamikos.com/info/?p=279581' },
  { t: 'Direct and inverse variation', by: 'Khan Academy (bahasa Inggris). Video y = kx dan y = k/x untuk memperdalam.', url: 'https://www.khanacademy.org/math/algebra-home/alg-rational-expr-eq-func/alg-direct-and-inverse-variation/v/direct-and-inverse-variation' },
  { t: 'Studi literatur: miskonsepsi siswa kelas VII pada perbandingan senilai dan berbalik nilai', by: 'Artikel jurnal tentang kesalahan umum siswa.', url: 'https://ejurnal.univamedan.ac.id/index.php/jkpm/article/download/1084/772/3336' },
];

// ringkasan progres belajar dari objek progress
export function materiStat(progress = {}) {
  const m = progress.materi || {};
  const seen = Object.keys(m.seen || {}).length;
  const vids = Object.keys(m.videos || {}).length;
  return { seen, vids, total: STEPS.length, vtotal: VIDEOS.length, frac: (seen + vids) / (STEPS.length + VIDEOS.length) };
}
