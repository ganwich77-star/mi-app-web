import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBsiG9CByzLlrvGgjctJshIrc2k-Ck1DMM",
    authDomain: "asistente-digital-comuniones.firebaseapp.com",
    projectId: "asistente-digital-comuniones"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function create() {
    await setDoc(doc(db, "orlas2026_photographers", "test-delete-123"), {
        brandName: "Test Delete",
        createdAt: new Date().toISOString()
    });
    console.log("Created test-delete-123");
}
create();
