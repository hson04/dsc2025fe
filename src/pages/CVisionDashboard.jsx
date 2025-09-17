import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import API_CONFIG from '../config/api'
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
  File,
  ChevronDown,
  FileDown // Add download icon
} from 'lucide-react'
const CVisionDashboard = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState(null);
  const [dashboardData, setDashboardData] = useState(null)
  const [error, setError] = useState(null)
  const [uploadStatus, setUploadStatus] = useState({ resume: false, jd: false })
  const [dropdownVisible, setDropdownVisible] = useState(false); // For user menu dropdown
  const [resumeContent, setResumeContent] = useState(null);
  const [viewResume, setViewResume] = useState(false); // Track if "View Resume" is clicked
  const [jobDescription, setJobDescription] = useState(''); // State for job description text input
  const [editJD, setEditJD] = useState(false); // State to control JD edit/submit
  const [isLoading, setIsLoading] = useState({ resume: false, jd: false }); // Track loading states
  const [userHistory, setUserHistory] = useState({ analysis_results: [], improvement_results: [] });
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  const [showAllActivity, setShowAllActivity] = useState(false);

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
      } else {
        navigate("/signin"); // Redirect if no user
      }
    } catch (error) {
      console.error("Failed to parse user data from localStorage:", error);
      localStorage.removeItem("user"); // Clear invalid data
    }
  }, [navigate]);

  useEffect(() => {
    const fetchUserFiles = async () => {
      const token = localStorage.getItem("access_token");
      try {
        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.USERDB.USERFILES}${user.id}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch user files");
        }

        const data = await response.json();
        setUploadStatus({
          resume: !!data.resume_id,
          jd: !!data.jd_text, // Change to jd_text
        });
      } catch (err) {
        console.error("Error fetching user files:", err);
      }
    };

    if (user) {
      fetchUserFiles();
    }
  }, [user]);

  // Fetch user history
  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) return;
      
      const token = localStorage.getItem("access_token");
      try {
        setIsHistoryLoading(true);
        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.USERDB.GETHISTORY}${user.id}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch history");
        }

        const data = await response.json();
        setUserHistory(data);
      } catch (err) {
        console.error("Error fetching history:", err);
      } finally {
        setIsHistoryLoading(false);
      }
    };

    fetchHistory();
  }, [user]);

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

  const fetchResume = async () => {
    if (viewResume) {
      // If already viewing, toggle back to initial state
      setViewResume(false);
      return;
    }

    const token = localStorage.getItem("access_token");
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.USERDB.VIEWRESUME}${user.id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch resume");
      }

      const data = await response.json();
      
      // Nếu là file DOCX, tự động tải về
      if (!data.is_pdf) {
        handleFileDownload('resume');
        return;
      }

      // Nếu là PDF, hiển thị như bình thường
      setResumeContent(data);
      setViewResume(true);
    } catch (err) {
      alert(`Error fetching resume: ${err.message}`);
    }
  };

  const downloadHistoryFile = async (fileId, activity) => {
    const token = localStorage.getItem("access_token");
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.USERDB.DOWNLOADHISTORYFILE}${fileId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });

      if (!response.ok) {
        throw new Error('Failed to download file');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      // Tạo tên file dựa trên loại file và tên người dùng
      const fileType = activity.type === 'analysis' ? 'report' : 'resume';
      const fileName = `${fileType}_${user.full_name.replace(/\s+/g, '_')}.pdf`;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error downloading file:', err);
      alert('Failed to download file');
    }
  };

  const handleJDSubmit = async () => {
    const token = localStorage.getItem("access_token");
    const formData = new FormData();
    formData.append('user_id', user.id);
    formData.append('jd_text', jobDescription);

    try {
      setIsLoading(prev => ({ ...prev, jd: true }));
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.USERDB.SUBMITJD}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Failed to submit JD`);
      }

      // Update upload status
      setUploadStatus(prev => ({
        ...prev,
        jd: true
      }));
      setEditJD(false); // Disable editing after submission
    } catch (err) {
      console.error('Error submitting JD:', err);
    } finally {
      setIsLoading(prev => ({ ...prev, jd: false }));
    }
  };

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

  // Tính toán số lượng resume đã cải thiện
  const totalEnhanced = userHistory.improvement_results.length;

  // Tính điểm trung bình từ cả analysis và improvement
  const allScores = [
    ...userHistory.analysis_results.map(item => parseInt(item.score)),
    ...userHistory.improvement_results.map(item => parseInt(item.score))
  ];
  const averageScore = allScores.length > 0 
    ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length)
    : 0;

  // Tính số lượng hoạt động trong tuần này
  // Tạo thời điểm 1 tuần trước (đã điều chỉnh timezone)
  const oneWeekAgo = new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000);
  oneWeekAgo.setHours(oneWeekAgo.getHours() + 7); // Điều chỉnh timezone
  
  const enhancedThisWeek = userHistory.improvement_results.filter(
    item => new Date(item.created_at) > oneWeekAgo
  ).length;

  const stats = [
    {
      title: 'Resumes Enhanced',
      value: totalEnhanced.toString(),
      icon: FileText,
      color: 'linear-gradient(135deg, #3b82f6, #1e40af)',
      change: `+${enhancedThisWeek} this week`
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
      value: `${averageScore}%`,
      icon: TrendingUp,
      color: 'linear-gradient(135deg, #10b981, #059669)',
      change: 'Overall performance'
    },
    {
      title: 'Interview Success',
      value: '92%',
      icon: Award,
      color: 'linear-gradient(135deg, #f59e0b, #dc2626)',
      change: 'Above average'
    }
  ]

  // Combine and sort history items
  const recentActivity = [...userHistory.analysis_results, ...userHistory.improvement_results]
    .map(item => {
      const isAnalysis = 'report_id' in item;
      return {
        type: isAnalysis ? 'analysis' : 'improvement',
        title: isAnalysis ? 'Resume Analysis' : 'Resume Enhancement',
        time: new Date(new Date(item.created_at).getTime() + 7 * 60 * 60 * 1000).toLocaleString(),
        score: parseInt(item.score),
        icon: isAnalysis ? BarChart3 : Wand2,
        color: isAnalysis ? '#10b981' : '#3b82f6',
        id: item._id,
        report_id: isAnalysis ? item.report_id : null,
        new_resume_id: !isAnalysis ? item.new_resume_id : null
      };
    })
    .sort((a, b) => new Date(b.time) - new Date(a.time))
    .slice(0, showAllActivity ? 5 : 3); // Show 3 or 5 items based on showAllActivity state

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
      setIsLoading(prev => ({ ...prev, [fileType]: true }));
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
    } catch (err) {
      console.error(`Error uploading ${fileType}:`, err);
    } finally {
      setIsLoading(prev => ({ ...prev, [fileType]: false }));
    }
  };

 const handleFileDownload = async (fileType) => {
    const token = localStorage.getItem("access_token");
    console.log(`Downloading from endpoint: for user ID: ${user.id}`);

    try {
        const endpoint = fileType === 'resume' ? `${API_CONFIG.USERDB.DOWNLOADRESUME}` : `${API_CONFIG.USERDB.DOWNLOADJD}`;
        const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}${user.id}`, {
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

  if (!user) {
    return <div>Loading...</div>; // Display loading state
  }

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
              <div 
                style={{
                  width: '40px',
                  height: '40px', 
                  background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer' // Add pointer cursor
                }}
                onClick={() => navigate('/')} // Navigate to home
              >
                <span style={{ color: 'white', fontWeight: 'bold' }}>CV</span>
              </div>
              <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>CVision</span>
            </div>
            
            <nav style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '32px',
              userSelect: 'none' // Disable text selection
            }}>
              <a href="/" style={{ color: '#374151', fontWeight: '500', textDecoration: 'none' }}>Home</a>
              <a href="/mock-interview" style={{ color: '#374151', fontWeight: '500', textDecoration: 'none' }}>Mock Interview</a>
              <a href="/resume-analysis/step1" style={{ color: '#374151', fontWeight: '500', textDecoration: 'none' }}>Resume Analysis</a>
              <a href="/improve-resume/step1" style={{ color: '#374151', fontWeight: '500', textDecoration: 'none' }}>Improve Resume</a>
            </nav>

            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '16px',
              position: 'relative' // Added for dropdown positioning
            }}>
              {user ? (
                <>
                  <div 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px', 
                      padding: '8px 12px', 
                      border: '1px solid #e5e7eb', 
                      borderRadius: '12px', 
                      cursor: 'pointer', 
                      transition: 'background-color 0.2s ease',
                      userSelect: 'none',
                      boxShadow: dropdownVisible ? '0 2px 4px rgba(0, 0, 0, 0.1)' : 'none'
                    }}
                    onClick={() => setDropdownVisible(!dropdownVisible)}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    ref={(el) => {
                      if (el && dropdownVisible) {
                        const dropdown = document.getElementById('dropdown-menu');
                        if (dropdown) {
                          dropdown.style.width = `${el.offsetWidth}px`; // Dynamically set dropdown width
                        }
                      }
                    }}
                  >
                    <span style={{ color: '#374151', fontWeight: '500' }}>
                      Welcome, {user.full_name || 'User'}
                    </span>
                    <ChevronDown size={16} color="#374151" />
                  </div>
                  {dropdownVisible && (
                    <div
                      id="dropdown-menu"
                      style={{
                        position: 'absolute',
                        top: '100%',
                        right: 0,
                        background: 'white',
                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        zIndex: 100,
                        animation: 'fadeIn 0.2s ease-in-out'
                      }}
                    >
                      <button 
                        onClick={() => {
                          navigate('/dashboard');
                          setDropdownVisible(false);
                        }}
                        style={{
                          display: 'block',
                          width: '100%',
                          padding: '10px 16px',
                          textAlign: 'left',
                          background: 'none',
                          border: 'none',
                          color: '#374151',
                          cursor: 'pointer',
                          fontWeight: '500',
                          fontSize: '14px',
                          lineHeight: '1.6',
                          transition: 'background-color 0.2s ease',
                          userSelect: 'none'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        Dashboard
                      </button>
                      <hr style={{ margin: 0, border: 'none', borderTop: '1px solid #e5e7eb' }} />
                      <button 
                        onClick={() => {
                          localStorage.clear();
                          setUser(null);
                          navigate('/signin');
                        }}
                        style={{
                          display: 'block',
                          width: '100%',
                          padding: '10px 16px',
                          textAlign: 'left',
                          background: 'none',
                          border: 'none',
                          color: '#374151',
                          cursor: 'pointer',
                          fontWeight: '500',
                          fontSize: '14px',
                          lineHeight: '1.6',
                          transition: 'background-color 0.2s ease',
                          userSelect: 'none'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        Log Out
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <button 
                    onClick={() => navigate('/signin', { state: { from: '/' } })}
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
                </>
              )}
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
            Welcome to your dashboard,<br />
            {user.full_name} 👋
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
            gridTemplateColumns: viewResume ? '1fr 2fr' : 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px',
            marginBottom: '24px'
          }}>
            <div style={{
              display: 'flex',
              flexDirection: viewResume ? 'column' : 'row',
              gap: '24px'
            }}>
              {/* Resume Upload Section */}
              <div style={{
                background: 'white',
                padding: '24px',
                borderRadius: '16px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                border: '2px dashed #e5e7eb',
                flex: viewResume ? 'none' : '1'
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
                    justifyContent: 'center',
                    animation: isLoading.resume ? 'pulse 1.5s infinite' : 'none'
                  }}>
                    <FileText size={20} style={{ color: 'white' }} />
                  </div>
                  <style>
                    {`
                      @keyframes pulse {
                        0% { opacity: 1; }
                        50% { opacity: 0.5; }
                        100% { opacity: 1; }
                      }
                    `}
                  </style>
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
                      <button
                        onClick={fetchResume}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '8px 16px',
                          background: '#3b82f6',
                          color: 'white',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          border: 'none',
                        }}
                      >
                        View Resume
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
                border: '2px dashed #e5e7eb',
                flex: viewResume ? 'none' : '1'
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
                    justifyContent: 'center',
                    animation: isLoading.jd ? 'pulse 1.5s infinite' : 'none'
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
                      Enter a job description to get targeted resume improvements
                    </p>
                    {editJD && (
                      <textarea
                        rows="4"
                        style={{
                          width: '100%',
                          padding: '12px',
                          borderRadius: '8px',
                          border: '1px solid #e5e7eb',
                          marginBottom: '16px'
                        }}
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                      />
                    )}
                    <button
                      onClick={() => {
                        if (editJD) {
                          handleJDSubmit();
                        } else {
                          setEditJD(true);
                        }
                      }}
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
                      {editJD ? 'Submit JD' : 'Edit JD'}
                    </button>
                  </div>
                ) : (
                  <div>
                    <p style={{
                      color: '#10b981',
                      fontSize: '14px',
                      marginBottom: '16px',
                      margin: '0 0 16px 0'
                    }}>
                      ✓ Job description submitted successfully
                    </p>
                    {editJD ? (
                      <div style={{ marginBottom: '16px' }}>
                        <textarea
                          rows="4"
                          style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: '8px',
                            border: '1px solid #e5e7eb',
                            marginBottom: '16px'
                          }}
                          value={jobDescription}
                          onChange={(e) => setJobDescription(e.target.value)}
                        />
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={handleJDSubmit}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              padding: '8px 16px',
                              background: '#3b82f6',
                              color: 'white',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '14px',
                              border: 'none'
                            }}
                          >
                            Save Changes
                          </button>
                          <button
                            onClick={() => setEditJD(false)}
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
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setEditJD(true)}
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
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Resume Viewer Section */}
            {viewResume && (
              <div
                style={{
                  background: 'white',
                  padding: '24px',
                  borderRadius: '16px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                  gridColumn: '2 / span 1',
                  transition: 'all 0.3s ease-in-out', // Add transition effect
                  transform: viewResume ? 'scale(1)' : 'scale(0.95)', // Scale effect
                  opacity: viewResume ? 1 : 0, // Fade effect
                }}
              >
                <div
                  style={{
                    width: '100%',
                    height: '500px',
                    overflow: 'hidden',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                >
                  <iframe
                    src={`data:${resumeContent.content_type};base64,${resumeContent.file_content}#toolbar=0`}
                    style={{
                      width: '100%',
                      height: '100%',
                      border: '0.5px solid #000',
                      overflow: 'auto',
                    }}
                    title="Resume Viewer"
                  ></iframe>
                </div>
              </div>
            )}
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
                <button 
                  onClick={() => setShowAllActivity(!showAllActivity)}
                  style={{
                    color: '#3b82f6',
                    background: 'none',
                    border: 'none',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  {showAllActivity ? 'Show Less' : 'View All'}
                </button>
              </div>
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '16px',
                maxHeight: showAllActivity ? '400px' : 'auto',
                overflowY: showAllActivity ? 'auto' : 'visible',
                paddingRight: showAllActivity ? '8px' : '0'
              }}>
                {isHistoryLoading ? (
                  <div style={{
                    padding: '20px',
                    textAlign: 'center',
                    color: '#6b7280'
                  }}>
                    Loading activity history...
                  </div>
                ) : recentActivity.length === 0 ? (
                  <div style={{
                    padding: '20px',
                    textAlign: 'center',
                    color: '#6b7280'
                  }}>
                    No activity history yet
                  </div>
                ) : recentActivity.map((activity, index) => (
                  <div 
                    key={index} 
                    onClick={() => {
                      // Nếu là analysis, tải report, nếu là improvement, tải resume
                      const fileId = activity.type === 'analysis' ? activity.report_id : activity.new_resume_id;
                      downloadHistoryFile(fileId, activity);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      padding: '20px',
                      background: '#f8fafc',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      opacity: 1
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = '#f1f5f9';
                      // Show tooltip
                      const tooltip = e.target.querySelector('div[style*="position: absolute"]');
                      if (tooltip) tooltip.style.opacity = '1';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = '#f8fafc';
                      // Hide tooltip
                      const tooltip = e.target.querySelector('div[style*="position: absolute"]');
                      if (tooltip) tooltip.style.opacity = '0';
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
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px',
                        position: 'relative'
                      }}>
                        <h3 style={{ 
                          fontWeight: '600', 
                          color: '#111827',
                          margin: '0 0 4px 0',
                          fontSize: '16px'
                        }}>
                          {activity.title}
                        </h3>
                        <FileDown 
                          size={16} 
                          style={{ 
                            color: '#6b7280',
                            opacity: 0.8
                          }}
                        />
                        {/* Tooltip */}
                        <div style={{
                          position: 'absolute',
                          top: '-30px',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          background: '#374151',
                          color: 'white',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          opacity: 0,
                          transition: 'opacity 0.2s ease',
                          pointerEvents: 'none',
                          whiteSpace: 'nowrap'
                        }}>
                          Click to download {activity.type === 'analysis' ? 'report' : 'resume'}
                        </div>
                      </div>
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
                      {(() => {
                        const now = new Date();
                        const thisMonthActivities = userHistory.analysis_results.concat(userHistory.improvement_results)
                          .filter(item => {
                            const itemDate = new Date(item.created_at);
                            return itemDate.getMonth() === now.getMonth() && 
                                   itemDate.getFullYear() === now.getFullYear();
                          });
                        const highScoreActivities = thisMonthActivities.filter(item => parseInt(item.score) >= 90).length;
                        return `${highScoreActivities} resumes received 90%+ score this month`;
                      })()}
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
                      {(() => {
                        // Kết hợp và sắp xếp tất cả hoạt động theo thời gian
                        const allActivities = userHistory.analysis_results.concat(userHistory.improvement_results)
                          .map(item => new Date(item.created_at).toISOString().split('T')[0]) // Lấy ngày
                          .sort((a, b) => new Date(b) - new Date(a)); // Sắp xếp giảm dần

                        if (allActivities.length === 0) return '0 days of consistent practice';

                        let streakCount = 1;
                        let currentDate = new Date(allActivities[0]);
                        
                        // Tính số ngày liên tiếp
                        for (let i = 1; i < allActivities.length; i++) {
                          const prevDate = new Date(allActivities[i]);
                          const diffDays = Math.floor((currentDate - prevDate) / (1000 * 60 * 60 * 24));
                          
                          if (diffDays === 1) {
                            streakCount++;
                            currentDate = prevDate;
                          } else {
                            break;
                          }
                        }

                        return `${streakCount} days of consistent practice`;
                      })()}
                    </p>
                  </div>
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
