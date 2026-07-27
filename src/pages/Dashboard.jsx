import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { 
  Home, FileText, Calendar, User, LogOut, 
  Menu, Sun, Moon, PanelLeft, Clock, 
  ChevronDown, FileSignature, ClipboardList, FlaskConical, PlayCircle, X
} from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  
  // ================= ESTADOS DE UI CON MEMORIA (LOCALSTORAGE) =================
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Lee la memoria del navegador para ver qué eligió el usuario la última vez
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'light' ? false : true; // Por defecto es oscuro (true)
  });
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [saludo, setSaludo] = useState('Hola');
  const [showFormatos, setShowFormatos] = useState(false);

  // ================= ESTADOS DE DATOS =================
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [citasEspera, setCitasEspera] = useState([]);

  // Aplicar Modo Oscuro y guardar en memoria
  useEffect(() => { 
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Saludo Dinámico
  useEffect(() => {
    const hora = new Date().getHours();
    if (hora >= 5 && hora < 12) setSaludo('¡Buenos días');
    else if (hora >= 12 && hora < 19) setSaludo('¡Buenas tardes');
    else setSaludo('¡Buenas noches');
  }, []);

  // Carga de Datos del Doctor
  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (!session || sessionError) return navigate('/login');

      // Obtener datos del usuario
      const { data: dbUser } = await supabase.from('usuarios').select('*').eq('id_auth', session.user.id).single();
      setUserData(dbUser);

      // Cargar pacientes en Sala de Espera para este médico específico
      const { data: consultasData } = await supabase
        .from('consultas')
        .select('*, pacientes(nombres, apellidos, cedula)')
        .eq('id_medico', session.user.id)
        .eq('estado', 'En Espera')
        .order('fecha_consulta', { ascending: true });

      if (consultasData) setCitasEspera(consultasData);

    } catch (error) {
      console.error("Error cargando dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [navigate]);

  const handleLogout = async () => { 
    await supabase.auth.signOut(); 
    navigate('/login'); 
  };

  const getInitials = () => { 
    if (!userData) return "DR"; 
    return `${userData.nombres?.charAt(0) || ''}${userData.apellidos?.charAt(0) || ''}`.toUpperCase(); 
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-[#0B0D12] text-slate-800 dark:text-slate-200 font-sans overflow-hidden transition-colors duration-300 antialiased tracking-normal">
      {isSidebarOpen && <div className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />}
      
      {/* ================= SIDEBAR DEL ESPECIALISTA ================= */}
      <aside className={`fixed inset-y-0 left-0 z-50 bg-white dark:bg-[#16161a] border-r border-slate-200/80 dark:border-white/[0.04] flex flex-col justify-between transform transition-all duration-300 ease-in-out md:relative md:translate-x-0 md:m-4 md:mr-0 md:rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none ${isSidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64'} ${isCollapsed ? 'md:w-24' : 'md:w-68'}`}>
        <div>
          <div className={`h-20 flex items-center transition-all ${isCollapsed ? 'justify-center' : 'justify-between px-6'}`}>
            <Link className="flex items-center overflow-hidden whitespace-nowrap" to="/dashboard">
              {isCollapsed ? <span className="text-emerald-500 text-3xl mb-1 font-black">*</span> : <><img src="/soma_logo.png" alt="SOMA Logo" className="h-6 object-contain block dark:hidden" /><img src="/soma_logo_blanco.png" alt="SOMA Logo" className="h-6 object-contain hidden dark:block" /></>}
            </Link>
            {!isCollapsed && <button className="md:hidden text-slate-400 hover:text-rose-500" onClick={() => setIsSidebarOpen(false)}><X size={20}/></button>}
          </div>
          <div className={`py-4 ${isCollapsed ? 'px-3' : 'px-4'}`}>
            {!isCollapsed && <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-3 px-3 tracking-widest uppercase">Herramientas</p>}
            <nav className="space-y-1.5">
              <Link className={`flex items-center gap-3 py-3 bg-emerald-500/10 dark:bg-white/10 text-emerald-600 dark:text-white rounded-xl font-bold transition-all ${isCollapsed ? 'justify-center px-0' : 'px-4'}`} to="/dashboard"><Home className="shrink-0" size={20}/>{!isCollapsed && <span className="text-sm">Inicio</span>}</Link>
              <Link className={`flex items-center gap-3 py-3 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/[0.03] rounded-xl font-medium transition-all ${isCollapsed ? 'justify-center px-0' : 'px-4'}`} to="/historias"><FileText className="shrink-0" size={20}/>{!isCollapsed && <span className="text-sm">Historias Clínicas</span>}</Link>
              <Link className={`flex items-center gap-3 py-3 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/[0.03] rounded-xl font-medium transition-all ${isCollapsed ? 'justify-center px-0' : 'px-4'}`} to="/agenda"><Calendar className="shrink-0" size={20}/>{!isCollapsed && <span className="text-sm">Agenda</span>}</Link>
            </nav>
          </div>
        </div>
       {/* ================= PERFIL DE USUARIO UNIFICADO ================= */}
<div className={`p-4 border-t border-slate-200 dark:border-white/5 flex flex-col ${isCollapsed ? 'items-center' : ''}`}>
  <div className={`flex items-center gap-3 mb-4 ${isCollapsed ? 'justify-center' : 'px-2'}`}>
    <div className="w-8 h-8 shrink-0 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-700 dark:text-white border border-slate-300 dark:border-white/20">
      {userData ? getInitials() : '...'}
    </div>
    {!isCollapsed && (
      <div className="overflow-hidden">
        <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-tight">
          {userData && ['especialista', 'medico', 'médico'].includes((userData.rol || '').toLowerCase()) ? 'ESPECIALISTA' : 'DPTO. HISTORIAS'}
        </p>
        <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight truncate">
          {userData && ['especialista', 'medico', 'médico'].includes((userData.rol || '').toLowerCase()) ? 'Dr(a). ' : ''}{userData ? `${userData.nombres} ${userData.apellidos}` : 'Cargando...'}
        </p>
      </div>
    )}
  </div>
  <button onClick={handleLogout} className={`flex items-center gap-3 py-2 w-full text-slate-500 dark:text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg font-medium transition-colors ${isCollapsed ? 'justify-center px-0' : 'px-3'}`}>
    <LogOut size={20} className="shrink-0" />{!isCollapsed && <span className="whitespace-nowrap">Cerrar Sesión</span>}
  </button>
</div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden w-full relative bg-slate-100 dark:bg-[#050505]">
        
        {/* ================= HEADER ================= */}
        <header className="h-16 flex items-center justify-between px-6 lg:px-8 border-b border-slate-200 dark:border-white/5 bg-white/50 dark:bg-[#111111]/80 backdrop-blur-sm sticky top-0 z-30 shrink-0">
          <div className="flex items-center gap-4">
            <button className="text-slate-500 dark:text-slate-400 hover:text-cyan-600 md:hidden p-2 rounded-xl" onClick={() => setIsSidebarOpen(true)}><Menu size={22}/></button>
            <button className="hidden md:flex p-2.5 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10" onClick={() => setIsCollapsed(!isCollapsed)}><PanelLeft size={18}/></button>
          </div>
          
          {/* BOTÓN MODO OSCURO ARREGLADO */}
          <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2.5 text-slate-400 hover:text-cyan-600 dark:hover:text-yellow-400 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl transition-colors">
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </header>

        <div className="flex-1 overflow-y-auto w-full custom-scrollbar pb-10">
          
          <div className="p-6 sm:p-8 space-y-8 animate-[fadeIn_0.3s_ease-out] max-w-[1400px] mx-auto">
            
            {/* ================= SALUDO Y MASCOTA ================= */}
            <div className="flex flex-row items-center justify-between gap-4">
              <div className="flex-1">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.1]">
                  {saludo} <br className="hidden sm:block" /> Dr(a). {userData?.apellidos || ''}!
                </h2>
              </div>
              <div className="shrink-0">
                <img src="/ruta-mascota-doctora-der.svg" alt="Mascota SOMA" className="w-20 sm:w-28 md:w-32 drop-shadow-[0_10px_15px_rgba(0,0,0,0.3)] pointer-events-none transition-transform hover:scale-105" />
              </div>
            </div>

            {/* ================= ACCIONES RÁPIDAS (MENÚ DESPLEGABLE) ================= */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Acciones Rápidas</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full relative">
                
                {/* 1. BOTÓN AZUL: MENU DESPLEGABLE DE REDACCIÓN */}
                <div className="relative w-full">
                  <button 
                    onClick={() => setShowFormatos(!showFormatos)} 
                    className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-[#3b82f6] hover:bg-[#2563eb] text-white rounded-xl font-bold shadow-md hover:-translate-y-1 transition-transform"
                  >
                    <FileSignature size={20}/> <span className="text-sm sm:text-base">Acciones Médicas</span> <ChevronDown size={18} className={`transition-transform ${showFormatos ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {showFormatos && (
                    <div className="absolute top-full left-0 mt-2 w-full bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl overflow-hidden z-50 animate-[fadeIn_0.2s_ease-out]">
                       <div className="px-4 py-3 border-b border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-[#111111]">
                         <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">¿Qué deseas redactar?</span>
                       </div>
                       
                       <button onClick={() => navigate('/historias')} className="w-full text-left px-5 py-4 border-t border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors flex flex-col gap-1 border-l-4 border-transparent hover:border-[#3b82f6]">
                         <div className="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-white">
                           <FlaskConical size={16} className="text-[#3b82f6]"/> Emitir Récipe e Indicaciones
                         </div>
                         <p className="text-[11px] text-slate-500 dark:text-slate-400 pl-6">Genera récipe en PDF con tu firma.</p>
                       </button>

                       <button onClick={() => navigate('/historias')} className="w-full text-left px-5 py-4 border-t border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors flex flex-col gap-1 border-l-4 border-transparent hover:border-[#3b82f6]">
                         <div className="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-white">
                           <FileText size={16} className="text-[#3b82f6]"/> Constancia / Informe
                         </div>
                         <p className="text-[11px] text-slate-500 dark:text-slate-400 pl-6">Redacta reposos médicos y constancias.</p>
                       </button>
                    </div>
                  )}
                </div>

                {/* 2. BOTÓN VERDE: HISTORIAS REMITIDAS */}
                <button onClick={() => navigate('/historias')} className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-[#10b981] hover:bg-[#059669] text-white rounded-xl font-bold shadow-md hover:-translate-y-1 transition-transform">
                  <FileText size={20} /> <span className="text-sm sm:text-base">Historias Remitidas</span>
                </button>

                {/* 3. BOTÓN MORADO: MI AGENDA */}
                <button onClick={() => navigate('/agenda')} className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white rounded-xl font-bold shadow-md hover:-translate-y-1 transition-transform">
                  <Calendar size={20} /> <span className="text-sm sm:text-base">Mi Agenda</span>
                </button>
              </div>
            </div>

            {/* ================= TARJETAS INFERIORES ================= */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* PANEL SALA DE ESPERA (REMITIDAS) */}
              <div className="bg-white dark:bg-[#16161a] border border-slate-200 dark:border-white/[0.04] rounded-[2rem] p-8 flex flex-col shadow-sm min-h-[380px] max-h-[500px]">
                <div className="flex justify-between items-center mb-6 border-b border-slate-100 dark:border-white/[0.04] pb-4 shrink-0">
                  <h3 className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white"><Clock className="text-[#10b981]" size={20}/> Historias Remitidas (Sala Espera)</h3>
                  <span className="text-xs font-bold bg-[#10b981]/20 text-[#10b981] px-3 py-1 rounded-full">{citasEspera.length} pacientes</span>
                </div>
                <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar pr-2">
                  {citasEspera.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                      <Clock className="text-slate-300 dark:text-white/10 mb-4" size={56}/>
                      <p className="text-slate-900 dark:text-white font-bold text-base mb-1">Sala de espera vacía</p>
                      <p className="text-slate-500 text-sm">No tienes pacientes pendientes por el momento.</p>
                    </div>
                  ) : (
                    <div className="space-y-4 pb-4">
                      {citasEspera.map((cita) => (
                        <div key={cita.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0B0D12] flex items-center justify-between gap-4">
                          <div>
                            <h4 className="font-bold text-slate-900 dark:text-white text-sm truncate">{cita.pacientes?.nombres} {cita.pacientes?.apellidos}</h4>
                            <p className="text-xs text-slate-500 mt-1">Motivo: {cita.motivo}</p>
                          </div>
                          <button onClick={() => navigate('/historias')} className="bg-[#10b981] hover:bg-[#059669] text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors">
                            Atender
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* PANEL GUÍA RÁPIDA */}
              <div className="bg-white dark:bg-[#16161a] border border-slate-200 dark:border-white/[0.04] rounded-[2rem] p-8 flex flex-col shadow-sm">
                <div className="mb-4">
                  <h3 className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white"><PlayCircle className="text-rose-500" size={20}/> Guía rápida de SOMA</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Familiarízate con tu nuevo entorno de trabajo. Configura tu consultorio y potencia tus consultas médicas en pocos pasos.</p>
                </div>
                <div className="flex-1 bg-slate-100 dark:bg-[#0B0D12] border border-slate-200 dark:border-white/5 rounded-xl overflow-hidden flex items-center justify-center relative group cursor-pointer">
                  <img src="/CE.jpg" alt="Guía" className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-30 transition-opacity" onError={(e) => e.target.style.display = 'none'} />
                  <PlayCircle size={48} className="text-slate-700 dark:text-white opacity-80 group-hover:scale-110 transition-transform relative z-10" />
                  
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #3f3f46; border-radius: 10px; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}