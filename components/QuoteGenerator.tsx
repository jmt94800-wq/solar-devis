
import React, { useEffect, useState } from 'react';
import { ClientProfile, QuoteConfig } from '../types';
import { calculateSolarSpecs } from '../utils';
import { getEnergyAnalysis } from '../geminiService';

interface QuoteGeneratorProps {
  profile: ClientProfile;
  config: QuoteConfig;
  onBack: () => void;
}

export const QuoteGenerator: React.FC<QuoteGeneratorProps> = ({ profile, config, onBack }) => {
  const [analysis, setAnalysis] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const specs = calculateSolarSpecs(profile.totalDailyKWh);

  useEffect(() => {
    const fetchAnalysis = async () => {
      setLoading(true);
      const res = await getEnergyAnalysis(profile);
      setAnalysis(res || '');
      setLoading(false);
    };
    fetchAnalysis();
  }, [profile]);

  const handlePrint = () => {
    window.print();
  };

  // Calculs financiers
  const materialMarginMultiplier = 1 + (config.marginPercent / 100);
  const totalMaterialHT_Base = profile.items.reduce((sum, i) => sum + ((i.unitPrice || 0) * i.quantite * materialMarginMultiplier), 0);
  const discountAmount = totalMaterialHT_Base * (config.discountPercent / 100);
  const totalMaterialAfterDiscount = totalMaterialHT_Base - discountAmount;
  const materialTax = totalMaterialAfterDiscount * (config.materialTaxPercent / 100);
  
  const installTax = config.installCost * (config.installTaxPercent / 100);
  const grandTotal = totalMaterialAfterDiscount + materialTax + config.installCost + installTax;

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <div className="no-print mb-6 flex justify-between items-center">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors font-bold text-sm uppercase tracking-wider"
        >
          <i className="fa-solid fa-chevron-left"></i> Retour à l'édition
        </button>
        <div className="flex gap-4">
           <button 
            onClick={handlePrint}
            className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg hover:bg-slate-800 transition-all flex items-center gap-2"
          >
            <i className="fa-solid fa-print"></i> Imprimer
          </button>
        </div>
      </div>

      <div className="bg-white shadow-2xl overflow-hidden border border-slate-100 quote-container" id="printable-quote">
        {/* En-tête Identité */}
        <div className="p-10 border-b border-slate-100 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-blue-600 p-2 rounded-lg no-print">
                <i className="fa-solid fa-sun text-white"></i>
              </div>
              <h1 className="text-2xl font-black text-slate-900">SolarDevis <span className="text-blue-600">Pro</span></h1>
            </div>
            <p className="text-sm text-slate-400 max-w-xs font-medium">Expertise solaire & Audit énergétique certifié.</p>
          </div>
          <div className="text-right">
            <h2 className="text-3xl font-black text-slate-800 mb-1">DEVIS</h2>
            <p className="text-slate-500 font-bold tracking-widest text-sm uppercase">PROPOSITION COMMERCIALE</p>
            <p className="text-slate-400 text-xs mt-3 uppercase tracking-widest font-black">Réf: {Math.floor(Math.random() * 100000).toString().padStart(6, '0')} • {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        <div className="p-10">
          {/* Informations Client */}
          <div className="grid grid-cols-2 gap-20 mb-12">
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 mb-4">Destinataire</h3>
              <p className="text-xl font-black text-slate-800">{profile.name}</p>
              <p className="text-slate-600 mt-2 leading-relaxed">{profile.address}</p>
              <p className="text-slate-500 text-sm mt-1">{profile.siteName}</p>
            </div>
            <div className="text-right">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 mb-4">Émetteur</h3>
              <p className="text-lg font-bold text-slate-800">Votre Expert Solaire</p>
              <p className="text-slate-500">Service Projets Photovoltaïques</p>
              <p className="text-slate-400 text-sm mt-1">contact@votre-entreprise.fr</p>
            </div>
          </div>

          {/* Dimensionnement & Consommation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
              <h4 className="text-[10px] font-black text-slate-400 uppercase mb-3 tracking-widest">Dimensionnement Suggéré</h4>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-blue-600">{specs.neededKWp}</span>
                <span className="text-lg font-bold text-slate-600">kWc</span>
              </div>
              <p className="text-xs text-slate-500 mt-2 font-medium italic">Configuration estimée à {specs.panelCount} panneaux haute performance.</p>
            </div>
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
              <h4 className="text-[10px] font-black text-slate-400 uppercase mb-3 tracking-widest">Analyse de Consommation</h4>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-orange-600">{profile.totalDailyKWh.toFixed(2)}</span>
                <span className="text-lg font-bold text-slate-600">kWh / jour</span>
              </div>
              <p className="text-xs text-slate-500 mt-2 font-medium">Puissance de crête totale (estimée) : <span className="text-slate-800 font-bold">{profile.totalMaxW} W</span></p>
            </div>
          </div>

          {/* Tableau du Devis */}
          <div className="mb-12">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b-2 border-slate-900">
                  <th className="py-4 text-[10px] uppercase font-black text-slate-900">Désignation</th>
                  <th className="py-4 text-center text-[10px] uppercase font-black text-slate-900">Puissance</th>
                  <th className="py-4 text-center text-[10px] uppercase font-black text-slate-900">Qté</th>
                  <th className="py-4 text-right text-[10px] uppercase font-black text-slate-900">P.U. (€ HT)</th>
                  <th className="py-4 text-right text-[10px] uppercase font-black text-slate-900">Total (€ HT)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {profile.items.map((item, i) => {
                  const displayUnitPrice = (item.unitPrice || 0) * materialMarginMultiplier;
                  return (
                    <tr key={i}>
                      <td className="py-5 font-bold text-slate-800">{item.appareil}</td>
                      <td className="py-5 text-center text-slate-600">{item.puissanceMaxW} W</td>
                      <td className="py-5 text-center text-slate-600">{item.quantite}</td>
                      <td className="py-5 text-right text-slate-600 font-medium">{displayUnitPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })} €</td>
                      <td className="py-5 text-right font-black text-slate-900">{(displayUnitPrice * item.quantite).toLocaleString(undefined, { minimumFractionDigits: 2 })} €</td>
                    </tr>
                  )
                })}
                {config.installCost > 0 && (
                  <tr>
                    <td className="py-5 font-bold text-slate-800">Prestation technique (Main d'œuvre & Installation)</td>
                    <td className="py-5 text-center text-slate-600">-</td>
                    <td className="py-5 text-center text-slate-600">1</td>
                    <td className="py-5 text-right text-slate-600 font-medium">{config.installCost.toLocaleString(undefined, { minimumFractionDigits: 2 })} €</td>
                    <td className="py-5 text-right font-black text-slate-900">{config.installCost.toLocaleString(undefined, { minimumFractionDigits: 2 })} €</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Totaux & Taxes */}
          <div className="flex justify-end mb-20">
            <div className="w-full max-w-sm space-y-4">
              <div className="flex justify-between text-slate-600 font-medium">
                <span>Total Matériel HT</span>
                <span>{totalMaterialHT_Base.toLocaleString(undefined, { minimumFractionDigits: 2 })} €</span>
              </div>
              
              {config.discountPercent > 0 && (
                <div className="flex justify-between text-blue-700 font-black bg-blue-50 px-4 py-2 rounded-xl border border-blue-100">
                  <span>Réduction de {config.discountPercent}%</span>
                  <span>- {discountAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })} €</span>
                </div>
              )}

              <div className="pt-2 border-t border-slate-100 space-y-2 text-sm font-medium text-slate-500">
                <div className="flex justify-between">
                  <span>TVA Matériel ({config.materialTaxPercent}%)</span>
                  <span>{materialTax.toLocaleString(undefined, { minimumFractionDigits: 2 })} €</span>
                </div>
                <div className="flex justify-between">
                  <span>TVA Prestation ({config.installTaxPercent}%)</span>
                  <span>{installTax.toLocaleString(undefined, { minimumFractionDigits: 2 })} €</span>
                </div>
              </div>

              <div className="pt-6 border-t-4 border-slate-900 flex justify-between items-center">
                <span className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Total Net TTC</span>
                <span className="text-3xl font-black text-blue-600">{grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })} €</span>
              </div>
            </div>
          </div>

          {/* Bloc Approbation & Signature */}
          <div className="grid grid-cols-2 gap-10 mt-20 pt-10 border-t border-slate-100 print-only">
            <div className="text-slate-400 text-[10px] italic leading-relaxed">
              Acceptation du devis : Toute signature doit être précédée de la mention manuscrite "Lu et approuvé" suivie de la date et de la signature du client. Ce devis est valable 30 jours à compter de sa date d'émission.
            </div>
            <div className="space-y-12">
              <div className="flex justify-between text-xs font-black text-slate-900 uppercase tracking-widest">
                <span>Cachet et Signature</span>
                <span>Fait le : ___ / ___ / 202___</span>
              </div>
              <div className="h-32 border-2 border-dashed border-slate-200 rounded-3xl"></div>
            </div>
          </div>

          {/* AI Analysis */}
          <div className="mt-12 no-print border-t border-slate-100 pt-10">
            <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
              <i className="fa-solid fa-sparkles text-blue-500"></i> Perspective de Performance
            </h3>
            {loading ? (
              <div className="flex items-center gap-3 text-slate-400 animate-pulse font-bold">
                <div className="w-5 h-5 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                Simulation de rendement en cours...
              </div>
            ) : (
              <div className="bg-slate-50 rounded-3xl p-10 text-slate-700 leading-relaxed shadow-inner border border-slate-100 prose prose-slate max-w-none">
                <div dangerouslySetInnerHTML={{ __html: analysis.replace(/\n/g, '<br/>') }} />
              </div>
            )}
          </div>
        </div>

        {/* Pied de page actions */}
        <div className="bg-slate-900 p-8 flex justify-between items-center no-print">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center">
                <i className="fa-solid fa-shield-check text-blue-400"></i>
             </div>
             <div>
                <p className="text-white text-xs font-black uppercase tracking-widest">SolarDevis Pro v2.5</p>
                <p className="text-slate-500 text-[10px] font-bold">GARANTIE DE PERFORMANCE 25 ANS</p>
             </div>
          </div>
          <button 
            onClick={handlePrint}
            className="bg-blue-600 hover:bg-blue-500 text-white px-10 py-4 rounded-2xl font-black transition-all shadow-2xl shadow-blue-900/40 flex items-center gap-4 group"
          >
            <i className="fa-solid fa-download group-hover:animate-bounce"></i> Télécharger en PDF
          </button>
        </div>
      </div>
    </div>
  );
};
