import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import AnimatedBackground from '../components/AnimatedBackground'
import { API_URL } from '../config'
import {
  ArrowLeft, Building2, ChevronRight, Brain, Code2,
  Users, BookOpen, Target, Lightbulb, ExternalLink, Loader
} from 'lucide-react'

const companies = [
  { name: 'Amazon', icon: '🛒', color: '#FF9900', bg: 'bg-orange-900/20', border: 'border-orange-600/30', tier: 'FAANG' },
  { name: 'Google', icon: '🔍', color: '#4285F4', bg: 'bg-blue-900/20', border: 'border-blue-600/30', tier: 'FAANG' },
  { name: 'Microsoft', icon: '🪟', color: '#00A4EF', bg: 'bg-sky-900/20', border: 'border-sky-600/30', tier: 'FAANG' },
  { name: 'Meta', icon: '👥', color: '#1877F2', bg: 'bg-blue-900/20', border: 'border-blue-600/30', tier: 'FAANG' },
  { name: 'Flipkart', icon: '🛍️', color: '#F0CB00', bg: 'bg-yellow-900/20', border: 'border-yellow-600/30', tier: 'Product' },
  { name: 'Swiggy', icon: '🍔', color: '#FC8019', bg: 'bg-orange-900/20', border: 'border-orange-600/30', tier: 'Product' },
  { name: 'Zomato', icon: '🍕', color: '#E23744', bg: 'bg-red-900/20', border: 'border-red-600/30', tier: 'Product' },
  { name: 'Paytm', icon: '💰', color: '#00B9F1', bg: 'bg-cyan-900/20', border: 'border-cyan-600/30', tier: 'Product' },
  { name: 'TCS', icon: '🏢', color: '#1A5276', bg: 'bg-blue-900/20', border: 'border-blue-600/30', tier: 'Service' },
  { name: 'Infosys', icon: '💻', color: '#007CC3', bg: 'bg-blue-900/20', border: 'border-blue-600/30', tier: 'Service' },
  { name: 'Wipro', icon: '⚙️', color: '#341C5C', bg: 'bg-purple-900/20', border: 'border-purple-600/30', tier: 'Service' },
  { name: 'Accenture', icon: '🌐', color: '#A100FF', bg: 'bg-purple-900/20', border: 'border-purple-600/30', tier: 'Service' },
]

const tierColors = {
  'FAANG': 'text-yellow-400 bg-yellow-900/20 border-yellow-600/30',
  'Product': 'text-teal-400 bg-teal-900/20 border-teal-600/30',
  'Service': 'text-blue-400 bg-blue-900/20 border-blue-600/30',
}

