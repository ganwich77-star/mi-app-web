import { useState, useEffect, useRef } from 'react';
import { db } from '../firebase.js';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';

export function useOrders(photographerId, schoolId) {
    const key = `orlas2026_orders_${photographerId}_${schoolId}`;

    // Estado inicial desde LocalStorage para velocidad
    const [orders, setOrders] = useState(() => {
        try {
            const stored = localStorage.getItem(key);
            return stored ? JSON.parse(stored) : [];
        } catch { return []; }
    });

    const isFirstLoad = useRef(true);

    // ESCUCHAR CAMBIOS EN FIREBASE (Sincronización en tiempo real)
    useEffect(() => {
        if (!schoolId) {
            setOrders([]);
            return;
        }

        // Cargar desde el caché local inmediatamente para evitar ver datos del centro previo
        try {
            const stored = localStorage.getItem(key);
            if (stored) {
                setOrders(JSON.parse(stored));
            } else {
                setOrders([]);
            }
        } catch (e) {
            setOrders([]);
        }

        const docRef = doc(db, 'orlas2026_photographers', photographerId, 'orders', schoolId);

        const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                const firebaseData = docSnap.data().items || [];
                setOrders(firebaseData);
                // Actualizar LocalStorage como caché
                localStorage.setItem(key, JSON.stringify(firebaseData));
            } else if (isFirstLoad.current && orders.length > 0) {
                // Si el documento no existe en Firebase pero tenemos datos locales (migración inicial)
                saveToFirebase(orders);
            }
            isFirstLoad.current = false;
        }, (error) => {
            console.error("Error en onSnapshot orders:", error);
        });

        return () => unsubscribe();
    }, [schoolId, photographerId]); // Añadido photographerId como dependencia por seguridad

    // Función para guardar en Firebase
    const saveToFirebase = async (newOrders) => {
        if (!schoolId) return;
        try {
            const docRef = doc(db, 'orlas2026_photographers', photographerId, 'orders', schoolId);
            await setDoc(docRef, { items: newOrders }, { merge: true });
        } catch (error) {
            console.error("Error guardando en Firebase:", error);
        }
    };

    const addOrder = (order) => {
        const newOrder = {
            status: 'Pendiente',
            ...order,
            id: order.id || `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: order.timestamp || new Date().toISOString(),
        };
        const updated = [newOrder, ...orders];
        setOrders(updated);
        saveToFirebase(updated);
        return newOrder;
    };

    const updateStatus = (id, status, photoFile = null) => {
        const updated = orders.map(o => o.id === id ? {
            ...o,
            status,
            ...(photoFile ? { photoFile } : {})
        } : o);
        setOrders(updated);
        saveToFirebase(updated);
    };

    const deleteOrder = (ids) => {
        const idsToDelete = Array.isArray(ids) ? ids : [ids];
        const updated = orders.filter(o => !idsToDelete.includes(o.id));
        setOrders(updated);
        saveToFirebase(updated);
    };

    const updatePhotoFile = (id, photoFile) => {
        const updated = orders.map(o => o.id === id ? { ...o, photoFile } : o);
        setOrders(updated);
        saveToFirebase(updated);
    };

    const updateOrder = (id, changes) => {
        setOrders(prev => {
            const updated = prev.map(o => o.id === id ? { ...o, ...changes } : o);
            saveToFirebase(updated);
            return updated;
        });
    };

    // Actualización en lote — un solo setOrders+saveToFirebase para evitar race conditions
    const bulkUpdateOrders = (ids, changes) => {
        setOrders(prev => {
            const idSet = new Set(ids);
            const updated = prev.map(o => idSet.has(o.id) ? { ...o, ...changes } : o);
            saveToFirebase(updated);
            return updated;
        });
    };

    const resetOrders = (ids) => {
        const idSet = new Set(ids);
        const updated = orders.map(o => idSet.has(o.id) ? {
            ...o,
            status: 'Pendiente',
            photoFile: null
        } : o);
        setOrders(updated);
        saveToFirebase(updated);
    };

    const bulkAddOrders = async (newOrders) => {
        if (!newOrders || newOrders.length === 0) return;
        
        const preparedOrders = newOrders.map(order => ({
            status: 'Pendiente',
            ...order,
            id: order.id || `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: order.timestamp || new Date().toISOString(),
        }));
        
        const updated = [...preparedOrders, ...orders];
        setOrders(updated);
        await saveToFirebase(updated);
        return preparedOrders;
    };

    const updateAllOrders = async (newOrders) => {
        setOrders(newOrders);
        await saveToFirebase(newOrders);
    };

    return { orders, addOrder, updateStatus, deleteOrder, updatePhotoFile, updateOrder, bulkUpdateOrders, resetOrders, bulkAddOrders, updateAllOrders };
}
