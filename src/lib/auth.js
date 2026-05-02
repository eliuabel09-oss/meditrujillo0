import { hasFirebaseConfig, getFirebaseAuth } from '../firebase'

const demoUser = {
  uid: 'demo-user',
  displayName: 'Paciente Demo',
  email: 'paciente.demo@meditrujillo.pe',
  photoURL: '/images/doctor-03.svg',
  providerId: 'demo'
}

// Subscribe to session - Now handles async auth initialization
export const subscribeToSession = async (callback) => {
  if (hasFirebaseConfig) {
    try {
      const auth = await getFirebaseAuth();
      const { onAuthStateChanged } = await import('firebase/auth');
      return onAuthStateChanged(auth, callback);
    } catch (err) {
      console.error('Error initializing Firebase Auth', err);
    }
  }

  const stored = window.localStorage.getItem('meditrujillo_session');
  callback(stored ? JSON.parse(stored) : null);
  return () => {};
}

export const registerWithEmail = async (email, password, displayName) => {
  if (hasFirebaseConfig) {
    const auth = await getFirebaseAuth();
    const { createUserWithEmailAndPassword, updateProfile } = await import('firebase/auth');
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    if (displayName) {
      await updateProfile(userCredential.user, { displayName });
    }
    return userCredential.user;
  }

  const newUser = { ...demoUser, email, displayName: displayName || demoUser.displayName };
  window.localStorage.setItem('meditrujillo_session', JSON.stringify(newUser));
  return newUser;
}

export const loginWithEmail = async (email, password) => {
  if (hasFirebaseConfig) {
    const auth = await getFirebaseAuth();
    const { signInWithEmailAndPassword } = await import('firebase/auth');
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  }

  window.localStorage.setItem('meditrujillo_session', JSON.stringify(demoUser));
  return demoUser;
}

export const signOutSession = async () => {
  if (hasFirebaseConfig) {
    const auth = await getFirebaseAuth();
    const { signOut: firebaseSignOut } = await import('firebase/auth');
    await firebaseSignOut(auth);
    return;
  }
  window.localStorage.removeItem('meditrujillo_session');
}

export const loginWithGoogle = async () => {
  if (!hasFirebaseConfig) return null;
  const auth = await getFirebaseAuth();
  const { signInWithPopup, GoogleAuthProvider } = await import('firebase/auth');
  const result = await signInWithPopup(auth, new GoogleAuthProvider());
  return result.user;
}