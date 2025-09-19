import React from 'react'
import { useInterviewPreparation } from '../hooks/useInterviewPreparation'
import { RefreshCw, CheckCircle, AlertCircle, FileText, Briefcase } from 'lucide-react'

const InterviewPreparation = ({ sessionId, onReady, onError }) => {
  const {
    isPreparing,
    isReady,
    error,
    extractionStatus,
    prepareInterview,
    checkExtractionStatus
  } = useInterviewPreparation(sessionId)

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
        margin: '0 auto'
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

  if (error) {
    return (
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
        margin: '0 auto'
      }}>
        <AlertCircle size={48} style={{ color: '#dc2626', marginBottom: '16px' }} />
        <h2 style={{ color: '#374151', marginBottom: '8px', fontSize: '20px' }}>
          Preparation Failed
        </h2>
        <p style={{ color: '#6b7280', textAlign: 'center', marginBottom: '24px' }}>
          {error}
        </p>
        <div style={{ display: 'flex', gap: '12px' }}>
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
        </div>
      </div>
    )
  }

  if (isReady) {
    return (
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
        margin: '0 auto'
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
            marginBottom: '24px'
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
    )
  }

  // Not ready yet - show status
  return (
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
      margin: '0 auto'
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
          marginBottom: '24px'
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
  )
}

export default InterviewPreparation
