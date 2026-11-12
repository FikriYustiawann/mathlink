import numpy as np, subprocess, os
from scipy.signal import lfilter, butter, fftconvolve
SR = 44100
OUT = './assets/music/'
rng = np.random.default_rng(7)

def hz(m): return 440.0 * 2 ** ((m - 69) / 12)
def T(d): return np.arange(int(d * SR)) / SR
def lp(x, fc, o=2): b, a = butter(o, fc / (SR / 2)); return lfilter(b, a, x)
def hp(x, fc, o=2): b, a = butter(o, fc / (SR / 2), 'high'); return lfilter(b, a, x)
def fade(x, a=0.004, r=0.04):
    n = len(x); e = np.ones(n); na = max(1, int(a * SR)); nr = max(1, int(r * SR))
    e[:na] = np.linspace(0, 1, na); e[-nr:] = np.minimum(e[-nr:], np.linspace(1, 0, nr)); return x * e

# ---------- suara ----------
def epiano(m, dur, v=1.0):
    d = dur + 0.5; t = T(d); f = hz(m)
    idx = 1.4 * v * np.exp(-5 * t) + 0.25
    y = np.sin(2 * np.pi * f * t + idx * np.sin(2 * np.pi * f * t)) * np.exp(-1.9 * t)
    y += 0.12 * np.sin(2 * np.pi * 4 * f * t) * np.exp(-12 * t)
    return fade(y * 0.5 * v, 0.004, 0.2)
def pluck(m, dur=0.4, v=1.0):
    d = dur + 0.15; t = T(d); f = hz(m); y = 0
    for k in range(1, 7): y = y + (1 / k) * np.sin(2 * np.pi * k * f * t) * np.exp(-t * (3 + 2.2 * k))
    return fade(y * 0.5 * v, 0.002, 0.05)
def bass(m, dur, v=1.0):
    d = dur + 0.1; t = T(d); f = hz(m)
    y = (np.sin(2 * np.pi * f * t) + 0.35 * np.sin(4 * np.pi * f * t)) * np.exp(-1.3 * t)
    return fade(y * 0.75 * v, 0.006, 0.08)
def pad(ms, dur, v=1.0):
    d = dur + 0.9; t = T(d); y = 0
    for m in ms:
        for c in (-7, 0, 7):
            f = hz(m) * 2 ** (c / 1200)
            for k in range(1, 7): y = y + (1 / k) * np.sin(2 * np.pi * k * f * t + k)
    y = lp(y, 1300) / (len(ms) * 3)
    e = np.minimum(1, t / 0.7) * np.minimum(1, np.maximum(0, (d - t) / 0.8))
    return y * e * 0.9 * v
def mallet(m, v=1.0):
    t = T(0.7); f = hz(m)
    y = (np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * 3.93 * f * t) * np.exp(-18 * t)) * np.exp(-6 * t)
    return fade(y * 0.7 * v, 0.002, 0.05)
def bell(m, v=1.0, long=1.6):
    t = T(long); f = hz(m); y = 0
    for r, a, dc in [(1, 1, 2.2), (2.76, 0.35, 3.5), (5.4, 0.15, 6)]: y = y + a * np.sin(2 * np.pi * r * f * t) * np.exp(-dc * t)
    return fade(y * 0.45 * v, 0.002, 0.2)
def pulse(m, dur, duty=0.5, v=1.0, vib=0.0):
    d = dur + 0.03; t = T(d); f = hz(m) * (1 + vib * np.sin(2 * np.pi * 5.5 * t))
    ph = np.cumsum(f) / SR; y = np.where((ph % 1) < duty, 1.0, -1.0) * 0.3
    y = lp(y, 7000, 1); return fade(y * v, 0.003, 0.03)
def kick(v=1.0):
    t = T(0.32); f = 45 + 120 * np.exp(-t * 28); ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * np.exp(-t * 11) * 0.95 * v
