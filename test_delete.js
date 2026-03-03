import { initializeApp } from "firebase/app";
import { getFirestore, doc, deleteDoc } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBsiG9CByzLlrvGgjctJshIrc2k-Ck1DMM",
    authDomain: "asistente-digital-comuniones.firebaseapp.com",
    projectId: "asistente-digital-comuniones",
    storageBucket: "asistente-digital-comuniones.firebasestorage.app",
    messagingSenderId: "318953930173",
    appId: "1:318953930173:web:25bbcbbca953e978ffa6d4"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function testDelete() {
    try {
        const id = "momentos-unicos";
        console.log("Intentando borrar config de:", id);
        const configRef = doc(db, 'orlas2026_photographers', id, 'config', 'main');
        await deleteDoc(configRef);
        console.log("Config borrada");

        console.log("Intentando borrar raiz de:", id);
        const rootRef = doc(db, 'orlas2026_photographers', id);
        await deleteDoc(rootRef);
        console.log("Raiz borrada");

    } catch (error) {
        console.error("ERROR AL BORRAR:", error.message, error.code);
    }
}

testDelete();
