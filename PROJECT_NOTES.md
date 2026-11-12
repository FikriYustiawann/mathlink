# Catatan Pengembangan (untuk dilanjutkan di sesi/AI/orang lain)

## Tujuan
Draft aplikasi matematika (Perbandingan Senilai & Berbalik Nilai). Fokus UI saat ini: tema Persona 3 Reload.
Kebutuhan fitur diturunkan dari wawancara kebutuhan siswa (kisi-kisi Cognitive Load, informan S01). Lihat bagian Versi 13.

## Keputusan desain
- Hanya pakai API inti React Native (Animated, Pressable, View, Text). Tidak ada library gradient/animasi tambahan.
- Animasi memakai `useNativeDriver: true` (hanya transform & opacity). Warna tidak dianimasikan.
- Lobby meniru menu pause P3R: panel putih kiri + teks vertikal, menu miring bertumpuk
  (item terpilih = pita merah, teks hitam; lainnya makin biru/redup), kartu portrait kanan atas,
  petunjuk tombol kanan bawah, latar bawah laut (`AnimatedBackground variant="sea"`).
- Karakter: `CHARACTER_IMAGE` = `assets/characters/makoto.png` (artwork Makoto baru, latar dihapus, bawah dipudarkan; animasi: melayang, goyang, aura & cincin berdenyut).
  Kredit ATLUS/SEGA tampil di lobby (`CHARACTER_CREDIT`). Jika diganti, sesuaikan `CHARACTER_ASPECT` di config. Siluet tampil bila nilainya `null`.
  Aset resmi berhak cipta Atlus/Sega -> jangan commit ke repo publik (sudah di .gitignore).

## Unsur matematika di latar (v3)
`src/components/MathBackdrop.js` dipakai oleh `AnimatedBackground` (varian `sea` dan `page`; UI lain tidak diubah):
- Kertas grafik bergeser pelan.
- Grafik `y = kx` (senilai, cyan) dan `x·y = k` (berbalik nilai, merah muda) dengan titik yang berjalan di kurva
  (warna sama dengan kartu di Materi). Hanya di lobby.
- Angka & rumus naik seperti gelembung (daftar `RISERS`; isi sesuai materi, ubah bebas).
Mode `rich` (khusus lobby) menambah: busur derajat berputar + jarum, gelombang sinus, diagram batang naik/turun
(senilai vs berbalik nilai), dan label rumus `x₁ : x₂ = y₁ : y₂` / `x₁ · y₁ = x₂ · y₂`.
Props: `grid`, `graph`, `rich`, `rising` (jumlah gelembung). Tetap hanya transform/opacity + `useNativeDriver`.

## Musik latar (v3)
- Isi `MUSIC_URL` di `src/config.js` dengan link YouTube; kosong = tombol disembunyikan.
- `MusicEngine.web.js` (iframe embed) dan `MusicEngine.js` (WebView, perlu `react-native-webview`) dipilih otomatis per platform.
- Musik baru mulai setelah tombol "BGM" ditekan (aturan autoplay browser) dan tetap jalan saat pindah layar.
- Diuji di web (build + klik). Versi Android/iOS belum diuji di perangkat.
- Perhatian hak cipta: lagu komersial (mis. soundtrack P3R) berhak cipta. Untuk rilis ke Play Store/App Store,
  pakai musik bebas royalti/berlisensi sendiri. Di build native, pakai file audio lokal (expo-av) alih-alih YouTube.

## Cara menambah menu / layar
1. Tambah item di `MENU` pada `src/config.js` (`screen: 'NAMA'`, hapus `locked`).
2. Buat `src/screens/Nama.js` (bungkus dengan `PageShell`).
3. Daftarkan di `App.js` (`{screen === 'NAMA' && <Nama onBack={home} />}`).

## Menu (v6) dan dasar desainnya
Dirancang dari temuan wawancara kebutuhan siswa (kisi-kisi cognitive load) dan Tabel 2 soal & kisi-kisi jawaban.
| Menu | Temuan yang dijawab | File |
|---|---|---|
| MATERI | siswa terbantu tabel + gambar panah | `screens/Materi.js` |
| BEDAKAN | sering tertukar senilai vs berbalik nilai (naik–naik vs naik–turun) | `screens/Bedakan.js` |
| LANGKAH | butuh contoh bertahap, satu langkah per layar, info penting ditandai | `screens/Langkah.js` |
| LATIHAN | soal Tabel 2 dipecah per tahap, petunjuk bertingkat, pembahasan saat salah, skor per tahap (2/1/0) | `screens/Latihan.js` |
| PROGRES | skor, jumlah petunjuk yang dipakai, soal yang perlu diulang | `screens/Progres.js` |
Isi soal/contoh ada di `src/data.js`. Kalimat soal sengaja pendek. Nama informan tidak dipakai (soal memakai nama "Rina").
Masuk dengan nama (`screens/Login.js`, tanpa kata sandi). Skor disimpan per nama lewat `utils/storage.js`:
localStorage di web (permanen di browser yang sama), hanya selama aplikasi terbuka di Android/iOS (perlu AsyncStorage untuk permanen).