def snare(v=1.0):
    t = T(0.22); n = rng.standard_normal(len(t)); n = hp(n, 1200)
    return (n * np.exp(-t * 22) * 0.5 + np.sin(2 * np.pi * 190 * t) * np.exp(-t * 28) * 0.4) * v
def hat(v=1.0, open_=False):
    t = T(0.16 if open_ else 0.05); n = hp(rng.standard_normal(len(t)), 7000)
    return n * np.exp(-t * (14 if open_ else 70)) * 0.25 * v
def block(v=1.0):
    t = T(0.08); return np.sin(2 * np.pi * 1700 * t) * np.exp(-t * 55) * 0.35 * v

def pan_gains(p): a = (p + 1) * np.pi / 4; return np.cos(a), np.sin(a)
class Mix:
    def __init__(s, secs): s.n = int(secs * SR); s.dry = np.zeros((2, s.n)); s.wet = np.zeros((2, s.n))
    def add(s, sig, at, g=1.0, pan=0.0, rev=0.0):
        i = int(at * SR)
        if i >= s.n: return
        sig = sig[: s.n - i]; l, r = pan_gains(pan)
        s.dry[0, i:i + len(sig)] += sig * g * l; s.dry[1, i:i + len(sig)] += sig * g * r
        if rev: s.wet[0, i:i + len(sig)] += sig * rev * l; s.wet[1, i:i + len(sig)] += sig * rev * r

def reverb_ir(seed, tau=0.55, length=1.6):
    r = np.random.default_rng(seed); t = T(length); ir = r.standard_normal(len(t)) * np.exp(-t / tau); return lp(ir, 4500, 1) * 0.04

def finish(mix, loop_secs, name, gain=0.9):
    out = mix.dry.copy()
    for c in range(2):
        w = fftconvolve(mix.wet[c], reverb_ir(11 + c))[: mix.n + int(1.6 * SR)]
        full = np.zeros(mix.n + int(1.6 * SR)); full[: mix.n] += out[c]; full[: len(w)] += w[: len(full)]
        out_c = full
        L = int(loop_secs * SR); body = out_c[:L].copy(); tail = out_c[L:]; body[: len(tail)] += tail[: L]
        if c == 0: res = np.zeros((2, L))
        res[c] = body
    for c in range(2): res[c] = hp(res[c], 30, 1)
    res = res / np.percentile(np.abs(res), 99.7) * 0.8   # normalisasi dulu agar tidak menumpuk di batas (sebelumnya terlalu keras/pecah)
    res = np.tanh(res); res *= 0.85 / np.max(np.abs(res))
    ne = int(0.008 * SR); ramp = np.linspace(0, 1, ne)   # fade 8 ms di ujung loop: tidak ada bunyi "tek" saat lagu mengulang
    res[:, :ne] *= ramp; res[:, -ne:] *= ramp[::-1]
    pcm = (res.T * 32767).astype(np.int16)
    raw = OUT + name + '.raw'; pcm.tofile(raw)
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-f', 's16le', '-ar', str(SR), '-ac', '2', '-i', raw,
                    '-c:a', 'libmp3lame', '-b:a', '96k', OUT + name + '.mp3'], check=True)
    os.remove(raw)
    rms = float(np.sqrt(np.mean(res ** 2))); seam = float(np.max(np.abs(res[:, :8] - res[:, -8:])))
    print(f'{name}: {loop_secs:.1f}s  rms={rms:.3f}  seam={seam:.3f}  {os.path.getsize(OUT+name+".mp3")//1024}KB')

def timing(bpm): return 60.0 / bpm
def make(bpm, bars, build):
    sp = timing(bpm); loop = bars * 4 * sp; m = Mix(loop + 3.0)
    at = lambda bar, beat: (bar * 4 + beat) * sp
    build(m, at, sp); return m, loop

