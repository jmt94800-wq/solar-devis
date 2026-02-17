
import { GoogleGenAI } from "@google/genai";
import { ClientProfile } from "./types";

// On initialise le client au moment de l'appel pour être sûr que la clé est disponible
const getAIClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY manquante dans l'environnement");
  }
  return new GoogleGenAI({ apiKey });
};

export const getEnergyAnalysis = async (profile: ClientProfile) => {
  try {
    const ai = getAIClient();
    const prompt = `
      En tant qu'expert en énergie solaire, analyse le profil de consommation suivant pour un client résidentiel.
      Client: ${profile.name}
      Adresse: ${profile.address}
      Consommation journalière totale estimée: ${profile.totalDailyKWh.toFixed(2)} kWh
      Puissance de crête (tout allumé): ${profile.totalMaxW} W
      
      Détails des appareils:
      ${profile.items.map(i => `- ${i.appareil}: ${i.puissanceHoraireKWh}kWh/h, ${i.dureeHj}h/j, Qte: ${i.quantite}`).join('\n')}

      Fournis une analyse professionnelle courte (en français) incluant:
      1. Une évaluation de la pertinence d'une installation photovoltaïque.
      2. Le dimensionnement conseillé (en kWc).
      3. Un conseil spécifique sur la gestion des appareils.
      4. Une estimation des économies annuelles potentielles.

      Réponds en format Markdown structuré.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "L'analyse IA n'a pas pu être générée. Vérifiez votre configuration de clé API.";
  }
};
