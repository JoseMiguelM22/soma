import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { 
  Home, Users, FileText, Calendar as CalendarIcon, LogOut, 
  Menu, Sun, Moon, X, PanelLeft, Clock, 
  ChevronLeft, ChevronRight, MessageCircle, User, Plus, Save,
  Search, IdCard // <-- Agregamos los íconos Search e IdCard
} from 'lucide-react';

export default function Agendas() {
  const navigate = useNavigate();
  
  // ================= ESTADOS DE UI =================
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'light' ? false : true; 
  });
  
  useEffect(() => { 
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [viewMode, setViewMode] = useState('Semana'); // 'Semana' o 'Mes'
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // ================= ESTADOS DE DATOS =================
  const [userData, setUserData] = useState(null);
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);

  // Listas para el formulario de agendar
  const [listaPacientes, setListaPacientes] = useState([]);
  const [listaMedicos, setListaMedicos] = useState([]);

  // ================= MODALES DE DETALLE =================
  const [selectedCita, setSelectedCita] = useState(null);
  const [diaSeleccionado, setDiaSeleccionado] = useState(null); // NUEVO: Para ver todas las citas de un día
  
  const [remitiendo, setRemitiendo] = useState(false);
  const [nuevoEstado, setNuevoEstado] = useState('');
  const [actualizandoEstado, setActualizandoEstado] = useState(false);

  // ================= MODAL AGENDAR CITA Y BUSCADORES =================
  const [showAgendarModal, setShowAgendarModal] = useState(false);
  const [agendando, setAgendando] = useState(false);
  
  // Estados para los buscadores predictivos
  const [busquedaPaciente, setBusquedaPaciente] = useState('');
  const [mostrarDropdownPac, setMostrarDropdownPac] = useState(false);
  const [busquedaMedico, setBusquedaMedico] = useState('');
  const [mostrarDropdownMed, setMostrarDropdownMed] = useState(false);

  const [nuevaCita, setNuevaCita] = useState({
    id_paciente: '',
    id_medico: '',
    fecha: '',
    hora: '08:00',
    motivo: ''
  });

  const listaConsultorios = ["Medics", "SOMA Principal"];

  // ================= CARGA DE DATOS =================
  const fetchData = async () => {
    setLoading(true);
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (!session || sessionError) return navigate('/login');

    const { data: dbUser } = await supabase.from('usuarios').select('*').eq('id_auth', session.user.id).single();
    if (dbUser) setUserData(dbUser);
    
    await cargarListas();
    cargarCitas(dbUser, session.user.id);
  };

  const cargarListas = async () => {
    const { data: pacientes } = await supabase.from('pacientes').select('id, nombres, apellidos, cedula').order('nombres');
    if (pacientes) setListaPacientes(pacientes);

    const { data: medicos } = await supabase.from('usuarios').select('id_auth, nombres, apellidos, rol');
    if (medicos) {
      const soloMedicos = medicos.filter(m => ['especialista', 'medico', 'médico'].includes((m.rol || '').toLowerCase()));
      setListaMedicos(soloMedicos);
    }
  };

  const cargarCitas = async (usuarioDb, authId) => {
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 2, 0);

    let query = supabase
      .from('consultas')
      .select('*, pacientes(nombres, apellidos, cedula, telefono)')
      .gte('fecha_consulta', startOfMonth.toISOString())
      .lte('fecha_consulta', endOfMonth.toISOString())
      .order('fecha_consulta', { ascending: true });
      
    if (usuarioDb?.rol === 'especialista') {
      query = query.eq('id_medico', authId);
    }

    const { data, error } = await query;
    if (!error && data) setCitas(data);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [currentDate, navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const getInitials = () => {
    if (!userData || !userData.nombres || !userData.apellidos) return "DR";
    return `${userData.nombres.charAt(0)}${userData.apellidos.charAt(0)}`.toUpperCase();
  };

  const esEspecialista = userData && ['especialista', 'medico', 'médico'].includes((userData.rol || '').toLowerCase());

  // ================= LÓGICA DE LOS BUSCADORES PREDICTIVOS =================
  const pacientesFiltrados = listaPacientes.filter(p => 
    `${p.nombres} ${p.apellidos} ${p.cedula}`.toLowerCase().includes(busquedaPaciente.toLowerCase())
  );

  const medicosFiltrados = listaMedicos.filter(m => 
    `${m.nombres} ${m.apellidos}`.toLowerCase().includes(busquedaMedico.toLowerCase())
  );

  const openAgendarModal = () => {
    const d = new Date();
    const hoy = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    
    setBusquedaPaciente('');
    setBusquedaMedico('');
    setNuevaCita({
      id_paciente: '',
      id_medico: esEspecialista ? userData.id_auth : '',
      fecha: hoy,
      hora: '08:00',
      motivo: ''
    });

    if (esEspecialista) {
      setBusquedaMedico(`Dr(a). ${userData.nombres} ${userData.apellidos}`);
    }

    setShowAgendarModal(true);
  };

  const handleNuevaCitaChange = (e) => {
    setNuevaCita({ ...nuevaCita, [e.target.name]: e.target.value });
  };

  const handleAgendarCita = async (e) => {
    e.preventDefault();
    if (!nuevaCita.id_paciente) return alert("Por favor, selecciona un paciente de la lista desplegable.");
    if (!nuevaCita.id_medico) return alert("Por favor, selecciona un médico especialista de la lista.");
    if (!nuevaCita.fecha || !nuevaCita.hora) return alert("La fecha y la hora son obligatorias.");

    setAgendando(true);
    try {
      const fechaHoraISO = new Date(`${nuevaCita.fecha}T${nuevaCita.hora}:00`).toISOString();

      const { error } = await supabase.from('consultas').insert([{
        id_paciente: nuevaCita.id_paciente,
        id_medico: nuevaCita.id_medico,
        fecha_consulta: fechaHoraISO,
        motivo: nuevaCita.motivo,
        estado: 'Agendada'
      }]);

      if (error) throw error;

      alert("¡Consulta agendada con éxito!");
      setShowAgendarModal(false);
      fetchData(); 
    } catch (err) {
      alert("Error al agendar: " + err.message);
    } finally {
      setAgendando(false);
    }
  };

  // ================= ACCIONES RÁPIDAS (WHATSAPP) =================
  const handleWhatsApp = (cita) => {
    const telefono = cita.pacientes?.telefono;
    if (!telefono) return alert("Este paciente no tiene un número de teléfono registrado en el sistema.");
    let num = telefono.replace(/\D/g, '');
    if (num.startsWith('0')) num = '58' + num.substring(1);
    else if (!num.startsWith('58') && num.length === 10) num = '58' + num;
    
    const pacienteNombre = `${cita.pacientes?.nombres} ${cita.pacientes?.apellidos}`;
    const fechaStr = new Date(cita.fecha_consulta).toLocaleDateString('es-ES');
    const horaStr = formatHora(cita.fecha_consulta);

    const mensaje = `¡Hola, ${pacienteNombre}! Le escribimos de SOMA para recordarle su cita médica pautada para el día ${fechaStr} a las ${horaStr}. Por favor, confírmenos su asistencia. ¡Saludos!`;
    const urlMensaje = encodeURIComponent(mensaje);
    window.open(`https://wa.me/${num}?text=${urlMensaje}`, '_blank');
  };

  // ================= ACTUALIZACIÓN DE ESTADOS =================
  const openCitaDetails = (cita) => {
    setSelectedCita(cita);
    setNuevoEstado(cita.estado);
  };

  const handleRemitirMedico = async (citaId) => {
    setRemitiendo(true);
    try {
      const { error } = await supabase.from('consultas').update({ estado: 'En Espera' }).eq('id', citaId);
      if (error) throw error;
      alert("¡Paciente remitido a la Sala de Espera del Médico!");
      setSelectedCita(null);
      fetchData();
    } catch (err) {
      alert("Error al remitir: " + err.message);
    } finally {
      setRemitiendo(false);
    }
  };

  const handleActualizarEstado = async (citaId) => {
    setActualizandoEstado(true);
    try {
      const { error } = await supabase.from('consultas').update({ estado: nuevoEstado }).eq('id', citaId);
      if (error) throw error;
      alert("¡Estado de la cita actualizado!");
      setSelectedCita(null);
      fetchData();
    } catch (err) {
      alert("Error al actualizar: " + err.message);
    } finally {
      setActualizandoEstado(false);
    }
  };

  // ================= INTELIGENCIA DE ESTADOS Y COLORES =================
  const isCitaExpirada = (fechaString, estado) => {
    const citaDate = new Date(fechaString);
    citaDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return citaDate < today && ['Agendada', 'Pendiente', 'En Espera'].includes(estado);
  };

  const getStatusText = (cita) => {
    if (cita.estado === 'No Asistió' || isCitaExpirada(cita.fecha_consulta, cita.estado)) return 'No Asistió';
    if (cita.estado === 'Finalizada' || cita.estado === 'Completada') return 'Completada';
    return cita.estado;
  };

  const getStatusColor = (cita) => {
    const text = getStatusText(cita);
    if (text === 'No Asistió' || text === 'Cancelada') return 'bg-rose-500/10 border-rose-500/30 text-rose-400';
    if (text === 'En Espera') return 'bg-amber-500/10 border-amber-500/30 text-amber-400';
    if (text === 'En Consulta') return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400';
    if (text === 'Completada') return 'bg-violet-500/10 border-violet-500/30 text-violet-400'; 
    return 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'; 
  };

  const getStatusColorSolid = (cita) => {
    const text = getStatusText(cita);
    if (text === 'No Asistió' || text === 'Cancelada') return 'bg-rose-500';
    if (text === 'En Espera') return 'bg-amber-400';
    if (text === 'En Consulta') return 'bg-emerald-400';
    if (text === 'Completada') return 'bg-violet-500'; 
    return 'bg-cyan-400'; 
  };

  // ================= LÓGICA DE CALENDARIO =================
  const getStartOfWeek = (d) => {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(date.setDate(diff));
  };

  const addDays = (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  };

  const prevDate = () => {
    if (viewMode === 'Semana') setCurrentDate(addDays(currentDate, -7));
    else setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextDate = () => {
    if (viewMode === 'Semana') setCurrentDate(addDays(currentDate, 7));
    else setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => setCurrentDate(new Date());

  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(getStartOfWeek(currentDate), i));

  const getMonthDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    let days = [];
    let startDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1; 
    
    for(let i = startDayOfWeek; i > 0; i--) days.push(new Date(year, month, 1 - i));
    for(let i = 1; i <= lastDay.getDate(); i++) days.push(new Date(year, month, i));
    const extraDays = 42 - days.length;
    for(let i = 1; i <= extraDays; i++) days.push(new Date(year, month + 1, i));
    
    return days;
  };
  const monthDays = getMonthDays();

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

  const isSameDay = (d1, d2) => d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
  const isToday = (d) => isSameDay(d, new Date());
  
  const getCitasParaDia = (date) => {
    return citas.filter(c => {
      const citaDate = new Date(c.fecha_consulta); 
      return isSameDay(citaDate, date);
    }).sort((a, b) => new Date(a.fecha_consulta) - new Date(b.fecha_consulta));
  };

  const formatHora = (fechaString) => {
    return new Date(fechaString).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-[#0B0D12] text-slate-800 dark:text-slate-200 font-sans overflow-hidden transition-colors duration-300">
      
      {/* CAPA OSCURA PARA MÓVILES */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm transition-opacity" onClick={() => setIsSidebarOpen(false)} />
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
          <div className={`h-16 flex items-center border-b border-slate-200 dark:border-white/5 transition-all ${isCollapsed ? 'justify-center' : 'justify-between px-6'}`}>
            <Link to={esEspecialista ? '/dashboard' : '/admision'} className="flex items-center overflow-hidden whitespace-nowrap">
              {isCollapsed ? (
                <span className="text-cyan-500 text-2xl font-black">S</span>
              ) : (
                <>
                  <img src="/soma_logo.png" alt="SOMA" className="h-6 object-contain block dark:hidden transition-opacity duration-300" />
                  <img src="/soma_logo_blanco.png" alt="SOMA" className="h-6 object-contain hidden dark:block transition-opacity duration-300" />
                </>
              )}
            </Link>
            {!isCollapsed && (
              <button className="md:hidden text-slate-500 hover:text-rose-500" onClick={() => setIsSidebarOpen(false)}>
                <X size={24} />
              </button>
            )}
          </div>

          <div className={`py-6 ${isCollapsed ? 'px-2' : 'px-4'}`}>
            {!isCollapsed && <p className="text-xs font-bold text-slate-400 dark:text-slate-500 mb-4 px-2 tracking-widest">HERRAMIENTAS</p>}
            <nav className="space-y-2">
              <Link to={esEspecialista ? '/dashboard' : '/admision'} className="flex items-center gap-3 py-2.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg font-medium transition-colors">
                <Home size={20} className="shrink-0" />{!isCollapsed && <span>Inicio</span>}
              </Link>
              {!esEspecialista && (
                <Link to="/pacientes" className="flex items-center gap-3 py-2.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg font-medium transition-colors">
                  <Users size={20} className="shrink-0" />{!isCollapsed && <span>Pacientes</span>}
                </Link>
              )}
             
              <Link to="/agenda" className="flex items-center gap-3 py-2.5 bg-cyan-50 dark:bg-[#1e1e1e] text-cyan-700 dark:text-cyan-400 border border-transparent dark:border-white/5 rounded-lg font-bold transition-colors">
                <CalendarIcon size={20} className="shrink-0" />{!isCollapsed && <span>Agenda</span>}
              </Link>
            </nav>
          </div>
        </div>

        <div className={`p-4 border-t border-slate-200 dark:border-white/5 flex flex-col ${isCollapsed ? 'items-center' : ''}`}>
          <div className={`flex items-center gap-3 mb-4 ${isCollapsed ? 'justify-center' : 'px-2'}`}>
            <div className="w-8 h-8 shrink-0 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-700 dark:text-white border border-slate-300 dark:border-white/20">
              {userData ? getInitials() : '...'}
            </div>
            {!isCollapsed && (
              <div className="overflow-hidden">
                <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-tight">
                  {esEspecialista ? 'ESPECIALISTA' : 'DPTO. HISTORIAS'}
                </p>
                <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight truncate">
                  {esEspecialista ? 'Dr(a). ' : ''}{userData ? `${userData.nombres} ${userData.apellidos}` : 'Cargando...'}
                </p>
              </div>
            )}
          </div>
          <div className={`p-4 border-t border-slate-200 dark:border-white/5 flex flex-col gap-2 ${isCollapsed ? 'items-center' : ''}`}>
            <Link to="/perfil" className={`flex items-center gap-3 py-2 w-full text-slate-500 dark:text-slate-400 hover:text-[#0081a7] hover:bg-cyan-50 dark:hover:bg-cyan-500/10 rounded-lg font-bold transition-colors ${isCollapsed ? 'justify-center px-0' : 'px-3'}`}>
              <User size={20} className="shrink-0" />{!isCollapsed && <span className="whitespace-nowrap">Mi Perfil</span>}
            </Link>
            <button onClick={handleLogout} className={`flex items-center gap-3 py-2 w-full text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg font-bold transition-colors ${isCollapsed ? 'justify-center px-0' : 'px-3'}`}>
              <LogOut size={20} className="shrink-0" />{!isCollapsed && <span className="whitespace-nowrap">Cerrar Sesión</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* ================= CONTENIDO PRINCIPAL ================= */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden w-full relative bg-slate-100 dark:bg-[#0B0D12]">
        
        <header className="h-16 flex items-center justify-between px-6 lg:px-8 border-b border-slate-200 dark:border-white/5 bg-white/50 dark:bg-[#111111]/80 backdrop-blur-sm sticky top-0 z-30 shrink-0">
          <div className="flex items-center gap-4">
            <button className="text-slate-500 dark:text-slate-400 hover:text-cyan-600 md:hidden" onClick={() => setIsSidebarOpen(true)}>
              <Menu size={24} />
            </button>
            <button className="hidden md:flex p-2 text-slate-400 hover:text-cyan-600 dark:hover:text-white rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10" onClick={() => setIsCollapsed(!isCollapsed)}>
              <PanelLeft size={20} />
            </button>
          </div>
          <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 text-slate-400 hover:text-cyan-600 dark:hover:text-yellow-400 bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 transition-colors">
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </header>

        <div className="flex-1 overflow-y-auto w-full custom-scrollbar pb-10">
          <div className="p-4 md:p-8 max-w-[1600px] mx-auto w-full animate-[fadeIn_0.3s_ease-out]">
            
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-6">
              
              <div className="shrink-0 text-center xl:text-left">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Agenda</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-0.5">Gestiona tus consultas</p>
              </div>

              <div className="flex flex-col sm:flex-row flex-wrap items-center gap-3 w-full xl:w-auto">
                
                <button 
                  onClick={openAgendarModal} 
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#0081a7] hover:bg-[#006b8a] text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-[#0081a7]/20 transition-transform hover:-translate-y-0.5 order-first xl:order-last"
                >
                  <Plus size={18} /> Agendar Consulta
                </button>

                <div className="flex w-full sm:w-auto gap-2 order-2">
                  <button onClick={goToToday} className="flex-1 sm:flex-none px-4 py-2.5 text-sm font-bold border border-slate-200 dark:border-white/10 rounded-xl bg-white dark:bg-[#1a1a1a] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors shadow-sm">
                    Hoy
                  </button>
                  
                  <div className="flex flex-[2] sm:flex-none items-center justify-between border border-slate-200 dark:border-white/10 rounded-xl bg-white dark:bg-[#1a1a1a] shadow-sm overflow-hidden">
                    <button onClick={prevDate} className="p-2.5 hover:bg-slate-50 dark:hover:bg-white/5 text-slate-500 border-r border-slate-200 dark:border-white/10 transition-colors">
                      <ChevronLeft size={18} />
                    </button>
                    <span className="px-2 py-2 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 min-w-[120px] sm:min-w-[140px] text-center capitalize truncate">
                      {formatHeaderRange()}
                    </span>
                    <button onClick={nextDate} className="p-2.5 hover:bg-slate-50 dark:hover:bg-white/5 text-slate-500 border-l border-slate-200 dark:border-white/10 transition-colors">
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>

                <div className="flex w-full sm:w-auto gap-2 order-3">
                  <select 
                    value={viewMode} 
                    onChange={(e) => setViewMode(e.target.value)} 
                    className="flex-1 sm:flex-none px-3 py-2.5 text-sm font-bold border border-slate-200 dark:border-white/10 rounded-xl bg-white dark:bg-[#1a1a1a] text-slate-700 dark:text-slate-300 outline-none shadow-sm cursor-pointer"
                  >
                    <option value="Semana">Semana</option>
                    <option value="Mes">Mes</option>
                  </select>

                  <div className="flex-[2] sm:flex-none flex items-center gap-2 px-3 py-2 border border-slate-200 dark:border-white/10 rounded-xl bg-white dark:bg-[#1a1a1a] shadow-sm overflow-hidden">
                    <span className="text-[10px] text-slate-400 font-bold tracking-widest uppercase hidden md:block shrink-0">CONSUL.</span>
                    <select className="w-full text-sm font-bold bg-transparent outline-none cursor-pointer text-slate-700 dark:text-slate-200 border-none truncate">
                      <option>Todos los consultorios</option>
                      {listaConsultorios.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

              </div>
            </div>

            {/* ================= CALENDARIO ================= */}
            <div className="bg-white dark:bg-[#111111] rounded-[1.5rem] shadow-xl border border-slate-200 dark:border-white/5 overflow-hidden flex flex-col">
              
              <div className="md:hidden flex items-center justify-center text-slate-400 dark:text-slate-500 text-xs font-bold py-3 bg-slate-50/50 dark:bg-black/20 border-b border-slate-100 dark:border-white/5 animate-pulse">
                <span>← Desliza para ver la agenda completa →</span>
              </div>
              
              <div className="w-full overflow-x-auto custom-scrollbar pb-2">
                
                {/* VISTA SEMANA */}
                {viewMode === 'Semana' && (
                  <div className="grid grid-cols-7 min-w-[900px]">
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
                            {loading ? (
                               <div className="animate-pulse h-16 bg-slate-200 dark:bg-white/5 rounded-xl w-full"></div>
                            ) : citasDia.length === 0 ? (
                              <div className="flex flex-col items-center justify-center h-full opacity-0 group-hover:opacity-100 transition-opacity">
                                 <Clock className="text-slate-300 dark:text-white/10 mb-2" size={24} />
                              </div>
                            ) : (
                              citasDia.map(c => (
                                <div 
                                  key={c.id} 
                                  onClick={() => openCitaDetails(c)}
                                  className={`bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl p-3 shadow-sm hover:shadow-md transition-transform hover:-translate-y-0.5 cursor-pointer relative overflow-hidden ${getStatusColor(c)}`}
                                >
                                  <div className="flex items-center gap-2 mb-1.5">
                                    <div className={`w-2 h-2 rounded-full ${getStatusColorSolid(c)}`}></div>
                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{formatHora(c.fecha_consulta)}</span>
                                  </div>
                                  <p className="text-[13px] font-bold text-slate-900 dark:text-white truncate">{c.pacientes?.nombres} {c.pacientes?.apellidos}</p>
                                  <p className="text-[10px] text-slate-500 mt-1 truncate">{c.motivo || getStatusText(c)}</p>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* VISTA MES */}
                {viewMode === 'Mes' && (
                  <div className="min-w-[900px]">
                    <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-[#161616] sticky left-0">
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white capitalize">
                        {currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                      </h3>
                      <div className="flex gap-2">
                        <button onClick={prevDate} className="px-4 py-1.5 text-sm font-bold text-slate-600 dark:text-slate-400 bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-lg hover:bg-slate-50 transition-colors">Anterior</button>
                        <button onClick={nextDate} className="px-4 py-1.5 text-sm font-bold text-slate-600 dark:text-slate-400 bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-lg hover:bg-slate-50 transition-colors">Siguiente</button>
                      </div>
                    </div>

                    <div className="grid grid-cols-7 border-b border-slate-200 dark:border-white/10 bg-white dark:bg-[#161616]">
                      {['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'].map(d => (
                        <div key={d} className="py-4 text-center text-[11px] font-bold text-slate-400 tracking-widest">{d}</div>
                      ))}
                    </div>
                    
                    <div className="grid grid-cols-7 auto-rows-fr">
                      {monthDays.map((dia, idx) => {
                        const isHoy = isToday(dia);
                        const isCurrentMonth = dia.getMonth() === currentDate.getMonth();
                        const citasDia = getCitasParaDia(dia);
                        
                        return (
                          <div 
                            key={idx} 
                            onClick={() => setDiaSeleccionado(dia)} // HACE CLICKABLE TODO EL DÍA
                            className={`min-h-[140px] border-b border-r border-slate-100 dark:border-white/5 p-2 cursor-pointer transition-colors ${!isCurrentMonth ? 'bg-slate-50/50 dark:bg-black/20' : 'bg-white dark:bg-transparent hover:bg-slate-50 dark:hover:bg-white/5'} ${isHoy ? 'border-cyan-300 dark:border-cyan-500/50 bg-cyan-50/10' : ''}`}
                          >
                            <div className="flex justify-between items-start mb-2 pointer-events-none">
                              <div></div> 
                              <div className="flex items-center gap-2">
                                {isHoy && <span className="bg-[#0081a7] text-white text-[9px] font-black px-1.5 py-0.5 rounded">HOY</span>}
                                <div className={`w-7 h-7 flex items-center justify-center rounded-full font-bold text-sm ${isHoy ? 'bg-[#0081a7] text-white' : !isCurrentMonth ? 'text-slate-400 dark:text-slate-600' : 'text-slate-700 dark:text-slate-200'}`}>
                                  {dia.getDate()}
                                </div>
                              </div>
                            </div>

                            <div className="space-y-1.5 pointer-events-none">
                              {citasDia.slice(0, 3).map(c => (
                                <div key={c.id} className="flex items-center justify-between group">
                                  <div className="flex items-center gap-1.5 overflow-hidden">
                                    <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${getStatusColorSolid(c)}`}></div>
                                    <span className="text-xs font-medium text-slate-600 dark:text-slate-300 truncate group-hover:text-[#0081a7] dark:group-hover:text-cyan-400 transition-colors">
                                      {c.pacientes?.nombres.split(' ')[0]} {c.pacientes?.apellidos.charAt(0)}.
                                    </span>
                                  </div>
                                  <span className="text-[10px] text-slate-400 font-medium shrink-0">{formatHora(c.fecha_consulta)}</span>
                                </div>
                              ))}
                              {citasDia.length > 3 && (
                                <div className="text-[11px] font-black text-[#0081a7] dark:text-cyan-400 mt-1 pl-3 bg-cyan-50 dark:bg-cyan-900/20 py-0.5 rounded">
                                  + Ver las {citasDia.length} citas
                                </div>
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
        </div>
      </main>

      {/* ================= MODAL DE DÍA COMPLETO (VISUALIZAR TODAS LAS CITAS) ================= */}
      {diaSeleccionado && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-white dark:bg-[#111111] w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-[#161616] shrink-0">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CalendarIcon className="text-[#0081a7]" size={20}/> 
                <span className="capitalize">{diaSeleccionado.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
              </h2>
              <button onClick={() => setDiaSeleccionado(null)} className="p-2 text-slate-400 hover:text-rose-500 bg-white dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-full transition-colors"><X size={18} /></button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-4">
               {getCitasParaDia(diaSeleccionado).length === 0 ? (
                  <div className="text-center text-slate-500 dark:text-slate-400 py-8 flex flex-col items-center">
                    <Clock size={40} className="mb-3 opacity-20" />
                    <p className="font-medium text-sm">No hay consultas pautadas para este día.</p>
                  </div>
               ) : (
                  getCitasParaDia(diaSeleccionado).map(c => (
                      <div 
                        key={c.id} 
                        onClick={() => { setDiaSeleccionado(null); openCitaDetails(c); }}
                        className={`bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl p-4 shadow-sm hover:shadow-md transition-transform hover:-translate-y-1 cursor-pointer relative overflow-hidden ${getStatusColor(c)}`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`w-3 h-3 rounded-full ${getStatusColorSolid(c)}`}></div>
                          <span className="text-sm font-black text-slate-700 dark:text-slate-200">{formatHora(c.fecha_consulta)}</span>
                          <span className="ml-auto text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md bg-white/50 dark:bg-black/20 text-slate-600 dark:text-slate-300 border border-slate-200/50 dark:border-white/5 shadow-sm">{getStatusText(c)}</span>
                        </div>
                        <p className="text-base font-black text-slate-900 dark:text-white truncate">{c.pacientes?.nombres} {c.pacientes?.apellidos}</p>
                        <p className="text-xs text-slate-500 mt-1 truncate"><IdCard size={12} className="inline mr-1 opacity-70"/> C.I: {c.pacientes?.cedula || 'No registrada'}</p>
                        {c.motivo && <p className="text-[12px] font-medium text-slate-500 dark:text-slate-400 mt-3 bg-slate-50 dark:bg-white/5 p-2.5 rounded-lg leading-snug">{c.motivo}</p>}
                      </div>
                  ))
               )}
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL AGENDAR NUEVA CITA CON BUSCADORES INTELIGENTES ================= */}
      {showAgendarModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-white dark:bg-[#111111] w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden flex flex-col overflow-y-auto max-h-[90vh] custom-scrollbar">
            
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-[#161616] sticky top-0 z-10">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CalendarIcon className="text-[#0081a7]" size={20}/> Agendar Nueva Consulta
              </h2>
              <button onClick={() => setShowAgendarModal(false)} className="p-2 text-slate-400 hover:text-rose-500 bg-white dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-full transition-colors"><X size={18} /></button>
            </div>

            <form onSubmit={handleAgendarCita} className="p-6 space-y-5">
              
              {/* === BUSCADOR PREDICTIVO DE PACIENTES === */}
              <div className="relative">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">Buscar Paciente *</label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text"
                    placeholder="Ej. Nombre, apellido o número de cédula..."
                    value={busquedaPaciente}
                    onChange={(e) => {
                      setBusquedaPaciente(e.target.value);
                      setMostrarDropdownPac(true);
                      setNuevaCita({...nuevaCita, id_paciente: ''}); // Resetea la ID si altera el texto
                    }}
                    onFocus={() => setMostrarDropdownPac(true)}
                    onBlur={() => setTimeout(() => setMostrarDropdownPac(false), 200)}
                    required={!nuevaCita.id_paciente}
                    className={`w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-[#1a1a1a] border ${nuevaCita.id_paciente ? 'border-emerald-500/50 focus:ring-emerald-500' : 'border-slate-200 dark:border-white/10 focus:ring-[#0081a7]'} rounded-xl text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-2 transition-all`}
                  />
                </div>
                
                {/* Lista Desplegable de Pacientes */}
                {mostrarDropdownPac && busquedaPaciente.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-white dark:bg-[#16161a] border border-slate-200 dark:border-white/10 rounded-xl shadow-2xl max-h-56 overflow-y-auto custom-scrollbar">
                    {pacientesFiltrados.length > 0 ? (
                      pacientesFiltrados.map(p => (
                        <div 
                          key={p.id} 
                          onMouseDown={() => {
                            setNuevaCita({...nuevaCita, id_paciente: p.id});
                            setBusquedaPaciente(`${p.nombres} ${p.apellidos} - C.I: ${p.cedula || 'N/A'}`);
                            setMostrarDropdownPac(false);
                          }}
                          className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer border-b last:border-0 border-slate-100 dark:border-white/5 transition-colors"
                        >
                          <p className="text-sm font-bold text-slate-800 dark:text-white">{p.nombres} {p.apellidos}</p>
                          <p className="text-xs font-medium text-slate-500 mt-0.5">C.I: {p.cedula || 'No registrada'}</p>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-4 text-center text-sm font-medium text-slate-500">No se encontraron resultados.</div>
                    )}
                  </div>
                )}
              </div>

              {/* === BUSCADOR PREDICTIVO DE MÉDICOS (Solo si no es especialista) === */}
              {!esEspecialista && (
                <div className="relative">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">Buscar Médico Especialista *</label>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="text"
                      placeholder="Nombre del doctor..."
                      value={busquedaMedico}
                      onChange={(e) => {
                        setBusquedaMedico(e.target.value);
                        setMostrarDropdownMed(true);
                        setNuevaCita({...nuevaCita, id_medico: ''}); 
                      }}
                      onFocus={() => setMostrarDropdownMed(true)}
                      onBlur={() => setTimeout(() => setMostrarDropdownMed(false), 200)}
                      required={!nuevaCita.id_medico}
                      className={`w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-[#1a1a1a] border ${nuevaCita.id_medico ? 'border-emerald-500/50 focus:ring-emerald-500' : 'border-slate-200 dark:border-white/10 focus:ring-[#0081a7]'} rounded-xl text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-2 transition-all`}
                    />
                  </div>

                  {/* Lista Desplegable de Médicos */}
                  {mostrarDropdownMed && busquedaMedico.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-white dark:bg-[#16161a] border border-slate-200 dark:border-white/10 rounded-xl shadow-2xl max-h-48 overflow-y-auto custom-scrollbar">
                      {medicosFiltrados.length > 0 ? (
                        medicosFiltrados.map(m => (
                          <div 
                            key={m.id_auth} 
                            onMouseDown={() => {
                              setNuevaCita({...nuevaCita, id_medico: m.id_auth});
                              setBusquedaMedico(`Dr(a). ${m.nombres} ${m.apellidos}`);
                              setMostrarDropdownMed(false);
                            }}
                            className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer border-b last:border-0 border-slate-100 dark:border-white/5 transition-colors"
                          >
                            <p className="text-sm font-bold text-slate-800 dark:text-white">Dr(a). {m.nombres} {m.apellidos}</p>
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-4 text-center text-sm font-medium text-slate-500">No se encontraron doctores.</div>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">Fecha *</label>
                  <input 
                    type="date" 
                    name="fecha" 
                    value={nuevaCita.fecha} 
                    onChange={handleNuevaCitaChange} 
                    required
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#0081a7] transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">Hora *</label>
                  <input 
                    type="time" 
                    name="hora" 
                    value={nuevaCita.hora} 
                    onChange={handleNuevaCitaChange} 
                    required
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#0081a7] transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">Motivo de Consulta (Opcional)</label>
                <textarea 
                  name="motivo" 
                  value={nuevaCita.motivo} 
                  onChange={handleNuevaCitaChange} 
                  rows="2"
                  placeholder="Ej. Chequeo general, lectura de exámenes..."
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl text-sm font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#0081a7] transition-all resize-none"
                ></textarea>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 dark:border-white/5">
                <button type="button" onClick={() => setShowAgendarModal(false)} className="px-5 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={agendando} className="flex items-center gap-2 bg-[#0081a7] hover:bg-[#006b8a] text-white px-6 py-2.5 rounded-xl font-bold shadow-md transition-all disabled:opacity-50">
                  {agendando ? 'Guardando...' : <><Save size={18}/> Agendar Cita</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL DETALLE Y CONTROL DE CITA ================= */}
      {selectedCita && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-[fadeIn_0.2s_ease-out]">
           <div className="bg-white dark:bg-[#111111] w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden flex flex-col max-h-[90vh] overflow-y-auto custom-scrollbar">
              
              <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-[#161616] sticky top-0 z-10">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Clock className="text-cyan-500" size={20}/> Detalle de la Cita
                </h2>
                <button onClick={() => setSelectedCita(null)} className="p-2 text-slate-400 hover:text-rose-500 bg-white dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-full transition-colors"><X size={18} /></button>
              </div>
              
              <div className="p-6 space-y-5">
                
                {/* --- ÁREA DEL PACIENTE CON BOTÓN WHATSAPP --- */}
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Paciente</p>
                    <p className="text-lg font-black text-slate-900 dark:text-white leading-tight">{selectedCita.pacientes?.nombres} {selectedCita.pacientes?.apellidos}</p>
                    <p className="text-sm font-medium text-slate-500 mt-1">C.I: {selectedCita.pacientes?.cedula || 'N/A'}</p>
                  </div>
                  
                  <button 
                    onClick={() => handleWhatsApp(selectedCita)}
                    className="flex items-center gap-2 bg-[#25D366] hover:bg-[#1ebd53] text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-md transition-transform hover:-translate-y-0.5 shrink-0 ml-2"
                  >
                    <MessageCircle size={16} /> WhatsApp
                  </button>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Fecha y Hora</p>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      {new Date(selectedCita.fecha_consulta).toLocaleDateString('es-ES')}
                    </p>
                    <p className="text-sm font-bold text-cyan-600 dark:text-cyan-400">
                      {formatHora(selectedCita.fecha_consulta)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Estado Actual</p>
                    <span className={`inline-block px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wide ${getStatusColorSolid(selectedCita)} text-white`}>
                      {getStatusText(selectedCita)}
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Motivo / Notas</p>
                  <div className="bg-slate-50 dark:bg-[#1a1a1a] p-4 rounded-xl border border-slate-200 dark:border-white/5 text-sm font-medium text-slate-600 dark:text-slate-300 min-h-[80px]">
                    {selectedCita.motivo || 'Sin notas adicionales.'}
                  </div>
                </div>
              </div>
              
              <div className="p-6 border-t border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-[#161616] space-y-5">
                
                {/* BOTÓN RÁPIDO PARA DEPARTAMENTO */}
                {selectedCita.estado === 'Agendada' && !isCitaExpirada(selectedCita.fecha_consulta, selectedCita.estado) && (
                  <button 
                    onClick={() => handleRemitirMedico(selectedCita.id)} 
                    disabled={remitiendo}
                    className="w-full bg-[#0081a7] hover:bg-[#006b8a] text-white px-6 py-3 rounded-xl font-bold shadow-md disabled:opacity-50 text-sm flex items-center justify-center gap-2 transition-transform hover:-translate-y-1"
                  >
                    {remitiendo ? 'Remitiendo...' : 'Acción Rápida: Remitir a Sala de Espera'}
                  </button>
                )}

                {/* CONTROL MANUAL DE ESTADOS */}
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Control Manual de Estado</p>
                  <div className="flex flex-col sm:flex-row items-center gap-2">
                    <select 
                      value={nuevoEstado} 
                      onChange={(e) => setNuevoEstado(e.target.value)}
                      className="w-full sm:flex-1 px-3 py-2.5 bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-[#0081a7] transition-all"
                    >
                      <option value="Agendada">Agendada</option>
                      <option value="En Espera">En Espera</option>
                      <option value="En Consulta">En Consulta</option>
                      <option value="Finalizada">Finalizada (Completada)</option>
                      <option value="No Asistió">No Asistió</option>
                      <option value="Cancelada">Cancelada</option>
                    </select>
                    <button 
                      onClick={() => handleActualizarEstado(selectedCita.id)}
                      disabled={actualizandoEstado || nuevoEstado === selectedCita.estado}
                      className="w-full sm:w-auto bg-slate-800 hover:bg-black dark:bg-white/10 dark:hover:bg-white/20 text-white px-5 py-2.5 rounded-xl font-bold shadow-sm disabled:opacity-50 text-sm transition-colors shrink-0"
                    >
                      {actualizandoEstado ? '...' : 'Actualizar'}
                    </button>
                  </div>
                </div>

              </div>

           </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.95) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 10px; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #3f3f46; }
      `}</style>
    </div>
  );
}