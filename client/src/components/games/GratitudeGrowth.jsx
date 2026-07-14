import { useState } from 'react';

const GratitudeGrowth = () => {
  const [items, setItems] = useState([]);
  const [input, setInput] = useState('');
  const stages = ['🌱', '🌿', '🪴', '🌳', '🌸'];

  const addGratitude = () => {
    if (!input.trim()) return;
    setItems(prev => [...prev, input.trim()]);
    setInput('');
  };

  const stage = Math.min(items.length, stages.length - 1);

  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 p-6"
      style={{ background: 'linear-gradient(180deg, #fefce8, #ecfccb)' }}>
      <div className="text-6xl transition-all duration-500" style={{ transform: `scale(${1 + stage * 0.3})` }}>
        {stages[stage]}
      </div>
      <p className="text-sm font-semibold text-emerald-700">
        {items.length === 0 ? 'Plant your first seed of gratitude!' : `${items.length} gratitude${items.length > 1 ? 's' : ''} planted — keep growing!`}
      </p>

      <div className="flex gap-2 w-full max-w-sm">
        <input type="text" value={input} onChange={(e) => setInput(e.target.value)}
          placeholder="I'm grateful for..."
          onKeyDown={(e) => e.key === 'Enter' && addGratitude()}
          className="flex-1 px-4 py-3 rounded-xl border-2 border-emerald-200 text-sm outline-none focus:border-emerald-400 bg-white" />
        <button onClick={addGratitude}
          className="px-5 py-3 bg-emerald-500 text-white rounded-xl font-semibold text-sm border-none cursor-pointer hover:bg-emerald-600 transition-all">
          Plant 🌱
        </button>
      </div>

      <div className="flex flex-wrap gap-2 max-w-md justify-center mt-2">
        {items.map((item, i) => (
          <span key={i} className="px-3 py-1.5 bg-white/80 rounded-full text-xs font-medium text-emerald-700 border border-emerald-200">
            {stages[Math.min(i, stages.length - 1)]} {item}
          </span>
        ))}
      </div>
    </div>
  );
};

export default GratitudeGrowth;
