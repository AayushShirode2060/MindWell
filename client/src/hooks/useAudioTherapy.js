import { useRef, useState } from 'react';

const useAudioTherapy = () => {
  const audioContextRef = useRef(null);
  const oscillatorRef = useRef(null);
  const gainRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentFreq, setCurrentFreq] = useState(null);

  const parseFrequency = (freqString) => {
    const num = parseFloat(freqString);
    return isNaN(num) ? 432 : num;
  };

  const play = (freqString, type = 'solfeggio') => {
    stop();
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    audioContextRef.current = ctx;
    const freq = parseFrequency(freqString);

    if (type === 'binaural') {
      const baseFreq = 200;
      const splitter = ctx.createChannelMerger(2);
      const oscL = ctx.createOscillator();
      oscL.frequency.value = baseFreq;
      oscL.type = 'sine';
      const gainL = ctx.createGain();
      gainL.gain.value = 0.3;
      oscL.connect(gainL);
      gainL.connect(splitter, 0, 0);

      const oscR = ctx.createOscillator();
      oscR.frequency.value = baseFreq + freq;
      oscR.type = 'sine';
      const gainR = ctx.createGain();
      gainR.gain.value = 0.3;
      oscR.connect(gainR);
      gainR.connect(splitter, 0, 1);

      splitter.connect(ctx.destination);
      oscL.start();
      oscR.start();
      oscillatorRef.current = { left: oscL, right: oscR };
    } else {
      const osc = ctx.createOscillator();
      osc.frequency.value = freq;
      osc.type = 'sine';
      const gain = ctx.createGain();
      gain.gain.value = 0;
      gain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 2);
      gainRef.current = gain;
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      oscillatorRef.current = osc;
    }

    setIsPlaying(true);
    setCurrentFreq(freqString);
  };

  const stop = () => {
    try {
      if (oscillatorRef.current) {
        if (oscillatorRef.current.left) {
          oscillatorRef.current.left.stop();
          oscillatorRef.current.right.stop();
        } else {
          oscillatorRef.current.stop();
        }
      }
      if (audioContextRef.current) audioContextRef.current.close();
    } catch (e) {}
    oscillatorRef.current = null;
    audioContextRef.current = null;
    setIsPlaying(false);
    setCurrentFreq(null);
  };

  return { play, stop, isPlaying, currentFreq };
};

export default useAudioTherapy;
