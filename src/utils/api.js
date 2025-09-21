// src/utils/api.js
import API_CONFIG from '../config/api'

/**
 * API utility functions - Chỉ sử dụng dsc2025API (port 3005)
 * Bỏ qua frontend/fast_apis
 */

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem("access_token")
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// Main API calls - All từ dsc2025API
export const mainAPI = {
  // Chat & Interview functions
  prepareInterview: (sessionId) =>
    fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.CHAT.PREPARE_INTERVIEW}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', ...getAuthHeaders() },
      body: `session_id=${sessionId}`
    }),

  getExtractionStatus: (sessionId) =>
    fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.CHAT.EXTRACTION_STATUS}${sessionId}`, {
      headers: getAuthHeaders()
    }),

  chatDomain: (data) =>
    fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.CHAT.DOMAIN}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(data)
    }),

  extractCV: (formData) =>
    fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.CHAT.EXTRACT_CV}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: formData // FormData with file and session_id
    }),

  extractJob: (formData) =>
    fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.CHAT.EXTRACT_JOB}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: formData // FormData with job_description and session_id
    }),

  getEvaluationData: (sessionId) =>
    fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.CHAT.EVALUATION_DATA}${sessionId}`, {
      headers: getAuthHeaders()
    }),

  getFinalReport: (sessionId) =>
    fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.CHAT.FINAL_REPORT}${sessionId}`, {
      headers: getAuthHeaders()
    }),

  transcribe: (formData) =>
    fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.CHAT.TRANSCRIBE}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: formData // FormData with file and language
    }),

  getInterviewSessions: () =>
    fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.CHAT.INTERVIEW_SESSIONS}`, {
      headers: getAuthHeaders()
    }),

  getSessionContext: (sessionId) =>
    fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.CHAT.SESSION_CONTEXT}${sessionId}`, {
      headers: getAuthHeaders()
    })
}

// Backward compatibility - Resume API calls (chuyển hướng về chat endpoints)
export const resumeAPI = {
  evaluateCV: (data) => 
    fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.EVALUATE_CV}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: data // FormData
    }),

  addDataAndCreateResume: (data) =>
    fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ADD_DATA_AND_CREATE_RESUME}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(data)
    }),

  calculateAlignmentScore: (data) =>
    fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CALCULATE_ALIGNMENT_SCORE}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(data)
    }),

  generateReportPDF: (data) =>
    fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.GENERATE_REPORT_PDF}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(data)
    }),

  downloadPDF: (downloadUrl) =>
    fetch(`${API_CONFIG.BASE_URL}${downloadUrl}`, {
      headers: getAuthHeaders()
    })
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
    prepareInterview: (sessionId) =>
      fetch(`${baseUrl}/chat/prepare-interview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', ...getAuthHeaders() },
        body: `session_id=${sessionId}`
      }),

    getExtractionStatus: (sessionId) =>
      fetch(`${baseUrl}/chat/extraction-status/${sessionId}`, {
        headers: getAuthHeaders()
      }),

    chatDomain: (data) =>
      fetch(`${baseUrl}/chat/chatDomain`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(data)
      }),

    getEvaluationData: (sessionId) =>
      fetch(`${baseUrl}/chat/evaluation-data/${sessionId}`, {
        headers: getAuthHeaders()
      }),

    getFinalReport: (sessionId) =>
      fetch(`${baseUrl}/chat/final-report/${sessionId}`, {
        headers: getAuthHeaders()
      }),

    transcribe: (formData) =>
      fetch(`${baseUrl}/chat/transcribe`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: formData
      }),

    getInterviewSessions: () =>
      fetch(`${baseUrl}/chat/interview-sessions`, {
        headers: getAuthHeaders()
      })
  }
}

// Backward compatibility
export const createCustomChatbotAPI = createCustomAPI

export default { mainAPI, resumeAPI, chatbotAPI, getBackendUrl, createCustomAPI }
