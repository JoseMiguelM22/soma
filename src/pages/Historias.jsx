import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { 
  Home, Users, FileText, Calendar, User, LogOut, 
  Menu, Sun, Moon, Plus, Search, X, PanelLeft, 
  Maximize, ArrowLeft, Edit3, Eye, Send, Download, ShieldCheck,
  CheckCircle, AlertCircle, Check
} from 'lucide-react';

import Parte1 from './Parte1';
import Parte2 from './Parte2';
import Parte3 from './Parte3';

export default function Historias() {
  const navigate = useNavigate();
  const location = useLocation(); 
  
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
  
  const [busquedaEspecialista, setBusquedaEspecialista] = useState(""); 
  const [dropdownAbierto, setDropdownAbierto] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [guardando, setGuardando] = useState(false);

  // 🔥 ESTADO PARA LAS NOTIFICACIONES FLOTANTES (TOAST) 🔥
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ visible: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, 4000);
  };

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

  const [initialFormSnapshot, setInitialFormSnapshot] = useState(null);
  const [initialMarcasSnapshot, setInitialMarcasSnapshot] = useState(null);

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

  useEffect(() => {
    if (location.state?.autoOpenConsulta && !loading) {
      const c = location.state.autoOpenConsulta;
      const pac = Array.isArray(c.pacientes) ? c.pacientes[0] : c.pacientes;
      
      if (pac) {
        setPacienteSeleccionado(pac);
        setTimeout(() => abrirEditorHistoria(c, pac.id), 100);
      }
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, loading, navigate, location.pathname]);

  const handleLogout = async () => { await supabase.auth.signOut(); navigate('/login'); };
  const getInitials = () => { if (!userData) return "AD"; return `${userData.nombres.charAt(0)}${userData.apellidos.charAt(0)}`.toUpperCase(); };
  
  const esEspecialista = userData && ['especialista', 'medico', 'médico'].includes((userData.rol || '').toLowerCase());

  const formatearFechaTexto = (fechaCompleta) => {
    if (!fechaCompleta) return '';
    const fecha = new Date(fechaCompleta);
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return `${String(fecha.getDate()).padStart(2, '0')} de ${meses[fecha.getMonth()]} de ${fecha.getFullYear()} a las ${String(fecha.getHours()).padStart(2, '0')}:${String(fecha.getMinutes()).padStart(2, '0')}`;
  };

  const handleIVSSChange = (e) => {
    const { name, value } = e.target;
    if (esEspecialista && initialFormSnapshot && initialFormSnapshot[name] && initialFormSnapshot[name] !== '') {
      return; 
    }
    setFormIVSS(prev => ({ ...prev, [name]: value }));
  };

  const toggleMarca = (id) => {
    if (esEspecialista && initialMarcasSnapshot && initialMarcasSnapshot[id]) {
      return; 
    }
    setMarcas(prev => ({ ...prev, [id]: !prev[id] ? 'X' : (prev[id] === 'X' ? '√' : '') }));
  };

  const verHistorialPaciente = (paciente) => { setPacienteSeleccionado(paciente); setIsModalConsultaOpen(false); };

  const abrirEditorHistoria = (consulta = null, idPacienteForzado = null) => {
    if (consulta) {
      setHistoriaData({ id: consulta.id, id_paciente: consulta.id_paciente, fecha_consulta: consulta.fecha_consulta ? consulta.fecha_consulta.slice(0, 16) : consulta.created_at.slice(0, 16), proxima_consulta: consulta.proxima_consulta || '', consultorio: consulta.consultorio || '' });
      if (consulta.datos_formulario) {
        const parsed = typeof consulta.datos_formulario === 'string' ? JSON.parse(consulta.datos_formulario) : consulta.datos_formulario;
        
        const loadedForm = parsed.formIVSS || initialFormIVSS;
        const loadedMarcas = parsed.marcas || {};
        
        setFormIVSS(loadedForm); 
        setMarcas(loadedMarcas);
        
        setInitialFormSnapshot(loadedForm);
        setInitialMarcasSnapshot(loadedMarcas);
        
      } else { 
        setFormIVSS(initialFormIVSS); 
        setMarcas({}); 
        setInitialFormSnapshot(initialFormIVSS);
        setInitialMarcasSnapshot({});
      }
    } else {
      setHistoriaData({ id: null, id_paciente: idPacienteForzado || (pacienteSeleccionado ? pacienteSeleccionado.id : ''), fecha_consulta: new Date().toISOString().slice(0, 16), proxima_consulta: '', consultorio: '' });
      setFormIVSS(initialFormIVSS); 
      setMarcas({});
      setInitialFormSnapshot(initialFormIVSS);
      setInitialMarcasSnapshot({});
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
      let dataToOpen = null;

      if (historiaData.id) { 
        const res = await supabase.from('consultas').update(payload).eq('id', historiaData.id).select('*, pacientes(*)').single(); 
        error = res.error; 
        dataToOpen = res.data;
      } else { 
        const res = await supabase.from('consultas').insert([payload]).select('*, pacientes(*)').single(); 
        error = res.error; 
        dataToOpen = res.data;
      }

      if (error) throw error;
      await fetchData(); 

      showToast(esEspecialista ? "¡Cambios guardados y consulta completada!" : "¡Formato guardado exitosamente!", "success");

      // 🔥 LÓGICA DE REDIRECCIÓN A INICIO PARA EL ESPECIALISTA 🔥
      if (esEspecialista) {
        setTimeout(() => {
          navigate('/dashboard'); 
        }, 1500); 
      } else {
        if (dataToOpen) {
          const pac = Array.isArray(dataToOpen.pacientes) ? dataToOpen.pacientes[0] : dataToOpen.pacientes;
          if (pac && !pacienteSeleccionado) {
            setPacienteSeleccionado(pac);
          }
          abrirEditorHistoria(dataToOpen, pac ? pac.id : historiaData.id_paciente);
        }
      }

    } catch (error) { 
      showToast("Error al guardar: " + error.message, "error"); 
    } finally { setGuardando(false); }
  };

  const handleConfirmarRemision = async () => {
    setGuardando(true);
    try {
      const { error } = await supabase.from('consultas').update({ id_medico: especialistaSelect, estado: 'En Espera' }).eq('id', historiaData.id);
      if (error) throw error;
      
      setIsRemitirModalOpen(false); 
      setEspecialistaSelect(""); 
      setBusquedaEspecialista(""); 
      fetchData(); 

      showToast("¡Historia remitida al especialista correctamente!", "success");
    } catch (error) { 
      showToast("Error al remitir la historia.", "error"); 
    } finally { setGuardando(false); }
  };

  const handleImprimirPDF = () => window.print();

  const agrupadasFiltradas = historiasAgrupadas.filter(item => {
    const term = busqueda.toLowerCase();
    return item.paciente.nombres.toLowerCase().includes(term) || item.paciente.apellidos.toLowerCase().includes(term) || (item.paciente.cedula && item.paciente.cedula.includes(term));
  });

  const especialistasFiltrados = listaEspecialistas.filter(med => {
    const searchTerm = busquedaEspecialista.toLowerCase();
    const nombreCompleto = `${med.nombres || ''} ${med.apellidos || ''}`.toLowerCase();
    const especialidad = (med.especialidad || '').toLowerCase();
    return nombreCompleto.includes(searchTerm) || especialidad.includes(searchTerm);
  });

  const consultasDelPaciente = pacienteSeleccionado ? consultas.filter(c => c.id_paciente === pacienteSeleccionado.id) : [];

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-[#0B0D12] text-slate-800 dark:text-slate-200 font-sans overflow-hidden transition-colors duration-300 antialiased tracking-normal">
      {isSidebarOpen && <div className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm transition-opacity no-print" onClick={() => setIsSidebarOpen(false)} />}

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

      {/* MODAL REMITIR ESPECIALISTA */}
      {isRemitirModalOpen && !esEspecialista && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 no-print">
          <div className="bg-white dark:bg-[#16161a] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl w-full max-w-md animate-[fadeIn_0.2s_ease-out]">
            
            <div className="p-6 border-b border-slate-200 dark:border-white/5 rounded-t-2xl">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Remitir Historia a Especialista</h3>
              <p className="text-sm text-slate-500 mt-1">Selecciona el médico evaluador.</p>
            </div>
            
            <div className="p-6">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Especialista disponible</label>
              
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  placeholder="Buscar por nombre o especialidad..."
                  value={busquedaEspecialista}
                  onChange={(e) => {
                    setBusquedaEspecialista(e.target.value);
                    setEspecialistaSelect(""); 
                    setDropdownAbierto(true);
                  }}
                  onFocus={() => setDropdownAbierto(true)}
                  onBlur={() => setTimeout(() => setDropdownAbierto(false), 200)} 
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl outline-none text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all"
                />

                {dropdownAbierto && (
                  <ul className="absolute z-50 w-full mt-2 max-h-48 overflow-y-auto bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl shadow-2xl custom-scrollbar">
                    {especialistasFiltrados.length > 0 ? (
                      especialistasFiltrados.map(med => (
                        <li 
                          key={med.id_auth}
                          onClick={() => {
                            setEspecialistaSelect(med.id_auth);
                            setBusquedaEspecialista(`Dr(a). ${med.nombres} ${med.apellidos}`);
                            setDropdownAbierto(false);
                          }}
                          className="px-4 py-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 border-b border-slate-100 dark:border-white/5 last:border-0 transition-colors"
                        >
                          <div className="font-bold text-sm text-slate-900 dark:text-white">Dr(a). {med.nombres} {med.apellidos}</div>
                          <div className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">{med.especialidad || 'Sin especialidad'}</div>
                        </li>
                      ))
                    ) : (
                      <li className="px-4 py-3 text-sm text-slate-500 text-center">No se encontraron especialistas</li>
                    )}
                  </ul>
                )}
              </div>
            </div>
            
            <div className="p-4 bg-slate-50 dark:bg-[#111111] border-t border-slate-200 dark:border-white/5 flex justify-end gap-3 rounded-b-2xl">
              <button 
                onClick={() => {
                  setIsRemitirModalOpen(false);
                  setBusquedaEspecialista(""); 
                  setEspecialistaSelect("");
                }} 
                className="px-4 py-2 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleConfirmarRemision} 
                disabled={!especialistaSelect || guardando} 
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-md transition-colors disabled:opacity-50"
              >
                {guardando ? 'Remitiendo...' : 'Confirmar Remisión'}
              </button>
            </div>
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
        
        {/* ================= PERFIL DE USUARIO UNIFICADO ================= */}
        <div className={`p-4 border-t border-slate-200 dark:border-white/5 flex flex-col ${isCollapsed ? 'items-center' : ''}`}>
          <div className={`flex items-center gap-3 mb-4 ${isCollapsed ? 'justify-center' : 'px-2'}`}>
            <div className="w-8 h-8 shrink-0 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-700 dark:text-white border border-slate-300 dark:border-white/20">
              {userData ? getInitials() : '...'}
            </div>
            {!isCollapsed && (
              <div className="overflow-hidden">
                <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-tight">
                  {userData && ['especialista', 'medico', 'médico'].includes((userData.rol || '').toLowerCase()) ? 'ESPECIALISTA' : 'DPTO. HISTORIAS'}
                </p>
                <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight truncate">
                  {userData && ['especialista', 'medico', 'médico'].includes((userData.rol || '').toLowerCase()) ? 'Dr(a). ' : ''}{userData ? `${userData.nombres} ${userData.apellidos}` : 'Cargando...'}
                </p>
              </div>
            )}
          </div>
          <div className={`p-4 border-t border-slate-200 dark:border-white/5 flex flex-col gap-2 ${isCollapsed ? 'items-center' : ''}`}>
  
  {/* NUEVO BOTÓN DE PERFIL */}
  <Link to="/perfil" className={`flex items-center gap-3 py-2 w-full text-slate-500 dark:text-slate-400 hover:text-[#0081a7] hover:bg-cyan-50 dark:hover:bg-cyan-500/10 rounded-lg font-bold transition-colors ${isCollapsed ? 'justify-center px-0' : 'px-3'}`}>
    <User size={20} className="shrink-0" />{!isCollapsed && <span className="whitespace-nowrap">Mi Perfil</span>}
  </Link>

  {/* TU BOTÓN DE CERRAR SESIÓN (Ya lo tienes) */}
  <button onClick={handleLogout} className={`flex items-center gap-3 py-2 w-full text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg font-bold transition-colors ${isCollapsed ? 'justify-center px-0' : 'px-3'}`}>
    <LogOut size={20} className="shrink-0" />{!isCollapsed && <span className="whitespace-nowrap">Cerrar Sesión</span>}
  </button>

</div>
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
                  {!esEspecialista && (<button onClick={() => abrirEditorHistoria(null)} className="bg-white text-[#0081a7] hover:bg-slate-50 px-5 py-2.5 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 transform hover:-translate-y-0.5"><Plus size={18} /> Nueva historia 15-108</button>)}
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
                    {!esEspecialista && (
                      <button onClick={() => abrirEditorHistoria(null, pacienteSeleccionado.id)} className="bg-white text-[#0081a7] hover:bg-slate-50 px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2 transform hover:-translate-y-0.5"><Plus size={18} /> Nuevo Formato 15-108</button>
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
                            <td className="px-4 py-4 text-right"><button onClick={() => abrirEditorHistoria(c)} className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold hover:bg-slate-50 dark:hover:bg-white/5 transition-colors ml-auto"><Edit3 size={14} /> Abrir Forma 15-108</button></td>
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
                    
                    {esEspecialista ? (
                      <button onClick={handleGuardarHistoria} disabled={guardando || !historiaData.id_paciente} className="flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 transition-colors text-white rounded-xl text-xs font-bold">{guardando ? 'Procesando...' : <><Check size={14} /> Completar Consulta</>}</button>
                    ) : (
                      <button onClick={handleGuardarHistoria} disabled={guardando || !historiaData.id_paciente} className="flex items-center gap-1.5 px-5 py-2 bg-[#0081a7] text-white rounded-xl text-xs font-bold">{guardando ? 'Guardando...' : <><Check size={14} /> Guardar Cambios</>}</button>
                    )}
                  </div>
                </div>

                {/* 🔥 BANNER INFORMATIVO PARA EL MÉDICO 🔥 */}
                {esEspecialista && (
                  <div className="no-print bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 px-6 py-3 text-[11px] md:text-xs font-bold flex items-center justify-center gap-2 border-b border-amber-200 dark:border-amber-900/50">
                    <ShieldCheck size={16} className="shrink-0" /> Modo Seguro: Puedes llenar los campos vacíos, pero la información previamente registrada por admisión está bloqueada.
                  </div>
                )}

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
          {/* ================= PANTALLA DE BLOQUEO (CUENTA PENDIENTE) ================= */}
{userData?.estado_cuenta === 'Pendiente' && (
  <div className="absolute inset-0 z-[9000] bg-slate-100/60 dark:bg-[#050505]/70 backdrop-blur-md flex items-center justify-center p-4">
    <div className="bg-white dark:bg-[#111111] p-8 rounded-3xl shadow-2xl max-w-md w-full text-center border border-slate-200 dark:border-white/10 animate-[fadeIn_0.3s_ease-out]">
      <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-500 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-amber-50 dark:border-amber-900/10">
        {/* Asegúrate de tener importado el ícono Lock de lucide-react en el archivo */}
        <Lock size={36} />
      </div>
      <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-3">Cuenta en Revisión</h2>
      <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm leading-relaxed">
        Has iniciado sesión correctamente, pero tus funciones están bloqueadas de forma temporal. La directiva debe verificar tus credenciales y aprobar tu cuenta para que puedas interactuar con el sistema.
      </p>
      <button 
        onClick={handleLogout} 
        className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-900 py-3 rounded-xl font-bold transition-colors"
      >
        Cerrar Sesión
      </button>
    </div>
  </div>
)}
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