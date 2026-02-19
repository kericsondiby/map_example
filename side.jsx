import { useState } from "react";

/* ─── DATA ─── */
const NAV_ITEMS = [
  { id: "home", label: "Home", badge: null },
  { id: "invoices", label: "Invoices", badge: null },
  { id: "clients", label: "Clients", badge: null },
  { id: "products", label: "Products", badge: null },
  { id: "messages", label: "Messages", badge: 2 },
  { id: "settings", label: "Settings", badge: null },
  { id: "help", label: "Help", badge: null },
];

const STATS = [
  { label: "Total Revenue", value: "$ 216k", delta: "+$341", up: true, orb: "orange" },
  { label: "Inovices",      value: "2,221",  delta: "+121",  up: true, orb: "green" },
  { label: "Clients",       value: "1,423",  delta: "+91",   up: true, orb: "blue" },
  { label: "Loyalty",       value: "78%",    delta: "-1%",   up: false, orb: "red" },
];

const BARS = [
  { month: "Mar", h: 38 },
  { month: "Apr", h: 54 },
  { month: "May", h: 32 },
  { month: "Jun", h: 82, active: true },
  { month: "Jul", h: 46 },
  { month: "Aug", h: 58 },
  { month: "Sep", h: 42 },
  { month: "Oct", h: 50 },
  { month: "Nov", h: 44 },
];

const INVOICES = [
  { no: "PQ-4491C", date: "3 Jul, 2020",  client: "Daniel Padilla",  amount: "$ 2,450",  status: "PAID" },
  { no: "IN-9911J", date: "21 May, 2021", client: "Christina Jacobs", amount: "$ 14,810", status: "OVERDUE" },
  { no: "UV-2319A", date: "14 Apr, 2020", client: "Elizabeth Bailey", amount: "$ 450",    status: "PAID" },
];

