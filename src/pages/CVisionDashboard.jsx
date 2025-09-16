import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  User, 
  FileText, 
  MessageSquare, 
  TrendingUp,
  Clock,
  Award,
  BarChart3,
  Wand2,
  Plus,
  Eye,
  Download,
  Upload,
  Edit,
  File
} from 'lucide-react'
import API_CONFIG from '../config/api'

const CVisionDashboard = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState({ full_name: '', id: '' });
  const [dashboardData, setDashboardData] = useState(null)
  const [error, setError] = useState(null)
  const [uploadStatus, setUploadStatus] = useState({ resume: false, jd: false })

  useEffect(() => {
    // Lấy thông tin người dùng từ localStorage
    const storedUser = localStorage.getItem("user");
    try {
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        // Check if user has resume and JD
        setUploadStatus({
          resume: !!userData.resume_id,
          jd: !!userData.jd_id
        });
      }
    } catch (error) {
      console.error("Failed to parse user data from localStorage:", error);
      localStorage.removeItem("user"); // Clear invalid data
    }
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = localStorage.getItem("access_token")

      try {
        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.USERDB.DASHBOARD}`, {
          method: "GET",
          headers: {
            
            Authorization: `Bearer ${token}`, // Send JWT in header
          },
        })

        if (!response.ok) {
          throw new Error("Failed to fetch dashboard data")
        }

        const data = await response.json()
        setDashboardData(data)
      } catch (err) {
        setError(err.message)
      }
    }

    fetchDashboardData()
  }, [])

  if (error) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)',
        color: '#ef4444',
        fontSize: '18px',
        fontWeight: 'bold'
      }}>
        Error: {error}
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)',
        color: '#6b7280',
        fontSize: '18px'
      }}>
        Loading...
      </div>
    )
  }

  const stats = [
    {
      title: 'Resumes Enhanced',
      value: '3',
      icon: FileText,
      color: 'linear-gradient(135deg, #3b82f6, #1e40af)',
      change: '+1 this week'
    },
    {
      title: 'Mock Interviews',
      value: '7',
      icon: MessageSquare,
      color: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
      change: '+2 this week'
    },
    {
      title: 'Avg. Score',
      value: '85%',
      icon: TrendingUp,
      color: 'linear-gradient(135deg, #10b981, #059669)',
      change: '+12% improvement'
    },
    {
      title: 'Interview Success',
      value: '92%',
      icon: Award,
      color: 'linear-gradient(135deg, #f59e0b, #dc2626)',
      change: 'Above average'
    }
  ]

  const recentActivity = [
    {
      type: 'resume',
      title: 'Enhanced Software Engineer Resume',
      time: '2 hours ago',
      score: 92,
      icon: Wand2,
      color: '#3b82f6'
    },
    {
      type: 'interview',
      title: 'Mock Interview - Product Manager',
      time: '1 day ago', 
      score: 88,
      icon: MessageSquare,
      color: '#8b5cf6'
    },
    {
      type: 'analysis',
      title: 'Resume Analysis - Data Scientist',
      time: '2 days ago',
      score: 76,
      icon: BarChart3,
      color: '#10b981'
    }
  ]

  const quickActions = [
    {
      title: 'Start Mock Interview',
      description: 'Practice with AI interviewer',
      icon: MessageSquare,
      action: () => navigate('/mock-interview'),
      color: 'linear-gradient(135deg, #8b5cf6, #7c3aed)'
    },
    {
      title: 'Enhance Resume', 
      description: 'Improve your resume with AI',
      icon: Wand2,
      action: () => navigate('/improve-resume/step1'),
      color: 'linear-gradient(135deg, #3b82f6, #1e40af)'
    },
    {
      title: 'Analyze Resume',
      description: 'Get detailed feedback',
      icon: BarChart3,
      action: () => navigate('/resume-analysis/step1'),
      color: 'linear-gradient(135deg, #10b981, #059669)'
    }
  ]

  const handleFileUpload = async (fileType, file) => {
    const token = localStorage.getItem("access_token");
    const formData = new FormData();
    formData.append('file', file);
    formData.append('user_id', user.id);

    try {
      const endpoint = fileType === 'resume' ? `${API_CONFIG.USERDB.UPLOADRESUME}` : `${API_CONFIG.USERDB.UPLOADJD}`;
      const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Failed to upload ${fileType}`);
      }

      // Update upload status
      setUploadStatus(prev => ({
        ...prev,
        [fileType]: true
      }));

      alert(`${fileType.toUpperCase()} uploaded successfully!`);
    } catch (err) {
      alert(`Error uploading ${fileType}: ${err.message}`);
    }
  };

 const handleFileDownload = async (fileType) => {
    const token = localStorage.getItem("access_token");
    console.log(`Downloading from endpoint: for user ID: ${user.id}`);

    try {
        const endpoint = fileType === 'resume' ? `${API_CONFIG.USERDB.DOWNLOADRESUME}` : `${API_CONFIG.USERDB.DOWNLOADJD}`;
        const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}/${user.id}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to download ${fileType}`);
        }

        // Lấy tên file từ header Content-Disposition
        const contentDisposition = response.headers.get('Content-Disposition');
        const filename = contentDisposition
            ? contentDisposition.split('filename=')[1].replace(/"/g, '') // Lấy tên file từ header
            : `${fileType}`; // Fallback nếu không có header

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename; // Sử dụng tên file từ header
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    } catch (err) {
        alert(`Error downloading ${fileType}: ${err.message}`);
    }
};

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)' }}>
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
            
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '16px'
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
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <User size={20} style={{ color: 'white' }} />
                </div>
                <div>
                  <p style={{ fontWeight: '600', color: '#111827', margin: 0 }}>{user.full_name}</p>
                  <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Premium Member</p>
                </div>
              </div>
              
              <button 
                onClick={() => {
                  localStorage.clear();
                  navigate('/signin');
                }}
                style={{
                  color: '#6b7280',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: '500',
                  padding: '8px 16px'
                }}
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 20px' }}>
        {/* Welcome Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ 
            fontSize: '48px', 
            fontWeight: 'bold', 
            color: '#111827', 
            marginBottom: '16px',
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            backgroundClip: 'text',
            color: 'transparent'
          }}>
            {dashboardData.message} 👋
          </h1>
          <p style={{ 
            color: '#6b7280', 
            fontSize: '20px',
            lineHeight: '1.6',
            margin: '0 0 32px 0'
          }}>
            Ready to boost your career today? Let's see your progress and continue improving.
          </p>

          {/* File Upload Sections */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px',
            marginBottom: '24px'
          }}>
            {/* Resume Upload Section */}
            <div style={{
              background: 'white',
              padding: '24px',
              borderRadius: '16px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
              border: '2px dashed #e5e7eb'
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
                  background: 'linear-gradient(135deg, #3b82f6, #1e40af)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <FileText size={20} style={{ color: 'white' }} />
                </div>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: 'bold',
                  color: '#111827',
                  margin: 0
                }}>
                  Your Resume
                </h3>
              </div>

              {!uploadStatus.resume ? (
                <div>
                  <p style={{
                    color: '#6b7280',
                    fontSize: '14px',
                    marginBottom: '16px',
                    margin: '0 0 16px 0'
                  }}>
                    Upload your resume to get AI-powered improvements and analysis
                  </p>
                  <input
                    type="file"
                    accept=".pdf,.docx"
                    onChange={(e) => {
                      if (e.target.files[0]) {
                        handleFileUpload('resume', e.target.files[0]);
                      }
                    }}
                    style={{ display: 'none' }}
                    id="resume-upload"
                  />
                  <label
                    htmlFor="resume-upload"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '12px 20px',
                      background: 'linear-gradient(135deg, #3b82f6, #1e40af)',
                      color: 'white',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '500',
                      justifyContent: 'center',
                      border: 'none'
                    }}
                  >
                    <Upload size={16} />
                    Upload Resume
                  </label>
                </div>
              ) : (
                <div>
                  <p style={{
                    color: '#10b981',
                    fontSize: '14px',
                    marginBottom: '16px',
                    margin: '0 0 16px 0'
                  }}>
                    ✓ Resume uploaded successfully
                  </p>
                  <div style={{
                    display: 'flex',
                    gap: '8px'
                  }}>
                    <input
                      type="file"
                      accept=".pdf,.docx"
                      onChange={(e) => {
                        if (e.target.files[0]) {
                          handleFileUpload('resume', e.target.files[0]);
                        }
                      }}
                      style={{ display: 'none' }}
                      id="resume-edit"
                    />
                    <label
                      htmlFor="resume-edit"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 16px',
                        background: '#f3f4f6',
                        color: '#374151',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        border: 'none'
                      }}
                    >
                      <Edit size={14} />
                      Edit
                    </label>
                    <button
                      onClick={() => handleFileDownload('resume')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 16px',
                        background: '#f3f4f6',
                        color: '#374151',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        border: 'none'
                      }}
                    >
                      <Download size={14} />
                      Download
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Job Description Upload Section */}
            <div style={{
              background: 'white',
              padding: '24px',
              borderRadius: '16px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
              border: '2px dashed #e5e7eb'
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
                  background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <File size={20} style={{ color: 'white' }} />
                </div>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: 'bold',
                  color: '#111827',
                  margin: 0
                }}>
                  Job Description
                </h3>
              </div>

              {!uploadStatus.jd ? (
                <div>
                  <p style={{
                    color: '#6b7280',
                    fontSize: '14px',
                    marginBottom: '16px',
                    margin: '0 0 16px 0'
                  }}>
                    Upload a job description to get targeted resume improvements
                  </p>
                  <input
                    type="file"
                    accept=".pdf,.docx"
                    onChange={(e) => {
                      if (e.target.files[0]) {
                        handleFileUpload('jd', e.target.files[0]);
                      }
                    }}
                    style={{ display: 'none' }}
                    id="jd-upload"
                  />
                  <label
                    htmlFor="jd-upload"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '12px 20px',
                      background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                      color: 'white',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '500',
                      justifyContent: 'center',
                      border: 'none'
                    }}
                  >
                    <Upload size={16} />
                    Upload JD
                  </label>
                </div>
              ) : (
                <div>
                  <p style={{
                    color: '#10b981',
                    fontSize: '14px',
                    marginBottom: '16px',
                    margin: '0 0 16px 0'
                  }}>
                    ✓ Job description uploaded successfully
                  </p>
                  <div style={{
                    display: 'flex',
                    gap: '8px'
                  }}>
                    <input
                      type="file"
                      accept=".pdf,.docx"
                      onChange={(e) => {
                        if (e.target.files[0]) {
                          handleFileUpload('jd', e.target.files[0]);
                        }
                      }}
                      style={{ display: 'none' }}
                      id="jd-edit"
                    />
                    <label
                      htmlFor="jd-edit"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 16px',
                        background: '#f3f4f6',
                        color: '#374151',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        border: 'none'
                      }}
                    >
                      <Edit size={14} />
                      Edit
                    </label>
                    <button
                      onClick={() => handleFileDownload('jd')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 16px',
                        background: '#f3f4f6',
                        color: '#374151',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        border: 'none'
                      }}
                    >
                      <Download size={14} />
                      Download
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '24px',
          marginBottom: '48px'
        }}>
          {stats.map((stat, index) => (
            <div key={index} style={{
              background: 'white',
              padding: '32px',
              borderRadius: '16px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
              border: 'none'
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                marginBottom: '16px'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: stat.color,
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <stat.icon size={24} style={{ color: 'white' }} />
                </div>
              </div>
              <h3 style={{ 
                fontSize: '32px', 
                fontWeight: 'bold', 
                color: '#111827', 
                marginBottom: '8px',
                margin: '0 0 8px 0'
              }}>
                {stat.value}
              </h3>
              <p style={{ 
                color: '#6b7280', 
                fontWeight: '500',
                marginBottom: '8px',
                margin: '0 0 8px 0'
              }}>
                {stat.title}
              </p>
              <p style={{ 
                fontSize: '14px', 
                color: '#10b981', 
                fontWeight: '500',
                margin: 0
              }}>
                {stat.change}
              </p>
            </div>
          ))}
        </div>

        <div style={{ 
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: '32px'
        }}>
          {/* Main Content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Quick Actions */}
            <div style={{
              background: 'white',
              padding: '32px',
              borderRadius: '16px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
            }}>
              <h2 style={{ 
                fontSize: '24px', 
                fontWeight: 'bold', 
                color: '#111827', 
                marginBottom: '24px',
                margin: '0 0 24px 0'
              }}>
                🚀 Quick Actions
              </h2>
              
              <div style={{ 
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px'
              }}>
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={action.action}
                    style={{
                      padding: '24px',
                      background: 'white',
                      border: '2px solid #e5e7eb',
                      borderRadius: '12px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.borderColor = '#3b82f6'
                      e.target.style.transform = 'translateY(-2px)'
                      e.target.style.boxShadow = '0 10px 25px rgba(59, 130, 246, 0.15)'
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.borderColor = '#e5e7eb'
                      e.target.style.transform = 'translateY(0)'
                      e.target.style.boxShadow = 'none'
                    }}
                  >
                    <div style={{
                      width: '48px',
                      height: '48px',
                      background: action.color,
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '16px'
                    }}>
                      <action.icon size={24} style={{ color: 'white' }} />
                    </div>
                    <h3 style={{ 
                      fontWeight: 'bold', 
                      color: '#111827', 
                      marginBottom: '8px',
                      margin: '0 0 8px 0',
                      fontSize: '16px'
                    }}>
                      {action.title}
                    </h3>
                    <p style={{ 
                      color: '#6b7280', 
                      fontSize: '14px',
                      margin: 0,
                      lineHeight: '1.4'
                    }}>
                      {action.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div style={{
              background: 'white',
              padding: '32px',
              borderRadius: '16px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                marginBottom: '24px'
              }}>
                <h2 style={{ 
                  fontSize: '24px', 
                  fontWeight: 'bold', 
                  color: '#111827',
                  margin: 0
                }}>
                  📈 Recent Activity
                </h2>
                <button style={{
                  color: '#3b82f6',
                  background: 'none',
                  border: 'none',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}>
                  View All
                </button>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {recentActivity.map((activity, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '20px',
                    background: '#f8fafc',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#f1f5f9'
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = '#f8fafc'
                  }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: `${activity.color}20`,
                      border: `2px solid ${activity.color}30`
                    }}>
                      <activity.icon size={20} style={{ color: activity.color }} />
                    </div>
                    
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{ 
                        fontWeight: '600', 
                        color: '#111827',
                        margin: '0 0 4px 0',
                        fontSize: '16px'
                      }}>
                        {activity.title}
                      </h3>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px'
                      }}>
                        <Clock size={14} style={{ color: '#9ca3af' }} />
                        <span style={{ fontSize: '14px', color: '#6b7280' }}>{activity.time}</span>
                      </div>
                    </div>
                    
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ 
                        fontSize: '20px', 
                        fontWeight: 'bold', 
                        color: '#111827'
                      }}>
                        {activity.score}%
                      </div>
                      <div style={{ 
                        fontSize: '12px', 
                        color: '#6b7280'
                      }}>
                        Score
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Progress Card */}
            <div style={{
              background: 'white',
              padding: '24px',
              borderRadius: '16px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ 
                fontSize: '20px', 
                fontWeight: 'bold', 
                color: '#111827', 
                marginBottom: '20px',
                margin: '0 0 20px 0'
              }}>
                🎯 Your Progress
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    fontSize: '14px', 
                    marginBottom: '8px'
                  }}>
                    <span style={{ color: '#6b7280' }}>Profile Completion</span>
                    <span style={{ fontWeight: '600', color: '#111827' }}>85%</span>
                  </div>
                  <div style={{
                    width: '100%',
                    background: '#e5e7eb',
                    borderRadius: '8px',
                    height: '8px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                      height: '100%',
                      width: '85%',
                      borderRadius: '8px'
                    }}></div>
                  </div>
                </div>
                
                <div>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    fontSize: '14px', 
                    marginBottom: '8px'
                  }}>
                    <span style={{ color: '#6b7280' }}>Interview Skills</span>
                    <span style={{ fontWeight: '600', color: '#111827' }}>92%</span>
                  </div>
                  <div style={{
                    width: '100%',
                    background: '#e5e7eb',
                    borderRadius: '8px',
                    height: '8px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      height: '100%',
                      width: '92%',
                      borderRadius: '8px'
                    }}></div>
                  </div>
                </div>
                
                <div>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    fontSize: '14px', 
                    marginBottom: '8px'
                  }}>
                    <span style={{ color: '#6b7280' }}>Resume Quality</span>
                    <span style={{ fontWeight: '600', color: '#111827' }}>88%</span>
                  </div>
                  <div style={{
                    width: '100%',
                    background: '#e5e7eb',
                    borderRadius: '8px',
                    height: '8px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                      height: '100%',
                      width: '88%',
                      borderRadius: '8px'
                    }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Achievements */}
            <div style={{
              background: 'white',
              padding: '24px',
              borderRadius: '16px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ 
                fontSize: '20px', 
                fontWeight: 'bold', 
                color: '#111827', 
                marginBottom: '20px',
                margin: '0 0 20px 0'
              }}>
                🏆 Recent Achievements
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  background: '#fef3c7',
                  borderRadius: '8px',
                  border: '1px solid #fbbf24'
                }}>
                  <Award size={16} style={{ color: '#d97706' }} />
                  <div>
                    <h4 style={{ 
                      fontWeight: '600', 
                      color: '#92400e', 
                      fontSize: '14px',
                      margin: '0 0 2px 0'
                    }}>
                      Interview Master
                    </h4>
                    <p style={{ 
                      color: '#a16207', 
                      fontSize: '12px',
                      margin: 0,
                      lineHeight: '1.3'
                    }}>
                      Scored 90+ in 3 mock interviews
                    </p>
                  </div>
                </div>
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  background: '#dbeafe',
                  borderRadius: '8px',
                  border: '1px solid #3b82f6'
                }}>
                  <FileText size={16} style={{ color: '#1d4ed8' }} />
                  <div>
                    <h4 style={{ 
                      fontWeight: '600', 
                      color: '#1e3a8a', 
                      fontSize: '14px',
                      margin: '0 0 2px 0'
                    }}>
                      Resume Pro
                    </h4>
                    <p style={{ 
                      color: '#1e40af', 
                      fontSize: '12px',
                      margin: 0,
                      lineHeight: '1.3'
                    }}>
                      Enhanced 5 resumes this month
                    </p>
                  </div>
                </div>
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  background: '#d1fae5',
                  borderRadius: '8px',
                  border: '1px solid #10b981'
                }}>
                  <TrendingUp size={16} style={{ color: '#047857' }} />
                  <div>
                    <h4 style={{ 
                      fontWeight: '600', 
                      color: '#065f46', 
                      fontSize: '14px',
                      margin: '0 0 2px 0'
                    }}>
                      Improvement Streak
                    </h4>
                    <p style={{ 
                      color: '#047857', 
                      fontSize: '12px',
                      margin: 0,
                      lineHeight: '1.3'
                    }}>
                      7 days of consistent practice
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div style={{
              background: 'white',
              padding: '24px',
              borderRadius: '16px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ 
                fontSize: '20px', 
                fontWeight: 'bold', 
                color: '#111827', 
                marginBottom: '20px',
                margin: '0 0 20px 0'
              }}>
                💡 Recommendations
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{
                  padding: '16px',
                  background: '#dbeafe',
                  borderRadius: '12px',
                  border: '1px solid #3b82f6'
                }}>
                  <h4 style={{ 
                    fontWeight: '600', 
                    color: '#1e3a8a', 
                    marginBottom: '8px',
                    margin: '0 0 8px 0',
                    fontSize: '16px'
                  }}>
                    Practice Technical Questions
                  </h4>
                  <p style={{ 
                    color: '#1e40af', 
                    fontSize: '14px', 
                    marginBottom: '12px',
                    margin: '0 0 12px 0',
                    lineHeight: '1.4'
                  }}>
                    Your last mock interview showed room for improvement in technical areas.
                  </p>
                  <button 
                    onClick={() => navigate('/mock-interview')}
                    style={{
                      color: '#3b82f6',
                      background: 'none',
                      border: 'none',
                      fontWeight: '500',
                      fontSize: '14px',
                      cursor: 'pointer'
                    }}
                  >
                    Start Practice →
                  </button>
                </div>
                
                <div style={{
                  padding: '16px',
                  background: '#ede9fe',
                  borderRadius: '12px',
                  border: '1px solid #8b5cf6'
                }}>
                  <h4 style={{ 
                    fontWeight: '600', 
                    color: '#581c87', 
                    marginBottom: '8px',
                    margin: '0 0 8px 0',
                    fontSize: '16px'
                  }}>
                    Update Your Resume
                  </h4>
                  <p style={{ 
                    color: '#7c3aed', 
                    fontSize: '14px', 
                    marginBottom: '12px',
                    margin: '0 0 12px 0',
                    lineHeight: '1.4'
                  }}>
                    Add your recent AWS certification to boost your profile.
                  </p>
                  <button 
                    onClick={() => navigate('/improve-resume/step1')}
                    style={{
                      color: '#8b5cf6',
                      background: 'none',
                      border: 'none',
                      fontWeight: '500',
                      fontSize: '14px',
                      cursor: 'pointer'
                    }}
                  >
                    Update Now →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CVisionDashboard