## Latihan, Trophy & Profil (v7)
- `screens/Latihan.js` + `components/Quiz.js`: daftar misi (rank S/A/B/C, bar skor terbaik), HUD tahap (kotak progres berwarna sesuai poin, combo),
  pilihan jawaban A/B/C yang masuk bertahap + bergetar saat salah, petunjuk sebagai gelembung bicara Makoto, cap "BENAR!" + serpihan,
  layar hasil dengan banner `done_and_dusted.jpg`, rank, hitung naik skor, XP & level-up, dan trophy baru.
- `src/trophies.js`: daftar 10 trophy (perunggu/perak/emas/platinum), XP, level (nama level = Arcana, Lv 1-10), rank. Semua dihitung dari `progress`.
  Tambah trophy baru = tambah satu objek di `TROPHIES` (`test: (progress) => boolean`).
- `progress[idSoal]` kini: `{ score(terakhir), max, hints, best, attempts, clean, improved }`; `progress._trophies = { id: waktuBuka }`. Data lama tetap terbaca.
- `App.js`: `commit()` menerapkan perubahan lalu `awardTrophies()`. Trophy dari BEDAKAN tampil sebagai popup (`TrophyToast`) di layar mana pun.
- `screens/Profil.js` (menu PROFIL): banner + avatar, level/XP, statistik, rank per misi, grid trophy (ketuk = detail & cara membuka). Chip nama di Lobby juga menampilkan Lv + jumlah trophy dan bisa diketuk.
- `components/Fx.js`: Rise, Pop, PressScale, Burst, CountUp, Meter, useShake (hanya transform/opacity).
- Aset: `assets/characters/done_and_dusted.jpg` (banner) dan `makoto_avatar.jpg` (potongan wajah). Berhak cipta ATLUS/SEGA, sudah tercakup `.gitignore`.
- Belum diuji di perangkat/browser oleh pembuat (hanya cek sintaks + uji logika trophy). Cek tata letak di layar kecil.

## Pilih karakter (v9)
- Login: nama + jenis kelamin. Cowok = Makoto Yuki, cewek = Aigis. Pilihan disimpan per nama (`mp3r:gender:<nama>`) dan dikenali lagi saat nama yang sama diketik.
- Semua data karakter ada di `CHARACTERS` (`src/config.js`): gambar lobby (PNG transparan), banner hasil latihan, banner kepala di Profil, avatar, warna pita menu, kredit.
- Komponen membaca karakter aktif lewat `useChar()` (`src/CharacterContext.js`). Menambah karakter baru = tambah satu objek di `CHARACTERS` + aset.
- `aigis.png` adalah hasil potong otomatis dari art resmi (GrabCut) dan diperbesar dari 736x414, jadi agak lembut. Ganti dengan PNG transparan beresolusi tinggi bila ada.
- Performa: `src/perf.js` -> `LITE` (otomatis aktif di Android; ubah `PERF_MODE` di config). Mode ringan mengurangi gelembung rumus, bentuk, rumus papan tulis, dan mematikan busur derajat, gelombang sinus, & penggaris.
- Aset gambar sudah dikecilkan (total ~2 MB; hanya gambar karakter yang aktif yang dimuat).

## Versi 10: siap Android (Expo SDK 58)
- Naik dari SDK 49 ke **SDK 58**: Expo Go Play Store hanya mendukung SDK terbaru, SDK 49 tidak bisa dibuka lagi.
  `package.json` hanya memuat `expo`; library lain dipasang lewat `npm run setup` (`expo install`) agar versinya cocok.
- Web kini memakai Metro (`app.json` -> `web.bundler: metro`); `@expo/webpack-config` dihapus.
- Titik masuk `index.js` (`registerRootComponent`) menggantikan `expo/AppEntry.js`.
- Penyimpanan permanen: `utils/storage.js` memakai AsyncStorage di HP (dimuat sekali saat buka lewat `initStorage`, API `load/save` tetap sinkron).
- `App.js`: `SafeAreaProvider` + `SafeAreaView` dari `react-native-safe-area-context` (Android SDK baru edge-to-edge),
  `StatusBar` dari `expo-status-bar`, tombol Back Android ke lobby, musik dijeda saat app ke latar belakang.
