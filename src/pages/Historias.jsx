import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { 
  Home, Users, FileText, Calendar, User, LogOut, 
  Menu, Sun, Moon, Plus, Search, X, PanelLeft, ClipboardList, 
  Check, Maximize, Filter, ArrowLeft, Edit3, Eye, Send, Download, FlaskConical
} from 'lucide-react';
import { jsPDF } from "jspdf";

import Parte1 from './Parte1';
import Parte2 from './Parte2';
import Parte3 from './Parte3';

export default function Historias() {
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
  const [isModoFoco, setIsModoFoco] = useState(false);
  const [isRemitirModalOpen, setIsRemitirModalOpen] = useState(false);
  
  const [isModalConsultaOpen, setIsModalConsultaOpen] = useState(false); 
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null); 
  
  const [userData, setUserData] = useState(null);
  const [consultas, setConsultas] = useState([]);
  const [historiasAgrupadas, setHistoriasAgrupadas] = useState([]);
  const [listaEspecialistas, setListaEspecialistas] = useState([]);
  const [especialistaSelect, setEspecialistaSelect] = useState("");
  
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [guardando, setGuardando] = useState(false);

  // === ESTADOS PARA PDF MÉDICOS ===
  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false);
  const [isConstanciaModalOpen, setIsConstanciaModalOpen] = useState(false);
  const [textoRecipe, setTextoRecipe] = useState('');
  const [textoIndicaciones, setTextoIndicaciones] = useState('');
  const [textoInforme, setTextoInforme] = useState('');
  
  const [historiaData, setHistoriaData] = useState({
    id: null, id_paciente: '', fecha_consulta: new Date().toISOString().slice(0, 16), proxima_consulta: '', consultorio: ''
  });

  const initialFormIVSS = {
    centro_asistencial: '', historia_n: '', servicio: '', piso: '', ala: '', sala_cuarto: '', cama: '',
    apellidos_nombres: '', cedula: '', sexo: '', edad: '', edo_civil: '', lugar_nacimiento: '', fecha_nacimiento: '', nacionalidad: '', ocupacion: '', direccion_habitacion: '',
    emergencia_nombre: '', emergencia_parentesco: '', emergencia_direccion: '', fecha_ingreso: new Date().toISOString().split('T')[0], hora_ingreso: '', fecha_admision_anterior: '',
    motivo_ingreso: '', enfermedad_actual: '', diagnostico_provisional: '', diagnostico_clinico_final: '', diagnostico_anatomo: '',
    temperatura: '', pulso: '', respiracion: '', ta_mx: '', ta_mn: '', peso: '', talla: '',
    desc_parte2_1: '', desc_parte2_2: '', desc_parte3_1: '', desc_parte3_2: '',
    fecha_autorizacion1: '', firma_autorizacion1: '', testigo_autorizacion1: '', parentesco_autorizacion1: '',
    fecha_autorizacion2: '', firma_autorizacion2: '', testigo_autorizacion2: '', parentesco_autorizacion2: '',
    fecha_examen: '', examen_practicado_por: '', diagnostico_servicio: ''
  };

  const [formIVSS, setFormIVSS] = useState(initialFormIVSS);
  const [marcas, setMarcas] = useState({});

  useEffect(() => { document.documentElement.classList.toggle('dark', isDarkMode); }, [isDarkMode]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return navigate('/login');

      const { data: dbUser } = await supabase.from('usuarios').select('*').eq('id_auth', session.user.id).single();
      if (dbUser) setUserData(dbUser);

      let queryConsultas = supabase.from('consultas').select('*, pacientes(*)').order('created_at', { ascending: false });
      if (dbUser?.rol === 'especialista') queryConsultas = queryConsultas.eq('id_medico', session.user.id);

      const { data: dbConsultas } = await queryConsultas;

      if (dbConsultas) {
        const validas = dbConsultas.filter(c => c.pacientes != null);
        setConsultas(validas);

        const mapaAgrupado = new Map();
        validas.forEach(c => {
          const pac = Array.isArray(c.pacientes) ? c.pacientes[0] : c.pacientes;
          if (!mapaAgrupado.has(pac.id)) mapaAgrupado.set(pac.id, { paciente: pac, ultima_consulta: c, total_visitas: 1 });
          else mapaAgrupado.get(pac.id).total_visitas += 1;
        });
        setHistoriasAgrupadas(Array.from(mapaAgrupado.values()));
      }

      const { data: todosLosUsuarios } = await supabase.from('usuarios').select('*');
      if (todosLosUsuarios) {
        setListaEspecialistas(todosLosUsuarios.filter(user => ['especialista', 'medico', 'médico'].includes((user.rol || '').toLowerCase())));
      }
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [navigate]);

  const handleLogout = async () => { await supabase.auth.signOut(); navigate('/login'); };
  const getInitials = () => { if (!userData) return "AD"; return `${userData.nombres.charAt(0)}${userData.apellidos.charAt(0)}`.toUpperCase(); };
  
  const esEspecialista = userData && ['especialista', 'medico', 'médico'].includes((userData.rol || '').toLowerCase());

  const formatearFechaTexto = (fechaCompleta) => {
    if (!fechaCompleta) return '';
    const fecha = new Date(fechaCompleta);
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return `${String(fecha.getDate()).padStart(2, '0')} de ${meses[fecha.getMonth()]} de ${fecha.getFullYear()} a las ${String(fecha.getHours()).padStart(2, '0')}:${String(fecha.getMinutes()).padStart(2, '0')}`;
  };

  const handleIVSSChange = (e) => setFormIVSS(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const toggleMarca = (id) => setMarcas(prev => ({ ...prev, [id]: !prev[id] ? 'X' : (prev[id] === 'X' ? '√' : '') }));

  const verHistorialPaciente = (paciente) => { setPacienteSeleccionado(paciente); setIsModalConsultaOpen(false); };

  const abrirEditorHistoria = (consulta = null, idPacienteForzado = null) => {
    if (consulta) {
      setHistoriaData({ id: consulta.id, id_paciente: consulta.id_paciente, fecha_consulta: consulta.fecha_consulta ? consulta.fecha_consulta.slice(0, 16) : consulta.created_at.slice(0, 16), proxima_consulta: consulta.proxima_consulta || '', consultorio: consulta.consultorio || '' });
      if (consulta.datos_formulario) {
        const parsed = typeof consulta.datos_formulario === 'string' ? JSON.parse(consulta.datos_formulario) : consulta.datos_formulario;
        setFormIVSS(parsed.formIVSS || initialFormIVSS); setMarcas(parsed.marcas || {});
      } else { setFormIVSS(initialFormIVSS); setMarcas({}); }
    } else {
      setHistoriaData({ id: null, id_paciente: idPacienteForzado || (pacienteSeleccionado ? pacienteSeleccionado.id : ''), fecha_consulta: new Date().toISOString().slice(0, 16), proxima_consulta: '', consultorio: '' });
      setFormIVSS(initialFormIVSS); setMarcas({});
    }
    setIsModalConsultaOpen(true);
  };

  const generarHTMLOculto = () => {
    let hallazgos = Object.keys(marcas).filter(k => marcas[k] === 'X').join(', ');
    return `<div style="font-family: Arial;"><h3>Historia Clínica Forma 15-108</h3><p><b>Paciente:</b> ${formIVSS.apellidos_nombres}</p><p><b>Motivo:</b> ${formIVSS.motivo_ingreso}</p><p><b>Enfermedad Actual:</b> ${formIVSS.enfermedad_actual}</p><p><b>Hallazgos:</b> ${hallazgos || 'Ninguno'}</p></div>`;
  };

  const handleGuardarHistoria = async (e) => {
    e.preventDefault(); setGuardando(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const payload = {
        id_medico: session.user.id, id_paciente: historiaData.id_paciente,
        fecha_consulta: new Date(historiaData.fecha_consulta).toISOString(),
        proxima_consulta: historiaData.proxima_consulta ? new Date(historiaData.proxima_consulta).toISOString() : null,
        consultorio: historiaData.consultorio, nota_clinica: generarHTMLOculto(), 
        datos_formulario: { formIVSS, marcas }, estado: 'Completada', motivo: formIVSS.motivo_ingreso || 'Evolutiva' 
      };

      let error;
      if (historiaData.id) { const res = await supabase.from('consultas').update(payload).eq('id', historiaData.id); error = res.error; } 
      else { const res = await supabase.from('consultas').insert([payload]); error = res.error; }

      if (error) throw error;
      await fetchData(); setIsModalConsultaOpen(false); alert("¡Formato guardado exitosamente!");
    } catch (error) { alert("Error al guardar: " + error.message); } finally { setGuardando(false); }
  };

  const handleConfirmarRemision = async () => {
    setGuardando(true);
    try {
      const { error } = await supabase.from('consultas').update({ id_medico: especialistaSelect, estado: 'En Espera' }).eq('id', historiaData.id);
      if (error) throw error;
      alert("¡Historia remitida correctamente!"); setIsRemitirModalOpen(false); setEspecialistaSelect(""); fetchData(); 
    } catch (error) { alert("Error al remitir."); } finally { setGuardando(false); }
  };

  const handleImprimirPDF = () => window.print();

  // ================= LÓGICA DE PDF (RÉCIPE / CONSTANCIA) CON LOGO AJUSTADO =================
  const generarPDF = (tipo) => {
    if (tipo === 'recipe' && !textoRecipe.trim() && !textoIndicaciones.trim()) return alert("Debes escribir algo en el récipe.");
    if (tipo === 'constancia' && !textoInforme.trim()) return alert("Debes escribir el contenido de la constancia.");

    const doc = new jsPDF();
    const img = new Image();
    img.src = '/soma_logo.png'; 

    img.onload = () => {
      // Coordenadas: X=20 (Izquierda), Y=15 (Arriba), Width=35, Height=10 (Tamaño de membrete profesional)
      doc.addImage(img, 'PNG', 20, 15, 35, 10);
      dibujarContenidoPDF(doc, tipo);
    };
    
    img.onerror = () => {
      doc.setFont("helvetica", "bold"); doc.setFontSize(18); doc.setTextColor(0, 129, 167);
      doc.text("SOMA", 20, 22);
      dibujarContenidoPDF(doc, tipo);
    };
  };

  const dibujarContenidoPDF = (doc, tipo) => {
    // Título Centrado
    doc.setFont("helvetica", "bold"); doc.setFontSize(16); doc.setTextColor(30, 30, 30);
    doc.text(tipo === 'recipe' ? 'RÉCIPE E INDICACIONES' : 'CONSTANCIA MÉDICA', 105, 30, { align: "center" });
    
    // Línea separadora
    doc.setLineWidth(0.5); doc.setDrawColor(200, 200, 200); doc.line(20, 38, 190, 38);
    
    // Datos del Médico
    doc.setFontSize(10); doc.setFont("helvetica", "normal"); doc.setTextColor(100, 100, 100);
    doc.text(`Médico: Dr(a). ${userData?.nombres || ''} ${userData?.apellidos || ''}`, 20, 48);
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 150, 48);
    
    // Datos del Paciente
    doc.setFont("helvetica", "bold"); doc.setTextColor(30, 30, 30); doc.text("Datos del Paciente", 20, 60);
    doc.setFont("helvetica", "normal"); doc.setTextColor(80, 80, 80);
    doc.text(`Nombre: ${pacienteSeleccionado?.nombres || ''} ${pacienteSeleccionado?.apellidos || ''}`, 20, 68);
    doc.text(`C.I: ${pacienteSeleccionado?.cedula || 'N/A'}`, 150, 68);
    doc.line(20, 75, 190, 75);

    let currentY = 85;
    
    // Contenido dinámico
    if (tipo === 'recipe') {
      const colWidth = 80; const startXLeft = 20; const startXRight = 110; 
      doc.setFont("helvetica", "bold"); doc.setTextColor(30, 30, 30);
      doc.text("Medicación:", startXLeft, currentY); 
      doc.text("Indicaciones al paciente:", startXRight, currentY); 
      currentY += 7;
      doc.setFont("helvetica", "normal"); doc.setTextColor(80, 80, 80);
      doc.text(doc.splitTextToSize(textoRecipe, colWidth), startXLeft, currentY);
      doc.text(doc.splitTextToSize(textoIndicaciones, colWidth), startXRight, currentY);
      doc.save(`Recipe_${pacienteSeleccionado?.nombres || 'Paciente'}.pdf`);
      setIsRecipeModalOpen(false); setTextoRecipe(''); setTextoIndicaciones('');
    } else {
      doc.setFont("helvetica", "normal"); doc.setTextColor(50, 50, 50);
      doc.text(doc.splitTextToSize(textoInforme, 170), 20, currentY);
      doc.save(`Constancia_${pacienteSeleccionado?.nombres || 'Paciente'}.pdf`);
      setIsConstanciaModalOpen(false); setTextoInforme('');
    }
  };

  const agrupadasFiltradas = historiasAgrupadas.filter(item => {
    const term = busqueda.toLowerCase();
    return item.paciente.nombres.toLowerCase().includes(term) || item.paciente.apellidos.toLowerCase().includes(term) || (item.paciente.cedula && item.paciente.cedula.includes(term));
  });

  const consultasDelPaciente = pacienteSeleccionado ? consultas.filter(c => c.id_paciente === pacienteSeleccionado.id) : [];

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-[#0B0D12] text-slate-800 dark:text-slate-200 font-sans overflow-hidden transition-colors duration-300 antialiased tracking-normal">
      {isSidebarOpen && <div className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm transition-opacity no-print" onClick={() => setIsSidebarOpen(false)} />}

      {/* ================= MODAL REMITIR ESPECIALISTA (SOLO ASISTENTE) ================= */}
      {isRemitirModalOpen && !esEspecialista && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 no-print">
          <div className="bg-white dark:bg-[#16161a] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-[fadeIn_0.2s_ease-out]">
            <div className="p-6 border-b border-slate-200 dark:border-white/5"><h3 className="text-lg font-bold">Remitir Historia a Especialista</h3><p className="text-sm text-slate-500 mt-1">Selecciona el médico evaluador.</p></div>
            <div className="p-6">
              <label className="block text-xs font-bold mb-2">Especialista disponible</label>
              <select value={especialistaSelect} onChange={(e) => setEspecialistaSelect(e.target.value)} className="w-full px-4 py-3 bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 rounded-xl outline-none"><option value="">Seleccione un médico...</option>{listaEspecialistas.map(med => (<option key={med.id_auth} value={med.id_auth}>Dr(a). {med.nombres} {med.apellidos}</option>))}</select>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-[#111111] border-t border-slate-200 dark:border-white/5 flex justify-end gap-3"><button onClick={() => setIsRemitirModalOpen(false)} className="px-4 py-2 font-bold">Cancelar</button><button onClick={handleConfirmarRemision} disabled={!especialistaSelect || guardando} className="px-5 py-2 bg-indigo-600 text-white rounded-xl font-bold">{guardando ? 'Remitiendo...' : 'Confirmar Remisión'}</button></div>
          </div>
        </div>
      )}

      {/* ================= MODAL REDACTAR RÉCIPE (SOLO ESPECIALISTA) ================= */}
      {isRecipeModalOpen && esEspecialista && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 no-print">
          <div className="bg-white dark:bg-[#16161a] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden animate-[fadeIn_0.2s_ease-out]">
            <div className="p-6 border-b border-slate-200 dark:border-white/5 flex justify-between items-center"><h3 className="text-lg font-bold flex items-center gap-2"><FlaskConical size={20}/> Emitir Récipe Médico</h3><button onClick={() => setIsRecipeModalOpen(false)} className="text-slate-400 hover:text-rose-500"><X size={20}/></button></div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 dark:bg-[#0a0a0a]">
              <div><label className="block text-sm font-bold mb-2">Medicación</label><textarea rows="10" placeholder="Ej. Acetaminofen 500mg..." value={textoRecipe} onChange={(e) => setTextoRecipe(e.target.value)} className="w-full p-4 bg-white dark:bg-[#111111] border border-slate-200 dark:border-white/10 rounded-xl outline-none custom-scrollbar" /></div>
              <div><label className="block text-sm font-bold mb-2">Indicaciones</label><textarea rows="10" placeholder="Ej. Tomar 1 tableta cada 8 horas..." value={textoIndicaciones} onChange={(e) => setTextoIndicaciones(e.target.value)} className="w-full p-4 bg-white dark:bg-[#111111] border border-slate-200 dark:border-white/10 rounded-xl outline-none custom-scrollbar" /></div>
            </div>
            <div className="p-5 border-t border-slate-200 dark:border-white/5 flex justify-end gap-3 bg-white dark:bg-[#111111]"><button onClick={() => setIsRecipeModalOpen(false)} className="px-5 py-2 font-bold">Cancelar</button><button onClick={() => generarPDF('recipe')} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center gap-2"><Download size={16}/> Generar PDF</button></div>
          </div>
        </div>
      )}

      {/* ================= MODAL REDACTAR CONSTANCIA (SOLO ESPECIALISTA) ================= */}
      {isConstanciaModalOpen && esEspecialista && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 no-print">
          <div className="bg-white dark:bg-[#16161a] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-[fadeIn_0.2s_ease-out]">
            <div className="p-6 border-b border-slate-200 dark:border-white/5 flex justify-between items-center"><h3 className="text-lg font-bold flex items-center gap-2"><FileText size={20}/> Emitir Constancia</h3><button onClick={() => setIsConstanciaModalOpen(false)} className="text-slate-400 hover:text-rose-500"><X size={20}/></button></div>
            <div className="p-6 bg-slate-50 dark:bg-[#0a0a0a]">
              <label className="block text-sm font-bold mb-2">Contenido del Informe / Constancia</label><textarea rows="12" placeholder="Por medio de la presente hago constar..." value={textoInforme} onChange={(e) => setTextoInforme(e.target.value)} className="w-full p-5 bg-white dark:bg-[#111111] border border-slate-200 dark:border-white/10 rounded-xl outline-none custom-scrollbar leading-relaxed" />
            </div>
            <div className="p-5 border-t border-slate-200 dark:border-white/5 flex justify-end gap-3 bg-white dark:bg-[#111111]"><button onClick={() => setIsConstanciaModalOpen(false)} className="px-5 py-2 font-bold">Cancelar</button><button onClick={() => generarPDF('constancia')} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center gap-2"><Download size={16}/> Generar PDF</button></div>
          </div>
        </div>
      )}

      <aside className={`no-print fixed inset-y-0 left-0 z-50 bg-white dark:bg-[#16161a] border-r border-slate-200/80 dark:border-white/[0.04] flex flex-col justify-between transform transition-all duration-300 ease-in-out md:relative md:translate-x-0 md:m-4 md:mr-0 md:rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none ${isSidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64'} ${isCollapsed ? 'md:w-24' : 'md:w-68'}`}>
        <div>
          <div className={`h-20 flex items-center transition-all ${isCollapsed ? 'justify-center' : 'justify-between px-6'}`}><Link to={esEspecialista ? "/dashboard" : "/admision"} className="flex items-center overflow-hidden whitespace-nowrap">{isCollapsed ? <span className="text-emerald-500 text-3xl mb-1 font-black">*</span> : <><img src="/soma_logo.png" alt="SOMA Logo" className="h-6 object-contain block dark:hidden" /><img src="/soma_logo_blanco.png" alt="SOMA Logo" className="h-6 object-contain hidden dark:block" /></>}</Link>{!isCollapsed && <button className="md:hidden text-slate-400 hover:text-rose-500 transition-colors" onClick={() => setIsSidebarOpen(false)}><X size={20} /></button>}</div>
          <div className={`py-4 ${isCollapsed ? 'px-3' : 'px-4'}`}>
            {!isCollapsed && <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-3 px-3 tracking-widest uppercase">Herramientas</p>}
            <nav className="space-y-1.5">
              <Link to={esEspecialista ? "/dashboard" : "/admision"} className={`flex items-center gap-3 py-3 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/[0.03] rounded-xl font-medium transition-all ${isCollapsed ? 'justify-center px-0' : 'px-4'}`}><Home size={20} className="shrink-0" />{!isCollapsed && <span className="whitespace-nowrap text-sm">Inicio</span>}</Link>
              {!esEspecialista && (<Link to="/pacientes" className={`flex items-center gap-3 py-3 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/[0.03] rounded-xl font-medium transition-all ${isCollapsed ? 'justify-center px-0' : 'px-4'}`}><Users size={20} className="shrink-0" />{!isCollapsed && <span className="whitespace-nowrap text-sm">Pacientes</span>}</Link>)}
              <Link to="/historias" className={`flex items-center gap-3 py-3 bg-emerald-500/10 dark:bg-white/10 text-emerald-600 dark:text-white rounded-xl font-bold transition-all ${isCollapsed ? 'justify-center px-0' : 'px-4'}`}><FileText size={20} className="shrink-0" />{!isCollapsed && <span className="whitespace-nowrap text-sm">Historias Clínicas</span>}</Link>
              <Link to="/agenda" className={`flex items-center gap-3 py-3 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/[0.03] rounded-xl font-medium transition-all ${isCollapsed ? 'justify-center px-0' : 'px-4'}`}><Calendar size={20} className="shrink-0" />{!isCollapsed && <span className="whitespace-nowrap text-sm">Agenda</span>}</Link>
            </nav>
          </div>
        </div>
        
        {/* ================= PERFIL DE USUARIO EN SIDEBAR ================= */}
        <div className={`p-4 border-t border-slate-100 dark:border-white/[0.04] flex flex-col ${isCollapsed ? 'items-center' : ''}`}>
          <div className={`flex items-center gap-3 mb-3 ${isCollapsed ? 'justify-center' : 'px-2'}`}>
            <div className="w-9 h-9 shrink-0 rounded-full bg-slate-200 dark:bg-white/90 text-slate-900 flex items-center justify-center text-xs font-bold border border-slate-300 dark:border-white/20">
              {getInitials()}
            </div>
            {!isCollapsed && (
              <div className="overflow-hidden">
                <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
                  {esEspecialista ? 'MÉDICO' : 'Dpto. Historias'}
                </p>
                <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight truncate">
                  {esEspecialista ? 'Dr(a).' : ''} {userData?.nombres || 'Usuario'} {userData?.apellidos || ''}
                </p>
              </div>
            )}
          </div>
          <button onClick={handleLogout} className={`flex items-center gap-3 py-2.5 w-full text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl font-medium transition-colors ${isCollapsed ? 'justify-center px-0' : 'px-3'}`}>
            <LogOut size={18} className="shrink-0" />
            {!isCollapsed && <span className="whitespace-nowrap text-sm">Cerrar Sesión</span>}
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden w-full relative bg-slate-100 dark:bg-[#050505] print-main">
        <header className="no-print h-16 flex items-center justify-between px-6 lg:px-8 border-b border-slate-200 dark:border-white/5 bg-white/50 dark:bg-[#111111]/80 backdrop-blur-sm sticky top-0 z-30 shrink-0"><div className="flex items-center gap-4"><button className="text-slate-500 md:hidden p-2" onClick={() => setIsSidebarOpen(true)}><Menu size={24} /></button><button className="hidden md:flex p-2 text-slate-400 hover:text-white rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10" onClick={() => setIsCollapsed(!isCollapsed)}><PanelLeft size={20} /></button></div><button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 text-slate-400 hover:text-yellow-400 bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10"><Sun size={20} className="hidden dark:block"/><Moon size={20} className="block dark:hidden"/></button></header>

        <div className="flex-1 overflow-y-auto w-full custom-scrollbar pb-10 print-scroll">
          
          {!isModalConsultaOpen && !pacienteSeleccionado && (
            <div className="no-print p-4 md:p-8 max-w-[1600px] mx-auto w-full animate-[fadeIn_0.3s_ease-out]">
              <div className="bg-white dark:bg-[#111111] rounded-[2rem] shadow-xl overflow-hidden border border-slate-200 dark:border-white/5">
                <div className="bg-[#0081a7] dark:bg-[#005f7a] px-8 py-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div><h2 className="text-3xl font-black text-white mb-2 tracking-tight">Historias clínicas</h2><p className="text-cyan-100 text-sm font-medium">Filtra por rango, busca por paciente y abre cada historia para verla.</p></div>
                  
                </div>
                <div className="p-8">
                  <div className="mb-6"><div className="flex justify-between items-end mb-4"><div><h3 className="text-lg font-bold">Pacientes con Historial</h3></div></div><div className="flex flex-col md:flex-row gap-4"><div className="relative flex-1"><Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} /><input type="text" placeholder="Buscar por nombre o cédula..." className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl outline-none" value={busqueda} onChange={(e) => setBusqueda(e.target.value)}/></div></div></div>
                  {loading ? ( <div className="flex justify-center h-48"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0081a7]"></div></div> ) : (
                    <div className="overflow-x-auto border-t border-slate-100 dark:border-white/5 pt-4">
                      <table className="w-full text-left whitespace-nowrap">
                        <thead><tr className="border-b border-slate-200 dark:border-white/10 text-slate-400 text-[11px] font-bold uppercase tracking-wider"><th className="px-4 py-3">PACIENTE</th><th className="px-4 py-3">CÉDULA</th><th className="px-4 py-3 text-right"></th></tr></thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                          {agrupadasFiltradas.map((agrup) => (
                            <tr key={agrup.paciente.id} className="hover:bg-slate-50 dark:hover:bg-[#1a1a1a] transition-colors cursor-pointer" onClick={() => verHistorialPaciente(agrup.paciente)}>
                              <td className="px-4 py-4"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center text-cyan-700 dark:text-cyan-400 font-bold text-xs shrink-0">{(agrup.paciente.nombres || 'P').charAt(0)}</div><p className="font-bold text-sm">{agrup.paciente.nombres} {agrup.paciente.apellidos}</p></div></td>
                              <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-300">{agrup.paciente.cedula || '—'}</td>
                              <td className="px-4 py-4 text-right"><button onClick={(e) => { e.stopPropagation(); verHistorialPaciente(agrup.paciente); }} className="flex items-center gap-1.5 px-3 py-1.5 border border-cyan-200 dark:border-cyan-900 text-cyan-700 dark:text-cyan-400 rounded-full text-xs font-bold hover:bg-cyan-50 dark:hover:bg-cyan-900/40 ml-auto"><Eye size={14} /> Abrir expediente</button></td>
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

          {!isModalConsultaOpen && pacienteSeleccionado && (
            <div className="no-print p-4 md:p-8 max-w-[1600px] mx-auto w-full animate-[fadeIn_0.3s_ease-out]">
              <button onClick={() => setPacienteSeleccionado(null)} className="flex items-center gap-1.5 text-slate-500 hover:text-[#0081a7] font-bold text-sm mb-4"><ArrowLeft size={16} /> Volver a todas las historias</button>
              <div className="bg-white dark:bg-[#111111] rounded-[2rem] shadow-xl overflow-hidden border border-slate-200 dark:border-white/5">
                <div className="bg-[#0081a7] dark:bg-[#005f7a] px-8 py-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-4"><div className="w-14 h-14 bg-white/20 rounded-full border-2 border-white/10 flex items-center justify-center shrink-0"><User size={28} className="text-white opacity-80" /></div><div><h2 className="text-2xl font-black text-white mb-1">Historial de {pacienteSeleccionado.nombres}</h2><p className="text-cyan-100 text-sm font-medium">C.I: {pacienteSeleccionado.cedula}</p></div></div>
                  
                  {/* ====== BOTONERA SUPERIOR SEGÚN ROL ====== */}
                  <div className="flex flex-wrap items-center gap-3">
                    
                    {esEspecialista && (
                      <>
                        <button onClick={() => setIsRecipeModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2 transform hover:-translate-y-0.5"><FlaskConical size={18} /> Redactar Récipe</button>
                        <button onClick={() => setIsConstanciaModalOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2 transform hover:-translate-y-0.5"><FileText size={18} /> Emitir Constancia</button>
                      </>
                    )}
                  </div>
                </div>

                <div className="p-8">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left whitespace-nowrap">
                      <thead className="bg-slate-50 dark:bg-[#1a1a1a] border-b border-slate-200 dark:border-white/5"><tr className="text-slate-400 text-[11px] font-bold uppercase tracking-wider"><th className="px-4 py-3">FECHA</th><th className="px-4 py-3">ESTADO</th><th className="px-4 py-3 text-right">ACCIÓN</th></tr></thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                        {consultasDelPaciente.map((c) => (
                          <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-[#1a1a1a] transition-colors group">
                            <td className="px-4 py-4 text-sm font-bold">{formatearFechaTexto(c.fecha_consulta || c.created_at)}</td>
                            <td className="px-4 py-4"><span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-3 py-1 rounded-full text-[10px] font-bold">{c.estado || 'Completada'}</span></td>
                            <td className="px-4 py-4 text-right"><button onClick={() => abrirEditorHistoria(c)} className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold hover:bg-slate-50 dark:hover:bg-white/5 transition-colors ml-auto"><Edit3 size={14} /> Ver / Editar Forma</button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {isModalConsultaOpen && (
            <div className="p-4 md:p-8 max-w-[1600px] mx-auto w-full animate-[fadeIn_0.3s_ease-out] print-modal">
              <div className="bg-white dark:bg-[#111111] rounded-[1.5rem] shadow-xl border border-slate-200 dark:border-white/5 overflow-hidden print-wrapper">
                
                {pacienteSeleccionado && !isModoFoco && (
                  <div className="no-print bg-slate-100 dark:bg-[#161616] p-6 border-b border-slate-200 dark:border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-4"><div className="w-12 h-12 rounded-full bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center text-cyan-700 font-bold text-lg shrink-0">{pacienteSeleccionado.nombres.charAt(0)}{pacienteSeleccionado.apellidos.charAt(0)}</div><div><h2 className="text-lg font-black">{pacienteSeleccionado.nombres} {pacienteSeleccionado.apellidos}</h2><div className="flex gap-2 text-xs text-slate-500 font-medium"><span>C.I: {pacienteSeleccionado.cedula}</span></div></div></div>
                  </div>
                )}

                <div className="no-print flex flex-col md:flex-row md:items-center justify-between p-6 border-b border-slate-200 dark:border-white/5 gap-4 sticky top-0 z-40 bg-white/90 dark:bg-[#111111]/90 backdrop-blur-sm">
                  <div><h3 className="text-xl font-bold">Visor de Forma 15-108</h3><div className="flex items-center gap-3 text-sm text-slate-500"><span>Consulta <strong>{formatearFechaTexto(historiaData.fecha_consulta.split('T')[0])}</strong></span></div></div>
                  <div className="flex items-center gap-3 flex-wrap">
                    {!esEspecialista && historiaData.id && (
                      <><button onClick={() => setIsRemitirModalOpen(true)} className="flex items-center gap-1.5 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-xl text-xs font-bold hover:bg-indigo-100 transition-colors"><Send size={14} /> Remitir a Especialista</button>
                      <button onClick={handleImprimirPDF} className="flex items-center gap-1.5 px-4 py-2 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-bold hover:bg-rose-100 transition-colors"><Download size={14} /> Descargar PDF</button></>
                    )}
                    <button onClick={() => setIsModoFoco(!isModoFoco)} className="flex items-center gap-1.5 px-4 py-2 border rounded-xl text-xs font-bold"><Maximize size={14} /> {isModoFoco ? 'Salir Foco' : 'Foco'}</button>
                    <button onClick={() => { setIsModalConsultaOpen(false); setIsModoFoco(false); }} className="flex items-center gap-1.5 px-4 py-2 border rounded-xl text-xs font-bold">Cancelar</button>
                    <button onClick={handleGuardarHistoria} disabled={guardando || !historiaData.id_paciente} className="flex items-center gap-1.5 px-5 py-2 bg-[#0081a7] text-white rounded-xl text-xs font-bold">{guardando ? 'Guardando...' : <><Check size={14} /> Guardar Cambios</>}</button>
                  </div>
                </div>

                <div className="printable-form p-6 md:p-10 bg-slate-200/50 dark:bg-[#0a0a0a]/50 overflow-x-auto custom-scrollbar">
                  <div className="w-[210mm] mx-auto space-y-12 pb-10 print-pages">
                    <Parte1 formIVSS={formIVSS} handleIVSSChange={handleIVSSChange} marcas={marcas} toggleMarca={toggleMarca} />
                    <Parte2 formIVSS={formIVSS} handleIVSSChange={handleIVSSChange} marcas={marcas} toggleMarca={toggleMarca} />
                    <Parte3 formIVSS={formIVSS} handleIVSSChange={handleIVSSChange} marcas={marcas} toggleMarca={toggleMarca} />
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
        .html-viewer h3 { font-size: 1.25rem; font-weight: 900; margin-bottom: 1rem; text-align: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 0.5rem; }
        .dark .html-viewer h3 { border-color: #333; }
        .html-viewer h4 { font-size: 1rem; font-weight: bold; margin-top: 1.5rem; margin-bottom: 0.5rem; background: #f8fafc; padding: 0.5rem; border-radius: 0.5rem; }
        .dark .html-viewer h4 { background: #1a1a1a; }
        .html-viewer p { margin-bottom: 0.5rem; }
        .html-viewer ul { list-style-type: disc; margin-left: 1.5rem; margin-bottom: 1rem; }

        @media print {
          @page { size: A4 portrait; margin: 0 !important; }
          .no-print, aside, header, button { display: none !important; }
          body, html { background-color: white !important; margin: 0 !important; padding: 0 !important; }
          .print-main, .print-scroll { overflow: visible !important; height: auto !important; position: absolute !important; left: 0 !important; top: 0 !important; width: 100% !important; display: block !important; }
          .print-modal { padding: 0 !important; margin: 0 !important; position: absolute !important; top: 0 !important; left: 0 !important; width: 100% !important; }
          .print-wrapper { border: none !important; box-shadow: none !important; border-radius: 0 !important; background: transparent !important; }
          .printable-form { padding: 0 !important; margin: 0 !important; background: white !important; overflow: visible !important; width: 100% !important; }
          .print-pages { margin: 0 !important; padding: 0 !important; width: 100% !important; }
          .print-pages > div { width: 210mm !important; height: 297mm !important; margin: 0 auto !important; page-break-after: always !important; page-break-inside: avoid !important; box-shadow: none !important; border: none !important; }
        }
      `}</style>
    </div>
  );
}