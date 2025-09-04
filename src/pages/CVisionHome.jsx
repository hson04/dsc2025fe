import { useNavigate } from 'react-router-dom'
import { FileText, Mic, TrendingUp, Upload, BarChart3, Wand2, ArrowRight, Award, Zap } from 'lucide-react'

const CVisionHome = () => {
  const navigate = useNavigate()

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Header */}
      <header style={{ 
        background: 'white', 
        borderBottom: '1px solid #e5e7eb',
        position: 'sticky',
        top: 0,
        zIndex: 50
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
                width: '40px',
                height: '40px', 
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span style={{ color: 'white', fontWeight: 'bold' }}>CV</span>
              </div>
              <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>CVision</span>
            </div>
            
            <nav style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '32px'
            }}>
              <a href="/" style={{ color: '#3b82f6', fontWeight: '500', textDecoration: 'none' }}>Home</a>
              <a href="/mock-interview" style={{ color: '#374151', fontWeight: '500', textDecoration: 'none' }}>Mock Interview</a>
              <a href="/resume-analysis/step1" style={{ color: '#374151', fontWeight: '500', textDecoration: 'none' }}>Resume Analysis</a>
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
                  cursor: 'pointer',
                  padding: '8px 16px'
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
                  padding: '12px 24px',
                  borderRadius: '8px',
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

      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(135deg, #1e40af, #7c3aed, #4338ca)',
        color: 'white',
        padding: '80px 20px',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h1 style={{ 
            fontSize: '64px', 
            fontWeight: 'bold', 
            marginBottom: '24px',
            lineHeight: '1.1'
          }}>
            Land Your
          </h1>
          <h1 style={{ 
            fontSize: '64px', 
            fontWeight: 'bold', 
            background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
            backgroundClip: 'text',
            color: 'transparent',
            marginBottom: '32px'
          }}>
            Dream Job
          </h1>
          
          <p style={{ 
            fontSize: '24px', 
            marginBottom: '40px',
            color: '#bfdbfe',
            maxWidth: '700px',
            margin: '0 auto 40px'
          }}>
            AI-powered resume enhancement and mock interview practice. 
            Get hired faster with personalized feedback and optimization.
          </p>

          <div style={{ 
            display: 'flex', 
            gap: '24px', 
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <button 
              onClick={() => navigate('/improve-resume/step1')}
              style={{
                background: 'white',
                color: '#3b82f6',
                border: 'none',
                padding: '16px 32px',
                borderRadius: '16px',
                fontWeight: 'bold',
                fontSize: '18px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}
            >
              <Zap size={24} />
              Get Started Free
            </button>
            
            <button 
              onClick={() => navigate('/mock-interview')}
              style={{
                background: 'transparent',
                color: 'white',
                border: '2px solid white',
                padding: '16px 32px',
                borderRadius: '16px',
                fontWeight: 'bold',
                fontSize: '18px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}
            >
              <Mic size={24} />
              Try Mock Interview
            </button>
          </div>

          <p style={{ 
            marginTop: '24px', 
            color: '#bfdbfe',
            fontSize: '14px'
          }}>
            ✨ No credit card required • Free trial available
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section style={{ 
        padding: '64px 20px', 
        background: 'white'
      }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '32px'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '64px',
              height: '64px',
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <FileText size={28} color="white" />
            </div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>50K+</div>
            <div style={{ color: '#6b7280', fontWeight: '500' }}>Resumes Enhanced</div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '64px',
              height: '64px',
              background: 'linear-gradient(135deg, #10b981, #047857)',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <TrendingUp size={28} color="white" />
            </div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>95%</div>
            <div style={{ color: '#6b7280', fontWeight: '500' }}>Interview Rate Increase</div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '64px',
              height: '64px',
              background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <Mic size={28} color="white" />
            </div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>10K+</div>
            <div style={{ color: '#6b7280', fontWeight: '500' }}>Mock Interviews Completed</div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '64px',
              height: '64px',
              background: 'linear-gradient(135deg, #f59e0b, #dc2626)',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <Award size={28} color="white" />
            </div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>4.9/5</div>
            <div style={{ color: '#6b7280', fontWeight: '500' }}>User Satisfaction</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ 
        padding: '80px 20px', 
        background: '#f8fafc'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <h2 style={{ 
              fontSize: '48px', 
              fontWeight: 'bold', 
              color: '#111827', 
              marginBottom: '24px'
            }}>
              Powerful Tools for Job Success
            </h2>
            <p style={{ 
              fontSize: '20px', 
              color: '#6b7280',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              Everything you need to create an outstanding resume and ace your interviews
            </p>
          </div>

          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: '48px'
          }}>
            {/* CV Enhancement */}
            <div className="card" style={{ 
              padding: '32px',
              textAlign: 'center',
              background: 'white',
              borderRadius: '16px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                background: 'linear-gradient(135deg, #3b82f6, #1e40af)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px'
              }}>
                <FileText size={32} color="white" />
              </div>
              
              <h3 style={{ 
                fontSize: '24px', 
                fontWeight: 'bold', 
                color: '#111827', 
                marginBottom: '16px'
              }}>
                CV Enhancement
              </h3>
              
              <p style={{ 
                color: '#6b7280', 
                fontSize: '16px', 
                lineHeight: '1.6',
                marginBottom: '32px'
              }}>
                AI-powered resume optimization that increases your interview chances by 3x
              </p>
              
              <button
                onClick={() => navigate('/improve-resume/step1')}
                style={{
                  background: 'linear-gradient(135deg, #3b82f6, #1e40af)',
                  color: 'white',
                  border: 'none',
                  padding: '16px 32px',
                  borderRadius: '12px',
                  fontWeight: 'bold',
                  fontSize: '16px',
                  cursor: 'pointer',
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                Try Now <ArrowRight size={20} />
              </button>
            </div>

            {/* Mock Interview */}
            <div className="card" style={{ 
              padding: '32px',
              textAlign: 'center',
              background: 'white',
              borderRadius: '16px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px'
              }}>
                <Mic size={32} color="white" />
              </div>
              
              <h3 style={{ 
                fontSize: '24px', 
                fontWeight: 'bold', 
                color: '#111827', 
                marginBottom: '16px'
              }}>
                Mock Interview
              </h3>
              
              <p style={{ 
                color: '#6b7280', 
                fontSize: '16px', 
                lineHeight: '1.6',
                marginBottom: '32px'
              }}>
                Practice with our AI interviewer and get real-time feedback on your responses
              </p>
              
              <button
                onClick={() => navigate('/mock-interview')}
                style={{
                  background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                  color: 'white',
                  border: 'none',
                  padding: '16px 32px',
                  borderRadius: '12px',
                  fontWeight: 'bold',
                  fontSize: '16px',
                  cursor: 'pointer',
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                Start Practice <ArrowRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section style={{ 
        padding: '80px 20px', 
        background: 'white'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <h2 style={{ 
              fontSize: '48px', 
              fontWeight: 'bold', 
              color: '#111827', 
              marginBottom: '24px'
            }}>
              How It Works
            </h2>
            <p style={{ 
              fontSize: '20px', 
              color: '#6b7280'
            }}>
              Three simple steps to transform your job search success
            </p>
          </div>

          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '48px'
          }}>
            {/* Step 1 */}
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '80px',
                height: '80px',
                background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
                position: 'relative'
              }}>
                <Upload size={36} color="white" />
                <div style={{
                  position: 'absolute',
                  top: '-8px',
                  right: '-8px',
                  width: '32px',
                  height: '32px',
                  background: 'white',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  color: '#111827'
                }}>
                  1
                </div>
              </div>
              
              <h3 style={{ 
                fontSize: '24px', 
                fontWeight: 'bold', 
                color: '#111827', 
                marginBottom: '16px'
              }}>
                Upload Your Resume
              </h3>
              
              <p style={{ 
                color: '#6b7280', 
                fontSize: '16px',
                lineHeight: '1.6'
              }}>
                Simply upload your current resume and paste the job description you're targeting
              </p>
            </div>

            {/* Step 2 */}
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '80px',
                height: '80px',
                background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
                position: 'relative'
              }}>
                <BarChart3 size={36} color="white" />
                <div style={{
                  position: 'absolute',
                  top: '-8px',
                  right: '-8px',
                  width: '32px',
                  height: '32px',
                  background: 'white',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  color: '#111827'
                }}>
                  2
                </div>
              </div>
              
              <h3 style={{ 
                fontSize: '24px', 
                fontWeight: 'bold', 
                color: '#111827', 
                marginBottom: '16px'
              }}>
                AI Analysis
              </h3>
              
              <p style={{ 
                color: '#6b7280', 
                fontSize: '16px',
                lineHeight: '1.6'
              }}>
                Our AI analyzes your resume against job requirements and identifies improvement areas
              </p>
            </div>

            {/* Step 3 */}
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '80px',
                height: '80px',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
                position: 'relative'
              }}>
                <TrendingUp size={36} color="white" />
                <div style={{
                  position: 'absolute',
                  top: '-8px',
                  right: '-8px',
                  width: '32px',
                  height: '32px',
                  background: 'white',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  color: '#111827'
                }}>
                  3
                </div>
              </div>
              
              <h3 style={{ 
                fontSize: '24px', 
                fontWeight: 'bold', 
                color: '#111827', 
                marginBottom: '16px'
              }}>
                Get Enhanced Resume
              </h3>
              
              <p style={{ 
                color: '#6b7280', 
                fontSize: '16px',
                lineHeight: '1.6'
              }}>
                Receive your optimized resume with improved content, keywords, and ATS compatibility
              </p>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '48px' }}>
            <button
              onClick={() => navigate('/improve-resume/step1')}
              style={{
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                color: 'white',
                border: 'none',
                padding: '20px 40px',
                borderRadius: '16px',
                fontWeight: 'bold',
                fontSize: '20px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                margin: '0 auto'
              }}
            >
              Start Your Journey <ArrowRight size={24} />
            </button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        background: 'linear-gradient(135deg, #111827, #374151)',
        color: 'white',
        padding: '64px 20px',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ 
            fontSize: '40px', 
            fontWeight: 'bold', 
            marginBottom: '24px'
          }}>
            Ready to Boost Your Career?
          </h2>
          <p style={{ 
            fontSize: '20px', 
            color: '#9ca3af',
            marginBottom: '40px'
          }}>
            Join thousands of professionals who have enhanced their resumes and aced their interviews with CVision
          </p>
          
          <div style={{ 
            display: 'flex', 
            gap: '24px', 
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={() => navigate('/signup')}
              style={{
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                color: 'white',
                border: 'none',
                padding: '16px 32px',
                borderRadius: '12px',
                fontWeight: 'bold',
                fontSize: '18px',
                cursor: 'pointer'
              }}
            >
              Sign Up Now
            </button>
            
            <button
              onClick={() => navigate('/improve-resume/step1')}
              style={{
                background: 'transparent',
                color: 'white',
                border: '2px solid white',
                padding: '16px 32px',
                borderRadius: '12px',
                fontWeight: 'bold',
                fontSize: '18px',
                cursor: 'pointer'
              }}
            >
              Try Free Tool
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        background: 'linear-gradient(135deg, #111827, #1f2937)',
        color: 'white',
        padding: '48px 20px'
      }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '32px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span style={{ color: 'white', fontWeight: 'bold', fontSize: '14px' }}>CV</span>
              </div>
              <span style={{ fontSize: '20px', fontWeight: 'bold' }}>CVision</span>
            </div>
            <p style={{ color: '#9ca3af', lineHeight: '1.6' }}>
              Empowering job seekers with AI-driven tools to create outstanding resumes and ace their interviews.
            </p>
          </div>
          
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>Quick Links</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <a href="/mock-interview" style={{ color: '#9ca3af', textDecoration: 'none' }}>Mock Interview</a>
              <a href="/resume-analysis/step1" style={{ color: '#9ca3af', textDecoration: 'none' }}>Resume Analysis</a>
              <a href="/improve-resume/step1" style={{ color: '#9ca3af', textDecoration: 'none' }}>Improve Resume</a>
            </div>
          </div>
          
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>Contact</h3>
            <div style={{ color: '#9ca3af', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <p>📍 123 Innovation Street</p>
              <p>Tech District, CA 94107</p>
              <p>📧 contact@cvision.com</p>
              <p>📞 +1 (555) 123-4567</p>
            </div>
          </div>
        </div>
        
        <div style={{ 
          textAlign: 'center', 
          marginTop: '32px', 
          paddingTop: '32px',
          borderTop: '1px solid #374151',
          color: '#9ca3af'
        }}>
          © 2024 CVision. All rights reserved. Made with ❤️ for job seekers worldwide.
        </div>
      </footer>
    </div>
  )
}

export default CVisionHome