export default function CompanyPrep() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [selected, setSelected] = useState(null)
  const [prepData, setPrepData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  const fetchCompanyPrep = async (company) => {
    setSelected(company)
    setLoading(true)
    setPrepData(null)
    setActiveTab('overview')
    try {
      const { data } = await axios.post(`${API_URL}/api/company-prep/generate`,
        { companyName: company.name },
        { headers: { Authorization: `Bearer ${user.token}` } }
      )
      setPrepData(data.prepData)
    } catch (err) {
      toast.error('Failed to load company prep data')
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Building2 },
    { id: 'dsa', label: 'DSA Topics', icon: Code2 },
    { id: 'hr', label: 'HR Questions', icon: Users },
    { id: 'tips', label: 'Tips', icon: Lightbulb },
  ]

  return (
    <div className="min-h-screen bg-dark-900 text-white relative">
      <AnimatedBackground />

      <div className="relative z-10">
        {/* Header */}
        <div className="bg-dark-800/90 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors">
            <ArrowLeft size={20} className="text-gray-400" />
          </button>
          <div>
            <h1 className="text-xl font-bold">Company Prep Mode</h1>
            <p className="text-sm text-gray-400">AI-powered company-specific interview preparation</p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="grid lg:grid-cols-3 gap-6">

            {/* Left — Company List */}
            <div className="lg:col-span-1">
              <div className="glass rounded-2xl p-4 border border-white/5">
                <h2 className="text-sm font-semibold text-gray-400 mb-4 px-2">SELECT COMPANY</h2>

                {['FAANG', 'Product', 'Service'].map(tier => (
                  <div key={tier} className="mb-4">
                    <p className="text-xs text-gray-600 px-2 mb-2">{tier}</p>
                    {companies.filter(c => c.tier === tier).map(company => (
                      <button key={company.name} onClick={() => fetchCompanyPrep(company)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 mb-1
                          ${selected?.name === company.name
                            ? `${company.bg} ${company.border} border text-white`
                            : 'text-gray-400 hover:bg-white/5 hover:text-white'
                          }`}>
                        <span className="text-xl">{company.icon}</span>
                        <span>{company.name}</span>
                        <span className={`ml-auto text-xs px-2 py-0.5 rounded-full border ${tierColors[tier]}`}>
                          {tier}
                        </span>
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Right — Prep Content */}
            <div className="lg:col-span-2">
              {!selected && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="glass rounded-2xl p-12 border border-white/5 text-center h-full flex flex-col items-center justify-center">
                  <Building2 size={48} className="text-gray-600 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-400 mb-2">Select a Company</h3>
                  <p className="text-gray-600 text-sm">Choose a company from the left to get AI-powered preparation guide</p>
                </motion.div>
              )}

              {selected && loading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="glass rounded-2xl p-12 border border-white/5 text-center">
                  <Loader size={40} className="text-primary-400 mx-auto mb-4 animate-spin" />
                  <p className="text-gray-400">Generating {selected.name} prep guide...</p>
                  <p className="text-gray-600 text-sm mt-2">AI is analyzing interview patterns</p>
                </motion.div>
              )}

              {selected && prepData && !loading && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>

                  {/* Company Header */}
                  <div className={`glass rounded-2xl p-5 border ${selected.border} mb-4 flex items-center gap-4`}>
                    <span className="text-4xl">{selected.icon}</span>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold">{selected.name}</h2>
                      <p className="text-gray-400 text-sm">{prepData.tagline}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 mb-1">Difficulty</p>
                      <span className={`text-sm font-bold ${prepData.difficulty === 'Very Hard' ? 'text-red-400' : prepData.difficulty === 'Hard' ? 'text-orange-400' : 'text-yellow-400'}`}>
                        {prepData.difficulty}
                      </span>
                    </div>
                  </div>

                  {/* Tabs */}
                  <div className="flex gap-2 mb-4 overflow-x-auto">
                    {tabs.map(tab => (
                      <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all
                          ${activeTab === tab.id ? 'bg-primary-600 text-white' : 'glass text-gray-400 hover:text-white border border-white/5'}`}>
                        <tab.icon size={15} />
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Tab Content */}
                  <AnimatePresence mode="wait">
                    <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }} className="glass rounded-2xl p-6 border border-white/5">

                      {/* Overview Tab */}
                      {activeTab === 'overview' && (
                        <div className="space-y-5">
                          <div>
                            <h3 className="font-semibold mb-3 flex items-center gap-2">
                              <Target size={16} className="text-primary-400" /> Interview Rounds
                            </h3>
                            <div className="space-y-2">
                              {prepData.rounds?.map((round, i) => (
                                <div key={i} className="flex items-start gap-3 bg-dark-700/50 rounded-xl p-3">
                                  <div className="w-7 h-7 bg-primary-900/50 text-primary-400 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                                    {i + 1}
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-white">{round.name}</p>
                                    <p className="text-xs text-gray-400 mt-0.5">{round.description}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div>
                            <h3 className="font-semibold mb-3 flex items-center gap-2">
                              <BookOpen size={16} className="text-teal-400" /> Key Focus Areas
                            </h3>
                            <div className="flex flex-wrap gap-2">
                              {prepData.focusAreas?.map((area, i) => (
                                <span key={i} className="text-sm bg-teal-900/20 text-teal-300 border border-teal-700/30 px-3 py-1 rounded-full">
                                  {area}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="bg-dark-700/30 rounded-xl p-4">
                            <p className="text-sm text-gray-300 leading-relaxed">{prepData.overview}</p>
                          </div>
                        </div>
                      )}

                      {/* DSA Tab */}
                      {activeTab === 'dsa' && (
                        <div className="space-y-4">
                          <p className="text-sm text-gray-400">{prepData.dsaNote}</p>
                          {prepData.dsaTopics?.map((topic, i) => (
                            <div key={i} className="bg-dark-700/50 rounded-xl p-4">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium text-white">{topic.topic}</h4>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${topic.priority === 'Must Know' ? 'bg-red-900/30 text-red-400 border border-red-700/30' : topic.priority === 'Important' ? 'bg-orange-900/30 text-orange-400 border border-orange-700/30' : 'bg-gray-800 text-gray-400 border border-white/10'}`}>
                                  {topic.priority}
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                {topic.subtopics?.map((sub, j) => (
                                  <span key={j} className="text-xs bg-dark-600 text-gray-300 px-2 py-0.5 rounded-full">
                                    {sub}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* HR Questions Tab */}
                      {activeTab === 'hr' && (
                        <div className="space-y-3">
                          <p className="text-sm text-gray-400 mb-4">{prepData.hrNote}</p>
                          {prepData.hrQuestions?.map((q, i) => (
                            <div key={i} className="bg-dark-700/50 rounded-xl p-4">
                              <div className="flex items-start gap-3">
                                <span className="w-7 h-7 bg-primary-900/50 text-primary-400 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                                  {i + 1}
                                </span>
                                <div>
                                  <p className="text-sm text-white font-medium">{q.question}</p>
                                  <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">{q.hint}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Tips Tab */}
                      {activeTab === 'tips' && (
                        <div className="space-y-3">
                          {prepData.tips?.map((tip, i) => (
                            <div key={i} className="flex items-start gap-3 bg-dark-700/50 rounded-xl p-4">
                              <span className="text-xl flex-shrink-0">{tip.emoji}</span>
                              <div>
                                <p className="text-sm font-medium text-white">{tip.title}</p>
                                <p className="text-xs text-gray-400 mt-1 leading-relaxed">{tip.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                    </motion.div>
                  </AnimatePresence>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}