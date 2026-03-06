import { useState, useEffect, useRef } from "react";

/* ─────────────────────────────────────────────
   DONNÉES
───────────────────────────────────────────── */
const PROJECTS = [
  {
    id: 1,
    name: "Modernisation Complète de l'Infrastructure Digitale et Refonte UX",
    status: "En cours",
    type: "Développement",
    start: "2026-01-10", end: "2026-04-30",
    activeTasks: 8, totalTasks: 24, progress: 62,
    owner: { name: "Konan Adjé", initials: "KA", gradient: "from-indigo-500 to-violet-500" },
    members: [
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
  },
  {
    id: 2,
    name: "App Mobile CRM",
    status: "Non démarré",
    type: "Déploiement",
    start: "2026-03-15", end: "2026-08-20",
    activeTasks: 0, totalTasks: 18, progress: 0,
    owner: { name: "Bamba Koné", initials: "BK", gradient: "from-amber-400 to-red-500" },
    members: [
      { name: "Yves Méa",     initials: "YM", role: "UX Designer",  gradient: "from-blue-400 to-indigo-500" },
      { name: "Mariam Sylla", initials: "MS", role: "QA Engineer",  gradient: "from-pink-400 to-rose-500"   },
      { name: "Pathé Barry",  initials: "PB", role: "Dev Fullstack", gradient: "from-slate-700 to-slate-500" },
    ],
  },
  {
    id: 3,
    name: "Migration Base de Données PostgreSQL vers Cloud",
    status: "Terminé",
    type: "Architecture",
    start: "2025-10-01", end: "2026-01-15",
    activeTasks: 0, totalTasks: 12, progress: 100,
    owner: { name: "Fatoumata Diallo", initials: "FD", gradient: "from-emerald-400 to-cyan-500" },
    members: [
      { name: "Sékou Touré",   initials: "ST", role: "DevOps",          gradient: "from-orange-400 to-yellow-400" },
      { name: "Omar Diarra",   initials: "OD", role: "Architecte",      gradient: "from-red-500 to-orange-400"    },
      { name: "Issa Traoré",   initials: "IT", role: "Sécurité",        gradient: "from-violet-700 to-blue-500"   },
      { name: "N'Golo Kamara", initials: "NK", role: "Analyste Données",gradient: "from-cyan-400 to-blue-500"     },
      { name: "Pathé Barry",   initials: "PB", role: "Dev Fullstack",   gradient: "from-slate-700 to-slate-500"   },
    ],
  },
  {
    id: 4,
    name: "Tableau de Bord Analytics",
    status: "En cours",
    type: "Modélisation IA",
    start: "2026-02-01", end: "2026-05-31",
    activeTasks: 5, totalTasks: 16, progress: 38,
    owner: { name: "Yves Méa", initials: "YM", gradient: "from-blue-400 to-indigo-500" },
    members: [
      { name: "Aminata Lamine",   initials: "AL", role: "Scrum Master",     gradient: "from-green-500 to-emerald-400" },
      { name: "N'Golo Kamara",    initials: "NK", role: "Analyste Données", gradient: "from-cyan-400 to-blue-500"     },
      { name: "Fatoumata Diallo", initials: "FD", role: "Dev Backend",      gradient: "from-emerald-400 to-cyan-500"  },
    ],
  },
  {
    id: 5,
    name: "Intégration API Paiement",
    status: "Suspendu",
    type: "POC",
    start: "2026-04-01", end: "2026-06-15",
    activeTasks: 0, totalTasks: 9, progress: 15,
    owner: { name: "Mariam Sylla", initials: "MS", gradient: "from-pink-400 to-rose-500" },
    members: [
      { name: "Bamba Koné",  initials: "BK", role: "Dev Frontend", gradient: "from-amber-400 to-red-500"   },
      { name: "Pathé Barry", initials: "PB", role: "Dev Fullstack", gradient: "from-slate-700 to-slate-500" },
    ],
  },
  {
    id: 6,
    name: "Audit Sécurité Système",
    status: "Suspendu",
    type: "Sécurité",
    start: "2025-12-01", end: "2026-02-28",
    activeTasks: 0, totalTasks: 7, progress: 20,
    owner: { name: "Issa Traoré", initials: "IT", gradient: "from-violet-700 to-blue-500" },
    members: [
      { name: "Sékou Touré", initials: "ST", role: "DevOps",     gradient: "from-orange-400 to-yellow-400" },
      { name: "Omar Diarra", initials: "OD", role: "Architecte", gradient: "from-red-500 to-orange-400"    },
    ],
  },
];

/* ─────────────────────────────────────────────
   CONFIG STATUTS
───────────────────────────────────────────── */
const STATUS = {
  "En cours":    { badge: "bg-blue-500/[.15] text-blue-300 border border-blue-400/30",          bar: "from-blue-600 to-blue-400",       text: "text-blue-600",    pulse: true  },
  "Non démarré": { badge: "bg-slate-400/[.15] text-slate-300 border border-slate-400/30",       bar: "from-slate-300 to-slate-200",     text: "text-slate-400",   pulse: false },
  "Terminé":     { badge: "bg-emerald-500/[.15] text-emerald-300 border border-emerald-400/30", bar: "from-emerald-500 to-green-400",   text: "text-emerald-600", pulse: false },
  "Suspendu":    { badge: "bg-orange-500/[.15] text-orange-300 border border-orange-400/30",    bar: "from-orange-500 to-amber-400",    text: "text-orange-500",  pulse: false },
};

/* ─────────────────────────────────────────────
   CONFIG TYPES
───────────────────────────────────────────── */
const TYPES = {
  "Pilotage":            { cls: "bg-indigo-50 text-indigo-700 border-indigo-200",    icon: "🧭" },
  "Développement":       { cls: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200", icon: "💻" },
  "Sécurité":            { cls: "bg-red-50 text-red-700 border-red-200",             icon: "🔒" },
  "Architecture":        { cls: "bg-violet-50 text-violet-700 border-violet-200",    icon: "🏗️" },
  "Documentation":       { cls: "bg-sky-50 text-sky-700 border-sky-200",             icon: "📄" },
  "Modélisation IA":     { cls: "bg-cyan-50 text-cyan-700 border-cyan-200",          icon: "🤖" },
  "Déploiement":         { cls: "bg-orange-50 text-orange-700 border-orange-200",    icon: "🚀" },
  "Chantier":            { cls: "bg-yellow-50 text-yellow-700 border-yellow-200",    icon: "🔧" },
  "POC":                 { cls: "bg-lime-50 text-lime-700 border-lime-200",          icon: "🧪" },
  "Run":                 { cls: "bg-teal-50 text-teal-700 border-teal-200",          icon: "⚙️" },
  "Management":          { cls: "bg-blue-50 text-blue-700 border-blue-200",          icon: "👔" },
  "Formation dispensée": { cls: "bg-amber-50 text-amber-700 border-amber-200",       icon: "🎓" },
  "Formation reçue":     { cls: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: "📚" },
  "Absence / Congés":    { cls: "bg-rose-50 text-rose-700 border-rose-200",          icon: "🌴" },
};

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */
function fmt(d) {
  return new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

const VISIBLE = 5;

/* ─────────────────────────────────────────────
   SOUS-COMPOSANTS
───────────────────────────────────────────── */
function Avatar({ initials, gradient, tooltip }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      <div className={`w-8 h-8 bg-gradient-to-br ${gradient} rounded-full flex items-center justify-center font-bold text-white text-[10px] border-2 border-white cursor-default transition-transform duration-150 hover:-translate-y-1 flex-shrink-0`}>
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

function ProgressBar({ value, status }) {
  const [width, setWidth] = useState(0);
  const [count, setCount] = useState(0);
  const done = useRef(false);
  const cfg = STATUS[status];

  useEffect(() => {
    if (done.current) return;
    done.current = true;
    const t = setTimeout(() => {
      setWidth(value);
      let cur = 0;
      const tick = () => { cur = Math.min(cur + 2, value); setCount(cur); if (cur < value) requestAnimationFrame(tick); };
      requestAnimationFrame(tick);
    }, 300);
    return () => clearTimeout(t);
  }, [value]);

  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-[9px] font-medium text-slate-400 uppercase tracking-widest">Progression</span>
        <span className={`text-base font-bold ${cfg.text}`} style={{ fontFamily: "'Syne',sans-serif" }}>{count}%</span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${cfg.bar}`}
          style={{ width: `${width}%`, transition: "width 1.2s cubic-bezier(.22,1,.36,1)" }}
        />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   CARD
───────────────────────────────────────────── */
function ProjectCard({ project }) {
  const [open, setOpen] = useState(false);
  const cfg      = STATUS[project.status] ?? STATUS["Non démarré"];
  const typeConf = TYPES[project.type]    ?? { cls: "bg-slate-50 text-slate-600 border-slate-200", icon: "📁" };
  const overflow       = project.members.length - VISIBLE;
  const visibleMembers = project.members.slice(0, VISIBLE);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col hover:shadow-md transition-shadow duration-200">

      {/* ── HEADER ── */}
      <div className="relative overflow-hidden px-5 pt-5 pb-4" style={{ background: "linear-gradient(135deg,#0f2951,#1a4a8a)" }}>
        {/* déco */}
        <div className="absolute -right-8 -top-8 w-36 h-36 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute right-8 -bottom-12 w-24 h-24 rounded-full bg-white/[.04] pointer-events-none" />

        {/* Nom + badge statut */}
        <div className="relative z-10 flex items-start justify-between gap-2 min-w-0 mb-3">
          <h2
            title={project.name}
            className="font-extrabold text-white leading-snug min-w-0"
            style={{
              fontFamily: "'Syne',sans-serif",
              fontSize: "clamp(.82rem,2vw,1rem)",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              wordBreak: "break-word",
            }}
          >
            {project.name}
          </h2>
          <span className={`flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-medium ${cfg.badge}`}>
            <span className={`w-1.5 h-1.5 rounded-full bg-current flex-shrink-0 ${cfg.pulse ? "animate-pulse" : ""}`} />
            {project.status}
          </span>
        </div>

        {/* Date */}
        <div className="relative z-10 inline-flex items-center gap-1.5 text-white/50 text-[10px] bg-white/10 px-2 py-0.5 rounded-md">
          <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <rect x="3" y="4" width="18" height="18" rx="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          {fmt(project.start)} → {fmt(project.end)}
        </div>
      </div>

      <div className="flex flex-col flex-1 px-5 py-4 gap-3">

        {/* ── PROGRESSION ── */}
        <ProgressBar value={project.progress} status={project.status} />

        {/* Tâches */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-medium bg-blue-50 text-blue-600 px-2 py-0.5 rounded">
            🔵 {project.activeTasks} actives
          </span>
          <span className="text-slate-200 text-xs">/</span>
          <span className="text-[10px] text-slate-400 bg-slate-50 px-2 py-0.5 rounded">
            {project.totalTasks} tâches totales
          </span>
        </div>

        <div className="h-px bg-slate-100" />

        {/* ── INFOS ── */}
        <div className="grid grid-cols-2 gap-0">
          {[
            {
              label: "Type",
              node: (
                <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded border ${typeConf.cls}`}>
                  {typeConf.icon} {project.type}
                </span>
              ),
            },
            {
              label: "Statut",
              node: <span className={`text-[12px] font-semibold ${cfg.text}`}>{project.status}</span>,
            },
            {
              label: "Début",
              node: <span className="text-[12px] font-medium text-slate-700">{fmt(project.start)}</span>,
            },
            {
              label: "Fin",
              node: <span className="text-[12px] font-medium text-slate-700">{fmt(project.end)}</span>,
            },
          ].map((item, i, arr) => (
            <div
              key={item.label}
              className={[
                "py-2.5",
                i % 2 === 0 ? "pr-3 border-r border-slate-100" : "pl-3",
                i < arr.length - 2 ? "border-b border-slate-100" : "",
              ].join(" ")}
            >
              <p className="text-[9px] font-medium text-slate-400 uppercase tracking-widest mb-1">{item.label}</p>
              {item.node}
            </div>
          ))}
        </div>

        <div className="h-px bg-slate-100" />

        {/* ── PRODUCT OWNER ── */}
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${project.owner.gradient} flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0`}>
            {project.owner.initials}
          </div>
          <div>
            <p className="text-[9px] text-slate-400 uppercase tracking-widest">Product Owner</p>
            <p className="text-[11px] font-medium text-slate-700 leading-tight">{project.owner.name}</p>
          </div>
        </div>

        <div className="h-px bg-slate-100" />

        {/* ── ÉQUIPE ── */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[9px] font-medium text-slate-400 uppercase tracking-widest">
              Équipe · {project.members.length} membres
            </span>
            {project.members.length > VISIBLE && (
              <button
                onClick={() => setOpen(o => !o)}
                className="flex items-center gap-0.5 text-[10px] text-blue-600 hover:text-blue-500 transition-colors"
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
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
            <div className="mt-2.5 flex flex-col gap-1.5 max-h-44 overflow-y-auto pr-0.5" style={{ scrollbarWidth: "thin" }}>
              {project.members.map(m => (
                <div key={m.name} className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-50 border border-slate-100 rounded-xl hover:bg-slate-100 transition-colors">
                  <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${m.gradient} flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0`}>
                    {m.initials}
                  </div>
                  <div>
                    <p className="text-[11px] font-medium text-slate-700 leading-tight">{m.name}</p>
                    <p className="text-[9px] text-slate-400">{m.role}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   GRILLE — 3 par ligne
───────────────────────────────────────────── */
export default function ProjectGrid() {
  return (
    <div className="min-h-screen bg-slate-100 p-8" style={{ fontFamily: "'DM Sans',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500&display=swap');`}</style>

      {/* Header page */}
      <div className="mb-8">
        <p className="text-[10px] font-medium text-blue-600 uppercase tracking-[.3em] mb-1">◈ Gestion de Projets</p>
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight" style={{ fontFamily: "'Syne',sans-serif" }}>
          Mes Projets
        </h1>
        <div className="h-0.5 w-12 bg-gradient-to-r from-blue-600 to-transparent mt-2" />
        <p className="text-sm text-slate-400 mt-1">{PROJECTS.length} projets au total</p>
      </div>

      {/* Grille 3 colonnes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {PROJECTS.map(p => <ProjectCard key={p.id} project={p} />)}
      </div>
    </div>
  );
}
