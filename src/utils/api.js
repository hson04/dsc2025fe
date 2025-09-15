// src/utils/api.js
import API_CONFIG from '../config/api'

/**
 * API utility functions - Chỉ sử dụng dsc2025API (port 3005)
 * Bỏ qua frontend/fast_apis
 */

// Main API calls - All từ dsc2025API
export const mainAPI = {
  // Chat & Interview functions
  chatDomain: (data) =>
    fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.CHAT.DOMAIN}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }),

  extractCV: (formData) =>
    fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.CHAT.EXTRACT_CV}`, {
      method: 'POST',
      body: formData // FormData with file and session_id
    }),

  extractJob: (formData) =>
    fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.CHAT.EXTRACT_JOB}`, {
      method: 'POST',
      body: formData // FormData with job_description and session_id
    }),

  getEvaluationData: (sessionId) =>
    fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.CHAT.EVALUATION_DATA}${sessionId}`),

  getFinalReport: (sessionId) =>
    fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.CHAT.FINAL_REPORT}${sessionId}`),

  transcribe: (formData) =>
    fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.CHAT.TRANSCRIBE}`, {
      method: 'POST',
      body: formData // FormData with file and language
    }),

  getInterviewSessions: () =>
    fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.CHAT.INTERVIEW_SESSIONS}`),

  getSessionContext: (sessionId) =>
    fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.CHAT.SESSION_CONTEXT}${sessionId}`)
}

// Backward compatibility - Resume API calls (chuyển hướng về chat endpoints)
export const resumeAPI = {
  evaluateCV: (data) => 
    fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.EVALUATE_CV}`, {
      method: 'POST',
      body: data // FormData
    }),

  addDataAndCreateResume: (data) =>
    fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ADD_DATA_AND_CREATE_RESUME}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }),

  calculateAlignmentScore: (data) =>
    fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CALCULATE_ALIGNMENT_SCORE}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }),

  generateReportPDF: (data) =>
    fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.GENERATE_REPORT_PDF}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }),

  downloadPDF: (downloadUrl) =>
    fetch(`${API_CONFIG.BASE_URL}${downloadUrl}`)
}

// Backward compatibility - Chatbot API (giờ cùng với mainAPI)
export const chatbotAPI = mainAPI

// Helper function to get backend URL (chỉ có 1 backend)
export const getBackendUrl = () => {
  return API_CONFIG.BASE_URL
}

// Helper function for custom backend URL (for MockInterview settings)
export const createCustomAPI = (customUrl) => {
  const baseUrl = customUrl || API_CONFIG.BASE_URL
  
  return {
    chatDomain: (data) =>
      fetch(`${baseUrl}/chat/chatDomain`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }),

    getEvaluationData: (sessionId) =>
      fetch(`${baseUrl}/chat/evaluation-data/${sessionId}`),

    getFinalReport: (sessionId) =>
      fetch(`${baseUrl}/chat/final-report/${sessionId}`),

    transcribe: (formData) =>
      fetch(`${baseUrl}/chat/transcribe`, {
        method: 'POST',
        body: formData
      }),

    getInterviewSessions: () =>
      fetch(`${baseUrl}/chat/interview-sessions`)
  }
}

// Backward compatibility
export const createCustomChatbotAPI = createCustomAPI

export default { mainAPI, resumeAPI, chatbotAPI, getBackendUrl, createCustomAPI }
