import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { ArrowLeft, CheckCircle, XCircle, Eye, EyeOff, Activity } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // Controla si estamos en modo "Login" o "Recuperar Contraseña"
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  
  // Controla ver/ocultar contraseña
  const [showPassword, setShowPassword] = useState(false);
  
  // Estados para los loaders
  const [showMainLoader, setShowMainLoader] = useState(true);
  const [loaderWidth, setLoaderWidth] = useState(0);

  // Estados del formulario y alertas
  const [formData, setFormData] = useState({ correo: '', contrasena: '' });
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });

  // Efecto inicial para simular la carga de la página
  useEffect(() => {
    setTimeout(() => setLoaderWidth(100), 50);
    const timer = setTimeout(() => {
      setShowMainLoader(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  // Efecto para aplicar tema oscuro si viene del Home
  useEffect(() => {
    const isDark = localStorage.getItem('theme') === 'dark' || 
                  (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (isDark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, []);

  // Efecto para ocultar alertas
  useEffect(() => {
    if (alert.show) {
      const timer = setTimeout(() => setAlert({ show: false, type: '', message: '' }), 5000);
      return () => clearTimeout(timer);
    }
  }, [alert.show]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Función unificada
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (isResettingPassword) {
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(formData.correo, {
          redirectTo: window.location.origin + '/actualizar-contrasena',
        });
        if (error) throw error;
        setAlert({ show: true, type: 'success', message: 'Te enviamos un enlace al correo para recuperar tu contraseña.' });
        setIsResettingPassword(false);
      } catch (error) {
        setAlert({ show: true, type: 'error', message: 'Error al enviar el correo. Verifica que esté registrado.' });
      } finally {
        setLoading(false);
      }
    } else {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.correo,
          password: formData.contrasena,
        });
        if (error) throw error;
        setAlert({ show: true, type: 'success', message: '¡Bienvenido de vuelta, Doctor!' });
        setTimeout(() => navigate('/dashboard'), 1000);
      } catch (error) {
        setAlert({ show: true, type: 'error', message: 'Credenciales incorrectas. Verifica tu correo y contraseña.' });
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    // Fondo igual al del Home para consistencia
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-blue-700 via-cyan-600 to-teal-500 dark:from-slate-900 dark:via-[#0a192f] dark:to-[#082f3a] transition-colors duration-500 font-sans relative">
      
      {/* Cargador Central (Main Loader) */}
      <div className={`fixed inset-0 z-[9999] flex items-center justify-center bg-white dark:bg-[#0f172a] transition-opacity duration-500 ${showMainLoader ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="relative flex items-center justify-center">
          <div className="w-20 h-20 border-4 border-cyan-100 dark:border-slate-800 border-t-cyan-500 rounded-full animate-spin"></div>
          <div className="absolute w-12 h-12 bg-cyan-600 rounded-2xl flex items-center justify-center animate-pulse">
            <Activity className="h-6 w-6 text-white" />
          </div>
        </div>
      </div>

      {/* Barra de carga superior */}
      <div className="fixed top-0 left-0 h-[3px] bg-white z-[10000] transition-all duration-700 ease-out shadow-[0_0_10px_rgba(255,255,255,0.8)]" style={{ width: `${loaderWidth}%`, opacity: showMainLoader ? 1 : 0 }}></div>

      {/* Alertas Toast */}
      {alert.show && (
        <div className="fixed top-4 inset-x-0 flex justify-center px-6 z-50 animate-[slideDownFade_0.4s_ease-out]">
          <div className={`bg-white dark:bg-slate-800 text-slate-900 dark:text-white border ${alert.type === 'error' ? 'border-red-500' : 'border-green-500'} rounded-xl shadow-2xl px-5 py-4 w-80 max-w-full flex items-start space-x-3`}>
            {alert.type === 'error' ? <XCircle className="text-red-500 shrink-0 text-xl" /> : <CheckCircle className="text-green-500 shrink-0 text-xl" />}
            <div className="flex-1">
              <h3 className="font-bold text-sm">{alert.type === 'error' ? 'Hubo un error' : 'Éxito'}</h3>
              <p className="text-xs mt-1 text-slate-600 dark:text-slate-300">{alert.message}</p>
            </div>
            <button onClick={() => setAlert({ show: false })} className="text-slate-400 hover:text-slate-600"><X size={16}/></button>
          </div>
        </div>
      )}

      {/* TARJETA CENTRAL TIPO GALÉNICOS */}
      <div className="w-full max-w-[420px] bg-white dark:bg-[#111111] rounded-[2rem] shadow-2xl p-8 sm:p-10 relative z-10 animate-[fadeIn_0.5s_ease-out]">
        
        {/* Cabecera / Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block text-3xl font-bold transition-colors text-cyan-600 dark:text-cyan-400">
            <span className="font-normal">SOMA</span>
            <span className="font-black">Cloud</span>
          </Link>
          <div className="flex items-center justify-center gap-2 mt-3 text-[10px] font-bold text-slate-400 tracking-[0.2em]">
            <div className="h-px w-6 bg-slate-200 dark:bg-slate-700"></div>
            MÉDICOS Y ESPECIALISTAS
            <div className="h-px w-6 bg-slate-200 dark:bg-slate-700"></div>
          </div>
        </div>

        {/* Textos Principales */}
        <div className="text-center mb-6">
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
            ¿Sin cuenta? <Link to="/register" className="text-cyan-600 dark:text-cyan-400 font-bold hover:underline">Regístrate gratis</Link>
          </p>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">
            {isResettingPassword ? 'Recupera tu acceso' : 'Entra a tu consultorio'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isResettingPassword ? 'Ingresa tu correo para recibir las instrucciones.' : 'Correo y contraseña de tu cuenta médica.'}
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Input Correo (Estilo Integrado) */}
          <div className="border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-2.5 bg-white dark:bg-[#1a1a1a] focus-within:border-cyan-500 focus-within:ring-1 focus-within:ring-cyan-500 transition-all">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Correo Electrónico</label>
            <input 
              type="email" 
              name="correo" 
              value={formData.correo}
              onChange={handleChange}
              required 
              className="w-full bg-transparent outline-none text-slate-900 dark:text-white text-sm font-medium placeholder-slate-300 dark:placeholder-slate-600"
              placeholder="nombre@ejemplo.com" 
            />
          </div>

          {/* Input Contraseña */}
          {!isResettingPassword && (
            <div className="border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-2.5 bg-white dark:bg-[#1a1a1a] focus-within:border-cyan-500 focus-within:ring-1 focus-within:ring-cyan-500 transition-all relative">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Contraseña</label>
              <input 
                type={showPassword ? "text" : "password"} 
                name="contrasena" 
                value={formData.contrasena}
                onChange={handleChange}
                required 
                className="w-full bg-transparent outline-none text-slate-900 dark:text-white text-sm font-medium placeholder-slate-300 dark:placeholder-slate-600 pr-10"
                placeholder="••••••••" 
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-500 transition-colors mt-2"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          )}

          {/* Opciones extra */}
          <div className="flex justify-between items-center text-xs mt-2 mb-6">
            {!isResettingPassword ? (
              <>
                <label className="flex items-center space-x-2 text-slate-600 dark:text-slate-400 cursor-pointer group">
                  <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500 cursor-pointer" />
                  <span className="group-hover:text-slate-900 dark:group-hover:text-white transition-colors">Recordarme</span>
                </label>
                <button type="button" onClick={() => setIsResettingPassword(true)} className="text-cyan-600 dark:text-cyan-400 font-bold hover:underline transition-all">
                  ¿Olvidaste la contraseña?
                </button>
              </>
            ) : (
              <button type="button" onClick={() => setIsResettingPassword(false)} className="text-cyan-600 dark:text-cyan-400 font-bold hover:underline transition-all w-full text-center">
                Volver a iniciar sesión
              </button>
            )}
          </div>

          {/* Botón Principal */}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#0081a7] hover:bg-[#006a8a] dark:bg-cyan-600 dark:hover:bg-cyan-700 text-white py-3.5 rounded-xl font-bold text-sm transition-all transform hover:-translate-y-0.5 shadow-lg shadow-cyan-900/20 disabled:opacity-50 disabled:transform-none flex justify-center items-center gap-2"
          >
            {loading 
              ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Procesando...</>
              : (isResettingPassword ? 'Enviar enlace de recuperación' : 'Continuar')
            }
          </button>
        </form>

        {/* Footer de la tarjeta */}
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-white/5 flex flex-col items-center space-y-4">
          <button className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">
            Acceso asistentes
          </button>
          <Link to="/" className="text-xs font-medium text-slate-400 dark:text-slate-500 flex items-center gap-1.5 hover:text-slate-800 dark:hover:text-white transition-colors group">
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Inicio
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