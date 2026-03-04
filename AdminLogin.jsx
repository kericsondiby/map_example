import { useState, useEffect } from "react";
import {
  CreditCard, Lock, Eye, EyeOff,
  AlertCircle, ArrowRight
} from "lucide-react";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Mono:wght@300;400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #fff; overflow: hidden; }

  @keyframes slideLeft  { from { opacity:0; transform:translateX(-40px) } to { opacity:1; transform:translateX(0) } }
  @keyframes slideRight { from { opacity:0; transform:translateX(40px)  } to { opacity:1; transform:translateX(0) } }
  @keyframes spin       { to { transform:rotate(360deg) } }
  @keyframes shake      {
    10%,90%  { transform:translateX(-2px) }
    20%,80%  { transform:translateX(4px) }
    30%,50%,70% { transform:translateX(-6px) }
    40%,60%  { transform:translateX(6px) }
    100%     { transform:translateX(0) }
  }
  @keyframes pulseRed {
    0%,100% { box-shadow: 0 0 0 0 rgba(220,38,38,.45) }
    50%     { box-shadow: 0 0 0 6px rgba(220,38,38,0) }
  }
  @keyframes floatY {
    0%,100% { transform: translateY(0px) rotate(-6deg) }
    50%     { transform: translateY(-14px) rotate(-6deg) }
  }
  @keyframes floatX {
    0%,100% { transform: translateX(0px) rotate(12deg) }
    50%     { transform: translateX(12px) rotate(12deg) }
  }
  @keyframes ticker {
    from { transform: translateX(0) }
    to   { transform: translateX(-50%) }
  }
  @keyframes ripple {
    0%   { transform:scale(0); opacity:.4 }
    100% { transform:scale(4); opacity:0 }
  }
  @keyframes dash {
    from { stroke-dashoffset: 300 }
    to   { stroke-dashoffset: 0 }
  }
  @keyframes fadeUp {
    from { opacity:0; transform:translateY(10px) }
    to   { opacity:1; transform:translateY(0) }
  }

  .anim-left  { animation: slideLeft  .7s cubic-bezier(.16,1,.3,1) both }
  .anim-right { animation: slideRight .7s cubic-bezier(.16,1,.3,1) both }
  .anim-d1 { animation-delay:.05s }
  .anim-d2 { animation-delay:.13s }
  .anim-d3 { animation-delay:.21s }
  .anim-d4 { animation-delay:.29s }
  .anim-d5 { animation-delay:.37s }

  .shake-it { animation: shake .45s cubic-bezier(.36,.07,.19,.97) }
  .deco-a   { animation: floatY 5s ease-in-out infinite }
  .deco-b   { animation: floatX 6.5s ease-in-out infinite }

  .circle-path {
    stroke-dasharray: 300;
    animation: dash 1.8s cubic-bezier(.16,1,.3,1) .4s forwards;
  }

  /* Input */
  .inp {
    width: 100%;
    background: #fff;
    border: 1.5px solid #e5e7eb;
    border-radius: 10px;
    padding: 13px 48px 13px 46px;
    font-family: 'DM Mono', monospace;
    font-size: 14px;
    color: #111;
    outline: none;
    transition: border-color .2s, box-shadow .2s;
    letter-spacing: .03em;
  }
  .inp::placeholder { color: #c4c4c4; }
  .inp:focus {
    border-color: #dc2626;
    box-shadow: 0 0 0 3px rgba(220,38,38,.1);
  }
  .inp:disabled { opacity:.45; cursor:not-allowed; background:#fafafa; }

  /* Button */
  .btn-submit {
    position: relative; overflow: hidden;
    width: 100%; padding: 15px 24px;
    background: #dc2626;
    border: none; border-radius: 10px;
    font-family: 'DM Mono', monospace;
    font-size: 13px; font-weight: 500;
    letter-spacing: .12em; text-transform: uppercase;
    color: #fff; cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 10px;
    transition: background .2s, transform .15s, box-shadow .2s;
  }
  .btn-submit:hover:not(:disabled) {
    background: #b91c1c;
    transform: translateY(-1px);
    box-shadow: 0 10px 32px rgba(220,38,38,.35);
  }
  .btn-submit:active:not(:disabled) { transform: translateY(0); }
  .btn-submit:disabled { opacity:.5; cursor:not-allowed; }
  .btn-submit .ripple-el {
    position: absolute;
    background: rgba(255,255,255,.25);
    border-radius: 50%;
    width: 80px; height: 80px;
    margin-top: -40px; margin-left: -40px;
    animation: ripple .65s linear;
    pointer-events: none;
  }

  .spinner {
    width:14px; height:14px;
    border:2px solid rgba(255,255,255,.3);
    border-top-color:#fff;
    border-radius:50%;
    animation:spin .7s linear infinite;
  }

  .ticker-wrap { overflow:hidden; white-space:nowrap; padding:9px 0; }
  .ticker-inner {
    display:inline-block;
    animation: ticker 20s linear infinite;
    font-family:'DM Mono',monospace;
    font-size:10px; letter-spacing:.14em;
    color:rgba(255,255,255,.28); text-transform:uppercase;
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
      <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#fff", position:"relative" }}>

          {/* subtle red glow */}
          <div style={{ position:"absolute", top:"-10%", right:"-10%", width:500, height:500,
            background:"radial-gradient(circle, rgba(220,38,38,.05) 0%, transparent 70%)",
            pointerEvents:"none" }} />
          <div style={{ position:"absolute", bottom:"-10%", left:"-10%", width:400, height:400,
            background:"radial-gradient(circle, rgba(220,38,38,.04) 0%, transparent 70%)",
            pointerEvents:"none" }} />

          <div style={{ width:"100%", maxWidth:440, padding:"48px 40px" }}>

            {/* Badge */}
            <div className="anim-right anim-d1" style={{ opacity: mounted ? undefined : 0, marginBottom:36 }}>
              <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:34, fontWeight:900,
                color:"#111", letterSpacing:"-.02em", lineHeight:1.1 }}>
                Connexion<br />
                <span style={{ color:"#dc2626" }}>Administrateur</span>
              </h1>
              <p style={{ fontFamily:"'DM Mono',monospace", fontSize:12, color:"#9ca3af",
                marginTop:10, letterSpacing:".03em", lineHeight:1.7 }}>
                Identifiez-vous pour accéder au tableau de bord.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} autoComplete="off">

              {/* Matricule */}
              <div className="anim-right anim-d2" style={{ opacity: mounted ? undefined : 0, marginBottom:16 }}>
                <label style={{ display:"block", fontFamily:"'DM Mono',monospace",
                  fontSize:10, letterSpacing:".16em", textTransform:"uppercase", marginBottom:8,
                  color: focused==="mat" ? "#dc2626" : "#9ca3af", transition:"color .2s" }}>
                  Matricule
                </label>
                <div style={{ position:"relative" }}>
                  <span style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)",
                    color: focused==="mat" ? "#dc2626" : "#d1d5db",
                    transition:"color .2s", pointerEvents:"none", display:"flex", alignItems:"center" }}>
                    <CreditCard size={16} />
                  </span>
                  <input className="inp" type="text" placeholder="EMP-000000"
                    value={matricule} onChange={e => setMatricule(e.target.value)}
                    onFocus={() => setFocused("mat")} onBlur={() => setFocused(null)}
                    disabled={loading} />
                </div>
              </div>

              {/* Password */}
              <div className="anim-right anim-d3" style={{ opacity: mounted ? undefined : 0, marginBottom:22 }}>
                <label style={{ display:"block", fontFamily:"'DM Mono',monospace",
                  fontSize:10, letterSpacing:".16em", textTransform:"uppercase", marginBottom:8,
                  color: focused==="pwd" ? "#dc2626" : "#9ca3af", transition:"color .2s" }}>
                  Mot de passe
                </label>
                <div style={{ position:"relative" }}>
                  <span style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)",
                    color: focused==="pwd" ? "#dc2626" : "#d1d5db",
                    transition:"color .2s", pointerEvents:"none", display:"flex", alignItems:"center" }}>
                    <Lock size={16} />
                  </span>
                  <input className="inp" type={showPass ? "text" : "password"}
                    placeholder="••••••••••••" value={password}
                    onChange={e => setPassword(e.target.value)}
                    onFocus={() => setFocused("pwd")} onBlur={() => setFocused(null)}
                    disabled={loading} style={{ paddingRight:46 }} />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    style={{ position:"absolute", right:13, top:"50%", transform:"translateY(-50%)",
                      background:"none", border:"none", cursor:"pointer",
                      color:"#d1d5db", display:"flex", alignItems:"center", padding:4, transition:"color .2s" }}
                    onMouseEnter={e => e.currentTarget.style.color="#dc2626"}
                    onMouseLeave={e => e.currentTarget.style.color="#d1d5db"}>
                    {showPass ? <EyeOff size={16}/> : <Eye size={16}/>}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div style={{ display:"flex", alignItems:"center", gap:10,
                  background:"#fef2f2", border:"1.5px solid #fecaca",
                  borderRadius:10, padding:"12px 16px", marginBottom:18,
                  fontFamily:"'DM Mono',monospace", fontSize:12, color:"#dc2626",
                  letterSpacing:".02em", animation:"fadeUp .2s ease" }}>
                  <AlertCircle size={14} color="#dc2626" style={{ flexShrink:0 }}/>
                  {error}
                </div>
              )}

              {/* Submit */}
              <div className={`${shake ? "shake-it" : ""} anim-right anim-d4`}
                   style={{ opacity: mounted ? undefined : 0 }}>
                <button type="submit" className="btn-submit" disabled={loading}
                  onClick={!loading ? addRipple : undefined}>
                  {ripples.map(r => (
                    <span key={r.id} className="ripple-el" style={{ left:r.x, top:r.y }} />
                  ))}
                  {loading
                    ? <><div className="spinner"/>Vérification...</>
                    : <><span>Se connecter</span><ArrowRight size={16}/></>}
                </button>
              </div>
            </form>



          </div>
        </div>
    </>
  );
}
