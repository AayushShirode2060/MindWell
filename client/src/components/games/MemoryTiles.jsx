import { useState, useEffect } from 'react';

const emojis = ['🌸', '🌊', '🌿', '🦋', '🌙', '⭐'];
const shuffleArray = (arr) => [...arr].sort(() => Math.random() - 0.5);

const MemoryTiles = () => {
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);

  useEffect(() => {
    const deck = shuffleArray([...emojis, ...emojis]).map((emoji, i) => ({ id: i, emoji }));
    setCards(deck);
  }, []);

  const handleClick = (id) => {
    if (flipped.length === 2 || flipped.includes(id) || matched.includes(id)) return;
    const newFlipped = [...flipped, id];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(prev => prev + 1);
      const [a, b] = newFlipped;
      if (cards[a].emoji === cards[b].emoji) {
        setMatched(prev => [...prev, a, b]);
        setFlipped([]);
      } else {
        setTimeout(() => setFlipped([]), 800);
      }
    }
  };

  const isComplete = matched.length === cards.length && cards.length > 0;

  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 p-6"
      style={{ background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)' }}>
      <div className="text-sm font-bold text-emerald-700">Moves: {moves} {isComplete && '· Complete! 🎉'}</div>
      <div className="grid grid-cols-4 gap-3 max-w-xs">
        {cards.map((card, i) => {
          const isFlipped = flipped.includes(i) || matched.includes(i);
          return (
            <button key={i} onClick={() => handleClick(i)}
              className="w-16 h-16 rounded-xl text-2xl font-bold flex items-center justify-center cursor-pointer border-2 transition-all duration-300"
              style={{
                background: isFlipped ? 'white' : 'linear-gradient(135deg, #6ee7b7, #34d399)',
                borderColor: matched.includes(i) ? '#10b981' : '#a7f3d0',
                transform: isFlipped ? 'rotateY(0deg)' : 'rotateY(180deg)'
              }}>
              {isFlipped ? card.emoji : '?'}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MemoryTiles;
