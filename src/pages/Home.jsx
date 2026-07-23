import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, PlayCircle, X } from 'lucide-react';

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  
  // ESTADO PARA EL VIDEO FLOTANTE
  const [activeVideo, setActiveVideo] = useState(null);

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
    <div className="min-h-screen bg-[#121212] font-sans overflow-x-hidden selection:bg-[#b0ff4c] selection:text-black relative">
      
      {/* ========================================================================= */}
      {/* MODAL REPRODUCTOR DE VIDEO (Elegante, difuminado y con líneas verdes) */}
      {/* ========================================================================= */}
      {activeVideo && (
        <div className="fixed inset-0 z-[20000] flex items-center justify-center bg-black/80 backdrop-blur-xl animate-[fadeIn_0.3s_ease-out]">
          
          {/* Botón de Cerrar */}
          <button 
            onClick={() => setActiveVideo(null)}
            className="absolute top-6 right-6 md:top-10 md:right-10 text-[#b0ff4c] hover:text-black bg-white/10 hover:bg-[#b0ff4c] p-3 md:p-4 rounded-full transition-all z-50"
          >
            <X size={24} />
          </button>
          
          {/* Contenedor del Video en Grande */}
          <div className="w-full max-w-5xl p-4 md:p-8 animate-[zoomIn_0.3s_ease-out]">
            <video 
              src={activeVideo} 
              controls 
              autoPlay 
              className="w-full h-auto max-h-[85vh] rounded-[1.5rem] md:rounded-[2rem] shadow-[0_0_60px_rgba(176,255,76,0.3)] border-2 border-[#b0ff4c] bg-black outline-none"
            />
          </div>
        </div>
      )}

      {/* --- PANTALLA DE CARGA --- */}
      <div className={`fixed inset-0 z-[10000] flex items-center justify-center bg-[#121212] transition-all duration-700 ease-in-out ${isLoading ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
        <img src="/soma_logo_blanco.png" alt="SOMA Logo" className="h-12 object-contain transition-opacity duration-300" />
      </div>

      {/* ==========================================
          SECCIÓN 1: HERO & NAVBAR
          ========================================== */}
      <section className="relative w-full h-[90vh] min-h-[600px] flex flex-col items-center justify-center overflow-hidden">
        
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/c.jpeg')" }}
        ></div>
        
        <div className="absolute inset-0 bg-[#0F1312]/60"></div>

        {/* NAVBAR FLOTANTE */}
        <nav className="fixed top-6 left-1/2 -translate-x-1/2 w-[90%] max-w-3xl bg-[#1c1c1c]/60 backdrop-blur-md border border-white/10 rounded-full px-4 sm:px-6 py-2.5 flex items-center justify-between z-50 shadow-2xl">
          
          {/* LOGO REAL DE SOMA (Izquierda en móvil, Centrado en PC) */}
          <Link to="/" className="relative md:absolute md:left-1/2 md:-translate-x-1/2 flex items-center justify-center z-10">
            <img src="/soma_logo_blanco.png" alt="SOMA Logo" className="h-5 sm:h-6 object-contain hover:scale-105 transition-transform" />
          </Link>

          {/* Espaciador invisible para mantener el balance centrado del logo SOLO en PC */}
          <div className="w-16 sm:w-20 hidden md:block"></div> 

          {/* BOTONES DERECHOS */}
          <div className="flex items-center gap-1 sm:gap-2 ml-auto z-10">
            <Link to="/login" className="text-white/80 hover:text-white text-xs sm:text-sm font-medium px-3 sm:px-4 py-2 transition-colors">
              Acceso
            </Link>
            <Link to="/register" className="bg-[#b0ff4c] hover:bg-[#9ded3a] text-black text-xs sm:text-sm font-bold px-4 sm:px-6 py-2 sm:py-2.5 rounded-full transition-transform hover:scale-105 shadow-lg shadow-[#b0ff4c]/20">
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
          <div className="flex items-center animate-scroll">
            {[...Array(100)].map((_, i) => (
              <React.Fragment key={i}>
                <img 
                  src="/soma_logo.png" 
                  alt="SOMA" 
                  className="mx-8 h-8 object-contain block" 
                />
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* ==========================================
          SECCIÓN 2: GESTIÓN ALTAMENTE EFICIENTE (Oscura)
          ========================================== */}
      <section className="bg-[#121212] py-24 md:py-32 relative overflow-hidden px-4 sm:px-6">
        <div className="max-w-6xl mx-auto relative z-10 flex flex-col items-center text-center">
          
          <img src="#" alt="" className="absolute right-[15%] top-10 w-24 opacity-80 hidden md:block" />
          <img src="/ruta-asterisco-verde.png" alt="" className="absolute right-[10%] bottom-20 w-12 hidden md:block" />
          <img src="/ruta-destello-verde.png" alt="Destello" className="absolute left-[10%] top-40 w-12 hidden md:block" />

          {/* CONTENEDOR FLEXIBLE: Muñecos a los lados del texto */}
          <div className="flex flex-row items-center justify-center gap-3 sm:gap-6 w-full md:block relative">
            
            <img 
              src="/ruta-mascota-doctor-izq.svg" 
              alt="Doctor" 
              className="w-16 sm:w-24 shrink-0 animate-float-slow md:absolute md:-left-4 lg:-left-10 md:top-0 md:w-40 lg:w-48" 
            />

            <h2 className="text-[26px] min-[400px]:text-[32px] sm:text-[40px] md:text-[60px] lg:text-[76px] font-black text-white uppercase leading-[1.1] md:leading-[1.05] tracking-tight max-w-4xl relative z-10 mx-auto">
              Disfruta una <span className="relative inline-block whitespace-nowrap z-10">
                GESTIÓN
                <svg className="absolute w-[120%] h-[140%] -left-[10%] -top-[20%] text-[#b0ff4c] pointer-events-none -z-10" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <path d="M50,10 C80,10 95,40 90,70 C85,95 30,95 15,80 C0,65 10,20 50,10 Z" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="animate-draw-circle" />
                </svg>
              </span><br />
              altamente eficiente<br />
              <span className="bg-[#b0ff4c] text-black px-3 sm:px-4 py-1 mt-2 md:mt-3 inline-block">PARA TU CONSULTA</span>
            </h2>

            <img 
              src="/ruta-mascota-doctora-der.svg" 
              alt="Doctora" 
              className="w-16 sm:w-24 shrink-0 animate-float-delayed md:absolute md:-right-4 lg:-right-10 md:bottom-0 md:w-40 lg:w-48" 
            />

          </div>

          <p className="text-white/50 text-sm mt-8 tracking-widest font-bold uppercase relative z-10">(Solo Especialistas Activos)</p>

          <Link to="/register" className="mt-10 md:mt-16 border border-[#b0ff4c] text-white hover:bg-[#b0ff4c] hover:text-black rounded-full px-8 py-4 text-sm font-bold tracking-widest inline-flex items-center gap-3 transition-all group relative z-10">
            COMENZAR <ArrowUpRight className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" size={20} />
          </Link>
        </div>
      </section>

      {/* ==========================================
          SECCIÓN 3: OPTIMIZA TU TIEMPO (Verde Lima con Laptops)
          ========================================== */}
      <section className="bg-[#b0ff4c] rounded-t-[3rem] md:rounded-t-[5rem] py-16 md:py-32 px-6 sm:px-8 relative z-20 -mt-10 shadow-[0_-20px_50px_rgba(0,0,0,0.5)] overflow-hidden lg:overflow-visible">
        
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_black_2px,_transparent_2px)] [background-size:30px_30px] pointer-events-none rounded-t-[3rem] md:rounded-t-[5rem]"></div>

        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-center gap-0 lg:gap-16 relative z-10">

          {/* VISTA MÓVIL Y TABLET */}
          <div className="flex flex-row items-center justify-between w-full lg:hidden gap-2 sm:gap-6 mt-4">
            <div className="w-[55%] min-[400px]:w-[60%] text-left z-20 pl-2">
              <h2 className="text-[18px] min-[375px]:text-[22px] sm:text-4xl font-black uppercase leading-[1.15] tracking-tight text-black">
                Optimiza tu tiempo,* <br/>
                Conecta con tus pacientes<br/>
                y garantiza la seguridad
              </h2>
            </div>
            <div className="w-[45%] min-[400px]:w-[40%] relative h-[180px] sm:h-[250px] flex items-center justify-center z-10 pointer-events-none">
              <img 
                src="/soma_tablet.svg" 
                alt="SOMA Tablet" 
                className="absolute top-4 left-0 w-[80%] sm:w-[70%] drop-shadow-[0_10px_15px_rgba(0,0,0,0.3)] animate-float-slow"
              />
              <img 
                src="/soma_laptop.svg" 
                alt="SOMA Laptop" 
                className="absolute bottom-4 right-0 w-[95%] sm:w-[85%] drop-shadow-[0_20px_25px_rgba(0,0,0,0.5)] animate-float"
              />
            </div>
          </div>

          <div className="w-full lg:hidden z-30 mt-10 mb-4 px-2">
            <Link to="/register" className="w-full max-w-sm bg-[#8b5cf6] hover:bg-[#7c4dff] text-white px-8 py-4 rounded-xl text-sm font-bold tracking-widest flex items-center justify-center gap-3 shadow-xl mx-auto transition-transform hover:-translate-y-1 relative">
              COMIENZA TU CONSULTA <ArrowUpRight size={20} />
            </Link>
          </div>

          {/* VISTA LAPTOP / DESKTOP */}
          <div className="hidden lg:flex flex-row items-center justify-center gap-16 w-full">
            <div className="flex-1 text-black text-left z-20 relative w-full flex-col items-start">
              <h2 className="text-[56px] font-black uppercase leading-[1.15] tracking-tight">
                Optimiza tu tiempo,* <br/>
                Conecta con tus pacientes<br/>
                y garantiza la seguridad
              </h2>
              <Link to="/register" className="mt-12 bg-[#8b5cf6] hover:bg-[#7c4dff] text-white px-8 py-4 rounded-xl text-sm font-bold tracking-widest flex items-center justify-center gap-3 shadow-2xl shadow-[#8b5cf6]/30 transition-transform hover:-translate-y-1 w-fit">
                COMIENZA TU CONSULTA <ArrowUpRight size={20} />
              </Link>
            </div>
            <div className="flex-1 relative w-full h-[600px] items-center justify-center pointer-events-none">
              <img 
                src="/soma_tablet.svg" 
                alt="SOMA on Tablet" 
                className="absolute -top-10 -left-12 w-[85%] max-w-[550px] drop-shadow-[0_20px_30px_rgba(0,0,0,0.4)] z-10 animate-float-slow"
              />
              <img 
                src="/soma_laptop.svg" 
                alt="SOMA on Laptop" 
                className="absolute -bottom-12 -right-20 w-[110%] max-w-[750px] drop-shadow-[0_40px_50px_rgba(0,0,0,0.6)] z-20 animate-float"
              />
            </div>
          </div>

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
              <img src="/soma_logo_blanco.png" alt="SOMA Logo" className="h-14 object-contain transition-opacity duration-300" />
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

          <div className="flex-1 flex flex-col items-center lg:items-end w-full relative">
            <div className="mb-12 lg:mb-20">
              <img src="/soma_logo_blanco.png" alt="SOMA Logo Abstract" className="w-24 md:w-32 object-contain" />
            </div>
            
            <div className="relative w-full lg:w-auto text-center lg:text-right border-t border-white/10 pt-8 lg:pt-0 lg:border-t-0 lg:border-l lg:pl-10">
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

            <Link to="/register" className="mt-12 bg-[#b0ff4c] hover:bg-[#9ded3a] text-black px-8 py-3.5 rounded-full text-sm font-bold tracking-widest inline-flex items-center justify-center gap-2 transition-transform hover:-translate-y-1 w-full sm:w-auto">
              INICIAR <ArrowUpRight size={20} />
            </Link>
          </div>

        </div>
      </section>

      {/* ==========================================
          BARRA MARQUEE 2 (CON ASTERISCOS)
          ========================================== */}
      <div className="bg-[#b0ff4c] py-3 overflow-hidden flex whitespace-nowrap relative z-20 border-y-2 border-black">
        <div className="animate-marquee font-black text-black text-2xl md:text-3xl tracking-widest flex items-center">
          <div className="flex items-center animate-scroll">
            {[...Array(100)].map((_, i) => (
              <React.Fragment key={i}>
                <img 
                  src="/soma_logo.png" 
                  alt="SOMA" 
                  className="mx-8 h-8 object-contain block" 
                />
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* ==========================================
          SECCIÓN 6: CREADORES (CON VIDEOS INTERACTIVOS)
          ========================================== */}
      <section className="bg-[#1E1E1E] py-24 md:py-32 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          
          <h2 className="text-4xl md:text-[56px] font-bold text-white mb-16 tracking-tight">
            Creadores
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            
            {/* CREADOR 1: Miguel */}
            <div className="bg-gradient-to-b from-[#2a2a2a] to-[#222] rounded-[2.5rem] p-6 flex flex-col h-full border border-white/5 transition-colors">
              <div className="w-full flex justify-center mb-4 text-center">
                <span className="text-white/50 text-[10px] font-bold uppercase tracking-[0.2em] border border-white/10 px-4 py-1.5 rounded-full">
                  Cofundador - Diseñador UX - UI
                </span>
              </div>
              
              <div 
                onClick={() => setActiveVideo('/miguel_video.mp4')} 
                className="w-full aspect-[4/5] rounded-[2rem] overflow-hidden bg-black/40 mb-6 relative cursor-pointer group/video border border-transparent hover:border-[#b0ff4c]/50 transition-colors"
              >
                <img src="/miguelnu.png" alt="Miguel Gómez" className="w-full h-full object-cover transition-transform duration-700 group-hover/video:scale-105" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/video:opacity-100 flex items-center justify-center transition-opacity duration-300">
                  <PlayCircle size={64} className="text-[#b0ff4c] drop-shadow-2xl" strokeWidth={1.5} />
                </div>
              </div>

              <div className="flex justify-between items-end mt-auto px-2">
                <div>
                  <h4 className="text-white font-bold text-xl md:text-2xl mb-1">Miguel Gómez</h4>
                  <p className="text-white/40 text-xs font-medium tracking-wide">+3 años de experiencia</p>
                </div>
                <button onClick={() => setActiveVideo('/miguel_video.mp4')} className="bg-[#b0ff4c] text-black p-2 md:p-3 rounded-full hover:scale-110 transition-transform shrink-0 ml-2">
                  <ArrowUpRight size={20} />
                </button>
              </div>
            </div>

            {/* CREADOR 2: Juan */}
            <div className="bg-gradient-to-b from-[#2a2a2a] to-[#222] rounded-[2.5rem] p-6 flex flex-col h-full border border-white/5 transition-colors">
              <div className="w-full flex justify-center mb-4 text-center">
                <span className="text-[#8b5cf6] text-[10px] font-bold uppercase tracking-[0.2em] border border-[#8b5cf6]/30 px-4 py-1.5 rounded-full bg-[#8b5cf6]/10">
                  Cofundador - Desarrollador BACKEND
                </span>
              </div>

              <div 
                onClick={() => setActiveVideo('/juan_video.mp4')} 
                className="w-full aspect-[4/5] rounded-[2rem] overflow-hidden bg-black/40 mb-6 relative cursor-pointer group/video border border-transparent hover:border-[#b0ff4c]/50 transition-colors"
              >
                <img src="/juan.svg" alt="Juan Hernández" className="w-full h-full object-cover transition-transform duration-700 group-hover/video:scale-105" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/video:opacity-100 flex items-center justify-center transition-opacity duration-300">
                  <PlayCircle size={64} className="text-[#8b5cf6] drop-shadow-2xl" strokeWidth={1.5} />
                </div>
              </div>

              <div className="flex justify-between items-end mt-auto px-2">
                <div>
                  <h4 className="text-white font-bold text-xl md:text-2xl mb-1">Juan Hernández</h4>
                  <p className="text-white/40 text-xs font-medium tracking-wide">+5 años de experiencia</p>
                </div>
                <button onClick={() => setActiveVideo('/juan_video.mp4')} className="bg-[#b0ff4c] text-black p-2 md:p-3 rounded-full hover:scale-110 transition-transform shrink-0 ml-2">
                  <ArrowUpRight size={20} />
                </button>
              </div>
            </div>

            {/* CREADOR 3: Gregory (¡Foto a full color corregida!) */}
            <div className="bg-gradient-to-b from-[#2a2a2a] to-[rgb(34,34,34)] rounded-[2.5rem] p-6 flex flex-col h-full border border-white/5 transition-colors">
              <div className="w-full flex justify-center mb-4 text-center">
                <span className="text-white/50 text-[10px] font-bold uppercase tracking-[0.2em] border border-white/10 px-4 py-1.5 rounded-full">
                  Tutor Académico
                </span>
              </div>
              
              <div 
                onClick={() => setActiveVideo('/gregory.mp4')} 
                className="w-full aspect-[4/5] rounded-[2rem] overflow-hidden bg-black/40 mb-6 relative cursor-pointer group/video border border-transparent hover:border-[#b0ff4c]/50 transition-colors"
              >
                <img src="/gregory.jpeg" alt="Gregory Cedetto" className="w-full h-full object-cover transition-transform duration-700 group-hover/video:scale-105" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/video:opacity-100 flex items-center justify-center transition-opacity duration-300">
                  <PlayCircle size={64} className="text-white drop-shadow-2xl" strokeWidth={1.5} />
                </div>
              </div>

              <div className="flex justify-between items-end mt-auto px-2">
                <div>
                  <h4 className="text-white font-bold text-xl md:text-2xl mb-1">Gregory Cedetto</h4>
                  <p className="text-white/40 text-xs font-medium tracking-wide">+15 años de experiencia</p>
                </div>
                <button onClick={() => setActiveVideo('/gregory_video.mp4')} className="bg-[#b0ff4c] text-black p-2 md:p-3 rounded-full hover:scale-110 transition-transform shrink-0 ml-2">
                  <ArrowUpRight size={20} />
                </button>
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
          animation: marquee 50s linear infinite;
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
        @keyframes zoomIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}