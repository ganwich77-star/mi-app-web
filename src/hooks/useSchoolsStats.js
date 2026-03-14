import { useState, useEffect } from 'react';
import { db } from '../firebase.js';
import { collection, onSnapshot } from 'firebase/firestore';

export function useSchoolsStats(photographerId) {
    const [stats, setStats] = useState({});

    useEffect(() => {
        if (!photographerId) return;

        // Escuchar todos los documentos de la colección 'orders' para este fotógrafo
        const ordersRef = collection(db, 'orlas2026_photographers', photographerId, 'orders');
        const unsubscribeOrders = onSnapshot(ordersRef, (snapshot) => {
            const ordersStats = {};
            snapshot.forEach(doc => {
                const data = doc.data();
                ordersStats[doc.id] = (data.items || []).length;
            });
            
            setStats(prev => {
                const newStats = { ...prev };
                // Limpiar o actualizar los centros existentes
                Object.keys(ordersStats).forEach(schoolId => {
                    if (!newStats[schoolId]) newStats[schoolId] = { students: 0, staff: 0 };
                    newStats[schoolId].students = ordersStats[schoolId];
                });
                return newStats;
            });
        }, (error) => {
            console.error("Error en useSchoolsStats (orders):", error);
        });

        // Escuchar todos los documentos de la colección 'staff' para este fotógrafo
        const staffRef = collection(db, 'orlas2026_photographers', photographerId, 'staff');
        const unsubscribeStaff = onSnapshot(staffRef, (snapshot) => {
            const staffStats = {};
            snapshot.forEach(doc => {
                const data = doc.data();
                staffStats[doc.id] = (data.items || []).length;
            });

            setStats(prev => {
                const newStats = { ...prev };
                Object.keys(staffStats).forEach(schoolId => {
                    if (!newStats[schoolId]) newStats[schoolId] = { students: 0, staff: 0 };
                    newStats[schoolId].staff = staffStats[schoolId];
                });
                return newStats;
            });
        }, (error) => {
            console.error("Error en useSchoolsStats (staff):", error);
        });

        return () => {
            unsubscribeOrders();
            unsubscribeStaff();
        };
    }, [photographerId]);

    return stats;
}
