# Menguji di HP Android (MacBook memakai hotspot dari HP yang sama)

Masalahnya: MacBook tersambung ke hotspot HP, jadi HP-lah yang menjadi "router". Mode Expo
biasa (satu Wi-Fi / LAN) sering gagal karena HP yang menyalakan hotspot biasanya tidak bisa
membuka server di perangkat yang tersambung ke hotspotnya sendiri. Pakai salah satu opsi ini.

Syarat umum: sudah `npm install` lalu `npm run setup`, dan **Expo Go** terpasang dari Play Store.
Expo Go di Play Store hanya mendukung satu versi SDK pada satu waktu (saat ini SDK 58, sama
dengan proyek ini). Jika Expo Go suatu hari memakai SDK lebih baru, jalankan
`npx expo install expo@latest` lalu `npm run fix`.

## Opsi A — Kabel USB (disarankan: cepat, tidak memakai kuota)
1. HP: Pengaturan > Tentang ponsel > ketuk **Nomor versi** 7x > kembali > **Opsi pengembang** >
   aktifkan **Debugging USB**.
2. Colok HP ke MacBook, izinkan "Allow USB debugging" di layar HP.
3. Mac: `brew install --cask android-platform-tools`, lalu `adb devices`.
   HP harus muncul dengan status `device` (bukan `unauthorized`).
4. Jalankan: `npm run usb`
   Expo membuka Expo Go di HP lewat kabel (memakai `adb reverse`). Edit kode di VS Code,
   simpan, layar HP ikut berubah.
Jika Expo Go tidak terbuka sendiri: `adb reverse tcp:8081 tcp:8081`, jalankan `npm run usb`,
lalu buka `exp://localhost:8081` di Expo Go.

## Opsi B — Tunnel (tanpa kabel, butuh internet)
```bash
npm run tunnel
```
Scan QR di terminal dengan Expo Go (menu "Scan QR code"). Pertama kali Expo akan menawarkan
memasang paket tunnel, jawab `Y`. Lebih lambat dan memakai kuota hotspot, tetapi tidak butuh kabel.

## Opsi C — APK mandiri (untuk demo / dikirim ke teman)
```bash
npm install -g eas-cli
eas login                                  # akun gratis di expo.dev
eas build -p android --profile preview     # build di server Expo
```
Setelah selesai, buka link unduhan di HP, instal APK (izinkan "sumber tidak dikenal").
Aplikasi jalan sendiri tanpa MacBook, tetapi setiap perubahan kode butuh build ulang.
Build gratis bisa antre. File APK berukuran puluhan MB, jadi sebaiknya diunduh lewat Wi-Fi.

## Daftar cek di HP (belum pernah diuji di perangkat)
- [ ] Login: keyboard tidak menutupi kolom nama dan tombol
- [ ] Lobby tegak: menu miring, panel putih, dan karakter tidak saling menimpa
- [ ] Lobby terasa mulus; jika patah-patah, ubah `PERF_MODE` ke `'lite'` di `src/config.js`
- [ ] Materi, Bedakan, Langkah, Latihan: teks tidak terpotong, bisa di-scroll
- [ ] Tutup aplikasi lalu buka lagi: nama terakhir dan skor masih ada
- [ ] Tombol Back: dari layar isi kembali ke lobby
- [ ] Musik: tombol BGM bunyi. Jika video melarang embed (error 152), tombol musik otomatis hilang.
  Ganti `MUSIC_URL` dengan video lain, atau pakai file mp3 lokal (lihat `assets/music/README.md`)


## Tambahan v18 (font, emoji, lagu)
1. Setelah mengambil proyek ini, jalankan `npm run setup` lagi (sekarang memasang `expo-font`), lalu `npx expo start -c` (opsi `-c` membersihkan cache).
2. Cek di HP: teks di LATIHAN terbaca rapi (font Inter), gambar ilustrasi soal berupa ikon 2D (bukan emoji keyboard), dan setiap menu punya lagu berbeda.
3. Bila teks tampil dengan font lain, kemungkinan `expo-font` belum terpasang atau cache lama: ulangi langkah 1.
