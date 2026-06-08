import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { 
  Home, Users, FileText, Calendar, User, Settings, LogOut, 
  Menu, Sun, Moon, X, PanelLeft, Activity, FileBadge, 
  Mail, MapPin, Smartphone, Link as LinkIcon, Save, Check
} from 'lucide-react';

export default function Perfil() {
  const navigate = useNavigate();
  
  // ================= ESTADOS DE UI =================
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // ================= ESTADOS DE DATOS =================
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState('');
  
  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    cedula: '',
    rif: '',
    mpps: '',
    colegio_medico: '',
    telefono: '',
    fecha_nacimiento: '',
    sexo: '',
    email: '', // Correo de la sesión
    instagram: '',
    pagina_web: '',
    direccion: ''
  });

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDarkMode]);

  // ================= CARGA DE DATOS =================
  useEffect(() => {
    let isMounted = true;

    const fetchUser = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (!session || sessionError) return navigate('/login');

        const { data: dbUser } = await supabase
          .from('usuarios')
          .select('*')
          .eq('id_auth', session.user.id)
          .single();

        if (isMounted && dbUser) {
          setFormData({
            nombres: dbUser.nombres || '',
            apellidos: dbUser.apellidos || '',
            cedula: dbUser.cedula || '',
            rif: dbUser.rif || '',
            mpps: dbUser.mpps || '',
            colegio_medico: dbUser.colegio_medico || '',
            telefono: dbUser.telefono || '',
            fecha_nacimiento: dbUser.fecha_nacimiento || '',
            sexo: dbUser.sexo || '',
            email: session.user.email || '', // Tomamos el email directo de Auth
            instagram: dbUser.instagram || '',
            pagina_web: dbUser.pagina_web || '',
            direccion: dbUser.direccion || ''
          });
        }
        if (isMounted) setLoading(false);
      } catch (error) {
        console.error("Error cargando perfil:", error);
        if (isMounted) setLoading(false);
      }
    };

    fetchUser();
    return () => { isMounted = false; };
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const getInitials = () => {
    if (!formData.nombres || !formData.apellidos) return "DR";
    return `${formData.nombres.charAt(0)}${formData.apellidos.charAt(0)}`.toUpperCase();
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGuardarPerfil = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setMensajeExito('');
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      // Preparamos los datos a enviar (excluimos el email porque viene de auth)
      const dataToUpdate = { ...formData };
      delete dataToUpdate.email; 

      const { error } = await supabase
        .from('usuarios')
        .update(dataToUpdate)
        .eq('id_auth', session.user.id);

      if (error) {
        if (error.message.includes('column')) {
          alert("Debes agregar las columnas faltantes (rif, mpps, etc.) en la tabla 'usuarios' de Supabase.");
        } else throw error;
      } else {
        setMensajeExito('Perfil actualizado correctamente.');
        setTimeout(() => setMensajeExito(''), 3000);
      }
    } catch (error) {
      alert("Error al actualizar perfil: " + error.message);
    } finally {
      setGuardando(false);
    }
  };

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
    <div className="flex h-screen bg-slate-100 dark:bg-[#0B0D12] text-slate-800 dark:text-slate-200 font-sans overflow-hidden transition-colors duration-300 antialiased">
      
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
              <Link to="/estadisticas" className={`flex items-center gap-3 py-3 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/[0.03] rounded-xl font-medium transition-all ${isCollapsed ? 'justify-center px-0' : 'px-4'}`}>
                <Activity size={20} className="shrink-0" />
                {!isCollapsed && <span className="whitespace-nowrap text-sm">Estadísticas</span>}
              </Link>
            </nav>
          </div>

          {/* Menú: Configuración */}
          <div className={`pt-2 ${isCollapsed ? 'px-3' : 'px-4'}`}>
            {!isCollapsed && <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-3 px-3 tracking-widest uppercase">Configuración</p>}
            <nav className="space-y-1.5">
              <Link to="/perfil" className={`flex items-center gap-3 py-3 bg-emerald-500/10 dark:bg-white/10 text-emerald-600 dark:text-white rounded-xl font-bold transition-all ${isCollapsed ? 'justify-center px-0' : 'px-4'}`}>
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
                  {formData.nombres || 'Dr.'} {formData.apellidos || ''}
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
        <div className="p-6 sm:p-8 max-w-[1000px] mx-auto w-full space-y-6 animate-[fadeIn_0.3s_ease-out]">
          
          {/* Cabecera Principal */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Mi perfil</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Configura tu información personal y presencia web.</p>
            </div>
            {mensajeExito && (
              <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-4 py-2 rounded-lg text-sm font-bold animate-[fadeIn_0.3s_ease-out]">
                <Check size={16} /> {mensajeExito}
              </div>
            )}
          </div>

          <form onSubmit={handleGuardarPerfil} className="space-y-6">
            
            {/* TARJETA 1: Cédula, RIF y colegiatura */}
            <div className="bg-white dark:bg-[#16161a] border border-slate-200 dark:border-white/5 rounded-[2rem] p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 flex items-center justify-center shrink-0">
                  <FileBadge size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">Cédula, RIF y colegiatura</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Identificación personal, fiscal y número ante MPPS / colegio médico</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-400 mb-2">Número de identidad</label>
                  <input type="text" name="cedula" value={formData.cedula} onChange={handleChange} className="w-full px-4 py-3 bg-white dark:bg-[#111111] border border-slate-200 dark:border-white/10 rounded-xl text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-cyan-500 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-400 mb-2">RIF</label>
                  <input type="text" name="rif" value={formData.rif} onChange={handleChange} className="w-full px-4 py-3 bg-white dark:bg-[#111111] border border-slate-200 dark:border-white/10 rounded-xl text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-cyan-500 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-400 mb-2">M.P.P.S.</label>
                  <input type="text" name="mpps" value={formData.mpps} onChange={handleChange} className="w-full px-4 py-3 bg-white dark:bg-[#111111] border border-slate-200 dark:border-white/10 rounded-xl text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-cyan-500 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-400 mb-2">N° Colegio Médico</label>
                  <input type="text" name="colegio_medico" value={formData.colegio_medico} onChange={handleChange} className="w-full px-4 py-3 bg-white dark:bg-[#111111] border border-slate-200 dark:border-white/10 rounded-xl text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-cyan-500 transition-all" />
                </div>
              </div>
            </div>

            {/* TARJETA 2: Datos Personales */}
            <div className="bg-white dark:bg-[#16161a] border border-slate-200 dark:border-white/5 rounded-[2rem] p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-900/20 text-purple-500 flex items-center justify-center shrink-0">
                  <User size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">Datos personales</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Nombre, nacimiento y sexo</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-400 mb-2">Primer nombre</label>
                  <input type="text" name="nombres" value={formData.nombres} onChange={handleChange} className="w-full px-4 py-3 bg-white dark:bg-[#111111] border border-slate-200 dark:border-white/10 rounded-xl text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-cyan-500 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-400 mb-2">Primer apellido</label>
                  <input type="text" name="apellidos" value={formData.apellidos} onChange={handleChange} className="w-full px-4 py-3 bg-white dark:bg-[#111111] border border-slate-200 dark:border-white/10 rounded-xl text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-cyan-500 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-400 mb-2">Teléfono</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <span className="text-sm">🇻🇪 +58</span>
                    </div>
                    <input type="text" name="telefono" value={formData.telefono} onChange={handleChange} className="w-full pl-16 pr-4 py-3 bg-white dark:bg-[#111111] border border-slate-200 dark:border-white/10 rounded-xl text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-cyan-500 transition-all" placeholder="412-1234567" />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-400 mb-2">Fecha de nacimiento</label>
                  <input type="date" name="fecha_nacimiento" value={formData.fecha_nacimiento} onChange={handleChange} className="w-full px-4 py-3 bg-white dark:bg-[#111111] border border-slate-200 dark:border-white/10 rounded-xl text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-cyan-500 transition-all [&::-webkit-calendar-picker-indicator]:dark:invert" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-400 mb-2">Sexo</label>
                  <select name="sexo" value={formData.sexo} onChange={handleChange} className="w-full px-4 py-3 bg-white dark:bg-[#111111] border border-slate-200 dark:border-white/10 rounded-xl text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-cyan-500 transition-all">
                    <option value="">Seleccione</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Femenino">Femenino</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
              </div>
            </div>

            {/* TARJETA 3: Contacto y presencia web */}
            <div className="bg-white dark:bg-[#16161a] border border-slate-200 dark:border-white/5 rounded-[2rem] p-6 sm:p-8 shadow-sm mb-20">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 flex items-center justify-center shrink-0">
                  <Mail size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">Contacto y presencia web</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Correo, redes y dirección</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-400 mb-2">Correo electrónico</label>
                  <input type="email" value={formData.email} disabled className="w-full px-4 py-3 bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 rounded-xl text-sm text-slate-500 dark:text-slate-400 outline-none cursor-not-allowed transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-400 mb-2">Usuario de Instagram</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                      <span className="text-slate-400 font-bold">@</span>
                    </div>
                    <input type="text" name="instagram" value={formData.instagram} onChange={handleChange} className="w-full pl-9 pr-4 py-3 bg-white dark:bg-[#111111] border border-slate-200 dark:border-white/10 rounded-xl text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-cyan-500 transition-all" placeholder="usuario" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-400 mb-2">Página web</label>
                  <input type="url" name="pagina_web" value={formData.pagina_web} onChange={handleChange} className="w-full px-4 py-3 bg-white dark:bg-[#111111] border border-slate-200 dark:border-white/10 rounded-xl text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-cyan-500 transition-all" placeholder="https://" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-400 mb-2">Dirección</label>
                <input type="text" name="direccion" value={formData.direccion} onChange={handleChange} className="w-full px-4 py-3 bg-white dark:bg-[#111111] border border-slate-200 dark:border-white/10 rounded-xl text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-cyan-500 transition-all" placeholder="Calle, urbanización, ciudad..." />
              </div>
            </div>

            {/* BARRA INFERIOR DE GUARDADO (FLOTANTE) */}
            <div className="fixed bottom-0 left-0 right-0 md:left-[5.5rem] lg:left-64 p-6 flex justify-end pointer-events-none z-40">
              <div className="bg-white/80 dark:bg-[#111111]/80 backdrop-blur-md border border-slate-200 dark:border-white/10 p-3 rounded-2xl shadow-2xl pointer-events-auto flex gap-3">
                <button type="submit" disabled={guardando} className="flex items-center gap-2 bg-[#0081a7] hover:bg-[#006b8a] text-white px-8 py-3 rounded-xl font-bold shadow-md transition-all disabled:opacity-50">
                  {guardando ? 'Guardando...' : <><Save size={18} /> Guardar Cambios</>}
                </button>
              </div>
            </div>

          </form>
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