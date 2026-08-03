import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { 
  ShieldCheck, Users, Clock, LogOut, Menu, Sun, Moon, 
  Search, X, PanelLeft, CheckCircle, AlertCircle, XCircle, 
  UserCheck, UserX, Activity, Stethoscope, Mail, Phone, Briefcase, 
  Filter, CalendarDays, FileDigit, MessageCircle, ChevronDown, ChevronUp
} from 'lucide-react';

export default function Directiva() {
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
  
  // 🔥 ESTADO DE NAVEGACIÓN Y FILTROS 🔥
  const [activeTab, setActiveTab] = useState('validacion');
  const [filtroEspecialidad, setFiltroEspecialidad] = useState('');
  
  // 🔥 NUEVO: Estado para saber qué fila de la tabla está desplegada 🔥
  const [filaExpandida, setFilaExpandida] = useState(null);

  // ================= ESTADOS DE DATOS =================
  const [userData, setUserData] = useState(null);
  const [listaUsuarios, setListaUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [procesandoId, setProcesandoId] = useState(null);

  // ================= TOAST NOTIFICATIONS =================
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 4000);
  };

  // ================= CARGA DE DATOS =================
  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return navigate('/login');

      const { data: dbUser } = await supabase.from('usuarios').select('*').eq('id_auth', session.user.id).single();
      
      if (!dbUser || dbUser.rol !== 'directivo') {
        await supabase.auth.signOut();
        return navigate('/login');
      }
      
      setUserData(dbUser);

      const { data: dbUsuarios, error } = await supabase
        .from('usuarios')
        .select('*')
        .neq('id_auth', session.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setListaUsuarios(dbUsuarios || []);

    } catch (error) {
      console.error(error);
      showToast("Error al cargar los datos.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [navigate]);

  const handleLogout = async () => { await supabase.auth.signOut(); navigate('/login'); };
  
  const formatearFecha = (fechaString) => {
    if (!fechaString) return 'Desconocida';
    const opciones = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(fechaString).toLocaleDateString('es-ES', opciones);
  };

  // ================= WHATSAPP INTEGRACIÓN =================
  const abrirWhatsApp = (telefono, nombres, rol, estado) => {
    if (!telefono) return showToast("Este usuario no tiene número registrado.", "error");
    let num = telefono.replace(/\D/g, '');
    if (num.startsWith('0')) num = '58' + num.substring(1);
    else if (!num.startsWith('58') && num.length === 10) num = '58' + num;

    const titulo = rol === 'departamento' ? '' : 'Dr(a). ';
    let mensaje = "";

    if (estado === 'Aprobado') {
      mensaje = `Hola ${titulo}${nombres}, te escribimos de la Junta Directiva del Hospital Dr. Juvenal Bracho. Nos complace informarte que tu cuenta en SOMA ha sido aprobada y ya puedes acceder a todas las funciones del sistema.`;
    } else if (estado === 'Pendiente') {
      mensaje = `Hola ${titulo}${nombres}, te escribimos de la Junta Directiva del Hospital Dr. Juvenal Bracho. Estamos revisando tu solicitud de acceso al sistema SOMA...`;
    } else {
      mensaje = `Hola ${titulo}${nombres}, te escribimos de la Junta Directiva del Hospital Dr. Juvenal Bracho para conversar sobre tu cuenta en SOMA.`;
    }

    window.open(`https://wa.me/${num}?text=${encodeURIComponent(mensaje)}`, '_blank');
  };

  // ================= LÓGICA DE VALIDACIÓN =================
  const cambiarEstadoCuenta = async (usuarioId, nuevoEstado, e) => {
    e.stopPropagation(); // Evita que la fila se expanda al hacer clic en los botones
    setProcesandoId(usuarioId);
    try {
      const { error } = await supabase
        .from('usuarios')
        .update({ estado_cuenta: nuevoEstado })
        .eq('id', usuarioId);

      if (error) throw error;

      setListaUsuarios(prev => 
        prev.map(u => u.id === usuarioId ? { ...u, estado_cuenta: nuevoEstado } : u)
      );

      if (nuevoEstado === 'Aprobado') showToast("Usuario aprobado. Ya puede ingresar al sistema.", "success");
      else if (nuevoEstado === 'Rechazada') showToast("Acceso denegado a este usuario.", "error");
      else showToast("Cuenta suspendida temporalmente.", "success");

    } catch (error) {
      showToast("Error al cambiar el estado: " + error.message, "error");
    } finally {
      setProcesandoId(null);
    }
  };

  const toggleFila = (id) => {
    if (filaExpandida === id) setFilaExpandida(null);
    else setFilaExpandida(id);
  };

  // ================= FILTROS Y ESTADÍSTICAS =================
  const usuariosBuscados = listaUsuarios.filter(u => {
    const term = busqueda.toLowerCase();
    return (u.nombres || '').toLowerCase().includes(term) || 
           (u.apellidos || '').toLowerCase().includes(term) || 
           (u.correo || '').toLowerCase().includes(term) ||
           (u.cedula || '').toLowerCase().includes(term);
  });

  const todosLosEspecialistas = listaUsuarios.filter(u => ['especialista', 'medico', 'médico'].includes((u.rol || '').toLowerCase()));
  const todosLosAsistentes = listaUsuarios.filter(u => u.rol === 'departamento');
  
  const especialidadesUnicas = [...new Set(todosLosEspecialistas.map(e => e.especialidad || 'Medicina General'))].filter(Boolean).sort();

  let especialistasAMostrar = usuariosBuscados.filter(u => ['especialista', 'medico', 'médico'].includes((u.rol || '').toLowerCase()));
  const asistentesAMostrar = usuariosBuscados.filter(u => u.rol === 'departamento');

  if (filtroEspecialidad && activeTab === 'especialistas') {
    especialistasAMostrar = especialistasAMostrar.filter(e => (e.especialidad || 'Medicina General') === filtroEspecialidad);
  }

  const totalPendientes = listaUsuarios.filter(u => u.estado_cuenta === 'Pendiente').length;
  const totalAprobados = listaUsuarios.filter(u => u.estado_cuenta === 'Aprobado').length;

  // ================= RENDERIZADO DE TARJETAS (DIRECTORIOS) =================
  const renderTarjetaUsuario = (usuario) => {
    const isEspecialista = ['especialista', 'medico', 'médico'].includes((usuario.rol || '').toLowerCase());
    
    return (
      <div key={usuario.id} className="bg-white dark:bg-[#111111] p-6 rounded-3xl border border-slate-200 dark:border-white/5 shadow-md flex flex-col items-center text-center group hover:border-[#0081a7] dark:hover:border-cyan-800 transition-all relative">
        
        {/* Etiqueta de Estado en la tarjeta */}
        <span className={`absolute top-4 left-4 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md ${
          usuario.estado_cuenta === 'Aprobado' ? 'text-emerald-600 bg-emerald-100/50 dark:text-emerald-400 dark:bg-emerald-900/20' :
          usuario.estado_cuenta === 'Pendiente' ? 'text-amber-600 bg-amber-100/50 dark:text-amber-400 dark:bg-amber-900/20' :
          'text-rose-600 bg-rose-100/50 dark:text-rose-400 dark:bg-rose-900/20'
        }`}>
          {usuario.estado_cuenta}
        </span>

        {/* Avatar */}
        <div className={`w-20 h-20 rounded-full flex items-center justify-center text-xl font-black mb-3 border-4 mt-2 ${
          usuario.estado_cuenta === 'Aprobado' ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-900/50' :
          usuario.estado_cuenta === 'Pendiente' ? 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-900/50' :
          'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-900/50'
        }`}>
          {(usuario.nombres || 'U').charAt(0)}{(usuario.apellidos || '').charAt(0)}
        </div>
        
        {/* Datos Personales */}
        <h3 className="font-bold text-lg text-slate-900 dark:text-white leading-tight">
          {isEspecialista ? 'Dr(a). ' : ''}{usuario.nombres} {usuario.apellidos}
        </h3>
        
        <p className="text-[#0081a7] dark:text-cyan-400 text-[10px] font-bold mt-1.5 uppercase tracking-widest">
          {isEspecialista ? (usuario.especialidad || 'Medicina General') : 'DPTO. HISTORIAS CLÍNICAS'}
        </p>
        
        <div className="w-full h-px bg-slate-100 dark:bg-white/5 my-5"></div>
        
        {/* Contacto */}
        <div className="w-full space-y-3 text-left mb-6">
          <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
            <Mail size={16} className="text-slate-400 dark:text-slate-500 shrink-0" />
            <span className="truncate">{usuario.correo}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
            <Phone size={16} className="text-slate-400 dark:text-slate-500 shrink-0" />
            <span>{usuario.telefono || 'Sin registro'}</span>
          </div>
        </div>

        {/* Botón WhatsApp inferior */}
        <button 
          onClick={() => abrirWhatsApp(usuario.telefono, usuario.nombres, usuario.rol, usuario.estado_cuenta)}
          className="w-full bg-[#25D366] hover:bg-[#1ebd53] text-white py-2.5 rounded-xl text-sm font-bold shadow-md flex items-center justify-center gap-2 transition-all mt-auto"
        >
          <MessageCircle size={18} /> Contactar
        </button>

      </div>
    );
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-[#0B0D12] text-slate-800 dark:text-slate-200 font-sans overflow-hidden transition-colors duration-300 antialiased tracking-normal">
      {isSidebarOpen && <div className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm transition-opacity" onClick={() => setIsSidebarOpen(false)} />}

      {/* ================= ALERTA FLOTANTE (TOAST) ================= */}
      <div 
        className={`fixed top-6 right-6 z-[9999] flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl border transition-all duration-300 transform ${
          toast.visible ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0 pointer-events-none'
        } ${
          toast.type === 'success' 
            ? 'bg-emerald-50 dark:bg-[#064e3b] border-emerald-200 dark:border-emerald-800' 
            : 'bg-rose-50 dark:bg-[#4c0519] border-rose-200 dark:border-rose-800'
        }`}
      >
        {toast.type === 'success' ? <CheckCircle size={24} className="text-emerald-600 dark:text-emerald-400" /> : <AlertCircle size={24} className="text-rose-600 dark:text-rose-400" />}
        <span className={`font-bold text-sm ${toast.type === 'success' ? 'text-emerald-800 dark:text-emerald-100' : 'text-rose-800 dark:text-rose-100'}`}>{toast.message}</span>
      </div>

      {/* ================= SIDEBAR DIRECTIVO ================= */}
      <aside className={`fixed inset-y-0 left-0 z-50 bg-white dark:bg-[#16161a] border-r border-slate-200/80 dark:border-white/[0.04] flex flex-col justify-between transform transition-all duration-300 ease-in-out md:relative md:translate-x-0 md:m-4 md:mr-0 md:rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none ${isSidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64'} ${isCollapsed ? 'md:w-24' : 'md:w-68'}`}>
        <div>
          <div className={`h-20 flex items-center transition-all ${isCollapsed ? 'justify-center' : 'justify-between px-6'}`}>
            <div className="flex items-center overflow-hidden whitespace-nowrap">
              {isCollapsed ? <span className="text-[#0081a7] text-3xl mb-1 font-black">*</span> : <><img src="/soma_logo.png" alt="SOMA Logo" className="h-6 object-contain block dark:hidden" /><img src="/soma_logo_blanco.png" alt="SOMA Logo" className="h-6 object-contain hidden dark:block" /></>}
            </div>
            {!isCollapsed && <button className="md:hidden text-slate-400 hover:text-rose-500 transition-colors" onClick={() => setIsSidebarOpen(false)}><X size={20} /></button>}
          </div>
          <div className={`py-4 ${isCollapsed ? 'px-3' : 'px-4'}`}>
            {!isCollapsed && <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-3 px-3 tracking-widest uppercase">Administración</p>}
            <nav className="space-y-2">
              <button 
                onClick={() => {setActiveTab('validacion'); setFiltroEspecialidad('');}} 
                className={`w-full flex items-center gap-3 py-3 rounded-xl font-bold transition-all ${activeTab === 'validacion' ? 'bg-[#0081a7]/10 text-[#0081a7] dark:bg-cyan-900/20 dark:text-cyan-400' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5'} ${isCollapsed ? 'justify-center px-0' : 'px-4'}`}
              >
                <ShieldCheck size={20} className="shrink-0" />{!isCollapsed && <span className="whitespace-nowrap text-sm">Validación de Cuentas</span>}
              </button>
              <button 
                onClick={() => setActiveTab('especialistas')} 
                className={`w-full flex items-center gap-3 py-3 rounded-xl font-bold transition-all ${activeTab === 'especialistas' ? 'bg-[#0081a7]/10 text-[#0081a7] dark:bg-cyan-900/20 dark:text-cyan-400' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5'} ${isCollapsed ? 'justify-center px-0' : 'px-4'}`}
              >
                <Stethoscope size={20} className="shrink-0" />{!isCollapsed && <span className="whitespace-nowrap text-sm">Especialistas</span>}
              </button>
              <button 
                onClick={() => {setActiveTab('asistentes'); setFiltroEspecialidad('');}} 
                className={`w-full flex items-center gap-3 py-3 rounded-xl font-bold transition-all ${activeTab === 'asistentes' ? 'bg-[#0081a7]/10 text-[#0081a7] dark:bg-cyan-900/20 dark:text-cyan-400' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5'} ${isCollapsed ? 'justify-center px-0' : 'px-4'}`}
              >
                <Briefcase size={20} className="shrink-0" />{!isCollapsed && <span className="whitespace-nowrap text-sm">Asistentes</span>}
              </button>
            </nav>
          </div>
        </div>
        
        <div className={`p-4 border-t border-slate-200 dark:border-white/5 flex flex-col ${isCollapsed ? 'items-center' : ''}`}>
          <div className={`flex items-center gap-3 mb-4 ${isCollapsed ? 'justify-center' : 'px-2'}`}>
            <div className="w-8 h-8 shrink-0 rounded-full bg-slate-800 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-white border border-slate-700 dark:border-white/20">
              JD
            </div>
            {!isCollapsed && (
              <div className="overflow-hidden">
                <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-tight">Junta Directiva</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight truncate">
                  Hospital Dr. Juvenal Bracho
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
        <header className="h-16 flex items-center justify-between px-6 lg:px-8 border-b border-slate-200 dark:border-white/5 bg-white/50 dark:bg-[#111111]/80 backdrop-blur-sm sticky top-0 z-30 shrink-0">
          <div className="flex items-center gap-4">
            <button className="text-slate-500 md:hidden p-2" onClick={() => setIsSidebarOpen(true)}><Menu size={24} /></button>
            <button className="hidden md:flex p-2 text-slate-400 hover:text-white rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10" onClick={() => setIsCollapsed(!isCollapsed)}><PanelLeft size={20} /></button>
          </div>
          <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 text-slate-400 hover:text-yellow-400 bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 transition-colors">
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </header>

        <div className="flex-1 overflow-y-auto w-full custom-scrollbar pb-10">
          
          <div className="p-4 md:p-8 max-w-[1600px] mx-auto w-full animate-[fadeIn_0.3s_ease-out]">
            
            {/* ENCABEZADO Y TARJETAS DE RESUMEN (Solo en Validación) */}
            {activeTab === 'validacion' && (
              <>
                <div className="mb-8">
                  <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2">Panel de Control Directivo</h1>
                  <p className="text-slate-500 dark:text-slate-400 font-medium">Revisa y valida las credenciales del personal registrado en el Hospital Dr. Juvenal Bracho.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-white dark:bg-[#111111] p-6 rounded-3xl border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none flex items-center gap-5">
                    <div className="w-14 h-14 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-600 dark:text-amber-500 shrink-0"><Clock size={28} /></div>
                    <div>
                      <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Por Revisar</p>
                      <p className="text-3xl font-black text-slate-900 dark:text-white leading-none">{totalPendientes}</p>
                    </div>
                  </div>
                  <div className="bg-white dark:bg-[#111111] p-6 rounded-3xl border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none flex items-center gap-5">
                    <div className="w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 dark:text-emerald-500 shrink-0"><UserCheck size={28} /></div>
                    <div>
                      <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Personal Activo</p>
                      <p className="text-3xl font-black text-slate-900 dark:text-white leading-none">{totalAprobados}</p>
                    </div>
                  </div>
                  <div className="bg-white dark:bg-[#111111] p-6 rounded-3xl border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none flex items-center gap-5">
                    <div className="w-14 h-14 rounded-full bg-[#0081a7]/10 dark:bg-cyan-900/20 flex items-center justify-center text-[#0081a7] dark:text-cyan-500 shrink-0"><Users size={28} /></div>
                    <div>
                      <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Total Registros</p>
                      <p className="text-3xl font-black text-slate-900 dark:text-white leading-none">{listaUsuarios.length}</p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ENCABEZADOS DIRECTORIOS */}
            {activeTab === 'especialistas' && (
              <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <div className="flex items-center gap-4 mb-2">
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Directorio de Especialistas</h1>
                    <span className="bg-[#0081a7]/10 text-[#0081a7] dark:bg-cyan-900/30 dark:text-cyan-400 text-sm font-bold px-4 py-1.5 rounded-full border border-[#0081a7]/20 dark:border-cyan-800/50">
                      {todosLosEspecialistas.length} Registrados
                    </span>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 font-medium">Información de contacto y estado del cuerpo médico del Hospital Dr. Juvenal Bracho.</p>
                </div>
              </div>
            )}

            {activeTab === 'asistentes' && (
              <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <div className="flex items-center gap-4 mb-2">
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Directorio de Asistentes</h1>
                    <span className="bg-[#0081a7]/10 text-[#0081a7] dark:bg-cyan-900/30 dark:text-cyan-400 text-sm font-bold px-4 py-1.5 rounded-full border border-[#0081a7]/20 dark:border-cyan-800/50">
                      {todosLosAsistentes.length} Registrados
                    </span>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 font-medium">Personal encargado del departamento de historias clínicas y admisión del Hospital Dr. Juvenal Bracho.</p>
                </div>
              </div>
            )}

            {/* BUSCADOR GLOBAL Y FILTROS */}
            <div className="bg-white dark:bg-[#111111] p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-white/5 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
               <h3 className="text-lg font-bold text-slate-900 dark:text-white hidden md:block">
                 {activeTab === 'validacion' ? 'Gestión de Cuentas' : 'Búsqueda de Personal'}
               </h3>
               <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                  {/* Select Especialidad (Solo visible en la pestaña Especialistas) */}
                  {activeTab === 'especialistas' && (
                    <div className="relative w-full md:w-56">
                      <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                      <select 
                        value={filtroEspecialidad} 
                        onChange={(e) => setFiltroEspecialidad(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-[#0081a7] transition-all text-sm text-slate-900 dark:text-white appearance-none font-bold"
                      >
                        <option value="">Todas las especialidades</option>
                        {especialidadesUnicas.map(esp => (
                          <option key={esp} value={esp}>{esp}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Input Búsqueda */}
                  <div className="relative w-full md:w-80">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="text" 
                      placeholder="Buscar por nombre, correo..." 
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-[#0081a7] transition-all text-sm text-slate-900 dark:text-white" 
                      value={busqueda} 
                      onChange={(e) => setBusqueda(e.target.value)}
                    />
                  </div>
               </div>
            </div>

            {loading ? ( 
              <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0081a7]"></div></div> 
            ) : (
              <>
                {/* ================= VISTA: VALIDACIÓN DE CUENTAS (TABLA CON ACORDEÓN) ================= */}
                {activeTab === 'validacion' && (
                  <div className="bg-white dark:bg-[#111111] rounded-[2rem] shadow-xl overflow-hidden border border-slate-200 dark:border-white/5 animate-[fadeIn_0.2s_ease-out]">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left whitespace-nowrap">
                        <thead className="bg-slate-50 dark:bg-[#16161a]">
                          <tr className="text-slate-500 dark:text-slate-400 text-[11px] font-black uppercase tracking-widest border-b border-slate-200 dark:border-white/5">
                            <th className="px-6 py-4">Usuario</th>
                            <th className="px-6 py-4">Rol Solicitado</th>
                            <th className="px-6 py-4">Estado Actual</th>
                            <th className="px-6 py-4 text-center">Acciones</th>
                            <th className="px-4 py-4"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                          {usuariosBuscados.map((usuario) => (
                            <React.Fragment key={usuario.id}>
                              <tr 
                                onClick={() => toggleFila(usuario.id)} 
                                className="hover:bg-slate-50/50 dark:hover:bg-[#16161a]/50 transition-colors cursor-pointer group"
                              >
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold text-sm shrink-0">
                                      {(usuario.nombres || 'U').charAt(0)}{(usuario.apellidos || '').charAt(0)}
                                    </div>
                                    <div>
                                      <p className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-[#0081a7] dark:group-hover:text-cyan-400 transition-colors">
                                        {usuario.nombres} {usuario.apellidos}
                                      </p>
                                      <p className="text-xs text-slate-500">{usuario.correo}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300 capitalize">
                                    {usuario.rol === 'departamento' ? 'Asistente' : usuario.rol}
                                  </span>
                                </td>
                                <td className="px-6 py-4">
                                  {usuario.estado_cuenta === 'Pendiente' && (
                                    <span className="inline-flex items-center gap-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-500 px-3 py-1.5 rounded-full text-xs font-bold border border-amber-200 dark:border-amber-800/30">
                                      <Clock size={14} /> En Revisión
                                    </span>
                                  )}
                                  {usuario.estado_cuenta === 'Aprobado' && (
                                    <span className="inline-flex items-center gap-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-500 px-3 py-1.5 rounded-full text-xs font-bold border border-emerald-200 dark:border-emerald-800/30">
                                      <CheckCircle size={14} /> Activo
                                    </span>
                                  )}
                                  {usuario.estado_cuenta === 'Rechazada' && (
                                    <span className="inline-flex items-center gap-1.5 bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-500 px-3 py-1.5 rounded-full text-xs font-bold border border-rose-200 dark:border-rose-800/30">
                                      <XCircle size={14} /> Denegado
                                    </span>
                                  )}
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex items-center justify-center gap-2">
                                    {usuario.estado_cuenta !== 'Aprobado' && (
                                      <button onClick={(e) => cambiarEstadoCuenta(usuario.id, 'Aprobado', e)} disabled={procesandoId === usuario.id} title="Aprobar Acceso" className="p-2 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white dark:bg-emerald-900/20 dark:text-emerald-500 dark:hover:bg-emerald-600 transition-colors disabled:opacity-50"><UserCheck size={18} /></button>
                                    )}
                                    {usuario.estado_cuenta !== 'Rechazada' && (
                                      <button onClick={(e) => cambiarEstadoCuenta(usuario.id, 'Rechazada', e)} disabled={procesandoId === usuario.id} title="Denegar Acceso" className="p-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white dark:bg-rose-900/20 dark:text-rose-500 dark:hover:bg-rose-600 transition-colors disabled:opacity-50"><UserX size={18} /></button>
                                    )}
                                    {usuario.estado_cuenta === 'Aprobado' && (
                                      <button onClick={(e) => cambiarEstadoCuenta(usuario.id, 'Pendiente', e)} disabled={procesandoId === usuario.id} title="Suspender (Poner en Revisión)" className="p-2 rounded-xl bg-amber-50 text-amber-600 hover:bg-amber-500 hover:text-white dark:bg-amber-900/20 dark:text-amber-500 dark:hover:bg-amber-600 transition-colors disabled:opacity-50"><Clock size={18} /></button>
                                    )}
                                  </div>
                                </td>
                                <td className="px-4 py-4 text-slate-400">
                                  {filaExpandida === usuario.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                </td>
                              </tr>

                              {/* FILA EXPANDIBLE CON LOS DETALLES EXTRAS Y WHATSAPP */}
                              {filaExpandida === usuario.id && (
                                <tr className="bg-slate-50/50 dark:bg-white/[0.02] border-b border-slate-200 dark:border-white/5 animate-[fadeIn_0.2s_ease-out]">
                                  <td colSpan="5" className="px-6 py-6">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pl-14">
                                      <div className="flex flex-wrap gap-8">
                                        <div>
                                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Cédula</p>
                                          <p className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5"><FileDigit size={14} className="text-slate-400" /> {usuario.cedula || 'No registrada'}</p>
                                        </div>
                                        <div>
                                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Teléfono</p>
                                          <p className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5"><Phone size={14} className="text-slate-400" /> {usuario.telefono || 'No registrado'}</p>
                                        </div>
                                        <div>
                                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Fecha de Registro</p>
                                          <p className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5"><CalendarDays size={14} className="text-slate-400" /> {formatearFecha(usuario.created_at)}</p>
                                        </div>
                                        {usuario.rol !== 'departamento' && (
                                          <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Especialidad</p>
                                            <p className="text-sm font-bold text-[#0081a7] dark:text-cyan-400 flex items-center gap-1.5"><Stethoscope size={14} /> {usuario.especialidad || 'General'}</p>
                                          </div>
                                        )}
                                      </div>
                                      
                                      <button 
                                        onClick={() => abrirWhatsApp(usuario.telefono, usuario.nombres, usuario.rol, usuario.estado_cuenta)}
                                        className="bg-[#25D366] hover:bg-[#1ebd53] text-white px-5 py-2 rounded-xl text-sm font-bold shadow-md flex items-center justify-center gap-2 transition-all"
                                      >
                                        <MessageCircle size={18} /> Contactar
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          ))}
                          
                          {usuariosBuscados.length === 0 && (
                            <tr>
                              <td colSpan="5" className="px-6 py-12 text-center">
                                <Activity size={48} className="mx-auto text-slate-300 dark:text-slate-700 mb-3" />
                                <p className="text-slate-500 dark:text-slate-400 font-medium">No se encontraron usuarios que coincidan con la búsqueda.</p>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* ================= VISTA: ESPECIALISTAS (CARDS) ================= */}
                {activeTab === 'especialistas' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-[fadeIn_0.2s_ease-out]">
                    {especialistasAMostrar.map(renderTarjetaUsuario)}
                    {especialistasAMostrar.length === 0 && (
                      <div className="col-span-full py-16 text-center bg-white dark:bg-[#111111] rounded-3xl border border-slate-200 dark:border-white/5 shadow-sm">
                        <Stethoscope size={48} className="mx-auto text-slate-300 dark:text-slate-700 mb-3" />
                        <p className="text-slate-500 dark:text-slate-400 font-bold">No se encontraron especialistas con este filtro.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* ================= VISTA: ASISTENTES (CARDS) ================= */}
                {activeTab === 'asistentes' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-[fadeIn_0.2s_ease-out]">
                    {asistentesAMostrar.map(renderTarjetaUsuario)}
                    {asistentesAMostrar.length === 0 && (
                      <div className="col-span-full py-16 text-center bg-white dark:bg-[#111111] rounded-3xl border border-slate-200 dark:border-white/5 shadow-sm">
                        <Briefcase size={48} className="mx-auto text-slate-300 dark:text-slate-700 mb-3" />
                        <p className="text-slate-500 dark:text-slate-400 font-bold">No hay asistentes registrados o que coincidan con la búsqueda.</p>
                      </div>
                    )}
                  </div>
                )}

              </>
            )}
          </div>

        </div>
      </main>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.98) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #3f3f46; border-radius: 10px; }
      `}</style>
    </div>
  );
}