import { useState } from "react";

/* ─── DATA ─── */
const NAV_ITEMS = [
  { id: "home",     label: "Home",     badge: null },
  { id: "invoices", label: "Invoices", badge: null },
  { id: "clients",  label: "Clients",  badge: null },
  { id: "products", label: "Products", badge: null },
  { id: "messages", label: "Messages", badge: 2    },
  { id: "settings", label: "Settings", badge: null },
  { id: "help",     label: "Help",     badge: null },
];

const STATS = [
  { label: "Total Revenue", value: "$ 216k", delta: "$341", up: true,  orb: "from-orange-400 to-orange-500 shadow-orange-200" },
  { label: "Inovices",      value: "2,221",  delta: "121",  up: true,  orb: "from-green-400 to-green-500 shadow-green-200"   },
  { label: "Clients",       value: "1,423",  delta: "91",   up: true,  orb: "from-blue-400 to-blue-500 shadow-blue-200"      },
  { label: "Loyalty",       value: "78%",    delta: "1%",   up: false, orb: "from-red-400 to-red-500 shadow-red-200"         },
];

const BARS = [
  { month: "Mar", pct: 38  },
  { month: "Apr", pct: 54  },
  { month: "May", pct: 32  },
  { month: "Jun", pct: 82  },
  { month: "Jul", pct: 46  },
  { month: "Aug", pct: 58  },
  { month: "Sep", pct: 42  },
  { month: "Oct", pct: 50  },
  { month: "Nov", pct: 44  },
];

const INVOICES = [
  { no: "PQ-4491C", date: "3 Jul, 2020",  client: "Daniel Padilla",  amount: "$ 2,450",  status: "PAID"    },
  { no: "IN-9911J", date: "21 May, 2021", client: "Christina Jacobs", amount: "$ 14,810", status: "OVERDUE" },
  { no: "UV-2319A", date: "14 Apr, 2020", client: "Elizabeth Bailey", amount: "$ 450",    status: "PAID"    },
];

