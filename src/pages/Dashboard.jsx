import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { 
  Home, Users, FileText, Calendar, User, Settings, LogOut, 
  Menu, Sun, Moon, UserPlus, FilePlus, CalendarPlus, Clock, PlayCircle, X
} from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  
  // Estados para controlar el Modo Oscuro y el Menú Móvil
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Estados para el usuario
  const [userData, setUserData] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // Efecto para inyectar/quitar la clase 'dark' en el HTML general
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Efecto para obtener la sesión y los datos del usuario
  useEffect(() => {
    const fetchSessionAndUser = async () => {
      // 1. Obtener la sesión actual
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (!session || sessionError) {
        // Si no hay sesión, lo mandamos al login
        navigate('/login');
        return;
      }

      // 2. Buscar los datos extras del médico en la tabla 'usuarios'
      const { data: dbUser, error: dbError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id_auth', session.user.id)
        .single(); // single() porque solo esperamos 1 registro

      if (dbUser && !dbError) {
        setUserData(dbUser);
      }
      
      setLoadingUser(false);
    };

    fetchSessionAndUser();
  }, [navigate]);

  // Función para cerrar sesión
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      navigate('/login');
    } else {
      console.error("Error al cerrar sesión:", error.message);
    }
  };

  // Función auxiliar para obtener iniciales
  const getInitials = () => {
    if (!userData || !userData.nombres || !userData.apellidos) return "DR";
    return `${userData.nombres.charAt(0)}${userData.apellidos.charAt(0)}`.toUpperCase();
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-[#0a0a0a] text-slate-800 dark:text-slate-200 font-sans overflow-hidden transition-colors duration-300">
      
      {/* OVERLAY FONDO OSCURO PARA MÓVIL */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR (Menú Lateral) */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-[#111111] border-r border-slate-200 dark:border-white/5 flex flex-col justify-between
        transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div>
          {/* Logo SOMA & Botón Cerrar (Solo Móvil) */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200 dark:border-white/5">
            <h1 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2 tracking-widest">
              <span className="text-cyan-600 dark:text-cyan-400 text-2xl">*</span> SOMA
            </h1>
            <button 
              className="md:hidden text-slate-500 hover:text-rose-500 transition-colors"
              onClick={() => setIsSidebarOpen(false)}
            >
              <X size={24} />
            </button>
          </div>

          {/* Menú Herramientas */}
          <div className="px-4 py-6">
            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 mb-4 px-2 tracking-widest">HERRAMIENTAS</p>
            <nav className="space-y-1">
              <a href="#" className="flex items-center gap-3 px-3 py-2.5 bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-400 rounded-lg font-bold transition-colors">
                <Home size={18} /> Inicio
              </a>
              <a href="#" className="flex items-center gap-3 px-3 py-2.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg font-medium transition-colors">
                <Users size={18} /> Pacientes
              </a>
              <a href="#" className="flex items-center gap-3 px-3 py-2.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg font-medium transition-colors">
                <FileText size={18} /> Historias Clínicas
              </a>
              <a href="#" className="flex items-center gap-3 px-3 py-2.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg font-medium transition-colors">
                <Calendar size={18} /> Agenda
              </a>
            </nav>
          </div>

          {/* Menú Configuración */}
          <div className="px-4">
            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 mb-4 px-2 tracking-widest">CONFIGURACIÓN</p>
            <nav className="space-y-1">
              <a href="#" className="flex items-center gap-3 px-3 py-2.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg font-medium transition-colors">
                <User size={18} /> Mi perfil
              </a>
              <a href="#" className="flex items-center gap-3 px-3 py-2.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg font-medium transition-colors">
                <Settings size={18} /> Ajustes
              </a>
            </nav>
          </div>
        </div>

        {/* Perfil Inferior y Cerrar Sesión */}
        <div className="p-4 border-t border-slate-200 dark:border-white/5">
          <div className="flex items-center gap-3 px-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-700 dark:text-white">
              {loadingUser ? '...' : getInitials()}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-tight">Médico</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight truncate">
                {loadingUser ? 'Cargando...' : `${userData?.nombres || ''} ${userData?.apellidos || ''}`}
              </p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 w-full text-slate-500 dark:text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg font-medium transition-colors"
          >
            <LogOut size={18} /> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto w-full">
        
        {/* Header Superior */}
        <header className="h-16 flex items-center justify-between px-6 lg:px-8 border-b border-slate-200 dark:border-white/5 bg-white/50 dark:bg-transparent backdrop-blur-sm sticky top-0 z-30">
          <button 
            className="text-slate-500 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-white transition-colors md:hidden"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu size={24} />
          </button>
          
          <div className="flex-1 md:flex-none"></div>

          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 text-slate-400 hover:text-cyan-600 dark:hover:text-yellow-400 transition-colors bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </header>

        {/* Contenedor del Dashboard */}
        <div className="p-6 lg:p-8 max-w-6xl mx-auto w-full">
          
          {/* Bienvenida */}
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
              Hola, <br className="md:hidden" /> {loadingUser ? 'Doctor...' : `Dr. ${userData?.nombres || ''}!`}
            </h2>
            <div className="text-5xl hidden sm:block">👨🏻‍⚕️</div>
          </div>

          {/* Acciones Rápidas */}
          <div className="mb-8">
            <h3 className="text-sm font-bold text-slate-700 dark:text-white mb-4">Acciones Rápidas</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <button className="flex items-center gap-3 bg-blue-500 hover:bg-blue-600 text-white p-4 lg:p-5 rounded-xl font-bold transition-all transform hover:-translate-y-1 shadow-lg shadow-blue-500/20">
                <UserPlus size={24} /> Crear Paciente
              </button>
              <button className="flex items-center gap-3 bg-emerald-500 hover:bg-emerald-600 text-white p-4 lg:p-5 rounded-xl font-bold transition-all transform hover:-translate-y-1 shadow-lg shadow-emerald-500/20">
                <FilePlus size={24} /> Crear Consulta
              </button>
              <button className="flex items-center gap-3 bg-cyan-600 hover:bg-cyan-700 text-white p-4 lg:p-5 rounded-xl font-bold transition-all transform hover:-translate-y-1 shadow-lg shadow-cyan-500/20 sm:col-span-2 md:col-span-1">
                <CalendarPlus size={24} /> Agendar Cita
              </button>
            </div>
          </div>

          {/* Grilla Inferior */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Widget: Citas de Hoy */}
            <div className="bg-white dark:bg-[#111111] border border-slate-200 dark:border-white/5 rounded-2xl p-6 flex flex-col shadow-sm">
              <div className="flex justify-between items-center mb-12 border-b border-slate-100 dark:border-white/5 pb-4">
                <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                  <Clock size={16} className="text-cyan-600 dark:text-cyan-400" /> Citas de Hoy
                </h3>
                <span className="text-xs font-medium text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-white/5 px-2 py-1 rounded-md">0 citas</span>
              </div>
              
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <Calendar size={48} className="text-slate-300 dark:text-slate-600 mb-4" strokeWidth={1.5} />
                <p className="text-slate-800 dark:text-white font-bold mb-1">Sin citas pendientes hoy</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-xs">Puedes agendar una nueva cita desde el calendario.</p>
                <button className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-2.5 rounded-lg font-bold text-sm transition-colors shadow-md shadow-cyan-500/20">
                  Ir a la Agenda
                </button>
              </div>
            </div>

            {/* Widget: Guía Rápida */}
            <div className="bg-white dark:bg-[#111111] border border-slate-200 dark:border-white/5 rounded-2xl p-6 flex flex-col shadow-sm">
              <div className="mb-6">
                <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white mb-2">
                  <PlayCircle size={16} className="text-rose-500 dark:text-rose-400" /> Guía rápida de SOMA
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  Familiarízate con tu nuevo entorno de trabajo. Configura tu consultorio, registra pacientes y potencia tus consultas médicas en pocos pasos.
                </p>
              </div>
              
              <div className="flex-1 bg-slate-50 dark:bg-[#1a1a1a] rounded-xl border border-slate-200 dark:border-white/5 flex flex-col items-center justify-center p-8 text-center mt-4">
                <h4 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
                  Crea tus <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 px-2 py-0.5 rounded">Historias Clínicas</span>
                </h4>
                <p className="text-xl font-bold text-slate-800 dark:text-white">Fácil y rápido</p>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}