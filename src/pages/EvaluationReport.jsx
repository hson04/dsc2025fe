import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Download, 
  ArrowLeft, 
  CheckCircle, 
  AlertCircle,
  TrendingUp,
  Award,
  MessageSquare,
  Clock,
  BarChart3,
  RefreshCw
} from 'lucide-react'

const EvaluationReport = () => {
  const [selectedQuestion, setSelectedQuestion] = useState(0)
  const navigate = useNavigate()

  const interviewData = {
    title: "Senior Software Engineer Interview",
    date: "January 15, 2024",
    duration: "25 minutes",
    overallScore: 85,
    questions: [
      {
        id: 1,
        question: "Can you tell me about yourself and your professional background?",
        userAnswer: "I'm a software engineer with 5 years of experience in full-stack development. I've worked primarily with React, Node.js, and Python. In my current role at TechCorp, I lead a team of 4 developers and have successfully delivered 3 major projects that improved system performance by 40%. I'm passionate about clean code, mentoring junior developers, and staying updated with the latest technologies.",
        aiFeedback: {
          score: 88,
          strengths: [
            "Clearly outlined years of experience and technical skills",
            "Mentioned leadership experience which shows growth",
            "Quantified achievements with specific metrics",
            "Showed passion for the field and continuous learning"
          ],
          improvements: [
            "Could have mentioned specific projects or technologies relevant to this role",
            "Add more details about the impact of your leadership on the team"
          ],
          suggestion: "Great start! To make this even stronger, try connecting your experience more directly to the specific role you're applying for. Mention 1-2 specific projects that demonstrate skills this company values."
        }
      },
      {
        id: 2,
        question: "Describe a challenging technical problem you faced and how you solved it.",
        userAnswer: "We had a performance issue where our API response times were taking over 5 seconds, causing user complaints. I analyzed the database queries and found several N+1 query problems. I implemented database indexing, query optimization, and introduced Redis caching. This reduced response times to under 500ms, improving user satisfaction by 60%.",
        aiFeedback: {
          score: 92,
          strengths: [
            "Excellent problem-solving structure (problem → analysis → solution → result)",
            "Specific technical details about the solution",
            "Quantified both the problem (5 seconds) and result (500ms)",
            "Showed impact on user satisfaction with metrics"
          ],
          improvements: [
            "Could mention how you collaborated with team members",
            "Discuss any long-term monitoring or prevention measures"
          ],
          suggestion: "Outstanding technical answer! You demonstrated strong analytical skills and provided concrete results. This shows you can handle complex problems effectively."
        }
      },
      {
        id: 3,
        question: "How do you handle working under pressure and tight deadlines?",
        userAnswer: "I prioritize tasks based on impact and urgency, break down complex work into smaller chunks, and communicate regularly with stakeholders about progress. During our last product launch, we had a 2-week deadline. I organized daily standups, delegated tasks efficiently, and we delivered on time with 99.9% uptime.",
        aiFeedback: {
          score: 78,
          strengths: [
            "Good methodology for handling pressure (prioritization, breakdown, communication)",
            "Provided a specific example with clear outcome",
            "Showed leadership and delegation skills"
          ],
          improvements: [
            "Could elaborate more on stress management techniques",
            "Discuss how you maintain quality under pressure",
            "Mention how you support team members during high-pressure situations"
          ],
          suggestion: "Solid answer that shows good project management skills. To strengthen it, add more about how you maintain work quality and team morale during crunch times."
        }
      }
    ]
  }

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 80) return 'text-blue-600'
    if (score >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBackground = (score) => {
    if (score >= 90) return 'bg-green-50 border-green-200'
    if (score >= 80) return 'bg-blue-50 border-blue-200'
    if (score >= 70) return 'bg-yellow-50 border-yellow-200'
    return 'bg-red-50 border-red-200'
  }

  const currentQuestion = interviewData.questions[selectedQuestion]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/mock-interview')}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft size={20} className="mr-2" />
              Back to Mock Interview
            </button>
            
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900">{interviewData.title}</h1>
              <p className="text-gray-600">Interview Report</p>
            </div>
            
            <button className="btn btn-primary">
              <Download size={16} className="mr-2" />
              Download Report
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Overview Section */}
          <div className="grid lg:grid-cols-4 gap-6 mb-8">
            <div className="lg:col-span-1">
              <div className="card shadow-lg border-0 p-6 text-center">
                <div className={`text-4xl font-bold mb-2 ${getScoreColor(interviewData.overallScore)}`}>
                  {interviewData.overallScore}%
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Overall Score</h3>
                <p className="text-sm text-gray-600">
                  {interviewData.overallScore >= 90 ? 'Excellent Performance' :
                   interviewData.overallScore >= 80 ? 'Strong Performance' :
                   interviewData.overallScore >= 70 ? 'Good Performance' : 'Needs Improvement'}
                </p>
              </div>
            </div>

            <div className="lg:col-span-3">
              <div className="card shadow-lg border-0 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Interview Summary</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <Clock size={20} className="text-blue-500 mx-auto mb-2" />
                    <div className="font-semibold text-gray-900">{interviewData.duration}</div>
                    <div className="text-sm text-gray-600">Duration</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <MessageSquare size={20} className="text-green-500 mx-auto mb-2" />
                    <div className="font-semibold text-gray-900">{interviewData.questions.length}</div>
                    <div className="text-sm text-gray-600">Questions</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <TrendingUp size={20} className="text-purple-500 mx-auto mb-2" />
                    <div className="font-semibold text-gray-900">High</div>
                    <div className="text-sm text-gray-600">Confidence</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <Award size={20} className="text-orange-500 mx-auto mb-2" />
                    <div className="font-semibold text-gray-900">B+</div>
                    <div className="text-sm text-gray-600">Grade</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Question Navigation */}
          <div className="card shadow-lg border-0 p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Interview Questions</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {interviewData.questions.map((q, index) => (
                <button
                  key={q.id}
                  onClick={() => setSelectedQuestion(index)}
                  className={`p-4 rounded-xl border-2 text-left transition-all duration-300 ${
                    selectedQuestion === index
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-900">Question {index + 1}</span>
                    <span className={`text-lg font-bold ${getScoreColor(q.aiFeedback.score)}`}>
                      {q.aiFeedback.score}%
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {q.question}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Detailed Question Analysis */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Question & Answer */}
            <div className="lg:col-span-2 space-y-6">
              {/* Question */}
              <div className="card shadow-lg border-0 p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <MessageSquare size={16} className="text-blue-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Question {selectedQuestion + 1}
                  </h3>
                </div>
                <p className="text-gray-800 text-lg leading-relaxed font-medium">
                  {currentQuestion.question}
                </p>
              </div>

              {/* Your Answer */}
              <div className="card shadow-lg border-0 p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                    <User size={16} className="text-gray-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Your Answer</h3>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <p className="text-gray-800 leading-relaxed">
                    {currentQuestion.userAnswer}
                  </p>
                </div>
              </div>

              {/* AI Feedback */}
              <div className={`card shadow-lg border-2 p-6 ${getScoreBackground(currentQuestion.aiFeedback.score)}`}>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      currentQuestion.aiFeedback.score >= 80 ? 'bg-green-500' : 'bg-blue-500'
                    }`}>
                      <BarChart3 size={20} className="text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">AI Feedback</h3>
                  </div>
                  <div className={`text-3xl font-bold ${getScoreColor(currentQuestion.aiFeedback.score)}`}>
                    {currentQuestion.aiFeedback.score}%
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Suggestion */}
                  <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-200">
                    <h4 className="font-bold text-gray-900 mb-2 flex items-center">
                      <CheckCircle size={18} className="text-blue-500 mr-2" />
                      Overall Assessment
                    </h4>
                    <p className="text-gray-700 leading-relaxed">
                      {currentQuestion.aiFeedback.suggestion}
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Strengths */}
                    <div>
                      <h4 className="font-bold text-green-800 mb-3 flex items-center">
                        <CheckCircle size={18} className="text-green-600 mr-2" />
                        What You Did Well
                      </h4>
                      <ul className="space-y-2">
                        {currentQuestion.aiFeedback.strengths.map((strength, index) => (
                          <li key={index} className="flex items-start">
                            <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                            <span className="text-gray-700 text-sm">{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Improvements */}
                    <div>
                      <h4 className="font-bold text-orange-800 mb-3 flex items-center">
                        <AlertCircle size={18} className="text-orange-600 mr-2" />
                        Areas to Improve
                      </h4>
                      <ul className="space-y-2">
                        {currentQuestion.aiFeedback.improvements.map((improvement, index) => (
                          <li key={index} className="flex items-start">
                            <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                            <span className="text-gray-700 text-sm">{improvement}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Question List */}
              <div className="card shadow-lg border-0 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">All Questions</h3>
                <div className="space-y-3">
                  {interviewData.questions.map((q, index) => (
                    <button
                      key={q.id}
                      onClick={() => setSelectedQuestion(index)}
                      className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                        selectedQuestion === index
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-gray-900">Q{index + 1}</span>
                        <span className={`text-sm font-bold ${getScoreColor(q.aiFeedback.score)}`}>
                          {q.aiFeedback.score}%
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {q.question}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Overall Performance */}
              <div className="card shadow-lg border-0 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Performance Breakdown</h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Communication</span>
                    <span className="font-semibold text-green-600">Excellent</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full w-5/6"></div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Technical Knowledge</span>
                    <span className="font-semibold text-blue-600">Very Good</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full w-4/5"></div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Problem Solving</span>
                    <span className="font-semibold text-green-600">Excellent</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full w-11/12"></div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Leadership</span>
                    <span className="font-semibold text-yellow-600">Good</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-yellow-500 h-2 rounded-full w-3/4"></div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button 
                  onClick={() => navigate('/mock-interview')}
                  className="w-full btn btn-primary"
                >
                  <RefreshCw size={16} className="mr-2" />
                  Practice Again
                </button>
                
                <button 
                  onClick={() => navigate('/improve-resume/step1')}
                  className="w-full btn btn-outline"
                >
                  Improve Resume
                </button>
                
                <button className="w-full btn btn-outline">
                  <Download size={16} className="mr-2" />
                  Save PDF Report
                </button>
              </div>
            </div>
          </div>

          {/* Key Insights */}
          <div className="card shadow-lg border-0 p-8 mt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              🎯 Key Insights & Next Steps
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="p-6 bg-green-50 rounded-xl border border-green-200">
                <h3 className="font-bold text-green-800 mb-4 text-xl">🌟 Your Strengths</h3>
                <ul className="space-y-2">
                  <li className="flex items-center text-green-700">
                    <CheckCircle size={16} className="mr-2" />
                    Strong technical communication
                  </li>
                  <li className="flex items-center text-green-700">
                    <CheckCircle size={16} className="mr-2" />
                    Excellent problem-solving approach
                  </li>
                  <li className="flex items-center text-green-700">
                    <CheckCircle size={16} className="mr-2" />
                    Good use of specific examples and metrics
                  </li>
                </ul>
              </div>

              <div className="p-6 bg-blue-50 rounded-xl border border-blue-200">
                <h3 className="font-bold text-blue-800 mb-4 text-xl">🚀 Growth Areas</h3>
                <ul className="space-y-2">
                  <li className="flex items-center text-blue-700">
                    <TrendingUp size={16} className="mr-2" />
                    Elaborate more on team collaboration
                  </li>
                  <li className="flex items-center text-blue-700">
                    <TrendingUp size={16} className="mr-2" />
                    Connect experiences to company values
                  </li>
                  <li className="flex items-center text-blue-700">
                    <TrendingUp size={16} className="mr-2" />
                    Add more leadership examples
                  </li>
                </ul>
              </div>
            </div>

            <div className="text-center mt-8 p-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl text-white">
              <h3 className="text-xl font-bold mb-3">🎉 Great Job!</h3>
              <p className="text-blue-100 leading-relaxed">
                You scored {interviewData.overallScore}% overall. With a few improvements in leadership storytelling 
                and company-specific examples, you'll be ready to ace any interview!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EvaluationReport
