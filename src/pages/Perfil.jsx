import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { 
  Home, Users, FileText, Calendar, LogOut, Menu, Sun, Moon, 
  X, PanelLeft, CheckCircle, AlertCircle, ShieldCheck, 
  Lock, Mail, User as UserIcon, Briefcase, Stethoscope, Save,
  IdCard, Phone
} from 'lucide-react';

export default function Perfil() {
  const navigate = useNavigate();
  
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'light' ? false : true; 
  });
  
  useEffect(() => { 
    document.documentElement.classList.toggle('dark', isDarkMode);
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // ================= ESTADOS DE DATOS =================
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Formularios
  const [datosPersonales, setDatosPersonales] = useState({
    nombres: '', apellidos: '', cedula: '', telefono: '', especialidad: ''
  });
  const [nuevoCorreo, setNuevoCorreo] = useState('');
  const [nuevaClave, setNuevaClave] = useState('');
  
  // Estados de carga (loaders de botones)
  const [guardandoDatos, setGuardandoDatos] = useState(false);
  const [guardandoCorreo, setGuardandoCorreo] = useState(false);
  const [guardandoClave, setGuardandoClave] = useState(false);

  // Notificaciones
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });
  const showToast = (message, type = 'success') => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 4000);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return navigate('/login');

      const { data: dbUser } = await supabase.from('usuarios').select('*').eq('id_auth', session.user.id).single();
      
      if (!dbUser || dbUser.estado_cuenta === 'Rechazada' || dbUser.estado_cuenta === 'Pendiente') {
        await supabase.auth.signOut();
        return navigate('/login');
      }
      
      setUserData(dbUser);
      setNuevoCorreo(dbUser.correo || session.user.email);
      setDatosPersonales({
        nombres: dbUser.nombres || '',
        apellidos: dbUser.apellidos || '',
        cedula: dbUser.cedula || '',
        telefono: dbUser.telefono || '',
        especialidad: dbUser.especialidad || ''
      });

    } catch (error) {
      showToast("Error al cargar perfil.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [navigate]);

  const handleLogout = async () => { await supabase.auth.signOut(); navigate('/login'); };
  const getInitials = () => { if (!userData) return "U"; return `${userData.nombres?.charAt(0) || ''}${userData.apellidos?.charAt(0) || ''}`.toUpperCase(); };

  // ================= ACTUALIZAR DATOS PERSONALES =================
  const handleActualizarDatos = async (e) => {
    if (e) e.preventDefault();
    setGuardandoDatos(true);
    try {
      const { error } = await supabase.from('usuarios').update({
        nombres: datosPersonales.nombres,
        apellidos: datosPersonales.apellidos,
        cedula: datosPersonales.cedula,
        telefono: datosPersonales.telefono,
        especialidad: datosPersonales.especialidad
      }).eq('id', userData.id);

      if (error) throw error;

      showToast("Información personal actualizada con éxito.", "success");
      setUserData({ ...userData, ...datosPersonales });
    } catch (error) {
      showToast("Error al actualizar información: " + error.message, "error");
    } finally {
      setGuardandoDatos(false);
    }
  };

  const handleChangeDatos = (e) => {
    setDatosPersonales({ ...datosPersonales, [e.target.name]: e.target.value });
  };

  // ================= ACTUALIZAR CORREO =================
  const handleActualizarCorreo = async (e) => {
    if (e) e.preventDefault();

    const correoLimpio = nuevoCorreo.trim();

    if (!correoLimpio) {
      showToast("Por favor, ingresa un correo válido.", "error");
      return;
    }

    setGuardandoCorreo(true);

    try {
      const { error: authError } = await supabase.auth.updateUser({ email: correoLimpio });
      if (authError) throw authError;

      const { error: dbError } = await supabase.from('usuarios')
        .update({ correo: correoLimpio })
        .eq('id', userData.id);
      if (dbError) throw dbError;

      showToast("Correo actualizado. (Revisa tu bandeja de entrada para confirmar)", "success");
      setUserData({ ...userData, correo: correoLimpio });
      
    } catch (error) {
      showToast("Error al actualizar correo: " + error.message, "error");
    } finally {
      setGuardandoCorreo(false);
    }
  };

  // ================= ACTUALIZAR CONTRASEÑA =================
  const handleActualizarClave = async (e) => {
    if (e) e.preventDefault();
    if (nuevaClave.length < 6) return showToast("La contraseña debe tener al menos 6 caracteres.", "error");
    
    setGuardandoClave(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: nuevaClave });
      if (error) throw error;

      showToast("Contraseña actualizada con éxito.", "success");
      setNuevaClave(''); 
    } catch (error) {
      showToast("Error al actualizar contraseña: " + error.message, "error");
    } finally {
      setGuardandoClave(false);
    }
  };

  const rol = (userData?.rol || '').toLowerCase();
  const isDirectivo = rol === 'directivo';
  const isEspecialista = ['especialista', 'medico', 'médico'].includes(rol);
  const isAsistente = rol === 'departamento' || rol === 'asistente';

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-[#0B0D12] text-slate-800 dark:text-slate-200 font-sans overflow-hidden transition-colors duration-300">
      {isSidebarOpen && <div className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />}

      {/* ================= ALERTA FLOTANTE (TOAST) ================= */}
      <div className={`fixed top-6 right-6 z-[9999] flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl border transition-all duration-300 transform ${toast.visible ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0 pointer-events-none'} ${toast.type === 'success' ? 'bg-emerald-50 dark:bg-[#064e3b] border-emerald-200 dark:border-emerald-800' : 'bg-rose-50 dark:bg-[#4c0519] border-rose-200 dark:border-rose-800'}`}>
        {toast.type === 'success' ? <CheckCircle size={24} className="text-emerald-600 dark:text-emerald-400" /> : <AlertCircle size={24} className="text-rose-600 dark:text-rose-400" />}
        <span className={`font-bold text-sm ${toast.type === 'success' ? 'text-emerald-800 dark:text-emerald-100' : 'text-rose-800 dark:text-rose-100'}`}>{toast.message}</span>
      </div>

      {/* ================= SIDEBAR ================= */}
      <aside className={`fixed inset-y-0 left-0 z-50 bg-white dark:bg-[#16161a] border-r border-slate-200/80 dark:border-white/[0.04] flex flex-col justify-between transform transition-all duration-300 md:relative md:translate-x-0 md:m-4 md:mr-0 md:rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none ${isSidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64'} ${isCollapsed ? 'md:w-24' : 'md:w-68'}`}>
        <div>
          <div className={`h-20 flex items-center transition-all ${isCollapsed ? 'justify-center' : 'justify-between px-6'}`}>
            <Link to={isDirectivo ? "/directiva" : isEspecialista ? "/dashboard" : "/admision"} className="flex items-center overflow-hidden whitespace-nowrap">
              {isCollapsed ? <span className="text-[#0081a7] text-3xl mb-1 font-black">*</span> : <><img src="/soma_logo.png" alt="SOMA Logo" className="h-6 object-contain block dark:hidden" /><img src="/soma_logo_blanco.png" alt="SOMA Logo" className="h-6 object-contain hidden dark:block" /></>}
            </Link>
            {!isCollapsed && <button className="md:hidden text-slate-400 hover:text-rose-500" onClick={() => setIsSidebarOpen(false)}><X size={20} /></button>}
          </div>
          <div className={`py-4 ${isCollapsed ? 'px-3' : 'px-4'}`}>
            {!isCollapsed && <p className="text-[10px] font-bold text-slate-400 mb-3 px-3 uppercase tracking-widest">Navegación</p>}
            <nav className="space-y-1.5">
              {isDirectivo && (
                <Link to="/directiva" className={`flex items-center gap-3 py-3 text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl font-bold transition-all ${isCollapsed ? 'justify-center px-0' : 'px-4'}`}><ShieldCheck size={20} className="shrink-0" />{!isCollapsed && <span className="whitespace-nowrap text-sm">Volver al Panel</span>}</Link>
              )}
              {isEspecialista && (
                <>
                  <Link to="/dashboard" className={`flex items-center gap-3 py-3 text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl font-bold transition-all ${isCollapsed ? 'justify-center px-0' : 'px-4'}`}><Home size={20} className="shrink-0" />{!isCollapsed && <span className="whitespace-nowrap text-sm">Inicio</span>}</Link>
                  <Link to="/historias" className={`flex items-center gap-3 py-3 text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl font-bold transition-all ${isCollapsed ? 'justify-center px-0' : 'px-4'}`}><FileText size={20} className="shrink-0" />{!isCollapsed && <span className="whitespace-nowrap text-sm">Historias</span>}</Link>
                  <Link to="/agenda" className={`flex items-center gap-3 py-3 text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl font-bold transition-all ${isCollapsed ? 'justify-center px-0' : 'px-4'}`}><Calendar size={20} className="shrink-0" />{!isCollapsed && <span className="whitespace-nowrap text-sm">Agenda</span>}</Link>
                </>
              )}
              {isAsistente && (
                <>
                  <Link to="/admision" className={`flex items-center gap-3 py-3 text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl font-bold transition-all ${isCollapsed ? 'justify-center px-0' : 'px-4'}`}><Home size={20} className="shrink-0" />{!isCollapsed && <span className="whitespace-nowrap text-sm">Inicio</span>}</Link>
                  <Link to="/pacientes" className={`flex items-center gap-3 py-3 text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl font-bold transition-all ${isCollapsed ? 'justify-center px-0' : 'px-4'}`}><Users size={20} className="shrink-0" />{!isCollapsed && <span className="whitespace-nowrap text-sm">Pacientes</span>}</Link>
                  <Link to="/historias" className={`flex items-center gap-3 py-3 text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl font-bold transition-all ${isCollapsed ? 'justify-center px-0' : 'px-4'}`}><FileText size={20} className="shrink-0" />{!isCollapsed && <span className="whitespace-nowrap text-sm">Historias</span>}</Link>
                  <Link to="/agenda" className={`flex items-center gap-3 py-3 text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl font-bold transition-all ${isCollapsed ? 'justify-center px-0' : 'px-4'}`}><Calendar size={20} className="shrink-0" />{!isCollapsed && <span className="whitespace-nowrap text-sm">Agenda</span>}</Link>
                </>
              )}
            </nav>
          </div>
        </div>
        <div className={`p-4 border-t border-slate-200 dark:border-white/5 flex flex-col ${isCollapsed ? 'items-center' : ''}`}>
          <button onClick={handleLogout} className={`flex items-center gap-3 py-2 w-full text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg font-bold transition-colors ${isCollapsed ? 'justify-center px-0' : 'px-3'}`}>
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
          {loading ? (
            <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0081a7]"></div></div>
          ) : (
            <div className="p-4 md:p-8 max-w-4xl mx-auto w-full animate-[fadeIn_0.3s_ease-out]">
              
              <div className="mb-8 text-center md:text-left">
                <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2">Configuración de Cuenta</h1>
                <p className="text-slate-500 dark:text-slate-400 font-medium">Gestiona tu información personal, correo electrónico y contraseña de acceso.</p>
              </div>

              {/* TARJETA DE INFORMACIÓN DEL PERFIL (MODO VISTA) */}
              <div className="bg-white dark:bg-[#111111] p-8 rounded-[2rem] border border-slate-200 dark:border-white/5 shadow-xl mb-8 flex flex-col md:flex-row items-center gap-8">
                <div className="w-32 h-32 rounded-full bg-[#0081a7]/10 dark:bg-cyan-900/30 flex items-center justify-center text-[#0081a7] dark:text-cyan-400 font-black text-4xl border-4 border-[#0081a7]/20 dark:border-cyan-800/50 shrink-0">
                  {getInitials()}
                </div>
                <div className="text-center md:text-left">
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white">{isEspecialista ? 'Dr(a). ' : ''}{userData?.nombres} {userData?.apellidos}</h2>
                  <p className="text-[#0081a7] dark:text-cyan-400 font-bold uppercase tracking-widest text-sm mt-1">
                    {isEspecialista ? (userData?.especialidad || 'Medicina General') : isDirectivo ? 'Junta Directiva' : 'DPTO. HISTORIAS CLÍNICAS'}
                  </p>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-4">
                    <span className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 font-medium bg-slate-50 dark:bg-white/5 px-3 py-1 rounded-lg"><Mail size={14} /> {userData?.correo}</span>
                    <span className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 font-medium bg-slate-50 dark:bg-white/5 px-3 py-1 rounded-lg"><IdCard size={14} /> C.I: {userData?.cedula || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* FORMULARIO DATOS PERSONALES */}
              <div className="bg-white dark:bg-[#111111] p-8 rounded-[2rem] border border-slate-200 dark:border-white/5 shadow-xl mb-8">
                <div className="flex items-center gap-3 mb-6 border-b border-slate-100 dark:border-white/5 pb-4">
                  <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-xl"><UserIcon size={20} /></div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Información Personal</h3>
                </div>
                <form onSubmit={handleActualizarDatos} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Nombres</label>
                      <input type="text" name="nombres" value={datosPersonales.nombres} onChange={handleChangeDatos} required className="w-full px-4 py-3 bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium text-slate-900 dark:text-white transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Apellidos</label>
                      <input type="text" name="apellidos" value={datosPersonales.apellidos} onChange={handleChangeDatos} required className="w-full px-4 py-3 bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium text-slate-900 dark:text-white transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Cédula de Identidad</label>
                      <input type="text" name="cedula" value={datosPersonales.cedula} onChange={handleChangeDatos} className="w-full px-4 py-3 bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium text-slate-900 dark:text-white transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Teléfono / WhatsApp</label>
                      <input type="text" name="telefono" value={datosPersonales.telefono} onChange={handleChangeDatos} placeholder="Ej. 04121234567" className="w-full px-4 py-3 bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium text-slate-900 dark:text-white transition-all" />
                    </div>

                    {/* Mostrar campo de especialidad SOLO si el usuario es Médico/Especialista */}
                    {isEspecialista && (
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Especialidad Médica</label>
                        <input type="text" name="especialidad" value={datosPersonales.especialidad} onChange={handleChangeDatos} placeholder="Ej. Traumatología, Pediatría..." className="w-full px-4 py-3 bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium text-slate-900 dark:text-white transition-all" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-white/5">
                    <button type="submit" disabled={guardandoDatos} className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md transition-all disabled:opacity-50">
                      {guardandoDatos ? 'Guardando...' : <><Save size={18} /> Actualizar Información</>}
                    </button>
                  </div>
                </form>
              </div>

              {/* TARJETAS DE SEGURIDAD */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* CAMBIAR CORREO (AHORA ES UN DIV) */}
                <div className="bg-white dark:bg-[#111111] p-8 rounded-[2rem] border border-slate-200 dark:border-white/5 shadow-xl">
                  <div className="flex items-center gap-3 mb-6 border-b border-slate-100 dark:border-white/5 pb-4">
                    <div className="p-2.5 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-500 rounded-xl"><Mail size={20} /></div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Cambiar Correo</h3>
                  </div>
                  
                  <div className="space-y-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Nuevo Correo Electrónico</label>
                      <input 
                        type="email" 
                        value={nuevoCorreo} 
                        onChange={(e) => setNuevoCorreo(e.target.value)}
                        autoComplete="off"
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-[#0081a7] text-sm font-medium text-slate-900 dark:text-white transition-all"
                      />
                    </div>
                    <button 
                      type="button" 
                      onClick={handleActualizarCorreo}
                      disabled={guardandoCorreo || nuevoCorreo === userData?.correo || !nuevoCorreo.trim()} 
                      className="w-full flex items-center justify-center gap-2 py-3 bg-[#0081a7] hover:bg-[#006b8a] text-white rounded-xl font-bold shadow-md transition-all disabled:opacity-50"
                    >
                      {guardandoCorreo ? 'Guardando...' : <><Save size={18} /> Actualizar Correo</>}
                    </button>
                  </div>
                </div>

                {/* CAMBIAR CONTRASEÑA (AHORA ES UN DIV) */}
                <div className="bg-white dark:bg-[#111111] p-8 rounded-[2rem] border border-slate-200 dark:border-white/5 shadow-xl">
                  <div className="flex items-center gap-3 mb-6 border-b border-slate-100 dark:border-white/5 pb-4">
                    <div className="p-2.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-500 rounded-xl"><Lock size={20} /></div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Cambiar Contraseña</h3>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Nueva Contraseña</label>
                      <input 
                        type="password" 
                        value={nuevaClave} 
                        onChange={(e) => setNuevaClave(e.target.value)}
                        placeholder="Mínimo 6 caracteres"
                        autoComplete="new-password"
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium text-slate-900 dark:text-white transition-all"
                      />
                    </div>
                    <button 
                      type="button"
                      onClick={handleActualizarClave}
                      disabled={guardandoClave || nuevaClave.length < 6} 
                      className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md transition-all disabled:opacity-50"
                    >
                      {guardandoClave ? 'Guardando...' : <><Save size={18} /> Actualizar Contraseña</>}
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )}
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