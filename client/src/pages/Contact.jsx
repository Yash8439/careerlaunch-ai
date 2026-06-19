import StaticPage from './StaticPage'
import { Mail, Code2 } from 'lucide-react'

export default function Contact() {
  return (
    <StaticPage title="Contact">
      <p>
        Have feedback, found a bug, or just want to connect? Reach out through any of the channels below.
      </p>

      <div className="grid sm:grid-cols-3 gap-4 pt-6">
        <a href="mailto:rastogiyash303@gmail.com"
          className="glass rounded-xl p-5 text-center hover:border-primary-600/50 border border-transparent transition-all">
          <Mail size={24} className="text-primary-400 mx-auto mb-3" />
          <p className="text-sm font-medium text-white">Email</p>
          <p className="text-xs text-gray-500 mt-1">rastogiyash303@gmail.com</p>
        </a>

        <a href="https://www.linkedin.com/in/yash-rastogi-80a84b28b/" target="_blank" rel="noopener noreferrer"
  className="glass rounded-xl p-5 text-center hover:border-primary-600/50 border border-transparent transition-all">
  <span className="text-2xl font-bold text-primary-400 block mb-3">in</span>
  <p className="text-sm font-medium text-white">LinkedIn</p>
  <p className="text-xs text-gray-500 mt-1">Connect with me</p>
</a>

<a href="https://github.com/Yash8439" target="_blank" rel="noopener noreferrer"
  className="glass rounded-xl p-5 text-center hover:border-primary-600/50 border border-transparent transition-all">
  <Code2 size={24} className="text-primary-400 mx-auto mb-3" />
  <p className="text-sm font-medium text-white">GitHub</p>
  <p className="text-xs text-gray-500 mt-1">View source code</p>
</a>
      </div>
    </StaticPage>
  )
}