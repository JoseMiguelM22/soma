import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Register from './pages/Register';
import Pacientes from './pages/Pacientes';
import ActualizarContrasena from './pages/ActualizarContrasena';
import Historias from './pages/Historias';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/register" element={<Register />} />
      <Route path="/pacientes" element={<Pacientes />} />
      <Route path="/actualizar-contrasena" element={<ActualizarContrasena />} />
      <Route path="/historias" element={<Historias />} />
    </Routes>
  )
}

export default App