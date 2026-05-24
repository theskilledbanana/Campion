import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
const firebaseConfig = {
  "projectId": "gen-lang-client-0463005360",
  "appId": "1:920458730295:web:8332277a0f040243c798b2",
  "apiKey": "AIzaSyAHlcHLpXSMfKje2Qahxu400ssM-4wi3Mg",
  "authDomain": "gen-lang-client-0463005360.firebaseapp.com",
  "firestoreDatabaseId": "ai-studio-746f4c9b-417b-4f9a-8c94-1e4b46eda528",
  "storageBucket": "gen-lang-client-0463005360.firebasestorage.app",
  "messagingSenderId": "920458730295",
  "measurementId": ""
};

let db = null;
let auth = null;

try {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
    auth = getAuth(app);
} catch (e) {
    console.error("Firebase Initialization Failed:", e);
}

export { db, auth };
