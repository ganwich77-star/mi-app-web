import { useState, useEffect, useRef } from 'react';
import { db } from '../firebase.js';
import { doc, onSnapshot, setDoc, getDocs, collection } from 'firebase/firestore';
import { PACKS, EXTRAS, DEMO_PACKS, DEMO_EXTRAS, DEFAULT_PAYMENT_METHODS, SCHOOLS, DEMO_2026_PACKS, DEMO_2026_EXTRAS } from '../constants.js';

const ensureArray = (data, fallback) => {
    if (Array.isArray(data)) return data;
    if (data && typeof data === 'object') {
        return Object.entries(data).map(([id, val]) => ({
            ...(typeof val === 'object' ? val : { value: val }),
            id: (val && typeof val === 'object' && val.id) ? val.id : id
        }));
    }
    return fallback || [];
};

export function useSettings(photographerId, isDemo = false) {
    const SETTINGS_KEY = `orlas2026_settings_${photographerId}`;
    // Carga inicial desde LocalStorage
    const [settings, setSettings] = useState(() => {
        try {
            const stored = localStorage.getItem(SETTINGS_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                return {
                    ...parsed,
                    packs: ensureArray(parsed.packs, PACKS),
                    extras: ensureArray(parsed.extras, EXTRAS),
                    schools: ensureArray(parsed.schools, SCHOOLS),
                };
            }
        } catch (e) {
            console.error("Error loading settings from localStorage:", e);
        }
        return {
            paymentMethods: DEFAULT_PAYMENT_METHODS,
            schools: [...SCHOOLS],
            packs: [...PACKS],
            extras: [...EXTRAS],
            adminPin: '7373',
            giftDiscount: 25,
            brandName: '',
            fiscalName: '',
            cif: '',
            address: '',
            addressNumber: '',
            addressFloor: '',
            addressLetter: '',
            postalCode: '',
            city: '',
            province: '',
            logoUrl: null,
            logoUrlDark: null,
            notificationEmail: '',
            contactPhone: '',
            shootingDateDefault: '',
            appDeadlineDefault: '',
            graduationDateDefault: '',
            dateExceptions: []
        };
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

                if (!hasEfectivo) updatedPM.push({ id: 'efectivo', label: 'Efectivo', enabled: true });
                if (!hasBizum) updatedPM.push({ id: 'bizum', label: 'Bizum', enabled: true });
                if (!hasCard) updatedPM.push({ id: 'card', label: 'Tarjeta / TPV', enabled: true });
                if (!updatedPM.some(m => m.id === 'tarjeta_bizum')) updatedPM.push({ id: 'tarjeta_bizum', label: 'Tarjeta / Bizum', enabled: false });

                // Mapeo forzado de iconos para consistencia premium
                const pmConfig = {
                    'efectivo': { 
                        icon: '💶', 
                        label: 'EFECTIVO',
                        desc: 'Pago manual en mano. Al finalizar, se indicará al usuario que entregue el dinero en un sobre.'
                    },
                    'bizum': { 
                        icon: '📲', 
                        label: 'BIZUM',
                        desc: 'Pago mediante Bizum integrado en la pasarela de pagos Paycomet (Automático).'
                    },
                    'card': { 
                        icon: '💳', 
                        label: 'TARJETA',
                        desc: 'Pago con tarjeta de crédito/débito a través de la pasarela Paycomet (Automático).'
                    },
                    'tarjeta_bizum': { 
                        icon: '🛡️',
                        label: 'TARJETA/BIZUM',
                        desc: 'Opción combinada de pasarela (No recomendada si se activan por separado).'
                    }
                };

                updatedPM = updatedPM.map(m => ({
                    ...m,
                    icon: pmConfig[m.id]?.icon || '🛡️',
                    label: pmConfig[m.id]?.label || (m.label ? m.label.replace(/[💶📲💳]/g, '').trim() : m.id),
                    desc: pmConfig[m.id]?.desc || ''
                }));

                const finalData = {
                    ...firebaseData,
                    paymentMethods: updatedPM,
                    packs: ensureArray(firebaseData.packs, PACKS),
                    extras: ensureArray(firebaseData.extras, EXTRAS),
                    schools: ensureArray(firebaseData.schools, SCHOOLS),
                    dateExceptions: ensureArray(firebaseData.dateExceptions, []),
                };
                setSettings(prev => ({ ...prev, ...finalData }));
                localStorage.setItem(SETTINGS_KEY, JSON.stringify(finalData));
            } else if (isFirstLoad.current && !isDemo) {
                saveToFirebase(settings);
            }
            isFirstLoad.current = false;
        }, (error) => {
            console.error("Error en onSnapshot settings:", error);
        });

        return () => unsubscribe();
    }, [photographerId, SETTINGS_KEY]);

    const saveToFirebase = async (newSettings) => {
        if (isDemo) return;
        try {
            const docRef = doc(db, 'orlas2026_photographers', photographerId, 'config', 'main');
            await setDoc(docRef, newSettings);
        } catch (error) {
            console.error("Error guardando settings en Firebase:", error);
        }
    };

    const togglePaymentMethod = (id) => {
        let updatedPMs = settings.paymentMethods.map(m =>
            m.id === id ? { ...m, enabled: !m.enabled } : m
        );

        // Lógica de conmutación forzada entre TARJETA y TARJETA/BIZUM
        if (id === 'card') {
            const isNowEnabled = updatedPMs.find(m => m.id === 'card').enabled;
            updatedPMs = updatedPMs.map(m => m.id === 'tarjeta_bizum' ? { ...m, enabled: !isNowEnabled } : m);
        } else if (id === 'tarjeta_bizum') {
            const isNowEnabled = updatedPMs.find(m => m.id === 'tarjeta_bizum').enabled;
            updatedPMs = updatedPMs.map(m => m.id === 'card' ? { ...m, enabled: !isNowEnabled } : m);
            // Si activo Tarjeta/Bizum, el Bizum normal se desactiva
            if (isNowEnabled) {
                updatedPMs = updatedPMs.map(m => m.id === 'bizum' ? { ...m, enabled: false } : m);
            }
        } else if (id === 'bizum') {
            const isNowEnabled = updatedPMs.find(m => m.id === 'bizum').enabled;
            // Si activo Bizum normal, el Tarjeta/Bizum se desactiva y el Tarjeta normal se activa (por el espejo)
            if (isNowEnabled) {
                updatedPMs = updatedPMs.map(m => m.id === 'tarjeta_bizum' ? { ...m, enabled: false } : m);
                updatedPMs = updatedPMs.map(m => m.id === 'card' ? { ...m, enabled: true } : m);
            }
        }

        const updated = {
            ...settings,
            paymentMethods: updatedPMs,
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

    const addSchoolWithId = (id, name, code) => {
        const upperName = name.trim().toUpperCase();
        updateSettings(prev => {
            const currentSchools = prev.schools || SCHOOLS;
            if (currentSchools.some(s => s.id === id)) return prev;
            return {
                ...prev,
                schools: [...currentSchools, { id, name: upperName, code }]
            };
        });
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

    const [orphanSchools, setOrphanSchools] = useState([]);

    const detectOrphanSchools = async () => {
        if (!photographerId || isDemo) return;
        try {
            const ordersRef = collection(db, 'orlas2026_photographers', photographerId, 'orders');
            const snap = await getDocs(ordersRef);
            
            const existingIds = (settings.schools || []).map(s => s.id);
            const orphans = [];
            
            snap.forEach(docSnap => {
                const id = docSnap.id;
                if (!existingIds.includes(id)) {
                    // Buscar si existe en la lista maestra por defecto
                    const defaultSchool = SCHOOLS.find(s => s.id === id);
                    const data = docSnap.data().items || [];
                    
                    if (data.length > 0) {
                        orphans.push({
                            id,
                            count: data.length,
                            defaultName: defaultSchool?.name || 'CENTRO DESCONOCIDO',
                            suggestedName: data[0]?.schoolName || defaultSchool?.name || 'COLEGIO SIN NOMBRE',
                            code: defaultSchool?.code || id.substring(0, 3).toUpperCase()
                        });
                    }
                }
            });
            
            setOrphanSchools(orphans);
        } catch (error) {
            console.error("Error detectando huérfanos:", error);
        }
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

    const isDemo2026 = photographerId === 'demo2026';
    const displayPacksRaw = isDemo ? (isDemo2026 ? DEMO_2026_PACKS : DEMO_PACKS) : (settings.packs || PACKS);
    const displayExtrasRaw = isDemo ? (isDemo2026 ? DEMO_2026_EXTRAS : DEMO_EXTRAS) : (settings.extras || EXTRAS);
    
    // Aplicamos ensureArray también aquí por si acaso el estado interno o las constantes tienen un formato inesperado
    const displayPacks = ensureArray(displayPacksRaw, PACKS);
    const displayExtras = ensureArray(displayExtrasRaw, EXTRAS);

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
        addSchoolWithId,
        updateSchool,
        deleteSchool,
        updateAdminPin,
        updateSettings,
        orphanSchools,
        detectOrphanSchools
    };
}