- `Image resizeMode` dipindah ke `style` (prop lama deprecated).
- Ditambahkan ikon, `eas.json` (APK preview/development), `.vscode/extensions.json`, `PANDUAN_UJI_HP.md`.
- **Belum diuji**: paket ini disusun tanpa bisa menjalankan `npm install`/Expo. Jalankan `npm run doctor`
  dan cek daftar di `PANDUAN_UJI_HP.md`. Jika ada error versi, `npm run fix`.

## Versi 11: perbaikan tampilan HP (dari uji di Infinix, Expo Go)
- Lobby potret: karakter besar berdiri di depan panel putih (wajah ~36% lebar layar), panel putih lebih sempit (30%),
  menu lebih besar (font 9,2% lebar layar, jarak antar menu ditambah lewat prop `gap` di `LobbyMenu`), petunjuk menu dipindah di bawah menu.
  Aigis di potret memakai `aigis.png` (potongan transparan); artwork lebar `lobbyArt` hanya untuk lanskap.
- Chip nama lebih lebar di potret (teks Lv/trophy tidak terpotong); root Lobby `overflow: hidden`.
- Musik: WebView YouTube kini diletakkan di luar layar (opacity tidak menyembunyikannya di Android); error YouTube
  (mis. 152 = video melarang embed) terdeteksi dan tombol musik disembunyikan. Opsi baru `MUSIC_FILE` (file mp3 lokal lewat `expo-audio`, opsional).
- Ikon roda gigi di pojok kanan atas saat uji = menu Expo Go, tidak ada di APK.

## Status
- [x] Lobby bertema P3R + animasi, kredit ATLUS/SEGA
- [x] Materi, Bedakan, Langkah, Latihan (4 soal bertahap), Progres
- [x] Latar matematika + musik YouTube (draft)
- [x] Masuk dengan nama pengguna
- [x] Latihan interaktif, trophy (14), XP/level, layar Profil, latar matematika diperkaya (bentuk, rumus, garis bilangan, penggaris)
- [x] Penyimpanan progres permanen di HP (AsyncStorage)
- [ ] Sinkronisasi progres ke server (opsional)
- [ ] Validasi isi oleh ahli dan uji coba ke siswa
- [ ] Bank soal lebih banyak, jalur belajar adaptif

## Catatan teknis
- macOS: `EMFILE` -> `ulimit -n 10240` / watchman. Node 18/20 disarankan.
- Belum diuji visual di browser oleh pembuat awal; cek tata letak di berbagai ukuran layar.

## Versi 12: Makoto saja, lobby dirapikan, transisi halus
- Aigis dihapus total: blok `cewek` di `CHARACTERS`, pilihan gender di Login, logika `lobbyArt` di Lobby, aset `aigis*`. Hanya Makoto Yuki.
  Pilihan gender (`mp3r:gender:*`) tidak dipakai lagi; data lama di penyimpanan tidak mengganggu.
- Lobby (HP): petunjuk menu kini chip kecil (`HintChip`) tepat di bawah menu, tidak menimpa wajah karakter; teks bergeser halus saat ganti menu.
  Grafik y=kx / x·y=k di latar dikecilkan dan dipindah ke kanan bawah (opacity 0,45) agar tidak bertabrakan dengan menu.
- Transisi layar (`useScreenTransition` di `App.js`): layar lama memudar + geser keluar, layar baru masuk (maju = ke kiri, kembali ke lobby = ke kanan). Hanya opacity/transform.
  Semua pindah layar lewat `go(layar, back?)`; `jump()` tanpa animasi (dipakai di bawah layar intro login). Menu lobby masuk lebih cepat (tanpa efek back-overshoot).
- Musik: `MUSIC_URL = ''` (YouTube dimatikan). Jalur resmi = file lokal via `expo-audio` (sudah ada di `npm run setup`). `assets/music/bgm_original.mp3` = loop orisinal placeholder, belum diaktifkan. Lihat `assets/music/README.md`.
- Belum diuji di perangkat (tidak ada Expo di lingkungan penyusun); cek ulang tata letak chip di layar kecil.


## Versi 13: penyesuaian dengan tujuan wawancara (Cognitive Load) + permintaan siswa
Tema Persona 3 Reload TETAP dipertahankan (lobby, pita miring, Makoto, trophy, XP). Yang diubah adalah cara tema itu dipakai
di layar belajar, supaya tidak menambah extraneous load, dan fitur yang diminta siswa ditambahkan.

