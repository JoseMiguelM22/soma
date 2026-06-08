import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { 
  Home, Users, FileText, Calendar, User, Settings, LogOut, 
  Menu, Sun, Moon, UserPlus, FilePlus, CalendarPlus, Clock, PlayCircle, X, PanelLeft
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

  // Cargar Sesión y Usuario
  useEffect(() => {
    let isMounted = true;

    const fetchUser = async (session) => {
      try {
        const { data: dbUser } = await supabase
          .from('usuarios')
          .select('*')
          .eq('id_auth', session.user.id)
          .single();

        if (isMounted && dbUser) setUserData(dbUser);
        if (isMounted) setLoadingUser(false);
      } catch (error) {
        if (isMounted) setLoadingUser(false);
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) navigate('/login');
      else fetchUser(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) navigate('/login');
      else fetchUser(session);
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

  // Pantalla de Carga
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
  <div className="flex h-screen bg-slate-100 dark:bg-[#090a0f] text-slate-800 dark:text-slate-200 font-sans overflow-hidden transition-colors duration-300 antialiased">
      
      {/* OVERLAY PARA MÓVIL */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm transition-opacity" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* ================= SIDEBAR FLOTANTE Y REDONDEADO ================= */}
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
          {/* Logo SOMA Dinámico */}
          <div className={`h-20 flex items-center transition-all ${isCollapsed ? 'justify-center' : 'justify-between px-6'}`}>
            <Link to="/dashboard" className="flex items-center overflow-hidden whitespace-nowrap">
              {isCollapsed ? (
                <span className="text-emerald-500 text-3xl mb-1 font-black">*</span>
              ) : (
                <>
                  {/* Modo Claro (Logo Negro) */}
                  <img src="/soma_logo.png" alt="SOMA Logo" className="h-6 object-contain block dark:hidden transition-opacity duration-300" />
                  {/* Modo Oscuro (Logo Blanco) */}
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

          {/* Menú: Herramientas */}
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
                <Calendar size={20} className="shrink-0" />
                {!isCollapsed && <span className="whitespace-nowrap text-sm">Estadisticas</span>}
              </Link>
            </nav>
          </div>

          {/* Menú: Configuración */}
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

        {/* Footer del Sidebar */}
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
        
        {/* Header Superior */}
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

        {/* CONTENEDOR INTERNO DEL DASHBOARD */}
        <div className="p-6 sm:p-8 max-w-[1400px] mx-auto w-full space-y-10">
          
          {/* Bienvenida */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
            <div>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                {saludo} Dr. {userData?.apellidos || 'Gómez'}!
              </h2>
            </div>
          </div>

          {/* ================= BOTONES DE ACCIONES RÁPIDAS (ESTILO BLOQUE 3x1) ================= */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Acciones Rápidas</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <Link to="/pacientes" className="flex items-center justify-center gap-3 p-8 bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-[2rem] font-bold transition-all shadow-lg hover:-translate-y-1">
                <UserPlus size={28} />
                <span className="text-xl">Crear Paciente</span>
              </Link>
              
              <Link to="/historias" className="flex items-center justify-center gap-3 p-8 bg-[#10b981] hover:bg-[#059669] text-white rounded-[2rem] font-bold transition-all shadow-lg hover:-translate-y-1">
                <FilePlus size={28} />
                <span className="text-xl">Crear Consulta</span>
              </Link>
              
              <Link to="/agenda" className="flex items-center justify-center gap-3 p-8 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white rounded-[2rem] font-bold transition-all shadow-lg hover:-translate-y-1">
                <CalendarPlus size={28} />
                <span className="text-xl">Agendar Cita</span>
              </Link>

              

            </div>
          </div>

          {/* ================= BLOQUES INFERIORES ================= */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Componente Citas de Hoy */}
            <div className="bg-white dark:bg-[#16161a] border border-slate-200/80 dark:border-white/[0.04] rounded-[2rem] p-8 flex flex-col shadow-sm min-h-[380px]">
              <div className="flex justify-between items-center mb-6 border-b border-slate-100 dark:border-white/[0.04] pb-4 shrink-0">
                <h3 className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
                  <Clock size={20} className="text-slate-400" /> Citas de Hoy
                </h3>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  0 citas
                </span>
              </div>
              
              <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                <Calendar size={56} className="text-slate-300 dark:text-white/20 mb-4" strokeWidth={1.5} />
                <p className="text-slate-900 dark:text-white font-bold text-base mb-1">Sin citas pendientes hoy</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-sm leading-relaxed">
                  Puedes agendar una nueva cita desde el calendario.
                </p>
                <Link to="/agenda" className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white px-8 py-3 rounded-full font-bold text-sm transition-all shadow-md shadow-purple-500/20">
                  Ir a la Agenda
                </Link>
              </div>
            </div>

            {/* Componente Guía Rápida */}
            <div className="bg-white dark:bg-[#16161a] border border-slate-200/80 dark:border-white/[0.04] rounded-[2rem] p-8 flex flex-col shadow-sm min-h-[380px]">
              <div className="mb-4 shrink-0">
                <h3 className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white mb-2">
                  <PlayCircle size={20} className="text-rose-500" /> Guía rápida de SOMA
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  Familiarízate con tu nuevo entorno de trabajo. Configura tu consultorio, registra pacientes y potencia tus consultas médicas en pocos pasos.
                </p>
              </div>
              
              {/* Mock de Miniatura de Video */}
              <div className="flex-1 relative rounded-2xl overflow-hidden group cursor-pointer border border-slate-200 dark:border-slate-800 bg-[#101216] flex items-center justify-center shadow-inner mt-2">
                <div className="absolute inset-0 opacity-20 bg-gradient-to-br from-emerald-500 to-cyan-500 group-hover:opacity-30 transition-opacity" />
                
                <div className="absolute top-4 left-4 right-4 z-10 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow">S</div>
                  <p className="text-white text-sm font-bold leading-tight drop-shadow mt-1">
                    Crea tus Historias Clínicas. Fácil y Rápido.
                  </p>
                </div>

                <div className="relative z-20 w-16 h-12 bg-rose-600 rounded-2xl flex items-center justify-center group-hover:bg-rose-500 transition-colors shadow-lg">
                  <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                </div>

              </div>
            </div>

          </div>
        </div>
      </main>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        main > div { animation: fadeIn 0.35s ease-out; }
      `}</style>
    </div>
  );
}