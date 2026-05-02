import { initializeApp } from 'firebase/app'

const firebaseConfig = {
  apiKey: "AIzaSyCwoeI6edHKfAfZEI-n6hpiCRX38f1DbNU",
  authDomain: "meditrujillo-1977f.firebaseapp.com",
  projectId: "meditrujillo-1977f",
  storageBucket: "meditrujillo-1977f.firebasestorage.app",
  messagingSenderId: "361541018215",
  appId: "1:361541018215:web:e68e7b0fc79082a8be2ac2",
  measurementId: "G-70YV9TN1LL"
};

export const hasFirebaseConfig = true;

let appInstance = null;
if (hasFirebaseConfig) {
  appInstance = initializeApp(firebaseConfig);
}

// Lazy Loaders for heavy services
export const getFirebaseAuth = async () => {
  const { getAuth } = await import('firebase/auth');
  return getAuth(appInstance);
};

export const getFirebaseDb = async () => {
  const { getFirestore } = await import('firebase/firestore');
  return getFirestore(appInstance);
};

export const getFirebaseStorage = async () => {
  const { getStorage } = await import('firebase/storage');
  return getStorage(appInstance);
};

export const initAnalytics = async () => {
  const { getAnalytics } = await import('firebase/analytics');
  return getAnalytics(appInstance);
};

// Legacy exports for compatibility (careful, these will be null initially)
export const app = appInstance;
export let auth = null;
export let db = null;
export let storage = null;

// Initialize analytics after load - pushed further back to avoid interference
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    setTimeout(initAnalytics, 5000);
  });
}
