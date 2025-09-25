import React from 'react'
import { useNavigate } from 'react-router-dom'
import InterviewPreparation from '../components/InterviewPreparation'

const MockInterviewPreparation = () => {
  const navigate = useNavigate()

  // Generate session ID for mock interview
  const sessionId = React.useMemo(() => {
    // Always check for existing session ID first
    const existingSessionId = localStorage.getItem('currentSessionId')
    if (existingSessionId) {
      return existingSessionId
    }
    
    // If no existing session, create a new one
    const newSessionId = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2)
    localStorage.setItem('currentSessionId', newSessionId)
    return newSessionId
  }, [])

  // Handle preparation ready - redirect to mock interview
  const handlePreparationReady = (extractionStatus) => {
    console.log('Preparation ready, redirecting to mock interview...', extractionStatus)
    navigate('/mock-interview/actual')
  }

  // Handle preparation error
  const handlePreparationError = (error) => {
    console.error('Preparation error:', error)
    // For now, still allow proceeding to mock interview
    navigate('/mock-interview/actual')
  }

  return (
    <InterviewPreparation
      sessionId={sessionId}
      onReady={handlePreparationReady}
      onError={handlePreparationError}
    />
  )
}

export default MockInterviewPreparation
