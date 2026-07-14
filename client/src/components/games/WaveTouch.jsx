import { useRef, useEffect, useState } from 'react';

const WaveTouch = () => {
  const canvasRef = useRef(null);
  const [ripples, setRipples] = useState([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animId;

    const draw = () => {
      ctx.fillStyle = 'rgba(224, 242, 254, 0.15)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      setRipples(prev => prev.map(r => ({ ...r, radius: r.radius + 1.5, opacity: r.opacity - 0.005 })).filter(r => r.opacity > 0));

      ripples.forEach(r => {
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(96, 165, 250, ${r.opacity})`;
        ctx.lineWidth = 2;
        ctx.stroke();
      });

      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animId);
  }, [ripples]);

  const handleClick = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    setRipples(prev => [...prev, {
      x: e.clientX - rect.left, y: e.clientY - rect.top,
      radius: 5, opacity: 0.8
    }]);
  };

  return (
    <div className="relative w-full h-full" style={{ background: 'linear-gradient(180deg, #e0f2fe, #bae6fd)' }}>
      <canvas ref={canvasRef} onClick={handleClick} className="w-full h-full cursor-pointer" />
      <div className="absolute bottom-6 left-0 right-0 text-center text-sm text-blue-400 font-medium">
        Tap anywhere to create ripples 🌊
      </div>
    </div>
  );
};

export default WaveTouch;
