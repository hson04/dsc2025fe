import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, User, Check } from 'lucide-react'
import API_CONFIG from '../config/api'

const SignUp = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required'
    }

    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const formErrors = validateForm()
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors)
      return
    }

    setIsLoading(true)
    setErrors({})

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.USERDB.REGISTER}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: formData.fullName,
          email: formData.email,
          password: formData.password,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.detail || "Unable to create account")
      }

      const data = await response.json()
      console.log("User registered successfully")
      // Navigate to verification page with email
      navigate(`/verify-account?email=${encodeURIComponent(formData.email)}`)
    } catch (error) {
      setErrors({ general: error.message })
    } finally {
      setIsLoading(false)
    }
  }

  const getPasswordStrength = () => {
    const password = formData.password
    let strength = 0
    
    if (password.length >= 8) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/[a-z]/.test(password)) strength++
    if (/[0-9]/.test(password)) strength++
    if (/[^A-Za-z0-9]/.test(password)) strength++

    return strength
  }

  const strengthColors = ['#ef4444', '#f97316', '#eab308', '#3b82f6', '#10b981']
  const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong']

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #eff6ff, #e0e7ff, #f3e8ff)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      padding: '48px 24px'
    }}>
      <div style={{ maxWidth: '448px', margin: '0 auto', width: '100%' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto',
            boxShadow: '0 10px 25px rgba(0,0,0,0.15)'
          }}>
            <span style={{ color: 'white', fontWeight: 'bold', fontSize: '24px' }}>CV</span>
          </div>
          <h2 style={{ 
            marginTop: '24px', 
            fontSize: '32px', 
            fontWeight: 'bold', 
            color: '#111827'
          }}>
            Join CVision Today
          </h2>
          <p style={{ 
            marginTop: '8px', 
            color: '#6b7280',
            fontSize: '16px'
          }}>
            Create your account and start optimizing your career
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '448px', margin: '0 auto', width: '100%' }}>
        <div style={{
          background: 'white',
          padding: '32px',
          borderRadius: '16px',
          boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
          border: 'none'
        }}>
          {errors.general && (
            <div style={{
              marginBottom: '24px',
              background: '#fef2f2',
              borderLeft: '4px solid #ef4444',
              padding: '16px',
              borderRadius: '0 8px 8px 0'
            }}>
              <p style={{ color: '#991b1b', fontWeight: '500' }}>{errors.general}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Full Name */}
            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '14px', 
                fontWeight: '600', 
                color: '#374151', 
                marginBottom: '8px'
              }}>
                Full Name
              </label>
              <div style={{ position: 'relative' }}>
                <User 
                  size={20} 
                  color="#9ca3af"
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)'
                  }}
                />
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  style={{
                    width: '100%',
                    paddingLeft: '48px',
                    paddingRight: '16px',
                    paddingTop: '12px',
                    paddingBottom: '12px',
                    border: errors.fullName ? '2px solid #fca5a5' : '2px solid #e5e7eb',
                    borderRadius: '12px',
                    fontSize: '16px',
                    outline: 'none',
                    transition: 'all 0.2s ease'
                  }}
                  onFocus={(e) => {
                    if (!errors.fullName) {
                      e.target.style.borderColor = '#3b82f6'
                      e.target.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.1)'
                    }
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = errors.fullName ? '#fca5a5' : '#e5e7eb'
                    e.target.style.boxShadow = 'none'
                  }}
                />
              </div>
              {errors.fullName && (
                <p style={{ marginTop: '8px', fontSize: '14px', color: '#dc2626' }}>{errors.fullName}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '14px', 
                fontWeight: '600', 
                color: '#374151', 
                marginBottom: '8px'
              }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail 
                  size={20} 
                  color="#9ca3af"
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)'
                  }}
                />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  style={{
                    width: '100%',
                    paddingLeft: '48px',
                    paddingRight: '16px',
                    paddingTop: '12px',
                    paddingBottom: '12px',
                    border: errors.email ? '2px solid #fca5a5' : '2px solid #e5e7eb',
                    borderRadius: '12px',
                    fontSize: '16px',
                    outline: 'none',
                    transition: 'all 0.2s ease'
                  }}
                  onFocus={(e) => {
                    if (!errors.email) {
                      e.target.style.borderColor = '#3b82f6'
                      e.target.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.1)'
                    }
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = errors.email ? '#fca5a5' : '#e5e7eb'
                    e.target.style.boxShadow = 'none'
                  }}
                />
              </div>
              {errors.email && (
                <p style={{ marginTop: '8px', fontSize: '14px', color: '#dc2626' }}>{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '14px', 
                fontWeight: '600', 
                color: '#374151', 
                marginBottom: '8px'
              }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock 
                  size={20} 
                  color="#9ca3af"
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)'
                  }}
                />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a strong password"
                  style={{
                    width: '100%',
                    paddingLeft: '48px',
                    paddingRight: '48px',
                    paddingTop: '12px',
                    paddingBottom: '12px',
                    border: errors.password ? '2px solid #fca5a5' : '2px solid #e5e7eb',
                    borderRadius: '12px',
                    fontSize: '16px',
                    outline: 'none',
                    transition: 'all 0.2s ease'
                  }}
                  onFocus={(e) => {
                    if (!errors.password) {
                      e.target.style.borderColor = '#3b82f6'
                      e.target.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.1)'
                    }
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = errors.password ? '#fca5a5' : '#e5e7eb'
                    e.target.style.boxShadow = 'none'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#9ca3af'
                  }}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              
              {/* Password Strength */}
              {formData.password && (
                <div style={{ marginTop: '12px' }}>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {[...Array(5)].map((_, index) => (
                      <div
                        key={index}
                        style={{
                          height: '8px',
                          flex: 1,
                          borderRadius: '4px',
                          background: index < getPasswordStrength() 
                            ? strengthColors[getPasswordStrength() - 1] 
                            : '#e5e7eb',
                          transition: 'background 0.3s ease'
                        }}
                      />
                    ))}
                  </div>
                  <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                    Password strength: {strengthLabels[getPasswordStrength() - 1] || 'Too short'}
                  </p>
                </div>
              )}
              
              {errors.password && (
                <p style={{ marginTop: '8px', fontSize: '14px', color: '#dc2626' }}>{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '14px', 
                fontWeight: '600', 
                color: '#374151', 
                marginBottom: '8px'
              }}>
                Confirm Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock 
                  size={20} 
                  color="#9ca3af"
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)'
                  }}
                />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  style={{
                    width: '100%',
                    paddingLeft: '48px',
                    paddingRight: '48px',
                    paddingTop: '12px',
                    paddingBottom: '12px',
                    border: errors.confirmPassword ? '2px solid #fca5a5' : '2px solid #e5e7eb',
                    borderRadius: '12px',
                    fontSize: '16px',
                    outline: 'none',
                    transition: 'all 0.2s ease'
                  }}
                  onFocus={(e) => {
                    if (!errors.confirmPassword) {
                      e.target.style.borderColor = '#3b82f6'
                      e.target.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.1)'
                    }
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = errors.confirmPassword ? '#fca5a5' : '#e5e7eb'
                    e.target.style.boxShadow = 'none'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#9ca3af'
                  }}
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {formData.confirmPassword && formData.password === formData.confirmPassword && (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  color: '#10b981',
                  marginTop: '8px'
                }}>
                  <Check size={16} style={{ marginRight: '4px' }} />
                  <span style={{ fontSize: '14px' }}>Passwords match</span>
                </div>
              )}
              {errors.confirmPassword && (
                <p style={{ marginTop: '8px', fontSize: '14px', color: '#dc2626' }}>{errors.confirmPassword}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '16px',
                background: isLoading ? '#9ca3af' : 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontWeight: 'bold',
                fontSize: '18px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.target.style.transform = 'translateY(-1px)'
                  e.target.style.boxShadow = '0 10px 25px rgba(59, 130, 246, 0.3)'
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading) {
                  e.target.style.transform = 'translateY(0)'
                  e.target.style.boxShadow = 'none'
                }
              }}
            >
              {isLoading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    border: '2px solid white',
                    borderTop: '2px solid transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                  Creating Account...
                </div>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Sign In Link */}
          <div style={{ textAlign: 'center', marginTop: '32px' }}>
            <p style={{ color: '#6b7280' }}>
              Already have an account?{' '}
              <Link
                to="/signin"
                style={{
                  fontWeight: '600',
                  color: '#3b82f6',
                  textDecoration: 'none'
                }}
              >
                Sign in here
              </Link>
            </p>
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
    </div>
  )
}

export default SignUp