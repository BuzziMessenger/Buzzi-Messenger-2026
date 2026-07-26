import React, { useRef, useState, useEffect } from 'react';
import { Palette, Eraser, Trash2 } from 'lucide-react';
import { hiveAudio } from '../utils/audio';

interface Stroke {
  color: string;
  width: number;
  points: { x: number; y: number }[];
}

interface PaintDuelProps {
  strokes: Stroke[];
  onUploadStrokes: (strokes: Stroke[]) => void;
  isMultiplayer: boolean;
}

export const PaintDuel: React.FC<PaintDuelProps> = ({ strokes, onUploadStrokes, isMultiplayer }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [color, setColor] = useState('#000000');
  const [width, setWidth] = useState(3);
  const [isDrawing, setIsDrawing] = useState(false);
  const currentStroke = useRef<Stroke | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    strokes.forEach(stroke => {
      if (stroke.points.length === 0) return;
      ctx.beginPath();
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.width;
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      stroke.points.forEach(p => ctx.lineTo(p.x, p.y));
      ctx.stroke();
    });
  }, [strokes]);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    
    // Calculate scaling ratios
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    const { x, y } = getCoordinates(e);
    currentStroke.current = { color, width, points: [{ x, y }] };
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !currentStroke.current) return;
    const { x, y } = getCoordinates(e);
    currentStroke.current.points.push({ x, y });

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx && currentStroke.current.points.length > 1) {
      const points = currentStroke.current.points;
      const prev = points[points.length - 2];
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.moveTo(prev.x, prev.y);
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    if (isDrawing && currentStroke.current) {
      const newStrokes = [...strokes, currentStroke.current];
      onUploadStrokes(newStrokes);
    }
    setIsDrawing(false);
    currentStroke.current = null;
  };

  return (
    <div className="w-full flex flex-col gap-2">
      <div className="flex items-center justify-between bg-sky-50 p-1.5 rounded border border-sky-200">
        <div className="flex gap-1 items-center">
          <Palette className="w-4 h-4 text-sky-700" />
          <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-6 h-6 p-0 border-0 cursor-pointer" />
          <input type="range" min="1" max="15" value={width} onChange={(e) => setWidth(Number(e.target.value))} className="w-16" />
        </div>
        <button onClick={() => { hiveAudio.playNotification(); onUploadStrokes([]); }} className="text-red-500 hover:text-red-700 cursor-pointer p-1">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      
      <div className="bg-white border-2 border-stone-300 rounded shadow-inner overflow-hidden cursor-crosshair touch-none">
        <canvas
          ref={canvasRef}
          width={300}
          height={300}
          className="w-full h-auto aspect-square"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseOut={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
      </div>
    </div>
  );
};
