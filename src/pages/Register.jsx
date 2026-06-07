import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { ArrowLeft, CheckCircle, XCircle, Eye, EyeOff, Activity } from 'lucide-react';

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

  const [formData, setFormData] = useState({
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
      if (!regexSoloLetras.test(value)) return; // Ignora el cambio si hay números o símbolos
    }

    // 2. Validar Documento y Teléfono (SÓLO NÚMEROS)
    if (name === 'numero_identificacion' || name === 'telefono') {
      const regexSoloNumeros = /^[0-9]*$/;
      if (!regexSoloNumeros.test(value)) return; // Ignora el cambio si meten letras
    }

    // 3. Validar Correo Electrónico (Máx 30 chars, solo formato válido)
    if (name === 'correo') {
      if (value.length > 30) return; // Bloquea si pasa de 25 caracteres
      // Permite letras, números, puntos, @, y guiones. Nada de espacios ni caracteres raros
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

    setLoading(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.correo,
        password: formData.contrasena,
      });

      if (authError) throw authError;

      const { error: dbError } = await supabase.from('usuarios').insert([{
        id_auth: authData.user.id,
        nombres: formData.primer_nombre,
        apellidos: formData.primer_apellido,
        cedula: formData.numero_identificacion,
        especialidad: formData.especialidad,
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
    <div className="min-h-screen flex flex-col items-center justify-center p-4 py-12 bg-gradient-to-br from-blue-700 via-cyan-600 to-teal-500 dark:from-slate-900 dark:via-[#0a192f] dark:to-[#082f3a] transition-colors duration-500 font-sans relative overflow-y-auto">
      
      {/* Cargador Central */}
      <div className={`fixed inset-0 z-[9999] flex items-center justify-center bg-white dark:bg-[#0f172a] transition-opacity duration-500 ${showMainLoader ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="relative flex items-center justify-center">
          <div className="w-20 h-20 border-4 border-cyan-100 dark:border-slate-800 border-t-cyan-500 rounded-full animate-spin"></div>
          <div className="absolute w-12 h-12 bg-cyan-600 rounded-2xl flex items-center justify-center animate-pulse">
            <Activity className="h-6 w-6 text-white" />
          </div>
        </div>
      </div>

      <div className="fixed top-0 left-0 h-[3px] bg-white z-[10000] transition-all duration-700 ease-out shadow-[0_0_10px_rgba(255,255,255,0.8)]" style={{ width: `${loaderWidth}%`, opacity: showMainLoader ? 1 : 0 }}></div>

      {/* Alertas Toast */}
      {alert.show && (
        <div className="fixed top-4 inset-x-0 flex justify-center px-6 z-50 animate-[slideDownFade_0.4s_ease-out]">
          <div className={`bg-white dark:bg-slate-800 text-slate-900 dark:text-white border ${alert.type === 'error' ? 'border-red-500' : 'border-green-500'} rounded-xl shadow-2xl px-5 py-4 w-80 max-w-full flex items-start space-x-3`}>
            {alert.type === 'error' ? <XCircle className="text-red-500 shrink-0 text-xl" /> : <CheckCircle className="text-green-500 shrink-0 text-xl" />}
            <div className="flex-1">
              <h3 className="font-bold text-sm">{alert.type === 'error' ? 'Error' : 'Éxito'}</h3>
              <p className="text-xs mt-1 text-slate-600 dark:text-slate-300">{alert.message}</p>
            </div>
            <button onClick={() => setAlert({ show: false })} className="text-slate-400 hover:text-slate-600"><X size={16}/></button>
          </div>
        </div>
      )}

      {/* TARJETA CENTRAL DE REGISTRO */}
      <div className="w-full max-w-[600px] bg-white dark:bg-[#111111] rounded-[2rem] shadow-2xl p-8 sm:p-10 relative z-10 animate-[fadeIn_0.5s_ease-out]">
        
        {/* Cabecera / Logo */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-block text-3xl font-bold transition-colors text-cyan-600 dark:text-cyan-400">
            <span className="font-normal">SOMA</span>
            <span className="font-black">Cloud</span>
          </Link>
          <div className="flex items-center justify-center gap-2 mt-3 text-[10px] font-bold text-slate-400 tracking-[0.2em]">
            <div className="h-px w-8 bg-slate-200 dark:bg-slate-700"></div>
            CUENTA Y ACCESO
            <div className="h-px w-8 bg-slate-200 dark:bg-slate-700"></div>
          </div>
        </div>

        {/* Textos Principales */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">
            Crea tu cuenta médica
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Prueba gratuita. Solo los datos necesarios para activar tu consultorio.
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleRegister} className="space-y-4">
          
          {/* Especialidad (Full Width) */}
          <div className="border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-2.5 bg-white dark:bg-[#1a1a1a] focus-within:border-cyan-500 focus-within:ring-1 focus-within:ring-cyan-500 transition-all">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Especialidad</label>
            <select name="especialidad" value={formData.especialidad} onChange={handleChange} required className="w-full bg-transparent outline-none text-slate-900 dark:text-white text-sm font-medium">
              <option value="" className="text-slate-400">Seleccionar especialidad...</option>
              {especialidades.map(esp => <option key={esp} value={esp} className="text-slate-900">{esp}</option>)}
            </select>
          </div>

          {/* Nombre y Apellido */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-2.5 bg-white dark:bg-[#1a1a1a] focus-within:border-cyan-500 focus-within:ring-1 focus-within:ring-cyan-500 transition-all">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Nombre</label>
              <input type="text" name="primer_nombre" maxLength="18" value={formData.primer_nombre} onChange={handleChange} required className="w-full bg-transparent outline-none text-slate-900 dark:text-white text-sm font-medium placeholder-slate-300 dark:placeholder-slate-600" placeholder="Ej. José" />
            </div>
            <div className="border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-2.5 bg-white dark:bg-[#1a1a1a] focus-within:border-cyan-500 focus-within:ring-1 focus-within:ring-cyan-500 transition-all">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Apellido</label>
              <input type="text" name="primer_apellido" maxLength="18" value={formData.primer_apellido} onChange={handleChange} required className="w-full bg-transparent outline-none text-slate-900 dark:text-white text-sm font-medium placeholder-slate-300 dark:placeholder-slate-600" placeholder="Ej. Medina" />
            </div>
          </div>

          {/* Cédula y Teléfono */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-2.5 bg-white dark:bg-[#1a1a1a] focus-within:border-cyan-500 focus-within:ring-1 focus-within:ring-cyan-500 transition-all">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Documento de Identidad</label>
              <input type="text" name="numero_identificacion" maxLength="12" value={formData.numero_identificacion} onChange={handleChange} required className="w-full bg-transparent outline-none text-slate-900 dark:text-white text-sm font-medium placeholder-slate-300 dark:placeholder-slate-600" placeholder="12345678" />
            </div>
            <div className="border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-2.5 bg-white dark:bg-[#1a1a1a] focus-within:border-cyan-500 focus-within:ring-1 focus-within:ring-cyan-500 transition-all flex flex-col justify-center">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Teléfono</label>
              <div className="flex items-center">
                <img className="w-4 h-[11px] object-cover mr-2 rounded-sm" src="https://flagcdn.com/w20/ve.png" alt="VE" />
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400 mr-2">+58</span>
                <input type="text" name="telefono" maxLength="11" value={formData.telefono} onChange={handleChange} required className="w-full bg-transparent outline-none text-slate-900 dark:text-white text-sm font-medium placeholder-slate-300 dark:placeholder-slate-600" placeholder="4121234567" />
              </div>
            </div>
          </div>

          {/* Correo Electrónico (Full Width) - Max 30 chars */}
          <div className="border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-2.5 bg-white dark:bg-[#1a1a1a] focus-within:border-cyan-500 focus-within:ring-1 focus-within:ring-cyan-500 transition-all">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Correo Electrónico</label>
            <input type="text" name="correo" maxLength="30" value={formData.correo} onChange={handleChange} required className="w-full bg-transparent outline-none text-slate-900 dark:text-white text-sm font-medium placeholder-slate-300 dark:placeholder-slate-600" placeholder="tu@correo.com" />
          </div>

          {/* Contraseñas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-2.5 bg-white dark:bg-[#1a1a1a] focus-within:border-cyan-500 focus-within:ring-1 focus-within:ring-cyan-500 transition-all relative">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Contraseña (Mín. 6)</label>
              <input 
                type={showPassword ? "text" : "password"} 
                name="contrasena" 
                minLength={6}
                maxLength={20}
                value={formData.contrasena} 
                onChange={handleChange} 
                required 
                className="w-full bg-transparent outline-none text-slate-900 dark:text-white text-sm font-medium placeholder-slate-300 dark:placeholder-slate-600 pr-8" 
                placeholder="••••••••" 
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-500 mt-2">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <div className="border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-2.5 bg-white dark:bg-[#1a1a1a] focus-within:border-cyan-500 focus-within:ring-1 focus-within:ring-cyan-500 transition-all relative">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Confirmar Contraseña</label>
              <input 
                type={showConfirmPassword ? "text" : "password"} 
                name="confirmar_contrasena" 
                minLength={6}
                maxLength={20}
                value={formData.confirmar_contrasena} 
                onChange={handleChange} 
                required 
                className="w-full bg-transparent outline-none text-slate-900 dark:text-white text-sm font-medium placeholder-slate-300 dark:placeholder-slate-600 pr-8" 
                placeholder="••••••••" 
              />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-500 mt-2">
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Sexo y País */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-2.5 bg-white dark:bg-[#1a1a1a] focus-within:border-cyan-500 focus-within:ring-1 focus-within:ring-cyan-500 transition-all">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Sexo</label>
              <select name="sexo" value={formData.sexo} onChange={handleChange} required className="w-full bg-transparent outline-none text-slate-900 dark:text-white text-sm font-medium">
                <option value="" className="text-slate-400">Seleccionar...</option>
                <option value="Masculino" className="text-slate-900">Masculino</option>
                <option value="Femenino" className="text-slate-900">Femenino</option>
                <option value="Otro" className="text-slate-900">Otro</option>
              </select>
            </div>
            <div className="border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-2.5 bg-slate-100 dark:bg-slate-800 transition-all cursor-not-allowed">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">País</label>
              <select name="pais" disabled className="w-full bg-transparent outline-none text-slate-500 dark:text-slate-400 text-sm font-medium cursor-not-allowed">
                <option value="Venezuela">Venezuela</option>
              </select>
            </div>
          </div>

          {/* Ciudad (Full Width) */}
          <div className="border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-2.5 bg-white dark:bg-[#1a1a1a] focus-within:border-cyan-500 focus-within:ring-1 focus-within:ring-cyan-500 transition-all mb-8">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Ciudad</label>
            <select name="ciudad" value={formData.ciudad} onChange={handleChange} required className="w-full bg-transparent outline-none text-slate-900 dark:text-white text-sm font-medium">
              <option value="" className="text-slate-400">Seleccione una ciudad</option>
              {cities.map(c => <option key={c} value={c} className="text-slate-900">{c}</option>)}
            </select>
          </div>

          {/* Botón Principal */}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full mt-6 bg-[#0081a7] hover:bg-[#006a8a] dark:bg-cyan-600 dark:hover:bg-cyan-700 text-white py-3.5 rounded-xl font-bold text-sm transition-all transform hover:-translate-y-0.5 shadow-lg shadow-cyan-900/20 disabled:opacity-50 disabled:transform-none flex justify-center items-center gap-2"
          >
            {loading ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Creando cuenta...</> : 'Crear cuenta'}
          </button>
        </form>

        {/* Footer de la tarjeta */}
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-white/5 flex flex-col items-center space-y-4">
          <Link to="/login" className="text-sm font-bold text-[#0081a7] dark:text-cyan-400 hover:underline transition-all">
            Iniciar sesión
          </Link>
          <button className="text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">
            Reenviar correo de confirmación
          </button>
          <Link to="/" className="text-xs font-medium text-slate-400 dark:text-slate-500 flex items-center gap-1.5 hover:text-slate-800 dark:hover:text-white transition-colors group mt-2">
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Volver al inicio
          </Link>
        </div>

      </div>

      {/* Copyright flotante */}
      <p className="mt-8 text-[10px] text-white/50 relative z-10 uppercase tracking-widest font-medium">
        © {new Date().getFullYear()} SOMA Cloud
      </p>

      <style>{`
        @keyframes slideDownFade {
          0% { opacity: 0; transform: translateY(-20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          0% { opacity: 0; transform: scale(0.95); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}