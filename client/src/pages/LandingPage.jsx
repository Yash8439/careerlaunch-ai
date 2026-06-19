import { useState, useEffect, useRef } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Brain, FileText, Mic, Map, Trophy, Zap, ArrowRight, PlayCircle, Star, Sparkles, Mail, Code2, ChevronUp } from 'lucide-react'
import RobotScene from '../components/RobotScene'

const AnimatedCounter = ({ value, suffix = '', duration = 1.5 }) => {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (!isInView) return
    const numericValue = parseInt(value)
    if (isNaN(numericValue)) { setCount(value); return }

    let startTime
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1)
      setCount(Math.floor(progress * numericValue))
      if (progress < 1) requestAnimationFrame(animate)
      else setCount(numericValue)
    }
    requestAnimationFrame(animate)
  }, [isInView, value, duration])

  return <span ref={ref}>{count}{suffix}</span>
}
const demoScreens = [
  { title: 'Resume Analyzer', desc: 'AI-powered ATS scoring with detailed feedback', image: '/screenshots/resume-analyzer.png' },
  { title: 'Mock Interview', desc: 'Voice-based interview with AI avatar Sarah', image: '/screenshots/mock-interview.png' },
  { title: 'AI Notes Chatbot', desc: 'Chat with your study materials using RAG', image: '/screenshots/ai-chatbot.png' },
  { title: 'Roadmap Generator', desc: '8-week personalized placement preparation plan', image: '/screenshots/roadmap-generator.png' },
]

