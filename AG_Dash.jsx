import React, { useState, useEffect, useRef } from 'react';

// Données mockées (identiques à l'original)
const AGs = [
  { id:1, code:'AG-2024-001', company:'SICAV Atlantique',      date:'2024-03-15', type:'Présentiel', statut:'en_cours', jours:12,  participants:847,  quorum_requis:50, actions_totales:600000, actions_rep:408150 },
  { id:2, code:'AG-2024-002', company:'Fonds BNI Capital',     date:'2024-04-02', type:'Hybride',    statut:'à_venir',  jours:30,  participants:1204, quorum_requis:50, actions_totales:980000, actions_rep:412000 },
  { id:3, code:'AG-2024-003', company:'Coris Invest Plus',     date:'2024-01-20', type:'En ligne',   statut:'passée',   jours:-45, participants:523,  quorum_requis:67, actions_totales:450000, actions_rep:198500 },
  { id:4, code:'AG-2024-004', company:'BRVM Equity Fund',      date:'2024-05-10', type:'Présentiel', statut:'à_venir',  jours:58,  participants:976,  quorum_requis:50, actions_totales:720000, actions_rep:0      },
  { id:5, code:'AG-2024-005', company:'Sanlam Participations', date:'2024-02-28', type:'Hybride',    statut:'en_cours', jours:5,   participants:342,  quorum_requis:50, actions_totales:310000, actions_rep:148200 },
  { id:6, code:'AG-2024-006', company:'Nsia Finances SA',      date:'2023-12-10', type:'En ligne',   statut:'passée',   jours:-78, participants:689,  quorum_requis:67, actions_totales:530000, actions_rep:402100 },
];

const SGI_PALETTE = [
  { bg:'#2563eb', light:'#eff6ff', text:'#1d4ed8' },
  { bg:'#dc2626', light:'#fef2f2', text:'#b91c1c' },
  { bg:'#059669', light:'#f0fdf4', text:'#047857' },
  { bg:'#d97706', light:'#fffbeb', text:'#b45309' },
  { bg:'#7c3aed', light:'#f5f3ff', text:'#6d28d9' },
];

const SGIs = [
  { id:'S1', nom:'SOGESTIS',              pal:0, actions:128400, participants:[{nom:'Kouassi Jean-Baptiste',role:'Actionnaire principal'},{nom:'Amara Diallo',role:'Représentant'},{nom:'Fatou Ndiaye',role:'Actionnaire'},{nom:'Moussa Traoré',role:'Actionnaire'},{nom:'Aïcha Koné',role:'Représentant'},{nom:'Sékou Camara',role:'Actionnaire'},{nom:'Bintou Coulibaly',role:'Actionnaire'}]},
  { id:'S2', nom:'Africaine de Courtage', pal:1, actions:98250,  participants:[{nom:'Ibrahima Fall',role:'Actionnaire'},{nom:'Mariama Bah',role:'Représentant'},{nom:'Oumar Sy',role:'Actionnaire principal'},{nom:'Khadija Touré',role:'Actionnaire'}]},
  { id:'S3', nom:'CORIS Bourse',          pal:2, actions:75600,  participants:[{nom:'Mamadou Keita',role:'Actionnaire'},{nom:'Aminata Sow',role:'Actionnaire'},{nom:'Lamine Diouf',role:'Représentant'},{nom:'Rokhaya Gaye',role:'Actionnaire'},{nom:'Pape Ndoye',role:'Actionnaire principal'},{nom:'Ndèye Sarr',role:'Actionnaire'}]},
  { id:'S4', nom:'BNI Gestion',           pal:3, actions:62100,  participants:[{nom:'Cheikh Diaw',role:'Actionnaire'},{nom:'Awa Mbaye',role:'Représentant'},{nom:'Bara Diop',role:'Actionnaire'}]},
  { id:'S5', nom:'Hudson & Cie',          pal:4, actions:43800,  participants:[{nom:'Ernest Zadi',role:'Actionnaire'},{nom:'Louise Aka',role:'Actionnaire'},{nom:'Didier Boni',role:'Représentant'},{nom:'Marcelline Kohou',role:'Actionnaire principal'},{nom:'Arnaud Yoboué',role:'Actionnaire'}]},
];

