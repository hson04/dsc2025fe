import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, FileText, Briefcase, ArrowRight, BarChart3, CheckCircle } from 'lucide-react'

const ResumeAnalysisStep1 = () => {
  const [jobDescription, setJobDescription] = useState('')
  const [resumeFile, setResumeFile] = useState(null)
  const [dragActive, setDragActive] = useState(false)
  const navigate = useNavigate()

  const handleFileUpload = (file) => {
    if (file && (file.type === 'application/pdf' || file.name.endsWith('.doc') || file.name.endsWith('.docx'))) {
      setResumeFile(file)
    }
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = [...e.dataTransfer.files]
    if (files && files[0]) {
      handleFileUpload(files[0])
    }
  }

  const handleAnalyze = () => {
    if (jobDescription.trim() && resumeFile) {
      sessionStorage.setItem('analysisJobDescription', jobDescription)
      sessionStorage.setItem('analysisResumeFile', resumeFile.name)
      navigate('/resume-analysis/step2')
    }
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
                  cursor: 'pointer',
                  padding: '8px'
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
        maxWidth: '1000px', 
        margin: '0 auto', 
        padding: '48px 20px'
      }}>
        {/* Header Section */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            boxShadow: '0 10px 25px rgba(59, 130, 246, 0.3)'
          }}>
            <BarChart3 size={32} color="white" />
          </div>
          <h1 style={{ 
            fontSize: '48px', 
            fontWeight: 'bold', 
            color: '#111827', 
            marginBottom: '16px'
          }}>
            Resume Analysis
          </h1>
          <p style={{ 
            fontSize: '20px', 
            color: '#6b7280',
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: '1.6'
          }}>
            Get detailed insights about how well your resume matches your target job. 
            Our AI will analyze compatibility and provide actionable feedback.
          </p>
        </div>

        {/* Main Content */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '40px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
          border: 'none'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
            {/* Job Description Section */}
            <div>
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
                  <Briefcase size={18} color="#3b82f6" />
                </div>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>
                  Target Job Description
                </h2>
              </div>
              
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job description of the position you're targeting...

We're looking for a Senior Software Engineer with expertise in:
• 5+ years of experience in full-stack development
• Proficiency in React, Node.js, and Python
• Experience with AWS cloud services
• Strong background in database design and optimization
• Leadership experience in agile development teams"
                rows="8"
                style={{
                  width: '100%',
                  padding: '16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  fontSize: '16px',
                  lineHeight: '1.6',
                  resize: 'none',
                  outline: 'none',
                  fontFamily: 'inherit'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6'
                  e.target.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.1)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb'
                  e.target.style.boxShadow = 'none'
                }}
              />
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginTop: '8px'
              }}>
                <span style={{ fontSize: '14px', color: '#6b7280' }}>
                  {jobDescription.length} characters
                </span>
                {jobDescription.length > 100 && (
                  <span style={{ 
                    fontSize: '14px', 
                    color: '#10b981', 
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <CheckCircle size={16} />
                    Good length
                  </span>
                )}
              </div>
            </div>

            {/* Resume Upload Section */}
            <div>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px', 
                marginBottom: '16px'
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  background: '#fae8ff',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <FileText size={18} color="#8b5cf6" />
                </div>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>
                  Upload Your Resume
                </h2>
              </div>
              
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                style={{
                  border: resumeFile ? '3px solid #10b981' : dragActive ? '3px dashed #3b82f6' : '3px dashed #d1d5db',
                  borderRadius: '16px',
                  padding: '40px',
                  textAlign: 'center',
                  transition: 'all 0.3s ease',
                  background: resumeFile ? '#ecfdf5' : dragActive ? '#eff6ff' : '#f9fafb',
                  transform: dragActive ? 'scale(1.02)' : 'scale(1)'
                }}
              >
                {resumeFile ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{
                      width: '64px',
                      height: '64px',
                      background: '#d1fae5',
                      borderRadius: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto'
                    }}>
                      <CheckCircle size={32} color="#10b981" />
                    </div>
                    <div>
                      <h3 style={{ 
                        fontSize: '24px', 
                        fontWeight: 'bold', 
                        color: '#111827', 
                        marginBottom: '8px'
                      }}>
                        📄 Resume Uploaded Successfully!
                      </h3>
                      <p style={{ 
                        color: '#374151', 
                        fontWeight: '500', 
                        marginBottom: '8px'
                      }}>
                        {resumeFile.name}
                      </p>
                      <p style={{ fontSize: '14px', color: '#6b7280' }}>
                        {(resumeFile.size / 1024 / 1024).toFixed(2)} MB • Ready for analysis
                      </p>
                    </div>
                    <button
                      onClick={() => setResumeFile(null)}
                      style={{
                        color: '#3b82f6',
                        fontWeight: '500',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        textDecoration: 'underline'
                      }}
                    >
                      Upload different file
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div style={{
                      width: '80px',
                      height: '80px',
                      background: '#dbeafe',
                      borderRadius: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto'
                    }}>
                      <Upload size={40} color="#3b82f6" />
                    </div>
                    <div>
                      <h3 style={{ 
                        fontSize: '24px', 
                        fontWeight: 'bold', 
                        color: '#111827', 
                        marginBottom: '12px'
                      }}>
                        Drop your resume here
                      </h3>
                      <p style={{ 
                        color: '#6b7280', 
                        marginBottom: '24px',
                        fontSize: '16px'
                      }}>
                        Or click to browse and select your resume file
                      </p>
                      <label style={{ cursor: 'pointer' }}>
                        <span style={{
                          background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                          color: 'white',
                          border: 'none',
                          padding: '16px 32px',
                          borderRadius: '12px',
                          fontWeight: '600',
                          fontSize: '16px',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          <FileText size={20} />
                          Choose Resume File
                        </span>
                        <input
                          type="file"
                          style={{ display: 'none' }}
                          accept=".pdf,.doc,.docx"
                          onChange={(e) => handleFileUpload(e.target.files[0])}
                        />
                      </label>
                    </div>
                    <p style={{ fontSize: '14px', color: '#6b7280' }}>
                      Supports PDF, DOC, DOCX • Max 10MB
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Analyze Button */}
            <div style={{ textAlign: 'center', paddingTop: '24px' }}>
              <button
                onClick={handleAnalyze}
                disabled={!jobDescription.trim() || !resumeFile}
                style={{
                  background: jobDescription.trim() && resumeFile 
                    ? 'linear-gradient(135deg, #3b82f6, #8b5cf6)' 
                    : '#e5e7eb',
                  color: jobDescription.trim() && resumeFile ? 'white' : '#9ca3af',
                  border: 'none',
                  padding: '20px 48px',
                  borderRadius: '16px',
                  fontWeight: 'bold',
                  fontSize: '20px',
                  cursor: jobDescription.trim() && resumeFile ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  margin: '0 auto',
                  boxShadow: jobDescription.trim() && resumeFile ? '0 10px 25px rgba(59, 130, 246, 0.3)' : 'none',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  if (jobDescription.trim() && resumeFile) {
                    e.target.style.transform = 'translateY(-2px)'
                    e.target.style.boxShadow = '0 15px 35px rgba(59, 130, 246, 0.4)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (jobDescription.trim() && resumeFile) {
                    e.target.style.transform = 'translateY(0)'
                    e.target.style.boxShadow = '0 10px 25px rgba(59, 130, 246, 0.3)'
                  }
                }}
              >
                <BarChart3 size={24} />
                Analyze My Resume
                <ArrowRight size={24} />
              </button>
              
              {(!jobDescription.trim() || !resumeFile) && (
                <p style={{ 
                  fontSize: '14px', 
                  color: '#6b7280', 
                  marginTop: '16px'
                }}>
                  Please provide both job description and resume to continue
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={{
        background: 'linear-gradient(135deg, #111827, #1f2937)',
        color: 'white',
        marginTop: '64px'
      }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto', 
          padding: '48px 20px'
        }}>
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '32px'
          }}>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
                About Company
              </h3>
              <p style={{ color: '#9ca3af', lineHeight: '1.6' }}>
                CVision uses advanced AI to help job seekers optimize their resumes and 
                improve their chances of landing their dream jobs.
              </p>
            </div>
            
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
                Job Categories
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <a href="#" style={{ color: '#9ca3af', textDecoration: 'none' }}>Technology</a>
                <a href="#" style={{ color: '#9ca3af', textDecoration: 'none' }}>Marketing</a>
                <a href="#" style={{ color: '#9ca3af', textDecoration: 'none' }}>Design</a>
                <a href="#" style={{ color: '#9ca3af', textDecoration: 'none' }}>Finance</a>
              </div>
            </div>
            
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
                Contact Location
              </h3>
              <div style={{ color: '#9ca3af', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <p>123 Innovation Street</p>
                <p>Tech District, CA 94107</p>
                <p>contact@cvision.com</p>
                <p>+1 (555) 123-4567</p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default ResumeAnalysisStep1