### Jejak keputusan: temuan wawancara -> fitur -> cara uji
| Kode | Temuan / permintaan siswa (S01) | Fitur | Cara uji |
|---|---|---|---|
| EL02/EL03, DS03 | Tampilan ramai berpotensi mengganggu (belum ditanyakan langsung ke siswa) | **Mode FOKUS** (`src/focus.js`): di Bedakan, Langkah, Latihan latar bergerak, combo, dan ledakan dimatikan; tombol bisa dimatikan. Lobby, Materi, Profil, hasil tetap bertema penuh | Tanyakan EL03/DS03 ke siswa; bandingkan fokus ON vs OFF |
| DS01 | "gambar ilustrasi objeknya" | `Pic` (emoji objek + keterangan) dekat teks soal di Bedakan, Langkah, Latihan | Wawancara kejelasan tampilan |
| DS03, GL01 | "tabel atau gambar" juga pada soal latihan | Tabel data di tiap soal Latihan (`TABEL` di data.js) | Amati apakah siswa memakai tabel saat menjawab |
| DS01, EL03 | "langkah bertahap, dipisah per layar", penjelasan pelan | Langkah satu per layar; di Bedakan bukti hitung dibuka belakangan | Amati apakah siswa tertinggal |
| Penutup | Contoh dekat kehidupan (bensin motor, patungan makanan) | Soal baru: Patungan Makanan, Beras di Warung, Pompa Air | Wawancara pasca-pakai |
| GL02, GL04 | Menjelaskan alasan membantu paham | Soal REFLEKSI "Mengapa?" di akhir 7 misi utama; "Jelaskan dulu" + penjelasan model di Langkah | Bandingkan kualitas penjelasan sebelum/sesudah |
| GL03 | Mandiri bila bantuan dikurangi bertahap | Bantuan memudar: Mudah/Menengah penuh, Sulit 1 petunjuk, Transfer 1 petunjuk dan 2 tahap | Catat petunjuk terpakai di PROGRES |
| GL05 | Transfer ke cerita berbeda | 3 misi bertanda TRANSFER (konteks baru, tahap lebih sedikit) | Skor transfer vs misi bertahap |
| IL03 | Prasyarat / variasi kemampuan | Misi **CEK AWAL** (3 soal): hasil menyarankan LANGKAH dulu atau lanjut ke Mudah | Bandingkan hasil cek awal dengan kinerja misi |

### Catatan teknis v13
- Data tambahan (PIC, TABEL, REFL, EXPLAIN) ada di bagian bawah `src/data.js` dan ditempelkan ke CASES/EXAMPLES/QUESTIONS.
- `PageShell` menerima prop `focusable`; `AnimatedBackground` punya varian `calm`.
- Misi `cek` bertipe `dasar` (tag kuning). Skor misi utama sekarang memuat 1 tahap refleksi, jadi `max` naik (mis. Pekerja dan Waktu 8 -> 10).
  Skor lama yang tersimpan di perangkat memakai max lama; hapus data lama bila ingin trophy dihitung ulang bersih.
- Belum diuji di perangkat. Cek: emoji tampil di Android, tombol FOKUS tidak menimpa tombol KEMBALI di layar sempit.

### Yang masih perlu (di luar kode)
- Validasi isi oleh ahli dan uji keterbacaan; tanya EL03 dan DS03 langsung ke siswa (efek visual: perlu atau mengganggu).
- Pertanyaan DS01 di lembar wawancara memuat kata "berbasis game"; sebaiknya dicatat sebagai pertanyaan yang agak menggiring.

## Versi 13: musik lokal + kontrol musik yang hilang sendiri
- `assets/music/bgm.mp3` (P5 "Beneath the Mask" rain, dipotong 8 menit/96 kbps dari versi 1 jam) aktif lewat `MUSIC_FILE`; `expo-audio` ada di `npm run setup`.
- `MusicButton`: ikon ♪ nyala/mati + volume − / + (5 segmen). Muncul 3,5 detik lalu memudar; ketuk pojok kanan bawah (44x44, tak terlihat) untuk memunculkan lagi. Posisi kanan bawah agar tidak menimpa tombol FOKUS di header.
- Musik mulai otomatis setelah login, jeda saat app ke latar belakang. Volume awal 60.
- Lagu berhak cipta: ganti sebelum rilis publik.

## Versi 14: rapikan Latihan, hapus SWITCH, Command, transisi
- Simbol UI tidak lagi memakai karakter font (▶ ◀ ▲ ▼ ✓ ✕ ↑ ↓ ◉ ◼ 💡): `src/components/Glyph.js` menggambarnya dengan View (`Tri`, `CheckMark`, `CrossMark`, `ArrowV`, `Box`, `Dot`). `Btn` punya prop `icon="right|left"`.
  Penyebab "acak-acakan": karakter itu jatuh ke font cadangan berbeda per HP (sebagian jadi emoji berwarna).
