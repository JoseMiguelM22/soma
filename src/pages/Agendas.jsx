import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { 
  Home, Users, FileText, Calendar, User, LogOut, 
  Menu, Sun, Moon, Plus, X, PanelLeft, Clock, 
  ChevronLeft, ChevronRight, Link as LinkIcon, Copy, Calendar as CalendarIcon, Check
} from 'lucide-react';

export default function Agendas() {
  const navigate = useNavigate();
  
  // ================= ESTADOS DE UI =================
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [viewMode, setViewMode] = useState('Semana'); // 'Semana' o 'Mes'
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // ================= ESTADOS DE DATOS =================
  const [userData, setUserData] = useState(null);
  const [citas, setCitas] = useState([]);
  const [pacientesLista, setPacientesLista] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // ================= MODAL NUEVA CITA =================
  const [isModalCitaOpen, setIsModalCitaOpen] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [nuevaCita, setNuevaCita] = useState({
    id_paciente: '', fecha_hora: '', estado: 'Pendiente', 
    consultorio: '', titulo: '', notas: ''
  });

  const listaConsultorios = ["Medics"];

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDarkMode]);

  // ================= CARGA DE DATOS =================
  const fetchData = async () => {
    setLoading(true);
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (!session || sessionError) return navigate('/login');

    const { data: dbUser } = await supabase.from('usuarios').select('*').eq('id_auth', session.user.id).single();
    if (dbUser) setUserData(dbUser);
    
    // Cargar pacientes para el select del modal
    const { data: dbPacientes } = await supabase.from('pacientes').select('*').eq('id_medico', session.user.id).order('nombres', { ascending: true });
    if (dbPacientes) setPacientesLista(dbPacientes);

    cargarCitas();
  };

  const cargarCitas = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const { data, error } = await supabase
      .from('citas')
      .select('*, pacientes(nombres, apellidos, cedula)')
      .eq('id_medico', session.user.id)
      .order('fecha_hora', { ascending: true });
      
    if (!error && data) setCitas(data);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const getInitials = () => {
    if (!userData || !userData.nombres || !userData.apellidos) return "DR";
    return `${userData.nombres.charAt(0)}${userData.apellidos.charAt(0)}`.toUpperCase();
  };

  const copiarEnlace = () => {
    navigator.clipboard.writeText(`https://Soma.com/medico/${userData?.nombres}-${userData?.apellidos}`.toLowerCase().replace(/\s+/g, '-'));
    alert("Enlace de citas copiado");
  };

  const handleGuardarCita = async (e) => {
    e.preventDefault();
    setGuardando(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const { error } = await supabase.from('citas').insert([{
        id_medico: session.user.id,
        id_paciente: nuevaCita.id_paciente,
        fecha_hora: nuevaCita.fecha_hora,
        estado: nuevaCita.estado,
        consultorio: nuevaCita.consultorio || 'Sin especificar',
        titulo: nuevaCita.titulo,
        notas: nuevaCita.notas
      }]);
      if (error) throw error;
      
      setIsModalCitaOpen(false);
      setNuevaCita({ id_paciente: '', fecha_hora: '', estado: 'Pendiente', consultorio: '', titulo: '', notas: '' });
      cargarCitas();
      alert("Cita agendada correctamente.");
    } catch (err) {
      alert("Error al agendar: Verifica que la tabla 'citas' exista en la BD.");
    } finally {
      setGuardando(false);
    }
  };

  // ================= LÓGICA DE CALENDARIO =================
  const getStartOfWeek = (d) => {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Ajustar para que Lunes sea el primer día
    return new Date(date.setDate(diff));
  };

  const addDays = (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  };

  // NAVEGACIÓN DE FECHAS
  const prevDate = () => {
    if (viewMode === 'Semana') setCurrentDate(addDays(currentDate, -7));
    else setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextDate = () => {
    if (viewMode === 'Semana') setCurrentDate(addDays(currentDate, 7));
    else setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => setCurrentDate(new Date());

  // GENERAR ARREGLOS DE DÍAS
  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(getStartOfWeek(currentDate), i));

  const getMonthDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    let days = [];
    let startDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1; // Ajuste Lunes=0
    
    // Días del mes anterior (Relleno)
    for(let i = startDayOfWeek; i > 0; i--) days.push(new Date(year, month, 1 - i));
    // Días del mes actual
    for(let i = 1; i <= lastDay.getDate(); i++) days.push(new Date(year, month, i));
    // Días del próximo mes (Relleno para completar cuadricula de 42 celdas = 6 semanas)
    const extraDays = 42 - days.length;
    for(let i = 1; i <= extraDays; i++) days.push(new Date(year, month + 1, i));
    
    return days;
  };
  const monthDays = getMonthDays();

  // FORMATOS VISUALES
  const formatHeaderRange = () => {
    if (viewMode === 'Semana') {
      const start = weekDays[0];
      const end = weekDays[6];
      const monthStart = start.toLocaleDateString('es-ES', { month: 'short' });
      const monthEnd = end.toLocaleDateString('es-ES', { month: 'short' });
      const year = end.getFullYear();
      if (start.getMonth() === end.getMonth()) {
        return `${start.getDate()} - ${end.getDate()} ${monthEnd} ${year}`;
      }
      return `${start.getDate()} ${monthStart} - ${end.getDate()} ${monthEnd} ${year}`;
    }
    return currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }).replace(/^\w/, c => c.toUpperCase());
  };

  const isSameDay = (d1, d2) => 
    d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
  const isToday = (d) => isSameDay(d, new Date());
  
  const getCitasParaDia = (date) => {
    return citas.filter(c => {
      const citaDate = new Date(c.fecha_hora);
      return isSameDay(citaDate, date);
    }).sort((a, b) => new Date(a.fecha_hora) - new Date(b.fecha_hora));
  };

  const formatHora = (fechaString) => {
    return new Date(fechaString).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  // Color del puntito según el estado
  const getStatusColor = (estado) => {
    if (estado === 'Confirmada') return 'bg-emerald-500';
    if (estado === 'Cancelada') return 'bg-rose-500';
    return 'bg-amber-400'; // Pendiente
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-[#0a0a0a] text-slate-800 dark:text-slate-200 font-sans overflow-hidden transition-colors duration-300">
      
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm transition-opacity" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* ================= SIDEBAR ================= */}
      <aside className={`fixed inset-y-0 left-0 z-50 bg-white dark:bg-[#111111] border-r border-slate-200 dark:border-white/5 flex flex-col justify-between transform transition-all duration-300 ease-in-out md:relative md:translate-x-0 w-64 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} ${isCollapsed ? 'md:w-20' : 'md:w-64'}`}>
        <div>
          <div className={`h-16 flex items-center border-b border-slate-200 dark:border-white/5 transition-all ${isCollapsed ? 'justify-center' : 'justify-between px-6'}`}>
            <h1 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2 tracking-widest overflow-hidden whitespace-nowrap">
              <span className="text-cyan-600 dark:text-cyan-400 text-2xl">*</span>{!isCollapsed && <span>SOMA</span>}
            </h1>
            {!isCollapsed && (<button className="md:hidden text-slate-500 hover:text-rose-500" onClick={() => setIsSidebarOpen(false)}><X size={24} /></button>)}
          </div>

          <div className={`py-6 ${isCollapsed ? 'px-2' : 'px-4'}`}>
            {!isCollapsed && <p className="text-xs font-bold text-slate-400 dark:text-slate-500 mb-4 px-2 tracking-widest">HERRAMIENTAS</p>}
            <nav className="space-y-2">
              <Link to="/dashboard" className="flex items-center gap-3 py-2.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg font-medium transition-colors"><Home size={20} className="shrink-0" />{!isCollapsed && <span>Inicio</span>}</Link>
              <Link to="/pacientes" className="flex items-center gap-3 py-2.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg font-medium transition-colors"><Users size={20} className="shrink-0" />{!isCollapsed && <span>Pacientes</span>}</Link>
              <Link to="/historias" className="flex items-center gap-3 py-2.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg font-medium transition-colors"><FileText size={20} className="shrink-0" />{!isCollapsed && <span>Historias Clínicas</span>}</Link>
              <Link to="/agenda" className="flex items-center gap-3 py-2.5 bg-cyan-50 dark:bg-[#1e1e1e] text-cyan-700 dark:text-cyan-400 border border-transparent dark:border-white/5 rounded-lg font-bold transition-colors"><Calendar size={20} className="shrink-0" />{!isCollapsed && <span>Agenda</span>}</Link>
            </nav>
          </div>
        </div>

        <div className={`p-4 border-t border-slate-200 dark:border-white/5 flex flex-col ${isCollapsed ? 'items-center' : ''}`}>
          <div className={`flex items-center gap-3 mb-4 ${isCollapsed ? 'justify-center' : 'px-2'}`}>
            <div className="w-8 h-8 shrink-0 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-700 dark:text-white">
              {userData ? getInitials() : '...'}
            </div>
            {!isCollapsed && (
              <div className="overflow-hidden">
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-tight">Médico</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight truncate">
                  {userData ? `${userData.nombres} ${userData.apellidos}` : 'Cargando...'}
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
      <main className="flex-1 flex flex-col h-screen overflow-hidden w-full relative bg-slate-100 dark:bg-[#050505]">
        
        <header className="h-16 flex items-center justify-between px-6 lg:px-8 border-b border-slate-200 dark:border-white/5 bg-white/50 dark:bg-[#111111]/80 backdrop-blur-sm sticky top-0 z-30 shrink-0">
          <div className="flex items-center gap-4">
            <button className="text-slate-500 dark:text-slate-400 hover:text-cyan-600 md:hidden" onClick={() => setIsSidebarOpen(true)}><Menu size={24} /></button>
            <button className="hidden md:flex p-2 text-slate-400 hover:text-cyan-600 dark:hover:text-white rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10" onClick={() => setIsCollapsed(!isCollapsed)}><PanelLeft size={20} /></button>
          </div>
          <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 text-slate-400 hover:text-cyan-600 dark:hover:text-yellow-400 bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 transition-colors">
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </header>

        <div className="flex-1 overflow-y-auto w-full custom-scrollbar pb-10">
          <div className="p-4 md:p-8 max-w-[1600px] mx-auto w-full animate-[fadeIn_0.3s_ease-out]">
            
            {/* Cabecera de Agenda */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Agenda</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-0.5">Gestiona tus consultas</p>
              </div>

              {/* Controles de Calendario */}
              <div className="flex flex-wrap items-center gap-3">
                <button onClick={goToToday} className="px-4 py-2 text-sm font-bold border border-slate-200 dark:border-white/10 rounded-xl bg-white dark:bg-[#1a1a1a] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors shadow-sm">
                  Hoy
                </button>
                
                <div className="flex items-center border border-slate-200 dark:border-white/10 rounded-xl bg-white dark:bg-[#1a1a1a] shadow-sm overflow-hidden">
                  <button onClick={prevDate} className="p-2 hover:bg-slate-50 dark:hover:bg-white/5 text-slate-500 border-r border-slate-200 dark:border-white/10 transition-colors">
                    <ChevronLeft size={18} />
                  </button>
                  <span className="px-4 py-2 text-sm font-bold text-slate-700 dark:text-slate-200 min-w-[140px] text-center capitalize">
                    {formatHeaderRange()}
                  </span>
                  <button onClick={nextDate} className="p-2 hover:bg-slate-50 dark:hover:bg-white/5 text-slate-500 border-l border-slate-200 dark:border-white/10 transition-colors">
                    <ChevronRight size={18} />
                  </button>
                </div>

                <select 
                  value={viewMode} 
                  onChange={(e) => setViewMode(e.target.value)} 
                  className="px-4 py-2.5 text-sm font-bold border border-slate-200 dark:border-white/10 rounded-xl bg-white dark:bg-[#1a1a1a] text-slate-700 dark:text-slate-300 outline-none shadow-sm cursor-pointer hidden sm:block"
                >
                  <option value="Semana">Semana</option>
                  <option value="Mes">Mes</option>
                </select>

                <div className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-white/10 rounded-xl bg-white dark:bg-[#1a1a1a] shadow-sm hidden md:flex">
                  <span className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">CONSUL.</span>
                  <select className="text-sm font-bold bg-transparent outline-none cursor-pointer text-slate-700 dark:text-slate-200 border-none">
                    <option>Todos</option>
                    {listaConsultorios.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>

                <button onClick={() => setIsModalCitaOpen(true)} className="bg-[#0081a7] hover:bg-[#006b8a] text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-md flex items-center justify-center gap-2 ml-auto xl:ml-2">
                  <Plus size={18} /> Nueva Cita
                </button>
              </div>
            </div>

            {/* Banner del Enlace de Citas */}
            <div className="bg-[#f0f9ff] dark:bg-cyan-900/10 border border-cyan-100 dark:border-cyan-900/30 rounded-2xl p-5 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white dark:bg-[#1a1a1a] rounded-full flex items-center justify-center shrink-0 shadow-sm border border-cyan-100 dark:border-cyan-900/30">
                  <LinkIcon className="text-[#0081a7] dark:text-cyan-400" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">Enlace de tu página web y de citas</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Tus pacientes pueden agendar citas directamente.</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input 
                  type="text" readOnly 
                  value={`https://Soma.com/medico/${userData?.nombres?.toLowerCase().replace(/\s+/g, '-') || 'demo'}`} 
                  className="hidden sm:block px-4 py-2 bg-white dark:bg-[#111111] border border-slate-200 dark:border-white/10 rounded-xl text-sm font-medium text-slate-500 w-80 outline-none"
                />
                <button onClick={copiarEnlace} className="flex items-center gap-2 px-5 py-2 bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 hover:border-cyan-500 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-bold transition-colors w-full md:w-auto justify-center shadow-sm">
                  Copiar enlace
                </button>
              </div>
            </div>

            {/* ================= CALENDARIO ================= */}
            <div className="bg-white dark:bg-[#111111] rounded-[1.5rem] shadow-xl border border-slate-200 dark:border-white/5 overflow-hidden">
              
              {/* Cabecera del Mes interno (Solo en vista Mes) */}
              {viewMode === 'Mes' && (
                <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-[#161616]">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white capitalize">
                    {currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                  </h3>
                  <div className="flex gap-2">
                    <button onClick={prevDate} className="px-4 py-1.5 text-sm font-bold text-slate-600 dark:text-slate-400 bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-lg hover:bg-slate-50 transition-colors">Anterior</button>
                    <button onClick={nextDate} className="px-4 py-1.5 text-sm font-bold text-slate-600 dark:text-slate-400 bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-lg hover:bg-slate-50 transition-colors">Siguiente</button>
                  </div>
                </div>
              )}

              {/* === VISTA SEMANA === */}
              {viewMode === 'Semana' && (
                <div className="grid grid-cols-7 min-w-[900px] overflow-x-auto">
                  {weekDays.map((dia, idx) => {
                    const citasDia = getCitasParaDia(dia);
                    const isHoy = isToday(dia);
                    return (
                      <div key={idx} className="flex flex-col border-r last:border-r-0 border-slate-100 dark:border-white/5 min-h-[650px] bg-slate-50/30 dark:bg-transparent">
                        
                        <div className="p-4 flex items-center justify-center gap-2 border-b border-slate-100 dark:border-white/5 bg-white dark:bg-[#161616]">
                          <span className="text-[11px] font-bold text-slate-400 tracking-widest uppercase">{dia.toLocaleDateString('es-ES', { weekday: 'short' })}</span>
                          <div className={`w-8 h-8 flex items-center justify-center rounded-full font-black text-sm transition-colors ${isHoy ? 'bg-[#0081a7] text-white shadow-md' : 'text-slate-700 dark:text-slate-200'}`}>
                            {dia.getDate()}
                          </div>
                        </div>
                        
                        <div className="flex-1 p-2 space-y-3 relative group">
                          {citasDia.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full opacity-0 group-hover:opacity-100 transition-opacity">
                               <Clock className="text-slate-300 dark:text-white/10 mb-2" size={24} />
                            </div>
                          ) : (
                            citasDia.map(c => (
                              <div key={c.id} className="bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer relative overflow-hidden">
                                <div className="flex items-center gap-2 mb-1.5">
                                  <div className={`w-2 h-2 rounded-full ${getStatusColor(c.estado)}`}></div>
                                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{formatHora(c.fecha_hora)}</span>
                                </div>
                                <p className="text-[13px] font-bold text-slate-900 dark:text-white truncate">{c.pacientes?.nombres} {c.pacientes?.apellidos}</p>
                                <p className="text-[10px] text-slate-500 mt-1 truncate">{c.consultorio}</p>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* === VISTA MES === */}
              {viewMode === 'Mes' && (
                <div className="min-w-[900px]">
                  {/* Días de la semana Header */}
                  <div className="grid grid-cols-7 border-b border-slate-200 dark:border-white/10 bg-white dark:bg-[#161616]">
                    {['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'].map(d => (
                      <div key={d} className="py-4 text-center text-[11px] font-bold text-slate-400 tracking-widest">{d}</div>
                    ))}
                  </div>
                  
                  {/* Grilla de días */}
                  <div className="grid grid-cols-7 auto-rows-fr">
                    {monthDays.map((dia, idx) => {
                      const isHoy = isToday(dia);
                      const isCurrentMonth = dia.getMonth() === currentDate.getMonth();
                      const citasDia = getCitasParaDia(dia);
                      
                      return (
                        <div key={idx} className={`min-h-[140px] border-b border-r border-slate-100 dark:border-white/5 p-2 transition-colors ${!isCurrentMonth ? 'bg-slate-50/50 dark:bg-black/20' : 'bg-white dark:bg-transparent hover:bg-slate-50 dark:hover:bg-white/5'} ${isHoy ? 'border-amber-300 dark:border-amber-500/50 bg-amber-50/10' : ''}`}>
                          <div className="flex justify-between items-start mb-2">
                            <div></div> {/* Spacer */}
                            <div className="flex items-center gap-2">
                              {isHoy && <span className="bg-amber-400 text-amber-900 text-[9px] font-black px-1.5 py-0.5 rounded">HOY</span>}
                              <div className={`w-7 h-7 flex items-center justify-center rounded-full font-bold text-sm ${isHoy ? 'bg-[#0081a7] text-white' : !isCurrentMonth ? 'text-slate-400 dark:text-slate-600' : 'text-slate-700 dark:text-slate-200'}`}>
                                {dia.getDate()}
                              </div>
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            {citasDia.slice(0, 3).map(c => (
                              <div key={c.id} className="flex items-center justify-between group cursor-pointer">
                                <div className="flex items-center gap-1.5 overflow-hidden">
                                  <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${getStatusColor(c.estado)}`}></div>
                                  <span className="text-xs font-medium text-slate-600 dark:text-slate-300 truncate group-hover:text-[#0081a7] dark:group-hover:text-cyan-400 transition-colors">
                                    {c.pacientes?.nombres.split(' ')[0]} {c.pacientes?.apellidos.charAt(0)}.
                                  </span>
                                </div>
                                <span className="text-[10px] text-slate-400 font-medium shrink-0">{formatHora(c.fecha_hora)}</span>
                              </div>
                            ))}
                            {citasDia.length > 3 && (
                              <div className="text-[10px] font-bold text-slate-400 mt-1 pl-3">+ {citasDia.length - 3} más</div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </main>

      {/* ================= MODAL AGENDAR CITA ================= */}
      {isModalCitaOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-[fadeIn_0.2s_ease-out]">
           <div className="bg-white dark:bg-[#111111] w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden flex flex-col">
              
              <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-[#161616]">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Agendar nueva cita</h2>
                <button onClick={() => setIsModalCitaOpen(false)} className="p-2 text-slate-400 hover:text-rose-500 bg-white dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-full transition-colors"><X size={18} /></button>
              </div>
              
              <div className="p-6 overflow-y-auto custom-scrollbar">
                <form id="formNuevaCita" onSubmit={handleGuardarCita} className="space-y-5">
                  
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Paciente *</label>
                    <select required value={nuevaCita.id_paciente} onChange={(e) => setNuevaCita({...nuevaCita, id_paciente: e.target.value})} className="w-full px-4 py-3 bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#0081a7] transition-all">
                      <option value="">Seleccione o busque un paciente...</option>
                      {pacientesLista.map(p => <option key={p.id} value={p.id}>{p.nombres} {p.apellidos} - {p.cedula}</option>)}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Fecha y hora *</label>
                      <input type="datetime-local" value={nuevaCita.fecha_hora} onChange={(e) => setNuevaCita({...nuevaCita, fecha_hora: e.target.value})} required className="w-full px-4 py-3 bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#0081a7] transition-all [&::-webkit-calendar-picker-indicator]:dark:invert" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Estado</label>
                      <select value={nuevaCita.estado} onChange={(e) => setNuevaCita({...nuevaCita, estado: e.target.value})} className="w-full px-4 py-3 bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#0081a7] transition-all">
                        <option value="Pendiente">Pendiente</option>
                        <option value="Confirmada">Confirmada</option>
                        <option value="Cancelada">Cancelada</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Consultorio (opcional)</label>
                      <select value={nuevaCita.consultorio} onChange={(e) => setNuevaCita({...nuevaCita, consultorio: e.target.value})} className="w-full px-4 py-3 bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#0081a7] transition-all">
                        <option value="Sin especificar">Sin especificar</option>
                        {listaConsultorios.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Título (opcional)</label>
                      <input type="text" value={nuevaCita.titulo} onChange={(e) => setNuevaCita({...nuevaCita, titulo: e.target.value})} placeholder="Ej. Control..." className="w-full px-4 py-3 bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#0081a7] transition-all" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Notas (opcional)</label>
                    <textarea rows="3" value={nuevaCita.notas} onChange={(e) => setNuevaCita({...nuevaCita, notas: e.target.value})} className="w-full px-4 py-3 bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#0081a7] transition-all resize-none custom-scrollbar" placeholder="Instrucciones previas o notas internas..."></textarea>
                  </div>
                </form>
              </div>
              
              <div className="p-6 border-t border-slate-100 dark:border-white/5 flex gap-3 justify-end bg-slate-50 dark:bg-[#161616]">
                <button type="button" onClick={() => setIsModalCitaOpen(false)} className="px-5 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors text-sm">Cancelar</button>
                <button type="submit" form="formNuevaCita" disabled={guardando} className="bg-[#0081a7] hover:bg-[#006b8a] text-white px-6 py-2.5 rounded-xl font-bold shadow-md disabled:opacity-50 text-sm flex items-center gap-2">
                  {guardando ? 'Guardando...' : <><Check size={16}/> Guardar cita</>}
                </button>
              </div>

           </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.95) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #3f3f46; border-radius: 10px; }
      `}</style>
    </div>
  );
}