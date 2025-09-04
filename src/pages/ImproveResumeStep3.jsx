import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Download, CheckCircle, TrendingUp, Target, Award, ArrowLeft } from 'lucide-react'

const ImproveResumeStep3 = () => {
  const [isGenerating, setIsGenerating] = useState(true)
  const [progress, setProgress] = useState(0)
  const navigate = useNavigate()

  const metrics = {
    jobAlignment: 92,
    contentPreservation: 88,
    atsOptimization: 95,
    overallImprovement: 90
  }

  const summary = {
    title: "Your Resume Has Been Successfully Enhanced!",
    description: "Our AI has analyzed your resume against the job requirements and made strategic improvements to increase your chances of getting an interview.",
    improvements: [
      "Added 12 relevant keywords for better ATS compatibility",
      "Quantified 8 achievements with specific metrics and numbers",
      "Restructured work experience for better impact presentation", 
      "Enhanced technical skills section with job-relevant technologies",
      "Improved professional summary to highlight key strengths"
    ],
    beforeAfter: {
      before: "Generic software developer with experience in web development and programming.",
      after: "Results-driven Senior Software Engineer with 5+ years developing scalable web applications using React, Node.js, and AWS. Led cross-functional teams of 8+ developers, improving deployment efficiency by 40% and reducing system downtime by 65%."
    }
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          setIsGenerating(false)
          clearInterval(interval)
          return 100
        }
        return prev + 10
      })
    }, 300)

    return () => clearInterval(interval)
  }, [])

  const CircularProgress = ({ percentage, color, label, size = 120 }) => {
    const radius = (size - 20) / 2
    const circumference = radius * 2 * Math.PI
    const strokeDasharray = circumference
    const strokeDashoffset = circumference - (percentage / 100) * circumference

    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ position: 'relative', width: size, height: size }}>
          <svg style={{ transform: 'rotate(-90deg)' }} width={size} height={size}>
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="#e5e7eb"
              strokeWidth="8"
              fill="none"
            />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={color}
              strokeWidth="8"
              fill="none"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              style={{ transition: 'all 1s ease-out' }}
            />
          </svg>
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>{percentage}%</span>
          </div>
        </div>
        <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#111827', marginTop: '12px', textAlign: 'center' }}>
          {label}
        </h3>
      </div>
    )
  }

  if (isGenerating) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #eff6ff, #e0e7ff, #f3e8ff)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
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
            fontSize: '32px', 
            fontWeight: 'bold', 
            color: '#111827', 
            marginBottom: '24px'
          }}>
            Enhancing Your Resume with AI
          </h2>
          
          <div style={{ maxWidth: '400px', margin: '0 auto 24px' }}>
            <div style={{
              width: '100%',
              background: 'white',
              borderRadius: '50px',
              height: '12px',
              overflow: 'hidden'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                height: '12px',
                borderRadius: '50px',
                transition: 'width 0.3s ease',
                width: `${progress}%`
              }}></div>
            </div>
            <p style={{ color: '#6b7280', marginTop: '8px', fontSize: '16px', fontWeight: '500' }}>
              {progress}% complete
            </p>
          </div>
          
          <div style={{ fontSize: '14px', color: '#6b7280', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <p>🔍 Analyzing job requirements...</p>
            <p>📝 Optimizing content structure...</p>
            <p>🎯 Adding relevant keywords...</p>
            <p>✨ Enhancing achievements...</p>
          </div>
        </div>

        <style>
          {`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #eff6ff, #e0e7ff, #f3e8ff)' }}>
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
              <a href="/resume-analysis/step1" style={{ color: '#374151', fontWeight: '500', textDecoration: 'none' }}>Resume Analysis</a>
              <a href="/improve-resume/step1" style={{ color: '#3b82f6', fontWeight: '500', textDecoration: 'none' }}>Improve Resume</a>
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
        {/* Step Indicator */}
        <div style={{ marginBottom: '48px' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{
                width: '40px',
                height: '40px',
                background: '#10b981',
                color: 'white',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold'
              }}>
                ✓
              </div>
              <span style={{ marginLeft: '12px', color: '#10b981', fontWeight: '600' }}>
                Job Description & Resume
              </span>
            </div>
            
            <div style={{ width: '48px', height: '4px', background: '#10b981', borderRadius: '2px' }}></div>
            
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{
                width: '40px',
                height: '40px',
                background: '#10b981',
                color: 'white',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold'
              }}>
                ✓
              </div>
              <span style={{ marginLeft: '12px', color: '#10b981', fontWeight: '600' }}>
                Supplement Details
              </span>
            </div>
            
            <div style={{ width: '48px', height: '4px', background: '#3b82f6', borderRadius: '2px' }}></div>
            
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{
                width: '40px',
                height: '40px',
                background: '#3b82f6',
                color: 'white',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold'
              }}>
                3
              </div>
              <span style={{ marginLeft: '12px', color: '#3b82f6', fontWeight: '600' }}>
                Enhanced Resume
              </span>
            </div>
          </div>
        </div>

        {/* Success Header */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div style={{
            width: '80px',
            height: '80px',
            background: 'linear-gradient(135deg, #22c55e, #15803d)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px'
          }}>
            <CheckCircle size={40} color="white" />
          </div>
          <h1 style={{ 
            fontSize: '48px', 
            fontWeight: 'bold', 
            color: '#111827', 
            marginBottom: '16px'
          }}>
            🎉 Resume Enhancement Complete!
          </h1>
          <p style={{ 
            fontSize: '20px', 
            color: '#6b7280',
            maxWidth: '700px',
            margin: '0 auto',
            lineHeight: '1.6'
          }}>
            Your resume has been professionally enhanced and optimized for the target position. 
            Download your improved resume and review the enhancement metrics below.
          </p>
        </div>

        {/* Main CTA */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <button style={{
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            color: 'white',
            border: 'none',
            padding: '24px 48px',
            borderRadius: '20px',
            fontWeight: 'bold',
            fontSize: '24px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            margin: '0 auto',
            boxShadow: '0 20px 40px rgba(59, 130, 246, 0.3)',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-3px)'
            e.target.style.boxShadow = '0 25px 50px rgba(59, 130, 246, 0.4)'
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)'
            e.target.style.boxShadow = '0 20px 40px rgba(59, 130, 246, 0.3)'
          }}
          >
            <Download size={28} />
            Download Enhanced Resume
          </button>
        </div>

        <div style={{ 
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: '32px'
        }}>
          {/* Metrics Section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div style={{
              background: 'white',
              borderRadius: '20px',
              padding: '32px',
              boxShadow: '0 25px 50px rgba(0,0,0,0.1)',
              border: 'none'
            }}>
              <h2 style={{ 
                fontSize: '28px', 
                fontWeight: 'bold', 
                color: '#111827', 
                marginBottom: '32px',
                textAlign: 'center'
              }}>
                Enhancement Metrics
              </h2>
              
              <div style={{ 
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '32px'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <CircularProgress 
                    percentage={metrics.jobAlignment} 
                    color="#3b82f6" 
                    label="Job Alignment Score"
                  />
                  <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '8px' }}>
                    How well your resume matches the job requirements
                  </p>
                </div>
                
                <div style={{ textAlign: 'center' }}>
                  <CircularProgress 
                    percentage={metrics.contentPreservation} 
                    color="#10b981" 
                    label="Content Preservation"
                  />
                  <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '8px' }}>
                    Your original experience and skills retained
                  </p>
                </div>
              </div>

              <div style={{ 
                marginTop: '32px', 
                paddingTop: '32px',
                borderTop: '1px solid #e5e7eb'
              }}>
                <div style={{ 
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '24px'
                }}>
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '16px',
                    background: '#eff6ff',
                    borderRadius: '12px'
                  }}>
                    <div style={{ 
                      fontSize: '32px', 
                      fontWeight: 'bold', 
                      color: '#3b82f6', 
                      marginBottom: '4px'
                    }}>
                      {metrics.atsOptimization}%
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: '500', color: '#1e40af' }}>
                      ATS Optimization
                    </div>
                  </div>
                  
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '16px',
                    background: '#faf5ff',
                    borderRadius: '12px'
                  }}>
                    <div style={{ 
                      fontSize: '32px', 
                      fontWeight: 'bold', 
                      color: '#8b5cf6', 
                      marginBottom: '4px'
                    }}>
                      {metrics.overallImprovement}%
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: '500', color: '#6b21a8' }}>
                      Overall Improvement
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Before/After Comparison */}
            <div style={{
              background: 'white',
              borderRadius: '20px',
              padding: '32px',
              boxShadow: '0 25px 50px rgba(0,0,0,0.1)',
              border: 'none'
            }}>
              <h2 style={{ 
                fontSize: '28px', 
                fontWeight: 'bold', 
                color: '#111827', 
                marginBottom: '24px',
                textAlign: 'center'
              }}>
                Before vs After Comparison
              </h2>
              
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
                  <h3 style={{ 
                    fontWeight: 'bold', 
                    color: '#991b1b', 
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <span style={{
                      width: '24px',
                      height: '24px',
                      background: '#ef4444',
                      color: 'white',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px'
                    }}>
                      ✗
                    </span>
                    Original Summary
                  </h3>
                  <p style={{ 
                    color: '#374151', 
                    fontSize: '14px', 
                    lineHeight: '1.5'
                  }}>
                    {summary.beforeAfter.before}
                  </p>
                </div>
                
                <div style={{
                  padding: '24px',
                  background: '#ecfdf5',
                  border: '2px solid #a7f3d0',
                  borderRadius: '12px'
                }}>
                  <h3 style={{ 
                    fontWeight: 'bold', 
                    color: '#065f46', 
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <span style={{
                      width: '24px',
                      height: '24px',
                      background: '#10b981',
                      color: 'white',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px'
                    }}>
                      ✓
                    </span>
                    Enhanced Summary
                  </h3>
                  <p style={{ 
                    color: '#374151', 
                    fontSize: '14px', 
                    lineHeight: '1.5'
                  }}>
                    {summary.beforeAfter.after}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Summary Card */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{
              background: 'white',
              borderRadius: '20px',
              padding: '24px',
              boxShadow: '0 25px 50px rgba(0,0,0,0.1)',
              border: 'none'
            }}>
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px'
                }}>
                  <TrendingUp size={24} color="white" />
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#111827' }}>
                  Quality Assessment
                </h3>
              </div>
              
              <div style={{
                padding: '16px',
                background: '#ecfdf5',
                border: '1px solid #a7f3d0',
                borderRadius: '8px',
                marginBottom: '16px'
              }}>
                <h4 style={{ fontWeight: '600', color: '#065f46', marginBottom: '8px' }}>
                  ✅ Key Improvements
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {summary.improvements.slice(0, 3).map((improvement, index) => (
                    <div key={index} style={{ fontSize: '12px', color: '#047857' }}>
                      • {improvement}
                    </div>
                  ))}
                </div>
              </div>
              
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  fontSize: '28px', 
                  fontWeight: 'bold', 
                  color: '#111827', 
                  marginBottom: '4px'
                }}>
                  {metrics.overallImprovement}%
                </div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>Overall Enhancement</div>
                <div style={{
                  width: '100%',
                  background: '#e5e7eb',
                  borderRadius: '50px',
                  height: '8px',
                  marginTop: '8px'
                }}>
                  <div style={{
                    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                    height: '8px',
                    borderRadius: '50px',
                    width: `${metrics.overallImprovement}%`,
                    transition: 'width 1s ease-out'
                  }}></div>
                </div>
              </div>
            </div>

            {/* Action Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <button style={{
                width: '100%',
                padding: '16px',
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}>
                <Download size={20} />
                Download PDF Resume
              </button>
              
              <button style={{
                width: '100%',
                padding: '16px',
                background: 'white',
                border: '2px solid #e5e7eb',
                color: '#374151',
                borderRadius: '12px',
                fontWeight: '600',
                cursor: 'pointer'
              }}>
                📧 Email Resume
              </button>
              
              <button style={{
                width: '100%',
                padding: '16px',
                background: 'white',
                border: '2px solid #e5e7eb',
                color: '#374151',
                borderRadius: '12px',
                fontWeight: '600',
                cursor: 'pointer'
              }}>
                📋 Copy to Clipboard
              </button>
            </div>
          </div>
        </div>

        {/* Detailed Improvements */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '32px',
          boxShadow: '0 25px 50px rgba(0,0,0,0.1)',
          border: 'none',
          marginTop: '32px'
        }}>
          <h2 style={{ 
            fontSize: '28px', 
            fontWeight: 'bold', 
            color: '#111827', 
            marginBottom: '24px',
            textAlign: 'center'
          }}>
            What We Enhanced
          </h2>
          
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: '24px'
          }}>
            {summary.improvements.map((improvement, index) => (
              <div key={index} style={{ 
                display: 'flex', 
                alignItems: 'flex-start', 
                gap: '12px',
                padding: '16px',
                background: '#f8fafc',
                borderRadius: '12px'
              }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  background: '#3b82f6',
                  color: 'white',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  flexShrink: 0,
                  marginTop: '2px'
                }}>
                  {index + 1}
                </div>
                <p style={{ color: '#374151', fontSize: '14px' }}>{improvement}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ 
          display: 'flex',
          gap: '16px',
          marginTop: '48px',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={() => navigate('/improve-resume/step2')}
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
              cursor: 'pointer'
            }}
          >
            <ArrowLeft size={20} />
            Back to Step 2
          </button>
          
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '16px 48px',
              background: 'linear-gradient(135deg, #10b981, #047857)',
              color: 'white',
              border: 'none',
              borderRadius: '16px',
              fontWeight: 'bold',
              fontSize: '18px',
              cursor: 'pointer',
              boxShadow: '0 10px 25px rgba(16, 185, 129, 0.3)',
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
            🎉 Finish & Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}

export default ImproveResumeStep3