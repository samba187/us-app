// Service d'inscription aux notifications push Web (vraies notifications background)
// Nécessite des clés VAPID côté backend.

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

async function getPublicKey() {
  try {
    const res = await fetch(`${API_BASE_URL}/push/public-key`, { method: 'GET' });
    if (!res.ok) {
      console.log('[Push] public-key HTTP error', res.status, res.statusText);
      return null;
    }
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      const text = await res.text();
      console.log('[Push] public-key non JSON response snippet:', text.slice(0, 120));
      return null;
    }
    const data = await res.json();
    if (!data || !data.publicKey) {
      console.log('[Push] public-key JSON sans champ publicKey', data);
      return null;
    }
    return data.publicKey;
  } catch (e) {
    console.log('[Push] public-key fetch exception', e);
    return null;
  }
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function registerPush() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.log('[Push] Non supporté');
    return false;
  }
  try {
    const reg = await navigator.serviceWorker.ready;
  const publicKey = await getPublicKey();
  if (!publicKey) { console.log('[Push] Pas de clé publique côté serveur (échec récupération)'); return false; }
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey)
    });
    const token = localStorage.getItem('us_token');
    await fetch(`${API_BASE_URL}/push/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(sub)
    });
    console.log('[Push] Subscription envoyée au backend');
    return true;
  } catch (e) {
    console.log('[Push] Erreur subscription', e);
    return false;
  }
}

export async function testPush() {
  const token = localStorage.getItem('us_token');
  const res = await fetch(`${API_BASE_URL}/push/test`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` }});
  return res.json();
}
