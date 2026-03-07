import { useState, useEffect, useRef } from 'react';
import { db } from '../firebase.js';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { PACKS, EXTRAS, DEMO_PACKS, DEMO_EXTRAS, DEFAULT_PAYMENT_METHODS, SCHOOLS, DEMO_2026_PACKS, DEMO_2026_EXTRAS } from '../constants.js';

export function useSettings(photographerId, isDemo = false) {
    const SETTINGS_KEY = `orlas2026_settings_${photographerId}`;
    // Carga inicial desde LocalStorage
    const [settings, setSettings] = useState(() => {
        try {
            const stored = localStorage.getItem(SETTINGS_KEY);
            return stored ? JSON.parse(stored) : {
                paymentMethods: DEFAULT_PAYMENT_METHODS,
                schools: [...SCHOOLS],
                packs: [...PACKS],
                extras: [...EXTRAS],
                adminPin: '7373',
                giftDiscount: 25,
                fiscalName: '',
                cif: '',
                address: '',
                postalCode: '',
                city: '',
                province: '',
                logoUrl: null,
                logoUrlDark: null,
                shootingDateDefault: '',
                appDeadlineDefault: '',
                graduationDateDefault: '',
                dateExceptions: []
            };
        } catch {
            return {
                paymentMethods: DEFAULT_PAYMENT_METHODS,
                schools: [...SCHOOLS],
                packs: [...PACKS],
                extras: [...EXTRAS],
                adminPin: '7373',
                giftDiscount: 25,
                fiscalName: '',
                cif: '',
                address: '',
                postalCode: '',
                city: '',
                province: '',
                logoUrl: null,
                logoUrlDark: null,
                shootingDateDefault: '',
                appDeadlineDefault: '',
                graduationDateDefault: '',
                dateExceptions: []
            };
        }
    });

    const isFirstLoad = useRef(true);

    // ESCUCHAR AJUSTES EN FIREBASE
    useEffect(() => {
        if (!photographerId) return;
        const docRef = doc(db, 'orlas2026_photographers', photographerId, 'config', 'main');

        const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                const firebaseData = docSnap.data();

                // Asegurar que Efectivo, Bizum y Tarjeta existan siempre en la lista
                let updatedPM = firebaseData.paymentMethods || [];
                const hasEfectivo = updatedPM.some(m => m.id === 'efectivo');
                const hasBizum = updatedPM.some(m => m.id === 'bizum');
                const hasCard = updatedPM.some(m => m.id === 'card');

                if (!hasEfectivo) updatedPM.push({ id: 'efectivo', label: 'Efectivo', enabled: false });
                if (!hasBizum) updatedPM.push({ id: 'bizum', label: 'Bizum', enabled: false });
                if (!hasCard) updatedPM.push({ id: 'card', label: 'Tarjeta / TPV', enabled: true });

                // Mapeo forzado de iconos para consistencia premium
                const pmConfig = {
                    'efectivo': { icon: '💶', label: 'Efectivo' },
                    'bizum': { icon: '📲', label: 'Bizum' },
                    'card': { icon: '💳', label: 'Tarjeta / TPV' }
                };

                updatedPM = updatedPM.map(m => ({
                    ...m,
                    icon: pmConfig[m.id]?.icon || '🛡️',
                    label: pmConfig[m.id]?.label || (m.label ? m.label.replace(/[💶📲💳]/g, '').trim() : m.id)
                }));

                const finalData = {
                    ...firebaseData,
                    paymentMethods: updatedPM,
                    packs: firebaseData.packs || PACKS,
                    extras: firebaseData.extras || EXTRAS,
                    schools: firebaseData.schools || SCHOOLS,
                };
                setSettings(prev => ({ ...prev, ...finalData }));
                localStorage.setItem(SETTINGS_KEY, JSON.stringify(finalData));
            } else if (isFirstLoad.current && !isDemo) {
                // Al iniciar, no guardamos configuraciones semilla en Firebase si estamos en modo Demo.
                // Esto evita machacar a un usuario real accidentalmente 
                saveToFirebase(settings);
            }
            isFirstLoad.current = false;
        }, (error) => {
            console.error("Error en onSnapshot settings:", error);
        });

        return () => unsubscribe();
    }, [photographerId, SETTINGS_KEY]);

    const saveToFirebase = async (newSettings) => {
        if (isDemo) return; // Bloqueo de seguridad: Evitar escribir ajustes configurados desde Demo
        try {
            const docRef = doc(db, 'orlas2026_photographers', photographerId, 'config', 'main');
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
        const upperName = name.trim().toUpperCase();

        updateSettings(prev => {
            const currentSchools = prev.schools || SCHOOLS;
            const exists = currentSchools.some(s => s.name.toUpperCase() === upperName);
            if (exists) return prev;

            const id = upperName.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '') + '_' + Date.now();
            const schoolWords = upperName.split(/\s+/);
            const filteredWords = schoolWords.filter(w => w.length > 2 || schoolWords.length === 1);
            let code = '';
            if (filteredWords.length > 1) {
                code = filteredWords.map(w => w[0]).join('').toUpperCase();
            } else {
                code = upperName.substring(0, 3).toUpperCase();
            }

            return {
                ...prev,
                schools: [...currentSchools, { id, name: upperName, code }]
            };
        });
    };

    const updateSchool = (id, updates) => {
        updateSettings(prev => ({
            ...prev,
            schools: (prev.schools || SCHOOLS).map(s =>
                s.id === id ? { ...s, ...updates, name: updates.name?.toUpperCase() || s.name } : s
            )
        }));
    };

    const deleteSchool = (id) => {
        updateSettings(prev => ({
            ...prev,
            schools: (prev.schools || SCHOOLS).filter(s => s.id !== id)
        }));
    };

    const updateAdminPin = (newPin) => {
        updateSettings({ adminPin: newPin });
    };


    const updateSettings = async (payload) => {
        setSettings(prev => {
            const updates = typeof payload === 'function' ? payload(prev) : payload;
            const updated = { ...prev, ...updates };

            saveToFirebase(updated);
            localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
            return updated;
        });
    };


    const enabledPaymentMethods = settings.paymentMethods.filter(m => m.enabled);
    const availableSchools = (settings.schools || SCHOOLS).filter(s => s.id !== 'otros');

    // Intercepción visual exclusiva en Modo Demo sin afectar la DB real
    const isDemo2026 = photographerId === 'demo2026';
    const displayPacks = isDemo ? (isDemo2026 ? DEMO_2026_PACKS : DEMO_PACKS) : (settings.packs || PACKS);
    const displayExtras = isDemo ? (isDemo2026 ? DEMO_2026_EXTRAS : DEMO_EXTRAS) : (settings.extras || EXTRAS);

    return {
        settings,
        setSettings,
        paymentMethods: settings.paymentMethods,
        enabledPaymentMethods,
        schools: availableSchools,
        packs: displayPacks,
        extras: displayExtras,
        adminPin: settings.adminPin || '7373',
        togglePaymentMethod,
        addPaymentMethod,
        addSchool,
        updateSchool,
        deleteSchool,
        updateAdminPin,
        updateSettings,
    };
}
