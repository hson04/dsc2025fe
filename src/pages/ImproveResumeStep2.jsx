import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Award, Cloud, Code, Briefcase } from 'lucide-react'
import API_CONFIG from '../config/api'

const ImproveResumeStep2 = () => {
  const autoSaveTimeoutRef = useRef(null);
  const gradients = [
    {
      background: 'linear-gradient(135deg, #fff7ed, #fed7aa)',
      iconBg: 'linear-gradient(135deg, #f97316, #ea580c)',
      border: '#fdba74',
      icon: Cloud
    },
    {
      background: 'linear-gradient(135deg, #fdf4ff, #f3e8ff)',
      iconBg: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
      border: '#e9d5ff',
      icon: Briefcase
    },
    {
      background: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
      iconBg: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
      border: '#93c5fd',
      icon: Code
    },
    {
      background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)',
      iconBg: 'linear-gradient(135deg, #10b981, #059669)',
      border: '#a7f3d0',
      icon: Award
    }
  ];

  const [fieldsList, setFieldsList] = useState([]);

  // ✅ Define fields properly from fieldsList
  const fields = fieldsList.map((field, index) => ({
    ...field,
    name: field.title.toLowerCase().replace(/\s+/g, ''),
    gradient: gradients[index % gradients.length]
  }));

  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0); // ✅ Add progress state
  const [error, setError] = useState(null);
  const [focusedField, setFocusedField] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const anyLoading = loading || isSubmitting;

    const handleBeforeUnload = (e) => {
      if (anyLoading) {
        e.preventDefault()
        e.returnValue = 'Processing is still in progress. Are you sure you want to leave?'
        return 'Processing is still in progress. Are you sure you want to leave?'
      }
    }

    const handleKeyDown = (e) => {
      if (e.key === 'F5' || (e.ctrlKey && e.key === 'r') || (e.metaKey && e.key === 'r')) {
        if (anyLoading) {
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
          
          let statusText = 'Processing: ';
          if (loading) {
            statusText += 'Loading form data';
          } else if (isSubmitting) {
            statusText += 'Creating enhanced resume';
          }
          
          notification.innerHTML = `
            <div style="margin-bottom: 12px; font-size: 24px;">⚠️</div>
            <div style="margin-bottom: 8px; font-size: 18px; font-weight: bold;">Please Wait!</div>
            <div style="margin-bottom: 12px; font-size: 14px; color: #b45309;">
              Processing is still in progress
            </div>
            <div style="font-size: 12px; color: #78350f; font-weight: normal;">
              ${statusText}
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
      if (e.ctrlKey && e.shiftKey && e.key === 'R' && anyLoading) {
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
  }, [loading, isSubmitting])

  const validateAnalysisData = useCallback((data) => {
    if (!data) return { isValid: false, error: 'No analysis data found' };
    
    if (!data.cv_comment?.missing_information || !Array.isArray(data.cv_comment.missing_information)) {
      return { isValid: false, error: 'Invalid analysis data structure' };
    }
    
    if (!data.resume_data || !data.job_data) {
      return { isValid: false, error: 'Missing required data fields' };
    }
    
    return { isValid: true };
  }, []);

  const autoSaveFormData = useCallback((formData) => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    
    autoSaveTimeoutRef.current = setTimeout(() => {
      sessionStorage.setItem('step2FormData', JSON.stringify(formData));
    }, 1000);
  }, []);

  useEffect(() => {
    const processAnalysisData = () => {
      const storedAnalysisResult = sessionStorage.getItem('analysisResults');
      
      if (storedAnalysisResult) {
        try {
          const analysisData = JSON.parse(storedAnalysisResult);
          const validation = validateAnalysisData(analysisData);
          
          if (!validation.isValid) {
            setError(validation.error);
            setLoading(false);
            return;
          }
          
          const missingInfo = analysisData.cv_comment.missing_information;
          const newFieldsList = missingInfo.map(item => ({
            title: item.field,
            placeholder: item.suggestion
          }));
          
          setFieldsList(newFieldsList);
          
          const initialFormData = {};
          newFieldsList.forEach(field => {
            initialFormData[field.title.toLowerCase().replace(/\s+/g, '')] = '';
          });
          
          const savedFormData = sessionStorage.getItem('step2FormData');
          if (savedFormData) {
            try {
              const parsedFormData = JSON.parse(savedFormData);
              setFormData({ ...initialFormData, ...parsedFormData });
            } catch (parseError) {
              setFormData(initialFormData);
            }
          } else {
            setFormData(initialFormData);
          }
          
          setLoading(false);
          
        } catch (parseError) {
          setError('Failed to parse analysis data. Please try again.');
          setLoading(false);
        }
      } else {
        setError('No analysis result found. Please complete step 1 first.');
        setLoading(false);
      }
    };

    processAnalysisData();
  }, [validateAnalysisData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newFormData = {
      ...formData,
      [name]: value,
    };
    
    setFormData(newFormData);
    autoSaveFormData(newFormData);
  };

  const handleFocus = (fieldName) => {
    setFocusedField(fieldName);
  };

  const handleBlur = () => {
    setFocusedField(null);
  };

  const handleBack = () => {
    sessionStorage.removeItem('step2FormData');
    navigate('/improve-resume/step1');
  };

  useEffect(() => {
    const currentPath = location.pathname;
    const referrer = document.referrer;
    
    if (referrer.includes('/improve-resume/step3') || currentPath === '/improve-resume/step2') {
      sessionStorage.removeItem('step2FormData');
      
      const step3DataKeys = [
        'step3DataReady',
        'scorePanelDataReady', 
        'enhancedAlignmentScore',
        'enhancedResumeData',
        'enhancedMetricsCalculated',
        'contentPreservationScore',
        'resumeImprovementsCalculated',
        'resumeImprovementsData',
        'generatedResumePDF',
        'generatedResume',
        'overleafLink',
        'AddDataResumeData'
      ];
      
      step3DataKeys.forEach(key => sessionStorage.removeItem(key));
    }
  }, [location.pathname, location.state]);

  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  const handleNext = async () => {
    try {
        setError(null);
        setIsSubmitting(true);
        setLoadingProgress(0);

        const step3DataKeys = [
            'step3DataReady',
            'scorePanelDataReady', 
            'enhancedAlignmentScore',
            'enhancedResumeData',
            'enhancedMetricsCalculated',
            'contentPreservationScore',
            'resumeImprovementsCalculated',
            'resumeImprovementsData',
            'generatedResumePDF',
            'generatedResume',
            'overleafLink',
            'AddDataResumeData'
        ];
        
        step3DataKeys.forEach(key => sessionStorage.removeItem(key));

        const storedAnalysisResult = sessionStorage.getItem('analysisResults');
        if (!storedAnalysisResult) {
            throw new Error('No analysis result found. Please complete step 1 first.');
        }

        const analysisData = JSON.parse(storedAnalysisResult);
        
        const validation = validateAnalysisData(analysisData);
        if (!validation.isValid) {
            throw new Error(validation.error);
        }
        
        const updatedMissingInfo = analysisData.cv_comment.missing_information.map(item => ({
            ...item,
            data: formData[item.field.toLowerCase().replace(/\s+/g, '')] || ''
        }));

        // ✅ Start progress simulation for API call
        const progressInterval = setInterval(() => {
          setLoadingProgress(prev => {
            if (prev < 85) {
              return prev + Math.random() * 8;
            }
            return prev;
          });
        }, 800);

        console.log('Making API call to:', `${API_CONFIG.BASE_URL}${API_CONFIG.RESUME.ADD_DATA_AND_CREATE_RESUME}`);
        console.log('Request payload:', {
            resume_data: analysisData.resume_data,
            missing_information: updatedMissingInfo,
            job_data: analysisData.job_data
        });

        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.RESUME.ADD_DATA_AND_CREATE_RESUME}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                resume_data: analysisData.resume_data,
                missing_information: updatedMissingInfo,
                job_data: analysisData.job_data
            }),
        });

        clearInterval(progressInterval);
        setLoadingProgress(100);

        console.log('API response status:', response.status);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ detail: 'Server error' }));
            throw new Error(errorData.detail || `HTTP ${response.status}: Failed to create resume`);
        }

        const contentType = response.headers.get('content-type');
        console.log('Response content type:', contentType);
        
        if (contentType && contentType.includes('application/json')) {
            const result = await response.json();
            console.log('JSON response:', result);
            
            if (result.success && result.overleaf_link) {
                sessionStorage.setItem('overleafLink', result.overleaf_link);
                sessionStorage.setItem('AddDataResumeData', JSON.stringify(result.new_resume_data));

                try {
                    const pdfResponse = await fetch(`${API_CONFIG.BASE_URL}${result.download_url}`);
                    if (pdfResponse.ok) {
                        const blob = await pdfResponse.blob();
                        const url = window.URL.createObjectURL(blob);
                        sessionStorage.setItem('generatedResumePDF', url);
                    }
                } catch (pdfError) {
                    console.error('Error downloading PDF:', pdfError);
                }
            }
            
            sessionStorage.setItem('step3DataReady', 'true');
            
        } else if (contentType && contentType.includes('application/pdf')) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            sessionStorage.setItem('generatedResumePDF', url);
            sessionStorage.setItem('step3DataReady', 'true');
        } else {
            const result = await response.json();
            sessionStorage.setItem('generatedResume', JSON.stringify(result));
            sessionStorage.setItem('step3DataReady', 'true');
        }
        
        // ✅ Navigate after successful API call
        console.log('API call successful, navigating to step 3');
        setTimeout(() => {
            navigate('/improve-resume/step3', { state: { loading: false, fromStep2: true } });
        }, 500);
        
    } catch (error) {
        console.error('Error in handleNext:', error);
        
        let errorMessage = 'Failed to process your request. Please try again.';
        if (error.message.includes('network')) {
            errorMessage = 'Network error. Please check your connection.';
        } else if (error.message) {
            errorMessage = error.message;
        }
        
        setError(errorMessage);
        setIsSubmitting(false);
        setLoadingProgress(0);
        
        // Don't navigate on error - stay on current page
    }
  };

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
          Creating enhanced resume...
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
            🚀 Creating Enhanced Resume...
          </h2>
          
          <p style={{ 
            fontSize: '18px', 
            color: '#6b7280',
            lineHeight: '1.6',
            marginBottom: '32px'
          }}>
            Our AI is combining your resume with the additional information to create an enhanced version tailored for your target position.
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
                Enhancement Progress
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
                background: 'linear-gradient(90deg, #8b5cf6, #3b82f6)',
                borderRadius: '6px',
                transition: 'width 0.3s ease',
                boxShadow: '0 2px 8px rgba(139, 92, 246, 0.3)'
              }} />
            </div>
            
            <div style={{
              marginTop: '16px',
              fontSize: '14px',
              color: '#6b7280',
              textAlign: 'center'
            }}>
              {loadingProgress < 40 
                ? '📊 Processing your information...' 
                : loadingProgress < 85 
                  ? '🎯 Enhancing resume content...'
                  : loadingProgress < 100
                    ? '✨ Finalizing your enhanced resume...'
                    : '✅ Enhancement complete!'}
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
              background: loadingProgress >= 40 ? '#f3e8ff' : '#eff6ff',
              borderRadius: '8px',
              border: `2px solid ${loadingProgress >= 40 ? '#8b5cf6' : '#3b82f6'}`
            }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: loadingProgress >= 40 ? '#8b5cf6' : '#3b82f6'
              }} />
              <span style={{
                fontSize: '12px',
                fontWeight: '600',
                color: loadingProgress >= 40 ? '#6b21a8' : '#1e40af'
              }}>
                Data Processing
              </span>
            </div>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              background: loadingProgress >= 100 ? '#f3e8ff' : '#f3f4f6',
              borderRadius: '8px',
              border: `2px solid ${loadingProgress >= 100 ? '#8b5cf6' : '#d1d5db'}`
            }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: loadingProgress >= 100 ? '#8b5cf6' : '#9ca3af'
              }} />
              <span style={{
                fontSize: '12px',
                fontWeight: '600',
                color: loadingProgress >= 100 ? '#6b21a8' : '#6b7280'
              }}>
                Resume Creation
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

  if (loading) {
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
            marginBottom: '24px'
          }}>
            🔄 Loading...
          </h2>
        </div>

        <style>
          {`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #eff6ff, #e0e7ff, #f3e8ff)' }}>
      {/* Remove old loading indicator and replace with new progress-aware one */}
      {loading && (
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
          Loading form data...
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
                2
              </div>
              <span style={{ marginLeft: '12px', color: '#3b82f6', fontWeight: '600' }}>
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
              Supplement Missing Resume Details
            </h1>
            <p style={{ 
              fontSize: '18px', 
              color: '#6b7280',
              maxWidth: '600px',
              margin: '0 auto',
              lineHeight: '1.6'
            }}>
              Help us understand your skills better by providing additional details that might be missing from your current resume.
            </p>
          </div>

          <div style={{ 
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '32px'
          }}>
            {fields.map((field, index) => {
              const column = index % 2 === 0 ? 'left' : 'right';
              const isFocused = focusedField === field.name;
              
              return (
                <div key={field.name} style={{
                  gridColumn: column === 'left' ? '1' : '2',
                  gridRow: Math.floor(index / 2) + 1
                }}>
                  <div style={{
                    background: field.gradient.background,
                    borderRadius: '16px',
                    padding: '24px',
                    border: `1px solid ${field.gradient.border}`,
                    transition: 'all 0.3s ease'
                  }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '12px', 
                      marginBottom: '16px'
                    }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        background: field.gradient.iconBg,
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <field.gradient.icon size={20} color="white" />
                      </div>
                      <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827' }}>
                        {field.title}
                      </h3>
                    </div>
                    
                    <div style={{
                      height: isFocused ? 'auto' : '0',
                      overflow: 'hidden',
                      transition: 'all 0.3s ease',
                      marginBottom: isFocused ? '16px' : '0'
                    }}>
                      <div style={{
                        background: 'rgba(255, 255, 255, 0.8)',
                        borderRadius: '8px',
                        padding: isFocused ? '12px' : '0',
                        border: `1px solid ${field.gradient.border}`,
                        opacity: isFocused ? 1 : 0,
                        transform: isFocused ? 'translateY(0)' : 'translateY(-10px)',
                        transition: 'all 0.3s ease'
                      }}>
                        <p style={{
                          margin: 0,
                          fontSize: '14px',
                          color: '#6b7280',
                          fontStyle: 'italic',
                          lineHeight: '1.4',
                          whiteSpace: 'pre-line'
                        }}>
                          💡 {field.placeholder}
                        </p>
                      </div>
                    </div>
                    
                    <textarea
                      name={field.name}
                      value={formData[field.name]}
                      onChange={handleChange}
                      onFocus={() => handleFocus(field.name)}
                      onBlur={handleBlur}
                      placeholder={isFocused ? '' : field.placeholder}
                      rows="6"
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: `1px solid ${isFocused ? field.gradient.iconBg.split(',')[0].replace('linear-gradient(135deg, ', '') : field.gradient.border}`,
                        borderRadius: '8px',
                        outline: 'none',
                        resize: 'none',
                        background: 'white',
                        transition: 'all 0.3s ease',
                        boxShadow: isFocused ? `0 0 0 3px ${field.gradient.border}40` : 'none'
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div style={{ 
            display: 'flex',
            gap: '16px',
            marginTop: '48px',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={handleBack}
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
            >
              <ArrowLeft size={20} />
              Back to Step 1
            </button>
            
            <button
              onClick={handleNext}
              disabled={isSubmitting}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                padding: '16px 32px',
                background: isSubmitting 
                  ? '#9ca3af' 
                  : 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontWeight: 'bold',
                fontSize: '18px',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                opacity: isSubmitting ? 0.7 : 1
              }}
              onMouseEnter={(e) => {
                if (!isSubmitting) {
                  e.target.style.transform = 'translateY(-2px)'
                  e.target.style.boxShadow = '0 15px 35px rgba(59, 130, 246, 0.4)'
                }
              }}
              onMouseLeave={(e) => {
                if (!isSubmitting) {
                  e.target.style.transform = 'translateY(0)'
                  e.target.style.boxShadow = 'none'
                }
              }}
            >
              {isSubmitting ? (
                <>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    border: '2px solid white',
                    borderTop: '2px solid transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                  Processing...
                </>
              ) : (
                <>
                  Continue to Step 3
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </div>

          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            {error && (
              <p style={{ 
                color: '#dc2626', 
                fontSize: '14px', 
                marginBottom: '8px',
                padding: '12px',
                background: '#fee2e2',
                borderRadius: '8px',
                border: '1px solid #fca5a5'
              }}>
                {error}
              </p>
            )}
            <p style={{ fontSize: '14px', color: '#6b7280' }}>
              All fields are optional. Skip any section that doesn't apply to you.
            </p>
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

export default ImproveResumeStep2