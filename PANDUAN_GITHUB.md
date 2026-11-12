# Panduan: Unggah ke GitHub dan Tayang Gratis (GitHub Pages)

Hasil akhirnya: situs yang bisa dibuka siapa saja di
`https://fikriyustiawann.github.io/mathlink/`

Waktu yang dibutuhkan sekitar 15 menit. Semua gratis.

---

## A. Persiapan (sekali saja)

1. **Akun GitHub**: kamu sudah punya (`FikriYustiawann`). Masuk di https://github.com/login.
2. **Git** terpasang di MacBook. Cek di Terminal:
   ```bash
   git --version
   ```
   Kalau belum ada, macOS akan menawarkan memasangnya. Atau `brew install git`.
3. **Kenalkan dirimu ke Git** (sekali saja):
   ```bash
   git config --global user.name "Fikri Yustiawan"
   git config --global user.email "emailgithubmu@contoh.com"
   ```
   Pakai email yang sama dengan akun GitHub.

## B. Buat repo kosong di GitHub

1. Buka https://github.com/new
2. **Repository name**: `mathlink`
   (Kalau memakai nama lain, alamat situsnya ikut berubah jadi `.../nama-lain/`. Tidak perlu mengubah kode.)
3. Pilih **Public** (GitHub Pages gratis hanya untuk repo publik di akun gratis).
4. **Jangan** centang "Add a README", `.gitignore`, atau license. Biarkan kosong.
5. Klik **Create repository**.

## C. Unggah proyek dari Terminal

Masuk ke folder proyek (yang berisi `App.js` dan `package.json`):

```bash
cd ~/path/ke/folder/mathlink
```

Opsional tapi disarankan, buat file kunci versi supaya build di GitHub sama dengan di laptopmu:

```bash
npm install
npm run setup
```

Lalu unggah:

```bash
git init
git add .
git commit -m "MathLink: versi pertama"
git branch -M main
git remote add origin https://github.com/FikriYustiawann/mathlink.git
git push -u origin main
```

**Soal login saat `git push`:** GitHub tidak menerima kata sandi akun biasa di Terminal.
- Saat diminta *Username*: isi `FikriYustiawann`.
- Saat diminta *Password*: tempel **Personal Access Token**.
  Buat di https://github.com/settings/tokens → **Generate new token (classic)** → centang **repo** dan **workflow** → salin tokennya.
- Alternatif lebih mudah: pasang **GitHub Desktop** (https://desktop.github.com), login sekali, lalu *Add Local Repository* → *Publish repository*.

Cek: buka https://github.com/FikriYustiawann/mathlink, semua file harus sudah tampil.

## D. Aktifkan GitHub Pages

1. Di halaman repo, klik **Settings**.
2. Menu kiri: **Pages**.
3. Bagian **Build and deployment** → **Source**: pilih **GitHub Actions**.
   (Bukan "Deploy from a branch".)

## E. Tunggu build selesai

1. Klik tab **Actions** di repo.
2. Workflow **Deploy ke GitHub Pages** akan berjalan sendiri (sekitar 3 sampai 6 menit). Kalau belum jalan, klik workflow itu → **Run workflow**.
3. Tanda centang hijau berarti berhasil. Alamat situs muncul di langkah **deploy**, dan juga di **Settings → Pages**.
4. Buka: `https://fikriyustiawann.github.io/mathlink/`

## F. Mengubah sesuatu lalu memperbarui situs

Setelah mengedit kode:

```bash
git add .
git commit -m "jelaskan perubahanmu"
git push
```

Situs diperbarui otomatis dalam beberapa menit. Kalau tampilan lama masih muncul, muat ulang keras (`Cmd + Shift + R`).

---

## Masalah yang sering muncul

| Gejala | Penyebab dan solusi |
| --- | --- |
| Halaman putih / 404 | Nama repo tidak sama dengan alamat. Pastikan alamat memakai nama repo persis, huruf kecil semua. |
| Actions merah, gagal di *Pasang dependensi* | Buka log-nya. Biasanya versi paket. Jalankan `npm install && npm run setup` di laptop, pastikan `npm run build:web` berhasil di sana, lalu commit `package.json` dan `package-lock.json`. |
| Tab **Pages** tidak ada / tidak bisa dipilih | Repo masih **Private**. Ubah ke Public di Settings → General → Danger Zone. |
| `git push` ditolak | Kamu memakai kata sandi akun. Pakai Personal Access Token (lihat bagian C). |
| Karakter tidak tampil di situs | Disengaja: artwork ATLUS / SEGA tidak di-commit. Workflow memakai gambar kosong sebagai pengganti. |
| Musik tidak langsung bunyi | Browser menunggu klik pertama. Musik mulai setelah kamu menekan MASUK. |

## Kalau ingin karakter ikut tampil di situs

Artwork ATLUS / SEGA berhak cipta. Menaruhnya di repo publik berisiko dihapus GitHub atas laporan pemilik hak.
Kalau tetap mau (untuk tugas kampus non-komersial, risiko ditanggung sendiri):

1. Buka `.gitignore`, hapus tiga baris di bawah `# aset karakter berhak cipta`.
2. Pastikan keempat file ada di `assets/characters/`: `makoto.png`, `done_and_dusted.jpg`, `makoto_face.jpg`, `makoto_avatar.jpg`.
3. `git add -f assets/characters && git commit -m "tambah aset karakter" && git push`

Alternatif yang lebih aman: ganti dengan gambar buatan sendiri dengan nama dan rasio yang sama.
