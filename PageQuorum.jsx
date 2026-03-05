import { useState } from "react";

const initialData = [
  { id: 1, nom_type: "Ordinaire",      quorum: 51 },
  { id: 2, nom_type: "Extraordinaire", quorum: 75 },
  { id: 3, nom_type: "Mixte",          quorum: 60 },
];

const EMPTY = { nom_type: "", quorum: "" };

const TYPE_COLORS = {
  "Ordinaire":      { bg: "bg-blue-50",   text: "text-blue-700",   border: "border-blue-200",   dot: "bg-blue-500"   },
  "Extraordinaire": { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200", dot: "bg-purple-500" },
  "Mixte":          { bg: "bg-teal-50",   text: "text-teal-700",   border: "border-teal-200",   dot: "bg-teal-500"   },
};
const defaultColor = { bg: "bg-slate-50", text: "text-slate-700", border: "border-slate-200", dot: "bg-slate-400" };

function getColor(name) {
  return TYPE_COLORS[name] || defaultColor;
}

function CircleProgress({ pct }) {
  const stroke = pct >= 66 ? "#10b981" : pct >= 40 ? "#f97316" : "#ef4444";
  const circumference = 2 * Math.PI * 20;
  const offset = circumference - (pct / 100) * circumference;
  return (
    <div className="relative w-14 h-14 flex-shrink-0">
      <svg viewBox="0 0 48 48" className="w-14 h-14 -rotate-90">
        <circle cx="24" cy="24" r="20" fill="none" stroke="#f1f5f9" strokeWidth="4" />
        <circle cx="24" cy="24" r="20" fill="none"
          stroke={stroke} strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-slate-700">
        {pct}%
      </span>
    </div>
  );
}

function Field({ label, error, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</label>
      {children}
      {error && <p className="text-xs text-red-500 flex items-center gap-1"><span>⚠</span>{error}</p>}
    </div>
  );
}

export default function QuorumApp() {
  const [items, setItems]       = useState(initialData);
  const [modal, setModal]       = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm]         = useState(EMPTY);
  const [errors, setErrors]     = useState({});
  const [toast, setToast]       = useState(null);

  const notify = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const validate = () => {
    const e = {};
    if (!form.nom_type.trim())                   e.nom_type = "Le nom du type est requis";
    if (!form.quorum || isNaN(form.quorum))       e.quorum   = "Le quorum est requis";
    if (+form.quorum < 1 || +form.quorum > 100)  e.quorum   = "Valeur entre 1 et 100";
    return e;
  };

  const openAdd    = ()     => { setForm(EMPTY); setErrors({}); setModal("add"); };
  const openEdit   = (item) => { setSelected(item); setForm({ nom_type: item.nom_type, quorum: String(item.quorum) }); setErrors({}); setModal("edit"); };
  const openDelete = (item) => { setSelected(item); setModal("delete"); };
  const close      = ()     => { setModal(null); setSelected(null); };

  const save = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    const entry = { nom_type: form.nom_type.trim(), quorum: +form.quorum };
    if (modal === "add") {
      setItems(prev => [...prev, { ...entry, id: Date.now() }]);
      notify("Type d'AG créé avec succès !");
    } else {
      setItems(prev => prev.map(i => i.id === selected.id ? { ...entry, id: selected.id } : i));
      notify("Type d'AG modifié !");
    }
    close();
  };

  const destroy = () => {
    setItems(prev => prev.filter(i => i.id !== selected.id));
    notify("Type d'AG supprimé.", "error");
    close();
  };

  const inputCls = (field) =>
    `w-full border rounded-xl px-3.5 py-2.5 text-sm outline-none transition-all focus:ring-2 focus:ring-red-200 focus:border-red-500 bg-white ${
      errors[field] ? "border-red-300 bg-red-50 focus:ring-red-100" : "border-slate-200"
    }`;

  return (
    <div className="min-h-screen bg-gray-50 font-sans">

      {/* HEADER */}
      <div className="bg-white border-b-2 border-red-600 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

            {/* Left: icon + title */}
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-red-600 flex items-center justify-center flex-shrink-0 shadow-md shadow-red-200">
                <span className="text-white text-xl">⚖️</span>
              </div>
              <div>
                <div className="flex items-center gap-2 text-xs text-gray-400 mb-0.5">
                  <span>Assemblée Générale</span>
                  <span className="text-red-400">›</span>
                  <span className="text-red-600 font-semibold">Configuration</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">Gestion des Quorums</h1>
              </div>
            </div>

            {/* Right: count + button */}
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-2xl font-extrabold text-gray-900">{items.length}</p>
                <p className="text-xs text-gray-400 -mt-0.5">type{items.length > 1 ? "s" : ""}</p>
              </div>
              <div className="w-px h-10 bg-gray-100 hidden sm:block" />
              <button
                onClick={openAdd}
                className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-sm font-bold px-5 py-2.5 rounded-xl shadow-md shadow-red-200 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-red-200 w-full sm:w-auto"
              >
                <span className="text-base font-extrabold">＋</span>
                <span>Nouveau Type</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

        {/* Cards grid — all screens */}
        {items.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 p-14 text-center text-slate-400 text-sm shadow-sm">
            Aucun type d'AG configuré
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {items.map(item => {
            const c = getColor(item.nom_type);
            return (
              <div key={item.id}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 group overflow-hidden">

                {/* Card top accent */}
                <div className={`h-1.5 w-full ${c.dot}`} />

                <div className="p-5">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-5">
                    <span className={`inline-flex items-center gap-2 text-sm font-semibold px-3 py-1.5 rounded-xl border ${c.bg} ${c.text} ${c.border}`}>
                      <span className={`w-2 h-2 rounded-full ${c.dot}`} />
                      {item.nom_type}
                    </span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(item)}
                        className="p-1.5 rounded-lg text-slate-400 hover:bg-orange-50 hover:text-red-600 transition border border-transparent hover:border-orange-100 text-sm"
                        title="Modifier">✏️</button>
                      <button onClick={() => openDelete(item)}
                        className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition border border-transparent hover:border-red-100 text-sm"
                        title="Supprimer">🗑</button>
                    </div>
                  </div>

                  {/* Circle + value */}
                  <div className="flex items-center gap-4 mb-4">
                    <CircleProgress pct={item.quorum} />
                    <div>
                      <p className="text-3xl font-bold text-slate-800 leading-none">{item.quorum}<span className="text-lg text-slate-400 font-semibold">%</span></p>
                      <p className="text-xs text-slate-400 mt-1">Quorum requis</p>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${item.quorum}%`,
                        background: item.quorum >= 66 ? "#10b981" : item.quorum >= 40 ? "#f97316" : "#ef4444"
                      }}
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-1.5">{item.quorum}% des membres présents</p>
                </div>

                {/* Card footer */}
                <div className={`px-5 py-3 border-t border-slate-50 flex justify-end gap-2 sm:hidden`}>
                  <button onClick={() => openEdit(item)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-500 hover:bg-orange-50 hover:text-red-600 transition border border-slate-100">
                    ✏️ Modifier
                  </button>
                  <button onClick={() => openDelete(item)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-500 hover:bg-red-50 hover:text-red-500 transition border border-slate-100">
                    🗑 Supprimer
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL ADD / EDIT */}
      {(modal === "add" || modal === "edit") && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
          onClick={e => e.target === e.currentTarget && close()}>
          <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:w-[95%] sm:max-w-md p-6 sm:p-8 animate-[slideUp_.25s_ease]">
            {/* Handle (mobile) */}
            <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-5 sm:hidden" />

            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  {modal === "add" ? "Nouveau type d'AG" : "Modifier le type"}
                </h2>
                <p className="text-sm text-slate-400 mt-0.5">Assemblée Générale — Quorum</p>
              </div>
              <button onClick={close} className="bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-xl w-9 h-9 flex items-center justify-center transition text-sm hidden sm:flex">✕</button>
            </div>

            <div className="flex flex-col gap-5">
              <Field label="Nom du type *" error={errors.nom_type}>
                <input
                  className={inputCls("nom_type")}
                  value={form.nom_type}
                  onChange={e => setForm({ ...form, nom_type: e.target.value })}
                  placeholder="Ex : Ordinaire, Extraordinaire, Mixte…"
                  autoFocus
                />
              </Field>
              <Field label="Quorum requis (%) *" error={errors.quorum}>
                <div className="relative">
                  <input
                    className={inputCls("quorum") + " pr-10"}
                    type="number" min="1" max="100"
                    value={form.quorum}
                    onChange={e => setForm({ ...form, quorum: e.target.value })}
                    placeholder="Ex : 51"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">%</span>
                </div>
                {form.quorum && !errors.quorum && (
                  <div className="mt-2">
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(+form.quorum, 100)}%`,
                          background: +form.quorum >= 66 ? "#10b981" : +form.quorum >= 40 ? "#f97316" : "#ef4444"
                        }}
                      />
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{form.quorum}% des membres présents</p>
                  </div>
                )}
              </Field>
            </div>

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2.5 mt-7">
              <button onClick={close} className="px-5 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition w-full sm:w-auto">
                Annuler
              </button>
              <button onClick={save} className="px-5 py-2.5 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-sm font-semibold rounded-xl shadow-md shadow-red-200 transition w-full sm:w-auto">
                {modal === "add" ? "Créer le type" : "Sauvegarder"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DELETE */}
      {modal === "delete" && selected && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
          onClick={e => e.target === e.currentTarget && close()}>
          <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:w-[95%] sm:max-w-sm p-6 sm:p-8 text-center">
            <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-5 sm:hidden" />
            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 border border-red-100">⚠️</div>
            <h2 className="text-lg font-bold text-slate-800 mb-2">Supprimer ce type ?</h2>
            <p className="text-sm text-slate-500 mb-7 leading-relaxed">
              Le type <span className="font-semibold text-slate-800">«&nbsp;{selected.nom_type}&nbsp;»</span> et son quorum de <span className="font-semibold text-red-600">{selected.quorum}%</span> seront définitivement supprimés.
            </p>
            <div className="flex flex-col-reverse sm:flex-row justify-center gap-2.5">
              <button onClick={close} className="px-5 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition">Annuler</button>
              <button onClick={destroy} className="px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-xl shadow-md shadow-red-200 transition">Supprimer</button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST */}
      {toast && (
        <div className={`fixed bottom-5 right-4 left-4 sm:left-auto sm:right-7 sm:bottom-7 sm:w-auto px-5 py-3 rounded-xl text-sm font-semibold shadow-xl z-[999] flex items-center gap-2 ${
          toast.type === "success" ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
        }`}>
          <span>{toast.type === "success" ? "✓" : "✕"}</span>
          {toast.msg}
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `}</style>
    </div>
  );
}
