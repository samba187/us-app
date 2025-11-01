// Notification & Web Push service for PWA
import { authService } from './authService';

const SW_PATH = '/sw.js';

async function getVapidPublicKey() {
  const res = await authService.api.get('/api/push/public-key');
  const key = res.data?.publicKey || res.data?.public_key || '';
  if (!key) throw new Error('Clé publique VAPID manquante');
  return urlBase64ToUint8Array(key);
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}

async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return null;
  try {
    const reg = await navigator.serviceWorker.register(SW_PATH);
    return reg;
  } catch (e) {
    console.warn('[Notifications] SW register failed', e);
    return null;
  }
}

async function requestPermissionIfNeeded() {
  if (typeof Notification === 'undefined') return 'denied';
  if (Notification.permission === 'default') {
    try {
      const p = await Notification.requestPermission();
      return p;
    } catch {
      return 'denied';
    }
  }
  return Notification.permission;
}

async function getExistingSubscription(reg) {
  try {
    return await reg.pushManager.getSubscription();
  } catch {
    return null;
  }
}

async function subscribeUserToPush() {
  const permission = await requestPermissionIfNeeded();
  if (permission !== 'granted') throw new Error('Permission notifications refusée');

  const reg = (await registerServiceWorker()) || (await navigator.serviceWorker.ready);
  if (!reg) throw new Error('Service worker indisponible');

  const existing = await getExistingSubscription(reg);
  if (existing) return existing;

  const appServerKey = await getVapidPublicKey();
  return reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: appServerKey });
}

async function saveSubscriptionToServer(subscription) {
  try {
    await authService.api.post('/api/push/subscribe', subscription);
    return true;
  } catch (e) {
    console.warn('[Notifications] saveSubscriptionToServer failed', e);
    return false;
  }
}

export async function ensurePushSubscribed() {
  const reg = await registerServiceWorker();
  const sub = reg && (await getExistingSubscription(reg));
  if (sub) return { ok: true, status: 'already', subscription: sub };
  const created = await subscribeUserToPush();
  const saved = await saveSubscriptionToServer(created.toJSON());
  return { ok: saved, status: 'subscribed', subscription: created };
}

export async function testPush() {
  try {
    const res = await authService.api.post('/api/push/test');
    return res.data;
  } catch (e) {
    throw e;
  }
}

export async function getPermissionStatus() {
  if (typeof Notification === 'undefined') return 'unsupported';
  return Notification.permission;
}


