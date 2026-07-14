import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { 
  Home, Users, FileText, Calendar, User, Settings, LogOut, 
  Menu, Sun, Moon, PanelLeft, Activity, Clock, ChevronDown, UserPlus, Save, Search, X
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
        (user.especialidad && user.especialidad !== 'Admisión / Triaje' && user.especialidad !== 'Departamento de Historias Clínicas')
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
    if (!userData) return "AS";
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

      alert('¡Ficha enviada a la Sala de Espera del Especialista con éxito!');
      
      setTriajeData({ id_paciente: '', id_medico: '', motivo: '', ta: '', fc: '', peso: '', talla: '', sintomasRapidos: [] });
      fetchData(); 
      
    } catch (error) {
      alert("Error al guardar ficha: " + error.message);
    } finally {
      setGuardando(false);
    }
  };

  // Extraemos los datos completos solo para mostrarlos en la UI
  const pacienteActivo = listaPacientes.find(p => String(p.id) === String(triajeData.id_paciente));
  const medicoActivo = listaMedicos.find(m => String(m.id_auth || m.id) === String(triajeData.id_medico));

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
    <div className="flex h-screen bg-slate-100 dark:bg-[#0B0D12] text-slate-800 dark:text-slate-200 font-sans overflow-hidden transition-colors duration-300 antialiased">
      
      {/* OVERLAY LATERAL PARA MOVILES */}
      {isSidebarOpen && <div className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm transition-opacity" onClick={() => setIsSidebarOpen(false)} />}

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
                <p className="text-sm text-slate-500 mt-1">Crea la ficha para el historial clínico.</p>
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
                    <input type="text" name="nombres" required value={nuevoPaciente.nombres} onChange={handleNuevoPacienteChange} className="w-full py-3 px-4 rounded-xl bg-slate-50 dark:bg-[#0B0D12] text-sm font-semibold text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 focus:border-[#2563eb] outline-none transition-all" placeholder="Ej. Juan Carlos" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-widest">Apellidos</label>
                    <input type="text" name="apellidos" required value={nuevoPaciente.apellidos} onChange={handleNuevoPacienteChange} className="w-full py-3 px-4 rounded-xl bg-slate-50 dark:bg-[#0B0D12] text-sm font-semibold text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 focus:border-[#2563eb] outline-none transition-all" placeholder="Ej. Pérez Gómez" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-widest">Cédula</label>
                    <input type="text" name="cedula" required value={nuevoPaciente.cedula} onChange={handleNuevoPacienteChange} className="w-full py-3 px-4 rounded-xl bg-slate-50 dark:bg-[#0B0D12] text-sm font-semibold text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 focus:border-[#2563eb] outline-none transition-all" placeholder="Ej. 12345678" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-widest">Teléfono</label>
                    <input type="text" name="telefono" value={nuevoPaciente.telefono} onChange={handleNuevoPacienteChange} className="w-full py-3 px-4 rounded-xl bg-slate-50 dark:bg-[#0B0D12] text-sm font-semibold text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 focus:border-[#2563eb] outline-none transition-all" placeholder="Ej. 04141234567" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-widest">Fec. Nacimiento</label>
                    <input type="date" name="fecha_nacimiento" value={nuevoPaciente.fecha_nacimiento} onChange={handleNuevoPacienteChange} className="w-full py-3 px-4 rounded-xl bg-slate-50 dark:bg-[#0B0D12] text-sm font-semibold text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 focus:border-[#2563eb] outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-widest">Sexo</label>
                    <select name="sexo" value={nuevoPaciente.sexo} onChange={handleNuevoPacienteChange} className="w-full py-3 px-4 rounded-xl bg-slate-50 dark:bg-[#0B0D12] text-sm font-semibold text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 focus:border-[#2563eb] outline-none transition-all">
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

      {/* ================= SIDEBAR ================= */}
      <aside 
        className={`
          fixed inset-y-0 left-0 z-50 
          bg-white dark:bg-[#16161a] 
          border-r border-slate-200/80 dark:border-white/[0.04] 
          flex flex-col justify-between 
          transform transition-all duration-300 ease-in-out 
          md:relative md:translate-x-0
          md:m-4 md:mr-0 md:rounded-3xl 
          shadow-xl shadow-slate-200/50 dark:shadow-none
          ${isSidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64'} 
          ${isCollapsed ? 'md:w-24' : 'md:w-68'}
        `}>
        <div>
          <div className={`h-20 flex items-center transition-all ${isCollapsed ? 'justify-center' : 'justify-between px-6'}`}>
            <Link to="/admision" className="flex items-center overflow-hidden whitespace-nowrap">
              {isCollapsed ? (
                <span className="text-blue-500 text-3xl mb-1 font-black">*</span>
              ) : (
                <>
                  <img src="/soma_logo.png" alt="SOMA Logo" className="h-6 object-contain block dark:hidden transition-opacity duration-300" />
                  <img src="/soma_logo_blanco.png" alt="SOMA Logo" className="h-6 object-contain hidden dark:block transition-opacity duration-300" />
                </>
              )}
            </Link>
            {!isCollapsed && (
              <button className="md:hidden text-slate-400 hover:text-rose-500 transition-colors" onClick={() => setIsSidebarOpen(false)}>
                <X size={20} />
              </button>
            )}
          </div>

          <div className={`py-4 ${isCollapsed ? 'px-3' : 'px-4'}`}>
            {!isCollapsed && <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-3 px-3 tracking-widest uppercase">Herramientas</p>}
            <nav className="space-y-1.5">
              <Link to="/admision" className={`flex items-center gap-3 py-3 bg-blue-500/10 dark:bg-white/10 text-blue-600 dark:text-white rounded-xl font-bold transition-all ${isCollapsed ? 'justify-center px-0' : 'px-4'}`}>
                <Home size={20} className="shrink-0" />
                {!isCollapsed && <span className="whitespace-nowrap text-sm">Inicio</span>}
              </Link>
              <Link to="/pacientes" className={`flex items-center gap-3 py-3 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/[0.03] rounded-xl font-medium transition-all ${isCollapsed ? 'justify-center px-0' : 'px-4'}`}>
                <Users size={20} className="shrink-0" />
                {!isCollapsed && <span className="whitespace-nowrap text-sm">Pacientes</span>}
              </Link>
              <Link to="/historias" className={`flex items-center gap-3 py-3 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/[0.03] rounded-xl font-medium transition-all ${isCollapsed ? 'justify-center px-0' : 'px-4'}`}>
                <FileText size={20} className="shrink-0" />
                {!isCollapsed && <span className="whitespace-nowrap text-sm">Historias Clínicas</span>}
              </Link>
              <Link to="/agenda" className={`flex items-center gap-3 py-3 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/[0.03] rounded-xl font-medium transition-all ${isCollapsed ? 'justify-center px-0' : 'px-4'}`}>
                <Calendar size={20} className="shrink-0" />
                {!isCollapsed && <span className="whitespace-nowrap text-sm">Agenda</span>}
              </Link>
              <Link to="/estadisticas" className={`flex items-center gap-3 py-3 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/[0.03] rounded-xl font-medium transition-all ${isCollapsed ? 'justify-center px-0' : 'px-4'}`}>
                <Activity size={20} className="shrink-0" />
                {!isCollapsed && <span className="whitespace-nowrap text-sm">Estadísticas</span>}
              </Link>
            </nav>
          </div>

          <div className={`pt-2 ${isCollapsed ? 'px-3' : 'px-4'}`}>
            {!isCollapsed && <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-3 px-3 tracking-widest uppercase">Configuración</p>}
            <nav className="space-y-1.5">
              <Link to="/perfil" className={`flex items-center gap-3 py-3 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/[0.03] rounded-xl font-medium transition-all ${isCollapsed ? 'justify-center px-0' : 'px-4'}`}>
                <User size={20} className="shrink-0" />
                {!isCollapsed && <span className="whitespace-nowrap text-sm">Mi perfil</span>}
              </Link>
              <Link to="/ajustes" className={`flex items-center gap-3 py-3 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/[0.03] rounded-xl font-medium transition-all ${isCollapsed ? 'justify-center px-0' : 'px-4'}`}>
                <Settings size={20} className="shrink-0" />
                {!isCollapsed && <span className="whitespace-nowrap text-sm">Ajustes</span>}
              </Link>
            </nav>
          </div>
        </div>

        <div className={`p-4 border-t border-slate-100 dark:border-white/[0.04] flex flex-col ${isCollapsed ? 'items-center' : ''}`}>
          <div className={`flex items-center gap-3 mb-3 ${isCollapsed ? 'justify-center' : 'px-2'}`}>
            <div className="w-9 h-9 shrink-0 rounded-full bg-slate-200 dark:bg-white/90 text-slate-900 flex items-center justify-center text-xs font-bold border border-white/20">
              {getInitials()}
            </div>
            {!isCollapsed && (
              <div className="overflow-hidden">
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wider">Dpto. Historias</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight truncate">
                  {userData?.nombres || 'Asistente'} {userData?.apellidos || ''}
                </p>
              </div>
            )}
          </div>
          <button onClick={handleLogout} className={`flex items-center gap-3 py-2.5 w-full text-slate-400 dark:text-slate-500 hover:text-white hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl font-medium transition-colors ${isCollapsed ? 'justify-center px-0' : 'px-3'}`}>
            <LogOut size={18} className="shrink-0" />
            {!isCollapsed && <span className="whitespace-nowrap text-sm">Cerrar Sesión</span>}
          </button>
        </div>
      </aside>

      {/* ================= CONTENIDO PRINCIPAL ================= */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto w-full relative">
        
        <header className="h-20 flex items-center justify-between px-6 lg:px-8 border-b border-slate-200/60 dark:border-white/[0.04] bg-white/40 dark:bg-transparent backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button className="text-slate-500 dark:text-slate-400 hover:text-blue-600 md:hidden p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5" onClick={() => setIsSidebarOpen(true)}>
              <Menu size={22} />
            </button>
            <button className="hidden md:flex p-2.5 text-slate-400 hover:text-white rounded-xl bg-white dark:bg-[#16161a] border border-slate-200 dark:border-white/[0.04] shadow-sm" onClick={() => setIsCollapsed(!isCollapsed)}>
              <PanelLeft size={18} />
            </button>
          </div>
          
          <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2.5 text-slate-400 hover:text-amber-500 dark:hover:text-yellow-400 rounded-xl bg-white dark:bg-[#16161a] border border-slate-200 dark:border-white/[0.04] shadow-sm transition-all">
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </header>

        <div className="p-6 sm:p-8 max-w-[1200px] mx-auto w-full space-y-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                Dpto. de Historias Clínicas
              </h2>
              <p className="text-slate-500 mt-2 text-sm sm:text-base">Gestiona el triaje inicial y remite a los pacientes con el especialista.</p>
            </div>
            
            <div className="bg-[#2563eb] text-white rounded-2xl px-6 py-4 flex items-center gap-6 shadow-[0_10px_30px_rgba(37,99,235,0.2)] shrink-0">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
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
                    <p className="text-xs font-semibold text-slate-600">DEPARTAMENTO DE HISTORIAS CLÍNICAS</p>
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
                    {/* SELECT PACIENTE (CON SOLUCIÓN Z-INDEX INTERNA) */}
                    {/* ======================================================== */}
                    <div className="relative">
                      <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase block mb-1">NOMBRE DEL PACIENTE</span>
                      <button 
                        type="button"
                        onClick={() => { setOpenPacienteMenu(!openPacienteMenu); setOpenMedicoMenu(false); }}
                        className="w-full flex items-center justify-between py-2 bg-transparent border-b border-slate-400 text-left outline-none hover:bg-slate-200/50 transition-colors"
                      >
                        <span className={`font-serif text-lg font-bold tracking-wide truncate pr-4 ${pacienteActivo ? 'text-blue-900 italic' : 'text-slate-400'}`}>
                          {pacienteActivo ? `${pacienteActivo.nombres} ${pacienteActivo.apellidos}` : '(Clic para buscar...)'}
                        </span>
                        <ChevronDown size={16} className={`shrink-0 text-slate-500 transition-transform ${openPacienteMenu ? 'rotate-180 text-[#2563eb]' : ''}`} />
                      </button>
                      
                      {openPacienteMenu && (
                        <>
                          {/* BACKDROP LOCAL (Evita el choque de z-index con la raíz) */}
                          <div className="fixed inset-0 z-[90] cursor-default" onClick={(e) => { e.stopPropagation(); setOpenPacienteMenu(false); }}></div>
                          
                          <div className="absolute top-[calc(100%+4px)] left-0 w-full bg-white border border-slate-300 rounded-xl shadow-2xl z-[100] flex flex-col overflow-hidden animate-[fadeIn_0.1s_ease-out]">
                            
                            <div className="p-3 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
                              <Search size={16} className="text-slate-400 shrink-0" />
                              <input 
                                type="text" 
                                placeholder="Buscar nombre o cédula..." 
                                value={searchPaciente}
                                onChange={(e) => setSearchPaciente(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                className="w-full bg-transparent outline-none text-sm text-slate-800 placeholder:text-slate-400"
                                autoFocus
                              />
                            </div>

                            <div className="p-2 border-b border-slate-200 bg-slate-50/50">
                              <button 
                                type="button" 
                                onClick={(e) => { 
                                  e.stopPropagation(); 
                                  setOpenPacienteMenu(false); 
                                  setShowRegistroModal(true); 
                                }}
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
                                  <button 
                                    key={p.id} 
                                    type="button"
                                    onClick={(e) => { 
                                      e.stopPropagation();
                                      setTriajeData(prev => ({ ...prev, id_paciente: p.id })); 
                                      setOpenPacienteMenu(false); 
                                      setSearchPaciente(''); 
                                    }}
                                    className="w-full text-left px-4 py-3 text-sm text-slate-800 hover:bg-blue-50 transition-colors border-b border-slate-100 last:border-0 font-medium flex justify-between items-center group"
                                  >
                                    <span>{p.nombres} {p.apellidos}</span>
                                    <span className="opacity-50 text-xs font-normal group-hover:opacity-100 transition-opacity">C.I: {p.cedula}</span>
                                  </button>
                                ))
                              )}
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    {/* ======================================================== */}
                    {/* SELECT MÉDICO (CON SOLUCIÓN Z-INDEX INTERNA) */}
                    {/* ======================================================== */}
                    <div className="relative">
                      <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase block mb-1">SERVICIO / MÉDICO ASIGNADO</span>
                      <button 
                        type="button"
                        onClick={() => { setOpenMedicoMenu(!openMedicoMenu); setOpenPacienteMenu(false); }}
                        className="w-full flex items-center justify-between py-2 bg-transparent border-b border-slate-400 text-left outline-none hover:bg-slate-200/50 transition-colors"
                      >
                        <span className={`font-serif text-lg font-bold tracking-wide truncate pr-4 ${medicoActivo ? 'text-blue-900 italic' : 'text-slate-400'}`}>
                          {medicoActivo ? `Dr(a). ${medicoActivo.nombres} ${medicoActivo.apellidos}` : '(Clic para asignar...)'}
                        </span>
                        <ChevronDown size={16} className={`shrink-0 text-slate-500 transition-transform ${openMedicoMenu ? 'rotate-180 text-[#2563eb]' : ''}`} />
                      </button>
                      
                      {openMedicoMenu && (
                        <>
                          {/* BACKDROP LOCAL */}
                          <div className="fixed inset-0 z-[90] cursor-default" onClick={(e) => { e.stopPropagation(); setOpenMedicoMenu(false); }}></div>
                          
                          <div className="absolute top-[calc(100%+4px)] left-0 w-full bg-white border border-slate-300 rounded-xl shadow-2xl z-[100] flex flex-col overflow-hidden animate-[fadeIn_0.1s_ease-out]">
                            
                            <div className="p-3 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
                              <Search size={16} className="text-slate-400 shrink-0" />
                              <input 
                                type="text" 
                                placeholder="Buscar médico o especialidad..." 
                                value={searchMedico}
                                onChange={(e) => setSearchMedico(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                className="w-full bg-transparent outline-none text-sm text-slate-800 placeholder:text-slate-400"
                                autoFocus
                              />
                            </div>

                            <div className="max-h-60 overflow-y-auto custom-scrollbar-gruesa">
                              {medicosFiltrados.length === 0 ? (
                                <div className="px-4 py-4 text-sm text-slate-500 text-center font-medium">No se encontraron médicos.</div>
                              ) : (
                                medicosFiltrados.map(m => (
                                  <button 
                                    key={m.id_auth || m.id} 
                                    type="button"
                                    onClick={(e) => { 
                                      e.stopPropagation();
                                      setTriajeData(prev => ({ ...prev, id_medico: m.id_auth || m.id })); 
                                      setOpenMedicoMenu(false); 
                                      setSearchMedico('');
                                    }}
                                    className="w-full text-left px-4 py-3 text-sm text-slate-800 hover:bg-blue-50 transition-colors border-b border-slate-100 last:border-0 font-medium"
                                  >
                                    Dr(a). {m.nombres} {m.apellidos} <span className="opacity-50 text-xs ml-1 font-normal block sm:inline mt-1 sm:mt-0">- {m.especialidad || 'Especialista'}</span>
                                  </button>
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
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #3f3f46; border-radius: 10px; }
        
        .custom-scrollbar-gruesa::-webkit-scrollbar { width: 12px; }
        .custom-scrollbar-gruesa::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 0 0 10px 10px; }
        .custom-scrollbar-gruesa::-webkit-scrollbar-thumb { background-color: #94a3b8; border-radius: 10px; border: 3px solid #f1f5f9; }
        .custom-scrollbar-gruesa::-webkit-scrollbar-thumb:hover { background-color: #64748b; }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}