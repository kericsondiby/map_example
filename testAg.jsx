import React, { useState, useEffect, useRef, useCallback } from "react";
import api from "../../services/api";

/* ─────────────────────────────── Palette SGI ─────────────────────────────── */
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
  try {
    return new Intl.DateTimeFormat("fr-FR", {
      year: "numeric",
      month: "long",
      day: "2-digit",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
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

/* ─────────────────────────────── Statuts ─────────────────────────────── */
const statutCfg = {
  en_cours: { label: "En cours", cls: "inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200" },
  "en cours": { label: "En cours", cls: "inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200" },
  a_venir: { label: "À venir", cls: "inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 ring-1 ring-blue-200" },
  "à_venir": { label: "À venir", cls: "inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 ring-1 ring-blue-200" },
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

/* ════════════════════════════════════════════════════════════
   COMPOSANT PRINCIPAL
════════════════════════════════════════════════════════════ */
const AGDashboard = () => {
  /* ─── Navigation ─── */
  const [view, setView] = useState("list");
  const [selectedAgDetails, setSelectedAgDetails] = useState(null);
  const [filterText, setFilterText] = useState("");

  /* ─── Liste AG ─── */
  const [ags, setAgs] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [companies, setCompanies] = useState([]);

  /* ─── Détail AG ─── */
  // Participants par SGI → shape: { result: [{ nom_sgi, participants: [{ nom_prenom }] }] }
  const [participants, setParticipants] = useState(null);
  const [loadingParticipants, setLoadingParticipants] = useState(false);

  // Actionnaires par SGI → shape: { details: [{ Nom_Client, SGI, Nombre_Actions }] }
  const [actionnairesSgiData, setActionnairesSgiData] = useState(null);
  const [loadingActionnaires, setLoadingActionnaires] = useState(false);

  // Dépositaire compare → shape: details[], summary: { total_ecart, total_dep, total_ag_corrige, ag_id }
  const [depositaireCompare, setDepositaireCompare] = useState(null);
  const [totalEcart, setTotalEcart] = useState(0);
  const [totalDep, setTotalDep] = useState(0);
  const [totalAgDcbr, setTotalAgDcbr] = useState(0);
  const [agIdDcbr, setAgIdDcbr] = useState("");
  const [loadingDepositaireCompare, setLoadingDepositaireCompare] = useState(false);

  // Fichiers AG → shape: [{ id, nom, sgi: { id, nom_sgi } }]
  const [agFiles, setAgFiles] = useState([]);
  const [loadingFiles, setLoadingFiles] = useState(false);

  // SGIs → shape: [{ id, nom_sgi }]
  const [sgis, setSgis] = useState([]);

  const [agOpen, setAgOpen] = useState(false);
  const [agOpenTime, setAgOpenTime] = useState("");

  /* ─── Modal Participants SGI ─── */
  const [modalParticipantsOpen, setModalParticipantsOpen] = useState(false);
  const [modalSGI, setModalSGI] = useState(null);
  const [modalSearch, setModalSearch] = useState("");

  /* ─── Modal Nouvelle AG ─── */
  const [newAgModalOpen, setNewAgModalOpen] = useState(false);
  const [newAgForm, setNewAgForm] = useState({ entreprise: "", date: "", type: "", mode_ag: "" });
  const [loadingCreate, setLoadingCreate] = useState(false);

  /* ─── Modal Modifier AG ─── */
  const [editAgModalOpen, setEditAgModalOpen] = useState(false);
  const [selectedAgForEdit, setSelectedAgForEdit] = useState(null);
  const [editAgForm, setEditAgForm] = useState({ date: "", type: "" });
  const [loadingEdit, setLoadingEdit] = useState(false);

  /* ─── Modal Importer Dépositaire ─── */
  const [importDepModalOpen, setImportDepModalOpen] = useState(false);
  const [importDepFile, setImportDepFile] = useState(null);
  const [uploadingDepositaire, setUploadingDepositaire] = useState(false);

  /* ─── Modal Remplacer Dépositaire ─── */
  const [remplacerDepModalOpen, setRemplacerDepModalOpen] = useState(false);
  const [remplacerDepFile, setRemplacerDepFile] = useState(null);

  /* ─── Modal Charger Fichier SGI ─── */
  const [chargerFichierModalOpen, setChargerFichierModalOpen] = useState(false);
  const [chargerFichierSgi, setChargerFichierSgi] = useState("");
  const [chargerFichierFile, setChargerFichierFile] = useState(null);
  const [uploadingFile, setUploadingFile] = useState(false);

  /* ─── Modal Remplacer Fichier SGI ─── */
  const [replaceFileModalOpen, setReplaceFileModalOpen] = useState(false);
  const [selectedFileForReplace, setSelectedFileForReplace] = useState(null);
  const [selectedSgiForReplace, setSelectedSgiForReplace] = useState("");
  const [replaceFile, setReplaceFile] = useState(null);

  /* ─── Modal Supprimer Fichier ─── */
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState(null);
  const [deletingFile, setDeletingFile] = useState(false);

  /* ─── Modal Dépositaire Compare ─── */
  const [depositaireModalOpen, setDepositaireModalOpen] = useState(false);

  /* ─── Téléchargements ─── */
  const [downloadingFile, setDownloadingFile] = useState(false);

  /* ─── Refs ─── */
  const depositaireFileInputRef = useRef(null);
  const replaceFileInputRef = useRef(null);
  const chargerFileInputRef = useRef(null);

  /* ─── Toast ─── */
  const [toastMessage, setToastMessage] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const [toastType, setToastType] = useState("success");
  const toastTimer = useRef(null);

  const showToast = useCallback((msg, type = "success") => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToastMessage(msg);
    setToastType(type);
    setToastVisible(true);
    toastTimer.current = setTimeout(() => setToastVisible(false), 3000);
  }, []);

  /* ════════════════════════════════════════════════
     API — LISTE DES ENTREPRISES
  ════════════════════════════════════════════════ */
  const fetchCompanies = async () => {
    try {
      const res = await api.get("/automation_ag/liste_entreprises");
      setCompanies(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch (error) {
      showToast(error.response?.data?.message || "Erreur chargement entreprises", "error");
    }
  };

  /* ════════════════════════════════════════════════
     API — LISTE DES AG
  ════════════════════════════════════════════════ */
  const fetchAgs = async () => {
    setLoadingList(true);
    try {
      const res = await api.get("/automation_ag/list_ags");
      setAgs(res.data?.items || []);
    } catch (error) {
      showToast(error.response?.data?.message || "Erreur chargement AG", "error");
    } finally {
      setLoadingList(false);
    }
  };

  /* ════════════════════════════════════════════════
     API — LISTE DES SGI
  ════════════════════════════════════════════════ */
  const fetchSGIs = async () => {
    try {
      const res = await api.get("/automation_ag/liste_sgis");
      setSgis(res.data?.data || []);
    } catch (error) {
      showToast(error.response?.data?.message || "Erreur chargement SGIs", "error");
    }
  };

  /* ════════════════════════════════════════════════
     API — PARTICIPANTS PAR SGI
     Réponse: { result: [{ nom_sgi, participants: [{ nom_prenom }] }] }
  ════════════════════════════════════════════════ */
  const fetchParticipants = async (codeAg) => {
    setLoadingParticipants(true);
    try {
      const res = await api.get(
        `/automation_ag/list_users_ag/${codeAg}/participants-par-sgi`
      );
      setParticipants(res.data);
    } catch (error) {
      showToast(error.response?.data?.message || "Erreur chargement participants", "error");
    } finally {
      setLoadingParticipants(false);
    }
  };

  /* ════════════════════════════════════════════════
     API — ACTIONNAIRES PAR SGI
     Réponse JSON: { details: [{ Nom_Client, SGI, Nombre_Actions }] }
     Réponse blob si download=true
  ════════════════════════════════════════════════ */
  const fetchActionnairesSgi = async (
    enterpriseId,
    codeAg,
    download = false,
    format = "json"
  ) => {
    setLoadingActionnaires(true);
    try {
      const params = new URLSearchParams();
      if (enterpriseId) params.append("entreprise_id", enterpriseId);
      if (codeAg) params.append("code_ag", codeAg);
      if (download) params.append("download", "true");
      if (format !== "json") params.append("format", format);

      const res = await api.get(
        `/automation_ag/liste_actionnaires_ag/actionnaires-par-sgi?${params.toString()}`,
        { responseType: download ? "blob" : "json" }
      );

      if (download) {
        downloadBlob(res.data, `actionnaires_sgi_${codeAg || "export"}.${format}`);
        return;
      }

      setActionnairesSgiData(res.data);
    } catch (error) {
      showToast(error.response?.data?.message || error.message, "error");
    } finally {
      setLoadingActionnaires(false);
    }
  };

  /* ════════════════════════════════════════════════
     API — RAPPROCHEMENT DÉPOSITAIRE
     Réponse JSON: {
       details: [{ nom_sgi_norm, quantite_action_ag, quantite_action_dep, ecart, info_ecart }],
       summary: { total_ecart, total_dep, total_ag_corrige, ag_id }
     }
  ════════════════════════════════════════════════ */
  const fetchDepositaireCompare = async (codeAg, download = false) => {
    setLoadingDepositaireCompare(true);
    try {
      const res = await api.get(
        `/automation_ag/ag/${codeAg}/depositaire/compare`,
        { responseType: download ? "blob" : "json" }
      );

      if (download) {
        downloadBlob(res.data, `compare_${codeAg || "export"}.xlsx`);
        showToast("Export DCBR lancé ✅");
        return;
      }

      const data = res.data;
      setDepositaireCompare(data.details || []);
      setTotalEcart(data.summary?.total_ecart || 0);
      setTotalDep(data.summary?.total_dep || 0);
      setTotalAgDcbr(data.summary?.total_ag_corrige || 0);
      setAgIdDcbr(data.summary?.ag_id || "");
    } catch (error) {
      if (error.response?.status === 400) {
        showToast("Le tableau dépositaire est vide ou mal structuré.", "error");
      } else {
        showToast(error.response?.data?.message || error.message, "error");
      }
    } finally {
      setLoadingDepositaireCompare(false);
    }
  };

  /* ════════════════════════════════════════════════
     API — FICHIERS DE L'AG
     Réponse: [{ id, nom, sgi: { id, nom_sgi } }]
     On filtre le fichier dépositaire
  ════════════════════════════════════════════════ */
  const fetchAgFiles = async (agId) => {
    setLoadingFiles(true);
    try {
      const res = await api.get(`/automation_ag/get_list_file_ag/${agId}/files`);
      const files = Array.isArray(res.data) ? res.data : [];
      setAgFiles(files.filter((f) => !f.nom?.toLowerCase().includes("depositaire")));
    } catch (error) {
      showToast(error.response?.data?.message || "Erreur chargement fichiers", "error");
    } finally {
      setLoadingFiles(false);
    }
  };

  /* ════════════════════════════════════════════════
     API — CRÉER AG
  ════════════════════════════════════════════════ */
  const createAg = async () => {
    if (!newAgForm.entreprise || !newAgForm.date || !newAgForm.type) {
      showToast("Veuillez remplir tous les champs obligatoires", "error");
      return;
    }
    setLoadingCreate(true);
    try {
      await api.post("/automation_ag/create_ag", {
        date_ag: newAgForm.date,
        entreprise_id: newAgForm.entreprise,
        type_ag: newAgForm.type,
        mode_ag: newAgForm.mode_ag || undefined,
      });
      showToast("Assemblée générale créée avec succès ✅");
      setNewAgModalOpen(false);
      setNewAgForm({ entreprise: "", date: "", type: "", mode_ag: "" });
      await fetchAgs();
    } catch (error) {
      showToast(error.response?.data?.message || "Erreur création AG", "error");
    } finally {
      setLoadingCreate(false);
    }
  };

  /* ════════════════════════════════════════════════
     API — MODIFIER AG
  ════════════════════════════════════════════════ */
  const updateAg = async () => {
    if (!selectedAgForEdit || !editAgForm.date) {
      showToast("Veuillez remplir tous les champs", "error");
      return;
    }
    setLoadingEdit(true);
    try {
      await api.put(`/automation_ag/update_ag/${selectedAgForEdit.id}`, {
        ag_id: selectedAgForEdit.id,
        date_str: editAgForm.date,
        type_ag: editAgForm.type,
      });
      showToast("AG mise à jour avec succès ✅");
      setEditAgModalOpen(false);
      setSelectedAgForEdit(null);
      setEditAgForm({ date: "", type: "" });
      await fetchAgs();
    } catch (error) {
      showToast(error.response?.data?.message || "Erreur modification AG", "error");
    } finally {
      setLoadingEdit(false);
    }
  };

  /* ════════════════════════════════════════════════
     API — IMPORTER DÉPOSITAIRE
  ════════════════════════════════════════════════ */
  const importDepositaireFile = async () => {
    if (!importDepFile || !selectedAgDetails) return;
    setUploadingDepositaire(true);
    const formData = new FormData();
    formData.append("ag_id", selectedAgDetails.id);
    formData.append("file", importDepFile);
    try {
      await api.post(
        `/automation_ag/depositaire_file_ag/${selectedAgDetails.id}/import`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      showToast("Fichier dépositaire chargé ✅");
      setImportDepModalOpen(false);
      setImportDepFile(null);
      if (depositaireFileInputRef.current) depositaireFileInputRef.current.value = "";
      await fetchDepositaireCompare(selectedAgDetails.code_ag);
    } catch (error) {
      const msg =
        error.response?.status === 409
          ? "Un fichier dépositaire existe déjà. Utilisez « Remplacer »."
          : error.response?.data?.message || error.message;
      showToast(msg, "error");
    } finally {
      setUploadingDepositaire(false);
    }
  };

  /* ════════════════════════════════════════════════
     API — REMPLACER DÉPOSITAIRE
  ════════════════════════════════════════════════ */
  const replaceDepositaireFile = async () => {
    if (!remplacerDepFile || !selectedAgDetails) return;
    setUploadingDepositaire(true);
    const formData = new FormData();
    formData.append("file", remplacerDepFile);
    try {
      await api.post(
        `/automation_ag/depositaire_file_ag/${selectedAgDetails.id}/replace`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      showToast("Fichier dépositaire remplacé ✅");
      setRemplacerDepModalOpen(false);
      setRemplacerDepFile(null);
      await fetchDepositaireCompare(selectedAgDetails.code_ag);
    } catch (error) {
      showToast(error.response?.data?.message || "Erreur remplacement dépositaire", "error");
    } finally {
      setUploadingDepositaire(false);
    }
  };

  /* ════════════════════════════════════════════════
     API — CHARGER FICHIER SGI
  ════════════════════════════════════════════════ */
  const handleFileUploadWithSgi = async () => {
    if (!chargerFichierFile || !chargerFichierSgi || !selectedAgDetails) return;
    setUploadingFile(true);
    const formData = new FormData();
    formData.append("ag_id", selectedAgDetails.id);
    formData.append("files", chargerFichierFile);
    formData.append("sgi_id", chargerFichierSgi);
    try {
      await api.post(
        `/automation_ag/add_file_ag/${selectedAgDetails.id}/files-sgi`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      showToast("Fichier SGI chargé ✅");
      setChargerFichierModalOpen(false);
      setChargerFichierSgi("");
      setChargerFichierFile(null);
      if (chargerFileInputRef.current) chargerFileInputRef.current.value = "";
      // Rafraîchir participants + fichiers + actionnaires
      await Promise.all([
        fetchParticipants(selectedAgDetails.code_ag),
        fetchAgFiles(selectedAgDetails.id),
        fetchActionnairesSgi(
          selectedAgDetails.entreprise?.entreprise_id,
          selectedAgDetails.code_ag
        ),
      ]);
    } catch (error) {
      showToast(error.response?.data?.message || "Erreur upload fichier", "error");
    } finally {
      setUploadingFile(false);
    }
  };

  /* ════════════════════════════════════════════════
     API — REMPLACER FICHIER SGI
  ════════════════════════════════════════════════ */
  const replaceFileWithSgi = async () => {
    if (!replaceFile || !selectedFileForReplace) return;
    setUploadingFile(true);
    const formData = new FormData();
    formData.append("fichier_id", selectedFileForReplace.id);
    formData.append("file", replaceFile);
    formData.append("sgi_id", selectedSgiForReplace || selectedFileForReplace.sgi?.id);
    try {
      await api.post(
        `/automation_ag/replace_file_ag/${selectedFileForReplace.id}/replace`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      showToast("Fichier remplacé ✅");
      setReplaceFileModalOpen(false);
      setSelectedFileForReplace(null);
      setSelectedSgiForReplace("");
      setReplaceFile(null);
      if (replaceFileInputRef.current) replaceFileInputRef.current.value = "";
      await Promise.all([
        fetchParticipants(selectedAgDetails.code_ag),
        fetchAgFiles(selectedAgDetails.id),
        fetchActionnairesSgi(
          selectedAgDetails.entreprise?.entreprise_id,
          selectedAgDetails.code_ag
        ),
      ]);
    } catch (error) {
      showToast(error.response?.data?.message || "Erreur remplacement fichier", "error");
    } finally {
      setUploadingFile(false);
    }
  };

  /* ════════════════════════════════════════════════
     API — SUPPRIMER FICHIER
  ════════════════════════════════════════════════ */
  const confirmDeleteFile = async () => {
    if (!fileToDelete) return;
    setDeletingFile(true);
    try {
      await api.delete(`/automation_ag/delete_file_ag/${fileToDelete.id}`);
      showToast("Fichier supprimé ✅");
      setDeleteConfirmOpen(false);
      setFileToDelete(null);
      // Réinitialiser le DCBR car les données changent
      setDepositaireCompare(null);
      setTotalEcart(0);
      setTotalDep(0);
      await Promise.all([
        fetchParticipants(selectedAgDetails.code_ag),
        fetchAgFiles(selectedAgDetails.id),
        fetchActionnairesSgi(
          selectedAgDetails.entreprise?.entreprise_id,
          selectedAgDetails.code_ag
        ),
      ]);
    } catch (error) {
      showToast(error.response?.data?.message || "Erreur suppression", "error");
    } finally {
      setDeletingFile(false);
    }
  };

  /* ════════════════════════════════════════════════
     API — TÉLÉCHARGER PARTICIPANTS
  ════════════════════════════════════════════════ */
  const downloadParticipants = async (format) => {
    if (!selectedAgDetails) return;
    setDownloadingFile(true);
    try {
      const res = await api.get(
        `/automation_ag/list_users_ag/${selectedAgDetails.code_ag}/participants-par-sgi`,
        { params: { download: true, format }, responseType: "blob" }
      );
      downloadBlob(res.data, `participants_${selectedAgDetails.code_ag}.${format}`);
      showToast(`Export ${format.toUpperCase()} lancé ✅`);
    } catch (error) {
      showToast(error.response?.data?.message || "Erreur téléchargement", "error");
    } finally {
      setDownloadingFile(false);
    }
  };

  /* ════════════════════════════════════════════════
     NAVIGATION
  ════════════════════════════════════════════════ */
  const handleAgClick = async (ag) => {
    setSelectedAgDetails(ag);
    setView("detail");
    setAgOpen(false);
    setParticipants(null);
    setActionnairesSgiData(null);
    setDepositaireCompare(null);
    setTotalEcart(0);
    setTotalDep(0);
    setTotalAgDcbr(0);
    setAgFiles([]);

    await Promise.all([
      fetchParticipants(ag.code_ag),
      fetchAgFiles(ag.id),
      fetchActionnairesSgi(ag.entreprise?.entreprise_id, ag.code_ag),
      fetchDepositaireCompare(ag.code_ag),
    ]);
  };

  const handleBackToList = () => {
    setView("list");
    setSelectedAgDetails(null);
    setParticipants(null);
    setAgFiles([]);
    setActionnairesSgiData(null);
    setDepositaireCompare(null);
    setFilterText("");
  };

  /* ─── Toggle AG ─── */
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

  /* ─── SGIs pour les SGI cards (depuis participants.result) ─── */
  const sgiCards = participants?.result || [];

  /* ─── Filtrage liste ─── */
  const filteredAGs = ags.filter((ag) => {
    const t = filterText.toLowerCase();
    return (
      ag.code_ag?.toLowerCase().includes(t) ||
      ag.entreprise?.nom_entreprise?.toLowerCase().includes(t)
    );
  });

  /* ─── Validation fichier CSV/XLSX ─── */
  const validateFile = (file) => {
    const allowed = ["text/csv", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"];
    const ext = file.name.toLowerCase().slice(file.name.lastIndexOf("."));
    if (allowed.includes(file.type) || [".csv", ".xlsx"].includes(ext)) return true;
    showToast("Seuls les fichiers CSV et XLSX sont autorisés.", "error");
    return false;
  };

  const validatePdf = (file) => {
    if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) return true;
    showToast("Seuls les fichiers PDF sont autorisés pour les dépositaires.", "error");
    return false;
  };

  /* ─── Effets initiaux ─── */
  useEffect(() => {
    fetchCompanies();
    fetchAgs();
  }, []);

  useEffect(() => {
    fetchSGIs();
  }, [importDepModalOpen, chargerFichierModalOpen, replaceFileModalOpen]);

  /* ════════════════════════════════════════════════
     RENDER — LISTE
  ════════════════════════════════════════════════ */
  const renderList = () => (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4 px-8 pt-8 pb-0">
        <div>
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-1">Gestion</p>
          <h1 className="text-[2.4rem] leading-tight text-slate-900">Assemblées Générales</h1>
          <p className="text-sm text-slate-500 mt-1">Suivez et gérez l'ensemble de vos assemblées</p>
        </div>
        <button
          onClick={() => setNewAgModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 active:scale-95 transition-all shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" /></svg>
          Nouvelle AG
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 px-8 pt-6">
        <StatCard label="Total AG" value={ags.length} dot="bg-blue-500" />
        <StatCard label="En cours" value={ags.filter((a) => a.statut_ag === "en_cours").length} dot="bg-emerald-500" />
        <StatCard label="À venir" value={ags.filter((a) => a.statut_ag === "a_venir" || a.statut_ag === "à_venir").length} dot="bg-amber-400" />
        <StatCard label="Passées" value={ags.filter((a) => a.statut_ag === "passee" || a.statut_ag === "passée").length} dot="bg-slate-300" />
      </div>

      {/* Recherche */}
      <div className="px-8 pt-5">
        <div className="relative max-w-2xl">
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

      {/* Grille AG */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 px-8 py-6 pb-14">
        {loadingList ? (
          <div className="col-span-3 flex items-center justify-center py-24">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredAGs.length === 0 ? (
          <div className="col-span-3 flex flex-col items-center justify-center py-24 text-slate-400 text-center">
            <p className="font-medium">Aucune assemblée trouvée</p>
          </div>
        ) : (
          filteredAGs.map((ag, index) => (
            <AGCard
              key={ag.id || index}
              ag={ag}
              index={index}
              onOpenDetail={() => handleAgClick(ag)}
              onEdit={() => {
                setSelectedAgForEdit(ag);
                setEditAgForm({ date: ag.date_ag?.slice(0, 10) || "", type: ag.type_ag || "" });
                setEditAgModalOpen(true);
              }}
            />
          ))
        )}
      </div>
    </>
  );

  /* ════════════════════════════════════════════════
     RENDER — DÉTAIL
  ════════════════════════════════════════════════ */
  const renderDetail = () => {
    const ag = selectedAgDetails;
    if (!ag) return null;

    const totalPart = participants?.result?.reduce((acc, s) => acc + s.participants.length, 0) || 0;
    const nbSgi = participants?.result?.length || 0;

    return (
      <>
        {/* Retour */}
        <div className="flex items-center gap-3 px-8 pt-6">
          <button
            onClick={handleBackToList}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-slate-500 text-sm font-medium hover:text-slate-800 hover:border-slate-300 hover:-translate-x-0.5 transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
            Retour
          </button>
          <div className="text-sm text-slate-400 flex items-center gap-1.5">
            <span>Assemblées</span><span>/</span>
            <span className="text-slate-600 font-medium">{ag.entreprise?.nom_entreprise}</span>
          </div>
        </div>

        {/* Hero */}
        <div className="mx-8 mt-5 bg-[#0f172a] rounded-2xl p-8 relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "repeating-linear-gradient(0deg,#fff 0px,#fff 1px,transparent 1px,transparent 40px),repeating-linear-gradient(90deg,#fff 0px,#fff 1px,transparent 1px,transparent 40px)" }} />
          <div className="relative flex flex-wrap items-start justify-between gap-6">
            {/* Gauche */}
            <div className="flex flex-col gap-4">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-mono text-slate-500 bg-white/10 px-2.5 py-1 rounded-md">{ag.code_ag}</span>
                  {statutCfg[ag.statut_ag] && <span className={statutCfg[ag.statut_ag].cls}>{statutCfg[ag.statut_ag].label}</span>}
                </div>
                <h2 className="text-3xl text-white mb-1">{ag.entreprise?.nom_entreprise}</h2>
                <p className="text-slate-400 text-sm mb-4">{fmtD(ag.date_ag)} · {ag.type_ag}</p>
              </div>
              <button
                onClick={toggleAG}
                className={`inline-flex items-center gap-3 px-5 py-3 rounded-xl font-semibold text-sm active:scale-95 transition-all w-fit border text-white shadow-lg ${agOpen ? "bg-emerald-600 hover:bg-emerald-500 border-emerald-500" : "bg-blue-600 hover:bg-blue-500 border-blue-500"}`}
              >
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
                </span>
                {agOpen ? "AG en cours · Clôturer" : "Ouvrir l'AG"}
              </button>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2 mt-1">
              <button onClick={() => setImportDepModalOpen(true)} className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                Charger documents
              </button>
              <button onClick={() => setChargerFichierModalOpen(true)} className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white/10 text-white text-xs font-semibold hover:bg-white/20 transition-colors border border-white/10">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                Charger fichier
              </button>
              <button onClick={() => { setDepositaireModalOpen(true); fetchDepositaireCompare(ag.code_ag); }} className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
                Dépositaire
              </button>
              <button onClick={() => setRemplacerDepModalOpen(true)} className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-amber-500 text-white text-xs font-semibold hover:bg-amber-600 transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 2v6h-6" /><path d="M3 12a9 9 0 0 1 15-6.7L21 8" /><path d="M3 22v-6h6" /><path d="M21 12a9 9 0 0 1-15 6.7L3 16" /></svg>
                Remplacer
              </button>
            </div>
          </div>
        </div>

        {/* Banner AG ouverte */}
        {agOpen && (
          <div className="mx-8 mt-3">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-5 py-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><polygon points="10 8 16 12 10 16 10 8" fill="currentColor" stroke="none" /></svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-emerald-800">Assemblée Générale ouverte</p>
                  <p className="text-xs text-emerald-600">{agOpenTime}</p>
                </div>
              </div>
              <button onClick={toggleAG} className="px-3.5 py-2 rounded-lg bg-white border border-red-200 text-red-600 text-xs font-semibold hover:bg-red-50 transition-colors">Clôturer</button>
            </div>
          </div>
        )}

        {/* Statistiques */}
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3 px-8 pt-5">
          <StatCardDetail label="Total Écart" value={fmt(totalEcart)} color="amber" />
          <StatCardDetail label="Total Dep" value={fmt(totalDep)} color="red" />
          <StatCardDetail label="Actionnaires" value={totalPart} color="blue" />
          <StatCardDetail label="SGI représentées" value={nbSgi} color="purple" />
          <StatCardDetail label="Actions DCBR" value={fmt(totalAgDcbr)} color="emerald" />
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
                <button
                  onClick={() => fetchActionnairesSgi(ag.entreprise?.entreprise_id, ag.code_ag, true, "xlsx")}
                  disabled={loadingActionnaires}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 disabled:opacity-60 transition-colors"
                >⬇ Excel</button>
                <button
                  onClick={() => fetchActionnairesSgi(ag.entreprise?.entreprise_id, ag.code_ag, true, "csv")}
                  disabled={loadingActionnaires}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-700 text-white text-xs font-semibold hover:bg-slate-800 disabled:opacity-60 transition-colors"
                >⬇ CSV</button>
              </div>
            </div>
            <div className="overflow-auto flex-1">
              {loadingActionnaires ? (
                <div className="flex items-center justify-center py-12"><div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>
              ) : !actionnairesSgiData ? (
                <div className="flex items-center justify-center py-12 text-slate-400 text-sm">Aucune donnée</div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="sticky top-0">
                    <tr className="text-left text-[11px] uppercase tracking-widest text-slate-400 bg-slate-50 border-b border-slate-100">
                      <th className="px-5 py-3 font-semibold">Actionnaire</th>
                      <th className="px-5 py-3 font-semibold">SGI</th>
                      <th className="px-5 py-3 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(actionnairesSgiData.details || []).map((row, i) => {
                      const pal = SGI_PALETTE[i % SGI_PALETTE.length];
                      return (
                        <tr key={i} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                          <td className="px-5 py-2.5">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0" style={{ background: pal.bg }}>
                                {initials(row.Nom_Client || "")}
                              </div>
                              <span className="font-medium text-slate-800 text-xs">{row.Nom_Client}</span>
                            </div>
                          </td>
                          <td className="px-5 py-2.5">
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold" style={{ background: pal.light, color: pal.text }}>{row.SGI}</span>
                          </td>
                          <td className="px-5 py-2.5 font-semibold text-slate-700 text-xs">{fmt(row.Nombre_Actions)}</td>
                        </tr>
                      );
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
              <button
                onClick={() => fetchDepositaireCompare(ag.code_ag, true)}
                disabled={loadingDepositaireCompare}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 disabled:opacity-60 transition-colors"
              >⬇ Excel</button>
            </div>
            <div className="overflow-auto flex-1">
              {loadingDepositaireCompare ? (
                <div className="flex items-center justify-center py-12"><div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>
              ) : !depositaireCompare ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400 text-sm gap-2">
                  <span>Aucune donnée dépositaire</span>
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="sticky top-0">
                    <tr className="text-left text-[11px] uppercase tracking-widest text-slate-400 bg-slate-50 border-b border-slate-100">
                      <th className="px-5 py-3 font-semibold">SGI</th>
                      <th className="px-5 py-3 font-semibold">Qté AG</th>
                      <th className="px-5 py-3 font-semibold">Qté DCBR</th>
                      <th className="px-5 py-3 font-semibold">Écart</th>
                      <th className="px-5 py-3 font-semibold">Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {depositaireCompare.map((r, i) => (
                      <tr key={i} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-2.5 font-semibold text-slate-800 text-xs">{r.nom_sgi_norm}</td>
                        <td className="px-5 py-2.5 text-slate-600 text-xs">
                          <span className="px-2 py-1 rounded-md text-[10px] font-semibold bg-blue-100 text-blue-700">{fmt(r.quantite_action_ag)}</span>
                        </td>
                        <td className="px-5 py-2.5 text-slate-600 text-xs">
                          <span className="px-2 py-1 rounded-md text-[10px] font-semibold bg-red-100 text-red-700">{fmt(r.quantite_action_dep)}</span>
                        </td>
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
            <p className="font-semibold text-slate-900 text-sm">📂 Fichiers participants chargés</p>
          </div>
          <div className="p-5 flex flex-wrap gap-3">
            {loadingFiles ? (
              <div className="flex items-center justify-center py-6 w-full"><div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>
            ) : agFiles.length === 0 ? (
              <p className="text-slate-400 text-sm py-4 px-2">Aucun fichier chargé pour cette AG.</p>
            ) : (
              agFiles.map((file) => (
                <div key={file.id} className="flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300 hover:shadow-sm transition-all">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800 leading-none">{file.sgi?.nom_sgi || "SGI"}</p>
                    <p className="text-xs text-slate-400 mt-0.5 max-w-[160px] truncate" title={file.nom}>{file.nom}</p>
                  </div>
                  <div className="flex gap-1.5 ml-3">
                    <button
                      onClick={() => {
                        setSelectedFileForReplace(file);
                        setSelectedSgiForReplace(file.sgi?.id || "");
                        setReplaceFileModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                      title="Remplacer"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 2v6h-6" /><path d="M3 12a9 9 0 0 1 15-6.7L21 8" /><path d="M3 22v-6h6" /><path d="M21 12a9 9 0 0 1-15 6.7L3 16" /></svg>
                    </button>
                    <button
                      onClick={() => { setFileToDelete(file); setDeleteConfirmOpen(true); }}
                      className="p-1.5 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
                      title="Supprimer"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M9 6V4h6v2" /></svg>
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
              <p className="font-semibold text-slate-900 text-sm">🏛️ Actionnaires présents à l'assemblée</p>
              <p className="text-xs text-slate-400 mt-0.5">Cliquez pour voir les participants d'une SGI</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => downloadParticipants("xlsx")} disabled={downloadingFile} className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 disabled:opacity-60 transition-colors">⬇ Excel</button>
              <button onClick={() => downloadParticipants("pdf")} disabled={downloadingFile} className="px-3 py-1.5 rounded-lg bg-slate-700 text-white text-xs font-semibold hover:bg-slate-800 disabled:opacity-60 transition-colors">⬇ PDF</button>
            </div>
          </div>
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {loadingParticipants ? (
              <div className="col-span-3 flex items-center justify-center py-12"><div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>
            ) : sgiCards.length === 0 ? (
              <div className="col-span-3 flex flex-col items-center justify-center py-12 text-slate-400 text-sm">Aucun participant trouvé</div>
            ) : (
              sgiCards.map((sgi, index) => {
                const pal = SGI_PALETTE[index % SGI_PALETTE.length];
                return (
                  <div
                    key={index}
                    onClick={() => { setModalSGI(sgi); setModalSearch(""); setModalParticipantsOpen(true); }}
                    className="rounded-xl border border-slate-200 overflow-hidden cursor-pointer hover:border-slate-300 hover:shadow-md hover:-translate-y-1 transition-all duration-200"
                  >
                    <div className="px-5 py-4" style={{ background: pal.bg }}>
                      <p className="text-white font-semibold text-sm leading-none">{sgi.nom_sgi}</p>
                      <p className="text-white/70 text-xs mt-1">SGI</p>
                    </div>
                    <div className="bg-white p-4">
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <div className="rounded-lg px-3 py-2 border border-slate-100 bg-slate-50">
                          <p className="text-[10px] uppercase tracking-widest text-slate-400">Actions</p>
                          <p className="font-bold text-slate-900 text-sm mt-0.5">
                            {fmt(depositaireCompare?.find(d => d.nom_sgi_norm?.toLowerCase() === sgi.nom_sgi?.toLowerCase())?.quantite_action_ag || 0)}
                          </p>
                        </div>
                        <div className="rounded-lg px-3 py-2 border border-slate-100 bg-slate-50">
                          <p className="text-[10px] uppercase tracking-widest text-slate-400">Participants</p>
                          <p className="font-bold text-slate-900 text-sm mt-0.5">{sgi.participants?.length || 0}</p>
                        </div>
                      </div>
                      <div className="flex gap-1 flex-wrap mb-3">
                        {(sgi.participants || []).slice(0, 5).map((p, pi) => (
                          <div key={pi} className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold ring-2 ring-white" style={{ background: pal.bg }} title={p.nom_prenom}>
                            {initials(p.nom_prenom || "")}
                          </div>
                        ))}
                        {(sgi.participants?.length || 0) > 5 && (
                          <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[10px] font-bold ring-2 ring-white">
                            +{sgi.participants.length - 5}
                          </div>
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
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-xs">AD</div>
      </header>

      {view === "list" ? renderList() : renderDetail()}

      {/* ══════════════ MODAL PARTICIPANTS SGI ══════════════ */}
      {modalParticipantsOpen && modalSGI && (
        <ModalWrapper onClose={() => setModalParticipantsOpen(false)}>
          <ModalHeader title={modalSGI.nom_sgi} subtitle={`${modalSGI.participants?.length || 0} participants présents`} onClose={() => setModalParticipantsOpen(false)} />
          <div className="px-5 py-4 border-b border-slate-100">
            <SearchInput value={modalSearch} onChange={setModalSearch} placeholder="Rechercher un participant…" />
          </div>
          <div className="overflow-y-auto flex-1 p-3">
            {(modalSGI.participants || [])
              .filter((p) => (p.nom_prenom || "").toLowerCase().includes(modalSearch.toLowerCase()))
              .map((p, i) => {
                const pal = SGI_PALETTE[i % SGI_PALETTE.length];
                return (
                  <div key={i} className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-slate-50 transition-colors">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background: pal.bg }}>
                      {initials(p.nom_prenom || "")}
                    </div>
                    <p className="text-sm font-semibold text-slate-800 leading-none">{p.nom_prenom}</p>
                  </div>
                );
              })}
          </div>
          <div className="px-6 py-4 border-t border-slate-100 flex justify-end">
            <button onClick={() => setModalParticipantsOpen(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100">Fermer</button>
          </div>
        </ModalWrapper>
      )}

      {/* ══════════════ MODAL NOUVELLE AG ══════════════ */}
      {newAgModalOpen && (
        <ModalWrapper onClose={() => setNewAgModalOpen(false)}>
          <ModalHeader title="Nouvelle Assemblée Générale" subtitle="Créez une nouvelle AG" onClose={() => setNewAgModalOpen(false)} />
          <div className="px-7 py-5 flex flex-col gap-4">
            <FormField label="Entreprise *">
              <select value={newAgForm.entreprise} onChange={(e) => setNewAgForm({ ...newAgForm, entreprise: e.target.value })} className="w-full px-3 py-2 mt-1 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400">
                <option value="">— Sélectionner l'entreprise —</option>
                {companies.map((c) => <option key={c.id} value={c.id}>{c.nom_entreprise}</option>)}
              </select>
            </FormField>
            <FormField label="Date *">
              <input type="date" value={newAgForm.date} onChange={(e) => setNewAgForm({ ...newAgForm, date: e.target.value })} className="w-full px-3 py-2 mt-1 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />
            </FormField>
            <FormField label="Type *">
              <select value={newAgForm.type} onChange={(e) => setNewAgForm({ ...newAgForm, type: e.target.value })} className="w-full px-3 py-2 mt-1 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400">
                <option value="">— Sélectionner le type —</option>
                <option value="Ordinaire">Ordinaire</option>
                <option value="Extraordinaire">Extraordinaire</option>
                <option value="Mixte">Mixte</option>
              </select>
            </FormField>
            <FormField label="Mode">
              <select value={newAgForm.mode_ag} onChange={(e) => setNewAgForm({ ...newAgForm, mode_ag: e.target.value })} className="w-full px-3 py-2 mt-1 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400">
                <option value="">— Sélectionner le mode —</option>
                <option value="presentiel">Présentiel</option>
                <option value="en_ligne">En ligne</option>
                <option value="hybride">Hybride</option>
              </select>
            </FormField>
          </div>
          <ModalFooter onCancel={() => setNewAgModalOpen(false)} onConfirm={createAg} loading={loadingCreate} confirmLabel="Créer l'AG" />
        </ModalWrapper>
      )}

      {/* ══════════════ MODAL MODIFIER AG ══════════════ */}
      {editAgModalOpen && selectedAgForEdit && (
        <ModalWrapper onClose={() => setEditAgModalOpen(false)}>
          <ModalHeader title="Modifier l'AG" subtitle={selectedAgForEdit.code_ag} onClose={() => setEditAgModalOpen(false)} />
          <div className="px-7 py-5 flex flex-col gap-4">
            <FormField label="Date *">
              <input type="date" value={editAgForm.date} onChange={(e) => setEditAgForm({ ...editAgForm, date: e.target.value })} className="w-full px-3 py-2 mt-1 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />
            </FormField>
            <FormField label="Type">
              <select value={editAgForm.type} onChange={(e) => setEditAgForm({ ...editAgForm, type: e.target.value })} className="w-full px-3 py-2 mt-1 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400">
                <option value="">— Sélectionner le type —</option>
                <option value="Ordinaire">Ordinaire</option>
                <option value="Extraordinaire">Extraordinaire</option>
                <option value="Mixte">Mixte</option>
              </select>
            </FormField>
          </div>
          <ModalFooter onCancel={() => setEditAgModalOpen(false)} onConfirm={updateAg} loading={loadingEdit} confirmLabel="Enregistrer" />
        </ModalWrapper>
      )}

      {/* ══════════════ MODAL IMPORTER DÉPOSITAIRE ══════════════ */}
      {importDepModalOpen && (
        <ModalWrapper onClose={() => { setImportDepModalOpen(false); setImportDepFile(null); }}>
          <ModalHeader
            title="Importer le fichier Dépositaire"
            subtitle={`AG : ${selectedAgDetails?.code_ag}`}
            onClose={() => { setImportDepModalOpen(false); setImportDepFile(null); }}
            iconBg="bg-red-50"
            icon={<svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>}
          />
          <div className="px-7 py-6">
            <FileDropzone
              file={importDepFile}
              onChange={(f) => { if (f && validatePdf(f)) setImportDepFile(f); }}
              accept=".pdf"
              hint="Seuls les fichiers PDF sont acceptés"
              inputRef={depositaireFileInputRef}
            />
          </div>
          <ModalFooter
            onCancel={() => { setImportDepModalOpen(false); setImportDepFile(null); }}
            onConfirm={importDepositaireFile}
            loading={uploadingDepositaire}
            confirmLabel="Importer"
            confirmClass="bg-red-600 hover:bg-red-700"
            disabled={!importDepFile}
          />
        </ModalWrapper>
      )}

      {/* ══════════════ MODAL REMPLACER DÉPOSITAIRE ══════════════ */}
      {remplacerDepModalOpen && (
        <ModalWrapper onClose={() => { setRemplacerDepModalOpen(false); setRemplacerDepFile(null); }}>
          <ModalHeader
            title="Remplacer le fichier Dépositaire"
            subtitle={`AG : ${selectedAgDetails?.code_ag}`}
            onClose={() => { setRemplacerDepModalOpen(false); setRemplacerDepFile(null); }}
            iconBg="bg-amber-50"
            icon={<svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 2v6h-6" /><path d="M3 12a9 9 0 0 1 15-6.7L21 8" /><path d="M3 22v-6h6" /><path d="M21 12a9 9 0 0 1-15 6.7L3 16" /></svg>}
          />
          <div className="px-7 py-6">
            <FileDropzone
              file={remplacerDepFile}
              onChange={(f) => { if (f && validatePdf(f)) setRemplacerDepFile(f); }}
              accept=".pdf"
              hint="Remplacera le fichier dépositaire existant (PDF uniquement)"
            />
          </div>
          <ModalFooter
            onCancel={() => { setRemplacerDepModalOpen(false); setRemplacerDepFile(null); }}
            onConfirm={replaceDepositaireFile}
            loading={uploadingDepositaire}
            confirmLabel="Remplacer"
            confirmClass="bg-amber-500 hover:bg-amber-600"
            disabled={!remplacerDepFile}
          />
        </ModalWrapper>
      )}

      {/* ══════════════ MODAL CHARGER FICHIER SGI ══════════════ */}
      {chargerFichierModalOpen && (
        <ModalWrapper onClose={() => { setChargerFichierModalOpen(false); setChargerFichierFile(null); setChargerFichierSgi(""); }}>
          <ModalHeader
            title="Charger un fichier SGI"
            subtitle="Associez un fichier CSV/XLSX à une SGI"
            onClose={() => { setChargerFichierModalOpen(false); setChargerFichierFile(null); setChargerFichierSgi(""); }}
            iconBg="bg-blue-50"
            icon={<svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>}
          />
          <div className="px-7 py-5 flex flex-col gap-4">
            <FormField label="SGI *">
              <select value={chargerFichierSgi} onChange={(e) => setChargerFichierSgi(e.target.value)} className="w-full px-3 py-2 mt-1 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400">
                <option value="">— Sélectionner la SGI —</option>
                {sgis.map((s) => <option key={s.id} value={s.id}>{s.nom_sgi}</option>)}
              </select>
            </FormField>
            <FormField label="Fichier CSV ou XLSX *">
              <FileDropzone
                file={chargerFichierFile}
                onChange={(f) => { if (f && validateFile(f)) setChargerFichierFile(f); }}
                accept=".csv,.xlsx"
                hint="Formats acceptés : CSV, XLSX"
                inputRef={chargerFileInputRef}
              />
            </FormField>
          </div>
          <ModalFooter
            onCancel={() => { setChargerFichierModalOpen(false); setChargerFichierFile(null); setChargerFichierSgi(""); }}
            onConfirm={handleFileUploadWithSgi}
            loading={uploadingFile}
            confirmLabel="Charger le fichier"
            disabled={!chargerFichierSgi || !chargerFichierFile}
          />
        </ModalWrapper>
      )}

      {/* ══════════════ MODAL REMPLACER FICHIER SGI ══════════════ */}
      {replaceFileModalOpen && selectedFileForReplace && (
        <ModalWrapper onClose={() => { setReplaceFileModalOpen(false); setReplaceFile(null); }}>
          <ModalHeader
            title="Remplacer le fichier"
            subtitle={`Fichier SGI : ${selectedFileForReplace.sgi?.nom_sgi || ""}`}
            onClose={() => { setReplaceFileModalOpen(false); setReplaceFile(null); }}
          />
          <div className="px-7 py-5 flex flex-col gap-4">
            {/* AG (read-only) */}
            <div>
              <p className="text-xs font-semibold text-slate-600 mb-1">AG concernée</p>
              <div className="px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-500 font-semibold">{selectedAgDetails?.code_ag}</div>
            </div>
            {/* SGI (pre-remplie, read-only visuellement) */}
            <FormField label="SGI">
              <select value={selectedSgiForReplace} onChange={(e) => setSelectedSgiForReplace(e.target.value)} className="w-full px-3 py-2 mt-1 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400">
                <option value="">— Garder la SGI actuelle —</option>
                {sgis.map((s) => <option key={s.id} value={s.id}>{s.nom_sgi}</option>)}
              </select>
            </FormField>
            <FormField label="Nouveau fichier CSV ou XLSX *">
              <FileDropzone
                file={replaceFile}
                onChange={(f) => { if (f && validateFile(f)) setReplaceFile(f); }}
                accept=".csv,.xlsx"
                hint="Remplacera le fichier actuel"
                inputRef={replaceFileInputRef}
              />
            </FormField>
          </div>
          <ModalFooter
            onCancel={() => { setReplaceFileModalOpen(false); setReplaceFile(null); }}
            onConfirm={replaceFileWithSgi}
            loading={uploadingFile}
            confirmLabel="Remplacer"
            confirmClass="bg-blue-600 hover:bg-blue-700"
            disabled={!replaceFile}
          />
        </ModalWrapper>
      )}

      {/* ══════════════ MODAL VOIR DÉPOSITAIRE ══════════════ */}
      {depositaireModalOpen && (
        <ModalWrapper onClose={() => setDepositaireModalOpen(false)} wide>
          <ModalHeader
            title="Comparaison Dépositaire"
            subtitle={`AG : ${selectedAgDetails?.code_ag} — ${selectedAgDetails?.entreprise?.nom_entreprise}`}
            onClose={() => setDepositaireModalOpen(false)}
            iconBg="bg-emerald-50"
            icon={<svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>}
          />
          <div className="overflow-auto flex-1 max-h-96">
            {loadingDepositaireCompare ? (
              <div className="flex items-center justify-center py-16"><div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>
            ) : !depositaireCompare || depositaireCompare.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400 text-sm">Aucune donnée de comparaison disponible</div>
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
                  {depositaireCompare.map((r, i) => (
                    <tr key={i} className="border-b border-slate-50 hover:bg-slate-50">
                      <td className="px-5 py-3 font-semibold text-slate-800 text-xs">{r.nom_sgi_norm}</td>
                      <td className="px-5 py-3 text-xs"><span className="px-2 py-1 rounded bg-blue-100 text-blue-700 font-semibold">{fmt(r.quantite_action_ag)}</span></td>
                      <td className="px-5 py-3 text-xs"><span className="px-2 py-1 rounded bg-red-100 text-red-700 font-semibold">{fmt(r.quantite_action_dep)}</span></td>
                      <td className={`px-5 py-3 font-bold text-xs ${r.ecart === 0 ? "text-emerald-600" : r.ecart > 0 ? "text-amber-600" : "text-red-600"}`}>{r.ecart > 0 ? "+" : ""}{fmt(r.ecart)}</td>
                      <td className="px-5 py-3" dangerouslySetInnerHTML={{ __html: ecartBadge(r.ecart) }} />
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <div className="px-6 py-4 border-t border-slate-100 flex justify-between items-center">
            <button onClick={() => fetchDepositaireCompare(selectedAgDetails.code_ag, true)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors">⬇ Exporter Excel</button>
            <button onClick={() => setDepositaireModalOpen(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100">Fermer</button>
          </div>
        </ModalWrapper>
      )}

      {/* ══════════════ MODAL SUPPRIMER FICHIER ══════════════ */}
      {deleteConfirmOpen && (
        <ModalWrapper onClose={() => setDeleteConfirmOpen(false)} small>
          <div className="p-7 flex flex-col items-center text-center gap-4">
            <div className="w-14 h-14 rounded-full bg-red-50 border border-red-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M9 6V4h6v2" /></svg>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-lg">Supprimer le fichier ?</h3>
              <p className="text-sm text-slate-500 mt-1">
                Le fichier <span className="font-semibold text-slate-700">{fileToDelete?.sgi?.nom_sgi}</span> sera supprimé définitivement.
              </p>
            </div>
          </div>
          <div className="px-6 pb-6 flex justify-center gap-3">
            <button onClick={() => setDeleteConfirmOpen(false)} className="px-5 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 border border-slate-200">Annuler</button>
            <button
              onClick={confirmDeleteFile}
              disabled={deletingFile}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-60"
            >
              {deletingFile && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              Supprimer
            </button>
          </div>
        </ModalWrapper>
      )}

      {/* ══════════════ TOAST ══════════════ */}
      <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2.5 shadow-xl transition-all duration-300 ${toastVisible ? "translate-y-0 opacity-100" : "translate-y-16 opacity-0 pointer-events-none"} ${toastType === "error" ? "bg-red-600" : "bg-slate-900"} text-white`}>
        <div className={`w-1.5 h-1.5 rounded-full ${toastType === "error" ? "bg-red-200" : "bg-emerald-400"}`} />
        {toastMessage}
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════════════
   SOUS-COMPOSANTS
══════════════════════════════════════════════════════════════════════ */

const ModalWrapper = ({ children, onClose, wide, small }) => (
  <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-[3px] flex items-center justify-center z-50" onClick={onClose}>
    <div className={`bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[90vh] w-full mx-4 ${wide ? "max-w-2xl" : small ? "max-w-sm" : "max-w-lg"}`} onClick={(e) => e.stopPropagation()}>
      {children}
    </div>
  </div>
);

const ModalHeader = ({ title, subtitle, onClose, icon, iconBg }) => (
  <div className="px-7 pt-7 pb-5 border-b border-slate-100 flex items-start gap-4">
    {icon && <div className={`w-10 h-10 rounded-xl ${iconBg || "bg-slate-50"} border border-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5`}>{icon}</div>}
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
    <button onClick={onCancel} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100">Annuler</button>
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
    <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
    <input value={value} onChange={(e) => onChange(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-400 text-sm transition-all" placeholder={placeholder} />
  </div>
);

const FileDropzone = ({ file, onChange, accept, hint, inputRef }) => {
  const localRef = useRef(null);
  const ref = inputRef || localRef;
  return (
    <div>
      <div onClick={() => ref.current?.click()} className={`mt-1 border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${file ? "border-blue-300 bg-blue-50" : "border-slate-200 bg-slate-50 hover:border-blue-300 hover:bg-blue-50/50"}`}>
        {file ? (
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
            </div>
            <p className="text-sm font-semibold text-blue-700">{file.name}</p>
            <p className="text-xs text-blue-500">{(file.size / 1024).toFixed(1)} KB · Cliquer pour changer</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-slate-200 flex items-center justify-center">
              <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
            </div>
            <p className="text-sm font-medium text-slate-600">Cliquer pour sélectionner</p>
            {hint && <p className="text-xs text-slate-400">{hint}</p>}
          </div>
        )}
      </div>
      <input ref={ref} type="file" accept={accept} className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onChange(f); }} />
    </div>
  );
};

const StatCard = ({ label, value, dot }) => (
  <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3 hover:shadow-sm transition-shadow">
    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
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
    amber: { bg: "bg-amber-50", border: "border-amber-100", text: "text-amber-700" },
    red: { bg: "bg-red-50", border: "border-red-100", text: "text-red-700" },
    blue: { bg: "bg-blue-50", border: "border-blue-100", text: "text-blue-700" },
    purple: { bg: "bg-purple-50", border: "border-purple-100", text: "text-purple-700" },
    emerald: { bg: "bg-emerald-50", border: "border-emerald-100", text: "text-emerald-600" },
  };
  const c = colorMap[color] || colorMap.blue;
  return (
    <div className={`bg-white rounded-2xl border ${c.border} p-5 flex flex-col gap-2 hover:shadow-sm transition-shadow`}>
      <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">{label}</p>
      <p className={`text-2xl font-bold ${c.text}`}>{value}</p>
    </div>
  );
};

const AGCard = ({ ag, index, onOpenDetail, onEdit }) => {
  const statut = statutCfg[ag.statut_ag];
  const jours = ag.jours_restant ?? 0;

  return (
    <div
      className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-blue-300 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer"
      onClick={onOpenDetail}
    >
      <div className={`h-1 w-full ${ag.statut_ag === "en_cours" ? "bg-emerald-500" : ag.statut_ag?.includes("venir") ? "bg-blue-500" : "bg-slate-300"}`} />
      <div className="px-5 pt-5 pb-4 border-b border-slate-100">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-mono text-slate-400 mb-1">{ag.code_ag}</p>
            <h3 className="font-semibold text-slate-900 text-base truncate">{ag.entreprise?.nom_entreprise}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs border border-slate-200 flex-shrink-0">
            {initials(ag.entreprise?.nom_entreprise || "")}
          </div>
        </div>
        <p className="text-slate-500 text-xs mt-2">{fmtD(ag.date_ag)}</p>
      </div>
      <div className="px-5 py-4">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {statut && <span className={statut.cls}>{statut.label}</span>}
          <span className="inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-500">{ag.type_ag}</span>
          <div className="ml-auto" dangerouslySetInnerHTML={{ __html: joursText(jours) }} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl bg-slate-50 border border-slate-100 px-3 py-2.5">
            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-medium">Participants</p>
            <p className="text-slate-900 font-semibold mt-0.5">{fmt(ag.nb_participants)}</p>
          </div>
          <div className="rounded-xl bg-slate-50 border border-slate-100 px-3 py-2.5">
            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-medium">Type</p>
            <p className="text-slate-900 font-semibold mt-0.5 truncate">{ag.type_ag || "—"}</p>
          </div>
        </div>
      </div>
      <div className="px-5 pb-5 flex gap-2">
        <button
          onClick={(e) => { e.stopPropagation(); onOpenDetail(); }}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 active:scale-95 transition-all"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
          Voir détails
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onEdit(); }}
          className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg border border-slate-200 text-slate-500 text-xs font-semibold hover:bg-slate-50 hover:text-slate-700 transition-all"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
          Modifier
        </button>
      </div>
    </div>
  );
};

export default AGDashboard;
