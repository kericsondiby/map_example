import { useState, useRef } from "react";

const USERS_DB = {
  "A1B2C": {
    nom: "Moreau", prenom: "Sophie",
    actions: 142, code: "A1B2C",
    email: "sophie.moreau@example.com",
    telephone: "+33 6 12 34 56 78",
  },
  "Z9Y8X": {
    nom: "Lefèvre", prenom: "Thomas",
    actions: 89, code: "Z9Y8X",
    email: "thomas.lefevre@example.com",
    telephone: "+33 7 98 76 54 32",
  },
  "K3L4M": {
    nom: "Dubois", prenom: "Camille",
    actions: 217, code: "K3L4M",
    email: "camille.dubois@example.com",
    telephone: "+33 6 55 44 33 22",
  },
};

const CODE_LEN = 5;

export default function App() {
  const [digits, setDigits] = useState(Array(CODE_LEN).fill(""));
  const [phase, setPhase] = useState("idle"); // idle | loading | success | error
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ email: "", telephone: "" });
  const [saved, setSaved] = useState(false);
  const [shake, setShake] = useState(false);
  const inputRefs = useRef([]);

  const code = digits.join("");

  const verify = () => {
    const key = code.toUpperCase().trim();
    if (key.length !== CODE_LEN) return;
    setPhase("loading");
    setTimeout(() => {
      const found = USERS_DB[key];
      if (found) {
        setUser({ ...found });
        setForm({ email: found.email, telephone: found.telephone });
        setPhase("success");
      } else {
        setPhase("error");
        setShake(true);
        setTimeout(() => { setShake(false); setPhase("idle"); }, 700);
      }
    }, 900);
  };

  const handleDigit = (i, val) => {
    const char = val.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(-1);
    const next = [...digits];
    next[i] = char;
    setDigits(next);
    if (char && i < CODE_LEN - 1) inputRefs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) inputRefs.current[i - 1]?.focus();
    if (e.key === "Enter" && code.length === CODE_LEN) verify();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\s/g, "").toUpperCase().slice(0, CODE_LEN);
    const next = Array(CODE_LEN).fill("");
    pasted.split("").forEach((c, i) => { next[i] = c; });
    setDigits(next);
    inputRefs.current[Math.min(pasted.length, CODE_LEN - 1)]?.focus();
  };

  const saveEdit = () => {
    setUser(u => ({ ...u, ...form }));
    setSaved(true);
    setTimeout(() => { setSaved(false); setEditing(false); }, 1300);
  };

  const reset = () => {
    setDigits(Array(CODE_LEN).fill(""));
    setUser(null); setPhase("idle"); setEditing(false); setSaved(false);
    setTimeout(() => inputRefs.current[0]?.focus(), 50);
  };

  const initials = user ? user.prenom[0] + user.nom[0] : "";

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">

      {/* ── VERIFY ── */}
      {phase !== "success" && (
        <div className="w-full max-w-sm sm:max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-10 flex flex-col items-center animate-fadeIn">

          {/* Icon */}
          <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center mb-5">
            <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">Vérifier l'identité</h1>
          <p className="text-sm text-gray-400 mb-8 text-center">Entrez le code de participation à 5 caractères</p>

          {/* Digit boxes */}
          <div className={`flex gap-2 sm:gap-3 mb-6 ${shake ? "animate-shake" : ""}`}>
            {digits.map((char, i) => (
              <input
                key={i}
                ref={el => inputRefs.current[i] = el}
                className={`
                  w-12 h-14 sm:w-14 sm:h-16
                  rounded-xl border-2 text-center text-xl sm:text-2xl font-bold
                  transition-all duration-150 outline-none
                  ${char
                    ? "border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm"
                    : phase === "error"
                      ? "border-red-400 bg-red-50 text-red-600"
                      : "border-gray-200 bg-gray-50 text-gray-900"
                  }
                  focus:border-indigo-500 focus:bg-indigo-50
                `}
                maxLength={2}
                value={char}
                onChange={e => handleDigit(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                onPaste={handlePaste}
                disabled={phase === "loading"}
                autoFocus={i === 0}
                autoComplete="off"
                spellCheck={false}
              />
            ))}
          </div>

          {phase === "error" && (
            <p className="text-sm text-red-500 mb-4 -mt-2">Code introuvable. Réessayez.</p>
          )}

          {/* Verify button */}
          <button
            onClick={verify}
            disabled={code.length !== CODE_LEN || phase === "loading"}
            className={`
              w-full h-12 sm:h-13 rounded-xl font-semibold text-sm sm:text-base
              flex items-center justify-center gap-2 transition-all duration-200
              ${code.length === CODE_LEN && phase !== "loading"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-200 hover:bg-indigo-700 active:scale-95"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }
            `}
          >
            {phase === "loading" ? (
              <>
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Vérification...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
                Vérifier
              </>
            )}
          </button>

          <p className="text-xs text-gray-300 mt-5 text-center">
            Codes démo :&nbsp;
            <span className="font-semibold text-gray-400">A1B2C</span> ·&nbsp;
            <span className="font-semibold text-gray-400">Z9Y8X</span> ·&nbsp;
            <span className="font-semibold text-gray-400">K3L4M</span>
          </p>
        </div>
      )}

      {/* ── USER CARD ── */}
      {phase === "success" && user && (
        <div className="w-full max-w-sm sm:max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-popIn">

          {/* Header */}
          <div className="flex items-center gap-4 px-5 sm:px-7 py-5 sm:py-6 border-b border-gray-100">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-lg sm:text-xl font-bold flex-shrink-0 shadow-md shadow-indigo-100">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-base sm:text-lg font-bold text-gray-900 truncate">{user.prenom} {user.nom}</p>
              <span className="inline-block mt-1 text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md tracking-wide">
                #{user.code}
              </span>
            </div>
            <button
              onClick={reset}
              title="Nouvelle vérification"
              className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors flex-shrink-0"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
              </svg>
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 divide-x divide-gray-100 border-b border-gray-100">
            <div className="flex flex-col items-center py-4 sm:py-5 gap-1">
              <span className="text-2xl sm:text-3xl font-bold text-gray-900">{user.actions}</span>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</span>
            </div>
            <div className="flex flex-col items-center py-4 sm:py-5 gap-1">
              <span className="text-lg sm:text-xl font-bold text-gray-900 font-mono">{user.code}</span>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Code</span>
            </div>
          </div>

          {/* Info view */}
          {!editing && (
            <div className="px-5 sm:px-7 py-4 sm:py-5 animate-fadeIn">
              <InfoRow icon="✉️" label="Email" value={user.email} />
              <InfoRow icon="📞" label="Téléphone" value={user.telephone} />
              <button
                onClick={() => setEditing(true)}
                className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed border-gray-200 text-sm font-semibold text-gray-500 hover:border-indigo-300 hover:text-indigo-500 hover:bg-indigo-50 transition-all"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                Modifier les informations
              </button>
            </div>
          )}

          {/* Edit form */}
          {editing && (
            <div className="px-5 sm:px-7 py-4 sm:py-5 flex flex-col gap-3 animate-fadeIn">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="email@exemple.com"
                  className="w-full h-11 px-4 rounded-xl border-2 border-gray-200 bg-gray-50 text-sm text-gray-900 font-medium focus:outline-none focus:border-indigo-400 focus:bg-white transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Téléphone</label>
                <input
                  type="tel"
                  value={form.telephone}
                  onChange={e => setForm(f => ({ ...f, telephone: e.target.value }))}
                  placeholder="+33 6 00 00 00 00"
                  className="w-full h-11 px-4 rounded-xl border-2 border-gray-200 bg-gray-50 text-sm text-gray-900 font-medium focus:outline-none focus:border-indigo-400 focus:bg-white transition-all"
                />
              </div>
              <div className="flex gap-3 mt-1">
                <button
                  onClick={() => setEditing(false)}
                  className="flex-1 h-11 rounded-xl border-2 border-gray-200 text-sm font-semibold text-gray-500 hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={saveEdit}
                  className={`flex-[2] h-11 rounded-xl text-sm font-semibold text-white transition-all duration-300 ${saved ? "bg-green-500 shadow-md shadow-green-100" : "bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-100"}`}
                >
                  {saved ? "✓ Enregistré !" : "Enregistrer"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Keyframes */}
      <style>{`
        @keyframes fadeIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        @keyframes popIn { from { opacity:0; transform:scale(0.93); } to { opacity:1; transform:scale(1); } }
        @keyframes shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-8px)} 60%{transform:translateX(8px)} 80%{transform:translateX(-4px)} }
        .animate-fadeIn { animation: fadeIn 0.35s ease both; }
        .animate-popIn  { animation: popIn  0.4s cubic-bezier(.34,1.56,.64,1) both; }
        .animate-shake  { animation: shake  0.45s ease both; }
      `}</style>
    </div>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0">
      <span className="text-base w-6 text-center flex-shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5">{label}</p>
        <p className="text-sm font-medium text-gray-700 truncate">{value}</p>
      </div>
    </div>
  );
}