/* ─── SVG ICONS ─── */
const HomeIcon     = () => <svg className="w-[17px] h-[17px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const InvoicesIcon = () => <svg className="w-[17px] h-[17px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="9" y1="7" x2="15" y2="7"/><line x1="9" y1="11" x2="15" y2="11"/><line x1="9" y1="15" x2="13" y2="15"/></svg>;
const ClientsIcon  = () => <svg className="w-[17px] h-[17px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>;
const ProductsIcon = () => <svg className="w-[17px] h-[17px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 010 14.14M4.93 4.93a10 10 0 000 14.14"/></svg>;
const MessagesIcon = () => <svg className="w-[17px] h-[17px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>;
const SettingsIcon = () => <svg className="w-[17px] h-[17px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>;
const HelpIcon     = () => <svg className="w-[17px] h-[17px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
const LogoutIcon   = () => <svg className="w-[17px] h-[17px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
const SearchIcon   = () => <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const LogoIcon     = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2"/><line x1="12" y1="22" x2="12" y2="15.5"/><line x1="22" y1="8.5" x2="12" y2="15.5"/><line x1="2" y1="8.5" x2="12" y2="15.5"/></svg>;

const NAV_ICONS = { home: <HomeIcon/>, invoices: <InvoicesIcon/>, clients: <ClientsIcon/>, products: <ProductsIcon/>, messages: <MessagesIcon/>, settings: <SettingsIcon/>, help: <HelpIcon/> };

/* ─── STATUS BADGE ─── */
const StatusBadge = ({ status }) => {
  const cls = { PAID: "bg-green-100 text-green-700", OVERDUE: "bg-red-100 text-red-600", PENDING: "bg-yellow-100 text-yellow-700" };
  return <span className={`text-[0.63rem] font-bold px-2 py-0.5 rounded tracking-wide ${cls[status]}`}>{status}</span>;
};

/* ─── COMPONENT ─── */
export default function InvoDashboard() {
  const [activeNav, setActiveNav] = useState("home");
  const [activeBar, setActiveBar] = useState("Jun");

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100 font-sans text-slate-800">

      {/* ── SIDEBAR ── */}
      <aside className="w-[190px] bg-white border-r border-slate-200 flex flex-col flex-shrink-0 pb-5">

        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 pt-5 pb-5">
          <div className="w-[38px] h-[38px] bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <LogoIcon />
          </div>
          <span className="text-xl font-extrabold tracking-tight">Invo.</span>
        </div>

        {/* Nav items */}
        <nav className="flex flex-col gap-0.5 px-2.5 flex-1">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveNav(item.id)}
              className={`flex items-center gap-2.5 px-3 py-[10px] rounded-xl text-[0.83rem] font-medium w-full text-left transition-all duration-150 cursor-pointer
                ${activeNav === item.id ? "bg-blue-600 text-white" : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"}`}
            >
              <span className="w-[22px] h-[22px] flex items-center justify-center flex-shrink-0 opacity-[0.85]">
                {NAV_ICONS[item.id]}
              </span>
              {item.label}
              {item.badge && (
                <span className={`ml-auto w-[19px] h-[19px] rounded-full text-[0.62rem] font-bold flex items-center justify-center
                  ${activeNav === item.id ? "bg-white/25 text-white" : "bg-blue-600 text-white"}`}>
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <button className="mx-2.5 flex items-center gap-2.5 px-3 py-[10px] rounded-xl text-[0.83rem] font-medium text-slate-400 hover:bg-slate-100 hover:text-slate-500 transition-all cursor-pointer">
          <span className="w-[22px] h-[22px] flex items-center justify-center flex-shrink-0"><LogoutIcon /></span>
          Log Out
        </button>
      </aside>

      {/* ── MAIN ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top Bar */}
        <header className="h-[60px] bg-white border-b border-slate-200 flex items-center px-7 gap-4 flex-shrink-0">
          <div className="flex items-center gap-2.5 bg-slate-100 border border-slate-200 rounded-xl px-4 py-2 text-slate-400 text-[0.82rem] w-64 cursor-text">
            <SearchIcon /> <span className="ml-1">Tap to search</span>
          </div>
          <div className="ml-auto flex items-center gap-3.5">
            <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-white text-[0.72rem] font-extrabold cursor-pointer select-none">
              2
            </div>
            <div className="flex items-center gap-2.5 cursor-pointer">
              <div className="w-[38px] h-[38px] rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-[0.78rem] font-bold flex-shrink-0">
                DS
              </div>
              <div>
                <p className="text-[0.82rem] font-bold leading-tight">David Spade</p>
                <p className="text-[0.69rem] text-slate-400">Sales Admin</p>
              </div>
            </div>
          </div>
        </header>

        {/* Scroll Area */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">

          {/* ── STAT CARDS ── */}
          <div className="bg-white rounded-2xl grid grid-cols-4 overflow-hidden shadow-sm">
            {STATS.map((s, i) => (
              <div key={i} className={`flex items-center gap-3.5 px-5 py-5 ${i < 3 ? "border-r border-slate-200" : ""}`}>
                <div className={`w-11 h-11 rounded-full flex-shrink-0 bg-gradient-to-br shadow-md ${s.orb}`} />
                <div>
                  <p className="text-[0.72rem] text-slate-400 mb-1">{s.label}</p>
                  <div className="flex items-center gap-2 text-[1.45rem] font-bold tracking-tight leading-none">
                    {s.value}
                    <span className={`text-[0.6rem] font-semibold px-1.5 py-0.5 rounded
                      ${s.up ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                      {s.up ? "▲" : "▼"} {s.delta}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ── MID ROW ── */}
          <div className="grid grid-cols-[1fr_300px] gap-4">

            {/* Chart Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <p className="text-[0.78rem] text-slate-400 mb-1">Monthly Revenue</p>
              <p className="text-[2rem] font-bold tracking-tight mb-7">
                <span className="text-lg font-normal mr-0.5">$</span> 15,000
              </p>

              <div className="flex items-end gap-2 h-[110px]">
                {BARS.map(bar => {
                  const isActive = activeBar === bar.month;
                  return (
                    <div
                      key={bar.month}
                      onClick={() => setActiveBar(bar.month)}
                      className="flex-1 flex flex-col items-center h-full justify-end cursor-pointer relative group"
                    >
                      {/* Tooltip */}
                      {isActive && (
                        <div className="absolute bottom-[calc(100%+10px)] left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[0.73rem] font-semibold px-2.5 py-1.5 rounded-lg whitespace-nowrap z-10">
                          $15,000
                          <span className="absolute top-full left-1/2 -translate-x-1/2 border-[5px] border-transparent border-t-slate-800 block w-0 h-0" />
                        </div>
                      )}
                      {/* Bar */}
                      <div
                        className={`w-full max-w-[38px] rounded-t-md transition-colors duration-200
                          ${isActive ? "bg-blue-600" : "bg-slate-200 group-hover:bg-blue-200"}`}
                        style={{ height: `${bar.pct}%` }}
                      />
                      {/* Label */}
                      <p className={`text-[0.65rem] mt-1.5 ${isActive ? "text-blue-600 font-semibold" : "text-slate-400"}`}>
                        {bar.month}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Promo Card */}
            <div className="relative overflow-hidden rounded-2xl p-6 text-white flex flex-col justify-between shadow-xl shadow-blue-300/40 bg-gradient-to-br from-blue-800 via-blue-600 to-blue-400">
              <div className="absolute -bottom-10 -right-10 w-44 h-44 bg-blue-400/20 rounded-full pointer-events-none" />
              <div className="absolute bottom-5 right-8 w-28 h-28 bg-blue-300/15 rounded-full pointer-events-none" />
              <div className="relative z-10">
                <span className="inline-block bg-white/20 text-[0.62rem] font-bold tracking-widest px-2.5 py-1 rounded-full mb-4">NEW</span>
                <h3 className="text-[1.1rem] font-bold leading-snug mb-2.5">We have added new invoicing templates!</h3>
                <p className="text-[0.75rem] text-white/70 leading-relaxed mb-6">New templates focused on helping you improve your business</p>
              </div>
              <button className="relative z-10 bg-white text-blue-600 text-[0.82rem] font-bold py-3 rounded-xl text-center hover:opacity-90 transition-opacity cursor-pointer">
                Download Now
              </button>
            </div>
          </div>

          {/* ── BOTTOM ROW ── */}
          <div className="grid grid-cols-[1fr_1.65fr] gap-4">

            {/* Activities */}
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <h3 className="text-[0.88rem] font-bold mb-4">Activities</h3>
              <div className="flex flex-col gap-5">

                <div className="flex gap-3 items-start">
                  <div className="w-9 h-9 rounded-full flex-shrink-0 bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center text-white text-[0.72rem] font-bold">FG</div>
                  <div>
                    <span className="inline-flex items-center gap-1 text-[0.63rem] font-semibold px-2 py-0.5 rounded bg-green-100 text-green-700 mb-1">🚩 New Invoice</span>
                    <p className="text-[0.79rem] leading-snug"><strong>Francisco Gibbs</strong> created invoice PQ-4491C</p>
                    <p className="text-[0.68rem] text-slate-400 mt-0.5">Just Now</p>
                  </div>
                </div>

                <div className="flex gap-3 items-start">
                  <div className="w-9 h-9 rounded-full flex-shrink-0 bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-white text-[0.72rem] font-bold">JL</div>
                  <div>
                    <span className="inline-flex items-center gap-1 text-[0.63rem] font-semibold px-2 py-0.5 rounded bg-orange-100 text-orange-700 mb-1">🔔 Reminder</span>
                    <p className="text-[0.79rem] leading-snug">Invoice <strong>JL-3432B</strong> reminder was sent to <strong>Chester Corp</strong></p>
                    <p className="text-[0.68rem] text-slate-400 mt-0.5">Friday, 12:26PM</p>
                  </div>
                </div>

              </div>
            </div>

            {/* Recent Invoices */}
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <h3 className="text-[0.88rem] font-bold mb-4">Recent Invoices</h3>
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    {["No", "Date Created", "Client", "Amount", "Status"].map(h => (
                      <th key={h} className="text-left text-[0.68rem] font-semibold text-slate-400 uppercase tracking-wide pb-2.5 border-b border-slate-200">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {INVOICES.map((inv, i) => (
                    <tr key={i} className={`hover:bg-slate-50 cursor-pointer transition-colors ${i < INVOICES.length - 1 ? "border-b border-slate-200" : ""}`}>
                      <td className="py-2.5 text-[0.79rem] font-semibold text-blue-600">{inv.no}</td>
                      <td className="py-2.5 text-[0.79rem] text-slate-700">{inv.date}</td>
                      <td className="py-2.5 text-[0.79rem] text-slate-700">{inv.client}</td>
                      <td className="py-2.5 text-[0.79rem] font-semibold text-slate-800">{inv.amount}</td>
                      <td className="py-2.5"><StatusBadge status={inv.status} /></td>
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
