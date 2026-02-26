import { useState, useEffect, useRef } from 'react';
import { db } from '../firebase.js';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { DEFAULT_PAYMENT_METHODS, SCHOOLS } from '../constants.js';

const SETTINGS_KEY = 'orlas2026_settings';

export function useSettings() {
    // Carga inicial desde LocalStorage
    const [settings, setSettings] = useState(() => {
        try {
            const stored = localStorage.getItem(SETTINGS_KEY);
            return stored ? JSON.parse(stored) : {
                paymentMethods: DEFAULT_PAYMENT_METHODS,
                schools: [...SCHOOLS],
                adminPin: '7373',
                giftDiscount: 25
            };
        } catch {
            return {
                paymentMethods: DEFAULT_PAYMENT_METHODS,
                schools: [...SCHOOLS],
                adminPin: '7373',
                giftDiscount: 25
            };
        }
    });

    const isFirstLoad = useRef(true);

    // ESCUCHAR AJUSTES EN FIREBASE
    useEffect(() => {
        const docRef = doc(db, 'orlas2026_settings', 'config');

        const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                const firebaseData = docSnap.data();
                setSettings(firebaseData);
                localStorage.setItem(SETTINGS_KEY, JSON.stringify(firebaseData));
            } else if (isFirstLoad.current) {
                // Si no hay nada en Firebase, subir lo que tengamos localmente
                saveToFirebase(settings);
            }
            isFirstLoad.current = false;
        }, (error) => {
            console.error("Error en onSnapshot settings:", error);
        });

        return () => unsubscribe();
    }, []);

    const saveToFirebase = async (newSettings) => {
        try {
            const docRef = doc(db, 'orlas2026_settings', 'config');
            await setDoc(docRef, newSettings);
        } catch (error) {
            console.error("Error guardando settings en Firebase:", error);
        }
    };

    const togglePaymentMethod = (id) => {
        const updated = {
            ...settings,
            paymentMethods: settings.paymentMethods.map(m =>
                m.id === id ? { ...m, enabled: !m.enabled } : m
            ),
        };
        setSettings(updated);
        saveToFirebase(updated);
    };

    const addPaymentMethod = (label) => {
        const id = label.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
        const updated = {
            ...settings,
            paymentMethods: [...settings.paymentMethods, { id, label, enabled: true }],
        };
        setSettings(updated);
        saveToFirebase(updated);
    };

    const addSchool = (name) => {
        const id = name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '') + '_' + Date.now();
        const code = name.substring(0, 3).toUpperCase();
        const updated = {
            ...settings,
            schools: [...(settings.schools || SCHOOLS), { id, name, code }],
        };
        setSettings(updated);
        saveToFirebase(updated);
    };

    const deleteSchool = (id) => {
        const updated = {
            ...settings,
            schools: (settings.schools || SCHOOLS).filter(s => s.id !== id),
        };
        setSettings(updated);
        saveToFirebase(updated);
    };

    const updateAdminPin = (newPin) => {
        const updated = { ...settings, adminPin: newPin };
        setSettings(updated);
        saveToFirebase(updated);
    };

    const updateSettings = (updates) => {
        const updated = { ...settings, ...updates };
        setSettings(updated);
        saveToFirebase(updated);
    };

    const enabledPaymentMethods = settings.paymentMethods.filter(m => m.enabled);
    const availableSchools = (settings.schools || SCHOOLS).filter(s => s.id !== 'otros');

    return {
        settings,
        paymentMethods: settings.paymentMethods,
        enabledPaymentMethods,
        schools: availableSchools,
        adminPin: settings.adminPin || '7373',
        togglePaymentMethod,
        addPaymentMethod,
        addSchool,
        deleteSchool,
        updateAdminPin,
        updateSettings,
    };
}
