import { useState, useRef, useEffect } from 'react'
import { 
  Briefcase, 
  Send, 
  Mic, 
  MicOff,
  Bot,
  User,
  Plus,
  Clock,
  Download
} from 'lucide-react'

const MockInterview = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      message: "Hello! I'm your AI interviewer. I'll help you practice for your upcoming interview. Let's start with a simple question: Can you tell me about yourself?",
      timestamp: new Date(),
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [currentInterview, setCurrentInterview] = useState('AI Engineer Interview')
  const messagesEndRef = useRef(null)

  const recentInterviews = [
    { id: 1, title: 'Software Engineer', date: '2024-01-15', duration: '25 min' },
    { id: 2, title: 'Product Manager', date: '2024-01-12', duration: '30 min' },
    { id: 3, title: 'Data Scientist', date: '2024-01-10', duration: '22 min' },
    { id: 4, title: 'UX Designer', date: '2024-01-08', duration: '28 min' }
  ]

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

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

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        "Great answer! I can see you have strong experience. Let me ask you about a technical challenge: How would you handle a situation where you need to optimize a slow-performing database query?",
        "That's a comprehensive response. Now, can you walk me through your problem-solving approach when facing a complex technical issue?",
        "Excellent! Your communication skills are clear. Let's discuss leadership: Tell me about a time when you had to lead a team through a difficult project.",
        "I appreciate your detailed explanation. For our final question: Where do you see yourself in 5 years, and how does this role align with your career goals?"
      ]

      const randomResponse = responses[Math.floor(Math.random() * responses.length)]

      const botMessage = {
        id: messages.length + 2,
        type: 'bot',
        message: randomResponse,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, botMessage])
      setIsTyping(false)
    }, 2000)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const toggleRecording = () => {
    setIsRecording(!isRecording)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#f8fafc' }}>
      {/* Sidebar */}
      <div style={{ 
        width: '280px', 
        background: 'white', 
        borderRight: '1px solid #e5e7eb',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Sidebar Header */}
        <div style={{ padding: '24px', borderBottom: '1px solid #e5e7eb' }}>
          <button 
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
              gap: '8px'
            }}
          >
            <Plus size={20} />
            Create Mock Interview
          </button>
        </div>

        {/* Recent Interviews */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <div style={{ padding: '24px' }}>
            <h3 style={{ 
              fontSize: '18px', 
              fontWeight: '600', 
              color: '#111827', 
              marginBottom: '16px'
            }}>
              Recent Interviews
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {recentInterviews.map((interview) => (
                <div
                  key={interview.id}
                  style={{
                    padding: '16px',
                    background: '#f9fafb',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.background = '#f3f4f6'}
                  onMouseLeave={(e) => e.target.style.background = '#f9fafb'}
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
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                        <span style={{ fontSize: '14px', color: '#6b7280' }}>{interview.date}</span>
                        <div style={{ width: '4px', height: '4px', background: '#9ca3af', borderRadius: '50%' }}></div>
                        <span style={{ fontSize: '14px', color: '#6b7280' }}>{interview.duration}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div style={{ padding: '24px', borderTop: '1px solid #e5e7eb' }}>
          <button 
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
            Download Transcript
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column'
      }}>
        {/* Chat Header */}
        <div style={{ 
          background: 'white', 
          borderBottom: '1px solid #e5e7eb', 
          padding: '16px 24px'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between'
          }}>
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
                gap: '4px',
                fontSize: '14px', 
                color: '#6b7280'
              }}>
                <Clock size={16} />
                <span>15:32</span>
              </div>
              <div style={{ 
                width: '8px', 
                height: '8px', 
                background: '#10b981', 
                borderRadius: '50%',
                animation: 'pulse 2s infinite'
              }}></div>
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
                  color: isRecording ? 'white' : '#6b7280'
                }}
                title={isRecording ? 'Stop recording' : 'Start voice recording'}
              >
                {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
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
              <span>Questions: {Math.floor(messages.length / 2)}/10</span>
              <span>•</span>
              <span>Time: 15:32</span>
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
  )
}

export default MockInterview