# =================== 1. MATERI: ruang belajar (C mayor, santai) ===================
def materi(m, at, sp):
    ch = [(48, [64, 67, 71, 74]), (45, [64, 67, 69, 72]), (50, [65, 69, 72, 74]), (43, [65, 67, 71, 74])]
    mel = {0: [(0.5, 79, 1), (1.5, 76, .5), (2, 74, 1.5)], 1: [(0.5, 72, 1), (1.5, 76, 1), (3, 74, .5)],
           2: [(0, 77, 1), (1, 74, .5), (1.5, 72, 1.5)], 3: [(0.5, 74, .5), (1, 71, 1), (2.5, 67, 1.5)]}
    for bar in range(16):
        root, v = ch[bar % 4]; cyc = bar // 4
        for k, pt in enumerate(v): pass
        m.add(pad([x - 12 for x in v[:3]], 4 * sp), at(bar, 0), 0.5, 0, 0.6)
        for beat, ln in ((0, 1.5), (2.5, 1.5)):
            for k, n in enumerate(v): m.add(epiano(n, ln * sp), at(bar, beat) + k * 0.012, 0.5, -0.25, 0.25)
        m.add(bass(root, 1.4 * sp), at(bar, 0), 0.8); m.add(bass(root, sp), at(bar, 2.5), 0.7); m.add(bass(root + 7, 0.5 * sp), at(bar, 3.5), 0.55)
        if cyc >= 0:
            m.add(kick(0.7), at(bar, 0), 0.8); m.add(kick(0.55), at(bar, 2.5), 0.7)
            m.add(snare(0.35), at(bar, 1), 0.6); m.add(snare(0.35), at(bar, 3), 0.6)
            for e in range(8):
                sw = 0.0 if e % 2 == 0 else 0.14; m.add(hat(0.8 if e % 2 else 0.5), at(bar, e * 0.5 + sw), 0.6, 0.3)
        if cyc >= 1:
            for beat, n, ln in mel[bar % 4]: m.add(bell(n + (12 if cyc == 3 and beat > 2 else 0)), at(bar, beat), 0.55, 0.3, 0.35)
# =================== 2. LATIHAN: fokus (D minor, mantap) ===================
def latihan(m, at, sp):
    ch = [(38, [62, 65, 69, 74]), (34, [58, 62, 65, 70]), (31, [55, 58, 62, 67]), (33, [57, 61, 64, 67])]
    for bar in range(16):
        root, v = ch[bar % 4]; cyc = bar // 4
        m.add(pad([x - 12 for x in v], 4 * sp), at(bar, 0), 0.45, 0, 0.6)
        pat = [0, 1, 2, 3, 2, 1, 2, 1]
        for e in range(16):
            n = v[pat[e % 8]] + (12 if e % 8 == 3 else 0)
            m.add(pluck(n, 0.25, 0.9 if e % 4 == 0 else 0.6), at(bar, e * 0.25), 0.5, -0.3 + 0.6 * (e % 2), 0.2)
        m.add(bass(root, 1.9 * sp), at(bar, 0), 0.85); m.add(bass(root, 1.9 * sp), at(bar, 2), 0.7)
        m.add(kick(0.7), at(bar, 0), 0.7); m.add(kick(0.6), at(bar, 2), 0.6)
        for e in range(8): m.add(hat(0.5 if e % 2 == 0 else 0.9), at(bar, e * 0.5), 0.5, 0.35)
        if cyc >= 1: m.add(snare(0.4), at(bar, 1), 0.55); m.add(snare(0.4), at(bar, 3), 0.55)
        if cyc >= 1 and bar % 2 == 0:
            mel = [(0, 81, 1.5), (1.5, 77, .5), (2, 79, 1), (3, 76, 1)] if bar % 4 == 0 else [(0, 74, 1), (1, 77, 1), (2, 81, 2)]
            for beat, n, ln in mel: m.add(pluck(n + (12 if cyc == 3 else 0), ln * sp, 1.0), at(bar, beat), 0.55, 0.25, 0.3)
