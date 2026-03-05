import { useState } from "react";

const initialQuorums = [
  { id: 1, nom: "AG Annuelle 2026", prenom: "Jean", fonction: "Président", membres: 45, requis: 23, type: "Ordinaire", statut: "Atteint", date: "2026-04-15", envois: 3, avatar: "JA" },
  { id: 2, nom: "AG de Fusion", prenom: "Marie", fonction: "Secrétaire Générale", membres: 45, requis: 34, type: "Extraordinaire", statut: "Non Atteint", date: "2026-05-20", envois: 5, avatar: "MF" },
  { id: 3, nom: "AG Constitutive", prenom: "Paul", fonction: "Trésorier", membres: 30, requis: 20, type: "Mixte", statut: "En Attente", date: "2026-02-28", envois: 2, avatar: "PC" },
  { id: 4, nom: "AG Extraordinaire", prenom: "Aïcha", fonction: "Vice-Présidente", membres: 60, requis: 31, type: "Extraordinaire", statut: "Atteint", date: "2026-06-10", envois: 4, avatar: "AK" },
  { id: 5, nom: "AG Ordinaire Q2", prenom: "Kouassi", fonction: "Directeur", membres: 40, requis: 21, type: "Ordinaire", statut: "Brouillon", date: "2026-07-01", envois: 1, avatar: "KD" },
];

const TYPES = ["Ordinaire", "Extraordinaire", "Mixte"];
const STATUTS = ["Atteint", "Non Atteint", "En Attente", "Brouillon"];
const EMPTY = { nom: "", prenom: "", fonction: "", membres: "", requis: "", type: "Ordinaire", statut: "Atteint", date: "", envois: "" };

const AVATAR_COLORS = ["bg-orange-400", "bg-emerald-500", "bg-blue-500", "bg-violet-500", "bg-pink-500", "bg-amber-500", "bg-cyan-500"];
const avatarCls = (str) => AVATAR_COLORS[str.charCodeAt(0) % AVATAR_COLORS.length];

