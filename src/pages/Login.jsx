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
<div 
  className="min-h-screen bg-[#050816] overflow-hidden" 
  style={{ fontFamily: "'Nunito', sans-serif" }}
>

  {/* ALERTAS */}
  {alert.show && (
    <div className="fixed top-5 left-0 right-0 flex justify-center z-50">
      <div
        className={`px-5 py-3 rounded-xl shadow-lg text-white text-sm font-bold tracking-wide ${
          alert.type === "success"
            ? "bg-green-500"
            : "bg-red-500"
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

      {/* PANEL IZQUIERDO */}
      {/* Alineado hacia la izquierda */}
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

            {/* Blur grande */}
            <div className="absolute left-[-60px] top-[120px] w-[360px] h-[360px] rounded-full bg-white/40 blur-[120px]" />

            {/* Blur lateral */}
            <div className="absolute right-[-80px] top-[40px] w-[300px] h-[300px] rounded-full bg-[#00FFB3]/20 blur-[110px]" />

            {/* Blur inferior */}
            <div className="absolute bottom-[-80px] left-[140px] w-[250px] h-[250px] rounded-full bg-white/20 blur-[90px]" />

            {/* Textura */}
            <div className="absolute inset-0 opacity-[0.05] bg-[radial-gradient(circle,black_1px,transparent_1px)] bg-[length:8px_8px]" />

          </div>

        </div>

      </div>

      {/* LOGIN */}
      {/* Alineado hacia la derecha */}
      <div className="w-full lg:w-1/2 flex justify-end items-center">
        <div className="w-full max-w-[400px]">

          {/* Logo móvil */}
          <div className="lg:hidden flex justify-center mb-10">
             {/* Modo Claro (Logo Negro) */}
                 <img src="/soma_logo.png" alt="SOMA Logo" className="h-15 object-contain block dark:hidden transition-opacity duration-300" />
                  {/* Modo Oscuro (Logo Blanco) */}
                  <img src="/soma_logo_blanco.png" alt="SOMA Logo" className="h-15 object-contain hidden dark:block transition-opacity duration-300" />
          </div>

          {/* Logo escritorio */}
          <div className="hidden lg:block text-center">
             {/* Modo Claro (Logo Negro) */}
                 <img src="/soma_logo.png" alt="SOMA Logo" className="h-10 mx-auto mb-8 object-contain block dark:hidden transition-opacity duration-300" />
                  {/* Modo Oscuro (Logo Blanco) */}
                  <img src="/soma_logo_blanco.png" alt="SOMA Logo" className="h-10 mx-auto mb-8 object-contain hidden dark:block transition-opacity duration-300" />
          </div>

          <div className="text-center mb-10">

            <h1 className="text-4xl font-extrabold text-white mb-3 tracking-tight">
              Iniciar Sesión
            </h1>

            <p className="text-[#A1A1AA] text-sm font-semibold leading-relaxed max-w-[310px] mx-auto">
              Accede a tu cuenta para continuar gestionando tus pacientes
              y consultas.
            </p>

          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

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
                placeholder="juan_miguel0505@outlook.com"
                required
                className="
                w-full
                py-3
                px-4
                rounded-xl
                bg-white
                text-sm
                font-semibold
                text-gray-900
                placeholder:text-gray-400
                placeholder:font-medium
                outline-none
                border
                border-transparent
                focus:border-[#8B5CF6]
                focus:ring-2
                focus:ring-[#8B5CF6]/30
                transition-all
                duration-300
                "
              />
            </div>

            {/* PASSWORD */}
            {!isResettingPassword && (
              <div>
                <label className="block text-gray-200 text-sm font-bold mb-2 tracking-wide">
                  Contraseña
                </label>

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="contrasena"
                    value={formData.contrasena}
                    onChange={handleChange}
                    placeholder="••••••••••"
                    required
                    className="
                    w-full
                    py-3
                    px-4
                    pr-12
                    rounded-xl
                    bg-white
                    text-sm
                    font-bold
                    text-gray-900
                    placeholder:text-gray-400
                    outline-none
                    border
                    border-transparent
                    focus:border-[#8B5CF6]
                    focus:ring-2
                    focus:ring-[#8B5CF6]/30
                    transition-all
                    duration-300
                    "
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
                  >
                    {showPassword
                      ? <EyeOff size={18}/>
                      : <Eye size={18}/>
                    }
                  </button>
                </div>
              </div>
            )}

            {/* BOTÓN */}
            <button
              type="submit"
              disabled={loading}
              className="
              w-full
              py-3
              mt-4
              rounded-xl
              bg-[#8B5CF6]
              hover:bg-[#7C3AED]
              text-white
              text-sm
              font-extrabold
              tracking-wide
              shadow-lg
              shadow-[#8B5CF6]/20
              transition-all
              duration-300
              transform
              hover:-translate-y-0.5
              "
            >
              {loading
                ? "Procesando..."
                : "Iniciar Sesión"}
            </button>

          </form>

          <div className="text-center mt-8">
            <p className="text-[#A1A1AA] text-sm font-semibold">
              ¿No tienes cuenta?

              <Link
                to="/register"
                className="text-[#8B5CF6] ml-2 font-extrabold hover:text-[#A78BFA] transition-colors"
              >
                Crear Cuenta
              </Link>
            </p>
          </div>

        </div>
      </div>

    </div>

  </div>

</div>
);
}