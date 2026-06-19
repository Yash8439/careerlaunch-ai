export const BADGES = [
  { id: 'first_resume', label: 'First Steps', desc: 'Analyzed your first resume', icon: '📄', condition: (stats) => stats.resumeAnalysisCount >= 1 },
  { id: 'resume_master', label: 'Resume Master', desc: 'Scored 90+ on resume ATS score', icon: '🏆', condition: (stats) => stats.resumeScore >= 90 },
  { id: 'first_interview', label: 'Breaking the Ice', desc: 'Completed your first mock interview', icon: '🎤', condition: (stats) => stats.interviewsCompleted >= 1 },
  { id: 'interview_pro', label: 'Interview Pro', desc: 'Completed 5 mock interviews', icon: '🌟', condition: (stats) => stats.interviewsCompleted >= 5 },
  { id: 'streak_3', label: 'Getting Consistent', desc: 'Maintained a 3-day study streak', icon: '🔥', condition: (stats) => stats.studyStreak >= 3 },
  { id: 'streak_7', label: 'Week Warrior', desc: 'Maintained a 7-day study streak', icon: '⚡', condition: (stats) => stats.studyStreak >= 7 },
  { id: 'roadmap_created', label: 'Planner', desc: 'Generated your first roadmap', icon: '🗺️', condition: (stats) => stats.roadmapCount >= 1 },
  { id: 'question_explorer', label: 'Curious Mind', desc: 'Generated practice questions 3 times', icon: '❓', condition: (stats) => stats.questionsCount >= 3 },
  { id: 'chatbot_user', label: 'AI Companion', desc: 'Had 10 conversations with AI chatbot', icon: '💬', condition: (stats) => stats.chatCount >= 10 },
  { id: 'all_rounder', label: 'All-Rounder', desc: 'Used every major feature at least once', icon: '👑', condition: (stats) =>
    stats.resumeAnalysisCount >= 1 && stats.interviewsCompleted >= 1 && stats.roadmapCount >= 1 && stats.questionsCount >= 1 },
]