import { useState, useRef, useEffect, useCallback } from 'react'
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause,
  Settings,
  RotateCcw,
  Maximize,
  Minimize,
  User,
  Bot
} from 'lucide-react'
import API_CONFIG from '../config/api'
import { createCustomAPI } from '../utils/api'

const VirtualInterviewer = () => {
  // Backend configuration
  const [backendUrl] = useState(() => {
    return localStorage.getItem('backendUrl') || API_CONFIG.BASE_URL
  })
  
  const [roomId] = useState(() => {
    const existingSessionId = localStorage.getItem('currentSessionId')
    if (existingSessionId) return existingSessionId
    const newSessionId = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2)
    localStorage.setItem('currentSessionId', newSessionId)
    return newSessionId
  })

  // Interview state
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      message: "Hello! I'm your Virtual AI Interviewer. I'll conduct a professional interview with you today. Are you ready to begin?",
      timestamp: new Date(),
    }
  ])
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  // 3D Avatar state
  const [avatarMood, setAvatarMood] = useState('neutral') // neutral, speaking, listening, thinking
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  // Speech settings
  const [speechSettings, setSpeechSettings] = useState({
    voice: 'female',
    speed: 1.0,
    pitch: 1.0,
    volume: 0.8,
    autoSpeak: true,
    language: 'en-US'
  })

  // Voice visualization
  const [audioLevel, setAudioLevel] = useState(0)
  const audioContextRef = useRef(null)
  const analyserRef = useRef(null)
  const streamRef = useRef(null)

  // Refs
  const recognitionRef = useRef(null)
  const synthRef = useRef(null)
  const avatarContainerRef = useRef(null)

  // Initialize Speech Recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = false
      recognitionRef.current.lang = speechSettings.language

      recognitionRef.current.onstart = () => {
        setIsListening(true)
        setAvatarMood('listening')
        startAudioVisualization()
      }

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript
        handleUserSpeech(transcript)
      }

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error)
        setIsListening(false)
        setAvatarMood('neutral')
      }

      recognitionRef.current.onend = () => {
        setIsListening(false)
        setAvatarMood('neutral')
        stopAudioVisualization()
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [speechSettings.language])

  // Handle user speech input
  const handleUserSpeech = async (transcript) => {
    if (!transcript.trim()) return

    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      message: transcript,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setIsProcessing(true)
    setAvatarMood('thinking')

    try {
      // Send to backend API
      const api = createCustomAPI(backendUrl)
      const response = await api.chatDomain({
        room_id: roomId,
        query: transcript
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      const botResponse = data.response || 'I apologize, but I could not process your response.'
      
      const botMessage = {
        id: messages.length + 2,
        type: 'bot',
        message: botResponse,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, botMessage])
      
      // Auto-speak the response if enabled
      if (speechSettings.autoSpeak) {
        speakText(botResponse)
      }
    } catch (error) {
      console.error('Backend API error:', error)
      const errorMessage = {
        id: messages.length + 2,
        type: 'bot',
        message: "I'm having trouble connecting to the server. Please check your connection and try again.",
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsProcessing(false)
      setAvatarMood('neutral')
    }
  }

  // Text-to-Speech function
  const speakText = useCallback((text) => {
    if ('speechSynthesis' in window) {
      // Stop any current speech
      window.speechSynthesis.cancel()
      
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = speechSettings.speed
      utterance.pitch = speechSettings.pitch
      utterance.volume = speechSettings.volume
      
      // Set voice
      const voices = window.speechSynthesis.getVoices()
      const selectedVoice = voices.find(voice => 
        voice.name.toLowerCase().includes(speechSettings.voice) ||
        voice.lang === speechSettings.language
      )
      if (selectedVoice) utterance.voice = selectedVoice

      utterance.onstart = () => {
        setIsSpeaking(true)
        setAvatarMood('speaking')
      }

      utterance.onend = () => {
        setIsSpeaking(false)
        setAvatarMood('neutral')
      }

      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event.error)
        setIsSpeaking(false)
        setAvatarMood('neutral')
      }

      window.speechSynthesis.speak(utterance)
    }
  }, [speechSettings])

  // Audio visualization functions
  const startAudioVisualization = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)()
      analyserRef.current = audioContextRef.current.createAnalyser()
      const source = audioContextRef.current.createMediaStreamSource(stream)
      source.connect(analyserRef.current)
      
      analyserRef.current.fftSize = 256
      const bufferLength = analyserRef.current.frequencyBinCount
      const dataArray = new Uint8Array(bufferLength)
      
      const updateAudioLevel = () => {
        if (analyserRef.current && isListening) {
          analyserRef.current.getByteFrequencyData(dataArray)
          const average = dataArray.reduce((a, b) => a + b) / bufferLength
          setAudioLevel(average / 255)
          requestAnimationFrame(updateAudioLevel)
        }
      }
      updateAudioLevel()
    } catch (error) {
      console.error('Audio visualization error:', error)
    }
  }

  const stopAudioVisualization = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
    }
    if (audioContextRef.current) {
      audioContextRef.current.close()
    }
    setAudioLevel(0)
  }

  // Start/Stop listening
  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop()
    } else {
      recognitionRef.current?.start()
    }
  }

  // Stop speaking
  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
      setAvatarMood('neutral')
    }
  }

  // Advanced 3D Avatar Component
  const Avatar3D = () => {
    return (
      <div 
        ref={avatarContainerRef}
        className="avatar-container"
        style={{
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)',
          borderRadius: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Animated Background */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 50% 50%, rgba(102, 126, 234, 0.1) 0%, transparent 70%)',
          animation: 'breathe 4s ease-in-out infinite'
        }} />

        {/* Neural Network Background */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
            radial-gradient(circle at 20% 30%, rgba(102, 126, 234, 0.1) 1px, transparent 1px),
            radial-gradient(circle at 80% 70%, rgba(118, 75, 162, 0.1) 1px, transparent 1px),
            radial-gradient(circle at 40% 80%, rgba(102, 126, 234, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: '100px 100px, 150px 150px, 200px 200px',
          animation: 'float 6s ease-in-out infinite'
        }} />

        {/* Main Avatar */}
        <div 
          className={`avatar-main ${avatarMood}`}
          style={{
            width: '280px',
            height: '280px',
            borderRadius: '50%',
            background: `
              radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.2) 0%, transparent 50%),
              linear-gradient(135deg, rgba(102, 126, 234, 0.3) 0%, rgba(118, 75, 162, 0.3) 100%)
            `,
            backdropFilter: 'blur(20px)',
            border: '3px solid rgba(255, 255, 255, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '120px',
            color: 'white',
            transition: 'all 0.5s ease',
            transform: avatarMood === 'speaking' ? 'scale(1.1)' : 'scale(1)',
            boxShadow: `
              0 0 60px rgba(102, 126, 234, ${avatarMood === 'speaking' ? '0.6' : '0.3'}),
              inset 0 0 60px rgba(255, 255, 255, 0.1)
            `,
            position: 'relative'
          }}
        >
          {/* Avatar Face */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            position: 'relative'
          }}>
            {avatarMood === 'speaking' ? (
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                animation: 'speaking 0.5s ease-in-out infinite alternate'
              }}>
                <div style={{ fontSize: '60px', marginBottom: '10px' }}>👨‍💼</div>
                <div style={{ fontSize: '20px', opacity: 0.8 }}>🗣️</div>
              </div>
            ) : avatarMood === 'listening' ? (
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                animation: 'listening 1s ease-in-out infinite'
              }}>
                <div style={{ fontSize: '60px', marginBottom: '10px' }}>👨‍💼</div>
                <div style={{ fontSize: '20px', opacity: 0.8 }}>👂</div>
              </div>
            ) : avatarMood === 'thinking' ? (
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                animation: 'thinking 2s ease-in-out infinite'
              }}>
                <div style={{ fontSize: '60px', marginBottom: '10px' }}>👨‍💼</div>
                <div style={{ fontSize: '20px', opacity: 0.8 }}>🤔</div>
              </div>
            ) : (
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                animation: 'idle 3s ease-in-out infinite'
              }}>
                <div style={{ fontSize: '60px', marginBottom: '10px' }}>👨‍💼</div>
                <div style={{ fontSize: '20px', opacity: 0.8 }}>😊</div>
              </div>
            )}
          </div>

          {/* Voice Waves (when speaking) */}
          {isSpeaking && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '100%',
              height: '100%',
              pointerEvents: 'none'
            }}>
              {[1, 2, 3].map(i => (
                <div
                  key={i}
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: `${100 + i * 40}%`,
                    height: `${100 + i * 40}%`,
                    border: '2px solid rgba(102, 126, 234, 0.3)',
                    borderRadius: '50%',
                    animation: `wave ${1 + i * 0.5}s ease-out infinite`
                  }}
                />
              ))}
            </div>
          )}

          {/* Listening Indicator with Audio Level */}
          {isListening && (
            <>
              <div style={{
                position: 'absolute',
                top: '10px',
                left: '10px',
                right: '10px',
                bottom: '10px',
                border: `3px dashed rgba(16, 185, 129, ${0.6 + audioLevel * 0.4})`,
                borderRadius: '50%',
                animation: 'listening-border 2s linear infinite',
                transform: `scale(${1 + audioLevel * 0.1})`
              }} />
              
              {/* Audio Level Bars */}
              <div style={{
                position: 'absolute',
                bottom: '80px',
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                gap: '4px',
                alignItems: 'end'
              }}>
                {[1, 2, 3, 4, 5].map(i => (
                  <div
                    key={i}
                    style={{
                      width: '6px',
                      height: `${20 + audioLevel * 40 * (i / 5)}px`,
                      background: `rgba(16, 185, 129, ${audioLevel > (i / 5) ? 0.8 : 0.3})`,
                      borderRadius: '3px',
                      transition: 'all 0.1s ease'
                    }}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Avatar Status */}
        <div 
          style={{
            position: 'absolute',
            bottom: '30px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '25px',
            fontSize: '16px',
            fontWeight: '600',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.3)'
          }}
        >
          {isProcessing ? '🧠 Processing your response...' :
           isSpeaking ? '🗣️ Speaking...' :
           isListening ? '👂 Listening carefully...' : '😊 Ready for your response'}
        </div>

        {/* Fullscreen Toggle */}
        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'rgba(255, 255, 255, 0.2)',
            border: 'none',
            borderRadius: '50%',
            width: '50px',
            height: '50px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'white',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(255, 255, 255, 0.3)'
            e.target.style.transform = 'scale(1.1)'
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(255, 255, 255, 0.2)'
            e.target.style.transform = 'scale(1)'
          }}
        >
          {isFullscreen ? <Minimize size={24} /> : <Maximize size={24} />}
        </button>

        {/* AI Info Panel */}
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          background: 'rgba(0, 0, 0, 0.7)',
          padding: '12px 16px',
          borderRadius: '12px',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>
            AI Interviewer
          </div>
          <div style={{ fontSize: '12px', opacity: 0.8 }}>
            Session: {roomId.slice(0, 8)}...
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0f0f23', color: 'white' }}>
      {/* Header */}
      <header style={{ 
        background: 'rgba(255, 255, 255, 0.1)', 
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '20px'
      }}>
        <div style={{ 
          maxWidth: '1400px', 
          margin: '0 auto', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '50px',
              height: '50px',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px'
            }}>
              🤖
            </div>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>
                Virtual AI Interviewer
              </h1>
              <p style={{ margin: 0, opacity: 0.7, fontSize: '14px' }}>
                Immersive 3D Interview Experience
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => setShowSettings(!showSettings)}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                padding: '8px',
                color: 'white',
                cursor: 'pointer'
              }}
            >
              <Settings size={20} />
            </button>
          </div>
        </div>
      </header>

      <div style={{ 
        maxWidth: '1400px', 
        margin: '0 auto', 
        padding: '20px',
        display: 'grid',
        gridTemplateColumns: isFullscreen ? '1fr' : '1fr 400px',
        gap: '20px',
        minHeight: 'calc(100vh - 140px)'
      }}>
        {/* 3D Avatar Section */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '20px',
          padding: '20px',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <Avatar3D />
        </div>

        {/* Chat & Controls Section */}
        {!isFullscreen && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}>
            {/* Chat Messages */}
            <div style={{
              flex: 1,
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '15px',
              padding: '20px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              maxHeight: '400px',
              overflowY: 'auto'
            }}>
              <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '18px' }}>
                Interview Transcript
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {messages.map((message) => (
                  <div key={message.id} style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    flexDirection: message.type === 'user' ? 'row-reverse' : 'row'
                  }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: message.type === 'user' ? '#667eea' : '#764ba2',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {message.type === 'user' ? <User size={16} /> : <Bot size={16} />}
                    </div>
                    
                    <div style={{
                      background: message.type === 'user' ? 'rgba(102, 126, 234, 0.2)' : 'rgba(118, 75, 162, 0.2)',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      maxWidth: '280px',
                      fontSize: '14px',
                      lineHeight: '1.4'
                    }}>
                      <p style={{ margin: 0, marginBottom: '4px' }}>
                        {message.message}
                      </p>
                      <span style={{ 
                        fontSize: '12px', 
                        opacity: 0.6,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {message.type === 'bot' && (
                          <button
                            onClick={() => speakText(message.message)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'inherit',
                              cursor: 'pointer',
                              padding: '2px'
                            }}
                          >
                            <Volume2 size={12} />
                          </button>
                        )}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Enhanced Controls */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '15px',
              padding: '20px',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '18px' }}>
                🎙️ Voice Controls
              </h3>
              
              <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                <button
                  onClick={toggleListening}
                  disabled={isSpeaking || isProcessing}
                  style={{
                    flex: 1,
                    background: isListening ? 
                      'linear-gradient(135deg, #ef4444, #dc2626)' : 
                      'linear-gradient(135deg, #10b981, #059669)',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '16px',
                    color: 'white',
                    fontWeight: 'bold',
                    cursor: isListening || isSpeaking || isProcessing ? 'not-allowed' : 'pointer',
                    opacity: isSpeaking || isProcessing ? 0.5 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.3s ease',
                    boxShadow: isListening ? '0 0 20px rgba(239, 68, 68, 0.5)' : '0 0 20px rgba(16, 185, 129, 0.3)'
                  }}
                >
                  {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                  {isListening ? 'Stop Listening' : 'Start Speaking'}
                </button>

                <button
                  onClick={stopSpeaking}
                  disabled={!isSpeaking}
                  style={{
                    background: 'linear-gradient(135deg, #6b7280, #4b5563)',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '16px',
                    color: 'white',
                    cursor: isSpeaking ? 'pointer' : 'not-allowed',
                    opacity: isSpeaking ? 1 : 0.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <VolumeX size={20} />
                </button>
              </div>

              {/* Status with visual feedback */}
              <div style={{ 
                fontSize: '14px', 
                textAlign: 'center',
                padding: '12px',
                borderRadius: '8px',
                background: isProcessing ? 'rgba(59, 130, 246, 0.2)' :
                           isListening ? 'rgba(16, 185, 129, 0.2)' :
                           isSpeaking ? 'rgba(139, 92, 246, 0.2)' :
                           'rgba(255, 255, 255, 0.1)',
                border: `1px solid ${isProcessing ? 'rgba(59, 130, 246, 0.3)' :
                                    isListening ? 'rgba(16, 185, 129, 0.3)' :
                                    isSpeaking ? 'rgba(139, 92, 246, 0.3)' :
                                    'rgba(255, 255, 255, 0.2)'}`,
                transition: 'all 0.3s ease'
              }}>
                {isProcessing ? '🧠 AI is processing your response...' :
                 isListening ? `🎤 Listening... Volume: ${Math.round(audioLevel * 100)}%` :
                 isSpeaking ? '🔊 AI is speaking...' :
                 '✨ Click "Start Speaking" to respond with your voice'}
              </div>

              {/* Quick Actions */}
              <div style={{ 
                display: 'flex', 
                gap: '8px', 
                marginTop: '16px',
                fontSize: '12px'
              }}>
                <button
                  onClick={() => speakText(messages[messages.length - 1]?.message || '')}
                  disabled={!messages.length || isSpeaking}
                  style={{
                    flex: 1,
                    background: 'rgba(139, 92, 246, 0.2)',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    borderRadius: '8px',
                    padding: '8px',
                    color: 'white',
                    cursor: 'pointer',
                    opacity: !messages.length || isSpeaking ? 0.5 : 1
                  }}
                >
                  🔄 Repeat Last
                </button>
                
                <button
                  onClick={() => {
                    setMessages([messages[0]])
                    window.speechSynthesis.cancel()
                    recognitionRef.current?.stop()
                  }}
                  style={{
                    flex: 1,
                    background: 'rgba(239, 68, 68, 0.2)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: '8px',
                    padding: '8px',
                    color: 'white',
                    cursor: 'pointer'
                  }}
                >
                  🔄 Reset Chat
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#1a1a2e',
            borderRadius: '20px',
            padding: '30px',
            width: '400px',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <h3 style={{ marginTop: 0, marginBottom: '20px' }}>Speech Settings</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>
                  Voice Type
                </label>
                <select
                  value={speechSettings.voice}
                  onChange={(e) => setSpeechSettings(prev => ({ ...prev, voice: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: 'white'
                  }}
                >
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>
                  Speech Speed: {speechSettings.speed}
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={speechSettings.speed}
                  onChange={(e) => setSpeechSettings(prev => ({ ...prev, speed: parseFloat(e.target.value) }))}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>
                  Volume: {Math.round(speechSettings.volume * 100)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={speechSettings.volume}
                  onChange={(e) => setSpeechSettings(prev => ({ ...prev, volume: parseFloat(e.target.value) }))}
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  id="autoSpeak"
                  checked={speechSettings.autoSpeak}
                  onChange={(e) => setSpeechSettings(prev => ({ ...prev, autoSpeak: e.target.checked }))}
                />
                <label htmlFor="autoSpeak" style={{ fontSize: '14px' }}>
                  Auto-speak AI responses
                </label>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button
                onClick={() => setShowSettings(false)}
                style={{
                  flex: 1,
                  background: '#6b7280',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px',
                  color: 'white',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Advanced Custom Styles */}
      <style>
        {`
          .avatar-container {
            transition: all 0.3s ease;
          }
          
          /* Avatar Animations */
          @keyframes breathe {
            0%, 100% { transform: scale(1); opacity: 0.1; }
            50% { transform: scale(1.1); opacity: 0.2; }
          }
          
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            33% { transform: translateY(-10px) rotate(120deg); }
            66% { transform: translateY(5px) rotate(240deg); }
          }
          
          @keyframes speaking {
            0% { transform: scale(1) rotate(-2deg); }
            100% { transform: scale(1.05) rotate(2deg); }
          }
          
          @keyframes listening {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.02); }
          }
          
          @keyframes thinking {
            0% { transform: rotate(0deg); }
            25% { transform: rotate(-5deg); }
            75% { transform: rotate(5deg); }
            100% { transform: rotate(0deg); }
          }
          
          @keyframes idle {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-8px); }
          }
          
          @keyframes wave {
            0% { 
              transform: translate(-50%, -50%) scale(0.8); 
              opacity: 0.8; 
            }
            100% { 
              transform: translate(-50%, -50%) scale(1.5); 
              opacity: 0; 
            }
          }
          
          @keyframes listening-border {
            0% { 
              transform: rotate(0deg); 
              border-color: rgba(16, 185, 129, 0.6); 
            }
            50% { 
              border-color: rgba(16, 185, 129, 0.3); 
            }
            100% { 
              transform: rotate(360deg); 
              border-color: rgba(16, 185, 129, 0.6); 
            }
          }

          /* Scrollbar styling */
          ::-webkit-scrollbar {
            width: 6px;
          }
          
          ::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 3px;
          }
          
          ::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.3);
            border-radius: 3px;
          }
          
          ::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.5);
          }

          /* Responsive design */
          @media (max-width: 768px) {
            .avatar-main {
              width: 200px !important;
              height: 200px !important;
              font-size: 80px !important;
            }
          }
        `}
      </style>
    </div>
  )
}

export default VirtualInterviewer
