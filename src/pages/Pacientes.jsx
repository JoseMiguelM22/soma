import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { 
  Home, Users, FileText, Calendar, User, Settings, LogOut, 
  Menu, Sun, Moon, Plus, Search, MoreVertical, X, PanelLeft
} from 'lucide-react';

export default function Pacientes() {
  const navigate = useNavigate();
  
  // Estados para la UI
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // ESTADO NUEVO: Para abrir y cerrar la ventanita (Modal)
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Estados de datos
  const [userData, setUserData] = useState(null);
  const [pacientes, setPacientes] = useState([]);
  const [loadingPacientes, setLoadingPacientes] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  
  // ESTADOS NUEVOS: Para el formulario
  const [guardando, setGuardando] = useState(false);
  const [formData, setFormData] = useState({
    nombres: '', apellidos: '', cedula: '', telefono: '', 
    correo: '', sexo: '', fecha_nacimiento: ''
  });

  // Efecto para Tema Oscuro
  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDarkMode]);

  // Cargar Sesión, Usuario y Pacientes
  useEffect(() => {
    const fetchData = async () => {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (!session || sessionError) {
        navigate('/login');
        return;
      }

      const { data: dbUser } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id_auth', session.user.id)
        .single();
      
      if (dbUser) setUserData(dbUser);

      const { data: dbPacientes, error: pacError } = await supabase
        .from('pacientes')
        .select('*')
        .eq('id_medico', session.user.id)
        .order('created_at', { ascending: false });

      if (dbPacientes && !pacError) {
        setPacientes(dbPacientes);
      }
      setLoadingPacientes(false);
    };

    fetchData();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const getInitials = () => {
    if (!userData || !userData.nombres || !userData.apellidos) return "DR";
    return `${userData.nombres.charAt(0)}${userData.apellidos.charAt(0)}`.toUpperCase();
  };

  // Manejar cambios en los inputs del formulario
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Función para GUARDAR el paciente en Supabase
  const handleGuardarPaciente = async (e) => {
    e.preventDefault();
    setGuardando(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      // Insertamos el paciente en la tabla
      const { data, error } = await supabase
        .from('pacientes')
        .insert([{
          id_medico: session.user.id,
          nombres: formData.nombres,
          apellidos: formData.apellidos,
          cedula: formData.cedula,
          telefono: formData.telefono,
          correo: formData.correo,
          sexo: formData.sexo,
          fecha_nacimiento: formData.fecha_nacimiento
        }])
        .select(); // Pedimos que nos devuelva el dato insertado

      if (error) throw error;

      // Agregamos el paciente nuevo a la lista actual sin tener que recargar la página
      setPacientes([data[0], ...pacientes]);
      
      // Cerramos el modal y limpiamos el formulario
      setIsModalOpen(false);
      setFormData({
        nombres: '', apellidos: '', cedula: '', telefono: '', 
        correo: '', sexo: '', fecha_nacimiento: ''
      });

    } catch (error) {
      console.error("Error guardando paciente:", error.message);
      alert("Hubo un error al guardar. Intenta de nuevo.");
    } finally {
      setGuardando(false);
    }
  };

  // Filtrar pacientes por el buscador
  const pacientesFiltrados = pacientes.filter(p => 
    p.nombres.toLowerCase().includes(busqueda.toLowerCase()) || 
    p.apellidos.toLowerCase().includes(busqueda.toLowerCase()) ||
    (p.cedula && p.cedula.includes(busqueda))
  );

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
        fixed inset-y-0 left-0 z-50 bg-white dark:bg-[#111111] border-r border-slate-200 dark:border-white/5 flex flex-col justify-between
        transform transition-all duration-300 ease-in-out
        md:relative md:translate-x-0 w-64
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        ${isCollapsed ? 'md:w-20' : 'md:w-64'}
      `}>
        <div>
          <div className={`h-16 flex items-center border-b border-slate-200 dark:border-white/5 transition-all ${isCollapsed ? 'justify-center' : 'justify-between px-6'}`}>
            <h1 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2 tracking-widest overflow-hidden whitespace-nowrap">
              <span className="text-cyan-600 dark:text-cyan-400 text-2xl">*</span>
              {!isCollapsed && <span>SOMA</span>}
            </h1>
            {!isCollapsed && (
              <button className="md:hidden text-slate-500 hover:text-rose-500 transition-colors" onClick={() => setIsSidebarOpen(false)}>
                <X size={24} />
              </button>
            )}
          </div>

          <div className={`py-6 ${isCollapsed ? 'px-2' : 'px-4'}`}>
            {!isCollapsed && <p className="text-xs font-bold text-slate-400 dark:text-slate-500 mb-4 px-2 tracking-widest">HERRAMIENTAS</p>}
            <nav className="space-y-2">
              <Link to="/dashboard" title="Inicio" className={`flex items-center gap-3 py-2.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg font-medium transition-colors ${isCollapsed ? 'justify-center px-0' : 'px-3'}`}>
                <Home size={20} className="shrink-0" />
                {!isCollapsed && <span className="whitespace-nowrap">Inicio</span>}
              </Link>
              <Link to="/pacientes" title="Pacientes" className={`flex items-center gap-3 py-2.5 bg-cyan-50 dark:bg-[#1e1e1e] text-cyan-700 dark:text-cyan-400 border border-transparent dark:border-white/5 rounded-lg font-bold transition-colors ${isCollapsed ? 'justify-center px-0' : 'px-3'}`}>
                <Users size={20} className="shrink-0" />
                {!isCollapsed && <span className="whitespace-nowrap">Pacientes</span>}
              </Link>
              <Link to="/historias" title="Historias Clínicas" className={`flex items-center gap-3 py-2.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg font-medium transition-colors ${isCollapsed ? 'justify-center px-0' : 'px-3'}`}>
                <FileText size={20} className="shrink-0" />
                {!isCollapsed && <span className="whitespace-nowrap">Historias Clínicas</span>}
              </Link>
              <Link to="/agenda" title="Agenda" className={`flex items-center gap-3 py-2.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg font-medium transition-colors ${isCollapsed ? 'justify-center px-0' : 'px-3'}`}>
                <Calendar size={20} className="shrink-0" />
                {!isCollapsed && <span className="whitespace-nowrap">Agenda</span>}
              </Link>
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
          <button onClick={handleLogout} title="Cerrar Sesión" className={`flex items-center gap-3 py-2 w-full text-slate-500 dark:text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg font-medium transition-colors ${isCollapsed ? 'justify-center px-0' : 'px-3'}`}>
            <LogOut size={20} className="shrink-0" />
            {!isCollapsed && <span className="whitespace-nowrap">Cerrar Sesión</span>}
          </button>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto w-full relative">
        
        <header className="h-16 flex items-center justify-between px-6 lg:px-8 border-b border-slate-200 dark:border-white/5 bg-white/50 dark:bg-transparent backdrop-blur-sm sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button className="text-slate-500 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-white transition-colors md:hidden" onClick={() => setIsSidebarOpen(true)}>
              <Menu size={24} />
            </button>
            <button className="hidden md:flex p-2 text-slate-400 hover:text-cyan-600 dark:hover:text-white transition-colors rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10" onClick={() => setIsCollapsed(!isCollapsed)}>
              <PanelLeft size={20} />
            </button>
          </div>
          <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 text-slate-400 hover:text-cyan-600 dark:hover:text-yellow-400 transition-colors bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10">
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </header>

        <div className="p-6 lg:p-8 max-w-6xl mx-auto w-full">
          
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Pacientes</h2>
            <p className="text-slate-500 dark:text-slate-400">Administra y consulta el registro de tus pacientes.</p>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Buscar por nombre o cédula..." 
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#111111] border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:text-white transition-all"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
            
            {/* BOTÓN PARA ABRIR EL MODAL */}
            <button 
              onClick={() => setIsModalOpen(true)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-cyan-500/20 transform hover:-translate-y-0.5"
            >
              <Plus size={20} /> Nuevo Paciente
            </button>
          </div>

          {loadingPacientes ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
            </div>
          ) : pacientesFiltrados.length === 0 ? (
            <div className="bg-white dark:bg-[#111111] border border-slate-200 dark:border-white/5 rounded-2xl p-16 flex flex-col items-center justify-center text-center shadow-sm">
              <div className="bg-indigo-50 dark:bg-indigo-500/10 p-4 rounded-full mb-4">
                <Users size={40} className="text-indigo-500 dark:text-indigo-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">No se encontraron pacientes</h3>
              <p className="text-slate-500 dark:text-slate-400 max-w-md">
                {busqueda ? "No hay pacientes que coincidan con tu búsqueda." : "Esta sección está lista para ser construida. Haz clic en 'Nuevo Paciente' para comenzar a registrar."}
              </p>
            </div>
          ) : (
            <div className="bg-white dark:bg-[#111111] border border-slate-200 dark:border-white/5 rounded-2xl overflow-hidden shadow-sm overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/5 text-slate-500 dark:text-slate-400 text-sm">
                    <th className="p-4 font-semibold">Paciente</th>
                    <th className="p-4 font-semibold">Cédula</th>
                    <th className="p-4 font-semibold">Teléfono</th>
                    <th className="p-4 font-semibold">Registro</th>
                    <th className="p-4 font-semibold text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                  {pacientesFiltrados.map((paciente) => (
                    <tr key={paciente.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center text-cyan-700 dark:text-cyan-400 font-bold text-sm">
                            {paciente.nombres.charAt(0)}{paciente.apellidos.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white">{paciente.nombres} {paciente.apellidos}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{paciente.correo || 'Sin correo'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-slate-600 dark:text-slate-300">{paciente.cedula || 'N/A'}</td>
                      <td className="p-4 text-sm text-slate-600 dark:text-slate-300">{paciente.telefono || 'N/A'}</td>
                      <td className="p-4 text-sm text-slate-600 dark:text-slate-300">
                        {new Date(paciente.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-center">
                        <button className="text-slate-400 hover:text-cyan-500 transition-colors p-2">
                          <MoreVertical size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* =========================================
          MODAL: REGISTRO DE NUEVO PACIENTE 
          ========================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
          
          {/* Contenedor del Modal */}
          <div className="bg-white dark:bg-[#111111] w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 flex flex-col max-h-[90vh]">
            
            {/* Header del Modal */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-white/5">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Registrar Nuevo Paciente</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Completa los datos personales para agregarlo a tu lista.</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-rose-500 bg-slate-100 hover:bg-rose-50 dark:bg-white/5 dark:hover:bg-rose-500/10 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Cuerpo del Modal (Formulario con Scroll) */}
            <div className="p-6 overflow-y-auto">
              <form id="formPaciente" onSubmit={handleGuardarPaciente} className="space-y-5">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Nombres *</label>
                    <input required name="nombres" value={formData.nombres} onChange={handleChange} type="text" placeholder="Ej: Juan Carlos" className="w-full mt-1.5 p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 outline-none transition-all" />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Apellidos *</label>
                    <input required name="apellidos" value={formData.apellidos} onChange={handleChange} type="text" placeholder="Ej: Pérez" className="w-full mt-1.5 p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 outline-none transition-all" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Cédula</label>
                    <input name="cedula" value={formData.cedula} onChange={handleChange} type="text" placeholder="V-12345678" className="w-full mt-1.5 p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 outline-none transition-all" />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Fecha de Nacimiento *</label>
                    <input required name="fecha_nacimiento" value={formData.fecha_nacimiento} onChange={handleChange} type="date" className="w-full mt-1.5 p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 outline-none transition-all [&::-webkit-calendar-picker-indicator]:dark:invert" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Sexo *</label>
                    <select required name="sexo" value={formData.sexo} onChange={handleChange} className="w-full mt-1.5 p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 outline-none transition-all">
                      <option value="">Seleccione...</option>
                      <option value="Masculino">Masculino</option>
                      <option value="Femenino">Femenino</option>
                      <option value="Otro">Otro</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Teléfono</label>
                    <input name="telefono" value={formData.telefono} onChange={handleChange} type="text" placeholder="0414-0000000" className="w-full mt-1.5 p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 outline-none transition-all" />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Correo Electrónico</label>
                  <input name="correo" value={formData.correo} onChange={handleChange} type="email" placeholder="paciente@correo.com" className="w-full mt-1.5 p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 outline-none transition-all" />
                </div>

              </form>
            </div>

            {/* Footer del Modal (Botones) */}
            <div className="p-6 border-t border-slate-200 dark:border-white/5 flex gap-3 justify-end bg-slate-50 dark:bg-[#0a0a0a] rounded-b-2xl">
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                form="formPaciente"
                disabled={guardando}
                className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-md shadow-cyan-500/20 disabled:opacity-50"
              >
                {guardando ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Guardando...</>
                ) : (
                  'Guardar Paciente'
                )}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Pequeña animación para el modal */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}