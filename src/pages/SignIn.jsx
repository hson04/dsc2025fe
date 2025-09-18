import { useState, createElement } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom' // Import useLocation
import { Eye, EyeOff, Mail, Lock } from 'lucide-react'
import API_CONFIG from '../config/api'

const SignIn = () => {
  const navigate = useNavigate()
  const location = useLocation() // Get location object first
  
  const [formData, setFormData] = useState({
    email: location?.state?.email || '',
    password: '',
    rememberMe: false
  })
  const [verificationSuccess, setVerificationSuccess] = useState(location?.state?.verificationSuccess || false)
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)

  // Get the previous page URL from state or default to home
  const previousPage = location.state?.from || '/';

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
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

    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
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
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.USERDB.LOGIN}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        if (response.status === 403) {
          // Hiển thị thông báo xác thực email với link resend
          setErrors({
            general: createElement(
              'span',
              { style: { display: 'flex', alignItems: 'center', gap: '8px' } },
              'Please verify your email before signing in.',
              createElement(
                'button',
                {
                  onClick: async () => {
                    try {
                      const form = new FormData();
                      form.append('email', formData.email);
                      
                      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.USERDB.RESEND_VERIFICATION}`, {
                        method: 'POST',
                        body: form
                      });
                      
                      const data = await response.json();
                      if (!response.ok) {
                        throw new Error(data.detail || 'Failed to resend verification email');
                      }
                      
                      setErrors({
                        general: 'Verification email has been sent. Please check your inbox.'
                      });
                    } catch (error) {
                      setErrors({
                        general: error.message
                      });
                    }
                  },
                  style: { 
                    color: '#2563eb', 
                    textDecoration: 'underline', 
                    background: 'none', 
                    border: 'none', 
                    cursor: 'pointer', 
                    padding: 0,
                    fontWeight: '500'
                  }
                },
                'Resend verification email'
              )
            )
          })
          return
        }
        throw new Error(data.detail)
      }

      console.log("Login successful:", data)

      // Save token and user data to localStorage
      localStorage.setItem("access_token", data.access_token)
      localStorage.setItem("user", JSON.stringify(data.user));

      // Redirect to the previous page
      navigate(previousPage)
    } catch (error) {
      setErrors({ general: error.message })
    } finally {
      setIsLoading(false)
    }
  }

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
          <div 
            style={{
              width: '64px',
              height: '64px',
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto',
              boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
              cursor: 'pointer' // Add pointer cursor
            }}
            onClick={() => navigate('/')} // Ensure absolute path for navigation
          >
            <span style={{ color: 'white', fontWeight: 'bold', fontSize: '24px' }}>CV</span>
          </div>
          <h2 style={{ 
            marginTop: '24px', 
            fontSize: '32px', 
            fontWeight: 'bold', 
            color: '#111827'
          }}>
            Welcome Back
          </h2>
          <p style={{ 
            marginTop: '8px', 
            color: '#6b7280',
            fontSize: '16px'
          }}>
            Sign in to continue optimizing your career
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
          {verificationSuccess && (
            <div style={{
              marginBottom: '24px',
              background: '#f0fdf4',
              borderLeft: '4px solid #22c55e',
              padding: '16px',
              borderRadius: '0 8px 8px 0'
            }}>
              <p style={{ color: '#15803d', fontWeight: '500' }}>
                Email verified successfully! You can now sign in.
              </p>
            </div>
          )}
          
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
                  placeholder="Enter your password"
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
              {errors.password && (
                <p style={{ marginTop: '8px', fontSize: '14px', color: '#dc2626' }}>{errors.password}</p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <input
                  id="rememberMe"
                  name="rememberMe"
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  style={{
                    width: '16px',
                    height: '16px',
                    accentColor: '#3b82f6',
                    marginRight: '8px'
                  }}
                />
                <label htmlFor="rememberMe" style={{ fontSize: '14px', color: '#374151', fontWeight: '500' }}>
                  Remember me
                </label>
              </div>

              <a href="#" style={{ fontSize: '14px', color: '#3b82f6', fontWeight: '500', textDecoration: 'none' }}>
                Forgot password?
              </a>
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
                  Signing In...
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Sign Up Link */}
          <div style={{ textAlign: 'center', marginTop: '32px' }}>
            <p style={{ color: '#6b7280' }}>
              Don't have an account?{' '}
              <Link
                to="/signup"
                style={{
                  fontWeight: '600',
                  color: '#3b82f6',
                  textDecoration: 'none'
                }}
              >
                Sign up here
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

export default SignIn