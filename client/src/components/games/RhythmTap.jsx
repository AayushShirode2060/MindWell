import { useState, useEffect, useRef } from 'react';

const RhythmTap = () => {
  const [beat, setBeat] = useState(false);
  const [score, setScore] = useState(0);
  const [bpm] = useState(60); // calm 60bpm
  const ctxRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setBeat(true);
      setTimeout(() => setBeat(false), 300);
    }, (60 / bpm) * 1000);
    return () => clearInterval(interval);
  }, [bpm]);

  const playTap = () => {
    const ctx = ctxRef.current || new (window.AudioContext || window.webkitAudioContext)();
    ctxRef.current = ctx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = 440;
    osc.type = 'sine';
    gain.gain.value = 0.1;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    gain.gain.setTargetAtTime(0, ctx.currentTime, 0.1);
    setTimeout(() => osc.stop(), 200);

    if (beat) setScore(prev => prev + 1);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full gap-8"
      style={{ background: 'linear-gradient(135deg, #fdf4ff, #fae8ff)' }}>
      <div className="text-sm font-bold text-purple-600">🎵 Perfect taps: {score}</div>

      <div className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer select-none
        ${beat ? 'scale-110 shadow-xl' : 'scale-100'}`}
        onClick={playTap}
        style={{ background: beat ? 'linear-gradient(135deg, #c084fc, #a855f7)' : 'linear-gradient(135deg, #e9d5ff, #d8b4fe)' }}>
        <span className="text-4xl">{beat ? '🎶' : '🎵'}</span>
      </div>

      <p className="text-xs text-purple-400 text-center">Tap the circle on each beat<br />Breathe with the rhythm</p>
    </div>
  );
};

export default RhythmTap;
