import React, { useState, useEffect, useRef, useCallback } from "react";

import {
  fetchAgsApi,
  fetchActionnairesSgiApi,
  fetchAgFilesApi,
  fetchCompaniesApi,
  fetchDepositaireCompareApi,
  fetchParticipantsApi,
  fetchSGIsApi,
  replaceDepositaireApi,
  replaceFileSgiApi,
  importDepositaireApi,
  deleteFileApi,
  downloadParticipantsApi,
  uploadFileSgiApi,
  createAgApi,
} from "../../services/agService";

/* ─────────────────────────────── Constantes ─────────────────────────────── */

const SGI_PALETTE = [
  { bg: "#2563eb", light: "#eff6ff", text: "#1d4ed8" },
  { bg: "#dc2626", light: "#fef2f2", text: "#b91c1c" },
  { bg: "#059669", light: "#f0fdf4", text: "#047857" },
  { bg: "#d97706", light: "#fffbeb", text: "#b45309" },
  { bg: "#7c3aed", light: "#f5f3ff", text: "#6d28d9" },
];

/* ─────────────────────────────── Helpers ─────────────────────────────── */

const fmt = (n) => (n || 0).toLocaleString("fr-FR");
const fmtD = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};
const initials = (name = "") =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const downloadBlob = (blob, filename) => {
  const url = window.URL.createObjectURL(new Blob([blob]));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};

const statutCfg = {
  en_cours: { label: "En cours", cls: "inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200" },
  "en cours": { label: "En cours", cls: "inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200" },
  a_venir: { label: "À venir", cls: "inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 ring-1 ring-blue-200" },
  "à venir": { label: "À venir", cls: "inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 ring-1 ring-blue-200" },
  passee: { label: "Passée", cls: "inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-500 ring-1 ring-slate-200" },
  passée: { label: "Passée", cls: "inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-500 ring-1 ring-slate-200" },
};

const ecartBadge = (e) =>
  e === 0
    ? `<span class="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">Équilibré</span>`
    : Math.abs(e) < 500
    ? `<span class="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 ring-1 ring-amber-200">Écart mineur</span>`
    : `<span class="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-red-50 text-red-700 ring-1 ring-red-200">Déficit</span>`;

const joursText = (j) =>
  j < 0
    ? `<span class="text-slate-400 text-xs">Terminée</span>`
    : `<span class="text-xs font-medium ${j <= 7 ? "text-amber-600" : "text-slate-500"}">${j} j. restants</span>`;

const quorumPct = (ag) =>
  ag?.actions_totales > 0
    ? Math.round(((ag?.actions_rep || 0) / ag.actions_totales) * 100)
    : 0;
