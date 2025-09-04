import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Award, Cloud, Code, Briefcase } from 'lucide-react'

const ImproveResumeStep2 = () => {
  const [formData, setFormData] = useState({
    awsSkills: '',
    dockerSkills: '',
    additionalExperience: '',
    certifications: ''
  })
  
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleBack = () => {
    navigate('/improve-resume/step1')
  }

  const handleNext = () => {
    sessionStorage.setItem('supplementaryData', JSON.stringify(formData))
    navigate('/improve-resume/step3')
  }

  const skillSuggestions = {
    aws: ['EC2', 'S3', 'Lambda', 'RDS', 'CloudFormation', 'CloudWatch'],
    docker: ['Docker Compose', 'Kubernetes', 'Container Orchestration', 'Docker Swarm', 'Registry Management']
  }

  const addSkill = (field, skill) => {
    const currentSkills = formData[field].split(',').map(s => s.trim()).filter(s => s)
    if (!currentSkills.includes(skill)) {
      const newSkills = currentSkills.length > 0 ? [...currentSkills, skill] : [skill]
      setFormData(prev => ({
        ...prev,
        [field]: newSkills.join(', ')
      }))
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
        maxWidth: '1000px', 
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
                2
              </div>
              <span style={{ marginLeft: '12px', color: '#3b82f6', fontWeight: '600' }}>
                Supplement Details
              </span>
            </div>
            
            <div style={{ width: '48px', height: '4px', background: '#e5e7eb', borderRadius: '2px' }}></div>
            
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{
                width: '40px',
                height: '40px',
                background: '#e5e7eb',
                color: '#6b7280',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold'
              }}>
                3
              </div>
              <span style={{ marginLeft: '12px', color: '#6b7280', fontWeight: '600' }}>
                Enhanced Resume
              </span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '48px',
          boxShadow: '0 25px 50px rgba(0,0,0,0.1)',
          border: 'none'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h1 style={{ 
              fontSize: '36px', 
              fontWeight: 'bold', 
              color: '#111827', 
              marginBottom: '16px'
            }}>
              Supplement Missing Resume Details
            </h1>
            <p style={{ 
              fontSize: '18px', 
              color: '#6b7280',
              maxWidth: '600px',
              margin: '0 auto',
              lineHeight: '1.6'
            }}>
              Help us understand your skills better by providing additional details that might be missing from your current resume.
            </p>
          </div>

          <div style={{ 
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '32px'
          }}>
            {/* Left Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* AWS Skills */}
              <div style={{
                background: 'linear-gradient(135deg, #fff7ed, #fed7aa)',
                borderRadius: '16px',
                padding: '24px',
                border: '1px solid #fdba74'
              }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px', 
                  marginBottom: '16px'
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    background: 'linear-gradient(135deg, #f97316, #ea580c)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Cloud size={20} color="white" />
                  </div>
                  <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827' }}>
                    AWS Skills
                  </h3>
                </div>
                
                <textarea
                  name="awsSkills"
                  value={formData.awsSkills}
                  onChange={handleChange}
                  placeholder="List your AWS experience and specific services you've worked with..."
                  rows="4"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #fdba74',
                    borderRadius: '8px',
                    outline: 'none',
                    resize: 'none',
                    background: 'white'
                  }}
                />
                
                <div style={{ marginTop: '12px' }}>
                  <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
                    Popular AWS services:
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {skillSuggestions.aws.map((skill, index) => (
                      <button
                        key={index}
                        onClick={() => addSkill('awsSkills', skill)}
                        style={{
                          padding: '4px 12px',
                          background: 'white',
                          border: '1px solid #fdba74',
                          color: '#c2410c',
                          fontSize: '12px',
                          borderRadius: '20px',
                          cursor: 'pointer'
                        }}
                      >
                        + {skill}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Docker Skills */}
              <div style={{
                background: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
                borderRadius: '16px',
                padding: '24px',
                border: '1px solid #93c5fd'
              }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px', 
                  marginBottom: '16px'
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Code size={20} color="white" />
                  </div>
                  <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827' }}>
                    Docker Skills
                  </h3>
                </div>
                
                <textarea
                  name="dockerSkills"
                  value={formData.dockerSkills}
                  onChange={handleChange}
                  placeholder="Describe your Docker and containerization experience..."
                  rows="4"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #93c5fd',
                    borderRadius: '8px',
                    outline: 'none',
                    resize: 'none',
                    background: 'white'
                  }}
                />
                
                <div style={{ marginTop: '12px' }}>
                  <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
                    Docker technologies:
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {skillSuggestions.docker.map((skill, index) => (
                      <button
                        key={index}
                        onClick={() => addSkill('dockerSkills', skill)}
                        style={{
                          padding: '4px 12px',
                          background: 'white',
                          border: '1px solid #93c5fd',
                          color: '#1d4ed8',
                          fontSize: '12px',
                          borderRadius: '20px',
                          cursor: 'pointer'
                        }}
                      >
                        + {skill}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Additional Work Experience */}
              <div style={{
                background: 'linear-gradient(135deg, #fdf4ff, #f3e8ff)',
                borderRadius: '16px',
                padding: '24px',
                border: '1px solid #e9d5ff'
              }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px', 
                  marginBottom: '16px'
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Briefcase size={20} color="white" />
                  </div>
                  <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827' }}>
                    Additional Work Experience
                  </h3>
                </div>
                
                <textarea
                  name="additionalExperience"
                  value={formData.additionalExperience}
                  onChange={handleChange}
                  placeholder="Any additional work experience, side projects, or relevant accomplishments not mentioned in your current resume..."
                  rows="6"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #e9d5ff',
                    borderRadius: '8px',
                    outline: 'none',
                    resize: 'none',
                    background: 'white'
                  }}
                />
              </div>

              {/* Relevant Certifications */}
              <div style={{
                background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)',
                borderRadius: '16px',
                padding: '24px',
                border: '1px solid #a7f3d0'
              }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px', 
                  marginBottom: '16px'
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Award size={20} color="white" />
                  </div>
                  <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827' }}>
                    Relevant Certifications
                  </h3>
                </div>
                
                <textarea
                  name="certifications"
                  value={formData.certifications}
                  onChange={handleChange}
                  placeholder="List any professional certifications, courses, or licenses relevant to this position...

Examples:
- AWS Certified Solutions Architect
- Google Cloud Professional
- PMP Certification
- React Developer Certificate"
                  rows="6"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #a7f3d0',
                    borderRadius: '8px',
                    outline: 'none',
                    resize: 'none',
                    background: 'white'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ 
            display: 'flex',
            gap: '16px',
            marginTop: '48px',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={handleBack}
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
            >
              <ArrowLeft size={20} />
              Back to Step 1
            </button>
            
            <button
              onClick={handleNext}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                padding: '16px 32px',
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontWeight: 'bold',
                fontSize: '18px',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)'
                e.target.style.boxShadow = '0 15px 35px rgba(59, 130, 246, 0.4)'
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)'
                e.target.style.boxShadow = 'none'
              }}
            >
              Continue to Step 3
              <ArrowRight size={20} />
            </button>
          </div>

          {/* Progress Hint */}
          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <p style={{ fontSize: '14px', color: '#6b7280' }}>
              All fields are optional. Skip any section that doesn't apply to you.
            </p>
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
                CVision helps job seekers create compelling resumes and ace their interviews 
                with AI-powered tools and personalized feedback.
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

export default ImproveResumeStep2