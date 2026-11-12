import { createContext, useContext } from 'react';
import { CHARACTERS } from './config';

// Karakter aktif (Makoto) tersedia di semua layar lewat useChar()
export const CharContext = createContext(CHARACTERS.cowok);
export const useChar = () => useContext(CharContext);
