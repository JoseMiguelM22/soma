import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { CheckCircle, XCircle } from 'lucide-react';

export default function ActualizarContrasena() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ contrasena: '', confirmar_contrasena: '' });
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    
    if (formData.contrasena !== formData.confirmar_contrasena) {
      setAlert({ show: true, type: 'error', message: 'Las contraseñas no coinciden. Revisa bien, mi pana.' });
      setTimeout(() => setAlert({ show: false, type: '', message: '' }), 5000);
      return;
    }

    setLoading(true);

    try {
      // Supabase ya sabe quién eres por el link del correo, solo actualizamos
      const { error } = await supabase.auth.updateUser({
        password: formData.contrasena
      });

      if (error) throw error;

      setAlert({ show: true, type: 'success', message: '¡Clave actualizada al pelo! Redirigiendo al Dashboard...' });
      
      // Esperamos un par de segundos y lo mandamos pa' dentro
      setTimeout(() => navigate('/dashboard'), 2000);

    } catch (error) {
      setAlert({ show: true, type: 'error', message: 'Hubo un error al actualizar la clave. Quizás el link expiró.' });
      setTimeout(() => setAlert({ show: false, type: '', message: '' }), 5000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#f7f9fc] dark:bg-slate-900 min-h-screen flex flex-col items-center justify-center p-4 transition-colors relative font-sans">
      
      {/* Alertas Toast */}
      {alert.show && (
        <div className="fixed top-4 inset-x-0 flex justify-center px-6 z-50 animate-[slideDownFade_0.4s_ease-out]">
          <div className={`bg-white dark:bg-slate-800 text-slate-900 dark:text-white border ${alert.type === 'error' ? 'border-red-500' : 'border-green-500'} rounded-xl shadow-lg px-5 py-4 w-80 flex items-start space-x-3`}>
            {alert.type === 'error' ? <XCircle className="text-red-500 shrink-0 text-xl" /> : <CheckCircle className="text-green-500 shrink-0 text-xl" />}
            <div className="flex-1">
              <h3 className="font-semibold text-sm">{alert.type === 'error' ? 'Error' : 'Éxito'}</h3>
              <p className="text-sm mt-1 text-slate-600 dark:text-slate-300">{alert.message}</p>
            </div>
          </div>
        </div>
      )}

      {/* Tarjeta Central */}
      <div className="bg-white dark:bg-slate-800 shadow-2xl w-full max-w-md p-8 md:p-10 rounded-3xl border border-slate-200 dark:border-slate-700 text-center relative overflow-hidden">
        
        {/* Decoración de fondo (un brillito arriba) */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-cyan-500 rounded-b-full shadow-[0_0_20px_rgba(6,182,212,0.5)]"></div>

        {/* Logo SOMA */}
        <div className="flex items-center justify-center mb-6 mt-2">
          <svg className="h-10 w-10 mr-3 text-cyan-600 dark:text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 16.0001C4.23858 16.0001 2 13.7615 2 11.0001C2 8.23869 4.23858 6.00012 7 6.00012C7.33283 6.00012 7.65854 6.03266 7.97583 6.09495C8.92901 3.75217 11.2663 2.00012 14 2.00012C17.4565 2.00012 20.3344 4.44578 21.0828 7.71787C21.3825 7.8985 21.7006 8.12435 22 8.40012C20.9533 8.77542 20.2386 9.76969 20.0424 10.941C20.0143 11.1087 20 11.2805 20 11.4547C20 12.4812 20.5049 13.3956 21.2773 13.963C21.0458 15.1386 20.0058 16.0001 18.7778 16.0001H7Z" />
            <path d="M14 11.4547V8.72739M14 11.4547V14.1819M14 11.4547H16.7273M14 11.4547H11.2727" />
          </svg>
          <h1 className="text-3xl font-black tracking-widest text-cyan-700 dark:text-cyan-400">
            SOMA
          </h1>
        </div>

        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Crea tu nueva clave
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
          Asegúrate de anotarla por ahí para que no se te vuelva a perder.
        </p>

        <form onSubmit={handleUpdate} className="space-y-5 text-left">
          
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-medium text-sm">Nueva Contraseña</label>
            <input 
              type="password" 
              name="contrasena" 
              value={formData.contrasena}
              onChange={handleChange}
              required 
              className="w-full mt-1.5 px-4 py-3 border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none transition-all" 
              placeholder="••••••••" 
            />
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-medium text-sm">Confirmar Contraseña</label>
            <input 
              type="password" 
              name="confirmar_contrasena" 
              value={formData.confirmar_contrasena}
              onChange={handleChange}
              required 
              className="w-full mt-1.5 px-4 py-3 border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none transition-all" 
              placeholder="••••••••" 
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full mt-6 bg-cyan-600 text-white py-3.5 rounded-xl font-bold hover:bg-cyan-700 transition-all transform hover:-translate-y-0.5 shadow-lg shadow-cyan-500/30 disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed flex justify-center items-center gap-2"
          >
            {loading ? (
              <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Guardando...</>
            ) : (
              'Actualizar y Entrar'
            )}
          </button>
        </form>

        <div className="mt-6 border-t border-slate-100 dark:border-slate-700 pt-6">
          <Link to="/login" className="text-sm text-slate-500 hover:text-cyan-600 dark:hover:text-cyan-400 font-medium transition-colors">
            Volver al inicio de sesión
          </Link>
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