import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);

  // Efecto para el Loader inicial
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const timer = setTimeout(() => {
      setIsLoading(false);
      document.body.style.overflow = 'unset';
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#121212] font-sans overflow-x-hidden selection:bg-[#b0ff4c] selection:text-black">
      
      {/* --- PANTALLA DE CARGA --- */}
      <div className={`fixed inset-0 z-[10000] flex items-center justify-center bg-[#121212] transition-all duration-700 ease-in-out ${isLoading ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
            {/* Modo Oscuro (Logo Blanco) */}
             <img src="/soma_logo_blanco.png" alt="SOMA Logo" className="h-12 object-contain dark:block transition-opacity duration-300" />
      </div>

      {/* ==========================================
          SECCIÓN 1: HERO & NAVBAR
          ========================================== */}
      <section className="relative w-full h-[90vh] min-h-[600px] flex flex-col items-center justify-center overflow-hidden">
        
        {/* Fondo Imagen Hero (c.jpeg) */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/c.jpeg')" }}
        ></div>
        
        {/* Capa oscura (Overlay) exacta según tu Figma: Color #0F1312 al ~61% */}
        <div className="absolute inset-0 bg-[#0F1312]/60"></div>

        {/* NAVBAR FLOTANTE */}
        <nav className="fixed top-6 left-1/2 -translate-x-1/2 w-[90%] max-w-3xl bg-[#1c1c1c]/60 backdrop-blur-md border border-white/10 rounded-full px-2 py-2 flex items-center justify-between z-50 shadow-2xl">
          <button className="text-white/80 hover:text-white text-sm font-medium px-4 py-2 flex items-center gap-2">
            Menu
          </button>
          
          <Link to="/" className="text-white font-black text-2xl tracking-widest absolute left-1/2 -translate-x-1/2">
            SOMA
          </Link>

          <div className="flex items-center gap-2">
            <Link to="/login" className="text-white/80 hover:text-white text-sm font-medium px-4 py-2 hidden sm:block">
              Acceso
            </Link>
            <Link to="/register" className="bg-[#b0ff4c] hover:bg-[#9ded3a] text-black text-sm font-bold px-6 py-2.5 rounded-full transition-transform hover:scale-105">
              Unirse
            </Link>
          </div>
        </nav>

        {/* TEXTO DEL HERO */}
        <div className="relative z-10 text-center px-4 mt-16 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl lg:text-[72px] font-medium text-white tracking-tight leading-tight md:leading-[1.1]">
            Crea tus <span className="bg-[#b0ff4c] text-black px-6 py-1 md:py-2 rounded-full inline-block font-bold transform -rotate-2 mx-2 shadow-lg">Historias Clínicas</span><br />
            Fácil y rápido
          </h1>
        </div>
      </section>

      {/* ==========================================
          BARRA MARQUEE (CINTA VERDE ANIMADA)
          ========================================== */}
      <div className="bg-[#b0ff4c] py-3 overflow-hidden flex whitespace-nowrap relative z-20 border-y-2 border-black">
  <div className="animate-marquee font-black text-black text-2xl md:text-3xl tracking-widest flex items-center">
    {/* Creamos un contenedor que se repetirá para llenar el ancho */}
    <div className="flex items-center animate-scroll">
      {[...Array(100)].map((_, i) => (
        <React.Fragment key={i}>
          {/* Logo Negro (Modo Claro) */}
          <img 
            src="/soma_logo.png" 
            alt="SOMA" 
            className="mx-8 h-8 object-contain block dark:hidden" 
          />
          {/* Logo Blanco (Modo Oscuro) */}
          <img 
            src="/soma_logo_blanco.png" 
            alt="SOMA" 
            className="mx-8 h-8 object-contain hidden dark:block" 
          />
        </React.Fragment>
      ))}
    </div>
  </div>
</div>

      {/* ==========================================
          SECCIÓN 2: GESTIÓN ALTAMENTE EFICIENTE (Oscura)
          ========================================== */}
      <section className="bg-[#121212] py-24 md:py-32 relative overflow-hidden px-6">
        <div className="max-w-6xl mx-auto relative z-10 flex flex-col items-center text-center">
          
          {/* Elementos Decorativos (Mascotas y Formas) */}
          <img src="/ruta-mascota-doctor-izq.svg" alt="Doctor" className="hidden md:block absolute -left-10 top-0 w-48 animate-float-slow" />
          <img src="/ruta-mascota-doctora-der.svg" alt="Doctora" className="hidden md:block absolute -right-10 bottom-0 w-48 animate-float-delayed" />
          <img src="/ruta-icono-cruz-blanca.png" alt="Cruz" className="absolute right-[15%] top-10 w-24 opacity-80" />
          <img src="/ruta-asterisco-verde.png" alt="Asterisco" className="absolute right-[10%] bottom-20 w-12" />
          <img src="/ruta-destello-verde.png" alt="Destello" className="absolute left-[10%] top-40 w-12" />

          {/* TITULAR PRINCIPAL */}
          <h2 className="text-[40px] md:text-[60px] lg:text-[76px] font-black text-white uppercase leading-[1.05] tracking-tight max-w-4xl">
            Disfruta una <span className="relative inline-block whitespace-nowrap z-10">
              GESTIÓN
              <svg className="absolute w-[120%] h-[140%] -left-[10%] -top-[20%] text-[#b0ff4c] pointer-events-none -z-10" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d="M50,10 C80,10 95,40 90,70 C85,95 30,95 15,80 C0,65 10,20 50,10 Z" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="animate-draw-circle" />
              </svg>
            </span><br />
            altamente eficiente<br />
            <span className="bg-[#b0ff4c] text-black px-4 py-1 mt-3 inline-block">PARA TU CONSULTA</span>
          </h2>

          <p className="text-white/50 text-sm mt-8 tracking-widest font-bold uppercase">(Solo Especialistas Activos)</p>

          <button className="mt-10 md:mt-16 border border-[#b0ff4c] text-white hover:bg-[#b0ff4c] hover:text-black rounded-full px-8 py-4 text-sm font-bold tracking-widest flex items-center gap-3 transition-all group">
            COMENZAR <ArrowUpRight className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" size={20} />
          </button>
        </div>
      </section>

      {/* ==========================================
          SECCIÓN 3: OPTIMIZA TU TIEMPO (Verde Lima)
          ========================================== */}
      <section className="bg-[#b0ff4c] rounded-t-[3rem] md:rounded-t-[5rem] py-20 md:py-32 px-6 relative z-20 -mt-10 overflow-hidden shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
        
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_black_2px,_transparent_2px)] [background-size:30px_30px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 relative z-10">
          
          <div className="flex-1 text-black text-center lg:text-left">
            <h2 className="text-4xl md:text-[56px] font-black uppercase leading-[1.05] tracking-tight">
              Optimiza tu tiempo,* <span className="text-4xl align-top"></span><br />
              Conecta con tus pacientes<br />
              y garantiza la seguridad
            </h2>
            
            
           <button className="hidden lg:inline-flex mt-12 bg-[#8b5cf6] hover:bg-[#7c4dff] text-white px-8 py-4 rounded-xl text-sm font-bold tracking-widest items-center gap-3 transition-transform hover:-translate-y-1 shadow-xl">
              COMIENZA TU CONSULTA <ArrowUpRight size={20} />
              
            </button>
          </div>

          <div className="flex-1 relative w-full h-[400px] md:h-[500px]">
            <img 
              src="/soma_tablet.svg" 
              alt="SOMA on Tablet" 
              className="absolute left-0 lg:-left-10 top-0 w-3/4 md:w-[80%] max-w-[500px] drop-shadow-2xl z-10 animate-float"
            />
            <img 
              src="/soma_laptop.svg" 
              alt="SOMA on Laptop" 
              className="absolute right-0 lg:-right-10 bottom-0 w-4/5 md:w-[85%] max-w-[600px] drop-shadow-[0_30px_30px_rgba(0,0,0,0.3)] z-20 animate-float-delayed"
            />
          </div>

          <button className="lg:hidden w-full max-w-sm mt-8 bg-[#8b5cf6] text-white px-8 py-4 rounded-xl text-sm font-bold tracking-widest flex items-center justify-center gap-3 shadow-xl">
            COMIENZA TU CONSULTA <ArrowUpRight size={20} />
          </button>
        </div>
      </section>

      {/* ==========================================
          SECCIÓN 4: 3 PASOS (Cartas Inferiores)
          ========================================== */}
      <section className="bg-[#121212] rounded-t-[3rem] md:rounded-t-[5rem] pt-24 md:pt-32 px-6 relative z-30 -mt-16">
        <div className="max-w-7xl mx-auto">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-4">
            <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight max-w-2xl">
              Digitaliza tu consulta en 3 pasos
            </h2>
            <div className="text-white/30 text-2xl font-black tracking-widest flex items-center gap-2">
               
                  {/* Modo Oscuro (Logo Blanco) */}
                  <img src="/soma_logo_blanco.png" alt="SOMA Logo" className="h-14 object-contain dark:block transition-opacity duration-300" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            
            <div className="bg-[#1c1c1c] rounded-[2rem] p-8 flex flex-col h-full border border-white/5 transition-transform hover:-translate-y-2 duration-300">
              <h3 className="text-3xl font-black text-[#b0ff4c] uppercase leading-tight mb-4">
                Configura<br />Tu Perfil
              </h3>
              <p className="text-white/60 text-sm mb-10 flex-grow">
                "Crea tu cuenta en segundos. Personaliza tus horarios, especialidades y servicios para que el sistema trabaje por ti."
              </p>
              <div className="w-full h-48 rounded-2xl overflow-hidden bg-black/50">
                <img src="/imagen_doc1.svg" alt="Doctor configurando perfil" className="w-full h-full object-cover opacity-80" />
              </div>
            </div>

            <div className="bg-[#8b5cf6] rounded-[2rem] p-8 flex flex-col h-full lg:-translate-y-8 shadow-2xl shadow-[#8b5cf6]/20 transition-transform hover:-translate-y-10 duration-300">
              <h3 className="text-3xl font-black text-white uppercase leading-tight mb-4">
                Gestiona<br />Tus Pacientes
              </h3>
              <p className="text-white/90 text-sm mb-10 flex-grow">
                "Crea historias clínicas digitales completas. Agrega diagnósticos, recetas y antecedentes con solo un par de clics."
              </p>
              <div className="w-full h-48 rounded-2xl overflow-hidden bg-black/20">
                <img src="/imagen_doc2.svg" alt="Consulta con paciente" className="w-full h-full object-cover" />
              </div>
            </div>

            <div className="bg-[#1c1c1c] rounded-[2rem] p-8 flex flex-col h-full border border-white/5 transition-transform hover:-translate-y-2 duration-300">
              <h3 className="text-3xl font-black text-[#b0ff4c] uppercase leading-tight mb-4">
                Control total<br />De Tu Agenda
              </h3>
              <p className="text-white/60 text-sm mb-10 flex-grow">
                "Visualiza tu flujo de trabajo en tiempo real. Envía recordatorios automáticos y reduce las inasistencias de forma inteligente."
              </p>
              <div className="w-full h-48 rounded-2xl overflow-hidden bg-black/50">
                <img src="/imagen_doc3.svg" alt="Doctor viendo agenda" className="w-full h-full object-cover opacity-80" />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ==========================================
          SECCIÓN 5: CREAMOS CONEXIONES
          ========================================== */}
      <section className="bg-[#121212] py-24 md:py-32 px-6 relative z-30">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-16">
          
          {/* Lado Izquierdo: Texto Principal */}
          <div className="flex-1 text-left w-full">
            <h2 className="text-[40px] md:text-6xl lg:text-[72px] font-black uppercase leading-[1.05] tracking-tight text-white">
              CREAMOS<br />
              <span className="bg-[#b0ff4c] text-black px-6 py-1 md:py-2 rounded-[2rem] inline-block my-2">CONEXIONES</span><br />
              DIRECTAS ENTRE<br />
              <span className="text-[#8b5cf6]">MÉDICOS</span> Y <span className="text-[#8b5cf6]">PACIENTES</span><br />
              CADA VEZ QUE<br />
              UTILIZAN <span className="italic font-sans text-white/90">SOMA</span>
            </h2>
          </div>

          {/* Lado Derecho: Logo y Estadísticas */}
          <div className="flex-1 flex flex-col items-center lg:items-end w-full relative">
            
            {/* Logo Abstracto (Usa tu logo blanco de SOMA) */}
            <div className="mb-12 lg:mb-20">
              <img src="/soma_logo_blanco.png" alt="SOMA Logo Abstract" className="w-24 md:w-32 object-contain" />
            </div>
            
            {/* Contenedor de Estadísticas con línea decorativa */}
            <div className="relative w-full lg:w-auto text-center lg:text-right border-t border-white/10 pt-8 lg:pt-0 lg:border-t-0 lg:border-l lg:pl-10">
              {/* Decoración de la línea al estilo del Figma */}
              <div className="hidden lg:block absolute -top-8 -left-[1px] w-2 h-2 bg-[#b0ff4c] rounded-full"></div>
              
              <h3 className="text-5xl md:text-6xl font-black text-white leading-none">
                10k<span className="text-[#8b5cf6]">+</span>
              </h3>
              <p className="text-[#b0ff4c] font-bold text-sm md:text-base mt-2 tracking-wide">
                Historias Clínicas Creadas
              </p>
              <p className="text-white/50 text-xs font-semibold mt-1 tracking-wider uppercase">
                500+ Especialistas Activos
              </p>
            </div>

            {/* Botón de Inicio */}
            <button className="mt-12 bg-[#b0ff4c] hover:bg-[#9ded3a] text-black px-8 py-3.5 rounded-full text-sm font-bold tracking-widest flex items-center justify-center gap-2 transition-transform hover:-translate-y-1 w-full sm:w-auto">
              INICIAR <ArrowUpRight size={20} />
            </button>
          </div>

        </div>
      </section>

      {/* ==========================================
          BARRA MARQUEE 2 (CON ASTERISCOS)
          ========================================== */}
   <div className="bg-[#b0ff4c] py-3 overflow-hidden flex whitespace-nowrap relative z-20 border-y-2 border-black">
  <div className="animate-marquee font-black text-black text-2xl md:text-3xl tracking-widest flex items-center">
    {/* Creamos un contenedor que se repetirá para llenar el ancho */}
    <div className="flex items-center animate-scroll">
      {[...Array(100)].map((_, i) => (
        <React.Fragment key={i}>
          {/* Logo Negro (Modo Claro) */}
          <img 
            src="/soma_logo.png" 
            alt="SOMA" 
            className="mx-8 h-8 object-contain block dark:hidden" 
          />
          {/* Logo Blanco (Modo Oscuro) */}
          <img 
            src="/soma_logo_blanco.png" 
            alt="SOMA" 
            className="mx-8 h-8 object-contain hidden dark:block" 
          />
        </React.Fragment>
      ))}
    </div>
  </div>
</div>

      {/* ==========================================
          SECCIÓN 6: CREADORES
          ========================================== */}
      <section className="bg-[#1E1E1E] py-24 md:py-32 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          
          <h2 className="text-4xl md:text-[56px] font-bold text-white mb-16 tracking-tight">
            Creadores
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            
            {/* Creador 1: Diseñador UI/UX */}
            <div className="bg-gradient-to-b from-[#2a2a2a] to-[#222] rounded-[2.5rem] p-6 flex flex-col h-full border border-white/5 group hover:border-white/10 transition-colors">
              <div className="w-full flex justify-center mb-4">
                <span className="text-white/50 text-[10px] font-bold uppercase tracking-[0.2em] border border-white/10 px-4 py-1.5 rounded-full">
                  Diseñador UI/UX
                </span>
              </div>
              <div className="w-full aspect-[4/5] rounded-[2rem] overflow-hidden bg-black/40 mb-6">
                <img src="/miguel.svg" alt="Miguel Gómez" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              </div>
              <div className="flex justify-between items-end mt-auto px-2">
                <div>
                  <h4 className="text-white font-bold text-xl md:text-2xl mb-1">Miguel Gómez</h4>
                  <p className="text-white/40 text-xs font-medium tracking-wide">+3 años de experiencia</p>
                </div>
                <div className="bg-[#b0ff4c] text-black p-2 md:p-3 rounded-full cursor-pointer hover:scale-110 transition-transform">
                  <ArrowUpRight size={20} />
                </div>
              </div>
            </div>

            {/* Creador 2: CEO */}
            <div className="bg-gradient-to-b from-[#2a2a2a] to-[#222] rounded-[2.5rem] p-6 flex flex-col h-full border border-white/5 group hover:border-white/10 transition-colors">
              <div className="w-full flex justify-center mb-4">
                <span className="text-[#8b5cf6] text-[10px] font-bold uppercase tracking-[0.2em] border border-[#8b5cf6]/30 px-4 py-1.5 rounded-full bg-[#8b5cf6]/10">
                  CEO
                </span>
              </div>
              <div className="w-full aspect-[4/5] rounded-[2rem] overflow-hidden bg-black/40 mb-6">
                <img src="/juan.svg" alt="Juan Hernández" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              </div>
              <div className="flex justify-between items-end mt-auto px-2">
                <div>
                  <h4 className="text-white font-bold text-xl md:text-2xl mb-1">Juan Hernández</h4>
                  <p className="text-white/40 text-xs font-medium tracking-wide">+5 años de experiencia</p>
                </div>
                <div className="bg-[#b0ff4c] text-black p-2 md:p-3 rounded-full cursor-pointer hover:scale-110 transition-transform">
                  <ArrowUpRight size={20} />
                </div>
              </div>
            </div>

            {/* Creador 3: Tutor Académico */}
            <div className="bg-gradient-to-b from-[#2a2a2a] to-[#222] rounded-[2.5rem] p-6 flex flex-col h-full border border-white/5 group hover:border-white/10 transition-colors">
              <div className="w-full flex justify-center mb-4">
                <span className="text-white/50 text-[10px] font-bold uppercase tracking-[0.2em] border border-white/10 px-4 py-1.5 rounded-full">
                  Tutor Académico
                </span>
              </div>
              <div className="w-full aspect-[4/5] rounded-[2rem] overflow-hidden bg-black/40 mb-6">
                {/* Nota: Apliqué un filtro grayscale para que se parezca a la imagen del tutor en el Figma */}
                <img src="/gregory.jpg" alt="Gregory Cedetto" className="w-full h-full object-cover grayscale transition-transform duration-700 group-hover:scale-105 group-hover:grayscale-0" />
              </div>
              <div className="flex justify-between items-end mt-auto px-2">
                <div>
                  <h4 className="text-white font-bold text-xl md:text-2xl mb-1">Gregory Cedetto</h4>
                  <p className="text-white/40 text-xs font-medium tracking-wide">+15 años de experiencia</p>
                </div>
                <div className="bg-[#b0ff4c] text-black p-2 md:p-3 rounded-full cursor-pointer hover:scale-110 transition-transform">
                  <ArrowUpRight size={20} />
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* --- ESTILOS Y ANIMACIONES CSS --- */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 15s linear infinite;
          width: max-content;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float 7s ease-in-out infinite;
          animation-delay: 2s;
        }
        .animate-float-slow {
          animation: float 8s ease-in-out infinite;
        }
        @keyframes draw-circle {
          to { stroke-dashoffset: 0; }
        }
        .animate-draw-circle {
          stroke-dasharray: 400;
          stroke-dashoffset: 400;
          animation: draw-circle 2s ease-out forwards;
          animation-delay: 0.5s;
        }
      `}</style>
    </div>
  );
}