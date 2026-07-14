import { useState, useEffect } from 'react';

const colors = ['#c4b5fd','#a78bfa','#93c5fd','#67e8f9','#6ee7b7','#a7f3d0','#fde68a','#fca5a5'];

const SlidingPuzzle = () => {
  const [tiles, setTiles] = useState([]);
  const [moves, setMoves] = useState(0);

  useEffect(() => {
    const ordered = [...Array(8)].map((_, i) => i + 1).concat(null);
    const shuffled = [...ordered].sort(() => Math.random() - 0.5);
    setTiles(shuffled);
  }, []);

  const handleClick = (idx) => {
    const emptyIdx = tiles.indexOf(null);
    const row = Math.floor(idx / 3), col = idx % 3;
    const eRow = Math.floor(emptyIdx / 3), eCol = emptyIdx % 3;
    if ((Math.abs(row - eRow) + Math.abs(col - eCol)) !== 1) return;

    const next = [...tiles];
    [next[idx], next[emptyIdx]] = [next[emptyIdx], next[idx]];
    setTiles(next);
    setMoves(prev => prev + 1);
  };

  const isSolved = tiles.every((t, i) => t === (i < 8 ? i + 1 : null));

  return (
    <div className="flex flex-col items-center justify-center h-full gap-6"
      style={{ background: 'linear-gradient(135deg, #ede9fe, #e0e7ff)' }}>
      <div className="text-sm font-bold text-indigo-600">Moves: {moves} {isSolved && '· Solved! 🎉'}</div>
      <div className="grid grid-cols-3 gap-2">
        {tiles.map((tile, i) => (
          <button key={i} onClick={() => handleClick(i)}
            className="w-20 h-20 rounded-xl text-xl font-bold flex items-center justify-center cursor-pointer border-none transition-all duration-200"
            style={{
              background: tile ? colors[(tile - 1) % colors.length] : 'transparent',
              color: tile ? '#1e1b4b' : 'transparent',
              opacity: tile ? 1 : 0
            }}>
            {tile}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SlidingPuzzle;
