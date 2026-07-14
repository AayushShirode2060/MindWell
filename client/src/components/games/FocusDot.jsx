import { useState, useEffect } from 'react';

const FocusDot = () => {
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const [trail, setTrail] = useState([]);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const move = setInterval(() => {
      setPos(prev => ({
        x: Math.max(10, Math.min(90, prev.x + (Math.random() - 0.5) * 8)),
        y: Math.max(10, Math.min(90, prev.y + (Math.random() - 0.5) * 8))
      }));
      setTrail(prev => [...prev.slice(-20), { ...pos }]);
    }, 500);
    return () => clearInterval(move);
  }, [pos]);

  const handleClick = () => setScore(prev => prev + 1);

  return (
    <div className="relative w-full h-full overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)' }}>
      <div className="absolute top-4 right-4 text-sm font-bold text-slate-600">🎯 {score} taps</div>

      {trail.map((t, i) => (
        <div key={i} className="absolute rounded-full"
          style={{ left: `${t.x}%`, top: `${t.y}%`, width: 8, height: 8,
            background: `rgba(99, 102, 241, ${i * 0.04})`, transform: 'translate(-50%, -50%)' }} />
      ))}

      <div onClick={handleClick}
        className="absolute w-6 h-6 rounded-full cursor-pointer transition-all duration-500"
        style={{
          left: `${pos.x}%`, top: `${pos.y}%`, transform: 'translate(-50%, -50%)',
          background: 'radial-gradient(circle, #6366f1, #4f46e5)',
          boxShadow: '0 0 20px rgba(99,102,241,0.5)'
        }} />

      <div className="absolute bottom-6 left-0 right-0 text-center text-xs text-slate-400">
        Follow and tap the dot · Stay focused
      </div>
    </div>
  );
};

export default FocusDot;
