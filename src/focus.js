// Mode FOKUS: saat siswa mengerjakan soal / membaca langkah, latar bergerak dan efek ramai dikurangi.
// Gaya Persona (warna, pita miring, Makoto) tetap ada; yang dimatikan hanya unsur yang berpotensi
// mengalihkan perhatian (rumus melayang, serpihan, combo, ledakan). Bisa dimatikan siswa lewat tombol.
import { useEffect, useState } from 'react';

let on = true;
const subs = new Set();

export const setFocus = (v) => { on = v; subs.forEach((f) => f(v)); };

export function useFocus() {
  const [v, set] = useState(on);
  useEffect(() => { subs.add(set); set(on); return () => { subs.delete(set); }; }, []);
  return [v, setFocus];
}
