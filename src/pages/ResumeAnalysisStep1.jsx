import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, FileText, Briefcase, ArrowRight, BarChart3, CheckCircle, ChevronDown } from 'lucide-react'
import axios from 'axios';
import API_CONFIG from '../config/api'

const ResumeAnalysisStep1 = () => {
  const [jobDescription, setJobDescription] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [user, setUser] = useState(null); // Add user state for dropdown
  const [dropdownVisible, setDropdownVisible] = useState(false); // Add dropdown visibility state
  const [userFiles, setUserFiles] = useState({ resume_id: null, jd_text: null });
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      
      // Fetch user files
      const fetchUserFiles = async () => {
        setIsLoadingFiles(true);
        const token = localStorage.getItem("access_token");
        try {
          const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.USERDB.USERFILES}${userData.id}`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            throw new Error("Failed to fetch user files");
          }

          const data = await response.json();
          setUserFiles({
            resume_id: data.resume_id,
            jd_text: data.jd_text
          });
        } catch (err) {
          console.error("Error fetching user files:", err);
        } finally {
          setIsLoadingFiles(false);
        }
      };

      fetchUserFiles();
    }
  }, []);

  // ✅ Effect to prevent F5 reload when submitting
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isSubmitting) {
        e.preventDefault()
        e.returnValue = 'Resume analysis is still in progress. Are you sure you want to leave?'
        return 'Resume analysis is still in progress. Are you sure you want to leave?'
      }
    }

    const handleKeyDown = (e) => {
      // Prevent F5 when analyzing
      if (e.key === 'F5' || (e.ctrlKey && e.key === 'r') || (e.metaKey && e.key === 'r')) {
        if (isSubmitting) {
          e.preventDefault()
          e.stopPropagation()
          console.log('F5 prevented - resume analysis in progress')
          
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
          
          notification.innerHTML = `
            <div style="margin-bottom: 12px; font-size: 24px;">⚠️</div>
            <div style="margin-bottom: 8px; font-size: 18px; font-weight: bold;">Please Wait!</div>
            <div style="margin-bottom: 12px; font-size: 14px; color: #b45309;">
              Resume analysis is still in progress
            </div>
            <div style="font-size: 12px; color: #78350f; font-weight: normal;">
              Analyzing your resume against job requirements...
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
      if (e.ctrlKey && e.shiftKey && e.key === 'R' && isSubmitting) {
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
  }, [isSubmitting])

  // ✅ Clear all resume analysis data when component mounts
  useEffect(() => {
    // Clear all related sessionStorage data to ensure fresh start
    const keysToRemove = [
      'analysisResults',
      'analysisComplete',
      'analysisError'
    ];
    
    keysToRemove.forEach(key => sessionStorage.removeItem(key));
    
    // Reset all state to initial values
    setJobDescription('');
    setResumeFile(null);
    setIsSubmitting(false);
    
    console.log('Cleared resume analysis session storage data');
  }, []); // Only run on mount

  const handleFileUpload = (file) => {
    if (file && (file.type === 'application/pdf' || file.name.endsWith('.doc') || file.name.endsWith('.docx'))) {
      setResumeFile(file)
    }
  }

  const handleUseExistingResume = async () => {
    if (!userFiles.resume_id) return;
    
    const token = localStorage.getItem("access_token");
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.USERDB.DOWNLOADRESUME}${user.id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });

      if (!response.ok) {
        throw new Error("Failed to fetch resume");
      }

      const blob = await response.blob();
      const file = new File([blob], "your-resume.pdf", { type: "application/pdf" });
      setResumeFile(file);
    } catch (err) {
      console.error("Error fetching resume:", err);
    }
  }

  const handleUseExistingJD = () => {
    if (userFiles.jd_text) {
      setJobDescription(userFiles.jd_text);
    }
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = [...e.dataTransfer.files]
    if (files && files[0]) {
      handleFileUpload(files[0])
    }
  }

  const handleAnalyze = async () => {
    if (jobDescription.trim() && resumeFile) {
      setIsSubmitting(true)
      setLoadingProgress(0) // ✅ Reset progress
      
      const formData = new FormData();
      formData.append('job_description', jobDescription);
      formData.append('resume_file', resumeFile);

      try {
        console.log('Starting API call...');
        
        // ✅ Slower progress for first API call - 20 seconds to reach 80%
        const progressInterval = setInterval(() => {
          setLoadingProgress(prev => {
            if (prev < 75) {
              return prev + Math.random() * 6; // Slower increment (was 10, now 6)
            }
            return prev;
          });
        }, 1000); // Longer interval (was 200ms, now 1000ms)

        const response = await axios.post(`${API_CONFIG.BASE_URL}${API_CONFIG.RESUME.EVALUATE_CV}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        clearInterval(progressInterval);
        setLoadingProgress(80); // ✅ Set to 80% after first API completes

        console.log('API response received:', response.data);
        
        // ✅ Lưu kết quả vào sessionStorage
        sessionStorage.setItem('analysisResults', JSON.stringify(response.data));
        
        console.log('Saved results to sessionStorage');
        
        // ✅ Generate PDF report and store in sessionStorage
        try {
          console.log('Generating PDF report...');
          
          // ✅ Slower progress for second API call - 5 seconds to reach 100%
          const reportProgressInterval = setInterval(() => {
            setLoadingProgress(prev => {
              if (prev < 95) {
                return prev + Math.random() * 2; // Slower increment (was 5, now 2)
              }
              return prev;
            });
          }, 500); // Longer interval (was 150ms, now 500ms)

          const reportResponse = await axios.post(`${API_CONFIG.BASE_URL}${API_CONFIG.RESUME.GENERATE_REPORT_PDF}`, {
            alignment_scores: response.data.alignment_scores,
            cv_comment: response.data.cv_comment,
            resume_data: response.data.resume_data,
            job_data: response.data.job_data
          }, {
            headers: {
              'Content-Type': 'application/json',
            },
            responseType: 'blob'
          });
          
          clearInterval(reportProgressInterval);
          setLoadingProgress(100); // ✅ Set to 100% after second API completes
          
          console.log('PDF report generated successfully');
          
          // Create blob URL and store in sessionStorage
          const reportBlob = new Blob([reportResponse.data], { type: 'application/pdf' });
          const reportUrl = window.URL.createObjectURL(reportBlob);
          sessionStorage.setItem('analysisReportPDF', reportUrl);
          
          // Also save as base64 for F5 recovery
          const reader = new FileReader();
          reader.onload = function() {
            sessionStorage.setItem('analysisReportPDFData', reader.result);
          };
          reader.readAsDataURL(reportBlob);
          
          console.log('PDF report stored in sessionStorage');

          // Save analysis result if user is logged in
          if (user) {
            try {
              const token = localStorage.getItem("access_token");
              if (token) {
                // Calculate total score
                const alignmentScores = response.data.alignment_scores;
                let totalSatisfied = 0;
                let totalRequirements = 0;

                Object.values(alignmentScores).forEach(category => {
                  totalSatisfied += category.satisfied_requirements.length;
                  totalRequirements += category.satisfied_requirements.length + category.unsatisfied_requirements.length;
                });

                // Calculate score as percentage
                const scorePercentage = Math.round((totalSatisfied / totalRequirements) * 100);
                const score = scorePercentage.toString(); // Convert to string for FormData

                // Create form data with the newly generated report
                const formData = new FormData();
                formData.append('user_id', user.id);
                formData.append('score', score);
                formData.append('report', new File([reportResponse.data], 'analysis_report.pdf', { type: 'application/pdf' }));

                // Save analysis result
                const saveResponse = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.USERDB.SAVEANALYSISRESULT}`, {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${token}`
                  },
                  body: formData
                });

                if (!saveResponse.ok) {
                  console.error('Failed to save analysis result');
                } else {
                  console.log('Analysis result saved successfully');
                }
              }
            } catch (saveError) {
              console.error('Error saving analysis result:', saveError);
            }
          }
        } catch (reportError) {
          console.error('Error generating PDF report:', reportError);
          // Don't block the main flow if report generation fails
          setLoadingProgress(100); // ✅ Still set to 100% even if report fails
        }

          // ✅ Small delay to show 100% completion
          setTimeout(() => {
            // ✅ Navigate to Step 2 AFTER API completes successfully
            navigate('/resume-analysis/step2', { state: { loading: false } });
          }, 1000); // Longer delay to show completion (was 500ms, now 1000ms)
        
      } catch (error) {
        console.error('Error analyzing resume:', error);
        alert('Failed to analyze resume. Please try again.');
        setIsSubmitting(false);
        setLoadingProgress(0); // ✅ Reset progress on error
      }
    }
  }

  // ✅ Enhanced loading screen with progress bar
  if (isSubmitting) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #eff6ff, #e0e7ff, #f3e8ff)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {/* Loading Protection Indicator */}
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
          Analyzing resume...
        </div>

        <div style={{ textAlign: 'center', maxWidth: '600px', width: '100%', padding: '0 20px' }}>
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
            marginBottom: '16px'
          }}>
            🔍 Analyzing Resume...
          </h2>
          
          <p style={{ 
            fontSize: '18px', 
            color: '#6b7280',
            lineHeight: '1.6',
            marginBottom: '32px'
          }}>
            Our AI is analyzing your resume and comparing it against the job requirements to provide detailed insights.
          </p>

          {/* ✅ Progress Bar */}
          <div style={{
            width: '100%',
            maxWidth: '400px',
            margin: '0 auto 24px',
            background: 'white',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px'
            }}>
              <span style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#374151'
              }}>
                Progress
              </span>
              <span style={{
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#3b82f6'
              }}>
                {Math.round(loadingProgress)}%
              </span>
            </div>
            
            <div style={{
              width: '100%',
              height: '12px',
              background: '#e5e7eb',
              borderRadius: '6px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${loadingProgress}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
                borderRadius: '6px',
                transition: 'width 0.3s ease',
                boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)'
              }} />
            </div>
            
            <div style={{
              marginTop: '16px',
              fontSize: '14px',
              color: '#6b7280',
              textAlign: 'center'
            }}>
              {loadingProgress < 80 
                ? '📄 Analyzing resume content...' 
                : loadingProgress < 100 
                  ? '📊 Generating detailed report...'
                  : '✅ Analysis complete!'}
            </div>
          </div>

          {/* ✅ Step indicators */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '16px',
            marginTop: '24px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              background: loadingProgress >= 80 ? '#d1fae5' : '#eff6ff',
              borderRadius: '8px',
              border: `2px solid ${loadingProgress >= 80 ? '#10b981' : '#3b82f6'}`
            }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: loadingProgress >= 80 ? '#10b981' : '#3b82f6'
              }} />
              <span style={{
                fontSize: '12px',
                fontWeight: '600',
                color: loadingProgress >= 80 ? '#065f46' : '#1e40af'
              }}>
                Resume Analysis
              </span>
            </div>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              background: loadingProgress >= 100 ? '#d1fae5' : '#f3f4f6',
              borderRadius: '8px',
              border: `2px solid ${loadingProgress >= 100 ? '#10b981' : '#d1d5db'}`
            }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: loadingProgress >= 100 ? '#10b981' : '#9ca3af'
              }} />
              <span style={{
                fontSize: '12px',
                fontWeight: '600',
                color: loadingProgress >= 100 ? '#065f46' : '#6b7280'
              }}>
                Report Generation
              </span>
            </div>
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
          `}
        </style>
      </div>
    )}

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #eff6ff, #e0e7ff, #f3e8ff)' }}>
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
              <div 
                style={{
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
                    onClick={() => navigate('/signin', { state: { from: '/resume-analysis/step1' } })}
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
        maxWidth: '1000px', 
        margin: '0 auto', 
        padding: '48px 20px'
      }}>
        {/* Header Section */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            boxShadow: '0 10px 25px rgba(59, 130, 246, 0.3)'
          }}>
            <BarChart3 size={32} color="white" />
          </div>
          <h1 style={{ 
            fontSize: '48px', 
            fontWeight: 'bold', 
            color: '#111827', 
            marginBottom: '16px'
          }}>
            Resume Analysis
          </h1>
          <p style={{ 
            fontSize: '20px', 
            color: '#6b7280',
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: '1.6'
          }}>
            Get detailed insights about how well your resume matches your target job. 
            Our AI will analyze compatibility and provide actionable feedback.
          </p>
        </div>

        {/* Main Content */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '40px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
          border: 'none'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
            {/* Job Description Section */}
            <div>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px', 
                marginBottom: '16px'
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  background: '#dbeafe',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Briefcase size={18} color="#3b82f6" />
                </div>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>
                  Target Job Description
                </h2>
              </div>
              
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job description of the position you're targeting...

We're looking for a Senior Software Engineer with expertise in:
• 5+ years of experience in full-stack development
• Proficiency in React, Node.js, and Python
• Experience with AWS cloud services
• Strong background in database design and optimization
• Leadership experience in agile development teams"
                rows="8"
                style={{
                  width: '100%',
                  padding: '16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  fontSize: '16px',
                  lineHeight: '1.6',
                  resize: 'none',
                  outline: 'none',
                  fontFamily: 'inherit'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6'
                  e.target.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.1)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb'
                  e.target.style.boxShadow = 'none'
                }}
              />
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginTop: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <span style={{ fontSize: '14px', color: '#6b7280' }}>
                    {jobDescription.length} characters
                  </span>
                  {user && userFiles.jd_text && !jobDescription && (
                    <button
                      onClick={handleUseExistingJD}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '6px 12px',
                        background: '#dbeafe',
                        color: '#3b82f6',
                        borderRadius: '6px',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '500'
                      }}
                    >
                      Use Your JD
                    </button>
                  )}
                </div>
                {jobDescription.length > 100 && (
                  <span style={{ 
                    fontSize: '14px', 
                    color: '#10b981', 
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <CheckCircle size={16} />
                    Good length
                  </span>
                )}
              </div>
            </div>

            {/* Resume Upload Section */}
            <div>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px', 
                marginBottom: '16px'
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  background: '#fae8ff',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <FileText size={18} color="#8b5cf6" />
                </div>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>
                  Upload Your Resume
                </h2>
              </div>
              
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                style={{
                  border: resumeFile ? '3px solid #10b981' : dragActive ? '3px dashed #3b82f6' : '3px dashed #d1d5db',
                  borderRadius: '16px',
                  padding: '40px',
                  textAlign: 'center',
                  transition: 'all 0.3s ease',
                  background: resumeFile ? '#ecfdf5' : dragActive ? '#eff6ff' : '#f9fafb',
                  transform: dragActive ? 'scale(1.02)' : 'scale(1)'
                }}
              >
                {resumeFile ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{
                      width: '64px',
                      height: '64px',
                      background: '#d1fae5',
                      borderRadius: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto'
                    }}>
                      <CheckCircle size={32} color="#10b981" />
                    </div>
                    <div>
                      <h3 style={{ 
                        fontSize: '24px', 
                        fontWeight: 'bold', 
                        color: '#111827', 
                        marginBottom: '8px'
                      }}>
                        📄 Resume Uploaded Successfully!
                      </h3>
                      <p style={{ 
                        color: '#374151', 
                        fontWeight: '500', 
                        marginBottom: '8px'
                      }}>
                        {resumeFile.name}
                      </p>
                      <p style={{ fontSize: '14px', color: '#6b7280' }}>
                        {(resumeFile.size / 1024 / 1024).toFixed(2)} MB • Ready for analysis
                      </p>
                    </div>
                    <button
                      onClick={() => setResumeFile(null)}
                      style={{
                        color: '#3b82f6',
                        fontWeight: '500',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        textDecoration: 'underline'
                      }}
                    >
                      Upload different file
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div style={{
                      width: '80px',
                      height: '80px',
                      background: '#dbeafe',
                      borderRadius: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto'
                    }}>
                      <Upload size={40} color="#3b82f6" />
                    </div>
                    <div>
                      <h3 style={{ 
                        fontSize: '24px', 
                        fontWeight: 'bold', 
                        color: '#111827', 
                        marginBottom: '12px'
                      }}>
                        Drop your resume here
                      </h3>
                      <p style={{ 
                        color: '#6b7280', 
                        marginBottom: '24px',
                        fontSize: '16px'
                      }}>
                        Or click to browse and select your resume file
                      </p>
                      <label style={{ cursor: 'pointer' }}>
                        <span style={{
                          background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                          color: 'white',
                          border: 'none',
                          padding: '16px 32px',
                          borderRadius: '12px',
                          fontWeight: '600',
                          fontSize: '16px',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          <FileText size={20} />
                          Choose Resume File
                        </span>
                        <input
                          type="file"
                          style={{ display: 'none' }}
                          accept=".pdf,.doc,.docx"
                          onChange={(e) => handleFileUpload(e.target.files[0])}
                        />
                      </label>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <p style={{ fontSize: '14px', color: '#6b7280' }}>
                        Supports PDF, DOC, DOCX • Max 10MB
                      </p>
                      {user && userFiles.resume_id && (
                        <button
                          onClick={handleUseExistingResume}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '12px 24px',
                            background: '#dbeafe',
                            color: '#3b82f6',
                            borderRadius: '8px',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '500',
                            margin: '0 auto'
                          }}
                        >
                          Use Your Uploaded Resume
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Analyze Button */}
            <div style={{ textAlign: 'center', paddingTop: '24px' }}>
              <button
                onClick={handleAnalyze}
                disabled={!jobDescription.trim() || !resumeFile}
                style={{
                  background: jobDescription.trim() && resumeFile 
                    ? 'linear-gradient(135deg, #3b82f6, #8b5cf6)' 
                    : '#e5e7eb',
                  color: jobDescription.trim() && resumeFile ? 'white' : '#9ca3af',
                  border: 'none',
                  padding: '20px 48px',
                  borderRadius: '16px',
                  fontWeight: 'bold',
                  fontSize: '20px',
                  cursor: jobDescription.trim() && resumeFile ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  margin: '0 auto',
                  boxShadow: jobDescription.trim() && resumeFile ? '0 10px 25px rgba(59, 130, 246, 0.3)' : 'none',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  if (jobDescription.trim() && resumeFile) {
                    e.target.style.transform = 'translateY(-2px)'
                    e.target.style.boxShadow = '0 15px 35px rgba(59, 130, 246, 0.4)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (jobDescription.trim() && resumeFile) {
                    e.target.style.transform = 'translateY(0)'
                    e.target.style.boxShadow = '0 10px 25px rgba(59, 130, 246, 0.3)'
                  }
                }}
              >
                <BarChart3 size={24} />
                Analyze My Resume
                <ArrowRight size={24} />
              </button>
              
              {(!jobDescription.trim() || !resumeFile) && (
                <p style={{ 
                  fontSize: '14px', 
                  color: '#6b7280', 
                  marginTop: '16px'
                }}>
                  Please provide both job description and resume to continue
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={{
        background: 'linear-gradient(135deg, #111827, #1f2937)',
        color: 'white',
        marginTop: '64px'
      }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto', 
          padding: '48px 20px'
        }}>
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '32px'
          }}>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
                About Company
              </h3>
              <p style={{ color: '#9ca3af', lineHeight: '1.6' }}>
                CVision uses advanced AI to help job seekers optimize their resumes and 
                improve their chances of landing their dream jobs.
              </p>
            </div>
            
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
                Job Categories
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <a href="#" style={{ color: '#9ca3af', textDecoration: 'none' }}>Technology</a>
                <a href="#" style={{ color: '#9ca3af', textDecoration: 'none' }}>Marketing</a>
                <a href="#" style={{ color: '#9ca3af', textDecoration: 'none' }}>Design</a>
                <a href="#" style={{ color: '#9ca3af', textDecoration: 'none' }}>Finance</a>
              </div>
            </div>
            
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
                Contact Location
              </h3>
              <div style={{ color: '#9ca3af', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <p>123 Innovation Street</p>
                <p>Tech District, CA 94107</p>
                <p>contact@cvision.com</p>
                <p>+1 (555) 123-4567</p>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* CSS Animations */}
      <style>
        {`
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

export default ResumeAnalysisStep1