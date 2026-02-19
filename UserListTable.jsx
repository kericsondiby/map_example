import { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import {
  FiEye,
  FiEdit2,
  FiTrash2,
  FiSearch,
  FiX,
  FiPlus,
  FiAlertCircle,
  FiUsers,
} from "react-icons/fi";
import { HiOutlineOfficeBuilding } from "react-icons/hi";
import { MdOutlineAlternateEmail } from "react-icons/md";
import { BsTelephone } from "react-icons/bs";
import { RiMapPinLine } from "react-icons/ri";

// ── Modals ──────────────────────────────────────────────────────────────────

function DetailModal({ user, onClose }) {
  if (!user) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-100">
        {/* Header */}
        <div className="bg-slate-900 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <FiEye size={18} />
            <h2 className="font-semibold text-lg tracking-tight">Détail utilisateur</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-2xl font-bold text-slate-500 border-2 border-slate-200">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-slate-900 font-semibold text-xl">{user.name}</p>
              <p className="text-slate-500 text-sm flex items-center gap-1.5">
                <MdOutlineAlternateEmail size={14} />
                {user.email}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4">
            {[
              { label: "ID", value: `#${user.id}`, icon: null },
              { label: "Téléphone", value: user.phone, icon: <BsTelephone size={13} /> },
              { label: "Entreprise", value: user.company?.name, icon: <HiOutlineOfficeBuilding size={14} /> },
              { label: "Ville", value: user.address?.city, icon: <RiMapPinLine size={14} /> },
              { label: "Site web", value: user.website, icon: null },
              { label: "Rue", value: user.address?.street, icon: null },
            ].map(({ label, value, icon }) => (
              <div key={label} className="bg-slate-50 rounded-lg px-4 py-3">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                  {icon}
                  {label}
                </p>
                <p className="text-slate-700 text-sm font-medium truncate">{value ?? "—"}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="px-6 pb-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-700 transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}

function EditModal({ user, onClose, onSave }) {
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });
  if (!user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-100">
        {/* Header */}
        <div className="bg-slate-900 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <FiEdit2 size={16} />
            <h2 className="font-semibold text-lg tracking-tight">Modifier l'utilisateur</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <FiX size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {[
            { label: "Nom complet", key: "name", type: "text" },
            { label: "Adresse e-mail", key: "email", type: "email" },
            { label: "Téléphone", key: "phone", type: "text" },
          ].map(({ label, key, type }) => (
            <div key={key}>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1.5">
                {label}
              </label>
              <input
                type={type}
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 transition"
              />
            </div>
          ))}
        </div>

        <div className="px-6 pb-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={() => { onSave({ ...user, ...form }); onClose(); }}
            className="px-5 py-2.5 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-700 transition-colors"
          >
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}

function ConfirmDeleteModal({ user, onClose, onConfirm }) {
  if (!user) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden border border-slate-100">
        <div className="p-6 text-center">
          <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <FiTrash2 size={26} className="text-red-500" />
          </div>
          <h3 className="text-slate-900 font-bold text-lg mb-2">Confirmer la suppression</h3>
          <p className="text-slate-500 text-sm mb-6">
            Voulez-vous vraiment supprimer{" "}
            <span className="font-semibold text-slate-700">{user.name}</span> ?{" "}
            Cette action est irréversible.
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={() => { onConfirm(user.id); onClose(); }}
              className="flex-1 px-4 py-2.5 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors"
            >
              Supprimer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Custom styles for DataTable ──────────────────────────────────────────────

const tableCustomStyles = {
  headRow: {
    style: {
      backgroundColor: "#f8fafc",
      borderBottom: "2px solid #e2e8f0",
      minHeight: "48px",
    },
  },
  headCells: {
    style: {
      color: "#475569",
      fontWeight: "700",
      fontSize: "11px",
      textTransform: "uppercase",
      letterSpacing: "0.08em",
      paddingLeft: "20px",
      paddingRight: "20px",
    },
  },
  rows: {
    style: {
      fontSize: "14px",
      color: "#334155",
      minHeight: "60px",
      "&:not(:last-of-type)": { borderBottom: "1px solid #f1f5f9" },
    },
    highlightOnHoverStyle: {
      backgroundColor: "#f8fafc",
      transition: "background-color 0.15s ease",
    },
  },
  cells: {
    style: { paddingLeft: "20px", paddingRight: "20px" },
  },
  pagination: {
    style: {
      borderTop: "1px solid #e2e8f0",
      backgroundColor: "#ffffff",
      color: "#64748b",
      fontSize: "13px",
    },
  },
};

// ── Status badge helper ──────────────────────────────────────────────────────

const statusConfig = {
  active:   { label: "Actif",       cls: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200" },
  inactive: { label: "Inactif",     cls: "bg-slate-100  text-slate-500   ring-1 ring-slate-200"   },
  pending:  { label: "En attente",  cls: "bg-amber-50   text-amber-700   ring-1 ring-amber-200"   },
};

const randomStatus = () => {
  const keys = Object.keys(statusConfig);
  return keys[Math.floor(Math.random() * keys.length)];
};

// ── Main Component ───────────────────────────────────────────────────────────

export default function UserListTable() {
  const [users, setUsers]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [filterText, setFilterText] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [modal, setModal]           = useState(null); // "view" | "edit" | "delete"

  useEffect(() => {
    setLoading(true);
    fetch("https://jsonplaceholder.typicode.com/users")
      .then((r) => r.json())
      .then((data) => {
        setUsers(data.map((u) => ({ ...u, status: randomStatus() })));
        setLoading(false);
      })
      .catch(() => {
        setError("Impossible de charger les utilisateurs.");
        setLoading(false);
      });
  }, []);

  const openModal  = (type, user) => { setSelectedUser(user); setModal(type); };
  const closeModal = ()           => { setModal(null); setSelectedUser(null); };

  const handleSave   = (updated) => setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
  const handleDelete = (id)      => setUsers((prev) => prev.filter((u) => u.id !== id));

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(filterText.toLowerCase()) ||
      u.email.toLowerCase().includes(filterText.toLowerCase()) ||
      u.company?.name?.toLowerCase().includes(filterText.toLowerCase())
  );

  const columns = [
    {
      name: "Utilisateur",
      selector: (row) => row.name,
      sortable: true,
      cell: (row) => (
        <div className="flex items-center gap-3 py-1">
          <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-white text-sm font-bold shrink-0">
            {row.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-slate-800 leading-snug">{row.name}</p>
            <p className="text-xs text-slate-400">@{row.username}</p>
          </div>
        </div>
      ),
    },
    {
      name: "Email",
      selector: (row) => row.email,
      sortable: true,
      cell: (row) => (
        <span className="flex items-center gap-1.5 text-slate-600">
          <MdOutlineAlternateEmail size={14} className="text-slate-400 shrink-0" />
          {row.email}
        </span>
      ),
    },
    {
      name: "Téléphone",
      selector: (row) => row.phone,
      cell: (row) => (
        <span className="flex items-center gap-1.5 text-slate-500 text-sm">
          <BsTelephone size={13} className="text-slate-400 shrink-0" />
          {row.phone.split(" ")[0]}
        </span>
      ),
    },
    {
      name: "Entreprise",
      selector: (row) => row.company?.name,
      sortable: true,
      cell: (row) => (
        <span className="flex items-center gap-1.5 text-slate-600 max-w-[140px]">
          <HiOutlineOfficeBuilding size={15} className="text-slate-400 shrink-0" />
          <span className="truncate">{row.company?.name}</span>
        </span>
      ),
    },
    {
      name: "Statut",
      selector: (row) => row.status,
      sortable: true,
      cell: (row) => {
        const { label, cls } = statusConfig[row.status];
        return (
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${cls}`}>
            {label}
          </span>
        );
      },
    },
    {
      name: "Actions",
      center: true,
      cell: (row) => (
        <div className="flex items-center gap-1">
          {/* View */}
          <button
            onClick={() => openModal("view", row)}
            title="Voir le détail"
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition-colors"
          >
            <FiEye size={16} />
          </button>

          {/* Edit */}
          <button
            onClick={() => openModal("edit", row)}
            title="Modifier"
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
          >
            <FiEdit2 size={15} />
          </button>

          {/* Delete */}
          <button
            onClick={() => openModal("delete", row)}
            title="Supprimer"
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
          >
            <FiTrash2 size={15} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans">
      {/* Modals */}
      {modal === "view"   && <DetailModal        user={selectedUser} onClose={closeModal} />}
      {modal === "edit"   && <EditModal          user={selectedUser} onClose={closeModal} onSave={handleSave} />}
      {modal === "delete" && <ConfirmDeleteModal user={selectedUser} onClose={closeModal} onConfirm={handleDelete} />}

      <div className="max-w-6xl mx-auto">
        {/* Page Header */}
        <div className="mb-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center shrink-0">
            <FiUsers size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight leading-none">
              Gestion des utilisateurs
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">
              {users.length} utilisateur{users.length !== 1 ? "s" : ""} au total
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Toolbar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            {/* Search */}
            <div className="relative w-72">
              <FiSearch
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
              <input
                type="text"
                placeholder="Rechercher un utilisateur..."
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                className="w-full pl-9 pr-8 py-2 text-sm rounded-lg border border-slate-200 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 transition"
              />
              {filterText && (
                <button
                  onClick={() => setFilterText("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <FiX size={14} />
                </button>
              )}
            </div>

            {/* Add button */}
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-700 transition-colors">
              <FiPlus size={16} />
              Ajouter
            </button>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mx-6 mt-4 flex items-center gap-3 p-4 rounded-lg bg-red-50 border border-red-100 text-red-700 text-sm">
              <FiAlertCircle size={18} className="shrink-0" />
              {error}
            </div>
          )}

          {/* DataTable */}
          <DataTable
            columns={columns}
            data={filtered}
            progressPending={loading}
            progressComponent={
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <div className="w-8 h-8 border-2 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
                <p className="text-slate-400 text-sm">Chargement des données...</p>
              </div>
            }
            noDataComponent={
              <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                <FiUsers size={48} className="text-slate-200 mb-3" />
                <p className="font-medium text-sm">Aucun utilisateur trouvé</p>
                <p className="text-xs mt-1">Essayez de modifier votre recherche</p>
              </div>
            }
            pagination
            paginationPerPage={8}
            paginationRowsPerPageOptions={[8, 15, 25, 50]}
            highlightOnHover
            pointerOnHover
            customStyles={tableCustomStyles}
            paginationComponentOptions={{
              rowsPerPageText: "Lignes par page :",
              rangeSeparatorText: "sur",
              noRowsPerPage: false,
              selectAllRowsItem: false,
            }}
          />
        </div>
      </div>
    </div>
  );
}
