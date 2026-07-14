import { useState, useEffect, useCallback } from 'react';

const positiveThoughts = ['I can do this', 'I am enough', 'Today is a gift', 'I am growing', 'I choose joy', 'I am strong'];
const negativeThoughts = ["I'm not good enough", "Nothing works", "I can't do anything", "It's hopeless"];

const ThoughtCatcher = () => {
  const [falling, setFalling] = useState([]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);

  const spawnThought = useCallback(() => {
    const isPositive = Math.random() > 0.4;
    const pool = isPositive ? positiveThoughts : negativeThoughts;
    setFalling(prev => [...prev, {
      id: Date.now() + Math.random(),
      text: pool[Math.floor(Math.random() * pool.length)],
      isPositive,
      x: Math.random() * 70 + 5,
      y: 0, speed: Math.random() * 0.3 + 0.2
    }]);
  }, []);

  useEffect(() => {
    const spawn = setInterval(spawnThought, 1500);
    return () => clearInterval(spawn);
  }, [spawnThought]);

  useEffect(() => {
    const move = setInterval(() => {
      setFalling(prev => prev.map(t => ({ ...t, y: t.y + t.speed })).filter(t => t.y < 100));
    }, 50);
    return () => clearInterval(move);
  }, []);

  const catchThought = (id, isPositive) => {
    setFalling(prev => prev.filter(t => t.id !== id));
    if (isPositive) { setScore(prev => prev + 1); }
    else { setLives(prev => Math.max(0, prev - 1)); }
  };

  return (
    <div className="relative w-full h-full overflow-hidden" style={{ background: 'linear-gradient(180deg, #f0fdf4, #dcfce7)' }}>
      <div className="absolute top-4 left-4 text-sm font-bold text-emerald-700">✨ {score} caught</div>
      <div className="absolute top-4 right-4 text-sm font-bold text-red-500">{'❤️'.repeat(lives)}</div>

      {falling.map(t => (
        <button key={t.id} onClick={() => catchThought(t.id, t.isPositive)}
          className="absolute px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer border-none whitespace-nowrap transition-transform hover:scale-110"
          style={{
            left: `${t.x}%`, top: `${t.y}%`,
            background: t.isPositive ? '#bbf7d0' : '#fecaca',
            color: t.isPositive ? '#166534' : '#991b1b'
          }}>
          {t.text}
        </button>
      ))}

      <div className="absolute bottom-6 left-0 right-0 text-center text-xs text-emerald-600">
        Catch positive thoughts ✅ — Avoid negative ones ❌
      </div>
    </div>
  );
};

export default ThoughtCatcher;
