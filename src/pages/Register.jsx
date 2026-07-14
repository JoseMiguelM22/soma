import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { ArrowLeft, CheckCircle, XCircle, Eye, EyeOff, Activity, ChevronDown } from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // Controles de contraseña
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Loaders
  const [showMainLoader, setShowMainLoader] = useState(true);
  const [loaderWidth, setLoaderWidth] = useState(0);
  
  // Alertas
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });

  // Agregamos 'rol' al formData (por defecto 'especialista')
  const [formData, setFormData] = useState({
    rol: 'especialista', // Novedad: Control de rol
    especialidad: '', primer_nombre: '', primer_apellido: '',
    numero_identificacion: '', telefono: '', correo: '',
    contrasena: '', confirmar_contrasena: '', sexo: '',
    pais: 'Venezuela', ciudad: ''
  });

  const cities = ["Caracas", "Punto Fijo", "Valencia", "Maracaibo", "Barquisimeto", "Mérida", "San Cristóbal", "Coro", "Otra"];
  const especialidades = [
    "Medicina General", "Cardiología", "Pediatría", "Ginecología y Obstetricia", 
    "Dermatología", "Neurología", "Odontología", "Nutrición", "Traumatología", "Urología"
  ];

  // Efectos de carga y modo oscuro
  useEffect(() => {
    setTimeout(() => setLoaderWidth(100), 50);
    const timer = setTimeout(() => setShowMainLoader(false), 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const isDark = localStorage.getItem('theme') === 'dark' || 
                  (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (isDark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, []);

  useEffect(() => {
    if (alert.show) {
      const timer = setTimeout(() => setAlert({ show: false, type: '', message: '' }), 5000);
      return () => clearTimeout(timer);
    }
  }, [alert.show]);

  // ==========================================
  // LÓGICA DE VALIDACIÓN EN TIEMPO REAL
  // ==========================================
  const handleChange = (e) => {
    const { name, value } = e.target;

    // 1. Validar Nombre y Apellido (Solo letras y espacios)
    if (name === 'primer_nombre' || name === 'primer_apellido') {
      const regexSoloLetras = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]*$/;
      if (!regexSoloLetras.test(value)) return;
    }

    // 2. Validar Documento y Teléfono (SÓLO NÚMEROS)
    if (name === 'numero_identificacion' || name === 'telefono') {
      const regexSoloNumeros = /^[0-9]*$/;
      if (!regexSoloNumeros.test(value)) return;
    }

    // 3. Validar Correo Electrónico (Máx 30 chars, solo formato válido)
    if (name === 'correo') {
      if (value.length > 30) return;
      const regexCorreo = /^[a-zA-Z0-9.@_-]*$/;
      if (!regexCorreo.test(value)) return;
    }

    setFormData({ ...formData, [name]: value });
  };

  // ==========================================
  // ENVÍO DEL FORMULARIO A SUPABASE
  // ==========================================
  const handleRegister = async (e) => {
    e.preventDefault();

    // Re-validación del correo final
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.correo)) {
      setAlert({ show: true, type: 'error', message: 'Ingresa un formato de correo válido (ejemplo@correo.com).' });
      return;
    }

    // Validar longitud de contraseña
    if (formData.contrasena.length < 6 || formData.contrasena.length > 20) {
      setAlert({ show: true, type: 'error', message: 'La contraseña debe tener entre 6 y 20 caracteres.' });
      return;
    }

    if (formData.contrasena !== formData.confirmar_contrasena) {
      setAlert({ show: true, type: 'error', message: 'Las contraseñas no coinciden. Revisa bien, mi pana.' });
      return;
    }

    // Si es asistente, no necesita especialidad médica
    const especialidadFinal = formData.rol === 'departamento' ? 'Admisión / Triaje' : formData.especialidad;

    if (formData.rol === 'especialista' && !especialidadFinal) {
      setAlert({ show: true, type: 'error', message: 'Por favor, selecciona una especialidad médica.' });
      return;
    }

    setLoading(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.correo,
        password: formData.contrasena,
      });

      if (authError) throw authError;

      // Inserción en la base de datos INCLUYENDO EL ROL
      const { error: dbError } = await supabase.from('usuarios').insert([{
        id_auth: authData.user.id,
        rol: formData.rol, // ¡Aquí enviamos el rol seleccionado!
        nombres: formData.primer_nombre,
        apellidos: formData.primer_apellido,
        cedula: formData.numero_identificacion,
        especialidad: especialidadFinal,
        correo: formData.correo,
        sexo: formData.sexo,
        pais: formData.pais,
        ciudad: formData.ciudad,
        telefono: formData.telefono
      }]);

      if (dbError) throw dbError;

      setAlert({ show: true, type: 'success', message: '¡Cuenta creada con éxito! Redirigiendo al Login...' });
      setTimeout(() => navigate('/login'), 2000);

    } catch (error) {
      if (error.message.includes('User already registered')) {
        setAlert({ show: true, type: 'error', message: 'Este correo ya está registrado en SOMA.' });
      } else {
        setAlert({ show: true, type: 'error', message: error.message });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen bg-[#050816] overflow-y-auto" 
      style={{ fontFamily: "'Nunito', sans-serif" }}
    >
      
      {/* Cargador Central */}
      {showMainLoader && (
        <div className={`fixed inset-0 z-[9999] flex items-center justify-center bg-[#050816] transition-opacity duration-500`}>
          <div className="relative flex items-center justify-center">
            <div className="w-20 h-20 border-4 border-white/10 border-t-[#8B5CF6] rounded-full animate-spin"></div>
            <div className="absolute w-12 h-12 bg-[#8B5CF6] rounded-2xl flex items-center justify-center animate-pulse">
              <Activity className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      )}

      <div className="fixed top-0 left-0 h-[3px] bg-white z-[10000] transition-all duration-700 ease-out shadow-[0_0_10px_rgba(255,255,255,0.8)]" style={{ width: `${loaderWidth}%`, opacity: showMainLoader ? 1 : 0 }}></div>

      {/* ALERTAS */}
      {alert.show && (
        <div className="fixed top-5 left-0 right-0 flex justify-center z-50 animate-[slideDownFade_0.4s_ease-out]">
          <div
            className={`px-5 py-3 rounded-xl shadow-lg text-white text-sm font-bold tracking-wide ${
              alert.type === "success" ? "bg-green-500" : "bg-red-500"
            }`}
          >
            {alert.message}
          </div>
        </div>
      )}

      {/* Contenedor principal ensanchado a 1536px para permitir mayor separación */}
      <div className="max-w-[1536px] mx-auto min-h-screen px-8 lg:px-16 py-12 flex items-center justify-center">

        {/* Uso de Flexbox con justify-between para empujar los paneles a los extremos */}
        <div className="flex flex-col lg:flex-row items-center justify-between w-full gap-12 lg:gap-20 xl:gap-32">

          {/* PANEL IZQUIERDO OPTIMIZADO */}
          <div className="hidden lg:flex justify-start items-center w-full lg:w-1/2 h-full">

            <div className="relative">

              <img
                src="/soma_logo.png"
                alt="SOMA"
                className="absolute top-10 left-10 h-8 z-20"
              />

              <div
                className="
                w-[600px]
                h-[840px]
                rounded-[44px]
                overflow-hidden
                relative
                border
                border-white/10
                shadow-2xl
                "
              >
                {/* Fondo */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#D8FFF4] via-[#9BF3DB] to-[#17C79A]" />

                {/* Blur grande */}
                <div className="absolute left-[-50px] top-[180px] w-[400px] h-[400px] rounded-full bg-white/40 blur-[130px]" />

                {/* Blur lateral */}
                <div className="absolute right-[-60px] top-[80px] w-[340px] h-[340px] rounded-full bg-[#00FFB3]/20 blur-[120px]" />

                {/* Blur inferior */}
                <div className="absolute bottom-[-60px] left-[160px] w-[300px] h-[300px] rounded-full bg-white/20 blur-[100px]" />

                {/* Textura */}
                <div className="absolute inset-0 opacity-[0.05] bg-[radial-gradient(circle,black_1px,transparent_1px)] bg-[length:8px_8px]" />

              </div>

            </div>

          </div>

          {/* FORMULARIO DE REGISTRO */}
          {/* Alineado hacia la derecha */}
          <div className="w-full lg:w-1/2 flex justify-end items-center">
            <div className="w-full max-w-[480px]">

              {/* Logo móvil */}
              <div className="lg:hidden flex justify-center mb-8">
                <img src="/soma_logo_blanco.png" alt="SOMA Logo" className="h-12 object-contain hidden dark:block transition-opacity duration-300" />
              </div>

              <div className="hidden lg:block text-center">
                <img src="/soma_logo_blanco.png" alt="SOMA Logo" className="h-10 mx-auto mb-6 object-contain dark:block transition-opacity duration-300" />
              </div>

              <div className="text-center mb-8">
                <h1 className="text-4xl font-extrabold text-white mb-3 tracking-tight">
                  Crea tu cuenta médica
                </h1>
                <p className="text-[#A1A1AA] text-sm font-semibold leading-relaxed max-w-[360px] mx-auto">
                  Prueba gratuita. Solo los datos necesarios para activar tu consultorio.
                </p>
              </div>

              <form onSubmit={handleRegister} className="space-y-4">
                
                {/* 1. SELECCIÓN DE ROL */}
                <div>
                  <label className="block text-gray-200 text-sm font-bold mb-2 tracking-wide">
                    ¿Qué perfil deseas crear?
                  </label>
                  <div className="relative">
                    <select 
                      name="rol" 
                      value={formData.rol} 
                      onChange={handleChange} 
                      required 
                      className={`w-full appearance-none py-3 px-4 rounded-xl bg-white text-sm font-bold text-gray-900 outline-none border border-transparent transition-all duration-300 cursor-pointer
                        ${formData.rol === 'especialista' ? 'focus:border-[#b0ff4c] focus:ring-2 focus:ring-[#b0ff4c]/30' : 'focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#8B5CF6]/30'}
                      `}
                    >
                      <option value="especialista">Médico Especialista</option>
                      <option value="departamento">Asistente (Depto. Historias Clinicas)</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-gray-500">
                      <ChevronDown size={18} />
                    </div>
                  </div>
                </div>

                {/* 2. Especialidad (SOLO SI ES MÉDICO) */}
                {formData.rol === 'especialista' && (
                  <div className="animate-[fadeIn_0.3s_ease-out]">
                    <label className="block text-gray-200 text-sm font-bold mb-2 tracking-wide">
                      Especialidad
                    </label>
                    <div className="relative">
                      <select 
                        name="especialidad" 
                        value={formData.especialidad} 
                        onChange={handleChange} 
                        required 
                        className="w-full appearance-none py-3 px-4 rounded-xl bg-white text-sm font-semibold text-gray-900 outline-none border border-transparent focus:border-[#b0ff4c] focus:ring-2 focus:ring-[#b0ff4c]/30 transition-all duration-300 cursor-pointer"
                      >
                        <option value="" className="text-gray-400">Seleccionar especialidad...</option>
                        {especialidades.map(esp => <option key={esp} value={esp} className="text-gray-900">{esp}</option>)}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-gray-500">
                        <ChevronDown size={18} />
                      </div>
                    </div>
                  </div>
                )}

                {/* Nombre y Apellido */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-200 text-sm font-bold mb-2 tracking-wide">Nombre</label>
                    <input 
                      type="text" 
                      name="primer_nombre" 
                      maxLength="18" 
                      value={formData.primer_nombre} 
                      onChange={handleChange} 
                      required 
                      className={`w-full py-3 px-4 rounded-xl bg-white text-sm font-semibold text-gray-900 placeholder:text-gray-400 outline-none border border-transparent transition-all duration-300
                        ${formData.rol === 'especialista' ? 'focus:border-[#b0ff4c] focus:ring-2 focus:ring-[#b0ff4c]/30' : 'focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#8B5CF6]/30'}
                      `} 
                      placeholder="Ej. José" 
                    />
                  </div>
                  <div>
                    <label className="block text-gray-200 text-sm font-bold mb-2 tracking-wide">Apellido</label>
                    <input 
                      type="text" 
                      name="primer_apellido" 
                      maxLength="18" 
                      value={formData.primer_apellido} 
                      onChange={handleChange} 
                      required 
                      className={`w-full py-3 px-4 rounded-xl bg-white text-sm font-semibold text-gray-900 placeholder:text-gray-400 outline-none border border-transparent transition-all duration-300
                        ${formData.rol === 'especialista' ? 'focus:border-[#b0ff4c] focus:ring-2 focus:ring-[#b0ff4c]/30' : 'focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#8B5CF6]/30'}
                      `} 
                      placeholder="Ej. Medina" 
                    />
                  </div>
                </div>

                {/* Cédula y Teléfono */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-200 text-sm font-bold mb-2 tracking-wide">Documento de Identidad</label>
                    <input 
                      type="text" 
                      name="numero_identificacion" 
                      maxLength="12" 
                      value={formData.numero_identificacion} 
                      onChange={handleChange} 
                      required 
                      className={`w-full py-3 px-4 rounded-xl bg-white text-sm font-semibold text-gray-900 placeholder:text-gray-400 outline-none border border-transparent transition-all duration-300
                        ${formData.rol === 'especialista' ? 'focus:border-[#b0ff4c] focus:ring-2 focus:ring-[#b0ff4c]/30' : 'focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#8B5CF6]/30'}
                      `} 
                      placeholder="12345678" 
                    />
                  </div>
                  <div>
                    <label className="block text-gray-200 text-sm font-bold mb-2 tracking-wide">Teléfono</label>
                    <div className={`flex items-center w-full py-3 px-4 rounded-xl bg-white border border-transparent transition-all duration-300
                      ${formData.rol === 'especialista' ? 'focus-within:border-[#b0ff4c] focus-within:ring-2 focus-within:ring-[#b0ff4c]/30' : 'focus-within:border-[#8B5CF6] focus-within:ring-2 focus-within:ring-[#8B5CF6]/30'}
                    `}>
                      <img className="w-4 h-[11px] object-cover mr-2 rounded-sm" src="https://flagcdn.com/w20/ve.png" alt="VE" />
                      <span className="text-sm font-bold text-gray-500 mr-2">+58</span>
                      <input 
                        type="text" 
                        name="telefono" 
                        maxLength="11" 
                        value={formData.telefono} 
                        onChange={handleChange} 
                        required 
                        className="w-full bg-transparent outline-none text-gray-900 text-sm font-semibold placeholder:text-gray-400" 
                        placeholder="4121234567" 
                      />
                    </div>
                  </div>
                </div>

                {/* Correo Electrónico */}
                <div>
                  <label className="block text-gray-200 text-sm font-bold mb-2 tracking-wide">Correo Electrónico</label>
                  <input 
                    type="email" 
                    name="correo" 
                    maxLength="30" 
                    value={formData.correo} 
                    onChange={handleChange} 
                    required 
                    className={`w-full py-3 px-4 rounded-xl bg-white text-sm font-semibold text-gray-900 placeholder:text-gray-400 outline-none border border-transparent transition-all duration-300
                      ${formData.rol === 'especialista' ? 'focus:border-[#b0ff4c] focus:ring-2 focus:ring-[#b0ff4c]/30' : 'focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#8B5CF6]/30'}
                    `} 
                    placeholder="tu@correo.com" 
                  />
                </div>

                {/* Contraseñas */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="relative">
                    <label className="block text-gray-200 text-sm font-bold mb-2 tracking-wide">Contraseña (Mín. 6)</label>
                    <input 
                      type={showPassword ? "text" : "password"} 
                      name="contrasena" 
                      minLength={6}
                      maxLength={20}
                      value={formData.contrasena} 
                      onChange={handleChange} 
                      required 
                      className={`w-full py-3 px-4 pr-12 rounded-xl bg-white text-sm font-bold text-gray-900 placeholder:text-gray-400 outline-none border border-transparent transition-all duration-300
                        ${formData.rol === 'especialista' ? 'focus:border-[#b0ff4c] focus:ring-2 focus:ring-[#b0ff4c]/30' : 'focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#8B5CF6]/30'}
                      `} 
                      placeholder="••••••••" 
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-[36px] text-gray-400 hover:text-gray-700 transition-colors">
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <div className="relative">
                    <label className="block text-gray-200 text-sm font-bold mb-2 tracking-wide">Confirmar Contraseña</label>
                    <input 
                      type={showConfirmPassword ? "text" : "password"} 
                      name="confirmar_contrasena" 
                      minLength={6}
                      maxLength={20}
                      value={formData.confirmar_contrasena} 
                      onChange={handleChange} 
                      required 
                      className={`w-full py-3 px-4 pr-12 rounded-xl bg-white text-sm font-bold text-gray-900 placeholder:text-gray-400 outline-none border border-transparent transition-all duration-300
                        ${formData.rol === 'especialista' ? 'focus:border-[#b0ff4c] focus:ring-2 focus:ring-[#b0ff4c]/30' : 'focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#8B5CF6]/30'}
                      `} 
                      placeholder="••••••••" 
                    />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-[36px] text-gray-400 hover:text-gray-700 transition-colors">
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Sexo y País */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-200 text-sm font-bold mb-2 tracking-wide">Sexo</label>
                    <div className="relative">
                      <select 
                        name="sexo" 
                        value={formData.sexo} 
                        onChange={handleChange} 
                        required 
                        className={`w-full appearance-none py-3 px-4 rounded-xl bg-white text-sm font-semibold text-gray-900 outline-none border border-transparent transition-all duration-300 cursor-pointer
                          ${formData.rol === 'especialista' ? 'focus:border-[#b0ff4c] focus:ring-2 focus:ring-[#b0ff4c]/30' : 'focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#8B5CF6]/30'}
                        `}
                      >
                        <option value="" className="text-gray-400">Seleccionar...</option>
                        <option value="Masculino" className="text-gray-900">Masculino</option>
                        <option value="Femenino" className="text-gray-900">Femenino</option>
                        <option value="Otro" className="text-gray-900">Otro</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-gray-500">
                        <ChevronDown size={18} />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm font-bold mb-2 tracking-wide">País</label>
                    <div className="relative">
                      <select 
                        name="pais" 
                        disabled 
                        className="w-full appearance-none py-3 px-4 rounded-xl bg-white/10 text-sm font-semibold text-gray-400 outline-none border border-white/5 cursor-not-allowed"
                      >
                        <option value="Venezuela">Venezuela</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-gray-500 opacity-50">
                        <ChevronDown size={18} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Ciudad */}
                <div>
                  <label className="block text-gray-200 text-sm font-bold mb-2 tracking-wide">Ciudad</label>
                  <div className="relative mb-2">
                    <select 
                      name="ciudad" 
                      value={formData.ciudad} 
                      onChange={handleChange} 
                      required 
                      className={`w-full appearance-none py-3 px-4 rounded-xl bg-white text-sm font-semibold text-gray-900 outline-none border border-transparent transition-all duration-300 cursor-pointer
                        ${formData.rol === 'especialista' ? 'focus:border-[#b0ff4c] focus:ring-2 focus:ring-[#b0ff4c]/30' : 'focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#8B5CF6]/30'}
                      `}
                    >
                      <option value="" className="text-gray-400">Seleccione una ciudad</option>
                      {cities.map(c => <option key={c} value={c} className="text-gray-900">{c}</option>)}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-gray-500">
                      <ChevronDown size={18} />
                    </div>
                  </div>
                </div>

                {/* Botón Principal Dinámico según Rol */}
                <button 
                  type="submit" 
                  disabled={loading}
                  className={`w-full py-3 mt-6 rounded-xl text-sm font-extrabold tracking-wide transition-all duration-300 transform flex justify-center items-center gap-2
                    ${loading ? 'opacity-50 transform-none' : 'hover:-translate-y-0.5 shadow-lg'}
                    ${formData.rol === 'especialista' 
                      ? 'bg-[#b0ff4c] hover:bg-[#9ded3a] text-black shadow-[#b0ff4c]/20' 
                      : 'bg-[#8B5CF6] hover:bg-[#7C3AED] text-white shadow-[#8B5CF6]/20'
                    }
                  `}
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div> 
                      Procesando...
                    </>
                  ) : (
                    formData.rol === 'especialista' ? 'Crear cuenta de Médico' : 'Crear cuenta de Asistente'
                  )}
                </button>
              </form>

              {/* Footer de la tarjeta */}
              <div className="mt-8 pt-6 border-t border-white/10 flex flex-col items-center space-y-4">
                <p className="text-[#A1A1AA] text-sm font-semibold">
                  ¿Ya tienes cuenta?
                  <Link to="/login" className="text-[#8B5CF6] ml-2 font-extrabold hover:text-[#A78BFA] transition-colors">
                    Iniciar sesión
                  </Link>
                </p>
                <Link to="/" className="text-xs font-bold text-slate-500 flex items-center gap-1.5 hover:text-white transition-colors group mt-2">
                  <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Volver al inicio
                </Link>
              </div>

            </div>
          </div>

        </div>

      </div>

      <style>{`
        @keyframes slideDownFade {
          0% { opacity: 0; transform: translateY(-20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          0% { opacity: 0; transform: translateY(-10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}