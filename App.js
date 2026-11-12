import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, View, Platform, BackHandler, AppState } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { FONT_FILES, setFontsReady } from './src/components/Txt';
import { COLOR } from './src/theme';
import { CHARACTERS } from './src/config';
import { CharContext } from './src/CharacterContext';
import { MUSIC_URL, MUSIC_LABEL, MUSIC_FILE } from './src/config';
import { parseYouTubeId } from './src/utils/youtube';
import MusicEngine from './src/components/MusicEngine';
import LocalMusic from './src/components/LocalMusic';
import MusicButton from './src/components/MusicButton';
import Curtain from './src/components/Curtain';
import Lab from './src/screens/Lab';
import { sfx, BGM, trackFor } from './src/audio';
import Login from './src/screens/Login';
import LoginIntro from './src/components/LoginIntro';
import Lobby from './src/screens/Lobby';
import { load, save, initStorage } from './src/utils/storage';
import Materi from './src/screens/Materi';
import Latihan from './src/screens/Latihan';
import Game from './src/screens/Game';
import Progres from './src/screens/Progres';
import Profil from './src/screens/Profil';
import { TrophyToast } from './src/components/Trophy';
import { awardTrophies, xpOf, trophyById } from './src/trophies';

// expo-font dimuat "opsional" (seperti expo-audio): bila belum terpasang, aplikasi tetap jalan dengan font sistem.
// Pasang lewat: npm run setup
let useFonts = null;
try { useFonts = require('expo-font').useFonts; } catch (e) { useFonts = null; }

// Transisi antar layar: tirai P3R menutup, layar diganti saat tertutup, lalu tirai terbuka setelah
// layar baru selesai dipasang (InteractionManager) -> tidak ada lag yang terlihat. Hanya transform (native driver).
// InteractionManager sudah dihapus dari React Native; pakai requestIdleCallback (timeout agar tidak menunggu terlalu lama)
const idle = (fn) => (typeof requestIdleCallback === 'function' ? requestIdleCallback(fn, { timeout: 400 }) : setTimeout(fn, 80));

