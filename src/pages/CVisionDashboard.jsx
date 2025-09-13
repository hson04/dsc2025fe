import { useState } from 'react'
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
  Download
} from 'lucide-react'

const CVisionDashboard = () => {
  const navigate = useNavigate()
  const [userName] = useState('John Doe') // This would come from auth context

  const stats = [
    {
      title: 'Resumes Enhanced',
      value: '3',
      icon: FileText,
      color: 'from-blue-500 to-indigo-600',
      change: '+1 this week'
    },
    {
      title: 'Mock Interviews',
      value: '7',
      icon: MessageSquare,
      color: 'from-purple-500 to-pink-600',
      change: '+2 this week'
    },
    {
      title: 'Avg. Score',
      value: '85%',
      icon: TrendingUp,
      color: 'from-green-500 to-emerald-600',
      change: '+12% improvement'
    },
    {
      title: 'Interview Success',
      value: '92%',
      icon: Award,
      color: 'from-orange-500 to-red-600',
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
      color: 'text-blue-600 bg-blue-100'
    },
    {
      type: 'interview',
      title: 'Mock Interview - Product Manager',
      time: '1 day ago', 
      score: 88,
      icon: MessageSquare,
      color: 'text-purple-600 bg-purple-100'
    },
    {
      type: 'analysis',
      title: 'Resume Analysis - Data Scientist',
      time: '2 days ago',
      score: 76,
      icon: BarChart3,
      color: 'text-green-600 bg-green-100'
    }
  ]

  const quickActions = [
    {
      title: 'Start Mock Interview',
      description: 'Practice with AI interviewer',
      icon: MessageSquare,
      action: () => navigate('/mock-interview'),
      color: 'from-purple-500 to-pink-600'
    },
    {
      title: 'Enhance Resume', 
      description: 'Improve your resume with AI',
      icon: Wand2,
      action: () => navigate('/improve-resume/step1'),
      color: 'from-blue-500 to-indigo-600'
    },
    {
      title: 'Analyze Resume',
      description: 'Get detailed feedback',
      icon: BarChart3,
      action: () => navigate('/resume-analysis/step1'),
      color: 'from-green-500 to-emerald-600'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold">CV</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">CVision</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <User size={20} className="text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{userName}</p>
                  <p className="text-sm text-gray-600">Premium Member</p>
                </div>
              </div>
              
              <button 
                onClick={() => navigate('/signin')}
                className="text-gray-600 hover:text-gray-900"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {userName}! 👋
            </h1>
            <p className="text-gray-600 text-lg">
              Ready to boost your career today? Let's see your progress and continue improving.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <div key={index} className="card shadow-lg border-0 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center`}>
                    <stat.icon size={24} className="text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">
                  {stat.value}
                </h3>
                <p className="text-gray-600 font-medium">{stat.title}</p>
                <p className="text-sm text-green-600 font-medium mt-2">{stat.change}</p>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Quick Actions */}
              <div className="card shadow-lg border-0 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">🚀 Quick Actions</h2>
                
                <div className="grid md:grid-cols-3 gap-4">
                  {quickActions.map((action, index) => (
                    <button
                      key={index}
                      onClick={action.action}
                      className="group p-6 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 text-left"
                    >
                      <div className={`w-12 h-12 bg-gradient-to-r ${action.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                        <action.icon size={24} className="text-white" />
                      </div>
                      <h3 className="font-bold text-gray-900 mb-2 group-hover:text-blue-600">
                        {action.title}
                      </h3>
                      <p className="text-gray-600 text-sm">{action.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="card shadow-lg border-0 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">📈 Recent Activity</h2>
                  <button className="text-blue-600 hover:text-blue-700 font-medium">
                    View All
                  </button>
                </div>
                
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${activity.color}`}>
                        <activity.icon size={20} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {activity.title}
                        </h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <Clock size={14} className="text-gray-400" />
                          <span className="text-sm text-gray-500">{activity.time}</span>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900">{activity.score}%</div>
                        <div className="text-sm text-gray-500">Score</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Progress Card */}
              <div className="card shadow-lg border-0 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">🎯 Your Progress</h3>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Profile Completion</span>
                      <span className="font-semibold">85%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full w-4/5"></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Interview Skills</span>
                      <span className="font-semibold">92%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div className="bg-gradient-to-r from-green-500 to-emerald-600 h-3 rounded-full w-11/12"></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Resume Quality</span>
                      <span className="font-semibold">88%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div className="bg-gradient-to-r from-purple-500 to-pink-600 h-3 rounded-full w-4/5"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Achievements */}
              <div className="card shadow-lg border-0 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">🏆 Recent Achievements</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <Award size={16} className="text-yellow-600" />
                    <div>
                      <h4 className="font-semibold text-yellow-800 text-sm">Interview Master</h4>
                      <p className="text-yellow-700 text-xs">Scored 90+ in 3 mock interviews</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <FileText size={16} className="text-blue-600" />
                    <div>
                      <h4 className="font-semibold text-blue-800 text-sm">Resume Pro</h4>
                      <p className="text-blue-700 text-xs">Enhanced 5 resumes this month</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
                    <TrendingUp size={16} className="text-green-600" />
                    <div>
                      <h4 className="font-semibold text-green-800 text-sm">Improvement Streak</h4>
                      <p className="text-green-700 text-xs">7 days of consistent practice</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              <div className="card shadow-lg border-0 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">💡 Recommendations</h3>
                
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <h4 className="font-semibold text-blue-900 mb-2">Practice Technical Questions</h4>
                    <p className="text-blue-800 text-sm mb-3">
                      Your last mock interview showed room for improvement in technical areas.
                    </p>
                    <button 
                      onClick={() => navigate('/mock-interview')}
                      className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                    >
                      Start Practice →
                    </button>
                  </div>
                  
                  <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                    <h4 className="font-semibold text-purple-900 mb-2">Update Your Resume</h4>
                    <p className="text-purple-800 text-sm mb-3">
                      Add your recent AWS certification to boost your profile.
                    </p>
                    <button 
                      onClick={() => navigate('/improve-resume/step1')}
                      className="text-purple-600 hover:text-purple-700 font-medium text-sm"
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
    </div>
  )
}

export default CVisionDashboard
