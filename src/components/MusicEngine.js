import React, { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { WebView } from 'react-native-webview';

// Pemutar YouTube (Android/iOS): WebView berisi YouTube IFrame API.
export default function MusicEngine({ videoId, playing, volume = 50, onError }) {
  const ref = useRef(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!playing && !started) return;
    if (playing && !started) { setStarted(true); return; } // autoplay saat player siap
    if (ref.current) ref.current.injectJavaScript(`ctl('${playing ? 'play' : 'pause'}'); true;`);
  }, [playing]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (ref.current) ref.current.injectJavaScript(`ctl('vol', ${volume}); true;`);
  }, [volume]);

  if (!started) return null;

  const html = `<!DOCTYPE html><html><body style="margin:0;background:#000"><div id="p"></div>
<script src="https://www.youtube.com/iframe_api"></script>
<script>
var player;
function onYouTubeIframeAPIReady(){
  player = new YT.Player('p', { width:'200', height:'200', videoId:'${videoId}',
    playerVars:{ autoplay:1, loop:1, playlist:'${videoId}', controls:0, playsinline:1 },
    events:{ onReady:function(e){ e.target.setVolume(${volume}); e.target.playVideo(); },
            onError:function(e){ if(window.ReactNativeWebView) window.ReactNativeWebView.postMessage('err:'+e.data); } } });
}
function ctl(a,v){ if(!player||!player.playVideo) return; if(a==='vol') player.setVolume(v); else if(a==='play') player.playVideo(); else player.pauseVideo(); }
</script></body></html>`;

  return (
    // Di Android opacity tidak menyembunyikan WebView (kotak hitam muncul), jadi ditaruh di luar layar.
    <View pointerEvents="none" style={{ position: 'absolute', left: -1000, top: 0, width: 200, height: 200 }}>
      <WebView
        ref={ref}
        originWhitelist={['*']}
        source={{ html, baseUrl: 'https://www.youtube.com' }}
        mediaPlaybackRequiresUserAction={false}
        allowsInlineMediaPlayback
        javaScriptEnabled
        onMessage={(e) => { if (onError && String(e.nativeEvent.data).indexOf('err:') === 0) onError(e.nativeEvent.data); }}
        style={{ width: 200, height: 200, backgroundColor: 'transparent' }}
      />
    </View>
  );
}
