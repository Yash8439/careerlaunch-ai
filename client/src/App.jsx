import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import Dashboard from './pages/Dashboard'
import ResumeAnalyzer from './pages/ResumeAnalyzer'
import ChatPage from './pages/ChatPage'
import MockInterview from './pages/MockInterview'
import RoadmapGenerator from './pages/RoadmapGenerator'
import QuestionGenerator from './pages/QuestionGenerator'
import ResourceHub from './pages/ResourceHub'
import PrivacyPolicy from './pages/PrivacyPolicy'
import TermsOfService from './pages/TermsOfService'
import About from './pages/About'
import Contact from './pages/Contact'
import AdminDashboard from './pages/AdminDashboard'
import AdminUsers from './pages/AdminUsers'
import AdminActivity from './pages/AdminActivity'
import AdminResources from './pages/AdminResources'
import ProfileSettings from './pages/ProfileSettings'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import CoverLetter from './pages/CoverLetter'
import CompanyPrep from './pages/CompanyPrep'
import InterviewScheduler from './pages/InterviewScheduler'
import ResumeBuilder from './pages/ResumeBuilder'
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary-400 border-t-transparent rounded-full animate-spin" />
    </div>
  )
  if (!user) return <Navigate to="/login" />
  if (user.role !== 'admin') return <Navigate to="/dashboard" />
  return children
}

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary-400 border-t-transparent rounded-full animate-spin" />
    </div>
  )
  return user ? children : <Navigate to="/login" />
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/resume" element={<ProtectedRoute><ResumeAnalyzer /></ProtectedRoute>} />
      <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
      <Route path="/interview" element={<ProtectedRoute><MockInterview /></ProtectedRoute>} />
      <Route path="/roadmap" element={<ProtectedRoute><RoadmapGenerator /></ProtectedRoute>} />
      <Route path="/questions" element={<ProtectedRoute><QuestionGenerator /></ProtectedRoute>} />
      <Route path="/resources" element={<ProtectedRoute><ResourceHub /></ProtectedRoute>} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
<Route path="/terms" element={<TermsOfService />} />
<Route path="/about" element={<About />} />
<Route path="/contact" element={<Contact />} />
<Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
<Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
<Route path="/admin/activity" element={<AdminRoute><AdminActivity /></AdminRoute>} />
<Route path="/admin/resources" element={<AdminRoute><AdminResources /></AdminRoute>} />
<Route path="/settings" element={<ProtectedRoute><ProfileSettings /></ProtectedRoute>} />
<Route path="/forgot-password" element={<ForgotPassword />} />
<Route path="/reset-password/:token" element={<ResetPassword />} />
<Route path="/cover-letter" element={<ProtectedRoute><CoverLetter /></ProtectedRoute>} />
<Route path="/company-prep" element={<ProtectedRoute><CompanyPrep /></ProtectedRoute>} />
<Route path="/scheduler" element={<ProtectedRoute><InterviewScheduler /></ProtectedRoute>} />
<Route path="/resume-builder" element={<ProtectedRoute><ResumeBuilder /></ProtectedRoute>} />


    </Routes>
  )
}