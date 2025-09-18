# 🔐 FRONTEND AUTHENTICATION USAGE GUIDE

## 📋 TỔNG QUAN
Frontend đã được cập nhật để hỗ trợ authentication với JWT token cho endpoint `/chat/interview-sessions`.

## 🚀 CÁCH SỬ DỤNG

### **1. Import Authentication Utilities**
```javascript
import { authUtils, mainAPI } from '../utils/api'
```

### **2. Login Flow**
```javascript
// Login user
async function handleLogin(email, password) {
  try {
    const loginData = await mainAPI.login(email, password)
    console.log('Login successful:', loginData)
    
    // Token được tự động lưu vào localStorage
    // access_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    // user_info: {"id": "user_id", "email": "user@example.com", "full_name": "User Name"}
    
    return loginData
  } catch (error) {
    console.error('Login failed:', error)
    throw error
  }
}
```

### **3. Tạo Session mới**
```javascript
// Tạo session mới cho user
async function createNewSession() {
  try {
    const sessionData = await mainAPI.createSession()
    console.log('Session created:', sessionData)
    
    // Lưu session_id để sử dụng
    localStorage.setItem('current_session_id', sessionData.session_id)
    
    return sessionData
  } catch (error) {
    console.error('Create session failed:', error)
    throw error
  }
}
```

### **4. Lấy Interview Sessions (Với Authentication)**
```javascript
// Lấy danh sách interview sessions
async function getInterviewSessions() {
  try {
    const response = await mainAPI.getInterviewSessions()
    
    if (response.ok) {
      const data = await response.json()
      console.log('Interview sessions:', data)
      return data
    } else if (response.status === 401) {
      // Token expired hoặc invalid
      authUtils.logout()
      window.location.href = '/login'
      throw new Error('Authentication required')
    } else {
      throw new Error('Failed to get interview sessions')
    }
  } catch (error) {
    console.error('Get interview sessions failed:', error)
    throw error
  }
}
```

### **5. Lấy User Sessions**
```javascript
// Lấy tất cả sessions của user hiện tại
async function getUserSessions() {
  try {
    const response = await mainAPI.getUserSessions()
    
    if (response.ok) {
      const data = await response.json()
      console.log('User sessions:', data)
      return data
    } else {
      throw new Error('Failed to get user sessions')
    }
  } catch (error) {
    console.error('Get user sessions failed:', error)
    throw error
  }
}
```

## 🔧 COMPONENT EXAMPLES

### **React Component với Authentication**
```jsx
import React, { useState, useEffect } from 'react'
import { mainAPI, authUtils } from '../utils/api'

function InterviewSessionsPage() {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadInterviewSessions()
  }, [])

  const loadInterviewSessions = async () => {
    try {
      setLoading(true)
      
      // Check authentication
      if (!authUtils.isAuthenticated()) {
        window.location.href = '/login'
        return
      }

      // Get interview sessions
      const response = await mainAPI.getInterviewSessions()
      
      if (response.ok) {
        const data = await response.json()
        setSessions(data.sessions || [])
      } else if (response.status === 401) {
        // Token expired
        authUtils.logout()
        window.location.href = '/login'
      } else {
        setError('Failed to load interview sessions')
      }
    } catch (error) {
      console.error('Error loading sessions:', error)
      setError('Error loading interview sessions')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    authUtils.logout()
    window.location.href = '/login'
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div>
      <h1>Interview Sessions</h1>
      <button onClick={handleLogout}>Logout</button>
      
      <div>
        {sessions.map(session => (
          <div key={session.session_id}>
            <h3>Session: {session.session_id}</h3>
            <p>Title: {session.title}</p>
            <p>Date: {session.date}</p>
            <p>Duration: {session.duration}</p>
            <p>Status: {session.status}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default InterviewSessionsPage
```

### **Login Component**
```jsx
import React, { useState } from 'react'
import { mainAPI } from '../utils/api'

function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    
    try {
      setLoading(true)
      setError('')
      
      const loginData = await mainAPI.login(email, password)
      
      // Tạo session mới sau khi login
      const sessionData = await mainAPI.createSession()
      localStorage.setItem('current_session_id', sessionData.session_id)
      
      // Redirect to interview page
      window.location.href = '/interview'
      
    } catch (error) {
      setError('Login failed. Please check your credentials.')
      console.error('Login error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={handleLogin}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        
        {error && <div style={{color: 'red'}}>{error}</div>}
        
        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  )
}

export default LoginPage
```

## 🔧 UTILITY FUNCTIONS

### **Authentication Helpers**
```javascript
import { authUtils } from '../utils/api'

// Check if user is authenticated
const isLoggedIn = authUtils.isAuthenticated()

// Get current user info
const user = authUtils.getCurrentUser()
console.log('Current user:', user)

// Get JWT token
const token = authUtils.getToken()

// Logout user
authUtils.logout()
```

### **Error Handling**
```javascript
// Handle 401 Unauthorized responses
const handleAPIResponse = async (response) => {
  if (response.status === 401) {
    // Token expired or invalid
    authUtils.logout()
    window.location.href = '/login'
    return null
  }
  
  if (response.ok) {
    return await response.json()
  } else {
    throw new Error(`API Error: ${response.status}`)
  }
}
```

## ⚠️ LƯU Ý QUAN TRỌNG

### **1. Token Management**
- Token được lưu trong `localStorage`
- Token hết hạn sau 24 giờ
- Cần check authentication trước khi gọi API

### **2. Error Handling**
- Luôn check `response.status === 401`
- Redirect về login khi token expired
- Clear localStorage khi logout

### **3. Session Management**
- Mỗi user có thể có nhiều sessions
- Session ID được lưu trong localStorage
- Có thể switch giữa các sessions

### **4. Security**
- Không expose token trong URL
- Sử dụng HTTPS trong production
- Validate token trên client side

## 🧪 TESTING

### **Test Authentication Flow**
```javascript
// Test complete authentication flow
async function testAuthFlow() {
  try {
    // 1. Login
    const loginData = await mainAPI.login('test@example.com', 'password')
    console.log('✅ Login successful')
    
    // 2. Create session
    const sessionData = await mainAPI.createSession()
    console.log('✅ Session created')
    
    // 3. Get interview sessions
    const sessions = await mainAPI.getInterviewSessions()
    console.log('✅ Interview sessions loaded')
    
    // 4. Get user sessions
    const userSessions = await mainAPI.getUserSessions()
    console.log('✅ User sessions loaded')
    
    console.log('🎉 All authentication tests passed!')
    
  } catch (error) {
    console.error('❌ Authentication test failed:', error)
  }
}
```

---
**Frontend Authentication**: ✅ Hoàn thành tích hợp authentication cho frontend
