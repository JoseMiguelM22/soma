import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Sun, Moon, Check, Activity } from 'lucide-react';

export default function Home() {
  // Estados para controlar la UI
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileCreateOpen, setIsMobileCreateOpen] = useState(false);
  const [isMobileLoginOpen, setIsMobileLoginOpen] = useState(false);
  
  // Estado del Modo Oscuro (se inicia en dark por defecto como en tu captura)
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem('theme') === 'dark' || 
    (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
  );

  // Efecto para el Loader inicial
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const timer = setTimeout(() => {
      setIsLoading(false);
      document.body.style.overflow = 'unset';
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Efecto para aplicar el Modo Oscuro al HTML general
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  return (
    <div className="min-h-screen bg-[#d8f0e8] dark:bg-[#0f172a] transition-colors duration-300 font-sans">
      
      {/* PANTALLA DE CARGA (Loader) */}
      <div 
        className={`fixed inset-0 z-[10000] flex items-center justify-center bg-white dark:bg-[#0f172a] transition-all duration-700 ease-in-out ${
          isLoading ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
      >
        <div className="relative flex items-center justify-center">
          <div className="w-24 h-24 border-4 border-cyan-100 dark:border-slate-800 border-t-cyan-500 rounded-full animate-spin"></div>
          
          <div className="absolute w-14 h-14 bg-cyan-600 rounded-2xl flex items-center justify-center animate-pulse">
            <Activity className="h-8 w-8 text-white" />
          </div>
          
          <div className="absolute -bottom-12 w-40 text-center">
            <p className="text-cyan-700 dark:text-cyan-400 font-bold tracking-widest text-xs uppercase animate-pulse">
              Cargando SOMA...
            </p>
          </div>
        </div>
      </div>

      {/* HEADER / NAVBAR */}
      <header className="w-full py-6 bg-transparent fixed top-0 left-0 z-50 transition-all duration-300 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-6">

          {/* Logo */}
          <Link to="/" className="flex items-center group transition-all">
            <div className="text-3xl font-bold transition-colors">
              <span className="text-cyan-600 dark:text-cyan-400 font-normal">SOMA</span>
              <span className="text-cyan-800 dark:text-white font-bold">Cloud</span>
            </div>
          </Link>

          {/* Menú Desktop */}
          <nav className="hidden md:flex space-x-6 text-slate-800 dark:text-slate-200 text-[15px] items-center">
            <Link to="/" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">Inicio</Link>
            <Link to="/buscar-medicos" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">Buscar un médico</Link>
            <Link to="/que-es" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">¿Qué es SOMA?</Link>
            
            {/* Dropdown Crear Cuenta */}
            <div className="relative group py-2">
              <button className="hover:text-cyan-600 dark:hover:text-cyan-400 flex items-center transition-colors">
                Crear Cuenta <span className="ml-1 text-[10px]">▼</span>
              </button>
              <div className="absolute hidden group-hover:block left-0 pt-4 -mt-1 w-56 z-50">
                <div className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-100 shadow-xl rounded-lg py-2 border border-slate-100 dark:border-slate-700">
                  <Link to="/register" className="block px-4 py-2 hover:bg-cyan-50 dark:hover:bg-slate-700 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">
                    Registrarse como médico
                  </Link>
                </div>
              </div>
            </div>

            {/* Dropdown Iniciar Sesión */}
            <div className="relative group py-2">
              <button className="hover:text-cyan-600 dark:hover:text-cyan-400 flex items-center transition-colors">
                Iniciar Sesión <span className="ml-1 text-[10px]">▼</span>
              </button>
              <div className="absolute hidden group-hover:block left-0 pt-4 -mt-1 w-64 z-50">
                <div className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-100 shadow-xl rounded-lg py-2 border border-slate-100 dark:border-slate-700">
                  <Link to="/login" className="block px-4 py-2 hover:bg-cyan-50 dark:hover:bg-slate-700 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors border-b border-slate-50 dark:border-slate-700">
                    Iniciar Sesión Como Médico
                  </Link>
                </div>
              </div>
            </div>

            {/* Botón Tema */}
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="ml-4 p-2 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-yellow-400 hover:bg-slate-300 dark:hover:bg-slate-600 transition-all"
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </nav>

          {/* Botón Menú Móvil */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-slate-800 dark:text-white p-2"
          >
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* MENÚ MÓVIL DESPLEGABLE */}
        <div className={`
          md:hidden absolute top-full left-0 w-full bg-white dark:bg-slate-900 shadow-lg border-b border-slate-100 dark:border-slate-800
          transition-all duration-300 overflow-hidden ${isMobileMenuOpen ? 'max-h-[500px] py-4' : 'max-h-0 py-0'}
        `}>
          <div className="flex flex-col px-6 space-y-4 text-slate-800 dark:text-slate-100 text-lg">
            <Link to="/" className="hover:text-cyan-600 dark:hover:text-cyan-400">Inicio</Link>
            <Link to="/buscar-medicos" className="hover:text-cyan-600 dark:hover:text-cyan-400">Buscar un médico</Link>
            <Link to="/que-es" className="hover:text-cyan-600 dark:hover:text-cyan-400">¿Qué es SOMA?</Link>

            {/* Acordeón Crear Cuenta Móvil */}
            <div>
              <button 
                onClick={() => setIsMobileCreateOpen(!isMobileCreateOpen)} 
                className="w-full text-left hover:text-cyan-600 dark:hover:text-cyan-400"
              >
                Crear Cuenta ▾
              </button>
              {isMobileCreateOpen && (
                <div className="ml-4 mt-2 flex flex-col space-y-2 text-base">
                  <Link to="/register" className="hover:text-cyan-600 dark:hover:text-cyan-400">Registrarse como médico</Link>
                </div>
              )}
            </div>

            {/* Acordeón Login Móvil */}
            <div>
              <button 
                onClick={() => setIsMobileLoginOpen(!isMobileLoginOpen)} 
                className="w-full text-left hover:text-cyan-600 dark:hover:text-cyan-400"
              >
                Iniciar Sesión ▾
              </button>
              {isMobileLoginOpen && (
                <div className="ml-4 mt-2 flex flex-col space-y-2 text-base">
                  <Link to="/login" className="hover:text-cyan-600 dark:hover:text-cyan-400">Iniciar Sesión Como Médico</Link>
                </div>
              )}
            </div>

            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="w-full px-3 py-2 mt-4 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100 flex items-center justify-center gap-2"
            >
              {isDarkMode ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} />}
              {isDarkMode ? 'Modo Claro' : 'Modo Oscuro'}
            </button>
          </div>
        </div>
      </header>

      {/* SECCIÓN HERO (Principal) */}
      <section className="max-w-7xl mx-auto px-6 md:px-10 lg:px-20 pt-32 pb-20 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        
        {/* Columna Izquierda: Tarjeta de Información */}
        <div className="bg-white dark:bg-[#1e293b] shadow-xl rounded-xl p-8 md:p-10 transition-all border border-slate-100 dark:border-transparent">
          
          <h2 className="text-[28px] md:text-3xl font-bold mb-6 text-slate-900 dark:text-white leading-tight">
            ¿Eres un Profesional de la Salud?
          </h2>

          <Link to="/register" className="inline-block bg-blue-700 dark:bg-blue-600 text-white px-5 py-2.5 rounded-md text-sm font-medium hover:bg-blue-800 dark:hover:bg-blue-700 transition-colors">
            Regístrate aquí
          </Link>

          <p className="text-slate-600 dark:text-slate-300 mt-6 mb-8 text-[15px]">
            Obtén 30 días gratis para probar nuestras herramientas profesionales.
          </p>

          <ul className="space-y-4 text-slate-700 dark:text-slate-200 text-sm md:text-[15px]">
            <li className="flex items-start">
              <Check className="text-green-500 shrink-0 mr-3 mt-0.5" size={18} strokeWidth={3} />
              <span>Historias clinicas personalizadas (adaptadas para cualquier especialidad médica)</span>
            </li>
            <li className="flex items-start">
              <Check className="text-green-500 shrink-0 mr-3 mt-0.5" size={18} strokeWidth={3} />
              <span>Compartir historias clínicas o resultados de estudios (imágenes, tomografías, ecografias, resonancia, laboratorios) hacia otros médicos o profesionales de la salud.</span>
            </li>
            <li className="flex items-start">
              <Check className="text-green-500 shrink-0 mr-3 mt-0.5" size={18} strokeWidth={3} />
              <span>Agenda digital para citas.</span>
            </li>
            <li className="flex items-start">
              <Check className="text-green-500 shrink-0 mr-3 mt-0.5" size={18} strokeWidth={3} />
              <span>Recordatorios por WhatsApp.</span>
            </li>
            <li className="flex items-start">
              <Check className="text-green-500 shrink-0 mr-3 mt-0.5" size={18} strokeWidth={3} />
              <span>Reportes PDF personalizados.</span>
            </li>
            <li className="flex items-start">
              <Check className="text-green-500 shrink-0 mr-3 mt-0.5" size={18} strokeWidth={3} />
              <span>Acceso desde cualquier dispositivo (teléfono, tablet y computadores)</span>
            </li>
          </ul>
        </div>

        {/* Columna Derecha: Ilustración */}
        <div className="flex justify-center items-center">
          <img 
            src="/InicioMedSys.svg" 
            alt="Doctores usando Soma"
            className="w-4/5 md:w-full max-w-lg drop-shadow-lg"
          />
        </div>

      </section>

    </div>
  );
}