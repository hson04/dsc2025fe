import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Download, CheckCircle, TrendingUp, Target, Award, ArrowLeft, BarChart3 } from 'lucide-react'
import API_CONFIG from '../config/api'

const ImproveResumeStep3 = () => {
  // ✅ Main states
  const [isGenerating, setIsGenerating] = useState(true)
  const [progress, setProgress] = useState(0)
  const [isDownloading, setIsDownloading] = useState(false)
  const [enhancedEvaluation, setEnhancedEvaluation] = useState(null)
  const [expandedScores, setExpandedScores] = useState({})
  
  // ✅ Loading states for different sections
  const [isScorePanelLoading, setIsScorePanelLoading] = useState(true)
  const [isEnhancedMetricsLoading, setIsEnhancedMetricsLoading] = useState(true)
  const [isResumeImprovementsLoading, setIsResumeImprovementsLoading] = useState(true)
  
  // ✅ Data states
  const [contentPreservationScore, setContentPreservationScore] = useState(88)
  const [overallImprovementScore, setOverallImprovementScore] = useState(90)
  const [resumeImprovements, setResumeImprovements] = useState({
    original_summary: "",
    enhanced_summary: "",
    improvements: []
  })
  
  // ✅ Control flags to prevent duplicate API calls
  const [hasCalculatedScores, setHasCalculatedScores] = useState(false)
  const [hasCalculatedImprovements, setHasCalculatedImprovements] = useState(false)
  const [isCalculatingContentPreservation, setIsCalculatingContentPreservation] = useState(false)
  const [isCalculatingResumeImprovements, setIsCalculatingResumeImprovements] = useState(false)
  
  // ✅ Global API call tracker
  const [apiCallTracker] = useState(new Map())
  
  // ✅ State to track if any loading is in progress
  const [isAnyProcessRunning, setIsAnyProcessRunning] = useState(false)
  
  const navigate = useNavigate()
  const location = useLocation()

  // ✅ Effect to track loading states and prevent F5 reload
  useEffect(() => {
    const anyLoading = isGenerating || isScorePanelLoading || isEnhancedMetricsLoading || isResumeImprovementsLoading
    setIsAnyProcessRunning(anyLoading)

    const handleBeforeUnload = (e) => {
      if (anyLoading) {
        e.preventDefault()
        e.returnValue = 'Calculations are still in progress. Are you sure you want to leave?'
        return 'Calculations are still in progress. Are you sure you want to leave?'
      }
    }

    const handleKeyDown = (e) => {
      // Prevent F5 when any loading is in progress
      if (e.key === 'F5' || (e.ctrlKey && e.key === 'r') || (e.metaKey && e.key === 'r')) {
        if (anyLoading) {
          e.preventDefault()
          e.stopPropagation()
          console.log('F5 prevented - calculations in progress:', {
            isGenerating,
            isScorePanelLoading,
            isEnhancedMetricsLoading,
            isResumeImprovementsLoading
          })
          
          // Show a more detailed notification
          const notification = document.createElement('div')
          notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #fee2e2, #fef3c7);
            border: 2px solid #f59e0b;
            color: #92400e;
            padding: 24px 32px;
            border-radius: 16px;
            z-index: 10000;
            font-weight: 600;
            font-size: 16px;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
            text-align: center;
            min-width: 300px;
          `
          
          let loadingCount = 0
          let loadingText = 'Processing: '
          if (isGenerating) { loadingText += 'Resume Generation'; loadingCount++ }
          if (isScorePanelLoading) { 
            if (loadingCount > 0) loadingText += ', '
            loadingText += 'Match Analysis'; loadingCount++ 
          }
          if (isEnhancedMetricsLoading) { 
            if (loadingCount > 0) loadingText += ', '
            loadingText += 'Enhancement Metrics'; loadingCount++ 
          }
          if (isResumeImprovementsLoading) { 
            if (loadingCount > 0) loadingText += ', '
            loadingText += 'Resume Improvements'; loadingCount++ 
          }
          
          notification.innerHTML = `
            <div style="margin-bottom: 12px; font-size: 24px;">⚠️</div>
            <div style="margin-bottom: 8px; font-size: 18px; font-weight: bold;">Please Wait!</div>
            <div style="margin-bottom: 12px; font-size: 14px; color: #b45309;">
              Calculations are still in progress
            </div>
            <div style="font-size: 12px; color: #78350f; font-weight: normal;">
              ${loadingText}
            </div>
          `
          
          document.body.appendChild(notification)
          
          // Add a pulsing animation
          notification.animate([
            { transform: 'translate(-50%, -50%) scale(0.9)', opacity: 0 },
            { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 }
          ], {
            duration: 200,
            easing: 'ease-out'
          })
          
          setTimeout(() => {
            if (document.body.contains(notification)) {
              notification.animate([
                { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 },
                { transform: 'translate(-50%, -50%) scale(0.9)', opacity: 0 }
              ], {
                duration: 200,
                easing: 'ease-in'
              }).onfinish = () => {
                if (document.body.contains(notification)) {
                  document.body.removeChild(notification)
                }
              }
            }
          }, 4000)
          
          return false
        }
      }
    }

    // Also prevent Ctrl+Shift+R (hard reload)
    const handleKeyUp = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'R' && anyLoading) {
        e.preventDefault()
        e.stopPropagation()
        console.log('Hard reload prevented - calculations in progress')
        return false
      }
    }

    // Prevent right-click refresh if we add it later
    const handleContextMenu = (e) => {
      // We'll allow context menu but could add logic here if needed
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    window.addEventListener('keydown', handleKeyDown, true) // Use capture to catch early
    window.addEventListener('keyup', handleKeyUp, true)
    document.addEventListener('keydown', handleKeyDown, true) // Also listen on document

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      window.removeEventListener('keydown', handleKeyDown, true)
      window.removeEventListener('keyup', handleKeyUp, true)
      document.removeEventListener('keydown', handleKeyDown, true)
    }
  }, [isGenerating, isScorePanelLoading, isEnhancedMetricsLoading, isResumeImprovementsLoading])

  // ✅ Helper functions for blob data management
  const saveBlobData = async (blob) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = function() {
        // Lưu base64 string vào sessionStorage
        sessionStorage.setItem('generatedResumePDFData', reader.result);
        resolve(reader.result);
      };
      reader.readAsDataURL(blob);
    });
  };

  const restoreBlobFromData = async () => {
    const base64Data = sessionStorage.getItem('generatedResumePDFData');
    if (base64Data) {
      try {
        // Convert base64 back to blob
        const response = await fetch(base64Data);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        sessionStorage.setItem('generatedResumePDF', url);
        return url;
      } catch (error) {
        console.error('Error restoring blob from base64 data:', error);
        return null;
      }
    }
    return null;
  };

  // ✅ Helper functions
  const calculateScores = (alignmentData) => {
    if (!alignmentData || typeof alignmentData !== 'object') {
      return [];
    }
    
    return Object.entries(alignmentData).map(([key, value]) => {
      // Kiểm tra value có đúng structure không
      if (!value || !value.satisfied_requirements || !value.unsatisfied_requirements) {
        return null;
      }
      
      const satisfied = value.satisfied_requirements.length;
      const unsatisfied = value.unsatisfied_requirements.length;
      const total = satisfied + unsatisfied;
      
      return {
        label: key,
        value: satisfied,
        max: total || satisfied,
        color: getScoreColor(satisfied / (total || satisfied)),
        satisfied_requirements: value.satisfied_requirements,
        unsatisfied_requirements: value.unsatisfied_requirements
      };
    }).filter(Boolean); // Loại bỏ null values
  };

  const calculateOverallImprovement = (alignmentData) => {
    if (!alignmentData || typeof alignmentData !== 'object') {
      return 90; // Default value
    }

    const scores = calculateScores(alignmentData);
    if (scores.length === 0) {
      return 90; // Default value nếu không có data
    }

    // Tính tổng điểm đạt được và tổng điểm tối đa
    const totalAchieved = scores.reduce((sum, score) => sum + score.value, 0);
    const totalMaximum = scores.reduce((sum, score) => sum + score.max, 0);

    // Tính phần trăm và làm tròn
    const percentage = totalMaximum > 0 ? Math.round((totalAchieved / totalMaximum) * 100) : 90;
    
    return percentage;
  };

  const getScoreColor = (percentage) => {
    if (percentage <= 0.5) {
      const red = 255;
      const green = Math.round(percentage * 2 * 200);
      return `rgb(${red}, ${green}, 0)`;
    } else {
      const red = Math.round((1 - percentage) * 2 * 255);
      const green = 200;
      return `rgb(${red}, ${green}, 0)`;
    }
  };

  const toggleScore = (label) => {
    setExpandedScores(prev => ({
      ...prev,
      [label]: !prev[label]
    }));
  };

  // Function to handle Overleaf editing
  const handleEditInOverleaf = () => {
    const overleafLink = sessionStorage.getItem('overleafLink');
    if (overleafLink) {
      const form = document.createElement('form');
      form.method = 'post';
      form.action = 'https://www.overleaf.com/docs';
      form.target = '_blank';
      
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = 'snip_uri';
      input.value = overleafLink;
      
      form.appendChild(input);
      document.body.appendChild(form);
      form.submit();
      document.body.removeChild(form);
    } else {
      alert('Overleaf link not available. Please try regenerating the resume.');
    }
  };

  // Function to handle PDF download
  const handleDownloadPDF = async () => {
    if (isDownloading) return
    
    setIsDownloading(true)
    
    try {
      let pdfUrl = sessionStorage.getItem('generatedResumePDF')
      
      // ✅ Check if blob URL is still valid after F5
      if (pdfUrl && pdfUrl.startsWith('blob:')) {
        try {
          const testResponse = await fetch(pdfUrl);
          if (!testResponse.ok) {
            throw new Error('Blob URL expired');
          }
        } catch (error) {
          console.log('Blob URL expired after F5, trying to restore from base64 data...');
          
          // Try to restore from base64 data
          const restoredUrl = await restoreBlobFromData();
          if (restoredUrl) {
            pdfUrl = restoredUrl;
            console.log('Successfully restored blob URL from base64 data');
          } else {
            pdfUrl = null; // Force other fallback methods
          }
        }
      }
      
      // ✅ If we have a valid PDF URL, use it directly
      if (pdfUrl) {
        const timestamp = new Date().toISOString().slice(0, 19).replace(/[-:]/g, '').replace('T', '_')
        const filename = `enhanced_resume_${timestamp}.pdf`
        
        const link = document.createElement('a')
        link.href = pdfUrl
        link.download = filename
        link.style.display = 'none'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        return
      }

      // ✅ Fallback: Try to restore from base64 data if no URL available
      if (!pdfUrl) {
        console.log('No PDF URL available, trying to restore from base64 data...');
        const restoredUrl = await restoreBlobFromData();
        if (restoredUrl) {
          const timestamp = new Date().toISOString().slice(0, 19).replace(/[-:]/g, '').replace('T', '_')
          const filename = `enhanced_resume_${timestamp}.pdf`
          
          const link = document.createElement('a')
          link.href = restoredUrl
          link.download = filename
          link.style.display = 'none'
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          return
        }
      }

      // ✅ Fallback: Try generatedResume data
      const generatedResume = sessionStorage.getItem('generatedResume')
      
      if (generatedResume) {
        try {
          const resumeData = JSON.parse(generatedResume)
          const timestamp = new Date().toISOString().slice(0, 19).replace(/[-:]/g, '').replace('T', '_')
          const filename = `enhanced_resume_${timestamp}.pdf`
          
          if (resumeData.pdf_url) {
            const link = document.createElement('a')
            link.href = resumeData.pdf_url
            link.download = filename
            link.style.display = 'none'
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            return
          } else if (resumeData.pdf_data) {
            const byteCharacters = atob(resumeData.pdf_data)
            const byteNumbers = new Array(byteCharacters.length)
            for (let i = 0; i < byteCharacters.length; i++) {
              byteNumbers[i] = byteCharacters.charCodeAt(i)
            }
            const byteArray = new Uint8Array(byteNumbers)
            const blob = new Blob([byteArray], { type: 'application/pdf' })
            
            const url = window.URL.createObjectURL(blob)
            
            // ✅ Save blob data for future use
            await saveBlobData(blob)
            sessionStorage.setItem('generatedResumePDF', url)
            
            const link = document.createElement('a')
            link.href = url
            link.download = filename
            link.style.display = 'none'
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            return
          } else {
            throw new Error('No PDF data available in generatedResume')
          }
        } catch (parseError) {
          console.error('Error processing generatedResume data:', parseError)
        }
      }

      // ✅ Final fallback: Show helpful error message
      const createNotification = (message, type = 'error') => {
        const notification = document.createElement('div')
        notification.style.cssText = `
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: ${type === 'error' ? 'linear-gradient(135deg, #fee2e2, #fecaca)' : 'linear-gradient(135deg, #d1fae5, #a7f3d0)'};
          border: 2px solid ${type === 'error' ? '#f87171' : '#10b981'};
          color: ${type === 'error' ? '#991b1b' : '#065f46'};
          padding: 24px 32px;
          border-radius: 16px;
          z-index: 10000;
          font-weight: 600;
          font-size: 16px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          text-align: center;
          min-width: 350px;
          max-width: 500px;
        `
        
        notification.innerHTML = `
          <div style="margin-bottom: 12px; font-size: 24px;">${type === 'error' ? '⚠️' : '✅'}</div>
          <div style="margin-bottom: 8px; font-size: 18px; font-weight: bold;">PDF Download Issue</div>
          <div style="margin-bottom: 12px; font-size: 14px; line-height: 1.5;">
            ${message}
          </div>
          <div style="font-size: 12px; color: ${type === 'error' ? '#7f1d1d' : '#064e3b'}; font-weight: normal;">
            You can try regenerating your resume by going back to Step 2 and submitting again.
          </div>
        `
        
        document.body.appendChild(notification)
        
        notification.animate([
          { transform: 'translate(-50%, -50%) scale(0.9)', opacity: 0 },
          { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 }
        ], {
          duration: 300,
          easing: 'ease-out'
        })
        
        setTimeout(() => {
          if (document.body.contains(notification)) {
            notification.animate([
              { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 },
              { transform: 'translate(-50%, -50%) scale(0.9)', opacity: 0 }
            ], {
              duration: 300,
              easing: 'ease-in'
            }).onfinish = () => {
              if (document.body.contains(notification)) {
                document.body.removeChild(notification)
              }
            }
          }
        }, 5000)
      }

      createNotification(
        'The PDF file is temporarily unavailable after page refresh. The file was successfully generated but the download link expired.',
        'error'
      )

    } catch (error) {
      console.error('Error in handleDownloadPDF:', error)
      alert('Lỗi khi tải xuống PDF. Vui lòng thử lại hoặc quay lại Step 2 để tạo lại resume.')
    } finally {
      setIsDownloading(false)
    }
  }

  const metrics = {
    jobAlignment: 92,
    contentPreservation: contentPreservationScore,
    atsOptimization: 95,
    overallImprovement: overallImprovementScore
  }

  const summary = {
    title: "Your Resume Has Been Successfully Enhanced!",
    description: "Our AI has analyzed your resume against the job requirements and made strategic improvements to increase your chances of getting an interview.",
    improvements: resumeImprovements.improvements.length > 0 
      ? resumeImprovements.improvements 
      : [
          "Added 12 relevant keywords for better ATS compatibility",
          "Quantified 8 achievements with specific metrics and numbers",
          "Restructured work experience for better impact presentation", 
          "Enhanced technical skills section with job-relevant technologies",
          "Improved professional summary to highlight key strengths"
        ],
    beforeAfter: {
      before: resumeImprovements.original_summary || "Generic software developer with experience in web development and programming.",
      after: resumeImprovements.enhanced_summary || "Results-driven Senior Software Engineer with 5+ years developing scalable web applications using React, Node.js, and AWS. Led cross-functional teams of 8+ developers, improving deployment efficiency by 40% and reducing system downtime by 65%."
    }
  }

  // ✅ Score panel loading effect - chỉ gọi alignment calculation một lần
  useEffect(() => {
    // Chỉ start score panel loading khi main loading đã xong
    if (!isGenerating) {
      // ✅ Check if data already exists in sessionStorage (F5 case)
      const alignmentScoreData = sessionStorage.getItem('enhancedAlignmentScore')
      if (alignmentScoreData && !location.state?.fromStep2) {
        console.log('Score panel data already exists, skipping calculation')
        try {
          const parsedData = JSON.parse(alignmentScoreData)
          setEnhancedEvaluation(parsedData)
          
          // Calculate overall improvement from actual data
          const calculatedOverallImprovement = calculateOverallImprovement(parsedData)
          setOverallImprovementScore(calculatedOverallImprovement)
          
          setIsScorePanelLoading(false)
          // ✅ Trigger enhanced metrics if alignment data is ready
          const apiStatus = apiCallTracker.get('content-preservation')
          if (apiStatus !== 'completed' && !hasCalculatedScores) {
            triggerEnhancedMetricsCalculation()
          }
        } catch (error) {
          console.error('Error parsing alignment data:', error)
          setIsScorePanelLoading(true)
          // Force trigger calculation if data is corrupted
          setTimeout(() => triggerAlignmentCalculation(), 1000)
        }
        return
      }

      // ✅ If coming from Step 2 OR no alignment data exists, trigger calculation ONCE
      const pdfUrl = sessionStorage.getItem('generatedResumePDF')
      const analysisResults = sessionStorage.getItem('analysisResults')
      
      if (pdfUrl && analysisResults && !alignmentScoreData) {
        console.log('Triggering alignment calculation ONCE:', {
          fromStep2: location.state?.fromStep2,
          hasAlignmentData: !!alignmentScoreData
        })
        
        // Trigger alignment calculation chỉ một lần duy nhất
        setTimeout(() => triggerAlignmentCalculation(), 500)
      } else {
        console.log('Missing required data for alignment calculation or already exists:', {
          hasPdf: !!pdfUrl,
          hasAnalysis: !!analysisResults,
          hasAlignment: !!alignmentScoreData
        })
        
        // Set failed state if we don't have required data
        setIsScorePanelLoading(false)
        setTimeout(() => {
          const apiStatus = apiCallTracker.get('content-preservation')
          if (apiStatus !== 'completed' && !hasCalculatedScores) {
            triggerEnhancedMetricsCalculation()
          }
        }, 500)
      }
    }
  }, [isGenerating, hasCalculatedScores, apiCallTracker, location.state?.fromStep2])

  // ✅ New function to trigger alignment calculation
  const triggerAlignmentCalculation = async () => {
    const pdfUrl = sessionStorage.getItem('generatedResumePDF')
    const analysisResults = sessionStorage.getItem('analysisResults')
    
    if (!pdfUrl || !analysisResults) {
      console.log('Cannot trigger alignment calculation - missing data')
      setIsScorePanelLoading(false)
      return
    }

    try {
      console.log('Starting alignment score calculation...')
      
      // Check if blob URL is still valid
      let validPdfUrl = pdfUrl
      if (pdfUrl.startsWith('blob:')) {
        try {
          const testResponse = await fetch(pdfUrl)
          if (!testResponse.ok) {
            throw new Error('Blob URL expired')
          }
        } catch (error) {
          console.log('Blob URL expired, trying to restore...')
          const restoredUrl = await restoreBlobFromData()
          if (restoredUrl) {
            validPdfUrl = restoredUrl
          } else {
            throw new Error('Cannot restore PDF URL')
          }
        }
      }

      const response = await fetch(validPdfUrl)
      const blob = await response.blob()
      const file = new File([blob], 'generated_resume.pdf', { type: 'application/pdf' })
      
      const parsedAnalysisResults = JSON.parse(analysisResults)
      const evaluateFormData = new FormData()
      evaluateFormData.append('resume_file', file)
      evaluateFormData.append('job_data', parsedAnalysisResults.job_data ? JSON.stringify(parsedAnalysisResults.job_data) : '{}')
      evaluateFormData.append('job_data_v2', parsedAnalysisResults.job_data_v2 ? JSON.stringify(parsedAnalysisResults.job_data_v2) : '{}')
      
      const evaluateResponse = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.RESUME.CALCULATE_ALIGNMENT_SCORE}`, {
        method: 'POST',
        body: evaluateFormData
      })
      
      if (evaluateResponse.ok) {
        const evaluatedData = await evaluateResponse.json()
        
        // Save the results
        sessionStorage.setItem('enhancedAlignmentScore', JSON.stringify(evaluatedData.alignment_score))
        sessionStorage.setItem('enhancedResumeData', JSON.stringify(evaluatedData.resume_data))
        sessionStorage.setItem('scorePanelDataReady', 'true')
        
        // Set the data in component state
        setEnhancedEvaluation(evaluatedData.alignment_score)
        const calculatedOverallImprovement = calculateOverallImprovement(evaluatedData.alignment_score)
        setOverallImprovementScore(calculatedOverallImprovement)
        
        setTimeout(() => {
          setIsScorePanelLoading(false)
          // Trigger enhanced metrics calculation
          const apiStatus = apiCallTracker.get('content-preservation')
          if (apiStatus !== 'completed' && !hasCalculatedScores) {
            triggerEnhancedMetricsCalculation()
          }
        }, 500)
        
        console.log('Alignment score calculation completed successfully')
      } else {
        console.warn('Alignment score calculation failed')
        sessionStorage.setItem('scorePanelDataReady', 'failed')
        setIsScorePanelLoading(false)
        // Still trigger enhanced metrics even if alignment fails
        setTimeout(() => {
          const apiStatus = apiCallTracker.get('content-preservation')
          if (apiStatus !== 'completed' && !hasCalculatedScores) {
            triggerEnhancedMetricsCalculation()
          }
        }, 500)
      }
    } catch (error) {
      console.error('Error in alignment calculation:', error)
      sessionStorage.setItem('scorePanelDataReady', 'failed')
      setIsScorePanelLoading(false)
      // Still trigger enhanced metrics even if alignment fails
      setTimeout(() => {
        const apiStatus = apiCallTracker.get('content-preservation')
        if (apiStatus !== 'completed' && !hasCalculatedScores) {
          triggerEnhancedMetricsCalculation()
        }
      }, 500)
    }
  }

  // ✅ Enhanced metrics calculation functions - now combined with resume improvements
  const triggerEnhancedMetricsCalculation = () => {
    console.log('triggerEnhancedMetricsCalculation called', {
      hasCalculatedScores,
      hasCalculatedImprovements,
      isCalculatingContentPreservation,
      isCalculatingResumeImprovements,
      apiStatus: apiCallTracker.get('content-preservation'),
      improvementsApiStatus: apiCallTracker.get('resume-improvements')
    });

    // ✅ Skip if already calculated and not from new submission
    if ((hasCalculatedScores && hasCalculatedImprovements) && !location.state?.fromStep2) {
      console.log('Both enhanced metrics and resume improvements already calculated and not from new submission, skipping...')
      return;
    }

    // ✅ Skip if both APIs already completed and not from new submission
    const contentApiStatus = apiCallTracker.get('content-preservation');
    const improvementsApiStatus = apiCallTracker.get('resume-improvements');
    if ((contentApiStatus === 'completed' && improvementsApiStatus === 'completed') && !location.state?.fromStep2) {
      console.log('Both APIs already completed and not from new submission, skipping...')
      return;
    }
    
    const enhancedMetricsReady = sessionStorage.getItem('enhancedMetricsCalculated')
    const contentPreservationData = sessionStorage.getItem('contentPreservationScore')
    const resumeImprovementsReady = sessionStorage.getItem('resumeImprovementsCalculated')
    const resumeImprovementsData = sessionStorage.getItem('resumeImprovementsData')
    
    // Check if both calculations are already done
    const bothCalculationsReady = (enhancedMetricsReady === 'true' && contentPreservationData) && 
                                  (resumeImprovementsReady === 'true' && resumeImprovementsData)
    
    if (bothCalculationsReady && !location.state?.fromStep2) {
      // Both data already available - load immediately (only if not from new submission)
      const preservationScore = parseInt(contentPreservationData)
      setContentPreservationScore(preservationScore)
      setHasCalculatedScores(true)
      setIsEnhancedMetricsLoading(false)
      apiCallTracker.set('content-preservation', 'completed')
      
      try {
        const improvementsData = JSON.parse(resumeImprovementsData)
        setResumeImprovements(improvementsData)
      } catch (error) {
        console.error('Error parsing resume improvements data:', error)
      }
      setHasCalculatedImprovements(true)
      setIsResumeImprovementsLoading(false)
      apiCallTracker.set('resume-improvements', 'completed')
      
      return;
    }
    
    // If either calculation failed, set both as failed
    if ((enhancedMetricsReady === 'failed' || resumeImprovementsReady === 'failed') && !location.state?.fromStep2) {
      setContentPreservationScore(0)
      setHasCalculatedScores(true)
      setIsEnhancedMetricsLoading(false)
      apiCallTracker.set('content-preservation', 'completed')
      
      setHasCalculatedImprovements(true)
      setIsResumeImprovementsLoading(false)
      apiCallTracker.set('resume-improvements', 'completed')
      
      return;
    }
    
    // ✅ Check if we have required data - wait for alignment calculation if needed
    const notEnhancedResumeData = sessionStorage.getItem('AddDataResumeData')
    const enhancedResumeData = sessionStorage.getItem('enhancedResumeData')
    const analysisResults = sessionStorage.getItem('analysisResults')
    
    if (!notEnhancedResumeData || !enhancedResumeData || !analysisResults) {
      console.log('Missing data for parallel calculations:', {
        notEnhancedResumeData: !!notEnhancedResumeData,
        enhancedResumeData: !!enhancedResumeData,
        analysisResults: !!analysisResults
      });
      
      // ✅ If enhancedResumeData is missing, wait for alignment calculation to complete
      if (!enhancedResumeData) {
        console.log('enhancedResumeData missing - waiting for alignment calculation to complete')
        
        // Set up interval to wait for alignment calculation result
        const waitForAlignmentData = setInterval(() => {
          const alignmentComplete = sessionStorage.getItem('enhancedResumeData')
          if (alignmentComplete) {
            console.log('Alignment calculation completed, retrying parallel calculations')
            clearInterval(waitForAlignmentData)
            setTimeout(() => {
              triggerEnhancedMetricsCalculation()
            }, 500)
          }
        }, 1000)
        
        // Clean up interval after 30 seconds max
        setTimeout(() => {
          clearInterval(waitForAlignmentData)
          if (!sessionStorage.getItem('enhancedResumeData')) {
            console.log('Timeout waiting for alignment data, setting failed state for both calculations')
            setContentPreservationScore(0)
            setHasCalculatedScores(true)
            setIsEnhancedMetricsLoading(false)
            sessionStorage.setItem('enhancedMetricsCalculated', 'failed')
            sessionStorage.setItem('contentPreservationScore', '0')
            apiCallTracker.set('content-preservation', 'completed')
            
            setHasCalculatedImprovements(true)
            setIsResumeImprovementsLoading(false)
            sessionStorage.setItem('resumeImprovementsCalculated', 'failed')
            apiCallTracker.set('resume-improvements', 'completed')
          }
        }, 30000)
        
        return;
      }
      
      // Set failed state if we don't have required data
      setContentPreservationScore(0)
      setHasCalculatedScores(true)
      setIsEnhancedMetricsLoading(false)
      sessionStorage.setItem('enhancedMetricsCalculated', 'failed')
      sessionStorage.setItem('contentPreservationScore', '0')
      apiCallTracker.set('content-preservation', 'completed')
      
      setHasCalculatedImprovements(true)
      setIsResumeImprovementsLoading(false)
      sessionStorage.setItem('resumeImprovementsCalculated', 'failed')
      apiCallTracker.set('resume-improvements', 'completed')
      return;
    }
    
    // No data yet OR coming from new submission - start parallel calculation
    calculateBothMetricsInParallel()
  }

  // ✅ New function to calculate both metrics in parallel
  const calculateBothMetricsInParallel = async () => {
    console.log('calculateBothMetricsInParallel called', {
      hasCalculatedScores,
      hasCalculatedImprovements,
      isCalculatingContentPreservation,
      isCalculatingResumeImprovements
    });

    // ✅ Prevent duplicate calls
    if ((hasCalculatedScores && hasCalculatedImprovements) || 
        (isCalculatingContentPreservation && isCalculatingResumeImprovements)) {
      console.log('Both calculations already done or in progress, skipping...')
      return;
    }
    
    const contentApiStatus = apiCallTracker.get('content-preservation');
    const improvementsApiStatus = apiCallTracker.get('resume-improvements');
    if (contentApiStatus === 'calling' || improvementsApiStatus === 'calling') {
      console.log('One or both APIs already in progress, skipping...')
      return;
    }
    
    // Mark both APIs as calling
    apiCallTracker.set('content-preservation', 'calling')
    apiCallTracker.set('resume-improvements', 'calling')
    setIsCalculatingContentPreservation(true)
    setIsCalculatingResumeImprovements(true)
    
    try {
      const notEnhancedResumeData = sessionStorage.getItem('AddDataResumeData')
      const enhancedResumeData = sessionStorage.getItem('enhancedResumeData')
      const analysisResults = sessionStorage.getItem('analysisResults')
      
      console.log('Starting parallel calculations with data:', { 
        notEnhancedResumeData: !!notEnhancedResumeData, 
        enhancedResumeData: !!enhancedResumeData,
        analysisResults: !!analysisResults
      })
      
      if (notEnhancedResumeData && enhancedResumeData && analysisResults) {
        let originalResumeData, enhancedData, analysisData;
        
        try {
          // Parse data properly
          if (typeof notEnhancedResumeData === 'string') {
            originalResumeData = JSON.parse(notEnhancedResumeData);
          } else {
            originalResumeData = notEnhancedResumeData;
          }
          
          if (typeof enhancedResumeData === 'string') {
            enhancedData = JSON.parse(enhancedResumeData);
          } else {
            enhancedData = enhancedResumeData;
          }
          
          if (typeof analysisResults === 'string') {
            analysisData = JSON.parse(analysisResults);
          } else {
            analysisData = analysisResults;
          }
        } catch (parseError) {
          console.error('Error parsing data for parallel calculations:', parseError);
          throw parseError;
        }
        
        // ✅ Execute both API calls in parallel
        const [contentPreservationResponse, resumeImprovementsResponse] = await Promise.allSettled([
          // Content Preservation API call
          fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.RESUME.CALCULATE_CONTENT_PRESERVATION}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              resume_data_1: originalResumeData,
              resume_data_2: enhancedData
            }),
          }),
          
          // Resume Improvements API call
          fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.RESUME.ANALYZE_RESUME_IMPROVEMENTS}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              original_resume_data: analysisData.resume_data,
              enhanced_resume_data: enhancedData
            }),
          })
        ]);
        
        // ✅ Handle Content Preservation result
        if (contentPreservationResponse.status === 'fulfilled' && contentPreservationResponse.value.ok) {
          const contentResult = await contentPreservationResponse.value.json()
          const preservationScore = Math.round(contentResult.content_preservation_score * 100)
          setContentPreservationScore(preservationScore)
          sessionStorage.setItem('contentPreservationScore', preservationScore.toString())
          sessionStorage.setItem('enhancedMetricsCalculated', 'true')
          console.log('Content Preservation Score (parallel):', preservationScore)
        } else {
          setContentPreservationScore(0)
          sessionStorage.setItem('contentPreservationScore', '0')
          sessionStorage.setItem('enhancedMetricsCalculated', 'failed')
          console.log('Failed to calculate content preservation score (parallel)')
        }
        
        // ✅ Handle Resume Improvements result
        if (resumeImprovementsResponse.status === 'fulfilled' && resumeImprovementsResponse.value.ok) {
          const improvementsResult = await resumeImprovementsResponse.value.json()
          setResumeImprovements(improvementsResult)
          sessionStorage.setItem('resumeImprovementsData', JSON.stringify(improvementsResult))
          sessionStorage.setItem('resumeImprovementsCalculated', 'true')
          console.log('Resume Improvements (parallel):', improvementsResult)
        } else {
          sessionStorage.setItem('resumeImprovementsCalculated', 'failed')
          console.log('Failed to calculate resume improvements (parallel)')
        }
        
      } else {
        // Missing data - set failed states
        setContentPreservationScore(0)
        sessionStorage.setItem('contentPreservationScore', '0')
        sessionStorage.setItem('enhancedMetricsCalculated', 'failed')
        sessionStorage.setItem('resumeImprovementsCalculated', 'failed')
        console.log('Insufficient data for parallel calculations')
      }
      
      // ✅ Update states for both calculations
      setHasCalculatedScores(true)
      setHasCalculatedImprovements(true)
      
      setTimeout(() => {
        setIsEnhancedMetricsLoading(false)
        setIsResumeImprovementsLoading(false)
      }, 500)
      
    } catch (error) {
      console.error('Error in parallel calculations:', error)
      // Set failed states for both
      setContentPreservationScore(0)
      sessionStorage.setItem('contentPreservationScore', '0')
      sessionStorage.setItem('enhancedMetricsCalculated', 'failed')
      sessionStorage.setItem('resumeImprovementsCalculated', 'failed')
      
      setHasCalculatedScores(true)
      setHasCalculatedImprovements(true)
      
      setTimeout(() => {
        setIsEnhancedMetricsLoading(false)
        setIsResumeImprovementsLoading(false)
      }, 500)
    } finally {
      setIsCalculatingContentPreservation(false)
      setIsCalculatingResumeImprovements(false)
      apiCallTracker.set('content-preservation', 'completed')
      apiCallTracker.set('resume-improvements', 'completed')
    }
  }

  // ✅ Remove the separate triggerResumeImprovementsCalculation function since it's now handled in parallel
  // Keep the old functions for backward compatibility but make them redirect to the parallel function
  const calculateContentPreservation = async () => {
    console.log('calculateContentPreservation called - redirecting to parallel calculation')
    return calculateBothMetricsInParallel()
  }

  const calculateResumeImprovements = async () => {
    console.log('calculateResumeImprovements called - redirecting to parallel calculation')
    return calculateBothMetricsInParallel()
  }

  const triggerResumeImprovementsCalculation = () => {
    console.log('triggerResumeImprovementsCalculation called - already handled in parallel')
    // This function is now handled by triggerEnhancedMetricsCalculation
    // No separate action needed since both calculations run in parallel
  }

  // ✅ Effect to handle F5 specifically 
  useEffect(() => {
    const handleF5Case = () => {
      const pdfUrl = sessionStorage.getItem('generatedResumePDF')
      const resumeData = sessionStorage.getItem('generatedResume')
      const hasData = pdfUrl || resumeData
      const step3DataProcessed = sessionStorage.getItem('step3DataProcessed')
      
      // ✅ Detect F5: has data + processed flag + has location state
      if (hasData && step3DataProcessed && location.state?.fromStep2) {
        console.log('🔄 F5 detected - bypassing location state and loading existing data');
        
        // Immediately clear location state
        window.history.replaceState({}, '', window.location.pathname);
        
        // Force stop generating state
        setIsGenerating(false);
        setProgress(100);
        
        // Load existing data
        const alignmentScoreData = sessionStorage.getItem('enhancedAlignmentScore')
        if (alignmentScoreData) {
          try {
            const parsedData = JSON.parse(alignmentScoreData)
            setEnhancedEvaluation(parsedData)
            const calculatedOverallImprovement = calculateOverallImprovement(parsedData)
            setOverallImprovementScore(calculatedOverallImprovement)
            setIsScorePanelLoading(false)
          } catch (error) {
            console.error('Error parsing alignment data:', error)
            // ✅ If alignment data is corrupted, need to recalculate
            setIsScorePanelLoading(true)
          }
        } else {
          // ✅ No alignment data - check if we need to trigger calculation
          const scorePanelReady = sessionStorage.getItem('scorePanelDataReady')
          if (scorePanelReady !== 'true' && scorePanelReady !== 'failed') {
            console.log('F5: No alignment data found, will trigger calculation')
            setIsScorePanelLoading(true)
          }
        }

        const enhancedMetricsReady = sessionStorage.getItem('enhancedMetricsCalculated')
        const contentPreservationData = sessionStorage.getItem('contentPreservationScore')
        if (enhancedMetricsReady === 'true' && contentPreservationData) {
          const preservationScore = parseInt(contentPreservationData)
          setContentPreservationScore(preservationScore)
          setHasCalculatedScores(true)
          setIsEnhancedMetricsLoading(false)
          // ✅ Set API tracker status to completed when loading from sessionStorage
          apiCallTracker.set('content-preservation', 'completed')
        } else {
          // ✅ Need to calculate enhanced metrics or check if regeneration is in progress
          const enhancedResumeData = sessionStorage.getItem('enhancedResumeData')
          if (!enhancedResumeData) {
            console.log('F5: Missing enhancedResumeData, checking if we can regenerate...')
            const pdfUrl = sessionStorage.getItem('generatedResumePDF')
            const analysisResults = sessionStorage.getItem('analysisResults')
            
            if (pdfUrl && analysisResults) {
              console.log('F5: Can regenerate enhancedResumeData, keeping loading state')
              setIsEnhancedMetricsLoading(true)
              setHasCalculatedScores(false)
            } else {
              console.log('F5: Cannot regenerate enhancedResumeData, setting failed state')
              setIsEnhancedMetricsLoading(false)
              setContentPreservationScore(0)
              sessionStorage.setItem('contentPreservationScore', '0')
              sessionStorage.setItem('enhancedMetricsCalculated', 'failed')
            }
          } else {
            // Has enhancedResumeData but metrics not calculated yet
            setIsEnhancedMetricsLoading(true)
            setHasCalculatedScores(false)
          }
        }

        const resumeImprovementsReady = sessionStorage.getItem('resumeImprovementsCalculated')
        const resumeImprovementsData = sessionStorage.getItem('resumeImprovementsData')
        if (resumeImprovementsReady === 'true' && resumeImprovementsData) {
          try {
            const improvementsData = JSON.parse(resumeImprovementsData)
            setResumeImprovements(improvementsData)
            setHasCalculatedImprovements(true)
            setIsResumeImprovementsLoading(false)
            // ✅ Set API tracker status to completed when loading from sessionStorage
            apiCallTracker.set('resume-improvements', 'completed')
          } catch (error) {
            console.error('Error parsing resume improvements data:', error)
            // ✅ If improvements data is corrupted, need to recalculate
            setIsResumeImprovementsLoading(true)
            setHasCalculatedImprovements(false)
          }
        } else {
          // ✅ Need to calculate resume improvements
          const enhancedResumeData = sessionStorage.getItem('enhancedResumeData')
          if (!enhancedResumeData) {
            console.log('F5: Missing enhancedResumeData for resume improvements, checking if we can regenerate...')
            const pdfUrl = sessionStorage.getItem('generatedResumePDF')
            const analysisResults = sessionStorage.getItem('analysisResults')
            
            if (pdfUrl && analysisResults) {
              console.log('F5: Can regenerate enhancedResumeData for resume improvements, keeping loading state')
              setIsResumeImprovementsLoading(true)
              setHasCalculatedImprovements(false)
            } else {
              console.log('F5: Cannot regenerate enhancedResumeData for resume improvements, setting failed state')
              setIsResumeImprovementsLoading(false)
              sessionStorage.setItem('resumeImprovementsCalculated', 'failed')
            }
          } else {
            // Has enhancedResumeData but improvements not calculated yet
            setIsResumeImprovementsLoading(true)
            setHasCalculatedImprovements(false)
          }
        }
        
        console.log('✅ F5 data loaded successfully');
        return true; // Indicate F5 was handled
      }
      return false; // Not F5 case
    };

    // Try to handle F5 case first
    if (handleF5Case()) {
      return; // Early return if F5 was handled
    }
  }, []); // Run only on mount

  // ✅ Effect to clear stale location state on F5
  useEffect(() => {
    // Check if we have data but also have location state (likely F5 case)
    const pdfUrl = sessionStorage.getItem('generatedResumePDF')
    const resumeData = sessionStorage.getItem('generatedResume')
    const hasData = pdfUrl || resumeData
    const step3DataProcessed = sessionStorage.getItem('step3DataProcessed')
    
    // If we have data AND step3DataProcessed flag, this is F5 with stale location state
    if (hasData && step3DataProcessed && location.state) {
      console.log('F5 detected with stale location state - clearing it');
      // Clear the stale location state
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []) // Run only once on mount

  // ✅ Effect to trigger missing calculations after F5
  useEffect(() => {
    // ✅ Wait a bit before checking to ensure all state is properly set
    const checkAndTriggerCalculations = setTimeout(() => {
      // Only trigger when not generating and not from new submission
      if (!isGenerating && !location.state?.fromStep2 && !location.state?.loading) {
        const pdfUrl = sessionStorage.getItem('generatedResumePDF')
        const resumeData = sessionStorage.getItem('generatedResume')
        const hasData = pdfUrl || resumeData

        if (hasData) {
          console.log('F5: Checking missing calculations...', {
            isScorePanelLoading,
            isEnhancedMetricsLoading,
            isResumeImprovementsLoading,
            hasCalculatedScores,
            hasCalculatedImprovements
          });

          // Check what calculations are missing and trigger them
          const alignmentScoreData = sessionStorage.getItem('enhancedAlignmentScore')
          const enhancedMetricsReady = sessionStorage.getItem('enhancedMetricsCalculated')
          const resumeImprovementsReady = sessionStorage.getItem('resumeImprovementsCalculated')

          // ✅ If missing alignment score data and score panel is loading, check if we need to restart calculation
          if (!alignmentScoreData && isScorePanelLoading) {
            console.log('F5: Missing alignment score data, checking if PDF needs alignment calculation')
            
            // Check if we have required data for alignment calculation
            const analysisResults = sessionStorage.getItem('analysisResults')
            const enhancedResumeData = sessionStorage.getItem('enhancedResumeData')
            
            if (pdfUrl && analysisResults) {
              console.log('F5: Have PDF and analysis data, will trigger alignment calculation via score panel effect')
            } else if (!analysisResults) {
              console.log('F5: Missing analysis results, cannot calculate alignment score')
              setIsScorePanelLoading(false)
              // Set warning state for Enhanced Analysis Unavailable
            }
          }

          // ✅ If missing either enhanced metrics or resume improvements, trigger parallel calculation
          if ((enhancedMetricsReady !== 'true' || resumeImprovementsReady !== 'true') && 
              (isEnhancedMetricsLoading || isResumeImprovementsLoading) && 
              (!hasCalculatedScores || !hasCalculatedImprovements)) {
            console.log('F5: Triggering parallel enhanced metrics and resume improvements calculation')
            
            // Check if we have required data
            const addDataResumeData = sessionStorage.getItem('AddDataResumeData')
            const enhancedResumeData = sessionStorage.getItem('enhancedResumeData')
            const analysisResults = sessionStorage.getItem('analysisResults')
            
            if (addDataResumeData && enhancedResumeData && analysisResults) {
              setTimeout(() => {
                triggerEnhancedMetricsCalculation() // This now handles both calculations in parallel
              }, 500)
            } else if (addDataResumeData && analysisResults && !enhancedResumeData) {
              // We have original data but missing enhanced data - try to regenerate it
              console.log('F5: Have AddDataResumeData and analysisResults but missing enhancedResumeData, triggering regeneration')
              setTimeout(() => {
                triggerEnhancedMetricsCalculation()
              }, 500)
            } else {
              console.log('F5: Missing data for parallel calculations')
              setIsEnhancedMetricsLoading(false)
              setContentPreservationScore(0)
              sessionStorage.setItem('contentPreservationScore', '0')
              sessionStorage.setItem('enhancedMetricsCalculated', 'failed')
              
              setIsResumeImprovementsLoading(false)
              sessionStorage.setItem('resumeImprovementsCalculated', 'failed')
            }
          }
        }
      }
    }, 1000);

    return () => clearTimeout(checkAndTriggerCalculations);
  }, [isGenerating, isScorePanelLoading, isEnhancedMetricsLoading, isResumeImprovementsLoading, hasCalculatedScores, hasCalculatedImprovements, location.state?.fromStep2, location.state?.loading])

  // ✅ Effect to handle alignment score calculation after F5 - chỉ trigger khi cần thiết
  useEffect(() => {
    // Only run if score panel is loading and not from new submission
    if (isScorePanelLoading && !location.state?.fromStep2 && !location.state?.loading && !isGenerating) {
      const checkAndTriggerAlignmentCalculation = setTimeout(() => {
        const pdfUrl = sessionStorage.getItem('generatedResumePDF')
        const analysisResults = sessionStorage.getItem('analysisResults')
        const alignmentScoreData = sessionStorage.getItem('enhancedAlignmentScore')
        
        // If we have PDF and analysis data but no alignment score, trigger calculation
        if (pdfUrl && analysisResults && !alignmentScoreData) {
          console.log('F5: Triggering alignment score calculation manually (one time only)')
          triggerAlignmentCalculation()
        } else if (!analysisResults) {
          console.log('F5: Missing analysis results, cannot calculate alignment score')
          setIsScorePanelLoading(false)
          sessionStorage.setItem('scorePanelDataReady', 'failed')
        }
      }, 1500)
      
      return () => clearTimeout(checkAndTriggerAlignmentCalculation)
    }
  }, [isScorePanelLoading, location.state?.fromStep2, location.state?.loading, isGenerating, hasCalculatedScores])

  // ✅ Effect to ensure PDF download capability after F5
  useEffect(() => {
    // Check if we have a valid PDF download option and save blob data if needed
    const checkAndSavePDFData = async () => {
      const pdfUrl = sessionStorage.getItem('generatedResumePDF')
      const base64Data = sessionStorage.getItem('generatedResumePDFData')
      const generatedResume = sessionStorage.getItem('generatedResume')
      
      // If we have PDF URL but no base64 backup, try to create one
      if (pdfUrl && !base64Data && pdfUrl.startsWith('blob:')) {
        try {
          console.log('Creating base64 backup for blob URL...')
          const response = await fetch(pdfUrl)
          if (response.ok) {
            const blob = await response.blob()
            await saveBlobData(blob)
            console.log('Base64 backup created successfully')
          }
        } catch (error) {
          console.log('Could not create base64 backup from blob URL:', error)
        }
      }
      
      // If we have generatedResume with pdf_data but no base64 backup, create one
      if (!base64Data && generatedResume && !pdfUrl) {
        try {
          console.log('Creating base64 backup from generatedResume pdf_data...')
          const resumeData = JSON.parse(generatedResume)
          if (resumeData.pdf_data) {
            const byteCharacters = atob(resumeData.pdf_data)
            const byteNumbers = new Array(byteCharacters.length)
            for (let i = 0; i < byteCharacters.length; i++) {
              byteNumbers[i] = byteCharacters.charCodeAt(i)
            }
            const byteArray = new Uint8Array(byteNumbers)
            const blob = new Blob([byteArray], { type: 'application/pdf' })
            
            // Create both blob URL and base64 backup
            const url = window.URL.createObjectURL(blob)
            sessionStorage.setItem('generatedResumePDF', url)
            await saveBlobData(blob)
            console.log('PDF URL and base64 backup created from generatedResume data')
          }
        } catch (error) {
          console.log('Could not create backup from generatedResume:', error)
        }
      }
      
      // Log available options for PDF download
      const updatedPdfUrl = sessionStorage.getItem('generatedResumePDF')
      const updatedBase64Data = sessionStorage.getItem('generatedResumePDFData')
      const overleafLink = sessionStorage.getItem('overleafLink')
      
      console.log('PDF Download Options Available:', {
        hasPdfUrl: !!updatedPdfUrl,
        hasBase64Backup: !!updatedBase64Data,
        hasOverleafLink: !!overleafLink,
        hasGeneratedResume: !!generatedResume,
        canDownload: !!(updatedPdfUrl || updatedBase64Data || overleafLink || generatedResume)
      })
    }
    
    // Only run this check when not generating
    if (!isGenerating) {
      setTimeout(checkAndSavePDFData, 1000)
    }
  }, [isGenerating])

  // ✅ Main loading and data initialization effect
  useEffect(() => {
    // Check if data is available
    const pdfUrl = sessionStorage.getItem('generatedResumePDF')
    const resumeData = sessionStorage.getItem('generatedResume')
    const hasData = pdfUrl || resumeData

    console.log('Main effect triggered:', {
      hasData,
      fromStep2: location.state?.fromStep2,
      loading: location.state?.loading,
      pdfUrl: !!pdfUrl,
      resumeData: !!resumeData
    });

    // ✅ Check if this is a true new submission from Step 2 vs F5 with stale state
    const isNewSubmission = location.state?.fromStep2 && location.state?.loading && !sessionStorage.getItem('step3DataProcessed')
    
    // ✅ Check if coming from Step 2 with new submission (not F5)
    if (isNewSubmission) {
      console.log('Detected NEW submission from Step 2 - resetting all flags');
      
      // Mark that we've processed this submission
      sessionStorage.setItem('step3DataProcessed', 'true')
      
      // Reset ALL flags to initial state for fresh calculation
      setHasCalculatedScores(false);
      setHasCalculatedImprovements(false);
      setIsCalculatingContentPreservation(false);
      setIsCalculatingResumeImprovements(false);
      setIsScorePanelLoading(true);
      setIsEnhancedMetricsLoading(true);
      setIsResumeImprovementsLoading(true);
      
      // Clear API call tracker
      apiCallTracker.clear();
      
      // Clear all calculation-related sessionStorage items since they'll be recalculated
      sessionStorage.removeItem('scorePanelDataReady');
      sessionStorage.removeItem('enhancedAlignmentScore');
      sessionStorage.removeItem('enhancedResumeData');
      sessionStorage.removeItem('enhancedMetricsCalculated');
      sessionStorage.removeItem('contentPreservationScore');
      sessionStorage.removeItem('resumeImprovementsCalculated');
      sessionStorage.removeItem('resumeImprovementsData');
      
      // Reset data states to defaults
      setEnhancedEvaluation(null);
      setContentPreservationScore(88);
      setOverallImprovementScore(90);
      setResumeImprovements({
        original_summary: "",
        enhanced_summary: "",
        improvements: []
      });
      
      console.log('All flags and states reset for new calculation');
    } else {
      // ✅ F5 or direct access - load existing data if available
      console.log('F5 or direct access detected - loading existing data'); 
      const alignmentScoreData = sessionStorage.getItem('enhancedAlignmentScore')
      if (alignmentScoreData) {
        try {
          const parsedData = JSON.parse(alignmentScoreData)
          setEnhancedEvaluation(parsedData)
          
          const calculatedOverallImprovement = calculateOverallImprovement(parsedData)
          setOverallImprovementScore(calculatedOverallImprovement)
          
          setIsScorePanelLoading(false)
          console.log('Loaded enhanced alignment score from sessionStorage')
        } catch (error) {
          console.error('Error parsing enhanced alignment score data:', error)
        }
      }

      const enhancedMetricsReady = sessionStorage.getItem('enhancedMetricsCalculated')
      const contentPreservationData = sessionStorage.getItem('contentPreservationScore')
      if (enhancedMetricsReady === 'true' && contentPreservationData) {
        const preservationScore = parseInt(contentPreservationData)
        setContentPreservationScore(preservationScore)
        setHasCalculatedScores(true)
        setIsEnhancedMetricsLoading(false)
        // ✅ Set API tracker status to completed when loading from sessionStorage
        apiCallTracker.set('content-preservation', 'completed')
        console.log('Loaded content preservation score from sessionStorage:', preservationScore)
      }

      const resumeImprovementsReady = sessionStorage.getItem('resumeImprovementsCalculated')
      const resumeImprovementsData = sessionStorage.getItem('resumeImprovementsData')
      if (resumeImprovementsReady === 'true' && resumeImprovementsData) {
        try {
          const improvementsData = JSON.parse(resumeImprovementsData)
          setResumeImprovements(improvementsData)
          setHasCalculatedImprovements(true)
          setIsResumeImprovementsLoading(false)
          // ✅ Set API tracker status to completed when loading from sessionStorage
          apiCallTracker.set('resume-improvements', 'completed')
          console.log('Loaded resume improvements from sessionStorage')
        } catch (error) {
          console.error('Error parsing resume improvements data:', error)
          // ✅ If improvements data is corrupted, need to recalculate
          setIsResumeImprovementsLoading(true)
          setHasCalculatedImprovements(false)
        }
      }
    }

    // Case 1 - Data available (F5 or direct access) AND not coming from Step 2
    if (hasData && !isNewSubmission) {
      console.log('Case 1: F5 with existing data - loading immediately');
      setIsGenerating(false)
      setProgress(100)
      
      // Check what data is already loaded to set proper loading states
      const alignmentScoreData = sessionStorage.getItem('enhancedAlignmentScore')
      const enhancedMetricsReady = sessionStorage.getItem('enhancedMetricsCalculated')
      const resumeImprovementsReady = sessionStorage.getItem('resumeImprovementsCalculated')
      
      // ✅ Set loading states based on actual data availability
      if (alignmentScoreData) {
        setIsScorePanelLoading(false)
      } else {
        // If no alignment data but we have PDF, we need to start the score panel calculation
        setIsScorePanelLoading(true)
      }
      
      if (enhancedMetricsReady === 'true') {
        setIsEnhancedMetricsLoading(false)
      } else {
        // Keep loading until calculated
        setIsEnhancedMetricsLoading(true)
      }
      
      if (resumeImprovementsReady === 'true') {
        setIsResumeImprovementsLoading(false)
      } else {
        // Keep loading until calculated
        setIsResumeImprovementsLoading(true)
      }
      
      console.log('Loaded existing data - F5 refresh completed', {
        alignmentScoreData: !!alignmentScoreData,
        enhancedMetricsReady,
        resumeImprovementsReady
      });
      
      // ✅ Clear location state to prevent re-triggering on subsequent renders
      if (location.state) {
        window.history.replaceState({}, '', window.location.pathname);
      }
      
      return
    }

    // Case 2 - Coming from Step 2 with loading state OR no data
    if (isNewSubmission || !hasData) {
      console.log('Case 2: New submission or no data - starting progress');
      setIsGenerating(true)
      setProgress(0)
      
      // ✅ Force clear session storage for fresh calculation
      sessionStorage.removeItem('step3DataReady')

      let currentProgress = 0
      let progressInterval
      let checkInterval

      const startProgress = () => {
        progressInterval = setInterval(() => {
          currentProgress += 10
          setProgress(currentProgress)
          
          if (currentProgress >= 90) {
            clearInterval(progressInterval)
            
            checkInterval = setInterval(() => {
              const isDataReady = sessionStorage.getItem('step3DataReady')
              const newPdfUrl = sessionStorage.getItem('generatedResumePDF')
              const newResumeData = sessionStorage.getItem('generatedResume')
              
              if (isDataReady && (newPdfUrl || newResumeData)) {
                setProgress(100)
                setTimeout(() => {
                  setIsGenerating(false)
                  sessionStorage.removeItem('step3DataReady')
                }, 500)
                clearInterval(checkInterval)
              }
            }, 500)
          }
        }, 300)
      }

      startProgress()

      return () => {
        if (progressInterval) clearInterval(progressInterval)
        if (checkInterval) clearInterval(checkInterval)
      }
    }

    // Case 3: Direct access without data and without loading state
    if (!hasData && !location.state?.loading && !location.state?.fromStep2) {
      // User navigated directly to step 3 without going through the flow
      setIsGenerating(false)
      setProgress(100)
      // Set all sections to show appropriate "no data" states
      setIsScorePanelLoading(false)
      setIsEnhancedMetricsLoading(false)
      setIsResumeImprovementsLoading(false)
      console.log('Direct access without data - showing empty state')
      return
    }

    // Case 4: Generate quick loading for direct access with no state info
    setIsGenerating(true)
    setProgress(0)

    let currentProgress = 0
    const quickInterval = setInterval(() => {
      currentProgress += 33
      setProgress(currentProgress)
      
      if (currentProgress >= 100) {
        setIsGenerating(false)
        clearInterval(quickInterval)
      }
    }, 400)

    return () => clearInterval(quickInterval)
  }, [location.state]) // ✅ Depend on location.state to detect navigation from Step 2

  // Component definitions and render logic
  const CircularProgress = ({ percentage, color, label, size = 120 }) => {
    const radius = (size - 20) / 2
    const circumference = radius * 2 * Math.PI
    const strokeDasharray = circumference
    const strokeDashoffset = circumference - (percentage / 100) * circumference

    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ position: 'relative', width: size, height: size }}>
          <svg style={{ transform: 'rotate(-90deg)' }} width={size} height={size}>
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="#e5e7eb"
              strokeWidth="8"
              fill="none"
            />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={color}
              strokeWidth="8"
              fill="none"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              style={{ transition: 'all 1s ease-out' }}
            />
          </svg>
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>{percentage}%</span>
          </div>
        </div>
        <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#111827', marginTop: '12px', textAlign: 'center' }}>
          {label}
        </h3>
      </div>
    )
  }

  const EnhancedMetricsLoadingComponent = () => (
    <div style={{
      background: 'white',
      borderRadius: '20px',
      padding: '32px',
      boxShadow: '0 25px 50px rgba(0,0,0,0.1)',
      border: 'none',
      textAlign: 'center'
    }}>
      <div style={{
        width: '64px',
        height: '64px',
        background: 'linear-gradient(135deg, #10b981, #047857)',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 24px'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid white',
          borderTop: '3px solid transparent',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
      </div>
      
      <h3 style={{ 
        fontSize: '18px', 
        fontWeight: 'bold', 
        color: '#111827', 
        marginBottom: '16px'
      }}>
        📊 Calculating Enhancement Metrics...
      </h3>
      
      <p style={{ fontSize: '14px', color: '#6b7280' }}>
        Comparing original and enhanced resume content...
      </p>
    </div>
  )

  const ScorePanelLoadingComponent = () => (
    <div style={{
      background: 'white',
      borderRadius: '20px',
      padding: '32px',
      boxShadow: '0 25px 50px rgba(0,0,0,0.1)',
      border: 'none',
      textAlign: 'center'
    }}>
      <div style={{
        width: '64px',
        height: '64px',
        background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 24px'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid white',
          borderTop: '3px solid transparent',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
      </div>
      
      <h3 style={{ 
        fontSize: '18px', 
        fontWeight: 'bold', 
        color: '#111827', 
        marginBottom: '16px'
      }}>
        📊 Analyzing Enhanced Resume Quality...
      </h3>
      
      <p style={{ fontSize: '14px', color: '#6b7280' }}>
        Comparing your enhanced resume against job requirements...
      </p>
    </div>
  )

  if (isGenerating) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #eff6ff, #e0e7ff, #f3e8ff)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '96px',
            height: '96px',
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 32px'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              border: '4px solid white',
              borderTop: '4px solid transparent',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
          </div>
          
          <h2 style={{ 
            fontSize: '32px', 
            fontWeight: 'bold', 
            color: '#111827', 
            marginBottom: '32px'
          }}>
            Enhancing Your Resume with AI
          </h2>
          
          <p style={{ 
            fontSize: '18px', 
            color: '#6b7280',
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: '1.6'
          }}>
            Our AI is combining your resume and the additional information to create an enhanced version tailored for your target position.
          </p>
        </div>

        <style>
          {`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #eff6ff, #e0e7ff, #f3e8ff)' }}>
      {/* Loading Protection Indicator */}
      {isAnyProcessRunning && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
          color: 'white',
          padding: '8px 16px',
          borderRadius: '12px',
                   zIndex: 9999,
          fontSize: '14px',
          fontWeight: '600',
          boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          animation: 'pulse 2s infinite'
        }}>
          <div style={{
            width: '8px',
            height: '8px',
            background: '#22c55e',
            borderRadius: '50%',
            animation: 'blink 1s infinite'
          }}></div>
          Calculations in progress...
        </div>
      )}

      {/* Header */}
      <header style={{ 
        background: 'white', 
        borderBottom: '1px solid #e5e7eb',
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto', 
          padding: '0 20px'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            height: '64px'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px'
            }}>
              <div style={{
                width: '32px',
                height: '32px', 
                
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span style={{ color: 'white', fontWeight: 'bold', fontSize: '12px' }}>CV</span>
              </div>
              <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827' }}>CVision</span>
            </div>
            
            <nav style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '32px'
            }}>
              <a href="/" style={{ color: '#374151', fontWeight: '500', textDecoration: 'none' }}>Home</a>
              <a href="/mock-interview" style={{ color: '#374151', fontWeight: '500', textDecoration: 'none' }}>Mock Interview</a>
              <a href="/resume-analysis/step1" style={{ color: '#374151', fontWeight: '500', textDecoration: 'none' }}>Resume Analysis</a>
              <a href="/improve-resume/step1" style={{ color: '#3b82f6', fontWeight: '500', textDecoration: 'none' }}>Improve Resume</a>
            </nav>

            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '16px'
            }}>
              <button 
                onClick={() => navigate('/signin')}
                style={{ 
                  color: '#374151', 
                  fontWeight: '500',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Sign In
              </button>
              <button 
                onClick={() => navigate('/signup')}
                style={{
                  background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                  color: 'white',
                  border: 'none',
                  padding: '8px 20px',
                  borderRadius: '6px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </header>

      <div style={{ 
        maxWidth: '1400px', 
        margin: '0 auto', 
        padding: '48px 20px'
      }}>
        {/* Step Indicator */}
        <div style={{ marginBottom: '48px' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{
                width: '40px',
                height: '40px',
                background: '#10b981',
                color: 'white',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold'
              }}>
                ✓
              </div>
              <span style={{ marginLeft: '12px', color: '#10b981', fontWeight: '600' }}>
                Job Description & Resume
              </span>
            </div>
            
            <div style={{ width: '48px', height: '4px', background: '#10b981', borderRadius: '2px' }}></div>
            
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{
                width: '40px',
                height: '40px',
                background: '#10b981',
                color: 'white',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold'
              }}>
                ✓
              </div>
              <span style={{ marginLeft: '12px', color: '#10b981', fontWeight: '600' }}>
                Supplement Details
              </span>
            </div>
            
            <div style={{ width: '48px', height: '4px', background: '#3b82f6', borderRadius: '2px' }}></div>
            
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{
                width: '40px',
                height: '40px',
                background: '#3b82f6',
                color: 'white',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold'
              }}>
                3
              </div>
              <span style={{ marginLeft: '12px', color: '#3b82f6', fontWeight: '600' }}>
                Enhanced Resume
              </span>
            </div>
          </div>
        </div>

        {/* Success Header */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div style={{
            width: '80px',
            height: '80px',
            background: 'linear-gradient(135deg, #22c55e, #15803d)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px'
          }}>
            <CheckCircle size={40} color="white" />
          </div>
          <h1 style={{ 
            fontSize: '48px', 
            fontWeight: 'bold', 
            color: '#111827', 
            marginBottom: '16px'
          }}>
            🎉 Resume Enhancement Complete!
          </h1>
          <p style={{ 
            fontSize: '20px', 
            color: '#6b7280',
            maxWidth: '700px',
            margin: '0 auto',
            lineHeight: '1.6'
          }}>
            Your resume has been professionally enhanced and optimized for the target position. 
            Download your improved resume and review the enhancement metrics below.
          </p>
        </div>

        {/* Main CTA */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <button 
          onClick={handleDownloadPDF}
          disabled={isDownloading}
          style={{
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            color: 'white',
            border: 'none',
            padding: '24px 48px',
            borderRadius: '20px',
            fontWeight: 'bold',
            fontSize: '24px',
            cursor: isDownloading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            margin: '0 auto',
            boxShadow: '0 20px 40px rgba(24, 16, 185, 0.3)',
            transition: 'all 0.3s ease',
            opacity: isDownloading ? 0.7 : 1
          }}
          onMouseEnter={(e) => {
            if (!isDownloading) {
              e.target.style.transform = 'translateY(-3px)'
              e.target.style.boxShadow = '0 25px 50px rgba(67, 16, 185, 0.4)'
            }
          }}
          onMouseLeave={(e) => {
            if (!isDownloading) {
              e.target.style.transform = 'translateY(0)'
              e.target.style.boxShadow = '0 20px 40px rgba(67, 16, 185,  0.3)'
            }
          }}
          >
            {isDownloading ? (
              <div style={{
                width: '24px',
                height: '24px',
                border: '3px solid white',
                borderTop: '3px solid transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
            ) : (
              <Download size={24} />
            )}
            {isDownloading ? 'Đang tải...' : '📄 Download Enhanced Resume'}
          </button>
        </div>

        <div style={{ 
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: '32px'
        }}>
          {/* Left Column: Score Panel + Metrics Section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {/* Enhanced Score Panel */}
            {isScorePanelLoading ? (
              <ScorePanelLoadingComponent />
            ) : enhancedEvaluation ? (
              <div style={{
                background: 'white',
                borderRadius: '20px',
                padding: '32px',
                boxShadow: '0 25px 50px rgba(0,0,0,0.1)',
                border: 'none'
              }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px', 
                  marginBottom: '24px',
                  justifyContent: 'center'
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <BarChart3 size={20} color="white" />
                  </div>
                  <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827' }}>
                    Enhanced Match Analysis
                  </h2>
                </div>
                
                {calculateScores(enhancedEvaluation).length > 0 ? (
                  calculateScores(enhancedEvaluation).map((score, index) => (
                    <div key={index} style={{ marginBottom: '20px' }}>
                      <div 
                        onClick={() => toggleScore(score.label)}
                        style={{ 
                          cursor: 'pointer',
                          padding: '8px',
                          borderRadius: '8px',
                          background: expandedScores[score.label] ? '#f3f4f6' : 'transparent',
                        }}
                      >
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '8px'
                        }}>
                          <span style={{ color: '#374151', fontWeight: '500', fontSize: '14px' }}>{score.label}</span>
                          <span style={{ 
                            color: score.color, 
                            fontWeight: 'bold',
                            fontSize: '14px'
                          }}>{score.value}/{score.max}</span>
                        </div>
                        <div style={{
                          width: '100%',
                          height: '8px',
                          background: '#e5e7eb',
                          borderRadius: '4px',
                          overflow: 'hidden'
                        }}>
                          <div style={{
                            width: `${(score.value / score.max) * 100}%`,
                            height: '100%',
                            background: score.color,
                            borderRadius: '4px',
                            transition: 'width 1s ease-out'
                          }} />
                        </div>
                      </div>

                      {expandedScores[score.label] && (
                        <div style={{
                          marginTop: '12px',
                          padding: '12px',
                          background: '#f9fafb',
                          borderRadius: '8px',
                          fontSize: '12px'
                        }}>
                          {score.satisfied_requirements.length > 0 && (
                            <>
                              <h4 style={{ color: '#10b981', marginBottom: '8px', fontWeight: '600' }}>✓ Satisfied Requirements</h4>
                              <ul style={{ marginBottom: '12px', paddingLeft: '20px' }}>
                                {score.satisfied_requirements.map((req, i) => (
                                  <li key={i} style={{ color: '#374151', marginBottom: '4px' }}>{req}</li>
                                ))}
                              </ul>
                            </>
                          )}
                          
                          {score.unsatisfied_requirements.length > 0 && (
                            <>
                              <h4 style={{ color: '#ef4444', marginBottom: '8px', fontWeight: '600' }}>✗ Areas for Improvement</h4>
                              <ul style={{ paddingLeft: '20px' }}>
                                {score.unsatisfied_requirements.map((req, i) => (
                                  <li key={i} style={{ color: '#374151', marginBottom: '4px' }}>{req}</li>
                                ))}
                              </ul>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '20px',
                    color: '#6b7280',
                    fontStyle: 'italic'
                  }}>
                    No alignment scores available in the evaluation data.
                  </div>
                )}
              </div>
            ) : (
              <div style={{
                background: '#fef3c7',
                borderRadius: '20px',
                padding: '32px',
                boxShadow: '0 25px 50px rgba(0,0,0,0.1)',
                border: '1px solid #fcd34d'
              }}>
                <h3 style={{ color: '#92400e', marginBottom: '16px' }}>
                  ⚠️ Enhanced Analysis Unavailable
                </h3>
                <p style={{ color: '#b45309', fontSize: '14px' }}>
                  The enhanced resume analysis could not be completed. Your resume was still successfully generated and can be downloaded.
                </p>
              </div>
            )}

            {/* Enhancement Metrics */}
            {isEnhancedMetricsLoading ? (
              <EnhancedMetricsLoadingComponent />
            ) : (
              <div style={{
                background: 'white',
                borderRadius: '20px',
                padding: '32px',
                boxShadow: '0 25px 50px rgba(0,0,0,0.1)',
                border: 'none'
              }}>
                <h2 style={{ 
                  fontSize: '28px', 
                  fontWeight: 'bold', 
                  color: '#111827', 
                  marginBottom: '32px',
                  textAlign: 'center'
                }}>
                  Enhancement Metrics
                </h2>
                
                <div style={{ 
                  display: 'flex',
                  justifyContent: 'center',
                  marginBottom: '32px'
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <CircularProgress 
                      percentage={metrics.contentPreservation} 
                      color="#10b981" 
                      label="Content Preservation"
                    />
                    <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '8px' }}>
                      Your original experience and skills retained
                    </p>
                  </div>
                </div>

                <div style={{ 
                  marginTop: '32px', 
                  paddingTop: '32px',
                  borderTop: '1px solid #e5e7eb'
                }}>
                  <div style={{ 
                    display: 'grid',
                    gridTemplateColumns: '1fr',
                    gap: '24px'
                  }}>
                    <div style={{ 
                      textAlign: 'center', 
                      padding: '16px',
                      background: '#faf5ff',
                      borderRadius: '12px'
                    }}>
                      <div style={{ 
                        fontSize: '32px', 
                        fontWeight: 'bold', 
                        color: '#8b5cf6', 
                        marginBottom: '4px'
                      }}>
                        {metrics.overallImprovement}%
                      </div>
                      <div style={{ fontSize: '14px', fontWeight: '500', color: '#6b21a8' }}>
                        Overall Improvement
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Summary Card */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Summary Card */}
            {isResumeImprovementsLoading ? (
              <div style={{
                background: 'white',
                borderRadius: '20px',
                padding: '32px',
                boxShadow: '0 25px 50px rgba(0,0,0,0.1)',
                border: 'none',
                textAlign: 'center'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 24px'
                }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    border: '3px solid white',
                    borderTop: '3px solid transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                </div>
                
                <h3 style={{ 
                  fontSize: '16px', 
                  fontWeight: 'bold', 
                  color: '#111827', 
                  marginBottom: '16px'
                }}>
                  🎯 Calculating Quality Assessment...
                </h3>
                
                <p style={{ fontSize: '14px', color: '#6b7280' }}>
                  Analyzing improvements and impact...
                </p>
              </div>
            ) : (
              <div style={{
                background: 'white',
                borderRadius: '20px',
                padding: '24px',
                boxShadow: '0 25px 50px rgba(0,0,0,0.1)',
                border: 'none'
              }}>
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px'
                  }}>
                    <TrendingUp size={24} color="white" />
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#111827' }}>
                    Quality Assessment
                  </h3>
                </div>
                
                <div style={{
                  padding: '16px',
                  background: '#ecfdf5',
                  border: '1px solid #a7f3d0',
                  borderRadius: '8px',
                  marginBottom: '16px'
                }}>
                  <h4 style={{ fontWeight: '600', color: '#065f46', marginBottom: '8px' }}>
                    ✅ Key Improvements
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {summary.improvements.slice(0, 3).map((improvement, index) => (
                      <div key={index} style={{ fontSize: '12px', color: '#047857' }}>
                        • {improvement}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div style={{ textAlign: 'center' }}>
                  <div style={{ 
                    fontSize: '28px', 
                    fontWeight: 'bold', 
                    color: '#111827', 
                    marginBottom: '4px'
                  }}>
                    {metrics.overallImprovement}%
                  </div>
                  <div style={{ fontSize: '14px', color: '#6b7280' }}>Overall Enhancement</div>
                  <div style={{
                    width: '100%',
                    background: '#e5e7eb',
                    borderRadius: '50px',
                    height: '8px',
                    marginTop: '8px'
                  }}>
                    <div style={{
                      background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                      height: '8px',
                      borderRadius: '50px',
                      width: `${metrics.overallImprovement}%`,
                      transition: 'width 1s ease-out'
                    }}></div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <button 
              onClick={handleEditInOverleaf}
              style={{
                width: '100%',
                padding: '16px',
                background: 'white',
                color: '#374151',
                border: 'none',
                borderRadius: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.3s ease'
              }}>
                🍃 Edit in Overleaf
              </button>
            </div>
          </div>
        </div>

        {/* Before/After Comparison + Detailed Improvements */}
        {isResumeImprovementsLoading ? (
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '32px',
            boxShadow: '0 25px 50px rgba(0,0,0,0.1)',
            border: 'none',
            textAlign: 'center',
            marginTop: '32px'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                border: '3px solid white',
                borderTop: '3px solid transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
            </div>
            
            <h3 style={{ 
              fontSize: '18px', 
              fontWeight: 'bold', 
              color: '#111827', 
              marginBottom: '16px'
            }}>
              🔍 Analyzing Resume Improvements...
            </h3>
            
            <p style={{ fontSize: '14px', color: '#6b7280' }}>
              Comparing before and after content and identifying key enhancements...
            </p>
          </div>
        ) : (
          <>
            {/* Before/After Comparison */}
            <div style={{
              background: 'white',
              borderRadius: '20px',
              padding: '32px',
              boxShadow: '0 25px 50px rgba(0,0,0,0.1)',
              border: 'none',
              marginTop: '32px'
            }}>
              <h2 style={{ 
                fontSize: '28px', 
                fontWeight: 'bold', 
                color: '#111827', 
                marginBottom: '24px',
                textAlign: 'center'
              }}>
                Before vs After Comparison
              </h2>
              
              <div style={{ 
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '24px'
              }}>
                <div style={{
                  padding: '24px',
                  background: '#fef2f2',
                  border: '2px solid #fecaca',
                  borderRadius: '12px'
                }}>
                  <h3 style={{ 
                    fontWeight: 'bold', 
                    color: '#991b1b', 
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <span style={{
                      width: '24px',
                      height: '24px',
                      background: '#ef4444',
                      color: 'white',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px'
                    }}>
                      ✗
                    </span>
                    Original Summary
                  </h3>
                  <p style={{ 
                    color: '#374151', 
                    fontSize: '14px', 
                    lineHeight: '1.5'
                  }}>
                    {summary.beforeAfter.before}
                  </p>
                </div>
                
                <div style={{
                  padding: '24px',
                  background: '#ecfdf5',
                  border: '2px solid #a7f3d0',
                  borderRadius: '12px'
                }}>
                  <h3 style={{ 
                    fontWeight: 'bold', 
                    color: '#065f46', 
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <span style={{
                      width: '24px',
                      height: '24px',
                      background: '#10b981',
                      color: 'white',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px'
                    }}>
                      ✓
                    </span>
                    Enhanced Summary
                  </h3>
                  <p style={{ 
                    color: '#374151', 
                    fontSize: '14px', 
                    lineHeight: '1.5'
                  }}>
                    {summary.beforeAfter.after}
                  </p>
                </div>
              </div>
            </div>

            {/* What We Enhanced */}
            <div style={{
              background: 'white',
              borderRadius: '20px',
              padding: '32px',
              boxShadow: '0 25px 50px rgba(0,0,0,0.1)',
              border: 'none',
              marginTop: '32px'
            }}>
              <h2 style={{ 
                fontSize: '28px', 
                fontWeight: 'bold', 
                color: '#111827', 
                marginBottom: '24px',
                textAlign: 'center'
              }}>
                What We Enhanced
              </h2>
              
              <div style={{ 
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                gap: '24px'
              }}>
                {summary.improvements.map((improvement, index) => (
                  <div key={index} style={{ 
                    display: 'flex', 
                    alignItems: 'flex-start', 
                    gap: '12px',
                    padding: '16px',
                    background: '#f8fafc',
                    borderRadius: '12px'
                  }}>
                    <div style={{
                      width: '24px',
                      height: '24px',
                      background: '#3b82f6',
                      color: 'white',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      flexShrink: 0,
                      marginTop: '2px'
                    }}>
                      {index + 1}
                    </div>
                    <p style={{ color: '#374151', fontSize: '14px' }}>{improvement}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Action Buttons */}
        <div style={{ 
          display: 'flex',
          gap: '16px',
          marginTop: '48px',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={() => navigate('/improve-resume/step2')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '16px 32px',
              background: 'white',
              border: '2px solid #e5e7eb',
              color: '#374151',
              borderRadius: '12px',
              fontWeight: '600',
              fontSize: '16px',
              cursor: 'pointer'
            }}
          >
            <ArrowLeft size={20} />
            Back to Step 2
          </button>
          
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '16px 48px',
              background: 'linear-gradient(135deg, #10b981, #047857)',
              color: 'white',
              border: 'none',
              borderRadius: '16px',
              fontWeight: 'bold',
              fontSize: '18px',
              cursor: 'pointer',
              boxShadow: '0 10px 25px rgba(16, 185, 129, 0.3)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)'
              e.target.style.boxShadow = '0 15px 35px rgba(16, 185, 129, 0.4)'
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)'
              e.target.style.boxShadow = '0 10px 25px rgba(16, 185, 129, 0.3)'
            }}
          >
            🎉 Finish & Go to Dashboard
          </button>
        </div>
      </div>

      {/* CSS for spin animation */}
      <style>
        {`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
          }
          
          @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.3; }
          }
        `}
      </style>
    </div>
  )
}

export default ImproveResumeStep3