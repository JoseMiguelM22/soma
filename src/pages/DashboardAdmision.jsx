import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { 
  Users, Calendar, LogOut, Menu, Sun, Moon, 
  X, PanelLeft, Activity, Clock, ChevronDown, FileText, UserPlus, Save, Search
} from 'lucide-react';

export default function DashboardAdmision() {
  const navigate = useNavigate();
  
  // ================= ESTADOS DE UI =================
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const [openPacienteMenu, setOpenPacienteMenu] = useState(false);
  const [openMedicoMenu, setOpenMedicoMenu] = useState(false);
  
  const [searchPaciente, setSearchPaciente] = useState('');
  const [searchMedico, setSearchMedico] = useState('');
  
  const [showRegistroModal, setShowRegistroModal] = useState(false);
  const [guardandoPaciente, setGuardandoPaciente] = useState(false);
  const [nuevoPaciente, setNuevoPaciente] = useState({
    nombres: '', apellidos: '', cedula: '', telefono: '', fecha_nacimiento: '', sexo: ''
  });

  // ================= ESTADOS DE DATOS =================
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  
  const [pacientesEnEspera, setPacientesEnEspera] = useState(0);
  const [listaPacientes, setListaPacientes] = useState([]);
  const [listaMedicos, setListaMedicos] = useState([]);

  // ================= LA ÚNICA FUENTE DE VERDAD =================
  // Todo se guarda directamente aquí. Nada de variables dobles.
  const [triajeData, setTriajeData] = useState({
    id_paciente: '',
    id_medico: '',
    motivo: '', 
    ta: '', 
    fc: '', 
    peso: '', 
    talla: '', 
    sintomasRapidos: [] 
  });

  const listaSintomasIVSS = [
    { id: '1', label: 'Fiebre' },
    { id: '2', label: 'Pérdida de peso' },
    { id: '3', label: 'Erupciones (Piel)' },
    { id: '4', label: 'Mareos / Síncope' },
    { id: '5', label: 'Cansancio Ocular' },
    { id: '6', label: 'Dolor general' },
  ];

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  const fetchData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return navigate('/login');

    const { data: dbUser } = await supabase.from('usuarios').select('*').eq('id_auth', session.user.id).single();
    if (dbUser?.rol === 'especialista') {
      navigate('/dashboard');
      return;
    }
    setUserData(dbUser);

    const hoy = new Date().toISOString().split('T')[0];
    const { count } = await supabase
      .from('consultas')
      .select('*', { count: 'exact', head: true })
      .eq('estado', 'En Espera')
      .gte('created_at', `${hoy}T00:00:00.000Z`);
    setPacientesEnEspera(count || 0);

    const { data: pacientesBD } = await supabase.from('pacientes').select('*').order('nombres', { ascending: true });
    if (pacientesBD) setListaPacientes(pacientesBD);

    const { data: todosLosUsuarios } = await supabase.from('usuarios').select('*');
    if (todosLosUsuarios) {
      const soloMedicos = todosLosUsuarios.filter(user => 
        user.rol === 'especialista' || 
        (user.especialidad && user.especialidad !== 'Admisión / Triaje')
      );
      setListaMedicos(soloMedicos.filter(m => m.id_auth !== session.user.id));
    }

    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const getInitials = () => {
    if (!userData) return "AD";
    return `${userData.nombres?.charAt(0)}${userData.apellidos?.charAt(0)}`.toUpperCase();
  };

  const handleInputChange = (e) => {
    setTriajeData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleNuevoPacienteChange = (e) => {
    setNuevoPaciente({ ...nuevoPaciente, [e.target.name]: e.target.value });
  };

  const handleCheckboxChange = (label) => {
    setTriajeData(prev => {
      const currentSintomas = [...prev.sintomasRapidos];
      if (currentSintomas.includes(label)) {
        return { ...prev, sintomasRapidos: currentSintomas.filter(s => s !== label) };
      } else {
        return { ...prev, sintomasRapidos: [...currentSintomas, label] };
      }
    });
  };

  const handleRegistrarPaciente = async (e) => {
    e.preventDefault();
    setGuardandoPaciente(true);

    const pacienteData = { ...nuevoPaciente };
    if (!pacienteData.fecha_nacimiento) pacienteData.fecha_nacimiento = null;

    try {
      const { data, error } = await supabase
        .from('pacientes')
        .insert([pacienteData])
        .select()
        .single();

      if (error) throw error;

      alert('¡Paciente registrado exitosamente!');
      
      // Actualizamos la lista y SELECCIONAMOS automáticamente
      setListaPacientes(prev => [...prev, data].sort((a, b) => a.nombres.localeCompare(b.nombres)));
      setTriajeData(prev => ({ ...prev, id_paciente: data.id }));
      
      setNuevoPaciente({ nombres: '', apellidos: '', cedula: '', telefono: '', fecha_nacimiento: '', sexo: '' });
      setShowRegistroModal(false);

    } catch (error) {
      alert("Error al registrar paciente: " + error.message);
    } finally {
      setGuardandoPaciente(false);
    }
  };

  const handleGuardarTriaje = async (e) => {
    e.preventDefault();
    if (!triajeData.id_paciente || !triajeData.id_medico) {
      alert("Por favor selecciona un paciente y un médico en la cabecera de la historia clínica.");
      return;
    }

    setGuardando(true);

    try {
      const sintomasList = triajeData.sintomasRapidos.length > 0 ? `Síntomas marcados: ${triajeData.sintomasRapidos.join(', ')}.` : '';
      const signosFormateados = `TA: ${triajeData.ta || 'N/A'} | FC: ${triajeData.fc || 'N/A'} | Peso: ${triajeData.peso || 'N/A'}kg | Talla: ${triajeData.talla || 'N/A'}m. ${sintomasList}`;

      const { error } = await supabase.from('consultas').insert([{
        id_paciente: triajeData.id_paciente,
        id_medico: triajeData.id_medico,
        estado: 'En Espera',
        motivo: triajeData.motivo, 
        signos_vitales: signosFormateados,
        fecha_consulta: new Date().toISOString(),
      }]);

      if (error) throw error;

      alert('¡Paciente enviado a la Sala de Espera del Especialista con éxito!');
      
      setTriajeData({ id_paciente: '', id_medico: '', motivo: '', ta: '', fc: '', peso: '', talla: '', sintomasRapidos: [] });
      fetchData(); 
      
    } catch (error) {
      alert("Error al guardar triaje: " + error.message);
    } finally {
      setGuardando(false);
    }
  };

  // Buscamos los datos completos para pintarlos en la hoja
  const pacienteSeleccionado = listaPacientes.find(p => String(p.id) === String(triajeData.id_paciente));
  const medicoSeleccionado = listaMedicos.find(m => String(m.id_auth || m.id) === String(triajeData.id_medico));

  // Filtros
  const pacientesFiltrados = listaPacientes.filter(p => 
    (p.nombres + ' ' + p.apellidos + ' ' + p.cedula).toLowerCase().includes(searchPaciente.toLowerCase())
  );
  const medicosFiltrados = listaMedicos.filter(m => 
    (m.nombres + ' ' + m.apellidos + ' ' + (m.especialidad || '')).toLowerCase().includes(searchMedico.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0B0D12]">
        <div className="w-16 h-16 border-4 border-cyan-100 dark:border-slate-800 border-t-cyan-500 rounded-full animate-spin mb-4"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-slate-100 dark:bg-[#0B0D12] text-slate-800 dark:text-slate-200 font-sans overflow-hidden transition-colors duration-300 antialiased">
      
      {/* ========================================================================= */}
      {/* MODAL DE REGISTRO RÁPIDO DE PACIENTE */}
      {/* ========================================================================= */}
      {showRegistroModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
          <div className="w-full max-w-xl bg-white dark:bg-[#16161a] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
            
            <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-white/5">
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <UserPlus className="text-[#2563eb]" size={24} /> Registrar Nuevo Paciente
                </h3>
                <p className="text-sm text-slate-500 mt-1">Crea la ficha para enviarlo a consulta.</p>
              </div>
              <button onClick={() => setShowRegistroModal(false)} className="p-2 text-slate-400 hover:text-rose-500 bg-slate-100 dark:bg-white/5 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[70vh] custom-scrollbar-gruesa">
              <form id="formNuevoPaciente" onSubmit={handleRegistrarPaciente} className="space-y-4">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-widest">Nombres</label>
                    <input type="text" name="nombres" required value={nuevoPaciente.nombres} onChange={handleNuevoPacienteChange} className="w-full py-3 px-4 rounded-xl bg-slate-50 dark:bg-[#0B0D12] text-sm font-semibold text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb] outline-none transition-all" placeholder="Ej. Juan Carlos" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-widest">Apellidos</label>
                    <input type="text" name="apellidos" required value={nuevoPaciente.apellidos} onChange={handleNuevoPacienteChange} className="w-full py-3 px-4 rounded-xl bg-slate-50 dark:bg-[#0B0D12] text-sm font-semibold text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb] outline-none transition-all" placeholder="Ej. Pérez Gómez" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-widest">Cédula</label>
                    <input type="text" name="cedula" required value={nuevoPaciente.cedula} onChange={handleNuevoPacienteChange} className="w-full py-3 px-4 rounded-xl bg-slate-50 dark:bg-[#0B0D12] text-sm font-semibold text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb] outline-none transition-all" placeholder="Ej. 12345678" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-widest">Teléfono</label>
                    <input type="text" name="telefono" value={nuevoPaciente.telefono} onChange={handleNuevoPacienteChange} className="w-full py-3 px-4 rounded-xl bg-slate-50 dark:bg-[#0B0D12] text-sm font-semibold text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb] outline-none transition-all" placeholder="Ej. 04141234567" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-widest">Fec. Nacimiento</label>
                    <input type="date" name="fecha_nacimiento" value={nuevoPaciente.fecha_nacimiento} onChange={handleNuevoPacienteChange} className="w-full py-3 px-4 rounded-xl bg-slate-50 dark:bg-[#0B0D12] text-sm font-semibold text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb] outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-widest">Sexo</label>
                    <select name="sexo" value={nuevoPaciente.sexo} onChange={handleNuevoPacienteChange} className="w-full py-3 px-4 rounded-xl bg-slate-50 dark:bg-[#0B0D12] text-sm font-semibold text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb] outline-none transition-all">
                      <option value="">Seleccionar...</option>
                      <option value="Masculino">Masculino</option>
                      <option value="Femenino">Femenino</option>
                    </select>
                  </div>
                </div>

              </form>
            </div>

            <div className="p-6 border-t border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-[#0B0D12] flex justify-end gap-3">
              <button type="button" onClick={() => setShowRegistroModal(false)} className="px-6 py-2.5 rounded-xl font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors">
                Cancelar
              </button>
              <button type="submit" form="formNuevoPaciente" disabled={guardandoPaciente} className="px-8 py-2.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2 disabled:opacity-50">
                {guardandoPaciente ? 'Guardando...' : <><Save size={18} /> Guardar Ficha</>}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ================= HEADER SUPERIOR ================= */}
      <header className="h-20 flex items-center justify-between px-6 lg:px-10 border-b border-slate-200/60 dark:border-white/[0.04] bg-white/40 dark:bg-[#0B0D12]/80 backdrop-blur-md sticky top-0 z-30 shrink-0">
        <div className="flex items-center gap-4">
          <img src={isDarkMode ? "/soma_logo_blanco.png" : "/soma_logo.png"} alt="SOMA" className="h-7 object-contain" />
          <div className="h-6 w-px bg-slate-300 dark:bg-white/10 hidden sm:block"></div>
          <span className="hidden sm:block text-xs font-black tracking-widest text-slate-500 uppercase">Módulo de Admisión</span>
        </div>

        <div className="flex items-center gap-4 lg:gap-6">
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{userData?.nombres} {userData?.apellidos}</p>
              <p className="text-[10px] text-[#b0ff4c] font-black tracking-widest uppercase">Asistente</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-[#16161a] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white flex items-center justify-center font-bold shadow-sm">
              {getInitials()}
            </div>
          </div>

          <button onClick={handleLogout} className="flex items-center gap-2 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white px-4 py-2 rounded-xl text-sm font-bold transition-all border border-rose-500/20">
            <LogOut size={16} /> <span className="hidden sm:inline">Salir</span>
          </button>
          
          <div className="w-px h-6 bg-slate-300 dark:bg-white/10 hidden sm:block"></div>

          <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2.5 text-slate-400 hover:text-[#b0ff4c] bg-white dark:bg-[#16161a] border dark:border-white/[0.04] rounded-xl shadow-sm transition-all">
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </header>

      {/* ================= CONTENIDO PRINCIPAL ================= */}
      <main className="flex-1 overflow-y-auto w-full relative custom-scrollbar p-6 lg:p-10">
        <div className="max-w-[1200px] mx-auto space-y-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                Recepción y Triaje
              </h2>
              <p className="text-slate-500 mt-2 text-sm sm:text-base">Llena la hoja clínica del paciente para remitirlo a la sala de espera del médico.</p>
            </div>
            
            <div className="bg-[#b0ff4c] text-black rounded-2xl px-6 py-4 flex items-center gap-6 shadow-[0_10px_30px_rgba(176,255,76,0.15)] shrink-0">
              <div className="w-10 h-10 bg-black text-[#b0ff4c] rounded-full flex items-center justify-center">
                <Clock size={20} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-0.5">En Espera Hoy</p>
                <h3 className="text-3xl font-black leading-none">{pacientesEnEspera}</h3>
              </div>
            </div>
          </div>

          <div className="relative z-10 animate-[fadeIn_0.3s_ease-out]">
            
            <div className="bg-[#F8F7F4] text-slate-900 border border-[#D5D0C6] rounded-md shadow-[0_10px_40px_rgba(0,0,0,0.3)] flex flex-col mx-auto">
              
              <div className="p-8 pb-4 border-b-2 border-slate-400 bg-[#F8F7F4] rounded-t-md">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <p className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">SISTEMA MÉDICO SOMA</p>
                    <p className="text-xs font-semibold text-slate-600">DEPARTAMENTO DE ADMISIÓN</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">Forma 01-TRJ</p>
                  </div>
                </div>
                
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-serif font-bold text-slate-800 tracking-wider">HISTORIA CLÍNICA</h2>
                  <p className="text-sm font-serif text-slate-600 tracking-widest uppercase mt-1">Parte I - Triaje</p>
                </div>
              </div>
              
              <div className="px-8 pb-8">
                <form id="formTriaje" onSubmit={handleGuardarTriaje} className="space-y-8">
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 border-b-2 border-slate-400 pb-6 pt-4 relative">
                    
                    {/* ======================================================== */}
                    {/* SELECT PACIENTE */}
                    {/* ======================================================== */}
                    <div className="relative">
                      <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase block mb-1">NOMBRE DEL PACIENTE</span>
                      <button 
                        type="button"
                        onClick={() => setOpenPacienteMenu(!openPacienteMenu)}
                        className="w-full flex items-center justify-between py-2 bg-transparent border-b border-slate-400 text-left outline-none hover:bg-slate-200/50 transition-colors"
                      >
                        <span className={`font-serif text-lg font-bold tracking-wide truncate pr-4 ${pacienteSeleccionado ? 'text-blue-900 italic' : 'text-slate-400'}`}>
                          {pacienteSeleccionado ? `${pacienteSeleccionado.nombres} ${pacienteSeleccionado.apellidos}` : '(Clic para buscar...)'}
                        </span>
                        <ChevronDown size={16} className={`shrink-0 text-slate-500 transition-transform ${openPacienteMenu ? 'rotate-180 text-[#2563eb]' : ''}`} />
                      </button>
                      
                      {openPacienteMenu && (
                        <>
                          <div className="fixed inset-0 z-[90]" onClick={(e) => { e.stopPropagation(); setOpenPacienteMenu(false); }}></div>
                          <div className="absolute top-[calc(100%+4px)] left-0 w-full bg-white border border-slate-300 rounded-md shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[100] flex flex-col overflow-hidden animate-[fadeIn_0.1s_ease-out]">
                            
                            <div className="p-3 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
                              <Search size={16} className="text-slate-400 shrink-0" />
                              <input 
                                type="text" 
                                placeholder="Buscar nombre o cédula..." 
                                value={searchPaciente}
                                onChange={(e) => setSearchPaciente(e.target.value)}
                                className="w-full bg-transparent outline-none text-sm text-slate-800 placeholder:text-slate-400"
                                autoFocus
                              />
                            </div>

                            <div className="p-2 border-b border-slate-200 bg-slate-50/50">
                              <button 
                                type="button" 
                                onClick={(e) => { e.stopPropagation(); setOpenPacienteMenu(false); setShowRegistroModal(true); }}
                                className="w-full flex items-center justify-center gap-2 py-2 bg-blue-100 hover:bg-blue-600 text-blue-700 hover:text-white rounded-lg font-bold text-sm transition-colors"
                              >
                                <UserPlus size={16} /> Registrar Nuevo Paciente
                              </button>
                            </div>

                            <div className="max-h-60 overflow-y-auto custom-scrollbar-gruesa">
                              {pacientesFiltrados.length === 0 ? (
                                <div className="px-4 py-4 text-sm text-slate-500 text-center font-medium">No se encontraron pacientes.</div>
                              ) : (
                                pacientesFiltrados.map(p => (
                                  <div 
                                    key={p.id} 
                                    onClick={(e) => { 
                                      e.stopPropagation();
                                      setTriajeData(prev => ({ ...prev, id_paciente: p.id })); 
                                      setOpenPacienteMenu(false); 
                                      setSearchPaciente(''); 
                                    }}
                                    className="px-4 py-3 text-sm text-slate-800 hover:bg-blue-50 cursor-pointer transition-colors border-b border-slate-100 last:border-0 font-medium flex justify-between items-center group"
                                  >
                                    <span>{p.nombres} {p.apellidos}</span>
                                    <span className="opacity-50 text-xs font-normal group-hover:opacity-100 transition-opacity">C.I: {p.cedula}</span>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    {/* ======================================================== */}
                    {/* SELECT MÉDICO */}
                    {/* ======================================================== */}
                    <div className="relative">
                      <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase block mb-1">SERVICIO / MÉDICO ASIGNADO</span>
                      <button 
                        type="button"
                        onClick={() => setOpenMedicoMenu(!openMedicoMenu)}
                        className="w-full flex items-center justify-between py-2 bg-transparent border-b border-slate-400 text-left outline-none hover:bg-slate-200/50 transition-colors"
                      >
                        <span className={`font-serif text-lg font-bold tracking-wide truncate pr-4 ${medicoSeleccionado ? 'text-blue-900 italic' : 'text-slate-400'}`}>
                          {medicoSeleccionado ? `Dr(a). ${medicoSeleccionado.nombres} ${medicoSeleccionado.apellidos}` : '(Clic para asignar...)'}
                        </span>
                        <ChevronDown size={16} className={`shrink-0 text-slate-500 transition-transform ${openMedicoMenu ? 'rotate-180 text-[#2563eb]' : ''}`} />
                      </button>
                      
                      {openMedicoMenu && (
                        <>
                          <div className="fixed inset-0 z-[90]" onClick={(e) => { e.stopPropagation(); setOpenMedicoMenu(false); }}></div>
                          <div className="absolute top-[calc(100%+4px)] left-0 w-full bg-white border border-slate-300 rounded-md shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[100] flex flex-col overflow-hidden animate-[fadeIn_0.1s_ease-out]">
                            
                            <div className="p-3 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
                              <Search size={16} className="text-slate-400 shrink-0" />
                              <input 
                                type="text" 
                                placeholder="Buscar médico o especialidad..." 
                                value={searchMedico}
                                onChange={(e) => setSearchMedico(e.target.value)}
                                className="w-full bg-transparent outline-none text-sm text-slate-800 placeholder:text-slate-400"
                                autoFocus
                              />
                            </div>

                            <div className="max-h-60 overflow-y-auto custom-scrollbar-gruesa">
                              {medicosFiltrados.length === 0 ? (
                                <div className="px-4 py-4 text-sm text-slate-500 text-center font-medium">No se encontraron médicos.</div>
                              ) : (
                                medicosFiltrados.map(m => (
                                  <div 
                                    key={m.id_auth || m.id} 
                                    onClick={(e) => { 
                                      e.stopPropagation();
                                      setTriajeData(prev => ({ ...prev, id_medico: m.id_auth || m.id })); 
                                      setOpenMedicoMenu(false); 
                                      setSearchMedico('');
                                    }}
                                    className="px-4 py-3 text-sm text-slate-800 hover:bg-blue-50 cursor-pointer transition-colors border-b border-slate-100 last:border-0 font-medium"
                                  >
                                    Dr(a). {m.nombres} {m.apellidos} <span className="opacity-50 text-xs ml-1 font-normal">- {m.especialidad || 'Especialista'}</span>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 relative z-10">
                    <div className="mb-4 border-b border-slate-400 pb-1">
                      <h3 className="font-serif font-bold text-slate-800 uppercase tracking-widest text-sm flex items-center gap-2">
                        1.- Examen Funcional / Síntomas Rápidos
                      </h3>
                    </div>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-3 pl-2">
                      {listaSintomasIVSS.map((sintoma) => (
                        <label key={sintoma.id} className="flex items-center gap-3 cursor-pointer group">
                          <div className="relative flex items-center justify-center w-5 h-5 border border-slate-500 bg-white group-hover:border-slate-800 transition-colors">
                            <input 
                              type="checkbox" 
                              className="opacity-0 absolute"
                              checked={triajeData.sintomasRapidos.includes(sintoma.label)}
                              onChange={() => handleCheckboxChange(sintoma.label)}
                            />
                            {triajeData.sintomasRapidos.includes(sintoma.label) && (
                              <span className="text-blue-900 font-serif font-black text-sm leading-none select-none italic">X</span>
                            )}
                          </div>
                          <span className="text-xs font-medium text-slate-700 select-none group-hover:text-slate-900 uppercase tracking-wide">
                            <span className="text-slate-400 mr-2">{sintoma.id}.</span> {sintoma.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 relative z-10">
                    <div className="mb-4 border-b border-slate-400 pb-1">
                      <h3 className="font-serif font-bold text-slate-800 uppercase tracking-widest text-sm flex items-center gap-2">
                        2.- Signos Vitales
                      </h3>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-8 gap-y-5 text-xs font-bold uppercase tracking-widest text-slate-700 pl-2">
                      <div className="flex items-end gap-2">
                        <span>Tensión (TA):</span>
                        <input type="text" name="ta" value={triajeData.ta} onChange={handleInputChange} className="w-24 bg-transparent border-b border-slate-500 text-blue-900 font-serif font-bold italic outline-none text-center focus:border-[#2563eb] placeholder:text-slate-300 placeholder:not-italic" placeholder="___ / ___" />
                      </div>
                      <div className="flex items-end gap-2">
                        <span>Frecuencia (FC):</span>
                        <input type="text" name="fc" value={triajeData.fc} onChange={handleInputChange} className="w-20 bg-transparent border-b border-slate-500 text-blue-900 font-serif font-bold italic outline-none text-center focus:border-[#2563eb] placeholder:text-slate-300 placeholder:not-italic" placeholder="___ lpm" />
                      </div>
                      <div className="flex items-end gap-2">
                        <span>Peso:</span>
                        <input type="number" name="peso" value={triajeData.peso} onChange={handleInputChange} className="w-16 bg-transparent border-b border-slate-500 text-blue-900 font-serif font-bold italic outline-none text-center focus:border-[#2563eb] placeholder:text-slate-300 placeholder:not-italic" placeholder="___ kg" />
                      </div>
                      <div className="flex items-end gap-2">
                        <span>Talla:</span>
                        <input type="number" step="0.01" name="talla" value={triajeData.talla} onChange={handleInputChange} className="w-16 bg-transparent border-b border-slate-500 text-blue-900 font-serif font-bold italic outline-none text-center focus:border-[#2563eb] placeholder:text-slate-300 placeholder:not-italic" placeholder="___ m" />
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 relative z-10">
                    <div className="mb-4 border-b border-slate-400 pb-1">
                      <h3 className="font-serif font-bold text-slate-800 uppercase tracking-widest text-sm flex items-center gap-2">
                        3.- Motivo de la Consulta / Notas
                      </h3>
                    </div>
                    
                    <textarea 
                      name="motivo" 
                      value={triajeData.motivo} 
                      onChange={handleInputChange} 
                      required
                      className="w-full bg-transparent border-0 outline-none text-blue-900 font-serif italic text-sm leading-[31px] resize-none min-h-[160px]"
                      style={{
                        backgroundImage: 'repeating-linear-gradient(transparent, transparent 30px, #cbd5e1 30px, #cbd5e1 31px)',
                        backgroundAttachment: 'local',
                        lineHeight: '31px',
                        paddingTop: '2px'
                      }}
                    ></textarea>
                  </div>

                </form>
              </div>
            </div>

            <div className="mt-6 flex justify-end relative z-10 pb-10">
              <button 
                type="button"
                onClick={handleGuardarTriaje}
                disabled={guardando || !triajeData.id_paciente || !triajeData.id_medico} 
                className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white px-10 py-4 rounded-xl font-bold shadow-lg shadow-blue-500/20 disabled:opacity-50 flex justify-center items-center gap-2 transition-all transform hover:-translate-y-1 disabled:hover:translate-y-0"
              >
                {guardando ? 'Procesando...' : <><FileText size={20} /> Guardar Historia y Remitir</>}
              </button>
            </div>

          </div>
        </div>
      </main>

      <style>{`
        /* SCROLLBAR GENERAL DEL SISTEMA */
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #3f3f46; border-radius: 10px; }
        
        /* SCROLLBAR SÚPER VISIBLE PARA LOS MENÚS DESPLEGABLES */
        .custom-scrollbar-gruesa::-webkit-scrollbar { width: 12px; }
        .custom-scrollbar-gruesa::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 0 0 6px 0; }
        .custom-scrollbar-gruesa::-webkit-scrollbar-thumb { background-color: #94a3b8; border-radius: 6px; border: 3px solid #f1f5f9; }
        .custom-scrollbar-gruesa::-webkit-scrollbar-thumb:hover { background-color: #64748b; }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}