import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { 
  CheckCircle, 
  AlertTriangle, 
  TrendingUp, 
  Award,
  Target,
  Wand2,
  Download,
  ArrowLeft,
  BarChart3,
  ChevronDown
} from 'lucide-react'
import axios from 'axios'
import API_CONFIG from '../config/api'

const ResumeAnalysisStep2 = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [progress, setProgress] = useState(0);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [expandedScores, setExpandedScores] = useState({});
  const [percentage] = useState(78);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDownloadingReport, setIsDownloadingReport] = useState(false);
  const [user, setUser] = useState(null); // Add user state for dropdown
  const [dropdownVisible, setDropdownVisible] = useState(false); // Add dropdown visibility state
  // Removed save status state
  const navigate = useNavigate();
  const location = useLocation()

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // ✅ Effect to prevent F5 reload when loading or analyzing
  useEffect(() => {
    const anyLoading = loading || isAnalyzing;

    const handleBeforeUnload = (e) => {
      if (anyLoading) {
        e.preventDefault()
        e.returnValue = 'Resume analysis is still in progress. Are you sure you want to leave?'
        return 'Resume analysis is still in progress. Are you sure you want to leave?'
      }
    }

    const handleKeyDown = (e) => {
      // Prevent F5 when any loading is in progress
      if (e.key === 'F5' || (e.ctrlKey && e.key === 'r') || (e.metaKey && e.key === 'r')) {
        if (anyLoading) {
          e.preventDefault()
          e.stopPropagation()
          console.log('F5 prevented - processing in progress:', {
            loading,
            isAnalyzing
          })
          
          // Show a notification
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
          
          let statusText = 'Processing: ';
          if (loading) {
            statusText += 'Loading analysis data';
          } else if (isAnalyzing) {
            statusText += 'Analyzing your resume';
          }
          
          notification.innerHTML = `
            <div style="margin-bottom: 12px; font-size: 24px;">⚠️</div>
            <div style="margin-bottom: 8px; font-size: 18px; font-weight: bold;">Please Wait!</div>
            <div style="margin-bottom: 12px; font-size: 14px; color: #b45309;">
              Resume analysis is still in progress
            </div>
            <div style="font-size: 12px; color: #78350f; font-weight: normal;">
              ${statusText}
            </div>
          `
          
          document.body.appendChild(notification)
          
          // Add animation
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
          }, 3000)
          
          return false
        }
      }
    }

    // Also prevent Ctrl+Shift+R (hard reload)
    const handleKeyUp = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'R' && anyLoading) {
        e.preventDefault()
        e.stopPropagation()
        console.log('Hard reload prevented - analysis in progress')
        return false
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    window.addEventListener('keydown', handleKeyDown, true)
    window.addEventListener('keyup', handleKeyUp, true)
    document.addEventListener('keydown', handleKeyDown, true)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      window.removeEventListener('keydown', handleKeyDown, true)
      window.removeEventListener('keyup', handleKeyUp, true)
      document.removeEventListener('keydown', handleKeyDown, true)
    }
  }, [loading, isAnalyzing])

  const calculateScores = (data) => {
    if (!data || !data.alignment_scores) return [];
    
    return Object.entries(data.alignment_scores).map(([key, value]) => {
      const satisfied = value.satisfied_requirements.length;
      const unsatisfied = value.unsatisfied_requirements.length;
      const total = satisfied + unsatisfied;
      
      return {
        label: key,
        value: satisfied,
        max: total || satisfied, // If total is 0, use satisfied as max
        color: getScoreColor(satisfied / (total || satisfied)),
        satisfied_requirements: value.satisfied_requirements,
        unsatisfied_requirements: value.unsatisfied_requirements
      };
    });
  };

  const getScoreColor = (percentage) => {
    if (percentage <= 0.5) {
      // Transition from red to orange
      const red = 255;
      const green = Math.round(percentage * 2 * 200); // Scale green from 0 to 200
      return `rgb(${red}, ${green}, 0)`;
    } else {
      // Transition from orange to green
      const red = Math.round((1 - percentage) * 2 * 255); // Scale red from 255 to 0
      const green = 200; // Maximum green value is now 200
      return `rgb(${red}, ${green}, 0)`;
    }
  };

  const toggleScore = (label) => {
    setExpandedScores(prev => ({
      ...prev,
      [label]: !prev[label]
    }));
  };

  useEffect(() => {
    const processAnalysisData = () => {
      const storedAnalysisResult = sessionStorage.getItem('analysisResults');
      
      if (storedAnalysisResult) {
        try {
          const analysisData = JSON.parse(storedAnalysisResult);
          
          // Validate analysis data structure
          if (!analysisData.alignment_scores || !analysisData.cv_comment) {
            setError('Invalid analysis data structure. Please try again.');
            setLoading(false);
            setIsAnalyzing(false);
            return;
          }
          
          // Set the analysis results
          setAnalysisResults(analysisData);
          setLoading(false);
          setIsAnalyzing(false);
          
        } catch (parseError) {
          console.error('Failed to parse analysis data:', parseError);
          setError('Failed to parse analysis data. Please try again.');
          setLoading(false);
          setIsAnalyzing(false);
        }
      } else {
        // ✅ No analysis data found - redirect to step 1 immediately
        console.log('No analysis data found, redirecting to step 1');
        navigate('/resume-analysis/step1');
      }
    };

    // ✅ Always process data when component mounts
    processAnalysisData();
  }, [navigate]);

  const CircularProgress = ({ percentage, color, size = 160 }) => {
    const radius = (size - 24) / 2
    const circumference = radius * 2 * Math.PI
    const strokeDasharray = circumference
    const strokeDashoffset = circumference - (percentage / 100) * circumference

    return (
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg 
          style={{ transform: 'rotate(-90deg)' }} 
          width={size} 
          height={size}
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#e5e7eb"
            strokeWidth="12"
            fill="none"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth="12"
            fill="none"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{ transition: 'all 2s ease-out' }}
          />
        </svg>
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <span style={{ fontSize: '32px', fontWeight: 'bold', color: '#111827' }}>{percentage}%</span>
          <span style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>Match Score</span>
        </div>
      </div>
    )
  }

  // ✅ Helper functions for blob data management (similar to ImproveResumeStep3)
  const saveReportBlobData = async (blob) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = function() {
        sessionStorage.setItem('analysisReportPDFData', reader.result);
        resolve(reader.result);
      };
      reader.readAsDataURL(blob);
    });
  };

  const restoreReportBlobFromData = async () => {
    const base64Data = sessionStorage.getItem('analysisReportPDFData');
    if (base64Data) {
      try {
        const response = await fetch(base64Data);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        sessionStorage.setItem('analysisReportPDF', url);
        return url;
      } catch (error) {
        console.error('Error restoring report blob from base64 data:', error);
        return null;
      }
    }
    return null;
  };

  // ✅ PDF download handler
  const handleDownloadReport = async () => {
    if (isDownloadingReport) return
    
    setIsDownloadingReport(true)
    
    try {
      let reportUrl = sessionStorage.getItem('analysisReportPDF')
      
      // ✅ Check if blob URL is still valid after F5
      if (reportUrl && reportUrl.startsWith('blob:')) {
        try {
          const testResponse = await fetch(reportUrl);
          if (!testResponse.ok) {
            throw new Error('Blob URL expired');
          }
        } catch (error) {
          console.log('Report blob URL expired after F5, trying to restore from base64 data...');
          
          // Try to restore from base64 data
          const restoredUrl = await restoreReportBlobFromData();
          if (restoredUrl) {
            reportUrl = restoredUrl;
            console.log('Successfully restored report blob URL from base64 data');
          } else {
            reportUrl = null; // Force regeneration
          }
        }
      }
      
      // ✅ If we have a valid report URL, use it directly
      if (reportUrl) {
        const timestamp = new Date().toISOString().slice(0, 19).replace(/[-:]/g, '').replace('T', '_')
        const filename = `resume_analysis_report_${timestamp}.pdf`
        
        const link = document.createElement('a')
        link.href = reportUrl
        link.download = filename
        link.style.display = 'none'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        return
      }

      // ✅ Fallback: Try to restore from base64 data if no URL available
      if (!reportUrl) {
        console.log('No report URL available, trying to restore from base64 data...');
        const restoredUrl = await restoreReportBlobFromData();
        if (restoredUrl) {
          const timestamp = new Date().toISOString().slice(0, 19).replace(/[-:]/g, '').replace('T', '_')
          const filename = `resume_analysis_report_${timestamp}.pdf`
          
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

      // ✅ Final fallback: Regenerate report from analysis results
      if (!reportUrl && analysisResults) {
        console.log('Regenerating report from analysis results...');
        
        const reportResponse = await axios.post(`${API_CONFIG.BASE_URL}${API_CONFIG.RESUME.GENERATE_REPORT_PDF}`, {
          alignment_scores: analysisResults.alignment_scores,
          cv_comment: analysisResults.cv_comment,
          resume_data: analysisResults.resume_data,
          job_data: analysisResults.job_data
        }, {
          headers: {
            'Content-Type': 'application/json',
          },
          responseType: 'blob'
        });
        
        const reportBlob = new Blob([reportResponse.data], { type: 'application/pdf' });
        const newReportUrl = window.URL.createObjectURL(reportBlob);
        
        // Save for future use
        sessionStorage.setItem('analysisReportPDF', newReportUrl);
        await saveReportBlobData(reportBlob);
        
        const timestamp = new Date().toISOString().slice(0, 19).replace(/[-:]/g, '').replace('T', '_')
        const filename = `resume_analysis_report_${timestamp}.pdf`
        
        const link = document.createElement('a')
        link.href = newReportUrl
        link.download = filename
        link.style.display = 'none'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        return
      }

      // ✅ Show error if all methods fail
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
          <div style="margin-bottom: 8px; font-size: 18px; font-weight: bold;">Report Download Issue</div>
          <div style="margin-bottom: 12px; font-size: 14px; line-height: 1.5;">
            ${message}
          </div>
          <div style="font-size: 12px; color: ${type === 'error' ? '#7f1d1d' : '#064e3b'}; font-weight: normal;">
            You can try analyzing a new resume to generate a fresh report.
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
        'The report PDF is temporarily unavailable after page refresh. Please try analyzing again to generate a fresh report.',
        'error'
      )

    } catch (error) {
      console.error('Error downloading report:', error)
      alert('Error downloading report. Please try again.')
    } finally {
      setIsDownloadingReport(false)
    }
  }

  // Removed save analysis result related code

  if (isAnalyzing) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #eff6ff, #e0e7ff, #f3e8ff)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center', maxWidth: '500px' }}>
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
            fontSize: '36px', 
            fontWeight: 'bold', 
            color: '#111827', 
            marginBottom: '32px'
          }}>
            🔍 Analyzing Your Resume
          </h2>
          
          <p style={{ 
            fontSize: '18px', 
            color: '#6b7280',
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: '1.6'
          }}>
            Our AI is analyzing your resume and comparing it against the job requirements to provide detailed insights.
          </p>
        </div>

        <style>
          {`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
            
            @keyframes pulse {
              0%, 100% { opacity: 0.2; }
              50% { opacity: 1; }
            }
          `}
        </style>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #eff6ff, #e0e7ff, #f3e8ff)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center', maxWidth: '500px' }}>
          <div style={{
            width: '96px',
            height: '96px',
            background: '#fee2e2',
            borderRadius: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 32px',
            animation: 'shake 0.5s ease-in-out'
          }}>
            <AlertTriangle size={48} color="#dc2626" />
          </div>
          <h2 style={{ 
            fontSize: '36px', 
            fontWeight: 'bold', 
            color: '#111827', 
            marginBottom: '16px'
          }}>
            ⚠️ Access Denied
          </h2>
          <p style={{ 
            fontSize: '20px', 
            color: '#6b7280',
            marginBottom: '32px',
            lineHeight: '1.6',
            maxWidth: '500px',
            margin: '0 auto 32px'
          }}>
            {error || 'You need to complete Step 1 first before accessing the analysis results.'}
          </p>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px'
          }}>
            <button
              onClick={() => navigate('/resume-analysis/step1')}
              style={{
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                color: 'white',
                border: 'none',
                padding: '16px 32px',
                borderRadius: '12px',
                fontWeight: '600',
                fontSize: '18px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 10px 25px rgba(59, 130, 246, 0.3)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 15px 35px rgba(59, 130, 246, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 10px 25px rgba(59, 130, 246, 0.3)';
              }}
            >
              <ArrowLeft size={24} />
              Go to Resume Analysis Step 1
            </button>
            <p style={{ 
              fontSize: '14px', 
              color: '#6b7280',
              textAlign: 'center' 
            }}>
              You will be automatically redirected in 2 seconds...
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #eff6ff, #e0e7ff, #f3e8ff)'
    }}>
      {/* Header */}
      <header style={{ 
        background: 'white', 
        borderBottom: '1px solid #e5e7eb',
        position: 'sticky',
        top: 0,
        zIndex: 50
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
                width: '40px',
                height: '40px', 
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer' // Add pointer cursor
              }}
              onClick={() => navigate('/')} // Navigate to home
              >
                <span style={{ color: 'white', fontWeight: 'bold' }}>CV</span>
              </div>
              <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>CVision</span>
            </div>
            
            <nav style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '32px',
              userSelect: 'none' // Disable text selection
            }}>
              <a href="/" style={{ color: '#374151', fontWeight: '500', textDecoration: 'none' }}>Home</a>
              <a href="/mock-interview" style={{ color: '#374151', fontWeight: '500', textDecoration: 'none' }}>Mock Interview</a>
              <a href="/resume-analysis/step1" style={{ color: '#3b82f6', fontWeight: '500', textDecoration: 'none' }}>Resume Analysis</a>
              <a href="/improve-resume/step1" style={{ color: '#374151', fontWeight: '500', textDecoration: 'none' }}>Improve Resume</a>
            </nav>

            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '16px',
              position: 'relative' // Added for dropdown positioning
            }}>
              {user ? (
                <>
                  <div 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px', 
                      padding: '8px 12px', 
                      border: '1px solid #e5e7eb', 
                      borderRadius: '12px', 
                      cursor: 'pointer', 
                      transition: 'background-color 0.2s ease',
                      userSelect: 'none',
                      boxShadow: dropdownVisible ? '0 2px 4px rgba(0, 0, 0, 0.1)' : 'none'
                    }}
                    onClick={() => setDropdownVisible(!dropdownVisible)}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    ref={(el) => {
                      if (el && dropdownVisible) {
                        const dropdown = document.getElementById('dropdown-menu');
                        if (dropdown) {
                          dropdown.style.width = `${el.offsetWidth}px`; // Dynamically set dropdown width
                        }
                      }
                    }}
                  >
                    <span style={{ color: '#374151', fontWeight: '500' }}>
                      Welcome, {user.full_name || 'User'}
                    </span>
                    <ChevronDown size={16} color="#374151" />
                  </div>
                  {dropdownVisible && (
                    <div
                      id="dropdown-menu"
                      style={{
                        position: 'absolute',
                        top: '100%',
                        right: 0,
                        background: 'white',
                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        zIndex: 100,
                        animation: 'fadeIn 0.2s ease-in-out'
                      }}
                    >
                      <button 
                        onClick={() => {
                          navigate('/dashboard');
                          setDropdownVisible(false);
                        }}
                        style={{
                          display: 'block',
                          width: '100%',
                          padding: '10px 16px',
                          textAlign: 'left',
                          background: 'none',
                          border: 'none',
                          color: '#374151',
                          cursor: 'pointer',
                          fontWeight: '500',
                          fontSize: '14px',
                          lineHeight: '1.6',
                          transition: 'background-color 0.2s ease',
                          userSelect: 'none'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        Dashboard
                      </button>
                      <hr style={{ margin: 0, border: 'none', borderTop: '1px solid #e5e7eb' }} />
                      <button 
                        onClick={() => {
                          localStorage.clear();
                          setUser(null);
                          // Removed navigation on logout
                          setDropdownVisible(false);
                        }}
                        style={{
                          display: 'block',
                          width: '100%',
                          padding: '10px 16px',
                          textAlign: 'left',
                          background: 'none',
                          border: 'none',
                          color: '#374151',
                          cursor: 'pointer',
                          fontWeight: '500',
                          fontSize: '14px',
                          lineHeight: '1.6',
                          transition: 'background-color 0.2s ease',
                          userSelect: 'none'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        Log Out
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <button 
                    onClick={() => navigate('/signin', { state: { from: '/resume-analysis/step2' } })}
                    style={{ 
                      color: '#374151', 
                      fontWeight: '500',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '8px 16px'
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
                      padding: '12px 24px',
                      borderRadius: '8px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <div style={{ 
        maxWidth: '1400px', 
        margin: '0 auto', 
        padding: '48px 20px'
      }}>
        {/* Success Header */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            background: '#d1fae5',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px'
          }}>
            <CheckCircle size={32} color="#10b981" />
          </div>
          <h1 style={{ 
            fontSize: '48px', 
            fontWeight: 'bold', 
            color: '#111827', 
            marginBottom: '16px'
          }}>
            📊 Analysis Complete!
          </h1>
          <p style={{ fontSize: '20px', color: '#6b7280' }}>
            Here's how your resume performs against the target job requirements
          </p>
        </div>

        <div style={{ 
          display: 'grid',
          gridTemplateColumns: '1fr 2fr',
          gap: '32px',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          {/* Score Panel */}
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '32px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
            height: 'fit-content'
          }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', marginBottom: '24px', textAlign: 'center' }}>
              Resume Match Analysis
            </h2>
            
            {calculateScores(analysisResults).map((score, index) => (
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
                    <span style={{ color: '#374151', fontWeight: '500' }}>{score.label}</span>
                    <span style={{ 
                      color: score.color, 
                      fontWeight: 'bold'
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
                    fontSize: '14px'
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
            ))}


          </div>

          {/* Feedback Panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Strengths */}
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '32px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px', 
                marginBottom: '24px'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  background: '#d1fae5',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <CheckCircle size={20} color="#10b981" />
                </div>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>
                  ✅ Key Strengths
                </h2>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {analysisResults?.cv_comment?.advantages.map((strength, index) => (
                  <div key={index} style={{ 
                    display: 'flex', 
                    alignItems: 'flex-start', 
                    gap: '12px',
                    padding: '16px',
                    background: '#ecfdf5',
                    borderRadius: '12px',
                    borderLeft: '4px solid #10b981'
                  }}>
                    <div style={{
                      width: '24px',
                      height: '24px',
                      background: '#10b981',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '2px'
                    }}>
                      <CheckCircle size={14} color="white" />
                    </div>
                    <p style={{ color: '#1f2937', fontWeight: '500' }}>{strength}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Areas for Improvement */}
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '32px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px', 
                marginBottom: '24px'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  background: '#fed7aa',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <AlertTriangle size={20} color="#f59e0b" />
                </div>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>
                  🔧 Areas for Improvement
                </h2>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {analysisResults?.cv_comment?.disadvantages.map((improvement, index) => (
                  <div key={index} style={{ 
                    display: 'flex', 
                    alignItems: 'flex-start', 
                    gap: '12px',
                    padding: '16px',
                    background: '#fef3c7',
                    borderRadius: '12px',
                    borderLeft: '4px solid #f59e0b'
                  }}>
                    <div style={{
                      width: '24px',
                      height: '24px',
                      background: '#f59e0b',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '2px'
                    }}>
                      <AlertTriangle size={14} color="white" />
                    </div>
                    <p style={{ color: '#1f2937', fontWeight: '500' }}>{improvement}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ 
          display: 'flex',
          gap: '24px',
          justifyContent: 'center',
          marginTop: '48px',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={() => {
              // ✅ Clear analysis data when going back to step 1
              sessionStorage.removeItem('analysisResults');
              console.log('Cleared analysis results when going back to step 1');
              navigate('/resume-analysis/step1')
            }}
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
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => e.target.style.borderColor = '#d1d5db'}
            onMouseLeave={(e) => e.target.style.borderColor = '#e5e7eb'}
          >
            <ArrowLeft size={20} />
            Analyze Different Resume
          </button>
          
          <button
            onClick={() => {
              // Chuyển thẳng đến step 2 và giữ lại analysis results
              navigate('/improve-resume/step2', { 
                state: { 
                  fromAnalysis: true,
                  loading: false 
                }
              });
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '20px 48px',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: 'white',
              border: 'none',
              borderRadius: '16px',
              fontWeight: 'bold',
              fontSize: '20px',
              cursor: 'pointer',
              boxShadow: '0 10px 25px rgba(16, 185, 129, 0.3)',
              animation: 'pulse 2s infinite',
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
            <Wand2 size={24} />
            Enhance Resume Now
          </button>
          
          <button 
            onClick={handleDownloadReport}
            disabled={isDownloadingReport}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '16px 32px',
              background: 'white',
              border: '2px solid #dbeafe',
              color: '#1d4ed8',
              borderRadius: '12px',
              fontWeight: '600',
              fontSize: '16px',
              cursor: isDownloadingReport ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              opacity: isDownloadingReport ? 0.7 : 1
            }}
            onMouseEnter={(e) => {
              if (!isDownloadingReport) {
                e.target.style.borderColor = '#93c5fd'
                e.target.style.background = '#eff6ff'
              }
            }}
            onMouseLeave={(e) => {
              if (!isDownloadingReport) {
                e.target.style.borderColor = '#dbeafe'
                e.target.style.background = 'white'
              }
            }}
          >
            {isDownloadingReport ? (
              <div style={{
                width: '20px',
                height: '20px',
                border: '3px solid #1d4ed8',
                borderTop: '3px solid transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
            ) : (
              <Download size={20} />
            )}
            {isDownloadingReport ? 'Downloading...' : 'Download Report'}
          </button>
        </div>
      </div>
      
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

          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
            20%, 40%, 60%, 80% { transform: translateX(5px); }
          }
        `}
      </style>
    </div>
  )
}

export default ResumeAnalysisStep2