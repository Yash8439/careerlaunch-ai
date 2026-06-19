import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { GoogleOAuthProvider } from '@react-oauth/google'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: '#1A1A24', color: '#fff', border: '1px solid #2A2A3A' },
            success: { iconTheme: { primary: '#1D9E75', secondary: '#fff' } },
            error: { iconTheme: { primary: '#E24B4A', secondary: '#fff' } },
          }}
        />
      </AuthProvider>
    </GoogleOAuthProvider>
  </BrowserRouter>
)