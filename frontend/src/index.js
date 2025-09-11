import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Nettoyage agressif seulement en développement (éviter blank screen en production PWA)
if (process.env.NODE_ENV === 'development') {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(function(registrations) {
      for (let registration of registrations) {
        registration.unregister();
      }
    });
  }
  if ('caches' in window) {
    caches.keys().then(function(names) {
      names.forEach(function(name) { caches.delete(name); });
    });
  }
  if (window.__logBoot) window.__logBoot('Mode dev: SW et caches nettoyés');
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