# =================== 3. GAME: semangat (E minor, chiptune) ===================
def game(m, at, sp):
    ch = [(40, [64, 67, 71]), (36, [60, 64, 67]), (43, [67, 71, 74]), (38, [62, 66, 69])]
    lead = {0: [(0, 83, .5), (.5, 86, .5), (1, 83, 1), (2, 79, .5), (2.5, 83, .5), (3, 81, 1)],
            1: [(0, 84, .5), (.5, 88, .5), (1, 84, 1), (2, 79, .5), (2.5, 84, .5), (3, 83, 1)],
            2: [(0, 86, .5), (.5, 83, .5), (1, 79, 1), (2, 83, .5), (2.5, 86, .5), (3, 91, 1)],
            3: [(0, 90, .5), (.5, 86, .5), (1, 83, 1), (2, 78, 1), (3, 81, 1)]}
    for bar in range(16):
        root, v = ch[bar % 4]; cyc = bar // 4
        for e in range(16):
            n = v[e % 3] + 12 * (1 + (e // 3) % 2)
            m.add(pulse(n, 0.2, 0.25, 0.5), at(bar, e * 0.25), 0.4, -0.4 + 0.8 * ((e // 2) % 2), 0.1)
        for e in range(8): m.add(pulse(root + (12 if e % 2 else 0), 0.45 * sp, 0.5, 0.9), at(bar, e * 0.5), 0.6, 0)
        for b in range(4): m.add(kick(0.9), at(bar, b), 0.85)
        m.add(snare(0.8), at(bar, 1), 0.7); m.add(snare(0.8), at(bar, 3), 0.7)
        for e in range(8): m.add(hat(0.7 if e % 2 else 0.4, e == 7), at(bar, e * 0.5 + 0.0), 0.6, 0.3)
        if cyc >= 1:
            for beat, n, ln in lead[bar % 4]: m.add(pulse(n, ln * sp * 0.9, 0.5, 0.9, 0.004), at(bar, beat), 0.55, 0.1, 0.08)
# =================== 4. LAB: rasa ingin tahu (D lydian, marimba) ===================
def lab(m, at, sp):
    ch = [(38, [62, 66, 69, 73]), (40, [64, 68, 71, 74]), (37, [61, 64, 68, 71]), (35, [59, 62, 66, 69])]
    grp = [0, 1.5, 3, 4.5, 6, 7.5, 9, 10]  # pola 3+3+2 pada 8 not
    for bar in range(16):
        root, v = ch[bar % 4]; cyc = bar // 4
        m.add(pad([x - 12 for x in v[:3]], 4 * sp), at(bar, 0), 0.4, 0, 0.6)
        for i, e in enumerate([0, .75, 1.5, 2.25, 3.0, 3.75]):
            n = v[(i * 2) % 4] + (12 if i % 3 == 0 else 0)
            m.add(mallet(n, 1.0 if i % 3 == 0 else 0.65), at(bar, e), 0.6, -0.35 + 0.14 * i, 0.15)
        m.add(bass(root, 0.9 * sp), at(bar, 0), 0.8); m.add(bass(root + 7, 0.6 * sp), at(bar, 1.5), 0.6); m.add(bass(root, 0.9 * sp), at(bar, 2.25), 0.65)
        for e in range(8): m.add(hat(0.4 if e % 2 == 0 else 0.7), at(bar, e * 0.5), 0.5, 0.4)
        for b in (0, 2): m.add(kick(0.55), at(bar, b + (0.25 if b == 2 else 0)), 0.65)
        m.add(block(0.9), at(bar, 1.5), 0.6, -0.3); m.add(block(0.7), at(bar, 3.25), 0.6, 0.3)
        if cyc >= 1:
            for beat, n in ([(0.75, 88), (2.25, 85)] if bar % 2 == 0 else [(1.5, 90), (3, 86)]): m.add(bell(n), at(bar, beat), 0.5, 0.35, 0.4)
# =================== 5. PROGRES: bangga & naik (F mayor) ===================
def progres(m, at, sp):
    ch = [(41, [65, 69, 72, 76]), (45, [64, 67, 72, 76]), (46, [65, 70, 74, 77]), (48, [67, 72, 76, 79])]
    mel = {0: [(0, 84, 1), (1, 81, .5), (1.5, 84, .5), (2, 88, 2)], 1: [(0, 88, 1), (1, 84, .5), (1.5, 81, .5), (2, 84, 2)],
           2: [(0, 86, 1), (1, 89, 1), (2, 86, .5), (2.5, 84, .5), (3, 81, 1)], 3: [(0, 84, 1.5), (1.5, 88, .5), (2, 91, 2)]}
    for bar in range(16):
        root, v = ch[bar % 4]; cyc = bar // 4
        m.add(pad([x - 12 for x in v], 4 * sp), at(bar, 0), 0.5, 0, 0.6)
        for i in range(8): m.add(bell(v[i % 4] + (12 if i >= 4 else 0), 0.55, 1.0), at(bar, i * 0.5), 0.5, -0.4 + 0.11 * i, 0.35)
        m.add(bass(root, 1.5 * sp), at(bar, 0), 0.85); m.add(bass(root + 7, 1.4 * sp), at(bar, 2), 0.7)
        m.add(kick(0.75), at(bar, 0), 0.8); m.add(kick(0.6), at(bar, 2), 0.7)
        m.add(snare(0.6), at(bar, 1), 0.6); m.add(snare(0.6), at(bar, 3), 0.6)
        for e in range(8): m.add(hat(0.5 if e % 2 == 0 else 0.8), at(bar, e * 0.5), 0.55, 0.35)
        if cyc >= 1:
            for beat, n, ln in mel[bar % 4]: m.add(pluck(n, ln * sp, 1.0), at(bar, beat), 0.7, 0.2, 0.3)
# =================== 6. PROFIL: tenang (A minor, kotak musik) ===================
def profil(m, at, sp):
    ch = [(45, [69, 72, 76]), (41, [65, 69, 72]), (48, [64, 67, 72]), (43, [62, 67, 71])]
    mel = {0: [(0, 88, 1.5), (1.5, 84, .5), (2, 81, 2)], 1: [(0, 84, 1), (1, 81, 1), (2, 77, 2)],
           2: [(0, 79, 1), (1, 84, 1), (2, 88, 2)], 3: [(0, 86, 1.5), (1.5, 83, .5), (2, 79, 2)]}
    for bar in range(16):
        root, v = ch[bar % 4]; cyc = bar // 4
        m.add(pad([x - 12 for x in v], 4 * sp), at(bar, 0), 0.55, 0, 0.7)
        for i in range(8): m.add(bell(v[i % 3] + (12 if i % 3 == 2 else 0), 0.5, 1.2), at(bar, i * 0.5), 0.5, -0.3 + 0.08 * i, 0.4)
        m.add(bass(root, 3.2 * sp), at(bar, 0), 0.7)
        if cyc >= 2: m.add(hat(0.4), at(bar, 1), 0.4, 0.3); m.add(hat(0.4), at(bar, 3), 0.4, 0.3)
        if cyc >= 1:
            for beat, n, ln in mel[bar % 4]: m.add(bell(n + (0 if cyc != 3 else 0), 0.9, 1.8), at(bar, beat), 0.6, 0.3, 0.5)

for name, bpm, fn in [('bgm_materi', 82, materi), ('bgm_latihan', 96, latihan), ('bgm_game', 132, game),
                      ('bgm_lab', 100, lab), ('bgm_progres', 108, progres), ('bgm_profil', 70, profil)]:
    m, loop = make(bpm, 16, fn); finish(m, loop, name)
