import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('careerlunch_user')
    if (stored) setUser(JSON.parse(stored))
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    const { data } = await axios.post('http://localhost:5000/api/auth/login', { email, password })
    setUser(data)
    localStorage.setItem('careerlunch_user', JSON.stringify(data))
    return data
  }

  const register = async (name, email, password) => {
    const { data } = await axios.post('http://localhost:5000/api/auth/register', { name, email, password })
    setUser(data)
    localStorage.setItem('careerlunch_user', JSON.stringify(data))
    return data
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('careerlunch_user')
  }
  const loginWithGoogle = async (credential) => {
  const { data } = await axios.post('http://localhost:5000/api/auth/google', { credential })
  localStorage.setItem('careerlunch_user', JSON.stringify(data))
  setUser(data)
  return data
}

 return (
  <AuthContext.Provider value={{ user, login, register, logout, loading, setUser, loginWithGoogle }}>
    {children}
  </AuthContext.Provider>
)
}



export const useAuth = () => useContext(AuthContext)