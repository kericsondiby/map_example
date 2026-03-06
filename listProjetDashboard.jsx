import { useState } from "react";

const projects = [
  { id: 1, name: "Refonte Site Web", status: "En cours", start: "2026-01-10", end: "2026-04-30", owner: "Konan A." },
  { id: 2, name: "App Mobile CRM", status: "Planifié", start: "2026-03-15", end: "2026-08-20", owner: "Bamba K." },
  { id: 3, name: "Migration Base de Données", status: "Terminé", start: "2025-10-01", end: "2026-01-15", owner: "Fatoumata D." },
  { id: 4, name: "Tableau de Bord Analytics", status: "En cours", start: "2026-02-01", end: "2026-05-31", owner: "Yves M." },
  { id: 5, name: "Intégration API Paiement", status: "En attente", start: "2026-04-01", end: "2026-06-15", owner: "Mariam S." },
  { id: 6, name: "Audit Sécurité", status: "Annulé", start: "2025-12-01", end: "2026-02-28", owner: "Sékou T." },
  { id: 7, name: "Portail RH", status: "Planifié", start: "2026-05-01", end: "2026-09-30", owner: "Awa B." },
];

const STATUS = {
  "En cours":   { bg: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe", dot: "#3b82f6", pulse: true },
  "Planifié":   { bg: "#fffbeb", color: "#b45309", border: "#fde68a", dot: "#f59e0b", pulse: false },
  "Terminé":    { bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0", dot: "#22c55e", pulse: false },
  "En attente": { bg: "#f8fafc", color: "#475569", border: "#e2e8f0", dot: "#94a3b8", pulse: false },
  "Annulé":     { bg: "#fef2f2", color: "#b91c1c", border: "#fecaca", dot: "#ef4444", pulse: false },
};

const COLUMNS = [
  { key: "id",       label: "#" },
  { key: "name",     label: "Projet" },
  { key: "owner",    label: "Responsable" },
  { key: "status",   label: "Statut" },
  { key: "start",    label: "Début" },
  { key: "end",      label: "Fin" },
  { key: "progress", label: "Progression" },
];

function fmt(d) {
  return new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

function progress(start, end, status) {
  if (status === "Terminé") return 100;
  if (["Planifié", "En attente", "Annulé"].includes(status)) return 0;
  const now = Date.now(), s = new Date(start).getTime(), e = new Date(end).getTime();
  if (now <= s) return 0;
  if (now >= e) return 100;
  return Math.round(((now - s) / (e - s)) * 100);
}

export default function ProjectTable() {
  const [sortKey, setSortKey] = useState("id");
  const [sortDir, setSortDir] = useState("asc");
  const [filter, setFilter] = useState("Tous");
  const [search, setSearch] = useState("");

  function handleSort(key) {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  }

  const data = [...projects]
    .filter(p => filter === "Tous" || p.status === filter)
    .filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.owner.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      let va = a[sortKey] ?? "", vb = b[sortKey] ?? "";
      if (sortKey === "progress") { va = progress(a.start, a.end, a.status); vb = progress(b.start, b.end, b.status); }
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

  const statuses = ["Tous", ...Object.keys(STATUS)];

  return (
    <div style={{ minHeight: "100vh", background: "#ffffff", fontFamily: "'Fira Mono', monospace", padding: "2rem 1.5rem" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Fira+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        .pulse { animation: blink 2s ease-in-out infinite; }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:.25} }
        .th-sort { cursor: pointer; user-select: none; }
        .th-sort:hover { color: #0f172a !important; }
        .tr-row { transition: background 0.12s; }
        .tr-row:hover { background: #f1f5f9 !important; }
        .chip { transition: all 0.15s; cursor: pointer; }
        .chip:hover { opacity: .8; }
        input:focus { outline: none; }
        input::placeholder { color: #cbd5e1; }
        ::-webkit-scrollbar { height: 4px; }
        ::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 4px; }
      `}</style>

      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: "2rem" }}>
          <span style={{ color: "#2563eb", fontSize: "0.62rem", letterSpacing: ".3em", textTransform: "uppercase" }}>◈ GESTION DE PROJETS</span>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "clamp(1.6rem,4vw,2.4rem)", color: "#0f172a", letterSpacing: "-.03em", margin: "0.2rem 0 0" }}>
            Tableau des Projets
          </h1>
          <div style={{ height: 2, width: 48, background: "linear-gradient(90deg,#2563eb,transparent)", marginTop: ".5rem" }} />
        </div>

        {/* Toolbar */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: ".75rem", alignItems: "center", marginBottom: "1.25rem" }}>
          <div style={{ position: "relative", flex: "1 1 180px" }}>
            <span style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", fontSize: ".9rem" }}>⌕</span>
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher..."
              style={{ width: "100%", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 7, color: "#334155", fontSize: ".75rem", padding: ".5rem .75rem .5rem 2rem", fontFamily: "inherit" }}
            />
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: ".35rem" }}>
            {statuses.map(s => {
              const active = filter === s;
              const cfg = STATUS[s];
              return (
                <button key={s} className="chip" onClick={() => setFilter(s)}
                  style={{
                    padding: ".3rem .8rem", borderRadius: 20, fontSize: ".68rem", fontFamily: "inherit", letterSpacing: ".04em",
                    border: `1px solid ${active ? (cfg?.border ?? "#cbd5e1") : "#e2e8f0"}`,
                    background: active ? (cfg?.bg ?? "#f1f5f9") : "#f8fafc",
                    color: active ? (cfg?.color ?? "#0f172a") : "#94a3b8",
                  }}>
                  {s}
                </button>
              );
            })}
          </div>
          <span style={{ marginLeft: "auto", color: "#cbd5e1", fontSize: ".68rem", letterSpacing: ".1em", whiteSpace: "nowrap" }}>
            {data.length} / {projects.length}
          </span>
        </div>

        {/* Table */}
        <div style={{ overflowX: "auto", borderRadius: 10, border: "1px solid #e2e8f0" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                {COLUMNS.map(col => (
                  <th key={col.key} className="th-sort" onClick={() => handleSort(col.key)}
                    style={{
                      padding: ".7rem 1rem", textAlign: "left", fontSize: ".6rem", letterSpacing: ".15em",
                      textTransform: "uppercase", color: sortKey === col.key ? "#2563eb" : "#94a3b8",
                      fontWeight: 600, whiteSpace: "nowrap", fontFamily: "inherit",
                      borderRight: col.key !== "progress" ? "1px solid #f1f5f9" : "none",
                    }}>
                    {col.label}
                    {sortKey === col.key && <span style={{ marginLeft: 4, opacity: .6 }}>{sortDir === "asc" ? "↑" : "↓"}</span>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.length === 0 && (
                <tr><td colSpan={7} style={{ textAlign: "center", color: "#cbd5e1", padding: "3rem", fontSize: ".8rem" }}>Aucun résultat</td></tr>
              )}
              {data.map((p, i) => {
                const cfg = STATUS[p.status];
                const pct = progress(p.start, p.end, p.status);
                return (
                  <tr key={p.id} className="tr-row"
                    style={{ background: i % 2 === 0 ? "#fff" : "#fafafa", borderBottom: "1px solid #f1f5f9" }}>

                    <td style={{ padding: ".6rem 1rem", color: "#cbd5e1", fontSize: ".68rem", borderRight: "1px solid #f1f5f9", whiteSpace: "nowrap" }}>
                      {String(p.id).padStart(2, "0")}
                    </td>

                    <td style={{ padding: ".6rem 1rem", borderRight: "1px solid #f1f5f9", whiteSpace: "nowrap" }}>
                      <span style={{ color: "#0f172a", fontSize: ".82rem", fontWeight: 600, fontFamily: "'Syne', sans-serif", letterSpacing: "-.01em" }}>{p.name}</span>
                    </td>

                    <td style={{ padding: ".6rem 1rem", color: "#64748b", fontSize: ".75rem", borderRight: "1px solid #f1f5f9", whiteSpace: "nowrap" }}>
                      {p.owner}
                    </td>

                    <td style={{ padding: ".6rem 1rem", borderRight: "1px solid #f1f5f9", whiteSpace: "nowrap" }}>
                      <span style={{
                        display: "inline-flex", alignItems: "center", gap: 6,
                        padding: ".25rem .7rem", borderRadius: 20,
                        background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
                        fontSize: ".68rem", letterSpacing: ".04em", fontWeight: 500,
                      }}>
                        <span className={cfg.pulse ? "pulse" : ""} style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.dot, flexShrink: 0 }} />
                        {p.status}
                      </span>
                    </td>

                    <td style={{ padding: ".6rem 1rem", color: "#475569", fontSize: ".73rem", borderRight: "1px solid #f1f5f9", whiteSpace: "nowrap" }}>
                      {fmt(p.start)}
                    </td>

                    <td style={{ padding: ".6rem 1rem", color: "#475569", fontSize: ".73rem", borderRight: "1px solid #f1f5f9", whiteSpace: "nowrap" }}>
                      {fmt(p.end)}
                    </td>

                    <td style={{ padding: ".6rem 1rem", minWidth: 130 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ flex: 1, height: 4, background: "#f1f5f9", borderRadius: 4, overflow: "hidden" }}>
                          <div style={{
                            height: "100%", width: `${pct}%`, borderRadius: 4,
                            background:
                              p.status === "Terminé" ? "linear-gradient(90deg,#16a34a,#4ade80)"
                              : p.status === "En cours" ? "linear-gradient(90deg,#2563eb,#60a5fa)"
                              : p.status === "Annulé" ? "linear-gradient(90deg,#dc2626,#f87171)"
                              : "#e2e8f0",
                            transition: "width 0.6s ease",
                          }} />
                        </div>
                        <span style={{ color: "#94a3b8", fontSize: ".65rem", minWidth: 28, textAlign: "right" }}>{pct}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div style={{ marginTop: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: ".5rem" }}>
          <span style={{ color: "#e2e8f0", fontSize: ".58rem", letterSpacing: ".2em" }}>◈ PROJETS — {new Date().getFullYear()}</span>
          <div style={{ display: "flex", gap: "1.25rem", flexWrap: "wrap" }}>
            {Object.entries(STATUS).map(([s, cfg]) => (
              <span key={s} style={{ display: "flex", alignItems: "center", gap: 5, color: "#94a3b8", fontSize: ".62rem" }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.dot }} />
                {projects.filter(p => p.status === s).length} {s}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
