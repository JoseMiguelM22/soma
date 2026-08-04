import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { Lock, AlertCircle, CheckCircle, Eye, EyeOff, ArrowLeft } from 'lucide-react';

export default function ActualizarContrasena() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Efecto para detectar si el enlace de Supabase expiró o dio error
  useEffect(() => {
    const isDark = localStorage.getItem('theme') === 'dark' || 
                  (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (isDark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');

    const hash = window.location.hash;
    if (hash && hash.includes('error=')) {
      setErrorMsg('El enlace de recuperación es inválido o ha expirado. Por favor, solicita uno nuevo desde el inicio de sesión.');
    }
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (password !== confirmPassword) {
      return setErrorMsg('Las contraseñas no coinciden.');
    }
    if (password.length < 6) {
      return setErrorMsg('La contraseña debe tener al menos 6 caracteres.');
    }

    setLoading(true);
    try {
      // Supabase detecta automáticamente la sesión a través del token en la URL
      const { error } = await supabase.auth.updateUser({ password: password });
      if (error) throw error;

      setSuccessMsg('¡Tu contraseña ha sido actualizada con éxito!');
      
      // Redirigimos al login después de 3 segundos
      setTimeout(() => {
        navigate('/login');
      }, 3000);

    } catch (error) {
      setErrorMsg('Hubo un error al actualizar: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0D12] flex items-center justify-center p-4 transition-colors duration-300" style={{ fontFamily: "'Nunito', sans-serif" }}>
      <div className="w-full max-w-md bg-white dark:bg-[#111111] rounded-[2rem] shadow-2xl overflow-hidden border border-slate-200 dark:border-white/5 animate-[fadeIn_0.3s_ease-out] relative">
        
        {/* Barra superior de adorno */}
        <div className="h-2 w-full bg-gradient-to-r from-[#0081a7] to-[#00b4d8]"></div>

        <div className="p-8 md:p-10">
          
          {/* Logo SOMA Dinámico */}
          <div className="flex justify-center mb-6">
            <img src="/soma_logo.png" alt="SOMA Logo" className="h-10 object-contain block dark:hidden" />
            <img src="/soma_logo_blanco.png" alt="SOMA Logo" className="h-10 object-contain hidden dark:block" />
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-2">Crea tu nueva clave</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Asegúrate de anotarla por ahí para que no se te vuelva a perder.</p>
          </div>

          {/* Alertas */}
          {errorMsg && (
            <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800/50 rounded-xl flex items-start gap-3 text-rose-600 dark:text-rose-400 text-sm font-bold animate-[fadeIn_0.3s_ease-out]">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <p className="leading-relaxed">{errorMsg}</p>
            </div>
          )}

          {successMsg && (
            <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 rounded-xl flex items-center gap-3 text-emerald-600 dark:text-emerald-400 text-sm font-bold animate-[fadeIn_0.3s_ease-out]">
              <CheckCircle size={18} className="shrink-0" />
              <p>{successMsg}</p>
            </div>
          )}

          <form onSubmit={handleUpdate} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Nueva Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-12 py-3 bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-[#0081a7] text-sm text-slate-900 dark:text-white font-medium transition-all"
                  placeholder="••••••••"
                  required
                  disabled={loading || successMsg !== ''}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                  {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Confirmar Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-[#0081a7] text-sm text-slate-900 dark:text-white font-medium transition-all"
                  placeholder="••••••••"
                  required
                  disabled={loading || successMsg !== ''}
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading || successMsg !== '' || errorMsg !== '' && password === ''}
              className="w-full bg-[#0081a7] hover:bg-[#006b8a] text-white py-3.5 rounded-xl font-bold shadow-lg shadow-cyan-500/20 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none mt-2"
            >
              {loading ? 'Guardando...' : successMsg ? 'Redirigiendo...' : 'Actualizar y Entrar'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <Link to="/login" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#0081a7] transition-colors group">
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
              Volver al inicio de sesión
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}