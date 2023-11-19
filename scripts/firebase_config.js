import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.2/firebase-app.js";
import { getFirestore,
    collection,
    getDocs,
    onSnapshot,
    addDoc,
    deleteDoc,
    doc,
    getDoc,
    updateDoc,
    where,
    query
   } from "https://www.gstatic.com/firebasejs/9.6.2/firebase-firestore.js";
import { getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword 
} from "https://www.gstatic.com/firebasejs/9.6.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyAPF9nBIk0fdNDVPZUrCx9ABNQA1_Bh9aI",
  authDomain: "davcom-385e6.firebaseapp.com",
  projectId: "davcom-385e6",
  storageBucket: "davcom-385e6.appspot.com",
  messagingSenderId: "350410983906",
  appId: "1:350410983906:web:2e47657948393fde5a91bb",
  measurementId: "G-4LVFCZQ664"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app); 
const auth = getAuth(app);

export {
    db,
    collection,
    getDocs,
    addDoc,
    doc,
    updateDoc,
    auth,
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    where,
    query
}