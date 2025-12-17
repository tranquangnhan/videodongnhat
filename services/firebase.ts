import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

export const firebaseConfig = {
  apiKey: "AIzaSyDnQ93DByulwWZ-SbERGyj2XWa8RiCdzWI",
  authDomain: "website-veo-3.firebaseapp.com",
  databaseURL: "https://website-veo-3-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "website-veo-3",
  storageBucket: "website-veo-3.firebasestorage.app",
  messagingSenderId: "722505873826",
  appId: "1:722505873826:web:35b8bb21c3cf8e3e839afb"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
export default app;