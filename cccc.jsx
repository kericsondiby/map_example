import React, { useState, useEffect } from 'react';
import { Plus, TrendingUp, TrendingDown, Trash2, Edit2, X, Check } from 'lucide-react';

export default function StockPortfolio() {
  const [transactions, setTransactions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    type: 'achat',
    ticker: '',
    nom: '',
    quantite: '',
    prix: '',
    date: new Date().toISOString().split('T')[0],
    frais: '0'
  });

  useEffect(() => {
    const saved = localStorage.getItem('stockTransactions');
    if (saved) {
      setTransactions(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('stockTransactions', JSON.stringify(transactions));
  }, [transactions]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const transaction = {
      id: editingId || Date.now(),
      ...formData,
      quantite: parseFloat(formData.quantite),
      prix: parseFloat(formData.prix),
      frais: parseFloat(formData.frais)
    };

    if (editingId) {
      setTransactions(transactions.map(t => t.id === editingId ? transaction : t));
      setEditingId(null);
    } else {
      setTransactions([transaction, ...transactions]);
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      type: 'achat',
      ticker: '',
      nom: '',
      quantite: '',
      prix: '',
      date: new Date().toISOString().split('T')[0],
      frais: '0'
    });
    setShowForm(false);
  };

  const handleEdit = (transaction) => {
    setFormData(transaction);
    setEditingId(transaction.id);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette transaction ?')) {
      setTransactions(transactions.filter(t => t.id !== id));
    }
  };

  const calculatePortfolio = () => {
    const positions = {};
    
    transactions.forEach(t => {
      if (!positions[t.ticker]) {
        positions[t.ticker] = {
          ticker: t.ticker,
          nom: t.nom,
          quantite: 0,
          montantTotal: 0,
          fraisTotal: 0
        };
      }
      
      const montant = t.quantite * t.prix;
      
      if (t.type === 'achat') {
        positions[t.ticker].quantite += t.quantite;
        positions[t.ticker].montantTotal += montant;
        positions[t.ticker].fraisTotal += t.frais;
      } else {
        positions[t.ticker].quantite -= t.quantite;
        positions[t.ticker].montantTotal -= montant;
        positions[t.ticker].fraisTotal += t.frais;
      }
    });
    
    return Object.values(positions).filter(p => p.quantite > 0);
  };

  const portfolio = calculatePortfolio();
  const totalInvesti = portfolio.reduce((sum, p) => sum + p.montantTotal + p.fraisTotal, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 mb-2">
                Portfolio Boursier
              </h1>
              <p className="text-slate-600">Gérez vos achats et ventes de titres</p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-lg"
            >
              {showForm ? <X size={20} /> : <Plus size={20} />}
              {showForm ? 'Annuler' : 'Nouvelle Transaction'}
            </button>
          </div>

          {/* Résumé du portfolio */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl">
              <p className="text-blue-600 text-sm font-medium mb-1">Positions Actives</p>
              <p className="text-2xl font-bold text-blue-900">{portfolio.length}</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl">
              <p className="text-green-600 text-sm font-medium mb-1">Total Investi</p>
              <p className="text-2xl font-bold text-green-900">
                {totalInvesti.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
              </p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl">
              <p className="text-purple-600 text-sm font-medium mb-1">Transactions</p>
              <p className="text-2xl font-bold text-purple-900">{transactions.length}</p>
            </div>
          </div>

          {/* Formulaire */}
          {showForm && (
            <form onSubmit={handleSubmit} className="bg-slate-50 p-6 rounded-xl mb-8">
              <h3 className="text-lg font-semibold mb-4 text-slate-800">
                {editingId ? 'Modifier la transaction' : 'Nouvelle transaction'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="achat">Achat</option>
                    <option value="vente">Vente</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Ticker</label>
                  <input
                    type="text"
                    value={formData.ticker}
                    onChange={(e) => setFormData({...formData, ticker: e.target.value.toUpperCase()})}
                    placeholder="ex: AAPL"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nom de l'action</label>
                  <input
                    type="text"
                    value={formData.nom}
                    onChange={(e) => setFormData({...formData, nom: e.target.value})}
                    placeholder="ex: Apple Inc."
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Quantité</label>
                  <input
                    type="number"
                    step="0.001"
                    value={formData.quantite}
                    onChange={(e) => setFormData({...formData, quantite: e.target.value})}
                    placeholder="0"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Prix unitaire (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.prix}
                    onChange={(e) => setFormData({...formData, prix: e.target.value})}
                    placeholder="0.00"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Frais (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.frais}
                    onChange={(e) => setFormData({...formData, frais: e.target.value})}
                    placeholder="0.00"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  <Check size={18} />
                  {editingId ? 'Mettre à jour' : 'Ajouter'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-2 border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  Annuler
                </button>
              </div>
            </form>
          )}

          {/* Positions actuelles */}
          {portfolio.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-slate-800">Positions Actuelles</h2>
              <div className="grid gap-3">
                {portfolio.map((position) => {
                  const prixMoyen = position.montantTotal / position.quantite;
                  return (
                    <div key={position.ticker} className="bg-gradient-to-r from-slate-50 to-white p-4 rounded-lg border border-slate-200">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-bold text-lg text-slate-800">{position.ticker}</h3>
                          <p className="text-sm text-slate-600">{position.nom}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-slate-600">Quantité: <span className="font-semibold">{position.quantite}</span></p>
                          <p className="text-sm text-slate-600">Prix moyen: <span className="font-semibold">{prixMoyen.toFixed(2)} €</span></p>
                          <p className="text-sm font-bold text-slate-800">
                            Valeur: {(position.montantTotal + position.fraisTotal).toFixed(2)} €
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Historique des transactions */}
          <div>
            <h2 className="text-xl font-semibold mb-4 text-slate-800">Historique des Transactions</h2>
            {transactions.length === 0 ? (
              <p className="text-center text-slate-500 py-8">Aucune transaction enregistrée</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Date</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Type</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Ticker</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Nom</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">Quantité</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">Prix</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">Total</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {transactions.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 text-sm text-slate-700">
                          {new Date(transaction.date).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                            transaction.type === 'achat' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {transaction.type === 'achat' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                            {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-slate-800">{transaction.ticker}</td>
                        <td className="px-4 py-3 text-sm text-slate-600">{transaction.nom}</td>
                        <td className="px-4 py-3 text-sm text-right text-slate-700">{transaction.quantite}</td>
                        <td className="px-4 py-3 text-sm text-right text-slate-700">{transaction.prix.toFixed(2)} €</td>
                        <td className="px-4 py-3 text-sm text-right font-semibold text-slate-800">
                          {(transaction.quantite * transaction.prix + transaction.frais).toFixed(2)} €
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => handleEdit(transaction)}
                            className="text-blue-600 hover:text-blue-800 p-1 mr-2"
                            title="Modifier"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(transaction.id)}
                            className="text-red-600 hover:text-red-800 p-1"
                            title="Supprimer"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