- `Pic` (ilustrasi emoji di soal): emoji diseragamkan, deretan panjang diringkas "emoji ×n", panah ➜ digambar. Teks di `data.js` tidak diubah.
- Tipografi Latihan/Quiz disamakan: soal 500, pertanyaan 700, pilihan 600, petunjuk 500; huruf pilihan tidak miring lagi.
- Lobby: tombol SWITCH dihapus (prop `onLogout` masih ada tetapi tidak dipakai; tidak ada cara logout di UI). Petunjuk menu = teks + garis bawah + label COMMAND di atas pita gelap miring (teks tidak ikut miring).
- Transisi layar: opacity hanya turun ke 0,55 (bukan 0) dan tanpa scale, animasi masuk menunggu 2 frame; tidak ada lagi kedip gelap.

## Fitur profil v2
- Profil sekarang punya **EDIT PROFILE** untuk memilih avatar dan banner dari daftar karakter di `src/config.js`.
- Pilihan profil disimpan per nama pengguna di AsyncStorage/localStorage.
- Profil punya **SHARE PROFILE** yang membuat kartu profil PNG berisi avatar, banner, level, XP, jumlah misi, dan trophy.
- Kartu dapat disimpan ke galeri atau dibagikan lewat share sheet Android.
- Untuk karakter tambahan, cukup tambahkan entry baru ke `CHARACTERS` di `src/config.js`; picker profil akan membacanya otomatis.
- Dependensi tambahan: `expo-media-library`, `expo-sharing`, `react-native-view-shot`. Jalankan `npm run setup` setelah mengambil project.

## Versi 15: SFX global, BGM per layar, tirai transisi, LAB, kartu profil P3R
- `src/audio.js`: `sfx('click'|'select'|'back'|'correct'|'wrong'|'swipe')` dipanggil dari `Btn`, `PressScale`, `LobbyMenu`, `PageShell`. `BGM` = peta lagu per layar (HOME, LATIHAN, MATERI, GAME, LAB); `App.js` memutar `LocalMusic key=<lagu>` sehingga lagu berganti saat masuk menu.
- Semua SFX dan `bgm_latihan/game/lab.mp3` dibuat orisinal lewat sintesis (placeholder). Untuk suara/lagu Persona sendiri: timpa file dengan NAMA SAMA di `assets/sfx/` dan `assets/music/` (berhak cipta Atlus/Sega; hanya untuk uji pribadi).
- `Curtain.js`: tirai miring P3R menutup, layar diganti saat tertutup, buka setelah `requestIdleCallback` selesai -> tidak ada lag terlihat.
- `screens/Lab.js` (menu LAB): stepper x, bar x/y, nilai tetap (y÷x atau x×y), "Tebak Dulu". Hasil tersimpan di `progress.lab`.
- Kartu SHARE PROFILE: pita merah/cyan miring, avatar belah ketupat, nama bergaya P3R.
- Belum diuji di perangkat.

## Versi 16: kartu status HP/SP, 3 game belajar baru, GAME/PROGRES/LAB dipercantik
- **Kartu profil lobby (pojok kiri atas)** = `components/StatusCard.js`, meniru HUD party Persona 3 Reload:
  potret miring + badge LV, nama + Arcana, bar **HP** (merah, = XP menuju level berikutnya) dan bar **SP** (cyan, = misi LATIHAN selesai).
  Bar bersegmen, angka `nilai/maks`, jejak putih menyusul pelan saat nilai turun, berkedip saat HP <= 30%. Ketuk = buka PROFIL.
  Avatar mengikuti pilihan di EDIT PROFILE (`profile.avatar`). `Gauge` diekspor dan dipakai ulang di Shadow Battle dan PROGRES.
- **GAME sekarang berupa peta 5 mode** (`screens/Game.js`; kartu menampilkan skor terbaik + jumlah main):
  1. `games/Battle.js` SHADOW BATTLE: 3 lantai Tartarus. Tahap 1 pilih jenis hubungan (weakness), tahap 2 hitung (4 opsi,
     pengecoh = kesalahan umum: dikira senilai/berbalik, selisih, dibalik). ANALYZE (3 SP) = petunjuk bertahap (arah tabel, lalu rumus berisi angka).
     Salah = HP pemain turun, selalu ada pembahasan. Combo >= 2 = ALL-OUT. Skor maks 100 (30/lantai + sisa HP/10).
  2. MISI RELASI (lama): baca arah panah.
  3. TEBAK JENIS: sekarang 5 soal cerita ACAK + tabel + pembahasan rumus (dulu 3 soal tetap).
  4. `games/IsiTabel.js` ISI TABEL: mengetik angka dengan keypad; strategi "nilai 1 satuan dulu". Bantuan memudar: salah 1x tip, 2x rumus, 3x jawaban (0 poin). Maks 120.
  5. `games/PasanganRasio.js` PASANGAN RASIO: kartu memori (rasio senilai, lalu hasil kali sama). Alasan tiap pasangan muncul saat cocok. Maks 100.
  Tidak ada timer (sesuai keputusan awal: tidak menambah beban kognitif). Semua soal dibuat `src/gamedata.js` (acak, jawaban selalu bilangan bulat;
  sudah diuji 20.000 soal: jawaban ada di opsi, opsi unik, kunci cocok dengan rumus).