function useScreenTransition(initial) {
  const [screen, setScreen] = useState(initial);
  const p = useRef(new Animated.Value(0)).current;       // tirai: 0 luar kiri, 1 menutup, 2 luar kanan
  const dir = useRef(new Animated.Value(1)).current;
  const enter = useRef(new Animated.Value(1)).current;   // isi layar baru: 0 tersembunyi -> 1 tampil
  const busy = useRef(false);
  const cur = useRef(initial);
  const ease = Easing.bezier(0.45, 0, 0.2, 1);           // percepat di awal, melambat halus di akhir
  const go = (next, back) => {
    if (busy.current || next === cur.current) return;
    busy.current = true;
    dir.setValue(back ? -1 : 1);
    p.setValue(0);
    sfx('swipe', 0.5);
    Animated.timing(p, { toValue: 1, duration: 280, easing: ease, useNativeDriver: true }).start(() => {
      cur.current = next;
      enter.setValue(0);                                  // layar baru disembunyikan selagi tirai masih menutup
      setScreen(next);
      idle(() => requestAnimationFrame(() => {
        // tirai membuka sambil isi layar naik dan memudar masuk (satu gerakan, bukan dua kejadian terpisah)
        Animated.parallel([
          Animated.timing(p, { toValue: 2, duration: 420, easing: ease, useNativeDriver: true }),
          Animated.timing(enter, { toValue: 1, duration: 460, delay: 90, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        ]).start(() => { p.setValue(0); busy.current = false; });
      }));
    });
  };
  const jump = (next) => { cur.current = next; busy.current = false; enter.setValue(1); setScreen(next); };
  return { screen, go, jump, enter, curtain: <Curtain p={p} dir={dir} /> };
}

export default function App() {
  // font Inter (lihat src/components/Txt.js): tunggu selesai dimuat supaya teks tidak berganti font di tengah jalan
  const [fontsLoaded, fontError] = useFonts ? useFonts(FONT_FILES) : [false, true];   // eslint-disable-line react-hooks/rules-of-hooks
  setFontsReady(!!fontsLoaded && !fontError);
  const [ready, setReady] = useState(Platform.OS === 'web');   // Android/iOS: tunggu data tersimpan dimuat
  const { screen, go, jump, enter, curtain } = useScreenTransition('LOGIN');
  const [user, setUser] = useState(null);
  const [music, setMusic] = useState(false);
  const [volume, setVolume] = useState(60);          // 0-100
  const [progress, setProgress] = useState({});   // skor + trophy selama aplikasi terbuka
  const [profile, setProfile] = useState({});       // avatar/banner profil per pengguna
  const [toasts, setToasts] = useState([]);        // antrean popup trophy
  const [intro, setIntro] = useState(null);         // animasi masuk setelah login
  const [musicFailed, setMusicFailed] = useState(false);   // YouTube menolak diputar -> sembunyikan kontrol musik
  const musicId = parseYouTubeId(MUSIC_URL);
  const home = () => go('HOME', true);

  // Muat data tersimpan (skor, nama terakhir) dari penyimpanan HP sebelum UI tampil
  useEffect(() => {
    if (ready) return;
    initStorage().then(() => setReady(true));
  }, [ready]);

  // Tombol Back Android: dari layar isi -> kembali ke lobby (bukan langsung keluar aplikasi)
  const screenRef = useRef(screen);
  screenRef.current = screen;
  useEffect(() => {
    if (Platform.OS !== 'android') return undefined;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      const cur = screenRef.current;
      if (cur === 'LOGIN' || cur === 'HOME') return false;   // biarkan sistem menutup aplikasi
      go('HOME', true);
      return true;
    });
    return () => sub.remove();
  }, []);

  // Musik dijeda saat aplikasi ke latar belakang, lanjut lagi saat dibuka
  const musicRef = useRef(false);
  musicRef.current = music;
  const resumeMusic = useRef(false);
  useEffect(() => {
    if (Platform.OS === 'web') return undefined;
    const sub = AppState.addEventListener('change', (st) => {
      if (st === 'active') {
        if (resumeMusic.current) { resumeMusic.current = false; setMusic(true); }
      } else if (musicRef.current) {
        resumeMusic.current = true; setMusic(false);
      }
    });
    return () => sub.remove();
  }, []);
  const key = (n) => 'mp3r:progress:' + n.toLowerCase();
  const login = (name) => {
    setProgress(load(key(name), {}));
    setProfile(load('mp3r:profile:' + name.toLowerCase(), {}));
    setUser(name);
    save('mp3r:lastUser', name);
    setMusic(true);          // musik mulai setelah klik login (browser butuh gestur pengguna)
    setIntro({ name });   // layar berganti ke HOME saat animasi menutup layar
  };
  const logout = () => { setUser(null); setProgress({}); setProfile({}); setToasts([]); go('LOGIN', true); };
  const onMenuOpen = () => {};   // SFX klik kini ditangani langsung di LobbyMenu/Btn (src/audio.js)

  // Terapkan perubahan progress, lalu cek trophy yang baru terbuka.
  // popup=true -> tampil sebagai popup (layar Latihan menampilkan sendiri di halaman hasil).
  const commit = (patch, popup) => {
    const { progress: next, fresh } = awardTrophies(patch(progress));
    setProgress(next);
    if (popup && fresh.length) setToasts((t) => [...t, ...fresh]);
    return { fresh, xpBefore: xpOf(progress), xpAfter: xpOf(next) };
  };
  // menu BELAJAR: tandai bagian yang sudah dibuka ({ step: i }) atau video yang dibuka ({ video: id })
  const onMateri = (r) => commit((p) => {
    const m = p.materi || { seen: {}, videos: {} };
    if (r.step != null && m.seen && m.seen[r.step]) return p;
    if (r.video && m.videos && m.videos[r.video]) return p;
    return { ...p, materi: {
      seen: r.step != null ? { ...(m.seen || {}), [r.step]: true } : (m.seen || {}),
      videos: r.video ? { ...(m.videos || {}), [r.video]: true } : (m.videos || {}),
    } };
  }, true);
  const onBedakan = (r) => commit((p) => ({ ...p, bedakan: !p.bedakan || r.right >= p.bedakan.right ? r : p.bedakan }), true);
  const onGame = (r) => commit((p) => ({ ...p, game: !p.game || r.score >= p.game.best ? { ...r, best: r.score, plays: (p.game?.plays || 0) + 1 } : { ...p.game, plays: (p.game?.plays || 0) + 1 } }), true);
  // mini-game baru (battle, jenis, tabel, pasang): simpan skor terbaik, jumlah main, dan data tambahan
  const onMini = (k, r) => commit((p) => {
    const old = (p.games && p.games[k]) || {};
    return { ...p, games: { ...(p.games || {}), [k]: {
      ...old, ...r,
      best: Math.max(old.best || 0, r.score),
      floors: Math.max(old.floors || 0, r.floors || 0),
      plays: (old.plays || 0) + 1,
    } } };
  }, true);
  // bos mini-game: simpan bos tertinggi yang dikalahkan (cleared = jumlah bos LV yang sudah kalah, maks 3)
  const onBoss = (k, stage, won) => commit((p) => {
    const old = (p.boss && p.boss[k]) || {};
    return { ...p, boss: { ...(p.boss || {}), [k]: { cleared: won ? Math.max(old.cleared || 0, stage + 1) : (old.cleared || 0), tries: (old.tries || 0) + 1 } } };
  }, true);
  const onLatihan = (id, r) => commit((p) => {
    const old = p[id];
    const prevBest = old ? (old.best ?? old.score) : 0;
    return { ...p, [id]: {
      ...r,
      best: Math.max(prevBest, r.score),
      attempts: (old ? (old.attempts || 1) : 0) + 1,
      clean: !!(old && old.clean) || (r.hints === 0 && r.score >= r.max / 2),
      mistakes: (old?.mistakes || 0) + (r.mistakes || 0),
      improved: !!(old && old.improved) || (!!old && r.score > prevBest),
    } };
  }, false);

  // simpan skor per nama setiap berubah
  useEffect(() => { if (user) save(key(user), progress); }, [user, progress]);
  useEffect(() => { if (user) save('mp3r:profile:' + user.toLowerCase(), profile); }, [user, profile]);

  if (!ready || !(fontsLoaded || fontError)) {
    return (
      <SafeAreaProvider>
        <View style={styles.safe}><StatusBar style="light" /></View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
    <CharContext.Provider value={CHARACTERS.cowok}>
    <SafeAreaView style={styles.safe}>
      <StatusBar style="light" />
      <Animated.View style={{ flex: 1, opacity: enter, transform: [{ translateY: enter.interpolate({ inputRange: [0, 1], outputRange: [18, 0] }) }, { scale: enter.interpolate({ inputRange: [0, 1], outputRange: [0.985, 1] }) }] }}>
        {screen === 'LOGIN' && <Login lastUser={load('mp3r:lastUser', '')} onLogin={login} />}
        {screen === 'HOME' && <Lobby onNavigate={(n) => go(n)} onMenuOpen={onMenuOpen} user={user} onLogout={logout} progress={progress} profile={profile} />}
        {screen === 'MATERI' && <Materi onBack={home} onPractice={() => go('LATIHAN')} onLab={() => go('LAB')} progress={progress} onMateri={onMateri} />}
        {screen === 'GAME' && <Game onBack={home} onResult={onGame} onMini={onMini} onBoss={onBoss} progress={progress} user={user} />}
        {screen === 'LATIHAN' && <Latihan onBack={home} progress={progress} user={user} onResult={onLatihan} onProfile={() => go('PROFIL')} />}
        {screen === 'LAB' && <Lab onBack={home} onDone={(r) => commit((p) => ({ ...p, lab: { ...(p.lab || {}), ...r } }), true)} />}
        {screen === 'PROGRES' && <Progres onBack={home} progress={progress} user={user} onOpen={(n) => go(n)} />}
        {screen === 'PROFIL' && <Profil onBack={home} progress={progress} user={user} profile={profile} onProfileChange={(patch) => setProfile((p) => ({ ...p, ...patch }))} />}
      </Animated.View>
      {curtain}

      {intro && (
        <LoginIntro
          key={intro.name}
          name={intro.name}
          tint={CHARACTERS.cowok.tint}
          onCovered={() => jump('HOME')}
          onDone={() => setIntro(null)}
        />
      )}

      {/* popup trophy: tampil di layar mana pun, satu per satu */}
      {toasts.length > 0 && trophyById(toasts[0]) && (
        <TrophyToast
          key={toasts[0] + toasts.length}
          t={trophyById(toasts[0])}
          onDone={() => setToasts((t) => t.slice(1))}
          onOpen={() => { setToasts((t) => t.slice(1)); go('PROFIL'); }}
        />
      )}

      {/* BGM berganti per layar (key = lagu baru, pemutar lama berhenti). Lobby: kontrol musik. */}
      {MUSIC_FILE && !musicFailed && (
        <>
          <LocalMusic key={trackFor(screen)} source={BGM[trackFor(screen)]} playing={music && screen !== 'LOGIN'} volume={volume} />
          {screen === 'HOME' && <MusicButton playing={music} onToggle={() => setMusic((m) => !m)} volume={volume} onVolume={(d) => setVolume((v) => Math.max(0, Math.min(100, v + d)))} />}
        </>
      )}
    </SafeAreaView>
    </CharContext.Provider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLOR.bg },
});
