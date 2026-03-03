import { useState, useEffect } from "react";

function QuorumBadge({ present = 7, total = 12, required = 7 }) {
  const [tick, setTick] = useState(0);
  useEffect(() => { const t = setTimeout(() => setTick(1), 80); return () => clearTimeout(t); }, []);

  const reached = present >= required;
  const missing = Math.max(0, required - present);

  const green  = "#4ade80";
  const amber  = "#fbbf24";
  const accent = reached ? green : amber;
  const glowColor = reached ? "rgba(74,222,128,0.35)" : "rgba(251,191,36,0.35)";

  const R = 11, sw = 2.5, size = 30, cx = 15, cy = 15;
  const circ = 2 * Math.PI * R;
  const fillRatio = Math.min(tick ? present / required : 0, 1);
  const dash = circ * fillRatio;

  const tickAngle = -Math.PI / 2;
  const tx1 = cx + (R - 4) * Math.cos(tickAngle);
  const ty1 = cy + (R - 4) * Math.sin(tickAngle);
  const tx2 = cx + (R + 3) * Math.cos(tickAngle);
  const ty2 = cy + (R + 3) * Math.sin(tickAngle);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700&family=JetBrains+Mono:wght@300;400&display=swap');

        .qbadge-inner {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #0d0f14;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 40px;
          padding: 5px 14px 5px 6px;
          position: relative;
          overflow: hidden;
        }

        .qbadge-inner::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 40px;
          background: radial-gradient(ellipse at 20% 50%, var(--glow) 0%, transparent 70%);
          opacity: 0.18;
          pointer-events: none;
        }

        .qbadge-count {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.78rem;
          font-weight: 400;
          letter-spacing: -0.02em;
          color: #f0ede8;
          display: flex;
          align-items: baseline;
          gap: 1px;
        }

        .qbadge-count em {
          font-style: normal;
          color: rgba(255,255,255,0.22);
          font-size: 0.72rem;
        }

        .qbadge-label {
          font-family: 'Syne', sans-serif;
          font-size: 0.55rem;
          letter-spacing: 0.13em;
          text-transform: uppercase;
          font-weight: 600;
          margin-top: 2px;
          transition: color 0.4s;
        }

        .qsep {
          width: 1px;
          height: 20px;
          background: rgba(255,255,255,0.08);
          margin: 0 4px;
          flex-shrink: 0;
        }

        .qbadge-status {
          font-family: 'Syne', sans-serif;
          font-size: 0.6rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 2px 8px;
          border-radius: 99px;
          transition: background 0.4s, color 0.4s;
        }

        .qdot {
          border-radius: 99px;
          transition: background 0.35s, box-shadow 0.35s, width 0.35s, height 0.35s;
        }
      `}</style>

      <span style={{ display: "inline-flex" }}>
        <span className="qbadge-inner" style={{ "--glow": glowColor }}>

          {/* Arc */}
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
            <text x={cx} y={cy + 0.5} textAnchor="middle" dominantBaseline="middle"
              fill={accent}
              style={{
                fontFamily: "'JetBrains Mono', monospace", fontSize: "7px", fontWeight: 400,
                transform: "rotate(90deg)", transformOrigin: `${cx}px ${cy}px`, transition: "fill 0.4s",
              }}>
              {present}
            </text>
          </svg>

          <div className="qsep" />

          {/* Text info */}
          <div style={{ display: "flex", flexDirection: "column", gap: 0, lineHeight: 1 }}>
            <span className="qbadge-count">
              {present}<em>/{total}</em>
            </span>
            <span className="qbadge-label" style={{ color: accent }}>
              {reached ? "Quorum" : `−${missing} manquant${missing > 1 ? "s" : ""}`}
            </span>
          </div>

          {/* Status pill */}
          <span className="qbadge-status" style={{
            background: reached ? "rgba(74,222,128,0.12)" : "rgba(251,191,36,0.1)",
            color: accent,
            border: `1px solid ${reached ? "rgba(74,222,128,0.25)" : "rgba(251,191,36,0.22)"}`,
          }}>
            {reached ? "✓" : "…"}
          </span>

        </span>
      </span>
    </>
  );
}

export default function App() {
  const [present, setPresent] = useState(7);
  const total = 12, required = 7;

  return (
    <div style={{
      minHeight: "100vh",
      background: "#080a0f",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: "2.5rem",
    }}>
      <QuorumBadge present={present} total={total} required={required} />


    </div>
  );
}
