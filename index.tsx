
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error("Élément racine #root introuvable dans le DOM.");
} else {
  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (error) {
    console.error("Erreur fatale lors du montage de l'application :", error);
    rootElement.innerHTML = `
      <div style="padding: 40px; color: #721c24; background: #f8d7da; font-family: sans-serif; border-radius: 8px; margin: 20px;">
        <h2 style="margin-top: 0;">Erreur de chargement</h2>
        <p>L'application n'a pas pu démarrer correctement.</p>
        <pre style="background: rgba(0,0,0,0.05); padding: 10px; border-radius: 4px;">${error instanceof Error ? error.message : "Erreur inconnue"}</pre>
        <p><small>Vérifiez la console du navigateur (F12) pour plus de détails.</small></p>
      </div>
    `;
  }
}
