import { useState, useEffect } from 'react';

const BreathingBubble = () => {
  const [phase, setPhase] = useState('inhale'); // inhale, hold, exhale
  const [size, setSize] = useState(100);

  useEffect(() => {
    const cycle = () => {
      setPhase('inhale');
      setSize(200);
      setTimeout(() => { setPhase('hold'); }, 4000);
      setTimeout(() => { setPhase('exhale'); setSize(100); }, 7000);
    };
    cycle();
    const interval = setInterval(cycle, 11000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full" style={{ background: 'linear-gradient(135deg, #e8f0fe, #d4e9ff)' }}>
      <div className="relative flex items-center justify-center">
        <div
          className="rounded-full flex items-center justify-center transition-all duration-[4000ms] ease-in-out"
          style={{
            width: size,
            height: size,
            background: 'radial-gradient(circle, rgba(147,197,253,0.8), rgba(96,165,250,0.4))',
            boxShadow: `0 0 ${size / 2}px rgba(96,165,250,0.3)`
          }}
        >
          <span className="text-white text-lg font-bold capitalize">{phase}</span>
        </div>
      </div>
      <p className="mt-8 text-blue-800/60 text-sm font-medium">
        {phase === 'inhale' ? 'Breathe in slowly...' : phase === 'hold' ? 'Hold your breath...' : 'Breathe out gently...'}
      </p>
    </div>
  );
};

export default BreathingBubble;
