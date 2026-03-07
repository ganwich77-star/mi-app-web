import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
    apiKey: "AIzaSyBsiG9CByzLlrvGgjctJshIrc2k-Ck1DMM",
    authDomain: "asistente-digital-comuniones.firebaseapp.com",
    projectId: "asistente-digital-comuniones",
    storageBucket: "asistente-digital-comuniones.firebasestorage.app",
    messagingSenderId: "318953930173",
    appId: "1:318953930173:web:25bbcbbca953e978ffa6d4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const functions = getFunctions(app, 'us-central1');
export const messaging = (typeof window !== 'undefined' && 'serviceWorker' in navigator) ? getMessaging(app) : null;
