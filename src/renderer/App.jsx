import { useState } from 'react'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Login, Dashboard} from './pages' 

export default function App() {
  const [puesto, setPuesto] = useState('') 

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Login setPuesto={setPuesto} />} />
        <Route path="/dashboard" element={<Dashboard puesto={puesto} />} />
        {/* <Route path="/usuarios" element= {
          puesto === 'admin' ? <Usuarios /> : <Navigate to="/dashboard" replace />
        }/> */}
        <Route path="*" element={<Navigate to="/login" replace/>} />
      </Routes>
    </HashRouter>
  )
}
