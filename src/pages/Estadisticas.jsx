import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { 
  Home, Users, FileText, Calendar, User, Settings, LogOut, 
  Menu, Sun, Moon, X, PanelLeft, Activity, Info, Users as UsersIcon, PieChart
} from 'lucide-react';

export default function Estadisticas() {
  const navigate = useNavigate();
  
  // ================= ESTADOS DE UI =================
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // ================= ESTADOS DE DATOS =================
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [totalPacientes, setTotalPacientes] = useState(0);
  
  // Estado Civil (Datos Reales de la BD)
  const [estadoCivilData, setEstadoCivilData] = useState({
    ninguno: 0, soltero: 0, casado: 0, viudo: 0, fallecido: 0
  });

  // Datos Mockeados para "Tipo de referido" (Para mantener el diseño de la imagen)
  const referidosData = [
    { label: 'Búsqueda de Google', color: '#2563eb', value: 35 },
    { label: 'Instagram', color: '#e11d48', value: 25 },
    { label: 'WhatsApp', color: '#10b981', value: 20 },
    { label: 'Facebook', color: '#1d4ed8', value: 10 },
    { label: 'Ninguno', color: '#ef4444', value: 10 },
  ];

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDarkMode]);

  // ================= CARGA DE DATOS =================
  useEffect(() => {
    let isMounted = true;

    const fetchData = async (session) => {
      try {
        // 1. Datos del Usuario
        const { data: dbUser } = await supabase.from('usuarios').select('*').eq('id_auth', session.user.id).single();
        if (isMounted && dbUser) setUserData(dbUser);

        // 2. Traer Pacientes para Estadísticas (USAMOS '*' PARA EVITAR ERRORES SI FALTA LA COLUMNA)
        const { data: pacientes, error: errorPacientes } = await supabase
          .from('pacientes')
          .select('*')
          .eq('id_medico', session.user.id);
        
        if (errorPacientes) {
          console.error("Error cargando pacientes en estadísticas:", errorPacientes);
        }
        
        if (isMounted && pacientes) {
          setTotalPacientes(pacientes.length);
          
          // Procesar Estado Civil de forma segura
          let counts = { ninguno: 0, soltero: 0, casado: 0, viudo: 0, fallecido: 0 };
          pacientes.forEach(p => {
            // Si la columna no existe o está vacía, p.estado_civil será undefined o null
            if (p.estado_civil === 'Soltero/a') counts.soltero += 1;
            else if (p.estado_civil === 'Casado/a') counts.casado += 1;
            else counts.ninguno += 1; // "No especificado" o vacíos
          });
          setEstadoCivilData(counts);
        }

        if (isMounted) setLoading(false);
      } catch (error) {
        console.error("Error fatal:", error);
        if (isMounted) setLoading(false);
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) navigate('/login');
      else fetchData(session);
    });
    
    return () => { isMounted = false; };
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const getInitials = () => {
    if (!userData || !userData.nombres || !userData.apellidos) return "DR";
    return `${userData.nombres.charAt(0)}${userData.apellidos.charAt(0)}`.toUpperCase();
  };

  // Funciones Matemáticas para los Gráficos CSS
  const calcCivilGradient = () => {
    const total = totalPacientes || 1; // Evitar división por cero
    const pN = (estadoCivilData.ninguno / total) * 100;
    const pS = (estadoCivilData.soltero / total) * 100;
    const pC = (estadoCivilData.casado / total) * 100;
    
    return `conic-gradient(
      #ef4444 0% ${pN}%, 
      #2563eb ${pN}% ${pN + pS}%, 
      #db2777 ${pN + pS}% ${pN + pS + pC}%, 
      #10b981 ${pN + pS + pC}% 100%
    )`;
  };

  const calcReferidosGradient = () => {
    // Calculamos sobre 50% porque es un semicírculo
    let gradient = "conic-gradient(from 270deg, ";
    let currentPercent = 0;
    
    referidosData.forEach((item, index) => {
      const step = item.value / 2; // Dividir entre 2 porque 100% visual = 50% real del círculo
      gradient += `${item.color} ${currentPercent}% ${currentPercent + step}%, `;
      currentPercent += step;
    });
    
    gradient += `transparent 50% 100%)`;
    return gradient;
  };

  // Pantalla de Carga
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0a0a0a]">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-cyan-100 dark:border-slate-800 border-t-cyan-500 rounded-full animate-spin mb-4"></div>
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
        `}
      >
        <div>
          {/* Logo SOMA Dinámico */}
          <div className={`h-20 flex items-center transition-all ${isCollapsed ? 'justify-center' : 'justify-between px-6'}`}>
            <Link to="/dashboard" className="flex items-center overflow-hidden whitespace-nowrap">
              {isCollapsed ? (
                <span className="text-emerald-500 text-3xl mb-1 font-black">*</span>
              ) : (
                <>
                  <img src="/soma_logo.jpg" alt="SOMA Logo" className="h-6 object-contain block dark:hidden transition-opacity duration-300" />
                  <img src="/soma_logo_blanco.jpg" alt="SOMA Logo" className="h-6 object-contain hidden dark:block transition-opacity duration-300" />
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
              <Link to="/dashboard" className={`flex items-center gap-3 py-3 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/[0.03] rounded-xl font-medium transition-all ${isCollapsed ? 'justify-center px-0' : 'px-4'}`}>
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
              <Link to="/estadisticas" className={`flex items-center gap-3 py-3 bg-emerald-500/10 dark:bg-white/10 text-emerald-600 dark:text-white rounded-xl font-bold transition-all ${isCollapsed ? 'justify-center px-0' : 'px-4'}`}>
                <Activity size={20} className="shrink-0" />
                {!isCollapsed && <span className="whitespace-nowrap text-sm">Estadísticas</span>}
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

        {/* CONTENEDOR INTERNO */}
        <div className="p-6 sm:p-8 max-w-[1400px] mx-auto w-full space-y-6 animate-[fadeIn_0.3s_ease-out]">
          
          {/* Cabecera Principal */}
          <div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
              Reportes y Estadísticas
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Visualiza y analiza la información demográfica y clínica de tus pacientes a simple vista.
            </p>
          </div>

          {/* ================= BLOQUE SUPERIOR (TOTAL Y BANNER) ================= */}
          <div className="flex flex-col md:flex-row gap-6 mt-8">
            
            {/* Tarjeta: Total Pacientes */}
            <div className="w-full md:w-1/3 bg-white dark:bg-[#16161a] rounded-[2rem] p-8 flex flex-col justify-center shadow-md border border-slate-200 dark:border-white/[0.04]">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-blue-500 flex items-center justify-center">
                  <UsersIcon size={24} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total</p>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Pacientes</p>
                </div>
              </div>
              <h3 className="text-6xl font-black text-slate-900 dark:text-white tracking-tighter">
                {totalPacientes}
              </h3>
            </div>

            {/* Banner Analisis */}
            <div className="w-full md:w-2/3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[2rem] p-8 md:p-10 relative overflow-hidden shadow-lg flex flex-col justify-center">
              {/* Icono de fondo gigante */}
              <Info size={280} className="absolute -right-10 -top-10 text-white opacity-[0.07] transform rotate-12" />
              
              <div className="relative z-10 max-w-lg">
                <h3 className="text-2xl md:text-3xl font-black text-white mb-3">Análisis de Datos Clínicos</h3>
                <p className="text-blue-100 text-sm md:text-base leading-relaxed">
                  Los gráficos te proporcionan un panorama general demográfico. Úsalos para optimizar la toma de decisiones clínicas y mejorar la gestión de tu consultorio.
                </p>
              </div>
            </div>

          </div>

          {/* ================= GRÁFICOS (DONUT CHARTS) ================= */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            
            {/* GRÁFICO 1: Tipo de Referido (Medio Círculo) */}
            <div className="bg-white dark:bg-[#16161a] rounded-[2rem] p-8 shadow-md border border-slate-200 dark:border-white/[0.04] flex flex-col items-center">
              
              <div className="w-full flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">Tipo de referido</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">¿Cómo te consiguió el paciente?</p>
                </div>
                <PieChart className="text-slate-300 dark:text-slate-600" size={24} />
              </div>

              {/* Leyenda Gráfico 1 */}
              <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mb-10 text-xs font-bold text-slate-600 dark:text-slate-400">
                {referidosData.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-1.5">
                    <span className="w-6 h-1.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                    {item.label}
                  </div>
                ))}
              </div>

              {/* Contenedor del Medio Círculo */}
              <div className="w-[280px] h-[140px] overflow-hidden relative">
                <div 
                  className="w-[280px] h-[280px] rounded-full absolute top-0 left-0"
                  style={{ background: calcReferidosGradient() }}
                >
                  {/* Hueco Central */}
                  <div className="absolute inset-[30%] bg-white dark:bg-[#16161a] rounded-full"></div>
                </div>
              </div>

            </div>

            {/* GRÁFICO 2: Estado Civil (Círculo Completo) */}
            <div className="bg-white dark:bg-[#16161a] rounded-[2rem] p-8 shadow-md border border-slate-200 dark:border-white/[0.04] flex flex-col items-center">
              
              <div className="w-full flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">Estado Civil</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Distribución Social</p>
                </div>
                <PieChart className="text-slate-300 dark:text-slate-600" size={24} />
              </div>

              {/* Leyenda Gráfico 2 */}
              <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mb-10 text-xs font-bold text-slate-600 dark:text-slate-400 w-full">
                <div className="flex items-center gap-1.5"><span className="w-6 h-1.5 rounded-full bg-red-500"></span>Ninguno</div>
                <div className="flex items-center gap-1.5"><span className="w-6 h-1.5 rounded-full bg-blue-600"></span>Soltero</div>
                <div className="flex items-center gap-1.5"><span className="w-6 h-1.5 rounded-full bg-pink-600"></span>Casado</div>
                <div className="flex items-center gap-1.5"><span className="w-6 h-1.5 rounded-full bg-emerald-500"></span>Viudo</div>
                <div className="flex items-center gap-1.5"><span className="w-6 h-1.5 rounded-full bg-blue-900"></span>Fallecido</div>
              </div>

              {/* Contenedor del Círculo Completo */}
              <div className="w-[240px] h-[240px] relative mb-4">
                <div 
                  className="w-full h-full rounded-full"
                  style={{ background: totalPacientes > 0 ? calcCivilGradient() : '#334155' }}
                >
                  {/* Hueco Central */}
                  <div className="absolute inset-[30%] bg-white dark:bg-[#16161a] rounded-full flex items-center justify-center shadow-inner">
                    {totalPacientes === 0 && <span className="text-xs font-bold text-slate-400">Sin datos</span>}
                  </div>
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