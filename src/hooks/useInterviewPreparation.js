import { useState, useEffect } from 'react'
import { mainAPI } from '../utils/api'

export const useInterviewPreparation = (sessionId) => {
  const [isPreparing, setIsPreparing] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState(null)
  const [extractionStatus, setExtractionStatus] = useState(null)

  const prepareInterview = async () => {
    if (!sessionId) return

    setIsPreparing(true)
    setError(null)

    try {
      const response = await mainAPI.prepareInterview(sessionId)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || `HTTP ${response.status}`)
      }

      const data = await response.json()
      setIsReady(data.ready_for_chat)
      setExtractionStatus(data)
      return data
    } catch (err) {
      setError(err.message)
      setIsReady(false)
      throw err
    } finally {
      setIsPreparing(false)
    }
  }

  const checkExtractionStatus = async () => {
    if (!sessionId) return

    try {
      const response = await mainAPI.getExtractionStatus(sessionId)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || `HTTP ${response.status}`)
      }

      const data = await response.json()
      setExtractionStatus(data)
      setIsReady(data.ready_for_chat)
      return data
    } catch (err) {
      setError(err.message)
      return null
    }
  }

  // Auto-check status when sessionId changes
  useEffect(() => {
    if (sessionId) {
      checkExtractionStatus()
    }
  }, [sessionId])

  return {
    isPreparing,
    isReady,
    error,
    extractionStatus,
    prepareInterview,
    checkExtractionStatus
  }
}
