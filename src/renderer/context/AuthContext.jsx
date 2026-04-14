import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null)

export function AuthProvider({children}) {
    const [usuario, setUsuario] = useState(null)

    function guardarSesion(data){
        setUsuario({
            id: data.id,
            puesto: data.puesto
        })
    }

    function cerrarSesion(){
        setUsuario(null)    
    }

    const esAdmin = usuario?.puesto === 'admin'

    return (
        <AuthContext.Provider value={{ usuario, esAdmin, guardarSesion, cerrarSesion }}>
            {children}
        </AuthContext.Provider>
    )
}

// custom hook — any component calls this to read auth state
export function useAuth() {
  return useContext(AuthContext)
}