const DemoCarousel = () => {
  const [active, setActive] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setActive(prev => (prev + 1) % demoScreens.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div>
      <div className="relative glass rounded-3xl border border-white/10 overflow-hidden">
        {demoScreens.map((screen, i) => (
          <motion.div key={i}
            initial={false}
            animate={{ opacity: active === i ? 1 : 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0"
            style={{ pointerEvents: active === i ? 'auto' : 'none' }}>
            <img src={screen.image} alt={screen.title} className="w-full h-full object-cover object-top" />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-dark-900 via-dark-900/80 to-transparent p-6 pt-16">
              <h3 className="text-xl font-bold text-white mb-1">{screen.title}</h3>
              <p className="text-gray-300 text-sm">{screen.desc}</p>
            </div>
          </motion.div>
        ))}
        {/* Spacer to maintain aspect ratio */}
        <div style={{ paddingTop: '56.25%' }} />
      </div>

      {/* Dots */}
      <div className="flex items-center justify-center gap-2 mt-6">
        {demoScreens.map((_, i) => (
          <button key={i} onClick={() => setActive(i)}
            className={`h-2 rounded-full transition-all duration-300 ${active === i ? 'w-8 bg-primary-400' : 'w-2 bg-dark-600'}`} />
        ))}
      </div>

      {/* Thumbnails */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8">
        {demoScreens.map((screen, i) => (
          <button key={i} onClick={() => setActive(i)}
            className={`text-left rounded-xl border overflow-hidden transition-all duration-200
              ${active === i ? 'border-primary-400' : 'border-white/5 hover:border-white/20'}`}>
            <img src={screen.image} alt={screen.title} className="w-full h-16 object-cover object-top" />
            <p className="text-xs font-medium text-white truncate p-2">{screen.title}</p>
          </button>
        ))}
      </div>
    </div>
  )
}
const testimonials = [
  { name: 'Priya Sharma', role: 'CSE, 3rd Year', avatar: 'PS', color: '#7F77DD', text: 'The mock interview feature with voice support felt exactly like a real interview. My confidence improved massively.' },
  { name: 'Rahul Verma', role: 'IT, Final Year', avatar: 'RV', color: '#1D9E75', text: 'Resume analyzer gave me specific feedback. My ATS score went from 58 to 89 after the suggested changes.' },
  { name: 'Ananya Gupta', role: 'CSE, 4th Year', avatar: 'AG', color: '#D85A30', text: 'The AI chatbot helped me revise OS and DBMS right before interviews. Saved hours of searching for notes.' },
  { name: 'Karan Mehta', role: 'ECE, 3rd Year', avatar: 'KM', color: '#3B8BD4', text: 'The roadmap generator gave me a clear 8-week plan for full stack. I knew exactly what to study every week.' },
  { name: 'Sneha Reddy', role: 'CSE, Final Year', avatar: 'SR', color: '#D4537E', text: 'Question generator helped me practice 200+ DSA questions with explanations. Got placed at a product company!' },
  { name: 'Arjun Nair', role: 'IT, 4th Year', avatar: 'AN', color: '#EF9F27', text: 'The AI career coach gave me daily personalized tips. It felt like having a mentor available 24/7.' },
]

const TestimonialCard = ({ t }) => (
  <div className="glass rounded-2xl p-6 border border-white/5 w-80 flex-shrink-0 mx-3">
    <div className="flex items-center gap-1 mb-4">
      {[...Array(5)].map((_, j) => <Star key={j} size={14} className="text-yellow-400 fill-yellow-400" />)}
    </div>
    <p className="text-gray-300 text-sm leading-relaxed mb-6">"{t.text}"</p>
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
        style={{ background: t.color }}>
        {t.avatar}
      </div>
      <div>
        <p className="text-sm font-medium text-white">{t.name}</p>
        <p className="text-xs text-gray-500">{t.role}</p>
      </div>
    </div>
  </div>
)

const TestimonialMarquee = () => {
  const doubled = [...testimonials, ...testimonials]
  return (
    <div className="relative">
      <div className="flex animate-marquee">
        {doubled.map((t, i) => <TestimonialCard key={i} t={t} />)}
      </div>
      {/* Fade edges */}
      <div className="absolute top-0 left-0 w-24 h-full bg-gradient-to-r from-dark-900 to-transparent pointer-events-none" />
      <div className="absolute top-0 right-0 w-24 h-full bg-gradient-to-l from-dark-900 to-transparent pointer-events-none" />
    </div>
  )
}
const BackToTop = () => {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 500)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 w-12 h-12 bg-primary-600 hover:bg-primary-400 rounded-full flex items-center justify-center shadow-lg z-50 transition-colors">
          <ChevronUp size={22} className="text-white" />
        </motion.button>
      )}
    </AnimatePresence>
  )
}
const AnimatedBackground = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
    <div className="bg-grid" />
    <div className="bg-blob" style={{ width: '500px', height: '500px', background: '#7F77DD', top: '-10%', left: '-5%', animationDelay: '0s' }} />
    <div className="bg-blob" style={{ width: '400px', height: '400px', background: '#1D9E75', top: '20%', right: '-10%', animationDelay: '5s' }} />
    <div className="bg-blob" style={{ width: '450px', height: '450px', background: '#D85A30', bottom: '10%', left: '10%', animationDelay: '10s' }} />
    <div className="bg-blob" style={{ width: '350px', height: '350px', background: '#3B8BD4', bottom: '-5%', right: '15%', animationDelay: '15s' }} />
  </div>
)
const TiltCard = ({ children, className }) => {
  const ref = useRef(null)
  const [style, setStyle] = useState({})

  const handleMouseMove = (e) => {
    const card = ref.current
    if (!card) return
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const rotateX = ((y - centerY) / centerY) * -6
    const rotateY = ((x - centerX) / centerX) * 6

    setStyle({
      transform: `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`,
      '--glow-x': `${(x / rect.width) * 100}%`,
      '--glow-y': `${(y / rect.height) * 100}%`,
    })
  }

  const handleMouseLeave = () => {
    setStyle({ transform: 'perspective(800px) rotateX(0) rotateY(0) scale3d(1,1,1)' })
  }

  return (
    <div ref={ref} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}
      style={{ ...style, transition: 'transform 0.15s ease-out' }}
      className={`tilt-card ${className || ''}`}>
      <div className="tilt-glow" style={{ background: `radial-gradient(circle at ${style['--glow-x'] || '50%'} ${style['--glow-y'] || '50%'}, rgba(127,119,221,0.15), transparent 60%)` }} />
      {children}
    </div>
  )
}
const features = [
  { icon: Brain, title: 'AI Notes Chatbot', desc: 'Chat with your study materials using RAG technology', color: 'text-primary-400', bg: 'bg-primary-900/30' },
  { icon: FileText, title: 'Resume Analyzer', desc: 'Get ATS score, skill gaps & AI improvement suggestions', color: 'text-teal-400', bg: 'bg-teal-900/30' },
  { icon: Mic, title: 'Mock Interviews', desc: 'AI-powered voice interviews with real-time evaluation', color: 'text-orange-400', bg: 'bg-orange-900/30' },
  { icon: Map, title: 'Roadmap Generator', desc: 'Personalized weekly learning roadmaps for your dream role', color: 'text-blue-400', bg: 'bg-blue-900/30' },
  { icon: Trophy, title: 'Skill Tracker', desc: 'Track DSA, OS, DBMS, OOPS progress with streaks', color: 'text-yellow-400', bg: 'bg-yellow-900/30' },
  { icon: Zap, title: 'Project Generator', desc: 'AI-generated project ideas matched to your skill level', color: 'text-pink-400', bg: 'bg-pink-900/30' },
]

