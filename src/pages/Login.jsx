import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // Estados para los loaders
  const [showMainLoader, setShowMainLoader] = useState(true);
  const [loaderWidth, setLoaderWidth] = useState(0);

  // Estados del formulario y alertas
  const [formData, setFormData] = useState({ correo: '', contrasena: '' });
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });

  // Efecto inicial para simular la carga de la página
  useEffect(() => {
    // 1. Animamos la barra superior
    setTimeout(() => setLoaderWidth(100), 50);

    // 2. Desvanecemos el cargador central
    const timer = setTimeout(() => {
      setShowMainLoader(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  // Efecto para ocultar alertas después de 5 segundos
  useEffect(() => {
    if (alert.show) {
      const timer = setTimeout(() => setAlert({ show: false, type: '', message: '' }), 5000);
      return () => clearTimeout(timer);
    }
  }, [alert.show]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Iniciar sesión con Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.correo,
        password: formData.contrasena,
      });

      if (error) throw error;

      setAlert({ show: true, type: 'success', message: '¡Bienvenido de vuelta, Doctor!' });
      
      // Redirigir al panel médico después de un segundo
      setTimeout(() => navigate('/dashboard'), 1000);

    } catch (error) {
      // Si el correo o clave son incorrectos
      setAlert({ show: true, type: 'error', message: 'Credenciales incorrectas. Verifica tu correo y contraseña.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 transition-colors duration-300 overflow-auto md:overflow-hidden min-h-screen relative font-sans">
      
      {/* Botón Volver */}
      <Link to="/" className="fixed top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-full text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition shadow-sm group">
        <ArrowLeft className="h-4 w-4 transform group-hover:-translate-x-1 transition-transform" /> Volver al inicio
      </Link>

      {/* Cargador Central (Main Loader) */}
      <div className={`fixed inset-0 z-[9999] flex items-center justify-center bg-white dark:bg-slate-900 transition-opacity duration-500 ${showMainLoader ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="relative flex items-center justify-center">
          <div className="w-20 h-20 border-4 border-cyan-100 dark:border-slate-800 border-t-cyan-600 rounded-full animate-spin"></div>
          <div className="absolute w-12 h-12 bg-cyan-600 rounded-2xl shadow-xl shadow-cyan-500/20 flex items-center justify-center animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite]">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </div>
        </div>
      </div>

      {/* Barra de carga superior */}
      <div 
        className="fixed top-0 left-0 h-[3px] bg-cyan-500 z-[10000] transition-all duration-700 ease-out"
        style={{ width: `${loaderWidth}%`, opacity: showMainLoader ? 1 : 0 }}
      ></div>

      {/* Alertas Toast */}
      {alert.show && (
        <div className="fixed top-4 inset-x-0 flex justify-end px-6 z-50 animate-[slideDownFade_0.4s_ease-out] pointer-events-none">
          <div className={`pointer-events-auto bg-white dark:bg-slate-800 text-slate-900 dark:text-white border ${alert.type === 'error' ? 'border-red-500' : 'border-green-500'} rounded-xl shadow-lg px-5 py-4 w-80 flex items-start space-x-3`}>
            {alert.type === 'error' ? <XCircle className="text-red-500 shrink-0 text-xl" /> : <CheckCircle className="text-green-500 shrink-0 text-xl" />}
            <div className="flex-1">
              <h3 className="font-semibold text-sm">{alert.type === 'error' ? 'Hubo un error' : 'Éxito'}</h3>
              <p className="text-sm mt-1 text-slate-600 dark:text-slate-300">{alert.message}</p>
            </div>
            <button onClick={() => setAlert({ show: false })} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">✕</button>
          </div>
        </div>
      )}

      {/* Contenedor Principal Dividido */}
      <div className="grid grid-cols-1 md:grid-cols-2 min-h-screen">
        
        {/* Imagen en Móvil (Aparece arriba) */}
        <div className="md:hidden w-full h-64">
          <img src="/login.jpg" className="w-full h-full object-cover" alt="Doctora SOMA" />
        </div>

        {/* Columna Izquierda: Formulario */}
        <div className="flex flex-col justify-center items-center px-10 md:px-20 py-10 md:py-0 text-center w-full">
          
          {/* Logo SOMA */}
          <div className="flex items-center justify-center mb-8">
            <svg className="h-12 w-12 mr-3 text-cyan-700 dark:text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 16.0001C4.23858 16.0001 2 13.7615 2 11.0001C2 8.23869 4.23858 6.00012 7 6.00012C7.33283 6.00012 7.65854 6.03266 7.97583 6.09495C8.92901 3.75217 11.2663 2.00012 14 2.00012C17.4565 2.00012 20.3344 4.44578 21.0828 7.71787C21.3825 7.8985 21.7006 8.12435 22 8.40012C20.9533 8.77542 20.2386 9.76969 20.0424 10.941C20.0143 11.1087 20 11.2805 20 11.4547C20 12.4812 20.5049 13.3956 21.2773 13.963C21.0458 15.1386 20.0058 16.0001 18.7778 16.0001H7Z" />
              <path d="M14 11.4547V8.72739M14 11.4547V14.1819M14 11.4547H16.7273M14 11.4547H11.2727" />
            </svg>
            <h1 className="text-4xl font-black tracking-widest text-cyan-700 dark:text-cyan-400">
              SOMA
            </h1>
          </div>

          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white leading-tight">
            Inicia sesión en tu cuenta<br />como médico o profesional
          </h2>

          <p className="text-slate-600 dark:text-slate-300 mt-3 text-[15px]">
            ¿No tienes una cuenta?{' '}
            <Link to="/register" className="text-cyan-700 dark:text-cyan-400 font-bold hover:underline transition-all">
              Regístrate aquí →
            </Link>
          </p>

          <div className="flex items-center my-8 w-full max-w-sm">
            <div className="flex-grow border-t border-slate-300 dark:border-slate-700"></div>
            <span className="mx-4 text-slate-500 dark:text-slate-400 text-sm font-medium tracking-wider">SOMA CLOUD</span>
            <div className="flex-grow border-t border-slate-300 dark:border-slate-700"></div>
          </div>

          <form onSubmit={handleLogin} className="space-y-5 w-full max-w-sm">
            <div className="text-left">
              <label className="block text-slate-700 dark:text-slate-300 font-medium text-sm">Correo Electrónico</label>
              <input 
                type="email" 
                name="correo" 
                onChange={handleChange}
                required 
                className="w-full mt-1.5 px-4 py-3 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-cyan-600 outline-none transition-all" 
                placeholder="correo@ejemplo.com" 
              />
            </div>

            <div className="text-left">
              <label className="block text-slate-700 dark:text-slate-300 font-medium text-sm">Contraseña</label>
              <input 
                type="password" 
                name="contrasena" 
                onChange={handleChange}
                required 
                className="w-full mt-1.5 px-4 py-3 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-cyan-600 outline-none transition-all" 
                placeholder="••••••••" 
              />
            </div>

            <div className="flex justify-between items-center text-sm">
              <label className="flex items-center space-x-2 text-slate-700 dark:text-slate-300 cursor-pointer">
                <input type="checkbox" className="h-4 w-4 text-cyan-600 rounded border-slate-300 focus:ring-cyan-500" />
                <span>Recuérdame</span>
              </label>
              <a href="#" className="text-cyan-700 dark:text-cyan-400 font-medium hover:underline transition-all">¿Olvidaste tu contraseña?</a>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full mt-4 bg-cyan-700 dark:bg-cyan-600 text-white py-3.5 rounded-xl font-bold hover:bg-cyan-800 dark:hover:bg-cyan-700 transition-all transform hover:-translate-y-0.5 shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed"
            >
              {loading ? 'Verificando...' : 'Iniciar Sesión'}
            </button>
          </form>
        </div>

        {/* Columna Derecha: Imagen en Escritorio */}
        <div className="hidden md:block h-full">
          {/* Asegúrate de tener una imagen llamada login.jpg en tu carpeta public */}
          <img src="/login.jpg" className="w-full h-full object-cover" alt="Doctora SOMA" />
        </div>
        
      </div>

      <style>{`
        @keyframes slideDownFade {
          0% { opacity: 0; transform: translateY(-20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}