const STATUS = {
  "Atteint":     { wrap: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
  "Non Atteint": { wrap: "bg-red-50 text-red-600 border border-red-200" },
  "En Attente":  { wrap: "bg-amber-50 text-amber-600 border border-amber-200" },
  "Brouillon":   { wrap: "bg-blue-50 text-blue-600 border border-blue-200" },
};

const TAB_ACTIVE = {
  "Tous":        "text-orange-500 border-b-2 border-orange-500",
  "Atteint":     "text-emerald-600 border-b-2 border-emerald-500",
  "Non Atteint": "text-red-500 border-b-2 border-red-500",
  "En Attente":  "text-amber-500 border-b-2 border-amber-500",
  "Brouillon":   "text-blue-500 border-b-2 border-blue-500",
};

const STAT_CARDS = [
  { key: "Atteint",     icon: "✓",  iconBg: "bg-emerald-500", cardBg: "bg-emerald-50",  border: "border-emerald-100" },
  { key: "En Attente",  icon: "⏳", iconBg: "bg-amber-400",   cardBg: "bg-amber-50",    border: "border-amber-100"   },
  { key: "Non Atteint", icon: "🔔", iconBg: "bg-red-400",     cardBg: "bg-red-50",      border: "border-red-100"     },
  { key: "Brouillon",   icon: "📄", iconBg: "bg-blue-500",    cardBg: "bg-blue-50",     border: "border-blue-100"    },
];

function Field({ label, error, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

export default function QuorumApp() {
  const [quorums, setQuorums] = useState(initialQuorums);
  const [tab, setTab]         = useState("Tous");
  const [search, setSearch]   = useState("");
  const [modal, setModal]     = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm]       = useState(EMPTY);
  const [errors, setErrors]   = useState({});
  const [toast, setToast]     = useState(null);
  const [page, setPage]       = useState(1);
  const PER = 5;

  const notify = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const tabRows  = tab === "Tous" ? quorums : quorums.filter(q => q.statut === tab);
  const filtered = tabRows.filter(q =>
    [q.nom, q.prenom, q.type].some(v => v.toLowerCase().includes(search.toLowerCase()))
  );
  const totalPages = Math.ceil(filtered.length / PER) || 1;
  const rows       = filtered.slice((page - 1) * PER, page * PER);

  const counts = {
    "Tous": quorums.length,
    "Atteint":     quorums.filter(q => q.statut === "Atteint").length,
    "Non Atteint": quorums.filter(q => q.statut === "Non Atteint").length,
    "En Attente":  quorums.filter(q => q.statut === "En Attente").length,
    "Brouillon":   quorums.filter(q => q.statut === "Brouillon").length,
  };

  const validate = () => {
    const e = {};
    if (!form.nom.trim())                              e.nom     = "Requis";
    if (!form.prenom.trim())                           e.prenom  = "Requis";
    if (!form.membres || +form.membres < 1)            e.membres = "Invalide";
    if (!form.requis  || +form.requis  < 1)            e.requis  = "Invalide";
    if (+form.requis  > +form.membres)                 e.requis  = "Supérieur au total";
    if (!form.date)                                    e.date    = "Requise";
    return e;
  };

  const openAdd    = ()  => { setForm(EMPTY); setErrors({}); setModal("add"); };
  const openEdit   = (q) => { setSelected(q); setForm({ ...q, membres: String(q.membres), requis: String(q.requis), envois: String(q.envois) }); setErrors({}); setModal("edit"); };
  const openDelete = (q) => { setSelected(q); setModal("delete"); };
  const close      = ()  => { setModal(null); setSelected(null); };

  const save = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    const avatar = ((form.prenom[0] || "") + (form.nom[0] || "")).toUpperCase();
    const entry  = { ...form, membres: +form.membres, requis: +form.requis, envois: +form.envois || 0, avatar };
    if (modal === "add") {
      setQuorums(prev => [...prev, { ...entry, id: Date.now() }]);
      notify("Quorum créé !");
    } else {
      setQuorums(prev => prev.map(q => q.id === selected.id ? { ...entry, id: selected.id } : q));
      notify("Quorum modifié !");
    }
    close();
  };

  const destroy = () => {
    setQuorums(prev => prev.filter(q => q.id !== selected.id));
    notify("Quorum supprimé.", "error");
    close();
  };

  const inputCls = (field) =>
    `w-full border rounded-lg px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-orange-300 ${errors[field] ? "border-red-400 bg-red-50" : "border-slate-200 focus:border-orange-400"}`;

  return (
    <div className="min-h-screen bg-slate-50 font-sans">

      {/* TOP BAR */}
      <div className="flex items-center justify-between px-8 py-4 bg-white border-b border-slate-100 shadow-sm">
        <div className="relative w-72">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
          <input
            className="w-full border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 transition"
            placeholder="Rechercher un quorum..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-md shadow-orange-200 transition hover:-translate-y-0.5"
        >
          <span className="text-lg leading-none">＋</span> Créer un Quorum
        </button>
      </div>

      <div className="px-8 py-7">

        {/* Breadcrumb + Title */}
        <div className="mb-6">
          <p className="text-xs text-slate-400 mb-1">
            Général <span className="mx-1">›</span>
            <span className="text-orange-500 font-semibold">Tous les Quorums</span>
          </p>
          <h1 className="text-2xl font-bold text-slate-800">Quorums</h1>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-4 gap-4 mb-7">
          {STAT_CARDS.map(c => (
            <div key={c.key} className={`${c.cardBg} border ${c.border} rounded-2xl p-5 shadow-sm`}>
              <div className="flex items-center gap-3">
                <div className={`${c.iconBg} w-12 h-12 rounded-2xl flex items-center justify-center text-white text-xl flex-shrink-0 shadow-sm`}>
                  {c.icon}
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-800 leading-tight">{counts[c.key]}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{c.key}</p>
                  <p className="text-xs font-semibold text-slate-400 mt-0.5">
                    Membres : {quorums.filter(q => q.statut === c.key).reduce((a, b) => a + b.membres, 0)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Table Card */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-100">

          {/* Tabs */}
          <div className="flex border-b border-slate-100 px-2 overflow-x-auto">
            {Object.entries(counts).map(([t, c]) => (
              <button
                key={t}
                onClick={() => { setTab(t); setPage(1); }}
                className={`px-5 py-3.5 text-sm font-medium whitespace-nowrap transition ${tab === t ? TAB_ACTIVE[t] : "text-slate-400 hover:text-slate-700 border-b-2 border-transparent"}`}
              >
                {t} ({c})
              </button>
            ))}
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  {["Assemblée","Date","Membres","Requis","Envois","Type","Statut","Actions"].map((h, i) => (
                    <th key={h} className={`px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide ${i === 7 ? "text-right" : "text-left"}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr><td colSpan={8} className="text-center py-14 text-slate-400 text-sm">Aucun quorum trouvé</td></tr>
                ) : rows.map(q => (
                  <tr key={q.id} className="border-b border-slate-50 hover:bg-slate-50 transition">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className={`${avatarCls(q.avatar)} w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0`}>
                          {q.avatar}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800 text-sm">{q.nom}</p>
                          <p className="text-xs text-slate-400">{q.fonction}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-slate-500">{q.date}</td>
                    <td className="px-4 py-3.5 text-sm font-semibold text-slate-700">{q.membres}</td>
                    <td className="px-4 py-3.5 text-sm font-semibold text-orange-500">{q.requis}</td>
                    <td className="px-4 py-3.5 text-sm text-slate-500">{q.envois}</td>
                    <td className="px-4 py-3.5">
                      <span className="bg-slate-100 text-slate-600 text-xs font-medium px-3 py-1 rounded-lg">{q.type}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`text-xs font-semibold px-3 py-1 rounded-lg ${STATUS[q.statut]?.wrap || STATUS["Brouillon"].wrap}`}>
                        {q.statut}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => openEdit(q)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition text-sm">✏️</button>
                        <button onClick={() => openDelete(q)} className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition text-sm">🗑</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-100">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-500 bg-white hover:border-orange-400 hover:text-orange-500 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              ← Précédent
            </button>
            <div className="flex gap-1.5">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-lg text-sm font-semibold border transition ${page === p ? "bg-orange-500 text-white border-orange-500 shadow-sm" : "bg-white text-slate-500 border-slate-200 hover:border-orange-400 hover:text-orange-500"}`}
                >
                  {p}
                </button>
              ))}
              {totalPages > 5 && <span className="text-slate-400 text-sm self-center">…</span>}
            </div>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-500 bg-white hover:border-orange-400 hover:text-orange-500 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              Suivant →
            </button>
          </div>
        </div>
      </div>

      {/* MODAL ADD / EDIT */}
      {(modal === "add" || modal === "edit") && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-[fadeIn_.2s_ease]" onClick={e => e.target === e.currentTarget && close()}>
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-[95%] max-w-lg max-h-[92vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-lg font-bold text-slate-800">{modal === "add" ? "Nouveau Quorum" : "Modifier le Quorum"}</h2>
                <p className="text-sm text-slate-400 mt-0.5">Assemblée Générale</p>
              </div>
              <button onClick={close} className="bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-lg w-8 h-8 flex items-center justify-center text-base transition">✕</button>
            </div>

            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Nom *" error={errors.nom}>
                  <input className={inputCls("nom")} value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} placeholder="Nom de l'AG" />
                </Field>
                <Field label="Prénom *" error={errors.prenom}>
                  <input className={inputCls("prenom")} value={form.prenom} onChange={e => setForm({ ...form, prenom: e.target.value })} placeholder="Responsable" />
                </Field>
              </div>
              <Field label="Fonction">
                <input className={inputCls("")} value={form.fonction} onChange={e => setForm({ ...form, fonction: e.target.value })} placeholder="Ex: Président" />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Membres totaux *" error={errors.membres}>
                  <input className={inputCls("membres")} type="number" min="1" value={form.membres} onChange={e => setForm({ ...form, membres: e.target.value })} placeholder="45" />
                </Field>
                <Field label="Membres requis *" error={errors.requis}>
                  <input className={inputCls("requis")} type="number" min="1" value={form.requis} onChange={e => setForm({ ...form, requis: e.target.value })} placeholder="23" />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Type">
                  <select className={inputCls("")} value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                    {TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </Field>
                <Field label="Statut">
                  <select className={inputCls("")} value={form.statut} onChange={e => setForm({ ...form, statut: e.target.value })}>
                    {STATUTS.map(s => <option key={s}>{s}</option>)}
                  </select>
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Date *" error={errors.date}>
                  <input className={inputCls("date")} type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
                </Field>
                <Field label="Envois">
                  <input className={inputCls("")} type="number" min="0" value={form.envois} onChange={e => setForm({ ...form, envois: e.target.value })} placeholder="0" />
                </Field>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button onClick={close} className="px-5 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-500 hover:bg-slate-50 transition">Annuler</button>
              <button onClick={save} className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl shadow-md shadow-orange-200 transition">
                {modal === "add" ? "Créer" : "Sauvegarder"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DELETE */}
      {modal === "delete" && selected && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50" onClick={e => e.target === e.currentTarget && close()}>
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-[95%] max-w-sm text-center">
            <div className="text-5xl mb-4">⚠️</div>
            <h2 className="text-lg font-bold text-slate-800 mb-2">Supprimer ce Quorum ?</h2>
            <p className="text-sm text-slate-500 mb-6">
              Vous allez supprimer<br />
              <span className="font-semibold text-slate-800">« {selected.nom} »</span>.<br />
              Cette action est irréversible.
            </p>
            <div className="flex justify-center gap-3">
              <button onClick={close} className="px-5 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-500 hover:bg-slate-50 transition">Annuler</button>
              <button onClick={destroy} className="px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-xl shadow-md shadow-red-200 transition">Supprimer</button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST */}
      {toast && (
        <div className={`fixed bottom-7 right-7 px-5 py-3 rounded-xl text-sm font-semibold shadow-lg z-[999] ${toast.type === "success" ? "bg-emerald-500 text-white" : "bg-red-500 text-white"}`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
