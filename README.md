# CareerLaunch AI 🚀

**AI-powered placement preparation platform** built for engineering students preparing for tech placements. Combines resume analysis, mock interviews, study assistance, and personalized roadmaps into a single intelligent platform.

🔗 **Live Demo:** https://careerlaunch-ai-dusky.vercel.app/
📂 **Repository:** [github.com/Yash8439/careerlaunch-ai](https://github.com/Yash8439/careerlaunch-ai)

---

## ✨ Features

- **🤖 AI Resume Analyzer** — Get ATS scores, skill gap analysis, and AI-powered improvement suggestions. Export results as a downloadable PDF report.
- **🎤 AI Mock Interviews** — Voice-based mock interviews with a realistic AI interviewer ("Sarah"), real-time evaluation, and per-topic skill tracking.
- **💬 AI Notes Chatbot** — RAG-based chatbot that answers questions from your own uploaded study notes, with voice input support.
- **🗺️ Roadmap Generator** — Personalized 8-week placement preparation roadmaps based on target role, current skills, and available study time.
- **📋 Question Bank Generator** — AI-generated practice questions with detailed answers, downloadable for offline study.
- **📚 Resource Hub** — Curated placement resources (DSA, OS, DBMS, OOPS, System Design, Interview Experiences) with search, filters, and bookmarking.
- **🧠 AI Career Coach** — Daily personalized advice based on your actual activity, resume score, and skill progress.
- **📊 Progress Dashboard** — Resume score history graph, GitHub-style activity heatmap, skill progress tracker, and achievement badges.
- **🛡️ Admin Panel** — Platform-wide analytics, user management, activity monitoring, and resource management for administrators.
- **🔐 Authentication** — Email/password login, Google OAuth sign-in, and secure forgot-password flow with email reset links.

---

## 🛠️ Tech Stack

**Frontend**
- React + Vite
- Tailwind CSS
- Framer Motion (animations)
- Three.js (3D interactive elements)
- Recharts (data visualization)
- Axios

**Backend**
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- Groq AI SDK (Llama 3.3 70B) — powers all AI features
- Nodemailer (password reset emails)
- Multer (file uploads)

**AI/ML**
- Groq API for resume analysis, interview evaluation, roadmap generation, and chatbot responses
- Custom RAG (Retrieval-Augmented Generation) implementation for document-based Q&A
- pdfjs-dist & Mammoth for resume text extraction (PDF/DOCX)

---

## 📁 Project Structure

```
careerlaunch-ai/
├── client/                 # React frontend
│   ├── src/
│   │   ├── pages/          # Page components (Dashboard, Resume Analyzer, etc.)
│   │   ├── components/     # Reusable components (AnimatedBackground, TiltCard, etc.)
│   │   └── context/        # Auth context
│   └── public/
├── server/                 # Express backend
│   ├── routes/              # API routes
│   ├── models/               # MongoDB schemas
│   ├── middleware/         # Auth middleware
│   └── utils/                # Helper utilities (email, badges)
└── README.md
```

---

## ⚙️ Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas account (or local MongoDB)
- Groq API key ([console.groq.com](https://console.groq.com))
- Gmail account with App Password (for password reset emails)
- Google Cloud Console OAuth credentials (for Google Sign-In)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Yash8439/careerlaunch-ai.git
   cd careerlaunch-ai
   ```

2. **Set up the backend**
   ```bash
   cd server
   npm install
   ```

   Create a `.env` file in the `server` folder:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   GROQ_API_KEY=your_groq_api_key
   CLIENT_URL=http://localhost:5173
   EMAIL_USER=your_gmail_address
   EMAIL_PASS=your_gmail_app_password
   GOOGLE_CLIENT_ID=your_google_oauth_client_id
   ```

   Start the backend:
   ```bash
   npm run dev
   ```

3. **Set up the frontend**
   ```bash
   cd ../client
   npm install
   ```

   Create a `.env` file in the `client` folder:
   ```env
   VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id
   ```

   Start the frontend:
   ```bash
   npm run dev
   ```

4. Open `http://localhost:5173` in your browser.

---

## 🔑 Environment Variables Reference

| Variable | Location | Description |
|---|---|---|
| `MONGO_URI` | server | MongoDB connection string |
| `JWT_SECRET` | server | Secret key for JWT token signing |
| `GROQ_API_KEY` | server | API key for Groq AI (powers all AI features) |
| `EMAIL_USER` / `EMAIL_PASS` | server | Gmail credentials for sending password reset emails |
| `GOOGLE_CLIENT_ID` | server & client | OAuth client ID for Google Sign-In |
| `CLIENT_URL` | server | Frontend URL (used in email reset links) |

---

## 👤 Author

**Yash Rastogi**
- GitHub: [@Yash8439](https://github.com/Yash8439)
- LinkedIn: [Yash Rastogi](https://www.linkedin.com/in/yash-rastogi-80a84b28b/)

---

## 📄 License

This project is open source and available for educational purposes.
