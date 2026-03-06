import { useState, useEffect, useRef } from "react";

const STATUS_CONFIG = {
  "En cours":    { badge: "bg-blue-500/20 text-blue-200 border-blue-400/30",          bar: "from-blue-600 to-blue-400",     text: "text-blue-600",    pulse: true  },
  "Non démarré": { badge: "bg-slate-400/20 text-slate-200 border-slate-400/30",       bar: "from-slate-400 to-slate-300",   text: "text-slate-500",   pulse: false },
  "Terminé":     { badge: "bg-emerald-500/20 text-emerald-200 border-emerald-400/30", bar: "from-emerald-500 to-green-400", text: "text-emerald-600", pulse: false },
  "Suspendu":    { badge: "bg-orange-500/20 text-orange-200 border-orange-400/30",    bar: "from-orange-500 to-amber-400",  text: "text-orange-600",  pulse: false },
};

const TYPE_STYLES = {
  "Pilotage":            { style: "bg-indigo-50 text-indigo-700 border-indigo-200",    icon: "🧭" },
  "Développement":       { style: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200", icon: "💻" },
  "Sécurité":            { style: "bg-red-50 text-red-700 border-red-200",             icon: "🔒" },
  "Architecture":        { style: "bg-violet-50 text-violet-700 border-violet-200",    icon: "🏗️" },
  "Documentation":       { style: "bg-sky-50 text-sky-700 border-sky-200",             icon: "📄" },
  "Modélisation IA":     { style: "bg-cyan-50 text-cyan-700 border-cyan-200",          icon: "🤖" },
  "Déploiement":         { style: "bg-orange-50 text-orange-700 border-orange-200",    icon: "🚀" },
  "Chantier":            { style: "bg-yellow-50 text-yellow-700 border-yellow-200",    icon: "🔧" },
  "POC":                 { style: "bg-lime-50 text-lime-700 border-lime-200",          icon: "🧪" },
  "Run":                 { style: "bg-teal-50 text-teal-700 border-teal-200",          icon: "⚙️" },
  "Management":          { style: "bg-blue-50 text-blue-700 border-blue-200",          icon: "👔" },
  "Formation dispensée": { style: "bg-amber-50 text-amber-700 border-amber-200",       icon: "🎓" },
  "Formation reçue":     { style: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: "📚" },
  "Absence / Congés":    { style: "bg-rose-50 text-rose-700 border-rose-200",          icon: "🌴" },
};

function fmt(d) {
  return new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

const VISIBLE = 5;

function Avatar({ initials, gradient, tooltip }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      <div className={`w-8 h-8 text-[10px] bg-gradient-to-br ${gradient} rounded-full flex items-center justify-center font-bold text-white flex-shrink-0 border-2 border-white cursor-default transition-transform duration-150 hover:-translate-y-1`}>
        {initials}
      </div>
      {show && tooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-0.5 bg-slate-800 text-white text-[9px] rounded whitespace-nowrap z-50 shadow-lg pointer-events-none">
          {tooltip}
        </div>
      )}
    </div>
  );
}

