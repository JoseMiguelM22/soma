import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Sun, Moon, Check, Activity, Sparkles, ArrowRight, MessageCircle, FileText, Pill, Calendar } from 'lucide-react';

// Array con las especialidades y sus colores para mapearlas fácil
const especialidades = [
  { nombre: "Medicina General", color: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400" },
  { nombre: "Odontología", color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400" },
  { nombre: "Ginecología y Obstetricia", color: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400" },
  { nombre: "Pediatría", color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" },
  { nombre: "Cardiología", color: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400" },
  { nombre: "Dermatología", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" },
  { nombre: "Traumatología", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  { nombre: "Neurología", color: "bg-slate-200 text-slate-700 dark:bg-slate-700/50 dark:text-slate-300" },
  { nombre: "Nutrición", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
  { nombre: "Urología", color: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400" },
  { nombre: "Otorrinolaringología", color: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400" },
  { nombre: "Endocrinología", color: "bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/30 dark:text-fuchsia-400" },
  { nombre: "Gastroenterología", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  { nombre: "Neumología", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300" },
  { nombre: "Medicina Estética", color: "bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-300" },
  { nombre: "Oncología", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
  { nombre: "Nefrología", color: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400" },
  { nombre: "Ortodoncia", color: "bg-fuchsia-50 text-fuchsia-600 dark:bg-fuchsia-900/20 dark:text-fuchsia-300" },
  { nombre: "Imagenología", color: "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-300" },
  { nombre: "Radiología", color: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-300" }
];

export default function Home() {
  // Estados para controlar la UI
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileCreateOpen, setIsMobileCreateOpen] = useState(false);
  const [isMobileLoginOpen, setIsMobileLoginOpen] = useState(false);
  
  // Estado del Modo Oscuro
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
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Efecto para aplicar el Modo Oscuro
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
    /* Contenedor Principal */
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#0a0a0a] transition-colors duration-500 font-sans relative overflow-x-hidden">
      
      {/* PANTALLA DE CARGA (Loader) */}
      <div className={`fixed inset-0 z-[10000] flex items-center justify-center bg-white dark:bg-[#0f172a] transition-all duration-700 ease-in-out ${isLoading ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
        <div className="relative flex items-center justify-center">
          <div className="w-24 h-24 border-4 border-cyan-100 dark:border-slate-800 border-t-cyan-500 rounded-full animate-spin"></div>
          <div className="absolute w-14 h-14 bg-cyan-600 rounded-2xl flex items-center justify-center animate-pulse">
            <Activity className="h-8 w-8 text-white" />
          </div>
          <div className="absolute -bottom-12 w-40 text-center">
            <p className="text-cyan-700 dark:text-cyan-400 font-bold tracking-widest text-xs uppercase animate-pulse">
              Iniciando SOMA...
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================
          BLOQUE 1: HEADER Y HERO (Con fondo degradado)
          ======================================================== */}
      <div className="relative bg-gradient-to-br from-blue-700 via-cyan-600 to-teal-500 dark:from-slate-900 dark:via-[#0a192f] dark:to-[#082f3a] pb-12">
        
        {/* HEADER / NAVBAR */}
        <header className="w-full py-5 bg-transparent absolute top-0 left-0 z-50 transition-all duration-300">
          <div className="max-w-7xl mx-auto flex justify-between items-center px-6 lg:px-10">

            {/* Logo SOMA */}
            <Link to="/" className="flex items-center group transition-all">
              <div className="text-3xl font-bold transition-colors text-white">
                <span className="font-normal opacity-90">SOMA</span>
                <span className="font-black">Cloud</span>
              </div>
            </Link>

            {/* Menú Desktop */}
            <nav className="hidden lg:flex space-x-8 text-white text-[15px] items-center font-medium">
              <Link to="/" className="hover:text-cyan-200 transition-colors">Inicio</Link>
              <Link to="/funcionalidades" className="hover:text-cyan-200 transition-colors">Funcionalidades</Link>
              <Link to="/precios" className="hover:text-cyan-200 transition-colors">Precios</Link>
              
              {/* Dropdown Iniciar Sesión */}
              <div className="relative group py-2">
                <button className="hover:text-cyan-200 flex items-center transition-colors">
                  Iniciar Sesión <span className="ml-1 text-[10px]">▼</span>
                </button>
                <div className="absolute hidden group-hover:block left-1/2 -translate-x-1/2 pt-4 -mt-1 w-56 z-50">
                  <div className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 shadow-xl rounded-xl py-2 border border-slate-100 dark:border-slate-700">
                    <Link to="/login" className="block px-4 py-2 hover:bg-cyan-50 dark:hover:bg-slate-700 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors font-semibold">
                      Soy Médico / Especialista
                    </Link>
                  </div>
                </div>
              </div>

              <Link to="/register" className="bg-white/20 hover:bg-white text-white hover:text-cyan-700 backdrop-blur-md border border-white/30 px-5 py-2 rounded-full font-bold transition-all shadow-lg shadow-black/10">
                Regístrate
              </Link>

              {/* Botón Tema */}
              <button 
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="ml-2 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all backdrop-blur-sm"
              >
                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            </nav>

            {/* Botón Menú Móvil */}
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="lg:hidden text-white p-2">
              {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>

          {/* MENÚ MÓVIL DESPLEGABLE */}
          <div className={`lg:hidden absolute top-full left-0 w-full bg-white dark:bg-slate-900 shadow-2xl border-b border-slate-100 dark:border-slate-800 transition-all duration-300 overflow-hidden ${isMobileMenuOpen ? 'max-h-[500px] py-4' : 'max-h-0 py-0'}`}>
            <div className="flex flex-col px-6 space-y-4 text-slate-800 dark:text-slate-100 text-lg font-medium">
              <Link to="/" className="hover:text-cyan-600 dark:hover:text-cyan-400">Inicio</Link>
              <Link to="/funcionalidades" className="hover:text-cyan-600 dark:hover:text-cyan-400">Funcionalidades</Link>
              <Link to="/login" className="hover:text-cyan-600 dark:hover:text-cyan-400">Iniciar Sesión</Link>
              <Link to="/register" className="text-cyan-600 dark:text-cyan-400 font-bold">Regístrate Gratis</Link>
              <button onClick={() => setIsDarkMode(!isDarkMode)} className="w-full px-3 py-2 mt-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 flex items-center justify-center gap-2 font-bold border border-slate-200 dark:border-slate-700">
                {isDarkMode ? <Sun size={18} className="text-yellow-500" /> : <Moon size={18} className="text-slate-600" />}
                {isDarkMode ? 'Modo Claro' : 'Modo Oscuro'}
              </button>
            </div>
          </div>
        </header>

        {/* SECCIÓN HERO */}
        <section className="flex items-center max-w-7xl mx-auto px-6 lg:px-10 pt-32 pb-20 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center w-full">
            
            <div className="order-2 lg:order-1 flex flex-col justify-center text-center lg:text-left z-10">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-white text-sm font-medium mb-6 backdrop-blur-sm shadow-sm mx-auto lg:mx-0 w-fit">
                <Sparkles size={16} className="text-yellow-300" /> 
                Software para especialistas de la salud
              </div>

              <h1 className="text-[40px] leading-[1.1] md:text-5xl lg:text-[64px] font-black text-white mb-6 tracking-tight drop-shadow-md">
                Transforma tu consultorio con historias clínicas <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-teal-200 drop-shadow-none">digitales</span>
              </h1>

              <p className="text-base md:text-lg text-blue-50/90 dark:text-slate-300 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
                Software médico diseñado para consultorios en Venezuela. Reduce costos, 
                aumenta tu eficiencia y ofrece la mejor atención a tus pacientes desde cualquier dispositivo.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4 mb-10 justify-center lg:justify-start">
                <Link to="/register" className="w-full sm:w-auto bg-white text-cyan-700 hover:bg-slate-50 px-8 py-3.5 rounded-xl font-bold text-lg transition-all shadow-xl shadow-black/10 flex items-center justify-center gap-2 transform hover:-translate-y-0.5">
                  Empieza Gratis - 30 Días <ArrowRight size={20} />
                </Link>
                <Link to="/funcionalidades" className="w-full sm:w-auto bg-transparent border-2 border-white/30 hover:bg-white/10 text-white px-8 py-3.5 rounded-xl font-bold text-lg transition-all backdrop-blur-sm flex items-center justify-center">
                  Ver funcionalidades
                </Link>
              </div>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-3 mt-4 pt-6 border-t border-white/10 text-white/80 text-sm font-medium">
                <div className="flex items-center gap-1.5"><Check size={16} className="text-teal-300" /> Sin tarjeta de crédito</div>
                <div className="flex items-center gap-1.5"><Check size={16} className="text-teal-300" /> Cancela cuando quieras</div>
                <div className="flex items-center gap-1.5"><Check size={16} className="text-teal-300" /> Soporte incluido</div>
              </div>

              <div className="mt-8 flex justify-center lg:justify-start">
                <a href="https://wa.me/584120000000" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-white/90 hover:text-white border border-white/20 hover:bg-white/10 px-5 py-2 rounded-full text-sm font-medium transition-colors backdrop-blur-sm">
                  <MessageCircle size={16} className="text-[#25D366]" /> Hablar con un asesor de SOMA
                </a>
              </div>
            </div>

            <div className="order-1 lg:order-2 flex justify-center items-center relative z-0">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-cyan-400/20 dark:bg-cyan-900/40 blur-[100px] rounded-full pointer-events-none"></div>
              <div className="relative w-full max-w-lg xl:max-w-xl animate-float drop-shadow-2xl">
                <img src="/InicioMedSys.svg" alt="Plataforma SOMA Cloud" className="w-full h-auto object-contain relative z-10" />
                <div className="absolute -right-4 top-10 bg-white dark:bg-slate-800 text-slate-800 dark:text-white px-4 py-2 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 font-bold text-sm flex items-center gap-2 animate-bounce-slow z-20">
                  <Check className="text-emerald-500" size={16} /> Historia guardada
                </div>
              </div>
            </div>

          </div>
        </section>
      </div>

      {/* ========================================================
          BLOQUE 2: MÉTRICAS (Estadísticas)
          ======================================================== */}
      <section className="bg-white dark:bg-[#111111] py-12 border-b border-slate-100 dark:border-white/5 relative z-10 -mt-8 rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 text-center">
            
            <div className="flex flex-col items-center justify-center p-4">
              <h3 className="text-3xl md:text-4xl font-black text-cyan-600 dark:text-cyan-400">+1.000</h3>
              <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm font-medium">Médicos registrados</p>
            </div>
            
            <div className="flex flex-col items-center justify-center p-4">
              <h3 className="text-3xl md:text-4xl font-black text-cyan-600 dark:text-cyan-400">+50.000</h3>
              <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm font-medium">Consultas gestionadas</p>
            </div>
            
            <div className="flex flex-col items-center justify-center p-4">
              <h3 className="text-3xl md:text-4xl font-black text-cyan-600 dark:text-cyan-400">20</h3>
              <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm font-medium">Especialidades médicas</p>
            </div>
            
            <div className="flex flex-col items-center justify-center p-4">
              <h3 className="text-3xl md:text-4xl font-black text-cyan-600 dark:text-cyan-400">99.9%</h3>
              <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm font-medium">Disponibilidad</p>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================
          BLOQUE 3: FUNCIONALIDADES (Grid de Tarjetas)
          ======================================================== */}
      <section className="bg-white dark:bg-[#111111] py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          
          {/* Cabecera de sección */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400 px-4 py-1.5 rounded-full text-sm font-bold tracking-wide">
              Funcionalidades
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mt-6 mb-4">
              Todo lo que necesitas para tu consultorio
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-lg">
              Desde historias clínicas hasta la gestión de tu agenda, SOMA Cloud tiene cada herramienta que un profesional de la salud necesita para optimizar su tiempo.
            </p>
          </div>

          {/* Grid de Tarjetas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-[#1a1a1a] p-8 rounded-[2rem] shadow-[0_4px_20px_rgba(0,0,0,0.05)] dark:shadow-none border border-slate-100 dark:border-white/5 hover:-translate-y-2 hover:shadow-xl dark:hover:border-cyan-500/50 transition-all duration-300 group">
              <div className="bg-cyan-50 dark:bg-cyan-900/20 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <FileText className="text-cyan-600 dark:text-cyan-400" size={26} strokeWidth={2.5} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Historias Clínicas Digitales</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                Crea historias primarias y evolutivas con formularios personalizados para cualquier especialidad médica de forma rápida y segura.
              </p>
            </div>

            <div className="bg-white dark:bg-[#1a1a1a] p-8 rounded-[2rem] shadow-[0_4px_20px_rgba(0,0,0,0.05)] dark:shadow-none border border-slate-100 dark:border-white/5 hover:-translate-y-2 hover:shadow-xl dark:hover:border-cyan-500/50 transition-all duration-300 group">
              <div className="bg-cyan-50 dark:bg-cyan-900/20 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Pill className="text-cyan-600 dark:text-cyan-400" size={26} strokeWidth={2.5} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Récipes e Indicaciones</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                Genera récipes digitales en PDF con tu membrete, datos del doctor y del paciente de forma completamente automatizada.
              </p>
            </div>

            <div className="bg-white dark:bg-[#1a1a1a] p-8 rounded-[2rem] shadow-[0_4px_20px_rgba(0,0,0,0.05)] dark:shadow-none border border-slate-100 dark:border-white/5 hover:-translate-y-2 hover:shadow-xl dark:hover:border-cyan-500/50 transition-all duration-300 group">
              <div className="bg-cyan-50 dark:bg-cyan-900/20 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Calendar className="text-cyan-600 dark:text-cyan-400" size={26} strokeWidth={2.5} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Agenda Digital</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                Gestiona citas, consultas y reuniones con un calendario intuitivo y visual. Mantén el control total de tu tiempo en el consultorio.
              </p>
            </div>

            <div className="bg-white dark:bg-[#1a1a1a] p-8 rounded-[2rem] shadow-[0_4px_20px_rgba(0,0,0,0.05)] dark:shadow-none border border-slate-100 dark:border-white/5 hover:-translate-y-2 hover:shadow-xl dark:hover:border-cyan-500/50 transition-all duration-300 group">
              <div className="bg-cyan-50 dark:bg-cyan-900/20 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <MessageCircle className="text-cyan-600 dark:text-cyan-400" size={26} strokeWidth={2.5} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Recordatorios WhatsApp</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                Conecta directamente con tus pacientes y envíales recordatorios de sus consultas por WhatsApp con un solo clic.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          BLOQUE 4: ESPECIALIDADES MÉDICAS (NUEVO CON FONDO GRIS/AZUL)
          ======================================================== */}
      <section className="py-24 bg-slate-100 dark:bg-[#0f172a] border-t border-slate-200 dark:border-white/5 relative">
        <div className="max-w-5xl mx-auto px-6 lg:px-10 text-center">
          
          {/* Badge */}
          <span className="bg-cyan-200/50 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-300 px-4 py-1.5 rounded-full text-sm font-bold tracking-wide inline-block">
            Especialidades
          </span>

          {/* Títulos */}
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mt-6 mb-4">
            Diseñado para más de 20 especialidades
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto mb-12">
            SOMA Cloud se adapta a las necesidades de cada especialidad médica con formularios y herramientas personalizadas.
          </p>

          {/* Contenedor de Etiquetas (Pills) */}
          <div className="flex flex-wrap justify-center gap-3 md:gap-4">
            {especialidades.map((esp, index) => (
              <div 
                key={index}
                className={`px-5 py-2.5 rounded-full text-sm font-bold shadow-sm transition-transform hover:-translate-y-1 cursor-default border border-white/50 dark:border-transparent ${esp.color}`}
              >
                {esp.nombre}
              </div>
            ))}
            
            {/* Botón Final Oscuro */}
            <div className="px-6 py-2.5 rounded-full text-sm font-bold shadow-md transition-transform hover:-translate-y-1 cursor-default bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 border border-transparent">
              + Cualquier especialidad
            </div>
          </div>
          
        </div>
      </section>

      {/* ANIMACIONES CSS INYECTADAS */}
      <style>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
          100% { transform: translateY(0px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-bounce-slow {
          animation: float 8s ease-in-out infinite reverse;
        }
      `}</style>

    </div>
  );
}