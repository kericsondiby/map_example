import { useState, useEffect } from "react";

function QuorumBadge({ present = 7, total = 12, required = 7 }) {
  const [tick, setTick] = useState(0);
  useEffect(() => { const t = setTimeout(() => setTick(1), 80); return () => clearTimeout(t); }, []);

  const reached = present >= required;
  const missing = Math.max(0, required - present);
  const accent = reached ? "#4ade80" : "#fbbf24";

  const R = 11, sw = 2.5, size = 30, cx = 15, cy = 15;
  const circ = 2 * Math.PI * R;
  const dash = circ * Math.min(tick ? present / required : 0, 1);
  const tickAngle = -Math.PI / 2;
  const tx1 = cx + (R - 4) * Math.cos(tickAngle);
  const ty1 = cy + (R - 4) * Math.sin(tickAngle);
  const tx2 = cx + (R + 3) * Math.cos(tickAngle);
  const ty2 = cy + (R + 3) * Math.sin(tickAngle);

  return (
    <span className="inline-flex items-center gap-2 rounded-full pl-1.5 pr-3 py-1.5 border border-white/10 bg-gray-950 relative overflow-hidden">
      <span className="absolute inset-0 rounded-full pointer-events-none opacity-20" style={{
        background: `radial-gradient(ellipse at 20% 50%, ${reached ? "rgba(74,222,128,0.5)" : "rgba(251,191,36,0.5)"} 0%, transparent 70%)`,
      }} />

      <svg style={{ transform: "rotate(-90deg)", flexShrink: 0 }} width={size} height={size}>
        <circle cx={cx} cy={cy} r={R} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={sw} />
        <circle cx={cx} cy={cy} r={R} fill="none" stroke={accent} strokeWidth={sw}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.75s cubic-bezier(0.4,0,0.2,1), stroke 0.4s" }} />
        <circle cx={cx} cy={cy} r={R} fill="none" stroke={accent} strokeWidth={sw + 2}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" opacity={0.18}
          style={{ transition: "stroke-dasharray 0.75s cubic-bezier(0.4,0,0.2,1), stroke 0.4s" }} />
        <line x1={tx1} y1={ty1} x2={tx2} y2={ty2}
          stroke="rgba(255,255,255,0.28)" strokeWidth={1.5} strokeLinecap="round" />
        <text x={cx} y={cy + 0.5} textAnchor="middle" dominantBaseline="middle" fill={accent}
          style={{ fontFamily: "monospace", fontSize: "7px", transform: "rotate(90deg)", transformOrigin: `${cx}px ${cy}px`, transition: "fill 0.4s" }}>
          {present}
        </text>
      </svg>

      <span className="w-px h-5 bg-white/10 mx-1 shrink-0" />

      <span className="flex flex-col leading-none gap-0.5">
        <span className="font-mono text-xs tracking-tight text-white/90">
          {present}<span className="text-white/25">/{total}</span>
        </span>
        <span className="text-[0.55rem] uppercase tracking-widest font-semibold" style={{ color: accent }}>
          {reached ? "Quorum" : `−${missing} manquant${missing > 1 ? "s" : ""}`}
        </span>
      </span>

      <span className="text-[0.6rem] font-bold tracking-wide uppercase px-2 py-0.5 rounded-full border" style={{
        color: accent,
        background: reached ? "rgba(74,222,128,0.12)" : "rgba(251,191,36,0.10)",
        borderColor: reached ? "rgba(74,222,128,0.25)" : "rgba(251,191,36,0.22)",
      }}>
        {reached ? "✓" : "…"}
      </span>
    </span>
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <QuorumBadge present={7} total={12} required={7} />
    </div>
  );
}
