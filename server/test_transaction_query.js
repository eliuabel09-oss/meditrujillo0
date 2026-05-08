import { initializeApp } from 'firebase/app';
import { getFirestore, doc, collection, query, where, runTransaction } from 'firebase/firestore';

const app = initializeApp({ projectId: 'test' });
const db = getFirestore(app);

async function run() {
  try {
    await runTransaction(db, async (transaction) => {
      const q = query(collection(db, 'test'), where('a', '==', 'b'));
      await transaction.get(q);
    });
  } catch (err) {
    console.log('Error message:', err.message);
  }
}

run();
