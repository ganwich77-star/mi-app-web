import React, { useState } from 'react';
import { Search, CheckCircle, Trash2, CheckSquare, Square, Users, GraduationCap, Settings, Crown, ArrowRight, Database, ChevronDown, ChevronRight, User, Shield, Camera, Check, Palette, Euro, Palette as PaletteIcon } from 'lucide-react';

export default function App() {
    const [view, setView] = useState('admin');
    const [adminTab, setAdminTab] = useState('shooting');
    const [shootMode, setShootMode] = useState('students');
    const [theme, setTheme] = useState('dark');
    const [orders, setOrders] = useState([]);
    const [staff, setStaff] = useState([]);
    const [newStudentForm, setNewStudentForm] = useState({ name: '', course: '', group: '', photoFile: '', status: 'Pendiente', paymentMethod: '' });
    const [newStaffForm, setNewStaffForm] = useState({ name: '', roles: [], assignments: [], tempRole: '', tempCourse: '', tempGroup: '', photoFile: '' });
    const [shootFilters, setShootFilters] = useState({ course: '', group: '', status: '' });
    const [shootSearch, setShootSearch] = useState('');
    const [selectedOrderIds, setSelectedOrderIds] = useState([]);
    const [selectedStaffIds, setSelectedStaffIds] = useState([]);
    const [adminSchool, setAdminSchool] = useState('');
    const [settings, setSettings] = useState({ plan: 'pro', isPaid: true });
    const [mobileAdminMenuOpen, setMobileAdminMenuOpen] = useState(false);

    const availCourses = [{ name: '1º Primaria' }, { name: '2º Primaria' }];
    const schools = [{ id: '1', name: 'Centro Test' }];

    const toTitleCase = (str) => str;
    const addStaff = () => { };
    const getStaffAssignments = () => [];

    return (
        <div className="p-8 bg-slate-900 min-h-screen text-white font-sans" data-theme={theme}>
            <div className="card p-6 bg-slate-800 rounded-3xl border border-white/10 space-y-6">

                {/* CABECERA SECCIÓN ALUMNOS */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-3 bg-red-600 rounded-full"></div>
                        <p className="text-[10px] font-black text-red-600 uppercase tracking-widest leading-none">Alta rápida (Sin pedido previo)</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 bg-red-600/5 p-4 rounded-2xl border border-red-600/10">
                        <div className="flex-1 min-w-[200px]">
                            <input type="text" value={newStudentForm.name}
                                onChange={e => setNewStudentForm(p => ({ ...p, name: e.target.value }))}
                                placeholder="Nombre completo del alumno"
                                className="w-full bg-white/5 border border-white/10 text-xs rounded-xl px-4 py-3 outline-none focus:border-red-600 transition-all font-medium text-white placeholder-white/20" />
                        </div>
                        <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl px-2 py-1.5">
                            <select className="bg-transparent border-none text-[10px] font-black uppercase tracking-wider outline-none text-white cursor-pointer pr-1">
                                <option value="">— CURSO —</option>
                            </select>
                            <div className="w-px h-3 bg-white/10 mx-1"></div>
                            <select className="bg-transparent border-none text-[10px] font-black uppercase tracking-wider outline-none text-white cursor-pointer">
                                <option value="">G</option>
                            </select>
                        </div>
                        <div className="w-[120px]">
                            <input type="text" placeholder="Nº FOTO (EJ: 001)" className="w-full bg-white/5 border border-white/10 text-[10px] font-black uppercase text-center rounded-xl px-3 py-3 outline-none focus:border-red-600 transition-all font-mono text-white placeholder-white/20" />
                        </div>
                        <div className="w-[110px]">
                            <select className="w-full bg-orange-500 text-white border-none text-[10px] font-black uppercase rounded-xl px-3 py-3 outline-none cursor-pointer pr-8 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%20stroke%3D%22white%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M19%209l-7%207-7-7%22%20%2F%3E%3C%2Fsvg%3E')] bg-[length:12px] bg-[right_0.75rem_center] bg-no-repeat">
                                <option>PENDIENTE</option>
                            </select>
                        </div>
                        <div className="w-[140px]">
                            <select className="w-full bg-white/5 border border-white/10 text-[10px] font-black uppercase rounded-xl px-3 py-3 outline-none cursor-pointer pr-8 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%20stroke%3D%22rgba(255,255,255,0.2)%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M19%209l-7%207-7-7%22%20%2F%3E%3C%2Fsvg%3E')] bg-[length:12px] bg-[right_0.75rem_center] bg-no-repeat">
                                <option>FORMA DE PAGO</option>
                            </select>
                        </div>
                        <button className="bg-red-900/40 border border-red-700/30 text-red-500 font-black text-[10px] rounded-xl px-6 py-3 hover:bg-red-800 hover:text-white transition-all active:scale-95 uppercase tracking-widest">
                            GUARDAR ALUMNO
                        </button>
                    </div>
                </div>

                <div className="h-px bg-white/5"></div>

                {/* CABECERA SECCIÓN PERSONAL */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-3 bg-indigo-500 rounded-full"></div>
                        <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest leading-none">Alta rápida de personal</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 bg-indigo-500/5 p-4 rounded-2xl border border-indigo-500/10">
                        <div className="flex-1 min-w-[200px]">
                            <input type="text" value={newStaffForm.name}
                                onChange={e => setNewStaffForm(p => ({ ...p, name: e.target.value }))}
                                placeholder="Nombre completo del docente"
                                className="w-full bg-white/5 border border-white/10 text-xs rounded-xl px-4 py-3 outline-none focus:border-indigo-500 transition-all font-medium text-white placeholder-white/20" />
                        </div>
                        <div className="w-[120px]">
                            <input type="text" placeholder="FOTO (OPC.)" className="w-full bg-white/5 border border-white/10 text-[10px] font-black uppercase text-center rounded-xl px-3 py-3 outline-none focus:border-indigo-500 transition-all font-mono text-white placeholder-white/20" />
                        </div>
                        <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl px-2 py-1.5 min-w-[140px]">
                            <select className="bg-transparent border-none text-[10px] font-black uppercase tracking-wider outline-none text-white cursor-pointer pr-1">
                                <option value="">— CURSO —</option>
                            </select>
                            <div className="w-px h-3 bg-white/10 mx-1"></div>
                            <select className="bg-transparent border-none text-[10px] font-black uppercase tracking-wider outline-none text-white cursor-pointer">
                                <option value="">G</option>
                            </select>
                            <button className="bg-indigo-500 text-white w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black ml-1">+</button>
                        </div>
                        <div className="flex-1 flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl px-2 py-1.5 min-w-[140px]">
                            <input type="text" placeholder="PUESTO / CARGO" className="flex-1 bg-transparent border-none text-[10px] font-black uppercase tracking-wider outline-none text-white placeholder-white/20" />
                            <button className="bg-violet-500 text-white w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black">+</button>
                        </div>
                        <button className="bg-indigo-900/40 border border-indigo-700/30 text-indigo-400 font-black text-[10px] rounded-xl px-6 py-3 hover:bg-indigo-800 hover:text-white transition-all active:scale-95 uppercase tracking-widest">
                            GUARDAR FICHA
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
