import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useInterviewPreparation } from '../hooks/useInterviewPreparation'
import { RefreshCw, CheckCircle, AlertCircle, FileText, Briefcase, ChevronDown } from 'lucide-react'

const InterviewPreparation = ({ sessionId, onReady, onError }) => {
  const navigate = useNavigate()
  const [user, setUser] = React.useState(null)
  const [dropdownVisible, setDropdownVisible] = React.useState(false)
  
  const {
    isPreparing,
    isReady,
    error,
    extractionStatus,
    prepareInterview,
    checkExtractionStatus
  } = useInterviewPreparation(sessionId)

  // Check if user is logged in
  React.useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
  }, [])

  React.useEffect(() => {
    if (isReady && onReady) {
      onReady(extractionStatus)
    }
  }, [isReady, extractionStatus, onReady])

  React.useEffect(() => {
    if (error && onError) {
      onError(error)
    }
  }, [error, onError])

  const handlePrepare = async () => {
    try {
      await prepareInterview()
    } catch (err) {
      console.error('Failed to prepare interview:', err)
    }
  }

  const handleRetry = async () => {
    try {
      await checkExtractionStatus()
    } catch (err) {
      console.error('Failed to check status:', err)
    }
  }

  if (isPreparing) {
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

        {/* Loading Content */}
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
            <h2 style={{ color: '#374151', marginBottom: '8px', fontSize: '20px' }}>
              Preparing Interview...
            </h2>
            <p style={{ color: '#6b7280', textAlign: 'center', margin: 0 }}>
              Extracting CV and Job Description data. Please wait...
            </p>
          </div>
        </div>

        {/* Add keyframes for animations */}
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

  if (error) {
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

        {/* Error Content */}
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
                onClick={handlePrepare}
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
                onClick={handleRetry}
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
                Check Status
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                style={{
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: 'white',
                  border: 'none',
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

        {/* Add keyframes for fade-in animation */}
        <style>
          {`
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

  if (isReady) {
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

        {/* Ready Content */}
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

        {/* Add keyframes for fade-in animation */}
        <style>
          {`
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

  // Not ready yet - show status
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

      {/* Default Content */}
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
            Click the button below to extract and analyze your CV and Job Description.
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
                background: extractionStatus.has_resume_data ? '#f0fdf4' : '#fef3c7',
                borderRadius: '8px',
                border: `1px solid ${extractionStatus.has_resume_data ? '#bbf7d0' : '#fde68a'}`
              }}>
                <FileText size={16} style={{ 
                  color: extractionStatus.has_resume_data ? '#059669' : '#d97706', 
                  marginRight: '8px' 
                }} />
                <span style={{ 
                  color: extractionStatus.has_resume_data ? '#166534' : '#92400e', 
                  fontSize: '14px', 
                  fontWeight: '500' 
                }}>
                  {extractionStatus.has_resume_data ? 'CV Ready' : 'CV Pending'}
                </span>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                padding: '8px 12px',
                background: extractionStatus.has_job_data ? '#eff6ff' : '#fef3c7',
                borderRadius: '8px',
                border: `1px solid ${extractionStatus.has_job_data ? '#bfdbfe' : '#fde68a'}`
              }}>
                <Briefcase size={16} style={{ 
                  color: extractionStatus.has_job_data ? '#2563eb' : '#d97706', 
                  marginRight: '8px' 
                }} />
                <span style={{ 
                  color: extractionStatus.has_job_data ? '#1e40af' : '#92400e', 
                  fontSize: '14px', 
                  fontWeight: '500' 
                }}>
                  {extractionStatus.has_job_data ? 'JD Ready' : 'JD Pending'}
                </span>
              </div>
            </div>
          )}
          
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
              display: 'flex',
              alignItems: 'center',
              fontSize: '14px',
              marginBottom: '12px',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#d1d5db'
              e.currentTarget.style.backgroundColor = '#f9fafb'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#e5e7eb'
              e.currentTarget.style.backgroundColor = 'white'
            }}
          >
            Change your CV and JD
          </button>
          
          <button
            onClick={handlePrepare}
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
            Prepare Interview
          </button>
        </div>
      </div>

      {/* Add keyframes for fade-in animation */}
      <style>
        {`
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

export default InterviewPreparation