- Penyimpanan: `progress.games[kunci] = { best, max, plays, floors? }` (kunci: battle, jenis, tabel, pasang) lewat `onMini` di `App.js`.
  XP: maks 30 per game (sebanding skor terbaik). Trophy baru: Shadow Hunter, Tartarus Vanguard, Table Tactician, Mind Palace (total 20).
- PROGRES: ringkasan HP/SP + chip (trophy, XP, petunjuk), bar animasi, daftar game. LAB: tabel semua nilai yang bisa diketuk, kolom terakhir (y÷x atau x×y) selalu sama.
- Tombol KEMBALI di Misi Relasi sekarang ke peta game (bukan langsung ke lobby).
- Belum diuji di perangkat (hanya cek sintaks dengan esbuild + uji logika generator). Cek: lebar kartu status di layar sempit, tinggi Shadow di HP kecil,
  keypad Isi Tabel, grid 4 kolom Pasangan Rasio.

## Versi 16b: nama & ikon MathLink
- Nama aplikasi **MathLink** (tagline "Belajar. Pahami. Raih Nilai!"). `app.json`: name `MathLink`, slug `mathlink`. Package id tetap `com.mathp3r.app` (ganti hanya sebelum rilis pertama).
- Ikon dari gambar logo: `assets/icon.png` (1024), `assets/adaptive-icon.png` (logo di zona aman 72%, latar navy `#020C1B`), `assets/favicon.png`.
- Ikon memuat artwork karakter berhak cipta ATLUS/SEGA: cukup untuk uji pribadi, ganti sebelum rilis ke toko aplikasi.

## Versi 17: kartu profil ringkas, Progres tersambung ke menu, transisi halus, BELAJAR diperbanyak
- **Kartu profil lobby**: `StatusCard` punya prop `compact` (avatar 38, bar HP/SP tipis, tanpa legenda). Lobby memakainya (lebar ~216-236); menu lobby naik sedikit karena kartu lebih pendek. Shadow Battle tetap memakai ukuran penuh.
- **PageShell lebih lega di HP**: padding samping responsif (14/22/32), maxWidth 1000, jarak antar kartu dirapatkan; prop `scrollKey` menggulir ke atas saat ganti bagian/tab; `Card` kini muncul halus (`delay` opsional).
- **Progres** (`screens/Progres.js`): 5 tab (RINGKASAN, BELAJAR, GAME, LATIHAN, LAB). RINGKASAN = progres keseluruhan + kartu tiap menu (ketuk = buka menunya) + "Langkah berikutnya" (menu dengan progres terendah). Semua angka dihitung dari objek `progress` yang sama dengan lobby/profil.
- **Pelacakan BELAJAR**: `progress.materi = { seen: {indexBagian: true}, videos: {idVideo: true} }` lewat `onMateri` di `App.js`. XP: 2 per bagian dibaca, 3 per video dibuka. Trophy baru: Scholar of the Hour (semua bagian dibaca), Visual Learner (3 video dibuka). Total trophy 22.
- **BELAJAR** (`screens/Materi.js`, data di `src/materiData.js`): 10 bagian (Konsep, Senilai, Berbalik, Cara hitung, Contoh, Rangkuman, Cek cepat, Video, Rujukan, Siap). Tambahan: pengertian rasio/skala, tabel & grafik tiap jenis, 3 cara hitung (nilai satuan, rasio, kali silang), 6 contoh soal dengan pembahasan tersembunyi (termasuk soal dua tahap dan satu soal "bukan senilai maupun berbalik"), tabel rangkuman, "Tebak jenisnya".
- **Video**: 6 tautan YouTube (hasil pencarian web; judul diringkas, isi video belum ditonton pembuat aplikasi) dibuka lewat `Linking` di aplikasi/browser YouTube, bukan di-embed. Thumbnail dari `img.youtube.com` (perlu internet, ada ikon cadangan). Video bisa dihapus pembuatnya: cek ulang sebelum dipakai di kelas. Ganti/tambah video di `VIDEOS`.
- **Transisi** (`useScreenTransition` di `App.js`): kurva `bezier(0.45, 0, 0.2, 1)`, tirai menutup 280 ms dan membuka 420 ms, isi layar baru naik + memudar + sedikit membesar bersamaan dengan tirai membuka (tidak lagi muncul mendadak). Di BELAJAR, pergantian bagian memudar-geser mengikuti arah (maju/mundur).
- Belum diuji di perangkat (hanya cek sintaks dengan esbuild + uji logika trophy/XP). Cek: lebar kartu profil di layar sempit, 5 tab Progres di HP kecil, thumbnail video saat offline.

