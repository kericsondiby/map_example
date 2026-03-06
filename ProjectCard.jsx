import { useState, useEffect, useRef, FC, ReactNode } from "react";

/* ─────────────────────────────────────────────
   TYPES
───────────────────────────────────────────── */
export interface Collaborateur {
  user_id: number;
  user_name: string;
  user_prenom: string;
}

export interface Projet {
  projet_id: number;
  nom_projet: string;
  statut: "0" | "1" | "2" | "3";
  type_projet: string;
  date_debut: string;
  date_fin: string;
  description: string;
  heure_total: string;
  progession: string;
  id_direction?: number;
  fichiers?: unknown[];
  po_projet: Collaborateur | null;
  collaborateurs: Collaborateur[];
}

interface StatutConfig {
  label: string;
  badge: string;
  bar: string;
  text: string;
  pulse: boolean;
}

interface TypeConfig {
  label: string;
  cls: string;
  icon: string;
}

interface InfoItem {
  label: string;
  node: ReactNode;
}

/* ─────────────────────────────────────────────
   MAPPING statut
───────────────────────────────────────────── */
const STATUT_MAP: Record<string, StatutConfig> = {
  "0": { label: "Non démarré", badge: "bg-slate-400/[.15] text-slate-300 border border-slate-400/30",          bar: "from-slate-300 to-slate-200",   text: "text-slate-400",   pulse: false },
  "1": { label: "En cours",    badge: "bg-blue-500/[.15] text-blue-300 border border-blue-400/30",             bar: "from-blue-600 to-blue-400",     text: "text-blue-600",    pulse: true  },
  "2": { label: "Terminé",     badge: "bg-emerald-500/[.15] text-emerald-300 border border-emerald-400/30",    bar: "from-emerald-500 to-green-400", text: "text-emerald-600", pulse: false },
  "3": { label: "Suspendu",    badge: "bg-orange-500/[.15] text-orange-300 border border-orange-400/30",       bar: "from-orange-500 to-amber-400",  text: "text-orange-500",  pulse: false },
};

