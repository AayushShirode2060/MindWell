import { useState, useEffect } from 'react';
import API from '../../api/axios';
import { gameEndpoints } from '../../api/endpoints';
import { Gamepad2, Flame, Sparkles } from 'lucide-react';
import GameWrapper from '../../components/games/GameWrapper';
import BreathingBubble from '../../components/games/BreathingBubble';
import BubblePop from '../../components/games/BubblePop';
import MemoryTiles from '../../components/games/MemoryTiles';
import ZenDrawing from '../../components/games/ZenDrawing';
import GratitudeGrowth from '../../components/games/GratitudeGrowth';
import ColorMatchCalm from '../../components/games/ColorMatchCalm';
import WaveTouch from '../../components/games/WaveTouch';
import ThoughtCatcher from '../../components/games/ThoughtCatcher';
import RhythmTap from '../../components/games/RhythmTap';
import SlidingPuzzle from '../../components/games/SlidingPuzzle';
import GrowTree from '../../components/games/GrowTree';
import FocusDot from '../../components/games/FocusDot';
import ThoughtRelease from '../../components/games/ThoughtRelease';
import PatternTracing from '../../components/games/PatternTracing';
import LoopRelaxer from '../../components/games/LoopRelaxer';

const games = [
  { id: 'breathing-bubble', name: 'Breathing Bubble', emoji: '🫧', category: 'Breathing', duration: '2 min', color: '#bfdbfe', benefit: 'Reduces anxiety' },
  { id: 'bubble-pop', name: 'Bubble Pop', emoji: '💫', category: 'Relaxation', duration: '3 min', color: '#ddd6fe', benefit: 'Stress release' },
  { id: 'memory-tiles', name: 'Memory Tiles', emoji: '🧩', category: 'Focus', duration: '3–5 min', color: '#a7f3d0', benefit: 'Improves concentration' },
  { id: 'zen-drawing', name: 'Zen Drawing', emoji: '🎨', category: 'Creativity', duration: '5 min', color: '#e9d5ff', benefit: 'Calms mind' },
  { id: 'gratitude-growth', name: 'Gratitude Growth', emoji: '🌱', category: 'Mindfulness', duration: '2–4 min', color: '#fef08a', benefit: 'Positive thinking' },
  { id: 'color-match', name: 'Color Match Calm', emoji: '🎯', category: 'Focus', duration: '3 min', color: '#fde68a', benefit: 'Improves focus' },
  { id: 'wave-touch', name: 'Wave Touch', emoji: '🌊', category: 'Relaxation', duration: '3 min', color: '#bae6fd', benefit: 'Sensory relaxation' },
  { id: 'thought-catcher', name: 'Thought Catcher', emoji: '🧠', category: 'Mindfulness', duration: '3 min', color: '#bbf7d0', benefit: 'Positive thinking' },
  { id: 'rhythm-tap', name: 'Rhythm Tap', emoji: '🎵', category: 'Breathing', duration: '3 min', color: '#e9d5ff', benefit: 'Sync breathing' },
  { id: 'sliding-puzzle', name: 'Sliding Puzzle', emoji: '🧩', category: 'Focus', duration: '5 min', color: '#c7d2fe', benefit: 'Calm concentration' },
  { id: 'grow-tree', name: 'Grow Your Tree', emoji: '🌱', category: 'Mindfulness', duration: '3 min', color: '#bbf7d0', benefit: 'Patience & growth' },
  { id: 'focus-dot', name: 'Focus Dot', emoji: '🎯', category: 'Focus', duration: '2 min', color: '#c7d2fe', benefit: 'Concentration' },
  { id: 'thought-release', name: 'Thought Release', emoji: '💭', category: 'Relaxation', duration: '3 min', color: '#bfdbfe', benefit: 'Emotional release' },
  { id: 'pattern-tracing', name: 'Pattern Tracing', emoji: '🌀', category: 'Creativity', duration: '3 min', color: '#ddd6fe', benefit: 'Motor calming' },
  { id: 'loop-relaxer', name: 'Loop Relaxer', emoji: '🔄', category: 'Relaxation', duration: '3 min', color: '#c4b5fd', benefit: 'Visual meditation' },

];

const gameComponents = {
  'breathing-bubble': BreathingBubble,
  'bubble-pop': BubblePop,
  'memory-tiles': MemoryTiles,
  'zen-drawing': ZenDrawing,
  'gratitude-growth': GratitudeGrowth,
    'color-match': ColorMatchCalm,
  'wave-touch': WaveTouch,
  'thought-catcher': ThoughtCatcher,
  'rhythm-tap': RhythmTap,
  'sliding-puzzle': SlidingPuzzle,
  'grow-tree': GrowTree,
  'focus-dot': FocusDot,
  'thought-release': ThoughtRelease,
  'pattern-tracing': PatternTracing,
  'loop-relaxer': LoopRelaxer,

};

