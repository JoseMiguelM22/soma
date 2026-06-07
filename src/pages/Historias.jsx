import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { 
  Home, Users, FileText, Calendar, User, Settings, LogOut, 
  Menu, Sun, Moon, Plus, Search, X, PanelLeft, ClipboardList, 
  Activity, Check, Maximize, FileSignature, AlignLeft, Bold, Italic, 
  Underline, Strikethrough, List, ListOrdered, Type, Eye, Filter, ArrowLeft, Edit3
} from 'lucide-react';

export default function Historias() {
  const navigate = useNavigate();
  
  // ================= ESTADOS DE UI =================
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // ================= MODALES Y VISTAS =================
  const [isModalConsultaOpen, setIsModalConsultaOpen] = useState(false); 
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null); 
  
  // ================= ESTADOS DE DATOS =================
  const [userData, setUserData] = useState(null);
  const [consultas, setConsultas] = useState([]); // Todas las consultas crudas
  const [historiasAgrupadas, setHistoriasAgrupadas] = useState([]); // Consultas agrupadas por paciente
  const [pacientesLista, setPacientesLista] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  
  const [guardando, setGuardando] = useState(false);
  
  // Estado para NUEVA o EDITAR Historia
  const [historiaData, setHistoriaData] = useState({
    id: null,
    id_paciente: '', 
    fecha_consulta: new Date().toISOString().slice(0, 16),
    proxima_consulta: '',
    consultorio: '',
    nota_clinica: 'Diagnóstico:\n\n'
  });

  const listaConsultorios = [
    "Medics", "", "Centro clinico"];

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

    const { data: dbPacientes } = await supabase.from('pacientes').select('*').eq('id_medico', session.user.id).order('nombres', { ascending: true });
    if (dbPacientes) setPacientesLista(dbPacientes);

    const { data: dbConsultas, error: consError } = await supabase
      .from('consultas')
      .select('*, pacientes(*)')
      .eq('id_medico', session.user.id)
      .order('created_at', { ascending: false });

    if (dbConsultas && !consError) {
      const validas = dbConsultas.filter(c => c.pacientes != null);
      setConsultas(validas);

      // AGRUPAR POR PACIENTE PARA EVITAR DUPLICADOS EN LA VISTA PRINCIPAL
      const mapaAgrupado = new Map();
      validas.forEach(c => {
        // Soporte por si Supabase devuelve arreglo u objeto
        const pac = Array.isArray(c.pacientes) ? c.pacientes[0] : c.pacientes;
        if (!mapaAgrupado.has(pac.id)) {
          mapaAgrupado.set(pac.id, {
            paciente: pac,
            ultima_consulta: c,
            total_visitas: 1
          });
        } else {
          mapaAgrupado.get(pac.id).total_visitas += 1;
        }
      });
      setHistoriasAgrupadas(Array.from(mapaAgrupado.values()));
    }
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

  const formatearFechaTexto = (fechaCompleta) => {
    if (!fechaCompleta) return '';
    const fecha = new Date(fechaCompleta);
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const dia = String(fecha.getDate()).padStart(2, '0');
    const horas = String(fecha.getHours()).padStart(2, '0');
    const minutos = String(fecha.getMinutes()).padStart(2, '0');
    return `${dia} de ${meses[fecha.getMonth()]} de ${fecha.getFullYear()} a las ${horas}:${minutos}`;
  };

  // ================= LÓGICA DEL EDITOR DE TEXTO (WYSIWYG FAKE) =================
  const insertTextAtCursor = (textToInsert) => {
    const textarea = document.getElementById('editorClinico');
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = historiaData.nota_clinica;
    
    const newText = text.substring(0, start) + textToInsert + text.substring(end);
    setHistoriaData({ ...historiaData, nota_clinica: newText });
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + textToInsert.length, start + textToInsert.length);
    }, 0);
  };

  // ================= FUNCIONES DE NAVEGACIÓN Y GUARDADO =================
  
  // Abre la lista de historias de un paciente específico
  const verHistorialPaciente = (paciente) => {
    setPacienteSeleccionado(paciente);
    setIsModalConsultaOpen(false);
  };

  // Abre el editor para crear/editar una consulta específica
  const abrirEditorHistoria = (consulta = null, idPacienteForzado = null) => {
    if (consulta) {
      // MODO EDICIÓN
      setHistoriaData({
        id: consulta.id,
        id_paciente: consulta.id_paciente,
        fecha_consulta: consulta.fecha_consulta || consulta.created_at.slice(0, 16),
        proxima_consulta: consulta.proxima_consulta || '',
        consultorio: consulta.consultorio || '',
        nota_clinica: consulta.nota_clinica || consulta.sintomas || '' 
      });
    } else {
      // MODO NUEVO
      setHistoriaData({
        id: null,
        id_paciente: idPacienteForzado || (pacienteSeleccionado ? pacienteSeleccionado.id : ''),
        fecha_consulta: new Date().toISOString().slice(0, 16),
        proxima_consulta: '',
        consultorio: '',
        nota_clinica: 'Diagnóstico:\n\n'
      });
    }
    setIsModalConsultaOpen(true);
  };

  const handleGuardarHistoria = async (e) => {
    e.preventDefault();
    setGuardando(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const payload = {
        id_medico: session.user.id,
        id_paciente: historiaData.id_paciente,
        fecha_consulta: historiaData.fecha_consulta,
        proxima_consulta: historiaData.proxima_consulta || null,
        consultorio: historiaData.consultorio,
        nota_clinica: historiaData.nota_clinica,
        estado: 'Completada',
        motivo: 'Evolutiva' 
      };

      let error;
      if (historiaData.id) {
        const res = await supabase.from('consultas').update(payload).eq('id', historiaData.id);
        error = res.error;
      } else {
        const res = await supabase.from('consultas').insert([payload]);
        error = res.error;
      }

      if (error) {
        if (error.message.includes('column')) {
          alert("Asegúrate de agregar las nuevas columnas a la tabla 'consultas' en Supabase.");
        } else throw error;
      } else {
        await fetchData(); // Refrescar los datos para que aparezcan enseguida
        setIsModalConsultaOpen(false);
      }
    } catch (error) {
      alert("Error al guardar: " + error.message);
    } finally {
      setGuardando(false);
    }
  };

  // ================= FILTROS =================
  const agrupadasFiltradas = historiasAgrupadas.filter(item => {
    const term = busqueda.toLowerCase();
    return item.paciente.nombres.toLowerCase().includes(term) || 
           item.paciente.apellidos.toLowerCase().includes(term) ||
           (item.paciente.cedula && item.paciente.cedula.includes(term));
  });

  const consultasDelPaciente = pacienteSeleccionado 
    ? consultas.filter(c => c.id_paciente === pacienteSeleccionado.id) 
    : [];

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
              <Link to="/historias" className="flex items-center gap-3 py-2.5 bg-cyan-50 dark:bg-[#1e1e1e] text-cyan-700 dark:text-cyan-400 border border-transparent dark:border-white/5 rounded-lg font-bold transition-colors"><FileText size={20} className="shrink-0" />{!isCollapsed && <span>Historias Clínicas</span>}</Link>
              <Link to="/agenda" className="flex items-center gap-3 py-2.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg font-medium transition-colors"><Calendar size={20} className="shrink-0" />{!isCollapsed && <span>Agenda</span>}</Link>
            </nav>
          </div>
        </div>

        <div className="p-4 border-t border-slate-200 dark:border-white/5 flex flex-col">
          <button onClick={handleLogout} className="flex items-center gap-3 py-2 w-full text-slate-500 dark:text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg font-medium transition-colors"><LogOut size={20} className="shrink-0" />{!isCollapsed && <span>Cerrar Sesión</span>}</button>
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
          
          {/* ========================================================
              VISTA 1: LISTADO GLOBAL (AGRUPADO POR PACIENTE)
              ======================================================== */}
          {!isModalConsultaOpen && !pacienteSeleccionado && (
            <div className="p-4 md:p-8 max-w-[1600px] mx-auto w-full animate-[fadeIn_0.3s_ease-out]">
              <div className="bg-white dark:bg-[#111111] rounded-[2rem] shadow-xl overflow-hidden border border-slate-200 dark:border-white/5">
                
                {/* Cabecera Azul */}
                <div className="bg-[#0081a7] dark:bg-[#005f7a] px-8 py-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <h2 className="text-3xl font-black text-white mb-2 tracking-tight">Historias clínicas</h2>
                    <p className="text-cyan-100 text-sm font-medium">Filtra por rango, busca por paciente y abre cada historia para verla.</p>
                  </div>
                  <button onClick={() => abrirEditorHistoria(null)} className="bg-white text-[#0081a7] hover:bg-slate-50 px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2 transform hover:-translate-y-0.5 whitespace-nowrap">
                    <Plus size={18} /> Nueva historia
                  </button>
                </div>

                <div className="p-8">
                  <div className="mb-6">
                    <div className="flex justify-between items-end mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Pacientes con Historial</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Última visita registrada</p>
                      </div>
                      <span className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                        {historiasAgrupadas.length} pacientes
                      </span>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                          type="text" 
                          placeholder="Buscar por nombre, cédula o teléfono..." 
                          className="w-full pl-11 pr-4 py-3 bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:text-white text-sm shadow-sm"
                          value={busqueda}
                          onChange={(e) => setBusqueda(e.target.value)}
                        />
                      </div>
                      <div className="flex gap-3 shrink-0">
                        <button className="flex items-center gap-2 px-5 py-3 border border-slate-200 dark:border-white/10 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors font-bold text-sm shadow-sm"><Filter size={16} /> Filtros</button>
                        <button className="bg-[#0081a7] hover:bg-[#006b8a] dark:bg-cyan-600 text-white px-8 py-3 rounded-xl font-bold shadow-md text-sm transition-colors">Buscar</button>
                      </div>
                    </div>
                  </div>

                  {loading ? (
                    <div className="flex justify-center items-center h-48"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0081a7]"></div></div>
                  ) : agrupadasFiltradas.length === 0 ? (
                    <div className="border-t border-slate-100 dark:border-white/5 py-16 flex flex-col items-center justify-center text-center">
                      <ClipboardList size={40} className="text-slate-300 dark:text-slate-600 mb-4" />
                      <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">No hay historias registradas</h3>
                      <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md">Empieza a registrar el historial de tus pacientes creando una nueva historia.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto border-t border-slate-100 dark:border-white/5 pt-4">
                      <table className="w-full text-left whitespace-nowrap">
                        <thead>
                          <tr className="border-b border-slate-200 dark:border-white/10 text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                            <th className="px-4 py-3">ÚLTIMA FECHA</th>
                            <th className="px-4 py-3">PACIENTE</th>
                            <th className="px-4 py-3">CÉDULA</th>
                            <th className="px-4 py-3 hidden sm:table-cell">TELÉFONO</th>
                            <th className="px-4 py-3 hidden md:table-cell">ÚLTIMO CONSULTORIO</th>
                            <th className="px-4 py-3 text-center">HISTORIAL</th>
                            <th className="px-4 py-3 text-right"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                          {agrupadasFiltradas.map((agrup) => (
                            <tr key={agrup.paciente.id} className="hover:bg-slate-50 dark:hover:bg-[#1a1a1a] transition-colors group cursor-pointer" onClick={() => verHistorialPaciente(agrup.paciente)}>
                              
                              <td className="px-4 py-4 text-sm text-slate-700 dark:text-slate-300 font-medium">
                                {formatearFechaTexto(agrup.ultima_consulta.fecha_consulta || agrup.ultima_consulta.created_at)}
                              </td>
                              
                              <td className="px-4 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center text-cyan-700 dark:text-cyan-400 font-bold text-xs shrink-0">
                                    {agrup.paciente.nombres.charAt(0)}{agrup.paciente.apellidos.charAt(0)}
                                  </div>
                                  <p className="font-bold text-sm text-slate-900 dark:text-white">{agrup.paciente.nombres} {agrup.paciente.apellidos}</p>
                                </div>
                              </td>
                              
                              <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-300">
                                {agrup.paciente.cedula || '—'}
                              </td>
                              
                              <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-300 hidden sm:table-cell">
                                {agrup.paciente.telefono || '—'}
                              </td>

                              <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-300 hidden md:table-cell">
                                {agrup.ultima_consulta.consultorio || '—'}
                              </td>

                              <td className="px-4 py-4 text-center">
                                <span className="bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800 px-3 py-1 rounded-full text-[10px] font-bold">
                                  {agrup.total_visitas} registros
                                </span>
                              </td>
                              
                              <td className="px-4 py-4 text-right">
                                <button onClick={(e) => { e.stopPropagation(); verHistorialPaciente(agrup.paciente); }} className="flex items-center gap-1.5 px-3 py-1.5 border border-cyan-200 dark:border-cyan-900 text-cyan-700 dark:text-cyan-400 rounded-full text-xs font-bold hover:bg-cyan-50 dark:hover:bg-cyan-900/40 transition-colors ml-auto">
                                  <Eye size={14} /> Ver historial
                                </button>
                              </td>
                              
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              VISTA 2: LISTADO DE HISTORIAS DEL PACIENTE ESPECÍFICO
              ======================================================== */}
          {!isModalConsultaOpen && pacienteSeleccionado && (
            <div className="p-4 md:p-8 max-w-[1600px] mx-auto w-full animate-[fadeIn_0.3s_ease-out]">
              
              <button onClick={() => setPacienteSeleccionado(null)} className="flex items-center gap-1.5 text-slate-500 hover:text-[#0081a7] font-bold text-sm mb-4 transition-colors">
                <ArrowLeft size={16} /> Volver a todas las historias
              </button>

              <div className="bg-white dark:bg-[#111111] rounded-[2rem] shadow-xl overflow-hidden border border-slate-200 dark:border-white/5">
                
                <div className="bg-[#0081a7] dark:bg-[#005f7a] px-8 py-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-white/20 rounded-full border-2 border-white/10 flex items-center justify-center shrink-0">
                      <User size={28} className="text-white opacity-80" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-white mb-1 tracking-tight">Historial de {pacienteSeleccionado.nombres}</h2>
                      <p className="text-cyan-100 text-sm font-medium">C.I: {pacienteSeleccionado.cedula || 'N/A'}</p>
                    </div>
                  </div>
                  <button onClick={() => abrirEditorHistoria(null, pacienteSeleccionado.id)} className="bg-white text-[#0081a7] hover:bg-slate-50 px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2 transform hover:-translate-y-0.5 whitespace-nowrap">
                    <Plus size={18} /> Nueva historia
                  </button>
                </div>

                <div className="p-8">
                  {consultasDelPaciente.length === 0 ? (
                    <div className="py-16 flex flex-col items-center justify-center text-center">
                      <ClipboardList size={40} className="text-slate-300 dark:text-slate-600 mb-4" />
                      <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Este paciente no tiene historias registradas</h3>
                      <button onClick={() => abrirEditorHistoria(null, pacienteSeleccionado.id)} className="mt-4 text-cyan-600 font-bold hover:underline">Crear su primera evolución médica</button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left whitespace-nowrap">
                        <thead>
                          <tr className="border-b border-slate-200 dark:border-white/10 text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                            <th className="px-4 py-3">FECHA</th>
                            <th className="px-4 py-3">CONSULTORIO</th>
                            <th className="px-4 py-3">TIPO</th>
                            <th className="px-4 py-3 text-right">ACCIÓN</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                          {consultasDelPaciente.map((c) => (
                            <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-[#1a1a1a] transition-colors group">
                              <td className="px-4 py-4 text-sm text-slate-900 dark:text-white font-bold">
                                {formatearFechaTexto(c.fecha_consulta || c.created_at)}
                              </td>
                              <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-300">
                                {c.consultorio || '—'}
                              </td>
                              <td className="px-4 py-4">
                                <span className="bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 px-3 py-1 rounded-full text-[10px] font-bold">
                                  {c.motivo}
                                </span>
                              </td>
                              <td className="px-4 py-4 text-right">
                                <button onClick={() => abrirEditorHistoria(c)} className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-50 dark:hover:bg-white/5 transition-colors ml-auto">
                                  <Edit3 size={14} /> Ver / Editar
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              VISTA 3: CREAR / EDITAR HISTORIA CLÍNICA (EL EDITOR)
              ======================================================== */}
          {isModalConsultaOpen && (
            <div className="p-4 md:p-8 max-w-[1600px] mx-auto w-full animate-[fadeIn_0.3s_ease-out]">
              <div className="bg-white dark:bg-[#111111] rounded-[1.5rem] shadow-xl border border-slate-200 dark:border-white/5 overflow-hidden">
                
                {/* Cabecera Principal */}
                {pacienteSeleccionado ? (
                  <div className="bg-slate-100 dark:bg-[#161616] p-6 border-b border-slate-200 dark:border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center text-cyan-700 font-bold text-lg shrink-0">
                        {pacienteSeleccionado.nombres.charAt(0)}{pacienteSeleccionado.apellidos.charAt(0)}
                      </div>
                      <div>
                        <h2 className="text-lg font-black text-slate-900 dark:text-white">{pacienteSeleccionado.nombres} {pacienteSeleccionado.apellidos}</h2>
                        <div className="flex gap-2 text-xs text-slate-500 font-medium">
                          <span>C.I: {pacienteSeleccionado.cedula}</span>
                          <span>•</span>
                          <span>{pacienteSeleccionado.sexo}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 border-b border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-[#161616]">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 block mb-2">Seleccionar Paciente *</label>
                    <select 
                      required 
                      value={historiaData.id_paciente} 
                      onChange={(e) => setHistoriaData({...historiaData, id_paciente: e.target.value})} 
                      className="w-full max-w-md p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#111111] text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                      <option value="">Buscar paciente...</option>
                      {pacientesLista.map(p => (<option key={p.id} value={p.id}>{p.nombres} {p.apellidos} - {p.cedula}</option>))}
                    </select>
                  </div>
                )}

                {/* Sub-cabecera de Herramientas */}
                <div className="flex flex-col md:flex-row md:items-center justify-between p-6 border-b border-slate-200 dark:border-white/5 gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                      {historiaData.id ? 'Edit Historia Evolutiva' : 'Nueva Historia Evolutiva'}
                    </h3>
                    <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                      <span>Consulta <strong>{formatearFechaTexto(historiaData.fecha_consulta.split('T')[0])}</strong></span>
                      <span className="bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 px-2 py-0.5 rounded text-[10px] font-black tracking-wider uppercase">
                        {historiaData.id ? 'Guardado' : 'Borrador'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button className="hidden md:flex items-center gap-1.5 px-4 py-2 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#1a1a1a] shadow-sm transition-colors"><Maximize size={14} /> Modo Foco</button>
                    <button onClick={() => setIsModalConsultaOpen(false)} className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#1a1a1a] shadow-sm transition-colors"><X size={14} /> Cancelar</button>
                    <button onClick={handleGuardarHistoria} disabled={guardando || !historiaData.id_paciente} className="flex items-center gap-1.5 px-5 py-2 bg-[#0081a7] hover:bg-[#006b8a] text-white rounded-xl text-xs font-bold shadow-md transition-colors disabled:opacity-50">
                      {guardando ? 'Guardando...' : <><Check size={14} /> Guardar</>}
                    </button>
                  </div>
                </div>

                {/* Sub-pestañas internas */}
                <div className="flex px-6 border-b border-slate-200 dark:border-white/5 text-sm font-bold text-slate-500 dark:text-slate-400 gap-6">
                  <button className="py-3 hover:text-slate-800 dark:hover:text-white transition-colors">Ver historia clínica</button>
                  <button className="py-3 border-b-[3px] border-[#0081a7] dark:border-cyan-500 text-[#0081a7] dark:text-cyan-400">Historia clínica</button>
                  <button className="py-3 hover:text-slate-800 dark:hover:text-white transition-colors">Compartir</button>
                </div>

                {/* Formulario de Historia */}
                <div className="p-6 md:p-8 space-y-8 bg-slate-50/50 dark:bg-[#0a0a0a]/50">
                  
                  {/* Bloque 1: Fecha y Lugar */}
                  <div className="bg-white dark:bg-[#111111] border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm">
                    <h4 className="font-bold text-slate-900 dark:text-white mb-6">Fecha y lugar de la consulta</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Fecha de la consulta</label>
                        <input 
                          type="datetime-local" 
                          value={historiaData.fecha_consulta} 
                          onChange={(e) => setHistoriaData({...historiaData, fecha_consulta: e.target.value})}
                          className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-cyan-500 transition-all [&::-webkit-calendar-picker-indicator]:dark:invert" 
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Próxima consulta <span className="font-normal text-slate-400">(opcional - agenda)</span></label>
                        <input 
                          type="datetime-local" 
                          value={historiaData.proxima_consulta} 
                          onChange={(e) => setHistoriaData({...historiaData, proxima_consulta: e.target.value})}
                          className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-cyan-500 transition-all [&::-webkit-calendar-picker-indicator]:dark:invert" 
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Consultorio</label>
                        <select 
                          value={historiaData.consultorio} 
                          onChange={(e) => setHistoriaData({...historiaData, consultorio: e.target.value})}
                          className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
                        >
                          <option value="">Seleccione o escriba...</option>
                          {listaConsultorios.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Bloque 2: Nota Clínica (WYSIWYG FAKE) */}
                  <div className="bg-white dark:bg-[#111111] border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm">
                    <div className="mb-4">
                      <h4 className="font-bold text-slate-900 dark:text-white">Nota clínica</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Contenido principal de la consulta.</p>
                    </div>
                    
                    <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold text-[#0081a7] dark:text-cyan-400 hover:bg-slate-50 dark:hover:bg-[#1a1a1a] transition-colors mb-6">
                      <FileSignature size={14} /> Seleccionar Plantilla
                    </button>

                    {/* Contenedor del Editor */}
                    <div className="border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden flex flex-col bg-white dark:bg-[#111111]">
                      {/* Menú Texto Superior */}
                      <div className="hidden sm:flex items-center gap-4 px-4 py-2 text-[11px] font-medium text-slate-600 dark:text-slate-400 border-b border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-[#161616]">
                        <span className="cursor-pointer hover:text-cyan-500">Archivo</span>
                        <span className="cursor-pointer hover:text-cyan-500">Editar</span>
                        <span className="cursor-pointer hover:text-cyan-500">Ver</span>
                        <span className="cursor-pointer hover:text-cyan-500">Insertar</span>
                        <span className="cursor-pointer hover:text-cyan-500">Formato</span>
                        <span className="cursor-pointer hover:text-cyan-500">Herramientas</span>
                      </div>
                      
                      {/* Barra de Herramientas (Botones Funcionales para Inyectar Markdown/Texto) */}
                      <div className="flex flex-wrap items-center gap-1.5 px-4 py-2 border-b border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-[#161616]">
                        <select className="text-xs bg-transparent border-none text-slate-700 dark:text-slate-300 outline-none cursor-pointer"><option>Párrafo</option></select>
                        <div className="w-px h-4 bg-slate-300 dark:bg-slate-600 mx-1"></div>
                        <button type="button" onClick={() => insertTextAtCursor('**Texto Negrita**')} className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 rounded" title="Negrita"><Bold size={14} /></button>
                        <button type="button" onClick={() => insertTextAtCursor('*Texto Cursiva*')} className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 rounded" title="Cursiva"><Italic size={14} /></button>
                        <button type="button" onClick={() => insertTextAtCursor('__Texto Subrayado__')} className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 rounded" title="Subrayado"><Underline size={14} /></button>
                        <button type="button" onClick={() => insertTextAtCursor('~~Texto Tachado~~')} className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 rounded" title="Tachar"><Strikethrough size={14} /></button>
                        <div className="w-px h-4 bg-slate-300 dark:bg-slate-600 mx-1"></div>
                        <button type="button" onClick={() => insertTextAtCursor('\n- Item 1\n- Item 2')} className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 rounded" title="Lista de viñetas"><List size={14} /></button>
                        <button type="button" onClick={() => insertTextAtCursor('\n1. Item 1\n2. Item 2')} className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 rounded" title="Lista numerada"><ListOrdered size={14} /></button>
                      </div>

                      {/* Área de Texto Editable */}
                      <textarea 
                        id="editorClinico"
                        value={historiaData.nota_clinica}
                        onChange={(e) => setHistoriaData({...historiaData, nota_clinica: e.target.value})}
                        className="w-full min-h-[300px] p-6 text-sm text-slate-900 dark:text-white bg-white dark:bg-[#111111] outline-none resize-y custom-scrollbar leading-relaxed"
                        placeholder="Escribe aquí el motivo de consulta, examen físico, diagnóstico..."
                      ></textarea>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #3f3f46; border-radius: 10px; }
      `}</style>
    </div>
  );
}