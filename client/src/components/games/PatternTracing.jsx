import { useRef, useState, useEffect } from 'react';

const patterns = [
  { name: 'Diamond', points: [{ x: 0.5, y: 0.2 }, { x: 0.8, y: 0.5 }, { x: 0.5, y: 0.8 }, { x: 0.2, y: 0.5 }, { x: 0.5, y: 0.2 }] },
  { name: 'Square', points: [{ x: 0.3, y: 0.3 }, { x: 0.7, y: 0.3 }, { x: 0.7, y: 0.7 }, { x: 0.3, y: 0.7 }, { x: 0.3, y: 0.3 }] },
  { name: 'Triangle', points: [{ x: 0.5, y: 0.15 }, { x: 0.85, y: 0.8 }, { x: 0.15, y: 0.8 }, { x: 0.5, y: 0.15 }] },
  { name: 'Zigzag', points: [{ x: 0.1, y: 0.3 }, { x: 0.3, y: 0.7 }, { x: 0.5, y: 0.3 }, { x: 0.7, y: 0.7 }, { x: 0.9, y: 0.3 }] },
];

const PatternTracing = () => {
  const canvasRef = useRef(null);
  const [patternIdx, setPatternIdx] = useState(0);
  const [isDrawing, setIsDrawing] = useState(false);
  const [userPoints, setUserPoints] = useState([]);
  const [accuracy, setAccuracy] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [checkpoints, setCheckpoints] = useState([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
    resetPattern();
  }, [patternIdx]);

  const resetPattern = () => {
    setUserPoints([]);
    setAccuracy(null);
    setShowResult(false);
    drawPattern();

    // Create checkpoint zones around each pattern point
    const canvas = canvasRef.current;
    const pts = patterns[patternIdx % patterns.length].points;
    setCheckpoints(pts.map(p => ({
      x: p.x * canvas.width, y: p.y * canvas.height, hit: false
    })));
  };

  const drawPattern = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#faf5ff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const pts = patterns[patternIdx % patterns.length].points;

    // Draw dashed guide line
    ctx.beginPath();
    ctx.setLineDash([10, 10]);
    ctx.strokeStyle = '#c4b5fd';
    ctx.lineWidth = 3;
    pts.forEach((p, i) => {
      const x = p.x * canvas.width, y = p.y * canvas.height;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw checkpoint dots
    pts.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x * canvas.width, p.y * canvas.height, 8, 0, Math.PI * 2);
      ctx.fillStyle = '#8b5cf6';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(p.x * canvas.width, p.y * canvas.height, 20, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(139,92,246,0.2)';
      ctx.lineWidth = 2;
      ctx.stroke();
    });
  };

  const getPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: cx - rect.left, y: cy - rect.top };
  };

  const startDraw = (e) => {
    setIsDrawing(true);
    const ctx = canvasRef.current.getContext('2d');
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    setUserPoints([pos]);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const ctx = canvasRef.current.getContext('2d');
    const pos = getPos(e);
    ctx.strokeStyle = '#7c3aed';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();

    setUserPoints(prev => [...prev, pos]);

    // Check if user passed near a checkpoint
    setCheckpoints(prev => prev.map(cp => {
      const dist = Math.sqrt((pos.x - cp.x) ** 2 + (pos.y - cp.y) ** 2);
      if (dist < 25) return { ...cp, hit: true };
      return cp;
    }));
  };

  const stopDraw = () => {
    setIsDrawing(false);
    calculateAccuracy();
  };

  const calculateAccuracy = () => {
    const canvas = canvasRef.current;
    const pts = patterns[patternIdx % patterns.length].points;

    // 1. How many checkpoints were hit
    const hitsCount = checkpoints.filter(cp => cp.hit).length;
    const checkpointAccuracy = (hitsCount / checkpoints.length) * 100;

    // 2. Average distance from user points to nearest pattern line segment
    let totalDist = 0;
    const patternPixels = pts.map(p => ({ x: p.x * canvas.width, y: p.y * canvas.height }));

    userPoints.forEach(up => {
      let minDist = Infinity;
      for (let i = 0; i < patternPixels.length - 1; i++) {
        const d = pointToSegmentDist(up, patternPixels[i], patternPixels[i + 1]);
        if (d < minDist) minDist = d;
      }
      totalDist += minDist;
    });

    const avgDist = userPoints.length > 0 ? totalDist / userPoints.length : 100;
    const proximityScore = Math.max(0, 100 - avgDist * 2);

    // Combined accuracy
    const finalAccuracy = Math.round(checkpointAccuracy * 0.5 + proximityScore * 0.5);
    setAccuracy(Math.min(100, Math.max(0, finalAccuracy)));
    setShowResult(true);
  };

  const pointToSegmentDist = (p, a, b) => {
    const dx = b.x - a.x, dy = b.y - a.y;
    const lenSq = dx * dx + dy * dy;
    if (lenSq === 0) return Math.sqrt((p.x - a.x) ** 2 + (p.y - a.y) ** 2);
    let t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / lenSq;
    t = Math.max(0, Math.min(1, t));
    const px = a.x + t * dx, py = a.y + t * dy;
    return Math.sqrt((p.x - px) ** 2 + (p.y - py) ** 2);
  };

  const nextPattern = () => {
    setPatternIdx(prev => prev + 1);
  };

  const getGrade = (acc) => {
    if (acc >= 90) return { text: 'Perfect! 🌟', color: '#16a34a' };
    if (acc >= 70) return { text: 'Great! ✨', color: '#2563eb' };
    if (acc >= 50) return { text: 'Good try! 👍', color: '#d97706' };
    return { text: 'Keep practicing! 💪', color: '#dc2626' };
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-2 bg-white/50 border-b border-border-custom">
        <span className="text-xs font-bold text-purple-600">
          🌀 Pattern {(patternIdx % patterns.length) + 1}/{patterns.length}: {patterns[patternIdx % patterns.length].name}
        </span>
        <div className="flex gap-2">
          {checkpoints.map((cp, i) => (
            <div key={i} className="w-3 h-3 rounded-full"
              style={{ background: cp.hit ? '#8b5cf6' : '#e5e7eb' }} />
          ))}
        </div>
      </div>

      <div className="flex-1 relative">
        <canvas ref={canvasRef} className="w-full h-full cursor-crosshair"
          onMouseDown={startDraw} onMouseMove={draw}
          onMouseUp={stopDraw} onMouseLeave={() => isDrawing && stopDraw()}
          onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={stopDraw} />

        {/* Accuracy Result Overlay */}
        {showResult && accuracy !== null && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
            <div className="text-center p-8">
              <div className="text-6xl font-extrabold mb-2" style={{ color: getGrade(accuracy).color }}>
                {accuracy}%
              </div>
              <p className="text-lg font-bold mb-1" style={{ color: getGrade(accuracy).color }}>
                {getGrade(accuracy).text}
              </p>
              <p className="text-xs text-text-muted mb-4">
                {checkpoints.filter(c => c.hit).length}/{checkpoints.length} checkpoints hit
              </p>
              <button onClick={nextPattern}
                className="px-6 py-3 bg-purple-500 text-white rounded-xl font-semibold text-sm border-none cursor-pointer hover:bg-purple-600 transition-all">
                Next Pattern →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatternTracing;
