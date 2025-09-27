import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Settings,
  Maximize,
  Minimize,
  User,
  Bot,
  RotateCcw,
  Zap,
  Brain,
  Plus
} from 'lucide-react'
import API_CONFIG from '../config/api'
import { createCustomAPI } from '../utils/api'
import InterviewPreparation from '../components/InterviewPreparation'

const VirtualInterviewer = () => {
  const navigate = useNavigate()
  
  // Interview preparation state
  const [isInterviewReady, setIsInterviewReady] = useState(false)
  const [preparationError, setPreparationError] = useState(null)

  // Interview preparation handlers
  const handleInterviewReady = (status) => {
    console.log('Interview preparation completed:', status)
    setIsInterviewReady(true)
    setPreparationError(null)
  }

  const handlePreparationError = (error) => {
    console.error('Interview preparation failed:', error)
    setPreparationError(error)
    setIsInterviewReady(false)
  }

  // Function to create a new session
  const createNewSession = () => {
    if (window.confirm('Are you sure you want to start a new virtual interview session? This will reset the current conversation.')) {
      // Generate new session ID
      const newSessionId = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2)
      
      // Update localStorage
      localStorage.setItem('currentSessionId', newSessionId)
      
      // Reset state to show preparation again
      setIsInterviewReady(false)
      setPreparationError(null)
      
      // Reset messages
      setMessages([
        {
          id: 1,
          type: 'bot',
          message: "Hello! I'm your Virtual AI Interviewer. I'll conduct a professional interview with you today. Are you ready to begin?",
          timestamp: new Date(),
        }
      ])
      
      // Update roomId to trigger re-preparation
      window.location.reload() // Simple way to restart the entire component
    }
  }

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

  // Avatar state
  const [avatarMood, setAvatarMood] = useState('neutral')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [selectedAvatar, setSelectedAvatar] = useState({
    id: 'professional-male',
    name: 'Professional Male',
    emoji: '👨‍💼',
    personality: 'confident'
  })

  // Speech settings
  const [speechSettings, setSpeechSettings] = useState({
    voice: 'female',
    speed: 1.0,
    pitch: 1.0,
    volume: 0.8,
    autoSpeak: true,
    language: 'en-US'
  })

  // Audio visualization
  const [audioLevel, setAudioLevel] = useState(0)
  const audioContextRef = useRef(null)
  const analyserRef = useRef(null)
  const streamRef = useRef(null)
  const recognitionRef = useRef(null)
  const avatarRef = useRef(null)

  // Avatar presets
  const avatarPresets = [
    { id: 'professional-male', name: 'Professional Male', emoji: '👨‍💼', personality: 'confident' },
    { id: 'professional-female', name: 'Professional Female', emoji: '👩‍💼', personality: 'friendly' },
    { id: 'tech-expert', name: 'Tech Expert', emoji: '👨‍💻', personality: 'analytical' },
    { id: 'hr-manager', name: 'HR Manager', emoji: '👩‍🏫', personality: 'warm' },
    { id: 'startup-ceo', name: 'Startup CEO', emoji: '👨‍🚀', personality: 'dynamic' },
    { id: 'senior-dev', name: 'Senior Developer', emoji: '👩‍💻', personality: 'methodical' }
  ]

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
        stopAudioVisualization()
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
      stopAudioVisualization()
    }
  }, [speechSettings.language])

  // Audio visualization
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

  // Handle user speech
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

  // Text-to-Speech
  const speakText = useCallback((text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = speechSettings.speed
      utterance.pitch = speechSettings.pitch
      utterance.volume = speechSettings.volume
      
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

      window.speechSynthesis.speak(utterance)
    }
  }, [speechSettings])

  // Controls
  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop()
    } else {
      recognitionRef.current?.start()
    }
  }

  const stopSpeaking = () => {
    window.speechSynthesis.cancel()
    setIsSpeaking(false)
    setAvatarMood('neutral')
  }

  // CSS 3D Avatar Component (No external dependencies)
  const Avatar3D = () => {
    return (
      <div 
        ref={avatarRef}
        style={{
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)',
          borderRadius: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          perspective: '1000px'
        }}
      >
        {/* Animated Background */}
        <div 
          className="neural-bg"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `
              radial-gradient(circle at 20% 30%, rgba(102, 126, 234, 0.1) 2px, transparent 2px),
              radial-gradient(circle at 80% 70%, rgba(118, 75, 162, 0.1) 2px, transparent 2px),
              radial-gradient(circle at 40% 80%, rgba(102, 126, 234, 0.05) 2px, transparent 2px)
            `,
            backgroundSize: '100px 100px, 150px 150px, 200px 200px',
            animation: 'neuralFloat 8s ease-in-out infinite'
          }}
        />

        {/* Main Avatar Container */}
        <div 
          className={`avatar-3d ${avatarMood}`}
          style={{
            width: '320px',
            height: '320px',
            position: 'relative',
            transformStyle: 'preserve-3d',
            animation: `avatar-${avatarMood} 2s ease-in-out infinite`,
            transition: 'all 0.5s ease',
            margin: 'auto'
          }}
        >
          {/* Avatar Face */}
          <div 
            className="avatar-face"
            style={{
              width: '280px',
              height: '280px',
              borderRadius: '50%',
              background: `
                radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.3) 0%, transparent 50%),
                linear-gradient(135deg, rgba(102, 126, 234, 0.4) 0%, rgba(118, 75, 162, 0.4) 100%)
              `,
              backdropFilter: 'blur(20px)',
              border: '3px solid rgba(255, 255, 255, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '120px',
              color: 'white',
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: `
                translate(-50%, -50%)
                translateZ(50px) 
                scale(${avatarMood === 'speaking' ? '1.1' : '1'})
                rotateY(${avatarMood === 'thinking' ? '5deg' : '0deg'})
              `,
              boxShadow: `
                0 0 80px rgba(102, 126, 234, ${avatarMood === 'speaking' ? '0.8' : '0.4'}),
                inset 0 0 80px rgba(255, 255, 255, 0.1)
              `,
              transition: 'all 0.3s ease'
            }}
          >
            {/* Avatar Emoji */}
            <div 
              className="avatar-emoji"
              style={{
                fontSize: '80px',
                transform: `
                  rotateX(${avatarMood === 'listening' ? '-10deg' : '0deg'})
                  rotateY(${avatarMood === 'speaking' ? '5deg' : '0deg'})
                `,
                transition: 'all 0.3s ease',
                textShadow: '0 0 20px rgba(255, 255, 255, 0.5)'
              }}
            >
              {selectedAvatar.emoji}
            </div>

            {/* Mood Indicator */}
            <div 
              style={{
                position: 'absolute',
                bottom: '30px',
                left: '50%',
                transform: 'translate(-50%, 0) translateZ(30px)',
                fontSize: '24px',
                opacity: 0.9,
                animation: avatarMood === 'speaking' ? 'bounce 0.5s infinite' : 'none',
                textShadow: '0 0 15px rgba(255, 255, 255, 0.8)'
              }}
            >
              {avatarMood === 'speaking' ? '🗣️' : 
               avatarMood === 'listening' ? '👂' :
               avatarMood === 'thinking' ? '🤔' : '😊'}
            </div>

          </div>

          {/* Voice Waves - Expanding from avatar center */}
          {isSpeaking && (
            <div 
              className="voice-waves"
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '400px',
                height: '400px',
                pointerEvents: 'none',
                zIndex: 1
              }}
            >
              {[1, 2, 3].map(i => (
                <div
                  key={i}
                  className="wave"
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: `${280 + i * 50}px`,
                    height: `${280 + i * 50}px`,
                    border: `2px solid rgba(102, 126, 234, ${0.5 - i * 0.15})`,
                    borderRadius: '50%',
                    animation: `voiceWave ${1.5 + i * 0.5}s ease-out infinite`
                  }}
                />
              ))}
            </div>
          )}


          {/* Beautiful Sound Waves - Dưới avatar khi listening */}
          {isListening && (
            <div 
              className="sound-waves-container"
              style={{
                position: 'absolute',
                bottom: '10px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '350px',
                height: '80px',
                pointerEvents: 'none',
                zIndex: 10
              }}
            >
              {/* Gợn sóng mềm mại */}
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div
                  key={`wave-${i}`}
                  style={{
                    position: 'absolute',
                    bottom: `${i * 6}px`,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: `${150 + audioLevel * 80 + i * 20}px`,
                    height: '3px',
                    background: `linear-gradient(90deg, 
                      transparent 0%, 
                      rgba(16, 185, 129, ${(0.9 - i * 0.12) * (0.4 + audioLevel * 0.6)}) 20%,
                      rgba(34, 197, 94, ${(0.7 - i * 0.1) * (0.6 + audioLevel * 0.4)}) 50%,
                      rgba(16, 185, 129, ${(0.9 - i * 0.12) * (0.4 + audioLevel * 0.6)}) 80%,
                      transparent 100%)`,
                    borderRadius: '2px',
                    animation: `waveFlow ${1.5 + i * 0.2}s ease-in-out infinite`,
                    animationDelay: `${i * 0.1}s`,
                    opacity: audioLevel > 0.05 ? 1 : 0.4,
                    filter: `blur(${i * 0.2}px)`
                  }}
                />
              ))}
              
              {/* Equalizer Bars - Center */}
              <div style={{
                position: 'absolute',
                bottom: '0px',
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                gap: '2px',
                alignItems: 'end',
                padding: '0 20px'
              }}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(i => (
                  <div
                    key={`bar-${i}`}
                    style={{
                      width: '3px',
                      height: `${6 + audioLevel * 30 * Math.sin((i / 11) * Math.PI)}px`,
                      background: `linear-gradient(to top, 
                        rgba(16, 185, 129, ${audioLevel > (i / 11) ? '1' : '0.4'}),
                        rgba(34, 197, 94, ${audioLevel > (i / 11) ? '0.9' : '0.3'}),
                        rgba(59, 130, 246, ${audioLevel > (i / 11) ? '0.7' : '0.2'})
                      )`,
                      borderRadius: '1.5px',
                      transition: 'all 0.08s ease',
                      boxShadow: audioLevel > (i / 11) ? 
                        `0 0 6px rgba(16, 185, 129, ${audioLevel * 0.8})` : 'none',
                      animation: `audioBar ${0.3 + i * 0.05}s ease-in-out infinite alternate`,
                      animationDelay: `${i * 0.02}s`
                    }}
                  />
                ))}
              </div>
              
              {/* Glow Effect */}
              <div style={{
                position: 'absolute',
                bottom: '0px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: `${100 + audioLevel * 150}px`,
                height: '20px',
                background: `radial-gradient(ellipse, 
                  rgba(16, 185, 129, ${audioLevel * 0.3}) 0%, 
                  transparent 70%)`,
                borderRadius: '50%',
                filter: 'blur(8px)',
                animation: 'glowPulse 2s ease-in-out infinite'
              }} />
            </div>
          )}

        </div>

        {/* Status Display */}
        <div 
          style={{
            position: 'absolute',
            bottom: '30px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(0, 0, 0, 0.9)',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '25px',
            fontSize: '16px',
            fontWeight: '600',
            backdropFilter: 'blur(15px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.4)',
            transition: 'all 0.3s ease'
          }}
        >
          {isProcessing ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Brain size={16} />
              Processing your response...
            </div>
          ) : isSpeaking ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Volume2 size={16} />
              Speaking...
            </div>
          ) : isListening ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Mic size={16} />
              Listening... {Math.round(audioLevel * 100)}%
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Zap size={16} />
              Ready for your response
            </div>
          )}
        </div>

        {/* Controls */}
        <div style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          display: 'flex',
          gap: '12px'
        }}>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            style={{
              background: 'rgba(0, 0, 0, 0.8)',
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
          >
            {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
          </button>
        </div>

        {/* Avatar Info */}
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          background: 'rgba(0, 0, 0, 0.8)',
          padding: '12px 16px',
          borderRadius: '12px',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          color: 'white'
        }}>
          <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>
            {selectedAvatar.name}
          </div>
          <div style={{ fontSize: '12px', opacity: 0.8 }}>
            {selectedAvatar.personality} interviewer
          </div>
        </div>
      </div>
    )
  }

  // Show interview preparation if not ready
  if (!isInterviewReady) {
    return (
      <InterviewPreparation
        sessionId={roomId}
        onReady={handleInterviewReady}
        onError={handlePreparationError}
      />
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
          <div 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '16px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onClick={() => navigate('/')}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.02)'
              e.currentTarget.style.opacity = '0.8'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)'
              e.currentTarget.style.opacity = '1'
            }}
          >
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
                Advanced Voice Interview Experience
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={createNewSession}
              style={{
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 16px',
                color: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontWeight: '600',
                boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-1px)'
                e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.4)'
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)'
                e.target.style.boxShadow = '0 2px 8px rgba(59, 130, 246, 0.3)'
              }}
            >
              <Plus size={16} />
              New Interview
            </button>
            
            <button
              onClick={() => setShowSettings(!showSettings)}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                padding: '8px 12px',
                color: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Settings size={16} />
              Settings
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
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
          border: '1px solid rgba(255, 255, 255, 0.1)',
          minHeight: '600px'
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
            {/* Avatar Selector */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '15px',
              padding: '20px',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '18px' }}>
                🎭 Select Interviewer
              </h3>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '8px'
              }}>
                {avatarPresets.map((avatar) => (
                  <button
                    key={avatar.id}
                    onClick={() => setSelectedAvatar(avatar)}
                    style={{
                      background: selectedAvatar.id === avatar.id ? 
                        'rgba(102, 126, 234, 0.3)' : 'rgba(255, 255, 255, 0.1)',
                      border: selectedAvatar.id === avatar.id ? 
                        '2px solid #667eea' : '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '8px',
                      padding: '8px',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.3s ease',
                      color: 'white'
                    }}
                  >
                    <div style={{ fontSize: '24px', marginBottom: '4px' }}>
                      {avatar.emoji}
                    </div>
                    <div style={{ fontSize: '10px', fontWeight: '600' }}>
                      {avatar.name}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Messages */}
            <div style={{
              flex: 1,
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '15px',
              padding: '20px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              maxHeight: '300px',
              overflowY: 'auto'
            }}>
              <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '18px' }}>
                💬 Interview Transcript
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {messages.map((message) => (
                  <div key={message.id} style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '8px',
                    flexDirection: message.type === 'user' ? 'row-reverse' : 'row'
                  }}>
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: message.type === 'user' ? '#667eea' : '#764ba2',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      fontSize: '12px'
                    }}>
                      {message.type === 'user' ? <User size={12} /> : <Bot size={12} />}
                    </div>
                    
                    <div style={{
                      background: message.type === 'user' ? 'rgba(102, 126, 234, 0.2)' : 'rgba(118, 75, 162, 0.2)',
                      padding: '8px 12px',
                      borderRadius: '12px',
                      maxWidth: '250px',
                      fontSize: '13px',
                      lineHeight: '1.4',
                      border: `1px solid ${message.type === 'user' ? 'rgba(102, 126, 234, 0.3)' : 'rgba(118, 75, 162, 0.3)'}`
                    }}>
                      <p style={{ margin: 0, marginBottom: '4px' }}>
                        {message.message}
                      </p>
                      <div style={{ 
                        fontSize: '11px', 
                        opacity: 0.6,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}>
                        <span>{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
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
                            <Volume2 size={10} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Voice Controls */}
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
                    cursor: isSpeaking || isProcessing ? 'not-allowed' : 'pointer',
                    opacity: isSpeaking || isProcessing ? 0.5 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.3s ease',
                    boxShadow: isListening ? '0 0 20px rgba(239, 68, 68, 0.5)' : '0 0 20px rgba(16, 185, 129, 0.3)',
                    transform: isListening ? 'scale(1.02)' : 'scale(1)'
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
                    justifyContent: 'center'
                  }}
                >
                  <VolumeX size={20} />
                </button>
              </div>

              {/* Quick Actions */}
              <div style={{ display: 'flex', gap: '8px', fontSize: '12px' }}>
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
            width: '450px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h3 style={{ margin: 0, color: 'white' }}>🎛️ Voice Settings</h3>
              <button
                onClick={() => setShowSettings(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '20px'
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'white' }}>
                  Speech Speed: {speechSettings.speed.toFixed(1)}x
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
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'white' }}>
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
                <label htmlFor="autoSpeak" style={{ fontSize: '14px', color: 'white' }}>
                  Auto-speak AI responses
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Advanced CSS Animations */}
      <style>
        {`
          @keyframes neuralFloat {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            33% { transform: translateY(-15px) rotate(120deg); }
            66% { transform: translateY(10px) rotate(240deg); }
          }
          
          @keyframes avatar-speaking {
            0%, 100% { transform: scale(1.05) rotateY(-2deg); }
            50% { transform: scale(1.1) rotateY(2deg); }
          }
          
          @keyframes avatar-listening {
            0%, 100% { transform: scale(1) rotateX(0deg); }
            50% { transform: scale(1.02) rotateX(-5deg); }
          }
          
          @keyframes avatar-thinking {
            0% { transform: rotateY(0deg); }
            25% { transform: rotateY(-10deg); }
            75% { transform: rotateY(10deg); }
            100% { transform: rotateY(0deg); }
          }
          
          @keyframes avatar-neutral {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-8px); }
          }
          
          @keyframes voiceWave {
            0% { 
              transform: translate(-50%, -50%) scale(0.8); 
              opacity: 0.8; 
            }
            100% { 
              transform: translate(-50%, -50%) scale(1.8); 
              opacity: 0; 
            }
          }
          
          @keyframes waveFlow {
            0%, 100% { 
              transform: translateX(-50%) scaleX(1);
              opacity: 0.8;
            }
            50% { 
              transform: translateX(-50%) scaleX(1.2);
              opacity: 1;
            }
          }
          
          @keyframes audioBar {
            0% { transform: scaleY(1); }
            100% { transform: scaleY(1.3); }
          }
          
          @keyframes processingRotate {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          @keyframes bounce {
            0%, 20%, 53%, 80%, 100% { transform: translateY(0px); }
            40%, 43% { transform: translateY(-8px); }
            70% { transform: translateY(-4px); }
            90% { transform: translateY(-2px); }
          }
          
          @keyframes glowPulse {
            0%, 100% { 
              opacity: 0.6;
              transform: translateX(-50%) scaleX(1);
            }
            50% { 
              opacity: 1;
              transform: translateX(-50%) scaleX(1.2);
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

          /* Responsive */
          @media (max-width: 768px) {
            .avatar-3d {
              width: 250px !important;
              height: 250px !important;
            }
            .avatar-face {
              width: 220px !important;
              height: 220px !important;
              font-size: 80px !important;
            }
          }
        `}
      </style>
    </div>
  )
}

export default VirtualInterviewer