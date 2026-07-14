import { useState, useEffect } from 'react';

const LoopRelaxer = () => {
  const [angle, setAngle] = useState(0);
  const [speed, setSpeed] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setAngle(prev => (prev + speed) % 360);
    }, 16);
    return () => clearInterval(interval);
  }, [speed]);

  const orbs = [0, 60, 120, 180, 240, 300].map((offset, i) => {
    const rad = ((angle + offset) * Math.PI) / 180;
    const x = 50 + Math.cos(rad) * 25;
    const y = 50 + Math.sin(rad) * 25;
    const colors = ['#c4b5fd', '#93c5fd', '#6ee7b7', '#fde68a', '#fca5a5', '#f0abfc'];
    return { x, y, color: colors[i] };
  });

  return (
    <div className="flex flex-col items-center justify-center h-full gap-6"
      style={{ background: 'linear-gradient(135deg, #1e1b4b, #312e81)' }}>

      <div className="relative w-64 h-64">
        {orbs.map((orb, i) => (
          <div key={i} className="absolute w-5 h-5 rounded-full transition-all"
            style={{
              left: `${orb.x}%`, top: `${orb.y}%`, transform: 'translate(-50%, -50%)',
              background: orb.color, boxShadow: `0 0 20px ${orb.color}80`
            }} />
        ))}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-3 h-3 rounded-full bg-white/30" />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-white/50 text-xs">Slow</span>
        <input type="range" min="0.3" max="3" step="0.1" value={speed}
          onChange={(e) => setSpeed(Number(e.target.value))}
          className="w-32" />
        <span className="text-white/50 text-xs">Fast</span>
      </div>

      <p className="text-white/40 text-xs">Watch the orbs flow · Breathe with the rhythm</p>
    </div>
  );
};

export default LoopRelaxer;
