import React from 'react';
import { GraduationCap, Plus, Edit, Trash2 } from 'lucide-react';

const SchoolsPanel = ({
    sortedSchools,
    adminSchool,
    setAdminSchool,
    schoolToEdit,
    setSchoolToEdit,
    newSchoolName,
    setNewSchoolName,
    addSchool,
    updateSchool,
    deleteSchool
}) => {
    return (
        <div className="space-y-6">
            <div className="card p-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8">
                    <h3 className="text-2xl font-black text-primary flex items-center gap-3 tracking-tight">
                        <GraduationCap size={28} className="text-orange-500" /> Gestión de Centros
                    </h3>
                    <div className="flex gap-3 w-full sm:w-96 relative group">
                        <input
                            value={newSchoolName}
                            onChange={e => setNewSchoolName(e.target.value)}
                            list="predefined-schools-list"
                            className="input-dark flex-1 py-4 text-sm px-6 hover:border-orange-500/30 transition-all"
                            placeholder="Escribe o elige un centro..."
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
                        <button
                            onClick={() => {
                                if (newSchoolName.trim()) {
                                    addSchool(newSchoolName.trim());
                                    setNewSchoolName('');
                                }
                            }}
                            className="w-14 h-14 bg-orange-600 hover:bg-orange-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-orange-600/20 active:scale-95 transition-all shrink-0"
                        >
                            <Plus size={24} />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {sortedSchools.map(s => (
                        <div key={s.id} className={`flex flex-col p-5 rounded-[24px] border transition-all ${adminSchool === s.id ? 'bg-orange-500/5 border-orange-500/30 ring-1 ring-orange-500/20' : 'bg-primary/5 border-primary/5 hover:border-primary/20'}`}>
                            {schoolToEdit === s.id ? (
                                <div className="space-y-3 animate-fade-in shadow-inner p-1">
                                    <div>
                                        <label className="text-[8px] font-black text-orange-500 uppercase tracking-widest ml-1 mb-1 block">Nombre del Centro</label>
                                        <input
                                            type="text"
                                            defaultValue={s.name}
                                            className="w-full bg-white/10 border border-primary/20 rounded-xl px-4 py-2.5 text-xs font-black uppercase outline-none focus:border-orange-500 text-primary"
                                            onBlur={(e) => updateSchool(s.id, { name: e.target.value })}
                                            autoFocus
                                        />
                                    </div>
                                    <div className="flex gap-2 items-end">
                                        <div className="flex-1">
                                            <label className="text-[8px] font-black text-orange-500 uppercase tracking-widest ml-1 mb-1 block">Código</label>
                                            <input
                                                type="text"
                                                defaultValue={s.code}
                                                className="w-full bg-white/10 border border-primary/20 rounded-xl px-4 py-2.5 text-[10px] font-black uppercase outline-none focus:border-orange-500 text-primary"
                                                onBlur={(e) => updateSchool(s.id, { code: e.target.value.toUpperCase() })}
                                                placeholder="CÓDIGO"
                                            />
                                        </div>
                                        <button
                                            onClick={() => setSchoolToEdit(null)}
                                            className="h-[42px] px-6 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-orange-600/20 active:scale-95"
                                        >LISTO</button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex justify-between items-center w-full">
                                    <button onClick={() => setAdminSchool(s.id)} className="flex-1 text-left group">
                                        <span className={`text-sm font-black uppercase tracking-wider block transition-colors ${adminSchool === s.id ? 'text-orange-400' : 'text-primary group-hover:text-orange-500'}`}>{s.name}</span>
                                        <div className="flex items-center gap-2 mt-1">
                                            <p className="text-[10px] font-black opacity-40 uppercase tracking-widest">Código: {s.code}</p>
                                            {adminSchool === s.id && <span className="text-[8px] font-black bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-md">ACTUAL</span>}
                                        </div>
                                    </button>
                                    <div className="flex gap-1">
                                        <button onClick={() => setSchoolToEdit(s.id)} className="w-9 h-9 flex items-center justify-center text-secondary hover:text-indigo-500 hover:bg-indigo-500/10 rounded-xl transition-all" title="Editar">
                                            <Edit size={14} />
                                        </button>
                                        <button onClick={() => deleteSchool(s.id)} className="w-9 h-9 flex items-center justify-center text-secondary hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all" title="Eliminar">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SchoolsPanel;
