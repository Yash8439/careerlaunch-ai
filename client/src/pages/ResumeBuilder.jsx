import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors, DragOverlay
} from '@dnd-kit/core'
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates,
  verticalListSortingStrategy, useSortable
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import jsPDF from 'jspdf'
import toast from 'react-hot-toast'
import AnimatedBackground from '../components/AnimatedBackground'
import {
  ArrowLeft, GripVertical, Plus, Trash2, Download,
  Eye, Edit3, ChevronDown, ChevronUp, User, Briefcase,
  Code2, BookOpen, Award, Mail, Phone, Globe, MapPin
} from 'lucide-react'

// ============ DEFAULT DATA ============
const defaultSections = [
  {
    id: 'header', type: 'header', title: 'Personal Info', locked: true,
    data: { name: '', email: '', phone: '', location: '', linkedin: '', github: '', summary: '' }
  },
  {
    id: 'skills', type: 'skills', title: 'Skills',
    data: { categories: [{ id: '1', name: 'Frontend', skills: 'React, Tailwind CSS, HTML5' }, { id: '2', name: 'Backend', skills: 'Node.js, Express, MongoDB' }] }
  },
  {
    id: 'experience', type: 'experience', title: 'Experience',
    data: { items: [] }
  },
  {
    id: 'projects', type: 'projects', title: 'Projects',
    data: {
      items: [{
        id: '1', name: 'CareerLaunch AI', tech: 'React, Node.js, MongoDB, Groq AI',
        description: 'AI-powered placement preparation platform with 9+ features',
        link: '', github: ''
      }]
    }
  },
  {
    id: 'education', type: 'education', title: 'Education',
    data: {
      items: [{
        id: '1', degree: 'B.Tech Computer Science', school: '', year: '2023 - 2027', gpa: ''
      }]
    }
  },
  {
    id: 'achievements', type: 'achievements', title: 'Achievements',
    data: { items: [] }
  }
]

const templates = [
  { id: 'modern', name: 'Modern', accent: '#7F77DD', headerBg: '#7F77DD', headerText: '#ffffff' },
  { id: 'classic', name: 'Classic', accent: '#1a1a2e', headerBg: '#1a1a2e', headerText: '#ffffff' },
  { id: 'minimal', name: 'Minimal', accent: '#2d6a4f', headerBg: '#f8f9fa', headerText: '#1a1a1a' },
  { id: 'bold', name: 'Bold', accent: '#e63946', headerBg: '#e63946', headerText: '#ffffff' },
]

// ============ SORTABLE SECTION WRAPPER ============
const SortableSection = ({ section, children, isLocked }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: section.id, disabled: isLocked
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} className={`relative ${isDragging ? 'z-50' : ''}`}>
      {!isLocked && (
        <div {...attributes} {...listeners}
          className="absolute -left-6 top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing p-1 text-gray-600 hover:text-gray-400">
          <GripVertical size={16} />
        </div>
      )}
      {children}
    </div>
  )
}

// ============ SECTION EDITORS ============
const HeaderEditor = ({ data, onChange }) => (
  <div className="grid grid-cols-2 gap-3">
    {[
      { key: 'name', placeholder: 'Full Name', full: true },
      { key: 'email', placeholder: 'Email' },
      { key: 'phone', placeholder: 'Phone' },
      { key: 'location', placeholder: 'Location' },
      { key: 'linkedin', placeholder: 'LinkedIn URL' },
      { key: 'github', placeholder: 'GitHub URL' },
    ].map(f => (
      <input key={f.key} value={data[f.key]} onChange={e => onChange({ ...data, [f.key]: e.target.value })}
        placeholder={f.placeholder}
        className={`bg-dark-600 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-primary-400 text-sm ${f.full ? 'col-span-2' : ''}`} />
    ))}
    <textarea value={data.summary} onChange={e => onChange({ ...data, summary: e.target.value })}
      placeholder="Professional summary (2-3 lines)..." rows={2}
      className="col-span-2 bg-dark-600 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-primary-400 text-sm resize-none" />
  </div>
)

