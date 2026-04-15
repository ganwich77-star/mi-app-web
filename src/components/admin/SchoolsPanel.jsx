import React, { useState } from 'react';
import { GraduationCap, Plus, Edit, Trash2, ChevronDown, Search, School, RefreshCcw, LayoutGrid, List, Users, UserCheck } from 'lucide-react';
import { SCHOOLS } from '../../constants.js';

const SchoolsPanel = ({
    sortedSchools,
    adminSchool,
    setAdminSchool,
    schoolToEdit,
    setSchoolToEdit,
    newSchoolName,
    setNewSchoolName,
    addSchool,
    addSchoolWithId,
    updateSchool,
    deleteSchool,
    updateSettings,
    schoolsStats = {},
    orphanSchools = [],
    detectOrphanSchools,
    theme = 'dark'
}) => {
    const [isScanning, setIsScanning] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('grid');
    const isDark = theme === 'dark';

    const filteredSchools = sortedSchools.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className={`card overflow-hidden transition-all duration-500 ${isOpen ? 'ring-2 ring-orange-500/20 shadow-2xl shadow-orange-500/10' : 'hover:ring-1 hover:ring-orange-500/10 shadow-lg'}`}>
            {/* Header / Trigger */}
            <div
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center justify-between p-8 cursor-pointer transition-colors ${isOpen ? 'bg-orange-500/5' : 'hover:bg-primary/2'}`}
            >
                <div className="flex items-center gap-6">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-lg ${isOpen ? 'bg-orange-600 text-white' : 'bg-orange-500/10 text-orange-500'}`}>
                        <GraduationCap size={24} />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-primary tracking-tight">Gestión de Centros</h3>
                        <p className="text-[10px] font-bold text-secondary uppercase tracking-[0.2em] opacity-60">Configuración de colegios e institutos</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* Botón condicional: solo aparece si está abierto */}
                    <div className={`transition-all duration-500 ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none translate-x-4'}`}>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                // Focus al input de nuevo centro si ya está abierto
                                document.getElementById('new-school-input')?.focus();
                            }}
                            className="bg-orange-600 hover:bg-orange-500 text-white px-5 py-2.5 rounded-xl font-black flex items-center gap-2 transition-all shadow-lg shadow-orange-900/20 uppercase text-[10px] active:scale-95 shrink-0"
                        >
                            <Plus size={16} /> AÑADIR CENTRO
                        </button>
                    </div>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${isOpen ? 'bg-orange-500/20 text-orange-500 rotate-180' : 'bg-primary/5 text-secondary'}`}>
                        <ChevronDown size={24} />
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className={`transition-all duration-700 ease-in-out ${isOpen ? 'max-h-[3000px] opacity-100 p-8 pt-4' : 'max-h-0 opacity-0 pointer-events-none'}`}>
                {/* Search and Add Bar */}
                <div className="flex flex-col lg:flex-row gap-6 mb-10 items-center">
                    <div className="relative flex-1 group w-full">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-secondary/40 group-focus-within:text-orange-500 transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="BUSCAR CENTRO POR NOMBRE O CÓDIGO..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="input-dark w-full pl-14 py-4.5 text-[11px] font-black tracking-widest uppercase rounded-2xl"
                        />
                    </div>

                    <div className="flex gap-4 w-full lg:w-auto shrink-0">
                        {/* Toggle de vistas */}
                        <div className="flex p-1.5 bg-primary/5 rounded-2xl items-center">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`w-12 h-12 flex items-center justify-center rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white text-orange-500 shadow-md' : 'text-secondary/40 hover:text-secondary'}`}
                                title="Vista Cuadrícula"
                            >
                                <LayoutGrid size={20} />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`w-12 h-12 flex items-center justify-center rounded-xl transition-all ${viewMode === 'list' ? 'bg-white text-orange-500 shadow-md' : 'text-secondary/40 hover:text-secondary'}`}
                                title="Vista Lista"
                            >
                                <List size={20} />
                            </button>
                        </div>

                        <div className="relative flex-1 lg:w-80">
                            <input
                                id="new-school-input"
                                value={newSchoolName}
                                onChange={e => setNewSchoolName(e.target.value)}
                                list="predefined-schools-list"
                                className="input-dark w-full py-4.5 px-6 text-[11px] font-black tracking-widest uppercase rounded-2xl border-orange-500/20 focus:border-orange-500/50"
                                placeholder="NOMBRE DEL NUEVO CENTRO..."
                                onKeyDown={e => {
                                    if (e.key === 'Enter' && newSchoolName.trim()) {
                                        addSchool(newSchoolName.trim());
                                        setNewSchoolName('');
                                    }
                                }}
                            />
                            <datalist id="predefined-schools-list">
                                {sortedSchools.map(s => (
                                    <option key={s.id} value={s.name}>{s.code}</option>
                                ))}
                            </datalist>
                        </div>
                        <button
                            onClick={() => {
                                if (newSchoolName.trim()) {
                                    addSchool(newSchoolName.trim());
                                    setNewSchoolName('');
                                }
                            }}
                            className="w-16 h-16 bg-orange-600 hover:bg-orange-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-orange-600/20 active:scale-95 transition-all shrink-0 group"
                        >
                            <Plus size={28} className="group-hover:rotate-90 transition-transform duration-300" />
                        </button>
                    </div>
                </div>

                {/* Alerta de Rescate de Centros */}
                <div className="flex flex-col gap-4 mb-8">
                    {(SCHOOLS.some(s => !sortedSchools.some(exist => exist.id === s.id)) || orphanSchools.length > 0) && (
                        <div className="p-6 bg-orange-500/10 border border-orange-500/20 rounded-3xl animate-fade-in shadow-xl shadow-orange-900/5">
                            <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-orange-500/20 flex items-center justify-center text-orange-500 shadow-inner">
                                        <RefreshCcw size={24} className={isScanning ? 'animate-spin' : 'animate-spin-slow'} />
                                    </div>
                                    <div>
                                        <h4 className="text-[12px] font-black text-primary uppercase tracking-wider">Centro de Recuperación de Datos</h4>
                                        <p className="text-[10px] font-bold text-secondary uppercase opacity-60 tracking-widest mt-0.5">Se han detectado {orphanSchools.length || 'centros base'} que podrían contener alumnos</p>
                                    </div>
                                </div>
                                <button
                                    onClick={async () => {
                                        setIsScanning(true);
                                        await detectOrphanSchools();
                                        setIsScanning(false);
                                    }}
                                    disabled={isScanning}
                                    className="px-6 py-3 bg-white/5 border border-white/10 hover:bg-orange-500 hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-lg active:scale-95 disabled:opacity-50 flex items-center gap-3"
                                >
                                    {isScanning ? 'BUSCANDO...' : 'BUSCAR ALUMNOS PERDIDOS'}
                                </button>
                            </div>

                            {/* Lista de Centros Huérfanos encontrados */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                                {orphanSchools.map(s => (
                                    <div key={s.id} className="p-4 bg-black/20 rounded-2xl border border-white/5 flex items-center justify-between group hover:border-orange-500/30 transition-all">
                                        <div className="flex flex-col">
                                            <span className="text-[11px] font-black text-primary uppercase leading-tight">{s.suggestedName}</span>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Users size={12} className="text-orange-500" />
                                                <span className="text-[9px] font-black text-secondary tracking-widest uppercase">{s.count} ALUMNOS ENCONTRADOS</span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => addSchoolWithId(s.id, s.suggestedName, s.code)}
                                            className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 flex items-center gap-2"
                                        >
                                            <RefreshCcw size={12} /> RECUPERAR
                                        </button>
                                    </div>
                                ))}

                                {/* Centros base normales si no han sido detectados como huérfanos con datos aún */}
                                {orphanSchools.length === 0 && SCHOOLS.filter(s => !sortedSchools.some(exist => exist.id === s.id)).slice(0, 3).map(s => (
                                    <div key={s.id} className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between opacity-60 hover:opacity-100 transition-all">
                                        <span className="text-[10px] font-black text-primary uppercase tracking-wider">{s.name}</span>
                                        <button
                                            onClick={() => addSchoolWithId(s.id, s.name, s.code)}
                                            className="px-4 py-2 bg-white/10 text-primary hover:bg-orange-600 hover:text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95"
                                        >
                                            RESTAURAR
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Grid/List of Schools */}
                <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" : "flex flex-col gap-4"}>
                    {filteredSchools.map(s => {
                        const isSelected = adminSchool === s.id;
                        const isEditing = schoolToEdit === s.id;
                        const stats = schoolsStats[s.id] || { students: 0, staff: 0 };

                        return (
                            <div
                                key={s.id}
                                className={`group relative border transition-all duration-500 
                                    ${viewMode === 'list' ? 'p-3 px-5 rounded-2xl bg-primary/2' : 'p-6 rounded-[2rem] bg-primary/2'}
                                    ${isSelected
                                        ? 'border-orange-500/40 shadow-xl shadow-orange-500/5 !bg-orange-500/10'
                                        : 'border-primary/5 hover:border-orange-500/30 hover:bg-orange-500/5 hover:-translate-y-1'}`}
                            >
                                {isSelected && (
                                    <div className="absolute -top-3 -right-3 bg-orange-600 text-white text-[9px] font-black px-4 py-1.5 rounded-full shadow-lg shadow-orange-600/30 uppercase tracking-widest z-10 border-2 border-slate-900 group-hover:animate-pulse">
                                        ACTUAL
                                    </div>
                                )}

                                {isEditing ? (
                                    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-orange-500 uppercase tracking-widest ml-1">Nombre del Centro</label>
                                            <input
                                                type="text"
                                                defaultValue={s.name}
                                                className="input-dark w-full py-3.5 px-5 text-[11px] font-black uppercase rounded-xl border-orange-500/30"
                                                onBlur={(e) => updateSchool(s.id, { name: e.target.value })}
                                                autoFocus
                                            />
                                        </div>
                                        <div className="flex gap-4 items-end">
                                            <div className="flex-1 space-y-2">
                                                <label className="text-[9px] font-black text-orange-500 uppercase tracking-widest ml-1">ID / Código</label>
                                                <input
                                                    type="text"
                                                    defaultValue={s.code}
                                                    className="input-dark w-full py-3.5 px-5 text-[11px] font-black uppercase rounded-xl border-orange-500/30"
                                                    onBlur={(e) => updateSchool(s.id, { code: e.target.value.toUpperCase() })}
                                                    placeholder="CÓDIGO"
                                                />
                                            </div>
                                            <button
                                                onClick={() => setSchoolToEdit(null)}
                                                className="h-[52px] px-6 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95"
                                            >
                                                LISTO
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); deleteSchool(s.id); setSchoolToEdit(null); }}
                                                className="h-[52px] w-[52px] flex items-center justify-center rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500/20 transition-all shadow-lg active:scale-95 shrink-0"
                                                title="Eliminar Centro"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col h-full justify-center">
                                        <div onClick={() => setAdminSchool(s.id)} className="cursor-pointer flex-1 group">
                                            <div className="flex items-center gap-4">
                                                <div className={`${viewMode === 'list' ? 'p-2' : 'p-3'} rounded-xl transition-all duration-500 shrink-0 ${isSelected ? 'bg-orange-600 text-white rotate-6' : 'bg-primary/5 text-secondary group-hover:bg-orange-500/20 group-hover:text-orange-500 group-hover:rotate-12'}`}>
                                                    <School size={viewMode === 'list' ? 16 : 20} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className={`${viewMode === 'list' ? 'text-[11px]' : 'text-[13px] sm:text-sm'} font-black uppercase tracking-tight truncate transition-colors ${isSelected ? 'text-orange-500' : 'text-primary'}`}>
                                                        {s.name}
                                                    </h4>
                                                    
                                                    {/* Estadísticas de Alumnos y Docentes */}
                                                    <div className={`flex items-center gap-4 ${viewMode === 'list' ? 'mt-1 mb-1' : 'mt-2 mb-2'}`}>
                                                        <div className="flex items-center gap-1.5" title="Total Alumnos">
                                                            <Users size={viewMode === 'list' ? 12 : 14} className={isSelected ? 'text-orange-400' : 'text-secondary/40'} />
                                                            <span className={`${viewMode === 'list' ? 'text-[9px]' : 'text-[10px]'} font-black ${isSelected ? 'text-orange-300' : 'text-secondary/60'}`}>
                                                                {stats.students} <span className="opacity-40 font-bold ml-0.5">ALUMNOS</span>
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5" title="Total Docentes">
                                                            <UserCheck size={viewMode === 'list' ? 12 : 14} className={isSelected ? 'text-orange-400' : 'text-secondary/40'} />
                                                            <span className={`${viewMode === 'list' ? 'text-[9px]' : 'text-[10px]'} font-black ${isSelected ? 'text-orange-300' : 'text-secondary/60'}`}>
                                                                {stats.staff} <span className="opacity-40 font-bold ml-0.5">DOCENTES</span>
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className={`flex items-center justify-between ${viewMode === 'list' ? 'mt-0.5' : 'mt-1 h-8'}`}>
                                                        <div className="flex items-center gap-2">
                                                            <span className={`${viewMode === 'list' ? 'text-[9px]' : 'text-[10px] sm:text-[11px]'} font-bold text-secondary opacity-40 uppercase tracking-widest shrink-0`}>CÓDIGO:</span>
                                                            <span className={`${viewMode === 'list' ? 'text-[9px]' : 'text-[10px] sm:text-[11px]'} font-black uppercase tracking-widest truncate ${isSelected ? 'text-orange-400' : 'text-secondary/60'}`}>
                                                                {s.code || 'S/C'}
                                                            </span>
                                                        </div>
                                                        {/* Acciones compactas */}
                                                        <div className={`flex gap-1 transition-all duration-300 overflow-hidden items-center ${isSelected ? 'opacity-100 translate-x-0 w-auto' : 'opacity-0 translate-x-4 w-0'}`}>
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); setSchoolToEdit(s.id); }}
                                                                className="w-8 h-8 flex items-center justify-center text-secondary hover:text-orange-500 hover:bg-orange-500/10 rounded-lg transition-all hover:scale-110 shrink-0"
                                                                title="Editar"
                                                            >
                                                                <Edit size={14} />
                                                            </button>
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); deleteSchool(s.id); }}
                                                                className="w-8 h-8 flex items-center justify-center text-secondary/30 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all hover:scale-110 shrink-0"
                                                                title="Eliminar"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {filteredSchools.length === 0 && (
                    <div className="py-20 border-2 border-dashed border-primary/10 rounded-[3rem] bg-primary/2 flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center text-secondary/20 mb-6">
                            <School size={32} />
                        </div>
                        <span className="text-[12px] font-black uppercase tracking-[0.2em] text-secondary/30">
                            {searchTerm ? `No hay resultados para "${searchTerm}"` : "No hay centros configurados"}
                        </span>

                        {!searchTerm && (
                            <button
                                onClick={() => {
                                    if (confirm('¿Recuperar los centros por defecto? Todos los alumnos y configuraciones asociadas a los de ahora NO se perderán. ¿Proceder?')) {
                                        // Excluimos Calatrava específicamente por precaución
                                        updateSettings({ schools: SCHOOLS.filter(s => !s.name.toLowerCase().includes('calatrava') && s.id !== 'calatraba') });
                                    }
                                }}
                                className="mt-8 px-8 py-4 bg-orange-600 hover:bg-orange-500 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] transition-all shadow-xl shadow-orange-600/20 active:scale-95 flex items-center gap-3"
                            >
                                <RefreshCcw size={16} /> Restaurar Centros Base
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SchoolsPanel;
