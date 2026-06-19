import StaticPage from './StaticPage'

export default function PrivacyPolicy() {
  return (
    <StaticPage title="Privacy Policy" lastUpdated="June 2026">
      <p>
        CareerLaunch AI ("we", "our", "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our platform.
      </p>

      <h3 className="text-xl font-semibold text-white pt-4">Information We Collect</h3>
      <ul className="list-disc pl-6 space-y-2">
        <li>Account information: name, email address, and password (encrypted)</li>
        <li>Resume documents you upload for AI analysis</li>
        <li>Study notes and documents uploaded for the AI chatbot</li>
        <li>Mock interview responses and performance data</li>
        <li>Usage data such as feature activity, study streaks, and skill progress</li>
      </ul>

      <h3 className="text-xl font-semibold text-white pt-4">How We Use Your Information</h3>
      <p>
        Your data is used solely to provide and improve platform features — including resume scoring, AI-powered feedback, personalized roadmaps, and progress tracking. We do not sell or share your personal data with third parties for advertising purposes.
      </p>

      <h3 className="text-xl font-semibold text-white pt-4">Data Storage</h3>
      <p>
        All data is securely stored using industry-standard practices. Passwords are encrypted using bcrypt hashing. Resume and document content is processed temporarily for AI analysis and not permanently stored beyond what's needed for your dashboard history.
      </p>

      <h3 className="text-xl font-semibold text-white pt-4">Third-Party AI Services</h3>
      <p>
        We use Groq's AI API to process resume analysis, interview evaluation, and chatbot responses. Your uploaded content may be sent to this service for processing in real time, subject to their own data handling policies.
      </p>

      <h3 className="text-xl font-semibold text-white pt-4">Your Rights</h3>
      <p>
        You may request deletion of your account and associated data at any time by contacting us through the details on our Contact page.
      </p>
    </StaticPage>
  )
}