const DCBR = [
  { sgi:'SOGESTIS',            ag:128400, dep:128000, ecart:400   },
  { sgi:'Africaine Courtage',  ag:98250,  dep:98250,  ecart:0     },
  { sgi:'CORIS Bourse',        ag:75600,  dep:76000,  ecart:-400  },
  { sgi:'BNI Gestion',         ag:62100,  dep:62100,  ecart:0     },
  { sgi:'Hudson & Cie',        ag:43800,  dep:43500,  ecart:300   },
];

const FILES = [
  { id:1, sgi:'SOGESTIS',            nom:'liste_sogestis.xlsx'  },
  { id:2, sgi:'Africaine Courtage',  nom:'liste_africaine.xlsx' },
  { id:3, sgi:'CORIS Bourse',        nom:'liste_coris.xlsx'     },
];

// Helpers (identiques)
const fmt = n => (n || 0).toLocaleString('fr-FR');
const fmtD = iso => new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
const initials = name => name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

const statutCfg = {
  en_cours: { label: 'En cours', cls: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' },
  à_venir: { label: 'À venir', cls: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200' },
  passée: { label: 'Passée', cls: 'bg-slate-100 text-slate-500 ring-1 ring-slate-200' },
};

const statutBadge = s => {
  const c = statutCfg[s] || { label: s, cls: 'bg-slate-100 text-slate-500' };
  return `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${c.cls}">${c.label}</span>`;
};

const ecartBadge = e => e === 0
  ? `<span class="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">Équilibré</span>`
  : Math.abs(e) < 500
    ? `<span class="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 ring-1 ring-amber-200">Écart mineur</span>`
    : `<span class="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-red-50 text-red-700 ring-1 ring-red-200">Déficit</span>`;

const joursText = j => j < 0
  ? `<span class="text-slate-400 text-xs">Terminée</span>`
  : `<span class="text-xs font-medium ${j <= 7 ? 'text-amber-600' : 'text-slate-500'}">${j} j. restants</span>`;

const typeBadge = t => `<span class="inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-500">${t}</span>`;

const quorumPct = ag => ag.actions_totales > 0 ? Math.round((ag.actions_rep / ag.actions_totales) * 100) : 0;
const quorumOk = ag => quorumPct(ag) >= ag.quorum_requis;
const quorumColor = ag => {
  const p = quorumPct(ag), r = ag.quorum_requis;
  if (p === 0) return { bar: 'bg-slate-200', text: 'text-slate-400', bg: 'bg-slate-50', border: 'border-slate-200' };
  if (p >= r) return { bar: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' };
  if (p >= r * .8) return { bar: 'bg-amber-400', text: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' };
  return { bar: 'bg-red-400', text: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200' };
};

// Composant principal
const AGDashboard = () => {
  const [view, setView] = useState('list'); // 'list' ou 'detail'
  const [currentAG, setCurrentAG] = useState(null);
  const [filterText, setFilterText] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSGI, setModalSGI] = useState(null);
  const [modalParticipants, setModalParticipants] = useState([]);
  const [modalPal, setModalPal] = useState(null);
  const [modalSearch, setModalSearch] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [agOpen, setAgOpen] = useState(false);
  const [agOpenTime, setAgOpenTime] = useState('');

  const toastTimer = useRef(null);

  // Filtrage des AG pour la liste
  const filteredAGs = AGs.filter(ag =>
    ag.code.toLowerCase().includes(filterText.toLowerCase()) ||
    ag.company.toLowerCase().includes(filterText.toLowerCase())
  );

  // Gestion du toast
  const showToast = (msg) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToastMessage(msg);
    setToastVisible(true);
    toastTimer.current = setTimeout(() => {
      setToastVisible(false);
    }, 2600);
  };

  // Navigation
  const openDetail = (id) => {
    const ag = AGs.find(a => a.id === id);
    setCurrentAG(ag);
    setView('detail');
    setAgOpen(false); // Réinitialiser l'état d'ouverture quand on change d'AG
  };

  const backToList = () => {
    setView('list');
    setCurrentAG(null);
  };

  // Modal participants
  const openParticipants = (sgiId) => {
    const sgi = SGIs.find(s => s.id === sgiId);
    setModalSGI(sgi);
    setModalParticipants(sgi.participants);
    setModalPal(SGI_PALETTE[sgi.pal]);
    setModalSearch('');
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalSGI(null);
    setModalParticipants([]);
    setModalPal(null);
  };

  const filteredParticipants = modalParticipants.filter(p =>
    p.nom.toLowerCase().includes(modalSearch.toLowerCase())
  );

  // Gestion de l'ouverture/fermeture de l'AG dans la vue détail
  const toggleAG = () => {
    if (agOpen) {
      // Fermer
      setAgOpen(false);
      showToast('Assemblée Générale clôturée');
    } else {
      // Ouvrir
      const now = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      setAgOpenTime(`Session démarrée à ${now}`);
      setAgOpen(true);
      showToast('Assemblée Générale ouverte ✅');
    }
  };

  // Rendu de la vue liste
  const renderList = () => (
    <>
      {/* Page header */}
      <div className="flex flex-wrap items-end justify-between gap-4 px-8 pt-8 pb-0">
        <div>
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-1">Gestion</p>
          <h1 className="font-serif text-[2.4rem] leading-tight text-slate-900">Assemblées Générales</h1>
          <p className="text-sm text-slate-500 mt-1">Suivez et gérez l'ensemble de vos assemblées</p>
        </div>
        <button
          onClick={() => showToast('Formulaire de création ouvert')}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 active:scale-95 transition-all shadow-sm shadow-blue-600/20"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Nouvelle AG
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 px-8 pt-6">
        <StatCard label="Total AG" value="12" color="bg-blue-600" dot="bg-blue-500" />
        <StatCard label="En cours" value="3" color="bg-emerald-600" dot="bg-emerald-500" />
        <StatCard label="À venir" value="5" color="bg-amber-500" dot="bg-amber-400" />
        <StatCard label="Passées" value="4" color="bg-slate-400" dot="bg-slate-300" />
      </div>

      {/* Search + filter */}
      <div className="flex gap-3 px-8 pt-5">
        <div className="relative flex-1 max-w-2xl">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 text-sm transition-all"
            placeholder="Rechercher par code AG ou entreprise…"
          />
        </div>
        <button
          onClick={() => showToast('Filtres ouverts')}
          className="flex items-center gap-2 px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-500 text-sm font-medium hover:border-slate-300 hover:text-slate-700 transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M3 6h18M7 12h10M11 18h2" />
          </svg>
          Filtres
        </button>
      </div>

      {/* AG Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 px-8 py-6 pb-14">
        {filteredAGs.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-24 text-slate-400">
            <svg className="w-12 h-12 mb-4 opacity-30" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <p className="font-medium">Aucune assemblée trouvée</p>
            <p className="text-sm mt-1">Essayez un autre terme de recherche</p>
          </div>
        ) : (
          filteredAGs.map((ag, index) => (
            <AGCard key={ag.id} ag={ag} index={index} onOpenDetail={openDetail} showToast={showToast} />
          ))
        )}
      </div>
    </>
  );

  // Rendu de la vue détail
  const renderDetail = () => {
    if (!currentAG) return null;
    const ag = currentAG;
    const totalEcart = DCBR.reduce((s, r) => s + Math.abs(r.ecart), 0);
    const totalPart = SGIs.reduce((s, g) => s + g.participants.length, 0);
    const totalAct = SGIs.reduce((s, g) => s + g.actions, 0);

    return (
      <>
        {/* Back + breadcrumb */}
        <div className="flex items-center gap-3 px-8 pt-6">
          <button
            onClick={backToList}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-slate-500 text-sm font-medium hover:text-slate-800 hover:border-slate-300 hover:-translate-x-0.5 transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Retour
          </button>
          <div className="text-sm text-slate-400 flex items-center gap-1.5">
            <span>Assemblées</span><span>/</span><span className="text-slate-600 font-medium">{ag.company}</span>
          </div>
        </div>

        {/* Hero card */}
        <div className="mx-8 mt-5 bg-[#0f172a] rounded-2xl p-8 relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'repeating-linear-gradient(0deg,#fff 0px,#fff 1px,transparent 1px,transparent 40px),repeating-linear-gradient(90deg,#fff 0px,#fff 1px,transparent 1px,transparent 40px)' }}></div>
          <div className="relative flex flex-wrap items-start justify-between gap-6">
            {/* Left */}
            <div className="flex flex-col gap-4">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-mono text-slate-500 bg-white/10 px-2.5 py-1 rounded-md">{ag.code}</span>
                  <span className={statutCfg[ag.statut].cls}>{statutCfg[ag.statut].label}</span>
                </div>
                <h2 className="font-serif text-3xl text-white mb-1">{ag.company}</h2>
                <p className="text-slate-400 text-sm flex items-center gap-1.5 mb-4">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  {fmtD(ag.date)} &nbsp;·&nbsp; {ag.type}
                </p>

                {/* Quorum compact */}
                <QuorumCompact ag={ag} />
              </div>

              {/* Ouvrir l'AG button */}
              <button
                id="btn-open-ag"
                onClick={toggleAG}
                className={`group inline-flex items-center gap-3 px-5 py-3 rounded-xl font-semibold text-sm active:scale-95 transition-all w-fit border shadow-lg ${agOpen
                    ? 'bg-emerald-600 hover:bg-emerald-500 border-emerald-500 shadow-emerald-900/40'
                    : 'bg-blue-600 hover:bg-blue-500 border-blue-500 shadow-blue-900/40'
                  }`}
              >
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
                </span>
                {agOpen ? (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" />
                      <rect x="9" y="9" width="6" height="6" fill="currentColor" stroke="none" />
                    </svg>
                    AG en cours
                    <span className="text-xs font-normal opacity-70">· En cours</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" />
                      <polygon points="10 8 16 12 10 16 10 8" fill="currentColor" stroke="none" />
                    </svg>
                    Ouvrir l'AG
                    <svg className="w-3.5 h-3.5 opacity-50 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </>
                )}
              </button>
            </div>

            {/* Right buttons */}
            <div className="flex flex-wrap gap-2 mt-1">
              <button onClick={() => showToast('Documents AG chargés ✅')} className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                Charger documents
              </button>
              <button onClick={() => showToast('Upload fichier SGI')} className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white/10 text-white text-xs font-semibold hover:bg-white/20 transition-colors border border-white/10">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                Charger fichier
              </button>
              <button onClick={() => showToast('Dépositaire ouvert')} className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
                Dépositaire
              </button>
              <button onClick={() => showToast('Remplacement ouvert')} className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-amber-500 text-white text-xs font-semibold hover:bg-amber-600 transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M21 2v6h-6" />
                  <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
                  <path d="M3 22v-6h6" />
                  <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
                </svg>
                Remplacer
              </button>
            </div>
          </div>
        </div>

        {/* AG ouverte banner */}
        {agOpen && (
          <div id="ag-open-banner" className="mx-8 mt-3">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-5 py-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 border border-emerald-200 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" />
                    <polygon points="10 8 16 12 10 16 10 8" fill="currentColor" stroke="none" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-emerald-800">Assemblée Générale ouverte</p>
                  <p className="text-xs text-emerald-600 mt-0.5">{agOpenTime}</p>
                </div>
              </div>
              <button
                onClick={toggleAG}
                className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white border border-red-200 text-red-600 text-xs font-semibold hover:bg-red-50 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M9 9l6 6M15 9l-6 6" />
                </svg>
                Clôturer l'AG
              </button>
            </div>
          </div>
        )}

        {/* Stats cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3 px-8 pt-5">
          <StatCardDetail label="Total Écart" value={fmt(totalEcart)} color="amber" />
          <StatCardDetail label="Total DCBR" value={fmt(totalAct)} color="slate" />
          <StatCardDetail label="Actionnaires" value={totalPart} color="blue" />
          <StatCardDetail label="SGI représentées" value={SGIs.length} color="purple" />
          <StatCardDetail label="Actions totales" value={fmt(totalAct)} color="emerald" />
        </div>

        {/* Sections: Actionnaires + DCBR */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mx-8 mt-5">
          {/* Actionnaires par SGI */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-slate-100">
              <div>
                <p className="font-semibold text-slate-900 text-sm">Actionnaires par SGI</p>
                <p className="text-xs text-slate-400 mt-0.5">Données consolidées</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => showToast('Export Excel lancé')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors">⬇ Excel</button>
                <button onClick={() => showToast('Export CSV lancé')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-700 text-white text-xs font-semibold hover:bg-slate-800 transition-colors">⬇ CSV</button>
              </div>
            </div>
            <div className="overflow-auto flex-1">
              <table className="w-full text-sm">
                <thead className="sticky top-0 z-10">
                  <tr className="text-left text-[11px] uppercase tracking-widest text-slate-400 bg-slate-50 border-b border-slate-100">
                    <th className="px-5 py-3 font-semibold">Actionnaire</th>
                    <th className="px-5 py-3 font-semibold">SGI</th>
                    <th className="px-5 py-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {SGIs.flatMap(s => {
                    const pal = SGI_PALETTE[s.pal];
                    return s.participants.slice(0, 2).map(p => (
                      <tr key={p.nom} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-2.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0" style={{ background: pal.bg }}>
                              {initials(p.nom)}
                            </div>
                            <span className="font-medium text-slate-800 text-xs leading-snug">{p.nom}</span>
                          </div>
                        </td>
                        <td className="px-5 py-2.5">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold" style={{ background: pal.light, color: pal.text }}>{s.nom}</span>
                        </td>
                        <td className="px-5 py-2.5 font-semibold text-slate-700 text-xs">{fmt(Math.floor(s.actions / s.participants.length))}</td>
                      </tr>
                    ));
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Rapprochement DCBR */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-slate-100">
              <div>
                <p className="font-semibold text-slate-900 text-sm">Rapprochement DCBR</p>
                <p className="text-xs text-slate-400 mt-0.5">Comparaison fichiers dépositaire</p>
              </div>
              <button onClick={() => showToast('Export DCBR lancé')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors">⬇ Excel</button>
            </div>
            <div className="overflow-auto flex-1">
              <table className="w-full text-sm">
                <thead className="sticky top-0 z-10">
                  <tr className="text-left text-[11px] uppercase tracking-widest text-slate-400 bg-slate-50 border-b border-slate-100">
                    <th className="px-5 py-3 font-semibold">SGI</th>
                    <th className="px-5 py-3 font-semibold">Qté AG</th>
                    <th className="px-5 py-3 font-semibold">Qté DCBR</th>
                    <th className="px-5 py-3 font-semibold">Écart</th>
                    <th className="px-5 py-3 font-semibold">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {DCBR.map(r => (
                    <tr key={r.sgi} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-2.5 font-semibold text-slate-800 text-xs">{r.sgi}</td>
                      <td className="px-5 py-2.5 text-slate-600 text-xs">{fmt(r.ag)}</td>
                      <td className="px-5 py-2.5 text-slate-600 text-xs">{fmt(r.dep)}</td>
                      <td className={`px-5 py-2.5 font-bold text-xs ${r.ecart === 0 ? 'text-emerald-600' : r.ecart > 0 ? 'text-amber-600' : 'text-red-600'}`}>
                        {r.ecart > 0 ? '+' : ''}{fmt(r.ecart)}
                      </td>
                      <td className="px-5 py-2.5" dangerouslySetInnerHTML={{ __html: ecartBadge(r.ecart) }} />
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Fichiers */}
        <div className="bg-white rounded-2xl border border-slate-200 mx-8 mt-4 overflow-hidden">
          <div className="px-7 py-4 border-b border-slate-100">
            <p className="font-semibold text-slate-900 text-sm">Fichiers participants chargés</p>
          </div>
          <div className="p-5 flex flex-wrap gap-3">
            {FILES.map(f => (
              <div key={f.id} className="flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300 hover:shadow-sm transition-all">
                <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800 leading-none">{f.sgi}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{f.nom}</p>
                </div>
                <div className="flex gap-1.5 ml-3">
                  <button onClick={() => showToast(`Remplacement de ${f.nom}`)} className="p-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors" title="Remplacer">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M21 2v6h-6" />
                      <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
                      <path d="M3 22v-6h6" />
                      <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
                    </svg>
                  </button>
                  <button onClick={() => showToast('Fichier supprimé')} className="p-1.5 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors" title="Supprimer">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-1 14H6L5 6" />
                      <path d="M9 6V4h6v2" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SGI participants */}
        <div className="bg-white rounded-2xl border border-slate-200 mx-8 mt-4 overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 px-7 py-4 border-b border-slate-100">
            <div>
              <p className="font-semibold text-slate-900 text-sm">Actionnaires présents</p>
              <p className="text-xs text-slate-400 mt-0.5">Cliquez pour voir les participants d'une SGI</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => showToast('Export Excel participants')} className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors">⬇ Excel</button>
              <button onClick={() => showToast('Export PDF participants')} className="px-3 py-1.5 rounded-lg bg-slate-700 text-white text-xs font-semibold hover:bg-slate-800 transition-colors">⬇ PDF</button>
            </div>
          </div>
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {SGIs.map(s => {
              const pal = SGI_PALETTE[s.pal];
              return (
                <div
                  key={s.id}
                  onClick={() => openParticipants(s.id)}
                  className="rounded-xl border border-slate-200 overflow-hidden cursor-pointer hover:border-slate-300 hover:shadow-md hover:-translate-y-1 transition-all duration-200"
                >
                  <div className="px-5 py-4" style={{ background: pal.bg }}>
                    <p className="text-white font-semibold text-sm leading-none">{s.nom}</p>
                    <p className="text-white/70 text-xs mt-1">SGI</p>
                  </div>
                  <div className="bg-white p-4">
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="rounded-lg px-3 py-2 border border-slate-100 bg-slate-50">
                        <p className="text-[10px] uppercase tracking-widest text-slate-400">Actions</p>
                        <p className="font-bold text-slate-900 text-sm mt-0.5">{fmt(s.actions)}</p>
                      </div>
                      <div className="rounded-lg px-3 py-2 border border-slate-100 bg-slate-50">
                        <p className="text-[10px] uppercase tracking-widest text-slate-400">Participants</p>
                        <p className="font-bold text-slate-900 text-sm mt-0.5">{s.participants.length}</p>
                      </div>
                    </div>
                    <div className="flex gap-1 flex-wrap mb-3">
                      {s.participants.slice(0, 5).map(p => (
                        <div
                          key={p.nom}
                          className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold ring-2 ring-white"
                          style={{ background: pal.bg }}
                          title={p.nom}
                        >
                          {initials(p.nom)}
                        </div>
                      ))}
                      {s.participants.length > 5 && (
                        <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[10px] font-bold ring-2 ring-white">
                          +{s.participants.length - 5}
                        </div>
                      )}
                    </div>
                    <p className="text-xs font-semibold flex items-center gap-1" style={{ color: pal.text }}>
                      Voir les participants
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="bg-[#f5f6f8] min-h-screen text-slate-800">
      {/* Sidebar */}
      <aside className="fixed top-0 left-0 h-full w-[68px] bg-[#0f172a] flex flex-col items-center py-5 gap-1.5 z-50 border-r border-white/5">
        <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-sm mb-5 select-none">AG</div>
        <NavBtn icon="🏛️" active label="Assemblées" />
        <NavBtn icon="🏢" label="Entreprises" />
        <NavBtn icon="📊" label="SGI" />
        <div className="w-7 h-px bg-white/10 my-2"></div>
        <NavBtn icon="📄" label="Documents" />
        <NavBtn icon="📈" label="Rapports" />
        <div className="mt-auto flex flex-col gap-1.5">
          <NavBtn icon="⚙️" label="Paramètres" />
          <NavBtn icon="👤" label="Profil" />
        </div>
      </aside>

      {/* Main */}
      <div className="ml-[68px]">
        {/* Topbar */}
        <header className="sticky top-0 z-40 h-14 bg-white/90 backdrop-blur border-b border-slate-200 flex items-center justify-between px-8">
          <nav className="flex items-center gap-1.5 text-sm">
            <span className="text-slate-400">Tableau de bord</span>
            <span className="text-slate-300">/</span>
            <span className="font-semibold text-slate-800">Assemblées Générales</span>
          </nav>
          <div className="flex items-center gap-3">
            <div className="relative hidden sm:block">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                className="pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 w-52 transition-all"
                placeholder="Recherche…"
              />
            </div>
            <div className="w-px h-5 bg-slate-200"></div>
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-xs">AD</div>
          </div>
        </header>

        {/* Contenu principal */}
        {view === 'list' ? renderList() : renderDetail()}
      </div>

      {/* Modal participants */}
      {modalOpen && (
        <div
          className="modal-wrap fixed inset-0 bg-slate-900/40 backdrop-blur-[3px] flex items-center justify-center z-50 opacity-100"
          onClick={closeModal}
        >
          <div
            className="modal-box bg-white rounded-2xl w-full max-w-md mx-4 max-h-[80vh] flex flex-col shadow-2xl shadow-slate-900/15 translate-y-0 border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-7 pt-7 pb-5 border-b border-slate-100">
              <h2 className="font-serif text-2xl text-slate-900">{modalSGI?.nom}</h2>
              <p className="text-sm text-slate-500 mt-1">{modalSGI?.participants.length} participants présents</p>
            </div>
            <div className="px-5 py-4 border-b border-slate-100">
              <div className="relative">
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
                <input
                  value={modalSearch}
                  onChange={(e) => setModalSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-400 text-sm transition-all"
                  placeholder="Rechercher…"
                />
              </div>
            </div>
            <div className="overflow-y-auto flex-1 p-3">
              {filteredParticipants.length === 0 ? (
                <div className="py-10 text-center text-slate-400 text-sm">Aucun résultat</div>
              ) : (
                filteredParticipants.map(p => (
                  <div key={p.nom} className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-slate-50 transition-colors">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background: modalPal?.bg }}>
                      {initials(p.nom)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800 leading-none">{p.nom}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{p.role}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex justify-end">
              <button onClick={closeModal} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">Fermer</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      <div
        className={`toast-bar fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2.5 shadow-xl transition-all duration-300 ${toastVisible ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0 pointer-events-none'
          }`}
      >
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
        <span>{toastMessage}</span>
      </div>
    </div>
  );
};

// Sous-composants

const NavBtn = ({ icon, active, label }) => (
  <button className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all ${active ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-white/10 hover:text-white'}`} title={label}>
    {icon}
  </button>
);

const StatCard = ({ label, value, color, dot }) => (
  <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3 hover:shadow-sm transition-shadow">
    <div className={`w-10 h-10 rounded-xl ${color} bg-opacity-10 flex items-center justify-center flex-shrink-0`}>
      <div className={`w-2 h-2 rounded-full ${dot}`}></div>
    </div>
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-xl font-serif font-semibold text-slate-900">{value}</p>
    </div>
  </div>
);

const StatCardDetail = ({ label, value, color }) => {
  const colorMap = {
    amber: { bg: 'bg-amber-50', border: 'border-amber-100', text: 'text-amber-600', icon: 'text-amber-500' },
    slate: { bg: 'bg-slate-100', border: 'border-slate-200', text: 'text-slate-900', icon: 'text-slate-500' },
    blue: { bg: 'bg-blue-50', border: 'border-blue-100', text: 'text-blue-700', icon: 'text-blue-500' },
    purple: { bg: 'bg-purple-50', border: 'border-purple-100', text: 'text-purple-700', icon: 'text-purple-500' },
    emerald: { bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-600', icon: 'text-emerald-500' },
  };
  const c = colorMap[color] || colorMap.slate;
  return (
    <div className={`bg-white rounded-2xl border ${c.border} p-5 flex flex-col gap-3 hover:shadow-sm transition-shadow`}>
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">{label}</p>
        <div className={`w-8 h-8 rounded-lg ${c.bg} border ${c.border} flex items-center justify-center`}>
          <svg className={`w-4 h-4 ${c.icon}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            {/* Icône simplifiée, vous pouvez adapter selon le label */}
            <path d="M13 17H17M17 17V13M17 17L7 7M7 7H11M7 7V11" />
          </svg>
        </div>
      </div>
      <div>
        <p className={`font-serif text-3xl ${c.text}`}>{value}</p>
        <p className={`text-[11px] ${c.icon} font-medium mt-1 flex items-center gap-1`}>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path d="M12 19V5M5 12l7-7 7 7" />
          </svg>
          {label === 'Total Écart' ? 'Actions en écart' :
            label === 'Total DCBR' ? 'Actions déposées' :
              label === 'Actionnaires' ? 'Présents à l\'AG' :
                label === 'SGI représentées' ? 'Sociétés de gestion' :
                  'Capital représenté'}
        </p>
      </div>
    </div>
  );
};

const AGCard = ({ ag, index, onOpenDetail, showToast }) => {
  const pct = quorumPct(ag);
  const c = quorumColor(ag);
  const ok = quorumOk(ag);
  const label = pct === 0 ? 'Non renseigné' : ok ? 'Quorum atteint' : 'Quorum insuffisant';

  return (
    <div
      className={`card-enter bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-blue-300 hover:shadow-lg hover:shadow-blue-500/5 hover:-translate-y-1 transition-all duration-200 cursor-pointer group`}
      style={{ animationDelay: `${index * 0.05}s` }}
      onClick={() => onOpenDetail(ag.id)}
    >
      <div className={`h-1 w-full ${ag.statut === 'en_cours' ? 'bg-emerald-500' : ag.statut === 'à_venir' ? 'bg-blue-500' : 'bg-slate-300'}`}></div>
      <div className="px-5 pt-5 pb-4 border-b border-slate-100">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-mono text-slate-400 mb-1">{ag.code}</p>
            <h3 className="font-semibold text-slate-900 text-base leading-snug truncate">{ag.company}</h3>
          </div>
          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs border border-slate-200">
            {ag.company.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
          </div>
        </div>
        <div className="flex items-center gap-1.5 mt-2.5 text-slate-500 text-xs">
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          {fmtD(ag.date)}
        </div>
      </div>
      <div className="px-5 py-4">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className={statutCfg[ag.statut].cls}>{statutCfg[ag.statut].label}</span>
          <span className="inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-500">{ag.type}</span>
          <div className="ml-auto" dangerouslySetInnerHTML={{ __html: joursText(ag.jours) }} />
        </div>
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="rounded-xl bg-slate-50 border border-slate-100 px-3 py-2.5">
            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-medium">Participants</p>
            <p className="text-slate-900 font-semibold mt-0.5">{fmt(ag.participants)}</p>
          </div>
          <div className="rounded-xl bg-slate-50 border border-slate-100 px-3 py-2.5">
            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-medium">Type</p>
            <p className="text-slate-900 font-semibold mt-0.5 truncate">{ag.type}</p>
          </div>
        </div>
        <div className={`rounded-xl border ${c.border} ${c.bg} px-3 py-2.5`}>
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-[10px] uppercase tracking-widest font-semibold text-slate-400">Quorum</p>
            <div className="flex items-center gap-1.5">
              <span className={`text-[11px] font-bold ${c.text}`}>{pct}%</span>
              <span className="text-[10px] text-slate-400">/ {ag.quorum_requis}% requis</span>
            </div>
          </div>
          <div className="relative h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div className="absolute top-0 bottom-0 w-px bg-slate-400 z-10" style={{ left: `${ag.quorum_requis}%` }}></div>
            <div className={`${c.bar} h-full rounded-full transition-all duration-500`} style={{ width: `${Math.min(pct, 100)}%` }}></div>
          </div>
          <p className={`text-[10px] ${c.text} font-medium mt-1`}>{label}</p>
        </div>
      </div>
      <div className="px-5 pb-5 flex gap-2">
        <button
          onClick={(e) => { e.stopPropagation(); onOpenDetail(ag.id); }}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 active:scale-95 transition-all"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          Voir détails
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); showToast(`Édition de ${ag.code}`); }}
          className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg border border-slate-200 text-slate-500 text-xs font-semibold hover:bg-slate-50 hover:text-slate-700 transition-all"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
          Modifier
        </button>
      </div>
    </div>
  );
};

const QuorumCompact = ({ ag }) => {
  const pct = quorumPct(ag);
  const ok = quorumOk(ag);
  const c = quorumColor(ag);
  const barW = Math.min(pct, 100);
  const statusLabel = pct === 0 ? 'Non renseigné' : ok ? 'Quorum atteint' : 'Insuffisant';
  const statusIcon = ok
    ? <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5" /></svg>
    : <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>;

  return (
    <div className="bg-white/8 border border-white/10 rounded-xl px-4 py-3 w-64">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">Quorum</span>
        <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${ok ? 'bg-emerald-500/20 text-emerald-400' : pct === 0 ? 'bg-white/10 text-slate-400' : 'bg-amber-500/20 text-amber-400'}`}>
          {statusIcon} {statusLabel}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex-1 relative h-2 bg-white/10 rounded-full overflow-visible">
          <div
            className={`h-full rounded-full transition-all duration-700 ${ok ? 'bg-emerald-400' : pct === 0 ? 'bg-slate-500' : 'bg-amber-400'}`}
            style={{ width: `${barW}%` }}
          ></div>
          <div className="absolute top-1/2 -translate-y-1/2 w-px h-3.5 bg-white/40 rounded-full" style={{ left: `${ag.quorum_requis}%` }}></div>
        </div>
        <span className="text-sm font-bold text-white whitespace-nowrap">{pct}% <span className="text-slate-500 font-normal text-xs">/ {ag.quorum_requis}%</span></span>
      </div>
    </div>
  );
};

export default AGDashboard;
