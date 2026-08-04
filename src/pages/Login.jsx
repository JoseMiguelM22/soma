import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { ArrowLeft, CheckCircle, XCircle, Eye, EyeOff, Activity, ChevronDown } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // Controla si estamos en modo "Login" o "Recuperar Contraseña"
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  
  // Controla ver/ocultar contraseña
  const [showPassword, setShowPassword] = useState(false);
  
  // Estado para el menú desplegable de ROL
  const [rolSeleccionado, setRolSeleccionado] = useState('especialista');
  
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

  // Función unificada con lógica de Roles y Validación de Estado
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (isResettingPassword) {
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(formData.correo, {
          // Asegúrate de tener la vista de ActualizarContrasena en esta ruta
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
        // 1. Auth con Supabase
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.correo,
          password: formData.contrasena,
        });
        if (error) throw error;

        // 2. Buscar el rol y ESTADO DE CUENTA en BD
        const { data: dbUser, error: userError } = await supabase
          .from('usuarios')
          .select('rol, estado_cuenta')
          .eq('id_auth', data.user.id)
          .single();

        if (userError) throw userError;

        // 3. VALIDACIÓN DE CREDENCIALES (EL CADENERO)
        if (dbUser.estado_cuenta === 'Pendiente') {
          await supabase.auth.signOut();
          throw new Error('Tu cuenta está en revisión. Un directivo debe validar tus credenciales.');
        }

        if (dbUser.estado_cuenta === 'Rechazada') {
          await supabase.auth.signOut();
          throw new Error('Tu solicitud de acceso ha sido denegada por la directiva.');
        }

        // 4. Validar Seguridad de Roles
        if (dbUser.rol !== rolSeleccionado) {
          await supabase.auth.signOut();
          throw new Error(`Acceso denegado: Tu cuenta no es de ${rolSeleccionado === 'especialista' ? 'Médico Especialista' : (rolSeleccionado === 'departamento' ? 'Asistente (Admisión)' : 'Directivo')}.`);
        }

        // 5. Éxito y redirección según rol
        setAlert({ show: true, type: 'success', message: '¡Bienvenido de vuelta a SOMA!' });
        
        if (dbUser.rol === 'directivo') {
          setTimeout(() => navigate('/directiva'), 1000);
        } else if (dbUser.rol === 'departamento') {
          setTimeout(() => navigate('/admision'), 1000);
        } else {
          setTimeout(() => navigate('/dashboard'), 1000);
        }

      } catch (error) {
        const isCustomError = error.message.includes('Acceso denegado') || 
                              error.message.includes('Tu cuenta está en revisión') || 
                              error.message.includes('Tu solicitud de acceso');
                              
        setAlert({ 
          show: true, 
          type: 'error', 
          message: isCustomError ? error.message : 'Credenciales incorrectas. Verifica tu correo y contraseña.' 
        });
      } finally {
        setLoading(false);
      }
    }
  };

  return (
<div 
  className="min-h-screen bg-[#050816] overflow-hidden" 
  style={{ fontFamily: "'Nunito', sans-serif" }}
>

  {/* ALERTAS */}
  {alert.show && (
    <div className="fixed top-5 left-0 right-0 flex justify-center z-50">
      <div
        className={`px-5 py-3 rounded-xl shadow-lg text-white text-sm font-bold tracking-wide animate-[fadeIn_0.3s_ease-out] ${
          alert.type === "success"
            ? "bg-green-500"
            : "bg-red-500"
        }`}
      >
        {alert.message}
      </div>
    </div>
  )}

  <div className="max-w-[1536px] mx-auto min-h-screen px-8 lg:px-16 py-12 flex items-center justify-center">

    <div className="flex flex-col lg:flex-row items-center justify-between w-full gap-12 lg:gap-20 xl:gap-32">

      {/* PANEL IZQUIERDO */}
      <div className="hidden lg:flex justify-start items-center w-full lg:w-1/2 h-full">
        <div className="relative">
          <img
            src="/soma_logo.png"
            alt="SOMA"
            className="absolute top-8 left-8 h-8 z-20"
          />
          <div
            className="
            w-[500px]
            h-[625px]
            rounded-[38px]
            overflow-hidden
            relative
            border
            border-white/10
            shadow-2xl
            "
          >
            {/* Fondo */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#D8FFF4] via-[#9BF3DB] to-[#17C79A]" />
            {/* Blurs */}
            <div className="absolute left-[-60px] top-[120px] w-[360px] h-[360px] rounded-full bg-white/40 blur-[120px]" />
            <div className="absolute right-[-80px] top-[40px] w-[300px] h-[300px] rounded-full bg-[#00FFB3]/20 blur-[110px]" />
            <div className="absolute bottom-[-80px] left-[140px] w-[250px] h-[250px] rounded-full bg-white/20 blur-[90px]" />
            {/* Textura */}
            <div className="absolute inset-0 opacity-[0.05] bg-[radial-gradient(circle,black_1px,transparent_1px)] bg-[length:8px_8px]" />
          </div>
        </div>
      </div>

      {/* LOGIN */}
      <div className="w-full lg:w-1/2 flex justify-end items-center">
        <div className="w-full max-w-[400px]">

          {/* Logo móvil e imagen */}
          <div className="lg:hidden flex justify-center mb-10">
            <img src="/soma_logo_blanco.png" alt="SOMA Logo" className="h-15 object-contain dark:block transition-opacity duration-300" />
          </div>
          <div className="hidden lg:block text-center">
            <img src="/soma_logo_blanco.png" alt="SOMA Logo" className="h-11 mx-auto mb-8 object-contain dark:block transition-opacity duration-300" />
          </div>

          {/* Títulos dinámicos dependiendo de si está reseteando o no */}
          <div className="text-center mb-10">
            <h1 className="text-4xl font-extrabold text-white mb-3 tracking-tight animate-[fadeIn_0.3s_ease-out]">
              {isResettingPassword ? 'Recuperar Clave' : 'Iniciar Sesión'}
            </h1>
            <p className="text-[#A1A1AA] text-sm font-semibold leading-relaxed max-w-[310px] mx-auto animate-[fadeIn_0.3s_ease-out]">
              {isResettingPassword 
                ? 'Ingresa tu correo y te enviaremos un enlace para crear una nueva contraseña.' 
                : 'Accede a tu cuenta para continuar gestionando tus pacientes y consultas.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 animate-[fadeIn_0.3s_ease-out]">

            {/* 1. DESPLEGABLE DE ROL (Solo se muestra si NO está recuperando clave) */}
            {!isResettingPassword && (
              <div>
                <label className="block text-gray-200 text-sm font-bold mb-2 tracking-wide">
                  Perfil de Acceso
                </label>
                <div className="relative">
                  <select
                    value={rolSeleccionado}
                    onChange={(e) => setRolSeleccionado(e.target.value)}
                    className="w-full py-3 px-4 rounded-xl bg-white text-sm font-bold text-gray-900 outline-none border border-transparent focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#8B5CF6]/30 transition-all duration-300 appearance-none cursor-pointer"
                  >
                    <option value="especialista">Médico Especialista</option>
                    <option value="departamento">Asistente (Depto. Historias Clinicas)</option>
                    <option value="directivo">Directivo / Administrador</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-gray-500">
                    <ChevronDown size={18} />
                  </div>
                </div>
              </div>
            )}

            {/* EMAIL */}
            <div>
              <label className="block text-gray-200 text-sm font-bold mb-2 tracking-wide">
                Email
              </label>
              <input
                type="email"
                name="correo"
                value={formData.correo}
                onChange={handleChange}
                placeholder="doctor@hospital.com"
                required
                className="w-full py-3 px-4 rounded-xl bg-white text-sm font-semibold text-gray-900 placeholder:text-gray-400 placeholder:font-medium outline-none border border-transparent focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#8B5CF6]/30 transition-all duration-300"
              />
            </div>

            {/* PASSWORD (Se oculta si está recuperando clave) */}
            {!isResettingPassword && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-gray-200 text-sm font-bold tracking-wide">
                    Contraseña
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsResettingPassword(true)}
                    className="text-[#8B5CF6] hover:text-[#A78BFA] text-xs font-bold transition-colors outline-none"
                  >
                    ¿Olvidaste tu clave?
                  </button>
                </div>

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="contrasena"
                    value={formData.contrasena}
                    onChange={handleChange}
                    placeholder="••••••••••"
                    required
                    className="w-full py-3 px-4 pr-12 rounded-xl bg-white text-sm font-bold text-gray-900 placeholder:text-gray-400 outline-none border border-transparent focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#8B5CF6]/30 transition-all duration-300"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                  </button>
                </div>
              </div>
            )}

            {/* BOTÓN PRINCIPAL */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 mt-4 rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-sm font-extrabold tracking-wide shadow-lg shadow-[#8B5CF6]/20 transition-all duration-300 transform hover:-translate-y-0.5"
            >
              {loading
                ? "Procesando..."
                : isResettingPassword ? "Enviar Enlace de Recuperación" : "Iniciar Sesión"}
            </button>
            
            {/* BOTÓN SECUNDARIO Y AYUDA (Solo aparece en modo recuperación) */}
            {isResettingPassword && (
              <div className="animate-[fadeIn_0.3s_ease-out]">
                <button
                  type="button"
                  onClick={() => setIsResettingPassword(false)}
                  className="w-full py-3 mt-2 rounded-xl border border-white/10 hover:bg-white/5 text-gray-300 text-sm font-bold tracking-wide transition-all duration-300"
                >
                  Cancelar y Volver
                </button>
                
                {/* MENSAJE PARA USUARIOS QUE OLVIDARON EL CORREO */}
                <p className="text-center text-xs text-slate-500 font-medium mt-8 leading-relaxed">
                  ¿No recuerdas el correo con el que te registraste? <br className="hidden sm:block" />
                  <span className="text-slate-400">Contacta a la Junta Directiva para verificar tu usuario en el sistema.</span>
                </p>
              </div>
            )}

          </form>

          {/* FOOTER - REGISTRO */}
          {!isResettingPassword && (
            <div className="text-center mt-8 animate-[fadeIn_0.3s_ease-out]">
              <p className="text-[#A1A1AA] text-sm font-semibold">
                ¿No tienes cuenta?
                <Link to="/register" className="text-[#8B5CF6] ml-2 font-extrabold hover:text-[#A78BFA] transition-colors">
                  Crear Cuenta
                </Link>
              </p>
              <div className="flex justify-center items-center w-full mt-2">
                <Link to="/" className="text-xs font-bold text-slate-500 flex items-center gap-1.5 hover:text-white transition-colors group">
                  <ArrowLeft size={19} className="group-hover:-translate-x-1 transition-transform" /> 
                  Volver al inicio
                </Link>
              </div>
            </div>
          )}

        </div>
      </div>

    </div>
  </div>
</div>
);
}