const stats = [
  { value: '10+', label: 'AI Features' },
  { value: '100%', label: 'Free to Use' },
  { value: '5 mins', label: 'Setup Time' },
  { value: '∞', label: 'Mock Interviews' },
]

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState(null)
  const [scrolled, setScrolled] = useState(false)

useEffect(() => {
  const handleScroll = () => setScrolled(window.scrollY > 20)
  window.addEventListener('scroll', handleScroll)
  return () => window.removeEventListener('scroll', handleScroll)
}, [])
  return (
    <div className="min-h-screen bg-dark-900 text-white overflow-x-hidden relative">
      <AnimatedBackground />

      {/* Navbar */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-dark-900/90 backdrop-blur-xl border-b border-white/10 shadow-lg' : 'glass border-b border-white/5'}`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <Brain size={18} className="text-white" />
            </div>
            <span className="font-bold text-lg">CareerLaunch <span className="gradient-text">AI</span></span>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4">
            <Link to="/login" className="text-sm text-gray-400 hover:text-white transition-colors">Login</Link>
            <Link to="/register"
              className="text-sm bg-primary-600 hover:bg-primary-400 text-white px-4 py-2 rounded-lg transition-all duration-200">
              Get Started
            </Link>
          </motion.div>
        </div>
      </nav>

      {/* Hero */}
      <section className="min-h-screen flex items-center justify-center px-6 pt-20">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-8 text-sm text-gray-300">
              <Star size={14} className="text-yellow-400" />
              <span>AI-Powered Placement Preparation Platform</span>
            </div>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold leading-tight mb-6">
            Land Your Dream{' '}
            <span className="gradient-text-animated">Tech Job</span>{' '}
            with AI
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Resume analysis, mock interviews, RAG-based study chatbot, personalized roadmaps —
            everything you need for placements in one AI platform.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register"
  className="btn-shimmer group flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-400 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 glow-purple">
  
              Start Preparing Free
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <button onClick={() => document.getElementById('features-section')?.scrollIntoView({ behavior: 'smooth' })}
  className="flex items-center justify-center gap-2 glass hover:bg-white/10 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200">
  <PlayCircle size={20} />
  Explore Features
</button>
          </motion.div>

          {/* Stats */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.5 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20">
            {stats.map((s, i) => (
  <div key={i} className="glass rounded-xl p-4 text-center">
    <div className="text-3xl font-bold gradient-text">
      {s.value === '∞' ? '∞' : s.value.match(/^\d+/) ? (
        <><AnimatedCounter value={s.value.match(/^\d+/)[0]} suffix={s.value.replace(/^\d+/, '')} /></>
      ) : s.value}
    </div>
    <div className="text-sm text-gray-400 mt-1">{s.label}</div>
  </div>
))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features-section" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Everything You Need to <span className="gradient-text">Get Placed</span></h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              10+ AI-powered features built specifically for Indian engineering students targeting tech placements
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
{features.map((f, i) => (
  <motion.div key={i}
    initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
    <TiltCard className="glass rounded-2xl p-6 cursor-pointer group hover:border-primary-600/50 border border-transparent transition-all duration-300">
      <div className={`w-12 h-12 ${f.bg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200 relative z-10`}>
        <f.icon size={24} className={f.color} />
      </div>
      <h3 className="text-lg font-semibold mb-2 relative z-10">{f.title}</h3>
      <p className="text-gray-400 text-sm leading-relaxed relative z-10">{f.desc}</p>
    </TiltCard>
  </motion.div>
))}

          </div>
        </div>
      </section>
      {/* Live Demo Carousel */}
<section className="py-24 px-6 overflow-hidden">
  <div className="max-w-6xl mx-auto">
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }} className="text-center mb-16">
      <h2 className="text-4xl font-bold mb-4">See It In <span className="gradient-text">Action</span></h2>
      <p className="text-gray-400 text-lg">Real screens from the actual platform</p>
    </motion.div>

    <DemoCarousel />
  </div>
</section>
      {/* How It Works */}
<section className="py-24 px-6 bg-dark-800/30">
  <div className="max-w-5xl mx-auto">
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }} className="text-center mb-16">
      <h2 className="text-4xl font-bold mb-4">Get Started in <span className="gradient-text">3 Simple Steps</span></h2>
      <p className="text-gray-400 text-lg">From sign up to interview-ready in minutes</p>
    </motion.div>

    <div className="grid md:grid-cols-3 gap-8 relative">

      {/* Connector line - desktop only */}
      <div className="hidden md:block absolute top-8 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-600/0 via-primary-600/40 to-primary-600/0" style={{ left: '16%', right: '16%' }} />

      {[
        { num: '01', title: 'Sign Up Free', desc: 'Create your account in seconds — no credit card, no hidden fees', icon: '👤' },
        { num: '02', title: 'Upload & Explore', desc: 'Upload your resume, study notes, or start a mock interview instantly', icon: '📄' },
        { num: '03', title: 'Get AI Insights', desc: 'Receive personalized scores, roadmaps & feedback to land your dream job', icon: '🎯' },
      ].map((step, i) => (
        <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ delay: i * 0.15 }}
          className="relative text-center">
          <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-5 relative z-10 glow-purple">
            {step.icon}
          </div>
          <div className="text-xs font-bold text-primary-400 mb-2">STEP {step.num}</div>
          <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
          <p className="text-gray-400 text-sm leading-relaxed">{step.desc}</p>
        </motion.div>
      ))}
    </div>
  </div>
