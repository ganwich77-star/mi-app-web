import { useState, useEffect, useRef } from 'react';
import { db } from '../firebase.js';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';

export function useStaff(photographerId, schoolId) {
    const key = `orlas2026_staff_${photographerId}_${schoolId}`;

    const [staff, setStaff] = useState(() => {
        try {
            const stored = localStorage.getItem(key);
            return stored ? JSON.parse(stored) : [];
        } catch { return []; }
    });

    const isFirstLoad = useRef(true);

    // ESCUCHAR CAMBIOS EN FIREBASE (Sincronización en tiempo real)
    useEffect(() => {
        if (!schoolId) {
            setStaff([]);
            return;
        }

        // Cargar desde el caché local inmediatamente para evitar ver datos del centro previo
        try {
            const stored = localStorage.getItem(key);
            if (stored) {
                setStaff(JSON.parse(stored));
            } else {
                setStaff([]);
            }
        } catch (e) {
            setStaff([]);
        }

        const docRef = doc(db, 'orlas2026_photographers', photographerId, 'staff', schoolId);

        const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                const firebaseData = docSnap.data().items || [];
                setStaff(firebaseData);
                localStorage.setItem(key, JSON.stringify(firebaseData));
            } else if (isFirstLoad.current && staff.length > 0) {
                saveToFirebase(staff);
            }
            isFirstLoad.current = false;
        }, (error) => {
            console.error("Error en onSnapshot staff:", error);
        });

        return () => unsubscribe();
    }, [schoolId, photographerId]);

    const saveToFirebase = async (newStaff) => {
        if (!schoolId) return;
        try {
            const docRef = doc(db, 'orlas2026_photographers', photographerId, 'staff', schoolId);
            await setDoc(docRef, { items: newStaff }, { merge: true });
        } catch (error) {
            console.error("Error guardando staff en Firebase:", error);
        }
    };

    const addStaff = ({ firstName = '', lastName = '', role = '', assignments = [], photoFile = '', schoolId: mSchoolId }) => {
        const newMember = {
            id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            firstName,
            lastName,
            name: `${firstName} ${lastName}`.trim(), // Para compatibilidad
            role,
            assignments,
            photoFile,
            schoolId: mSchoolId || schoolId
        };
        const updated = [...staff, newMember];
        setStaff(updated);
        saveToFirebase(updated);
        return newMember;
    };

    const updateStaffPhoto = (id, photoFile) => {
        const updated = staff.map(m => m.id === id ? { ...m, photoFile } : m);
        setStaff(updated);
        saveToFirebase(updated);
    };

    const updateStaffMember = (id, changes) => {
        const updated = staff.map(m => m.id === id ? { ...m, ...changes } : m);
        setStaff(updated);
        saveToFirebase(updated);
    };

    const deleteStaff = (ids) => {
        const idArray = Array.isArray(ids) ? ids : [ids];
        const updated = staff.filter(m => !idArray.includes(m.id));
        setStaff(updated);
        saveToFirebase(updated);
    };

    return { staff, addStaff, updateStaffPhoto, updateStaffMember, deleteStaff };
}
