import { useState, useRef } from 'react'

export default function TiltCard({ children, className }) {
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
    const rotateX = ((y - centerY) / centerY) * -5
    const rotateY = ((x - centerX) / centerX) * 5

    setStyle({
      transform: `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.015, 1.015, 1.015)`,
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