const categories = ['All', 'Breathing', 'Relaxation', 'Focus', 'Creativity', 'Mindfulness'];

const GamesPage = () => {
  const [activeGame, setActiveGame] = useState(null);
  const [category, setCategory] = useState('All');
  const [recommendation, setRecommendation] = useState(null);
  const [stats, setStats] = useState({ streak: 0, totalSessions: 0 });

  useEffect(() => {
    fetchRecommendation();
    fetchStats();
  }, []);

  const fetchRecommendation = async () => {
    try {
      const res = await API.get(gameEndpoints.GET_RECOMMENDATION_API);
      setRecommendation(res.data.recommendation);
    } catch (err) { console.error(err); }
  };

  const fetchStats = async () => {
    try {
      const res = await API.get(gameEndpoints.GET_STATS_API);
      setStats({ streak: res.data.streak, totalSessions: res.data.totalSessions });
    } catch (err) { console.error(err); }
  };

  const filtered = category === 'All' ? games : games.filter(g => g.category === category);

  const handleClose = () => {
    setActiveGame(null);
    fetchStats(); // refresh streak after playing
  };

  const ActiveGameComponent = activeGame ? gameComponents[activeGame.id] : null;

  return (
    <div>
      {/* Active Game Fullscreen */}
      {activeGame && ActiveGameComponent && (
        <GameWrapper gameName={activeGame.name} gameId={activeGame.id} maxTime={300} onClose={handleClose}>
          <ActiveGameComponent />
        </GameWrapper>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-text-main flex items-center gap-2">
            <Gamepad2 size={28} /> Mindful Games
          </h1>
          <p className="text-text-muted mt-1">Therapeutic mini-games for your mental wellness</p>
        </div>
        <div className="flex items-center gap-3">
          {stats.streak > 0 && (
            <div className="flex items-center gap-1.5 px-4 py-2 bg-orange-50 border border-orange-200 rounded-full">
              <Flame size={16} className="text-orange-500" />
              <span className="text-sm font-bold text-orange-700">{stats.streak} Day Streak</span>
            </div>
          )}
          <button onClick={() => setActiveGame(games[0])}
            className="px-5 py-2.5 rounded-full text-sm font-semibold border-none cursor-pointer transition-all"
            style={{ background: 'linear-gradient(135deg, #93c5fd, #c4b5fd)', color: '#1e1b4b' }}>
            <Sparkles size={14} className="inline mr-1" /> Quick Calm
          </button>
        </div>
      </div>

      {/* AI Recommendation */}
      {recommendation && (
        <div className="mb-6 p-5 rounded-2xl border-2 border-indigo-100"
          style={{ background: 'linear-gradient(135deg, #eef2ff, #e0e7ff)' }}>
          <div className="text-xs font-bold uppercase text-indigo-400 mb-1">🧠 Recommended for You</div>
          <p className="text-sm text-indigo-800 font-medium">
            {recommendation.emoji} {recommendation.reason}
          </p>
          <button onClick={() => setActiveGame(games.find(g => g.id === recommendation.game))}
            className="mt-3 px-4 py-2 bg-indigo-500 text-white rounded-lg text-xs font-semibold border-none cursor-pointer hover:bg-indigo-600 transition-all">
            Play {games.find(g => g.id === recommendation.game)?.name} →
          </button>
        </div>
      )}

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map(c => (
          <button key={c} onClick={() => setCategory(c)}
            className={`px-4 py-2 rounded-full text-xs font-semibold cursor-pointer border-2 transition-all
            ${category === c ? 'bg-dark text-white border-dark' : 'bg-white text-text-muted border-border-custom hover:border-dark'}`}>
            {c}
          </button>
        ))}
      </div>

      {/* Game Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(game => (
          <div key={game.id}
            className="bg-white rounded-2xl p-5 border border-border-custom hover:shadow-md transition-all cursor-pointer group"
            onClick={() => setActiveGame(game)}>
            <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">{game.emoji}</div>
            <h3 className="font-bold text-lg mb-1">{game.name}</h3>
            <div className="flex gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold"
                style={{ background: game.color + '40', color: '#333' }}>{game.category}</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-surface text-text-muted">{game.duration}</span>
            </div>
            <p className="text-xs text-text-muted">{game.benefit}</p>
          </div>
        ))}
      </div>

      {/* Stats Footer */}
      <div className="mt-8 text-center text-xs text-text-muted">
        Total sessions played: {stats.totalSessions} · Max 5 min per game to prevent overuse
      </div>
    </div>
  );
};

export default GamesPage;
