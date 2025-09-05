import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Désactiver le service worker pour éviter les problèmes de cache
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for(let registration of registrations) {
      registration.unregister();
    }
  });
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
