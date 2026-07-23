import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { 
  Home, Users, FileText, Calendar, LogOut, 
  Menu, Sun, Moon, PanelLeft, Clock, ArrowLeft, CheckCircle, 
  CalendarDays, FilePlus, Clipboard, X, ChevronDown, AlertCircle, CheckCircle2, Check
} from 'lucide-react';

// === IMPORTAMOS TUS COMPONENTES ===
import Parte1 from './Parte1';
import Parte2 from './Parte2';
import Parte3 from './Parte3';

export default function DashboardAdmision() {
  const navigate = useNavigate();
  
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [saludo, setSaludo] = useState('Hola');
  const [vistaActual, setVistaActual] = useState('inicio');
  const [showFormatos, setShowFormatos] = useState(false); // Estado para el menú de formatos

  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  
  const [citasHoy, setCitasHoy] = useState([]);
  const [citasProximas, setCitasProximas] = useState([]);
  const [listaMedicos, setListaMedicos] = useState([]);

  // ESTADO MASIVO DEL FORMULARIO 15-108
  const [formIVSS, setFormIVSS] = useState({
    centro_asistencial: '', historia_n: '', servicio: '', piso: '', ala: '', sala_cuarto: '', cama: '',
    apellidos_nombres: '', cedula: '', sexo: '', edad: '', edo_civil: '', lugar_nacimiento: '', fecha_nacimiento: '', nacionalidad: '', ocupacion: '', direccion_habitacion: '',
    emergencia_nombre: '', emergencia_parentesco: '', emergencia_direccion: '', fecha_ingreso: new Date().toISOString().split('T')[0], hora_ingreso: '', fecha_admision_anterior: '',
    motivo_ingreso: '', enfermedad_actual: '', diagnostico_provisional: '', diagnostico_clinico_final: '', diagnostico_anatomo: '',
    temperatura: '', pulso: '', respiracion: '', ta_mx: '', ta_mn: '', peso: '', talla: '',
    desc_parte2_1: '', desc_parte2_2: '', desc_parte3_1: '', desc_parte3_2: '',
    fecha_autorizacion1: '', firma_autorizacion1: '', testigo_autorizacion1: '', parentesco_autorizacion1: '',
    fecha_autorizacion2: '', firma_autorizacion2: '', testigo_autorizacion2: '', parentesco_autorizacion2: '',
    fecha_examen: '', examen_practicado_por: '', diagnostico_servicio: ''
  });

  const [marcas, setMarcas] = useState({});

  useEffect(() => { document.documentElement.classList.toggle('dark', isDarkMode); }, [isDarkMode]);

  useEffect(() => {
    const hora = new Date().getHours();
    if (hora >= 5 && hora < 12) setSaludo('¡Buenos días');
    else if (hora >= 12 && hora < 19) setSaludo('¡Buenas tardes');
    else setSaludo('¡Buenas noches');
  }, []);

  const fetchData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return navigate('/login');

    const { data: dbUser } = await supabase.from('usuarios').select('*').eq('id_auth', session.user.id).single();
    if (dbUser?.rol === 'especialista') return navigate('/dashboard');
    setUserData(dbUser);

    const hoyInicio = new Date(); hoyInicio.setHours(0,0,0,0);
    const { data: todasLasCitas } = await supabase.from('consultas').select(`*, pacientes (id, nombres, apellidos)`).gte('fecha_consulta', hoyInicio.toISOString()).order('fecha_consulta', { ascending: true });

    if (todasLasCitas) {
      const hoy = new Date();
      setCitasHoy(todasLasCitas.filter(c => { const d = new Date(c.fecha_consulta); return d.getDate() === hoy.getDate() && d.getMonth() === hoy.getMonth() && d.getFullYear() === hoy.getFullYear(); }));
      setCitasProximas(todasLasCitas.filter(c => { const d = new Date(c.fecha_consulta); const hoyFin = new Date(); hoyFin.setHours(23,59,59,999); return d > hoyFin; }));
    }

    const { data: todosLosUsuarios } = await supabase.from('usuarios').select('*');
    if (todosLosUsuarios) {
      const soloMedicos = todosLosUsuarios.filter(user => {
        const rol = (user.rol || '').toLowerCase();
        return (rol === 'especialista' || rol === 'medico' || rol === 'médico');
      });
      setListaMedicos(soloMedicos);
    }

    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [navigate]);

  const handleLogout = async () => { await supabase.auth.signOut(); navigate('/login'); };
  const getInitials = () => { if (!userData) return "AS"; return `${userData.nombres?.charAt(0) || ''}${userData.apellidos?.charAt(0) || ''}`.toUpperCase(); };

  // ================= CALCULADORA DE ALERTAS DE TIEMPO (VENEZUELA) =================
  const getAlertaCita = (fechaStr) => {
    if (!fechaStr) return { texto: "Sin hora", color: "text-slate-500", bg: "bg-slate-500/10", alert: false };
    
    const ahora = new Date();
    const cita = new Date(fechaStr);
    const diffMinutos = Math.round((cita - ahora) / (1000 * 60)); 

    const horaFormateada = cita.toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' });

    if (diffMinutos < -60) return { texto: `${horaFormateada} (Pasó hace >1h)`, color: 'text-slate-500', bg: 'bg-slate-500/10', alert: false };
    if (diffMinutos < 0) return { texto: `${horaFormateada} (Retrasado ${Math.abs(diffMinutos)} min)`, color: 'text-rose-500', bg: 'bg-rose-500/10', alert: true };
    if (diffMinutos <= 30) return { texto: `${horaFormateada} (En ${diffMinutos} min)`, color: 'text-amber-500', bg: 'bg-amber-500/10', alert: true };
    
    const horas = Math.floor(diffMinutos / 60);
    const mins = diffMinutos % 60;
    return { texto: `${horaFormateada} (En ${horas}h ${mins}m)`, color: 'text-emerald-500', bg: 'bg-emerald-500/10', alert: false };
  };

  // ================= ACCIONES DE ESTADO =================
  const handleMarcarLlegada = async (consultaId) => {
    try {
      const { error } = await supabase.from('consultas').update({ estado: 'En Espera' }).eq('id', consultaId);
      if (error) throw error; fetchData(); 
    } catch (error) { alert("Error al marcar llegada: " + error.message); }
  };

  const handleMarcarAtendido = async (consultaId) => {
    try {
      const { error } = await supabase.from('consultas').update({ estado: 'Completada' }).eq('id', consultaId);
      if (error) throw error; fetchData(); 
    } catch (error) { alert("Error al marcar como atendido: " + error.message); }
  };

  // ================= MANEJADORES DE FORMATO =================
  const handleIVSSChange = (e) => setFormIVSS(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const toggleMarca = (id) => {
    setMarcas(prev => {
      const actual = prev[id];
      return { ...prev, [id]: !actual ? 'X' : (actual === 'X' ? '√' : '') };
    });
  };

  const generarHTMLParaMedico = () => {
    let hallazgosAnormales = '';
    Object.keys(marcas).forEach(key => {
      if(marcas[key] === 'X' && !['sexo_f','sexo_m','nac_v','nac_e','egreso_cur','egreso_mej','egreso_mue','egreso_aut'].includes(key)) {
        hallazgosAnormales += `<li><b>${key}</b></li>`;
      }
    });

    return `
      <div style="font-family: Arial, sans-serif; font-size: 14px; color: #000; max-width: 800px;">
        <h3 style="text-align: center; border-bottom: 2px solid #000; padding-bottom: 5px;">HISTORIA CLÍNICA (Forma 15-108)</h3>
        <p><b>CENTRO ASISTENCIAL:</b> ${formIVSS.centro_asistencial} | <b>HISTORIA Nº:</b> ${formIVSS.historia_n}</p>
        <p><b>SERVICIO:</b> ${formIVSS.servicio} | <b>PISO:</b> ${formIVSS.piso} | <b>ALA:</b> ${formIVSS.ala} | <b>SALA/CUARTO:</b> ${formIVSS.sala_cuarto} | <b>CAMA:</b> ${formIVSS.cama}</p>
        <h4 style="background-color: #f0f0f0; padding: 5px; margin-top: 15px;">MOTIVO(S) DE INGRESO</h4>
        <p>${formIVSS.motivo_ingreso || 'No indicado.'}</p>
        <h4 style="background-color: #f0f0f0; padding: 5px;">ENFERMEDAD ACTUAL</h4>
        <p>${formIVSS.enfermedad_actual || 'No indicado.'}</p>
        <h4 style="background-color: #f0f0f0; padding: 5px;">SIGNOS VITALES</h4>
        <table border="1" style="width: 100%; border-collapse: collapse; text-align: center;">
          <tr>
            <td style="padding: 5px;"><b>TEMP:</b> ${formIVSS.temperatura}°C</td><td style="padding: 5px;"><b>PULSO:</b> ${formIVSS.pulso}</td>
            <td style="padding: 5px;"><b>RESP:</b> ${formIVSS.respiracion}</td><td style="padding: 5px;"><b>T.A:</b> ${formIVSS.ta_mx}/${formIVSS.ta_mn}</td>
            <td style="padding: 5px;"><b>PESO:</b> ${formIVSS.peso}Kgs</td>
          </tr>
        </table>
        <h4 style="background-color: #f0f0f0; padding: 5px;">HALLAZGOS ANORMALES</h4>
        <ul>${hallazgosAnormales || '<li>Ningún hallazgo anormal reportado en la admisión.</li>'}</ul>
        <br><br><br>
        <h4 style="border-bottom: 1px solid #000;">DIAGNÓSTICO PROVISIONAL (A Llenar por Especialista)</h4><br><br>
        <h4 style="border-bottom: 1px solid #000;">PLAN Y TRATAMIENTO (A Llenar por Especialista)</h4><br><br>
      </div>
    `;
  };

  const handleGuardarHistoria = async (e) => {
    e.preventDefault();
    if (!formIVSS.cedula || !formIVSS.apellidos_nombres) return alert("¡Epa! Debes escribir al menos la Cédula y los Apellidos/Nombres del paciente en la hoja para poder guardar.");
    setGuardando(true);

    try {
      let pacienteId = null;
      const { data: pacientesExistentes, error: errBusqueda } = await supabase.from('pacientes').select('id').eq('cedula', formIVSS.cedula);
      if (errBusqueda) throw errBusqueda;

      if (pacientesExistentes && pacientesExistentes.length > 0) {
        pacienteId = pacientesExistentes[0].id;
      } else {
        let nombresDB = ''; let apellidosDB = ''; 
        if (formIVSS.apellidos_nombres.includes(" ")) {
          const partes = formIVSS.apellidos_nombres.trim().split(" ");
          if (partes.length === 2) { nombresDB = partes[0]; apellidosDB = partes[1]; } 
          else if (partes.length === 3) { nombresDB = partes[0] + " " + partes[1]; apellidosDB = partes[2]; } 
          else { const mitad = Math.ceil(partes.length / 2); nombresDB = partes.slice(0, mitad).join(" "); apellidosDB = partes.slice(mitad).join(" "); }
        } else { nombresDB = formIVSS.apellidos_nombres; apellidosDB = "-"; }

        const sexoStr = marcas['sexo_m'] === 'X' ? 'Masculino' : (marcas['sexo_f'] === 'X' ? 'Femenino' : null);
        
        let fechaNacDB = null;
        if (formIVSS.fecha_nacimiento) {
          const matchFecha = formIVSS.fecha_nacimiento.trim().match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
          if (matchFecha) fechaNacDB = `${matchFecha[3]}-${matchFecha[2].padStart(2, '0')}-${matchFecha[1].padStart(2, '0')}`;
          else fechaNacDB = formIVSS.fecha_nacimiento;
        }
        
        const { data: nuevoPaciente, error: errCrear } = await supabase.from('pacientes').insert([{ nombres: nombresDB, apellidos: apellidosDB, cedula: formIVSS.cedula, sexo: sexoStr, fecha_nacimiento: fechaNacDB }]).select().single();
        if (errCrear) throw errCrear;
        pacienteId = nuevoPaciente.id;
        await supabase.from('historias_clinicas').insert([{ id_paciente: pacienteId }]);
      }

      const idMedicoTemporal = listaMedicos.length > 0 ? listaMedicos[0].id_auth : userData?.id_auth;
      const htmlParaMedico = generarHTMLParaMedico();
      const fechaIngreso = formIVSS.fecha_ingreso || new Date().toISOString().split('T')[0];
      const horaIngreso = formIVSS.hora_ingreso || '00:00';
      const signosFormateados = `TA: ${formIVSS.ta_mx}/${formIVSS.ta_mn} | FC: ${formIVSS.pulso} | FR: ${formIVSS.respiracion} | Temp: ${formIVSS.temperatura}°C | Peso: ${formIVSS.peso}kg`;

      const { error: errConsulta } = await supabase.from('consultas').insert([{
        id_paciente: pacienteId, id_medico: idMedicoTemporal, estado: 'En Espera', 
        motivo: formIVSS.motivo_ingreso || 'Ingreso Forma 15-108', signos_vitales: signosFormateados,
        fecha_consulta: new Date(`${fechaIngreso}T${horaIngreso}:00`).toISOString(),
        nota_clinica: htmlParaMedico, datos_formulario: { formIVSS, marcas }
      }]);

      if (errConsulta) throw errConsulta;

      alert('¡Formato Forma 15-108 Guardado Correctamente en la Historia Clínica del Paciente!');
      setFormIVSS({
        centro_asistencial: '', historia_n: '', servicio: '', piso: '', ala: '', sala_cuarto: '', cama: '',
        apellidos_nombres: '', cedula: '', sexo: '', edad: '', edo_civil: '', lugar_nacimiento: '', fecha_nacimiento: '', nacionalidad: '', ocupacion: '', direccion_habitacion: '',
        emergencia_nombre: '', emergencia_parentesco: '', emergencia_direccion: '', fecha_ingreso: new Date().toISOString().split('T')[0], hora_ingreso: '', fecha_admision_anterior: '',
        motivo_ingreso: '', enfermedad_actual: '', diagnostico_provisional: '', diagnostico_clinico_final: '', diagnostico_anatomo: '',
        temperatura: '', pulso: '', respiracion: '', ta_mx: '', ta_mn: '', peso: '', talla: '', desc_parte2_1: '', desc_parte2_2: '', desc_parte3_1: '', desc_parte3_2: '',
        fecha_autorizacion1: '', firma_autorizacion1: '', testigo_autorizacion1: '', parentesco_autorizacion1: '', fecha_autorizacion2: '', firma_autorizacion2: '', testigo_autorizacion2: '', parentesco_autorizacion2: '',
        fecha_examen: '', examen_practicado_por: '', diagnostico_servicio: ''
      });
      setMarcas({});
      setVistaActual('inicio');
      fetchData(); 

    } catch (error) { alert("Error al guardar formato: " + error.message); } finally { setGuardando(false); }
  };

  return (
    <div className="flex h-screen bg-[#0B0D12] text-slate-200 font-sans overflow-hidden transition-colors duration-300 antialiased tracking-normal">
      {isSidebarOpen && <div className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />}
      
      {/* ================= SIDEBAR ================= */}
      <aside className={`fixed inset-y-0 left-0 z-50 bg-[#16161a] border-r border-white/[0.04] flex flex-col justify-between transform transition-all duration-300 ease-in-out md:relative md:translate-x-0 md:m-4 md:mr-0 md:rounded-3xl shadow-none ${isSidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64'} ${isCollapsed ? 'md:w-24' : 'md:w-68'}`}>
        <div>
          <div className={`h-20 flex items-center transition-all ${isCollapsed ? 'justify-center' : 'justify-between px-6'}`}>
            <Link className="flex items-center overflow-hidden whitespace-nowrap" to="/admision">
              {isCollapsed ? <span className="text-blue-500 text-3xl mb-1 font-black">*</span> : <><img src="/soma_logo_blanco.png" alt="SOMA Logo" className="h-6 object-contain" /></>}
            </Link>
            {!isCollapsed && <button className="md:hidden text-slate-400 hover:text-rose-500" onClick={() => setIsSidebarOpen(false)}><X size={20}/></button>}
          </div>
          <div className={`py-4 ${isCollapsed ? 'px-3' : 'px-4'}`}>
            {!isCollapsed && <p className="text-[10px] font-bold text-slate-500 mb-3 px-3 tracking-widest uppercase">Herramientas</p>}
            <nav className="space-y-1.5">
              <Link className={`flex items-center gap-3 py-3 bg-white/10 text-white rounded-xl font-bold transition-all ${isCollapsed ? 'justify-center px-0' : 'px-4'}`} to="/admision"><Home className="shrink-0" size={20}/>{!isCollapsed && <span className="text-sm">Inicio</span>}</Link>
              <Link className={`flex items-center gap-3 py-3 text-slate-400 hover:bg-white/[0.03] hover:text-slate-200 rounded-xl font-medium transition-all ${isCollapsed ? 'justify-center px-0' : 'px-4'}`} to="/pacientes"><Users className="shrink-0" size={20}/>{!isCollapsed && <span className="text-sm">Pacientes</span>}</Link>
              <Link className={`flex items-center gap-3 py-3 text-slate-400 hover:bg-white/[0.03] hover:text-slate-200 rounded-xl font-medium transition-all ${isCollapsed ? 'justify-center px-0' : 'px-4'}`} to="/historias"><FileText className="shrink-0" size={20}/>{!isCollapsed && <span className="text-sm">Historias Clínicas</span>}</Link>
              <Link className={`flex items-center gap-3 py-3 text-slate-400 hover:bg-white/[0.03] hover:text-slate-200 rounded-xl font-medium transition-all ${isCollapsed ? 'justify-center px-0' : 'px-4'}`} to="/agenda"><Calendar className="shrink-0" size={20}/>{!isCollapsed && <span className="text-sm">Agenda</span>}</Link>
            </nav>
          </div>
        </div>
        <div className={`p-4 border-t border-white/[0.04] flex flex-col ${isCollapsed ? 'items-center' : ''}`}>
          <div className={`flex items-center gap-3 mb-3 ${isCollapsed ? 'justify-center' : 'px-2'}`}>
            <div className="w-9 h-9 shrink-0 rounded-full bg-white/90 text-slate-900 flex items-center justify-center text-xs font-bold">{getInitials()}</div>
            {!isCollapsed && (
              <div className="overflow-hidden">
                <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Dpto. Historias</p>
                <p className="text-sm font-bold text-white truncate">{userData?.nombres || 'Asistente'} {userData?.apellidos || ''}</p>
              </div>
            )}
          </div>
          <button onClick={handleLogout} className={`flex items-center gap-3 py-2.5 w-full text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl font-medium transition-colors ${isCollapsed ? 'justify-center px-0' : 'px-3'}`}><LogOut className="shrink-0" size={18}/>{!isCollapsed && <span className="text-sm">Cerrar Sesión</span>}</button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden w-full relative bg-[#050505]">
        <header className="h-16 flex items-center justify-between px-6 lg:px-8 border-b border-white/5 bg-[#111111]/80 backdrop-blur-sm sticky top-0 z-30 shrink-0">
          <div className="flex items-center gap-4">
            <button className="text-slate-400 hover:text-blue-600 md:hidden p-2 rounded-xl" onClick={() => setIsSidebarOpen(true)}><Menu size={22}/></button>
            <button className="hidden md:flex p-2.5 text-slate-400 hover:text-white rounded-xl bg-white/5 border border-white/10" onClick={() => setIsCollapsed(!isCollapsed)}><PanelLeft size={18}/></button>
          </div>
          <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2.5 text-yellow-400 bg-white/5 border border-white/10 rounded-xl"><Moon size={18}/></button>
        </header>

        <div className="flex-1 overflow-y-auto w-full custom-scrollbar pb-10">
          
          {/* ================= VISTA 1: DASHBOARD INICIO ================= */}
          {vistaActual === 'inicio' && (
            <div className="p-6 sm:p-8 space-y-8 animate-[fadeIn_0.3s_ease-out] max-w-[1400px] mx-auto">
              <div className="flex flex-row items-center justify-between gap-4">
                <div className="flex-1">
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-[1.1]">
                    {saludo} <br className="hidden sm:block" /> Asistente {userData?.apellidos || ''}!
                  </h2>
                </div>
                <div className="shrink-0"><img src="/ruta-mascota-doctora-der.svg" alt="Asistente SOMA" className="w-20 sm:w-28 md:w-32 drop-shadow-[0_10px_15px_rgba(0,0,0,0.3)] pointer-events-none transition-transform hover:scale-105" /></div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white tracking-tight">Acciones Rápidas</h3>
                
                {/* === BOTONERA DE ACCIONES RÁPIDAS (TIPO ESPECIALISTA) === */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full relative">
                  
                  {/* Botón desplegable Crear Historia (Verde) */}
                  <div className="relative w-full">
                    <button onClick={() => setShowFormatos(!showFormatos)} className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-[#10b981] hover:bg-[#059669] text-white rounded-xl font-bold shadow-md hover:-translate-y-1 transition-transform">
                      <FilePlus size={20}/> <span className="text-sm sm:text-base">Crear Historia</span> <ChevronDown size={18} className={`transition-transform ${showFormatos ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {showFormatos && (
                      <div className="absolute top-full left-0 mt-2 w-full bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 animate-[fadeIn_0.2s_ease-out]">
                         <div className="px-4 py-3 border-b border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-[#111111]">
                           <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Formatos Disponibles</span>
                         </div>
                         <button 
                            onClick={() => { setVistaActual('crear_historia'); setShowFormatos(false); }} 
                            className="w-full text-left px-5 py-4 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors flex flex-col gap-1 border-l-4 border-transparent hover:border-[#10b981]"
                          >
                           <div className="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-white">
                             <Clipboard size={16} className="text-[#10b981]"/> Forma 15-108 (IVSS)
                           </div>
                           <p className="text-xs text-slate-500 dark:text-slate-400 pl-6">Formato oficial de 6 páginas para admisión clínica.</p>
                         </button>
                      </div>
                    )}
                  </div>

                  {/* Accesos Directos - Historias (Azul) */}
                  <button onClick={() => navigate('/historias')} className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-[#3b82f6] hover:bg-[#2563eb] text-white rounded-xl font-bold shadow-md hover:-translate-y-1 transition-transform">
                    <FileText size={20} /> <span className="text-sm sm:text-base">Historias Clínicas</span>
                  </button>

                  {/* Accesos Directos - Agenda (Morado) */}
                  <button onClick={() => navigate('/agenda')} className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white rounded-xl font-bold shadow-md hover:-translate-y-1 transition-transform">
                    <Calendar size={20} /> <span className="text-sm sm:text-base">Agenda</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* PANEL PACIENTES DE HOY */}
                <div className="bg-[#16161a] border border-white/[0.04] rounded-[2rem] p-8 flex flex-col shadow-sm min-h-[380px] max-h-[600px]">
                  <div className="flex justify-between items-center mb-6 border-b border-white/[0.04] pb-4 shrink-0">
                    <h3 className="flex items-center gap-2 text-base font-bold text-white"><Clock className="text-[#b0ff4c]" size={20}/> Pacientes de Hoy</h3>
                    <span className="text-xs font-bold bg-[#b0ff4c]/20 text-[#b0ff4c] px-3 py-1 rounded-full">{citasHoy.length} citas</span>
                  </div>
                  <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar pr-2">
                    {citasHoy.length === 0 ? (
                      <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                        <Clock className="text-white/10 mb-4" size={56}/>
                        <p className="text-white font-bold text-base mb-1">Día Libre</p>
                      </div>
                    ) : (
                      <div className="space-y-4 pb-4">
                        {citasHoy.map((cita) => {
                          const alerta = getAlertaCita(cita.fecha_consulta);
                          const esCompletada = cita.estado === 'Atendido' || cita.estado === 'Completada';
                          
                          return (
                            <div key={cita.id} className={`p-5 rounded-2xl border transition-all ${alerta.alert && !esCompletada ? 'border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.1)]' : 'border-slate-800'} bg-[#0B0D12]`}>
                              <div className="flex justify-between items-start mb-3">
                                <div>
                                  <h4 className="font-bold text-white text-lg">{cita.pacientes?.nombres} {cita.pacientes?.apellidos}</h4>
                                  
                                  {/* ALERTA DE TIEMPO (RELOJ VENEZUELA) */}
                                  <p className={`text-[11px] font-bold mt-1.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md ${alerta.bg} ${alerta.color}`}>
                                    {alerta.alert && !esCompletada ? <AlertCircle size={12}/> : <Clock size={12}/>} 
                                    {alerta.texto}
                                  </p>
                                </div>
                                
                                <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded border ${esCompletada ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-white/5 text-slate-400 border-white/10'}`}>
                                  {cita.estado}
                                </span>
                              </div>
                              
                              {/* BOTONERA DINÁMICA DE FLUJO */}
                              <div className="flex gap-2 mt-4 pt-4 border-t border-white/5">
                                {cita.estado === 'Agendada' && (
                                  <button onClick={() => handleMarcarLlegada(cita.id)} className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white py-2.5 rounded-xl text-sm font-bold shadow-md transition-colors">
                                    <CheckCircle className="inline mr-2" size={16}/> Anunciar Llegada
                                  </button>
                                )}
                                
                                {cita.estado === 'En Espera' && (
                                  <button onClick={() => handleMarcarAtendido(cita.id)} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl text-sm font-bold shadow-md transition-colors">
                                    <CheckCircle2 className="inline mr-2" size={16}/> Marcar como Atendido
                                  </button>
                                )}
                                
                                {esCompletada && (
                                  <div className="w-full text-center border border-slate-700 text-slate-400 px-6 py-2.5 rounded-xl text-sm font-bold bg-white/5 flex items-center justify-center gap-2">
                                    <Check size={16} className="text-emerald-500"/> Paciente Resuelto
                                  </div>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-[#16161a] border border-white/[0.04] rounded-[2rem] p-8 flex flex-col shadow-sm min-h-[380px] max-h-[500px]">
                  <div className="flex justify-between items-center mb-6 border-b border-white/[0.04] pb-4 shrink-0">
                    <h3 className="flex items-center gap-2 text-base font-bold text-white"><CalendarDays className="text-[#8b5cf6]" size={20}/> Próximas Citas</h3>
                  </div>
                  <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar pr-2">
                    {citasProximas.length === 0 ? (
                      <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                        <CalendarDays className="text-white/10 mb-4" size={56}/>
                        <p className="text-white font-bold text-base mb-1">Agenda Despejada</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {citasProximas.slice(0, 5).map((cita) => (
                          <div key={cita.id} className="p-4 rounded-xl border border-slate-800 bg-[#0B0D12] flex items-center justify-between gap-4">
                            <h4 className="font-bold text-white text-sm truncate">{cita.pacientes?.nombres} {cita.pacientes?.apellidos}</h4>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= VISTA 2: FORMULARIO IVSS 15-108 ================= */}
          {vistaActual === 'crear_historia' && (
            <div className="animate-[fadeIn_0.3s_ease-out] pb-20 mt-6 px-4 relative">
              
              <div className="bg-[#16161a] p-4 rounded-2xl shadow-lg mb-8 flex flex-col md:flex-row justify-between items-center gap-4 max-w-[210mm] mx-auto border border-white/10 z-40 sticky top-20">
                <button onClick={() => setVistaActual('inicio')} className="flex items-center gap-2 text-slate-400 font-bold hover:text-white transition-colors">
                  <ArrowLeft size={16} /> Volver a Inicio
                </button>
                <div className="flex items-center gap-6">
                   <div className="text-slate-400 text-sm font-bold tracking-widest uppercase hidden md:block">Modo de Edición Libre (F-15-108)</div>
                   <button onClick={handleGuardarHistoria} disabled={guardando} className="bg-[#10b981] hover:bg-[#059669] text-white px-6 py-2 rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/20 transition-transform hover:-translate-y-0.5 disabled:opacity-50 flex items-center gap-2 w-full md:w-auto justify-center">
                     {guardando ? 'Guardando...' : <><Clipboard size={18}/> Guardar en Historias Clínicas</>}
                   </button>
                </div>
              </div>

              {/* ================= CONTENEDOR 6 PÁGINAS A4 ================= */}
              <div className="w-[210mm] mx-auto space-y-12 pb-20">
                <Parte1 formIVSS={formIVSS} handleIVSSChange={handleIVSSChange} marcas={marcas} toggleMarca={toggleMarca} />
                <Parte2 formIVSS={formIVSS} handleIVSSChange={handleIVSSChange} marcas={marcas} toggleMarca={toggleMarca} />
                <Parte3 formIVSS={formIVSS} handleIVSSChange={handleIVSSChange} marcas={marcas} toggleMarca={toggleMarca} />
              </div>
            </div>
          )}

        </div>
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #3f3f46; border-radius: 10px; }
        .custom-scrollbar-gruesa::-webkit-scrollbar { width: 10px; }
        .custom-scrollbar-gruesa::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 0 0 10px 10px; }
        .custom-scrollbar-gruesa::-webkit-scrollbar-thumb { background-color: #94a3b8; border-radius: 10px; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}