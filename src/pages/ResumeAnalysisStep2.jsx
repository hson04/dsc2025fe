import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  CheckCircle, 
  AlertTriangle, 
  TrendingUp, 
  Award,
  Target,
  Wand2,
  Download,
  ArrowLeft,
  BarChart3
} from 'lucide-react'

const ResumeAnalysisStep2 = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(true)
  const [progress, setProgress] = useState(0)
  const navigate = useNavigate()

  const analysisResults = {
    jobAlignment: 78,
    strengths: [
      "Strong technical skills section with relevant technologies",
      "Clear work experience with specific company names and roles",
      "Good educational background that matches job requirements",
      "Professional email and contact information format",
      "Appropriate resume length and structure"
    ],
    improvements: [
      "Add specific metrics and quantifiable achievements to work experience",
      "Include more keywords from the job description for better ATS compatibility", 
      "Enhance the professional summary to highlight leadership experience",
      "Add cloud computing certifications mentioned in job requirements",
      "Include specific project examples that demonstrate problem-solving skills",
      "Optimize skills section to prioritize most relevant technologies"
    ]
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          setIsAnalyzing(false)
          clearInterval(interval)
          return 100
        }
        return prev + 12
      })
    }, 400)

    return () => clearInterval(interval)
  }, [])

  const CircularProgress = ({ percentage, color, size = 160 }) => {
    const radius = (size - 24) / 2
    const circumference = radius * 2 * Math.PI
    const strokeDasharray = circumference
    const strokeDashoffset = circumference - (percentage / 100) * circumference

    return (
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg 
          style={{ transform: 'rotate(-90deg)' }} 
          width={size} 
          height={size}
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#e5e7eb"
            strokeWidth="12"
            fill="none"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth="12"
            fill="none"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{ transition: 'all 2s ease-out' }}
          />
        </svg>
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <span style={{ fontSize: '32px', fontWeight: 'bold', color: '#111827' }}>{percentage}%</span>
          <span style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>Match Score</span>
        </div>
      </div>
    )
  }

  if (isAnalyzing) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #eff6ff, #e0e7ff, #f3e8ff)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center', maxWidth: '500px' }}>
          <div style={{
            width: '96px',
            height: '96px',
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 32px'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              border: '4px solid white',
              borderTop: '4px solid transparent',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
          </div>
          
          <h2 style={{ 
            fontSize: '36px', 
            fontWeight: 'bold', 
            color: '#111827', 
            marginBottom: '24px'
          }}>
            🔍 Analyzing Your Resume
          </h2>
          
          <div style={{ marginBottom: '32px' }}>
            <div style={{
              width: '100%',
              background: 'white',
              borderRadius: '50px',
              height: '16px',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)',
              overflow: 'hidden'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                height: '16px',
                borderRadius: '50px',
                transition: 'width 0.3s ease',
                width: `${progress}%`,
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'white',
                  opacity: 0.2,
                  animation: 'pulse 2s infinite'
                }}></div>
              </div>
            </div>
            <p style={{ color: '#6b7280', marginTop: '12px', fontSize: '18px', fontWeight: '500' }}>
              {progress}% complete
            </p>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', color: '#6b7280' }}>
            <p style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
              <span style={{ 
                width: '8px', 
                height: '8px', 
                background: '#3b82f6', 
                borderRadius: '50%',
                animation: 'pulse 2s infinite'
              }}></span>
              Extracting resume content...
            </p>
            <p style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
              <span style={{ 
                width: '8px', 
                height: '8px', 
                background: '#8b5cf6', 
                borderRadius: '50%',
                animation: 'pulse 2s infinite 0.3s'
              }}></span>
              Analyzing job requirements...
            </p>
            <p style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
              <span style={{ 
                width: '8px', 
                height: '8px', 
                background: '#10b981', 
                borderRadius: '50%',
                animation: 'pulse 2s infinite 0.6s'
              }}></span>
              Calculating compatibility score...
            </p>
          </div>
        </div>

        <style>
          {`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
            
            @keyframes pulse {
              0%, 100% { opacity: 0.2; }
              50% { opacity: 1; }
            }
          `}
        </style>
      </div>
    )
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #eff6ff, #e0e7ff, #f3e8ff)'
    }}>
      {/* Header */}
      <header style={{ 
        background: 'white', 
        borderBottom: '1px solid #e5e7eb',
        position: 'sticky',
        top: 0,
        zIndex: 10
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
              <div style={{
                width: '32px',
                height: '32px', 
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span style={{ color: 'white', fontWeight: 'bold', fontSize: '12px' }}>CV</span>
              </div>
              <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827' }}>CVision</span>
            </div>
            
            <nav style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '32px'
            }}>
              <a href="/" style={{ color: '#374151', fontWeight: '500', textDecoration: 'none' }}>Home</a>
              <a href="/mock-interview" style={{ color: '#374151', fontWeight: '500', textDecoration: 'none' }}>Mock Interview</a>
              <a href="/resume-analysis/step1" style={{ color: '#3b82f6', fontWeight: '500', textDecoration: 'none' }}>Resume Analysis</a>
              <a href="/improve-resume/step1" style={{ color: '#374151', fontWeight: '500', textDecoration: 'none' }}>Improve Resume</a>
            </nav>

            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '16px'
            }}>
              <button 
                onClick={() => navigate('/signin')}
                style={{ 
                  color: '#374151', 
                  fontWeight: '500',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer'
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
                  padding: '8px 20px',
                  borderRadius: '6px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </header>

      <div style={{ 
        maxWidth: '1400px', 
        margin: '0 auto', 
        padding: '48px 20px'
      }}>
        {/* Success Header */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            background: '#d1fae5',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px'
          }}>
            <CheckCircle size={32} color="#10b981" />
          </div>
          <h1 style={{ 
            fontSize: '48px', 
            fontWeight: 'bold', 
            color: '#111827', 
            marginBottom: '16px'
          }}>
            📊 Analysis Complete!
          </h1>
          <p style={{ fontSize: '20px', color: '#6b7280' }}>
            Here's how your resume performs against the target job requirements
          </p>
        </div>

        <div style={{ 
          display: 'grid',
          gridTemplateColumns: '1fr 2fr',
          gap: '32px',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          {/* Score Panel */}
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '32px',
            textAlign: 'center',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
            height: 'fit-content'
          }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', marginBottom: '24px' }}>
              Overall Score
            </h2>
            
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
              <CircularProgress 
                percentage={analysisResults.jobAlignment} 
                color={analysisResults.jobAlignment >= 80 ? "#10b981" : analysisResults.jobAlignment >= 60 ? "#f59e0b" : "#ef4444"}
              />
            </div>
            
            <div style={{
              padding: '16px',
              borderRadius: '12px',
              background: analysisResults.jobAlignment >= 80 
                ? '#ecfdf5' 
                : analysisResults.jobAlignment >= 60 
                ? '#fef3c7'
                : '#fef2f2',
              border: `1px solid ${
                analysisResults.jobAlignment >= 80 
                  ? '#d1fae5' 
                  : analysisResults.jobAlignment >= 60 
                  ? '#fde68a'
                  : '#fecaca'
              }`
            }}>
              <h3 style={{ 
                fontWeight: 'bold', 
                marginBottom: '8px',
                color: analysisResults.jobAlignment >= 80 
                  ? '#065f46' 
                  : analysisResults.jobAlignment >= 60 
                  ? '#92400e'
                  : '#991b1b'
              }}>
                {analysisResults.jobAlignment >= 80 
                  ? '🎉 Great Match!' 
                  : analysisResults.jobAlignment >= 60 
                  ? '⚡ Good Potential'
                  : '🔧 Needs Work'
                }
              </h3>
              <p style={{ 
                fontSize: '14px', 
                color: '#374151',
                lineHeight: '1.5'
              }}>
                {analysisResults.jobAlignment >= 80 
                  ? 'Your resume aligns well with the job requirements. A few tweaks can make it even better!' 
                  : analysisResults.jobAlignment >= 60 
                  ? 'Your resume shows potential but needs some enhancements to better match the role.'
                  : 'Significant improvements needed to align with job requirements.'
                }
              </p>
            </div>
          </div>

          {/* Feedback Panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Strengths */}
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '32px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px', 
                marginBottom: '24px'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  background: '#d1fae5',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <CheckCircle size={20} color="#10b981" />
                </div>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>
                  ✅ Key Strengths
                </h2>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {analysisResults.strengths.map((strength, index) => (
                  <div key={index} style={{ 
                    display: 'flex', 
                    alignItems: 'flex-start', 
                    gap: '12px',
                    padding: '16px',
                    background: '#ecfdf5',
                    borderRadius: '12px',
                    borderLeft: '4px solid #10b981'
                  }}>
                    <div style={{
                      width: '24px',
                      height: '24px',
                      background: '#10b981',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '2px'
                    }}>
                      <CheckCircle size={14} color="white" />
                    </div>
                    <p style={{ color: '#1f2937', fontWeight: '500' }}>{strength}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Areas for Improvement */}
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '32px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px', 
                marginBottom: '24px'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  background: '#fed7aa',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <AlertTriangle size={20} color="#f59e0b" />
                </div>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>
                  🔧 Areas for Improvement
                </h2>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {analysisResults.improvements.map((improvement, index) => (
                  <div key={index} style={{ 
                    display: 'flex', 
                    alignItems: 'flex-start', 
                    gap: '12px',
                    padding: '16px',
                    background: '#fef3c7',
                    borderRadius: '12px',
                    borderLeft: '4px solid #f59e0b'
                  }}>
                    <div style={{
                      width: '24px',
                      height: '24px',
                      background: '#f59e0b',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '2px'
                    }}>
                      <AlertTriangle size={14} color="white" />
                    </div>
                    <p style={{ color: '#1f2937', fontWeight: '500' }}>{improvement}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ 
          display: 'flex',
          gap: '24px',
          justifyContent: 'center',
          marginTop: '48px',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={() => navigate('/resume-analysis/step1')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '16px 32px',
              background: 'white',
              border: '2px solid #e5e7eb',
              color: '#374151',
              borderRadius: '12px',
              fontWeight: '600',
              fontSize: '16px',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => e.target.style.borderColor = '#d1d5db'}
            onMouseLeave={(e) => e.target.style.borderColor = '#e5e7eb'}
          >
            <ArrowLeft size={20} />
            Analyze Different Resume
          </button>
          
          <button
            onClick={() => navigate('/improve-resume/step1')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '20px 48px',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: 'white',
              border: 'none',
              borderRadius: '16px',
              fontWeight: 'bold',
              fontSize: '20px',
              cursor: 'pointer',
              boxShadow: '0 10px 25px rgba(16, 185, 129, 0.3)',
              animation: 'pulse 2s infinite',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)'
              e.target.style.boxShadow = '0 15px 35px rgba(16, 185, 129, 0.4)'
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)'
              e.target.style.boxShadow = '0 10px 25px rgba(16, 185, 129, 0.3)'
            }}
          >
            <Wand2 size={24} />
            Enhance Resume Now
          </button>
          
          <button 
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '16px 32px',
              background: 'white',
              border: '2px solid #dbeafe',
              color: '#1d4ed8',
              borderRadius: '12px',
              fontWeight: '600',
              fontSize: '16px',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.borderColor = '#93c5fd'
              e.target.style.background = '#eff6ff'
            }}
            onMouseLeave={(e) => {
              e.target.style.borderColor = '#dbeafe'
              e.target.style.background = 'white'
            }}
          >
            <Download size={20} />
            Download Report
          </button>
        </div>

        {/* Preview Enhancement */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '32px',
          marginTop: '32px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
          background: 'linear-gradient(135deg, #eff6ff, #f3e8ff)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', marginBottom: '12px' }}>
              💡 Quick Enhancement Preview
            </h2>
            <p style={{ color: '#6b7280' }}>
              See how your resume could be improved with our AI enhancement tool
            </p>
          </div>
          
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '24px'
          }}>
            <div style={{
              padding: '24px',
              background: '#fef2f2',
              border: '2px solid #fecaca',
              borderRadius: '12px'
            }}>
              <h3 style={{ fontWeight: 'bold', color: '#991b1b', marginBottom: '12px', textAlign: 'center' }}>
                Current Summary
              </h3>
              <p style={{ 
                color: '#374151', 
                fontSize: '14px', 
                fontStyle: 'italic',
                lineHeight: '1.5'
              }}>
                "Experienced software developer with knowledge in various programming languages and web development."
              </p>
              <div style={{ marginTop: '12px', textAlign: 'center' }}>
                <span style={{
                  fontSize: '12px',
                  background: '#fee2e2',
                  color: '#991b1b',
                  padding: '4px 8px',
                  borderRadius: '50px'
                }}>
                  Generic • Lacks impact
                </span>
              </div>
            </div>
            
            <div style={{
              padding: '24px',
              background: '#ecfdf5',
              border: '2px solid #a7f3d0',
              borderRadius: '12px'
            }}>
              <h3 style={{ fontWeight: 'bold', color: '#065f46', marginBottom: '12px', textAlign: 'center' }}>
                Enhanced Summary
              </h3>
              <p style={{ 
                color: '#374151', 
                fontSize: '14px',
                lineHeight: '1.5'
              }}>
                "Results-driven Senior Software Engineer with 5+ years developing scalable applications. Led team of 8 developers, improving deployment efficiency by 40% and reducing system downtime by 65%."
              </p>
              <div style={{ marginTop: '12px', textAlign: 'center' }}>
                <span style={{
                  fontSize: '12px',
                  background: '#d1fae5',
                  color: '#065f46',
                  padding: '4px 8px',
                  borderRadius: '50px'
                }}>
                  Quantified • Impactful
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <style>
        {`
          @keyframes pulse {
            0%, 100% { box-shadow: 0 10px 25px rgba(16, 185, 129, 0.3); }
            50% { box-shadow: 0 15px 35px rgba(16, 185, 129, 0.6); }
          }
        `}
      </style>
    </div>
  )
}

export default ResumeAnalysisStep2