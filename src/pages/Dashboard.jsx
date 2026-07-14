import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { 
  Home, Users, FileText, Calendar, User, Settings, LogOut, 
  Menu, Sun, Moon, UserPlus, FilePlus, CalendarPlus, Clock, PlayCircle, X, PanelLeft, Activity, CheckCircle
} from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  
  // ================= ESTADOS DE UI =================
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // ================= ESTADOS DE DATOS =================
  const [userData, setUserData] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [saludo, setSaludo] = useState('Hola');
  
  const [pacientesEnEspera, setPacientesEnEspera] = useState([]);
  
  // Estado para abrir la hoja física (Modal del departamento)
  const [hojaSeleccionada, setHojaSeleccionada] = useState(null);

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDarkMode]);

  useEffect(() => {
    const hora = new Date().getHours();
    if (hora >= 5 && hora < 12) setSaludo('¡Buenos días');
    else if (hora >= 12 && hora < 19) setSaludo('¡Buenas tardes');
    else setSaludo('¡Buenas noches');
  }, []);

  const fetchUser = async (session) => {
    try {
      const { data: dbUser } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id_auth', session.user.id)
        .single();

      if (dbUser) {
        if (dbUser.rol === 'departamento') {
          navigate('/admision');
          return;
        }
        setUserData(dbUser);

        // BUSCAR PACIENTES ENVIADOS POR ADMISIÓN
        const { data: consultasPendientes } = await supabase
          .from('consultas')
          .select(`
            id,
            motivo,
            signos_vitales,
            fecha_consulta,
            id_paciente,
            pacientes ( id, nombres, apellidos )
          `)
          .eq('id_medico', session.user.id)
          .eq('estado', 'En Espera')
          .order('fecha_consulta', { ascending: true });

        if (consultasPendientes) {
          setPacientesEnEspera(consultasPendientes);
        }
      }
      setLoadingUser(false);
    } catch (error) {
      console.error("Error cargando dashboard:", error);
      setLoadingUser(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) navigate('/login');
      else if (isMounted) fetchUser(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) navigate('/login');
      else if (isMounted) fetchUser(session);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const getInitials = () => {
    if (!userData || !userData.nombres || !userData.apellidos) return "DR";
    return `${userData.nombres.charAt(0)}${userData.apellidos.charAt(0)}`.toUpperCase();
  };

  const handleAtenderPaciente = async () => {
    if (!hojaSeleccionada) return;
    
    await supabase
      .from('consultas')
      .update({ estado: 'En Consulta' })
      .eq('id', hojaSeleccionada.id);

    const consultaId = hojaSeleccionada.id;
    setHojaSeleccionada(null);
    navigate(`/historias?consulta=${consultaId}`);
  };

  const formatearHoraExacta = (fechaIso) => {
    if (!fechaIso) return '';
    const fecha = new Date(fechaIso);
    return fecha.toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  if (loadingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0B0D12]">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-cyan-100 dark:border-slate-800 border-t-cyan-500 rounded-full animate-spin mb-4"></div>
          <p className="text-slate-500 dark:text-slate-400 font-bold animate-pulse">Cargando tu consultorio...</p>
        </div>
      </div>
    );
  }

  return (
  <div className="flex h-screen bg-slate-100 dark:bg-[#0B0D12] text-slate-800 dark:text-slate-200 font-sans overflow-hidden transition-colors duration-300 antialiased">
      
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm transition-opacity" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* ========================================================================= */}
      {/* MODAL DEL PORTAPAPELES (HOJA DE TRIAJE RECIBIDA DEL DEPARTAMENTO) */}
      {/* ========================================================================= */}
      {hojaSeleccionada && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
          <div className="w-full max-w-3xl max-h-[90vh] flex flex-col">
            
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white font-bold text-lg flex items-center gap-2">
                <FileText className="text-[#b0ff4c]" /> Hoja de Admisión Recibida
              </h3>
              <button onClick={() => setHojaSeleccionada(null)} className="text-slate-400 hover:text-white bg-white/10 p-2 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="bg-[#F8F7F4] text-slate-900 border border-[#D5D0C6] rounded-md shadow-2xl flex-1 overflow-y-auto custom-scrollbar relative">
              
              <div className="p-8 pb-4 border-b-2 border-slate-400 bg-[#F8F7F4] sticky top-0 z-10">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <p className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">SISTEMA MÉDICO SOMA</p>
                    <p className="text-xs font-semibold text-slate-600">DEPARTAMENTO DE ADMISIÓN</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">Forma 01-TRJ</p>
                  </div>
                </div>
                
                <div className="text-center mb-4">
                  <h2 className="text-2xl font-serif font-bold text-slate-800 tracking-wider">HISTORIA CLÍNICA</h2>
                  <p className="text-sm font-serif text-slate-600 tracking-widest uppercase mt-1">Parte I - Triaje</p>
                </div>
              </div>
              
              <div className="px-8 pb-8 pt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 border-b-2 border-slate-400 pb-6">
                  <div>
                    <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase block mb-1">NOMBRE DEL PACIENTE</span>
                    <div className="w-full py-2 border-b border-slate-400">
                      <span className="font-serif text-lg font-bold tracking-wide text-blue-900 italic">
                        {hojaSeleccionada.pacientes?.nombres} {hojaSeleccionada.pacientes?.apellidos}
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase block mb-1">SERVICIO / MÉDICO ASIGNADO</span>
                    <div className="w-full py-2 border-b border-slate-400">
                      <span className="font-serif text-lg font-bold tracking-wide text-blue-900 italic">
                        Dr(a). {userData?.nombres} {userData?.apellidos}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-6">
                  <div className="mb-4 border-b border-slate-400 pb-1">
                    <h3 className="font-serif font-bold text-slate-800 uppercase tracking-widest text-sm">
                      1 y 2.- Signos Vitales y Examen Funcional
                    </h3>
                  </div>
                  <p className="w-full bg-transparent border-0 outline-none text-blue-900 font-serif italic text-base leading-[31px]">
                    {hojaSeleccionada.signos_vitales}
                  </p>
                </div>

                <div className="pt-6">
                  <div className="mb-4 border-b border-slate-400 pb-1">
                    <h3 className="font-serif font-bold text-slate-800 uppercase tracking-widest text-sm">
                      3.- Motivo de la Consulta / Notas
                    </h3>
                  </div>
                  <div 
                    className="w-full min-h-[160px] text-blue-900 font-serif italic text-base leading-[31px]"
                    style={{
                      backgroundImage: 'repeating-linear-gradient(transparent, transparent 30px, #cbd5e1 30px, #cbd5e1 31px)',
                      backgroundAttachment: 'local',
                      lineHeight: '31px',
                      paddingTop: '2px'
                    }}
                  >
                    {hojaSeleccionada.motivo}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button 
                onClick={handleAtenderPaciente}
                className="bg-[#b0ff4c] hover:bg-[#9ded3a] text-black px-10 py-4 rounded-xl font-bold shadow-[0_10px_30px_rgba(176,255,76,0.3)] flex items-center gap-2 transition-all transform hover:-translate-y-1"
              >
                <CheckCircle size={20} /> Ingresar Paciente e Iniciar Consulta
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
            <Link to="/dashboard" className="flex items-center overflow-hidden whitespace-nowrap">
              {isCollapsed ? (
                <span className="text-emerald-500 text-3xl mb-1 font-black">*</span>
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
              <Link to="/dashboard" className={`flex items-center gap-3 py-3 bg-emerald-500/10 dark:bg-white/10 text-emerald-600 dark:text-white rounded-xl font-bold transition-all ${isCollapsed ? 'justify-center px-0' : 'px-4'}`}>
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
                {!isCollapsed && <span className="whitespace-nowrap text-sm">Estadisticas</span>}
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
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wider">Médico</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight truncate">
                  {userData?.nombres || 'Miguel'} {userData?.apellidos || 'Gómez'}
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

        <div className="p-6 sm:p-8 max-w-[1400px] mx-auto w-full space-y-10">
          
          {/* ================= SALUDO Y MUÑECA (FLEX-ROW) ================= */}
          <div className="flex flex-row items-center justify-between gap-4">
            <div className="flex-1">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.1]">
                {saludo} <br className="hidden sm:block" />
                Dr(a). {userData?.apellidos || 'Gómez'}!
              </h2>
            </div>
            
            <div className="shrink-0">
              <img 
                src="/ruta-mascota-doctora-der.svg" 
                alt="Doctora SOMA" 
                className="w-20 sm:w-28 md:w-32 drop-shadow-[0_10px_15px_rgba(0,0,0,0.3)] pointer-events-none transition-transform hover:scale-105" 
              />
            </div>
          </div>

          {/* ================= BOTONES COMPACTOS ================= */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Acciones Rápidas</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 relative">
              <Link to="/pacientes" className="flex items-center justify-center gap-3 py-4 px-4 bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-[1rem] font-bold transition-all shadow-md hover:-translate-y-1 relative z-10">
                <UserPlus size={20} />
                <span className="text-sm sm:text-base">Crear Paciente</span>
              </Link>
              
              <Link to="/historias" className="flex items-center justify-center gap-3 py-4 px-4 bg-[#10b981] hover:bg-[#059669] text-white rounded-[1rem] font-bold transition-all shadow-md hover:-translate-y-1 relative z-10">
                <FilePlus size={20} />
                <span className="text-sm sm:text-base">Crear Consulta</span>
              </Link>
              
              <Link to="/agenda" className="flex items-center justify-center gap-3 py-4 px-4 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white rounded-[1rem] font-bold transition-all shadow-md hover:-translate-y-1 relative z-10">
                <CalendarPlus size={20} />
                <span className="text-sm sm:text-base">Agendar Cita</span>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            <div className="bg-white dark:bg-[#16161a] border border-slate-200/80 dark:border-white/[0.04] rounded-[2rem] p-8 flex flex-col shadow-sm min-h-[380px] max-h-[500px]">
              <div className="flex justify-between items-center mb-6 border-b border-slate-100 dark:border-white/[0.04] pb-4 shrink-0">
                <h3 className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
                  <Clock size={20} className="text-[#b0ff4c]" /> Sala de Espera (Triaje)
                </h3>
                <span className="text-xs font-bold bg-[#b0ff4c]/20 text-[#b0ff4c] px-3 py-1 rounded-full">
                  {pacientesEnEspera.length} pacientes
                </span>
              </div>
              
              <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar pr-2">
                {pacientesEnEspera.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                    <Clock size={56} className="text-slate-300 dark:text-white/10 mb-4" strokeWidth={1.5} />
                    <p className="text-slate-900 dark:text-white font-bold text-base mb-1">Sala de espera vacía</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-sm leading-relaxed">
                      El departamento de admisión no te ha remitido pacientes nuevos.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pacientesEnEspera.map((consulta) => (
                      <div key={consulta.id} className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0B0D12] hover:border-[#b0ff4c]/50 transition-colors shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-slate-900 dark:text-white text-lg">
                            {consulta.pacientes?.nombres} {consulta.pacientes?.apellidos}
                          </h4>
                          <span className="text-[10px] text-slate-500 font-bold bg-slate-200 dark:bg-white/5 px-2 py-1 rounded-md flex items-center gap-1 border border-slate-300 dark:border-white/5">
                            <Clock size={10} /> Ingresado: {formatearHoraExacta(consulta.fecha_consulta)}
                          </span>
                        </div>
                        <div className="space-y-1 mb-4">
                          <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                            <span className="font-bold text-slate-800 dark:text-slate-300">Triaje:</span> {consulta.signos_vitales}
                          </p>
                          <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                            <span className="font-bold text-slate-800 dark:text-slate-300">Motivo:</span> {consulta.motivo}
                          </p>
                        </div>
                        <div className="flex gap-2 mt-auto pt-2 border-t border-slate-200 dark:border-white/5">
                          <button 
                            onClick={() => setHojaSeleccionada(consulta)}
                            className="w-full bg-[#16161a] hover:bg-black dark:bg-white/5 dark:hover:bg-white/10 text-white py-2.5 rounded-xl text-sm font-bold transition-all border border-slate-700 dark:border-white/10 flex justify-center items-center gap-2"
                          >
                            <FileText size={16} /> Ver Hoja de Admisión
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white dark:bg-[#16161a] border border-slate-200/80 dark:border-white/[0.04] rounded-[2rem] p-8 flex flex-col shadow-sm min-h-[380px]">
              <div className="mb-4 shrink-0">
                <h3 className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white mb-2">
                  <PlayCircle size={20} className="text-rose-500" /> Guía rápida de SOMA
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  Familiarízate con tu nuevo entorno de trabajo. Configura tu consultorio, registra pacientes y potencia tus consultas médicas en pocos pasos.
                </p>
              </div>
              
              <div className="flex-1 relative rounded-2xl overflow-hidden group cursor-pointer border border-slate-200 dark:border-slate-800 bg-[#101216] flex items-center justify-center shadow-inner mt-2">
                <div className="absolute inset-0 opacity-20 bg-gradient-to-br from-emerald-500 to-cyan-500 group-hover:opacity-30 transition-opacity" />
                
                <div className="absolute top-4 left-4 right-4 z-10 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow">S</div>
                  <p className="text-white text-sm font-bold leading-tight drop-shadow mt-1">
                    Crea tus Historias Clínicas. Fácil y Rápido.
                  </p>
                </div>

                  <div 
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                    style={{ backgroundImage: "url('/CE.jpg')" }}
                  ></div>

              </div>
            </div>

          </div>
        </div>
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #3f3f46; border-radius: 10px; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        main > div { animation: fadeIn 0.35s ease-out; }
      `}</style>
    </div>
  );
}