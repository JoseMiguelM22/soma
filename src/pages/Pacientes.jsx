import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { 
  Home, Users, Calendar, User, LogOut, Menu, Sun, Moon, Plus, 
  Search, X, PanelLeft, Maximize, ArrowLeft, Edit3, Eye, Send, 
  Download, ShieldCheck, CheckCircle, AlertCircle, Check, Phone, 
  FileDigit, CalendarDays, Lock, ClipboardList, Printer, MessageCircle, Save, FileText, FilePlus
} from 'lucide-react';

import Parte1 from './Parte1';
import Parte2 from './Parte2';
import Parte3 from './Parte3';

export default function Pacientes() {
  const navigate = useNavigate();
  const location = useLocation(); 

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'light' ? false : true; 
  });

  useEffect(() => { 
    if (isDarkMode) { document.documentElement.classList.add('dark'); localStorage.setItem('theme', 'dark'); } 
    else { document.documentElement.classList.remove('dark'); localStorage.setItem('theme', 'light'); }
  }, [isDarkMode]);

  // ================= ESTADOS GLOBALES =================
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isModoFoco, setIsModoFoco] = useState(false);
  
  const [isModalCrearOpen, setIsModalCrearOpen] = useState(false);
  const [isModalConsultaOpen, setIsModalConsultaOpen] = useState(false); 
  const [isRemitirModalOpen, setIsRemitirModalOpen] = useState(false);

  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null); 
  const [activeTab, setActiveTab] = useState('datos'); 
  const [isEditingData, setIsEditingData] = useState(false); 
  const [documentoModal, setDocumentoModal] = useState({ isOpen: false, data: null });

  const [userData, setUserData] = useState(null);
  const [pacientes, setPacientes] = useState([]);
  const [consultasPaciente, setConsultasPaciente] = useState([]); 
  const [listaEspecialistas, setListaEspecialistas] = useState([]);
  const [especialistaSelect, setEspecialistaSelect] = useState("");
  const [busquedaEspecialista, setBusquedaEspecialista] = useState(""); 
  const [dropdownAbierto, setDropdownAbierto] = useState(false);

  const [loadingPacientes, setLoadingPacientes] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [guardando, setGuardando] = useState(false);

  const [formData, setFormData] = useState({ nombres: '', apellidos: '', cedula: '', telefono: '', correo: '', sexo: '', fecha_nacimiento: '', estado_civil: 'No especificado' });
  const [editFormData, setEditFormData] = useState({ id: '', nombres: '', apellidos: '', cedula: '', telefono: '', correo: '', sexo: '', fecha_nacimiento: '', estado_civil: 'No especificado' });

  // Estados integrados de la Forma 15-108
  const [historiaData, setHistoriaData] = useState({ id: null, id_paciente: '', fecha_consulta: new Date().toISOString().slice(0, 16), proxima_consulta: '', consultorio: '' });
  const initialFormIVSS = {
    centro_asistencial: '', historia_n: '', servicio: '', piso: '', ala: '', sala_cuarto: '', cama: '', apellidos_nombres: '', cedula: '', sexo: '', edad: '', edo_civil: '', lugar_nacimiento: '', fecha_nacimiento: '', nacionalidad: '', ocupacion: '', direccion_habitacion: '', emergencia_nombre: '', emergencia_parentesco: '', emergencia_direccion: '', fecha_ingreso: new Date().toISOString().split('T')[0], hora_ingreso: '', fecha_admision_anterior: '', motivo_ingreso: '', enfermedad_actual: '', diagnostico_provisional: '', diagnostico_clinico_final: '', diagnostico_anatomo: '', temperatura: '', pulso: '', respiracion: '', ta_mx: '', ta_mn: '', peso: '', talla: '', desc_parte2_1: '', desc_parte2_2: '', desc_parte3_1: '', desc_parte3_2: '', fecha_autorizacion1: '', firma_autorizacion1: '', testigo_autorizacion1: '', parentesco_autorizacion1: '', fecha_autorizacion2: '', firma_autorizacion2: '', testigo_autorizacion2: '', parentesco_autorizacion2: '', fecha_examen: '', examen_practicado_por: '', diagnostico_servicio: ''
  };
  const [formIVSS, setFormIVSS] = useState(initialFormIVSS);
  const [marcas, setMarcas] = useState({});
  const [initialFormSnapshot, setInitialFormSnapshot] = useState(null);
  const [initialMarcasSnapshot, setInitialMarcasSnapshot] = useState(null);

  // WhatsApp Modal local states
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [patientPhone, setPatientPhone] = useState('');
  const [tempPacienteId, setTempPacienteId] = useState(null);
  const [consultaCreada, setConsultaCreada] = useState(null);

  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });
  const showToast = (message, type = 'success') => { setToast({ visible: true, message, type }); setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 4000); };

  const fetchData = async () => {
    setLoadingPacientes(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return navigate('/login');

      const { data: dbUser } = await supabase.from('usuarios').select('*').eq('id_auth', session.user.id).single();
      if (dbUser) setUserData(dbUser);
      if (dbUser?.estado_cuenta === 'Pendiente' || dbUser?.estado_cuenta === 'Rechazada') { await supabase.auth.signOut(); return navigate('/login'); }
      const rolUsuario = (dbUser?.rol || '').toLowerCase();
      if (rolUsuario === 'especialista' || rolUsuario === 'medico' || rolUsuario === 'médico') return navigate('/dashboard'); 
      if (rolUsuario === 'directivo') return navigate('/directiva'); 

      const { data: dbPacientes } = await supabase.from('pacientes').select('*').order('nombres', { ascending: true });
      if (dbPacientes) setPacientes(dbPacientes);

      const { data: todosLosUsuarios } = await supabase.from('usuarios').select('*');
      if (todosLosUsuarios) setListaEspecialistas(todosLosUsuarios.filter(user => ['especialista', 'medico', 'médico'].includes((user.rol || '').toLowerCase())));
    } catch (error) { console.error(error); } finally { setLoadingPacientes(false); }
  };

  useEffect(() => { fetchData(); }, [navigate]);

  const cargarConsultasPaciente = async (idPaciente) => {
    const { data } = await supabase.from('consultas').select('*').eq('id_paciente', idPaciente).order('fecha_consulta', { ascending: false });
    if (data) setConsultasPaciente(data); else setConsultasPaciente([]);
  };

  useEffect(() => {
    if (location.state?.autoOpenConsulta && !loadingPacientes) {
      const c = location.state.autoOpenConsulta;
      const pac = Array.isArray(c.pacientes) ? c.pacientes[0] : c.pacientes;
      if (pac) {
        setPacienteSeleccionado(pac);
        cargarConsultasPaciente(pac.id);
        setActiveTab('expediente');
        setTimeout(() => { setDocumentoModal({ isOpen: true, data: c }); }, 500);
      }
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, loadingPacientes, navigate, location.pathname]);

  const handleLogout = async () => { await supabase.auth.signOut(); navigate('/login'); };
  const getInitials = () => { if (!userData) return "AS"; return `${userData.nombres?.charAt(0) || ''}${userData.apellidos?.charAt(0) || ''}`.toUpperCase(); };
  const esEspecialista = userData && ['especialista', 'medico', 'médico'].includes((userData.rol || '').toLowerCase());

  const handleInputPacienteChange = (e, isEdit = false) => {
    const { name, value } = e.target;
    if (name === 'nombres' || name === 'apellidos') { if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]*$/.test(value)) return; }
    if (name === 'cedula' || name === 'telefono') { if (!/^[0-9]*$/.test(value)) return; }
    if (isEdit) setEditFormData({ ...editFormData, [name]: value });
    else setFormData({ ...formData, [name]: value });
  };

  const handleGuardarPaciente = async (e) => {
    e.preventDefault(); setGuardando(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const { data, error } = await supabase.from('pacientes').insert([{ id_medico: session.user.id, nombres: formData.nombres, apellidos: formData.apellidos, cedula: formData.cedula, telefono: formData.telefono, correo: formData.correo, sexo: formData.sexo, fecha_nacimiento: formData.fecha_nacimiento }]).select();
      if (error) throw error;
      setPacientes([data[0], ...pacientes]); setIsModalCrearOpen(false); setFormData({ nombres: '', apellidos: '', cedula: '', telefono: '', correo: '', sexo: '', fecha_nacimiento: '', estado_civil: 'No especificado' });
      showToast("Paciente registrado con éxito", "success");
    } catch (error) { showToast("Error al crear. Intenta de nuevo.", "error"); } finally { setGuardando(false); }
  };

  const handleActualizarPaciente = async (e) => {
    e.preventDefault(); setGuardando(true);
    try {
      const { error } = await supabase.from('pacientes').update({ nombres: editFormData.nombres, apellidos: editFormData.apellidos, cedula: editFormData.cedula, telefono: editFormData.telefono, correo: editFormData.correo, sexo: editFormData.sexo, fecha_nacimiento: editFormData.fecha_nacimiento }).eq('id', editFormData.id);
      if (error) throw error;
      await fetchData(); 
      const pacienteActualizado = { ...pacienteSeleccionado, ...editFormData };
      setPacienteSeleccionado(pacienteActualizado); setIsEditingData(false); 
      showToast("Paciente actualizado con éxito", "success");
    } catch (error) { showToast("Error al actualizar.", "error"); } finally { setGuardando(false); }
  };

  const abrirPerfil = (paciente) => {
    setEditFormData({ id: paciente.id, nombres: paciente.nombres, apellidos: paciente.apellidos, cedula: paciente.cedula, telefono: paciente.telefono || '', correo: paciente.correo || '', sexo: paciente.sexo, fecha_nacimiento: paciente.fecha_nacimiento, estado_civil: 'No especificado' });
    setPacienteSeleccionado(paciente);
    cargarConsultasPaciente(paciente.id);
    setActiveTab('expediente');
    setIsEditingData(false);
  };

  const handleIVSSChange = (e) => {
    const { name, value } = e.target;
    if (esEspecialista && initialFormSnapshot && initialFormSnapshot[name] && initialFormSnapshot[name] !== '') return; 
    setFormIVSS(prev => ({ ...prev, [name]: value }));
  };

  const toggleMarca = (id) => {
    if (esEspecialista && initialMarcasSnapshot && initialMarcasSnapshot[id]) return; 
    setMarcas(prev => ({ ...prev, [id]: !prev[id] ? 'X' : (prev[id] === 'X' ? '√' : '') }));
  };

  const abrirEditorHistoria = (consulta = null, idPacienteForzado = null) => {
    if (consulta) {
      setHistoriaData({ id: consulta.id, id_paciente: consulta.id_paciente, fecha_consulta: consulta.fecha_consulta ? consulta.fecha_consulta.slice(0, 16) : consulta.created_at.slice(0, 16), proxima_consulta: consulta.proxima_consulta || '', consultorio: consulta.consultorio || '' });
      if (consulta.datos_formulario) {
        const parsed = typeof consulta.datos_formulario === 'string' ? JSON.parse(consulta.datos_formulario) : consulta.datos_formulario;
        setFormIVSS(parsed.formIVSS || initialFormIVSS); setMarcas(parsed.marcas || {});
        setInitialFormSnapshot(parsed.formIVSS || initialFormIVSS); setInitialMarcasSnapshot(parsed.marcas || {});
      } else { setFormIVSS(initialFormIVSS); setMarcas({}); setInitialFormSnapshot(initialFormIVSS); setInitialMarcasSnapshot({}); }
    } else {
      setHistoriaData({ id: null, id_paciente: idPacienteForzado || (pacienteSeleccionado ? pacienteSeleccionado.id : ''), fecha_consulta: new Date().toISOString().slice(0, 16), proxima_consulta: '', consultorio: '' });
      const nombreCompleto = pacienteSeleccionado ? `${pacienteSeleccionado.apellidos} ${pacienteSeleccionado.nombres}` : '';
      setFormIVSS({ ...initialFormIVSS, apellidos_nombres: nombreCompleto, cedula: pacienteSeleccionado?.cedula || '', sexo: pacienteSeleccionado?.sexo || '', edad: calcularEdad(pacienteSeleccionado?.fecha_nacimiento), lugar_nacimiento: '', fecha_nacimiento: pacienteSeleccionado?.fecha_nacimiento || ''}); 
      setMarcas({}); setInitialFormSnapshot(initialFormIVSS); setInitialMarcasSnapshot({});
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
      const payload = { id_medico: session.user.id, id_paciente: historiaData.id_paciente, fecha_consulta: new Date(historiaData.fecha_consulta).toISOString(), proxima_consulta: historiaData.proxima_consulta ? new Date(historiaData.proxima_consulta).toISOString() : null, consultorio: historiaData.consultorio, nota_clinica: generarHTMLOculto(), datos_formulario: { formIVSS, marcas }, estado: 'Completada', motivo: formIVSS.motivo_ingreso || 'Forma 15-108' };

      let error; let nuevaConsulta;
      if (historiaData.id) { 
        const res = await supabase.from('consultas').update(payload).eq('id', historiaData.id).select('*, pacientes(*)').single(); 
        error = res.error; nuevaConsulta = res.data;
      } else { 
        const res = await supabase.from('consultas').insert([payload]).select('*, pacientes(*)').single(); 
        error = res.error; nuevaConsulta = res.data;
      }

      if (error) throw error;
      showToast("¡Formato guardado exitosamente!", "success");

      setFormIVSS(initialFormIVSS); setMarcas({}); setGuardando(false);
      
      setConsultaCreada(nuevaConsulta);
      setTempPacienteId(pacienteSeleccionado.id);
      setPatientPhone(pacienteSeleccionado.telefono || '');
      setIsModalConsultaOpen(false);
      setShowPhoneModal(true); 

    } catch (error) { showToast("Error al guardar: " + error.message, "error"); setGuardando(false); }
  };

  const handleSavePhoneLocal = async () => {
    if (!patientPhone) { handleSkipPhoneLocal(); return; }
    setGuardando(true);
    try {
      const { error } = await supabase.from('pacientes').update({ telefono: patientPhone }).eq('id', tempPacienteId);
      if (error) throw error;
      handleSkipPhoneLocal(); 
    } catch (error) { alert("Hubo un error al guardar el teléfono."); setGuardando(false); }
  };

  const handleSkipPhoneLocal = () => {
    setShowPhoneModal(false); setTempPacienteId(null); setPatientPhone(''); setGuardando(false);
    cargarConsultasPaciente(pacienteSeleccionado.id);
    setDocumentoModal({ isOpen: true, data: consultaCreada });
  };

  const handleConfirmarRemision = async () => {
    setGuardando(true);
    try {
      const { error } = await supabase.from('consultas').update({ id_medico: especialistaSelect, estado: 'En Espera' }).eq('id', historiaData.id);
      if (error) throw error;
      setIsRemitirModalOpen(false); setEspecialistaSelect(""); setBusquedaEspecialista(""); 
      await cargarConsultasPaciente(historiaData.id_paciente);
      showToast("¡Historia remitida al especialista correctamente!", "success");
    } catch (error) { showToast("Error al remitir la historia.", "error"); } finally { setGuardando(false); }
  };

  const calcularEdad = (fechaNacimiento) => {
    if (!fechaNacimiento) return '-'; const hoy = new Date(); const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear(); const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) edad--; return String(edad);
  };

  const formatearFechaTexto = (fechaCompleta) => {
    if (!fechaCompleta) return ''; const fecha = new Date(fechaCompleta);
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return `${String(fecha.getDate()).padStart(2, '0')} de ${meses[fecha.getMonth()]} de ${fecha.getFullYear()} a las ${String(fecha.getHours()).padStart(2, '0')}:${String(fecha.getMinutes()).padStart(2, '0')}`;
  };

  const handleImprimirPDF = () => window.print();
  const handleWhatsApp = (telefono) => {
    if (!telefono) return showToast("Este paciente no tiene número registrado.", "error");
    let num = telefono.replace(/\D/g, '');
    if (num.startsWith('0')) num = '58' + num.substring(1); else if (!num.startsWith('58') && num.length === 10) num = '58' + num;
    window.open(`https://wa.me/${num}`, '_blank');
  };

  const pacientesFiltrados = pacientes.filter(p => (p.nombres || '').toLowerCase().includes(busqueda.toLowerCase()) || (p.apellidos || '').toLowerCase().includes(busqueda.toLowerCase()) || (p.cedula && p.cedula.includes(busqueda)));
  const especialistasFiltrados = listaEspecialistas.filter(med => { const searchTerm = busquedaEspecialista.toLowerCase(); const nombreCompleto = `${med.nombres || ''} ${med.apellidos || ''}`.toLowerCase(); const especialidad = (med.especialidad || '').toLowerCase(); return nombreCompleto.includes(searchTerm) || especialidad.includes(searchTerm); });

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-[#0B0D12] text-slate-800 dark:text-slate-200 font-sans overflow-hidden transition-colors duration-300 antialiased tracking-normal">
      {isSidebarOpen && <div className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm no-print" onClick={() => setIsSidebarOpen(false)} />}

      {/* TOAST NOTIFICATION */}
      <div className={`fixed top-6 right-6 z-[9999] flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl border transition-all duration-300 transform no-print ${toast.visible ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0 pointer-events-none'} ${toast.type === 'success' ? 'bg-emerald-50 dark:bg-[#064e3b] border-emerald-200 dark:border-emerald-800' : 'bg-rose-50 dark:bg-[#4c0519] border-rose-200 dark:border-rose-800'}`}>
        {toast.type === 'success' ? <CheckCircle size={24} className="text-emerald-600 dark:text-emerald-400" /> : <AlertCircle size={24} className="text-rose-600 dark:text-rose-400" />}
        <span className={`font-bold text-sm ${toast.type === 'success' ? 'text-emerald-800 dark:text-emerald-100' : 'text-rose-800 dark:text-rose-100'}`}>{toast.message}</span>
      </div>

      {/* MODAL WHATSAPP PARA PACIENTES */}
      {showPhoneModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out] no-print">
          <div className="bg-white dark:bg-[#16161a] border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden text-center">
            <div className="p-8 pb-4">
              <div className="w-16 h-16 bg-[#25D366]/20 text-[#25D366] rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-[#25D366]/30"><MessageCircle size={32} /></div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">¡Historia Guardada!</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Añade o verifica el número de WhatsApp para contactar luego a este paciente.</p>
              <div className="text-left">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Número de Teléfono / WhatsApp</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                  <input type="text" value={patientPhone} onChange={(e) => setPatientPhone(e.target.value)} placeholder="Ej. 04141234567" className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#25D366] transition-all" />
                </div>
              </div>
            </div>
            <div className="p-6 bg-slate-50 dark:bg-[#111111] border-t border-slate-200 dark:border-white/5 flex flex-col gap-3">
              <button onClick={handleSavePhoneLocal} disabled={guardando} className="w-full bg-[#25D366] hover:bg-[#1ebd53] text-white px-5 py-3 rounded-xl font-black shadow-lg flex items-center justify-center gap-2">{guardando ? 'Guardando...' : 'Guardar y Continuar'}</button>
              <button onClick={handleSkipPhoneLocal} disabled={guardando} className="w-full text-slate-500 hover:text-slate-800 dark:hover:text-white text-sm font-bold">Omitir por ahora</button>
            </div>
          </div>
        </div>
      )}

      {/* VISOR DE DOCUMENTOS DE FORMA 15-108 */}
      {documentoModal.isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-white dark:bg-[#111111] border-0 sm:border border-slate-200 dark:border-white/10 rounded-none sm:rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col h-[100dvh] sm:max-h-[90vh]">
            <div className="p-4 md:p-5 border-b border-slate-200 dark:border-white/5 flex justify-between items-center bg-slate-50 dark:bg-[#16161a] no-print">
              <div className="overflow-hidden pr-2">
                <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-base md:text-lg truncate"><ClipboardList size={20} className="text-[#0081a7] dark:text-cyan-500 shrink-0"/> <span className="truncate">{documentoModal.data?.tipo || 'Documento Clínico'}</span></h3>
                <p className="text-[10px] md:text-xs text-slate-500 mt-1 ml-6 truncate">Generado el {formatearFechaTexto(documentoModal.data?.created_at || documentoModal.data?.fecha_creacion)}</p>
              </div>
              <button onClick={() => setDocumentoModal({isOpen: false, data: null})} className="text-slate-400 hover:text-rose-500 p-1.5 md:p-2 bg-slate-100 dark:bg-white/5 rounded-full shrink-0"><X size={20}/></button>
            </div>
            <div className="p-4 md:p-8 overflow-y-auto custom-scrollbar text-slate-800 dark:text-slate-200 text-sm html-viewer print-area bg-white dark:bg-[#111111] flex-1">
              <div dangerouslySetInnerHTML={{ __html: documentoModal.data?.contenido || documentoModal.data?.html || documentoModal.data?.nota_clinica || '<div class="text-center py-10 text-slate-500">No hay contenido disponible para este formato.</div>' }} />
            </div>
            <div className="p-3 md:p-4 bg-slate-50 dark:bg-[#16161a] border-t border-slate-200 dark:border-white/5 flex justify-end gap-2 md:gap-3 no-print">
               <button onClick={() => window.print()} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 md:px-5 py-2.5 bg-slate-200 dark:bg-[#2a2a2a] text-slate-800 dark:text-slate-200 rounded-xl font-bold text-sm shadow-sm hover:bg-slate-300 dark:hover:bg-[#333] transition-colors"><Printer size={16} /> Imprimir</button>
               <button onClick={() => setDocumentoModal({isOpen: false, data: null})} className="flex-1 sm:flex-none justify-center px-4 md:px-6 py-2.5 bg-[#0081a7] text-white rounded-xl font-bold text-sm shadow-md hover:bg-[#006b8a] transition-colors">Cerrar Visor</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL REMITIR ESPECIALISTA */}
      {isRemitirModalOpen && !esEspecialista && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 no-print">
          <div className="bg-white dark:bg-[#16161a] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl w-full max-w-md animate-[fadeIn_0.2s_ease-out]">
            <div className="p-6 border-b border-slate-200 dark:border-white/5"><h3 className="text-lg font-bold">Remitir Historia a Especialista</h3><p className="text-sm text-slate-500">Selecciona el médico evaluador.</p></div>
            <div className="p-6">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Especialista disponible</label>
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                <input type="text" placeholder="Buscar por nombre o especialidad..." value={busquedaEspecialista} onChange={(e) => { setBusquedaEspecialista(e.target.value); setEspecialistaSelect(""); setDropdownAbierto(true); }} onFocus={() => setDropdownAbierto(true)} onBlur={() => setTimeout(() => setDropdownAbierto(false), 200)} className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" />
                {dropdownAbierto && (
                  <ul className="absolute z-50 w-full mt-2 max-h-48 overflow-y-auto bg-white dark:bg-[#1a1a1a] border rounded-xl shadow-2xl">
                    {especialistasFiltrados.length > 0 ? (
                      especialistasFiltrados.map(med => (
                        <li key={med.id_auth} onClick={() => { setEspecialistaSelect(med.id_auth); setBusquedaEspecialista(`Dr(a). ${med.nombres} ${med.apellidos}`); setDropdownAbierto(false); }} className="px-4 py-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 border-b last:border-0"><div className="font-bold text-sm">Dr(a). {med.nombres} {med.apellidos}</div></li>
                      ))
                    ) : ( <li className="px-4 py-3 text-sm text-slate-500 text-center">No se encontraron especialistas</li> )}
                  </ul>
                )}
              </div>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-[#111111] border-t flex justify-end gap-3 rounded-b-2xl">
              <button onClick={() => { setIsRemitirModalOpen(false); setBusquedaEspecialista(""); setEspecialistaSelect(""); }} className="px-4 py-2 text-sm font-bold hover:bg-slate-200 rounded-xl">Cancelar</button>
              <button onClick={handleConfirmarRemision} disabled={!especialistaSelect || guardando} className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-md">{guardando ? 'Remitiendo...' : 'Confirmar Remisión'}</button>
            </div>
          </div>
        </div>
      )}

      {/* SIDEBAR ASISTENTE */}
      <aside className={`no-print fixed inset-y-0 left-0 z-50 bg-white dark:bg-[#16161a] border-r border-slate-200/80 dark:border-white/[0.04] flex flex-col justify-between transform transition-all duration-300 ease-in-out md:relative md:translate-x-0 md:m-4 md:mr-0 md:rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none ${isSidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64'} ${isCollapsed ? 'md:w-24' : 'md:w-68'}`}>
        <div>
          <div className={`h-20 flex items-center transition-all ${isCollapsed ? 'justify-center' : 'justify-between px-6'}`}><Link to={esEspecialista ? "/dashboard" : "/admision"} className="flex items-center overflow-hidden whitespace-nowrap">{isCollapsed ? <span className="text-emerald-500 text-3xl mb-1 font-black">*</span> : <><img src="/soma_logo.png" alt="SOMA Logo" className="h-6 object-contain block dark:hidden" /><img src="/soma_logo_blanco.png" alt="SOMA Logo" className="h-6 object-contain hidden dark:block" /></>}</Link>{!isCollapsed && <button className="md:hidden text-slate-400 hover:text-rose-500 transition-colors" onClick={() => setIsSidebarOpen(false)}><X size={20} /></button>}</div>
          <div className={`py-4 ${isCollapsed ? 'px-3' : 'px-4'}`}>
            {!isCollapsed && <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-3 px-3 tracking-widest uppercase">Herramientas</p>}
            <nav className="space-y-1.5">
              <Link to={esEspecialista ? "/dashboard" : "/admision"} className={`flex items-center gap-3 py-3 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/[0.03] rounded-xl font-medium transition-all ${isCollapsed ? 'justify-center px-0' : 'px-4'}`}><Home size={20} className="shrink-0" />{!isCollapsed && <span className="whitespace-nowrap text-sm">Inicio</span>}</Link>
              <Link to="/pacientes" className={`flex items-center gap-3 py-3 bg-emerald-500/10 dark:bg-white/10 text-emerald-600 dark:text-white rounded-xl font-bold transition-all ${isCollapsed ? 'justify-center px-0' : 'px-4'}`}><Users size={20} className="shrink-0" />{!isCollapsed && <span className="whitespace-nowrap text-sm">Pacientes</span>}</Link>
              <Link to="/agenda" className={`flex items-center gap-3 py-3 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/[0.03] rounded-xl font-medium transition-all ${isCollapsed ? 'justify-center px-0' : 'px-4'}`}><Calendar size={20} className="shrink-0" />{!isCollapsed && <span className="whitespace-nowrap text-sm">Agenda</span>}</Link>
            </nav>
          </div>
        </div>
        <div className={`p-4 border-t border-slate-200 dark:border-white/5 flex flex-col ${isCollapsed ? 'items-center' : ''}`}>
          <div className={`flex items-center gap-3 mb-4 ${isCollapsed ? 'justify-center' : 'px-2'}`}>
            <div className="w-8 h-8 shrink-0 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-700 dark:text-white border border-slate-300 dark:border-white/20">{userData ? getInitials() : '...'}</div>
            {!isCollapsed && (
              <div className="overflow-hidden">
                <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-tight">{userData && ['especialista', 'medico', 'médico'].includes((userData.rol || '').toLowerCase()) ? 'ESPECIALISTA' : 'DPTO. HISTORIAS'}</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight truncate">{userData && ['especialista', 'medico', 'médico'].includes((userData.rol || '').toLowerCase()) ? 'Dr(a). ' : ''}{userData ? `${userData.nombres} ${userData.apellidos}` : 'Cargando...'}</p>
              </div>
            )}
          </div>
          <div className={`p-4 border-t border-slate-200 dark:border-white/5 flex flex-col gap-2 ${isCollapsed ? 'items-center' : ''}`}>
            <Link to="/perfil" className={`flex items-center gap-3 py-2 w-full text-slate-500 hover:text-[#0081a7] rounded-lg font-bold transition-colors ${isCollapsed ? 'justify-center px-0' : 'px-3'}`}><User size={20} className="shrink-0" />{!isCollapsed && <span className="whitespace-nowrap">Mi Perfil</span>}</Link>
            <button onClick={handleLogout} className={`flex items-center gap-3 py-2 w-full text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg font-bold transition-colors ${isCollapsed ? 'justify-center px-0' : 'px-3'}`}><LogOut size={20} className="shrink-0" />{!isCollapsed && <span className="whitespace-nowrap">Cerrar Sesión</span>}</button>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden w-full relative bg-slate-100 dark:bg-[#050505] print-main">
        <header className="no-print h-16 flex items-center justify-between px-4 md:px-6 lg:px-8 border-b border-slate-200 dark:border-white/5 bg-white/50 dark:bg-[#111111]/80 backdrop-blur-sm sticky top-0 z-30 shrink-0">
          <div className="flex items-center gap-4"><button className="text-slate-500 hover:text-cyan-600 md:hidden" onClick={() => setIsSidebarOpen(true)}><Menu size={24} /></button><button className="hidden md:flex p-2 text-slate-400 hover:text-cyan-600 dark:hover:text-white rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10" onClick={() => setIsCollapsed(!isCollapsed)}><PanelLeft size={20} /></button></div>
          <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 text-slate-400 hover:text-cyan-600 dark:hover:text-yellow-400 bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 transition-colors"><Sun size={20} className="hidden dark:block"/><Moon size={20} className="block dark:hidden"/></button>
        </header>

        <div className="flex-1 overflow-y-auto w-full custom-scrollbar pb-10 print-scroll">
          
          {/* ================= VISTA 1: DIRECTORIO DE PACIENTES ================= */}
          {!isModalConsultaOpen && !pacienteSeleccionado && (
            <div className="no-print p-4 md:p-8 max-w-[1400px] mx-auto w-full animate-[fadeIn_0.3s_ease-out]">
              <div className="bg-white dark:bg-[#111111] rounded-[2rem] shadow-xl overflow-hidden border border-slate-200 dark:border-white/5">
                <div className="bg-[#0081a7] dark:bg-[#005f7a] px-6 md:px-8 py-8 md:py-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div><h2 className="text-2xl md:text-3xl font-black text-white mb-2 tracking-tight">Directorio de Pacientes</h2><p className="text-cyan-100 text-sm font-medium">Busca el paciente para ver o agregar formatos clínicos.</p></div>
                  
                </div>
                <div className="p-4 md:p-8">
                  <div className="mb-6"><div className="relative flex-1"><Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} /><input type="text" placeholder="Buscar por nombre o cédula..." className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-[#0081a7] text-sm shadow-sm" value={busqueda} onChange={(e) => setBusqueda(e.target.value)}/></div></div>
                  {loadingPacientes ? ( <div className="flex justify-center h-48"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0081a7]"></div></div> ) : (
                    <div className="overflow-x-auto border-t border-slate-100 dark:border-white/5 pt-4">
                      <table className="w-full text-left whitespace-nowrap">
                        <thead><tr className="border-b border-slate-200 dark:border-white/10 text-slate-400 text-[11px] font-bold uppercase tracking-wider"><th className="px-4 py-3">PACIENTE</th><th className="px-4 py-3">CÉDULA</th><th className="px-4 py-3 hidden sm:table-cell">EDAD</th><th className="px-4 py-3 text-right">ACCIÓN</th></tr></thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                          {pacientesFiltrados.map((paciente) => (
                            <tr key={paciente.id} className="hover:bg-slate-50 dark:hover:bg-[#1a1a1a] transition-colors group cursor-pointer" onClick={() => abrirPerfil(paciente)}>
                              <td className="px-4 py-3"><div className="flex items-center gap-3"><div className="w-9 h-9 rounded-full bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center text-cyan-700 font-bold text-xs shrink-0">{(paciente.nombres || 'P').charAt(0)}{(paciente.apellidos || '').charAt(0)}</div><p className="font-bold text-sm text-slate-900 dark:text-white">{paciente.nombres} {paciente.apellidos}</p></div></td>
                              <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{paciente.cedula || '—'}</td>
                              <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300 hidden sm:table-cell">{calcularEdad(paciente.fecha_nacimiento)} años</td>
                              <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}><button onClick={() => abrirPerfil(paciente)} className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-400 rounded-md text-xs font-bold hover:bg-cyan-100 transition-colors ml-auto"><Eye size={14} /> Abrir expediente</button></td>
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

          {/* ================= VISTA 2: PERFIL DEL PACIENTE Y EXPEDIENTE ================= */}
          {!isModalConsultaOpen && pacienteSeleccionado && (
            <div className="no-print p-0 sm:p-4 md:p-8 max-w-[1600px] mx-auto w-full animate-[fadeIn_0.3s_ease-out]">
              <div className="px-4 py-2 sm:p-0">
                 <button onClick={() => setPacienteSeleccionado(null)} className="flex items-center gap-1.5 text-slate-500 hover:text-[#0081a7] font-bold text-sm sm:mb-6 transition-colors"><ArrowLeft size={16} /> Volver al directorio</button>
              </div>
              
              <div className="bg-[#0081a7] dark:bg-[#005f7a] text-white pt-6 md:pt-8 px-4 md:px-10 shrink-0 shadow-md rounded-none sm:rounded-t-[2rem]">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-start justify-between gap-4 md:gap-6 pb-6">
                  <div className="flex items-center gap-4 md:gap-5">
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-white/20 rounded-full border-4 border-white/10 flex items-center justify-center shrink-0 shadow-inner"><User size={32} className="text-white opacity-80 md:w-10 md:h-10 w-8 h-8" /></div>
                    <div>
                      <h2 className="text-xl md:text-2xl font-black mb-1">{pacienteSeleccionado.nombres} {pacienteSeleccionado.apellidos}</h2>
                      <div className="flex flex-wrap items-center gap-2 md:gap-3 text-cyan-100 text-xs md:text-sm font-medium mt-1 md:mt-2">
                        <span className="flex items-center gap-1"><FileDigit size={12} className="opacity-70 md:w-3.5 md:h-3.5" /> {pacienteSeleccionado.cedula || 'N/A'}</span>
                        <span className="flex items-center gap-1"><Phone size={12} className="opacity-70 md:w-3.5 md:h-3.5" /> {pacienteSeleccionado.telefono || 'N/A'}</span>
                        <span className="flex items-center gap-1"><CalendarDays size={12} className="opacity-70 md:w-3.5 md:h-3.5" /> {calcularEdad(pacienteSeleccionado.fecha_nacimiento)} años</span>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => handleWhatsApp(pacienteSeleccionado.telefono)} className="bg-[#25D366] hover:bg-[#1ebd53] text-white px-4 py-2 rounded-xl text-xs md:text-sm font-bold shadow flex items-center justify-center gap-2 transition-all w-full md:w-max mt-2 md:mt-0">WhatsApp</button>
                </div>
                <div className="max-w-6xl mx-auto flex gap-4 md:gap-6 text-xs md:text-sm font-bold border-t border-cyan-700/50 overflow-x-auto hide-scroll pt-1 relative">
                  <button onClick={() => setActiveTab('datos')} className={`border-b-[3px] py-3 md:py-3.5 whitespace-nowrap transition-colors ${activeTab === 'datos' ? 'border-white text-white' : 'border-transparent text-cyan-200 hover:text-white'}`}>Datos Personales</button>
                  <button onClick={() => setActiveTab('expediente')} className={`border-b-[3px] py-3 md:py-3.5 whitespace-nowrap transition-colors ${activeTab === 'expediente' ? 'border-white text-white' : 'border-transparent text-cyan-200 hover:text-white'}`}>Expediente Clínico</button>
                </div>
              </div>

              <div className="bg-white dark:bg-[#111111] rounded-none sm:rounded-b-[2rem] shadow-xl border-0 sm:border-x sm:border-b border-slate-200 dark:border-white/5 p-4 md:p-8 min-h-[50vh]">
                {activeTab === 'datos' && (
                  <div className="animate-[fadeIn_0.2s_ease-out] max-w-6xl mx-auto">
                    {!isEditingData ? (
                      <div className="bg-slate-50 dark:bg-[#1a1a1a] rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm p-4 md:p-6">
                         <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 border-b border-slate-200 dark:border-white/10 pb-4 gap-4"><h3 className="text-base md:text-lg font-bold flex items-center gap-2"><User size={18} className="text-[#0081a7]"/> Información del paciente</h3><button onClick={() => setIsEditingData(true)} className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 bg-white dark:bg-[#111111] border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold shadow-sm hover:bg-slate-100 transition-colors"><Edit3 size={14}/> Editar Datos</button></div>
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-10 text-xs md:text-sm">
                           <div className="flex flex-col py-2"><span className="text-slate-500 font-medium mb-1">Nombre completo</span><span className="font-bold text-slate-900 dark:text-white">{pacienteSeleccionado.nombres} {pacienteSeleccionado.apellidos}</span></div>
                           <div className="flex flex-col py-2"><span className="text-slate-500 font-medium mb-1">Cédula</span><span className="font-bold text-slate-900 dark:text-white">{pacienteSeleccionado.cedula || '—'}</span></div>
                           <div className="flex flex-col py-2"><span className="text-slate-500 font-medium mb-1">Edad y Fecha Nacimiento</span><span className="font-bold text-slate-900 dark:text-white">{calcularEdad(pacienteSeleccionado.fecha_nacimiento)} años ({formatearFechaTexto(pacienteSeleccionado.fecha_nacimiento).split('a las')[0]})</span></div>
                           <div className="flex flex-col py-2"><span className="text-slate-500 font-medium mb-1">Sexo</span><span className="font-bold text-slate-900 dark:text-white">{pacienteSeleccionado.sexo}</span></div>
                           <div className="flex flex-col py-2"><span className="text-slate-500 font-medium mb-1">Correo Electrónico</span><span className="font-bold text-slate-900 dark:text-white">{pacienteSeleccionado.correo || '—'}</span></div>
                           <div className="flex flex-col py-2"><span className="text-slate-500 font-medium mb-1">Teléfono Principal</span><span className="font-bold text-slate-900 dark:text-white">{pacienteSeleccionado.telefono || '—'}</span></div>
                         </div>
                      </div>
                    ) : (
                      <form onSubmit={handleActualizarPaciente} className="bg-slate-50 dark:bg-[#1a1a1a] rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm p-4 md:p-6 space-y-6">
                         <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4 gap-4"><h3 className="text-base md:text-lg font-bold text-slate-900 dark:text-white">Editando Datos</h3><div className="flex gap-2 w-full sm:w-auto"><button type="button" onClick={() => setIsEditingData(false)} className="flex-1 sm:flex-none px-4 py-2.5 border rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-[#111111]">Cancelar</button><button type="submit" disabled={guardando} className="flex-1 sm:flex-none px-5 py-2.5 bg-[#0081a7] text-white rounded-xl text-xs font-bold shadow-md">{guardando ? 'Guardando...' : 'Guardar'}</button></div></div>
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
                           <div><label className="block text-xs font-bold mb-1.5 text-slate-700 dark:text-slate-300">Cédula</label><input type="text" name="cedula" value={editFormData.cedula} onChange={(e) => handleInputPacienteChange(e, true)} className="w-full px-4 py-3 bg-white dark:bg-[#111111] border border-slate-200 dark:border-white/10 rounded-xl outline-none" /></div>
                           <div><label className="block text-xs font-bold mb-1.5 text-slate-700 dark:text-slate-300">Nombres</label><input type="text" name="nombres" value={editFormData.nombres} onChange={(e) => handleInputPacienteChange(e, true)} required className="w-full px-4 py-3 bg-white dark:bg-[#111111] border border-slate-200 dark:border-white/10 rounded-xl outline-none" /></div>
                           <div><label className="block text-xs font-bold mb-1.5 text-slate-700 dark:text-slate-300">Apellidos</label><input type="text" name="apellidos" value={editFormData.apellidos} onChange={(e) => handleInputPacienteChange(e, true)} required className="w-full px-4 py-3 bg-white dark:bg-[#111111] border border-slate-200 dark:border-white/10 rounded-xl outline-none" /></div>
                           <div><label className="block text-xs font-bold mb-1.5 text-slate-700 dark:text-slate-300">Fecha nacimiento</label><input type="date" name="fecha_nacimiento" value={editFormData.fecha_nacimiento} onChange={(e) => handleInputPacienteChange(e, true)} required className="w-full px-4 py-3 bg-white dark:bg-[#111111] border border-slate-200 dark:border-white/10 rounded-xl outline-none [&::-webkit-calendar-picker-indicator]:dark:invert" /></div>
                           <div><label className="block text-xs font-bold mb-1.5 text-slate-700 dark:text-slate-300">Sexo</label><select name="sexo" value={editFormData.sexo} onChange={(e) => handleInputPacienteChange(e, true)} required className="w-full px-4 py-3 bg-white dark:bg-[#111111] border border-slate-200 dark:border-white/10 rounded-xl outline-none"><option value="Masculino">Masculino</option><option value="Femenino">Femenino</option></select></div>
                           <div><label className="block text-xs font-bold mb-1.5 text-slate-700 dark:text-slate-300">Teléfono</label><input type="text" name="telefono" value={editFormData.telefono} onChange={(e) => handleInputPacienteChange(e, true)} className="w-full px-4 py-3 bg-white dark:bg-[#111111] border border-slate-200 dark:border-white/10 rounded-xl outline-none" /></div>
                         </div>
                      </form>
                    )}
                  </div>
                )}

                {activeTab === 'expediente' && (
                  <div className="animate-[fadeIn_0.2s_ease-out] max-w-6xl mx-auto">
                    <div className="bg-slate-50 dark:bg-[#1a1a1a] rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm p-4 md:p-6">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 md:mb-6 gap-4 border-b border-slate-200 dark:border-white/10 pb-4">
                        <div><h3 className="text-base md:text-lg font-bold flex items-center gap-2 text-slate-900 dark:text-white"><ClipboardList size={18} className="text-[#0081a7]"/> Expediente Clínico</h3><p className="text-[10px] md:text-xs text-slate-500 mt-1 sm:ml-7">Administra el historial de documentos y evaluaciones.</p></div>
                       
                      </div>
                      
                      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-white/5 bg-white dark:bg-[#111111]">
                        <table className="w-full text-left whitespace-nowrap">
                          <thead className="border-b border-slate-200 dark:border-white/5"><tr className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest"><th className="px-4 md:px-5 py-4">FECHA</th><th className="px-4 md:px-5 py-4">DOCUMENTO</th><th className="px-4 md:px-5 py-4 text-right">ACCIÓN</th></tr></thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                            {consultasPaciente.map((c) => (
                              <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-[#16161a] transition-colors group">
                                <td className="px-4 md:px-5 py-4 text-xs md:text-sm font-bold text-slate-900 dark:text-white">{formatearFechaTexto(c.fecha_consulta || c.created_at).split(' a las')[0]}</td>
                                <td className="px-4 md:px-5 py-4"><span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-3 py-1 rounded-full text-[10px] font-bold">{c.motivo || 'Forma 15-108'}</span></td>
                                <td className="px-4 md:px-5 py-4 text-right"><button onClick={() => abrirEditorHistoria(c, pacienteSeleccionado.id)} className="flex items-center justify-center gap-1.5 px-3 md:px-4 py-2 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold hover:bg-slate-100 dark:hover:bg-white/5 transition-colors ml-auto text-slate-800 dark:text-slate-200"><FileText size={14} /> <span className="hidden sm:inline">Abrir</span></button></td>
                              </tr>
                            ))}
                            {consultasPaciente.length === 0 && (
                              <tr><td colSpan="3" className="px-4 py-12 text-center text-slate-500 text-xs md:text-sm">Este paciente no tiene formatos registrados aún.</td></tr>
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

          {/* ================= VISTA 3: EDITOR DE LA FORMA 15-108 (Modo Full Screen / Mobile Friendly) ================= */}
          {isModalConsultaOpen && (
            <div className="p-0 sm:p-4 md:p-8 max-w-[1600px] mx-auto w-full animate-[fadeIn_0.3s_ease-out] print-modal mt-0 sm:mt-2 flex-1 flex flex-col h-[100dvh] sm:h-auto">
              <div className="bg-white dark:bg-[#111111] rounded-none sm:rounded-[1.5rem] shadow-none sm:shadow-xl border-0 sm:border border-slate-200 dark:border-white/5 overflow-hidden print-wrapper flex-1 flex flex-col">
                
                {!isModoFoco && (
                  <div className="no-print bg-slate-100 dark:bg-[#161616] p-4 md:p-6 border-b border-slate-200 dark:border-white/5 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3 md:gap-4">
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center text-cyan-700 font-bold text-base md:text-lg shrink-0">{(formIVSS.apellidos_nombres || 'P').charAt(0)}</div>
                      <div className="overflow-hidden pr-2">
                        <h2 className="text-base md:text-lg font-black leading-tight truncate">{formIVSS.apellidos_nombres || 'Paciente'}</h2>
                        <div className="flex gap-2 text-[10px] md:text-xs text-slate-500 font-medium mt-0.5"><span>C.I: {formIVSS.cedula || 'N/A'}</span></div>
                      </div>
                    </div>
                  </div>
                )}

                {/* BARRA SUPERIOR DEL EDITOR (CON SCROLL HORIZONTAL EN MÓVIL) */}
                <div className="no-print flex flex-col md:flex-row md:items-center justify-between p-4 md:p-6 border-b border-slate-200 dark:border-white/5 gap-3 md:gap-4 sticky top-0 z-40 bg-white/90 dark:bg-[#111111]/90 backdrop-blur-md shadow-sm shrink-0 overflow-hidden">
                  <div className="flex-shrink-0 w-full md:w-auto flex justify-between items-center">
                    <div>
                      <h3 className="text-lg md:text-xl font-bold leading-tight">Visor de Forma 15-108</h3>
                      <div className="flex items-center gap-2 text-[11px] md:text-sm text-slate-500 mt-0.5">
                        <span className="truncate">Documento <strong>{formatearFechaTexto(historiaData.fecha_consulta.split('T')[0]).split('a las')[0]}</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="-mx-4 px-4 md:mx-0 md:px-0 flex items-center gap-2 overflow-x-auto hide-scroll w-[calc(100%+2rem)] md:w-auto pb-2 md:pb-0 pt-1 md:pt-0 snap-x flex-nowrap">
                    {!esEspecialista && historiaData.id && (
                      <>
                        <button onClick={() => setIsRemitirModalOpen(true)} className="flex items-center justify-center gap-1.5 px-3 md:px-4 py-2 md:py-2.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-xl text-xs font-bold hover:bg-indigo-100 transition-colors whitespace-nowrap shrink-0 snap-start"><Send size={14} /> Remitir</button>
                        <button onClick={handleImprimirPDF} className="flex items-center justify-center gap-1.5 px-3 md:px-4 py-2 md:py-2.5 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-bold hover:bg-rose-100 transition-colors whitespace-nowrap shrink-0 snap-start"><Download size={14} /> PDF</button>
                      </>
                    )}
                    
                    <button onClick={() => { setIsModalConsultaOpen(false); setIsModoFoco(false); }} className="flex items-center justify-center gap-1.5 px-3 md:px-4 py-2 md:py-2.5 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold hover:bg-slate-100 dark:hover:bg-white/5 whitespace-nowrap shrink-0 snap-start">Volver</button>

                    {/* 🔥 BOTON DE GUARDAR 🔥 */}
                    <button onClick={handleGuardarHistoria} disabled={guardando || !historiaData.id_paciente} className="flex items-center justify-center gap-1.5 px-4 md:px-5 py-2 md:py-2.5 bg-[#10b981] hover:bg-[#059669] text-white rounded-xl text-xs md:text-sm font-bold shadow-md transition-transform transform hover:-translate-y-0.5 whitespace-nowrap shrink-0 snap-start relative">
                      {guardando ? 'Guardando...' : <><Save size={16} /> Guardar</>}
                    </button>
                    
                    {/* Espaciador final para asegurar que el scroll no corte el botón en móvil */}
                    <div className="w-2 shrink-0 md:hidden"></div>
                  </div>
                </div>

                {esEspecialista && (
                  <div className="no-print bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 px-4 md:px-6 py-2 md:py-3 text-[10px] md:text-xs font-bold flex items-center justify-center gap-2 border-b border-amber-200 dark:border-amber-900/50 text-center shrink-0">
                    <ShieldCheck size={16} className="shrink-0" /> Modo Seguro: Puedes llenar campos vacíos, la admisión está bloqueada.
                  </div>
                )}

                {/* EL DOCUMENTO TIPO HOJA DE PAPEL */}
                <div className="printable-form p-2 sm:p-6 md:p-10 bg-slate-200/50 dark:bg-[#0a0a0a]/50 overflow-auto custom-scrollbar flex-1 relative">
                  <div className="md:hidden sticky left-0 top-0 w-full text-center text-slate-400 dark:text-slate-500 text-[10px] font-bold mb-2 pt-2 animate-pulse bg-gradient-to-b from-slate-200/90 to-transparent dark:from-[#0a0a0a]/90 no-print z-10">
                    ← Desliza hacia los lados para ver completo →
                  </div>
                  <div className="min-w-[210mm] w-[210mm] mx-auto space-y-8 md:space-y-12 pb-10 print-pages bg-white shadow-xl md:shadow-2xl">
                    <Parte1 formIVSS={formIVSS} handleIVSSChange={handleIVSSChange} marcas={marcas} toggleMarca={toggleMarca} />
                    <Parte2 formIVSS={formIVSS} handleIVSSChange={handleIVSSChange} marcas={marcas} toggleMarca={toggleMarca} />
                    <Parte3 formIVSS={formIVSS} handleIVSSChange={handleIVSSChange} marcas={marcas} toggleMarca={toggleMarca} />
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>

        {/* PANTALLA DE BLOQUEO (CUENTA PENDIENTE) */}
        {userData?.estado_cuenta === 'Pendiente' && (
          <div className="absolute inset-0 z-[9000] bg-slate-100/60 dark:bg-[#050505]/70 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#111111] p-8 rounded-3xl shadow-2xl max-w-md w-full text-center border border-slate-200 dark:border-white/10 animate-[fadeIn_0.3s_ease-out]">
              <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-500 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-amber-50 dark:border-amber-900/10"><Lock size={36} /></div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-3">Cuenta en Revisión</h2>
              <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm leading-relaxed">Has iniciado sesión correctamente, pero tus funciones están bloqueadas de forma temporal.</p>
              <button onClick={handleLogout} className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-900 py-3 rounded-xl font-bold transition-colors">Cerrar Sesión</button>
            </div>
          </div>
        )}
      </main>

      {/* MODAL CREAR PACIENTE - MANTENIDO */}
      {isModalCrearOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out] no-print">
          <div className="bg-white dark:bg-[#111111] w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-4 md:p-6 border-b border-slate-200 dark:border-white/5"><h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white">Registrar Nuevo Paciente</h2><button onClick={() => setIsModalCrearOpen(false)} className="p-2 text-slate-400 hover:text-rose-500 bg-slate-100 dark:bg-white/5 rounded-full transition-colors"><X size={20} /></button></div>
            <div className="p-4 md:p-6 overflow-y-auto custom-scrollbar bg-slate-50/50 dark:bg-[#0a0a0a]/50">
              <form id="formPacienteN" onSubmit={handleGuardarPaciente} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
                  <div><label className="block text-xs font-bold mb-1.5 text-slate-700 dark:text-slate-300">Cédula</label><input type="text" name="cedula" value={formData.cedula} onChange={(e) => handleInputPacienteChange(e, false)} maxLength="12" className="w-full px-4 py-3 bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-[#0081a7] text-sm text-slate-900 dark:text-white" required /></div>
                  <div><label className="block text-xs font-bold mb-1.5 text-slate-700 dark:text-slate-300">Nombres *</label><input type="text" name="nombres" value={formData.nombres} onChange={(e) => handleInputPacienteChange(e, false)} required className="w-full px-4 py-3 bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-[#0081a7] text-sm text-slate-900 dark:text-white" /></div>
                  <div><label className="block text-xs font-bold mb-1.5 text-slate-700 dark:text-slate-300">Apellidos *</label><input type="text" name="apellidos" value={formData.apellidos} onChange={(e) => handleInputPacienteChange(e, false)} required className="w-full px-4 py-3 bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-[#0081a7] text-sm text-slate-900 dark:text-white" /></div>
                  <div><label className="block text-xs font-bold mb-1.5 text-slate-700 dark:text-slate-300">Fecha nacimiento *</label><input type="date" name="fecha_nacimiento" value={formData.fecha_nacimiento} onChange={(e) => handleInputPacienteChange(e, false)} required className="w-full px-4 py-3 bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-[#0081a7] text-sm text-slate-900 dark:text-white [&::-webkit-calendar-picker-indicator]:dark:invert" /></div>
                  <div><label className="block text-xs font-bold mb-1.5 text-slate-700 dark:text-slate-300">Sexo *</label><select name="sexo" value={formData.sexo} onChange={(e) => handleInputPacienteChange(e, false)} required className="w-full px-4 py-3 bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-[#0081a7] text-sm text-slate-900 dark:text-white"><option value="">Seleccione...</option><option value="Masculino">Masculino</option><option value="Femenino">Femenino</option></select></div>
                  <div><label className="block text-xs font-bold mb-1.5 text-slate-700 dark:text-slate-300">Teléfono</label><input type="text" name="telefono" value={formData.telefono} onChange={(e) => handleInputPacienteChange(e, false)} maxLength="12" className="w-full px-4 py-3 bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-[#0081a7] text-sm text-slate-900 dark:text-white" /></div>
                </div>
              </form>
            </div>
            <div className="p-4 md:p-6 border-t border-slate-200 dark:border-white/5 flex gap-3 justify-end bg-slate-50 dark:bg-[#111111] rounded-b-2xl">
              <button type="button" onClick={() => setIsModalCrearOpen(false)} className="px-5 py-2.5 rounded-xl font-bold bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 text-sm">Cancelar</button>
              <button type="submit" form="formPacienteN" disabled={guardando} className="bg-[#0081a7] text-white px-6 py-2.5 rounded-xl font-bold shadow-md text-sm">{guardando ? 'Guardando...' : 'Guardar Paciente'}</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        /* SCROLL HORIZONTAL INVISIBLE PARA BOTONES EN MOVIL */
        .hide-scroll::-webkit-scrollbar { display: none; }
        .hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }

        .custom-scrollbar::-webkit-scrollbar { height: 8px; width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 10px; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #3f3f46; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }
        
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