## Versi 18: lagu per menu, font Inter seragam, emoji 2D, rapikan teks Latihan
- **Lagu untuk setiap menu** (`src/audio.js` -> `BGM`): HOME `bgm.mp3`, MATERI `bgm_materi`, LATIHAN `bgm_latihan`, GAME `bgm_game`, LAB `bgm_lab`,
  PROGRES `bgm_progres`, PROFIL `bgm_profil`. Enam lagu baru adalah komposisi orisinal hasil sintesis (`tools/make_music.py`, numpy + ffmpeg),
  loop mulus, bebas hak cipta. `LocalMusic` kini fade-in ~1 detik tiap pindah menu. Kontrol volume/mati tetap di lobby dan berlaku di semua menu.
- **Font**: Inter (subset Latin + panah + simbol matematika, 12 berkas OTF di `assets/fonts/`, lisensi OFL) dimuat lewat `expo-font` di `App.js`.
  Semua teks lewat `src/components/Txt.js` yang menerjemahkan `fontWeight`/`fontStyle` lama ke berkas font yang tepat, sehingga angka, × ÷ − → dan huruf
  miring tebal tampil sama di semua HP. Teks < 11 px dinaikkan ke 11. Impor `Text` di semua berkas diganti ke `Txt` (otomatis), `Animated.Text` -> `AnimText`.
  Kalau `expo-font` belum terpasang, aplikasi tetap jalan dengan font sistem. Jalankan `npm run setup` (sudah memuat `expo-font`).
- **Emoji 2D**: 20 ikon flat digambar sendiri (`assets/emoji/*.png`, `tools/make_emoji.py`), dipakai komponen `Pic` (Ui.js) menggantikan emoji font.
  Teks di `data.js` tetap memakai emoji sebagai kode; `Pic` mengubahnya menjadi gambar lewat peta `EMOJI_IMG`. Ikon baru = tambah PNG + satu baris di `EMOJI_IMG`.
- **Teks Latihan**: label campur Inggris diperbaiki (HINT -> PETUNJUK, JAWABANNYA -> JAWABAN, "Salah 3×" -> "Salah 3 kali", dst.), peta misi tidak lagi 7 px,
  ukuran huruf soal/pilihan/petunjuk dinaikkan. Deskripsi 22 trofi kini berbahasa Indonesia; layar Login berbahasa Indonesia.
- **Belum diuji di perangkat** (lingkungan penyusun tidak bisa menjalankan Expo). Cek: font termuat (tidak ada teks berganti rupa), gambar emoji di Pic,
  lagu berganti saat pindah menu, tidak ada jeda panjang saat lagu mengulang (MP3 punya jeda kecil di sambungan loop).

## Versi 17: poles UI P3R (Belajar, Latihan, Game, Lab, Progres, kartu pojok kiri)
- `src/components/P3.js` = kit UI bersama: `Slab` (panel miring + bayangan), `MenuRow` (baris menu ala pause menu P3R), `TabBtn`, `Ribbon`, `Kicker`, `Chip`, `Ghost` (angka raksasa transparan).
- `PageShell`: tombol KEMBALI pita merah miring, judul pita putih di atas bayangan merah + tulisan raksasa transparan; prop baru `crumb` (jejak menu) dan `sub` (keterangan). `Card` punya strip judul miring dan sudut bertakik.
- `StatusCard` (pojok kiri lobby) dibuat ulang: bayangan merah, potret miring, badge LV, arcana bergaris, bar HP/SP dengan label chip. `Gauge` ikut berubah (dipakai juga di Shadow Battle & Progres).
- BELAJAR dipisah jadi 3 tingkat: beranda (progres + 5 kelompok) -> daftar bagian -> isi. Kelompok: KONSEP, CARA & CONTOH, RINGKASAN, VIDEO, LAINNYA (`GROUPS` di `materiData.js`). Tombol KEMBALI naik satu tingkat.
- Bagian baru: Kamus istilah, Kisah sehari-hari, Salah kaprah, Kartu rumus (indeks 10-13; indeks lama 0-9 TIDAK diubah supaya data tersimpan tetap cocok). Video dikelompokkan (DASAR, MEMBEDAKAN, GRAFIK, SOAL) + tips menonton. Menambah video = tambah objek di `VIDEOS` dengan `grp`.
- Trophy "Scholar of the Hour" kini butuh 14 bagian (bukan 10).
- Misi CEK AWAL (pretest) dihapus dari `data.js` dan layar Latihan (jalur belajar kini 4 tahap: Mudah, Menengah, Sulit, Transfer). Data `progress.cek` lama di perangkat tidak dipakai lagi.
- GAME, LAB, PROGRES, LATIHAN memakai `MenuRow`/`TabBtn`/`Slab` agar seragam. Logika game/skor tidak diubah.
- Diperiksa: semua file lolos esbuild dan bundle terhubung; BELUM diuji di HP. Cek: lebar tab Progres di layar sempit, tinggi kartu status vs menu lobby, teks panjang di `MenuRow`.