</section>
{/* Meet your AI assistant */}
<section className="py-24 px-6">
  <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
    <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }} style={{ height: '400px' }}>
      <RobotScene />
    </motion.div>

    <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}>
      <h2 className="text-4xl font-bold mb-4">Meet Your <span className="gradient-text">AI Assistant</span></h2>
      <p className="text-gray-400 text-lg leading-relaxed mb-6">
        Available 24/7 to analyze your resume, conduct mock interviews, answer your study questions, and guide your entire placement journey — powered by advanced AI models.
      </p>
      <Link to="/register"
        className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-400 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200">
        Start Talking to AI <ArrowRight size={18} />
      </Link>
      <p className="text-xs text-gray-500 mt-3">💡 Tip: Click on the robot too!</p>
    </motion.div>
  </div>
</section>
{/* Testimonials */}
<section className="py-24 overflow-hidden bg-dark-800/30">
  <div className="max-w-6xl mx-auto px-6">
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }} className="text-center mb-16">
      <h2 className="text-4xl font-bold mb-4">What <span className="gradient-text">Students Say</span></h2>
      <p className="text-gray-400 text-lg">Real feedback from placement aspirants</p>
    </motion.div>
  </div>

  <TestimonialMarquee />
</section>

        
{/* FAQ */}
<section className="py-24 px-6">
  <div className="max-w-3xl mx-auto">
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }} className="text-center mb-12">
      <h2 className="text-4xl font-bold mb-4">Frequently Asked <span className="gradient-text">Questions</span></h2>
      <p className="text-gray-400 text-lg">Everything you need to know</p>
    </motion.div>

    <div className="space-y-3">
      {[
        { q: 'Why CareerLaunch AI?', a: 'Most placement prep is scattered — random YouTube videos, generic resume templates, and no real way to track progress. CareerLaunch AI brings everything together in one place: AI-powered resume scoring, realistic voice mock interviews, a chatbot that answers from your own notes, and personalized roadmaps that adapt to your actual skill level. It\'s built to feel like having a personal placement mentor available 24/7.' },
        { q: 'Is CareerLaunch AI completely free to use?', a: 'Yes! All features including resume analysis, mock interviews, AI chatbot, and roadmap generation are 100% free. No hidden costs or premium tiers.' },
        { q: 'How does the AI resume scoring work?', a: 'Our AI analyzes your resume against ATS (Applicant Tracking System) standards, checking for keyword optimization, formatting, skills relevance, and project quality to generate a score out of 100.' },
        { q: 'Can I practice mock interviews with voice?', a: 'Absolutely! Our mock interview feature supports voice-based answers using speech recognition, simulating a real interview experience with an AI interviewer.' },
        { q: 'Do I need to upload notes to use the AI chatbot?', a: 'No, the chatbot works in two modes — general placement Q&A without documents, or RAG-based mode where it answers specifically from your uploaded study notes.' },
        { q: 'How accurate is the AI feedback?', a: 'Our AI is trained on real interview patterns and placement criteria used by top tech companies, giving you industry-relevant, actionable feedback for every interaction.' },
      ].map((faq, i) => (
        <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ delay: i * 0.05 }}
          className="glass rounded-2xl border border-white/5 overflow-hidden">
          <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
            className="w-full flex items-center justify-between p-5 text-left">
            <span className="font-medium text-white pr-4">{faq.q}</span>
            <span className={`text-primary-400 text-xl flex-shrink-0 transition-transform duration-200 ${openFaq === i ? 'rotate-45' : ''}`}>+</span>
          </button>
          {openFaq === i && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }} className="px-5 pb-5">
              <p className="text-gray-400 text-sm leading-relaxed">{faq.a}</p>
            </motion.div>
          )}
        </motion.div>
      ))}
    </div>
  </div>
