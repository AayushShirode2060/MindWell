import { useState, useEffect, useRef } from 'react';
import API from '../../api/axios';
import { gameEndpoints } from '../../api/endpoints';
import { Timer, X } from 'lucide-react';

// Calming ambient sound using Web Audio API (no audio files needed!)
const useAmbientSound = () => {
  const ctxRef = useRef(null);
  const nodesRef = useRef([]);

  const start = () => {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    ctxRef.current = ctx;

    // Soft ambient pad — layered sine waves (174Hz Solfeggio + C4 + E4)
    const freqs = [174, 261.63, 329.63];
    freqs.forEach(freq => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.value = 0.04; // very soft
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      nodesRef.current.push({ osc, gain });
    });
  };

  const stop = () => {
    nodesRef.current.forEach(({ osc, gain }) => {
      if (ctxRef.current) {
        gain.gain.setTargetAtTime(0, ctxRef.current.currentTime, 0.5);
        setTimeout(() => { try { osc.stop(); } catch(e) {} }, 1000);
      }
    });
    nodesRef.current = [];
  };

  return { start, stop };
};

const GameWrapper = ({ gameName, gameId, maxTime = 300, children, onClose }) => {
  const [seconds, setSeconds] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [musicOn, setMusicOn] = useState(true);
  const intervalRef = useRef(null);
  const { start: startMusic, stop: stopMusic } = useAmbientSound();

  // Timer
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setSeconds(prev => {
        if (prev + 1 >= maxTime) {
          clearInterval(intervalRef.current);
          setIsTimeUp(true);
          setShowFeedback(true);
          return maxTime;
        }
        return prev + 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [maxTime]);

  // Auto-start music on mount, stop on unmount
  useEffect(() => {
    startMusic();
    return () => stopMusic();
  }, []);

  const toggleMusic = () => {
    if (musicOn) { stopMusic(); } else { startMusic(); }
    setMusicOn(prev => !prev);
  };

  const handleStop = () => {
    clearInterval(intervalRef.current);
    stopMusic();
    setShowFeedback(true);
  };

  const handleFeedback = async (feedback) => {
    try {
      await API.post(gameEndpoints.SAVE_SESSION_API, {
        game: gameId,
        duration: seconds,
        feedback
      });
    } catch (err) { console.error(err); }
    onClose();
  };

  const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div className="fixed inset-0 bg-white z-[100] flex flex-col">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border-custom">
        <div className="flex items-center gap-3">
          <Timer size={18} className="text-text-muted" />
          <span className="text-sm font-mono font-bold">{formatTime(seconds)} / {formatTime(maxTime)}</span>
          <button onClick={toggleMusic}
            className="text-sm px-3 py-1 rounded-full bg-surface border border-border-custom cursor-pointer hover:bg-white transition-all">
            {musicOn ? '🔊' : '🔇'}
          </button>
        </div>
        <div className="text-lg font-bold">{gameName}</div>
        <button onClick={handleStop}
          className="w-8 h-8 rounded-full bg-surface flex items-center justify-center border border-border-custom cursor-pointer hover:bg-red-50 transition-all">
          <X size={16} />
        </button>
      </div>

      {/* Timer Progress Bar */}
      <div className="h-1 bg-surface">
        <div className="h-full bg-primary transition-all duration-1000"
          style={{ width: `${(seconds / maxTime) * 100}%` }} />
      </div>

      {/* Game Content */}
      <div className="flex-1 overflow-hidden">
        {!isTimeUp && children}
      </div>

      {/* Feedback Modal */}
      {showFeedback && (
        <div className="fixed inset-0 bg-dark/60 flex items-center justify-center z-[200]">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full mx-4 text-center">
            <h2 className="text-2xl font-extrabold mb-2">Session Complete! 🎉</h2>
            <p className="text-text-muted text-sm mb-1">You played for {formatTime(seconds)}</p>
            <p className="text-lg font-semibold mb-6 mt-4">Do you feel better?</p>
            <div className="flex justify-center gap-4">
              {[
                { emoji: '😊', label: 'Yes', value: 'better' },
                { emoji: '😐', label: 'Same', value: 'same' },
                { emoji: '😞', label: 'No', value: 'worse' }
              ].map(opt => (
                <button key={opt.value} onClick={() => handleFeedback(opt.value)}
                  className="flex flex-col items-center gap-1 px-5 py-3 rounded-2xl border-2 border-border-custom hover:border-primary hover:bg-primary/10 transition-all cursor-pointer bg-white">
                  <span className="text-3xl">{opt.emoji}</span>
                  <span className="text-xs font-semibold text-text-muted">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameWrapper;
