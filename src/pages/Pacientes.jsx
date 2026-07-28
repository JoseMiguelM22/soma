import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { 
  Home, Users, FileText, Calendar, User, LogOut, 
  Menu, Sun, Moon, Plus, Search, X, PanelLeft, 
  Filter, Edit3, Phone, FileDigit, CalendarDays,
  CheckCircle, AlertCircle
} from 'lucide-react';

export default function Pacientes() {
  const navigate = useNavigate();
  
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
  const [isModalCrearOpen, setIsModalCrearOpen] = useState(false);
  
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null);
  const [activeTab, setActiveTab] = useState('datos'); 
  const [isEditingData, setIsEditingData] = useState(false); 
  
  // Estado para leer las notas clínicas sin alertas feas
  const [notaModal, setNotaModal] = useState({ isOpen: false, html: '' });

  // 🔥 ESTADO PARA LAS NOTIFICACIONES FLOTANTES (TOAST) 🔥
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ visible: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, 4000);
  };

  const [userData, setUserData] = useState(null);
  const [pacientes, setPacientes] = useState([]);
  const [consultasPaciente, setConsultasPaciente] = useState([]); 
  const [loadingPacientes, setLoadingPacientes] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [guardando, setGuardando] = useState(false);
  
  const [formData, setFormData] = useState({
    nombres: '', apellidos: '', cedula: '', telefono: '', 
    correo: '', sexo: '', fecha_nacimiento: '', estado_civil: 'No especificado'
  });

  const [editFormData, setEditFormData] = useState({
    id: '', nombres: '', apellidos: '', cedula: '', telefono: '', 
    correo: '', sexo: '', fecha_nacimiento: '', estado_civil: 'No especificado'
  });

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDarkMode]);

  const fetchData = async () => {
    setLoadingPacientes(true);
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) return navigate('/login');

      const { data: dbUser, error: userError } = await supabase.from('usuarios').select('*').eq('id_auth', session.user.id).single();
      if (userError || !dbUser) return navigate('/login');

      const rolUsuario = (dbUser.rol || '').toLowerCase();

      // Bloqueamos a los médicos, esta área es de asistentes
      if (rolUsuario === 'especialista' || rolUsuario === 'medico' || rolUsuario === 'médico') {
        return navigate('/dashboard'); 
      }

      setUserData(dbUser);

      const { data: dbPacientes } = await supabase.from('pacientes').select('*').order('nombres', { ascending: true });
      if (dbPacientes) setPacientes(dbPacientes);

    } catch (error) {
      console.error("Error crítico en fetchData:", error);
    } finally {
      setLoadingPacientes(false); 
    }
  };

  const cargarConsultasPaciente = async (idPaciente) => {
    const { data } = await supabase.from('consultas').select('*').eq('id_paciente', idPaciente).order('fecha_consulta', { ascending: false });
    if (data) setConsultasPaciente(data);
    else setConsultasPaciente([]);
  };

  useEffect(() => { fetchData(); }, []);

  const handleLogout = async () => { await supabase.auth.signOut(); navigate('/login'); };
  const getInitials = () => { if (!userData) return "AD"; return `${userData.nombres.charAt(0)}${userData.apellidos.charAt(0)}`.toUpperCase(); };

  const handleInputChange = (e, isEdit = false) => {
    const { name, value } = e.target;
    if (name === 'nombres' || name === 'apellidos') { if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]*$/.test(value)) return; }
    if (name === 'cedula' || name === 'telefono') { if (!/^[0-9]*$/.test(value)) return; }
    if (isEdit) setEditFormData({ ...editFormData, [name]: value });
    else setFormData({ ...formData, [name]: value });
  };

  const handleGuardarPaciente = async (e) => {
    e.preventDefault();
    setGuardando(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const { data, error } = await supabase.from('pacientes').insert([{
        id_medico: session.user.id, nombres: formData.nombres, apellidos: formData.apellidos,
        cedula: formData.cedula, telefono: formData.telefono, correo: formData.correo,
        sexo: formData.sexo, fecha_nacimiento: formData.fecha_nacimiento
      }]).select();

      if (error) throw error;
      setPacientes([data[0], ...pacientes]);
      setIsModalCrearOpen(false);
      setFormData({ nombres: '', apellidos: '', cedula: '', telefono: '', correo: '', sexo: '', fecha_nacimiento: '', estado_civil: 'No especificado' });
      
      showToast("Paciente registrado con éxito", "success");
    } catch (error) { 
      showToast("Hubo un error al crear. Intenta de nuevo.", "error"); 
    } finally { 
      setGuardando(false); 
    }
  };

  const handleActualizarPaciente = async (e) => {
    e.preventDefault();
    setGuardando(true);
    try {
      const { error } = await supabase.from('pacientes').update({
        nombres: editFormData.nombres, apellidos: editFormData.apellidos, cedula: editFormData.cedula,
        telefono: editFormData.telefono, correo: editFormData.correo, sexo: editFormData.sexo,
        fecha_nacimiento: editFormData.fecha_nacimiento
      }).eq('id', editFormData.id);

      if (error) throw error;
      await fetchData(); 
      const pacienteActualizado = { ...pacienteSeleccionado, ...editFormData };
      setPacienteSeleccionado(pacienteActualizado);
      setIsEditingData(false); 
      
      showToast("Paciente actualizado con éxito", "success");
    } catch (error) { 
      showToast("Hubo un error al actualizar. Intenta de nuevo.", "error"); 
    } finally { 
      setGuardando(false); 
    }
  };

  const abrirPerfil = (paciente) => {
    setEditFormData({
      id: paciente.id, nombres: paciente.nombres, apellidos: paciente.apellidos,
      cedula: paciente.cedula, telefono: paciente.telefono || '', correo: paciente.correo || '',
      sexo: paciente.sexo, fecha_nacimiento: paciente.fecha_nacimiento, estado_civil: 'No especificado'
    });
    setPacienteSeleccionado(paciente);
    cargarConsultasPaciente(paciente.id);
    setActiveTab('datos');
    setIsEditingData(false);
  };

  const calcularEdad = (fechaNacimiento) => {
    if (!fechaNacimiento) return '-';
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) edad--;
    return edad;
  };

  const formatearFechaTexto = (fecha) => {
    if (!fecha) return '';
    const [year, month, day] = fecha.split('-');
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${day} ${meses[parseInt(month)-1]} ${year}`;
  };

  const formatearFechaTextoCompleta = (fechaCompleta) => {
    if (!fechaCompleta) return '';
    const fecha = new Date(fechaCompleta);
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const dia = String(fecha.getDate()).padStart(2, '0');
    const horas = String(fecha.getHours()).padStart(2, '0');
    const minutos = String(fecha.getMinutes()).padStart(2, '0');
    return `${dia} de ${meses[fecha.getMonth()]} de ${fecha.getFullYear()} a las ${horas}:${minutos}`;
  };

  const handleWhatsApp = (telefono) => {
    if (!telefono) return showToast("Este paciente no tiene número registrado.", "error");
    let num = telefono.replace(/\D/g, '');
    if (num.startsWith('0')) num = '58' + num.substring(1);
    else if (!num.startsWith('58') && num.length === 10) num = '58' + num;
    window.open(`https://wa.me/${num}`, '_blank');
  };

  const pacientesFiltrados = pacientes.filter(p => 
    (p.nombres || '').toLowerCase().includes(busqueda.toLowerCase()) || 
    (p.apellidos || '').toLowerCase().includes(busqueda.toLowerCase()) ||
    (p.cedula && p.cedula.includes(busqueda)) ||
    (p.telefono && p.telefono.includes(busqueda))
  );

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-[#0B0D12] text-slate-800 dark:text-slate-200 font-sans overflow-hidden transition-colors duration-300">
      {isSidebarOpen && <div className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm transition-opacity" onClick={() => setIsSidebarOpen(false)} />}

      {/* ================= ALERTA FLOTANTE (TOAST) ARRIBA A LA DERECHA ================= */}
      <div 
        className={`fixed top-6 right-6 z-[9999] flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl border transition-all duration-300 transform no-print ${
          toast.visible ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0 pointer-events-none'
        } ${
          toast.type === 'success' 
            ? 'bg-emerald-50 dark:bg-[#064e3b] border-emerald-200 dark:border-emerald-800' 
            : 'bg-rose-50 dark:bg-[#4c0519] border-rose-200 dark:border-rose-800'
        }`}
      >
        {toast.type === 'success' 
          ? <CheckCircle size={24} className="text-emerald-600 dark:text-emerald-400" /> 
          : <AlertCircle size={24} className="text-rose-600 dark:text-rose-400" />
        }
        <span className={`font-bold text-sm ${toast.type === 'success' ? 'text-emerald-800 dark:text-emerald-100' : 'text-rose-800 dark:text-rose-100'}`}>
          {toast.message}
        </span>
      </div>

      {/* ================= MODAL DE NOTA CLÍNICA (EVITA EL ALERT FEO) ================= */}
      {notaModal.isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-white dark:bg-[#111111] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-5 border-b border-slate-200 dark:border-white/5 flex justify-between items-center bg-slate-50 dark:bg-[#16161a]">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2"><FileText size={18}/> Evolución Médica</h3>
              <button onClick={() => setNotaModal({isOpen: false, html: ''})} className="text-slate-400 hover:text-rose-500 transition-colors"><X size={20}/></button>
            </div>
            <div className="p-8 overflow-y-auto custom-scrollbar text-slate-800 dark:text-slate-200 text-sm html-viewer" dangerouslySetInnerHTML={{ __html: notaModal.html }} />
            <div className="p-4 bg-slate-50 dark:bg-[#16161a] border-t border-slate-200 dark:border-white/5 flex justify-end">
               <button onClick={() => setNotaModal({isOpen: false, html: ''})} className="px-5 py-2 bg-[#0081a7] text-white rounded-xl font-bold text-sm shadow-md hover:bg-[#006b8a] transition-colors">Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {/* SIDEBAR ASISTENTE */}
      <aside className={`fixed inset-y-0 left-0 z-50 bg-white dark:bg-[#16161a] border-r border-slate-200/80 dark:border-white/[0.04] flex flex-col justify-between transform transition-all duration-300 ease-in-out md:relative md:translate-x-0 md:m-4 md:mr-0 md:rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none ${isSidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64'} ${isCollapsed ? 'md:w-24' : 'md:w-68'}`}>
        <div>
          <div className={`h-20 flex items-center transition-all ${isCollapsed ? 'justify-center' : 'justify-between px-6'}`}>
            <Link to="/admision" className="flex items-center overflow-hidden whitespace-nowrap">
              {isCollapsed ? <span className="text-emerald-500 text-3xl mb-1 font-black">*</span> : <><img src="/soma_logo.png" alt="SOMA Logo" className="h-6 object-contain block dark:hidden transition-opacity duration-300" /><img src="/soma_logo_blanco.png" alt="SOMA Logo" className="h-6 object-contain hidden dark:block transition-opacity duration-300" /></>}
            </Link>
            {!isCollapsed && <button className="md:hidden text-slate-400 hover:text-rose-500 transition-colors" onClick={() => setIsSidebarOpen(false)}><X size={20} /></button>}
          </div>

          <div className={`py-4 ${isCollapsed ? 'px-3' : 'px-4'}`}>
            {!isCollapsed && <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-3 px-3 tracking-widest uppercase">Herramientas</p>}
            <nav className="space-y-1.5">
              <Link to="/admision" className={`flex items-center gap-3 py-3 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/[0.03] rounded-xl font-medium transition-all ${isCollapsed ? 'justify-center px-0' : 'px-4'}`}><Home size={20} className="shrink-0" />{!isCollapsed && <span className="whitespace-nowrap text-sm">Inicio</span>}</Link>
              <Link to="/pacientes" className={`flex items-center gap-3 py-3 bg-emerald-500/10 dark:bg-white/10 text-emerald-600 dark:text-white rounded-xl font-bold transition-all ${isCollapsed ? 'justify-center px-0' : 'px-4'}`}><Users size={20} className="shrink-0" />{!isCollapsed && <span className="whitespace-nowrap text-sm">Pacientes</span>}</Link>
              <Link to="/historias" className={`flex items-center gap-3 py-3 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/[0.03] rounded-xl font-medium transition-all ${isCollapsed ? 'justify-center px-0' : 'px-4'}`}><FileText size={20} className="shrink-0" />{!isCollapsed && <span className="whitespace-nowrap text-sm">Historias Clínicas</span>}</Link>
              <Link to="/agenda" className={`flex items-center gap-3 py-3 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/[0.03] rounded-xl font-medium transition-all ${isCollapsed ? 'justify-center px-0' : 'px-4'}`}><Calendar size={20} className="shrink-0" />{!isCollapsed && <span className="whitespace-nowrap text-sm">Agenda</span>}</Link>
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
                  DPTO. HISTORIAS
                </p>
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

      <main className="flex-1 flex flex-col h-screen overflow-hidden w-full relative bg-slate-100 dark:bg-[#050505]">
        <header className="h-16 flex items-center justify-between px-6 lg:px-8 border-b border-slate-200 dark:border-white/5 bg-white/50 dark:bg-[#111111]/80 backdrop-blur-sm sticky top-0 z-30 shrink-0">
          <div className="flex items-center gap-4">
            <button className="text-slate-500 dark:text-slate-400 hover:text-cyan-600 md:hidden" onClick={() => setIsSidebarOpen(true)}><Menu size={24} /></button>
            <button className="hidden md:flex p-2 text-slate-400 hover:text-cyan-600 dark:hover:text-white rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10" onClick={() => setIsCollapsed(!isCollapsed)}><PanelLeft size={20} /></button>
          </div>
          <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 text-slate-400 hover:text-cyan-600 dark:hover:text-yellow-400 bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 transition-colors"><Sun size={20} className="hidden dark:block"/><Moon size={20} className="block dark:hidden"/></button>
        </header>

        <div className="flex-1 overflow-y-auto w-full custom-scrollbar pb-10">
          
          {!pacienteSeleccionado ? (
            <div className="p-4 md:p-8 max-w-[1400px] mx-auto w-full animate-[fadeIn_0.3s_ease-out]">
              <div className="bg-white dark:bg-[#111111] rounded-[2rem] shadow-xl overflow-hidden border border-slate-200 dark:border-white/5">
                <div className="bg-[#0081a7] dark:bg-[#005f7a] px-8 py-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <h2 className="text-3xl font-black text-white mb-2 tracking-tight">Directorio de Pacientes</h2>
                    <p className="text-cyan-100 text-sm font-medium">Busca, gestiona y visualiza la información de los pacientes registrados.</p>
                  </div>
                  <button onClick={() => setIsModalCrearOpen(true)} className="bg-white text-[#0081a7] hover:bg-slate-50 px-5 py-2.5 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 transform hover:-translate-y-0.5 transition-all w-full md:w-auto">
                    <Plus size={18} /> Nuevo Paciente
                  </button>
                </div>

                <div className="p-8">
                  <div className="mb-6">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 block">Buscar en el directorio</label>
                    <div className="relative max-w-md">
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        type="text" 
                        placeholder="Nombre, apellido o cédula..." 
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0081a7] text-sm shadow-sm" 
                        value={busqueda} 
                        onChange={(e) => setBusqueda(e.target.value)} 
                      />
                    </div>
                  </div>

                  {loadingPacientes ? (
                    <div className="flex justify-center items-center h-48"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0081a7]"></div></div>
                  ) : (
                    <div className="overflow-x-auto border-t border-slate-100 dark:border-white/5 pt-4">
                      <table className="w-full text-left whitespace-nowrap">
                        <thead>
                          <tr className="border-b border-slate-200 dark:border-white/10 text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                            <th className="px-4 py-3">Paciente</th>
                            <th className="px-4 py-3">Cédula</th>
                            <th className="px-4 py-3 hidden sm:table-cell">Edad</th>
                            <th className="px-4 py-3 hidden md:table-cell">Sexo</th>
                            <th className="px-4 py-3 text-right">Acciones</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                          {pacientesFiltrados.map((paciente) => (
                            <tr key={paciente.id} className="hover:bg-slate-50 dark:hover:bg-[#1a1a1a] transition-colors group cursor-pointer" onClick={() => abrirPerfil(paciente)}>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-3">
                                  <div className="w-9 h-9 rounded-full bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center text-cyan-700 font-bold text-xs shrink-0">{(paciente.nombres || 'P').charAt(0)}{(paciente.apellidos || '').charAt(0)}</div>
                                  <p className="font-bold text-sm text-slate-900 dark:text-white">{paciente.nombres} {paciente.apellidos}</p>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{paciente.cedula || '-'}</td>
                              <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300 hidden sm:table-cell">{calcularEdad(paciente.fecha_nacimiento)} años</td>
                              <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300 hidden md:table-cell">{paciente.sexo || '-'}</td>
                              <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                                <button onClick={() => abrirPerfil(paciente)} className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-400 rounded-md text-xs font-bold hover:bg-cyan-100 transition-colors ml-auto">
                                  <FileText size={14} /> Abrir Ficha
                                </button>
                              </td>
                            </tr>
                          ))}
                          {pacientesFiltrados.length === 0 && (
                            <tr>
                              <td colSpan="5" className="px-4 py-8 text-center text-slate-500">No se encontraron pacientes registrados.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full animate-[fadeIn_0.3s_ease-out]">
              
              {/* CABECERA DEL PACIENTE ESTILO DASHBOARD */}
              <div className="bg-[#0081a7] dark:bg-[#005f7a] text-white pt-8 px-4 md:px-10 shrink-0 shadow-md">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-start justify-between gap-6 pb-6">
                  <div className="flex items-center gap-5">
                    <div className="w-20 h-20 bg-white/20 rounded-full border-4 border-white/10 flex items-center justify-center shrink-0 shadow-inner"><User size={40} className="text-white opacity-80" /></div>
                    <div>
                      <h2 className="text-2xl font-black mb-1">{pacienteSeleccionado.nombres} {pacienteSeleccionado.apellidos}</h2>
                      <div className="flex flex-wrap items-center gap-3 text-cyan-100 text-sm font-medium mt-2">
                        <span className="flex items-center gap-1"><FileDigit size={14} className="opacity-70" /> {pacienteSeleccionado.cedula || 'N/A'}</span>
                        <span className="flex items-center gap-1"><Phone size={14} className="opacity-70" /> {pacienteSeleccionado.telefono || 'N/A'}</span>
                        <span className="flex items-center gap-1"><CalendarDays size={14} className="opacity-70" /> {calcularEdad(pacienteSeleccionado.fecha_nacimiento)} años</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3 mt-2 md:mt-0">
                    <button onClick={() => handleWhatsApp(pacienteSeleccionado.telefono)} className="bg-[#25D366] hover:bg-[#1ebd53] text-white px-4 py-2 rounded-xl text-sm font-bold shadow flex items-center gap-2 transition-all">WhatsApp</button>
                  </div>
                </div>

                <div className="max-w-6xl mx-auto flex gap-6 text-sm font-bold border-t border-cyan-700/50 overflow-x-auto hide-scroll pt-1 relative">
                  <button onClick={() => setActiveTab('datos')} className={`border-b-[3px] py-3.5 whitespace-nowrap transition-colors ${activeTab === 'datos' ? 'border-white text-white' : 'border-transparent text-cyan-200 hover:text-white'}`}>Datos Paciente</button>
                  <button onClick={() => setActiveTab('historias')} className={`border-b-[3px] py-3.5 whitespace-nowrap transition-colors ${activeTab === 'historias' ? 'border-white text-white' : 'border-transparent text-cyan-200 hover:text-white'}`}>Consultas Anteriores</button>
                </div>
              </div>

              <div className="p-4 md:p-8 max-w-6xl mx-auto">
                <button onClick={() => setPacienteSeleccionado(null)} className="flex items-center gap-1.5 text-slate-500 hover:text-[#0081a7] font-bold text-sm mb-6 transition-colors"><X size={16} /> Volver al listado</button>

                {activeTab === 'datos' && (
                  <>
                    {!isEditingData ? (
                      <div className="animate-[fadeIn_0.2s_ease-out] space-y-6">
                        <div className="bg-white dark:bg-[#111111] rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
                          <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-white/5">
                            <h4 className="flex items-center gap-2 font-bold text-slate-900 dark:text-white"><User size={18} className="text-slate-400" /> Detalles del Paciente</h4>
                            <button onClick={() => setIsEditingData(true)} className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 dark:border-white/10 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"><Edit3 size={14} /> Editar datos</button>
                          </div>
                          <div className="px-6 py-2 pb-6 grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-10 text-sm">
                            <div className="flex flex-col py-3 border-b border-slate-100 dark:border-white/5"><span className="text-slate-500 font-medium mb-1">Nombre completo</span><span className="font-bold text-slate-900 dark:text-white">{pacienteSeleccionado.nombres} {pacienteSeleccionado.apellidos}</span></div>
                            <div className="flex flex-col py-3 border-b border-slate-100 dark:border-white/5"><span className="text-slate-500 font-medium mb-1">Identificación (C.I)</span><span className="font-bold text-slate-900 dark:text-white">{pacienteSeleccionado.cedula || '—'}</span></div>
                            <div className="flex flex-col py-3 border-b border-slate-100 dark:border-white/5"><span className="text-slate-500 font-medium mb-1">Edad y Nacimiento</span><span className="font-bold text-slate-900 dark:text-white">{calcularEdad(pacienteSeleccionado.fecha_nacimiento)} años <span className="text-slate-400 font-medium ml-1">({formatearFechaTexto(pacienteSeleccionado.fecha_nacimiento)})</span></span></div>
                            <div className="flex flex-col py-3 border-b border-slate-100 dark:border-white/5"><span className="text-slate-500 font-medium mb-1">Género</span><span className="font-bold text-slate-900 dark:text-white">{pacienteSeleccionado.sexo}</span></div>
                            <div className="flex flex-col py-3 border-b border-slate-100 dark:border-white/5"><span className="text-slate-500 font-medium mb-1">Correo electrónico</span><span className="font-bold text-slate-900 dark:text-white">{pacienteSeleccionado.correo || '—'}</span></div>
                            <div className="flex flex-col py-3 border-b border-slate-100 dark:border-white/5"><span className="text-slate-500 font-medium mb-1">Teléfono principal</span><span className="font-bold text-slate-900 dark:text-white">{pacienteSeleccionado.telefono || '—'}</span></div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <form onSubmit={handleActualizarPaciente} className="animate-[fadeIn_0.2s_ease-out] space-y-6">
                        <div className="flex justify-between items-center mb-4 border-b border-slate-200 dark:border-white/10 pb-4">
                          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Modificar Ficha</h3>
                          <div className="flex gap-2">
                            <button type="button" onClick={() => setIsEditingData(false)} className="px-4 py-2 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-[#111111] hover:bg-slate-50 dark:hover:bg-white/5">Cancelar</button>
                            <button type="submit" disabled={guardando} className="px-6 py-2 bg-[#0081a7] hover:bg-[#006b8a] text-white rounded-xl text-xs font-bold shadow-md disabled:opacity-50 transition-colors">{guardando ? 'Guardando...' : 'Guardar Cambios'}</button>
                          </div>
                        </div>
                        <div className="bg-white dark:bg-[#111111] rounded-2xl p-6 border border-slate-200 dark:border-white/5 shadow-sm">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            <div><label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Cédula</label><input type="text" name="cedula" value={editFormData.cedula} onChange={(e) => handleInputChange(e, true)} maxLength="12" className="w-full px-4 py-3 bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#0081a7]" /></div>
                            <div><label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Nombres</label><input type="text" name="nombres" value={editFormData.nombres} onChange={(e) => handleInputChange(e, true)} required className="w-full px-4 py-3 bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#0081a7]" /></div>
                            <div><label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Apellidos</label><input type="text" name="apellidos" value={editFormData.apellidos} onChange={(e) => handleInputChange(e, true)} required className="w-full px-4 py-3 bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#0081a7]" /></div>
                            <div><label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Fecha nacimiento</label><input type="date" name="fecha_nacimiento" value={editFormData.fecha_nacimiento} onChange={(e) => handleInputChange(e, true)} required className="w-full px-4 py-3 bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#0081a7] [&::-webkit-calendar-picker-indicator]:dark:invert" /></div>
                            <div><label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Sexo</label><select name="sexo" value={editFormData.sexo} onChange={(e) => handleInputChange(e, true)} required className="w-full px-4 py-3 bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#0081a7]"><option value="Masculino">Masculino</option><option value="Femenino">Femenino</option><option value="Otro">Otro</option></select></div>
                            <div><label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Teléfono</label><input type="text" name="telefono" value={editFormData.telefono} onChange={(e) => handleInputChange(e, true)} maxLength="12" className="w-full px-4 py-3 bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#0081a7]" /></div>
                          </div>
                        </div>
                      </form>
                    )}
                  </>
                )}

                {/* ================= TAB 2: CONSULTAS ANTERIORES (ESTILO OSCURO/MINIMALISTA) ================= */}
                {activeTab === 'historias' && (
                  <div className="animate-[fadeIn_0.2s_ease-out]">
                    <div className="bg-[#111111] dark:bg-[#0a0a0a] rounded-2xl border border-slate-200 dark:border-white/5 overflow-hidden shadow-xl">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left whitespace-nowrap">
                          <thead className="bg-[#f8fafc] dark:bg-[#16161a] border-b border-slate-200 dark:border-white/5">
                            <tr className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest">
                              <th className="px-6 py-4">Fecha</th>
                              <th className="px-6 py-4">Motivo</th>
                              <th className="px-6 py-4">Estado</th>
                              <th className="px-6 py-4 text-right">Acciones</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                            {consultasPaciente.map((consulta) => (
                              <tr key={consulta.id} className="hover:bg-slate-50 dark:hover:bg-[#16161a] transition-colors">
                                <td className="px-6 py-4 text-sm font-medium text-slate-800 dark:text-slate-200">
                                  {formatearFechaTextoCompleta(consulta.fecha_consulta)}
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                                  {consulta.motivo || 'Ingreso Forma 15-108'}
                                </td>
                                <td className="px-6 py-4">
                                  <span className="inline-block bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-500 border border-emerald-200 dark:border-emerald-800/30 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider">
                                    {consulta.estado || 'Finalizada'}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                  <button 
                                    onClick={() => setNotaModal({isOpen: true, html: consulta.nota_clinica || 'Sin notas.'})}
                                    className="text-[#0081a7] dark:text-cyan-500 hover:text-[#005f7a] dark:hover:text-cyan-400 font-bold text-xs transition-colors"
                                  >
                                    Ver nota
                                  </button>
                                </td>
                              </tr>
                            ))}
                            {consultasPaciente.length === 0 && (
                              <tr>
                                <td colSpan="4" className="px-6 py-8 text-center text-slate-500 text-sm">
                                  Este paciente no tiene consultas previas registradas.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>
          )}
        </div>
      </main>

      {/* MODAL CREAR PACIENTE */}
      {isModalCrearOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-white dark:bg-[#111111] w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-white/5">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Registrar Nuevo Paciente</h2>
              <button onClick={() => setIsModalCrearOpen(false)} className="p-2 text-slate-400 hover:text-rose-500 bg-slate-100 dark:bg-white/5 rounded-full transition-colors"><X size={20} /></button>
            </div>
            <div className="p-6 overflow-y-auto custom-scrollbar bg-slate-50/50 dark:bg-[#0a0a0a]/50">
              <form id="formPacienteN" onSubmit={handleGuardarPaciente} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div><label className="block text-xs font-bold mb-1.5 text-slate-700 dark:text-slate-300">Cédula</label><input type="text" name="cedula" value={formData.cedula} onChange={(e) => handleInputChange(e, false)} maxLength="12" className="w-full px-4 py-3 bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#0081a7]" required /></div>
                  <div><label className="block text-xs font-bold mb-1.5 text-slate-700 dark:text-slate-300">Nombres *</label><input type="text" name="nombres" value={formData.nombres} onChange={(e) => handleInputChange(e, false)} required className="w-full px-4 py-3 bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#0081a7]" /></div>
                  <div><label className="block text-xs font-bold mb-1.5 text-slate-700 dark:text-slate-300">Apellidos *</label><input type="text" name="apellidos" value={formData.apellidos} onChange={(e) => handleInputChange(e, false)} required className="w-full px-4 py-3 bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#0081a7]" /></div>
                  <div><label className="block text-xs font-bold mb-1.5 text-slate-700 dark:text-slate-300">Fecha nacimiento *</label><input type="date" name="fecha_nacimiento" value={formData.fecha_nacimiento} onChange={(e) => handleInputChange(e, false)} required className="w-full px-4 py-3 bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#0081a7] [&::-webkit-calendar-picker-indicator]:dark:invert" /></div>
                  <div><label className="block text-xs font-bold mb-1.5 text-slate-700 dark:text-slate-300">Sexo *</label><select name="sexo" value={formData.sexo} onChange={(e) => handleInputChange(e, false)} required className="w-full px-4 py-3 bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#0081a7]"><option value="">Seleccione...</option><option value="Masculino">Masculino</option><option value="Femenino">Femenino</option></select></div>
                  <div><label className="block text-xs font-bold mb-1.5 text-slate-700 dark:text-slate-300">Teléfono</label><input type="text" name="telefono" value={formData.telefono} onChange={(e) => handleInputChange(e, false)} maxLength="12" className="w-full px-4 py-3 bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#0081a7]" /></div>
                </div>
              </form>
            </div>
            <div className="p-6 border-t border-slate-200 dark:border-white/5 flex gap-3 justify-end bg-slate-50 dark:bg-[#111111] rounded-b-2xl">
              <button type="button" onClick={() => setIsModalCrearOpen(false)} className="px-5 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 hover:bg-slate-50 transition-colors text-sm">Cancelar</button>
              <button type="submit" form="formPacienteN" disabled={guardando} className="bg-[#0081a7] hover:bg-[#006b8a] text-white px-6 py-2.5 rounded-xl font-bold shadow-md transition-colors text-sm disabled:opacity-50">{guardando ? 'Guardando...' : 'Guardar Paciente'}</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #3f3f46; border-radius: 10px; }
        .hide-scroll::-webkit-scrollbar { display: none; }
        .html-viewer h3 { font-size: 1.25rem; font-weight: 900; margin-bottom: 1rem; text-align: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 0.5rem; }
        .dark .html-viewer h3 { border-color: #333; }
        .html-viewer h4 { font-size: 1rem; font-weight: bold; margin-top: 1.5rem; margin-bottom: 0.5rem; background: #f8fafc; padding: 0.5rem; border-radius: 0.5rem; }
        .dark .html-viewer h4 { background: #1a1a1a; }
        .html-viewer p { margin-bottom: 0.5rem; }
        .html-viewer ul { list-style-type: disc; margin-left: 1.5rem; margin-bottom: 1rem; }
        .html-viewer table { width: 100%; border-collapse: collapse; margin: 1rem 0; }
        .html-viewer td { border: 1px solid #e2e8f0; padding: 0.5rem; }
        .dark .html-viewer td { border-color: #333; }
      `}</style>
    </div>
  );
}