const SkillsEditor = ({ data, onChange }) => {
  const addCategory = () => {
    onChange({ categories: [...data.categories, { id: Date.now().toString(), name: 'New Category', skills: '' }] })
  }
  const removeCategory = (id) => onChange({ categories: data.categories.filter(c => c.id !== id) })
  const updateCategory = (id, field, value) => {
    onChange({ categories: data.categories.map(c => c.id === id ? { ...c, [field]: value } : c) })
  }

  return (
    <div className="space-y-2">
      {data.categories.map(cat => (
        <div key={cat.id} className="flex gap-2 items-start">
          <input value={cat.name} onChange={e => updateCategory(cat.id, 'name', e.target.value)}
            placeholder="Category" className="w-28 bg-dark-600 border border-white/10 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none focus:border-primary-400" />
          <input value={cat.skills} onChange={e => updateCategory(cat.id, 'skills', e.target.value)}
            placeholder="skill1, skill2, skill3" className="flex-1 bg-dark-600 border border-white/10 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none focus:border-primary-400" />
          <button onClick={() => removeCategory(cat.id)} className="p-1.5 hover:bg-red-900/20 rounded-lg">
            <Trash2 size={13} className="text-red-400" />
          </button>
        </div>
      ))}
      <button onClick={addCategory} className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1 mt-1">
        <Plus size={13} /> Add Category
      </button>
    </div>
  )
}

const ExperienceEditor = ({ data, onChange }) => {
  const add = () => onChange({ items: [...data.items, { id: Date.now().toString(), role: '', company: '', duration: '', description: '' }] })
  const remove = (id) => onChange({ items: data.items.filter(i => i.id !== id) })
  const update = (id, field, value) => onChange({ items: data.items.map(i => i.id === id ? { ...i, [field]: value } : i) })

  return (
    <div className="space-y-3">
      {data.items.map(item => (
        <div key={item.id} className="bg-dark-600/50 rounded-xl p-3 space-y-2 border border-white/5">
          <div className="grid grid-cols-2 gap-2">
            <input value={item.role} onChange={e => update(item.id, 'role', e.target.value)} placeholder="Job Title"
              className="bg-dark-600 border border-white/10 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none focus:border-primary-400" />
            <input value={item.company} onChange={e => update(item.id, 'company', e.target.value)} placeholder="Company"
              className="bg-dark-600 border border-white/10 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none focus:border-primary-400" />
            <input value={item.duration} onChange={e => update(item.id, 'duration', e.target.value)} placeholder="Jan 2024 - Present"
              className="col-span-2 bg-dark-600 border border-white/10 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none focus:border-primary-400" />
          </div>
          <textarea value={item.description} onChange={e => update(item.id, 'description', e.target.value)}
            placeholder="• Achieved X by doing Y, resulting in Z..." rows={2}
            className="w-full bg-dark-600 border border-white/10 rounded-lg px-2 py-1.5 text-white text-xs resize-none focus:outline-none focus:border-primary-400" />
          <button onClick={() => remove(item.id)} className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1">
            <Trash2 size={11} /> Remove
          </button>
        </div>
      ))}
      <button onClick={add} className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1">
        <Plus size={13} /> Add Experience
      </button>
    </div>
  )
}

const ProjectsEditor = ({ data, onChange }) => {
  const add = () => onChange({ items: [...data.items, { id: Date.now().toString(), name: '', tech: '', description: '', link: '', github: '' }] })
  const remove = (id) => onChange({ items: data.items.filter(i => i.id !== id) })
  const update = (id, field, value) => onChange({ items: data.items.map(i => i.id === id ? { ...i, [field]: value } : i) })

  return (
    <div className="space-y-3">
      {data.items.map(item => (
        <div key={item.id} className="bg-dark-600/50 rounded-xl p-3 space-y-2 border border-white/5">
          <div className="grid grid-cols-2 gap-2">
            <input value={item.name} onChange={e => update(item.id, 'name', e.target.value)} placeholder="Project Name"
              className="bg-dark-600 border border-white/10 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none focus:border-primary-400" />
            <input value={item.tech} onChange={e => update(item.id, 'tech', e.target.value)} placeholder="React, Node.js, MongoDB"
              className="bg-dark-600 border border-white/10 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none focus:border-primary-400" />
          </div>
          <textarea value={item.description} onChange={e => update(item.id, 'description', e.target.value)}
            placeholder="Brief description of what you built and impact..." rows={2}
            className="w-full bg-dark-600 border border-white/10 rounded-lg px-2 py-1.5 text-white text-xs resize-none focus:outline-none focus:border-primary-400" />
          <div className="grid grid-cols-2 gap-2">
            <input value={item.link} onChange={e => update(item.id, 'link', e.target.value)} placeholder="Live Link"
              className="bg-dark-600 border border-white/10 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none focus:border-primary-400" />
            <input value={item.github} onChange={e => update(item.id, 'github', e.target.value)} placeholder="GitHub Link"
              className="bg-dark-600 border border-white/10 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none focus:border-primary-400" />
          </div>
          <button onClick={() => remove(item.id)} className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1">
            <Trash2 size={11} /> Remove
          </button>
        </div>
      ))}
      <button onClick={add} className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1">
        <Plus size={13} /> Add Project
      </button>
    </div>
  )
}

