import { initializeApp} from "firebase/app";
import { getAuth, GoogleAuthProvider} from "firebase/auth";
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
        apiKey: "AIzaSyCrCAZWlXeoO34pzNEallWPRf6C86qg2co",
        authDomain: "mychatapp-4d6ed.firebaseapp.com",
        projectId: "mychatapp-4d6ed",
        storageBucket: "mychatapp-4d6ed.appspot.com",
        messagingSenderId: "90011669534",
        appId: "1:90011669534:web:4648956947ac255d9c0a0f",
    }

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const firestore = getFirestore(app);