/* ─── ICONS ─── */
const Icon = ({ d, size = 17 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const icons = {
  home:     <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  invoices: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="9" y1="7" x2="15" y2="7"/><line x1="9" y1="11" x2="15" y2="11"/><line x1="9" y1="15" x2="13" y2="15"/></svg>,
  clients:  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>,
  products: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 010 14.14M4.93 4.93a10 10 0 000 14.14"/></svg>,
  messages: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>,
  settings: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>,
  help:     <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  logout:   <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  search:   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  logo:     <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2"/><line x1="12" y1="22" x2="12" y2="15.5"/><line x1="22" y1="8.5" x2="12" y2="15.5"/><line x1="2" y1="8.5" x2="12" y2="15.5"/></svg>,
};

/* ─── ORB STYLES ─── */
const orbStyles = {
  orange: { background: "radial-gradient(circle at 35% 35%, #fb923c, #f97316)", boxShadow: "0 4px 12px rgba(249,115,22,0.4)" },
  green:  { background: "radial-gradient(circle at 35% 35%, #4ade80, #22c55e)", boxShadow: "0 4px 12px rgba(34,197,94,0.4)" },
  blue:   { background: "radial-gradient(circle at 35% 35%, #60a5fa, #3b82f6)", boxShadow: "0 4px 12px rgba(59,130,246,0.4)" },
  red:    { background: "radial-gradient(circle at 35% 35%, #f87171, #ef4444)", boxShadow: "0 4px 12px rgba(239,68,68,0.35)" },
};

/* ─── STATUS BADGE ─── */
const StatusBadge = ({ status }) => {
  const styles = {
    PAID:    { background: "#dcfce7", color: "#15803d" },
    OVERDUE: { background: "#fee2e2", color: "#dc2626" },
    PENDING: { background: "#fef9c3", color: "#854d0e" },
  };
  return (
    <span style={{
      ...styles[status],
      fontSize: "0.63rem", fontWeight: 700,
      padding: "3px 8px", borderRadius: 5, letterSpacing: "0.04em",
    }}>
      {status}
    </span>
  );
};

/* ─── MAIN COMPONENT ─── */
export default function InvoDashboard() {
  const [activeNav, setActiveNav] = useState("home");
  const [activeBar, setActiveBar] = useState("Jun");

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", fontFamily: "'Inter', 'Segoe UI', sans-serif", background: "#f4f6fb", color: "#1e293b" }}>

      {/* ── SIDEBAR ── */}
      <aside style={{
        width: 190, background: "#fff", borderRight: "1px solid #e8edf2",
        display: "flex", flexDirection: "column", flexShrink: 0, padding: "0 0 20px",
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "22px 20px 20px" }}>
          <div style={{
            width: 38, height: 38, background: "#2563EB", borderRadius: 10,
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            {icons.logo}
          </div>
          <span style={{ fontSize: "1.3rem", fontWeight: 800, letterSpacing: "-0.04em" }}>Invo.</span>
        </div>

        {/* Nav */}
        <nav style={{ display: "flex", flexDirection: "column", gap: 2, padding: "0 10px", flex: 1 }}>
          {NAV_ITEMS.map(item => (
            <div
              key={item.id}
              onClick={() => setActiveNav(item.id)}
              style={{
                display: "flex", alignItems: "center", gap: 11,
                padding: "11px 13px", borderRadius: 11, cursor: "pointer",
                fontSize: "0.83rem", fontWeight: 500,
                color: activeNav === item.id ? "#fff" : "#64748b",
                background: activeNav === item.id ? "#2563EB" : "transparent",
                transition: "all 0.15s",
                userSelect: "none",
              }}
              onMouseEnter={e => { if (activeNav !== item.id) e.currentTarget.style.background = "#f1f5f9"; }}
              onMouseLeave={e => { if (activeNav !== item.id) e.currentTarget.style.background = "transparent"; }}
            >
              <span style={{ width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, opacity: 0.85 }}>
                {icons[item.id]}
              </span>
              {item.label}
              {item.badge && (
                <span style={{
                  marginLeft: "auto", width: 19, height: 19, borderRadius: "50%",
                  background: activeNav === item.id ? "rgba(255,255,255,0.25)" : "#2563EB",
                  color: activeNav === item.id ? "#fff" : "#fff",
                  fontSize: "0.62rem", fontWeight: 700,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {item.badge}
                </span>
              )}
            </div>
          ))}
        </nav>

        {/* Logout */}
        <div style={{
          margin: "0 10px", display: "flex", alignItems: "center", gap: 11,
          padding: "11px 13px", borderRadius: 11, cursor: "pointer",
          fontSize: "0.83rem", fontWeight: 500, color: "#94a3b8",
        }}>
          {icons.logout} Log Out
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}>

        {/* TOP BAR */}
        <div style={{
          background: "#fff", borderBottom: "1px solid #e8edf2",
          height: 60, display: "flex", alignItems: "center",
          padding: "0 28px", gap: 16, flexShrink: 0,
        }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 9,
            background: "#f4f6fb", border: "1px solid #e8edf2",
            borderRadius: 10, padding: "8px 16px",
            color: "#94a3b8", fontSize: "0.82rem", width: 260,
          }}>
            {icons.search}&nbsp; Tap to search
          </div>

          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{
              width: 36, height: 36, background: "#2563EB", borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontSize: "0.72rem", fontWeight: 800, cursor: "pointer",
            }}>2</div>

            <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
              <div style={{
                width: 38, height: 38,
                background: "linear-gradient(135deg, #60a5fa, #2563eb)",
                borderRadius: "50%", display: "flex", alignItems: "center",
                justifyContent: "center", color: "#fff", fontSize: "0.78rem", fontWeight: 700,
              }}>DS</div>
              <div>
                <div style={{ fontSize: "0.82rem", fontWeight: 700, lineHeight: 1.2 }}>David Spade</div>
                <div style={{ fontSize: "0.69rem", color: "#94a3b8" }}>Sales Admin</div>
              </div>
            </div>
          </div>
        </div>

        {/* SCROLLABLE CONTENT */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px", display: "flex", flexDirection: "column", gap: 18 }}>

          {/* ── STATS ROW ── */}
          <div style={{
            background: "#fff", borderRadius: 16, display: "grid",
            gridTemplateColumns: "repeat(4,1fr)", overflow: "hidden",
            boxShadow: "0 1px 6px rgba(0,0,50,0.04)",
          }}>
            {STATS.map((s, i) => (
              <div key={i} style={{
                padding: "20px 22px", display: "flex", alignItems: "center", gap: 14,
                borderRight: i < 3 ? "1px solid #e8edf2" : "none",
              }}>
                <div style={{ width: 42, height: 42, borderRadius: "50%", flexShrink: 0, ...orbStyles[s.orb] }} />
                <div>
                  <div style={{ fontSize: "0.72rem", color: "#94a3b8", marginBottom: 5 }}>{s.label}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "1.5rem", fontWeight: 700, letterSpacing: "-0.04em", lineHeight: 1 }}>
                    {s.value}
                    <span style={{
                      fontSize: "0.62rem", fontWeight: 600, padding: "2px 6px", borderRadius: 5,
                      background: s.up ? "#dcfce7" : "#fee2e2",
                      color: s.up ? "#16a34a" : "#dc2626",
                    }}>
                      {s.up ? "▲" : "▼"} {s.delta}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ── MID ROW ── */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 18 }}>

            {/* Chart */}
            <div style={{ background: "#fff", borderRadius: 16, padding: "24px 26px 20px", boxShadow: "0 1px 6px rgba(0,0,50,0.04)" }}>
              <div style={{ fontSize: "0.78rem", color: "#94a3b8", marginBottom: 4 }}>Monthly Revenue</div>
              <div style={{ fontSize: "2rem", fontWeight: 700, letterSpacing: "-0.05em", marginBottom: 28 }}>
                <span style={{ fontSize: "1.1rem", fontWeight: 400, marginRight: 2 }}>$</span> 15,000
              </div>

              {/* Bars */}
              <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 110 }}>
                {BARS.map(bar => {
                  const isActive = activeBar === bar.month;
                  return (
                    <div
                      key={bar.month}
                      onClick={() => setActiveBar(bar.month)}
                      style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", height: "100%", justifyContent: "flex-end", cursor: "pointer", position: "relative" }}
                    >
                      {isActive && (
                        <div style={{
                          position: "absolute", bottom: "calc(100% + 24px)", left: "50%",
                          transform: "translateX(-50%)",
                          background: "#1e293b", color: "#fff", fontSize: "0.73rem",
                          fontWeight: 600, padding: "6px 11px", borderRadius: 8, whiteSpace: "nowrap", zIndex: 10,
                        }}>
                          $15,000
                          <div style={{
                            position: "absolute", top: "100%", left: "50%",
                            transform: "translateX(-50%)",
                            borderLeft: "5px solid transparent", borderRight: "5px solid transparent",
                            borderTop: "5px solid #1e293b", width: 0, height: 0,
                          }} />
                        </div>
                      )}
                      <div style={{
                        width: "100%", maxWidth: 38,
                        height: `${bar.h}%`,
                        background: isActive ? "#2563EB" : "#e8edf5",
                        borderRadius: "6px 6px 0 0",
                        transition: "background 0.2s",
                      }} />
                      <div style={{
                        fontSize: "0.65rem", marginTop: 7,
                        color: isActive ? "#2563EB" : "#94a3b8",
                        fontWeight: isActive ? 600 : 400,
                      }}>
                        {bar.month}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Promo */}
            <div style={{
              background: "linear-gradient(145deg, #1d4ed8 0%, #2563eb 45%, #3b82f6 100%)",
              borderRadius: 16, padding: "26px 24px", color: "#fff",
              display: "flex", flexDirection: "column", justifyContent: "space-between",
              position: "relative", overflow: "hidden",
              boxShadow: "0 6px 24px rgba(37,99,235,0.38)",
            }}>
              {/* Decorative circles */}
              <div style={{ position: "absolute", bottom: -40, right: -40, width: 180, height: 180, background: "rgba(96,165,250,0.22)", borderRadius: "50%" }} />
              <div style={{ position: "absolute", bottom: 20, right: 30, width: 110, height: 110, background: "rgba(147,197,253,0.18)", borderRadius: "50%" }} />

              <div style={{ position: "relative", zIndex: 1 }}>
                <div style={{
                  display: "inline-flex", alignItems: "center",
                  background: "rgba(255,255,255,0.22)", fontSize: "0.62rem",
                  fontWeight: 700, letterSpacing: "0.1em",
                  padding: "4px 10px", borderRadius: 20, marginBottom: 16,
                }}>NEW</div>
                <div style={{ fontSize: "1.12rem", fontWeight: 700, lineHeight: 1.35, marginBottom: 10 }}>
                  We have added new invoicing templates!
                </div>
                <div style={{ fontSize: "0.75rem", opacity: 0.72, lineHeight: 1.55, marginBottom: 24 }}>
                  New templates focused on helping you improve your business
                </div>
              </div>

              <div style={{
                background: "#fff", color: "#2563EB",
                fontSize: "0.82rem", fontWeight: 700,
                padding: "12px 16px", borderRadius: 10,
                textAlign: "center", cursor: "pointer",
                position: "relative", zIndex: 1,
              }}>
                Download Now
              </div>
            </div>
          </div>

          {/* ── BOTTOM ROW ── */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.65fr", gap: 18 }}>

            {/* Activities */}
            <div style={{ background: "#fff", borderRadius: 16, padding: "22px", boxShadow: "0 1px 6px rgba(0,0,50,0.04)" }}>
              <div style={{ fontSize: "0.88rem", fontWeight: 700, marginBottom: 18 }}>Activities</div>

              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {/* Item 1 */}
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                    background: "linear-gradient(135deg,#fb923c,#f97316)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#fff", fontSize: "0.72rem", fontWeight: 700,
                  }}>FG</div>
                  <div>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: "0.63rem", fontWeight: 600, padding: "2px 7px", borderRadius: 4, background: "#dcfce7", color: "#15803d", marginBottom: 4 }}>
                      🚩 New Invoice
                    </div>
                    <div style={{ fontSize: "0.79rem", lineHeight: 1.45 }}>
                      <strong>Francisco Gibbs</strong> created invoice PQ-4491C
                    </div>
                    <div style={{ fontSize: "0.68rem", color: "#94a3b8", marginTop: 3 }}>Just Now</div>
                  </div>
                </div>

                {/* Item 2 */}
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                    background: "linear-gradient(135deg,#fbbf24,#f59e0b)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#fff", fontSize: "0.72rem", fontWeight: 700,
                  }}>JL</div>
                  <div>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: "0.63rem", fontWeight: 600, padding: "2px 7px", borderRadius: 4, background: "#ffedd5", color: "#c2410c", marginBottom: 4 }}>
                      🔔 Reminder
                    </div>
                    <div style={{ fontSize: "0.79rem", lineHeight: 1.45 }}>
                      Invoice <strong>JL-3432B</strong> reminder was sent to <strong>Chester Corp</strong>
                    </div>
                    <div style={{ fontSize: "0.68rem", color: "#94a3b8", marginTop: 3 }}>Friday, 12:26PM</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Invoices */}
            <div style={{ background: "#fff", borderRadius: 16, padding: "22px", boxShadow: "0 1px 6px rgba(0,0,50,0.04)" }}>
              <div style={{ fontSize: "0.88rem", fontWeight: 700, marginBottom: 18 }}>Recent Invoices</div>

              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    {["No", "Date Created", "Client", "Amount", "Status"].map(h => (
                      <th key={h} style={{
                        textAlign: "left", fontSize: "0.68rem", fontWeight: 600,
                        color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em",
                        paddingBottom: 10, borderBottom: "1px solid #e8edf2",
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {INVOICES.map((inv, i) => (
                    <tr key={i} style={{ borderBottom: i < INVOICES.length - 1 ? "1px solid #e8edf2" : "none", cursor: "pointer" }}>
                      <td style={{ padding: "11px 0", fontSize: "0.79rem", fontWeight: 600, color: "#2563EB" }}>{inv.no}</td>
                      <td style={{ padding: "11px 0", fontSize: "0.79rem", color: "#1e293b" }}>{inv.date}</td>
                      <td style={{ padding: "11px 0", fontSize: "0.79rem", color: "#1e293b" }}>{inv.client}</td>
                      <td style={{ padding: "11px 0", fontSize: "0.79rem", fontWeight: 600, color: "#1e293b" }}>{inv.amount}</td>
                      <td style={{ padding: "11px 0" }}><StatusBadge status={inv.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