const EducationEditor = ({ data, onChange }) => {
  const add = () => onChange({ items: [...data.items, { id: Date.now().toString(), degree: '', school: '', year: '', gpa: '' }] })
  const remove = (id) => onChange({ items: data.items.filter(i => i.id !== id) })
  const update = (id, field, value) => onChange({ items: data.items.map(i => i.id === id ? { ...i, [field]: value } : i) })

  return (
    <div className="space-y-3">
      {data.items.map(item => (
        <div key={item.id} className="bg-dark-600/50 rounded-xl p-3 space-y-2 border border-white/5">
          <div className="grid grid-cols-2 gap-2">
            <input value={item.degree} onChange={e => update(item.id, 'degree', e.target.value)} placeholder="Degree & Major"
              className="col-span-2 bg-dark-600 border border-white/10 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none focus:border-primary-400" />
            <input value={item.school} onChange={e => update(item.id, 'school', e.target.value)} placeholder="University/College"
              className="bg-dark-600 border border-white/10 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none focus:border-primary-400" />
            <input value={item.year} onChange={e => update(item.id, 'year', e.target.value)} placeholder="2021 - 2025"
              className="bg-dark-600 border border-white/10 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none focus:border-primary-400" />
            <input value={item.gpa} onChange={e => update(item.id, 'gpa', e.target.value)} placeholder="GPA/CGPA (optional)"
              className="bg-dark-600 border border-white/10 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none focus:border-primary-400" />
          </div>
          <button onClick={() => remove(item.id)} className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1">
            <Trash2 size={11} /> Remove
          </button>
        </div>
      ))}
      <button onClick={add} className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1">
        <Plus size={13} /> Add Education
      </button>
    </div>
  )
}

const AchievementsEditor = ({ data, onChange }) => {
  const add = () => onChange({ items: [...data.items, { id: Date.now().toString(), text: '' }] })
  const remove = (id) => onChange({ items: data.items.filter(i => i.id !== id) })
  const update = (id, value) => onChange({ items: data.items.map(i => i.id === id ? { ...i, text: value } : i) })

  return (
    <div className="space-y-2">
      {data.items.map(item => (
        <div key={item.id} className="flex gap-2 items-center">
          <input value={item.text} onChange={e => update(item.id, e.target.value)} placeholder="Describe your achievement..."
            className="flex-1 bg-dark-600 border border-white/10 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none focus:border-primary-400" />
          <button onClick={() => remove(item.id)} className="p-1.5 hover:bg-red-900/20 rounded-lg">
            <Trash2 size={13} className="text-red-400" />
          </button>
        </div>
      ))}
      <button onClick={add} className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1">
        <Plus size={13} /> Add Achievement
      </button>
    </div>
  )
}

