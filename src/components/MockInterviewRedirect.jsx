import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const MockInterviewRedirect = () => {
  const navigate = useNavigate()

  useEffect(() => {
    // Automatically redirect to preparation page
    navigate('/mock-interview/prepare', { replace: true })
  }, [navigate])

  // Show loading while redirecting
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)'
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '40px',
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #e5e7eb',
          borderTop: '4px solid #3b82f6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '16px'
        }}></div>
        <p style={{ color: '#6b7280', margin: 0 }}>
          Redirecting to Interview Preparation...
        </p>
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

export default MockInterviewRedirect

