// ============================================================
//  KONFIGURASI DRAFT  â€” ubah di sini, tanpa menyentuh komponen
// ============================================================

// --- Karakter -------------------------------------------------
// Tambahkan karakter baru di object ini nanti. Setiap karakter bisa punya
// avatar dan banner profile sendiri; picker profil akan membaca data ini otomatis.
// --- Karakter (default) -----------
// lobby      : PNG transparan untuk lobby (aspect = lebar/tinggi, auraFace = posisi wajah untuk cahaya)
// result     : banner layar hasil latihan
// profile    : banner kepala (close-up) di layar Profil
// avatar     : foto bulat kecil (profil, petunjuk, kartu ringkasan)
// band/edge  : warna pita menu lobby
// Semua artwork milik ATLUS / SEGA (lihat credit).
export const CHARACTERS = {
  cowok: {
    key: 'cowok', gender: 'MALE', symbol: '\u2642', name: 'MAKOTO YUKI', role: 'Pemandu Matematika',
    lobby: require('../assets/characters/makoto.png'), aspect: 2421 / 2000, auraFace: { x: 0.3, y: 0.78 },
    result: { src: require('../assets/characters/done_and_dusted.jpg'), aspect: 2332 / 1568, stamp: 'left' },
    profile: { src: require('../assets/characters/makoto_face.jpg'), aspect: 736 / 368 },
    avatar: require('../assets/characters/makoto_avatar.jpg'),
    band: '#FF1A1A', edge: '#FF8AD8', tint: '#00E5FF',
    credit: { label: 'CHARACTER ART', name: 'MAKOTO YUKI', owner: '\u00A9 ATLUS / SEGA', game: 'Persona 3 Reload' },
  },
};

// Pilihan avatar/banner profil. Saat karakter baru ditambahkan, cukup tambahkan
// entry ke CHARACTERS; tidak perlu mengubah layar profil.
export const PROFILE_CHARACTERS = Object.values(CHARACTERS);

// --- Judul ----------------------------------------------------
export const TICKER_TEXT = 'DARK HOUR';

// --- Menu lobby -----------------------------------------------
// screen: nama layar tujuan (lihat App.js). locked: true = "SEGERA".
export const MENU = [
  { key: 'materi',  label: 'BELAJAR',  sub: 'Tabel, panah & contoh bertahap', screen: 'MATERI' },
  { key: 'game',    label: 'GAME',    sub: 'Lawan bos di tiap game',   screen: 'GAME' },
  { key: 'latihan', label: 'LATIHAN', sub: 'Soal + petunjuk bertahap',       screen: 'LATIHAN' },
  { key: 'lab',     label: 'LAB',     sub: 'Geser angka, lihat hasilnya',    screen: 'LAB' },
  { key: 'progres', label: 'PROGRES', sub: 'Skor, level & pencapaian',       screen: 'PROGRES' },
];

// --- Musik latar ----------------------------------------------
// Tempel link YouTube di bawah (watch / youtu.be / shorts, semua bisa).
// Kosongkan ('') untuk menyembunyikan tombol musik.
// Musik diputar lewat pemutar embed resmi YouTube, bukan diunduh.
// CATATAN: banyak video musik (mis. soundtrack game) melarang diputar di luar YouTube
// (error "Video ini tidak tersedia, kode 152"). Cek dulu: buka https://www.youtube.com/embed/ID_VIDEO
// di browser; kalau muncul "Video unavailable", pilih video lain atau pakai MUSIC_FILE di bawah.
// Dikosongkan: video P3R melarang embed (error 152) sehingga musik memang tidak bisa diputar lewat YouTube.
export const MUSIC_URL = '';
export const MUSIC_LABEL = 'BGM LOBBY';

// Alternatif tanpa YouTube (lebih andal di HP): taruh file mp3 di assets/music/ lalu aktifkan baris ini
// (MUSIC_FILE diutamakan; MUSIC_URL diabaikan). Pakai musik bebas royalti.
// Langkah: (1) taruh bgm.mp3 di assets/music/  (2) npm run setup  (3) ganti baris null di bawah dengan:
//   export const MUSIC_FILE = require('../assets/music/bgm.mp3');
// Selama null, tombol musik tidak tampil.
export const MUSIC_FILE = require('../assets/music/bgm.mp3');   // Persona 5 - Beneath the Mask (rain), dipotong 8 menit


// --- Performa -----------------------------------------------------
// 'auto' = versi ringan di Android dan web, penuh di iOS. Ubah ke 'lite' / 'full' untuk memaksa.
export const PERF_MODE = 'auto';

// Animasi latar di WEB (gelembung angka, grafik, berkas cahaya, cincin aura). Di browser semua ini
// dijalankan prosesor biasa, jadi berat. false = latar diam (jauh lebih lancar). true = animasi penuh (laptop kuat).
// Tidak berpengaruh di HP (Android/iOS).
export const WEB_BG_ANIM = false;
