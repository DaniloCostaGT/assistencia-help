import { useCallback, useRef, useState, type PointerEvent } from 'react';

interface PatternLockProps {
  value?: number[];
  onChange?: (pattern: number[]) => void;
  readOnly?: boolean;
  size?: number;
}

const GRID = [0, 1, 2, 3, 4, 5, 6, 7, 8];
const VIEWBOX = 300;
const PAD = 50;
const STEP = 100;
const HIT_RADIUS = 28;

function dotCenter(index: number) {
  const row = Math.floor(index / 3);
  const col = index % 3;
  return { x: PAD + col * STEP, y: PAD + row * STEP };
}

export function PatternLock({ value, onChange, readOnly = false, size = 220 }: PatternLockProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [drawing, setDrawing] = useState(false);
  const [path, setPath] = useState<number[]>(value ?? []);
  const [pointerPos, setPointerPos] = useState<{ x: number; y: number } | null>(null);

  const toLocalPoint = useCallback((clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return null;
    return {
      x: ((clientX - rect.left) / rect.width) * VIEWBOX,
      y: ((clientY - rect.top) / rect.height) * VIEWBOX,
    };
  }, []);

  const findNearestDot = useCallback((x: number, y: number) => {
    for (const idx of GRID) {
      const c = dotCenter(idx);
      if (Math.hypot(c.x - x, c.y - y) < HIT_RADIUS) return idx;
    }
    return null;
  }, []);

  const handlePointerDown = (e: PointerEvent<SVGSVGElement>) => {
    if (readOnly) return;
    const point = toLocalPoint(e.clientX, e.clientY);
    if (!point) return;
    const dot = findNearestDot(point.x, point.y);
    if (dot === null) return;
    setDrawing(true);
    setPath([dot]);
    setPointerPos(point);
    svgRef.current?.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: PointerEvent<SVGSVGElement>) => {
    if (!drawing || readOnly) return;
    const point = toLocalPoint(e.clientX, e.clientY);
    if (!point) return;
    setPointerPos(point);
    const dot = findNearestDot(point.x, point.y);
    if (dot !== null) {
      setPath((prev) => (prev.includes(dot) ? prev : [...prev, dot]));
    }
  };

  const finish = () => {
    if (!drawing) return;
    setDrawing(false);
    setPointerPos(null);
    onChange?.(path);
  };

  const clear = () => {
    setPath([]);
    onChange?.([]);
  };

  const displayPath = readOnly ? value ?? [] : path;

  return (
    <div className="inline-flex flex-col items-center gap-3">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}
        width={size}
        height={size}
        className={`rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 select-none ${
          readOnly ? '' : 'touch-none cursor-pointer'
        }`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finish}
        onPointerLeave={finish}
      >
        {displayPath.length > 1 &&
          displayPath.slice(1).map((idx, i) => {
            const from = dotCenter(displayPath[i]);
            const to = dotCenter(idx);
            return (
              <line
                key={i}
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke="#2563eb"
                strokeWidth={6}
                strokeLinecap="round"
              />
            );
          })}
        {!readOnly &&
          drawing &&
          pointerPos &&
          displayPath.length > 0 &&
          (() => {
            const last = dotCenter(displayPath[displayPath.length - 1]);
            return (
              <line
                x1={last.x}
                y1={last.y}
                x2={pointerPos.x}
                y2={pointerPos.y}
                stroke="#2563eb"
                strokeWidth={6}
                strokeLinecap="round"
                opacity={0.45}
              />
            );
          })()}
        {GRID.map((idx) => {
          const c = dotCenter(idx);
          const active = displayPath.includes(idx);
          return (
            <g key={idx}>
              <circle
                cx={c.x}
                cy={c.y}
                r={active ? 14 : 10}
                className={active ? 'fill-blue-600' : 'fill-slate-300 dark:fill-slate-600'}
              />
              {active && (
                <circle cx={c.x} cy={c.y} r={22} fill="none" stroke="#2563eb" strokeWidth={2} opacity={0.35} />
              )}
            </g>
          );
        })}
      </svg>
      {!readOnly && (
        <button
          type="button"
          onClick={clear}
          className="text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
        >
          Limpar padrão
        </button>
      )}
      {readOnly && displayPath.length === 0 && (
        <p className="text-xs text-slate-400 dark:text-slate-500">Nenhum padrão registrado</p>
      )}
    </div>
  );
}
