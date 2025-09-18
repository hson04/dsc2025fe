import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Briefcase, 
  Send, 
  Mic, 
  MicOff,
  Bot,
  User,
  Plus,
  Clock,
  Download,
  Menu,
  X
} from 'lucide-react'
import API_CONFIG from '../config/api'
import { createCustomAPI } from '../utils/api'

const MockInterview = () => {
  const navigate = useNavigate()
  
  // Backend configuration
  const [backendUrl, setBackendUrl] = useState(() => {
    return localStorage.getItem('backendUrl') || API_CONFIG.BASE_URL
  })
  const [roomId, setRoomId] = useState(() => {
    // Try to get existing session from localStorage
    const existingSessionId = localStorage.getItem('currentSessionId')
    if (existingSessionId) {
      return existingSessionId
    }
    // Create new session only if none exists
    const newSessionId = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2)
    localStorage.setItem('currentSessionId', newSessionId)
    return newSessionId
  })
  
  const [messages, setMessages] = useState(() => {
    // Get session ID first
    const sessionId = localStorage.getItem('currentSessionId') || (crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2))
    
    // Try to restore messages from localStorage
    const savedMessages = localStorage.getItem(`messages_${sessionId}`)
    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages)
        // Convert timestamp strings back to Date objects
        return parsedMessages.map(msg => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
      } catch (error) {
        console.error('Error parsing saved messages:', error)
      }
    }
    // Default message if no saved messages
    return [
      {
        id: 1,
        type: 'bot',
        message: "Hello! I'm your AI interviewer. I'll help you practice for your upcoming interview. Let's start with a simple question: Can you tell me about yourself?",
        timestamp: new Date(),
      }
    ]
  })
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingSeconds, setRecordingSeconds] = useState(0)
  const language = 'vi'
  const mediaRecorderRef = useRef(null)
  const recordTimerRef = useRef(null)
  const [currentInterview, setCurrentInterview] = useState('New Interview')
  const [recentInterviews, setRecentInterviews] = useState([])
  const [loadingInterviews, setLoadingInterviews] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  // Navigate to home page
  const goToHome = () => {
    navigate('/')
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Save messages to localStorage whenever messages change
  useEffect(() => {
    localStorage.setItem(`messages_${roomId}`, JSON.stringify(messages))
  }, [messages, roomId])

  // Save backendUrl to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('backendUrl', backendUrl)
  }, [backendUrl])

  // Restore messages when roomId changes (e.g., on page refresh)
  useEffect(() => {
    const savedMessages = localStorage.getItem(`messages_${roomId}`)
    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages)
        const restoredMessages = parsedMessages.map(msg => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
        setMessages(restoredMessages)
      } catch (error) {
        console.error('Error restoring messages:', error)
      }
    }
  }, [roomId])

  // Handle window resize to close sidebar on desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setSidebarOpen(false)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Fetch recent interviews from API - only completed interviews
  const fetchRecentInterviews = async () => {
    try {
      setLoadingInterviews(true)
      const api = createCustomAPI(backendUrl)
      const response = await api.getInterviewSessions()
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      // Filter only completed interviews
      const completedInterviews = (data.sessions || []).filter(session => 
        session.status == 'completed'
      )
      setRecentInterviews(completedInterviews)
    } catch (error) {
      console.error('Failed to fetch recent interviews:', error)
      // Keep empty array on error
      setRecentInterviews([])
    } finally {
      setLoadingInterviews(false)
    }
  }

  useEffect(() => {
    fetchRecentInterviews()
  }, [backendUrl])

  // API functions for chatbot_mi backend
  const sendMessageToBackend = async (messageText) => {
    try {
      const api = createCustomAPI(backendUrl)
      const response = await api.chatDomain({
        room_id: roomId,
        query: messageText
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      return data.response || 'Sorry, I could not process your request.'
    } catch (error) {
      console.error('Backend API error:', error)
      return `❌ Error connecting to backend: ${error.message}. Please check if the backend is running on ${backendUrl}`
    }
  }

  const sendMessage = async (messageText = inputMessage) => {
    if (!messageText.trim()) return

    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      message: messageText,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsTyping(true)

    try {
      // Get real response from backend
      const botResponse = await sendMessageToBackend(messageText)
      
      const botMessage = {
        id: messages.length + 2,
        type: 'bot',
        message: botResponse,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, botMessage])
    } catch (error) {
      // Fallback message if backend fails
      const errorMessage = {
        id: messages.length + 2,
        type: 'bot',
        message: "I'm having trouble connecting to the backend. Please check your connection and try again.",
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
    }
  }

  const downloadInterviewReport = async () => {
    try {
      // Save session data to localStorage for EvaluationReport
      localStorage.setItem('currentSessionId', roomId)
      localStorage.setItem('backendUrl', backendUrl)
      
      // Navigate to evaluation report page
      window.location.href = `/evaluation-report?sessionId=${encodeURIComponent(roomId)}`
      
    } catch (error) {
      console.error('Navigate to report error:', error)
      alert(`Failed to open report: ${error.message}`)
    }
  }

  const handleInterviewClick = (interview) => {
    try {
      // Save session data to localStorage for EvaluationReport
      localStorage.setItem('currentSessionId', interview.session_id)
      localStorage.setItem('backendUrl', backendUrl)
      
      // Navigate to evaluation report page with specific session
      window.location.href = `/evaluation-report?sessionId=${encodeURIComponent(interview.session_id)}`
      
    } catch (error) {
      console.error('Navigate to report error:', error)
      alert(`Failed to open report: ${error.message}`)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // Function to create a new session
  const createNewSession = () => {
    if (window.confirm('Are you sure you want to start a new interview session? This will clear the current conversation.')) {
      // Generate new session ID
      const newSessionId = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2)
      
      // Update localStorage
      localStorage.setItem('currentSessionId', newSessionId)
      
      // Clear old messages from localStorage
      localStorage.removeItem(`messages_${roomId}`)
      
      // Update state
      setRoomId(newSessionId)
      setMessages([
        {
          id: 1,
          type: 'bot',
          message: "Hello! I'm your AI interviewer. I'll help you practice for your upcoming interview. Let's start with a simple question: Can you tell me about yourself?",
          timestamp: new Date(),
        }
      ])
      
      // Refresh recent interviews
      fetchRecentInterviews()
    }
  }

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : undefined
      const mr = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
      const chunks = []
      mr.ondataavailable = (e) => { if (e.data && e.data.size > 0) chunks.push(e.data) }
      mr.onstop = async () => {
        try {
          const blob = new Blob(chunks, { type: mimeType || 'audio/webm' })
          await sendVoice(blob)
        } catch (e) {
          console.error('Voice send failed:', e)
          alert('Voice send failed: ' + (e?.message || e))
        } finally {
          // stop all tracks
          stream.getTracks().forEach(t => t.stop())
        }
      }
      mediaRecorderRef.current = mr
      setRecordingSeconds(0)
      recordTimerRef.current = setInterval(() => setRecordingSeconds(prev => prev + 1), 1000)
      mr.start()
      setIsRecording(true)
    } catch (err) {
      console.error('Mic permission or init failed:', err)
      alert('Không thể truy cập micro. Vui lòng kiểm tra quyền truy cập.')
    }
  }

  const stopRecording = () => {
    try {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop()
      }
    } finally {
      if (recordTimerRef.current) {
        clearInterval(recordTimerRef.current)
        recordTimerRef.current = null
      }
      setIsRecording(false)
    }
  }

  const toggleRecording = () => {
    if (isRecording) stopRecording(); else startRecording()
  }

  const sendVoice = async (blob) => {
    try {
      // Step 1: Transcribe audio to text
      const form = new FormData()
      form.append('file', blob, 'answer.webm')
      form.append('language', language)
      
      const api = createCustomAPI(backendUrl)
      const transcribeRes = await api.transcribe(form)
      
      if (!transcribeRes.ok) {
        throw new Error(`Transcription failed: HTTP ${transcribeRes.status}`)
      }
      
      const transcribeData = await transcribeRes.json()
      const transcriptText = transcribeData.text || transcribeData
      
      if (!transcriptText || transcriptText.trim() === '') {
        throw new Error('No text was transcribed from audio')
      }

      // Step 2: Send transcribed text to chatDomain (same as typing)
      await sendMessage(transcriptText)
      
    } catch (error) {
      console.error('Voice processing failed:', error)
      alert(`Voice processing failed: ${error.message}`)
    }
  }

  return (    <>
      {/* Custom CSS for scrollbar */}
      <style>
        {`
          .sidebar-scroll::-webkit-scrollbar {
            width: 6px;
          }
          .sidebar-scroll::-webkit-scrollbar-track {
            background: #f1f5f9;
          }
          .sidebar-scroll::-webkit-scrollbar-thumb {
            background: #cbd5e1;
            border-radius: 3px;
          }
          .sidebar-scroll::-webkit-scrollbar-thumb:hover {
            background: #94a3b8;
          }
          @media (max-width: 768px) {
            .sidebar-fixed {
              transform: translateX(-100%);
              transition: transform 0.3s ease;
              z-index: 1001;
            }
            .sidebar-fixed.open {
              transform: translateX(0);
            }
            .main-content {
              margin-left: 0 !important;
              width: 100% !important;
            }
            .mobile-menu-btn {
              display: block !important;
            }
            .sidebar-overlay {
              position: fixed;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              background: rgba(0, 0, 0, 0.5);
              z-index: 1000;
              display: none;
            }
            .sidebar-overlay.open {
              display: block;
            }
          }
          @media (min-width: 769px) {
            .mobile-menu-btn {
              display: none !important;
            }
            .sidebar-overlay {
              display: none !important;
            }
          }
          .sticky-header {
            position: sticky;
            top: 0;
            z-index: 100;
            background: white;
            border-bottom: 1px solid #e5e7eb;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          }
        `}
      </style>
      <div style={{ minHeight: '100vh', display: 'flex', background: '#f8fafc' }}>
      {/* Mobile Overlay */}
      <div 
        className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />
      
      {/* Sidebar - Fixed */}
      <div 
        className={`sidebar-fixed sidebar-scroll ${sidebarOpen ? 'open' : ''}`}
        style={{ 
          width: '280px', 
          background: 'white', 
          borderRight: '1px solid #e5e7eb',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          zIndex: 1001,
          overflowY: 'auto',
          boxShadow: '2px 0 8px rgba(0, 0, 0, 0.1)',
          scrollbarWidth: 'thin',
          scrollbarColor: '#cbd5e1 #f1f5f9'
        }}>
        {/* Sidebar Header */}
        <div style={{ padding: '24px', borderBottom: '1px solid #e5e7eb', position: 'relative' }}>
          {/* Mobile Close Button */}
          <button
            onClick={() => setSidebarOpen(false)}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#6b7280'
            }}
            className="mobile-menu-btn"
          >
            <X size={20} />
          </button>
          
          {/* CVision Logo */}
          <div 
            onClick={goToHome}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '20px',
              padding: '12px',
              background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)',
              borderRadius: '12px',
              border: '1px solid #e5e7eb',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'linear-gradient(135deg, #e2e8f0, #cbd5e1)'
              e.target.style.transform = 'translateY(-1px)'
              e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)'
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'linear-gradient(135deg, #f8fafc, #e2e8f0)'
              e.target.style.transform = 'translateY(0)'
              e.target.style.boxShadow = 'none'
            }}
          >
            <div style={{
              width: '40px',
              height: '40px',
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
            }}>
              <Bot size={20} color="white" />
            </div>
            <div>
              <h1 style={{
                fontSize: '18px',
                fontWeight: '700',
                color: '#1e293b',
                margin: 0,
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                CVision
              </h1>
              <p style={{
                fontSize: '12px',
                color: '#64748b',
                margin: 0,
                fontWeight: '500'
              }}>
                AI Mock Interview
              </p>
            </div>
          </div>
          
          <button 
            onClick={createNewSession}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-1px)'
              e.target.style.boxShadow = '0 6px 16px rgba(59, 130, 246, 0.4)'
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)'
              e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)'
            }}
          >
            <Plus size={20} />
            New Interview Session
          </button>
        </div>

        {/* Recent Interviews */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <div style={{ padding: '24px' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              marginBottom: '16px'
            }}>
              <h3 style={{ 
                fontSize: '18px', 
                fontWeight: '600', 
                color: '#111827'
              }}>
                Recent Interviews
              </h3>
              <button
                onClick={fetchRecentInterviews}
                disabled={loadingInterviews}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: loadingInterviews ? 'not-allowed' : 'pointer',
                  color: '#6b7280',
                  fontSize: '12px',
                  opacity: loadingInterviews ? 0.5 : 1
                }}
                title="Refresh interviews"
              >
                {loadingInterviews ? 'Loading...' : 'Refresh'}
              </button>
            </div>
            
            {loadingInterviews ? (
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                padding: '40px',
                color: '#6b7280'
              }}>
                <div style={{ 
                  width: '20px', 
                  height: '20px', 
                  border: '2px solid #e5e7eb', 
                  borderTop: '2px solid #3b82f6', 
                  borderRadius: '50%', 
                  animation: 'spin 1s linear infinite',
                  marginRight: '8px'
                }}></div>
                Loading interviews...
              </div>
            ) : recentInterviews.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '40px', 
                color: '#6b7280' 
              }}>
                <Briefcase size={32} style={{ margin: '0 auto 12px auto', opacity: 0.5 }} />
                <p style={{ fontSize: '14px', margin: 0 }}>
                  No completed interviews yet.<br />
                  <span style={{ fontSize: '12px', color: '#9ca3af' }}>
                    Only finished interviews appear here.
                  </span>
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {recentInterviews.map((interview) => (
                  <div
                    key={interview.session_id}
                    onClick={() => handleInterviewClick(interview)}
                    style={{
                      padding: '16px',
                      background: '#f9fafb',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      border: '1px solid #e5e7eb'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = '#f3f4f6'
                      e.target.style.borderColor = '#3b82f6'
                      e.target.style.transform = 'translateY(-1px)'
                      e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.15)'
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = '#f9fafb'
                      e.target.style.borderColor = '#e5e7eb'
                      e.target.style.transform = 'translateY(0)'
                      e.target.style.boxShadow = 'none'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        background: '#dbeafe',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Briefcase size={18} color="#3b82f6" />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h4 style={{ 
                          fontWeight: '500', 
                          color: '#111827', 
                          marginBottom: '4px',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {interview.title}
                        </h4>
                        <div style={{ marginTop: '4px' }}>
                          <span style={{ fontSize: '14px', color: '#6b7280' }}>{interview.date}</span>
                        </div>
                        <div style={{ 
                          display: 'flex', 
                          gap: '8px', 
                          marginTop: '8px',
                          fontSize: '12px'
                        }}>
                          {interview.has_cv && (
                            <span style={{ 
                              background: '#d1fae5', 
                              color: '#065f46', 
                              padding: '2px 6px', 
                              borderRadius: '4px' 
                            }}>
                              CV
                            </span>
                          )}
                          {interview.has_jd && (
                            <span style={{ 
                              background: '#dbeafe', 
                              color: '#1e40af', 
                              padding: '2px 6px', 
                              borderRadius: '4px' 
                            }}>
                              JD
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Footer */}
        <div style={{ padding: '24px', borderTop: '1px solid #e5e7eb' }}>
          <button 
            onClick={downloadInterviewReport}
            style={{
              width: '100%',
              background: 'white',
              color: '#374151',
              border: '2px solid #e5e7eb',
              padding: '12px 24px',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <Download size={16} />
            View Report
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div 
        className="main-content"
        style={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column',
          marginLeft: '280px',
          width: 'calc(100% - 280px)'
        }}>
        {/* Chat Header */}
        <div 
          className="sticky-header"
          style={{ 
            padding: '16px 24px'
          }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between'
          }}>
            {/* Mobile Menu Button */}
            <button
              onClick={() => setSidebarOpen(true)}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '8px',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#6b7280',
                marginRight: '12px'
              }}
              className="mobile-menu-btn"
            >
              <Menu size={24} />
            </button>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Bot size={20} color="white" />
              </div>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#111827' }}>
                  {currentInterview}
                </h2>
                <p style={{ fontSize: '14px', color: '#6b7280' }}>
                  AI Mock Interview Session
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px'
              }}>
                <div style={{ 
                  width: '8px', 
                  height: '8px', 
                  background: '#10b981', 
                  borderRadius: '50%',
                  animation: 'pulse 2s infinite'
                }}></div>
                <button
                  onClick={() => navigate('/dashboard')}
                  style={{
                    fontSize: '12px',
                    color: '#3b82f6',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    padding: '0',
                    fontWeight: '500'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.color = '#1d4ed8'
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = '#3b82f6'
                  }}
                >
                  Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div style={{ 
          flex: 1, 
          overflowY: 'auto', 
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px'
        }}>
          {messages.map((message) => (
            <div key={message.id} style={{ 
              display: 'flex', 
              justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start'
            }}>
              <div style={{ 
                display: 'flex',
                alignItems: 'flex-end', 
                gap: '8px', 
                maxWidth: '70%',
                flexDirection: message.type === 'user' ? 'row-reverse' : 'row'
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: message.type === 'user' ? '#3b82f6' : '#e5e7eb',
                  flexShrink: 0
                }}>
                  {message.type === 'user' ? (
                    <User size={16} color="white" />
                  ) : (
                    <Bot size={16} color="#6b7280" />
                  )}
                </div>
                
                <div style={{
                  background: message.type === 'user' ? '#3b82f6' : '#e5e7eb',
                  color: message.type === 'user' ? 'white' : '#374151',
                  padding: '12px 16px',
                  borderRadius: message.type === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  maxWidth: '100%'
                }}>
                  <p style={{ 
                    fontSize: '14px', 
                    lineHeight: '1.5', 
                    whiteSpace: 'pre-wrap',
                    margin: 0
                  }}>
                    {message.message}
                  </p>
                  
                  {/* Show Start Interview button in bot messages that contain interview plan */}
                  {message.type === 'bot' && 
                   message.message.includes('đồng ý')  && (
                    <div style={{ marginTop: '12px' }}>
                      <button
                        onClick={() => sendMessage('Start')}
                        style={{
                          padding: '8px 16px',
                          borderRadius: '6px',
                          border: 'none',
                          cursor: 'pointer',
                          background: 'linear-gradient(135deg,rgb(87, 152, 250),rgb(183, 221, 254))',
                          color: 'white',
                          fontWeight: '600',
                          fontSize: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}
                      >
                        🚀 Start
                      </button>
                    </div>
                  )}
                  
                  <p style={{ 
                    fontSize: '12px', 
                    marginTop: '8px',
                    color: message.type === 'user' ? 'rgba(255,255,255,0.7)' : '#6b7280'
                  }}>
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: '#e5e7eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Bot size={16} color="#6b7280" />
                </div>
                <div style={{
                  background: '#e5e7eb',
                  borderRadius: '16px 16px 16px 4px',
                  padding: '12px 16px'
                }}>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      background: '#6b7280',
                      borderRadius: '50%',
                      animation: 'bounce 1s infinite'
                    }}></div>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      background: '#6b7280',
                      borderRadius: '50%',
                      animation: 'bounce 1s infinite 0.1s'
                    }}></div>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      background: '#6b7280',
                      borderRadius: '50%',
                      animation: 'bounce 1s infinite 0.2s'
                    }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div style={{ 
          background: 'white', 
          borderTop: '1px solid #e5e7eb', 
          padding: '24px'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'flex-end', 
            gap: '16px'
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ position: 'relative' }}>
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your answer here..."
                  rows="3"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    fontSize: '14px',
                    lineHeight: '1.5',
                    resize: 'none',
                    outline: 'none'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
                <div style={{
                  position: 'absolute',
                  bottom: '12px',
                  right: '12px',
                  fontSize: '12px',
                  color: '#9ca3af'
                }}>
                  Press Enter to send
                </div>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={toggleRecording}
                style={{
                  padding: '12px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  background: isRecording ? '#ef4444' : '#f3f4f6',
                  color: isRecording ? 'white' : '#6b7280',
                  position: 'relative'
                }}
                title={isRecording ? 'Stop recording' : 'Start voice recording'}
              >
                {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
                {isRecording && (
                  <span style={{
                    position: 'absolute',
                    top: '-10px',
                    right: '-10px',
                    background: '#ef4444',
                    color: 'white',
                    borderRadius: '999px',
                    padding: '2px 6px',
                    fontSize: '10px',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                  }}>
                    {recordingSeconds}s
                  </span>
                )}
              </button>
              
              <button
                onClick={() => sendMessage()}
                disabled={!inputMessage.trim() || isTyping}
                style={{
                  padding: '12px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: inputMessage.trim() && !isTyping ? 'pointer' : 'not-allowed',
                  background: inputMessage.trim() && !isTyping ? '#3b82f6' : '#e5e7eb',
                  color: inputMessage.trim() && !isTyping ? 'white' : '#9ca3af'
                }}
              >
                <Send size={20} />
              </button>
            </div>
          </div>
          
          <div style={{ 
            marginTop: '12px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between'
          }}>
            <p style={{ fontSize: '12px', color: '#6b7280' }}>
              Speak naturally and take your time to answer thoroughly
            </p>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '16px',
              fontSize: '12px', 
              color: '#6b7280'
            }}>
            </div>
          </div>
        </div>
      </div>

      {/* Add CSS for animations */}
      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
          
          @keyframes bounce {
            0%, 20%, 53%, 80%, 100% { transform: translateY(0); }
            40%, 43% { transform: translateY(-8px); }
            70% { transform: translateY(-4px); }
            90% { transform: translateY(-2px); }
          }
        `}
      </style>
      </div>
    </>
  )
}

export default MockInterview