import { useState } from 'react';

const ThoughtRelease = () => {
  const [input, setInput] = useState('');
  const [balloons, setBalloons] = useState([]);

  const release = () => {
    if (!input.trim()) return;
    const balloon = {
      id: Date.now(),
      text: input,
      x: Math.random() * 60 + 20,
      color: ['#fecaca', '#fed7aa', '#fde68a', '#d9f99d', '#a5f3fc'][Math.floor(Math.random() * 5)]
    };
    setBalloons(prev => [...prev, balloon]);
    setInput('');
    setTimeout(() => setBalloons(prev => prev.filter(b => b.id !== balloon.id)), 5000);
  };

  return (
    <div className="relative flex flex-col items-center justify-end h-full pb-12 overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #bfdbfe, #dbeafe, #eff6ff)' }}>

      {balloons.map(b => (
        <div key={b.id} className="absolute flex flex-col items-center"
          style={{
            left: `${b.x}%`, bottom: '20%',
            animation: 'floatUp 5s ease-out forwards'
          }}>
          <div className="w-16 h-20 rounded-full flex items-center justify-center text-center"
            style={{ background: b.color }}>
            <span className="text-[10px] font-medium px-1 leading-tight">{b.text}</span>
          </div>
          <div className="w-px h-8 bg-gray-300" />
        </div>
      ))}

      <div className="relative z-10 text-center mb-6">
        <p className="text-sm font-semibold text-blue-700 mb-4">Write a negative thought and let it float away 🎈</p>
        <div className="flex gap-2">
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && release()}
            placeholder="Type a worry or thought..."
            className="px-4 py-3 rounded-xl border-2 border-blue-200 text-sm outline-none focus:border-blue-400 bg-white w-64" />
          <button onClick={release}
            className="px-5 py-3 bg-blue-500 text-white rounded-xl font-semibold text-sm border-none cursor-pointer hover:bg-blue-600 transition-all">
            Release 🎈
          </button>
        </div>
      </div>

      <style>{`
        @keyframes floatUp { 0% { transform: translateY(0); opacity: 1; } 100% { transform: translateY(-500px); opacity: 0; } }
      `}</style>
    </div>
  );
};

export default ThoughtRelease;
