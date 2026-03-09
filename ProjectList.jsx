import { useState } from "react";

const projects = [
  { id: 1, nom_projet: "Refonte Portail Client",    color: "#7c3aed", initials: "RC", progress: 72 },
  { id: 2, nom_projet: "Migration Cloud AWS",        color: "#0284c7", initials: "MC", progress: 45 },
  { id: 3, nom_projet: "Tableau de Bord Analytics", color: "#059669", initials: "TB", progress: 88 },
  { id: 4, nom_projet: "Application Mobile RH",     color: "#ea580c", initials: "AM", progress: 30 },
  { id: 5, nom_projet: "API Gateway Sécurisée",     color: "#db2777", initials: "AG", progress: 60 },
  { id: 6, nom_projet: "Système de Facturation",    color: "#ca8a04", initials: "SF", progress: 15 },
];

function StatusDot({ progress }) {
  const color =
    progress >= 75 ? "#059669" :
    progress >= 40 ? "#0284c7" :
    "#f59e0b";
  return (
    <span
      className="inline-block w-2 h-2 rounded-full flex-shrink-0"
      style={{ background: color, boxShadow: `0 0 0 3px ${color}22` }}
    />
  );
}

export default function ProjectList() {
  const [search, setSearch]     = useState("");
  const [selected, setSelected] = useState(null);

  const filtered = projects.filter((p) =>
    p.nom_projet.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Geist+Mono:wght@300;400;500&display=swap');
        .font-jakarta  { font-family: 'Plus Jakarta Sans', sans-serif; }
        .font-geist    { font-family: 'Geist Mono', monospace; }

        /* Blob animation */
        @keyframes blob {
          0%,100% { transform: translate(0,0) scale(1); }
          50%      { transform: translate(20px,14px) scale(1.08); }
        }
        .animate-blob { animation: blob 10s ease-in-out infinite; }
        .animation-delay-3 { animation-delay: 3s; }

        /* Search */
        .pl-search::placeholder { color: #94a3b8; }
        .pl-search:focus {
          outline: none;
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.12);
        }

        /* Row child transitions on hover/selected */
        .pl-row:hover .pl-bar      { opacity: 1; }
        .pl-row.is-sel .pl-bar     { opacity: 1; }
        .pl-row:hover .pl-name     { color: #0f172a; }
        .pl-row.is-sel .pl-name    { color: #0f172a; }
        .pl-row:hover .pl-arrow    { opacity: 1; transform: translateX(0); }
        .pl-row:hover .pl-mini-bar { transform: scaleX(1); }
        .pl-row.is-sel .pl-mini-bar { transform: scaleX(1); }

        /* Gradient progress fill */
        .prog-fill {
          height: 100%;
          border-radius: 99px;
          background: linear-gradient(90deg, #6366f1, #38bdf8);
          transition: width 0.6s cubic-bezier(.22,1,.36,1);
        }

        /* Shimmer on selected row */
        @keyframes shimmer {
          from { background-position: -200% center; }
          to   { background-position: 200% center; }
        }
        .pl-row.is-sel {
          background: linear-gradient(135deg, #fafbff 0%, #f5f3ff 100%);
        }
      `}</style>

      <div className="font-jakarta w-full relative" style={{ maxWidth: 560 }}>

        {/* Blobs */}
        <div
          className="animate-blob absolute rounded-full pointer-events-none"
          style={{ width: 300, height: 300, background: "#e0e7ff", filter: "blur(80px)", opacity: 0.5, top: -120, left: -100 }}
        />
        <div
          className="animate-blob animation-delay-3 absolute rounded-full pointer-events-none"
          style={{ width: 220, height: 220, background: "#bae6fd", filter: "blur(80px)", opacity: 0.45, bottom: -90, right: -70 }}
        />

        {/* ── CARD ── */}
        <div
          className="relative overflow-hidden rounded-3xl bg-white border border-slate-200/80"
          style={{ boxShadow: "0 2px 4px rgba(0,0,0,0.03), 0 12px 40px rgba(0,0,0,0.07), 0 0 0 1px rgba(255,255,255,0.8) inset" }}
        >

          {/* Top gradient accent */}
          <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: "linear-gradient(90deg, #6366f1, #38bdf8, #34d399)" }} />

          {/* ── HEADER ── */}
          <div className="flex items-start justify-between px-7 pt-8 pb-6 border-b border-slate-100">
            <div>
              <div className="font-geist flex items-center gap-2 mb-3">
                <span className="text-[9px] tracking-[3px] uppercase text-slate-400">Gestionnaire</span>
                <span className="w-1 h-1 rounded-full bg-slate-300 inline-block" />
                <span className="text-[9px] tracking-[2px] uppercase text-indigo-400">Actif</span>
              </div>
              <h1 className="text-[26px] font-bold tracking-[-0.5px] text-slate-900 leading-none">
                Mes Projets
              </h1>
              <p className="font-geist mt-2 text-[11px] text-slate-400">
                {filtered.length} projet{filtered.length > 1 ? "s" : ""} · mis à jour aujourd'hui
              </p>
            </div>

            {/* Stat ring */}
            <div className="relative flex-shrink-0">
              <svg width="64" height="64" viewBox="0 0 64 64" className="-rotate-90">
                <circle cx="32" cy="32" r="26" fill="none" stroke="#f1f5f9" strokeWidth="5" />
                <circle
                  cx="32" cy="32" r="26" fill="none"
                  stroke="url(#ringGrad)" strokeWidth="5"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 26}`}
                  strokeDashoffset={`${2 * Math.PI * 26 * (1 - filtered.length / projects.length)}`}
                  style={{ transition: "stroke-dashoffset 0.5s ease" }}
                />
                <defs>
                  <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#38bdf8" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-jakarta text-[18px] font-extrabold leading-none text-slate-900">{filtered.length}</span>
              </div>
            </div>
          </div>

          {/* ── SEARCH ── */}
          <div className="relative px-6 py-4">
            <svg className="absolute left-10 top-1/2 -translate-y-1/2 pointer-events-none" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              className="pl-search font-geist w-full bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-[13px] py-3 pr-4 pl-10 transition-all duration-200"
              placeholder="Rechercher un projet..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                className="absolute right-10 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs transition-colors"
                onClick={() => setSearch("")}
              >✕</button>
            )}
          </div>

          {/* ── COL HEADERS ── */}
          <div className="font-geist flex items-center px-7 pb-2 text-[9px] tracking-[2px] text-slate-300 uppercase">
            <span className="w-8">No</span>
            <span className="flex-1">Nom du projet</span>
            <span className="w-16 text-right">Avancée</span>
          </div>

          {/* ── ROWS ── */}
          <div>
            {filtered.length === 0 ? (
              <div className="font-geist flex flex-col items-center justify-center py-14 gap-3">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <span className="text-[12px] text-slate-300 tracking-wide">Aucun résultat pour « {search} »</span>
              </div>
            ) : (
              filtered.map((p, i) => {
                const isSel = selected === p.id;
                return (
                  <div
                    key={p.id}
                    className={`pl-row relative flex items-center gap-4 px-7 py-4 cursor-pointer transition-all duration-200 border-b border-slate-50 last:border-b-0 ${isSel ? "is-sel" : "hover:bg-slate-50/80"}`}
                    onClick={() => setSelected(isSel ? null : p.id)}
                  >
                    {/* Left accent bar */}
                    <div
                      className="pl-bar absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full opacity-0 transition-all duration-200"
                      style={{ background: p.color }}
                    />

                    {/* Avatar */}
                    <div
                      className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-white text-[11px] font-bold tracking-wide shadow-sm"
                      style={{ background: `linear-gradient(135deg, ${p.color}dd, ${p.color}88)` }}
                    >
                      {p.initials}
                    </div>

                    {/* Name + mini progress bar */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <StatusDot progress={p.progress} />
                        <span className="pl-name font-semibold text-[13.5px] text-slate-500 transition-colors duration-200 truncate">
                          {p.nom_projet}
                        </span>
                      </div>
                      <div className="h-[3px] w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="prog-fill pl-mini-bar origin-left"
                          style={{ width: `${p.progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Progress % */}
                    <div className="font-geist text-right flex-shrink-0 w-16">
                      <span className="text-[13px] font-medium" style={{ color: p.color }}>
                        {p.progress}%
                      </span>
                    </div>

                    {/* Arrow */}
                    <span className="pl-arrow text-slate-300 text-sm opacity-0 -translate-x-1 transition-all duration-200">
                      →
                    </span>
                  </div>
                );
              })
            )}
          </div>

          {/* ── FOOTER ── */}
          <div className="flex items-center justify-between px-7 py-4 border-t border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-3">
              {[
                { label: "Avancé", color: "#059669" },
                { label: "En cours", color: "#0284c7" },
                { label: "Démarrage", color: "#f59e0b" },
              ].map((s) => (
                <div key={s.label} className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: s.color }} />
                  <span className="font-geist text-[9px] text-slate-400 tracking-wide">{s.label}</span>
                </div>
              ))}
            </div>
            <span className="font-geist text-[10px] text-slate-400">
              {selected ? `#${String(selected).padStart(2,"0")} sélectionné` : `${filtered.length} / ${projects.length}`}
            </span>
          </div>

        </div>
      </div>
    </div>
  );
}