// ============ RESUME PREVIEW ============
const ResumePreview = ({ sections, template }) => {
  const header = sections.find(s => s.type === 'header')?.data
  const t = template

  const sectionStyle = { marginBottom: '12px' }
  const headingStyle = {
    fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase',
    letterSpacing: '1px', color: t.accent, borderBottom: `2px solid ${t.accent}`,
    paddingBottom: '3px', marginBottom: '6px'
  }

  const renderSection = (section) => {
    switch (section.type) {
      case 'skills':
        return section.data.categories.filter(c => c.skills).map(cat => (
          <div key={cat.id} style={{ fontSize: '10px', marginBottom: '3px' }}>
            <span style={{ fontWeight: 'bold', color: '#333' }}>{cat.name}: </span>
            <span style={{ color: '#555' }}>{cat.skills}</span>
          </div>
        ))

      case 'experience':
        return section.data.items.map(item => (
          <div key={item.id} style={{ marginBottom: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#222' }}>{item.role}</span>
              <span style={{ fontSize: '9px', color: '#888' }}>{item.duration}</span>
            </div>
            <div style={{ fontSize: '10px', color: t.accent, marginBottom: '3px' }}>{item.company}</div>
            <div style={{ fontSize: '9px', color: '#555', whiteSpace: 'pre-line', lineHeight: '1.4' }}>{item.description}</div>
          </div>
        ))

      case 'projects':
        return section.data.items.map(item => (
          <div key={item.id} style={{ marginBottom: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#222' }}>{item.name}</span>
              <span style={{ fontSize: '9px', color: '#888' }}>{item.tech}</span>
            </div>
            <div style={{ fontSize: '9px', color: '#555', lineHeight: '1.4', marginTop: '2px' }}>{item.description}</div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '2px' }}>
              {item.link && <a href={item.link} style={{ fontSize: '9px', color: t.accent }}>Live ↗</a>}
              {item.github && <a href={item.github} style={{ fontSize: '9px', color: t.accent }}>GitHub ↗</a>}
            </div>
          </div>
        ))

      case 'education':
        return section.data.items.map(item => (
          <div key={item.id} style={{ marginBottom: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#222' }}>{item.degree}</span>
              <span style={{ fontSize: '9px', color: '#888' }}>{item.year}</span>
            </div>
            <div style={{ fontSize: '10px', color: '#555' }}>{item.school}{item.gpa && ` • GPA: ${item.gpa}`}</div>
          </div>
        ))

      case 'achievements':
        return section.data.items.map(item => (
          <div key={item.id} style={{ fontSize: '10px', color: '#555', marginBottom: '3px' }}>
            • {item.text}
          </div>
        ))

      default:
        return null
    }
  }

  return (
    <div style={{
      background: 'white', width: '100%', minHeight: '842px',
      fontFamily: 'Arial, sans-serif', position: 'relative', overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{ background: t.headerBg, padding: '20px 24px', marginBottom: '16px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 'bold', color: t.headerText, margin: '0 0 4px' }}>
          {header?.name || 'Your Name'}
        </h1>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
          {header?.email && <span style={{ fontSize: '10px', color: t.id === 'minimal' ? '#555' : 'rgba(255,255,255,0.85)' }}>✉ {header.email}</span>}
          {header?.phone && <span style={{ fontSize: '10px', color: t.id === 'minimal' ? '#555' : 'rgba(255,255,255,0.85)' }}>📞 {header.phone}</span>}
          {header?.location && <span style={{ fontSize: '10px', color: t.id === 'minimal' ? '#555' : 'rgba(255,255,255,0.85)' }}>📍 {header.location}</span>}
          {header?.linkedin && <span style={{ fontSize: '10px', color: t.id === 'minimal' ? '#555' : 'rgba(255,255,255,0.85)' }}>in {header.linkedin}</span>}
          {header?.github && <span style={{ fontSize: '10px', color: t.id === 'minimal' ? '#555' : 'rgba(255,255,255,0.85)' }}>⌨ {header.github}</span>}
        </div>
        {header?.summary && (
          <p style={{ fontSize: '10px', color: t.id === 'minimal' ? '#555' : 'rgba(255,255,255,0.8)', marginTop: '8px', lineHeight: '1.4' }}>
            {header.summary}
          </p>
        )}
      </div>

      {/* Sections */}
      <div style={{ padding: '0 24px 24px' }}>
        {sections.filter(s => s.type !== 'header').map(section => (
          <div key={section.id} style={sectionStyle}>
            <div style={headingStyle}>{section.title}</div>
            {renderSection(section)}
          </div>
        ))}
      </div>
    </div>
  )
}

// ============ MAIN COMPONENT ============
export default function ResumeBuilder() {
  const navigate = useNavigate()
  const [sections, setSections] = useState(() => {
    const saved = localStorage.getItem('resumeBuilder_sections')
    return saved ? JSON.parse(saved) : defaultSections
  })
  const [selectedTemplate, setSelectedTemplate] = useState(templates[0])
  const [expandedSection, setExpandedSection] = useState('header')
  const [activeId, setActiveId] = useState(null)
  const [showPreview, setShowPreview] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const saveToLocalStorage = (newSections) => {
    localStorage.setItem('resumeBuilder_sections', JSON.stringify(newSections))
  }

  const handleDragEnd = (event) => {
    const { active, over } = event
    setActiveId(null)
    if (!over || active.id === over.id) return

    const oldIndex = sections.findIndex(s => s.id === active.id)
    const newIndex = sections.findIndex(s => s.id === over.id)
    const newSections = arrayMove(sections, oldIndex, newIndex)
    setSections(newSections)
    saveToLocalStorage(newSections)
  }

  const updateSectionData = (id, newData) => {
    const newSections = sections.map(s => s.id === id ? { ...s, data: newData } : s)
    setSections(newSections)
    saveToLocalStorage(newSections)
  }

  const downloadPDF = () => {
    toast.loading('Generating PDF...', { id: 'pdf' })
    const doc = new jsPDF({ format: 'a4' })
    const t = selectedTemplate
    const header = sections.find(s => s.type === 'header')?.data

    // Header background
    doc.setFillColor(...hexToRgb(t.headerBg))
    doc.rect(0, 0, 210, 45, 'F')

    // Name
    doc.setTextColor(...hexToRgb(t.headerText))
    doc.setFontSize(20)
    doc.setFont(undefined, 'bold')
    doc.text(header?.name || 'Your Name', 14, 18)

    // Contact info
    doc.setFontSize(8)
    doc.setFont(undefined, 'normal')
    let cx = 14
    if (header?.email) { doc.text(`✉ ${header.email}`, cx, 26); cx += 65 }
    if (header?.phone) { doc.text(`${header.phone}`, cx, 26); cx += 45 }
    if (header?.location) { doc.text(`📍 ${header.location}`, cx, 26) }
    if (header?.linkedin) { doc.text(`LinkedIn: ${header.linkedin}`, 14, 32) }
    if (header?.github) { doc.text(`GitHub: ${header.github}`, 14, 37) }
    if (header?.summary) {
      const summaryLines = doc.splitTextToSize(header.summary, 182)
      doc.text(summaryLines, 14, 43)
    }

    let y = 52
    doc.setTextColor(20, 20, 20)

    sections.filter(s => s.type !== 'header').forEach(section => {
      if (y > 270) { doc.addPage(); y = 15 }

      // Section heading
      doc.setFontSize(9)
      doc.setFont(undefined, 'bold')
      doc.setTextColor(...hexToRgb(t.accent))
      doc.text(section.title.toUpperCase(), 14, y)
      doc.setDrawColor(...hexToRgb(t.accent))
      doc.setLineWidth(0.5)
      doc.line(14, y + 1, 196, y + 1)
      y += 6
      doc.setTextColor(20, 20, 20)
      doc.setFont(undefined, 'normal')
      doc.setFontSize(9)

      switch (section.type) {
        case 'skills':
          section.data.categories.filter(c => c.skills).forEach(cat => {
            doc.setFont(undefined, 'bold')
            doc.text(`${cat.name}: `, 14, y)
            const labelWidth = doc.getTextWidth(`${cat.name}: `)
            doc.setFont(undefined, 'normal')
            const skillsLines = doc.splitTextToSize(cat.skills, 182 - labelWidth)
            doc.text(skillsLines, 14 + labelWidth, y)
            y += skillsLines.length * 5
          })
          break

        case 'experience':
          section.data.items.forEach(item => {
            if (y > 270) { doc.addPage(); y = 15 }
            doc.setFont(undefined, 'bold')
            doc.text(item.role || '', 14, y)
            doc.setFont(undefined, 'normal')
            doc.text(item.duration || '', 196, y, { align: 'right' })
            y += 4
            doc.setTextColor(...hexToRgb(t.accent))
            doc.text(item.company || '', 14, y)
            doc.setTextColor(20, 20, 20)
            y += 4
            if (item.description) {
              const lines = doc.splitTextToSize(item.description, 182)
              doc.text(lines, 14, y)
              y += lines.length * 4
            }
            y += 3
          })
          break

        case 'projects':
          section.data.items.forEach(item => {
            if (y > 270) { doc.addPage(); y = 15 }
            doc.setFont(undefined, 'bold')
            doc.text(item.name || '', 14, y)
            doc.setFont(undefined, 'normal')
            doc.setTextColor(100, 100, 100)
            doc.text(item.tech || '', 196, y, { align: 'right' })
            doc.setTextColor(20, 20, 20)
            y += 4
            if (item.description) {
              const lines = doc.splitTextToSize(item.description, 182)
              doc.text(lines, 14, y)
              y += lines.length * 4
            }
            y += 3
          })
          break

        case 'education':
          section.data.items.forEach(item => {
            if (y > 270) { doc.addPage(); y = 15 }
            doc.setFont(undefined, 'bold')
            doc.text(item.degree || '', 14, y)
            doc.setFont(undefined, 'normal')
            doc.text(item.year || '', 196, y, { align: 'right' })
            y += 4
            doc.text(`${item.school || ''}${item.gpa ? ` • GPA: ${item.gpa}` : ''}`, 14, y)
            y += 6
          })
          break

        case 'achievements':
          section.data.items.forEach(item => {
            if (y > 270) { doc.addPage(); y = 15 }
            const lines = doc.splitTextToSize(`• ${item.text}`, 182)
            doc.text(lines, 14, y)
            y += lines.length * 4 + 1
          })
          break
      }
      y += 4
    })

    doc.save(`${header?.name || 'Resume'}_CareerLaunchAI.pdf`)
    toast.success('PDF downloaded!', { id: 'pdf' })
  }

  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)] : [0, 0, 0]
  }

  const sectionIcons = { header: User, skills: Code2, experience: Briefcase, projects: Award, education: BookOpen, achievements: Award }

  return (
    <div className="min-h-screen bg-dark-900 text-white relative">
      <AnimatedBackground />

      <div className="relative z-10 flex flex-col h-screen">
        {/* Header */}
        <div className="bg-dark-800/90 backdrop-blur-xl border-b border-white/5 px-6 py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
              <ArrowLeft size={20} className="text-gray-400" />
            </button>
            <div>
              <h1 className="text-lg font-bold">Resume Builder</h1>
              <p className="text-xs text-gray-400">Drag sections to reorder • Auto-saved locally</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Template Selector */}
            <div className="flex items-center gap-1.5">
              {templates.map(t => (
                <button key={t.id} onClick={() => setSelectedTemplate(t)}
                  title={t.name}
                  className={`w-6 h-6 rounded-full border-2 transition-all ${selectedTemplate.id === t.id ? 'border-white scale-125' : 'border-transparent'}`}
                  style={{ background: t.accent }} />
              ))}
            </div>

            <button onClick={() => setShowPreview(!showPreview)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all ${showPreview ? 'bg-primary-600 text-white' : 'glass border border-white/10 text-gray-400'}`}>
              <Eye size={16} /> {showPreview ? 'Edit' : 'Preview'}
            </button>

            <button onClick={downloadPDF}
              className="flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all">
              <Download size={16} /> Download PDF
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Panel — Editor */}
          <div className={`${showPreview ? 'hidden lg:flex' : 'flex'} flex-col w-full lg:w-96 border-r border-white/5 overflow-y-auto bg-dark-800/50`}>
            <div className="p-4">
              <DndContext sensors={sensors} collisionDetection={closestCenter}
                onDragStart={e => setActiveId(e.active.id)}
                onDragEnd={handleDragEnd}>
                <SortableContext items={sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-2 pl-6">
                    {sections.map(section => {
                      const Icon = sectionIcons[section.type] || Award
                      const isExpanded = expandedSection === section.id

                      return (
                        <SortableSection key={section.id} section={section} isLocked={section.locked}>
                          <div className={`glass rounded-xl border transition-all ${isExpanded ? 'border-primary-600/30' : 'border-white/5'}`}>
                            <button onClick={() => setExpandedSection(isExpanded ? null : section.id)}
                              className="w-full flex items-center justify-between p-3 text-left">
                              <div className="flex items-center gap-2">
                                <Icon size={15} className="text-primary-400" />
                                <span className="text-sm font-medium">{section.title}</span>
                              </div>
                              {isExpanded ? <ChevronUp size={15} className="text-gray-500" /> : <ChevronDown size={15} className="text-gray-500" />}
                            </button>

                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                  <div className="px-3 pb-3">
                                    {section.type === 'header' && <HeaderEditor data={section.data} onChange={d => updateSectionData(section.id, d)} />}
                                    {section.type === 'skills' && <SkillsEditor data={section.data} onChange={d => updateSectionData(section.id, d)} />}
                                    {section.type === 'experience' && <ExperienceEditor data={section.data} onChange={d => updateSectionData(section.id, d)} />}
                                    {section.type === 'projects' && <ProjectsEditor data={section.data} onChange={d => updateSectionData(section.id, d)} />}
                                    {section.type === 'education' && <EducationEditor data={section.data} onChange={d => updateSectionData(section.id, d)} />}
                                    {section.type === 'achievements' && <AchievementsEditor data={section.data} onChange={d => updateSectionData(section.id, d)} />}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </SortableSection>
                      )
                    })}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          </div>

          {/* Right Panel — Live Preview */}
          <div className={`${showPreview ? 'flex' : 'hidden lg:flex'} flex-1 overflow-y-auto bg-gray-100 p-6`}>
            <div className="w-full max-w-[794px] mx-auto shadow-2xl">
              <ResumePreview sections={sections} template={selectedTemplate} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}