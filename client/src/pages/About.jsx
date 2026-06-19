import StaticPage from './StaticPage'

export default function About() {
  return (
    <StaticPage title="About CareerLaunch AI">
      <p>
        CareerLaunch AI is an AI-powered placement preparation platform built to help engineering students and internship seekers navigate the often overwhelming journey of placement season — combining resume analysis, mock interviews, study assistance, and personalized roadmaps into a single, intelligent platform.
      </p>

      <h3 className="text-xl font-semibold text-white pt-4">Our Mission</h3>
      <p>
        Placement preparation is fragmented — students juggle between resume templates, random YouTube playlists, scattered interview tips, and generic advice that doesn't account for their individual progress. CareerLaunch AI was built to solve this by combining everything into one AI-driven experience that adapts to each student's actual skill level and activity.
      </p>

      <h3 className="text-xl font-semibold text-white pt-4">What Makes It Different</h3>
      <ul className="list-disc pl-6 space-y-2">
        <li>Real AI-powered ATS resume scoring instead of generic checklists</li>
        <li>Voice-based mock interviews with a realistic AI interviewer experience</li>
        <li>RAG-based chatbot that answers questions directly from your own study notes</li>
        <li>Daily personalized coaching based on your actual performance data</li>
        <li>Progress tracking across DSA, OS, DBMS, OOPS, and Web Development</li>
      </ul>

      <h3 className="text-xl font-semibold text-white pt-4">Built By</h3>
      <p>
        This platform was designed and developed by Yash Rastogi as a full-stack AI application, integrating React, Node.js, MongoDB, and Groq's AI infrastructure to deliver a production-style placement preparation experience.
      </p>
    </StaticPage>
  )
}