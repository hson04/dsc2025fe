import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { CheckCircle, Mail, RefreshCw } from 'lucide-react'
import API_CONFIG from '../config/api'

const VerifyAccount = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [timeLeft, setTimeLeft] = useState(120) // 2 minutes
  const [canResend, setCanResend] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const navigate = useNavigate()
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const email = searchParams.get('email')
  const token = searchParams.get('token')

  const hasCalledApi = useRef(false);

  useEffect(() => {
    let timer;

    // Chỉ verify nếu có token và chưa gọi API
    if (token && !hasCalledApi.current) {
      hasCalledApi.current = true; // Đánh dấu đã gọi API
      verifyToken(token);
    }

    // Timer chỉ chạy khi không có token (màn hình chờ sau đăng ký)
    if (!token) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setCanResend(true)
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (timer) clearInterval(timer)
    }
  }, [token]) // Chỉ chạy lại khi token thay đổi

  const verifyToken = async (verificationToken) => {
    // Nếu không có token hoặc đã gọi API thành công trước đó thì không gọi lại
    if (!verificationToken || success) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.USERDB.VERIFY_EMAIL}?token=${verificationToken}`);
      const data = await response.json();

      if (response.ok || data.message === "Email already verified!") {
        setSuccess('Email verified successfully!');
        setError(''); // Xóa thông báo lỗi nếu có
        
        // Tự động chuyển hướng sau 2 giây
        setTimeout(() => {
          navigate('/signin', { 
            state: { 
              verificationSuccess: true,
              email: email // Truyền email để tự động điền vào form đăng nhập
            } 
          });
        }, 2000);
        return;
      }

      throw new Error(data.detail || 'Verification failed');
    } catch (err) {
      // Chỉ hiển thị lỗi nếu chưa verify thành công và không phải lỗi "đã verify"
      if (!success && err.message !== "Email already verified!") {
        setError(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  }

  // We don't need these handlers anymore since we're using email link verification
  const handleVerify = async () => {
    if (!token) {
      setError('No verification token found')
      return
    }
    await verifyToken(token)
  }

  const handleResend = async () => {
    if (!email) {
      setError('Email address not found')
      return
    }

    setCanResend(false)
    setTimeLeft(120)
    setError('')
    setSuccess('')
    setIsLoading(true)

    try {
      const formData = new FormData();
      formData.append('email', email);
      
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.USERDB.RESEND_VERIFICATION}`, {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to resend verification email')
      }

      setSuccess('Verification email has been resent! Please check your inbox.')
    } catch (err) {
      setError(err.message)
      setCanResend(true)
      setTimeLeft(0)
    } finally {
      setIsLoading(false)
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
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
            {success ? (
              <CheckCircle size={32} className="text-white animate-bounce" />
            ) : (
              <Mail size={32} className="text-white" />
            )}
          </div>
          <h2 style={{ 
            marginTop: '24px', 
            fontSize: '32px', 
            fontWeight: 'bold', 
            color: '#111827'
          }}>
            {success ? 'Email Verified!' : 'Verify Your Account'}
          </h2>
          <p style={{ 
            marginTop: '8px', 
            color: '#6b7280',
            fontSize: '16px'
          }}>
            {success ? (
              <>
                Your email has been successfully verified
                <br />
                <span style={{ color: '#3b82f6', fontSize: '14px' }}>
                  Redirecting to login page...
                </span>
              </>
            ) : !token ? (
              <>
                We've sent a verification link to
                <br />
                <span style={{ color: '#3b82f6', fontWeight: '600' }}>{email || 'your email'}</span>
              </>
            ) : (
              'Verifying your email address...'
            )}
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
          {/* Error Message */}
          {error && (
            <div style={{
              marginBottom: '24px',
              background: '#fef2f2',
              borderLeft: '4px solid #ef4444',
              padding: '16px',
              borderRadius: '0 8px 8px 0'
            }}>
              <p style={{ color: '#991b1b', fontWeight: '500' }}>{error}</p>
            </div>
          )}

          {/* Loading State */}
          {token && !success && !error && (
            <div style={{ textAlign: 'center', padding: '24px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                border: '3px solid #e5e7eb',
                borderTop: '3px solid #3b82f6',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto'
              }}></div>
            </div>
          )}

          {/* Success State - Removed button since we auto-redirect */}

          {/* Resend Section */}
          {!token && !success && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ textAlign: 'center' }}>
                {timeLeft > 0 ? (
                  <p style={{ color: '#6b7280' }}>
                    Next resend available in <span style={{ fontWeight: '600', color: '#3b82f6' }}>{formatTime(timeLeft)}</span>
                  </p>
                ) : (
                  <p style={{ color: '#6b7280' }}>Haven't received the verification email?</p>
                )}
              </div>

              <button
                onClick={handleResend}
                disabled={!canResend || isLoading}
                style={{
                  width: '100%',
                  padding: '16px',
                  background: canResend && !isLoading ? 'linear-gradient(135deg, #3b82f6, #8b5cf6)' : '#9ca3af',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontWeight: 'bold',
                  fontSize: '18px',
                  cursor: canResend && !isLoading ? 'pointer' : 'not-allowed',
                  transition: 'all 0.3s ease'
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
                    Sending...
                  </div>
                ) : (
                  'Resend Verification Email'
                )}
              </button>

              {/* Help Box */}
              <div style={{
                background: '#f0f7ff',
                padding: '16px',
                borderRadius: '12px',
                border: '1px solid #bfdbfe'
              }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  marginBottom: '8px',
                  color: '#1e40af',
                  fontWeight: '600'
                }}>
                  <Mail size={20} style={{ marginRight: '8px' }} />
                  Check Your Email
                </div>
                <p style={{ color: '#3b82f6', fontSize: '14px' }}>
                  Please check your inbox and spam folder. The verification email should arrive within a few minutes.
                </p>
              </div>
            </div>
          )}
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

export default VerifyAccount