## Versi 18: kartu SHARE PROFILE ala Steam + showcase trophy
- `src/components/ShareCard.js` (baru, ukuran tetap 360x680, dipotret 3x = 1080x2040 PNG): banner + avatar miring + badge LV, gelar rank, XP, 4 statistik, SHOWCASE 3 trophy, koleksi 20 trophy (terkunci = abu-abu), hitungan per tier, sebaran rank misi (S/A/B/C), kaki pita merah + kredit ATLUS/SEGA.
- `pickShowcase(have, chosen)`: pilihan pengguna dulu (maks 3), sisanya otomatis dari tier tertinggi lalu yang terbaru dibuka.
- Modal SHARE PROFILE: pilih showcase dengan mengetuk trophy (angka 1-3 muncul), pratinjau kartu diskalakan sesuai lebar layar (skala hanya di pembungkus luar, bukan di ViewShot, jadi hasil PNG tetap tajam), lalu SAVE / SHARE. Isi modal bisa di-scroll.
- Pilihan disimpan di `profile.showcase` (per nama, ikut penyimpanan profil yang sudah ada).
- Layar Profil juga menampilkan baris SHOWCASE di atas Experience.
- Belum diuji di HP: cek tinggi kartu (bagian bawah vs kaki), ketajaman PNG, dan izin galeri.

## Versi 14: Bos tiap game, Peringkat, Lab baru, menu lega
- **Bos** (`src/components/BossArena.js`): Misi Relasi, Tebak Jenis, Isi Tabel, Pasangan Rasio masing-masing punya 3 bos (LV 1-3).
  Jawaban benar = bos terkena (HP bos turun). Jawaban salah = bos menerkam bar darah pemain (bar bergetar, kilat merah, tebasan, angka damage).
  `makeBoss(key, stage, total)` mengatur HP/damage: bos LV lebih tinggi butuh lebih banyak jawaban benar dan memberi lebih sedikit nyawa.
  Bos LV berikutnya terbuka setelah bos sebelumnya kalah (`progress.boss[game].cleared`, maks 3). Tiap bos kalah = +8 XP (lihat `xpOf`).
  Shadow Battle tetap memakai 3 lantai Shadow miliknya sendiri.
- ~~Peringkat~~ (`Leaderboard.js`, `board.js`): DIHAPUS di Versi 19.
- **Lab** (`src/screens/Lab.js`): 2 cerita per jenis, grafik titik yang ikut bergeser, Hitung Bertahap (satu langkah per ketukan), Tebak Dulu soal acak, Awas Salah Kaprah.
- **Menu lobby**: ukuran font menu dihitung dari tinggi layar tersisa supaya item tidak berdesakan.
- Belum diuji di perangkat (hanya cek kurung/sintaks manual). Jalankan `npx expo start` dan coba tiap game sampai bos kalah/kalah.

## Versi 19: hapus Peringkat, lobby lebih lega, siap GitHub Pages
- Menu PERINGKAT dihapus: `src/screens/Leaderboard.js`, `src/utils/board.js`, item `MENU` di `config.js`, rute di `App.js`, `registerUser`, dan helper `keys()` di `storage.js`.
  Rank misi S/A/B/C (hasil Latihan, Profil, kartu Share) TIDAK dihapus karena bagian dari penilaian.
- Lobby (`screens/Lobby.js`): 5 menu, font sedikit lebih kecil, jarak antar menu lebih besar, chip petunjuk dijaga tidak menabrak kartu kredit, kartu kredit lebih ringkas. Belum dilihat di HP.
- Web: `app.json` `web.output = single`; workflow mengisi `experiments.baseUrl` di app.json saat build. Perlu Node 22.13+; `plugins` expo-status-bar/font/audio/sharing ditulis manual di app.json.
- `.github/workflows/deploy.yml`: build `expo export --platform web` lalu publish ke GitHub Pages tiap push ke `main`.
  Gambar karakter tidak di-commit, jadi workflow membuat placeholder 1x1 bila file hilang (situs publik tampil tanpa artwork).
