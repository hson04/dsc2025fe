// src/config/api.js
const API_CONFIG = {
  // ✅ Thay đổi URL này thành production URL
  BASE_URL: 'http://localhost:8001',
  
  ENDPOINTS: {
    EVALUATE_CV: '/resume-flow/evaluate-cv/',
    ADD_DATA_AND_CREATE_RESUME: '/resume-flow/add-data-and-create-resume',
    CALCULATE_ALIGNMENT_SCORE: '/resume-flow/calculate-alignment-score/',
    CALCULATE_CONTENT_PRESERVATION: '/resume-flow/calculate-content-preservation/',
    ANALYZE_RESUME_IMPROVEMENTS: '/resume-flow/analyze-resume-improvements/',
    GENERATE_REPORT_PDF: '/resume-flow/generate-report-pdf/',
    DOWNLOAD_PDF: '' // Base path, sẽ append download URL
  }
}

export default API_CONFIG