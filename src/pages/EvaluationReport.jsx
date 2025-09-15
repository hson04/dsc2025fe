import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { 
  Download, 
  ArrowLeft, 
  CheckCircle, 
  AlertCircle,
  TrendingUp,
  Award,
  MessageSquare,
  Clock,
  BarChart3,
  RefreshCw,
  User
} from 'lucide-react'

const EvaluationReport = () => {
  const [selectedQuestion, setSelectedQuestion] = useState(0)
  const [interviewData, setInterviewData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  
  // Get session ID from URL params or localStorage
  const sessionId = searchParams.get('sessionId') || localStorage.getItem('currentSessionId')
  const backendUrl = localStorage.getItem('backendUrl') || 'http://localhost:3005'
  
  // Update localStorage when sessionId changes from URL
  useEffect(() => {
    if (searchParams.get('sessionId')) {
      localStorage.setItem('currentSessionId', searchParams.get('sessionId'))
    }
  }, [searchParams])

  // Default data structure (fallback)
  const defaultInterviewData = {
    title: "Senior Software Engineer Interview",
    date: "January 15, 2024",
    duration: "25 minutes",
    overallScore: 85,
    questions: [
      {
        id: 1,
        question: "Can you tell me about yourself and your professional background?",
        userAnswer: "I'm a software engineer with 5 years of experience in full-stack development. I've worked primarily with React, Node.js, and Python. In my current role at TechCorp, I lead a team of 4 developers and have successfully delivered 3 major projects that improved system performance by 40%. I'm passionate about clean code, mentoring junior developers, and staying updated with the latest technologies.",
        aiFeedback: {
          score: 88,
          strengths: [
            "Clearly outlined years of experience and technical skills",
            "Mentioned leadership experience which shows growth",
            "Quantified achievements with specific metrics",
            "Showed passion for the field and continuous learning"
          ],
          improvements: [
            "Could have mentioned specific projects or technologies relevant to this role",
            "Add more details about the impact of your leadership on the team"
          ],
          suggestion: "Great start! To make this even stronger, try connecting your experience more directly to the specific role you're applying for. Mention 1-2 specific projects that demonstrate skills this company values."
        }
      },
      {
        id: 2,
        question: "Describe a challenging technical problem you faced and how you solved it.",
        userAnswer: "We had a performance issue where our API response times were taking over 5 seconds, causing user complaints. I analyzed the database queries and found several N+1 query problems. I implemented database indexing, query optimization, and introduced Redis caching. This reduced response times to under 500ms, improving user satisfaction by 60%.",
        aiFeedback: {
          score: 92,
          strengths: [
            "Excellent problem-solving structure (problem → analysis → solution → result)",
            "Specific technical details about the solution",
            "Quantified both the problem (5 seconds) and result (500ms)",
            "Showed impact on user satisfaction with metrics"
          ],
          improvements: [
            "Could mention how you collaborated with team members",
            "Discuss any long-term monitoring or prevention measures"
          ],
          suggestion: "Outstanding technical answer! You demonstrated strong analytical skills and provided concrete results. This shows you can handle complex problems effectively."
        }
      },
      {
        id: 3,
        question: "How do you handle working under pressure and tight deadlines?",
        userAnswer: "I prioritize tasks based on impact and urgency, break down complex work into smaller chunks, and communicate regularly with stakeholders about progress. During our last product launch, we had a 2-week deadline. I organized daily standups, delegated tasks efficiently, and we delivered on time with 99.9% uptime.",
        aiFeedback: {
          score: 78,
          strengths: [
            "Good methodology for handling pressure (prioritization, breakdown, communication)",
            "Provided a specific example with clear outcome",
            "Showed leadership and delegation skills"
          ],
          improvements: [
            "Could elaborate more on stress management techniques",
            "Discuss how you maintain quality under pressure",
            "Mention how you support team members during high-pressure situations"
          ],
          suggestion: "Solid answer that shows good project management skills. To strengthen it, add more about how you maintain work quality and team morale during crunch times."
        }
      }
    ]
  }

  // Fetch evaluation data from backend
  const fetchEvaluationData = async () => {
    if (!sessionId) {
      setError('No session ID found. Please start an interview first or select a recent interview.')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`${backendUrl}/chat/evaluation-data/${sessionId}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Interview session not found. This session may not have evaluation data yet.')
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      setInterviewData(data)
    } catch (err) {
      console.error('Failed to fetch evaluation data:', err)
      setError(err.message)
      // Don't use default data as fallback - show error instead
      setInterviewData(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEvaluationData()
  }, [sessionId, backendUrl])

  // Use current data or fallback to default
  const currentData = interviewData || defaultInterviewData
  const currentQuestion = currentData?.questions?.[selectedQuestion]

  // Loading state
  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: '#f8fafc', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '50px', 
            height: '50px', 
            border: '4px solid #e5e7eb', 
            borderTop: '4px solid #3b82f6', 
            borderRadius: '50%', 
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px auto'
          }}></div>
          <h2 style={{ color: '#374151', marginBottom: '8px' }}>Loading Evaluation Report...</h2>
          <p style={{ color: '#6b7280' }}>Please wait while we fetch your interview results</p>
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

  // Error state
  if (error && !interviewData) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: '#f8fafc', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <div style={{ 
          textAlign: 'center', 
          maxWidth: '500px', 
          padding: '32px',
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
        }}>
          <AlertCircle size={48} style={{ color: '#dc2626', margin: '0 auto 16px auto' }} />
          <h2 style={{ color: '#374151', marginBottom: '8px' }}>Unable to Load Report</h2>
          <p style={{ color: '#6b7280', marginBottom: '16px' }}>{error}</p>
          {sessionId && (
            <div style={{ 
              background: '#f3f4f6', 
              padding: '12px', 
              borderRadius: '8px', 
              marginBottom: '24px',
              fontSize: '12px',
              color: '#6b7280'
            }}>
              Session ID: {sessionId}
            </div>
          )}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button
              onClick={fetchEvaluationData}
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
              Try Again
            </button>
            <button
              onClick={() => navigate('/mock-interview')}
              style={{
                background: 'white',
                color: '#374151',
                border: '2px solid #e5e7eb',
                padding: '12px 24px',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Back to Interview
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      {/* Header */}
      <div style={{ 
        background: 'white', 
        borderBottom: '1px solid #e5e7eb', 
        position: 'sticky', 
        top: 0, 
        zIndex: 10 
      }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto', 
          padding: '24px' 
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between' 
          }}>
            <button
              onClick={() => navigate('/mock-interview')}
              style={{
                display: 'flex',
                alignItems: 'center',
                color: '#6b7280',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              <ArrowLeft size={20} style={{ marginRight: '8px' }} />
              Back to Mock Interview
            </button>
            
            <div style={{ textAlign: 'center' }}>
              <h1 style={{ 
                fontSize: '24px', 
                fontWeight: 'bold', 
                color: '#111827',
                margin: 0
              }}>
                {currentData.title}
              </h1>
              <p style={{ 
                color: '#6b7280', 
                margin: '4px 0 0 0',
                fontSize: '14px'
              }}>
                Interview Report
              </p>
            </div>
            
            <button 
              onClick={async () => {
                try {
                  const response = await fetch(`${backendUrl}/chat/final-report/${encodeURIComponent(sessionId)}`)
                  if (!response.ok) throw new Error(`HTTP ${response.status}`)
                  const payload = await response.json()
                  const { data_base64, filename } = payload
                  const link = document.createElement('a')
                  link.href = `data:application/pdf;base64,${data_base64}`
                  link.download = filename || `interview_report_${sessionId}.pdf`
                  document.body.appendChild(link)
                  link.click()
                  link.remove()
                } catch (error) {
                  alert(`Failed to download PDF: ${error.message}`)
                }
              }}
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
              <Download size={16} style={{ marginRight: '8px' }} />
              Download PDF
            </button>
          </div>
        </div>
      </div>

      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '32px 24px' 
      }}>
        <div style={{ maxWidth: '100%' }}>
          {/* Overview Section */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
            gap: '24px', 
            marginBottom: '32px' 
          }}>
            <div>
              <div style={{ 
                background: 'white',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                border: 'none',
                padding: '24px',
                textAlign: 'center',
                borderRadius: '12px'
              }}>
                <div style={{ 
                  fontSize: '36px', 
                  fontWeight: 'bold', 
                  marginBottom: '8px',
                  color: currentData.overallScore >= 90 ? '#059669' :
                         currentData.overallScore >= 80 ? '#2563eb' :
                         currentData.overallScore >= 70 ? '#d97706' : '#dc2626'
                }}>
                  {currentData.overallScore}%
                </div>
                <h3 style={{ 
                  fontWeight: '600', 
                  color: '#111827', 
                  marginBottom: '4px',
                  fontSize: '16px'
                }}>
                  Overall Score
                </h3>
                <p style={{ 
                  fontSize: '14px', 
                  color: '#6b7280',
                  margin: 0
                }}>
                  {currentData.overallScore >= 90 ? 'Excellent Performance' :
                   currentData.overallScore >= 80 ? 'Strong Performance' :
                   currentData.overallScore >= 70 ? 'Good Performance' : 'Needs Improvement'}
                </p>
              </div>
            </div>

            <div style={{ gridColumn: 'span 3' }}>
              <div style={{ 
                background: 'white',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                border: 'none',
                padding: '24px',
                borderRadius: '12px'
              }}>
                <h2 style={{ 
                  fontSize: '20px', 
                  fontWeight: 'bold', 
                  color: '#111827', 
                  marginBottom: '16px' 
                }}>
                  Interview Summary
                </h2>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
                  gap: '16px' 
                }}>
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '12px', 
                    background: '#f9fafb', 
                    borderRadius: '8px' 
                  }}>
                    <Clock size={20} style={{ color: '#3b82f6', margin: '0 auto 8px auto' }} />
                    <div style={{ fontWeight: '600', color: '#111827' }}>{currentData.duration}</div>
                    <div style={{ fontSize: '14px', color: '#6b7280' }}>Duration</div>
                  </div>
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '12px', 
                    background: '#f9fafb', 
                    borderRadius: '8px' 
                  }}>
                    <MessageSquare size={20} style={{ color: '#10b981', margin: '0 auto 8px auto' }} />
                    <div style={{ fontWeight: '600', color: '#111827' }}>{currentData.questions.length}</div>
                    <div style={{ fontSize: '14px', color: '#6b7280' }}>Questions</div>
                  </div>
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '12px', 
                    background: '#f9fafb', 
                    borderRadius: '8px' 
                  }}>
                    <TrendingUp size={20} style={{ color: '#8b5cf6', margin: '0 auto 8px auto' }} />
                    <div style={{ fontWeight: '600', color: '#111827' }}>High</div>
                    <div style={{ fontSize: '14px', color: '#6b7280' }}>Confidence</div>
                  </div>
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '12px', 
                    background: '#f9fafb', 
                    borderRadius: '8px' 
                  }}>
                    <Award size={20} style={{ color: '#f59e0b', margin: '0 auto 8px auto' }} />
                    <div style={{ fontWeight: '600', color: '#111827' }}>B+</div>
                    <div style={{ fontSize: '14px', color: '#6b7280' }}>Grade</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Question Navigation */}
          <div style={{ 
            background: 'white',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
            border: 'none',
            padding: '24px',
            marginBottom: '32px',
            borderRadius: '12px'
          }}>
            <h2 style={{ 
              fontSize: '20px', 
              fontWeight: 'bold', 
              color: '#111827', 
              marginBottom: '16px' 
            }}>
              Interview Questions
            </h2>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
              gap: '16px' 
            }}>
              {currentData.questions.map((q, index) => (
                <button
                  key={q.id}
                  onClick={() => setSelectedQuestion(index)}
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    border: `2px solid ${selectedQuestion === index ? '#3b82f6' : '#e5e7eb'}`,
                    textAlign: 'left',
                    background: selectedQuestion === index ? '#eff6ff' : 'white',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    marginBottom: '8px' 
                  }}>
                    <span style={{ 
                      fontWeight: '600', 
                      color: '#111827',
                      fontSize: '14px'
                    }}>
                      Question {index + 1}
                    </span>
                    <span style={{ 
                      fontSize: '18px', 
                      fontWeight: 'bold',
                      color: q.aiFeedback.score >= 90 ? '#059669' :
                             q.aiFeedback.score >= 80 ? '#2563eb' :
                             q.aiFeedback.score >= 70 ? '#d97706' : '#dc2626'
                    }}>
                      {q.aiFeedback.score}%
                    </span>
                  </div>
                  <p style={{ 
                    fontSize: '14px', 
                    color: '#6b7280',
                    margin: 0,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {q.question}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Detailed Question Analysis */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '32px' 
          }}>
            {/* Question & Answer */}
            <div style={{ gridColumn: 'span 2' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* Question */}
                <div style={{ 
                  background: 'white',
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                  border: 'none',
                  padding: '24px',
                  borderRadius: '12px'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px', 
                    marginBottom: '16px' 
                  }}>
                    <div style={{ 
                      width: '32px', 
                      height: '32px', 
                      background: '#dbeafe', 
                      borderRadius: '8px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center' 
                    }}>
                      <MessageSquare size={16} style={{ color: '#2563eb' }} />
                    </div>
                    <h3 style={{ 
                      fontSize: '18px', 
                      fontWeight: 'bold', 
                      color: '#111827' 
                    }}>
                      Question {selectedQuestion + 1}
                    </h3>
                  </div>
                  <p style={{ 
                    color: '#1f2937', 
                    fontSize: '18px', 
                    lineHeight: '1.6', 
                    fontWeight: '500',
                    margin: 0
                  }}>
                    {currentQuestion.question}
                  </p>
                </div>

                {/* Your Answer */}
                <div style={{ 
                  background: 'white',
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                  border: 'none',
                  padding: '24px',
                  borderRadius: '12px'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px', 
                    marginBottom: '16px' 
                  }}>
                    <div style={{ 
                      width: '32px', 
                      height: '32px', 
                      background: '#f3f4f6', 
                      borderRadius: '8px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center' 
                    }}>
                      <User size={16} style={{ color: '#6b7280' }} />
                    </div>
                    <h3 style={{ 
                      fontSize: '18px', 
                      fontWeight: 'bold', 
                      color: '#111827' 
                    }}>
                      Your Answer
                    </h3>
                  </div>
                  <div style={{ 
                    padding: '16px', 
                    background: '#f9fafb', 
                    borderRadius: '12px', 
                    border: '1px solid #e5e7eb' 
                  }}>
                    <p style={{ 
                      color: '#1f2937', 
                      lineHeight: '1.6',
                      margin: 0
                    }}>
                      {currentQuestion.userAnswer}
                    </p>
                  </div>
                </div>

                {/* AI Feedback */}
                <div style={{ 
                  background: 'white',
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                  border: `2px solid ${currentQuestion.aiFeedback.score >= 90 ? '#d1fae5' :
                                         currentQuestion.aiFeedback.score >= 80 ? '#dbeafe' :
                                         currentQuestion.aiFeedback.score >= 70 ? '#fef3c7' : '#fecaca'}`,
                  padding: '24px',
                  borderRadius: '12px'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    marginBottom: '24px' 
                  }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '12px' 
                    }}>
                      <div style={{ 
                        width: '40px', 
                        height: '40px', 
                        borderRadius: '8px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        background: currentQuestion.aiFeedback.score >= 80 ? '#10b981' : '#3b82f6'
                      }}>
                        <BarChart3 size={20} style={{ color: 'white' }} />
                      </div>
                      <h3 style={{ 
                        fontSize: '20px', 
                        fontWeight: 'bold', 
                        color: '#111827' 
                      }}>
                        AI Feedback
                      </h3>
                    </div>
                    <div style={{ 
                      fontSize: '30px', 
                      fontWeight: 'bold',
                      color: currentQuestion.aiFeedback.score >= 90 ? '#059669' :
                             currentQuestion.aiFeedback.score >= 80 ? '#2563eb' :
                             currentQuestion.aiFeedback.score >= 70 ? '#d97706' : '#dc2626'
                    }}>
                      {currentQuestion.aiFeedback.score}%
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {/* Suggestion */}
                    <div style={{ 
                      padding: '16px', 
                      background: 'white', 
                      borderRadius: '12px', 
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', 
                      border: '1px solid #e5e7eb' 
                    }}>
                      <h4 style={{ 
                        fontWeight: 'bold', 
                        color: '#111827', 
                        marginBottom: '8px', 
                        display: 'flex', 
                        alignItems: 'center',
                        fontSize: '16px'
                      }}>
                        <CheckCircle size={18} style={{ color: '#3b82f6', marginRight: '8px' }} />
                        Overall Assessment
                      </h4>
                      <p style={{ 
                        color: '#374151', 
                        lineHeight: '1.6',
                        margin: 0
                      }}>
                        {currentQuestion.aiFeedback.suggestion}
                      </p>
                    </div>

                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                      gap: '24px' 
                    }}>
                      {/* Strengths */}
                      <div>
                        <h4 style={{ 
                          fontWeight: 'bold', 
                          color: '#065f46', 
                          marginBottom: '12px', 
                          display: 'flex', 
                          alignItems: 'center',
                          fontSize: '16px'
                        }}>
                          <CheckCircle size={18} style={{ color: '#059669', marginRight: '8px' }} />
                          What You Did Well
                        </h4>
                        <ul style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {currentQuestion.aiFeedback.strengths.map((strength, index) => (
                            <li key={index} style={{ display: 'flex', alignItems: 'flex-start' }}>
                              <div style={{ 
                                width: '8px', 
                                height: '8px', 
                                background: '#10b981', 
                                borderRadius: '50%', 
                                marginTop: '8px', 
                                marginRight: '12px', 
                                flexShrink: 0 
                              }}></div>
                              <span style={{ 
                                color: '#374151', 
                                fontSize: '14px',
                                lineHeight: '1.5'
                              }}>
                                {strength}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Improvements */}
                      <div>
                        <h4 style={{ 
                          fontWeight: 'bold', 
                          color: '#92400e', 
                          marginBottom: '12px', 
                          display: 'flex', 
                          alignItems: 'center',
                          fontSize: '16px'
                        }}>
                          <AlertCircle size={18} style={{ color: '#d97706', marginRight: '8px' }} />
                          Areas to Improve
                        </h4>
                        <ul style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {currentQuestion.aiFeedback.improvements.map((improvement, index) => (
                            <li key={index} style={{ display: 'flex', alignItems: 'flex-start' }}>
                              <div style={{ 
                                width: '8px', 
                                height: '8px', 
                                background: '#f59e0b', 
                                borderRadius: '50%', 
                                marginTop: '8px', 
                                marginRight: '12px', 
                                flexShrink: 0 
                              }}></div>
                              <span style={{ 
                                color: '#374151', 
                                fontSize: '14px',
                                lineHeight: '1.5'
                              }}>
                                {improvement}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Question List */}
              <div style={{ 
                background: 'white',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                border: 'none',
                padding: '24px',
                borderRadius: '12px'
              }}>
                <h3 style={{ 
                  fontSize: '18px', 
                  fontWeight: 'bold', 
                  color: '#111827', 
                  marginBottom: '16px' 
                }}>
                  All Questions
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {currentData.questions.map((q, index) => (
                    <button
                      key={q.id}
                      onClick={() => setSelectedQuestion(index)}
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '8px',
                        border: `2px solid ${selectedQuestion === index ? '#3b82f6' : '#e5e7eb'}`,
                        textAlign: 'left',
                        background: selectedQuestion === index ? '#eff6ff' : 'white',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between', 
                        marginBottom: '4px' 
                      }}>
                        <span style={{ 
                          fontWeight: '600', 
                          color: '#111827',
                          fontSize: '14px'
                        }}>
                          Q{index + 1}
                        </span>
                        <span style={{ 
                          fontSize: '14px', 
                          fontWeight: 'bold',
                          color: q.aiFeedback.score >= 90 ? '#059669' :
                                 q.aiFeedback.score >= 80 ? '#2563eb' :
                                 q.aiFeedback.score >= 70 ? '#d97706' : '#dc2626'
                        }}>
                          {q.aiFeedback.score}%
                        </span>
                      </div>
                      <p style={{ 
                        fontSize: '14px', 
                        color: '#6b7280',
                        margin: 0,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {q.question}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Overall Performance */}
              <div style={{ 
                background: 'white',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                border: 'none',
                padding: '24px',
                borderRadius: '12px'
              }}>
                <h3 style={{ 
                  fontSize: '18px', 
                  fontWeight: 'bold', 
                  color: '#111827', 
                  marginBottom: '16px' 
                }}>
                  Performance Breakdown
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#6b7280', fontSize: '14px' }}>Communication</span>
                    <span style={{ fontWeight: '600', color: '#059669', fontSize: '14px' }}>Excellent</span>
                  </div>
                  <div style={{ width: '100%', background: '#e5e7eb', borderRadius: '9999px', height: '8px' }}>
                    <div style={{ background: '#10b981', height: '8px', borderRadius: '9999px', width: '83%' }}></div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#6b7280', fontSize: '14px' }}>Technical Knowledge</span>
                    <span style={{ fontWeight: '600', color: '#2563eb', fontSize: '14px' }}>Very Good</span>
                  </div>
                  <div style={{ width: '100%', background: '#e5e7eb', borderRadius: '9999px', height: '8px' }}>
                    <div style={{ background: '#3b82f6', height: '8px', borderRadius: '9999px', width: '80%' }}></div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#6b7280', fontSize: '14px' }}>Problem Solving</span>
                    <span style={{ fontWeight: '600', color: '#059669', fontSize: '14px' }}>Excellent</span>
                  </div>
                  <div style={{ width: '100%', background: '#e5e7eb', borderRadius: '9999px', height: '8px' }}>
                    <div style={{ background: '#10b981', height: '8px', borderRadius: '9999px', width: '92%' }}></div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#6b7280', fontSize: '14px' }}>Leadership</span>
                    <span style={{ fontWeight: '600', color: '#d97706', fontSize: '14px' }}>Good</span>
                  </div>
                  <div style={{ width: '100%', background: '#e5e7eb', borderRadius: '9999px', height: '8px' }}>
                    <div style={{ background: '#f59e0b', height: '8px', borderRadius: '9999px', width: '75%' }}></div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button 
                  onClick={() => navigate('/mock-interview')}
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
                    fontSize: '14px'
                  }}
                >
                  <RefreshCw size={16} style={{ marginRight: '8px' }} />
                  Practice Again
                </button>
                
                <button 
                  onClick={() => navigate('/improve-resume/step1')}
                  style={{
                    width: '100%',
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
                  Improve Resume
                </button>
                
                <button style={{
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
                  fontSize: '14px'
                }}>
                  <Download size={16} style={{ marginRight: '8px' }} />
                  Save PDF Report
                </button>
              </div>
            </div>
          </div>

          {/* Key Insights */}
          <div style={{ 
            background: 'white',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
            border: 'none',
            padding: '32px',
            marginTop: '32px',
            borderRadius: '12px'
          }}>
            <h2 style={{ 
              fontSize: '24px', 
              fontWeight: 'bold', 
              color: '#111827', 
              marginBottom: '24px', 
              textAlign: 'center' 
            }}>
              🎯 Key Insights & Next Steps
            </h2>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
              gap: '32px' 
            }}>
              <div style={{ 
                padding: '24px', 
                background: '#f0fdf4', 
                borderRadius: '12px', 
                border: '1px solid #bbf7d0' 
              }}>
                <h3 style={{ 
                  fontWeight: 'bold', 
                  color: '#166534', 
                  marginBottom: '16px', 
                  fontSize: '20px' 
                }}>
                  🌟 Your Strengths
                </h3>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <li style={{ display: 'flex', alignItems: 'center', color: '#15803d' }}>
                    <CheckCircle size={16} style={{ marginRight: '8px' }} />
                    Strong technical communication
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', color: '#15803d' }}>
                    <CheckCircle size={16} style={{ marginRight: '8px' }} />
                    Excellent problem-solving approach
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', color: '#15803d' }}>
                    <CheckCircle size={16} style={{ marginRight: '8px' }} />
                    Good use of specific examples and metrics
                  </li>
                </ul>
              </div>

              <div style={{ 
                padding: '24px', 
                background: '#eff6ff', 
                borderRadius: '12px', 
                border: '1px solid #bfdbfe' 
              }}>
                <h3 style={{ 
                  fontWeight: 'bold', 
                  color: '#1e40af', 
                  marginBottom: '16px', 
                  fontSize: '20px' 
                }}>
                  🚀 Growth Areas
                </h3>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <li style={{ display: 'flex', alignItems: 'center', color: '#1d4ed8' }}>
                    <TrendingUp size={16} style={{ marginRight: '8px' }} />
                    Elaborate more on team collaboration
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', color: '#1d4ed8' }}>
                    <TrendingUp size={16} style={{ marginRight: '8px' }} />
                    Connect experiences to company values
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', color: '#1d4ed8' }}>
                    <TrendingUp size={16} style={{ marginRight: '8px' }} />
                    Add more leadership examples
                  </li>
                </ul>
              </div>
            </div>

            <div style={{ 
              textAlign: 'center', 
              marginTop: '32px', 
              padding: '24px', 
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', 
              borderRadius: '16px', 
              color: 'white' 
            }}>
              <h3 style={{ 
                fontSize: '20px', 
                fontWeight: 'bold', 
                marginBottom: '12px' 
              }}>
                🎉 Great Job!
              </h3>
              <p style={{ 
                color: '#dbeafe', 
                lineHeight: '1.6',
                margin: 0
              }}>
                You scored {currentData.overallScore}% overall. With a few improvements in leadership storytelling 
                and company-specific examples, you'll be ready to ace any interview!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EvaluationReport