const quorumOk = (ag) => quorumPct(ag) >= (ag?.quorum_requis || 50);
const quorumColor = (ag) => {
  const p = quorumPct(ag), r = ag?.quorum_requis || 50;
  if (p === 0) return { bar: "bg-slate-200", text: "text-slate-400", bg: "bg-slate-50", border: "border-slate-200" };
  if (p >= r) return { bar: "bg-emerald-500", text: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" };
  if (p >= r * 0.8) return { bar: "bg-amber-400", text: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200" };
  return { bar: "bg-red-400", text: "text-red-700", bg: "bg-red-50", border: "border-red-200" };
};

/* ══════════════════════════════════════════════════════════════════════════
   COMPOSANT PRINCIPAL
══════════════════════════════════════════════════════════════════════════ */

const AGDashboard = () => {
  /* ─── Navigation ─── */
  const [view, setView] = useState("list");
  const [currentAG, setCurrentAG] = useState(null);
  const [filterText, setFilterText] = useState("");

  /* ─── État liste ─── */
  const [ags, setAgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState([]);

  /* ─── État détail ─── */
  const [agFiles, setAgFiles] = useState([]);
  const [agActionnaires, setAgActionnaires] = useState([]);
  const [agDCBR, setAgDCBR] = useState([]);
  const [sgiList, setSgiList] = useState([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [agOpen, setAgOpen] = useState(false);
  const [agOpenTime, setAgOpenTime] = useState("");

  /* ─── Modal participants ─── */
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSGI, setModalSGI] = useState(null);
  const [modalParticipants, setModalParticipants] = useState([]);
  const [modalPal, setModalPal] = useState(null);
  const [modalSearch, setModalSearch] = useState("");

  /* ─── Modal Nouvelle AG ─── */
  const [newAgModalOpen, setNewAgModalOpen] = useState(false);
  const [newAgForm, setNewAgForm] = useState({ entreprise: "", date: "", type: "", mode_ag: "" });
  const [submittingAG, setSubmittingAG] = useState(false);

  /* ─── Modal Importer Dépositaire ─── */
  const [importDepModalOpen, setImportDepModalOpen] = useState(false);
  const [importDepFile, setImportDepFile] = useState(null);
  const [importDepLoading, setImportDepLoading] = useState(false);

  /* ─── Modal Remplacer Dépositaire ─── */
  const [remplacerDepModalOpen, setRemplacerDepModalOpen] = useState(false);
  const [remplacerDepFile, setRemplacerDepFile] = useState(null);
  const [remplacerDepLoading, setRemplacerDepLoading] = useState(false);

  /* ─── Modal Charger Fichier SGI ─── */
  const [chargerFichierModalOpen, setChargerFichierModalOpen] = useState(false);
  const [chargerFichierForm, setChargerFichierForm] = useState({ sgiId: "", file: null });
  const [chargerFichierLoading, setChargerFichierLoading] = useState(false);

  /* ─── Modal Remplacer Fichier SGI ─── */
  const [replaceFileModalOpen, setReplaceFileModalOpen] = useState(false);
  const [replaceFileTarget, setReplaceFileTarget] = useState(null);
  const [replaceFileForm, setReplaceFileForm] = useState({ sgiId: "", file: null });
  const [replaceFileLoading, setReplaceFileLoading] = useState(false);

  /* ─── Modal Voir Dépositaire (comparaison) ─── */
  const [depositaireModalOpen, setDepositaireModalOpen] = useState(false);
  const [depositaireData, setDepositaireData] = useState([]);
  const [depositaireLoading, setDepositaireLoading] = useState(false);

  /* ─── Modal Confirmer Suppression ─── */
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  /* ─── Toast ─── */
  const [toastMessage, setToastMessage] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const [toastType, setToastType] = useState("success"); // success | error
  const toastTimer = useRef(null);

  /* ════════════════════════════════════════════════
     TOAST
  ════════════════════════════════════════════════ */
  const showToast = useCallback((msg, type = "success") => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToastMessage(msg);
    setToastType(type);
    setToastVisible(true);
    toastTimer.current = setTimeout(() => setToastVisible(false), 2800);
  }, []);

  /* ════════════════════════════════════════════════
     CHARGEMENT LISTE
  ════════════════════════════════════════════════ */
  const loadAgs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetchAgsApi();
      const items = res?.data?.items || [];
      const mapped = items.map((ag) => ({
        id: ag.id,
        code: ag.code_ag,
        company: ag.entreprise?.nom_entreprise || "—",
        entreprise_id: ag.entreprise?.id,
        date: ag.date_ag,
        statut: ag.statut_ag,
        type: ag.type_ag,
        jours: ag.jours_restant ?? 0,
        participants: ag.nb_participants ?? 0,
        actions_rep: ag.actions_rep ?? 0,
        actions_totales: ag.actions_totales ?? 0,
        quorum_requis: ag.quorum_requis ?? 50,
      }));
      setAgs(mapped);
    } catch (err) {
      console.error("Erreur AG:", err);
      showToast("Impossible de charger les AG", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const loadCompanies = useCallback(async () => {
    try {
      const res = await fetchCompaniesApi();
      setCompanies(res?.data?.data || []);
    } catch {}
  }, []);

  useEffect(() => {
    loadAgs();
    loadCompanies();
  }, [loadAgs, loadCompanies]);

  /* ════════════════════════════════════════════════
     CHARGEMENT DÉTAIL
  ════════════════════════════════════════════════ */
  const loadDetailData = useCallback(async (ag) => {
    setDetailLoading(true);
    try {
      const [filesRes, actRes, partRes, sgiRes] = await Promise.allSettled([
        fetchAgFilesApi(ag.id),
        fetchActionnairesSgiApi(ag.entreprise_id, ag.code),
        fetchParticipantsApi(ag.code),
        fetchSGIsApi(),
      ]);

      if (filesRes.status === "fulfilled") {
        setAgFiles(filesRes.value?.data?.data || filesRes.value?.data || []);
      }
      if (actRes.status === "fulfilled") {
        setAgActionnaires(actRes.value?.data?.data || actRes.value?.data || []);
      }
      if (sgiRes.status === "fulfilled") {
        setSgiList(sgiRes.value?.data?.data || sgiRes.value?.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  /* ════════════════════════════════════════════════
     NAVIGATION
  ════════════════════════════════════════════════ */
  const openDetail = (id) => {
    const ag = ags.find((a) => a.id === id);
    if (!ag) return;
    setCurrentAG(ag);
    setView("detail");
    setAgOpen(false);
    setAgFiles([]);
    setAgActionnaires([]);
    setAgDCBR([]);
    loadDetailData(ag);
  };

  const backToList = () => {
    setView("list");
    setCurrentAG(null);
  };

  /* ════════════════════════════════════════════════
     TOGGLE AG
  ════════════════════════════════════════════════ */
  const toggleAG = () => {
    if (agOpen) {
      setAgOpen(false);
      showToast("Assemblée Générale clôturée");
    } else {
      const now = new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
      setAgOpenTime(`Session démarrée à ${now}`);
      setAgOpen(true);
      showToast("Assemblée Générale ouverte ✅");
    }
  };

  /* ════════════════════════════════════════════════
     MODAL PARTICIPANTS
  ════════════════════════════════════════════════ */
  const openParticipants = (sgi) => {
    const pal = SGI_PALETTE[sgi.pal_index ?? 0] || SGI_PALETTE[0];
    setModalSGI(sgi);
    setModalParticipants(sgi.participants || []);
    setModalPal(pal);
    setModalSearch("");
    setModalOpen(true);
  };

  const filteredParticipants = modalParticipants.filter((p) =>
    (p.nom || p.name || "").toLowerCase().includes(modalSearch.toLowerCase())
  );

  /* ════════════════════════════════════════════════
     NOUVELLE AG
  ════════════════════════════════════════════════ */
  const submitNewAG = async () => {
    if (!newAgForm.entreprise || !newAgForm.date || !newAgForm.type) {
      showToast("Veuillez remplir tous les champs obligatoires", "error");
      return;
    }
    try {
      setSubmittingAG(true);
      const payload = {
        date_ag: newAgForm.date,
        entreprise_id: Number(newAgForm.entreprise),
        mode_ag: newAgForm.mode_ag,
        type_ag: newAgForm.type,
      };
      await createAgApi(payload);
      setNewAgModalOpen(false);
      setNewAgForm({ entreprise: "", date: "", type: "", mode_ag: "" });
      showToast("AG créée avec succès ✅");
      await loadAgs();
    } catch (err) {
      showToast("Erreur lors de la création de l'AG", "error");
    } finally {
      setSubmittingAG(false);
    }
  };

  /* ════════════════════════════════════════════════
     IMPORTER DÉPOSITAIRE
  ════════════════════════════════════════════════ */
  const submitImportDep = async () => {
    if (!importDepFile) { showToast("Veuillez sélectionner un fichier", "error"); return; }
    try {
      setImportDepLoading(true);
      await importDepositaireApi(currentAG.id, importDepFile);
      setImportDepModalOpen(false);
      setImportDepFile(null);
      showToast("Fichier dépositaire importé ✅");
      await loadDetailData(currentAG);
    } catch {
      showToast("Erreur lors de l'import", "error");
    } finally {
      setImportDepLoading(false);
    }
  };

  /* ════════════════════════════════════════════════
     REMPLACER DÉPOSITAIRE
  ════════════════════════════════════════════════ */
  const submitRemplacerDep = async () => {
    if (!remplacerDepFile) { showToast("Veuillez sélectionner un fichier", "error"); return; }
    try {
      setRemplacerDepLoading(true);
      await replaceDepositaireApi(currentAG.id, remplacerDepFile);
      setRemplacerDepModalOpen(false);
      setRemplacerDepFile(null);
      showToast("Dépositaire remplacé ✅");
      await loadDetailData(currentAG);
    } catch {
      showToast("Erreur lors du remplacement", "error");
    } finally {
      setRemplacerDepLoading(false);
    }
  };

  /* ════════════════════════════════════════════════
     CHARGER FICHIER SGI
  ════════════════════════════════════════════════ */
  const submitChargerFichier = async () => {
    if (!chargerFichierForm.sgiId || !chargerFichierForm.file) {
      showToast("Veuillez sélectionner une SGI et un fichier", "error"); return;
    }
    try {
      setChargerFichierLoading(true);
      await uploadFileSgiApi(currentAG.id, chargerFichierForm.file, chargerFichierForm.sgiId);
      setChargerFichierModalOpen(false);
      setChargerFichierForm({ sgiId: "", file: null });
      showToast("Fichier SGI chargé ✅");
      const filesRes = await fetchAgFilesApi(currentAG.id);
      setAgFiles(filesRes?.data?.data || filesRes?.data || []);
    } catch {
      showToast("Erreur lors du chargement", "error");
    } finally {
      setChargerFichierLoading(false);
    }
  };

  /* ════════════════════════════════════════════════
     REMPLACER FICHIER SGI
  ════════════════════════════════════════════════ */
  const openReplaceFile = (file) => {
    setReplaceFileTarget(file);
    setReplaceFileForm({ sgiId: "", file: null });
    setReplaceFileModalOpen(true);
  };

  const submitReplaceFile = async () => {
    if (!replaceFileForm.file) { showToast("Veuillez sélectionner un fichier", "error"); return; }
    try {
      setReplaceFileLoading(true);
      await replaceFileSgiApi(replaceFileTarget.id, replaceFileForm.file, replaceFileForm.sgiId || replaceFileTarget.sgi_id);
      setReplaceFileModalOpen(false);
      setReplaceFileTarget(null);
      showToast("Fichier remplacé ✅");
      const filesRes = await fetchAgFilesApi(currentAG.id);
      setAgFiles(filesRes?.data?.data || filesRes?.data || []);
    } catch {
      showToast("Erreur lors du remplacement", "error");
    } finally {
      setReplaceFileLoading(false);
    }
  };

  /* ════════════════════════════════════════════════
     SUPPRIMER FICHIER
  ════════════════════════════════════════════════ */
  const openDeleteFile = (file) => {
    setFileToDelete(file);
    setDeleteConfirmOpen(true);
  };

  const confirmDeleteFile = async () => {
    try {
      setDeleteLoading(true);
      await deleteFileApi(fileToDelete.id);
      setDeleteConfirmOpen(false);
      setFileToDelete(null);
      showToast("Fichier supprimé ✅");
      const filesRes = await fetchAgFilesApi(currentAG.id);
      setAgFiles(filesRes?.data?.data || filesRes?.data || []);
    } catch {
      showToast("Erreur lors de la suppression", "error");
    } finally {
      setDeleteLoading(false);
    }
  };

  /* ════════════════════════════════════════════════
     VOIR DÉPOSITAIRE
  ════════════════════════════════════════════════ */
  const openDepositaireModal = async () => {
    try {
      setDepositaireLoading(true);
      setDepositaireModalOpen(true);
      const res = await fetchDepositaireCompareApi(currentAG.code);
      setDepositaireData(res?.data?.data || res?.data || []);
    } catch {
      showToast("Impossible de charger le dépositaire", "error");
    } finally {
      setDepositaireLoading(false);
    }
  };

  /* ════════════════════════════════════════════════
     EXPORTS
  ════════════════════════════════════════════════ */
  const exportActionnaires = async (format) => {
    try {
      const res = await fetchActionnairesSgiApi(currentAG.entreprise_id, currentAG.code, true, format);
      downloadBlob(res.data, `actionnaires_${currentAG.code}.${format}`);
      showToast(`Export ${format.toUpperCase()} lancé ✅`);
    } catch {
      showToast("Erreur lors de l'export", "error");
    }
  };

  const exportDepositaire = async () => {
    try {
      const res = await fetchDepositaireCompareApi(currentAG.code, true);
      downloadBlob(res.data, `dcbr_${currentAG.code}.xlsx`);
      showToast("Export DCBR lancé ✅");
    } catch {
      showToast("Erreur lors de l'export", "error");
    }
  };

  const exportParticipants = async (format) => {
    try {
      const res = await downloadParticipantsApi(currentAG.code, format);
      downloadBlob(res.data, `participants_${currentAG.code}.${format}`);
      showToast(`Export ${format.toUpperCase()} lancé ✅`);
    } catch {
      showToast("Erreur lors de l'export", "error");
    }
  };

  /* ════════════════════════════════════════════════
     FILTRAGE
  ════════════════════════════════════════════════ */
  const filteredAGs = ags.filter(
    (ag) =>
      ag.code?.toLowerCase().includes(filterText.toLowerCase()) ||
      ag.company?.toLowerCase().includes(filterText.toLowerCase())
  );

  /* ════════════════════════════════════════════════
     BUILD SGI LIST FOR DETAIL (from agActionnaires)
  ════════════════════════════════════════════════ */
  const sgiCards = (() => {
    if (agActionnaires && agActionnaires.length > 0) {
      return agActionnaires.map((s, i) => ({
        id: s.id || s.sgi_id || String(i),
        nom: s.nom || s.sgi_nom || s.sgi || "SGI",
        pal_index: i % SGI_PALETTE.length,
        actions: s.actions || s.nb_actions || 0,
        participants: s.participants || s.actionnaires || [],
      }));
    }
    return [];
  })();

  /* ════════════════════════════════════════════════
     RENDER – LISTE
  ════════════════════════════════════════════════ */
  const renderList = () => (
    <>
      {/* Page header */}
      <div className="flex flex-wrap items-end justify-between gap-4 px-8 pt-8 pb-0">
        <div>
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-1">Gestion</p>
          <h1 className="text-[2.4rem] leading-tight text-slate-900">Assemblées Générales</h1>
          <p className="text-sm text-slate-500 mt-1">Suivez et gérez l'ensemble de vos assemblées</p>
        </div>
        <button
          onClick={() => setNewAgModalOpen(true)}
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
        <StatCard label="Total AG" value={ags.length} color="bg-blue-600" dot="bg-blue-500" />
        <StatCard label="En cours" value={ags.filter(a => a.statut === "en_cours" || a.statut === "en cours").length} color="bg-emerald-600" dot="bg-emerald-500" />
        <StatCard label="À venir" value={ags.filter(a => a.statut === "a_venir" || a.statut === "à venir").length} color="bg-amber-500" dot="bg-amber-400" />
        <StatCard label="Passées" value={ags.filter(a => a.statut === "passee" || a.statut === "passée").length} color="bg-slate-400" dot="bg-slate-300" />
      </div>

      {/* Search + filter */}
      <div className="flex gap-3 px-8 pt-5">
        <div className="relative flex-1 max-w-2xl">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 text-sm transition-all"
            placeholder="Rechercher par code AG ou entreprise…"
          />
        </div>
      </div>

      {/* AG Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 px-8 py-6 pb-14">
        {loading ? (
          <div className="col-span-3 flex items-center justify-center py-24">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredAGs.length === 0 ? (
          <div className="col-span-3 flex flex-col items-center justify-center py-24 text-slate-400 text-center">
            <svg className="w-12 h-12 mb-4 opacity-30" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
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

  /* ════════════════════════════════════════════════
     RENDER – DÉTAIL
  ════════════════════════════════════════════════ */
  const renderDetail = () => {
    if (!currentAG) return null;
    const ag = currentAG;

    const totalActDCBR = agDCBR.reduce((s, r) => s + (r.ag || 0), 0);
    const totalEcart = agDCBR.reduce((s, r) => s + Math.abs(r.ecart || 0), 0);
    const totalPart = sgiCards.reduce((s, g) => s + (g.participants?.length || 0), 0);

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
            <span>Assemblées</span><span>/</span>
            <span className="text-slate-600 font-medium">{ag.company}</span>
          </div>
          {detailLoading && (
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin ml-2" />
          )}
        </div>

        {/* Hero card */}
        <div className="mx-8 mt-5 bg-[#0f172a] rounded-2xl p-8 relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "repeating-linear-gradient(0deg,#fff 0px,#fff 1px,transparent 1px,transparent 40px),repeating-linear-gradient(90deg,#fff 0px,#fff 1px,transparent 1px,transparent 40px)" }} />
          <div className="relative flex flex-wrap items-start justify-between gap-6">
            {/* Left */}
            <div className="flex flex-col gap-4">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-mono text-slate-500 bg-white/10 px-2.5 py-1 rounded-md">{ag.code}</span>
                  {statutCfg[ag.statut] && (
                    <span className={statutCfg[ag.statut].cls}>{statutCfg[ag.statut].label}</span>
                  )}
                </div>
                <h2 className="text-3xl text-white mb-1">{ag.company}</h2>
                <p className="text-slate-400 text-sm flex items-center gap-1.5 mb-4">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  {fmtD(ag.date)} &nbsp;·&nbsp; {ag.type}
                </p>
                <QuorumCompact ag={ag} />
              </div>
              <button
                onClick={toggleAG}
                className={`group inline-flex items-center gap-3 px-5 py-3 rounded-xl font-semibold text-sm active:scale-95 transition-all w-fit border shadow-lg text-white ${agOpen ? "bg-emerald-600 hover:bg-emerald-500 border-emerald-500" : "bg-blue-600 hover:bg-blue-500 border-blue-500"}`}
              >
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
                </span>
                {agOpen ? "AG en cours · En cours" : "Ouvrir l'AG"}
              </button>
            </div>

            {/* Right buttons */}
            <div className="flex flex-wrap gap-2 mt-1">
              <button
                onClick={() => setImportDepModalOpen(true)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                Charger documents
              </button>
              <button
                onClick={() => setChargerFichierModalOpen(true)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white/10 text-white text-xs font-semibold hover:bg-white/20 transition-colors border border-white/10"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                Charger fichier
              </button>
              <button
                onClick={openDepositaireModal}
                className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
                </svg>
                Dépositaire
              </button>
              <button
                onClick={() => setRemplacerDepModalOpen(true)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-amber-500 text-white text-xs font-semibold hover:bg-amber-600 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M21 2v6h-6" /><path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
                  <path d="M3 22v-6h6" /><path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
                </svg>
                Remplacer
              </button>
            </div>
          </div>
        </div>

        {/* AG ouverte banner */}
        {agOpen && (
          <div className="mx-8 mt-3">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-5 py-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 border border-emerald-200 flex items-center justify-center">
                  <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" /><polygon points="10 8 16 12 10 16 10 8" fill="currentColor" stroke="none" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-emerald-800">Assemblée Générale ouverte</p>
                  <p className="text-xs text-emerald-600 mt-0.5">{agOpenTime}</p>
                </div>
              </div>
              <button onClick={toggleAG} className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white border border-red-200 text-red-600 text-xs font-semibold hover:bg-red-50 transition-colors">
                Clôturer l'AG
              </button>
            </div>
          </div>
        )}

        {/* Stats cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3 px-8 pt-5">
          <StatCardDetail label="Total Écart" value={fmt(totalEcart)} color="amber" />
          <StatCardDetail label="Total DCBR" value={fmt(totalActDCBR)} color="slate" />
          <StatCardDetail label="Actionnaires" value={totalPart} color="blue" />
          <StatCardDetail label="SGI représentées" value={sgiCards.length} color="purple" />
          <StatCardDetail label="Actions totales" value={fmt(ag.actions_totales)} color="emerald" />
        </div>

        {/* Actionnaires + DCBR */}
        <div className="flex flex-col md:flex-row gap-4 mx-8 mt-5">
          {/* Actionnaires par SGI */}
          <div className="basis-full md:basis-1/2 min-w-0 bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-slate-100">
              <div>
                <p className="font-semibold text-slate-900 text-sm">Actionnaires par SGI</p>
                <p className="text-xs text-slate-400 mt-0.5">Données consolidées</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => exportActionnaires("xlsx")} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors">⬇ Excel</button>
                <button onClick={() => exportActionnaires("csv")} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-700 text-white text-xs font-semibold hover:bg-slate-800 transition-colors">⬇ CSV</button>
              </div>
            </div>
            <div className="overflow-auto flex-1">
              {detailLoading ? (
                <div className="flex items-center justify-center py-12"><div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>
              ) : sgiCards.length === 0 ? (
                <div className="flex items-center justify-center py-12 text-slate-400 text-sm">Aucune donnée disponible</div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="sticky top-0 z-10">
                    <tr className="text-left text-[11px] uppercase tracking-widest text-slate-400 bg-slate-50 border-b border-slate-100">
                      <th className="px-5 py-3 font-semibold">Actionnaire</th>
                      <th className="px-5 py-3 font-semibold">SGI</th>
                      <th className="px-5 py-3 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sgiCards.flatMap((s) => {
                      const pal = SGI_PALETTE[s.pal_index];
                      return (s.participants || []).slice(0, 2).map((p, pi) => (
                        <tr key={`${s.id}-${pi}`} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                          <td className="px-5 py-2.5">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0" style={{ background: pal.bg }}>
                                {initials(p.nom || p.name || "")}
                              </div>
                              <span className="font-medium text-slate-800 text-xs">{p.nom || p.name}</span>
                            </div>
                          </td>
                          <td className="px-5 py-2.5">
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold" style={{ background: pal.light, color: pal.text }}>{s.nom}</span>
                          </td>
                          <td className="px-5 py-2.5 font-semibold text-slate-700 text-xs">{fmt(p.actions || Math.floor(s.actions / (s.participants?.length || 1)))}</td>
                        </tr>
                      ));
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Rapprochement DCBR */}
          <div className="basis-full md:basis-1/2 min-w-0 bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-slate-100">
              <div>
                <p className="font-semibold text-slate-900 text-sm">Rapprochement DCBR</p>
                <p className="text-xs text-slate-400 mt-0.5">Comparaison fichiers dépositaire</p>
              </div>
              <button onClick={exportDepositaire} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors">⬇ Excel</button>
            </div>
            <div className="overflow-auto flex-1">
              {agDCBR.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400 text-sm gap-2">
                  <svg className="w-8 h-8 opacity-40" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
                  <span>Aucune donnée dépositaire</span>
                  <button onClick={openDepositaireModal} className="text-xs text-blue-600 hover:underline mt-1">Charger la comparaison</button>
                </div>
              ) : (
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
                    {agDCBR.map((r, i) => (
                      <tr key={i} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-2.5 font-semibold text-slate-800 text-xs">{r.sgi}</td>
                        <td className="px-5 py-2.5 text-slate-600 text-xs">{fmt(r.ag)}</td>
                        <td className="px-5 py-2.5 text-slate-600 text-xs">{fmt(r.dep)}</td>
                        <td className={`px-5 py-2.5 font-bold text-xs ${r.ecart === 0 ? "text-emerald-600" : r.ecart > 0 ? "text-amber-600" : "text-red-600"}`}>
                          {r.ecart > 0 ? "+" : ""}{fmt(r.ecart)}
                        </td>
                        <td className="px-5 py-2.5" dangerouslySetInnerHTML={{ __html: ecartBadge(r.ecart) }} />
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* Fichiers chargés */}
        <div className="bg-white rounded-2xl border border-slate-200 mx-8 mt-4 overflow-hidden">
          <div className="px-7 py-4 border-b border-slate-100">
            <p className="font-semibold text-slate-900 text-sm">Fichiers participants chargés</p>
          </div>
          <div className="p-5 flex flex-wrap gap-3">
            {agFiles.length === 0 ? (
              <p className="text-slate-400 text-sm py-4 px-2">Aucun fichier chargé pour cette AG.</p>
            ) : (
              agFiles.map((f) => (
                <div key={f.id} className="flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300 hover:shadow-sm transition-all">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800 leading-none">{f.sgi || f.sgi_nom || "SGI"}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{f.nom || f.nom_fichier || f.filename}</p>
                  </div>
                  <div className="flex gap-1.5 ml-3">
                    <button onClick={() => openReplaceFile(f)} className="p-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors" title="Remplacer">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M21 2v6h-6" /><path d="M3 12a9 9 0 0 1 15-6.7L21 8" /><path d="M3 22v-6h6" /><path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
                      </svg>
                    </button>
                    <button onClick={() => openDeleteFile(f)} className="p-1.5 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors" title="Supprimer">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M9 6V4h6v2" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* SGI participants */}
        <div className="bg-white rounded-2xl border border-slate-200 mx-8 mt-4 overflow-hidden mb-12">
          <div className="flex flex-wrap items-center justify-between gap-3 px-7 py-4 border-b border-slate-100">
            <div>
              <p className="font-semibold text-slate-900 text-sm">Actionnaires présents</p>
              <p className="text-xs text-slate-400 mt-0.5">Cliquez pour voir les participants d'une SGI</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => exportParticipants("xlsx")} className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors">⬇ Excel</button>
              <button onClick={() => exportParticipants("pdf")} className="px-3 py-1.5 rounded-lg bg-slate-700 text-white text-xs font-semibold hover:bg-slate-800 transition-colors">⬇ PDF</button>
            </div>
          </div>
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {detailLoading ? (
              <div className="col-span-3 flex items-center justify-center py-12">
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : sgiCards.length === 0 ? (
              <div className="col-span-3 flex flex-col items-center justify-center py-12 text-slate-400 text-sm">
                <svg className="w-8 h-8 opacity-40 mb-2" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" /></svg>
                Aucun participant trouvé pour cette AG
              </div>
            ) : (
              sgiCards.map((s) => {
                const pal = SGI_PALETTE[s.pal_index];
                return (
                  <div
                    key={s.id}
                    onClick={() => openParticipants(s)}
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
                          <p className="font-bold text-slate-900 text-sm mt-0.5">{s.participants?.length || 0}</p>
                        </div>
                      </div>
                      <div className="flex gap-1 flex-wrap mb-3">
                        {(s.participants || []).slice(0, 5).map((p, pi) => (
                          <div key={pi} className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold ring-2 ring-white" style={{ background: pal.bg }} title={p.nom || p.name}>
                            {initials(p.nom || p.name || "")}
                          </div>
                        ))}
                        {(s.participants?.length || 0) > 5 && (
                          <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[10px] font-bold ring-2 ring-white">+{s.participants.length - 5}</div>
                        )}
                      </div>
                      <p className="text-xs font-semibold flex items-center gap-1" style={{ color: pal.text }}>
                        Voir les participants
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </>
    );
  };

  /* ════════════════════════════════════════════════
     MAIN RENDER
  ════════════════════════════════════════════════ */
  return (
    <div className="bg-[#f5f6f8] min-h-screen text-slate-800">
      {/* Topbar */}
      <header className="sticky top-0 z-40 h-14 bg-white/90 backdrop-blur border-b border-slate-200 flex items-center justify-between px-8">
        <nav className="flex items-center gap-1.5 text-sm">
          <span className="text-slate-400">Tableau de bord</span>
          <span className="text-slate-300">/</span>
          <span className="font-semibold text-slate-800">Assemblées Générales</span>
        </nav>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-xs">AD</div>
        </div>
      </header>

      {/* Contenu principal */}
      {view === "list" ? renderList() : renderDetail()}

      {/* ════════ MODALE PARTICIPANTS ════════ */}
      {modalOpen && (
        <ModalWrapper onClose={() => setModalOpen(false)}>
          <div className="px-7 pt-7 pb-5 border-b border-slate-100">
            <h2 className="text-2xl text-slate-900">{modalSGI?.nom}</h2>
            <p className="text-sm text-slate-500 mt-1">{modalSGI?.participants?.length} participants présents</p>
          </div>
          <div className="px-5 py-4 border-b border-slate-100">
            <SearchInput value={modalSearch} onChange={setModalSearch} placeholder="Rechercher un participant…" />
          </div>
          <div className="overflow-y-auto flex-1 p-3">
            {filteredParticipants.length === 0 ? (
              <div className="py-10 text-center text-slate-400 text-sm">Aucun résultat</div>
            ) : (
              filteredParticipants.map((p, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background: modalPal?.bg }}>
                    {initials(p.nom || p.name || "")}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800 leading-none">{p.nom || p.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{p.role}</p>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="px-6 py-4 border-t border-slate-100 flex justify-end">
            <button onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">Fermer</button>
          </div>
        </ModalWrapper>
      )}

      {/* ════════ MODALE NOUVELLE AG ════════ */}
      {newAgModalOpen && (
        <ModalWrapper onClose={() => setNewAgModalOpen(false)}>
          <ModalHeader
            title="Nouvelle Assemblée Générale"
            subtitle="Remplissez les informations pour créer l'assemblée"
            onClose={() => setNewAgModalOpen(false)}
          />
          <div className="px-7 py-5 flex flex-col gap-4">
            <FormField label="Entreprise *">
              <select
                value={newAgForm.entreprise}
                onChange={(e) => setNewAgForm({ ...newAgForm, entreprise: e.target.value })}
                className="w-full px-3 py-2 mt-1 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
              >
                <option value="">— Sélectionner l'entreprise —</option>
                {companies.map((c) => <option key={c.id} value={c.id}>{c.nom_entreprise}</option>)}
              </select>
            </FormField>
            <FormField label="Date de l'AG *">
              <input
                type="date"
                value={newAgForm.date}
                onChange={(e) => setNewAgForm({ ...newAgForm, date: e.target.value })}
                className="w-full px-3 py-2 mt-1 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
              />
            </FormField>
            <FormField label="Type *">
              <select
                value={newAgForm.type}
                onChange={(e) => setNewAgForm({ ...newAgForm, type: e.target.value })}
                className="w-full px-3 py-2 mt-1 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
              >
                <option value="">— Sélectionner le type —</option>
                <option value="ordinaire">Ordinaire</option>
                <option value="extraordinaire">Extraordinaire</option>
                <option value="mixte">Mixte</option>
              </select>
            </FormField>
            <FormField label="Mode">
              <select
                value={newAgForm.mode_ag}
                onChange={(e) => setNewAgForm({ ...newAgForm, mode_ag: e.target.value })}
                className="w-full px-3 py-2 mt-1 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
              >
                <option value="">— Sélectionner le mode —</option>
                <option value="presentiel">Présentiel</option>
                <option value="en_ligne">En ligne</option>
                <option value="hybride">Hybride</option>
              </select>
            </FormField>
          </div>
          <ModalFooter
            onCancel={() => setNewAgModalOpen(false)}
            onConfirm={submitNewAG}
            loading={submittingAG}
            confirmLabel="Créer l'AG"
            confirmClass="bg-blue-600 hover:bg-blue-700"
          />
        </ModalWrapper>
      )}

      {/* ════════ MODALE IMPORTER DÉPOSITAIRE ════════ */}
      {importDepModalOpen && (
        <ModalWrapper onClose={() => setImportDepModalOpen(false)}>
          <ModalHeader
            title="Importer le fichier Dépositaire"
            subtitle={`AG : ${currentAG?.code} — ${currentAG?.company}`}
            onClose={() => setImportDepModalOpen(false)}
            icon={<svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>}
            iconBg="bg-red-50"
          />
          <div className="px-7 py-6">
            <FileDropzone
              file={importDepFile}
              onChange={setImportDepFile}
              accept=".xlsx,.xls,.csv"
              hint="Formats acceptés : Excel (.xlsx, .xls) ou CSV"
            />
          </div>
          <ModalFooter
            onCancel={() => setImportDepModalOpen(false)}
            onConfirm={submitImportDep}
            loading={importDepLoading}
            confirmLabel="Importer"
            confirmClass="bg-red-600 hover:bg-red-700"
            disabled={!importDepFile}
          />
        </ModalWrapper>
      )}

      {/* ════════ MODALE REMPLACER DÉPOSITAIRE ════════ */}
      {remplacerDepModalOpen && (
        <ModalWrapper onClose={() => setRemplacerDepModalOpen(false)}>
          <ModalHeader
            title="Remplacer le fichier Dépositaire"
            subtitle={`AG : ${currentAG?.code} — ${currentAG?.company}`}
            onClose={() => setRemplacerDepModalOpen(false)}
            icon={<svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 2v6h-6" /><path d="M3 12a9 9 0 0 1 15-6.7L21 8" /><path d="M3 22v-6h6" /><path d="M21 12a9 9 0 0 1-15 6.7L3 16" /></svg>}
            iconBg="bg-amber-50"
          />
          <div className="px-7 py-6">
            <FileDropzone
              file={remplacerDepFile}
              onChange={setRemplacerDepFile}
              accept=".xlsx,.xls,.csv"
              hint="Le nouveau fichier remplacera le fichier dépositaire existant"
            />
          </div>
          <ModalFooter
            onCancel={() => setRemplacerDepModalOpen(false)}
            onConfirm={submitRemplacerDep}
            loading={remplacerDepLoading}
            confirmLabel="Remplacer"
            confirmClass="bg-amber-500 hover:bg-amber-600"
            disabled={!remplacerDepFile}
          />
        </ModalWrapper>
      )}

      {/* ════════ MODALE CHARGER FICHIER SGI ════════ */}
      {chargerFichierModalOpen && (
        <ModalWrapper onClose={() => setChargerFichierModalOpen(false)}>
          <ModalHeader
            title="Charger un fichier SGI"
            subtitle="Associez un fichier Excel à une SGI pour cette AG"
            onClose={() => setChargerFichierModalOpen(false)}
            icon={<svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>}
            iconBg="bg-blue-50"
          />
          <div className="px-7 py-5 flex flex-col gap-4">
            <FormField label="SGI *">
              <select
                value={chargerFichierForm.sgiId}
                onChange={(e) => setChargerFichierForm({ ...chargerFichierForm, sgiId: e.target.value })}
                className="w-full px-3 py-2 mt-1 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
              >
                <option value="">— Sélectionner la SGI —</option>
                {sgiList.map((s) => <option key={s.id} value={s.id}>{s.nom || s.nom_sgi}</option>)}
              </select>
            </FormField>
            <FormField label="Fichier *">
              <FileDropzone
                file={chargerFichierForm.file}
                onChange={(f) => setChargerFichierForm({ ...chargerFichierForm, file: f })}
                accept=".xlsx,.xls,.csv"
                hint="Formats acceptés : Excel (.xlsx, .xls) ou CSV"
              />
            </FormField>
          </div>
          <ModalFooter
            onCancel={() => setChargerFichierModalOpen(false)}
            onConfirm={submitChargerFichier}
            loading={chargerFichierLoading}
            confirmLabel="Charger le fichier"
            confirmClass="bg-blue-600 hover:bg-blue-700"
            disabled={!chargerFichierForm.sgiId || !chargerFichierForm.file}
          />
        </ModalWrapper>
      )}

      {/* ════════ MODALE REMPLACER FICHIER SGI ════════ */}
      {replaceFileModalOpen && (
        <ModalWrapper onClose={() => setReplaceFileModalOpen(false)}>
          <ModalHeader
            title="Remplacer le fichier"
            subtitle={`Fichier : ${replaceFileTarget?.nom || replaceFileTarget?.nom_fichier || "—"}`}
            onClose={() => setReplaceFileModalOpen(false)}
          />
          <div className="px-7 py-5 flex flex-col gap-4">
            <FormField label="SGI (optionnel)">
              <select
                value={replaceFileForm.sgiId}
                onChange={(e) => setReplaceFileForm({ ...replaceFileForm, sgiId: e.target.value })}
                className="w-full px-3 py-2 mt-1 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
              >
                <option value="">— Garder la SGI actuelle —</option>
                {sgiList.map((s) => <option key={s.id} value={s.id}>{s.nom || s.nom_sgi}</option>)}
              </select>
            </FormField>
            <FormField label="Nouveau fichier *">
              <FileDropzone
                file={replaceFileForm.file}
                onChange={(f) => setReplaceFileForm({ ...replaceFileForm, file: f })}
                accept=".xlsx,.xls,.csv"
                hint="Ce fichier remplacera le fichier actuel"
              />
            </FormField>
          </div>
          <ModalFooter
            onCancel={() => setReplaceFileModalOpen(false)}
            onConfirm={submitReplaceFile}
            loading={replaceFileLoading}
            confirmLabel="Remplacer"
            confirmClass="bg-blue-600 hover:bg-blue-700"
            disabled={!replaceFileForm.file}
          />
        </ModalWrapper>
      )}

      {/* ════════ MODALE VOIR DÉPOSITAIRE ════════ */}
      {depositaireModalOpen && (
        <ModalWrapper onClose={() => setDepositaireModalOpen(false)} wide>
          <ModalHeader
            title="Comparaison Dépositaire"
            subtitle={`AG : ${currentAG?.code} — ${currentAG?.company}`}
            onClose={() => setDepositaireModalOpen(false)}
            icon={<svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>}
            iconBg="bg-emerald-50"
          />
          <div className="overflow-auto flex-1 max-h-96">
            {depositaireLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : depositaireData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400 text-sm">
                <svg className="w-10 h-10 opacity-30 mb-3" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></svg>
                Aucune donnée de comparaison disponible
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="sticky top-0">
                  <tr className="text-left text-[11px] uppercase tracking-widest text-slate-400 bg-slate-50 border-b border-slate-100">
                    <th className="px-5 py-3 font-semibold">SGI</th>
                    <th className="px-5 py-3 font-semibold">Qté AG</th>
                    <th className="px-5 py-3 font-semibold">Qté Dépositaire</th>
                    <th className="px-5 py-3 font-semibold">Écart</th>
                    <th className="px-5 py-3 font-semibold">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {depositaireData.map((r, i) => (
                    <tr key={i} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3 font-semibold text-slate-800 text-xs">{r.sgi}</td>
                      <td className="px-5 py-3 text-slate-600 text-xs">{fmt(r.ag)}</td>
                      <td className="px-5 py-3 text-slate-600 text-xs">{fmt(r.dep)}</td>
                      <td className={`px-5 py-3 font-bold text-xs ${r.ecart === 0 ? "text-emerald-600" : r.ecart > 0 ? "text-amber-600" : "text-red-600"}`}>
                        {r.ecart > 0 ? "+" : ""}{fmt(r.ecart)}
                      </td>
                      <td className="px-5 py-3" dangerouslySetInnerHTML={{ __html: ecartBadge(r.ecart) }} />
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <div className="px-6 py-4 border-t border-slate-100 flex justify-between items-center">
            <button onClick={exportDepositaire} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors">
              ⬇ Exporter Excel
            </button>
            <button onClick={() => setDepositaireModalOpen(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">Fermer</button>
          </div>
        </ModalWrapper>
      )}

      {/* ════════ MODALE CONFIRMER SUPPRESSION ════════ */}
      {deleteConfirmOpen && (
        <ModalWrapper onClose={() => setDeleteConfirmOpen(false)} small>
          <div className="p-7 flex flex-col items-center text-center gap-4">
            <div className="w-14 h-14 rounded-full bg-red-50 border border-red-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M9 6V4h6v2" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-lg">Supprimer le fichier ?</h3>
              <p className="text-sm text-slate-500 mt-1">
                Le fichier <span className="font-semibold text-slate-700">{fileToDelete?.nom || fileToDelete?.nom_fichier}</span> sera supprimé définitivement.
              </p>
            </div>
          </div>
          <div className="px-6 pb-6 flex justify-center gap-3">
            <button onClick={() => setDeleteConfirmOpen(false)} className="px-5 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors border border-slate-200">Annuler</button>
            <button
              onClick={confirmDeleteFile}
              disabled={deleteLoading}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-60"
            >
              {deleteLoading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              Supprimer
            </button>
          </div>
        </ModalWrapper>
      )}

      {/* ════════ TOAST ════════ */}
      <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2.5 shadow-xl transition-all duration-300 ${toastVisible ? "translate-y-0 opacity-100" : "translate-y-16 opacity-0 pointer-events-none"} ${toastType === "error" ? "bg-red-600 text-white" : "bg-slate-900 text-white"}`}>
        <div className={`w-1.5 h-1.5 rounded-full ${toastType === "error" ? "bg-red-200" : "bg-emerald-400"}`} />
        <span>{toastMessage}</span>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════════════════
   COMPOSANTS RÉUTILISABLES
══════════════════════════════════════════════════════════════════════════ */

const ModalWrapper = ({ children, onClose, wide, small }) => (
  <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-[3px] flex items-center justify-center z-50" onClick={onClose}>
    <div
      className={`bg-white rounded-2xl shadow-2xl shadow-slate-900/15 border border-slate-200 flex flex-col max-h-[90vh] w-full mx-4 ${wide ? "max-w-2xl" : small ? "max-w-sm" : "max-w-lg"}`}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>
  </div>
);

const ModalHeader = ({ title, subtitle, onClose, icon, iconBg }) => (
  <div className="px-7 pt-7 pb-5 border-b border-slate-100 flex items-start gap-4">
    {icon && (
      <div className={`w-10 h-10 rounded-xl ${iconBg || "bg-slate-50"} border border-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5`}>{icon}</div>
    )}
    <div className="flex-1">
      <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
      {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
    </div>
    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors flex-shrink-0">
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12" /></svg>
    </button>
  </div>
);

const ModalFooter = ({ onCancel, onConfirm, loading, confirmLabel, confirmClass, disabled }) => (
  <div className="px-7 py-4 border-t border-slate-100 flex justify-end gap-3">
    <button onClick={onCancel} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">Annuler</button>
    <button
      onClick={onConfirm}
      disabled={loading || disabled}
      className={`flex items-center gap-2 px-5 py-2 rounded-lg text-white text-sm font-semibold transition-colors disabled:opacity-60 ${confirmClass || "bg-blue-600 hover:bg-blue-700"}`}
    >
      {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
      {confirmLabel}
    </button>
  </div>
);

const FormField = ({ label, children }) => (
  <div>
    <label className="text-xs font-semibold text-slate-600">{label}</label>
    {children}
  </div>
);

const SearchInput = ({ value, onChange, placeholder }) => (
  <div className="relative">
    <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
    </svg>
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-400 text-sm transition-all"
      placeholder={placeholder}
    />
  </div>
);

const FileDropzone = ({ file, onChange, accept, hint }) => {
  const inputRef = useRef(null);
  return (
    <div>
      <div
        onClick={() => inputRef.current?.click()}
        className={`mt-1 border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${file ? "border-blue-300 bg-blue-50" : "border-slate-200 bg-slate-50 hover:border-blue-300 hover:bg-blue-50/50"}`}
      >
        {file ? (
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-blue-700">{file.name}</p>
            <p className="text-xs text-blue-500">{(file.size / 1024).toFixed(1)} KB — Cliquer pour changer</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-slate-200 flex items-center justify-center">
              <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>
            <p className="text-sm font-medium text-slate-600">Cliquer pour sélectionner un fichier</p>
            {hint && <p className="text-xs text-slate-400">{hint}</p>}
          </div>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => onChange(e.target.files?.[0] || null)}
      />
    </div>
  );
};

const StatCard = ({ label, value, color, dot }) => (
  <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3 hover:shadow-sm transition-shadow">
    <div className={`w-10 h-10 rounded-xl ${color} bg-opacity-10 flex items-center justify-center flex-shrink-0`}>
      <div className={`w-2 h-2 rounded-full ${dot}`} />
    </div>
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-xl font-semibold text-slate-900">{value}</p>
    </div>
  </div>
);

const StatCardDetail = ({ label, value, color }) => {
  const colorMap = {
    amber: { bg: "bg-amber-50", border: "border-amber-100", text: "text-amber-600", icon: "text-amber-500" },
    slate: { bg: "bg-slate-100", border: "border-slate-200", text: "text-slate-900", icon: "text-slate-500" },
    blue: { bg: "bg-blue-50", border: "border-blue-100", text: "text-blue-700", icon: "text-blue-500" },
    purple: { bg: "bg-purple-50", border: "border-purple-100", text: "text-purple-700", icon: "text-purple-500" },
    emerald: { bg: "bg-emerald-50", border: "border-emerald-100", text: "text-emerald-600", icon: "text-emerald-500" },
  };
  const c = colorMap[color] || colorMap.slate;
  return (
    <div className={`bg-white rounded-2xl border ${c.border} p-5 flex flex-col gap-3 hover:shadow-sm transition-shadow`}>
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">{label}</p>
        <div className={`w-8 h-8 rounded-lg ${c.bg} border ${c.border} flex items-center justify-center`}>
          <svg className={`w-4 h-4 ${c.icon}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M13 17H17M17 17V13M17 17L7 7M7 7H11M7 7V11" />
          </svg>
        </div>
      </div>
      <p className={`text-3xl font-semibold ${c.text}`}>{value}</p>
    </div>
  );
};

const AGCard = ({ ag, index, onOpenDetail, showToast }) => {
  const pct = quorumPct(ag);
  const c = quorumColor(ag);
  const ok = quorumOk(ag);
  const label = pct === 0 ? "Non renseigné" : ok ? "Quorum atteint" : "Quorum insuffisant";
  const statut = statutCfg[ag.statut];

  return (
    <div
      className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-blue-300 hover:shadow-lg hover:shadow-blue-500/5 hover:-translate-y-1 transition-all duration-200 cursor-pointer"
      onClick={() => onOpenDetail(ag.id)}
    >
      <div className={`h-1 w-full ${ag.statut === "en_cours" || ag.statut === "en cours" ? "bg-emerald-500" : ag.statut === "a_venir" || ag.statut === "à venir" ? "bg-blue-500" : "bg-slate-300"}`} />
      <div className="px-5 pt-5 pb-4 border-b border-slate-100">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-mono text-slate-400 mb-1">{ag.code}</p>
            <h3 className="font-semibold text-slate-900 text-base leading-snug truncate">{ag.company}</h3>
          </div>
          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs border border-slate-200">
            {initials(ag.company)}
          </div>
        </div>
        <div className="flex items-center gap-1.5 mt-2.5 text-slate-500 text-xs">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          {fmtD(ag.date)}
        </div>
      </div>
      <div className="px-5 py-4">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {statut && <span className={statut.cls}>{statut.label}</span>}
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
            <div className="absolute top-0 bottom-0 w-px bg-slate-400 z-10" style={{ left: `${ag.quorum_requis}%` }} />
            <div className={`${c.bar} h-full rounded-full transition-all duration-500`} style={{ width: `${Math.min(pct, 100)}%` }} />
          </div>
          <p className={`text-[10px] ${c.text} font-medium mt-1`}>{label}</p>
        </div>
      </div>
      <div className="px-5 pb-5 flex gap-2">
        <button
          onClick={(e) => { e.stopPropagation(); onOpenDetail(ag.id); }}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 active:scale-95 transition-all"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
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
  const barW = Math.min(pct, 100);
  const statusLabel = pct === 0 ? "Non renseigné" : ok ? "Quorum atteint" : "Insuffisant";
  return (
    <div className="bg-white/8 border border-white/10 rounded-xl px-4 py-3 w-64">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">Quorum</span>
        <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${ok ? "bg-emerald-500/20 text-emerald-400" : pct === 0 ? "bg-white/10 text-slate-400" : "bg-amber-500/20 text-amber-400"}`}>
          {statusLabel}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex-1 relative h-2 bg-white/10 rounded-full overflow-visible">
          <div className={`h-full rounded-full transition-all duration-700 ${ok ? "bg-emerald-400" : pct === 0 ? "bg-slate-500" : "bg-amber-400"}`} style={{ width: `${barW}%` }} />
          <div className="absolute top-1/2 -translate-y-1/2 w-px h-3.5 bg-white/40 rounded-full" style={{ left: `${ag.quorum_requis || 50}%` }} />
        </div>
        <span className="text-sm font-bold text-white whitespace-nowrap">
          {pct}% <span className="text-slate-500 font-normal text-xs">/ {ag.quorum_requis || 50}%</span>
        </span>
      </div>
    </div>
  );
};

export default AGDashboard;
