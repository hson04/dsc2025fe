// src/config/api.js
const API_CONFIG = {
  // 🔗 Main Backend Service Configuration
  // Chỉ sử dụng dsc2025API (port 3005) cho tất cả tính năng
  
  // Main Service (dsc2025API - All Features)
  BASE_URL: 'http://localhost:3005',
  
  // Chat & Interview Endpoints
  CHAT: {
    DOMAIN: '/chat/chatDomain',
    EXTRACT_CV: '/chat/extract-cv/',
    EXTRACT_JOB: '/chat/extract-job/',
    EVALUATION_DATA: '/chat/evaluation-data/',
    FINAL_REPORT: '/chat/final-report/',
    TRANSCRIBE: '/chat/transcribe',
    VOICE_CHAT: '/chat/voice-chat',
    INTERVIEW_SESSIONS: '/chat/interview-sessions',
    SESSION_CONTEXT: '/chat/session-context/'
  },

  // Resume Enhancement Endpoints (nếu có trong dsc2025API)
  RESUME: {
    EVALUATE_CV: '/resume/evaluate-cv/',
    ENHANCE_RESUME: '/resume/enhance/',
    CALCULATE_ALIGNMENT: '/resume/calculate-alignment/',
    GENERATE_REPORT: '/resume/generate-report/'
  },

  // Backward compatibility cho các component cũ
  ENDPOINTS: {
    // Chuyển hướng tất cả về chat endpoints
    EVALUATE_CV: '/chat/extract-cv/',
    ADD_DATA_AND_CREATE_RESUME: '/chat/extract-cv/', // Placeholder
    CALCULATE_ALIGNMENT_SCORE: '/chat/extract-job/', // Placeholder  
    CALCULATE_CONTENT_PRESERVATION: '/chat/extract-cv/', // Placeholder
    ANALYZE_RESUME_IMPROVEMENTS: '/chat/extract-cv/', // Placeholder
    GENERATE_REPORT_PDF: '/chat/final-report/',
    DOWNLOAD_PDF: '/chat/final-report/'
  }
}

export default API_CONFIG