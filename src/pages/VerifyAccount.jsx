import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle, Mail, RefreshCw } from 'lucide-react'

const VerifyAccount = () => {
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', ''])
  const [isLoading, setIsLoading] = useState(false)
  const [timeLeft, setTimeLeft] = useState(120) // 2 minutes
  const [canResend, setCanResend] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setCanResend(true)
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const handleCodeChange = (index, value) => {
    if (value.length <= 1) {
      const newCode = [...verificationCode]
      newCode[index] = value
      setVerificationCode(newCode)

      // Auto-focus next input
      if (value && index < 5) {
        const nextInput = document.getElementById(`code-${index + 1}`)
        if (nextInput) nextInput.focus()
      }
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`)
      if (prevInput) prevInput.focus()
    }
  }

  const handleVerify = async () => {
    const code = verificationCode.join('')
    if (code.length === 6) {
      setIsLoading(true)
      try {
        await new Promise(resolve => setTimeout(resolve, 2000))
        console.log('Verification code:', code)
        navigate('/dashboard')
      } catch (error) {
        console.error('Verification failed')
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleResend = async () => {
    setCanResend(false)
    setTimeLeft(120)
    // Simulate resend
    await new Promise(resolve => setTimeout(resolve, 1000))
    setCanResend(false)
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const isCodeComplete = verificationCode.every(digit => digit !== '')

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg mb-6">
            <Mail size={32} className="text-white" />
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Verify Your Account
          </h2>
          
          <p className="text-gray-600 leading-relaxed">
            We've sent a 6-digit verification code to
            <br />
            <span className="font-semibold text-blue-600">john.doe@example.com</span>
          </p>
        </div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="card shadow-2xl border-0 p-8">
          {/* Verification Code Input */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-700 mb-4 text-center">
              Enter Verification Code
            </label>
            
            <div className="flex justify-center space-x-3 mb-6">
              {verificationCode.map((digit, index) => (
                <input
                  key={index}
                  id={`code-${index}`}
                  type="text"
                  inputMode="numeric"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleCodeChange(index, e.target.value.replace(/[^0-9]/g, ''))}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-14 text-center text-xl font-bold border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                />
              ))}
            </div>

            {/* Timer */}
            <div className="text-center mb-6">
              {timeLeft > 0 ? (
                <p className="text-sm text-gray-600">
                  Code expires in <span className="font-semibold text-blue-600">{formatTime(timeLeft)}</span>
                </p>
              ) : (
                <p className="text-sm text-red-600 font-medium">
                  Code expired. Please request a new one.
                </p>
              )}
            </div>

            {/* Verify Button */}
            <button
              onClick={handleVerify}
              disabled={!isCodeComplete || isLoading}
              className={`btn-enhanced w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 ${
                isCodeComplete && !isLoading
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 hover:shadow-xl'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  Verifying...
                </div>
              ) : (
                'Verify Account'
              )}
            </button>

            {/* Resend Code */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 mb-3">
                Didn't receive the code?
              </p>
              
              <button
                onClick={handleResend}
                disabled={!canResend}
                className={`inline-flex items-center text-sm font-medium transition-colors ${
                  canResend 
                    ? 'text-blue-600 hover:text-blue-500 cursor-pointer' 
                    : 'text-gray-400 cursor-not-allowed'
                }`}
              >
                <RefreshCw size={16} className="mr-2" />
                {canResend ? 'Resend Code' : `Resend in ${formatTime(timeLeft)}`}
              </button>
            </div>
          </div>

          {/* Help Text */}
          <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-2">📧 Check Your Email</h3>
            <p className="text-sm text-blue-800">
              Make sure to check your spam folder if you don't see the verification email in your inbox.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VerifyAccount
