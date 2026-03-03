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

    const updateStatus = (id, status) => {
        const updated = orders.map(o => o.id === id ? { ...o, status } : o);
        setOrders(updated);
        saveToFirebase(updated);
    };

    const deleteOrder = (id) => {
        const updated = orders.filter(o => o.id !== id);
        setOrders(updated);
        saveToFirebase(updated);
    };

    const updatePhotoFile = (id, photoFile) => {
        const updated = orders.map(o => o.id === id ? { ...o, photoFile } : o);
        setOrders(updated);
        saveToFirebase(updated);
    };

    const updateOrder = (id, changes) => {
        const updated = orders.map(o => o.id === id ? { ...o, ...changes } : o);
        setOrders(updated);
        saveToFirebase(updated);
    };

    // Actualización en lote — un solo setOrders+saveToFirebase para evitar race conditions
    const bulkUpdateStatus = (ids, changes) => {
        const idSet = new Set(ids);
        const updated = orders.map(o => idSet.has(o.id) ? { ...o, ...changes } : o);
        setOrders(updated);
        saveToFirebase(updated);
    };

    return { orders, addOrder, updateStatus, deleteOrder, updatePhotoFile, updateOrder, bulkUpdateStatus };
}
