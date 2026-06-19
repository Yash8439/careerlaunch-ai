export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <div className="bg-grid" />
      <div className="bg-blob" style={{ width: '500px', height: '500px', background: '#7F77DD', top: '-10%', left: '-5%', animationDelay: '0s' }} />
      <div className="bg-blob" style={{ width: '400px', height: '400px', background: '#1D9E75', top: '20%', right: '-10%', animationDelay: '5s' }} />
      <div className="bg-blob" style={{ width: '450px', height: '450px', background: '#D85A30', bottom: '10%', left: '10%', animationDelay: '10s' }} />
      <div className="bg-blob" style={{ width: '350px', height: '350px', background: '#3B8BD4', bottom: '-5%', right: '15%', animationDelay: '15s' }} />
    </div>
  )
}