/* ─────────────────────────────────────────────
   MAPPING type_projet
───────────────────────────────────────────── */
const TYPE_MAP: Record<string, TypeConfig> = {
  "1":  { label: "Pilotage",            cls: "bg-indigo-50 text-indigo-700 border-indigo-200",    icon: "🧭" },
  "2":  { label: "Développement",       cls: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200", icon: "💻" },
  "3":  { label: "Sécurité",            cls: "bg-red-50 text-red-700 border-red-200",             icon: "🔒" },
  "4":  { label: "Architecture",        cls: "bg-violet-50 text-violet-700 border-violet-200",    icon: "🏗️" },
  "5":  { label: "Documentation",       cls: "bg-sky-50 text-sky-700 border-sky-200",             icon: "📄" },
  "6":  { label: "Modélisation IA",     cls: "bg-cyan-50 text-cyan-700 border-cyan-200",          icon: "🤖" },
  "7":  { label: "Déploiement",         cls: "bg-orange-50 text-orange-700 border-orange-200",    icon: "🚀" },
  "8":  { label: "Chantier",            cls: "bg-yellow-50 text-yellow-700 border-yellow-200",    icon: "🔧" },
  "9":  { label: "POC",                 cls: "bg-lime-50 text-lime-700 border-lime-200",          icon: "🧪" },
  "10": { label: "Run",                 cls: "bg-teal-50 text-teal-700 border-teal-200",          icon: "⚙️" },
  "11": { label: "Management",          cls: "bg-blue-50 text-blue-700 border-blue-200",          icon: "👔" },
  "12": { label: "Formation dispensée", cls: "bg-amber-50 text-amber-700 border-amber-200",       icon: "🎓" },
  "13": { label: "Formation reçue",     cls: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: "📚" },
  "14": { label: "Absence / Congés",    cls: "bg-rose-50 text-rose-700 border-rose-200",          icon: "🌴" },
};

/* ─────────────────────────────────────────────
   COULEURS avatars
───────────────────────────────────────────── */
const GRADIENTS: string[] = [
  "from-indigo-500 to-violet-500",
  "from-amber-400 to-red-500",
  "from-emerald-400 to-cyan-500",
  "from-blue-400 to-indigo-500",
  "from-pink-400 to-rose-500",
  "from-orange-400 to-yellow-400",
  "from-violet-500 to-pink-500",
  "from-cyan-400 to-blue-500",
  "from-green-500 to-emerald-400",
  "from-red-500 to-orange-400",
  "from-slate-600 to-slate-400",
  "from-violet-700 to-blue-500",
];

const FALLBACK_STATUT: StatutConfig = STATUT_MAP["0"];
const FALLBACK_TYPE: TypeConfig     = { label: "Autre", cls: "bg-slate-50 text-slate-600 border-slate-200", icon: "📁" };
const VISIBLE = 5;

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */
function fmt(dateStr: string): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

function getInitials(user: Collaborateur): string {
  return `${user.user_prenom?.[0] ?? ""}${user.user_name?.[0] ?? ""}`.toUpperCase();
}

function getFullName(user: Collaborateur): string {
  return `${user.user_prenom} ${user.user_name}`;
}

function getGradient(userId: number): string {
  return GRADIENTS[userId % GRADIENTS.length];
}

function clampProgress(val: string): number {
  const n = parseFloat(val);
  if (isNaN(n)) return 0;
  return Math.min(100, Math.max(0, Math.round(n)));
}

/* ─────────────────────────────────────────────
   AVATAR
───────────────────────────────────────────── */
interface AvatarProps {
  user: Collaborateur;
}

const Avatar: FC<AvatarProps> = ({ user }) => {
  const [show, setShow] = useState<boolean>(false);
  const grad = getGradient(user.user_id);

  return (
    <div
      className="relative"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <div className={`w-8 h-8 bg-gradient-to-br ${grad} rounded-full flex items-center justify-center font-bold text-white text-[10px] border-2 border-white cursor-default transition-transform duration-150 hover:-translate-y-1 flex-shrink-0`}>
        {getInitials(user)}
      </div>
      {show && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-0.5 bg-slate-800 text-white text-[9px] rounded whitespace-nowrap z-50 shadow-lg pointer-events-none">
          {getFullName(user)}
        </div>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────
   PROGRESS BAR
───────────────────────────────────────────── */
interface ProgressBarProps {
  rawValue: string;
  statut: string;
}

const ProgressBar: FC<ProgressBarProps> = ({ rawValue, statut }) => {
  const value = clampProgress(rawValue);
  const [width, setWidth] = useState<number>(0);
  const [count, setCount] = useState<number>(0);
  const done = useRef<boolean>(false);
  const cfg  = STATUT_MAP[statut] ?? FALLBACK_STATUT;

  useEffect(() => {
    if (done.current) return;
    done.current = true;
    const t = setTimeout(() => {
      setWidth(value);
      let cur = 0;
      const tick = (): void => {
        cur = Math.min(cur + 2, value);
        setCount(cur);
        if (cur < value) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, 300);
    return () => clearTimeout(t);
  }, [value]);

  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-[9px] font-medium text-slate-400 uppercase tracking-widest">Progression</span>
        <span className={`text-base font-bold ${cfg.text}`} style={{ fontFamily: "'Syne',sans-serif" }}>
          {count}%
        </span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${cfg.bar}`}
          style={{ width: `${width}%`, transition: "width 1.2s cubic-bezier(.22,1,.36,1)" }}
        />
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   PROJECT CARD
───────────────────────────────────────────── */
interface ProjectCardProps {
  project: Projet;
}

const ProjectCard: FC<ProjectCardProps> = ({ project }) => {
  const [open, setOpen] = useState<boolean>(false);

  const statCfg  = STATUT_MAP[project.statut]       ?? FALLBACK_STATUT;
  const typeCfg  = TYPE_MAP[project.type_projet]     ?? FALLBACK_TYPE;
  const members  = project.collaborateurs            ?? [];
  const overflow = members.length - VISIBLE;
  const visible  = members.slice(0, VISIBLE);

  const infoItems: InfoItem[] = [
    {
      label: "Type",
      node: (
        <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded border ${typeCfg.cls}`}>
          {typeCfg.icon} {typeCfg.label}
        </span>
      ),
    },
    {
      label: "Statut",
      node: <span className={`text-[12px] font-semibold ${statCfg.text}`}>{statCfg.label}</span>,
    },
    {
      label: "Début",
      node: <span className="text-[12px] font-medium text-slate-700">{fmt(project.date_debut)}</span>,
    },
    {
      label: "Fin",
      node: <span className="text-[12px] font-medium text-slate-700">{fmt(project.date_fin)}</span>,
    },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col hover:shadow-md transition-shadow duration-200">

      {/* ── HEADER ── */}
      <div
        className="relative overflow-hidden px-5 pt-5 pb-4"
        style={{ background: "linear-gradient(135deg,#0f2951,#1a4a8a)" }}
      >
        <div className="absolute -right-8 -top-8 w-36 h-36 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute right-8 -bottom-12 w-24 h-24 rounded-full bg-white/[.04] pointer-events-none" />

        {/* Nom + statut */}
        <div className="relative z-10 flex items-start justify-between gap-2 min-w-0 mb-3">
          <h2
            title={project.nom_projet}
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
            {project.nom_projet}
          </h2>
          <span className={`flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-medium ${statCfg.badge}`}>
            <span className={`w-1.5 h-1.5 rounded-full bg-current flex-shrink-0 ${statCfg.pulse ? "animate-pulse" : ""}`} />
            {statCfg.label}
          </span>
        </div>

        {/* Dates */}
        <div className="relative z-10 inline-flex items-center gap-1.5 text-white/50 text-[10px] bg-white/10 px-2 py-0.5 rounded-md">
          <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          {fmt(project.date_debut)} → {fmt(project.date_fin)}
        </div>
      </div>

      <div className="flex flex-col flex-1 px-5 py-4 gap-3">

        {/* ── PROGRESSION ── */}
        <ProgressBar rawValue={project.progession} statut={project.statut} />

        {/* Heures */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-medium bg-blue-50 text-blue-600 px-2 py-0.5 rounded">
            ⏱ {project.heure_total}h estimées
          </span>
        </div>

        <div className="h-px bg-slate-100" />

        {/* ── INFOS ── */}
        <div className="grid grid-cols-2 gap-0">
          {infoItems.map((item, i) => (
            <div
              key={item.label}
              className={[
                "py-2.5",
                i % 2 === 0 ? "pr-3 border-r border-slate-100" : "pl-3",
                i < infoItems.length - 2 ? "border-b border-slate-100" : "",
              ].join(" ")}
            >
              <p className="text-[9px] font-medium text-slate-400 uppercase tracking-widest mb-1">{item.label}</p>
              {item.node}
            </div>
          ))}
        </div>

        <div className="h-px bg-slate-100" />

        {/* ── PRODUCT OWNER ── */}
        {project.po_projet && (
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${getGradient(project.po_projet.user_id)} flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0`}>
              {getInitials(project.po_projet)}
            </div>
            <div>
              <p className="text-[9px] text-slate-400 uppercase tracking-widest">Product Owner</p>
              <p className="text-[11px] font-medium text-slate-700 leading-tight">{getFullName(project.po_projet)}</p>
            </div>
          </div>
        )}

        <div className="h-px bg-slate-100" />

        {/* ── ÉQUIPE ── */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[9px] font-medium text-slate-400 uppercase tracking-widest">
              Équipe · {members.length} membre{members.length > 1 ? "s" : ""}
            </span>
            {members.length > VISIBLE && (
              <button
                onClick={() => setOpen((o) => !o)}
                className="flex items-center gap-0.5 text-[10px] text-blue-600 hover:text-blue-500 transition-colors"
              >
                <svg
                  width="10" height="10" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" strokeWidth="2.5"
                  className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
                {open ? "Réduire" : "Voir tous"}
              </button>
            )}
          </div>

          {/* Avatars empilés */}
          <div className="flex items-center">
            {visible.map((m, i) => (
              <div key={m.user_id} className="-ml-2.5 first:ml-0" style={{ zIndex: VISIBLE - i }}>
                <Avatar user={m} />
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
            <div
              className="mt-2.5 flex flex-col gap-1.5 max-h-44 overflow-y-auto pr-0.5"
              style={{ scrollbarWidth: "thin" }}
            >
              {members.map((m) => (
                <div
                  key={m.user_id}
                  className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-50 border border-slate-100 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${getGradient(m.user_id)} flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0`}>
                    {getInitials(m)}
                  </div>
                  <p className="text-[11px] font-medium text-slate-700 leading-tight">{getFullName(m)}</p>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   GRILLE — 3 par ligne
───────────────────────────────────────────── */
interface ProjectGridProps {
  projects: Projet[];
}

const ProjectGrid: FC<ProjectGridProps> = ({ projects }) => {
  return (
    <div className="min-h-screen bg-slate-100 p-8" style={{ fontFamily: "'DM Sans',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500&display=swap');`}</style>

      <div className="mb-8">
        <p className="text-[10px] font-medium text-blue-600 uppercase tracking-[.3em] mb-1">◈ Gestion de Projets</p>
        <h1
          className="text-3xl font-extrabold text-slate-800 tracking-tight"
          style={{ fontFamily: "'Syne',sans-serif" }}
        >
          Mes Projets
        </h1>
        <div className="h-0.5 w-12 bg-gradient-to-r from-blue-600 to-transparent mt-2" />
        <p className="text-sm text-slate-400 mt-1">{projects.length} projets au total</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {projects.map((p) => (
          <ProjectCard key={p.projet_id} project={p} />
        ))}
      </div>
    </div>
  );
};

export { ProjectCard, ProjectGrid };
export default ProjectGrid;
