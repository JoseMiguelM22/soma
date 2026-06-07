import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { 
  Home, Users, FileText, Calendar, User, Settings, LogOut, 
  Menu, Sun, Moon, UserPlus, FilePlus, CalendarPlus, Clock, PlayCircle, X, PanelLeft,
  ArrowRight, Activity, DollarSign
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
  const [stats, setStats] = useState({ pacientes: 0, historias: 0 });
  const [saludo, setSaludo] = useState('Hola');

  // Aplicar Modo Oscuro al HTML
  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDarkMode]);

  // Obtener la hora para el saludo dinámico
  useEffect(() => {
    const hora = new Date().getHours();
    if (hora >= 5 && hora < 12) setSaludo('¡Buenos días');
    else if (hora >= 12 && hora < 19) setSaludo('¡Buenas tardes');
    else setSaludo('¡Buenas noches');
  }, []);

  // Cargar Sesión, Usuario y Estadísticas (Con protección anti-bugs de carga)
  useEffect(() => {
    let isMounted = true;

    const fetchAllData = async (session) => {
      try {
        // 1. Datos del usuario
        const { data: dbUser } = await supabase
          .from('usuarios')
          .select('*')
          .eq('id_auth', session.user.id)
          .single();

        if (isMounted && dbUser) setUserData(dbUser);

        // 2. Contar Pacientes
        const { count: countPacientes } = await supabase
          .from('pacientes')
          .select('*', { count: 'exact', head: true })
          .eq('id_medico', session.user.id);

        // 3. Contar Historias (Consultas)
        const { count: countHistorias } = await supabase
          .from('consultas')
          .select('*', { count: 'exact', head: true })
          .eq('id_medico', session.user.id);

        if (isMounted) {
          setStats({
            pacientes: countPacientes || 0,
            historias: countHistorias || 0
          });
          setLoadingUser(false);
        }

      } catch (error) {
        console.error("Error cargando datos:", error);
        if (isMounted) setLoadingUser(false);
      }
    };

    // Verificar sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate('/login');
      } else {
        fetchAllData(session);
      }
    });

    // Escuchar cambios de sesión (ESTO ARREGLA EL BUG DE TENER QUE RECARGAR)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) navigate('/login');
      else fetchAllData(session);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) navigate('/login');
  };

  const getInitials = () => {
    if (!userData || !userData.nombres || !userData.apellidos) return "DR";
    return `${userData.nombres.charAt(0)}${userData.apellidos.charAt(0)}`.toUpperCase();
  };

  // Si está cargando por primera vez, mostramos un spinner bonito a pantalla completa
  if (loadingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0a0a0a]">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-cyan-100 dark:border-slate-800 border-t-cyan-500 rounded-full animate-spin mb-4"></div>
          <p className="text-slate-500 dark:text-slate-400 font-bold animate-pulse">Cargando tu consultorio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-[#0a0a0a] text-slate-800 dark:text-slate-200 font-sans overflow-hidden transition-colors duration-300">
      
      {/* OVERLAY PARA MÓVIL */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm transition-opacity" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* ================= SIDEBAR ================= */}
      <aside className={`fixed inset-y-0 left-0 z-50 bg-white dark:bg-[#111111] border-r border-slate-200 dark:border-white/5 flex flex-col justify-between transform transition-all duration-300 ease-in-out md:relative md:translate-x-0 w-64 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} ${isCollapsed ? 'md:w-20' : 'md:w-64'}`}>
        <div>
          <div className={`h-16 flex items-center border-b border-slate-200 dark:border-white/5 transition-all ${isCollapsed ? 'justify-center' : 'justify-between px-6'}`}>
            <h1 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2 tracking-widest overflow-hidden whitespace-nowrap">
              <span className="text-cyan-600 dark:text-cyan-400 text-2xl">*</span>
              {!isCollapsed && <span>SOMA</span>}
            </h1>
            {!isCollapsed && (<button className="md:hidden text-slate-500 hover:text-rose-500" onClick={() => setIsSidebarOpen(false)}><X size={24} /></button>)}
          </div>

          <div className={`py-6 ${isCollapsed ? 'px-2' : 'px-4'}`}>
            {!isCollapsed && <p className="text-xs font-bold text-slate-400 dark:text-slate-500 mb-4 px-2 tracking-widest">HERRAMIENTAS</p>}
            <nav className="space-y-2">
              <Link to="/dashboard" className={`flex items-center gap-3 py-2.5 bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-400 rounded-lg font-bold transition-colors ${isCollapsed ? 'justify-center px-0' : 'px-3'}`}>
                <Home size={20} className="shrink-0" />{!isCollapsed && <span className="whitespace-nowrap">Inicio</span>}
              </Link>
              <Link to="/pacientes" className={`flex items-center gap-3 py-2.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg font-medium transition-colors ${isCollapsed ? 'justify-center px-0' : 'px-3'}`}>
                <Users size={20} className="shrink-0" />{!isCollapsed && <span className="whitespace-nowrap">Pacientes</span>}
              </Link>
              <Link to="/historias" className={`flex items-center gap-3 py-2.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg font-medium transition-colors ${isCollapsed ? 'justify-center px-0' : 'px-3'}`}>
                <FileText size={20} className="shrink-0" />{!isCollapsed && <span className="whitespace-nowrap">Historias Clínicas</span>}
              </Link>
              <Link to="/agenda" className={`flex items-center gap-3 py-2.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg font-medium transition-colors ${isCollapsed ? 'justify-center px-0' : 'px-3'}`}>
                <Calendar size={20} className="shrink-0" />{!isCollapsed && <span className="whitespace-nowrap">Agenda</span>}
              </Link>
            </nav>
          </div>

          <div className={isCollapsed ? 'px-2' : 'px-4'}>
            {!isCollapsed && <p className="text-xs font-bold text-slate-400 dark:text-slate-500 mb-4 px-2 tracking-widest mt-4">CONFIGURACIÓN</p>}
            <nav className="space-y-2">
              <Link to="/perfil" className={`flex items-center gap-3 py-2.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg font-medium transition-colors ${isCollapsed ? 'justify-center px-0' : 'px-3'}`}>
                <User size={20} className="shrink-0" />{!isCollapsed && <span className="whitespace-nowrap">Mi perfil</span>}
              </Link>
              <Link to="/ajustes" className={`flex items-center gap-3 py-2.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg font-medium transition-colors ${isCollapsed ? 'justify-center px-0' : 'px-3'}`}>
                <Settings size={20} className="shrink-0" />{!isCollapsed && <span className="whitespace-nowrap">Ajustes</span>}
              </Link>
            </nav>
          </div>
        </div>

        <div className={`p-4 border-t border-slate-200 dark:border-white/5 flex flex-col ${isCollapsed ? 'items-center' : ''}`}>
          <div className={`flex items-center gap-3 mb-4 ${isCollapsed ? 'justify-center' : 'px-2'}`}>
            <div className="w-8 h-8 shrink-0 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-700 dark:text-white">
              {getInitials()}
            </div>
            {!isCollapsed && (
              <div className="overflow-hidden">
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-tight">Médico</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight truncate">
                  {userData?.nombres} {userData?.apellidos}
                </p>
              </div>
            )}
          </div>
          <button onClick={handleLogout} className={`flex items-center gap-3 py-2 w-full text-slate-500 dark:text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg font-medium transition-colors ${isCollapsed ? 'justify-center px-0' : 'px-3'}`}>
            <LogOut size={20} className="shrink-0" />{!isCollapsed && <span className="whitespace-nowrap">Cerrar Sesión</span>}
          </button>
        </div>
      </aside>

      {/* ================= CONTENIDO PRINCIPAL ================= */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto w-full relative">
        
        {/* Header Superior */}
        <header className="h-16 flex items-center justify-between px-6 lg:px-8 border-b border-slate-200 dark:border-white/5 bg-white/50 dark:bg-transparent backdrop-blur-sm sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button className="text-slate-500 hover:text-cyan-600 md:hidden" onClick={() => setIsSidebarOpen(true)}><Menu size={24} /></button>
            <button className="hidden md:flex p-2 text-slate-400 hover:text-cyan-600 rounded-xl bg-slate-100 dark:bg-white/5" onClick={() => setIsCollapsed(!isCollapsed)}><PanelLeft size={20} /></button>
          </div>
          <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 text-slate-400 hover:text-yellow-400 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </header>

        {/* CONTENEDOR DASHBOARD */}
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          
          {/* Bienvenida y Badge */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-8 gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
                {saludo}, Dr. {userData?.apellidos}!
              </h2>
              <p className="text-slate-500 dark:text-slate-400 mt-1 sm:mt-2 text-sm sm:text-base">
                Aquí tienes un resumen de tu actividad en SOMA.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 text-amber-700 dark:text-amber-500 px-3 py-1.5 rounded-full text-xs font-bold shrink-0 w-fit">
              <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
              Plan Gratuito Activo
            </div>
          </div>

          {/* ================= GRADAS DE ESTADÍSTICAS TIPO GALÉNICOS ================= */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-10">
            
            {/* Tarjeta 1: Pacientes */}
            <div className="bg-white dark:bg-[#111111] border border-slate-200 dark:border-white/5 p-6 rounded-2xl shadow-sm relative overflow-hidden group">
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-50 dark:bg-blue-900/20 rounded-full transition-transform group-hover:scale-110"></div>
              <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-1 relative z-10">Total pacientes <span className="text-xs font-normal text-slate-400">(General)</span></p>
              <h3 className="text-4xl font-black text-slate-900 dark:text-white mb-4 relative z-10">{stats.pacientes}</h3>
              <div className="flex justify-between items-end relative z-10">
                <Link to="/pacientes" className="text-blue-600 dark:text-blue-400 text-sm font-bold flex items-center gap-1 hover:gap-2 transition-all">
                  Ver pacientes <ArrowRight size={14} />
                </Link>
                <Users size={24} className="text-blue-200 dark:text-blue-900/50" />
              </div>
            </div>

            {/* Tarjeta 2: Historias */}
            <div className="bg-white dark:bg-[#111111] border border-slate-200 dark:border-white/5 p-6 rounded-2xl shadow-sm relative overflow-hidden group">
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-purple-50 dark:bg-purple-900/20 rounded-full transition-transform group-hover:scale-110"></div>
              <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-1 relative z-10">Historias creadas <span className="text-xs font-normal text-slate-400">(General)</span></p>
              <h3 className="text-4xl font-black text-slate-900 dark:text-white mb-4 relative z-10">{stats.historias}</h3>
              <div className="flex justify-between items-end relative z-10">
                <Link to="/historias" className="text-purple-600 dark:text-purple-400 text-sm font-bold flex items-center gap-1 hover:gap-2 transition-all">
                  Ver historias <ArrowRight size={14} />
                </Link>
                <FileText size={24} className="text-purple-200 dark:text-purple-900/50" />
              </div>
            </div>

            {/* Tarjeta 3: Ingresos (Simulada para mantener el diseño) */}
            <div className="bg-white dark:bg-[#111111] border border-slate-200 dark:border-white/5 p-6 rounded-2xl shadow-sm relative overflow-hidden group">
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-50 dark:bg-emerald-900/20 rounded-full transition-transform group-hover:scale-110"></div>
              <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-1 relative z-10">Ingresos facturados <span className="text-xs font-normal text-slate-400">últimos 7 días</span></p>
              <h3 className="text-4xl font-black text-slate-900 dark:text-white mb-4 relative z-10">$0,00</h3>
              <div className="flex justify-between items-end relative z-10">
                <span className="text-emerald-600 dark:text-emerald-400 text-sm font-bold flex items-center gap-1 cursor-not-allowed opacity-70">
                  Ver facturas <ArrowRight size={14} />
                </span>
                <DollarSign size={24} className="text-emerald-200 dark:text-emerald-900/50" />
              </div>
            </div>

          </div>

          {/* ================= ACCIONES RÁPIDAS (Tus botones coloridos) ================= */}
          <div className="mb-10">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Acciones Rápidas</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              
              <Link to="/pacientes" className="flex items-center justify-center sm:justify-start px-6 py-4 gap-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold text-base transition-all transform hover:-translate-y-1 shadow-lg shadow-blue-500/20">
                <UserPlus size={22} className="shrink-0" />
                <span>Crear Paciente</span>
              </Link>
              
              <Link to="/historias" className="flex items-center justify-center sm:justify-start px-6 py-4 gap-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-base transition-all transform hover:-translate-y-1 shadow-lg shadow-emerald-500/20">
                <FilePlus size={22} className="shrink-0" />
                <span>Crear Consulta</span>
              </Link>
              
              <Link to="/agenda" className="flex items-center justify-center sm:justify-start px-6 py-4 gap-3 bg-violet-500 hover:bg-violet-600 text-white rounded-xl font-bold text-base transition-all transform hover:-translate-y-1 shadow-lg shadow-violet-500/20">
                <CalendarPlus size={22} className="shrink-0" />
                <span>Agendar Cita</span>
              </Link>

            </div>
          </div>

          {/* ================= GRILLA INFERIOR (Citas y Video) ================= */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Widget: Citas de Hoy */}
            <div className="bg-white dark:bg-[#111111] border border-slate-200 dark:border-white/5 rounded-2xl p-6 flex flex-col shadow-sm h-[350px]">
              <div className="flex justify-between items-center mb-6 border-b border-slate-100 dark:border-white/5 pb-4 shrink-0">
                <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                  <Clock size={18} className="text-slate-400" /> Citas de Hoy
                </h3>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 px-3 py-1 rounded-full">
                  0 citas
                </span>
              </div>
              
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <Calendar size={56} className="text-slate-200 dark:text-slate-700 mb-4" strokeWidth={1} />
                <p className="text-slate-800 dark:text-white font-bold mb-1">Sin citas pendientes hoy</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-xs">
                  Puedes agendar una nueva cita desde el calendario.
                </p>
                <Link to="/agenda" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-lg font-bold text-sm transition-colors shadow-md shadow-blue-500/20">
                  Ir a la Agenda
                </Link>
              </div>
            </div>

            {/* Widget: Guía Rápida (Simulando un Video de YouTube) */}
            <div className="bg-white dark:bg-[#111111] border border-slate-200 dark:border-white/5 rounded-2xl p-6 flex flex-col shadow-sm h-[350px]">
              <div className="mb-4 shrink-0">
                <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white mb-2">
                  <PlayCircle size={18} className="text-rose-500" /> Guía rápida de SOMA
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  Familiarízate con tu nuevo entorno de trabajo. Configura tu consultorio, registra pacientes y potencia tus consultas médicas en pocos pasos.
                </p>
              </div>
              
              {/* Contenedor tipo "Video Thumbnail" */}
              <div className="flex-1 mt-2 relative rounded-xl overflow-hidden group cursor-pointer border border-slate-200 dark:border-slate-700 bg-slate-800 flex items-center justify-center">
                
                {/* Imagen de fondo difuminada para simular el video */}
                <div className="absolute inset-0 opacity-40 bg-gradient-to-br from-cyan-900 to-slate-900"></div>
                
                {/* Textos sobre el video falso */}
                <div className="absolute top-4 left-4 right-4 z-10 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-cyan-600 flex items-center justify-center text-white font-bold text-xs shrink-0">S</div>
                  <p className="text-white text-sm font-bold leading-tight drop-shadow-md">
                    03. ¿Cómo crear una historia clínica digital? | Software Médico para consultorios
                  </p>
                </div>

                {/* Botón de Play Rojo */}
                <div className="relative z-20 w-16 h-11 bg-red-600 rounded-xl flex items-center justify-center group-hover:bg-red-500 transition-colors shadow-lg">
                  <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                </div>

                {/* Barra inferior del video */}
                <div className="absolute bottom-4 right-4 z-10">
                  <span className="bg-black/70 text-white text-xs px-3 py-1.5 rounded-full font-medium backdrop-blur-sm flex items-center gap-1.5 hover:bg-black/90 transition-colors">
                    Mirar en <span className="font-bold">YouTube</span>
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Estilos para animaciones */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        main > div { animation: fadeIn 0.4s ease-out; }
      `}</style>
    </div>
  );
}