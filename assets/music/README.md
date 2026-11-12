# Musik latar (satu lagu per menu)

| Menu | File | Suasana |
|---|---|---|
| Lobby (HOME) | `bgm.mp3` | lagu pilihan pembuat (Persona 5 "Beneath the Mask", berhak cipta Atlus/Sega; ganti sebelum rilis publik) |
| BELAJAR | `bgm_materi.mp3` | santai, lo-fi, 82 BPM, C mayor |
| LATIHAN | `bgm_latihan.mp3` | fokus, arpeggio stabil, 96 BPM, D minor |
| GAME | `bgm_game.mp3` | semangat, chiptune, 132 BPM, E minor |
| LAB | `bgm_lab.mp3` | ceria, marimba pola 3+3+2, 100 BPM, D lydian |
| PROGRES | `bgm_progres.mp3` | hangat dan naik, 108 BPM, F mayor |
| PROFIL | `bgm_profil.mp3` | tenang, kotak musik, 70 BPM, A minor |

Lima lagu terakhir (materi, latihan, game, lab, progres, profil) adalah komposisi orisinal yang disintesis lewat kode
(`make_music.py` di folder `tools/`), jadi bebas hak cipta dan aman untuk rilis publik. Semuanya loop mulus (ujung dilembutkan 8 ms).

Ganti lagu: timpa file dengan NAMA SAMA, atau ubah `BGM` di `src/audio.js`.
Lagu berganti otomatis saat pindah menu (fade-in ~1 detik). Volume dan tombol musik diatur dari lobby (`MusicButton`) dan berlaku di semua menu.
