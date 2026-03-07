import React from 'react';
import { STAFF_ROLES, COURSE_GROUPS } from '../../constants.js';
import { toTitleCase } from '../../utils/formatters.js';

const StaffEditModal = ({
    staffAssigning,
    setStaffAssigning,
    updateStaffMember,
    deleteStaff
}) => {
    if (!staffAssigning) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
            <div className="w-full max-w-sm bg-card rounded-3xl p-7 border border-primary/10 shadow-2xl animate-slide-up space-y-4">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-2xl border border-indigo-500/20">👤</div>
                    <div>
                        <p className="text-lg font-black text-primary leading-tight">Editar Ficha</p>
                        <p className="text-xs text-secondary uppercase tracking-widest font-bold">Personal Docente</p>
                    </div>
                </div>

                <div className="space-y-3">
                    <div>
                        <label className="text-[10px] font-black text-secondary uppercase tracking-widest mb-1.5 block">Nombre Completo</label>
                        <input type="text" value={staffAssigning.name}
                            onChange={e => setStaffAssigning(p => ({ ...p, name: e.target.value }))}
                            onBlur={e => setStaffAssigning(p => ({ ...p, name: toTitleCase(e.target.value) }))}
                            className="w-full bg-primary/5 border border-primary/10 text-primary text-sm rounded-xl px-4 py-3 outline-none focus:border-indigo-400/50" />
                    </div>

                    <div>
                        <label className="text-[10px] font-black text-secondary uppercase tracking-widest mb-1.5 block">Puestos / Cargos</label>
                        {staffAssigning.roles.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mb-2">
                                {staffAssigning.roles.map((r, i) => (
                                    <span key={i} className="text-[9px] bg-indigo-500/10 text-indigo-400 font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 border border-indigo-500/20">
                                        {r}
                                        <button onClick={() => setStaffAssigning(p => ({ ...p, roles: p.roles.filter((_, idx) => idx !== i) }))} className="hover:text-red-500 transition-colors">×</button>
                                    </span>
                                ))}
                            </div>
                        )}
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <input type="text" list="roles-list-edit" value={staffAssigning.tempRole}
                                    onChange={e => setStaffAssigning(p => ({ ...p, tempRole: e.target.value }))}
                                    onKeyDown={e => {
                                        if (e.key === 'Enter' && staffAssigning.tempRole.trim()) {
                                            e.preventDefault();
                                            if (!staffAssigning.roles.includes(staffAssigning.tempRole.trim())) {
                                                setStaffAssigning(p => ({ ...p, roles: [...p.roles, p.tempRole.trim()], tempRole: '' }));
                                            }
                                        }
                                    }}
                                    placeholder="Añadir cargo..." className="w-full bg-primary/5 border border-primary/10 text-primary text-[11px] font-bold rounded-xl px-4 py-2.5 outline-none focus:border-indigo-400/50" />
                                <datalist id="roles-list-edit">
                                    {STAFF_ROLES.flatMap(g => g.roles).map(r => <option key={r} value={r} />)}
                                </datalist>
                            </div>
                            <button
                                onClick={() => {
                                    if (staffAssigning.tempRole.trim() && !staffAssigning.roles.includes(staffAssigning.tempRole.trim())) {
                                        setStaffAssigning(p => ({ ...p, roles: [...p.roles, p.tempRole.trim()], tempRole: '' }));
                                    }
                                }}
                                className="bg-indigo-500/10 text-indigo-400 rounded-xl px-3 py-1 hover:bg-indigo-500 hover:text-white transition-all font-black text-lg">+</button>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black text-secondary uppercase tracking-widest mb-0.5 block">Clases Asignadas</label>
                        {staffAssigning.assignments.length > 0 && (
                            <div className="flex flex-wrap gap-2 p-2 bg-primary/2 rounded-xl border border-primary/5">
                                {staffAssigning.assignments.map((a, i) => (
                                    <span key={i} className="text-[10px] bg-indigo-500/10 text-indigo-400 font-bold px-2.5 py-1 rounded-lg flex items-center gap-1.5 border border-indigo-500/20">
                                        {a.course} {a.group}
                                        <button onClick={() => setStaffAssigning(p => ({ ...p, assignments: p.assignments.filter((_, idx) => idx !== i) }))} className="hover:text-red-500 transition-colors ml-1">x</button>
                                    </span>
                                ))}
                            </div>
                        )}
                        <div className="flex gap-2">
                            <select value={staffAssigning.tempCourse} onChange={e => setStaffAssigning(p => ({ ...p, tempCourse: e.target.value }))} className="flex-1 bg-primary/5 border border-primary/10 text-primary text-xs font-bold rounded-xl px-3 py-3 outline-none focus:border-indigo-400/50">
                                <option value="">CLASE</option>
                                {COURSE_GROUPS.flatMap(g => g.courses).map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                            </select>
                            <select value={staffAssigning.tempGroup} onChange={e => setStaffAssigning(p => ({ ...p, tempGroup: e.target.value }))} className="w-[85px] bg-primary/5 border border-primary/10 text-primary text-xs font-bold rounded-xl px-3 py-3 outline-none focus:border-indigo-400/50 uppercase">
                                <option value="">GRUPO</option>
                                <option value="A">A</option>
                                <option value="B">B</option>
                                <option value="C">C</option>
                                <option value="D">D</option>
                            </select>
                            <button
                                disabled={!staffAssigning.tempCourse}
                                onClick={() => setStaffAssigning(p => ({ ...p, assignments: [...p.assignments, { course: p.tempCourse, group: p.tempGroup }], tempCourse: '', tempGroup: '' }))}
                                className="bg-indigo-500/10 text-indigo-400 font-black text-xl rounded-xl px-4 py-2 hover:bg-indigo-500 hover:text-white transition-all active:scale-95 disabled:opacity-30">
                                +
                            </button>
                        </div>
                    </div>
                </div>

                <div>
                    <label className="text-[10px] font-black text-secondary uppercase tracking-widest mb-1.5 block">Nº Fichero de Cámara</label>
                    <input type="text" value={staffAssigning.tempFile} onChange={e => setStaffAssigning(p => ({ ...p, tempFile: e.target.value }))}
                        placeholder="DSC_0000" className="w-full bg-primary/5 border border-primary/10 text-primary font-mono text-base rounded-xl px-4 py-3 outline-none focus:border-indigo-400/50" />
                </div>

                <div className="flex gap-3 pt-4">
                    <button onClick={() => setStaffAssigning(null)} className="flex-1 py-3 text-xs font-bold text-secondary border border-primary/10 rounded-2xl hover:bg-primary/5 transition-all">Cancelar</button>
                    <button
                        disabled={!staffAssigning.name.trim() || staffAssigning.roles.length === 0 || staffAssigning.assignments.length === 0}
                        onClick={() => {
                            updateStaffMember(staffAssigning.member.id, {
                                name: staffAssigning.name,
                                role: staffAssigning.roles.join(' • '),
                                roles: staffAssigning.roles,
                                assignments: staffAssigning.assignments,
                                photoFile: staffAssigning.tempFile
                            });
                            setStaffAssigning(null);
                        }}
                        className="flex-[1.5] py-3 text-xs font-black bg-gradient-to-r from-indigo-500 to-indigo-400 text-white rounded-2xl active:scale-95 disabled:opacity-30 transition-all shadow-lg shadow-indigo-500/20"
                    >GUARDAR CAMBIOS</button>
                </div>
                <button
                    onClick={() => {
                        if (confirm('¿ELIMINAR ESTE DOCENTE?')) {
                            deleteStaff(staffAssigning.member.id);
                            setStaffAssigning(null);
                        }
                    }}
                    className="w-full py-2 text-[10px] font-black text-red-500/50 hover:text-red-500 uppercase tracking-widest mt-2 transition-colors"
                >
                    Eliminar Docente Permanentemente
                </button>
            </div>
        </div>
    );
};

export default StaffEditModal;
