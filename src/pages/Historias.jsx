import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { 
  Home, Users, FileText, Calendar, User, Settings, LogOut, 
  Menu, Sun, Moon, Plus, Search, X, PanelLeft, ClipboardList, 
  Activity, FileBadge, Pill, MessageCircle, Stethoscope, FolderOpen, Trash2
} from 'lucide-react';
import { jsPDF } from "jspdf";

export default function Historias() {
  const navigate = useNavigate();
  
  // ================= ESTADOS DE UI =================
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // ================= MODALES =================
  const [isModalConsultaOpen, setIsModalConsultaOpen] = useState(false);
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null); 
  const [tipoDocumento, setTipoDocumento] = useState(null); 
  const [textoDocumento, setTextoDocumento] = useState(''); 
  
  // ================= ESTADOS DE DATOS =================
  const [userData, setUserData] = useState(null);
  const [consultas, setConsultas] = useState([]); // Todas las consultas crudas
  const [historiasAgrupadas, setHistoriasAgrupadas] = useState([]); // Para la tabla (1 por paciente)
  const [historialPaciente, setHistorialPaciente] = useState([]); // Consultas de un paciente específico
  const [pacientesLista, setPacientesLista] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  
  const [guardando, setGuardando] = useState(false);
  const [formData, setFormData] = useState({
    id_paciente: '', motivo: '', sintomas: '', diagnostico: '', tratamiento: ''
  });

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDarkMode]);

  // Cargar datos principales
  const fetchData = async () => {
    setLoading(true);
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (!session || sessionError) {
      navigate('/login');
      return;
    }

    const { data: dbUser } = await supabase.from('usuarios').select('*').eq('id_auth', session.user.id).single();
    if (dbUser) setUserData(dbUser);

    const { data: dbPacientes } = await supabase.from('pacientes').select('*').eq('id_medico', session.user.id).order('nombres', { ascending: true });
    if (dbPacientes) setPacientesLista(dbPacientes);

    const { data: dbConsultas, error: consError } = await supabase
      .from('consultas')
      .select('*, pacientes(*)')
      .eq('id_medico', session.user.id)
      .order('created_at', { ascending: false }); // Vienen de la más nueva a la más vieja

    if (dbConsultas && !consError) {
      setConsultas(dbConsultas);
      
      // AGRUPAMOS PARA EVITAR DUPLICADOS EN LA TABLA PRINCIPAL
      const mapaAgrupado = new Map();
      dbConsultas.forEach(c => {
        if (!mapaAgrupado.has(c.id_paciente)) {
          // Como están ordenadas por fecha, la primera que vemos es la ÚLTIMA visita
          mapaAgrupado.set(c.id_paciente, {
            paciente: c.pacientes,
            ultima_consulta: c,
            total_visitas: 1
          });
        } else {
          // Si ya existe, solo sumamos 1 al contador de visitas
          mapaAgrupado.get(c.id_paciente).total_visitas += 1;
        }
      });
      setHistoriasAgrupadas(Array.from(mapaAgrupado.values()));
    }
    setLoading(false);
  };

  useEffect(() => {
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ================= FUNCIONES DEL EXPEDIENTE =================
  
  const abrirExpediente = (paciente) => {
    setPacienteSeleccionado(paciente);
    // Filtramos localmente para que sea súper rápido sin recargar
    const historial = consultas.filter(c => c.id_paciente === paciente.id);
    setHistorialPaciente(historial);
  };

  const handleWhatsApp = (telefono) => {
    if (!telefono) {
      alert("Este paciente no tiene un número de teléfono registrado.");
      return;
    }
    let numeroLimpio = telefono.replace(/\D/g, '');
    if (numeroLimpio.startsWith('0')) numeroLimpio = '58' + numeroLimpio.substring(1);
    else if (!numeroLimpio.startsWith('58') && numeroLimpio.length === 10) numeroLimpio = '58' + numeroLimpio;
    
    window.open(`https://wa.me/${numeroLimpio}`, '_blank');
  };

  const handleGuardarConsulta = async (e) => {
    e.preventDefault();
    setGuardando(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const idFinalPaciente = pacienteSeleccionado ? pacienteSeleccionado.id : formData.id_paciente;

      const { data, error } = await supabase.from('consultas').insert([{
        id_medico: session.user.id,
        id_paciente: idFinalPaciente,
        motivo: formData.motivo,
        sintomas: formData.sintomas,
        diagnostico: formData.diagnostico,
        tratamiento: formData.tratamiento
      }]).select('*, pacientes(*)'); // Pedimos que devuelva con datos del paciente para la UI

      if (error) throw error;

      await fetchData(); // Recarga la tabla agrupada del fondo
      
      if (pacienteSeleccionado) {
        setHistorialPaciente([data[0], ...historialPaciente]); // Lo añade de primero en el modal
      }
      
      setIsModalConsultaOpen(false);
      setFormData({ id_paciente: '', motivo: '', sintomas: '', diagnostico: '', tratamiento: '' });

    } catch (error) {
      alert("Hubo un error al guardar. Intenta de nuevo.");
    } finally {
      setGuardando(false);
    }
  };

  // FUNCIÓN PARA ELIMINAR CONSULTA INDIVIDUAL
  const eliminarConsulta = async (idConsulta) => {
    const confirmar = window.confirm("¿Estás seguro de eliminar esta consulta? Esta acción no se puede deshacer.");
    if (!confirmar) return;

    try {
      const { error } = await supabase.from('consultas').delete().eq('id', idConsulta);
      if (error) throw error;

      // Actualizamos la UI quitándola de la lista
      setHistorialPaciente(historialPaciente.filter(c => c.id !== idConsulta));
      await fetchData(); // Refresca la tabla principal del fondo

    } catch (error) {
      alert("Error al eliminar la consulta.");
    }
  };

  // ================= MAGIA DEL PDF =================
  const generarPDF = (e) => {
    e.preventDefault();
    const doc = new jsPDF();

    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(0, 130, 160);
    doc.text("SOMA Cloud", 105, 20, { align: "center" });

    doc.setFontSize(14);
    doc.setTextColor(50, 50, 50);
    const titulo = tipoDocumento === 'recipe' ? 'RÉCIPE MÉDICO' : 'CONSTANCIA MÉDICA';
    doc.text(titulo, 105, 30, { align: "center" });

    doc.setLineWidth(0.5);
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 35, 190, 35);

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(`Médico Tratante: Dr(a). ${userData?.nombres} ${userData?.apellidos}`, 20, 45);
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 150, 45);

    doc.setFont("helvetica", "bold");
    doc.text("Datos del Paciente", 20, 60);
    doc.setFont("helvetica", "normal");
    doc.text(`Nombre: ${pacienteSeleccionado?.nombres} ${pacienteSeleccionado?.apellidos}`, 20, 68);
    doc.text(`Cédula: ${pacienteSeleccionado?.cedula || 'N/A'}`, 150, 68);

    doc.line(20, 75, 190, 75);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(50, 50, 50);
    const lineas = doc.splitTextToSize(textoDocumento, 170); 
    doc.text(lineas, 20, 85);

    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text("Documento generado de forma automatizada por SOMA Cloud", 105, 280, { align: "center" });

    const prefijo = tipoDocumento === 'recipe' ? 'Recipe' : 'Constancia';
    doc.save(`${prefijo}_${pacienteSeleccionado?.nombres}_${new Date().getTime()}.pdf`);
    
    setTipoDocumento(null);
    setTextoDocumento('');
  };

  // Buscador filtrando sobre la tabla agrupada
  const historiasFiltradas = historiasAgrupadas.filter(item => {
    const nombrePaciente = `${item.paciente?.nombres} ${item.paciente?.apellidos}`.toLowerCase();
    const motivo = item.ultima_consulta.motivo.toLowerCase();
    const termino = busqueda.toLowerCase();
    return nombrePaciente.includes(termino) || motivo.includes(termino) || (item.paciente?.cedula && item.paciente.cedula.includes(termino));
  });

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-[#0a0a0a] text-slate-800 dark:text-slate-200 font-sans overflow-hidden transition-colors duration-300">
      
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm transition-opacity" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* SIDEBAR */}
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
              <Link to="/pacientes" title="Pacientes" className={`flex items-center gap-3 py-2.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg font-medium transition-colors ${isCollapsed ? 'justify-center px-0' : 'px-3'}`}>
                <Users size={20} className="shrink-0" />
                {!isCollapsed && <span className="whitespace-nowrap">Pacientes</span>}
              </Link>
              <Link to="/historias" title="Historias Clínicas" className={`flex items-center gap-3 py-2.5 bg-cyan-50 dark:bg-[#1e1e1e] text-cyan-700 dark:text-cyan-400 border border-transparent dark:border-white/5 rounded-lg font-bold transition-colors ${isCollapsed ? 'justify-center px-0' : 'px-3'}`}>
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
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Historias Clínicas</h2>
            <p className="text-slate-500 dark:text-slate-400">Pacientes con historiales médicos activos.</p>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Buscar por paciente o motivo..." 
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#111111] border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white transition-all"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
            
            <button 
              onClick={() => {
                setPacienteSeleccionado(null); 
                setIsModalConsultaOpen(true);
              }}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/20 transform hover:-translate-y-0.5"
            >
              <Plus size={20} /> Nueva Consulta
            </button>
          </div>

          {/* TABLA PRINCIPAL DE HISTORIAS AGRUPADAS */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
            </div>
          ) : historiasFiltradas.length === 0 ? (
            <div className="bg-white dark:bg-[#111111] border border-slate-200 dark:border-white/5 rounded-2xl p-16 flex flex-col items-center justify-center text-center shadow-sm">
              <div className="bg-emerald-50 dark:bg-emerald-500/10 p-4 rounded-full mb-4">
                <ClipboardList size={40} className="text-emerald-500 dark:text-emerald-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">No hay historias registradas</h3>
              <p className="text-slate-500 dark:text-slate-400 max-w-md">
                {busqueda ? "No encontramos coincidencias." : "Empieza a registrar el historial médico de tus pacientes haciendo clic en 'Nueva Consulta'."}
              </p>
            </div>
          ) : (
            <div className="bg-white dark:bg-[#111111] border border-slate-200 dark:border-white/5 rounded-2xl overflow-hidden shadow-sm overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/5 text-slate-500 dark:text-slate-400 text-sm">
                    <th className="p-4 font-semibold">Última Visita</th>
                    <th className="p-4 font-semibold">Paciente</th>
                    <th className="p-4 font-semibold">Último Motivo</th>
                    <th className="p-4 font-semibold text-center">Total Visitas</th>
                    <th className="p-4 font-semibold text-center">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                  {historiasFiltradas.map((item) => (
                    <tr key={item.paciente.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                      <td className="p-4 text-sm font-medium text-slate-900 dark:text-white">
                        {new Date(item.ultima_consulta.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 font-bold text-xs">
                            {item.paciente.nombres.charAt(0)}{item.paciente.apellidos.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white text-sm">{item.paciente.nombres} {item.paciente.apellidos}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{item.paciente.cedula}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-slate-600 dark:text-slate-300 max-w-xs truncate">{item.ultima_consulta.motivo}</td>
                      <td className="p-4 text-center">
                        <span className="bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 px-2.5 py-1 rounded-md text-xs font-bold">
                          {item.total_visitas}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <button 
                          onClick={() => abrirExpediente(item.paciente)}
                          title="Abrir Expediente"
                          className="bg-slate-100 dark:bg-white/5 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 transition-colors px-3 py-1.5 rounded-lg text-sm font-bold border border-slate-200 dark:border-white/5 flex items-center gap-2 mx-auto"
                        >
                          <FolderOpen size={16} /> Expediente
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
          MODAL: EXPEDIENTE DEL PACIENTE (CENTRO DE MANDO)
          ========================================= */}
      {pacienteSeleccionado && !tipoDocumento && !isModalConsultaOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-white dark:bg-[#111111] w-full max-w-5xl rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 flex flex-col max-h-[90vh]">
            
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-white/5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center text-cyan-700 dark:text-cyan-400 font-bold text-2xl">
                  {pacienteSeleccionado.nombres.charAt(0)}{pacienteSeleccionado.apellidos.charAt(0)}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                    {pacienteSeleccionado.nombres} {pacienteSeleccionado.apellidos}
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">C.I: {pacienteSeleccionado.cedula || 'N/A'}</p>
                </div>
              </div>
              <button onClick={() => setPacienteSeleccionado(null)} className="p-2 text-slate-400 hover:text-rose-500 bg-slate-100 hover:bg-rose-50 dark:bg-white/5 dark:hover:bg-rose-500/10 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-slate-50 dark:bg-[#1a1a1a] p-5 rounded-2xl border border-slate-200 dark:border-white/5">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 uppercase tracking-wider">Acciones Clínicas</h3>
                  <div className="space-y-3">
                    
                    <button 
                      onClick={() => handleWhatsApp(pacienteSeleccionado.telefono)}
                      className="w-full flex items-center justify-center gap-3 bg-[#25D366] hover:bg-[#20b958] text-white p-3.5 rounded-xl font-bold transition-all shadow-md shadow-green-500/20"
                    >
                      <MessageCircle size={20} /> Escribir al WhatsApp
                    </button>

                    <button 
                      onClick={() => setIsModalConsultaOpen(true)}
                      className="w-full flex items-center justify-center gap-3 bg-emerald-500 hover:bg-emerald-600 text-white p-3.5 rounded-xl font-bold transition-all shadow-md shadow-emerald-500/20"
                    >
                      <Stethoscope size={20} /> Nueva Consulta
                    </button>

                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <button 
                        onClick={() => setTipoDocumento('recipe')}
                        className="flex flex-col items-center justify-center gap-2 bg-white dark:bg-[#222] border border-slate-200 dark:border-white/10 hover:border-cyan-500 dark:hover:border-cyan-500 text-slate-700 dark:text-slate-200 p-3 rounded-xl transition-all shadow-sm font-medium text-sm"
                      >
                        <Pill size={20} className="text-cyan-500" /> Récipe
                      </button>
                      <button 
                        onClick={() => setTipoDocumento('constancia')}
                        className="flex flex-col items-center justify-center gap-2 bg-white dark:bg-[#222] border border-slate-200 dark:border-white/10 hover:border-purple-500 dark:hover:border-purple-500 text-slate-700 dark:text-slate-200 p-3 rounded-xl transition-all shadow-sm font-medium text-sm"
                      >
                        <FileBadge size={20} className="text-purple-500" /> Constancia
                      </button>
                    </div>

                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-[#1a1a1a] p-5 rounded-2xl border border-slate-200 dark:border-white/5">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 uppercase tracking-wider">Datos Personales</h3>
                  <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
                    <li className="flex justify-between border-b border-slate-200 dark:border-white/5 pb-2">
                      <strong className="text-slate-800 dark:text-slate-300">Teléfono:</strong> 
                      <span>{pacienteSeleccionado.telefono || 'N/A'}</span>
                    </li>
                    <li className="flex justify-between border-b border-slate-200 dark:border-white/5 pb-2">
                      <strong className="text-slate-800 dark:text-slate-300">Sexo:</strong> 
                      <span>{pacienteSeleccionado.sexo}</span>
                    </li>
                    <li className="flex justify-between border-b border-slate-200 dark:border-white/5 pb-2">
                      <strong className="text-slate-800 dark:text-slate-300">Nacimiento:</strong> 
                      <span>{new Date(pacienteSeleccionado.fecha_nacimiento).toLocaleDateString()}</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="lg:col-span-2">
                <div className="flex items-center justify-between mb-4 bg-slate-50 dark:bg-[#1a1a1a] p-4 rounded-xl border border-slate-200 dark:border-white/5">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Activity size={20} className="text-emerald-500" /> Historial de Consultas
                  </h3>
                  <span className="bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 px-3 py-1 rounded-md font-bold text-sm">
                    {historialPaciente.length} visitas
                  </span>
                </div>

                {historialPaciente.length === 0 ? (
                  <div className="bg-white dark:bg-[#111111] p-10 rounded-2xl border border-dashed border-slate-300 dark:border-white/20 text-center flex flex-col items-center justify-center">
                    <FileText size={40} className="text-slate-300 dark:text-slate-600 mb-3" />
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">No tiene consultas registradas aún.</p>
                    <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">Usa el botón "Nueva Consulta" para empezar su historia.</p>
                  </div>
                ) : (
                  <div className="space-y-4 pr-2">
                    {historialPaciente.map((consulta) => (
                      <div key={consulta.id} className="bg-white dark:bg-[#111111] p-5 rounded-xl border border-slate-200 dark:border-white/10 shadow-sm relative overflow-hidden group hover:border-emerald-300 dark:hover:border-emerald-500/50 transition-colors">
                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-emerald-500 group-hover:bg-emerald-400 transition-colors"></div>
                        
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-bold text-lg text-slate-900 dark:text-white leading-tight">{consulta.motivo}</h4>
                          <div className="flex items-center gap-3">
                            <span className="text-xs bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 px-2 py-1 rounded font-medium whitespace-nowrap">
                              {new Date(consulta.created_at).toLocaleDateString()}
                            </span>
                            {/* BOTÓN ELIMINAR CONSULTA */}
                            <button 
                              onClick={() => eliminarConsulta(consulta.id)} 
                              className="text-slate-400 hover:text-rose-500 transition-colors bg-transparent hover:bg-rose-50 dark:hover:bg-rose-500/10 p-1.5 rounded-md"
                              title="Eliminar esta consulta"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                        
                        <div className="space-y-2 mt-3">
                          {consulta.sintomas && (
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              <strong className="text-slate-800 dark:text-slate-300 block mb-0.5">Síntomas:</strong> {consulta.sintomas}
                            </p>
                          )}
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            <strong className="text-slate-800 dark:text-slate-300 block mb-0.5">Diagnóstico:</strong> {consulta.diagnostico || 'Pendiente'}
                          </p>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            <strong className="text-slate-800 dark:text-slate-300 block mb-0.5">Tratamiento:</strong> {consulta.tratamiento || 'N/A'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================
          MODAL: ESCRIBIR DOCUMENTO (RÉCIPE / CONSTANCIA)
          ========================================= */}
      {tipoDocumento && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-white dark:bg-[#111111] w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 flex flex-col">
            
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-white/5">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                {tipoDocumento === 'recipe' ? <Pill className="text-cyan-500" /> : <FileBadge className="text-purple-500" />}
                {tipoDocumento === 'recipe' ? 'Redactar Récipe Médico' : 'Redactar Constancia Médica'}
              </h2>
              <button onClick={() => { setTipoDocumento(null); setTextoDocumento(''); }} className="p-2 text-slate-400 hover:text-rose-500 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                Escribe lo que deseas que aparezca en el PDF para <strong>{pacienteSeleccionado?.nombres}</strong>. Esto no altera su historia guardada.
              </p>
              <textarea 
                rows="6"
                placeholder={tipoDocumento === 'recipe' ? "Ej: 1. Ibuprofeno 400mg cada 8 horas por 3 días..." : "Ej: Hago constar que el paciente asistió a consulta y requiere 2 días de reposo..."}
                value={textoDocumento}
                onChange={(e) => setTextoDocumento(e.target.value)}
                className="w-full p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 outline-none resize-none"
              ></textarea>
            </div>

            <div className="p-6 border-t border-slate-200 dark:border-white/5 flex gap-3 justify-end bg-slate-50 dark:bg-[#0a0a0a] rounded-b-2xl">
              <button onClick={() => { setTipoDocumento(null); setTextoDocumento(''); }} className="px-5 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">
                Atrás al Perfil
              </button>
              <button 
                onClick={generarPDF}
                disabled={textoDocumento.trim() === ''}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all shadow-md text-white disabled:opacity-50 ${tipoDocumento === 'recipe' ? 'bg-cyan-600 hover:bg-cyan-700 shadow-cyan-500/20' : 'bg-purple-600 hover:bg-purple-700 shadow-purple-500/20'}`}
              >
                Generar y Descargar PDF
              </button>
            </div>

          </div>
        </div>
      )}

      {/* =========================================
          MODAL: NUEVA CONSULTA 
          ========================================= */}
      {isModalConsultaOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-white dark:bg-[#111111] w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 flex flex-col max-h-[90vh]">
            
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-white/5">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Stethoscope className="text-emerald-500" /> Nueva Consulta Médica
                </h2>
                {pacienteSeleccionado && (
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Para: <strong>{pacienteSeleccionado.nombres} {pacienteSeleccionado.apellidos}</strong></p>
                )}
              </div>
              <button onClick={() => setIsModalConsultaOpen(false)} className="p-2 text-slate-400 hover:text-rose-500 bg-slate-100 hover:bg-rose-50 dark:bg-white/5 dark:hover:bg-rose-500/10 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              <form id="formConsulta" onSubmit={handleGuardarConsulta} className="space-y-5">
                
                {/* Mostrar <select> solo si NO venimos desde un Expediente */}
                {!pacienteSeleccionado && (
                  <div>
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Seleccionar Paciente *</label>
                    <select required name="id_paciente" value={formData.id_paciente} onChange={handleChange} className="w-full mt-1.5 p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all">
                      <option value="">Buscar y seleccionar paciente...</option>
                      {pacientesLista.map(p => (
                        <option key={p.id} value={p.id}>{p.nombres} {p.apellidos} - C.I: {p.cedula}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Motivo de la Consulta *</label>
                  <input required name="motivo" value={formData.motivo} onChange={handleChange} type="text" placeholder="Ej: Dolor abdominal intenso..." className="w-full mt-1.5 p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
                </div>
                <div>
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Síntomas / Examen Físico</label>
                  <textarea name="sintomas" value={formData.sintomas} onChange={handleChange} rows="3" placeholder="Detalle clínico..." className="w-full mt-1.5 p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all resize-none"></textarea>
                </div>
                <div>
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Diagnóstico</label>
                  <textarea name="diagnostico" value={formData.diagnostico} onChange={handleChange} rows="2" placeholder="Diagnóstico presuntivo o definitivo..." className="w-full mt-1.5 p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all resize-none"></textarea>
                </div>
                <div>
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Tratamiento / Indicaciones</label>
                  <textarea name="tratamiento" value={formData.tratamiento} onChange={handleChange} rows="3" placeholder="Plan de acción..." className="w-full mt-1.5 p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all resize-none"></textarea>
                </div>
              </form>
            </div>

            <div className="p-6 border-t border-slate-200 dark:border-white/5 flex gap-3 justify-end bg-slate-50 dark:bg-[#0a0a0a] rounded-b-2xl">
              <button type="button" onClick={() => setIsModalConsultaOpen(false)} className="px-5 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">
                Cancelar
              </button>
              <button type="submit" form="formConsulta" disabled={guardando || (!pacienteSeleccionado && formData.id_paciente === '')} className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-md shadow-emerald-500/20 disabled:opacity-50">
                {guardando ? 'Guardando...' : 'Guardar Consulta'}
              </button>
            </div>

          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}