import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useInterviewPreparation } from '../hooks/useInterviewPreparation'
import { RefreshCw, CheckCircle, AlertCircle, FileText, Briefcase, ChevronDown, Upload, Plus, Edit } from 'lucide-react'
import { mainAPI } from '../utils/api'
import API_CONFIG from '../config/api'

const InterviewPreparation = ({ sessionId, onReady, onError }) => {
  const navigate = useNavigate()
  const [user, setUser] = React.useState(null)
  const [dropdownVisible, setDropdownVisible] = React.useState(false)
  
  // CV and JD selection states
  const [step, setStep] = React.useState('select') // 'select' | 'extracting' | 'ready'
  const [userFiles, setUserFiles] = React.useState({ resume_id: null, jd_text: null })
  const [selectedCV, setSelectedCV] = React.useState(null) // File object or 'existing'
  const [selectedJD, setSelectedJD] = React.useState('') // Text content
  const [cvSource, setCvSource] = React.useState('existing') // 'existing' | 'upload'
  const [jdSource, setJdSource] = React.useState('existing') // 'existing' | 'manual'
  const [isLoadingFiles, setIsLoadingFiles] = React.useState(false)
  const [extractionProgress, setExtractionProgress] = React.useState({ cv: false, jd: false })
  
  const {
    isPreparing,
    isReady,
    error,
    extractionStatus,
    prepareInterview,
    checkExtractionStatus
  } = useInterviewPreparation(sessionId)

  // Check if user is logged in and load their files
  React.useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      const userData = JSON.parse(storedUser)
      setUser(userData)
      loadUserFiles(userData.id)
    }
  }, [])

  // Load user's existing CV and JD files
  const loadUserFiles = async (userId) => {
    const token = localStorage.getItem('access_token')
    if (!token) return

    try {
      setIsLoadingFiles(true)
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.USERDB.USERFILES}${userId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setUserFiles({
          resume_id: data.resume_id,
          jd_text: data.jd_text
        })
        
        // Auto-select existing files if available
        if (data.jd_text) {
          setSelectedJD(data.jd_text)
        }
      }
    } catch (err) {
      console.error('Error loading user files:', err)
    } finally {
      setIsLoadingFiles(false)
    }
  }

  // Handle CV file upload
  const handleCVUpload = (event) => {
    const file = event.target.files[0]
    if (file && file.type === 'application/pdf') {
      setSelectedCV(file)
      setCvSource('upload')
    } else {
      alert('Please select a PDF file for your CV')
    }
  }

  // Handle CV and JD extraction
  const handleExtractData = async () => {
    if (!selectedCV && !userFiles.resume_id) {
      alert('Please select or upload a CV first')
      return
    }
    
    if (!selectedJD.trim()) {
      alert('Please enter a job description')
      return
    }

    setStep('extracting')
    setExtractionProgress({ cv: false, jd: false })

    try {
      // Extract CV
      if (cvSource === 'upload' && selectedCV) {
        const cvFormData = new FormData()
        cvFormData.append('file', selectedCV)
        cvFormData.append('session_id', sessionId)
        
        const cvResponse = await mainAPI.extractCV(cvFormData)
        if (cvResponse.ok) {
          setExtractionProgress(prev => ({ ...prev, cv: true }))
        } else {
          throw new Error('Failed to extract CV data')
        }
      } else {
        // Use existing CV from database
        setExtractionProgress(prev => ({ ...prev, cv: true }))
      }

      // Extract JD
      const jdFormData = new FormData()
      jdFormData.append('job_description', selectedJD)
      jdFormData.append('session_id', sessionId)
      
      const jdResponse = await mainAPI.extractJob(jdFormData)
      if (jdResponse.ok) {
        setExtractionProgress(prev => ({ ...prev, jd: true }))
      } else {
        throw new Error('Failed to extract JD data')
      }

      // Now prepare interview
      await prepareInterview()
      
    } catch (err) {
      console.error('Extraction failed:', err)
      if (onError) {
        onError(err.message)
      }
      setStep('select')
    }
  }

  React.useEffect(() => {
    if (isReady && onReady) {
      setStep('ready')
      onReady(extractionStatus)
    }
  }, [isReady, extractionStatus, onReady])

  React.useEffect(() => {
    if (error && onError) {
      onError(error)
      setStep('select')
    }
  }, [error, onError])

  // Determine which step to render
  if (step === 'select') {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)' }}>
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
                    cursor: 'pointer'
                  }}
                  onClick={() => navigate('/')}
                >
                  <span style={{ color: 'white', fontWeight: 'bold' }}>CV</span>
                </div>
                <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>CVision</span>
              </div>
              
              <nav style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '32px',
                userSelect: 'none'
              }}>
                <a href="/" style={{ color: '#374151', fontWeight: '500', textDecoration: 'none' }}>Home</a>
                <a href="/mock-interview" style={{ color: '#374151', fontWeight: '500', textDecoration: 'none' }}>Mock Interview</a>
                <a href="/resume-analysis/step1" style={{ color: '#374151', fontWeight: '500', textDecoration: 'none' }}>Resume Analysis</a>
                <a href="/improve-resume/step1" style={{ color: '#374151', fontWeight: '500', textDecoration: 'none' }}>Improve Resume</a>
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
                    >
                      <span style={{ color: '#374151', fontWeight: '500' }}>
                        Welcome, {user.full_name || 'User'}
                      </span>
                      <ChevronDown size={16} color="#374151" />
                    </div>
                    {dropdownVisible && (
                      <div style={{
                        position: 'absolute',
                        top: '100%',
                        right: 0,
                        background: 'white',
                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        zIndex: 100,
                        animation: 'fadeIn 0.2s ease-in-out'
                      }}>
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
                            fontSize: '14px'
                          }}
                        >
                          Dashboard
                        </button>
                        <hr style={{ margin: 0, border: 'none', borderTop: '1px solid #e5e7eb' }} />
                        <button 
                          onClick={() => {
                            localStorage.clear();
                            setUser(null);
                            navigate('/signin');
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
                            fontSize: '14px'
                          }}
                        >
                          Log Out
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <button 
                      onClick={() => navigate('/signin', { state: { from: '/' } })}
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

        {/* CV/JD Selection Content */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          minHeight: 'calc(100vh - 64px)',
          padding: '40px 20px'
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px',
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
            maxWidth: '600px',
            width: '100%'
          }}>
            <h2 style={{ color: '#374151', marginBottom: '8px', fontSize: '24px', textAlign: 'center' }}>
              Prepare Your Interview
            </h2>
            <p style={{ color: '#6b7280', textAlign: 'center', marginBottom: '32px' }}>
              Select your CV and Job Description to personalize your mock interview experience
            </p>

            {isLoadingFiles ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  border: '4px solid #e5e7eb',
                  borderTop: '4px solid #3b82f6',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  margin: '0 auto 16px'
                }}></div>
                <p style={{ color: '#6b7280' }}>Loading your files...</p>
              </div>
            ) : (
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* CV Selection */}
                <div style={{
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  padding: '24px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                    <FileText size={24} style={{ color: '#3b82f6', marginRight: '12px' }} />
                    <h3 style={{ color: '#374151', fontSize: '18px', fontWeight: '600', margin: 0 }}>
                      Select Your CV
                    </h3>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {userFiles.resume_id && (
                      <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '12px',
                        border: `2px solid ${cvSource === 'existing' ? '#3b82f6' : '#e5e7eb'}`,
                        borderRadius: '8px',
                        cursor: 'pointer',
                        background: cvSource === 'existing' ? '#eff6ff' : 'transparent'
                      }}>
                        <input
                          type="radio"
                          name="cvSource"
                          value="existing"
                          checked={cvSource === 'existing'}
                          onChange={(e) => {
                            setCvSource(e.target.value)
                            setSelectedCV('existing')
                          }}
                          style={{ marginRight: '12px' }}
                        />
                        <CheckCircle size={16} style={{ color: '#10b981', marginRight: '8px' }} />
                        <span style={{ color: '#374151', fontWeight: '500' }}>
                          Use existing CV from your profile
                        </span>
                      </label>
                    )}

                    <label style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '12px',
                      border: `2px solid ${cvSource === 'upload' ? '#3b82f6' : '#e5e7eb'}`,
                      borderRadius: '8px',
                      cursor: 'pointer',
                      background: cvSource === 'upload' ? '#eff6ff' : 'transparent'
                    }}>
                      <input
                        type="radio"
                        name="cvSource"
                        value="upload"
                        checked={cvSource === 'upload'}
                        onChange={(e) => setCvSource(e.target.value)}
                        style={{ marginRight: '12px' }}
                      />
                      <Upload size={16} style={{ color: '#8b5cf6', marginRight: '8px' }} />
                      <span style={{ color: '#374151', fontWeight: '500' }}>
                        Upload new CV file
                      </span>
                    </label>

                    {cvSource === 'upload' && (
                      <div style={{ marginTop: '12px' }}>
                        <input
                          type="file"
                          accept=".pdf"
                          onChange={handleCVUpload}
                          style={{
                            width: '100%',
                            padding: '12px',
                            border: '2px dashed #d1d5db',
                            borderRadius: '8px',
                            backgroundColor: '#f9fafb',
                            cursor: 'pointer'
                          }}
                        />
                        {selectedCV && selectedCV.name && (
                          <p style={{ marginTop: '8px', fontSize: '14px', color: '#10b981' }}>
                            ✓ {selectedCV.name} selected
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* JD Selection */}
                <div style={{
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  padding: '24px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                    <Briefcase size={24} style={{ color: '#8b5cf6', marginRight: '12px' }} />
                    <h3 style={{ color: '#374151', fontSize: '18px', fontWeight: '600', margin: 0 }}>
                      Job Description
                    </h3>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {userFiles.jd_text && (
                      <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '12px',
                        border: `2px solid ${jdSource === 'existing' ? '#8b5cf6' : '#e5e7eb'}`,
                        borderRadius: '8px',
                        cursor: 'pointer',
                        background: jdSource === 'existing' ? '#faf5ff' : 'transparent'
                      }}>
                        <input
                          type="radio"
                          name="jdSource"
                          value="existing"
                          checked={jdSource === 'existing'}
                          onChange={(e) => setJdSource(e.target.value)}
                          style={{ marginRight: '12px' }}
                        />
                        <CheckCircle size={16} style={{ color: '#10b981', marginRight: '8px' }} />
                        <span style={{ color: '#374151', fontWeight: '500' }}>
                          Use existing JD from your profile
                        </span>
                      </label>
                    )}

                    <label style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '12px',
                      border: `2px solid ${jdSource === 'manual' ? '#8b5cf6' : '#e5e7eb'}`,
                      borderRadius: '8px',
                      cursor: 'pointer',
                      background: jdSource === 'manual' ? '#faf5ff' : 'transparent'
                    }}>
                      <input
                        type="radio"
                        name="jdSource"
                        value="manual"
                        checked={jdSource === 'manual'}
                        onChange={(e) => setJdSource(e.target.value)}
                        style={{ marginRight: '12px' }}
                      />
                      <Edit size={16} style={{ color: '#f59e0b', marginRight: '8px' }} />
                      <span style={{ color: '#374151', fontWeight: '500' }}>
                        Enter job description manually
                      </span>
                    </label>

                    <div style={{ marginTop: '12px' }}>
                      <textarea
                        value={selectedJD}
                        onChange={(e) => setSelectedJD(e.target.value)}
                        placeholder="Paste the job description here..."
                        rows="6"
                        style={{
                          width: '100%',
                          padding: '12px',
                          border: '2px solid #e5e7eb',
                          borderRadius: '8px',
                          fontSize: '14px',
                          lineHeight: '1.5',
                          resize: 'vertical',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#8b5cf6'}
                        onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '24px' }}>
                  <button
                    onClick={() => navigate('/dashboard')}
                    style={{
                      background: 'white',
                      color: '#374151',
                      border: '2px solid #e5e7eb',
                      padding: '12px 24px',
                      borderRadius: '8px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    Manage Files in Dashboard
                  </button>
                  
                  <button
                    onClick={handleExtractData}
                    disabled={(!selectedCV && !userFiles.resume_id) || !selectedJD.trim()}
                    style={{
                      background: (selectedCV || userFiles.resume_id) && selectedJD.trim() 
                        ? 'linear-gradient(135deg, #3b82f6, #8b5cf6)' 
                        : '#e5e7eb',
                      color: (selectedCV || userFiles.resume_id) && selectedJD.trim() ? 'white' : '#9ca3af',
                      border: 'none',
                      padding: '12px 24px',
                      borderRadius: '8px',
                      fontWeight: '600',
                      cursor: (selectedCV || userFiles.resume_id) && selectedJD.trim() ? 'pointer' : 'not-allowed',
                      display: 'flex',
                      alignItems: 'center',
                      fontSize: '14px'
                    }}
                  >
                    <Plus size={16} style={{ marginRight: '8px' }} />
                    Start Interview Preparation
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            @keyframes fadeIn {
              from {
                opacity: 0;
                transform: translateY(-10px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
          `}
        </style>
      </div>
    )
  }
  
  if (step === 'extracting' || isPreparing) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '40px 20px'
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px',
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
            maxWidth: '500px',
            width: '100%'
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              border: '4px solid #e5e7eb',
              borderTop: '4px solid #3b82f6',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              marginBottom: '20px'
            }}></div>
            
            <h2 style={{ color: '#374151', marginBottom: '16px', fontSize: '20px', textAlign: 'center' }}>
              Extracting Information...
            </h2>
            
            <div style={{ width: '100%', marginBottom: '24px' }}>
              <div style={{
                display: 'flex',
                gap: '16px',
                marginBottom: '16px',
                justifyContent: 'center'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '8px 12px',
                  background: extractionProgress.cv ? '#f0fdf4' : '#fef3c7',
                  borderRadius: '8px',
                  border: `1px solid ${extractionProgress.cv ? '#bbf7d0' : '#fde68a'}`
                }}>
                  <FileText size={16} style={{ 
                    color: extractionProgress.cv ? '#059669' : '#d97706', 
                    marginRight: '8px' 
                  }} />
                  <span style={{ 
                    color: extractionProgress.cv ? '#166534' : '#92400e', 
                    fontSize: '14px', 
                    fontWeight: '500' 
                  }}>
                    {extractionProgress.cv ? 'CV Extracted' : 'Extracting CV...'}
                  </span>
                  {extractionProgress.cv && (
                    <CheckCircle size={16} style={{ color: '#059669', marginLeft: '8px' }} />
                  )}
                </div>
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '8px 12px',
                  background: extractionProgress.jd ? '#eff6ff' : '#fef3c7',
                  borderRadius: '8px',
                  border: `1px solid ${extractionProgress.jd ? '#bfdbfe' : '#fde68a'}`
                }}>
                  <Briefcase size={16} style={{ 
                    color: extractionProgress.jd ? '#2563eb' : '#d97706', 
                    marginRight: '8px' 
                  }} />
                  <span style={{ 
                    color: extractionProgress.jd ? '#1e40af' : '#92400e', 
                    fontSize: '14px', 
                    fontWeight: '500' 
                  }}>
                    {extractionProgress.jd ? 'JD Extracted' : 'Extracting JD...'}
                  </span>
                  {extractionProgress.jd && (
                    <CheckCircle size={16} style={{ color: '#2563eb', marginLeft: '8px' }} />
                  )}
                </div>
              </div>
            </div>
            
            <p style={{ color: '#6b7280', textAlign: 'center', margin: 0 }}>
              Analyzing your CV and Job Description to create personalized interview questions...
            </p>
          </div>
        </div>

        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    )
  }

  // If ready
  if (isReady || step === 'ready') {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '40px 20px'
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px',
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
            maxWidth: '500px',
            width: '100%'
          }}>
            <CheckCircle size={48} style={{ color: '#059669', marginBottom: '16px' }} />
            <h2 style={{ color: '#374151', marginBottom: '8px', fontSize: '20px' }}>
              Ready for Interview!
            </h2>
            <p style={{ color: '#6b7280', textAlign: 'center', marginBottom: '24px' }}>
              CV and Job Description have been successfully extracted and analyzed.
            </p>
            
            {extractionStatus && (
              <div style={{
                display: 'flex',
                gap: '16px',
                marginBottom: '24px',
                flexWrap: 'wrap',
                justifyContent: 'center'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '8px 12px',
                  background: '#f0fdf4',
                  borderRadius: '8px',
                  border: '1px solid #bbf7d0'
                }}>
                  <FileText size={16} style={{ color: '#059669', marginRight: '8px' }} />
                  <span style={{ color: '#166534', fontSize: '14px', fontWeight: '500' }}>
                    CV Ready
                  </span>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '8px 12px',
                  background: '#eff6ff',
                  borderRadius: '8px',
                  border: '1px solid #bfdbfe'
                }}>
                  <Briefcase size={16} style={{ color: '#2563eb', marginRight: '8px' }} />
                  <span style={{ color: '#1e40af', fontSize: '14px', fontWeight: '500' }}>
                    JD Ready
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '40px 20px'
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px',
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
            maxWidth: '500px',
            width: '100%'
          }}>
            <AlertCircle size={48} style={{ color: '#dc2626', marginBottom: '16px' }} />
            <h2 style={{ color: '#374151', marginBottom: '8px', fontSize: '20px' }}>
              Preparation Failed
            </h2>
            <p style={{ color: '#6b7280', textAlign: 'center', marginBottom: '24px' }}>
              {error}
            </p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <button
                onClick={() => setStep('select')}
                style={{
                  background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: '14px'
                }}
              >
                <RefreshCw size={16} style={{ marginRight: '8px' }} />
                Try Again
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                style={{
                  background: 'white',
                  color: '#374151',
                  border: '2px solid #e5e7eb',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Default fallback - should not reach here
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)' }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '40px 20px'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px',
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
          maxWidth: '500px',
          width: '100%'
        }}>
          <RefreshCw size={48} style={{ color: '#6b7280', marginBottom: '16px' }} />
          <h2 style={{ color: '#374151', marginBottom: '8px', fontSize: '20px' }}>
            Preparing Interview
          </h2>
          <p style={{ color: '#6b7280', textAlign: 'center', marginBottom: '24px' }}>
            Getting ready to extract and analyze your CV and Job Description.
          </p>
          
          <button
            onClick={() => setStep('select')}
            style={{
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              fontSize: '14px'
            }}
          >
            <RefreshCw size={16} style={{ marginRight: '8px' }} />
            Select CV and JD
          </button>
        </div>
      </div>
    </div>
  )
}

export default InterviewPreparation

