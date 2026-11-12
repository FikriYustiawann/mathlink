// Penyimpanan progres.
// - Web: localStorage (permanen di browser yang sama).
// - Android/iOS: AsyncStorage (permanen di HP). Agar API tetap sinkron (load/save dipakai
//   langsung di App.js), isinya dimuat sekali ke memori saat aplikasi dibuka (initStorage),
//   lalu setiap save() ditulis ke memori + AsyncStorage.
import { Platform } from 'react-native';

let AsyncStorage = null;
if (Platform.OS !== 'web') {
  try { AsyncStorage = require('@react-native-async-storage/async-storage').default; } catch (e) { AsyncStorage = null; }
}

const PREFIX = 'mp3r:';
const mem = {};

const ls = () => {
  try { return typeof localStorage !== 'undefined' ? localStorage : null; } catch (e) { return null; }
};

// Panggil sekali sebelum UI tampil (App.js menunggu ini selesai).
export const initStorage = async () => {
  if (!AsyncStorage) return;
  try {
    const keys = (await AsyncStorage.getAllKeys()).filter((k) => k.startsWith(PREFIX));
    if (!keys.length) return;
    const pairs = await AsyncStorage.multiGet(keys);
    pairs.forEach(([k, v]) => { if (v != null) mem[k] = v; });
  } catch (e) { /* abaikan: aplikasi tetap jalan tanpa data lama */ }
};

export const load = (key, fallback = null) => {
  try {
    const l = ls();
    const raw = l ? l.getItem(key) : mem[key];
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) { return fallback; }
};

export const save = (key, value) => {
  try {
    const raw = JSON.stringify(value);
    const l = ls();
    if (l) { l.setItem(key, raw); return; }
    mem[key] = raw;
    if (AsyncStorage) AsyncStorage.setItem(key, raw).catch(() => {});
  } catch (e) { /* abaikan */ }
};
