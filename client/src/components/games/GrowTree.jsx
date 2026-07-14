import { useState } from 'react';

const stages = [
  { emoji: '🌰', name: 'Seed', bg: '#fefce8' },
  { emoji: '🌱', name: 'Sprout', bg: '#f0fdf4' },
  { emoji: '🌿', name: 'Sapling', bg: '#ecfdf5' },
  { emoji: '🪴', name: 'Young Tree', bg: '#dcfce7' },
  { emoji: '🌳', name: 'Tree', bg: '#bbf7d0' },
  { emoji: '🌸', name: 'Blooming Tree', bg: '#fce7f3' },
];

const GrowTree = () => {
  const [growth, setGrowth] = useState(0);
  const [water, setWater] = useState(0);
  const [sun, setSun] = useState(0);

  const stage = Math.min(Math.floor((water + sun) / 3), stages.length - 1);

  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 p-6"
      style={{ background: `linear-gradient(180deg, ${stages[stage].bg}, #f0fdf4)` }}>
      <div className="text-8xl transition-all duration-700" style={{ transform: `scale(${1 + stage * 0.2})` }}>
        {stages[stage].emoji}
      </div>
      <p className="text-lg font-bold text-emerald-700">{stages[stage].name}</p>
      <p className="text-xs text-emerald-500">Water: {water} · Sunlight: {sun}</p>

      <div className="flex gap-4">
        <button onClick={() => setWater(prev => prev + 1)}
          className="px-6 py-3 rounded-xl bg-blue-400 text-white font-semibold text-sm border-none cursor-pointer hover:bg-blue-500 transition-all">
          💧 Water
        </button>
        <button onClick={() => setSun(prev => prev + 1)}
          className="px-6 py-3 rounded-xl bg-yellow-400 text-dark font-semibold text-sm border-none cursor-pointer hover:bg-yellow-500 transition-all">
          ☀️ Sunlight
        </button>
      </div>

      {stage === stages.length - 1 && (
        <p className="text-sm font-semibold text-pink-500 animate-pulse">🌸 Your tree is fully grown! Beautiful!</p>
      )}
    </div>
  );
};

export default GrowTree;
