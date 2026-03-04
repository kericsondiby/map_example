import { useState, useEffect } from "react";
import { ShieldCheck, CreditCard, Lock, Eye, EyeOff, AlertCircle, ArrowRight } from "lucide-react";

const STYLES = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #fff; overflow: hidden; }

  @keyframes slideUp   { from { opacity:0; transform:translateY(24px) } to { opacity:1; transform:translateY(0) } }
  @keyframes fadeIn    { from { opacity:0 } to { opacity:1 } }
  @keyframes shake     { 10%,90%{transform:translateX(-2px)} 20%,80%{transform:translateX(4px)} 30%,50%,70%{transform:translateX(-6px)} 40%,60%{transform:translateX(6px)} 100%{transform:translateX(0)} }
  @keyframes spin      { to { transform: rotate(360deg) } }
  @keyframes pulseRed  { 0%,100%{box-shadow:0 0 0 0 rgba(220,38,38,.5)} 50%{box-shadow:0 0 0 6px rgba(220,38,38,0)} }
  @keyframes ripple    { 0%{transform:scale(0);opacity:.4} 100%{transform:scale(4);opacity:0} }

  .anim-1 { animation: slideUp .6s cubic-bezier(.16,1,.3,1) .05s both }
  .anim-2 { animation: slideUp .6s cubic-bezier(.16,1,.3,1) .13s both }
  .anim-3 { animation: slideUp .6s cubic-bezier(.16,1,.3,1) .21s both }
  .anim-4 { animation: slideUp .6s cubic-bezier(.16,1,.3,1) .29s both }
  .anim-5 { animation: slideUp .6s cubic-bezier(.16,1,.3,1) .37s both }

  .shake-it { animation: shake .45s cubic-bezier(.36,.07,.19,.97) }

  .dot-pulse { animation: pulseRed 2s infinite }

  .inp {
    width: 100%;
    background: #fff;
    border: 1.5px solid #e5e7eb;
    border-radius: 10px;
    padding: 13px 48px 13px 46px;
    font-size: 14px;
    color: #111;
    outline: none;
    letter-spacing: .03em;
    transition: border-color .2s, box-shadow .2s;
  }
  .inp::placeholder { color: #cbd5e1; }
  .inp:focus { border-color: #dc2626; box-shadow: 0 0 0 3px rgba(220,38,38,.1); }
  .inp:disabled { opacity: .45; cursor: not-allowed; background: #fafafa; }

  .btn {
    position: relative; overflow: hidden;
    width: 100%; padding: 14px 24px;
    background: #dc2626; border: none; border-radius: 10px;
    font-size: 13px; font-weight: 500;
    letter-spacing: .12em; text-transform: uppercase; color: #fff;
    cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px;
    transition: background .2s, transform .15s, box-shadow .2s;
  }
  .btn:hover:not(:disabled) { background:#b91c1c; transform:translateY(-1px); box-shadow:0 10px 32px rgba(220,38,38,.3); }
  .btn:active:not(:disabled) { transform: translateY(0); }
  .btn:disabled { opacity:.5; cursor:not-allowed; }
  .btn .rpl {
    position:absolute; background:rgba(255,255,255,.25); border-radius:50%;
    width:80px; height:80px; margin-top:-40px; margin-left:-40px;
    animation: ripple .65s linear; pointer-events:none;
  }

  .spinner {
    width:14px; height:14px;
    border:2px solid rgba(255,255,255,.3); border-top-color:#fff;
    border-radius:50%; animation:spin .7s linear infinite;
  }
`;

export default function AdminLogin() {
  const [matricule, setMatricule] = useState("");
  const [password, setPassword]   = useState("");
  const [showPass, setShowPass]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [mounted, setMounted]     = useState(false);
  const [shake, setShake]         = useState(false);
  const [focused, setFocused]     = useState(null);
  const [ripples, setRipples]     = useState([]);

  useEffect(() => { setTimeout(() => setMounted(true), 80); }, []);

  const triggerShake = () => { setShake(true); setTimeout(() => setShake(false), 500); };

  const addRipple = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const id = Date.now();
    setRipples(r => [...r, { id, x: e.clientX - rect.left, y: e.clientY - rect.top }]);
    setTimeout(() => setRipples(r => r.filter(rr => rr.id !== id)), 700);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!matricule || !password) { setError("Veuillez remplir tous les champs."); triggerShake(); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch("/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matricule, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.message || "Identifiants incorrects."); triggerShake();
      }
    } catch { setError("Erreur réseau. Veuillez réessayer."); triggerShake(); }
    finally { setLoading(false); }
  };

  return (
    <>
      <style>{STYLES}</style>

      {/* Page */}
      <div className="min-h-screen bg-white flex items-center justify-center px-4 relative overflow-hidden">

        {/* Soft background glows */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full pointer-events-none"
             style={{ background: "radial-gradient(circle, rgba(220,38,38,.06) 0%, transparent 70%)", transform: "translate(30%, -30%)" }} />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full pointer-events-none"
             style={{ background: "radial-gradient(circle, rgba(220,38,38,.04) 0%, transparent 70%)", transform: "translate(-30%, 30%)" }} />

        {/* Card */}
        <div className={`relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 px-10 py-12 ${mounted ? "" : "opacity-0"}`}
             style={{ transition: "opacity .4s" }}>

          {/* Red top accent */}
          <div className="absolute top-0 left-10 right-10 h-px bg-red-500 opacity-60 rounded-full" />

          {/* ── Header ── */}
          <div className={`mb-10 ${mounted ? "anim-1" : "opacity-0"}`}>

            {/* Shield icon + badge row */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center flex-shrink-0">
                <ShieldCheck size={20} className="text-red-600" />
              </div>
              <div className="inline-flex items-center gap-2 bg-red-50 border border-red-100 rounded-full px-3 py-1">
                <span className="dot-pulse w-2 h-2 rounded-full bg-red-500 inline-block" />
                <span className="text-red-600 uppercase tracking-widest" style={{ fontSize: 10 }}>
                  Accès restreint
                </span>
              </div>
            </div>

            <h1 className="text-4xl font-black text-gray-900 leading-tight tracking-tight">
              Connexion<br />
              <span className="text-red-600">Administrateur</span>
            </h1>
            <p className="text-sm text-gray-400 mt-3 leading-relaxed tracking-wide">
              Identifiez-vous pour accéder au tableau de bord.
            </p>
          </div>

          {/* ── Form ── */}
          <form onSubmit={handleSubmit} autoComplete="off">

            {/* Matricule */}
            <div className={`mb-4 ${mounted ? "anim-2" : "opacity-0"}`}>
              <label className={`block text-xs uppercase tracking-widest mb-2 transition-colors duration-200 ${focused === "mat" ? "text-red-600" : "text-gray-400"}`}>
                Matricule
              </label>
              <div className="relative">
                <span className={`absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-200 flex items-center ${focused === "mat" ? "text-red-500" : "text-gray-300"}`}>
                  <CreditCard size={16} />
                </span>
                <input className="inp" type="text" placeholder="EMP-000000"
                  value={matricule} onChange={e => setMatricule(e.target.value)}
                  onFocus={() => setFocused("mat")} onBlur={() => setFocused(null)}
                  disabled={loading} />
              </div>
            </div>

            {/* Password */}
            <div className={`mb-6 ${mounted ? "anim-3" : "opacity-0"}`}>
              <label className={`block text-xs uppercase tracking-widest mb-2 transition-colors duration-200 ${focused === "pwd" ? "text-red-600" : "text-gray-400"}`}>
                Mot de passe
              </label>
              <div className="relative">
                <span className={`absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-200 flex items-center ${focused === "pwd" ? "text-red-500" : "text-gray-300"}`}>
                  <Lock size={16} />
                </span>
                <input className="inp" type={showPass ? "text" : "password"}
                  placeholder="••••••••••••" value={password}
                  onChange={e => setPassword(e.target.value)}
                  onFocus={() => setFocused("pwd")} onBlur={() => setFocused(null)}
                  disabled={loading} style={{ paddingRight: 46 }} />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-300 hover:text-red-500 transition-colors duration-200 flex items-center"
                  style={{ background: "none", border: "none", cursor: "pointer" }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5 text-red-600 text-xs tracking-wide">
                <AlertCircle size={14} className="flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Submit */}
            <div className={`${shake ? "shake-it" : ""} ${mounted ? "anim-4" : "opacity-0"}`}>
              <button type="submit" className="btn" disabled={loading}
                onClick={!loading ? addRipple : undefined}>
                {ripples.map(r => <span key={r.id} className="rpl" style={{ left: r.x, top: r.y }} />)}
                {loading
                  ? <><div className="spinner" />Vérification...</>
                  : <><span>Se connecter</span><ArrowRight size={16} /></>}
              </button>
            </div>
          </form>

          {/* ── Footer ── */}
          <div className={`mt-8 pt-6 border-t border-gray-100 flex items-center justify-between ${mounted ? "anim-5" : "opacity-0"}`}>
            <div className="flex items-center gap-2 text-gray-300">
              <ShieldCheck size={12} className="text-red-400 opacity-60" />
              <span className="text-xs uppercase tracking-widest">Connexion chiffrée</span>
            </div>
            <span className="text-xs text-gray-200 uppercase tracking-widest">v2.4.1</span>
          </div>

        </div>
      </div>
    </>
  );
}
