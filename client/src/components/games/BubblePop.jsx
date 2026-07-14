import { useState, useEffect, useCallback } from 'react';

const BubblePop = () => {
  const [bubbles, setBubbles] = useState([]);
  const [score, setScore] = useState(0);

  const spawnBubble = useCallback(() => {
    const id = Date.now() + Math.random();
    const bubble = {
      id,
      x: Math.random() * 80 + 10,
      y: 100,
      size: Math.random() * 40 + 30,
      speed: Math.random() * 0.5 + 0.3,
      color: ['#a7f3d0', '#bfdbfe', '#ddd6fe', '#fde68a', '#fecaca'][Math.floor(Math.random() * 5)]
    };
    setBubbles(prev => [...prev, bubble]);
  }, []);

  useEffect(() => {
    const spawnInterval = setInterval(spawnBubble, 800);
    return () => clearInterval(spawnInterval);
  }, [spawnBubble]);

  useEffect(() => {
    const moveInterval = setInterval(() => {
      setBubbles(prev =>
        prev.map(b => ({ ...b, y: b.y - b.speed })).filter(b => b.y > -10)
      );
    }, 50);
    return () => clearInterval(moveInterval);
  }, []);

  const popBubble = (id) => {
    setBubbles(prev => prev.filter(b => b.id !== id));
    setScore(prev => prev + 1);
  };

  return (
    <div className="relative w-full h-full overflow-hidden" style={{ background: 'linear-gradient(180deg, #ede9fe, #f5f3ff)' }}>
      <div className="absolute top-4 right-4 bg-white/80 px-4 py-2 rounded-full text-sm font-bold shadow-sm">
        💫 {score} popped
      </div>
      {bubbles.map(b => (
        <div
          key={b.id}
          onClick={() => popBubble(b.id)}
          className="absolute rounded-full cursor-pointer transition-transform hover:scale-110"
          style={{
            left: `${b.x}%`, bottom: `${b.y}%`,
            width: b.size, height: b.size,
            background: b.color, opacity: 0.8,
            boxShadow: `inset -4px -4px 8px rgba(255,255,255,0.6), 0 0 20px ${b.color}40`
          }}
        />
      ))}
    </div>
  );
};

export default BubblePop;
