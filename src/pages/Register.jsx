import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loaderWidth, setLoaderWidth] = useState(0);
  
  // Estados para alertas tipo Toast
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });

  const [formData, setFormData] = useState({
    especialidad: '', primer_nombre: '', primer_apellido: '',
    numero_identificacion: '', telefono: '', correo: '',
    contrasena: '', confirmar_contrasena: '', sexo: '',
    pais: 'Venezuela', ciudad: 'Caracas'
  });

  const cities = ["Caracas", "Punto Fijo", "Valencia", "Maracaibo", "Barquisimeto", "Mérida", "San Cristóbal", "Coro"];
  const especialidades = [
    "Medicina General", "Cardiología", "Pediatría", "Ginecología", 
    "Dermatología", "Neurología", "Odontología", "Nutricionista", "Fisioterapeuta"
  ];

  // Efecto del Loader superior
  useEffect(() => {
    setTimeout(() => setLoaderWidth(100), 50);
  }, []);

  // Ocultar alerta automáticamente después de 5 segundos
  useEffect(() => {
    if (alert.show) {
      const timer = setTimeout(() => setAlert({ show: false, type: '', message: '' }), 5000);
      return () => clearTimeout(timer);
    }
  }, [alert.show]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (formData.contrasena !== formData.confirmar_contrasena) {
      setAlert({ show: true, type: 'error', message: 'Las contraseñas no coinciden.' });
      return;
    }

    setLoading(true);

    try {
      // 1. Registro en Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.correo,
        password: formData.contrasena,
      });

      if (authError) throw authError;

      // 2. Insertar en tabla pública 'usuarios'
      const { error: dbError } = await supabase.from('usuarios').insert([
        {
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
        }
      ]);

      if (dbError) throw dbError;

      setAlert({ show: true, type: 'success', message: 'Cuenta creada exitosamente. Redirigiendo...' });
      
      // Esperar un momento para que el usuario lea el mensaje de éxito
      setTimeout(() => navigate('/login'), 2000);

    } catch (error) {
      setAlert({ show: true, type: 'error', message: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#f7f9fc] dark:bg-slate-900 min-h-screen flex flex-col items-center pt-10 pb-10 transition-colors relative font-sans">
      
      {/* Top Loader */}
      <div 
        className="fixed top-0 left-0 h-1 bg-cyan-500 z-[9999] transition-all duration-700 ease-out"
        style={{ width: `${loaderWidth}%`, opacity: loaderWidth === 100 ? 0 : 1 }}
      ></div>

      {/* Alertas Toast */}
      {alert.show && (
        <div className="fixed top-4 inset-x-0 flex justify-end px-6 z-50 animate-[slideDownFade_0.4s_ease-out]">
          <div className={`bg-white dark:bg-slate-800 text-slate-900 dark:text-white border ${alert.type === 'error' ? 'border-red-500' : 'border-green-500'} rounded-xl shadow-lg px-5 py-4 w-80 flex items-start space-x-3 pointer-events-auto`}>
            {alert.type === 'error' ? <XCircle className="text-red-500 shrink-0" /> : <CheckCircle className="text-green-500 shrink-0" />}
            <div className="flex-1">
              <h3 className="font-semibold text-sm">{alert.type === 'error' ? 'Hubo un error' : 'Éxito'}</h3>
              <p className="text-sm mt-1 text-slate-600 dark:text-slate-300">{alert.message}</p>
            </div>
            <button onClick={() => setAlert({ show: false })} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">✕</button>
          </div>
        </div>
      )}

      {/* Botón Volver */}
      <Link to="/" className="fixed top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-full text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition shadow-sm group">
        <ArrowLeft className="h-4 w-4 transform group-hover:-translate-x-1 transition-transform" /> Volver al inicio
      </Link>

      {/* Header Logo */}
      <div className="mt-8 flex items-center justify-center mb-2">
        <svg className="h-12 w-12 mr-3 text-[#0082A0] dark:text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M7 16.0001C4.23858 16.0001 2 13.7615 2 11.0001C2 8.23869 4.23858 6.00012 7 6.00012C7.33283 6.00012 7.65854 6.03266 7.97583 6.09495C8.92901 3.75217 11.2663 2.00012 14 2.00012C17.4565 2.00012 20.3344 4.44578 21.0828 7.71787C21.3825 7.8985 21.7006 8.12435 22 8.40012C20.9533 8.77542 20.2386 9.76969 20.0424 10.941C20.0143 11.1087 20 11.2805 20 11.4547C20 12.4812 20.5049 13.3956 21.2773 13.963C21.0458 15.1386 20.0058 16.0001 18.7778 16.0001H7Z" />
          <path d="M14 11.4547V8.72739M14 11.4547V14.1819M14 11.4547H16.7273M14 11.4547H11.2727" />
        </svg>
        <h1 className="text-4xl font-black tracking-widest text-[#0082A0] dark:text-cyan-300">
          SOMA
        </h1>
      </div>
      <h2 className="text-2xl md:text-3xl font-bold text-center text-slate-800 dark:text-slate-200 mt-2 px-4 max-w-2xl">
        Crea una cuenta como médico o profesional de la salud en SOMA
      </h2>

      {/* Contenedor del Formulario */}
      <div className="mt-10 bg-white dark:bg-slate-800 shadow-xl w-full max-w-3xl p-8 md:p-10 rounded-2xl border border-slate-200 dark:border-slate-700">
        <form onSubmit={handleRegister} className="space-y-6">
          
          {/* Especialidad */}
          <div>
            <label className="font-semibold text-sm text-slate-700 dark:text-slate-300">Especialidad médica</label>
            <select name="especialidad" onChange={handleChange} required className="w-full p-3 mt-1.5 border rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-cyan-500 outline-none transition-all">
              <option value="">Seleccione una especialidad</option>
              {especialidades.map(esp => <option key={esp} value={esp}>{esp}</option>)}
            </select>
          </div>

          {/* Nombres y Apellidos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="font-semibold text-sm text-slate-700 dark:text-slate-300">Primer Nombre</label>
              <input name="primer_nombre" type="text" maxLength="18" onChange={handleChange} placeholder="Ej: José" required className="w-full p-3 mt-1.5 border rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-cyan-500 outline-none transition-all" />
            </div>
            <div>
              <label className="font-semibold text-sm text-slate-700 dark:text-slate-300">Primer Apellido</label>
              <input name="primer_apellido" type="text" maxLength="18" onChange={handleChange} placeholder="Ej: Medina" required className="w-full p-3 mt-1.5 border rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-cyan-500 outline-none transition-all" />
            </div>
          </div>

          {/* Cédula y Teléfono */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="font-semibold text-sm text-slate-700 dark:text-slate-300">Número de identificación</label>
              <input name="numero_identificacion" type="text" maxLength="12" onChange={handleChange} placeholder="V-00000000" required className="w-full p-3 mt-1.5 border rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-cyan-500 outline-none transition-all" />
            </div>
            <div>
              <label className="font-semibold text-sm text-slate-700 dark:text-slate-300">Teléfono</label>
              <div className="flex items-center border mt-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700 overflow-hidden focus-within:ring-2 focus-within:ring-cyan-500 transition-all">
                <img className="w-[22px] h-[16px] object-cover ml-3" src="https://flagcdn.com/w20/ve.png" alt="Bandera Venezuela" />
                <span className="p-3 text-sm font-medium text-slate-700 dark:text-slate-300 border-r border-slate-300 dark:border-slate-700">+58</span>
                <input name="telefono" type="text" maxLength="12" onChange={handleChange} placeholder="Número de teléfono" required className="w-full p-3 bg-transparent outline-none text-slate-900 dark:text-white" />
              </div>
            </div>
          </div>

          {/* Correo */}
          <div>
            <label className="font-semibold text-sm text-slate-700 dark:text-slate-300">Correo</label>
            <input name="correo" type="email" onChange={handleChange} placeholder="correo@ejemplo.com" required className="w-full p-3 mt-1.5 border rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-cyan-500 outline-none transition-all" />
          </div>

          {/* Contraseñas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="font-semibold text-sm text-slate-700 dark:text-slate-300">Contraseña</label>
              <input name="contrasena" type="password" onChange={handleChange} required className="w-full p-3 mt-1.5 border rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-cyan-500 outline-none transition-all" />
            </div>
            <div>
              <label className="font-semibold text-sm text-slate-700 dark:text-slate-300">Confirmar contraseña</label>
              <input name="confirmar_contrasena" type="password" onChange={handleChange} required className="w-full p-3 mt-1.5 border rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-cyan-500 outline-none transition-all" />
            </div>
          </div>

          {/* Sexo */}
          <div>
            <label className="font-semibold text-sm text-slate-700 dark:text-slate-300">Sexo</label>
            <select name="sexo" onChange={handleChange} required className="w-full p-3 mt-1.5 border rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-cyan-500 outline-none transition-all">
              <option value="">Seleccione</option>
              <option value="Masculino">Masculino</option>
              <option value="Femenino">Femenino</option>
              <option value="Otro">Otro</option>
            </select>
          </div>

          {/* País y Ciudad */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="font-semibold text-sm text-slate-700 dark:text-slate-300">País</label>
              <select name="pais" disabled className="w-full p-3 mt-1.5 border rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-300 dark:border-slate-700 cursor-not-allowed outline-none">
                <option value="Venezuela">Venezuela</option>
              </select>
            </div>
            <div>
              <label className="font-semibold text-sm text-slate-700 dark:text-slate-300">Ciudad</label>
              <select name="ciudad" onChange={handleChange} required className="w-full p-3 mt-1.5 border rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-cyan-500 outline-none transition-all">
                {cities.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Botón Submit */}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full mt-4 bg-[#0082A0] dark:bg-cyan-600 text-white py-3.5 rounded-xl text-lg font-bold hover:bg-[#006d87] dark:hover:bg-cyan-700 transition-all transform hover:-translate-y-0.5 shadow-lg shadow-cyan-500/30 disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed"
          >
            {loading ? "Registrando Doctor..." : "Registrarse"}
          </button>

          {/* Enlace al Login */}
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              ¿Ya tienes cuenta?{' '}
              <Link to="/login" className="text-[#0082A0] dark:text-cyan-400 font-bold hover:underline transition-all">
                Iniciar sesión →
              </Link>
            </p>
          </div>

        </form>
      </div>
      
      {/* Definición de la animación en línea para Tailwind */}
      <style>{`
        @keyframes slideDownFade {
          0% { opacity: 0; transform: translateY(-20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}