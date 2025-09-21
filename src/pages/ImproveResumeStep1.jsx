import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, FileText, Briefcase, ArrowRight, CheckCircle, ChevronDown } from 'lucide-react'
import axios from 'axios'
import API_CONFIG from '../config/api'
const ImproveResumeStep1 = () => {
  const [jobDescription, setJobDescription] = useState('')
  const [resumeFile, setResumeFile] = useState(null)
  const [dragActive, setDragActive] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState(0) // ✅ Add progress state
  const [error, setError] = useState(null)
  const [user, setUser] = useState(null) // Add user state for dropdown
  const [dropdownVisible, setDropdownVisible] = useState(false) // Add dropdown visibility state
  const [userFiles, setUserFiles] = useState({ resume_id: null, jd_text: null })
  const [isLoadingFiles, setIsLoadingFiles] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const keysToRemove = [
      'step1JobDescription',
      'step1ResumeFileName', 
      'analysisResults',
      'step2FormData',
      'step3DataReady',
      'scorePanelDataReady',
      'generatedResumePDF',
      'overleafLink',
      'AddDataResumeData',
      'enhancedAlignmentScore',
      'enhancedResumeData',
      'contentPreservationScore',
      'enhancedMetricsCalculated'
    ];
    
    keysToRemove.forEach(key => sessionStorage.removeItem(key));
    
    setJobDescription('');
    setResumeFile(null);
    setError(null);
    setIsSubmitting(false);
  }, []);

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

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isSubmitting) {
        e.preventDefault()
        e.returnValue = 'Resume analysis is still in progress. Are you sure you want to leave?'
        return 'Resume analysis is still in progress. Are you sure you want to leave?'
      }
    }

    const handleKeyDown = (e) => {
      if (e.key === 'F5' || (e.ctrlKey && e.key === 'r') || (e.metaKey && e.key === 'r')) {
        if (isSubmitting) {
          e.preventDefault()
          e.stopPropagation()
          
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
              Analyzing your resume and job description...
            </div>
          `
          
          document.body.appendChild(notification)
          
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

    const handleKeyUp = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'R' && isSubmitting) {
        e.preventDefault()
        e.stopPropagation()
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

  const validateInputs = () => {
    const errors = [];
    
    if (!jobDescription.trim()) {
      errors.push('Job description is required');
    } else if (jobDescription.length < 50) {
      errors.push('Job description should be at least 50 characters');
    }
    
    if (!resumeFile) {
      errors.push('Resume file is required');
    } else if (resumeFile.size > 10 * 1024 * 1024) {
      errors.push('File size should be less than 10MB');
    }
    
    return errors;
  };

  const handleFileUpload = (file) => {
    if (file && (file.type === 'application/pdf' || file.name.endsWith('.doc') || file.name.endsWith('.docx'))) {
      if (file.size > 10 * 1024 * 1024) {
        setError('File size should be less than 10MB');
        return;
      }
      setResumeFile(file)
      setError(null)
    } else {
      setError('Please upload a valid PDF, DOC, or DOCX file');
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

  const handleNext = async () => {
    const validationErrors = validateInputs();
    if (validationErrors.length > 0) {
      setError(validationErrors.join('\n'));
      return;
    }

    try {
      setError(null);
      setIsSubmitting(true);
      setLoadingProgress(0); // ✅ Reset progress
      
      const formData = new FormData();
      formData.append('job_description', jobDescription.trim());
      formData.append('resume_file', resumeFile);

      // ✅ Start progress simulation
      const progressInterval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev < 85) {
            return prev + Math.random() * 6; // Gradual increment
          }
          return prev;
        });
      }, 800); // Update every 800ms

      const response = await axios.post(
        `${API_CONFIG.BASE_URL}${API_CONFIG.RESUME.EVALUATE_CV}`,
        formData
      );

      clearInterval(progressInterval);
      setLoadingProgress(100); // ✅ Set to 100% when complete

      const analysisResult = response.data;
      
      if (!analysisResult.cv_comment?.missing_information) {
        throw new Error('Invalid response structure from server');
      }
      
      sessionStorage.setItem('analysisResults', JSON.stringify(analysisResult));

      // ✅ Small delay to show 100% completion
      setTimeout(() => {
        navigate('/improve-resume/step2', { state: { loading: false } });
      }, 800);

    } catch (error) {
      let errorMessage = 'Failed to analyze resume. Please try again.';
      if (error.response?.status === 413) {
        errorMessage = 'File too large. Please use a smaller file.';
      } else if (error.response?.status === 400) {
        errorMessage = 'Invalid file format or corrupted file. Please upload a valid resume.';
      } else if (error.response?.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      setIsSubmitting(false);
      setLoadingProgress(0); // ✅ Reset progress on error
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
            Our AI is analyzing your resume and the job description to identify areas for improvement.
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
                Analysis Progress
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
                background: 'linear-gradient(90deg, #10b981, #059669)',
                borderRadius: '6px',
                transition: 'width 0.3s ease',
                boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
              }} />
            </div>
            
            <div style={{
              marginTop: '16px',
              fontSize: '14px',
              color: '#6b7280',
              textAlign: 'center'
            }}>
              {loadingProgress < 50 
                ? '📄 Processing resume content...' 
                : loadingProgress < 85 
                  ? '🎯 Analyzing job requirements...'
                  : loadingProgress < 100
                    ? '🔍 Identifying improvement areas...'
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
              background: loadingProgress >= 50 ? '#d1fae5' : '#eff6ff',
              borderRadius: '8px',
              border: `2px solid ${loadingProgress >= 50 ? '#10b981' : '#3b82f6'}`
            }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: loadingProgress >= 50 ? '#10b981' : '#3b82f6'
              }} />
              <span style={{
                fontSize: '12px',
                fontWeight: '600',
                color: loadingProgress >= 50 ? '#065f46' : '#1e40af'
              }}>
                Resume Processing
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
                Enhancement Ready
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
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #eff6ff, #e0e7ff, #f3e8ff)' }}>
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
              <div 
                style={{
                  width: '40px',
                  height: '40px', 
                  background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
                onClick={() => navigate('/')}
              >
                <span style={{ color: 'white', fontWeight: 'bold' }}>CV</span>
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
              gap: '16px',
              position: 'relative'
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
                          dropdown.style.width = `${el.offsetWidth}px`;
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
                    onClick={() => navigate('/signin', { state: { from: '/improve-resume/step1' } })}
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
                background: '#3b82f6',
                color: 'white',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold'
              }}>
                1
              </div>
              <span style={{ marginLeft: '12px', color: '#3b82f6', fontWeight: '600' }}>
                Job Description & Resume
              </span>
            </div>
            
            <div style={{ width: '48px', height: '4px', background: '#e5e7eb', borderRadius: '2px' }}></div>
            
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{
                width: '40px',
                height: '40px',
                background: '#e5e7eb',
                color: '#6b7280',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold'
              }}>
                2
              </div>
              <span style={{ marginLeft: '12px', color: '#6b7280', fontWeight: '600' }}>
                Supplement Details
              </span>
            </div>
            
            <div style={{ width: '48px', height: '4px', background: '#e5e7eb', borderRadius: '2px' }}></div>
            
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{
                width: '40px',
                height: '40px',
                background: '#e5e7eb',
                color: '#6b7280',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold'
              }}>
                3
              </div>
              <span style={{ marginLeft: '12px', color: '#6b7280', fontWeight: '600' }}>
                Enhanced Resume
              </span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '48px',
          boxShadow: '0 25px 50px rgba(0,0,0,0.1)',
          border: 'none'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h1 style={{ 
              fontSize: '36px', 
              fontWeight: 'bold', 
              color: '#111827', 
              marginBottom: '16px'
            }}>
              Let's Enhance Your Resume
            </h1>
            <p style={{ 
              fontSize: '18px', 
              color: '#6b7280',
              maxWidth: '600px',
              margin: '0 auto',
              lineHeight: '1.6'
            }}>
              Upload your current resume and paste the job description you're targeting. 
              Our AI will analyze and enhance your resume for maximum impact.
            </p>
          </div>

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
                  Job Description
                </h2>
              </div>
              
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job description here...

Example:
We are looking for a Senior Software Engineer with 5+ years of experience in React, Node.js, and cloud technologies. The ideal candidate should have experience with microservices architecture, CI/CD pipelines, and team leadership..."
                rows="8"
                style={{
                  width: '100%',
                  padding: '20px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '16px',
                  fontSize: '16px',
                  lineHeight: '1.6',
                  resize: 'none',
                  outline: 'none',
                  fontFamily: 'inherit',
                  background: '#fafafa',
                  transition: 'all 0.2s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6'
                  e.target.style.background = 'white'
                  e.target.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.1)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb'
                  e.target.style.background = '#fafafa'
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
                  <div style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    color: '#10b981',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}>
                    <CheckCircle size={16} />
                    Good length
                  </div>
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
                  borderRadius: '20px',
                  padding: '48px',
                  textAlign: 'center',
                  transition: 'all 0.3s ease',
                  background: resumeFile ? '#ecfdf5' : dragActive ? '#eff6ff' : '#fafafa',
                  transform: dragActive ? 'scale(1.02)' : 'scale(1)'
                }}
              >
                {resumeFile ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{
                      width: '80px',
                      height: '80px',
                      background: '#d1fae5',
                      borderRadius: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto'
                    }}>
                      <CheckCircle size={40} color="#10b981" />
                    </div>
                    <div>
                      <h3 style={{ 
                        fontSize: '28px', 
                        fontWeight: 'bold', 
                        color: '#111827', 
                        marginBottom: '12px'
                      }}>
                        📄 Resume Uploaded Successfully!
                      </h3>
                      <p style={{ 
                        color: '#374151', 
                        fontWeight: '600', 
                        marginBottom: '8px',
                        fontSize: '18px'
                      }}>
                        {resumeFile.name}
                      </p>
                      <p style={{ fontSize: '16px', color: '#6b7280' }}>
                        {(resumeFile.size / 1024 / 1024).toFixed(2)} MB • Ready for enhancement
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
                        textDecoration: 'underline',
                        fontSize: '16px'
                      }}
                    >
                      Upload different file
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div style={{
                      width: '100px',
                      height: '100px',
                      background: '#dbeafe',
                      borderRadius: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto'
                    }}>
                      <Upload size={50} color="#3b82f6" />
                    </div>
                    <div>
                      <h3 style={{ 
                        fontSize: '28px', 
                        fontWeight: 'bold', 
                        color: '#111827', 
                        marginBottom: '16px'
                      }}>
                        Upload Your Current Resume
                      </h3>
                      <p style={{ 
                        color: '#6b7280', 
                        marginBottom: '32px',
                        fontSize: '18px',
                        lineHeight: '1.5'
                      }}>
                        Drag and drop your resume here, or click to browse
                      </p>
                      <label style={{ cursor: 'pointer' }}>
                        <span style={{
                          background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                          color: 'white',
                          border: 'none',
                          padding: '20px 40px',
                          borderRadius: '16px',
                          fontWeight: '700',
                          fontSize: '18px',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '12px',
                          transition: 'all 0.3s ease'
                        }}>
                          <FileText size={24} />
                          Choose File
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

            {/* Continue Button */}
            <div style={{ textAlign: 'center', paddingTop: '24px' }}>
              <button
                onClick={handleNext}
                disabled={!jobDescription.trim() || !resumeFile || isSubmitting}
                style={{
                  background: (jobDescription.trim() && resumeFile && !isSubmitting)
                    ? 'linear-gradient(135deg, #3b82f6, #8b5cf6)' 
                    : '#e5e7eb',
                  color: (jobDescription.trim() && resumeFile && !isSubmitting) ? 'white' : '#9ca3af',
                  border: 'none',
                  padding: '20px 48px',
                  borderRadius: '16px',
                  fontWeight: 'bold',
                  fontSize: '20px',
                  cursor: (jobDescription.trim() && resumeFile && !isSubmitting) ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  margin: '0 auto',
                  boxShadow: (jobDescription.trim() && resumeFile && !isSubmitting) ? '0 10px 25px rgba(59, 130, 246, 0.3)' : 'none',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  if (jobDescription.trim() && resumeFile && !isSubmitting) {
                    e.target.style.transform = 'translateY(-2px)'
                    e.target.style.boxShadow = '0 15px 35px rgba(59, 130, 246, 0.4)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (jobDescription.trim() && resumeFile && !isSubmitting) {
                    e.target.style.transform = 'translateY(0)'
                    e.target.style.boxShadow = '0 10px 25px rgba(59, 130, 246, 0.3)'
                  }
                }}
              >
                Continue to Step 2
                <ArrowRight size={24} />
              </button>
              
              {(!jobDescription.trim() || !resumeFile) && (
                <p style={{ 
                  fontSize: '16px', 
                  color: '#6b7280', 
                  marginTop: '16px'
                }}>
                  Please complete both sections above to continue
                </p>
              )}
              
              {error && (
                <div style={{ 
                  color: '#dc2626', 
                  fontSize: '14px', 
                  marginTop: '16px',
                  padding: '12px',
                  background: '#fee2e2',
                  borderRadius: '8px',
                  border: '1px solid #fca5a5',
                  whiteSpace: 'pre-line'
                }}>
                  {error}
                </div>
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
                CVision helps job seekers create compelling resumes and ace their interviews 
                with AI-powered tools and personalized feedback.
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
    </div>
  )
}

export default ImproveResumeStep1