function ProgressBar({ value, activeTasks, totalTasks, status }) {
  const [width, setWidth] = useState(0);
  const [count, setCount] = useState(0);
  const done = useRef(false);
  const cfg = STATUS_CONFIG[status];

  useEffect(() => {
    if (done.current) return;
    done.current = true;
    const t = setTimeout(() => {
      setWidth(value);
      let cur = 0;
      const tick = () => { cur = Math.min(cur + 2, value); setCount(cur); if (cur < value) requestAnimationFrame(tick); };
      requestAnimationFrame(tick);
    }, 250);
    return () => clearTimeout(t);
  }, [value]);

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Progression</span>
        <span className={`text-xl font-bold ${cfg.text}`} style={{ fontFamily: "'Syne',sans-serif" }}>{count}%</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${cfg.bar}`}
          style={{ width: `${width}%`, transition: "width 1.2s cubic-bezier(.22,1,.36,1)" }}
        />
      </div>
      <div className="flex items-center gap-2 mt-2">
        <span className="text-[10px] font-medium bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md">
          🔵 {activeTasks} actives
        </span>
        <span className="text-slate-200">/</span>
        <span className="text-[10px] text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md">
          {totalTasks} tâches totales
        </span>
      </div>
    </div>
  );
}

/**
 * ProjectCard
 *
 * Props:
 *   name        {string}  - Nom du projet
 *   status      {string}  - "En cours" | "Non démarré" | "Terminé" | "Suspendu"
 *   type        {string}  - Voir TYPE_STYLES pour la liste complète
 *   start       {string}  - Date de début (YYYY-MM-DD)
 *   end         {string}  - Date de fin   (YYYY-MM-DD)
 *   activeTasks {number}  - Nombre de tâches actives
 *   totalTasks  {number}  - Nombre total de tâches
 *   progress    {number}  - Pourcentage de progression (0–100)
 *   owner       {object}  - { name, initials, gradient }
 *   members     {array}   - [{ name, initials, role, gradient }]
 */
export default function ProjectCard({
  name        = "Modernisation Complète de l'Infrastructure Digitale et Refonte UX",
  status      = "En cours",
  type        = "Développement",
  start       = "2026-01-10",
  end         = "2026-04-30",
  activeTasks = 8,
  totalTasks  = 24,
  progress    = 62,
  owner       = { name: "Konan Adjé", initials: "KA", gradient: "from-indigo-500 to-violet-500" },
  members     = [
    { name: "Bamba Koné",       initials: "BK", role: "Dev Frontend",    gradient: "from-amber-400 to-red-500"     },
    { name: "Fatoumata Diallo", initials: "FD", role: "Dev Backend",      gradient: "from-emerald-400 to-cyan-500"  },
    { name: "Yves Méa",         initials: "YM", role: "UX Designer",      gradient: "from-blue-400 to-indigo-500"   },
    { name: "Mariam Sylla",     initials: "MS", role: "QA Engineer",      gradient: "from-pink-400 to-rose-500"     },
    { name: "Sékou Touré",      initials: "ST", role: "DevOps",           gradient: "from-orange-400 to-yellow-400" },
    { name: "Awa Bah",          initials: "AB", role: "Dev Mobile",       gradient: "from-violet-500 to-pink-500"   },
    { name: "N'Golo Kamara",    initials: "NK", role: "Analyste Données", gradient: "from-cyan-400 to-blue-500"     },
    { name: "Aminata Lamine",   initials: "AL", role: "Scrum Master",     gradient: "from-green-500 to-emerald-400" },
    { name: "Omar Diarra",      initials: "OD", role: "Architecte",       gradient: "from-red-500 to-orange-400"    },
    { name: "Pathé Barry",      initials: "PB", role: "Dev Fullstack",    gradient: "from-slate-700 to-slate-500"   },
    { name: "Issa Traoré",      initials: "IT", role: "Sécurité",         gradient: "from-violet-700 to-blue-500"   },
  ],
}) {
  const [open, setOpen] = useState(false);
  const cfg      = STATUS_CONFIG[status]  ?? STATUS_CONFIG["Non démarré"];
  const typeConf = TYPE_STYLES[type]      ?? { style: "bg-slate-50 text-slate-600 border-slate-200", icon: "📁" };
  const overflow      = members.length - VISIBLE;
  const visibleMembers = members.slice(0, VISIBLE);

  return (
    <div className="w-[480px] max-w-full bg-white rounded-2xl shadow-xl overflow-hidden" style={{ fontFamily: "'DM Sans',sans-serif" }}>

      {/* ── HEADER ── */}
      <div className="relative overflow-hidden px-7 pt-6 pb-5"
        style={{ background: "linear-gradient(135deg,#0f2951 0%,#1a4a8a 100%)" }}>
        <div className="absolute -right-10 -top-10 w-44 h-44 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute right-10 -bottom-14 w-28 h-28 rounded-full bg-white/[0.04] pointer-events-none" />

        {/* Nom + statut */}
        <div className="relative z-10 flex items-start justify-between gap-3 min-w-0 mb-3">
          <h2
            title={name}
            className="font-extrabold text-white leading-snug min-w-0"
            style={{
              fontFamily: "'Syne',sans-serif",
              fontSize: "clamp(.9rem,3vw,1.2rem)",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              wordBreak: "break-word",
            }}
          >
            {name}
          </h2>
          <span className={`flex-shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium border ${cfg.badge}`}>
            <span className={`w-1.5 h-1.5 rounded-full bg-current ${cfg.pulse ? "animate-pulse" : ""}`} />
            {status}
          </span>
        </div>

        {/* Dates */}
        <div className="relative z-10 inline-flex items-center gap-1.5 text-white/60 text-[11px] bg-white/10 px-2.5 py-1 rounded-lg">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <rect x="3" y="4" width="18" height="18" rx="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          {fmt(start)} → {fmt(end)}
        </div>
      </div>

      {/* ── PROGRESSION ── */}
      <div className="px-7 pt-5 pb-1">
        <ProgressBar value={progress} activeTasks={activeTasks} totalTasks={totalTasks} status={status} />
      </div>

      <div className="mx-7 my-4 h-px bg-slate-100" />

      {/* ── INFO GRID ── */}
      <div className="grid grid-cols-2 px-7">
        {[
          {
            label: "Type",
            node: (
              <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md border ${typeConf.style}`}>
                <span>{typeConf.icon}</span>{type}
              </span>
            ),
          },
          {
            label: "Statut",
            node: <span className={`text-[13px] font-semibold ${cfg.text}`}>{status}</span>,
          },
          {
            label: "Date début",
            node: <span className="text-[13px] font-medium text-slate-700">{fmt(start)}</span>,
          },
          {
            label: "Date fin",
            node: <span className="text-[13px] font-medium text-slate-700">{fmt(end)}</span>,
          },
        ].map((item, i, arr) => (
          <div
            key={item.label}
            className={[
              "py-3.5",
              i % 2 === 0 ? "pr-5 border-r border-slate-100" : "pl-5",
              i < arr.length - 2 ? "border-b border-slate-100" : "",
            ].join(" ")}
          >
            <p className="text-[9px] font-medium text-slate-400 uppercase tracking-widest mb-1.5">{item.label}</p>
            {item.node}
          </div>
        ))}
      </div>

      <div className="mx-7 my-4 h-px bg-slate-100" />

      {/* ── PRODUCT OWNER ── */}
      <div className="flex items-center gap-3 px-7 pb-4">
        <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${owner.gradient} flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm`}>
          {owner.initials}
        </div>
        <div>
          <p className="text-[9px] text-slate-400 uppercase tracking-widest mb-0.5">Product Owner</p>
          <p className="text-[13px] font-medium text-slate-700">{owner.name}</p>
        </div>
      </div>

      <div className="mx-7 h-px bg-slate-100" />

      {/* ── ÉQUIPE ── */}
      <div className="px-7 pt-4 pb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[9px] font-medium text-slate-400 uppercase tracking-widest">
            Équipe · {members.length} membres
          </span>
          {members.length > VISIBLE && (
            <button
              onClick={() => setOpen(o => !o)}
              className="flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-500 transition-colors"
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}>
                <polyline points="6 9 12 15 18 9"/>
              </svg>
              {open ? "Réduire" : "Voir tous"}
            </button>
          )}
        </div>

        {/* Avatars empilés */}
        <div className="flex items-center">
          {visibleMembers.map((m, i) => (
            <div key={m.name} className="-ml-2.5 first:ml-0" style={{ zIndex: VISIBLE - i }}>
              <Avatar initials={m.initials} gradient={m.gradient} tooltip={m.name} />
            </div>
          ))}
          {overflow > 0 && (
            <div className="-ml-2.5 w-8 h-8 rounded-full border-2 border-white bg-slate-100 text-slate-500 text-[10px] font-semibold flex items-center justify-center hover:bg-slate-200 transition-colors cursor-default">
              +{overflow}
            </div>
          )}
        </div>

        {/* Liste dépliable */}
        {open && (
          <div className="mt-3 flex flex-col gap-1.5 max-h-52 overflow-y-auto pr-0.5" style={{ scrollbarWidth: "thin" }}>
            {members.map(m => (
              <div key={m.name} className="flex items-center gap-2.5 px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl hover:bg-slate-100 transition-colors">
                <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${m.gradient} flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0`}>
                  {m.initials}
                </div>
                <div>
                  <p className="text-[12px] font-medium text-slate-700 leading-tight">{m.name}</p>
                  <p className="text-[10px] text-slate-400">{m.role}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
