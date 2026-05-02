// server/firebase.js — Firestore helpers used by the Express API
import { initializeApp } from 'firebase/app'
import { getFirestore, collection, getDocs, doc, writeBatch } from 'firebase/firestore'
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage'

const firebaseConfig = {
  apiKey: "AIzaSyCwoeI6edHKfAfZEI-n6hpiCRX38f1DbNU",
  authDomain: "meditrujillo-1977f.firebaseapp.com",
  projectId: "meditrujillo-1977f",
  storageBucket: "meditrujillo-1977f.firebasestorage.app",
  messagingSenderId: "361541018215",
  appId: "1:361541018215:web:e68e7b0fc79082a8be2ac2",
  measurementId: "G-70YV9TN1LL"
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
export const storage = getStorage(app)

// Returns all documents in a Firestore collection as plain objects
export async function readCollection(name) {
  const querySnapshot = await getDocs(collection(db, name))
  return querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }))
}

// Replaces an entire Firestore collection with a new array (delete-all then set-all)
export async function writeCollection(name, items) {
  const batch = writeBatch(db)
  const existingDocs = await getDocs(collection(db, name))
  existingDocs.forEach(d => batch.delete(d.ref))   // clear old docs
  items.forEach(item => {
    const documentId = item.id || item.uid || item.email || `id-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const docRef = doc(db, name, String(documentId))
    batch.set(docRef, item)                         // write new docs
  })
  await batch.commit()
}

// Uploads a file buffer to Firebase Storage and returns its public URL
export async function uploadFile(buffer, filename, mimetype) {
  const storageRef = ref(storage, `uploads/${filename}`)
  await uploadBytes(storageRef, buffer, { contentType: mimetype })
  return await getDownloadURL(storageRef)
}
