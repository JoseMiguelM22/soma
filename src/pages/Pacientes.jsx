import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { 
  Home, Users, FileText, Calendar, User, Settings, LogOut, 
  Menu, Sun, Moon, Plus, Search, MoreVertical, X, PanelLeft, 
  Filter, Edit3, ClipboardList, Check, ChevronDown, Phone, 
  FileDigit, CalendarDays, FlaskConical,
  Maximize, FileSignature, AlignLeft, Bold, Italic, Underline, Strikethrough, List, ListOrdered, Type, Download
} from 'lucide-react';
import { jsPDF } from "jspdf";

export default function Pacientes() {
  const navigate = useNavigate();
  
  // ================= ESTADOS DE UI =================
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isModalCrearOpen, setIsModalCrearOpen] = useState(false);
  
  // ================= ESTADOS DE NAVEGACIÓN DEL PERFIL =================
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null);
  const [activeTab, setActiveTab] = useState('datos'); 
  const [isEditingData, setIsEditingData] = useState(false); 
  const [historiaView, setHistoriaView] = useState('list'); 
  const [recipeView, setRecipeView] = useState('list'); 
  const [informeView, setInformeView] = useState('list'); 
  
  // Estados de texto para documentos PDF
  const [textoRecipe, setTextoRecipe] = useState('');
  const [textoIndicaciones, setTextoIndicaciones] = useState('');
  const [textoInforme, setTextoInforme] = useState('');

  // Estados de acordeones
  const [expandContacto, setExpandContacto] = useState(true);

  // ================= ESTADOS DE DATOS =================
  const [userData, setUserData] = useState(null);
  const [pacientes, setPacientes] = useState([]);
  const [loadingPacientes, setLoadingPacientes] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [guardando, setGuardando] = useState(false);
  
  // Formularios
  const [formData, setFormData] = useState({
    nombres: '', apellidos: '', cedula: '', telefono: '', 
    correo: '', sexo: '', fecha_nacimiento: '', estado_civil: 'No especificado'
  });

  const [editFormData, setEditFormData] = useState({
    id: '', nombres: '', apellidos: '', cedula: '', telefono: '', 
    correo: '', sexo: '', fecha_nacimiento: '', estado_civil: 'No especificado'
  });

  const [nuevaHistoria, setNuevaHistoria] = useState({
    fecha_consulta: new Date().toISOString().slice(0, 16), 
    proxima_consulta: '',
    consultorio: '',
    nota_clinica: 'Diagnostico:\n\n'
  });

  const listaConsultorios = [
    "A&J Medics", "CM Cristo Redentor", "CM San Francisco Centro", 
    "CM San Luis", "Cardin", "Centro Medico Sisal", "Centro Médico Amisalud"
  ];

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDarkMode]);

  const fetchData = async () => {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (!session || sessionError) {
      navigate('/login');
      return;
    }
    const { data: dbUser } = await supabase.from('usuarios').select('*').eq('id_auth', session.user.id).single();
    if (dbUser) setUserData(dbUser);

    const { data: dbPacientes, error: pacError } = await supabase
      .from('pacientes')
      .select('*')
      .eq('id_medico', session.user.id)
      .order('created_at', { ascending: false });

    if (dbPacientes && !pacError) setPacientes(dbPacientes);
    setLoadingPacientes(false);
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

  const handleInputChange = (e, isEdit = false) => {
    const { name, value } = e.target;
    if (name === 'nombres' || name === 'apellidos') {
      if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]*$/.test(value)) return; 
    }
    if (name === 'cedula' || name === 'telefono') {
      if (!/^[0-9]*$/.test(value)) return; 
    }
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
    } catch (error) {
      alert("Hubo un error al crear. Intenta de nuevo.");
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
      alert("Paciente actualizado con éxito");
    } catch (error) {
      alert("Hubo un error al actualizar. Intenta de nuevo.");
    } finally {
      setGuardando(false);
    }
  };

  const handleGuardarHistoria = async () => {
    setGuardando(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const { error } = await supabase.from('consultas').insert([{
        id_medico: session.user.id,
        id_paciente: pacienteSeleccionado.id,
        fecha_consulta: nuevaHistoria.fecha_consulta,
        proxima_consulta: nuevaHistoria.proxima_consulta || null,
        consultorio: nuevaHistoria.consultorio,
        nota_clinica: nuevaHistoria.nota_clinica,
        estado: 'Completada', 
        motivo: 'Evolutiva' 
      }]);

      if (error) throw error;
      alert("¡Historia guardada con éxito!");
      setHistoriaView('list');
    } catch (error) {
      alert("Error al guardar la historia. Verifica las columnas en Supabase.");
    } finally {
      setGuardando(false);
    }
  };

  const ejecutarGenerarPDF = (tipoDocumento) => {
    if (tipoDocumento === 'recipe' && textoRecipe.trim() === '' && textoIndicaciones.trim() === '') {
      return alert("Escribe al menos un medicamento o indicación antes de generar el PDF.");
    }
    if (tipoDocumento === 'informe' && textoInforme.trim() === '') {
      return alert("Escribe un contenido antes de generar el informe PDF.");
    }

    const doc = new jsPDF();

    doc.setFont("helvetica", "bold"); doc.setFontSize(22); doc.setTextColor(0, 130, 160);
    doc.text("SOMA Cloud", 105, 20, { align: "center" });

    doc.setFontSize(14); doc.setTextColor(50, 50, 50);
    doc.text(tipoDocumento === 'recipe' ? 'RÉCIPE E INDICACIONES' : 'CONSTANCIA MÉDICA', 105, 30, { align: "center" });

    doc.setLineWidth(0.5); doc.setDrawColor(200, 200, 200); doc.line(20, 35, 190, 35);
    doc.setFontSize(11); doc.setFont("helvetica", "normal");
    doc.text(`Médico: Dr(a). ${userData?.nombres || ''} ${userData?.apellidos || ''}`, 20, 45);
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 150, 45);
    
    doc.setFont("helvetica", "bold"); doc.text("Datos del Paciente", 20, 60);
    doc.setFont("helvetica", "normal");
    doc.text(`Nombre: ${pacienteSeleccionado?.nombres || ''} ${pacienteSeleccionado?.apellidos || ''}`, 20, 68);
    doc.text(`C.I: ${pacienteSeleccionado?.cedula || 'N/A'}`, 150, 68);
    doc.text(`Edad: ${calcularEdad(pacienteSeleccionado?.fecha_nacimiento)} años`, 20, 75);
    doc.text(`Sexo: ${pacienteSeleccionado?.sexo || 'N/A'}`, 150, 75);
    doc.line(20, 82, 190, 82);

    let currentY = 95;
    
    if (tipoDocumento === 'recipe') {
      const colWidth = 80; 
      const startXLeft = 20; 
      const startXRight = 110; 

      doc.setFont("helvetica", "bold"); 
      doc.text("Medicación:", startXLeft, currentY); 
      doc.text("Indicaciones al paciente:", startXRight, currentY); 
      currentY += 7;
      
      doc.setFont("helvetica", "normal");
      const arrRecipe = doc.splitTextToSize(textoRecipe, colWidth);
      const arrIndicaciones = doc.splitTextToSize(textoIndicaciones, colWidth);
      
      doc.text(arrRecipe, startXLeft, currentY);
      doc.text(arrIndicaciones, startXRight, currentY);
    } else {
      doc.text(doc.splitTextToSize(textoInforme, 170), 20, currentY);
    }

    doc.setFontSize(9); doc.setTextColor(150, 150, 150);
    doc.text("Generado automáticamente por SOMA Cloud", 105, 280, { align: "center" });
    
    doc.save(`${tipoDocumento === 'recipe' ? 'Recipe' : 'Constancia'}_${pacienteSeleccionado?.nombres || 'Paciente'}.pdf`);
    
    if (tipoDocumento === 'recipe') { setTextoRecipe(''); setTextoIndicaciones(''); setRecipeView('list'); }
    else { setTextoInforme(''); setInformeView('list'); }
  };

  const abrirPerfil = (paciente) => {
    setEditFormData({
      id: paciente.id, nombres: paciente.nombres, apellidos: paciente.apellidos,
      cedula: paciente.cedula, telefono: paciente.telefono || '', correo: paciente.correo || '',
      sexo: paciente.sexo, fecha_nacimiento: paciente.fecha_nacimiento, estado_civil: 'No especificado'
    });
    setPacienteSeleccionado(paciente);
    setActiveTab('datos');
    setIsEditingData(false);
    setHistoriaView('list');
    setRecipeView('list');
    setInformeView('list');
  };

  const iniciarNuevaHistoria = () => {
    setActiveTab('historias');
    setHistoriaView('create');
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

  const handleWhatsApp = (telefono) => {
    if (!telefono) return alert("Este paciente no tiene número registrado.");
    let num = telefono.replace(/\D/g, '');
    if (num.startsWith('0')) num = '58' + num.substring(1);
    else if (!num.startsWith('58') && num.length === 10) num = '58' + num;
    window.open(`https://wa.me/${num}`, '_blank');
  };

  const pacientesFiltrados = pacientes.filter(p => 
    p.nombres.toLowerCase().includes(busqueda.toLowerCase()) || 
    p.apellidos.toLowerCase().includes(busqueda.toLowerCase()) ||
    (p.cedula && p.cedula.includes(busqueda)) ||
    (p.telefono && p.telefono.includes(busqueda))
  );

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
              <Link to="/pacientes" className="flex items-center gap-3 py-2.5 bg-cyan-50 dark:bg-[#1e1e1e] text-cyan-700 dark:text-cyan-400 border border-transparent dark:border-white/5 rounded-lg font-bold transition-colors"><Users size={20} className="shrink-0" />{!isCollapsed && <span>Pacientes</span>}</Link>
              <Link to="/historias" className="flex items-center gap-3 py-2.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg font-medium transition-colors"><FileText size={20} className="shrink-0" />{!isCollapsed && <span>Historias Clínicas</span>}</Link>
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
          
          {/* ================= VISTA 1: LISTADO DE PACIENTES ================= */}
          {!pacienteSeleccionado ? (
            <div className="p-4 md:p-8 max-w-[1400px] mx-auto w-full animate-[fadeIn_0.3s_ease-out]">
              <div className="bg-white dark:bg-[#111111] rounded-[2rem] shadow-xl overflow-hidden border border-slate-200 dark:border-white/5">
                <div className="bg-[#0081a7] dark:bg-[#005f7a] px-8 py-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <h2 className="text-3xl font-black text-white mb-2 tracking-tight">Mis pacientes</h2>
                    <p className="text-cyan-100 text-sm font-medium">Gestiona y accede rápidamente a las historias clínicas de tu consulta.</p>
                  </div>
                  <button onClick={() => setIsModalCrearOpen(true)} className="bg-white text-[#0081a7] hover:bg-slate-50 px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2 transform hover:-translate-y-0.5">
                    <Plus size={18} /> Registrar Paciente
                  </button>
                </div>

                <div className="p-8">
                  <div className="mb-6">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 block">Pacientes</label>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Busca por nombre, cédula o teléfono.</p>
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                        <input type="text" placeholder="Buscar paciente..." className="w-full pl-11 pr-4 py-3 bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:text-white text-sm shadow-sm" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
                      </div>
                      <div className="flex gap-3 shrink-0">
                        <button className="flex items-center gap-2 px-5 py-3 border border-slate-200 dark:border-white/10 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors font-bold text-sm shadow-sm"><Filter size={16} /> Filtros</button>
                        <button className="bg-[#0081a7] hover:bg-[#006b8a] dark:bg-cyan-600 text-white px-8 py-3 rounded-xl font-bold shadow-md text-sm transition-colors">Buscar</button>
                      </div>
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
                            <th className="px-4 py-3 hidden sm:table-cell">Teléfono</th>
                            <th className="px-4 py-3 text-right">Acciones</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                          {pacientesFiltrados.map((paciente) => (
                            <tr key={paciente.id} className="hover:bg-slate-50 dark:hover:bg-[#1a1a1a] transition-colors group cursor-pointer" onClick={() => abrirPerfil(paciente)}>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-3">
                                  <div className="w-9 h-9 rounded-full bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center text-cyan-700 font-bold text-xs shrink-0">
                                    {paciente.nombres.charAt(0)}{paciente.apellidos.charAt(0)}
                                  </div>
                                  <p className="font-bold text-sm text-slate-900 dark:text-white">{paciente.nombres} {paciente.apellidos}</p>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{paciente.cedula || '-'}</td>
                              <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300 hidden sm:table-cell">{calcularEdad(paciente.fecha_nacimiento)}</td>
                              <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300 hidden md:table-cell">{paciente.sexo || '-'}</td>
                              <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300 hidden sm:table-cell">{paciente.telefono || '-'}</td>
                              <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                                <div className="flex items-center justify-end gap-2">
                                  <button onClick={() => { abrirPerfil(paciente); setActiveTab('historias'); }} className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 rounded-md text-xs font-bold hover:bg-cyan-100 transition-colors"><User size={14} /> Historias</button>
                                  <button onClick={() => { abrirPerfil(paciente); setIsEditingData(true); }} className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 text-slate-600 dark:text-slate-300 rounded-md text-xs font-bold hover:bg-slate-50 transition-colors"><Edit3 size={14} /> Editar</button>
                                </div>
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
          ) : (
            /* ========================================================
               VISTA 2: PERFIL DEL PACIENTE COMPLETO
               ======================================================== */
            <div className="w-full animate-[fadeIn_0.3s_ease-out]">
              
              <div className="bg-[#0081a7] dark:bg-[#005f7a] text-white pt-8 px-4 md:px-10 shrink-0 shadow-md">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-start justify-between gap-6 pb-6">
                  <div className="flex items-center gap-5">
                    <div className="w-20 h-20 bg-white/20 rounded-full border-4 border-white/10 flex items-center justify-center shrink-0 shadow-inner">
                      <User size={40} className="text-white opacity-80" />
                    </div>
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
                    <button onClick={() => handleWhatsApp(pacienteSeleccionado.telefono)} className="bg-[#25D366] hover:bg-[#1ebd53] text-white px-4 py-2 rounded-xl text-sm font-bold shadow flex items-center gap-2 transition-all">
                       WhatsApp
                    </button>
                    <button onClick={() => {setActiveTab('historias'); setHistoriaView('create');}} className="bg-white text-[#0081a7] hover:bg-slate-50 px-4 py-2 rounded-xl text-sm font-bold shadow flex items-center gap-2 transition-all">
                      <Plus size={16} /> Nueva consulta
                    </button>
                  </div>
                </div>

                <div className="max-w-6xl mx-auto flex gap-6 text-sm font-bold border-t border-cyan-700/50 overflow-x-auto hide-scroll pt-1 relative">
                  <button onClick={() => setActiveTab('datos')} className={`border-b-[3px] py-3.5 whitespace-nowrap transition-colors ${activeTab === 'datos' ? 'border-white text-white' : 'border-transparent text-cyan-200 hover:text-white'}`}>Datos Paciente</button>
                  <button onClick={() => {setActiveTab('historias'); setHistoriaView('list');}} className={`border-b-[3px] py-3.5 whitespace-nowrap transition-colors ${activeTab === 'historias' ? 'border-white text-white' : 'border-transparent text-cyan-200 hover:text-white'}`}>Historias Clínicas</button>
                  <button onClick={() => {setActiveTab('recipes'); setRecipeView('list');}} className={`border-b-[3px] py-3.5 whitespace-nowrap transition-colors ${activeTab === 'recipes' ? 'border-white text-white' : 'border-transparent text-cyan-200 hover:text-white'}`}>Récipes e Indicaciones</button>
                  <button onClick={() => {setActiveTab('informes'); setInformeView('list');}} className={`border-b-[3px] py-3.5 whitespace-nowrap transition-colors ${activeTab === 'informes' ? 'border-white text-white' : 'border-transparent text-cyan-200 hover:text-white'}`}>Informes (Constancias)</button>
                </div>
              </div>

              <div className="p-4 md:p-8 max-w-6xl mx-auto">
                <button onClick={() => setPacienteSeleccionado(null)} className="flex items-center gap-1.5 text-slate-500 hover:text-[#0081a7] font-bold text-sm mb-6 transition-colors"><X size={16} /> Volver al listado</button>

                {/* ================= TABS CONTENT ================= */}
                
                {/* 1. DATOS TAB */}
                {activeTab === 'datos' && (
                  <>
                    {!isEditingData ? (
                      <div className="animate-[fadeIn_0.2s_ease-out] space-y-6">
                        <div className="bg-white dark:bg-[#111111] rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
                          <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-white/5">
                            <h4 className="flex items-center gap-2 font-bold text-slate-900 dark:text-white"><User size={18} className="text-slate-400" /> Detalles del Paciente</h4>
                            <button onClick={() => setIsEditingData(true)} className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 dark:border-white/10 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-colors"><Edit3 size={14} /> Editar datos</button>
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
                            <button type="button" onClick={() => setIsEditingData(false)} className="px-4 py-2 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-[#111111] hover:bg-slate-50">Cancelar</button>
                            <button type="submit" disabled={guardando} className="px-6 py-2 bg-[#0081a7] text-white rounded-xl text-xs font-bold shadow-md disabled:opacity-50">{guardando ? 'Guardando...' : 'Guardar Cambios'}</button>
                          </div>
                        </div>

                        <div className="bg-white dark:bg-[#111111] rounded-2xl p-6 border border-slate-200 dark:border-white/5 shadow-sm">
                          <div className="flex items-center gap-4 mb-6 pb-4 border-b border-slate-100 dark:border-white/5">
                            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/20 text-purple-600 flex items-center justify-center shrink-0"><User size={20} /></div>
                            <div><h4 className="font-bold text-slate-900 dark:text-white text-sm">Datos Personales</h4><p className="text-xs text-slate-500">Identificación, nombre, fecha y sexo</p></div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            <div><label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Cédula</label><input type="text" name="cedula" value={editFormData.cedula} onChange={(e) => handleInputChange(e, true)} maxLength="12" className="w-full px-3 py-2.5 bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-lg text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-cyan-500" /></div>
                            <div><label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Nombres</label><input type="text" name="nombres" value={editFormData.nombres} onChange={(e) => handleInputChange(e, true)} required className="w-full px-3 py-2.5 bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-lg text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-cyan-500" /></div>
                            <div><label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Apellidos</label><input type="text" name="apellidos" value={editFormData.apellidos} onChange={(e) => handleInputChange(e, true)} required className="w-full px-3 py-2.5 bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-lg text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-cyan-500" /></div>
                            <div><label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Fecha nacimiento</label><input type="date" name="fecha_nacimiento" value={editFormData.fecha_nacimiento} onChange={(e) => handleInputChange(e, true)} required className="w-full px-3 py-2.5 bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-lg text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-cyan-500 [&::-webkit-calendar-picker-indicator]:dark:invert" /></div>
                            <div><label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Sexo</label><select name="sexo" value={editFormData.sexo} onChange={(e) => handleInputChange(e, true)} required className="w-full px-3 py-2.5 bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-lg text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-cyan-500"><option value="Masculino">Masculino</option><option value="Femenino">Femenino</option><option value="Otro">Otro</option></select></div>
                            <div><label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Estado civil</label><select name="estado_civil" value={editFormData.estado_civil} onChange={(e) => handleInputChange(e, true)} className="w-full px-3 py-2.5 bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-lg text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-cyan-500"><option value="No especificado">Ninguno</option><option value="Soltero/a">Soltero/a</option><option value="Casado/a">Casado/a</option></select></div>
                          </div>
                        </div>

                        <div className="bg-white dark:bg-[#111111] rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm overflow-hidden">
                          <div className="flex items-center gap-4 p-6 border-b border-slate-100 dark:border-white/5">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 flex items-center justify-center shrink-0"><Phone size={20} /></div>
                            <div><h4 className="font-bold text-slate-900 dark:text-white text-sm">Contacto</h4><p className="text-xs text-slate-500">Teléfono y correo electrónico</p></div>
                          </div>
                          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div><label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Teléfono principal</label><input type="text" name="telefono" value={editFormData.telefono} onChange={(e) => handleInputChange(e, true)} maxLength="12" className="w-full px-3 py-2.5 bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-lg text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-cyan-500" /></div>
                            <div><label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Correo electrónico</label><input type="email" name="correo" value={editFormData.correo} onChange={(e) => handleInputChange(e, true)} className="w-full px-3 py-2.5 bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-lg text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-cyan-500" /></div>
                          </div>
                        </div>
                      </form>
                    )}
                  </>
                )}

                {/* 2. HISTORIAS CLÍNICAS TAB */}
                {activeTab === 'historias' && (
                  <div className="animate-[fadeIn_0.2s_ease-out]">
                    {historiaView === 'list' ? (
                      <div className="border-2 border-dashed border-slate-200 dark:border-white/10 rounded-3xl max-w-lg mx-auto p-12 text-center bg-white/50 dark:bg-[#111111]/50 backdrop-blur-sm mt-10">
                        <div className="w-16 h-16 bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-6"><FileText size={32} /></div>
                        <h4 className="text-xl font-black text-slate-900 dark:text-white mb-2">Sin historias aún</h4>
                        <p className="text-sm text-slate-500 mb-8 max-w-sm mx-auto">Comienza a registrar la evolución médica de este paciente.</p>
                        <button onClick={() => setHistoriaView('create')} className="bg-[#0081a7] text-white px-5 py-2.5 rounded-xl text-sm font-bold mx-auto flex items-center gap-2"><Plus size={16} /> Crear la primera</button>
                      </div>
                    ) : (
                      <div className="bg-white dark:bg-[#111111] rounded-2xl border border-slate-200 dark:border-white/5 overflow-hidden p-6 shadow-sm">
                        <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-white/5 mb-6">
                          <h3 className="font-bold text-lg text-slate-900 dark:text-white">Nueva Historia Evolutiva</h3>
                          <div className="flex gap-2">
                            <button onClick={() => setHistoriaView('list')} className="px-4 py-2 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300">Cancelar</button>
                            <button onClick={handleGuardarHistoria} className="px-5 py-2 bg-[#0081a7] text-white rounded-xl text-xs font-bold">Guardar Consulta</button>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 text-xs">
                          <div><label className="font-bold text-slate-700 dark:text-slate-300">Fecha Consulta</label><input type="datetime-local" value={nuevaHistoria.fecha_consulta} onChange={(e) => setNuevaHistoria({...nuevaHistoria, fecha_consulta: e.target.value})} className="w-full p-2.5 mt-1.5 bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-cyan-500 [&::-webkit-calendar-picker-indicator]:dark:invert" /></div>
                          <div><label className="font-bold text-slate-700 dark:text-slate-300">Próxima Consulta</label><input type="datetime-local" value={nuevaHistoria.proxima_consulta} onChange={(e) => setNuevaHistoria({...nuevaHistoria, proxima_consulta: e.target.value})} className="w-full p-2.5 mt-1.5 bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-cyan-500 [&::-webkit-calendar-picker-indicator]:dark:invert" /></div>
                          <div><label className="font-bold text-slate-700 dark:text-slate-300">Consultorio</label><select value={nuevaHistoria.consultorio} onChange={(e) => setNuevaHistoria({...nuevaHistoria, consultorio: e.target.value})} className="w-full p-2.5 mt-1.5 bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-cyan-500"><option value="">Seleccione...</option>{listaConsultorios.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                        </div>
                        <textarea value={nuevaHistoria.nota_clinica} onChange={(e) => setNuevaHistoria({...nuevaHistoria, nota_clinica: e.target.value})} className="w-full min-h-[300px] p-4 text-sm bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl outline-none text-slate-900 dark:text-white" placeholder="Escribe el examen físico y diagnóstico..." />
                      </div>
                    )}
                  </div>
                )}

                {/* 3. RÉCIPES E INDICACIONES TAB */}
                {activeTab === 'recipes' && (
                  <div className="animate-[fadeIn_0.2s_ease-out]">
                    {recipeView === 'list' ? (
                      <div className="border-2 border-dashed border-slate-200 dark:border-white/10 rounded-3xl max-w-lg mx-auto mt-12 flex flex-col items-center justify-center p-12 text-center bg-white/50 dark:bg-[#111111]/50 backdrop-blur-sm">
                        <div className="w-16 h-16 bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400 rounded-2xl flex items-center justify-center mb-6"><FlaskConical size={32} /></div>
                        <h4 className="text-xl font-black text-slate-900 dark:text-white mb-2">Sin récipes aún</h4>
                        <p className="text-sm text-slate-500 mb-8 max-w-sm">Crea récipes médicos e indicaciones en PDF directamente para tu paciente.</p>
                        <button onClick={() => setRecipeView('create')} className="flex items-center gap-2 bg-[#0081a7] hover:bg-[#006b8a] text-white px-6 py-2.5 rounded-xl font-bold shadow-md transition-colors text-sm"><Plus size={16} /> Nuevo récipe</button>
                      </div>
                    ) : (
                      <div className="bg-white dark:bg-[#111111] rounded-[1.5rem] shadow-sm border border-slate-200 dark:border-white/5 overflow-hidden animate-[fadeIn_0.2s_ease-out]">
                        <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-white/5 mb-6">
                          <h3 className="font-bold text-xl text-slate-900 dark:text-white">Nuevo récipe</h3>
                          <div className="flex items-center gap-3">
                            <button onClick={() => setRecipeView('list')} className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#1a1a1a] transition-colors"><X size={14} /> Cerrar</button>
                            <button onClick={() => ejecutarGenerarPDF('recipe')} className="flex items-center gap-1.5 px-5 py-2 bg-[#0081a7] hover:bg-[#006b8a] text-white rounded-xl text-xs font-bold shadow-md transition-colors"><Download size={14}/> Descargar PDF</button>
                          </div>
                        </div>
                        
                        <div className="px-6 md:px-8 pb-8">
                          <div className="border border-cyan-200 dark:border-cyan-900/50 bg-white dark:bg-[#111111] rounded-xl p-4 mb-8 text-center text-sm font-medium text-cyan-700 dark:text-cyan-400 shadow-sm">
                            Escribe @ seguido del nombre de un medicamento para buscarlo en el vademécum y autocompletar el texto.
                          </div>

                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden flex flex-col bg-white dark:bg-[#1a1a1a] shadow-sm">
                              <div className="p-5 border-b border-slate-100 dark:border-white/5">
                                <h4 className="font-bold text-slate-900 dark:text-white text-[15px]">Récipe / medicación</h4>
                                <p className="text-xs text-slate-500 mt-0.5">Medicamentos, dosis y vía de administración.</p>
                              </div>
                              <textarea rows="12" placeholder="Ej. @metformina para buscar en la base de datos..." value={textoRecipe} onChange={(e) => setTextoRecipe(e.target.value)} className="w-full p-5 text-sm bg-transparent outline-none resize-none text-slate-900 dark:text-white custom-scrollbar leading-relaxed" />
                            </div>

                            <div className="border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden flex flex-col bg-white dark:bg-[#1a1a1a] shadow-sm">
                              <div className="p-5 border-b border-slate-100 dark:border-white/5">
                                <h4 className="font-bold text-slate-900 dark:text-white text-[15px]">Indicaciones al paciente</h4>
                                <p className="text-xs text-slate-500 mt-0.5">Posología, duración, advertencias y cuidados.</p>
                              </div>
                              <textarea rows="12" placeholder="Instrucciones claras para el paciente. También puedes usar @medicamento..." value={textoIndicaciones} onChange={(e) => setTextoIndicaciones(e.target.value)} className="w-full p-5 text-sm bg-transparent outline-none resize-none text-slate-900 dark:text-white custom-scrollbar leading-relaxed" />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 4. INFORMES TAB */}
                {activeTab === 'informes' && (
                  <div className="animate-[fadeIn_0.2s_ease-out]">
                    {informeView === 'list' ? (
                      <div className="border-2 border-dashed border-slate-200 dark:border-white/10 rounded-3xl max-w-lg mx-auto mt-12 flex flex-col items-center justify-center p-12 text-center bg-white/50 dark:bg-[#111111]/50 backdrop-blur-sm">
                        <div className="w-16 h-16 bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400 rounded-2xl flex items-center justify-center mb-6"><FileText size={32} /></div>
                        <h4 className="text-xl font-black text-slate-900 dark:text-white mb-2">Sin constancias emitidas</h4>
                        <p className="text-sm text-slate-500 mb-8 max-w-sm">Emite constancias de asistencia, reposos o informes médicos.</p>
                        <button onClick={() => setInformeView('create')} className="flex items-center gap-2 bg-[#0081a7] text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-md"><Plus size={16} /> Redactar Constancia</button>
                      </div>
                    ) : (
                      <div className="bg-white dark:bg-[#111111] border border-slate-200 dark:border-white/5 rounded-2xl p-6 md:p-8 shadow-sm">
                        <div className="flex justify-between items-center pb-6 border-b border-slate-100 dark:border-white/5 mb-6">
                          <div>
                            <h3 className="font-bold text-xl text-slate-900 dark:text-white">Redactar Constancia / Informe Médico</h3>
                            <p className="text-xs text-slate-500 mt-1">Este documento se exportará en PDF con tu membrete.</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <button onClick={() => setInformeView('list')} className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#1a1a1a] transition-colors"><X size={14} /> Cancelar</button>
                            <button onClick={() => ejecutarGenerarPDF('informe')} className="flex items-center gap-1.5 px-5 py-2 bg-[#0081a7] text-white rounded-xl text-xs font-bold shadow-md transition-colors"><Download size={14}/> Descargar PDF</button>
                          </div>
                        </div>
                        <div className="border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden bg-slate-50/50 dark:bg-[#161616]">
                           <textarea rows="15" placeholder="Por medio de la presente se hace constar que el paciente asistió a consulta médica..." value={textoInforme} onChange={(e) => setTextoInforme(e.target.value)} className="w-full p-6 text-sm bg-transparent outline-none resize-none text-slate-900 dark:text-white custom-scrollbar leading-relaxed" />
                        </div>
                      </div>
                    )}
                  </div>
                )}

              </div>
            </div>
          )}

        </div>
      </main>

      {/* ================= MODAL CREAR PACIENTE NUEVO ================= */}
      {isModalCrearOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-white dark:bg-[#111111] w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-white/5">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Registrar Nuevo Paciente</h2>
              <button onClick={() => setIsModalCrearOpen(false)} className="p-2 text-slate-400 hover:text-rose-500 bg-slate-100 dark:bg-white/5 rounded-full transition-colors"><X size={20} /></button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar bg-slate-50/50 dark:bg-[#0a0a0a]/50">
              <form id="formPacienteN" onSubmit={handleGuardarPaciente} className="space-y-6">
                
                {/* Bloque 1: Datos Personales */}
                <div className="bg-white dark:bg-[#111111] rounded-2xl p-6 border border-slate-200 dark:border-white/5 shadow-sm">
                  <div className="flex items-center gap-4 mb-6 pb-4 border-b border-slate-100 dark:border-white/5">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/20 text-purple-600 flex items-center justify-center shrink-0">
                      <User size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">Datos Personales</h4>
                      <p className="text-xs text-slate-500">Identificación, nombre, fecha y sexo</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Cédula</label>
                      <input type="text" name="cedula" value={formData.cedula} onChange={(e) => handleInputChange(e, false)} maxLength="12" className="w-full px-3 py-2.5 bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-lg text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-cyan-500" placeholder="Ej: 12345678" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Nombres *</label>
                      <input type="text" name="nombres" value={formData.nombres} onChange={(e) => handleInputChange(e, false)} required className="w-full px-3 py-2.5 bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-lg text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-cyan-500" placeholder="Ej: Juan" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Apellidos *</label>
                      <input type="text" name="apellidos" value={formData.apellidos} onChange={(e) => handleInputChange(e, false)} required className="w-full px-3 py-2.5 bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-lg text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-cyan-500" placeholder="Ej: Pérez" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Fecha de nacimiento *</label>
                      <input type="date" name="fecha_nacimiento" value={formData.fecha_nacimiento} onChange={(e) => handleInputChange(e, false)} required className="w-full px-3 py-2.5 bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-lg text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-cyan-500 [&::-webkit-calendar-picker-indicator]:dark:invert" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Sexo *</label>
                      <select name="sexo" value={formData.sexo} onChange={(e) => handleInputChange(e, false)} required className="w-full px-3 py-2.5 bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-lg text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-cyan-500">
                        <option value="">Seleccione...</option>
                        <option value="Masculino">Masculino</option>
                        <option value="Femenino">Femenino</option>
                        <option value="Otro">Otro</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Estado civil</label>
                      <select name="estado_civil" value={formData.estado_civil} onChange={(e) => handleInputChange(e, false)} className="w-full px-3 py-2.5 bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-lg text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-cyan-500">
                        <option value="No especificado">Ninguno</option>
                        <option value="Soltero/a">Soltero/a</option>
                        <option value="Casado/a">Casado/a</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Bloque 2: Contacto */}
                <div className="bg-white dark:bg-[#111111] rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm overflow-hidden">
                  <div className="flex items-center gap-4 p-6 border-b border-slate-100 dark:border-white/5">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 flex items-center justify-center shrink-0">
                      <Phone size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">Contacto</h4>
                      <p className="text-xs text-slate-500">Teléfono y correo electrónico</p>
                    </div>
                  </div>
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Teléfono principal</label>
                      <input type="text" name="telefono" value={formData.telefono} onChange={(e) => handleInputChange(e, false)} maxLength="12" className="w-full px-3 py-2.5 bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-lg text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-cyan-500" placeholder="Ej: 4121234567" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Correo electrónico</label>
                      <input type="email" name="correo" value={formData.correo} onChange={(e) => handleInputChange(e, false)} className="w-full px-3 py-2.5 bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-lg text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-cyan-500" placeholder="correo@ejemplo.com" />
                    </div>
                  </div>
                </div>

              </form>
            </div>
            
            <div className="p-6 border-t border-slate-200 dark:border-white/5 flex gap-3 justify-end bg-white dark:bg-[#111111] rounded-b-2xl">
              <button type="button" onClick={() => setIsModalCrearOpen(false)} className="px-5 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">Cancelar</button>
              <button type="submit" form="formPacienteN" disabled={guardando} className="bg-[#0081a7] hover:bg-[#006b8a] text-white px-6 py-2.5 rounded-xl font-bold shadow-md disabled:opacity-50">
                {guardando ? 'Guardando...' : 'Guardar Paciente'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #3f3f46; border-radius: 10px; }
        .hide-scroll::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}