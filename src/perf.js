import { Platform } from 'react-native';
import { PERF_MODE } from './config';

// auto: ringan di Android dan web (browser HP berat jika animasi penuh); penuh di iOS. true = kurangi jumlah elemen animasi latar (untuk HP Android kelas menengah ke bawah)
export const LITE = PERF_MODE === 'lite' || (PERF_MODE === 'auto' && Platform.OS !== 'ios');