</section>

      {/* CTA */}
      <section className="py-24 px-6">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center glass rounded-3xl p-12 border border-primary-600/30 glow-purple">
          <h2 className="text-4xl font-bold mb-4">Ready to Get <span className="gradient-text">Placed?</span></h2>
          <p className="text-gray-400 mb-8">Join thousands of students using AI to crack their dream companies</p>
          <Link to="/register"
            className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-400 text-white px-10 py-4 rounded-xl font-semibold text-lg transition-all duration-200">
            Start Free Today <ArrowRight size={20} />
          </Link>
        </motion.div>
      </section>

     {/* Footer */}
<footer className="border-t border-white/5 pt-16 pb-8 px-6">
  <div className="max-w-6xl mx-auto">
    <div className="grid md:grid-cols-5 gap-10 mb-10">

      <div className="md:col-span-2">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <Brain size={18} className="text-white" />
          </div>
          <span className="font-bold text-lg text-white">CareerLaunch <span className="gradient-text">AI</span></span>
        </div>
        <p className="text-gray-400 text-sm leading-relaxed max-w-sm mb-5">
          AI-powered placement preparation platform helping engineering students land their dream tech jobs through resume analysis, mock interviews, and personalized roadmaps.
        </p>
        <div className="flex flex-wrap gap-2">
          {['React', 'Node.js', 'MongoDB', 'Groq AI', 'Tailwind'].map((tech, i) => (
            <span key={i} className="text-xs bg-dark-700 border border-white/5 text-gray-400 px-2.5 py-1 rounded-full">
              {tech}
            </span>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-white font-semibold text-sm mb-4">Features</h4>
        <ul className="space-y-2.5 text-sm text-gray-400">
          <li><Link to="/login" className="hover:text-primary-400 transition-colors">Resume Analyzer</Link></li>
          <li><Link to="/login" className="hover:text-primary-400 transition-colors">Mock Interviews</Link></li>
          <li><Link to="/login" className="hover:text-primary-400 transition-colors">AI Notes Chatbot</Link></li>
          <li><Link to="/login" className="hover:text-primary-400 transition-colors">Roadmap Generator</Link></li>
        </ul>
      </div>

      <div>
        <h4 className="text-white font-semibold text-sm mb-4">Quick Links</h4>
        <ul className="space-y-2.5 text-sm text-gray-400">
  <li><Link to="/privacy" className="hover:text-primary-400 transition-colors">Privacy Policy</Link></li>
  <li><Link to="/terms" className="hover:text-primary-400 transition-colors">Terms of Service</Link></li>
  <li><Link to="/about" className="hover:text-primary-400 transition-colors">About</Link></li>
  <li><Link to="/contact" className="hover:text-primary-400 transition-colors">Contact</Link></li>
</ul>
      </div>

      <div>
        <h4 className="text-white font-semibold text-sm mb-4">Connect</h4>
        <div className="flex items-center gap-3">
          <a href="https://github.com/Yash8439" target="_blank" rel="noopener noreferrer"
            className="w-9 h-9 glass rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors">
            <Code2 size={16} className="text-gray-400" />
          </a>
          <a href="https://www.linkedin.com/in/yash-rastogi-80a84b28b/" target="_blank" rel="noopener noreferrer"
            className="w-9 h-9 glass rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors text-gray-400 text-sm font-bold">
            in
          </a>
          <a href="mailto:rastogiyash303@gmail.com"
            className="w-9 h-9 glass rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors">
            <Mail size={16} className="text-gray-400" />
          </a>
        </div>
      </div>
    </div>

    <div className="border-t border-white/5 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
      <p className="text-gray-500 text-sm">© 2026 CareerLaunch AI. Built for engineering students preparing for placements.</p>
      <p className="text-gray-600 text-xs">Made with 💜 by Yash Rastogi</p>
    </div>
  </div>
</footer>

<BackToTop />


    </div>
  )
}