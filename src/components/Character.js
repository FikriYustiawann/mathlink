import React, { useEffect, useRef } from 'react';
import { View, Image, Animated, Easing } from 'react-native';
import Text from './Txt';
import { COLOR } from '../theme';
import useLoop, { useDecor } from '../hooks/useLoop';
import { useChar } from '../CharacterContext';

// Siluet netral sementara â€” dipakai selama CHARACTER_IMAGE di config.js masih null.
function Silhouette({ width, height }) {
  const fill = '#061A45';
  const rim = COLOR.cyan;
  return (
    <View style={{ width, height, alignItems: 'center' }}>
      <View
        style={{
          position: 'absolute', bottom: 0, width: width * 0.78, height: height * 0.5,
          backgroundColor: fill, borderTopLeftRadius: width * 0.38, borderTopRightRadius: width * 0.38,
          borderWidth: 2, borderBottomWidth: 0, borderColor: rim,
        }}
      />
      <View style={{ position: 'absolute', bottom: height * 0.46, width: width * 0.14, height: height * 0.08, backgroundColor: fill }} />
      <View
        style={{
          position: 'absolute', bottom: height * 0.52, width: width * 0.36, height: width * 0.42,
          borderRadius: width * 0.2, backgroundColor: fill, borderWidth: 2, borderColor: rim,
        }}
      />
      <Text
        style={{
          position: 'absolute', top: height * 0.06, textAlign: 'center', color: COLOR.ice,
          opacity: 0.7, fontSize: 11, letterSpacing: 2, fontWeight: '700',
        }}
      >
        {'ASET KARAKTER\nassets/characters/makoto.png'}
      </Text>
    </View>
  );
}

// Karakter dengan animasi: masuk dari kanan, melayang/"bernapas", dan aura berdenyut.
export default function Character({ width, height, style, aura = true, fromLeft = false, auraFace: auraFaceProp = null }) {
  const ch = useChar();
  const CHARACTER_IMAGE = ch.lobby, CHARACTER_ASPECT = ch.aspect;
  const auraFace = auraFaceProp ? ch.auraFace : null;
  const float = useLoop(2800, { yoyo: true, easing: Easing.inOut(Easing.sin) });
  const glow = useDecor(2200, { yoyo: true, easing: Easing.inOut(Easing.quad) });
  const enter = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(enter, { toValue: 1, friction: 7, tension: 40, useNativeDriver: true }).start();
  }, [enter]);

  const sway = useDecor(4600, { yoyo: true, easing: Easing.inOut(Easing.sin) });
  const ring = useDecor(3400);
  const ring2 = useDecor(3400, { delay: 1700 });

  const translateY = float.interpolate({ inputRange: [0, 1], outputRange: [0, -18] });
  const scale = float.interpolate({ inputRange: [0, 1], outputRange: [1, 1.025] });
  const rotate = sway.interpolate({ inputRange: [0, 1], outputRange: ['-1.2deg', '1.2deg'] });
  const driftX = sway.interpolate({ inputRange: [0, 1], outputRange: [-6, 6] });
  const ringScale = ring.interpolate({ inputRange: [0, 1], outputRange: [0.55, 1.35] });
  const ringOp = ring.interpolate({ inputRange: [0, 0.15, 1], outputRange: [0, 0.55, 0] });
  const ring2Scale = ring2.interpolate({ inputRange: [0, 1], outputRange: [0.55, 1.35] });
  const ring2Op = ring2.interpolate({ inputRange: [0, 0.15, 1], outputRange: [0, 0.55, 0] });
  const enterX = enter.interpolate({ inputRange: [0, 1], outputRange: [fromLeft ? -width * 0.7 : width * 0.7, 0] });
  const glowOpacity = glow.interpolate({ inputRange: [0, 1], outputRange: [0.2, 0.55] });
  const glowScale = glow.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1.1] });

  // Ukuran gambar mengikuti rasio aslinya & menempel di dasar (tanpa celah kosong di bawah)
  // (native: dibaca dari aset; web: memakai CHARACTER_ASPECT di config.js)
  const asset = CHARACTER_IMAGE && typeof Image.resolveAssetSource === 'function' ? Image.resolveAssetSource(CHARACTER_IMAGE) : null;
  const aspect = CHARACTER_IMAGE ? (asset && asset.width && asset.height ? asset.width / asset.height : CHARACTER_ASPECT) : null;
  const imgW = aspect ? Math.min(width, height * aspect) : width;
  const imgH = aspect ? imgW / aspect : height;

  // Aura: di tengah kotak, atau (auraFace) dipusatkan di wajah karakter {x: geser dari tengah, y: tinggi wajah}, keduanya pecahan ukuran gambar
  const auraSize = auraFace ? imgH * 0.8 : Math.min(width, height) * 0.9;
  const auraBottom = auraFace ? imgH * auraFace.y - auraSize / 2 - 20 : height * 0.22;
  const auraShift = auraFace ? imgW * auraFace.x : 0;

  return (
    <Animated.View
      pointerEvents="none"
      style={[{ width, height, alignItems: 'center', justifyContent: 'flex-end', transform: [{ translateX: enterX }] }, style]}
    >
      {aura && (
        <View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', transform: [{ translateX: auraShift }] }}>
          {/* cahaya lembut berdenyut di belakang karakter (lapisan bertumpuk = tepi halus) */}
          {[1, 0.78, 0.56].map((k, i) => (
            <Animated.View
              key={i}
              style={{
                position: 'absolute', bottom: auraBottom + auraSize * (1 - k) / 2, width: auraSize * k, height: auraSize * k,
                borderRadius: (auraSize * k) / 2, backgroundColor: i === 2 ? COLOR.cyan : COLOR.royal,
                opacity: Animated.multiply(glowOpacity, i === 2 ? 0.28 : 0.4), transform: [{ scale: glowScale }],
              }}
            />
          ))}
          {/* cincin "Dark Hour" yang memancar keluar */}
          <Animated.View style={{ position: 'absolute', bottom: auraBottom, width: auraSize, height: auraSize, borderRadius: auraSize / 2, borderWidth: 2, borderColor: COLOR.cyan, opacity: ringOp, transform: [{ scale: ringScale }] }} />
          <Animated.View style={{ position: 'absolute', bottom: auraBottom, width: auraSize, height: auraSize, borderRadius: auraSize / 2, borderWidth: 2, borderColor: COLOR.ice, opacity: ring2Op, transform: [{ scale: ring2Scale }] }} />
        </View>
      )}
      <Animated.View style={{ marginBottom: CHARACTER_IMAGE ? -20 : 0, transform: [{ translateX: driftX }, { translateY }, { rotate }, { scale }] }}>
        {CHARACTER_IMAGE ? (
          <Image source={CHARACTER_IMAGE} style={{ width: imgW, height: imgH, resizeMode: 'contain' }} />
        ) : (
          <Silhouette width={width} height={height} />
        )}
      </Animated.View>
    </Animated.View>
  );
}
