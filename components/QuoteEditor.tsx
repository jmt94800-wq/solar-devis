
import React, { useState, useMemo } from 'react';
import { ClientProfile, ProspectEntry, QuoteConfig } from '../types';
import { calculateTotals, calculateSolarSpecs } from '../utils';

interface QuoteEditorProps {
  profile: ClientProfile;
  onSave: (updatedProfile: ClientProfile, config: QuoteConfig) => void;
  onCancel: () => void;
}

export const QuoteEditor: React.FC<QuoteEditorProps> = ({ profile, onSave, onCancel }) => {
  const [items, setItems] = useState<ProspectEntry[]>(profile.items);
  const [config, setConfig] = useState<QuoteConfig>({
    marginPercent: 20,
    discountPercent: 0,
    materialTaxPercent: 20,
    installCost: 1500,
    installTaxPercent: 10
  });

  // Calculs en temps réel pour l'affichage dynamique
  const liveTotals = useMemo(() => calculateTotals(items), [items]);
  const liveSpecs = useMemo(() => calculateSolarSpecs(liveTotals.totalDailyKWh), [liveTotals.totalDailyKWh]);

  const updateItem = (id: string, field: keyof ProspectEntry, value: any) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const addItem = () => {
    const newItem: ProspectEntry = {
      id: `manual-${Date.now()}`,
      client: profile.name,
      lieu: profile.siteName,
      adresse: profile.address,
      date: profile.visitDate,
      agent: "Manuel",
      appareil: "Nouvel Appareil",
      puissanceHoraireKWh: 0,
      puissanceMaxW: 0,
      dureeHj: 0,
      quantite: 1,
      unitPrice: 0
    };
    setItems([...items, newItem]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter(i => i.id !== id));
  };

  const handleSubmit = () => {
    onSave({ ...profile, items, ...liveTotals }, config);
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Configuration du Devis</h2>
          <p className="text-slate-500 text-sm">Ajustez les détails techniques et les paramètres commerciaux.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={onCancel} className="px-4 py-2 text-slate-500 font-medium hover:text-slate-800 transition-colors">Annuler</button>
          <button onClick={handleSubmit} className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all">
            Générer le Devis Final
          </button>
        </div>
      </div>

      {/* Résumé Technique en temps réel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
            <i className="fa-solid fa-solar-panel text-xl"></i>
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dimensionnement</p>
            <p className="text-xl font-black text-slate-900">{liveSpecs.neededKWp} <span className="text-sm font-bold text-slate-400">kWc</span></p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600">
            <i className="fa-solid fa-bolt text-xl"></i>
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Consommation Journalière</p>
            <p className="text-xl font-black text-slate-900">{liveTotals.totalDailyKWh.toFixed(2)} <span className="text-sm font-bold text-slate-400">kWh/j</span></p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600">
            <i className="fa-solid fa-gauge-high text-xl"></i>
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Puissance de Crête</p>
            <p className="text-xl font-black text-slate-900">{liveTotals.totalMaxW} <span className="text-sm font-bold text-slate-400">W</span></p>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {/* Liste des appareils */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <i className="fa-solid fa-list-check text-blue-500"></i> Matériel & Inventaire
            </h3>
            <button onClick={addItem} className="bg-slate-50 hover:bg-blue-50 text-blue-600 text-xs font-black px-4 py-2 rounded-lg transition-colors flex items-center gap-2 uppercase tracking-wider">
              <i className="fa-solid fa-plus"></i> Ajouter un article
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <div className="min-w-[800px] space-y-4">
              <div className="grid grid-cols-12 gap-3 px-2 border-b border-slate-100 pb-2">
                <div className="col-span-3 text-[10px] uppercase font-black text-slate-400">Désignation</div>
                <div className="col-span-1 text-[10px] uppercase font-black text-slate-400 text-center">Puis. (W)</div>
                <div className="col-span-1 text-[10px] uppercase font-black text-slate-400 text-center">Durée (h/j)</div>
                <div className="col-span-1 text-[10px] uppercase font-black text-slate-400 text-center">Qté</div>
                <div className="col-span-2 text-[10px] uppercase font-black text-slate-400 text-right">P.U. HT (€)</div>
                <div className="col-span-3 text-[10px] uppercase font-black text-slate-400 text-right">Sous-total HT</div>
                <div className="col-span-1"></div>
              </div>

              {items.map((item) => (
                <div key={item.id} className="grid grid-cols-12 gap-3 items-center border-b border-slate-50 pb-4 group last:border-0">
                  <div className="col-span-3">
                    <input 
                      type="text" value={item.appareil} 
                      onChange={(e) => updateItem(item.id, 'appareil', e.target.value)}
                      className="w-full bg-slate-50 border border-transparent hover:border-slate-200 rounded-lg text-sm p-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                  </div>
                  <div className="col-span-1">
                    <input 
                      type="number" value={item.puissanceMaxW} 
                      onChange={(e) => updateItem(item.id, 'puissanceMaxW', parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-50 border border-transparent rounded-lg text-sm p-2.5 text-center"
                    />
                  </div>
                  <div className="col-span-1">
                    <input 
                      type="number" step="0.5" value={item.dureeHj} 
                      onChange={(e) => updateItem(item.id, 'dureeHj', parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-50 border border-transparent rounded-lg text-sm p-2.5 text-center font-medium text-blue-600"
                    />
                  </div>
                  <div className="col-span-1">
                    <input 
                      type="number" value={item.quantite} 
                      onChange={(e) => updateItem(item.id, 'quantite', parseInt(e.target.value) || 0)}
                      className="w-full bg-slate-50 border border-transparent rounded-lg text-sm p-2.5 text-center font-bold"
                    />
                  </div>
                  <div className="col-span-2">
                    <input 
                      type="number" value={item.unitPrice} 
                      onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-50 border border-transparent rounded-lg text-sm p-2.5 text-right font-medium"
                    />
                  </div>
                  <div className="col-span-3">
                    <div className="text-sm font-black text-slate-900 p-2.5 text-right">
                      {((item.unitPrice || 0) * item.quantite).toLocaleString(undefined, { minimumFractionDigits: 2 })} €
                    </div>
                  </div>
                  <div className="col-span-1 text-right">
                    <button onClick={() => removeItem(item.id)} className="text-slate-300 hover:text-red-500 p-2.5 transition-colors">
                      <i className="fa-solid fa-trash-can"></i>
                    </button>
                  </div>
                </div>
              ))}
              {items.length === 0 && (
                <div className="text-center py-10 text-slate-400 text-sm italic">
                  Aucun appareil. Cliquez sur "Ajouter un article" pour commencer.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Configuration Commerciale et Fiscalité */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-slate-900 text-white p-7 rounded-3xl shadow-xl">
            <h3 className="font-black mb-8 flex items-center gap-2 uppercase text-xs tracking-[0.2em] text-blue-400">
              <i className="fa-solid fa-chart-line"></i> Stratégie Commerciale
            </h3>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Marge Matériel (%)</label>
                  <span className="text-sm font-black text-blue-400">{config.marginPercent}%</span>
                </div>
                <input 
                  type="range" min="0" max="100" value={config.marginPercent} 
                  onChange={(e) => setConfig({...config, marginPercent: parseInt(e.target.value)})}
                  className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Remise Client (%)</label>
                <div className="relative">
                  <input 
                    type="number" value={config.discountPercent} 
                    onChange={(e) => setConfig({...config, discountPercent: parseFloat(e.target.value) || 0})}
                    className="w-full bg-slate-800 border-none rounded-xl p-3 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none pr-8"
                  />
                  <span className="absolute right-3 top-3 text-slate-500">%</span>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-800">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Main d'œuvre (€ HT)</label>
                <div className="relative">
                  <input 
                    type="number" value={config.installCost} 
                    onChange={(e) => setConfig({...config, installCost: parseFloat(e.target.value) || 0})}
                    className="w-full bg-slate-800 border-none rounded-xl p-3 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none pr-8"
                  />
                  <span className="absolute right-3 top-3 text-slate-500">€</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-7 rounded-3xl border border-slate-200 shadow-sm h-full">
            <h3 className="font-black text-slate-900 mb-8 uppercase text-[10px] tracking-[0.2em] border-b border-slate-100 pb-4">
              <i className="fa-solid fa-file-invoice-dollar text-slate-400 mr-2"></i> Fiscalité & TVA
            </h3>
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">TVA Matériel (%)</label>
                <div className="relative">
                  <input 
                    type="number" 
                    step="0.1"
                    value={config.materialTaxPercent}
                    onChange={(e) => setConfig({...config, materialTaxPercent: parseFloat(e.target.value) || 0})}
                    className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm font-black focus:ring-2 focus:ring-blue-500 outline-none pr-8"
                  />
                  <span className="absolute right-3 top-3 text-slate-400 font-bold">%</span>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">TVA Prestation (%)</label>
                <div className="relative">
                  <input 
                    type="number" 
                    step="0.1"
                    value={config.installTaxPercent}
                    onChange={(e) => setConfig({...config, installTaxPercent: parseFloat(e.target.value) || 0})}
                    className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm font-black focus:ring-2 focus:ring-blue-500 outline-none pr-8"
                  />
                  <span className="absolute right-3 top-3 text-slate-400 font-bold">%</span>
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-2xl text-[11px] text-blue-700 leading-relaxed italic">
                Note : La TVA s'applique sur les montants nets après remise et marge commerciale. 
                Saisissez les taux de TVA applicables pour le matériel et la main d'œuvre.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
