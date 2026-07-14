import { useState, useEffect } from 'react';

const palettes = [
  ['#fca5a5', '#f87171', '#ef4444', '#dc2626'],
  ['#93c5fd', '#60a5fa', '#3b82f6', '#2563eb'],
  ['#86efac', '#4ade80', '#22c55e', '#16a34a'],
  ['#c4b5fd', '#a78bfa', '#8b5cf6', '#7c3aed'],
  ['#fde68a', '#fbbf24', '#f59e0b', '#d97706'],
];

const ColorMatchCalm = () => {
  const [tiles, setTiles] = useState([]);
  const [selected, setSelected] = useState([]);
  const [matched, setMatched] = useState([]);
  const [score, setScore] = useState(0);

  useEffect(() => { generateTiles(); }, []);

  const generateTiles = () => {
    const palette = palettes[Math.floor(Math.random() * palettes.length)];
    const pairs = [...palette, ...palette];
    setTiles(pairs.sort(() => Math.random() - 0.5).map((c, i) => ({ id: i, color: c })));
    setSelected([]); setMatched([]);
  };

  const handleClick = (id) => {
    if (selected.length === 2 || selected.includes(id) || matched.includes(id)) return;
    const next = [...selected, id];
    setSelected(next);
    if (next.length === 2) {
      if (tiles[next[0]].color === tiles[next[1]].color) {
        setMatched(prev => [...prev, ...next]);
        setScore(prev => prev + 1);
        setSelected([]);
        if (matched.length + 2 === tiles.length) setTimeout(generateTiles, 1000);
      } else {
        setTimeout(() => setSelected([]), 600);
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full gap-6" style={{ background: 'linear-gradient(135deg, #fef3c7, #fde68a)' }}>
      <div className="text-sm font-bold text-amber-700">🎯 Matched: {score}</div>
      <div className="grid grid-cols-4 gap-3">
        {tiles.map((t, i) => {
          const show = selected.includes(i) || matched.includes(i);
          return (
            <button key={i} onClick={() => handleClick(i)}
              className="w-16 h-16 rounded-2xl border-2 border-white/50 cursor-pointer transition-all duration-300"
              style={{ background: show ? t.color : '#e5e7eb', opacity: matched.includes(i) ? 0.4 : 1 }} />
          );
        })}
      </div>
    </div>
  );
};

export default ColorMatchCalm;
